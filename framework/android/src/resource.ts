import { RESERVED_JAVA } from './lib/constant';

import type Application from './application';
import type View from './view';

import { concatString, parseColor } from './lib/util';

const { PROTOCOL } = squared.lib.regex.FILE;

const { extractURL } = squared.lib.css;
const { isPlainObject, isString, padStart, replaceAll, resolvePath, splitPairStart, startsWith } = squared.lib.util;

const { getSrcSet } = squared.base.lib.dom;
const { getComponentEnd, trimString } = squared.base.lib.util;

const REGEXP_STRINGNAME = /\\n|<\/?[A-Za-z]+>|&#?[A-Za-z\d]+;/g;
const REGEXP_STRINGWORD = /[^A-Za-z\d]+/g;

let CACHE_IMAGE: ObjectMap<StringMap> = {};
let COUNTER_SYMBOL: number[] = [];

function formatObject(resourceId: number, obj: ObjectMap<string | StringMap>, numberAlias: boolean) {
    for (const attr in obj) {
        const value = obj[attr];
        if (isString(value)) {
            switch (attr) {
                case 'text':
                    if (!startsWith(value, '@string/')) {
                        obj[attr] = Resource.addString(resourceId, value, '', numberAlias);
                    }
                    break;
                case 'src':
                case 'srcCompat':
                    if (PROTOCOL.test(value)) {
                        const src = Resource.addImage(resourceId, { mdpi: value });
                        if (src) {
                            obj[attr] = `@drawable/${src}`;
                        }
                    }
                    break;
                default: {
                    const colorData = parseColor(value);
                    if (colorData) {
                        const colorName = Resource.addColor(resourceId, colorData);
                        if (colorName) {
                            obj[attr] = `@color/${colorName}`;
                        }
                    }
                }
            }
        }
        else if (isPlainObject(value)) {
            formatObject(resourceId, obj, numberAlias);
        }
    }
}

function isLeadingDigit(value: string) {
    const ch = value[0];
    return ch >= '0' && ch <= '9';
}

export default class Resource<T extends View> extends squared.base.ResourceUI<T> implements android.base.Resource<T> {
    public static STORED: ResourceSessionStored<Required<ResourceStoredMap>>;

    public static formatOptions(resourceId: number, options: ViewAttribute, numberAlias = false) {
        for (const namespace in options) {
            const obj = options[namespace];
            if (isPlainObject<StandardMap>(obj)) {
                formatObject(resourceId, obj, numberAlias);
            }
        }
        return options;
    }

    public static addTheme(resourceId: number, theme: ThemeAttribute, pathname = 'res/values') {
        const stored = this.STORED[resourceId];
        if (!stored) {
            return false;
        }
        const { items, output } = theme;
        let filename = 'themes.xml',
            name = theme.name,
            appTheme = '';
        if (output) {
            if (output.pathname) {
                pathname = trimString(replaceAll(output.pathname, '\\', '/'), '/');
            }
            if (output.filename) {
                filename = output.filename;
            }
        }
        const themes = stored.themes;
        const filepath = pathname + '/' + filename;
        const storedFile = themes.get(filepath) || new Map<string, ThemeAttribute>();
        if (!name || name[0] === '.') {
            found: {
                for (const data of themes.values()) {
                    for (const style of data.values()) {
                        if (style.name) {
                            appTheme = style.name;
                            break found;
                        }
                    }
                }
            }
            if (!appTheme) {
                return false;
            }
        }
        else {
            appTheme = name;
        }
        name = appTheme + (name[0] === '.' ? name : '');
        theme.name = name;
        Resource.formatOptions(resourceId, items as ViewAttribute);
        const storedTheme = storedFile.get(name);
        if (storedTheme) {
            const storedItems = storedTheme.items;
            for (const attr in items) {
                storedItems[attr] = items[attr];
            }
        }
        else {
            storedFile.set(name, theme);
        }
        themes.set(filepath, storedFile);
        return true;
    }

