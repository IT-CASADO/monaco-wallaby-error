import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NGX_MONACO_EDITOR_CONFIG } from './config';
import { registerAllCustomLanguagesForTesting } from './languages/register-custom-languages-testing';
import { EvoMonacoEditorComponent } from './monaco-editor.component';
import { IMonacoEditorModel } from './types';

registerAllCustomLanguagesForTesting();

const initialValue = 'const x = "99"';

@Component({
	template: '<evo-monaco-editor [model]="editorModel"></evo-monaco-editor>',
})
class TestHostComponent {
	@ViewChild(EvoMonacoEditorComponent)
	public editor!: EvoMonacoEditorComponent;

	public editorModel: IMonacoEditorModel = { language: 'javascript', value: initialValue };
}

@Component({
	template: '<evo-monaco-editor [model]="editorModel" [formControl]="formControl"></evo-monaco-editor>',
})
class TestFormHostComponent {
	@ViewChild(EvoMonacoEditorComponent)
	public editor!: EvoMonacoEditorComponent;

	public editorModel: IMonacoEditorModel = { language: 'javascript', value: '' };
	public formControl: FormControl = new FormControl({ value: initialValue, disabled: false });
}

describe('EvoMonacoEditorComponent without forms', () => {
	let testHostComponent: TestHostComponent;
	let fixture: ComponentFixture<TestFormHostComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EvoMonacoEditorComponent, TestFormHostComponent],
			imports: [FormsModule, ReactiveFormsModule],
			providers: [
				//
				{ provide: NGX_MONACO_EDITOR_CONFIG, useValue: {} },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TestFormHostComponent);
		testHostComponent = fixture.componentInstance;
		fixture.detectChanges();
	});

	it(
		'should create',
		waitForAsync(() => {
			expect(testHostComponent).toBeTruthy();
		}),
	);

	it(
		'should initialize internal value with initial value',
		waitForAsync(() => {
			expect(testHostComponent.editor.value).toEqual(initialValue);
		}),
	);
});

describe('EvoMonacoEditorComponent with forms', () => {
	let testFormHostComponent: TestFormHostComponent;
	let fixture: ComponentFixture<TestFormHostComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [EvoMonacoEditorComponent, TestFormHostComponent],
			imports: [FormsModule, ReactiveFormsModule],
			providers: [
				//
				{ provide: NGX_MONACO_EDITOR_CONFIG, useValue: {} },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(TestFormHostComponent);
		testFormHostComponent = fixture.componentInstance;
		fixture.detectChanges();
	});

	it(
		'should create',
		waitForAsync(() => {
			expect(testFormHostComponent).toBeTruthy();
		}),
	);

	it(
		'should initialize internal value with initial value',
		waitForAsync(() => {
			expect(testFormHostComponent.editor.value).toEqual(initialValue);
		}),
	);

	it(
		'should update internal value',
		waitForAsync(() => {
			testFormHostComponent.formControl.patchValue('let x = 99');
			fixture.detectChanges();
			expect(testFormHostComponent.editor.value).toEqual('let x = 99');
		}),
	);
});
