import { InjectionToken } from '@angular/core';
import * as monaco from 'monaco-editor';

export const NGX_MONACO_EDITOR_CONFIG = new InjectionToken('NGX_MONACO_EDITOR_CONFIG');

export interface INgxMonacoEditorConfig {
	//baseUrl?: string;
	defaultOptions?: monaco.editor.IEditorConstructionOptions;
	//onMonacoLoad?: Function;
}
