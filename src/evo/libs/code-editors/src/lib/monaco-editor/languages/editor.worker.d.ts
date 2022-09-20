/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// import * as monaco from 'monaco-editor';
import IWorkerContext = monaco.worker.IWorkerContext;

declare module 'monaco-editor/esm/vs/editor/editor.worker' {
	export function initialize(
		//callback: (ctx: any, createData: any) => any,
		callback: (ctx: IWorkerContext, createData: unknown) => unknown,
	): void;
}
