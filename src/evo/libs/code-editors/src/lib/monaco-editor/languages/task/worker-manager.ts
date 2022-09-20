/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as monaco from 'monaco-editor';

import { ILanguageServiceDefaults } from './monaco.contribution';
import type { TaskWorker } from './task-worker';

const STOP_WHEN_IDLE_FOR = 2 * 60 * 1000; // 2min

export class WorkerManager {
	private _defaults: ILanguageServiceDefaults;
	private _idleCheckInterval: number;
	private _lastUsedTime: number;
	private _configChangeListener: monaco.IDisposable;

	private _worker: monaco.editor.MonacoWebWorker<TaskWorker> | null;
	private _client: Promise<TaskWorker> | null;

	constructor(defaults: ILanguageServiceDefaults) {
		this._defaults = defaults;
		this._worker = null;
		this._client = null;
		this._idleCheckInterval = window.setInterval(() => this._checkIfIdle(), 30 * 1000);
		this._lastUsedTime = 0;
		this._configChangeListener = this._defaults.onDidChange(() => this._stopWorker());
	}

	private _stopWorker(): void {
		if (this._worker) {
			this._worker.dispose();
			this._worker = null;
		}
		this._client = null;
	}

	public dispose(): void {
		clearInterval(this._idleCheckInterval);
		this._configChangeListener.dispose();
		this._stopWorker();
	}

	private _checkIfIdle(): void {
		if (!this._worker) {
			return;
		}
		const timePassedSinceLastUsed = Date.now() - this._lastUsedTime;
		if (timePassedSinceLastUsed > STOP_WHEN_IDLE_FOR) {
			this._stopWorker();
		}
	}

	private _getClient(): Promise<TaskWorker> {
		this._lastUsedTime = Date.now();

		if (!this._client) {
			this._worker = monaco.editor.createWebWorker<TaskWorker>({
				// module that exports the create() method and returns a `CSSWorker` instance
				moduleId: 'task.worker',

				label: this._defaults.languageId,

				// passed in to the create() method
				createData: {
					options: this._defaults.options,
					languageId: this._defaults.languageId,
				},
			});

			this._client = this._worker?.getProxy();
		}

		return this._client;
	}

	public getLanguageServiceWorker(...resources: monaco.Uri[]): Promise<TaskWorker> {
		let _client: TaskWorker;
		return this._getClient()
			.then(client => {
				_client = client;
			})
			.then(_ => {
				if (this._worker) {
					return this._worker.withSyncedResources(resources);
				}

				throw new Error('What to do now... !?!?');
			})
			.then(_ => _client);
	}
}
