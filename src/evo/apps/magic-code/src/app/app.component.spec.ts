import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
	EvoMonacoEditorComponent,
	NGX_MONACO_EDITOR_CONFIG,
	registerAllCustomLanguagesForTesting,
} from '@evo/code-editors';

import { AppComponent } from './app.component';
import { NxWelcomeComponent } from './nx-welcome.component';

registerAllCustomLanguagesForTesting();

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [AppComponent, NxWelcomeComponent, EvoMonacoEditorComponent],
			imports: [FormsModule, ReactiveFormsModule],
			providers: [
				//
				{ provide: NGX_MONACO_EDITOR_CONFIG, useValue: {} },
			],
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();
	});

	it(`should have as title 'magic-code'`, () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;
		expect(app.title).toEqual('magic-code');
	});

	it('should render title', () => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		const compiled = fixture.nativeElement as HTMLElement;
		expect(compiled.querySelector('h1')?.textContent).toContain('Welcome magic-code');
	});
});
