// Generated from ./libs/code-editors/src/lib/language-services/task/Task.g4 by ANTLR 4.9.0-SNAPSHOT

import { ParseTreeListener } from 'antlr4ts/tree/ParseTreeListener';

import { TaskExpressionsContext } from './TaskParser';
import { AddExpressionContext } from './TaskParser';
import { CompleteExpressionContext } from './TaskParser';

/**
 * This interface defines a complete listener for a parse tree produced by
 * `TaskParser`.
 */
export interface TaskListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `TaskParser.taskExpressions`.
	 * @param ctx the parse tree
	 */
	enterTaskExpressions?: (ctx: TaskExpressionsContext) => void;
	/**
	 * Exit a parse tree produced by `TaskParser.taskExpressions`.
	 * @param ctx the parse tree
	 */
	exitTaskExpressions?: (ctx: TaskExpressionsContext) => void;

	/**
	 * Enter a parse tree produced by `TaskParser.addExpression`.
	 * @param ctx the parse tree
	 */
	enterAddExpression?: (ctx: AddExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `TaskParser.addExpression`.
	 * @param ctx the parse tree
	 */
	exitAddExpression?: (ctx: AddExpressionContext) => void;

	/**
	 * Enter a parse tree produced by `TaskParser.completeExpression`.
	 * @param ctx the parse tree
	 */
	enterCompleteExpression?: (ctx: CompleteExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `TaskParser.completeExpression`.
	 * @param ctx the parse tree
	 */
	exitCompleteExpression?: (ctx: CompleteExpressionContext) => void;
}
