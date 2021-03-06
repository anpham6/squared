import type Extension from './extension';

import File from './file';

type CssValueMap = ObjectMap<Set<string>>;

const { STRING } = squared.base.lib.regex;

const { UNABLE_TO_FINALIZE_DOCUMENT, reject } = squared.lib.error;
const { escapePattern, isPlainObject, splitSome } = squared.lib.util;

const { trimBoth } = squared.base.lib.util;

const REGEXP_VAR = new RegExp(STRING.CSS_VARVALUE + '|' + STRING.CSS_VARNAME, 'g');
const REGEXP_VARNAME = new RegExp(STRING.CSS_VARNAME, 'g');
const REGEXP_VARVALUE = new RegExp(STRING.CSS_VARVALUE, 'g');

export default class Application<T extends squared.base.Node> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public builtInExtensions!: Map<string, Extension<T>>;
    public readonly extensions: Extension<T>[] = [];
    public readonly systemName = 'chrome';

    private _cssVariables: ObjectMap<CssValueMap> = {};
    private _cssUsedVariables: CssValueMap = {};
    private _cssUsedFontFace: CssValueMap = {};
    private _cssUsedKeyframes: CssValueMap = {};
    private _cssUnusedSelectors: CssValueMap = {};
    private _cssUnusedMedia: CssValueMap = {};
    private _cssUnusedSupports: CssValueMap = {};

    public init() {
        this.session.usedSelector = function(this: Application<T>, sessionId: string, rule: CSSStyleRule) {
            const { fontFamily, animationName } = rule.style;
            let variables: Undef<ObjectMap<Set<string>>>,
                usedVariables: Undef<Set<string>>,
                usedFontFace: Undef<Set<string>>,
                usedKeyframes: Undef<Set<string>>,
                match: Null<RegExpExecArray>;
            while (match = REGEXP_VAR.exec(rule.cssText)) {
                if (match[3]) {
                    if (!usedVariables) {
                        usedVariables = this._cssUsedVariables[sessionId] ||= new Set();
                    }
                    usedVariables.add(match[3]);
                }
            }
            while (match = REGEXP_VARVALUE.exec(rule.cssText)) {
                if (!variables) {
                    variables = this._cssVariables[sessionId] ||= {};
                }
                (variables[match[1]] ||= new Set()).add(match[2].trim());
            }
            if (fontFamily) {
                if (!usedFontFace) {
                    usedFontFace = this._cssUsedFontFace[sessionId] ||= new Set();
                }
                splitSome(fontFamily, value => {
                    usedFontFace!.add(trimBoth(value));
                });
            }
            if (animationName) {
                if (!usedKeyframes) {
                    usedKeyframes = this._cssUsedKeyframes[sessionId] ||= new Set();
                }
                splitSome(animationName, value => {
                    usedKeyframes!.add(value);
                });
            }
            REGEXP_VAR.lastIndex = 0;
            REGEXP_VARVALUE.lastIndex = 0;
        };
        this.session.unusedSelector = function(this: Application<T>, sessionId: string, rule: CSSStyleRule, selector: string, hostElement?: Element) {
            if (!hostElement) {
                (this._cssUnusedSelectors[sessionId] ||= new Set()).add(selector);
            }
        };
        this.session.unusedMedia = function(this: Application<T>, sessionId: string, rule: CSSConditionRule, condition: string, hostElement?: Element) {
            if (!hostElement) {
                (this._cssUnusedMedia[sessionId] ||= new Set()).add(condition);
            }
        };
        this.session.unusedSupports = function(this: Application<T>, sessionId: string, rule: CSSConditionRule, condition: string, hostElement?: Element) {
            if (!hostElement) {
                (this._cssUnusedSupports[sessionId] ||= new Set()).add(condition);
            }
        };
        super.init();
    }

    public reset() {
        this._cssVariables = {};
        this._cssUsedVariables = {};
        this._cssUsedFontFace = {};
        this._cssUsedKeyframes = {};
        this._cssUnusedSelectors = {};
        this._cssUnusedMedia = {};
        this._cssUnusedSupports = {};
        super.reset();
    }

    public insertNode(processing: squared.base.AppProcessing<T>, element: Element) {
        if (element.nodeName[0] === '#') {
            if (this.getUserSetting(processing, 'excludePlainText')) {
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
        const processing = this.getProcessing(sessionId)!;
        const resourceId = processing.resourceId;
        const dataSource: [HTMLElement, DataSource][] = [];
        const assetMap = new Map<HTMLElement, AssetCommand>();
        const nodeMap = new Map<XmlNode, HTMLElement>();
        const appendMap = new Map<HTMLElement, AssetCommand[]>();
        options = { ...options, saveAsWebPage: true, sessionId, resourceId, assetMap, nodeMap, appendMap };
        const retainUsedStyles = options.retainUsedStyles;
        const retainUsedStylesValue = retainUsedStyles ? retainUsedStyles.filter(value => typeof value === 'string') as string[] : [];
        const createSet = (values: string[]) => {
            const items: string[] = [];
            values.forEach(value => !items.includes(value) && items.push(value));
            return items;
        };
        if (options.removeUnusedVariables) {
            const values = this._cssVariables[sessionId];
            let variables = createSet(Array.from(this._cssUsedVariables[sessionId] || []).concat(retainUsedStylesValue.filter(value => value.startsWith('--'))));
            if (values) {
                const nested = new Set<string>();
                for (const name of variables) {
                    (function extractName(data: Undef<Set<string>>) {
                        if (data) {
                            const pattern = new RegExp(REGEXP_VARNAME);
                            let match: Null<RegExpExecArray>;
                            for (const value of data) {
                                while (match = pattern.exec(value)) {
                                    nested.add(match[1]);
                                    extractName(values[match[1]]);
                                }
                                pattern.lastIndex = 0;
                            }
                        }
                    })(values[name]);
                }
                if (nested.size) {
                    variables.forEach(name => nested.add(name));
                    variables = Array.from(nested);
                }
            }
            options.usedVariables = variables;
            delete options.removeUnusedVariables;
        }
        if (options.removeUnusedFontFace) {
            options.usedFontFace = createSet(Array.from(this._cssUsedFontFace[sessionId] || []).concat(retainUsedStylesValue.filter(value => value.startsWith('|font-face:') && value.endsWith('|')).map((value: string) => trimBoth(value, '|').substring(10).trim())));
            delete options.removeUnusedFontFace;
        }
        if (options.removeUnusedKeyframes) {
            options.usedKeyframes = createSet(Array.from(this._cssUsedKeyframes[sessionId] || []).concat(retainUsedStylesValue.filter(value => value.startsWith('|keyframes:') && value.endsWith('|')).map((value: string) => trimBoth(value, '|').substring(10).trim())));
            delete options.removeUnusedKeyframes;
        }
        if (options.removeUnusedMedia) {
            const unusedMedia = this._cssUnusedMedia[sessionId];
            if (unusedMedia) {
                const queries: string[] = [];
                const exclusions = retainUsedStylesValue.filter(value => value.startsWith('|media:') && value.endsWith('|')).map((value: string) => trimBoth(value, '|').substring(6).trim());
                unusedMedia.forEach(value => !exclusions.includes(value) && queries.push(value));
                if (queries.length) {
                    options.unusedMedia = queries;
                }
            }
            delete options.removeUnusedMedia;
        }
        if (options.removeUnusedSupports) {
            const unusedSupports = this._cssUnusedSupports[sessionId];
            if (unusedSupports) {
                const supports: string[] = [];
                const exclusions = retainUsedStylesValue.filter(value => value.startsWith('|supports:') && value.endsWith('|')).map((value: string) => trimBoth(value, '|').substring(9).trim());
                for (const value of unusedSupports) {
                    if (!exclusions.includes(value)) {
                        supports.push(value);
                    }
                }
                if (supports.length) {
                    options.unusedSupports = supports;
                }
            }
            delete options.removeUnusedSupports;
        }
        if (options.removeUnusedClasses || options.removeUnusedPseudoClasses) {
            const unusedSelectors = this._cssUnusedSelectors[sessionId];
            if (unusedSelectors) {
                const styles: string[] = [];
                for (const value of unusedSelectors) {
                    if ((value.indexOf(':') !== -1 ? options.removeUnusedPseudoClasses : options.removeUnusedClasses) && (!retainUsedStyles || !retainUsedStyles.find(pattern => typeof pattern === 'string' ? pattern === value : pattern.test(value)))) {
                        styles.push(value);
                    }
                }
                if (styles.length) {
                    options.unusedStyles = styles;
                }
            }
            delete options.removeUnusedClasses;
            delete options.removeUnusedPseudoClasses;
        }
        const uri = File.findConfigUri(options);
        if (uri) {
            const commands = await this.fileHandler!.loadConfig(uri, options) as Undef<AssetCommand[]>;
            if (commands) {
                const documentHandler = (this.userSettings as UserResourceSettings).outputDocumentHandler;
                const paramMap = new Map<string, [RegExp, string]>();
                const replaceParams = (param: unknown): unknown => {
                    const type = typeof param;
                    if (param && (type === 'object' || type === 'string')) {
                        const current = type === 'object' ? JSON.stringify(param) : param as string;
                        let output = current;
                        for (const [pattern, value] of paramMap.values()) {
                            output = output.replace(pattern, (...capture: string[]) => {
                                const quote = capture[1];
                                if (quote) {
                                    return quote + value.replace(new RegExp(`(?:^${quote}|([^\\\\])${quote})`, 'g'), (...leading: string[]) => (leading[1] || '') + '\\' + quote) + quote;
                                }
                                return value;
                            });
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
                if (location.search) {
                    new URLSearchParams(location.search).forEach((value, key) => paramMap.set(key, [new RegExp(`(["'])?\\{\\{\\s*${escapePattern(key)}\\s*\\}\\}\\1`, 'g'), value]));
                }
                for (const item of commands) {
                    if (item.selector) {
                        const type = item.type;
                        let dataSrc: Null<DataSource> = isPlainObject(item.dataSource) ? item.dataSource : null,
                            dataCloud: Null<DataSource> = isPlainObject(item.cloudDatabase) ? item.cloudDatabase : null;
                        if (paramMap.size) {
                            const checkValues = (data: Null<DataSource>) => {
                                if (data) {
                                    for (const attr in data) {
                                        if (attr !== 'value') {
                                            data[attr] = replaceParams(data[attr]);
                                        }
                                    }
                                }
                            };
                            checkValues(dataSrc);
                            checkValues(dataCloud);
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
            const elements = document.querySelectorAll('*');
            const cache: SelectorCache = {};
            const items = options.dataSource ||= [];
            for (const [element, data] of dataSource) {
                const node = File.createTagNode(element, elements, cache);
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