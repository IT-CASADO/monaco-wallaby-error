/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as monaco from 'monaco-editor';

import * as languageFeatures from '../common/lsp-language-features';
import { ILanguageServiceDefaults } from './monaco.contribution';
import type { TaskWorker } from './task-worker';
import { WorkerManager } from './worker-manager';

export const taskMonarchLanguage = <monaco.languages.IMonarchLanguage>{
	// Set defaultToken to invalid to see what you do not tokenize yet
	defaultToken: 'invalid',
	keywords: ['COMPLETE', 'ADD', 'REMOVE'],
	typeKeywords: ['TASK'],
	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	// The main tokenizer for our languages
	tokenizer: {
		root: [
			// identifiers and keywords
			[
				/[a-zA-Z_$][\w$]*/,
				{
					cases: {
						'@keywords': { token: 'keyword' },
						'@typeKeywords': { token: 'type' },
						'@default': 'identifier',
					},
				},
			],
			// whitespace
			{ include: '@whitespace' },
			// strings
			[/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
			[/"/, 'string', '@string'],
		],
		whitespace: [[/[ \t\r\n]+/, '']],
		string: [
			[/[^\\"]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, 'string', '@pop'],
		],
	},
};

export const taskLanguageConfiguration: monaco.languages.LanguageConfiguration = {
	// If we want to support code folding, brackets ... ( [], (), {}....), we can override some properties here
	// check the doc
};

class TaskCompletionAdapter extends languageFeatures.CompletionAdapter<TaskWorker> {
	constructor(worker: languageFeatures.IWorkerAccessor<TaskWorker>) {
		super(worker, [' ']);
	}
}

export function setupMode(defaults: ILanguageServiceDefaults): monaco.IDisposable {
	const disposables: monaco.IDisposable[] = [];
	const providers: monaco.IDisposable[] = [];

	const client = new WorkerManager(defaults);
	disposables.push(client);

	const worker: languageFeatures.IWorkerAccessor<TaskWorker> = (...uris: monaco.Uri[]): Promise<TaskWorker> => {
		return client.getLanguageServiceWorker(...uris);
	};

	function registerProviders(): void {
		const { languageId, modeConfiguration } = defaults;

		disposeAll(providers);

		monaco.languages.setMonarchTokensProvider(languageId, taskMonarchLanguage);
		monaco.languages.setLanguageConfiguration(languageId, taskLanguageConfiguration);

		if (modeConfiguration.diagnostics) {
			providers.push(new languageFeatures.DiagnosticsAdapter(languageId, worker, defaults.onDidChange));
		}

		if (modeConfiguration.completionItems) {
			providers.push(monaco.languages.registerCompletionItemProvider(languageId, new TaskCompletionAdapter(worker)));
		}

		/*
		if (modeConfiguration.hovers) {
		  providers.push(
		    monaco.languages.registerHoverProvider(
		      languageId,
		      new languageFeatures.HoverAdapter(worker),
		    ),
		  );
		}
		if (modeConfiguration.documentHighlights) {
		  providers.push(
		    monaco.languages.registerDocumentHighlightProvider(
		      languageId,
		      new languageFeatures.DocumentHighlightAdapter(worker),
		    ),
		  );
		}
		if (modeConfiguration.definitions) {
		  providers.push(
		    monaco.languages.registerDefinitionProvider(
		      languageId,
		      new languageFeatures.DefinitionAdapter(worker),
		    ),
		  );
		}
		if (modeConfiguration.references) {
		  providers.push(
		    monaco.languages.registerReferenceProvider(
		      languageId,
		      new languageFeatures.ReferenceAdapter(worker),
		    ),
		  );
		}
		if (modeConfiguration.documentSymbols) {
		  providers.push(
		    monaco.languages.registerDocumentSymbolProvider(
		      languageId,
		      new languageFeatures.DocumentSymbolAdapter(worker),
		    ),
		  );
		}
		if (modeConfiguration.rename) {
		  providers.push(
		    monaco.languages.registerRenameProvider(
		      languageId,
		      new languageFeatures.RenameAdapter(worker),
		    ),
		  );
		}
		if (modeConfiguration.colors) {
		  providers.push(
		    monaco.languages.registerColorProvider(
		      languageId,
		      new languageFeatures.DocumentColorAdapter(worker),
		    ),
		  );
		}
		if (modeConfiguration.foldingRanges) {
		  providers.push(
		    monaco.languages.registerFoldingRangeProvider(
		      languageId,
		      new languageFeatures.FoldingRangeAdapter(worker),
		    ),
		  );
		}
		if (modeConfiguration.selectionRanges) {
		  providers.push(
		    monaco.languages.registerSelectionRangeProvider(
		      languageId,
		      new languageFeatures.SelectionRangeAdapter(worker),
		    ),
		  );
		}
		if (modeConfiguration.documentFormattingEdits) {
		  providers.push(
		    monaco.languages.registerDocumentFormattingEditProvider(
		      languageId,
		      new languageFeatures.DocumentFormattingEditProvider(worker),
		    ),
		  );
		}
		if (modeConfiguration.documentRangeFormattingEdits) {
		  providers.push(
		    monaco.languages.registerDocumentRangeFormattingEditProvider(
		      languageId,
		      new languageFeatures.DocumentRangeFormattingEditProvider(worker),
		    ),
		  );
		}
		*/
	}

	registerProviders();

	disposables.push(asDisposable(providers));

	return asDisposable(disposables);
}

function asDisposable(disposables: monaco.IDisposable[]): monaco.IDisposable {
	return { dispose: () => disposeAll(disposables) };
}

function disposeAll(disposables: monaco.IDisposable[]): void {
	while (disposables.length) {
		disposables.pop()?.dispose();
	}
}

export { WorkerManager } from './worker-manager';