    public static addString(resourceId: number, value: string, name?: string, numberAlias?: boolean) {
        const stored = this.STORED[resourceId];
        if (stored && value) {
            const numeric = !isNaN(+value);
            if (!numeric || numberAlias) {
                for (const data of stored.strings) {
                    if (data[1] === value) {
                        return `@string/${data[0]}`;
                    }
                }
                if (!name) {
                    const partial = trimString(value.replace(REGEXP_STRINGNAME, '_').replace(REGEXP_STRINGWORD, '_'), '_').split(/_+/);
                    if (partial.length > 1) {
                        if (partial.length > 4) {
                            partial.length = 4;
                        }
                        name = concatString(partial, '_');
                    }
                    else {
                        name = partial[0];
                    }
                }
                if (!name) {
                    COUNTER_SYMBOL[resourceId] ??= 0;
                    name = '__symbol' + ++COUNTER_SYMBOL[resourceId];
                }
                else if (isLeadingDigit(name = name.toLowerCase()) || RESERVED_JAVA.includes(name)) {
                    name = '__' + name;
                }
                return `@string/${Resource.insertStoredAsset(resourceId, 'strings', name, value)}`;
            }
        }
        return value;
    }

    public static addImage(resourceId: number, images: StringMap, prefix = '', imageFormat?: MIMEOrAll) {
        const mdpi = images.mdpi;
        if (mdpi) {
            const imageData = CACHE_IMAGE[resourceId] ||= {};
            const imageCount = Object.keys(images).length;
            if (imageCount === 1) {
                const asset = imageData[mdpi];
                if (asset) {
                    return asset;
                }
            }
            const src = getComponentEnd(mdpi);
            const ext = this.getExtension(src);
            const length = ext.length;
            if (!imageFormat || Resource.hasMimeType(imageFormat, ext) || length === 0) {
                const name = Resource.formatName(prefix + src.substring(0, src.length - (length ? length + 1 : 0))).toLowerCase();
                const result = Resource.insertStoredAsset(resourceId, 'images', (RESERVED_JAVA.includes(name) ? '_' : '') + name, images);
                return imageCount === 1 ? imageData[mdpi] = result : result;
            }
        }
        return '';
    }

    public static addColor(resourceId: number, color: ColorData | string, transparency?: boolean) {
        if (typeof color === 'string') {
            const result = parseColor(color, 1, transparency);
            if (result) {
                color = result;
            }
            else {
                return '';
            }
        }
        if (!color.transparent || transparency) {
            const keyName = color.opacity < 1 ? color.valueAsARGB : color.value;
            const stored = this.STORED[resourceId];
            let colorName: Undef<string>;
            if (stored) {
                if (colorName = stored.colors.get(keyName)) {
                    return colorName;
                }
                if (color.key) {
                    stored.colors.set(keyName, color.key);
                    return color.key;
                }
            }
            colorName = Resource.generateId(resourceId, 'color', color.nearest.key);
            if (stored) {
                stored.colors.set(keyName, colorName);
            }
            return colorName;
        }
        return '';
    }

    public static formatName(value: string) {
        return (isLeadingDigit(value) ? '__' : '') + value.replace(/[^\w]+/g, '_');
    }

    private _fontProvider: ObjectMap<FontProvider> = {};
    private _imageFormat?: MIMEOrAll;
    private _counterFilename = 0;

    constructor(
        public application: Application<T>,
        public cache: squared.base.NodeList<T>)
    {
        super();
        const mimeType = this.controllerSettings.mimeType.image;
        if (mimeType !== '*') {
            this._imageFormat = mimeType.filter(value => value !== 'image/svg+xml');
        }
    }

    public createThread(resourceId: number) {
        const data = Resource.STORED[resourceId] ||= {} as Required<ResourceStoredMap>;
        data.styles = new Map();
        data.themes = new Map();
        data.dimens = new Map();
        data.drawables = new Map();
        data.animators = new Map();
        super.createThread(resourceId);
    }

    public clear() {
        CACHE_IMAGE = {};
        COUNTER_SYMBOL = [];
        super.clear();
    }

