import { CancellationToken, languages, worker } from 'monaco-editor';
import * as lsTypes from 'vscode-languageserver-types';

import TaskLanguageService from '../../../language-services/task/task-language-service';
import { ILanguageWorkerWithCompletions, ILanguageWorkerWithDiagnostics } from '../common/lsp-language-features';

import IWorkerContext = worker.IWorkerContext;

export class TaskWorker implements ILanguageWorkerWithDiagnostics, ILanguageWorkerWithCompletions {
	private _ctx: IWorkerContext;
	private languageService: TaskLanguageService;
	constructor(ctx: IWorkerContext) {
		this._ctx = ctx;
		this.languageService = new TaskLanguageService();
	}
	public doComplete(
		_uri: string,
		_position: lsTypes.Position,
		completionContext: languages.CompletionContext,
		_token: CancellationToken,
	): Promise<lsTypes.CompletionList | null> {
		if (completionContext.triggerCharacter === ' ') {
			return Promise.resolve({
				isIncomplete: false,
				items: [
					{
						label: 'HALLO!',
					},
				],
			});
		}

		return Promise.resolve(null);
	}

	public doValidation(): Promise<lsTypes.Diagnostic[]> {
		const code = this.getTextDocument();
		return Promise.resolve(this.languageService.validate(code));
	}

	private getTextDocument(): string {
		const model = this._ctx.getMirrorModels()[0]; // When there are multiple files open, this will be an array
		return model.getValue();
	}
}
