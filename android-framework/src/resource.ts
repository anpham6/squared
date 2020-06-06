import { RESERVED_JAVA } from './lib/constant';

type View = android.base.View;

const { findColorShade, parseColor } = squared.lib.color;
const { extractURL, getSrcSet } = squared.lib.css;
const { FILE } = squared.lib.regex;
const { fromLastIndexOf, hasMimeType, isNumber, isPlainObject, isString, resolvePath, safeNestedArray, spliceArray, trimString } = squared.lib.util;

const STORED = squared.base.ResourceUI.STORED as AndroidResourceStoredMap;

let CACHE_IMAGE: StringMap = {};

function formatObject(obj: {}, numberAlias = false) {
    for (const attr in obj) {
        if (isPlainObject(obj[attr])) {
            formatObject(obj, numberAlias);
        }
        else {
            let value: string = obj[attr]?.toString();
            if (value) {
                switch (attr) {
                    case 'text':
                        if (!value.startsWith('@string/')) {
                            obj[attr] =  Resource.addString(value, '', numberAlias);
                        }
                        break;
                    case 'src':
                    case 'srcCompat':
                        if (FILE.PROTOCOL.test(value)) {
                            value = Resource.addImage({ mdpi: value });
                            if (value !== '') {
                                obj[attr] = `@drawable/${value}`;
                            }
                        }
                        break;
                    default: {
                        const color = parseColor(value);
                        if (color) {
                            const colorName = Resource.addColor(color);
                            if (colorName !== '') {
                                obj[attr] = `@color/${colorName}`;
                            }
                        }
                    }
                }
            }
        }
    }
}

export default class Resource<T extends View> extends squared.base.ResourceUI<T> implements android.base.Resource<T> {
    private static UUID_COUNTER = 0;
    private static SYMBOL_COUNTER = 0;

    public static formatOptions(options: ViewAttribute, numberAlias = false) {
        for (const namespace in options) {
            const obj: StandardMap = options[namespace];
            if (isPlainObject(obj)) {
                formatObject(obj, numberAlias);
            }
        }
        return options;
    }

    public static formatName(value: string) {
        if (/^\d/.test(value)) {
            value = '__' + value;
        }
        return value.replace(/[^\w]+/g, '_');
    }

    public static addTheme(theme: StyleAttribute) {
        const themes = STORED.themes;
        const { items, output } = theme;
        let path = 'res/values',
            file = 'themes.xml',
            name = theme.name,
            appTheme = '';
        if (output) {
            if (isString(output.path)) {
                path = trimString(output.path.trim().replace(/\\/g, '/'), '/');
            }
            if (isString(output.file)) {
                file = trimString(output.file.trim().replace(/\\/g, '/'), '/');
            }
        }
        const filename = path + '/' + file;
        const storedFile = themes.get(filename) || new Map<string, StyleAttribute>();
        if (name === '' || name.charAt(0) === '.') {
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
            if (appTheme === '') {
                return false;
            }
        }
        else {
            appTheme = name;
        }
        name = appTheme + (name.charAt(0) === '.' ? name : '');
        theme.name = name;
        Resource.formatOptions(items as ViewAttribute);
        const storedTheme = storedFile.get(name) as StyleAttribute;
        if (storedTheme) {
            const storedItems = storedTheme.items;
            for (const attr in items) {
                storedItems[attr] = items[attr];
            }
        }
        else {
            storedFile.set(name, theme);
        }
        themes.set(filename, storedFile);
        return true;
    }

