const rootMain = require('../../../.storybook/main');
const MonacoEditorWebpackPlugin = require('monaco-editor-webpack-plugin');

const path = require('path');

const taskMonacoContribution = path.resolve(
	'./apps/magic-code/src/components/code-editors/monaco-editor/languages/task/monaco.contribution.ts',
);

const taskMonacoWorker = path.resolve(
	'./apps/magic-code/src/components/code-editors/monaco-editor/languages/task/task.worker.ts',
);

module.exports = {
	...rootMain,

	core: { ...rootMain.core, builder: 'webpack5' },

	stories: [...rootMain.stories, '../src/lib/**/*.stories.mdx', '../src/lib/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: [...rootMain.addons],
	webpackFinal: async (config, { configType }) => {
		// apply any global webpack configs that might have been specified in .storybook/main.js
		if (rootMain.webpackFinal) {
			config = await rootMain.webpackFinal(config, { configType });
		}

		// add your own webpack tweaks if needed

		// question: why don't I need this with Angular 13?
		// config.module?.rules?.push(
		//   ...[
		//     {
		//       test: /\.css$/,
		//       use: ['style-loader', 'css-loader'],
		//     },
		//     {
		//       test: /\.ttf$/,
		//       type: 'asset/resource',
		//     },
		//   ],
		// );

		//config.entry = { ...config.entry, 'task.worker': taskMonacoWorker };
		//config.entry['task.worker'] = taskMonacoWorker;

		config.plugins?.push(
			new MonacoEditorWebpackPlugin({
				globalAPI: false,
				languages: ['javascript', 'typescript'],
				// HINT: register custom languages here!
				// customLanguages: [
				//   {
				//     label: 'task',
				//     //entry: './apps/magic-code/src/components/code-editors/monaco-editor/languages/task/monaco.contribution.ts',
				//     entry: taskMonacoContribution,
				//     // worker: {
				//     //   id: 'task.worker',
				//     //   entry: taskMonacoWorker,
				//     // },
				//   },
				// ],
			}),
		);

		return config;
	},
};
