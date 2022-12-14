// /*---------------------------------------------------------------------------------------------
//  *  Copyright (c) Microsoft Corporation. All rights reserved.
//  *  Licensed under the MIT License. See License.txt in the project root for license information.
//  *--------------------------------------------------------------------------------------------*/
import {
	CancellationToken,
	editor,
	IDisposable,
	IEvent,
	IRange,
	languages,
	MarkerSeverity,
	Position,
	Range,
	Uri,
} from 'monaco-editor';
import { Subject } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as lsTypes from 'vscode-languageserver-types';

export interface IWorkerAccessor<T> {
	(...more: Uri[]): Promise<T>;
}

//#region DiagnosticsAdapter
export interface ILanguageWorkerWithDiagnostics {
	doValidation(uri: string): Promise<lsTypes.Diagnostic[]>;
}

export class DiagnosticsAdapter<T extends ILanguageWorkerWithDiagnostics> {
	private onDidChangeContent = new Subject<void>();
	private onDidChangeContent$ = this.onDidChangeContent.asObservable();

	protected readonly _disposables: IDisposable[] = [];
	private readonly subs = new SubSink();
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	private readonly _listener: { [uri: string]: IDisposable } = Object.create(null);

	constructor(
		private readonly _languageId: string,
		protected readonly _worker: IWorkerAccessor<T>,
		configChangeEvent: IEvent<unknown>,
	) {
		const onModelAdd = (model: editor.IModel): void => {
			const modeId = model.getLanguageId();

			if (modeId !== this._languageId) {
				return;
			}

			this.subs.add(
				this.onDidChangeContent$
					.pipe(
						debounceTime(500),
						tap(() => {
							this._doValidate(model.uri, modeId);
						}),
					)
					.subscribe(),
			);

			this._listener[model.uri.toString()] = model.onDidChangeContent(() => {
				this.onDidChangeContent.next();
			});

			this.onDidChangeContent.next();
		};

		const onModelRemoved = (model: editor.IModel): void => {
			editor.setModelMarkers(model, this._languageId, []);

			const uriStr = model.uri.toString();
			const listener = this._listener[uriStr];
			if (listener) {
				listener.dispose();
				delete this._listener[uriStr];
			}
		};

		this._disposables.push(editor.onDidCreateModel(onModelAdd));
		this._disposables.push(editor.onWillDisposeModel(onModelRemoved));
		this._disposables.push(
			editor.onDidChangeModelLanguage(event => {
				onModelRemoved(event.model);
				onModelAdd(event.model);
			}),
		);

		this._disposables.push(
			configChangeEvent(_ => {
				editor.getModels().forEach(model => {
					if (model.getLanguageId() === this._languageId) {
						onModelRemoved(model);
						onModelAdd(model);
					}
				});
			}),
		);

		this._disposables.push({
			dispose: () => {
				editor.getModels().forEach(onModelRemoved);
				for (const key in this._listener) {
					this._listener[key].dispose();
				}
			},
		});

		editor.getModels().forEach(onModelAdd);
	}

	public dispose(): void {
		this._disposables.forEach(d => d && d.dispose());
		this._disposables.length = 0;

		this.subs.unsubscribe();
	}

	private _doValidate(resource: Uri, languageId: string): void {
		this._worker(resource)
			.then(worker => {
				return worker.doValidation(resource.toString());
			})
			.then(diagnostics => {
				const markers = diagnostics.map(d => toDiagnostics(resource, d));
				const model = editor.getModel(resource);
				if (model && model.getLanguageId() === languageId) {
					editor.setModelMarkers(model, languageId, markers);
				}
			})
			.then(undefined, err => {
				console.error(err);
			});
	}
}

function toSeverity(lsSeverity: number | undefined): MarkerSeverity {
	switch (lsSeverity) {
		case lsTypes.DiagnosticSeverity.Error:
			return MarkerSeverity.Error;
		case lsTypes.DiagnosticSeverity.Warning:
			return MarkerSeverity.Warning;
		case lsTypes.DiagnosticSeverity.Information:
			return MarkerSeverity.Info;
		case lsTypes.DiagnosticSeverity.Hint:
			return MarkerSeverity.Hint;
		default:
			return MarkerSeverity.Info;
	}
}

