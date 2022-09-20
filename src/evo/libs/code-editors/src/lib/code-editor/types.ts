export class CodeEditorOptions {
	constructor(public showLineNumbers: boolean = true) {}
}

export class CodeEditorModel {
	constructor(public value: string, public language: string) {}
}

export type CodeChanged = (value: string) => void;
