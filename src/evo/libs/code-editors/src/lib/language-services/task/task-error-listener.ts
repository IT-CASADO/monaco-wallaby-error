import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';
import * as lsTypes from 'vscode-languageserver-types';

export default class TaskErrorListener implements ANTLRErrorListener<unknown> {
	private errors: lsTypes.Diagnostic[] = [];
	public syntaxError(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		_recognizer: Recognizer<unknown, any>,
		_offendingSymbol: unknown,
		line: number,
		charPositionInLine: number,
		message: string,
		_e: RecognitionException | undefined,
	): void {
		this.errors.push({
			range: lsTypes.Range.create(line - 1, charPositionInLine, line - 1, charPositionInLine),
			message,
			code: '1', // This the error code you can customize them as you want
		});
	}

	public getErrors(): lsTypes.Diagnostic[] {
		return this.errors;
	}
}
