import { Component, Injector, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, FormControlDirective, NgControl } from '@angular/forms';
import noop from 'lodash-es/noop';

@Component({
	template: '',
})
export abstract class ControlValueAccessorConnectorComponent<T> implements ControlValueAccessor {
	@ViewChild(FormControlDirective, { static: true })
	private formControlDirective: FormControlDirective | null = null;

	@Input()
	public formControl: FormControl | null = null;

	@Input()
	public formControlName: string | null = null;

	protected onControlChange: (value?: T) => void = noop;

	public get control(): FormControl | null {
		if (this.ngControl?.control instanceof FormControl) {
			return this.ngControl.control;
		}

		return null;
	}

	public abstract get value(): T | null;

	constructor(private injector: Injector) {}

	private get ngControl(): NgControl | null {
		return this.injector.get(NgControl, null);
	}

	public writeValue(value: T | null): void {
		this.formControlDirective?.valueAccessor?.writeValue(value);
	}

	public registerOnChange(fn: (value?: T) => void): void {
		this.onControlChange = fn;

		if (this.formControlDirective?.valueAccessor) {
			this.formControlDirective.valueAccessor.registerOnChange(fn);
		}
	}

	public registerOnTouched(fn: () => void): void {
		if (this.formControlDirective?.valueAccessor) {
			this.formControlDirective.valueAccessor.registerOnTouched(fn);
		}
	}

	public setDisabledState?(isDisabled: boolean): void {
		if (this.formControlDirective?.valueAccessor?.setDisabledState) {
			this.formControlDirective.valueAccessor.setDisabledState(isDisabled);
		}
	}
}
