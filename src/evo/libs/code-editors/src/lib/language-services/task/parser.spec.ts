import { parseAndGetASTRoot } from './parser';

describe('TaskParser', () => {
	it('should create', () => {
		const ast = parseAndGetASTRoot('ADD TASK "My Task"');
		expect(ast.exception).toBeUndefined();
	});
});
