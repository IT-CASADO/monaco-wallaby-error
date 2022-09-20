import { TestBed, waitForAsync } from '@angular/core/testing';

import { CodeEditorsModule } from './code-editors.module';

describe('CodeEditorsModule', () => {
	beforeEach(
		waitForAsync(async () => {
			await TestBed.configureTestingModule({
				imports: [CodeEditorsModule],
			}).compileComponents();
		}),
	);

	// NB: This particular test does not do anything useful.
	//     It does NOT check for correct instantiation of the module.
	it('should have a module definition', () => {
		expect(CodeEditorsModule).toBeDefined();
	});
});