    public static addString(value: string, name?: string, numberAlias = false) {
        if (value !== '') {
            const numeric = isNumber(value);
            if (!numeric || numberAlias) {
                const strings = STORED.strings;
                for (const [resourceName, resourceValue] of strings.entries()) {
                    if (resourceValue === value) {
                        return '@string/' + resourceName;
                    }
                }
                const partial =
                    trimString(
                        (name || (value.length > 64 ? value.substring(0, 64) : value))
                            .replace(/(\\[nt]|<\/?[a-z]+>|&#?[A-Za-z\d]{2,};)/g, '_')
                            .replace(/[^A-Za-z\d]+/g, '_'),
                        '_'
                    )
                    .split(/_+/);
                if (partial.length > 1) {
                    if (partial.length > 4) {
                        partial.length = 4;
                    }
                    name = partial.join('_');
                }
                else {
                    name = partial[0];
                }
                name = name.toLowerCase();
                if (!name) {
                    name = `__symbol${++Resource.SYMBOL_COUNTER}`;
                }
                else if (numeric || /^\d/.test(name) || RESERVED_JAVA.includes(name)) {
                    name = `__${name}`;
                }
                if (strings.has(name)) {
                    name = Resource.generateId('string', name);
                }
                strings.set(name, value);
                return '@string/' + name;
            }
        }
        return value;
    }

    public static addImage(images: StringMap, prefix = '', imageFormat?: MIMEOrAll) {
        const mdpi = images.mdpi;
        if (mdpi) {
            if (Object.keys(images).length === 1) {
                const asset = CACHE_IMAGE[mdpi];
                if (asset) {
                    return asset;
                }
            }
            const src = fromLastIndexOf(mdpi, '/');
            const ext = this.getExtension(src);
            const length = ext.length;
            if (!imageFormat || length === 0 || hasMimeType(imageFormat, ext)) {
                const asset = Resource.insertStoredAsset('images', Resource.formatName(prefix + src.substring(0, src.length - (length > 0 ? length + 1 : 0))).toLowerCase(), images);
                CACHE_IMAGE[mdpi] = asset;
                return asset;
            }
        }
        return '';
    }

    public static addColor(color: Undef<ColorData | string>, transparency = false) {
        if (typeof color === 'string') {
            color = parseColor(color, 1, transparency);
        }
        if (color && (!color.transparent || transparency)) {
            const keyName = color.opacity < 1 ? color.valueAsARGB : color.value;
            let colorName = STORED.colors.get(keyName);
            if (colorName) {
                return colorName;
            }
            const shade = findColorShade(color.value);
            if (shade) {
                colorName = keyName === shade.value ? shade.key : Resource.generateId('color', shade.key);
                STORED.colors.set(keyName, colorName);
                return colorName;
            }
        }
        return '';
    }

    private readonly _imageFormat?: string[];

    constructor(
        public application: android.base.Application<T>,
        public cache: squared.base.NodeList<T>)
    {
        super();
        STORED.styles = new Map();
        STORED.themes = new Map();
        STORED.dimens = new Map();
        STORED.drawables = new Map();
        STORED.animators = new Map();
        const mimeType = this.controllerSettings.mimeType.image;
        if (mimeType !== '*') {
            this._imageFormat = spliceArray(mimeType.slice(0), value => value === 'image/svg+xml');
        }
    }

    public reset() {
        super.reset();
        CACHE_IMAGE = {};
        Resource.UUID_COUNTER = 0;
        Resource.SYMBOL_COUNTER = 0;
    }

    public addImageSrc(element: HTMLImageElement | string, prefix = '', imageSet?: ImageSrcSet[]) {
        const result: StringMap = {};
        let mdpi: Undef<string>;
        if (typeof element === 'string') {
            mdpi = extractURL(element);
            if (mdpi !== '' && !mdpi.startsWith('data:image/')) {
                return this.addImageSet({ mdpi: resolvePath(mdpi) }, prefix);
            }
        }
        else {
            if (imageSet === undefined && isString(element.srcset)) {
                imageSet = getSrcSet(element, this._imageFormat);
            }
            if (imageSet) {
                for (const image of imageSet) {
                    const pixelRatio = image.pixelRatio;
                    if (pixelRatio > 0) {
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
            if (!mdpi) {
                mdpi = element.src;
            }
        }
        if (mdpi) {
            const resource = this.application.resourceHandler;
            result.mdpi = mdpi;
            const rawData = resource.getRawData(mdpi);
            if (rawData) {
                if (rawData.base64) {
                    const filename = rawData.filename;
                    if (FILE.SVG.test(filename)) {
                        return '';
                    }
                    resource.writeRawImage(prefix + filename, rawData.base64);
                    return filename.substring(0, filename.lastIndexOf('.'));
                }
            }
        }
        return this.addImageSet(result, prefix);
    }

    public addImageSet(images: StringMap, prefix?: string) {
        return Resource.addImage(images, prefix, this._imageFormat);
    }

    public writeRawImage(filename: string, base64: string) {
        const asset = super.writeRawImage(filename, base64);
        if (asset && this.userSettings.compressImages && Resource.canCompressImage(filename)) {
            safeNestedArray(asset as StandardMap, 'compress').unshift({ format: 'png' });
        }
        return asset;
    }

    get userSettings() {
        return this.application.userSettings;
    }

    get randomUUID() {
        return '__' + (++Resource.UUID_COUNTER).toString().padStart(5, '0');
    }
}