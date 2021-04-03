import type Extension from './extension';

import File from './file';

type CssValueMap = ObjectMap<Undef<Set<string>>>;

const { UNABLE_TO_FINALIZE_DOCUMENT, reject } = squared.lib.error;
const { escapePattern, isPlainObject } = squared.lib.util;

const REGEXP_VARNAME = /var\(\s*(--[^\d\s][^\s,)]*)/g;

export default class Application<T extends squared.base.Node> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public userSettings!: UserResourceSettings;
    public builtInExtensions!: Map<string, Extension<T>>;
    public readonly extensions: Extension<T>[] = [];
    public readonly systemName = 'chrome';

    private _cssUsedVariables: CssValueMap = {};
    private _cssUnusedSelectors: CssValueMap = {};

    public init() {
        this.session.usedSelector = function(this: Application<T>, sessionId: string, cssText: string) {
            let usedVariables: Undef<Set<string>>,
                match: Null<RegExpExecArray>;
            while (match = REGEXP_VARNAME.exec(cssText)) {
                if (!usedVariables) {
                    usedVariables = this._cssUsedVariables[sessionId] ||= new Set();
                }
                usedVariables.add(match[1]);
            }
            REGEXP_VARNAME.lastIndex = 0;
        };
        this.session.unusedSelector = function(this: Application<T>, sessionId: string, cssText: string, selector: string, hostElement?: Element) {
            if (!hostElement) {
                (this._cssUnusedSelectors[sessionId] ||= new Set()).add(selector);
            }
        };
    }

    public insertNode(processing: squared.base.AppProcessing<T>, element: Element) {
        if (element.nodeName[0] === '#') {
            if (this.userSettings.excludePlainText) {
                return;
            }
            this.controllerHandler.applyDefaultStyles(processing, element);
        }
        return this.createNodeStatic(processing, element);
    }

    public saveAs(filename: string, options?: FileArchivingOptions) {
        return this.processAssets('saveAs', filename, options);
    }

    public copyTo(pathname: string, options?: FileCopyingOptions) {
        return this.processAssets('copyTo', pathname, options);
    }

    public appendTo(target: string, options?: FileArchivingOptions) {
        return this.processAssets('appendTo', target, options);
    }

    private async processAssets(module: "saveAs" | "copyTo" | "appendTo", pathname: string, options?: FileArchivingOptions | FileCopyingOptions) {
        const result = await this.parseDocument() as Undef<T>;
        if (!result) {
            return reject(UNABLE_TO_FINALIZE_DOCUMENT);
        }
        const sessionId = result.sessionId;
        const resourceId = this.getProcessing(sessionId)!.resourceId;
        const dataSource: [HTMLElement, DataSource][] = [];
        const assetMap = new Map<HTMLElement, AssetCommand>();
        const nodeMap = new Map<XmlNode, HTMLElement>();
        const appendMap = new Map<HTMLElement, AssetCommand[]>();
        options = { ...options, saveAsWebPage: true, resourceId, assetMap, nodeMap, appendMap };
        const usedVariables = options.removeUnusedVariables && this._cssUsedVariables[sessionId];
        const unusedSelectors = this._cssUnusedSelectors[sessionId];
        if (usedVariables) {
            options.usedVariables = Array.from(usedVariables).concat(options.retainUsedStyles?.filter(value => value.startsWith('--')) || []);
        }
        if (unusedSelectors) {
            const { removeUnusedClasses, removeUnusedSelectors, retainUsedStyles } = options;
            if (removeUnusedClasses || removeUnusedSelectors) {
                const styles: string[] = [];
                for (const value of unusedSelectors) {
                    if ((value.includes(':') ? removeUnusedSelectors : removeUnusedClasses) && (!retainUsedStyles || !retainUsedStyles.includes(value))) {
                        styles.push(value);
                    }
                }
                if (styles.length) {
                    options.unusedStyles = styles;
                }
            }
        }
        if (options.configUri) {
            const commands = await this.fileHandler!.loadConfig(options.configUri, options) as Undef<AssetCommand[]>;
            if (commands) {
                const documentHandler = this.userSettings.outputDocumentHandler;
                const paramMap = new Map<string, [RegExp, string]>();
                const replaceParams = (param: unknown): unknown => {
                    const type = typeof param;
                    if (param && type !== 'number' && type !== 'boolean' && type !== 'bigint') {
                        const current = type === 'object' ? JSON.stringify(param) : param as string;
                        let output = current;
                        for (const [pattern, value] of paramMap.values()) {
                            output = output.replace(pattern, value);
                        }
                        if (output !== current) {
                            if (type === 'object') {
                                try {
                                    return JSON.parse(output);
                                }
                                catch {
                                }
                            }
                            else {
                                return output;
                            }
                        }
                    }
                    return param;
                };
                if (location.href.includes('?')) {
                    new URLSearchParams(location.search).forEach((value, key) => paramMap.set(key, [new RegExp(`\\{\\{\\s*${escapePattern(key)}\\s*\\}\\}`, 'g'), value]));
                }
                for (const item of commands) {
                    if (item.selector) {
                        const type = item.type;
                        let dataSrc: Null<DataSource> = isPlainObject(item.dataSource) ? item.dataSource : null,
                            dataCloud: Null<DataSource> = isPlainObject(item.cloudDatabase) ? item.cloudDatabase : null;
                        if (paramMap.size) {
                            for (const data of [dataSrc, dataCloud]) {
                                if (data) {
                                    for (const attr in data) {
                                        if (attr !== 'value') {
                                            data[attr] = replaceParams(data[attr]);
                                        }
                                    }
                                }
                            }
                        }
                        dataSrc &&= { document: item.document || File.copyDocument(documentHandler), ...dataSrc, type } as DataSource;
                        dataCloud &&= { document: item.document || File.copyDocument(documentHandler), ...dataSrc, type, source: 'cloud' } as DataSource;
                        document.querySelectorAll(item.selector).forEach((element: HTMLElement) => {
                            switch (type) {
                                case 'text':
                                case 'attribute':
                                case 'display':
                                    if (dataSrc) {
                                        dataSource.push([element, dataSrc]);
                                    }
                                    else if (dataCloud) {
                                        dataSource.push([element, dataCloud]);
                                    }
                                    break;
                                default:
                                    if (type && (type === 'replace' || type.startsWith('append/') || type.startsWith('prepend/'))) {
                                        let items = appendMap.get(element);
                                        if (!items) {
                                            appendMap.set(element, items = []);
                                        }
                                        items.push({ ...item });
                                    }
                                    else {
                                        assetMap.set(element, { ...item });
                                    }
                                    break;
                            }
                        });
                    }
                }
            }
        }
        if (assetMap.size === 0) {
            delete options.assetMap;
        }
        if (appendMap.size === 0) {
            delete options.appendMap;
        }
        if (dataSource.length) {
            const useOriginalHtmlPage = options.useOriginalHtmlPage;
            const domAll = document.querySelectorAll('*');
            const cache: SelectorCache = {};
            const items = options.dataSource ||= [];
            for (const [element, data] of dataSource) {
                const node = File.createTagNode(element, domAll, cache);
                node.textContent = element.textContent!;
                data.element = node;
                if (!useOriginalHtmlPage) {
                    File.setDocumentId(node, element, data.document);
                }
                nodeMap.set(node, element);
                items.push(data);
            }
        }
        return this.fileHandler![module](pathname, options);
    }

    get initializing() {
        return false;
    }

    get length() {
        return 1;
    }
}