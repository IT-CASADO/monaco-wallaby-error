/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as monaco from 'monaco-editor';
import * as worker from 'monaco-editor/esm/vs/editor/editor.worker';

import { TaskWorker } from './task-worker';
import IWorkerContext = monaco.worker.IWorkerContext;

self.onmessage = (): void => {
	// ignore the first message
	worker.initialize((ctx: IWorkerContext) => {
		return new TaskWorker(ctx);
	});
};
