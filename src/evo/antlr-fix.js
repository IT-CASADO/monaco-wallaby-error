const fs = require('fs');
const path = require('path');

const someFiles = [
	path.resolve('./libs/code-editors/src/lib/language-services/query-engine/.antlr/QueryEngineParser.ts'),
	path.resolve('./libs/code-editors/src/lib/language-services/query-engine/.antlr/QueryEngineLexer.ts'),
	path.resolve('./libs/code-editors/src/lib/language-services/task/.antlr/TaskLexer.ts'),
	path.resolve('./libs/code-editors/src/lib/language-services/task/.antlr/TaskParser.ts'),
];

someFiles.forEach(file => {
	fs.readFile(file, 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}
		let result = data;
		result = result.replace(/public accept</g, 'public override accept<');
		result = result.replace(/public exitRule\(/g, 'public override exitRule(');
		result = result.replace(/public enterRule\(/g, 'public override enterRule(');
		result = result.replace(/public get ruleIndex\(/g, 'public override get ruleIndex(');
		result = result.replace(/public get serializedATN\(/g, 'public override get serializedATN(');
		result = result.replace(/public sempred\(/g, 'public override sempred(');

		fs.writeFile(file, result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});
});
