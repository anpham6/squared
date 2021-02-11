import { RESERVED_JAVA } from './lib/constant';

import type Application from './application';
import type View from './view';

import { concatString, parseColor } from './lib/util';

const { PROTOCOL } = squared.lib.regex.FILE;

const { extractURL, getSrcSet } = squared.lib.css;
const { endsWith, fromLastIndexOf, isNumber, isPlainObject, isString, padStart, resolvePath, splitPairStart, startsWith, trimString } = squared.lib.util;

const REGEXP_STRINGNAME = /(?:\\n|<\/?[A-Za-z]+>|&#?[A-Za-z\d]+;)/g;
const REGEXP_STRINGWORD = /[^A-Za-z\d]+/g;

let CACHE_IMAGE: StringMap = {};
let COUNTER_UUID = 0;
let COUNTER_SYMBOL = 0;

function formatObject(resourceId: number, obj: ObjectMap<Undef<string | StringMap>>, numberAlias?: boolean) {
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
    const n = value.charCodeAt(0);
    return n >= 48 && n <= 57;
}

export default class Resource<T extends View> extends squared.base.ResourceUI<T> implements android.base.Resource<T> {
    public static STORED: ResourceSessionStored<Required<ResourceStoredMap>>;

    public static formatOptions(resourceId: number, options: ViewAttribute, numberAlias?: boolean) {
        for (const namespace in options) {
            const obj: StandardMap = options[namespace];
            if (isPlainObject<StandardMap>(obj)) {
                formatObject(resourceId, obj, numberAlias);
            }
        }
        return options;
    }

    public static addTheme(resourceId: number, theme: ThemeAttribute) {
        const stored = this.STORED[resourceId];
        if (!stored) {
            return false;
        }
        const { items, output } = theme;
        let pathname = 'res/values',
            filename = 'themes.xml',
            name = theme.name,
            appTheme = '';
        if (output) {
            if (output.pathname) {
                pathname = trimString(output.pathname.replace(/\\/g, '/'), '/');
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
            const numeric = isNumber(value);
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
                    name = '__symbol' + ++COUNTER_SYMBOL;
                }
                else {
                    name = name.toLowerCase();
                    if (numeric || isLeadingDigit(name) || RESERVED_JAVA.includes(name)) {
                        name = '__' + name;
                    }
                }
                return `@string/${Resource.insertStoredAsset(resourceId, 'strings', name, value)}`;
            }
        }
        return value;
    }

    public static addImage(resourceId: number, images: StringMap, prefix = '', imageFormat?: MIMEOrAll) {
        const mdpi = images.mdpi;
        if (mdpi) {
            if (Object.keys(images).length === 1) {
                const asset = CACHE_IMAGE[mdpi];
                if (asset) {
                    return asset;
                }
            }
            const src = fromLastIndexOf(mdpi.split('?')[0], '/');
            const ext = this.getExtension(src);
            const length = ext.length;
            if (!imageFormat || Resource.hasMimeType(imageFormat, ext) || length === 0) {
                const name = Resource.formatName(prefix + src.substring(0, src.length - (length ? length + 1 : 0))).toLowerCase();
                const asset = Resource.insertStoredAsset(resourceId, 'images', (RESERVED_JAVA.includes(name) ? '_' : '') + name, images);
                CACHE_IMAGE[mdpi] = asset;
                return asset;
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
                colorName = stored.colors.get(keyName);
                if (colorName) {
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

    public static canCompressImage(filename: string, mimeType?: string) {
        return /\.(png|jpg|jpeg)$/i.test(filename) || endsWith(mimeType, 'png') || endsWith(mimeType, 'jpeg');
    }

    public static formatName(value: string) {
        return (isLeadingDigit(value) ? '__' : '') + value.replace(/[^\w]+/g, '_');
    }

    private readonly _imageFormat?: MIMEOrAll;

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

    public init(resourceId: number) {
        const data = Resource.STORED[resourceId] ||= {} as Required<ResourceStoredMap>;
        data.styles = new Map();
        data.themes = new Map();
        data.dimens = new Map();
        data.drawables = new Map();
        data.animators = new Map();
        super.init(resourceId);
    }

    public reset() {
        CACHE_IMAGE = {};
        COUNTER_UUID = 0;
        COUNTER_SYMBOL = 0;
        super.reset();
    }

    public addImageSrc(resourceId: number, element: HTMLImageElement | string, prefix = '', imageSet?: ImageSrcSet[]) {
        const result: StringMap = {};
        let mdpi: Undef<string>;
        if (typeof element === 'string') {
            mdpi = extractURL(element);
            if (mdpi && !startsWith(mdpi, 'data:image/')) {
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
            const image = this.getRawData(resourceId, mdpi);
            if (image) {
                const data = image.base64;
                if (data) {
                    const filename = image.filename;
                    this.writeRawImage(resourceId, {
                        mimeType: image.mimeType,
                        filename: prefix + filename,
                        data,
                        encoding: 'base64'
                    });
                    return splitPairStart(filename, '.', false, true);
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

    public writeRawImage(resourceId: number, options: RawDataOptions) {
        const asset = super.writeRawImage(resourceId, options);
        if (asset && this.userSettings.compressImages && Resource.canCompressImage(options.filename || '', options.mimeType)) {
            (asset.compress ||= []).unshift({ format: 'png' });
        }
        return asset;
    }

    get userSettings() {
        return this.application.userSettings;
    }

    get randomUUID() {
        return '__' + padStart((++COUNTER_UUID).toString(), 5, '0');
    }
}