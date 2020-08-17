import { RESERVED_JAVA } from './lib/constant';

type View = android.base.View;

const { findColorShade, parseColor } = squared.lib.color;
const { extractURL, getSrcSet } = squared.lib.css;
const { FILE } = squared.lib.regex;
const { fromLastIndexOf, hasMimeType, isNumber, isPlainObject, isString, resolvePath, trimString } = squared.lib.util;

const STORED = squared.base.ResourceUI.STORED as AndroidResourceStoredMap;

const REGEXP_STRINGNAME = /(\\[nt]|<\/?[A-Za-z]+>|&#?[A-Za-z\d]{2,};)/g;
const REGEXP_STRINGWORD = /[^A-Za-z\d]+/g;
const CACHE_IMAGE = new Map<string, string>();

let COUNTER_UUID = 0;
let COUNTER_SYMBOL = 0;

function formatObject(obj: ObjectMap<Undef<string | StringMap>>, numberAlias?: boolean) {
    for (const attr in obj) {
        if (isPlainObject(obj[attr])) {
            formatObject(obj, numberAlias);
        }
        else {
            const value = obj[attr];
            if (isString(value)) {
                switch (attr) {
                    case 'text':
                        if (!value.startsWith('@string/')) {
                            obj[attr] = Resource.addString(value, '', numberAlias);
                        }
                        break;
                    case 'src':
                    case 'srcCompat':
                        if (FILE.PROTOCOL.test(value)) {
                            const src = Resource.addImage({ mdpi: value });
                            if (src !== '') {
                                obj[attr] = `@drawable/${src}`;
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
    public static formatOptions(options: ViewAttribute, numberAlias?: boolean) {
        for (const namespace in options) {
            const obj: StandardMap = options[namespace];
            if (isPlainObject<StandardMap>(obj)) {
                formatObject(obj, numberAlias);
            }
        }
        return options;
    }

    public static formatName(value: string) {
        return (/^\d/.test(value) ? '__' : '') + value.replace(/[^\w]+/g, '_');
    }

    public static addTheme(theme: StyleAttribute) {
        const themes = STORED.themes;
        const { items, output } = theme;
        let path = 'res/values',
            file = 'themes.xml',
            name = theme.name,
            appTheme = '';
        if (output) {
            if (output.path) {
                path = trimString(output.path.trim().replace(/\\/g, '/'), '/');
            }
            if (output.file) {
                file = trimString(output.file.trim().replace(/\\/g, '/'), '/');
            }
        }
        const filename = `${path}/${file}`;
        const storedFile = themes.get(filename) || new Map<string, StyleAttribute>();
        if (name === '' || name[0] === '.') {
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
        name = appTheme + (name[0] === '.' ? name : '');
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

    public static addString(value: string, name?: string, numberAlias?: boolean) {
        if (value) {
            const numeric = isNumber(value);
            if (!numeric || numberAlias) {
                const strings = STORED.strings;
                for (const [resourceName, resourceValue] of strings.entries()) {
                    if (resourceValue === value) {
                        return `@string/${resourceName}`;
                    }
                }
                const partial =
                    trimString(
                        (name || (value.length > 64 ? value.substring(0, 64) : value))
                            .replace(REGEXP_STRINGNAME, '_')
                            .replace(REGEXP_STRINGWORD, '_'),
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
                    name = '__symbol' + ++COUNTER_SYMBOL;
                }
                else if (numeric || /^\d/.test(name) || RESERVED_JAVA.has(name)) {
                    name = '__' + name;
                }
                if (strings.has(name)) {
                    name = Resource.generateId('string', name);
                }
                strings.set(name, value);
                return `@string/${name}`;
            }
        }
        return value;
    }

    public static addImage(images: StringMap, prefix = '', imageFormat?: MIMEOrAll) {
        const mdpi = images.mdpi;
        if (mdpi) {
            if (Object.keys(images).length === 1) {
                const asset = CACHE_IMAGE.get(mdpi);
                if (asset) {
                    return asset;
                }
            }
            const src = fromLastIndexOf(mdpi, '/');
            const ext = this.getExtension(src);
            const length = ext.length;
            if (!imageFormat || hasMimeType(imageFormat, ext) || length === 0) {
                const asset = Resource.insertStoredAsset('images', Resource.formatName(prefix + src.substring(0, src.length - (length > 0 ? length + 1 : 0))).toLowerCase(), images);
                CACHE_IMAGE.set(mdpi, asset);
                return asset;
            }
        }
        return '';
    }

    public static addColor(color: Undef<ColorData | string>, transparency?: boolean) {
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

    public readonly mapOfStored!: AndroidResourceStoredMap;

    private readonly _imageFormat?: MIMEOrAll;

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
            const imageFormat = mimeType.slice(0);
            imageFormat.splice(imageFormat.findIndex(value => value === 'image/svg+xml'), 1);
            this._imageFormat = imageFormat;
        }
    }

    public reset() {
        CACHE_IMAGE.clear();
        COUNTER_UUID = 0;
        COUNTER_SYMBOL = 0;
        super.reset();
    }

    public addImageSrc(element: HTMLImageElement | string, prefix = '', imageSet?: ImageSrcSet[]) {
        const result: StringMap = {};
        let mdpi: Undef<string>;
        if (typeof element === 'string') {
            mdpi = extractURL(element);
            if (mdpi && !mdpi.startsWith('data:image/')) {
                return this.addImageSet({ mdpi: resolvePath(mdpi) }, prefix);
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
            const rawData = this.getRawData(mdpi);
            if (rawData) {
                if (rawData.base64) {
                    const filename = rawData.filename;
                    this.writeRawImage({
                        mimeType: rawData.mimeType,
                        filename: prefix + filename,
                        data: rawData.base64,
                        encoding: 'base64'
                    });
                    return filename.substring(0, filename.lastIndexOf('.'));
                }
                return '';
            }
            result.mdpi = mdpi;
        }
        return this.addImageSet(result, prefix);
    }

    public addImageSet(images: StringMap, prefix?: string) {
        return Resource.addImage(images, prefix, this._imageFormat);
    }

    public writeRawImage(options: RawDataOptions) {
        const asset = super.writeRawImage(options);
        if (asset && this.userSettings.compressImages && Resource.canCompressImage(options.filename || '', options.mimeType)) {
            (asset.compress || (asset.compress = [])).unshift({ format: 'png' });
        }
        return asset;
    }

    get userSettings() {
        return this.application.userSettings;
    }

    get randomUUID() {
        return '__' + (++COUNTER_UUID).toString().padStart(5, '0');
    }
}