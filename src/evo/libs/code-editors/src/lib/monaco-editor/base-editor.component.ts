import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Inject,
	OnDestroy,
	Output,
	ViewChild,
} from '@angular/core';
import * as monaco from 'monaco-editor';
import { Subscription } from 'rxjs';

import { INgxMonacoEditorConfig, NGX_MONACO_EDITOR_CONFIG } from './config';

const GLOBAL_DEFAULT_OPTIONS: monaco.editor.IEditorConstructionOptions = {
	scrollBeyondLastLine: false,
	bracketPairColorization: {
		enabled: true,
		independentColorPoolPerBracketType: true,
	},
	//'bracketPairColorization.enabled': true,
	//'semanticHighlighting.enabled': false,
	autoClosingBrackets: 'always',
};

@Component({
	template: '',
})
export abstract class BaseEditorComponent implements AfterViewInit, OnDestroy {
	@ViewChild('editor', { static: false })
	protected _editorContainer!: ElementRef<HTMLElement>;

	@Output()
	public init = new EventEmitter<monaco.editor.IStandaloneCodeEditor>();

	@Output()
	public valueChange: EventEmitter<string> = new EventEmitter<string>();

	protected _editor: monaco.editor.IStandaloneCodeEditor | null = null;
	protected _options: monaco.editor.IStandaloneEditorConstructionOptions = {};
	protected _windowResizeSubscription: Subscription | undefined;

	constructor(@Inject(NGX_MONACO_EDITOR_CONFIG) protected config: INgxMonacoEditorConfig) {
		this._options = this.mergeWithGlobalOptions({});
	}

	public ngAfterViewInit(): void {
		this.initMonaco(this._options);
	}

	protected abstract initMonaco(options: monaco.editor.IStandaloneEditorConstructionOptions): void;

	public ngOnDestroy(): void {
		if (this._windowResizeSubscription) {
			this._windowResizeSubscription.unsubscribe();
		}
		if (this._editor) {
			this._editor.dispose();
			this._editor = null;
		}
	}

	protected mergeWithGlobalOptions(
		options: monaco.editor.IEditorConstructionOptions,
	): monaco.editor.IEditorConstructionOptions {
		return {
			...GLOBAL_DEFAULT_OPTIONS,
			...this.config.defaultOptions,
			...options,
		};
	}
}
