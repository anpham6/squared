import type Extension from './extension';

const { UNABLE_TO_FINALIZE_DOCUMENT, reject } = squared.lib.error;
const { isPlainObject } = squared.lib.util;

export default class Application<T extends squared.base.Node> extends squared.base.Application<T> implements chrome.base.Application<T> {
    public userSettings!: UserResourceSettings;
    public builtInExtensions!: Map<string, Extension<T>>;
    public readonly extensions: Extension<T>[] = [];
    public readonly systemName = 'chrome';

    public init() {
        this.session.unusedStyles = new Set<string>();
    }

    public reset() {
        this.session.unusedStyles!.clear();
        super.reset();
    }

    public insertNode(element: Element, sessionId: string) {
        if (element.nodeName[0] === '#') {
            if (this.userSettings.excludePlainText) {
                return;
            }
            this.controllerHandler.applyDefaultStyles(element, sessionId);
        }
        return this.createNode(sessionId, { element });
    }

    public saveAs(filename?: string, options?: IFileArchivingOptions) {
        return this.processAssets('saveAs', filename || this.userSettings.outputArchiveName, options);
    }

    public copyTo(directory: string, options?: IFileArchivingOptions) {
        return this.processAssets('copyTo', directory, options);
    }

    public appendTo(pathname: string, options?: IFileArchivingOptions) {
        return this.processAssets('appendTo', pathname, options);
    }

    private processAssets(module: "saveAs" | "copyTo" | "appendTo", pathname: string, options?: IFileArchivingOptions) {
        options = !isPlainObject(options) ? {} : { ...options };
        options.saveAsWebPage = true;
        this.reset();
        const result = this.parseDocumentSync();
        if (!result) {
            return reject(UNABLE_TO_FINALIZE_DOCUMENT);
        }
        if (options.removeUnusedStyles) {
            const unusedStyles = Array.from(this.session.unusedStyles!);
            if (unusedStyles.length) {
                options.unusedStyles = options.unusedStyles ? Array.from(new Set(options.unusedStyles.concat(unusedStyles))) : unusedStyles;
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