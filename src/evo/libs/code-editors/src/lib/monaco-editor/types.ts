import * as monaco from 'monaco-editor';

export interface IMonacoDiffEditorModel {
	code: string;
	language: string;
}

export interface IMonacoEditorModel {
	value: string;
	language: string;
	uri?: monaco.Uri;
}

export interface ICustomWebWorkers {
	taskWorker: Worker;
}