function toDiagnostics(resource: Uri, diag: lsTypes.Diagnostic): editor.IMarkerData {
	const code = typeof diag.code === 'number' ? String(diag.code) : <string>diag.code;

	return {
		severity: toSeverity(diag.severity),
		startLineNumber: diag.range.start.line + 1,
		startColumn: diag.range.start.character + 1,
		endLineNumber: diag.range.end.line + 1,
		endColumn: diag.range.end.character + 1,
		message: diag.message,
		code: code,
		source: diag.source,
	};
}

//#endregion

//#region CompletionAdapter
export interface ILanguageWorkerWithCompletions {
	doComplete(
		uri: string,
		position: lsTypes.Position,
		completionContext: languages.CompletionContext,
		token: CancellationToken,
	): Promise<lsTypes.CompletionList | null>;
}

export class CompletionAdapter<T extends ILanguageWorkerWithCompletions> implements languages.CompletionItemProvider {
	constructor(private readonly _worker: IWorkerAccessor<T>, private readonly _triggerCharacters: string[]) {}

	public get triggerCharacters(): string[] {
		return this._triggerCharacters;
	}

	public provideCompletionItems(
		model: editor.IReadOnlyModel,
		position: Position,
		context: languages.CompletionContext,
		token: CancellationToken,
	): Promise<languages.CompletionList | undefined> {
		const resource = model.uri;

		return this._worker(resource)
			.then(worker => {
				return worker.doComplete(resource.toString(), fromPosition(position), context, token);
			})
			.then(info => {
				if (!info) {
					return;
				}
				const wordInfo = model.getWordUntilPosition(position);
				const wordRange = new Range(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn);

				const items: languages.CompletionItem[] = info.items.map(entry => {
					const item: languages.CompletionItem = {
						label: entry.label,
						insertText: entry.insertText || entry.label,
						sortText: entry.sortText,
						filterText: entry.filterText,
						documentation: entry.documentation,
						detail: entry.detail,
						command: toCommand(entry.command),
						range: wordRange,
						kind: toCompletionItemKind(entry.kind),
					};
					if (entry.textEdit) {
						if (isInsertReplaceEdit(entry.textEdit)) {
							item.range = {
								insert: toRange(entry.textEdit.insert),
								replace: toRange(entry.textEdit.replace),
							};
						} else {
							item.range = toRange(entry.textEdit.range);
						}
						item.insertText = entry.textEdit.newText;
					}
					if (entry.additionalTextEdits) {
						item.additionalTextEdits = entry.additionalTextEdits.map<languages.TextEdit>(toTextEdit);
					}
					if (entry.insertTextFormat === lsTypes.InsertTextFormat.Snippet) {
						item.insertTextRules = languages.CompletionItemInsertTextRule.InsertAsSnippet;
					}
					return item;
				});

				return {
					isIncomplete: info.isIncomplete,
					suggestions: items,
				};
			});
	}
}

export function fromPosition(position: Position): lsTypes.Position;
export function fromPosition(position: undefined): undefined;
export function fromPosition(position: Position | undefined): lsTypes.Position | undefined;
export function fromPosition(position: Position | undefined): lsTypes.Position | undefined {
	if (!position) {
		return void 0;
	}
	return { character: position.column - 1, line: position.lineNumber - 1 };
}

export function fromRange(range: IRange): lsTypes.Range;
export function fromRange(range: undefined): undefined;
export function fromRange(range: IRange | undefined): lsTypes.Range | undefined;
export function fromRange(range: IRange | undefined): lsTypes.Range | undefined {
	if (!range) {
		return void 0;
	}
	return {
		start: {
			line: range.startLineNumber - 1,
			character: range.startColumn - 1,
		},
		end: { line: range.endLineNumber - 1, character: range.endColumn - 1 },
	};
}
export function toRange(range: lsTypes.Range): Range;
export function toRange(range: undefined): undefined;
export function toRange(range: lsTypes.Range | undefined): Range | undefined;
export function toRange(range: lsTypes.Range | undefined): Range | undefined {
	if (!range) {
		return void 0;
	}
	return new Range(range.start.line + 1, range.start.character + 1, range.end.line + 1, range.end.character + 1);
}

function isInsertReplaceEdit(edit: lsTypes.TextEdit | lsTypes.InsertReplaceEdit): edit is lsTypes.InsertReplaceEdit {
	return (
		typeof (<lsTypes.InsertReplaceEdit>edit).insert !== 'undefined' &&
		typeof (<lsTypes.InsertReplaceEdit>edit).replace !== 'undefined'
	);
}

