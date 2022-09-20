import { ParserRuleContext } from 'antlr4ts';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import * as lsTypes from 'vscode-languageserver-types';

import { AddExpressionContext, CompleteExpressionContext, TaskExpressionsContext } from './.antlr/TaskParser';
import { parse } from './parser';

class SemanticValidationContext {
	public definedTasks: string[] = [];
	public errors: lsTypes.Diagnostic[] = [];
}

export default class TaskLanguageService {
	public validate(code: string): lsTypes.Diagnostic[] {
		const { errors, ast } = parse(code);
		//Later we will append semantic errors
		errors.push(...this.checkSemanticRules(ast));
		return errors;
	}

	private checkSemanticRules(ast: TaskExpressionsContext): lsTypes.Diagnostic[] {
		const semanticValidationContext = new SemanticValidationContext();
		if (ast.children) {
			ast.children.forEach(node => {
				this.handleAddExpressionContext(node, semanticValidationContext);
				this.handleCompleteExpressionContext(node, semanticValidationContext);
			});
		}

		return semanticValidationContext.errors;
	}

	private handleAddExpressionContext(node: ParseTree, context: SemanticValidationContext): void {
		if (node instanceof AddExpressionContext) {
			// if a Add expression : ADD TASK "STRING"
			const task = node.STRING().text;
			// If a TASK is defined using ADD TASK instruction, we can re-add it.
			if (context.definedTasks.some(task_ => task_ === task)) {
				// node has everything to know the position of this expression is in the code
				this.addError(context, '1', `Task ${task} already defined`, node);
			} else {
				context.definedTasks.push(task);
			}
		}
	}

	private handleCompleteExpressionContext(node: ParseTree, context: SemanticValidationContext): void {
		if (node instanceof CompleteExpressionContext) {
			const taskToComplete = node.STRING().text;
			if (context.definedTasks.every(task_ => task_ !== taskToComplete)) {
				// if the the TASK is not yet defined, here we are only checking the predefined TASK until this expression
				// which means the order is important
				this.addError(context, '2', `Task ${taskToComplete} is not defined`, node);
			}
		}
	}

	private addError(context: SemanticValidationContext, code: string, message: string, node: ParserRuleContext): void {
		context.errors.push({
			code: code,
			range: lsTypes.Range.create(
				(node.stop?.line ?? 1) - 1,
				(node.stop?.charPositionInLine ?? 1) - 1,
				(node.stop?.line ?? 1) - 1,
				(node.stop?.charPositionInLine ?? 1) + (node.stop?.stopIndex ?? 1) - (node.stop?.stopIndex ?? 1),
			),
			message,
		});
	}
}
