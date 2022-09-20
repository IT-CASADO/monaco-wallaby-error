import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { EvoMonacoEditorModule } from '@evo/code-editors';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';

@NgModule({
	declarations: [AppComponent, NxWelcomeComponent],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		EvoMonacoEditorModule.forRootWithWorkers({
			taskWorker: new Worker(
				new URL('../../../../libs/code-editors/src/lib/monaco-editor/languages/task/task.worker', import.meta.url),
			),
		}),
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
