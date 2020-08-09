// Project: https://github.com/anpham6/squared
// Definitions by: An Pham <https://github.com/anpham6>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.6

/// <reference path="dom.d.ts" />
/// <reference path="type.d.ts" />
/// <reference path="object.d.ts" />
/// <reference path="squared.d.ts" />

interface FrameworkOptions {
    settings?: StandardMap;
    loadAs?: string;
    saveAs?: string;
    cache?: boolean;
}

type ExtensionPrototypeData = ObjectMap<FunctionType<any> | { get: () => any, set: (value: any) => void } | number | string | boolean>;