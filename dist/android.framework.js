/* android-framework 0.9.1
   https://github.com/anpham6/squared */

var android = (function () {
    'use strict';

    var CONTAINER_NODE;
    (function (CONTAINER_NODE) {
        CONTAINER_NODE[CONTAINER_NODE["CHECKBOX"] = 1] = "CHECKBOX";
        CONTAINER_NODE[CONTAINER_NODE["RADIO"] = 2] = "RADIO";
        CONTAINER_NODE[CONTAINER_NODE["EDIT"] = 3] = "EDIT";
        CONTAINER_NODE[CONTAINER_NODE["SELECT"] = 4] = "SELECT";
        CONTAINER_NODE[CONTAINER_NODE["RANGE"] = 5] = "RANGE";
        CONTAINER_NODE[CONTAINER_NODE["SVG"] = 6] = "SVG";
        CONTAINER_NODE[CONTAINER_NODE["TEXT"] = 7] = "TEXT";
        CONTAINER_NODE[CONTAINER_NODE["IMAGE"] = 8] = "IMAGE";
        CONTAINER_NODE[CONTAINER_NODE["BUTTON"] = 9] = "BUTTON";
        CONTAINER_NODE[CONTAINER_NODE["INLINE"] = 10] = "INLINE";
        CONTAINER_NODE[CONTAINER_NODE["LINE"] = 11] = "LINE";
        CONTAINER_NODE[CONTAINER_NODE["SPACE"] = 12] = "SPACE";
        CONTAINER_NODE[CONTAINER_NODE["BLOCK"] = 13] = "BLOCK";
        CONTAINER_NODE[CONTAINER_NODE["FRAME"] = 14] = "FRAME";
        CONTAINER_NODE[CONTAINER_NODE["LINEAR"] = 15] = "LINEAR";
        CONTAINER_NODE[CONTAINER_NODE["GRID"] = 16] = "GRID";
        CONTAINER_NODE[CONTAINER_NODE["RELATIVE"] = 17] = "RELATIVE";
        CONTAINER_NODE[CONTAINER_NODE["CONSTRAINT"] = 18] = "CONSTRAINT";
        CONTAINER_NODE[CONTAINER_NODE["WEBVIEW"] = 19] = "WEBVIEW";
        CONTAINER_NODE[CONTAINER_NODE["UNKNOWN"] = 20] = "UNKNOWN";
    })(CONTAINER_NODE || (CONTAINER_NODE = {}));

    var enumeration = /*#__PURE__*/Object.freeze({
        get CONTAINER_NODE () { return CONTAINER_NODE; }
    });

    const EXT_ANDROID = {
        DELEGATE_FIXED: 'android.delegate.fixed',
        DELEGATE_MAXWIDTHHEIGHT: 'android.delegate.max-width-height',
        DELEGATE_PERCENT: 'android.delegate.percent',
        DELEGATE_RADIOGROUP: 'android.delegate.radiogroup',
        DELEGATE_SCROLLBAR: 'android.delegate.scrollbar',
        DELEGATE_VERTICALALIGN: 'android.delegate.verticalalign',
        CONSTRAINT_GUIDELINE: 'android.constraint.guideline',
        RESOURCE_INCLUDES: 'android.resource.includes',
        RESOURCE_BACKGROUND: 'android.resource.background',
        RESOURCE_SVG: 'android.resource.svg',
        RESOURCE_STRINGS: 'android.resource.strings',
        RESOURCE_FONTS: 'android.resource.fonts',
        RESOURCE_DIMENS: 'android.resource.dimens',
        RESOURCE_STYLES: 'android.resource.styles'
    };
    const CONTAINER_ANDROID = {
        CHECKBOX: 'CheckBox',
        RADIO: 'RadioButton',
        EDIT: 'EditText',
        SELECT: 'Spinner',
        RANGE: 'SeekBar',
        SVG: 'ImageView',
        TEXT: 'TextView',
        IMAGE: 'ImageView',
        BUTTON: 'Button',
        LINE: 'View',
        SPACE: 'Space',
        FRAME: 'FrameLayout',
        LINEAR: 'LinearLayout',
        GRID: 'GridLayout',
        RELATIVE: 'RelativeLayout',
        WEBVIEW: 'WebView',
        CONSTRAINT: 'android.support.constraint.ConstraintLayout',
        GUIDELINE: 'android.support.constraint.Guideline'
    };
    const ELEMENT_ANDROID = {
        PLAINTEXT: CONTAINER_NODE.TEXT,
        HR: CONTAINER_NODE.LINE,
        SVG: CONTAINER_NODE.SVG,
        IMG: CONTAINER_NODE.IMAGE,
        SELECT: CONTAINER_NODE.SELECT,
        RANGE: CONTAINER_NODE.RANGE,
        TEXT: CONTAINER_NODE.EDIT,
        PASSWORD: CONTAINER_NODE.EDIT,
        NUMBER: CONTAINER_NODE.EDIT,
        EMAIL: CONTAINER_NODE.EDIT,
        SEARCH: CONTAINER_NODE.EDIT,
        URL: CONTAINER_NODE.EDIT,
        DATE: CONTAINER_NODE.EDIT,
        TEL: CONTAINER_NODE.EDIT,
        TIME: CONTAINER_NODE.EDIT,
        WEEK: CONTAINER_NODE.EDIT,
        MONTH: CONTAINER_NODE.EDIT,
        TEXTAREA: CONTAINER_NODE.EDIT,
        FILE: CONTAINER_NODE.BUTTON,
        IMAGE: CONTAINER_NODE.BUTTON,
        BUTTON: CONTAINER_NODE.BUTTON,
        SUBMIT: CONTAINER_NODE.BUTTON,
        RESET: CONTAINER_NODE.BUTTON,
        CHECKBOX: CONTAINER_NODE.CHECKBOX,
        RADIO: CONTAINER_NODE.RADIO,
        IFRAME: CONTAINER_NODE.WEBVIEW,
        'DATETIME-LOCAL': CONTAINER_NODE.EDIT
    };
    const SUPPORT_ANDROID = {
        DRAWER: 'android.support.v4.widget.DrawerLayout',
        NAVIGATION_VIEW: 'android.support.design.widget.NavigationView',
        COORDINATOR: 'android.support.design.widget.CoordinatorLayout',
        APPBAR: 'android.support.design.widget.AppBarLayout',
        COLLAPSING_TOOLBAR: 'android.support.design.widget.CollapsingToolbarLayout',
        TOOLBAR: 'android.support.v7.widget.Toolbar',
        FLOATING_ACTION_BUTTON: 'android.support.design.widget.FloatingActionButton',
        BOTTOM_NAVIGATION: 'android.support.design.widget.BottomNavigationView'
    };
    const BOX_ANDROID = {
        MARGIN: 'layout_margin',
        MARGIN_VERTICAL: 'layout_marginVertical',
        MARGIN_HORIZONTAL: 'layout_marginHorizontal',
        MARGIN_TOP: 'layout_marginTop',
        MARGIN_RIGHT: 'layout_marginRight',
        MARGIN_BOTTOM: 'layout_marginBottom',
        MARGIN_LEFT: 'layout_marginLeft',
        PADDING: 'padding',
        PADDING_VERTICAL: 'paddingVertical',
        PADDING_HORIZONTAL: 'paddingHorizontal',
        PADDING_TOP: 'paddingTop',
        PADDING_RIGHT: 'paddingRight',
        PADDING_BOTTOM: 'paddingBottom',
        PADDING_LEFT: 'paddingLeft'
    };
    const AXIS_ANDROID = {
        HORIZONTAL: 'horizontal',
        VERTICAL: 'vertical'
    };
    const LAYOUT_ANDROID = {
        relativeParent: {
            left: 'layout_alignParentLeft',
            top: 'layout_alignParentTop',
            right: 'layout_alignParentRight',
            bottom: 'layout_alignParentBottom',
            centerHorizontal: 'layout_centerHorizontal',
            centerVertical: 'layout_centerVertical'
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
            bottomTop: 'layout_above'
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
            bottomTop: 'layout_constraintBottom_toTopOf'
        }
    };
    const XMLNS_ANDROID = {
        'android': 'http://schemas.android.com/apk/res/android',
        'app': 'http://schemas.android.com/apk/res-auto',
        'aapt': 'http://schemas.android.com/aapt',
        'tools': 'http://schemas.android.com/tools'
    };
    const PREFIX_ANDROID = {
        MENU: 'ic_menu_',
        DIALOG: 'ic_dialog_'
    };
    const RESERVED_JAVA = [
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
        'while'
    ];

    var constant = /*#__PURE__*/Object.freeze({
        EXT_ANDROID: EXT_ANDROID,
        CONTAINER_ANDROID: CONTAINER_ANDROID,
        ELEMENT_ANDROID: ELEMENT_ANDROID,
        SUPPORT_ANDROID: SUPPORT_ANDROID,
        BOX_ANDROID: BOX_ANDROID,
        AXIS_ANDROID: AXIS_ANDROID,
        LAYOUT_ANDROID: LAYOUT_ANDROID,
        XMLNS_ANDROID: XMLNS_ANDROID,
        PREFIX_ANDROID: PREFIX_ANDROID,
        RESERVED_JAVA: RESERVED_JAVA
    });

    const $util = squared.lib.util;
    const REGEXP_UNIT = /([">])(-)?(\d+(?:\.\d+)?px)(["<])/g;
    function stripId(value) {
        return value ? value.replace(/@\+?id\//, '') : '';
    }
    function createViewAttribute(options) {
        return Object.assign({ android: {}, app: {} }, options);
    }
    function createStyleAttribute(options) {
        const result = {
            output: {
                path: 'res/values',
                file: ''
            },
            name: '',
            parent: '',
            items: {}
        };
        if (options && typeof options === 'object') {
            for (const attr in result) {
                if (typeof options[attr] === typeof result[attr]) {
                    result[attr] = options[attr];
                }
            }
        }
        return result;
    }
    function convertLength(value, dpi = 160, font = false) {
        let result = parseFloat(value);
        if (!isNaN(result)) {
            result /= dpi / 160;
            value = result >= 1 || result === 0 ? Math.floor(result).toString() : result.toPrecision(2);
            return value + (font ? 'sp' : 'dp');
        }
        return '0dp';
    }
    function replaceLength(value, dpi = 160, format = 'dp', font = false) {
        if (format === 'dp' || font) {
            return value.replace(REGEXP_UNIT, (match, ...capture) => capture[0] + (capture[1] || '') + convertLength(capture[2], dpi, font) + capture[3]);
        }
        return value;
    }
    function replaceRTL(value, rtl, api) {
        if (rtl && api >= 17 /* JELLYBEAN_1 */) {
            switch (value) {
                case 'left':
                    return 'start';
                case 'right':
                    return 'end';
                case 'layout_marginLeft':
                    return 'layout_marginStart';
                case 'layout_marginRight':
                    return 'layout_marginEnd';
                case 'paddingLeft':
                    return 'paddingStart';
                case 'paddingRight':
                    return 'paddingEnd';
                case 'layout_alignParentLeft':
                    return 'layout_alignParentStart';
                case 'layout_alignParentRight':
                    return 'layout_alignParentEnd';
                case 'layout_alignLeft':
                    return 'layout_alignStart';
                case 'layout_alignRight':
                    return 'layout_alignEnd';
                case 'layout_toRightOf':
                    return 'layout_toEndOf';
                case 'layout_toLeftOf':
                    return 'layout_toStartOf';
                case 'layout_constraintLeft_toLeftOf':
                    return 'layout_constraintStart_toStartOf';
                case 'layout_constraintRight_toRightOf':
                    return 'layout_constraintEnd_toEndOf';
                case 'layout_constraintLeft_toRightOf':
                    return 'layout_constraintStart_toEndOf';
                case 'layout_constraintRight_toLeftOf':
                    return 'layout_constraintEnd_toStartOf';
            }
        }
        return value;
    }
    function replaceCharacter(value) {
        return value
            .replace(/&nbsp;/g, '&#160;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, "\\'")
            .replace(/"/g, '&quot;');
    }
    function replaceEntity(value) {
        return value
            .replace(/&#(\d+);/g, (match, capture) => String.fromCharCode(parseInt(capture)))
            .replace(/\u00A0/g, '&#160;')
            .replace(/\u2002/g, '&#8194;')
            .replace(/\u2003/g, '&#8195;')
            .replace(/\u2009/g, '&#8201;')
            .replace(/\u200C/g, '&#8204;')
            .replace(/\u200D/g, '&#8205;')
            .replace(/\u200E/g, '&#8206;')
            .replace(/\u200F/g, '&#8207;');
    }
    function escapeNonEntity(value) {
        return value.replace(/&(?!#?[A-Za-z0-9]{2,};)/g, '&amp;');
    }
    function getXmlNs(...values) {
        return $util.joinMap(values, namespace => XMLNS_ANDROID[namespace] ? `xmlns:${namespace}="${XMLNS_ANDROID[namespace]}"` : '', ' ').trim();
    }
    function getRootNs(value) {
        let output = '';
        for (const namespace in XMLNS_ANDROID) {
            if (value.indexOf(`${namespace}:`) !== -1) {
                output += `\n\t${getXmlNs(namespace)}`;
            }
        }
        return output;
    }

    var util = /*#__PURE__*/Object.freeze({
        stripId: stripId,
        createViewAttribute: createViewAttribute,
        createStyleAttribute: createStyleAttribute,
        convertLength: convertLength,
        replaceLength: replaceLength,
        replaceRTL: replaceRTL,
        replaceCharacter: replaceCharacter,
        replaceEntity: replaceEntity,
        escapeNonEntity: escapeNonEntity,
        getXmlNs: getXmlNs,
        getRootNs: getRootNs
    });

    const $Resource = squared.base.Resource;
    const $color = squared.lib.color;
    const $css = squared.lib.css;
    const $util$1 = squared.lib.util;
    const STORED = $Resource.STORED;
    function formatObject(obj, numberAlias = false) {
        if (obj) {
            for (const attr in obj) {
                if (typeof obj[attr] === 'object') {
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
                            if ($util$1.REGEXP_COMPILED.PROTOCOL.test(value)) {
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
    class Resource extends squared.base.Resource {
        constructor(application, cache) {
            super(application, cache);
            STORED.styles = new Map();
            STORED.themes = new Map();
            STORED.dimens = new Map();
            STORED.drawables = new Map();
            STORED.animators = new Map();
        }
        static formatOptions(options, numberAlias = false) {
            for (const namespace in options) {
                const obj = options[namespace];
                if (typeof obj === 'object') {
                    formatObject(obj, numberAlias);
                }
            }
            return options;
        }
        static addTheme(...values) {
            for (const theme of values) {
                let path = 'res/values';
                let file = 'themes.xml';
                if (theme.output) {
                    if ($util$1.isString(theme.output.path)) {
                        path = theme.output.path.trim();
                    }
                    if ($util$1.isString(theme.output.file)) {
                        file = theme.output.file.trim();
                    }
                }
                const filename = `${$util$1.trimString(path.trim(), '/')}/${$util$1.trimString(file.trim(), '/')}`;
                const storedFile = STORED.themes.get(filename) || new Map();
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
                const storedTheme = storedFile.get(theme.name);
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
        static addString(value, name = '', numberAlias = false) {
            if (value !== '') {
                if (name === '') {
                    name = value.trim();
                }
                const numeric = $util$1.isNumber(value);
                if (!numeric || numberAlias) {
                    for (const [resourceName, resourceValue] of STORED.strings.entries()) {
                        if (resourceValue === value) {
                            return resourceName;
                        }
                    }
                    const partial = $util$1.trimString(name.replace(/[^A-Za-z\d]+/g, '_'), '_').split(/_+/);
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
                    STORED.strings.set(name, escapeNonEntity(value));
                }
                return name;
            }
            return '';
        }
        static addImageSrc(element, prefix = '') {
            const images = {};
            if (element.srcset) {
                const srcset = element.srcset.trim();
                if (srcset !== '') {
                    const filepath = element.src.substring(0, element.src.lastIndexOf('/') + 1);
                    for (const value of srcset.split($util$1.REGEXP_COMPILED.SEPARATOR)) {
                        const match = /^(.+?)\s*(?:(\d*\.?\d*)x)?$/.exec(value.trim());
                        if (match) {
                            if (!$util$1.hasValue(match[2])) {
                                match[2] = '1';
                            }
                            const src = filepath + $util$1.fromLastIndexOf(match[1]);
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
            }
            if (images.mdpi === undefined) {
                images.mdpi = element.src;
            }
            return this.addImage(images, prefix);
        }
        static addImage(images, prefix = '') {
            let src = '';
            if (images.mdpi) {
                src = $util$1.fromLastIndexOf(images.mdpi);
                const format = $util$1.fromLastIndexOf(src, '.').toLowerCase();
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
        static addImageUrl(value, prefix = '') {
            value = $css.resolveURL(value) || $util$1.resolvePath(value);
            return value !== '' ? this.addImage({ mdpi: value }, prefix) : '';
        }
        static addColor(color, transparency = false) {
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
        get userSettings() {
            return this.application.userSettings;
        }
    }

    const $util$2 = squared.lib.util;
    function substitute(result, value, api, minApi = 0) {
        if (!api || api >= minApi) {
            result['attr'] = value;
            return true;
        }
        return false;
    }
    const API_ANDROID = {
        [28 /* PIE */]: {
            android: {},
            app: {},
            assign: {}
        },
        [27 /* OREO_1 */]: {
            android: {
                'accessibilityHeading': false,
                'accessibilityPaneTitle': false,
                'appComponentFactory': false,
                'buttonCornerRadius': false,
                'cantSaveState': false,
                'dialogCornerRadius': false,
                'fallbackLineSpacing': false,
                'firstBaselineToTopHeight': false,
                'fontVariationSettings': false,
                'lastBaselineToBottomHeight': false,
                'lineHeight': false,
                'maxLongVersionCode': false,
                'outlineAmbientShadowColor': false,
                'outlineSpotShadowColor': false,
                'screenReaderFocusable': false,
                'textFontWeight': false,
                'ttcIndex': false,
                'versionCodeMajor': false,
                'versionMajor': false,
                'widgetFeatures': false,
                'windowLayoutInDisplayCutoutMode': false
            },
            app: {},
            assign: {}
        },
        [26 /* OREO */]: {
            android: {
                'classLoader': false,
                'navigationBarDividerColor': false,
                'showWhenLocked': false,
                'turnScreenOn': false,
                'windowLightNavigationBar': false
            },
            app: {},
            assign: {}
        },
        [25 /* NOUGAT_1 */]: {
            android: {
                'fontWeight': false,
                'justificationMode': false,
                'layout_marginHorizontal': false,
                'layout_marginVertical': false,
                'paddingHorizontal': false,
                'paddingVertical': false
            },
            app: {},
            assign: {}
        },
        [24 /* NOUGAT */]: {
            android: {
                'colorSecondary': false,
                'contextDescription': false,
                'contextUri': false,
                'roundIcon': false,
                'shortcutDisabledMessage': false,
                'shortcutId': false,
                'shortcutLongLabel': false,
                'shortcutShortLabel': false,
                'showMetadataInPreview': false,
            },
            app: {},
            assign: {}
        },
        [23 /* MARSHMALLOW */]: {
            android: {
                'backupInForeground': false,
                'bitmap': false,
                'buttonGravity': false,
                'canControlMagnification': false,
                'canPerformGestures': false,
                'canRecord': false,
                'collapseIcon': false,
                'contentInsetEndWithActions': false,
                'contentInsetStartWithNavigation': false,
                'contextPopupMenuStyle': false,
                'countDown': false,
                'defaultHeight': false,
                'defaultToDeviceProtectedStorage': false,
                'defaultWidth': false,
                'directBootAware': false,
                'enableVrMode': false,
                'endX': false,
                'endY': false,
                'externalService': false,
                'fillType': false,
                'forceHasOverlappingRendering': false,
                'hotSpotX': false,
                'hotSpotY': false,
                'languageTag': false,
                'level': false,
                'listMenuViewStyle': false,
                'maxButtonHeight': false,
                'networkSecurityConfig': false,
                'numberPickerStyle': false,
                'offset': false,
                'pointerIcon': false,
                'popupEnterTransition': false,
                'popupExitTransition': false,
                'preferenceFragmentStyle': false,
                'resizeableActivity': false,
                'startX': false,
                'startY': false,
                'subMenuArrow': false,
                'supportsLocalInteraction': false,
                'supportsPictureInPicture': false,
                'textAppearancePopupMenuHeader': false,
                'tickMark': false,
                'tickMarkTint': false,
                'tickMarkTintMode': false,
                'titleMargin': false,
                'titleMarginBottom': false,
                'titleMarginEnd': false,
                'titleMarginStart': false,
                'titleMarginTop': false,
                'tunerCount': false,
                'use32bitAbi': false,
                'version': false,
                'windowBackgroundFallback': false
            },
            app: {},
            assign: {}
        },
        [22 /* LOLLIPOP_1 */]: {
            android: {
                'allowUndo': false,
                'autoVerify': false,
                'breakStrategy': false,
                'colorBackgroundFloating': false,
                'contextClickable': false,
                'drawableTint': false,
                'drawableTintMode': false,
                'end': (result) => substitute(result, 'right'),
                'extractNativeLibs': false,
                'fingerprintAuthDrawable': false,
                'fraction': false,
                'fullBackupContent': false,
                'hyphenationFrequency': false,
                'lockTaskMode': false,
                'logoDescription': false,
                'numbersInnerTextColor': false,
                'scrollIndicators': false,
                'showForAllUsers': false,
                'start': (result) => substitute(result, 'left'),
                'subtitleTextColor': false,
                'supportsAssist': false,
                'supportsLaunchVoiceAssistFromKeyguard': false,
                'thumbPosition': false,
                'titleTextColor': false,
                'trackTint': false,
                'trackTintMode': false,
                'usesCleartextTraffic': false,
                'windowLightStatusBar': false
            },
            app: {},
            assign: {}
        },
        [21 /* LOLLIPOP */]: {
            android: {
                'accessibilityTraversalAfter': false,
                'accessibilityTraversalBefore': false,
                'collapseContentDescription': false,
                'dialogPreferredPadding': false,
                'resizeClip': false,
                'revisionCode': false,
                'searchHintIcon': false
            },
            app: {},
            assign: {}
        },
        [20 /* KITKAT_1 */]: {
            android: {
                'actionBarPopupTheme': false,
                'actionBarTheme': false,
                'actionModeFindDrawable': false,
                'actionModeShareDrawable': false,
                'actionModeWebSearchDrawable': false,
                'actionOverflowMenuStyle': false,
                'amPmBackgroundColor': false,
                'amPmTextColor': false,
                'ambientShadowAlpha': false,
                'autoRemoveFromRecents': false,
                'backgroundTint': false,
                'backgroundTintMode': false,
                'banner': false,
                'buttonBarNegativeButtonStyle': false,
                'buttonBarNeutralButtonStyle': false,
                'buttonBarPositiveButtonStyle': false,
                'buttonTint': false,
                'buttonTintMode': false,
                'calendarTextColor': false,
                'checkMarkTint': false,
                'checkMarkTintMode': false,
                'closeIcon': false,
                'colorAccent': false,
                'colorButtonNormal': false,
                'colorControlActivated': false,
                'colorControlHighlight': false,
                'colorControlNormal': false,
                'colorEdgeEffect': false,
                'colorPrimary': false,
                'colorPrimaryDark': false,
                'commitIcon': false,
                'contentAgeHint': false,
                'contentInsetEnd': false,
                'contentInsetLeft': false,
                'contentInsetRight': false,
                'contentInsetStart': false,
                'controlX1': false,
                'controlX2': false,
                'controlY1': false,
                'controlY2': false,
                'country': false,
                'datePickerDialogTheme': false,
                'datePickerMode': false,
                'dayOfWeekBackground': false,
                'dayOfWeekTextAppearance': false,
                'documentLaunchMode': false,
                'elegantTextHeight': false,
                'elevation': false,
                'excludeClass': false,
                'excludeId': false,
                'excludeName': false,
                'fastScrollStyle': false,
                'fillAlpha': false,
                'fillColor': false,
                'fontFeatureSettings': false,
                'foregroundTint': false,
                'foregroundTintMode': false,
                'fragmentAllowEnterTransitionOverlap': false,
                'fragmentAllowReturnTransitionOverlap': false,
                'fragmentEnterTransition': false,
                'fragmentExitTransition': false,
                'fragmentReenterTransition': false,
                'fragmentReturnTransition': false,
                'fragmentSharedElementEnterTransition': false,
                'fragmentSharedElementReturnTransition': false,
                'fromId': false,
                'fullBackupOnly': false,
                'goIcon': false,
                'headerAmPmTextAppearance': false,
                'headerDayOfMonthTextAppearance': false,
                'headerMonthTextAppearance': false,
                'headerTimeTextAppearance': false,
                'headerYearTextAppearance': false,
                'hideOnContentScroll': false,
                'indeterminateTint': false,
                'indeterminateTintMode': false,
                'inset': false,
                'isGame': false,
                'launchTaskBehindSourceAnimation': false,
                'launchTaskBehindTargetAnimation': false,
                'layout_columnWeight': false,
                'layout_rowWeight': false,
                'letterSpacing': false,
                'matchOrder': false,
                'maxRecentsv': false,
                'maximumAngle': false,
                'minimumHorizontalAngle': false,
                'minimumVerticalAngle': false,
                'multiArch': false,
                'navigationBarColor': false,
                'navigationContentDescription': false,
                'navigationIcon': false,
                'nestedScrollingEnabled': false,
                'numbersBackgroundColor': false,
                'numbersSelectorColor': false,
                'numbersTextColor': false,
                'outlineProvider': false,
                'overlapAnchor': false,
                'paddingMode': false,
                'pathData': false,
                'patternPathData': false,
                'persistableMode': false,
                'popupElevation': false,
                'popupTheme': false,
                'progressBackgroundTint': false,
                'progressBackgroundTintMode': false,
                'progressTint': false,
                'progressTintMode': false,
                'propertyXName': false,
                'propertyYName': false,
                'queryBackground': false,
                'recognitionService': false,
                'relinquishTaskIdentity': false,
                'reparent': false,
                'reparentWithOverlay': false,
                'restrictionType': false,
                'resumeWhilePausing': false,
                'reversible': false,
                'searchIcon': false,
                'searchViewStyle': false,
                'secondaryProgressTint': false,
                'secondaryProgressTintMode': false,
                'selectableItemBackgroundBorderless': false,
                'sessionService': false,
                'setupActivity': false,
                'showText': false,
                'slideEdge': false,
                'splitTrack': false,
                'spotShadowAlpha': false,
                'src': (result, api, node) => {
                    if (node.svgElement) {
                        result['obj'] = 'app';
                        result['attr'] = 'srcCompat';
                    }
                    return true;
                },
                'stackViewStyle': false,
                'stateListAnimator': false,
                'statusBarColor': false,
                'strokeAlpha': false,
                'strokeColor': false,
                'strokeLineCap': false,
                'strokeLineJoin': false,
                'strokeMiterLimit': false,
                'strokeWidth': false,
                'submitBackground': false,
                'subtitleTextAppearance': false,
                'suggestionRowLayout': false,
                'switchStyle': false,
                'targetName': false,
                'textAppearanceListItemSecondary': false,
                'thumbTint': false,
                'thumbTintMode': false,
                'tileModeX': false,
                'tileModeY': false,
                'timePickerDialogTheme': false,
                'timePickerMode': false,
                'timePickerStyle': false,
                'tintMode': false,
                'titleTextAppearance': false,
                'toId': false,
                'toolbarStyle': false,
                'touchscreenBlocksFocus': false,
                'transitionGroup': false,
                'transitionName': false,
                'transitionVisibilityMode': false,
                'translateX': false,
                'translateY': false,
                'translationZ': false,
                'trimPathEnd': false,
                'trimPathOffset': false,
                'trimPathStart': false,
                'viewportHeight': false,
                'viewportWidth': false,
                'voiceIcon': false,
                'windowActivityTransitions': false,
                'windowAllowEnterTransitionOverlap': false,
                'windowAllowReturnTransitionOverlap': false,
                'windowClipToOutline': false,
                'windowContentTransitionManager': false,
                'windowContentTransitions': false,
                'windowDrawsSystemBarBackgrounds': false,
                'windowElevation': false,
                'windowEnterTransition': false,
                'windowExitTransition': false,
                'windowReenterTransition': false,
                'windowReturnTransition': false,
                'windowSharedElementEnterTransition': false,
                'windowSharedElementExitTransition': false,
                'windowSharedElementReenterTransition': false,
                'windowSharedElementReturnTransition': false,
                'windowSharedElementsUseOverlay': false,
                'windowTransitionBackgroundFadeDuration': false,
                'yearListItemTextAppearance': false,
                'yearListSelectorColor': false
            },
            app: {},
            assign: {}
        },
        [19 /* KITKAT */]: {
            android: {
                'allowEmbedded': false,
                'windowSwipeToDismiss': false
            },
            app: {},
            assign: {}
        },
        [18 /* JELLYBEAN_2 */]: {
            android: {
                'accessibilityLiveRegion': false,
                'addPrintersActivity': false,
                'advancedPrintOptionsActivity': false,
                'apduServiceBanner': false,
                'autoMirrored': false,
                'category': false,
                'fadingMode': false,
                'fromScene': false,
                'isAsciiCapable': false,
                'keySet': false,
                'requireDeviceUnlock': false,
                'ssp': false,
                'sspPattern': false,
                'sspPrefix': false,
                'startDelay': false,
                'supportsSwitchingToNextInputMethod': false,
                'targetId': false,
                'toScene': false,
                'transition': false,
                'transitionOrdering': false,
                'vendor': false,
                'windowTranslucentNavigation': false,
                'windowTranslucentStatus': false
            },
            app: {},
            assign: {}
        },
        [17 /* JELLYBEAN_1 */]: {
            android: {
                'canRequestEnhancedWebAccessibility': (result, api) => api < 26 /* OREO */,
                'canRequestFilterKeyEvents': false,
                'canRequestTouchExplorationMode': false,
                'childIndicatorEnd': false,
                'childIndicatorStart': false,
                'indicatorEnd': false,
                'indicatorStart': false,
                'layoutMode': false,
                'mipMap': false,
                'mirrorForRtl': false,
                'requiredAccountType': false,
                'requiredForAllUsers': false,
                'restrictedAccountType': false,
                'windowOverscan': false
            },
            app: {},
            assign: {}
        },
        [16 /* JELLYBEAN */]: {
            android: {
                'checkedTextViewStyle': false,
                'format12Hour': false,
                'format24Hour': false,
                'initialKeyguardLayout': false,
                'labelFor': false,
                'layoutDirection': false,
                'layout_alignEnd': (result) => substitute(result, 'layout_alignRight'),
                'layout_alignParentEnd': (result) => substitute(result, 'layout_alignParentRight'),
                'layout_alignParentStart': (result) => substitute(result, 'layout_alignParentLeft'),
                'layout_alignStart': (result) => substitute(result, 'layout_alignLeft'),
                'layout_marginEnd': (result) => substitute(result, 'layout_marginRight'),
                'layout_marginStart': (result) => substitute(result, 'layout_marginLeft'),
                'layout_toEndOf': (result) => substitute(result, 'layout_toRightOf'),
                'layout_toStartOf': (result) => substitute(result, 'layout_toLeftOf'),
                'listPreferredItemPaddingEnd': (result) => substitute(result, 'listPreferredItemPaddingRight'),
                'listPreferredItemPaddingStart': (result) => substitute(result, 'listPreferredItemPaddingLeft'),
                'paddingEnd': (result) => substitute(result, 'paddingRight'),
                'paddingStart': (result) => substitute(result, 'paddingLeft'),
                'permissionFlags': false,
                'permissionGroupFlags': false,
                'presentationTheme': false,
                'showOnLockScreen': false,
                'singleUser': false,
                'subtypeId': false,
                'supportsRtl': false,
                'textAlignment': false,
                'textDirection': false,
                'timeZone': false,
                'widgetCategory': false
            },
            app: {},
            assign: {}
        },
        [15 /* ICE_CREAM_SANDWICH_1 */]: {
            android: {
                'fontFamily': false,
                'importantForAccessibility': false,
                'isolatedProcess': false,
                'keyboardLayout': false,
                'mediaRouteButtonStyle': false,
                'mediaRouteTypes': false,
                'parentActivityName': false
            },
            app: {},
            assign: {}
        },
        [14 /* ICE_CREAM_SANDWICH */]: {
            android: {},
            app: {},
            assign: {}
        },
        [0 /* ALL */]: {
            android: {},
            app: {},
            assign: {
                Button: {
                    android: {
                        'textAllCaps': 'false'
                    }
                }
            }
        }
    };
    const DEPRECATED_ANDROID = {
        android: {
            'amPmBackgroundColor': (result, api) => substitute(result, 'headerBackground', api, 23 /* MARSHMALLOW */),
            'amPmTextColor': (result, api) => substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            'animationResolution': (result, api) => api < 16 /* JELLYBEAN */,
            'canRequestEnhancedWebAccessibility': (result, api) => api < 26 /* OREO */,
            'dayOfWeekBackground': (result, api) => api < 23 /* MARSHMALLOW */,
            'dayOfWeekTextAppearance': (result, api) => api < 23 /* MARSHMALLOW */,
            'directionDescriptions': (result, api) => api < 23 /* MARSHMALLOW */,
            'headerAmPmTextAppearance': (result, api) => substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            'headerDayOfMonthTextAppearance': (result, api) => substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            'headerMonthTextAppearance': (result, api) => substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            'headerTimeTextAppearance': (result, api) => substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            'headerYearTextAppearance': (result, api) => substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            'showOnLockScreen': (result, api) => substitute(result, 'showForAllUsers', api, 23 /* MARSHMALLOW */),
            'targetDescriptions': (result, api) => api < 23 /* MARSHMALLOW */,
            'yearListItemTextAppearance': (result, api) => substitute(result, 'yearListTextColor', api, 23 /* MARSHMALLOW */),
            'yearListSelectorColor': (result, api) => api < 23 /* MARSHMALLOW */
        }
    };
    function getValue(api, tagName, obj, attr) {
        for (const build of [API_ANDROID[api], API_ANDROID[0]]) {
            const value = $util$2.optionalAsString(build, `assign.${tagName}.${obj}.${attr}`);
            if ($util$2.isString(value)) {
                return value;
            }
        }
        return '';
    }

    var customization = /*#__PURE__*/Object.freeze({
        API_ANDROID: API_ANDROID,
        DEPRECATED_ANDROID: DEPRECATED_ANDROID,
        getValue: getValue
    });

    var $NodeList = squared.base.NodeList;
    var $Resource$1 = squared.base.Resource;
    const $enum = squared.base.lib.enumeration;
    const $css$1 = squared.lib.css;
    const $dom = squared.lib.dom;
    const $util$3 = squared.lib.util;
    const REGEXP_DATASETATTR = /^attr[A-Z]/;
    const REGEXP_FORMATTED = /^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/;
    const REGEXP_VALIDSTRING = /[^\w$\-_.]/g;
    function checkTextAlign(value) {
        switch (value) {
            case 'justify':
            case 'initial':
            case 'inherit':
                return '';
            case 'center':
                return 'center_horizontal';
            default:
                return value;
        }
    }
    function isSingleFrame(node) {
        return node.documentRoot && node.layoutFrame && node.length === 1 && node.has('maxWidth');
    }
    function setAutoMargin(node) {
        if (!node.blockWidth) {
            const alignment = [];
            if (node.autoMargin.leftRight) {
                if (isSingleFrame(node)) {
                    node.renderChildren[0].mergeGravity('layout_gravity', 'center_horizontal');
                }
                else {
                    alignment.push('center_horizontal');
                }
            }
            else if (node.autoMargin.left) {
                if (isSingleFrame(node)) {
                    node.renderChildren[0].mergeGravity('layout_gravity', 'right');
                }
                else {
                    alignment.push('right');
                }
            }
            else if (node.autoMargin.right) {
                alignment.push('left');
            }
            if (node.autoMargin.topBottom) {
                alignment.push('center_vertical');
            }
            else if (node.autoMargin.top) {
                alignment.push('bottom');
            }
            else if (node.autoMargin.bottom) {
                alignment.push('top');
            }
            if (alignment.length) {
                const attr = node.blockWidth || !node.pageFlow ? 'gravity' : 'layout_gravity';
                for (const value of alignment) {
                    node.mergeGravity(attr, value);
                }
                return true;
            }
        }
        return false;
    }
    function validateString(value) {
        return value ? value.trim().replace(REGEXP_VALIDSTRING, '_') : '';
    }
    function calculateBias(start, end, accuracy = 4) {
        if (start === 0) {
            return 0;
        }
        else if (end === 0) {
            return 1;
        }
        else {
            return parseFloat(Math.max(start / (start + end), 0).toPrecision(accuracy));
        }
    }
    var View$MX = (Base) => {
        return class View extends Base {
            constructor(id = 0, element, afterInit) {
                super(id, element);
                this.renderChildren = [];
                this.constraint = {
                    horizontal: false,
                    vertical: false,
                    current: {}
                };
                this._namespaces = new Set(['android', 'app']);
                this._controlName = '';
                this._fontSize = 0;
                this._boxAdjustment = $dom.newBoxModel();
                this._boxReset = $dom.newBoxModel();
                this._containerType = 0;
                this._localSettings = {
                    targetAPI: 28 /* LATEST */,
                    supportRTL: false,
                    floatPrecision: 3
                };
                this.__android = {};
                this.__app = {};
                if (afterInit) {
                    afterInit(this);
                }
            }
            static documentBody() {
                if (View._documentBody === undefined) {
                    const body = new View(0, document.body);
                    body.hide();
                    body.setBounds();
                    View._documentBody = body;
                }
                return View._documentBody;
            }
            static getControlName(containerType) {
                return CONTAINER_ANDROID[CONTAINER_NODE[containerType]];
            }
            attr(obj, attr, value = '', overwrite = true) {
                const result = {};
                if (!this.supported(obj, attr, result)) {
                    return '';
                }
                if (Object.keys(result).length) {
                    if ($util$3.isString(result['obj'])) {
                        obj = result['obj'];
                    }
                    if ($util$3.isString(result['attr'])) {
                        attr = result['attr'];
                    }
                    if ($util$3.isString(result['value'])) {
                        value = result['value'];
                    }
                    if (typeof result['overwrite'] === 'boolean') {
                        overwrite = result['overwrite'];
                    }
                }
                return super.attr(obj, attr, value, overwrite);
            }
            android(attr, value = '', overwrite = true) {
                this.attr('android', attr, value, overwrite);
                return this.__android[attr] || '';
            }
            app(attr, value = '', overwrite = true) {
                this.attr('app', attr, value, overwrite);
                return this.__app[attr] || '';
            }
            apply(options) {
                const data = Object.assign({}, options);
                super.apply(data);
                for (const obj in data) {
                    this.formatted(`${obj}="${data[obj]}"`);
                }
            }
            formatted(value, overwrite = true) {
                const match = value.match(REGEXP_FORMATTED);
                if (match) {
                    this.attr(match[1] || '_', match[2], match[3], overwrite);
                }
            }
            anchor(position, documentId = '', overwrite) {
                const renderParent = this.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        if (documentId === undefined || this.constraint.current[position] === undefined || overwrite) {
                            if (documentId && overwrite === undefined) {
                                overwrite = documentId === 'parent';
                            }
                            const attr = LAYOUT_ANDROID.constraint[position];
                            if (attr) {
                                this.app(this.localizeString(attr), documentId, overwrite);
                                if (documentId === 'parent') {
                                    switch (position) {
                                        case 'left':
                                        case 'right':
                                            this.constraint.horizontal = true;
                                            break;
                                        case 'top':
                                        case 'bottom':
                                        case 'baseline':
                                            this.constraint.vertical = true;
                                            break;
                                    }
                                }
                                this.constraint.current[position] = {
                                    documentId,
                                    horizontal: $util$3.firstIndexOf(position.toLowerCase(), 'left', 'right') !== -1
                                };
                                return true;
                            }
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        if (documentId && overwrite === undefined) {
                            overwrite = documentId === 'true';
                        }
                        const attr = LAYOUT_ANDROID[documentId === 'true' ? 'relativeParent' : 'relative'][position];
                        this.android(this.localizeString(attr), documentId, overwrite);
                        return true;
                    }
                }
                return false;
            }
            anchorParent(orientation, overwrite = false, constraintBias = false) {
                const renderParent = this.renderParent;
                if (renderParent) {
                    const horizontal = orientation === AXIS_ANDROID.HORIZONTAL;
                    if (renderParent.layoutConstraint) {
                        if (overwrite || !this.constraint[orientation]) {
                            this.anchor(horizontal ? 'left' : 'top', 'parent');
                            this.anchor(horizontal ? 'right' : 'bottom', 'parent');
                            this.constraint[orientation] = true;
                            if (constraintBias) {
                                this.app(`layout_constraint${$util$3.capitalize(orientation)}_bias`, this[`${orientation}Bias`]);
                            }
                            return true;
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        this.anchor(horizontal ? 'left' : 'top', 'true');
                        this.anchor(horizontal ? 'right' : 'bottom', 'true');
                        return true;
                    }
                }
                return false;
            }
            anchorDelete(...position) {
                const renderParent = this.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        this.delete('app', ...$util$3.replaceMap(position, value => this.localizeString(LAYOUT_ANDROID.constraint[value])));
                    }
                    else if (renderParent.layoutRelative) {
                        for (const value of position) {
                            if (this.alignSibling(value) !== '') {
                                this.delete('android', LAYOUT_ANDROID.relative[value], this.localizeString(LAYOUT_ANDROID.relative[value]));
                            }
                            else if (LAYOUT_ANDROID.relativeParent[value]) {
                                this.delete('android', this.localizeString(LAYOUT_ANDROID.relativeParent[value]));
                            }
                        }
                    }
                }
            }
            anchorClear() {
                const renderParent = this.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        this.anchorDelete(...Object.keys(LAYOUT_ANDROID.constraint));
                    }
                    else if (renderParent.layoutRelative) {
                        this.anchorDelete(...Object.keys(LAYOUT_ANDROID.relativeParent));
                        this.anchorDelete(...Object.keys(LAYOUT_ANDROID.relative));
                    }
                }
            }
            alignParent(position) {
                const renderParent = this.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        const attr = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            return this.app(this.localizeString(attr)) === 'parent' || this.app(attr) === 'parent';
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr = LAYOUT_ANDROID.relativeParent[position];
                        if (attr) {
                            return this.android(this.localizeString(attr)) === 'true' || this.android(attr) === 'true';
                        }
                    }
                }
                return false;
            }
            alignSibling(position, documentId) {
                const renderParent = this.renderParent;
                if (renderParent) {
                    if (documentId) {
                        if (renderParent.layoutConstraint) {
                            const attr = LAYOUT_ANDROID.constraint[position];
                            if (attr) {
                                this.app(this.localizeString(attr), documentId);
                            }
                        }
                        else if (renderParent.layoutRelative) {
                            const attr = LAYOUT_ANDROID.relative[position];
                            if (attr) {
                                this.android(this.localizeString(attr), documentId);
                            }
                        }
                    }
                    else {
                        if (renderParent.layoutConstraint) {
                            const attr = LAYOUT_ANDROID.constraint[position];
                            if (attr) {
                                const value = this.app(this.localizeString(attr)) || this.app(attr);
                                return value !== 'parent' && value !== renderParent.documentId ? value : '';
                            }
                        }
                        else if (renderParent.layoutRelative) {
                            const attr = LAYOUT_ANDROID.relative[position];
                            if (attr) {
                                return this.android(this.localizeString(attr)) || this.android(attr);
                            }
                        }
                    }
                }
                return '';
            }
            horizontalBias() {
                const parent = this.documentParent;
                if (parent !== this) {
                    const left = Math.max(0, this.linear.left - parent.box.left);
                    const right = Math.max(0, parent.box.right - this.linear.right);
                    return calculateBias(left, right, this.localSettings.floatPrecision);
                }
                return 0.5;
            }
            verticalBias() {
                const parent = this.documentParent;
                if (parent !== this) {
                    const top = Math.max(0, this.linear.top - parent.box.top);
                    const bottom = Math.max(0, parent.box.bottom - this.linear.bottom);
                    return calculateBias(top, bottom, this.localSettings.floatPrecision);
                }
                return 0.5;
            }
            supported(obj, attr, result = {}) {
                if (this.localSettings.targetAPI < 28 /* LATEST */) {
                    const deprecated = DEPRECATED_ANDROID[obj];
                    if (deprecated && typeof deprecated[attr] === 'function') {
                        const valid = deprecated[attr](result, this.localSettings.targetAPI, this);
                        if (!valid || Object.keys(result).length) {
                            return valid;
                        }
                    }
                    for (let i = this.localSettings.targetAPI; i <= 28 /* LATEST */; i++) {
                        const version = API_ANDROID[i];
                        if (version && version[obj] && version[obj][attr] !== undefined) {
                            const callback = version[obj][attr];
                            if (typeof callback === 'boolean') {
                                return callback;
                            }
                            else if (typeof callback === 'function') {
                                return callback(result, this.localSettings.targetAPI, this);
                            }
                        }
                    }
                }
                return true;
            }
            combine(...objs) {
                const result = [];
                for (const value of this._namespaces) {
                    const obj = this[`__${value}`];
                    if (objs.length === 0 || objs.includes(value)) {
                        for (const attr in obj) {
                            result.push((value !== '_' ? `${value}:` : '') + `${attr}="${obj[attr]}"`);
                        }
                    }
                }
                return result.sort((a, b) => a > b || b.startsWith('android:id=') ? 1 : -1);
            }
            localizeString(value) {
                if (this.hasProcedure($enum.NODE_PROCEDURE.LOCALIZATION)) {
                    return replaceRTL(value, this.localSettings.supportRTL, this.localSettings.targetAPI);
                }
                return value;
            }
            hide(invisible) {
                if (invisible) {
                    this.android('visibility', 'invisible');
                }
                else {
                    super.hide();
                }
            }
            clone(id, attributes = false, position = false) {
                const node = new View(id || this.id, this.element);
                Object.assign(node.localSettings, this.localSettings);
                node.tagName = this.tagName;
                if (id !== undefined) {
                    node.setControlType(this.controlName, this.containerType);
                }
                else {
                    node.controlId = this.controlId;
                    node.controlName = this.controlName;
                    node.containerType = this.containerType;
                }
                node.alignmentType = this.alignmentType;
                node.depth = this.depth;
                node.visible = this.visible;
                node.excluded = this.excluded;
                node.rendered = this.rendered;
                node.renderParent = this.renderParent;
                node.documentParent = this.documentParent;
                node.documentRoot = this.documentRoot;
                if (this.length) {
                    node.retain(this.duplicate());
                }
                if (attributes) {
                    Object.assign(node.unsafe('boxReset'), this._boxReset);
                    Object.assign(node.unsafe('boxAdjustment'), this._boxAdjustment);
                    for (const value of this._namespaces) {
                        const obj = this[`__${value}`];
                        for (const attr in obj) {
                            if (value === 'android' && attr === 'id') {
                                node.attr(value, attr, node.documentId);
                            }
                            else {
                                node.attr(value, attr, obj[attr]);
                            }
                        }
                    }
                }
                if (position) {
                    node.anchorClear();
                    if (node.anchor('left', this.documentId)) {
                        Object.assign(node.unsafe('boxReset'), { marginLeft: 1 });
                        Object.assign(node.unsafe('boxAdjustment'), { marginLeft: 0 });
                    }
                    if (node.anchor('top', this.documentId)) {
                        Object.assign(node.unsafe('boxReset'), { marginTop: 1 });
                        Object.assign(node.unsafe('boxAdjustment'), { marginTop: 0 });
                    }
                }
                node.inherit(this, 'initial', 'base', 'alignment', 'styleMap');
                Object.assign(node.unsafe('cached'), this.unsafe('cached'));
                return node;
            }
            setControlType(controlName, containerType) {
                this.controlName = controlName;
                this.containerType = containerType || CONTAINER_NODE.UNKNOWN;
                this.controlId = stripId(this.android('id'));
                if (this.controlId === '') {
                    let name;
                    if (this.naturalElement) {
                        const inputName = this.element.name;
                        name = validateString(this.elementId || (typeof inputName === 'string' ? inputName : ''));
                        if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                            name = `_${name}`;
                        }
                    }
                    this.controlId = $util$3.convertWord($Resource$1.generateId('android', name || $util$3.fromLastIndexOf(this.controlName, '.').toLowerCase(), name ? 0 : 1));
                    this.android('id', this.documentId);
                }
            }
            setLayout() {
                const renderParent = this.renderParent;
                if (renderParent) {
                    const renderChildren = this.renderChildren;
                    const parent = this.groupParent ? $NodeList.actualParent(renderChildren) : this.absoluteParent;
                    let hasWidth = true;
                    let hasHeight = true;
                    this.setVisibility();
                    if (this.documentBody) {
                        if (!this.hasWidth && renderChildren.some(node => node.alignParent('right')) || this.visibleStyle.backgroundColor || this.borderRightWidth > 0) {
                            this.android('layout_width', 'match_parent', false);
                        }
                        if (!this.hasHeight && renderChildren.some(node => node.alignParent('bottom')) || this.visibleStyle.backgroundColor || this.borderBottomWidth > 0) {
                            this.android('layout_height', 'match_parent', false);
                        }
                    }
                    if (this.android('layout_height') === '') {
                        if (!this.inlineStatic && this.has('height') || this.toInt('height') > 0 && !this.cssInitial('height')) {
                            const height = this.css('height');
                            let value = -1;
                            if ($util$3.isLength(height)) {
                                value = this.parseUnit(height, false);
                                if (this.positionStatic && !this.layoutFrame && this.documentParent.css('overflow') !== 'hidden') {
                                    const heightParent = $util$3.convertInt(renderParent.android('layout_height'));
                                    if (heightParent > 0 && value >= heightParent) {
                                        if (this.singleChild) {
                                            renderParent.android('layout_height', 'wrap_content');
                                        }
                                        else {
                                            this.android('layout_height', 'match_parent');
                                            value = -1;
                                        }
                                    }
                                }
                            }
                            else if ($util$3.isPercent(height)) {
                                if (height === '100%') {
                                    this.android('layout_height', 'match_parent');
                                }
                                else if (this.documentParent.has('height')) {
                                    value = Math.ceil(this.bounds.height) - this.contentBoxHeight;
                                }
                                else {
                                    hasHeight = false;
                                }
                            }
                            if (value !== -1) {
                                if (this.display.startsWith('table') && value < Math.floor(this.bounds.height)) {
                                    if (!this.has('minHeight')) {
                                        this.android('minHeight', $util$3.formatPX(value));
                                    }
                                    this.android('layout_height', 'wrap_content');
                                }
                                else {
                                    this.android('layout_height', $util$3.formatPX(value));
                                }
                            }
                        }
                        else {
                            hasHeight = false;
                        }
                    }
                    if (this.android('layout_width') === '') {
                        if (!this.inlineStatic && this.has('width') || this.toInt('width') > 0 && !this.cssInitial('width')) {
                            const width = this.css('width');
                            let value = -1;
                            if ($util$3.isLength(width)) {
                                value = this.parseUnit(width);
                                if (this.positionStatic && !this.layoutFrame && this.documentParent.css('overflow') !== 'hidden') {
                                    const widthParent = $util$3.convertInt(renderParent.android('layout_width'));
                                    if (widthParent > 0 && value >= widthParent) {
                                        if (this.singleChild) {
                                            renderParent.android('layout_width', 'wrap_content');
                                        }
                                        else {
                                            this.android('layout_width', 'match_parent');
                                            value = -1;
                                        }
                                    }
                                }
                            }
                            else if ($util$3.isPercent(width)) {
                                if (renderParent.is(CONTAINER_NODE.GRID)) {
                                    this.android('layout_width', '0px', false);
                                    this.android('layout_columnWeight', (parseInt(width) / 100).toPrecision(this.localSettings.floatPrecision), false);
                                }
                                else if (width === '100%') {
                                    this.android('layout_width', 'match_parent');
                                }
                                else {
                                    value = this.parseUnit(width);
                                }
                            }
                            else {
                                hasWidth = false;
                            }
                            if (value !== -1) {
                                if (this.display.startsWith('table') && value < Math.floor(this.bounds.width)) {
                                    if (!this.has('minWidth')) {
                                        this.android('minWidth', $util$3.formatPX(value));
                                    }
                                    this.android('layout_width', 'wrap_content');
                                }
                                else {
                                    this.android('layout_width', $util$3.formatPX(value));
                                }
                            }
                        }
                        else {
                            hasWidth = false;
                        }
                    }
                    if (!hasWidth && parent) {
                        const blockStatic = this.blockStatic && (this.htmlElement || this.svgElement) && (!this.has('maxWidth') || this.some(node => node.blockStatic));
                        if (this.plainText) {
                            if (this.multiline && renderParent.layoutFrame && renderParent.renderChildren.length > 1 && renderParent.ascend(true).some(node => !node.inlineStatic && node.has('width'))) {
                                let width = renderParent.actualWidth;
                                renderParent.renderEach(node => {
                                    if (node !== this) {
                                        width -= node.actualWidth;
                                    }
                                });
                                if (width > 0) {
                                    this.android('maxWidth', $util$3.formatPX(width));
                                }
                            }
                            this.android('layout_width', this.actualWidth > renderParent.box.width && this.multiline && this.alignParent('left') ? 'match_parent' : 'wrap_content', false);
                            hasWidth = true;
                        }
                        else {
                            let inlineVertical = 0;
                            let blockVertical = 0;
                            let boxHorizotnal = 0;
                            if (this.groupParent) {
                                for (const node of renderChildren) {
                                    if (node.inlineVertical) {
                                        inlineVertical++;
                                    }
                                    if (node.blockStatic) {
                                        blockVertical++;
                                    }
                                    if (!node.plainText && !node.multiline && node.linear.width >= this.documentParent.box.width) {
                                        boxHorizotnal++;
                                    }
                                }
                            }
                            if (!this.pageFlow ||
                                this.inputElement ||
                                renderParent.is(CONTAINER_NODE.GRID) ||
                                this.groupParent && inlineVertical === renderChildren.length ||
                                this.tableElement || parent.gridElement || parent.flexElement) {
                                this.android('layout_width', 'wrap_content', false);
                                hasWidth = true;
                            }
                            else if (blockStatic && (this.linear.width >= parent.box.width ||
                                this.visibleStyle.background ||
                                this.layoutVertical && !this.autoMargin.horizontal ||
                                this.documentBody ||
                                this.gridElement ||
                                this.flexElement ||
                                parent.documentBody ||
                                parent.has('width', 32 /* PERCENT */) ||
                                parent.blockStatic && (this.singleChild || this.alignedVertically(this.previousSiblings()) ||
                                    !this.documentRoot && renderChildren.some(node => node.layoutVertical && !node.autoMargin.horizontal && !node.hasWidth && !node.floating))) ||
                                this.groupParent && (boxHorizotnal > 0 || this.layoutVertical && blockVertical > 0) ||
                                this.layoutFrame && (this.hasAlign(256 /* COLUMN */) || $NodeList.linearData(renderChildren, true).floated.size === 2 || renderChildren.some(node => node.blockStatic && (node.autoMargin.leftRight || node.rightAligned)))) {
                                this.android('layout_width', 'match_parent', false);
                                hasWidth = true;
                            }
                        }
                    }
                    if (this.has('minWidth') && !this.constraint.minWidth) {
                        this.android('minWidth', this.convertPX(this.css('minWidth')), false);
                        this.android('layout_width', 'wrap_content', false);
                    }
                    else if (!hasWidth) {
                        this.android('layout_width', 'wrap_content', false);
                    }
                    if (this.has('minHeight') && !this.constraint.minHeight) {
                        this.android('minHeight', this.convertPX(this.css('minHeight'), false), false);
                        this.android('layout_height', 'wrap_content', false);
                    }
                    else if (!hasHeight) {
                        this.android('layout_height', 'wrap_content', false);
                    }
                    if (this.layoutFrame && this.hasAlign(64 /* FLOAT */) && this.length > 1 && this.ascend(true).some(node => node.has('width'))) {
                        this.each(node => {
                            const target = node.innerChild || node;
                            if (target.element && !target.has('width')) {
                                node.css('width', $util$3.formatPX(node.bounds.width));
                            }
                        });
                    }
                }
            }
            setAlignment() {
                const renderParent = this.renderParent;
                if (renderParent) {
                    const alignFloat = this.hasAlign(64 /* FLOAT */);
                    const node = (this.outerParent || this);
                    const outerRenderParent = (node.renderParent || renderParent);
                    let textAlign = checkTextAlign(this.cssInitial('textAlign', true));
                    let textAlignParent = checkTextAlign(this.cssAscend('textAlign'));
                    if (textAlign === '' && this.groupParent && !alignFloat) {
                        const actualParent = $NodeList.actualParent(this.renderChildren);
                        if (actualParent) {
                            textAlign = checkTextAlign(actualParent.cssInitial('textAlign', true));
                        }
                    }
                    if (this.pageFlow) {
                        let floating = '';
                        if (this.inlineVertical && (outerRenderParent.layoutHorizontal && !outerRenderParent.support.container.positionRelative || outerRenderParent.is(CONTAINER_NODE.GRID))) {
                            let gravity;
                            let target;
                            if (this.display === 'table-cell') {
                                gravity = 'gravity';
                                target = this;
                            }
                            else {
                                gravity = 'layout_gravity';
                                target = node;
                            }
                            switch (this.cssInitial('verticalAlign', true)) {
                                case 'top':
                                    target.mergeGravity(gravity, 'top');
                                    break;
                                case 'middle':
                                    target.mergeGravity(gravity, 'center_vertical');
                                    break;
                                case 'bottom':
                                    target.mergeGravity(gravity, 'bottom');
                                    break;
                            }
                        }
                        if (!this.blockWidth && (outerRenderParent.layoutVertical || this.documentRoot && (this.layoutVertical || this.layoutFrame))) {
                            if (this.floating) {
                                node.mergeGravity('layout_gravity', this.float);
                            }
                            else if (!setAutoMargin(node)) {
                                if (textAlign !== '' && this.hasWidth && !this.blockStatic) {
                                    node.mergeGravity('layout_gravity', textAlign, false);
                                }
                            }
                        }
                        if (alignFloat) {
                            if (this.hasAlign(512 /* RIGHT */) || this.renderChildren.length && this.renderChildren.every(item => item.rightAligned)) {
                                floating = 'right';
                            }
                            else if (this.groupParent && !this.renderChildren.some(item => item.float === 'right')) {
                                floating = 'left';
                            }
                        }
                        if (renderParent.layoutFrame && this.innerChild === undefined) {
                            if (!setAutoMargin(node)) {
                                floating = this.floating ? this.float : floating;
                                if (floating !== '' && (renderParent.inlineWidth || this.singleChild && !renderParent.documentRoot)) {
                                    renderParent.mergeGravity('layout_gravity', floating);
                                }
                            }
                            if (renderParent.display === 'table-cell' && this.singleChild) {
                                let gravity;
                                switch (renderParent.css('verticalAlign')) {
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
                                node.mergeGravity('layout_gravity', gravity);
                            }
                        }
                        if (floating !== '') {
                            if (this.blockWidth) {
                                if (textAlign === '' || floating === 'right') {
                                    textAlign = floating;
                                }
                            }
                            else {
                                node.mergeGravity('layout_gravity', floating);
                            }
                        }
                        else if (setAutoMargin(this) && textAlign !== '') {
                            textAlignParent = '';
                        }
                    }
                    if (textAlign === '' && textAlignParent !== '') {
                        switch (textAlignParent) {
                            case 'left':
                            case 'start':
                                break;
                            default:
                                if (outerRenderParent.layoutFrame) {
                                    if (this.pageFlow && !alignFloat) {
                                        node.mergeGravity('layout_gravity', textAlignParent, false);
                                    }
                                }
                                else if (this.blockStatic && !this.floating && !this.autoMargin.horizontal) {
                                    node.mergeGravity('layout_gravity', 'left', false);
                                }
                                textAlign = textAlignParent;
                                break;
                        }
                    }
                    if (textAlign !== '' && !(this.layoutFrame || this.layoutConstraint || !this.textElement && this.length === 0)) {
                        this.mergeGravity('gravity', textAlign);
                    }
                }
            }
            mergeGravity(attr, alignment, overwrite = true) {
                const direction = new Set();
                const stored = this.android(attr);
                if (stored !== '') {
                    for (const value of stored.split('|')) {
                        direction.add(value);
                    }
                }
                direction.add(this.localizeString(alignment));
                let result = '';
                switch (direction.size) {
                    case 0:
                        break;
                    case 1:
                        result = checkTextAlign(direction.values().next().value);
                    default:
                        let x = '';
                        let y = '';
                        let z = '';
                        for (const value of ['center', 'fill']) {
                            const horizontal = `${value}_horizontal`;
                            const vertical = `${value}_vertical`;
                            if (direction.has(value) || direction.has(horizontal) && direction.has(vertical)) {
                                direction.delete(horizontal);
                                direction.delete(vertical);
                                direction.add(value);
                            }
                        }
                        for (const value of direction.values()) {
                            switch (value) {
                                case 'justify':
                                case 'initial':
                                case 'inherit':
                                    continue;
                                case 'left':
                                case 'start':
                                case 'right':
                                case 'end':
                                case 'center_horizontal':
                                    if (x === '' || overwrite) {
                                        x = value;
                                    }
                                    break;
                                case 'top':
                                case 'bottom':
                                case 'center_vertical':
                                    if (y === '' || overwrite) {
                                        y = value;
                                    }
                                    break;
                                default:
                                    z += (z !== '' ? '|' : '') + value;
                                    break;
                            }
                        }
                        result = x !== '' && y !== '' ? `${x}|${y}` : x || y;
                        if (z !== '') {
                            result += (result !== '' ? '|' : '') + z;
                        }
                }
                if (result !== '') {
                    return this.android(attr, result);
                }
                else {
                    this.delete('android', attr);
                    return '';
                }
            }
            applyOptimizations() {
                if (this.renderParent) {
                    this.autoSizeBoxModel();
                    this.alignHorizontalLayout();
                    this.setLineHeight();
                }
            }
            applyCustomizations(overwrite = true) {
                const setCustomization = (build, tagName) => {
                    const assign = build.assign[tagName];
                    if (assign) {
                        for (const obj in assign) {
                            for (const attr in assign[obj]) {
                                this.attr(obj, attr, assign[obj][attr], overwrite);
                            }
                        }
                    }
                };
                setCustomization(API_ANDROID[0], this.tagName);
                setCustomization(API_ANDROID[0], this.controlName);
                const targetBuild = API_ANDROID[this.localSettings.targetAPI];
                if (targetBuild) {
                    setCustomization(targetBuild, this.tagName);
                    setCustomization(targetBuild, this.controlName);
                }
            }
            setBoxSpacing() {
                const supported = this.localSettings.targetAPI >= 26 /* OREO */;
                const setBoxModel = (attrs, prefix, mergeable = true) => {
                    const [top, right, bottom, left] = attrs;
                    const boxModel = {};
                    let mergeAll = 0;
                    let mergeHorizontal = 0;
                    let mergeVertical = 0;
                    for (const attr of attrs) {
                        boxModel[attr] = this._boxAdjustment[attr];
                        if (this._boxReset[attr] === 0) {
                            let value = this[attr];
                            if (value !== 0) {
                                if (attr === 'marginRight' && this.inline) {
                                    const boxRight = this.documentParent.box.right;
                                    if (Math.floor(this.bounds.right) > boxRight) {
                                        if (this.textElement && !this.multiline) {
                                            this.android('singleLine', 'true');
                                        }
                                        continue;
                                    }
                                    else if (this.bounds.right + value > boxRight) {
                                        value = Math.max(0, boxRight - this.bounds.right);
                                    }
                                }
                                boxModel[attr] += value;
                            }
                        }
                    }
                    if (supported && mergeable) {
                        if (boxModel[top] === boxModel[right] && boxModel[right] === boxModel[bottom] && boxModel[bottom] === boxModel[left]) {
                            mergeAll = boxModel[top];
                        }
                        else {
                            if (boxModel[left] === boxModel[right]) {
                                mergeHorizontal = boxModel[left];
                            }
                            if (boxModel[top] === boxModel[bottom]) {
                                mergeVertical = boxModel[top];
                            }
                        }
                    }
                    if (mergeAll !== 0) {
                        this.android(prefix, $util$3.formatPX(mergeAll));
                    }
                    else {
                        if (mergeHorizontal !== 0) {
                            this.android(`${prefix}Horizontal`, $util$3.formatPX(mergeHorizontal));
                        }
                        else {
                            if (boxModel[left] !== 0) {
                                this.android(this.localizeString(prefix + 'Left'), $util$3.formatPX(boxModel[left]));
                            }
                            if (boxModel[right] !== 0) {
                                this.android(this.localizeString(prefix + 'Right'), $util$3.formatPX(boxModel[right]));
                            }
                        }
                        if (mergeVertical !== 0) {
                            this.android(`${prefix}Vertical`, $util$3.formatPX(mergeVertical));
                        }
                        else {
                            if (boxModel[top] !== 0) {
                                this.android(`${prefix}Top`, $util$3.formatPX(boxModel[top]));
                            }
                            if (boxModel[bottom] !== 0) {
                                this.android(`${prefix}Bottom`, $util$3.formatPX(boxModel[bottom]));
                            }
                        }
                    }
                };
                setBoxModel($css$1.BOX_MARGIN, 'layout_margin', this.renderParent === undefined || !this.renderParent.is(CONTAINER_NODE.GRID));
                setBoxModel($css$1.BOX_PADDING, 'padding');
            }
            extractAttributes(depth) {
                if (this.dir === 'rtl') {
                    this.android(this.length ? 'layoutDirection' : 'textDirection', 'rtl');
                }
                if (this.styleElement) {
                    const dataset = $css$1.getDataSet(this.element, 'android');
                    for (const name in dataset) {
                        const obj = name === 'attr' ? 'android' : REGEXP_DATASETATTR.test(name) ? $util$3.capitalize(name.substring(4), false) : '';
                        if (obj !== '') {
                            for (const values of dataset[name].split(';')) {
                                const [key, value] = values.split('::');
                                if (key && value) {
                                    this.attr(obj, key, value);
                                }
                            }
                        }
                    }
                }
                const indent = '\t'.repeat(depth);
                let output = '';
                for (const value of this.combine()) {
                    output += `\n${indent + value}`;
                }
                return output;
            }
            autoSizeBoxModel() {
                if (this.hasProcedure($enum.NODE_PROCEDURE.AUTOFIT)) {
                    const renderParent = this.renderParent;
                    let layoutWidth = $util$3.convertInt(this.android('layout_width'));
                    let layoutHeight = $util$3.convertInt(this.android('layout_height'));
                    if (this.is(CONTAINER_NODE.BUTTON) && layoutHeight === 0) {
                        if (!this.has('minHeight')) {
                            this.android('layout_height', $util$3.formatPX(this.bounds.height + (this.css('borderStyle') === 'outset' ? $util$3.convertInt(this.css('borderWidth')) : 0)));
                        }
                    }
                    else if (this.is(CONTAINER_NODE.LINE)) {
                        if (this.tagName !== 'HR' && layoutHeight > 0 && this.toInt('height', true) > 0) {
                            this.android('layout_height', $util$3.formatPX(layoutHeight + this.borderTopWidth + this.borderBottomWidth));
                        }
                    }
                    else if (renderParent) {
                        let borderWidth = false;
                        if (this.tableElement) {
                            borderWidth = this.css('boxSizing') === 'content-box' || $util$3.isUserAgent(8 /* FIREFOX */ | 16 /* EDGE */);
                        }
                        else if (this.styleElement && this.hasResource($enum.NODE_RESOURCE.BOX_SPACING)) {
                            if (this.css('boxSizing') !== 'border-box' && !renderParent.tableElement) {
                                if (layoutWidth > 0 && this.toInt('width', !this.imageElement) > 0 && this.contentBoxWidth > 0) {
                                    this.android('layout_width', $util$3.formatPX(layoutWidth + this.contentBoxWidth));
                                }
                                else if (this.imageElement && this.singleChild) {
                                    layoutWidth = $util$3.convertInt(renderParent.android('layout_width'));
                                    if (layoutWidth > 0) {
                                        renderParent.android('layout_width', $util$3.formatPX(layoutWidth + this.marginLeft + this.contentBoxWidth));
                                    }
                                }
                                if (layoutHeight > 0 && this.toInt('height', !this.imageElement) > 0 && this.contentBoxHeight > 0) {
                                    this.android('layout_height', $util$3.formatPX(layoutHeight + this.contentBoxHeight));
                                }
                                else if (this.imageElement && this.singleChild) {
                                    layoutHeight = $util$3.convertInt(renderParent.android('layout_height'));
                                    if (layoutHeight > 0) {
                                        renderParent.android('layout_height', $util$3.formatPX(layoutHeight + this.marginTop + this.contentBoxHeight));
                                    }
                                }
                            }
                            borderWidth = true;
                        }
                        if (borderWidth && this.visibleStyle.borderWidth) {
                            this.modifyBox(256 /* PADDING_LEFT */, this.borderLeftWidth);
                            this.modifyBox(64 /* PADDING_RIGHT */, this.borderRightWidth);
                            this.modifyBox(32 /* PADDING_TOP */, this.borderTopWidth);
                            this.modifyBox(128 /* PADDING_BOTTOM */, this.borderBottomWidth);
                        }
                    }
                }
            }
            alignHorizontalLayout() {
                if (this.layoutHorizontal) {
                    if (this.layoutLinear) {
                        const renderChildren = this.renderChildren;
                        let baseline;
                        if (renderChildren.some(node => node.floating) && !renderChildren.some(node => node.imageElement && node.baseline)) {
                            this.android('baselineAligned', 'false');
                        }
                        else {
                            baseline = $NodeList.baseline(renderChildren.filter(node => node.baseline && !node.layoutRelative && !node.layoutConstraint), true)[0];
                            if (baseline && baseline.containerType <= CONTAINER_NODE.INLINE) {
                                this.android('baselineAlignedChildIndex', renderChildren.indexOf(baseline).toString());
                                baseline.baselineActive = true;
                            }
                        }
                    }
                    if (!this.hasAlign(4096 /* MULTILINE */) && !this.hasAlign(512 /* RIGHT */) && !this.visibleStyle.background) {
                        const firstChild = this.find(node => node.float === 'left') || this.renderChildren[0];
                        if (firstChild && firstChild.marginLeft < 0) {
                            const value = Math.abs(firstChild.marginLeft);
                            if (value === this.marginLeft) {
                                this.modifyBox(16 /* MARGIN_LEFT */, null);
                                firstChild.modifyBox(16 /* MARGIN_LEFT */, null);
                            }
                            else if (value < this.marginLeft) {
                                this.modifyBox(16 /* MARGIN_LEFT */, firstChild.marginLeft);
                                firstChild.modifyBox(16 /* MARGIN_LEFT */, null);
                            }
                            else {
                                this.modifyBox(16 /* MARGIN_LEFT */, null);
                                firstChild.modifyBox(16 /* MARGIN_LEFT */, this.marginLeft);
                            }
                        }
                    }
                }
            }
            setLineHeight() {
                const lineHeight = this.lineHeight;
                if (lineHeight > 0) {
                    if (this.textElement && this.multiline) {
                        if (this.localSettings.targetAPI >= 28 /* PIE */) {
                            this.android('lineHeight', $util$3.formatPX(lineHeight));
                        }
                        else {
                            const spacing = lineHeight - this.fontSize;
                            if (spacing > 0) {
                                this.android('lineSpacingExtra', $util$3.formatPX(spacing));
                            }
                        }
                    }
                    else {
                        const hasLineHeight = this.has('lineHeight');
                        if (this.length || hasLineHeight) {
                            const setMarginOffset = (node, bottom = true) => {
                                if (hasLineHeight && node === this) {
                                    const offset = lineHeight - (node.hasHeight ? node.height : node.bounds.height);
                                    if (offset > 0) {
                                        node.modifyBox(2 /* MARGIN_TOP */, Math.floor(offset / 2));
                                        node.modifyBox(8 /* MARGIN_BOTTOM */, Math.ceil(offset / 2));
                                    }
                                    else {
                                        if (node.height < lineHeight) {
                                            node.android('minHeight', $util$3.formatPX(lineHeight));
                                        }
                                        if (!node.has('verticalAlign')) {
                                            node.mergeGravity('gravity', 'center_vertical');
                                        }
                                    }
                                }
                                else {
                                    let offset = (lineHeight - ((node === this || node.layoutVertical && node.length > 1 || node.hasAlign(4096 /* MULTILINE */) ? node.bounds.height : node.fontSize) + node.paddingTop + node.paddingBottom)) / 2;
                                    if (offset > 0) {
                                        node.modifyBox(2 /* MARGIN_TOP */, Math.floor(offset) - (node.inlineVertical && !node.baseline ? $util$3.convertFloat(node.verticalAlign) : 0));
                                        if (bottom && lineHeight > node.height) {
                                            if (node.height > 0) {
                                                offset = lineHeight - node.height;
                                            }
                                            node.modifyBox(8 /* MARGIN_BOTTOM */, Math.ceil(offset));
                                        }
                                    }
                                }
                            };
                            if (this.length === 0) {
                                setMarginOffset(this);
                            }
                            else {
                                const baseline = $util$3.filterArray(this.renderChildren, node => node.baselineActive);
                                if (baseline.length) {
                                    for (let i = 0; i < baseline.length; i++) {
                                        const node = baseline[i];
                                        if (!node.has('lineHeight')) {
                                            setMarginOffset(node, i > 0);
                                        }
                                    }
                                }
                                else {
                                    this.renderEach((node) => {
                                        if (!(node.has('lineHeight') || this.textElement && node.multiline || node.inputElement)) {
                                            setMarginOffset(node);
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
            setVisibility() {
                switch (this.cssAscend('visibility', true)) {
                    case 'hidden':
                    case 'collapse':
                        this.hide(true);
                        break;
                }
            }
            get documentId() {
                return this.controlId ? `@+id/${this.controlId}` : '';
            }
            set anchored(value) {
                this.constraint.horizontal = value;
                this.constraint.vertical = value;
            }
            get anchored() {
                return this.constraint.horizontal && this.constraint.vertical;
            }
            set containerType(value) {
                this._containerType = value;
            }
            get containerType() {
                if (this._containerType === 0) {
                    const value = ELEMENT_ANDROID[this.tagName] || 0;
                    if (value !== 0) {
                        this._containerType = value;
                    }
                }
                return this._containerType || 0;
            }
            get layoutFrame() {
                return this.is(CONTAINER_NODE.FRAME);
            }
            get layoutLinear() {
                return this.is(CONTAINER_NODE.LINEAR);
            }
            get layoutRelative() {
                return this.is(CONTAINER_NODE.RELATIVE);
            }
            get layoutConstraint() {
                return this.is(CONTAINER_NODE.CONSTRAINT);
            }
            get support() {
                const cached = this.unsafe('cached') || {};
                if (cached.support === undefined) {
                    cached.support = {
                        container: {
                            positionRelative: this.layoutRelative || this.layoutConstraint
                        }
                    };
                }
                return cached.support;
            }
            get inlineWidth() {
                return this.android('layout_width') === 'wrap_content';
            }
            get inlineHeight() {
                return this.android('layout_height') === 'wrap_content';
            }
            get blockWidth() {
                return this.android('layout_width') === 'match_parent';
            }
            get blockHeight() {
                return this.android('layout_height') === 'match_parent';
            }
            get singleChild() {
                if (this.renderParent) {
                    return this.renderParent.length === 1;
                }
                else if (this.parent && this.parent.id !== 0) {
                    return this.parent.length === 1;
                }
                return false;
            }
            get fontSize() {
                if (this._fontSize === 0) {
                    this._fontSize = $util$3.parseUnit(this.css('fontSize')) || 16;
                }
                return this._fontSize;
            }
            set localSettings(value) {
                Object.assign(this._localSettings, value);
            }
            get localSettings() {
                return this._localSettings;
            }
        };
    };

    class View extends View$MX(squared.base.Node) {
    }

    class ViewGroup extends View$MX(squared.base.NodeGroup) {
        constructor(id, node, children, afterInit) {
            super(id, undefined, afterInit);
            this.tagName = `${node.tagName}_GROUP`;
            this.documentParent = node.documentParent;
            this.retain(children);
        }
    }

    var $NodeList$1 = squared.base.NodeList;
    const $enum$1 = squared.base.lib.enumeration;
    const $color$1 = squared.lib.color;
    const $dom$1 = squared.lib.dom;
    const $element = squared.lib.element;
    const $math = squared.lib.math;
    const $util$4 = squared.lib.util;
    const $xml = squared.lib.xml;
    const GUIDELINE_AXIS = [AXIS_ANDROID.HORIZONTAL, AXIS_ANDROID.VERTICAL];
    function createColumnLayout(partition, horizontal) {
        let LT;
        let RB;
        let LRTB;
        let RLBT;
        if (horizontal) {
            LT = 'left';
            RB = 'right';
            LRTB = 'leftRight';
            RLBT = 'rightLeft';
        }
        else {
            LT = 'top';
            RB = 'bottom';
            LRTB = 'topBottom';
            RLBT = 'bottomTop';
        }
        for (const seg of partition) {
            const rowStart = seg[0];
            const rowEnd = seg[seg.length - 1];
            rowStart.anchor(LT, 'parent');
            rowEnd.anchor(RB, 'parent');
            for (let i = 0; i < seg.length; i++) {
                const chain = seg[i];
                const previous = seg[i - 1];
                const next = seg[i + 1];
                if (horizontal) {
                    chain.app('layout_constraintVertical_bias', '0');
                }
                else if (i > 0) {
                    chain.anchor('left', rowStart.documentId);
                }
                if (previous) {
                    chain.anchor(LRTB, previous.documentId);
                }
                if (next) {
                    chain.anchor(RLBT, next.documentId);
                }
                Controller.setConstraintDimension(chain);
                chain.anchored = true;
            }
            if (horizontal) {
                rowStart.app('layout_constraintHorizontal_chainStyle', 'spread_inside');
            }
            else {
                rowStart.app('layout_constraintVertical_chainStyle', 'packed');
            }
        }
    }
    function sortHorizontalFloat(list) {
        if (list.some(node => node.floating)) {
            list.sort((a, b) => {
                if (a.floating && !b.floating) {
                    return a.float === 'left' ? -1 : 1;
                }
                else if (!a.floating && b.floating) {
                    return b.float === 'left' ? 1 : -1;
                }
                else if (a.floating && b.floating) {
                    if (a.float !== b.float) {
                        return a.float === 'left' ? -1 : 1;
                    }
                    else if (a.float === 'right' && b.float === 'right') {
                        return 1;
                    }
                }
                return 0;
            });
        }
    }
    function adjustBaseline(baseline, nodes) {
        for (const node of nodes) {
            if (node !== baseline) {
                if (node.imageElement && node.actualHeight > baseline.actualHeight) {
                    if (node.renderParent && $util$4.withinRange(node.linear.top, node.renderParent.box.top)) {
                        node.anchor('top', 'true');
                    }
                }
                else if (node.element && node.length === 0 || node.layoutHorizontal && node.renderChildren.every(item => item.baseline)) {
                    node.anchor('baseline', baseline.documentId);
                }
            }
        }
    }
    function getTextBottom(nodes) {
        return $util$4.filterArray(nodes, node => node.verticalAlign === 'text-bottom').sort((a, b) => {
            if (a.bounds.height === b.bounds.height) {
                return a.is(CONTAINER_NODE.SELECT) ? 1 : -1;
            }
            return a.bounds.height > b.bounds.height ? -1 : 1;
        })[0];
    }
    function checkSingleLine(node, nowrap = false) {
        if (node.textElement && node.cssAscend('textAlign', true) !== 'center' && !node.hasWidth && !node.multiline && (nowrap || node.textContent.trim().split(String.fromCharCode(32)).length > 0)) {
            node.android('singleLine', 'true');
        }
    }
    function adjustDocumentRootOffset(value, parent, direction, boxReset = false) {
        if (value > 0) {
            if (!boxReset) {
                value -= parent[`padding${direction}`];
            }
            if (parent.documentBody) {
                value -= parent[`margin${direction}`];
            }
            return Math.max(value, 0);
        }
        return value;
    }
    function adjustFloatingNegativeMargin(node, previous) {
        if (previous.float === 'left') {
            if (previous.marginRight < 0) {
                const right = Math.abs(previous.marginRight);
                node.modifyBox(16 /* MARGIN_LEFT */, (previous.actualWidth + (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0)) - right);
                node.anchor('left', previous.documentId);
                previous.modifyBox(4 /* MARGIN_RIGHT */, null);
                return true;
            }
        }
        else if (node.float === 'right' && previous.float === 'right') {
            if (previous.marginLeft < 0) {
                const left = Math.abs(previous.marginLeft);
                const width = previous.actualWidth;
                if (left < width) {
                    node.modifyBox(4 /* MARGIN_RIGHT */, width - left);
                }
                node.anchor('right', previous.documentId);
                previous.modifyBox(16 /* MARGIN_LEFT */, null);
                return true;
            }
        }
        return false;
    }
    function constraintMinMax(node, dimension) {
        const minWH = node.cssInitial(`min${dimension}`);
        const maxWH = node.cssInitial(`max${dimension}`);
        if ($util$4.isLength(minWH)) {
            node.app(`layout_constraint${dimension}_min`, minWH);
            node.constraint.minWidth = true;
        }
        if ($util$4.isLength(maxWH)) {
            node.app(`layout_constraint${dimension}_max`, maxWH);
            node.constraint.minHeight = true;
        }
    }
    function constraintPercentValue(node, dimension, value, requirePX) {
        if ($util$4.isPercent(value)) {
            if (requirePX) {
                node.android(`layout_${dimension.toLowerCase()}`, node.convertPX(value, dimension === 'Width'));
            }
            else if (value !== '100%') {
                const percent = parseInt(value) / 100 + (node.actualParent ? node.contentBoxWidth / node.actualParent.box.width : 0);
                node.app(`layout_constraint${dimension}_percent`, percent.toPrecision(node.localSettings.floatPrecision));
                node.android(`layout_${dimension.toLowerCase()}`, '0px');
            }
        }
    }
    function constraintPercentWidth(node, requirePX = false) {
        const value = node.has('width') ? node.css('width') : '';
        constraintPercentValue(node, 'Width', value, requirePX);
    }
    function constraintPercentHeight(node, requirePX = false) {
        if (node.documentParent.hasHeight) {
            const value = node.has('height') ? node.css('height') : '';
            constraintPercentValue(node, 'Height', value, requirePX);
        }
    }
    function isTargeted(parent, node) {
        if (parent.element && node.dataset.target) {
            const element = document.getElementById(node.dataset.target);
            return element !== null && element !== parent.element;
        }
        return false;
    }
    class Controller extends squared.base.Controller {
        constructor() {
            super(...arguments);
            this.localSettings = {
                baseTemplate: $xml.STRING_XMLENCODING,
                floatPrecision: 3,
                layout: {
                    pathName: 'res/layout',
                    fileExtension: 'xml'
                },
                svg: {
                    enabled: false
                },
                unsupported: {
                    excluded: new Set(['BR']),
                    tagName: new Set(['OPTION', 'INPUT:hidden', 'MAP', 'AREA'])
                },
                relative: {
                    superscriptFontScale: -4,
                    subscriptFontScale: -4
                },
                constraint: {
                    withinParentBottomOffset: 3.5
                }
            };
        }
        static evaluateAnchors(nodes) {
            const horizontal = [];
            const vertical = [];
            for (const node of nodes) {
                if (node.constraint.horizontal) {
                    horizontal.push(node);
                }
                if (node.constraint.vertical) {
                    vertical.push(node);
                }
            }
            let i = -1;
            while (++i < nodes.length) {
                const node = nodes[i];
                if (!node.constraint.horizontal) {
                    for (const attr in node.constraint.current) {
                        const position = node.constraint.current[attr];
                        if (position.horizontal && horizontal.find(item => item.documentId === position.documentId)) {
                            node.constraint.horizontal = true;
                            horizontal.push(node);
                            i = -1;
                            break;
                        }
                    }
                }
                if (!node.constraint.vertical) {
                    for (const attr in node.constraint.current) {
                        const position = node.constraint.current[attr];
                        if (!position.horizontal && vertical.find(item => item.documentId === position.documentId)) {
                            node.constraint.vertical = true;
                            vertical.push(node);
                            i = -1;
                            break;
                        }
                    }
                }
            }
        }
        static setConstraintDimension(node) {
            constraintPercentWidth(node);
            constraintPercentHeight(node);
            constraintMinMax(node, 'Width');
            constraintMinMax(node, 'Height');
        }
        static setFlexDimension(node, horizontal) {
            let dimensionA;
            let dimensionB;
            if (horizontal) {
                dimensionA = 'width';
                dimensionB = 'height';
            }
            else {
                dimensionA = 'height';
                dimensionB = 'width';
            }
            let basis = node.flexbox.basis;
            if (basis !== 'auto') {
                if ($util$4.isPercent(basis)) {
                    if (basis !== '0%') {
                        node.app(`layout_constraint${horizontal ? 'Width' : 'Height'}_percent`, (parseFloat(basis) / 100).toPrecision(node.localSettings.floatPrecision));
                        basis = '';
                    }
                }
                else if ($util$4.isLength(basis)) {
                    node.android(`layout_${dimensionA}`, node.convertPX(basis));
                    basis = '';
                }
            }
            if (basis !== '') {
                const size = node.has(dimensionA) ? node.css(dimensionA) : '';
                if (node.flexbox.grow > 0) {
                    node.android(`layout_${dimensionA}`, '0px');
                    node.app(`layout_constraint${horizontal ? 'Horizontal' : 'Vertical'}_weight`, node.flexbox.grow.toString());
                }
                else if ($util$4.isLength(size)) {
                    node.android(`layout_${dimensionA}`, size);
                }
                else if (node.flexbox.shrink > 1) {
                    node.android(`layout_${dimensionA}`, 'wrap_content');
                }
                else {
                    if (horizontal) {
                        constraintPercentWidth(node);
                    }
                    else {
                        constraintPercentHeight(node);
                    }
                }
                if (node.flexbox.shrink < 1) {
                    node.app(`layout_constrained${horizontal ? 'Width' : 'Height'}`, 'true');
                }
            }
            const sizeB = node.has(dimensionB) ? node.css(dimensionB) : '';
            if ($util$4.isLength(sizeB)) {
                node.android(`layout_${dimensionB}`, sizeB);
            }
            else {
                if (horizontal) {
                    constraintPercentHeight(node, true);
                }
                else {
                    constraintPercentWidth(node, true);
                }
            }
            constraintMinMax(node, 'Width');
            constraintMinMax(node, 'Height');
        }
        finalize(data) {
            for (const view of data.templates) {
                view.content = $xml.replaceTab(replaceLength(view.content.replace(/{#0}/, getRootNs(view.content)), this.userSettings.resolutionDPI, this.userSettings.convertPixels), this.userSettings.insertSpaces);
            }
        }
        processUnknownParent(layout) {
            const node = layout.node;
            let next = false;
            let renderAs;
            if (node.has('columnCount')) {
                layout.columnCount = node.toInt('columnCount');
                layout.setType(CONTAINER_NODE.CONSTRAINT, 256 /* COLUMN */, 4 /* AUTO_LAYOUT */);
            }
            else if (layout.some(item => !item.pageFlow)) {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, 2 /* UNKNOWN */);
            }
            else {
                if (layout.length === 1) {
                    const child = node.item(0);
                    if (node.documentRoot && isTargeted(node, child)) {
                        node.hide();
                        next = true;
                    }
                    else if (this.userSettings.collapseUnattributedElements &&
                        node.element &&
                        node.positionStatic &&
                        !node.documentRoot &&
                        !node.groupParent &&
                        !node.elementId &&
                        !node.dataset.use &&
                        !node.dataset.target &&
                        !node.marginTop &&
                        !node.marginBottom &&
                        !node.hasWidth &&
                        !node.hasHeight &&
                        node.lineHeight <= child.lineHeight &&
                        !node.visibleStyle.padding &&
                        !node.visibleStyle.background &&
                        !node.rightAligned &&
                        !node.autoMargin.horizontal &&
                        !node.companion &&
                        !node.has('maxWidth') &&
                        !node.has('maxHeight') &&
                        !node.has('textAlign') &&
                        !node.has('verticalAlign') &&
                        !node.documentParent.hasAlign(4 /* AUTO_LAYOUT */) &&
                        !this.hasAppendProcessing(node.id)) {
                        child.documentRoot = node.documentRoot;
                        child.siblingIndex = node.siblingIndex;
                        child.parent = layout.parent;
                        node.renderAs = child;
                        node.resetBox(30 /* MARGIN */, child, true);
                        node.hide();
                        node.innerChild = child;
                        child.outerParent = node;
                        renderAs = child;
                    }
                    else {
                        layout.setType(CONTAINER_NODE.FRAME, 2048 /* SINGLE */);
                    }
                }
                else {
                    if (node.element && $element.hasLineBreak(node.element, true)) {
                        layout.setType(layout.some(item => item.positionRelative && !item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */, 2 /* UNKNOWN */);
                    }
                    else if (this.checkConstraintFloat(layout)) {
                        layout.setType(CONTAINER_NODE.CONSTRAINT, 1024 /* NOWRAP */);
                    }
                    else if (layout.linearX) {
                        if (this.checkFrameHorizontal(layout)) {
                            layout.renderType |= 64 /* FLOAT */ | 8 /* HORIZONTAL */;
                        }
                        else if (this.checkConstraintHorizontal(layout)) {
                            layout.setType(CONTAINER_NODE.CONSTRAINT);
                        }
                        else if (this.checkRelativeHorizontal(layout)) {
                            layout.setType(CONTAINER_NODE.RELATIVE);
                        }
                        else {
                            layout.setType(CONTAINER_NODE.LINEAR);
                            if (layout.floated.size) {
                                sortHorizontalFloat(layout.children);
                            }
                        }
                        layout.add(8 /* HORIZONTAL */);
                    }
                    else if (layout.linearY) {
                        layout.setType(layout.some(item => item.positionRelative && !item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */, node.documentRoot ? 2 /* UNKNOWN */ : 0);
                    }
                    else if (layout.every(item => item.inlineFlow)) {
                        if (this.checkFrameHorizontal(layout)) {
                            layout.renderType |= 64 /* FLOAT */ | 8 /* HORIZONTAL */;
                        }
                        else {
                            layout.setType(CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */, 2 /* UNKNOWN */);
                        }
                    }
                    else if (layout.some(item => item.alignedVertically(item.previousSiblings(), layout.children, layout.cleared))) {
                        layout.setType(CONTAINER_NODE.LINEAR, 16 /* VERTICAL */, 2 /* UNKNOWN */);
                    }
                    else {
                        layout.setType(CONTAINER_NODE.CONSTRAINT, 2 /* UNKNOWN */);
                    }
                }
            }
            return { layout, next, renderAs };
        }
        processUnknownChild(layout) {
            const node = layout.node;
            let next = false;
            if (layout.containerType === 0) {
                const visibleStyle = node.visibleStyle;
                if (node.textContent.length && (node.inlineText || visibleStyle.borderWidth)) {
                    layout.setType(CONTAINER_NODE.TEXT);
                }
                else if (visibleStyle.backgroundImage && !visibleStyle.backgroundRepeat && (!node.inlineText || node.toInt('textIndent') + node.actualWidth < 0)) {
                    layout.setType(CONTAINER_NODE.IMAGE, 2048 /* SINGLE */);
                    node.exclude({ resource: $enum$1.NODE_RESOURCE.FONT_STYLE | $enum$1.NODE_RESOURCE.VALUE_STRING });
                }
                else if (node.block && (visibleStyle.borderWidth || visibleStyle.backgroundImage || visibleStyle.paddingVertical)) {
                    layout.setType(CONTAINER_NODE.LINE);
                }
                else if (!node.documentRoot) {
                    if (this.userSettings.collapseUnattributedElements && node.naturalElement && node.bounds.height === 0 && !visibleStyle.background && !node.elementId && !node.dataset.use) {
                        node.hide();
                        next = true;
                    }
                    else {
                        layout.setType(visibleStyle.background ? CONTAINER_NODE.TEXT : CONTAINER_NODE.FRAME);
                    }
                }
            }
            return { layout, next };
        }
        processTraverseHorizontal(layout, siblings) {
            const { node, parent, children } = layout;
            if (this.checkFrameHorizontal(layout)) {
                layout.node = this.createNodeGroup(node, children, parent);
                layout.renderType |= 64 /* FLOAT */ | 8 /* HORIZONTAL */;
            }
            else if (siblings === undefined || layout.length !== siblings.length || parent.hasAlign(16 /* VERTICAL */)) {
                layout.node = this.createNodeGroup(node, children, parent);
                this.processLayoutHorizontal(layout);
            }
            else if (!parent.hasAlign(8 /* HORIZONTAL */)) {
                parent.alignmentType |= 8 /* HORIZONTAL */;
            }
            return { layout };
        }
        processTraverseVertical(layout, siblings) {
            const { node, parent, children, floated, cleared } = layout;
            if (floated.size && cleared.size && !(floated.size === 1 && layout.every((item, index) => index === 0 || index === layout.length - 1 || cleared.has(item)))) {
                layout.node = this.createNodeGroup(node, children, parent);
                layout.renderType |= 64 /* FLOAT */ | 16 /* VERTICAL */;
            }
            else if (siblings === undefined || layout.length !== siblings.length || parent.hasAlign(8 /* HORIZONTAL */)) {
                if (!parent.layoutVertical) {
                    layout.node = this.createNodeGroup(node, children, parent);
                    layout.setType(CONTAINER_NODE.LINEAR, 16 /* VERTICAL */);
                }
            }
            else if (!parent.hasAlign(16 /* VERTICAL */)) {
                parent.alignmentType |= 16 /* VERTICAL */;
            }
            return { layout };
        }
        processLayoutHorizontal(layout, strictMode = false) {
            let containerType = 0;
            if (this.checkConstraintFloat(layout)) {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 1024 /* NOWRAP */);
            }
            else if (this.checkConstraintHorizontal(layout)) {
                containerType = CONTAINER_NODE.CONSTRAINT;
            }
            else if (this.checkRelativeHorizontal(layout)) {
                containerType = CONTAINER_NODE.RELATIVE;
            }
            else if (!strictMode || layout.linearX && !layout.floated.has('right')) {
                containerType = CONTAINER_NODE.LINEAR;
                if (layout.floated.size) {
                    sortHorizontalFloat(layout.children);
                }
            }
            if (containerType !== 0) {
                layout.setType(containerType, 8 /* HORIZONTAL */);
            }
            return { layout };
        }
        sortRenderPosition(parent, templates) {
            if (parent.layoutConstraint && templates.some(item => !item.node.pageFlow)) {
                const below = [];
                const middle = [];
                const above = [];
                for (const item of templates) {
                    const node = item.node;
                    if (node.pageFlow || node.actualParent !== parent) {
                        middle.push(item);
                    }
                    else if (node.zIndex >= 0) {
                        above.push(item);
                    }
                    else {
                        below.push(item);
                    }
                }
                return $util$4.concatMultiArray($util$4.sortArray(below, true, 'zIndex', 'siblingIndex'), middle, $util$4.sortArray(above, true, 'zIndex', 'siblingIndex'));
            }
            return templates;
        }
        checkFrameHorizontal(layout) {
            const [floating, sibling] = layout.partition(node => node.floating);
            if (layout.floated.size === 2 || layout.cleared.size || layout.some(node => node.pageFlow && node.autoMargin.horizontal)) {
                return true;
            }
            else if (sibling.length) {
                if (layout.floated.has('right')) {
                    return true;
                }
                else if (layout.floated.has('left') && sibling.some(node => node.blockStatic)) {
                    let flowIndex = Number.POSITIVE_INFINITY;
                    for (const node of sibling) {
                        flowIndex = Math.min(flowIndex, node.siblingIndex);
                    }
                    return $util$4.replaceMap(floating, node => node.siblingIndex).some(value => value < flowIndex);
                }
            }
            return false;
        }
        checkConstraintFloat(layout) {
            return layout.floated.size === 1 && layout.every(node => node.floating && node.marginLeft >= 0 && node.marginRight >= 0 && (!node.positionRelative || node.left >= 0 && node.top >= 0)) && $NodeList$1.partitionRows(layout.children).length > 1;
        }
        checkConstraintHorizontal(layout) {
            let sameHeight = true;
            let previousHeight = layout.children[0].actualHeight;
            for (let i = 1; i < layout.length; i++) {
                if (previousHeight !== layout.children[i].actualHeight) {
                    sameHeight = false;
                    break;
                }
                previousHeight = layout.children[i].actualHeight;
            }
            return !sameHeight && !layout.parent.hasHeight && layout.some(node => node.verticalAlign === 'bottom') && layout.every(node => node.inlineVertical && (node.baseline || node.verticalAlign === 'bottom'));
        }
        checkRelativeHorizontal(layout) {
            if (layout.floated.size === 2) {
                return false;
            }
            return layout.some(node => node.positionRelative || node.textElement || node.imageElement || !node.baseline);
        }
        setConstraints() {
            for (const node of this.cache) {
                if (node.visible && (node.layoutRelative || node.layoutConstraint) && node.hasProcedure($enum$1.NODE_PROCEDURE.CONSTRAINT)) {
                    const children = node.renderFilter(item => !item.positioned);
                    if (children.length) {
                        if (node.layoutRelative) {
                            this.processRelativeHorizontal(node, children);
                        }
                        else if (node.layoutConstraint) {
                            const [pageFlow, absolute] = $util$4.partitionArray(children, item => item.pageFlow);
                            let bottomParent = node.box.bottom;
                            if (absolute.length) {
                                node.renderEach(item => bottomParent = Math.max(bottomParent, item.linear.bottom));
                                for (const item of absolute) {
                                    if (!item.positionAuto && (item.documentParent === item.absoluteParent || item.position === 'fixed')) {
                                        if (item.hasWidth && item.autoMargin.horizontal) {
                                            if (item.has('left') && item.autoMargin.right) {
                                                item.anchor('left', 'parent');
                                                item.modifyBox(16 /* MARGIN_LEFT */, item.left);
                                            }
                                            else if (item.has('right') && item.autoMargin.left) {
                                                item.anchor('right', 'parent');
                                                item.modifyBox(4 /* MARGIN_RIGHT */, item.right);
                                            }
                                            else {
                                                item.anchorParent(AXIS_ANDROID.HORIZONTAL);
                                                item.modifyBox(16 /* MARGIN_LEFT */, item.left);
                                                item.modifyBox(4 /* MARGIN_RIGHT */, item.right);
                                            }
                                        }
                                        else {
                                            if (item.has('left')) {
                                                item.anchor('left', 'parent');
                                                item.modifyBox(16 /* MARGIN_LEFT */, adjustDocumentRootOffset(item.left, node, 'Left'));
                                            }
                                            if (item.has('right') && (!item.hasWidth || !item.has('left'))) {
                                                item.anchor('right', 'parent');
                                                item.modifyBox(4 /* MARGIN_RIGHT */, adjustDocumentRootOffset(item.right, node, 'Right'));
                                            }
                                        }
                                        if (item.hasHeight && item.autoMargin.vertical) {
                                            if (item.has('top') && item.autoMargin.bottom) {
                                                item.anchor('top', 'parent');
                                                item.modifyBox(2 /* MARGIN_TOP */, item.top);
                                            }
                                            else if (item.has('bottom') && item.autoMargin.top) {
                                                item.anchor('bottom', 'parent');
                                                item.modifyBox(8 /* MARGIN_BOTTOM */, item.bottom);
                                            }
                                            else {
                                                item.anchorParent(AXIS_ANDROID.VERTICAL);
                                                item.modifyBox(2 /* MARGIN_TOP */, item.top);
                                                item.modifyBox(8 /* MARGIN_BOTTOM */, item.bottom);
                                            }
                                        }
                                        else {
                                            if (item.has('top')) {
                                                const reset = node.valueBox(32 /* PADDING_TOP */);
                                                item.anchor('top', 'parent');
                                                item.modifyBox(2 /* MARGIN_TOP */, adjustDocumentRootOffset(item.top, node, 'Top', reset[0] === 1));
                                            }
                                            if (item.has('bottom') && (!item.hasHeight || !item.has('top'))) {
                                                const reset = node.valueBox(128 /* PADDING_BOTTOM */);
                                                item.anchor('bottom', 'parent');
                                                item.modifyBox(8 /* MARGIN_BOTTOM */, adjustDocumentRootOffset(item.bottom, node, 'Bottom', reset[0] === 1));
                                            }
                                        }
                                        item.positioned = true;
                                    }
                                }
                            }
                            if (node.layoutHorizontal) {
                                this.processConstraintHorizontal(node, pageFlow);
                            }
                            else if (node.hasAlign(256 /* COLUMN */)) {
                                this.processConstraintColumn(node, pageFlow);
                            }
                            else if (pageFlow.length > 1) {
                                this.processConstraintChain(node, pageFlow, bottomParent);
                            }
                            else {
                                for (const item of pageFlow) {
                                    if (item.autoMargin.leftRight || (item.inlineStatic && item.cssAscend('textAlign', true) === 'center')) {
                                        item.anchorParent(AXIS_ANDROID.HORIZONTAL);
                                    }
                                    else if (item.rightAligned) {
                                        item.anchor('right', 'parent');
                                    }
                                    else if ($util$4.withinRange(item.linear.left, node.box.left) || item.linear.left < node.box.left) {
                                        item.anchor('left', 'parent');
                                    }
                                    if ($util$4.withinRange(item.linear.top, node.box.top) || item.linear.top < node.box.top) {
                                        item.anchor('top', 'parent');
                                    }
                                    if (this.withinParentBottom(item.linear.bottom, bottomParent) && item.actualParent && !item.actualParent.documentBody) {
                                        item.anchor('bottom', 'parent');
                                    }
                                    Controller.setConstraintDimension(item);
                                }
                            }
                            Controller.evaluateAnchors(pageFlow);
                            for (const item of children) {
                                if (!item.anchored) {
                                    this.addGuideline(item, node);
                                    if (item.pageFlow) {
                                        Controller.evaluateAnchors(pageFlow);
                                    }
                                }
                                if (!item.hasWidth && item.alignParent('left') && item.alignParent('right')) {
                                    item.android('layout_width', 'match_parent');
                                }
                                if (!item.hasHeight && item.alignParent('top') && item.alignParent('bottom')) {
                                    item.android('layout_height', 'match_parent');
                                }
                            }
                        }
                    }
                }
            }
        }
        renderNodeGroup(layout) {
            const { node, parent, containerType, alignmentType, rowCount, columnCount } = layout;
            const options = createViewAttribute();
            let valid = false;
            switch (containerType) {
                case CONTAINER_NODE.LINEAR:
                    if ($util$4.hasBit(alignmentType, 16 /* VERTICAL */)) {
                        options.android.orientation = AXIS_ANDROID.VERTICAL;
                        valid = true;
                    }
                    else if ($util$4.hasBit(alignmentType, 8 /* HORIZONTAL */)) {
                        options.android.orientation = AXIS_ANDROID.HORIZONTAL;
                        valid = true;
                    }
                    break;
                case CONTAINER_NODE.GRID:
                    options.android.rowCount = rowCount ? rowCount.toString() : '';
                    options.android.columnCount = columnCount ? columnCount.toString() : '2';
                    valid = true;
                    break;
                case CONTAINER_NODE.FRAME:
                case CONTAINER_NODE.RELATIVE:
                case CONTAINER_NODE.CONSTRAINT:
                    valid = true;
                    break;
            }
            if (valid) {
                node.alignmentType |= alignmentType;
                node.setControlType(View.getControlName(containerType), containerType);
                node.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent);
                node.apply(options);
                return {
                    type: 1 /* XML */,
                    node,
                    controlName: node.controlName
                };
            }
            return undefined;
        }
        renderNode(layout) {
            const { node, containerType, alignmentType } = layout;
            const controlName = View.getControlName(containerType);
            node.setControlType(controlName, containerType);
            node.alignmentType |= alignmentType;
            let parent = layout.parent;
            let target = !node.dataset.use ? node.dataset.target : undefined;
            if (node.element) {
                switch (node.element.tagName) {
                    case 'IMG': {
                        if (node.hasResource($enum$1.NODE_RESOURCE.IMAGE_SOURCE)) {
                            const element = node.element;
                            const widthPercent = node.has('width', 32 /* PERCENT */);
                            const heightPercent = node.has('height', 32 /* PERCENT */);
                            const image = this.application.session.image.get(element.src);
                            let width = node.toFloat('width');
                            let height = node.toFloat('height');
                            let scaleType;
                            if (widthPercent || heightPercent) {
                                if (widthPercent) {
                                    width *= parent.box.width / 100;
                                    node.css('width', $util$4.formatPX(width));
                                    if (height === 0 && image) {
                                        height = image.height * (width / image.width);
                                        node.css('height', $util$4.formatPX(height));
                                    }
                                }
                                if (heightPercent) {
                                    height *= parent.box.height / 100;
                                    node.css('height', $util$4.formatPX(height));
                                    if (width === 0 && image) {
                                        width = image.width * (height / image.height);
                                        node.css('width', $util$4.formatPX(width));
                                    }
                                }
                                scaleType = widthPercent && heightPercent ? 'fitXY' : 'fitCenter';
                            }
                            else {
                                switch (node.css('objectFit')) {
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
                                        scaleType = 'matrix';
                                        break;
                                    default:
                                        scaleType = 'fitXY';
                                        break;
                                }
                            }
                            node.android('scaleType', scaleType);
                            if (image && (width === 0 || height === 0)) {
                                if (width === 0) {
                                    width = image.width;
                                }
                                if (height === 0) {
                                    height = image.height;
                                }
                            }
                            if (width > 0 && height === 0 || width === 0 && height > 0) {
                                node.android('adjustViewBounds', 'true');
                            }
                            if (node.baseline) {
                                node.android('baselineAlignBottom', 'true');
                            }
                            const src = Resource.addImageSrc(element);
                            if (src !== '') {
                                node.android('src', `@drawable/${src}`);
                            }
                            if (!node.pageFlow && (node.left < 0 || node.top < 0)) {
                                const absoluteParent = node.absoluteParent;
                                if (absoluteParent && absoluteParent.css('overflow') === 'hidden') {
                                    const container = this.application.createNode($element.createElement(node.actualParent ? node.actualParent.element : null));
                                    container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                                    container.inherit(node, 'base');
                                    container.exclude({
                                        procedure: $enum$1.NODE_PROCEDURE.ALL,
                                        resource: $enum$1.NODE_RESOURCE.ALL
                                    });
                                    container.cssApply({
                                        position: node.position,
                                        zIndex: node.zIndex.toString()
                                    });
                                    parent.appendTry(node, container);
                                    node.parent = container;
                                    this.cache.append(container);
                                    if (width > 0) {
                                        container.android('layout_width', width < parent.box.width ? $util$4.formatPX(width) : 'match_parent');
                                    }
                                    else {
                                        container.android('layout_width', 'wrap_content');
                                    }
                                    if (height > 0) {
                                        container.android('layout_height', height < parent.box.height ? $util$4.formatPX(height) : 'match_parent');
                                    }
                                    else {
                                        container.android('layout_height', 'wrap_content');
                                    }
                                    container.render(target ? this.application.resolveTarget(target) : parent);
                                    container.saveAsInitial();
                                    this.application.addRenderTemplate(parent, container, {
                                        type: 1 /* XML */,
                                        node: container,
                                        controlName: CONTAINER_ANDROID.FRAME
                                    });
                                    node.modifyBox(2 /* MARGIN_TOP */, node.top);
                                    node.modifyBox(16 /* MARGIN_LEFT */, node.left);
                                    container.innerChild = node;
                                    node.outerParent = container;
                                    parent = container;
                                    layout.parent = container;
                                    target = undefined;
                                }
                            }
                        }
                        break;
                    }
                    case 'INPUT': {
                        const element = node.element;
                        switch (element.type) {
                            case 'checkbox':
                                if (element.checked) {
                                    node.android('checked', 'true');
                                }
                                break;
                            case 'text':
                                node.android('inputType', 'text');
                                break;
                            case 'password':
                                node.android('inputType', 'textPassword');
                                break;
                            case 'range':
                                if (element.value) {
                                    node.android('progress', element.value);
                                }
                            case 'time':
                            case 'week':
                            case 'month':
                            case 'number':
                            case 'datetime-local':
                                if (element.min) {
                                    node.android('min', element.min);
                                }
                                if (element.max) {
                                    node.android('max', element.max);
                                }
                                break;
                            case 'url':
                            case 'email':
                            case 'search':
                            case 'tel':
                                if (element.minLength !== -1) {
                                    node.android('minLength', element.minLength.toString());
                                }
                                if (element.maxLength > 0) {
                                    node.android('maxLength', element.maxLength.toString());
                                }
                                break;
                        }
                        break;
                    }
                    case 'SELECT': {
                        const element = node.element;
                        if (element.size > 1 && !node.cssInitial('verticalAlign')) {
                            node.css('verticalAlign', 'text-bottom', true);
                        }
                        break;
                    }
                    case 'TEXTAREA': {
                        const element = node.element;
                        node.android('minLines', element.rows ? element.rows.toString() : '2');
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
                        if (element.maxLength > 0) {
                            node.android('maxLength', element.maxLength.toString());
                        }
                        if (!node.hasWidth && element.cols > 0) {
                            node.css('width', $util$4.formatPX(element.cols * 8), true);
                        }
                        node.android('hint', element.placeholder);
                        node.android('scrollbars', AXIS_ANDROID.VERTICAL);
                        node.android('inputType', 'textMultiLine');
                        if (node.overflowX) {
                            node.android('scrollHorizontally', 'true');
                        }
                        if (!node.cssInitial('verticalAlign')) {
                            node.css('verticalAlign', 'text-bottom', true);
                        }
                        break;
                    }
                    case 'LEGEND': {
                        const offset = Math.floor((node.bounds.height - node.fontSize) / 2);
                        if (offset > 0) {
                            node.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                        }
                        if (!node.hasWidth) {
                            node.css('minWidth', $util$4.formatPX(node.bounds.width), true);
                            node.css('display', 'inline-block', true);
                        }
                        break;
                    }
                }
            }
            if (node.inlineVertical) {
                switch (node.verticalAlign) {
                    case 'sub':
                        node.modifyBox(8 /* MARGIN_BOTTOM */, Math.ceil(node.fontSize / this.localSettings.relative.subscriptFontScale));
                        break;
                    case 'super':
                        node.modifyBox(2 /* MARGIN_TOP */, Math.ceil(node.fontSize / this.localSettings.relative.superscriptFontScale));
                        break;
                }
            }
            switch (controlName) {
                case CONTAINER_ANDROID.TEXT:
                    let overflow = '';
                    if (node.overflowX) {
                        overflow += AXIS_ANDROID.HORIZONTAL;
                    }
                    if (node.overflowY) {
                        overflow += (overflow !== '' ? '|' : '') + AXIS_ANDROID.VERTICAL;
                    }
                    if (overflow !== '') {
                        node.android('scrollbars', overflow);
                    }
                    if (node.has('letterSpacing')) {
                        node.android('letterSpacing', node.css('letterSpacing'));
                    }
                    if (node.css('textAlign') === 'justify') {
                        node.android('justificationMode', 'inter_word');
                    }
                    if (node.has('textShadow')) {
                        const match = node.css('textShadow').match(/^(rgba?\(\d+, \d+, \d+(?:, [\d.]+)?\)) (-?[\d.]+[a-z]+) (-?[\d.]+[a-z]+)\s*(-?[\d.]+[a-z]+)?$/);
                        if (match) {
                            const colorName = Resource.addColor($color$1.parseColor(match[1]));
                            if (colorName !== '') {
                                node.android('shadowColor', `@color/${colorName}`);
                                node.android('shadowDx', $util$4.parseUnit(match[2], node.fontSize).toString());
                                node.android('shadowDy', $util$4.parseUnit(match[3], node.fontSize).toString());
                                node.android('shadowRadius', match[4] ? $util$4.parseUnit(match[4], node.fontSize).toString() : '0');
                            }
                        }
                    }
                    if (node.css('whiteSpace') === 'nowrap') {
                        node.android('singleLine', 'true');
                    }
                    break;
                case CONTAINER_ANDROID.EDIT:
                case CONTAINER_ANDROID.RANGE:
                    if (!node.hasWidth) {
                        node.css('width', $util$4.formatPX(node.bounds.width), true);
                    }
                    break;
                case CONTAINER_ANDROID.BUTTON:
                    if (node.cssInitial('verticalAlign') === '') {
                        node.css('verticalAlign', 'text-bottom', true);
                    }
                    break;
                case CONTAINER_ANDROID.LINE:
                    if (!node.hasHeight) {
                        node.android('layout_height', $util$4.formatPX(node.contentBoxHeight || 1));
                    }
                    break;
            }
            if (node.textElement || node.imageElement || node.svgElement) {
                if (node.has('maxWidth')) {
                    node.android('maxWidth', $util$4.formatPX(node.parseUnit(node.css('maxWidth'))));
                }
                if (node.has('maxHeight')) {
                    node.android('maxHeight', $util$4.formatPX(node.parseUnit(node.css('maxHeight'), false)));
                }
            }
            node.render(target ? this.application.resolveTarget(target) : parent);
            return {
                type: 1 /* XML */,
                node,
                controlName
            };
        }
        renderNodeStatic(controlName, options, width, height, content) {
            const node = new View(0, undefined, this.afterInsertNode);
            node.setControlType(controlName);
            if (width !== '') {
                node.android('layout_width', width || 'wrap_content');
            }
            if (height !== '') {
                node.android('layout_height', height || 'wrap_content');
            }
            if (options) {
                node.apply(options);
                options.documentId = node.documentId;
            }
            return this.getEnclosingTag(1 /* XML */, { controlName, attributes: this.userSettings.showAttributes ? node.extractAttributes(1) : undefined, content });
        }
        renderSpace(width, height = '', columnSpan = 0, rowSpan = 0, options) {
            options = createViewAttribute(options);
            if ($util$4.isPercent(width)) {
                options.android.layout_columnWeight = (parseFloat(width) / 100).toPrecision(this.localSettings.floatPrecision);
                width = '0px';
            }
            if ($util$4.isPercent(height)) {
                options.android.layout_rowWeight = (parseFloat(height) / 100).toPrecision(this.localSettings.floatPrecision);
                height = '0px';
            }
            if (columnSpan > 0) {
                options.android.layout_columnSpan = columnSpan.toString();
            }
            if (rowSpan > 0) {
                options.android.layout_rowSpan = rowSpan.toString();
            }
            return this.renderNodeStatic(CONTAINER_ANDROID.SPACE, options, width, height || undefined);
        }
        addGuideline(node, parent, orientation = '', percent = false, opposite = false) {
            const documentParent = parent.groupParent ? parent : node.documentParent;
            GUIDELINE_AXIS.forEach(value => {
                if (!node.constraint[value] && (orientation === '' || value === orientation)) {
                    const horizontal = value === AXIS_ANDROID.HORIZONTAL;
                    let LT;
                    let RB;
                    let LTRB;
                    let RBLT;
                    if (horizontal) {
                        LT = !opposite ? 'left' : 'right';
                        RB = !opposite ? 'right' : 'left';
                        LTRB = !opposite ? 'leftRight' : 'rightLeft';
                        RBLT = !opposite ? 'rightLeft' : 'leftRight';
                    }
                    else {
                        LT = !opposite ? 'top' : 'bottom';
                        RB = !opposite ? 'bottom' : 'top';
                        LTRB = !opposite ? 'topBottom' : 'bottomTop';
                        RBLT = !opposite ? 'bottomTop' : 'topBottom';
                    }
                    if ($util$4.withinRange(node.linear[LT], documentParent.box[LT])) {
                        node.anchor(LT, 'parent', true);
                        return;
                    }
                    const dimension = node.positionStatic ? 'bounds' : 'linear';
                    let beginPercent = 'layout_constraintGuide_';
                    let usePercent = false;
                    let location;
                    if (!node.pageFlow && $util$4.isPercent(node.css(LT))) {
                        location = parseFloat(node.css(LT)) / 100;
                        usePercent = true;
                        beginPercent += 'percent';
                    }
                    else {
                        if (!percent && !parent.hasAlign(4 /* AUTO_LAYOUT */)) {
                            const found = parent.renderChildren.some(item => {
                                if (item !== node && item.constraint[value]) {
                                    const pageFlow = node.pageFlow && item.pageFlow;
                                    let valid = false;
                                    if (pageFlow) {
                                        if ($util$4.withinRange(node.linear[LT], item.linear[RB])) {
                                            node.anchor(LTRB, item.documentId, true);
                                            valid = true;
                                        }
                                        else if ($util$4.withinRange(node.linear[RB], item.linear[LT])) {
                                            node.anchor(RBLT, item.documentId, true);
                                            valid = true;
                                        }
                                    }
                                    if (pageFlow || !node.pageFlow && !item.pageFlow) {
                                        if ($util$4.withinRange(node.bounds[LT], item.bounds[LT])) {
                                            node.anchor(!horizontal && node.textElement && node.baseline && item.textElement && item.baseline ? 'baseline' : LT, item.documentId, true);
                                            valid = true;
                                        }
                                        else if ($util$4.withinRange(node.bounds[RB], item.bounds[RB])) {
                                            node.anchor(RB, item.documentId, true);
                                            valid = true;
                                        }
                                    }
                                    if (valid) {
                                        item.constraint[value] = true;
                                        return true;
                                    }
                                }
                                return false;
                            });
                            if (found) {
                                return;
                            }
                        }
                        if (node.positionAuto) {
                            const previousSiblings = node.previousSiblings();
                            if (previousSiblings.length && !node.alignedVertically(previousSiblings)) {
                                const previous = previousSiblings[previousSiblings.length - 1];
                                if (previous.renderParent === node.renderParent) {
                                    node.anchor(horizontal ? 'rightLeft' : 'top', previous.documentId, true);
                                    node.constraint[value] = previous.constraint[value];
                                    return;
                                }
                            }
                        }
                        if (percent) {
                            const position = Math.abs(node[dimension][LT] - documentParent.box[LT]) / documentParent.box[horizontal ? 'width' : 'height'];
                            location = parseFloat((opposite ? 1 - position : position).toPrecision(this.localSettings.floatPrecision));
                            usePercent = true;
                            beginPercent += 'percent';
                        }
                        else {
                            location = node[dimension][LT] - documentParent.box[!opposite ? LT : RB];
                            beginPercent += 'begin';
                        }
                    }
                    const guideline = parent.constraint.guideline || {};
                    if (!node.pageFlow) {
                        if (node.absoluteParent === node.documentParent) {
                            location = horizontal ? adjustDocumentRootOffset(location, documentParent, 'Left') : adjustDocumentRootOffset(location, documentParent, 'Top', documentParent.valueBox(32 /* PADDING_TOP */)[0] === 1);
                        }
                    }
                    else {
                        if (node.inlineVertical) {
                            const verticalAlign = $util$4.convertInt(node.verticalAlign);
                            if (verticalAlign < 0) {
                                location += verticalAlign;
                            }
                        }
                    }
                    node.constraint[value] = true;
                    if (location <= 0) {
                        node.anchor(LT, 'parent', true);
                    }
                    else if (horizontal && documentParent.hasWidth && !node.has('right') && location + node[dimension].width >= documentParent.box.right || !horizontal && documentParent.hasHeight && !node.has('bottom') && location + node[dimension].height >= documentParent.box.bottom) {
                        node.anchor(RB, 'parent', true);
                    }
                    else {
                        const anchors = $util$4.optionalAsObject(guideline, `${value}.${beginPercent}.${LT}`);
                        if (anchors) {
                            for (const id in anchors) {
                                if (parseInt(anchors[id]) === location) {
                                    node.anchor(LT, id, true);
                                    node.anchorDelete(RB);
                                    return;
                                }
                            }
                        }
                        const options = createViewAttribute({
                            android: {
                                orientation: horizontal ? AXIS_ANDROID.VERTICAL : AXIS_ANDROID.HORIZONTAL
                            },
                            app: {
                                [beginPercent]: usePercent ? location.toString() : $util$4.formatPX(location)
                            }
                        });
                        this.addAfterOutsideTemplate(node.id, this.renderNodeStatic(CONTAINER_ANDROID.GUIDELINE, options));
                        const documentId = options['documentId'];
                        node.anchor(LT, documentId, true);
                        node.anchorDelete(RB);
                        if (horizontal) {
                            node.constraint.guidelineHorizontal = documentId;
                        }
                        else {
                            node.constraint.guidelineVertical = documentId;
                        }
                        $util$4.assignEmptyValue(guideline, value, beginPercent, LT, documentId, location.toString());
                        parent.constraint.guideline = guideline;
                    }
                }
            });
        }
        createNodeGroup(node, children, parent, replacement) {
            const group = new ViewGroup(this.cache.nextId, node, children, this.afterInsertNode);
            if (parent) {
                parent.appendTry(replacement || node, group);
                group.init();
            }
            else {
                group.siblingIndex = node.siblingIndex;
            }
            this.cache.append(group);
            return group;
        }
        createNodeWrapper(node, parent, controlName, containerType) {
            const container = this.application.createNode($element.createElement(node.actualParent ? node.actualParent.element : null, node.block));
            if (node.documentRoot) {
                container.documentRoot = true;
                node.documentRoot = false;
            }
            container.inherit(node, 'base', 'alignment');
            if (controlName) {
                container.setControlType(controlName, containerType);
            }
            container.exclude({
                section: $enum$1.APP_SECTION.ALL,
                procedure: $enum$1.NODE_PROCEDURE.CUSTOMIZATION,
                resource: $enum$1.NODE_RESOURCE.BOX_STYLE | $enum$1.NODE_RESOURCE.ASSET
            });
            if (parent) {
                parent.appendTry(node, container);
                node.parent = container;
            }
            else {
                container.innerChild = node;
                container.siblingIndex = node.siblingIndex;
            }
            container.saveAsInitial();
            this.application.processing.cache.append(container, !parent);
            node.outerParent = container;
            node.unsetCache();
            return container;
        }
        processRelativeHorizontal(node, children) {
            const rows = [];
            let alignmentMultiLine = false;
            if (node.hasAlign(16 /* VERTICAL */)) {
                for (let i = 0; i < children.length; i++) {
                    const item = children[i];
                    const previous = children[i - 1];
                    if (i === 0) {
                        item.anchor('top', 'true');
                    }
                    else {
                        item.anchor('topBottom', previous.documentId);
                    }
                    rows.push([item]);
                }
            }
            else {
                const boxWidth = (() => {
                    const renderParent = node.renderParent;
                    if (renderParent) {
                        if (renderParent.overflowX) {
                            if (node.has('width', 2 /* LENGTH */)) {
                                return node.toFloat('width', true);
                            }
                            else if (renderParent.has('width', 2 /* LENGTH */)) {
                                return renderParent.toFloat('width', true);
                            }
                            else if (renderParent.has('width', 32 /* PERCENT */)) {
                                return renderParent.actualWidth - renderParent.contentBoxWidth;
                            }
                        }
                        else if (renderParent.groupParent && renderParent.hasAlign(64 /* FLOAT */)) {
                            let floatStart = Number.NEGATIVE_INFINITY;
                            $util$4.captureMap(node.documentParent.actualChildren, item => item.float === 'left' && item.siblingIndex < node.siblingIndex, item => floatStart = Math.max(floatStart, item.linear.right));
                            if (floatStart !== Number.NEGATIVE_INFINITY && children.some(item => item.linear.left === floatStart)) {
                                return node.box.right - floatStart;
                            }
                        }
                    }
                    return node.box.width;
                })();
                const maxBoxWidth = Math.min(boxWidth, this.userSettings.maxWordWrapWidth);
                const alignmentSingle = node.hasAlign(128 /* SEGMENTED */) || !node.groupParent && node.inline && node.linear.right <= node.documentParent.box.right;
                const firefoxEdge = $util$4.isUserAgent(8 /* FIREFOX */ | 16 /* EDGE */);
                const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
                const cleared = $NodeList$1.linearData(children, true).cleared;
                const rangeMultiLine = new Set();
                const textIndent = node.toInt('textIndent');
                let rowWidth = 0;
                let rowPreviousLeft;
                let rowPreviousBottom;
                $util$4.partitionArray(children, item => item.float !== 'right').forEach((seg, index) => {
                    if (seg.length === 0) {
                        return;
                    }
                    const leftAlign = index === 0;
                    let leftForward = true;
                    let alignParent;
                    if (leftAlign) {
                        const actualParent = $NodeList$1.actualParent(seg);
                        if (actualParent && actualParent.cssInitialAny('textAlign', 'right', 'end')) {
                            alignParent = 'right';
                            leftForward = false;
                            seg[seg.length - 1].anchor(alignParent, 'true');
                        }
                        else {
                            alignParent = 'left';
                        }
                        sortHorizontalFloat(seg);
                    }
                    else {
                        alignParent = 'right';
                    }
                    for (let i = 0; i < seg.length; i++) {
                        const item = seg[i];
                        const previous = seg[i - 1];
                        let bounds = item.bounds;
                        if (item.inlineText && !item.hasWidth) {
                            const rect = $dom$1.getRangeClientRect(item.element);
                            if (rect.multiline > 0 || rect.width < item.box.width) {
                                bounds = rect;
                                if (!item.multiline) {
                                    item.multiline = rect.multiline > 0;
                                }
                                if (firefoxEdge && rect.multiline && !$util$4.REGEXP_COMPILED.LEADINGNEWLINE.test(item.textContent)) {
                                    rangeMultiLine.add(item);
                                }
                            }
                        }
                        if (item.multiline && bounds.width <= maxBoxWidth) {
                            item.multiline = false;
                        }
                        let alignSibling = leftAlign && leftForward ? 'leftRight' : 'rightLeft';
                        let anchored = true;
                        let siblings;
                        if (item.autoMargin.leftRight) {
                            item.anchor('centerHorizontal', 'true');
                        }
                        else if (item.autoMargin.left) {
                            item.anchor('right', 'true');
                        }
                        else if (item.autoMargin.right) {
                            item.anchor('left', 'true');
                        }
                        else {
                            anchored = false;
                        }
                        if (i === 0) {
                            if (leftForward) {
                                if (!anchored) {
                                    item.anchor(alignParent, 'true');
                                }
                                rows.push([item]);
                            }
                            else {
                                rows.push([]);
                            }
                        }
                        else {
                            const rowItems = rows[rows.length - 1];
                            const checkWidthWrap = () => {
                                if (alignmentSingle) {
                                    return false;
                                }
                                let baseWidth = rowWidth + item.marginLeft;
                                if (rowPreviousLeft && !rowItems.includes(rowPreviousLeft)) {
                                    baseWidth += rowPreviousLeft.linear.width;
                                }
                                if (rowPreviousLeft === undefined || !item.plainText || item.multiline || !rowItems.includes(rowPreviousLeft) || cleared.has(item)) {
                                    baseWidth += bounds.width;
                                }
                                if (item.marginRight < 0) {
                                    baseWidth += item.marginRight;
                                }
                                const maxWidth = ((item.plainText || item.inlineText) && item.textContent.indexOf(' ') !== -1 ? maxBoxWidth : boxWidth) - (rows.length === 1 ? textIndent : 0);
                                return Math.floor(baseWidth) - (item.styleElement && item.inlineStatic ? item.paddingLeft + item.paddingRight : 0) - (firefoxEdge ? item.borderRightWidth : 0) > maxWidth;
                            };
                            if (adjustFloatingNegativeMargin(item, previous)) {
                                alignSibling = '';
                            }
                            const viewGroup = item.groupParent && !item.hasAlign(128 /* SEGMENTED */);
                            siblings = !viewGroup && item.element && item.inlineVertical && previous.inlineVertical ? $dom$1.getElementsBetweenSiblings(previous.element, item.element, true) : undefined;
                            const startNewRow = () => {
                                if (previous.textElement) {
                                    if (i === 1 && siblings === undefined && item.plainText && !$util$4.REGEXP_COMPILED.TRAILINGSPACE.test(previous.textContent) && !$util$4.REGEXP_COMPILED.LEADINGSPACE.test(item.textContent)) {
                                        return false;
                                    }
                                    else if (checkLineWrap && (previous.multiline && $element.hasLineBreak(previous.element, false, true) || rangeMultiLine.has(previous))) {
                                        return true;
                                    }
                                }
                                if (previous.floating && previous.alignParent('left') && rowWidth < maxBoxWidth) {
                                    return false;
                                }
                                else if (checkLineWrap && (checkWidthWrap() || item.multiline && $element.hasLineBreak(item.element) || item.preserveWhiteSpace && $util$4.REGEXP_COMPILED.LEADINGNEWLINE.test(item.textContent))) {
                                    return true;
                                }
                                return false;
                            };
                            if (viewGroup ||
                                item.linear.top >= previous.linear.bottom && (item.blockStatic || item.floating && previous.float === item.float) ||
                                item.textElement && startNewRow() ||
                                !item.textElement && checkWidthWrap() ||
                                !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.lineBreak || sibling.excluded && sibling.blockStatic) || !!siblings && siblings.some(element => $element.isLineBreak(element))) ||
                                cleared.has(item) ||
                                previous.autoMargin.horizontal) {
                                rowPreviousBottom = rowItems.find(sibling => !sibling.floating) || rowItems[0];
                                for (const sibling of rowItems) {
                                    if (sibling !== rowPreviousBottom && sibling.linear.bottom > rowPreviousBottom.linear.bottom && (!sibling.floating || (sibling.floating && rowPreviousBottom.floating))) {
                                        rowPreviousBottom = sibling;
                                    }
                                }
                                item.anchor('topBottom', rowPreviousBottom.documentId);
                                if (leftForward) {
                                    if (rowPreviousLeft && item.linear.bottom <= rowPreviousLeft.bounds.bottom) {
                                        if (!anchored) {
                                            item.anchor(alignSibling, rowPreviousLeft.documentId);
                                        }
                                    }
                                    else {
                                        if (!anchored) {
                                            item.anchor(alignParent, 'true');
                                        }
                                        rowPreviousLeft = undefined;
                                    }
                                    anchored = true;
                                }
                                else {
                                    if (rowPreviousLeft && item.linear.bottom > rowPreviousLeft.bounds.bottom) {
                                        rowPreviousLeft = undefined;
                                    }
                                    previous.anchor(alignParent, 'true');
                                }
                                if (startNewRow && item.multiline) {
                                    checkSingleLine(previous, checkLineWrap);
                                }
                                rowWidth = Math.min(0, startNewRow && !previous.multiline && item.multiline && !cleared.has(item) ? item.linear.right - node.box.right : 0);
                                rows.push([item]);
                            }
                            else {
                                if (alignSibling !== '') {
                                    if (leftForward) {
                                        if (!anchored) {
                                            item.anchor(alignSibling, previous.documentId);
                                            anchored = true;
                                        }
                                    }
                                    else {
                                        previous.anchor(alignSibling, item.documentId);
                                    }
                                }
                                if (rowPreviousBottom) {
                                    item.anchor('topBottom', rowPreviousBottom.documentId);
                                }
                                rowItems.push(item);
                            }
                        }
                        if (item.float === 'left' && leftAlign) {
                            if (rowPreviousLeft) {
                                if (item.linear.bottom >= rowPreviousLeft.linear.bottom) {
                                    rowPreviousLeft = item;
                                }
                            }
                            else {
                                rowPreviousLeft = item;
                            }
                        }
                        let previousOffset = 0;
                        if (siblings && !siblings.some(element => !!$dom$1.getElementAsNode(element) || $element.isLineBreak(element))) {
                            const betweenStart = $dom$1.getRangeClientRect(siblings[0]);
                            const betweenEnd = siblings.length > 1 ? $dom$1.getRangeClientRect(siblings[siblings.length - 1]) : undefined;
                            if (!betweenStart.multiline && (betweenEnd === undefined || !betweenEnd.multiline)) {
                                previousOffset = betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                            }
                        }
                        rowWidth += previousOffset + item.marginLeft + bounds.width + item.marginRight;
                        if (i < seg.length - 1 || alignmentSingle) {
                            if (Math.ceil(rowWidth) >= this.userSettings.maxWordWrapWidth && !item.alignParent(alignParent)) {
                                checkSingleLine(item, checkLineWrap);
                            }
                        }
                    }
                });
            }
            if (rows.length > 1) {
                node.alignmentType |= 4096 /* MULTILINE */;
                alignmentMultiLine = true;
            }
            for (let i = 0; i < rows.length; i++) {
                const items = rows[i];
                let baseline;
                if (items.length > 1) {
                    const baselineItems = $NodeList$1.baseline(items);
                    let textBottom;
                    baseline = baselineItems[0];
                    if (baseline) {
                        textBottom = getTextBottom(items);
                        if (textBottom) {
                            const height = baseline.bounds.height;
                            if (textBottom.bounds.height > height || textBottom.companion && textBottom.companion.bounds.height > height || textBottom.some(item => !!item.companion && item.companion.bounds.height > height)) {
                                baseline.anchor('bottom', textBottom.documentId);
                            }
                            else {
                                textBottom = undefined;
                            }
                        }
                    }
                    const textBaseline = $NodeList$1.baseline(items, true)[0];
                    const baselineAlign = [];
                    let documentId = i === 0 ? 'true' : (baseline ? baseline.documentId : '');
                    for (const item of items) {
                        if (item !== baseline) {
                            if (item.baseline) {
                                baselineAlign.push(item);
                            }
                            else if (item.inlineVertical) {
                                switch (item.verticalAlign) {
                                    case 'text-top':
                                        if (textBaseline) {
                                            item.anchor('top', textBaseline.documentId);
                                        }
                                        break;
                                    case 'super':
                                    case 'top':
                                        if (documentId) {
                                            item.anchor('top', documentId);
                                        }
                                        break;
                                    case 'middle':
                                        if (!alignmentMultiLine) {
                                            item.anchor('centerVertical', 'true');
                                        }
                                        else if (baseline) {
                                            const height = Math.max(item.actualHeight, item.lineHeight);
                                            const heightParent = Math.max(baseline.actualHeight, baseline.lineHeight);
                                            if (height < heightParent) {
                                                item.anchor('top', baseline.documentId);
                                                item.modifyBox(2 /* MARGIN_TOP */, Math.round((heightParent - height) / 2));
                                            }
                                        }
                                        break;
                                    case 'text-bottom':
                                        if (textBaseline && item !== textBottom) {
                                            item.anchor('bottom', textBaseline.documentId);
                                        }
                                        break;
                                    case 'sub':
                                    case 'bottom':
                                        if (!$util$4.withinRange(node.bounds.height, item.bounds.height)) {
                                            if (!node.hasHeight && documentId === 'true') {
                                                if (!alignmentMultiLine) {
                                                    node.css('height', $util$4.formatPX(node.bounds.height), true);
                                                }
                                                else {
                                                    documentId = baseline.documentId;
                                                }
                                            }
                                            item.anchor('bottom', documentId);
                                        }
                                        break;
                                    default:
                                        if (item.verticalAlign !== '0px' && !item.svgElement) {
                                            baselineAlign.push(item);
                                        }
                                        break;
                                }
                            }
                        }
                    }
                    if (baseline) {
                        baseline.baselineActive = true;
                        if (baselineAlign.length) {
                            adjustBaseline(baseline, baselineAlign);
                        }
                    }
                }
                else {
                    items[0].baselineActive = true;
                }
            }
        }
        processConstraintHorizontal(node, children) {
            const baseline = $NodeList$1.baseline(children)[0];
            const baselineText = $NodeList$1.baseline(children, true)[0];
            const reverse = node.hasAlign(512 /* RIGHT */);
            let textBottom = getTextBottom(children);
            if (baseline) {
                baseline.baselineActive = true;
                if (textBottom && baseline.bounds.height < textBottom.bounds.height) {
                    baseline.anchor('bottom', textBottom.documentId);
                }
                else {
                    textBottom = undefined;
                }
            }
            for (let i = 0; i < children.length; i++) {
                const item = children[i];
                const previous = children[i - 1];
                if (i === 0) {
                    item.anchor(reverse ? 'right' : 'left', 'parent');
                }
                else if (previous) {
                    item.anchor(reverse ? 'rightLeft' : 'leftRight', previous.documentId);
                }
                if (item.inlineVertical) {
                    switch (item.verticalAlign) {
                        case 'text-top':
                            if (baselineText && item !== baselineText) {
                                item.anchor('top', baselineText.documentId);
                            }
                            break;
                        case 'super':
                        case 'top':
                            item.anchor('top', 'parent');
                            break;
                        case 'middle':
                            item.anchorParent(AXIS_ANDROID.VERTICAL);
                            break;
                        case 'text-bottom':
                            if (baselineText && item !== baselineText && item !== textBottom) {
                                item.anchor('bottom', baselineText.documentId);
                            }
                            break;
                        case 'sub':
                        case 'bottom':
                            item.anchor('bottom', 'parent');
                            break;
                        case 'baseline':
                            if (baseline && item !== baseline) {
                                item.anchor('baseline', baseline.documentId);
                            }
                            break;
                    }
                }
            }
        }
        processConstraintColumn(node, children) {
            const columnCount = node.toInt('columnCount');
            const perRowCount = Math.ceil(children.length / Math.min(columnCount, children.length));
            const columns = [];
            let totalGap = 0;
            for (let i = 0, j = 0; i < children.length; i++) {
                const item = children[i];
                if (i % perRowCount === 0) {
                    if (i > 0) {
                        j++;
                    }
                    if (columns[j] === undefined) {
                        columns[j] = [];
                    }
                }
                columns[j].push(item);
                if (item.length) {
                    totalGap += $math.maxArray($util$4.objectMap(item.children, child => child.marginLeft + child.marginRight));
                }
            }
            const columnGap = $util$4.convertInt(node.css('columnGap')) || 16;
            const percentGap = Math.max(((totalGap + (columnGap * (columnCount - 1))) / node.box.width) / columnCount, 0.01);
            const chainHorizontal = [];
            const chainVertical = [];
            const columnStart = [];
            for (let i = 0; i < columns.length; i++) {
                const column = columns[i];
                const first = column[0];
                if (i > 0) {
                    first.android(first.localizeString(BOX_ANDROID.MARGIN_LEFT), $util$4.formatPX(first.marginLeft + columnGap));
                }
                columnStart.push(first);
                for (const item of column) {
                    let percent = 0;
                    if (item.has('width', 32 /* PERCENT */)) {
                        percent = item.toFloat('width') / 100;
                    }
                    else {
                        percent = (1 / columnCount) - percentGap;
                    }
                    if (percent > 0) {
                        item.android('layout_width', '0px');
                        item.app('layout_constraintWidth_percent', percent.toPrecision(this.localSettings.floatPrecision));
                    }
                }
                chainVertical.push(column);
            }
            chainHorizontal.push(columnStart);
            createColumnLayout(chainHorizontal, true);
            createColumnLayout(chainVertical, false);
        }
        processConstraintChain(node, children, bottomParent) {
            const chainHorizontal = $NodeList$1.partitionRows(children);
            const parent = $NodeList$1.actualParent(children) || node;
            const floating = node.hasAlign(64 /* FLOAT */);
            const cleared = chainHorizontal.length > 1 && node.hasAlign(1024 /* NOWRAP */) ? $NodeList$1.linearData(parent.actualChildren, true).cleared : new Map();
            let reverse = false;
            if (chainHorizontal.length > 1) {
                node.alignmentType |= 4096 /* MULTILINE */;
            }
            if (floating) {
                reverse = node.hasAlign(512 /* RIGHT */);
                if (children.some(item => item.has('width', 32 /* PERCENT */))) {
                    node.android('layout_width', 'match_parent');
                }
            }
            for (const item of children) {
                if (!floating) {
                    if (item.rightAligned) {
                        if ($util$4.withinRange(item.linear.right, parent.box.right) || item.linear.right > parent.box.right) {
                            item.anchor('right', 'parent');
                        }
                    }
                    else if ($util$4.withinRange(item.linear.left, parent.box.left) || item.linear.left < parent.box.left) {
                        item.anchor('left', 'parent');
                    }
                }
                if ($util$4.withinRange(item.linear.top, node.box.top) || item.linear.top < node.box.top || item.floating && chainHorizontal.length === 1) {
                    item.anchor('top', 'parent');
                }
                if (this.withinParentBottom(item.linear.bottom, bottomParent) && !parent.documentBody && (parent.hasHeight || !item.alignParent('top'))) {
                    item.anchor('bottom', 'parent');
                }
            }
            const previousSiblings = [];
            let anchorStart;
            let anchorEnd;
            let chainStart;
            let chainEnd;
            if (reverse) {
                anchorStart = 'right';
                anchorEnd = 'left';
                chainStart = 'rightLeft';
                chainEnd = 'leftRight';
            }
            else {
                anchorStart = 'left';
                anchorEnd = 'right';
                chainStart = 'leftRight';
                chainEnd = 'rightLeft';
            }
            for (let i = 0; i < chainHorizontal.length; i++) {
                const seg = chainHorizontal[i];
                const rowStart = seg[0];
                const rowEnd = seg[seg.length - 1];
                rowStart.anchor(anchorStart, 'parent');
                if (parent.css('textAlign') === 'center') {
                    rowStart.app('layout_constraintHorizontal_chainStyle', 'spread');
                }
                else if (seg.length > 1) {
                    if (reverse) {
                        rowEnd.app('layout_constraintHorizontal_chainStyle', 'packed');
                        rowEnd.app('layout_constraintHorizontal_bias', '1');
                    }
                    else {
                        rowStart.app('layout_constraintHorizontal_chainStyle', 'packed');
                        rowStart.app('layout_constraintHorizontal_bias', '0');
                    }
                }
                if (seg.length > 1) {
                    rowEnd.anchor(anchorEnd, 'parent');
                }
                let previousRowBottom;
                if (i > 0) {
                    const previousRow = chainHorizontal[i - 1];
                    previousRowBottom = previousRow[0];
                    for (let j = 1; j < previousRow.length; j++) {
                        if (previousRow[j].linear.bottom > previousRowBottom.linear.bottom) {
                            previousRowBottom = previousRow[j];
                        }
                    }
                }
                for (let j = 0; j < seg.length; j++) {
                    const chain = seg[j];
                    const previous = seg[j - 1];
                    const next = seg[j + 1];
                    if (chain.autoMargin.leftRight) {
                        chain.anchorParent(AXIS_ANDROID.HORIZONTAL);
                    }
                    else {
                        if (previous) {
                            chain.anchor(chainStart, previous.documentId);
                        }
                        if (next) {
                            chain.anchor(chainEnd, next.documentId);
                        }
                    }
                    Controller.setConstraintDimension(chain);
                    if (i > 0) {
                        const previousRow = chainHorizontal[i - 1];
                        const aboveEnd = previousRow[previousRow.length - 1];
                        const previousEnd = reverse ? rowEnd : rowStart;
                        let nodes;
                        if (!cleared.has(chain)) {
                            nodes = [];
                            if (aboveEnd) {
                                nodes.push(aboveEnd);
                                if (chain.element) {
                                    const elements = $dom$1.getElementsBetweenSiblings(aboveEnd.element, chain.element);
                                    if (elements) {
                                        $util$4.concatArray(nodes, $util$4.flatMap(elements, element => $dom$1.getElementAsNode(element)));
                                    }
                                }
                            }
                            else {
                                nodes.push(previousEnd);
                            }
                        }
                        if (floating && (cleared.size === 0 || nodes && !nodes.some(item => cleared.has(item)))) {
                            if (previousRow.length) {
                                chain.anchor('topBottom', aboveEnd.documentId);
                                if (aboveEnd.alignSibling('bottomTop') === '') {
                                    aboveEnd.anchor('bottomTop', chain.documentId);
                                }
                                for (let k = previousSiblings.length - 2; k >= 0; k--) {
                                    const aboveBefore = previousSiblings[k];
                                    if (aboveBefore.linear.bottom > aboveEnd.linear.bottom) {
                                        const offset = reverse ? Math.ceil(aboveBefore.linear[anchorEnd]) - Math.floor(parent.box[anchorEnd]) : Math.ceil(parent.box[anchorEnd]) - Math.floor(aboveBefore.linear[anchorEnd]);
                                        if (offset >= chain.linear.width) {
                                            chain.anchor(chainStart, aboveBefore.documentId);
                                            chain.anchorDelete(chainEnd);
                                            if (chain === rowStart) {
                                                chain.anchorDelete(anchorStart);
                                                chain.delete('app', 'layout_constraintHorizontal_chainStyle', 'layout_constraintHorizontal_bias');
                                            }
                                            else if (chain === rowEnd) {
                                                chain.anchorDelete(anchorEnd);
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else if (previousRowBottom) {
                            if (j > 0) {
                                chain.anchor('top', rowStart.documentId);
                                chain.modifyBox(2 /* MARGIN_TOP */, rowStart.marginTop * -1);
                            }
                            else {
                                chain.anchor('topBottom', previousRowBottom.documentId);
                                previousRowBottom.anchor('bottomTop', chain.documentId);
                            }
                        }
                    }
                    previousSiblings.push(chain);
                }
            }
            Controller.evaluateAnchors(children);
        }
        withinParentBottom(bottom, boxBottom) {
            return $util$4.withinRange(bottom, boxBottom, this.localSettings.constraint.withinParentBottomOffset);
        }
        get userSettings() {
            return this.application.userSettings;
        }
        get containerTypeHorizontal() {
            return {
                containerType: CONTAINER_NODE.LINEAR,
                alignmentType: 8 /* HORIZONTAL */,
                renderType: 0
            };
        }
        get containerTypeVertical() {
            return {
                containerType: CONTAINER_NODE.LINEAR,
                alignmentType: 16 /* VERTICAL */,
                renderType: 0
            };
        }
        get containerTypeVerticalMargin() {
            return {
                containerType: CONTAINER_NODE.FRAME,
                alignmentType: 256 /* COLUMN */,
                renderType: 0
            };
        }
        get afterInsertNode() {
            const settings = this.userSettings;
            return (target) => {
                target.localSettings = {
                    targetAPI: settings.targetAPI !== undefined ? settings.targetAPI : 28 /* LATEST */,
                    supportRTL: settings.supportRTL !== undefined ? settings.supportRTL : true,
                    floatPrecision: this.localSettings.floatPrecision
                };
            };
        }
    }

    class ExtensionManager extends squared.base.ExtensionManager {
    }

    var COLOR_TMPL = {
        'resources': {
            '>': {
                'color': {
                    '@': ['name'],
                    '~': true
                }
            }
        },
        filename: 'res/values/colors.xml'
    };

    var DIMEN_TMPL = {
        'resources': {
            '>': {
                'dimen': {
                    '@': ['name'],
                    '~': true
                }
            }
        },
        filename: 'res/values/dimens.xml'
    };

    var FONT_TMPL = {
        'font-family': {
            '@': ['xmlns:android'],
            '>': {
                'font': {
                    '^': 'android',
                    '@': ['fontStyle', 'fontWeight', 'font']
                }
            }
        }
    };

    var STRING_TMPL = {
        'resources': {
            '>': {
                'string': {
                    '@': ['name'],
                    '~': true
                }
            }
        },
        filename: 'res/values/strings.xml'
    };

    var STRINGARRAY_TMPL = {
        'resources': {
            '>': {
                'string-array': {
                    '@': ['name'],
                    '>': {
                        'item': {
                            '~': true
                        }
                    }
                }
            }
        },
        filename: 'res/values/string_arrays.xml'
    };

    var STYLE_TMPL = {
        'resources': {
            '>': {
                'style': {
                    '@': ['name', 'parent'],
                    '>': {
                        'item': {
                            '@': ['name'],
                            '~': true
                        }
                    }
                }
            }
        },
        filename: 'res/values/styles.xml'
    };

    const $util$5 = squared.lib.util;
    const $xml$1 = squared.lib.xml;
    const REGEXP_FILENAME = /^(.+)\/(.+?\.\w+)$/;
    function getFileAssets(items) {
        const result = [];
        for (let i = 0; i < items.length; i += 2) {
            const match = REGEXP_FILENAME.exec(items[i + 1]);
            if (match) {
                result.push({
                    pathname: match[1],
                    filename: match[2],
                    content: items[i]
                });
            }
        }
        return result;
    }
    function getImageAssets(items) {
        const result = [];
        for (let i = 0; i < items.length; i += 2) {
            const match = REGEXP_FILENAME.exec(items[i + 1]);
            if (match) {
                result.push({
                    uri: items[i],
                    pathname: match[1],
                    filename: match[2],
                    content: ''
                });
            }
        }
        return result;
    }
    function createFileAsset(pathname, filename, content) {
        return {
            pathname,
            filename,
            content
        };
    }
    function caseInsensitive(a, b) {
        return a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1;
    }
    class File extends squared.base.File {
        saveAllToDisk(data) {
            const files = [];
            for (let i = 0; i < data.templates.length; i++) {
                const view = data.templates[i];
                files.push(createFileAsset(view.pathname, i === 0 ? this.userSettings.outputMainFileName : `${view.filename}.xml`, view.content));
            }
            this.saveToDisk($util$5.concatMultiArray(files, getFileAssets(this.resourceStringToXml()), getFileAssets(this.resourceStringArrayToXml()), getFileAssets(this.resourceFontToXml()), getFileAssets(this.resourceColorToXml()), getFileAssets(this.resourceDimenToXml()), getFileAssets(this.resourceStyleToXml()), getFileAssets(this.resourceDrawableToXml()), getImageAssets(this.resourceDrawableImageToXml()), getFileAssets(this.resourceAnimToXml())), this.userSettings.manifestLabelAppName);
        }
        layoutAllToXml(data, saveToDisk = false) {
            const result = {};
            const files = [];
            for (let i = 0; i < data.templates.length; i++) {
                const view = data.templates[i];
                result[view.filename] = [view.content];
                if (saveToDisk) {
                    files.push(createFileAsset(view.pathname, i === 0 ? this.userSettings.outputMainFileName : `${view.filename}.xml`, view.content));
                }
            }
            if (saveToDisk) {
                this.saveToDisk(files, this.userSettings.manifestLabelAppName);
            }
            return result;
        }
        resourceAllToXml(saveToDisk = false) {
            const result = {
                string: this.resourceStringToXml(),
                stringArray: this.resourceStringArrayToXml(),
                font: this.resourceFontToXml(),
                color: this.resourceColorToXml(),
                style: this.resourceStyleToXml(),
                dimen: this.resourceDimenToXml(),
                drawable: this.resourceDrawableToXml(),
                drawableImage: this.resourceDrawableImageToXml(),
                anim: this.resourceAnimToXml()
            };
            for (const name in result) {
                if (result[name].length === 0) {
                    delete result[name];
                }
            }
            if (saveToDisk) {
                const files = [];
                for (const name in result) {
                    if (name === 'image') {
                        $util$5.concatArray(files, getImageAssets(result[name]));
                    }
                    else {
                        $util$5.concatArray(files, getFileAssets(result[name]));
                    }
                }
                this.saveToDisk(files, this.userSettings.manifestLabelAppName);
            }
            return result;
        }
        resourceStringToXml(saveToDisk = false) {
            const result = [];
            const data = [{ string: [] }];
            if (!this.stored.strings.has('app_name')) {
                data[0].string.push({ name: 'app_name', innerText: this.userSettings.manifestLabelAppName });
            }
            for (const [name, innerText] of Array.from(this.stored.strings.entries()).sort(caseInsensitive)) {
                data[0].string.push({ name, innerText });
            }
            result.push($xml$1.replaceTab($xml$1.applyTemplate('resources', STRING_TMPL, data), this.userSettings.insertSpaces), STRING_TMPL.filename);
            if (saveToDisk) {
                this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
            }
            return result;
        }
        resourceStringArrayToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.arrays.size) {
                const data = [{ 'string-array': [] }];
                for (const [name, values] of Array.from(this.stored.arrays.entries()).sort()) {
                    data[0]['string-array'].push({
                        name,
                        item: $util$5.objectMap(values, innerText => ({ innerText }))
                    });
                }
                result.push($xml$1.replaceTab($xml$1.applyTemplate('resources', STRINGARRAY_TMPL, data), this.userSettings.insertSpaces), STRINGARRAY_TMPL.filename);
                if (saveToDisk) {
                    this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
                }
            }
            return result;
        }
        resourceFontToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.fonts.size) {
                const settings = this.userSettings;
                const xmlns = XMLNS_ANDROID[settings.targetAPI < 26 /* OREO */ ? 'app' : 'android'];
                for (const [name, font] of Array.from(this.stored.fonts.entries()).sort()) {
                    const data = [{
                            'xmlns:android': xmlns,
                            font: []
                        }];
                    for (const attr in font) {
                        const [fontStyle, fontWeight] = attr.split('-');
                        data[0].font.push({
                            fontStyle,
                            fontWeight,
                            font: `@font/${name + (fontStyle === 'normal' && fontWeight === 'normal' ? '' : (fontStyle !== 'normal' ? `_${fontStyle}` : '') + (fontWeight !== 'normal' ? `_${fontWeight}` : ''))}`
                        });
                    }
                    let output = $xml$1.replaceTab($xml$1.applyTemplate('font-family', FONT_TMPL, data), this.userSettings.insertSpaces);
                    if (settings.targetAPI < 26 /* OREO */) {
                        output = output.replace(/\s+android:/g, ' app:');
                    }
                    result.push(output, `res/font/${name}.xml`);
                }
                if (saveToDisk) {
                    this.saveToDisk(getFileAssets(result), settings.manifestLabelAppName);
                }
            }
            return result;
        }
        resourceColorToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.colors.size) {
                const data = [{ color: [] }];
                for (const [innerText, name] of Array.from(this.stored.colors.entries()).sort()) {
                    data[0].color.push({ name, innerText });
                }
                result.push($xml$1.replaceTab($xml$1.applyTemplate('resources', COLOR_TMPL, data), this.userSettings.insertSpaces), COLOR_TMPL.filename);
                if (saveToDisk) {
                    this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
                }
            }
            return result;
        }
        resourceStyleToXml(saveToDisk = false) {
            const settings = this.userSettings;
            const result = [];
            const files = [];
            if (this.stored.styles.size) {
                const data = [{ style: [] }];
                for (const style of Array.from(this.stored.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1)) {
                    if (Array.isArray(style.items)) {
                        const item = [];
                        for (const obj of style.items.sort((a, b) => a.name >= b.name ? 1 : -1)) {
                            item.push({ name: obj.name, innerText: obj.value });
                        }
                        data[0].style.push({
                            name: style.name,
                            parent: style.parent,
                            item
                        });
                    }
                }
                files.push({ data, filename: STYLE_TMPL.filename });
            }
            if (this.stored.themes.size) {
                const appTheme = {};
                for (const [filename, theme] of this.stored.themes.entries()) {
                    const data = [{ style: [] }];
                    for (const [themeName, themeData] of theme.entries()) {
                        const item = [];
                        for (const name in themeData.items) {
                            item.push({ name, innerText: themeData.items[name] });
                        }
                        if (!appTheme[filename] || themeName !== settings.manifestThemeName || item.length) {
                            data[0].style.push({
                                name: themeName,
                                parent: themeData.parent,
                                item
                            });
                        }
                        if (themeName === settings.manifestThemeName) {
                            appTheme[filename] = true;
                        }
                    }
                    files.push({ data, filename });
                }
            }
            for (const style of files) {
                result.push($xml$1.replaceTab(replaceLength($xml$1.applyTemplate('resources', STYLE_TMPL, style.data), settings.resolutionDPI, settings.convertPixels, true), settings.insertSpaces), style.filename);
            }
            if (saveToDisk) {
                this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
            }
            return result;
        }
        resourceDimenToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.dimens.size) {
                const data = [{ dimen: [] }];
                for (const [name, innerText] of Array.from(this.stored.dimens.entries()).sort()) {
                    data[0].dimen.push({
                        name,
                        innerText
                    });
                }
                result.push($xml$1.replaceTab(replaceLength($xml$1.applyTemplate('resources', DIMEN_TMPL, data), this.userSettings.resolutionDPI, this.userSettings.convertPixels), this.userSettings.insertSpaces), DIMEN_TMPL.filename);
                if (saveToDisk) {
                    this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
                }
            }
            return result;
        }
        resourceDrawableToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.drawables.size) {
                const settings = this.userSettings;
                for (const [name, value] of this.stored.drawables.entries()) {
                    result.push($xml$1.replaceTab(replaceLength(value, settings.resolutionDPI, settings.convertPixels), settings.insertSpaces), `res/drawable/${name}.xml`);
                }
                if (saveToDisk) {
                    this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
                }
            }
            return result;
        }
        resourceDrawableImageToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.images.size) {
                for (const [name, images] of this.stored.images.entries()) {
                    if (Object.keys(images).length > 1) {
                        for (const dpi in images) {
                            result.push(images[dpi], `res/drawable-${dpi}/${name}.${$util$5.fromLastIndexOf(images[dpi], '.')}`);
                        }
                    }
                    else if (images.mdpi) {
                        result.push(images.mdpi, `res/drawable/${name}.${$util$5.fromLastIndexOf(images.mdpi, '.')}`);
                    }
                }
                if (saveToDisk) {
                    this.saveToDisk(getImageAssets(result), this.userSettings.manifestLabelAppName);
                }
            }
            return result;
        }
        resourceAnimToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.animators.size) {
                for (const [name, value] of this.stored.animators.entries()) {
                    result.push($xml$1.replaceTab(value, this.userSettings.insertSpaces), `res/anim/${name}.xml`);
                }
                if (saveToDisk) {
                    this.saveToDisk(getFileAssets(result), this.userSettings.manifestLabelAppName);
                }
            }
            return result;
        }
        get userSettings() {
            return this.resource.userSettings;
        }
        get stored() {
            return this.resource.stored;
        }
    }

    const $enum$2 = squared.base.lib.enumeration;
    const $dom$2 = squared.lib.dom;
    const $util$6 = squared.lib.util;
    class Accessibility extends squared.base.extensions.Accessibility {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        afterBaseLayout() {
            for (const node of this.application.processing.cache) {
                const element = node.element;
                if (element && node.visible && node.hasProcedure($enum$2.NODE_PROCEDURE.ACCESSIBILITY)) {
                    switch (node.controlName) {
                        case CONTAINER_ANDROID.EDIT:
                            if (!node.companion) {
                                [$dom$2.getPreviousElementSibling(element), $dom$2.getNextElementSibling(element)].some((sibling) => {
                                    if (sibling) {
                                        const label = $dom$2.getElementAsNode(sibling);
                                        const labelParent = sibling && sibling.parentElement && sibling.parentElement.tagName === 'LABEL' ? $dom$2.getElementAsNode(sibling.parentElement) : undefined;
                                        if (label && label.visible && label.pageFlow) {
                                            if ($util$6.hasValue(sibling.htmlFor) && sibling.htmlFor === element.id) {
                                                label.android('labelFor', node.documentId);
                                                return true;
                                            }
                                            else if (label.textElement && labelParent) {
                                                labelParent.android('labelFor', node.documentId);
                                                return true;
                                            }
                                        }
                                    }
                                    return false;
                                });
                            }
                        case CONTAINER_ANDROID.SELECT:
                        case CONTAINER_ANDROID.CHECKBOX:
                        case CONTAINER_ANDROID.RADIO:
                        case CONTAINER_ANDROID.BUTTON:
                            if (element.readOnly) {
                                node.android('focusable', 'false');
                            }
                            if (element.disabled) {
                                node.android('enabled', 'false');
                            }
                            break;
                    }
                }
            }
        }
    }

    var $Layout = squared.base.Layout;
    const $const = squared.base.lib.constant;
    const $enum$3 = squared.base.lib.enumeration;
    const $element$1 = squared.lib.element;
    const $util$7 = squared.lib.util;
    function getRowData(mainData, direction) {
        const result = [];
        if (direction === 'column') {
            for (let i = 0; i < mainData.column.count; i++) {
                result[i] = [];
                for (let j = 0; j < mainData.row.count; j++) {
                    result[i].push(mainData.rowData[j][i]);
                }
            }
        }
        else {
            for (let i = 0; i < mainData.row.count; i++) {
                result.push(mainData.rowData[i]);
            }
        }
        return result;
    }
    function getGridSize(mainData, direction, node) {
        const dimension = direction === 'column' ? 'width' : 'height';
        let value = 0;
        for (let i = 0; i < mainData[direction].count; i++) {
            const unit = mainData[direction].unit[i];
            if (unit.endsWith('px')) {
                value += parseInt(unit);
            }
            else {
                let size = 0;
                $util$7.captureMap(mainData.rowData[i], item => item && item.length > 0, item => size = Math.min(size, item[0].bounds[dimension]));
                value += size;
            }
        }
        value += (mainData[direction].count - 1) * mainData[direction].gap;
        return node[dimension] - value;
    }
    function setContentSpacing(mainData, node, alignment, direction) {
        const MARGIN_START = direction === 'column' ? 16 /* MARGIN_LEFT */ : 2 /* MARGIN_TOP */;
        const MARGIN_END = direction === 'column' ? 4 /* MARGIN_RIGHT */ : 8 /* MARGIN_BOTTOM */;
        const PADDING_START = direction === 'column' ? 256 /* PADDING_LEFT */ : 32 /* PADDING_TOP */;
        const data = mainData[direction];
        const rowData = alignment.startsWith('space') ? getRowData(mainData, direction) : [];
        const sizeTotal = getGridSize(mainData, direction, node);
        if (sizeTotal > 0) {
            const dimension = direction === 'column' ? 'width' : 'height';
            const itemCount = mainData[direction].count;
            const adjusted = new Set();
            switch (alignment) {
                case 'center':
                    node.modifyBox(PADDING_START, Math.floor(sizeTotal / 2));
                    data.normal = false;
                    break;
                case 'right':
                    if (direction === 'row') {
                        break;
                    }
                case 'end':
                case 'flex-end':
                    node.modifyBox(PADDING_START, sizeTotal);
                    data.normal = false;
                    break;
                case 'space-around': {
                    const marginSize = Math.floor(sizeTotal / (itemCount * 2));
                    for (let i = 0; i < itemCount; i++) {
                        for (const item of new Set($util$7.flatArray(rowData[i]))) {
                            if (!adjusted.has(item)) {
                                item.modifyBox(MARGIN_START, marginSize);
                                if (i < itemCount - 1) {
                                    item.modifyBox(MARGIN_END, marginSize);
                                }
                                adjusted.add(item);
                            }
                            else {
                                item.cssPX(dimension, marginSize * 2);
                            }
                        }
                    }
                    data.normal = false;
                    break;
                }
                case 'space-between': {
                    const marginSize = Math.floor(sizeTotal / ((itemCount - 1) * 2));
                    const rowLast = $util$7.flatArray(rowData[itemCount - 1]);
                    for (let i = 0; i < itemCount; i++) {
                        for (const item of new Set($util$7.flatArray(rowData[i]))) {
                            if (!adjusted.has(item)) {
                                if (i > 0) {
                                    item.modifyBox(MARGIN_START, marginSize);
                                }
                                if (i < itemCount - 1 && !rowLast.some(cell => cell === item)) {
                                    item.modifyBox(MARGIN_END, marginSize);
                                }
                                adjusted.add(item);
                            }
                            else {
                                item.cssPX(dimension, marginSize * 2);
                            }
                        }
                    }
                    data.normal = false;
                    break;
                }
                case 'space-evenly': {
                    const marginSize = Math.floor(sizeTotal / (itemCount + 1));
                    const rowLast = $util$7.flatArray(rowData[itemCount - 1]);
                    for (let i = 0; i < itemCount; i++) {
                        const marginMiddle = Math.floor(marginSize / 2);
                        for (const item of new Set($util$7.flatArray(rowData[i]))) {
                            if (!adjusted.has(item)) {
                                item.modifyBox(MARGIN_START, i === 0 ? marginSize : marginMiddle);
                                if (i < itemCount - 1 && !rowLast.some(cell => cell === item)) {
                                    item.modifyBox(MARGIN_END, marginMiddle);
                                }
                                adjusted.add(item);
                            }
                            else {
                                item.cssPX(dimension, marginSize);
                            }
                        }
                    }
                    data.normal = false;
                    break;
                }
            }
        }
    }
    class CssGrid extends squared.base.extensions.CssGrid {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data($const.EXT_NAME.CSS_GRID, 'mainData');
            if (mainData) {
                const layout = new $Layout(parent, node, CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */, node.children);
                layout.rowCount = mainData.row.count;
                layout.columnCount = mainData.column.count;
                return {
                    output: this.application.renderNode(layout),
                    complete: true
                };
            }
            return undefined;
        }
        processChild(node, parent) {
            const mainData = parent.data($const.EXT_NAME.CSS_GRID, 'mainData');
            const cellData = node.data($const.EXT_NAME.CSS_GRID, 'cellData');
            let outputAs;
            let container;
            if (mainData && cellData) {
                function applyLayout(item, direction, dimension) {
                    const data = mainData[direction];
                    const cellStart = `${direction}Start`;
                    const cellSpan = `${direction}Span`;
                    const cellTotal = cellData[cellSpan] - cellData[cellStart];
                    const minDimension = `min${$util$7.capitalize(dimension)}`;
                    let size = 0;
                    let minSize = 0;
                    let fitContent = false;
                    let minUnitSize = 0;
                    let sizeWeight = 0;
                    if (data.unit.every(value => value === 'auto')) {
                        if (dimension === 'width') {
                            data.unit = new Array(data.unit.length).fill('1fr');
                        }
                        else {
                            data.unit.length = 0;
                        }
                    }
                    for (let i = 0, j = 0; i < cellData[cellSpan]; i++) {
                        const unitMin = data.unitMin[cellData[cellStart] + i];
                        minUnitSize += parent.parseUnit(unitMin);
                        let unit = data.unit[cellData[cellStart] + i];
                        if (!$util$7.hasValue(unit)) {
                            if (data.auto[j]) {
                                unit = data.auto[j];
                                if (data.auto[j + 1]) {
                                    j++;
                                }
                            }
                            else {
                                continue;
                            }
                        }
                        if ($util$7.hasValue(unit)) {
                            if (unit === 'auto' || unit === 'min-content' || unit === 'max-content') {
                                if (cellTotal < data.unit.length && (!parent.has(dimension) || data.unit.some(value => $util$7.isLength(value)) || unit === 'min-content')) {
                                    size = node.bounds[dimension];
                                    minSize = 0;
                                    sizeWeight = 0;
                                }
                                else {
                                    size = 0;
                                    minSize = 0;
                                    sizeWeight = 0.01;
                                }
                                break;
                            }
                            else if ($util$7.isPercent(unit)) {
                                sizeWeight += parseFloat(unit) / 100;
                                minSize = size;
                                size = 0;
                            }
                            else if (unit.endsWith('fr')) {
                                sizeWeight += parseFloat(unit);
                                minSize = size;
                                size = 0;
                            }
                            else if (unit.endsWith('px')) {
                                const gap = parseFloat(unit);
                                if (minSize === 0) {
                                    size += gap;
                                }
                                else {
                                    minSize += gap;
                                }
                            }
                            if (unitMin === '0px' && node.textElement) {
                                fitContent = true;
                            }
                        }
                    }
                    if (cellData[cellSpan] > 1) {
                        const value = (cellData[cellSpan] - 1) * data.gap;
                        if (size > 0 && minSize === 0) {
                            size += value;
                        }
                        else if (minSize > 0) {
                            minSize += value;
                        }
                        if (minUnitSize > 0) {
                            minUnitSize += value;
                        }
                    }
                    if (minUnitSize > 0) {
                        if (data.autoFill && size === 0 && mainData[direction === 'column' ? 'row' : 'column'].count === 1) {
                            size = Math.max(node.actualWidth, minUnitSize);
                            sizeWeight = 0;
                        }
                        else {
                            minSize = minUnitSize;
                        }
                    }
                    item.android(`layout_${direction}`, cellData[cellStart].toString());
                    if (cellData[cellSpan] > 1) {
                        item.android(`layout_${direction}Span`, cellData[cellSpan].toString());
                    }
                    if (minSize > 0 && !item.has(minDimension)) {
                        item.css(minDimension, $util$7.formatPX(minSize), true);
                    }
                    if (sizeWeight > 0) {
                        item.android(`layout_${dimension}`, '0px');
                        item.android(`layout_${direction}Weight`, sizeWeight.toString());
                        item.mergeGravity('layout_gravity', direction === 'column' ? 'fill_horizontal' : 'fill_vertical');
                    }
                    else if (size > 0) {
                        const maxDimension = `max${$util$7.capitalize(dimension)}`;
                        if (fitContent && !item.has(maxDimension)) {
                            item.css(maxDimension, $util$7.formatPX(size), true);
                            item.mergeGravity('layout_gravity', direction === 'column' ? 'fill_horizontal' : 'fill_vertical');
                        }
                        else if (!item.has(dimension)) {
                            item.css(dimension, $util$7.formatPX(size), true);
                        }
                    }
                }
                const alignItems = node.has('alignSelf') ? node.css('alignSelf') : mainData.alignItems;
                const justifyItems = node.has('justifySelf') ? node.css('justifySelf') : mainData.justifyItems;
                if (/(start|end|center|baseline)/.test(alignItems) || /(start|end|center|baseline|left|right)/.test(justifyItems)) {
                    container = this.application.createNode($element$1.createElement(node.actualParent ? node.actualParent.element : null));
                    container.tagName = node.tagName;
                    container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    container.inherit(node, 'initial', 'base');
                    container.resetBox(30 /* MARGIN */ | 480 /* PADDING */);
                    container.exclude({
                        procedure: $enum$3.NODE_PROCEDURE.AUTOFIT | $enum$3.NODE_PROCEDURE.CUSTOMIZATION,
                        resource: $enum$3.NODE_RESOURCE.BOX_STYLE | $enum$3.NODE_RESOURCE.ASSET
                    });
                    parent.appendTry(node, container);
                    container.render(parent);
                    this.application.processing.cache.append(container, false);
                    node.inheritBox(30 /* MARGIN */, container);
                    applyLayout(container, 'column', 'width');
                    applyLayout(container, 'row', 'height');
                    let inlineWidth = false;
                    if (justifyItems.endsWith('start') || justifyItems.endsWith('left') || justifyItems.endsWith('baseline')) {
                        node.mergeGravity('layout_gravity', 'left');
                        inlineWidth = true;
                    }
                    else if (justifyItems.endsWith('end') || justifyItems.endsWith('right')) {
                        node.mergeGravity('layout_gravity', 'right');
                        inlineWidth = true;
                    }
                    else if (justifyItems.endsWith('center')) {
                        node.mergeGravity('layout_gravity', 'center_horizontal');
                        inlineWidth = true;
                    }
                    if (!node.hasWidth) {
                        node.android('layout_width', inlineWidth ? 'wrap_content' : 'match_parent', false);
                    }
                    if (alignItems.endsWith('start') || alignItems.endsWith('baseline')) {
                        node.mergeGravity('layout_gravity', 'top');
                    }
                    else if (alignItems.endsWith('end')) {
                        node.mergeGravity('layout_gravity', 'bottom');
                    }
                    else if (alignItems.endsWith('center')) {
                        node.mergeGravity('layout_gravity', 'center_vertical');
                    }
                    else if (!node.hasHeight) {
                        node.android('layout_height', 'match_parent', false);
                    }
                    node.parent = container;
                    outputAs = this.application.renderNode(new $Layout(parent, container, CONTAINER_NODE.FRAME, 2048 /* SINGLE */, container.children));
                }
                const target = container || node;
                applyLayout(target, 'column', 'width');
                applyLayout(target, 'row', 'height');
                if (!target.has('height')) {
                    if (parent.hasHeight) {
                        target.android('layout_height', '0px');
                        target.android('layout_rowWeight', '1');
                    }
                    target.mergeGravity('layout_gravity', 'fill_vertical');
                }
                if (!target.has('width')) {
                    target.mergeGravity('layout_gravity', 'fill_horizontal');
                }
            }
            return {
                parent: container,
                renderAs: container,
                outputAs
            };
        }
        postBaseLayout(node) {
            const mainData = node.data($const.EXT_NAME.CSS_GRID, 'mainData');
            if (mainData) {
                if (node.hasWidth && mainData.justifyContent !== 'normal') {
                    setContentSpacing(mainData, node, mainData.justifyContent, 'column');
                }
                if (node.hasHeight && mainData.alignContent !== 'normal') {
                    setContentSpacing(mainData, node, mainData.alignContent, 'row');
                }
                if (mainData.column.normal && !mainData.column.unit.includes('auto')) {
                    const columnGap = mainData.column.gap * (mainData.column.count - 1);
                    if (columnGap > 0) {
                        if (node.renderParent && !node.renderParent.hasAlign(4 /* AUTO_LAYOUT */)) {
                            node.cssPX('minWidth', columnGap);
                            node.cssPX('width', columnGap, false, true);
                        }
                        if (!node.has('width') && node.has('maxWidth')) {
                            node.css('width', $util$7.formatPX(node.actualWidth + columnGap), true);
                        }
                    }
                }
            }
        }
        postProcedure(node) {
            const mainData = node.data($const.EXT_NAME.CSS_GRID, 'mainData');
            if (mainData) {
                const controller = this.application.controllerHandler;
                const lastChild = Array.from(mainData.children)[mainData.children.size - 1];
                if (mainData.column.unit.length && mainData.column.unit.every(value => $util$7.isPercent(value))) {
                    const percentTotal = mainData.column.unit.reduce((a, b) => a + parseFloat(b), 0);
                    if (percentTotal < 100) {
                        node.android('columnCount', (mainData.column.count + 1).toString());
                        for (let i = 0; i < mainData.row.count; i++) {
                            controller.addAfterOutsideTemplate(lastChild.id, controller.renderSpace($util$7.formatPercent(100 - percentTotal), 'wrap_content', 0, 0, createViewAttribute({
                                android: {
                                    [node.localizeString(BOX_ANDROID.MARGIN_LEFT)]: $util$7.formatPX(mainData.column.gap),
                                    layout_row: i.toString(),
                                    layout_column: mainData.column.count.toString()
                                }
                            })));
                        }
                    }
                }
                for (let i = 0; i < mainData.emptyRows.length; i++) {
                    const item = mainData.emptyRows[i];
                    if (item) {
                        for (let j = 0; j < item.length; j++) {
                            if (item[j] === 1) {
                                controller.addAfterOutsideTemplate(lastChild.id, controller.renderSpace('wrap_content', $util$7.formatPX(mainData.row.gap), 0, 0, createViewAttribute({
                                    android: {
                                        layout_row: i.toString(),
                                        layout_column: j.toString()
                                    }
                                })));
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    class External extends squared.base.extensions.External {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
    }

    var $Layout$1 = squared.base.Layout;
    var $NodeList$2 = squared.base.NodeList;
    const $const$1 = squared.base.lib.constant;
    const $enum$4 = squared.base.lib.enumeration;
    const $util$8 = squared.lib.util;
    const CHAIN_MAP = {
        leftTop: ['left', 'top'],
        rightBottom: ['right', 'bottom'],
        rightLeftBottomTop: ['rightLeft', 'bottomTop'],
        leftRightTopBottom: ['leftRight', 'topBottom'],
        widthHeight: ['Width', 'Height'],
        horizontalVertical: ['Horizontal', 'Vertical']
    };
    class Flexbox extends squared.base.extensions.Flexbox {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data($const$1.EXT_NAME.FLEXBOX, 'mainData');
            const layout = new $Layout$1(parent, node, 0, 4 /* AUTO_LAYOUT */);
            layout.itemCount = node.length;
            layout.rowCount = mainData.rowCount;
            layout.columnCount = mainData.columnCount;
            if (node.find(item => !item.pageFlow) !== undefined || mainData.rowDirection && (mainData.rowCount === 1 || node.hasHeight) || mainData.columnDirection && mainData.columnCount === 1) {
                layout.containerType = CONTAINER_NODE.CONSTRAINT;
            }
            else {
                layout.setType(CONTAINER_NODE.LINEAR, mainData.columnDirection ? 8 /* HORIZONTAL */ : 16 /* VERTICAL */);
            }
            return {
                output: this.application.renderNode(layout),
                complete: true
            };
        }
        processChild(node, parent) {
            if (node.hasAlign(128 /* SEGMENTED */)) {
                return {
                    output: this.application.renderNode(new $Layout$1(parent, node, CONTAINER_NODE.CONSTRAINT, 4 /* AUTO_LAYOUT */, node.children)),
                    complete: true
                };
            }
            return undefined;
        }
        postBaseLayout(node) {
            const mainData = node.data($const$1.EXT_NAME.FLEXBOX, 'mainData');
            if (mainData) {
                const chainHorizontal = [];
                const chainVertical = [];
                const basicHorizontal = [];
                const basicVertical = [];
                if (mainData.wrap) {
                    let previous;
                    node.each((item) => {
                        if (item.hasAlign(128 /* SEGMENTED */)) {
                            const pageFlow = item.renderFilter(child => child.pageFlow);
                            if (mainData.rowDirection) {
                                item.android('layout_width', 'match_parent');
                                if (node.hasHeight) {
                                    item.android('layout_height', '0px');
                                    item.app('layout_constraintVertical_weight', '1');
                                }
                                chainHorizontal.push(pageFlow);
                                basicVertical.push(item);
                            }
                            else {
                                item.android('layout_height', 'match_parent');
                                chainVertical.push(pageFlow);
                                if (previous) {
                                    let largest = previous[0];
                                    for (let j = 1; j < previous.length; j++) {
                                        if (previous[j].linear.right > largest.linear.right) {
                                            largest = previous[j];
                                        }
                                    }
                                    const offset = item.linear.left - largest.actualRight();
                                    if (offset > 0) {
                                        item.modifyBox(16 /* MARGIN_LEFT */, offset);
                                    }
                                    item.constraint.horizontal = true;
                                }
                                basicHorizontal.push(item);
                                previous = pageFlow;
                            }
                        }
                    });
                    if (node.is(CONTAINER_NODE.LINEAR)) {
                        if (mainData.columnDirection && mainData.wrapReverse) {
                            node.mergeGravity('gravity', 'right');
                        }
                    }
                    else {
                        if (basicVertical.length) {
                            chainVertical.push(basicVertical);
                        }
                        if (basicHorizontal.length) {
                            chainHorizontal.push(basicHorizontal);
                        }
                    }
                }
                else {
                    if (mainData.rowDirection) {
                        if (mainData.directionReverse) {
                            chainHorizontal[0] = mainData.children.reverse();
                        }
                        else {
                            chainHorizontal[0] = mainData.children;
                        }
                    }
                    else {
                        if (!node.hasHeight) {
                            node.android('layout_height', 'match_parent');
                        }
                        if (mainData.directionReverse) {
                            chainVertical[0] = mainData.children.reverse();
                        }
                        else {
                            chainVertical[0] = mainData.children;
                        }
                    }
                }
                [chainHorizontal, chainVertical].forEach((partition, index) => {
                    const horizontal = index === 0;
                    const inverse = horizontal ? 1 : 0;
                    for (const seg of partition) {
                        const HW = CHAIN_MAP.widthHeight[inverse];
                        const HWL = HW.toLowerCase();
                        const LT = CHAIN_MAP.leftTop[index];
                        const TL = CHAIN_MAP.leftTop[inverse];
                        const RB = CHAIN_MAP.rightBottom[index];
                        const BR = CHAIN_MAP.rightBottom[inverse];
                        let maxSize = Number.NEGATIVE_INFINITY;
                        $util$8.captureMap(seg, item => !item.flexElement, item => maxSize = Math.max(maxSize, item.bounds[HW.toLowerCase()]));
                        let baseline;
                        for (let i = 0; i < seg.length; i++) {
                            const chain = seg[i];
                            const previous = seg[i - 1];
                            const next = seg[i + 1];
                            if (next) {
                                chain.anchor(CHAIN_MAP.rightLeftBottomTop[index], next.documentId);
                            }
                            if (previous) {
                                chain.anchor(CHAIN_MAP.leftRightTopBottom[index], previous.documentId);
                            }
                            if (seg !== basicHorizontal && seg !== basicVertical) {
                                switch (chain.flexbox.alignSelf) {
                                    case 'start':
                                    case 'flex-start':
                                        chain.anchor(TL, 'parent');
                                        break;
                                    case 'end':
                                    case 'flex-end':
                                        chain.anchor(BR, 'parent');
                                        break;
                                    case 'baseline':
                                        if (horizontal) {
                                            if (baseline === undefined) {
                                                baseline = $NodeList$2.baseline(seg)[0];
                                            }
                                            if (baseline) {
                                                if (chain !== baseline) {
                                                    chain.anchor('baseline', baseline.documentId);
                                                    chain.constraint.vertical = true;
                                                }
                                                else {
                                                    chain.anchor('top', 'parent');
                                                }
                                            }
                                        }
                                        break;
                                    case 'center':
                                        chain.anchorParent(horizontal ? AXIS_ANDROID.VERTICAL : AXIS_ANDROID.HORIZONTAL);
                                        break;
                                    default:
                                        chain.anchor(mainData.wrapReverse ? BR : TL, 'parent');
                                        if (!chain[`has${HW}`] && !chain.has(HWL, 32 /* PERCENT */)) {
                                            const initial = chain.unsafe('initial');
                                            if (initial.bounds && initial.bounds[HWL] < maxSize) {
                                                chain.android(`layout_${HW.toLowerCase()}`, '0px');
                                                chain.anchor(mainData.wrapReverse ? TL : BR, 'parent');
                                            }
                                        }
                                        break;
                                }
                                Controller.setFlexDimension(chain, horizontal);
                            }
                            if (!horizontal) {
                                chain.anchorParent(AXIS_ANDROID.HORIZONTAL);
                            }
                            chain.positioned = true;
                        }
                        const HV = CHAIN_MAP.horizontalVertical[index];
                        const chainStart = seg[0];
                        const chainEnd = seg[seg.length - 1];
                        const chainStyle = `layout_constraint${HV}_chainStyle`;
                        chainStart.anchor(LT, 'parent');
                        chainEnd.anchor(RB, 'parent');
                        if (seg.every(item => item.flexbox.grow < 1)) {
                            switch (mainData.justifyContent) {
                                case 'left':
                                    if (!horizontal) {
                                        break;
                                    }
                                case 'start':
                                case 'flex-start':
                                    chainStart.app(chainStyle, 'packed');
                                    chainStart.app(`layout_constraint${HV}_bias`, '0');
                                    break;
                                case 'center':
                                    chainStart.app(chainStyle, 'packed');
                                    chainStart.app(`layout_constraint${HV}_bias`, '0.5');
                                    break;
                                case 'right':
                                    if (!horizontal) {
                                        break;
                                    }
                                case 'end':
                                case 'flex-end':
                                    chainStart.app(chainStyle, 'packed');
                                    chainStart.app(`layout_constraint${HV}_bias`, '1');
                                    break;
                                case 'space-between':
                                    chainStart.app(chainStyle, 'spread_inside');
                                    break;
                                case 'space-evenly':
                                    chainStart.app(chainStyle, 'spread');
                                    for (const item of seg) {
                                        item.app(`layout_constraint${HV}_weight`, (item.flexbox.grow || 1).toString());
                                    }
                                    break;
                                case 'space-around':
                                    const controller = this.application.controllerHandler;
                                    const orientation = HV.toLowerCase();
                                    chainStart.app(chainStyle, 'spread_inside');
                                    chainStart.constraint[orientation] = false;
                                    chainEnd.constraint[orientation] = false;
                                    controller.addGuideline(chainStart, chainStart.parent, orientation, true, false);
                                    controller.addGuideline(chainEnd, chainStart.parent, orientation, true, true);
                                    break;
                            }
                        }
                        if (seg.length > 1 && (horizontal && $util$8.withinRange(node.box.left, chainStart.linear.left) && $util$8.withinRange(chainEnd.linear.right, node.box.right) || !horizontal && $util$8.withinRange(node.box.top, chainStart.linear.top) && $util$8.withinRange(chainEnd.linear.bottom, node.box.bottom))) {
                            chainStart.app(chainStyle, 'spread_inside', false);
                        }
                        else {
                            chainStart.app(chainStyle, 'packed', false);
                            chainStart.app(`layout_constraint${HV}_bias`, mainData.directionReverse ? '1' : '0', false);
                        }
                    }
                });
            }
        }
    }

    var $Layout$2 = squared.base.Layout;
    const $const$2 = squared.base.lib.constant;
    const $enum$5 = squared.base.lib.enumeration;
    const $util$9 = squared.lib.util;
    function transferData(parent, siblings) {
        let destination;
        for (let i = 0; i < siblings.length; i++) {
            const item = siblings[i];
            if (destination) {
                const source = item.data($const$2.EXT_NAME.GRID, 'cellData');
                if (source) {
                    for (const attr in source) {
                        switch (typeof source[attr]) {
                            case 'number':
                                destination[attr] += source[attr];
                                break;
                            case 'boolean':
                                if (source[attr] === true) {
                                    destination[attr] = true;
                                }
                                break;
                        }
                    }
                }
            }
            else {
                destination = item.data($const$2.EXT_NAME.GRID, 'cellData');
            }
            item.siblingIndex = i;
            item.data($const$2.EXT_NAME.GRID, 'cellData', null);
        }
        parent.data($const$2.EXT_NAME.GRID, 'cellData', destination);
    }
    class Grid extends squared.base.extensions.Grid {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data($const$2.EXT_NAME.GRID, 'mainData');
            if (mainData) {
                const layout = new $Layout$2(parent, node, CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */, node.children);
                layout.columnCount = mainData.columnCount;
                return {
                    output: this.application.renderNode(layout),
                    complete: true
                };
            }
            return undefined;
        }
        processChild(node, parent) {
            const mainData = parent.data($const$2.EXT_NAME.GRID, 'mainData');
            const cellData = node.data($const$2.EXT_NAME.GRID, 'cellData');
            if (mainData && cellData) {
                if (cellData.rowSpan > 1) {
                    node.android('layout_rowSpan', cellData.rowSpan.toString());
                }
                if (cellData.columnSpan > 1) {
                    node.android('layout_columnSpan', cellData.columnSpan.toString());
                }
                if (node.display === 'table-cell') {
                    node.mergeGravity('layout_gravity', 'fill');
                }
                const siblings = cellData.siblings && cellData.siblings.length ? cellData.siblings.slice(0) : undefined;
                if (siblings) {
                    const controller = this.application.controllerHandler;
                    siblings.unshift(node);
                    let layout = new $Layout$2(parent, node, 0, 0, siblings);
                    if (layout.linearY) {
                        layout.node = controller.createNodeGroup(node, siblings, parent);
                        layout.setType(CONTAINER_NODE.LINEAR, 16 /* VERTICAL */);
                    }
                    else {
                        layout = controller.processTraverseHorizontal(layout).layout;
                    }
                    if (layout.containerType !== 0) {
                        transferData(layout.node, siblings);
                        return {
                            parent: layout.node,
                            renderAs: layout.node,
                            outputAs: this.application.renderNode(layout),
                            complete: true
                        };
                    }
                }
            }
            return undefined;
        }
        postBaseLayout(node) {
            if (!(node.tableElement && node.css('borderCollapse') === 'collapse')) {
                const mainData = node.data($const$2.EXT_NAME.GRID, 'mainData');
                if (mainData) {
                    node.renderEach(item => {
                        const cellData = item.data($const$2.EXT_NAME.GRID, 'cellData');
                        if (cellData) {
                            const actualParent = item.actualParent;
                            if (actualParent && !actualParent.visible) {
                                if (cellData.cellStart) {
                                    mainData.paddingTop = actualParent.paddingTop + actualParent.marginTop;
                                }
                                if (cellData.rowStart) {
                                    mainData.paddingLeft = Math.max(actualParent.marginLeft + actualParent.paddingLeft, mainData.paddingLeft);
                                }
                                if (cellData.rowEnd) {
                                    const heightBottom = actualParent.marginBottom + actualParent.paddingBottom + (cellData.cellEnd ? 0 : actualParent.marginTop + actualParent.paddingTop);
                                    if (heightBottom > 0) {
                                        if (cellData.cellEnd) {
                                            mainData.paddingBottom = heightBottom;
                                        }
                                        else {
                                            const controller = this.application.controllerHandler;
                                            controller.addAfterOutsideTemplate(item.id, controller.renderSpace('match_parent', $util$9.formatPX(heightBottom), mainData.columnCount));
                                        }
                                    }
                                    mainData.paddingRight = Math.max(actualParent.marginRight + actualParent.paddingRight, mainData.paddingRight);
                                }
                            }
                        }
                    });
                }
                node.modifyBox(32 /* PADDING_TOP */, mainData.paddingTop);
                node.modifyBox(64 /* PADDING_RIGHT */, mainData.paddingRight);
                node.modifyBox(128 /* PADDING_BOTTOM */, mainData.paddingBottom);
                node.modifyBox(256 /* PADDING_LEFT */, mainData.paddingLeft);
            }
            if (!node.hasWidth) {
                let maxRight = Number.NEGATIVE_INFINITY;
                $util$9.captureMap(node.renderChildren, item => item.inlineFlow || !item.blockStatic, item => maxRight = Math.max(maxRight, item.linear.right));
                if ($util$9.withinRange(node.box.right, maxRight)) {
                    node.android('layout_width', 'wrap_content');
                }
            }
        }
    }

    var $Layout$3 = squared.base.Layout;
    var $NodeList$3 = squared.base.NodeList;
    const $const$3 = squared.base.lib.constant;
    const $enum$6 = squared.base.lib.enumeration;
    const $css$2 = squared.lib.css;
    const $element$2 = squared.lib.element;
    const $util$a = squared.lib.util;
    class List extends squared.base.extensions.List {
        processNode(node, parent) {
            super.processNode(node, parent);
            const layout = new $Layout$3(parent, node, 0, 0, node.children);
            if (layout.linearY) {
                layout.rowCount = node.length;
                layout.columnCount = node.some(item => item.css('listStylePosition') === 'inside') ? 3 : 2;
                layout.setType(CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */);
            }
            else if (this.application.controllerHandler.checkRelativeHorizontal(layout)) {
                layout.rowCount = 1;
                layout.columnCount = layout.length;
                layout.setType(CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */);
            }
            if (layout.containerType !== 0) {
                return {
                    output: this.application.renderNode(layout),
                    complete: true
                };
            }
            return undefined;
        }
        processChild(node, parent) {
            const mainData = node.data($const$3.EXT_NAME.LIST, 'mainData');
            if (mainData) {
                const controller = this.application.controllerHandler;
                const parentLeft = parent.paddingLeft + parent.marginLeft;
                let paddingLeft = node.marginLeft;
                let columnCount = 0;
                node.modifyBox(16 /* MARGIN_LEFT */, null);
                if (parent.is(CONTAINER_NODE.GRID)) {
                    columnCount = $util$a.convertInt(parent.android('columnCount'));
                    paddingLeft += parentLeft;
                }
                else if (parent.item(0) === node) {
                    paddingLeft += parentLeft;
                }
                let ordinal = mainData.ordinal === '' ? node.find(item => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft) : undefined;
                if (ordinal) {
                    const layout = new $Layout$3(parent, ordinal);
                    if (ordinal.inlineText || ordinal.length === 0) {
                        layout.containerType = CONTAINER_NODE.TEXT;
                    }
                    else {
                        layout.retain(ordinal.children);
                        if (controller.checkRelativeHorizontal(layout)) {
                            layout.setType(CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */);
                        }
                        else {
                            layout.setType(CONTAINER_NODE.CONSTRAINT, 2 /* UNKNOWN */);
                        }
                    }
                    ordinal.parent = parent;
                    ordinal.render(parent);
                    if (columnCount === 3) {
                        node.android('layout_columnSpan', '2');
                    }
                    paddingLeft += ordinal.marginLeft;
                    if (paddingLeft > 0 && !ordinal.hasWidth) {
                        ordinal.android('minWidth', $util$a.formatPX(paddingLeft));
                    }
                    ordinal.modifyBox(16 /* MARGIN_LEFT */, null);
                    this.application.addRenderTemplate(parent, ordinal, this.application.renderNode(layout));
                }
                else {
                    const columnWeight = columnCount > 0 ? '0' : '';
                    const inside = node.css('listStylePosition') === 'inside';
                    let gravity = '';
                    let image;
                    let top;
                    let left;
                    if (mainData.imageSrc !== '') {
                        if (mainData.imagePosition) {
                            const position = $css$2.getBackgroundPosition(mainData.imagePosition, node.actualDimension, node.fontSize);
                            top = position.top;
                            left = position.left;
                        }
                        else {
                            gravity = 'right';
                        }
                        image = Resource.addImageUrl(mainData.imageSrc);
                    }
                    else if (parentLeft > 0 || node.marginLeft > 0) {
                        gravity = 'right';
                    }
                    if (gravity === '') {
                        paddingLeft += node.paddingLeft;
                        node.modifyBox(256 /* PADDING_LEFT */, null);
                    }
                    const paddingRight = (paddingLeft * 0.2) / (image ? 2 : 1);
                    let minWidth = paddingLeft;
                    const options = createViewAttribute({
                        android: {
                            layout_columnWeight: columnWeight
                        }
                    });
                    const element = $element$2.createElement(node.actualParent ? node.actualParent.element : null);
                    ordinal = this.application.createNode(element);
                    if (inside) {
                        controller.addBeforeOutsideTemplate(ordinal.id, controller.renderNodeStatic(CONTAINER_ANDROID.SPACE, {
                            android: {
                                minWidth: $util$a.formatPX(minWidth),
                                layout_columnWeight: columnWeight
                            }
                        }));
                        minWidth = 24;
                    }
                    else if (columnCount === 3) {
                        node.android('layout_columnSpan', '2');
                    }
                    if (node.tagName === 'DT' && !image) {
                        node.android('layout_columnSpan', columnCount.toString());
                    }
                    else {
                        ordinal.tagName = `${node.tagName}_ORDINAL`;
                        if (image) {
                            Object.assign(options.android, {
                                src: `@drawable/${image}`,
                                scaleType: !inside && gravity === 'right' ? 'fitEnd' : 'fitStart'
                            });
                            ordinal.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                            if (left) {
                                minWidth = Math.max(0, minWidth - left);
                            }
                        }
                        else if (mainData.ordinal !== '') {
                            element.innerHTML = mainData.ordinal;
                            ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                        }
                        else {
                            ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                        }
                        ordinal.inherit(node, 'textStyle');
                        ordinal.cssApply({
                            minWidth: $util$a.formatPX(minWidth),
                            marginTop: node.marginTop !== 0 ? $util$a.formatPX(node.marginTop) : '',
                            paddingTop: node.paddingTop > 0 ? $util$a.formatPX(node.paddingTop) : '',
                            paddingRight: gravity === 'right' ? $util$a.formatPX(paddingRight) : '',
                            paddingLeft: gravity === '' && !image ? $util$a.formatPX(paddingRight) : '',
                            fontSize: mainData.ordinal !== '' && !/[A-Za-z\d]+\./.test(mainData.ordinal) && ordinal.toInt('fontSize') > 12 ? '12px' : ''
                        });
                        if (!inside) {
                            ordinal.mergeGravity('gravity', paddingLeft > 20 ? node.localizeString(gravity) : 'center_horizontal');
                        }
                        if (top) {
                            ordinal.modifyBox(2 /* MARGIN_TOP */, top);
                        }
                        if (left) {
                            ordinal.modifyBox(16 /* MARGIN_LEFT */, left);
                        }
                        ordinal.apply(options);
                        ordinal.render(parent);
                        this.application.processing.cache.append(ordinal, false);
                        this.application.addRenderTemplate(parent, ordinal, {
                            type: 1 /* XML */,
                            node: ordinal,
                            controlName: ordinal.controlName
                        });
                        node.companion = ordinal;
                    }
                }
                if (columnCount > 0) {
                    node.android('layout_width', '0px');
                    node.android('layout_columnWeight', '1');
                }
                if (node.length && node.every(item => item.baseline)) {
                    const linearData = $NodeList$3.linearData(node.children);
                    if (linearData.linearX || linearData.linearY) {
                        return {
                            output: this.application.renderNode(new $Layout$3(parent, node, CONTAINER_NODE.LINEAR, linearData.linearX ? 8 /* HORIZONTAL */ : 16 /* VERTICAL */, node.children)),
                            next: true
                        };
                    }
                }
            }
            return undefined;
        }
        postBaseLayout(node) {
            super.postBaseLayout(node);
            const columnCount = node.android('columnCount');
            for (let i = 0; i < node.renderChildren.length; i++) {
                const item = node.renderChildren[i];
                const previous = node.renderChildren[i - 1];
                let spaceHeight = 0;
                if (previous) {
                    const marginBottom = $util$a.convertInt(previous.android(BOX_ANDROID.MARGIN_BOTTOM));
                    if (marginBottom !== 0) {
                        spaceHeight += marginBottom;
                        previous.delete('android', BOX_ANDROID.MARGIN_BOTTOM);
                        previous.modifyBox(8 /* MARGIN_BOTTOM */, null);
                    }
                }
                const marginTop = $util$a.convertInt(item.android(BOX_ANDROID.MARGIN_TOP));
                if (marginTop !== 0) {
                    spaceHeight += marginTop;
                    item.delete('android', BOX_ANDROID.MARGIN_TOP);
                    item.modifyBox(2 /* MARGIN_TOP */, null);
                }
                if (spaceHeight > 0) {
                    const controller = this.application.controllerHandler;
                    const options = createViewAttribute({
                        android: {
                            layout_columnSpan: columnCount.toString()
                        }
                    });
                    controller.addBeforeOutsideTemplate(item.id, controller.renderNodeStatic(CONTAINER_ANDROID.SPACE, options, 'match_parent', $util$a.formatPX(spaceHeight)), 0);
                }
            }
        }
        postProcedure(node) {
            if (node.blockStatic && node.inlineWidth) {
                node.android('layout_width', 'match_parent');
            }
        }
    }

    class Relative extends squared.base.extensions.Relative {
    }

    var $Layout$4 = squared.base.Layout;
    const $const$4 = squared.base.lib.constant;
    const $enum$7 = squared.base.lib.enumeration;
    const $util$b = squared.lib.util;
    class Sprite extends squared.base.extensions.Sprite {
        processNode(node, parent) {
            const mainData = node.data($const$4.EXT_NAME.SPRITE, 'mainData');
            if (mainData) {
                const container = this.application.createNode(node.element);
                container.inherit(node, 'initial', 'base', 'styleMap');
                container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                container.exclude({
                    procedure: $enum$7.NODE_PROCEDURE.CUSTOMIZATION,
                    resource: $enum$7.NODE_RESOURCE.IMAGE_SOURCE
                });
                parent.appendTry(node, container);
                this.application.processing.cache.append(container, false);
                node.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                node.exclude({
                    procedure: $enum$7.NODE_PROCEDURE.AUTOFIT,
                    resource: $enum$7.NODE_RESOURCE.FONT_STYLE | $enum$7.NODE_RESOURCE.BOX_STYLE
                });
                node.cssApply({
                    position: 'static',
                    top: 'auto',
                    right: 'auto',
                    bottom: 'auto',
                    left: 'auto',
                    display: 'inline-block',
                    width: $util$b.formatPX(mainData.width),
                    height: $util$b.formatPX(mainData.height),
                    marginTop: $util$b.formatPX(mainData.position.y),
                    marginRight: '0px',
                    marginBottom: '0px',
                    marginLeft: $util$b.formatPX(mainData.position.x),
                    paddingTop: '0px',
                    paddingRight: '0px',
                    paddingBottom: '0px',
                    paddingLeft: '0px',
                    borderTopStyle: 'none',
                    borderRightStyle: 'none',
                    borderBottomStyle: 'none',
                    borderLeftStyle: 'none',
                    borderRadius: '0px',
                    backgroundPositionX: '0px',
                    backgroundPositionY: '0px',
                    backgroundColor: 'transparent'
                });
                node.unsetCache();
                node.exclude({ procedure: $enum$7.NODE_PROCEDURE.OPTIMIZATION });
                node.android('src', `@drawable/${Resource.addImage({ mdpi: mainData.uri })}`);
                node.outerParent = container;
                node.parent = container;
                return {
                    renderAs: container,
                    outputAs: this.application.renderNode(new $Layout$4(parent, container, CONTAINER_NODE.FRAME, 2048 /* SINGLE */, container.children)),
                    parent: container,
                    complete: true
                };
            }
            return undefined;
        }
    }

    class Substitute extends squared.base.extensions.Substitute {
        processNode(node, parent) {
            node.containerType = node.blockStatic ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE;
            return super.processNode(node, parent);
        }
        postProcedure(node) {
            node.apply(Resource.formatOptions(createViewAttribute(this.options[node.elementId]), this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        }
    }

    var $Layout$5 = squared.base.Layout;
    const $const$5 = squared.base.lib.constant;
    const $enum$8 = squared.base.lib.enumeration;
    const $util$c = squared.lib.util;
    class Table extends squared.base.extensions.Table {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data($const$5.EXT_NAME.TABLE, 'mainData');
            if (mainData) {
                if (mainData.columnCount > 1) {
                    let requireWidth = !!node.data($const$5.EXT_NAME.TABLE, 'expand');
                    node.each((item) => {
                        if (item.css('width') === '0px') {
                            item.android('layout_width', '0px');
                            item.android('layout_columnWeight', (item.element.colSpan || 1).toString());
                        }
                        else {
                            const expand = item.data($const$5.EXT_NAME.TABLE, 'expand');
                            const exceed = !!item.data($const$5.EXT_NAME.TABLE, 'exceed');
                            const downsized = !!item.data($const$5.EXT_NAME.TABLE, 'downsized');
                            if (typeof expand === 'boolean') {
                                if (expand) {
                                    const percent = $util$c.convertFloat(item.data($const$5.EXT_NAME.TABLE, 'percent')) / 100;
                                    if (percent > 0) {
                                        item.android('layout_width', '0px');
                                        item.android('layout_columnWeight', $util$c.trimEnd(percent.toPrecision(3), '0'));
                                        requireWidth = true;
                                    }
                                }
                                else {
                                    item.android('layout_columnWeight', '0');
                                }
                            }
                            if (downsized) {
                                if (exceed) {
                                    item.android('layout_width', '0px');
                                    item.android('layout_columnWeight', '0.01');
                                }
                                else {
                                    if (item.textElement && !/[\s\n\-]/.test(item.textContent.trim())) {
                                        item.android('maxLines', '1');
                                    }
                                    if (item.has('width') && item.toFloat('width') < item.bounds.width) {
                                        item.android('layout_width', $util$c.formatPX(item.bounds.width));
                                    }
                                }
                            }
                        }
                    });
                    if (requireWidth && !node.hasWidth) {
                        const actualWidth = node.actualWidth;
                        let parentWidth = 0;
                        node.ascend().some(item => {
                            if (item.hasWidth) {
                                parentWidth = item.bounds.width;
                                return true;
                            }
                            return false;
                        });
                        if (actualWidth >= parentWidth) {
                            node.android('layout_width', 'match_parent');
                        }
                        else {
                            node.css('width', $util$c.formatPX(actualWidth), true);
                        }
                    }
                }
                const layout = new $Layout$5(parent, node, CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */, node.children);
                layout.rowCount = mainData.rowCount;
                layout.columnCount = mainData.columnCount;
                return {
                    output: this.application.renderNode(layout),
                    complete: true
                };
            }
            return undefined;
        }
        processChild(node, parent) {
            const rowSpan = $util$c.convertInt(node.data($const$5.EXT_NAME.TABLE, 'rowSpan'));
            const columnSpan = $util$c.convertInt(node.data($const$5.EXT_NAME.TABLE, 'colSpan'));
            const spaceSpan = $util$c.convertInt(node.data($const$5.EXT_NAME.TABLE, 'spaceSpan'));
            if (rowSpan > 1) {
                node.android('layout_rowSpan', rowSpan.toString());
            }
            if (columnSpan > 1) {
                node.android('layout_columnSpan', columnSpan.toString());
            }
            node.mergeGravity('layout_gravity', 'fill');
            if (spaceSpan > 0) {
                const controller = this.application.controllerHandler;
                controller.addAfterOutsideTemplate(node.id, controller.renderSpace('wrap_content', 'wrap_content', spaceSpan));
            }
            if (parent.css('empty-cells') === 'hide' && node.actualChildren.length === 0 && node.textContent === '') {
                node.hide(true);
            }
            return undefined;
        }
        postProcedure(node) {
            const layoutWidth = $util$c.convertInt(node.android('layout_width'));
            if (layoutWidth > 0) {
                const actualWidth = node.bounds.width;
                if (actualWidth > layoutWidth) {
                    node.android('layout_width', $util$c.formatPX(actualWidth));
                }
                if (layoutWidth > 0 && node.cssInitial('width') === 'auto' && node.renderChildren.every(item => item.inlineWidth)) {
                    node.renderEach((item) => {
                        item.android('layout_width', '0px');
                        item.android('layout_columnWeight', '1');
                    });
                }
            }
        }
    }

    var $Layout$6 = squared.base.Layout;
    const $const$6 = squared.base.lib.constant;
    const $enum$9 = squared.base.lib.enumeration;
    class VerticalAlign extends squared.base.extensions.VerticalAlign {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data($const$6.EXT_NAME.VERTICAL_ALIGN, 'mainData');
            if (mainData) {
                const layout = new $Layout$6(parent, node, CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */, node.children);
                return { output: this.application.renderNode(layout) };
            }
            return undefined;
        }
    }

    class WhiteSpace extends squared.base.extensions.WhiteSpace {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
    }

    var $Layout$7 = squared.base.Layout;
    const $enum$a = squared.base.lib.enumeration;
    const $util$d = squared.lib.util;
    class Guideline extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.options = {
                circlePosition: false
            };
        }
        condition(node) {
            return this.included(node.element) && node.length > 0;
        }
        processNode(node, parent) {
            node.exclude({ procedure: $enum$a.NODE_PROCEDURE.CONSTRAINT });
            return {
                output: this.application.renderNode(new $Layout$7(parent, node, CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, node.children))
            };
        }
        afterConstraints() {
            const controller = this.application.controllerHandler;
            for (const node of this.subscribers) {
                const alignParent = new Map();
                node.each((item) => {
                    const alignment = [];
                    if ($util$d.withinRange(item.linear.left, node.box.left)) {
                        alignment.push('left');
                    }
                    if ($util$d.withinRange(item.linear.top, node.box.top)) {
                        alignment.push('top');
                    }
                    alignParent.set(item, alignment);
                });
                if (this.options.circlePosition) {
                    let leftTop = false;
                    for (const value of alignParent.values()) {
                        if (value.length === 2) {
                            leftTop = true;
                            break;
                        }
                    }
                    let anchor;
                    for (const [item, alignment] of alignParent.entries()) {
                        if (leftTop) {
                            if (alignment.length === 2) {
                                item.anchor('left', 'parent');
                                item.anchor('top', 'parent');
                                anchor = item;
                                break;
                            }
                        }
                        else {
                            if (alignment.length === 1) {
                                if (alignment.includes('left')) {
                                    item.anchor('left', 'parent');
                                    controller.addGuideline(item, node, AXIS_ANDROID.VERTICAL);
                                    anchor = item;
                                }
                                else {
                                    item.anchor('top', 'parent');
                                    controller.addGuideline(item, node, AXIS_ANDROID.HORIZONTAL);
                                    anchor = item;
                                }
                                break;
                            }
                        }
                    }
                    if (anchor === undefined) {
                        anchor = node.item(0);
                        controller.addGuideline(anchor, node);
                    }
                    node.each((item) => {
                        if (item !== anchor) {
                            const center1 = item.center;
                            const center2 = anchor.center;
                            const x = Math.abs(center1.x - center2.x);
                            const y = Math.abs(center1.y - center2.y);
                            const radius = Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
                            let degrees = Math.round(Math.atan(Math.min(x, y) / Math.max(x, y)) * (180 / Math.PI));
                            if (center1.y > center2.y) {
                                if (center1.x > center2.x) {
                                    if (x > y) {
                                        degrees += 90;
                                    }
                                    else {
                                        degrees = 180 - degrees;
                                    }
                                }
                                else {
                                    if (x > y) {
                                        degrees = 270 - degrees;
                                    }
                                    else {
                                        degrees += 180;
                                    }
                                }
                            }
                            else if (center1.y < center2.y) {
                                if (center2.x > center1.x) {
                                    if (x > y) {
                                        degrees += 270;
                                    }
                                    else {
                                        degrees = 360 - degrees;
                                    }
                                }
                                else {
                                    if (x > y) {
                                        degrees = 90 - degrees;
                                    }
                                }
                            }
                            else {
                                degrees = center1.x > center2.x ? 90 : 270;
                            }
                            item.app('layout_constraintCircle', anchor.documentId);
                            item.app('layout_constraintCircleRadius', $util$d.formatPX(radius));
                            item.app('layout_constraintCircleAngle', degrees.toString());
                        }
                    });
                }
                else {
                    for (const [item, alignment] of alignParent.entries()) {
                        if (alignment.includes('left')) {
                            item.anchor('left', 'parent');
                        }
                        if (alignment.includes('top')) {
                            item.anchor('top', 'parent');
                        }
                        if (alignment.length < 2) {
                            controller.addGuideline(item, node);
                        }
                    }
                }
            }
        }
    }

    var $Layout$8 = squared.base.Layout;
    var $NodeList$4 = squared.base.NodeList;
    const $enum$b = squared.base.lib.enumeration;
    const $util$e = squared.lib.util;
    function getFixedNodes(node) {
        return node.filter(item => !item.pageFlow && (item.position === 'fixed' || item.absoluteParent === node));
    }
    function withinBoxRegion(rect, value) {
        return rect.some(coord => coord < value);
    }
    class Fixed extends squared.base.Extension {
        condition(node) {
            const fixed = getFixedNodes(node);
            if (fixed.length) {
                const top = [];
                const right = [];
                const bottom = [];
                const left = [];
                for (const item of fixed) {
                    if (item.has('top') && item.top >= 0) {
                        top.push(item.top);
                    }
                    if (item.has('right') && item.right >= 0) {
                        right.push(item.right);
                    }
                    if (item.has('bottom') && item.bottom >= 0) {
                        bottom.push(item.bottom);
                    }
                    if (item.has('left') && item.left >= 0) {
                        left.push(item.left);
                    }
                }
                return (withinBoxRegion(top, node.paddingTop + (node.documentBody ? node.marginTop : 0)) ||
                    withinBoxRegion(right, node.paddingRight + (node.documentBody ? node.marginRight : 0)) ||
                    withinBoxRegion(bottom, node.paddingBottom + (node.documentBody ? node.marginBottom : 0)) ||
                    withinBoxRegion(left, node.paddingLeft + (node.documentBody ? node.marginLeft : 0)) ||
                    node.documentBody && right.length > 0 && node.hasWidth);
            }
            return false;
        }
        processNode(node, parent) {
            const [children, nested] = $util$e.partitionArray(getFixedNodes(node), item => item.absoluteParent === node);
            $util$e.concatArray($util$e.sortArray(children, true, 'zIndex', 'siblingIndex'), $util$e.sortArray(nested, true, 'zIndex', 'siblingIndex'));
            nested.length = 0;
            for (const item of node.duplicate()) {
                if (!children.includes(item)) {
                    nested.push(item);
                }
            }
            if (nested.length) {
                const container = this.application.controllerHandler.createNodeGroup(nested[0], nested, node);
                container.inherit(node, 'initial', 'base');
                container.exclude({
                    procedure: $enum$b.NODE_PROCEDURE.NONPOSITIONAL,
                    resource: $enum$b.NODE_RESOURCE.BOX_STYLE | $enum$b.NODE_RESOURCE.ASSET
                });
                children.push(container);
                container.innerChild = node;
                for (let i = 0; i < children.length; i++) {
                    children[i].siblingIndex = i;
                }
                node.sort($NodeList$4.siblingIndex);
                node.resetBox(480 /* PADDING */ | (node.documentBody ? 30 /* MARGIN */ : 0), container, true);
                node.outerParent = container;
                return {
                    output: this.application.renderNode(new $Layout$8(parent, node, CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, children))
                };
            }
            return undefined;
        }
        postBaseLayout(node) {
            if (node.hasWidth && node.outerParent && node.documentBody && node.some(item => item.has('right'))) {
                const width = node.cssInitial('width', true);
                const minWidth = node.cssInitial('minWidth', true);
                node.cssApply({ width: 'auto', minWidth: 'auto' }, true);
                node.outerParent.cssApply({ width, minWidth }, true);
                node.android('layout_width', 'match_parent');
            }
        }
    }

    var $Layout$9 = squared.base.Layout;
    const $enum$c = squared.base.lib.enumeration;
    class MaxWidthHeight extends squared.base.Extension {
        condition(node) {
            return !node.textElement && !node.imageElement && !node.svgElement && (node.has('maxWidth') || node.has('maxHeight'));
        }
        processNode(node, parent) {
            const container = this.application.controllerHandler.createNodeWrapper(node, parent);
            container.css('display', 'block', true);
            if (node.has('maxWidth')) {
                const maxWidth = node.css('maxWidth');
                container.cssApply({ width: maxWidth, maxWidth }, true);
            }
            if (node.has('maxHeight')) {
                const maxHeight = node.css('maxHeight');
                container.cssApply({ height: maxHeight, maxHeight }, true);
            }
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new $Layout$9(parent, container, CONTAINER_NODE.FRAME, 2048 /* SINGLE */, container.children))
            };
        }
    }

    var $Layout$a = squared.base.Layout;
    const $enum$d = squared.base.lib.enumeration;
    const $util$f = squared.lib.util;
    class Percent extends squared.base.Extension {
        condition(node, parent) {
            return parent.layoutVertical && !node.documentBody && node.pageFlow && !node.imageElement && node.has('width', 32 /* PERCENT */, { not: '100%' });
        }
        processNode(node, parent) {
            const container = this.application.controllerHandler.createNodeWrapper(node, parent);
            container.android('layout_width', 'match_parent');
            container.android('layout_height', 'wrap_content');
            if (!node.has('height', 2 /* LENGTH */)) {
                node.css('height', $util$f.formatPX(node.bounds.height), true);
            }
            node.resetBox(30 /* MARGIN */, container, true);
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new $Layout$a(parent, container, CONTAINER_NODE.CONSTRAINT, 2048 /* SINGLE */, container.children))
            };
        }
    }

    var $NodeList$5 = squared.base.NodeList;
    const $enum$e = squared.base.lib.enumeration;
    const CONTROL_NAME = 'RadioGroup';
    function getInputName(element) {
        return element.name ? element.name.trim() : '';
    }
    class RadioGroup extends squared.base.Extension {
        condition(node) {
            if (node.length > 1) {
                const inputName = new Set();
                let i = 0;
                for (let item of node) {
                    if (item.renderAs) {
                        item = item.renderAs;
                    }
                    if (item.containerType === CONTAINER_NODE.RADIO) {
                        const name = getInputName(item.element);
                        if (name !== '') {
                            inputName.add(name);
                            i++;
                        }
                    }
                }
                if (inputName.size === 1 && i > 1) {
                    const linearData = $NodeList$5.linearData(node.children);
                    if (linearData.linearX && !linearData.floated.has('right')) {
                        return true;
                    }
                }
                return false;
            }
            else {
                return node.containerType === CONTAINER_NODE.RADIO && getInputName(node.element) !== '' && !node.positioned;
            }
        }
        processNode(node, parent) {
            if (node.length) {
                node.setControlType(CONTROL_NAME, node.block ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE);
                node.mergeGravity('gravity', 'bottom');
                node.android('orientation', AXIS_ANDROID.HORIZONTAL);
                node.render(parent);
                return {
                    output: {
                        type: 1 /* XML */,
                        node,
                        controlName: CONTROL_NAME
                    },
                    complete: true
                };
            }
            else if (parent.controlName !== CONTROL_NAME) {
                const element = node.element;
                const children = [];
                const inputName = getInputName(element);
                let replacement;
                for (let item of parent.children) {
                    if (item.renderAs) {
                        if (item.renderAs === node) {
                            replacement = item;
                        }
                        item = item.renderAs;
                    }
                    if (node.containerType === CONTAINER_NODE.RADIO && getInputName(item.element) === inputName && !item.rendered) {
                        children.push(item);
                    }
                }
                if (children.length > 1) {
                    const container = this.application.controllerHandler.createNodeGroup(node, children, parent, replacement);
                    container.alignmentType |= 8 /* HORIZONTAL */ | (parent.length !== children.length ? 128 /* SEGMENTED */ : 0);
                    if (parent.layoutConstraint) {
                        container.companion = replacement || node;
                    }
                    container.setControlType(CONTROL_NAME, CONTAINER_NODE.INLINE);
                    container.inherit(node, 'alignment');
                    container.css('verticalAlign', 'text-bottom');
                    container.exclude({ resource: $enum$e.NODE_RESOURCE.ASSET });
                    container.each((item, index) => {
                        if (item !== node) {
                            item.setControlType(CONTAINER_ANDROID.RADIO, CONTAINER_NODE.RADIO);
                        }
                        item.positioned = true;
                        item.siblingIndex = index;
                    });
                    container.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent);
                    container.android('orientation', $NodeList$5.linearData(children).linearX ? AXIS_ANDROID.HORIZONTAL : AXIS_ANDROID.VERTICAL);
                    this.subscribers.add(container);
                    return {
                        renderAs: container,
                        outputAs: {
                            type: 1 /* XML */,
                            node: container,
                            controlName: CONTROL_NAME
                        },
                        parent: container,
                        complete: true
                    };
                }
            }
            return undefined;
        }
        postBaseLayout(node) {
            node.some((item) => {
                if (item.element && item.element.checked) {
                    node.android('checkedButton', item.documentId);
                    return true;
                }
                return false;
            });
        }
    }

    const $enum$f = squared.base.lib.enumeration;
    const $element$3 = squared.lib.element;
    const SCROLL_HORIZONTAL = 'HorizontalScrollView';
    const SCROLL_VERTICAL = 'android.support.v4.widget.NestedScrollView';
    class ScrollBar extends squared.base.Extension {
        condition(node) {
            return node.length > 0 && (node.overflowX ||
                node.overflowY ||
                this.included(node.element) && (node.hasWidth || node.hasHeight));
        }
        processNode(node, parent) {
            const overflow = [];
            const scrollView = [];
            if (node.overflowX && node.overflowY) {
                overflow.push(SCROLL_HORIZONTAL, SCROLL_VERTICAL);
            }
            else if (node.overflowX) {
                overflow.push(SCROLL_HORIZONTAL);
            }
            else if (node.overflowY) {
                overflow.push(SCROLL_VERTICAL);
            }
            else {
                let overflowType = 0;
                if (node.hasWidth) {
                    overflowType |= 8 /* HORIZONTAL */;
                    overflow.push(SCROLL_HORIZONTAL);
                }
                if (node.hasHeight) {
                    overflowType |= 16 /* VERTICAL */;
                    overflow.push(SCROLL_VERTICAL);
                }
                node.overflow = overflowType;
            }
            for (let i = 0; i < overflow.length; i++) {
                const container = this.application.createNode(i === 0 ? node.element : $element$3.createElement(node.actualParent ? node.actualParent.element : null, node.block));
                container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                if (i === 0) {
                    container.inherit(node, 'initial', 'base', 'styleMap');
                    parent.appendTry(node, container);
                }
                else {
                    container.inherit(node, 'base');
                    container.exclude({ resource: $enum$f.NODE_RESOURCE.BOX_STYLE });
                }
                container.exclude({ resource: $enum$f.NODE_RESOURCE.ASSET });
                container.resetBox(480 /* PADDING */);
                scrollView.push(container);
            }
            for (let i = 0; i < scrollView.length; i++) {
                const item = scrollView[i];
                const previous = scrollView[i - 1];
                switch (item.controlName) {
                    case SCROLL_VERTICAL: {
                        const value = node.css('height');
                        node.android('layout_width', 'wrap_content');
                        item.android('layout_height', node.convertPX(value, false));
                        item.cssApply({
                            overflow: 'scroll visible',
                            overflowX: 'visible',
                            overflowY: 'scroll'
                        });
                        break;
                    }
                    case SCROLL_HORIZONTAL: {
                        const value = node.css('width');
                        item.android('layout_width', node.convertPX(value));
                        node.android('layout_height', 'wrap_content');
                        item.cssApply({
                            overflow: 'visible scroll',
                            overflowX: 'scroll',
                            overflowY: 'visible'
                        });
                        break;
                    }
                }
                item.render(i === 0 ? (!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent) : previous);
                item.unsetCache();
                this.application.addRenderTemplate((item.renderParent || parent), item, {
                    type: 1 /* XML */,
                    node: item,
                    controlName: item.controlName
                });
                this.application.processing.cache.append(item);
            }
            if (scrollView.length === 2) {
                node.android('layout_width', 'wrap_content');
                node.android('layout_height', 'wrap_content');
            }
            else {
                if (node.overflowX) {
                    node.android('layout_width', 'wrap_content');
                    node.android('layout_height', 'match_parent');
                }
                else {
                    node.android('layout_width', 'match_parent');
                    node.android('layout_height', 'wrap_content');
                }
            }
            const outer = scrollView.pop();
            node.parent = outer;
            if (parent.layoutConstraint) {
                outer.companion = node;
            }
            node.overflow = 0;
            node.resetBox(30 /* MARGIN */);
            node.exclude({ resource: $enum$f.NODE_RESOURCE.BOX_STYLE });
            return { parent: node.parent };
        }
    }

    var SHAPE_TMPL = {
        'shape': {
            '@': ['xmlns:android', 'android:shape'],
            '>': {
                'solid': {
                    '^': 'android',
                    '@': ['color']
                },
                'gradient': {
                    '^': 'android',
                    '@': ['type', 'startColor', 'endColor', 'centerColor', 'angle', 'centerX', 'centerY', 'gradientRadius', 'visible']
                },
                'corners': {
                    '^': 'android',
                    '@': ['radius', 'topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius']
                },
                'stroke': {
                    '^': 'android',
                    '@': ['width', 'color', 'dashWidth', 'dashGap']
                }
            }
        }
    };

    var LAYERLIST_TMPL = {
        'layer-list': {
            '@': ['xmlns:android'],
            '>': {
                'item': {
                    '^': 'android',
                    '@': ['left', 'top', 'right', 'bottom', 'drawable', 'width', 'height'],
                    '>': {
                        'shape': SHAPE_TMPL.shape,
                        'bitmap': {
                            '^': 'android',
                            '@': ['src', 'gravity', 'tileMode', 'tileModeX', 'tileModeY']
                        },
                        'rotate': {
                            '^': 'android',
                            '@': ['drawable', 'fromDegrees', 'toDegrees', 'pivotX', 'pivotY', 'visible']
                        }
                    }
                }
            }
        }
    };

    var VECTORGRADIENT_TMPL = {
        'vector': {
            '@': ['xmlns:android', 'xmlns:aapt', 'android:name', 'android:width', 'android:height', 'android:viewportWidth', 'android:viewportHeight', 'android:alpha'],
            '>': {
                'path': {
                    '^': 'android',
                    '@': ['name', 'fillColor', 'fillAlpha', 'fillType', 'strokeColor', 'strokeAlpha', 'strokeWidth', 'strokeLineCap', 'strokeLineJoin', 'strokeMiterLimit', 'trimPathStart', 'trimPathEnd', 'trimPathOffset', 'pathData'],
                    '>': {
                        'aapt:attr': {
                            '@': ['name'],
                            '>': {
                                'gradient': {
                                    '^': 'android',
                                    '@': ['type', 'startColor', 'endColor', 'centerColor', 'angle', 'startX', 'startY', 'endX', 'endY', 'centerX', 'centerY', 'gradientRadius', 'tileMode'],
                                    '>': {
                                        'item': {
                                            '^': 'android',
                                            '@': ['offset', 'color']
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    const $SvgBuild = squared.svg && squared.svg.SvgBuild;
    const $enum$g = squared.base.lib.enumeration;
    const $color$2 = squared.lib.color;
    const $css$3 = squared.lib.css;
    const $math$1 = squared.lib.math;
    const $util$g = squared.lib.util;
    const $xml$2 = squared.lib.xml;
    function getColorAttribute(value) {
        return { color: `@color/${value}`, dashWidth: '', dashGap: '' };
    }
    function getBorderStyle(border, direction = -1, halfSize = false) {
        const result = getColorAttribute(Resource.addColor(border.color));
        const borderWidth = parseInt(border.width);
        const style = border.style;
        const groove = style === 'groove';
        if (borderWidth > 1 && (groove || style === 'ridge')) {
            const color = $color$2.parseColor(border.color);
            if (color) {
                const reduced = $color$2.reduceColor(color.valueAsRGBA, groove || color.value === '#000000' ? 0.5 : -0.5);
                if (reduced) {
                    const colorName = Resource.addColor(reduced);
                    if (colorName !== '') {
                        if (direction === 0 || direction === 2) {
                            halfSize = !halfSize;
                        }
                        if (color.value === '#000000' && (groove && (direction === 1 || direction === 3) || !groove && (direction === 0 || direction === 2))) {
                            halfSize = !halfSize;
                        }
                        if (halfSize) {
                            switch (direction) {
                                case 0:
                                case 3:
                                    return getColorAttribute(colorName);
                                case 1:
                                case 2:
                                    return result;
                            }
                        }
                        else {
                            switch (direction) {
                                case 0:
                                case 3:
                                    return result;
                                case 1:
                                case 2:
                                    return getColorAttribute(colorName);
                            }
                        }
                    }
                }
            }
        }
        else {
            let multiplier = 0;
            switch (style) {
                case 'dotted':
                    multiplier = 1;
                    break;
                case 'dashed':
                    multiplier = 2;
                    break;
            }
            if (multiplier > 0) {
                result.dashWidth = `${borderWidth * multiplier}px`;
                result.dashGap = `${borderWidth}px`;
            }
        }
        return result;
    }
    function getShapeStroke(border, direction = -1, hasInset = false, isInset = false) {
        if (border) {
            if (!hasInset || isInset) {
                return Object.assign({ width: border.width }, getBorderStyle(border, isInset ? direction : -1));
            }
            else if (hasInset) {
                return Object.assign({ width: $util$g.formatPX(Math.ceil(parseFloat(border.width) / 2)) }, getBorderStyle(border, direction, true));
            }
        }
        return undefined;
    }
    function getShapeCorners(stored) {
        if (stored.borderRadius) {
            if (stored.borderRadius.length === 1) {
                return { radius: stored.borderRadius[0] };
            }
            else {
                let borderRadius;
                if (stored.borderRadius.length === 8) {
                    borderRadius = [];
                    for (let i = 0; i < stored.borderRadius.length; i += 2) {
                        borderRadius.push($util$g.formatPX((parseFloat(stored.borderRadius[i]) + parseFloat(stored.borderRadius[i + 1])) / 2));
                    }
                }
                else {
                    borderRadius = stored.borderRadius;
                }
                const boxModel = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
                const result = {};
                let valid = false;
                for (let i = 0; i < borderRadius.length; i++) {
                    if (borderRadius[i] !== '0px') {
                        result[`${boxModel[i]}Radius`] = borderRadius[i];
                        valid = true;
                    }
                }
                if (valid) {
                    return result;
                }
            }
        }
        return undefined;
    }
    function insertDoubleBorder(items, border, top, right, bottom, left, corners) {
        const width = parseInt(border.width);
        const baseWidth = Math.floor(width / 3);
        const remainder = width % 3;
        const offset = remainder === 2 ? 1 : 0;
        const leftWidth = baseWidth + offset;
        const rightWidth = baseWidth + offset;
        let indentWidth = `${$util$g.formatPX(width - baseWidth)}`;
        let hideWidth = `-${indentWidth}`;
        items.push({
            top: top ? '' : hideWidth,
            right: right ? '' : hideWidth,
            bottom: bottom ? '' : hideWidth,
            left: left ? '' : hideWidth,
            shape: {
                'android:shape': 'rectangle',
                stroke: Object.assign({ width: $util$g.formatPX(leftWidth) }, getBorderStyle(border)),
                corners
            }
        });
        if (width === 3) {
            indentWidth = `${$util$g.formatPX(width)}`;
            hideWidth = `-${indentWidth}`;
        }
        items.push({
            top: top ? indentWidth : hideWidth,
            right: right ? indentWidth : hideWidth,
            bottom: bottom ? indentWidth : hideWidth,
            left: left ? indentWidth : hideWidth,
            shape: {
                'android:shape': 'rectangle',
                stroke: Object.assign({ width: $util$g.formatPX(rightWidth) }, getBorderStyle(border)),
                corners
            }
        });
    }
    function checkBackgroundPosition(value, adjacent, fallback) {
        const initial = value === 'initial' || value === 'unset';
        if (value.indexOf(' ') === -1 && adjacent.indexOf(' ') !== -1) {
            return /^[a-z]+$/.test(value) ? `${initial ? fallback : value} 0px` : `${fallback} ${value}`;
        }
        else if (initial) {
            return '0px';
        }
        return value;
    }
    function setBodyBackground(name, parent, attr, value) {
        Resource.addTheme({
            name,
            parent,
            items: { [attr]: value }
        });
    }
    function createBackgroundGradient(gradient, api = 21 /* LOLLIPOP */, precision) {
        const result = {
            type: gradient.type,
            item: false
        };
        const hasStop = api >= 21 /* LOLLIPOP */;
        switch (gradient.type) {
            case 'conic': {
                const conic = gradient;
                const center = conic.center;
                result.type = 'sweep';
                if (hasStop) {
                    result.centerX = (center.left * 2).toString();
                    result.centerY = (center.top * 2).toString();
                }
                else {
                    result.centerX = $util$g.formatPercent(center.leftAsPercent * 100);
                    result.centerY = $util$g.formatPercent(center.topAsPercent * 100);
                }
                break;
            }
            case 'radial': {
                const radial = gradient;
                const center = radial.center;
                const radius = radial.radius;
                if (hasStop) {
                    result.gradientRadius = radius.toString();
                    result.centerX = center.left.toString();
                    result.centerY = center.top.toString();
                }
                else {
                    result.gradientRadius = $util$g.formatPX(radius);
                    result.centerX = $util$g.formatPercent(center.leftAsPercent * 100);
                    result.centerY = $util$g.formatPercent(center.topAsPercent * 100);
                }
                break;
            }
            case 'linear': {
                const linear = gradient;
                const dimension = linear.dimension;
                const width = dimension.width;
                const height = dimension.height;
                const angle = linear.angle;
                let positionX = linear.angleExtent.x;
                let positionY = linear.angleExtent.y;
                if (angle <= 90) {
                    positionY += height;
                    result.startX = '0';
                    result.startY = height.toString();
                }
                else if (angle <= 180) {
                    result.startX = '0';
                    result.startY = '0';
                }
                else if (angle <= 270) {
                    positionX += width;
                    result.startX = width.toString();
                    result.startY = '0';
                }
                else {
                    positionX += width;
                    positionY += height;
                    result.startX = width.toString();
                    result.startY = height.toString();
                }
                result.endX = $math$1.truncate(positionX, precision);
                result.endY = $math$1.truncate(positionY, precision);
                break;
            }
        }
        const colorStops = gradient.colorStops;
        if (hasStop) {
            result.item = convertColorStops(colorStops);
        }
        else {
            result.startColor = `@color/${Resource.addColor(colorStops[0].color, true)}`;
            result.endColor = `@color/${Resource.addColor(colorStops[colorStops.length - 1].color, true)}`;
            if (colorStops.length > 2) {
                result.centerColor = `@color/${Resource.addColor(colorStops[Math.floor(colorStops.length / 2)].color, true)}`;
            }
        }
        return result;
    }
    function convertColorStops(list, precision) {
        const result = [];
        for (const stop of list) {
            result.push({
                color: `@color/${Resource.addColor(stop.color, true)}`,
                offset: $math$1.truncate(stop.offset, precision)
            });
        }
        return result;
    }
    function getPercentOffset(direction, position, bounds, dimension) {
        if (direction === 'left') {
            if ($util$g.isPercent(position.horizontal)) {
                return parseFloat(position.horizontal) / 100 * (bounds.width - dimension.width);
            }
        }
        else {
            if ($util$g.isPercent(position.horizontal)) {
                return parseFloat(position.horizontal) / 100 * (bounds.height - dimension.height);
            }
        }
        return position[direction];
    }
    class ResourceBackground extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.options = {
                autoSizeBackgroundImage: true
            };
            this.eventOnly = true;
        }
        afterResources() {
            const settings = this.application.userSettings;
            for (const node of this.application.processing.cache.duplicate().sort(a => !a.visible ? -1 : 0)) {
                const stored = node.data(Resource.KEY_NAME, 'boxStyle');
                if (stored && node.hasResource($enum$g.NODE_RESOURCE.BOX_STYLE)) {
                    const backgroundRepeat = stored.backgroundRepeat.split($util$g.REGEXP_COMPILED.SEPARATOR);
                    const backgroundSize = stored.backgroundSize.split($util$g.REGEXP_COMPILED.SEPARATOR);
                    const backgroundPositionX = stored.backgroundPositionX.split($util$g.REGEXP_COMPILED.SEPARATOR);
                    const backgroundPositionY = stored.backgroundPositionY.split($util$g.REGEXP_COMPILED.SEPARATOR);
                    const backgroundImage = [];
                    const backgroundPosition = [];
                    const imageDimensions = [];
                    let imageLength = 0;
                    if (node.hasResource($enum$g.NODE_RESOURCE.IMAGE_SOURCE)) {
                        if (stored.backgroundImage) {
                            imageLength = stored.backgroundImage.length;
                            while (backgroundSize.length < imageLength) {
                                $util$g.concatArray(backgroundSize, backgroundSize.slice(0));
                            }
                            backgroundSize.length = imageLength;
                            for (let i = 0, j = 0; i < imageLength; i++) {
                                const value = stored.backgroundImage[i];
                                let remove = true;
                                if (typeof value === 'string') {
                                    if (value !== 'initial') {
                                        backgroundImage[j] = Resource.addImageUrl(value);
                                        if (backgroundImage[j] !== '') {
                                            imageDimensions[j] = Resource.ASSETS.images.get($css$3.resolveURL(value));
                                            remove = false;
                                        }
                                    }
                                }
                                else if (value.colorStops.length > 1) {
                                    const gradient = createBackgroundGradient(value, node.localSettings.targetAPI);
                                    if (gradient) {
                                        backgroundImage[j] = gradient;
                                        imageDimensions[j] = value.dimension;
                                        remove = false;
                                    }
                                }
                                if (remove) {
                                    backgroundRepeat.splice(i, 1);
                                    backgroundSize.splice(i, 1);
                                    imageLength--;
                                }
                                else {
                                    const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                                    const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                                    backgroundPosition[j] = $css$3.getBackgroundPosition(`${checkBackgroundPosition(x, y, 'left')} ${checkBackgroundPosition(y, x, 'top')}`, node.actualDimension, node.fontSize);
                                    j++;
                                }
                            }
                        }
                        if (node.extracted) {
                            if (imageLength === 0) {
                                backgroundRepeat.length = 0;
                                backgroundSize.length = 0;
                            }
                            const images = node.extracted.filter(item => item.visible && (item.imageElement || item.tagName === 'IMAGE'));
                            for (let i = 0, j = imageLength; i < images.length; i++) {
                                const image = images[i];
                                const element = image.element;
                                const src = Resource.addImageSrc(element);
                                if (src !== '') {
                                    backgroundImage[j] = src;
                                    imageDimensions[j] = Resource.ASSETS.images.get(element.src);
                                    backgroundRepeat[j] = 'no-repeat';
                                    backgroundSize[j] = `${image.actualWidth}px ${image.actualHeight}px`;
                                    const position = image.tagName === 'IMAGE' ? '0px 0px' : `${image.bounds.left - node.bounds.left}px ${image.bounds.top - node.bounds.top}px`;
                                    backgroundPosition[j] = $css$3.getBackgroundPosition(position, node.actualDimension, node.fontSize);
                                    j++;
                                }
                            }
                        }
                        imageLength = backgroundImage.length;
                    }
                    const borders = [
                        stored.borderTop,
                        stored.borderRight,
                        stored.borderBottom,
                        stored.borderLeft
                    ];
                    const borderVisible = [];
                    let borderStyle = true;
                    let borderData;
                    for (let i = 0; i < borders.length; i++) {
                        const item = borders[i];
                        if (item) {
                            borderVisible[i] = true;
                            if (borderData && borderStyle) {
                                borderStyle = $util$g.isEqual(borderData, item);
                            }
                            borderData = item;
                        }
                        else {
                            borderVisible[i] = false;
                        }
                    }
                    const hasBorder = borderData !== undefined || stored.borderRadius !== undefined;
                    const companion = node.companion;
                    if (companion && !companion.visible && companion.htmlElement && !$css$3.isInheritedStyle(companion.element, 'backgroundColor')) {
                        const companionStyle = companion.data(Resource.KEY_NAME, 'boxStyle');
                        if (companionStyle && companionStyle.backgroundColor) {
                            stored.backgroundColor = companionStyle.backgroundColor;
                        }
                    }
                    if (imageLength || hasBorder) {
                        const images = [];
                        let resourceName = '';
                        for (let i = imageLength - 1; i >= 0; i--) {
                            const value = backgroundImage[i];
                            const imageData = {
                                bitmap: false,
                                rotate: false,
                                gradient: false
                            };
                            const imageSingle = node.of(CONTAINER_NODE.IMAGE, 2048 /* SINGLE */) && imageLength === 1;
                            const position = backgroundPosition[i];
                            if (typeof value === 'string') {
                                const dimension = imageDimensions[i];
                                const src = `@drawable/${value}`;
                                function resetHorizontal() {
                                    if (!imageSingle) {
                                        position.left = 0;
                                        position.right = 0;
                                    }
                                }
                                function resetVertical() {
                                    if (!imageSingle) {
                                        position.top = 0;
                                        position.bottom = 0;
                                    }
                                }
                                let width = '';
                                let height = '';
                                let gravity = '';
                                let tileMode = '';
                                let tileModeX = '';
                                let tileModeY = '';
                                if ((position.horizontal === 'center' || position.horizontal === '50%') && (position.vertical === 'center' || position.vertical === '50%')) {
                                    resetHorizontal();
                                    resetVertical();
                                    gravity = 'center';
                                }
                                else {
                                    switch (position.horizontal) {
                                        case '0%':
                                        case 'left':
                                            resetHorizontal();
                                            gravity = node.localizeString('left');
                                            break;
                                        case '50%':
                                        case 'center':
                                            resetHorizontal();
                                            gravity = 'center_horizontal';
                                            break;
                                        case '100%':
                                        case 'right':
                                            resetHorizontal();
                                            gravity = node.localizeString('right');
                                            break;
                                        default:
                                            if (position.right !== 0) {
                                                gravity += node.localizeString('right');
                                            }
                                            else {
                                                gravity += node.localizeString('left');
                                            }
                                            break;
                                    }
                                    gravity += '|';
                                    switch (position.vertical) {
                                        case '0%':
                                        case 'top':
                                            resetVertical();
                                            gravity += 'top';
                                            break;
                                        case '50%':
                                        case 'center':
                                            resetVertical();
                                            gravity += 'center_vertical';
                                            break;
                                        case '100%':
                                        case 'bottom':
                                            resetVertical();
                                            gravity += 'bottom';
                                            break;
                                        default:
                                            if (position.bottom !== 0) {
                                                gravity += 'bottom';
                                            }
                                            else {
                                                gravity += 'top';
                                            }
                                            break;
                                    }
                                }
                                switch (backgroundRepeat[i]) {
                                    case 'repeat':
                                        if (!dimension || dimension.width < node.actualWidth || dimension.height < node.actualHeight) {
                                            tileMode = 'repeat';
                                        }
                                        break;
                                    case 'repeat-x':
                                        if (!dimension || dimension.width < node.actualWidth) {
                                            tileModeX = 'repeat';
                                        }
                                        break;
                                    case 'repeat-y':
                                        if (!dimension || dimension.height < node.actualHeight) {
                                            tileModeY = 'repeat';
                                        }
                                        break;
                                    default:
                                        tileMode = 'disabled';
                                        if (dimension && (node.inputElement || node.imageElement)) {
                                            width = $util$g.formatPX(dimension.width);
                                            height = $util$g.formatPX(dimension.height);
                                        }
                                        break;
                                }
                                if (gravity !== '' && node.renderChildren.length === 0 && dimension && dimension.width > 0 && dimension.height > 0) {
                                    if (tileModeY === 'repeat') {
                                        const tileWidth = node.hasWidth ? node.width + node.paddingLeft + node.paddingRight : node.bounds.width - (node.borderLeftWidth + node.borderRightWidth);
                                        if (dimension.width < tileWidth) {
                                            const layoutWidth = $util$g.convertInt(node.android('layout_width'));
                                            if (gravity.indexOf('left') !== -1 || gravity.indexOf('start') !== -1) {
                                                position.right = tileWidth - dimension.width;
                                                if (!node.hasWidth && tileWidth > layoutWidth) {
                                                    node.android('layout_width', $util$g.formatPX(node.actualWidth));
                                                }
                                            }
                                            else if (gravity.indexOf('right') !== -1 || gravity.indexOf('end') !== -1) {
                                                position.left = tileWidth - dimension.width;
                                                if (!node.hasWidth && tileWidth > layoutWidth) {
                                                    node.android('layout_width', $util$g.formatPX(node.actualWidth));
                                                }
                                            }
                                            else if (gravity === 'center' || gravity.indexOf('center_horizontal') !== -1) {
                                                position.left = Math.floor((tileWidth - dimension.width) / 2);
                                                width = $util$g.formatPX(dimension.width);
                                                if (!node.hasWidth && tileWidth > layoutWidth) {
                                                    node.android('layout_width', $util$g.formatPX(node.actualWidth));
                                                }
                                            }
                                        }
                                    }
                                    if (tileModeX === 'repeat') {
                                        const tileHeight = node.hasHeight ? node.height + node.paddingTop + node.paddingBottom : node.bounds.height - (node.borderTopWidth + node.borderBottomWidth);
                                        if (dimension.height < tileHeight) {
                                            const layoutHeight = $util$g.convertInt(node.android('layout_height'));
                                            if (gravity.indexOf('top') !== -1) {
                                                position.bottom = tileHeight - dimension.height;
                                                if (!node.hasHeight && tileHeight > layoutHeight) {
                                                    node.android('layout_height', $util$g.formatPX(node.actualHeight));
                                                }
                                            }
                                            else if (gravity.indexOf('bottom') !== -1) {
                                                position.top = tileHeight - dimension.height;
                                                if (!node.hasHeight && tileHeight > layoutHeight) {
                                                    node.android('layout_height', $util$g.formatPX(node.actualHeight));
                                                }
                                            }
                                            else if (gravity === 'center' || gravity.indexOf('center_vertical') !== -1) {
                                                position.top = Math.floor((tileHeight - dimension.height) / 2);
                                                height = $util$g.formatPX(dimension.height);
                                                if (!node.hasHeight && tileHeight > layoutHeight) {
                                                    node.android('layout_height', $util$g.formatPX(node.actualHeight));
                                                }
                                            }
                                        }
                                    }
                                }
                                if (imageSingle) {
                                    let scaleType;
                                    if (/^(left|start)/.test(gravity)) {
                                        scaleType = 'fitStart';
                                    }
                                    else if (/^(right|end)/.test(gravity)) {
                                        scaleType = 'fitEnd';
                                    }
                                    else if (gravity === 'center' || gravity.startsWith('center_horizontal')) {
                                        scaleType = 'center';
                                    }
                                    if (scaleType) {
                                        node.android('scaleType', scaleType);
                                    }
                                    if (position.left > 0) {
                                        node.modifyBox(16 /* MARGIN_LEFT */, position.left);
                                    }
                                    if (position.top > 0) {
                                        node.modifyBox(2 /* MARGIN_TOP */, position.top);
                                    }
                                    node.android('src', src);
                                    if (!hasBorder) {
                                        return;
                                    }
                                }
                                else {
                                    if (!(backgroundSize[i] === 'auto' || backgroundSize[i] === 'auto auto' || backgroundSize[i] === 'initial')) {
                                        switch (backgroundSize[i]) {
                                            case 'cover':
                                            case 'contain':
                                            case '100% 100%':
                                                width = '';
                                                height = '';
                                                tileMode = '';
                                                tileModeX = '';
                                                tileModeY = '';
                                                gravity = '';
                                                break;
                                            default:
                                                const dimensions = backgroundSize[i].split(' ');
                                                if (dimensions[0] === '100%') {
                                                    tileModeX = '';
                                                }
                                                else if (dimensions[1] === '100%') {
                                                    tileModeY = '';
                                                }
                                                for (let j = 0; j < dimensions.length; j++) {
                                                    const size = dimensions[j];
                                                    if (size !== 'auto' && size !== '100%') {
                                                        if (j === 0) {
                                                            width = node.convertPX(size, true, false);
                                                        }
                                                        else {
                                                            height = node.convertPX(size, false, false);
                                                        }
                                                    }
                                                }
                                                break;
                                        }
                                    }
                                    imageData.width = width;
                                    imageData.height = height;
                                    if (gravity !== '' || tileMode !== '' || tileModeX !== '' || tileModeY !== '') {
                                        imageData.bitmap = [{
                                                src,
                                                gravity,
                                                tileMode,
                                                tileModeX,
                                                tileModeY,
                                            }];
                                    }
                                    else {
                                        imageData.drawable = src;
                                    }
                                }
                                if (position.top !== 0) {
                                    imageData.top = $util$g.formatPX(position.top);
                                }
                                if (position.right !== 0) {
                                    imageData.right = $util$g.formatPX(position.right);
                                }
                                if (position.bottom !== 0) {
                                    imageData.bottom = $util$g.formatPX(position.bottom);
                                }
                                if (position.left !== 0) {
                                    imageData.left = $util$g.formatPX(position.left);
                                }
                            }
                            else {
                                const dimension = imageDimensions[i];
                                if (value.item) {
                                    const width = Math.round(dimension.width);
                                    const height = Math.round(dimension.height);
                                    imageData.width = $util$g.formatPX(width);
                                    imageData.height = $util$g.formatPX(height);
                                    const src = Resource.insertStoredAsset('drawables', `${node.tagName.toLowerCase()}_${node.controlId}_gradient_${i}`, $xml$2.applyTemplate('vector', VECTORGRADIENT_TMPL, [{
                                            'xmlns:android': XMLNS_ANDROID.android,
                                            'xmlns:aapt': XMLNS_ANDROID.aapt,
                                            'android:width': imageData.width || $util$g.formatPX(width),
                                            'android:height': imageData.height || $util$g.formatPX(height),
                                            'android:viewportWidth': width.toString(),
                                            'android:viewportHeight': height.toString(),
                                            'path': {
                                                pathData: $SvgBuild.drawRect(width, height),
                                                'aapt:attr': {
                                                    name: 'android:fillColor',
                                                    gradient: value
                                                }
                                            }
                                        }]));
                                    if (src !== '') {
                                        imageData.drawable = `@drawable/${src}`;
                                    }
                                }
                                else {
                                    imageData.gradient = value;
                                }
                                if (position.top !== 0) {
                                    imageData.top = $util$g.formatPX(getPercentOffset('top', position, node.bounds, dimension));
                                }
                                if (position.left !== 0) {
                                    imageData.left = $util$g.formatPX(getPercentOffset('left', position, node.bounds, dimension));
                                }
                            }
                            if (imageData.drawable || imageData.bitmap || imageData.gradient) {
                                images.push(imageData);
                            }
                        }
                        let solid;
                        if (stored.backgroundColor) {
                            const colorName = Resource.addColor(stored.backgroundColor);
                            if (colorName !== '') {
                                solid = { color: `@color/${colorName}` };
                            }
                        }
                        const border = stored.border;
                        const corners = getShapeCorners(stored);
                        let layerListData;
                        let shapeData;
                        function createLayerList() {
                            const layerList = [{
                                    'xmlns:android': XMLNS_ANDROID.android,
                                    item: []
                                }];
                            if (solid) {
                                layerList[0].item.push({
                                    shape: {
                                        'android:shape': 'rectangle',
                                        solid
                                    }
                                });
                            }
                            for (const image of images) {
                                if (image.gradient) {
                                    layerList[0].item.push({
                                        shape: {
                                            'android:shape': 'rectangle',
                                            gradient: image.gradient
                                        }
                                    });
                                }
                                else {
                                    layerList[0].item.push(image);
                                }
                            }
                            return layerList;
                        }
                        if (borderData === undefined || border && !(border.style === 'double' && parseInt(border.width) > 2 || (border.style === 'groove' || border.style === 'ridge') && parseInt(border.width) > 1)) {
                            const stroke = border ? getShapeStroke(border) : false;
                            if (images.length) {
                                layerListData = createLayerList();
                                if (corners || stroke) {
                                    layerListData[0].item.push({
                                        shape: {
                                            'android:shape': 'rectangle',
                                            corners,
                                            stroke
                                        }
                                    });
                                }
                            }
                            else {
                                shapeData = [{
                                        'xmlns:android': XMLNS_ANDROID.android,
                                        'android:shape': 'rectangle',
                                        solid,
                                        corners,
                                        stroke
                                    }];
                            }
                        }
                        else {
                            layerListData = createLayerList();
                            const visibleAll = borderVisible[1] && borderVisible[2];
                            function getHideWidth(value) {
                                return value + (visibleAll ? 0 : value === 1 ? 1 : 2);
                            }
                            if (borderStyle && borderData && !(borderData.style === 'groove' || borderData.style === 'ridge')) {
                                const width = parseInt(borderData.width);
                                if (borderData.style === 'double' && width > 2) {
                                    insertDoubleBorder.apply(null, [
                                        layerListData[0].item,
                                        borderData,
                                        borderVisible[0],
                                        borderVisible[1],
                                        borderVisible[2],
                                        borderVisible[3],
                                        corners
                                    ]);
                                }
                                else {
                                    const hideWidth = `-${$util$g.formatPX(getHideWidth(width))}`;
                                    const leftTop = !borderVisible[0] && !borderVisible[3];
                                    const topOnly = !borderVisible[0] && borderVisible[1] && borderVisible[2] && borderVisible[3];
                                    const leftOnly = borderVisible[0] && borderVisible[1] && borderVisible[2] && !borderVisible[3];
                                    layerListData[0].item.push({
                                        top: borderVisible[0] ? '' : hideWidth,
                                        right: borderVisible[1] ? (borderVisible[3] || leftTop || leftOnly ? '' : borderData.width) : hideWidth,
                                        bottom: borderVisible[2] ? (borderVisible[0] || leftTop || topOnly ? '' : borderData.width) : hideWidth,
                                        left: borderVisible[3] ? '' : hideWidth,
                                        shape: {
                                            'android:shape': 'rectangle',
                                            corners,
                                            stroke: getShapeStroke(borderData)
                                        }
                                    });
                                }
                            }
                            else {
                                const index = layerListData[0].item.length;
                                for (let i = 0; i < borders.length; i++) {
                                    const item = borders[i];
                                    if (item) {
                                        const width = parseInt(item.width);
                                        if (item.style === 'double' && width > 2) {
                                            insertDoubleBorder.apply(null, [
                                                layerListData[0].item,
                                                item,
                                                i === 0,
                                                i === 1,
                                                i === 2,
                                                i === 3,
                                                corners
                                            ]);
                                        }
                                        else {
                                            const hasInset = width > 1 && (item.style === 'groove' || item.style === 'ridge');
                                            const outsetWidth = hasInset ? Math.ceil(width / 2) : width;
                                            const baseWidth = getHideWidth(outsetWidth);
                                            const visible = !visibleAll && item.width === '1px';
                                            let hideWidth = `-${$util$g.formatPX(baseWidth)}`;
                                            let hideTopWidth = `-${$util$g.formatPX(baseWidth + (visibleAll ? 1 : 0))}`;
                                            layerListData[0].item.push({
                                                top: i === 0 ? '' : hideTopWidth,
                                                right: i === 1 ? (visible ? item.width : '') : hideWidth,
                                                bottom: i === 2 ? (visible ? item.width : '') : hideWidth,
                                                left: i === 3 ? '' : hideWidth,
                                                shape: {
                                                    'android:shape': 'rectangle',
                                                    corners,
                                                    stroke: getShapeStroke(item, i, hasInset)
                                                }
                                            });
                                            if (hasInset) {
                                                hideWidth = `-${$util$g.formatPX(getHideWidth(width))}`;
                                                hideTopWidth = `-${$util$g.formatPX(width + (visibleAll ? 1 : 0))}`;
                                                layerListData[0].item.splice(index, 0, {
                                                    top: i === 0 ? '' : hideTopWidth,
                                                    right: i === 1 ? (visible ? item.width : '') : hideWidth,
                                                    bottom: i === 2 ? (visible ? item.width : '') : hideWidth,
                                                    left: i === 3 ? '' : hideWidth,
                                                    shape: {
                                                        'android:shape': 'rectangle',
                                                        stroke: getShapeStroke(item, i, true, true)
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        const filename = `${node.tagName.toLowerCase()}_${node.controlId}`;
                        if (shapeData) {
                            resourceName = Resource.insertStoredAsset('drawables', filename, $xml$2.applyTemplate('shape', SHAPE_TMPL, shapeData));
                        }
                        else if (layerListData) {
                            resourceName = Resource.insertStoredAsset('drawables', filename, $xml$2.applyTemplate('layer-list', LAYERLIST_TMPL, layerListData));
                        }
                        if (backgroundImage.length) {
                            node.data('RESOURCE', 'backgroundImage', true);
                            if (this.options.autoSizeBackgroundImage && !node.documentRoot && !node.imageElement && !node.svgElement && node.renderParent && !node.renderParent.tableElement && node.hasProcedure($enum$g.NODE_PROCEDURE.AUTOFIT)) {
                                let parentWidth = 0;
                                let parentHeight = 0;
                                if (node.tagName !== 'IMAGE') {
                                    for (const image of imageDimensions) {
                                        if (image) {
                                            parentWidth = Math.max(parentWidth, image.width);
                                            parentHeight = Math.max(parentHeight, image.height);
                                        }
                                    }
                                    if (parentWidth === 0) {
                                        let current = node;
                                        while (current && !current.documentBody) {
                                            if (current.hasWidth) {
                                                parentWidth = current.actualWidth;
                                            }
                                            if (current.hasHeight) {
                                                parentHeight = current.actualHeight;
                                            }
                                            if (!current.pageFlow || (parentWidth > 0 && parentHeight > 0)) {
                                                break;
                                            }
                                            current = current.documentParent;
                                        }
                                    }
                                }
                                if (!node.has('width', 2 /* LENGTH */)) {
                                    const width = node.bounds.width + (node.is(CONTAINER_NODE.LINE) ? 0 : node.borderLeftWidth + node.borderRightWidth);
                                    if (parentWidth === 0 || (width > 0 && width < parentWidth)) {
                                        node.css('width', $util$g.formatPX(width), true);
                                    }
                                }
                                if (!node.has('height', 2 /* LENGTH */)) {
                                    const height = node.bounds.height + (node.is(CONTAINER_NODE.LINE) ? 0 : node.borderTopWidth + node.borderBottomWidth);
                                    if (parentHeight === 0 || (height > 0 && height < parentHeight)) {
                                        node.css('height', $util$g.formatPX(height), true);
                                        if (node.marginTop < 0) {
                                            node.modifyBox(2 /* MARGIN_TOP */, null);
                                        }
                                        if (node.marginBottom < 0) {
                                            node.modifyBox(8 /* MARGIN_BOTTOM */, null);
                                        }
                                    }
                                }
                            }
                        }
                        if (resourceName !== '') {
                            resourceName = `@drawable/${resourceName}`;
                            if (node.documentBody) {
                                setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, 'android:background', resourceName);
                            }
                            else {
                                node.android('background', resourceName, false);
                            }
                        }
                    }
                    else if (stored.backgroundColor) {
                        let colorName = Resource.addColor(stored.backgroundColor);
                        if (colorName !== '') {
                            colorName = `@color/${colorName}`;
                            if (node.documentBody) {
                                setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, 'android:windowBackground', colorName);
                            }
                            else {
                                const fontStyle = node.data(Resource.KEY_NAME, 'fontStyle');
                                if (fontStyle) {
                                    fontStyle.backgroundColor = stored.backgroundColor;
                                }
                                else {
                                    node.android('background', colorName, false);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const $util$h = squared.lib.util;
    const STORED$1 = Resource.STORED;
    const REGEXP_WIDGETNAME = /[\s\n]+<[^<]*?(\w+):(\w+)="(-?[\d.]+(?:px|dp|sp))"/;
    const REGEXP_CONTROLNAME = /^[\s\n]+<([\w\-.]+)[\s\n]/;
    const REGEXP_DEVICEUNIT = /^-?[\d.]+(px|dp|sp)$/;
    const NAMESPACE_ATTR = ['android', 'app'];
    function getResourceName(map, name, value) {
        for (const [storedName, storedValue] of map.entries()) {
            if (storedName.startsWith(name) && value === storedValue) {
                return storedName;
            }
        }
        return map.has(name) && map.get(name) !== value ? Resource.generateId('dimen', name) : name;
    }
    function getDisplayName(value) {
        return $util$h.fromLastIndexOf(value, '.');
    }
    class ResourceDimens extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascadeDocument() {
            const groups = {};
            for (const node of this.application.session.cache) {
                if (node.visible) {
                    const tagName = node.tagName.toLowerCase();
                    if (groups[tagName] === undefined) {
                        groups[tagName] = {};
                    }
                    for (const namespace of NAMESPACE_ATTR) {
                        const obj = node.namespace(namespace);
                        for (const attr in obj) {
                            const value = obj[attr].trim();
                            if (REGEXP_DEVICEUNIT.test(value)) {
                                const dimen = `${namespace},${attr},${value}`;
                                if (groups[tagName][dimen] === undefined) {
                                    groups[tagName][dimen] = [];
                                }
                                groups[tagName][dimen].push(node);
                            }
                        }
                    }
                }
            }
            for (const tagName in groups) {
                const group = groups[tagName];
                for (const name in group) {
                    const [namespace, attr, value] = name.split($util$h.REGEXP_COMPILED.SEPARATOR);
                    const key = getResourceName(STORED$1.dimens, `${getDisplayName(tagName)}_${$util$h.convertUnderscore(attr)}`, value);
                    for (const node of group[name]) {
                        node[namespace](attr, `@dimen/${key}`);
                    }
                    STORED$1.dimens.set(key, value);
                }
            }
        }
        afterFinalize() {
            for (const view of this.application.viewData) {
                let match;
                let content = view.content;
                while ((match = REGEXP_WIDGETNAME.exec(content)) !== null) {
                    const controlName = REGEXP_CONTROLNAME.exec(match[0]);
                    if (controlName) {
                        const key = getResourceName(STORED$1.dimens, `${getDisplayName(controlName[1]).toLowerCase()}_${$util$h.convertUnderscore(match[2])}`, match[3]);
                        STORED$1.dimens.set(key, match[3]);
                        content = content.replace(match[0], match[0].replace(match[3], `@dimen/${key}`));
                    }
                }
                view.content = content;
            }
        }
    }

    const $enum$h = squared.base.lib.enumeration;
    const $util$i = squared.lib.util;
    const REGEXP_TAGNAME = /^(\w*?)(?:_(\d+))?$/;
    const FONT_ANDROID = {
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
        'sans-serif-condensed-medium': 26 /* OREO */
    };
    const FONTALIAS_ANDROID = {
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
        'courier new': 'serif-monospace'
    };
    const FONTREPLACE_ANDROID = {
        'ms shell dlg \\32': 'sans-serif',
        'system-ui': 'sans-serif',
        '-apple-system': 'sans-serif',
        '-webkit-standard': 'sans-serif'
    };
    const FONTWEIGHT_ANDROID = {
        '100': 'thin',
        '200': 'extra_light',
        '300': 'light',
        '400': 'normal',
        '500': 'medium',
        '600': 'semi_bold',
        '700': 'bold',
        '800': 'extra_bold',
        '900': 'black'
    };
    const FONT_STYLE = {
        'fontFamily': 'android:fontFamily="{0}"',
        'fontStyle': 'android:textStyle="{0}"',
        'fontWeight': 'android:fontWeight="{0}"',
        'fontSize': 'android:textSize="{0}"',
        'color': 'android:textColor="@color/{0}"',
        'backgroundColor': 'android:background="@color/{0}"'
    };
    if ($util$i.isUserAgent(16 /* EDGE */)) {
        FONTREPLACE_ANDROID['consolas'] = 'monospace';
    }
    const STORED$2 = Resource.STORED;
    function deleteStyleAttribute(sorted, attrs, ids) {
        for (const value of attrs.split(';')) {
            for (let i = 0; i < sorted.length; i++) {
                let index = -1;
                let key = '';
                for (const j in sorted[i]) {
                    if (j === value) {
                        index = i;
                        key = j;
                        i = sorted.length;
                        break;
                    }
                }
                if (index !== -1) {
                    sorted[index][key] = $util$i.filterArray(sorted[index][key], id => !ids.includes(id));
                    if (sorted[index][key].length === 0) {
                        delete sorted[index][key];
                    }
                    break;
                }
            }
        }
    }
    class ResourceFonts extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.options = {
                defaultSystemFont: 'sans-serif',
                fontResourceValue: true
            };
            this.eventOnly = true;
        }
        afterParseDocument() {
            const nameMap = {};
            const groupMap = {};
            for (const node of this.application.session.cache) {
                if (node.visible && node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource($enum$h.NODE_RESOURCE.FONT_STYLE)) {
                    if (nameMap[node.tagName] === undefined) {
                        nameMap[node.tagName] = [];
                    }
                    nameMap[node.tagName].push(node);
                }
            }
            const styleKeys = Object.keys(FONT_STYLE);
            for (const tag in nameMap) {
                const sorted = [];
                for (let node of nameMap[tag]) {
                    const stored = Object.assign({}, node.data(Resource.KEY_NAME, 'fontStyle'));
                    const { id, companion } = node;
                    if (companion && !companion.visible && companion.tagName === 'LABEL') {
                        node = companion;
                    }
                    let system = false;
                    if (stored.backgroundColor) {
                        stored.backgroundColor = Resource.addColor(stored.backgroundColor);
                    }
                    if (stored.fontFamily) {
                        let fontFamily = stored.fontFamily.split($util$i.REGEXP_COMPILED.SEPARATOR)[0].replace(/"/g, '').toLowerCase();
                        let fontStyle = '';
                        let fontWeight = '';
                        stored.color = Resource.addColor(stored.color);
                        if (this.options.fontResourceValue && FONTREPLACE_ANDROID[fontFamily]) {
                            fontFamily = this.options.defaultSystemFont || FONTREPLACE_ANDROID[fontFamily];
                        }
                        if (FONT_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[fontFamily] || this.options.fontResourceValue && FONTALIAS_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[FONTALIAS_ANDROID[fontFamily]]) {
                            system = true;
                            stored.fontFamily = fontFamily;
                            if (stored.fontStyle === 'normal') {
                                stored.fontStyle = '';
                            }
                            if (stored.fontWeight === '400' || !node.supported('android', 'fontWeight')) {
                                stored.fontWeight = '';
                            }
                        }
                        else {
                            fontFamily = $util$i.convertWord(fontFamily);
                            stored.fontFamily = `@font/${fontFamily + (stored.fontStyle !== 'normal' ? `_${stored.fontStyle}` : '') + (stored.fontWeight !== '400' ? `_${FONTWEIGHT_ANDROID[stored.fontWeight] || stored.fontWeight}` : '')}`;
                            fontStyle = stored.fontStyle;
                            fontWeight = stored.fontWeight;
                            stored.fontStyle = '';
                            stored.fontWeight = '';
                        }
                        if (!system && (fontStyle || fontWeight)) {
                            const fonts = Resource.STORED.fonts.get(fontFamily) || {};
                            fonts[(fontStyle ? fontStyle : 'normal') + '-' + (FONTWEIGHT_ANDROID[fontWeight] || fontWeight || 'normal')] = true;
                            Resource.STORED.fonts.set(fontFamily, fonts);
                        }
                    }
                    for (let i = 0; i < styleKeys.length; i++) {
                        const value = stored[styleKeys[i]];
                        if (value) {
                            const attr = $util$i.formatString(FONT_STYLE[styleKeys[i]], value);
                            if (sorted[i] === undefined) {
                                sorted[i] = {};
                            }
                            if (sorted[i][attr] === undefined) {
                                sorted[i][attr] = [];
                            }
                            sorted[i][attr].push(id);
                        }
                    }
                }
                groupMap[tag] = sorted;
            }
            const style = {};
            for (const tag in groupMap) {
                style[tag] = {};
                const sorted = $util$i.filterArray(groupMap[tag], item => item !== undefined).sort((a, b) => {
                    let maxA = 0;
                    let maxB = 0;
                    let countA = 0;
                    let countB = 0;
                    for (const attr in a) {
                        maxA = Math.max(a[attr].length, maxA);
                        countA += a[attr].length;
                    }
                    for (const attr in b) {
                        if (b[attr]) {
                            maxB = Math.max(b[attr].length, maxB);
                            countB += b[attr].length;
                        }
                    }
                    if (maxA !== maxB) {
                        return maxA > maxB ? -1 : 1;
                    }
                    else if (countA !== countB) {
                        return countA > countB ? -1 : 1;
                    }
                    return 0;
                });
                do {
                    if (sorted.length === 1) {
                        for (const attr in sorted[0]) {
                            if (sorted[0][attr].length) {
                                style[tag][attr] = sorted[0][attr];
                            }
                        }
                        sorted.length = 0;
                    }
                    else {
                        const styleKey = {};
                        for (let i = 0; i < sorted.length; i++) {
                            const filtered = {};
                            for (const attr1 in sorted[i]) {
                                const ids = sorted[i][attr1];
                                if (ids.length === 0) {
                                    continue;
                                }
                                else if (ids.length === nameMap[tag].length) {
                                    styleKey[attr1] = ids;
                                    sorted[i] = {};
                                    break;
                                }
                                const found = {};
                                let merged = false;
                                for (let j = 0; j < sorted.length; j++) {
                                    if (i !== j) {
                                        for (const attr in sorted[j]) {
                                            const compare = sorted[j][attr];
                                            if (compare.length) {
                                                for (const id of ids) {
                                                    if (compare.includes(id)) {
                                                        if (found[attr] === undefined) {
                                                            found[attr] = [];
                                                        }
                                                        found[attr].push(id);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                for (const attr2 in found) {
                                    if (found[attr2].length > 1) {
                                        filtered[[attr1, attr2].sort().join(';')] = found[attr2];
                                        merged = true;
                                    }
                                }
                                if (!merged) {
                                    filtered[attr1] = ids;
                                }
                            }
                            if (Object.keys(filtered).length) {
                                const combined = {};
                                const deleteKeys = new Set();
                                const joinMap = {};
                                for (const attr in filtered) {
                                    joinMap[attr] = filtered[attr].join(',');
                                }
                                for (const attr1 in filtered) {
                                    for (const attr2 in filtered) {
                                        const index = joinMap[attr1];
                                        if (attr1 !== attr2 && index === joinMap[attr2]) {
                                            if (combined[index] === undefined) {
                                                combined[index] = new Set(attr1.split(';'));
                                            }
                                            for (const value of attr2.split(';')) {
                                                combined[index].add(value);
                                            }
                                            deleteKeys.add(attr1).add(attr2);
                                        }
                                    }
                                }
                                for (const attr of deleteKeys) {
                                    delete filtered[attr];
                                }
                                for (const attr in filtered) {
                                    deleteStyleAttribute(sorted, attr, filtered[attr]);
                                    style[tag][attr] = filtered[attr];
                                }
                                for (const attr in combined) {
                                    const attrs = Array.from(combined[attr]).sort().join(';');
                                    const ids = $util$i.objectMap(attr.split($util$i.REGEXP_COMPILED.SEPARATOR), value => parseInt(value));
                                    deleteStyleAttribute(sorted, attrs, ids);
                                    style[tag][attrs] = ids;
                                }
                            }
                        }
                        const shared = Object.keys(styleKey);
                        if (shared.length) {
                            style[tag][shared.join(';')] = styleKey[shared[0]];
                        }
                        $util$i.spliceArray(sorted, item => {
                            for (const attr in item) {
                                if (item[attr].length) {
                                    return false;
                                }
                            }
                            return true;
                        });
                    }
                } while (sorted.length > 0);
            }
            const resource = {};
            const nodeMap = {};
            const parentStyle = new Set();
            for (const tag in style) {
                const tagData = style[tag];
                const styleData = [];
                for (const attrs in tagData) {
                    const items = [];
                    for (const value of attrs.split(';')) {
                        const match = $util$i.REGEXP_COMPILED.ATTRIBUTE.exec(value);
                        if (match) {
                            items.push({ name: match[1], value: match[2] });
                        }
                    }
                    styleData.push({
                        name: '',
                        parent: '',
                        items,
                        ids: tagData[attrs]
                    });
                }
                styleData.sort((a, b) => {
                    let c = 0;
                    let d = 0;
                    if (a.ids && b.ids) {
                        c = a.ids.length;
                        d = b.ids.length;
                    }
                    if (c === d) {
                        c = a.items.length;
                        d = b.items.length;
                    }
                    if (c === d) {
                        c = a.items[0].name;
                        d = b.items[0].name;
                    }
                    if (c === d) {
                        c = a.items[0].value;
                        d = b.items[0].value;
                    }
                    return c <= d ? 1 : -1;
                });
                for (let i = 0; i < styleData.length; i++) {
                    styleData[i].name = $util$i.capitalize(tag) + (i > 0 ? `_${i}` : '');
                }
                resource[tag] = styleData;
            }
            for (const tag in resource) {
                for (const group of resource[tag]) {
                    if (group.ids) {
                        for (const id of group.ids) {
                            if (nodeMap[id] === undefined) {
                                nodeMap[id] = [];
                            }
                            nodeMap[id].push(group.name);
                        }
                    }
                }
            }
            for (const node of this.application.session.cache) {
                const styles = nodeMap[node.id];
                if (styles && styles.length) {
                    parentStyle.add(styles.join('.'));
                    node.attr('_', 'style', `@style/${styles.pop()}`);
                }
            }
            for (const value of parentStyle) {
                let parent = '';
                for (const name of value.split('.')) {
                    const match = name.match(REGEXP_TAGNAME);
                    if (match) {
                        const data = resource[match[1].toUpperCase()][$util$i.convertInt(match[2])];
                        if (data) {
                            STORED$2.styles.set(name, Object.assign({}, data, { name, parent }));
                            parent = name;
                        }
                    }
                }
            }
        }
    }

    const $enum$i = squared.base.lib.enumeration;
    class ResourceIncludes extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascadeDocument() {
            for (const node of this.application.session.cache) {
                if (node.renderParent && node.renderTemplates) {
                    const open = [];
                    const close = [];
                    node.renderEach((item, index) => {
                        const name = item.dataset.androidInclude || '';
                        const closing = item.dataset.androidIncludeEnd === 'true';
                        if (name || closing) {
                            const data = {
                                item,
                                name,
                                index,
                                merge: item.dataset.androidIncludeMerge === 'true'
                            };
                            if (name) {
                                open.push(data);
                            }
                            if (closing) {
                                close.push(data);
                            }
                        }
                    });
                    if (open.length && close.length) {
                        const controller = this.application.controllerHandler;
                        open.length = Math.min(open.length, close.length);
                        for (let i = open.length; i < close.length; i++) {
                            close.shift();
                        }
                        for (let i = open.length - 1; i >= 0; i--) {
                            const openData = open[i];
                            for (let j = 0; j < close.length; j++) {
                                const index = close[j].index;
                                if (index >= openData.index) {
                                    const templates = [];
                                    for (let k = openData.index; k <= index; k++) {
                                        templates.push(node.renderTemplates[k]);
                                        node.renderTemplates[k] = null;
                                    }
                                    const merge = openData.merge || templates.length > 1;
                                    const depth = merge ? 1 : 0;
                                    node.renderTemplates[openData.index] = {
                                        type: 2 /* INCLUDE */,
                                        node: templates[0].node,
                                        content: controller.renderNodeStatic('include', { layout: `@layout/${openData.name}` }, '', ''),
                                        indent: true
                                    };
                                    if (!merge && !openData.item.documentRoot) {
                                        openData.item.documentRoot = true;
                                    }
                                    let content = controller.cascadeDocument(templates, depth);
                                    if (merge) {
                                        content = controller.getEnclosingTag(1 /* XML */, { controlName: 'merge', attributes: getRootNs(content), content });
                                    }
                                    this.application.addIncludeFile(openData.item.id, openData.name, content);
                                    close.splice(j, 1);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const $enum$j = squared.base.lib.enumeration;
    const $css$4 = squared.lib.css;
    const $util$j = squared.lib.util;
    class ResourceStrings extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.options = {
                numberResourceValue: false,
                replaceCharacterEntities: false
            };
            this.eventOnly = true;
        }
        afterResources() {
            for (const node of this.application.processing.cache) {
                if (node.hasResource($enum$j.NODE_RESOURCE.VALUE_STRING)) {
                    switch (node.tagName) {
                        case 'SELECT': {
                            const element = node.element;
                            const [stringArray, numberArray] = Resource.getOptionArray(element, this.options.replaceCharacterEntities);
                            let result;
                            if (!this.options.numberResourceValue && numberArray && numberArray.length) {
                                result = numberArray;
                            }
                            else {
                                const resourceArray = stringArray || numberArray;
                                if (resourceArray) {
                                    result = [];
                                    for (let value of resourceArray) {
                                        if (this.options.replaceCharacterEntities) {
                                            value = replaceEntity(value);
                                        }
                                        value = Resource.addString(replaceCharacter(value), '', this.options.numberResourceValue);
                                        if (value !== '') {
                                            result.push(`@string/${value}`);
                                        }
                                    }
                                }
                            }
                            if (result && result.length) {
                                const arrayName = Resource.insertStoredAsset('arrays', `${node.controlId}_array`, result);
                                if (arrayName !== '') {
                                    node.android('entries', `@array/${arrayName}`);
                                }
                            }
                            break;
                        }
                        case 'IFRAME': {
                            const stored = node.data(Resource.KEY_NAME, 'valueString');
                            const value = replaceCharacter(stored.value);
                            Resource.addString(value, stored.name);
                            break;
                        }
                        default: {
                            const stored = node.data(Resource.KEY_NAME, 'valueString');
                            if (stored) {
                                const renderParent = node.renderParent;
                                let value = stored.value;
                                if (renderParent && renderParent.layoutRelative) {
                                    if (node.alignParent('left') && !$css$4.isParentStyle(node.element, 'whiteSpace', 'pre', 'pre-wrap')) {
                                        const textContent = node.textContent;
                                        let leadingSpace = 0;
                                        for (let i = 0; i < textContent.length; i++) {
                                            switch (textContent.charCodeAt(i)) {
                                                case 160:
                                                    leadingSpace++;
                                                case 32:
                                                    continue;
                                                default:
                                                    break;
                                            }
                                        }
                                        if (leadingSpace === 0) {
                                            value = value.replace(/^(\s|&#160;)+/, '');
                                        }
                                    }
                                }
                                value = replaceCharacter(value);
                                if (node.htmlElement) {
                                    if (node.css('fontVariant') === 'small-caps') {
                                        value = value.toUpperCase();
                                    }
                                }
                                const actualParent = node.actualParent;
                                if (actualParent) {
                                    let textIndent = 0;
                                    if (actualParent.blockDimension || node.blockDimension) {
                                        textIndent = node.toInt('textIndent') || actualParent.toInt('textIndent');
                                    }
                                    if (textIndent !== 0 && (node.blockDimension || actualParent.firstChild === node)) {
                                        if (textIndent > 0) {
                                            value = '&#160;'.repeat(Math.floor(textIndent / (node.fontSize / 2))) + value;
                                        }
                                        else if (node.toInt('textIndent') + node.bounds.width < 0) {
                                            value = '';
                                        }
                                    }
                                }
                                if (this.options.replaceCharacterEntities) {
                                    value = replaceEntity(value);
                                }
                                const name = Resource.addString(value, stored.name, this.options.numberResourceValue);
                                if (name !== '') {
                                    node.android('text', this.options.numberResourceValue || !$util$j.isNumber(name) ? `@string/${name}` : name, false);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const $util$k = squared.lib.util;
    const STORED$3 = Resource.STORED;
    class ResourceStyles extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascadeDocument() {
            const styles = {};
            for (const node of this.application.session.cache) {
                if (node.visible && node.controlId) {
                    const renderChildren = node.renderChildren;
                    if (renderChildren.length > 1) {
                        const attrMap = new Map();
                        let style = '';
                        let valid = true;
                        for (let i = 0; i < renderChildren.length; i++) {
                            let found = false;
                            renderChildren[i].combine('_', 'android').some(value => {
                                if (value.startsWith('style=')) {
                                    if (i === 0) {
                                        style = value;
                                    }
                                    else if (style === '' || value !== style) {
                                        valid = false;
                                        return true;
                                    }
                                    found = true;
                                }
                                else {
                                    attrMap.set(value, (attrMap.get(value) || 0) + 1);
                                }
                                return false;
                            });
                            if (!valid || (style !== '' && !found)) {
                                valid = false;
                                break;
                            }
                        }
                        if (valid) {
                            for (const [attr, value] of attrMap.entries()) {
                                if (value !== renderChildren.length) {
                                    attrMap.delete(attr);
                                }
                            }
                            if (attrMap.size > 1) {
                                if (style !== '') {
                                    style = $util$k.trimString(style.substring(style.indexOf('/') + 1), '"');
                                }
                                const common = [];
                                for (const attr of attrMap.keys()) {
                                    const match = attr.match(/(\w+):(\w+)="([^"]+)"/);
                                    if (match) {
                                        for (const item of renderChildren) {
                                            item.delete(match[1], match[2]);
                                        }
                                        common.push(match[0]);
                                    }
                                }
                                common.sort();
                                let name = '';
                                for (const index in styles) {
                                    if (styles[index].join(';') === common.join(';')) {
                                        name = index;
                                        break;
                                    }
                                }
                                if (!(style !== '' && name.startsWith(`${style}.`))) {
                                    if (style !== '') {
                                        name = style + '.' + node.controlId;
                                    }
                                    else {
                                        name = $util$k.capitalize(node.controlId);
                                    }
                                    styles[name] = common;
                                }
                                for (const item of renderChildren) {
                                    item.attr('_', 'style', `@style/${name}`);
                                }
                            }
                        }
                    }
                }
            }
            for (const name in styles) {
                const items = [];
                for (const attr in styles[name]) {
                    const match = $util$k.REGEXP_COMPILED.ATTRIBUTE.exec(styles[name][attr]);
                    if (match) {
                        items.push({ name: match[1], value: match[2] });
                    }
                }
                STORED$3.styles.set(name, Object.assign({}, createStyleAttribute(), { name,
                    items, ids: [] }));
            }
        }
    }

    var ANIMATEDVECTOR_TMPL = {
        'animated-vector': {
            '@': ['xmlns:android', 'android:drawable'],
            '>': {
                'target': {
                    '^': 'android',
                    '@': ['name', 'animation']
                }
            }
        }
    };

    const ORDERING = ['ordering'];
    const OBJECTANIMATOR = {
        '^': 'android',
        '@': ['propertyName', 'interpolator', 'valueType', 'valueFrom', 'valueTo', 'startOffset', 'duration', 'repeatCount'],
        '>': {
            'propertyValuesHolder': {
                '^': 'android',
                '@': ['propertyName'],
                '>': {
                    'keyframe': {
                        '^': 'android',
                        '@': ['interpolator', 'fraction', 'value']
                    }
                }
            }
        }
    };
    var OBJECTANIMATOR_TMPL = {
        'set': {
            '@': ['xmlns:android', 'android:ordering'],
            '>': {
                'set': {
                    '^': 'android',
                    '@': ORDERING,
                    '>': {
                        'set': {
                            '^': 'android',
                            '@': ORDERING,
                            '>': {
                                'objectAnimator': OBJECTANIMATOR
                            },
                        },
                        'objectAnimator': OBJECTANIMATOR
                    }
                },
                'objectAnimator': OBJECTANIMATOR
            }
        }
    };

    var VECTOR_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<vector {~namespace} android:name="{~name}" android:width="{&width}" android:height="{&height}" android:viewportWidth="{&viewportWidth}" android:viewportHeight="{&viewportHeight}" android:alpha="{~alpha}">
<<A>>
	##region-start##
	<group android:name="{~name}" android:translateX="{~translateX}" android:translateY="{~translateY}">
	##region-start##
		<<clipRegion>>
		<clip-path android:name="{~name}" android:pathData="{&pathData}" />
		<<clipRegion>>
		##path-start##
		<group android:name="{~name}" android:rotation="{~rotation}" android:scaleX="{~scaleX}" android:scaleY="{~scaleY}" android:translateX="{~translateX}" android:translateY="{~translateY}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}">
		##path-start##
		<<clipPath>>
			<clip-path android:name="{~name}" android:pathData="{&pathData}" />
		<<clipPath>>
		<<BB>>
			##render-start##
			<group android:name="{~name}" android:rotation="{~rotation}" android:scaleX="{~scaleX}" android:scaleY="{~scaleY}" android:translateX="{~translateX}" android:translateY="{~translateY}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}">
			##render-start##
			<<clipGroup>>
			<clip-path android:name="{~name}" android:pathData="{&pathData}" />
			<<clipGroup>>
			<<CCC>>
				<<clipElement>>
				<clip-path android:name="{~name}" android:pathData="{&pathData}" />
				<<clipElement>>
				<path android:name="{~name}" android:fillColor="{~fillColor}" android:fillAlpha="{~fillAlpha}" android:fillType="{~fillType}" android:strokeColor="{~strokeColor}" android:strokeAlpha="{~strokeAlpha}" android:strokeWidth="{~strokeWidth}" android:strokeLineCap="{~strokeLineCap}" android:strokeLineJoin="{~strokeLineJoin}" android:strokeMiterLimit="{~strokeMiterLimit}" android:trimPathStart="{~trimPathStart}" android:trimPathEnd="{~trimPathEnd}" android:trimPathOffset="{~trimPathOffset}" android:pathData="{&pathData}">
				<<fillColor>>
					<aapt:attr name="android:fillColor">
					<<gradient>>
						<gradient android:type="{&type}" android:startColor="{~startColor}" android:endColor="{~endColor}" android:centerColor="{~centerColor}" android:startX="{~startX}" android:startY="{~startY}" android:endX="{~endX}" android:endY="{~endY}" android:centerX="{~centerX}" android:centerY="{~centerY}" android:gradientRadius="{~gradientRadius}" android:tileMode="{~tileMode}">
						<<item>>
							<item android:offset="{&offset}" android:color="{&color}" />
						<<item>>
						</gradient>
					<<gradient>>
					</aapt:attr>
				<<fillColor>>
				</path>
			<<CCC>>
			##render-end##
			</group>
			##render-end##
			<<DDD>>
			!!{&templateName}!!
			<<DDD>>
		<<BB>>
		##path-end##
		</group>
		##path-end##
	##region-end##
	</group>
	##region-end##
<<A>>
<<B>>
!!{&templateName}!!
<<B>>
</vector>
`;

    if (!squared.svg) {
        squared.svg = { lib: {} };
    }
    var $Svg = squared.svg.Svg;
    var $SvgAnimate = squared.svg.SvgAnimate;
    var $SvgAnimateTransform = squared.svg.SvgAnimateTransform;
    var $SvgBuild$1 = squared.svg.SvgBuild;
    var $SvgG = squared.svg.SvgG;
    var $SvgPath = squared.svg.SvgPath;
    var $SvgShape = squared.svg.SvgShape;
    const $util$l = squared.lib.util;
    const $math$2 = squared.lib.math;
    const $xml$3 = squared.lib.xml;
    const $constS = squared.svg.lib.constant;
    const $utilS = squared.svg.lib.util;
    const TEMPLATES = {};
    const STORED$4 = Resource.STORED;
    const INTERPOLATOR_ANDROID = {
        accelerate_decelerate: '@android:anim/accelerate_decelerate_interpolator',
        accelerate: '@android:anim/accelerate_interpolator',
        anticipate: '@android:anim/anticipate_interpolator',
        anticipate_overshoot: '@android:anim/anticipate_overshoot_interpolator',
        bounce: '@android:anim/bounce_interpolator',
        cycle: '@android:anim/cycle_interpolator',
        decelerate: '@android:anim/decelerate_interpolator',
        linear: '@android:anim/linear_interpolator',
        overshoot: '@android:anim/overshoot_interpolator'
    };
    if ($constS) {
        Object.assign(INTERPOLATOR_ANDROID, {
            [$constS.KEYSPLINE_NAME['ease-in']]: INTERPOLATOR_ANDROID.accelerate,
            [$constS.KEYSPLINE_NAME['ease-out']]: INTERPOLATOR_ANDROID.decelerate,
            [$constS.KEYSPLINE_NAME['ease-in-out']]: INTERPOLATOR_ANDROID.accelerate_decelerate,
            [$constS.KEYSPLINE_NAME['linear']]: INTERPOLATOR_ANDROID.linear
        });
    }
    const INTERPOLATOR_XML = `<?xml version="1.0" encoding="utf-8"?>
<pathInterpolator xmlns:android="http://schemas.android.com/apk/res/android"
	android:controlX1="{0}"
	android:controlY1="{1}"
	android:controlX2="{2}"
    android:controlY2="{3}" />
`;
    const ATTRIBUTE_ANDROID = {
        'stroke': ['strokeColor'],
        'fill': ['fillColor'],
        'opacity': ['alpha'],
        'stroke-opacity': ['strokeAlpha'],
        'fill-opacity': ['fillAlpha'],
        'stroke-width': ['strokeWidth'],
        'stroke-dasharray': ['trimPathStart', 'trimPathEnd'],
        'stroke-dashoffset': ['trimPathOffset'],
        'd': ['pathData'],
        'clip-path': ['pathData']
    };
    function getPathInterpolator(keySplines, index) {
        if (keySplines && keySplines[index]) {
            return INTERPOLATOR_ANDROID[keySplines[index]] || createPathInterpolator(keySplines[index]);
        }
        return '';
    }
    function getPaintAttribute(value) {
        for (const attr in ATTRIBUTE_ANDROID) {
            if (ATTRIBUTE_ANDROID[attr].includes(value)) {
                return $util$l.convertCamelCase(attr);
            }
        }
        return '';
    }
    function getVectorName(target, section, index = -1) {
        return `${target.name}_${section + (index !== -1 ? `_${index + 1}` : '')}`;
    }
    function createPathInterpolator(value) {
        if (INTERPOLATOR_ANDROID[value]) {
            return INTERPOLATOR_ANDROID[value];
        }
        else {
            const interpolatorName = `path_interpolator_${$util$l.convertWord(value)}`;
            if (!STORED$4.animators.has(interpolatorName)) {
                const xml = $util$l.formatString(INTERPOLATOR_XML, ...value.split(' '));
                STORED$4.animators.set(interpolatorName, xml);
            }
            return `@anim/${interpolatorName}`;
        }
    }
    function createTransformData(transform) {
        const result = {};
        for (let i = 0; i < transform.length; i++) {
            const item = transform[i];
            const m = item.matrix;
            switch (item.type) {
                case SVGTransform.SVG_TRANSFORM_SCALE:
                    result.scaleX = m.a.toString();
                    result.scaleY = m.d.toString();
                    if (item.origin) {
                        result.pivotX = item.origin.x.toString();
                        result.pivotY = item.origin.y.toString();
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_ROTATE:
                    result.rotation = item.angle.toString();
                    if (item.origin) {
                        result.pivotX = item.origin.x.toString();
                        result.pivotY = item.origin.y.toString();
                    }
                    else {
                        result.pivotX = '0';
                        result.pivotY = '0';
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                    result.translateX = m.e.toString();
                    result.translateY = m.f.toString();
                    break;
            }
        }
        return result;
    }
    function getViewport(element) {
        const result = [];
        let parent = element.parentElement;
        while (parent) {
            result.push(parent);
            parent = parent.parentElement;
            if (parent instanceof HTMLElement) {
                break;
            }
        }
        return result;
    }
    function getParentOffset(element, rootElement) {
        let x = 0;
        let y = 0;
        for (const parent of getViewport(element)) {
            if (($utilS.SVG.svg(parent) || $utilS.SVG.use(parent)) && parent !== rootElement) {
                x += parent.x.baseVal.value;
                y += parent.y.baseVal.value;
            }
        }
        return { x, y };
    }
    function getOuterOpacity(target) {
        let value = parseFloat(target.opacity);
        let current = target.parent;
        while (current) {
            const opacity = parseFloat(current['opacity'] || '1');
            if (!isNaN(opacity) && opacity < 1) {
                value *= opacity;
            }
            current = current.parent;
        }
        return value;
    }
    function partitionTransforms(element, transforms, rx = 1, ry = 1) {
        if (transforms.length && ($utilS.SVG.circle(element) || $utilS.SVG.ellipse(element))) {
            const index = transforms.findIndex(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE);
            if (index !== -1 && (rx !== ry || transforms.length > 1 && transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))) {
                return groupTransforms(element, transforms);
            }
        }
        return [[], transforms];
    }
    function groupTransforms(element, transforms, ignoreClient = false) {
        if (transforms.length) {
            const host = [];
            const client = [];
            const items = transforms.slice(0).reverse();
            const rotateOrigin = transforms[0].fromCSS ? [] : $utilS.TRANSFORM.rotateOrigin(element).reverse();
            for (let i = 1; i < items.length; i++) {
                const itemA = items[i];
                const itemB = items[i - 1];
                if (itemA.type === itemB.type) {
                    let matrix;
                    switch (itemA.type) {
                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                            matrix = $utilS.MATRIX.clone(itemA.matrix);
                            matrix.e += itemB.matrix.e;
                            matrix.f += itemB.matrix.f;
                            break;
                        case SVGTransform.SVG_TRANSFORM_SCALE: {
                            matrix = $utilS.MATRIX.clone(itemA.matrix);
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
            const current = [];
            function restart() {
                host.push(current.slice(0));
                current.length = 0;
            }
            for (const item of items) {
                switch (item.type) {
                    case SVGTransform.SVG_TRANSFORM_MATRIX:
                    case SVGTransform.SVG_TRANSFORM_SKEWX:
                    case SVGTransform.SVG_TRANSFORM_SKEWY:
                        client.push(item);
                        break;
                    case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                        if (!ignoreClient && host.length === 0 && current.length === 0) {
                            client.push(item);
                        }
                        else {
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
                        if (item.origin === undefined && current.length === 1 && current[0].type === SVGTransform.SVG_TRANSFORM_SCALE) {
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
    function getPropertyValue(values, index, propertyIndex, keyFrames = false, baseValue) {
        let value;
        const property = values[index];
        if (property) {
            value = Array.isArray(property) ? property[propertyIndex].toString() : property;
        }
        else if (!keyFrames && index === 0) {
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
                return undefined;
        }
    }
    function createAnimateFromTo(attributeName, delay, to, from) {
        const result = new $SvgAnimate();
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
        let result = ATTRIBUTE_ANDROID[value];
        if (result === undefined && checkTransform && getTransformInitialValue(value)) {
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
        return undefined;
    }
    function getTransformValues(item) {
        switch (item.type) {
            case SVGTransform.SVG_TRANSFORM_ROTATE:
                return $SvgAnimateTransform.toRotateList(item.values);
            case SVGTransform.SVG_TRANSFORM_SCALE:
                return $SvgAnimateTransform.toScaleList(item.values);
            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                return $SvgAnimateTransform.toTranslateList(item.values);
        }
        return undefined;
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
        return undefined;
    }
    function isColorType(attr) {
        return attr === 'fill' || attr === 'stroke';
    }
    function getColorValue(value, asArray = false) {
        const colorName = `@color/${Resource.addColor(value)}`;
        return (asArray ? [colorName] : colorName);
    }
    function convertValueType(item, value) {
        if (isColorType(item.attributeName)) {
            return getColorValue(value);
        }
        return value.trim() || undefined;
    }
    function getTileMode(value) {
        switch (value) {
            case SVGGradientElement.SVG_SPREADMETHOD_PAD:
                return 'clamp';
            case SVGGradientElement.SVG_SPREADMETHOD_REFLECT:
                return 'mirror';
            case SVGGradientElement.SVG_SPREADMETHOD_REPEAT:
                return 'repeat';
        }
        return '';
    }
    function createFillGradient(gradient, path, precision) {
        const result = {
            type: gradient.type,
            item: convertColorStops(gradient.colorStops, precision)
        };
        switch (gradient.type) {
            case 'radial': {
                const radial = gradient;
                const points = [];
                let cx;
                let cy;
                let cxDiameter;
                let cyDiameter;
                switch (path.element.tagName) {
                    case 'path':
                        for (const command of $SvgBuild$1.getPathCommands(path.value)) {
                            $util$l.concatArray(points, command.value);
                        }
                    case 'polygon':
                        if ($utilS.SVG.polygon(path.element)) {
                            $util$l.concatArray(points, $SvgBuild$1.clonePoints(path.element.points));
                        }
                        if (!points.length) {
                            return undefined;
                        }
                        [cx, cy, cxDiameter, cyDiameter] = $SvgBuild$1.minMaxPoints(points);
                        cxDiameter -= cx;
                        cyDiameter -= cy;
                        break;
                    default:
                        if ($utilS.SVG.rect(path.element)) {
                            const rect = path.element;
                            cx = rect.x.baseVal.value;
                            cy = rect.y.baseVal.value;
                            cxDiameter = rect.width.baseVal.value;
                            cyDiameter = rect.height.baseVal.value;
                        }
                        else if ($utilS.SVG.circle(path.element)) {
                            const circle = path.element;
                            cx = circle.cx.baseVal.value - circle.r.baseVal.value;
                            cy = circle.cy.baseVal.value - circle.r.baseVal.value;
                            cxDiameter = circle.r.baseVal.value * 2;
                            cyDiameter = cxDiameter;
                        }
                        else if ($utilS.SVG.ellipse(path.element)) {
                            const ellipse = path.element;
                            cx = ellipse.cx.baseVal.value - ellipse.rx.baseVal.value;
                            cy = ellipse.cy.baseVal.value - ellipse.ry.baseVal.value;
                            cxDiameter = ellipse.rx.baseVal.value * 2;
                            cyDiameter = ellipse.ry.baseVal.value * 2;
                        }
                        else {
                            return undefined;
                        }
                        break;
                }
                result.centerX = (cx + cxDiameter * getRadiusPercent(radial.cxAsString)).toString();
                result.centerY = (cy + cyDiameter * getRadiusPercent(radial.cyAsString)).toString();
                result.gradientRadius = (((cxDiameter + cyDiameter) / 2) * ($util$l.isPercent(radial.rAsString) ? (parseFloat(radial.rAsString) / 100) : 1)).toString();
                if (radial.spreadMethod) {
                    result.tileMode = getTileMode(radial.spreadMethod);
                }
                break;
            }
            case 'linear': {
                const linear = gradient;
                result.startX = linear.x1.toString();
                result.startY = linear.y1.toString();
                result.endX = linear.x2.toString();
                result.endY = linear.y2.toString();
                if (linear.spreadMethod) {
                    result.tileMode = getTileMode(linear.spreadMethod);
                }
            }
        }
        return result;
    }
    const getRadiusPercent = (value) => $util$l.isPercent(value) ? parseFloat(value) / 100 : 0.5;
    const getDrawableSrc = (name) => `@drawable/${name}`;
    const getFillData = (ordering = '') => ({ ordering, objectAnimator: [] });
    class ResourceSvg extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.options = {
                transformExclude: {
                    path: [],
                    line: [],
                    rect: [],
                    ellipse: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
                    circle: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY],
                    polyline: [],
                    polygon: [],
                    image: [SVGTransform.SVG_TRANSFORM_SKEWX, SVGTransform.SVG_TRANSFORM_SKEWY]
                },
                floatPrecisionKeyTime: 5,
                floatPrecisionValue: 3,
                animateInterpolator: ''
            };
            this.eventOnly = true;
            this.VECTOR_DATA = new Map();
            this.ANIMATE_DATA = new Map();
            this.IMAGE_DATA = [];
            this.SYNCHRONIZE_MODE = 0;
            this.NAMESPACE_AAPT = false;
        }
        beforeInit() {
            if ($SvgBuild$1) {
                if (TEMPLATES.VECTOR === undefined) {
                    TEMPLATES.VECTOR = $xml$3.parseTemplate(VECTOR_TMPL);
                }
                $SvgBuild$1.setName();
                this.application.controllerHandler.localSettings.svg.enabled = true;
            }
        }
        afterResources() {
            for (const node of this.application.processing.cache) {
                if (node.svgElement) {
                    const svg = new $Svg(node.element);
                    const supportedKeyFrames = node.localSettings.targetAPI >= 23 /* MARSHMALLOW */;
                    this.SVG_INSTANCE = svg;
                    this.VECTOR_DATA.clear();
                    this.ANIMATE_DATA.clear();
                    this.IMAGE_DATA.length = 0;
                    this.NAMESPACE_AAPT = false;
                    this.SYNCHRONIZE_MODE = 2 /* FROMTO_ANIMATE */ | (supportedKeyFrames ? 32 /* KEYTIME_TRANSFORM */ : 64 /* IGNORE_TRANSFORM */);
                    svg.build({
                        exclude: this.options.transformExclude,
                        residual: partitionTransforms,
                        precision: this.options.floatPrecisionValue
                    });
                    svg.synchronize({
                        keyTimeMode: this.SYNCHRONIZE_MODE,
                        precision: this.options.floatPrecisionValue
                    });
                    this.parseVectorData(svg);
                    this.queueAnimations(svg, svg.name, item => item.attributeName === 'opacity');
                    const templateName = `${node.tagName}_${$util$l.convertWord(node.controlId, true)}_viewbox`.toLowerCase();
                    const getFilename = (prefix, suffix) => templateName + (prefix ? `_${prefix}` : '') + (this.IMAGE_DATA.length ? '_vector' : '') + (suffix ? `_${suffix.toLowerCase()}` : '');
                    let drawable = '';
                    let vectorName = '';
                    {
                        const template = Object.assign({}, TEMPLATES.VECTOR);
                        let xml = $xml$3.createTemplate(template, {
                            namespace: getXmlNs('android', (this.NAMESPACE_AAPT ? 'aapt' : '')),
                            name: svg.name,
                            width: $util$l.formatPX(svg.width),
                            height: $util$l.formatPX(svg.height),
                            viewportWidth: (svg.viewBox.width || svg.width).toString(),
                            viewportHeight: (svg.viewBox.height || svg.height).toString(),
                            alpha: parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : '',
                            A: false,
                            B: [{ templateName: svg.name }]
                        });
                        const output = new Map();
                        template['__ROOT__'] = template['A'];
                        for (const [name, data] of this.VECTOR_DATA.entries()) {
                            output.set(name, $xml$3.createTemplate(template, data));
                        }
                        const entries = Array.from(output.entries()).reverse();
                        for (let i = 0; i < entries.length; i++) {
                            let partial = entries[i][1];
                            for (let j = i; j < entries.length; j++) {
                                const hash = `!!${entries[j][0]}!!`;
                                if (partial.indexOf(hash) !== -1) {
                                    partial = partial.replace(hash, entries[j][1]);
                                    break;
                                }
                            }
                            xml = xml.replace(`!!${entries[i][0]}!!`, partial);
                        }
                        vectorName = Resource.insertStoredAsset('drawables', getFilename(), $xml$3.formatTemplate(xml));
                    }
                    if (this.ANIMATE_DATA.size) {
                        const data = [{
                                'xmlns:android': XMLNS_ANDROID.android,
                                'android:drawable': getDrawableSrc(vectorName),
                                target: []
                            }];
                        for (const [name, group] of this.ANIMATE_DATA.entries()) {
                            const sequentialMap = new Map();
                            const transformMap = new Map();
                            const togetherData = [];
                            const isolatedData = [];
                            const togetherTargets = [];
                            const isolatedTargets = [];
                            const transformTargets = [];
                            const [companions, animations] = $util$l.partitionArray(group.animate, child => child.companion !== undefined);
                            const targetData = { name };
                            let targetSetTemplate = {
                                set: [],
                                objectAnimator: []
                            };
                            for (let i = 0; i < animations.length; i++) {
                                const item = animations[i];
                                if (item.setterType) {
                                    if (ATTRIBUTE_ANDROID[item.attributeName] && $util$l.hasValue(item.to)) {
                                        if (item.duration > 0 && item.fillReplace) {
                                            isolatedData.push(item);
                                        }
                                        else {
                                            togetherData.push(item);
                                        }
                                    }
                                }
                                else if ($SvgBuild$1.isAnimate(item)) {
                                    const children = $util$l.filterArray(companions, child => child.companion.value === item);
                                    if (children.length) {
                                        children.sort((a, b) => a.companion.index >= b.companion.index ? 1 : 0);
                                        const sequentially = [];
                                        const after = [];
                                        for (let j = 0; j < children.length; j++) {
                                            const child = children[j];
                                            if (child.companion.index <= 0) {
                                                sequentially.push(child);
                                                if (j === 0 && item.delay > 0) {
                                                    child.delay += item.delay;
                                                    item.delay = 0;
                                                }
                                            }
                                            else {
                                                after.push(child);
                                            }
                                        }
                                        sequentially.push(item);
                                        $util$l.concatArray(sequentially, after);
                                        sequentialMap.set(`sequentially_companion_${i}`, sequentially);
                                    }
                                    else {
                                        const synchronized = item.synchronized;
                                        if (synchronized) {
                                            if ($SvgBuild$1.asAnimateTransform(item)) {
                                                const values = transformMap.get(synchronized.value) || [];
                                                values.push(item);
                                                transformMap.set(synchronized.value, values);
                                            }
                                            else {
                                                const values = sequentialMap.get(synchronized.value) || [];
                                                values.push(item);
                                                sequentialMap.set(synchronized.value, values);
                                            }
                                        }
                                        else {
                                            if ($SvgBuild$1.asAnimateTransform(item)) {
                                                item.expandToValues();
                                            }
                                            if (item.iterationCount === -1) {
                                                isolatedData.push(item);
                                            }
                                            else if ((!item.fromToType || $SvgBuild$1.asAnimateTransform(item) && item.transformOrigin) && !(supportedKeyFrames && getValueType(item.attributeName) !== 'pathType')) {
                                                togetherTargets.push([item]);
                                            }
                                            else if (item.fillReplace) {
                                                isolatedData.push(item);
                                            }
                                            else {
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
                                }
                                else {
                                    togetherTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.index >= b.synchronized.index ? 1 : -1));
                                }
                            }
                            for (const item of transformMap.values()) {
                                transformTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.index >= b.synchronized.index ? 1 : -1));
                            }
                            for (const item of isolatedData) {
                                isolatedTargets.push([[item]]);
                            }
                            [togetherTargets, transformTargets, ...isolatedTargets].forEach((targets, index) => {
                                if (targets.length === 0) {
                                    return;
                                }
                                const setData = {
                                    ordering: index === 0 || targets.length === 1 ? '' : 'sequentially',
                                    set: [],
                                    objectAnimator: []
                                };
                                for (const items of targets) {
                                    let ordering = '';
                                    let synchronized = false;
                                    let checkBefore = false;
                                    let useKeyFrames = true;
                                    if (index <= 1 && items.some((item) => !!item.synchronized && item.synchronized.value !== '')) {
                                        if (!$SvgBuild$1.asAnimateTransform(items[0])) {
                                            ordering = 'sequentially';
                                        }
                                        synchronized = true;
                                        useKeyFrames = false;
                                    }
                                    else if (index <= 1 && items.some((item) => !!item.synchronized && item.synchronized.value === '')) {
                                        ordering = 'sequentially';
                                        synchronized = true;
                                        checkBefore = true;
                                    }
                                    else if (index <= 1 && items.some(item => item.companion !== undefined)) {
                                        ordering = 'sequentially';
                                    }
                                    else {
                                        if (index > 0) {
                                            ordering = 'sequentially';
                                        }
                                        if (index > 1 && $SvgBuild$1.asAnimateTransform(items[0])) {
                                            checkBefore = true;
                                        }
                                    }
                                    const fillBefore = getFillData();
                                    const repeating = getFillData();
                                    const fillCustom = getFillData();
                                    const fillAfter = getFillData();
                                    const together = [];
                                    (synchronized ? $util$l.partitionArray(items, (animate) => animate.iterationCount !== -1) : [items]).forEach((partition, section) => {
                                        if (section === 1 && partition.length > 1) {
                                            fillCustom.ordering = 'sequentially';
                                        }
                                        const animatorMap = new Map();
                                        for (const item of partition) {
                                            const valueType = getValueType(item.attributeName);
                                            if (valueType === undefined) {
                                                continue;
                                            }
                                            const insertBeforeValue = (attr, value) => {
                                                if (value && fillBefore.objectAnimator.findIndex(before => before.propertyName === attr) === -1) {
                                                    fillBefore.objectAnimator.push(this.createPropertyValue(attr, value, '0', valueType));
                                                }
                                            };
                                            const requireBefore = item.delay > 0;
                                            let transforming = false;
                                            let transformOrigin;
                                            const setFillAfter = (propertyName, propertyValues, startOffset) => {
                                                if (!synchronized && item.fillReplace && valueType !== undefined) {
                                                    let valueTo = item.replaceValue;
                                                    if (!valueTo) {
                                                        if (transforming) {
                                                            valueTo = getTransformInitialValue(propertyName);
                                                        }
                                                        else if (item.parent && $SvgBuild$1.isShape(item.parent) && item.parent.path) {
                                                            valueTo = propertyName === 'pathData' ? item.parent.path.value : item.parent.path[getPaintAttribute(propertyName)];
                                                        }
                                                        if (!valueTo) {
                                                            valueTo = item.baseValue;
                                                        }
                                                    }
                                                    let previousValue;
                                                    if (propertyValues && propertyValues.length) {
                                                        const lastValue = propertyValues[propertyValues.length - 1];
                                                        if ($util$l.isArray(lastValue.propertyValuesHolder)) {
                                                            const propertyValue = lastValue.propertyValuesHolder[lastValue.propertyValuesHolder.length - 1];
                                                            previousValue = propertyValue.keyframe[propertyValue.keyframe.length - 1].value;
                                                        }
                                                        else {
                                                            previousValue = lastValue.valueTo;
                                                        }
                                                    }
                                                    if ($util$l.isString(valueTo) && valueTo !== previousValue) {
                                                        valueTo = convertValueType(item, valueTo);
                                                        if (valueTo) {
                                                            switch (propertyName) {
                                                                case 'trimPathStart':
                                                                case 'trimPathEnd':
                                                                    valueTo = valueTo.split(' ')[propertyName === 'trimPathStart' ? 0 : 1];
                                                                    break;
                                                            }
                                                            fillAfter.objectAnimator.push(this.createPropertyValue(propertyName, valueTo, '1', valueType, valueType === 'pathType' ? previousValue : '', startOffset ? startOffset.toString() : ''));
                                                        }
                                                    }
                                                    if (transformOrigin) {
                                                        if (propertyName.endsWith('X')) {
                                                            fillAfter.objectAnimator.push(this.createPropertyValue('translateX', '0', '1', valueType));
                                                        }
                                                        else if (propertyName.endsWith('Y')) {
                                                            fillAfter.objectAnimator.push(this.createPropertyValue('translateY', '0', '1', valueType));
                                                        }
                                                    }
                                                }
                                            };
                                            if (item.setterType) {
                                                const propertyNames = getAttributePropertyName(item.attributeName);
                                                if (propertyNames) {
                                                    const values = isColorType(item.attributeName) ? getColorValue(item.to, true) : item.to.trim().split(' ');
                                                    if (values.length === propertyNames.length && !values.some(value => value === '')) {
                                                        let companionBefore;
                                                        let companionAfter;
                                                        for (let i = 0; i < propertyNames.length; i++) {
                                                            let valueFrom;
                                                            if (valueType === 'pathType') {
                                                                valueFrom = values[i];
                                                            }
                                                            else if (requireBefore && item.baseValue) {
                                                                valueFrom = convertValueType(item, item.baseValue.trim().split(' ')[i]);
                                                            }
                                                            const propertyValue = this.createPropertyValue(propertyNames[i], values[i], '1', valueType, valueFrom, item.delay > 0 ? item.delay.toString() : '');
                                                            if (index > 1) {
                                                                fillCustom.objectAnimator.push(propertyValue);
                                                                setFillAfter(propertyNames[i], undefined, index > 1 ? item.duration : 0);
                                                            }
                                                            else {
                                                                if (item.companion && item.companion.index <= 0) {
                                                                    if (companionBefore === undefined) {
                                                                        companionBefore = [];
                                                                    }
                                                                    companionBefore.push(propertyValue);
                                                                }
                                                                else if (item.companion && item.companion.index > 0) {
                                                                    if (companionAfter === undefined) {
                                                                        companionAfter = [];
                                                                    }
                                                                    companionAfter.push(propertyValue);
                                                                }
                                                                else {
                                                                    together.push(propertyValue);
                                                                }
                                                            }
                                                        }
                                                        if (companionBefore) {
                                                            $util$l.concatArray(fillBefore.objectAnimator, companionBefore);
                                                        }
                                                        if (companionAfter) {
                                                            $util$l.concatArray(fillAfter.objectAnimator, companionAfter);
                                                        }
                                                    }
                                                }
                                            }
                                            else if ($SvgBuild$1.isAnimate(item)) {
                                                let repeatCount;
                                                if (section === 1) {
                                                    repeatCount = partition.length > 1 ? '0' : '-1';
                                                }
                                                else {
                                                    repeatCount = item.iterationCount !== -1 ? Math.ceil(item.iterationCount - 1).toString() : '-1';
                                                }
                                                const options = this.createPropertyValue('', '', item.duration.toString(), valueType, '', item.delay > 0 ? item.delay.toString() : '', repeatCount);
                                                if (item.keySplines === undefined) {
                                                    if (item.timingFunction) {
                                                        options.interpolator = createPathInterpolator(item.timingFunction);
                                                    }
                                                    else if (this.options.animateInterpolator !== '') {
                                                        options.interpolator = this.options.animateInterpolator;
                                                    }
                                                }
                                                const beforeValues = [];
                                                let propertyNames;
                                                let values;
                                                if (!synchronized && options.valueType === 'pathType') {
                                                    if (group.pathData) {
                                                        let transforms;
                                                        let companion;
                                                        if (item.parent && $SvgBuild$1.isShape(item.parent)) {
                                                            companion = item.parent;
                                                            if (item.parent.path) {
                                                                transforms = item.parent.path.transformed;
                                                            }
                                                        }
                                                        propertyNames = ['pathData'];
                                                        values = $SvgPath.extrapolate(item.attributeName, group.pathData, item.values, transforms, companion, this.options.floatPrecisionValue);
                                                    }
                                                }
                                                else if ($SvgBuild$1.asAnimateTransform(item)) {
                                                    propertyNames = getTransformPropertyName(item.type);
                                                    if (propertyNames === undefined) {
                                                        continue;
                                                    }
                                                    values = getTransformValues(item);
                                                    if (checkBefore || requireBefore) {
                                                        $util$l.concatArray(beforeValues, $util$l.objectMap(propertyNames, value => getTransformInitialValue(value) || '0'));
                                                    }
                                                    transformOrigin = item.transformOrigin;
                                                    transforming = true;
                                                }
                                                else {
                                                    propertyNames = getAttributePropertyName(item.attributeName);
                                                    switch (options.valueType) {
                                                        case 'intType':
                                                            values = $util$l.objectMap(item.values, value => $util$l.convertInt(value).toString());
                                                            if (requireBefore && item.baseValue) {
                                                                $util$l.concatArray(beforeValues, $util$l.replaceMap($SvgBuild$1.parseCoordinates(item.baseValue), value => Math.trunc(value).toString()));
                                                            }
                                                            break;
                                                        case 'floatType':
                                                            switch (item.attributeName) {
                                                                case 'stroke-dasharray':
                                                                    values = $util$l.objectMap(item.values, value => $util$l.replaceMap(value.split(' '), fraction => parseFloat(fraction)));
                                                                    break;
                                                                default:
                                                                    values = item.values;
                                                                    break;
                                                            }
                                                            if (requireBefore && item.baseValue) {
                                                                $util$l.concatArray(beforeValues, $util$l.replaceMap($SvgBuild$1.parseCoordinates(item.baseValue), value => value.toString()));
                                                            }
                                                            break;
                                                        default:
                                                            values = item.values.slice(0);
                                                            if (isColorType(item.attributeName)) {
                                                                if (requireBefore && item.baseValue) {
                                                                    $util$l.concatArray(beforeValues, getColorValue(item.baseValue, true));
                                                                }
                                                                for (let i = 0; i < values.length; i++) {
                                                                    if (values[i] !== '') {
                                                                        values[i] = getColorValue(values[i]);
                                                                    }
                                                                }
                                                            }
                                                            break;
                                                    }
                                                }
                                                if (values && propertyNames) {
                                                    const keyName = item.synchronized ? item.synchronized.index + item.synchronized.value : (index !== 0 || propertyNames.length > 1 ? JSON.stringify(options) : '');
                                                    for (let i = 0; i < propertyNames.length; i++) {
                                                        const propertyName = propertyNames[i];
                                                        if (checkBefore) {
                                                            insertBeforeValue(propertyName, beforeValues[i]);
                                                        }
                                                        if (useKeyFrames && item.keyTimes.length > 1) {
                                                            if (supportedKeyFrames && options.valueType !== 'pathType') {
                                                                if (!checkBefore && requireBefore) {
                                                                    insertBeforeValue(propertyName, beforeValues[i]);
                                                                }
                                                                const propertyValuesHolder = animatorMap.get(keyName) || [];
                                                                const keyframe = [];
                                                                for (let j = 0; j < item.keyTimes.length; j++) {
                                                                    let value = getPropertyValue(values, j, i, true);
                                                                    if (value !== '') {
                                                                        value = $math$2.truncateString(value, this.options.floatPrecisionValue);
                                                                    }
                                                                    let interpolator = j > 0 && value !== '' && propertyName !== 'pivotX' && propertyName !== 'pivotY' ? getPathInterpolator(item.keySplines, j - 1) : '';
                                                                    if (interpolator === '' && item.isLoop(j)) {
                                                                        interpolator = createPathInterpolator($constS.KEYSPLINE_NAME['step-start']);
                                                                    }
                                                                    keyframe.push({
                                                                        interpolator,
                                                                        fraction: item.keyTimes[j] === 0 && value === '' ? '' : $math$2.truncate(item.keyTimes[j], this.options.floatPrecisionKeyTime),
                                                                        value
                                                                    });
                                                                }
                                                                propertyValuesHolder.push({ propertyName, keyframe });
                                                                if (!animatorMap.has(keyName)) {
                                                                    if (keyName !== '') {
                                                                        animatorMap.set(keyName, propertyValuesHolder);
                                                                    }
                                                                    (section === 0 ? repeating : fillCustom).objectAnimator.push(Object.assign({}, options, { propertyValuesHolder }));
                                                                }
                                                                transformOrigin = undefined;
                                                            }
                                                            else {
                                                                ordering = 'sequentially';
                                                                const translateData = getFillData('sequentially');
                                                                for (let j = 0; j < item.keyTimes.length; j++) {
                                                                    const propertyOptions = Object.assign({}, options, { propertyName, startOffset: j === 0 ? (item.delay + (item.keyTimes[j] > 0 ? Math.floor(item.keyTimes[j] * item.duration) : 0)).toString() : '', propertyValuesHolder: false });
                                                                    const valueTo = getPropertyValue(values, j, i, false, options.valueType === 'pathType' ? group.pathData : item.baseValue);
                                                                    if (valueTo) {
                                                                        let duration;
                                                                        if (j === 0) {
                                                                            if (!checkBefore && requireBefore) {
                                                                                propertyOptions.valueFrom = beforeValues[i];
                                                                            }
                                                                            else if (options.valueType === 'pathType') {
                                                                                propertyOptions.valueFrom = group.pathData || values[0].toString();
                                                                            }
                                                                            else {
                                                                                propertyOptions.valueFrom = item.baseValue || item.replaceValue || '';
                                                                            }
                                                                            duration = 0;
                                                                        }
                                                                        else {
                                                                            propertyOptions.valueFrom = getPropertyValue(values, j - 1, i).toString();
                                                                            duration = Math.floor((item.keyTimes[j] - item.keyTimes[j - 1]) * item.duration);
                                                                        }
                                                                        if (transformOrigin && transformOrigin[j]) {
                                                                            let direction;
                                                                            let translateTo = 0;
                                                                            if (propertyName.endsWith('X')) {
                                                                                direction = 'translateX';
                                                                                translateTo = transformOrigin[j].x;
                                                                            }
                                                                            else if (propertyName.endsWith('Y')) {
                                                                                direction = 'translateY';
                                                                                translateTo = transformOrigin[j].y;
                                                                            }
                                                                            if (direction) {
                                                                                const valueData = this.createPropertyValue(direction, translateTo.toString(), duration.toString(), 'floatType');
                                                                                valueData.interpolator = createPathInterpolator($constS.KEYSPLINE_NAME['step-start']);
                                                                                translateData.objectAnimator.push(valueData);
                                                                            }
                                                                        }
                                                                        let interpolator = j > 0 ? getPathInterpolator(item.keySplines, j - 1) : '';
                                                                        if (interpolator === '' && item.isLoop(j)) {
                                                                            interpolator = createPathInterpolator($constS.KEYSPLINE_NAME['step-start']);
                                                                        }
                                                                        propertyOptions.interpolator = interpolator;
                                                                        propertyOptions.duration = duration.toString();
                                                                        propertyOptions.valueTo = valueTo;
                                                                        repeating.objectAnimator.push(propertyOptions);
                                                                    }
                                                                }
                                                                if (translateData.objectAnimator.length) {
                                                                    setData.set.push(translateData);
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            const propertyOptions = Object.assign({}, options, { propertyName, interpolator: item.duration > 1 ? getPathInterpolator(item.keySplines, 0) : '', propertyValuesHolder: false });
                                                            if (Array.isArray(values[0])) {
                                                                const valueTo = values[values.length - 1][i];
                                                                if (values.length > 1) {
                                                                    const from = values[0][i];
                                                                    if (from !== valueTo) {
                                                                        propertyOptions.valueFrom = from.toString();
                                                                    }
                                                                }
                                                                propertyOptions.valueTo = valueTo.toString();
                                                            }
                                                            else {
                                                                let valueFrom;
                                                                if (values.length > 1) {
                                                                    valueFrom = values[0].toString();
                                                                    propertyOptions.valueTo = values[values.length - 1].toString();
                                                                }
                                                                else {
                                                                    valueFrom = item.from || (!checkBefore && requireBefore ? beforeValues[i] : '');
                                                                    propertyOptions.valueTo = item.to;
                                                                }
                                                                if (options.valueType === 'pathType') {
                                                                    propertyOptions.valueFrom = valueFrom || group.pathData || propertyOptions.valueTo;
                                                                }
                                                                else if (valueFrom && valueFrom !== propertyOptions.valueTo) {
                                                                    propertyOptions.valueFrom = convertValueType(item, valueFrom);
                                                                }
                                                            }
                                                            if (propertyOptions.valueTo) {
                                                                (section === 0 ? repeating : fillCustom).objectAnimator.push(propertyOptions);
                                                            }
                                                        }
                                                        if (section === 0 && !synchronized) {
                                                            setFillAfter(propertyName, repeating.objectAnimator);
                                                        }
                                                    }
                                                    if (requireBefore && transformOrigin && transformOrigin.length) {
                                                        insertBeforeValue('translateX', '0');
                                                        insertBeforeValue('translateY', '0');
                                                    }
                                                }
                                            }
                                        }
                                    });
                                    const valid = repeating.objectAnimator.length > 0 || fillCustom.objectAnimator.length > 0;
                                    if (ordering === 'sequentially') {
                                        if (valid && fillBefore.objectAnimator.length === 1) {
                                            repeating.objectAnimator.unshift(fillBefore.objectAnimator[0]);
                                            fillBefore.objectAnimator.length = 0;
                                        }
                                        if (fillCustom.objectAnimator.length === 1) {
                                            repeating.objectAnimator.push(fillCustom.objectAnimator[0]);
                                            fillCustom.objectAnimator.length = 0;
                                        }
                                        if (valid && fillAfter.objectAnimator.length === 1) {
                                            repeating.objectAnimator.push(fillAfter.objectAnimator[0]);
                                            fillAfter.objectAnimator.length = 0;
                                        }
                                    }
                                    if (fillBefore.objectAnimator.length === 0 && fillCustom.objectAnimator.length === 0 && fillAfter.objectAnimator.length === 0) {
                                        if (ordering === 'sequentially' && repeating.objectAnimator.length === 1) {
                                            ordering = '';
                                        }
                                        if (setData.ordering !== 'sequentially' && ordering !== 'sequentially') {
                                            $util$l.concatArray(together, repeating.objectAnimator);
                                            repeating.objectAnimator.length = 0;
                                        }
                                    }
                                    if (repeating.objectAnimator.length > 0 || fillCustom.objectAnimator.length > 0) {
                                        if (fillBefore.objectAnimator.length) {
                                            setData.ordering = 'sequentially';
                                            setData.set.push(fillBefore);
                                        }
                                        if (repeating.objectAnimator.length) {
                                            repeating.ordering = ordering;
                                            setData.set.push(repeating);
                                        }
                                        if (fillCustom.objectAnimator.length) {
                                            setData.ordering = 'sequentially';
                                            setData.set.push(fillCustom);
                                        }
                                        if (fillAfter.objectAnimator.length) {
                                            setData.ordering = 'sequentially';
                                            setData.set.push(fillAfter);
                                        }
                                    }
                                    if (together.length) {
                                        $util$l.concatArray(setData.objectAnimator, together);
                                    }
                                }
                                if (setData.set.length || setData.objectAnimator.length) {
                                    targetSetTemplate.set.push(setData);
                                }
                            });
                            if (targetSetTemplate.set.length) {
                                let modified = false;
                                if (targetSetTemplate.set.length > 1 && targetSetTemplate.set.every(item => item.ordering === '')) {
                                    const setData = {
                                        set: [],
                                        objectAnimator: []
                                    };
                                    for (const item of targetSetTemplate.set) {
                                        $util$l.concatArray(setData.set, item.set);
                                        $util$l.concatArray(setData.objectAnimator, item.objectAnimator);
                                    }
                                    targetSetTemplate = setData;
                                }
                                while (targetSetTemplate.set.length === 1) {
                                    const setData = targetSetTemplate.set[0];
                                    if ((!modified || setData.ordering === '') && setData.objectAnimator.length === 0) {
                                        targetSetTemplate = setData;
                                        modified = true;
                                    }
                                    else {
                                        break;
                                    }
                                }
                                targetSetTemplate['xmlns:android'] = XMLNS_ANDROID.android;
                                if (modified) {
                                    targetSetTemplate['android:ordering'] = targetSetTemplate.ordering;
                                    targetSetTemplate.ordering = undefined;
                                }
                                targetData.animation = Resource.insertStoredAsset('animators', getFilename('anim', name), $xml$3.applyTemplate('set', OBJECTANIMATOR_TMPL, [targetSetTemplate]));
                                if (targetData.animation !== '') {
                                    targetData.animation = `@anim/${targetData.animation}`;
                                    data[0].target.push(targetData);
                                }
                            }
                        }
                        if (data[0].target) {
                            vectorName = Resource.insertStoredAsset('drawables', getFilename('anim'), $xml$3.applyTemplate('animated-vector', ANIMATEDVECTOR_TMPL, data));
                        }
                    }
                    if (this.IMAGE_DATA.length) {
                        const item = [];
                        if (vectorName !== '') {
                            item.push({ drawable: getDrawableSrc(vectorName) });
                        }
                        const data = [{
                                'xmlns:android': XMLNS_ANDROID.android,
                                item
                            }];
                        for (const image of this.IMAGE_DATA) {
                            const scaleX = svg.width / svg.viewBox.width;
                            const scaleY = svg.height / svg.viewBox.height;
                            let x = image.getBaseValue('x', 0) * scaleX;
                            let y = image.getBaseValue('y', 0) * scaleY;
                            let width = image.getBaseValue('width', 0);
                            let height = image.getBaseValue('height', 0);
                            const offset = getParentOffset(image.element, svg.element);
                            x += offset.x;
                            y += offset.y;
                            width *= scaleX;
                            height *= scaleY;
                            const imageData = {
                                width: $util$l.formatPX(width),
                                height: $util$l.formatPX(height),
                                left: x !== 0 ? $util$l.formatPX(x) : '',
                                top: y !== 0 ? $util$l.formatPX(y) : ''
                            };
                            const src = getDrawableSrc(Resource.addImage({ mdpi: image.href }));
                            if (image.rotateAngle) {
                                imageData.rotate = {
                                    drawable: src,
                                    fromDegrees: image.rotateAngle.toString(),
                                    visible: image.visible ? 'true' : 'false'
                                };
                            }
                            else {
                                imageData.drawable = src;
                            }
                            item.push(imageData);
                        }
                        drawable = Resource.insertStoredAsset('drawables', templateName, $xml$3.applyTemplate('layer-list', LAYERLIST_TMPL, data));
                    }
                    else {
                        drawable = vectorName;
                    }
                    if (drawable !== '') {
                        if (node.localSettings.targetAPI >= 21 /* LOLLIPOP */) {
                            node.android('src', getDrawableSrc(drawable));
                        }
                        else {
                            node.app('srcCompat', getDrawableSrc(drawable));
                        }
                    }
                    if (!node.hasWidth) {
                        node.android('layout_width', 'wrap_content');
                    }
                    if (!node.hasHeight) {
                        node.android('layout_height', 'wrap_content');
                    }
                }
            }
        }
        afterFinalize() {
            this.application.controllerHandler.localSettings.svg.enabled = false;
        }
        parseVectorData(group) {
            const groupData = this.createGroup(group);
            for (const item of group) {
                if (item.visible) {
                    const CCC = [];
                    const DDD = [];
                    const render = [[]];
                    const clipGroup = [];
                    if ($SvgBuild$1.isShape(item)) {
                        if (item.path && item.path.value) {
                            const path = this.createPath(item, item.path, render);
                            if (item.path.strokeWidth && (item.path.strokeDasharray || item.path.strokeDashoffset)) {
                                const animateData = this.ANIMATE_DATA.get(item.name);
                                if (animateData === undefined || animateData.animate.every(animate => animate.attributeName.startsWith('stroke-dash'))) {
                                    const [strokeDash, pathValue, pathData] = item.path.extractStrokeDash(animateData && animateData.animate, this.options.floatPrecisionValue);
                                    if (strokeDash) {
                                        const name = getVectorName(item, 'stroke');
                                        if (pathValue !== '') {
                                            path.pathData = pathValue;
                                        }
                                        if (pathData !== '') {
                                            clipGroup.push({ pathData });
                                        }
                                        for (let i = 0; i < strokeDash.length; i++) {
                                            const pathObject = i === 0 ? path : Object.assign({}, path);
                                            pathObject.name = `${name}_${i}`;
                                            if (animateData) {
                                                this.ANIMATE_DATA.set(pathObject.name, {
                                                    element: animateData.element,
                                                    animate: $util$l.filterArray(animateData.animate, animate => animate.id === undefined || animate.id === i)
                                                });
                                            }
                                            pathObject.trimPathStart = $math$2.truncate(strokeDash[i].start, this.options.floatPrecisionValue);
                                            pathObject.trimPathEnd = $math$2.truncate(strokeDash[i].end, this.options.floatPrecisionValue);
                                            CCC.push(pathObject);
                                        }
                                        if (animateData) {
                                            this.ANIMATE_DATA.delete(item.name);
                                        }
                                        render[0].push({ name });
                                    }
                                }
                            }
                            if (CCC.length === 0) {
                                CCC.push(path);
                            }
                        }
                        else {
                            continue;
                        }
                    }
                    else if ($SvgBuild$1.asImage(item)) {
                        if (!$SvgBuild$1.asPattern(group)) {
                            if (item.width === 0 || item.height === 0) {
                                const image = this.application.session.image.get(item.href);
                                if (image && image.width > 0 && image.height > 0) {
                                    item.width = image.width;
                                    item.height = image.height;
                                    item.setRect();
                                }
                            }
                            item.extract(this.options.transformExclude.image);
                            this.IMAGE_DATA.push(item);
                        }
                        continue;
                    }
                    else if ($SvgBuild$1.isContainer(item)) {
                        if (item.length) {
                            this.parseVectorData(item);
                            DDD.push({ templateName: item.name });
                        }
                        else {
                            continue;
                        }
                    }
                    groupData.BB.push({ render, clipGroup, CCC, DDD });
                }
            }
            this.VECTOR_DATA.set(group.name, groupData);
        }
        createGroup(target) {
            const region = [[]];
            const clipRegion = [];
            const path = [[]];
            const clipPath = [];
            const result = {
                region,
                clipRegion,
                path,
                clipPath,
                BB: []
            };
            const transformData = {};
            if ((target !== this.SVG_INSTANCE && $SvgBuild$1.asSvg(target) || $SvgBuild$1.asUseSymbol(target) || $SvgBuild$1.asUsePattern(target)) && (target.x !== 0 || target.y !== 0)) {
                transformData.name = getVectorName(target, 'main');
                transformData.translateX = target.x.toString();
                transformData.translateY = target.y.toString();
            }
            if (target.clipRegion !== '') {
                this.createClipPath(target, clipRegion, target.clipRegion);
            }
            if (clipRegion.length || Object.keys(transformData).length) {
                region[0].push(transformData);
            }
            if (target !== this.SVG_INSTANCE) {
                const baseData = {};
                const [transforms] = groupTransforms(target.element, target.transforms, true);
                const groupName = getVectorName(target, 'animate');
                if (($SvgBuild$1.asG(target) || $SvgBuild$1.asUseSymbol(target)) && $util$l.hasValue(target.clipPath) && this.createClipPath(target, clipPath, target.clipPath)) {
                    baseData.name = groupName;
                }
                if (this.queueAnimations(target, groupName, item => $SvgBuild$1.asAnimateTransform(item))) {
                    baseData.name = groupName;
                }
                if (Object.keys(baseData).length) {
                    path[0].push(baseData);
                }
                if (transforms.length) {
                    const transformed = [];
                    for (const data of transforms) {
                        path[0].push(createTransformData(data));
                        $util$l.concatArray(transformed, data);
                    }
                    target.transformed = transformed.reverse();
                }
            }
            return result;
        }
        createPath(target, path, render) {
            const clipElement = [];
            const result = {
                name: target.name,
                clipElement,
            };
            if ($SvgBuild$1.asUse(target) && $util$l.hasValue(target.clipPath)) {
                this.createClipPath(target, clipElement, target.clipPath);
            }
            if ($util$l.hasValue(path.clipPath)) {
                const shape = new $SvgShape(path.element);
                shape.build({
                    exclude: this.options.transformExclude,
                    residual: partitionTransforms,
                    precision: this.options.floatPrecisionValue
                });
                shape.synchronize({
                    keyTimeMode: this.SYNCHRONIZE_MODE,
                    precision: this.options.floatPrecisionValue
                });
                this.createClipPath(shape, clipElement, path.clipPath);
            }
            const baseData = {};
            const groupName = getVectorName(target, 'group');
            if (this.queueAnimations(target, groupName, item => $SvgBuild$1.asAnimateTransform(item))) {
                baseData.name = groupName;
            }
            else if (clipElement.length) {
                baseData.name = '';
            }
            if ($SvgBuild$1.asUse(target) && (target.x !== 0 || target.y !== 0)) {
                baseData.translateX = target.x.toString();
                baseData.translateY = target.y.toString();
            }
            if (Object.keys(baseData).length) {
                render[0].push(baseData);
            }
            if (path.transformResidual) {
                for (const item of path.transformResidual) {
                    render[0].push(createTransformData(item));
                }
            }
            const opacity = getOuterOpacity(target);
            for (let attr in path) {
                let value = path[attr];
                if ($util$l.isString(value)) {
                    switch (attr) {
                        case 'value':
                            attr = 'pathData';
                            break;
                        case 'fill':
                        case 'stroke':
                            attr += 'Color';
                            if (!result[attr]) {
                                const colorName = Resource.addColor(value);
                                if (colorName !== '') {
                                    value = `@color/${colorName}`;
                                }
                            }
                            else {
                                continue;
                            }
                            break;
                        case 'fillPattern':
                            const gradient = this.SVG_INSTANCE.definitions.gradient.get(value);
                            let valid = false;
                            if (gradient) {
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
                                        const backgroundGradient = createFillGradient(gradient, path, this.options.floatPrecisionValue);
                                        if (backgroundGradient) {
                                            value = [{ gradient: [backgroundGradient] }];
                                            valid = true;
                                        }
                                        break;
                                    }
                                }
                            }
                            if (valid) {
                                attr = 'fillColor';
                                this.NAMESPACE_AAPT = true;
                            }
                            else {
                                continue;
                            }
                            break;
                        case 'fillRule':
                            if (value === 'evenodd') {
                                attr = 'fillType';
                                value = 'evenOdd';
                            }
                            else {
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
                            value = (($util$l.isNumber(value) ? parseFloat(value) : 1) * opacity).toString();
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
            const replaceMap = new Map();
            const transformResult = [];
            const replaceResult = [];
            const pathData = path.value;
            let previousPathData = pathData;
            let index = 0;
            for (const item of target.animations) {
                if ($SvgBuild$1.asAnimateTransform(item) && !item.additiveSum && item.transformFrom) {
                    let time = Math.max(0, item.delay - 1);
                    replaceMap.set(time, {
                        index,
                        time,
                        to: item.transformFrom,
                        reset: false,
                        animate: item
                    });
                    if (item.iterationCount !== -1 && item.fillReplace) {
                        time = item.delay + item.iterationCount * item.duration;
                        if (!replaceMap.has(time)) {
                            replaceMap.set(time, {
                                index,
                                time,
                                to: pathData,
                                reset: true
                            });
                        }
                    }
                    index++;
                }
            }
            const replaceData = Array.from(replaceMap.values()).sort((a, b) => a.time < b.time ? -1 : 1);
            for (let i = 0; i < replaceData.length; i++) {
                const item = replaceData[i];
                if (!item.reset || item.to !== previousPathData) {
                    let valid = true;
                    if (item.reset) {
                        invalid: {
                            for (let j = 0; j < i; j++) {
                                const previous = replaceData[j];
                                if (!previous.reset) {
                                    for (let k = i + 1; k < replaceData.length; k++) {
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
                    }
                    else {
                        const itemTotal = [];
                        const previousType = new Set();
                        for (let j = 0; j < i; j++) {
                            const previous = replaceData[j];
                            itemTotal[previous.index] = itemTotal[previous.index] ? 2 : 1;
                        }
                        for (let j = 0; j < itemTotal.length; j++) {
                            if (itemTotal[j] === 1) {
                                const transform = replaceData.find(data => data.index === j && data.animate !== undefined);
                                if (transform && transform.animate) {
                                    previousType.add(transform.animate.type);
                                }
                            }
                        }
                        for (const type of previousType) {
                            const propertyName = getTransformPropertyName(type);
                            if (propertyName) {
                                const initialValue = $utilS.TRANSFORM.typeAsValue(type).split(' ');
                                for (let j = 0; j < initialValue.length; j++) {
                                    transformResult.push(createAnimateFromTo(propertyName[j], item.time, initialValue[j], ''));
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
            if (!this.queueAnimations(target, result.name, item => ($SvgBuild$1.asAnimate(item) || $SvgBuild$1.asSet(item)) && item.attributeName !== 'clip-path', pathData) && replaceResult.length === 0) {
                result.name = '';
            }
            if (transformResult.length) {
                const data = this.ANIMATE_DATA.get(groupName);
                if (data) {
                    $util$l.concatArray(data.animate, transformResult);
                }
            }
            if (replaceResult.length) {
                const data = this.ANIMATE_DATA.get(result.name);
                if (data) {
                    $util$l.concatArray(data.animate, replaceResult);
                }
                else {
                    this.ANIMATE_DATA.set(result.name, {
                        element: target.element,
                        animate: replaceResult,
                        pathData
                    });
                }
            }
            return result;
        }
        createClipPath(target, clipArray, clipPath) {
            let result = 0;
            clipPath.split(';').forEach((value, index, array) => {
                if (value.charAt(0) === '#') {
                    const element = this.SVG_INSTANCE.definitions.clipPath.get(value);
                    if (element) {
                        const g = new $SvgG(element);
                        g.build({
                            exclude: this.options.transformExclude,
                            residual: partitionTransforms,
                            precision: this.options.floatPrecisionValue
                        });
                        g.synchronize({
                            keyTimeMode: this.SYNCHRONIZE_MODE,
                            precision: this.options.floatPrecisionValue
                        });
                        g.each((child) => {
                            if (child.path && child.path.value) {
                                let name = getVectorName(child, 'clip_path', array.length > 1 ? index + 1 : -1);
                                if (!this.queueAnimations(child, name, item => $SvgBuild$1.asAnimate(item) || $SvgBuild$1.asSet(item), child.path.value)) {
                                    name = '';
                                }
                                clipArray.push({ name, pathData: child.path.value });
                            }
                        });
                    }
                    result++;
                }
                else {
                    let name = getVectorName(target, 'clip_path', array.length > 1 ? index + 1 : -1);
                    if (!this.queueAnimations(target, name, item => ($SvgBuild$1.asAnimate(item) || $SvgBuild$1.asSet(item)) && item.attributeName === 'clip-path', value)) {
                        name = '';
                    }
                    clipArray.push({ name, pathData: value });
                    result++;
                }
            });
            return result > 0;
        }
        queueAnimations(svg, name, predicate, pathData = '') {
            if (svg.animations.length) {
                const animate = $util$l.filterArray(svg.animations, (item, index, array) => !item.paused && (item.duration > 0 || item.setterType) && predicate(item, index, array));
                if (animate.length) {
                    this.ANIMATE_DATA.set(name, {
                        element: svg.element,
                        animate,
                        pathData
                    });
                    return true;
                }
            }
            return false;
        }
        createPropertyValue(propertyName, valueTo, duration, valueType, valueFrom = '', startOffset = '', repeatCount = '0') {
            return {
                propertyName,
                startOffset,
                duration,
                repeatCount,
                valueType,
                valueFrom: $util$l.isNumber(valueFrom) ? $math$2.truncateString(valueFrom, this.options.floatPrecisionValue) : valueFrom,
                valueTo: $util$l.isNumber(valueTo) ? $math$2.truncateString(valueTo, this.options.floatPrecisionValue) : valueTo,
                propertyValuesHolder: false
            };
        }
    }

    const settings = {
        builtInExtensions: [
            'android.delegate.fixed',
            'android.delegate.max-width-height',
            'android.delegate.percent',
            'android.delegate.radiogroup',
            'android.delegate.scrollbar',
            'squared.external',
            'squared.substitute',
            'squared.sprite',
            'squared.css-grid',
            'squared.flexbox',
            'squared.table',
            'squared.list',
            'squared.grid',
            'squared.relative',
            'squared.verticalalign',
            'squared.whitespace',
            'squared.accessibility',
            'android.constraint.guideline',
            'android.resource.includes',
            'android.resource.background',
            'android.resource.svg',
            'android.resource.strings',
            'android.resource.fonts',
            'android.resource.dimens',
            'android.resource.styles'
        ],
        targetAPI: 28,
        resolutionDPI: 160,
        supportRTL: true,
        preloadImages: true,
        maxWordWrapWidth: 1024,
        supportNegativeLeftTop: true,
        collapseUnattributedElements: true,
        exclusionsDisabled: true,
        customizationsDisabled: true,
        customizationsOverwritePrivilege: true,
        showAttributes: true,
        convertPixels: 'dp',
        insertSpaces: 4,
        handleExtensionsAsync: true,
        autoCloseOnWrite: true,
        manifestLabelAppName: 'android',
        manifestThemeName: 'AppTheme',
        manifestParentThemeName: 'Theme.AppCompat.Light.NoActionBar',
        outputDirectory: 'app/src/main',
        outputMainFileName: 'activity_main.xml',
        outputArchiveFileType: 'zip',
        outputMaxProcessingTime: 30
    };

    let initialized = false;
    let application;
    let fileHandler;
    let userSettings;
    const framework = 2 /* ANDROID */;
    function autoClose() {
        if (application && application.userSettings.autoCloseOnWrite && !application.initialized && !application.closed) {
            application.finalize();
            return true;
        }
        return false;
    }
    function checkApplication(main) {
        return initialized && !!main && (main.closed || autoClose());
    }
    const lib = {
        constant,
        customization,
        enumeration,
        util
    };
    const appBase = {
        base: {
            Controller,
            File,
            Resource,
            View
        },
        extensions: {
            Accessibility,
            CssGrid,
            External,
            Flexbox,
            Grid,
            List,
            Relative,
            Sprite,
            Substitute,
            Table,
            VerticalAlign,
            WhiteSpace,
            constraint: {
                Guideline: Guideline
            },
            delegate: {
                Fixed: Fixed,
                MaxWidthHeight: MaxWidthHeight,
                Percent: Percent,
                RadioGroup: RadioGroup,
                ScrollBar: ScrollBar
            },
            resource: {
                Background: ResourceBackground,
                Dimens: ResourceDimens,
                Fonts: ResourceFonts,
                Includes: ResourceIncludes,
                Strings: ResourceStrings,
                Styles: ResourceStyles,
                Svg: ResourceSvg
            }
        },
        lib,
        system: {
            customize(build, widget, options) {
                if (API_ANDROID[build]) {
                    const assign = API_ANDROID[build].assign;
                    if (assign[widget] === undefined) {
                        assign[widget] = options;
                    }
                    else {
                        Object.assign(assign[widget], options);
                    }
                    return assign[widget];
                }
                return undefined;
            },
            addXmlNs(name, uri) {
                XMLNS_ANDROID[name] = uri;
            },
            writeLayoutAllXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.layoutAllToXml(application.sessionData, saveToDisk);
                }
                return {};
            },
            writeResourceAllXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.resourceAllToXml(saveToDisk);
                }
                return {};
            },
            writeResourceStringXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.resourceStringToXml(saveToDisk);
                }
                return [];
            },
            writeResourceArrayXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.resourceStringArrayToXml(saveToDisk);
                }
                return [];
            },
            writeResourceFontXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.resourceFontToXml(saveToDisk);
                }
                return [];
            },
            writeResourceColorXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.resourceColorToXml(saveToDisk);
                }
                return [];
            },
            writeResourceStyleXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.resourceStyleToXml(saveToDisk);
                }
                return [];
            },
            writeResourceDimenXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.resourceDimenToXml(saveToDisk);
                }
                return [];
            },
            writeResourceDrawableXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.resourceDrawableToXml(saveToDisk);
                }
                return [];
            },
            writeResourceDrawableImageXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.resourceDrawableImageToXml(saveToDisk);
                }
                return [];
            },
            writeResourceAnimXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.resourceAnimToXml(saveToDisk);
                }
                return [];
            }
        },
        create() {
            const EN = squared.base.lib.constant.EXT_NAME;
            const EA = EXT_ANDROID;
            application = new squared.base.Application(framework, View, Controller, Resource, ExtensionManager);
            fileHandler = new File(application.resourceHandler);
            userSettings = Object.assign({}, settings);
            Object.assign(application.builtInExtensions, {
                [EN.EXTERNAL]: new External(EN.EXTERNAL, framework),
                [EN.SUBSTITUTE]: new Substitute(EN.SUBSTITUTE, framework),
                [EN.SPRITE]: new Sprite(EN.SPRITE, framework),
                [EN.CSS_GRID]: new CssGrid(EN.CSS_GRID, framework),
                [EN.FLEXBOX]: new Flexbox(EN.FLEXBOX, framework),
                [EN.TABLE]: new Table(EN.TABLE, framework, ['TABLE']),
                [EN.LIST]: new List(EN.LIST, framework, ['DIV', 'UL', 'OL', 'DL']),
                [EN.GRID]: new Grid(EN.GRID, framework, ['DIV', 'FORM', 'UL', 'OL', 'DL', 'TABLE', 'NAV', 'SECTION', 'ASIDE', 'MAIN', 'HEADER', 'FOOTER', 'P', 'ARTICLE', 'FIELDSET']),
                [EN.RELATIVE]: new Relative(EN.RELATIVE, framework),
                [EN.VERTICAL_ALIGN]: new VerticalAlign(EN.VERTICAL_ALIGN, framework),
                [EN.WHITESPACE]: new WhiteSpace(EN.WHITESPACE, framework),
                [EN.ACCESSIBILITY]: new Accessibility(EN.ACCESSIBILITY, framework),
                [EA.CONSTRAINT_GUIDELINE]: new Guideline(EA.CONSTRAINT_GUIDELINE, framework),
                [EA.DELEGATE_FIXED]: new Fixed(EA.DELEGATE_FIXED, framework),
                [EA.DELEGATE_MAXWIDTHHEIGHT]: new MaxWidthHeight(EA.DELEGATE_MAXWIDTHHEIGHT, framework),
                [EA.DELEGATE_PERCENT]: new Percent(EA.DELEGATE_PERCENT, framework),
                [EA.DELEGATE_RADIOGROUP]: new RadioGroup(EA.DELEGATE_RADIOGROUP, framework),
                [EA.DELEGATE_SCROLLBAR]: new ScrollBar(EA.DELEGATE_SCROLLBAR, framework),
                [EA.RESOURCE_INCLUDES]: new ResourceIncludes(EA.RESOURCE_INCLUDES, framework),
                [EA.RESOURCE_BACKGROUND]: new ResourceBackground(EA.RESOURCE_BACKGROUND, framework),
                [EA.RESOURCE_SVG]: new ResourceSvg(EA.RESOURCE_SVG, framework),
                [EA.RESOURCE_STRINGS]: new ResourceStrings(EA.RESOURCE_STRINGS, framework),
                [EA.RESOURCE_FONTS]: new ResourceFonts(EA.RESOURCE_FONTS, framework),
                [EA.RESOURCE_DIMENS]: new ResourceDimens(EA.RESOURCE_DIMENS, framework),
                [EA.RESOURCE_STYLES]: new ResourceStyles(EA.RESOURCE_STYLES, framework)
            });
            initialized = true;
            return {
                application,
                framework,
                userSettings
            };
        },
        cached() {
            if (initialized) {
                return {
                    application,
                    framework,
                    userSettings
                };
            }
            return appBase.create();
        }
    };

    return appBase;

}());
