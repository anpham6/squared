import type Extension from './extension';

import File from './file';

const { UNABLE_TO_FINALIZE_DOCUMENT, reject } = squared.lib.error;
const { isPlainObject } = squared.lib.util;

export default class Application<T extends squared.base.Node> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public userSettings!: UserResourceSettings;
    public builtInExtensions!: Map<string, Extension<T>>;
    public readonly session!: chrome.base.AppSession<T>;
    public readonly extensions: Extension<T>[] = [];
    public readonly systemName = 'chrome';

    public init() {
        this.session.unusedStyles = new Set<string>();
    }

    public reset() {
        this.session.unusedStyles.clear();
        super.reset();
    }

    public insertNode(processing: squared.base.AppProcessing<T>, element: Element) {
        if (element.nodeName[0] === '#') {
            if (this.userSettings.excludePlainText) {
                return;
            }
            this.controllerHandler.applyDefaultStyles(element, processing.sessionId);
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
        this.reset();
        if (!this.parseDocumentSync()) {
            return reject(UNABLE_TO_FINALIZE_DOCUMENT);
        }
        options = !isPlainObject(options) ? {} : { ...options };
        options.saveAsWebPage = true;
        if (options.removeUnusedStyles) {
            const unusedStyles = Array.from(this.session.unusedStyles);
            if (unusedStyles.length) {
                options.unusedStyles = options.unusedStyles ? Array.from(new Set(options.unusedStyles.concat(unusedStyles))) : unusedStyles;
            }
        }
        if (options.configUri) {
            const config = await this.fileHandler!.loadData(options.configUri, { type: 'json', cache: options.cache }) as Null<ResponseData>;
            if (config) {
                if (config.success && Array.isArray(config.data)) {
                    const documentHandler = this.userSettings.outputDocumentHandler;
                    const assetMap = options.assetMap ||= new Map<Element, AssetCommand>();
                    const database: [Element, CloudDatabase][] = [];
                    const paramMap = new Map<string, [RegExp, string]>();
                    const replaceParams = (param: Undef<any>): unknown => {
                        if (param) {
                            if (typeof param !== 'number' && typeof param !== 'boolean') {
                                const original = param;
                                const converted = typeof param === 'object' || Array.isArray(param);
                                if (converted) {
                                    param = JSON.stringify(param);
                                }
                                const current = param;
                                for (const [pattern, value] of paramMap.values()) {
                                    param = (param as string).replace(pattern, value);
                                }
                                if (current === param) {
                                    return original;
                                }
                                if (converted) {
                                    try {
                                        return JSON.parse(param);
                                    }
                                    catch {
                                        return original;
                                    }
                                }
                            }
                        }
                        return param;
                    };
                    if (location.href.includes('?')) {
                        new URLSearchParams(location.search).forEach((value, key) => paramMap.set(key, [new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value]));
                    }
                    for (const item of config.data as AssetCommand[]) {
                        if (item.selector) {
                            const cloudDatabase = item.cloudDatabase;
                            if (cloudDatabase && paramMap.size) {
                                for (const attr in cloudDatabase) {
                                    if (attr !== 'value') {
                                        cloudDatabase[attr] = replaceParams(cloudDatabase[attr]);
                                    }
                                }
                            }
                            document.querySelectorAll(item.selector).forEach(element => {
                                switch (item.type) {
                                    case 'text':
                                    case 'attribute':
                                        if (cloudDatabase) {
                                            database.push([element, { document: documentHandler, ...cloudDatabase }]);
                                        }
                                        break;
                                    default:
                                        assetMap.set(element, item);
                                        break;
                                }
                            });
                        }
                    }
                    if (assetMap.size === 0) {
                        delete options.assetMap;
                    }
                    else {
                        for (const [element, data] of assetMap) {
                            File.setElementData(element, data);
                        }
                    }
                    if (database.length) {
                        for (let i = 0, length = database.length; i < length; ++i) {
                            const [element, data] = database[i];
                            File.setElementData(element, data);
                        }
                        const items = database.map(item => item[1]);
                        if (options.database) {
                            options.database.push(...items);
                        }
                        else {
                            options.database = items;
                        }
                    }
                }
                else {
                    const error = config.error;
                    if (error) {
                        this.writeError(error.message, error.hint);
                    }
                }
            }
        }
        return (this.fileHandler as chrome.base.File<T>)[module](pathname, options);
    }

    get initializing() {
        return false;
    }

    get length() {
        return 1;
    }
}