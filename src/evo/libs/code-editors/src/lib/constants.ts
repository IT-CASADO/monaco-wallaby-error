export enum SupportedLanguages {
	javascript = 'javascript',
	typescript = 'typescript',
	task = 'task',
}

export const EXAMPLE_JS = `function x() {
		console.log("Hello world!");
	}
`;

export const EXAMPLE_JSON = `{"menu": {
    "header": "SVG Viewer",
    "items": [
        {"id": "Open"},
        {"id": "OpenNew", "label": "Open New"},
        null,
        {"id": "ZoomIn", "label": "Zoom In"},
        {"id": "ZoomOut", "label": "Zoom Out"},
        {"id": "OriginalView", "label": "Original View"},
        null,
        {"id": "Quality"},
        {"id": "Pause"},
        {"id": "Mute"},
        null,
        {"id": "Find", "label": "Find..."},
        {"id": "FindAgain", "label": "Find Again"},
        {"id": "Copy"},
        {"id": "CopyAgain", "label": "Copy Again"},
        {"id": "CopySVG", "label": "Copy SVG"},
        {"id": "ViewSVG", "label": "View SVG"},
        {"id": "ViewSource", "label": "View Source"},
        {"id": "SaveAs", "label": "Save As"},
        null,
        {"id": "Help"},
        {"id": "About", "label": "About Adobe CVG Viewer..."}
    ]
}}
`;

export const EXAMPLE_TASK = `ADD TASK "ABC"
ADD TASK "Y"
ADD TASK "XYZ"
ADD TASK "XYZ"
COMPLETE TASK "Y"
COMPLETE TASK "XYZ"
COMPLETE "Z"
`;
