import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { CodeEditorModel } from '@evo/code-editors';

@Component({
	selector: 'evo-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	public title = 'magic-code';

	public codeMonaco: string = 'const editor = "monaco"';
	public modelMonaco = new CodeEditorModel(this.codeMonaco, 'javascript');
	public formControlMonaco = this.formBuilder.control(this.codeMonaco);

	constructor(private readonly formBuilder: FormBuilder) {}
}
