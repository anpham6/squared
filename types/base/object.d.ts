/// <reference path="application.d.ts" />
/// <reference path="extension.d.ts" />
/// <reference path="file.d.ts" />
/// <reference path="node.d.ts" />
/// <reference path="options.d.ts" />
/// <reference path="resource.d.ts" />

interface IGlobExp extends RegExp {
    negate: boolean;
    filter: (values: string[]) => string[];
}