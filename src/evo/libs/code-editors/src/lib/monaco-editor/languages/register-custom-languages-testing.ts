import { registerAllCustomLanguagesForRoot } from './register-custom-languages';

export function registerAllCustomLanguagesForTesting(): void {
	registerAllCustomLanguagesForRoot({
		taskWorker: new Worker(new URL('./task/task.worker.ts', import.meta.url)),
	});
}
