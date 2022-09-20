/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as monaco from 'monaco-editor';

import { SupportedLanguages } from '../../../constants';
import * as taskMode from './task-mode';
//declare const monaco: any;

export interface IOptions {
	readonly validate?: boolean;
	// readonly lint?: {
	//   readonly compatibleVendorPrefixes?: 'ignore' | 'warning' | 'error';
	//   readonly vendorPrefix?: 'ignore' | 'warning' | 'error';
	//   readonly duplicateProperties?: 'ignore' | 'warning' | 'error';
	//   readonly emptyRules?: 'ignore' | 'warning' | 'error';
	//   readonly importStatement?: 'ignore' | 'warning' | 'error';
	//   readonly boxModel?: 'ignore' | 'warning' | 'error';
	//   readonly universalSelector?: 'ignore' | 'warning' | 'error';
	//   readonly zeroUnits?: 'ignore' | 'warning' | 'error';
	//   readonly fontFaceProperties?: 'ignore' | 'warning' | 'error';
	//   readonly hexColorLength?: 'ignore' | 'warning' | 'error';
	//   readonly argumentsInColorFunction?: 'ignore' | 'warning' | 'error';
	//   readonly unknownProperties?: 'ignore' | 'warning' | 'error';
	//   readonly ieHack?: 'ignore' | 'warning' | 'error';
	//   readonly unknownVendorSpecificProperties?: 'ignore' | 'warning' | 'error';
	//   readonly propertyIgnoredDueToDisplay?: 'ignore' | 'warning' | 'error';
	//   readonly important?: 'ignore' | 'warning' | 'error';
	//   readonly float?: 'ignore' | 'warning' | 'error';
	//   readonly idSelector?: 'ignore' | 'warning' | 'error';
	// };
	// /**
	//  * Configures the CSS data types known by the langauge service.
	//  */
	// readonly data?: CSSDataConfiguration;

	// /**
	//  * Settings for the CSS formatter.
	//  */
	// readonly format?: CSSFormatConfiguration;
}
export interface IModeConfiguration {
	/**
	 * Defines whether the built-in completionItemProvider is enabled.
	 */
	readonly completionItems?: boolean;

	/**
	 * Defines whether the built-in hoverProvider is enabled.
	 */
	readonly hovers?: boolean;

	/**
	 * Defines whether the built-in documentSymbolProvider is enabled.
	 */
	readonly documentSymbols?: boolean;

	/**
	 * Defines whether the built-in definitions provider is enabled.
	 */
	readonly definitions?: boolean;

	/**
	 * Defines whether the built-in references provider is enabled.
	 */
	readonly references?: boolean;

	/**
	 * Defines whether the built-in references provider is enabled.
	 */
	readonly documentHighlights?: boolean;

	/**
	 * Defines whether the built-in rename provider is enabled.
	 */
	readonly rename?: boolean;

	/**
	 * Defines whether the built-in color provider is enabled.
	 */
	readonly colors?: boolean;

	/**
	 * Defines whether the built-in foldingRange provider is enabled.
	 */
	readonly foldingRanges?: boolean;

	/**
	 * Defines whether the built-in diagnostic provider is enabled.
	 */
	readonly diagnostics?: boolean;

	/**
	 * Defines whether the built-in selection range provider is enabled.
	 */
	readonly selectionRanges?: boolean;

	/**
	 * Defines whether the built-in document formatting edit provider is enabled.
	 */
	readonly documentFormattingEdits?: boolean;

	/**
	 * Defines whether the built-in document formatting range edit provider is enabled.
	 */
	readonly documentRangeFormattingEdits?: boolean;
}

export interface ILanguageServiceDefaults {
	readonly languageId: string;
	readonly onDidChange: monaco.IEvent<ILanguageServiceDefaults>;

	readonly modeConfiguration: IModeConfiguration;
	readonly options: IOptions;
	setOptions(options: IOptions): void;
	setModeConfiguration(modeConfiguration: IModeConfiguration): void;
}

/** @deprecated Use Options instead */
export type DiagnosticsOptions = IOptions;

// --- configuration and defaults ---------

class LanguageServiceDefaultsImpl implements ILanguageServiceDefaults {
	private _onDidChange: monaco.Emitter<ILanguageServiceDefaults>;
	private _options!: IOptions;
	private _modeConfiguration!: IModeConfiguration;
	private _languageId: string;

	constructor(languageId: string, options: IOptions, modeConfiguration: IModeConfiguration) {
		this._onDidChange = new monaco.Emitter<ILanguageServiceDefaults>();
		this._languageId = languageId;
		this.setOptions(options);
		this.setModeConfiguration(modeConfiguration);
	}

	public get onDidChange(): monaco.IEvent<ILanguageServiceDefaults> {
		return this._onDidChange.event;
	}

	public get languageId(): string {
		return this._languageId;
	}

	public get modeConfiguration(): IModeConfiguration {
		return this._modeConfiguration;
	}

	public get diagnosticsOptions(): IOptions {
		return this.options;
	}

	public get options(): IOptions {
		return this._options;
	}

	public setOptions(options: IOptions): void {
		this._options = options || Object.create(null);
		this._onDidChange.fire(this);
	}

	public setModeConfiguration(modeConfiguration: IModeConfiguration): void {
		this._modeConfiguration = modeConfiguration || Object.create(null);
		this._onDidChange.fire(this);
	}
}

const optionsDefault: Required<IOptions> = {
	validate: true,
};

const modeConfigurationDefault: Required<IModeConfiguration> = {
	completionItems: true,
	hovers: true,
	documentSymbols: true,
	definitions: true,
	references: true,
	documentHighlights: true,
	rename: true,
	colors: true,
	foldingRanges: true,
	diagnostics: true,
	selectionRanges: true,
	documentFormattingEdits: true,
	documentRangeFormattingEdits: true,
};

export const taskDefaults: ILanguageServiceDefaults = new LanguageServiceDefaultsImpl(
	SupportedLanguages.task,
	optionsDefault,
	modeConfigurationDefault,
);

const taskExtensionPoint: monaco.languages.ILanguageExtensionPoint = {
	id: taskDefaults.languageId,
};

// --- Registration to monaco editor ---
function getMode(): Promise<typeof taskMode> {
	return import('./task-mode');
}

export function registerTaskLanguage(): void {
	monaco.languages.onLanguage(taskDefaults.languageId, () => {
		void getMode().then(mode => mode.setupMode(taskDefaults));
	});

	monaco.languages.register(taskExtensionPoint);
}