    public addImageSrc(resourceId: number, element: HTMLImageElement | string, prefix = '', imageSet?: ImageSrcData[]) {
        const result: StringMap = {};
        let mdpi: Undef<string>;
        if (typeof element === 'string') {
            if ((mdpi = extractURL(element)) && !startsWith(mdpi, 'data:image/')) {
                return this.addImageSet(resourceId, { mdpi: resolvePath(mdpi) }, prefix);
            }
        }
        else {
            if (!imageSet && isString(element.srcset)) {
                imageSet = getSrcSet(element, this._imageFormat);
            }
            if (imageSet) {
                for (let i = 0, length = imageSet.length; i < length; ++i) {
                    const image = imageSet[i];
                    const pixelRatio = image.pixelRatio;
                    if (pixelRatio) {
                        const src = image.src;
                        if (pixelRatio < 1) {
                            result.ldpi = src;
                        }
                        else if (pixelRatio === 1) {
                            if (!mdpi || image.actualWidth) {
                                mdpi = src;
                            }
                        }
                        else if (pixelRatio <= 1.5) {
                            result.hdpi = src;
                        }
                        else if (pixelRatio <= 2) {
                            result.xhdpi = src;
                        }
                        else if (pixelRatio <= 3) {
                            result.xxhdpi = src;
                        }
                        else {
                            result.xxxhdpi = src;
                        }
                    }
                }
            }
            mdpi ||= element.src;
        }
        if (mdpi) {
            let image = this.getRawData(resourceId, mdpi);
            if (image) {
                if (image.base64 && image.mimeType !== 'image/svg+xml' && (image = this.writeRawImage(resourceId, prefix + image.filename, image))) {
                    return splitPairStart(image.filename, '.', false, true);
                }
                return '';
            }
            result.mdpi = mdpi;
        }
        return this.addImageSet(resourceId, result, prefix);
    }

    public addImageSet(resourceId: number, images: StringMap, prefix?: string) {
        return Resource.addImage(resourceId, images, prefix, this._imageFormat);
    }

    public addFontProvider(authority: string, packageName: string, certs: string[], webFonts: string | PlainObject, verified?: boolean): Void<Promise<boolean>> {
        const setFont = (fonts: Undef<FontProviderFonts>) => {
            if (fonts) {
                this._fontProvider[authority] = { authority, package: packageName, certs, fonts };
                return true;
            }
            return false;
        };
        if (typeof webFonts === 'string') {
            return fetch(webFonts)
                .then(async res => {
                    const result: unknown = await res.json();
                    return isPlainObject(result) && setFont(this.parseWebFonts(result));
                })
                .catch(err => {
                    this.errorWebFonts(err);
                    return false;
                });
        }
        return Promise.resolve(setFont(!verified ? this.parseWebFonts(webFonts) : webFonts as FontProviderFonts));
    }

    public assignFilename(uri: string, mimeType?: string, ext = 'unknown') {
        return '__' + padStart((++this._counterFilename).toString(), 5, '0') + '.' + ext;
    }

    private parseWebFonts(value: PlainObject) {
        try {
            if (value.kind === 'webfonts#webfontList' && Array.isArray(value.items)) {
                const fonts: FontProviderFonts = {};
                for (const { family, variants } of value.items as WebFont[]) {
                    const normal: string[] = [];
                    const italic: string[] = [];
                    const width = family.endsWith('Expanded') ? '125' : family.endsWith('Condensed') ? '75' : '';
                    for (const weight of variants) {
                        if (weight === 'regular') {
                            normal.push('400');
                        }
                        else if (weight === 'italic') {
                            italic.push('400');
                        }
                        else if (weight.endsWith('italic')) {
                            italic.push(weight.substring(0, 3));
                        }
                        else {
                            normal.push(weight);
                        }
                    }
                    const font: FontProviderFontsStyle = {};
                    if (normal.length) {
                        font.normal = normal;
                    }
                    if (italic.length) {
                        font.italic = italic;
                    }
                    if (width) {
                        font.width = width;
                    }
                    fonts[family] = font;
                }
                return fonts;
            }
        }
        catch (err) {
            this.errorWebFonts(err);
        }
    }

    private errorWebFonts(err: unknown) {
        this.application.writeError(err instanceof Error ? err.message : err as string, 'FAIL: Unknown WebFont');
    }

    get fontProvider() {
        return this._fontProvider;
    }
}