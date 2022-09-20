import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Meta, moduleMetadata, Story } from '@storybook/angular';

import { EXAMPLE_JS, EXAMPLE_QUERY_ENGINE, EXAMPLE_TASK, SupportedLanguages } from '../constants';
import { NGX_MONACO_EDITOR_CONFIG } from './config';
import { registerAllCustomLanguagesForTesting } from './languages/register-custom-languages-testing';
import { EvoMonacoEditorComponent } from './monaco-editor.component';

registerAllCustomLanguagesForTesting();

export default {
	title: 'EvoMonacoEditorComponent',
	component: EvoMonacoEditorComponent,
	decorators: [
		moduleMetadata({
			imports: [
				//
				CommonModule,
				FormsModule,
				ReactiveFormsModule,
			],
			providers: [
				//
				{ provide: NGX_MONACO_EDITOR_CONFIG, useValue: {} },
			],
		}),
	],
} as Meta<EvoMonacoEditorComponent>;

const Template: Story<EvoMonacoEditorComponent> = (args: EvoMonacoEditorComponent) => ({
	props: args,
});

export const Javascript = Template.bind({});
Javascript.args = {
	model: {
		value: EXAMPLE_JS,
		language: SupportedLanguages.javascript,
	},
};

export const QueryEngineDark = Template.bind({});
QueryEngineDark.args = {
	model: {
		value: EXAMPLE_QUERY_ENGINE,
		language: SupportedLanguages.queryEngine,
	},
};

export const QueryEngineLight = Template.bind({});
QueryEngineLight.args = {
	model: {
		value: EXAMPLE_QUERY_ENGINE,
		language: SupportedLanguages.queryEngine,
	},
	theme: 'light',
};

export const Task = Template.bind({});
Task.args = {
	model: {
		value: EXAMPLE_TASK,
		language: SupportedLanguages.task,
	},
};
