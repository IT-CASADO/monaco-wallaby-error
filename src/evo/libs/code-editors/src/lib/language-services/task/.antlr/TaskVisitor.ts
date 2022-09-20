// Generated from ./libs/code-editors/src/lib/language-services/task/Task.g4 by ANTLR 4.9.0-SNAPSHOT

import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor';

import { TaskExpressionsContext } from './TaskParser';
import { AddExpressionContext } from './TaskParser';
import { CompleteExpressionContext } from './TaskParser';

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `TaskParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface TaskVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `TaskParser.taskExpressions`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTaskExpressions?: (ctx: TaskExpressionsContext) => Result;

	/**
	 * Visit a parse tree produced by `TaskParser.addExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitAddExpression?: (ctx: AddExpressionContext) => Result;

	/**
	 * Visit a parse tree produced by `TaskParser.completeExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCompleteExpression?: (ctx: CompleteExpressionContext) => Result;
}
