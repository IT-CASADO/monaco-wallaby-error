import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { INgxMonacoEditorConfig, NGX_MONACO_EDITOR_CONFIG } from './config';
import { registerAllCustomLanguagesForRoot } from './languages/register-custom-languages';
import { EvoMonacoEditorComponent } from './monaco-editor.component';
import { ICustomWebWorkers } from './types';

@NgModule({
	declarations: [
		//
		EvoMonacoEditorComponent,
	],
	imports: [
		//
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
	],
	exports: [
		//
		EvoMonacoEditorComponent,
	],
})
export class EvoMonacoEditorModule {
	public static forRootWithWorkers(
		webWorkers: ICustomWebWorkers,
		config: INgxMonacoEditorConfig = {},
	): ModuleWithProviders<EvoMonacoEditorModule> {
		registerAllCustomLanguagesForRoot(webWorkers);

		return {
			ngModule: EvoMonacoEditorModule,
			providers: [{ provide: NGX_MONACO_EDITOR_CONFIG, useValue: config }],
		};
	}
}
