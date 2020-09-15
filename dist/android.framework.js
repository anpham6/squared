/* android-framework 2.0.0
   https://github.com/anpham6/squared */

var android = (function () {
    'use strict';

    class Application extends squared.base.ApplicationUI {
        constructor() {
            super(...arguments);
            this.systemName = 'android';
            this._viewModel = new Map();
        }
        init() {
            super.init();
        }
        reset() {
            this._viewModel.clear();
            super.reset();
        }
        resolveTarget(sessionId, target) {
            if (target) {
                const isTargeted = node =>
                    node.element === target || node.elementId === target || node.controlId === target;
                for (const node of this.getProcessingCache(sessionId)) {
                    if (isTargeted(node)) {
                        return node;
                    }
                }
                for (const data of this.session.active) {
                    if (data[0] !== sessionId) {
                        for (const node of data[1].cache) {
                            if (isTargeted(node)) {
                                return node;
                            }
                        }
                    }
                }
            }
            return null;
        }
        setViewModel(data, sessionId) {
            this._viewModel.set(sessionId || '0', data);
        }
        getViewModel(sessionId) {
            return this._viewModel.get(sessionId);
        }
        get viewModel() {
            return this._viewModel;
        }
    }

    var BUILD_VERSION;
    (function (BUILD_VERSION) {
        BUILD_VERSION[(BUILD_VERSION['R'] = 30)] = 'R';
        BUILD_VERSION[(BUILD_VERSION['Q'] = 29)] = 'Q';
        BUILD_VERSION[(BUILD_VERSION['PIE'] = 28)] = 'PIE';
        BUILD_VERSION[(BUILD_VERSION['OREO_1'] = 27)] = 'OREO_1';
        BUILD_VERSION[(BUILD_VERSION['OREO'] = 26)] = 'OREO';
        BUILD_VERSION[(BUILD_VERSION['NOUGAT_1'] = 25)] = 'NOUGAT_1';
        BUILD_VERSION[(BUILD_VERSION['NOUGAT'] = 24)] = 'NOUGAT';
        BUILD_VERSION[(BUILD_VERSION['MARSHMALLOW'] = 23)] = 'MARSHMALLOW';
        BUILD_VERSION[(BUILD_VERSION['LOLLIPOP_1'] = 22)] = 'LOLLIPOP_1';
        BUILD_VERSION[(BUILD_VERSION['LOLLIPOP'] = 21)] = 'LOLLIPOP';
        BUILD_VERSION[(BUILD_VERSION['KITKAT_1'] = 20)] = 'KITKAT_1';
        BUILD_VERSION[(BUILD_VERSION['KITKAT'] = 19)] = 'KITKAT';
        BUILD_VERSION[(BUILD_VERSION['JELLYBEAN_2'] = 18)] = 'JELLYBEAN_2';
        BUILD_VERSION[(BUILD_VERSION['JELLYBEAN_1'] = 17)] = 'JELLYBEAN_1';
        BUILD_VERSION[(BUILD_VERSION['JELLYBEAN'] = 16)] = 'JELLYBEAN';
        BUILD_VERSION[(BUILD_VERSION['ICE_CREAM_SANDWICH_1'] = 15)] = 'ICE_CREAM_SANDWICH_1';
        BUILD_VERSION[(BUILD_VERSION['ICE_CREAM_SANDWICH'] = 14)] = 'ICE_CREAM_SANDWICH';
        BUILD_VERSION[(BUILD_VERSION['ALL'] = 0)] = 'ALL';
        BUILD_VERSION[(BUILD_VERSION['LATEST'] = 30)] = 'LATEST';
    })(BUILD_VERSION || (BUILD_VERSION = {}));
    var CONTAINER_NODE;
    (function (CONTAINER_NODE) {
        CONTAINER_NODE[(CONTAINER_NODE['RADIO'] = 1)] = 'RADIO';
        CONTAINER_NODE[(CONTAINER_NODE['CHECKBOX'] = 2)] = 'CHECKBOX';
        CONTAINER_NODE[(CONTAINER_NODE['SELECT'] = 3)] = 'SELECT';
        CONTAINER_NODE[(CONTAINER_NODE['SVG'] = 4)] = 'SVG';
        CONTAINER_NODE[(CONTAINER_NODE['IMAGE'] = 5)] = 'IMAGE';
        CONTAINER_NODE[(CONTAINER_NODE['PROGRESS'] = 6)] = 'PROGRESS';
        CONTAINER_NODE[(CONTAINER_NODE['RANGE'] = 7)] = 'RANGE';
        CONTAINER_NODE[(CONTAINER_NODE['EDIT'] = 8)] = 'EDIT';
        CONTAINER_NODE[(CONTAINER_NODE['BUTTON'] = 9)] = 'BUTTON';
        CONTAINER_NODE[(CONTAINER_NODE['TEXT'] = 10)] = 'TEXT';
        CONTAINER_NODE[(CONTAINER_NODE['INLINE'] = 11)] = 'INLINE';
        CONTAINER_NODE[(CONTAINER_NODE['LINE'] = 12)] = 'LINE';
        CONTAINER_NODE[(CONTAINER_NODE['SPACE'] = 13)] = 'SPACE';
        CONTAINER_NODE[(CONTAINER_NODE['BLOCK'] = 14)] = 'BLOCK';
        CONTAINER_NODE[(CONTAINER_NODE['FRAME'] = 15)] = 'FRAME';
        CONTAINER_NODE[(CONTAINER_NODE['LINEAR'] = 16)] = 'LINEAR';
        CONTAINER_NODE[(CONTAINER_NODE['GRID'] = 17)] = 'GRID';
        CONTAINER_NODE[(CONTAINER_NODE['RELATIVE'] = 18)] = 'RELATIVE';
        CONTAINER_NODE[(CONTAINER_NODE['CONSTRAINT'] = 19)] = 'CONSTRAINT';
        CONTAINER_NODE[(CONTAINER_NODE['WEBVIEW'] = 20)] = 'WEBVIEW';
        CONTAINER_NODE[(CONTAINER_NODE['VIDEOVIEW'] = 21)] = 'VIDEOVIEW';
        CONTAINER_NODE[(CONTAINER_NODE['UNKNOWN'] = 22)] = 'UNKNOWN';
    })(CONTAINER_NODE || (CONTAINER_NODE = {}));
    const SCREEN_DENSITY = {
        LDPI: 120,
        MDPI: 160,
        HDPI: 240,
        XHDPI: 320,
        XXHDPI: 480,
        XXXHDPI: 640,
    };
    const CONTAINER_ELEMENT = {
        PLAINTEXT: CONTAINER_NODE.TEXT,
        HR: CONTAINER_NODE.LINE,
        SVG: CONTAINER_NODE.SVG,
        IMG: CONTAINER_NODE.IMAGE,
        CANVAS: CONTAINER_NODE.IMAGE,
        BUTTON: CONTAINER_NODE.BUTTON,
        SELECT: CONTAINER_NODE.SELECT,
        TEXTAREA: CONTAINER_NODE.EDIT,
        METER: CONTAINER_NODE.PROGRESS,
        PROGRESS: CONTAINER_NODE.PROGRESS,
        AUDIO: CONTAINER_NODE.VIDEOVIEW,
        VIDEO: CONTAINER_NODE.VIDEOVIEW,
        IFRAME: CONTAINER_NODE.WEBVIEW,
        INPUT_RANGE: CONTAINER_NODE.RANGE,
        INPUT_TEXT: CONTAINER_NODE.EDIT,
        INPUT_PASSWORD: CONTAINER_NODE.EDIT,
        INPUT_NUMBER: CONTAINER_NODE.EDIT,
        INPUT_EMAIL: CONTAINER_NODE.EDIT,
        INPUT_SEARCH: CONTAINER_NODE.EDIT,
        INPUT_URL: CONTAINER_NODE.EDIT,
        INPUT_DATE: CONTAINER_NODE.EDIT,
        INPUT_TEL: CONTAINER_NODE.EDIT,
        INPUT_TIME: CONTAINER_NODE.EDIT,
        INPUT_WEEK: CONTAINER_NODE.EDIT,
        INPUT_MONTH: CONTAINER_NODE.EDIT,
        INPUT_BUTTON: CONTAINER_NODE.BUTTON,
        INPUT_FILE: CONTAINER_NODE.BUTTON,
        INPUT_IMAGE: CONTAINER_NODE.BUTTON,
        INPUT_COLOR: CONTAINER_NODE.BUTTON,
        INPUT_SUBMIT: CONTAINER_NODE.BUTTON,
        INPUT_RESET: CONTAINER_NODE.BUTTON,
        INPUT_CHECKBOX: CONTAINER_NODE.CHECKBOX,
        INPUT_RADIO: CONTAINER_NODE.RADIO,
        'INPUT_DATETIME_LOCAL': CONTAINER_NODE.EDIT,
    };
    const CONTAINER_TAGNAME = {
        RADIO: 'RadioButton',
        CHECKBOX: 'CheckBox',
        EDIT_LIST: 'AutoCompleteTextView',
        SELECT: 'Spinner',
        EDIT: 'EditText',
        SVG: 'ImageView',
        IMAGE: 'ImageView',
        BUTTON: 'Button',
        RANGE: 'SeekBar',
        METER: 'ProgressBar',
        PROGRESS: 'ProgressBar',
        TEXT: 'TextView',
        LINE: 'View',
        SPACE: 'Space',
        FRAME: 'FrameLayout',
        LINEAR: 'LinearLayout',
        GRID: 'GridLayout',
        RELATIVE: 'RelativeLayout',
        WEBVIEW: 'WebView',
        VIDEOVIEW: 'VideoView',
        RADIOGROUP: 'RadioGroup',
        HORIZONTAL_SCROLL: 'HorizontalScrollView',
        VERTICAL_SCROLL: 'android.support.v4.widget.NestedScrollView',
        CONSTRAINT: 'android.support.constraint.ConstraintLayout',
        GUIDELINE: 'android.support.constraint.Guideline',
        BARRIER: 'android.support.constraint.Barrier',
    };
    const CONTAINER_TAGNAME_X = {
        VERTICAL_SCROLL: 'androidx.core.widget.NestedScrollView',
        CONSTRAINT: 'androidx.constraintlayout.widget.ConstraintLayout',
        GUIDELINE: 'androidx.constraintlayout.widget.Guideline',
        BARRIER: 'androidx.constraintlayout.widget.Barrier',
    };
    const SUPPORT_TAGNAME = {
        DRAWER: 'android.support.v4.widget.DrawerLayout',
        NAVIGATION_VIEW: 'android.support.design.widget.NavigationView',
        COORDINATOR: 'android.support.design.widget.CoordinatorLayout',
        APPBAR: 'android.support.design.widget.AppBarLayout',
        COLLAPSING_TOOLBAR: 'android.support.design.widget.CollapsingToolbarLayout',
        TOOLBAR: 'android.support.v7.widget.Toolbar',
        FLOATING_ACTION_BUTTON: 'android.support.design.widget.FloatingActionButton',
        BOTTOM_NAVIGATION: 'android.support.design.widget.BottomNavigationView',
    };
    const SUPPORT_TAGNAME_X = {
        DRAWER: 'androidx.drawerlayout.widget.DrawerLayout',
        NAVIGATION_VIEW: 'com.google.android.material.navigation.NavigationView',
        COORDINATOR: 'androidx.coordinatorlayout.widget.CoordinatorLayout',
        APPBAR: 'com.google.android.material.appbar.AppBarLayout',
        COLLAPSING_TOOLBAR: 'com.google.android.material.appbar.CollapsingToolbarLayout',
        TOOLBAR: 'androidx.appcompat.widget.Toolbar',
        FLOATING_ACTION_BUTTON: 'com.google.android.material.floatingactionbutton.FloatingActionButton',
        BOTTOM_NAVIGATION: 'com.google.android.material.bottomnavigation.BottomNavigationView',
    };
    const LAYOUT_MAP = {
        relativeParent: {
            left: 'layout_alignParentLeft',
            top: 'layout_alignParentTop',
            right: 'layout_alignParentRight',
            bottom: 'layout_alignParentBottom',
            centerHorizontal: 'layout_centerHorizontal',
            centerVertical: 'layout_centerVertical',
        },
        relative: {
            left: 'layout_alignLeft',
            top: 'layout_alignTop',
            right: 'layout_alignRight',
            bottom: 'layout_alignBottom',
            baseline: 'layout_alignBaseline',
            leftRight: 'layout_toRightOf',
            rightLeft: 'layout_toLeftOf',
            topBottom: 'layout_below',
            bottomTop: 'layout_above',
        },
        constraint: {
            left: 'layout_constraintLeft_toLeftOf',
            top: 'layout_constraintTop_toTopOf',
            right: 'layout_constraintRight_toRightOf',
            bottom: 'layout_constraintBottom_toBottomOf',
            leftRight: 'layout_constraintLeft_toRightOf',
            rightLeft: 'layout_constraintRight_toLeftOf',
            baseline: 'layout_constraintBaseline_toBaselineOf',
            topBottom: 'layout_constraintTop_toBottomOf',
            bottomTop: 'layout_constraintBottom_toTopOf',
        },
    };
    const LOCALIZE_MAP = {
        left: 'start',
        right: 'end',
        paddingLeft: 'paddingStart',
        paddingRight: 'paddingEnd',
        layout_marginLeft: 'layout_marginStart',
        layout_marginRight: 'layout_marginEnd',
        layout_alignParentLeft: 'layout_alignParentStart',
        layout_alignParentRight: 'layout_alignParentEnd',
        layout_alignLeft: 'layout_alignStart',
        layout_alignRight: 'layout_alignEnd',
        layout_toLeftOf: 'layout_toStartOf',
        layout_toRightOf: 'layout_toEndOf',
        layout_constraintLeft_toLeftOf: 'layout_constraintStart_toStartOf',
        layout_constraintRight_toRightOf: 'layout_constraintEnd_toEndOf',
        layout_constraintLeft_toRightOf: 'layout_constraintStart_toEndOf',
        layout_constraintRight_toLeftOf: 'layout_constraintEnd_toStartOf',
    };
    const XML_NAMESPACE = {
        android: 'http://schemas.android.com/apk/res/android',
        app: 'http://schemas.android.com/apk/res-auto',
        aapt: 'http://schemas.android.com/aapt',
    };
    const RESERVED_JAVA = new Set([
        'abstract',
        'assert',
        'boolean',
        'break',
        'byte',
        'case',
        'catch',
        'char',
        'class',
        'const',
        'continue',
        'default',
        'double',
        'do',
        'else',
        'enum',
        'extends',
        'false',
        'final',
        'finally',
        'float',
        'for',
        'goto',
        'if',
        'implements',
        'import',
        'instanceof',
        'int',
        'interface',
        'long',
        'native',
        'new',
        'null',
        'package',
        'private',
        'protected',
        'public',
        'return',
        'short',
        'static',
        'strictfp',
        'super',
        'switch',
        'synchronized',
        'this',
        'throw',
        'throws',
        'transient',
        'true',
        'try',
        'void',
        'volatile',
        'while',
    ]);

    var constant = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        get BUILD_VERSION() {
            return BUILD_VERSION;
        },
        get CONTAINER_NODE() {
            return CONTAINER_NODE;
        },
        SCREEN_DENSITY: SCREEN_DENSITY,
        CONTAINER_ELEMENT: CONTAINER_ELEMENT,
        CONTAINER_TAGNAME: CONTAINER_TAGNAME,
        CONTAINER_TAGNAME_X: CONTAINER_TAGNAME_X,
        SUPPORT_TAGNAME: SUPPORT_TAGNAME,
        SUPPORT_TAGNAME_X: SUPPORT_TAGNAME_X,
        LAYOUT_MAP: LAYOUT_MAP,
        LOCALIZE_MAP: LOCALIZE_MAP,
        XML_NAMESPACE: XML_NAMESPACE,
        RESERVED_JAVA: RESERVED_JAVA,
    });

    const { capitalize, joinArray, isPlainObject } = squared.lib.util;
    function applyTemplate(tagName, template, children, depth) {
        const tag = template[tagName];
        const nested = tag['>>'] === true;
        let output = '',
            length = children.length,
            indent;
        if (depth === undefined) {
            output += '<?xml version="1.0" encoding="utf-8"?>\n';
            indent = '';
            depth = 0;
        } else {
            indent = '\t'.repeat(depth);
        }
        for (let i = 0; i < length; ++i) {
            const item = children[i];
            const include = tag['#'] && item[tag['#']];
            const closed = !nested && !include;
            const attrs = tag['@'];
            const descend = tag['>'];
            let valid;
            output += `${indent}<${tagName}`;
            if (attrs) {
                for (let j = 0, q = attrs.length; j < q; ++j) {
                    const attr = attrs[j];
                    const value = item[attr];
                    if (value) {
                        output += ` ${(tag['^'] ? tag['^'] + ':' : '') + attr}="${value}"`;
                    }
                }
            }
            if (descend) {
                let innerText = '';
                const childDepth = depth + (nested ? i : 0) + 1;
                for (const name in descend) {
                    const value = item[name];
                    if (Array.isArray(value)) {
                        innerText += applyTemplate(name, descend, value, childDepth);
                    } else if (isPlainObject(value)) {
                        innerText += applyTemplate(name, descend, [value], childDepth);
                    }
                }
                if (innerText !== '') {
                    output += '>\n' + innerText;
                    if (closed) {
                        output += indent + `</${tagName}>\n`;
                    }
                } else {
                    output += closed ? ' />\n' : '>\n';
                }
                valid = true;
            } else if (tag['~']) {
                output += '>' + item.innerText;
                if (closed) {
                    output += `</${tagName}>\n`;
                }
                valid = true;
            } else if (closed) {
                output += ' />\n';
            }
            if (include) {
                if (!valid) {
                    output += '>\n';
                }
                output += include;
                if (!nested) {
                    output += indent + `</${tagName}>\n`;
                }
            }
            if (nested) {
                indent += '\t';
            }
        }
        if (nested) {
            while (--length >= 0) {
                indent = indent.substring(1);
                output += indent + `</${tagName}>\n`;
            }
        }
        return output;
    }
    function getDocumentId(value) {
        return value.replace(/^@\+?id\//, '');
    }
    function isHorizontalAlign(value) {
        switch (value) {
            case 'left':
            case 'start':
            case 'right':
            case 'end':
            case 'center_horizontal':
                return true;
            default:
                return false;
        }
    }
    function isVerticalAlign(value) {
        switch (value) {
            case 'top':
            case 'bottom':
            case 'center_vertical':
                return true;
            default:
                return false;
        }
    }
    function getDataSet(dataset, prefix) {
        let result;
        for (const attr in dataset) {
            if (attr.startsWith(prefix)) {
                (result || (result = {}))[capitalize(attr.substring(prefix.length), false)] = dataset[attr];
            }
        }
        return result;
    }
    function createViewAttribute(data) {
        const options = { android: {} };
        if (data) {
            if (data.android) {
                Object.assign(options.android, data.android);
            }
            if (data.app) {
                Object.assign(options.app || (options.app = {}), data.app);
            }
        }
        return options;
    }
    function createThemeAttribute(data) {
        return Object.assign(
            {
                output: {
                    path: 'res/values',
                    file: '',
                },
                name: '',
                parent: '',
                items: {},
            },
            data
        );
    }
    function replaceTab(value, spaces = 4, preserve) {
        if (spaces > 0) {
            if (preserve) {
                return (
                    joinArray(
                        value.split('\n'),
                        line => {
                            const match = /^(\t+)(.*)$/.exec(line);
                            return match ? ' '.repeat(spaces * match[1].length) + match[2] : line;
                        },
                        '\n'
                    ) + '\n'
                );
            }
            return value.replace(/\t/g, ' '.repeat(spaces));
        }
        return value;
    }
    function replaceCharacterData(value, tab) {
        let output = '';
        for (let i = 0, length = value.length, ch; i < length; ++i) {
            ch = value[i];
            switch (ch) {
                case "'":
                    output += "\\'";
                    break;
                case '"':
                    output += '&quot;';
                    break;
                case '<':
                    output += '&lt;';
                    break;
                case '>':
                    output += '&gt;';
                    break;
                case '\u0003':
                    output += ' ';
                    break;
                case '\u00A0':
                    output += '&#160;';
                    break;
                case '\t':
                    output += tab ? '&#160;'.repeat(tab) : ch;
                    break;
                default:
                    output += ch;
                    break;
            }
        }
        return output.replace(/&nbsp;/g, '&#160;').replace(/&(?!#?[A-Za-z\d]{2,};)/g, '&amp;');
    }
    function concatString(list, char = '') {
        let output = '';
        for (let i = 0, length = list.length; i < length; ++i) {
            output += (i > 0 ? char : '') + list[i];
        }
        return output;
    }
    function formatString(value, ...params) {
        for (let i = 0, length = params.length; i < length; ++i) {
            value = value.replace(`{${i}}`, params[i]);
        }
        return value;
    }
    function localizeString(value, rtl, api) {
        return (rtl && api >= 17 /* JELLYBEAN_1 */ && LOCALIZE_MAP[value]) || value;
    }
    function getXmlNs(value) {
        return XML_NAMESPACE[value] ? `xmlns:${value}="${XML_NAMESPACE[value]}"` : '';
    }
    function getRootNs(value) {
        let output = '';
        for (const namespace in XML_NAMESPACE) {
            if (namespace === 'android' || (namespace !== 'aapt' && value.includes(namespace + ':'))) {
                output += '\n\t' + getXmlNs(namespace);
            }
        }
        return output;
    }

    var util = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        applyTemplate: applyTemplate,
        getDocumentId: getDocumentId,
        isHorizontalAlign: isHorizontalAlign,
        isVerticalAlign: isVerticalAlign,
        getDataSet: getDataSet,
        createViewAttribute: createViewAttribute,
        createThemeAttribute: createThemeAttribute,
        replaceTab: replaceTab,
        replaceCharacterData: replaceCharacterData,
        concatString: concatString,
        formatString: formatString,
        localizeString: localizeString,
        getXmlNs: getXmlNs,
        getRootNs: getRootNs,
    });

    const { FILE } = squared.lib.regex;
    const { findColorShade, parseColor } = squared.lib.color;
    const { extractURL, getSrcSet } = squared.lib.css;
    const {
        fromLastIndexOf,
        isNumber,
        isPlainObject: isPlainObject$1,
        isString,
        resolvePath,
        trimString,
    } = squared.lib.util;
    const STORED = squared.base.ResourceUI.STORED;
    const REGEXP_STRINGNAME = /(\\[nt]|<\/?[A-Za-z]+>|&#?[A-Za-z\d]{2,};)/g;
    const REGEXP_STRINGWORD = /[^A-Za-z\d]+/g;
    let CACHE_IMAGE = {};
    let COUNTER_UUID = 0;
    let COUNTER_SYMBOL = 0;
    function formatObject(obj, numberAlias) {
        for (const attr in obj) {
            if (isPlainObject$1(obj[attr])) {
                formatObject(obj, numberAlias);
            } else {
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
                            const colorData = parseColor(value);
                            if (colorData) {
                                const colorName = Resource.addColor(colorData);
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
    class Resource extends squared.base.ResourceUI {
        constructor(application, cache) {
            super();
            this.application = application;
            this.cache = cache;
            STORED.styles = new Map();
            STORED.themes = new Map();
            STORED.dimens = new Map();
            STORED.drawables = new Map();
            STORED.animators = new Map();
            const mimeType = this.controllerSettings.mimeType.image;
            if (mimeType !== '*') {
                const imageFormat = new Set(mimeType);
                imageFormat.delete('image/svg+xml');
                this._imageFormat = imageFormat;
            }
        }
        static formatOptions(options, numberAlias) {
            for (const namespace in options) {
                const obj = options[namespace];
                if (isPlainObject$1(obj)) {
                    formatObject(obj, numberAlias);
                }
            }
            return options;
        }
        static formatName(value) {
            return (/^\d/.test(value) ? '__' : '') + value.replace(/[^\w]+/g, '_');
        }
        static addTheme(theme) {
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
            const themes = STORED.themes;
            const filename = `${path}/${file}`;
            const storedFile = themes.get(filename) || new Map();
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
            } else {
                appTheme = name;
            }
            name = appTheme + (name[0] === '.' ? name : '');
            theme.name = name;
            Resource.formatOptions(items);
            const storedTheme = storedFile.get(name);
            if (storedTheme) {
                const storedItems = storedTheme.items;
                for (const attr in items) {
                    storedItems[attr] = items[attr];
                }
            } else {
                storedFile.set(name, theme);
            }
            themes.set(filename, storedFile);
            return true;
        }
        static addString(value, name, numberAlias) {
            if (value) {
                const numeric = isNumber(value);
                if (!numeric || numberAlias) {
                    const strings = STORED.strings;
                    for (const data of strings) {
                        if (data[1] === value) {
                            return `@string/${data[0]}`;
                        }
                    }
                    const partial = trimString(
                        (name || (value.length > 64 ? value.substring(0, 64) : value))
                            .replace(REGEXP_STRINGNAME, '_')
                            .replace(REGEXP_STRINGWORD, '_'),
                        '_'
                    ).split(/_+/);
                    if (partial.length > 1) {
                        if (partial.length > 4) {
                            partial.length = 4;
                        }
                        name = concatString(partial, '_');
                    } else {
                        name = partial[0];
                    }
                    name = name.toLowerCase();
                    if (!name) {
                        name = '__symbol' + ++COUNTER_SYMBOL;
                    } else if (numeric || /^\d/.test(name) || RESERVED_JAVA.has(name)) {
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
        static addImage(images, prefix = '', imageFormat) {
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
                if (!imageFormat || Resource.hasMimeType(imageFormat, ext) || length === 0) {
                    const asset = Resource.insertStoredAsset(
                        'images',
                        Resource.formatName(
                            prefix + src.substring(0, src.length - (length ? length + 1 : 0))
                        ).toLowerCase(),
                        images
                    );
                    CACHE_IMAGE[mdpi] = asset;
                    return asset;
                }
            }
            return '';
        }
        static addColor(color, transparency) {
            if (typeof color === 'string') {
                const result = parseColor(color, 1, transparency);
                if (result) {
                    color = result;
                } else {
                    return '';
                }
            }
            if (!color.transparent || transparency) {
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
        reset() {
            CACHE_IMAGE = {};
            COUNTER_UUID = 0;
            COUNTER_SYMBOL = 0;
            super.reset();
        }
        addImageSrc(element, prefix = '', imageSet) {
            const result = {};
            let mdpi;
            if (typeof element === 'string') {
                mdpi = extractURL(element);
                if (mdpi && !mdpi.startsWith('data:image/')) {
                    return this.addImageSet({ mdpi: resolvePath(mdpi) }, prefix);
                }
            } else {
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
                            } else if (pixelRatio === 1) {
                                if (!mdpi || image.actualWidth) {
                                    mdpi = src;
                                }
                            } else if (pixelRatio <= 1.5) {
                                result.hdpi = src;
                            } else if (pixelRatio <= 2) {
                                result.xhdpi = src;
                            } else if (pixelRatio <= 3) {
                                result.xxhdpi = src;
                            } else {
                                result.xxxhdpi = src;
                            }
                        }
                    }
                }
                mdpi || (mdpi = element.src);
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
                            encoding: 'base64',
                        });
                        return filename.substring(0, filename.lastIndexOf('.'));
                    }
                    return '';
                }
                result.mdpi = mdpi;
            }
            return this.addImageSet(result, prefix);
        }
        addImageSet(images, prefix) {
            return Resource.addImage(images, prefix, this._imageFormat);
        }
        writeRawImage(options) {
            const asset = super.writeRawImage(options);
            if (
                asset &&
                this.userSettings.compressImages &&
                Resource.canCompressImage(options.filename || '', options.mimeType)
            ) {
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

    function substitute(result, attr, api, minApi = 0, value) {
        if (!api || api >= minApi) {
            result.attr = attr;
            if (value) {
                result.value = value;
            }
            return true;
        }
        return false;
    }
    const API_VERSION = {
        [30 /* R */]: {
            android: {},
            assign: {},
        },
        [29 /* Q */]: {
            android: {
                allowNativeHeapPointerTagging: false,
                animatedImageDrawable: false,
                canTakeScreenshot: false,
                crossProfile: false,
                forceQueryable: false,
                gwpAsanMode: false,
                htmlDescription: false,
                importantForContentCapture: false,
                mimeGroup: false,
                preferMinimalPostProcessing: false,
                preserveLegacyExternalStorage: false,
                resourcesMap: false,
                supportsInlineSuggestions: false,
            },
            assign: {},
        },
        [28 /* PIE */]: {
            android: {
                allowAudioPlaybackCapture: false,
                enforceNavigationBarContrast: false,
                enforceStatusBarContrast: false,
                forceDarkAllowed: false,
                forceUriPermissions: false,
                foregroundServiceType: false,
                hasFragileUserData: false,
                identifier: false,
                inheritShowWhenLocked: false,
                interactiveUiTimeout: false,
                isLightTheme: false,
                isSplitRequired: false,
                minAspectRatio: false,
                nonInteractiveUiTimeout: false,
                opticalInsetBottom: false,
                opticalInsetLeft: false,
                opticalInsetRight: false,
                opticalInsetTop: false,
                packageType: false,
                requestLegacyExternalStorage: false,
                secureElementName: false,
                selectionDividerHeight: false,
                settingsSliceUri: false,
                shell: false,
                supportsMultipleDisplays: false,
                textLocale: false,
                useAppZygote: false,
                useEmbeddedDex: false,
                zygotePreloadName: false,
            },
            assign: {},
        },
        [27 /* OREO_1 */]: {
            android: {
                accessibilityHeading: false,
                accessibilityPaneTitle: false,
                appComponentFactory: false,
                buttonCornerRadius: false,
                cantSaveState: false,
                dialogCornerRadius: false,
                fallbackLineSpacing: false,
                firstBaselineToTopHeight: false,
                fontVariationSettings: false,
                lastBaselineToBottomHeight: false,
                lineHeight: false,
                maxLongVersionCode: false,
                outlineAmbientShadowColor: false,
                outlineSpotShadowColor: false,
                screenReaderFocusable: false,
                textFontWeight: false,
                ttcIndex: false,
                versionCodeMajor: false,
                versionMajor: false,
                widgetFeatures: false,
            },
            assign: {},
        },
        [26 /* OREO */]: {
            android: {
                classLoader: false,
                navigationBarDividerColor: false,
                showWhenLocked: false,
                turnScreenOn: false,
                windowLayoutInDisplayCutoutMode: false,
                windowLightNavigationBar: false,
            },
            assign: {},
        },
        [25 /* NOUGAT_1 */]: {
            android: {
                alphabeticModifiers: false,
                appCategory: false,
                autoSizeMaxTextSize: false,
                autoSizeMinTextSize: false,
                autoSizePresetSizes: false,
                autoSizeStepGranularity: false,
                autoSizeTextType: false,
                autofillHints: false,
                autofilledHighlight: false,
                canRequestFingerprintGestures: false,
                certDigest: false,
                colorError: false,
                colorMode: false,
                defaultFocusHighlightEnabled: false,
                focusedByDefault: false,
                font: false,
                fontProviderAuthority: false,
                fontProviderCerts: false,
                fontProviderPackage: false,
                fontProviderQuery: false,
                fontStyle: false,
                fontWeight: false,
                iconSpaceReserved: false,
                iconTint: false,
                iconTintMode: false,
                importantForAutofill: false,
                isFeatureSplit: false,
                isStatic: false,
                isolatedSplits: false,
                justificationMode: false,
                keyboardNavigationCluster: false,
                layout_marginHorizontal: false,
                layout_marginVertical: false,
                maxAspectRatio: false,
                min: false,
                nextClusterForward: false,
                numericModifiers: false,
                paddingHorizontal: false,
                paddingVertical: false,
                persistentWhenFeatureAvailable: false,
                primaryContentAlpha: false,
                recreateOnConfigChanges: false,
                recycleEnabled: false,
                requiredFeature: false,
                requiredNotFeature: false,
                rotationAnimation: false,
                secondaryContentAlpha: false,
                singleLineTitle: false,
                splitName: false,
                targetProcesses: false,
                targetSandboxVersion: false,
                tooltipText: false,
                visibleToInstantApps: false,
                windowSplashscreenContent: false,
            },
            assign: {},
        },
        [24 /* NOUGAT */]: {
            android: {
                colorSecondary: false,
                contextDescription: false,
                contextUri: false,
                roundIcon: false,
                shortcutDisabledMessage: false,
                shortcutId: false,
                shortcutLongLabel: false,
                shortcutShortLabel: false,
                showMetadataInPreview: false,
            },
            assign: {},
        },
        [23 /* MARSHMALLOW */]: {
            android: {
                backupInForeground: false,
                bitmap: false,
                buttonGravity: false,
                canControlMagnification: false,
                canPerformGestures: false,
                canRecord: false,
                collapseIcon: false,
                contentInsetEndWithActions: false,
                contentInsetStartWithNavigation: false,
                contextPopupMenuStyle: false,
                countDown: false,
                defaultHeight: false,
                defaultToDeviceProtectedStorage: false,
                defaultWidth: false,
                directBootAware: false,
                enableVrMode: false,
                endX: false,
                endY: false,
                externalService: false,
                fillType: false,
                forceHasOverlappingRendering: false,
                hotSpotX: false,
                hotSpotY: false,
                languageTag: false,
                level: false,
                listMenuViewStyle: false,
                maxButtonHeight: false,
                networkSecurityConfig: false,
                numberPickerStyle: false,
                offset: false,
                pointerIcon: false,
                popupEnterTransition: false,
                popupExitTransition: false,
                preferenceFragmentStyle: false,
                resizeableActivity: false,
                startX: false,
                startY: false,
                subMenuArrow: false,
                supportsLocalInteraction: false,
                supportsPictureInPicture: false,
                textAppearancePopupMenuHeader: false,
                tickMark: false,
                tickMarkTint: false,
                tickMarkTintMode: false,
                titleMargin: false,
                titleMarginBottom: false,
                titleMarginEnd: false,
                titleMarginStart: false,
                titleMarginTop: false,
                tunerCount: false,
                use32bitAbi: false,
                version: false,
                windowBackgroundFallback: false,
            },
            assign: {},
        },
        [22 /* LOLLIPOP_1 */]: {
            android: {
                allowUndo: false,
                autoVerify: false,
                breakStrategy: false,
                colorBackgroundFloating: false,
                contextClickable: false,
                drawableTint: false,
                drawableTintMode: false,
                end: result => substitute(result, 'right'),
                extractNativeLibs: false,
                fingerprintAuthDrawable: false,
                fraction: false,
                fullBackupContent: false,
                hyphenationFrequency: false,
                lockTaskMode: false,
                logoDescription: false,
                numbersInnerTextColor: false,
                scrollIndicators: false,
                showForAllUsers: false,
                start: result => substitute(result, 'left'),
                subtitleTextColor: false,
                supportsAssist: false,
                supportsLaunchVoiceAssistFromKeyguard: false,
                thumbPosition: false,
                titleTextColor: false,
                trackTint: false,
                trackTintMode: false,
                usesCleartextTraffic: false,
                windowLightStatusBar: false,
            },
            assign: {},
        },
        [21 /* LOLLIPOP */]: {
            android: {
                accessibilityTraversalAfter: false,
                accessibilityTraversalBefore: false,
                collapseContentDescription: false,
                dialogPreferredPadding: false,
                resizeClip: false,
                revisionCode: false,
                searchHintIcon: false,
            },
            assign: {},
        },
        [20 /* KITKAT_1 */]: {
            android: {
                actionBarPopupTheme: false,
                actionBarTheme: false,
                actionModeFindDrawable: false,
                actionModeShareDrawable: false,
                actionModeWebSearchDrawable: false,
                actionOverflowMenuStyle: false,
                amPmBackgroundColor: false,
                amPmTextColor: false,
                ambientShadowAlpha: false,
                autoRemoveFromRecents: false,
                backgroundTint: false,
                backgroundTintMode: false,
                banner: false,
                buttonBarNegativeButtonStyle: false,
                buttonBarNeutralButtonStyle: false,
                buttonBarPositiveButtonStyle: false,
                buttonTint: false,
                buttonTintMode: false,
                calendarTextColor: false,
                checkMarkTint: false,
                checkMarkTintMode: false,
                closeIcon: false,
                colorAccent: false,
                colorButtonNormal: false,
                colorControlActivated: false,
                colorControlHighlight: false,
                colorControlNormal: false,
                colorEdgeEffect: false,
                colorPrimary: false,
                colorPrimaryDark: false,
                commitIcon: false,
                contentAgeHint: false,
                contentInsetEnd: false,
                contentInsetLeft: false,
                contentInsetRight: false,
                contentInsetStart: false,
                controlX1: false,
                controlX2: false,
                controlY1: false,
                controlY2: false,
                country: false,
                datePickerDialogTheme: false,
                datePickerMode: false,
                dayOfWeekBackground: false,
                dayOfWeekTextAppearance: false,
                documentLaunchMode: false,
                elegantTextHeight: false,
                elevation: false,
                excludeClass: false,
                excludeId: false,
                excludeName: false,
                fastScrollStyle: false,
                fillAlpha: false,
                fillColor: false,
                fontFeatureSettings: false,
                foregroundTint: false,
                foregroundTintMode: false,
                fragmentAllowEnterTransitionOverlap: false,
                fragmentAllowReturnTransitionOverlap: false,
                fragmentEnterTransition: false,
                fragmentExitTransition: false,
                fragmentReenterTransition: false,
                fragmentReturnTransition: false,
                fragmentSharedElementEnterTransition: false,
                fragmentSharedElementReturnTransition: false,
                fromId: false,
                fullBackupOnly: false,
                goIcon: false,
                headerAmPmTextAppearance: false,
                headerDayOfMonthTextAppearance: false,
                headerMonthTextAppearance: false,
                headerTimeTextAppearance: false,
                headerYearTextAppearance: false,
                hideOnContentScroll: false,
                indeterminateTint: false,
                indeterminateTintMode: false,
                inset: false,
                isGame: false,
                launchTaskBehindSourceAnimation: false,
                launchTaskBehindTargetAnimation: false,
                layout_columnWeight: false,
                layout_rowWeight: false,
                letterSpacing: false,
                matchOrder: false,
                maxRecentsv: false,
                maximumAngle: false,
                minimumHorizontalAngle: false,
                minimumVerticalAngle: false,
                multiArch: false,
                navigationBarColor: false,
                navigationContentDescription: false,
                navigationIcon: false,
                nestedScrollingEnabled: false,
                numbersBackgroundColor: false,
                numbersSelectorColor: false,
                numbersTextColor: false,
                outlineProvider: false,
                overlapAnchor: false,
                paddingMode: false,
                pathData: false,
                patternPathData: false,
                persistableMode: false,
                popupElevation: false,
                popupTheme: false,
                progressBackgroundTint: false,
                progressBackgroundTintMode: false,
                progressTint: false,
                progressTintMode: false,
                propertyXName: false,
                propertyYName: false,
                queryBackground: false,
                recognitionService: false,
                relinquishTaskIdentity: false,
                reparent: false,
                reparentWithOverlay: false,
                restrictionType: false,
                resumeWhilePausing: false,
                reversible: false,
                searchIcon: false,
                searchViewStyle: false,
                secondaryProgressTint: false,
                secondaryProgressTintMode: false,
                selectableItemBackgroundBorderless: false,
                sessionService: false,
                setupActivity: false,
                showText: false,
                slideEdge: false,
                splitTrack: false,
                spotShadowAlpha: false,
                src(result) {
                    if (this.svgElement) {
                        result['obj'] = 'app';
                        result['attr'] = 'srcCompat';
                    }
                    return true;
                },
                stackViewStyle: false,
                stateListAnimator: false,
                statusBarColor: false,
                strokeAlpha: false,
                strokeColor: false,
                strokeLineCap: false,
                strokeLineJoin: false,
                strokeMiterLimit: false,
                strokeWidth: false,
                submitBackground: false,
                subtitleTextAppearance: false,
                suggestionRowLayout: false,
                switchStyle: false,
                targetName: false,
                textAppearanceListItemSecondary: false,
                thumbTint: false,
                thumbTintMode: false,
                tileModeX: false,
                tileModeY: false,
                timePickerDialogTheme: false,
                timePickerMode: false,
                timePickerStyle: false,
                tintMode: false,
                titleTextAppearance: false,
                toId: false,
                toolbarStyle: false,
                touchscreenBlocksFocus: false,
                transitionGroup: false,
                transitionName: false,
                transitionVisibilityMode: false,
                translateX: false,
                translateY: false,
                translationZ: false,
                trimPathEnd: false,
                trimPathOffset: false,
                trimPathStart: false,
                viewportHeight: false,
                viewportWidth: false,
                voiceIcon: false,
                windowActivityTransitions: false,
                windowAllowEnterTransitionOverlap: false,
                windowAllowReturnTransitionOverlap: false,
                windowClipToOutline: false,
                windowContentTransitionManager: false,
                windowContentTransitions: false,
                windowDrawsSystemBarBackgrounds: false,
                windowElevation: false,
                windowEnterTransition: false,
                windowExitTransition: false,
                windowReenterTransition: false,
                windowReturnTransition: false,
                windowSharedElementEnterTransition: false,
                windowSharedElementExitTransition: false,
                windowSharedElementReenterTransition: false,
                windowSharedElementReturnTransition: false,
                windowSharedElementsUseOverlay: false,
                windowTransitionBackgroundFadeDuration: false,
                yearListItemTextAppearance: false,
                yearListSelectorColor: false,
            },
            assign: {},
        },
        [19 /* KITKAT */]: {
            android: {
                allowEmbedded: false,
                windowSwipeToDismiss: false,
            },
            assign: {},
        },
        [18 /* JELLYBEAN_2 */]: {
            android: {
                accessibilityLiveRegion: false,
                addPrintersActivity: false,
                advancedPrintOptionsActivity: false,
                apduServiceBanner: false,
                autoMirrored: false,
                category: false,
                fadingMode: false,
                fromScene: false,
                isAsciiCapable: false,
                keySet: false,
                requireDeviceUnlock: false,
                ssp: false,
                sspPattern: false,
                sspPrefix: false,
                startDelay: false,
                supportsSwitchingToNextInputMethod: false,
                targetId: false,
                toScene: false,
                transition: false,
                transitionOrdering: false,
                vendor: false,
                windowTranslucentNavigation: false,
                windowTranslucentStatus: false,
            },
            assign: {},
        },
        [17 /* JELLYBEAN_1 */]: {
            android: {
                canRequestEnhancedWebAccessibility: (result, api) => api < 26 /* OREO */,
                canRequestFilterKeyEvents: false,
                canRequestTouchExplorationMode: false,
                childIndicatorEnd: false,
                childIndicatorStart: false,
                indicatorEnd: false,
                indicatorStart: false,
                layoutMode: false,
                mipMap: false,
                mirrorForRtl: false,
                requiredAccountType: false,
                requiredForAllUsers: false,
                restrictedAccountType: false,
                windowOverscan: false,
            },
            assign: {},
        },
        [16 /* JELLYBEAN */]: {
            android: {
                checkedTextViewStyle: false,
                format12Hour: false,
                format24Hour: false,
                initialKeyguardLayout: false,
                labelFor: false,
                layoutDirection: false,
                layout_alignEnd: result => substitute(result, 'layout_alignRight'),
                layout_alignParentEnd: result => substitute(result, 'layout_alignParentRight'),
                layout_alignParentStart: result => substitute(result, 'layout_alignParentLeft'),
                layout_alignStart: result => substitute(result, 'layout_alignLeft'),
                layout_marginEnd: result => substitute(result, 'layout_marginRight'),
                layout_marginStart: result => substitute(result, 'layout_marginLeft'),
                layout_toEndOf: result => substitute(result, 'layout_toRightOf'),
                layout_toStartOf: result => substitute(result, 'layout_toLeftOf'),
                listPreferredItemPaddingEnd: result => substitute(result, 'listPreferredItemPaddingRight'),
                listPreferredItemPaddingStart: result => substitute(result, 'listPreferredItemPaddingLeft'),
                paddingEnd: result => substitute(result, 'paddingRight' /* PADDING_RIGHT */),
                paddingStart: result => substitute(result, 'paddingLeft' /* PADDING_LEFT */),
                permissionFlags: false,
                permissionGroupFlags: false,
                presentationTheme: false,
                showOnLockScreen: false,
                singleUser: false,
                subtypeId: false,
                supportsRtl: false,
                textAlignment: false,
                textDirection: false,
                timeZone: false,
                widgetCategory: false,
            },
            assign: {},
        },
        [15 /* ICE_CREAM_SANDWICH_1 */]: {
            android: {
                fontFamily: false,
                importantForAccessibility: false,
                isolatedProcess: false,
                keyboardLayout: false,
                mediaRouteButtonStyle: false,
                mediaRouteTypes: false,
                parentActivityName: false,
            },
            assign: {},
        },
        [14 /* ICE_CREAM_SANDWICH */]: {
            android: {},
            assign: {},
        },
        [0 /* ALL */]: {
            android: {},
            assign: {
                Button: {
                    android: {
                        textAllCaps: 'false',
                    },
                },
            },
        },
    };
    const DEPRECATED_ATTRIBUTE = {
        android: {
            amPmBackgroundColor: (result, api) => substitute(result, 'headerBackground', api, 23 /* MARSHMALLOW */),
            amPmTextColor: (result, api) => substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            animationResolution: (result, api) => api < 16 /* JELLYBEAN */,
            anyDensity: (result, api) => api < 30 /* R */,
            autoText: (result, api) =>
                substitute(result, 'inputType', api, 15 /* ICE_CREAM_SANDWICH_1 */, 'textAutoCorrect'),
            canRequestEnhancedWebAccessibility: (result, api) => api < 26 /* OREO */,
            capitalize: (result, api, value) => {
                switch (parseInt(value)) {
                    case 1:
                        value = 'textCapSentences';
                        break;
                    case 2:
                        value = 'textCapWords';
                        break;
                    default:
                        return api < 16 /* JELLYBEAN */;
                }
                return substitute(result, 'inputType', api, 15 /* ICE_CREAM_SANDWICH_1 */, value);
            },
            codes: (result, api) => api < 29 /* Q */,
            dayOfWeekBackground: (result, api) => api < 23 /* MARSHMALLOW */,
            dayOfWeekTextAppearance: (result, api) => api < 23 /* MARSHMALLOW */,
            directionDescriptions: (result, api) => api < 23 /* MARSHMALLOW */,
            editable: (result, api) => substitute(result, 'inputType', api, 15 /* ICE_CREAM_SANDWICH_1 */, 'text'),
            enabled: (result, api) => api < 15 /* ICE_CREAM_SANDWICH_1 */,
            endYear: (result, api) => substitute(result, 'maxDate', api, 16 /* JELLYBEAN */),
            fadingEdge: (result, api) => substitute(result, 'requiresFadingEdge', api, 14 /* ICE_CREAM_SANDWICH */),
            focusedMonthDateColor: (result, api) => api < 23 /* MARSHMALLOW */,
            headerAmPmTextAppearance: (result, api) => substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            headerDayOfMonthTextAppearance: (result, api) =>
                substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            headerMonthTextAppearance: (result, api) =>
                substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            headerTimeTextAppearance: (result, api) => substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            headerYearTextAppearance: (result, api) => substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            horizontalGap: (result, api) => api < 29 /* Q */,
            iconPreview: (result, api) => api < 29 /* Q */,
            inputMethod: (result, api) => substitute(result, 'inputType', api, 15 /* ICE_CREAM_SANDWICH_1 */, 'text'),
            isModifier: (result, api) => api < 29 /* Q */,
            isRepeatable: (result, api) => api < 29 /* Q */,
            isSticky: (result, api) => api < 29 /* Q */,
            keyBackground: (result, api) => api < 29 /* Q */,
            keyEdgeFlags: (result, api) => api < 29 /* Q */,
            keyHeight: (result, api) => api < 29 /* Q */,
            keyIcon: (result, api) => api < 29 /* Q */,
            keyLabel: (result, api) => api < 29 /* Q */,
            keyOutputText: (result, api) => api < 29 /* Q */,
            keyPreviewHeight: (result, api) => api < 29 /* Q */,
            keyPreviewLayout: (result, api) => api < 29 /* Q */,
            keyPreviewOffset: (result, api) => api < 29 /* Q */,
            keyTextColor: (result, api) => api < 29 /* Q */,
            keyTextSize: (result, api) => api < 29 /* Q */,
            keyWidth: (result, api) => api < 29 /* Q */,
            keyboardMode: (result, api) => api < 29 /* Q */,
            labelTextSize: (result, api) => api < 29 /* Q */,
            numeric: (result, api) => substitute(result, 'inputType', api, 15 /* ICE_CREAM_SANDWICH_1 */, 'number'),
            password: (result, api) =>
                substitute(result, 'inputType', api, 15 /* ICE_CREAM_SANDWICH_1 */, 'textPassword'),
            phoneNumber: (result, api) => substitute(result, 'inputType', api, 15 /* ICE_CREAM_SANDWICH_1 */, 'phone'),
            popupCharacters: (result, api) => api < 29 /* Q */,
            popupKeyboard: (result, api) => api < 29 /* Q */,
            popupLayout: (result, api) => api < 29 /* Q */,
            protectionLevel: (result, api, value) => {
                switch (value) {
                    case 'signatureOrSystem':
                    case 'system':
                        return api < 23 /* MARSHMALLOW */;
                    default:
                        return true;
                }
            },
            restoreNeedsApplication: (result, api) => api < 15 /* ICE_CREAM_SANDWICH_1 */,
            rowEdgeFlags: (result, api) => api < 29 /* Q */,
            searchButtonText: (result, api) => api < 15 /* ICE_CREAM_SANDWICH_1 */,
            selectedDateVerticalBar: (result, api) => api < 23 /* MARSHMALLOW */,
            selectedWeekBackgroundColor: (result, api) => api < 23 /* MARSHMALLOW */,
            sharedUserId: (result, api) => api < 29 /* Q */,
            sharedUserLabel: (result, api) => api < 29 /* Q */,
            showOnLockScreen: (result, api) => substitute(result, 'showForAllUsers', api, 23 /* MARSHMALLOW */),
            showWeekNumber: (result, api) => api < 23 /* MARSHMALLOW */,
            shownWeekCount: (result, api) => api < 23 /* MARSHMALLOW */,
            startYear: (result, api) => substitute(result, 'minDate', api, 16 /* JELLYBEAN */),
            state_long_pressable: (result, api) => api < 29 /* Q */,
            targetDescriptions: (result, api) => api < 23 /* MARSHMALLOW */,
            targetProcesses: (result, api) => api < 29 /* Q */,
            targetSandboxVersion: (result, api) => api < 29 /* Q */,
            unfocusedMonthDateColor: (result, api) => api < 23 /* MARSHMALLOW */,
            verticalCorrection: (result, api) => api < 29 /* Q */,
            verticalGap: (result, api) => api < 29 /* Q */,
            weekNumberColor: (result, api) => api < 23 /* MARSHMALLOW */,
            weekSeparatorLineColor: (result, api) => api < 23 /* MARSHMALLOW */,
            windowOverscan: (result, api) => api < 30 /* R */,
            windowSwipeToDismiss: (result, api) => api < 30 /* R */,
            yearListItemTextAppearance: (result, api) =>
                substitute(result, 'yearListTextColor', api, 23 /* MARSHMALLOW */),
            yearListSelectorColor: (result, api) => api < 23 /* MARSHMALLOW */,
        },
    };
    function getValue(api, tagName, obj, attr) {
        var _a, _b;
        for (const build of [API_VERSION[api], API_VERSION[0]]) {
            const value =
                (_b = (_a = build.assign[tagName]) === null || _a === void 0 ? void 0 : _a[obj]) === null ||
                _b === void 0
                    ? void 0
                    : _b[attr];
            if (value) {
                return value;
            }
        }
        return '';
    }

    var customization = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        API_VERSION: API_VERSION,
        DEPRECATED_ATTRIBUTE: DEPRECATED_ATTRIBUTE,
        getValue: getValue,
    });

    var ResourceUI = squared.base.ResourceUI;
    const { NODE_PROCEDURE } = squared.base.lib.constant;
    const { CSS_PROPERTIES, formatPX, isLength, isPercent, parseTransform } = squared.lib.css;
    const { getNamedItem, getRangeClientRect } = squared.lib.dom;
    const { clamp, truncate } = squared.lib.math;
    const {
        capitalize: capitalize$1,
        convertInt,
        convertWord,
        fromLastIndexOf: fromLastIndexOf$1,
        hasKeys,
        isString: isString$1,
        replaceMap,
        splitPair,
    } = squared.lib.util;
    const {
        constraint: LAYOUT_CONSTRAINT,
        relative: LAYOUT_RELATIVE,
        relativeParent: LAYOUT_RELATIVE_PARENT,
    } = LAYOUT_MAP;
    const BOX_MARGIN = CSS_PROPERTIES.margin.value;
    const BOX_PADDING = CSS_PROPERTIES.padding.value;
    const OPTIONS_LINEHEIGHT = {
        'height': 'auto',
        'min-height': 'auto',
        'line-height': 'normal',
        'white-space': 'nowrap',
    };
    function checkTextAlign(value, ignoreStart) {
        switch (value) {
            case 'left':
            case 'start':
                return !ignoreStart ? value : '';
            case 'center':
                return 'center_horizontal';
            case 'justify':
            case 'initial':
                return !ignoreStart ? 'start' : '';
            default:
                return value;
        }
    }
    function checkMergableGravity(value, direction) {
        const indexA = direction.indexOf(value + '_horizontal');
        const indexB = direction.indexOf(value + '_vertical');
        if (indexA !== -1 && indexB !== -1) {
            direction.splice(Math.min(indexA, indexB), 1);
            direction.splice(Math.max(indexA, indexB) - 1, 1);
            if (!direction.includes(value)) {
                direction.push(value);
            }
            return true;
        } else if (direction.includes(value)) {
            if (indexA !== -1) {
                direction.splice(indexA, 1);
                return true;
            }
            if (indexB !== -1) {
                direction.splice(indexB, 1);
                return true;
            }
        }
        return false;
    }
    function setMultiline(node, lineHeight, overwrite) {
        const lineHeightAdjust = node.dataset.androidLineHeightAdjust;
        if (lineHeightAdjust !== 'false') {
            let offset = getLineSpacingExtra(node, lineHeight);
            lineHeight *= (lineHeightAdjust && parseFloat(lineHeightAdjust)) || node.localSettings.lineHeightAdjust;
            if (node.api >= 28 /* PIE */) {
                node.android('lineHeight', truncate(lineHeight, node.localSettings.floatPrecision) + 'px', overwrite);
            } else if (offset > 0) {
                node.android('lineSpacingExtra', truncate(offset, node.localSettings.floatPrecision) + 'px', overwrite);
            } else {
                return;
            }
            offset = Math.floor(offset);
            if (offset > 0 && node.pageFlow) {
                if (node.inlineDimension) {
                    node.modifyBox(16 /* PADDING_TOP */, offset);
                    node.modifyBox(64 /* PADDING_BOTTOM */, offset);
                } else {
                    const renderParent = node.renderParent;
                    if (
                        renderParent.layoutVertical ||
                        renderParent.layoutRelative ||
                        renderParent.hasAlign(128 /* COLUMN */)
                    ) {
                        const renderChildren = node.renderParent.renderChildren;
                        const index = renderChildren.findIndex(item => item === node);
                        if (index > 0 && offset > Math.max(node.marginTop, 0) + node.borderTopWidth) {
                            node.setBox(1 /* MARGIN_TOP */, { reset: 1, adjustment: offset, max: true });
                        }
                        if (
                            (node.blockStatic || index === renderChildren.length - 1) &&
                            offset > Math.max(node.marginBottom, 0) + node.borderBottomWidth
                        ) {
                            node.setBox(4 /* MARGIN_BOTTOM */, { reset: 1, adjustment: offset, max: true });
                        }
                    }
                }
            }
        }
    }
    function setLineHeight(node, lineHeight, inlineStyle, top, bottom, overwrite, parent) {
        if (
            lineHeight === 0 ||
            node.imageContainer ||
            (node.rendering && !overwrite) ||
            node.cssInitial('lineHeight') === 'normal'
        ) {
            return;
        }
        if (node.multiline) {
            setMultiline(node, lineHeight, false);
        } else {
            const height = node.height;
            if (lineHeight === height) {
                node.mergeGravity('gravity', 'center_vertical', false);
            } else {
                const setBoxPadding = (offset, padding) => {
                    if (offset > 0) {
                        if (
                            (!node.inline &&
                                (inlineStyle || height > lineHeight) &&
                                (node.styleText || padding) &&
                                !(node.inputElement && !isLength(node.cssInitial('lineHeight'), true))) ||
                            parent
                        ) {
                            if (top) {
                                let adjustment = offset;
                                if (parent) {
                                    adjustment -= parent.paddingTop;
                                }
                                adjustment = Math.round(adjustment - (!padding ? node.paddingTop : 0));
                                if (adjustment > 0) {
                                    (parent || node).setBox(16 /* PADDING_TOP */, { adjustment });
                                }
                            }
                            if (bottom) {
                                if (parent) {
                                    offset -= parent.paddingBottom;
                                }
                                offset = Math.round(offset - (!padding ? node.paddingBottom : 0));
                                if (offset > 0) {
                                    (parent || node).setBox(64 /* PADDING_BOTTOM */, { adjustment: offset });
                                }
                            }
                        } else if (node.pageFlow) {
                            if (top && (inlineStyle || !node.baselineAltered)) {
                                const adjustment = Math.floor(
                                    offset -
                                        node.paddingTop -
                                        node.borderTopWidth -
                                        Math.max(0, node.marginTop + node.getBox(1 /* MARGIN_TOP */)[1])
                                );
                                if (adjustment > 0) {
                                    node.setBox(1 /* MARGIN_TOP */, { adjustment });
                                }
                            }
                            if (bottom) {
                                offset = Math.floor(
                                    offset -
                                        node.paddingBottom -
                                        node.borderBottomWidth -
                                        Math.max(0, node.marginBottom + node.getBox(4 /* MARGIN_BOTTOM */)[1])
                                );
                                if (offset > 0) {
                                    node.setBox(4 /* MARGIN_BOTTOM */, { adjustment: offset });
                                }
                            }
                        }
                    }
                };
                if (node.textElement) {
                    setBoxPadding(getLineSpacingExtra(node, lineHeight));
                } else if (height) {
                    const offset = lineHeight / 2 - node.paddingTop;
                    if (offset > 0) {
                        node.modifyBox(16 /* PADDING_TOP */, offset);
                    }
                } else if (node.inputElement) {
                    const textHeight = node.actualTextHeight({ tagName: 'span' });
                    if (!isNaN(textHeight)) {
                        let rows;
                        switch (node.tagName) {
                            case 'SELECT':
                                rows = node.toElementInt('size', 1);
                                break;
                            case 'TEXTAREA':
                                rows = node.toElementInt('rows', 1);
                                break;
                            default:
                                rows = 1;
                                break;
                        }
                        setBoxPadding((lineHeight - textHeight * Math.max(rows, 1)) / 2, true);
                    }
                } else {
                    setBoxPadding((lineHeight - node.bounds.height) / 2);
                }
            }
        }
    }
    function getLineHeight(node, lineHeight, checkOnly) {
        if (!node.rendering && (!node.multiline || (node.lineHeight === 0 && node.android('lineHeight') === ''))) {
            const result = node.has('lineHeight') ? Math.max(node.lineHeight, lineHeight) : lineHeight;
            if (!checkOnly) {
                node.setCacheValue('lineHeight', 0);
            }
            return result;
        }
        return 0;
    }
    function getLineSpacingExtra(node, lineHeight) {
        let height = node.data(ResourceUI.KEY_NAME, 'textRange');
        if (!height) {
            if (node.plainText) {
                if (node.naturalChild) {
                    height = node.bounds.height / (node.bounds.numberOfLines || 1);
                } else {
                    height = node.actualTextHeight();
                    node.data(ResourceUI.KEY_NAME, 'textRange', height);
                }
            }
        }
        if (!height && node.styleText) {
            node.cssTryAll(
                !node.pseudoElement
                    ? OPTIONS_LINEHEIGHT
                    : Object.assign(Object.assign({}, OPTIONS_LINEHEIGHT), { display: 'inline-block' }),
                function () {
                    var _a;
                    height = (_a = getRangeClientRect(this.element)) === null || _a === void 0 ? void 0 : _a.height;
                }
            );
        }
        return height ? (lineHeight - height) / 2 : 0;
    }
    function constraintMinMax(node, horizontal) {
        if (!node.hasPX(horizontal ? 'width' : 'height', { percent: false })) {
            const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', { modified: true });
            if (minWH !== '' && minWH !== '100%' && parseFloat(minWH) > 0 && isLength(minWH, true)) {
                if (horizontal) {
                    if (ascendFlexibleWidth(node)) {
                        node.setLayoutWidth('0px', false);
                        if (node.flexibleWidth) {
                            node.app(
                                'layout_constraintWidth_min',
                                formatPX(node.parseWidth(minWH) + node.contentBoxWidth)
                            );
                            node.css('minWidth', 'auto');
                        }
                    }
                } else if (ascendFlexibleHeight(node)) {
                    node.setLayoutHeight('0px', false);
                    if (node.flexibleHeight) {
                        node.app(
                            'layout_constraintHeight_min',
                            formatPX(node.parseHeight(minWH) + node.contentBoxHeight)
                        );
                        node.css(horizontal ? 'minWidth' : 'minHeight', 'auto');
                    }
                }
            }
        }
        if (horizontal || !node.support.maxDimension) {
            const maxWH = node.cssInitial(horizontal ? 'maxWidth' : 'maxHeight', { modified: true });
            if (maxWH !== '' && maxWH !== '100%' && isLength(maxWH, true)) {
                if (horizontal) {
                    if (ascendFlexibleWidth(node)) {
                        const value = node.parseWidth(maxWH);
                        if (value > node.width || node.percentWidth) {
                            node.setLayoutWidth('0px');
                            node.app(
                                'layout_constraintWidth_max',
                                formatPX(value + (node.contentBox ? node.contentBoxWidth : 0))
                            );
                            node.css('maxWidth', 'auto');
                        }
                    }
                } else if (ascendFlexibleHeight(node)) {
                    const value = node.parseHeight(maxWH);
                    if (value > node.height || node.percentHeight) {
                        node.setLayoutHeight('0px');
                        node.app(
                            'layout_constraintHeight_max',
                            formatPX(value + (node.contentBox ? node.contentBoxHeight : 0))
                        );
                        node.css('maxHeight', 'auto');
                    }
                }
            }
        }
    }
    function setConstraintPercent(node, value, horizontal, percent) {
        if (value < 1 && !isNaN(percent) && node.pageFlow) {
            const parent = node.actualParent || node.documentParent;
            let boxPercent, marginPercent;
            if (horizontal) {
                const width = parent.box.width;
                boxPercent = !parent.gridElement ? node.contentBoxWidth / width : 0;
                marginPercent =
                    (Math.max(node.getBox(8 /* MARGIN_LEFT */)[0] === 0 ? node.marginLeft : 0, 0) +
                        (node.getBox(2 /* MARGIN_RIGHT */)[0] === 0 ? node.marginRight : 0)) /
                    width;
            } else {
                const height = parent.box.height;
                boxPercent = !parent.gridElement ? node.contentBoxHeight / height : 0;
                marginPercent =
                    (Math.max(node.getBox(1 /* MARGIN_TOP */)[0] === 0 ? node.marginTop : 0, 0) +
                        (node.getBox(4 /* MARGIN_BOTTOM */)[0] === 0 ? node.marginBottom : 0)) /
                    height;
            }
            if (percent === 1 && value + marginPercent >= 1) {
                value = 1 - marginPercent;
            } else {
                if (boxPercent) {
                    if (percent < boxPercent) {
                        boxPercent = Math.max(percent, 0);
                        percent = 0;
                    } else {
                        percent -= boxPercent;
                    }
                }
                if (percent === 0) {
                    boxPercent -= marginPercent;
                } else {
                    percent = Math.max(percent - marginPercent, 0);
                }
                value = Math.min(value + boxPercent, 1);
            }
        }
        let outerWrapper = node.outerMostWrapper;
        if (
            outerWrapper !== node &&
            outerWrapper.css(horizontal ? 'width' : 'height') !== node.css(horizontal ? 'width' : 'height')
        ) {
            outerWrapper = node;
        }
        if (value === 1 && !node.hasPX(horizontal ? 'maxWidth' : 'maxHeight')) {
            setLayoutDimension(
                outerWrapper,
                horizontal ? outerWrapper.getMatchConstraint() : 'match_parent',
                horizontal,
                false
            );
            if (node !== outerWrapper) {
                setLayoutDimension(node, horizontal ? node.getMatchConstraint() : 'match_parent', horizontal, false);
            }
        } else {
            outerWrapper.app(
                horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent',
                truncate(value, node.localSettings.floatPrecision)
            );
            setLayoutDimension(outerWrapper, '0px', horizontal, false);
            if (node !== outerWrapper) {
                setLayoutDimension(node, '0px', horizontal, false);
            }
        }
        return percent;
    }
    function constraintPercentValue(node, horizontal, percent) {
        const value = horizontal ? node.percentWidth : node.percentHeight;
        return value ? setConstraintPercent(node, value, horizontal, percent) : percent;
    }
    function constraintPercentWidth(node, percent = 1) {
        const value = node.percentWidth;
        if (value) {
            if (
                node.renderParent.hasPX('width', { percent: false }) &&
                !(node.actualParent || node.documentParent).layoutElement
            ) {
                if (value < 1) {
                    node.setLayoutWidth(formatPX(node.actualWidth));
                } else {
                    node.setLayoutWidth(node.getMatchConstraint(), false);
                }
            } else if (!node.inputElement) {
                return constraintPercentValue(node, true, percent);
            }
        }
        return percent;
    }
    function constraintPercentHeight(node, percent = 1) {
        const value = node.percentHeight;
        if (value) {
            if (
                node.renderParent.hasPX('height', { percent: false }) &&
                !(node.actualParent || node.documentParent).layoutElement
            ) {
                if (value < 1) {
                    node.setLayoutHeight(formatPX(node.actualHeight));
                } else {
                    node.setLayoutHeight('match_parent', false);
                }
            } else if (!node.inputElement) {
                return constraintPercentValue(node, false, percent);
            }
        }
        return percent;
    }
    function ascendFlexibleWidth(node) {
        if (node.documentRoot && (node.hasWidth || node.blockStatic || node.blockWidth)) {
            return true;
        }
        let parent = node.renderParent,
            i = 0;
        while (parent) {
            if (
                !parent.inlineWidth &&
                (parent.hasWidth ||
                    parseInt(parent.layoutWidth) ||
                    parent.of(CONTAINER_NODE.CONSTRAINT, 32 /* BLOCK */) ||
                    (parent.documentRoot && (parent.blockWidth || parent.blockStatic)))
            ) {
                return true;
            } else if (parent.flexibleWidth) {
                if (++i > 1) {
                    return false;
                }
            } else if (parent.inlineWidth || (parent.naturalElement && parent.inlineVertical)) {
                return false;
            }
            parent = parent.renderParent;
        }
        return false;
    }
    function ascendFlexibleHeight(node) {
        var _a;
        if (node.documentRoot && node.hasHeight) {
            return true;
        }
        const parent = node.renderParent;
        return (
            (parent && (parent.hasHeight || (parent.layoutConstraint && parent.blockHeight))) ||
            ((_a = node.absoluteParent) === null || _a === void 0 ? void 0 : _a.hasHeight)
        );
    }
    function setLayoutDimension(node, value, horizontal, overwrite) {
        if (horizontal) {
            node.setLayoutWidth(value, overwrite);
        } else {
            node.setLayoutHeight(value, overwrite);
        }
    }
    function replaceLayoutPosition(node, parentId) {
        const left = node.anchorChain('left').shift();
        const right = node.anchorChain('right').shift();
        const top = node.anchorChain('top').shift();
        const bottom = node.anchorChain('bottom').shift();
        const transferHorizontalStyle = sibling => {
            sibling.app('layout_constraintHorizontal_bias', node.app('layout_constraintHorizontal_bias'));
            sibling.app('layout_constraintHorizontal_chainStyle', node.app('layout_constraintHorizontal_chainStyle'));
        };
        const transferVerticalStyle = sibling => {
            sibling.app('layout_constraintVertical_bias', node.app('layout_constraintVertical_bias'));
            sibling.app('layout_constraintVertical_chainStyle', node.app('layout_constraintVertical_chainStyle'));
        };
        if (left && right) {
            left.anchor('rightLeft', right.documentId, true);
            right.anchor('leftRight', left.documentId, true);
        } else if (left) {
            left.anchorDelete('rightLeft');
            if (node.alignParent('right')) {
                left.anchor('right', parentId);
                transferHorizontalStyle(left);
            }
        } else if (right) {
            right.anchorDelete('leftRight');
            if (node.alignParent('left')) {
                right.anchor('left', parentId);
                transferHorizontalStyle(right);
            }
        }
        if (top && bottom) {
            top.anchor('bottomTop', bottom.documentId, true);
            bottom.anchor('topBottom', top.documentId, true);
        } else if (top) {
            top.anchorDelete('bottomTop');
            if (node.alignParent('bottom')) {
                top.anchor('bottom', parentId);
                transferVerticalStyle(top);
            }
        } else if (bottom) {
            bottom.anchorDelete('topBottom');
            if (node.alignParent('top')) {
                bottom.anchor('top', parentId);
                transferVerticalStyle(bottom);
            }
        }
    }
    function getGravityValues(node, attr, value) {
        const gravity = node.android(attr);
        if (gravity !== '') {
            const result = gravity.split('|');
            if (value) {
                if (result.includes(value)) {
                    return;
                }
                result.push(value);
            }
            return result;
        } else if (value) {
            node.android(attr, value);
        }
    }
    function calculateBias(start, end, accuracy = 3) {
        if (start === 0) {
            return 0;
        } else if (end === 0) {
            return 1;
        }
        return parseFloat(truncate(Math.max(start / (start + end), 0), accuracy));
    }
    const hasFlexibleContainer = renderParent =>
        !!renderParent && (renderParent.layoutConstraint || renderParent.layoutGrid);
    var View$MX = Base => {
        return class View extends Base {
            constructor() {
                super(...arguments);
                this.api = 30 /* LATEST */;
                this._namespaces = { android: {} };
                this._containerType = 0;
                this._controlName = '';
                this._positioned = false;
            }
            static availablePercent(nodes, dimension, boxSize) {
                const horizontal = dimension === 'width';
                let percent = 1,
                    valid = false;
                for (let i = 0, length = nodes.length; i < length; ++i) {
                    const sibling = nodes[i].innerMostWrapped;
                    if (sibling.pageFlow) {
                        valid = true;
                        if (sibling.hasPX(dimension, { initial: true })) {
                            const value = sibling.cssInitial(dimension);
                            if (isPercent(value)) {
                                percent -= parseFloat(value) / 100;
                                continue;
                            } else if (isLength(value)) {
                                percent -= horizontal
                                    ? Math.max(sibling.actualWidth + sibling.marginLeft + sibling.marginRight, 0) /
                                      boxSize
                                    : Math.max(sibling.actualHeight + sibling.marginTop + sibling.marginBottom, 0) /
                                      boxSize;
                                continue;
                            }
                        }
                        percent -= sibling.linear[dimension] / boxSize;
                    }
                }
                return valid ? Math.max(0, percent) : 1;
            }
            static getControlName(containerType, api = 30 /* LATEST */) {
                const name = CONTAINER_NODE[containerType];
                return (api >= 29 /* Q */ && CONTAINER_TAGNAME_X[name]) || CONTAINER_TAGNAME[name] || '';
            }
            setControlType(controlName, containerType) {
                this.controlName = controlName;
                if (containerType) {
                    this._containerType = containerType;
                } else if (this._containerType === 0) {
                    this._containerType = CONTAINER_NODE.UNKNOWN;
                }
            }
            setExclusions() {
                super.setExclusions();
                if (!this.hasProcedure(NODE_PROCEDURE.LOCALIZATION)) {
                    this.localSettings.supportRTL = false;
                }
            }
            setLayout() {
                var _a;
                if (this.plainText) {
                    this.setLayoutWidth('wrap_content', false);
                    this.setLayoutHeight('wrap_content', false);
                    return;
                }
                switch (this.css('visibility')) {
                    case 'visible':
                        break;
                    case 'hidden':
                        this.hide({ hidden: true });
                        break;
                    case 'collapse':
                        this.hide({ collapse: true });
                        break;
                }
                const actualParent = this.actualParent || this.documentParent;
                const renderParent = this.renderParent;
                const containsWidth = !renderParent.inlineWidth;
                const containsHeight = !renderParent.inlineHeight;
                let { layoutWidth, layoutHeight } = this;
                if (layoutWidth === '') {
                    if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                        const width = this.css('width');
                        let value = -1;
                        if (isPercent(width)) {
                            const expandable = () =>
                                width === '100%' &&
                                containsWidth &&
                                (this.support.maxDimension || !this.hasPX('maxWidth'));
                            if (this.inputElement) {
                                if (expandable()) {
                                    layoutWidth = this.getMatchConstraint(renderParent);
                                } else {
                                    value = this.actualWidth;
                                }
                            } else if (renderParent.layoutConstraint) {
                                if (containsWidth) {
                                    if (expandable()) {
                                        layoutWidth = this.getMatchConstraint(renderParent);
                                    } else {
                                        this.setConstraintDimension(1);
                                        layoutWidth = this.layoutWidth;
                                    }
                                } else {
                                    value = this.actualWidth;
                                }
                            } else if (renderParent.layoutGrid) {
                                layoutWidth = '0px';
                                this.android(
                                    'layout_columnWeight',
                                    truncate(parseFloat(width) / 100, this.localSettings.floatPrecision)
                                );
                            } else if (this.imageElement) {
                                if (expandable()) {
                                    layoutWidth = this.getMatchConstraint(renderParent);
                                } else {
                                    value = this.bounds.width;
                                }
                            } else if (width === '100%') {
                                if (!this.support.maxDimension && this.hasPX('maxWidth')) {
                                    const maxWidth = this.css('maxWidth');
                                    const maxValue = this.parseWidth(maxWidth);
                                    const absoluteParent = this.absoluteParent || actualParent;
                                    if (maxWidth === '100%') {
                                        if (containsWidth && Math.ceil(maxValue) >= absoluteParent.box.width) {
                                            layoutWidth = this.getMatchConstraint(renderParent);
                                        } else {
                                            value = Math.min(this.actualWidth, maxValue);
                                        }
                                    } else if (maxValue) {
                                        if (this.blockDimension) {
                                            value = Math.min(this.actualWidth, maxValue);
                                        } else {
                                            layoutWidth =
                                                Math.floor(maxValue) < absoluteParent.box.width
                                                    ? 'wrap_content'
                                                    : this.getMatchConstraint(renderParent);
                                        }
                                    }
                                }
                                if (layoutWidth === '' && (this.documentRoot || containsWidth)) {
                                    layoutWidth = this.getMatchConstraint(renderParent);
                                }
                            } else {
                                value = this.actualWidth;
                            }
                        } else if (isLength(width)) {
                            value = this.actualWidth;
                        }
                        if (value !== -1) {
                            layoutWidth = formatPX(value);
                        }
                    } else if (!this.isEmpty()) {
                        switch (this.cssInitial('width')) {
                            case 'max-content':
                            case 'fit-content':
                                this.renderEach(node => {
                                    if (!node.hasPX('width') && !node.hasPX('maxWidth')) {
                                        node.setLayoutWidth('wrap_content');
                                    }
                                });
                                layoutWidth = 'wrap_content';
                                break;
                            case 'min-content': {
                                const nodes = [];
                                let maxWidth = 0;
                                this.renderEach(node => {
                                    if (!node.textElement || node.hasPX('width')) {
                                        maxWidth = Math.max(node.actualWidth, maxWidth);
                                    } else {
                                        maxWidth = Math.max(node.width, maxWidth);
                                        if (node.support.maxDimension) {
                                            nodes.push(node);
                                        }
                                    }
                                });
                                const length = nodes.length;
                                if (length && maxWidth) {
                                    const width = formatPX(maxWidth);
                                    for (let i = 0; i < length; ++i) {
                                        const node = nodes[i];
                                        if (!node.hasPX('maxWidth')) {
                                            node.css('maxWidth', width);
                                        }
                                    }
                                }
                                layoutWidth = 'wrap_content';
                                break;
                            }
                        }
                    }
                    if (layoutWidth === '') {
                        if (
                            this.textElement &&
                            this.textEmpty &&
                            this.inlineFlow &&
                            !this.visibleStyle.backgroundImage
                        ) {
                            layoutWidth = formatPX(this.actualWidth);
                        } else if (this.imageElement && this.hasHeight) {
                            layoutWidth = 'wrap_content';
                        } else if (
                            containsWidth &&
                            ((this.nodeGroup &&
                                ((this.hasAlign(256 /* FLOAT */) &&
                                    (this.hasAlign(32 /* BLOCK */) || this.hasAlign(1024 /* RIGHT */))) ||
                                    this.hasAlign(16384 /* PERCENT */))) ||
                                (actualParent.flexElement && this.find(item => item.multiline, { cascade: true })) ||
                                (this.layoutGrid && this.find(node => node.flexibleWidth)))
                        ) {
                            layoutWidth = this.getMatchConstraint(renderParent);
                        } else if (!this.imageElement && !this.inputElement && !this.controlElement) {
                            const checkParentWidth = block => {
                                var _a, _b;
                                if (!actualParent.pageFlow && this.find(node => node.textElement)) {
                                    return;
                                } else if (this.styleText) {
                                    if (
                                        ((_a = this.textBounds) === null || _a === void 0 ? void 0 : _a.numberOfLines) >
                                        1
                                    ) {
                                        if (block) {
                                            layoutWidth = 'match_parent';
                                        }
                                        return;
                                    } else if (this.cssTry('display', 'inline-block')) {
                                        const width = Math.ceil(
                                            ((_b = getRangeClientRect(this.element)) === null || _b === void 0
                                                ? void 0
                                                : _b.width) || 0
                                        );
                                        layoutWidth = width >= actualParent.box.width ? 'wrap_content' : 'match_parent';
                                        this.cssFinally('display');
                                        return;
                                    }
                                }
                                layoutWidth = this.getMatchConstraint(renderParent);
                            };
                            if (renderParent.layoutGrid) {
                                if (this.blockStatic && renderParent.android('columnCount') === '1') {
                                    layoutWidth = this.getMatchConstraint(renderParent);
                                }
                            } else if (this.blockStatic) {
                                if (this.documentRoot) {
                                    layoutWidth = 'match_parent';
                                } else if (!actualParent.layoutElement) {
                                    if (
                                        this.nodeGroup ||
                                        renderParent.hasWidth ||
                                        this.hasAlign(32 /* BLOCK */) ||
                                        this.rootElement
                                    ) {
                                        layoutWidth = this.getMatchConstraint(renderParent);
                                    } else {
                                        checkParentWidth(true);
                                    }
                                } else if (
                                    containsWidth &&
                                    ((actualParent.gridElement && !renderParent.layoutElement) ||
                                        (actualParent.flexElement &&
                                            this.layoutVertical &&
                                            this.find(item => item.textElement && item.multiline)))
                                ) {
                                    layoutWidth = this.getMatchConstraint(renderParent);
                                }
                            } else if (
                                this.floating &&
                                this.block &&
                                !this.rightAligned &&
                                this.alignParent('left') &&
                                this.alignParent('right')
                            ) {
                                layoutWidth = 'match_parent';
                            } else if (
                                this.naturalElement &&
                                this.inlineStatic &&
                                !this.blockDimension &&
                                this.find(item => item.naturalElement && item.blockStatic) &&
                                !actualParent.layoutElement &&
                                (renderParent.layoutVertical ||
                                    (!this.alignSibling('leftRight') && !this.alignSibling('rightLeft')))
                            ) {
                                checkParentWidth(false);
                            }
                        }
                    }
                    this.setLayoutWidth(layoutWidth || 'wrap_content');
                }
                if (layoutHeight === '') {
                    if (this.hasPX('height') && (!this.inlineStatic || this.cssInitial('height') === '')) {
                        const height = this.css('height');
                        let value = -1;
                        if (isPercent(height)) {
                            if (this.inputElement) {
                                value = this.bounds.height;
                            } else if (this.imageElement) {
                                if (height === '100%' && containsHeight) {
                                    layoutHeight = 'match_parent';
                                } else {
                                    value = this.bounds.height;
                                }
                            } else if (height === '100%') {
                                if (!this.support.maxDimension) {
                                    const maxHeight = this.css('maxHeight');
                                    const maxValue = this.parseHeight(maxHeight);
                                    const absoluteParent = this.absoluteParent || actualParent;
                                    if (maxHeight === '100%') {
                                        if (containsHeight || Math.ceil(maxValue) >= absoluteParent.box.height) {
                                            layoutHeight = 'match_parent';
                                        } else {
                                            value = Math.min(this.actualHeight, maxValue);
                                        }
                                    } else if (maxValue) {
                                        if (this.blockDimension) {
                                            value = Math.min(this.actualHeight, maxValue);
                                        } else {
                                            layoutHeight =
                                                Math.floor(maxValue) < absoluteParent.box.height
                                                    ? 'wrap_content'
                                                    : 'match_parent';
                                        }
                                    } else if (containsHeight) {
                                        layoutHeight = 'match_parent';
                                    }
                                }
                                if (layoutHeight === '') {
                                    if (!this.pageFlow) {
                                        if (this.css('position') === 'fixed') {
                                            layoutHeight = 'match_parent';
                                        } else if (
                                            renderParent.layoutConstraint &&
                                            (this.hasPX('top') || this.hasPX('bottom'))
                                        ) {
                                            layoutHeight = '0px';
                                        }
                                    } else if (this.documentRoot || (containsHeight && this.onlyChild)) {
                                        layoutHeight = 'match_parent';
                                    }
                                }
                            }
                            if (layoutHeight === '' && this.hasHeight) {
                                value = this.actualHeight;
                            }
                        } else if (isLength(height)) {
                            value = this.actualHeight;
                        }
                        if (value !== -1) {
                            if (
                                this.is(CONTAINER_NODE.LINE) &&
                                this.tagName !== 'HR' &&
                                this.hasPX('height', { initial: true })
                            ) {
                                value += this.borderTopWidth + this.borderBottomWidth;
                            }
                            if (
                                this.styleText &&
                                this.multiline &&
                                !this.overflowY &&
                                !this.hasPX('minHeight') &&
                                !actualParent.layoutElement
                            ) {
                                this.android('minHeight', formatPX(value));
                                layoutHeight = 'wrap_content';
                            } else {
                                layoutHeight = formatPX(value);
                            }
                        }
                    }
                    if (layoutHeight === '') {
                        if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                            if (
                                renderParent.layoutConstraint &&
                                !this.floating &&
                                this.alignParent('top') &&
                                this.actualHeight >= (this.absoluteParent || actualParent).box.height
                            ) {
                                layoutHeight = '0px';
                                this.anchor('bottom', 'parent');
                            } else if (this.naturalChild && !this.pseudoElement) {
                                layoutHeight = formatPX(this.actualHeight);
                            }
                        } else if (this.imageElement && this.hasWidth) {
                            layoutHeight = 'wrap_content';
                        } else if (this.display === 'table-cell' && actualParent.hasHeight) {
                            layoutHeight = 'match_parent';
                        }
                    }
                    this.setLayoutHeight(layoutHeight || 'wrap_content');
                } else if (
                    layoutHeight === '0px' &&
                    renderParent.inlineHeight &&
                    !(this.alignParent('top') && this.alignParent('bottom')) &&
                    renderParent.android('minHeight') === '' &&
                    !actualParent.layoutElement &&
                    actualParent === this.absoluteParent
                ) {
                    this.setLayoutHeight('wrap_content');
                }
                if (
                    this.hasPX('minWidth') &&
                    (!this.hasFlex('row') || (actualParent.flexElement && !this.flexibleWidth))
                ) {
                    const minWidth = this.css('minWidth');
                    if (minWidth === '100%' && this.inlineWidth) {
                        this.setLayoutWidth(this.getMatchConstraint(renderParent));
                    } else {
                        const width = this.parseWidth(minWidth) + (this.contentBox ? this.contentBoxWidth : 0);
                        if (width) {
                            this.android('minWidth', formatPX(width), false);
                        }
                    }
                }
                if (
                    this.hasPX('minHeight') &&
                    this.display !== 'table-cell' &&
                    (!this.hasFlex('column') || (actualParent.flexElement && !this.flexibleHeight))
                ) {
                    const minHeight = this.css('minHeight');
                    if (minHeight === '100%' && containsHeight && this.inlineHeight) {
                        this.setLayoutHeight('match_parent');
                    } else {
                        const height = this.parseHeight(minHeight) + (this.contentBox ? this.contentBoxHeight : 0);
                        if (height) {
                            this.android('minHeight', formatPX(height), false);
                        }
                    }
                }
                if (this.support.maxDimension) {
                    const maxWidth = this.css('maxWidth');
                    let maxHeight = this.css('maxHeight'),
                        width = -1;
                    if (isLength(maxWidth, true)) {
                        if (maxWidth === '100%') {
                            if (!this.hasPX('width', { initial: true })) {
                                if (this.svgElement) {
                                    width = this.bounds.width;
                                } else if (this.imageElement) {
                                    width = this.toElementInt('naturalWidth');
                                    if (width > this.documentParent.actualWidth) {
                                        this.setLayoutWidth(this.getMatchConstraint(renderParent));
                                        this.setLayoutHeight('wrap_content');
                                        width = -1;
                                        maxHeight = '';
                                    }
                                } else if (containsWidth) {
                                    this.setLayoutWidth(this.getMatchConstraint(renderParent));
                                }
                            }
                        } else {
                            width = this.parseWidth(maxWidth);
                        }
                    } else if (
                        !this.pageFlow &&
                        this.multiline &&
                        this.inlineWidth &&
                        !this.preserveWhiteSpace &&
                        (this.ascend({ condition: item => item.hasPX('width') }).length ||
                            !this.textContent.includes('\n'))
                    ) {
                        const maxLines = (_a = this.textBounds) === null || _a === void 0 ? void 0 : _a.numberOfLines;
                        if (maxLines && maxLines > 1) {
                            this.android('maxLines', maxLines.toString());
                        }
                        this.android('ellipsize', 'end');
                        this.android('breakStrategy', 'simple');
                        width = Math.ceil(this.actualWidth);
                    }
                    if (width >= 0) {
                        this.android('maxWidth', formatPX(width), false);
                    }
                    if (isLength(maxHeight, true)) {
                        let height = -1;
                        if (maxHeight === '100%' && !this.svgElement) {
                            if (!this.hasPX('height', { initial: true })) {
                                if (containsHeight) {
                                    this.setLayoutHeight('match_parent');
                                } else {
                                    height = this.imageElement
                                        ? this.toElementInt('naturalHeight')
                                        : this.parseHeight(maxHeight);
                                }
                            }
                        } else {
                            height = this.parseHeight(maxHeight);
                        }
                        if (height >= 0) {
                            this.android('maxHeight', formatPX(height));
                            if (this.flexibleHeight) {
                                this.setLayoutHeight('wrap_content');
                            }
                        }
                    }
                }
            }
            setAlignment() {
                const node = this.outerMostWrapper;
                const renderParent = this.renderParent;
                const outerRenderParent = node.renderParent || renderParent;
                const autoMargin = this.autoMargin;
                const setAutoMargin = target => {
                    if (
                        autoMargin.horizontal &&
                        (!target.blockWidth ||
                            target.hasWidth ||
                            target.hasPX('maxWidth') ||
                            target.innerMostWrapped.has('width', { type: 2 /* PERCENT */, not: '100%' }))
                    ) {
                        target.mergeGravity(
                            (target.blockWidth || !target.pageFlow) && !target.outerWrapper
                                ? 'gravity'
                                : 'layout_gravity',
                            autoMargin.leftRight ? 'center_horizontal' : autoMargin.left ? 'right' : 'left'
                        );
                        return true;
                    }
                    return false;
                };
                let textAlign = checkTextAlign(this.cssInitial('textAlign', { modified: true })),
                    textAutoMargin;
                if (this.nodeGroup && textAlign === '' && !this.hasAlign(256 /* FLOAT */)) {
                    const actualParent = this.actualParent;
                    if (actualParent) {
                        textAlign = checkTextAlign(actualParent.cssInitial('textAlign', { modified: true }));
                    }
                }
                if (this.pageFlow) {
                    let floatAlign = '';
                    if (
                        (this.inlineVertical && (outerRenderParent.layoutFrame || outerRenderParent.layoutGrid)) ||
                        this.display === 'table-cell'
                    ) {
                        const gravity = this.display === 'table-cell' ? 'gravity' : 'layout_gravity';
                        switch (this.cssInitial('verticalAlign', { modified: true })) {
                            case 'top':
                                node.mergeGravity(gravity, 'top');
                                break;
                            case 'middle':
                                node.mergeGravity(gravity, 'center_vertical');
                                break;
                            case 'bottom':
                                node.mergeGravity(gravity, 'bottom');
                                break;
                        }
                    }
                    if (!this.blockWidth) {
                        if (
                            outerRenderParent.layoutVertical ||
                            (this.documentRoot && (this.layoutVertical || this.layoutFrame))
                        ) {
                            if (this.floating) {
                                node.mergeGravity('layout_gravity', this.float);
                            } else if (
                                !setAutoMargin(node) &&
                                textAlign &&
                                this.hasWidth &&
                                !this.blockStatic &&
                                !this.inputElement &&
                                this.display !== 'table'
                            ) {
                                node.mergeGravity('layout_gravity', textAlign, false);
                            }
                        }
                        if (this.rightAligned) {
                            floatAlign = 'right';
                        } else if (this.nodeGroup) {
                            if (this.hasAlign(256 /* FLOAT */)) {
                                floatAlign = this.hasAlign(1024 /* RIGHT */) ? 'right' : 'left';
                            } else if (this.every(item => item.rightAligned)) {
                                floatAlign = 'right';
                            }
                        }
                    } else if (this.rightAligned && node.nodeGroup && node.layoutVertical) {
                        node.renderEach(item => {
                            if (item.rightAligned) {
                                item.mergeGravity('layout_gravity', 'right');
                            }
                        });
                    }
                    if (renderParent.layoutFrame) {
                        if (!setAutoMargin(this)) {
                            if (!this.innerWrapped) {
                                if (this.floating) {
                                    floatAlign = this.float;
                                }
                                if (
                                    floatAlign &&
                                    !renderParent.naturalElement &&
                                    (renderParent.inlineWidth || (!renderParent.documentRoot && this.onlyChild))
                                ) {
                                    renderParent.mergeGravity('layout_gravity', floatAlign);
                                    floatAlign = '';
                                }
                            }
                            if (this.centerAligned) {
                                this.mergeGravity('layout_gravity', checkTextAlign('center'));
                            } else if (this.rightAligned && renderParent.blockWidth) {
                                this.mergeGravity('layout_gravity', 'right');
                            }
                        }
                        if (this.onlyChild && node.documentParent.display === 'table-cell') {
                            let gravity;
                            switch (node.documentParent.css('verticalAlign')) {
                                case 'top':
                                    gravity = 'top';
                                    break;
                                case 'bottom':
                                    gravity = 'bottom';
                                    break;
                                default:
                                    gravity = 'center_vertical';
                                    break;
                            }
                            this.mergeGravity('layout_gravity', gravity);
                        }
                    }
                    if (floatAlign !== '') {
                        if (this.blockWidth) {
                            if (!textAlign || floatAlign === 'right') {
                                textAlign = floatAlign;
                            }
                        } else {
                            (node.blockWidth && this !== node ? this : node).mergeGravity('layout_gravity', floatAlign);
                        }
                    } else if (setAutoMargin(node.inlineWidth ? node : this)) {
                        textAutoMargin = !this.textElement;
                    } else if (
                        this.blockStatic &&
                        outerRenderParent.layoutVertical &&
                        (outerRenderParent.layoutLinear || outerRenderParent.layoutRelative)
                    ) {
                        node.mergeGravity('layout_gravity', 'left', false);
                    }
                }
                if (this.layoutElement) {
                    if (this.textElement) {
                        switch (this.css('justifyContent')) {
                            case 'center':
                            case 'space-around':
                            case 'space-evenly':
                                this.mergeGravity('gravity', 'center_horizontal');
                                break;
                            case 'flex-end':
                                this.mergeGravity('gravity', 'right');
                                break;
                        }
                        switch (this.css('alignItems')) {
                            case 'center':
                                this.mergeGravity('gravity', 'center_vertical');
                                break;
                            case 'flex-end':
                                this.mergeGravity('gravity', 'bottom');
                                break;
                        }
                    }
                } else if (!this.layoutConstraint && !this.layoutFrame && !this.layoutGrid) {
                    if (textAlign) {
                        if (!this.imageContainer) {
                            this.mergeGravity('gravity', textAlign);
                        }
                    } else if (!textAutoMargin && !this.inputElement) {
                        const textAlignParent = checkTextAlign(this.cssAscend('textAlign'), true);
                        if (textAlignParent !== '') {
                            if (this.imageContainer) {
                                if (this.pageFlow) {
                                    this.mergeGravity('layout_gravity', textAlignParent);
                                }
                            } else {
                                this.mergeGravity(
                                    this.rendering ||
                                        (this.textElement && (!this.inlineWidth || this.multiline)) ||
                                        this.display.startsWith('table-')
                                        ? 'gravity'
                                        : 'layout_gravity',
                                    textAlignParent
                                );
                            }
                        }
                    }
                }
                if (
                    autoMargin.vertical &&
                    (renderParent.layoutFrame || (renderParent.layoutVertical && renderParent.layoutLinear))
                ) {
                    node.mergeGravity(
                        'layout_gravity',
                        autoMargin.topBottom ? 'center_vertical' : autoMargin.top ? 'bottom' : 'top'
                    );
                }
            }
            setBoxSpacing() {
                const boxReset = this._boxReset;
                const boxAdjustment = this._boxAdjustment;
                for (let i = 0; i < 2; ++i) {
                    const margin = i === 0;
                    const attrs = margin ? BOX_MARGIN : BOX_PADDING;
                    let top = 0,
                        right = 0,
                        bottom = 0,
                        left = 0;
                    for (let j = 0; j < 4; ++j) {
                        const attr = attrs[j];
                        let value = !boxReset || boxReset[margin ? j : j + 4] === 0 ? this[attr] : 0;
                        if (value !== 0) {
                            if (margin) {
                                switch (j) {
                                    case 1:
                                        if (this.inline) {
                                            const outer = this.documentParent.box.right;
                                            const inner = this.bounds.right;
                                            if (Math.floor(inner) > outer) {
                                                if (!this.onlyChild && !this.alignParent('left')) {
                                                    this.setSingleLine(true, true);
                                                }
                                                continue;
                                            } else if (inner + value > outer) {
                                                value = clamp(outer - inner, 0, value);
                                            }
                                        }
                                        break;
                                    case 2:
                                        if (value < 0 && this.pageFlow && !this.blockStatic) {
                                            value = 0;
                                        }
                                        break;
                                }
                            } else {
                                switch (j) {
                                    case 0:
                                        value = this.actualPadding(attr, value);
                                        break;
                                    case 2:
                                        if (
                                            (this.hasPX('height', { percent: false, initial: true }) &&
                                                ((!this.layoutElement && (this.layoutVertical || this.layoutFrame)) ||
                                                    !this.pageFlow)) ||
                                            (this.documentParent.gridElement &&
                                                this.hasPX('height', { percent: false }))
                                        ) {
                                            continue;
                                        } else if (this.floatContainer) {
                                            let maxBottom = -Infinity;
                                            for (const item of this.naturalChildren) {
                                                if (item.floating) {
                                                    maxBottom = Math.max(item.bounds.bottom, maxBottom);
                                                }
                                            }
                                            value = clamp(this.bounds.bottom - maxBottom, 0, value);
                                        } else {
                                            value = this.actualPadding(attr, value);
                                        }
                                        break;
                                }
                            }
                        }
                        if (boxAdjustment) {
                            value += boxAdjustment[margin ? j : j + 4];
                        }
                        switch (j) {
                            case 0:
                                top = value;
                                break;
                            case 1:
                                right = value;
                                break;
                            case 2:
                                bottom = value;
                                break;
                            case 3:
                                left = value;
                                break;
                        }
                    }
                    if (margin) {
                        if (this.floating) {
                            let sibling = this.renderParent.renderChildren.find(item => !item.floating);
                            if (sibling) {
                                const boundsTop = Math.floor(this.bounds.top);
                                let actualNode;
                                while (Math.floor(sibling.bounds.top) === boundsTop) {
                                    actualNode = sibling;
                                    const innerWrapped = sibling.innerWrapped;
                                    if (innerWrapped) {
                                        sibling = innerWrapped;
                                    } else {
                                        break;
                                    }
                                }
                                if (actualNode) {
                                    const [reset, adjustment] = actualNode.getBox(1 /* MARGIN_TOP */);
                                    top += (reset === 0 ? actualNode.marginTop : 0) + adjustment;
                                }
                            }
                        }
                        if (this.positionStatic && !this.blockWidth && (left < 0 || right < 0)) {
                            switch (this.cssAscend('textAlign')) {
                                case 'center':
                                    if (left < right) {
                                        right += Math.abs(left);
                                        right /= 2;
                                        left = 0;
                                    } else {
                                        left += Math.abs(right);
                                        left /= 2;
                                        right = 0;
                                    }
                                    break;
                                case 'right':
                                case this.dir === 'rtl' ? 'start' : 'end':
                                    if (left < 0) {
                                        left = 0;
                                    }
                                    break;
                            }
                        }
                        if (this.tagName === 'PICTURE') {
                            bottom += 4;
                            right += 4;
                        }
                        switch (this.controlName) {
                            case CONTAINER_TAGNAME.RADIO:
                            case CONTAINER_TAGNAME.CHECKBOX:
                                top = Math.max(top - 4, 0);
                                bottom = Math.max(bottom - 4, 0);
                                break;
                            case CONTAINER_TAGNAME.SELECT:
                                top = Math.max(top - 2, 0);
                                bottom = Math.max(bottom - 2, 0);
                                break;
                        }
                        if (top < 0) {
                            if (!this.pageFlow) {
                                if (
                                    bottom >= 0 &&
                                    this.leftTopAxis &&
                                    (this.hasPX('top') || !this.hasPX('bottom')) &&
                                    this.translateY(top)
                                ) {
                                    top = 0;
                                }
                            } else if (this.blockDimension && !this.inputElement && this.translateY(top)) {
                                for (const item of this.anchorChain('bottom')) {
                                    item.translateY(top);
                                }
                                top = 0;
                            }
                        }
                        if (bottom < 0) {
                            if (!this.pageFlow) {
                                if (
                                    top >= 0 &&
                                    this.leftTopAxis &&
                                    this.hasPX('bottom') &&
                                    !this.hasPX('top') &&
                                    this.translateY(-bottom)
                                ) {
                                    bottom = 0;
                                }
                            } else if (
                                this.blockDimension &&
                                !this.inputElement &&
                                this.renderParent.layoutConstraint
                            ) {
                                for (const item of this.anchorChain('bottom')) {
                                    item.translateY(-bottom);
                                }
                                bottom = 0;
                            }
                        }
                        if (left < 0) {
                            if (!this.pageFlow) {
                                if (
                                    right >= 0 &&
                                    this.leftTopAxis &&
                                    (this.hasPX('left') || !this.hasPX('right')) &&
                                    this.translateX(left)
                                ) {
                                    left = 0;
                                }
                            } else if (this.float === 'right') {
                                left = Math.min(-left, this.bounds.width * -1);
                                for (const item of this.anchorChain('left')) {
                                    item.translateX(-left);
                                }
                                left = 0;
                            } else if (this.blockDimension && this.translateX(left)) {
                                for (const item of this.anchorChain('right')) {
                                    item.translateX(left);
                                }
                                left = 0;
                            }
                        }
                        if (right < 0) {
                            if (!this.pageFlow) {
                                if (
                                    left >= 0 &&
                                    this.leftTopAxis &&
                                    this.hasPX('right') &&
                                    !this.hasPX('left') &&
                                    this.translateX(-right)
                                ) {
                                    right = 0;
                                }
                            } else if (this.rightAligned) {
                                if (this.translateX(-right)) {
                                    right = 0;
                                }
                            } else if (this.blockDimension && this.renderParent.layoutConstraint) {
                                for (const item of this.anchorChain('right')) {
                                    item.translateX(right);
                                }
                                right = 0;
                            }
                        }
                    } else if (this.visibleStyle.borderWidth && !this.is(CONTAINER_NODE.LINE)) {
                        top += this.borderTopWidth;
                        bottom += this.borderBottomWidth;
                        right += this.borderRightWidth;
                        left += this.borderLeftWidth;
                    }
                    if (top !== 0 || left !== 0 || bottom !== 0 || right !== 0) {
                        let horizontal = NaN,
                            vertical = NaN;
                        top = Math.round(top);
                        right = Math.round(right);
                        bottom = Math.round(bottom);
                        left = Math.round(left);
                        if ((!margin || !this.renderParent.layoutGrid) && this.api >= 26 /* OREO */) {
                            if (top === right && right === bottom && bottom === left) {
                                if (top !== 0) {
                                    this.android(
                                        margin ? 'layout_margin' /* MARGIN */ : 'padding' /* PADDING */,
                                        top + 'px'
                                    );
                                }
                                continue;
                            } else {
                                if (left === right) {
                                    horizontal = left;
                                }
                                if (top === bottom) {
                                    vertical = top;
                                }
                            }
                        }
                        if (!isNaN(horizontal)) {
                            if (horizontal !== 0) {
                                this.android(
                                    margin
                                        ? 'layout_marginHorizontal' /* MARGIN_HORIZONTAL */
                                        : 'paddingHorizontal' /* PADDING_HORIZONTAL */,
                                    horizontal + 'px'
                                );
                            }
                        } else {
                            if (left !== 0) {
                                this.android(
                                    this.localizeString(
                                        margin
                                            ? 'layout_marginLeft' /* MARGIN_LEFT */
                                            : 'paddingLeft' /* PADDING_LEFT */
                                    ),
                                    left + 'px'
                                );
                            }
                            if (right !== 0) {
                                this.android(
                                    this.localizeString(
                                        margin
                                            ? 'layout_marginRight' /* MARGIN_RIGHT */
                                            : 'paddingRight' /* PADDING_RIGHT */
                                    ),
                                    right + 'px'
                                );
                            }
                        }
                        if (!isNaN(vertical)) {
                            if (vertical !== 0) {
                                this.android(
                                    margin
                                        ? 'layout_marginVertical' /* MARGIN_VERTICAL */
                                        : 'paddingVertical' /* PADDING_VERTICAL */,
                                    vertical + 'px'
                                );
                            }
                        } else {
                            if (top !== 0) {
                                this.android(
                                    margin ? 'layout_marginTop' /* MARGIN_TOP */ : 'paddingTop' /* PADDING_TOP */,
                                    top + 'px'
                                );
                            }
                            if (bottom !== 0) {
                                this.android(
                                    margin
                                        ? 'layout_marginBottom' /* MARGIN_BOTTOM */
                                        : 'paddingBottom' /* PADDING_BOTTOM */,
                                    bottom + 'px'
                                );
                            }
                        }
                    }
                }
            }
            apply(options) {
                for (const name in options) {
                    const data = options[name];
                    switch (typeof data) {
                        case 'object':
                            if (data) {
                                for (const attr in data) {
                                    this.attr(name, attr, data[attr]);
                                }
                            }
                            break;
                        case 'string':
                        case 'number':
                        case 'boolean':
                            this.attr('_', name, data.toString());
                            break;
                    }
                }
            }
            clone(id, options) {
                let attributes, position;
                if (options) {
                    ({ attributes, position } = options);
                }
                const newInstance = !isNaN(id);
                const node = new View(newInstance ? id : this.id, this.sessionId, this.element || undefined);
                if (newInstance) {
                    node.setControlType(this.controlName, this.containerType);
                } else {
                    node.controlId = this.controlId;
                    node.controlName = this.controlName;
                    node.containerType = this.containerType;
                }
                this.cloneBase(node);
                if (attributes !== false) {
                    if (this._boxReset) {
                        node.unsafe('boxReset', this._boxReset.slice(0));
                    }
                    if (this._boxAdjustment) {
                        node.unsafe('boxAdjustment', this._boxAdjustment.slice(0));
                    }
                    for (const name in this._namespaces) {
                        const obj = this._namespaces[name];
                        for (const attr in obj) {
                            node.attr(name, attr, attr === 'id' && name === 'android' ? node.documentId : obj[attr]);
                        }
                    }
                }
                if (position !== false) {
                    node.anchorClear();
                    const documentId = this.documentId;
                    if (node.anchor('left', documentId)) {
                        node.setBox(8 /* MARGIN_LEFT */, { reset: 1, adjustment: 0 });
                    }
                    if (node.anchor('top', documentId)) {
                        node.setBox(1 /* MARGIN_TOP */, { reset: 1, adjustment: 0 });
                    }
                }
                node.saveAsInitial();
                return node;
            }
            extractAttributes(depth) {
                if (this.dir === 'rtl') {
                    if (this.textElement) {
                        this.android('textDirection', 'rtl');
                    } else if (this.rendering) {
                        this.android('layoutDirection', 'rtl');
                    }
                }
                if (this.styleElement || this.hasAlign(8192 /* WRAPPER */)) {
                    const dataset = getDataSet(this.dataset, 'android');
                    if (dataset) {
                        const pattern = /^attr[A-Z]/;
                        for (const namespace in dataset) {
                            const name =
                                namespace === 'attr'
                                    ? 'android'
                                    : pattern.test(namespace)
                                    ? capitalize$1(namespace.substring(4), false)
                                    : '';
                            if (name !== '') {
                                for (const values of dataset[namespace].split(';')) {
                                    const [key, value] = splitPair(values, '::');
                                    if (value) {
                                        this.attr(name, key, value);
                                    }
                                }
                            }
                        }
                    }
                    if (!this.svgElement) {
                        const opacity = this.css('opacity');
                        if (opacity !== '1') {
                            this.android('alpha', opacity);
                        }
                    }
                }
                const indent = '\n' + '\t'.repeat(depth);
                const items = this.combine();
                let output = '';
                for (let i = 0, length = items.length; i < length; ++i) {
                    output += indent + items[i];
                }
                return output;
            }
            alignParent(position) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        const attr = LAYOUT_CONSTRAINT[position];
                        if (attr) {
                            return node.app(this.localizeString(attr)) === 'parent';
                        }
                    } else if (renderParent.layoutRelative) {
                        const attr = LAYOUT_RELATIVE_PARENT[position];
                        if (attr) {
                            return node.android(this.localizeString(attr)) === 'true';
                        }
                    } else if (renderParent.layoutLinear) {
                        const children = renderParent.renderChildren;
                        if (renderParent.layoutVertical) {
                            switch (position) {
                                case 'top':
                                    return node === children[0];
                                case 'bottom':
                                    return node === children[children.length - 1];
                            }
                        } else {
                            switch (position) {
                                case 'left':
                                case 'start':
                                    return node === children[0];
                                case 'right':
                                case 'end':
                                    return node === children[children.length - 1];
                            }
                        }
                    }
                }
                return false;
            }
            alignSibling(position, documentId) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (documentId) {
                        if (renderParent.layoutConstraint) {
                            const attr = LAYOUT_CONSTRAINT[position];
                            if (attr) {
                                node.app(this.localizeString(attr), documentId);
                            }
                        } else if (renderParent.layoutRelative) {
                            const attr = LAYOUT_RELATIVE[position];
                            if (attr) {
                                node.android(this.localizeString(attr), documentId);
                            }
                        }
                    } else if (renderParent.layoutConstraint) {
                        const attr = LAYOUT_CONSTRAINT[position];
                        if (attr) {
                            const value = node.app(this.localizeString(attr));
                            return value !== 'parent' && value !== renderParent.documentId ? value : '';
                        }
                    } else if (renderParent.layoutRelative) {
                        const attr = LAYOUT_RELATIVE[position];
                        if (attr) {
                            return node.android(this.localizeString(attr));
                        }
                    }
                }
                return '';
            }
            actualRect(direction, dimension = 'linear') {
                let value = this[dimension][direction];
                if (this.positionRelative && this.floating) {
                    switch (direction) {
                        case 'top':
                            if (this.hasPX('top')) {
                                value += this.top;
                            } else {
                                value -= this.bottom;
                            }
                            break;
                        case 'bottom':
                            if (!this.hasPX('top')) {
                                value -= this.bottom;
                            } else {
                                value += this.top;
                            }
                            break;
                        case 'left':
                            if (this.hasPX('left')) {
                                value += this.left;
                            } else {
                                value -= this.right;
                            }
                            break;
                        case 'right':
                            if (!this.hasPX('left')) {
                                value -= this.right;
                            } else {
                                value += this.left;
                            }
                            break;
                    }
                }
                if (this.inputElement) {
                    const companion = this.companion;
                    if (companion && companion.labelFor === this && !companion.visible) {
                        const outer = companion[dimension][direction];
                        switch (direction) {
                            case 'top':
                            case 'left':
                                return Math.min(outer, value);
                            case 'right':
                            case 'bottom':
                                return Math.max(outer, value);
                        }
                    }
                }
                return value;
            }
            translateX(value, options) {
                if (!isNaN(value)) {
                    const node = this.anchorTarget;
                    const renderParent = node.renderParent;
                    if (renderParent && renderParent.layoutConstraint) {
                        let oppose, accumulate, contain;
                        if (options) {
                            ({ oppose, accumulate, contain } = options);
                        }
                        let x = convertInt(node.android('translationX'));
                        if (oppose === false && ((x > 0 && value < 0) || (x < 0 && value > 0))) {
                            return false;
                        } else if (accumulate !== false) {
                            x += value;
                        }
                        if (contain) {
                            const box = renderParent.box;
                            const linear = this.linear;
                            if (linear.left + x < box.left) {
                                x = Math.max(linear.left - box.left, 0);
                            } else if (linear.right + x > box.right) {
                                x = Math.max(box.right - linear.right, 0);
                            }
                        }
                        if (x !== 0) {
                            node.android('translationX', formatPX(x));
                        } else {
                            node.delete('android', 'translationX');
                        }
                        return true;
                    }
                }
                return false;
            }
            translateY(value, options) {
                if (!isNaN(value)) {
                    const node = this.anchorTarget;
                    const renderParent = node.renderParent;
                    if (renderParent && renderParent.layoutConstraint) {
                        let oppose, accumulate, contain;
                        if (options) {
                            ({ oppose, accumulate, contain } = options);
                        }
                        let y = convertInt(node.android('translationY'));
                        if (oppose === false && ((y > 0 && value < 0) || (y < 0 && value > 0))) {
                            return false;
                        } else if (accumulate !== false) {
                            y += value;
                        }
                        if (contain) {
                            const box = renderParent.box;
                            const linear = this.linear;
                            if (linear.top + y < box.top) {
                                y = Math.max(linear.top - box.top, 0);
                            } else if (linear.bottom + y > box.bottom) {
                                y = Math.max(box.bottom - linear.bottom, 0);
                            }
                        }
                        if (y !== 0) {
                            node.android('translationY', formatPX(y));
                        } else {
                            node.delete('android', 'translationY');
                        }
                        return true;
                    }
                }
                return false;
            }
            localizeString(value) {
                return localizeString(value, this.localSettings.supportRTL, this.api);
            }
            removeTry(options) {
                if (options && !options.beforeReplace) {
                    const updating = options.replaceWith || options.alignSiblings;
                    if (updating) {
                        options.beforeReplace = () => this.anchorClear(updating);
                    }
                }
                return super.removeTry(options);
            }
            hasFlex(direction) {
                const parent = this.actualParent;
                if (parent && parent.flexdata[direction]) {
                    if (direction === 'column' && !parent.hasHeight) {
                        const grandParent = parent.actualParent;
                        if (grandParent) {
                            if (grandParent.flexElement && !grandParent.flexdata.column) {
                                if (!grandParent.hasHeight) {
                                    let maxHeight = 0,
                                        parentHeight = 0;
                                    for (const item of grandParent) {
                                        const height = (
                                            item.data('squared.flexbox' /* FLEXBOX */, 'boundsData') || item.bounds
                                        ).height;
                                        if (height > maxHeight) {
                                            maxHeight = height;
                                        }
                                        if (item === parent) {
                                            parentHeight = height;
                                            if (parentHeight < maxHeight) {
                                                break;
                                            }
                                        }
                                    }
                                    if (parentHeight >= maxHeight) {
                                        return false;
                                    }
                                }
                            } else if (!grandParent.gridElement) {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    }
                    return this.flexbox.grow > 0 || this.flexbox.shrink !== 1;
                }
                return false;
            }
            hide(options) {
                if (options) {
                    if (options.hidden) {
                        this.android('visibility', 'invisible');
                        return;
                    } else if (options.collapse) {
                        this.android('visibility', 'gone');
                        return;
                    }
                }
                super.hide(options);
            }
            android(attr, value, overwrite = true) {
                if (value) {
                    value = this.attr('android', attr, value, overwrite);
                    if (value !== '') {
                        return value;
                    }
                } else if (value === '') {
                    this.delete('android', attr);
                    return '';
                }
                return this._namespaces['android'][attr] || '';
            }
            app(attr, value, overwrite = true) {
                if (value) {
                    value = this.attr('app', attr, value, overwrite);
                    if (value !== '') {
                        return value;
                    }
                } else if (value === '') {
                    this.delete('app', attr);
                    return '';
                }
                return this._namespaces['app'][attr] || '';
            }
            formatted(value, overwrite = true) {
                const match = /^(?:([a-z]+):)?(\w+)="((?:@\+?[a-z]+\/)?.+)"$/.exec(value);
                if (match) {
                    this.attr(match[1] || '_', match[2], match[3], overwrite);
                }
            }
            anchor(position, documentId = '', overwrite) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent && node.documentId !== documentId) {
                    if (renderParent.layoutConstraint) {
                        if (documentId === '' || !node.constraint.current[position] || overwrite) {
                            const anchored = documentId === 'parent';
                            if (overwrite === undefined && documentId !== '') {
                                overwrite = anchored;
                            }
                            const attr = LAYOUT_CONSTRAINT[position];
                            if (attr) {
                                let horizontal = false;
                                node.app(this.localizeString(attr), documentId, overwrite);
                                switch (position) {
                                    case 'left':
                                    case 'right':
                                        if (anchored) {
                                            node.constraint.horizontal = true;
                                        }
                                    case 'leftRight':
                                    case 'rightLeft':
                                        horizontal = true;
                                        break;
                                    case 'top':
                                    case 'bottom':
                                    case 'baseline':
                                        if (anchored) {
                                            node.constraint.vertical = true;
                                        }
                                        break;
                                }
                                node.constraint.current[position] = { documentId, horizontal };
                                return true;
                            }
                        }
                    } else if (renderParent.layoutRelative) {
                        const relativeParent = documentId === 'true';
                        if (overwrite === undefined && documentId !== '') {
                            overwrite = relativeParent;
                        }
                        const attr = (relativeParent ? LAYOUT_RELATIVE_PARENT : LAYOUT_RELATIVE)[position];
                        if (attr) {
                            node.android(this.localizeString(attr), documentId, overwrite);
                            return true;
                        }
                    }
                }
                return false;
            }
            anchorParent(orientation, bias, style, overwrite) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    const horizontal = orientation === 'horizontal';
                    if (renderParent.layoutConstraint) {
                        if (overwrite || !node.constraint[orientation]) {
                            if (horizontal) {
                                node.anchor('left', 'parent', overwrite);
                                node.anchor('right', 'parent', overwrite);
                                node.constraint.horizontal = true;
                            } else {
                                node.anchor('top', 'parent', overwrite);
                                node.anchor('bottom', 'parent', overwrite);
                                node.constraint.vertical = true;
                            }
                            if (bias !== undefined) {
                                node.anchorStyle(orientation, bias, style, overwrite);
                            }
                            return true;
                        }
                    } else if (renderParent.layoutRelative) {
                        node.anchor(horizontal ? 'centerHorizontal' : 'centerVertical', 'true', overwrite);
                        return true;
                    }
                }
                return false;
            }
            anchorStyle(orientation, bias, style, overwrite = true) {
                const node = this.anchorTarget;
                if (orientation === 'horizontal') {
                    node.app('layout_constraintHorizontal_bias', bias.toString(), overwrite);
                    if (style) {
                        node.app('layout_constraintHorizontal_chainStyle', style, overwrite);
                    }
                } else {
                    node.app('layout_constraintVertical_bias', bias.toString(), overwrite);
                    if (style) {
                        node.app('layout_constraintVertical_chainStyle', style, overwrite);
                    }
                }
            }
            anchorChain(direction) {
                const result = [];
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent && (renderParent.layoutConstraint || renderParent.layoutRelative)) {
                    let anchorA, anchorB;
                    switch (direction) {
                        case 'top':
                            anchorA = 'topBottom';
                            anchorB = 'bottomTop';
                            break;
                        case 'right':
                            anchorA = 'rightLeft';
                            anchorB = 'leftRight';
                            break;
                        case 'bottom':
                            anchorA = 'bottomTop';
                            anchorB = 'topBottom';
                            break;
                        case 'left':
                            anchorA = 'leftRight';
                            anchorB = 'rightLeft';
                            break;
                    }
                    const siblings = renderParent.renderChildren;
                    let current = node;
                    do {
                        const adjacent = current.alignSibling(anchorA);
                        if (adjacent !== '') {
                            const sibling = siblings.find(item => item.documentId === adjacent);
                            if (
                                sibling &&
                                (sibling.alignSibling(anchorB) === current.documentId ||
                                    (sibling.floating && sibling.alignParent(direction)))
                            ) {
                                result.push(sibling);
                                current = sibling;
                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    } while (true);
                }
                return result;
            }
            anchorDelete(...position) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        node.delete(
                            'app',
                            ...replaceMap(position, value => this.localizeString(LAYOUT_CONSTRAINT[value]))
                        );
                    } else if (renderParent.layoutRelative) {
                        const layout = [];
                        for (let i = 0, length = position.length; i < length; ++i) {
                            const value = position[i];
                            let attr = LAYOUT_RELATIVE[value];
                            if (attr) {
                                layout.push(this.localizeString(attr));
                            }
                            attr = LAYOUT_RELATIVE_PARENT[value];
                            if (attr) {
                                layout.push(this.localizeString(attr));
                            }
                        }
                        node.delete('android', ...layout);
                    }
                }
            }
            anchorClear(update) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    const transferLayoutAlignment = replaceWith => {
                        replaceWith.anchorClear();
                        for (const [name, item] of node.namespaces()) {
                            for (const attr in item) {
                                switch (attr) {
                                    case 'layout_width':
                                    case 'layout_height':
                                        continue;
                                    default:
                                        if (attr.startsWith('layout_') && !attr.includes('margin')) {
                                            replaceWith.attr(name, attr, item[attr], true);
                                        }
                                        continue;
                                }
                            }
                        }
                    };
                    if (renderParent.layoutConstraint) {
                        if (update === true) {
                            replaceLayoutPosition(node, 'parent');
                        } else if (update) {
                            transferLayoutAlignment(update);
                        }
                        node.anchorDelete(...Object.keys(LAYOUT_CONSTRAINT));
                        node.delete('app', 'layout_constraint*');
                    } else if (renderParent.layoutRelative) {
                        if (update === true) {
                            replaceLayoutPosition(node, 'true');
                        } else if (update) {
                            transferLayoutAlignment(update);
                        }
                        node.anchorDelete(...Object.keys(LAYOUT_RELATIVE_PARENT));
                        node.anchorDelete(...Object.keys(LAYOUT_RELATIVE));
                    }
                }
            }
            supported(attr, value, result) {
                const api = this.api;
                if (DEPRECATED_ATTRIBUTE.android[attr]) {
                    const valid = DEPRECATED_ATTRIBUTE.android[attr].call(this, result, api, value);
                    if (!valid || hasKeys(result)) {
                        return valid;
                    }
                }
                for (let i = api; i <= 30 /* LATEST */; ++i) {
                    const callback = API_VERSION[i].android[attr];
                    switch (typeof callback) {
                        case 'boolean':
                            return callback;
                        case 'function':
                            return callback.call(this, result, api, value);
                    }
                }
                return true;
            }
            combine(...objs) {
                const all = objs.length === 0;
                const result = [];
                let id = '',
                    requireId;
                for (const name in this._namespaces) {
                    if (all || objs.includes(name)) {
                        const obj = this._namespaces[name];
                        let prefix = name + ':';
                        switch (name) {
                            case 'android':
                                if (this.api < 30 /* LATEST */) {
                                    for (let attr in obj) {
                                        if (attr === 'id') {
                                            id = obj.id;
                                        } else {
                                            const data = {};
                                            let value = obj[attr];
                                            if (!this.supported(attr, value, data)) {
                                                continue;
                                            }
                                            if (hasKeys(data)) {
                                                if (isString$1(data.attr)) {
                                                    attr = data.attr;
                                                }
                                                if (isString$1(data.value)) {
                                                    value = data.value;
                                                }
                                            }
                                            result.push(`${prefix + attr}="${value}"`);
                                        }
                                    }
                                } else {
                                    for (const attr in obj) {
                                        if (attr === 'id') {
                                            id = obj.id;
                                        } else {
                                            result.push(`${prefix + attr}="${obj[attr]}"`);
                                        }
                                    }
                                }
                                requireId = true;
                                break;
                            case '_':
                                prefix = '';
                            default:
                                for (const attr in obj) {
                                    result.push(`${prefix + attr}="${obj[attr]}"`);
                                }
                                break;
                        }
                    }
                }
                result.sort((a, b) => (a > b ? 1 : -1));
                if (requireId) {
                    result.unshift(`android:id="${id || `@+id/${this.controlId}`}"`);
                }
                return result;
            }
            mergeGravity(attr, alignment, overwrite = true) {
                if (attr === 'layout_gravity') {
                    const renderParent = this.renderParent;
                    if (renderParent) {
                        if (
                            renderParent.layoutRelative ||
                            (isHorizontalAlign(alignment) &&
                                (this.blockWidth ||
                                    (renderParent.inlineWidth && this.onlyChild) ||
                                    (!overwrite && this.outerWrapper && this.hasPX('maxWidth'))))
                        ) {
                            return;
                        } else if (renderParent.layoutConstraint) {
                            if (!renderParent.layoutHorizontal && !this.positioned) {
                                switch (alignment) {
                                    case 'top':
                                        this.anchorStyle('vertical', 0);
                                        break;
                                    case 'right':
                                    case 'end':
                                        if (!this.alignSibling('rightLeft')) {
                                            this.anchor('right', 'parent', false);
                                            if (this.alignParent('left') || this.alignSibling('left')) {
                                                this.anchorStyle('horizontal', 1);
                                            }
                                        }
                                        break;
                                    case 'bottom':
                                        this.anchorStyle('vertical', 1);
                                        break;
                                    case 'left':
                                    case 'start':
                                        if (!this.alignSibling('leftRight')) {
                                            this.anchor('left', 'parent', false);
                                            if (this.alignParent('right') || this.alignSibling('right')) {
                                                this.anchorStyle('horizontal', 0);
                                            }
                                        }
                                        break;
                                    case 'center_horizontal':
                                        if (!this.alignSibling('leftRight') && !this.alignSibling('rightLeft')) {
                                            this.anchorParent('horizontal', 0.5);
                                        }
                                        break;
                                }
                            }
                            return;
                        }
                    }
                } else {
                    switch (this.tagName) {
                        case '#text':
                        case 'IMG':
                        case 'svg':
                        case 'HR':
                        case 'VIDEO':
                        case 'AUDIO':
                        case 'CANVAS':
                        case 'OBJECT':
                        case 'EMBED':
                            return;
                        case 'INPUT':
                            switch (this.toElementString('type')) {
                                case 'radio':
                                case 'checkbox':
                                case 'image':
                                case 'range':
                                    return;
                            }
                            break;
                        default:
                            if (
                                (!this.isEmpty() &&
                                    (this.layoutFrame ||
                                        this.layoutConstraint ||
                                        (this.layoutRelative && this.layoutHorizontal) ||
                                        this.layoutGrid)) ||
                                (this.is(CONTAINER_NODE.TEXT) && this.textEmpty) ||
                                this.controlElement
                            ) {
                                return;
                            }
                            break;
                    }
                }
                const direction = getGravityValues(this, attr, this.localizeString(alignment));
                if (direction) {
                    let x = '',
                        y = '',
                        z = '',
                        result = '';
                    for (let i = 0, length = direction.length; i < length; ++i) {
                        const value = direction[i];
                        if (isHorizontalAlign(value)) {
                            if (x === '' || overwrite) {
                                x = value;
                            }
                        } else if (isVerticalAlign(value)) {
                            if (y === '' || overwrite) {
                                y = value;
                            }
                        } else {
                            z += (z !== '' ? '|' : '') + value;
                        }
                    }
                    result = x !== '' && y !== '' ? `${x}|${y}` : x || y;
                    if (z !== '') {
                        result += (result !== '' ? '|' : '') + z;
                    }
                    this.android(attr, result);
                }
            }
            applyOptimizations() {
                if (this.renderExclude) {
                    this.hide(
                        !this.alignSibling('topBottom') &&
                            !this.alignSibling('bottomTop') &&
                            !this.alignSibling('leftRight') &&
                            !this.alignSibling('rightLeft')
                            ? { remove: true }
                            : { collapse: true }
                    );
                    return;
                }
                const renderParent = this.renderParent;
                const lineHeight = this.lineHeight;
                if (lineHeight) {
                    const hasOwnStyle = this.has('lineHeight', { initial: true });
                    if (this.multiline) {
                        setMultiline(this, lineHeight, hasOwnStyle);
                    } else if (
                        this.rendering &&
                        !(!hasOwnStyle && this.layoutHorizontal && this.alignSibling('baseline'))
                    ) {
                        if (this.layoutVertical || this.layoutFrame) {
                            this.renderEach(item => {
                                const value = getLineHeight(item, lineHeight);
                                if (value) {
                                    setLineHeight(item, value, true, true, true);
                                }
                            });
                        } else {
                            const horizontalRows = this.horizontalRows || [this.renderChildren];
                            for (let i = 0, q = horizontalRows.length; i < q; ++i) {
                                const row = horizontalRows[i];
                                const r = row.length;
                                const onlyChild = r === 1;
                                const baseline =
                                    !onlyChild &&
                                    row.find(item => item.baselineActive && !item.rendering && !item.imageContainer);
                                let top, bottom;
                                if (q === 1) {
                                    if (this.inline && row.every(item => item.inline)) {
                                        setLineHeight(
                                            this,
                                            Math.max(lineHeight, ...row.map(item => item.lineHeight)),
                                            true,
                                            true,
                                            true,
                                            true
                                        );
                                        break;
                                    }
                                    top = true;
                                    bottom = true;
                                } else {
                                    top = i > 0 || row[0].lineBreakLeading;
                                    bottom = i < q - 1 && !horizontalRows[i + 1][0].lineBreakLeading;
                                    if (!top && !bottom) {
                                        continue;
                                    }
                                }
                                if (baseline) {
                                    if (q === 1) {
                                        let invalid;
                                        for (let j = 0; j < r; ++j) {
                                            const item = row[j];
                                            if (
                                                (!item.alignSibling('baseline') && item !== baseline) ||
                                                getLineHeight(item, lineHeight, true) !== lineHeight
                                            ) {
                                                invalid = true;
                                                break;
                                            }
                                        }
                                        if (!invalid) {
                                            baseline.setCacheValue('lineHeight', 0);
                                            setLineHeight(baseline, lineHeight, false, top, bottom, false, this);
                                            continue;
                                        }
                                    }
                                    setLineHeight(baseline, getLineHeight(baseline, lineHeight), false, top, bottom);
                                } else if (onlyChild) {
                                    const item = row[0];
                                    if (item.multiline && item.lineHeight) {
                                        continue;
                                    } else {
                                        setLineHeight(item, getLineHeight(item, lineHeight), true, top, bottom);
                                    }
                                } else {
                                    for (let j = 0; j < r; ++j) {
                                        const item = row[j];
                                        const value = getLineHeight(item, lineHeight);
                                        if (value) {
                                            setLineHeight(item, value, false, top, bottom);
                                        }
                                    }
                                }
                            }
                        }
                    } else if (
                        (hasOwnStyle || renderParent.lineHeight === 0) &&
                        ((this.inlineText && !this.textEmpty) || this.inputElement)
                    ) {
                        setLineHeight(this, lineHeight, hasOwnStyle, true, true);
                    }
                }
                const setAttribute = attr => {
                    const direction = getGravityValues(this, attr);
                    if (direction && direction.length > 1) {
                        let modified;
                        if (checkMergableGravity('center', direction)) {
                            modified = true;
                        }
                        if (checkMergableGravity('fill', direction)) {
                            modified = true;
                        }
                        if (modified) {
                            this.android(attr, concatString(direction, '|'));
                        }
                    }
                };
                setAttribute('layout_gravity');
                setAttribute('gravity');
                if (this.has('transform')) {
                    const transforms = parseTransform(this.css('transform'), {
                        accumulate: true,
                        boundingBox: this.bounds,
                        fontSize: this.fontSize,
                    });
                    let offsetX = 0,
                        offsetY = 0,
                        pivoted;
                    for (let i = 0, length = transforms.length; i < length; ++i) {
                        const item = transforms[i];
                        const [x, y, z] = item.values;
                        switch (item.method) {
                            case 'rotate':
                                if (x === y) {
                                    this.android('rotation', x.toString());
                                } else {
                                    if (x !== 0) {
                                        this.android('rotationX', x.toString());
                                    }
                                    if (y !== 0) {
                                        this.android('rotationY', y.toString());
                                    }
                                }
                                pivoted = true;
                                break;
                            case 'scale':
                                if (x !== 1) {
                                    this.android('scaleX', x.toString());
                                }
                                if (y !== 1) {
                                    this.android('scaleY', y.toString());
                                }
                                pivoted = true;
                                break;
                            case 'translate':
                                if (x !== 0 && !this.translateX(x)) {
                                    this.android('translationX', formatPX(x));
                                }
                                if (y !== 0 && !this.translateY(y)) {
                                    this.android('translationY', formatPX(y));
                                }
                                if (z !== 0) {
                                    this.android('translationZ', formatPX(z));
                                }
                                offsetX = x;
                                offsetY = y;
                                break;
                        }
                    }
                    if (pivoted && this.has('transformOrigin')) {
                        const { left, top } = Resource.getBackgroundPosition(this.css('transformOrigin'), this.bounds, {
                            fontSize: this.fontSize,
                        });
                        if (top !== 0) {
                            this.android('transformPivotX', formatPX(top - (offsetX >= 0 ? offsetX : offsetX * -2)));
                        }
                        if (left !== 0) {
                            this.android('transformPivotY', formatPX(left - (offsetY >= 0 ? offsetY : offsetY * -2)));
                        }
                    }
                }
                if (this.textElement) {
                    if (this.multiline) {
                        switch (this.css('whiteSpace')) {
                            case 'nowrap':
                            case 'pre':
                                break;
                            default:
                                this.android('hyphenationFrequency', 'full');
                                break;
                        }
                    }
                } else if (this.imageElement) {
                    const { layoutWidth, layoutHeight } = this;
                    if (
                        (layoutWidth === 'wrap_content' && layoutHeight !== 'wrap_content') ||
                        (layoutWidth !== 'wrap_content' && layoutHeight === 'wrap_content') ||
                        layoutWidth === 'match_parent' ||
                        layoutHeight === 'match_parent' ||
                        layoutWidth === '0px' ||
                        layoutHeight === '0px' ||
                        this.android('minWidth') !== '' ||
                        this.android('minHeight') !== '' ||
                        this.android('maxWidth') !== '' ||
                        this.android('maxHeight') !== ''
                    ) {
                        this.android('adjustViewBounds', 'true');
                    }
                } else if (this.rendering) {
                    if (this.layoutLinear) {
                        if (this.layoutVertical) {
                            if (
                                (renderParent.layoutHorizontal ||
                                    renderParent.layoutGrid ||
                                    this.alignSibling('baseline') ||
                                    this.baselineActive) &&
                                (this.baselineElement || this.renderChildren[0].baselineElement) &&
                                !this.documentRoot
                            ) {
                                this.android('baselineAlignedChildIndex', '0', false);
                            }
                        } else {
                            const renderChildren = this.renderChildren;
                            let baseline;
                            if (
                                (this.floatContainer ||
                                    (this.nodeGroup &&
                                        (this.hasAlign(256 /* FLOAT */) ||
                                            renderChildren.some(node => node.floating)))) &&
                                !renderChildren.some(node => node.imageElement && node.baseline)
                            ) {
                                this.android('baselineAligned', 'false');
                                baseline = false;
                            } else {
                                baseline = true;
                            }
                            for (let i = 0, length = renderChildren.length; i < length; ++i) {
                                const item = renderChildren[i];
                                if (item.textElement && item.textContent.length > 1) {
                                    item.android('maxLines', '1');
                                    if (i === length - 1) {
                                        item.android('ellipsize', 'end');
                                    }
                                }
                                if (baseline && item.baselineElement) {
                                    this.android('baselineAlignedChildIndex', i.toString(), false);
                                    baseline = false;
                                }
                            }
                        }
                    }
                    if (
                        this.onlyChild &&
                        this.controlName === renderParent.controlName &&
                        !this.visibleStyle.borderWidth &&
                        this.elementId === ''
                    ) {
                        let valid = true;
                        for (const name in this._namespaces) {
                            const parentObj = renderParent.unsafe('namespaces')[name];
                            if (parentObj) {
                                const obj = this._namespaces[name];
                                for (const attr in obj) {
                                    if (attr === 'id') {
                                        continue;
                                    }
                                    const value = obj[attr];
                                    if (value !== parentObj[attr] && value !== 'match_parent') {
                                        valid = false;
                                        break;
                                    }
                                }
                            } else {
                                valid = false;
                                break;
                            }
                        }
                        if (valid) {
                            const renderTemplates = this.renderTemplates;
                            for (let i = 0, q = renderTemplates.length; i < q; ++i) {
                                const template = renderTemplates[i];
                                template.parent = renderParent;
                                template.node.renderParent = renderParent;
                            }
                            renderParent.renderChildren = this.renderChildren;
                            renderParent.renderTemplates = renderTemplates;
                            const { boxReset, boxAdjustment } = this;
                            const renderAdjustment = renderParent.boxAdjustment;
                            renderAdjustment[4] +=
                                (boxReset[0] === 0 ? this.marginTop : 0) +
                                (boxReset[4] === 0 ? this.paddingTop : 0) +
                                boxAdjustment[0] +
                                boxAdjustment[4];
                            renderAdjustment[5] +=
                                (boxReset[1] === 0 ? this.marginRight : 0) +
                                (boxReset[5] === 0 ? this.paddingRight : 0) +
                                boxAdjustment[1] +
                                boxAdjustment[5];
                            renderAdjustment[6] +=
                                (boxReset[2] === 0 ? this.marginBottom : 0) +
                                (boxReset[6] === 0 ? this.paddingBottom : 0) +
                                boxAdjustment[2] +
                                boxAdjustment[6];
                            renderAdjustment[7] +=
                                (boxReset[3] === 0 ? this.marginLeft : 0) +
                                (boxReset[7] === 0 ? this.paddingLeft : 0) +
                                boxAdjustment[3] +
                                boxAdjustment[7];
                        }
                    }
                }
                if (this.alignedWithX) {
                    this.translateX(parseFloat(this.alignedWithX.android('translationX')));
                }
                if (this.alignedWithY) {
                    this.translateY(parseFloat(this.alignedWithY.android('translationY')));
                }
            }
            applyCustomizations(overwrite = true) {
                const { tagName, controlName } = this;
                const setCustomization = obj => {
                    if (obj) {
                        for (const name in obj) {
                            const data = obj[name];
                            for (const attr in data) {
                                this.attr(name, attr, data[attr], overwrite);
                            }
                        }
                    }
                };
                let assign = API_VERSION[0].assign;
                setCustomization(assign[tagName]);
                setCustomization(assign[controlName]);
                const api = API_VERSION[this.api];
                if (api) {
                    assign = api.assign;
                    setCustomization(assign[tagName]);
                    setCustomization(assign[controlName]);
                }
            }
            setSingleLine(maxLines, ellipsize) {
                if (this.textElement && (this.plainText || !this.hasPX('width')) && this.textContent.length > 1) {
                    if (maxLines) {
                        this.android('maxLines', '1');
                    }
                    if (ellipsize) {
                        this.android('ellipsize', 'end');
                    }
                }
            }
            setConstraintDimension(percentWidth = NaN) {
                percentWidth = constraintPercentWidth(this, percentWidth);
                constraintPercentHeight(this, 1);
                if (!this.inputElement) {
                    constraintMinMax(this, true);
                    constraintMinMax(this, false);
                }
                return percentWidth;
            }
            setFlexDimension(dimension, percentWidth = NaN) {
                const { grow, basis, shrink } = this.flexbox;
                const horizontal = dimension === 'width';
                const setFlexGrow = (value, shrinkValue) => {
                    if (grow > 0) {
                        this.app(
                            horizontal ? 'layout_constraintHorizontal_weight' : 'layout_constraintVertical_weight',
                            truncate(grow, this.localSettings.floatPrecision)
                        );
                        return true;
                    } else if (value) {
                        if (shrinkValue !== undefined) {
                            if (shrinkValue > 1) {
                                value /= shrinkValue;
                            } else if (shrinkValue > 0) {
                                value *= 1 - shrinkValue;
                            }
                        }
                        this.app(
                            horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min',
                            formatPX(value)
                        );
                    }
                    return false;
                };
                if (isLength(basis)) {
                    setFlexGrow(this.parseUnit(basis, { dimension }), shrink);
                    setLayoutDimension(this, '0px', horizontal, true);
                } else if (basis !== '0%' && isPercent(basis)) {
                    setFlexGrow();
                    setConstraintPercent(this, parseFloat(basis) / 100, horizontal, NaN);
                } else {
                    let flexible;
                    if (this.hasFlex(horizontal ? 'row' : 'column')) {
                        flexible = setFlexGrow(
                            this.hasPX(dimension, { percent: false })
                                ? horizontal
                                    ? this.actualWidth
                                    : this.actualHeight
                                : 0,
                            shrink
                        );
                        if (flexible) {
                            setLayoutDimension(this, '0px', horizontal, true);
                        }
                    }
                    if (!flexible) {
                        if (horizontal) {
                            percentWidth = constraintPercentWidth(this, percentWidth);
                        } else {
                            constraintPercentHeight(this, 0);
                        }
                    }
                }
                if (shrink > 1) {
                    this.app(horizontal ? 'layout_constrainedWidth' : 'layout_constrainedHeight', 'true');
                }
                if (horizontal) {
                    constraintPercentHeight(this);
                }
                if (!this.inputElement && !this.imageContainer) {
                    constraintMinMax(this, true);
                    constraintMinMax(this, false);
                }
                return percentWidth;
            }
            getMatchConstraint(parent = this.renderParent) {
                return parent
                    ? parent.layoutConstraint &&
                      !parent.flexibleWidth &&
                      (!parent.inlineWidth || this.rendering) &&
                      !this.onlyChild &&
                      !(parent.documentRoot && this.blockStatic) &&
                      ((this.alignParent('left') &&
                          this.alignParent('right') &&
                          !this.textElement &&
                          !this.inputElement &&
                          !this.controlElement) ||
                          (this.hasPX('minWidth') &&
                              (parent.inlineWidth ||
                                  (parent.layoutWidth === '' && !parent.blockStatic && !parent.hasPX('width')))) ||
                          this.alignSibling('leftRight') ||
                          this.alignSibling('rightLeft'))
                        ? '0px'
                        : 'match_parent'
                    : '';
            }
            getAnchorPosition(parent, horizontal, modifyAnchor = true) {
                let orientation, dimension, posA, posB, marginA, marginB, paddingA, paddingB;
                if (horizontal) {
                    orientation = 'horizontal';
                    dimension = 'width';
                    posA = 'left';
                    posB = 'right';
                    marginA = 8 /* MARGIN_LEFT */;
                    marginB = 2 /* MARGIN_RIGHT */;
                    paddingA = 128 /* PADDING_LEFT */;
                    paddingB = 32 /* PADDING_RIGHT */;
                } else {
                    orientation = 'vertical';
                    dimension = 'height';
                    posA = 'top';
                    posB = 'bottom';
                    marginA = 1 /* MARGIN_TOP */;
                    marginB = 4 /* MARGIN_BOTTOM */;
                    paddingA = 16 /* PADDING_TOP */;
                    paddingB = 64 /* PADDING_BOTTOM */;
                }
                const autoMargin = this.autoMargin;
                const hasDimension = this.hasPX(dimension);
                const result = {};
                const hasA = this.hasPX(posA);
                const hasB = this.hasPX(posB);
                if (hasDimension && autoMargin[orientation]) {
                    if (hasA && autoMargin[posB]) {
                        if (modifyAnchor) {
                            this.anchor(posA, 'parent');
                            this.modifyBox(marginA, this[posA]);
                        } else {
                            result[posA] = this[posA];
                        }
                    } else if (hasB && autoMargin[posA]) {
                        if (modifyAnchor) {
                            this.anchor(posB, 'parent');
                            this.modifyBox(marginB, this[posB]);
                        } else {
                            result[posB] = this[posB];
                        }
                    } else if (modifyAnchor) {
                        this.anchorParent(orientation, 0.5);
                        this.modifyBox(marginA, this[posA]);
                        this.modifyBox(marginB, this[posB]);
                    } else {
                        result[posA] = this[posA];
                        result[posB] = this[posB];
                    }
                } else {
                    const matchParent =
                        this.css(dimension) === '100%' || this.css(horizontal ? 'minWidth' : 'minHeight') === '100%';
                    if (matchParent) {
                        const offsetA = hasA && parent.adjustAbsolutePaddingOffset(paddingA, this[posA]);
                        const offsetB = hasB && parent.adjustAbsolutePaddingOffset(paddingB, this[posB]);
                        if (modifyAnchor) {
                            this.anchorParent(orientation);
                            if (horizontal) {
                                this.setLayoutWidth(this.getMatchConstraint(parent));
                            } else {
                                this.setLayoutHeight('0px');
                            }
                            if (offsetA) {
                                this.modifyBox(marginA, offsetA);
                            }
                            if (offsetB) {
                                this.modifyBox(marginB, offsetB);
                            }
                        } else {
                            if (offsetA) {
                                result[posA] = offsetA;
                            }
                            if (offsetB) {
                                result[posB] = offsetB;
                            }
                        }
                    } else {
                        let expand = 0;
                        if (hasA) {
                            const value = parent.adjustAbsolutePaddingOffset(paddingA, this[posA]);
                            if (modifyAnchor) {
                                this.anchor(posA, 'parent');
                                this.modifyBox(marginA, value);
                                ++expand;
                            } else {
                                result[posA] = value;
                            }
                        }
                        if (hasB) {
                            if (!hasA || !hasDimension) {
                                const value = parent.adjustAbsolutePaddingOffset(paddingB, this[posB]);
                                if (modifyAnchor) {
                                    this.anchor(posB, 'parent');
                                    this.modifyBox(marginB, value);
                                    ++expand;
                                } else {
                                    result[posB] = value;
                                }
                            }
                        }
                        if (modifyAnchor) {
                            switch (expand) {
                                case 0:
                                    if (horizontal) {
                                        if (this.centerAligned) {
                                            this.anchorParent('horizontal', 0.5);
                                        } else if (this.rightAligned) {
                                            if (this.blockStatic) {
                                                this.anchorParent('horizontal', 1);
                                            } else {
                                                this.anchor('right', 'parent');
                                            }
                                        }
                                    }
                                    break;
                                case 2:
                                    if (
                                        !hasDimension &&
                                        !(
                                            autoMargin[orientation] === true &&
                                            autoMargin[posA] !== true &&
                                            autoMargin[posB] !== true
                                        )
                                    ) {
                                        if (horizontal) {
                                            this.setLayoutWidth(this.getMatchConstraint(parent));
                                        } else {
                                            this.setLayoutHeight('0px');
                                        }
                                        if (parent.innerMostWrapped.documentBody) {
                                            const options = {
                                                type: 1 /* LENGTH */ | 2 /* PERCENT */,
                                                not: '100%',
                                            };
                                            do {
                                                if (
                                                    !parent.has(dimension, options) &&
                                                    !parent.has(horizontal ? 'maxWidth' : 'maxHeight', options)
                                                ) {
                                                    if (horizontal) {
                                                        parent.setLayoutWidth('match_parent', parent.inlineWidth);
                                                    } else {
                                                        parent.setLayoutHeight('match_parent', parent.inlineWidth);
                                                    }
                                                    parent = parent.outerWrapper;
                                                } else {
                                                    break;
                                                }
                                            } while (parent);
                                        }
                                    }
                                    break;
                            }
                        }
                    }
                }
                return result;
            }
            isUnstyled(checkMargin = true) {
                switch (this.css('verticalAlign')) {
                    case 'baseline':
                    case 'initial':
                        return (
                            this.contentBoxWidth === 0 &&
                            this.contentBoxHeight === 0 &&
                            (!checkMargin || (!this.blockStatic && this.marginTop === 0 && this.marginBottom === 0)) &&
                            !this.visibleStyle.background &&
                            !this.positionRelative &&
                            !this.hasWidth &&
                            !this.hasHeight &&
                            !this.has('maxWidth') &&
                            !this.has('maxHeight') &&
                            this.css('whiteSpace') !== 'nowrap'
                        );
                    default:
                        return false;
                }
            }
            getHorizontalBias() {
                const { left, right } = this.documentParent.box;
                return calculateBias(
                    Math.max(0, this.actualRect('left', 'bounds') - left),
                    Math.max(0, right - this.actualRect('right', 'bounds')),
                    this.localSettings.floatPrecision
                );
            }
            getVerticalBias() {
                const { top, bottom } = this.documentParent.box;
                return calculateBias(
                    Math.max(0, this.actualRect('top', 'bounds') - top),
                    Math.max(0, bottom - this.actualRect('bottom', 'bounds')),
                    this.localSettings.floatPrecision
                );
            }
            adjustAbsolutePaddingOffset(region, value) {
                if (value > 0) {
                    if (this.documentBody) {
                        switch (region) {
                            case 16 /* PADDING_TOP */:
                                if (this.getBox(1 /* MARGIN_TOP */)[0] === 0) {
                                    value -= this.marginTop;
                                }
                                break;
                            case 32 /* PADDING_RIGHT */:
                                value -= this.marginRight;
                                break;
                            case 64 /* PADDING_BOTTOM */:
                                if (this.getBox(4 /* MARGIN_BOTTOM */)[0] === 0) {
                                    value -= this.marginBottom;
                                }
                                break;
                            case 128 /* PADDING_LEFT */:
                                value -= this.marginLeft;
                                break;
                        }
                    }
                    if (this.getBox(region)[0] === 0) {
                        switch (region) {
                            case 16 /* PADDING_TOP */:
                                value += this.borderTopWidth - this.paddingTop;
                                break;
                            case 32 /* PADDING_RIGHT */:
                                value += this.borderRightWidth - this.paddingRight;
                                break;
                            case 64 /* PADDING_BOTTOM */:
                                value += this.borderBottomWidth - this.paddingBottom;
                                break;
                            case 128 /* PADDING_LEFT */:
                                value += this.borderLeftWidth - this.paddingLeft;
                                break;
                        }
                    }
                    return Math.max(value, 0);
                } else if (value < 0) {
                    switch (region) {
                        case 16 /* PADDING_TOP */:
                            value += this.marginTop;
                            break;
                        case 32 /* PADDING_RIGHT */:
                            value += this.marginRight;
                            break;
                        case 64 /* PADDING_BOTTOM */:
                            value += this.marginBottom;
                            break;
                        case 128 /* PADDING_LEFT */:
                            value += this.marginLeft;
                            break;
                    }
                    return value;
                }
                return 0;
            }
            setLayoutWidth(value, overwrite = true) {
                this.android('layout_width', value, overwrite);
            }
            setLayoutHeight(value, overwrite = true) {
                this.android('layout_height', value, overwrite);
            }
            get controlElement() {
                switch (this.tagName) {
                    case 'PROGRESS':
                    case 'METER':
                        return true;
                    case 'INPUT':
                        return this.toElementString('type') === 'range';
                    default:
                        return false;
                }
            }
            get imageElement() {
                switch (this.tagName) {
                    case 'IMG':
                    case 'CANVAS':
                        return true;
                    default:
                        return false;
                }
            }
            get imageContainer() {
                return this.imageElement || this.svgElement || this._containerType === CONTAINER_NODE.IMAGE;
            }
            set containerType(value) {
                this._containerType = value;
            }
            get containerType() {
                if (this._containerType === 0) {
                    const value = CONTAINER_ELEMENT[this.containerName];
                    if (value) {
                        this._containerType = value;
                    }
                }
                return this._containerType;
            }
            set controlId(value) {
                this._controlId = value;
            }
            get controlId() {
                const result = this._controlId;
                if (result === undefined) {
                    const controlName = this.controlName;
                    if (controlName) {
                        let name;
                        if (this.styleElement) {
                            const value = this.elementId || getNamedItem(this.element, 'name');
                            if (value !== '') {
                                name = value.replace(/[^\w$\-_.]/g, '_').toLowerCase();
                                if (name === 'parent' || RESERVED_JAVA.has(name)) {
                                    name = '_' + name;
                                }
                            }
                        }
                        return (this._controlId = convertWord(
                            ResourceUI.generateId(
                                'android',
                                name || fromLastIndexOf$1(controlName, '.').toLowerCase(),
                                name ? 0 : 1
                            )
                        ));
                    } else {
                        const id = this.id;
                        return id <= 0 ? 'baseroot' + (id === 0 ? '' : '_' + Math.abs(id)) : '';
                    }
                }
                return result;
            }
            get documentId() {
                const controlId = this.controlId;
                return controlId !== '' ? `@id/${controlId}` : '';
            }
            get support() {
                let result = this._cache.support;
                if (result === undefined) {
                    result = {
                        positionTranslation: this.layoutConstraint,
                        positionRelative: this.layoutRelative,
                        maxDimension: this.textElement || this.imageContainer,
                    };
                    if (this.containerType !== 0) {
                        this._cache.support = result;
                    }
                }
                return result;
            }
            set renderExclude(value) {
                this._cache.renderExclude = value;
            }
            get renderExclude() {
                let result = this._cache.renderExclude;
                if (result === undefined) {
                    const excludeHorizontal = node =>
                        node.bounds.width === 0 &&
                        node.contentBoxWidth === 0 &&
                        node.marginLeft === 0 &&
                        node.marginRight === 0 &&
                        !node.visibleStyle.background;
                    const excludeVertical = node =>
                        node.bounds.height === 0 &&
                        node.contentBoxHeight === 0 &&
                        ((node.marginTop === 0 && node.marginBottom === 0) || node.css('overflow') === 'hidden');
                    if (this.naturalChild) {
                        if (this.plainText) {
                            result = this.bounds.height === 0;
                        } else if (this.rootElement) {
                            result = false;
                        } else if (!this.pageFlow) {
                            result =
                                (this.isEmpty() && (excludeHorizontal(this) || excludeVertical(this))) ||
                                /^rect\(0[a-zQ]*,\s+0[a-zQ]*,\s+0[a-zQ]*,\s+0[a-zQ]*\)$/.test(this.css('clip'));
                        } else {
                            const parent = this.renderParent || this.parent;
                            if (this.pseudoElement) {
                                result =
                                    parent.layoutConstraint &&
                                    (excludeHorizontal(this) || excludeVertical(this)) &&
                                    parent.every(item => {
                                        if (item === this || !item.pageFlow) {
                                            return true;
                                        } else if (item.pseudoElement) {
                                            return excludeHorizontal(item) || excludeVertical(item);
                                        }
                                        return item.renderExclude;
                                    });
                            } else if (
                                this.isEmpty() &&
                                !this.imageContainer &&
                                (!this.textElement || this.textEmpty)
                            ) {
                                if (parent.layoutFrame) {
                                    result = excludeHorizontal(this) || excludeVertical(this);
                                } else if (parent.layoutVertical) {
                                    result = excludeVertical(this);
                                } else {
                                    result =
                                        excludeHorizontal(this) && (parent.layoutHorizontal || excludeVertical(this));
                                }
                            }
                        }
                    }
                    return (this._cache.renderExclude = result || false);
                }
                return result;
            }
            get baselineHeight() {
                var _a, _b, _c;
                let result = this._cache.baselineHeight;
                if (result === undefined) {
                    if (this.plainText) {
                        const { height, numberOfLines } = this.bounds;
                        result = height / (numberOfLines || 1);
                    } else {
                        if (this.multiline && this.cssTry('white-space', 'nowrap')) {
                            result =
                                (_b = (_a = this.boundingClientRect) === null || _a === void 0 ? void 0 : _a.height) !==
                                    null && _b !== void 0
                                    ? _b
                                    : this.bounds.height;
                            this.cssFinally('white-space');
                        } else if (this.hasHeight) {
                            result = this.actualHeight;
                        } else if (this.tagName === 'PICTURE') {
                            result = Math.max(
                                ((_c = this.naturalElements.find(node => node.tagName === 'IMG')) === null ||
                                _c === void 0
                                    ? void 0
                                    : _c.height) || 0,
                                this.bounds.height
                            );
                        } else {
                            result = this.bounds.height;
                        }
                        if (this.naturalElement && !this.pseudoElement && this.lineHeight > result) {
                            result = this.lineHeight;
                        } else if (this.inputElement) {
                            switch (this.controlName) {
                                case CONTAINER_TAGNAME.RADIO:
                                case CONTAINER_TAGNAME.CHECKBOX:
                                    result += 8;
                                    break;
                                case CONTAINER_TAGNAME.SELECT:
                                    result /= this.toElementInt('size') || 1;
                                    result += 4;
                                    break;
                                default:
                                    result += Math.max(-this.verticalAlign, 0);
                                    break;
                            }
                        }
                        result += this.marginBottom + this.getBox(1 /* MARGIN_TOP */)[1];
                    }
                    this._cache.baselineHeight = result;
                }
                return result;
            }
            get innerWrapped() {
                return this._innerWrapped;
            }
            set innerWrapped(value) {
                if (!this.naturalChild && value) {
                    value = value.outerMostWrapper;
                    this._innerWrapped = value;
                    value.outerWrapper = this;
                }
            }
            get anchorTarget() {
                let target = this;
                do {
                    const renderParent = target.renderParent;
                    if (renderParent) {
                        if (renderParent.layoutConstraint || renderParent.layoutRelative) {
                            return target;
                        }
                    } else {
                        break;
                    }
                    target = target.outerWrapper;
                } while (target);
                return this;
            }
            set anchored(value) {
                this._anchored = value;
            }
            get anchored() {
                return this._anchored || (this._anchored = this.constraint.horizontal && this.constraint.vertical);
            }
            get constraint() {
                return this._constraint || (this._constraint = { horizontal: false, vertical: false, current: {} });
            }
            get layoutFrame() {
                return this._containerType === CONTAINER_NODE.FRAME;
            }
            get layoutLinear() {
                return this._containerType === CONTAINER_NODE.LINEAR;
            }
            get layoutGrid() {
                return this._containerType === CONTAINER_NODE.GRID;
            }
            get layoutRelative() {
                return this._containerType === CONTAINER_NODE.RELATIVE;
            }
            get layoutConstraint() {
                return this._containerType === CONTAINER_NODE.CONSTRAINT;
            }
            get layoutWidth() {
                return this._namespaces.android.layout_width || '';
            }
            get layoutHeight() {
                return this._namespaces.android.layout_height || '';
            }
            get inlineWidth() {
                return this.layoutWidth === 'wrap_content';
            }
            get inlineHeight() {
                return this.layoutHeight === 'wrap_content';
            }
            get blockWidth() {
                return this.layoutWidth === 'match_parent';
            }
            get blockHeight() {
                return this.layoutHeight === 'match_parent';
            }
            get flexibleWidth() {
                return this.layoutWidth === '0px' && hasFlexibleContainer(this.renderParent);
            }
            get flexibleHeight() {
                return this.layoutHeight === '0px' && hasFlexibleContainer(this.renderParent);
            }
            get labelFor() {
                return this._labelFor;
            }
            set labelFor(value) {
                if (value) {
                    value.companion = this;
                }
                this._labelFor = value;
            }
            set localSettings(value) {
                if (this._localSettings) {
                    Object.assign(this._localSettings, value);
                } else {
                    this._localSettings = Object.assign({}, value);
                }
            }
            get localSettings() {
                return this._localSettings;
            }
            set positioned(value) {
                this._positioned = value;
            }
            get positioned() {
                return this._positioned || !!this.target;
            }
            get target() {
                const target = this.dataset.androidTarget;
                return target ? document.getElementById(target) : null;
            }
        };
    };

    class View extends View$MX(squared.base.NodeUI) {}

    class ViewGroup extends View$MX(squared.base.NodeGroupUI) {
        constructor(id, node, children, parent) {
            var _a;
            super(id, node.sessionId);
            this.depth = node.depth;
            this.containerName = node.containerName + '_GROUP';
            this.actualParent = node.actualParent;
            this.documentParent = node.documentParent;
            this.dir = ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.dir) || '';
            this.retainAs(children, node, parent);
        }
        retainAs(children, node, parentAs) {
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i];
                const parent = item.parent;
                if (
                    parent &&
                    !(item === node && parent === parentAs && parentAs.replaceTry({ child: node, replaceWith: this }))
                ) {
                    const index = parent.children.indexOf(item);
                    if (index !== -1) {
                        parent.children.splice(index, 1);
                    }
                }
                item.unsafe('parent', this);
            }
            super.retainAs(children);
            this.setBounds();
            return this;
        }
        set containerType(value) {
            this._containerType = value;
        }
        get containerType() {
            return this._containerType;
        }
    }

    var NodeUI = squared.base.NodeUI;
    const { APP_SECTION, NODE_PROCEDURE: NODE_PROCEDURE$1, NODE_RESOURCE } = squared.base.lib.constant;
    const { isPlatform } = squared.lib.client;
    const { parseColor: parseColor$1 } = squared.lib.color;
    const { formatPX: formatPX$1, getSrcSet: getSrcSet$1, hasCoords, hasComputedStyle } = squared.lib.css;
    const { getElementsBetweenSiblings, getRangeClientRect: getRangeClientRect$1 } = squared.lib.dom;
    const { truncate: truncate$1 } = squared.lib.math;
    const { getElementAsNode } = squared.lib.session;
    const {
        assignEmptyValue,
        capitalize: capitalize$2,
        convertWord: convertWord$1,
        hasBit,
        isString: isString$2,
        iterateArray,
        lastItemOf,
        parseMimeType,
        partitionArray,
        plainMap,
        withinRange,
    } = squared.lib.util;
    const REGEXP_TEXTSYMBOL = /^[^\w\s\n]+[\s\n]+$/;
    function sortHorizontalFloat(list) {
        list.sort((a, b) => {
            const floatA = a.float;
            const floatB = b.float;
            if (floatA !== 'none' && floatB !== 'none') {
                if (floatA !== floatB) {
                    return floatA === 'left' ? -1 : 1;
                } else if (floatA === 'right' && floatB === 'right') {
                    return 1;
                }
            } else if (floatA !== 'none') {
                return floatA === 'left' ? -1 : 1;
            } else if (floatB !== 'none') {
                return floatB === 'left' ? 1 : -1;
            }
            return 0;
        });
    }
    function doOrderStandard(above, below) {
        const parentA = above.actualParent;
        const parentB = below.actualParent;
        if (above === parentB) {
            return -1;
        } else if (parentA === below) {
            return 1;
        }
        const { pageFlow: pA, zIndex: zA } = above;
        const { pageFlow: pB, zIndex: zB } = below;
        if (!pA && pB) {
            return zA >= 0 ? 1 : -1;
        } else if (!pB && pA) {
            return zB >= 0 ? -1 : 1;
        } else if (zA === zB) {
            return above.childIndex - below.childIndex;
        }
        return zA - zB;
    }
    function setBaselineItems(parent, baseline, items, index) {
        var _a;
        const { documentId, baselineHeight } = baseline;
        let aboveOffset = 0,
            bottomHeight = 0,
            bottomBaseline;
        for (let i = 0, length = items.length; i < length; ++i) {
            const item = items[i];
            if (item.baselineAltered) {
                continue;
            }
            let height = item.baselineHeight;
            if (height || item.textElement) {
                if (item.blockVertical && baseline.blockVertical) {
                    item.anchor('bottom', documentId);
                } else {
                    let bottomAligned;
                    if (isBottomAligned(item)) {
                        bottomAligned = true;
                    } else if (!item.isEmpty()) {
                        item.renderEach(child => {
                            if (isBottomAligned(child)) {
                                height = Math.max(child.baselineHeight, height);
                                bottomAligned = true;
                            }
                        });
                    } else {
                        bottomAligned = item.imageContainer && !baseline.textElement;
                    }
                    if (bottomAligned) {
                        if (height > baselineHeight) {
                            if (height >= bottomHeight) {
                                if (bottomBaseline) {
                                    bottomBaseline.anchor(getAnchorBaseline(item), item.documentId);
                                }
                                bottomHeight = height;
                                bottomBaseline = item;
                            } else if (bottomBaseline) {
                                item.anchor(getAnchorBaseline(bottomBaseline), bottomBaseline.documentId);
                            }
                            continue;
                        } else if (index === 0 && Math.floor(item.linear.top) <= Math.ceil(item.renderParent.box.top)) {
                            item.anchor('top', 'true');
                            continue;
                        } else {
                            bottomAligned = false;
                        }
                    }
                    const verticalAlign = item.verticalAlign;
                    if (verticalAlign !== 0 && item.rendering) {
                        let adjustment;
                        if (index === 0) {
                            let minTop = item.bounds.top;
                            item.each(child => (minTop = Math.min(child.bounds.top, minTop)));
                            adjustment =
                                minTop -
                                parent.box.top +
                                parent.getBox(1 /* MARGIN_TOP */)[1] +
                                (verticalAlign < 0 ? verticalAlign * -1 : 0);
                            item.anchor('top', 'true');
                            if (verticalAlign > 0) {
                                aboveOffset = Math.max(verticalAlign, aboveOffset);
                            }
                        } else {
                            adjustment = item.linear.top - baseline.bounds.top;
                            item.anchor('top', documentId);
                        }
                        item.setBox(1 /* MARGIN_TOP */, { reset: 1, adjustment });
                        item.baselineAltered = true;
                    } else if (
                        (Math.ceil(height) >= baselineHeight &&
                            item.find(
                                child =>
                                    (!child.baselineElement ||
                                        child.verticalAligned ||
                                        (child.positionRelative &&
                                            (child.top < 0 || (!child.hasPX('top') && child.bottom > 0)))) &&
                                    Math.ceil(
                                        child.bounds.top +
                                            (child.positionRelative
                                                ? child.hasPX('top')
                                                    ? child.top
                                                    : child.bottom
                                                : 0)
                                    ) < item.box.top
                            )) ||
                        ((_a = item.wrapperOf) === null || _a === void 0 ? void 0 : _a.verticalAlign)
                    ) {
                        item.anchor('top', documentId);
                    } else {
                        item.anchor(bottomAligned ? 'bottom' : 'baseline', documentId);
                    }
                }
            } else if (isBottomAligned(item)) {
                if (bottomBaseline) {
                    item.anchor('baseline', bottomBaseline.documentId);
                } else {
                    bottomBaseline = item;
                }
            }
        }
        if (aboveOffset) {
            baseline.modifyBox(1 /* MARGIN_TOP */, aboveOffset);
        }
        if (bottomBaseline) {
            baseline.anchorDelete('baseline', 'top', 'bottom');
            baseline.anchor(getAnchorBaseline(bottomBaseline), bottomBaseline.documentId);
        }
    }
    function getTextBottom(nodes) {
        return nodes
            .filter(
                node =>
                    ((node.tagName === 'TEXTAREA' || (node.tagName === 'SELECT' && node.toElementInt('size') > 1)) &&
                        (node.baseline || node.verticalAligned)) ||
                    (node.css('verticalAlign') === 'text-bottom' && node.containerName !== 'INPUT_IMAGE')
            )
            .sort((a, b) => {
                if (a.baselineHeight === b.baselineHeight) {
                    return a.tagName === 'SELECT' ? 1 : 0;
                }
                return b.baselineHeight - a.baselineHeight;
            });
    }
    function isConstraintLayout(layout, vertical) {
        if (
            (layout.parent.flexElement &&
                (layout.parent.css('alignItems') === 'baseline' ||
                    layout.find(item => item.flexbox.alignSelf === 'baseline'))) ||
            (layout.singleRowAligned &&
                layout.find(
                    item =>
                        item.positionRelative &&
                        item.percentWidth === 0 &&
                        Math.ceil(item.actualRect('bottom', 'bounds')) > Math.floor(layout.node.box.bottom)
                ))
        ) {
            return false;
        }
        return (
            layout.find(
                item =>
                    ((item.rightAligned || item.centerAligned) &&
                        layout.size() > 1 &&
                        ((item.positionStatic && item.marginTop >= 0) ||
                            (item.positionRelative &&
                                Math.floor(item.actualRect('bottom', 'bounds')) <=
                                    Math.ceil(layout.node.box.bottom))) &&
                        layout.singleRowAligned) ||
                    (item.percentWidth > 0 && item.percentWidth < 1) ||
                    item.hasPX('maxWidth')
            ) &&
            (!vertical || layout.every(item => item.marginTop >= 0))
        );
    }
    function setVerticalLayout(node) {
        node.addAlign(8 /* VERTICAL */);
        node.removeAlign(1 /* UNKNOWN */);
    }
    function constraintAlignTop(node, boxTop) {
        node.anchorParent('vertical', 0);
        const adjustment = node.bounds.top - boxTop;
        if (adjustment !== 0 && Math.floor(adjustment) !== Math.floor(node.marginTop)) {
            node.setBox(1 /* MARGIN_TOP */, { reset: 1, adjustment });
            node.baselineAltered = true;
        }
    }
    function setObjectContainer(layout) {
        const node = layout.node;
        const element = node.element;
        const src = (element.tagName === 'OBJECT' ? element.data : element.src).trim();
        const type = element.type || parseMimeType(src);
        if (type.startsWith('image/')) {
            node.setCacheValue('tagName', 'IMG');
            node.setCacheValue('imageElement', true);
            element.src = src;
            layout.containerType = CONTAINER_NODE.IMAGE;
        } else if (type.startsWith('video/')) {
            node.setCacheValue('tagName', 'VIDEO');
            element.src = src;
            layout.containerType = CONTAINER_NODE.VIDEOVIEW;
        } else if (type.startsWith('audio/')) {
            node.setCacheValue('tagName', 'AUDIO');
            element.src = src;
            layout.containerType = CONTAINER_NODE.VIDEOVIEW;
        } else {
            layout.containerType = CONTAINER_NODE.TEXT;
        }
    }
    function setConstraintFloatAligmnment(layout) {
        let left, right;
        for (const node of layout) {
            switch (node.float) {
                case 'left':
                    left = true;
                    break;
                case 'right':
                    right = true;
                    break;
                default:
                    return false;
            }
        }
        layout.addAlign(256 /* FLOAT */);
        if (left && right) {
            layout.addAlign(32 /* BLOCK */);
        }
        return true;
    }
    function isBottomAligned(node) {
        const wrapperOf = node.wrapperOf;
        if (wrapperOf) {
            node = wrapperOf;
        }
        return (node.imageContainer && node.baseline) || node.tagName === 'RUBY';
    }
    function canControlAscendItems(node) {
        switch (node.tagName) {
            case 'CODE':
            case 'PRE':
            case 'RUBY':
                return false;
        }
        switch (node.controlName) {
            case CONTAINER_TAGNAME.HORIZONTAL_SCROLL:
            case CONTAINER_TAGNAME.VERTICAL_SCROLL:
            case CONTAINER_TAGNAME_X.VERTICAL_SCROLL:
            case CONTAINER_TAGNAME.RADIOGROUP:
                return false;
            default:
                return true;
        }
    }
    function flattenContainer(node) {
        const { renderChildren, renderTemplates } = node;
        for (let i = 0, length = renderChildren.length; i < length; ++i) {
            const item = renderChildren[i];
            if (
                item.rendering &&
                item.isUnstyled() &&
                !item.inlineDimension &&
                !item.preserveWhiteSpace &&
                !item.layoutGrid &&
                !item.layoutElement &&
                canControlAscendItems(item) &&
                item.removeTry()
            ) {
                item.hide();
                const depth = item.depth;
                const children = flattenContainer(item);
                const r = children.length - 1;
                children[0].modifyBox(8 /* MARGIN_LEFT */, item.marginLeft);
                children[r].modifyBox(2 /* MARGIN_RIGHT */, item.marginRight);
                renderChildren.splice(i, 0, ...children);
                renderTemplates.splice(
                    i,
                    0,
                    ...plainMap(children, child => {
                        child.init(node, depth);
                        child.renderParent = node;
                        return child.renderedAs;
                    })
                );
                i += r;
                length = renderChildren.length;
            }
        }
        return renderChildren;
    }
    function getBoxWidth(node) {
        const parent = node.actualParent;
        if (node.naturalElement && node.inlineStatic && parent.blockStatic && parent === node.renderParent) {
            return parent.box.width - (node.linear.left - parent.box.left);
        } else if (parent.floatContainer) {
            const container = node.ascend({
                condition: item => item.of(CONTAINER_NODE.FRAME, 128 /* COLUMN */),
                including: parent,
                attr: 'renderParent',
            });
            if (container.length) {
                const { left, right, width } = node.box;
                let offsetLeft = 0,
                    offsetRight = 0;
                const renderChildren = node.renderChildren;
                const children = parent.naturalChildren;
                for (let i = 0, length = children.length; i < length; ++i) {
                    const item = children[i];
                    if (item.floating) {
                        const linear = item.linear;
                        if (!renderChildren.includes(item) && node.intersectY(linear)) {
                            if (item.float === 'left') {
                                if (Math.floor(linear.right) > left) {
                                    offsetLeft = Math.max(offsetLeft, linear.right - left);
                                }
                            } else if (right > Math.ceil(linear.left)) {
                                offsetRight = Math.max(offsetRight, right - linear.left);
                            }
                        }
                    }
                }
                return width - (offsetLeft + offsetRight);
            }
        }
        return 0;
    }
    function causesLineBreak(element) {
        if (element.tagName === 'BR') {
            return true;
        } else if (hasComputedStyle(element)) {
            const style = getComputedStyle(element);
            const hasWidth = () =>
                (style.getPropertyValue('width') === '100%' || style.getPropertyValue('min-width') === '100%') &&
                (style.getPropertyValue('max-width') === 'none' || style.getPropertyValue('max-width') === '100%');
            if (!hasCoords(style.getPropertyValue('position'))) {
                const display = style.getPropertyValue('display');
                switch (display) {
                    case 'block':
                    case 'flex':
                    case 'grid':
                        return style.getPropertyValue('float') === 'none' || hasWidth();
                    default:
                        return (display.startsWith('inline-') || display === 'table') && hasWidth();
                }
            }
        }
        return false;
    }
    function sortTemplateInvalid(a, b) {
        const above = a.node.innerMostWrapped;
        const below = b.node.innerMostWrapped;
        const depth = above.depth - below.depth;
        if (depth === 0) {
            const parentA = above.actualParent;
            const parentB = below.actualParent;
            if (parentA && parentB) {
                if (above === parentB) {
                    return -1;
                } else if (parentA === below) {
                    return 1;
                } else if (parentA === parentB) {
                    return doOrderStandard(above, below);
                } else if (parentA.actualParent === parentB.actualParent) {
                    return doOrderStandard(parentA, parentB);
                }
            }
            return above.id - below.id;
        }
        return depth;
    }
    const getVerticalLayout = layout =>
        isConstraintLayout(layout, true)
            ? CONTAINER_NODE.CONSTRAINT
            : layout.find(item => item.positionRelative || (!item.pageFlow && item.autoPosition))
            ? CONTAINER_NODE.RELATIVE
            : CONTAINER_NODE.LINEAR;
    const getVerticalAlignedLayout = layout =>
        isConstraintLayout(layout, true)
            ? CONTAINER_NODE.CONSTRAINT
            : layout.find(item => item.positionRelative)
            ? CONTAINER_NODE.RELATIVE
            : CONTAINER_NODE.LINEAR;
    const sortTemplateStandard = (a, b) => doOrderStandard(a.node.innerMostWrapped, b.node.innerMostWrapped);
    const getAnchorDirection = reverse =>
        reverse ? ['right', 'left', 'rightLeft', 'leftRight'] : ['left', 'right', 'leftRight', 'rightLeft'];
    const getAnchorBaseline = node => (isBottomAligned(node) ? 'baseline' : 'bottom');
    const hasCleared = (layout, clearMap, ignoreFirst = true) =>
        clearMap.size > 0 && !!layout.find((node, index) => (index > 0 || !ignoreFirst) && clearMap.has(node));
    const isUnknownParent = (node, containerType, length) =>
        node.containerType === containerType &&
        node.size() === length &&
        (node.alignmentType === 0 || node.hasAlign(1 /* UNKNOWN */));
    function setHorizontalAlignment(node) {
        if (node.centerAligned) {
            node.anchorParent('horizontal', 0.5);
        } else {
            const autoMargin = node.autoMargin;
            if (autoMargin.horizontal) {
                node.anchorParent('horizontal', autoMargin.leftRight ? 0.5 : autoMargin.left ? 1 : 0);
            } else {
                if (node.rightAligned) {
                    node.anchor('right', 'parent');
                    node.anchorStyle('horizontal', 1);
                } else {
                    node.anchor('left', 'parent');
                    node.anchorStyle('horizontal', 0);
                }
                if (node.blockStatic || node.percentWidth || (node.block && node.multiline && node.floating)) {
                    node.anchor(node.rightAligned ? 'left' : 'right', 'parent');
                }
            }
        }
    }
    function setVerticalAlignment(node, onlyChild = true, biasOnly) {
        const autoMargin = node.autoMargin;
        let bias = onlyChild ? 0 : NaN;
        if (node.floating) {
            bias = 0;
        } else if (autoMargin.vertical) {
            bias = autoMargin.topBottom ? 0.5 : autoMargin.top ? 1 : 0;
        } else if (node.imageContainer || node.inlineVertical) {
            switch (node.css('verticalAlign')) {
                case 'baseline':
                    bias = onlyChild ? 0 : 1;
                    break;
                case 'middle':
                    bias = 0.5;
                    break;
                case 'bottom':
                    bias = 1;
                    break;
                default:
                    bias = 0;
                    break;
            }
        } else {
            const parent = node.actualParent;
            if (parent.display === 'table-cell') {
                switch (parent.css('verticalAlign')) {
                    case 'middle':
                        bias = 0.5;
                        break;
                    case 'bottom':
                        bias = 1;
                        break;
                    default:
                        bias = 0;
                        break;
                }
            } else {
                switch (node.display) {
                    case 'inline-flex':
                    case 'inline-grid':
                    case 'inline-table':
                    case 'table-cell':
                        bias = 0;
                        break;
                }
            }
        }
        if (!isNaN(bias)) {
            if (biasOnly) {
                node.app('layout_constraintVertical_bias', bias.toString(), false);
                node.delete('layout_constraintVertical_chainStyle');
            } else {
                node.anchorStyle('vertical', bias, onlyChild ? '' : 'packed', false);
            }
        }
    }
    class Controller extends squared.base.ControllerUI {
        constructor() {
            super(...arguments);
            this.localSettings = {
                layout: {
                    pathName: 'res/layout',
                    fileExtension: 'xml',
                    baseTemplate: '<?xml version="1.0" encoding="utf-8"?>\n',
                },
                directory: {
                    string: 'res/values',
                    font: 'res/font',
                    image: 'res/drawable',
                    video: 'res/raw',
                    audio: 'res/raw',
                },
                use: {
                    svg: false,
                },
                style: {
                    anchorFontColor: 'rgb(0, 0, 238)',
                    formFontSize: '13.3333px',
                    inputBorderColor: 'rgb(0, 0, 0)',
                    inputBackgroundColor: isPlatform(2 /* MAC */) ? 'rgb(255, 255, 255)' : 'rgb(221, 221, 221)',
                    inputColorBorderColor: 'rgb(119, 119, 199)',
                    meterForegroundColor: 'rgb(99, 206, 68)',
                    meterBackgroundColor: 'rgb(237, 237, 237)',
                    progressForegroundColor: 'rgb(138, 180, 248)',
                    progressBackgroundColor: 'rgb(237, 237, 237)',
                },
                mimeType: {
                    font: new Set(['font/ttf', 'font/otf']),
                    image: new Set([
                        'image/png',
                        'image/jpeg',
                        'image/gif',
                        'image/svg+xml',
                        'image/bmp',
                        'image/webp',
                        'image/heic',
                        'image/heif',
                        'image/x-icon',
                    ]),
                    audio: new Set([
                        'video/3gpp',
                        'video/mp4',
                        'video/mp2t',
                        'video/x-matroska',
                        'audio/aac',
                        'audio/flac',
                        'audio/gsm',
                        'audio/midi',
                        'audio/mpeg',
                        'audio/wav',
                        'audio/ogg',
                    ]),
                    video: new Set(['video/3gpp', 'video/mp4', 'video/mp2t', 'video/x-matroska', 'video/webm']),
                },
                unsupported: {
                    cascade: new Set([
                        'IMG',
                        'INPUT',
                        'SELECT',
                        'TEXTAREA',
                        'PROGRESS',
                        'METER',
                        'HR',
                        'IFRAME',
                        'VIDEO',
                        'AUDIO',
                        'OBJECT',
                        'svg',
                    ]),
                    tagName: new Set([
                        'HEAD',
                        'TITLE',
                        'META',
                        'BASE',
                        'SCRIPT',
                        'STYLE',
                        'LINK',
                        'OPTION',
                        'INPUT:hidden',
                        'COLGROUP',
                        'MAP',
                        'AREA',
                        'SOURCE',
                        'TEMPLATE',
                        'DATALIST',
                        'PARAM',
                        'TRACK',
                    ]),
                    excluded: new Set(['BR', 'WBR']),
                },
                deviations: {
                    textMarginBoundarySize: 8,
                    legendBottomOffset: 0.25,
                },
                floatPrecision: 3,
            };
        }
        init() {
            const userSettings = this.userSettings;
            const dpiRatio = 160 / userSettings.resolutionDPI;
            this._targetAPI = userSettings.targetAPI || 30 /* LATEST */;
            this._screenDimension = {
                width: userSettings.resolutionScreenWidth * dpiRatio,
                height: userSettings.resolutionScreenHeight * dpiRatio,
            };
            this._viewSettings = {
                systemName: capitalize$2(this.application.systemName),
                screenDimension: this._screenDimension,
                supportRTL: userSettings.supportRTL,
                lineHeightAdjust: userSettings.lineHeightAdjust,
                floatPrecision: this.localSettings.floatPrecision,
            };
            super.init();
        }
        optimize(rendered) {
            for (let i = 0, length = rendered.length; i < length; ++i) {
                const node = rendered[i];
                node.applyOptimizations();
                if (node.hasProcedure(NODE_PROCEDURE$1.CUSTOMIZATION)) {
                    node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
                }
                const target = node.target;
                if (target) {
                    const outerWrapper = node.outerMostWrapper;
                    if (node !== outerWrapper && target === outerWrapper.target) {
                        continue;
                    }
                    const parent = this.application.resolveTarget(node.sessionId, target);
                    if (parent) {
                        const template = node.removeTry({ alignSiblings: true });
                        if (template) {
                            const renderChildren = parent.renderChildren;
                            const renderTemplates = parent.renderTemplates || (parent.renderTemplates = []);
                            const index = parseInt(node.dataset.androidTargetIndex);
                            if (!isNaN(index) && index >= 0 && index < renderChildren.length) {
                                renderChildren.splice(index, 0, node);
                                renderTemplates.splice(index, 0, template);
                            } else {
                                renderChildren.push(node);
                                renderTemplates.push(template);
                            }
                            node.renderParent = parent;
                        }
                    }
                }
            }
        }
        finalize(layouts) {
            const insertSpaces = this.userSettings.insertSpaces;
            for (const layout of layouts) {
                layout.content = replaceTab(layout.content.replace('{#0}', getRootNs(layout.content)), insertSpaces);
            }
        }
        processUnknownParent(layout) {
            const node = layout.node;
            switch (node.tagName) {
                case 'OBJECT':
                case 'EMBED':
                    setObjectContainer(layout);
                    return;
                case 'RUBY': {
                    const children = [];
                    let title = [],
                        content = [],
                        active;
                    const createColumn = () => {
                        let rt,
                            text,
                            length = title.length;
                        if (length > 1) {
                            rt = this.createNodeGroup(title[0], title, node, {
                                containerType: CONTAINER_NODE.RELATIVE,
                                alignmentType: 4 /* HORIZONTAL */,
                                delegate: true,
                            });
                            rt.css('whiteSpace', 'nowrap');
                            rt.setLayoutWidth('wrap_content');
                        } else if (length) {
                            rt = title[0];
                        }
                        length = content.length;
                        if (length > 1) {
                            text = this.createNodeGroup(content[0], content, node, {
                                containerType: CONTAINER_NODE.RELATIVE,
                                alignmentType: 4 /* HORIZONTAL */,
                                delegate: true,
                            });
                            text.css('whiteSpace', 'nowrap');
                            text.setLayoutWidth('wrap_content');
                        } else if (length) {
                            text = content[0];
                        }
                        if (rt && text) {
                            const group = this.createNodeGroup(rt, [rt, text], node, {
                                containerType: CONTAINER_NODE.LINEAR,
                                alignmentType: 8 /* VERTICAL */,
                                delegate: true,
                            });
                            group.setLayoutWidth('wrap_content');
                            group.setLayoutHeight('wrap_content');
                            group.mergeGravity('gravity', 'center_horizontal');
                            group.android('baselineAlignedChildIndex', '1');
                            children.push(group);
                        } else if (rt) {
                            rt.mergeGravity('layout_gravity', 'bottom');
                            children.push(rt);
                        } else if (text) {
                            text.mergeGravity('layout_gravity', 'bottom');
                            children.push(text);
                        }
                    };
                    for (const item of layout.toArray()) {
                        switch (item.tagName) {
                            case 'RP':
                            case 'RT':
                                title.push(item);
                                active = true;
                                break;
                            default:
                                if (active) {
                                    createColumn();
                                    title = [];
                                    content = [];
                                    active = false;
                                }
                                content.push(item);
                                break;
                        }
                    }
                    createColumn();
                    node.retainAs(children);
                    node.android('baselineAlignedChildIndex', '0');
                    layout.setContainerType(CONTAINER_NODE.LINEAR, 4 /* HORIZONTAL */);
                    return;
                }
            }
            if (layout.find(item => !item.pageFlow && !item.autoPosition)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 16 /* ABSOLUTE */ | 1 /* UNKNOWN */);
            } else if (layout.size() <= 1) {
                const child = node.item(0);
                if (child) {
                    if (child.plainText) {
                        child.hide();
                        node.clear();
                        node.inlineText = true;
                        node.textContent = child.textContent;
                        layout.setContainerType(CONTAINER_NODE.TEXT, 512 /* INLINE */);
                    } else if (child.percentWidth > 0 && child.percentWidth < 1) {
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 16384 /* PERCENT */);
                    } else if (
                        child.autoMargin.leftRight ||
                        child.autoMargin.left ||
                        (child.hasPX('maxWidth') && !child.support.maxDimension && !child.inputElement)
                    ) {
                        layout.containerType = CONTAINER_NODE.CONSTRAINT;
                    } else {
                        const parent = layout.parent;
                        if (parent.layoutHorizontal && (parent.layoutRelative || parent.layoutLinear)) {
                            if (child.positionRelative) {
                                layout.setContainerType(CONTAINER_NODE.RELATIVE, 8 /* VERTICAL */);
                            } else if (child.baselineElement) {
                                layout.setContainerType(CONTAINER_NODE.LINEAR, 4 /* HORIZONTAL */);
                            } else {
                                layout.containerType = CONTAINER_NODE.FRAME;
                            }
                        } else if (
                            child.baselineElement &&
                            ((parent.layoutGrid && !parent.tableElement) ||
                                (parent.flexElement && node.flexbox.alignSelf === 'baseline'))
                        ) {
                            layout.setContainerType(CONTAINER_NODE.LINEAR, 4 /* HORIZONTAL */);
                        } else {
                            layout.containerType = CONTAINER_NODE.FRAME;
                        }
                    }
                    layout.addAlign(2048 /* SINGLE */);
                } else {
                    this.processUnknownChild(layout);
                }
            } else if (Resource.hasLineBreak(node, true)) {
                layout.setContainerType(getVerticalAlignedLayout(layout), 8 /* VERTICAL */ | 1 /* UNKNOWN */);
            } else if (this.checkConstraintFloat(layout)) {
                layout.containerType = CONTAINER_NODE.CONSTRAINT;
                if (!setConstraintFloatAligmnment(layout)) {
                    if (layout.linearY) {
                        layout.addAlign(8 /* VERTICAL */);
                    } else if (
                        (layout.every(item => item.inlineFlow) ||
                            layout.find(item => item.floating || item.rightAligned)) &&
                        layout.singleRowAligned
                    ) {
                        layout.addAlign(4 /* HORIZONTAL */);
                    } else {
                        layout.addAlign(layout.find(item => item.blockStatic) ? 8 /* VERTICAL */ : 512 /* INLINE */);
                        layout.addAlign(1 /* UNKNOWN */);
                    }
                }
            } else if (layout.linearX || layout.singleRowAligned) {
                if (this.checkFrameHorizontal(layout)) {
                    layout.addRender(256 /* FLOAT */ | 4 /* HORIZONTAL */);
                } else if (this.checkConstraintHorizontal(layout)) {
                    layout.containerType = CONTAINER_NODE.CONSTRAINT;
                } else if (this.checkLinearHorizontal(layout)) {
                    layout.containerType = CONTAINER_NODE.LINEAR;
                    if (layout.floated) {
                        sortHorizontalFloat(layout.children);
                    }
                } else {
                    layout.containerType =
                        layout.singleRowAligned && isConstraintLayout(layout, false)
                            ? CONTAINER_NODE.CONSTRAINT
                            : CONTAINER_NODE.RELATIVE;
                }
                layout.addAlign(4 /* HORIZONTAL */);
            } else if (layout.linearY) {
                layout.setContainerType(
                    getVerticalLayout(layout),
                    8 /* VERTICAL */ |
                        (node.rootElement ||
                        layout.find((item, index) => item.inlineFlow && layout.item(index + 1).inlineFlow, {
                            end: layout.size() - 1,
                        })
                            ? 1 /* UNKNOWN */
                            : 0)
                );
            } else if (layout.every(item => item.inlineFlow)) {
                if (this.checkFrameHorizontal(layout)) {
                    layout.addRender(256 /* FLOAT */);
                    layout.addRender(4 /* HORIZONTAL */);
                } else {
                    layout.setContainerType(getVerticalLayout(layout), 8 /* VERTICAL */ | 1 /* UNKNOWN */);
                }
            } else {
                const siblings = [];
                const clearMap = layout.parent.floatContainer ? this.application.clearMap : null;
                for (const item of layout) {
                    if (item.alignedVertically(siblings, clearMap)) {
                        layout.setContainerType(getVerticalLayout(layout), 8 /* VERTICAL */ | 1 /* UNKNOWN */);
                        return;
                    }
                    siblings.push(item);
                }
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 1 /* UNKNOWN */);
            }
        }
        processUnknownChild(layout) {
            const node = layout.node;
            const background = node.visibleStyle.background;
            if (node.tagName === 'OBJECT') {
                setObjectContainer(layout);
            } else if (node.inlineText && (background || !node.textEmpty)) {
                layout.containerType = CONTAINER_NODE.TEXT;
            } else if (node.blockStatic && node.naturalChildren.length === 0 && (background || node.contentBoxHeight)) {
                layout.containerType = CONTAINER_NODE.FRAME;
            } else if (
                node.bounds.height === 0 &&
                node.naturalChild &&
                node.naturalElements.length === 0 &&
                node.elementId === '' &&
                node.marginTop === 0 &&
                node.marginRight === 0 &&
                node.marginBottom === 0 &&
                node.marginLeft === 0 &&
                !background &&
                !node.rootElement &&
                node.use === ''
            ) {
                node.hide();
                layout.next = true;
            } else {
                switch (node.tagName) {
                    case 'LI':
                    case 'OUTPUT':
                        layout.containerType = CONTAINER_NODE.TEXT;
                        break;
                    default:
                        if (node.textContent !== '' && (background || !node.pageFlow || node.pseudoElt === '::after')) {
                            layout.containerType = CONTAINER_NODE.TEXT;
                            node.inlineText = true;
                        } else {
                            layout.containerType = CONTAINER_NODE.FRAME;
                            node.exclude({ resource: NODE_RESOURCE.VALUE_STRING });
                        }
                        break;
                }
            }
        }
        processTraverseHorizontal(layout, siblings) {
            const { parent, floated } = layout;
            if (floated && floated.size === 1 && layout.every(item => item.floating)) {
                if (isUnknownParent(parent, CONTAINER_NODE.CONSTRAINT, layout.size())) {
                    parent.addAlign(256 /* FLOAT */);
                    parent.removeAlign(1 /* UNKNOWN */);
                    return;
                } else {
                    layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 256 /* FLOAT */);
                }
            } else if (this.checkFrameHorizontal(layout)) {
                layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                layout.addRender(256 /* FLOAT */);
                layout.addRender(4 /* HORIZONTAL */);
            } else if (layout.size() !== siblings.length || parent.hasAlign(8 /* VERTICAL */)) {
                layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                this.processLayoutHorizontal(layout);
            } else {
                if (!parent.hasAlign(512 /* INLINE */)) {
                    parent.addAlign(4 /* HORIZONTAL */);
                }
                parent.removeAlign(1 /* UNKNOWN */);
            }
            return layout;
        }
        processTraverseVertical(layout) {
            const clearMap = this.application.clearMap;
            const { parent, floated } = layout;
            if (layout.find((item, index) => item.lineBreakTrailing && index < layout.size() - 1)) {
                if (!parent.hasAlign(8 /* VERTICAL */)) {
                    const containerType = getVerticalLayout(layout);
                    if (isUnknownParent(parent, containerType, layout.size())) {
                        setVerticalLayout(parent);
                        return;
                    } else {
                        if (parent.layoutConstraint) {
                            parent.addAlign(8 /* VERTICAL */);
                            if (!parent.hasAlign(16 /* ABSOLUTE */)) {
                                return;
                            }
                        }
                        layout.node = this.createLayoutGroup(layout);
                        layout.setContainerType(containerType, 8 /* VERTICAL */ | 1 /* UNKNOWN */);
                    }
                }
            } else if (floated) {
                if (floated.size === 1 && layout.every(item => item.floating)) {
                    layout.node = this.createLayoutGroup(layout);
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 256 /* FLOAT */);
                } else if (hasCleared(layout, clearMap)) {
                    layout.node = this.createLayoutGroup(layout);
                    layout.addRender(256 /* FLOAT */);
                    layout.addRender(8 /* VERTICAL */);
                } else if (layout.item(0).floating) {
                    layout.node = this.createLayoutGroup(layout);
                    layout.addRender(256 /* FLOAT */);
                    layout.addRender(4 /* HORIZONTAL */);
                }
            }
            if (!parent.hasAlign(8 /* VERTICAL */)) {
                const containerType = getVerticalAlignedLayout(layout);
                if (isUnknownParent(parent, containerType, length)) {
                    setVerticalLayout(parent);
                    return;
                } else {
                    if (parent.layoutConstraint) {
                        parent.addAlign(8 /* VERTICAL */);
                        if (!parent.hasAlign(16 /* ABSOLUTE */)) {
                            return;
                        }
                    }
                    layout.node = this.createLayoutGroup(layout);
                    layout.setContainerType(containerType, 8 /* VERTICAL */);
                }
            }
            return layout;
        }
        processLayoutHorizontal(layout) {
            if (this.checkConstraintFloat(layout)) {
                layout.containerType = CONTAINER_NODE.CONSTRAINT;
                if (!setConstraintFloatAligmnment(layout)) {
                    layout.addAlign(512 /* INLINE */);
                }
            } else if (this.checkConstraintHorizontal(layout)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 4 /* HORIZONTAL */);
            } else if (this.checkLinearHorizontal(layout)) {
                layout.setContainerType(CONTAINER_NODE.LINEAR, 4 /* HORIZONTAL */);
                if (layout.floated) {
                    sortHorizontalFloat(layout.children);
                }
            } else {
                layout.setContainerType(CONTAINER_NODE.RELATIVE, 4 /* HORIZONTAL */);
            }
            return layout;
        }
        sortRenderPosition(parent, templates) {
            if (parent.layoutRelative) {
                if (templates.some(item => item.node.zIndex !== 0)) {
                    templates.sort(sortTemplateStandard);
                }
            } else if (parent.layoutConstraint) {
                if (templates.some(item => item.node.zIndex !== 0 || !item.node.pageFlow)) {
                    const originalParent = parent.innerMostWrapped;
                    const actualParent = [];
                    const nested = [];
                    let result = [];
                    for (let i = 0, length = templates.length; i < length; ++i) {
                        const item = templates[i];
                        const node = item.node.innerMostWrapped;
                        if (node.pageFlow || node.actualParent === node.documentParent || node === originalParent) {
                            result.push(item);
                            actualParent.push(node);
                        } else {
                            nested.push(item);
                        }
                    }
                    result.sort(sortTemplateStandard);
                    const length = nested.length;
                    if (length) {
                        const map = new Map();
                        const invalid = [];
                        const below = [];
                        for (let i = 0; i < length; ++i) {
                            const item = nested[i];
                            const node = item.node.innerMostWrapped;
                            const adjacent = node.ascend({
                                condition: above => actualParent.includes(above),
                                error: above => above.rootElement,
                            })[0];
                            if (adjacent) {
                                const data = map.get(adjacent);
                                if (data) {
                                    data.push(item);
                                } else {
                                    map.set(adjacent, [item]);
                                }
                            } else if (node.zIndex < 0) {
                                below.push(item);
                            } else {
                                invalid.push(item);
                            }
                        }
                        for (const [adjacent, children] of map.entries()) {
                            children.sort(sortTemplateStandard);
                            const index = result.findIndex(item => item.node.innerMostWrapped === adjacent);
                            if (index !== -1) {
                                result.splice(index + 1, 0, ...children);
                            } else {
                                for (let i = 0, q = children.length; i < q; ++i) {
                                    const item = children[i];
                                    const node = item.node.innerMostWrapped;
                                    if (node.zIndex < 0) {
                                        below.push(item);
                                    } else {
                                        invalid.push(item);
                                    }
                                }
                            }
                        }
                        if (below.length) {
                            below.sort(sortTemplateInvalid);
                            result = below.concat(result);
                        }
                        if (invalid.length) {
                            invalid.sort(sortTemplateInvalid);
                            result = result.concat(invalid);
                        }
                    }
                    return result;
                }
            }
            return templates;
        }
        checkFrameHorizontal(layout) {
            const floated = layout.floated;
            if (floated) {
                switch (floated.size) {
                    case 1:
                        if (
                            layout.node.cssAscend('textAlign') === 'center' &&
                            layout.find(item => !item.block && !item.floating)
                        ) {
                            return true;
                        } else if (floated.has('right')) {
                            let pageFlow = 0,
                                multiline;
                            for (const node of layout) {
                                if (node.floating) {
                                    if (multiline) {
                                        return false;
                                    }
                                    continue;
                                } else if (node.multiline) {
                                    multiline = true;
                                }
                                ++pageFlow;
                            }
                            return pageFlow > 0 && !layout.singleRowAligned;
                        } else if (layout.item(0).floating) {
                            return layout.linearY || !!layout.find(item => !item.inlineFlow, { start: 1 });
                        }
                        break;
                    case 2:
                        return layout.linearY || !!layout.find(item => !item.inlineFlow || item.lineBreakLeading);
                }
            }
            return false;
        }
        checkConstraintFloat(layout) {
            if (layout.size() > 1) {
                const clearMap = this.application.clearMap;
                const emptyMap = clearMap.size === 0;
                let A = true,
                    B = true;
                for (const node of layout) {
                    if (emptyMap || !clearMap.has(node)) {
                        if (
                            A &&
                            !(
                                node.floating ||
                                node.autoMargin.horizontal ||
                                (node.inlineDimension && !node.inputElement && !node.controlElement) ||
                                node.imageContainer ||
                                node.marginTop < 0
                            )
                        ) {
                            if (!B) {
                                return false;
                            }
                            A = false;
                        }
                        if (B && node.percentWidth === 0) {
                            if (!A) {
                                return false;
                            }
                            B = false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        checkConstraintHorizontal(layout) {
            var _a;
            if (layout.size() > 1 && layout.singleRowAligned) {
                switch ((_a = layout.floated) === null || _a === void 0 ? void 0 : _a.size) {
                    case 1:
                        if (hasCleared(layout, this.application.clearMap)) {
                            return false;
                        } else {
                            let left, right;
                            for (const node of layout) {
                                const { float, autoMargin } = node;
                                if (float === 'left' || autoMargin.right) {
                                    if (right) {
                                        return false;
                                    }
                                    left = true;
                                }
                                if (float === 'right' || autoMargin.left) {
                                    if (left) {
                                        return false;
                                    }
                                    right = true;
                                }
                            }
                        }
                        break;
                    case 2:
                        return false;
                }
                return !!layout.find(
                    node =>
                        ((node.blockVertical || node.autoMargin.leftRight || node.marginTop < 0) &&
                            Math.floor(node.bounds.bottom) <= Math.ceil(layout.node.box.bottom)) ||
                        (node.percentWidth > 0 &&
                            node.percentWidth < 1 &&
                            !node.inputElement &&
                            !node.controlElement) ||
                        (node.css('verticalAlign') === 'bottom' && !layout.parent.hasHeight && node.inlineVertical)
                );
            }
            return false;
        }
        checkLinearHorizontal(layout) {
            if (
                layout.node.lineHeight === 0 &&
                (!layout.floated || !layout.floated.has('right')) &&
                layout.singleRowAligned
            ) {
                const { fontSize, lineHeight } = layout.item(0);
                const boxWidth = layout.parent.actualBoxWidth();
                let contentWidth = 0;
                for (const node of layout) {
                    if (
                        !(
                            node.naturalChild &&
                            node.isEmpty() &&
                            !node.positionRelative &&
                            node.css('verticalAlign') === 'baseline' &&
                            !node.multiline &&
                            !node.blockVertical &&
                            node.lineHeight === lineHeight &&
                            node.fontSize === fontSize &&
                            node.zIndex === 0 &&
                            !node.inputElement &&
                            !node.controlElement
                        )
                    ) {
                        return false;
                    }
                    contentWidth += node.linear.width;
                    if (contentWidth >= boxWidth) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        setConstraints(rendering) {
            rendering.each(node => {
                if (node.rendering && node.visible && node.hasProcedure(NODE_PROCEDURE$1.CONSTRAINT)) {
                    if (node.hasAlign(2 /* AUTO_LAYOUT */)) {
                        if (node.layoutConstraint && !node.layoutElement) {
                            this.evaluateAnchors(node.renderChildren);
                        }
                    } else if (node.layoutRelative) {
                        this.processRelativeHorizontal(node);
                    } else if (node.layoutConstraint) {
                        const renderChildren = node.renderChildren;
                        const length = renderChildren.length;
                        const pageFlow = new Array(length);
                        let j = 0;
                        for (let i = 0; i < length; ++i) {
                            const item = renderChildren[i];
                            if (!item.positioned) {
                                if (item.pageFlow || item.autoPosition) {
                                    pageFlow[j++] = item;
                                } else {
                                    const constraint = item.constraint;
                                    if (item.outerWrapper === node) {
                                        if (!constraint.horizontal) {
                                            item.anchorParent('horizontal', 0);
                                        }
                                        if (!constraint.vertical) {
                                            item.anchorParent('vertical', 0);
                                        }
                                    } else {
                                        if (item.leftTopAxis) {
                                            if (!constraint.horizontal) {
                                                item.getAnchorPosition(node, true);
                                            }
                                            if (!constraint.vertical) {
                                                item.getAnchorPosition(node, false);
                                            }
                                        }
                                        if (!constraint.horizontal) {
                                            this.applyGuideline('horizontal', { target: item, parent: node });
                                        }
                                        if (!constraint.vertical) {
                                            this.applyGuideline('vertical', { target: item, parent: node });
                                        }
                                        item.positioned = true;
                                    }
                                }
                            }
                        }
                        if (j > 0) {
                            pageFlow.length = j;
                            if (node.layoutHorizontal) {
                                this.processConstraintHorizontal(node, pageFlow);
                            } else if (j > 1) {
                                this.processConstraintChain(node, pageFlow);
                            } else {
                                const item = pageFlow[0];
                                if (!item.constraint.horizontal) {
                                    setHorizontalAlignment(item);
                                }
                                if (!item.constraint.vertical) {
                                    item.anchorParent('vertical');
                                    setVerticalAlignment(item);
                                }
                                item.setConstraintDimension(1);
                            }
                            this.evaluateAnchors(pageFlow);
                        }
                    }
                }
            });
        }
        renderNodeGroup(layout) {
            const { node, containerType } = layout;
            switch (containerType) {
                case CONTAINER_NODE.FRAME:
                case CONTAINER_NODE.RELATIVE:
                case CONTAINER_NODE.CONSTRAINT:
                    break;
                case CONTAINER_NODE.LINEAR: {
                    const options = createViewAttribute();
                    options.android.orientation = hasBit(layout.alignmentType, 8 /* VERTICAL */)
                        ? 'vertical'
                        : 'horizontal';
                    node.apply(options);
                    break;
                }
                case CONTAINER_NODE.GRID: {
                    const options = createViewAttribute();
                    const android = options.android;
                    if (layout.rowCount) {
                        android.rowCount = layout.rowCount.toString();
                    }
                    android.columnCount = layout.columnCount ? layout.columnCount.toString() : '1';
                    node.apply(options);
                    break;
                }
                default:
                    if (layout.isEmpty()) {
                        return this.renderNode(layout);
                    }
                    return;
            }
            node.setControlType(View.getControlName(containerType, node.api), containerType);
            node.addAlign(layout.alignmentType);
            node.render(layout.parent);
            return {
                type: 1 /* XML */,
                node,
                controlName: node.controlName,
            };
        }
        renderNode(layout) {
            var _a;
            const node = layout.node;
            let { parent, containerType } = layout,
                controlName = View.getControlName(containerType, node.api);
            const setReadOnly = () => {
                const element = node.element;
                if (element.readOnly) {
                    node.android('focusable', 'false');
                }
                if (element.disabled) {
                    node.android('enabled', 'false');
                }
            };
            const setInlineBlock = () => {
                const { centerAligned, rightAligned } = node;
                node.css('display', 'inline-block', true);
                node.setCacheValue('centerAligned', centerAligned);
                node.setCacheValue('rightAligned', rightAligned);
            };
            const setBoundsWidth = () =>
                node.css('width', formatPX$1(node.bounds.width - (node.contentBox ? node.contentBoxWidth : 0)), true);
            const setBoundsHeight = () =>
                node.css(
                    'height',
                    formatPX$1(node.bounds.height - (node.contentBox ? node.contentBoxHeight : 0)),
                    true
                );
            switch (node.tagName) {
                case 'IMG':
                case 'CANVAS': {
                    const element = node.element;
                    let imageSet;
                    if (node.actualParent.tagName === 'PICTURE') {
                        imageSet = getSrcSet$1(element, this.localSettings.mimeType.image);
                        if (imageSet) {
                            const setImageDimension = (width, image) => {
                                node.css('width', formatPX$1(width), true);
                                if (image && image.width && image.height) {
                                    const height = image.height * (width / image.width);
                                    node.css('height', formatPX$1(height), true);
                                }
                            };
                            const image = imageSet[0];
                            if (image.actualWidth) {
                                setImageDimension(
                                    image.actualWidth,
                                    this.application.resourceHandler.getImage(element.src)
                                );
                            } else {
                                const stored = this.application.resourceHandler.getImage(image.src);
                                if (stored) {
                                    setImageDimension(stored.width, stored);
                                }
                            }
                        }
                    } else {
                        let scaleType;
                        switch (node.css('objectFit')) {
                            case 'fill':
                                scaleType = 'fitXY';
                                break;
                            case 'contain':
                                scaleType = 'centerInside';
                                break;
                            case 'cover':
                                scaleType = 'centerCrop';
                                break;
                            case 'scale-down':
                                scaleType = 'fitCenter';
                                break;
                            case 'none':
                                scaleType = 'center';
                                break;
                        }
                        if (scaleType) {
                            node.android('scaleType', scaleType);
                        }
                    }
                    if (node.baseline) {
                        node.android('baselineAlignBottom', 'true');
                        if (node.marginBottom > 0 && parent.layoutLinear && parent.layoutHorizontal) {
                            node.mergeGravity('layout_gravity', 'bottom');
                        }
                    }
                    if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                        let src;
                        if (node.tagName === 'CANVAS') {
                            const data = element.toDataURL();
                            if (data) {
                                node.setControlType(controlName, containerType);
                                src = 'canvas_' + convertWord$1(node.controlId, true);
                                this.application.resourceHandler.writeRawImage({
                                    mimeType: 'image/png',
                                    filename: src + '.png',
                                    data,
                                    encoding: 'base64',
                                });
                            }
                        } else {
                            src = this.application.resourceHandler.addImageSrc(element, '', imageSet);
                        }
                        if (src) {
                            node.android('src', `@drawable/${src}`);
                        }
                    }
                    if (
                        !node.pageFlow &&
                        parent === node.absoluteParent &&
                        ((node.left < 0 && parent.css('overflowX') === 'hidden') ||
                            (node.top < 0 && parent.css('overflowY') === 'hidden'))
                    ) {
                        const container = this.application.createNode(node.sessionId, { parent, innerWrapped: node });
                        container.setControlType(CONTAINER_TAGNAME.FRAME, CONTAINER_NODE.FRAME);
                        container.inherit(node, 'base');
                        container.cssCopy(node, 'position', 'zIndex');
                        container.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE$1.ALL });
                        container.autoPosition = false;
                        if (node.percentWidth && parent.layoutConstraint && (parent.blockStatic || parent.hasWidth)) {
                            container.app(
                                'layout_constraintWidth_percent',
                                truncate$1(node.percentWidth, node.localSettings.floatPrecision)
                            );
                            container.setLayoutHeight('0px');
                        } else if (node.hasPX('width')) {
                            container.setLayoutWidth(formatPX$1(node.actualWidth));
                        } else {
                            container.setLayoutWidth('wrap_content');
                        }
                        if (node.percentHeight && parent.layoutConstraint) {
                            container.app(
                                'layout_constraintHeight_percent',
                                truncate$1(node.percentHeight, node.localSettings.floatPrecision)
                            );
                            container.setLayoutHeight('0px');
                        } else if (node.hasPX('height')) {
                            container.setLayoutHeight(formatPX$1(node.actualHeight));
                        } else {
                            container.setLayoutHeight('wrap_content');
                        }
                        container.render(parent);
                        container.saveAsInitial();
                        node.modifyBox(1 /* MARGIN_TOP */, node.top);
                        node.modifyBox(8 /* MARGIN_LEFT */, node.left);
                        this.application.addLayoutTemplate(parent, container, {
                            type: 1 /* XML */,
                            node: container,
                            controlName: CONTAINER_TAGNAME.FRAME,
                        });
                        parent = container;
                        layout.parent = container;
                    }
                    break;
                }
                case 'INPUT': {
                    const element = node.element;
                    const setInputMinMax = () => {
                        if (element.min) {
                            node.android('min', element.min);
                        }
                        if (element.max) {
                            node.android('max', element.max);
                        }
                    };
                    const setInputMinDimension = () => {
                        if (element.minLength !== -1) {
                            node.android('minLength', element.minLength.toString());
                        }
                        if (element.maxLength) {
                            node.android('maxLength', element.maxLength.toString());
                        }
                    };
                    switch (element.type) {
                        case 'radio':
                        case 'checkbox':
                            if (element.checked) {
                                node.android('checked', 'true');
                            }
                            node.exclude({ resource: NODE_RESOURCE.BOX_STYLE });
                            break;
                        case 'text':
                            node.android('inputType', 'text');
                            break;
                        case 'password':
                            node.android('inputType', 'textPassword');
                            break;
                        case 'number':
                        case 'range':
                            node.android('inputType', 'number');
                            node.android('progress', element.value);
                            setInputMinMax();
                            break;
                        case 'time':
                            node.android('inputType', 'time');
                            setInputMinMax();
                            break;
                        case 'date':
                            node.android('inputType', 'date');
                            setInputMinMax();
                            break;
                        case 'datetime-local':
                            node.android('inputType', 'datetime');
                            setInputMinMax();
                            break;
                        case 'email':
                            node.android('inputType', 'textEmailAddress');
                            setInputMinDimension();
                            break;
                        case 'tel':
                            node.android('inputType', 'phone');
                            setInputMinDimension();
                            break;
                        case 'url':
                            node.android('inputType', 'textUri');
                            setInputMinDimension();
                            break;
                        case 'week':
                        case 'month':
                        case 'search':
                            node.android('inputType', 'text');
                            setInputMinDimension();
                            break;
                        case 'image':
                        case 'color':
                            if (!node.hasWidth) {
                                setBoundsWidth();
                            }
                            break;
                    }
                    break;
                }
                case 'BUTTON':
                    for (const item of node.naturalChildren) {
                        if (!item.pageFlow || !item.textElement) {
                            item.android('elevation', '2px');
                        }
                    }
                    break;
                case 'TEXTAREA': {
                    const { cols, maxLength, rows } = node.element;
                    node.android('minLines', rows ? rows.toString() : '2');
                    switch (node.css('verticalAlign')) {
                        case 'middle':
                            node.mergeGravity('gravity', 'center_vertical');
                            break;
                        case 'bottom':
                            node.mergeGravity('gravity', 'bottom');
                            break;
                        default:
                            node.mergeGravity('gravity', 'top');
                            break;
                    }
                    if (maxLength) {
                        node.android('maxLength', maxLength.toString());
                    }
                    if (!node.hasWidth && cols > 0) {
                        node.css('width', formatPX$1(cols * 8));
                    }
                    if (!node.hasHeight) {
                        setBoundsHeight();
                    }
                    node.android('scrollbars', 'vertical');
                    node.android('inputType', 'textMultiLine');
                    if (node.overflowX) {
                        node.android('scrollHorizontally', 'true');
                    }
                    break;
                }
                case 'LEGEND': {
                    if (!node.hasWidth) {
                        node.css('minWidth', formatPX$1(node.actualWidth));
                        setInlineBlock();
                    }
                    const offset = node.actualHeight * this.localSettings.deviations.legendBottomOffset;
                    node.modifyBox(4 /* MARGIN_BOTTOM */, offset);
                    node.linear.bottom += offset;
                    break;
                }
                case 'METER':
                case 'PROGRESS': {
                    const { min, max, value } = node.element;
                    let foregroundColor, backgroundColor;
                    if (node.tagName === 'METER') {
                        ({
                            meterForegroundColor: foregroundColor,
                            meterBackgroundColor: backgroundColor,
                        } = this.localSettings.style);
                        if (max) {
                            if (value) {
                                node.android('progress', Math.round((value / max) * 100).toString());
                            }
                            if (max === 100) {
                                node.android('min', min.toString());
                                node.android('max', max.toString());
                            }
                        }
                    } else {
                        ({
                            progressForegroundColor: foregroundColor,
                            progressBackgroundColor: backgroundColor,
                        } = this.localSettings.style);
                        if (value) {
                            node.android('progress', value.toString());
                        }
                        if (max) {
                            node.android('max', max.toString());
                        }
                    }
                    if (!node.hasWidth) {
                        setBoundsWidth();
                    }
                    if (!node.hasHeight) {
                        setBoundsHeight();
                    }
                    node.android('progressTint', `@color/${Resource.addColor(foregroundColor)}`);
                    node.android('progressBackgroundTint', `@color/${Resource.addColor(backgroundColor)}`);
                    node.attr('_', 'style', '@android:style/Widget.ProgressBar.Horizontal');
                    node.exclude({ resource: NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.FONT_STYLE });
                    break;
                }
                case 'AUDIO':
                case 'VIDEO': {
                    const videoMimeType = this.localSettings.mimeType.video;
                    const element = node.element;
                    let src = element.src.trim(),
                        mimeType;
                    if (Resource.hasMimeType(videoMimeType, src)) {
                        mimeType = parseMimeType(src);
                    } else {
                        src = '';
                        iterateArray(element.children, source => {
                            if (source.tagName === 'SOURCE') {
                                if (Resource.hasMimeType(videoMimeType, source.src)) {
                                    src = source.src.trim();
                                    mimeType = parseMimeType(src);
                                    return true;
                                } else {
                                    mimeType = source.type.trim().toLowerCase();
                                    if (videoMimeType === '*' || videoMimeType.has(mimeType)) {
                                        src = source.src;
                                        return true;
                                    }
                                }
                            }
                        });
                    }
                    if (!node.hasPX('width')) {
                        setBoundsWidth();
                    }
                    if (!node.hasPX('height')) {
                        setBoundsHeight();
                    }
                    if (node.inline) {
                        setInlineBlock();
                    }
                    if (src !== '') {
                        this.application.resourceHandler.addVideo(src, mimeType);
                        node.inlineText = false;
                        node.exclude({ resource: NODE_RESOURCE.FONT_STYLE });
                        if (isString$2(element.poster)) {
                            Resource.addImage({ mdpi: element.poster.trim() });
                        }
                    } else if (isString$2(element.poster)) {
                        node.setCacheValue('tagName', 'IMG');
                        src = element.src;
                        element.src = element.poster.trim();
                        layout.containerType = CONTAINER_NODE.IMAGE;
                        const template = this.renderNode(layout);
                        element.src = src;
                        return template;
                    } else {
                        containerType = CONTAINER_NODE.TEXT;
                        controlName = View.getControlName(containerType, node.api);
                        layout.containerType = containerType;
                        node.inlineText = true;
                    }
                }
            }
            switch (controlName) {
                case CONTAINER_TAGNAME.TEXT: {
                    let overflow = '';
                    if (node.overflowX) {
                        overflow += 'horizontal';
                    }
                    if (node.overflowY) {
                        overflow += (overflow !== '' ? '|' : '') + 'vertical';
                    }
                    if (overflow !== '') {
                        node.android('scrollbars', overflow);
                    }
                    if (node.has('letterSpacing')) {
                        node.android(
                            'letterSpacing',
                            truncate$1(node.toFloat('letterSpacing') / node.fontSize, node.localSettings.floatPrecision)
                        );
                    }
                    if (node.css('textAlign') === 'justify') {
                        node.android('justificationMode', 'inter_word');
                    }
                    if (node.has('textShadow')) {
                        const match = /((?:rgb|hsl)a?\([^)]+\)|[a-z]{4,})?\s*(-?[\d.]+[a-z]+)\s+(-?[\d.]+[a-z]+)\s*([\d.]+[a-z]+)?/.exec(
                            node.css('textShadow')
                        );
                        if (match) {
                            const colorData = parseColor$1(match[1] || node.css('color'));
                            if (colorData) {
                                const colorName = Resource.addColor(colorData);
                                if (colorName !== '') {
                                    const precision = node.localSettings.floatPrecision;
                                    node.android('shadowColor', `@color/${colorName}`);
                                    node.android('shadowDx', truncate$1(node.parseWidth(match[2]) * 2, precision));
                                    node.android('shadowDy', truncate$1(node.parseHeight(match[3]) * 2, precision));
                                    node.android(
                                        'shadowRadius',
                                        truncate$1(match[4] ? Math.max(node.parseWidth(match[4]), 0) : 0.01, precision)
                                    );
                                }
                            }
                        }
                    }
                    switch (node.css('whiteSpace')) {
                        case 'nowrap':
                            node.android('singleLine', 'true');
                            if (node.css('textOverflow') === 'ellipsis' && node.css('overflow') === 'hidden') {
                                node.android('ellipsize', 'end');
                            }
                            break;
                        case 'pre':
                            node.android('breakStrategy', 'simple');
                            break;
                        default:
                            if (node.css('overflowWrap') === 'break-word') {
                                node.android('breakStrategy', 'high_quality');
                            }
                            break;
                    }
                    break;
                }
                case CONTAINER_TAGNAME.BUTTON:
                    if (!node.hasHeight) {
                        node.android('minHeight', formatPX$1(Math.ceil(node.actualHeight)));
                    }
                    node.mergeGravity('gravity', 'center_vertical');
                    setReadOnly();
                    break;
                case CONTAINER_TAGNAME.SELECT:
                case CONTAINER_TAGNAME.CHECKBOX:
                case CONTAINER_TAGNAME.RADIO:
                    setReadOnly();
                    break;
                case CONTAINER_TAGNAME.EDIT:
                    if (!node.companion && node.hasProcedure(NODE_PROCEDURE$1.ACCESSIBILITY)) {
                        [node.previousSibling, node.nextSibling].some(sibling => {
                            if (sibling && sibling.visible && sibling.pageFlow) {
                                const id = node.elementId;
                                if (id !== '' && id === sibling.toElementString('htmlFor').trim()) {
                                    sibling.android('labelFor', node.documentId);
                                    return true;
                                } else if (sibling.textElement && sibling.documentParent.tagName === 'LABEL') {
                                    sibling.documentParent.android('labelFor', node.documentId);
                                    return true;
                                }
                            }
                            return false;
                        });
                    }
                    if ((_a = node.element.list) === null || _a === void 0 ? void 0 : _a.children.length) {
                        controlName = CONTAINER_TAGNAME.EDIT_LIST;
                    } else if (node.api >= 26 /* OREO */) {
                        node.android('importantForAutofill', 'no');
                    }
                    setReadOnly();
                case CONTAINER_TAGNAME.RANGE:
                    if (!node.hasPX('width')) {
                        setBoundsWidth();
                    }
                    break;
                case CONTAINER_TAGNAME.LINE:
                    if (!node.hasHeight) {
                        node.setLayoutHeight(formatPX$1(node.contentBoxHeight || 1));
                    }
                    break;
            }
            node.setControlType(controlName, containerType);
            node.addAlign(layout.alignmentType);
            node.render(parent);
            return {
                type: 1 /* XML */,
                node,
                parent,
                controlName,
            };
        }
        renderNodeStatic(attrs, options) {
            let controlName = attrs.controlName;
            if (!controlName) {
                if (attrs.controlType) {
                    controlName = View.getControlName(attrs.controlType, this.userSettings.targetAPI);
                } else {
                    return '';
                }
            }
            const node = new View();
            this.afterInsertNode(node);
            node.setControlType(controlName);
            node.setLayoutWidth(attrs.width || 'wrap_content');
            node.setLayoutHeight(attrs.height || 'wrap_content');
            if (options) {
                node.apply(options);
                options.documentId = node.documentId;
            }
            return this.getEnclosingXmlTag(
                controlName,
                this.userSettings.showAttributes ? node.extractAttributes(1) : '',
                attrs.content
            );
        }
        renderSpace(attrs) {
            const android = attrs.android;
            let { width, height } = attrs;
            if (width) {
                if (lastItemOf(width) === '%') {
                    android.layout_columnWeight = truncate$1(
                        parseFloat(width) / 100,
                        this.localSettings.floatPrecision
                    );
                    width = '0px';
                }
            } else {
                width = 'wrap_content';
            }
            if (height) {
                if (lastItemOf(height) === '%') {
                    android.layout_rowWeight = truncate$1(parseFloat(height) / 100, this.localSettings.floatPrecision);
                    height = '0px';
                }
            } else {
                height = 'wrap_content';
            }
            if (attrs.column !== undefined) {
                android.layout_column = attrs.column.toString();
            }
            if (attrs.columnSpan) {
                android.layout_columnSpan = attrs.columnSpan.toString();
            }
            if (attrs.row !== undefined) {
                android.layout_row = attrs.row.toString();
            }
            if (attrs.rowSpan) {
                android.layout_rowSpan = attrs.rowSpan.toString();
            }
            const result = {
                android,
                app: attrs.app,
            };
            const output = this.renderNodeStatic({ controlName: CONTAINER_TAGNAME.SPACE, width, height }, result);
            attrs.documentId = result.documentId;
            return output;
        }
        addGuideline(options) {
            this.applyGuideline('horizontal', options);
            this.applyGuideline('vertical', options);
        }
        addBarrier(nodes, barrierDirection) {
            const unbound = [];
            for (let i = 0, length = nodes.length; i < length; ++i) {
                const node = nodes[i];
                const barrier = node.constraint.barrier;
                if (!barrier) {
                    node.constraint.barrier = {};
                } else if (barrier[barrierDirection]) {
                    continue;
                }
                unbound.push(node);
            }
            const length = unbound.length;
            if (length) {
                const options = {
                    android: {},
                    app: {
                        barrierDirection,
                        constraint_referenced_ids: concatString(
                            plainMap(unbound, item => getDocumentId(item.anchorTarget.documentId)),
                            ','
                        ),
                    },
                };
                const { api, anchorTarget } = unbound[length - 1];
                const content = this.renderNodeStatic(
                    { controlName: api < 29 /* Q */ ? CONTAINER_TAGNAME.BARRIER : CONTAINER_TAGNAME_X.BARRIER },
                    options
                );
                switch (barrierDirection) {
                    case 'top':
                    case 'left':
                        this.addBeforeOutsideTemplate(anchorTarget, content, false);
                        break;
                    default:
                        this.addAfterOutsideTemplate(anchorTarget, content, false);
                        break;
                }
                const documentId = options.documentId;
                if (documentId) {
                    for (let i = 0; i < length; ++i) {
                        unbound[i].constraint.barrier[barrierDirection] = documentId;
                    }
                    return documentId;
                }
            }
            return '';
        }
        evaluateAnchors(nodes) {
            var _a;
            const horizontalAligned = [];
            const verticalAligned = [];
            const length = nodes.length;
            for (let i = 0; i < length; ++i) {
                const node = nodes[i];
                if (node.constraint.horizontal) {
                    horizontalAligned.push(node);
                }
                if (node.constraint.vertical) {
                    verticalAligned.push(node);
                }
                if (node.alignParent('top') || node.alignSibling('top')) {
                    let current = node;
                    do {
                        const bottomTop = current.alignSibling('bottomTop');
                        if (bottomTop !== '') {
                            const next = nodes.find(item => item.documentId === bottomTop);
                            if (next && next.alignSibling('topBottom') === current.documentId) {
                                if (next.alignParent('bottom')) {
                                    break;
                                } else {
                                    current = next;
                                }
                            } else {
                                break;
                            }
                        } else {
                            if (current !== node && !current.alignParent('bottom')) {
                                if (current.blockHeight) {
                                    current.anchor('bottom', 'parent');
                                } else {
                                    const documentId =
                                        ((_a = current.constraint.barrier) === null || _a === void 0
                                            ? void 0
                                            : _a.bottom) || this.addBarrier([current], 'bottom');
                                    if (documentId) {
                                        current.anchor('bottomTop', documentId);
                                    }
                                }
                            }
                            break;
                        }
                    } while (true);
                }
            }
            for (let i = 0; i < length; ++i) {
                const node = nodes[i];
                if (node.anchored) {
                    continue;
                }
                const constraint = node.constraint;
                const current = constraint.current;
                if (!constraint.horizontal) {
                    for (const attr in current) {
                        const { documentId, horizontal } = current[attr];
                        if (horizontal && horizontalAligned.some(item => item.documentId === documentId)) {
                            constraint.horizontal = true;
                            horizontalAligned.push(node);
                            i = 0;
                            break;
                        }
                    }
                }
                if (!constraint.vertical) {
                    for (const attr in current) {
                        const { documentId, horizontal } = current[attr];
                        if (!horizontal && verticalAligned.some(item => item.documentId === documentId)) {
                            constraint.vertical = true;
                            verticalAligned.push(node);
                            i = 0;
                            break;
                        }
                    }
                }
            }
        }
        createNodeGroup(node, children, parent, options) {
            let containerType, alignmentType, delegate, cascade;
            if (options) {
                ({ containerType, alignmentType, delegate, cascade } = options);
            }
            const container = new ViewGroup(this.application.nextId, node, children, parent);
            if (containerType) {
                container.setControlType(View.getControlName(containerType, node.api), containerType);
            }
            if (alignmentType) {
                container.addAlign(alignmentType);
            }
            this.afterInsertNode(container);
            if (parent) {
                if (!parent.contains(container)) {
                    parent.add(container);
                    container.init(parent, node.depth);
                }
            }
            this.application.getProcessingCache(node.sessionId).add(container, !!delegate, !!cascade);
            return container;
        }
        createNodeWrapper(node, parent, options = {}) {
            var _a, _b, _c;
            const { children, containerType, alignmentType } = options;
            const container = this.application.createNode(node.sessionId, {
                parent,
                children,
                append: true,
                innerWrapped: node,
                delegate: true,
                cascade: !!(options.cascade || (children && children.length > 0 && !node.rootElement)),
            });
            container.inherit(node, 'base', 'alignment');
            if (node.documentRoot) {
                container.documentRoot = true;
                node.documentRoot = false;
            }
            container.actualParent = parent.naturalElement ? parent : node.actualParent;
            if (containerType) {
                container.setControlType(View.getControlName(containerType, node.api), containerType);
            }
            if (alignmentType) {
                container.addAlign(alignmentType);
            }
            container.addAlign(8192 /* WRAPPER */);
            container.exclude({
                resource:
                    (_a = options.resource) !== null && _a !== void 0
                        ? _a
                        : NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET,
                procedure: (_b = options.procedure) !== null && _b !== void 0 ? _b : NODE_PROCEDURE$1.CUSTOMIZATION,
                section: (_c = options.section) !== null && _c !== void 0 ? _c : APP_SECTION.ALL,
            });
            container.saveAsInitial();
            if (options.resetContentBox) {
                container.cssApply({
                    marginTop: '0px',
                    marginRight: '0px',
                    marginBottom: '0px',
                    marginLeft: '0px',
                    paddingTop: '0px',
                    paddingRight: '0px',
                    paddingBottom: '0px',
                    paddingLeft: '0px',
                    borderTopStyle: 'none',
                    borderRightStyle: 'none',
                    borderBottomStyle: 'none',
                    borderLeftStyle: 'none',
                    borderRadius: '0px',
                });
            }
            if (options.inheritContentBox !== false) {
                container.setCacheValue('contentBoxWidth', node.contentBoxWidth);
                container.setCacheValue('contentBoxHeight', node.contentBoxHeight);
            }
            if (options.resetMargin) {
                node.resetBox(15 /* MARGIN */, container);
            }
            if (options.inheritDataset && node.naturalElement) {
                Object.assign(container.dataset, node.dataset);
            }
            if (node.documentParent.layoutElement) {
                const android = node.namespace('android');
                for (const attr in android) {
                    if (attr.startsWith('layout_')) {
                        container.android(attr, android[attr]);
                        delete android[attr];
                    }
                }
            }
            if ((node.renderParent || parent).layoutGrid && node.android('layout_width') === '0px') {
                const columnWeight = node.android('layout_columnWeight');
                if (parseFloat(columnWeight)) {
                    node.delete('android', 'layout_columnWeight');
                    node.setLayoutWidth('match_parent');
                    container.android('layout_columnWeight', columnWeight);
                    container.setLayoutWidth('0px');
                }
            }
            if (node.renderParent && node.removeTry({ alignSiblings: true })) {
                node.rendered = false;
            }
            return container;
        }
        processRelativeHorizontal(node) {
            var _a;
            let autoPosition;
            if (node.hasAlign(8 /* VERTICAL */)) {
                let previous;
                node.renderEach(item => {
                    if (previous) {
                        item.anchor('topBottom', previous.documentId);
                    } else {
                        item.anchor('top', 'true');
                    }
                    if (item.pageFlow) {
                        if (item.rightAligned) {
                            item.anchor('right');
                        } else if (item.centerAligned) {
                            item.anchorParent('horizontal');
                        } else {
                            item.anchor('left');
                        }
                        previous = item;
                    } else {
                        item.anchor('left');
                        autoPosition = true;
                    }
                });
            } else {
                const children = flattenContainer(node);
                const rowsAll = [];
                const documentParent = node.nodeGroup ? node.documentParent : node;
                let textIndent = 0,
                    rightAligned,
                    centerAligned;
                switch (
                    ((!node.naturalElement && children[0].actualParent) || node).cssAscend('textAlign', {
                        startSelf: true,
                    })
                ) {
                    case 'center':
                        centerAligned = true;
                        break;
                    case 'right':
                    case 'end':
                        rightAligned = true;
                        break;
                }
                {
                    const clearMap = this.application.clearMap;
                    const emptyMap = clearMap.size === 0;
                    const baseWidth = node.marginLeft + node.marginRight < 0 ? node.marginRight : 0;
                    const lineWrap = node.css('whiteSpace') !== 'nowrap';
                    let boxWidth = documentParent.actualBoxWidth(getBoxWidth(node)),
                        rowWidth = baseWidth,
                        rows,
                        items,
                        previous,
                        siblings = null,
                        currentFloated = null,
                        currentFloatedWidth = 0,
                        currentFloatedHeight = 0;
                    const setCurrentFloated = item => {
                        currentFloated = item;
                        currentFloatedHeight = Math.floor(
                            item.marginTop +
                                item.bounds.height +
                                Math.max(0, item.marginBottom) +
                                (item.positionRelative ? (item.hasPX('top') ? item.top : item.bottom * -1) : 0)
                        );
                    };
                    const createNewRow = (item, floating) => {
                        if (currentFloated) {
                            items = [item];
                            rows.push(items);
                        } else if (floating) {
                            items = [];
                            rows = [items];
                            rowsAll.push([item, rows, true]);
                            setCurrentFloated(item);
                        } else {
                            items = [item];
                            rows = [items];
                            rowsAll.push([undefined, rows, false]);
                        }
                        rowWidth = baseWidth;
                    };
                    const setRowWidth = (item, textWidth) => {
                        const linearWidth = item.marginLeft + textWidth + item.marginRight;
                        if (item !== currentFloated) {
                            rowWidth += linearWidth;
                        } else {
                            currentFloatedWidth = linearWidth;
                        }
                        previous = item;
                    };
                    const relativeWrapWidth = (item, textWidth) =>
                        Math.floor(
                            currentFloatedWidth +
                                rowWidth +
                                textWidth -
                                (item.inlineStatic && item.styleElement ? item.contentBoxWidth : 0)
                        ) > Math.ceil(boxWidth + (rowsAll.length === 1 ? textIndent * -1 : 0));
                    const isMultiline = item =>
                        (item.plainText && Resource.hasLineBreak(item, false, true)) ||
                        (item.preserveWhiteSpace && /^\s*\n+/.test(item.textContent));
                    if (node.naturalElement) {
                        if (node.blockDimension) {
                            textIndent = node.parseUnit(node.css('textIndent'));
                            if (textIndent < 0) {
                                node.setCacheValue('paddingLeft', Math.max(0, node.paddingLeft + textIndent));
                            }
                        }
                        if (node.floating) {
                            const nextSibling = node.nextSibling;
                            if (
                                nextSibling &&
                                nextSibling.floating &&
                                nextSibling.float !== node.float &&
                                nextSibling.hasWidth
                            ) {
                                boxWidth = Math.max(boxWidth, node.actualParent.box.width - nextSibling.linear.width);
                                if (boxWidth > node.width && !node.visibleStyle.background && !node.hasPX('maxWidth')) {
                                    node.css('width', formatPX$1(boxWidth), true);
                                }
                            }
                        }
                    } else if (documentParent.layoutVertical) {
                        textIndent = documentParent.parseUnit(documentParent.css('textIndent'));
                        if (textIndent < 0 && documentParent.getBox(128 /* PADDING_LEFT */)[1] === 0) {
                            documentParent.modifyBox(128 /* PADDING_LEFT */, textIndent, false);
                        }
                    }
                    for (let i = 0, length = children.length, start = true; i < length; ++i) {
                        const item = children[i];
                        if (!item.pageFlow) {
                            if (start) {
                                item.anchor('left', 'true');
                                item.anchor('top', 'true');
                            } else {
                                const documentId = previous.documentId;
                                if (previous === currentFloated && currentFloated.float === 'right') {
                                    item.anchor('left', 'true');
                                } else {
                                    item.anchor(rightAligned ? 'rightLeft' : 'leftRight', documentId);
                                }
                                item.anchor('top', documentId);
                            }
                            autoPosition = true;
                            continue;
                        }
                        const { floating, textWidth } = item;
                        if (start) {
                            createNewRow(item, floating);
                            start = false;
                        } else {
                            let multiline = item.multiline,
                                textNewRow;
                            if (multiline && Math.floor(textWidth) <= boxWidth && !isMultiline(item)) {
                                multiline = false;
                                if (!item.hasPX('width')) {
                                    item.multiline = false;
                                }
                            }
                            siblings =
                                item.naturalChild &&
                                previous.naturalChild &&
                                item.inlineVertical &&
                                previous.inlineVertical &&
                                item.previousSibling !== previous
                                    ? getElementsBetweenSiblings(previous.element, item.element)
                                    : null;
                            if (item.textElement) {
                                if (!floating && REGEXP_TEXTSYMBOL.test(item.textContent)) {
                                    items.push(item);
                                    setRowWidth(item, textWidth);
                                    continue;
                                } else {
                                    let checkWidth = lineWrap;
                                    if (previous.textElement) {
                                        if (
                                            i === 1 &&
                                            item.plainText &&
                                            item.previousSibling === previous &&
                                            !/^\s+/.test(item.textContent) &&
                                            !/\s+$/.test(previous.textContent)
                                        ) {
                                            checkWidth = false;
                                        } else if (
                                            lineWrap &&
                                            previous.multiline &&
                                            (previous.bounds.width >= boxWidth ||
                                                (item.plainText && Resource.hasLineBreak(previous, false, true)))
                                        ) {
                                            textNewRow = true;
                                            checkWidth = false;
                                        }
                                    }
                                    if (checkWidth) {
                                        textNewRow =
                                            relativeWrapWidth(item, textWidth) ||
                                            (item.actualParent.tagName !== 'CODE' &&
                                                ((multiline && item.plainText) || isMultiline(item)));
                                    }
                                }
                            } else {
                                textNewRow = relativeWrapWidth(item, textWidth);
                            }
                            if (previous.floating) {
                                if (previous.float === 'left') {
                                    if (previous.marginRight < 0) {
                                        const right = Math.abs(previous.marginRight);
                                        item.modifyBox(
                                            8 /* MARGIN_LEFT */,
                                            previous.actualWidth +
                                                (previous.hasWidth
                                                    ? previous.paddingLeft + previous.borderLeftWidth
                                                    : 0) -
                                                right
                                        );
                                        item.anchor('left', previous.documentId);
                                        item.constraint.horizontal = true;
                                        previous.setBox(2 /* MARGIN_RIGHT */, { reset: 1 });
                                    }
                                } else if (item.float === 'right' && previous.marginLeft < 0) {
                                    const left = Math.abs(previous.marginLeft);
                                    const width = previous.actualWidth;
                                    if (left < width) {
                                        item.modifyBox(2 /* MARGIN_RIGHT */, width - left);
                                    }
                                    item.anchor('right', previous.documentId);
                                    item.constraint.horizontal = true;
                                    previous.setBox(8 /* MARGIN_LEFT */, { reset: 1 });
                                }
                            }
                            if (
                                textNewRow ||
                                (Math.ceil(item.bounds.top) >= Math.floor(previous.bounds.bottom) &&
                                    (item.blockStatic ||
                                        (item.blockDimension && item.baseline) ||
                                        (floating && previous.float === item.float) ||
                                        node.preserveWhiteSpace)) ||
                                (!floating &&
                                    (previous.blockStatic ||
                                        item.siblingsLeading.some(sibling => sibling.excluded && sibling.blockStatic) ||
                                        (siblings && siblings.some(element => causesLineBreak(element))))) ||
                                (floating &&
                                    !currentFloated &&
                                    item.float === 'right' &&
                                    ((_a = item.previousSibling) === null || _a === void 0 ? void 0 : _a.multiline)) ||
                                previous.autoMargin.horizontal ||
                                (!emptyMap && clearMap.has(item)) ||
                                Resource.checkPreIndent(previous)
                            ) {
                                if (!emptyMap && clearMap.has(item)) {
                                    item.setBox(1 /* MARGIN_TOP */, { reset: 1 });
                                    currentFloated = null;
                                    currentFloatedWidth = 0;
                                } else if (currentFloated) {
                                    let height = 0;
                                    for (let j = 0, q = rows.length; j < q; ++j) {
                                        height += Math.ceil(
                                            Math.max(
                                                ...plainMap(rows[j], sibling =>
                                                    Math.max(sibling.lineHeight, sibling.linear.height)
                                                )
                                            )
                                        );
                                    }
                                    if (height >= currentFloatedHeight) {
                                        currentFloated = null;
                                        currentFloatedWidth = 0;
                                    }
                                }
                                switch (item.tagName) {
                                    case 'SUP':
                                    case 'SUB':
                                        if (!floating && !previous.floating) {
                                            items.pop();
                                            createNewRow(previous, false);
                                            setRowWidth(previous, previous.textWidth);
                                            items.push(item);
                                            break;
                                        }
                                    default:
                                        createNewRow(item, floating);
                                        break;
                                }
                            } else if (floating && !currentFloated && item.float === 'left') {
                                lastItemOf(rowsAll)[0] = item;
                                setCurrentFloated(item);
                            } else {
                                if (currentFloated !== previous && !previous.hasPX('width')) {
                                    previous.multiline = false;
                                }
                                if (floating) {
                                    lastItemOf(rowsAll)[2] = true;
                                }
                                items.push(item);
                                if (
                                    siblings &&
                                    siblings.some(
                                        element => getElementAsNode(element, item.sessionId) || causesLineBreak(element)
                                    )
                                ) {
                                    const betweenStart = getRangeClientRect$1(siblings[0]);
                                    if (betweenStart && !betweenStart.numberOfLines) {
                                        const betweenEnd = siblings.length > 1 && getRangeClientRect$1(siblings.pop());
                                        if (!(betweenEnd && betweenEnd.numberOfLines)) {
                                            rowWidth += betweenEnd
                                                ? betweenStart.left - betweenEnd.right
                                                : betweenStart.width;
                                        }
                                    }
                                }
                            }
                        }
                        setRowWidth(item, textWidth);
                    }
                }
                {
                    const length = rowsAll.length;
                    const horizontalRows = [];
                    const firstLineStyle = node.firstLineStyle;
                    const textAlignLast = length > 1 ? node.textAlignLast : '';
                    const singleLine = !documentParent.preserveWhiteSpace && documentParent.tagName !== 'CODE';
                    let previousBaseline = null,
                        float,
                        baseline;
                    const setLayoutBelow = item => {
                        if (previousBaseline) {
                            item.anchor('topBottom', previousBaseline.documentId);
                        } else {
                            item.anchor('top', 'true');
                        }
                    };
                    const applyFirstLine = item => {
                        if (item.textElement) {
                            const plainText = item.plainText && !item.naturalElement;
                            for (const attr in firstLineStyle) {
                                if (!plainText) {
                                    const value = item.cssInitial(attr);
                                    if (value !== '') {
                                        continue;
                                    }
                                }
                                item.css(attr, firstLineStyle[attr]);
                            }
                            item.unsetCache('textStyle');
                        }
                    };
                    const isMultilineSegment = item => item.contentAltered && !item.naturalChild && item.inlineText;
                    for (let i = 0; i < length; ++i) {
                        const [currentFloated, rows, floating] = rowsAll[i];
                        if (currentFloated) {
                            node.floatContainer = true;
                            currentFloated.anchor(currentFloated.float, 'true');
                            setLayoutBelow(currentFloated);
                            float = currentFloated.float;
                        } else {
                            float = '';
                        }
                        const setTextIndent = item => {
                            if (i > 0 && textIndent < 0) {
                                item.modifyBox(
                                    8 /* MARGIN_LEFT */,
                                    float === 'left'
                                        ? Math.max(-(currentFloated.linear.width + textIndent), 0)
                                        : textIndent * -1
                                );
                            }
                        };
                        for (let j = 0, q = rows.length; j < q; ++j) {
                            const items = rows[j];
                            let r = items.length;
                            for (let k = 0; k < r - 1; ++k) {
                                const item = items[k];
                                if (isMultilineSegment(item)) {
                                    const element = item.element;
                                    if (element) {
                                        let textContent = '',
                                            width = 0,
                                            index;
                                        const start = k + 1;
                                        for (let l = start; l < r; ++l) {
                                            const next = items[l];
                                            if (isMultilineSegment(next) && next.element === element) {
                                                textContent += next.textContent;
                                                width += next.bounds.width;
                                                next.hide({ remove: true });
                                                next.exclude({ resource: NODE_RESOURCE.VALUE_STRING });
                                                index = l;
                                            } else {
                                                break;
                                            }
                                        }
                                        if (index) {
                                            let last = items[index],
                                                textRemainder = '',
                                                widthRemainder = 0;
                                            if (
                                                k === 0 &&
                                                index === r - 1 &&
                                                q === 1 &&
                                                i < length - 1 &&
                                                !currentFloated &&
                                                textAlignLast === '' &&
                                                (i > 0 || (textIndent >= 0 && !firstLineStyle))
                                            ) {
                                                const nodes = [];
                                                invalid: {
                                                    for (let l = i + 1; l < length; ++l) {
                                                        const [nextFloated, nextRows] = rowsAll[l];
                                                        if (!nextFloated && nextRows.length === 1) {
                                                            const row = nextRows[0];
                                                            for (let m = 0, n = row.length; m < n; ++m) {
                                                                const next = row[m];
                                                                if (
                                                                    isMultilineSegment(next) &&
                                                                    next.element === element
                                                                ) {
                                                                    textRemainder += next.textContent;
                                                                    widthRemainder += next.bounds.width;
                                                                    nodes.push(next);
                                                                } else {
                                                                    textRemainder = '';
                                                                    widthRemainder = 0;
                                                                    break invalid;
                                                                }
                                                            }
                                                        } else {
                                                            textRemainder = '';
                                                            widthRemainder = 0;
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (textRemainder !== '') {
                                                    const s = nodes.length;
                                                    for (let l = 0; l < s; ++l) {
                                                        const sibling = nodes[l];
                                                        sibling.hide({ remove: true });
                                                        sibling.exclude({ resource: NODE_RESOURCE.VALUE_STRING });
                                                    }
                                                    last = nodes[s - 1];
                                                    item.multiline = true;
                                                    j = q;
                                                    i = length;
                                                }
                                            }
                                            item.textContent = item.textContent + textContent + textRemainder;
                                            item.bounds.width += width + widthRemainder;
                                            item.setCacheValue(
                                                'marginRight',
                                                last.marginRight + last.getBox(2 /* MARGIN_RIGHT */)[1]
                                            );
                                            item.siblingsTrailing = last.siblingsTrailing;
                                            item.lineBreakTrailing = last.lineBreakTrailing;
                                            last.registerBox(4 /* MARGIN_BOTTOM */, item);
                                            items.splice(start, index - k);
                                            r = items.length;
                                        }
                                    }
                                }
                            }
                            if (r > 1) {
                                const bottomAligned = getTextBottom(items);
                                let textBottom = bottomAligned[0],
                                    offsetTop = 0,
                                    offsetBottom = 0,
                                    maxCenter = null,
                                    maxCenterHeight = 0,
                                    checkBottom,
                                    previousFloatRight,
                                    textBaseline;
                                baseline = NodeUI.baseline(
                                    textBottom ? items.filter(item => !bottomAligned.includes(item)) : items
                                );
                                if (baseline && textBottom) {
                                    if (baseline !== textBottom && baseline.bounds.height < textBottom.bounds.height) {
                                        baseline.anchor('bottom', textBottom.documentId);
                                    } else {
                                        baseline = NodeUI.baseline(items);
                                        textBottom = null;
                                    }
                                }
                                if (floating) {
                                    items.sort((a, b) => {
                                        const floatA = a.float;
                                        const floatB = b.float;
                                        if (floatA === 'left' && floatB === 'left') {
                                            return 0;
                                        } else if (floatA === 'left') {
                                            return -1;
                                        } else if (floatB === 'left') {
                                            return 1;
                                        }
                                        return 0;
                                    });
                                    checkBottom = true;
                                }
                                const baselineAlign = [];
                                for (let k = 0; k < r; ++k) {
                                    const item = items[k];
                                    if (firstLineStyle && i === 0 && j === 0) {
                                        applyFirstLine(item);
                                    }
                                    if (!item.constraint.horizontal) {
                                        const setAlignLeft = () => {
                                            if (k === 0) {
                                                if (float === 'left') {
                                                    item.anchor('leftRight', currentFloated.documentId);
                                                } else {
                                                    item.anchor('left', 'true');
                                                }
                                                setTextIndent(item);
                                            } else {
                                                item.anchor('leftRight', items[k - 1].documentId);
                                            }
                                            if (r === 1 && item.textElement && centerAligned) {
                                                item.android('textAlignment', 'center');
                                            }
                                        };
                                        const setAlignRight = () => {
                                            if (float === 'right') {
                                                item.anchor('rightLeft', currentFloated.documentId);
                                            } else {
                                                item.anchor('right', 'true');
                                            }
                                            if (r === 1 && item.textElement) {
                                                item.android('textAlignment', 'textEnd');
                                            }
                                        };
                                        if (item.autoMargin.horizontal) {
                                            if (item.autoMargin.leftRight) {
                                                item.anchor('centerHorizontal', 'true');
                                            } else if (item.autoMargin.left) {
                                                setAlignRight();
                                            } else {
                                                setAlignLeft();
                                            }
                                        } else if (item.float === 'right') {
                                            if (previousFloatRight) {
                                                item.anchor('rightLeft', previousFloatRight.documentId);
                                            } else {
                                                setAlignRight();
                                            }
                                            previousFloatRight = item;
                                        } else if (rightAligned) {
                                            if (k === r - 1) {
                                                setAlignRight();
                                            } else {
                                                item.anchor('rightLeft', items[k + 1].documentId);
                                            }
                                        } else {
                                            setAlignLeft();
                                        }
                                    }
                                    if (singleLine) {
                                        item.setSingleLine(true, k === r - 1);
                                    }
                                    if (item === baseline || item.baselineAltered || item === textBottom) {
                                        continue;
                                    } else if (i === 0 && item.controlElement) {
                                        item.setBox(1 /* MARGIN_TOP */, {
                                            reset: 1,
                                            adjustment: item.bounds.top - node.box.top,
                                        });
                                        item.anchor('top', 'true');
                                        item.baselineAltered = true;
                                        continue;
                                    }
                                    const verticalAlign = item.verticalAlign;
                                    if (item.multiline) {
                                        checkBottom = true;
                                    }
                                    if (item.baseline) {
                                        baselineAlign.push(item);
                                    } else if (item.inlineVertical) {
                                        switch (item.css('verticalAlign')) {
                                            case 'text-top':
                                                if (textBaseline === undefined) {
                                                    textBaseline = NodeUI.baseline(items, true);
                                                }
                                                if (textBaseline && item !== textBaseline) {
                                                    item.anchor('top', textBaseline.documentId);
                                                    continue;
                                                } else if (baseline) {
                                                    item.anchor('top', baseline.documentId);
                                                    continue;
                                                }
                                                break;
                                            case 'top':
                                                if (i === 0) {
                                                    item.anchor('top', 'true');
                                                    continue;
                                                }
                                                break;
                                            case 'middle': {
                                                const height = item.actualHeight;
                                                if (height > maxCenterHeight) {
                                                    maxCenter = item;
                                                    maxCenterHeight = height;
                                                }
                                                if (length === 1) {
                                                    item.anchor('centerVertical', 'true');
                                                    continue;
                                                } else if (baseline) {
                                                    const heightParent = baseline.actualHeight;
                                                    if (height < heightParent) {
                                                        item.anchor('top', baseline.documentId);
                                                        item.setBox(1 /* MARGIN_TOP */, {
                                                            reset: 1,
                                                            adjustment: Math.round((heightParent - height) / 2),
                                                        });
                                                        item.baselineAltered = true;
                                                        continue;
                                                    }
                                                }
                                                break;
                                            }
                                            case 'text-bottom':
                                                textBaseline || (textBaseline = NodeUI.baseline(items, true));
                                                if (textBaseline && textBaseline !== item) {
                                                    item.anchor('bottom', textBaseline.documentId);
                                                    continue;
                                                } else if (baseline) {
                                                    item.anchor('bottom', baseline.documentId);
                                                    continue;
                                                }
                                                break;
                                            case 'bottom':
                                                if (length === 1 && node.hasHeight) {
                                                    item.anchor('bottom', 'true');
                                                    continue;
                                                }
                                                break;
                                        }
                                        if (baseline) {
                                            if (verticalAlign !== 0) {
                                                item.modifyBox(1 /* MARGIN_TOP */, verticalAlign * -1);
                                                item.baselineAltered = true;
                                            }
                                            item.anchor('top', baseline.documentId);
                                        }
                                    }
                                    if (verticalAlign !== 0) {
                                        if (verticalAlign > 0) {
                                            if (
                                                i > 0 ||
                                                (node.renderParent.layoutVertical &&
                                                    items.every(sibling => !sibling.rendering))
                                            ) {
                                                offsetTop = Math.max(verticalAlign, offsetTop);
                                            }
                                        } else if (i < length - 1) {
                                            offsetBottom = Math.min(verticalAlign, offsetBottom);
                                        }
                                    }
                                }
                                const s = baselineAlign.length;
                                if (baseline) {
                                    baseline.baselineActive = true;
                                    if (s) {
                                        setBaselineItems(node, baseline, baselineAlign, i);
                                    } else if (baseline.multiline) {
                                        const { left, height } = baseline.bounds;
                                        for (let l = 0; l < r; ++l) {
                                            const item = items[l];
                                            if (item === baseline) {
                                                break;
                                            } else if (left < item.bounds.right && height < item.bounds.height) {
                                                baseline.anchor('bottom', item.documentId);
                                                break;
                                            }
                                        }
                                    }
                                    if (!baseline.alignSibling('bottom')) {
                                        if (maxCenter && maxCenterHeight > baseline.actualHeight) {
                                            baseline.setBox(1 /* MARGIN_TOP */, {
                                                reset: 1,
                                                adjustment: baseline.bounds.top - maxCenter.bounds.top,
                                            });
                                            baseline = maxCenter;
                                            maxCenter.anchorDelete('top');
                                        } else {
                                            if (offsetTop !== 0) {
                                                baseline.modifyBox(1 /* MARGIN_TOP */, offsetTop);
                                            }
                                            if (offsetBottom !== 0) {
                                                baseline.modifyBox(4 /* MARGIN_BOTTOM */, Math.abs(offsetBottom));
                                            }
                                        }
                                    }
                                } else if (textBottom && s > 0 && s < r) {
                                    const height = textBottom.bounds.height;
                                    for (let l = 0; l < s; ++l) {
                                        const item = baselineAlign[l];
                                        if (!item.multiline && height > item.bounds.height) {
                                            item.anchor('bottom', textBottom.documentId);
                                        }
                                    }
                                }
                                const lastRowAligned =
                                    i === length - 1 && textAlignLast !== '' && textAlignLast !== 'justify';
                                if (centerAligned || lastRowAligned) {
                                    const application = this.application;
                                    baseline = this.createNodeGroup(items[0], items, node, {
                                        containerType: CONTAINER_NODE.RELATIVE,
                                        alignmentType: 4 /* HORIZONTAL */,
                                    });
                                    baseline.render(node);
                                    if (lastRowAligned) {
                                        switch (textAlignLast) {
                                            case 'center':
                                                baseline.anchor('centerHorizontal', 'true');
                                                break;
                                            case 'right':
                                            case 'end':
                                                baseline.anchor('right', 'true');
                                                break;
                                            default:
                                                baseline.anchor('left', 'true');
                                                break;
                                        }
                                    } else {
                                        baseline.anchor('centerHorizontal', 'true');
                                    }
                                    baseline.setLayoutWidth('wrap_content');
                                    baseline.setLayoutHeight('wrap_content');
                                    let renderIndex = -1;
                                    for (let l = 0; l < r; ++l) {
                                        const item = items[l];
                                        const index = children.indexOf(item);
                                        if (index !== -1) {
                                            renderIndex = renderIndex === -1 ? index : Math.min(index, renderIndex);
                                        }
                                        item.removeTry();
                                        item.render(baseline);
                                        application.addLayoutTemplate(baseline, item, {
                                            type: 1 /* XML */,
                                            node: item,
                                            controlName: item.controlName,
                                        });
                                    }
                                    application.addLayoutTemplate(
                                        node,
                                        baseline,
                                        {
                                            type: 1 /* XML */,
                                            node: baseline,
                                            controlName: baseline.controlName,
                                        },
                                        renderIndex
                                    );
                                    if (previousBaseline) {
                                        baseline.anchor('topBottom', previousBaseline.documentId);
                                    }
                                } else {
                                    let leftIndent = NaN;
                                    if (!baseline) {
                                        baseline = items[0];
                                        checkBottom = true;
                                    }
                                    if (textIndent < 0 && i === 0 && !rightAligned && !currentFloated) {
                                        leftIndent = 0;
                                        checkBottom = false;
                                    }
                                    for (let k = 0; k < r; ++k) {
                                        const item = items[k];
                                        if (
                                            previousBaseline &&
                                            !item.alignSibling('baseline') &&
                                            !item.alignSibling('top') &&
                                            !item.alignSibling('bottom')
                                        ) {
                                            item.anchor('topBottom', previousBaseline.documentId);
                                        }
                                        if (!isNaN(leftIndent)) {
                                            if (Math.ceil(leftIndent) >= Math.abs(textIndent) || k === r - 1) {
                                                baseline = item;
                                                leftIndent = NaN;
                                            } else {
                                                leftIndent += item.linear.width;
                                            }
                                        } else if (checkBottom && item.linear.bottom >= baseline.linear.bottom) {
                                            baseline = item;
                                        }
                                        if (k === 0) {
                                            if (rightAligned) {
                                                item.horizontalRowEnd = true;
                                            } else {
                                                item.horizontalRowStart = true;
                                            }
                                        } else if (k === r - 1) {
                                            if (rightAligned) {
                                                item.horizontalRowStart = true;
                                            } else {
                                                item.horizontalRowEnd = true;
                                            }
                                        }
                                    }
                                }
                                horizontalRows.push(items);
                            } else {
                                baseline = items[0];
                                if (baseline) {
                                    if (firstLineStyle && i === 0 && j === 0) {
                                        applyFirstLine(baseline);
                                    }
                                    if (currentFloated) {
                                        if (currentFloated.float === 'left') {
                                            if (rightAligned || baseline.rightAligned) {
                                                baseline.anchor('right', 'true');
                                            } else {
                                                baseline.anchor('leftRight', currentFloated.documentId);
                                            }
                                        } else if (rightAligned || baseline.rightAligned) {
                                            baseline.anchor('rightLeft', currentFloated.documentId);
                                        } else {
                                            baseline.anchor('left', 'true');
                                        }
                                    } else if (baseline.floating) {
                                        baseline.anchor(baseline.float, 'true');
                                    } else if (textAlignLast !== '' && i === length - 1) {
                                        switch (textAlignLast) {
                                            case 'center':
                                                baseline.anchor('centerHorizontal', 'true');
                                                break;
                                            case 'right':
                                            case 'end':
                                                baseline.anchor('right', 'true');
                                                break;
                                            case 'justify':
                                                baseline.android('justificationMode', 'inter_word');
                                            default:
                                                baseline.anchor('left', 'true');
                                                break;
                                        }
                                    } else if (centerAligned || baseline.centerAligned) {
                                        baseline.anchor('centerHorizontal', 'true');
                                    } else if (rightAligned || baseline.rightAligned) {
                                        baseline.anchor('right', 'true');
                                    } else {
                                        baseline.anchor('left', 'true');
                                    }
                                    setLayoutBelow(baseline);
                                    if (!rightAligned) {
                                        setTextIndent(baseline);
                                    }
                                    if (
                                        singleLine &&
                                        i < length - 1 &&
                                        !baseline.lineBreakTrailing &&
                                        !baseline.multiline
                                    ) {
                                        baseline.setSingleLine(true, true);
                                    }
                                    baseline.horizontalRowStart = true;
                                    baseline.horizontalRowEnd = true;
                                    horizontalRows.push(items);
                                } else {
                                    if (currentFloated) {
                                        previousBaseline = currentFloated;
                                    }
                                    continue;
                                }
                            }
                            previousBaseline = baseline;
                        }
                    }
                    node.horizontalRows = horizontalRows;
                }
            }
            if (autoPosition) {
                node.renderChildren.sort((a, b) => {
                    if (!a.pageFlow && b.pageFlow) {
                        return 1;
                    } else if (!b.pageFlow && a.pageFlow) {
                        return -1;
                    }
                    return 0;
                });
                node.renderTemplates.sort((a, b) => {
                    const flowA = a.node.pageFlow;
                    const flowB = b.node.pageFlow;
                    if (!flowA && flowB) {
                        return 1;
                    } else if (!flowB && flowA) {
                        return -1;
                    }
                    return 0;
                });
            }
        }
        processConstraintHorizontal(node, children) {
            const reverse = node.hasAlign(1024 /* RIGHT */);
            const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
            let bias = 0,
                baselineCount = 0,
                tallest,
                bottom,
                previous,
                textBaseline,
                textBottom;
            if (!reverse) {
                switch (node.cssAscend('textAlign', { startSelf: true })) {
                    case 'center':
                        bias = 0.5;
                        break;
                    case 'right':
                    case 'end':
                        bias = 1;
                        break;
                }
            }
            if (node.floatContainer || children.some(item => item.floating)) {
                if (!reverse) {
                    let floating;
                    switch (bias) {
                        case 0.5:
                            [floating, children] = partitionArray(children, item => item.floating);
                            break;
                        case 1:
                            [floating, children] = partitionArray(children, item => item.float === 'left');
                            break;
                        default:
                            [floating, children] = partitionArray(children, item => item.float === 'right');
                            break;
                    }
                    if (floating.length) {
                        this.processConstraintChain(node, floating);
                    }
                }
                sortHorizontalFloat(children);
            }
            const { top: boxTop, width: boxWidth } = node.box;
            const baseline = NodeUI.baseline(children, false, true);
            const getMaxHeight = item => Math.max(item.actualHeight, item.lineHeight);
            let percentWidth = View.availablePercent(children, 'width', boxWidth),
                checkPercent = !node.hasPX('width'),
                baselineActive,
                documentId;
            if (baseline) {
                baselineActive = baseline.baselineElement && !baseline.imageElement;
                documentId = baseline.documentId;
            } else {
                baselineActive = false;
                documentId = 'parent';
            }
            for (let i = 0, length = children.length, start = false; i < length; ++i) {
                const item = children[i];
                if (previous) {
                    if (item.pageFlow) {
                        const autoMargin = item.autoMargin;
                        let anchoring;
                        if (autoMargin.leftRight) {
                            item.anchorStyle('horizontal', 0.5);
                            anchoring = true;
                        } else if (autoMargin.left) {
                            item.anchorStyle('horizontal', 1);
                            anchoring = true;
                        } else {
                            anchoring = i === length - 1;
                        }
                        previous.anchor(chainEnd, item.documentId);
                        item.anchor(chainStart, previous.documentId);
                        if (anchoring) {
                            item.anchor(anchorEnd, 'parent');
                        }
                    } else if (item.autoPosition) {
                        item.anchor(chainStart, previous.documentId);
                    }
                } else if (length === 1) {
                    bias = item.centerAligned ? 0.5 : item.rightAligned ? 1 : 0;
                    if (item.blockStatic || bias === 0.5) {
                        item.anchorParent('horizontal', bias);
                    } else {
                        item.anchor(anchorStart, 'parent');
                        item.anchorStyle('horizontal', 0);
                    }
                } else {
                    item.anchor(anchorStart, 'parent');
                    item.anchorStyle(
                        'horizontal',
                        bias,
                        item.innerMostWrapped.textJustified ? 'spread_inside' : 'packed'
                    );
                }
                if (item.pageFlow) {
                    if (item !== baseline) {
                        if (!tallest || getMaxHeight(item) > getMaxHeight(tallest)) {
                            tallest = item;
                        }
                        if (item.controlElement) {
                            constraintAlignTop(item, boxTop);
                        } else if (item.blockVertical) {
                            if (baselineActive && item.baseline) {
                                item.anchor(item.imageElement && !item.svgElement ? 'bottom' : 'baseline', documentId);
                                ++baselineCount;
                            } else {
                                item.anchorParent('vertical');
                                setVerticalAlignment(item, baselineActive, true);
                            }
                        } else if (item.inlineVertical) {
                            switch (item.css('verticalAlign')) {
                                case 'text-top':
                                    if (textBaseline === undefined) {
                                        textBaseline = NodeUI.baseline(children, true);
                                    }
                                    if (textBaseline && item !== textBaseline) {
                                        item.anchor('top', textBaseline.documentId);
                                    } else {
                                        constraintAlignTop(item, boxTop);
                                    }
                                    break;
                                case 'middle':
                                    if (textBottom === undefined) {
                                        textBottom = getTextBottom(children)[0] || null;
                                    }
                                    if (Math.ceil(item.linear.bottom) >= Math.floor(node.box.bottom)) {
                                        item.anchor('bottom', 'parent');
                                    } else if (textBottom || (baseline && !baseline.textElement)) {
                                        constraintAlignTop(item, boxTop);
                                    } else {
                                        item.anchorParent('vertical', 0.5);
                                    }
                                    break;
                                case 'text-bottom':
                                    if (textBaseline === undefined) {
                                        textBaseline = NodeUI.baseline(children, true);
                                    }
                                    if (textBaseline && item !== textBaseline) {
                                        if (textBottom === undefined) {
                                            textBottom = getTextBottom(children)[0] || null;
                                        }
                                        if (item !== textBottom) {
                                            item.anchor('bottom', textBaseline.documentId);
                                        } else if (textBottom) {
                                            constraintAlignTop(item, boxTop);
                                        }
                                        break;
                                    }
                                case 'bottom':
                                    if (!bottom) {
                                        bottom = children[0];
                                        for (let j = 1; j < length; ++j) {
                                            const child = children[j];
                                            if (!child.baseline && child.linear.bottom > bottom.linear.bottom) {
                                                bottom = child;
                                            }
                                        }
                                    }
                                    if (item === bottom) {
                                        constraintAlignTop(item, boxTop);
                                    } else {
                                        item.anchor('bottom', 'parent');
                                    }
                                    break;
                                default:
                                    if (
                                        baseline &&
                                        item.baseline &&
                                        !(
                                            !item.textElement &&
                                            !item.inputElement &&
                                            getMaxHeight(item) > getMaxHeight(baseline)
                                        )
                                    ) {
                                        item.anchor('baseline', documentId);
                                        ++baselineCount;
                                    } else {
                                        constraintAlignTop(item, boxTop);
                                    }
                                    break;
                            }
                        } else if (item.plainText) {
                            item.anchor('baseline', documentId || 'parent');
                            ++baselineCount;
                        } else {
                            constraintAlignTop(item, boxTop);
                        }
                        item.anchored = true;
                    }
                    if (!start) {
                        if (reverse) {
                            item.horizontalRowEnd = true;
                        } else {
                            item.horizontalRowStart = true;
                        }
                        start = true;
                    }
                    if (i === length - 1) {
                        if (reverse) {
                            item.horizontalRowStart = true;
                        } else {
                            item.horizontalRowEnd = true;
                        }
                    }
                    percentWidth = item.setConstraintDimension(percentWidth);
                    previous = item;
                } else if (item.autoPosition) {
                    if (documentId) {
                        item.anchor('top', documentId);
                    } else {
                        item.anchorParent('vertical', 0);
                        item.anchored = true;
                    }
                }
                if (checkPercent && item.percentWidth) {
                    node.setLayoutWidth('match_parent');
                    checkPercent = false;
                }
            }
            if (baseline) {
                baseline.constraint.horizontal = true;
                baseline.baselineActive = baselineCount > 0;
                if (baseline.documentParent.display === 'table-cell') {
                    setVerticalAlignment(baseline, false);
                    baseline.anchorParent('vertical');
                    return;
                }
                if (
                    tallest &&
                    !tallest.textElement &&
                    baseline.textElement &&
                    getMaxHeight(tallest) > getMaxHeight(baseline)
                ) {
                    switch (tallest.css('verticalAlign')) {
                        case 'top':
                        case 'text-top':
                            baseline.anchorParent('vertical', 0);
                            return;
                        case 'middle':
                            baseline.anchorParent('vertical', 0.5, '', true);
                            return;
                        case 'baseline':
                            baseline.anchor(getAnchorBaseline(tallest), tallest.documentId);
                            if (node.hasHeight) {
                                tallest.anchorDelete('top', 'bottom');
                                tallest.delete('app', 'layout_constraintVertical*');
                                tallest.setBox(1 /* MARGIN_TOP */, { reset: 0, adjustment: 0 });
                                tallest.anchor('baseline', 'parent', true);
                            } else {
                                const adjustment = node.box.bottom - tallest.bounds.bottom;
                                if (adjustment > 0 && Math.floor(adjustment) !== Math.floor(node.marginBottom)) {
                                    tallest.setBox(4 /* MARGIN_BOTTOM */, { reset: 1, adjustment });
                                }
                            }
                            return;
                        case 'bottom':
                        case 'text-bottom':
                            baseline.anchor('bottom', tallest.documentId);
                            return;
                    }
                }
                if (baseline.blockVertical) {
                    baseline.anchorParent('vertical');
                    setVerticalAlignment(baseline, baselineActive, true);
                } else if (baseline.baselineElement) {
                    baseline.anchor('baseline', 'parent');
                } else {
                    switch (baseline.css('verticalAlign')) {
                        case 'top':
                            baseline.anchorParent('vertical', 0);
                            break;
                        case 'middle':
                            baseline.anchorParent('vertical', 0.5);
                            break;
                        case 'bottom':
                            baseline.anchorParent('vertical', 1);
                            break;
                        default:
                            constraintAlignTop(baseline, boxTop);
                            break;
                    }
                }
            }
        }
        processConstraintChain(node, children) {
            const clearMap = this.application.clearMap;
            const emptyMap = clearMap.size === 0;
            const floating = node.hasAlign(256 /* FLOAT */);
            const parent = children[0].actualParent || node;
            const horizontal = NodeUI.partitionRows(children, clearMap);
            const checkClearMap = item => {
                if (!emptyMap) {
                    if (item.naturalChild) {
                        return clearMap.has(item);
                    } else if (item.nodeGroup) {
                        return !!item.find(child => child.naturalChild && clearMap.has(child), { cascade: true });
                    }
                    return clearMap.has(item.innerMostWrapped);
                }
                return false;
            };
            let checkPercent = !node.hasWidth ? 1 : 0,
                previousSiblings = [],
                previousRow,
                previousAlignParent;
            for (let i = 0, length = horizontal.length, start = false; i < length; ++i) {
                const partition = horizontal[i];
                const [floatingRight, floatingLeft] = partitionArray(
                    partition,
                    item => item.float === 'right' || !!item.autoMargin.left
                );
                let alignParent, aboveRowEnd, currentRowTop;
                for (let j = 0; j < 2; ++j) {
                    const reverse = j === 1;
                    const seg = !reverse ? floatingLeft : floatingRight;
                    const q = seg.length;
                    if (q === 0) {
                        continue;
                    }
                    const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
                    const rowStart = seg[0];
                    const rowEnd = seg[q - 1];
                    if (q > 1) {
                        rowStart.anchor(anchorStart, 'parent');
                        if (reverse) {
                            rowEnd.anchorStyle('horizontal', 1, 'packed');
                        } else {
                            rowStart.anchorStyle(
                                'horizontal',
                                !floating && parent.css('textAlign') === 'center' ? 0.5 : 0,
                                length === 1 && rowStart.innerMostWrapped.textJustified ? 'spread_inside' : 'packed'
                            );
                        }
                        rowEnd.anchor(anchorEnd, 'parent');
                    } else if (!rowStart.constraint.horizontal) {
                        setHorizontalAlignment(rowStart);
                    }
                    if (i === 1 || previousAlignParent) {
                        alignParent =
                            (!rowStart.pageFlow && (!rowStart.autoPosition || q === 1)) ||
                            (previousRow &&
                                ((!rowStart.floating &&
                                    previousRow.every(item => item.floating || !item.pageFlow) &&
                                    (clearMap.size === 0 || !partition.some(item => checkClearMap(item)))) ||
                                    previousRow.every(item => !item.pageFlow)));
                        previousAlignParent = alignParent;
                    }
                    let percentWidth = View.availablePercent(partition, 'width', node.box.width),
                        tallest;
                    for (let k = 0; k < q; ++k) {
                        const chain = seg[k];
                        if (i === 0 || alignParent) {
                            if (length === 1) {
                                chain.anchorParent('vertical');
                                setVerticalAlignment(chain, q === 1, true);
                            } else {
                                chain.anchor('top', 'parent');
                                chain.anchorStyle('vertical', 0, 'packed');
                            }
                        } else if (i === length - 1 && !currentRowTop) {
                            chain.anchor('bottom', 'parent');
                        }
                        if (chain.autoMargin.leftRight) {
                            chain.anchorParent('horizontal');
                        } else if (q > 1) {
                            const previous = seg[k - 1];
                            const next = seg[k + 1];
                            if (previous) {
                                if (!previous.pageFlow && previous.autoPosition) {
                                    let found;
                                    for (let l = k - 2; l >= 0; --l) {
                                        const item = seg[l];
                                        if (item.pageFlow) {
                                            found = item;
                                            break;
                                        }
                                    }
                                    if (found) {
                                        chain.anchor(chainStart, found.documentId);
                                    } else if (!chain.constraint.horizontal) {
                                        chain.anchor(anchorStart, 'parent');
                                    }
                                } else {
                                    chain.anchor(chainStart, previous.documentId);
                                }
                            }
                            if (next) {
                                chain.anchor(chainEnd, next.documentId);
                            }
                        }
                        percentWidth = chain.setConstraintDimension(percentWidth);
                        if (checkPercent === 1 && chain.percentWidth) {
                            checkPercent = -1;
                        }
                        if (previousRow && k === 0) {
                            if (!emptyMap && clearMap.has(chain) && !chain.floating) {
                                chain.modifyBox(1 /* MARGIN_TOP */, lastItemOf(previousRow).bounds.height * -1, false);
                            }
                            if (floating) {
                                let checkBottom;
                                for (let l = 0, r = previousSiblings.length; l < r; ++l) {
                                    if (chain.bounds.top < Math.floor(previousSiblings[l].bounds.bottom)) {
                                        checkBottom = true;
                                        break;
                                    }
                                }
                                if (checkBottom) {
                                    aboveRowEnd = lastItemOf(previousRow);
                                    for (let l = previousSiblings.length - 2; l >= 0; --l) {
                                        const aboveBefore = previousSiblings[l];
                                        if (aboveBefore.linear.bottom > aboveRowEnd.linear.bottom) {
                                            if (
                                                reverse &&
                                                Math.ceil(aboveBefore.linear[anchorEnd]) -
                                                    Math.floor(parent.box[anchorEnd]) <
                                                    chain.linear.width
                                            ) {
                                                continue;
                                            }
                                            chain.anchorDelete(anchorStart);
                                            chain.anchor(chainStart, aboveBefore.documentId, true);
                                            if (reverse) {
                                                chain.modifyBox(2 /* MARGIN_RIGHT */, aboveBefore.marginLeft);
                                            } else {
                                                chain.modifyBox(8 /* MARGIN_LEFT */, aboveBefore.marginRight);
                                            }
                                            rowStart.delete('app', 'layout_constraintHorizontal*');
                                            rowStart.anchorDelete(chainEnd);
                                            rowEnd.anchorDelete(anchorEnd);
                                            currentRowTop || (currentRowTop = chain);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (chain.pageFlow) {
                            if (!start) {
                                if (reverse) {
                                    chain.horizontalRowEnd = true;
                                } else {
                                    chain.horizontalRowStart = true;
                                }
                                start = true;
                            }
                            if (k === q - 1) {
                                if (reverse) {
                                    chain.horizontalRowStart = true;
                                } else {
                                    chain.horizontalRowEnd = true;
                                }
                            }
                        }
                        if (!tallest || chain.linear.height > tallest.linear.height) {
                            tallest = chain;
                        }
                    }
                }
                if (floating) {
                    previousSiblings = previousSiblings.concat(floatingLeft, floatingRight);
                }
                if (!alignParent) {
                    if (previousRow) {
                        const current = partition[0];
                        const q = previousRow.length;
                        const r = partition.length;
                        if (q === 1 && r === 1) {
                            const above = previousRow[0];
                            above.anchor('bottomTop', current.documentId);
                            current.anchor('topBottom', above.documentId);
                            current.app('layout_constraintVertical_bias', '0');
                        } else {
                            if (!aboveRowEnd || !currentRowTop) {
                                aboveRowEnd = previousRow[0];
                                for (let k = 1; k < q; ++k) {
                                    const item = previousRow[k];
                                    if (item.linear.bottom > aboveRowEnd.linear.bottom) {
                                        aboveRowEnd = item;
                                    }
                                }
                            }
                            if (!currentRowTop) {
                                currentRowTop = partition[0];
                                let currentTop = currentRowTop.linear.top;
                                for (let k = 1; k < r; ++k) {
                                    const item = partition[k];
                                    const top = item.linear.top;
                                    if (
                                        top < currentTop ||
                                        (top === currentTop && item.linear.height > currentRowTop.linear.height)
                                    ) {
                                        currentRowTop = item;
                                        currentTop = top;
                                    }
                                }
                            }
                            const documentId = currentRowTop.documentId;
                            aboveRowEnd.anchor('bottomTop', documentId);
                            currentRowTop.anchor('topBottom', aboveRowEnd.documentId);
                            setVerticalAlignment(currentRowTop, q === 1, true);
                            const marginTop = currentRowTop.marginTop;
                            for (let k = 0; k < r; ++k) {
                                const chain = partition[k];
                                if (chain !== currentRowTop) {
                                    setVerticalAlignment(chain, r === 1);
                                    chain.anchor('top', documentId);
                                    chain.modifyBox(1 /* MARGIN_TOP */, marginTop * -1);
                                }
                            }
                        }
                    }
                    previousRow = partition;
                }
            }
            node.horizontalRows = horizontal;
            if (checkPercent === -1) {
                node.setLayoutWidth('match_parent', false);
            }
        }
        applyGuideline(axis, options) {
            var _a, _b;
            const node = options.target;
            if (node.constraint[axis] || (options.orientation && axis !== options.orientation)) {
                return;
            }
            const { parent, percent, opposing } = options;
            let documentParent = node.documentParent;
            if (parent.nodeGroup && !documentParent.hasAlign(2 /* AUTO_LAYOUT */)) {
                documentParent = parent;
            }
            const horizontal = axis === 'horizontal';
            let LT, RB;
            if (horizontal) {
                if (!opposing) {
                    LT = 'left';
                    RB = 'right';
                } else {
                    LT = 'right';
                    RB = 'left';
                }
            } else if (!opposing) {
                LT = 'top';
                RB = 'bottom';
            } else {
                LT = 'bottom';
                RB = 'top';
            }
            const linear = node.linear;
            const box = documentParent.box;
            if (!percent && !opposing) {
                if (withinRange(linear[LT], box[LT])) {
                    node.anchor(LT, 'parent', true);
                    return;
                }
                if (!node.pageFlow && node.css('position') !== 'fixed' && !parent.hasAlign(2 /* AUTO_LAYOUT */)) {
                    const adjustBodyMargin = (item, position) => {
                        if (item.leftTopAxis) {
                            const absoluteParent = item.absoluteParent;
                            if (absoluteParent.documentBody) {
                                switch (position) {
                                    case 'top':
                                        return absoluteParent.getBox(1 /* MARGIN_TOP */)[0] === 0
                                            ? absoluteParent.marginTop
                                            : 0;
                                    case 'left':
                                        return absoluteParent.marginLeft;
                                }
                            }
                        }
                        return 0;
                    };
                    const canAlignPosition = item => {
                        if (!item.pageFlow) {
                            if (horizontal) {
                                if (item.has('right') && !item.has('left')) {
                                    return !node.has('left') && !node.has('right');
                                }
                            } else if (item.has('bottom') && !item.has('top')) {
                                return !node.has('top') && !node.has('bottom');
                            }
                        }
                        return true;
                    };
                    const setAlignedWidth = (sibling, position) => {
                        if (node.actualParent !== sibling.actualParent) {
                            switch (position) {
                                case 'top':
                                case 'bottom':
                                case 'topBottom':
                                case 'bottomTop':
                                    node.alignedWithY = sibling;
                                    break;
                                case 'left':
                                case 'right':
                                case 'leftRight':
                                case 'rightLeft':
                                    node.alignedWithX = sibling;
                                    break;
                            }
                        }
                    };
                    const bounds = node.innerMostWrapped.bounds;
                    const renderChildren = parent.renderChildren;
                    const length = renderChildren.length;
                    for (let i = 0; i < length; ++i) {
                        const item = renderChildren[i];
                        if (
                            item === node ||
                            item.plainText ||
                            item.pseudoElement ||
                            item.rootElement ||
                            !canAlignPosition(item)
                        ) {
                            continue;
                        }
                        const itemA = item.innerMostWrapped;
                        if (itemA.pageFlow || item.constraint[axis]) {
                            const { linear: linearA, bounds: boundsA } = itemA;
                            let offset = NaN,
                                position;
                            if (withinRange(bounds[LT], boundsA[LT])) {
                                position = LT;
                            } else if (withinRange(linear[LT], linearA[LT])) {
                                position = LT;
                                offset =
                                    (horizontal ? bounds.left - boundsA.left : bounds.top - boundsA.top) +
                                    adjustBodyMargin(node, LT);
                            } else if (withinRange(linear[LT], linearA[RB])) {
                                if (horizontal) {
                                    if (
                                        (!node.hasPX('left') && !node.hasPX('right')) ||
                                        (!item.inlineStatic && item.hasPX('width', { percent: false, initial: true }))
                                    ) {
                                        position = 'leftRight';
                                        offset = bounds.left - boundsA.right;
                                    }
                                } else if (
                                    (!node.hasPX('top') && !node.hasPX('bottom')) ||
                                    (!item.inlineStatic && item.hasPX('height', { percent: false, initial: true }))
                                ) {
                                    position = 'topBottom';
                                    if (node.top !== 0) {
                                        offset = bounds.top - boundsA.bottom;
                                    }
                                }
                            }
                            if (position) {
                                if (horizontal) {
                                    if (!isNaN(offset)) {
                                        node.setBox(8 /* MARGIN_LEFT */, { reset: 1, adjustment: 0 });
                                        if (offset !== 0) {
                                            node.translateX(offset);
                                        }
                                    }
                                } else if (!isNaN(offset)) {
                                    node.setBox(1 /* MARGIN_TOP */, { reset: 1, adjustment: 0 });
                                    if (offset !== 0) {
                                        node.translateY(offset);
                                    }
                                }
                                setAlignedWidth(item, position);
                                node.anchor(position, item.documentId, true);
                                node.constraint[axis] = true;
                                return;
                            }
                        }
                    }
                    const TL = horizontal ? 'top' : 'left';
                    const setAnchorOffset = (sibling, position, adjustment) => {
                        setAlignedWidth(sibling, position);
                        node.anchor(position, sibling.documentId, true);
                        node.setBox(horizontal ? 8 /* MARGIN_LEFT */ : 1 /* MARGIN_TOP */, { reset: 1, adjustment });
                        node.constraint[axis] = true;
                    };
                    let nearest, adjacent;
                    for (let i = 0; i < length; ++i) {
                        const item = renderChildren[i];
                        if (
                            item === node ||
                            item.pageFlow ||
                            item.rootElement ||
                            !item.constraint[axis] ||
                            !canAlignPosition(item)
                        ) {
                            continue;
                        }
                        const wrapped = item.innerMostWrapped;
                        const boundsA = wrapped.bounds;
                        if (withinRange(bounds[TL], boundsA[TL])) {
                            const offset = bounds[LT] - boundsA[RB];
                            if (offset >= 0) {
                                setAnchorOffset(item, horizontal ? 'leftRight' : 'topBottom', offset);
                                return;
                            }
                        } else if (boundsA[LT] <= bounds[LT]) {
                            if (boundsA[TL] <= bounds[TL]) {
                                nearest = wrapped;
                            } else {
                                adjacent = wrapped;
                            }
                        }
                    }
                    if (nearest || (nearest = adjacent)) {
                        const offset = bounds[LT] - nearest.bounds[LT] + adjustBodyMargin(node, LT);
                        if (offset >= 0) {
                            setAnchorOffset(nearest, LT, offset);
                            return;
                        }
                    }
                }
            }
            const absoluteParent = node.absoluteParent;
            const bounds = node.positionStatic ? node.bounds : linear;
            let location = 0,
                attr;
            if (!node.leftTopAxis && documentParent.rootElement) {
                const renderParent = node.renderParent;
                if (documentParent.ascend({ condition: item => item === renderParent, attr: 'renderParent' }).length) {
                    location = horizontal
                        ? documentParent[!opposing ? 'marginLeft' : 'marginRight']
                        : documentParent[!opposing ? 'marginTop' : 'marginBottom'];
                }
            }
            if (percent) {
                const position = Math.abs(bounds[LT] - box[LT]) / (horizontal ? box.width : box.height);
                attr = 'layout_constraintGuide_percent';
                location += parseFloat(
                    truncate$1(!opposing ? position : 1 - position, node.localSettings.floatPrecision)
                );
            } else {
                attr = 'layout_constraintGuide_begin';
                location += bounds[LT] - box[!opposing ? LT : RB];
            }
            if (!node.pageFlow) {
                if (documentParent.outerWrapper && node.parent === documentParent.outerMostWrapper) {
                    location +=
                        documentParent[
                            horizontal
                                ? !opposing
                                    ? 'paddingLeft'
                                    : 'paddingRight'
                                : !opposing
                                ? 'paddingTop'
                                : 'paddingBottom'
                        ];
                } else if (absoluteParent === node.documentParent) {
                    const direction = horizontal
                        ? !opposing
                            ? 128 /* PADDING_LEFT */
                            : 32 /* PADDING_RIGHT */
                        : !opposing
                        ? 16 /* PADDING_TOP */
                        : 64; /* PADDING_BOTTOM */
                    location = documentParent.adjustAbsolutePaddingOffset(direction, location);
                }
            } else if (node.inlineVertical) {
                const offset = node.verticalAlign;
                if (offset < 0) {
                    location += offset;
                }
            }
            if (!horizontal && node.marginTop < 0) {
                location -= node.marginTop;
                node.setBox(1 /* MARGIN_TOP */, { reset: 1 });
            }
            node.constraint[axis] = true;
            if (location <= 0) {
                node.anchor(LT, 'parent', true);
            } else if (
                (horizontal &&
                    location + bounds.width >= box.right &&
                    documentParent.hasPX('width') &&
                    !node.hasPX('right')) ||
                (!horizontal &&
                    location + bounds.height >= box.bottom &&
                    documentParent.hasPX('height') &&
                    !node.hasPX('bottom'))
            ) {
                node.anchor(RB, 'parent', true);
            } else {
                const guideline = parent.constraint.guideline || {};
                const anchors =
                    (_b = (_a = guideline[axis]) === null || _a === void 0 ? void 0 : _a[attr]) === null ||
                    _b === void 0
                        ? void 0
                        : _b[LT];
                if (anchors) {
                    for (const id in anchors) {
                        if (withinRange(parseFloat(anchors[id]), location)) {
                            node.anchor(LT, id, true);
                            node.anchorDelete(RB);
                            return;
                        }
                    }
                }
                const templateOptions = {
                    android: {
                        orientation: horizontal ? 'vertical' : 'horizontal',
                    },
                    app: {
                        [attr]: percent
                            ? location.toString()
                            : `@dimen/${Resource.insertStoredAsset(
                                  'dimens',
                                  'constraint_guideline_' + (!opposing ? LT : RB),
                                  formatPX$1(location)
                              )}`,
                    },
                };
                this.addAfterOutsideTemplate(
                    node,
                    this.renderNodeStatic(
                        {
                            controlName:
                                node.api < 29 /* Q */ ? CONTAINER_TAGNAME.GUIDELINE : CONTAINER_TAGNAME_X.GUIDELINE,
                        },
                        templateOptions
                    ),
                    false
                );
                const documentId = templateOptions.documentId;
                if (documentId) {
                    node.anchor(LT, documentId, true);
                    node.anchorDelete(RB);
                    if (location > 0) {
                        assignEmptyValue(guideline, axis, attr, LT, documentId, location.toString());
                        parent.constraint.guideline = guideline;
                    }
                }
            }
        }
        createLayoutGroup(layout) {
            return this.createNodeGroup(layout.node, layout.children, layout.parent);
        }
        get containerTypeHorizontal() {
            return {
                containerType: CONTAINER_NODE.RELATIVE,
                alignmentType: 4 /* HORIZONTAL */,
            };
        }
        get containerTypeVertical() {
            return {
                containerType: CONTAINER_NODE.CONSTRAINT,
                alignmentType: 8 /* VERTICAL */,
            };
        }
        get containerTypeVerticalMargin() {
            return {
                containerType: CONTAINER_NODE.FRAME,
                alignmentType: 128 /* COLUMN */,
            };
        }
        get containerTypePercent() {
            return {
                containerType: CONTAINER_NODE.CONSTRAINT,
                alignmentType: 16384 /* PERCENT */,
            };
        }
        get afterInsertNode() {
            return node => {
                node.localSettings = this._viewSettings;
                node.api = this._targetAPI;
            };
        }
        get userSettings() {
            return this.application.userSettings;
        }
        get screenDimension() {
            return this._screenDimension;
        }
    }

    var COLOR_TMPL = {
        'resources': {
            '>': {
                'color': {
                    '@': ['name'],
                    '~': true,
                },
            },
        },
    };

    var DIMEN_TMPL = {
        'resources': {
            '>': {
                'dimen': {
                    '@': ['name'],
                    '~': true,
                },
            },
        },
    };

    var FONTFAMILY_TMPL = {
        'font-family': {
            '@': ['xmlns:android'],
            '>': {
                'font': {
                    '^': 'android',
                    '@': ['font', 'fontStyle', 'fontWeight'],
                },
            },
        },
    };

    var STRING_TMPL = {
        'resources': {
            '>': {
                'string': {
                    '@': ['name'],
                    '~': true,
                },
            },
        },
    };

    var STRINGARRAY_TMPL = {
        'resources': {
            '>': {
                'string-array': {
                    '@': ['name'],
                    '>': {
                        'item': {
                            '~': true,
                        },
                    },
                },
            },
        },
    };

    var STYLE_TMPL = {
        'resources': {
            '>': {
                'style': {
                    '@': ['name', 'parent'],
                    '>': {
                        'item': {
                            '@': ['name'],
                            '~': true,
                        },
                    },
                },
            },
        },
    };

    const {
        fromLastIndexOf: fromLastIndexOf$2,
        parseMimeType: parseMimeType$1,
        plainMap: plainMap$1,
        splitPairStart,
    } = squared.lib.util;
    const STORED$1 = Resource.STORED;
    function getFileAssets(pathname, items) {
        const length = items.length;
        if (length) {
            const result = new Array(length / 3);
            for (let i = 0, j = 0; i < length; i += 3) {
                result[j++] = {
                    pathname: pathname + items[i + 1],
                    filename: items[i + 2],
                    content: items[i],
                };
            }
            return result;
        }
        return items;
    }
    function getImageAssets(pathname, items, convertExt, compressing) {
        const length = items.length;
        if (length) {
            const result = new Array(length / 3);
            for (let i = 0, j = 0; i < length; i += 3) {
                const filename = items[i + 2];
                let mimeType, compress;
                if (filename.endsWith('.unknown')) {
                    mimeType = 'image/unknown';
                    if (compressing) {
                        compress = [{ format: 'png' }];
                    }
                } else if (convertExt) {
                    const mimeTypeFrom = parseMimeType$1(filename);
                    if (mimeTypeFrom.startsWith('image/')) {
                        mimeType = '';
                        for (const value of convertExt
                            .trim()
                            .toLowerCase()
                            .split(/\s*:\s*/)) {
                            if (!mimeTypeFrom.endsWith(value)) {
                                const match = /^[a-z]+/.exec(value);
                                if (match) {
                                    const mimeTypeTo = parseMimeType$1(match[0]);
                                    if (mimeTypeTo.startsWith('image/')) {
                                        mimeType += value + ':';
                                        if (
                                            compressing &&
                                            !compress &&
                                            Resource.canCompressImage(filename, mimeTypeTo)
                                        ) {
                                            compress = [{ format: 'png' }];
                                        }
                                    }
                                }
                            }
                        }
                        if (mimeType !== '') {
                            mimeType += mimeTypeFrom;
                        }
                    }
                }
                result[j++] = {
                    pathname: pathname + items[i + 1],
                    filename,
                    mimeType,
                    compress,
                    uri: items[i],
                };
            }
            return result;
        }
        return items;
    }
    function getRawAssets(pathname, items) {
        const length = items.length;
        if (length) {
            const result = new Array(length / 3);
            for (let i = 0, j = 0; i < length; i += 3) {
                result[j++] = {
                    pathname,
                    filename: items[i + 2].toLowerCase(),
                    mimeType: items[i + 1],
                    uri: items[i],
                };
            }
            return result;
        }
        return items;
    }
    function getOutputDirectory(value) {
        value = value.replace(/\\/g, '/');
        return value + (!value.endsWith('/') ? '/' : '');
    }
    class File extends squared.base.File {
        copyTo(directory, options) {
            return this.copying(
                Object.assign(Object.assign({}, options), {
                    assets: this.combineAssets(options === null || options === void 0 ? void 0 : options.assets),
                    directory,
                })
            );
        }
        appendTo(pathname, options) {
            return this.archiving(
                Object.assign(Object.assign({ filename: this.userSettings.outputArchiveName }, options), {
                    assets: this.combineAssets(options === null || options === void 0 ? void 0 : options.assets),
                    appendTo: pathname,
                })
            );
        }
        saveAs(filename, options) {
            return this.archiving(
                Object.assign(Object.assign({}, options), {
                    assets: this.combineAssets(options === null || options === void 0 ? void 0 : options.assets),
                    filename,
                })
            );
        }
        resourceAllToXml(options) {
            const result = {
                string: this.resourceStringToXml(),
                stringArray: this.resourceStringArrayToXml(),
                font: this.resourceFontToXml(),
                color: this.resourceColorToXml(),
                style: this.resourceStyleToXml(),
                dimen: this.resourceDimenToXml(),
                drawable: this.resourceDrawableToXml(),
                anim: this.resourceAnimToXml(),
                drawableImage: this.resourceDrawableImageToString(),
                rawVideo: this.resourceRawVideoToString(),
                rawAudio: this.resourceRawAudioToString(),
            };
            for (const name in result) {
                if (result[name].length === 0) {
                    delete result[name];
                }
            }
            if (options && (options.directory || options.filename)) {
                const outputDirectory = getOutputDirectory(this.userSettings.outputDirectory);
                let assets = [];
                for (const name in result) {
                    switch (name) {
                        case 'drawableImage':
                            assets = assets.concat(
                                getImageAssets(
                                    outputDirectory,
                                    result[name],
                                    this.userSettings.convertImages,
                                    this.userSettings.compressImages
                                )
                            );
                            break;
                        case 'rawVideo':
                            assets = assets.concat(getRawAssets(outputDirectory + this.directory.video, result[name]));
                            break;
                        case 'rawAudio':
                            assets = assets.concat(getRawAssets(outputDirectory + this.directory.audio, result[name]));
                            break;
                        default:
                            assets = assets.concat(getFileAssets(outputDirectory, result[name]));
                            break;
                    }
                }
                options.assets = options.assets ? assets.concat(options.assets) : assets;
                if (options.directory) {
                    this.copying(options);
                }
                if (options.filename) {
                    this.archiving(options);
                }
            }
            return result;
        }
        resourceStringToXml(options) {
            const items = Array.from(STORED$1.strings.entries()).sort((a, b) =>
                a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1
            );
            const length = items.length;
            let j, itemArray;
            if (STORED$1.strings.has('app_name')) {
                j = 0;
                itemArray = new Array(length);
            } else {
                j = 1;
                itemArray = new Array(length + 1);
                itemArray[0] = {
                    name: 'app_name',
                    innerText: this.userSettings.manifestLabelAppName,
                };
            }
            for (let i = 0; i < length; ++i) {
                const item = items[i];
                itemArray[j++] = {
                    name: item[0],
                    innerText: item[1],
                };
            }
            return this.checkFileAssets(
                [
                    replaceTab(
                        applyTemplate('resources', STRING_TMPL, [{ string: itemArray }]),
                        this.userSettings.insertSpaces,
                        true
                    ),
                    this.directory.string,
                    'strings.xml',
                ],
                options
            );
        }
        resourceStringArrayToXml(options) {
            const length = STORED$1.arrays.size;
            if (length) {
                const items = Array.from(STORED$1.arrays.entries()).sort();
                const itemArray = new Array(length);
                for (let i = 0; i < length; ++i) {
                    const item = items[i];
                    itemArray[i] = { name: item[0], item: plainMap$1(item[1], innerText => ({ innerText })) };
                }
                return this.checkFileAssets(
                    [
                        replaceTab(
                            applyTemplate('resources', STRINGARRAY_TMPL, [{ 'string-array': itemArray }]),
                            this.userSettings.insertSpaces,
                            true
                        ),
                        this.directory.string,
                        'string_arrays.xml',
                    ],
                    options
                );
            }
            return [];
        }
        resourceFontToXml(options) {
            var _a;
            const length = STORED$1.fonts.size;
            if (length) {
                const resource = this.resource;
                const { insertSpaces, outputDirectory, targetAPI } = this.userSettings;
                const xmlns = XML_NAMESPACE[targetAPI < 26 /* OREO */ ? 'app' : 'android'];
                const directory = getOutputDirectory(outputDirectory);
                const pathname = this.directory.font;
                const items = Array.from(STORED$1.fonts.entries()).sort();
                const result = new Array(length * 3);
                for (let i = 0, j = 0; i < length; ++i) {
                    const [name, font] = items[i];
                    const itemArray = [];
                    for (const attr in font) {
                        const [fontFamily, fontStyle, fontWeight] = attr.split('|');
                        const fontName =
                            name +
                            (fontStyle === 'normal'
                                ? fontWeight === '400'
                                    ? '_normal'
                                    : '_' + font[attr]
                                : '_' + fontStyle + (fontWeight !== '400' ? font[attr] : ''));
                        itemArray.push({
                            font: `@font/${fontName}`,
                            fontStyle,
                            fontWeight,
                        });
                        const uri =
                            (_a = resource.getFont(fontFamily, fontStyle, fontWeight)) === null || _a === void 0
                                ? void 0
                                : _a.srcUrl;
                        if (uri) {
                            this.addAsset({
                                pathname: directory + pathname,
                                filename:
                                    fontName +
                                    '.' +
                                    (Resource.getExtension(splitPairStart(uri, '?')).toLowerCase() || 'ttf'),
                                uri,
                            });
                        }
                    }
                    const output = replaceTab(
                        applyTemplate('font-family', FONTFAMILY_TMPL, [{ 'xmlns:android': xmlns, font: itemArray }]),
                        insertSpaces
                    );
                    result[j++] = targetAPI < 26 /* OREO */ ? output.replace(/\s+android:/g, ' app:') : output;
                    result[j++] = pathname;
                    result[j++] = `${name}.xml`;
                }
                return this.checkFileAssets(result, options);
            }
            return [];
        }
        resourceColorToXml(options) {
            const length = STORED$1.colors.size;
            if (length) {
                const items = Array.from(STORED$1.colors.entries()).sort();
                const itemArray = new Array(length);
                for (let i = 0; i < length; ++i) {
                    const item = items[i];
                    itemArray[i] = {
                        name: item[1],
                        innerText: item[0],
                    };
                }
                return this.checkFileAssets(
                    [
                        replaceTab(
                            applyTemplate('resources', COLOR_TMPL, [{ color: itemArray }]),
                            this.userSettings.insertSpaces
                        ),
                        this.directory.string,
                        'colors.xml',
                    ],
                    options
                );
            }
            return [];
        }
        resourceStyleToXml(options) {
            const result = [];
            if (STORED$1.styles.size) {
                const itemArray = [];
                for (const style of Array.from(STORED$1.styles.values()).sort((a, b) =>
                    a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1
                )) {
                    itemArray.push({
                        name: style.name,
                        parent: style.parent,
                        item: plainMap$1(
                            style.items.sort((a, b) => (a.key >= b.key ? 1 : -1)),
                            obj => ({ name: obj.key, innerText: obj.value })
                        ),
                    });
                }
                result.push(
                    replaceTab(
                        applyTemplate('resources', STYLE_TMPL, [{ style: itemArray }]),
                        this.userSettings.insertSpaces
                    ),
                    this.directory.string,
                    'styles.xml'
                );
            }
            if (STORED$1.themes.size) {
                const { convertPixels, insertSpaces, manifestThemeName } = this.userSettings;
                const dpUnit = convertPixels === 'dp';
                const appTheme = {};
                for (const data of STORED$1.themes) {
                    const filename = data[0];
                    const match = /^(.+)\/(.+?\.\w+)$/.exec(filename);
                    if (match) {
                        const itemArray = [];
                        for (const [themeName, themeData] of data[1]) {
                            if (!appTheme[filename] || themeName !== manifestThemeName) {
                                const themeArray = [];
                                const items = themeData.items;
                                for (const name in items) {
                                    themeArray.push({ name, innerText: items[name] });
                                }
                                itemArray.push({
                                    name: themeName,
                                    parent: themeData.parent,
                                    item: themeArray,
                                });
                            }
                            if (themeName === manifestThemeName) {
                                appTheme[filename] = true;
                            }
                        }
                        if (itemArray.length) {
                            const value = applyTemplate('resources', STYLE_TMPL, [{ style: itemArray }]);
                            result.push(
                                replaceTab(
                                    dpUnit
                                        ? value.replace(/>(-?[\d.]+)px</g, (found, ...capture) => `>${capture[0]}dp<`)
                                        : value,
                                    insertSpaces
                                ),
                                match[1],
                                match[2]
                            );
                        }
                    }
                }
            }
            return this.checkFileAssets(result, options);
        }
        resourceDimenToXml(options) {
            const length = STORED$1.dimens.size;
            if (length) {
                const convertPixels = this.userSettings.convertPixels === 'dp';
                const items = Array.from(STORED$1.dimens.entries()).sort();
                const itemArray = new Array(length);
                for (let i = 0; i < length; ++i) {
                    const item = items[i];
                    itemArray[i] = {
                        name: item[0],
                        innerText: convertPixels ? item[1].replace(/px$/, 'dp') : item[1],
                    };
                }
                return this.checkFileAssets(
                    [
                        replaceTab(applyTemplate('resources', DIMEN_TMPL, [{ dimen: itemArray }])),
                        this.directory.string,
                        'dimens.xml',
                    ],
                    options
                );
            }
            return [];
        }
        resourceDrawableToXml(options) {
            const length = STORED$1.drawables.size;
            if (length) {
                const userSettings = this.userSettings;
                const insertSpaces = userSettings.insertSpaces;
                const convertPixels = userSettings.convertPixels === 'dp';
                const directory = this.directory.image;
                const result = new Array(length * 3);
                let i = 0;
                for (const data of STORED$1.drawables) {
                    result[i++] = replaceTab(
                        convertPixels
                            ? data[1].replace(/"(-?[\d.]+)px"/g, (match, ...capture) => `"${capture[0]}dp"`)
                            : data[1],
                        insertSpaces
                    );
                    result[i++] = directory;
                    result[i++] = `${data[0]}.xml`;
                }
                return this.checkFileAssets(result, options);
            }
            return [];
        }
        resourceAnimToXml(options) {
            const length = STORED$1.animators.size;
            if (length) {
                const insertSpaces = this.userSettings.insertSpaces;
                const result = new Array(length * 3);
                let i = 0;
                for (const data of STORED$1.animators) {
                    result[i++] = replaceTab(data[1], insertSpaces);
                    result[i++] = 'res/anim';
                    result[i++] = `${data[0]}.xml`;
                }
                return this.checkFileAssets(result, options);
            }
            return [];
        }
        resourceDrawableImageToString(options) {
            if (STORED$1.images.size) {
                const imageDirectory = this.directory.image;
                const result = [];
                for (const data of STORED$1.images) {
                    const images = data[1];
                    if (Object.keys(images).length > 1) {
                        for (const dpi in images) {
                            const value = images[dpi];
                            result.push(
                                value,
                                imageDirectory + '-' + dpi,
                                data[0] + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown')
                            );
                        }
                    } else {
                        const value = images.mdpi;
                        if (value) {
                            result.push(
                                value,
                                imageDirectory,
                                data[0] + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown')
                            );
                        }
                    }
                }
                if (options && (options.directory || options.filename)) {
                    const assets = getImageAssets(
                        getOutputDirectory(this.userSettings.outputDirectory),
                        result,
                        this.userSettings.convertImages,
                        this.userSettings.compressImages
                    );
                    options.assets = options.assets ? assets.concat(options.assets) : assets;
                    if (options.directory) {
                        this.copying(options);
                    }
                    if (options.filename) {
                        this.archiving(options);
                    }
                }
                return result;
            }
            return [];
        }
        resourceRawVideoToString(options) {
            return this.resourceRawToString('video', options);
        }
        resourceRawAudioToString(options) {
            return this.resourceRawToString('audio', options);
        }
        layoutAllToXml(layouts, options) {
            const actionable = options && (options.directory || options.filename);
            const result = {};
            const assets = [];
            for (let i = 0, length = layouts.length; i < length; ++i) {
                const { content, filename, pathname } = layouts[i];
                result[filename] = [content];
                if (actionable) {
                    assets.push({
                        pathname,
                        filename: i === 0 ? this.userSettings.outputMainFileName : `${filename}.xml`,
                        content,
                    });
                }
            }
            if (actionable) {
                options.assets = options.assets ? assets.concat(options.assets) : assets;
                if (options.directory) {
                    this.copying(options);
                }
                if (options.filename) {
                    this.archiving(options);
                }
            }
            return result;
        }
        combineAssets(assets) {
            const userSettings = this.userSettings;
            let result = [];
            if (assets) {
                for (let i = 0, length = assets.length, first = true; i < length; ++i) {
                    const item = assets[i];
                    if (!item.uri) {
                        if (first) {
                            item.filename = userSettings.outputMainFileName;
                            first = false;
                        } else {
                            const filename = item.filename;
                            if (!filename.endsWith('.xml')) {
                                item.filename = `${filename}.xml`;
                            }
                        }
                    }
                }
                result = result.concat(assets);
            }
            const outputDirectory = getOutputDirectory(userSettings.outputDirectory);
            return result.concat(
                getFileAssets(outputDirectory, this.resourceStringToXml()),
                getFileAssets(outputDirectory, this.resourceStringArrayToXml()),
                getFileAssets(outputDirectory, this.resourceFontToXml()),
                getFileAssets(outputDirectory, this.resourceColorToXml()),
                getFileAssets(outputDirectory, this.resourceDimenToXml()),
                getFileAssets(outputDirectory, this.resourceStyleToXml()),
                getFileAssets(outputDirectory, this.resourceDrawableToXml()),
                getImageAssets(
                    outputDirectory,
                    this.resourceDrawableImageToString(),
                    userSettings.convertImages,
                    userSettings.compressImages
                ),
                getFileAssets(outputDirectory, this.resourceAnimToXml()),
                getRawAssets(outputDirectory + this.directory.video, this.resourceRawVideoToString()),
                getRawAssets(outputDirectory + this.directory.audio, this.resourceRawAudioToString())
            );
        }
        checkFileAssets(content, options) {
            if (options) {
                if (options.directory || options.filename) {
                    const assets = getFileAssets(getOutputDirectory(this.userSettings.outputDirectory), content);
                    options.assets = options.assets ? assets.concat(options.assets) : assets;
                    if (options.directory) {
                        this.copying(options);
                    }
                    if (options.filename) {
                        this.archiving(options);
                    }
                }
            }
            return content;
        }
        resourceRawToString(name, options) {
            const length = Resource.ASSETS[name].size;
            if (length) {
                const result = new Array(length * 3);
                let i = 0;
                for (const item of Resource.ASSETS[name].values()) {
                    const uri = item.uri;
                    result[i++] = uri;
                    result[i++] = item.mimeType || '';
                    result[i++] = fromLastIndexOf$2(uri, '/', '\\');
                }
                if (options && (options.directory || options.filename)) {
                    const assets = getRawAssets(
                        getOutputDirectory(this.userSettings.outputDirectory) + this.directory[name],
                        result
                    );
                    options.assets = options.assets ? assets.concat(options.assets) : assets;
                    if (options.directory) {
                        this.copying(options);
                    }
                    if (options.filename) {
                        this.archiving(options);
                    }
                }
                return result;
            }
            return [];
        }
        get userSettings() {
            return this.resource.userSettings;
        }
        get directory() {
            return this.resource.controllerSettings.directory;
        }
    }

    const { NODE_PROCEDURE: NODE_PROCEDURE$2, NODE_RESOURCE: NODE_RESOURCE$1 } = squared.base.lib.constant;
    const { formatPX: formatPX$2 } = squared.lib.css;
    class Accessibility extends squared.base.extensions.Accessibility {
        constructor() {
            super(...arguments);
            this.options = {
                displayLabel: false,
            };
            this.eventOnly = true;
        }
        beforeBaseLayout(sessionId) {
            const cache = this.application.getProcessingCache(sessionId);
            cache.each(node => {
                if (node.inputElement && node.hasProcedure(NODE_PROCEDURE$2.ACCESSIBILITY)) {
                    const describedby = node.attributes['aria-describedby'];
                    if (describedby) {
                        const sibling = cache.find(item => item.elementId === describedby);
                        if (sibling) {
                            const value = sibling.textContent.trim();
                            if (value !== '') {
                                node.data(Resource.KEY_NAME, 'titleString', value);
                            }
                        }
                    }
                    switch (node.containerName) {
                        case 'INPUT_RADIO':
                        case 'INPUT_CHECKBOX': {
                            if (!node.rightAligned && !node.centerAligned) {
                                const id = node.elementId;
                                [node.nextSibling, node.previousSibling].some(sibling => {
                                    if (
                                        sibling &&
                                        sibling.pageFlow &&
                                        !sibling.visibleStyle.backgroundImage &&
                                        sibling.visible
                                    ) {
                                        let valid;
                                        if (id && id === sibling.toElementString('htmlFor')) {
                                            valid = true;
                                        } else if (sibling.textElement) {
                                            const parent = sibling.actualParent;
                                            if (parent.tagName === 'LABEL') {
                                                parent.renderAs = node;
                                                valid = true;
                                            } else if (sibling.plainText) {
                                                valid = true;
                                            }
                                        }
                                        if (valid) {
                                            sibling.labelFor = node;
                                            if (!this.options.displayLabel) {
                                                sibling.hide();
                                            }
                                            return true;
                                        }
                                    }
                                    return false;
                                });
                            }
                            break;
                        }
                        case 'INPUT_IMAGE':
                            if (node.hasResource(NODE_RESOURCE$1.IMAGE_SOURCE)) {
                                node.data(Resource.KEY_NAME, 'boxImage', [node]);
                            }
                            break;
                        case 'BUTTON':
                            if (!node.isEmpty()) {
                                let { width, height } = node.bounds,
                                    modified;
                                node.cascade(item => {
                                    if (item.width >= width && item.height >= height) {
                                        ({ width, height } = item);
                                        node.inherit(item, 'boxStyle');
                                        modified = true;
                                    }
                                });
                                if (modified) {
                                    node.css('minWidth', formatPX$2(width));
                                    node.css('minHeight', formatPX$2(height));
                                }
                                const boxImage = node.removeIf(item => !item.textElement);
                                if (boxImage.length && node.hasResource(NODE_RESOURCE$1.IMAGE_SOURCE)) {
                                    node.data(Resource.KEY_NAME, 'boxImage', boxImage);
                                }
                                node.clear();
                            }
                            break;
                    }
                }
            });
        }
    }

    const {
        APP_SECTION: APP_SECTION$1,
        NODE_PROCEDURE: NODE_PROCEDURE$3,
        NODE_RESOURCE: NODE_RESOURCE$2,
    } = squared.base.lib.constant;
    const { formatPX: formatPX$3 } = squared.lib.css;
    const { createElement } = squared.lib.dom;
    const { truncate: truncate$2 } = squared.lib.math;
    class Column extends squared.base.extensions.Column {
        processNode(node, parent) {
            super.processNode(node, parent);
            node.containerType = CONTAINER_NODE.CONSTRAINT;
            node.addAlign(2 /* AUTO_LAYOUT */);
            node.addAlign(128 /* COLUMN */);
            return {
                complete: true,
                subscribe: true,
            };
        }
        postBaseLayout(node) {
            const mainData = this.data.get(node);
            if (mainData) {
                const application = this.application;
                const {
                    columnCount,
                    columnGap,
                    columnWidth,
                    columnRule,
                    columnSized,
                    boxWidth,
                    rows,
                    multiline,
                } = mainData;
                const { borderLeftWidth, borderLeftColor, borderLeftStyle } = columnRule;
                let borderWidth;
                switch (borderLeftWidth) {
                    case 'thin':
                        borderWidth = 1;
                        break;
                    case 'medium':
                        borderWidth = 3;
                        break;
                    case 'thick':
                        borderWidth = 5;
                        break;
                    default:
                        borderWidth = node.parseWidth(borderLeftWidth);
                        break;
                }
                const borderVisible = borderLeftStyle !== 'none' && borderWidth > 0;
                const createColumnRule = () => {
                    const rule = application.createNode(node.sessionId, { parent: node, append: true });
                    rule.containerName = node.containerName + '_COLUMNRULE';
                    rule.inherit(node, 'base');
                    rule.setControlType(CONTAINER_TAGNAME.LINE, CONTAINER_NODE.LINE);
                    rule.exclude({ resource: NODE_RESOURCE$2.ASSET, procedure: NODE_PROCEDURE$3.ALL });
                    let width;
                    if (borderVisible) {
                        width = formatPX$3(borderWidth);
                        rule.cssApply({
                            width,
                            paddingLeft: width,
                            borderLeftStyle,
                            borderLeftWidth,
                            borderLeftColor,
                            lineHeight: 'initial',
                            boxSizing: 'border-box',
                            display: 'inline-block',
                        });
                    } else {
                        width = formatPX$3(columnGap);
                        rule.cssApply({ width, lineHeight: 'initial', display: 'inline-block' });
                    }
                    rule.saveAsInitial();
                    rule.setLayoutWidth(width);
                    rule.setLayoutHeight('0px');
                    rule.render(node);
                    rule.positioned = true;
                    rule.renderExclude = false;
                    application.addLayoutTemplate(node, rule, {
                        type: 1 /* XML */,
                        node: rule,
                        controlName: rule.controlName,
                    });
                    return rule;
                };
                let previousRow;
                for (let i = 0, length = rows.length; i < length; ++i) {
                    const row = rows[i];
                    const q = row.length;
                    if (q === 1) {
                        const item = row[0];
                        if (i === 0) {
                            item.anchor('top', 'parent');
                            item.anchorStyle('vertical', 0, 'packed');
                        } else {
                            previousRow.anchor('bottomTop', item.documentId);
                            item.anchor('topBottom', previousRow.documentId);
                        }
                        if (i === length - 1) {
                            item.anchor('bottom', 'parent');
                        } else {
                            previousRow = row[0];
                        }
                        if (!item.isEmpty()) {
                            item.box.width = Math.max(boxWidth, item.box.width);
                        }
                        item.anchorParent('horizontal', item.centerAligned ? 0.5 : item.rightAligned ? 1 : 0);
                        item.anchored = true;
                        item.positioned = true;
                    } else {
                        const columns = [];
                        let columnMin = Math.min(q, columnSized, columnCount || Infinity),
                            percentGap = 0;
                        if (columnMin > 1) {
                            const maxHeight = Math.floor(row.reduce((a, b) => a + b.bounds.height, 0) / columnMin);
                            let perRowCount = q >= columnMin ? Math.ceil(q / columnMin) : 1,
                                rowReduce =
                                    multiline ||
                                    (perRowCount > 1 &&
                                        (q % perRowCount !== 0 ||
                                            (!isNaN(columnCount) && (perRowCount * columnCount) % q > 1))),
                                excessCount = rowReduce && q % columnMin !== 0 ? q - columnMin : Infinity;
                            for (let j = 0, k = 0, l = 0; j < q; ++j, ++l) {
                                const item = row[j];
                                const iteration = l % perRowCount === 0;
                                if (
                                    k < columnMin - 1 &&
                                    (iteration ||
                                        excessCount <= 0 ||
                                        (j &&
                                            !item.contentAltered &&
                                            (row[j - 1].bounds.height >= maxHeight ||
                                                (columns[k].length &&
                                                    j < q - 2 &&
                                                    q - j + 1 === columnMin - k &&
                                                    row[j - 1].bounds.height > row[j + 1].bounds.height))))
                                ) {
                                    if (j > 0) {
                                        ++k;
                                        if (iteration) {
                                            --excessCount;
                                        } else {
                                            ++excessCount;
                                        }
                                    }
                                    l = 0;
                                    if (!iteration && excessCount > 0) {
                                        rowReduce = true;
                                    }
                                }
                                const column = columns[k] || (columns[k] = []);
                                column.push(item);
                                if (j > 0 && /^H\d/.test(item.tagName)) {
                                    if (column.length === 1 && j === q - 2) {
                                        --columnMin;
                                        excessCount = 0;
                                    } else if (
                                        (l + 1) % perRowCount === 0 &&
                                        q - j > columnMin &&
                                        !row[j + 1].multiline &&
                                        row[j + 1].bounds.height < maxHeight
                                    ) {
                                        column.push(row[++j]);
                                        l = -1;
                                    }
                                } else if (rowReduce && q - j === columnMin - k && excessCount !== Infinity) {
                                    perRowCount = 1;
                                }
                            }
                            percentGap =
                                columnMin > 1
                                    ? Math.max((columnGap * (columnMin - 1)) / boxWidth / columnMin, 0.01)
                                    : 0;
                        } else {
                            columns.push(row);
                        }
                        const r = columns.length;
                        const above = new Array(r);
                        for (let j = 0; j < r; ++j) {
                            const data = columns[j];
                            for (let k = 0, s = data.length; k < s; ++k) {
                                const item = data[k];
                                const percent = 1 / columnMin - percentGap;
                                item.app(
                                    'layout_constraintWidth_percent',
                                    truncate$2(percent, node.localSettings.floatPrecision)
                                );
                                item.setLayoutWidth('0px');
                                item.setBox(2 /* MARGIN_RIGHT */, { reset: 1 });
                                item.exclude({ section: APP_SECTION$1.EXTENSION });
                                item.box.width = percent * boxWidth;
                                item.anchored = true;
                                item.positioned = true;
                            }
                            above[j] = data[0];
                        }
                        for (let j = 0; j < r; ++j) {
                            const items = columns[j];
                            if (j < r - 1 && items.length > 1) {
                                const columnEnd = items[items.length - 1];
                                if (/^H\d/.test(columnEnd.tagName)) {
                                    --items.length;
                                    above[j + 1] = columnEnd;
                                    columns[j + 1].unshift(columnEnd);
                                }
                            }
                        }
                        const columnHeight = new Array(r);
                        for (let j = 0; j < r; ++j) {
                            const seg = columns[j];
                            const elements = [];
                            let height = 0;
                            for (let k = 0, s = seg.length; k < s; ++k) {
                                const column = seg[k];
                                if (column.naturalChild) {
                                    const element = column.element.cloneNode(true);
                                    if (column.styleElement) {
                                        const style = element.style;
                                        if (
                                            column.imageContainer ||
                                            column.find(item => item.imageContainer, { cascade: true })
                                        ) {
                                            style.height = formatPX$3(column.bounds.height);
                                        } else {
                                            const textStyle = column.textStyle;
                                            style.fontSize = column.fontSize + 'px';
                                            for (const attr in textStyle) {
                                                style[attr] = textStyle[attr];
                                            }
                                        }
                                    }
                                    elements.push(element);
                                } else {
                                    height += column.linear.height;
                                }
                            }
                            const s = elements.length;
                            if (s) {
                                const container = createElement('div', {
                                    parent: document.body,
                                    style: {
                                        width: formatPX$3(columnWidth || node.box.width / columnMin),
                                        visibility: 'hidden',
                                    },
                                });
                                for (let k = 0; k < s; ++k) {
                                    container.appendChild(elements[k]);
                                }
                                height += container.getBoundingClientRect().height;
                                document.body.removeChild(container);
                            }
                            columnHeight[j] = height;
                        }
                        let anchorTop,
                            anchorBottom,
                            maxHeight = 0;
                        for (let j = 0; j < r; ++j) {
                            const value = columnHeight[j];
                            if (value >= maxHeight) {
                                const column = columns[j];
                                anchorTop = column[0];
                                anchorBottom = column[column.length - 1];
                                maxHeight = value;
                            }
                        }
                        for (let j = 0; j < r; ++j) {
                            const item = above[j];
                            if (j === 0) {
                                item.anchor('left', 'parent');
                                item.anchorStyle('horizontal', 0, 'packed');
                            } else {
                                const previous = above[j - 1];
                                item.anchor('leftRight', previous.documentId);
                                item.modifyBox(8 /* MARGIN_LEFT */, columnGap);
                            }
                            if (j === r - 1) {
                                item.anchor('right', 'parent');
                            } else {
                                item.anchor('rightLeft', above[j + 1].documentId);
                            }
                        }
                        const rules = [];
                        for (let j = 0; j < r; ++j) {
                            const seg = columns[j];
                            for (let k = 0, s = seg.length; k < s; ++k) {
                                const item = seg[k];
                                if (k === 0) {
                                    if (j > 0) {
                                        const rule = createColumnRule();
                                        rule.anchor('top', anchorTop.documentId);
                                        rule.anchor('left', columns[j - 1][0].documentId);
                                        rule.anchor('right', item.documentId);
                                        rules.push(rule);
                                    }
                                    if (i === 0) {
                                        item.anchor('top', 'parent');
                                    } else if (item !== anchorTop) {
                                        item.anchor('top', anchorTop.documentId);
                                    } else {
                                        previousRow.anchor('bottomTop', item.documentId);
                                        item.anchor('topBottom', previousRow.documentId);
                                    }
                                    item.anchorStyle('vertical', 0, 'packed');
                                    item.setBox(1 /* MARGIN_TOP */, { reset: 1 });
                                } else {
                                    const previous = seg[k - 1];
                                    previous.anchor('bottomTop', item.documentId);
                                    item.anchor('topBottom', previous.documentId);
                                    item.app('layout_constraintVertical_bias', '0');
                                    item.anchor('left', seg[0].documentId);
                                }
                                if (k === s - 1) {
                                    if (i === length - 1) {
                                        item.anchor('bottom', 'parent');
                                    }
                                    item.setBox(4 /* MARGIN_BOTTOM */, { reset: 1 });
                                }
                            }
                        }
                        const documentId = i < length - 1 ? anchorBottom.documentId : 'parent';
                        for (let j = 0, s = rules.length; j < s; ++j) {
                            rules[j].anchor('bottom', documentId);
                        }
                        previousRow = anchorBottom;
                    }
                }
            }
        }
    }

    var LayoutUI = squared.base.LayoutUI;
    const { NODE_PROCEDURE: NODE_PROCEDURE$4, NODE_RESOURCE: NODE_RESOURCE$3 } = squared.base.lib.constant;
    const { formatPercent, formatPX: formatPX$4, isLength: isLength$1, isPercent: isPercent$1 } = squared.lib.css;
    const { truncate: truncate$3 } = squared.lib.math;
    const { flatArray } = squared.lib.util;
    const REGEXP_ALIGNSELF = /start|end|center|baseline/;
    const REGEXP_JUSTIFYSELF = /start|center|end|baseline|right|left/;
    function getRowData(mainData, horizontal) {
        const rowData = mainData.rowData;
        if (horizontal) {
            const length = mainData.column.length;
            const result = new Array(length);
            for (let i = 0, q = mainData.row.length; i < length; ++i) {
                const data = new Array(q);
                for (let j = 0; j < q; ++j) {
                    data[j] = rowData[j][i];
                }
                result[i] = data;
            }
            return result;
        }
        return rowData;
    }
    function getRemainingSize(mainData, data, node, dimension, maxScreenWidth, maxScreenHeight) {
        const unit = data.unit;
        const length = unit.length;
        let value = 0;
        if (length) {
            for (let i = 0; i < length; ++i) {
                const unitPX = unit[i];
                if (unitPX.endsWith('px')) {
                    value += parseFloat(unitPX);
                } else {
                    const rowData = mainData.rowData[i];
                    let size = 0;
                    for (let j = 0, q = rowData.length; j < q; ++j) {
                        const item = rowData[j];
                        if (item) {
                            size = Math.min(size, ...item.map(child => child.bounds[dimension]));
                        }
                    }
                    value += size;
                }
            }
        } else {
            value = Math.max(...data.unitTotal);
            if (value <= 0) {
                return 0;
            }
        }
        value += data.gap * (data.length - 1);
        if (dimension === 'width') {
            value += node.contentBox ? node.borderLeftWidth + node.borderRightWidth : node.contentBoxWidth;
            return (maxScreenWidth > value ? Math.min(maxScreenWidth, node.actualWidth) : node.actualWidth) - value;
        } else {
            value += node.contentBox ? node.borderTopWidth + node.borderBottomWidth : node.contentBoxHeight;
            return (
                (maxScreenHeight > value && node.documentBody
                    ? Math.min(maxScreenHeight, node.actualHeight)
                    : node.actualHeight) - value
            );
        }
    }
    function getMarginSize(value, gridSize) {
        const size = Math.floor(gridSize / value);
        return [size, gridSize - size * value];
    }
    function setContentSpacing(mainData, data, node, horizontal, maxScreenWidth, maxScreenHeight) {
        let alignment, dimension, MARGIN_START, MARGIN_END;
        if (horizontal) {
            alignment = mainData.justifyContent;
            dimension = 'width';
            MARGIN_START = 8 /* MARGIN_LEFT */;
            MARGIN_END = 2 /* MARGIN_RIGHT */;
        } else {
            alignment = mainData.alignContent;
            dimension = 'height';
            MARGIN_START = 1 /* MARGIN_TOP */;
            MARGIN_END = 4 /* MARGIN_BOTTOM */;
        }
        if (alignment.startsWith('space')) {
            const offset = getRemainingSize(mainData, data, node, dimension, maxScreenWidth, maxScreenHeight);
            if (offset > 0) {
                const rowData = getRowData(mainData, horizontal);
                const itemCount = data.length;
                const adjusted = new WeakSet();
                switch (alignment) {
                    case 'space-around': {
                        const [marginSize, marginExcess] = getMarginSize(itemCount * 2, offset);
                        for (let i = 0; i < itemCount; ++i) {
                            for (const item of new Set(flatArray(rowData[i], Infinity))) {
                                const marginStart = (i > 0 && i <= marginExcess ? 1 : 0) + marginSize;
                                if (!adjusted.has(item)) {
                                    item.modifyBox(MARGIN_START, marginStart);
                                    item.modifyBox(MARGIN_END, marginSize);
                                    adjusted.add(item);
                                } else {
                                    item.cssPX(dimension, offset / itemCount, true);
                                }
                            }
                        }
                        break;
                    }
                    case 'space-between':
                        if (itemCount > 1) {
                            const [marginSize, marginExcess] = getMarginSize(itemCount - 1, offset);
                            for (let i = 0; i < itemCount; ++i) {
                                for (const item of new Set(flatArray(rowData[i], Infinity))) {
                                    if (i < itemCount - 1) {
                                        const marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                                        if (!adjusted.has(item)) {
                                            item.modifyBox(MARGIN_END, marginEnd);
                                            adjusted.add(item);
                                        } else {
                                            item.cssPX(dimension, marginEnd, true);
                                        }
                                    } else {
                                        const unitSpan = parseInt(
                                            item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan')
                                        );
                                        if (unitSpan > 1) {
                                            const marginEnd =
                                                marginSize + (marginExcess > 0 ? Math.max(marginExcess - 1, 1) : 0);
                                            item.cssPX(dimension, marginEnd, true);
                                            if (adjusted.has(item)) {
                                                item.modifyBox(MARGIN_END, marginEnd * -1, false);
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            return;
                        }
                        break;
                    case 'space-evenly': {
                        const [marginSize, marginExcess] = getMarginSize(itemCount + 1, offset);
                        const wrapped = mainData.unsetContentBox;
                        for (let i = 0; i < itemCount; ++i) {
                            for (const item of new Set(flatArray(rowData[i], Infinity))) {
                                let marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                                if (!adjusted.has(item)) {
                                    if (wrapped) {
                                        marginEnd /= 2;
                                        item.modifyBox(MARGIN_START, marginEnd);
                                        item.modifyBox(MARGIN_END, marginEnd);
                                    } else {
                                        if (i === 0) {
                                            item.modifyBox(MARGIN_START, marginSize);
                                        }
                                        item.modifyBox(MARGIN_END, marginEnd);
                                    }
                                    adjusted.add(item);
                                } else {
                                    item.cssPX(dimension, marginEnd, true);
                                }
                            }
                        }
                        break;
                    }
                }
            }
        } else if (!mainData.unsetContentBox) {
            let offset = getRemainingSize(mainData, data, node, dimension, maxScreenWidth, maxScreenHeight);
            if (offset > 0) {
                switch (alignment) {
                    case 'center':
                        offset /= 2;
                        if (horizontal) {
                            node.modifyBox(128 /* PADDING_LEFT */, Math.floor(offset));
                        } else {
                            node.modifyBox(16 /* PADDING_TOP */, Math.floor(offset));
                            node.modifyBox(64 /* PADDING_BOTTOM */, Math.ceil(offset));
                        }
                        break;
                    case 'right':
                        if (!horizontal) {
                            break;
                        }
                    case 'end':
                    case 'flex-end':
                        node.modifyBox(horizontal ? 128 /* PADDING_LEFT */ : 16 /* PADDING_TOP */, offset);
                        break;
                }
            }
        }
    }
    function getCellDimensions(node, horizontal, section, insideGap) {
        let width, height, columnWeight, rowWeight;
        if (section.every(value => value.endsWith('px'))) {
            const px = section.reduce((a, b) => a + parseFloat(b), insideGap);
            const dimension = formatPX$4(px);
            if (horizontal) {
                width = dimension;
            } else {
                height = dimension;
            }
        } else if (section.every(value => value.endsWith('fr'))) {
            const fr = section.reduce((a, b) => a + parseFloat(b), 0);
            const weight = truncate$3(fr, node.localSettings.floatPrecision);
            if (horizontal) {
                width = '0px';
                columnWeight = weight;
            } else {
                height = '0px';
                rowWeight = weight;
            }
        } else if (section.every(value => isPercent$1(value))) {
            const percent = formatPercent(
                (section.reduce((a, b) => a + parseFloat(b), 0) +
                    insideGap / (horizontal ? node.actualWidth : node.actualHeight)) /
                    100
            );
            if (horizontal) {
                width = percent;
            } else {
                height = percent;
            }
        } else if (horizontal) {
            width = 'wrap_content';
        } else {
            height = 'wrap_content';
        }
        return [width, height, columnWeight, rowWeight];
    }
    function checkAutoDimension(data, horizontal) {
        const unit = data.unit;
        if (unit.length && unit.every(value => value === 'auto')) {
            data.unit = new Array(length).fill(horizontal ? '1fr' : '');
        }
    }
    function requireDirectionSpacer(data, dimension) {
        const unit = data.unit;
        let size = 0,
            percent = 0;
        for (let i = 0, length = unit.length; i < length; ++i) {
            const value = unit[i];
            if (value.endsWith('px')) {
                size += parseFloat(value);
            } else if (isPercent$1(value)) {
                percent += parseFloat(value);
            } else if (value.endsWith('fr')) {
                return 0;
            }
        }
        const content = Math.ceil(size + (data.length - 1) * data.gap);
        if (percent) {
            return percent + (content / dimension) * 100;
        } else if (size) {
            return content < dimension ? -1 : 0;
        }
        return 0;
    }
    function applyLayout(node, parent, item, mainData, cellData, dimension) {
        const horizontal = dimension === 'width';
        const { column, row } = mainData;
        let data, cellStart, cellSpan, minDimension;
        if (horizontal) {
            data = column;
            cellStart = cellData.columnStart;
            cellSpan = cellData.columnSpan;
            minDimension = 'minWidth';
        } else {
            data = row;
            cellStart = cellData.rowStart;
            cellSpan = cellData.rowSpan;
            minDimension = 'minHeight';
        }
        const { unit, unitMin } = data;
        let size = 0,
            minSize = 0,
            minUnitSize = 0,
            sizeWeight = 0,
            fitContent,
            autoSize;
        for (let i = 0, j = 0; i < cellSpan; ++i) {
            const k = cellStart + i;
            const min = unitMin[k];
            if (min) {
                minUnitSize += horizontal ? parent.parseUnit(min) : parent.parseUnit(min, { dimension: 'height' });
            }
            let value = unit[k];
            if (!value) {
                const auto = data.auto;
                if (auto[j]) {
                    value = auto[j];
                    if (auto[j + 1]) {
                        ++j;
                    }
                } else {
                    continue;
                }
            }
            if (value === 'auto' || value === 'max-content') {
                autoSize = true;
                if (
                    cellSpan < unit.length &&
                    (!parent.hasPX(dimension) || unit.some(px => isLength$1(px)) || value === 'max-content')
                ) {
                    size = node.bounds[dimension];
                    minSize = 0;
                    sizeWeight = 0;
                    break;
                } else if (horizontal) {
                    size = 0;
                    minSize = 0;
                    sizeWeight = -1;
                    break;
                }
            } else if (value === 'min-content') {
                if (!item.hasPX(dimension)) {
                    if (horizontal) {
                        item.setLayoutWidth('wrap_content', false);
                    } else {
                        item.setLayoutHeight('wrap_content', false);
                    }
                    break;
                }
            } else if (value.endsWith('fr')) {
                if (horizontal || parent.hasHeight) {
                    if (sizeWeight === -1) {
                        sizeWeight = 0;
                    }
                    sizeWeight += parseFloat(value);
                    minSize = size;
                } else {
                    sizeWeight = 0;
                    minSize += mainData.minCellHeight * parseFloat(value);
                }
                size = 0;
            } else if (isPercent$1(value)) {
                if (sizeWeight === -1) {
                    sizeWeight = 0;
                }
                sizeWeight += parseFloat(value) / 100;
                minSize = size;
                size = 0;
            } else {
                const cellSize = horizontal ? item.parseUnit(value) : item.parseUnit(value, { dimension: 'height' });
                if (minSize === 0) {
                    size += cellSize;
                } else {
                    minSize += cellSize;
                }
            }
            if (node.textElement && /^0[a-zQ]*$/.test(min)) {
                fitContent = true;
            }
        }
        if (cellSpan > 1) {
            const value = (cellSpan - 1) * data.gap;
            if (size && minSize === 0) {
                size += value;
            } else if (minSize) {
                minSize += value;
            }
            if (minUnitSize) {
                minUnitSize += value;
            }
        }
        if (minUnitSize) {
            if (data.autoFill && size === 0 && (horizontal ? row.length : column.length) === 1) {
                size = Math.max(node.actualWidth, minUnitSize);
                sizeWeight = 0;
            } else {
                minSize = minUnitSize;
            }
        }
        if (minSize && !item.hasPX(minDimension)) {
            item.css(minDimension, formatPX$4(minSize), true);
        }
        if (parent.layoutConstraint) {
            if (horizontal) {
                if (!item.hasPX('width', { percent: false })) {
                    item.app(
                        'layout_constraintWidth_percent',
                        truncate$3(sizeWeight / column.frTotal, item.localSettings.floatPrecision)
                    );
                    item.setLayoutWidth('0px');
                }
                if (cellStart === 0) {
                    item.anchor('left', 'parent');
                    item.anchorStyle('horizontal', 0, 'spread');
                } else {
                    const previousSibling = item.innerMostWrapped.previousSibling;
                    if (previousSibling) {
                        previousSibling.anchor('rightLeft', item.documentId);
                        item.anchor('leftRight', previousSibling.anchorTarget.documentId);
                    }
                }
                if (cellStart + cellSpan === column.length) {
                    item.anchor('right', 'parent');
                }
                item.positioned = true;
            } else if (!item.hasPX('height', { percent: false })) {
                if (sizeWeight) {
                    if (row.length === 1) {
                        item.setLayoutHeight('match_parent');
                    } else {
                        item.app(
                            'layout_constraintHeight_percent',
                            truncate$3(sizeWeight / row.frTotal, item.localSettings.floatPrecision)
                        );
                        item.setLayoutHeight('0px');
                    }
                } else if (size) {
                    if (item.contentBox) {
                        size -= item.contentBoxHeight;
                    }
                    item.css(autoSize ? 'minHeight' : 'height', formatPX$4(size), true);
                }
            }
        } else {
            item.android(horizontal ? 'layout_column' : 'layout_row', cellStart.toString());
            item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan', cellSpan.toString());
            let columnWeight = horizontal && column.flexible;
            if (sizeWeight !== 0) {
                if (!item.hasPX(dimension)) {
                    if (horizontal) {
                        if (cellData.columnSpan === column.length) {
                            item.setLayoutWidth('match_parent');
                        } else {
                            item.setLayoutWidth('0px');
                            item.android(
                                'layout_columnWeight',
                                sizeWeight === -1 ? '0.01' : truncate$3(sizeWeight, node.localSettings.floatPrecision)
                            );
                            item.mergeGravity('layout_gravity', 'fill_horizontal');
                        }
                        columnWeight = false;
                    } else if (cellData.rowSpan === row.length) {
                        item.setLayoutHeight('match_parent');
                    } else {
                        item.setLayoutHeight('0px');
                        item.android('layout_rowWeight', truncate$3(sizeWeight, node.localSettings.floatPrecision));
                        item.mergeGravity('layout_gravity', 'fill_vertical');
                    }
                }
            } else if (size) {
                const maxDimension = horizontal ? 'maxWidth' : 'maxHeight';
                if (fitContent && !item.hasPX(maxDimension)) {
                    item.css(maxDimension, formatPX$4(size), true);
                    item.mergeGravity('layout_gravity', horizontal ? 'fill_horizontal' : 'fill_vertical');
                } else if (!item.hasPX(dimension)) {
                    if (item.contentBox) {
                        size -= horizontal ? item.contentBoxWidth : item.contentBoxHeight;
                    }
                    if (autoSize && !parent.hasPX(maxDimension)) {
                        item.css(minDimension, formatPX$4(size), true);
                        if (horizontal) {
                            item.setLayoutWidth('wrap_content');
                        } else {
                            item.setLayoutHeight('wrap_content');
                        }
                    } else {
                        item.css(dimension, formatPX$4(size), true);
                    }
                }
            } else if (unit.length === 0 && !item.hasPX(dimension)) {
                if (horizontal) {
                    item.setLayoutWidth('match_parent', false);
                } else {
                    item.setLayoutHeight('wrap_content', false);
                }
            }
            if (columnWeight) {
                item.android('layout_columnWeight', '0');
            }
        }
        return [cellStart, cellSpan];
    }
    const getLayoutDimension = value => (value === 'space-between' ? 'match_parent' : 'wrap_content');
    class CssGrid extends squared.base.extensions.CssGrid {
        processNode(node, parent) {
            let container, renderAs, outputAs, unsetContentBox;
            if (CssGrid.isJustified(node) || CssGrid.isAligned(node)) {
                container = this.controller.createNodeWrapper(node, parent, {
                    containerType: CONTAINER_NODE.CONSTRAINT,
                    resource: NODE_RESOURCE$3.ASSET,
                    resetContentBox: true,
                });
                container.inherit(node, 'styleMap', 'boxStyle');
                node.resetBox(15 /* MARGIN */, container);
                node.resetBox(240 /* PADDING */, container);
                unsetContentBox = true;
                if (CssGrid.isJustified(node)) {
                    node.setLayoutWidth(getLayoutDimension(node.css('justifyContent')));
                } else if (node.hasPX('width', { percent: false })) {
                    node.setLayoutWidth('match_parent');
                } else {
                    container.setLayoutWidth(node.blockStatic ? 'match_parent' : 'wrap_content');
                }
                if (CssGrid.isAligned(node)) {
                    node.setLayoutHeight(getLayoutDimension(node.css('alignContent')));
                } else if (node.hasPX('height', { percent: false })) {
                    node.setLayoutHeight('match_parent');
                } else {
                    container.setLayoutHeight('wrap_content');
                }
                renderAs = container;
                outputAs = this.application.renderNode(
                    new LayoutUI(parent, container, CONTAINER_NODE.CONSTRAINT, 2048 /* SINGLE */)
                );
            }
            super.processNode(node, parent);
            const mainData = this.data.get(node);
            if (mainData) {
                mainData.unsetContentBox = unsetContentBox;
                const { column, row } = mainData;
                const unit = column.unit;
                const columnCount = column.length;
                const layout = LayoutUI.create({
                    parent: container || parent,
                    node,
                    containerType: CONTAINER_NODE.GRID,
                    alignmentType: 2 /* AUTO_LAYOUT */,
                    rowCount: row.length,
                    columnCount,
                });
                if (
                    !node.hasWidth &&
                    !node.rootElement &&
                    mainData.rowSpanMultiple.length === 0 &&
                    unit.length === columnCount &&
                    unit.every(value => value.endsWith('fr')) &&
                    node.ascend({ condition: item => this.isFlexibleContainer(item), error: item => item.hasWidth })
                        .length
                ) {
                    const rowData = mainData.rowData;
                    const rowCount = rowData.length;
                    const constraintData = new Array(rowCount);
                    let valid = true;
                    invalid: {
                        for (let i = 0; i < rowCount; ++i) {
                            const nodes = [];
                            const data = rowData[i];
                            for (let j = 0, length = data.length; j < length; ++j) {
                                const cell = data[j];
                                if (cell && cell.length === 1) {
                                    nodes.push(cell[0]);
                                } else {
                                    valid = false;
                                    break invalid;
                                }
                            }
                            constraintData[i] = nodes;
                        }
                    }
                    if (valid) {
                        column.frTotal = unit.reduce((a, b) => a + parseFloat(b), 0);
                        row.frTotal = row.unit.reduce((a, b) => a + (b.endsWith('fr') ? parseFloat(b) : 0), 0);
                        node.setLayoutWidth('match_parent');
                        node.lockAttr('android', 'layout_width');
                        mainData.constraintData = constraintData;
                        layout.containerType = CONTAINER_NODE.CONSTRAINT;
                    }
                }
                if (layout.containerType === CONTAINER_NODE.GRID) {
                    checkAutoDimension(column, true);
                    checkAutoDimension(row, false);
                }
                return {
                    parent: container,
                    renderAs,
                    outputAs,
                    outerParent: container,
                    output: this.application.renderNode(layout),
                    include: true,
                    complete: true,
                };
            }
        }
        processChild(node, parent) {
            const mainData = this.data.get(parent);
            const cellData = this.data.get(node);
            if (mainData && cellData) {
                const row = mainData.row;
                const alignSelf = node.has('alignSelf') ? node.css('alignSelf') : mainData.alignItems;
                const justifySelf = node.has('justifySelf') ? node.css('justifySelf') : mainData.justifyItems;
                let renderAs, outputAs;
                if (
                    REGEXP_ALIGNSELF.test(alignSelf) ||
                    REGEXP_JUSTIFYSELF.test(justifySelf) ||
                    parent.layoutConstraint
                ) {
                    renderAs = this.application.createNode(node.sessionId, { parent, innerWrapped: node });
                    renderAs.containerName = node.containerName;
                    renderAs.setControlType(CONTAINER_TAGNAME.FRAME, CONTAINER_NODE.FRAME);
                    renderAs.inherit(node, 'base', 'initial');
                    renderAs.exclude({
                        resource: NODE_RESOURCE$3.BOX_STYLE | NODE_RESOURCE$3.ASSET,
                        procedure: NODE_PROCEDURE$4.CUSTOMIZATION,
                    });
                    renderAs.resetBox(15 /* MARGIN */);
                    renderAs.resetBox(240 /* PADDING */);
                    renderAs.render(parent);
                    node.transferBox(15 /* MARGIN */, renderAs);
                    let inlineWidth = true;
                    switch (justifySelf) {
                        case 'first baseline':
                        case 'baseline':
                        case 'left':
                        case 'start':
                        case 'flex-start':
                        case 'self-start':
                            node.mergeGravity('layout_gravity', 'left');
                            break;
                        case 'last baseline':
                        case 'right':
                        case 'end':
                        case 'flex-end':
                        case 'self-end':
                            node.mergeGravity('layout_gravity', 'right');
                            break;
                        case 'center':
                            node.mergeGravity('layout_gravity', 'center_horizontal');
                            break;
                        default:
                            inlineWidth = false;
                            break;
                    }
                    if (!node.hasWidth) {
                        node.setLayoutWidth(inlineWidth ? 'wrap_content' : 'match_parent', false);
                    }
                    switch (alignSelf) {
                        case 'first baseline':
                        case 'baseline':
                        case 'start':
                        case 'flex-start':
                        case 'self-start':
                            node.mergeGravity('layout_gravity', 'top');
                            break;
                        case 'last baseline':
                        case 'end':
                        case 'flex-end':
                        case 'self-end':
                            node.mergeGravity('layout_gravity', 'bottom');
                            break;
                        case 'center':
                            node.mergeGravity('layout_gravity', 'center_vertical');
                            break;
                        default:
                            if (!node.hasHeight) {
                                node.setLayoutHeight('match_parent', false);
                            }
                            break;
                    }
                    outputAs = this.application.renderNode(
                        new LayoutUI(parent, renderAs, CONTAINER_NODE.FRAME, 2048 /* SINGLE */)
                    );
                } else {
                    node.mergeGravity('layout_gravity', 'top');
                }
                const target = renderAs || node;
                applyLayout(node, parent, target, mainData, cellData, 'width');
                if (target !== node || node.hasPX('maxHeight')) {
                    target.mergeGravity('layout_gravity', 'fill');
                } else if (!target.hasPX('width')) {
                    target.mergeGravity('layout_gravity', 'fill_horizontal');
                }
                const [rowStart, rowSpan] = applyLayout(node, parent, target, mainData, cellData, 'height');
                if (
                    mainData.alignContent === 'normal' &&
                    !parent.hasPX('height') &&
                    !node.hasPX('minHeight') &&
                    (!row.unit[rowStart] || row.unit[rowStart] === 'auto') &&
                    cellData.bounds &&
                    Math.floor(node.bounds.height) > cellData.bounds.height &&
                    this.checkRowSpan(mainData, node, rowSpan, rowStart)
                ) {
                    target.css('minHeight', formatPX$4(node.box.height));
                } else if (
                    !target.hasPX('height') &&
                    !target.hasPX('maxHeight') &&
                    !(
                        row.length === 1 &&
                        mainData.alignContent.startsWith('space') &&
                        !REGEXP_ALIGNSELF.test(mainData.alignItems)
                    )
                ) {
                    target.mergeGravity('layout_gravity', 'fill_vertical');
                }
                return {
                    parent: renderAs,
                    renderAs,
                    outputAs,
                };
            }
        }
        postBaseLayout(node) {
            const mainData = this.data.get(node);
            if (mainData) {
                const controller = this.controller;
                const { children, column, row, rowData } = mainData;
                const wrapped = mainData.unsetContentBox;
                const insertNode = children[children.length - 1];
                if (CssGrid.isJustified(node)) {
                    setContentSpacing(
                        mainData,
                        column,
                        node,
                        true,
                        controller.userSettings.resolutionScreenWidth - node.bounds.left,
                        0
                    );
                    switch (mainData.justifyContent) {
                        case 'center':
                        case 'space-around':
                        case 'space-evenly':
                            if (wrapped) {
                                node.anchorParent('horizontal', 0.5, '', true);
                            }
                            break;
                        case 'right':
                        case 'end':
                        case 'flex-end':
                            if (wrapped) {
                                node.anchorParent('horizontal', 1, '', true);
                            }
                            break;
                        default:
                            if (mainData.column.length === 1) {
                                node.setLayoutWidth('match_parent');
                            }
                            break;
                    }
                    if (wrapped) {
                        if (column.unit.some(value => value.endsWith('fr'))) {
                            node.setLayoutWidth('match_parent');
                        }
                    }
                } else {
                    const length = column.length;
                    if (node.blockStatic || node.hasWidth) {
                        const percent = requireDirectionSpacer(column, node.actualWidth);
                        if (percent !== 0 && percent < 100) {
                            if (percent > 0) {
                                controller.addAfterOutsideTemplate(
                                    insertNode,
                                    controller.renderSpace({
                                        width: formatPercent((100 - percent) / 100),
                                        height: 'match_parent',
                                        rowSpan: row.length,
                                        android: {
                                            layout_row: '0',
                                            layout_column: length.toString(),
                                            layout_columnWeight: column.flexible ? '0.01' : '',
                                        },
                                    }),
                                    false
                                );
                            }
                            node.android('columnCount', (length + 1).toString());
                        }
                    }
                    if (wrapped) {
                        if (node.contentBoxWidth && node.hasPX('width', { percent: false })) {
                            node.anchorParent('horizontal', 0.5, '', true);
                        } else if (length === 1) {
                            node.setLayoutWidth('match_parent');
                        } else {
                            node.setLayoutWidth('wrap_content', false);
                        }
                    }
                }
                if (CssGrid.isAligned(node)) {
                    setContentSpacing(mainData, row, node, false, 0, controller.userSettings.resolutionScreenHeight);
                    if (wrapped) {
                        switch (mainData.alignContent) {
                            case 'center':
                            case 'space-around':
                            case 'space-evenly':
                                node.anchorParent('vertical', 0.5, '', true);
                                break;
                            case 'end':
                            case 'flex-end':
                                node.anchorParent('vertical', 1, '', true);
                                break;
                        }
                    }
                } else {
                    if (node.hasHeight) {
                        const percent = requireDirectionSpacer(row, node.actualHeight);
                        if (percent !== 0 && percent < 100) {
                            if (percent > 0) {
                                controller.addAfterOutsideTemplate(
                                    insertNode,
                                    controller.renderSpace({
                                        width: 'match_parent',
                                        height: formatPercent((100 - percent) / 100),
                                        columnSpan: column.length,
                                        android: {
                                            layout_row: row.length.toString(),
                                            layout_column: '0',
                                            layout_rowWeight: row.flexible ? '0.01' : '',
                                        },
                                    }),
                                    false
                                );
                            }
                            node.android('rowCount', (row.length + 1).toString());
                        }
                    }
                    if (wrapped) {
                        if (node.contentBoxHeight && node.hasPX('height', { percent: false })) {
                            node.anchorParent('vertical', 0.5, '', true);
                        } else {
                            node.setLayoutHeight('wrap_content', false);
                        }
                    }
                }
                const constraintData = mainData.constraintData;
                if (constraintData) {
                    const { gap, length } = column;
                    const rowCount = constraintData.length;
                    const barrierIds = new Array(rowCount - 1);
                    for (let i = 1, j = 0; i < rowCount; ++i) {
                        barrierIds[j++] = controller.addBarrier(constraintData[i], 'top');
                    }
                    for (let i = 0; i < rowCount; ++i) {
                        const nodes = constraintData[i];
                        const previousBarrierId = barrierIds[i - 1];
                        const barrierId = barrierIds[i];
                        let previousItem;
                        for (let j = 0; j < length; ++j) {
                            const item = nodes[j];
                            if (item) {
                                if (i === 0) {
                                    item.anchor('top', 'parent');
                                    item.anchor('bottomTop', barrierId);
                                    item.anchorStyle('vertical', 0, 'packed');
                                } else {
                                    if (i === rowCount - 1) {
                                        item.anchor('bottom', 'parent');
                                    } else {
                                        item.anchor('bottomTop', barrierId);
                                    }
                                    item.anchor('topBottom', previousBarrierId);
                                }
                                if (j === length - 1) {
                                    item.anchor('right', 'parent');
                                } else {
                                    item.modifyBox(2 /* MARGIN_RIGHT */, gap * -1);
                                }
                                if (previousItem) {
                                    previousItem.anchor('rightLeft', item.documentId);
                                    item.anchor('leftRight', previousItem.documentId);
                                } else {
                                    item.anchor('left', 'parent');
                                    item.anchorStyle('horizontal', 0, 'packed');
                                }
                                item.anchored = true;
                                item.positioned = true;
                                previousItem = item;
                            } else if (previousItem) {
                                const options = {
                                    width: '0px',
                                    height: 'wrap_content',
                                    android: {},
                                    app: {
                                        layout_constraintTop_toTopOf: i === 0 ? 'parent' : '',
                                        layout_constraintTop_toBottomOf: previousBarrierId,
                                        layout_constraintBottom_toTopOf: i < length - 1 ? barrierId : '',
                                        layout_constraintBottom_toBottomOf: i === length - 1 ? 'parent' : '',
                                        layout_constraintStart_toEndOf: previousItem.anchorTarget.documentId,
                                        layout_constraintEnd_toEndOf: 'parent',
                                        layout_constraintVertical_bias: i === 0 ? '0' : '',
                                        layout_constraintVertical_chainStyle: i === 0 ? 'packed' : '',
                                        layout_constraintWidth_percent: (
                                            column.unit.slice(j, length).reduce((a, b) => a + parseFloat(b), 0) /
                                            column.frTotal
                                        ).toString(),
                                    },
                                };
                                controller.addAfterInsideTemplate(node, controller.renderSpace(options), false);
                                previousItem.anchor('rightLeft', options.documentId);
                                break;
                            }
                        }
                    }
                } else {
                    const { emptyRows, rowDirection: horizontal } = mainData;
                    const { flexible, gap, unit } = horizontal ? column : row;
                    const unitSpan = unit.length;
                    let k = -1,
                        l = 0;
                    const createSpacer = (
                        i,
                        unitData,
                        gapSize,
                        opposing = 'wrap_content',
                        opposingWeight = '',
                        opposingMargin = 0
                    ) => {
                        if (k !== -1) {
                            const section = unitData.slice(k, k + l);
                            let width = '',
                                height = '',
                                rowSpan = 1,
                                columnSpan = 1,
                                layout_columnWeight,
                                layout_rowWeight,
                                layout_row,
                                layout_column;
                            if (horizontal) {
                                layout_row = i.toString();
                                layout_column = k.toString();
                                height = opposing;
                                layout_columnWeight = flexible ? '0.01' : '';
                                layout_rowWeight = opposingWeight;
                                columnSpan = l;
                            } else {
                                layout_row = k.toString();
                                layout_column = i.toString();
                                layout_rowWeight = flexible ? '0.01' : '';
                                layout_columnWeight = opposingWeight;
                                width = opposing;
                                rowSpan = l;
                            }
                            if (section.length === unitData.length) {
                                if (horizontal) {
                                    width = 'match_parent';
                                    layout_columnWeight = '';
                                } else {
                                    height = 'match_parent';
                                    layout_rowWeight = '';
                                }
                                gapSize = 0;
                            } else {
                                const [widthA, heightA, columnWeightA, rowWeightA] = getCellDimensions(
                                    node,
                                    horizontal,
                                    section,
                                    gapSize * (section.length - 1)
                                );
                                if (widthA) {
                                    width = widthA;
                                }
                                if (heightA) {
                                    height = heightA;
                                }
                                if (columnWeightA) {
                                    layout_columnWeight = columnWeightA;
                                }
                                if (rowWeightA) {
                                    layout_rowWeight = rowWeightA;
                                }
                            }
                            controller.addAfterOutsideTemplate(
                                insertNode,
                                controller.renderSpace({
                                    width,
                                    height,
                                    rowSpan,
                                    columnSpan,
                                    android: {
                                        [horizontal
                                            ? node.localizeString('layout_marginRight' /* MARGIN_RIGHT */)
                                            : 'bottom']:
                                            gapSize && k + l < unitData.length
                                                ? `@dimen/${Resource.insertStoredAsset(
                                                      'dimens',
                                                      `${node.controlId}_cssgrid_${horizontal ? 'column' : 'row'}_gap`,
                                                      formatPX$4(gapSize)
                                                  )}`
                                                : '',
                                        [horizontal
                                            ? 'bottom'
                                            : node.localizeString(
                                                  'layout_marginRight' /* MARGIN_RIGHT */
                                              )]: opposingMargin
                                            ? `@dimen/${Resource.insertStoredAsset(
                                                  'dimens',
                                                  `${node.controlId}_cssgrid_${horizontal ? 'row' : 'column'}_gap`,
                                                  formatPX$4(opposingMargin)
                                              )}`
                                            : '',
                                        layout_row,
                                        layout_column,
                                        layout_rowWeight,
                                        layout_columnWeight,
                                        layout_gravity: 'fill',
                                    },
                                }),
                                width.endsWith('px') || height.endsWith('px')
                            );
                            k = -1;
                        }
                        l = 0;
                    };
                    for (let i = 0, length = Math.max(rowData.length, 1); i < length; ++i) {
                        if (!emptyRows[i]) {
                            const data = rowData[i];
                            for (let j = 0; j < unitSpan; ++j) {
                                if (data[j]) {
                                    createSpacer(i, unit, gap);
                                } else {
                                    if (k === -1) {
                                        k = j;
                                    }
                                    ++l;
                                }
                            }
                            createSpacer(i, unit, gap);
                        }
                    }
                    for (let i = 0, length = emptyRows.length; i < length; ++i) {
                        const emptyRow = emptyRows[i];
                        if (emptyRow) {
                            for (let j = 0, q = emptyRow.length; j < q; ++j) {
                                const value = emptyRow[j];
                                if (value) {
                                    k = j;
                                    const { unit: unitOpposing, gap: gapOpposing } = horizontal ? row : column;
                                    const dimensions = getCellDimensions(
                                        node,
                                        !horizontal,
                                        [unitOpposing[horizontal ? j : i]],
                                        0
                                    );
                                    l = value === Infinity ? unit.length : 1;
                                    if (horizontal) {
                                        createSpacer(
                                            i,
                                            unitOpposing,
                                            gapOpposing,
                                            dimensions[1],
                                            dimensions[3],
                                            i < length - 1 ? gap : 0
                                        );
                                    } else {
                                        createSpacer(
                                            i,
                                            unitOpposing,
                                            gapOpposing,
                                            dimensions[0],
                                            dimensions[2],
                                            j < q - 1 ? gap : 0
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        postOptimize(node) {
            var _a;
            if (
                node.blockStatic &&
                !node.hasPX('minWidth', { percent: false }) &&
                ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.layoutElement) === false
            ) {
                const mainData = this.data.get(node);
                if (mainData) {
                    const { gap, length, unit } = mainData.column;
                    let minWidth = gap * (length - 1);
                    for (let i = 0, q = unit.length; i < q; ++i) {
                        const value = unit[i];
                        if (value.endsWith('px')) {
                            minWidth += parseFloat(value);
                        } else {
                            return;
                        }
                    }
                    if (minWidth > node.width) {
                        node.android('minWidth', formatPX$4(minWidth));
                        if (!node.flexibleWidth && !node.blockWidth) {
                            node.setLayoutWidth('wrap_content');
                        }
                    }
                }
            }
        }
        isFlexibleContainer(node) {
            const parent = node.actualParent;
            if (parent && parent.gridElement) {
                const mainData = this.data.get(parent);
                const cellData = this.data.get(node);
                if (mainData && cellData) {
                    const unit = mainData.column.unit;
                    const { columnStart, columnSpan } = cellData;
                    let valid = false;
                    for (let i = 0; i < columnSpan; ++i) {
                        const value = unit[columnStart + i];
                        if (value.endsWith('fr') || isPercent$1(value)) {
                            valid = true;
                        } else if (value === 'auto') {
                            return false;
                        }
                    }
                    return valid;
                }
            }
            return node.hasFlex('row') && node.flexbox.grow > 0;
        }
        checkRowSpan(mainData, node, rowSpan, rowStart) {
            if (rowSpan === 1 && mainData.rowSpanMultiple[rowStart]) {
                for (const item of flatArray(mainData.rowData[rowStart], Infinity)) {
                    if (item !== node) {
                        const cellData = this.data.get(item);
                        if (
                            cellData &&
                            cellData.rowSpan > rowSpan &&
                            (rowStart === 0 || cellData.rowSpan < mainData.rowData.length)
                        ) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    }

    class External extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.documentBase = true;
            this.eventOnly = true;
        }
        beforeInsertNode(element, sessionId) {
            if (this.included(element)) {
                this.application.getProcessing(sessionId).rootElements.add(element);
            }
            return false;
        }
    }

    var NodeUI$1 = squared.base.NodeUI;
    var LayoutUI$1 = squared.base.LayoutUI;
    const { isLength: isLength$2 } = squared.lib.css;
    const { truncate: truncate$4 } = squared.lib.math;
    const { capitalize: capitalize$3, iterateReverseArray, sameArray, withinRange: withinRange$1 } = squared.lib.util;
    function adjustGrowRatio(parent, items, attr) {
        const horizontal = attr === 'width';
        const hasDimension = horizontal ? 'hasWidth' : 'hasHeight';
        let percent =
                parent[hasDimension] ||
                (horizontal &&
                    parent.blockStatic &&
                    withinRange$1(parent.parseWidth(parent.css('maxWidth')), parent.box.width)),
            growShrinkType = 0,
            result = 0;
        const length = items.length;
        for (let i = 0; i < length; ++i) {
            const item = items[i];
            if (percent) {
                if (horizontal) {
                    if (item.innerMostWrapped.autoMargin.horizontal) {
                        percent = false;
                        break;
                    }
                } else if (item.innerMostWrapped.autoMargin.vertical) {
                    percent = false;
                    break;
                }
            }
            result += item.flexbox.grow;
        }
        if (length > 1 && (horizontal || percent)) {
            const groupBasis = [];
            const percentage = [];
            let maxBasisUnit = 0,
                maxDimension = 0,
                maxRatio = NaN,
                maxBasis;
            for (let i = 0; i < length; ++i) {
                const item = items[i].innerMostWrapped;
                const { alignSelf, basis, shrink, grow } = item.flexbox;
                const dimension = item.bounds[attr];
                let growPercent;
                if (grow > 0 || shrink !== 1) {
                    const value = item.parseUnit(basis === 'auto' ? item.css(attr) : basis, { dimension: attr });
                    if (value) {
                        let largest;
                        if (dimension < value) {
                            if (isNaN(maxRatio) || shrink < maxRatio) {
                                maxRatio = shrink;
                                largest = true;
                                growShrinkType = 1;
                            }
                        } else if (isNaN(maxRatio) || grow > maxRatio) {
                            maxRatio = grow;
                            largest = true;
                            growShrinkType = 2;
                        }
                        if (largest) {
                            maxBasis = item;
                            maxBasisUnit = value;
                            maxDimension = dimension;
                        }
                        groupBasis.push({
                            item,
                            basis: value,
                            dimension,
                            shrink,
                            grow,
                        });
                        continue;
                    } else if (grow > 0) {
                        growPercent = true;
                    }
                } else if (isLength$2(basis)) {
                    groupBasis.push({
                        item,
                        basis: Math.min(dimension, item.parseUnit(basis, { dimension: attr })),
                        dimension,
                        shrink,
                        grow,
                    });
                    item.flexbox.basis = 'auto';
                    continue;
                }
                if (alignSelf === 'auto' && ((percent && !item[hasDimension]) || growPercent)) {
                    percentage.push(item);
                }
            }
            if (growShrinkType) {
                let q = groupBasis.length;
                if (q > 1) {
                    for (let i = 0; i < q; ++i) {
                        const data = groupBasis[i];
                        const { basis, item } = data;
                        if (
                            item === maxBasis ||
                            (basis === maxBasisUnit &&
                                ((growShrinkType === 1 && maxRatio === data.shrink) ||
                                    (growShrinkType === 2 && maxRatio === data.grow)))
                        ) {
                            item.flexbox.grow = 1;
                        } else if (basis) {
                            item.flexbox.grow =
                                ((data.dimension / basis / (maxDimension / maxBasisUnit)) * basis) / maxBasisUnit;
                        }
                    }
                }
                q = percentage.length;
                for (let i = 0; i < q; ++i) {
                    setBoxPercentage(parent, percentage[i], attr);
                }
            }
        }
        if (horizontal && growShrinkType === 0) {
            for (let i = 0; i < length; ++i) {
                const item = items[i];
                if (
                    item.find(
                        child =>
                            child.multiline &&
                            child.ascend({ condition: above => above[hasDimension], including: parent }).length === 0,
                        { cascade: true }
                    )
                ) {
                    for (let j = 0; j < length; ++j) {
                        setBoxPercentage(parent, items[j], attr);
                    }
                    break;
                }
            }
        }
        return result;
    }
    function getBaseline(nodes) {
        const values = ['baseline', 'initial'];
        for (let i = 0, length = nodes.length; i < length; ++i) {
            const node = nodes[i];
            const wrapperOf = node.wrapperOf;
            const target = wrapperOf || node;
            if (target.textElement && target.cssAny('verticalAlign', values)) {
                return node;
            }
        }
        return NodeUI$1.baseline(nodes);
    }
    function setLayoutWeightOpposing(item, value, horizontal) {
        if (!horizontal) {
            item.setLayoutWidth(value);
        } else {
            item.setLayoutHeight(value);
        }
    }
    function getOuterFrameChild(item) {
        while (item) {
            if (item.layoutFrame) {
                return item.innerWrapped;
            }
            item = item.innerWrapped;
        }
    }
    function setLayoutWeight(node, horizontal, dimension, attr, value) {
        if (node[dimension] === 0) {
            node.app(attr, truncate$4(value, node.localSettings.floatPrecision));
            if (horizontal) {
                node.setLayoutWidth('0px');
            } else {
                node.setLayoutHeight('0px');
            }
        }
    }
    const setBoxPercentage = (parent, node, attr) =>
        (node.flexbox.basis = (node.bounds[attr] / parent.box[attr]) * 100 + '%');
    class Flexbox extends squared.base.extensions.Flexbox {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = this.data.get(node);
            if ((mainData.row && mainData.rowCount === 1) || (mainData.column && mainData.columnCount === 1)) {
                node.containerType = CONTAINER_NODE.CONSTRAINT;
                node.addAlign(2 /* AUTO_LAYOUT */);
                node.addAlign(mainData.column ? 8 /* VERTICAL */ : 4 /* HORIZONTAL */);
                mainData.wrap = false;
                return {
                    include: true,
                    complete: true,
                };
            }
            return {
                output: this.application.renderNode(
                    LayoutUI$1.create({
                        parent,
                        node,
                        containerType: CONTAINER_NODE.CONSTRAINT,
                        alignmentType: 2 /* AUTO_LAYOUT */ | (mainData.column ? 4 /* HORIZONTAL */ : 8) /* VERTICAL */,
                        itemCount: node.size(),
                        rowCount: mainData.rowCount,
                        columnCount: mainData.columnCount,
                    })
                ),
                include: true,
                complete: true,
            };
        }
        processChild(node, parent) {
            if (node.hasAlign(64 /* SEGMENTED */)) {
                return {
                    output: this.application.renderNode(
                        new LayoutUI$1(parent, node, CONTAINER_NODE.CONSTRAINT, 2 /* AUTO_LAYOUT */)
                    ),
                    complete: true,
                    subscribe: true,
                };
            } else if (node.autoMargin.horizontal || (parent.hasHeight && node.autoMargin.vertical)) {
                const mainData = this.data.get(parent);
                if (mainData) {
                    const index = mainData.children.findIndex(item => item === node);
                    if (index !== -1) {
                        const container = this.controller.createNodeWrapper(node, parent);
                        container.cssApply({
                            marginTop: '0px',
                            marginRight: '0px',
                            marginBottom: '0px',
                            marginLeft: '0px',
                            display: 'block',
                        });
                        container.saveAsInitial();
                        container.setCacheValue('flexbox', node.flexbox);
                        mainData.children[index] = container;
                        if (!node.hasWidth && node.autoMargin.horizontal) {
                            node.setLayoutWidth('wrap_content');
                        }
                        return {
                            parent: container,
                            renderAs: container,
                            outputAs: this.application.renderNode(
                                new LayoutUI$1(parent, container, CONTAINER_NODE.FRAME, 2048 /* SINGLE */)
                            ),
                        };
                    }
                }
            }
        }
        postBaseLayout(node) {
            const mainData = this.data.get(node);
            if (mainData) {
                const controller = this.controller;
                const { row, column, reverse, wrap, wrapReverse, alignContent, justifyContent, children } = mainData;
                const parentBottom =
                    node.hasPX('height', { percent: false }) || node.percentHeight ? node.linear.bottom : 0;
                const chainHorizontal = [];
                const chainVertical = [];
                const segmented = [];
                let marginBottom = 0;
                if (wrap) {
                    let previous;
                    node.each(item => {
                        if (item.hasAlign(64 /* SEGMENTED */)) {
                            const pageFlow = item.renderChildren.filter(child => child.pageFlow);
                            if (pageFlow.length) {
                                if (row) {
                                    item.setLayoutWidth('match_parent');
                                    chainHorizontal.push(pageFlow);
                                } else {
                                    item.setLayoutHeight('match_parent');
                                    if (previous) {
                                        let largest = previous[0];
                                        for (let j = 1, length = previous.length; j < length; ++j) {
                                            const sibling = previous[j];
                                            if (sibling.linear.right > largest.linear.right) {
                                                largest = sibling;
                                            }
                                        }
                                        item.constraint.horizontal = true;
                                    }
                                    chainVertical.push(pageFlow);
                                    previous = pageFlow;
                                }
                                segmented.push(item);
                            }
                        }
                    });
                    if (row) {
                        chainVertical.push(segmented);
                    } else {
                        if (wrapReverse) {
                            const item = chainVertical[0][0];
                            const offset = item.linear.left - node.box.left;
                            if (offset > 0) {
                                item.modifyBox(8 /* MARGIN_LEFT */, offset);
                            } else {
                                segmented[0].anchorStyle('horizontal', 0, 'packed');
                            }
                        } else {
                            const item = chainVertical[chainVertical.length - 1][0];
                            const offset = node.box.right - item.linear.right;
                            if (offset > 0) {
                                item.modifyBox(2 /* MARGIN_RIGHT */, offset);
                            } else {
                                segmented[0].anchorStyle('horizontal', 0, 'packed');
                            }
                        }
                        chainHorizontal.push(segmented);
                    }
                } else if (row) {
                    chainHorizontal[0] = children;
                } else {
                    chainVertical[0] = children;
                }
                let orientation, orientationInverse, WHL, HWL, LT, TL, RB, BR, LRTB, RLBT, dimension, dimensionInverse;
                for (let i = 0; i < 2; ++i) {
                    const horizontal = i === 0;
                    const partition = horizontal ? chainHorizontal : chainVertical;
                    const length = partition.length;
                    if (length === 0) {
                        continue;
                    }
                    if (horizontal) {
                        orientation = 'horizontal';
                        orientationInverse = 'vertical';
                        WHL = 'width';
                        HWL = 'height';
                        LT = 'left';
                        TL = 'top';
                        RB = 'right';
                        BR = 'bottom';
                        LRTB = 'leftRight';
                        RLBT = 'rightLeft';
                        dimension = node.hasHeight;
                        dimensionInverse = node.hasWidth;
                    } else {
                        orientation = 'vertical';
                        orientationInverse = 'horizontal';
                        WHL = 'height';
                        HWL = 'width';
                        LT = 'top';
                        TL = 'left';
                        RB = 'bottom';
                        BR = 'right';
                        LRTB = 'topBottom';
                        RLBT = 'bottomTop';
                        dimension = node.hasWidth;
                        dimensionInverse = node.hasHeight;
                    }
                    const orientationWeight = `layout_constraint${capitalize$3(orientation)}_weight`;
                    for (let j = 0; j < length; ++j) {
                        const seg = partition[j];
                        const q = seg.length;
                        const segStart = seg[0];
                        const segEnd = seg[q - 1];
                        const opposing = seg === segmented;
                        const justified = !opposing && seg.every(item => item.flexbox.grow === 0);
                        const spreadInside =
                            justified &&
                            (justifyContent === 'space-between' || (justifyContent === 'space-around' && q > 1));
                        const layoutWeight = [];
                        let maxSize = 0,
                            growAvailable = 0,
                            percentWidth = 0,
                            parentEnd = true,
                            baseline = null,
                            growAll;
                        segStart.anchor(LT, 'parent');
                        segEnd.anchor(RB, 'parent');
                        if (opposing) {
                            growAll = false;
                            if (dimensionInverse) {
                                let chainStyle = 'spread',
                                    bias = 0;
                                switch (alignContent) {
                                    case 'left':
                                    case 'right':
                                    case 'flex-end':
                                        bias = 1;
                                    case 'baseline':
                                    case 'start':
                                    case 'end':
                                    case 'flex-start':
                                        chainStyle = 'packed';
                                        parentEnd = false;
                                        break;
                                }
                                segStart.anchorStyle(orientation, bias, chainStyle);
                            } else {
                                segStart.anchorStyle(orientation, 0, 'spread_inside', false);
                            }
                        } else {
                            growAll = horizontal || dimensionInverse;
                            growAvailable = 1 - adjustGrowRatio(node, seg, WHL);
                            if (q > 1) {
                                let sizeCount = 0;
                                for (let k = 0; k < q; ++k) {
                                    const chain = seg[k];
                                    const value = (chain.data(this.name, 'boundsData') || chain.bounds)[HWL];
                                    if (sizeCount === 0) {
                                        maxSize = value;
                                        ++sizeCount;
                                    } else if (value === maxSize) {
                                        ++sizeCount;
                                    } else if (value > maxSize) {
                                        maxSize = value;
                                        sizeCount = 1;
                                    }
                                }
                                if (sizeCount === q) {
                                    maxSize = NaN;
                                }
                                if (horizontal) {
                                    percentWidth = View.availablePercent(seg, 'width', node.box.width);
                                }
                            }
                        }
                        for (let k = 0; k < q; ++k) {
                            const chain = seg[k];
                            const previous = seg[k - 1];
                            const next = seg[k + 1];
                            if (next) {
                                chain.anchor(RLBT, next.documentId);
                            }
                            if (previous) {
                                chain.anchor(LRTB, previous.documentId);
                            }
                            if (opposing) {
                                chain.anchor(TL, 'parent');
                                if (parentEnd) {
                                    if (dimensionInverse) {
                                        setLayoutWeight(chain, horizontal, WHL, orientationWeight, 1);
                                    } else {
                                        chain.anchor(BR, 'parent');
                                        chain.anchorStyle(orientationInverse, reverse ? 1 : 0, 'packed');
                                    }
                                }
                            } else {
                                const innerWrapped = getOuterFrameChild(chain);
                                const autoMargin = chain.innerMostWrapped.autoMargin;
                                if (horizontal) {
                                    if (autoMargin.horizontal) {
                                        if (innerWrapped) {
                                            innerWrapped.mergeGravity(
                                                'layout_gravity',
                                                autoMargin.leftRight
                                                    ? 'center_horizontal'
                                                    : autoMargin.left
                                                    ? chain.localizeString('right')
                                                    : chain.localizeString('left')
                                            );
                                            if (growAvailable > 0) {
                                                chain.flexbox.basis = '0%';
                                                layoutWeight.push(chain);
                                            }
                                        } else if (!autoMargin.leftRight) {
                                            if (autoMargin.left) {
                                                if (previous) {
                                                    chain.anchorDelete(LRTB);
                                                }
                                            } else if (next) {
                                                chain.anchorDelete(RLBT);
                                            }
                                        }
                                    }
                                } else if (autoMargin.vertical) {
                                    if (innerWrapped) {
                                        innerWrapped.mergeGravity(
                                            'layout_gravity',
                                            autoMargin.topBottom ? 'center_vertical' : autoMargin.top ? 'bottom' : 'top'
                                        );
                                        if (growAvailable > 0) {
                                            chain.flexbox.basis = '0%';
                                            layoutWeight.push(chain);
                                        }
                                    } else if (!autoMargin.topBottom) {
                                        if (autoMargin.top) {
                                            if (previous) {
                                                chain.anchorDelete(LRTB);
                                            }
                                        } else if (next) {
                                            chain.anchorDelete(RLBT);
                                        }
                                    }
                                }
                                switch (chain.flexbox.alignSelf) {
                                    case 'first baseline':
                                        if (TL === 'top' && chain.baselineElement) {
                                            const first = seg.find(item => item !== chain && item.baselineElement);
                                            if (first) {
                                                chain.anchor('baseline', first.documentId);
                                                break;
                                            }
                                        }
                                    case 'start':
                                    case 'flex-start':
                                        chain.anchor(TL, 'parent');
                                        break;
                                    case 'last baseline':
                                        if (BR === 'bottom' && chain.baselineElement) {
                                            const index = iterateReverseArray(seg, item => {
                                                if (item !== chain && item.baselineElement) {
                                                    chain.anchor('baseline', item.documentId);
                                                    return true;
                                                }
                                            });
                                            if (index === Infinity) {
                                                break;
                                            }
                                        }
                                    case 'end':
                                    case 'flex-end':
                                        chain.anchor(BR, 'parent');
                                        break;
                                    case 'baseline':
                                        if (horizontal) {
                                            if (baseline || (baseline = getBaseline(seg))) {
                                                if (baseline !== chain) {
                                                    chain.anchor('baseline', baseline.documentId);
                                                } else {
                                                    chain.anchorParent(orientationInverse, 0);
                                                }
                                            } else {
                                                chain.anchor('top', 'parent');
                                            }
                                        }
                                        break;
                                    case 'center':
                                        chain.anchorParent(orientationInverse, 0.5);
                                        if (!horizontal && chain.textElement) {
                                            chain.mergeGravity('gravity', 'center');
                                        }
                                        break;
                                    default: {
                                        const childContent = getOuterFrameChild(chain);
                                        switch (alignContent) {
                                            case 'center':
                                                if (length % 2 === 1 && j === Math.floor(length / 2)) {
                                                    chain.anchorParent(orientationInverse);
                                                } else if (j < length / 2) {
                                                    chain.anchor(BR, 'parent');
                                                } else if (j >= length / 2) {
                                                    chain.anchor(TL, 'parent');
                                                }
                                                break;
                                            case 'space-evenly':
                                            case 'space-around':
                                                if (childContent) {
                                                    childContent.mergeGravity(
                                                        'layout_gravity',
                                                        horizontal ? 'center_vertical' : 'center_horizontal'
                                                    );
                                                } else {
                                                    chain.anchorParent(orientationInverse);
                                                }
                                                break;
                                            case 'space-between':
                                                if (spreadInside && q === 2) {
                                                    chain.anchorDelete(j === 0 ? RLBT : LRTB);
                                                }
                                                if (j === 0) {
                                                    if (childContent) {
                                                        childContent.mergeGravity(
                                                            'layout_gravity',
                                                            wrapReverse ? BR : TL
                                                        );
                                                    } else {
                                                        chain.anchor(wrapReverse ? BR : TL, 'parent');
                                                    }
                                                } else if (length > 2 && j < length - 1) {
                                                    if (childContent) {
                                                        childContent.mergeGravity(
                                                            'layout_gravity',
                                                            horizontal ? 'center_vertical' : 'center_horizontal'
                                                        );
                                                    } else {
                                                        chain.anchorParent(orientationInverse);
                                                    }
                                                } else if (childContent) {
                                                    childContent.mergeGravity('layout_gravity', wrapReverse ? TL : BR);
                                                } else {
                                                    chain.anchor(wrapReverse ? TL : BR, 'parent');
                                                }
                                                break;
                                            default: {
                                                chain.anchorParent(orientationInverse);
                                                if (
                                                    !innerWrapped ||
                                                    !chain.innerMostWrapped.autoMargin[orientationInverse]
                                                ) {
                                                    chain.anchorStyle(orientationInverse, wrapReverse ? 1 : 0);
                                                }
                                                if (chain[HWL] === 0) {
                                                    if (!horizontal && chain.blockStatic) {
                                                        setLayoutWeightOpposing(chain, 'match_parent', horizontal);
                                                    } else if (isNaN(maxSize)) {
                                                        if (
                                                            (!horizontal && !wrap && !chain.isEmpty()) ||
                                                            (dimension && alignContent === 'normal')
                                                        ) {
                                                            setLayoutWeightOpposing(
                                                                chain,
                                                                dimension ? '0px' : 'match_parent',
                                                                horizontal
                                                            );
                                                        } else {
                                                            setLayoutWeightOpposing(chain, 'wrap_content', horizontal);
                                                        }
                                                    } else if (q === 1) {
                                                        if (!horizontal) {
                                                            setLayoutWeightOpposing(
                                                                chain,
                                                                dimension ? '0px' : 'match_parent',
                                                                horizontal
                                                            );
                                                        } else {
                                                            setLayoutWeightOpposing(chain, 'wrap_content', horizontal);
                                                        }
                                                    } else if (
                                                        (chain.naturalElement
                                                            ? (chain.data(this.name, 'boundsData') || chain.bounds)[HWL]
                                                            : Infinity) < maxSize
                                                    ) {
                                                        setLayoutWeightOpposing(
                                                            chain,
                                                            chain.flexElement &&
                                                                chain
                                                                    .css('flexDirection')
                                                                    .startsWith(horizontal ? 'row' : 'column')
                                                                ? 'match_parent'
                                                                : '0px',
                                                            horizontal
                                                        );
                                                        if (innerWrapped && !innerWrapped.autoMargin[orientation]) {
                                                            setLayoutWeightOpposing(
                                                                innerWrapped,
                                                                'match_parent',
                                                                horizontal
                                                            );
                                                        }
                                                    } else if (dimension) {
                                                        setLayoutWeightOpposing(chain, '0px', horizontal);
                                                    } else {
                                                        setLayoutWeightOpposing(chain, 'wrap_content', horizontal);
                                                        chain.lockAttr('android', 'layout_' + HWL);
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                }
                                percentWidth = chain.setFlexDimension(WHL, percentWidth);
                                if (!chain.innerMostWrapped.has('flexGrow')) {
                                    growAll = false;
                                }
                                if (parentBottom > 0 && j === length - 1) {
                                    const offset = chain.linear.bottom - parentBottom;
                                    if (offset > 0) {
                                        marginBottom = Math.max(chain.linear.bottom - parentBottom, marginBottom);
                                    }
                                    chain.setBox(4 /* MARGIN_BOTTOM */, { reset: 1 });
                                }
                            }
                            chain.anchored = true;
                            chain.positioned = true;
                        }
                        if (opposing) {
                            continue;
                        }
                        if (growAll) {
                            for (let k = 0; k < q; ++k) {
                                const item = seg[k];
                                setLayoutWeight(item, horizontal, WHL, orientationWeight, item.flexbox.grow);
                            }
                        } else if (growAvailable > 0) {
                            for (let k = 0, r = layoutWeight.length; k < r; ++k) {
                                const item = layoutWeight[k];
                                const autoMargin = item.innerMostWrapped.autoMargin;
                                let ratio = 1;
                                if (horizontal) {
                                    if (autoMargin.leftRight) {
                                        ratio = 2;
                                    }
                                } else if (autoMargin.topBottom) {
                                    ratio = 2;
                                }
                                setLayoutWeight(
                                    item,
                                    horizontal,
                                    WHL,
                                    orientationWeight,
                                    Math.max(item.flexbox.grow, (growAvailable * ratio) / layoutWeight.length)
                                );
                            }
                        }
                        if (marginBottom > 0) {
                            node.modifyBox(4 /* MARGIN_BOTTOM */, marginBottom);
                        }
                        if (horizontal || column) {
                            let centered;
                            if (justified) {
                                switch (justifyContent) {
                                    case 'normal':
                                        if (column) {
                                            segStart.anchorStyle(orientation, reverse ? 1 : 0, 'packed');
                                            continue;
                                        }
                                        break;
                                    case 'left':
                                        if (!horizontal) {
                                            break;
                                        }
                                    case 'start':
                                    case 'flex-start':
                                        segStart.anchorStyle(orientation, reverse ? 1 : 0, 'packed');
                                        continue;
                                    case 'center':
                                        if (q > 1) {
                                            segStart.anchorStyle(orientation, 0.5, 'packed');
                                            continue;
                                        }
                                        centered = true;
                                        break;
                                    case 'right':
                                        if (!horizontal) {
                                            break;
                                        }
                                    case 'end':
                                    case 'flex-end':
                                        segStart.anchorStyle(orientation, 1, 'packed');
                                        continue;
                                    case 'space-between':
                                        if (q === 1) {
                                            segEnd.anchorDelete(RB);
                                            continue;
                                        }
                                        break;
                                    case 'space-evenly':
                                        if (q > 1) {
                                            segStart.anchorStyle(orientation, 0, 'spread');
                                            continue;
                                        }
                                        centered = true;
                                        break;
                                    case 'space-around':
                                        if (q > 1) {
                                            segStart.constraint[orientation] = false;
                                            segEnd.constraint[orientation] = false;
                                            const options = {
                                                target: segStart,
                                                parent: node,
                                                orientation,
                                                percent: true,
                                            };
                                            controller.addGuideline(options);
                                            options.target = segEnd;
                                            options.opposing = true;
                                            controller.addGuideline(options);
                                            segStart.anchorStyle(orientation, 0, 'spread_inside');
                                            continue;
                                        }
                                        centered = true;
                                        break;
                                }
                            }
                            if (
                                spreadInside ||
                                (!wrap &&
                                    seg.some(item => item.app(orientationWeight)) &&
                                    !sameArray(seg, item => item.app(orientationWeight)))
                            ) {
                                segStart.anchorStyle(orientation, 0, 'spread_inside', false);
                            } else if (!centered) {
                                segStart.anchorStyle(orientation, reverse ? 1 : 0, 'packed', false);
                            }
                        }
                    }
                }
            }
        }
    }

    var LayoutUI$2 = squared.base.LayoutUI;
    const { formatPX: formatPX$5 } = squared.lib.css;
    const { withinRange: withinRange$2 } = squared.lib.util;
    class Grid extends squared.base.extensions.Grid {
        processNode(node, parent) {
            super.processNode(node, parent);
            const columnCount = this.data.get(node);
            if (columnCount) {
                return {
                    output: this.application.renderNode(
                        LayoutUI$2.create({
                            parent,
                            node,
                            containerType: CONTAINER_NODE.GRID,
                            alignmentType: 128 /* COLUMN */,
                            columnCount,
                        })
                    ),
                    include: true,
                    complete: true,
                };
            }
        }
        processChild(node, parent) {
            var _a;
            const cellData = this.data.get(node);
            if (cellData) {
                const siblings = (_a = cellData.siblings) === null || _a === void 0 ? void 0 : _a.slice(0);
                let layout;
                if (siblings) {
                    const controller = this.controller;
                    const data = Grid.createDataCellAttribute();
                    siblings.unshift(node);
                    layout = controller.processLayoutHorizontal(
                        new LayoutUI$2(
                            parent,
                            controller.createNodeGroup(node, siblings, parent, { delegate: true, cascade: true })
                        )
                    );
                    node = layout.node;
                    for (let i = 0, length = siblings.length; i < length; ++i) {
                        const item = siblings[i];
                        const siblingData = this.data.get(item);
                        if (siblingData) {
                            if (siblingData.cellStart) {
                                data.cellStart = true;
                            }
                            if (siblingData.cellEnd) {
                                data.cellEnd = true;
                            }
                            if (siblingData.rowEnd) {
                                data.rowEnd = true;
                            }
                            if (siblingData.rowStart) {
                                data.rowStart = true;
                            }
                            this.data.delete(item);
                        }
                    }
                    this.data.set(node, data);
                }
                if (cellData.rowSpan > 1) {
                    node.android('layout_rowSpan', cellData.rowSpan.toString());
                }
                if (cellData.columnSpan > 1) {
                    node.android('layout_columnSpan', cellData.columnSpan.toString());
                }
                if (node.display === 'table-cell') {
                    node.mergeGravity('layout_gravity', 'fill');
                }
                if (layout) {
                    return {
                        parent: layout.node,
                        renderAs: layout.node,
                        outputAs: this.application.renderNode(layout),
                    };
                }
            }
        }
        postConstraints(node) {
            const columnCount = this.data.get(node);
            if (columnCount && node.css('borderCollapse') !== 'collapse') {
                let paddingTop = 0,
                    paddingRight = 0,
                    paddingBottom = 0,
                    paddingLeft = 0;
                node.renderEach(item => {
                    const cellData = this.data.get(item);
                    if (cellData) {
                        const parent = item.actualParent;
                        if (parent && !parent.visible) {
                            const marginTop = parent.getBox(1 /* MARGIN_TOP */)[0] === 0 ? parent.marginTop : 0;
                            const marginBottom =
                                parent.getBox(4 /* MARGIN_BOTTOM */)[0] === 0 ? parent.marginBottom : 0;
                            if (cellData.cellStart) {
                                paddingTop = marginTop + parent.paddingTop;
                            }
                            if (cellData.rowStart) {
                                paddingLeft = Math.max(parent.marginLeft + parent.paddingLeft, paddingLeft);
                            }
                            if (cellData.rowEnd) {
                                const heightBottom =
                                    marginBottom +
                                    parent.paddingBottom +
                                    (cellData.cellEnd ? 0 : marginTop + parent.paddingTop);
                                if (heightBottom > 0) {
                                    if (cellData.cellEnd) {
                                        paddingBottom = heightBottom;
                                    } else {
                                        const controller = this.controller;
                                        controller.addAfterOutsideTemplate(
                                            item,
                                            controller.renderSpace({
                                                width: 'match_parent',
                                                height: `@dimen/${Resource.insertStoredAsset(
                                                    'dimens',
                                                    node.controlId + '_grid_space',
                                                    formatPX$5(heightBottom)
                                                )}`,
                                                columnSpan: columnCount,
                                                android: {},
                                            }),
                                            false
                                        );
                                    }
                                }
                                paddingRight = Math.max(parent.marginRight + parent.paddingRight, paddingRight);
                            }
                        }
                    }
                });
                const boxAdjustment = node.boxAdjustment;
                boxAdjustment[4] += paddingTop;
                boxAdjustment[5] += paddingRight;
                boxAdjustment[6] += paddingBottom;
                boxAdjustment[7] += paddingLeft;
            }
            if (!node.hasWidth) {
                let maxRight = -Infinity;
                node.renderEach(item => {
                    if (item.inlineFlow || !item.blockStatic) {
                        maxRight = Math.max(maxRight, item.linear.right);
                    }
                });
                if (withinRange$2(node.box.right, maxRight)) {
                    node.setLayoutWidth('wrap_content');
                }
            }
        }
    }

    var LayoutUI$3 = squared.base.LayoutUI;
    const { formatPX: formatPX$6 } = squared.lib.css;
    class List extends squared.base.extensions.List {
        constructor() {
            super(...arguments);
            this.options = {
                ordinalFontSizeAdjust: 0.75,
            };
        }
        processNode(node, parent) {
            const layout = new LayoutUI$3(parent, node);
            if (layout.linearY) {
                layout.rowCount = node.size();
                layout.columnCount = node.find(item => item.css('listStylePosition') === 'inside') ? 3 : 2;
                layout.setContainerType(CONTAINER_NODE.GRID, 8 /* VERTICAL */);
            } else if (layout.linearX || layout.singleRowAligned) {
                layout.rowCount = 1;
                layout.columnCount = layout.size();
                layout.setContainerType(CONTAINER_NODE.LINEAR, 4 /* HORIZONTAL */);
            } else {
                return;
            }
            super.processNode(node, parent);
            return {
                output: this.application.renderNode(layout),
                complete: true,
                include: true,
            };
        }
        processChild(node, parent) {
            var _a;
            const mainData = this.data.get(node);
            if (mainData) {
                const application = this.application;
                const controller = this.controller;
                const marginTop = node.marginTop;
                let value = mainData.ordinal,
                    minWidth = node.marginLeft,
                    marginLeft = 0,
                    columnCount = 0,
                    adjustPadding,
                    container;
                if (parent.layoutGrid) {
                    columnCount = parseInt(parent.android('columnCount')) || 1;
                    adjustPadding = true;
                } else if (parent.firstStaticChild === node) {
                    adjustPadding = true;
                }
                if (adjustPadding) {
                    minWidth += parent.paddingLeft ? parent.paddingLeft : parent.marginLeft;
                }
                let ordinal =
                        !value &&
                        node.find(
                            item =>
                                item.float === 'left' &&
                                item.marginLeft < 0 &&
                                Math.abs(item.marginLeft) <= item.documentParent.marginLeft
                        ),
                    containerType;
                if (ordinal) {
                    if (columnCount === 3) {
                        node.android('layout_columnSpan', '2');
                    }
                    if (!ordinal.hasWidth) {
                        minWidth += ordinal.marginLeft;
                        if (minWidth > 0) {
                            ordinal.android('minWidth', formatPX$6(minWidth));
                        }
                    }
                    ordinal.parent = parent;
                    ordinal.setControlType(CONTAINER_TAGNAME.TEXT, CONTAINER_NODE.INLINE);
                    ordinal.setBox(8 /* MARGIN_LEFT */, { reset: 1 });
                    ordinal.render(parent);
                    const layout = new LayoutUI$3(parent, ordinal);
                    if (ordinal.inlineText || ordinal.isEmpty()) {
                        layout.containerType = CONTAINER_NODE.TEXT;
                    } else {
                        layout.retainAs(ordinal.children);
                        if (layout.singleRowAligned) {
                            layout.setContainerType(CONTAINER_NODE.RELATIVE, 4 /* HORIZONTAL */);
                        } else {
                            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 1 /* UNKNOWN */);
                        }
                    }
                    application.addLayoutTemplate(parent, ordinal, application.renderNode(layout));
                } else {
                    const { imageSrc, imagePosition } = mainData;
                    let top = 0,
                        left = 0,
                        paddingRight = 0,
                        gravity = 'right',
                        image;
                    if (imageSrc) {
                        const resource = this.resource;
                        if (imagePosition) {
                            ({ top, left } = Resource.getBackgroundPosition(imagePosition, node.actualDimension, {
                                fontSize: node.fontSize,
                                imageDimension: resource.getImage(imageSrc),
                                screenDimension: node.localSettings.screenDimension,
                            }));
                            if (node.marginLeft < 0) {
                                if (adjustPadding) {
                                    const marginOffset =
                                        node.marginLeft + (parent.paddingLeft ? parent.paddingLeft : parent.marginLeft);
                                    if (marginOffset < 0) {
                                        const storedOffset =
                                            (_a = this.data.get(parent)) !== null && _a !== void 0 ? _a : Infinity;
                                        if (marginOffset < storedOffset) {
                                            this.data.set(parent, marginOffset);
                                        }
                                    }
                                }
                            } else {
                                marginLeft = node.marginLeft;
                            }
                            minWidth = node.paddingLeft - left;
                            node.setBox(128 /* PADDING_LEFT */, { reset: 1 });
                            gravity = '';
                        }
                        image = resource.addImageSrc(imageSrc);
                    }
                    if (!image && !value && node.display !== 'list-item') {
                        switch (parent.tagName) {
                            case 'UL':
                            case 'OL':
                            case 'DL':
                                break;
                            default:
                                if (adjustPadding) {
                                    node.modifyBox(8 /* MARGIN_LEFT */, parent.paddingLeft);
                                }
                                node.android('layout_columnSpan', columnCount.toString());
                                return;
                        }
                    }
                    if (node.isEmpty() && !node.outerWrapper) {
                        container = controller.createNodeWrapper(node, parent, {
                            alignmentType: parent.layoutGrid ? 8 /* VERTICAL */ : 0,
                        });
                        containerType =
                            node.baselineElement && node.percentWidth === 0 && !node.css('maxWidth').endsWith('%')
                                ? CONTAINER_NODE.LINEAR
                                : CONTAINER_NODE.CONSTRAINT;
                    } else {
                        container = node.outerMostWrapper;
                    }
                    if (columnCount === 3) {
                        container.android('layout_columnSpan', '2');
                    }
                    const tagName = node.tagName;
                    const options = createViewAttribute();
                    ordinal = application.createNode(node.sessionId, { parent });
                    ordinal.childIndex = node.childIndex;
                    ordinal.containerName = node.containerName + '_ORDINAL';
                    ordinal.inherit(node, 'textStyle');
                    if (value && !/\w/.test(value)) {
                        ordinal.setCacheValue('fontSize', node.fontSize * this.options.ordinalFontSizeAdjust);
                    }
                    if (gravity === 'right') {
                        if (image) {
                            paddingRight = Math.max(minWidth / 6, 4);
                            minWidth -= paddingRight;
                        } else if (value) {
                            value += '&#160;'.repeat(
                                value.length === 1 && node.fontSize <= 24 && tagName !== 'DFN' ? 3 : 2
                            );
                        }
                    }
                    if (tagName === 'DT' && !image) {
                        container.android('layout_columnSpan', columnCount.toString());
                    } else {
                        if (image) {
                            ordinal.setControlType(CONTAINER_TAGNAME.IMAGE, CONTAINER_NODE.IMAGE);
                            Object.assign(options.android, {
                                src: `@drawable/${image}`,
                                scaleType: gravity === 'right' ? 'fitEnd' : 'fitStart',
                                baselineAlignBottom: adjustPadding ? 'true' : '',
                            });
                        } else if (value) {
                            ordinal.textContent = value;
                            ordinal.inlineText = true;
                            ordinal.setControlType(CONTAINER_TAGNAME.TEXT, CONTAINER_NODE.TEXT);
                            if (tagName === 'DFN') {
                                minWidth += 8;
                                ordinal.modifyBox(32 /* PADDING_RIGHT */, 8);
                            }
                        } else {
                            ordinal.setControlType(CONTAINER_TAGNAME.SPACE, CONTAINER_NODE.SPACE);
                            ordinal.renderExclude = false;
                            node.setBox(128 /* PADDING_LEFT */, { reset: 1 });
                        }
                        const { paddingTop, lineHeight } = node;
                        ordinal.cssApply({
                            minWidth: minWidth > 0 ? formatPX$6(minWidth) : '',
                            marginLeft: marginLeft > 0 ? formatPX$6(marginLeft) : '',
                            paddingTop:
                                paddingTop &&
                                node.getBox(16 /* PADDING_TOP */)[0] === 0 &&
                                containerType !== CONTAINER_NODE.LINEAR
                                    ? formatPX$6(paddingTop)
                                    : '',
                            paddingRight: paddingRight ? formatPX$6(paddingRight) : '',
                            lineHeight: lineHeight ? formatPX$6(lineHeight) : '',
                        });
                        ordinal.apply(options);
                        ordinal.modifyBox(128 /* PADDING_LEFT */, 2);
                        ordinal.cssTry('display', 'inline-block', function () {
                            this.setBounds();
                        });
                        ordinal.saveAsInitial();
                        if (gravity !== '') {
                            ordinal.mergeGravity('gravity', node.localizeString(gravity));
                        }
                        if (top !== 0) {
                            ordinal.modifyBox(1 /* MARGIN_TOP */, top);
                        }
                        if (left !== 0) {
                            ordinal.modifyBox(8 /* MARGIN_LEFT */, left);
                        }
                        ordinal.render(parent);
                        application.addLayoutTemplate(parent, ordinal, {
                            type: 1 /* XML */,
                            node: ordinal,
                            controlName: ordinal.controlName,
                        });
                    }
                }
                ordinal.positioned = true;
                const target = container || node.outerMostWrapper;
                if (marginTop !== 0) {
                    ordinal.modifyBox(1 /* MARGIN_TOP */, marginTop);
                }
                if ((ordinal.paddingTop && parent.layoutGrid) || marginTop !== 0) {
                    ordinal.companion = target;
                    this.subscribers.add(ordinal);
                }
                node.setBox(8 /* MARGIN_LEFT */, { reset: 1 });
                if (
                    columnCount &&
                    node.ascend({
                        condition: item => !item.blockStatic && !item.hasWidth,
                        error: item => item.hasWidth,
                        startSelf: node.naturalElement,
                    }).length === 0
                ) {
                    target.setLayoutWidth('0px');
                    target.android('layout_columnWeight', '1');
                }
                if (container) {
                    if (container !== node) {
                        node.resetBox(5 /* MARGIN_VERTICAL */, container);
                    }
                    if (containerType) {
                        return {
                            parent: container,
                            renderAs: container,
                            outputAs: application.renderNode(
                                new LayoutUI$3(parent, container, containerType, 8 /* VERTICAL */ | 1 /* UNKNOWN */)
                            ),
                        };
                    }
                }
            }
        }
        postConstraints(node) {
            if (node.naturalChild) {
                node.setBox(node.paddingLeft ? 128 /* PADDING_LEFT */ : 8 /* MARGIN_LEFT */, { reset: 1 });
                const marginOffset = this.data.get(node) || 0;
                if (marginOffset < 0) {
                    node.modifyBox(8 /* MARGIN_LEFT */, marginOffset);
                }
            } else if (node.getBox(1 /* MARGIN_TOP */)[1] !== 0) {
                const companion = node.companion;
                if (companion) {
                    const [reset, adjustment] = companion.getBox(1 /* MARGIN_TOP */);
                    if (reset === 0) {
                        node.modifyBox(1 /* MARGIN_TOP */, adjustment - node.getBox(1 /* MARGIN_TOP */)[1], false);
                    } else {
                        node.setBox(1 /* MARGIN_TOP */, { adjustment: 0 });
                    }
                }
            }
        }
        postOptimize(node) {
            var _a;
            if (
                ((_a = node.companion) === null || _a === void 0 ? void 0 : _a.android('baselineAlignedChildIndex')) !==
                    '' &&
                node.renderParent.layoutGrid
            ) {
                node.setBox(16 /* PADDING_TOP */, { reset: 1 });
            }
        }
    }

    class Relative extends squared.base.extensions.Relative {
        is(node) {
            if (node.inlineVertical) {
                switch (node.css('verticalAlign')) {
                    case 'sub':
                    case 'super':
                        return true;
                }
            }
            return super.is(node);
        }
    }

    var LayoutUI$4 = squared.base.LayoutUI;
    const {
        APP_SECTION: APP_SECTION$2,
        NODE_PROCEDURE: NODE_PROCEDURE$5,
        NODE_RESOURCE: NODE_RESOURCE$4,
    } = squared.base.lib.constant;
    const { formatPX: formatPX$7 } = squared.lib.css;
    class Sprite extends squared.base.extensions.Sprite {
        processNode(node, parent) {
            const drawable = this.resource.addImageSrc(node.backgroundImage);
            if (drawable !== '') {
                const { image, position } = this.data.get(node);
                const container = this.application.createNode(node.sessionId, { parent, innerWrapped: node });
                container.inherit(node, 'base', 'initial', 'styleMap');
                container.setControlType(CONTAINER_TAGNAME.FRAME, CONTAINER_NODE.FRAME);
                container.exclude({
                    resource: NODE_RESOURCE$4.ASSET,
                    procedure: NODE_PROCEDURE$5.CUSTOMIZATION,
                    section: APP_SECTION$2.ALL,
                });
                node.setControlType(CONTAINER_TAGNAME.IMAGE, CONTAINER_NODE.IMAGE);
                node.resetBox(15 /* MARGIN */);
                node.resetBox(240 /* PADDING */);
                node.registerBox(1 /* MARGIN_TOP */, container);
                node.registerBox(2 /* MARGIN_RIGHT */, container);
                node.registerBox(4 /* MARGIN_BOTTOM */, container);
                node.registerBox(8 /* MARGIN_LEFT */, container);
                node.exclude({
                    resource: NODE_RESOURCE$4.FONT_STYLE | NODE_RESOURCE$4.BOX_STYLE | NODE_RESOURCE$4.BOX_SPACING,
                });
                node.cssApply({
                    position: 'static',
                    top: 'auto',
                    right: 'auto',
                    bottom: 'auto',
                    left: 'auto',
                    display: 'inline-block',
                    width: image.width ? formatPX$7(image.width) : 'auto',
                    height: image.height ? formatPX$7(image.height) : 'auto',
                    borderTopStyle: 'none',
                    borderRightStyle: 'none',
                    borderBottomStyle: 'none',
                    borderLeftStyle: 'none',
                    borderRadius: '0px',
                    backgroundPositionX: '0px',
                    backgroundPositionY: '0px',
                    backgroundColor: 'transparent',
                });
                node.unsetCache();
                node.android('src', `@drawable/${drawable}`);
                node.android('layout_marginTop', formatPX$7(position.top));
                node.android(node.localizeString('layout_marginLeft'), formatPX$7(position.left));
                return {
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new LayoutUI$4(parent, container, CONTAINER_NODE.FRAME, 2048 /* SINGLE */)
                    ),
                    parent: container,
                    complete: true,
                };
            }
        }
    }

    const { convertCamelCase } = squared.lib.util;
    class Substitute extends squared.base.ExtensionUI {
        constructor(name, framework, options) {
            super(name, framework, options);
            this.require({ name: 'android.external' /* EXTERNAL */, leading: true });
        }
        processNode(node, parent) {
            const data = getDataSet(node.dataset, convertCamelCase(this.name, '.'));
            if (data) {
                const controlName = data.tag;
                if (controlName) {
                    node.setControlType(controlName, node.blockStatic ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE);
                    node.render(parent);
                    const tagChild = data.tagChild;
                    if (tagChild) {
                        const name = this.name;
                        node.addAlign(2 /* AUTO_LAYOUT */);
                        node.each(item => {
                            if (item.styleElement) {
                                if (item.pseudoElement && item.textEmpty) {
                                    item.hide({ remove: true });
                                } else {
                                    item.use = name;
                                    item.dataset.androidSubstituteTag = tagChild;
                                }
                            }
                        });
                    }
                    return {
                        output: {
                            type: 1 /* XML */,
                            node,
                            controlName,
                        },
                        include: true,
                    };
                }
            }
        }
        postOptimize(node) {
            node.apply(
                Resource.formatOptions(
                    createViewAttribute(this.options[node.elementId]),
                    this.application.extensionManager.valueAsBoolean(
                        'android.resource.strings' /* RESOURCE_STRINGS */,
                        'numberAsResource'
                    )
                )
            );
        }
    }

    var LayoutUI$5 = squared.base.LayoutUI;
    const { formatPX: formatPX$8 } = squared.lib.css;
    const { truncateTrailingZero } = squared.lib.math;
    function setLayoutHeight(node) {
        if (
            node.hasPX('height') &&
            node.height + node.contentBoxHeight < Math.floor(node.bounds.height) &&
            node.css('verticalAlign') !== 'top'
        ) {
            node.setLayoutHeight('wrap_content');
        }
    }
    class Table extends squared.base.extensions.Table {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = this.data.get(node);
            let requireWidth, multiline;
            if (mainData.columnCount > 1) {
                requireWidth = mainData.expand;
                node.each(item => {
                    const cellData = this.data.get(item);
                    if (cellData) {
                        if (cellData.flexible) {
                            item.android('layout_columnWeight', cellData.colSpan.toString());
                            item.setLayoutWidth('0px');
                            requireWidth = true;
                        } else {
                            if (cellData.expand === false) {
                                item.android('layout_columnWeight', '0');
                            } else if (cellData.percent) {
                                const value = parseFloat(cellData.percent) / 100;
                                if (value) {
                                    item.setLayoutWidth('0px');
                                    item.android('layout_columnWeight', truncateTrailingZero(value.toPrecision(3)));
                                    requireWidth = true;
                                }
                            }
                            if (cellData.downsized) {
                                if (cellData.exceed) {
                                    item.setLayoutWidth('0px');
                                    item.android('layout_columnWeight', '0.01');
                                    requireWidth = true;
                                } else if (item.hasPX('width')) {
                                    const width = item.bounds.width;
                                    if (item.actualWidth < width) {
                                        item.setLayoutWidth(formatPX$8(width));
                                    }
                                }
                            }
                        }
                    }
                    if (
                        item.tagName === 'TD' &&
                        item.textElement &&
                        !item.multiline &&
                        !/[\s\n-]/.test(item.textContent.trim())
                    ) {
                        item.android('maxLines', '1');
                    }
                    setLayoutHeight(item);
                });
            } else {
                const item = node.item(0);
                if (item) {
                    if (item.percentWidth && !node.hasWidth) {
                        item.setLayoutWidth('wrap_content');
                        requireWidth = true;
                    }
                    if (
                        item.tagName !== 'CAPTION' &&
                        (item.multiline ||
                            item.find(child => child.multiline || child.contentAltered, { cascade: true }))
                    ) {
                        multiline = true;
                        requireWidth = true;
                    }
                    setLayoutHeight(item);
                }
            }
            if (node.hasWidth) {
                if (node.width < Math.floor(node.bounds.width)) {
                    if (mainData.layoutFixed) {
                        node.android('width', formatPX$8(node.bounds.width));
                    } else {
                        if (!node.hasPX('minWidth')) {
                            node.android('minWidth', formatPX$8(node.actualWidth));
                        }
                        node.css('width', 'auto');
                    }
                }
            } else if (requireWidth) {
                if (
                    (parent.blockStatic || parent.hasWidth) &&
                    (multiline || Math.ceil(node.bounds.width) >= parent.box.width)
                ) {
                    node.setLayoutWidth('match_parent');
                } else {
                    node.css('width', formatPX$8(node.actualWidth));
                }
            }
            if (node.hasHeight && node.height < Math.floor(node.bounds.height)) {
                if (!node.hasPX('minHeight')) {
                    node.android('minHeight', formatPX$8(node.actualHeight));
                }
                node.css('height', 'auto');
            }
            return {
                output: this.application.renderNode(
                    LayoutUI$5.create({
                        parent,
                        node,
                        containerType: CONTAINER_NODE.GRID,
                        alignmentType: 2 /* AUTO_LAYOUT */,
                        rowCount: mainData.rowCount,
                        columnCount: mainData.columnCount,
                    })
                ),
                include: true,
                complete: true,
            };
        }
        processChild(node, parent) {
            const cellData = this.data.get(node);
            if (cellData) {
                if (cellData.rowSpan > 1) {
                    node.android('layout_rowSpan', cellData.rowSpan.toString());
                }
                if (cellData.colSpan > 1) {
                    node.android('layout_columnSpan', cellData.colSpan.toString());
                }
                if (cellData.spaceSpan) {
                    const controller = this.controller;
                    controller.addAfterOutsideTemplate(
                        node,
                        controller.renderSpace({
                            width: 'wrap_content',
                            height: 'wrap_content',
                            columnSpan: cellData.spaceSpan,
                            android: {},
                        }),
                        false
                    );
                }
                node.mergeGravity('layout_gravity', 'fill');
                if (parent.css('emptyCells') === 'hide' && node.textEmpty) {
                    node.hide({ hidden: true });
                }
            }
        }
        postOptimize(node) {
            const layoutWidth = parseInt(node.layoutWidth);
            if (layoutWidth) {
                if (node.bounds.width > layoutWidth) {
                    node.setLayoutWidth(formatPX$8(node.bounds.width));
                }
                if (node.cssInitial('width') === 'auto' && node.every(item => item.inlineWidth)) {
                    node.renderEach(item => {
                        item.setLayoutWidth('0px');
                        item.android('layout_columnWeight', '1');
                    });
                }
            }
        }
    }

    class WhiteSpace extends squared.base.extensions.WhiteSpace {}

    var LayoutUI$6 = squared.base.LayoutUI;
    var CssGrid$1 = squared.base.extensions.CssGrid;
    const { NODE_RESOURCE: NODE_RESOURCE$5 } = squared.base.lib.constant;
    const { isLength: isLength$3 } = squared.lib.css;
    const hasVisibleWidth = node =>
        (!node.blockStatic && !node.hasPX('width')) ||
        (node.has('width', { type: 1 /* LENGTH */ | 2 /* PERCENT */, not: '100%' }) &&
            node.css('minWidth') !== '100%') ||
        node.has('maxWidth', { type: 1 /* LENGTH */ | 2 /* PERCENT */, not: '100%' });
    const hasFullHeight = node => node.css('height') === '100%' || node.css('minHeight') === '100%';
    const hasMargin = node =>
        node.marginTop > 0 || node.marginRight > 0 || node.marginBottom > 0 || node.marginLeft > 0;
    const isParentVisible = (node, parent) =>
        parent.visibleStyle.background && (hasVisibleWidth(node) || !hasFullHeight(parent) || !hasFullHeight(node));
    const isParentTransfer = parent =>
        parent.tagName === 'HTML' && (parent.contentBoxWidth > 0 || parent.contentBoxHeight > 0 || hasMargin(parent));
    const isBackgroundSeparate = (
        node,
        parent,
        backgroundColor,
        backgroundImage,
        backgroundRepeatX,
        backgroundRepeatY,
        borderWidth
    ) =>
        backgroundColor &&
        backgroundImage &&
        ((!backgroundRepeatY && node.has('backgroundPositionY')) ||
            (borderWidth &&
                (!backgroundRepeatX || !backgroundRepeatY) &&
                (hasVisibleWidth(node) || !hasFullHeight(parent) || !hasFullHeight(node))) ||
            node.css('backgroundAttachment') === 'fixed');
    class Background extends squared.base.ExtensionUI {
        is(node) {
            return node.documentBody;
        }
        condition(node, parent) {
            const {
                backgroundColor,
                backgroundImage,
                backgroundRepeatX,
                backgroundRepeatY,
                borderWidth,
            } = node.visibleStyle;
            return (
                ((backgroundColor || backgroundImage) &&
                    !isParentVisible(node, parent) &&
                    (borderWidth ||
                        (node.gridElement && (CssGrid$1.isJustified(node) || CssGrid$1.isAligned(node))))) ||
                isBackgroundSeparate(
                    node,
                    parent,
                    backgroundColor,
                    backgroundImage,
                    backgroundRepeatX,
                    backgroundRepeatY,
                    borderWidth
                ) ||
                (backgroundImage && hasMargin(node)) ||
                isParentTransfer(parent)
            );
        }
        processNode(node, parent) {
            const controller = this.controller;
            const { backgroundColor, backgroundImage, visibleStyle } = node;
            const backgroundSeparate = isBackgroundSeparate(
                node,
                parent,
                visibleStyle.backgroundColor,
                visibleStyle.backgroundImage,
                visibleStyle.backgroundRepeatX,
                visibleStyle.backgroundRepeatY,
                visibleStyle.borderWidth
            );
            const hasHeight = node.hasHeight || node.actualParent.hasHeight;
            const parentVisible = isParentVisible(node, parent);
            const fixed = node.css('backgroundAttachment') === 'fixed';
            let renderParent = parent,
                container,
                parentAs;
            if (backgroundColor !== '') {
                if (
                    !(
                        visibleStyle.backgroundImage &&
                        visibleStyle.backgroundRepeatX &&
                        visibleStyle.backgroundRepeatY
                    ) ||
                    /\.(gif|png)"?\)$/i.test(backgroundImage)
                ) {
                    container = controller.createNodeWrapper(node, renderParent, {
                        alignmentType: 8 /* VERTICAL */,
                        resource:
                            NODE_RESOURCE$5.BOX_SPACING | NODE_RESOURCE$5.FONT_STYLE | NODE_RESOURCE$5.VALUE_STRING,
                    });
                    container.css('backgroundColor', backgroundColor);
                    container.setCacheValue('backgroundColor', backgroundColor);
                    if (!parentVisible) {
                        container.setLayoutWidth('match_parent');
                        container.setLayoutHeight('match_parent');
                    } else if (!hasVisibleWidth(node)) {
                        container.setLayoutWidth('match_parent');
                    }
                    container.unsetCache('visibleStyle');
                }
                node.css('backgroundColor', 'transparent');
                node.setCacheValue('backgroundColor', '');
                visibleStyle.backgroundColor = false;
            }
            if (
                backgroundImage !== '' &&
                (parentVisible ||
                    backgroundSeparate ||
                    visibleStyle.backgroundRepeatY ||
                    parent.visibleStyle.background ||
                    hasMargin(node))
            ) {
                if (container) {
                    if (backgroundSeparate || fixed) {
                        container.setControlType(
                            View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api),
                            CONTAINER_NODE.CONSTRAINT
                        );
                        container.addAlign(8 /* VERTICAL */);
                        container.render(renderParent);
                        this.application.addLayoutTemplate(renderParent, container, {
                            type: 1 /* XML */,
                            node: container,
                            controlName: container.controlName,
                        });
                        parentAs = container;
                        renderParent = container;
                        container = controller.createNodeWrapper(node, parentAs, {
                            alignmentType: 8 /* VERTICAL */,
                            resource: NODE_RESOURCE$5.BOX_SPACING,
                        });
                    }
                } else {
                    container = controller.createNodeWrapper(node, renderParent, {
                        alignmentType: 8 /* VERTICAL */,
                        resource:
                            NODE_RESOURCE$5.BOX_SPACING | NODE_RESOURCE$5.FONT_STYLE | NODE_RESOURCE$5.VALUE_STRING,
                    });
                }
                container.setLayoutWidth('match_parent');
                const height = parent.cssInitial('height');
                const minHeight = parent.cssInitial('minHeight');
                let backgroundSize = node.css('backgroundSize');
                if (height === '' && minHeight === '') {
                    container.setLayoutHeight(
                        !parentVisible &&
                            (fixed ||
                                (!(backgroundSeparate && hasHeight) &&
                                    (visibleStyle.backgroundRepeatY ||
                                        node.has('backgroundSize') ||
                                        node
                                            .css('backgroundPosition')
                                            .split(' ')
                                            .some(value => isLength$3(value) && parseInt(value) > 0))))
                            ? 'match_parent'
                            : 'wrap_content'
                    );
                } else {
                    if (height !== '100%' && minHeight !== '100%') {
                        const offsetHeight = parent.toElementInt('offsetHeight');
                        if (offsetHeight < window.innerHeight) {
                            backgroundSize = `auto ${offsetHeight}px`;
                        }
                    }
                    container.setLayoutHeight('match_parent');
                }
                container.cssApply({
                    backgroundImage,
                    backgroundSize,
                    border: '0px none solid',
                    borderRadius: '0px',
                });
                container.cssApply(
                    node.cssAsObject('backgroundRepeat', 'backgroundPositionX', 'backgroundPositionY', 'backgroundClip')
                );
                container.setCacheValue('backgroundImage', backgroundImage);
                container.unsetCache('visibleStyle');
                if (fixed) {
                    container.android('scrollbars', 'vertical');
                }
                node.css('backgroundImage', 'none');
                node.setCacheValue('backgroundImage', '');
                visibleStyle.backgroundImage = false;
                visibleStyle.backgroundRepeatX = false;
                visibleStyle.backgroundRepeatY = false;
            }
            if (isParentTransfer(parent)) {
                container ||
                    (container = controller.createNodeWrapper(node, renderParent, { alignmentType: 8 /* VERTICAL */ }));
                container.unsafe('excludeResource', NODE_RESOURCE$5.FONT_STYLE | NODE_RESOURCE$5.VALUE_STRING);
                parent.resetBox(15 /* MARGIN */, container);
                parent.resetBox(240 /* PADDING */, container);
                container.setLayoutWidth('match_parent', false);
                container.setLayoutHeight('wrap_content', false);
            }
            if (container) {
                visibleStyle.background =
                    visibleStyle.borderWidth || visibleStyle.backgroundImage || visibleStyle.backgroundColor;
                return {
                    parent: container,
                    parentAs,
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new LayoutUI$6(parentAs || parent, container, CONTAINER_NODE.CONSTRAINT, 8 /* VERTICAL */)
                    ),
                    remove: true,
                };
            }
            return { remove: true };
        }
    }

    var LayoutUI$7 = squared.base.LayoutUI;
    class MaxWidthHeight extends squared.base.ExtensionUI {
        is(node) {
            return !node.support.maxDimension && !node.inputElement && !node.controlElement;
        }
        condition(node, parent) {
            const maxWidth =
                node.hasPX('maxWidth') &&
                !parent.layoutConstraint &&
                !parent.layoutElement &&
                (parent.layoutVertical ||
                    parent.layoutFrame ||
                    node.blockStatic ||
                    (node.onlyChild && (parent.blockStatic || parent.hasWidth)));
            const maxHeight =
                node.hasPX('maxHeight') && (parent.hasHeight || parent.gridElement || parent.tableElement);
            if (maxWidth || maxHeight) {
                this.data.set(node, { maxWidth, maxHeight });
                return true;
            }
            return false;
        }
        processNode(node, parent) {
            const { maxWidth, maxHeight } = this.data.get(node);
            const container = this.controller.createNodeWrapper(node, parent, {
                containerType: CONTAINER_NODE.CONSTRAINT,
                alignmentType: 32 /* BLOCK */ | 8 /* VERTICAL */,
                resetMargin: true,
            });
            if (maxWidth) {
                node.setLayoutWidth('0px');
                container.setLayoutWidth('match_parent');
                if (parent.layoutElement) {
                    const autoMargin = node.autoMargin;
                    autoMargin.horizontal = false;
                    autoMargin.left = false;
                    autoMargin.right = false;
                    autoMargin.leftRight = false;
                }
            }
            if (maxHeight) {
                node.setLayoutHeight('0px');
                container.setLayoutHeight('match_parent');
                if (parent.layoutElement) {
                    const autoMargin = node.autoMargin;
                    autoMargin.vertical = false;
                    autoMargin.top = false;
                    autoMargin.bottom = false;
                    autoMargin.topBottom = false;
                    if (!maxHeight && node.blockStatic && !node.hasWidth) {
                        node.setLayoutWidth('match_parent', false);
                    }
                }
            }
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(
                    new LayoutUI$7(parent, container, container.containerType, 2048 /* SINGLE */)
                ),
            };
        }
    }

    const { APP_SECTION: APP_SECTION$3, NODE_RESOURCE: NODE_RESOURCE$6 } = squared.base.lib.constant;
    const { getTextMetrics } = squared.lib.dom;
    const REGEXP_WORD = /(?:[^\w\s\n]+[\s\n]+|(?:&#?[A-Za-z0-9]{2};[^\w]*|[^\w]+|\b)*\w+?(?:'[A-Za-z]\s*|[^\w]*&#?[A-Za-z0-9]{2};|[^\w]+|\b))/g;
    function getFontMeasureAdjust(node) {
        const value = node.dataset.androidFontMeasureAdjust;
        return value === 'false' ? Infinity : value ? parseFloat(value) : NaN;
    }
    function setContentAltered(node, visible) {
        if (!visible) {
            node.hide();
        }
        node.exclude({ resource: NODE_RESOURCE$6.VALUE_STRING });
        node.multiline = false;
        node.contentAltered = true;
    }
    function isTextElement(node) {
        if (!node.visible || node.textEmpty || node.contentAltered) {
            return false;
        } else if (node.plainText) {
            return true;
        }
        const wrapperOf = node.wrapperOf;
        if (wrapperOf) {
            node = wrapperOf;
        }
        return node.textElement && !(node.tagName === 'LABEL' && node.toElementString('htmlFor') !== '');
    }
    const checkBreakable = (node, checkMargin) =>
        node.plainText ||
        (node.naturalChild &&
            node.naturalElements.length === 0 &&
            !node.floating &&
            !node.innerAfter &&
            !node.innerBefore &&
            node.isUnstyled(checkMargin));
    const hasTextIndent = node => node.textElement && node.textIndent < 0 && node.naturalElement && !node.floating;
    class Multiline extends squared.base.ExtensionUI {
        is(node) {
            return !node.preserveWhiteSpace;
        }
        condition(node, parent) {
            var _a, _b, _c;
            if (node.naturalElements.length === 0) {
                if (parent.layoutHorizontal && parent.layoutRelative) {
                    if (
                        (node.multiline ||
                            (node.textElement &&
                                (parent.contentAltered ||
                                    ((_a = node.previousSibling) === null || _a === void 0 ? void 0 : _a.multiline) ||
                                    ((_b = node.nextSibling) === null || _b === void 0 ? void 0 : _b.multiline)))) &&
                        checkBreakable(node)
                    ) {
                        return true;
                    }
                } else if (parent.layoutVertical && hasTextIndent(node)) {
                    this.data.set(node, [[1, node]]);
                    return true;
                }
            }
            const length = node.size();
            if (length) {
                const children = node.children;
                if (node.has('columnWidth') || node.has('columnCount')) {
                    const columnCount = node.toInt('columnCount', Infinity);
                    const columnWidth = node.parseWidth(node.css('columnWidth'));
                    const columnGap = node.parseWidth(node.css('columnGap'));
                    const minCount = columnWidth
                        ? Math.min(Math.floor(node.box.width / (columnWidth + columnGap)), columnCount)
                        : columnCount;
                    if (minCount !== Infinity) {
                        let remaining = minCount - length;
                        if (remaining > 0) {
                            const nodes = [];
                            const breakable = children
                                .filter(
                                    child =>
                                        isTextElement(child) &&
                                        checkBreakable(child, false) &&
                                        child.css('columnSpan') !== 'all'
                                )
                                .sort((a, b) => b.textContent.length - a.textContent.length);
                            const q = breakable.length;
                            const maxCount = Math.ceil(q / remaining);
                            for (let i = 0; i < q; ++i) {
                                const item = breakable[i];
                                const range = document.createRange();
                                range.selectNodeContents(item.element);
                                const clientRects = range.getClientRects();
                                let columns = -1,
                                    previousLeft = -Infinity;
                                for (let j = 0, r = clientRects.length; j < r; ++j) {
                                    const { left, right } = clientRects.item(j);
                                    if (Math.floor(left) >= previousLeft) {
                                        ++columns;
                                    }
                                    previousLeft = Math.ceil(right);
                                }
                                if (columns > maxCount) {
                                    columns = maxCount;
                                }
                                if (columns > 0 && remaining - columns >= 0) {
                                    nodes.push([columns + 1, item]);
                                    remaining -= columns;
                                    if (remaining === 0) {
                                        break;
                                    }
                                }
                            }
                            if (nodes.length) {
                                this.data.set(node, nodes);
                                return true;
                            }
                        }
                    }
                    return false;
                }
                const nodes = [];
                const checkWidth =
                    node.blockStatic && !node.hasPX('width', { percent: false }) && node.tagName !== 'LEGEND';
                let textWidth = 0,
                    textHeight = 0,
                    floatHeight = 0,
                    leading,
                    valid,
                    j = 0,
                    k = 0,
                    l = 0,
                    m = 0,
                    n = 0;
                for (let i = 0; i < length; ++i) {
                    const child = children[i];
                    if (!child.inlineFlow) {
                        if (i < length - 1) {
                            return false;
                        }
                    } else {
                        if (child.floating) {
                            floatHeight = Math.max(child.linear.height, floatHeight);
                        } else if (
                            isTextElement(child) &&
                            !(
                                (child.lineBreakLeading && (i === length - 1 || child.lineBreakTrailing)) ||
                                (i === 0 && child.lineBreakTrailing)
                            )
                        ) {
                            if (checkBreakable(child) && !child.preserveWhiteSpace) {
                                if (valid === undefined) {
                                    valid = !!(node.firstLineStyle || node.textAlignLast);
                                }
                                if (child.multiline) {
                                    ++j;
                                    nodes.push([1, child]);
                                } else if (j + k++ || valid) {
                                    nodes.push([1, child]);
                                } else {
                                    leading = child;
                                }
                                if (child.styleElement) {
                                    ++m;
                                } else {
                                    ++n;
                                }
                                textHeight += child.bounds.height;
                            }
                            ++l;
                        }
                        if (checkWidth) {
                            textWidth += child.textWidth;
                        }
                    }
                }
                if (
                    (j > 0 && (k > 0 || l > 1 || valid || (floatHeight && textHeight > floatHeight))) ||
                    (checkWidth && j + k > 1 && Math.floor(textWidth) > Math.ceil(node.actualBoxWidth())) ||
                    ((k > 1 || (m && n > 1)) &&
                        (valid || ((_c = node.textBounds) === null || _c === void 0 ? void 0 : _c.numberOfLines) > 1))
                ) {
                    if (leading) {
                        nodes.unshift([1, leading]);
                    }
                    this.data.set(node, nodes);
                    return true;
                }
            } else if ((node.textElement && node.firstLineStyle) || (node.multiline && node.textAlignLast !== '')) {
                this.data.set(node, [[NaN, node]]);
                return true;
            }
            return false;
        }
        processNode(node, parent) {
            let fontAdjust = getFontMeasureAdjust(node);
            if (fontAdjust === Infinity) {
                return;
            }
            const application = this.application;
            if (isNaN(fontAdjust)) {
                fontAdjust = application.userSettings.fontMeasureAdjust;
            }
            const mainData = this.data.get(node);
            const parentContainer = mainData ? node : parent;
            const { children, sessionId } = parentContainer;
            const breakable = mainData || [[1, node]];
            let modified, partition;
            for (let i = 0, length = breakable.length; i < length; ++i) {
                const [columns, seg] = breakable[i];
                const element = seg.element;
                partition = columns > 1;
                let adjustment = fontAdjust,
                    textContent,
                    wrapperContainer;
                if (seg.naturalElement) {
                    textContent = this.resource.removeExcludedFromText(seg, element);
                    const value = getFontMeasureAdjust(seg);
                    if (value === Infinity) {
                        continue;
                    } else if (!isNaN(value)) {
                        adjustment = value;
                    }
                } else {
                    textContent = seg.textContent;
                }
                const words = [];
                let match;
                while ((match = REGEXP_WORD.exec(textContent))) {
                    words.push(match[0]);
                }
                REGEXP_WORD.lastIndex = 0;
                if (partition && words.length <= 1) {
                    (wrapperContainer || (wrapperContainer = [])).push(seg);
                } else {
                    const q = words.length;
                    if (q > 1) {
                        const { fontSize, lineHeight, naturalElement, elementData } = seg;
                        const depth = seg.depth + (seg === node ? 1 : 0);
                        const fontFamily = seg.textStyle.fontFamily;
                        const styleMap = Object.assign({}, seg.unsafe('styleMap'));
                        if ('lineHeight' in styleMap) {
                            delete styleMap.lineHeight;
                        }
                        const initialData = Object.freeze({ styleMap });
                        const cssData = Object.assign(
                            {
                                position: 'static',
                                display: partition ? seg.display : 'inline',
                                verticalAlign: 'baseline',
                            },
                            seg.textStyle
                        );
                        const bounds = (!seg.hasPX('width') && seg.textBounds) || seg.bounds;
                        const boxRect = {
                            top: bounds.top,
                            right: bounds.right,
                            bottom: bounds.bottom,
                            left: bounds.left,
                            height: Math.floor(seg.bounds.height / (bounds.numberOfLines || 1)),
                        };
                        const createContainer = (tagName, value) => {
                            const container = application.createNode(sessionId, { parent: parentContainer });
                            container.init(parentContainer, depth);
                            container.naturalChild = false;
                            container.inlineText = true;
                            container.renderExclude = false;
                            container.contentAltered = true;
                            container.textContent = value;
                            container.actualParent = parentContainer;
                            container.unsafe('element', element);
                            container.unsafe('initial', initialData);
                            container.unsafe('elementData', elementData);
                            container.setCacheState('naturalElement', naturalElement && !isNaN(columns));
                            container.setCacheValue('tagName', tagName);
                            container.setCacheValue('fontSize', fontSize);
                            container.setCacheValue('lineHeight', lineHeight);
                            container.cssApply(cssData);
                            const textBounds = Object.assign(Object.assign({}, boxRect), {
                                width: getTextMetrics(value, fontSize, fontFamily).width + value.length * adjustment,
                            });
                            container.textBounds = textBounds;
                            container.unsafe('bounds', textBounds);
                            container.setControlType(CONTAINER_TAGNAME.TEXT, CONTAINER_NODE.TEXT);
                            container.exclude({
                                resource: NODE_RESOURCE$6.BOX_STYLE,
                                section: APP_SECTION$3.DOM_TRAVERSE | APP_SECTION$3.EXTENSION,
                            });
                            return container;
                        };
                        let previous;
                        if (partition) {
                            const { marginLeft, marginRight } = seg;
                            for (let j = 0, k = 0, l = q, r; j < columns; ++j, l -= r, k += r) {
                                r = j === columns - 1 ? l : Math.floor(q / columns);
                                const container = createContainer(seg.tagName, concatString(words.slice(k, k + r)));
                                container.multiline = true;
                                if (j === 0) {
                                    container.siblingsLeading = seg.siblingsLeading;
                                    container.lineBreakLeading = seg.lineBreakLeading;
                                    container.textIndent = seg.textIndent;
                                    container.setCacheValue('marginTop', seg.marginTop);
                                    seg.registerBox(1 /* MARGIN_TOP */, container);
                                } else {
                                    previous.siblingsTrailing = [container];
                                    container.siblingsLeading = [previous];
                                }
                                if (j === q - 1) {
                                    container.siblingsTrailing = seg.siblingsTrailing;
                                    container.lineBreakTrailing = seg.lineBreakTrailing;
                                    container.setCacheValue('marginBottom', seg.marginBottom);
                                    seg.registerBox(4 /* MARGIN_BOTTOM */, container);
                                }
                                container.setCacheValue('marginLeft', marginLeft);
                                container.setCacheValue('marginRight', marginRight);
                                (wrapperContainer || (wrapperContainer = [])).push(container);
                                previous = container;
                            }
                        } else {
                            const items = mainData ? new Array(q) : null;
                            for (let j = 0; j < q; ++j) {
                                const container = createContainer('#text', words[j]);
                                if (items) {
                                    items[j] = container;
                                } else {
                                    container.render(parentContainer);
                                    application.addLayoutTemplate(parentContainer, container, {
                                        type: 1 /* XML */,
                                        node: container,
                                        controlName: CONTAINER_TAGNAME.TEXT,
                                    });
                                }
                                if (j === 0) {
                                    if (seg !== node || !mainData) {
                                        container.setCacheValue('marginLeft', seg.marginLeft);
                                        container.siblingsLeading = seg.siblingsLeading;
                                        container.lineBreakLeading = seg.lineBreakLeading;
                                        container.textIndent = seg.textIndent;
                                        seg.registerBox(1 /* MARGIN_TOP */, container);
                                    } else {
                                        container.siblingsLeading = [];
                                    }
                                } else {
                                    previous.siblingsTrailing = [container];
                                    container.siblingsLeading = [previous];
                                }
                                if (j === q - 1) {
                                    if (seg !== node || !mainData) {
                                        container.setCacheValue('marginRight', seg.marginRight);
                                        container.siblingsTrailing = seg.siblingsTrailing;
                                        container.lineBreakTrailing = seg.lineBreakTrailing;
                                        seg.registerBox(4 /* MARGIN_BOTTOM */, container);
                                    } else {
                                        container.siblingsTrailing = [];
                                    }
                                }
                                previous = container;
                            }
                            if (items) {
                                if (seg === node) {
                                    node.each(item => item.hide());
                                    node.retainAs(items);
                                } else {
                                    const index = children.findIndex(item => item === seg);
                                    if (index === -1) {
                                        continue;
                                    }
                                    children.splice(index, 1, ...items);
                                    seg.hide();
                                }
                            } else {
                                setContentAltered(seg, false);
                            }
                            modified = true;
                        }
                    }
                }
                if (wrapperContainer) {
                    const index = children.findIndex(item => item === seg);
                    if (index !== -1) {
                        children.splice(index, 1, ...wrapperContainer);
                        seg.hide();
                    }
                }
            }
            if (modified) {
                setContentAltered(parentContainer, true);
                if (mainData) {
                    if (!partition) {
                        parentContainer.setControlType(
                            View.getControlName(CONTAINER_NODE.RELATIVE),
                            CONTAINER_NODE.RELATIVE
                        );
                        parentContainer.alignmentType = 4 /* HORIZONTAL */;
                        if (hasTextIndent(node) || isNaN(breakable[0][0])) {
                            application.getProcessingCache(sessionId).afterAdd(parentContainer, true, true);
                        }
                    }
                } else {
                    return { next: true };
                }
            }
        }
        beforeParseDocument() {
            this.enabled = this.application.userSettings.fontMeasureWrap === true;
        }
    }

    var LayoutUI$8 = squared.base.LayoutUI;
    class NegativeX extends squared.base.ExtensionUI {
        is(node) {
            return !node.isEmpty() && node.css('overflowX') !== 'hidden' && !node.rootElement;
        }
        condition(node) {
            const children = node.children.filter(item => {
                return item.pageFlow
                    ? item.marginLeft < 0 &&
                          item === node.firstStaticChild &&
                          Math.abs(item.marginLeft) <= node.marginLeft + node.paddingLeft &&
                          item.inlineFlow &&
                          !item.centerAligned &&
                          !item.rightAligned &&
                          !node.floatContainer
                    : item.leftTopAxis && (item.left < 0 || (!item.hasPX('left') && item.right < 0));
            });
            if (children.length) {
                this.data.set(node, { children, offsetLeft: node.marginLeft + node.paddingLeft });
                return true;
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = this.data.get(node);
            const children = mainData.children;
            const container = this.controller.createNodeWrapper(node, parent, {
                children,
                containerType: CONTAINER_NODE.CONSTRAINT,
                alignmentType: 8 /* VERTICAL */,
            });
            let left = NaN,
                right = NaN;
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i];
                const linear = item.linear;
                if (item.pageFlow) {
                    if (isNaN(left) || linear.left < left) {
                        left = linear.left;
                    }
                    mainData.firstChild = item;
                } else if (item.hasPX('left')) {
                    if (item.left < 0 && (isNaN(left) || linear.left < left)) {
                        left = linear.left;
                    }
                } else if (item.right < 0 && (isNaN(right) || linear.right > right)) {
                    right = linear.right;
                }
            }
            if (!node.pageFlow) {
                if (!isNaN(left) && !node.has('left')) {
                    const offset = node.linear.left - left;
                    if (offset > 0) {
                        node.modifyBox(8 /* MARGIN_LEFT */, offset);
                    }
                }
                if (!isNaN(right) && !node.has('right')) {
                    const offset = right - node.linear.right;
                    if (offset > 0) {
                        node.modifyBox(2 /* MARGIN_RIGHT */, offset);
                    }
                }
            } else if (node.hasPX('width', { percent: false })) {
                container.setLayoutWidth('wrap_content');
            } else if (node.hasPX('width')) {
                container.css('width', node.css('width'), true);
                node.setLayoutWidth('0px');
            }
            node.resetBox(1 /* MARGIN_TOP */ | 4 /* MARGIN_BOTTOM */, container);
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(
                    new LayoutUI$8(parent, container, container.containerType, 4 /* HORIZONTAL */ | 2048 /* SINGLE */)
                ),
                subscribe: true,
            };
        }
        postBaseLayout(node) {
            const mainData = this.data.get(node);
            if (mainData) {
                let firstChild = mainData.firstChild;
                if (firstChild) {
                    firstChild = firstChild.ascend({ excluding: node, attr: 'outerWrapper' }).pop() || firstChild;
                    firstChild.anchor('left', 'parent');
                    firstChild.anchorStyle('horizontal', 0);
                    firstChild.anchorParent('vertical', 0);
                    firstChild.modifyBox(8 /* MARGIN_LEFT */, mainData.offsetLeft);
                    firstChild.setConstraintDimension();
                    firstChild.positioned = true;
                }
                for (const item of mainData.children) {
                    if (item === firstChild) {
                        continue;
                    }
                    if (item.hasPX('left')) {
                        item.translateX(item.left);
                        item.alignSibling('left', node.documentId);
                        item.constraint.horizontal = true;
                    } else if (item.hasPX('right')) {
                        item.translateX(-item.right);
                        item.alignSibling('right', node.documentId);
                        item.constraint.horizontal = true;
                    }
                }
                node.anchorParent('horizontal', 0);
                node.anchorParent('vertical', 0);
                node.setConstraintDimension();
                node.positioned = true;
            }
        }
        beforeDocumentWrite() {
            for (const node of this.subscribers) {
                const mainData = this.data.get(node);
                if (mainData) {
                    const translateX = node.android('translationX');
                    const translateY = node.android('translationY');
                    if (translateX !== '' || translateY !== '') {
                        const x = parseInt(translateX);
                        const y = parseInt(translateY);
                        for (const item of mainData.children) {
                            if (!isNaN(x)) {
                                item.translateX(x);
                            }
                            if (!isNaN(y)) {
                                item.translateY(y);
                            }
                        }
                    }
                }
            }
        }
    }

    var LayoutUI$9 = squared.base.LayoutUI;
    const checkMarginLeft = (node, item) =>
        item.marginLeft < 0 && (node.rootElement || item.linear.left < Math.floor(node.box.left));
    const checkMarginRight = (node, item) =>
        item.marginRight < 0 && (node.rootElement || item.linear.right > Math.ceil(node.box.right));
    const checkMarginTop = (node, item) =>
        item.marginTop < 0 && (node.rootElement || item.linear.top < Math.floor(node.box.top));
    const checkMarginBottom = (node, item) =>
        item.marginBottom < 0 && (node.rootElement || item.linear.bottom > Math.ceil(node.box.bottom));
    class PositiveX extends squared.base.ExtensionUI {
        is(node) {
            return !node.isEmpty();
        }
        condition(node) {
            var _a, _b;
            const { documentBody, lastStaticChild } = node;
            let contentBox =
                    node.contentBoxWidth > 0 ||
                    node.contentBoxHeight > 0 ||
                    node.marginTop !== 0 ||
                    node.marginRight !== 0 ||
                    node.marginBottom !== 0 ||
                    node.marginLeft !== 0,
                aboveInvalid,
                belowInvalid;
            if ((_a = node.firstStaticChild) === null || _a === void 0 ? void 0 : _a.lineBreak) {
                contentBox = true;
                aboveInvalid = true;
            }
            if (
                lastStaticChild &&
                lastStaticChild.lineBreak &&
                ((_b = lastStaticChild.previousSibling) === null || _b === void 0 ? void 0 : _b.blockStatic)
            ) {
                contentBox = true;
                belowInvalid = true;
            }
            if (!documentBody && !contentBox) {
                return false;
            }
            const rootElement = node.rootElement;
            const expandBody = documentBody && node.positionStatic;
            const paddingTop = node.paddingTop + (documentBody ? node.marginTop : 0);
            const paddingRight = node.paddingRight + (documentBody ? node.marginRight : 0);
            const paddingBottom = node.paddingBottom + (documentBody ? node.marginBottom : 0);
            const paddingLeft = node.paddingLeft + (documentBody ? node.marginLeft : 0);
            const children = new Set();
            let right, bottom;
            node.each(item => {
                const fixed = rootElement && item.css('position') === 'fixed';
                if (item.pageFlow || (!contentBox && !fixed)) {
                    return;
                }
                const fixedPosition = fixed && item.autoPosition;
                if (item.hasPX('left') || fixedPosition) {
                    if (documentBody && (item.css('width') === '100%' || item.css('minWidth') === '100%')) {
                        if (paddingLeft || paddingRight) {
                            children.add(item);
                        }
                        right = true;
                    } else {
                        const value = item.left;
                        if ((value >= 0 || rootElement) && value < paddingLeft) {
                            children.add(item);
                        } else if (value < 0 && node.marginLeft > 0) {
                            children.add(item);
                        } else if (!item.hasPX('right') && checkMarginLeft(node, item)) {
                            children.add(item);
                        }
                    }
                } else if (item.hasPX('right')) {
                    if (expandBody) {
                        children.add(item);
                        right = true;
                    } else {
                        const value = item.right;
                        if ((value >= 0 || rootElement) && value < paddingRight) {
                            children.add(item);
                        } else if (value < 0 && node.marginRight > 0) {
                            children.add(item);
                        } else if (checkMarginRight(node, item)) {
                            children.add(item);
                        }
                    }
                } else if (checkMarginLeft(node, item)) {
                    children.add(item);
                }
                if (item.hasPX('top') || fixedPosition) {
                    if (documentBody && (item.css('height') === '100%' || item.css('minHeight') === '100%')) {
                        if (paddingTop || paddingBottom) {
                            children.add(item);
                        }
                        bottom = true;
                    } else {
                        const value = item.top;
                        if ((value >= 0 || rootElement) && (value < paddingTop || aboveInvalid)) {
                            children.add(item);
                        } else if (value < 0 && node.marginTop > 0) {
                            children.add(item);
                        } else if (!item.hasPX('bottom') && checkMarginTop(node, item)) {
                            children.add(item);
                        }
                    }
                } else if (item.hasPX('bottom')) {
                    if (expandBody) {
                        children.add(item);
                        bottom = true;
                    } else {
                        const value = item.bottom;
                        if ((value >= 0 || rootElement) && (value < paddingBottom || belowInvalid)) {
                            children.add(item);
                        } else if (value < 0 && node.marginBottom > 0) {
                            children.add(item);
                        } else if (checkMarginBottom(node, item)) {
                            children.add(item);
                        }
                    }
                } else if (checkMarginTop(node, item)) {
                    children.add(item);
                }
            });
            if (children.size || right || bottom) {
                this.data.set(node, { children: Array.from(children), right, bottom });
                return true;
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = this.data.get(node);
            const children = mainData.children;
            let container;
            if (children.length) {
                container = this.controller.createNodeWrapper(node, parent, {
                    alignmentType: 8 /* VERTICAL */,
                    children,
                    resetMargin: (!node.rootElement && !node.pageFlow) || parent.layoutGrid,
                    cascade: true,
                    inheritDataset: true,
                });
            }
            if (node.documentBody) {
                if (mainData.right) {
                    (container || node).setLayoutWidth('match_parent');
                }
                if (mainData.bottom) {
                    (container || node).setLayoutHeight('match_parent');
                }
            } else if (!node.pageFlow) {
                if (!node.hasPX('width') && node.hasPX('left') && node.hasPX('right')) {
                    node.setLayoutWidth('match_parent');
                }
                if (!node.hasPX('height') && node.hasPX('top') && node.hasPX('bottom')) {
                    node.setLayoutHeight('match_parent');
                }
            }
            if (container) {
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new LayoutUI$9(parent, container, CONTAINER_NODE.CONSTRAINT, 16 /* ABSOLUTE */)
                    ),
                    subscribe: true,
                };
            }
        }
        postBaseLayout(node) {
            const mainData = this.data.get(node);
            if (mainData) {
                const documentId = node.documentId;
                for (const item of mainData.children) {
                    const nested =
                        !item.pageFlow &&
                        (item.absoluteParent !== item.documentParent ||
                            item.css('position') === 'fixed' ||
                            node.documentBody);
                    const wrapper = item.outerMostWrapper;
                    if (item.hasPX('left')) {
                        if (!nested) {
                            item.translateX(item.left);
                            item.alignSibling('left', documentId);
                            item.constraint.horizontal = true;
                        }
                        wrapper.modifyBox(8 /* MARGIN_LEFT */, node.borderLeftWidth);
                    }
                    if (item.hasPX('right')) {
                        if (!nested) {
                            item.translateX(-item.right);
                            if (node.rootElement) {
                                item.anchor('right', 'parent');
                            } else {
                                item.alignSibling('right', documentId);
                            }
                            item.constraint.horizontal = true;
                        }
                        wrapper.modifyBox(2 /* MARGIN_RIGHT */, node.borderRightWidth);
                    } else if (item.marginLeft < 0 && checkMarginLeft(node, item)) {
                        wrapper.alignSibling('left', documentId);
                        wrapper.translateX(item.linear.left - node.bounds.left);
                        wrapper.modifyBox(8 /* MARGIN_LEFT */, node.borderLeftWidth);
                        wrapper.constraint.horizontal = true;
                        item.setBox(8 /* MARGIN_LEFT */, { reset: 1 });
                    }
                    if (item.hasPX('top')) {
                        if (!nested) {
                            item.translateY(item.top);
                            item.alignSibling('top', documentId);
                            item.constraint.vertical = true;
                        }
                        wrapper.modifyBox(1 /* MARGIN_TOP */, node.borderTopWidth);
                    }
                    if (item.hasPX('bottom')) {
                        if (!nested) {
                            item.translateY(-item.bottom);
                            if (node.rootElement) {
                                item.anchor('bottom', 'parent');
                            } else {
                                item.alignSibling('bottom', documentId);
                            }
                            item.constraint.vertical = true;
                        }
                        wrapper.modifyBox(4 /* MARGIN_BOTTOM */, node.borderBottomWidth);
                    } else if (item.marginTop < 0 && checkMarginTop(node, item)) {
                        wrapper.alignSibling('top', documentId);
                        wrapper.translateY(item.linear.top - node.bounds.top);
                        wrapper.modifyBox(1 /* MARGIN_TOP */, node.borderTopWidth);
                        wrapper.constraint.vertical = true;
                        item.setBox(1 /* MARGIN_TOP */, { reset: 1 });
                    }
                }
            }
        }
    }

    var LayoutUI$a = squared.base.LayoutUI;
    const { formatPX: formatPX$9 } = squared.lib.css;
    const { truncate: truncate$5 } = squared.lib.math;
    const validPercent = value => value.endsWith('%') && parseFloat(value) > 0;
    class Percent extends squared.base.ExtensionUI {
        is(node) {
            return !node.actualParent.layoutElement && !node.display.startsWith('table');
        }
        condition(node, parent) {
            const absoluteParent = node.absoluteParent || parent;
            let percentWidth, percentHeight, marginHorizontal, marginVertical;
            if (!absoluteParent.hasPX('width', { percent: false })) {
                const percent = node.percentWidth;
                percentWidth =
                    ((percent > 0 && percent < 1) || node.has('maxWidth', { type: 2 /* PERCENT */, not: '100%' })) &&
                    !parent.layoutConstraint &&
                    (node.cssInitial('width') !== '100%' ||
                        node.has('maxWidth', { type: 2 /* PERCENT */, not: '100%' })) &&
                    (node.rootElement ||
                        ((parent.layoutVertical || node.onlyChild) && (parent.blockStatic || parent.percentWidth > 0)));
                marginHorizontal =
                    (validPercent(node.css('marginLeft')) || validPercent(node.css('marginRight'))) &&
                    ((parent.layoutVertical && !parent.hasAlign(1 /* UNKNOWN */)) ||
                        parent.layoutFrame ||
                        (node.blockStatic && node.alignedVertically(undefined, this.application.clearMap) > 0) ||
                        node.documentParent.size() === 1 ||
                        !node.pageFlow);
            }
            if (!absoluteParent.hasPX('height', { percent: false })) {
                const percent = node.percentHeight;
                percentHeight =
                    ((percent > 0 && percent < 1) ||
                        (node.has('maxHeight', { type: 2 /* PERCENT */, not: '100%' }) && parent.hasHeight)) &&
                    (node.cssInitial('height') !== '100%' ||
                        node.has('maxHeight', { type: 2 /* PERCENT */, not: '100%' })) &&
                    (node.rootElement || parent.percentHeight > 0);
                marginVertical =
                    (validPercent(node.css('marginTop')) || validPercent(node.css('marginBottom'))) &&
                    node.documentParent.percentHeight > 0 &&
                    !node.inlineStatic &&
                    (node.documentParent.size() === 1 || !node.pageFlow);
            }
            if (percentWidth || percentHeight || marginHorizontal || marginVertical) {
                this.data.set(node, { percentWidth, percentHeight, marginHorizontal, marginVertical });
                return true;
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = this.data.get(node);
            let container;
            if (!parent.layoutConstraint || mainData.percentHeight) {
                container = this.controller.createNodeWrapper(node, parent, {
                    alignmentType: 8 /* VERTICAL */,
                    resetMargin: true,
                });
            }
            const target = container || parent;
            if (mainData.percentWidth) {
                if (!target.hasWidth) {
                    target.setCacheValue('hasWidth', true);
                    target.setCacheValue('blockStatic', true);
                    target.css('display', 'block');
                    target.setLayoutWidth('match_parent');
                }
                node.setLayoutWidth(
                    node.cssInitial('width') === '100%' && !node.hasPX('maxWidth') ? 'match_parent' : '0px'
                );
            } else if (container && !mainData.marginHorizontal) {
                container.setLayoutWidth('wrap_content');
            }
            if (mainData.percentHeight) {
                if (!target.hasHeight) {
                    target.setCacheValue('hasHeight', true);
                    target.setLayoutHeight('match_parent');
                }
                node.setLayoutHeight(
                    node.cssInitial('height') === '100%' && !node.hasPX('maxHeight') ? 'match_parent' : '0px'
                );
            } else if (container && !mainData.marginVertical) {
                container.setLayoutHeight('wrap_content');
            }
            if (container) {
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new LayoutUI$a(parent, container, CONTAINER_NODE.CONSTRAINT, 2048 /* SINGLE */)
                    ),
                    include: true,
                };
            }
            return { include: true };
        }
        postBaseLayout(node) {
            const mainData = this.data.get(node);
            if (mainData) {
                const controller = this.controller;
                const constraint = LAYOUT_MAP.constraint;
                const renderParent = node.renderParent;
                const renderNode = node.anchorTarget.renderParent;
                if (mainData.marginHorizontal) {
                    const [marginLeft, marginRight] = node.cssAsTuple('marginLeft', 'marginRight');
                    const boxRect = node.getAnchorPosition(renderParent, true, false);
                    const rightAligned = node.rightAligned;
                    let percentWidth = node.percentWidth,
                        leftPercent = validPercent(marginLeft) ? parseFloat(marginLeft) / 100 : 0,
                        rightPercent = validPercent(marginRight) ? parseFloat(marginRight) / 100 : 0;
                    if (percentWidth) {
                        if (rightAligned) {
                            if (percentWidth + rightPercent < 1) {
                                leftPercent = 1 - (percentWidth + rightPercent);
                            }
                        } else if (percentWidth + leftPercent < 1) {
                            rightPercent = 1 - (percentWidth + leftPercent);
                        }
                    }
                    if (leftPercent > 0) {
                        const styleBias = !rightAligned && !node.centerAligned;
                        const options = {
                            width: '0px',
                            height: 'wrap_content',
                            android: {
                                [node.localizeString('layout_marginLeft' /* MARGIN_LEFT */)]: boxRect.left
                                    ? formatPX$9(boxRect.left)
                                    : '',
                            },
                            app: {
                                layout_constraintHorizontal_chainStyle: styleBias ? 'packed' : '',
                                layout_constraintHorizontal_bias: styleBias ? '0' : '',
                                layout_constraintWidth_percent: truncate$5(
                                    leftPercent,
                                    node.localSettings.floatPrecision
                                ),
                                [constraint.top]: 'parent',
                                [node.localizeString(constraint.left)]: 'parent',
                                [node.localizeString(constraint.rightLeft)]: node.documentId,
                            },
                        };
                        const output = controller.renderSpace(options);
                        if (options.documentId) {
                            node.anchorDelete('left');
                            node.anchor('leftRight', options.documentId);
                            node.setBox(8 /* MARGIN_LEFT */, { reset: 1 });
                            if (rightPercent === 0) {
                                if (rightAligned) {
                                    node.anchor('right', 'parent');
                                    node.app('layout_constraintHorizontal_chainStyle', 'packed');
                                    node.app('layout_constraintHorizontal_bias', '1');
                                }
                                if (boxRect.right) {
                                    node.modifyBox(2 /* MARGIN_RIGHT */, boxRect.right);
                                }
                            }
                            node.constraint.horizontal = true;
                            controller.addAfterInsideTemplate(renderNode, output);
                        }
                    }
                    if (rightPercent > 0) {
                        const options = {
                            width: '0px',
                            height: 'wrap_content',
                            android: {
                                [node.localizeString('layout_marginRight' /* MARGIN_RIGHT */)]: boxRect.right
                                    ? formatPX$9(boxRect.right)
                                    : '',
                            },
                            app: {
                                layout_constraintHorizontal_chainStyle: rightAligned ? 'packed' : '',
                                layout_constraintHorizontal_bias: rightAligned ? '1' : '',
                                layout_constraintWidth_percent: truncate$5(
                                    rightPercent,
                                    node.localSettings.floatPrecision
                                ),
                                [constraint.top]: 'parent',
                                [node.localizeString(constraint.right)]: 'parent',
                                [node.localizeString(constraint.leftRight)]: node.documentId,
                            },
                        };
                        const output = controller.renderSpace(options);
                        if (options.documentId) {
                            node.anchorDelete('right');
                            node.anchor('rightLeft', options.documentId);
                            node.setBox(2 /* MARGIN_RIGHT */, { reset: 1 });
                            if (leftPercent === 0) {
                                if (!rightAligned) {
                                    node.anchor('left', 'parent');
                                    node.app('layout_constraintHorizontal_chainStyle', 'packed');
                                    node.app('layout_constraintHorizontal_bias', '0');
                                }
                                if (boxRect.left) {
                                    node.modifyBox(8 /* MARGIN_LEFT */, boxRect.left);
                                }
                            }
                            node.constraint.horizontal = true;
                            controller.addAfterInsideTemplate(renderNode, output);
                        }
                    }
                    if (node.blockStatic && !node.hasWidth) {
                        node.app('layout_constraintWidth_percent', (1 - (leftPercent + rightPercent)).toString());
                        node.setLayoutWidth('0px');
                        node.setCacheValue('contentBoxWidth', 0);
                    } else if (percentWidth) {
                        let percentTotal = percentWidth + leftPercent + rightPercent;
                        if (percentTotal >= 1) {
                            percentWidth -= percentTotal - 1;
                        } else {
                            const boxPercent =
                                node.contentBox && !node.tableElement
                                    ? node.contentBoxWidth / renderParent.box.width
                                    : 0;
                            if (boxPercent) {
                                percentTotal += boxPercent;
                                if (percentTotal >= 1) {
                                    percentWidth = 1 - (leftPercent + rightPercent);
                                } else {
                                    percentWidth = percentTotal;
                                }
                            }
                        }
                        node.app('layout_constraintWidth_percent', percentWidth.toString());
                        node.setLayoutWidth('0px');
                        node.setCacheValue('contentBoxWidth', 0);
                    }
                }
                if (mainData.marginVertical) {
                    const [marginTop, marginBottom] = node.cssAsTuple('marginTop', 'marginBottom');
                    const boxRect = node.getAnchorPosition(renderParent, true, false);
                    const bottomAligned = node.bottomAligned;
                    let percentHeight = node.percentHeight,
                        topPercent = validPercent(marginTop) ? parseFloat(marginTop) / 100 : 0,
                        bottomPercent = validPercent(marginBottom) ? parseFloat(marginBottom) / 100 : 0;
                    if (percentHeight) {
                        if (bottomAligned) {
                            if (percentHeight + bottomPercent < 1) {
                                topPercent = 1 - (percentHeight + bottomPercent);
                            }
                        } else if (percentHeight + topPercent < 1) {
                            bottomPercent = 1 - (percentHeight + topPercent);
                        }
                    }
                    if (topPercent > 0) {
                        const options = {
                            width: 'wrap_content',
                            height: '0px',
                            android: {
                                ['layout_marginTop' /* MARGIN_TOP */]: boxRect.top ? formatPX$9(boxRect.top) : '',
                            },
                            app: {
                                layout_constraintVertical_chainStyle: !bottomAligned ? 'packed' : '',
                                layout_constraintVertical_bias: !bottomAligned ? '0' : '',
                                layout_constraintHeight_percent: truncate$5(
                                    topPercent,
                                    node.localSettings.floatPrecision
                                ),
                                [node.localizeString(constraint.left)]: 'parent',
                                [constraint.top]: 'parent',
                                [constraint.bottomTop]: node.documentId,
                            },
                        };
                        const output = controller.renderSpace(options);
                        if (options.documentId) {
                            node.anchorDelete('top');
                            node.anchor('topBottom', options.documentId);
                            node.setBox(1 /* MARGIN_TOP */, { reset: 1 });
                            if (bottomPercent === 0) {
                                if (bottomAligned) {
                                    node.anchor('bottom', 'parent');
                                    node.app('layout_constraintVertical_chainStyle', 'packed');
                                    node.app('layout_constraintVertical_bias', '1');
                                }
                                if (boxRect.bottom) {
                                    node.modifyBox(4 /* MARGIN_BOTTOM */, boxRect.bottom);
                                }
                            }
                            node.constraint.vertical = true;
                            controller.addAfterInsideTemplate(renderNode, output);
                        }
                    }
                    if (bottomPercent > 0) {
                        const options = {
                            width: 'wrap_content',
                            height: '0px',
                            android: {
                                ['layout_marginBottom' /* MARGIN_BOTTOM */]: boxRect.bottom
                                    ? formatPX$9(boxRect.bottom)
                                    : '',
                            },
                            app: {
                                layout_constraintVertical_chainStyle: bottomAligned ? 'packed' : '',
                                layout_constraintVertical_bias: bottomAligned ? '1' : '',
                                layout_constraintHeight_percent: truncate$5(
                                    bottomPercent,
                                    node.localSettings.floatPrecision
                                ),
                                [node.localizeString(constraint.left)]: 'parent',
                                [constraint.bottom]: 'parent',
                                [constraint.topBottom]: node.documentId,
                            },
                        };
                        const output = controller.renderSpace(options);
                        if (options.documentId) {
                            node.anchorDelete('bottom');
                            node.anchor('bottomTop', options.documentId);
                            node.setBox(4 /* MARGIN_BOTTOM */, { reset: 1 });
                            if (topPercent === 0) {
                                if (!bottomAligned) {
                                    node.anchor('top', 'parent');
                                    node.app('layout_constraintHorizontal_chainStyle', 'packed');
                                    node.app('layout_constraintHorizontal_bias', '0');
                                }
                                if (boxRect.top) {
                                    node.modifyBox(1 /* MARGIN_TOP */, boxRect.top);
                                }
                            }
                            node.constraint.vertical = true;
                            controller.addAfterInsideTemplate(renderNode, output);
                        }
                    }
                    if (node.css('height') === '100%' || node.css('minHeight') === '100%') {
                        node.app('layout_constraintHeight_percent', (1 - (topPercent + bottomPercent)).toString());
                        node.setLayoutHeight('0px');
                        node.setCacheValue('contentBoxHeight', 0);
                    } else if (percentHeight) {
                        let percentTotal = percentHeight + topPercent + bottomPercent;
                        if (percentTotal >= 1) {
                            percentHeight -= percentTotal - 1;
                        } else {
                            const boxPercent =
                                node.contentBox && !node.tableElement
                                    ? node.contentBoxHeight / renderParent.box.height
                                    : 0;
                            if (boxPercent) {
                                percentTotal += boxPercent;
                                if (percentTotal >= 1) {
                                    percentHeight = 1 - (topPercent + bottomPercent);
                                } else {
                                    percentHeight = percentTotal;
                                }
                            }
                        }
                        node.app('layout_constraintHeight_percent', percentHeight.toString());
                        node.setLayoutHeight('0px');
                        node.setCacheValue('contentBoxHeight', 0);
                    }
                }
            }
        }
    }

    var NodeUI$2 = squared.base.NodeUI;
    const { NODE_RESOURCE: NODE_RESOURCE$7 } = squared.base.lib.constant;
    const { getElementAsNode: getElementAsNode$1 } = squared.lib.session;
    const getInputName = node => node.toElementString('name').trim();
    class RadioGroup extends squared.base.ExtensionUI {
        is(node) {
            return node.is(CONTAINER_NODE.RADIO);
        }
        condition(node) {
            return getInputName(node) !== '' && !this.data.has(node);
        }
        processNode(node, parent) {
            var _a, _b;
            const inputName = getInputName(node);
            const radiogroup = [];
            const removeable = [];
            let first = -1,
                last = -1;
            parent.each((item, index) => {
                const renderAs = item.renderAs;
                let remove;
                if (renderAs) {
                    if (renderAs !== node) {
                        remove = item;
                    }
                    item = renderAs;
                }
                if (item.is(CONTAINER_NODE.RADIO) && !item.rendered && getInputName(item) === inputName) {
                    radiogroup.push(item);
                    if (first === -1) {
                        first = index;
                    }
                    last = index;
                } else if (!item.visible && radiogroup.includes(item.labelFor)) {
                    last = index;
                }
                if (remove) {
                    removeable.push(remove);
                }
            });
            let length = radiogroup.length;
            if (length > 1) {
                const linearX = NodeUI$2.linearData(parent.children.slice(first, last + 1)).linearX;
                const container = this.controller.createNodeGroup(node, radiogroup, parent, { delegate: true });
                const controlName = CONTAINER_TAGNAME.RADIOGROUP;
                container.setControlType(controlName, CONTAINER_NODE.LINEAR);
                if (linearX) {
                    container.addAlign(4 /* HORIZONTAL */ | 64 /* SEGMENTED */);
                    container.android('orientation', 'horizontal');
                } else {
                    container.addAlign(8 /* VERTICAL */);
                    container.android('orientation', 'vertical');
                }
                container.inherit(node, 'alignment');
                container.exclude({ resource: NODE_RESOURCE$7.ASSET });
                container.render(parent);
                if (!this.setBaselineIndex(container, radiogroup)) {
                    container.css('verticalAlign', 'middle');
                    container.setCacheValue('baseline', false);
                }
                for (const item of removeable) {
                    item.hide({ remove: true });
                }
                this.subscribers.add(container);
                return {
                    renderAs: container,
                    outputAs: {
                        type: 1 /* XML */,
                        node: container,
                        controlName,
                    },
                    parent: container,
                    complete: true,
                };
            } else {
                radiogroup.length = 0;
                const sessionId = node.sessionId;
                document.querySelectorAll(`input[type=radio][name=${getInputName(node)}]`).forEach(element => {
                    const item = getElementAsNode$1(element, sessionId);
                    if (item) {
                        radiogroup.push(item);
                    }
                });
                length = radiogroup.length;
                if (length > 1 && radiogroup.includes(node)) {
                    const controlName = CONTAINER_TAGNAME.RADIOGROUP;
                    const data = new Map();
                    for (let i = 0; i < length; ++i) {
                        const radio = radiogroup[i];
                        const parents = radio.ascend({
                            condition: item => item.layoutLinear,
                            error: item => item.controlName === controlName,
                            every: true,
                        });
                        const q = parents.length;
                        if (q) {
                            for (let j = 0; j < q; ++j) {
                                const item = parents[j];
                                data.set(item, (data.get(item) || 0) + 1);
                            }
                        } else {
                            data.clear();
                            break;
                        }
                    }
                    for (const item of data) {
                        if (item[1] === length) {
                            const group = item[0];
                            group.unsafe('controlName', controlName);
                            group.containerType = CONTAINER_NODE.RADIO;
                            const renderTemplate =
                                (_b =
                                    (_a = group.renderParent) === null || _a === void 0
                                        ? void 0
                                        : _a.renderTemplates) === null || _b === void 0
                                    ? void 0
                                    : _b.find(template => template.node === group);
                            if (renderTemplate) {
                                renderTemplate.controlName = controlName;
                            }
                            this.setBaselineIndex(group, radiogroup);
                            break;
                        }
                    }
                }
            }
        }
        postBaseLayout(node) {
            node.renderEach(
                item =>
                    item.naturalElement &&
                    item.toElementBoolean('checked') &&
                    node.android('checkedButton', item.documentId)
            );
        }
        setBaselineIndex(container, children) {
            let valid = false;
            for (let i = 0, length = children.length; i < length; ++i) {
                const item = children[i];
                if (item.toElementBoolean('checked')) {
                    item.android('checked', 'true');
                }
                if (
                    !valid &&
                    item.baseline &&
                    item.parent === container &&
                    container.layoutLinear &&
                    (i === 0 || container.layoutHorizontal)
                ) {
                    container.android('baselineAlignedChildIndex', i.toString());
                    valid = true;
                }
                this.data.set(item, children);
            }
            return valid;
        }
    }

    const { NODE_RESOURCE: NODE_RESOURCE$8 } = squared.base.lib.constant;
    const { formatPX: formatPX$a } = squared.lib.css;
    class ScrollBar extends squared.base.ExtensionUI {
        is(node) {
            return node.scrollElement && !node.textElement;
        }
        condition(node) {
            return (
                ((node.overflowX && node.hasPX('width')) ||
                    (node.overflowY && node.hasPX('height') && node.hasHeight)) &&
                !node.rootElement &&
                node.tagName !== 'TEXTAREA'
            );
        }
        processNode(node, parent) {
            const overflow = [];
            const scrollView = [];
            const horizontalScroll = CONTAINER_TAGNAME.HORIZONTAL_SCROLL;
            const verticalScroll =
                node.api < 29 /* Q */ ? CONTAINER_TAGNAME.VERTICAL_SCROLL : CONTAINER_TAGNAME_X.VERTICAL_SCROLL;
            const children = [];
            let boxWidth = NaN;
            if (node.overflowX && node.overflowY) {
                overflow.push(horizontalScroll, verticalScroll);
            } else if (node.overflowX) {
                overflow.push(horizontalScroll);
            } else if (node.overflowY) {
                overflow.push(verticalScroll);
            }
            if (overflow.includes(horizontalScroll)) {
                boxWidth = node.actualWidth - node.contentBoxWidth;
                let valid = true,
                    contentWidth = 0;
                node.each(child => {
                    if (child.textElement && child.css('whiteSpace') !== 'nowrap') {
                        children.push(child);
                    } else {
                        const childWidth = child.actualWidth;
                        if (childWidth <= boxWidth) {
                            return;
                        } else if (childWidth > contentWidth) {
                            contentWidth = childWidth;
                        }
                    }
                    valid = false;
                });
                if (!valid) {
                    if (contentWidth > boxWidth) {
                        boxWidth = contentWidth;
                    }
                } else {
                    overflow.shift();
                }
            }
            const length = overflow.length;
            if (length) {
                for (let i = 0; i < length; ++i) {
                    const container = this.application.createNode(node.sessionId, { parent });
                    if (i === 0) {
                        container.inherit(node, 'base', 'initial', 'styleMap');
                        if (!parent.replaceTry({ child: node, replaceWith: container })) {
                            return;
                        }
                    } else {
                        container.inherit(node, 'base');
                        container.exclude({ resource: NODE_RESOURCE$8.BOX_STYLE });
                    }
                    container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                    container.exclude({ resource: NODE_RESOURCE$8.ASSET });
                    container.resetBox(240 /* PADDING */);
                    container.childIndex = node.childIndex;
                    scrollView.push(container);
                }
                for (let i = 0; i < length; ++i) {
                    const item = scrollView[i];
                    switch (item.controlName) {
                        case verticalScroll:
                            node.setLayoutHeight('wrap_content');
                            item.setLayoutHeight(formatPX$a(node.actualHeight));
                            item.android('scrollbars', 'vertical');
                            item.cssApply({
                                width: (length === 1 && node.cssInitial('width')) || 'auto',
                                overflow: 'scroll visible',
                                overflowX: 'visible',
                                overflowY: 'scroll',
                            });
                            break;
                        case horizontalScroll:
                            node.setLayoutWidth('wrap_content');
                            item.setLayoutWidth(formatPX$a(node.actualWidth));
                            item.android('scrollbars', 'horizontal');
                            item.cssApply({
                                height: (length === 1 && node.cssInitial('height')) || 'auto',
                                overflow: 'visible scroll',
                                overflowX: 'scroll',
                                overflowY: 'visible',
                            });
                            break;
                    }
                    if (i === 0) {
                        item.render(parent);
                    } else {
                        item.render(scrollView[i - 1]);
                    }
                    item.unsetCache();
                    this.application.addLayoutTemplate(item.renderParent || parent, item, {
                        type: 1 /* XML */,
                        node: item,
                        controlName: item.controlName,
                    });
                }
                for (let i = 0, q = children.length; i < q; ++i) {
                    const child = children[i];
                    if (child.textElement) {
                        child.css('maxWidth', formatPX$a(boxWidth));
                    }
                }
                let first = true,
                    item;
                do {
                    item = scrollView.pop();
                    if (first) {
                        parent = item;
                        item.innerWrapped = node;
                        first = false;
                    } else {
                        item.innerWrapped = parent;
                    }
                } while (scrollView.length);
                node.exclude({ resource: NODE_RESOURCE$8.BOX_STYLE });
                node.resetBox(15 /* MARGIN */, item);
                node.parent = parent;
                return { parent };
            }
        }
    }

    var SHAPE_TMPL = {
        'shape': {
            '@': ['xmlns:android', 'android:shape'],
            '>': {
                'solid': {
                    '^': 'android',
                    '@': ['color'],
                },
                'gradient': {
                    '^': 'android',
                    '@': [
                        'type',
                        'startColor',
                        'endColor',
                        'centerColor',
                        'angle',
                        'centerX',
                        'centerY',
                        'gradientRadius',
                        'visible',
                    ],
                },
                'corners': {
                    '^': 'android',
                    '@': ['radius', 'topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius'],
                },
                'stroke': {
                    '^': 'android',
                    '@': ['width', 'color', 'dashWidth', 'dashGap'],
                },
            },
        },
    };

    var LAYERLIST_TMPL = {
        'layer-list': {
            '@': ['xmlns:android'],
            '>': {
                'item': {
                    '^': 'android',
                    '@': ['left', 'start', 'top', 'right', 'end', 'bottom', 'drawable', 'width', 'height', 'gravity'],
                    '>': {
                        'shape': SHAPE_TMPL.shape,
                        'bitmap': {
                            '^': 'android',
                            '@': ['src', 'gravity', 'tileMode', 'tileModeX', 'tileModeY'],
                        },
                        'rotate': {
                            '^': 'android',
                            '@': ['drawable', 'fromDegrees', 'toDegrees', 'pivotX', 'pivotY', 'visible'],
                        },
                    },
                },
            },
        },
    };

    const VECTOR_PATH = {
        'path': {
            '^': 'android',
            '@': [
                'name',
                'fillColor',
                'fillAlpha',
                'fillType',
                'strokeColor',
                'strokeAlpha',
                'strokeWidth',
                'strokeLineCap',
                'strokeLineJoin',
                'strokeMiterLimit',
                'trimPathStart',
                'trimPathEnd',
                'trimPathOffset',
                'pathData',
            ],
            '>': {
                'aapt:attr': {
                    '@': ['name'],
                    '>': {
                        'gradient': {
                            '^': 'android',
                            '@': [
                                'type',
                                'startColor',
                                'endColor',
                                'centerColor',
                                'angle',
                                'startX',
                                'startY',
                                'endX',
                                'endY',
                                'centerX',
                                'centerY',
                                'gradientRadius',
                                'tileMode',
                            ],
                            '>': {
                                'item': {
                                    '^': 'android',
                                    '@': ['offset', 'color'],
                                },
                            },
                        },
                    },
                },
            },
        },
    };
    const VECTOR_GROUP = {
        'group': {
            '^': 'android',
            '@': ['name', 'rotation', 'scaleX', 'scaleY', 'translateX', 'translateY', 'pivotX', 'pivotY'],
            '>>': true,
            '>': {
                'clip-path': {
                    '^': 'android',
                    '@': ['name', 'pathData', 'fillType'],
                },
                'path': VECTOR_PATH.path,
            },
            '#': 'include',
        },
    };
    const VECTOR_TMPL = {
        'vector': {
            '@': [
                'xmlns:android',
                'xmlns:aapt',
                'android:name',
                'android:width',
                'android:height',
                'android:viewportWidth',
                'android:viewportHeight',
                'android:alpha',
            ],
            '>': {
                'path': VECTOR_PATH.path,
            },
            '#': 'include',
        },
    };

    const { NODE_RESOURCE: NODE_RESOURCE$9 } = squared.base.lib.constant;
    const { reduceRGBA } = squared.lib.color;
    const { extractURL: extractURL$1, formatPercent: formatPercent$1, formatPX: formatPX$b } = squared.lib.css;
    const { truncate: truncate$6 } = squared.lib.math;
    const {
        delimitString,
        isEqual,
        plainMap: plainMap$2,
        resolvePath: resolvePath$1,
        spliceArray,
        splitPair: splitPair$1,
    } = squared.lib.util;
    const CHAR_SEPARATOR = /\s*,\s*/;
    function getBorderStyle(border, direction = -1, halfSize = false) {
        const { style, color } = border;
        const createStrokeColor = value => ({ color: getColorValue(value), dashWidth: '', dashGap: '' });
        const width = roundFloat(border.width);
        const result = createStrokeColor(color);
        switch (style) {
            case 'solid':
                break;
            case 'dotted':
                result.dashWidth = formatPX$b(width);
                result.dashGap = result.dashWidth;
                break;
            case 'dashed': {
                let dashWidth, dashGap;
                switch (width) {
                    case 1:
                    case 2:
                        dashWidth = width * 3;
                        dashGap = dashWidth - 1;
                        break;
                    case 3:
                        dashWidth = 6;
                        dashGap = 3;
                        break;
                    default:
                        dashWidth = width * 2;
                        dashGap = 4;
                        break;
                }
                result.dashWidth = formatPX$b(dashWidth);
                result.dashGap = formatPX$b(dashGap);
                break;
            }
            case 'inset':
            case 'outset':
            case 'groove':
            case 'ridge': {
                const rgba = color.rgba;
                let percent = 1;
                if (width === 1) {
                    if (style === 'inset' || style === 'outset') {
                        percent = 0.5;
                    }
                } else {
                    const grayScale = rgba.r === rgba.g && rgba.g === rgba.b;
                    let offset = 0;
                    if (style === 'ridge') {
                        halfSize = !halfSize;
                        offset += 0.25;
                    } else if (style === 'groove') {
                        offset += 0.25;
                    } else if (grayScale) {
                        if (style === 'inset') {
                            halfSize = !halfSize;
                        }
                    } else if (style === 'outset') {
                        halfSize = !halfSize;
                    }
                    if (halfSize) {
                        switch (direction) {
                            case 0:
                            case 3:
                                direction = 1;
                                break;
                            case 1:
                            case 2:
                                direction = 0;
                                break;
                        }
                    }
                    switch (direction) {
                        case 0:
                        case 3:
                            if (grayScale) {
                                percent = 0.5 + offset;
                            }
                            break;
                        case 1:
                        case 2:
                            percent = grayScale ? 0.75 + offset : -0.75;
                            break;
                    }
                }
                if (percent !== 1) {
                    const reduced = reduceRGBA(rgba, percent, color.valueAsRGBA);
                    if (reduced) {
                        return createStrokeColor(reduced);
                    }
                }
                break;
            }
        }
        return result;
    }
    function getBorderStroke(border, direction = -1, hasInset, isInset) {
        let result;
        if (isAlternatingBorder(border.style)) {
            const width = parseFloat(border.width);
            result = getBorderStyle(border, direction, isInset !== true);
            result.width = isInset
                ? formatPX$b(Math.ceil(width / 2) * 2)
                : formatPX$b(hasInset ? Math.ceil(width / 2) : width);
        } else {
            result = getBorderStyle(border);
            result.width = roundFloat(border.width) + 'px';
        }
        return result;
    }
    function getCornerRadius(corners) {
        const [topLeft, topRight, bottomRight, bottomLeft] = corners;
        const result = {};
        let valid;
        if (topLeft !== '0px') {
            result.topLeftRadius = topLeft;
            valid = true;
        }
        if (topRight !== '0px') {
            result.topRightRadius = topRight;
            valid = true;
        }
        if (bottomRight !== '0px') {
            result.bottomRightRadius = bottomRight;
            valid = true;
        }
        if (bottomLeft !== '0px') {
            result.bottomLeftRadius = bottomLeft;
            valid = true;
        }
        if (valid) {
            return result;
        }
    }
    function getBackgroundColor(value) {
        if (value) {
            const color = getColorValue(value, false);
            if (color !== '') {
                return { color };
            }
        }
    }
    function isAlternatingBorder(value, width = 0) {
        switch (value) {
            case 'groove':
            case 'ridge':
            case 'inset':
            case 'outset':
                return width !== 1;
            default:
                return false;
        }
    }
    function insertDoubleBorder(items, border, top, right, bottom, left, indentWidth = 0, corners) {
        const width = roundFloat(border.width);
        const borderWidth = Math.max(1, Math.floor(width / 3));
        const indentOffset = indentWidth ? formatPX$b(indentWidth) : '';
        let hideOffset = '-' + formatPX$b(borderWidth + indentWidth + 1);
        items.push({
            top: top ? indentOffset : hideOffset,
            right: right ? indentOffset : hideOffset,
            bottom: bottom ? indentOffset : hideOffset,
            left: left ? indentOffset : hideOffset,
            shape: {
                'android:shape': 'rectangle',
                stroke: Object.assign({ width: formatPX$b(borderWidth) }, getBorderStyle(border)),
                corners,
            },
        });
        const insetWidth = width - borderWidth + indentWidth;
        const drawOffset = formatPX$b(insetWidth);
        hideOffset = '-' + formatPX$b(insetWidth + 1);
        items.push({
            top: top ? drawOffset : hideOffset,
            right: right ? drawOffset : hideOffset,
            bottom: bottom ? drawOffset : hideOffset,
            left: left ? drawOffset : hideOffset,
            shape: {
                'android:shape': 'rectangle',
                stroke: Object.assign({ width: formatPX$b(borderWidth) }, getBorderStyle(border)),
                corners,
            },
        });
    }
    function createBackgroundGradient(gradient, api = 30 /* LATEST */, imageCount, borderRadius, precision) {
        const { colorStops, type } = gradient;
        let positioning = api >= 21; /* LOLLIPOP */
        const result = { type, positioning };
        const length = colorStops.length;
        switch (type) {
            case 'conic': {
                const center = gradient.center;
                result.type = 'sweep';
                if (positioning) {
                    result.centerX = (center.left * 2).toString();
                    result.centerY = (center.top * 2).toString();
                } else {
                    result.centerX = formatPercent$1(center.leftAsPercent);
                    result.centerY = formatPercent$1(center.topAsPercent);
                }
                break;
            }
            case 'radial': {
                const { center, radius } = gradient;
                if (positioning) {
                    result.gradientRadius = radius.toString();
                    result.centerX = center.left.toString();
                    result.centerY = center.top.toString();
                } else {
                    result.gradientRadius = formatPX$b(radius);
                    result.centerX = formatPercent$1(center.leftAsPercent);
                    result.centerY = formatPercent$1(center.topAsPercent);
                }
                break;
            }
            case 'linear': {
                if (
                    !positioning ||
                    (borderRadius &&
                        imageCount === 1 &&
                        colorStops[length - 1].offset === 1 &&
                        (length === 2 || (length === 3 && colorStops[1].offset === 0.5)))
                ) {
                    result.angle = (gradient.angle + 90).toString();
                    result.positioning = false;
                    positioning = false;
                } else {
                    const { angle, angleExtent, dimension } = gradient;
                    const { width, height } = dimension;
                    let { x, y } = angleExtent;
                    if (angle <= 90) {
                        y += height;
                        result.startX = '0';
                        result.startY = height.toString();
                    } else if (angle <= 180) {
                        result.startX = '0';
                        result.startY = '0';
                    } else if (angle <= 270) {
                        x += width;
                        result.startX = width.toString();
                        result.startY = '0';
                    } else {
                        x += width;
                        y += height;
                        result.startX = width.toString();
                        result.startY = height.toString();
                    }
                    result.endX = truncate$6(x, precision);
                    result.endY = truncate$6(y, precision);
                }
                break;
            }
        }
        if (positioning) {
            result.item = convertColorStops(colorStops);
        } else {
            result.startColor = getColorValue(colorStops[0].color);
            result.endColor = getColorValue(colorStops[length - 1].color);
            if (length > 2) {
                result.centerColor = getColorValue(colorStops[Math.floor(length / 2)].color);
            }
        }
        return result;
    }
    function createLayerList(boxStyle, images, borderOnly, stroke, corners, indentOffset) {
        const item = [];
        const result = [{ 'xmlns:android': XML_NAMESPACE.android, item }];
        const solid = !borderOnly && getBackgroundColor(boxStyle.backgroundColor);
        if (solid && !(images && images.find(image => image.gradient))) {
            item.push({ shape: { 'android:shape': 'rectangle', solid, corners } });
        }
        if (images) {
            for (let i = 0, length = images.length; i < length; ++i) {
                const image = images[i];
                item.push(
                    image.gradient
                        ? { shape: { 'android:shape': 'rectangle', gradient: image.gradient, corners } }
                        : image
                );
            }
        }
        if (stroke) {
            item.push({
                top: indentOffset,
                right: indentOffset,
                left: indentOffset,
                bottom: indentOffset,
                shape: {
                    'android:shape': 'rectangle',
                    stroke,
                    corners,
                },
            });
        }
        return result;
    }
    function getColorValue(value, transparency = true) {
        const color = Resource.addColor(value, transparency);
        return color !== '' ? `@color/${color}` : '';
    }
    function setBorderStyle(layerList, borders, index, corners, indentWidth, indentOffset) {
        const border = borders[index];
        if (border) {
            const width = roundFloat(border.width);
            if (border.style === 'double' && width > 1) {
                insertDoubleBorder(
                    layerList.item,
                    border,
                    index === 0,
                    index === 1,
                    index === 2,
                    index === 3,
                    indentWidth,
                    corners
                );
            } else {
                const inset =
                    (width > 1 && border.style === 'groove') ||
                    border.style === 'ridge' ||
                    (border.style === 'double' && roundFloat(border.width) > 1);
                if (inset) {
                    const hideInsetOffset = '-' + formatPX$b(width + indentWidth + 1);
                    layerList.item.push({
                        top: index === 0 ? '' : hideInsetOffset,
                        right: index === 1 ? '' : hideInsetOffset,
                        bottom: index === 2 ? '' : hideInsetOffset,
                        left: index === 3 ? '' : hideInsetOffset,
                        shape: {
                            'android:shape': 'rectangle',
                            stroke: getBorderStroke(border, index, inset, true),
                        },
                    });
                }
                const hideOffset = '-' + formatPX$b((inset ? Math.ceil(width / 2) : width) + indentWidth + 1);
                layerList.item.push({
                    top: index === 0 ? indentOffset : hideOffset,
                    right: index === 1 ? indentOffset : hideOffset,
                    bottom: index === 2 ? indentOffset : hideOffset,
                    left: index === 3 ? indentOffset : hideOffset,
                    shape: {
                        'android:shape': 'rectangle',
                        corners,
                        stroke: getBorderStroke(border, index, inset),
                    },
                });
            }
        }
    }
    const roundFloat = value => Math.round(parseFloat(value));
    const checkBackgroundPosition = (value, adjacent, fallback) =>
        !value.includes(' ') && adjacent.includes(' ')
            ? /^[a-z]+$/.test(value)
                ? value + ' 0px'
                : fallback + ' ' + value
            : value;
    function convertColorStops(list, precision) {
        return plainMap$2(list, item => ({
            color: getColorValue(item.color),
            offset: truncate$6(item.offset, precision),
        }));
    }
    function drawRect(width, height, x = 0, y = 0, precision) {
        if (precision) {
            x = truncate$6(x, precision);
            y = truncate$6(y, precision);
            width = truncate$6(x + width, precision);
            height = truncate$6(y + height, precision);
        } else {
            width += x;
            height += y;
        }
        return `M${x},${y} ${width},${y} ${width},${height} ${x},${height} Z`;
    }
    class ResourceBackground extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.options = {
                outlineAsInsetBorder: true,
            };
            this.eventOnly = true;
            this._resourceSvgInstance = null;
        }
        beforeParseDocument() {
            this._resourceSvgInstance = this.controller.localSettings.use.svg
                ? this.application.builtInExtensions.get('android.resource.svg' /* RESOURCE_SVG */)
                : null;
        }
        afterResources(sessionId) {
            const settings = this.application.userSettings;
            const drawOutline = this.options.outlineAsInsetBorder;
            let themeBackground;
            const deleteBodyWrapper = (body, wrapper) => {
                if (body !== wrapper && !wrapper.hasResource(NODE_RESOURCE$9.BOX_SPACING) && body.percentWidth === 0) {
                    switch (body.cssInitial('maxWidth')) {
                        case '':
                        case 'auto':
                        case '100%': {
                            const renderChildren = wrapper.renderChildren;
                            if (renderChildren.length === 1) {
                                wrapper.removeTry({ replaceWith: renderChildren[0] });
                            }
                            break;
                        }
                    }
                }
            };
            const setBodyBackground = (name, parent, value) => {
                Resource.addTheme({
                    name,
                    parent,
                    items: {
                        'android:windowBackground': value,
                        'android:windowFullscreen': 'true',
                        'android:fitsSystemWindows': 'true',
                    },
                });
                themeBackground = true;
            };
            const setDrawableBackground = (node, value) => {
                if (value !== '') {
                    const drawable = `@drawable/${Resource.insertStoredAsset(
                        'drawables',
                        node.containerName.toLowerCase() + '_' + node.controlId,
                        value
                    )}`;
                    if (!themeBackground) {
                        if (node.tagName === 'HTML') {
                            setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                            return;
                        } else {
                            const innerWrapped = node.innerMostWrapped;
                            if (
                                innerWrapped.documentBody &&
                                (node.backgroundColor !== '' || node.visibleStyle.backgroundRepeatY)
                            ) {
                                setBodyBackground(
                                    settings.manifestThemeName,
                                    settings.manifestParentThemeName,
                                    drawable
                                );
                                deleteBodyWrapper(innerWrapped, node);
                                return;
                            }
                        }
                    }
                    node.android('background', drawable, false);
                }
            };
            this.application.getProcessingCache(sessionId).each(node => {
                var _a, _b;
                let stored = node.data(Resource.KEY_NAME, 'boxStyle');
                const boxImage = node.data(Resource.KEY_NAME, 'boxImage');
                if (stored || boxImage) {
                    stored || (stored = {});
                    if (node.inputElement) {
                        const companion = node.companion;
                        if (companion && companion.tagName === 'LABEL' && !companion.visible) {
                            const backgroundColor =
                                (_a = companion.data(Resource.KEY_NAME, 'boxStyle')) === null || _a === void 0
                                    ? void 0
                                    : _a.backgroundColor;
                            if (backgroundColor) {
                                stored.backgroundColor = backgroundColor;
                            }
                        }
                    }
                    const images = this.getDrawableImages(node, stored, boxImage);
                    if (
                        node.controlName === CONTAINER_TAGNAME.BUTTON &&
                        ((_b = stored.borderRadius) === null || _b === void 0 ? void 0 : _b.length) === 1 &&
                        images &&
                        images.some(item => item.vectorGradient) &&
                        node.api >= 28 /* PIE */
                    ) {
                        node.android('buttonCornerRadius', stored.borderRadius[0]);
                        delete stored.borderRadius;
                    }
                    const outline = stored.outline;
                    let indentWidth = 0;
                    if (drawOutline && outline) {
                        const width = roundFloat(outline.width);
                        indentWidth = width === 2 && outline.style === 'double' ? 3 : width;
                    }
                    let [shapeData, layerList] = this.getDrawableBorder(stored, images, indentWidth);
                    const emptyBackground = !shapeData && !layerList;
                    if (outline && (drawOutline || emptyBackground)) {
                        const [outlineShapeData, outlineLayerList] = this.getDrawableBorder(
                            stored,
                            emptyBackground ? images : null,
                            0,
                            !emptyBackground,
                            outline
                        );
                        if (outlineShapeData) {
                            shapeData || (shapeData = outlineShapeData);
                        } else if (outlineLayerList) {
                            if (layerList) {
                                layerList[0].item = layerList[0].item.concat(outlineLayerList[0].item);
                            } else {
                                layerList = outlineLayerList;
                            }
                        }
                    }
                    if (shapeData) {
                        setDrawableBackground(node, applyTemplate('shape', SHAPE_TMPL, shapeData));
                    } else if (layerList) {
                        setDrawableBackground(node, applyTemplate('layer-list', LAYERLIST_TMPL, layerList));
                    } else {
                        const backgroundColor = stored.backgroundColor;
                        if (backgroundColor) {
                            const color = getColorValue(backgroundColor, node.inputElement);
                            if (color !== '') {
                                if (!themeBackground) {
                                    if (node.tagName === 'HTML') {
                                        setBodyBackground(
                                            settings.manifestThemeName,
                                            settings.manifestParentThemeName,
                                            color
                                        );
                                        return;
                                    } else {
                                        const innerWrapped = node.innerMostWrapped;
                                        if (innerWrapped.documentBody) {
                                            setBodyBackground(
                                                settings.manifestThemeName,
                                                settings.manifestParentThemeName,
                                                color
                                            );
                                            deleteBodyWrapper(innerWrapped, node);
                                            return;
                                        }
                                    }
                                }
                                const fontStyle = node.data(Resource.KEY_NAME, 'fontStyle');
                                if (fontStyle) {
                                    fontStyle.backgroundColor = backgroundColor;
                                } else {
                                    node.android('background', color, false);
                                }
                            }
                        }
                    }
                }
            });
        }
        getDrawableBorder(data, images, indentWidth, borderOnly = false, outline) {
            const borderVisible = new Array(4);
            const indentOffset = indentWidth ? formatPX$b(indentWidth) : '';
            let shapeData = null,
                layerList = null,
                borderStyle = true,
                borderAll = true,
                borders,
                border,
                corners,
                borderData;
            if (!borderOnly) {
                const radius = data.borderRadius;
                if (radius) {
                    switch (radius.length) {
                        case 1:
                            corners = { radius: radius[0] };
                            break;
                        case 8: {
                            const result = new Array(4);
                            for (let i = 0, j = 0; i < 8; i += 2) {
                                result[j++] = formatPX$b((parseFloat(radius[i]) + parseFloat(radius[i + 1])) / 2);
                            }
                            corners = getCornerRadius(result);
                            break;
                        }
                        default:
                            corners = getCornerRadius(radius);
                            break;
                    }
                }
            }
            if (outline) {
                borderData = outline;
                borders = new Array(4);
                for (let i = 0; i < 4; ++i) {
                    borders[i] = outline;
                    borderVisible[i] = true;
                }
            } else {
                borders = [data.borderTop, data.borderRight, data.borderBottom, data.borderLeft];
                for (let i = 0; i < 4; ++i) {
                    const item = borders[i];
                    if (item) {
                        if (borderStyle && borderData) {
                            borderStyle = isEqual(borderData, item);
                            if (!borderStyle) {
                                borderAll = false;
                            }
                        }
                        borderData = item;
                        borderVisible[i] = true;
                    } else {
                        borderVisible[i] = false;
                        borderAll = false;
                    }
                }
            }
            if (borderAll) {
                border = borderData;
            }
            if (
                (border &&
                    !isAlternatingBorder(border.style, roundFloat(border.width)) &&
                    !(border.style === 'double' && parseInt(border.width) > 1)) ||
                (!borderData && (corners || (images && images.length)))
            ) {
                const stroke = border ? getBorderStroke(border) : false;
                if ((images && images.length) || indentWidth || borderOnly) {
                    layerList = createLayerList(data, images, borderOnly, stroke, corners, indentOffset);
                } else {
                    shapeData = [
                        {
                            'xmlns:android': XML_NAMESPACE.android,
                            'android:shape': 'rectangle',
                            stroke,
                            solid: !borderOnly && getBackgroundColor(data.backgroundColor),
                            corners,
                        },
                    ];
                }
            } else if (borderData) {
                layerList = createLayerList(data, images, borderOnly);
                if (borderStyle && !isAlternatingBorder(borderData.style)) {
                    const width = roundFloat(borderData.width);
                    if (borderData.style === 'double' && width > 1) {
                        insertDoubleBorder(
                            layerList[0].item,
                            borderData,
                            borderVisible[0],
                            borderVisible[1],
                            borderVisible[2],
                            borderVisible[3],
                            indentWidth,
                            corners
                        );
                    } else {
                        const hideOffset = '-' + formatPX$b(width + indentWidth + 1);
                        layerList[0].item.push({
                            top: borderVisible[0] ? indentOffset : hideOffset,
                            right: borderVisible[1] ? indentOffset : hideOffset,
                            bottom: borderVisible[2] ? indentOffset : hideOffset,
                            left: borderVisible[3] ? indentOffset : hideOffset,
                            shape: {
                                'android:shape': 'rectangle',
                                corners,
                                stroke: getBorderStroke(borderData),
                            },
                        });
                    }
                } else {
                    const layerData = layerList[0];
                    setBorderStyle(layerData, borders, 0, corners, indentWidth, indentOffset);
                    setBorderStyle(layerData, borders, 3, corners, indentWidth, indentOffset);
                    setBorderStyle(layerData, borders, 2, corners, indentWidth, indentOffset);
                    setBorderStyle(layerData, borders, 1, corners, indentWidth, indentOffset);
                }
            }
            return [shapeData, layerList];
        }
        getDrawableImages(node, data, boxImage) {
            var _a;
            const backgroundImage = data.backgroundImage;
            if (backgroundImage || boxImage) {
                const resource = this.resource;
                const screenDimension = node.localSettings.screenDimension;
                const { bounds, fontSize } = node;
                const { width: boundsWidth, height: boundsHeight } = bounds;
                const documentBody = node.innerMostWrapped.documentBody;
                const result = [];
                const svg = [];
                const images = [];
                const imageDimensions = [];
                const backgroundPosition = [];
                const backgroundPositionX = data.backgroundPositionX.split(CHAR_SEPARATOR);
                const backgroundPositionY = data.backgroundPositionY.split(CHAR_SEPARATOR);
                let backgroundRepeat = data.backgroundRepeat.split(CHAR_SEPARATOR),
                    backgroundSize = data.backgroundSize.split(CHAR_SEPARATOR),
                    length = 0;
                if (backgroundImage) {
                    const svgInstance = this._resourceSvgInstance;
                    const q = backgroundImage.length;
                    const fillAttribute = attribute => {
                        while (attribute.length < q) {
                            attribute = attribute.concat(attribute.slice(0));
                        }
                        attribute.length = q;
                        return attribute;
                    };
                    backgroundRepeat = fillAttribute(backgroundRepeat);
                    backgroundSize = fillAttribute(backgroundSize);
                    let modified;
                    for (let i = 0; i < q; ++i) {
                        let value = backgroundImage[i],
                            valid;
                        if (typeof value === 'string') {
                            if (value !== 'initial') {
                                if (svgInstance) {
                                    const [parentElement, element] = svgInstance.createSvgElement(node, value);
                                    if (parentElement && element) {
                                        const drawable = svgInstance.createSvgDrawable(node, element);
                                        if (drawable) {
                                            const dimension = ((_a = node.data(Resource.KEY_NAME, 'svg')) === null ||
                                            _a === void 0
                                                ? void 0
                                                : _a.viewBox) || {
                                                width: element.width.baseVal.value,
                                                height: element.height.baseVal.value,
                                            };
                                            if (!node.svgElement) {
                                                let { width, height } = dimension;
                                                if (width > boundsWidth || height > boundsHeight) {
                                                    const ratioWidth = width / boundsWidth;
                                                    const ratioHeight = height / boundsHeight;
                                                    if (ratioWidth > ratioHeight) {
                                                        if (ratioWidth > 1) {
                                                            width = boundsWidth;
                                                            height /= ratioWidth;
                                                        } else {
                                                            height = boundsHeight * (ratioHeight / ratioWidth);
                                                        }
                                                    } else if (ratioHeight > 1) {
                                                        height = boundsHeight;
                                                        width /= ratioHeight;
                                                    } else {
                                                        width = boundsWidth * (ratioWidth / ratioHeight);
                                                    }
                                                }
                                                dimension.width = width;
                                                dimension.height = height;
                                            }
                                            images[length] = drawable;
                                            imageDimensions[length] = dimension;
                                            svg[length] = true;
                                            valid = true;
                                        }
                                        parentElement.removeChild(element);
                                    }
                                }
                                if (!valid) {
                                    const uri = extractURL$1(value);
                                    if (uri) {
                                        if (uri.startsWith('data:image/')) {
                                            const rawData = resource.getRawData(uri);
                                            if (rawData) {
                                                const { base64, filename } = rawData;
                                                if (base64 && filename) {
                                                    images[length] = filename.substring(0, filename.lastIndexOf('.'));
                                                    imageDimensions[length] =
                                                        rawData.width && rawData.height ? rawData : null;
                                                    resource.writeRawImage({
                                                        mimeType: rawData.mimeType,
                                                        filename,
                                                        data: base64,
                                                        encoding: 'base64',
                                                    });
                                                    valid = true;
                                                }
                                            }
                                        } else {
                                            value = resolvePath$1(uri);
                                            const src = resource.addImageSet({ mdpi: value });
                                            images[length] = src;
                                            if (src !== '') {
                                                imageDimensions[length] = resource.getImage(value);
                                                valid = true;
                                            }
                                        }
                                    }
                                }
                            }
                        } else if (value.colorStops.length > 1) {
                            const gradient = createBackgroundGradient(value, node.api, q, data.borderRadius);
                            if (gradient) {
                                images[length] = gradient;
                                imageDimensions[length] = value.dimension;
                                valid = true;
                            }
                        }
                        if (valid) {
                            const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                            const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                            backgroundPosition[length] = Resource.getBackgroundPosition(
                                checkBackgroundPosition(x, y, 'left') + ' ' + checkBackgroundPosition(y, x, 'top'),
                                node.actualDimension,
                                {
                                    fontSize,
                                    imageDimension: imageDimensions[length],
                                    imageSize: backgroundSize[i],
                                    screenDimension,
                                }
                            );
                            ++length;
                        } else {
                            backgroundRepeat[i] = '';
                            backgroundSize[i] = '';
                            modified = true;
                        }
                    }
                    if (modified) {
                        spliceArray(backgroundRepeat, value => value === '');
                        spliceArray(backgroundSize, value => value === '');
                    }
                }
                if (boxImage) {
                    const getPixelUnit = (width, height) => `${width}px ${height}px`;
                    if (length === 0) {
                        backgroundRepeat.length = 0;
                        backgroundSize.length = 0;
                    }
                    for (const image of boxImage.filter(
                        item => item.visible && (item.imageElement || item.containerName === 'INPUT_IMAGE')
                    )) {
                        const element = image.element;
                        const src = resource.addImageSrc(element);
                        if (src !== '') {
                            const imageDimension = image.bounds;
                            images[length] = src;
                            backgroundRepeat[length] = 'no-repeat';
                            backgroundSize[length] = getPixelUnit(image.actualWidth, image.actualHeight);
                            const position = Resource.getBackgroundPosition(
                                image.containerName === 'INPUT_IMAGE'
                                    ? getPixelUnit(0, 0)
                                    : getPixelUnit(
                                          imageDimension.left - bounds.left + node.borderLeftWidth,
                                          imageDimension.top - bounds.top + node.borderTopWidth
                                      ),
                                node.actualDimension,
                                {
                                    fontSize,
                                    imageDimension,
                                    screenDimension,
                                }
                            );
                            const stored = resource.getImage(element.src);
                            if (!node.hasPX('width')) {
                                const offsetStart =
                                    ((stored === null || stored === void 0 ? void 0 : stored.width) ||
                                        element.naturalWidth) +
                                    position.left -
                                    (node.paddingLeft + node.borderLeftWidth);
                                if (offsetStart > 0) {
                                    node.modifyBox(128 /* PADDING_LEFT */, offsetStart);
                                }
                            }
                            imageDimensions[length] = stored;
                            backgroundPosition[length] = position;
                            ++length;
                        }
                    }
                }
                for (let i = length - 1, j = 0; i >= 0; --i) {
                    const value = images[i];
                    const imageData = { order: Infinity };
                    if (typeof value === 'object' && !value.positioning) {
                        imageData.gravity = 'fill';
                        imageData.gradient = value;
                        imageData.order = j++;
                        result.push(imageData);
                        continue;
                    }
                    const position = backgroundPosition[i];
                    const padded = position.orientation.length === 4;
                    const size = backgroundSize[i];
                    let repeat = backgroundRepeat[i],
                        dimension = imageDimensions[i] || null,
                        dimenWidth = NaN,
                        dimenHeight = NaN,
                        bitmap = svg[i] !== true,
                        autoFit = node.is(CONTAINER_NODE.IMAGE) || typeof value !== 'string',
                        top = 0,
                        right = 0,
                        bottom = 0,
                        left = 0,
                        width = 0,
                        height = 0,
                        negativeOffset = 0,
                        posTop = NaN,
                        posRight = NaN,
                        posBottom = NaN,
                        posLeft = NaN,
                        tileModeX = '',
                        tileModeY = '',
                        gravityX = '',
                        gravityY = '',
                        gravityAlign = '',
                        offsetX,
                        offsetY;
                    if (dimension) {
                        if (!dimension.width || !dimension.height) {
                            dimension = null;
                        } else {
                            dimenWidth = dimension.width;
                            dimenHeight = dimension.height;
                        }
                    }
                    if (repeat.includes(' ')) {
                        const [x, y] = splitPair$1(repeat, ' ');
                        if (x === 'no-repeat') {
                            repeat = y === 'no-repeat' ? 'no-repeat' : 'repeat-y';
                        } else if (y === 'no-repeat') {
                            repeat = 'repeat-x';
                        } else {
                            repeat = 'repeat';
                        }
                    } else if (repeat === 'space' || repeat === 'round') {
                        repeat = 'repeat';
                    }
                    switch (repeat) {
                        case 'repeat':
                            tileModeX = 'repeat';
                            tileModeY = 'repeat';
                            break;
                        case 'repeat-x':
                            tileModeX = 'repeat';
                            tileModeY = 'disabled';
                            break;
                        case 'repeat-y':
                            tileModeX = 'disabled';
                            tileModeY = 'repeat';
                            break;
                        default:
                            tileModeX = 'disabled';
                            tileModeY = 'disabled';
                            break;
                    }
                    switch (position.horizontal) {
                        case 'left':
                        case '0%':
                        case '0px':
                            gravityX = node.localizeString('left');
                            if (padded) {
                                posLeft = 0;
                                offsetX = true;
                            }
                            break;
                        case 'center':
                        case '50%':
                            gravityX = 'center_horizontal';
                            break;
                        case 'right':
                        case '100%':
                            gravityX = node.localizeString('right');
                            posRight = 0;
                            if (padded) {
                                offsetX = true;
                            }
                            break;
                        default: {
                            const percent = position.leftAsPercent;
                            if (percent < 1) {
                                gravityX = 'left';
                                posLeft = 0;
                                offsetX = true;
                            } else {
                                gravityX = 'right';
                                posRight = 0;
                                offsetX = true;
                            }
                            break;
                        }
                    }
                    switch (position.vertical) {
                        case 'top':
                        case '0%':
                        case '0px':
                            gravityY = 'top';
                            if (padded) {
                                posTop = 0;
                                offsetY = true;
                            }
                            break;
                        case 'center':
                        case '50%':
                            gravityY = 'center_vertical';
                            break;
                        case 'bottom':
                        case '100%':
                            gravityY = 'bottom';
                            posBottom = 0;
                            if (padded) {
                                offsetY = true;
                            }
                            break;
                        default: {
                            const percent = position.topAsPercent;
                            if (percent < 1) {
                                gravityY = 'top';
                                posTop = 0;
                                offsetY = true;
                            } else {
                                gravityY = 'bottom';
                                posBottom = 0;
                                offsetY = true;
                            }
                            break;
                        }
                    }
                    switch (size) {
                        case 'auto':
                        case 'auto auto':
                        case 'initial':
                            if (typeof value !== 'string') {
                                gravityAlign = 'fill';
                            }
                            break;
                        case '100%':
                        case '100% 100%':
                        case '100% auto':
                        case 'auto 100%':
                            if (node.ascend({ condition: item => item.hasPX('width'), startSelf: true }).length) {
                                gravityX = '';
                                gravityY = '';
                            }
                        case 'contain':
                        case 'cover':
                        case 'round':
                            tileModeX = '';
                            tileModeY = '';
                            gravityAlign = 'fill';
                            if (documentBody) {
                                const visibleStyle = node.visibleStyle;
                                visibleStyle.backgroundRepeat = true;
                                visibleStyle.backgroundRepeatY = true;
                            }
                            break;
                        default:
                            if (size !== '') {
                                size.split(' ').forEach((dimen, index) => {
                                    if (dimen === '100%') {
                                        gravityAlign =
                                            index === 0
                                                ? 'fill_horizontal'
                                                : delimitString(
                                                      { value: gravityAlign, delimiter: '|' },
                                                      'fill_vertical'
                                                  );
                                    } else if (dimen !== 'auto') {
                                        if (index === 0) {
                                            if (tileModeX !== 'repeat' || !bitmap) {
                                                width = node.parseWidth(dimen, false);
                                            }
                                        } else if (tileModeY !== 'repeat' || !bitmap) {
                                            height = node.parseHeight(dimen, false);
                                        }
                                    }
                                });
                            }
                            break;
                    }
                    let recalibrate = true,
                        resizedWidth,
                        resizedHeight,
                        unsizedWidth,
                        unsizedHeight;
                    if (dimension) {
                        let fittedWidth = boundsWidth,
                            fittedHeight = boundsHeight;
                        if (size !== 'contain') {
                            if (!node.hasWidth) {
                                const innerWidth = window.innerWidth;
                                const screenWidth = screenDimension.width;
                                const getFittedWidth = () => boundsHeight * (fittedWidth / boundsWidth);
                                if (boundsWidth === innerWidth) {
                                    if (innerWidth >= screenWidth) {
                                        fittedWidth = screenWidth;
                                        fittedHeight = getFittedWidth();
                                    } else {
                                        ({ width: fittedWidth, height: fittedHeight } = node.fitToScreen(bounds));
                                    }
                                } else if (innerWidth >= screenWidth) {
                                    fittedWidth = node.actualBoxWidth(boundsWidth);
                                    fittedHeight = getFittedWidth();
                                }
                            }
                        }
                        const ratioWidth = dimenWidth / fittedWidth;
                        const ratioHeight = dimenHeight / fittedHeight;
                        const getImageWidth = () => (dimenWidth * height) / dimenHeight;
                        const getImageHeight = () => (dimenHeight * width) / dimenWidth;
                        const getImageRatioWidth = () => fittedWidth * (ratioWidth / ratioHeight);
                        const getImageRatioHeight = () => fittedHeight * (ratioHeight / ratioWidth);
                        const resetGravityPosition = (gravity, coordinates) => {
                            tileModeX = '';
                            tileModeY = '';
                            gravityAlign = '';
                            if (gravity) {
                                gravityX = '';
                                gravityY = '';
                            }
                            if (coordinates) {
                                posTop = NaN;
                                posRight = NaN;
                                posBottom = NaN;
                                posLeft = NaN;
                                offsetX = false;
                                offsetY = false;
                            }
                            recalibrate = false;
                        };
                        switch (size) {
                            case '100%':
                            case '100% 100%':
                            case '100% auto':
                            case 'auto 100%':
                                if (dimenHeight >= boundsHeight) {
                                    unsizedWidth = true;
                                    unsizedHeight = true;
                                    height = boundsHeight;
                                    autoFit = true;
                                    break;
                                }
                            case 'cover': {
                                const covering = size === 'cover';
                                resetGravityPosition(covering, !covering);
                                if (ratioWidth < ratioHeight) {
                                    width = fittedWidth;
                                    height = getImageRatioHeight();
                                    if (height > boundsHeight) {
                                        const percent = position.topAsPercent;
                                        if (percent !== 0) {
                                            top = Math.round((boundsHeight - height) * percent);
                                        }
                                        const attr =
                                            node.layoutConstraint || node.layoutRelative ? 'minHeight' : 'height';
                                        if (!node.hasPX(attr)) {
                                            node.css(attr, formatPX$b(boundsHeight - node.contentBoxHeight));
                                        }
                                        if (!offsetX) {
                                            gravityAlign = 'center_horizontal|fill_horizontal';
                                        }
                                    } else {
                                        if (height < boundsHeight) {
                                            width = (fittedWidth * boundsHeight) / height;
                                            height = boundsHeight;
                                        }
                                        if (!offsetX) {
                                            gravityAlign = 'center_horizontal|fill';
                                        }
                                    }
                                } else if (ratioWidth > ratioHeight) {
                                    width = getImageRatioWidth();
                                    height = fittedHeight;
                                    if (width > boundsWidth) {
                                        if (node.hasWidth) {
                                            const percent = position.leftAsPercent;
                                            if (percent !== 0) {
                                                left = Math.round((boundsWidth - width) * percent);
                                            }
                                        }
                                        if (!offsetY) {
                                            gravityAlign = 'center_vertical|fill_vertical';
                                        }
                                    } else {
                                        if (width < boundsWidth) {
                                            width = boundsWidth;
                                            height = (fittedHeight * boundsWidth) / width;
                                        }
                                        if (!offsetY) {
                                            gravityAlign = 'center_vertical|fill';
                                        }
                                    }
                                    offsetX = false;
                                } else {
                                    gravityAlign = 'fill';
                                }
                                offsetY = false;
                                break;
                            }
                            case 'contain':
                                resetGravityPosition(true, true);
                                if (ratioWidth > ratioHeight) {
                                    height = getImageRatioHeight();
                                    width = dimenWidth < boundsWidth ? getImageWidth() : boundsWidth;
                                    gravityY = 'center_vertical';
                                    gravityAlign = 'fill_horizontal';
                                } else if (ratioWidth < ratioHeight) {
                                    width = getImageRatioWidth();
                                    height = dimenHeight < boundsHeight ? getImageHeight() : boundsHeight;
                                    gravityX = 'center_horizontal';
                                    gravityAlign = 'fill_vertical';
                                } else {
                                    gravityAlign = 'fill';
                                }
                                break;
                            default:
                                if (width === 0 && height) {
                                    width = getImageWidth();
                                }
                                if (height === 0 && width) {
                                    height = getImageHeight();
                                }
                                break;
                        }
                    }
                    if (data.backgroundClip) {
                        const {
                            top: clipTop,
                            right: clipRight,
                            left: clipLeft,
                            bottom: clipBottom,
                        } = data.backgroundClip;
                        if (width === 0) {
                            width = boundsWidth;
                        } else {
                            width += node.contentBoxWidth;
                        }
                        if (height === 0) {
                            height = boundsHeight;
                        } else {
                            height += node.contentBoxHeight;
                        }
                        width -= clipLeft + clipRight;
                        height -= clipTop + clipBottom;
                        if (!isNaN(posRight)) {
                            right += clipRight;
                        } else {
                            left += clipLeft;
                        }
                        if (!isNaN(posBottom)) {
                            bottom += clipBottom;
                        } else {
                            top += clipTop;
                        }
                        gravityX = '';
                        gravityY = '';
                    } else if (recalibrate) {
                        if (data.backgroundOrigin) {
                            if (tileModeX !== 'repeat') {
                                if (!isNaN(posRight)) {
                                    right += data.backgroundOrigin.right;
                                } else {
                                    left += data.backgroundOrigin.left;
                                }
                            }
                            if (tileModeY !== 'repeat') {
                                if (!isNaN(posBottom)) {
                                    bottom += data.backgroundOrigin.bottom;
                                } else {
                                    top += data.backgroundOrigin.top;
                                }
                            }
                        }
                        if (!autoFit && !documentBody) {
                            if (width === 0 && dimenWidth > boundsWidth) {
                                width = boundsWidth - (offsetX ? Math.min(position.left, 0) : 0);
                                let fill = true;
                                if (tileModeY === 'repeat' && gravityX !== '') {
                                    switch (gravityX) {
                                        case 'start':
                                        case 'left':
                                            right += boundsWidth - dimenWidth;
                                            if (offsetX) {
                                                const offset = position.left;
                                                if (offset < 0) {
                                                    negativeOffset = offset;
                                                }
                                                width = 0;
                                                right -= offset;
                                                fill = false;
                                                gravityX = 'right';
                                                tileModeY = '';
                                            } else {
                                                gravityX = '';
                                            }
                                            posLeft = NaN;
                                            posRight = 0;
                                            break;
                                        case 'center_horizontal':
                                            gravityX += '|fill_vertical';
                                            tileModeY = '';
                                            break;
                                        case 'right':
                                            left += boundsWidth - dimenWidth;
                                            if (offsetX) {
                                                const offset = position.right;
                                                if (offset < 0) {
                                                    negativeOffset = offset;
                                                }
                                                width = 0;
                                                left -= offset;
                                                fill = false;
                                                gravityX = node.localizeString('left');
                                                tileModeY = '';
                                            } else {
                                                gravityX = '';
                                            }
                                            posLeft = 0;
                                            posRight = NaN;
                                            break;
                                    }
                                    offsetX = false;
                                    gravityY = '';
                                }
                                if (fill) {
                                    gravityAlign = delimitString(
                                        { value: gravityAlign, delimiter: '|', not: ['fill'] },
                                        'fill_horizontal'
                                    );
                                }
                                if (tileModeX !== 'disabled') {
                                    tileModeX = '';
                                }
                                resizedWidth = true;
                            }
                            if (height === 0 && dimenHeight > boundsHeight) {
                                height = boundsHeight;
                                let fill = true;
                                if (tileModeX === 'repeat' && gravityY !== '') {
                                    switch (gravityY) {
                                        case 'top':
                                            if (offsetY) {
                                                bottom += boundsHeight - dimenHeight;
                                                const offset = position.top;
                                                if (offset < 0) {
                                                    negativeOffset = offset;
                                                }
                                                height = 0;
                                                bottom -= offset;
                                                fill = false;
                                                gravityY = 'bottom';
                                                tileModeX = '';
                                                posTop = NaN;
                                                posBottom = 0;
                                            }
                                            break;
                                        case 'center_vertical':
                                            gravityY += '|fill_horizontal';
                                            tileModeX = '';
                                            break;
                                        case 'bottom':
                                            top += boundsHeight - dimenHeight;
                                            if (offsetY) {
                                                const offset = position.bottom;
                                                if (offset < 0) {
                                                    negativeOffset = offset;
                                                }
                                                height = 0;
                                                top -= offset;
                                                fill = false;
                                                gravityY = 'top';
                                            } else {
                                                gravityY = '';
                                            }
                                            tileModeX = '';
                                            posTop = 0;
                                            posBottom = NaN;
                                            break;
                                    }
                                    gravityX = '';
                                    offsetY = false;
                                }
                                if (fill) {
                                    gravityAlign = delimitString(
                                        { value: gravityAlign, delimiter: '|', not: ['fill'] },
                                        'fill_vertical'
                                    );
                                }
                                if (tileModeY !== 'disabled') {
                                    tileModeY = '';
                                }
                                resizedHeight = true;
                            }
                        }
                    }
                    switch (node.controlName) {
                        case SUPPORT_TAGNAME.TOOLBAR:
                        case SUPPORT_TAGNAME_X.TOOLBAR:
                            gravityX = '';
                            gravityY = '';
                            gravityAlign = 'fill';
                            break;
                    }
                    if (!autoFit) {
                        if (width === 0 && dimenWidth < boundsWidth && tileModeX === 'disabled') {
                            width = dimenWidth;
                            unsizedWidth = true;
                        }
                        if (height === 0 && dimenHeight < boundsHeight && tileModeY === 'disabled') {
                            height = dimenHeight;
                            unsizedHeight = true;
                        }
                        const originalX = gravityX;
                        if (tileModeX === 'repeat') {
                            switch (gravityY) {
                                case 'top':
                                    if (!isNaN(posTop)) {
                                        tileModeX = '';
                                    }
                                    gravityY = '';
                                    break;
                                case 'bottom':
                                    if (width && !unsizedWidth) {
                                        tileModeX = '';
                                    } else if (unsizedHeight) {
                                        width = dimenWidth;
                                        gravityAlign = delimitString(
                                            { value: gravityAlign, delimiter: '|', not: ['fill'] },
                                            'fill_horizontal'
                                        );
                                        if (dimenHeight >= dimenWidth) {
                                            tileModeX = '';
                                        }
                                    }
                                    break;
                            }
                            gravityX = '';
                        }
                        if (tileModeY === 'repeat') {
                            switch (originalX) {
                                case 'left':
                                case 'start':
                                    if (!isNaN(posLeft)) {
                                        tileModeY = '';
                                    }
                                    gravityX = '';
                                    break;
                                case 'center_horizontal':
                                    if (node.rendering) {
                                        tileModeY = '';
                                    }
                                    break;
                                case 'right':
                                case 'end':
                                    if (height && !unsizedHeight) {
                                        tileModeY = '';
                                    } else if (unsizedWidth) {
                                        height = dimenHeight;
                                        gravityAlign = delimitString(
                                            { value: gravityAlign, delimiter: '|', not: ['fill'] },
                                            'fill_vertical'
                                        );
                                        if (dimenWidth >= dimenHeight) {
                                            tileModeY = '';
                                        }
                                    }
                                    break;
                            }
                            gravityY = '';
                        }
                        if (gravityX !== '' && !resizedWidth) {
                            gravityAlign = delimitString({ value: gravityAlign, delimiter: '|' }, gravityX);
                            gravityX = '';
                        }
                        if (gravityY !== '' && !resizedHeight) {
                            gravityAlign = delimitString({ value: gravityAlign, delimiter: '|' }, gravityY);
                            gravityY = '';
                        }
                    } else if (width === 0 && height === 0 && gravityAlign === 'fill') {
                        bitmap = false;
                    }
                    let src;
                    if (typeof value === 'string') {
                        src = `@drawable/${value}`;
                    } else if (value.item) {
                        if (width === 0) {
                            width = dimension ? dimension.width : node.fitToScreen(node.actualDimension).width;
                        }
                        if (height === 0) {
                            height = dimension ? dimension.height : node.fitToScreen(node.actualDimension).height;
                        }
                        const gradient = Resource.insertStoredAsset(
                            'drawables',
                            `${node.controlId}_gradient_${i + 1}`,
                            applyTemplate('vector', VECTOR_TMPL, [
                                {
                                    'xmlns:android': XML_NAMESPACE.android,
                                    'xmlns:aapt': XML_NAMESPACE.aapt,
                                    'android:width': formatPX$b(width),
                                    'android:height': formatPX$b(height),
                                    'android:viewportWidth': width.toString(),
                                    'android:viewportHeight': height.toString(),
                                    'path': {
                                        pathData: drawRect(width, height),
                                        'aapt:attr': {
                                            name: 'android:fillColor',
                                            gradient: value,
                                        },
                                    },
                                },
                            ])
                        );
                        if (gradient !== '') {
                            src = `@drawable/${gradient}`;
                            imageData.order = j++;
                            imageData.vectorGradient = true;
                        }
                        if (gravityX === 'left' || gravityX === 'start') {
                            gravityX = '';
                        }
                        if (gravityY === 'top') {
                            gravityY = '';
                        }
                        if (gravityAlign !== 'fill') {
                            if (tileModeX === 'repeat' && tileModeY === 'repeat') {
                                gravityAlign = 'fill';
                            } else if (tileModeX === 'repeat') {
                                if (gravityAlign === 'fill_vertical') {
                                    gravityAlign = 'fill';
                                } else {
                                    gravityAlign = 'fill_horizontal';
                                }
                            } else if (tileModeY === 'repeat') {
                                if (gravityAlign === 'fill_horizontal') {
                                    gravityAlign = 'fill';
                                } else {
                                    gravityAlign = 'fill_vertical';
                                }
                            }
                        }
                    }
                    const gravity =
                        gravityX === 'center_horizontal' && gravityY === 'center_vertical'
                            ? 'center'
                            : delimitString({ value: gravityX, delimiter: '|' }, gravityY);
                    if (src) {
                        if (
                            bitmap &&
                            ((!autoFit &&
                                ((gravityAlign !== '' && gravity !== '') ||
                                    tileModeX === 'repeat' ||
                                    tileModeY === 'repeat' ||
                                    documentBody)) ||
                                unsizedWidth ||
                                unsizedHeight)
                        ) {
                            let tileMode = '';
                            if (tileModeX === 'disabled' && tileModeY === 'disabled') {
                                tileMode = 'disabled';
                                tileModeX = '';
                                tileModeY = '';
                            } else if (tileModeX === 'repeat' && tileModeY === 'repeat') {
                                tileMode = 'repeat';
                                tileModeX = '';
                                tileModeY = '';
                            }
                            imageData.gravity = gravityAlign;
                            imageData.bitmap = [
                                {
                                    src,
                                    gravity,
                                    tileMode,
                                    tileModeX,
                                    tileModeY,
                                },
                            ];
                        } else {
                            imageData.gravity = delimitString({ value: gravity, delimiter: '|' }, gravityAlign);
                            imageData.drawable = src;
                        }
                        if (imageData.drawable || imageData.bitmap || imageData.gradient) {
                            if (!isNaN(posBottom)) {
                                if (offsetY) {
                                    bottom += position.bottom;
                                }
                                bottom += posBottom;
                                if (bottom !== 0) {
                                    imageData.bottom = formatPX$b(bottom);
                                }
                                if (negativeOffset < 0) {
                                    imageData.top = formatPX$b(negativeOffset);
                                }
                            } else {
                                if (offsetY) {
                                    top += position.top;
                                }
                                if (!isNaN(posTop)) {
                                    top += posTop;
                                }
                                if (top !== 0) {
                                    imageData.top = formatPX$b(top);
                                }
                                if (negativeOffset < 0) {
                                    imageData.bottom = formatPX$b(negativeOffset);
                                }
                            }
                            if (!isNaN(posRight)) {
                                if (offsetX) {
                                    right += position.right;
                                }
                                right += posRight;
                                if (right !== 0) {
                                    imageData[node.localizeString('right')] = formatPX$b(right);
                                }
                                if (negativeOffset < 0) {
                                    imageData[node.localizeString('left')] = formatPX$b(negativeOffset);
                                }
                            } else {
                                if (offsetX) {
                                    left += position.left;
                                }
                                if (!isNaN(posLeft)) {
                                    left += posLeft;
                                }
                                if (left !== 0) {
                                    imageData[node.localizeString('left')] = formatPX$b(left);
                                }
                                if (negativeOffset < 0) {
                                    imageData[node.localizeString('right')] = formatPX$b(negativeOffset);
                                }
                            }
                            if (width) {
                                imageData.width = formatPX$b(width);
                            }
                            if (height) {
                                imageData.height = formatPX$b(height);
                            }
                            result.push(imageData);
                        }
                    }
                }
                return result.sort((a, b) => a.order - b.order);
            }
        }
    }

    const { capitalize: capitalize$4 } = squared.lib.util;
    class ResourceData extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeDocumentWrite(data) {
            const viewModel = this.application.viewModel;
            if (viewModel.size) {
                const { rendered, documentRoot } = data;
                const controller = this.controller;
                const applied = new Set();
                for (let i = 0, length = rendered.length; i < length; ++i) {
                    const node = rendered[i];
                    if (node.styleElement) {
                        for (const [name] of node.namespaces()) {
                            const dataset = getDataSet(node.dataset, 'viewmodel' + capitalize$4(name));
                            if (dataset) {
                                for (const attr in dataset) {
                                    node.attr(name, attr, `@{${dataset[attr]}}`, true);
                                }
                                applied.add(node);
                            }
                        }
                    }
                }
                if (applied.size) {
                    for (let i = 0, length = documentRoot.length; i < length; ++i) {
                        const node = documentRoot[i].node;
                        const viewData = viewModel.get(node.sessionId) || viewModel.get('0');
                        if (viewData) {
                            for (const child of applied) {
                                if (child.ascend({ condition: item => item === node, attr: 'renderParent' }).length) {
                                    const { import: importing, variable } = viewData;
                                    const depth = node.depth;
                                    const indentA = '\t'.repeat(depth);
                                    const indentB = '\t'.repeat(depth + 1);
                                    const indentC = '\t'.repeat(depth + 2);
                                    let output = indentA + '<layout {#0}>\n' + indentB + '<data>\n';
                                    if (importing) {
                                        for (let j = 0, q = importing.length; j < q; ++j) {
                                            output += indentC + `<import type="${importing[j]}" />\n`;
                                        }
                                    }
                                    if (variable) {
                                        for (let j = 0, q = variable.length; j < q; ++j) {
                                            const { name, type } = variable[j];
                                            output += indentC + `<variable name="${name}" type="${type}" />\n`;
                                        }
                                    }
                                    output += indentB + '</data>\n';
                                    controller.addBeforeOutsideTemplate(node, output);
                                    controller.addAfterOutsideTemplate(node, indentA + '</layout>\n');
                                    node.depth = depth - 1;
                                    applied.delete(child);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    var Pattern = squared.lib.base.Pattern;
    const { convertHyphenated, fromLastIndexOf: fromLastIndexOf$3 } = squared.lib.util;
    const RE_DIMENS = new Pattern(/:(\w+)="(-?[\d.]+px)"/g);
    function getResourceName(map, name, value) {
        if (map.get(name) === value) {
            return name;
        }
        for (const data of map) {
            if (value === data[1] && data[0].startsWith(name)) {
                return data[0];
            }
        }
        return Resource.generateId('dimen', name, 0);
    }
    function createNamespaceData(namespace, node, group) {
        const obj = node.namespace(namespace);
        for (const attr in obj) {
            if (attr !== 'text') {
                const value = obj[attr];
                if (value.endsWith('px')) {
                    const name = namespace + ',' + attr + ',' + value;
                    (group[name] || (group[name] = [])).push(node);
                }
            }
        }
    }
    class ResourceDimens extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeDocumentWrite(data) {
            const dimens = Resource.STORED.dimens;
            const rendered = data.rendered;
            const groups = {};
            for (let i = 0, length = rendered.length; i < length; ++i) {
                const node = rendered[i];
                if (node.visible) {
                    const containerName = node.containerName.toLowerCase();
                    const group = groups[containerName] || (groups[containerName] = {});
                    createNamespaceData('android', node, group);
                    createNamespaceData('app', node, group);
                }
            }
            for (const containerName in groups) {
                const group = groups[containerName];
                for (const name in group) {
                    const [namespace, attr, value] = name.split(',');
                    const key = getResourceName(
                        dimens,
                        fromLastIndexOf$3(containerName, '.') + '_' + convertHyphenated(attr, '_'),
                        value
                    );
                    const items = group[name];
                    for (let i = 0, length = items.length; i < length; ++i) {
                        items[i].attr(namespace, attr, `@dimen/${key}`);
                    }
                    dimens.set(key, value);
                }
            }
        }
        afterFinalize() {
            if (this.controller.hasAppendProcessing()) {
                const dimens = Resource.STORED.dimens;
                for (const layout of this.application.layouts) {
                    let content = layout.content;
                    RE_DIMENS.matcher(content);
                    while (RE_DIMENS.find()) {
                        const [original, name, value] = RE_DIMENS.groups();
                        if (name !== 'text') {
                            const key = getResourceName(dimens, 'custom_' + convertHyphenated(name, '_'), value);
                            content = content.replace(original, original.replace(value, `@dimen/${key}`));
                            dimens.set(key, value);
                        }
                    }
                    if (RE_DIMENS.found) {
                        layout.content = content;
                    }
                }
            }
        }
    }

    const { NODE_RESOURCE: NODE_RESOURCE$a } = squared.base.lib.constant;
    const { truncate: truncate$7 } = squared.lib.math;
    const {
        capitalize: capitalize$5,
        convertWord: convertWord$2,
        hasKeys: hasKeys$1,
        joinArray: joinArray$1,
        spliceArray: spliceArray$1,
        trimBoth,
    } = squared.lib.util;
    const REGEXP_FONTATTRIBUTE = /([^\s]+)="((?:[^"]|\\")+)"/;
    const REGEXP_FONTNAME = /^(\w*?)(?:_(\d+))?$/;
    const FONT_NAME = {
        'sans-serif': 14 /* ICE_CREAM_SANDWICH */,
        'sans-serif-thin': 16 /* JELLYBEAN */,
        'sans-serif-light': 16 /* JELLYBEAN */,
        'sans-serif-condensed': 16 /* JELLYBEAN */,
        'sans-serif-condensed-light': 16 /* JELLYBEAN */,
        'sans-serif-medium': 21 /* LOLLIPOP */,
        'sans-serif-black': 21 /* LOLLIPOP */,
        'sans-serif-smallcaps': 21 /* LOLLIPOP */,
        'serif-monospace': 21 /* LOLLIPOP */,
        'serif': 21 /* LOLLIPOP */,
        'casual': 21 /* LOLLIPOP */,
        'cursive': 21 /* LOLLIPOP */,
        'monospace': 21 /* LOLLIPOP */,
        'sans-serif-condensed-medium': 26 /* OREO */,
    };
    const FONT_ALIAS = {
        'arial': 'sans-serif',
        'helvetica': 'sans-serif',
        'tahoma': 'sans-serif',
        'verdana': 'sans-serif',
        'times': 'serif',
        'times new roman': 'serif',
        'palatino': 'serif',
        'georgia': 'serif',
        'baskerville': 'serif',
        'goudy': 'serif',
        'fantasy': 'serif',
        'itc stone serif': 'serif',
        'sans-serif-monospace': 'monospace',
        'monaco': 'monospace',
        'courier': 'serif-monospace',
        'courier new': 'serif-monospace',
    };
    const FONT_REPLACE = {
        'arial black': 'sans-serif',
        'ms shell dlg \\32': 'sans-serif',
        'system-ui': 'sans-serif',
        '-apple-system': 'sans-serif',
        '-webkit-standard': 'sans-serif',
    };
    const FONT_WEIGHT = {
        '100': 'thin',
        '200': 'extra_light',
        '300': 'light',
        '400': 'normal',
        '500': 'medium',
        '600': 'semi_bold',
        '700': 'bold',
        '800': 'extra_bold',
        '900': 'black',
    };
    const FONT_STYLE = {
        'fontFamily': 'android:fontFamily="',
        'fontStyle': 'android:textStyle="',
        'fontWeight': 'android:fontWeight="',
        'fontSize': 'android:textSize="',
        'color': 'android:textColor="@color/',
        'backgroundColor': 'android:background="@color/',
    };
    function deleteStyleAttribute(sorted, attrs, nodes) {
        for (let i = 0, length = attrs.length, q = sorted.length; i < length; ++i) {
            const value = attrs[i];
            found: {
                for (let j = 0; j < q; ++j) {
                    const data = sorted[j];
                    for (const attr in data) {
                        if (attr === value) {
                            data[attr] = data[attr].filter(node => !nodes.includes(node));
                            if (data[attr].length === 0) {
                                delete data[attr];
                            }
                            break found;
                        }
                    }
                }
            }
        }
    }
    class ResourceFonts extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.options = {
                defaultFontFamily: 'sans-serif',
                floatPrecision: 2,
                disableFontAlias: false,
            };
            this.eventOnly = true;
        }
        afterParseDocument(sessionId) {
            const resource = this.resource;
            const userSettings = resource.userSettings;
            const { defaultFontFamily, floatPrecision, disableFontAlias } = this.options;
            const api = userSettings.targetAPI;
            const convertPixels = userSettings.convertPixels === 'dp';
            const { fonts, styles } = resource.mapOfStored;
            const nameMap = {};
            const groupMap = {};
            let cache = [];
            this.application.getProcessingCache(sessionId).each(node => {
                if (node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource(NODE_RESOURCE$a.FONT_STYLE)) {
                    const containerName = node.containerName;
                    (nameMap[containerName] || (nameMap[containerName] = [])).push(node);
                }
            });
            for (const tag in nameMap) {
                const data = nameMap[tag];
                const sorted = [{}, {}, {}];
                const addFontItem = (node, index, attr, value) => {
                    const items = sorted[index] || (sorted[index] = {});
                    const name = FONT_STYLE[attr] + value + '"';
                    (items[name] || (items[name] = [])).push(node);
                };
                cache = cache.concat(data);
                for (let i = 0, length = data.length; i < length; ++i) {
                    const node = data[i];
                    const stored = node.data(Resource.KEY_NAME, 'fontStyle');
                    let { backgroundColor, fontFamily, fontStyle, fontWeight } = stored;
                    const companion = node.companion;
                    if (companion && !companion.visible && companion.tagName === 'LABEL') {
                        const fontData = companion.data(Resource.KEY_NAME, 'fontStyle');
                        if (fontData) {
                            ({ fontFamily, fontStyle, fontWeight } = fontData);
                            backgroundColor || (backgroundColor = fontData.backgroundColor);
                        }
                    }
                    fontFamily
                        .replace(/"/g, '')
                        .split(',')
                        .some((value, index, array) => {
                            value = trimBoth(value.trim(), "'").toLowerCase();
                            let fontName = value,
                                actualFontWeight = '';
                            if (!disableFontAlias && FONT_REPLACE[fontName]) {
                                fontName = defaultFontFamily;
                            }
                            if (
                                api >= FONT_NAME[fontName] ||
                                (!disableFontAlias && api >= FONT_NAME[FONT_ALIAS[fontName]])
                            ) {
                                fontFamily = fontName;
                            } else if (fontStyle && fontWeight) {
                                let createFont;
                                if (resource.getFont(value, fontStyle, fontWeight)) {
                                    createFont = true;
                                } else {
                                    const font = fontStyle.startsWith('oblique')
                                        ? resource.getFont(value, 'italic') || resource.getFont(value, 'normal')
                                        : resource.getFont(value, fontStyle);
                                    if (font) {
                                        actualFontWeight = fontWeight;
                                        fontWeight = font.fontWeight.toString();
                                        createFont = true;
                                    } else if (index < array.length - 1) {
                                        return false;
                                    } else {
                                        fontFamily = defaultFontFamily;
                                    }
                                }
                                if (createFont) {
                                    fontName = convertWord$2(fontName);
                                    const font = fonts.get(fontName) || {};
                                    font[`${value}|${fontStyle}|${fontWeight}`] = FONT_WEIGHT[fontWeight] || fontWeight;
                                    fonts.set(fontName, font);
                                    fontFamily = `@font/${fontName}`;
                                }
                            } else {
                                return false;
                            }
                            if (fontStyle === 'normal' || fontStyle.startsWith('oblique')) {
                                fontStyle = '';
                            }
                            if (actualFontWeight !== '') {
                                fontWeight = actualFontWeight;
                            } else if (fontWeight === '400' || node.api < 26 /* OREO */) {
                                fontWeight = '';
                            }
                            if (parseInt(fontWeight) > 500) {
                                fontStyle += (fontStyle ? '|' : '') + 'bold';
                            }
                            return true;
                        });
                    addFontItem(node, 0, 'fontFamily', fontFamily);
                    addFontItem(
                        node,
                        1,
                        'fontSize',
                        truncate$7(stored.fontSize, floatPrecision) + (convertPixels ? 'sp' : 'px')
                    );
                    addFontItem(node, 2, 'color', Resource.addColor(stored.color));
                    if (fontWeight !== '') {
                        addFontItem(node, 3, 'fontWeight', fontWeight);
                    }
                    if (fontStyle !== '') {
                        addFontItem(node, 4, 'fontStyle', fontStyle);
                    }
                    if (backgroundColor) {
                        const color = Resource.addColor(backgroundColor, node.inputElement);
                        if (color !== '') {
                            addFontItem(node, 5, 'backgroundColor', color);
                        }
                    }
                }
                groupMap[tag] = sorted;
            }
            const style = {};
            for (const tag in groupMap) {
                const styleTag = {};
                style[tag] = styleTag;
                const sorted = groupMap[tag]
                    .filter(item => item)
                    .sort((a, b) => {
                        let maxA = 0,
                            maxB = 0,
                            countA = 0,
                            countB = 0;
                        for (const attr in a) {
                            const lenA = a[attr].length;
                            maxA = Math.max(lenA, maxA);
                            countA += lenA;
                        }
                        for (const attr in b) {
                            const item = b[attr];
                            if (item) {
                                const lenB = item.length;
                                maxB = Math.max(lenB, maxB);
                                countB += lenB;
                            }
                        }
                        if (maxA !== maxB) {
                            return maxB - maxA;
                        } else if (countA !== countB) {
                            return countB - countA;
                        }
                        return 0;
                    });
                do {
                    const length = sorted.length;
                    if (length === 1) {
                        const data = sorted[0];
                        for (const attr in data) {
                            const item = data[attr];
                            if (item.length) {
                                styleTag[attr] = item;
                            }
                        }
                        break;
                    } else {
                        const styleKey = {};
                        for (let i = 0; i < length; ++i) {
                            const dataA = sorted[i];
                            const filtered = {};
                            for (const attrA in dataA) {
                                const ids = dataA[attrA];
                                if (ids.length === 0) {
                                    continue;
                                } else if (ids.length === nameMap[tag].length) {
                                    styleKey[attrA] = ids;
                                    sorted[i] = {};
                                    break;
                                }
                                const found = {};
                                let merged;
                                for (let j = 0; j < length; ++j) {
                                    if (i !== j) {
                                        const dataB = sorted[j];
                                        for (const attr in dataB) {
                                            const compare = dataB[attr];
                                            if (compare.length) {
                                                for (let k = 0, q = ids.length; k < q; ++k) {
                                                    if (compare.includes(ids[k])) {
                                                        (found[attr] || (found[attr] = [])).push(ids[k]);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                for (const attrB in found) {
                                    const dataB = found[attrB];
                                    if (dataB.length > 1) {
                                        filtered[attrA < attrB ? `${attrA};${attrB}` : `${attrB};${attrA}`] = dataB;
                                        merged = true;
                                    }
                                }
                                if (!merged) {
                                    filtered[attrA] = ids;
                                }
                            }
                            if (hasKeys$1(filtered)) {
                                const combined = {};
                                const deleteKeys = new Set();
                                const joinedMap = {};
                                const joinedIndex = {};
                                for (const attr in filtered) {
                                    const ids = joinArray$1(filtered[attr], item => item.id.toString(), ',');
                                    joinedIndex[attr] = ids;
                                    joinedMap[ids] = filtered[attr];
                                }
                                for (const attrA in filtered) {
                                    for (const attrB in filtered) {
                                        const index = joinedIndex[attrA];
                                        if (attrA !== attrB && index === joinedIndex[attrB]) {
                                            let data = combined[index];
                                            if (!data) {
                                                data = new Set(attrA.split(';'));
                                                combined[index] = data;
                                            }
                                            for (const value of attrB.split(';')) {
                                                data.add(value);
                                            }
                                            deleteKeys.add(attrA).add(attrB);
                                        }
                                    }
                                }
                                for (const attr in filtered) {
                                    if (deleteKeys.has(attr)) {
                                        continue;
                                    }
                                    deleteStyleAttribute(sorted, attr.split(';'), filtered[attr]);
                                    styleTag[attr] = filtered[attr];
                                }
                                for (const attr in combined) {
                                    const items = combined[attr];
                                    const attrs = new Array(items.size);
                                    let index = '',
                                        j = 0;
                                    for (const name of items) {
                                        index += (index !== '' ? ';' : '') + name;
                                        attrs[j++] = name;
                                    }
                                    deleteStyleAttribute(sorted, attrs, joinedMap[attr]);
                                    styleTag[index] = joinedMap[attr];
                                }
                            }
                        }
                        const shared = Object.keys(styleKey);
                        if (shared.length) {
                            styleTag[concatString(shared, ';')] = styleKey[shared[0]];
                        }
                        spliceArray$1(sorted, item => {
                            for (const attr in item) {
                                if (item[attr].length) {
                                    return false;
                                }
                            }
                            return true;
                        });
                    }
                } while (sorted.length);
            }
            const resourceMap = {};
            const nodeMap = new WeakMap();
            const parentStyle = new Set();
            for (const tag in style) {
                const styleTag = style[tag];
                const styleData = [];
                for (const attrs in styleTag) {
                    const items = [];
                    for (const value of attrs.split(';')) {
                        const match = REGEXP_FONTATTRIBUTE.exec(value);
                        if (match) {
                            items.push({ key: match[1], value: match[2] });
                        }
                    }
                    styleData.push({
                        name: '',
                        parent: '',
                        items,
                        nodes: styleTag[attrs],
                    });
                }
                styleData.sort((a, b) => {
                    let c = a.nodes.length,
                        d = b.nodes.length;
                    if (c === d) {
                        c = a.items.length;
                        d = b.items.length;
                    }
                    return c <= d ? 1 : -1;
                });
                for (let i = 0, length = styleData.length; i < length; ++i) {
                    styleData[i].name = capitalize$5(tag) + (i > 0 ? '_' + i : '');
                }
                resourceMap[tag] = styleData;
            }
            for (const tag in resourceMap) {
                for (const group of resourceMap[tag]) {
                    const nodes = group.nodes;
                    if (nodes) {
                        for (let i = 0, length = nodes.length; i < length; ++i) {
                            const item = nodes[i];
                            let data = nodeMap.get(item);
                            if (!data) {
                                data = [];
                                nodeMap.set(item, data);
                            }
                            data.push(group.name);
                        }
                    }
                }
            }
            for (let i = 0, length = cache.length; i < length; ++i) {
                const node = cache[i];
                const styleData = nodeMap.get(node);
                if (styleData) {
                    if (styleData.length > 1) {
                        parentStyle.add(concatString(styleData, '.'));
                        styleData.shift();
                    } else {
                        parentStyle.add(styleData[0]);
                    }
                    node.attr('_', 'style', `@style/${concatString(styleData, '.')}`);
                }
            }
            for (const value of parentStyle) {
                const styleName = [];
                const values = value.split('.');
                let parent = '',
                    items;
                for (let i = 0, q = values.length; i < q; ++i) {
                    const name = values[i];
                    const match = REGEXP_FONTNAME.exec(name);
                    if (match) {
                        const styleData = resourceMap[match[1].toUpperCase()][parseInt(match[2]) || 0];
                        if (styleData) {
                            if (i === 0) {
                                parent = name;
                                if (q === 1) {
                                    items = styleData.items;
                                } else if (!styles.has(name)) {
                                    styles.set(name, { name, parent: '', items: styleData.items });
                                }
                            } else {
                                if (items) {
                                    const styleItems = styleData.items;
                                    for (let j = 0, r = styleItems.length; j < r; ++j) {
                                        const item = styleItems[j];
                                        const key = item.key;
                                        const index = items.findIndex(previous => previous.key === key);
                                        if (index !== -1) {
                                            items[index] = item;
                                        } else {
                                            items.push(item);
                                        }
                                    }
                                } else {
                                    items = styleData.items.slice(0);
                                }
                                styleName.push(name);
                            }
                        }
                    }
                }
                if (items) {
                    if (styleName.length === 0) {
                        styles.set(parent, { name: parent, parent: '', items });
                    } else {
                        const name = concatString(styleName, '.');
                        styles.set(name, { name, parent, items });
                    }
                }
            }
        }
    }

    class ResourceIncludes extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeDocumentWrite(data) {
            const rendered = data.rendered;
            for (let i = 0, length = rendered.length; i < length; ++i) {
                const node = rendered[i];
                if (node.rendering) {
                    let open, close;
                    node.renderEach((item, index) => {
                        const dataset = item.dataset;
                        const name = dataset.androidInclude;
                        const closing = dataset.androidIncludeEnd === 'true';
                        if (name || closing) {
                            if (item.documentRoot) {
                                return;
                            }
                            const indexData = {
                                item,
                                name,
                                index,
                                include: dataset.androidIncludeMerge === 'false',
                            };
                            if (name) {
                                (open || (open = [])).push(indexData);
                            }
                            if (closing) {
                                (close || (close = [])).push(indexData);
                            }
                        }
                    });
                    if (open && close) {
                        const application = this.application;
                        const controller = this.controller;
                        const renderTemplates = node.renderTemplates;
                        const q = Math.min(open.length, close.length);
                        const excess = close.length - q;
                        if (excess) {
                            close.splice(0, excess);
                        }
                        for (let j = q - 1; j >= 0; --j) {
                            const { index, include, item, name } = open[j];
                            for (let k = 0; k < close.length; ++k) {
                                const r = close[k].index;
                                if (r >= index) {
                                    const templates = [];
                                    for (let l = index; l <= r; ++l) {
                                        templates.push(renderTemplates[l]);
                                    }
                                    const merge = !include || templates.length > 1;
                                    const depth = merge ? 1 : 0;
                                    renderTemplates.splice(index, templates.length, {
                                        type: 2 /* INCLUDE */,
                                        node: templates[0].node,
                                        content: controller.renderNodeStatic(
                                            { controlName: 'include', width: 'match_parent' },
                                            { layout: `@layout/${name}`, android: {} }
                                        ),
                                        indent: true,
                                    });
                                    let content = controller.writeDocument(
                                        templates,
                                        depth,
                                        this.application.userSettings.showAttributes
                                    );
                                    if (merge) {
                                        content = controller.getEnclosingXmlTag('merge', getRootNs(content), content);
                                    } else {
                                        item.documentRoot = true;
                                    }
                                    application.saveDocument(name, content, '', Infinity);
                                    close.splice(k, 1);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const { NODE_RESOURCE: NODE_RESOURCE$b } = squared.base.lib.constant;
    const { parseAngle } = squared.lib.css;
    const { getTextMetrics: getTextMetrics$1 } = squared.lib.dom;
    const { clamp: clamp$1 } = squared.lib.math;
    const { delimitString: delimitString$1 } = squared.lib.util;
    const { lowerCaseString, upperCaseString } = squared.base.lib.util;
    const REGEXP_FONTVARIATION = /oblique(?:\s+(-?[\d.]+[a-z]+))?/;
    function getFontVariationStyle(value) {
        if (value === 'italic') {
            return "'ital' 1";
        }
        const match = REGEXP_FONTVARIATION.exec(value);
        if (match) {
            let angle;
            if (match[1]) {
                angle = parseAngle(match[1]);
            }
            return "'slnt' " + (angle !== undefined && !isNaN(angle) ? clamp$1(angle, -90, 90) : '14');
        }
        return '';
    }
    function setTextValue(node, attr, name) {
        if (name !== '') {
            node.android(attr, name, false);
        }
    }
    class ResourceStrings extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.options = {
                numberAsResource: false,
            };
            this.eventOnly = true;
        }
        afterResources(sessionId) {
            const numberAsResource = this.options.numberAsResource;
            this.application.getProcessingCache(sessionId).each(node => {
                if (node.hasResource(NODE_RESOURCE$b.VALUE_STRING)) {
                    if (node.styleElement) {
                        const title = node.data(Resource.KEY_NAME, 'titleString') || node.toElementString('title');
                        if (title !== '') {
                            setTextValue(
                                node,
                                'tooltipText',
                                Resource.addString(
                                    replaceCharacterData(title),
                                    `${node.controlId.toLowerCase()}_title`,
                                    numberAsResource
                                )
                            );
                        }
                    }
                    if (node.inputElement) {
                        if (node.controlName === CONTAINER_TAGNAME.EDIT_LIST) {
                            const list = node.element.list;
                            if (list) {
                                this.createOptionArray(list, node.controlId);
                            }
                        }
                        const hintString = node.data(Resource.KEY_NAME, 'hintString');
                        if (hintString) {
                            setTextValue(
                                node,
                                'hint',
                                Resource.addString(
                                    replaceCharacterData(hintString),
                                    `${node.controlId.toLowerCase()}_hint`,
                                    numberAsResource
                                )
                            );
                        }
                    }
                    const tagName = node.tagName;
                    switch (tagName) {
                        case 'SELECT': {
                            const name = this.createOptionArray(node.element, node.controlId);
                            if (name !== '') {
                                node.android('entries', `@array/${name}`);
                            }
                            break;
                        }
                        case 'IFRAME': {
                            const valueString = node.data(Resource.KEY_NAME, 'valueString');
                            if (valueString) {
                                Resource.addString(replaceCharacterData(valueString));
                            }
                            break;
                        }
                        default: {
                            let valueString = node.data(Resource.KEY_NAME, 'valueString');
                            if (valueString) {
                                const textIndent = node.textIndent;
                                if (isNaN(textIndent)) {
                                    node.delete('android', 'ellipsize', 'maxLines');
                                    return;
                                }
                                switch (node.css('textTransform')) {
                                    case 'uppercase':
                                        node.android('textAllCaps', 'true');
                                        node.lockAttr('android', 'textAllCaps');
                                        break;
                                    case 'lowercase':
                                        valueString = lowerCaseString(valueString);
                                        break;
                                    case 'capitalize':
                                        valueString = upperCaseString(valueString);
                                        break;
                                }
                                valueString = replaceCharacterData(
                                    valueString,
                                    node.preserveWhiteSpace || tagName === 'CODE' ? node.toInt('tabSize', 8) : undefined
                                );
                                const textDecorationLine = node.css('textDecorationLine');
                                if (textDecorationLine !== 'none') {
                                    for (const style of textDecorationLine.split(' ')) {
                                        switch (style) {
                                            case 'underline':
                                                valueString = `<u>${valueString}</u>`;
                                                break;
                                            case 'line-through':
                                                valueString = `<strike>${valueString}</strike>`;
                                                break;
                                        }
                                    }
                                }
                                if (tagName === 'INS' && !textDecorationLine.includes('line-through')) {
                                    valueString = `<strike>${valueString}</strike>`;
                                }
                                if (textIndent > 0) {
                                    const width = getTextMetrics$1(' ', node.fontSize, node.css('fontFamily')).width;
                                    if (width) {
                                        valueString =
                                            Resource.STRING_SPACE.repeat(Math.max(Math.floor(textIndent / width), 1)) +
                                            valueString;
                                    }
                                }
                                let fontVariation = getFontVariationStyle(node.css('fontStyle')),
                                    fontFeature = '';
                                if (node.has('fontStretch')) {
                                    let percent = node.css('fontStretch');
                                    switch (percent) {
                                        case '100%':
                                            percent = '';
                                            break;
                                        case 'ultra-condensed':
                                            percent = '50%';
                                            break;
                                        case 'extra-condensed':
                                            percent = '62.5%';
                                            break;
                                        case 'condensed':
                                            percent = '75%';
                                            break;
                                        case 'semi-condensed':
                                            percent = '87.5%';
                                            break;
                                        case 'semi-expanded':
                                            percent = '112.5%';
                                            break;
                                        case 'expanded':
                                            percent = '125%';
                                            break;
                                        case 'extra-expanded':
                                            percent = '150%';
                                            break;
                                        case 'ultra-expanded':
                                            percent = '200%';
                                            break;
                                    }
                                    if (percent.endsWith('%')) {
                                        fontVariation = delimitString$1(
                                            { value: fontVariation },
                                            `'wdth' ${parseFloat(percent)}`
                                        );
                                    }
                                }
                                if (node.has('fontVariantCaps')) {
                                    for (const variant of node.css('fontVariantCaps').split(' ')) {
                                        switch (variant) {
                                            case 'small-caps':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'smcp'");
                                                break;
                                            case 'all-small-caps':
                                                fontFeature = delimitString$1(
                                                    { value: fontFeature },
                                                    "'c2sc'",
                                                    "'smcp'"
                                                );
                                                break;
                                            case 'petite-caps':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'pcap'");
                                                break;
                                            case 'all-petite-caps':
                                                fontFeature = delimitString$1(
                                                    { value: fontFeature },
                                                    "'c2pc'",
                                                    "'pcap'"
                                                );
                                                break;
                                            case 'unicase':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'unic'");
                                                break;
                                            case 'titling-caps':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'titl'");
                                                break;
                                        }
                                    }
                                }
                                if (node.has('fontVariantNumeric')) {
                                    for (const variant of node.css('fontVariantNumeric').split(' ')) {
                                        switch (variant) {
                                            case 'ordinal':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'ordn'");
                                                break;
                                            case 'slashed-zero':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'zero'");
                                                break;
                                            case 'lining-nums':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'lnum'");
                                                break;
                                            case 'oldstyle-nums':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'onum'");
                                                break;
                                            case 'proportional-nums':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'pnum'");
                                                break;
                                            case 'tabular-nums':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'tnum'");
                                                break;
                                            case 'diagonal-fractions':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'frac'");
                                                break;
                                            case 'stacked-fractions':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'afrc'");
                                                break;
                                        }
                                    }
                                }
                                if (node.has('fontVariantLigatures')) {
                                    for (const variant of node.css('fontVariantLigatures').split(' ')) {
                                        switch (variant) {
                                            case 'common-ligatures':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'liga'");
                                                break;
                                            case 'no-common-ligatures':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'liga' 0");
                                                break;
                                            case 'discretionary-ligatures':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'dlig'");
                                                break;
                                            case 'no-discretionary-ligatures':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'dlig' 0");
                                                break;
                                            case 'historical-ligatures':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'hlig'");
                                                break;
                                            case 'no-historical-ligatures':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'hlig' 0");
                                                break;
                                            case 'contextual':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'calt'");
                                                break;
                                            case 'no-contextual':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'calt' 0");
                                                break;
                                        }
                                    }
                                }
                                if (node.has('fontVariantEastAsian')) {
                                    for (const variant of node.css('fontVariantEastAsian').split(' ')) {
                                        switch (variant) {
                                            case 'ruby':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'ruby'");
                                                break;
                                            case 'jis78':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'jp78'");
                                                break;
                                            case 'jis83':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'jp83'");
                                                break;
                                            case 'jis90':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'jp90'");
                                                break;
                                            case 'jis04':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'jp04'");
                                                break;
                                            case 'simplified':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'smpl'");
                                                break;
                                            case 'traditional':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'trad'");
                                                break;
                                            case 'proportional-width':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'pwid'");
                                                break;
                                            case 'full-width':
                                                fontFeature = delimitString$1({ value: fontFeature }, "'fwid'");
                                                break;
                                        }
                                    }
                                }
                                if (node.has('fontVariationSettings')) {
                                    for (const variant of node
                                        .css('fontVariationSettings')
                                        .replace(/"/g, "'")
                                        .split(',')) {
                                        fontVariation = delimitString$1({ value: fontVariation }, variant.trim());
                                    }
                                }
                                if (node.has('fontFeatureSettings')) {
                                    for (const feature of node
                                        .css('fontFeatureSettings')
                                        .replace(/"/g, "'")
                                        .split(',')) {
                                        fontFeature = delimitString$1({ value: fontFeature }, feature.trim());
                                    }
                                }
                                if (fontVariation !== '') {
                                    node.android('fontVariationSettings', fontVariation);
                                }
                                if (fontFeature !== '') {
                                    node.android('fontFeatureSettings', fontFeature);
                                }
                                setTextValue(node, 'text', Resource.addString(valueString, '', numberAsResource));
                            }
                        }
                    }
                }
            });
        }
        createOptionArray(element, controlId) {
            const [stringArray, numberArray] = Resource.getOptionArray(element);
            const numberAsResource = this.options.numberAsResource;
            let result;
            if (!numberAsResource && numberArray) {
                result = numberArray;
            } else {
                const resourceArray = stringArray || numberArray;
                if (resourceArray) {
                    result = [];
                    for (let i = 0, length = resourceArray.length; i < length; ++i) {
                        const value = Resource.addString(replaceCharacterData(resourceArray[i]), '', numberAsResource);
                        if (value !== '') {
                            result.push(value);
                        }
                    }
                }
            }
            return result && result.length ? Resource.insertStoredAsset('arrays', `${controlId}_array`, result) : '';
        }
    }

    const { capitalize: capitalize$6 } = squared.lib.util;
    const REGEXP_STYLEATTR = /(\w+:(\w+))="([^"]+)"/;
    class ResourceStyles extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeDocumentWrite(data) {
            const styles = Resource.STORED.styles;
            const rendered = data.rendered;
            for (let i = 0, length = rendered.length; i < length; ++i) {
                next: {
                    const renderChildren = rendered[i].renderChildren;
                    const q = renderChildren.length;
                    if (q > 1) {
                        const controlId = rendered[i].controlId;
                        if (controlId === '') {
                            continue;
                        }
                        const attrMap = {};
                        let style = '';
                        for (let j = 0; j < q; ++j) {
                            const item = renderChildren[j];
                            const combined = item.combine('_', 'android');
                            let found;
                            for (let k = 0, r = combined.length; k < r; ++k) {
                                const value = combined[k];
                                if (!found && value.startsWith('style=')) {
                                    if (j === 0) {
                                        style = value;
                                    } else if (style === '' || value !== style) {
                                        break next;
                                    }
                                    found = true;
                                } else {
                                    attrMap[value] = (attrMap[value] || 0) + 1;
                                }
                            }
                            if (!found && style !== '') {
                                break next;
                            }
                        }
                        const keys = [];
                        for (const attr in attrMap) {
                            if (attrMap[attr] === q) {
                                keys.push(attr);
                            }
                        }
                        const r = keys.length;
                        if (r > 1) {
                            style && (style = style.substring(style.indexOf('/') + 1, style.length - 1));
                            const items = [];
                            const attrs = [];
                            for (let j = 0; j < r; ++j) {
                                const match = REGEXP_STYLEATTR.exec(keys[j]);
                                if (match) {
                                    items.push({ key: match[1], value: match[3] });
                                    attrs.push(match[2]);
                                }
                            }
                            const name = (style !== '' ? style + '.' : '') + capitalize$6(controlId);
                            if (!styles.has(name)) {
                                items.sort((a, b) => (a.key < b.key ? -1 : 1));
                                styles.set(name, { name, parent: '', items });
                            }
                            for (let j = 0; j < q; ++j) {
                                const item = renderChildren[j];
                                item.attr('_', 'style', `@style/${name}`);
                                item.delete('android', ...attrs);
                            }
                        }
                    }
                }
            }
        }
    }

    var ANIMATEDVECTOR_TMPL = {
        'animated-vector': {
            '@': ['xmlns:android', 'android:drawable'],
            '>': {
                'target': {
                    '^': 'android',
                    '@': ['name', 'animation'],
                },
            },
        },
    };

    const OBJECTANIMATOR = {
        'objectAnimator': {
            '^': 'android',
            '@': [
                'propertyName',
                'startOffset',
                'duration',
                'repeatCount',
                'interpolator',
                'valueType',
                'valueFrom',
                'valueTo',
            ],
            '>': {
                'propertyValuesHolder': {
                    '^': 'android',
                    '@': ['propertyName'],
                    '>': {
                        'keyframe': {
                            '^': 'android',
                            '@': ['interpolator', 'fraction', 'value'],
                        },
                    },
                },
            },
        },
    };
    var SET_TMPL = {
        'set': {
            '@': ['xmlns:android', 'android:ordering'],
            '>': {
                'set': {
                    '^': 'android',
                    '@': ['ordering'],
                    '>': {
                        'set': {
                            '^': 'android',
                            '@': ['ordering'],
                            '>': {
                                'objectAnimator': OBJECTANIMATOR.objectAnimator,
                            },
                        },
                        'objectAnimator': OBJECTANIMATOR.objectAnimator,
                    },
                },
                'objectAnimator': OBJECTANIMATOR.objectAnimator,
            },
        },
    };

    if (!squared.svg) {
        Object.assign(squared, { svg: { lib: { constant: {}, util: {} } } });
    }
    var Svg = squared.svg.Svg;
    var SvgAnimate = squared.svg.SvgAnimate;
    var SvgAnimateTransform = squared.svg.SvgAnimateTransform;
    var SvgBuild = squared.svg.SvgBuild;
    var SvgG = squared.svg.SvgG;
    var SvgPath = squared.svg.SvgPath;
    var SvgShape = squared.svg.SvgShape;
    const KEYSPLINE_NAME = SvgAnimate ? SvgAnimate.KEYSPLINE_NAME : null;
    const { FILE: FILE$1 } = squared.lib.regex;
    const { extractURL: extractURL$2, formatPX: formatPX$c, isPercent: isPercent$2 } = squared.lib.css;
    const { truncate: truncate$8 } = squared.lib.math;
    const {
        convertCamelCase: convertCamelCase$1,
        convertInt: convertInt$1,
        convertWord: convertWord$3,
        hasKeys: hasKeys$2,
        isArray,
        isNumber: isNumber$1,
        lastItemOf: lastItemOf$1,
        partitionArray: partitionArray$1,
        plainMap: plainMap$3,
        replaceMap: replaceMap$1,
    } = squared.lib.util;
    const { CACHE_VIEWNAME, MATRIX, SVG, TRANSFORM, getAttribute, getRootOffset } = squared.svg.lib.util;
    const INTERPOLATOR_NAME = {
        accelerate_decelerate: '@android:anim/accelerate_decelerate_interpolator',
        accelerate: '@android:anim/accelerate_interpolator',
        anticipate: '@android:anim/anticipate_interpolator',
        anticipate_overshoot: '@android:anim/anticipate_overshoot_interpolator',
        bounce: '@android:anim/bounce_interpolator',
        cycle: '@android:anim/cycle_interpolator',
        decelerate: '@android:anim/decelerate_interpolator',
        linear: '@android:anim/linear_interpolator',
        overshoot: '@android:anim/overshoot_interpolator',
    };
    const PATH_ATTRIBUTES = [
        'name',
        'value',
        'fill',
        'stroke',
        'fillPattern',
        'fillRule',
        'strokeWidth',
        'fillOpacity',
        'strokeOpacity',
        'strokeLinecap',
        'strokeLinejoin',
        'strokeLineJoin',
        'strokeMiterlimit',
    ];
    if (KEYSPLINE_NAME) {
        Object.assign(INTERPOLATOR_NAME, {
            [KEYSPLINE_NAME['ease-in']]: INTERPOLATOR_NAME.accelerate,
            [KEYSPLINE_NAME['ease-out']]: INTERPOLATOR_NAME.decelerate,
            [KEYSPLINE_NAME['ease-in-out']]: INTERPOLATOR_NAME.accelerate_decelerate,
            [KEYSPLINE_NAME['linear']]: INTERPOLATOR_NAME.linear,
        });
    }
    const INTERPOLATOR_XML = `<?xml version="1.0" encoding="utf-8"?>
<pathInterpolator xmlns:android="http://schemas.android.com/apk/res/android"
	android:controlX1="{0}"
	android:controlY1="{1}"
	android:controlX2="{2}"
    android:controlY2="{3}" />
`;
    const ATTRIBUTE_PATH = {
        'stroke': ['strokeColor'],
        'fill': ['fillColor'],
        'opacity': ['alpha'],
        'stroke-opacity': ['strokeAlpha'],
        'fill-opacity': ['fillAlpha'],
        'stroke-width': ['strokeWidth'],
        'stroke-dasharray': ['trimPathStart', 'trimPathEnd'],
        'stroke-dashoffset': ['trimPathOffset'],
        'd': ['pathData'],
        'clip-path': ['pathData'],
    };
    function getPathInterpolator(keySplines, index) {
        const name = keySplines && keySplines[index];
        return name ? INTERPOLATOR_NAME[name] || createPathInterpolator(name) : '';
    }
    function createPathInterpolator(value) {
        const interpolator = INTERPOLATOR_NAME[value];
        if (interpolator) {
            return interpolator;
        }
        const animators = Resource.STORED.animators;
        const name = 'path_interpolator_' + convertWord$3(value);
        if (!animators.has(name)) {
            animators.set(name, formatString(INTERPOLATOR_XML, ...value.split(/\s+/)));
        }
        return `@anim/${name}`;
    }
    function createTransformData(transform) {
        const result = {};
        for (let i = 0, length = transform.length; i < length; ++i) {
            const { matrix, origin, angle, type } = transform[i];
            switch (type) {
                case SVGTransform.SVG_TRANSFORM_SCALE:
                    result.scaleX = matrix.a.toString();
                    result.scaleY = matrix.d.toString();
                    if (origin) {
                        result.pivotX = origin.x.toString();
                        result.pivotY = origin.y.toString();
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_ROTATE:
                    result.rotation = angle.toString();
                    if (origin) {
                        result.pivotX = origin.x.toString();
                        result.pivotY = origin.y.toString();
                    } else {
                        result.pivotX = '0';
                        result.pivotY = '0';
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                    result.translateX = matrix.e.toString();
                    result.translateY = matrix.f.toString();
                    break;
            }
        }
        return result;
    }
    function getOuterOpacity(target) {
        let value = parseFloat(target.opacity),
            current = target.parent;
        while (current) {
            const opacity = parseFloat(current['opacity'] || '1');
            if (!isNaN(opacity) && opacity < 1) {
                value *= opacity;
            }
            current = current.parent;
        }
        return value;
    }
    function residualHandler(element, transforms, rx = 1, ry = 1) {
        return (SVG.circle(element) || SVG.ellipse(element)) &&
            transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE) &&
            (rx !== ry ||
                (transforms.length > 1 &&
                    transforms.some(
                        item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d
                    )))
            ? groupTransforms(element, transforms)
            : [[], transforms];
    }
    function groupTransforms(element, transforms, ignoreClient) {
        if (transforms.length) {
            const host = [];
            const client = [];
            const rotateOrigin = transforms[0].fromStyle ? [] : TRANSFORM.rotateOrigin(element).reverse();
            const items = transforms.slice(0).reverse();
            const current = [];
            const restart = () => {
                host.push(current.slice(0));
                current.length = 0;
            };
            for (let i = 1; i < items.length; ++i) {
                const itemA = items[i];
                const itemB = items[i - 1];
                if (itemA.type === itemB.type) {
                    let matrix;
                    switch (itemA.type) {
                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                            matrix = MATRIX.clone(itemA.matrix);
                            matrix.e += itemB.matrix.e;
                            matrix.f += itemB.matrix.f;
                            break;
                        case SVGTransform.SVG_TRANSFORM_SCALE: {
                            matrix = MATRIX.clone(itemA.matrix);
                            matrix.a *= itemB.matrix.a;
                            matrix.d *= itemB.matrix.d;
                            break;
                        }
                    }
                    if (matrix) {
                        itemA.matrix = matrix;
                        items.splice(--i, 1);
                    }
                }
            }
            for (let i = 0, length = items.length; i < length; ++i) {
                const item = items[i];
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_MATRIX:
                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                        client.push(item);
                        break;
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        if (!ignoreClient && host.length === 0 && current.length === 0) {
                            client.push(item);
                        } else {
                            current.push(item);
                            restart();
                        }
                        break;
                    case SVGTransform.SVG_TRANSFORM_ROTATE:
                        while (rotateOrigin.length) {
                            const origin = rotateOrigin.shift();
                            if (origin.angle === item.angle) {
                                if (origin.x !== 0 || origin.y !== 0) {
                                    item.origin = origin;
                                }
                                break;
                            }
                        }
                        if (
                            !item.origin &&
                            current.length === 1 &&
                            current[0].type === SVGTransform.SVG_TRANSFORM_SCALE
                        ) {
                            current.push(item);
                            continue;
                        }
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        if (current.length) {
                            restart();
                        }
                        current.push(item);
                        break;
                }
            }
            if (current.length) {
                host.push(current);
            }
            return [host.reverse(), client];
        }
        return [[], transforms];
    }
    function getPropertyValue(values, index, propertyIndex, keyframes, baseValue) {
        const property = values[index];
        let value;
        if (property) {
            value = Array.isArray(property) ? property[propertyIndex].toString() : property;
        } else if (!keyframes && index === 0) {
            value = baseValue;
        }
        return value || '';
    }
    function getValueType(attr) {
        switch (attr) {
            case 'fill':
            case 'stroke':
                return '';
            case 'opacity':
            case 'stroke-opacity':
            case 'stroke-dasharray':
            case 'stroke-dashoffset':
            case 'fill-opacity':
            case 'transform':
                return 'floatType';
            case 'stroke-width':
                return 'intType';
            case 'd':
            case 'x':
            case 'x1':
            case 'x2':
            case 'cx':
            case 'y':
            case 'y1':
            case 'y2':
            case 'cy':
            case 'r':
            case 'rx':
            case 'ry':
            case 'width':
            case 'height':
            case 'points':
                return 'pathType';
            default:
                if (getTransformInitialValue(attr)) {
                    return 'floatType';
                }
        }
    }
    function createAnimateFromTo(attributeName, delay, to, from) {
        const result = new SvgAnimate();
        result.attributeName = attributeName;
        result.delay = delay;
        result.duration = 1;
        result.from = from || to;
        result.to = to;
        result.fillForwards = true;
        result.convertToValues();
        return result;
    }
    function getAttributePropertyName(value, checkTransform = true) {
        let result = ATTRIBUTE_PATH[value];
        if (!result && checkTransform && getTransformInitialValue(value)) {
            result = [value];
        }
        return result;
    }
    function getTransformPropertyName(type) {
        switch (type) {
            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                return ['translateX', 'translateY'];
            case SVGTransform.SVG_TRANSFORM_SCALE:
                return ['scaleX', 'scaleY', 'pivotX', 'pivotY'];
            case SVGTransform.SVG_TRANSFORM_ROTATE:
                return ['rotation', 'pivotX', 'pivotY'];
        }
    }
    function getTransformValues(item) {
        switch (item.type) {
            case SVGTransform.SVG_TRANSFORM_ROTATE:
                return SvgAnimateTransform.toRotateList(item.values);
            case SVGTransform.SVG_TRANSFORM_SCALE:
                return SvgAnimateTransform.toScaleList(item.values);
            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                return SvgAnimateTransform.toTranslateList(item.values);
            default:
                return null;
        }
    }
    function getTransformInitialValue(name) {
        switch (name) {
            case 'rotation':
            case 'pivotX':
            case 'pivotY':
            case 'translateX':
            case 'translateY':
                return '0';
            case 'scaleX':
            case 'scaleY':
                return '1';
        }
    }
    function getColorValue$1(value, asArray) {
        let colorName = Resource.addColor(value);
        if (colorName !== '') {
            colorName = `@color/${colorName}`;
            return asArray ? [colorName] : colorName;
        }
    }
    function getTileMode(value) {
        switch (value) {
            case SVGGradientElement.SVG_SPREADMETHOD_PAD:
                return 'clamp';
            case SVGGradientElement.SVG_SPREADMETHOD_REFLECT:
                return 'mirror';
            case SVGGradientElement.SVG_SPREADMETHOD_REPEAT:
                return 'repeat';
            default:
                return '';
        }
    }
    function createFillGradient(gradient, path, precision) {
        const { colorStops, type } = gradient;
        const result = {
            type,
            item: convertColorStops(colorStops, precision),
            positioning: false,
        };
        switch (type) {
            case 'radial': {
                const { cxAsString, cyAsString, rAsString, spreadMethod } = gradient;
                const element = path.element;
                const getRadiusPercent = value => (isPercent$2(value) ? parseFloat(value) / 100 : 0.5);
                let points = [],
                    cx,
                    cy,
                    cxDiameter,
                    cyDiameter;
                switch (element.tagName) {
                    case 'path':
                        for (const command of SvgBuild.toPathCommands(path.value)) {
                            points = points.concat(command.value);
                        }
                    case 'polygon':
                        if (SVG.polygon(element)) {
                            points = points.concat(SvgBuild.clonePoints(element.points));
                        }
                        if (points.length === 0) {
                            return;
                        }
                        ({ left: cx, top: cy, right: cxDiameter, bottom: cyDiameter } = SvgBuild.minMaxOf(points));
                        cxDiameter -= cx;
                        cyDiameter -= cy;
                        break;
                    default:
                        if (SVG.rect(element)) {
                            cx = element.x.baseVal.value;
                            cy = element.y.baseVal.value;
                            cxDiameter = element.width.baseVal.value;
                            cyDiameter = element.height.baseVal.value;
                        } else if (SVG.circle(element)) {
                            cxDiameter = element.r.baseVal.value;
                            cx = element.cx.baseVal.value - cxDiameter;
                            cy = element.cy.baseVal.value - cxDiameter;
                            cxDiameter *= 2;
                            cyDiameter = cxDiameter;
                        } else if (SVG.ellipse(element)) {
                            cxDiameter = element.rx.baseVal.value;
                            cyDiameter = element.ry.baseVal.value;
                            cx = element.cx.baseVal.value - cxDiameter;
                            cy = element.cy.baseVal.value - cyDiameter;
                            cxDiameter *= 2;
                            cyDiameter *= 2;
                        } else {
                            return;
                        }
                        break;
                }
                result.centerX = (cx + cxDiameter * getRadiusPercent(cxAsString)).toString();
                result.centerY = (cy + cyDiameter * getRadiusPercent(cyAsString)).toString();
                result.gradientRadius = (
                    ((cxDiameter + cyDiameter) / 2) *
                    (isPercent$2(rAsString) ? parseFloat(rAsString) / 100 : 1)
                ).toString();
                if (spreadMethod) {
                    result.tileMode = getTileMode(spreadMethod);
                }
                break;
            }
            case 'linear': {
                const { x1, y1, x2, y2, spreadMethod } = gradient;
                result.startX = x1.toString();
                result.startY = y1.toString();
                result.endX = x2.toString();
                result.endY = y2.toString();
                if (spreadMethod) {
                    result.tileMode = getTileMode(spreadMethod);
                }
            }
        }
        return result;
    }
    function sortSynchronized(a, b) {
        const syncA = a.synchronized;
        const syncB = b.synchronized;
        return syncA && syncB ? (syncA.key >= syncB.key ? 1 : -1) : 0;
    }
    function insertTargetAnimation(data, name, targetSetTemplate, templateName, imageLength) {
        const templateSet = targetSetTemplate.set;
        const length = templateSet.length;
        if (length) {
            let modified;
            if (length > 1 && templateSet.every(item => item.ordering === '')) {
                const setData = {
                    set: [],
                    objectAnimator: [],
                };
                for (let i = 0; i < length; ++i) {
                    const item = templateSet[i];
                    setData.set = setData.set.concat(item.set);
                    setData.objectAnimator = setData.objectAnimator.concat(item.objectAnimator);
                }
                targetSetTemplate = setData;
            }
            while (targetSetTemplate.set.length === 1) {
                const setData = targetSetTemplate.set[0];
                if ((!modified || setData.ordering === '') && setData.objectAnimator.length === 0) {
                    targetSetTemplate = setData;
                    modified = true;
                } else {
                    break;
                }
            }
            targetSetTemplate['xmlns:android'] = XML_NAMESPACE.android;
            if (modified) {
                targetSetTemplate['android:ordering'] = targetSetTemplate.ordering;
                delete targetSetTemplate.ordering;
            }
            const targetData = {
                name,
                animation: Resource.insertStoredAsset(
                    'animators',
                    getTemplateFilename(templateName, imageLength, 'anim', name),
                    applyTemplate('set', SET_TMPL, [targetSetTemplate])
                ),
            };
            if (targetData.animation) {
                targetData.animation = `@anim/${targetData.animation}`;
                data[0].target.push(targetData);
            }
        }
    }
    function createPropertyValue(
        propertyName,
        valueType,
        valueTo,
        duration,
        precision,
        valueFrom = '',
        startOffset = '',
        repeatCount = '0'
    ) {
        return {
            propertyName,
            startOffset,
            duration,
            repeatCount,
            valueType,
            valueFrom: isNumber$1(valueFrom) ? truncate$8(valueFrom, precision) : valueFrom,
            valueTo: isNumber$1(valueTo) ? truncate$8(valueTo, precision) : valueTo,
            propertyValuesHolder: false,
        };
    }
    function resetBeforeValue(propertyName, valueType, valueTo, animator, precision) {
        if (valueTo && animator.findIndex(before => before.propertyName === propertyName) === -1) {
            animator.push(createPropertyValue(propertyName, valueType, valueTo, '0', precision));
        }
    }
    function insertFillAfter(
        propertyName,
        valueType,
        item,
        synchronized,
        transforming,
        precision,
        afterAnimator,
        transformOrigin,
        propertyValues,
        startOffset
    ) {
        if (!synchronized && item.fillReplace) {
            let valueTo = item.replaceValue;
            if (!valueTo) {
                if (transforming) {
                    valueTo = getTransformInitialValue(propertyName);
                } else {
                    const parent = item.parent;
                    if (parent) {
                        if (SvgBuild.isShape(parent)) {
                            const path = parent.path;
                            if (path) {
                                if (propertyName === 'pathData') {
                                    valueTo = path.value;
                                } else {
                                    for (const attr in ATTRIBUTE_PATH) {
                                        if (ATTRIBUTE_PATH[attr].includes(propertyName)) {
                                            valueTo = path[convertCamelCase$1(attr)];
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                valueTo || (valueTo = item.baseValue);
            }
            let previousValue;
            if (propertyValues && propertyValues.length) {
                const lastValue = lastItemOf$1(propertyValues);
                if (isArray(lastValue.propertyValuesHolder)) {
                    const propertyValue = lastItemOf$1(lastValue.propertyValuesHolder);
                    previousValue = lastItemOf$1(propertyValue.keyframe).value;
                } else {
                    previousValue = lastValue.valueTo;
                }
            }
            if (valueTo && valueTo !== previousValue) {
                valueTo = convertValueType(item, valueTo);
                if (valueTo) {
                    switch (propertyName) {
                        case 'trimPathStart':
                        case 'trimPathEnd':
                            valueTo = valueTo.split(' ')[propertyName === 'trimPathStart' ? 0 : 1];
                            break;
                    }
                    afterAnimator.push(
                        createPropertyValue(
                            propertyName,
                            valueType,
                            valueTo,
                            '1',
                            precision,
                            valueType === 'pathType' ? previousValue : '',
                            startOffset ? startOffset.toString() : ''
                        )
                    );
                }
            }
            if (transformOrigin) {
                if (lastItemOf$1(propertyName) === 'X') {
                    afterAnimator.push(createPropertyValue('translateX', valueType, '0', '1', precision));
                } else if (lastItemOf$1(propertyName) === 'Y') {
                    afterAnimator.push(createPropertyValue('translateY', valueType, '0', '1', precision));
                }
            }
        }
    }
    const convertValueType = (item, value) =>
        isColorType(item.attributeName) ? getColorValue$1(value) : value.trim() || undefined;
    const getTemplateFilename = (templateName, length, prefix, suffix) =>
        templateName +
        (prefix ? '_' + prefix : '') +
        (length ? '_vector' : '') +
        (suffix ? '_' + suffix.toLowerCase() : '');
    const isColorType = attr => attr === 'fill' || attr === 'stroke';
    const getVectorName = (target, section, index = -1) =>
        target.name + '_' + section + (index !== -1 ? '_' + (index + 1) : '');
    const getDrawableSrc = name => `@drawable/${name}`;
    const getFillData = (ordering = '') => ({ ordering, objectAnimator: [] });
    class ResourceSvg extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.options = {
                transformExclude: {
                    ellipse: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
                    circle: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
                    image: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
                },
                floatPrecisionKeyTime: 5,
                floatPrecision: 3,
                animateInterpolator: '',
            };
            this.eventOnly = true;
            this._vectorData = new Map();
            this._animateData = new Map();
            this._animateTarget = new Map();
            this._imageData = [];
            this._synchronizeMode = 0;
            this._namespaceAapt = false;
        }
        beforeParseDocument() {
            if (SvgBuild) {
                CACHE_VIEWNAME.clear();
                this.controller.localSettings.use.svg = true;
            }
        }
        afterResources(sessionId) {
            if (SvgBuild) {
                const contentMap = {};
                for (const data of Resource.ASSETS.rawData) {
                    const item = data[1];
                    if (item.mimeType === 'image/svg+xml' && item.content) {
                        contentMap[data[0]] = item.content;
                    }
                }
                const { cache, keyframesMap } = this.application.getProcessing(sessionId);
                const addSvgElement = (node, element, parentElement) => {
                    const drawable = this.createSvgDrawable(node, element, keyframesMap, contentMap);
                    if (drawable) {
                        if (node.api >= 21 /* LOLLIPOP */) {
                            node.android('src', getDrawableSrc(drawable));
                        } else {
                            node.app('srcCompat', getDrawableSrc(drawable));
                        }
                    }
                    if (!node.hasWidth) {
                        node.setLayoutWidth('wrap_content');
                    }
                    if (!node.hasHeight) {
                        node.setLayoutHeight('wrap_content');
                    }
                    if (node.baseline) {
                        node.android('baselineAlignBottom', 'true');
                    }
                    const svg = node.data(Resource.KEY_NAME, 'svg');
                    if (svg) {
                        const title = svg.getTitle();
                        const desc = svg.getDesc();
                        if (title !== '') {
                            node.android(
                                'tooltipText',
                                Resource.addString(title, `svg_${node.controlId.toLowerCase()}_title`, true)
                            );
                        }
                        if (desc !== '') {
                            node.android(
                                'contentDescription',
                                Resource.addString(desc, `svg_${node.controlId.toLowerCase()}_desc`, true)
                            );
                        }
                    }
                    if (parentElement) {
                        parentElement.removeChild(element);
                    }
                };
                cache.each(node => {
                    if (node.imageElement) {
                        const [parentElement, element] = this.createSvgElement(node, node.toElementString('src'));
                        if (element) {
                            addSvgElement(node, element, parentElement);
                        }
                    } else if (node.svgElement) {
                        addSvgElement(node, node.element);
                    }
                });
            }
        }
        afterFinalize() {
            if (SvgBuild) {
                this.controller.localSettings.use.svg = false;
            }
        }
        createSvgElement(node, src) {
            const value = extractURL$2(src);
            if (value) {
                src = value;
            }
            if (FILE$1.SVG.test(src) || src.startsWith('data:image/svg+xml')) {
                const fileAsset = this.resource.getRawData(src);
                if (fileAsset) {
                    const parentElement = (node.actualParent || node.documentParent).element;
                    parentElement.insertAdjacentHTML('beforeend', fileAsset.content);
                    const lastElementChild = parentElement.lastElementChild;
                    if (lastElementChild instanceof SVGSVGElement) {
                        const element = lastElementChild;
                        if (element.width.baseVal.value === 0) {
                            element.setAttribute('width', node.actualWidth.toString());
                        }
                        if (element.height.baseVal.value === 0) {
                            element.setAttribute('height', node.actualHeight.toString());
                        }
                        return [parentElement, element];
                    }
                }
            }
            return [];
        }
        createSvgDrawable(node, element, keyframesMap, contentMap) {
            const { transformExclude: exclude, floatPrecision: precision, floatPrecisionKeyTime } = this.options;
            const svg = new Svg(element);
            if (contentMap) {
                svg.contentMap = contentMap;
            }
            const supportedKeyframes = node.api >= 23; /* MARSHMALLOW */
            const keyTimeMode =
                1 /* FROMTO_ANIMATE */ | (supportedKeyframes ? 16 /* KEYTIME_TRANSFORM */ : 32) /* IGNORE_TRANSFORM */;
            const animateData = this._animateData;
            const imageData = this._imageData;
            this._svgInstance = svg;
            this._vectorData.clear();
            animateData.clear();
            this._animateTarget.clear();
            imageData.length = 0;
            this._namespaceAapt = false;
            this._synchronizeMode = keyTimeMode;
            const templateName = (node.tagName + '_' + convertWord$3(node.controlId, true) + '_viewbox').toLowerCase();
            svg.build({
                contentMap,
                keyframesMap,
                exclude,
                residualHandler,
                precision,
            });
            svg.synchronize({
                keyTimeMode,
                framesPerSecond: this.controller.userSettings.framesPerSecond,
                precision,
            });
            this.queueAnimations(svg, svg.name, item => item.attributeName === 'opacity');
            const vectorData = this.parseVectorData(svg);
            const imageLength = imageData.length;
            let vectorName;
            if (vectorData !== '') {
                const { width, height } = node.fitToScreen({ width: svg.width, height: svg.height });
                vectorName = Resource.insertStoredAsset(
                    'drawables',
                    getTemplateFilename(templateName, imageLength),
                    applyTemplate('vector', VECTOR_TMPL, [
                        {
                            'xmlns:android': XML_NAMESPACE.android,
                            'xmlns:aapt': this._namespaceAapt ? XML_NAMESPACE.aapt : '',
                            'android:name': animateData.size ? svg.name : '',
                            'android:width': formatPX$c(width),
                            'android:height': formatPX$c(height),
                            'android:viewportWidth': (svg.viewBox.width || width).toString(),
                            'android:viewportHeight': (svg.viewBox.height || height).toString(),
                            'android:alpha': parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : '',
                            include: vectorData,
                        },
                    ])
                );
                if (animateData.size) {
                    const data = [
                        {
                            'xmlns:android': XML_NAMESPACE.android,
                            'android:drawable': getDrawableSrc(vectorName),
                            target: [],
                        },
                    ];
                    for (const [name, group] of animateData.entries()) {
                        const sequentialMap = new Map();
                        const transformMap = new Map();
                        const togetherData = [];
                        const isolatedData = [];
                        const togetherTargets = [];
                        const transformTargets = [];
                        const [companions, animations] = partitionArray$1(group.animate, child => 'companion' in child);
                        const targetSetTemplate = { set: [], objectAnimator: [] };
                        for (let i = 0, length = animations.length; i < length; ++i) {
                            const item = animations[i];
                            if (item.setterType) {
                                if (ATTRIBUTE_PATH[item.attributeName] && item.to) {
                                    if (item.fillReplace && item.duration > 0) {
                                        isolatedData.push(item);
                                    } else {
                                        togetherData.push(item);
                                    }
                                }
                            } else if (SvgBuild.isAnimate(item)) {
                                const children = companions.filter(child => child.companion.value === item);
                                const q = children.length;
                                if (q) {
                                    children.sort((a, b) => (a.companion.key >= b.companion.key ? 1 : 0));
                                    const sequentially = [];
                                    const after = [];
                                    for (let j = 0; j < q; ++j) {
                                        const child = children[j];
                                        if (child.companion.key <= 0) {
                                            sequentially.push(child);
                                            if (j === 0) {
                                                child.delay += item.delay;
                                                item.delay = 0;
                                            }
                                        } else {
                                            after.push(child);
                                        }
                                    }
                                    sequentially.push(item);
                                    sequentialMap.set('sequentially_companion_' + i, sequentially.concat(after));
                                } else {
                                    const synchronized = item.synchronized;
                                    if (synchronized) {
                                        const value = synchronized.value;
                                        if (SvgBuild.isAnimateTransform(item)) {
                                            const values = transformMap.get(value);
                                            if (values) {
                                                values.push(item);
                                            } else {
                                                transformMap.set(value, [item]);
                                            }
                                        } else {
                                            const values = sequentialMap.get(value);
                                            if (values) {
                                                values.push(item);
                                            } else {
                                                sequentialMap.set(value, [item]);
                                            }
                                        }
                                    } else {
                                        if (SvgBuild.isAnimateTransform(item)) {
                                            item.expandToValues();
                                        }
                                        if (item.iterationCount === -1) {
                                            isolatedData.push(item);
                                        } else if (
                                            (!item.fromToType ||
                                                (SvgBuild.isAnimateTransform(item) && item.transformOrigin)) &&
                                            !(supportedKeyframes && getValueType(item.attributeName) !== 'pathType')
                                        ) {
                                            togetherTargets.push([item]);
                                        } else if (item.fillReplace) {
                                            isolatedData.push(item);
                                        } else {
                                            togetherData.push(item);
                                        }
                                    }
                                }
                            }
                        }
                        if (togetherData.length) {
                            togetherTargets.push(togetherData);
                        }
                        for (const [keyName, item] of sequentialMap.entries()) {
                            if (keyName.startsWith('sequentially_companion')) {
                                togetherTargets.push(item);
                            } else {
                                togetherTargets.push(item.sort(sortSynchronized));
                            }
                        }
                        for (const item of transformMap.values()) {
                            transformTargets.push(item.sort(sortSynchronized));
                        }
                        const combined = [togetherTargets, transformTargets];
                        for (let i = 0, length = isolatedData.length; i < length; ++i) {
                            combined.push([[isolatedData[i]]]);
                        }
                        for (let index = 0, length = combined.length; index < length; ++index) {
                            const targets = combined[index];
                            const t = targets.length;
                            if (t === 0) {
                                continue;
                            }
                            const setData = {
                                ordering: index === 0 || t === 1 ? '' : 'sequentially',
                                set: [],
                                objectAnimator: [],
                            };
                            for (let y = 0; y < t; ++y) {
                                const items = targets[y];
                                let ordering = '',
                                    synchronized,
                                    checkBefore,
                                    useKeyframes = true;
                                if (index <= 1 && items.some(item => item.synchronized && item.synchronized.value)) {
                                    if (!SvgBuild.isAnimateTransform(items[0])) {
                                        ordering = 'sequentially';
                                    }
                                    synchronized = true;
                                    useKeyframes = false;
                                } else if (
                                    index <= 1 &&
                                    items.some(item => item.synchronized && !item.synchronized.value)
                                ) {
                                    ordering = 'sequentially';
                                    synchronized = true;
                                    checkBefore = true;
                                } else if (index <= 1 && items.some(item => 'companion' in item)) {
                                    ordering = 'sequentially';
                                } else {
                                    if (index > 0) {
                                        ordering = 'sequentially';
                                    }
                                    if (index > 1 && SvgBuild.isAnimateTransform(items[0])) {
                                        checkBefore = true;
                                    }
                                }
                                const fillBefore = getFillData();
                                const repeating = getFillData();
                                const fillCustom = getFillData();
                                const fillAfter = getFillData();
                                const objectAnimator = repeating.objectAnimator;
                                const customAnimator = fillCustom.objectAnimator;
                                let beforeAnimator = fillBefore.objectAnimator,
                                    afterAnimator = fillAfter.objectAnimator,
                                    together = [];
                                const targeted = synchronized
                                    ? partitionArray$1(items, animate => animate.iterationCount !== -1)
                                    : [items];
                                for (let i = 0, u = targeted.length; i < u; ++i) {
                                    const partition = targeted[i];
                                    const v = partition.length;
                                    if (i === 1 && v > 1) {
                                        fillCustom.ordering = 'sequentially';
                                    }
                                    const animatorMap = new Map();
                                    for (let j = 0; j < v; ++j) {
                                        const item = partition[j];
                                        const valueType = getValueType(item.attributeName);
                                        if (valueType === undefined) {
                                            continue;
                                        }
                                        const requireBefore = item.delay > 0;
                                        let transforming,
                                            transformOrigin = null;
                                        if (item.setterType) {
                                            const propertyNames = getAttributePropertyName(item.attributeName);
                                            if (propertyNames) {
                                                const values = isColorType(item.attributeName)
                                                    ? getColorValue$1(item.to, true)
                                                    : item.to.trim().split(/\s+/);
                                                if (
                                                    values &&
                                                    values.length === propertyNames.length &&
                                                    !values.some(value => !value)
                                                ) {
                                                    let companionBefore, companionAfter;
                                                    for (let k = 0, q = propertyNames.length; k < q; ++k) {
                                                        let valueFrom;
                                                        if (valueType === 'pathType') {
                                                            valueFrom = values[k];
                                                        } else if (requireBefore) {
                                                            if (item.baseValue) {
                                                                valueFrom = convertValueType(
                                                                    item,
                                                                    item.baseValue.trim().split(/\s+/)[k]
                                                                );
                                                            }
                                                        }
                                                        const propertyValue = createPropertyValue(
                                                            propertyNames[k],
                                                            valueType,
                                                            values[k],
                                                            '1',
                                                            precision,
                                                            valueFrom,
                                                            item.delay > 0 ? item.delay.toString() : ''
                                                        );
                                                        if (index > 1) {
                                                            customAnimator.push(propertyValue);
                                                            insertFillAfter(
                                                                propertyNames[k],
                                                                valueType,
                                                                item,
                                                                synchronized,
                                                                transforming,
                                                                precision,
                                                                afterAnimator,
                                                                transformOrigin,
                                                                undefined,
                                                                index > 1 ? item.duration : 0
                                                            );
                                                        } else {
                                                            const companion = item.companion;
                                                            if (companion) {
                                                                if (companion.key <= 0) {
                                                                    (companionBefore || (companionBefore = [])).push(
                                                                        propertyValue
                                                                    );
                                                                } else if (companion.key > 0) {
                                                                    (companionAfter || (companionAfter = [])).push(
                                                                        propertyValue
                                                                    );
                                                                }
                                                            } else {
                                                                together.push(propertyValue);
                                                            }
                                                        }
                                                    }
                                                    if (companionBefore) {
                                                        beforeAnimator = beforeAnimator.concat(companionBefore);
                                                    }
                                                    if (companionAfter) {
                                                        afterAnimator = afterAnimator.concat(companionAfter);
                                                    }
                                                }
                                            }
                                        } else if (SvgBuild.isAnimate(item)) {
                                            let resetBefore = checkBefore,
                                                values = null,
                                                repeatCount,
                                                beforeValues,
                                                propertyNames;
                                            if (i === 1) {
                                                repeatCount = v > 1 ? '0' : '-1';
                                            } else {
                                                repeatCount =
                                                    item.iterationCount !== -1
                                                        ? Math.ceil(item.iterationCount - 1).toString()
                                                        : '-1';
                                            }
                                            const options = createPropertyValue(
                                                '',
                                                valueType,
                                                '',
                                                item.duration.toString(),
                                                precision,
                                                '',
                                                item.delay > 0 ? item.delay.toString() : '',
                                                repeatCount
                                            );
                                            if (!synchronized && valueType === 'pathType') {
                                                if (group.pathData) {
                                                    const parent = item.parent;
                                                    let transforms = null,
                                                        parentContainer = null;
                                                    if (parent && SvgBuild.isShape(parent)) {
                                                        parentContainer = parent;
                                                        if (parent.path) {
                                                            transforms = parent.path.transformed;
                                                        }
                                                    }
                                                    propertyNames = ['pathData'];
                                                    values = SvgPath.extrapolate(
                                                        item.attributeName,
                                                        group.pathData,
                                                        item.values,
                                                        transforms,
                                                        parentContainer,
                                                        precision
                                                    );
                                                }
                                            } else if (SvgBuild.asAnimateTransform(item)) {
                                                propertyNames = getTransformPropertyName(item.type);
                                                values = getTransformValues(item);
                                                if (propertyNames && values) {
                                                    if (checkBefore && item.keyTimes[0] === 0) {
                                                        resetBefore = false;
                                                    }
                                                    if (resetBefore || requireBefore) {
                                                        beforeValues = plainMap$3(
                                                            propertyNames,
                                                            value => getTransformInitialValue(value) || '0'
                                                        );
                                                    }
                                                    if (item.transformOrigin) {
                                                        transformOrigin = item.transformOrigin;
                                                    }
                                                }
                                                transforming = true;
                                            } else if (SvgBuild.asAnimateMotion(item)) {
                                                propertyNames = getTransformPropertyName(item.type);
                                                values = getTransformValues(item);
                                                const rotateValues = item.rotateValues;
                                                if (rotateValues && propertyNames && values) {
                                                    const q = values.length;
                                                    if (rotateValues.length === q) {
                                                        propertyNames.push('rotation');
                                                        for (let k = 0; k < q; ++k) {
                                                            values[k].push(rotateValues[k]);
                                                        }
                                                    }
                                                }
                                                transforming = true;
                                            } else {
                                                propertyNames = getAttributePropertyName(item.attributeName);
                                                switch (valueType) {
                                                    case 'intType':
                                                        values = plainMap$3(item.values, value =>
                                                            convertInt$1(value).toString()
                                                        );
                                                        if (requireBefore && item.baseValue) {
                                                            beforeValues = replaceMap$1(
                                                                SvgBuild.parseCoordinates(item.baseValue),
                                                                value => Math.trunc(value).toString()
                                                            );
                                                        }
                                                        break;
                                                    case 'floatType':
                                                        if (item.attributeName === 'stroke-dasharray') {
                                                            values = plainMap$3(item.values, value =>
                                                                replaceMap$1(value.split(' '), fraction =>
                                                                    parseFloat(fraction)
                                                                )
                                                            );
                                                        } else {
                                                            values = item.values;
                                                        }
                                                        if (requireBefore && item.baseValue) {
                                                            beforeValues = replaceMap$1(
                                                                SvgBuild.parseCoordinates(item.baseValue),
                                                                value => value.toString()
                                                            );
                                                        }
                                                        break;
                                                    default:
                                                        values = item.values.slice(0);
                                                        if (isColorType(item.attributeName)) {
                                                            if (requireBefore && item.baseValue) {
                                                                beforeValues = getColorValue$1(item.baseValue, true);
                                                            }
                                                            for (let k = 0, r = values.length; k < r; ++k) {
                                                                if (values[k] !== '') {
                                                                    values[k] =
                                                                        getColorValue$1(values[k]) ||
                                                                        values[k - 1] ||
                                                                        '';
                                                                }
                                                            }
                                                        }
                                                        break;
                                                }
                                            }
                                            if (!item.keySplines) {
                                                const timingFunction = item.timingFunction;
                                                options.interpolator = timingFunction
                                                    ? createPathInterpolator(timingFunction)
                                                    : this.options.animateInterpolator;
                                            }
                                            if (values && propertyNames) {
                                                const { keyTimes, synchronized: syncData } = item;
                                                const q = propertyNames.length;
                                                const keyName = syncData
                                                    ? syncData.key + syncData.value
                                                    : index !== 0 || q > 1
                                                    ? JSON.stringify(options)
                                                    : '';
                                                for (let k = 0, r = keyTimes.length; k < q; ++k) {
                                                    const propertyName = propertyNames[k];
                                                    if (resetBefore && beforeValues) {
                                                        resetBeforeValue(
                                                            propertyName,
                                                            valueType,
                                                            beforeValues[k],
                                                            beforeAnimator,
                                                            precision
                                                        );
                                                    }
                                                    if (useKeyframes && r > 1) {
                                                        if (supportedKeyframes && valueType !== 'pathType') {
                                                            if (!resetBefore && requireBefore && beforeValues) {
                                                                resetBeforeValue(
                                                                    propertyName,
                                                                    valueType,
                                                                    beforeValues[k],
                                                                    beforeAnimator,
                                                                    precision
                                                                );
                                                            }
                                                            const propertyValuesHolder = animatorMap.get(keyName) || [];
                                                            const keyframe = [];
                                                            for (let l = 0; l < r; ++l) {
                                                                let value = getPropertyValue(values, l, k, true);
                                                                if (value && valueType === 'floatType') {
                                                                    value = truncate$8(value, precision);
                                                                }
                                                                keyframe.push({
                                                                    interpolator:
                                                                        l &&
                                                                        value !== '' &&
                                                                        propertyName !== 'pivotX' &&
                                                                        propertyName !== 'pivotY'
                                                                            ? getPathInterpolator(
                                                                                  item.keySplines,
                                                                                  l - 1
                                                                              )
                                                                            : '',
                                                                    fraction:
                                                                        keyTimes[l] === 0 && value === ''
                                                                            ? ''
                                                                            : truncate$8(
                                                                                  keyTimes[l],
                                                                                  floatPrecisionKeyTime
                                                                              ),
                                                                    value,
                                                                });
                                                            }
                                                            propertyValuesHolder.push({ propertyName, keyframe });
                                                            if (!animatorMap.has(keyName)) {
                                                                if (keyName !== '') {
                                                                    animatorMap.set(keyName, propertyValuesHolder);
                                                                }
                                                                (i === 0 ? objectAnimator : customAnimator).push(
                                                                    Object.assign(Object.assign({}, options), {
                                                                        propertyValuesHolder,
                                                                    })
                                                                );
                                                            }
                                                            transformOrigin = null;
                                                        } else {
                                                            ordering = 'sequentially';
                                                            const translateData = getFillData('sequentially');
                                                            for (let l = 0; l < r; ++l) {
                                                                const keyTime = keyTimes[l];
                                                                const propertyOptions = Object.assign(
                                                                    Object.assign({}, options),
                                                                    {
                                                                        propertyName,
                                                                        startOffset:
                                                                            l === 0
                                                                                ? (
                                                                                      item.delay +
                                                                                      (keyTime > 0
                                                                                          ? Math.floor(
                                                                                                keyTime * item.duration
                                                                                            )
                                                                                          : 0)
                                                                                  ).toString()
                                                                                : '',
                                                                        propertyValuesHolder: false,
                                                                    }
                                                                );
                                                                let valueTo = getPropertyValue(
                                                                    values,
                                                                    l,
                                                                    k,
                                                                    false,
                                                                    valueType === 'pathType'
                                                                        ? group.pathData
                                                                        : item.baseValue
                                                                );
                                                                if (valueTo) {
                                                                    let duration;
                                                                    if (l === 0) {
                                                                        if (
                                                                            !checkBefore &&
                                                                            requireBefore &&
                                                                            beforeValues
                                                                        ) {
                                                                            propertyOptions.valueFrom = beforeValues[k];
                                                                        } else if (valueType === 'pathType') {
                                                                            propertyOptions.valueFrom =
                                                                                group.pathData || values[0].toString();
                                                                        } else {
                                                                            propertyOptions.valueFrom =
                                                                                item.baseValue ||
                                                                                item.replaceValue ||
                                                                                '';
                                                                        }
                                                                        duration = 0;
                                                                    } else {
                                                                        propertyOptions.valueFrom = getPropertyValue(
                                                                            values,
                                                                            l - 1,
                                                                            k
                                                                        ).toString();
                                                                        duration = Math.floor(
                                                                            (keyTime - keyTimes[l - 1]) * item.duration
                                                                        );
                                                                    }
                                                                    if (valueType === 'floatType') {
                                                                        valueTo = truncate$8(valueTo, precision);
                                                                    }
                                                                    const origin =
                                                                        transformOrigin && transformOrigin[l];
                                                                    if (origin) {
                                                                        let translateTo = 0,
                                                                            direction;
                                                                        if (lastItemOf$1(propertyName) === 'X') {
                                                                            translateTo = origin.x;
                                                                            direction = 'translateX';
                                                                        } else if (lastItemOf$1(propertyName) === 'Y') {
                                                                            translateTo = origin.y;
                                                                            direction = 'translateY';
                                                                        }
                                                                        if (direction) {
                                                                            const valueData = createPropertyValue(
                                                                                direction,
                                                                                'floatType',
                                                                                truncate$8(translateTo, precision),
                                                                                duration.toString(),
                                                                                precision
                                                                            );
                                                                            valueData.interpolator = createPathInterpolator(
                                                                                KEYSPLINE_NAME['step-start']
                                                                            );
                                                                            translateData.objectAnimator.push(
                                                                                valueData
                                                                            );
                                                                        }
                                                                    }
                                                                    if (l > 0) {
                                                                        propertyOptions.interpolator = getPathInterpolator(
                                                                            item.keySplines,
                                                                            l - 1
                                                                        );
                                                                    }
                                                                    propertyOptions.duration = duration.toString();
                                                                    propertyOptions.valueTo = valueTo;
                                                                    objectAnimator.push(propertyOptions);
                                                                }
                                                            }
                                                            if (translateData.objectAnimator.length) {
                                                                setData.set.push(translateData);
                                                            }
                                                        }
                                                    } else {
                                                        const propertyOptions = Object.assign(
                                                            Object.assign({}, options),
                                                            {
                                                                propertyName,
                                                                interpolator:
                                                                    item.duration > 1
                                                                        ? getPathInterpolator(item.keySplines, 0)
                                                                        : '',
                                                                propertyValuesHolder: false,
                                                            }
                                                        );
                                                        const s = values.length;
                                                        let valueTo;
                                                        if (Array.isArray(values[0])) {
                                                            valueTo = values[s - 1][k];
                                                            if (s > 1) {
                                                                const from = values[0][k];
                                                                if (from !== valueTo) {
                                                                    propertyOptions.valueFrom = from.toString();
                                                                }
                                                            }
                                                            propertyOptions.valueTo = valueTo.toString();
                                                        } else {
                                                            let valueFrom;
                                                            if (s > 1) {
                                                                valueFrom = values[0].toString();
                                                                valueTo = values[s - 1].toString();
                                                            } else {
                                                                valueFrom =
                                                                    item.from ||
                                                                    (!checkBefore && requireBefore && beforeValues
                                                                        ? beforeValues[j]
                                                                        : '');
                                                                valueTo = item.to;
                                                            }
                                                            if (valueType === 'pathType') {
                                                                propertyOptions.valueFrom =
                                                                    valueFrom || group.pathData || valueTo;
                                                            } else if (valueFrom && valueFrom !== valueTo) {
                                                                propertyOptions.valueFrom = convertValueType(
                                                                    item,
                                                                    valueFrom
                                                                );
                                                            }
                                                            propertyOptions.valueTo = valueTo;
                                                        }
                                                        if (valueTo !== '') {
                                                            if (valueType === 'floatType') {
                                                                propertyOptions.valueTo = truncate$8(
                                                                    valueTo,
                                                                    precision
                                                                );
                                                            }
                                                            (i === 0 ? objectAnimator : customAnimator).push(
                                                                propertyOptions
                                                            );
                                                        }
                                                    }
                                                    if (i === 0 && !synchronized && item.iterationCount !== -1) {
                                                        insertFillAfter(
                                                            propertyName,
                                                            valueType,
                                                            item,
                                                            synchronized,
                                                            transforming,
                                                            precision,
                                                            afterAnimator,
                                                            transformOrigin,
                                                            objectAnimator
                                                        );
                                                    }
                                                }
                                                if (requireBefore && transformOrigin && transformOrigin.length) {
                                                    resetBeforeValue(
                                                        'translateX',
                                                        valueType,
                                                        '0',
                                                        beforeAnimator,
                                                        precision
                                                    );
                                                    resetBeforeValue(
                                                        'translateY',
                                                        valueType,
                                                        '0',
                                                        beforeAnimator,
                                                        precision
                                                    );
                                                }
                                            }
                                        }
                                    }
                                }
                                const valid = objectAnimator.length > 0 || customAnimator.length > 0;
                                if (ordering === 'sequentially') {
                                    if (valid && beforeAnimator.length === 1) {
                                        objectAnimator.unshift(beforeAnimator[0]);
                                        beforeAnimator.length = 0;
                                    }
                                    if (customAnimator.length === 1) {
                                        objectAnimator.push(customAnimator[0]);
                                        customAnimator.length = 0;
                                    }
                                    if (valid && afterAnimator.length === 1) {
                                        objectAnimator.push(afterAnimator[0]);
                                        afterAnimator.length = 0;
                                    }
                                }
                                if (
                                    beforeAnimator.length === 0 &&
                                    customAnimator.length === 0 &&
                                    afterAnimator.length === 0
                                ) {
                                    if (ordering === 'sequentially' && objectAnimator.length === 1) {
                                        ordering = '';
                                    }
                                    if (setData.ordering !== 'sequentially' && ordering !== 'sequentially') {
                                        together = together.concat(objectAnimator);
                                        objectAnimator.length = 0;
                                    }
                                }
                                if (objectAnimator.length || customAnimator.length) {
                                    if (beforeAnimator.length) {
                                        setData.ordering = 'sequentially';
                                        setData.set.push(fillBefore);
                                    }
                                    if (objectAnimator.length) {
                                        repeating.ordering = ordering;
                                        setData.set.push(repeating);
                                    }
                                    if (customAnimator.length) {
                                        setData.ordering = 'sequentially';
                                        setData.set.push(fillCustom);
                                    }
                                    if (afterAnimator.length) {
                                        setData.ordering = 'sequentially';
                                        setData.set.push(fillAfter);
                                    }
                                }
                                if (together.length) {
                                    setData.objectAnimator = setData.objectAnimator.concat(together);
                                }
                            }
                            if (setData.set.length || setData.objectAnimator.length) {
                                targetSetTemplate.set.push(setData);
                            }
                        }
                        insertTargetAnimation(data, name, targetSetTemplate, templateName, imageLength);
                    }
                    for (const [name, target] of this._animateTarget.entries()) {
                        const animate = target.animate;
                        let objectAnimator;
                        for (let i = 0, length = animate.length; i < length; ++i) {
                            const item = animate[i];
                            if (SvgBuild.asAnimateMotion(item)) {
                                const parent = item.parent;
                                if (parent && SvgBuild.isShape(parent)) {
                                    const path = parent.path;
                                    if (path) {
                                        const { value, baseValue } = path;
                                        if (value !== baseValue) {
                                            (objectAnimator || (objectAnimator = [])).push(
                                                createPropertyValue(
                                                    'pathData',
                                                    'pathType',
                                                    baseValue,
                                                    '0',
                                                    precision,
                                                    value
                                                )
                                            );
                                            if (item.iterationCount !== -1 && !item.setterType) {
                                                objectAnimator.push(
                                                    createPropertyValue(
                                                        'pathData',
                                                        'pathType',
                                                        value,
                                                        '0',
                                                        precision,
                                                        baseValue,
                                                        item.getTotalDuration().toString()
                                                    )
                                                );
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (objectAnimator) {
                            insertTargetAnimation(
                                data,
                                name,
                                {
                                    set: [{ set: [], objectAnimator }],
                                    objectAnimator: [],
                                },
                                templateName,
                                imageLength
                            );
                        }
                    }
                    if (data[0].target) {
                        vectorName = Resource.insertStoredAsset(
                            'drawables',
                            getTemplateFilename(templateName, imageLength, 'anim'),
                            applyTemplate('animated-vector', ANIMATEDVECTOR_TMPL, data)
                        );
                    }
                }
            }
            if (imageLength) {
                const resource = this.resource;
                const item = [];
                const layerData = [{ 'xmlns:android': XML_NAMESPACE.android, item }];
                if (vectorName) {
                    item.push({ drawable: getDrawableSrc(vectorName) });
                }
                for (let i = 0; i < imageLength; ++i) {
                    const image = imageData[i];
                    const { x, y } = getRootOffset(image.element, svg.element);
                    const box = svg.viewBox;
                    const scaleX = svg.width / box.width;
                    const scaleY = svg.height / box.height;
                    const left = image.getBaseValue('x', 0) * scaleX + x;
                    const top = image.getBaseValue('y', 0) * scaleY + y;
                    const data = {
                        width: formatPX$c(image.getBaseValue('width', 0) * scaleX),
                        height: formatPX$c(image.getBaseValue('height', 0) * scaleY),
                        left: left !== 0 ? formatPX$c(left) : '',
                        top: top !== 0 ? formatPX$c(top) : '',
                    };
                    const src = getDrawableSrc(resource.addImageSet({ mdpi: image.href }));
                    if (image.rotateAngle) {
                        data.rotate = {
                            drawable: src,
                            fromDegrees: image.rotateAngle.toString(),
                            visible: image.visible ? 'true' : 'false',
                        };
                    } else {
                        data.drawable = src;
                    }
                    item.push(data);
                }
                return Resource.insertStoredAsset(
                    'drawables',
                    templateName,
                    applyTemplate('layer-list', LAYERLIST_TMPL, layerData)
                );
            }
            node.data(Resource.KEY_NAME, 'svg', svg);
            return vectorName;
        }
        parseVectorData(group, depth = 0) {
            const floatPrecision = this.options.floatPrecision;
            const result = this.createGroup(group);
            const length = result.length;
            const renderDepth = depth + length;
            let output = '';
            group.each(item => {
                if (item.visible) {
                    if (SvgBuild.isShape(item)) {
                        const itemPath = item.path;
                        if (itemPath && itemPath.value) {
                            const [path, groupArray] = this.createPath(item, itemPath);
                            const pathArray = [];
                            if (
                                parseFloat(itemPath.strokeWidth) &&
                                (itemPath.strokeDasharray || itemPath.strokeDashoffset)
                            ) {
                                const animateData = this._animateData.get(item.name);
                                if (
                                    !animateData ||
                                    animateData.animate.every(animate =>
                                        animate.attributeName.startsWith('stroke-dash')
                                    )
                                ) {
                                    const [animations, strokeDash, pathData, clipPathData] = itemPath.extractStrokeDash(
                                        animateData === null || animateData === void 0 ? void 0 : animateData.animate,
                                        floatPrecision
                                    );
                                    if (strokeDash) {
                                        if (animateData) {
                                            this._animateData.delete(item.name);
                                            if (animations) {
                                                animateData.animate = animations;
                                            }
                                        }
                                        const name = getVectorName(item, 'stroke');
                                        const strokeData = { name };
                                        if (pathData !== '') {
                                            path.pathData = pathData;
                                        }
                                        if (clipPathData !== '') {
                                            strokeData['clip-path'] = [{ pathData: clipPathData }];
                                        }
                                        for (let i = 0, q = strokeDash.length; i < q; ++i) {
                                            const strokePath = i === 0 ? path : Object.assign({}, path);
                                            const dash = strokeDash[i];
                                            strokePath.name = name + '_' + i;
                                            if (animateData) {
                                                this._animateData.set(strokePath.name, {
                                                    element: animateData.element,
                                                    animate: animateData.animate.filter(
                                                        animate => animate.id === undefined || animate.id === i
                                                    ),
                                                });
                                            }
                                            strokePath.trimPathStart = truncate$8(dash.start, floatPrecision);
                                            strokePath.trimPathEnd = truncate$8(dash.end, floatPrecision);
                                            pathArray.push(strokePath);
                                        }
                                        groupArray.unshift(strokeData);
                                    }
                                }
                            }
                            if (pathArray.length === 0) {
                                pathArray.push(path);
                            }
                            if (groupArray.length) {
                                const enclosing = groupArray[groupArray.length - 1];
                                enclosing.path = pathArray;
                                output += applyTemplate('group', VECTOR_GROUP, groupArray, renderDepth + 1);
                            } else {
                                output += applyTemplate('path', VECTOR_PATH, pathArray, renderDepth + 1);
                            }
                        }
                    } else if (SvgBuild.isContainer(item)) {
                        if (!item.isEmpty()) {
                            output += this.parseVectorData(item, renderDepth);
                        }
                    } else if (SvgBuild.asImage(item)) {
                        if (!SvgBuild.asPattern(group)) {
                            item.renderStatic(this.options.transformExclude.image);
                            this._imageData.push(item);
                        }
                    }
                }
            });
            if (length) {
                result[length - 1].include = output;
                return applyTemplate('group', VECTOR_GROUP, result, depth + 1);
            }
            return output;
        }
        createGroup(target) {
            const clipMain = [];
            const clipBox = [];
            const groupMain = { 'clip-path': clipMain };
            const groupBox = { 'clip-path': clipBox };
            const result = [];
            const transformData = {};
            if (
                ((SvgBuild.asSvg(target) && !target.documentRoot) || SvgBuild.isUse(target)) &&
                (target.x !== 0 || target.y !== 0)
            ) {
                transformData.name = getVectorName(target, 'main');
                transformData.translateX = target.x.toString();
                transformData.translateY = target.y.toString();
            }
            this.createClipPath(target, clipMain, target.clipRegion);
            if (clipMain.length || hasKeys$2(transformData)) {
                Object.assign(groupMain, transformData);
                result.push(groupMain);
            }
            if (target !== this._svgInstance) {
                const baseData = {};
                const groupName = getVectorName(target, 'animate');
                const transforms = groupTransforms(target.element, target.transforms, true)[0];
                if (
                    (SvgBuild.asG(target) || SvgBuild.asUseSymbol(target)) &&
                    this.createClipPath(target, clipBox, target.clipPath)
                ) {
                    baseData.name = groupName;
                }
                if (this.queueAnimations(target, groupName, item => SvgBuild.asAnimateTransform(item))) {
                    baseData.name = groupName;
                }
                if (baseData.name) {
                    Object.assign(groupBox, baseData);
                    result.push(groupBox);
                }
                const length = transforms.length;
                if (length) {
                    let transformed = [];
                    for (let i = 0; i < length; ++i) {
                        const data = transforms[i];
                        result.push(createTransformData(data));
                        transformed = transformed.concat(data);
                    }
                    target.transformed = transformed.reverse();
                }
            }
            return result;
        }
        createPath(target, path) {
            var _a, _b;
            const result = { name: target.name };
            const renderData = [];
            const clipElement = [];
            const baseData = {};
            const groupName = getVectorName(target, 'group');
            const opacity = getOuterOpacity(target);
            const useTarget = SvgBuild.asUseShape(target);
            const clipPath = path.clipPath;
            if (clipPath) {
                const { transformExclude: exclude, floatPrecision: precision } = this.options;
                const shape = new SvgShape(path.element);
                shape.build({ exclude, residualHandler, precision });
                shape.synchronize({ keyTimeMode: this._synchronizeMode, precision });
                this.createClipPath(shape, clipElement, clipPath);
            }
            if (SvgBuild.asUseShape(target) && target.clipPath !== clipPath) {
                this.createClipPath(target, clipElement, target.clipPath);
            }
            if (this.queueAnimations(target, groupName, item => SvgBuild.isAnimateTransform(item), '', target.name)) {
                baseData.name = groupName;
            } else if (clipElement.length) {
                baseData.name = '';
            }
            if (SvgBuild.asUseShape(target) && (target.x !== 0 || target.y !== 0)) {
                baseData.translateX = target.x.toString();
                baseData.translateY = target.y.toString();
            }
            if (clipElement.length) {
                baseData['clip-path'] = clipElement;
            }
            if (hasKeys$2(baseData)) {
                renderData.push(baseData);
            }
            (_a = path.transformResidual) === null || _a === void 0
                ? void 0
                : _a.forEach(item => renderData.push(createTransformData(item)));
            for (let i = 0, length = PATH_ATTRIBUTES.length; i < length; ++i) {
                let attr = PATH_ATTRIBUTES[i],
                    value = path[attr] || (useTarget && target[attr]);
                if (value) {
                    switch (attr) {
                        case 'name':
                            break;
                        case 'value':
                            attr = 'pathData';
                            break;
                        case 'fill':
                            attr = 'fillColor';
                            if (value !== 'none' && !result['aapt:attr']) {
                                const colorName = Resource.addColor(value);
                                if (colorName !== '') {
                                    value = `@color/${colorName}`;
                                }
                            } else {
                                continue;
                            }
                            break;
                        case 'stroke':
                            attr = 'strokeColor';
                            if (value !== 'none') {
                                const colorName = Resource.addColor(value);
                                if (colorName !== '') {
                                    value = `@color/${colorName}`;
                                }
                            } else {
                                continue;
                            }
                            break;
                        case 'fillPattern': {
                            const pattern = this._svgInstance.findFillPattern(value);
                            if (pattern) {
                                switch (path.element.tagName) {
                                    case 'path':
                                        if (!/[zZ]\s*$/.test(path.value)) {
                                            break;
                                        }
                                    case 'rect':
                                    case 'polygon':
                                    case 'polyline':
                                    case 'circle':
                                    case 'ellipse': {
                                        const gradient = createFillGradient(pattern, path, this.options.floatPrecision);
                                        if (gradient) {
                                            result['aapt:attr'] = {
                                                name: 'android:fillColor',
                                                gradient,
                                            };
                                            result.fillColor = '';
                                            this._namespaceAapt = true;
                                        }
                                    }
                                }
                            }
                            continue;
                        }
                        case 'fillRule':
                            if (value === 'evenodd') {
                                attr = 'fillType';
                                value = 'evenOdd';
                            } else {
                                continue;
                            }
                            break;
                        case 'strokeWidth':
                            if (value === '0') {
                                continue;
                            }
                            break;
                        case 'fillOpacity':
                        case 'strokeOpacity':
                            value = ((isNumber$1(value) ? parseFloat(value) : 1) * opacity).toString();
                            if (value === '1') {
                                continue;
                            }
                            attr = attr === 'fillOpacity' ? 'fillAlpha' : 'strokeAlpha';
                            break;
                        case 'strokeLinecap':
                            if (value === 'butt') {
                                continue;
                            }
                            attr = 'strokeLineCap';
                            break;
                        case 'strokeLinejoin':
                            if (value === 'miter') {
                                continue;
                            }
                            attr = 'strokeLineJoin';
                            break;
                        case 'strokeMiterlimit':
                            if (value === '4') {
                                continue;
                            }
                            attr = 'strokeMiterLimit';
                            break;
                        default:
                            continue;
                    }
                    result[attr] = value;
                }
            }
            if (!result.strokeWidth) {
                result.strokeColor = '';
            } else if (!result.strokeColor) {
                result.strokeWidth = '';
            }
            const fillReplaceMap = new Map();
            const transformResult = [];
            const replaceResult = [];
            const pathData = path.value;
            const animations = target.animations;
            let previousPathData = pathData,
                index = 0;
            for (let i = 0, length = animations.length; i < length; ++i) {
                const item = animations[i];
                if (SvgBuild.asAnimateTransform(item) && !item.additiveSum && item.transformFrom) {
                    let time = Math.max(0, item.delay - 1);
                    fillReplaceMap.set(time, {
                        index,
                        time,
                        to: item.transformFrom,
                        reset: false,
                        animate: item,
                    });
                    if (item.iterationCount !== -1 && item.fillReplace) {
                        time = item.delay + item.iterationCount * item.duration;
                        if (!fillReplaceMap.has(time)) {
                            fillReplaceMap.set(time, {
                                index,
                                time,
                                to: pathData,
                                reset: true,
                            });
                        }
                    }
                    ++index;
                }
            }
            const replaceData = Array.from(fillReplaceMap.values()).sort((a, b) => a.time - b.time);
            for (let i = 0, length = replaceData.length; i < length; ++i) {
                const item = replaceData[i];
                if (!item.reset || item.to !== previousPathData) {
                    let valid = true;
                    if (item.reset) {
                        invalid: {
                            for (let j = 0; j < i; ++j) {
                                const previous = replaceData[j];
                                if (!previous.reset) {
                                    for (let k = i + 1; k < length; ++k) {
                                        switch (replaceData[k].index) {
                                            case previous.index:
                                                valid = false;
                                            case item.index:
                                                break invalid;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        const itemTotal = [];
                        const previousType = new Set();
                        for (let j = 0; j < i; ++j) {
                            const previous = replaceData[j];
                            itemTotal[previous.index] = itemTotal[previous.index] ? 2 : 1;
                        }
                        for (let j = 0, q = itemTotal.length; j < q; ++j) {
                            if (itemTotal[j] === 1) {
                                const animate =
                                    (_b = replaceData.find(data => data.index === j && 'animate' in data)) === null ||
                                    _b === void 0
                                        ? void 0
                                        : _b.animate;
                                if (animate) {
                                    previousType.add(animate.type);
                                }
                            }
                        }
                        for (const type of previousType) {
                            const propertyName = getTransformPropertyName(type);
                            if (propertyName) {
                                const initialValue = TRANSFORM.typeAsValue(type).split(' ');
                                for (let j = 0, q = initialValue.length; j < q; ++j) {
                                    transformResult.push(
                                        createAnimateFromTo(propertyName[j], item.time, initialValue[j], '')
                                    );
                                }
                            }
                        }
                    }
                    if (valid) {
                        replaceResult.push(createAnimateFromTo('d', item.time, item.to));
                        previousPathData = item.to;
                    }
                }
            }
            if (
                !this.queueAnimations(
                    target,
                    result.name,
                    item => (SvgBuild.asAnimate(item) || SvgBuild.asSet(item)) && item.attributeName !== 'clip-path',
                    pathData
                ) &&
                replaceResult.length === 0 &&
                baseData.name !== groupName
            ) {
                result.name = '';
            }
            const animateData = this._animateData;
            if (transformResult.length) {
                const data = animateData.get(groupName);
                if (data) {
                    data.animate = data.animate.concat(transformResult);
                }
            }
            if (replaceResult.length) {
                const data = animateData.get(result.name);
                if (data) {
                    data.animate = data.animate.concat(replaceResult);
                } else {
                    animateData.set(result.name, {
                        element: target.element,
                        animate: replaceResult,
                        pathData,
                    });
                }
            }
            return [result, renderData];
        }
        createClipPath(target, clipArray, clipPath) {
            let valid = false;
            if (clipPath) {
                const definitions = this._svgInstance.definitions;
                const keyTimeMode = this._synchronizeMode;
                const { transformExclude: exclude, floatPrecision: precision } = this.options;
                clipPath.split(';').forEach((value, index, array) => {
                    if (value[0] === '#') {
                        const element = definitions.clipPath.get(value);
                        if (element) {
                            const g = new SvgG(element);
                            g.build({ exclude, residualHandler, precision });
                            g.synchronize({ keyTimeMode, precision });
                            g.each(child => {
                                const path = child.path;
                                if (path) {
                                    const pathData = path.value;
                                    if (pathData) {
                                        let name = getVectorName(child, 'clip_path', array.length > 1 ? index + 1 : -1);
                                        if (
                                            !this.queueAnimations(
                                                child,
                                                name,
                                                item => SvgBuild.asAnimate(item) || SvgBuild.asSet(item),
                                                pathData
                                            )
                                        ) {
                                            name = '';
                                        }
                                        clipArray.push({
                                            name,
                                            pathData,
                                            fillType:
                                                getAttribute(child.element, 'fill-rule', true) === 'evenodd'
                                                    ? 'evenOdd'
                                                    : '',
                                        });
                                        valid = true;
                                    }
                                }
                            });
                        }
                    } else {
                        let name = getVectorName(target, 'clip_path', array.length > 1 ? index + 1 : -1);
                        if (
                            !this.queueAnimations(
                                target,
                                name,
                                item =>
                                    item.attributeName === 'clip-path' &&
                                    (SvgBuild.asAnimate(item) || SvgBuild.asSet(item)),
                                value
                            )
                        ) {
                            name = '';
                        }
                        clipArray.push({
                            name,
                            pathData: value,
                            fillType: getAttribute(target.element, 'fill-rule', true) === 'evenodd' ? 'evenOdd' : '',
                        });
                        valid = true;
                    }
                });
            }
            return valid;
        }
        queueAnimations(svg, name, predicate, pathData = '', targetName) {
            if (svg.animations.length) {
                const animate = svg.animations.filter(
                    (item, index, array) =>
                        !item.paused && (item.duration >= 0 || item.setterType) && predicate(item, index, array)
                );
                if (animate.length) {
                    const element = svg.element;
                    this._animateData.set(name, {
                        element,
                        animate,
                        pathData,
                    });
                    if (targetName) {
                        this._animateTarget.set(targetName, {
                            element,
                            animate,
                            pathData,
                        });
                    }
                    return true;
                }
            }
            return false;
        }
    }

    const settings = {
        builtInExtensions: [
            'squared.accessibility',
            'android.delegate.background',
            'android.delegate.negative-x',
            'android.delegate.positive-x',
            'android.delegate.max-width-height',
            'android.delegate.percent',
            'android.delegate.scrollbar',
            'android.delegate.radiogroup',
            'android.delegate.multiline',
            'squared.relative',
            'squared.css-grid',
            'squared.flexbox',
            'squared.table',
            'squared.column',
            'squared.list',
            'squared.grid',
            'squared.sprite',
            'squared.whitespace',
            'android.resource.svg',
            'android.resource.background',
            'android.resource.strings',
            'android.resource.fonts',
            'android.resource.dimens',
            'android.resource.styles',
            'android.resource.data',
            'android.resource.includes',
        ],
        targetAPI: 30,
        resolutionDPI: 160,
        resolutionScreenWidth: 1280,
        resolutionScreenHeight: 900,
        framesPerSecond: 60,
        supportRTL: true,
        preloadImages: true,
        compressImages: false,
        convertImages: '',
        preloadFonts: true,
        supportNegativeLeftTop: true,
        fontMeasureWrap: true,
        fontMeasureAdjust: 0.75,
        lineHeightAdjust: 1.1,
        customizationsOverwritePrivilege: true,
        showAttributes: true,
        createElementMap: false,
        createQuerySelectorMap: false,
        convertPixels: 'dp',
        insertSpaces: 4,
        showErrorMessages: true,
        manifestLabelAppName: 'android',
        manifestThemeName: 'AppTheme',
        manifestParentThemeName: 'Theme.AppCompat.Light.NoActionBar',
        outputMainFileName: 'activity_main.xml',
        outputDirectory: 'app/src/main',
        outputEmptyCopyDirectory: false,
        outputArchiveName: 'android-xml',
        outputArchiveFormat: 'zip',
    };

    let application = null;
    let file = null;
    const checkApplication = () =>
        application ? application.closed || (!application.initializing && application.finalize()) : false;
    const checkFileName = value => value || application.userSettings.outputArchiveName;
    const appBase = {
        base: {
            Controller,
            File,
            Resource,
            View,
        },
        extensions: {
            Accessibility,
            Column,
            CssGrid,
            External,
            Flexbox,
            Grid,
            List,
            Relative,
            Sprite,
            Substitute,
            Table,
            WhiteSpace,
            delegate: {
                Background: Background,
                MaxWidthHeight: MaxWidthHeight,
                Multiline: Multiline,
                NegativeX: NegativeX,
                Percent: Percent,
                PositiveX: PositiveX,
                RadioGroup: RadioGroup,
                ScrollBar: ScrollBar,
            },
            resource: {
                Background: ResourceBackground,
                Data: ResourceData,
                Dimens: ResourceDimens,
                Fonts: ResourceFonts,
                Includes: ResourceIncludes,
                Strings: ResourceStrings,
                Styles: ResourceStyles,
                Svg: ResourceSvg,
            },
        },
        lib: {
            constant,
            customization,
            util,
        },
        system: {
            copyLayoutAllXml(directory, options) {
                if (checkApplication()) {
                    file.layoutAllToXml(application.layouts, Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceAllXml(directory, options) {
                if (checkApplication()) {
                    file.resourceAllToXml(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceStringXml(directory, options) {
                if (checkApplication()) {
                    file.resourceStringToXml(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceArrayXml(directory, options) {
                if (checkApplication()) {
                    file.resourceStringArrayToXml(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceFontXml(directory, options) {
                if (checkApplication()) {
                    file.resourceFontToXml(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceColorXml(directory, options) {
                if (checkApplication()) {
                    file.resourceColorToXml(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceStyleXml(directory, options) {
                if (checkApplication()) {
                    file.resourceStyleToXml(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceDimenXml(directory, options) {
                if (checkApplication()) {
                    file.resourceDimenToXml(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceDrawableXml(directory, options) {
                if (checkApplication()) {
                    file.resourceDrawableToXml(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceAnimXml(directory, options) {
                if (checkApplication()) {
                    file.resourceAnimToXml(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceDrawableImage(directory, options) {
                if (checkApplication()) {
                    file.resourceDrawableImageToString(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceRawVideo(directory, options) {
                if (checkApplication()) {
                    file.resourceRawVideoToString(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            copyResourceRawAudio(directory, options) {
                if (checkApplication()) {
                    file.resourceRawAudioToString(Object.assign(Object.assign({}, options), { directory }));
                }
            },
            saveLayoutAllXml(filename, options) {
                if (checkApplication()) {
                    file.layoutAllToXml(
                        application.layouts,
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-layouts' })
                    );
                }
            },
            saveResourceAllXml(filename, options) {
                if (checkApplication()) {
                    file.resourceAllToXml(
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-resources' })
                    );
                }
            },
            saveResourceStringXml(filename, options) {
                if (checkApplication()) {
                    file.resourceStringToXml(
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-string' })
                    );
                }
            },
            saveResourceArrayXml(filename, options) {
                if (checkApplication()) {
                    file.resourceStringArrayToXml(
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-array' })
                    );
                }
            },
            saveResourceFontXml(filename, options) {
                if (checkApplication()) {
                    file.resourceFontToXml(
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-font' })
                    );
                }
            },
            saveResourceColorXml(filename, options) {
                if (checkApplication()) {
                    file.resourceColorToXml(
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-color' })
                    );
                }
            },
            saveResourceStyleXml(filename, options) {
                if (checkApplication()) {
                    file.resourceStyleToXml(
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-style' })
                    );
                }
            },
            saveResourceDimenXml(filename, options) {
                if (checkApplication()) {
                    file.resourceDimenToXml(
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-dimen' })
                    );
                }
            },
            saveResourceDrawableXml(filename, options) {
                if (checkApplication()) {
                    file.resourceDrawableToXml(
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-drawable' })
                    );
                }
            },
            saveResourceAnimXml(filename, options) {
                if (checkApplication()) {
                    file.resourceAnimToXml(
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-anim' })
                    );
                }
            },
            saveResourceDrawableImage(filename, options) {
                if (checkApplication()) {
                    file.resourceDrawableImageToString(
                        Object.assign(Object.assign({}, options), {
                            filename: checkFileName(filename) + '-drawable-image',
                        })
                    );
                }
            },
            saveResourceRawVideo(filename, options) {
                if (checkApplication()) {
                    file.resourceRawVideoToString(
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-raw-video' })
                    );
                }
            },
            saveResourceRawAudio(filename, options) {
                if (checkApplication()) {
                    file.resourceRawAudioToString(
                        Object.assign(Object.assign({}, options), { filename: checkFileName(filename) + '-raw-audio' })
                    );
                }
            },
            writeLayoutAllXml(options) {
                return checkApplication() ? file.layoutAllToXml(application.layouts, options) : {};
            },
            writeResourceAllXml(options) {
                return checkApplication() ? file.resourceAllToXml(options) : {};
            },
            writeResourceStringXml(options) {
                return checkApplication() ? file.resourceStringToXml(options) : [];
            },
            writeResourceArrayXml(options) {
                return checkApplication() ? file.resourceStringArrayToXml(options) : [];
            },
            writeResourceFontXml(options) {
                return checkApplication() ? file.resourceFontToXml(options) : [];
            },
            writeResourceColorXml(options) {
                return checkApplication() ? file.resourceColorToXml(options) : [];
            },
            writeResourceStyleXml(options) {
                return checkApplication() ? file.resourceStyleToXml(options) : [];
            },
            writeResourceDimenXml(options) {
                return checkApplication() ? file.resourceDimenToXml(options) : [];
            },
            writeResourceDrawableXml(options) {
                return checkApplication() ? file.resourceDrawableToXml(options) : [];
            },
            writeResourceAnimXml(options) {
                return checkApplication() ? file.resourceAnimToXml(options) : [];
            },
            writeResourceDrawableImage(options) {
                return checkApplication() ? file.resourceDrawableImageToString(options) : [];
            },
            writeResourceRawVideo(options) {
                return checkApplication() ? file.resourceRawVideoToString(options) : [];
            },
            writeResourceRawAudio(options) {
                return checkApplication() ? file.resourceRawAudioToString(options) : [];
            },
        },
        create() {
            application = new Application(2 /* ANDROID */, View, Controller, squared.base.ExtensionManager, Resource);
            file = new File();
            application.resourceHandler.fileHandler = file;
            application.builtInExtensions = new Map([
                [
                    'squared.accessibility' /* ACCESSIBILITY */,
                    new Accessibility('squared.accessibility' /* ACCESSIBILITY */, 2 /* ANDROID */),
                ],
                [
                    'android.delegate.background' /* DELEGATE_BACKGROUND */,
                    new Background('android.delegate.background' /* DELEGATE_BACKGROUND */, 2 /* ANDROID */),
                ],
                [
                    'android.delegate.negative-x' /* DELEGATE_NEGATIVEX */,
                    new NegativeX('android.delegate.negative-x' /* DELEGATE_NEGATIVEX */, 2 /* ANDROID */),
                ],
                [
                    'android.delegate.positive-x' /* DELEGATE_POSITIVEX */,
                    new PositiveX('android.delegate.positive-x' /* DELEGATE_POSITIVEX */, 2 /* ANDROID */),
                ],
                [
                    'android.delegate.max-width-height' /* DELEGATE_MAXWIDTHHEIGHT */,
                    new MaxWidthHeight(
                        'android.delegate.max-width-height' /* DELEGATE_MAXWIDTHHEIGHT */,
                        2 /* ANDROID */
                    ),
                ],
                [
                    'android.delegate.percent' /* DELEGATE_PERCENT */,
                    new Percent('android.delegate.percent' /* DELEGATE_PERCENT */, 2 /* ANDROID */),
                ],
                [
                    'android.delegate.scrollbar' /* DELEGATE_SCROLLBAR */,
                    new ScrollBar('android.delegate.scrollbar' /* DELEGATE_SCROLLBAR */, 2 /* ANDROID */),
                ],
                [
                    'android.delegate.radiogroup' /* DELEGATE_RADIOGROUP */,
                    new RadioGroup('android.delegate.radiogroup' /* DELEGATE_RADIOGROUP */, 2 /* ANDROID */),
                ],
                [
                    'android.delegate.multiline' /* DELEGATE_MULTILINE */,
                    new Multiline('android.delegate.multiline' /* DELEGATE_MULTILINE */, 2 /* ANDROID */),
                ],
                ['squared.relative' /* RELATIVE */, new Relative('squared.relative' /* RELATIVE */, 2 /* ANDROID */)],
                ['squared.css-grid' /* CSS_GRID */, new CssGrid('squared.css-grid' /* CSS_GRID */, 2 /* ANDROID */)],
                ['squared.flexbox' /* FLEXBOX */, new Flexbox('squared.flexbox' /* FLEXBOX */, 2 /* ANDROID */)],
                [
                    'squared.table' /* TABLE */,
                    new Table('squared.table' /* TABLE */, 2 /* ANDROID */, { tagNames: ['TABLE'] }),
                ],
                ['squared.column' /* COLUMN */, new Column('squared.column' /* COLUMN */, 2 /* ANDROID */)],
                ['squared.list' /* LIST */, new List('squared.list' /* LIST */, 2 /* ANDROID */)],
                [
                    'squared.grid' /* GRID */,
                    new Grid('squared.grid' /* GRID */, 2 /* ANDROID */, {
                        tagNames: [
                            'DIV',
                            'FORM',
                            'UL',
                            'OL',
                            'DL',
                            'NAV',
                            'SECTION',
                            'ASIDE',
                            'MAIN',
                            'HEADER',
                            'FOOTER',
                            'P',
                            'ARTICLE',
                            'FIELDSET',
                        ],
                    }),
                ],
                ['squared.sprite' /* SPRITE */, new Sprite('squared.sprite' /* SPRITE */, 2 /* ANDROID */)],
                [
                    'squared.whitespace' /* WHITESPACE */,
                    new WhiteSpace('squared.whitespace' /* WHITESPACE */, 2 /* ANDROID */),
                ],
                [
                    'android.resource.svg' /* RESOURCE_SVG */,
                    new ResourceSvg('android.resource.svg' /* RESOURCE_SVG */, 2 /* ANDROID */),
                ],
                [
                    'android.resource.background' /* RESOURCE_BACKGROUND */,
                    new ResourceBackground('android.resource.background' /* RESOURCE_BACKGROUND */, 2 /* ANDROID */),
                ],
                [
                    'android.resource.strings' /* RESOURCE_STRINGS */,
                    new ResourceStrings('android.resource.strings' /* RESOURCE_STRINGS */, 2 /* ANDROID */),
                ],
                [
                    'android.resource.fonts' /* RESOURCE_FONTS */,
                    new ResourceFonts('android.resource.fonts' /* RESOURCE_FONTS */, 2 /* ANDROID */),
                ],
                [
                    'android.resource.dimens' /* RESOURCE_DIMENS */,
                    new ResourceDimens('android.resource.dimens' /* RESOURCE_DIMENS */, 2 /* ANDROID */),
                ],
                [
                    'android.resource.styles' /* RESOURCE_STYLES */,
                    new ResourceStyles('android.resource.styles' /* RESOURCE_STYLES */, 2 /* ANDROID */),
                ],
                [
                    'android.resource.includes' /* RESOURCE_INCLUDES */,
                    new ResourceIncludes('android.resource.includes' /* RESOURCE_INCLUDES */, 2 /* ANDROID */),
                ],
                [
                    'android.resource.data' /* RESOURCE_DATA */,
                    new ResourceData('android.resource.data' /* RESOURCE_DATA */, 2 /* ANDROID */),
                ],
                ['android.external' /* EXTERNAL */, new External('android.external' /* EXTERNAL */, 2 /* ANDROID */)],
                [
                    'android.substitute' /* SUBSTITUTE */,
                    new Substitute('android.substitute' /* SUBSTITUTE */, 2 /* ANDROID */),
                ],
            ]);
            return {
                application,
                framework: 2 /* ANDROID */,
                userSettings: Object.assign({}, settings),
            };
        },
        cached() {
            if (application) {
                return {
                    application,
                    framework: 2 /* ANDROID */,
                    userSettings: application.userSettings,
                };
            }
            return this.create();
        },
        setViewModel(data, sessionId) {
            if (application) {
                application.setViewModel(data, sessionId);
            }
        },
        customize(build, widget, options) {
            const api = API_VERSION[build];
            if (api) {
                const data = api.assign[widget];
                return data ? Object.assign(data, options) : (api.assign[widget] = options);
            }
        },
        addXmlNs(name, uri) {
            XML_NAMESPACE[name] = uri;
        },
    };

    return appBase;
})();
