import { ResourceStoredMapAndroid, StyleAttribute } from '../../@types/android/application';

import { RESERVED_JAVA } from './lib/constant';

const {
    color: $color,
    css: $css,
    regex: $regex,
    util: $util
} = squared.lib;

const STORED = <ResourceStoredMapAndroid> squared.base.ResourceUI.STORED;
const REGEXP_NONWORD = /[^\w+]/g;
let IMAGE_FORMAT!: string[];

function formatObject(obj: {}, numberAlias = false) {
    if (obj) {
        for (const attr in obj) {
            if ($util.isPlainObject(obj[attr])) {
                formatObject(obj, numberAlias);
            }
            else {
                let value = obj[attr].toString();
                switch (attr) {
                    case 'text':
                        if (!value.startsWith('@string/')) {
                            value = Resource.addString(value, '', numberAlias);
                            if (value !== '') {
                                obj[attr] = `@string/${value}`;
                                continue;
                            }
                        }
                        break;
                    case 'src':
                    case 'srcCompat':
                        if ($regex.COMPONENT.PROTOCOL.test(value)) {
                            value = Resource.addImage({ mdpi: value });
                            if (value !== '') {
                                obj[attr] = `@drawable/${value}`;
                                continue;
                            }
                        }
                        break;
                }
                const color = $color.parseColor(value);
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

export default class Resource<T extends android.base.View> extends squared.base.ResourceUI<T> implements android.base.Resource<T> {
    public static formatOptions(options: ExternalData, numberAlias = false) {
        for (const namespace in options) {
            const obj: ExternalData = options[namespace];
            if ($util.isPlainObject(obj)) {
                formatObject(obj, numberAlias);
            }
        }
        return options;
    }

    public static formatName(value: string) {
        if ($regex.CHAR.LEADINGNUMBER.test(value)) {
            value = '__' + value;
        }
        return value.replace(REGEXP_NONWORD, '_');
    }

    public static addTheme(...values: StyleAttribute[]) {
        for (const theme of values) {
            const path = theme.output && $util.isString(theme.output.path) ? theme.output.path.trim() : 'res/values';
            const file = theme.output && $util.isString(theme.output.file) ? theme.output.file.trim() : 'themes.xml';
            const filename = `${$util.trimString(path.trim(), '/')}/${$util.trimString(file.trim(), '/')}`;
            const storedFile = STORED.themes.get(filename) || new Map<string, StyleAttribute>();
            let appTheme = '';
            if (theme.name === '' || theme.name.charAt(0) === '.') {
                found: {
                    for (const data of STORED.themes.values()) {
                        for (const style of data.values()) {
                            if (style.name) {
                                appTheme = style.name;
                                break found;
                            }
                        }
                    }
                }
                if (appTheme === '') {
                    continue;
                }
            }
            else {
                appTheme = theme.name;
            }
            theme.name = appTheme + (theme.name.charAt(0) === '.' ? theme.name : '');
            Resource.formatOptions(theme.items);
            const storedTheme = <StyleAttribute> storedFile.get(theme.name);
            if (storedTheme) {
                for (const attr in theme.items) {
                    storedTheme.items[attr] = theme.items[attr];
                }
            }
            else {
                storedFile.set(theme.name, theme);
            }
            STORED.themes.set(filename, storedFile);
        }
    }

    public static addString(value: string, name = '', numberAlias = false) {
        if (value !== '') {
            if (name === '') {
                name = value.trim();
            }
            const numeric = $util.isNumber(value);
            if (!numeric || numberAlias) {
                for (const [resourceName, resourceValue] of STORED.strings.entries()) {
                    if (resourceValue === value) {
                        return resourceName;
                    }
                }
                const partial = $util.trimString(name.replace($regex.XML.NONWORD_G, '_'), '_').split(/_+/);
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
                if (numeric || $regex.CHAR.LEADINGNUMBER.test(name) || RESERVED_JAVA.includes(name)) {
                    name = `__${name}`;
                }
                else if (name === '') {
                    name = `__symbol${Math.ceil(Math.random() * 100000)}`;
                }
                if (STORED.strings.has(name)) {
                    name = Resource.generateId('string', name);
                }
                STORED.strings.set(name, value);
            }
            return name;
        }
        return '';
    }

    public static addImage(images: StringMap, prefix = '') {
        if (images.mdpi) {
            const src = $util.fromLastIndexOf(images.mdpi, '/');
            const format = $util.fromLastIndexOf(src, '.').toLowerCase();
            if (format !== 'svg' && IMAGE_FORMAT.includes(format)) {
                return Resource.insertStoredAsset('images', Resource.formatName(prefix + src.substring(0, src.length - format.length - 1)), images);
            }
        }
        return '';
    }

    public static addColor(color: ColorData | string | undefined, transparency = false) {
        if (typeof color === 'string') {
            color = $color.parseColor(color, undefined, transparency);
        }
        if (color && (!color.transparent || transparency)) {
            const keyName = color.semiopaque || color.transparent ? color.valueAsARGB : color.value;
            let colorName = STORED.colors.get(keyName);
            if (colorName) {
                return colorName;
            }
            const shade = $color.findColorShade(color.value);
            if (shade) {
                colorName = keyName === shade.value ? shade.key : Resource.generateId('color', shade.key);
                STORED.colors.set(keyName, colorName);
                return colorName;
            }
        }
        return '';
    }

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
        IMAGE_FORMAT = application.controllerHandler.localSettings.supported.imageFormat as string[];
    }

    public addImageSrc(element: HTMLImageElement | string, prefix = '', imageSet?: ImageSrcSet[]) {
        const result: StringMap = {};
        if (typeof element === 'string') {
            const match = $regex.CSS.URL.exec(element);
            if (match) {
                if (match[1].startsWith('data:image')) {
                    result.mdpi = match[1];
                }
                else {
                    return Resource.addImage({ mdpi: $util.resolvePath(match[1]) }, prefix);
                }
            }
        }
        else {
            if (element.srcset) {
                if (imageSet === undefined) {
                    imageSet = $css.getSrcSet(element, IMAGE_FORMAT);
                }
                for (const image of imageSet) {
                    const pixelRatio = image.pixelRatio;
                    if (pixelRatio > 0) {
                        const src = image.src;
                        if (pixelRatio < 1) {
                            result.ldpi = src;
                        }
                        else if (pixelRatio === 1) {
                            if (result.mdpi === undefined || image.actualWidth) {
                                result.mdpi = src;
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
            if (result.mdpi === undefined) {
                result.mdpi = element.src;
            }
        }
        if (result.mdpi) {
            const resource = this.application.resourceHandler;
            const rawData = resource.getRawData(result.mdpi);
            if (rawData && rawData.base64) {
                if (rawData.filename.toLowerCase().endsWith('.svg')) {
                    return '';
                }
                const filename = prefix + rawData.filename;
                resource.writeRawImage(filename, rawData.base64);
                return filename.substring(0, filename.lastIndexOf('.'));
            }
        }
        return Resource.addImage(result, prefix);
    }

    get userSettings() {
        return this.application.userSettings;
    }
}