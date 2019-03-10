import { ResourceStoredMapAndroid, StyleAttribute, UserSettingsAndroid } from './@types/application';

import View from './view';

import { RESERVED_JAVA } from './lib/constant';

const $Resource = squared.base.Resource;
const $color = squared.lib.color;
const $css = squared.lib.css;
const $util = squared.lib.util;

const STORED = <ResourceStoredMapAndroid> $Resource.STORED;

export default class Resource<T extends View> extends squared.base.Resource<T> implements android.base.Resource<T> {
    public static formatOptions(options: ExternalData, numberAlias = false) {
        for (const namespace in options) {
            if (options.hasOwnProperty(namespace)) {
                const obj: ExternalData = options[namespace];
                if (typeof obj === 'object') {
                    for (const attr in obj) {
                        let value = obj[attr].toString();
                        switch (attr) {
                            case 'text':
                                if (!value.startsWith('@string/')) {
                                    value = this.addString(value, '', numberAlias);
                                    if (value !== '') {
                                        obj[attr] = `@string/${value}`;
                                        continue;
                                    }
                                }
                                break;
                            case 'src':
                            case 'srcCompat':
                                if ($util.REGEXP_COMPILED.URI.test(value)) {
                                    value = this.addImage({ mdpi: value });
                                    if (value !== '') {
                                        obj[attr] = `@drawable/${value}`;
                                        continue;
                                    }
                                }
                                break;
                        }
                        const color = $color.parseColor(value);
                        if (color) {
                            const colorValue = this.addColor(color);
                            if (colorValue !== '') {
                                obj[attr] = `@color/${colorValue}`;
                            }
                        }
                    }
                }
            }
        }
        return options;
    }

    public static addTheme(...values: Required<StyleAttribute>[]) {
        for (const theme of values) {
            const path = $util.isString(theme.output.path) ? theme.output.path : '';
            const file = $util.isString(theme.output.file) ? theme.output.file : 'themes.xml';
            const filename = `${$util.trimString(path.trim(), '/')}/${$util.trimString(file.trim(), '/')}`;
            const stored = STORED.themes.get(filename) || new Map<string, StyleAttribute>();
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
                    appTheme = 'AppTheme';
                }
            }
            else {
                appTheme = theme.name;
            }
            theme.name = appTheme + (theme.name.charAt(0) === '.' ? theme.name : '');
            Resource.formatOptions(theme.items);
            const storedTheme = <StyleAttribute> stored.get(theme.name);
            if (storedTheme) {
                for (const attr in theme.items) {
                    storedTheme.items[attr] = theme.items[attr];
                }
            }
            else {
                stored.set(theme.name, theme);
            }
            STORED.themes.set(filename, stored);
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
                const partial = $util.trimString(name.replace(/[^A-Za-z\d]+/g, '_'), '_').split(/_+/);
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
                if (numeric || /^\d/.test(name) || RESERVED_JAVA.includes(name)) {
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

    public static addImageSrcSet(element: HTMLImageElement, prefix = '') {
        const images: StringMap = {};
        const srcset = element.srcset.trim();
        if (srcset !== '') {
            const filepath = element.src.substring(0, element.src.lastIndexOf('/') + 1);
            for (const value of srcset.split($util.REGEXP_COMPILED.SEPARATOR)) {
                const match = /^(.+?)\s*(?:(\d*\.?\d*)x)?$/.exec(value.trim());
                if (match) {
                    if (!$util.hasValue(match[2])) {
                        match[2] = '1';
                    }
                    const src = filepath + $util.fromLastIndexOf(match[1]);
                    const size = parseFloat(match[2]);
                    if (size <= 0.75) {
                        images.ldpi = src;
                    }
                    else if (size <= 1) {
                        images.mdpi = src;
                    }
                    else if (size <= 1.5) {
                        images.hdpi = src;
                    }
                    else if (size <= 2) {
                        images.xhdpi = src;
                    }
                    else if (size <= 3) {
                        images.xxhdpi = src;
                    }
                    else {
                        images.xxxhdpi = src;
                    }
                }
            }
        }
        if (images.mdpi === undefined) {
            images.mdpi = element.src;
        }
        return this.addImage(images, prefix);
    }

    public static addImage(images: StringMap, prefix = '') {
        let src = '';
        if (images.mdpi) {
            src = $util.fromLastIndexOf(images.mdpi);
            const format = $util.fromLastIndexOf(src, '.').toLowerCase();
            switch (format) {
                case 'bmp':
                case 'cur':
                case 'gif':
                case 'ico':
                case 'jpg':
                case 'png':
                    src = Resource.insertStoredAsset('images', prefix + src.substring(0, src.length - format.length - 1).replace(/[^\w+]/g, '_'), images);
                    break;
                default:
                    src = '';
                    break;
            }
        }
        return src;
    }

    public static addImageUrl(value: string, prefix = '') {
        value = $css.resolveURL(value) || $util.resolvePath(value);
        return value !== '' ? this.addImage({ mdpi: value }, prefix) : '';
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
                colorName = keyName === shade.value ? shade.name : Resource.generateId('color', shade.name);
                STORED.colors.set(keyName, colorName);
                return colorName;
            }
        }
        return '';
    }

    constructor(application: squared.base.Application<T>, cache: squared.base.NodeList<T>) {
        super(application, cache);
        STORED.styles = new Map();
        STORED.themes = new Map();
        STORED.dimens = new Map();
        STORED.drawables = new Map();
        STORED.animators = new Map();
    }

    get userSettings() {
        return <UserSettingsAndroid> this.application.userSettings;
    }
}