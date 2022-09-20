import { ICustomWebWorkers } from '../types';
import { registerTaskLanguage } from './task/monaco.contribution';

/**
 * @remarks unfortunately we cannot instantiate the web workers here,
 * because of an issue in PROD builds (Error: Terser failed for unknown reason.)
 * @param webWorkers
 */
export function registerAllCustomLanguagesForRoot(webWorkers: ICustomWebWorkers): void {
	// HINT: register custom languages with MonacoEditorWebpackPlugin

	self.MonacoEnvironment = {
		getWorker: (_, label): Worker => {
			if (label === 'task') {
				return webWorkers.taskWorker;
			}

			if (label === 'javascript' || label === 'typescript') {
				return new Worker('./ts.worker.js', {
					type: 'module',
				});
			}

			if (label === 'json') {
				return new Worker('./json.worker.js', {
					type: 'module',
				});
			}

			return new Worker('./editor.worker.js', {
				type: 'module',
			});
		},
	};

	registerTaskLanguage();
}