function toCompletionItemKind(kind: number | undefined): languages.CompletionItemKind {
	const mItemKind = languages.CompletionItemKind;

	switch (kind) {
		case lsTypes.CompletionItemKind.Text:
			return mItemKind.Text;
		case lsTypes.CompletionItemKind.Method:
			return mItemKind.Method;
		case lsTypes.CompletionItemKind.Function:
			return mItemKind.Function;
		case lsTypes.CompletionItemKind.Constructor:
			return mItemKind.Constructor;
		case lsTypes.CompletionItemKind.Field:
			return mItemKind.Field;
		case lsTypes.CompletionItemKind.Variable:
			return mItemKind.Variable;
		case lsTypes.CompletionItemKind.Class:
			return mItemKind.Class;
		case lsTypes.CompletionItemKind.Interface:
			return mItemKind.Interface;
		case lsTypes.CompletionItemKind.Module:
			return mItemKind.Module;
		case lsTypes.CompletionItemKind.Property:
			return mItemKind.Property;
		case lsTypes.CompletionItemKind.Unit:
			return mItemKind.Unit;
		case lsTypes.CompletionItemKind.Value:
			return mItemKind.Value;
		case lsTypes.CompletionItemKind.Enum:
			return mItemKind.Enum;
		case lsTypes.CompletionItemKind.Keyword:
			return mItemKind.Keyword;
		case lsTypes.CompletionItemKind.Snippet:
			return mItemKind.Snippet;
		case lsTypes.CompletionItemKind.Color:
			return mItemKind.Color;
		case lsTypes.CompletionItemKind.File:
			return mItemKind.File;
		case lsTypes.CompletionItemKind.Reference:
			return mItemKind.Reference;
	}
	return mItemKind.Property;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fromCompletionItemKind(kind: languages.CompletionItemKind): lsTypes.CompletionItemKind {
	const mItemKind = languages.CompletionItemKind;

	switch (kind) {
		case mItemKind.Text:
			return lsTypes.CompletionItemKind.Text;
		case mItemKind.Method:
			return lsTypes.CompletionItemKind.Method;
		case mItemKind.Function:
			return lsTypes.CompletionItemKind.Function;
		case mItemKind.Constructor:
			return lsTypes.CompletionItemKind.Constructor;
		case mItemKind.Field:
			return lsTypes.CompletionItemKind.Field;
		case mItemKind.Variable:
			return lsTypes.CompletionItemKind.Variable;
		case mItemKind.Class:
			return lsTypes.CompletionItemKind.Class;
		case mItemKind.Interface:
			return lsTypes.CompletionItemKind.Interface;
		case mItemKind.Module:
			return lsTypes.CompletionItemKind.Module;
		case mItemKind.Property:
			return lsTypes.CompletionItemKind.Property;
		case mItemKind.Unit:
			return lsTypes.CompletionItemKind.Unit;
		case mItemKind.Value:
			return lsTypes.CompletionItemKind.Value;
		case mItemKind.Enum:
			return lsTypes.CompletionItemKind.Enum;
		case mItemKind.Keyword:
			return lsTypes.CompletionItemKind.Keyword;
		case mItemKind.Snippet:
			return lsTypes.CompletionItemKind.Snippet;
		case mItemKind.Color:
			return lsTypes.CompletionItemKind.Color;
		case mItemKind.File:
			return lsTypes.CompletionItemKind.File;
		case mItemKind.Reference:
			return lsTypes.CompletionItemKind.Reference;
	}
	return lsTypes.CompletionItemKind.Property;
}

export function toTextEdit(textEdit: lsTypes.TextEdit): languages.TextEdit;
export function toTextEdit(textEdit: undefined): undefined;
export function toTextEdit(textEdit: lsTypes.TextEdit | undefined): languages.TextEdit | undefined;
export function toTextEdit(textEdit: lsTypes.TextEdit | undefined): languages.TextEdit | undefined {
	if (!textEdit) {
		return void 0;
	}
	return {
		range: toRange(textEdit.range),
		text: textEdit.newText,
	};
}

function toCommand(c: lsTypes.Command | undefined): languages.Command | undefined {
	return c && c.command === 'editor.action.triggerSuggest'
		? { id: c.command, title: c.title, arguments: c.arguments }
		: undefined;
}
//#endregion
