import { CharStreams, CommonTokenStream } from 'antlr4ts';
import * as lsTypes from 'vscode-languageserver-types';

import { TaskLexer } from './.antlr/TaskLexer';
import { TaskExpressionsContext, TaskParser } from './.antlr/TaskParser';
import TaskErrorListener from './task-error-listener';

export function parse(code: string): {
	ast: TaskExpressionsContext;
	errors: lsTypes.Diagnostic[];
} {
	const inputStream = CharStreams.fromString(code);
	const lexer = new TaskLexer(inputStream);
	lexer.removeErrorListeners();
	const taskLangErrorsListner = new TaskErrorListener();
	lexer.addErrorListener(taskLangErrorsListner);
	const tokenStream = new CommonTokenStream(lexer);
	const parser = new TaskParser(tokenStream);
	parser.removeErrorListeners();
	parser.addErrorListener(taskLangErrorsListner);
	const ast = parser.taskExpressions();
	const errors: lsTypes.Diagnostic[] = taskLangErrorsListner.getErrors();
	return { ast, errors };
}
export function parseAndGetASTRoot(code: string): TaskExpressionsContext {
	const { ast } = parse(code);
	return ast;
}
export function parseAndGetSyntaxErrors(code: string): lsTypes.Diagnostic[] {
	const { errors } = parse(code);
	return errors;
}
