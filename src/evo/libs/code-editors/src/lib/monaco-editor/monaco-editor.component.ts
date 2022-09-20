import {
	ChangeDetectionStrategy,
	Component,
	forwardRef,
	Inject,
	Input,
	NgZone,
	OnChanges,
	SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'lodash-es';
import * as monaco from 'monaco-editor';
import { fromEvent } from 'rxjs';

import { CodeChanged } from '../code-editor/types';
import { BaseEditorComponent } from './base-editor.component';
import { INgxMonacoEditorConfig, NGX_MONACO_EDITOR_CONFIG } from './config';
import { IMonacoEditorModel } from './types';

@Component({
	selector: 'evo-monaco-editor',
	templateUrl: './base-editor.component.html',
	styleUrls: ['./base-editor.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => EvoMonacoEditorComponent),
			multi: true,
		},
	],
})
export class EvoMonacoEditorComponent extends BaseEditorComponent implements ControlValueAccessor, OnChanges {
	@Input()
	public model: IMonacoEditorModel = { language: 'javascript', value: '' };

	@Input()
	public set options(options: monaco.editor.IStandaloneEditorConstructionOptions) {
		this._options = this.mergeWithGlobalOptions(options);
	}

	public get options(): monaco.editor.IStandaloneEditorConstructionOptions {
		return this._options;
	}

	private _value: string = '';
	public get value(): string {
		return this._value;
	}

	private onControlTouched: () => void = noop;
	private onControlChange: CodeChanged = noop;

	constructor(private zone: NgZone, @Inject(NGX_MONACO_EDITOR_CONFIG) editorConfig: INgxMonacoEditorConfig) {
		super(editorConfig);
	}

	public ngOnChanges(changes: SimpleChanges): void {
		if (changes['model']) {
			this._value = this.model.value ?? '';
		}

		if (this._editor) {
			this._editor.dispose();
			this.initMonaco();
		}
	}

	public writeValue(value: string): void {
		this._value = value || '';
		// Fix for value change while dispose in process.
		setTimeout(() => {
			if (this._editor) {
				this._editor.setValue(this.value);
			}
		});
	}

	public registerOnChange(fn: CodeChanged): void {
		this.onControlChange = fn;
	}

	public registerOnTouched(fn: () => void): void {
		this.onControlTouched = fn;
	}

	public setDisabledState?(isDisabled: boolean): void {
		this._editor?.updateOptions({ readOnly: isDisabled });
	}

	protected initMonaco(): void {
		if (this.model) {
			if (this.model.uri) {
				this.options.model = monaco.editor.getModel(this.model.uri);
				if (this.options.model) {
					this.options.model.setValue(this.value);
				}
			} else {
				this.options.model = monaco.editor.createModel(this.value, this.model.language, this.model.uri);
			}
		}

		const editor = (this._editor = monaco.editor.create(this._editorContainer.nativeElement, {
			...this.options,
			theme: 'vs-dark',
		}));

		if (!this.model) {
			editor.setValue(this.value);
		}

		editor.onDidChangeModelContent(() => {
			const value = editor.getValue();

			// value is not propagated to parent when executing outside zone.
			this.zone.run(() => {
				if (this._value !== value) {
					this._value = value;
					this.notifyChange(value);
				}
			});
		});

		editor.onDidBlurEditorWidget(() => {
			this.onControlTouched();
		});

		// refresh layout on resize event.
		if (this._windowResizeSubscription) {
			this._windowResizeSubscription.unsubscribe();
		}
		this._windowResizeSubscription = fromEvent(window, 'resize').subscribe(() => editor.layout());

		this.init.emit(editor);
	}

	private notifyChange(value: string): void {
		this.onControlChange(value);
		this.valueChange.emit(value);
	}
}
