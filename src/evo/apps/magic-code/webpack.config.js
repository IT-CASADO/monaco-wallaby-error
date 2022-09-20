const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

const taskMonacoContribution = path.resolve(
	'./libs/code-editors/src/lib/monaco-editor/languages/task/monaco.contribution.ts',
);

const taskMonacoWorker = path.resolve('./libs/code-editors/src/lib/monaco-editor/languages/task/task.worker.ts');

console.log('webpack.config.js', taskMonacoContribution);
console.log('webpack.config.js', taskMonacoWorker);

module.exports = {
	plugins: [
		new MonacoEditorWebpackPlugin({
			globalAPI: true,
			languages: ['javascript', 'typescript', 'json'],

			/*
          HINT: register custom languages here!
          Question 1: Why do we get an error on runtime with custom language registration (without worker) over this plugin?
      */
			// customLanguages: [
			//   {
			//     label: 'task',
			//     entry: taskMonacoContribution,
			//   },
			// ],

			/*
          HINT: register custom languages here!
          Question 2: Why do we get an error on runtime with custom language registration (with worker) over this plugin?
      */
			// customLanguages: [
			//   {
			//     label: 'task',
			//     entry: taskMonacoContribution,
			//     worker: {
			//       id: 'task.worker',
			//       entry: taskMonacoWorker,
			//     },
			//   },
			// ],
		}),
	],
};
