/* android-framework 1.13.0
   https://github.com/anpham6/squared */

var android = (function () {
    'use strict';

    const isTargeted = (node, target) =>
        node.element === target || node.elementId === target || node.controlId === target;
    class Application extends squared.base.ApplicationUI {
        constructor() {
            super(...arguments);
            this.systemName = 'android';
        }
        resolveTarget(sessionId, target) {
            if (target) {
                for (const node of this.getProcessingCache(sessionId)) {
                    if (isTargeted(node, target)) {
                        return node;
                    }
                }
                for (const [id, item] of this.session.active.entries()) {
                    if (id !== sessionId) {
                        for (const node of item.cache) {
                            if (isTargeted(node, target)) {
                                return node;
                            }
                        }
                    }
                }
            }
            return undefined;
        }
        set viewModel(value) {
            this._viewModel = value;
        }
        get viewModel() {
            return this._viewModel;
        }
    }

    var CONTAINER_NODE;
    (function (CONTAINER_NODE) {
        CONTAINER_NODE[(CONTAINER_NODE['RADIO'] = 1)] = 'RADIO';
        CONTAINER_NODE[(CONTAINER_NODE['CHECKBOX'] = 2)] = 'CHECKBOX';
        CONTAINER_NODE[(CONTAINER_NODE['SELECT'] = 3)] = 'SELECT';
        CONTAINER_NODE[(CONTAINER_NODE['SVG'] = 4)] = 'SVG';
        CONTAINER_NODE[(CONTAINER_NODE['IMAGE'] = 5)] = 'IMAGE';
        CONTAINER_NODE[(CONTAINER_NODE['BUTTON'] = 6)] = 'BUTTON';
        CONTAINER_NODE[(CONTAINER_NODE['PROGRESS'] = 7)] = 'PROGRESS';
        CONTAINER_NODE[(CONTAINER_NODE['RANGE'] = 8)] = 'RANGE';
        CONTAINER_NODE[(CONTAINER_NODE['EDIT'] = 9)] = 'EDIT';
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

    var enumeration = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        get CONTAINER_NODE() {
            return CONTAINER_NODE;
        },
    });

    const EXT_ANDROID = {
        EXTERNAL: 'android.external',
        SUBSTITUTE: 'android.substitute',
        DELEGATE_BACKGROUND: 'android.delegate.background',
        DELEGATE_MAXWIDTHHEIGHT: 'android.delegate.max-width-height',
        DELEGATE_NEGATIVEX: 'android.delegate.negative-x',
        DELEGATE_PERCENT: 'android.delegate.percent',
        DELEGATE_POSITIVEX: 'android.delegate.positive-x',
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
        RESOURCE_DATA: 'android.resource.data',
        RESOURCE_STYLES: 'android.resource.styles',
    };
    const CONTAINER_ANDROID = {
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
    const CONTAINER_ANDROID_X = {
        VERTICAL_SCROLL: 'androidx.core.widget.NestedScrollView',
        CONSTRAINT: 'androidx.constraintlayout.widget.ConstraintLayout',
        GUIDELINE: 'androidx.constraintlayout.widget.Guideline',
        BARRIER: 'androidx.constraintlayout.widget.Barrier',
    };
    const SUPPORT_ANDROID = {
        DRAWER: 'android.support.v4.widget.DrawerLayout',
        NAVIGATION_VIEW: 'android.support.design.widget.NavigationView',
        COORDINATOR: 'android.support.design.widget.CoordinatorLayout',
        APPBAR: 'android.support.design.widget.AppBarLayout',
        COLLAPSING_TOOLBAR: 'android.support.design.widget.CollapsingToolbarLayout',
        TOOLBAR: 'android.support.v7.widget.Toolbar',
        FLOATING_ACTION_BUTTON: 'android.support.design.widget.FloatingActionButton',
        BOTTOM_NAVIGATION: 'android.support.design.widget.BottomNavigationView',
    };
    const SUPPORT_ANDROID_X = {
        DRAWER: 'androidx.drawerlayout.widget.DrawerLayout',
        NAVIGATION_VIEW: 'com.google.android.material.navigation.NavigationView',
        COORDINATOR: 'androidx.coordinatorlayout.widget.CoordinatorLayout',
        APPBAR: 'com.google.android.material.appbar.AppBarLayout',
        COLLAPSING_TOOLBAR: 'com.google.android.material.appbar.CollapsingToolbarLayout',
        TOOLBAR: 'androidx.appcompat.widget.Toolbar',
        FLOATING_ACTION_BUTTON: 'com.google.android.material.floatingactionbutton.FloatingActionButton',
        BOTTOM_NAVIGATION: 'com.google.android.material.bottomnavigation.BottomNavigationView',
    };
    const ELEMENT_ANDROID = {
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
    const LAYOUT_ANDROID = {
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
    const XMLNS_ANDROID = {
        android: 'http://schemas.android.com/apk/res/android',
        app: 'http://schemas.android.com/apk/res-auto',
        aapt: 'http://schemas.android.com/aapt',
        tools: 'http://schemas.android.com/tools',
    };
    const STRING_ANDROID = {
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
        PADDING_LEFT: 'paddingLeft',
    };
    const LOCALIZE_ANDROID = {
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
        'while',
    ];

    var constant = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        EXT_ANDROID: EXT_ANDROID,
        CONTAINER_ANDROID: CONTAINER_ANDROID,
        CONTAINER_ANDROID_X: CONTAINER_ANDROID_X,
        SUPPORT_ANDROID: SUPPORT_ANDROID,
        SUPPORT_ANDROID_X: SUPPORT_ANDROID_X,
        ELEMENT_ANDROID: ELEMENT_ANDROID,
        LAYOUT_ANDROID: LAYOUT_ANDROID,
        XMLNS_ANDROID: XMLNS_ANDROID,
        STRING_ANDROID: STRING_ANDROID,
        LOCALIZE_ANDROID: LOCALIZE_ANDROID,
        RESERVED_JAVA: RESERVED_JAVA,
    });

    const { findColorShade, parseColor } = squared.lib.color;
    const { extractURL, getSrcSet } = squared.lib.css;
    const { FILE } = squared.lib.regex;
    const {
        fromLastIndexOf,
        hasMimeType,
        isNumber,
        isPlainObject,
        isString,
        resolvePath,
        safeNestedArray,
        spliceArray,
        trimString,
    } = squared.lib.util;
    const STORED = squared.base.ResourceUI.STORED;
    let CACHE_IMAGE = {};
    function formatObject(obj, numberAlias) {
        var _a;
        for (const attr in obj) {
            if (isPlainObject(obj[attr])) {
                formatObject(obj, numberAlias);
            } else {
                const value = (_a = obj[attr]) === null || _a === void 0 ? void 0 : _a.toString();
                if (value) {
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
                this._imageFormat = spliceArray(mimeType.slice(0), value => value === 'image/svg+xml');
            }
        }
        static formatOptions(options, numberAlias) {
            for (const namespace in options) {
                const obj = options[namespace];
                if (isPlainObject(obj)) {
                    formatObject(obj, numberAlias);
                }
            }
            return options;
        }
        static formatName(value) {
            if (/^\d/.test(value)) {
                value = '__' + value;
            }
            return value.replace(/[^\w]+/g, '_');
        }
        static addTheme(theme) {
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
            const filename = path + '/' + file;
            const storedFile = themes.get(filename) || new Map();
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
            } else {
                appTheme = name;
            }
            name = appTheme + (name.charAt(0) === '.' ? name : '');
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
            if (value !== '') {
                const numeric = isNumber(value);
                if (!numeric || numberAlias) {
                    const strings = STORED.strings;
                    for (const [resourceName, resourceValue] of strings.entries()) {
                        if (resourceValue === value) {
                            return '@string/' + resourceName;
                        }
                    }
                    const partial = trimString(
                        (name || (value.length > 64 ? value.substring(0, 64) : value))
                            .replace(/(\\[nt]|<\/?[a-z]+>|&#?[A-Za-z\d]{2,};)/g, '_')
                            .replace(/[^A-Za-z\d]+/g, '_'),
                        '_'
                    ).split(/_+/);
                    if (partial.length > 1) {
                        if (partial.length > 4) {
                            partial.length = 4;
                        }
                        name = partial.join('_');
                    } else {
                        name = partial[0];
                    }
                    name = name.toLowerCase();
                    if (!name) {
                        name = `__symbol${++Resource.SYMBOL_COUNTER}`;
                    } else if (numeric || /^\d/.test(name) || RESERVED_JAVA.includes(name)) {
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
                if (!imageFormat || length === 0 || hasMimeType(imageFormat, ext)) {
                    const asset = Resource.insertStoredAsset(
                        'images',
                        Resource.formatName(
                            prefix + src.substring(0, src.length - (length > 0 ? length + 1 : 0))
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
        reset() {
            super.reset();
            CACHE_IMAGE = {};
            Resource.UUID_COUNTER = 0;
            Resource.SYMBOL_COUNTER = 0;
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
                    for (const image of imageSet) {
                        const pixelRatio = image.pixelRatio;
                        if (pixelRatio > 0) {
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
                if (!mdpi) {
                    mdpi = element.src;
                }
            }
            if (mdpi) {
                const rawData = this.application.resourceHandler.getRawData(mdpi);
                if (rawData) {
                    if (rawData.base64) {
                        const filename = rawData.filename;
                        this.application.resourceHandler.writeRawImage(rawData.mimeType, {
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
        writeRawImage(mimeType, options) {
            const asset = super.writeRawImage(mimeType, options);
            if (
                asset &&
                this.userSettings.compressImages &&
                Resource.canCompressImage(options.filename || '', mimeType)
            ) {
                safeNestedArray(asset, 'compress').unshift({ format: 'png' });
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
    Resource.UUID_COUNTER = 0;
    Resource.SYMBOL_COUNTER = 0;

    function substitute(result, value, api, minApi = 0) {
        if (!api || api >= minApi) {
            result['attr'] = value;
            return true;
        }
        return false;
    }
    const API_ANDROID = {
        [29 /* Q */]: {
            android: {},
            assign: {},
        },
        [28 /* PIE */]: {
            android: {
                'allowAudioPlaybackCapture': false,
                'enforceNavigationBarContrast': false,
                'enforceStatusBarContrast': false,
                'forceDarkAllowed': false,
                'forceUriPermissions': false,
                'foregroundServiceType': false,
                'hasFragileUserData': false,
                'identifier': false,
                'inheritShowWhenLocked': false,
                'interactiveUiTimeout': false,
                'isLightTheme': false,
                'isSplitRequired': false,
                'minAspectRatio': false,
                'nonInteractiveUiTimeout': false,
                'opticalInsetBottom': false,
                'opticalInsetLeft': false,
                'opticalInsetRight': false,
                'opticalInsetTop': false,
                'packageType': false,
                'requestLegacyExternalStorage': false,
                'secureElementName': false,
                'selectionDividerHeight': false,
                'settingsSliceUri': false,
                'shell': false,
                'supportsMultipleDisplays': false,
                'textLocale': false,
                'useAppZygote': false,
                'useEmbeddedDex': false,
                'zygotePreloadName': false,
            },
            assign: {},
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
                'windowLayoutInDisplayCutoutMode': false,
            },
            assign: {},
        },
        [26 /* OREO */]: {
            android: {
                'classLoader': false,
                'navigationBarDividerColor': false,
                'showWhenLocked': false,
                'turnScreenOn': false,
                'windowLightNavigationBar': false,
            },
            assign: {},
        },
        [25 /* NOUGAT_1 */]: {
            android: {
                'fontWeight': false,
                'justificationMode': false,
                'layout_marginHorizontal': false,
                'layout_marginVertical': false,
                'paddingHorizontal': false,
                'paddingVertical': false,
                'tooltipText': false,
            },
            assign: {},
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
            assign: {},
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
                'windowBackgroundFallback': false,
            },
            assign: {},
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
                'end': result => substitute(result, 'right'),
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
                'start': result => substitute(result, 'left'),
                'subtitleTextColor': false,
                'supportsAssist': false,
                'supportsLaunchVoiceAssistFromKeyguard': false,
                'thumbPosition': false,
                'titleTextColor': false,
                'trackTint': false,
                'trackTintMode': false,
                'usesCleartextTraffic': false,
                'windowLightStatusBar': false,
            },
            assign: {},
        },
        [21 /* LOLLIPOP */]: {
            android: {
                'accessibilityTraversalAfter': false,
                'accessibilityTraversalBefore': false,
                'collapseContentDescription': false,
                'dialogPreferredPadding': false,
                'resizeClip': false,
                'revisionCode': false,
                'searchHintIcon': false,
            },
            assign: {},
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
                'yearListSelectorColor': false,
            },
            assign: {},
        },
        [19 /* KITKAT */]: {
            android: {
                'allowEmbedded': false,
                'windowSwipeToDismiss': false,
            },
            assign: {},
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
                'windowTranslucentStatus': false,
            },
            assign: {},
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
                'windowOverscan': false,
            },
            assign: {},
        },
        [16 /* JELLYBEAN */]: {
            android: {
                'checkedTextViewStyle': false,
                'format12Hour': false,
                'format24Hour': false,
                'initialKeyguardLayout': false,
                'labelFor': false,
                'layoutDirection': false,
                'layout_alignEnd': result => substitute(result, 'layout_alignRight'),
                'layout_alignParentEnd': result => substitute(result, 'layout_alignParentRight'),
                'layout_alignParentStart': result => substitute(result, 'layout_alignParentLeft'),
                'layout_alignStart': result => substitute(result, 'layout_alignLeft'),
                'layout_marginEnd': result => substitute(result, 'layout_marginRight'),
                'layout_marginStart': result => substitute(result, 'layout_marginLeft'),
                'layout_toEndOf': result => substitute(result, 'layout_toRightOf'),
                'layout_toStartOf': result => substitute(result, 'layout_toLeftOf'),
                'listPreferredItemPaddingEnd': result => substitute(result, 'listPreferredItemPaddingRight'),
                'listPreferredItemPaddingStart': result => substitute(result, 'listPreferredItemPaddingLeft'),
                'paddingEnd': result => substitute(result, STRING_ANDROID.PADDING_RIGHT),
                'paddingStart': result => substitute(result, STRING_ANDROID.PADDING_LEFT),
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
                'widgetCategory': false,
            },
            assign: {},
        },
        [15 /* ICE_CREAM_SANDWICH_1 */]: {
            android: {
                'fontFamily': false,
                'importantForAccessibility': false,
                'isolatedProcess': false,
                'keyboardLayout': false,
                'mediaRouteButtonStyle': false,
                'mediaRouteTypes': false,
                'parentActivityName': false,
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
                        'textAllCaps': 'false',
                    },
                },
            },
        },
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
            'headerAmPmTextAppearance': (result, api) =>
                substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            'headerDayOfMonthTextAppearance': (result, api) =>
                substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            'headerMonthTextAppearance': (result, api) =>
                substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            'headerTimeTextAppearance': (result, api) =>
                substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            'headerYearTextAppearance': (result, api) =>
                substitute(result, 'headerTextColor', api, 23 /* MARSHMALLOW */),
            'showOnLockScreen': (result, api) => substitute(result, 'showForAllUsers', api, 23 /* MARSHMALLOW */),
            'targetDescriptions': (result, api) => api < 23 /* MARSHMALLOW */,
            'yearListItemTextAppearance': (result, api) =>
                substitute(result, 'yearListTextColor', api, 23 /* MARSHMALLOW */),
            'yearListSelectorColor': (result, api) => api < 23 /* MARSHMALLOW */,
        },
    };
    function getValue(api, tagName, obj, attr) {
        var _a, _b;
        for (const build of [API_ANDROID[api], API_ANDROID[0]]) {
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
        API_ANDROID: API_ANDROID,
        DEPRECATED_ANDROID: DEPRECATED_ANDROID,
        getValue: getValue,
    });

    const { truncate } = squared.lib.math;
    const { capitalize, joinArray, isPlainObject: isPlainObject$1 } = squared.lib.util;
    const { BOX_STANDARD } = squared.base.lib.enumeration;
    function calculateBias(start, end, accuracy = 3) {
        if (start === 0) {
            return 0;
        } else if (end === 0) {
            return 1;
        }
        return parseFloat(truncate(Math.max(start / (start + end), 0), accuracy));
    }
    function applyTemplate(tagName, template, children, depth) {
        const tag = template[tagName];
        const nested = tag['>>'] === true;
        let output = '',
            indent = '',
            length = children.length;
        if (depth === undefined) {
            output += '<?xml version="1.0" encoding="utf-8"?>\n';
            depth = 0;
        } else {
            indent += '\t'.repeat(depth);
        }
        for (let i = 0; i < length; ++i) {
            const item = children[i];
            const include = tag['#'] && item[tag['#']];
            const closed = !nested && !include;
            const attrs = tag['@'];
            const descend = tag['>'];
            let valid = false;
            output += indent + '<' + tagName;
            if (attrs) {
                const q = attrs.length;
                let j = 0;
                while (j < q) {
                    const attr = attrs[j++];
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
                    } else if (isPlainObject$1(value)) {
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
    function convertLength(value, font, precision = 3) {
        if (typeof value === 'string') {
            value = parseFloat(value);
        }
        return !font ? Math.round(value) + 'dp' : truncate(value, precision) + 'sp';
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
        }
        return false;
    }
    function isVerticalAlign(value) {
        switch (value) {
            case 'top':
            case 'bottom':
            case 'center_vertical':
                return true;
        }
        return false;
    }
    function getDataSet(dataset, prefix) {
        let result;
        for (const attr in dataset) {
            if (attr.startsWith(prefix)) {
                if (!result) {
                    result = {};
                }
                result[capitalize(attr.substring(prefix.length), false)] = dataset[attr];
            }
        }
        return result;
    }
    function getHorizontalBias(node) {
        const parent = node.documentParent;
        const box = parent.box;
        const left = Math.max(0, node.actualRect('left', 'bounds') - box.left);
        const right = Math.max(0, box.right - node.actualRect('right', 'bounds'));
        return calculateBias(left, right, node.localSettings.floatPrecision);
    }
    function getVerticalBias(node) {
        const parent = node.documentParent;
        const box = parent.box;
        const top = Math.max(0, node.actualRect('top', 'bounds') - box.top);
        const bottom = Math.max(0, box.bottom - node.actualRect('bottom', 'bounds'));
        return calculateBias(top, bottom, node.localSettings.floatPrecision);
    }
    function adjustAbsolutePaddingOffset(parent, direction, value) {
        if (value > 0) {
            if (parent.documentBody) {
                switch (direction) {
                    case 16 /* PADDING_TOP */:
                        if (parent.getBox(1 /* MARGIN_TOP */)[0] === 0) {
                            value -= parent.marginTop;
                        }
                        break;
                    case 32 /* PADDING_RIGHT */:
                        value -= parent.marginRight;
                        break;
                    case 64 /* PADDING_BOTTOM */:
                        if (parent.getBox(4 /* MARGIN_BOTTOM */)[0] === 0) {
                            value -= parent.marginBottom;
                        }
                        break;
                    case 128 /* PADDING_LEFT */:
                        value -= parent.marginLeft;
                        break;
                }
            }
            if (parent.getBox(direction)[0] === 0) {
                switch (direction) {
                    case 16 /* PADDING_TOP */:
                        value += parent.borderTopWidth - parent.paddingTop;
                        break;
                    case 32 /* PADDING_RIGHT */:
                        value += parent.borderRightWidth - parent.paddingRight;
                        break;
                    case 64 /* PADDING_BOTTOM */:
                        value += parent.borderBottomWidth - parent.paddingBottom;
                        break;
                    case 128 /* PADDING_LEFT */:
                        value += parent.borderLeftWidth - parent.paddingLeft;
                        break;
                }
            }
            return Math.max(value, 0);
        } else if (value < 0) {
            switch (direction) {
                case 16 /* PADDING_TOP */:
                    value += parent.marginTop;
                    break;
                case 32 /* PADDING_RIGHT */:
                    value += parent.marginRight;
                    break;
                case 64 /* PADDING_BOTTOM */:
                    value += parent.marginBottom;
                    break;
                case 128 /* PADDING_LEFT */:
                    value += parent.marginLeft;
                    break;
            }
            return value;
        }
        return 0;
    }
    function createViewAttribute(data) {
        const options = { android: {} };
        if (data) {
            if (data.android) {
                Object.assign(options.android, data.android);
            }
            if (data.app) {
                if (!options.app) {
                    options.app = {};
                }
                Object.assign(options.app, data.app);
            }
        }
        return options;
    }
    function createStyleAttribute(data) {
        const result = {
            output: {
                path: 'res/values',
                file: '',
            },
            name: '',
            parent: '',
            items: {},
        };
        if (isPlainObject$1(data)) {
            for (const attr in result) {
                if (typeof data[attr] === typeof result[attr]) {
                    result[attr] = data[attr];
                }
            }
        }
        return result;
    }
    function replaceTab(value, spaces = 4, preserve) {
        if (spaces > 0) {
            if (preserve) {
                return joinArray(value.split('\n'), line => {
                    const match = /^(\t+)(.*)$/.exec(line);
                    return match ? ' '.repeat(spaces * match[1].length) + match[2] : line;
                });
            } else {
                return value.replace(/\t/g, ' '.repeat(spaces));
            }
        }
        return value;
    }
    function replaceCharacterData(value, tab) {
        value = value.replace(/&nbsp;/g, '&#160;').replace(/&(?!#?[A-Za-z\d]{2,};)/g, '&amp;');
        const char = [];
        const length = value.length;
        for (let i = 0; i < length; ++i) {
            switch (value.charAt(i)) {
                case "'":
                    char.push({ i, text: "\\'" });
                    break;
                case '"':
                    char.push({ i, text: '&quot;' });
                    break;
                case '<':
                    char.push({ i, text: '&lt;' });
                    break;
                case '>':
                    char.push({ i, text: '&gt;' });
                    break;
                case '\t':
                    if (tab) {
                        char.push({ i, text: '&#160;'.repeat(tab) });
                    }
                    break;
                case '\u0003':
                    char.push({ i, text: ' ' });
                    break;
                case '\u00A0':
                    char.push({ i, text: '&#160;' });
                    break;
            }
        }
        if (char.length > 0) {
            const parts = value.split('');
            let j = 0;
            while (j < char.length) {
                const item = char[j++];
                parts[item.i] = item.text;
            }
            return parts.join('');
        }
        return value;
    }
    function localizeString(value, rtl, api) {
        return (rtl && api >= 17 /* JELLYBEAN_1 */ && LOCALIZE_ANDROID[value]) || value;
    }
    function getXmlNs(value) {
        return XMLNS_ANDROID[value] ? `xmlns:${value}="${XMLNS_ANDROID[value]}"` : '';
    }
    function getRootNs(value) {
        let output = '';
        for (const namespace in XMLNS_ANDROID) {
            if (value.includes(namespace + ':')) {
                output += '\n\t' + getXmlNs(namespace);
            }
        }
        return output;
    }

    var util = /*#__PURE__*/ Object.freeze({
        __proto__: null,
        applyTemplate: applyTemplate,
        convertLength: convertLength,
        getDocumentId: getDocumentId,
        isHorizontalAlign: isHorizontalAlign,
        isVerticalAlign: isVerticalAlign,
        getDataSet: getDataSet,
        getHorizontalBias: getHorizontalBias,
        getVerticalBias: getVerticalBias,
        adjustAbsolutePaddingOffset: adjustAbsolutePaddingOffset,
        createViewAttribute: createViewAttribute,
        createStyleAttribute: createStyleAttribute,
        replaceTab: replaceTab,
        replaceCharacterData: replaceCharacterData,
        localizeString: localizeString,
        getXmlNs: getXmlNs,
        getRootNs: getRootNs,
    });

    const {
        CSS_PROPERTIES,
        CSS_UNIT,
        formatPX,
        getBackgroundPosition,
        isLength,
        isPercent,
        newBoxModel,
        parseTransform,
    } = squared.lib.css;
    const { createElement, getNamedItem } = squared.lib.dom;
    const { clamp, truncate: truncate$1 } = squared.lib.math;
    const { actualTextRangeRect } = squared.lib.session;
    const {
        capitalize: capitalize$1,
        convertFloat,
        convertInt,
        convertWord,
        fromLastIndexOf: fromLastIndexOf$1,
        hasKeys,
        isNumber: isNumber$1,
        isString: isString$1,
        replaceMap,
    } = squared.lib.util;
    const { EXT_NAME } = squared.base.lib.constant;
    const { BOX_STANDARD: BOX_STANDARD$1, NODE_ALIGNMENT, NODE_PROCEDURE } = squared.base.lib.enumeration;
    const ResourceUI = squared.base.ResourceUI;
    const BOX_MARGIN = CSS_PROPERTIES.margin.value;
    const BOX_PADDING = CSS_PROPERTIES.padding.value;
    const {
        constraint: LAYOUT_CONSTRAINT,
        relative: LAYOUT_RELATIVE,
        relativeParent: LAYOUT_RELATIVE_PARENT,
    } = LAYOUT_ANDROID;
    function checkTextAlign(value, ignoreStart) {
        switch (value) {
            case 'left':
            case 'start':
                return !ignoreStart ? value : '';
            case 'center':
                return 'center_horizontal';
            case 'justify':
            case 'initial':
            case 'inherit':
                return '';
        }
        return value;
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
    function setAutoMargin(node, autoMargin) {
        if (
            autoMargin.horizontal &&
            (!node.blockWidth ||
                node.hasWidth ||
                node.hasPX('maxWidth') ||
                node.innerMostWrapped.has('width', { type: 2 /* PERCENT */, not: '100%' }))
        ) {
            const attr = (node.blockWidth || !node.pageFlow) && !node.outerWrapper ? 'gravity' : 'layout_gravity';
            node.mergeGravity(attr, autoMargin.leftRight ? 'center_horizontal' : autoMargin.left ? 'right' : 'left');
            return true;
        }
        return false;
    }
    function setMultiline(node, lineHeight, overwrite) {
        const offset = getLineSpacingExtra(node, lineHeight);
        if (node.api >= 28 /* PIE */) {
            node.android('lineHeight', formatPX(lineHeight), overwrite);
        } else if (offset > 0) {
            node.android('lineSpacingExtra', formatPX(offset), overwrite);
        } else {
            return;
        }
        const upper = Math.round(offset);
        if (upper > 0) {
            node.modifyBox(node.inline ? 1 /* MARGIN_TOP */ : 16 /* PADDING_TOP */, upper);
            if (!(node.block && !node.floating)) {
                node.modifyBox(node.inline ? 4 /* MARGIN_BOTTOM */ : 64 /* PADDING_BOTTOM */, Math.floor(offset));
            }
        }
    }
    function setMarginOffset(node, lineHeight, inlineStyle, top, bottom) {
        const styleValue = node.cssInitial('lineHeight');
        if (
            node.imageOrSvgElement ||
            node.renderChildren.length > 0 ||
            node.actualHeight === 0 ||
            styleValue === 'initial'
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
                const setBoxPadding = (offset, padding = false) => {
                    let upper = Math.round(offset);
                    if (upper > 0) {
                        const boxPadding =
                            (inlineStyle || height > lineHeight) &&
                            (node.styleText || padding) &&
                            !node.inline &&
                            !(node.inputElement && !isLength(styleValue, true));
                        if (top) {
                            if (boxPadding) {
                                if (upper > 0) {
                                    node.modifyBox(16 /* PADDING_TOP */, upper);
                                }
                            } else if (inlineStyle || !node.baselineAltered) {
                                upper -= node.paddingTop;
                                if (upper > 0) {
                                    node.modifyBox(1 /* MARGIN_TOP */, upper);
                                }
                            }
                        }
                        if (bottom) {
                            offset = Math.floor(offset);
                            if (boxPadding) {
                                if (offset > 0) {
                                    node.modifyBox(64 /* PADDING_BOTTOM */, offset);
                                }
                            } else {
                                offset -= node.paddingBottom;
                                if (offset > 0) {
                                    node.modifyBox(4 /* MARGIN_BOTTOM */, offset);
                                }
                            }
                        }
                    }
                };
                if (node.textElement) {
                    setBoxPadding(getLineSpacingExtra(node, lineHeight));
                } else if (height > 0) {
                    const offset = lineHeight / 2 - node.paddingTop;
                    if (offset > 0) {
                        node.modifyBox(16 /* PADDING_TOP */, offset);
                    }
                } else if (node.inputElement) {
                    const element = createElement('div', {
                        parent: document.body,
                        style: Object.assign(Object.assign({}, node.textStyle), { visibility: 'hidden' }),
                    });
                    element.innerText = 'AgjpyZ';
                    const rowHeight = actualTextRangeRect(element).height;
                    document.body.removeChild(element);
                    let rows = 1;
                    switch (node.tagName) {
                        case 'SELECT':
                            rows = node.toElementInt('size', 1);
                            break;
                        case 'TEXTAREA':
                            rows = node.toElementInt('rows', 1);
                            break;
                    }
                    setBoxPadding((lineHeight - rowHeight * Math.max(rows, 1)) / 2, true);
                } else {
                    setBoxPadding((lineHeight - node.bounds.height) / 2);
                }
            }
        }
    }
    function isFlexibleDimension(node, value) {
        if (value === '0px') {
            const renderParent = node.renderParent;
            return !!renderParent && (renderParent.layoutConstraint || renderParent.layoutGrid);
        }
        return false;
    }
    function getLineSpacingExtra(node, lineHeight) {
        let height = NaN;
        if (node.styleText) {
            const values = node.cssTryAll({
                'display': 'inline-block',
                'height': 'auto',
                'max-height': 'none',
                'min-height': 'auto',
                'line-height': 'normal',
                'white-space': 'nowrap',
            });
            if (values) {
                height = actualTextRangeRect(node.element).height;
                node.cssFinally(values);
            }
        } else if (node.plainText) {
            const bounds = node.bounds;
            height = bounds.height / (bounds.numberOfLines || 1);
        }
        return (lineHeight - (!isNaN(height) ? height : node.boundingClientRect.height)) / 2;
    }
    function constraintMinMax(node, horizontal) {
        if (!node.hasPX(horizontal ? 'width' : 'height', { percent: false })) {
            const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', { modified: true });
            if (isLength(minWH, true) && parseFloat(minWH) > 0 && minWH !== '100%') {
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
            if (isLength(maxWH, true) && maxWH !== '100%') {
                if (horizontal) {
                    if (ascendFlexibleWidth(node)) {
                        const value = node.parseWidth(maxWH);
                        if (value > node.width || node.percentWidth > 0) {
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
                    if (value > node.height || node.percentHeight > 0) {
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
                if (boxPercent > 0) {
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
                horizontal ? getMatchConstraint(outerWrapper, outerWrapper.renderParent) : 'match_parent',
                horizontal,
                false
            );
            if (node !== outerWrapper) {
                setLayoutDimension(
                    node,
                    horizontal ? getMatchConstraint(node, node.renderParent) : 'match_parent',
                    horizontal,
                    false
                );
            }
        } else {
            outerWrapper.app(
                horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent',
                truncate$1(value, node.localSettings.floatPrecision)
            );
            setLayoutDimension(outerWrapper, '0px', horizontal, false);
            if (node !== outerWrapper) {
                setLayoutDimension(node, '0px', horizontal, false);
            }
        }
        return percent;
    }
    function setLayoutDimension(node, value, horizontal, overwrite) {
        if (horizontal) {
            node.setLayoutWidth(value, overwrite);
        } else {
            node.setLayoutHeight(value, overwrite);
        }
    }
    function constraintPercentValue(node, horizontal, percent) {
        const value = horizontal ? node.percentWidth : node.percentHeight;
        return value > 0 ? setConstraintPercent(node, value, horizontal, percent) : percent;
    }
    function constraintPercentWidth(node, percent = 1) {
        const value = node.percentWidth;
        if (value > 0) {
            if (
                node.renderParent.hasPX('width', { percent: false }) &&
                !(node.actualParent || node.documentParent).layoutElement
            ) {
                if (value < 1) {
                    node.setLayoutWidth(formatPX(node.actualWidth));
                } else {
                    node.setLayoutWidth(getMatchConstraint(node, node.renderParent), false);
                }
            } else if (!node.inputElement) {
                return constraintPercentValue(node, true, percent);
            }
        }
        return percent;
    }
    function constraintPercentHeight(node, percent = 1) {
        const value = node.percentHeight;
        if (value > 0) {
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
        let parent = node.renderParent;
        let i = 0;
        while (parent !== undefined) {
            if (
                !parent.inlineWidth &&
                (parent.hasWidth ||
                    parseInt(parent.layoutWidth) > 0 ||
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
            (!!parent && (parent.hasHeight || (parent.layoutConstraint && parent.blockHeight))) ||
            ((_a = node.absoluteParent) === null || _a === void 0 ? void 0 : _a.hasHeight) === true
        );
    }
    function replaceLayoutPosition(node, parentId) {
        const left = node.anchorChain('left').shift();
        const right = node.anchorChain('right').shift();
        const top = node.anchorChain('top').shift();
        const bottom = node.anchorChain('bottom').shift();
        if (left && right) {
            left.anchor('rightLeft', right.documentId, true);
            right.anchor('leftRight', left.documentId, true);
        } else if (left) {
            left.anchorDelete('rightLeft');
            if (node.alignParent('right')) {
                left.anchor('right', parentId);
                transferHorizontalStyle(node, left);
            }
        } else if (right) {
            right.anchorDelete('leftRight');
            if (node.alignParent('left')) {
                right.anchor('left', parentId);
                transferHorizontalStyle(node, right);
            }
        }
        if (top && bottom) {
            top.anchor('bottomTop', bottom.documentId, true);
            bottom.anchor('topBottom', top.documentId, true);
        } else if (top) {
            top.anchorDelete('bottomTop');
            if (node.alignParent('bottom')) {
                top.anchor('bottom', parentId);
                transferVerticalStyle(node, top);
            }
        } else if (bottom) {
            bottom.anchorDelete('topBottom');
            if (node.alignParent('top')) {
                bottom.anchor('top', parentId);
                transferVerticalStyle(node, bottom);
            }
        }
    }
    function transferHorizontalStyle(node, sibling) {
        sibling.app('layout_constraintHorizontal_bias', node.app('layout_constraintHorizontal_bias'));
        sibling.app('layout_constraintHorizontal_chainStyle', node.app('layout_constraintHorizontal_chainStyle'));
    }
    function transferVerticalStyle(node, sibling) {
        sibling.app('layout_constraintVertical_bias', node.app('layout_constraintVertical_bias'));
        sibling.app('layout_constraintVertical_chainStyle', node.app('layout_constraintVertical_chainStyle'));
    }
    function transferLayoutAlignment(node, replaceWith) {
        replaceWith.anchorClear();
        for (const [name, item] of node.namespaces()) {
            for (const attr in item) {
                switch (attr) {
                    case 'layout_width':
                    case 'layout_height':
                        continue;
                    default:
                        if (attr.includes('margin')) {
                            continue;
                        }
                        break;
                }
                if (attr.startsWith('layout_')) {
                    replaceWith.attr(name, attr, item[attr], true);
                }
            }
        }
    }
    function finalizeGravity(node, attr) {
        const direction = getGravityValues(node, attr);
        if (direction && direction.length > 1) {
            let modified = false;
            if (checkMergableGravity('center', direction)) {
                modified = true;
            }
            if (checkMergableGravity('fill', direction)) {
                modified = true;
            }
            if (modified) {
                node.android(attr, direction.join('|'));
            }
        }
    }
    function setFlexGrow(node, horizontal, grow, value, shrink) {
        if (grow > 0) {
            node.app(
                horizontal ? 'layout_constraintHorizontal_weight' : 'layout_constraintVertical_weight',
                truncate$1(grow, node.localSettings.floatPrecision)
            );
            return true;
        } else if (value) {
            if (shrink) {
                if (shrink > 1) {
                    value /= shrink;
                } else if (shrink > 0) {
                    value *= 1 - shrink;
                }
            }
            node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', formatPX(value));
        }
        return false;
    }
    function setCustomization(node, obj, overwrite) {
        if (obj) {
            for (const name in obj) {
                const data = obj[name];
                for (const attr in data) {
                    node.attr(name, attr, data[attr], overwrite);
                }
            }
        }
    }
    function setBoxModel(node, attrs, boxReset, boxAdjustment, margin) {
        let top = 0,
            right = 0,
            bottom = 0,
            left = 0;
        for (let i = 0; i < 4; ++i) {
            const attr = attrs[i];
            let value = boxReset[attr] === 0 ? node[attr] : 0;
            if (value !== 0) {
                if (margin) {
                    switch (i) {
                        case 1:
                            if (node.inline) {
                                const outer = node.documentParent.box.right;
                                const inner = node.bounds.right;
                                if (Math.floor(inner) > outer) {
                                    if (!node.onlyChild && !node.alignParent('left')) {
                                        node.setSingleLine(true);
                                    }
                                    continue;
                                } else if (inner + value > outer) {
                                    value = clamp(outer - inner, 0, value);
                                }
                            }
                            break;
                        case 2:
                            if (value < 0 && node.pageFlow && !node.blockStatic) {
                                value = 0;
                            }
                            break;
                    }
                } else {
                    switch (i) {
                        case 0:
                            value = node.actualPadding(attr, value);
                            break;
                        case 2:
                            if (
                                (node.hasPX('height', { percent: false, initial: true }) &&
                                    ((!node.layoutElement && (node.layoutVertical || node.layoutFrame)) ||
                                        !node.pageFlow)) ||
                                (node.documentParent.gridElement && node.hasPX('height', { percent: false }))
                            ) {
                                continue;
                            } else if (node.floatContainer) {
                                let maxBottom = -Infinity;
                                const children = node.naturalChildren;
                                const length = children.length;
                                let j = 0;
                                while (j < length) {
                                    const item = children[j++];
                                    if (item.floating) {
                                        maxBottom = Math.max(item.bounds.bottom, maxBottom);
                                    }
                                }
                                value = clamp(node.bounds.bottom - maxBottom, 0, value);
                            } else {
                                value = node.actualPadding(attr, value);
                            }
                            break;
                    }
                }
            }
            if (boxAdjustment) {
                value += boxAdjustment[attr];
            }
            switch (i) {
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
            if (node.floating) {
                let sibling = node.renderParent.renderChildren.find(item => !item.floating);
                if (sibling) {
                    const boundsTop = Math.floor(node.bounds.top);
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
            if (node.positionStatic && !node.blockWidth && (left < 0 || right < 0)) {
                switch (node.cssAscend('textAlign')) {
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
                    case 'end':
                        if (left < 0) {
                            left = 0;
                        }
                        break;
                }
            }
            if (node.tagName === 'PICTURE') {
                bottom += 4;
                right += 4;
            }
            switch (node.controlName) {
                case CONTAINER_ANDROID.RADIO:
                case CONTAINER_ANDROID.CHECKBOX:
                    top = Math.max(top - 4, 0);
                    bottom = Math.max(bottom - 4, 0);
                    break;
                case CONTAINER_ANDROID.SELECT:
                    top = Math.max(top - 2, 0);
                    bottom = Math.max(bottom - 2, 0);
                    break;
            }
            if (top < 0) {
                if (!node.pageFlow) {
                    if (
                        bottom >= 0 &&
                        node.leftTopAxis &&
                        (node.hasPX('top') || !node.hasPX('bottom')) &&
                        node.translateY(top)
                    ) {
                        top = 0;
                    }
                } else if (node.blockDimension && !node.inputElement && node.translateY(top)) {
                    for (const item of node.anchorChain('bottom')) {
                        item.translateY(top);
                    }
                    top = 0;
                }
            }
            if (bottom < 0) {
                if (!node.pageFlow) {
                    if (
                        top >= 0 &&
                        node.leftTopAxis &&
                        node.hasPX('bottom') &&
                        !node.hasPX('top') &&
                        node.translateY(-bottom)
                    ) {
                        bottom = 0;
                    }
                } else if (node.blockDimension && !node.inputElement && node.renderParent.layoutConstraint) {
                    for (const item of node.anchorChain('bottom')) {
                        item.translateY(-bottom);
                    }
                    bottom = 0;
                }
            }
            if (left < 0) {
                if (!node.pageFlow) {
                    if (
                        right >= 0 &&
                        node.leftTopAxis &&
                        (node.hasPX('left') || !node.hasPX('right')) &&
                        node.translateX(left)
                    ) {
                        left = 0;
                    }
                } else if (node.float === 'right') {
                    left = Math.min(-left, -node.bounds.width);
                    for (const item of node.anchorChain('left')) {
                        item.translateX(-left);
                    }
                    left = 0;
                } else if (node.blockDimension && node.translateX(left)) {
                    for (const item of node.anchorChain('right')) {
                        item.translateX(left);
                    }
                    left = 0;
                }
            }
            if (right < 0) {
                if (!node.pageFlow) {
                    if (
                        left >= 0 &&
                        node.leftTopAxis &&
                        node.hasPX('right') &&
                        !node.hasPX('left') &&
                        node.translateX(-right)
                    ) {
                        right = 0;
                    }
                } else if (node.rightAligned) {
                    if (node.translateX(-right)) {
                        right = 0;
                    }
                } else if (node.blockDimension && node.renderParent.layoutConstraint) {
                    for (const item of node.anchorChain('right')) {
                        item.translateX(right);
                    }
                    right = 0;
                }
            }
        } else if (node.visibleStyle.borderWidth && !node.is(CONTAINER_NODE.LINE)) {
            top += node.borderTopWidth;
            bottom += node.borderBottomWidth;
            right += node.borderRightWidth;
            left += node.borderLeftWidth;
        }
        if (top !== 0 || left !== 0 || bottom !== 0 || right !== 0) {
            let horizontal = 0,
                vertical = 0;
            if ((!margin || !node.renderParent.layoutGrid) && node.api >= 26 /* OREO */) {
                if (top === right && right === bottom && bottom === left) {
                    node.android(margin ? STRING_ANDROID.MARGIN : STRING_ANDROID.PADDING, formatPX(top));
                    return;
                } else {
                    if (left === right) {
                        horizontal = left;
                    }
                    if (top === bottom) {
                        vertical = top;
                    }
                }
            }
            if (horizontal !== 0) {
                node.android(
                    margin ? STRING_ANDROID.MARGIN_HORIZONTAL : STRING_ANDROID.PADDING_HORIZONTAL,
                    formatPX(horizontal)
                );
            } else {
                if (left !== 0) {
                    node.android(
                        node.localizeString(margin ? STRING_ANDROID.MARGIN_LEFT : STRING_ANDROID.PADDING_LEFT),
                        formatPX(left)
                    );
                }
                if (right !== 0) {
                    node.android(
                        node.localizeString(margin ? STRING_ANDROID.MARGIN_RIGHT : STRING_ANDROID.PADDING_RIGHT),
                        formatPX(right)
                    );
                }
            }
            if (vertical !== 0) {
                node.android(
                    margin ? STRING_ANDROID.MARGIN_VERTICAL : STRING_ANDROID.PADDING_VERTICAL,
                    formatPX(vertical)
                );
            } else {
                if (top !== 0) {
                    node.android(margin ? STRING_ANDROID.MARGIN_TOP : STRING_ANDROID.PADDING_TOP, formatPX(top));
                }
                if (bottom !== 0) {
                    node.android(
                        margin ? STRING_ANDROID.MARGIN_BOTTOM : STRING_ANDROID.PADDING_BOTTOM,
                        formatPX(bottom)
                    );
                }
            }
        }
    }
    function getGravityValues(node, attr, value) {
        const gravity = node.android(attr);
        if (gravity !== '') {
            const result = gravity.split('|');
            if (value) {
                if (result.includes(value)) {
                    return undefined;
                }
                result.push(value);
            }
            return result;
        } else if (value) {
            node.android(attr, value);
        }
        return undefined;
    }
    const getMatchConstraint = (node, parent) =>
        parent.layoutConstraint &&
        !parent.flexibleWidth &&
        (!parent.inlineWidth || node.renderChildren.length > 0) &&
        !node.onlyChild &&
        !(parent.documentRoot && node.blockStatic) &&
        ((node.alignParent('left') &&
            node.alignParent('right') &&
            !node.textElement &&
            !node.inputElement &&
            !node.controlElement) ||
            (node.hasPX('minWidth') &&
                (parent.inlineWidth || (parent.layoutWidth === '' && !parent.blockStatic && !parent.hasPX('width')))) ||
            node.alignSibling('leftRight') ||
            node.alignSibling('rightLeft'))
            ? '0px'
            : 'match_parent';
    const excludeHorizontal = node =>
        node.bounds.width === 0 &&
        node.contentBoxWidth === 0 &&
        node.textEmpty &&
        node.marginLeft === 0 &&
        node.marginRight === 0 &&
        !node.visibleStyle.background;
    const excludeVertical = node =>
        node.bounds.height === 0 &&
        node.contentBoxHeight === 0 &&
        ((node.marginTop === 0 && node.marginBottom === 0) || node.css('overflow') === 'hidden');
    const inheritLineHeight = node =>
        node.renderChildren.length === 0 && !node.multiline && !isNaN(node.lineHeight) && !node.has('lineHeight');
    var View$MX = Base => {
        var _a;
        return (
            (_a = class View extends Base {
                constructor() {
                    super(...arguments);
                    this.api = 29 /* LATEST */;
                    this.renderChildren = [];
                    this.constraint = {
                        horizontal: false,
                        vertical: false,
                        current: {},
                    };
                    this._namespaces = { android: {}, app: {} };
                    this._containerType = 0;
                    this._controlName = '';
                    this._boxAdjustment = newBoxModel();
                    this._boxReset = newBoxModel();
                    this._positioned = false;
                }
                static setConstraintDimension(node, percentWidth = NaN) {
                    percentWidth = constraintPercentWidth(node, percentWidth);
                    constraintPercentHeight(node, 1);
                    if (!node.inputElement) {
                        constraintMinMax(node, true);
                        constraintMinMax(node, false);
                    }
                    return percentWidth;
                }
                static setFlexDimension(node, dimension, percentWidth = NaN) {
                    const { grow, basis, shrink } = node.flexbox;
                    const horizontal = dimension === 'width';
                    if (isLength(basis)) {
                        setFlexGrow(node, horizontal, grow, node.parseUnit(basis, { dimension }), shrink);
                        setLayoutDimension(node, '0px', horizontal, true);
                    } else if (basis !== '0%' && isPercent(basis)) {
                        setFlexGrow(node, horizontal, grow);
                        const percent = parseFloat(basis) / 100;
                        if (horizontal) {
                            setConstraintPercent(node, percent, true, NaN);
                        } else {
                            setConstraintPercent(node, percent, false, NaN);
                        }
                    } else {
                        let flexible = false;
                        if (node.hasFlex(horizontal ? 'row' : 'column')) {
                            flexible = setFlexGrow(
                                node,
                                horizontal,
                                grow,
                                node.hasPX(dimension, { percent: false })
                                    ? horizontal
                                        ? node.actualWidth
                                        : node.actualHeight
                                    : 0,
                                shrink
                            );
                            if (flexible) {
                                setLayoutDimension(node, '0px', horizontal, true);
                            }
                        }
                        if (!flexible) {
                            if (horizontal) {
                                percentWidth = constraintPercentWidth(node, percentWidth);
                            } else {
                                constraintPercentHeight(node, 0);
                            }
                        }
                    }
                    if (shrink > 1) {
                        node.app(horizontal ? 'layout_constrainedWidth' : 'layout_constrainedHeight', 'true');
                    }
                    if (horizontal) {
                        constraintPercentHeight(node);
                    }
                    if (!node.inputElement && !node.imageOrSvgElement) {
                        constraintMinMax(node, true);
                        constraintMinMax(node, false);
                    }
                    return percentWidth;
                }
                static availablePercent(nodes, dimension, boxSize) {
                    const horizontal = dimension === 'width';
                    let percent = 1,
                        valid = false;
                    const length = nodes.length;
                    let i = 0;
                    while (i < length) {
                        let sibling = nodes[i++];
                        sibling = sibling.innerMostWrapped;
                        if (sibling.pageFlow) {
                            valid = true;
                            if (sibling.hasPX(dimension, { initial: true })) {
                                const value = sibling.cssInitial(dimension);
                                if (isPercent(value)) {
                                    percent -= parseFloat(value) / 100;
                                    continue;
                                } else if (isLength(value)) {
                                    if (horizontal) {
                                        percent -=
                                            Math.max(
                                                sibling.actualWidth + sibling.marginLeft + sibling.marginRight,
                                                0
                                            ) / boxSize;
                                    } else {
                                        percent -=
                                            Math.max(
                                                sibling.actualHeight + sibling.marginTop + sibling.marginBottom,
                                                0
                                            ) / boxSize;
                                    }
                                    continue;
                                }
                            }
                            percent -= sibling.linear[dimension] / boxSize;
                        }
                    }
                    return valid ? Math.max(0, percent) : 1;
                }
                static getControlName(containerType, api = 29 /* LATEST */) {
                    const name = CONTAINER_NODE[containerType];
                    return (api >= 29 /* Q */ && CONTAINER_ANDROID_X[name]) || CONTAINER_ANDROID[name] || '';
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
                    const maxDimension = this.support.maxDimension;
                    let { layoutWidth, layoutHeight } = this;
                    if (layoutWidth === '') {
                        if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                            const width = this.css('width');
                            let value = -1;
                            if (isPercent(width)) {
                                const expandable = () =>
                                    width === '100%' && containsWidth && (maxDimension || !this.hasPX('maxWidth'));
                                if (this.inputElement) {
                                    if (expandable()) {
                                        layoutWidth = getMatchConstraint(this, renderParent);
                                    } else {
                                        value = this.actualWidth;
                                    }
                                } else if (renderParent.layoutConstraint) {
                                    if (containsWidth) {
                                        if (expandable()) {
                                            layoutWidth = getMatchConstraint(this, renderParent);
                                        } else {
                                            View.setConstraintDimension(this, 1);
                                            layoutWidth = this.layoutWidth;
                                        }
                                    } else {
                                        value = this.actualWidth;
                                    }
                                } else if (renderParent.layoutGrid) {
                                    layoutWidth = '0px';
                                    this.android(
                                        'layout_columnWeight',
                                        truncate$1(parseFloat(width) / 100, this.localSettings.floatPrecision)
                                    );
                                } else if (this.imageElement) {
                                    if (expandable()) {
                                        layoutWidth = getMatchConstraint(this, renderParent);
                                    } else {
                                        value = this.bounds.width;
                                    }
                                } else if (width === '100%') {
                                    if (!maxDimension && this.hasPX('maxWidth')) {
                                        const maxWidth = this.css('maxWidth');
                                        const maxValue = this.parseWidth(maxWidth);
                                        const absoluteParent = this.absoluteParent || actualParent;
                                        if (maxWidth === '100%') {
                                            if (containsWidth && Math.ceil(maxValue) >= absoluteParent.box.width) {
                                                layoutWidth = getMatchConstraint(this, renderParent);
                                            } else {
                                                value = Math.min(this.actualWidth, maxValue);
                                            }
                                        } else if (maxValue > 0) {
                                            if (this.blockDimension) {
                                                value = Math.min(this.actualWidth, maxValue);
                                            } else {
                                                layoutWidth =
                                                    Math.floor(maxValue) < absoluteParent.box.width
                                                        ? 'wrap_content'
                                                        : getMatchConstraint(this, renderParent);
                                            }
                                        }
                                    }
                                    if (layoutWidth === '' && (this.documentRoot || containsWidth)) {
                                        layoutWidth = getMatchConstraint(this, renderParent);
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
                        } else if (this.length > 0) {
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
                                    if (length > 0 && maxWidth > 0) {
                                        const width = formatPX(maxWidth);
                                        let i = 0;
                                        while (i < length) {
                                            const node = nodes[i++];
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
                                    ((renderParent.layoutFrame &&
                                        (this.hasAlign(256 /* FLOAT */) || this.hasAlign(1024 /* RIGHT */))) ||
                                        this.hasAlign(16384 /* PERCENT */))) ||
                                    (actualParent.flexElement &&
                                        this.some(item => item.multiline, { cascade: true })) ||
                                    (this.layoutGrid && this.some(node => node.flexibleWidth)))
                            ) {
                                layoutWidth = getMatchConstraint(this, renderParent);
                            } else if (!this.imageElement && !this.inputElement && !this.controlElement) {
                                const checkParentWidth = block => {
                                    var _a;
                                    if (!actualParent.pageFlow && this.some(node => node.textElement)) {
                                        return;
                                    } else if (this.styleText) {
                                        const multiline =
                                            ((_a = this.textBounds) === null || _a === void 0
                                                ? void 0
                                                : _a.numberOfLines) > 1;
                                        if (multiline) {
                                            if (block) {
                                                layoutWidth = 'match_parent';
                                            }
                                            return;
                                        } else if (this.cssTry('display', 'inline-block')) {
                                            const width = Math.ceil(actualTextRangeRect(this.element).width);
                                            layoutWidth =
                                                width >= actualParent.box.width ? 'wrap_content' : 'match_parent';
                                            this.cssFinally('display');
                                            return;
                                        }
                                    }
                                    layoutWidth = getMatchConstraint(this, renderParent);
                                };
                                if (renderParent.layoutGrid) {
                                    if (this.blockStatic && renderParent.android('columnCount') === '1') {
                                        layoutWidth = getMatchConstraint(this, renderParent);
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
                                            layoutWidth = getMatchConstraint(this, renderParent);
                                        } else {
                                            checkParentWidth(true);
                                        }
                                    } else if (
                                        containsWidth &&
                                        ((actualParent.gridElement && !renderParent.layoutElement) ||
                                            (actualParent.flexElement &&
                                                this.layoutVertical &&
                                                this.some(item => item.textElement && item.multiline)))
                                    ) {
                                        layoutWidth = getMatchConstraint(this, renderParent);
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
                                    this.some(item => item.naturalElement && item.blockStatic) &&
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
                                    if (!maxDimension) {
                                        const maxHeight = this.css('maxHeight');
                                        const maxValue = this.parseHeight(maxHeight);
                                        const absoluteParent = this.absoluteParent || actualParent;
                                        if (maxHeight === '100%') {
                                            if (containsHeight || Math.ceil(maxValue) >= absoluteParent.box.height) {
                                                layoutHeight = 'match_parent';
                                            } else {
                                                value = Math.min(this.actualHeight, maxValue);
                                            }
                                        } else if (maxValue > 0) {
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
                            this.setLayoutWidth(getMatchConstraint(this, renderParent));
                        } else {
                            this.android(
                                'minWidth',
                                formatPX(this.parseWidth(minWidth) + (this.contentBox ? this.contentBoxWidth : 0)),
                                false
                            );
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
                            this.android(
                                'minHeight',
                                formatPX(this.parseHeight(minHeight) + (this.contentBox ? this.contentBoxHeight : 0)),
                                false
                            );
                        }
                    }
                    if (maxDimension) {
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
                                            this.setLayoutWidth(getMatchConstraint(this, renderParent));
                                            this.setLayoutHeight('wrap_content');
                                            width = -1;
                                            maxHeight = '';
                                        }
                                    } else if (containsWidth) {
                                        this.setLayoutWidth(getMatchConstraint(this, renderParent));
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
                            (this.ascend({ condition: item => item.hasPX('width') }).length > 0 ||
                                !this.textContent.includes('\n'))
                        ) {
                            width = this.actualWidth;
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
                    let textAlign = checkTextAlign(this.cssInitial('textAlign', { modified: true }), false),
                        textAlignParent = checkTextAlign(this.cssAscend('textAlign'), true);
                    if (this.nodeGroup && textAlign === '' && !this.hasAlign(256 /* FLOAT */)) {
                        const actualParent = this.actualParent;
                        if (actualParent) {
                            textAlign = checkTextAlign(actualParent.cssInitial('textAlign', { modified: true }), false);
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
                                    !setAutoMargin(node, autoMargin) &&
                                    textAlign !== '' &&
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
                                if (this.renderChildren.every(item => item.rightAligned)) {
                                    floatAlign = 'right';
                                } else if (
                                    this.hasAlign(256 /* FLOAT */) &&
                                    !this.renderChildren.some(item => item.rightAligned)
                                ) {
                                    floatAlign = 'left';
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
                            if (!setAutoMargin(this, autoMargin)) {
                                if (!this.innerWrapped) {
                                    if (this.floating) {
                                        floatAlign = this.float;
                                    }
                                    if (
                                        floatAlign !== '' &&
                                        !renderParent.naturalElement &&
                                        (renderParent.inlineWidth || (!renderParent.documentRoot && this.onlyChild))
                                    ) {
                                        renderParent.mergeGravity('layout_gravity', floatAlign);
                                        floatAlign = '';
                                    }
                                }
                                if (this.centerAligned) {
                                    this.mergeGravity('layout_gravity', checkTextAlign('center', false));
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
                                if (textAlign === '' || floatAlign === 'right') {
                                    textAlign = floatAlign;
                                }
                            } else {
                                (node.blockWidth && this !== node ? this : node).mergeGravity(
                                    'layout_gravity',
                                    floatAlign
                                );
                            }
                        } else if (setAutoMargin(node.inlineWidth ? node : this, autoMargin) && textAlign !== '') {
                            textAlignParent = '';
                        }
                    }
                    if (textAlignParent !== '' && this.blockStatic && !this.centerAligned && !this.rightAligned) {
                        node.mergeGravity('layout_gravity', 'left', false);
                    }
                    if (!this.layoutConstraint && !this.layoutFrame && !this.layoutElement && !this.layoutGrid) {
                        if (textAlign !== '') {
                            if (!this.imageOrSvgElement) {
                                this.mergeGravity('gravity', textAlign);
                            }
                        } else if (textAlignParent !== '' && !this.inputElement) {
                            if (this.imageOrSvgElement) {
                                if (this.pageFlow) {
                                    this.mergeGravity('layout_gravity', textAlignParent);
                                }
                            } else if (!this.nodeGroup || !this.hasAlign(256 /* FLOAT */)) {
                                this.mergeGravity('gravity', textAlignParent);
                            }
                        }
                    }
                    if (this.textElement && this.layoutElement) {
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
                    setBoxModel(this, BOX_MARGIN, this._boxReset, this._boxAdjustment, true);
                    setBoxModel(this, BOX_PADDING, this._boxReset, this._boxAdjustment, false);
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
                    const node = new View(!isNaN(id) ? id : this.id, this.sessionId, this.element || undefined);
                    if (id !== undefined) {
                        node.setControlType(this.controlName, this.containerType);
                    } else {
                        node.controlId = this.controlId;
                        node.controlName = this.controlName;
                        node.containerType = this.containerType;
                    }
                    this.cloneBase(node);
                    if (attributes !== false) {
                        Object.assign(node.unsafe('boxReset'), this._boxReset);
                        Object.assign(node.unsafe('boxAdjustment'), this._boxAdjustment);
                        for (const name in this._namespaces) {
                            const obj = this._namespaces[name];
                            for (const attr in obj) {
                                node.attr(
                                    name,
                                    attr,
                                    attr === 'id' && name === 'android' ? node.documentId : obj[attr]
                                );
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
                    if (this.dir === 'rtl' && !this.imageOrSvgElement) {
                        if (this.textElement) {
                            this.android('textDirection', 'rtl');
                        } else if (this.renderChildren.length > 0) {
                            this.android('layoutDirection', 'rtl');
                        }
                    }
                    if (this.styleElement || this.hasAlign(8192 /* WRAPPER */)) {
                        const dataset = getDataSet(this.dataset, 'android');
                        if (dataset) {
                            for (const namespace in dataset) {
                                const name =
                                    namespace === 'attr'
                                        ? 'android'
                                        : /^attr[A-Z]/.test(namespace)
                                        ? capitalize$1(namespace.substring(4), false)
                                        : '';
                                if (name !== '') {
                                    for (const values of dataset[namespace].split(';')) {
                                        const [key, value] = values.split('::');
                                        if (value) {
                                            this.attr(name, key, value);
                                        }
                                    }
                                }
                            }
                        }
                        if (!this.svgElement) {
                            const opacity = this.css('opacity');
                            if (opacity !== '1' && isNumber$1(opacity)) {
                                this.android('alpha', opacity);
                            }
                        }
                    }
                    const indent = '\n' + '\t'.repeat(depth);
                    const items = this.combine();
                    let output = '';
                    const length = items.length;
                    let i = 0;
                    while (i < length) {
                        output += indent + items[i++];
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
                        } else {
                            if (renderParent.layoutConstraint) {
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
                        if (
                            (companion === null || companion === void 0 ? void 0 : companion.labelFor) === this &&
                            !companion.visible
                        ) {
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
                    const node = this.anchorTarget;
                    const renderParent = node.renderParent;
                    if (renderParent === null || renderParent === void 0 ? void 0 : renderParent.layoutConstraint) {
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
                    return false;
                }
                translateY(value, options) {
                    const node = this.anchorTarget;
                    const renderParent = node.renderParent;
                    if (renderParent === null || renderParent === void 0 ? void 0 : renderParent.layoutConstraint) {
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
                    if ((parent === null || parent === void 0 ? void 0 : parent.flexdata[direction]) === true) {
                        if (direction === 'column' && !parent.hasHeight) {
                            const grandParent = parent.actualParent;
                            if (grandParent) {
                                if (grandParent.flexElement && !grandParent.flexdata.column) {
                                    if (!grandParent.hasHeight) {
                                        let maxHeight = 0,
                                            parentHeight = 0;
                                        for (const item of grandParent) {
                                            const height = (item.data(EXT_NAME.FLEXBOX, 'boundsData') || item.bounds)
                                                .height;
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
                            if (documentId === '' || node.constraint.current[position] === undefined || overwrite) {
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
                anchorParent(orientation, bias, style = '', overwrite) {
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
                                    (sibling === null || sibling === void 0
                                        ? void 0
                                        : sibling.alignSibling(anchorB)) === current.documentId
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
                            let i = 0;
                            while (i < position.length) {
                                const value = position[i++];
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
                        if (renderParent.layoutConstraint) {
                            if (update === true) {
                                replaceLayoutPosition(node, 'parent');
                            } else if (update) {
                                transferLayoutAlignment(node, update);
                            }
                            node.anchorDelete(...Object.keys(LAYOUT_CONSTRAINT));
                            node.delete(
                                'app',
                                'layout_constraintHorizontal_bias',
                                'layout_constraintHorizontal_chainStyle',
                                'layout_constraintVertical_bias',
                                'layout_constraintVertical_chainStyle'
                            );
                        } else if (renderParent.layoutRelative) {
                            if (update === true) {
                                replaceLayoutPosition(node, 'true');
                            } else if (update) {
                                transferLayoutAlignment(node, update);
                            }
                            node.anchorDelete(...Object.keys(LAYOUT_RELATIVE_PARENT));
                            node.anchorDelete(...Object.keys(LAYOUT_RELATIVE));
                        }
                    }
                }
                supported(attr, result = {}) {
                    var _a;
                    if (typeof DEPRECATED_ANDROID.android[attr] === 'function') {
                        const valid = DEPRECATED_ANDROID.android[attr](result, this.api, this);
                        if (!valid || hasKeys(result)) {
                            return valid;
                        }
                    }
                    let i = this.api;
                    while (i <= 29 /* LATEST */) {
                        const callback = (_a = API_ANDROID[i++]) === null || _a === void 0 ? void 0 : _a.android[attr];
                        switch (typeof callback) {
                            case 'boolean':
                                return callback;
                            case 'function':
                                return callback(result, this.api, this);
                        }
                    }
                    return true;
                }
                combine(...objs) {
                    const all = objs.length === 0;
                    const result = [];
                    let requireId = false,
                        id = '';
                    for (const name in this._namespaces) {
                        if (all || objs.includes(name)) {
                            const obj = this._namespaces[name];
                            let prefix = name + ':';
                            switch (name) {
                                case 'android':
                                    if (this.api < 29 /* LATEST */) {
                                        for (let attr in obj) {
                                            if (attr === 'id') {
                                                id = obj[attr];
                                            } else {
                                                const data = {};
                                                let value = obj[attr];
                                                if (!this.supported(attr, data)) {
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
                                                result.push(prefix + `${attr}="${value}"`);
                                            }
                                        }
                                    } else {
                                        for (const attr in obj) {
                                            if (attr === 'id') {
                                                id = obj[attr];
                                            } else {
                                                result.push(prefix + `${attr}="${obj[attr]}"`);
                                            }
                                        }
                                    }
                                    requireId = true;
                                    break;
                                case '_':
                                    prefix = '';
                                default:
                                    for (const attr in obj) {
                                        result.push(prefix + `${attr}="${obj[attr]}"`);
                                    }
                                    break;
                            }
                        }
                    }
                    result.sort((a, b) => (a > b ? 1 : -1));
                    if (requireId) {
                        result.unshift(`android:id="${id || '@+id/' + this.controlId}"`);
                    }
                    return result;
                }
                mergeGravity(attr, alignment, overwrite = true) {
                    if (attr === 'layout_gravity') {
                        const renderParent = this.renderParent;
                        if (renderParent) {
                            if (
                                isHorizontalAlign(alignment) &&
                                (this.blockWidth ||
                                    (renderParent.inlineWidth && this.onlyChild) ||
                                    (!overwrite && this.outerWrapper && this.hasPX('maxWidth')))
                            ) {
                                return;
                            } else if (renderParent.layoutRelative) {
                                if (
                                    alignment === 'center_horizontal' &&
                                    !this.alignSibling('leftRight') &&
                                    !this.alignSibling('rightLeft')
                                ) {
                                    this.anchorDelete('left', 'right');
                                    this.anchor('centerHorizontal', 'true');
                                    return;
                                }
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
                            case 'SVG':
                            case 'HR':
                            case 'VIDEO':
                            case 'AUDIO':
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
                                    this.controlElement ||
                                    (this.is(CONTAINER_NODE.TEXT) && this.textEmpty) ||
                                    (this.length > 0 && (this.layoutFrame || this.layoutConstraint || this.layoutGrid))
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
                        let i = 0;
                        while (i < direction.length) {
                            const value = direction[i++];
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
                        result = x !== '' && y !== '' ? x + '|' + y : x || y;
                        if (z !== '') {
                            result += (result !== '' ? '|' : '') + z;
                        }
                        this.android(attr, result);
                    }
                }
                applyOptimizations() {
                    var _a;
                    const { lineHeight, renderChildren, renderParent } = this;
                    if (renderParent) {
                        if (this.renderExclude) {
                            if (
                                !this.alignSibling('topBottom') &&
                                !this.alignSibling('bottomTop') &&
                                !this.alignSibling('leftRight') &&
                                !this.alignSibling('rightLeft')
                            ) {
                                this.hide({ remove: true });
                            } else {
                                this.hide({ collapse: true });
                            }
                            return;
                        }
                        if (this.layoutLinear) {
                            if (this.layoutVertical) {
                                if (
                                    !renderParent.layoutFrame &&
                                    !this.documentRoot &&
                                    renderChildren.length > 0 &&
                                    (this.baselineElement ||
                                        (!renderChildren[0].multiline &&
                                            renderChildren.every(node => node.textElement)))
                                ) {
                                    this.android('baselineAlignedChildIndex', '0');
                                }
                            } else {
                                let baseline = !this.baselineActive;
                                if (
                                    renderChildren.some(node => node.floating) &&
                                    !renderChildren.some(node => node.imageElement && node.baseline)
                                ) {
                                    this.android('baselineAligned', 'false');
                                    baseline = false;
                                }
                                const length = renderChildren.length;
                                for (let i = 0; i < length; ++i) {
                                    const item = renderChildren[i];
                                    item.setSingleLine(i > 0 && i === length - 1);
                                    if (baseline && item.baselineElement) {
                                        this.android('baselineAlignedChildIndex', i.toString());
                                        baseline = false;
                                    }
                                }
                            }
                        }
                        if (lineHeight > 0) {
                            const hasOwnStyle = this.has('lineHeight', { map: 'initial' });
                            if (this.multiline) {
                                setMultiline(this, lineHeight, hasOwnStyle);
                            } else if (renderChildren.length > 0) {
                                if (!hasOwnStyle && this.layoutHorizontal && this.alignSibling('baseline')) {
                                    return;
                                } else if (this.layoutVertical || this.layoutFrame) {
                                    this.renderEach(item => {
                                        if (inheritLineHeight(item)) {
                                            setMarginOffset(item, item.lineHeight || lineHeight, true, true, true);
                                        }
                                    });
                                } else {
                                    let previousMultiline = false;
                                    const horizontalRows = this.horizontalRows || [renderChildren];
                                    const length = horizontalRows.length;
                                    for (let i = 0; i < length; ++i) {
                                        const row = horizontalRows[i];
                                        const nextRow = horizontalRows[i + 1];
                                        const nextMultiline =
                                            !!nextRow &&
                                            ((nextRow.length === 1 && nextRow[0].multiline) ||
                                                nextRow[0].lineBreakLeading ||
                                                (i < length - 1 &&
                                                    !!((_a = nextRow.find(item => item.baselineActive)) === null ||
                                                    _a === void 0
                                                        ? void 0
                                                        : _a.has('lineHeight'))));
                                        const first = row[0];
                                        const onlyChild = row.length === 1;
                                        const singleLine = onlyChild && !first.multiline;
                                        const baseline =
                                            !onlyChild &&
                                            row.find(item => item.baselineActive && item.renderChildren.length === 0);
                                        const top =
                                            singleLine ||
                                            (!previousMultiline && (i > 0 || length === 1)) ||
                                            first.lineBreakLeading;
                                        const bottom =
                                            singleLine || (!nextMultiline && (i < length - 1 || length === 1));
                                        if (baseline) {
                                            if (!isNaN(baseline.lineHeight) && !baseline.has('lineHeight')) {
                                                setMarginOffset(baseline, lineHeight, false, top, bottom);
                                            } else {
                                                previousMultiline = true;
                                                continue;
                                            }
                                        } else {
                                            const q = row.length;
                                            let j = 0;
                                            while (j < q) {
                                                const item = row[j++];
                                                if (inheritLineHeight(item)) {
                                                    setMarginOffset(item, lineHeight, onlyChild, top, bottom);
                                                }
                                            }
                                        }
                                        previousMultiline = onlyChild && first.multiline;
                                    }
                                }
                            } else if (
                                (hasOwnStyle || renderParent.lineHeight === 0) &&
                                this.inlineText &&
                                !this.textEmpty
                            ) {
                                setMarginOffset(this, lineHeight, hasOwnStyle, true, true);
                            }
                        }
                        finalizeGravity(this, 'layout_gravity');
                        finalizeGravity(this, 'gravity');
                        if (this.imageElement) {
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
                        }
                        if (this.has('transform')) {
                            const transforms = parseTransform(this.css('transform'), {
                                accumulate: true,
                                boundingBox: this.bounds,
                                fontSize: this.fontSize,
                            });
                            let pivoted = false;
                            let i = 0;
                            while (i < transforms.length) {
                                const item = transforms[i++];
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
                                        break;
                                }
                            }
                            if (pivoted && this.has('transformOrigin')) {
                                const { left, top } = getBackgroundPosition(this.css('transformOrigin'), this.bounds, {
                                    fontSize: this.fontSize,
                                });
                                if (left !== 0) {
                                    this.android('transformPivotX', formatPX(left));
                                }
                                if (top !== 0) {
                                    this.android('transformPivotY', formatPX(top));
                                }
                            }
                        }
                        if (
                            this.onlyChild &&
                            renderChildren.length > 0 &&
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
                                        if (attr !== 'id' && obj[attr] !== parentObj[attr]) {
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
                                const length = renderTemplates.length;
                                let i = 0;
                                while (i < length) {
                                    const template = renderTemplates[i++];
                                    template.parent = renderParent;
                                    template.node.renderParent = renderParent;
                                }
                                renderParent.renderTemplates = renderTemplates;
                                renderParent.renderChildren = renderChildren;
                                const boxReset = this._boxReset;
                                const boxAdjustment = this._boxAdjustment;
                                renderParent.modifyBox(
                                    16 /* PADDING_TOP */,
                                    (boxReset.marginTop === 0 ? this.marginTop : 0) +
                                        (boxReset.paddingTop === 0 ? this.paddingTop : 0) +
                                        boxAdjustment.marginTop +
                                        boxAdjustment.paddingTop
                                );
                                renderParent.modifyBox(
                                    32 /* PADDING_RIGHT */,
                                    (boxReset.marginRight === 0 ? this.marginRight : 0) +
                                        (boxReset.paddingRight === 0 ? this.paddingRight : 0) +
                                        boxAdjustment.marginRight +
                                        boxAdjustment.paddingRight
                                );
                                renderParent.modifyBox(
                                    64 /* PADDING_BOTTOM */,
                                    (boxReset.marginBottom === 0 ? this.marginBottom : 0) +
                                        (boxReset.paddingBottom === 0 ? this.paddingBottom : 0) +
                                        boxAdjustment.marginBottom +
                                        boxAdjustment.paddingBottom
                                );
                                renderParent.modifyBox(
                                    128 /* PADDING_LEFT */,
                                    (boxReset.marginLeft === 0 ? this.marginLeft : 0) +
                                        (boxReset.paddingLeft === 0 ? this.paddingLeft : 0) +
                                        boxAdjustment.marginLeft +
                                        boxAdjustment.paddingLeft
                                );
                            }
                        }
                    }
                }
                applyCustomizations(overwrite = true) {
                    const { tagName, controlName } = this;
                    let assign = API_ANDROID[0].assign;
                    setCustomization(this, assign[tagName], overwrite);
                    setCustomization(this, assign[controlName], overwrite);
                    const api = API_ANDROID[this.api];
                    if (api) {
                        assign = api.assign;
                        setCustomization(this, assign[tagName], overwrite);
                        setCustomization(this, assign[controlName], overwrite);
                    }
                }
                setSingleLine(ellipsize) {
                    if (this.textElement && this.naturalChild && (ellipsize || !this.hasPX('width'))) {
                        const parent = this.actualParent;
                        if (
                            !parent.preserveWhiteSpace &&
                            parent.tagName !== 'CODE' &&
                            (!this.multiline || parent.css('whiteSpace') === 'nowrap')
                        ) {
                            this.android('maxLines', '1');
                        }
                        if (ellipsize && this.textContent.trim().length > 1) {
                            this.android('ellipsize', 'end');
                        }
                    }
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
                    }
                    return false;
                }
                get imageElement() {
                    switch (this.tagName) {
                        case 'IMG':
                        case 'CANVAS':
                            return true;
                    }
                    return false;
                }
                set containerType(value) {
                    this._containerType = value;
                }
                get containerType() {
                    if (this._containerType === 0) {
                        const value = ELEMENT_ANDROID[this.containerName];
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
                    var _a;
                    const result = this._controlId;
                    if (result === undefined) {
                        const controlName = this.controlName;
                        if (controlName) {
                            let name;
                            if (this.styleElement) {
                                const value =
                                    ((_a = this.elementId) === null || _a === void 0 ? void 0 : _a.trim()) ||
                                    getNamedItem(this.element, 'name');
                                if (value !== '') {
                                    name = value.replace(/[^\w$\-_.]/g, '_').toLowerCase();
                                    if (name === 'parent' || RESERVED_JAVA.includes(name)) {
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
                        } else if (this.id === 0) {
                            return 'baseroot';
                        } else {
                            return '';
                        }
                    }
                    return result;
                }
                get documentId() {
                    const controlId = this.controlId;
                    return controlId !== '' ? `@id/${controlId}` : '';
                }
                get support() {
                    let result = this._cached.support;
                    if (result === undefined) {
                        result = {
                            positionTranslation: this.layoutConstraint,
                            positionRelative: this.layoutRelative,
                            maxDimension: this.textElement || this.imageOrSvgElement,
                        };
                        if (this.containerType !== 0) {
                            this._cached.support = result;
                        }
                    }
                    return result;
                }
                set renderExclude(value) {
                    this._cached.renderExclude = value;
                }
                get renderExclude() {
                    const result = this._cached.renderExclude;
                    if (result !== undefined) {
                        return result;
                    } else if (this.naturalChild && !this.plainText && !this.rootElement) {
                        if (!this.pageFlow) {
                            this._cached.renderExclude =
                                excludeHorizontal(this) ||
                                excludeVertical(this) ||
                                /^rect\(0[a-z]*,\s+0[a-z]*,\s+0[a-z]*,\s+0[a-z]*\)$/.test(this.css('clip'));
                            return this._cached.renderExclude;
                        } else if (
                            this.styleElement &&
                            this.length === 0 &&
                            !this.imageElement &&
                            !this.pseudoElement
                        ) {
                            const parent = this.renderParent || this.parent;
                            if (parent.layoutFrame) {
                                return excludeHorizontal(this) || excludeVertical(this);
                            } else if (parent.layoutVertical) {
                                return excludeVertical(this);
                            } else {
                                return excludeHorizontal(this) && (parent.layoutHorizontal || excludeVertical(this));
                            }
                        }
                    }
                    return false;
                }
                get baselineHeight() {
                    var _a;
                    let result = this._cached.baselineHeight;
                    if (result === undefined) {
                        if (this.plainText) {
                            const { height, numberOfLines } = this.bounds;
                            result = height / (numberOfLines || 1);
                        } else {
                            if (this.multiline && this.cssTry('white-space', 'nowrap')) {
                                result = this.boundingClientRect.height;
                                this.cssFinally('white-space');
                            } else if (this.hasHeight) {
                                result = this.actualHeight;
                            } else if (this.tagName === 'PICTURE') {
                                result = Math.max(
                                    ((_a = this.naturalElements.find(node => node.tagName === 'IMG')) === null ||
                                    _a === void 0
                                        ? void 0
                                        : _a.height) || 0,
                                    this.bounds.height
                                );
                            } else {
                                result = this.bounds.height;
                            }
                            if (this.naturalElement && !this.pseudoElement && this.lineHeight > result) {
                                result = this.lineHeight;
                            } else if (this.inputElement) {
                                switch (this.controlName) {
                                    case CONTAINER_ANDROID.RADIO:
                                    case CONTAINER_ANDROID.CHECKBOX:
                                        result += 8;
                                        break;
                                    case CONTAINER_ANDROID.SELECT:
                                        result /= this.toElementInt('size') || 1;
                                        result += 4;
                                        break;
                                    default:
                                        result += Math.max(convertFloat(this.verticalAlign) * -1, 0);
                                        break;
                                }
                            }
                        }
                        this._cached.baselineHeight = result;
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
                    } while (target !== undefined);
                    return this;
                }
                set anchored(value) {
                    this.constraint.horizontal = value;
                    this.constraint.vertical = value;
                }
                get anchored() {
                    return this.constraint.horizontal && this.constraint.vertical;
                }
                get imageOrSvgElement() {
                    return this.imageElement || this.svgElement;
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
                    return this._namespaces['android']['layout_width'] || '';
                }
                get layoutHeight() {
                    return this._namespaces['android']['layout_height'] || '';
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
                    return isFlexibleDimension(this, this.layoutWidth);
                }
                get flexibleHeight() {
                    return isFlexibleDimension(this, this.layoutHeight);
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
            }),
            (_a.horizontalMatchConstraint = (node, parent) => getMatchConstraint(node, parent)),
            _a
        );
    };

    class View extends View$MX(squared.base.NodeUI) {}

    class ViewGroup extends View$MX(squared.base.NodeGroupUI) {
        constructor(id, node, children) {
            super(id, node.sessionId);
            this.depth = node.depth;
            this.containerName = node.containerName + '_GROUP';
            this.actualParent = node.actualParent;
            this.documentParent = node.documentParent;
            const length = children.length;
            let i = 0;
            while (i < length) {
                children[i++].parent = this;
            }
        }
        set containerType(value) {
            this._containerType = value;
        }
        get containerType() {
            return this._containerType;
        }
    }

    const { PLATFORM, isPlatform } = squared.lib.client;
    const { parseColor: parseColor$1 } = squared.lib.color;
    const {
        CSS_UNIT: CSS_UNIT$1,
        formatPX: formatPX$1,
        getSrcSet: getSrcSet$1,
        hasComputedStyle,
        isLength: isLength$1,
        isPercent: isPercent$1,
    } = squared.lib.css;
    const { getElementsBetweenSiblings, getRangeClientRect } = squared.lib.dom;
    const { truncate: truncate$2 } = squared.lib.math;
    const { getElementAsNode, getPseudoElt } = squared.lib.session;
    const {
        assignEmptyValue,
        convertFloat: convertFloat$1,
        convertWord: convertWord$1,
        hasBit,
        hasMimeType: hasMimeType$1,
        isString: isString$2,
        iterateArray,
        parseMimeType,
        partitionArray,
        safeNestedArray: safeNestedArray$1,
        withinRange,
    } = squared.lib.util;
    const {
        APP_SECTION,
        BOX_STANDARD: BOX_STANDARD$2,
        NODE_ALIGNMENT: NODE_ALIGNMENT$1,
        NODE_PROCEDURE: NODE_PROCEDURE$1,
        NODE_RESOURCE,
        NODE_TEMPLATE,
    } = squared.base.lib.enumeration;
    const NodeUI = squared.base.NodeUI;
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
    function getSortOrderStandard(above, below) {
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
            return above.childIndex < below.childIndex ? -1 : 1;
        }
        return zA < zB ? -1 : 1;
    }
    function getSortOrderInvalid(above, below) {
        const depthA = above.depth;
        const depthB = below.depth;
        if (depthA === depthB) {
            const parentA = above.actualParent;
            const parentB = below.actualParent;
            if (above === parentB) {
                return -1;
            } else if (parentA === below) {
                return 1;
            } else if (parentA && parentB) {
                if (parentA === parentB) {
                    return getSortOrderStandard(above, below);
                } else if (parentA.actualParent === parentB.actualParent) {
                    return getSortOrderStandard(parentA, parentB);
                }
            }
            return above.id < below.id ? -1 : 1;
        }
        return depthA < depthB ? -1 : 1;
    }
    function adjustBaseline(baseline, nodes, singleRow, boxTop) {
        let imageHeight = 0,
            imageBaseline;
        const length = nodes.length;
        let i = 0;
        while (i < length) {
            const node = nodes[i++];
            if (node.baselineAltered) {
                continue;
            }
            let height = node.baselineHeight;
            if (height > 0 || node.textElement) {
                if (node.blockVertical && baseline.blockVertical) {
                    node.anchor('bottom', baseline.documentId);
                } else if (singleRow && node.is(CONTAINER_NODE.BUTTON)) {
                    node.anchor('centerVertical', 'true');
                } else {
                    const isEmpty = node.isEmpty;
                    let imageElement = node.imageOrSvgElement;
                    if (!imageElement && !isEmpty) {
                        node.renderEach(item => {
                            if (isBaselineImage(item)) {
                                height = Math.max(item.baselineHeight, height);
                                imageElement = true;
                            }
                        });
                    }
                    if (imageElement) {
                        if (height > baseline.baselineHeight) {
                            if (!imageBaseline || height >= imageHeight) {
                                imageBaseline === null || imageBaseline === void 0
                                    ? void 0
                                    : imageBaseline.anchor(getBaselineAnchor(node), node.documentId);
                                imageHeight = height;
                                imageBaseline = node;
                            } else {
                                node.anchor(getBaselineAnchor(imageBaseline), imageBaseline.documentId);
                            }
                            continue;
                        } else if (withinRange(node.linear.top, boxTop)) {
                            node.anchor('top', 'true');
                            continue;
                        }
                    }
                    if (isEmpty && node.naturalChild) {
                        node.anchor('baseline', baseline.documentId);
                    } else if (node.baselineElement) {
                        node.anchor(imageElement ? 'bottom' : 'baseline', baseline.documentId);
                    }
                }
            } else if (isBaselineImage(node)) {
                imageBaseline = node;
            }
        }
        if (imageBaseline) {
            baseline.anchor(getBaselineAnchor(imageBaseline), imageBaseline.documentId);
        }
    }
    function adjustFloatingNegativeMargin(node, previous) {
        if (previous.float === 'left') {
            if (previous.marginRight < 0) {
                const right = Math.abs(previous.marginRight);
                node.modifyBox(
                    8 /* MARGIN_LEFT */,
                    previous.actualWidth +
                        (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0) -
                        right
                );
                node.anchor('left', previous.documentId);
                previous.setBox(2 /* MARGIN_RIGHT */, { reset: 1 });
                return true;
            }
        } else if (node.float === 'right' && previous.marginLeft < 0) {
            const left = Math.abs(previous.marginLeft);
            const width = previous.actualWidth;
            if (left < width) {
                node.modifyBox(2 /* MARGIN_RIGHT */, width - left);
            }
            node.anchor('right', previous.documentId);
            previous.setBox(8 /* MARGIN_LEFT */, { reset: 1 });
            return true;
        }
        return false;
    }
    function getTextBottom(nodes) {
        return nodes
            .filter(
                node =>
                    ((node.baseline || isLength$1(node.verticalAlign, true)) &&
                        (node.tagName === 'TEXTAREA' ||
                            (node.tagName === 'SELECT' && node.toElementInt('size') > 1))) ||
                    (node.verticalAlign === 'text-bottom' && node.containerName !== 'INPUT_IMAGE')
            )
            .sort((a, b) => {
                if (a.baselineHeight === b.baselineHeight) {
                    return a.tagName === 'SELECT' ? 1 : 0;
                }
                return a.baselineHeight > b.baselineHeight ? -1 : 1;
            });
    }
    function causesLineBreak(element) {
        if (element.tagName === 'BR') {
            return true;
        } else if (hasComputedStyle(element)) {
            const style = getComputedStyle(element);
            const position = style.getPropertyValue('position');
            if (!(position === 'absolute' || position === 'fixed')) {
                const display = style.getPropertyValue('display');
                const floating = style.getPropertyValue('float') !== 'none';
                switch (display) {
                    case 'block':
                    case 'flex':
                    case 'grid':
                        return !floating || hasWidth(style);
                }
                return (display.startsWith('inline-') || display === 'table') && hasWidth(style);
            }
        }
        return false;
    }
    function setReadOnly(node) {
        const element = node.element;
        if (element.readOnly) {
            node.android('focusable', 'false');
        }
        if (element.disabled) {
            node.android('enabled', 'false');
        }
    }
    function setImageDimension(node, width, image) {
        node.css('width', formatPX$1(width), true);
        if (image && image.width > 0 && image.height > 0) {
            const height = image.height * (width / image.width);
            node.css('height', formatPX$1(height), true);
        }
    }
    function setInputMinDimension(node, element) {
        if (element.minLength !== -1) {
            node.android('minLength', element.minLength.toString());
        }
        if (element.maxLength > 0) {
            node.android('maxLength', element.maxLength.toString());
        }
    }
    function setInputMinMax(node, element) {
        if (element.min) {
            node.android('min', element.min);
        }
        if (element.max) {
            node.android('max', element.max);
        }
    }
    function checkClearMap(node, clearMap) {
        if (node.naturalChild) {
            return clearMap.has(node);
        } else if (node.nodeGroup) {
            return node.some(item => item.naturalChild && clearMap.has(item), { cascade: true });
        } else {
            return clearMap.has(node.innerMostWrapped);
        }
    }
    function isConstraintLayout(layout, vertical) {
        const parent = layout.parent;
        if (
            parent.flexElement &&
            (parent.css('alignItems') === 'baseline' || layout.some(item => item.flexbox.alignSelf === 'baseline'))
        ) {
            return false;
        }
        const multiple = layout.length > 1;
        return (
            layout.some(
                item =>
                    (multiple && (item.rightAligned || item.centerAligned) && layout.singleRowAligned) ||
                    (item.percentWidth > 0 && item.percentWidth < 1) ||
                    item.hasPX('maxWidth')
            ) &&
            (!vertical || layout.every(item => item.marginTop >= 0))
        );
    }
    function adjustBodyMargin(node, position) {
        if (node.leftTopAxis) {
            const parent = node.absoluteParent;
            if (parent.documentBody) {
                switch (position) {
                    case 'top':
                        if (parent.getBox(1 /* MARGIN_TOP */)[0] === 0) {
                            return parent.marginTop;
                        }
                        break;
                    case 'left':
                        return parent.marginLeft;
                }
            }
        }
        return 0;
    }
    function setInlineBlock(node) {
        const { centerAligned, rightAligned } = node;
        node.css('display', 'inline-block', true);
        node.setCacheValue('centerAligned', centerAligned);
        node.setCacheValue('rightAligned', rightAligned);
    }
    function setVerticalLayout(node) {
        node.addAlign(8 /* VERTICAL */);
        node.removeAlign(1 /* UNKNOWN */);
    }
    function setAnchorOffset(node, horizontal, attr, documentId, position, adjustment) {
        node.anchor(position, documentId, true);
        node.setBox(horizontal ? 8 /* MARGIN_LEFT */ : 1 /* MARGIN_TOP */, { reset: 1, adjustment });
        node.constraint[attr] = true;
    }
    function segmentRightAligned(children) {
        return partitionArray(children, item => item.float === 'right' || item.autoMargin.left === true);
    }
    function segmentLeftAligned(children) {
        return partitionArray(children, item => item.float === 'left' || item.autoMargin.right === true);
    }
    function relativeWrapWidth(node, bounds, multiline, previousRowLeft, rowWidth, data) {
        let maxWidth = 0,
            baseWidth = rowWidth + node.marginLeft;
        if (previousRowLeft && !data.items.includes(previousRowLeft)) {
            baseWidth += previousRowLeft.linear.width;
        }
        if (
            !previousRowLeft ||
            !node.plainText ||
            multiline ||
            !data.items.includes(previousRowLeft) ||
            data.clearMap.has(node)
        ) {
            baseWidth += bounds.width;
        }
        if (node.marginRight < 0) {
            baseWidth += node.marginRight;
        }
        maxWidth = data.boxWidth;
        if (data.textIndent !== 0) {
            if (data.textIndent < 0) {
                if (data.rowLength <= 1) {
                    maxWidth += data.textIndent;
                }
            } else if (data.textIndent > 0 && data.rowLength === 1) {
                maxWidth -= data.textIndent;
            }
        }
        if (node.styleElement && node.inlineStatic) {
            baseWidth -= node.contentBoxWidth;
        }
        maxWidth = Math.ceil(maxWidth);
        return Math.floor(baseWidth) > maxWidth;
    }
    function constraintAlignTop(parent, node) {
        node.anchorParent('vertical', 0);
        node.setBox(1 /* MARGIN_TOP */, {
            reset: 1,
            adjustment: Math.max(
                node.bounds.top - parent.box.top,
                Math.min(convertFloat$1(node.verticalAlign) * -1, 0)
            ),
        });
        node.baselineAltered = true;
        return false;
    }
    function getVerticalLayout(layout) {
        return isConstraintLayout(layout, true)
            ? CONTAINER_NODE.CONSTRAINT
            : layout.some(item => item.positionRelative || (!item.pageFlow && item.autoPosition))
            ? CONTAINER_NODE.RELATIVE
            : CONTAINER_NODE.LINEAR;
    }
    function getVerticalAlignedLayout(layout) {
        return isConstraintLayout(layout, true)
            ? CONTAINER_NODE.CONSTRAINT
            : layout.some(item => item.positionRelative)
            ? CONTAINER_NODE.RELATIVE
            : CONTAINER_NODE.LINEAR;
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
            layout.setContainerType(CONTAINER_NODE.IMAGE);
        } else if (type.startsWith('video/')) {
            node.setCacheValue('tagName', 'VIDEO');
            element.src = src;
            layout.setContainerType(CONTAINER_NODE.VIDEOVIEW);
        } else if (type.startsWith('audio/')) {
            node.setCacheValue('tagName', 'AUDIO');
            element.src = src;
            layout.setContainerType(CONTAINER_NODE.VIDEOVIEW);
        } else {
            layout.setContainerType(CONTAINER_NODE.TEXT);
        }
    }
    const getAnchorDirection = (reverse = false) =>
        reverse ? ['right', 'left', 'rightLeft', 'leftRight'] : ['left', 'right', 'leftRight', 'rightLeft'];
    const relativeFloatWrap = (node, previous, multiline, rowWidth, data) =>
        previous.floating &&
        previous.alignParent(previous.float) &&
        (multiline || Math.floor(rowWidth + (node.hasWidth ? node.actualWidth : 0)) < data.boxWidth);
    const isBaselineImage = node => node.imageOrSvgElement && node.baseline;
    const getBaselineAnchor = node => (node.imageOrSvgElement ? 'baseline' : 'bottom');
    const hasWidth = style =>
        (style.getPropertyValue('width') === '100%' || style.getPropertyValue('minWidth') === '100%') &&
        style.getPropertyValue('max-width') === 'none';
    const sortTemplateInvalid = (a, b) => getSortOrderInvalid(a.node.innerMostWrapped, b.node.innerMostWrapped);
    const sortTemplateStandard = (a, b) => getSortOrderStandard(a.node.innerMostWrapped, b.node.innerMostWrapped);
    const hasCleared = (layout, clearMap, ignoreFirst = true) =>
        clearMap.size > 0 && layout.some((node, index) => (index > 0 || !ignoreFirst) && clearMap.has(node));
    const isMultiline = node =>
        (node.plainText && Resource.hasLineBreak(node, false, true)) ||
        (node.preserveWhiteSpace && /^\s*\n+/.test(node.textContent));
    const getMaxHeight = node => Math.max(node.actualHeight, node.lineHeight);
    const isUnknownParent = (parent, value, length) =>
        parent.containerType === value &&
        parent.length === length &&
        (parent.alignmentType === 0 || parent.hasAlign(1 /* UNKNOWN */));
    function getBoxWidth(node, children) {
        const renderParent = node.renderParent;
        if (renderParent.overflowY) {
            return renderParent.box.width;
        } else {
            const parent = node.actualParent;
            if (parent) {
                if (node.naturalElement && node.inlineStatic && parent.blockStatic && parent === renderParent) {
                    return parent.box.width - (node.linear.left - parent.box.left);
                } else if (parent.floatContainer) {
                    const { containerType, alignmentType } = this.containerTypeVerticalMargin;
                    const container = node.ascend({
                        condition: item => item.of(containerType, alignmentType),
                        including: parent,
                        attr: 'renderParent',
                    });
                    if (container.length > 0) {
                        const { left, right, width } = node.box;
                        let offsetLeft = 0,
                            offsetRight = 0;
                        const naturalChildren = parent.naturalChildren;
                        const length = naturalChildren.length;
                        let i = 0;
                        while (i < length) {
                            const item = naturalChildren[i++];
                            if (item.floating) {
                                const linear = item.linear;
                                if (!children.includes(item) && node.intersectY(linear)) {
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
            }
        }
        return undefined;
    }
    function setHorizontalAlignment(node) {
        if (node.centerAligned) {
            node.anchorParent('horizontal', 0.5);
        } else {
            const autoMargin = node.autoMargin;
            if (autoMargin.horizontal) {
                node.anchorParent('horizontal', autoMargin.left ? 1 : autoMargin.leftRight ? 0.5 : 0);
            } else {
                const rightAligned = node.rightAligned;
                if (rightAligned) {
                    node.anchor('right', 'parent');
                    node.anchorStyle('horizontal', 1);
                } else {
                    node.anchor('left', 'parent');
                    node.anchorStyle('horizontal', 0);
                }
                if (node.blockStatic || node.percentWidth > 0 || (node.block && node.multiline && node.floating)) {
                    node.anchor(rightAligned ? 'left' : 'right', 'parent');
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
            bias = autoMargin.top ? 1 : autoMargin.topBottom ? 0.5 : 0;
        } else if (node.imageOrSvgElement || node.inlineVertical) {
            switch (node.verticalAlign) {
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
            if ((parent === null || parent === void 0 ? void 0 : parent.display) === 'table-cell') {
                switch (parent.verticalAlign) {
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
        constructor(application) {
            super();
            this.application = application;
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
                svg: {
                    enabled: false,
                },
                style: {
                    inputBorderColor: 'rgb(0, 0, 0)',
                    inputBackgroundColor: isPlatform(2 /* MAC */) ? 'rgb(255, 255, 255)' : 'rgb(221, 221, 221)',
                    inputColorBorderColor: 'rgb(119, 119, 199)',
                    meterForegroundColor: 'rgb(99, 206, 68)',
                    meterBackgroundColor: 'rgb(237, 237, 237)',
                    progressForegroundColor: 'rgb(138, 180, 248)',
                    progressBackgroundColor: 'rgb(237, 237, 237)',
                },
                mimeType: {
                    font: ['font/ttf', 'font/otf'],
                    image: [
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                        'image/bmp',
                        'image/webp',
                        'image/svg+xml',
                        'image/heic',
                        'image/heif',
                        'image/x-icon',
                    ],
                    audio: [
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
                    ],
                    video: ['video/3gpp', 'video/mp4', 'video/mp2t', 'video/x-matroska', 'video/webm'],
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
                precision: {
                    standardFloat: 3,
                },
                deviations: {
                    textMarginBoundarySize: 8,
                    subscriptBottomOffset: 0.35,
                    superscriptTopOffset: 0.35,
                    legendBottomOffset: 0.25,
                },
            };
        }
        static anchorPosition(node, parent, horizontal, modifyAnchor = true) {
            const [orientation, dimension, posA, posB, marginA, marginB, paddingA, paddingB] = horizontal
                ? [
                      'horizontal',
                      'width',
                      'left',
                      'right',
                      8 /* MARGIN_LEFT */,
                      2 /* MARGIN_RIGHT */,
                      128 /* PADDING_LEFT */,
                      32 /* PADDING_RIGHT */,
                  ]
                : [
                      'vertical',
                      'height',
                      'top',
                      'bottom',
                      1 /* MARGIN_TOP */,
                      4 /* MARGIN_BOTTOM */,
                      16 /* PADDING_TOP */,
                      64 /* PADDING_BOTTOM */,
                  ];
            const autoMargin = node.autoMargin;
            const hasDimension = node.hasPX(dimension);
            const result = {};
            const hasA = node.hasPX(posA);
            const hasB = node.hasPX(posB);
            if (hasDimension && autoMargin[orientation]) {
                if (hasA && autoMargin[posB]) {
                    if (modifyAnchor) {
                        node.anchor(posA, 'parent');
                        node.modifyBox(marginA, node[posA]);
                    } else {
                        result[posA] = node[posA];
                    }
                } else if (hasB && autoMargin[posA]) {
                    if (modifyAnchor) {
                        node.anchor(posB, 'parent');
                        node.modifyBox(marginB, node[posB]);
                    } else {
                        result[posB] = node[posB];
                    }
                } else {
                    if (modifyAnchor) {
                        node.anchorParent(orientation, 0.5);
                        node.modifyBox(marginA, node[posA]);
                        node.modifyBox(marginB, node[posB]);
                    } else {
                        result[posA] = node[posA];
                        result[posB] = node[posB];
                    }
                }
            } else {
                const matchParent =
                    node.css(dimension) === '100%' || node.css(horizontal ? 'minWidth' : 'minHeight') === '100%';
                if (matchParent) {
                    const offsetA = hasA ? adjustAbsolutePaddingOffset(parent, paddingA, node[posA]) : undefined;
                    const offsetB = hasB ? adjustAbsolutePaddingOffset(parent, paddingB, node[posB]) : undefined;
                    if (modifyAnchor) {
                        node.anchorParent(orientation);
                        if (horizontal) {
                            node.setLayoutWidth(View.horizontalMatchConstraint(node, parent));
                        } else {
                            node.setLayoutHeight('0px');
                        }
                        if (offsetA) {
                            node.modifyBox(marginA, offsetA);
                        }
                        if (offsetB) {
                            node.modifyBox(marginB, offsetB);
                        }
                    } else {
                        result[posA] = offsetA;
                        result[posB] = offsetB;
                    }
                } else {
                    let expand = 0;
                    if (hasA) {
                        const value = adjustAbsolutePaddingOffset(parent, paddingA, node[posA]);
                        if (modifyAnchor) {
                            node.anchor(posA, 'parent');
                            node.modifyBox(marginA, value);
                            ++expand;
                        } else {
                            result[posA] = value;
                        }
                    }
                    if (hasB) {
                        if (!hasA || !hasDimension) {
                            const value = adjustAbsolutePaddingOffset(parent, paddingB, node[posB]);
                            if (modifyAnchor) {
                                node.anchor(posB, 'parent');
                                node.modifyBox(marginB, value);
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
                                    if (node.centerAligned) {
                                        node.anchorParent('horizontal', 0.5);
                                    } else if (node.rightAligned) {
                                        if (node.blockStatic) {
                                            node.anchorParent('horizontal', 1);
                                        } else {
                                            node.anchor('right', 'parent');
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
                                        node.setLayoutWidth(View.horizontalMatchConstraint(node, parent));
                                    } else {
                                        node.setLayoutHeight('0px');
                                    }
                                    if (parent.innerMostWrapped.documentBody) {
                                        const options = { type: 1 /* LENGTH */ | 2 /* PERCENT */, not: '100%' };
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
                                        } while (parent !== undefined);
                                    }
                                }
                                break;
                        }
                    }
                }
            }
            return result;
        }
        init() {
            const userSettings = this.userSettings;
            const dpiRatio = 160 / userSettings.resolutionDPI;
            this._targetAPI = userSettings.targetAPI || 29 /* LATEST */;
            this._screenDimension = {
                width: userSettings.resolutionScreenWidth * dpiRatio,
                height: userSettings.resolutionScreenHeight * dpiRatio,
            };
            this._defaultViewSettings = {
                systemName: this.application.systemName,
                screenDimension: this._screenDimension,
                supportRTL: userSettings.supportRTL,
                floatPrecision: this.localSettings.precision.standardFloat,
            };
            super.init();
        }
        optimize(rendered) {
            const length = rendered.length;
            let i = 0;
            while (i < length) {
                const node = rendered[i++];
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
                            const renderTemplates = safeNestedArray$1(parent, 'renderTemplates');
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
            const tagName = node.tagName;
            if (tagName === 'OBJECT' || tagName === 'EMBED') {
                setObjectContainer(layout);
            } else if (layout.some(item => !item.pageFlow && !item.autoPosition)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 16 /* ABSOLUTE */ | 1 /* UNKNOWN */);
            } else if (layout.length <= 1) {
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
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
                    } else if (child.baselineElement) {
                        if (layout.parent.flexElement && node.flexbox.alignSelf === 'baseline') {
                            layout.setContainerType(CONTAINER_NODE.LINEAR, 4 /* HORIZONTAL */);
                        } else {
                            layout.setContainerType(getVerticalAlignedLayout(layout), 8 /* VERTICAL */);
                        }
                    } else {
                        layout.setContainerType(CONTAINER_NODE.FRAME);
                    }
                    layout.addAlign(2048 /* SINGLE */);
                } else {
                    return this.processUnknownChild(layout);
                }
            } else if (Resource.hasLineBreak(node, true)) {
                layout.setContainerType(getVerticalAlignedLayout(layout), 8 /* VERTICAL */ | 1 /* UNKNOWN */);
            } else if (this.checkConstraintFloat(layout)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
                if (layout.every(item => item.floating)) {
                    layout.addAlign(256 /* FLOAT */);
                } else if (layout.linearY) {
                    layout.addAlign(8 /* VERTICAL */);
                } else if (layout.some(item => item.floating || item.rightAligned) && layout.singleRowAligned) {
                    layout.addAlign(4 /* HORIZONTAL */);
                } else {
                    layout.addAlign(layout.some(item => item.blockStatic) ? 8 /* VERTICAL */ : 512 /* INLINE */);
                    layout.addAlign(1 /* UNKNOWN */);
                }
            } else if (layout.linearX || layout.singleRowAligned) {
                if (this.checkFrameHorizontal(layout)) {
                    layout.addRender(256 /* FLOAT */);
                    layout.addRender(4 /* HORIZONTAL */);
                } else if (this.checkConstraintHorizontal(layout)) {
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
                } else if (this.checkLinearHorizontal(layout)) {
                    layout.setContainerType(CONTAINER_NODE.LINEAR);
                    if (layout.floated.size > 0) {
                        sortHorizontalFloat(layout.children);
                    }
                } else {
                    layout.setContainerType(
                        isConstraintLayout(layout, false) ? CONTAINER_NODE.CONSTRAINT : CONTAINER_NODE.RELATIVE
                    );
                }
                layout.addAlign(4 /* HORIZONTAL */);
            } else if (layout.linearY) {
                layout.setContainerType(
                    getVerticalLayout(layout),
                    8 /* VERTICAL */ |
                        (node.rootElement ||
                        layout.some((item, index) => item.inlineFlow && layout.item(index + 1).inlineFlow, {
                            end: layout.length - 1,
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
                const children = layout.children;
                const clearMap = layout.parent.floatContainer ? this.application.clearMap : undefined;
                if (
                    layout.some(
                        (item, index) =>
                            item.alignedVertically(index > 0 ? children.slice(0, index) : undefined, clearMap) > 0
                    )
                ) {
                    layout.setContainerType(getVerticalLayout(layout), 8 /* VERTICAL */ | 1 /* UNKNOWN */);
                } else {
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 1 /* UNKNOWN */);
                }
            }
            return { layout };
        }
        processUnknownChild(layout) {
            const node = layout.node;
            const background = node.visibleStyle.background;
            if (node.tagName === 'OBJECT') {
                setObjectContainer(layout);
            } else if (node.inlineText && (background || !node.textEmpty)) {
                layout.setContainerType(CONTAINER_NODE.TEXT);
            } else if (
                node.blockStatic &&
                node.naturalChildren.length === 0 &&
                (background || node.contentBoxHeight > 0)
            ) {
                layout.setContainerType(CONTAINER_NODE.FRAME);
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
                !node.use
            ) {
                node.hide();
                return { layout, next: true };
            } else {
                switch (node.tagName) {
                    case 'LI':
                    case 'OUTPUT':
                        layout.setContainerType(CONTAINER_NODE.TEXT);
                        break;
                    default: {
                        if (
                            node.textContent !== '' &&
                            (background ||
                                !node.pageFlow ||
                                (node.pseudoElement && getPseudoElt(node.element, node.sessionId) === '::after'))
                        ) {
                            layout.setContainerType(CONTAINER_NODE.TEXT);
                            node.inlineText = true;
                        } else {
                            layout.setContainerType(CONTAINER_NODE.FRAME);
                            node.exclude({ resource: NODE_RESOURCE.VALUE_STRING });
                        }
                    }
                }
            }
            return { layout };
        }
        processTraverseHorizontal(layout, siblings) {
            const parent = layout.parent;
            if (layout.floated.size === 1 && layout.every(item => item.floating)) {
                if (isUnknownParent(parent, CONTAINER_NODE.CONSTRAINT, layout.length)) {
                    parent.addAlign(256 /* FLOAT */);
                    parent.removeAlign(1 /* UNKNOWN */);
                    return undefined;
                } else {
                    layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 256 /* FLOAT */);
                }
            } else if (this.checkFrameHorizontal(layout)) {
                layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                layout.addRender(256 /* FLOAT */);
                layout.addRender(4 /* HORIZONTAL */);
            } else if (layout.length !== siblings.length || parent.hasAlign(8 /* VERTICAL */)) {
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
            const parent = layout.parent;
            const clearMap = this.application.clearMap;
            const floatSize = layout.floated.size;
            const length = layout.length;
            if (layout.some((item, index) => item.lineBreakTrailing && index < length - 1)) {
                if (!parent.hasAlign(8 /* VERTICAL */)) {
                    const containerType = getVerticalLayout(layout);
                    if (isUnknownParent(parent, containerType, length)) {
                        setVerticalLayout(parent);
                        return undefined;
                    } else {
                        if (parent.layoutConstraint) {
                            parent.addAlign(8 /* VERTICAL */);
                            if (!parent.hasAlign(16 /* ABSOLUTE */)) {
                                return undefined;
                            }
                        }
                        layout.node = this.createLayoutGroup(layout);
                        layout.setContainerType(containerType, 8 /* VERTICAL */ | 1 /* UNKNOWN */);
                    }
                }
            } else if (
                floatSize === 1 &&
                layout.every((item, index) => index === 0 || index === length - 1 || clearMap.has(item))
            ) {
                if (layout.same(node => node.float)) {
                    if (isUnknownParent(parent, CONTAINER_NODE.CONSTRAINT, length)) {
                        setVerticalLayout(parent);
                        return undefined;
                    } else {
                        layout.node = this.createLayoutGroup(layout);
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 256 /* FLOAT */);
                    }
                } else if (hasCleared(layout, clearMap) || this.checkFrameHorizontal(layout)) {
                    layout.node = this.createLayoutGroup(layout);
                    layout.addRender(256 /* FLOAT */);
                    layout.addRender(4 /* HORIZONTAL */);
                } else {
                    const containerType = getVerticalAlignedLayout(layout);
                    if (isUnknownParent(parent, containerType, length)) {
                        setVerticalLayout(parent);
                        return undefined;
                    } else {
                        if (parent.layoutConstraint) {
                            parent.addAlign(8 /* VERTICAL */);
                            if (!parent.hasAlign(16 /* ABSOLUTE */)) {
                                return undefined;
                            }
                        }
                        layout.node = this.createLayoutGroup(layout);
                        layout.setContainerType(containerType, 8 /* VERTICAL */);
                    }
                }
            } else if (floatSize) {
                if (hasCleared(layout, clearMap)) {
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
                    return undefined;
                } else {
                    if (parent.layoutConstraint) {
                        parent.addAlign(8 /* VERTICAL */);
                        if (!parent.hasAlign(16 /* ABSOLUTE */)) {
                            return undefined;
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
                layout.setContainerType(
                    CONTAINER_NODE.CONSTRAINT,
                    layout.every(item => item.floating) ? 256 /* FLOAT */ : 512 /* INLINE */
                );
            } else if (this.checkConstraintHorizontal(layout)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 4 /* HORIZONTAL */);
            } else if (this.checkLinearHorizontal(layout)) {
                layout.setContainerType(CONTAINER_NODE.LINEAR, 4 /* HORIZONTAL */);
                if (layout.floated.size > 0) {
                    sortHorizontalFloat(layout.children);
                }
            } else {
                layout.setContainerType(CONTAINER_NODE.RELATIVE, 4 /* HORIZONTAL */);
            }
            return layout;
        }
        sortRenderPosition(parent, templates) {
            var _a;
            if (parent.layoutRelative) {
                if (templates.some(item => item.node.zIndex !== 0)) {
                    templates.sort(sortTemplateStandard);
                }
            } else if (parent.layoutConstraint) {
                if (templates.some(item => item.node.zIndex !== 0 || !item.node.pageFlow)) {
                    const originalParent = parent.innerMostWrapped;
                    const actualParent = [];
                    const nested = [];
                    let result = [],
                        length = templates.length;
                    let i = 0;
                    while (i < length) {
                        const item = templates[i++];
                        const node = item.node.innerMostWrapped;
                        if (node.pageFlow || node.actualParent === node.documentParent || node === originalParent) {
                            result.push(item);
                            actualParent.push(node);
                        } else {
                            nested.push(item);
                        }
                    }
                    result.sort(sortTemplateStandard);
                    length = nested.length;
                    if (length > 0) {
                        const map = new Map();
                        const invalid = [];
                        const below = [];
                        i = 0;
                        while (i < length) {
                            const item = nested[i++];
                            const node = item.node.innerMostWrapped;
                            const adjacent = node.ascend({
                                condition: above => actualParent.includes(above),
                                error: above => above.rootElement,
                            })[0];
                            if (adjacent) {
                                ((_a = map.get(adjacent)) === null || _a === void 0 ? void 0 : _a.push(item)) ||
                                    map.set(adjacent, [item]);
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
                                const q = children.length;
                                i = 0;
                                while (i < q) {
                                    const item = children[i++];
                                    const node = item.node.innerMostWrapped;
                                    if (node.zIndex < 0) {
                                        below.push(item);
                                    } else {
                                        invalid.push(item);
                                    }
                                }
                            }
                        }
                        if (below.length > 0) {
                            below.sort(sortTemplateInvalid);
                            result = below.concat(result);
                        }
                        if (invalid.length > 0) {
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
            switch (layout.floated.size) {
                case 1:
                    if (
                        layout.node.cssAscend('textAlign') === 'center' &&
                        layout.some(item => !item.block && !item.floating)
                    ) {
                        return true;
                    } else if (layout.floated.has('right')) {
                        let pageFlow = 0,
                            multiline = false;
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
                        return (
                            layout.linearY ||
                            layout.some(item => (item.block && !item.floating) || !item.inlineFlow, { start: 1 })
                        );
                    }
                    break;
                case 2:
                    return true;
            }
            return false;
        }
        checkConstraintFloat(layout) {
            if (layout.length > 1) {
                const clearMap = this.application.clearMap;
                let A = true,
                    B = true;
                for (const node of layout) {
                    if (!clearMap.has(node)) {
                        const inputElement = node.inputElement || node.controlElement;
                        if (
                            A &&
                            !(
                                node.floating ||
                                node.autoMargin.horizontal ||
                                (node.inlineDimension && !inputElement) ||
                                node.imageOrSvgElement ||
                                node.marginTop < 0
                            )
                        ) {
                            A = false;
                        }
                        if (B && node.percentWidth === 0) {
                            B = false;
                        }
                        if (!A && !B) {
                            return false;
                        }
                    }
                }
                return true;
            }
            return false;
        }
        checkConstraintHorizontal(layout) {
            if (layout.length > 1 && layout.singleRowAligned) {
                switch (layout.floated.size) {
                    case 1:
                        if (hasCleared(layout, this.application.clearMap)) {
                            return false;
                        } else {
                            let left = false,
                                right = false;
                            for (const node of layout) {
                                const { float, autoMargin } = node;
                                if (float === 'left' || autoMargin.right) {
                                    left = true;
                                    if (right) {
                                        return false;
                                    }
                                }
                                if (float === 'right' || autoMargin.left) {
                                    right = true;
                                    if (left) {
                                        return false;
                                    }
                                }
                            }
                        }
                        break;
                    case 2:
                        return false;
                }
                return layout.some(
                    node =>
                        node.blockVertical ||
                        (node.percentWidth > 0 &&
                            node.percentWidth < 1 &&
                            !node.inputElement &&
                            !node.controlElement) ||
                        node.marginTop < 0 ||
                        (node.verticalAlign === 'bottom' && !layout.parent.hasHeight)
                );
            }
            return false;
        }
        checkLinearHorizontal(layout) {
            const floated = layout.floated;
            const floatSize = floated.size;
            if (
                (floatSize === 0 || (floatSize === 1 && floated.has('left'))) &&
                layout.node.lineHeight === 0 &&
                layout.singleRowAligned
            ) {
                const { fontSize, lineHeight } = layout.item(0);
                const boxWidth = layout.parent.actualBoxWidth();
                let contentWidth = 0;
                for (const node of layout) {
                    if (
                        !(
                            node.naturalChild &&
                            node.isEmpty &&
                            !node.inputElement &&
                            !node.controlElement &&
                            !node.positionRelative &&
                            node.baseline &&
                            !node.blockVertical &&
                            node.zIndex === 0 &&
                            node.lineHeight === lineHeight &&
                            node.fontSize === fontSize
                        )
                    ) {
                        return false;
                    } else {
                        contentWidth += node.linear.width;
                    }
                    if (contentWidth >= boxWidth) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        setConstraints(cache) {
            cache.each(node => {
                const renderChildren = node.renderChildren;
                const length = renderChildren.length;
                if (length > 0 && node.hasProcedure(NODE_PROCEDURE$1.CONSTRAINT)) {
                    if (node.hasAlign(2 /* AUTO_LAYOUT */)) {
                        if (node.layoutConstraint && !node.layoutElement) {
                            this.evaluateAnchors(renderChildren);
                        }
                    } else if (node.layoutRelative) {
                        this.processRelativeHorizontal(node, renderChildren);
                    } else if (node.layoutConstraint) {
                        const pageFlow = new Array(length);
                        let i = 0,
                            j = 0;
                        while (i < length) {
                            const item = renderChildren[i++];
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
                                                Controller.anchorPosition(item, node, true);
                                            }
                                            if (!constraint.vertical) {
                                                Controller.anchorPosition(item, node, false);
                                            }
                                        }
                                        if (!constraint.horizontal) {
                                            this.addGuideline(item, node, { orientation: 'horizontal' });
                                        }
                                        if (!constraint.vertical) {
                                            this.addGuideline(item, node, { orientation: 'vertical' });
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
                                View.setConstraintDimension(item, 1);
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
                    return layout.isEmpty ? this.renderNode(layout) : undefined;
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
            let { parent, containerType } = layout;
            const node = layout.node;
            let controlName = View.getControlName(containerType, node.api);
            switch (node.tagName) {
                case 'IMG':
                case 'CANVAS': {
                    const element = node.element;
                    let imageSet;
                    if (node.actualParent.tagName === 'PICTURE') {
                        const mimeType = this.localSettings.mimeType.image;
                        imageSet = getSrcSet$1(element, mimeType === '*' ? undefined : mimeType);
                        if (imageSet) {
                            const image = imageSet[0];
                            const actualWidth = image.actualWidth;
                            if (actualWidth) {
                                setImageDimension(
                                    node,
                                    actualWidth,
                                    this.application.resourceHandler.getImage(element.src)
                                );
                            } else {
                                const stored = this.application.resourceHandler.getImage(image.src);
                                if (stored) {
                                    setImageDimension(node, stored.width, stored);
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
                                this.application.resourceHandler.writeRawImage('image/png', {
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
                        const container = this.application.createNode(node.sessionId, { parent, innerWrap: node });
                        container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                        container.inherit(node, 'base');
                        container.cssCopy(node, 'position', 'zIndex');
                        container.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE$1.ALL });
                        container.autoPosition = false;
                        if (
                            node.percentWidth > 0 &&
                            parent.layoutConstraint &&
                            (parent.blockStatic || parent.hasWidth)
                        ) {
                            container.app(
                                'layout_constraintWidth_percent',
                                truncate$2(node.percentWidth, node.localSettings.floatPrecision)
                            );
                            container.setLayoutHeight('0px');
                        } else if (node.hasPX('width')) {
                            container.setLayoutWidth(formatPX$1(node.actualWidth));
                        } else {
                            container.setLayoutWidth('wrap_content');
                        }
                        if (node.percentHeight > 0 && parent.layoutConstraint) {
                            container.app(
                                'layout_constraintHeight_percent',
                                truncate$2(node.percentHeight, node.localSettings.floatPrecision)
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
                            controlName: CONTAINER_ANDROID.FRAME,
                        });
                        parent = container;
                        layout.parent = container;
                    }
                    break;
                }
                case 'INPUT': {
                    const element = node.element;
                    const type = element.type;
                    switch (type) {
                        case 'radio':
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
                        case 'number':
                        case 'range':
                            node.android('inputType', 'number');
                            node.android('progress', element.value);
                            setInputMinMax(node, element);
                            break;
                        case 'time':
                            node.android('inputType', 'time');
                            setInputMinMax(node, element);
                            break;
                        case 'date':
                            node.android('inputType', 'date');
                            setInputMinMax(node, element);
                            break;
                        case 'datetime-local':
                            node.android('inputType', 'datetime');
                            setInputMinMax(node, element);
                            break;
                        case 'email':
                            node.android('inputType', 'textEmailAddress');
                            setInputMinDimension(node, element);
                            break;
                        case 'tel':
                            node.android('inputType', 'phone');
                            setInputMinDimension(node, element);
                            break;
                        case 'url':
                            node.android('inputType', 'textUri');
                            setInputMinDimension(node, element);
                            break;
                        case 'week':
                        case 'month':
                        case 'search':
                            node.android('inputType', 'text');
                            setInputMinDimension(node, element);
                            break;
                        case 'image':
                        case 'color':
                            if (!node.hasWidth) {
                                node.css('width', formatPX$1(node.bounds.width));
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
                    node.android('minLines', rows > 0 ? rows.toString() : '2');
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
                    if (maxLength > 0) {
                        node.android('maxLength', maxLength.toString());
                    }
                    if (!node.hasWidth && cols > 0) {
                        node.css('width', formatPX$1(cols * 8));
                    }
                    if (!node.hasHeight) {
                        node.css('height', formatPX$1(node.bounds.height));
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
                        setInlineBlock(node);
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
                        node.css('width', formatPX$1(node.bounds.width));
                    }
                    if (!node.hasHeight) {
                        node.css('height', formatPX$1(node.bounds.height));
                    }
                    node.android('progressTint', '@color/' + Resource.addColor(foregroundColor));
                    node.android('progressBackgroundTint', '@color/' + Resource.addColor(backgroundColor));
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
                    if (hasMimeType$1(videoMimeType, src)) {
                        mimeType = parseMimeType(src);
                    } else {
                        src = '';
                        iterateArray(element.children, source => {
                            if (source.tagName === 'SOURCE') {
                                if (hasMimeType$1(videoMimeType, source.src)) {
                                    src = source.src.trim();
                                    mimeType = parseMimeType(src);
                                    return true;
                                } else {
                                    mimeType = source.type.trim().toLowerCase();
                                    if (videoMimeType.includes(mimeType)) {
                                        src = source.src;
                                        return true;
                                    }
                                }
                            }
                            return;
                        });
                    }
                    if (!node.hasPX('width')) {
                        node.css('width', formatPX$1(node.actualWidth), true);
                    }
                    if (!node.hasPX('height')) {
                        node.css('height', formatPX$1(node.actualHeight), true);
                    }
                    if (node.inline) {
                        setInlineBlock(node);
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
                case CONTAINER_ANDROID.TEXT: {
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
                            truncate$2(node.toFloat('letterSpacing') / node.fontSize, node.localSettings.floatPrecision)
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
                            const color = Resource.addColor(parseColor$1(match[1] || node.css('color')));
                            if (color !== '') {
                                const precision = node.localSettings.floatPrecision;
                                node.android('shadowColor', `@color/${color}`);
                                node.android('shadowDx', truncate$2(node.parseWidth(match[2]) * 2, precision));
                                node.android('shadowDy', truncate$2(node.parseHeight(match[3]) * 2, precision));
                                node.android(
                                    'shadowRadius',
                                    truncate$2(match[4] ? Math.max(node.parseWidth(match[4]), 0) : 0.01, precision)
                                );
                            }
                        }
                    }
                    if (node.css('whiteSpace') === 'nowrap') {
                        node.android('maxLines', '1');
                        if (node.css('textOverflow') === 'ellipsis' && node.css('overflow') === 'hidden') {
                            node.android('ellipsize', 'end');
                        }
                    }
                    break;
                }
                case CONTAINER_ANDROID.BUTTON:
                    if (!node.hasHeight) {
                        node.android('minHeight', formatPX$1(Math.ceil(node.actualHeight)));
                    }
                    node.mergeGravity('gravity', 'center_vertical');
                    setReadOnly(node);
                    break;
                case CONTAINER_ANDROID.SELECT:
                case CONTAINER_ANDROID.CHECKBOX:
                case CONTAINER_ANDROID.RADIO:
                    setReadOnly(node);
                    break;
                case CONTAINER_ANDROID.EDIT:
                    if (!node.companion && node.hasProcedure(NODE_PROCEDURE$1.ACCESSIBILITY)) {
                        [node.previousSibling, node.nextSibling].some(sibling => {
                            var _a;
                            if (
                                (sibling === null || sibling === void 0 ? void 0 : sibling.visible) &&
                                sibling.pageFlow
                            ) {
                                const id = node.elementId;
                                const labelElement = sibling.element;
                                const labelParent =
                                    sibling.documentParent.tagName === 'LABEL' && sibling.documentParent;
                                if (
                                    id !== '' &&
                                    id === ((_a = labelElement.htmlFor) === null || _a === void 0 ? void 0 : _a.trim())
                                ) {
                                    sibling.android('labelFor', node.documentId);
                                    return true;
                                } else if (labelParent && sibling.textElement) {
                                    labelParent.android('labelFor', node.documentId);
                                    return true;
                                }
                            }
                            return false;
                        });
                    }
                    if ((_a = node.element.list) === null || _a === void 0 ? void 0 : _a.children.length) {
                        controlName = CONTAINER_ANDROID.EDIT_LIST;
                    } else if (node.api >= 26 /* OREO */) {
                        node.android('importantForAutofill', 'no');
                    }
                    setReadOnly(node);
                case CONTAINER_ANDROID.RANGE:
                    if (!node.hasPX('width')) {
                        node.css('width', formatPX$1(node.bounds.width));
                    }
                    break;
                case CONTAINER_ANDROID.LINE:
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
                this.userSettings.showAttributes ? node.extractAttributes(1) : undefined,
                attrs.content
            );
        }
        renderSpace(options) {
            const android = options.android;
            let { width, height } = options;
            if (width) {
                if (isPercent$1(width)) {
                    android.layout_columnWeight = truncate$2(
                        parseFloat(width) / 100,
                        this.localSettings.precision.standardFloat
                    );
                    width = '0px';
                }
            } else {
                width = 'wrap_content';
            }
            if (height) {
                if (isPercent$1(height)) {
                    android.layout_rowWeight = truncate$2(
                        parseFloat(height) / 100,
                        this.localSettings.precision.standardFloat
                    );
                    height = '0px';
                }
            } else {
                height = 'wrap_content';
            }
            if (options.column !== undefined) {
                android.layout_column = options.column.toString();
            }
            if (options.columnSpan) {
                android.layout_columnSpan = options.columnSpan.toString();
            }
            if (options.row !== undefined) {
                android.layout_row = options.row.toString();
            }
            if (options.rowSpan) {
                android.layout_rowSpan = options.rowSpan.toString();
            }
            const result = { android, app: options.app };
            const output = this.renderNodeStatic({ controlName: CONTAINER_ANDROID.SPACE, width, height }, result);
            options.documentId = result.documentId;
            return output;
        }
        addGuideline(node, parent, options) {
            this.applyGuideline(node, parent, 'horizontal', options);
            this.applyGuideline(node, parent, 'vertical', options);
        }
        addBarrier(nodes, barrierDirection) {
            const unbound = [];
            let length = nodes.length;
            let i = 0;
            while (i < length) {
                const node = nodes[i++];
                const barrier = node.constraint.barrier;
                if (!barrier) {
                    node.constraint.barrier = {};
                } else if (barrier[barrierDirection]) {
                    continue;
                }
                unbound.push(node);
            }
            length = unbound.length;
            if (length > 0) {
                const options = {
                    android: {},
                    app: {
                        barrierDirection,
                        constraint_referenced_ids: unbound
                            .map(item => getDocumentId(item.anchorTarget.documentId))
                            .join(','),
                    },
                };
                const { api, anchorTarget } = unbound[length - 1];
                const content = this.renderNodeStatic(
                    { controlName: api < 29 /* Q */ ? CONTAINER_ANDROID.BARRIER : CONTAINER_ANDROID_X.BARRIER },
                    options
                );
                switch (barrierDirection) {
                    case 'top':
                    case 'left':
                        this.addBeforeOutsideTemplate(anchorTarget.id, content, false);
                        break;
                    default:
                        this.addAfterOutsideTemplate(anchorTarget.id, content, false);
                        break;
                }
                const documentId = options.documentId;
                if (documentId) {
                    i = 0;
                    while (i < length) {
                        unbound[i++].constraint.barrier[barrierDirection] = documentId;
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
            let i = 0;
            while (i < length) {
                const node = nodes[i++];
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
                            if (
                                (next === null || next === void 0 ? void 0 : next.alignSibling('topBottom')) ===
                                current.documentId
                            ) {
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
            i = 0;
            while (i < length) {
                const node = nodes[i++];
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
            const group = new ViewGroup(this.application.nextId, node, children);
            this.afterInsertNode(group);
            if (parent) {
                parent.replaceTry({ child: node, replaceWith: group, notFoundAppend: true });
            } else {
                group.containerIndex = node.containerIndex;
            }
            this.application
                .getProcessingCache(node.sessionId)
                .add(
                    group,
                    (options === null || options === void 0 ? void 0 : options.delegate) === true,
                    (options === null || options === void 0 ? void 0 : options.cascade) === true
                );
            return group;
        }
        createNodeWrapper(node, parent, options = {}) {
            var _a, _b, _c;
            const { children, containerType, alignmentType } = options;
            const container = this.application.createNode(node.sessionId, {
                parent,
                children,
                append: true,
                innerWrap: node,
                delegate: true,
                cascade: options.cascade === true || (!!children && children.length > 0 && !node.rootElement),
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
                if (parseFloat(columnWeight) > 0) {
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
        processRelativeHorizontal(node, children) {
            const rowsLeft = [];
            let rowsRight,
                autoPosition = false,
                alignmentMultiLine = false;
            if (node.hasAlign(8 /* VERTICAL */)) {
                let previous;
                const length = children.length;
                let i = 0;
                while (i < length) {
                    const item = children[i++];
                    if (previous) {
                        item.anchor('topBottom', previous.documentId);
                    } else {
                        item.anchor('top', 'true');
                    }
                    if (item.pageFlow) {
                        rowsLeft.push([item]);
                        previous = item;
                    } else {
                        autoPosition = true;
                    }
                }
            } else {
                const boxParent = node.nodeGroup ? node.documentParent : node;
                const clearMap = this.application.clearMap;
                const lineWrap = node.css('whiteSpace') !== 'nowrap';
                let boxWidth = boxParent.actualBoxWidth(getBoxWidth.call(this, node, children)),
                    textIndent = 0;
                if (node.naturalElement) {
                    if (node.blockDimension) {
                        textIndent = node.parseUnit(node.css('textIndent'));
                    }
                    if (node.floating) {
                        const nextSibling = node.nextSibling;
                        if (
                            (nextSibling === null || nextSibling === void 0 ? void 0 : nextSibling.floating) &&
                            nextSibling.float !== node.float &&
                            nextSibling.hasWidth
                        ) {
                            boxWidth = Math.max(boxWidth, node.actualParent.box.width - nextSibling.linear.width);
                            if (!node.visibleStyle.background && !node.hasPX('maxWidth') && boxWidth > node.width) {
                                node.css('width', formatPX$1(boxWidth), true);
                            }
                        }
                    }
                }
                const relativeData = {
                    clearMap,
                    textIndent,
                    boxWidth,
                    rowLength: 0,
                };
                const partition = segmentRightAligned(children);
                for (let j = 0; j < 2; ++j) {
                    const seg = partition[j];
                    const length = seg.length;
                    if (length === 0) {
                        continue;
                    }
                    const leftAlign = j === 1;
                    let leftForward = true,
                        rowWidth = 0,
                        textIndentSpacing = false,
                        previousRowLeft,
                        alignParent,
                        rows,
                        previous,
                        items;
                    if (leftAlign) {
                        if (
                            ((!node.naturalElement && seg[0].actualParent) || node).cssAny('textAlign', {
                                initial: true,
                                values: ['right', 'end'],
                            })
                        ) {
                            alignParent = 'right';
                            leftForward = false;
                            seg[length - 1].anchor(alignParent, 'true');
                        } else {
                            alignParent = 'left';
                        }
                        if (seg.some(item => item.floating)) {
                            sortHorizontalFloat(seg);
                        }
                        rows = rowsLeft;
                    } else {
                        alignParent = 'right';
                        relativeData.rowLength = 0;
                        rowsRight = [];
                        rows = rowsRight;
                    }
                    for (let i = 0; i < length; ++i) {
                        const item = seg[i];
                        let alignSibling;
                        if (leftAlign && leftForward) {
                            alignSibling = 'leftRight';
                            if (
                                i === 0 &&
                                item.inline &&
                                Math.abs(textIndent) >= item.actualWidth &&
                                item.float !== 'right' &&
                                !item.positionRelative
                            ) {
                                textIndentSpacing = true;
                                if (!item.floating) {
                                    item.setCacheValue('float', 'left');
                                    item.setCacheValue('floating', true);
                                }
                            }
                        } else {
                            alignSibling = 'rightLeft';
                        }
                        if (!item.pageFlow) {
                            if (previous) {
                                const documentId = previous.documentId;
                                item.anchor(alignSibling, documentId);
                                item.anchor('top', documentId);
                            } else {
                                item.anchor(alignParent, 'true');
                                item.anchor('top', 'true');
                            }
                            autoPosition = true;
                            continue;
                        }
                        let bounds = item.bounds,
                            multiline = item.multiline,
                            anchored = item.autoMargin.horizontal === true,
                            siblings;
                        if (item.styleText && !item.hasPX('width')) {
                            const textBounds = item.textBounds;
                            if (
                                textBounds &&
                                (textBounds.numberOfLines > 1 || Math.ceil(textBounds.width) < item.box.width)
                            ) {
                                bounds = textBounds;
                            }
                        }
                        if (
                            multiline &&
                            Math.floor(bounds.width) <= boxWidth &&
                            !item.hasPX('width') &&
                            !isMultiline(item)
                        ) {
                            multiline = false;
                            item.multiline = false;
                        }
                        if (anchored) {
                            if (item.autoMargin.leftRight) {
                                item.anchorParent('horizontal');
                            } else {
                                item.anchor(item.autoMargin.left ? 'right' : 'left', 'true');
                            }
                        }
                        if (previous) {
                            siblings =
                                item.inlineVertical && previous.inlineVertical && item.previousSibling !== previous
                                    ? getElementsBetweenSiblings(previous.element, item.element)
                                    : undefined;
                            let textNewRow = false,
                                retainMultiline = false;
                            if (item.textElement) {
                                let checkWidth = true;
                                if (previous.textElement) {
                                    if (
                                        i === 1 &&
                                        item.plainText &&
                                        item.previousSibling === previous &&
                                        !/^\s+/.test(item.textContent) &&
                                        !/\s+$/.test(previous.textContent)
                                    ) {
                                        retainMultiline = true;
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
                                if (
                                    checkWidth &&
                                    lineWrap &&
                                    !relativeFloatWrap(item, previous, multiline, rowWidth, relativeData)
                                ) {
                                    if (
                                        relativeWrapWidth(
                                            item,
                                            bounds,
                                            multiline,
                                            previousRowLeft,
                                            rowWidth,
                                            relativeData
                                        )
                                    ) {
                                        textNewRow = true;
                                    } else if (item.actualParent.tagName !== 'CODE') {
                                        textNewRow = (multiline && item.plainText) || isMultiline(item);
                                    }
                                }
                            }
                            if (previous.floating && adjustFloatingNegativeMargin(item, previous)) {
                                alignSibling = '';
                            }
                            if (
                                textNewRow ||
                                (item.nodeGroup && !item.hasAlign(64 /* SEGMENTED */)) ||
                                (Math.ceil(item.bounds.top) >= previous.bounds.bottom &&
                                    (item.blockStatic || (item.floating && previous.float === item.float))) ||
                                (!item.textElement &&
                                    relativeWrapWidth(
                                        item,
                                        bounds,
                                        multiline,
                                        previousRowLeft,
                                        rowWidth,
                                        relativeData
                                    ) &&
                                    !relativeFloatWrap(item, previous, multiline, rowWidth, relativeData)) ||
                                (!item.floating &&
                                    (previous.blockStatic ||
                                        item.siblingsLeading.some(sibling => sibling.excluded && sibling.blockStatic) ||
                                        (siblings === null || siblings === void 0
                                            ? void 0
                                            : siblings.some(element => causesLineBreak(element))))) ||
                                previous.autoMargin.horizontal ||
                                clearMap.has(item) ||
                                Resource.checkPreIndent(previous)
                            ) {
                                if (clearMap.has(item) && !previousRowLeft) {
                                    item.setBox(1 /* MARGIN_TOP */, { reset: 1 });
                                }
                                if (leftForward) {
                                    if (
                                        previousRowLeft &&
                                        (item.bounds.bottom <= previousRowLeft.bounds.bottom || textIndentSpacing)
                                    ) {
                                        if (!anchored) {
                                            item.anchor(alignSibling, previousRowLeft.documentId);
                                        }
                                    } else {
                                        if (!anchored) {
                                            item.anchor(alignParent, 'true');
                                        }
                                        previousRowLeft = undefined;
                                    }
                                    anchored = true;
                                } else {
                                    if (previousRowLeft && item.linear.bottom > previousRowLeft.bounds.bottom) {
                                        previousRowLeft = undefined;
                                    }
                                    previous.anchor(alignParent, 'true');
                                }
                                rowWidth = Math.min(
                                    0,
                                    textNewRow && !previous.multiline && multiline && !clearMap.has(item)
                                        ? item.linear.right - node.box.right
                                        : 0
                                );
                                items = [item];
                                rows.push(items);
                                relativeData.items = items;
                                ++relativeData.rowLength;
                            } else {
                                if (alignSibling !== '') {
                                    if (leftForward) {
                                        if (!anchored) {
                                            item.anchor(alignSibling, previous.documentId);
                                            anchored = true;
                                        }
                                    } else {
                                        previous.anchor(alignSibling, item.documentId);
                                    }
                                }
                                if (multiline && !item.hasPX('width') && !previous.floating && !retainMultiline) {
                                    item.multiline = false;
                                }
                                items.push(item);
                            }
                        } else {
                            if (leftForward) {
                                if (!anchored) {
                                    item.anchor(alignParent, 'true');
                                }
                            }
                            items = [item];
                            rows.push(items);
                            relativeData.items = items;
                            ++relativeData.rowLength;
                        }
                        if (item.float === 'left' && leftAlign) {
                            if (previousRowLeft) {
                                if (item.linear.bottom > previousRowLeft.linear.bottom) {
                                    previousRowLeft = item;
                                }
                            } else {
                                previousRowLeft = item;
                            }
                        }
                        if (
                            (siblings === null || siblings === void 0
                                ? void 0
                                : siblings.some(
                                      element => !!getElementAsNode(element, item.sessionId) || causesLineBreak(element)
                                  )) === false
                        ) {
                            const betweenStart = getRangeClientRect(siblings[0]);
                            if (!betweenStart.numberOfLines) {
                                const betweenEnd = siblings.length > 1 && getRangeClientRect(siblings.pop());
                                if (!betweenEnd || !betweenEnd.numberOfLines) {
                                    rowWidth += betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                                }
                            }
                        }
                        rowWidth += item.marginLeft + bounds.width + item.marginRight;
                        previous = item;
                    }
                }
                if (textIndent < 0 && rowsLeft.length === 1) {
                    node.setCacheValue('paddingLeft', Math.max(0, node.paddingLeft + textIndent));
                }
            }
            if (rowsLeft.length > 1 || (rowsRight && rowsRight.length > 1)) {
                alignmentMultiLine = true;
            }
            const applyLayout = rows => {
                let previousBaseline = null;
                const length = rows.length;
                const singleRow = length === 1 && !node.hasHeight;
                for (let i = 0, j = 0; i < length; ++i) {
                    const items = rows[i];
                    let baseline;
                    const q = items.length;
                    if (q > 1) {
                        const bottomAligned = getTextBottom(items);
                        baseline = NodeUI.baseline(
                            bottomAligned.length > 0 ? items.filter(item => !bottomAligned.includes(item)) : items
                        );
                        let textBottom = bottomAligned[0],
                            maxCenterHeight = 0,
                            textBaseline = null;
                        if (baseline && textBottom) {
                            if (baseline !== textBottom && baseline.bounds.height < textBottom.bounds.height) {
                                baseline.anchor('bottom', textBottom.documentId);
                            } else {
                                baseline = NodeUI.baseline(items);
                                textBottom = undefined;
                            }
                        }
                        const baselineAlign = [];
                        const documentId =
                            i === 0 ? 'true' : baseline === null || baseline === void 0 ? void 0 : baseline.documentId;
                        j = 0;
                        while (j < q) {
                            const item = items[j++];
                            if (item === baseline || item === textBottom) {
                                continue;
                            }
                            const verticalAlign = item.inlineVertical ? item.css('verticalAlign') : '';
                            if (item.controlElement) {
                                let adjustment = item.bounds.top;
                                if (previousBaseline) {
                                    adjustment -= previousBaseline.linear.bottom;
                                } else {
                                    item.anchor('top', 'true');
                                    adjustment -= node.box.top;
                                }
                                item.setBox(1 /* MARGIN_TOP */, { reset: 1, adjustment });
                                item.baselineAltered = true;
                                continue;
                            }
                            let alignTop = false;
                            if (item.baseline) {
                                if (
                                    item.renderChildren.length > 0 &&
                                    (isLength$1(item.verticalAlign) || !item.baselineElement)
                                ) {
                                    alignTop = true;
                                } else {
                                    baselineAlign.push(item);
                                }
                            } else {
                                switch (verticalAlign) {
                                    case 'text-top':
                                        if (!textBaseline) {
                                            textBaseline = NodeUI.baseline(items, true);
                                        }
                                        if (textBaseline && item !== textBaseline) {
                                            item.anchor('top', textBaseline.documentId);
                                        }
                                        break;
                                    case 'super':
                                        if (!item.baselineAltered) {
                                            item.modifyBox(
                                                1 /* MARGIN_TOP */,
                                                Math.floor(
                                                    item.baselineHeight *
                                                        this.localSettings.deviations.superscriptTopOffset
                                                ) * -1
                                            );
                                        }
                                    case 'top':
                                        if (documentId && documentId !== item.documentId) {
                                            item.anchor('top', documentId);
                                        } else if (baseline) {
                                            item.anchor('top', baseline.documentId);
                                        }
                                        break;
                                    case 'middle': {
                                        const height = Math.max(item.actualHeight, item.lineHeight);
                                        if (!alignmentMultiLine) {
                                            item.anchor('centerVertical', 'true');
                                            if (item.imageElement) {
                                                maxCenterHeight = Math.max(height, maxCenterHeight);
                                            }
                                        } else if (baseline) {
                                            const heightParent = Math.max(baseline.actualHeight, baseline.lineHeight);
                                            if (height < heightParent) {
                                                item.anchor('top', baseline.documentId);
                                                item.setBox(1 /* MARGIN_TOP */, {
                                                    reset: 1,
                                                    adjustment: Math.round((heightParent - height) / 2),
                                                });
                                                item.baselineAltered = true;
                                            } else if (height > maxCenterHeight) {
                                                maxCenterHeight = height;
                                            }
                                        }
                                        break;
                                    }
                                    case 'text-bottom':
                                        if (!textBaseline) {
                                            textBaseline = NodeUI.baseline(items, true);
                                        }
                                        if (textBaseline && textBaseline !== item) {
                                            item.anchor('bottom', textBaseline.documentId);
                                        } else if (baseline) {
                                            item.anchor('bottom', baseline.documentId);
                                        }
                                        break;
                                    case 'sub':
                                        if (!item.baselineAltered) {
                                            item.modifyBox(
                                                1 /* MARGIN_TOP */,
                                                Math.ceil(
                                                    item.baselineHeight *
                                                        this.localSettings.deviations.subscriptBottomOffset
                                                ) * 1
                                            );
                                        }
                                    case 'bottom':
                                        if (documentId && !withinRange(node.bounds.height, item.bounds.height)) {
                                            if (documentId === 'true' && !node.hasHeight) {
                                                item.anchor('top', documentId);
                                                item.setBox(1 /* MARGIN_TOP */, {
                                                    reset: 1,
                                                    adjustment: item.bounds.top - node.box.top,
                                                });
                                                item.baselineAltered = true;
                                            } else {
                                                item.anchor('bottom', documentId);
                                            }
                                        }
                                        break;
                                    default:
                                        alignTop = !item.baselineAltered;
                                        break;
                                }
                            }
                            if (i === 0 && alignTop) {
                                item.anchor('top', 'true');
                            }
                        }
                        const r = baselineAlign.length;
                        if (baseline) {
                            baseline.baselineActive = true;
                            if (r > 0) {
                                adjustBaseline(baseline, baselineAlign, singleRow, node.box.top);
                                if (singleRow && baseline.is(CONTAINER_NODE.BUTTON)) {
                                    baseline.anchor('centerVertical', 'true');
                                    baseline = null;
                                }
                            } else if (baseline.textElement) {
                                if (maxCenterHeight > Math.max(baseline.actualHeight, baseline.lineHeight)) {
                                    baseline.anchor('centerVertical', 'true');
                                    baseline = null;
                                } else if (baseline.multiline) {
                                    const { left, height } = baseline.bounds;
                                    let k = 0;
                                    while (k < q) {
                                        const item = items[k++];
                                        if (item === baseline) {
                                            break;
                                        } else if (left < item.bounds.right && height < item.bounds.height) {
                                            baseline.anchor('bottom', item.documentId);
                                            break;
                                        }
                                    }
                                }
                            }
                        } else if (r > 0 && r < q) {
                            textBottom = getTextBottom(items)[0];
                            if (textBottom) {
                                let k = 0;
                                while (k < r) {
                                    const item = baselineAlign[k++];
                                    if (
                                        item.baseline &&
                                        !item.multiline &&
                                        textBottom.bounds.height > item.bounds.height
                                    ) {
                                        item.anchor('bottom', textBottom.documentId);
                                    }
                                }
                            }
                        }
                        let last = true;
                        j = q - 1;
                        while (j >= 0) {
                            const previous = items[j--];
                            if (previous.textElement) {
                                previous.setSingleLine(last && !previous.rightAligned && !previous.centerAligned);
                            }
                            last = false;
                        }
                        if (node.cssInitial('textAlign') === 'center' && length > 1) {
                            const application = this.application;
                            const group = this.createNodeGroup(items[0], items, node);
                            group.setControlType(CONTAINER_ANDROID.RELATIVE, CONTAINER_NODE.RELATIVE);
                            group.render(node);
                            group.anchorParent('horizontal');
                            group.setLayoutWidth('wrap_content');
                            group.setLayoutHeight('wrap_content');
                            let renderIndex = -1;
                            j = 0;
                            while (j < q) {
                                const item = items[j++];
                                const index = children.indexOf(item);
                                if (index !== -1) {
                                    if (renderIndex === -1) {
                                        renderIndex = index;
                                    } else {
                                        renderIndex = Math.min(index, renderIndex);
                                    }
                                }
                                item.removeTry();
                                item.render(group);
                                application.addLayoutTemplate(group, item, {
                                    type: 1 /* XML */,
                                    node: item,
                                    controlName: item.controlName,
                                });
                            }
                            application.addLayoutTemplate(
                                node,
                                group,
                                {
                                    type: 1 /* XML */,
                                    node: group,
                                    controlName: group.controlName,
                                },
                                renderIndex
                            );
                            if (previousBaseline) {
                                group.anchor('topBottom', previousBaseline.documentId);
                            } else {
                                previousBaseline = group;
                            }
                            continue;
                        }
                    } else {
                        baseline = items[0];
                        if (baseline.centerAligned) {
                            baseline.anchorParent('horizontal');
                            baseline.anchorDelete('left', 'right');
                        }
                    }
                    let requireBottom = false;
                    if (!baseline) {
                        baseline = items[0];
                        requireBottom = true;
                    }
                    j = 0;
                    while (j < q) {
                        const item = items[j++];
                        if (previousBaseline && !item.alignSibling('baseline')) {
                            item.anchor('topBottom', previousBaseline.documentId);
                        }
                        if (requireBottom && item.linear.bottom >= baseline.linear.bottom) {
                            baseline = item;
                        }
                    }
                    previousBaseline = baseline;
                }
            };
            applyLayout(rowsLeft);
            if (rowsRight) {
                applyLayout(rowsRight);
            }
            node.horizontalRows = rowsRight ? rowsLeft.concat(rowsRight) : rowsLeft;
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
                    const pageFlowA = a.node.pageFlow;
                    const pageFlowB = b.node.pageFlow;
                    if (!pageFlowA && pageFlowB) {
                        return 1;
                    } else if (!pageFlowB && pageFlowA) {
                        return -1;
                    }
                    return 0;
                });
            }
        }
        processConstraintHorizontal(node, children) {
            const reverse = node.hasAlign(1024 /* RIGHT */);
            const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
            let valid = true,
                bias = 0,
                baselineCount = 0,
                textBaseline,
                textBottom,
                tallest,
                bottom,
                previous;
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
            if (children.some(item => item.floating)) {
                if (!reverse) {
                    switch (bias) {
                        case 0.5: {
                            let floating;
                            [floating, children] = partitionArray(
                                children,
                                item => item.floating || item.autoMargin.horizontal === true
                            );
                            if (floating.length > 0) {
                                this.processConstraintChain(node, floating);
                            }
                            break;
                        }
                        case 1: {
                            let leftAligned;
                            [leftAligned, children] = segmentLeftAligned(children);
                            if (leftAligned.length > 0) {
                                this.processConstraintChain(node, leftAligned);
                            }
                            break;
                        }
                        default: {
                            let rightAligned;
                            [rightAligned, children] = segmentRightAligned(children);
                            if (rightAligned.length > 0) {
                                this.processConstraintChain(node, rightAligned);
                            }
                            break;
                        }
                    }
                }
                sortHorizontalFloat(children);
            }
            if (!node.hasPX('width') && children.some(item => item.percentWidth > 0)) {
                node.setLayoutWidth('match_parent');
            }
            const baseline = NodeUI.baseline(children);
            const documentId = baseline === null || baseline === void 0 ? void 0 : baseline.documentId;
            let percentWidth = View.availablePercent(children, 'width', node.box.width);
            const length = children.length;
            for (let i = 0; i < length; ++i) {
                const item = children[i];
                if (previous) {
                    if (item.pageFlow) {
                        previous.anchor(chainEnd, item.documentId);
                        item.anchor(chainStart, previous.documentId);
                        if (i === length - 1) {
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
                        NodeUI.justified(item.innerMostWrapped) ? 'spread_inside' : 'packed'
                    );
                }
                if (item.pageFlow) {
                    if (item !== baseline) {
                        if (item.controlElement) {
                            valid = constraintAlignTop(node, item);
                        } else if (item.inlineVertical) {
                            if (!tallest || getMaxHeight(item) > getMaxHeight(tallest)) {
                                tallest = item;
                            }
                            switch (item.css('verticalAlign')) {
                                case 'text-top':
                                    if (textBaseline === undefined) {
                                        textBaseline = NodeUI.baseline(children, true);
                                    }
                                    if (textBaseline && item !== textBaseline) {
                                        item.anchor('top', textBaseline.documentId);
                                    } else {
                                        valid = constraintAlignTop(node, item);
                                    }
                                    break;
                                case 'middle':
                                    if (textBottom === undefined) {
                                        textBottom = getTextBottom(children)[0] || null;
                                    }
                                    if (
                                        textBottom ||
                                        (baseline === null || baseline === void 0 ? void 0 : baseline.textElement) ===
                                            false
                                    ) {
                                        valid = constraintAlignTop(node, item);
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
                                            valid = constraintAlignTop(node, item);
                                        }
                                        break;
                                    }
                                case 'bottom':
                                    if (!bottom) {
                                        let j = 0;
                                        while (j < length) {
                                            const child = children[j++];
                                            if (
                                                !child.baseline &&
                                                (!bottom || child.linear.bottom > bottom.linear.bottom)
                                            ) {
                                                bottom = child;
                                            }
                                        }
                                    }
                                    if (item === bottom) {
                                        valid = constraintAlignTop(node, item);
                                    } else {
                                        item.anchor('bottom', 'parent');
                                    }
                                    break;
                                case 'baseline':
                                    if (
                                        !baseline ||
                                        item.blockVertical ||
                                        (!item.textElement && getMaxHeight(item) > getMaxHeight(baseline))
                                    ) {
                                        valid = constraintAlignTop(node, item);
                                    } else {
                                        item.anchor('baseline', documentId || 'parent');
                                        ++baselineCount;
                                    }
                                    break;
                                default:
                                    valid = constraintAlignTop(node, item);
                                    break;
                            }
                        } else if (item.plainText) {
                            item.anchor('baseline', documentId || 'parent');
                            ++baselineCount;
                        } else {
                            valid = constraintAlignTop(node, item);
                        }
                        item.anchored = true;
                    }
                    percentWidth = View.setConstraintDimension(item, percentWidth);
                    previous = item;
                } else if (item.autoPosition) {
                    if (documentId) {
                        item.anchor('top', documentId);
                    } else {
                        item.anchorParent('vertical', 0);
                        item.anchored = true;
                        valid = false;
                    }
                }
            }
            if (baseline) {
                if (tallest && baseline.textElement && getMaxHeight(tallest) > getMaxHeight(baseline)) {
                    switch (tallest.verticalAlign) {
                        case 'middle':
                            baseline.anchorParent('vertical', 0.5, '', true);
                            break;
                        case 'baseline':
                            baseline.anchor('baseline', tallest.documentId);
                            break;
                        case 'bottom':
                        case 'text-bottom':
                            baseline.anchor('bottom', tallest.documentId);
                            break;
                        default:
                            constraintAlignTop(node, baseline);
                            break;
                    }
                } else if (
                    valid &&
                    baseline.baselineElement &&
                    !baseline.imageOrSvgElement &&
                    node.ascend({
                        condition: item => item.layoutHorizontal,
                        error: item => (item.naturalChild && item.layoutVertical) || item.layoutGrid,
                        attr: 'renderParent',
                    }).length > 0
                ) {
                    baseline.anchorParent('vertical');
                    baseline.anchor('baseline', 'parent');
                } else {
                    constraintAlignTop(node, baseline);
                }
                baseline.baselineActive = baselineCount > 0;
                baseline.anchored = true;
            }
        }
        processConstraintChain(node, children) {
            const clearMap = this.application.clearMap;
            const floating = node.hasAlign(256 /* FLOAT */);
            const parent = children[0].actualParent || node;
            const horizontal = NodeUI.partitionRows(children, clearMap);
            let previousSiblings = [],
                previousRow,
                previousAlignParent = false;
            const length = horizontal.length;
            for (let i = 0; i < length; ++i) {
                const partition = horizontal[i];
                const [floatingRight, floatingLeft] = partitionArray(
                    partition,
                    item => item.float === 'right' || item.autoMargin.left === true
                );
                let alignParent = false,
                    aboveRowEnd,
                    currentRowTop,
                    tallest;
                const applyLayout = (seg, reverse) => {
                    const q = seg.length;
                    if (q === 0) {
                        return;
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
                                length === 1 && NodeUI.justified(rowStart.innerMostWrapped) ? 'spread_inside' : 'packed'
                            );
                        }
                        rowEnd.anchor(anchorEnd, 'parent');
                    } else if (!rowStart.constraint.horizontal) {
                        setHorizontalAlignment(rowStart);
                    }
                    let percentWidth = View.availablePercent(partition, 'width', node.box.width);
                    if (i === 1 || previousAlignParent) {
                        alignParent =
                            (!rowStart.floating &&
                                (previousRow === null || previousRow === void 0
                                    ? void 0
                                    : previousRow.every(item => item.floating || !item.pageFlow)) === true &&
                                (clearMap.size === 0 || !partition.some(item => checkClearMap(item, clearMap)))) ||
                            (!rowStart.pageFlow && (!rowStart.autoPosition || q === 1)) ||
                            (previousRow === null || previousRow === void 0
                                ? void 0
                                : previousRow.every(item => !item.pageFlow)) === true;
                        previousAlignParent = alignParent;
                    }
                    tallest = undefined;
                    for (let j = 0; j < q; ++j) {
                        const chain = seg[j];
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
                            const previous = seg[j - 1];
                            const next = seg[j + 1];
                            if (previous) {
                                if (!previous.pageFlow && previous.autoPosition) {
                                    let found;
                                    let k = j - 2;
                                    while (k >= 0) {
                                        found = seg[k--];
                                        if (found.pageFlow) {
                                            break;
                                        } else {
                                            found = undefined;
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
                        percentWidth = View.setConstraintDimension(chain, percentWidth);
                        if (previousRow && j === 0) {
                            if (clearMap.has(chain) && !chain.floating) {
                                chain.modifyBox(
                                    1 /* MARGIN_TOP */,
                                    -previousRow[previousRow.length - 1].bounds.height,
                                    false
                                );
                            }
                            if (floating) {
                                let checkBottom = false;
                                let k = 0;
                                while (k < previousSiblings.length) {
                                    if (chain.bounds.top < Math.floor(previousSiblings[k++].bounds.bottom)) {
                                        checkBottom = true;
                                        break;
                                    }
                                }
                                if (checkBottom) {
                                    aboveRowEnd = previousRow[previousRow.length - 1];
                                    k = previousSiblings.length - 2;
                                    while (k >= 0) {
                                        const aboveBefore = previousSiblings[k--];
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
                                            rowStart.delete(
                                                'app',
                                                'layout_constraintHorizontal_chainStyle',
                                                'layout_constraintHorizontal_bias'
                                            );
                                            rowStart.anchorDelete(chainEnd);
                                            rowEnd.anchorDelete(anchorEnd);
                                            if (!currentRowTop) {
                                                currentRowTop = chain;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if (!tallest || chain.linear.height > tallest.linear.height) {
                            tallest = chain;
                        }
                    }
                };
                applyLayout(floatingLeft, false);
                applyLayout(floatingRight, true);
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
                                let k = 1;
                                while (k < q) {
                                    const item = previousRow[k++];
                                    if (item.linear.bottom > aboveRowEnd.linear.bottom) {
                                        aboveRowEnd = item;
                                    }
                                }
                            }
                            if (!currentRowTop) {
                                currentRowTop = partition[0];
                                let currentTop = currentRowTop.linear.top;
                                let k = 1;
                                while (k < r) {
                                    const item = partition[k++];
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
                            let j = 0;
                            while (j < r) {
                                const chain = partition[j++];
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
            if (!node.hasWidth && children.some(item => item.percentWidth > 0)) {
                node.setLayoutWidth('match_parent', false);
            }
        }
        applyGuideline(node, parent, axis, options) {
            var _a, _b;
            if (node.constraint[axis]) {
                return;
            }
            let orientation, percent, opposing;
            if (options) {
                ({ orientation, percent, opposing } = options);
                if (orientation && axis !== orientation) {
                    return;
                }
            }
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
                if (node.autoPosition) {
                    const siblings = node.siblingsLeading;
                    const length = siblings.length;
                    if (length > 0 && !node.alignedVertically()) {
                        let i = length - 1;
                        while (i >= 0) {
                            const previous = siblings[i--];
                            if (previous.pageFlow) {
                                if (previous.renderParent === node.renderParent) {
                                    node.anchor(horizontal ? 'leftRight' : 'top', previous.documentId, true);
                                    node.constraint[axis] = true;
                                    return;
                                }
                                break;
                            }
                        }
                    }
                }
                if (!node.pageFlow && node.css('position') !== 'fixed' && !parent.hasAlign(2 /* AUTO_LAYOUT */)) {
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
                    const bounds = node.innerMostWrapped.bounds;
                    const renderChildren = parent.renderChildren;
                    const length = renderChildren.length;
                    let i = 0;
                    while (i < length) {
                        const item = renderChildren[i++];
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
                                    offset = bounds.top - boundsA.bottom;
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
                                node.anchor(position, item.documentId, true);
                                node.constraint[axis] = true;
                                return;
                            }
                        }
                    }
                    const TL = horizontal ? 'top' : 'left';
                    let nearest, adjacent;
                    i = 0;
                    while (i < length) {
                        const item = renderChildren[i++];
                        if (
                            item === node ||
                            item.pageFlow ||
                            item.rootElement ||
                            !item.constraint[axis] ||
                            !canAlignPosition(item)
                        ) {
                            continue;
                        }
                        const itemA = item.innerMostWrapped;
                        const boundsA = itemA.bounds;
                        if (withinRange(bounds[TL], boundsA[TL]) || withinRange(linear[TL], itemA.linear[TL])) {
                            const offset = bounds[LT] - boundsA[RB];
                            if (offset >= 0) {
                                setAnchorOffset(
                                    node,
                                    horizontal,
                                    axis,
                                    item.documentId,
                                    horizontal ? 'leftRight' : 'topBottom',
                                    offset
                                );
                                return;
                            }
                        } else if (boundsA[LT] <= bounds[LT]) {
                            if (boundsA[TL] <= bounds[TL]) {
                                nearest = itemA;
                            } else {
                                adjacent = itemA;
                            }
                        }
                    }
                    if (!nearest) {
                        nearest = adjacent;
                    }
                    if (nearest) {
                        const offset = bounds[LT] - nearest.bounds[LT] + adjustBodyMargin(node, LT);
                        if (offset >= 0) {
                            setAnchorOffset(node, horizontal, axis, nearest.documentId, LT, offset);
                            return;
                        }
                    }
                }
            }
            const absoluteParent = node.absoluteParent;
            const bounds = node.positionStatic ? node.bounds : linear;
            let attr = 'layout_constraintGuide_',
                location = 0;
            if (!node.leftTopAxis && documentParent.rootElement) {
                const renderParent = node.renderParent;
                if (
                    documentParent.ascend({ condition: item => item === renderParent, attr: 'renderParent' }).length > 0
                ) {
                    location = horizontal
                        ? !opposing
                            ? documentParent.marginLeft
                            : documentParent.marginRight
                        : !opposing
                        ? documentParent.marginTop
                        : documentParent.marginBottom;
                }
            }
            if (percent) {
                const position = Math.abs(bounds[LT] - box[LT]) / (horizontal ? box.width : box.height);
                attr += 'percent';
                location += parseFloat(
                    truncate$2(!opposing ? position : 1 - position, node.localSettings.floatPrecision)
                );
            } else {
                attr += 'begin';
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
                    location = adjustAbsolutePaddingOffset(documentParent, direction, location);
                }
            } else if (node.inlineVertical) {
                const offset = convertFloat$1(node.verticalAlign);
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
                        if (parseInt(anchors[id]) === location) {
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
                            : '@dimen/' +
                              Resource.insertStoredAsset(
                                  'dimens',
                                  `constraint_guideline_${!opposing ? LT : RB}`,
                                  formatPX$1(location)
                              ),
                    },
                };
                this.addAfterOutsideTemplate(
                    node.id,
                    this.renderNodeStatic(
                        {
                            controlName:
                                node.api < 29 /* Q */ ? CONTAINER_ANDROID.GUIDELINE : CONTAINER_ANDROID_X.GUIDELINE,
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
                node.localSettings = this._defaultViewSettings;
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

    const { fromLastIndexOf: fromLastIndexOf$2, parseMimeType: parseMimeType$1, plainMap } = squared.lib.util;
    const STORED$1 = Resource.STORED;
    function getFileAssets(pathname, items) {
        const length = items.length;
        if (length > 0) {
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
    function getImageAssets(pathname, items, convertExt, compress) {
        const length = items.length;
        if (length > 0) {
            convertExt = convertExt.toLowerCase();
            let mimeTypeTo = parseMimeType$1(convertExt);
            if (!mimeTypeTo.startsWith('image/')) {
                mimeTypeTo = '';
            }
            const result = new Array(length / 3);
            for (let i = 0, j = 0; i < length; i += 3) {
                const filename = items[i + 2];
                let mimeType;
                if (filename.endsWith('.unknown')) {
                    mimeType = (compress ? 'png@:' : '') + 'image/unknown';
                } else if (mimeTypeTo !== '') {
                    const mimeTypeFrom = parseMimeType$1(filename);
                    if (mimeTypeFrom !== mimeTypeTo && mimeTypeFrom.startsWith('image/')) {
                        mimeType = convertExt + (!/[@%]/.test(convertExt) ? '@' : '') + ':' + mimeTypeFrom;
                    }
                }
                result[j++] = {
                    pathname: pathname + items[i + 1],
                    filename,
                    mimeType,
                    compress:
                        compress && Resource.canCompressImage(filename, mimeTypeTo) ? [{ format: 'png' }] : undefined,
                    uri: items[i],
                };
            }
            return result;
        }
        return items;
    }
    function getRawAssets(pathname, items) {
        const length = items.length;
        if (length > 0) {
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
        value = value.trim().replace(/\\/g, '/');
        return value + (!value.endsWith('/') ? '/' : '');
    }
    class File extends squared.base.FileUI {
        copyToDisk(directory, options) {
            return this.copying(
                Object.assign(Object.assign({}, options), {
                    assets: this.combineAssets(options === null || options === void 0 ? void 0 : options.assets),
                    directory,
                })
            );
        }
        appendToArchive(pathname, options) {
            return this.archiving(
                Object.assign(Object.assign({ filename: this.userSettings.outputArchiveName }, options), {
                    assets: this.combineAssets(options === null || options === void 0 ? void 0 : options.assets),
                    appendTo: pathname,
                })
            );
        }
        saveToArchive(filename, options) {
            return this.archiving(
                Object.assign(Object.assign({}, options), {
                    assets: this.combineAssets(options === null || options === void 0 ? void 0 : options.assets),
                    filename,
                })
            );
        }
        resourceAllToXml(options = {}) {
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
            if (options.directory || options.filename) {
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
                options.assets = assets.concat(options.assets || []);
                if (options.directory) {
                    this.copying(options);
                }
                if (options.filename) {
                    this.archiving(options);
                }
            }
            return result;
        }
        resourceStringToXml(options = {}) {
            const item = { string: [] };
            const itemArray = item.string;
            if (!STORED$1.strings.has('app_name')) {
                itemArray.push({ name: 'app_name', innerText: this.userSettings.manifestLabelAppName });
            }
            for (const [name, innerText] of Array.from(STORED$1.strings.entries()).sort((a, b) =>
                a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1
            )) {
                itemArray.push({ name, innerText });
            }
            return this.checkFileAssets(
                [
                    replaceTab(applyTemplate('resources', STRING_TMPL, [item]), this.userSettings.insertSpaces, true),
                    this.directory.string,
                    'strings.xml',
                ],
                options
            );
        }
        resourceStringArrayToXml(options = {}) {
            if (STORED$1.arrays.size > 0) {
                const item = { 'string-array': [] };
                const itemArray = item['string-array'];
                for (const [name, values] of Array.from(STORED$1.arrays.entries()).sort()) {
                    itemArray.push({
                        name,
                        item: plainMap(values, innerText => ({ innerText })),
                    });
                }
                return this.checkFileAssets(
                    [
                        replaceTab(
                            applyTemplate('resources', STRINGARRAY_TMPL, [item]),
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
        resourceFontToXml(options = {}) {
            var _a;
            if (STORED$1.fonts.size > 0) {
                const resource = this.resource;
                const { insertSpaces, targetAPI } = this.userSettings;
                const xmlns = targetAPI < 26 /* OREO */ ? XMLNS_ANDROID.app : XMLNS_ANDROID.android;
                const outputDirectory = getOutputDirectory(this.userSettings.outputDirectory);
                const pathname = this.directory.font;
                const result = [];
                for (const [name, font] of Array.from(STORED$1.fonts.entries()).sort()) {
                    const item = { 'xmlns:android': xmlns, font: [] };
                    const itemArray = item.font;
                    for (const attr in font) {
                        const [fontFamily, fontStyle, fontWeight] = attr.split('|');
                        let fontName = name;
                        if (fontStyle === 'normal') {
                            fontName += fontWeight === '400' ? '_normal' : '_' + font[attr];
                        } else {
                            fontName += '_' + fontStyle + (fontWeight !== '400' ? font[attr] : '');
                        }
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
                                pathname: outputDirectory + pathname,
                                filename:
                                    fontName + '.' + (Resource.getExtension(uri.split('?')[0]).toLowerCase() || 'ttf'),
                                uri,
                            });
                        }
                    }
                    let output = replaceTab(applyTemplate('font-family', FONTFAMILY_TMPL, [item]), insertSpaces);
                    if (targetAPI < 26 /* OREO */) {
                        output = output.replace(/\s+android:/g, ' app:');
                    }
                    result.push(output, pathname, `${name}.xml`);
                }
                return this.checkFileAssets(result, options);
            }
            return [];
        }
        resourceColorToXml(options = {}) {
            if (STORED$1.colors.size > 0) {
                const item = { color: [] };
                const itemArray = item.color;
                for (const [innerText, name] of Array.from(STORED$1.colors.entries()).sort()) {
                    itemArray.push({ name, innerText });
                }
                return this.checkFileAssets(
                    [
                        replaceTab(applyTemplate('resources', COLOR_TMPL, [item]), this.userSettings.insertSpaces),
                        this.directory.string,
                        'colors.xml',
                    ],
                    options
                );
            }
            return [];
        }
        resourceStyleToXml(options = {}) {
            const result = [];
            if (STORED$1.styles.size > 0) {
                const item = { style: [] };
                const itemArray = item.style;
                for (const style of Array.from(STORED$1.styles.values()).sort((a, b) =>
                    a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1
                )) {
                    const styleArray = style.items;
                    if (Array.isArray(styleArray)) {
                        itemArray.push({
                            name: style.name,
                            parent: style.parent,
                            item: plainMap(
                                styleArray.sort((a, b) => (a.key >= b.key ? 1 : -1)),
                                obj => ({ name: obj.key, innerText: obj.value })
                            ),
                        });
                    }
                }
                result.push(
                    replaceTab(applyTemplate('resources', STYLE_TMPL, [item]), this.userSettings.insertSpaces),
                    this.directory.string,
                    'styles.xml'
                );
            }
            if (STORED$1.themes.size > 0) {
                const { convertPixels, insertSpaces, manifestThemeName } = this.userSettings;
                const appTheme = {};
                for (const [filename, theme] of STORED$1.themes.entries()) {
                    const match = /^(.+)\/(.+?\.\w+)$/.exec(filename);
                    if (match) {
                        const item = { style: [] };
                        const itemArray = item.style;
                        for (const [themeName, themeData] of theme.entries()) {
                            const themeArray = [];
                            const items = themeData.items;
                            for (const name in items) {
                                themeArray.push({ name, innerText: items[name] });
                            }
                            if (!appTheme[filename] || themeName !== manifestThemeName || item.length) {
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
                        const value = applyTemplate('resources', STYLE_TMPL, [item]);
                        result.push(
                            replaceTab(
                                convertPixels === 'dp'
                                    ? value.replace(
                                          />(-?[\d.]+)px</g,
                                          (found, ...capture) => '>' + convertLength(capture[0], false) + '<'
                                      )
                                    : value,
                                insertSpaces
                            ),
                            match[1],
                            match[2]
                        );
                    }
                }
            }
            return this.checkFileAssets(result, options);
        }
        resourceDimenToXml(options = {}) {
            if (STORED$1.dimens.size > 0) {
                const convertPixels = this.userSettings.convertPixels;
                const item = { dimen: [] };
                const itemArray = item.dimen;
                for (const [name, value] of Array.from(STORED$1.dimens.entries()).sort()) {
                    itemArray.push({ name, innerText: convertPixels ? convertLength(value, false) : value });
                }
                return this.checkFileAssets(
                    [replaceTab(applyTemplate('resources', DIMEN_TMPL, [item])), this.directory.string, 'dimens.xml'],
                    options
                );
            }
            return [];
        }
        resourceDrawableToXml(options = {}) {
            if (STORED$1.drawables.size > 0) {
                const { convertPixels, insertSpaces } = this.userSettings;
                const directory = this.directory.image;
                const result = [];
                for (const [name, value] of STORED$1.drawables.entries()) {
                    result.push(
                        replaceTab(
                            convertPixels === 'dp'
                                ? value.replace(
                                      /"(-?[\d.]+)px"/g,
                                      (match, ...capture) => '"' + convertLength(capture[0], false) + '"'
                                  )
                                : value,
                            insertSpaces
                        ),
                        directory,
                        `${name}.xml`
                    );
                }
                return this.checkFileAssets(result, options);
            }
            return [];
        }
        resourceAnimToXml(options = {}) {
            if (STORED$1.animators.size > 0) {
                const insertSpaces = this.userSettings.insertSpaces;
                const result = [];
                for (const [name, value] of STORED$1.animators.entries()) {
                    result.push(replaceTab(value, insertSpaces), 'res/anim', `${name}.xml`);
                }
                return this.checkFileAssets(result, options);
            }
            return [];
        }
        resourceDrawableImageToString(options = {}) {
            if (STORED$1.images.size > 0) {
                const imageDirectory = this.directory.image;
                const result = [];
                for (const [name, images] of STORED$1.images.entries()) {
                    if (Object.keys(images).length > 1) {
                        for (const dpi in images) {
                            const value = images[dpi];
                            result.push(
                                value,
                                imageDirectory + '-' + dpi,
                                name + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown')
                            );
                        }
                    } else {
                        const value = images.mdpi;
                        if (value) {
                            result.push(
                                value,
                                imageDirectory,
                                name + '.' + (Resource.getExtension(value).toLowerCase() || 'unknown')
                            );
                        }
                    }
                }
                if (options.directory || options.filename) {
                    options.assets = getImageAssets(
                        getOutputDirectory(this.userSettings.outputDirectory),
                        result,
                        this.userSettings.convertImages,
                        this.userSettings.compressImages
                    ).concat(options.assets || []);
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
        resourceRawVideoToString(options = {}) {
            if (Resource.ASSETS.video.size > 0) {
                const result = [];
                for (const video of Resource.ASSETS.video.values()) {
                    const uri = video.uri;
                    result.push(uri, video.mimeType || '', fromLastIndexOf$2(uri, '/', '\\'));
                }
                if (options.directory || options.filename) {
                    options.assets = getRawAssets(
                        getOutputDirectory(this.userSettings.outputDirectory) + this.directory.video,
                        result
                    ).concat(options.assets || []);
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
        resourceRawAudioToString(options = {}) {
            if (Resource.ASSETS.video.size > 0) {
                const result = [];
                for (const video of Resource.ASSETS.audio.values()) {
                    const uri = video.uri;
                    result.push(uri, video.mimeType || '', fromLastIndexOf$2(uri, '/', '\\'));
                }
                if (options.directory || options.filename) {
                    options.assets = getRawAssets(
                        getOutputDirectory(this.userSettings.outputDirectory) + this.directory.audio,
                        result
                    ).concat(options.assets || []);
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
        layoutAllToXml(layouts, options = {}) {
            const actionable = options.directory || options.filename;
            const result = {};
            const assets = [];
            for (let i = 0; i < layouts.length; ++i) {
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
                const length = assets.length;
                let first = true;
                let i = 0;
                while (i < length) {
                    const item = assets[i++];
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
            if (options.directory || options.filename) {
                options.assets = getFileAssets(getOutputDirectory(this.userSettings.outputDirectory), content).concat(
                    options.assets || []
                );
                if (options.directory) {
                    this.copying(options);
                }
                if (options.filename) {
                    this.archiving(options);
                }
            }
            return content;
        }
        get userSettings() {
            return this.resource.userSettings;
        }
    }

    const { formatPX: formatPX$2 } = squared.lib.css;
    const { NODE_PROCEDURE: NODE_PROCEDURE$2, NODE_RESOURCE: NODE_RESOURCE$1 } = squared.base.lib.enumeration;
    class Accessibility extends squared.base.extensions.Accessibility {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
            this.options = {
                displayLabel: false,
            };
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
                                        (sibling === null || sibling === void 0 ? void 0 : sibling.pageFlow) &&
                                        !sibling.visibleStyle.backgroundImage &&
                                        sibling.visible
                                    ) {
                                        let valid = false;
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
                                node.data(Resource.KEY_NAME, 'embedded', [node]);
                            }
                            break;
                        case 'BUTTON':
                            if (node.length > 0) {
                                let { width, height } = node.bounds;
                                let modified = false;
                                node.cascade(item => {
                                    if (item.width >= width && item.height >= height) {
                                        ({ width, height } = item);
                                        if (!node.visibleStyle.background) {
                                            node.inherit(item, 'boxStyle');
                                        }
                                        modified = true;
                                    }
                                });
                                if (modified) {
                                    node.css('minWidth', formatPX$2(width));
                                    node.css('minHeight', formatPX$2(height));
                                }
                                const embedded = node.extract(item => !item.textElement);
                                if (embedded.length > 0 && node.hasResource(NODE_RESOURCE$1.IMAGE_SOURCE)) {
                                    node.data(Resource.KEY_NAME, 'embedded', embedded);
                                }
                                node.clear();
                            }
                            break;
                    }
                }
            });
        }
    }

    const { formatPX: formatPX$3 } = squared.lib.css;
    const { createElement: createElement$1 } = squared.lib.dom;
    const { truncate: truncate$3 } = squared.lib.math;
    const { safeNestedArray: safeNestedArray$2 } = squared.lib.util;
    const {
        APP_SECTION: APP_SECTION$1,
        BOX_STANDARD: BOX_STANDARD$3,
        NODE_ALIGNMENT: NODE_ALIGNMENT$2,
        NODE_PROCEDURE: NODE_PROCEDURE$3,
        NODE_RESOURCE: NODE_RESOURCE$2,
        NODE_TEMPLATE: NODE_TEMPLATE$1,
    } = squared.base.lib.enumeration;
    class Column extends squared.base.extensions.Column {
        processNode(node, parent) {
            super.processNode(node, parent);
            node.containerType = CONTAINER_NODE.CONSTRAINT;
            node.addAlign(2 /* AUTO_LAYOUT */);
            return {
                complete: true,
                subscribe: true,
            };
        }
        postBaseLayout(node) {
            const mainData = node.data(this.name, 'mainData');
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
                const dividerWidth = node.parseUnit(borderLeftWidth);
                const displayBorder = borderLeftStyle !== 'none' && dividerWidth > 0;
                const createColumnRule = () => {
                    const divider = application.createNode(node.sessionId, { parent: node, append: true });
                    divider.inherit(node, 'base');
                    divider.containerName = node.containerName + '_COLUMNRULE';
                    divider.setControlType(CONTAINER_ANDROID.LINE, CONTAINER_NODE.LINE);
                    divider.exclude({ resource: NODE_RESOURCE$2.ASSET, procedure: NODE_PROCEDURE$3.ALL });
                    let width;
                    if (displayBorder) {
                        width = formatPX$3(dividerWidth);
                        divider.cssApply({
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
                        divider.cssApply({ width, lineHeight: 'initial', display: 'inline-block' });
                    }
                    divider.saveAsInitial();
                    divider.setLayoutWidth(width);
                    divider.setLayoutHeight('0px');
                    divider.render(node);
                    divider.positioned = true;
                    divider.renderExclude = false;
                    application.addLayoutTemplate(node, divider, {
                        type: 1 /* XML */,
                        node: divider,
                        controlName: divider.controlName,
                    });
                    return divider;
                };
                let previousRow;
                const length = rows.length;
                for (let i = 0; i < length; ++i) {
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
                        item.anchorParent('horizontal', item.rightAligned ? 1 : item.centerAligned ? 0.5 : 0);
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
                                        (j > 0 &&
                                            (row[j - 1].bounds.height >= maxHeight ||
                                                (columns[k].length > 0 &&
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
                                const column = safeNestedArray$2(columns, k);
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
                        let j;
                        for (j = 0; j < r; ++j) {
                            const data = columns[j];
                            for (let k = 0; k < data.length; ++k) {
                                const item = data[k];
                                item.app(
                                    'layout_constraintWidth_percent',
                                    truncate$3(1 / columnMin - percentGap, node.localSettings.floatPrecision)
                                );
                                item.setLayoutWidth('0px');
                                item.setBox(2 /* MARGIN_RIGHT */, { reset: 1 });
                                item.exclude({ section: APP_SECTION$1.EXTENSION });
                                item.anchored = true;
                                item.positioned = true;
                            }
                            above[j] = data[0];
                        }
                        for (j = 0; j < r; ++j) {
                            const item = columns[j];
                            if (j < r - 1 && item.length > 1) {
                                const columnEnd = item[item.length - 1];
                                if (/^H\d/.test(columnEnd.tagName)) {
                                    item.pop();
                                    const k = j + 1;
                                    above[k] = columnEnd;
                                    columns[k].unshift(columnEnd);
                                }
                            }
                        }
                        const columnHeight = new Array(r);
                        for (j = 0; j < r; ++j) {
                            const seg = columns[j];
                            const elements = [];
                            let height = 0;
                            let s = seg.length;
                            let k = 0;
                            while (k < s) {
                                const column = seg[k++];
                                if (column.naturalChild) {
                                    const element = column.element.cloneNode(true);
                                    if (column.styleElement) {
                                        if (
                                            column.imageOrSvgElement ||
                                            column.some(item => item.imageOrSvgElement, { cascade: true })
                                        ) {
                                            element.style.height = formatPX$3(column.bounds.height);
                                        } else {
                                            const textStyle = column.textStyle;
                                            for (const attr in textStyle) {
                                                element.style[attr] = textStyle[attr];
                                            }
                                        }
                                    }
                                    elements.push(element);
                                } else {
                                    height += column.linear.height;
                                }
                            }
                            s = elements.length;
                            if (s > 0) {
                                const container = createElement$1('div', {
                                    parent: document.body,
                                    style: {
                                        width: formatPX$3(columnWidth || node.box.width / columnMin),
                                        visibility: 'hidden',
                                    },
                                });
                                k = 0;
                                while (k < s) {
                                    container.appendChild(elements[k++]);
                                }
                                height += container.getBoundingClientRect().height;
                                document.body.removeChild(container);
                            }
                            columnHeight[j] = height;
                        }
                        let anchorTop,
                            anchorBottom,
                            maxHeight = 0;
                        for (j = 0; j < r; ++j) {
                            const value = columnHeight[j];
                            if (value >= maxHeight) {
                                const column = columns[j];
                                anchorTop = column[0];
                                anchorBottom = column[column.length - 1];
                                maxHeight = value;
                            }
                        }
                        for (j = 0; j < r; ++j) {
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
                        const dividers = [];
                        for (j = 0; j < r; ++j) {
                            const seg = columns[j];
                            const s = seg.length;
                            for (let k = 0; k < s; ++k) {
                                const item = seg[k];
                                if (k === 0) {
                                    if (j > 0) {
                                        const divider = createColumnRule();
                                        divider.anchor('top', anchorTop.documentId);
                                        divider.anchor('left', columns[j - 1][0].documentId);
                                        divider.anchor('right', item.documentId);
                                        dividers.push(divider);
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
                        j = 0;
                        while (j < dividers.length) {
                            dividers[j++].anchor('bottom', documentId);
                        }
                        previousRow = anchorBottom;
                    }
                }
            }
        }
    }

    var LayoutUI = squared.base.LayoutUI;
    const { formatPercent, formatPX: formatPX$4, isLength: isLength$2, isPercent: isPercent$2, isPx } = squared.lib.css;
    const { maxArray, truncate: truncate$4 } = squared.lib.math;
    const { conditionArray, flatArray, isArray } = squared.lib.util;
    const {
        BOX_STANDARD: BOX_STANDARD$4,
        NODE_ALIGNMENT: NODE_ALIGNMENT$3,
        NODE_PROCEDURE: NODE_PROCEDURE$4,
        NODE_RESOURCE: NODE_RESOURCE$3,
    } = squared.base.lib.enumeration;
    function getRowData(mainData, horizontal) {
        const rowData = mainData.rowData;
        if (horizontal) {
            const length = mainData.column.length;
            const q = mainData.row.length;
            const result = new Array(length);
            let i = 0,
                j;
            while (i < length) {
                const data = new Array(q);
                j = 0;
                while (j < q) {
                    data[j] = rowData[j++][i];
                }
                result[i++] = data;
            }
            return result;
        }
        return rowData;
    }
    function getGridSize(node, mainData, horizontal, maxScreenWidth, maxScreenHeight) {
        const data = horizontal ? mainData.column : mainData.row;
        const unit = data.unit;
        const length = unit.length;
        let value = 0;
        if (length > 0) {
            const dimension = horizontal ? 'width' : 'height';
            for (let i = 0; i < length; ++i) {
                const unitPX = unit[i];
                if (isPx(unitPX)) {
                    value += parseFloat(unitPX);
                } else {
                    let size = 0;
                    conditionArray(
                        mainData.rowData[i],
                        item => isArray(item),
                        item => (size = Math.min(size, ...item.map(child => child.bounds[dimension])))
                    );
                    value += size;
                }
            }
        } else {
            value = maxArray(data.unitTotal);
            if (value <= 0) {
                return 0;
            }
        }
        value += data.gap * (data.length - 1);
        if (horizontal) {
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
    function setContentSpacing(
        node,
        mainData,
        alignment,
        horizontal,
        dimension,
        wrapped,
        MARGIN_START,
        MARGIN_END,
        maxScreenWidth,
        maxScreenHeight
    ) {
        const data = horizontal ? mainData.column : mainData.row;
        if (alignment.startsWith('space')) {
            const gridSize = getGridSize(node, mainData, horizontal, maxScreenWidth, maxScreenHeight);
            if (gridSize > 0) {
                const rowData = getRowData(mainData, horizontal);
                const itemCount = data.length;
                const adjusted = new Set();
                switch (alignment) {
                    case 'space-around': {
                        const [marginSize, marginExcess] = getMarginSize(itemCount * 2, gridSize);
                        for (let i = 0; i < itemCount; ++i) {
                            for (const item of new Set(flatArray(rowData[i], Infinity))) {
                                const marginStart = (i > 0 && i <= marginExcess ? 1 : 0) + marginSize;
                                if (!adjusted.has(item)) {
                                    item.modifyBox(MARGIN_START, marginStart);
                                    item.modifyBox(MARGIN_END, marginSize);
                                    adjusted.add(item);
                                } else {
                                    item.cssPX(dimension, gridSize / itemCount, true);
                                }
                            }
                        }
                        break;
                    }
                    case 'space-between':
                        if (itemCount > 1) {
                            const [marginSize, marginExcess] = getMarginSize(itemCount - 1, gridSize);
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
                                                item.modifyBox(MARGIN_END, -marginEnd, false);
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
                        const [marginSize, marginExcess] = getMarginSize(itemCount + 1, gridSize);
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
        } else if (!wrapped) {
            let gridSize = getGridSize(node, mainData, horizontal, maxScreenWidth, maxScreenHeight);
            if (gridSize > 0) {
                switch (alignment) {
                    case 'center':
                        gridSize /= 2;
                        if (horizontal) {
                            node.modifyBox(128 /* PADDING_LEFT */, Math.floor(gridSize));
                        } else {
                            node.modifyBox(16 /* PADDING_TOP */, Math.floor(gridSize));
                            node.modifyBox(64 /* PADDING_BOTTOM */, Math.ceil(gridSize));
                        }
                        break;
                    case 'right':
                        if (!horizontal) {
                            break;
                        }
                    case 'end':
                    case 'flex-end':
                        node.modifyBox(horizontal ? 128 /* PADDING_LEFT */ : 16 /* PADDING_TOP */, gridSize);
                        break;
                }
            }
        }
    }
    function getCellDimensions(node, horizontal, section, insideGap) {
        let width, height, columnWeight, rowWeight;
        if (section.every(value => isPx(value))) {
            const px = section.reduce((a, b) => a + parseFloat(b), insideGap);
            const dimension = formatPX$4(px);
            if (horizontal) {
                width = dimension;
            } else {
                height = dimension;
            }
        } else if (section.every(value => CssGrid.isFr(value))) {
            const fr = section.reduce((a, b) => a + parseFloat(b), 0);
            const weight = truncate$4(fr, node.localSettings.floatPrecision);
            if (horizontal) {
                width = '0px';
                columnWeight = weight;
            } else {
                height = '0px';
                rowWeight = weight;
            }
        } else if (section.every(value => isPercent$2(value))) {
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
    function checkRowSpan(node, rowSpan, rowStart, mainData, dataName) {
        if (rowSpan === 1 && mainData.rowSpanMultiple[rowStart]) {
            const rowData = mainData.rowData;
            for (const item of flatArray(rowData[rowStart], Infinity)) {
                if (item !== node) {
                    const data = item.data(dataName, 'cellData');
                    if (data && data.rowSpan > rowSpan && (rowStart === 0 || data.rowSpan < rowData.length)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function checkAutoDimension(data, horizontal) {
        const unit = data.unit;
        if (unit.length > 0 && unit.every(value => value === 'auto')) {
            data.unit = new Array(length).fill(horizontal ? '1fr' : '');
        }
    }
    function isFlexibleParent(node, dataName) {
        const parent = node.actualParent;
        if (parent === null || parent === void 0 ? void 0 : parent.gridElement) {
            const mainData = parent.data(dataName, 'mainData');
            const cellData = node.data(dataName, 'cellData');
            if (mainData && cellData) {
                const unit = mainData.column.unit;
                const { columnStart, columnSpan } = cellData;
                let valid = false;
                let i = 0;
                while (i < columnSpan) {
                    const value = unit[columnStart + i++];
                    if (CssGrid.isFr(value) || isPercent$2(value)) {
                        valid = true;
                    } else if (value === 'auto') {
                        valid = false;
                        break;
                    }
                }
                return valid;
            }
        } else if (node.hasFlex('row') && node.flexbox.grow > 0) {
            return true;
        }
        return false;
    }
    function requireDirectionSpacer(data, dimension) {
        const unit = data.unit;
        let size = 0,
            percent = 0;
        let i = 0;
        while (i < unit.length) {
            const value = unit[i++];
            if (isPx(value)) {
                size += parseFloat(value);
            } else if (isPercent$2(value)) {
                percent += parseFloat(value);
            } else if (CssGrid.isFr(value)) {
                return 0;
            }
        }
        const content = Math.ceil(size + (data.length - 1) * data.gap);
        if (percent > 0) {
            return percent + (content / dimension) * 100;
        } else if (size > 0) {
            return content < dimension ? -1 : 0;
        }
        return 0;
    }
    const getLayoutDimension = value => (value === 'space-between' ? 'match_parent' : 'wrap_content');
    const hasAlignment = value => /start|end|center|baseline/.test(value);
    class CssGrid extends squared.base.extensions.CssGrid {
        processNode(node, parent) {
            let container, renderAs, outputAs;
            if (CssGrid.isJustified(node) || CssGrid.isAligned(node)) {
                container = this.controller.createNodeWrapper(node, parent, {
                    containerType: CONTAINER_NODE.CONSTRAINT,
                    resource: NODE_RESOURCE$3.ASSET,
                });
                container.inherit(node, 'styleMap', 'boxStyle');
                node.resetBox(15 /* MARGIN */, container);
                node.resetBox(240 /* PADDING */, container);
                node.data(this.name, 'unsetContentBox', true);
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
                    new LayoutUI(parent, container, CONTAINER_NODE.CONSTRAINT, 2048 /* SINGLE */, container.children)
                );
            }
            super.processNode(node, parent);
            const mainData = node.data(this.name, 'mainData');
            if (mainData) {
                const { column, row } = mainData;
                const unit = column.unit;
                const columnCount = column.length;
                const layout = LayoutUI.create({
                    parent: container || parent,
                    node,
                    containerType: CONTAINER_NODE.GRID,
                    alignmentType: 2 /* AUTO_LAYOUT */,
                    children: node.children,
                    rowCount: row.length,
                    columnCount,
                });
                if (
                    !node.rootElement &&
                    !node.hasWidth &&
                    mainData.rowSpanMultiple.length === 0 &&
                    unit.length === columnCount &&
                    unit.every(value => CssGrid.isFr(value)) &&
                    node.ascend({ condition: item => isFlexibleParent(item, this.name), error: item => item.hasWidth })
                        .length > 0
                ) {
                    const rowData = mainData.rowData;
                    const rowCount = rowData.length;
                    const constraintData = new Array(rowCount);
                    let valid = true;
                    invalid: {
                        let i = 0,
                            j;
                        while (i < rowCount) {
                            const nodes = [];
                            const data = rowData[i];
                            j = 0;
                            while (j < data.length) {
                                const cell = data[j++];
                                if ((cell === null || cell === void 0 ? void 0 : cell.length) === 1) {
                                    nodes.push(cell[0]);
                                } else {
                                    valid = false;
                                    break invalid;
                                }
                            }
                            constraintData[i++] = nodes;
                        }
                    }
                    if (valid) {
                        column.frTotal = unit.reduce((a, b) => a + parseFloat(b), 0);
                        row.frTotal = row.unit.reduce((a, b) => a + (CssGrid.isFr(b) ? parseFloat(b) : 0), 0);
                        node.setLayoutWidth('match_parent');
                        node.lockAttr('android', 'layout_width');
                        node.data(this.name, 'constraintData', constraintData);
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
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
            return undefined;
        }
        processChild(node, parent) {
            var _a;
            const mainData = parent.data(this.name, 'mainData');
            const cellData = node.data(this.name, 'cellData');
            let renderAs, outputAs;
            if (mainData && cellData) {
                const { column, row } = mainData;
                const alignSelf = node.has('alignSelf') ? node.css('alignSelf') : mainData.alignItems;
                const justifySelf = node.has('justifySelf') ? node.css('justifySelf') : mainData.justifyItems;
                const layoutConstraint = parent.layoutConstraint;
                const applyLayout = (item, horizontal, dimension) => {
                    const [data, cellStart, cellSpan, minDimension] = horizontal
                        ? [column, cellData.columnStart, cellData.columnSpan, 'minWidth']
                        : [row, cellData.rowStart, cellData.rowSpan, 'minHeight'];
                    const { unit, unitMin } = data;
                    let size = 0,
                        minSize = 0,
                        minUnitSize = 0,
                        sizeWeight = 0,
                        fitContent = false,
                        autoSize = false;
                    let i = 0,
                        j = 0;
                    while (i < cellSpan) {
                        const k = cellStart + i++;
                        const min = unitMin[k];
                        if (min !== '') {
                            minUnitSize += horizontal
                                ? parent.parseUnit(min)
                                : parent.parseUnit(min, { dimension: 'height' });
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
                                (!parent.hasPX(dimension) || unit.some(px => isLength$2(px)) || value === 'max-content')
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
                        } else if (CssGrid.isFr(value)) {
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
                        } else if (isPercent$2(value)) {
                            if (sizeWeight === -1) {
                                sizeWeight = 0;
                            }
                            sizeWeight += parseFloat(value) / 100;
                            minSize = size;
                            size = 0;
                        } else {
                            const cellSize = horizontal
                                ? item.parseUnit(value)
                                : item.parseUnit(value, { dimension: 'height' });
                            if (minSize === 0) {
                                size += cellSize;
                            } else {
                                minSize += cellSize;
                            }
                        }
                        if (node.textElement && /^\s*0[a-z]*\s*$/.test(min)) {
                            fitContent = true;
                        }
                    }
                    if (cellSpan > 1) {
                        const value = (cellSpan - 1) * data.gap;
                        if (size > 0 && minSize === 0) {
                            size += value;
                        } else if (minSize > 0) {
                            minSize += value;
                        }
                        if (minUnitSize > 0) {
                            minUnitSize += value;
                        }
                    }
                    if (minUnitSize > 0) {
                        if (data.autoFill && size === 0 && (horizontal ? row.length : column.length) === 1) {
                            size = Math.max(node.actualWidth, minUnitSize);
                            sizeWeight = 0;
                        } else {
                            minSize = minUnitSize;
                        }
                    }
                    if (minSize > 0 && !item.hasPX(minDimension)) {
                        item.css(minDimension, formatPX$4(minSize), true);
                    }
                    if (layoutConstraint) {
                        if (horizontal) {
                            if (!item.hasPX('width', { percent: false })) {
                                item.app(
                                    'layout_constraintWidth_percent',
                                    truncate$4(sizeWeight / column.frTotal, item.localSettings.floatPrecision)
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
                            if (sizeWeight > 0) {
                                if (row.length === 1) {
                                    item.setLayoutHeight('match_parent');
                                } else {
                                    item.app(
                                        'layout_constraintHeight_percent',
                                        truncate$4(sizeWeight / row.frTotal, item.localSettings.floatPrecision)
                                    );
                                    item.setLayoutHeight('0px');
                                }
                            } else if (size > 0) {
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
                                            sizeWeight === -1
                                                ? '0.01'
                                                : truncate$4(sizeWeight, node.localSettings.floatPrecision)
                                        );
                                        item.mergeGravity('layout_gravity', 'fill_horizontal');
                                    }
                                    columnWeight = false;
                                } else if (cellData.rowSpan === row.length) {
                                    item.setLayoutHeight('match_parent');
                                } else {
                                    item.setLayoutHeight('0px');
                                    item.android(
                                        'layout_rowWeight',
                                        truncate$4(sizeWeight, node.localSettings.floatPrecision)
                                    );
                                    item.mergeGravity('layout_gravity', 'fill_vertical');
                                }
                            }
                        } else if (size > 0) {
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
                };
                if (
                    hasAlignment(alignSelf) ||
                    /start|center|end|baseline|right|left/.test(justifySelf) ||
                    layoutConstraint
                ) {
                    renderAs = this.application.createNode(node.sessionId, { parent, innerWrap: node });
                    renderAs.containerName = node.containerName;
                    renderAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
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
                        new LayoutUI(parent, renderAs, CONTAINER_NODE.FRAME, 2048 /* SINGLE */, renderAs.children)
                    );
                } else {
                    node.mergeGravity('layout_gravity', 'top');
                }
                const target = renderAs || node;
                applyLayout(target, true, 'width');
                if (target !== node || node.hasPX('maxHeight')) {
                    target.mergeGravity('layout_gravity', 'fill');
                } else if (!target.hasPX('width')) {
                    target.mergeGravity('layout_gravity', 'fill_horizontal');
                }
                const [rowStart, rowSpan] = applyLayout(target, false, 'height');
                if (
                    mainData.alignContent === 'normal' &&
                    !parent.hasPX('height') &&
                    !node.hasPX('minHeight') &&
                    (!row.unit[rowStart] || row.unit[rowStart] === 'auto') &&
                    Math.floor(node.bounds.height) >
                        (((_a = node.data(this.name, 'boundsData')) === null || _a === void 0 ? void 0 : _a.height) ||
                            Infinity) &&
                    checkRowSpan(node, rowSpan, rowStart, mainData, this.name)
                ) {
                    target.css('minHeight', formatPX$4(node.box.height));
                } else if (
                    !target.hasPX('height') &&
                    !target.hasPX('maxHeight') &&
                    !(
                        row.length === 1 &&
                        mainData.alignContent.startsWith('space') &&
                        !hasAlignment(mainData.alignItems)
                    )
                ) {
                    target.mergeGravity('layout_gravity', 'fill_vertical');
                }
            }
            return {
                parent: renderAs,
                renderAs,
                outputAs,
            };
        }
        postBaseLayout(node) {
            const mainData = node.data(this.name, 'mainData');
            if (mainData) {
                const controller = this.controller;
                const { children, column, row, rowData } = mainData;
                const wrapped = node.data(this.name, 'unsetContentBox') === true;
                const insertId = children[children.length - 1].id;
                if (CssGrid.isJustified(node)) {
                    setContentSpacing(
                        node,
                        mainData,
                        mainData.justifyContent,
                        true,
                        'width',
                        wrapped,
                        8 /* MARGIN_LEFT */,
                        2 /* MARGIN_RIGHT */,
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
                        if (column.unit.some(value => CssGrid.isFr(value))) {
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
                                    insertId,
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
                        if (node.contentBoxWidth > 0 && node.hasPX('width', { percent: false })) {
                            node.anchorParent('horizontal', 0.5, '', true);
                        } else if (length === 1) {
                            node.setLayoutWidth('match_parent');
                        } else {
                            node.setLayoutWidth('wrap_content', false);
                        }
                    }
                }
                if (CssGrid.isAligned(node)) {
                    setContentSpacing(
                        node,
                        mainData,
                        mainData.alignContent,
                        false,
                        'height',
                        wrapped,
                        1 /* MARGIN_TOP */,
                        4 /* MARGIN_BOTTOM */,
                        0,
                        this.controller.userSettings.resolutionScreenHeight
                    );
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
                                    insertId,
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
                        if (node.contentBoxHeight > 0 && node.hasPX('height', { percent: false })) {
                            node.anchorParent('vertical', 0.5, '', true);
                        } else {
                            node.setLayoutHeight('wrap_content', false);
                        }
                    }
                }
                const constraintData = node.data(this.name, 'constraintData');
                if (constraintData) {
                    const { gap, length } = column;
                    const rowCount = constraintData.length;
                    const barrierIds = new Array(rowCount - 1);
                    let i = 1,
                        j = 0;
                    while (i < rowCount) {
                        barrierIds[j++] = controller.addBarrier(constraintData[i++], 'top');
                    }
                    for (i = 0; i < rowCount; ++i) {
                        const nodes = constraintData[i];
                        const previousBarrierId = barrierIds[i - 1];
                        const barrierId = barrierIds[i];
                        let previousItem;
                        for (j = 0; j < length; ++j) {
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
                                    item.modifyBox(2 /* MARGIN_RIGHT */, -gap);
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
                                controller.addAfterInsideTemplate(node.id, controller.renderSpace(options), false);
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
                                insertId,
                                controller.renderSpace({
                                    width,
                                    height,
                                    rowSpan,
                                    columnSpan,
                                    android: {
                                        [horizontal ? node.localizeString(STRING_ANDROID.MARGIN_RIGHT) : 'bottom']:
                                            gapSize > 0 && k + l < unitData.length
                                                ? '@dimen/' +
                                                  Resource.insertStoredAsset(
                                                      'dimens',
                                                      `${node.controlId}_cssgrid_${horizontal ? 'column' : 'row'}_gap`,
                                                      formatPX$4(gapSize)
                                                  )
                                                : '',
                                        [horizontal ? 'bottom' : node.localizeString(STRING_ANDROID.MARGIN_RIGHT)]:
                                            opposingMargin > 0
                                                ? '@dimen/' +
                                                  Resource.insertStoredAsset(
                                                      'dimens',
                                                      `${node.controlId}_cssgrid_${horizontal ? 'row' : 'column'}_gap`,
                                                      formatPX$4(opposingMargin)
                                                  )
                                                : '',
                                        layout_row,
                                        layout_column,
                                        layout_rowWeight,
                                        layout_columnWeight,
                                        layout_gravity: 'fill',
                                    },
                                }),
                                isPx(width) || isPx(height)
                            );
                            k = -1;
                        }
                        l = 0;
                    };
                    let length = Math.max(rowData.length, 1);
                    for (let i = 0; i < length; ++i) {
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
                    length = emptyRows.length;
                    for (let i = 0; i < length; ++i) {
                        const emptyRow = emptyRows[i];
                        if (emptyRow) {
                            const q = emptyRow.length;
                            for (let j = 0; j < q; ++j) {
                                const value = emptyRow[j];
                                if (value > 0) {
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
            const mainData = node.data(this.name, 'mainData');
            if (mainData) {
                if (
                    node.blockStatic &&
                    !node.hasPX('minWidth', { percent: false }) &&
                    ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.layoutElement) === false
                ) {
                    const { gap, length, unit } = mainData.column;
                    let minWidth = gap * (length - 1);
                    let i = 0;
                    while (i < unit.length) {
                        const value = unit[i++];
                        if (isPx(value)) {
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
    }

    class External extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        init(element, sessionId) {
            var _a;
            if (this.included(element)) {
                (_a = this.application.getProcessing(sessionId)) === null || _a === void 0
                    ? void 0
                    : _a.rootElements.add(element);
            }
            return false;
        }
    }

    var LayoutUI$1 = squared.base.LayoutUI;
    const { isLength: isLength$3 } = squared.lib.css;
    const { truncate: truncate$5 } = squared.lib.math;
    const { capitalize: capitalize$2, iterateReverseArray, sameArray, withinRange: withinRange$1 } = squared.lib.util;
    const { BOX_STANDARD: BOX_STANDARD$5, NODE_ALIGNMENT: NODE_ALIGNMENT$4 } = squared.base.lib.enumeration;
    const NodeUI$1 = squared.base.NodeUI;
    const MAP_HORIZONAL = {
        orientation: 'horizontal',
        orientationInverse: 'vertical',
        WHL: 'width',
        HWL: 'height',
        LT: 'left',
        TL: 'top',
        RB: 'right',
        BR: 'bottom',
        LRTB: 'leftRight',
        RLBT: 'rightLeft',
    };
    const MAP_VERTICAL = {
        orientation: 'vertical',
        orientationInverse: 'horizontal',
        WHL: 'height',
        HWL: 'width',
        LT: 'top',
        TL: 'left',
        RB: 'bottom',
        BR: 'right',
        LRTB: 'topBottom',
        RLBT: 'bottomTop',
    };
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
        let i = 0;
        while (i < length) {
            const item = items[i++];
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
            i = 0;
            while (i < length) {
                const item = items[i++];
                const { alignSelf, basis, shrink, grow } = item.flexbox;
                const dimension = item.bounds[attr];
                let growPercent = false;
                if (grow > 0 || shrink !== 1) {
                    const value = item.parseUnit(basis === 'auto' ? item.css(attr) : basis, { dimension: attr });
                    if (value > 0) {
                        let largest = false;
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
                } else if (isLength$3(basis)) {
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
                    i = 0;
                    while (i < q) {
                        const data = groupBasis[i++];
                        const { basis, item } = data;
                        if (
                            item === maxBasis ||
                            (basis === maxBasisUnit &&
                                ((growShrinkType === 1 && maxRatio === data.shrink) ||
                                    (growShrinkType === 2 && maxRatio === data.grow)))
                        ) {
                            item.flexbox.grow = 1;
                        } else if (basis > 0) {
                            item.flexbox.grow =
                                ((data.dimension / basis / (maxDimension / maxBasisUnit)) * basis) / maxBasisUnit;
                        }
                    }
                }
                q = percentage.length;
                i = 0;
                while (i < q) {
                    setBoxPercentage(parent, percentage[i++], attr);
                }
            }
        }
        if (horizontal && growShrinkType === 0) {
            i = 0;
            while (i < length) {
                const item = items[i++];
                if (
                    item.find(
                        child =>
                            child.multiline &&
                            child.ascend({ condition: above => above[hasDimension], including: parent }).length === 0,
                        { cascade: true }
                    )
                ) {
                    i = 0;
                    while (i < length) {
                        setBoxPercentage(parent, items[i++], attr);
                    }
                    break;
                }
            }
        }
        return result;
    }
    function getBaseline(nodes) {
        const length = nodes.length;
        let i = 0;
        while (i < length) {
            const node = nodes[i++];
            if (node.textElement && node.baseline) {
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
        while (item !== undefined) {
            if (item.layoutFrame) {
                return item.innerWrapped;
            }
            item = item.innerWrapped;
        }
        return undefined;
    }
    function setLayoutWeight(node, horizontal, dimension, attr, value) {
        if (node[dimension] === 0) {
            node.app(attr, truncate$5(value, node.localSettings.floatPrecision));
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
            const mainData = node.data(this.name, 'mainData');
            const { rowCount, columnCount } = mainData;
            if ((rowCount === 1 && mainData.row) || (columnCount === 1 && mainData.column)) {
                node.containerType = CONTAINER_NODE.CONSTRAINT;
                node.addAlign(2 /* AUTO_LAYOUT */);
                node.addAlign(mainData.column ? 8 /* VERTICAL */ : 4 /* HORIZONTAL */);
                mainData.wrap = false;
                return {
                    include: true,
                    complete: true,
                };
            } else {
                return {
                    output: this.application.renderNode(
                        LayoutUI$1.create({
                            parent,
                            node,
                            containerType: CONTAINER_NODE.CONSTRAINT,
                            alignmentType:
                                2 /* AUTO_LAYOUT */ | (mainData.column ? 4 /* HORIZONTAL */ : 8) /* VERTICAL */,
                            itemCount: node.length,
                            rowCount,
                            columnCount,
                        })
                    ),
                    include: true,
                    complete: true,
                };
            }
        }
        processChild(node, parent) {
            if (node.hasAlign(64 /* SEGMENTED */)) {
                return {
                    output: this.application.renderNode(
                        new LayoutUI$1(parent, node, CONTAINER_NODE.CONSTRAINT, 2 /* AUTO_LAYOUT */, node.children)
                    ),
                    complete: true,
                    subscribe: true,
                };
            } else {
                const autoMargin = node.autoMargin;
                if (autoMargin.horizontal || (autoMargin.vertical && parent.hasHeight)) {
                    const mainData = parent.data(this.name, 'mainData');
                    if (mainData) {
                        const index = mainData.children.findIndex(item => item === node);
                        if (index !== -1) {
                            const container = this.controller.createNodeWrapper(node, parent);
                            container.cssApply(
                                {
                                    marginTop: '0px',
                                    marginRight: '0px',
                                    marginBottom: '0px',
                                    marginLeft: '0px',
                                    display: 'block',
                                },
                                true
                            );
                            container.saveAsInitial();
                            container.setCacheValue('flexbox', node.flexbox);
                            mainData.children[index] = container;
                            if (autoMargin.horizontal && !node.hasWidth) {
                                node.setLayoutWidth('wrap_content');
                            }
                            return {
                                parent: container,
                                renderAs: container,
                                outputAs: this.application.renderNode(
                                    new LayoutUI$1(
                                        parent,
                                        container,
                                        CONTAINER_NODE.FRAME,
                                        2048 /* SINGLE */,
                                        container.children
                                    )
                                ),
                            };
                        }
                    }
                }
            }
            return undefined;
        }
        postBaseLayout(node) {
            const mainData = node.data(this.name, 'mainData');
            if (mainData) {
                const controller = this.controller;
                const { row, column, reverse, wrap, wrapReverse, alignContent, justifyContent, children } = mainData;
                const parentBottom =
                    node.hasPX('height', { percent: false }) || node.percentHeight > 0 ? node.linear.bottom : 0;
                const chainHorizontal = [];
                const chainVertical = [];
                const segmented = [];
                let marginBottom = 0;
                if (wrap) {
                    let previous;
                    node.each(item => {
                        if (item.hasAlign(64 /* SEGMENTED */)) {
                            const pageFlow = item.renderChildren.filter(child => child.pageFlow);
                            if (pageFlow.length > 0) {
                                if (row) {
                                    item.setLayoutWidth('match_parent');
                                    chainHorizontal.push(pageFlow);
                                } else {
                                    item.setLayoutHeight('match_parent');
                                    if (previous) {
                                        let largest = previous[0];
                                        let j = 1;
                                        while (j < previous.length) {
                                            const sibling = previous[j++];
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
                } else {
                    if (row) {
                        chainHorizontal[0] = children;
                    } else {
                        chainVertical[0] = children;
                    }
                }
                const applyLayout = (partition, horizontal) => {
                    const length = partition.length;
                    if (length === 0) {
                        return;
                    }
                    const { orientation, orientationInverse, WHL, HWL, LT, TL, RB, BR, LRTB, RLBT } = horizontal
                        ? MAP_HORIZONAL
                        : MAP_VERTICAL;
                    const [dimension, dimensionInverse] = horizontal
                        ? [node.hasHeight, node.hasWidth]
                        : [node.hasWidth, node.hasHeight];
                    const orientationWeight = `layout_constraint${capitalize$2(orientation)}_weight`;
                    for (let i = 0; i < length; ++i) {
                        const seg = partition[i];
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
                                let j = 0;
                                while (j < q) {
                                    const chain = seg[j++];
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
                        for (let j = 0; j < q; ++j) {
                            const chain = seg[j];
                            const previous = seg[j - 1];
                            const next = seg[j + 1];
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
                                                return;
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
                                            if (!baseline) {
                                                baseline = getBaseline(seg);
                                            }
                                            if (baseline) {
                                                if (baseline !== chain) {
                                                    chain.anchor('baseline', baseline.documentId);
                                                } else {
                                                    chain.anchorParent(orientationInverse, 0);
                                                }
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
                                                if (length % 2 === 1 && i === Math.floor(length / 2)) {
                                                    chain.anchorParent(orientationInverse);
                                                } else if (i < length / 2) {
                                                    chain.anchor(BR, 'parent');
                                                } else if (i >= length / 2) {
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
                                                if (i === 0) {
                                                    if (childContent) {
                                                        childContent.mergeGravity(
                                                            'layout_gravity',
                                                            wrapReverse ? BR : TL
                                                        );
                                                    } else {
                                                        chain.anchor(wrapReverse ? BR : TL, 'parent');
                                                    }
                                                } else if (length > 2 && i < length - 1) {
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
                                                            (!horizontal && !wrap && chain.length > 0) ||
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
                                                        chain.lockAttr('android', `layout_${HWL}`);
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                        break;
                                    }
                                }
                                percentWidth = View.setFlexDimension(chain, WHL, percentWidth);
                                if (!chain.innerMostWrapped.has('flexGrow')) {
                                    growAll = false;
                                }
                                if (parentBottom > 0 && i === length - 1) {
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
                            let j = 0;
                            while (j < q) {
                                const item = seg[j++];
                                setLayoutWeight(item, horizontal, WHL, orientationWeight, item.flexbox.grow);
                            }
                        } else if (growAvailable > 0) {
                            const r = layoutWeight.length;
                            let j = 0;
                            while (j < r) {
                                const item = layoutWeight[j++];
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
                            let centered = false;
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
                                            controller.addGuideline(segStart, node, { orientation, percent: true });
                                            controller.addGuideline(segEnd, node, {
                                                orientation,
                                                percent: true,
                                                opposing: true,
                                            });
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
                                    seg.some(item => item.app(orientationWeight) !== '') &&
                                    !sameArray(seg, item => item.app(orientationWeight)))
                            ) {
                                segStart.anchorStyle(orientation, 0, 'spread_inside', false);
                            } else if (!centered) {
                                segStart.anchorStyle(orientation, reverse ? 1 : 0, 'packed', false);
                            }
                        }
                    }
                };
                applyLayout(chainHorizontal, true);
                applyLayout(chainVertical, false);
            }
        }
    }

    var LayoutUI$2 = squared.base.LayoutUI;
    const { formatPX: formatPX$5 } = squared.lib.css;
    const { withinRange: withinRange$2 } = squared.lib.util;
    const { BOX_STANDARD: BOX_STANDARD$6, NODE_ALIGNMENT: NODE_ALIGNMENT$5 } = squared.base.lib.enumeration;
    class Grid extends squared.base.extensions.Grid {
        processNode(node, parent) {
            super.processNode(node, parent);
            const columnCount = node.data(this.name, 'columnCount');
            if (columnCount) {
                return {
                    output: this.application.renderNode(
                        LayoutUI$2.create({
                            parent,
                            node,
                            containerType: CONTAINER_NODE.GRID,
                            alignmentType: 128 /* COLUMN */,
                            children: node.children,
                            columnCount,
                        })
                    ),
                    include: true,
                    complete: true,
                };
            }
            return undefined;
        }
        processChild(node, parent) {
            var _a;
            const cellData = node.data(this.name, 'cellData');
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
                            controller.createNodeGroup(node, siblings, parent, { delegate: true, cascade: true }),
                            0,
                            0,
                            siblings
                        )
                    );
                    node = layout.node;
                    let i = 0;
                    while (i < siblings.length) {
                        const item = siblings[i++];
                        const source = item.data(this.name, 'cellData');
                        if (source) {
                            if (source.cellStart) {
                                data.cellStart = true;
                            }
                            if (source.cellEnd) {
                                data.cellEnd = true;
                            }
                            if (source.rowEnd) {
                                data.rowEnd = true;
                            }
                            if (source.rowStart) {
                                data.rowStart = true;
                            }
                            item.data(this.name, 'cellData', null);
                        }
                    }
                    node.data(this.name, 'cellData', data);
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
            return undefined;
        }
        postConstraints(node) {
            if (node.css('borderCollapse') !== 'collapse') {
                const columnCount = node.data(this.name, 'columnCount');
                if (columnCount) {
                    let paddingTop = 0,
                        paddingRight = 0,
                        paddingBottom = 0,
                        paddingLeft = 0;
                    node.renderEach(item => {
                        const cellData = item.data(this.name, 'cellData');
                        if (cellData) {
                            const parent = item.actualParent;
                            if ((parent === null || parent === void 0 ? void 0 : parent.visible) === false) {
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
                                                item.id,
                                                controller.renderSpace({
                                                    width: 'match_parent',
                                                    height:
                                                        '@dimen/' +
                                                        Resource.insertStoredAsset(
                                                            'dimens',
                                                            `${node.controlId}_grid_space`,
                                                            formatPX$5(heightBottom)
                                                        ),
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
                    node.modifyBox(16 /* PADDING_TOP */, paddingTop);
                    node.modifyBox(32 /* PADDING_RIGHT */, paddingRight);
                    node.modifyBox(64 /* PADDING_BOTTOM */, paddingBottom);
                    node.modifyBox(128 /* PADDING_LEFT */, paddingLeft);
                }
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
    const {
        formatPX: formatPX$6,
        getBackgroundPosition: getBackgroundPosition$1,
        isPercent: isPercent$3,
    } = squared.lib.css;
    const { convertInt: convertInt$1 } = squared.lib.util;
    const {
        BOX_STANDARD: BOX_STANDARD$7,
        NODE_ALIGNMENT: NODE_ALIGNMENT$6,
        NODE_TEMPLATE: NODE_TEMPLATE$2,
    } = squared.base.lib.enumeration;
    class List extends squared.base.extensions.List {
        processNode(node, parent) {
            const layout = new LayoutUI$3(parent, node, 0, 0, node.children);
            if (!layout.unknownAligned || layout.singleRowAligned) {
                super.processNode(node, parent);
                if (layout.linearY) {
                    layout.rowCount = node.length;
                    layout.columnCount = node.some(item => item.css('listStylePosition') === 'inside') ? 3 : 2;
                    layout.setContainerType(CONTAINER_NODE.GRID, 8 /* VERTICAL */);
                } else if (layout.linearX || layout.singleRowAligned) {
                    layout.rowCount = 1;
                    layout.columnCount = layout.length;
                    layout.setContainerType(CONTAINER_NODE.LINEAR, 4 /* HORIZONTAL */);
                } else {
                    return undefined;
                }
                return {
                    output: this.application.renderNode(layout),
                    complete: true,
                    include: true,
                };
            }
            return undefined;
        }
        processChild(node, parent) {
            const mainData = node.data(this.name, 'mainData');
            if (mainData) {
                const application = this.application;
                const controller = this.controller;
                const firstChild = parent.firstStaticChild === node;
                const marginTop = node.marginTop;
                let value = mainData.ordinal || '',
                    minWidth = node.marginLeft,
                    marginLeft = 0,
                    columnCount = 0,
                    adjustPadding = false,
                    resetPadding = NaN,
                    wrapped = false,
                    container;
                node.setBox(8 /* MARGIN_LEFT */, { reset: 1 });
                if (parent.layoutGrid) {
                    columnCount = convertInt$1(parent.android('columnCount')) || 1;
                    adjustPadding = true;
                } else if (firstChild) {
                    adjustPadding = true;
                }
                if (adjustPadding) {
                    if (parent.paddingLeft > 0) {
                        minWidth += parent.paddingLeft;
                    } else {
                        minWidth += parent.marginLeft;
                    }
                }
                if (node.length === 0 && !node.outerWrapper) {
                    container = controller.createNodeWrapper(node, parent);
                    wrapped = true;
                } else {
                    container = node.outerMostWrapper;
                }
                if (container !== node) {
                    node.resetBox(5 /* MARGIN_VERTICAL */, container);
                }
                let ordinal;
                if (value === '') {
                    ordinal = node.find(
                        item =>
                            item.float === 'left' &&
                            item.marginLeft < 0 &&
                            Math.abs(item.marginLeft) <= item.documentParent.marginLeft
                    );
                }
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
                    ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.INLINE);
                    ordinal.setBox(8 /* MARGIN_LEFT */, { reset: 1 });
                    ordinal.render(parent);
                    const layout = new LayoutUI$3(parent, ordinal);
                    if (ordinal.inlineText || ordinal.length === 0) {
                        layout.setContainerType(CONTAINER_NODE.TEXT);
                    } else {
                        layout.retainAs(ordinal.children);
                        if (layout.singleRowAligned) {
                            layout.setContainerType(CONTAINER_NODE.RELATIVE, 4 /* HORIZONTAL */);
                        } else {
                            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 1 /* UNKNOWN */);
                        }
                    }
                    const template = application.renderNode(layout);
                    if (template) {
                        application.addLayoutTemplate(parent, ordinal, template);
                    } else {
                        return undefined;
                    }
                } else {
                    let top = 0,
                        left = 0,
                        paddingRight = 0,
                        gravity = 'right',
                        image;
                    if (mainData.imageSrc !== '') {
                        const resource = this.resource;
                        if (mainData.imagePosition) {
                            ({ top, left } = getBackgroundPosition$1(mainData.imagePosition, node.actualDimension, {
                                fontSize: node.fontSize,
                                imageDimension: resource.getImage(mainData.imageSrc),
                                screenDimension: node.localSettings.screenDimension,
                            }));
                            if (node.marginLeft < 0) {
                                resetPadding =
                                    node.marginLeft + (parent.paddingLeft > 0 ? parent.paddingLeft : parent.marginLeft);
                            } else {
                                adjustPadding = false;
                                marginLeft = node.marginLeft;
                            }
                            minWidth = node.paddingLeft - left;
                            node.setBox(128 /* PADDING_LEFT */, { reset: 1 });
                            gravity = '';
                        }
                        image = resource.addImageSrc(mainData.imageSrc);
                    }
                    const options = createViewAttribute();
                    ordinal = application.createNode(node.sessionId, { parent });
                    ordinal.childIndex = node.childIndex;
                    ordinal.containerName = node.containerName + '_ORDINAL';
                    ordinal.inherit(node, 'textStyle');
                    if (value !== '' && !value.endsWith('.')) {
                        ordinal.setCacheValue('fontSize', ordinal.fontSize * 0.75);
                    }
                    if (gravity === 'right') {
                        if (image) {
                            paddingRight = Math.max(minWidth / 6, 4);
                            minWidth -= paddingRight;
                        } else if (value !== '') {
                            value += '&#160;'.repeat(value.length === 1 ? 3 : 2);
                        }
                    }
                    if (columnCount === 3) {
                        container.android('layout_columnSpan', '2');
                    }
                    if (node.tagName === 'DT' && !image) {
                        container.android('layout_columnSpan', columnCount.toString());
                    } else {
                        if (image) {
                            ordinal.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                            Object.assign(options.android, {
                                src: `@drawable/${image}`,
                                scaleType: gravity === 'right' ? 'fitEnd' : 'fitStart',
                                baselineAlignBottom: adjustPadding ? 'true' : '',
                            });
                        } else if (value !== '') {
                            ordinal.textContent = value;
                            ordinal.inlineText = true;
                            ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                            if (node.tagName === 'DFN') {
                                minWidth += 8;
                                ordinal.modifyBox(32 /* PADDING_RIGHT */, 8);
                            }
                        } else {
                            ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                            ordinal.renderExclude = false;
                            node.setBox(128 /* PADDING_LEFT */, { reset: 1 });
                        }
                        const { paddingTop, lineHeight } = node;
                        ordinal.cssApply({
                            minWidth: minWidth > 0 ? formatPX$6(minWidth) : '',
                            marginLeft: marginLeft > 0 ? formatPX$6(marginLeft) : '',
                            paddingTop:
                                paddingTop > 0 && node.getBox(16 /* PADDING_TOP */)[0] === 0
                                    ? formatPX$6(paddingTop)
                                    : '',
                            paddingRight: paddingRight > 0 ? formatPX$6(paddingRight) : '',
                            lineHeight: lineHeight > 0 ? formatPX$6(lineHeight) : '',
                        });
                        ordinal.apply(options);
                        ordinal.modifyBox(128 /* PADDING_LEFT */, 2);
                        if (ordinal.cssTry('display', 'block')) {
                            ordinal.setBounds();
                            ordinal.cssFinally('display');
                        }
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
                if (marginTop !== 0) {
                    ordinal.modifyBox(1 /* MARGIN_TOP */, marginTop);
                    ordinal.companion = container;
                    this.subscribers.add(ordinal);
                }
                ordinal.positioned = true;
                if (adjustPadding) {
                    if (isNaN(resetPadding) || resetPadding <= 0) {
                        parent.setBox(parent.paddingLeft > 0 ? 128 /* PADDING_LEFT */ : 8 /* MARGIN_LEFT */, {
                            reset: 1,
                        });
                    }
                    if (resetPadding < 0) {
                        parent.modifyBox(8 /* MARGIN_LEFT */, resetPadding);
                    }
                }
                if (
                    columnCount > 0 &&
                    node.ascend({
                        condition: item => !item.blockStatic && !item.hasWidth,
                        error: item => item.hasWidth,
                        startSelf: node.naturalElement,
                    }).length === 0
                ) {
                    container.setLayoutWidth('0px');
                    container.android('layout_columnWeight', '1');
                }
                if (wrapped) {
                    return {
                        parent: container,
                        renderAs: container,
                        outputAs: application.renderNode(
                            new LayoutUI$3(
                                parent,
                                container,
                                node.baselineElement && node.percentWidth === 0 && !isPercent$3(node.css('maxWidth'))
                                    ? CONTAINER_NODE.LINEAR
                                    : CONTAINER_NODE.CONSTRAINT,
                                8 /* VERTICAL */ | 1 /* UNKNOWN */,
                                container.children
                            )
                        ),
                        subscribe: true,
                    };
                }
            }
            return undefined;
        }
        postConstraints(node) {
            const companion = !node.naturalChild && node.companion;
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

    const { BOX_STANDARD: BOX_STANDARD$8 } = squared.base.lib.enumeration;
    class Relative extends squared.base.extensions.Relative {
        is(node) {
            if (node.inlineStatic || node.imageOrSvgElement) {
                switch (node.verticalAlign) {
                    case 'sub':
                    case 'super':
                        return true;
                }
            }
            return super.is(node);
        }
        postOptimize(node) {
            if (!node.baselineAltered) {
                switch (node.verticalAlign) {
                    case 'sub': {
                        const renderParent = node.outerMostWrapper.renderParent;
                        if (!renderParent.layoutHorizontal) {
                            node.modifyBox(
                                4 /* MARGIN_BOTTOM */,
                                Math.floor(
                                    node.baselineHeight * this.controller.localSettings.deviations.subscriptBottomOffset
                                ) * -1
                            );
                        }
                        break;
                    }
                    case 'super': {
                        const renderParent = node.outerMostWrapper.renderParent;
                        if (!renderParent.layoutHorizontal) {
                            node.modifyBox(
                                1 /* MARGIN_TOP */,
                                Math.floor(
                                    node.baselineHeight * this.controller.localSettings.deviations.superscriptTopOffset
                                ) * -1
                            );
                        }
                        break;
                    }
                }
            }
            super.postOptimize(node);
        }
    }

    var LayoutUI$4 = squared.base.LayoutUI;
    const { formatPX: formatPX$7 } = squared.lib.css;
    const {
        APP_SECTION: APP_SECTION$2,
        BOX_STANDARD: BOX_STANDARD$9,
        NODE_ALIGNMENT: NODE_ALIGNMENT$7,
        NODE_PROCEDURE: NODE_PROCEDURE$5,
        NODE_RESOURCE: NODE_RESOURCE$4,
    } = squared.base.lib.enumeration;
    class Sprite extends squared.base.extensions.Sprite {
        processNode(node, parent) {
            const mainData = node.data(this.name, 'mainData');
            if (mainData) {
                const drawable = this.resource.addImageSrc(node.backgroundImage);
                if (drawable !== '') {
                    const container = this.application.createNode(node.sessionId, { parent, innerWrap: node });
                    container.inherit(node, 'base', 'initial', 'styleMap');
                    container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    container.exclude({
                        resource: NODE_RESOURCE$4.ASSET,
                        procedure: NODE_PROCEDURE$5.CUSTOMIZATION,
                        section: APP_SECTION$2.ALL,
                    });
                    node.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
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
                        width: mainData.image.width > 0 ? formatPX$7(mainData.image.width) : 'auto',
                        height: mainData.image.height > 0 ? formatPX$7(mainData.image.height) : 'auto',
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
                    node.android('layout_marginTop', formatPX$7(mainData.position.top));
                    node.android(node.localizeString('layout_marginLeft'), formatPX$7(mainData.position.left));
                    return {
                        renderAs: container,
                        outputAs: this.application.renderNode(
                            new LayoutUI$4(
                                parent,
                                container,
                                CONTAINER_NODE.FRAME,
                                2048 /* SINGLE */,
                                container.children
                            )
                        ),
                        parent: container,
                        complete: true,
                    };
                }
            }
            return undefined;
        }
    }

    const { convertCamelCase } = squared.lib.util;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$8, NODE_TEMPLATE: NODE_TEMPLATE$3 } = squared.base.lib.enumeration;
    class Substitute extends squared.base.ExtensionUI {
        constructor(name, framework, options, tagNames) {
            super(name, framework, options, tagNames);
            this.require(EXT_ANDROID.EXTERNAL, true);
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
            return undefined;
        }
        postOptimize(node) {
            node.apply(
                Resource.formatOptions(
                    createViewAttribute(this.options[node.elementId]),
                    this.application.extensionManager.optionValueAsBoolean(
                        EXT_ANDROID.RESOURCE_STRINGS,
                        'numberResourceValue'
                    )
                )
            );
        }
    }

    var LayoutUI$5 = squared.base.LayoutUI;
    const { CSS_UNIT: CSS_UNIT$2, formatPX: formatPX$8 } = squared.lib.css;
    const { convertFloat: convertFloat$2, convertInt: convertInt$2, trimEnd } = squared.lib.util;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$9 } = squared.base.lib.enumeration;
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
            const mainData = node.data(this.name, 'mainData');
            let requireWidth = false;
            if (mainData.columnCount > 1) {
                requireWidth = mainData.expand;
                node.each(item => {
                    const cellData = item.data(this.name, 'cellData');
                    if (cellData) {
                        if (cellData.flexible) {
                            item.android('layout_columnWeight', cellData.colSpan.toString());
                            item.setLayoutWidth('0px');
                            requireWidth = true;
                        } else {
                            if (cellData.expand === false) {
                                item.android('layout_columnWeight', '0');
                            } else if (cellData.percent) {
                                const value = convertFloat$2(cellData.percent) / 100;
                                if (value > 0) {
                                    item.setLayoutWidth('0px');
                                    item.android('layout_columnWeight', trimEnd(value.toPrecision(3), '0'));
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
                    if (item.tagName === 'TD') {
                        item.setSingleLine(true);
                    }
                    setLayoutHeight(item);
                });
            } else {
                node.each(item => {
                    if (item.has('width', { type: 2 /* PERCENT */ })) {
                        item.setLayoutWidth('wrap_content');
                        requireWidth = true;
                    }
                    setLayoutHeight(item);
                });
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
                if ((parent.blockStatic || parent.hasPX('width')) && Math.ceil(node.bounds.width) >= parent.box.width) {
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
                        children: node.children,
                        rowCount: mainData.rowCount,
                        columnCount: mainData.columnCount,
                    })
                ),
                include: true,
                complete: true,
            };
        }
        processChild(node, parent) {
            const cellData = node.data(this.name, 'cellData');
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
                        node.id,
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
            return undefined;
        }
        postOptimize(node) {
            const layoutWidth = convertInt$2(node.layoutWidth);
            if (layoutWidth > 0) {
                const width = node.bounds.width;
                if (width > layoutWidth) {
                    node.setLayoutWidth(formatPX$8(width));
                }
                if (node.cssInitial('width') === 'auto' && node.renderChildren.every(item => item.inlineWidth)) {
                    node.renderEach(item => {
                        item.setLayoutWidth('0px');
                        item.android('layout_columnWeight', '1');
                    });
                }
            }
        }
    }

    var LayoutUI$6 = squared.base.LayoutUI;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$a } = squared.base.lib.enumeration;
    class VerticalAlign extends squared.base.extensions.VerticalAlign {
        processNode(node, parent) {
            super.processNode(node, parent);
            return {
                output: this.application.renderNode(
                    new LayoutUI$6(parent, node, CONTAINER_NODE.RELATIVE, 4 /* HORIZONTAL */, node.children)
                ),
                subscribe: true,
            };
        }
    }

    class WhiteSpace extends squared.base.extensions.WhiteSpace {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
    }

    var LayoutUI$7 = squared.base.LayoutUI;
    const { formatPX: formatPX$9 } = squared.lib.css;
    const { hypotenuse } = squared.lib.math;
    const { withinRange: withinRange$3 } = squared.lib.util;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$b } = squared.base.lib.enumeration;
    class Guideline extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.options = {
                circlePosition: false,
            };
        }
        is(node) {
            return this.included(node.element);
        }
        condition(node) {
            return node.length > 0;
        }
        processNode(node, parent) {
            return {
                output: this.application.renderNode(
                    new LayoutUI$7(parent, node, CONTAINER_NODE.CONSTRAINT, 16 /* ABSOLUTE */, node.children)
                ),
            };
        }
        postBaseLayout(node) {
            const controller = this.controller;
            const circlePosition = this.options.circlePosition;
            const { left, top } = node.box;
            let anchor;
            node.each(item => {
                const linear = item.linear;
                if (withinRange$3(linear.left, left)) {
                    item.anchorParent('horizontal', 0);
                }
                if (withinRange$3(linear.top, top)) {
                    item.anchorParent('vertical', 0);
                }
                if (circlePosition) {
                    if (item.anchored) {
                        anchor = item;
                    } else if (anchor) {
                        if (item.constraint.vertical && !anchor.constraint.vertical) {
                            anchor = item;
                        }
                    } else if (item.constraint.vertical) {
                        anchor = item;
                    } else if (item.constraint.horizontal) {
                        anchor = item;
                    }
                }
                item.positioned = true;
            });
            if (circlePosition) {
                if (!anchor) {
                    anchor = node.item(0);
                }
                if (!anchor.anchored) {
                    controller.addGuideline(anchor, node);
                }
                const { x: x2, y: y2 } = anchor.center;
                node.each(item => {
                    if (item !== anchor) {
                        const { x: x1, y: y1 } = item.center;
                        const x = Math.abs(x1 - x2);
                        const y = Math.abs(y1 - y2);
                        const radius = Math.round(hypotenuse(x, y));
                        let degrees = Math.round(Math.atan(Math.min(x, y) / Math.max(x, y)) * (180 / Math.PI));
                        if (y1 > y2) {
                            if (x1 > x2) {
                                if (x > y) {
                                    degrees += 90;
                                } else {
                                    degrees = 180 - degrees;
                                }
                            } else if (x > y) {
                                degrees = 270 - degrees;
                            } else {
                                degrees += 180;
                            }
                        } else if (y1 < y2) {
                            if (x2 > x1) {
                                if (x > y) {
                                    degrees += 270;
                                } else {
                                    degrees = 360 - degrees;
                                }
                            } else if (x > y) {
                                degrees = 90 - degrees;
                            }
                        } else {
                            degrees = x1 > x2 ? 90 : 270;
                        }
                        item.app('layout_constraintCircle', anchor.documentId);
                        item.app('layout_constraintCircleRadius', formatPX$9(radius));
                        item.app('layout_constraintCircleAngle', degrees.toString());
                    }
                });
            } else {
                node.each(item => {
                    if (!item.anchored) {
                        controller.addGuideline(item, node);
                    }
                });
            }
        }
    }

    var LayoutUI$8 = squared.base.LayoutUI;
    const { CSS_UNIT: CSS_UNIT$3, isLength: isLength$4 } = squared.lib.css;
    const {
        BOX_STANDARD: BOX_STANDARD$a,
        NODE_ALIGNMENT: NODE_ALIGNMENT$c,
        NODE_RESOURCE: NODE_RESOURCE$5,
        NODE_TEMPLATE: NODE_TEMPLATE$4,
    } = squared.base.lib.enumeration;
    const CssGrid$1 = squared.base.extensions.CssGrid;
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
    const isWrapped = (node, parent, backgroundColor, backgroundImage, borderWidth) =>
        (backgroundColor || backgroundImage) &&
        !isParentVisible(node, parent) &&
        (borderWidth || (node.gridElement && (CssGrid$1.isJustified(node) || CssGrid$1.isAligned(node))));
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
                isWrapped(node, parent, backgroundColor, backgroundImage, borderWidth) ||
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
            const hasHeight = node.hasHeight || node.actualParent.hasHeight === true;
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
                            resource: NODE_RESOURCE$5.BOX_SPACING,
                        });
                    }
                } else {
                    container = controller.createNodeWrapper(node, renderParent, {
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
                                            .some(value => isLength$4(value) && parseInt(value) > 0))))
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
                if (!container) {
                    container = controller.createNodeWrapper(node, renderParent);
                }
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
                        new LayoutUI$8(
                            parentAs || parent,
                            container,
                            CONTAINER_NODE.CONSTRAINT,
                            8 /* VERTICAL */,
                            container.children
                        )
                    ),
                    remove: true,
                };
            }
            return { remove: true };
        }
    }

    var LayoutUI$9 = squared.base.LayoutUI;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$d } = squared.base.lib.enumeration;
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
                node.data(this.name, 'mainData', { maxWidth, maxHeight });
                return true;
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = node.data(this.name, 'mainData');
            if (mainData) {
                const container = this.controller.createNodeWrapper(node, parent, {
                    containerType: CONTAINER_NODE.CONSTRAINT,
                    alignmentType: 32 /* BLOCK */,
                    resetMargin: true,
                });
                if (mainData.maxWidth) {
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
                if (mainData.maxHeight) {
                    node.setLayoutHeight('0px');
                    container.setLayoutHeight('match_parent');
                    if (parent.layoutElement) {
                        const autoMargin = node.autoMargin;
                        autoMargin.vertical = false;
                        autoMargin.top = false;
                        autoMargin.bottom = false;
                        autoMargin.topBottom = false;
                        if (!mainData.maxHeight && node.blockStatic && !node.hasWidth) {
                            node.setLayoutWidth('match_parent', false);
                        }
                    }
                }
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new LayoutUI$9(
                            parent,
                            container,
                            container.containerType,
                            2048 /* SINGLE */,
                            container.children
                        )
                    ),
                };
            }
            return undefined;
        }
    }

    var LayoutUI$a = squared.base.LayoutUI;
    const { BOX_STANDARD: BOX_STANDARD$b, NODE_ALIGNMENT: NODE_ALIGNMENT$e } = squared.base.lib.enumeration;
    function outsideX(node, parent) {
        if (node.pageFlow) {
            return (
                node === parent.firstStaticChild &&
                node.inlineFlow &&
                !node.centerAligned &&
                !node.rightAligned &&
                node.marginLeft < 0 &&
                Math.abs(node.marginLeft) <= parent.marginLeft + parent.paddingLeft &&
                !parent.some(item => item.multiline)
            );
        } else {
            return node.leftTopAxis && (node.left < 0 || (!node.hasPX('left') && node.right < 0));
        }
    }
    class NegativeX extends squared.base.ExtensionUI {
        is(node) {
            return node.length > 0 && !node.rootElement && node.css('overflowX') !== 'hidden';
        }
        condition(node) {
            return node.some(item => outsideX(item, node));
        }
        processNode(node, parent) {
            const children = node.children.filter(item => outsideX(item, node));
            const container = this.controller.createNodeWrapper(node, parent, {
                children,
                containerType: CONTAINER_NODE.CONSTRAINT,
            });
            let left = NaN,
                right = NaN,
                firstChild;
            node.resetBox(1 /* MARGIN_TOP */ | 4 /* MARGIN_BOTTOM */, container);
            const length = children.length;
            let i = 0;
            while (i < length) {
                const item = children[i++];
                const linear = item.linear;
                if (item.pageFlow) {
                    if (isNaN(left) || linear.left < left) {
                        left = linear.left;
                    }
                    firstChild = item;
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
            node.data(this.name, 'mainData', {
                container,
                children,
                offsetLeft: node.marginLeft + node.paddingLeft,
                firstChild,
            });
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(
                    new LayoutUI$a(
                        parent,
                        container,
                        container.containerType,
                        4 /* HORIZONTAL */ | 2048 /* SINGLE */,
                        container.children
                    )
                ),
                subscribe: true,
            };
        }
        postBaseLayout(node) {
            const mainData = node.data(this.name, 'mainData');
            if (mainData) {
                let firstChild = mainData.firstChild;
                if (firstChild) {
                    firstChild = firstChild.ascend({ excluding: node, attr: 'outerWrapper' }).pop() || firstChild;
                    firstChild.anchor('left', 'parent');
                    firstChild.anchorStyle('horizontal', 0);
                    firstChild.anchorParent('vertical', 0);
                    firstChild.modifyBox(8 /* MARGIN_LEFT */, mainData.offsetLeft);
                    View.setConstraintDimension(firstChild);
                    firstChild.positioned = true;
                }
                const children = mainData.children;
                const length = children.length;
                let i = 0;
                while (i < length) {
                    const item = children[i++];
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
                View.setConstraintDimension(node);
                node.positioned = true;
            }
        }
        beforeCascade() {
            for (const node of this.subscribers) {
                const mainData = node.data(this.name, 'mainData');
                if (mainData) {
                    const translateX = node.android('translationX');
                    const translateY = node.android('translationY');
                    if (translateX !== '' || translateY !== '') {
                        const x = parseInt(translateX);
                        const y = parseInt(translateY);
                        const children = mainData.children;
                        const length = children.length;
                        let i = 0;
                        while (i < length) {
                            const item = children[i++];
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

    var LayoutUI$b = squared.base.LayoutUI;
    const { BOX_STANDARD: BOX_STANDARD$c, NODE_ALIGNMENT: NODE_ALIGNMENT$f } = squared.base.lib.enumeration;
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
            return node.length > 0;
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
                aboveInvalid = false,
                belowInvalid = false;
            if ((_a = node.firstStaticChild) === null || _a === void 0 ? void 0 : _a.lineBreak) {
                contentBox = true;
                aboveInvalid = true;
            }
            if (
                (lastStaticChild === null || lastStaticChild === void 0 ? void 0 : lastStaticChild.lineBreak) &&
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
            let right = false,
                bottom = false;
            node.each(item => {
                const fixed = rootElement && item.css('position') === 'fixed';
                if (item.pageFlow || (!contentBox && !fixed)) {
                    return;
                }
                const fixedPosition = fixed && item.autoPosition;
                if (item.hasPX('left') || fixedPosition) {
                    if (documentBody && (item.css('width') === '100%' || item.css('minWidth') === '100%')) {
                        if (paddingLeft > 0 || paddingRight > 0) {
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
                        if (paddingTop > 0 || paddingBottom > 0) {
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
            if (children.size > 0 || right || bottom) {
                node.data(this.name, 'mainData', { children: Array.from(children), right, bottom });
                return true;
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = node.data(this.name, 'mainData');
            if (mainData) {
                const children = mainData.children;
                let container;
                if (children.length > 0) {
                    container = this.controller.createNodeWrapper(node, parent, {
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
                            new LayoutUI$b(
                                parent,
                                container,
                                CONTAINER_NODE.CONSTRAINT,
                                16 /* ABSOLUTE */,
                                container.children
                            )
                        ),
                        subscribe: true,
                    };
                }
            }
            return undefined;
        }
        postBaseLayout(node) {
            const mainData = node.data(this.name, 'mainData');
            if (mainData) {
                const documentId = node.documentId;
                const children = mainData.children;
                const length = children.length;
                let i = 0;
                while (i < length) {
                    const item = children[i++];
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

    var LayoutUI$c = squared.base.LayoutUI;
    const { CSS_UNIT: CSS_UNIT$4, formatPX: formatPX$a, isPercent: isPercent$4 } = squared.lib.css;
    const { truncate: truncate$6 } = squared.lib.math;
    const { BOX_STANDARD: BOX_STANDARD$d, NODE_ALIGNMENT: NODE_ALIGNMENT$g } = squared.base.lib.enumeration;
    function hasPercentWidth(node) {
        const value = node.percentWidth;
        return (value > 0 && value < 1) || isPercent$4(node.css('maxWidth'));
    }
    function hasPercentHeight(node, parent) {
        const value = node.percentHeight;
        return (value > 0 && value < 1) || (isPercent$4(node.css('maxHeight')) && parent.hasHeight);
    }
    function hasMarginHorizontal(node, parent, clearMap) {
        return (
            (validPercent(node.css('marginLeft')) || validPercent(node.css('marginRight'))) &&
            ((parent.layoutVertical && !parent.hasAlign(1 /* UNKNOWN */)) ||
                parent.layoutFrame ||
                (node.blockStatic && node.alignedVertically(undefined, clearMap)) ||
                node.documentParent.length === 1 ||
                !node.pageFlow)
        );
    }
    const hasMarginVertical = node =>
        (validPercent(node.css('marginTop')) || validPercent(node.css('marginBottom'))) &&
        node.documentParent.percentHeight > 0 &&
        !node.inlineStatic &&
        (node.documentParent.length === 1 || !node.pageFlow);
    const validPercent = value => isPercent$4(value) && parseFloat(value) > 0;
    class Percent extends squared.base.ExtensionUI {
        is(node) {
            return !node.actualParent.layoutElement && !node.display.startsWith('table');
        }
        condition(node, parent) {
            const absoluteParent = node.absoluteParent || parent;
            const requireWidth = !absoluteParent.hasPX('width', { percent: false });
            const requireHeight = !absoluteParent.hasPX('height', { percent: false });
            const percentWidth =
                requireWidth &&
                hasPercentWidth(node) &&
                !parent.layoutConstraint &&
                (node.cssInitial('width') !== '100%' || node.has('maxWidth', { type: 2 /* PERCENT */, not: '100%' })) &&
                (node.rootElement ||
                    ((parent.layoutVertical || node.onlyChild) && (parent.blockStatic || parent.percentWidth > 0)));
            const marginHorizontal = requireWidth && hasMarginHorizontal(node, parent, this.application.clearMap);
            const percentHeight =
                requireHeight &&
                hasPercentHeight(node, parent) &&
                (node.cssInitial('height') !== '100%' ||
                    node.has('maxHeight', { type: 2 /* PERCENT */, not: '100%' })) &&
                (node.rootElement || parent.percentHeight > 0);
            const marginVertical = requireHeight && hasMarginVertical(node);
            if (percentWidth || percentHeight || marginHorizontal || marginVertical) {
                node.data(this.name, 'mainData', { percentWidth, percentHeight, marginHorizontal, marginVertical });
                return true;
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = node.data(this.name, 'mainData');
            if (mainData) {
                let container;
                if (!parent.layoutConstraint || mainData.percentHeight) {
                    container = this.controller.createNodeWrapper(node, parent, { resetMargin: true });
                }
                const target = container || parent;
                if (mainData.percentWidth) {
                    if (!target.hasWidth) {
                        target.setCacheValue('hasWidth', true);
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
                            new LayoutUI$c(
                                parent,
                                container,
                                CONTAINER_NODE.CONSTRAINT,
                                2048 /* SINGLE */,
                                container.children
                            )
                        ),
                        include: true,
                    };
                }
                return { include: true };
            }
            return undefined;
        }
        postBaseLayout(node) {
            const controller = this.controller;
            const mainData = node.data(this.name, 'mainData');
            const constraint = LAYOUT_ANDROID.constraint;
            const renderParent = node.renderParent;
            const templateId = node.anchorTarget.renderParent.id;
            if (mainData.marginHorizontal) {
                const [marginLeft, marginRight] = node.cssAsTuple('marginLeft', 'marginRight');
                const boxRect = Controller.anchorPosition(node, renderParent, true, false);
                const rightAligned = node.rightAligned;
                let percentWidth = node.percentWidth,
                    leftPercent = validPercent(marginLeft) ? parseFloat(marginLeft) / 100 : 0,
                    rightPercent = validPercent(marginRight) ? parseFloat(marginRight) / 100 : 0;
                if (percentWidth > 0) {
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
                            [node.localizeString(STRING_ANDROID.MARGIN_LEFT)]: boxRect.left
                                ? formatPX$a(boxRect.left)
                                : '',
                        },
                        app: {
                            layout_constraintHorizontal_chainStyle: styleBias ? 'packed' : '',
                            layout_constraintHorizontal_bias: styleBias ? '0' : '',
                            layout_constraintWidth_percent: truncate$6(leftPercent, node.localSettings.floatPrecision),
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
                        controller.addAfterInsideTemplate(templateId, output);
                    }
                }
                if (rightPercent > 0) {
                    const options = {
                        width: '0px',
                        height: 'wrap_content',
                        android: {
                            [node.localizeString(STRING_ANDROID.MARGIN_RIGHT)]: boxRect.right
                                ? formatPX$a(boxRect.right)
                                : '',
                        },
                        app: {
                            layout_constraintHorizontal_chainStyle: rightAligned ? 'packed' : '',
                            layout_constraintHorizontal_bias: rightAligned ? '1' : '',
                            layout_constraintWidth_percent: truncate$6(rightPercent, node.localSettings.floatPrecision),
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
                        controller.addAfterInsideTemplate(templateId, output);
                    }
                }
                if (node.blockStatic && !node.hasWidth) {
                    node.app('layout_constraintWidth_percent', (1 - (leftPercent + rightPercent)).toString());
                    node.setLayoutWidth('0px');
                    node.setCacheValue('contentBoxWidth', 0);
                } else if (percentWidth > 0) {
                    let percentTotal = percentWidth + leftPercent + rightPercent;
                    if (percentTotal >= 1) {
                        percentWidth -= percentTotal - 1;
                    } else {
                        const boxPercent =
                            node.contentBox && !node.tableElement ? node.contentBoxWidth / renderParent.box.width : 0;
                        if (boxPercent > 0) {
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
                const boxRect = Controller.anchorPosition(node, renderParent, true, false);
                const bottomAligned = node.bottomAligned;
                let percentHeight = node.percentHeight,
                    topPercent = validPercent(marginTop) ? parseFloat(marginTop) / 100 : 0,
                    bottomPercent = validPercent(marginBottom) ? parseFloat(marginBottom) / 100 : 0;
                if (percentHeight > 0) {
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
                            [STRING_ANDROID.MARGIN_TOP]: boxRect.top ? formatPX$a(boxRect.top) : '',
                        },
                        app: {
                            layout_constraintVertical_chainStyle: !bottomAligned ? 'packed' : '',
                            layout_constraintVertical_bias: !bottomAligned ? '0' : '',
                            layout_constraintHeight_percent: truncate$6(topPercent, node.localSettings.floatPrecision),
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
                        controller.addAfterInsideTemplate(templateId, output);
                    }
                }
                if (bottomPercent > 0) {
                    const options = {
                        width: 'wrap_content',
                        height: '0px',
                        android: {
                            [STRING_ANDROID.MARGIN_BOTTOM]: boxRect.bottom ? formatPX$a(boxRect.bottom) : '',
                        },
                        app: {
                            layout_constraintVertical_chainStyle: bottomAligned ? 'packed' : '',
                            layout_constraintVertical_bias: bottomAligned ? '1' : '',
                            layout_constraintHeight_percent: truncate$6(
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
                        controller.addAfterInsideTemplate(templateId, output);
                    }
                }
                if (node.css('height') === '100%' || node.css('minHeight') === '100%') {
                    node.app('layout_constraintHeight_percent', (1 - (topPercent + bottomPercent)).toString());
                    node.setLayoutHeight('0px');
                    node.setCacheValue('contentBoxHeight', 0);
                } else if (percentHeight > 0) {
                    let percentTotal = percentHeight + topPercent + bottomPercent;
                    if (percentTotal >= 1) {
                        percentHeight -= percentTotal - 1;
                    } else {
                        const boxPercent =
                            node.contentBox && !node.tableElement ? node.contentBoxHeight / renderParent.box.height : 0;
                        if (boxPercent > 0) {
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

    const { getElementAsNode: getElementAsNode$1 } = squared.lib.session;
    const {
        NODE_ALIGNMENT: NODE_ALIGNMENT$h,
        NODE_RESOURCE: NODE_RESOURCE$6,
        NODE_TEMPLATE: NODE_TEMPLATE$5,
    } = squared.base.lib.enumeration;
    const NodeUI$2 = squared.base.NodeUI;
    function setBaselineIndex(children, container, name) {
        let valid = false;
        const length = children.length;
        let i = 0;
        while (i < length) {
            const item = children[i++];
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
            item.data(name, 'siblings', children);
        }
        return valid;
    }
    const getInputName = element => {
        var _a;
        return ((_a = element.name) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    };
    class RadioGroup extends squared.base.ExtensionUI {
        is(node) {
            return node.is(CONTAINER_NODE.RADIO);
        }
        condition(node) {
            return getInputName(node.element) !== '' && node.data(this.name, 'siblings') === undefined;
        }
        processNode(node, parent) {
            var _a, _b;
            const inputName = getInputName(node.element);
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
                if (item.is(CONTAINER_NODE.RADIO) && !item.rendered && getInputName(item.element) === inputName) {
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
                const controlName = CONTAINER_ANDROID.RADIOGROUP;
                container.setControlType(controlName, CONTAINER_NODE.LINEAR);
                if (linearX) {
                    container.addAlign(4 /* HORIZONTAL */ | 64 /* SEGMENTED */);
                    container.android('orientation', 'horizontal');
                } else {
                    container.addAlign(8 /* VERTICAL */);
                    container.android('orientation', 'vertical');
                }
                container.inherit(node, 'alignment');
                container.exclude({ resource: NODE_RESOURCE$6.ASSET });
                container.render(parent);
                if (!setBaselineIndex(radiogroup, container, this.name)) {
                    container.css('verticalAlign', 'middle');
                    container.setCacheValue('baseline', false);
                    container.setCacheValue('verticalAlign', 'middle');
                }
                length = removeable.length;
                let i = 0;
                while (i < length) {
                    removeable[i++].hide({ remove: true });
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
                const name = getInputName(node.element);
                const sessionId = node.sessionId;
                document.querySelectorAll(`input[type=radio][name=${name}]`).forEach(element => {
                    const item = getElementAsNode$1(element, sessionId);
                    if (item) {
                        radiogroup.push(item);
                    }
                });
                length = radiogroup.length;
                if (length > 1 && radiogroup.includes(node)) {
                    const controlName = CONTAINER_ANDROID.RADIOGROUP;
                    const data = new Map();
                    let i = 0;
                    while (i < length) {
                        const radio = radiogroup[i++];
                        const parents = radio.ascend({
                            condition: item => item.layoutLinear,
                            error: item => item.controlName === controlName,
                            every: true,
                        });
                        const q = parents.length;
                        if (q > 0) {
                            let j = 0;
                            while (j < q) {
                                const item = parents[j++];
                                data.set(item, (data.get(item) || 0) + 1);
                            }
                        } else {
                            data.clear();
                            break;
                        }
                    }
                    for (const [group, value] of data.entries()) {
                        if (value === length) {
                            group.unsafe('controlName', controlName);
                            group.containerType = CONTAINER_NODE.RADIO;
                            const template =
                                (_b =
                                    (_a = group.renderParent) === null || _a === void 0
                                        ? void 0
                                        : _a.renderTemplates) === null || _b === void 0
                                    ? void 0
                                    : _b.find(item => item.node === group);
                            if (template) {
                                template.controlName = controlName;
                            }
                            setBaselineIndex(radiogroup, group, this.name);
                            return undefined;
                        }
                    }
                }
            }
            return undefined;
        }
        postBaseLayout(node) {
            node.renderEach(
                item =>
                    item.naturalElement &&
                    item.toElementBoolean('checked') &&
                    node.android('checkedButton', item.documentId)
            );
        }
    }

    const { formatPX: formatPX$b } = squared.lib.css;
    const {
        BOX_STANDARD: BOX_STANDARD$e,
        NODE_RESOURCE: NODE_RESOURCE$7,
        NODE_TEMPLATE: NODE_TEMPLATE$6,
    } = squared.base.lib.enumeration;
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
            const horizontalScroll = CONTAINER_ANDROID.HORIZONTAL_SCROLL;
            const verticalScroll =
                node.api < 29 /* Q */ ? CONTAINER_ANDROID.VERTICAL_SCROLL : CONTAINER_ANDROID_X.VERTICAL_SCROLL;
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
            if (length > 0) {
                for (let i = 0; i < length; ++i) {
                    const container = this.application.createNode(node.sessionId, { parent });
                    if (i === 0) {
                        container.inherit(node, 'base', 'initial', 'styleMap');
                        if (!parent.replaceTry({ child: node, replaceWith: container })) {
                            return undefined;
                        }
                    } else {
                        container.inherit(node, 'base');
                        container.exclude({ resource: NODE_RESOURCE$7.BOX_STYLE });
                    }
                    container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                    container.exclude({ resource: NODE_RESOURCE$7.ASSET });
                    container.resetBox(240 /* PADDING */);
                    container.childIndex = node.childIndex;
                    scrollView.push(container);
                }
                for (let i = 0; i < length; ++i) {
                    const item = scrollView[i];
                    switch (item.controlName) {
                        case verticalScroll:
                            node.setLayoutHeight('wrap_content');
                            item.setLayoutHeight(formatPX$b(node.actualHeight));
                            item.android('scrollbars', 'vertical');
                            item.cssApply({
                                width: (length === 1 && node.css('width')) || 'auto',
                                overflow: 'scroll visible',
                                overflowX: 'visible',
                                overflowY: 'scroll',
                            });
                            break;
                        case horizontalScroll:
                            node.setLayoutWidth('wrap_content');
                            item.setLayoutWidth(formatPX$b(node.actualWidth));
                            item.android('scrollbars', 'horizontal');
                            item.cssApply({
                                height: (length === 1 && node.css('height')) || 'auto',
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
                const q = children.length;
                let i = 0;
                while (i < q) {
                    const child = children[i++];
                    if (child.textElement) {
                        child.css('maxWidth', formatPX$b(boxWidth));
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
                } while (scrollView.length > 0);
                node.exclude({ resource: NODE_RESOURCE$7.BOX_STYLE });
                node.resetBox(15 /* MARGIN */, item);
                node.parent = parent;
                return { parent };
            }
            return undefined;
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
    var VECTOR_TMPL = {
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

    const { reduceRGBA } = squared.lib.color;
    const {
        extractURL: extractURL$1,
        formatPercent: formatPercent$1,
        formatPX: formatPX$c,
        getBackgroundPosition: getBackgroundPosition$2,
    } = squared.lib.css;
    const { truncate: truncate$7 } = squared.lib.math;
    const {
        delimitString,
        flatArray: flatArray$1,
        isEqual,
        plainMap: plainMap$1,
        resolvePath: resolvePath$1,
    } = squared.lib.util;
    const { BOX_STANDARD: BOX_STANDARD$f, NODE_RESOURCE: NODE_RESOURCE$8 } = squared.base.lib.enumeration;
    const NodeUI$3 = squared.base.NodeUI;
    const CHAR_SEPARATOR = /\s*,\s*/;
    function getBorderStyle(border, direction = -1, halfSize = false) {
        const { style, color } = border;
        const width = roundFloat(border.width);
        const result = getStrokeColor(color);
        switch (style) {
            case 'solid':
                break;
            case 'dotted':
                result.dashWidth = formatPX$c(width);
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
                result.dashWidth = formatPX$c(dashWidth);
                result.dashGap = formatPX$c(dashGap);
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
                        return getStrokeColor(reduced);
                    }
                }
                break;
            }
        }
        return result;
    }
    function getBorderStroke(border, direction = -1, hasInset = false, isInset = false) {
        if (border) {
            let result;
            if (isAlternatingBorder(border.style)) {
                const width = parseFloat(border.width);
                result = getBorderStyle(border, direction, !isInset);
                result.width = isInset
                    ? formatPX$c(Math.ceil(width / 2) * 2)
                    : formatPX$c(hasInset ? Math.ceil(width / 2) : roundFloat(border.width));
            } else {
                result = getBorderStyle(border);
                result.width = formatPX$c(roundFloat(border.width));
            }
            return result;
        }
        return undefined;
    }
    function getBorderRadius(radius) {
        if (radius) {
            switch (radius.length) {
                case 1:
                    return { radius: radius[0] };
                case 8: {
                    const corners = new Array(4);
                    let i = 0,
                        j = 0;
                    while (i < 8) {
                        corners[j++] = formatPX$c((parseFloat(radius[i++]) + parseFloat(radius[i++])) / 2);
                    }
                    return getCornerRadius(corners);
                }
                default:
                    return getCornerRadius(radius);
            }
        }
        return undefined;
    }
    function getCornerRadius(corners) {
        const [topLeft, topRight, bottomRight, bottomLeft] = corners;
        const result = {};
        let valid = false;
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
        return valid ? result : undefined;
    }
    function getBackgroundColor(value) {
        const color = getColorValue(value, false);
        return color !== '' ? { color } : undefined;
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
        const indentOffset = indentWidth > 0 ? formatPX$c(indentWidth) : '';
        let hideOffset = '-' + formatPX$c(borderWidth + indentWidth + 1);
        items.push({
            top: top ? indentOffset : hideOffset,
            right: right ? indentOffset : hideOffset,
            bottom: bottom ? indentOffset : hideOffset,
            left: left ? indentOffset : hideOffset,
            shape: {
                'android:shape': 'rectangle',
                stroke: Object.assign({ width: formatPX$c(borderWidth) }, getBorderStyle(border)),
                corners,
            },
        });
        const insetWidth = width - borderWidth + indentWidth;
        const drawOffset = formatPX$c(insetWidth);
        hideOffset = '-' + formatPX$c(insetWidth + 1);
        items.push({
            top: top ? drawOffset : hideOffset,
            right: right ? drawOffset : hideOffset,
            bottom: bottom ? drawOffset : hideOffset,
            left: left ? drawOffset : hideOffset,
            shape: {
                'android:shape': 'rectangle',
                stroke: Object.assign({ width: formatPX$c(borderWidth) }, getBorderStyle(border)),
                corners,
            },
        });
    }
    function checkBackgroundPosition(value, adjacent, fallback) {
        if (!value.includes(' ') && adjacent.includes(' ')) {
            return /^[a-z]+$/.test(value) ? (value === 'initial' ? fallback : value) + ' 0px' : fallback + ' ' + value;
        } else if (value === 'initial') {
            return '0px';
        }
        return value;
    }
    function createBackgroundGradient(gradient, api = 29 /* LATEST */, imageCount, borderRadius, precision) {
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
                    result.gradientRadius = formatPX$c(radius);
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
                    result.endX = truncate$7(x, precision);
                    result.endY = truncate$7(y, precision);
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
    function createLayerList(boxStyle, images = [], borderOnly = true, stroke, corners, indentOffset) {
        const item = [];
        const result = [{ 'xmlns:android': XMLNS_ANDROID.android, item }];
        const solid = !borderOnly && getBackgroundColor(boxStyle.backgroundColor);
        if (solid && !images.find(image => !!image.gradient)) {
            item.push({ shape: { 'android:shape': 'rectangle', solid, corners } });
        }
        let i = 0;
        while (i < images.length) {
            const image = images[i++];
            item.push(
                image.gradient ? { shape: { 'android:shape': 'rectangle', gradient: image.gradient, corners } } : image
            );
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
    function createShapeData(stroke, solid, corners) {
        return [
            {
                'xmlns:android': XMLNS_ANDROID.android,
                'android:shape': 'rectangle',
                stroke,
                solid,
                corners,
            },
        ];
    }
    function getIndentOffset(border) {
        const width = roundFloat(border.width);
        return width === 2 && border.style === 'double' ? 3 : width;
    }
    function getColorValue(value, transparency = true) {
        const color = Resource.addColor(value, transparency);
        return color !== '' ? `@color/${color}` : '';
    }
    function fillBackgroundAttribute(attribute, length) {
        while (attribute.length < length) {
            attribute = attribute.concat(attribute.slice(0));
        }
        attribute.length = length;
        return attribute;
    }
    function setBorderStyle(layerList, borders, index, corners, indentWidth, indentOffset) {
        const item = borders[index];
        if (item) {
            const width = roundFloat(item.width);
            if (item.style === 'double' && width > 1) {
                insertDoubleBorder(
                    layerList.item,
                    item,
                    index === 0,
                    index === 1,
                    index === 2,
                    index === 3,
                    indentWidth,
                    corners
                );
            } else {
                const inset = width > 1 && isInsetBorder(item);
                if (inset) {
                    const hideInsetOffset = '-' + formatPX$c(width + indentWidth + 1);
                    layerList.item.push({
                        top: index === 0 ? '' : hideInsetOffset,
                        right: index === 1 ? '' : hideInsetOffset,
                        bottom: index === 2 ? '' : hideInsetOffset,
                        left: index === 3 ? '' : hideInsetOffset,
                        shape: {
                            'android:shape': 'rectangle',
                            stroke: getBorderStroke(item, index, inset, true),
                        },
                    });
                }
                const hideOffset = '-' + formatPX$c((inset ? Math.ceil(width / 2) : width) + indentWidth + 1);
                layerList.item.push({
                    top: index === 0 ? indentOffset : hideOffset,
                    right: index === 1 ? indentOffset : hideOffset,
                    bottom: index === 2 ? indentOffset : hideOffset,
                    left: index === 3 ? indentOffset : hideOffset,
                    shape: {
                        'android:shape': 'rectangle',
                        corners,
                        stroke: getBorderStroke(item, index, inset),
                    },
                });
            }
        }
    }
    function deleteBodyWrapper(body, wrapper) {
        if (body !== wrapper && !wrapper.hasResource(NODE_RESOURCE$8.BOX_SPACING) && body.percentWidth === 0) {
            switch (body.cssInitial('maxWidth')) {
                case '':
                case 'auto':
                case '100%': {
                    const children = wrapper.renderChildren;
                    if (children.length === 1) {
                        wrapper.removeTry({ replaceWith: children[0] });
                    }
                    break;
                }
            }
        }
    }
    const roundFloat = value => Math.round(parseFloat(value));
    const getStrokeColor = value => ({ color: getColorValue(value), dashWidth: '', dashGap: '' });
    const isInsetBorder = border =>
        border.style === 'groove' ||
        border.style === 'ridge' ||
        (border.style === 'double' && roundFloat(border.width) > 1);
    const getPixelUnit = (width, height) => `${width}px ${height}px`;
    function convertColorStops(list, precision) {
        return plainMap$1(list, item => ({
            color: getColorValue(item.color),
            offset: truncate$7(item.offset, precision),
        }));
    }
    function drawRect(width, height, x = 0, y = 0, precision) {
        if (precision) {
            x = truncate$7(x, precision);
            y = truncate$7(y, precision);
            width = truncate$7(x + width, precision);
            height = truncate$7(y + height, precision);
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
                drawOutlineAsInsetBorder: true,
            };
            this.eventOnly = true;
        }
        beforeParseDocument() {
            this._resourceSvgInstance = this.controller.localSettings.svg.enabled
                ? this.application.builtInExtensions[EXT_ANDROID.RESOURCE_SVG]
                : undefined;
        }
        afterResources(sessionId) {
            const settings = this.application.userSettings;
            const drawOutline = this.options.drawOutlineAsInsetBorder;
            let themeBackground = false;
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
                    const drawable =
                        '@drawable/' +
                        Resource.insertStoredAsset(
                            'drawables',
                            node.containerName.toLowerCase() + '_' + node.controlId,
                            value
                        );
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
                const stored = node.data(Resource.KEY_NAME, 'boxStyle');
                if (stored) {
                    if (node.inputElement) {
                        const companion = node.companion;
                        if (
                            (companion === null || companion === void 0 ? void 0 : companion.tagName) === 'LABEL' &&
                            !companion.visible
                        ) {
                            const backgroundColor =
                                (_a = companion.data(Resource.KEY_NAME, 'boxStyle')) === null || _a === void 0
                                    ? void 0
                                    : _a.backgroundColor;
                            if (backgroundColor) {
                                stored.backgroundColor = backgroundColor;
                            }
                        }
                    }
                    const images = this.getDrawableImages(node, stored);
                    if (
                        node.controlName === CONTAINER_ANDROID.BUTTON &&
                        ((_b = stored.borderRadius) === null || _b === void 0 ? void 0 : _b.length) === 1 &&
                        (images === null || images === void 0
                            ? void 0
                            : images.some(item => item.vectorGradient === true)) &&
                        node.api >= 28 /* PIE */
                    ) {
                        node.android('buttonCornerRadius', stored.borderRadius[0]);
                        stored.borderRadius = undefined;
                    }
                    const outline = stored.outline;
                    let [shapeData, layerList] = this.getDrawableBorder(
                        stored,
                        undefined,
                        images,
                        drawOutline && outline ? getIndentOffset(outline) : 0
                    );
                    const emptyBackground = shapeData === undefined && layerList === undefined;
                    if (outline && (drawOutline || emptyBackground)) {
                        const [outlineShapeData, outlineLayerList] = this.getDrawableBorder(
                            stored,
                            outline,
                            emptyBackground ? images : undefined,
                            undefined,
                            !emptyBackground
                        );
                        if (outlineShapeData) {
                            if (!shapeData) {
                                shapeData = outlineShapeData;
                            }
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
        getDrawableBorder(data, outline, images, indentWidth = 0, borderOnly = false) {
            const borderVisible = new Array(4);
            const corners = !borderOnly ? getBorderRadius(data.borderRadius) : undefined;
            const indentOffset = indentWidth > 0 ? formatPX$c(indentWidth) : '';
            let borderStyle = true,
                borderAll = true,
                borders,
                border,
                borderData,
                shapeData,
                layerList;
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
                (!borderData && (corners || (images === null || images === void 0 ? void 0 : images.length)))
            ) {
                const stroke = border ? getBorderStroke(border) : false;
                if ((images === null || images === void 0 ? void 0 : images.length) || indentWidth > 0 || borderOnly) {
                    layerList = createLayerList(data, images, borderOnly, stroke, corners, indentOffset);
                } else {
                    shapeData = createShapeData(
                        stroke,
                        !borderOnly && getBackgroundColor(data.backgroundColor),
                        corners
                    );
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
                        const hideOffset = '-' + formatPX$c(width + indentWidth + 1);
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
        getDrawableImages(node, data) {
            var _a;
            const backgroundImage = data.backgroundImage;
            const embedded = node.data(Resource.KEY_NAME, 'embedded');
            if (backgroundImage || embedded) {
                const resource = this.resource;
                const screenDimension = node.localSettings.screenDimension;
                const { bounds, fontSize } = node;
                const { width: boundsWidth, height: boundsHeight } = bounds;
                const result = [];
                const images = [];
                const svg = [];
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
                    backgroundRepeat = fillBackgroundAttribute(backgroundRepeat, q);
                    backgroundSize = fillBackgroundAttribute(backgroundSize, q);
                    let modified = false;
                    for (let i = 0; i < q; ++i) {
                        let value = backgroundImage[i],
                            valid = false;
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
                                            if (rawData === null || rawData === void 0 ? void 0 : rawData.base64) {
                                                const filename = rawData.filename;
                                                if (filename) {
                                                    images[length] = filename.substring(0, filename.lastIndexOf('.'));
                                                    imageDimensions[length] =
                                                        rawData.width && rawData.height ? rawData : undefined;
                                                    resource.writeRawImage(rawData.mimeType, {
                                                        filename,
                                                        data: rawData.base64,
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
                            backgroundPosition[length] = getBackgroundPosition$2(
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
                            backgroundRepeat[i] = undefined;
                            backgroundSize[i] = undefined;
                            modified = true;
                        }
                    }
                    if (modified) {
                        backgroundRepeat = flatArray$1(backgroundRepeat);
                        backgroundSize = flatArray$1(backgroundSize);
                    }
                }
                if (embedded) {
                    if (length === 0) {
                        backgroundRepeat.length = 0;
                        backgroundSize.length = 0;
                    }
                    for (const image of embedded.filter(
                        item => item.visible && (item.imageElement || item.containerName === 'INPUT_IMAGE')
                    )) {
                        const element = image.element;
                        const src = resource.addImageSrc(element);
                        if (src !== '') {
                            const imageDimension = image.bounds;
                            images[length] = src;
                            backgroundRepeat[length] = 'no-repeat';
                            backgroundSize[length] = getPixelUnit(image.actualWidth, image.actualHeight);
                            const position = getBackgroundPosition$2(
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
                const documentBody = node.innerMostWrapped.documentBody;
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
                        dimension = imageDimensions[i],
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
                        offsetX = false,
                        offsetY = false;
                    if (dimension) {
                        if (!dimension.width || !dimension.height) {
                            dimension = undefined;
                        } else {
                            dimenWidth = dimension.width;
                            dimenHeight = dimension.height;
                        }
                    }
                    if (repeat.includes(' ')) {
                        const [x, y] = repeat.split(' ');
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
                            if (node.ascend({ condition: item => item.hasPX('width'), startSelf: true }).length > 0) {
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
                    let resizedWidth = false,
                        resizedHeight = false,
                        unsizedWidth = false,
                        unsizedHeight = false,
                        recalibrate = true;
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
                                        ({ width: fittedWidth, height: fittedHeight } = NodeUI$3.refitScreen(
                                            node,
                                            bounds
                                        ));
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
                                            node.css(attr, formatPX$c(boundsHeight - node.contentBoxHeight));
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
                                if (width === 0 && height > 0) {
                                    width = getImageWidth();
                                }
                                if (height === 0 && width > 0) {
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
                        case SUPPORT_ANDROID.TOOLBAR:
                        case SUPPORT_ANDROID_X.TOOLBAR:
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
                                    if (width > 0 && !unsizedWidth) {
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
                                case 'start':
                                case 'left':
                                    if (!isNaN(posLeft)) {
                                        tileModeY = '';
                                    }
                                    gravityX = '';
                                    break;
                                case 'center_horizontal':
                                    if (node.renderChildren.length > 0) {
                                        tileModeY = '';
                                    }
                                    break;
                                case 'right':
                                case 'end':
                                    if (height > 0 && !unsizedHeight) {
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
                            width =
                                (dimension === null || dimension === void 0 ? void 0 : dimension.width) ||
                                NodeUI$3.refitScreen(node, node.actualDimension).width;
                        }
                        if (height === 0) {
                            height =
                                (dimension === null || dimension === void 0 ? void 0 : dimension.height) ||
                                NodeUI$3.refitScreen(node, node.actualDimension).height;
                        }
                        const gradient = Resource.insertStoredAsset(
                            'drawables',
                            `${node.controlId}_gradient_${i + 1}`,
                            applyTemplate('vector', VECTOR_TMPL, [
                                {
                                    'xmlns:android': XMLNS_ANDROID.android,
                                    'xmlns:aapt': XMLNS_ANDROID.aapt,
                                    'android:width': formatPX$c(width),
                                    'android:height': formatPX$c(height),
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
                                    imageData.bottom = formatPX$c(bottom);
                                }
                                if (negativeOffset < 0) {
                                    imageData.top = formatPX$c(negativeOffset);
                                }
                            } else {
                                if (offsetY) {
                                    top += position.top;
                                }
                                if (!isNaN(posTop)) {
                                    top += posTop;
                                }
                                if (top !== 0) {
                                    imageData.top = formatPX$c(top);
                                }
                                if (negativeOffset < 0) {
                                    imageData.bottom = formatPX$c(negativeOffset);
                                }
                            }
                            if (!isNaN(posRight)) {
                                if (offsetX) {
                                    right += position.right;
                                }
                                right += posRight;
                                if (right !== 0) {
                                    imageData[node.localizeString('right')] = formatPX$c(right);
                                }
                                if (negativeOffset < 0) {
                                    imageData[node.localizeString('left')] = formatPX$c(negativeOffset);
                                }
                            } else {
                                if (offsetX) {
                                    left += position.left;
                                }
                                if (!isNaN(posLeft)) {
                                    left += posLeft;
                                }
                                if (left !== 0) {
                                    imageData[node.localizeString('left')] = formatPX$c(left);
                                }
                                if (negativeOffset < 0) {
                                    imageData[node.localizeString('right')] = formatPX$c(negativeOffset);
                                }
                            }
                            if (width > 0) {
                                imageData.width = formatPX$c(width);
                            }
                            if (height > 0) {
                                imageData.height = formatPX$c(height);
                            }
                            result.push(imageData);
                        }
                    }
                }
                return result.sort((a, b) => {
                    const orderA = a.order;
                    const orderB = b.order;
                    if (orderA === orderB) {
                        return 0;
                    }
                    return orderA < orderB ? -1 : 1;
                });
            }
            return undefined;
        }
    }

    const { capitalize: capitalize$3 } = squared.lib.util;
    class ResourceData extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade(rendered, documentRoot) {
            const viewModel = this.application.viewModel;
            if (viewModel) {
                const controller = this.controller;
                const applied = new Set();
                const length = rendered.length;
                let i = 0;
                while (i < length) {
                    const node = rendered[i++];
                    if (node.styleElement && node.visible) {
                        for (const [name] of node.namespaces()) {
                            const dataset = getDataSet(node.dataset, `viewmodel${capitalize$3(name)}`);
                            if (dataset) {
                                for (const attr in dataset) {
                                    node.attr(name, attr, `@{${dataset[attr]}}`, true);
                                }
                                applied.add(node);
                            }
                        }
                    }
                }
                if (applied.size > 0) {
                    i = 0;
                    while (i < documentRoot.length) {
                        const node = documentRoot[i++].node;
                        for (const child of applied) {
                            if (child.ascend({ condition: item => item === node, attr: 'renderParent' }).length > 0) {
                                const { import: importing, variable } = viewModel;
                                const { depth, id } = node;
                                const indentA = '\t'.repeat(depth);
                                const indentB = '\t'.repeat(depth + 1);
                                const indentC = '\t'.repeat(depth + 2);
                                let output = indentA + '<layout {#0}>\n' + indentB + '<data>\n';
                                if (importing) {
                                    let j = 0;
                                    while (j < importing.length) {
                                        output += indentC + `<import type="${importing[j++]}" />\n`;
                                    }
                                }
                                if (variable) {
                                    let j = 0;
                                    while (j < variable.length) {
                                        const { name, type } = variable[j++];
                                        output += indentC + `<variable name="${name}" type="${type}" />\n`;
                                    }
                                }
                                output += indentB + '</data>\n';
                                controller.addBeforeOutsideTemplate(id, output);
                                controller.addAfterOutsideTemplate(id, indentA + '</layout>\n');
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

    const {
        convertUnderscore,
        fromLastIndexOf: fromLastIndexOf$3,
        safeNestedArray: safeNestedArray$3,
        safeNestedMap,
    } = squared.lib.util;
    function getResourceName(map, name, value) {
        if (map.get(name) === value) {
            return name;
        }
        for (const [storedName, storedValue] of map.entries()) {
            if (value === storedValue && storedName.startsWith(name)) {
                return storedName;
            }
        }
        return Resource.generateId('dimen', name);
    }
    function createNamespaceData(namespace, node, group) {
        const obj = node.namespace(namespace);
        for (const attr in obj) {
            if (attr !== 'text') {
                const value = obj[attr];
                if (/\dpx$/.test(value)) {
                    safeNestedArray$3(group, `${namespace},${attr},${value}`).push(node);
                }
            }
        }
    }
    class ResourceDimens extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade(rendered) {
            const dimens = Resource.STORED.dimens;
            const groups = {};
            const length = rendered.length;
            let i = 0;
            while (i < length) {
                const node = rendered[i++];
                if (node.visible) {
                    const containerName = node.containerName.toLowerCase();
                    const group = safeNestedMap(groups, containerName);
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
                        fromLastIndexOf$3(containerName, '.') + '_' + convertUnderscore(attr),
                        value
                    );
                    for (const node of group[name]) {
                        node.attr(namespace, attr, `@dimen/${key}`);
                    }
                    dimens.set(key, value);
                }
            }
        }
        afterFinalize() {
            if (this.controller.hasAppendProcessing()) {
                const dimens = Resource.STORED.dimens;
                const layouts = this.application.layouts;
                let i = 0;
                while (i < layouts.length) {
                    const layout = layouts[i++];
                    const pattern = /:(\w+)="(-?[\d.]+px)"/g;
                    let content = layout.content,
                        match;
                    while ((match = pattern.exec(layout.content))) {
                        const [original, name, value] = match;
                        if (name !== 'text') {
                            const key = getResourceName(dimens, `custom_${convertUnderscore(name)}`, value);
                            content = content.replace(original, original.replace(value, `@dimen/${key}`));
                            dimens.set(key, value);
                        }
                    }
                    layout.content = content;
                }
            }
        }
    }

    const {
        capitalize: capitalize$4,
        convertInt: convertInt$3,
        convertWord: convertWord$2,
        hasKeys: hasKeys$1,
        plainMap: plainMap$2,
        safeNestedArray: safeNestedArray$4,
        safeNestedMap: safeNestedMap$1,
        spliceArray: spliceArray$1,
        trimBoth,
    } = squared.lib.util;
    const { NODE_RESOURCE: NODE_RESOURCE$9 } = squared.base.lib.enumeration;
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
        'sans-serif-condensed-medium': 26 /* OREO */,
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
        'courier new': 'serif-monospace',
    };
    const FONTREPLACE_ANDROID = {
        'arial black': 'sans-serif',
        'ms shell dlg \\32': 'sans-serif',
        'system-ui': 'sans-serif',
        '-apple-system': 'sans-serif',
        '-webkit-standard': 'sans-serif',
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
    function deleteStyleAttribute(sorted, attrs, ids) {
        const items = attrs.split(';');
        const length = items.length;
        const q = sorted.length;
        let i = 0,
            j;
        while (i < length) {
            const value = items[i++];
            found: {
                j = 0;
                while (j < q) {
                    const data = sorted[j++];
                    for (const attr in data) {
                        if (attr === value) {
                            data[attr] = data[attr].filter(id => !ids.includes(id));
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
                systemDefaultFont: 'sans-serif',
                disableFontAlias: false,
            };
            this.eventOnly = true;
        }
        afterParseDocument(sessionId) {
            const resource = this.resource;
            const userSettings = resource.userSettings;
            const disableFontAlias = this.options.disableFontAlias;
            const api = userSettings.targetAPI;
            const convertPixels = userSettings.convertPixels === 'dp';
            const { fonts, styles } = resource.mapOfStored;
            const styleKeys = Object.keys(FONT_STYLE);
            const nameMap = {};
            const groupMap = {};
            let cache = [];
            this.application.getProcessingCache(sessionId).each(node => {
                if (node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource(NODE_RESOURCE$9.FONT_STYLE)) {
                    safeNestedArray$4(nameMap, node.containerName).push(node);
                }
            });
            for (const tag in nameMap) {
                const sorted = [];
                const data = nameMap[tag];
                cache = cache.concat(data);
                const length = data.length;
                let i = 0;
                while (i < length) {
                    let node = data[i++];
                    const stored = node.data(Resource.KEY_NAME, 'fontStyle');
                    const { id, companion } = node;
                    let { fontFamily, fontStyle, fontWeight } = stored;
                    if (
                        (companion === null || companion === void 0 ? void 0 : companion.tagName) === 'LABEL' &&
                        !companion.visible
                    ) {
                        node = companion;
                    }
                    fontFamily
                        .replace(/"/g, '')
                        .split(',')
                        .some((value, index, array) => {
                            value = trimBoth(value.trim(), "'").toLowerCase();
                            let fontName = value,
                                actualFontWeight = '';
                            if (!disableFontAlias && FONTREPLACE_ANDROID[fontName]) {
                                fontName = this.options.systemDefaultFont;
                            }
                            if (
                                api >= FONT_ANDROID[fontName] ||
                                (!disableFontAlias && api >= FONT_ANDROID[FONTALIAS_ANDROID[fontName]])
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
                                        fontFamily = this.options.systemDefaultFont;
                                    }
                                }
                                if (createFont) {
                                    fontName = convertWord$2(fontName);
                                    const font = fonts.get(fontName) || {};
                                    font[value + '|' + fontStyle + '|' + fontWeight] =
                                        FONTWEIGHT_ANDROID[fontWeight] || fontWeight;
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
                    const fontData = {
                        fontFamily,
                        fontStyle,
                        fontWeight,
                        fontSize: stored.fontSize,
                        color: Resource.addColor(stored.color),
                        backgroundColor: Resource.addColor(stored.backgroundColor, node.inputElement),
                    };
                    for (let j = 0; j < 6; ++j) {
                        const key = styleKeys[j];
                        let value = fontData[key];
                        if (value) {
                            if (j === 3 && convertPixels) {
                                value = convertLength(value, true);
                            }
                            safeNestedArray$4(safeNestedMap$1(sorted, j), FONT_STYLE[key] + value + '"').push(id);
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
                    .filter(item => !!item)
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
                            return maxA > maxB ? -1 : 1;
                        } else if (countA !== countB) {
                            return countA > countB ? -1 : 1;
                        }
                        return 0;
                    });
                do {
                    const length = sorted.length;
                    if (length === 1) {
                        const data = sorted[0];
                        for (const attr in data) {
                            const item = data[attr];
                            if (item.length > 0) {
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
                                let merged = false;
                                for (let j = 0; j < length; ++j) {
                                    if (i !== j) {
                                        const dataB = sorted[j];
                                        for (const attr in dataB) {
                                            const compare = dataB[attr];
                                            if (compare.length > 0) {
                                                const q = ids.length;
                                                let k = 0;
                                                while (k < q) {
                                                    const id = ids[k++];
                                                    if (compare.includes(id)) {
                                                        safeNestedArray$4(found, attr).push(id);
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
                                const joinArray = {};
                                for (const attr in filtered) {
                                    joinArray[attr] = filtered[attr].join(',');
                                }
                                for (const attrA in filtered) {
                                    for (const attrB in filtered) {
                                        const index = joinArray[attrA];
                                        if (attrA !== attrB && index === joinArray[attrB]) {
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
                                    deleteStyleAttribute(sorted, attr, filtered[attr]);
                                    styleTag[attr] = filtered[attr];
                                }
                                for (const attr in combined) {
                                    const attrs = Array.from(combined[attr]).sort().join(';');
                                    const ids = plainMap$2(attr.split(','), value => parseInt(value));
                                    deleteStyleAttribute(sorted, attrs, ids);
                                    styleTag[attrs] = ids;
                                }
                            }
                        }
                        const shared = Object.keys(styleKey);
                        if (shared.length > 0) {
                            styleTag[shared.join(';')] = styleKey[shared[0]];
                        }
                        spliceArray$1(sorted, item => {
                            for (const attr in item) {
                                if (item[attr].length > 0) {
                                    return false;
                                }
                            }
                            return true;
                        });
                    }
                } while (sorted.length > 0);
            }
            const resourceMap = {};
            const nodeMap = {};
            const parentStyle = new Set();
            for (const tag in style) {
                const styleTag = style[tag];
                const styleData = [];
                for (const attrs in styleTag) {
                    const items = [];
                    for (const value of attrs.split(';')) {
                        const match = /([^\s]+)="((?:[^"]|\\")+)"/.exec(value);
                        if (match) {
                            items.push({ key: match[1], value: match[2] });
                        }
                    }
                    styleData.push({
                        name: '',
                        parent: '',
                        items,
                        ids: styleTag[attrs],
                    });
                }
                styleData.sort((a, b) => {
                    let c = a.ids.length,
                        d = b.ids.length;
                    if (c === d) {
                        c = a.items.length;
                        d = b.items.length;
                        if (c === d) {
                            c = a.name;
                            d = b.name;
                        }
                    }
                    return c <= d ? 1 : -1;
                });
                for (let i = 0; i < styleData.length; ++i) {
                    styleData[i].name = capitalize$4(tag) + (i > 0 ? '_' + i : '');
                }
                resourceMap[tag] = styleData;
            }
            for (const tag in resourceMap) {
                for (const group of resourceMap[tag]) {
                    const ids = group.ids;
                    if (ids) {
                        const length = ids.length;
                        let i = 0;
                        while (i < length) {
                            safeNestedArray$4(nodeMap, ids[i++]).push(group.name);
                        }
                    }
                }
            }
            const length = cache.length;
            let i = 0;
            while (i < length) {
                const node = cache[i++];
                const styleData = nodeMap[node.id];
                if (styleData) {
                    if (styleData.length > 1) {
                        parentStyle.add(styleData.join('.'));
                        styleData.shift();
                    } else {
                        parentStyle.add(styleData[0]);
                    }
                    node.attr('_', 'style', `@style/${styleData.join('.')}`);
                }
            }
            for (const value of parentStyle) {
                const styleName = [];
                const values = value.split('.');
                let parent = '',
                    items;
                const q = values.length;
                for (i = 0; i < q; ++i) {
                    const name = values[i];
                    const match = /^(\w*?)(?:_(\d+))?$/.exec(name);
                    if (match) {
                        const styleData = resourceMap[match[1].toUpperCase()][convertInt$3(match[2])];
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
                                    const r = styleItems.length;
                                    let j = 0;
                                    while (j < r) {
                                        const item = styleItems[j++];
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
                        const name = styleName.join('.');
                        styles.set(name, { name, parent, items });
                    }
                }
            }
        }
    }

    const { NODE_TEMPLATE: NODE_TEMPLATE$7 } = squared.base.lib.enumeration;
    class ResourceIncludes extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade(rendered) {
            const length = rendered.length;
            let i = 0;
            while (i < length) {
                const node = rendered[i++];
                const renderTemplates = node.renderTemplates;
                if (renderTemplates) {
                    let open, close;
                    node.renderEach((item, index) => {
                        const dataset = item.dataset;
                        const name = dataset.androidInclude;
                        const closing = dataset.androidIncludeEnd === 'true';
                        if (name || closing) {
                            if (item.documentRoot) {
                                return;
                            }
                            const data = {
                                item,
                                name,
                                index,
                                include: dataset.androidIncludeMerge === 'false',
                            };
                            if (name) {
                                if (!open) {
                                    open = [];
                                }
                                open.push(data);
                            }
                            if (closing) {
                                if (!close) {
                                    close = [];
                                }
                                close.push(data);
                            }
                        }
                    });
                    if (open && close) {
                        const application = this.application;
                        const controller = this.controller;
                        const q = Math.min(open.length, close.length);
                        const excess = close.length - q;
                        if (excess > 0) {
                            close.splice(0, excess);
                        }
                        let j = q - 1;
                        while (j >= 0) {
                            const { index, include, item, name } = open[j--];
                            for (let k = 0; k < close.length; ++k) {
                                const r = close[k].index;
                                if (r >= index) {
                                    const templates = [];
                                    let l = index;
                                    while (l <= r) {
                                        templates.push(renderTemplates[l++]);
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
                                    let content = controller.cascadeDocument(templates, depth);
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

    const { isPercent: isPercent$5, parseAngle } = squared.lib.css;
    const { measureTextWidth } = squared.lib.dom;
    const { clamp: clamp$1 } = squared.lib.math;
    const { capitalizeString, delimitString: delimitString$1, lowerCaseString } = squared.lib.util;
    const { NODE_RESOURCE: NODE_RESOURCE$a } = squared.base.lib.enumeration;
    function getFontVariationStyle(value) {
        if (value === 'italic') {
            return "'ital' 1";
        }
        const match = /oblique(?:\s+(-?[\d.]+[a-z]+))?/.exec(value);
        if (match) {
            let angle;
            if (match[1]) {
                angle = parseAngle(match[1]);
            }
            return `'slnt' ${angle !== undefined && !isNaN(angle) ? clamp$1(angle, -90, 90) : '14'}`;
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
                numberResourceValue: false,
            };
            this.eventOnly = true;
        }
        afterResources(sessionId) {
            const numberResourceValue = this.options.numberResourceValue;
            this.application.getProcessingCache(sessionId).each(node => {
                if (node.hasResource(NODE_RESOURCE$a.VALUE_STRING)) {
                    if (node.styleElement) {
                        const title = node.data(Resource.KEY_NAME, 'titleString') || node.toElementString('title');
                        if (title !== '') {
                            setTextValue(
                                node,
                                'tooltipText',
                                Resource.addString(
                                    replaceCharacterData(title),
                                    `${node.controlId.toLowerCase()}_title`,
                                    numberResourceValue
                                )
                            );
                        }
                    }
                    if (node.inputElement) {
                        if (node.controlName === CONTAINER_ANDROID.EDIT_LIST) {
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
                                    numberResourceValue
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
                                let indent = 0;
                                if (node.blockDimension || node.display === 'table-cell') {
                                    const textIndent = node.css('textIndent');
                                    indent = node.parseUnit(textIndent);
                                    if (textIndent === '100%' || indent + node.bounds.width < 0) {
                                        node.delete('android', 'ellipsize', 'maxLines');
                                        return;
                                    }
                                }
                                if (
                                    node.naturalChild &&
                                    node.alignParent('left') &&
                                    node.pageFlow &&
                                    !(
                                        (node.preserveWhiteSpace && !node.plainText) ||
                                        (node.plainText && node.actualParent.preserveWhiteSpace)
                                    )
                                ) {
                                    const textContent = node.textContent;
                                    const length = textContent.length;
                                    let i = 0,
                                        j = 0;
                                    while (i < length) {
                                        switch (textContent.charCodeAt(i++)) {
                                            case 9:
                                            case 10:
                                            case 32:
                                                ++j;
                                                continue;
                                        }
                                        break;
                                    }
                                    if (j > 0) {
                                        valueString = valueString.replace(new RegExp(`^(\\s|&#160;){1,${j}}`), '');
                                    }
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
                                        valueString = capitalizeString(valueString);
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
                                if (indent === 0) {
                                    const parent = node.actualParent;
                                    if (
                                        (parent === null || parent === void 0 ? void 0 : parent.firstChild) === node &&
                                        (parent.blockDimension || parent.display === 'table-cell')
                                    ) {
                                        indent = parent.parseUnit(parent.css('textIndent'));
                                    }
                                }
                                if (indent > 0) {
                                    const width =
                                        measureTextWidth(' ', node.css('fontFamily'), node.fontSize) ||
                                        node.fontSize / 2;
                                    valueString =
                                        Resource.STRING_SPACE.repeat(Math.max(Math.floor(indent / width), 1)) +
                                        valueString;
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
                                    if (isPercent$5(percent)) {
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
                                setTextValue(node, 'text', Resource.addString(valueString, '', numberResourceValue));
                            }
                        }
                    }
                }
            });
        }
        createOptionArray(element, controlId) {
            const [stringArray, numberArray] = Resource.getOptionArray(element);
            const numberResourceValue = this.options.numberResourceValue;
            let result;
            if (!numberResourceValue && numberArray) {
                result = numberArray;
            } else {
                const resourceArray = stringArray || numberArray;
                if (resourceArray) {
                    result = [];
                    const length = resourceArray.length;
                    let i = 0;
                    while (i < length) {
                        const value = Resource.addString(
                            replaceCharacterData(resourceArray[i++]),
                            '',
                            numberResourceValue
                        );
                        if (value !== '') {
                            result.push(value);
                        }
                    }
                }
            }
            return (result === null || result === void 0 ? void 0 : result.length)
                ? Resource.insertStoredAsset('arrays', `${controlId}_array`, result)
                : '';
        }
    }

    const { capitalize: capitalize$5 } = squared.lib.util;
    class ResourceStyles extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade(rendered) {
            const STORED = this.resource.mapOfStored;
            const length = rendered.length;
            let i = 0;
            while (i < length) {
                const node = rendered[i++];
                if (node.controlId && node.visible) {
                    const renderChildren = node.renderChildren;
                    const q = renderChildren.length;
                    if (q > 1) {
                        const attrMap = {};
                        let style = '';
                        let j = 0,
                            k;
                        while (j < q) {
                            const item = renderChildren[j++];
                            const combined = item.combine('_', 'android');
                            let found = false;
                            const r = combined.length;
                            k = 0;
                            while (k < r) {
                                const value = combined[k++];
                                if (!found && value.startsWith('style=')) {
                                    if (j === 0) {
                                        style = value;
                                    } else if (style === '' || value !== style) {
                                        return;
                                    }
                                    found = true;
                                } else {
                                    attrMap[value] = (attrMap[value] || 0) + 1;
                                }
                            }
                            if (!found && style !== '') {
                                return;
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
                            if (style !== '') {
                                style = style.substring(style.indexOf('/') + 1, style.length - 1);
                            }
                            const items = [];
                            const attrs = [];
                            j = 0;
                            while (j < r) {
                                const match = /(\w+:(\w+))="([^"]+)"/.exec(keys[j++]);
                                if (match) {
                                    items.push({ key: match[1], value: match[3] });
                                    attrs.push(match[2]);
                                }
                            }
                            const name = (style !== '' ? style + '.' : '') + capitalize$5(node.controlId);
                            if (!STORED.styles.has(name)) {
                                items.sort((a, b) => (a.key < b.key ? -1 : 1));
                                STORED.styles.set(name, Object.assign(createStyleAttribute(), { name, items }));
                            }
                            j = 0;
                            while (j < q) {
                                const item = renderChildren[j++];
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
    const { extractURL: extractURL$2, formatPX: formatPX$d, isPercent: isPercent$6 } = squared.lib.css;
    const { truncate: truncate$8 } = squared.lib.math;
    const { FILE: FILE$1 } = squared.lib.regex;
    const {
        convertCamelCase: convertCamelCase$1,
        convertInt: convertInt$4,
        convertWord: convertWord$3,
        formatString,
        hasKeys: hasKeys$2,
        isArray: isArray$1,
        isNumber: isNumber$2,
        partitionArray: partitionArray$1,
        plainMap: plainMap$3,
        replaceMap: replaceMap$1,
    } = squared.lib.util;
    const { KEYSPLINE_NAME, SYNCHRONIZE_MODE } = squared.svg.lib.constant;
    const { MATRIX, SVG, TRANSFORM, getAttribute, getRootOffset } = squared.svg.lib.util;
    const NodeUI$4 = squared.base.NodeUI;
    const INTERPOLATOR_ANDROID = {
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
        Object.assign(INTERPOLATOR_ANDROID, {
            [KEYSPLINE_NAME['ease-in']]: INTERPOLATOR_ANDROID.accelerate,
            [KEYSPLINE_NAME['ease-out']]: INTERPOLATOR_ANDROID.decelerate,
            [KEYSPLINE_NAME['ease-in-out']]: INTERPOLATOR_ANDROID.accelerate_decelerate,
            [KEYSPLINE_NAME['linear']]: INTERPOLATOR_ANDROID.linear,
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
        'clip-path': ['pathData'],
    };
    function getPathInterpolator(keySplines, index) {
        const name = keySplines === null || keySplines === void 0 ? void 0 : keySplines[index];
        return name ? INTERPOLATOR_ANDROID[name] || createPathInterpolator(name) : '';
    }
    function getPaintAttribute(value) {
        for (const attr in ATTRIBUTE_ANDROID) {
            if (ATTRIBUTE_ANDROID[attr].includes(value)) {
                return convertCamelCase$1(attr);
            }
        }
        return '';
    }
    function createPathInterpolator(value) {
        const interpolator = INTERPOLATOR_ANDROID[value];
        if (interpolator) {
            return interpolator;
        }
        const STORED = Resource.STORED;
        const name = `path_interpolator_${convertWord$3(value)}`;
        if (!STORED.animators.has(name)) {
            STORED.animators.set(name, formatString(INTERPOLATOR_XML, ...value.split(/\s+/)));
        }
        return `@anim/${name}`;
    }
    function createTransformData(transform) {
        const result = {};
        const length = transform.length;
        let i = 0;
        while (i < length) {
            const { matrix, origin, angle, type } = transform[i++];
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
        while (current !== undefined) {
            const opacity = parseFloat(current['opacity'] || '1');
            if (!isNaN(opacity) && opacity < 1) {
                value *= opacity;
            }
            current = current.parent;
        }
        return value;
    }
    function residualHandler(element, transforms, rx = 1, ry = 1) {
        if (
            (SVG.circle(element) || SVG.ellipse(element)) &&
            transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE)
        ) {
            if (
                rx !== ry ||
                (transforms.length > 1 &&
                    transforms.some(
                        item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d
                    ))
            ) {
                return groupTransforms(element, transforms);
            }
        }
        return [[], transforms];
    }
    function groupTransforms(element, transforms, ignoreClient = false) {
        if (transforms.length > 0) {
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
            const length = items.length;
            let i = 0;
            while (i < length) {
                const item = items[i++];
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
                        while (rotateOrigin.length > 0) {
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
                        if (current.length > 0) {
                            restart();
                        }
                        current.push(item);
                        break;
                }
            }
            if (current.length > 0) {
                host.push(current);
            }
            return [host.reverse(), client];
        }
        return [[], transforms];
    }
    function getPropertyValue(values, index, propertyIndex, keyFrames, baseValue) {
        const property = values[index];
        let value;
        if (property) {
            value = Array.isArray(property) ? property[propertyIndex].toString() : property;
        } else if (!keyFrames && index === 0) {
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
        let result = ATTRIBUTE_ANDROID[value];
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
        return undefined;
    }
    function getTransformValues(item) {
        switch (item.type) {
            case SVGTransform.SVG_TRANSFORM_ROTATE:
                return SvgAnimateTransform.toRotateList(item.values);
            case SVGTransform.SVG_TRANSFORM_SCALE:
                return SvgAnimateTransform.toScaleList(item.values);
            case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                return SvgAnimateTransform.toTranslateList(item.values);
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
    function getColorValue$1(value, asArray) {
        const colorName = '@color/' + Resource.addColor(value);
        return asArray ? [colorName] : colorName;
    }
    function convertValueType(item, value) {
        return isColorType(item.attributeName) ? getColorValue$1(value) : value.trim() || undefined;
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
        const { colorStops, type } = gradient;
        const result = { type, item: convertColorStops(colorStops, precision), positioning: false };
        switch (type) {
            case 'radial': {
                const { cxAsString, cyAsString, rAsString, spreadMethod } = gradient;
                const element = path.element;
                let points = [],
                    cx,
                    cy,
                    cxDiameter,
                    cyDiameter;
                switch (element.tagName) {
                    case 'path':
                        for (const command of SvgBuild.getPathCommands(path.value)) {
                            points = points.concat(command.value);
                        }
                    case 'polygon':
                        if (SVG.polygon(element)) {
                            points = points.concat(SvgBuild.clonePoints(element.points));
                        }
                        if (points.length === 0) {
                            return undefined;
                        }
                        ({ left: cx, top: cy, right: cxDiameter, bottom: cyDiameter } = SvgBuild.minMaxPoints(points));
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
                            return undefined;
                        }
                        break;
                }
                result.centerX = (cx + cxDiameter * getRadiusPercent(cxAsString)).toString();
                result.centerY = (cy + cyDiameter * getRadiusPercent(cyAsString)).toString();
                result.gradientRadius = (
                    ((cxDiameter + cyDiameter) / 2) *
                    (isPercent$6(rAsString) ? parseFloat(rAsString) / 100 : 1)
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
        if (length > 0) {
            let modified = false;
            if (length > 1 && templateSet.every(item => item.ordering === '')) {
                const setData = {
                    set: [],
                    objectAnimator: [],
                };
                let i = 0;
                while (i < length) {
                    const item = templateSet[i++];
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
            targetSetTemplate['xmlns:android'] = XMLNS_ANDROID.android;
            if (modified) {
                targetSetTemplate['android:ordering'] = targetSetTemplate.ordering;
                targetSetTemplate.ordering = undefined;
            }
            const targetData = {
                name,
                animation: Resource.insertStoredAsset(
                    'animators',
                    getTemplateFilename(templateName, imageLength, 'anim', name),
                    applyTemplate('set', SET_TMPL, [targetSetTemplate])
                ),
            };
            if (targetData.animation !== '') {
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
            valueFrom: isNumber$2(valueFrom) ? truncate$8(valueFrom, precision) : valueFrom,
            valueTo: isNumber$2(valueTo) ? truncate$8(valueTo, precision) : valueTo,
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
                                valueTo =
                                    propertyName === 'pathData' ? path.value : path[getPaintAttribute(propertyName)];
                            }
                        }
                    }
                }
                if (!valueTo) {
                    valueTo = item.baseValue;
                }
            }
            let previousValue;
            if (propertyValues === null || propertyValues === void 0 ? void 0 : propertyValues.length) {
                const lastValue = propertyValues[propertyValues.length - 1];
                if (isArray$1(lastValue.propertyValuesHolder)) {
                    const propertyValue = lastValue.propertyValuesHolder[lastValue.propertyValuesHolder.length - 1];
                    previousValue = propertyValue.keyframe[propertyValue.keyframe.length - 1].value;
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
                if (propertyName.endsWith('X')) {
                    afterAnimator.push(createPropertyValue('translateX', valueType, '0', '1', precision));
                } else if (propertyName.endsWith('Y')) {
                    afterAnimator.push(createPropertyValue('translateY', valueType, '0', '1', precision));
                }
            }
        }
    }
    const getTemplateFilename = (templateName, length, prefix, suffix) =>
        templateName +
        (prefix ? '_' + prefix : '') +
        (length ? '_vector' : '') +
        (suffix ? '_' + suffix.toLowerCase() : '');
    const isColorType = attr => attr === 'fill' || attr === 'stroke';
    const getVectorName = (target, section, index = -1) =>
        target.name + '_' + section + (index !== -1 ? '_' + (index + 1) : '');
    const getRadiusPercent = value => (isPercent$6(value) ? parseFloat(value) / 100 : 0.5);
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
                floatPrecisionValue: 3,
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
                SvgBuild.resetNameCache();
                this.controller.localSettings.svg.enabled = true;
            }
        }
        afterResources(sessionId) {
            if (SvgBuild) {
                const contentMap = {};
                for (const [uri, data] of Resource.ASSETS.rawData.entries()) {
                    if (data.mimeType === 'image/svg+xml' && data.content) {
                        contentMap[uri] = data.content;
                    }
                }
                let parentElement, element;
                this.application.getProcessingCache(sessionId).each(node => {
                    if (node.imageElement) {
                        [parentElement, element] = this.createSvgElement(node, node.toElementString('src'));
                    } else if (node.svgElement) {
                        element = node.element;
                    }
                    if (element) {
                        const drawable = this.createSvgDrawable(node, element, contentMap);
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
                            parentElement = undefined;
                        }
                        element = undefined;
                    }
                });
            }
        }
        afterFinalize() {
            if (SvgBuild) {
                this.controller.localSettings.svg.enabled = false;
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
        createSvgDrawable(node, element, contentMap) {
            var _a;
            const { transformExclude: exclude, floatPrecisionValue: precision, floatPrecisionKeyTime } = this.options;
            const svg = new Svg(element);
            svg.contentMap = contentMap;
            const supportedKeyFrames = node.api >= 23; /* MARSHMALLOW */
            const keyTimeMode =
                1 /* FROMTO_ANIMATE */ | (supportedKeyFrames ? 16 /* KEYTIME_TRANSFORM */ : 32) /* IGNORE_TRANSFORM */;
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
                const { width, height } = NodeUI$4.refitScreen(node, { width: svg.width, height: svg.height });
                vectorName = Resource.insertStoredAsset(
                    'drawables',
                    getTemplateFilename(templateName, imageLength),
                    applyTemplate('vector', VECTOR_TMPL, [
                        {
                            'xmlns:android': XMLNS_ANDROID.android,
                            'xmlns:aapt': this._namespaceAapt ? XMLNS_ANDROID.aapt : '',
                            'android:name': animateData.size > 0 ? svg.name : '',
                            'android:width': formatPX$d(width),
                            'android:height': formatPX$d(height),
                            'android:viewportWidth': (svg.viewBox.width || width).toString(),
                            'android:viewportHeight': (svg.viewBox.height || height).toString(),
                            'android:alpha': parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : '',
                            include: vectorData,
                        },
                    ])
                );
                if (animateData.size > 0) {
                    const data = [
                        {
                            'xmlns:android': XMLNS_ANDROID.android,
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
                        const isolatedTargets = [];
                        const transformTargets = [];
                        const [companions, animations] = partitionArray$1(group.animate, child => 'companion' in child);
                        const targetSetTemplate = { set: [], objectAnimator: [] };
                        let length = animations.length;
                        for (let i = 0; i < length; ++i) {
                            const item = animations[i];
                            if (item.setterType) {
                                if (ATTRIBUTE_ANDROID[item.attributeName] && item.to) {
                                    if (item.fillReplace && item.duration > 0) {
                                        isolatedData.push(item);
                                    } else {
                                        togetherData.push(item);
                                    }
                                }
                            } else if (SvgBuild.isAnimate(item)) {
                                const children = companions.filter(child => child.companion.value === item);
                                const q = children.length;
                                if (q > 0) {
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
                                    sequentialMap.set(`sequentially_companion_${i}`, sequentially.concat(after));
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
                                            !(supportedKeyFrames && getValueType(item.attributeName) !== 'pathType')
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
                        if (togetherData.length > 0) {
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
                        for (let i = 0; i < isolatedData.length; ++i) {
                            isolatedTargets.push([[isolatedData[i]]]);
                        }
                        const combined = [togetherTargets, transformTargets, ...isolatedTargets];
                        length = combined.length;
                        for (let index = 0; index < length; ++index) {
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
                            let y = 0;
                            while (y < t) {
                                const items = targets[y++];
                                let ordering = '',
                                    synchronized = false,
                                    checkBefore = false,
                                    useKeyFrames = true;
                                if (
                                    index <= 1 &&
                                    items.some(item => !!item.synchronized && item.synchronized.value !== '')
                                ) {
                                    if (!SvgBuild.isAnimateTransform(items[0])) {
                                        ordering = 'sequentially';
                                    }
                                    synchronized = true;
                                    useKeyFrames = false;
                                } else if (
                                    index <= 1 &&
                                    items.some(item => !!item.synchronized && item.synchronized.value === '')
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
                                const u = targeted.length;
                                for (let i = 0; i < u; ++i) {
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
                                        let transforming = false,
                                            transformOrigin;
                                        if (item.setterType) {
                                            const propertyNames = getAttributePropertyName(item.attributeName);
                                            if (propertyNames) {
                                                const values = isColorType(item.attributeName)
                                                    ? getColorValue$1(item.to, true)
                                                    : item.to.trim().split(' ');
                                                const q = propertyNames.length;
                                                if (values.length === q && !values.some(value => value === '')) {
                                                    let companionBefore, companionAfter;
                                                    for (let k = 0; k < q; ++k) {
                                                        let valueFrom;
                                                        if (valueType === 'pathType') {
                                                            valueFrom = values[k];
                                                        } else if (requireBefore) {
                                                            if (item.baseValue) {
                                                                valueFrom = convertValueType(
                                                                    item,
                                                                    item.baseValue.trim().split(' ')[k]
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
                                                                    if (!companionBefore) {
                                                                        companionBefore = [];
                                                                    }
                                                                    companionBefore.push(propertyValue);
                                                                } else if (companion.key > 0) {
                                                                    if (!companionAfter) {
                                                                        companionAfter = [];
                                                                    }
                                                                    companionAfter.push(propertyValue);
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
                                                repeatCount,
                                                beforeValues,
                                                propertyNames,
                                                values;
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
                                                    let transforms, parentContainer;
                                                    if (parent && SvgBuild.isShape(parent)) {
                                                        parentContainer = parent;
                                                        transforms =
                                                            (_a = parent.path) === null || _a === void 0
                                                                ? void 0
                                                                : _a.transformed;
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
                                                    transformOrigin = item.transformOrigin;
                                                }
                                                transforming = true;
                                            } else if (SvgBuild.asAnimateMotion(item)) {
                                                propertyNames = getTransformPropertyName(item.type);
                                                values = getTransformValues(item);
                                                if (propertyNames && values) {
                                                    const rotateValues = item.rotateValues;
                                                    const q = values.length;
                                                    if (
                                                        (rotateValues === null || rotateValues === void 0
                                                            ? void 0
                                                            : rotateValues.length) === q
                                                    ) {
                                                        propertyNames.push('rotation');
                                                        let k = 0;
                                                        while (k < q) {
                                                            values[k].push(rotateValues[k++]);
                                                        }
                                                    }
                                                }
                                                transforming = true;
                                            } else {
                                                propertyNames = getAttributePropertyName(item.attributeName);
                                                switch (valueType) {
                                                    case 'intType':
                                                        values = plainMap$3(item.values, value =>
                                                            convertInt$4(value).toString()
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
                                                            for (let k = 0; k < values.length; ++k) {
                                                                if (values[k] !== '') {
                                                                    values[k] = getColorValue$1(values[k]);
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
                                                const r = keyTimes.length;
                                                const keyName = syncData
                                                    ? syncData.key + syncData.value
                                                    : index !== 0 || q > 1
                                                    ? JSON.stringify(options)
                                                    : '';
                                                for (let k = 0; k < q; ++k) {
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
                                                    if (useKeyFrames && r > 1) {
                                                        if (supportedKeyFrames && valueType !== 'pathType') {
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
                                                                        l > 0 &&
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
                                                            transformOrigin = undefined;
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
                                                                        transformOrigin === null ||
                                                                        transformOrigin === void 0
                                                                            ? void 0
                                                                            : transformOrigin[l];
                                                                    if (origin) {
                                                                        let translateTo = 0,
                                                                            direction;
                                                                        if (propertyName.endsWith('X')) {
                                                                            translateTo = origin.x;
                                                                            direction = 'translateX';
                                                                        } else if (propertyName.endsWith('Y')) {
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
                                                            if (translateData.objectAnimator.length > 0) {
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
                                                        if (Array.isArray(values[0])) {
                                                            const valueTo = values[s - 1][k];
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
                                                                propertyOptions.valueTo = values[s - 1].toString();
                                                            } else {
                                                                valueFrom =
                                                                    item.from ||
                                                                    (!checkBefore && requireBefore && beforeValues
                                                                        ? beforeValues[j]
                                                                        : '');
                                                                propertyOptions.valueTo = item.to;
                                                            }
                                                            if (valueType === 'pathType') {
                                                                propertyOptions.valueFrom =
                                                                    valueFrom ||
                                                                    group.pathData ||
                                                                    propertyOptions.valueTo;
                                                            } else if (
                                                                valueFrom !== propertyOptions.valueTo &&
                                                                valueFrom
                                                            ) {
                                                                propertyOptions.valueFrom = convertValueType(
                                                                    item,
                                                                    valueFrom
                                                                );
                                                            }
                                                        }
                                                        const valueA = propertyOptions.valueTo;
                                                        if (valueA) {
                                                            if (valueType === 'floatType') {
                                                                propertyOptions.valueTo = truncate$8(valueA, precision);
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
                                                if (
                                                    requireBefore &&
                                                    (transformOrigin === null || transformOrigin === void 0
                                                        ? void 0
                                                        : transformOrigin.length)
                                                ) {
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
                                if (objectAnimator.length > 0 || customAnimator.length > 0) {
                                    if (beforeAnimator.length > 0) {
                                        setData.ordering = 'sequentially';
                                        setData.set.push(fillBefore);
                                    }
                                    if (objectAnimator.length > 0) {
                                        repeating.ordering = ordering;
                                        setData.set.push(repeating);
                                    }
                                    if (customAnimator.length > 0) {
                                        setData.ordering = 'sequentially';
                                        setData.set.push(fillCustom);
                                    }
                                    if (afterAnimator.length > 0) {
                                        setData.ordering = 'sequentially';
                                        setData.set.push(fillAfter);
                                    }
                                }
                                if (together.length > 0) {
                                    setData.objectAnimator = setData.objectAnimator.concat(together);
                                }
                            }
                            if (setData.set.length > 0 || setData.objectAnimator.length > 0) {
                                targetSetTemplate.set.push(setData);
                            }
                        }
                        insertTargetAnimation(data, name, targetSetTemplate, templateName, imageLength);
                    }
                    for (const [name, target] of this._animateTarget.entries()) {
                        const animate = target.animate;
                        let objectAnimator;
                        const length = animate.length;
                        let i = 0;
                        while (i < length) {
                            const item = animate[i++];
                            if (SvgBuild.asAnimateMotion(item)) {
                                const parent = item.parent;
                                if (parent && SvgBuild.isShape(parent)) {
                                    const path = parent.path;
                                    if (path) {
                                        const { value, baseValue } = path;
                                        if (value !== baseValue) {
                                            if (!objectAnimator) {
                                                objectAnimator = [];
                                            }
                                            objectAnimator.push(
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
                                    set: [{ set: undefined, objectAnimator }],
                                    objectAnimator: undefined,
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
                const layerData = [{ 'xmlns:android': XMLNS_ANDROID.android, item }];
                if (vectorName) {
                    item.push({ drawable: getDrawableSrc(vectorName) });
                }
                let i = 0;
                while (i < imageLength) {
                    const image = imageData[i++];
                    const { x, y } = getRootOffset(image.element, svg.element);
                    const box = svg.viewBox;
                    const scaleX = svg.width / box.width;
                    const scaleY = svg.height / box.height;
                    const left = image.getBaseValue('x', 0) * scaleX + x;
                    const top = image.getBaseValue('y', 0) * scaleY + y;
                    const data = {
                        width: formatPX$d(image.getBaseValue('width', 0) * scaleX),
                        height: formatPX$d(image.getBaseValue('height', 0) * scaleY),
                        left: left !== 0 ? formatPX$d(left) : '',
                        top: top !== 0 ? formatPX$d(top) : '',
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
            const floatPrecisionValue = this.options.floatPrecisionValue;
            const result = this.createGroup(group);
            const length = result.length;
            const renderDepth = depth + length;
            let output = '';
            group.each(item => {
                if (item.visible) {
                    if (SvgBuild.isShape(item)) {
                        const itemPath = item.path;
                        if (itemPath === null || itemPath === void 0 ? void 0 : itemPath.value) {
                            const [path, groupArray] = this.createPath(item, itemPath);
                            const pathArray = [];
                            if (
                                parseFloat(itemPath.strokeWidth) > 0 &&
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
                                        floatPrecisionValue
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
                                        const q = strokeDash.length;
                                        for (let i = 0; i < q; ++i) {
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
                                            strokePath.trimPathStart = truncate$8(dash.start, floatPrecisionValue);
                                            strokePath.trimPathEnd = truncate$8(dash.end, floatPrecisionValue);
                                            pathArray.push(strokePath);
                                        }
                                        groupArray.unshift(strokeData);
                                    }
                                }
                            }
                            if (pathArray.length === 0) {
                                pathArray.push(path);
                            }
                            if (groupArray.length > 0) {
                                const enclosing = groupArray[groupArray.length - 1];
                                enclosing.path = pathArray;
                                output += applyTemplate('group', VECTOR_GROUP, groupArray, renderDepth + 1);
                            } else {
                                output += applyTemplate('path', VECTOR_PATH, pathArray, renderDepth + 1);
                            }
                        }
                    } else if (SvgBuild.isContainer(item)) {
                        if (item.length > 0) {
                            output += this.parseVectorData(item, renderDepth);
                        }
                    } else if (SvgBuild.asImage(item)) {
                        if (!SvgBuild.asPattern(group)) {
                            item.extract(this.options.transformExclude.image);
                            this._imageData.push(item);
                        }
                    }
                }
            });
            if (length > 0) {
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
            if (clipMain.length > 0 || hasKeys$2(transformData)) {
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
                if (length > 0) {
                    let transformed = [];
                    let i = 0;
                    while (i < length) {
                        const data = transforms[i++];
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
                const { transformExclude: exclude, floatPrecisionValue: precision } = this.options;
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
            } else if (clipElement.length > 0) {
                baseData.name = '';
            }
            if (SvgBuild.asUseShape(target) && (target.x !== 0 || target.y !== 0)) {
                baseData.translateX = target.x.toString();
                baseData.translateY = target.y.toString();
            }
            if (clipElement.length > 0) {
                baseData['clip-path'] = clipElement;
            }
            if (hasKeys$2(baseData)) {
                renderData.push(baseData);
            }
            (_a = path.transformResidual) === null || _a === void 0
                ? void 0
                : _a.forEach(item => renderData.push(createTransformData(item)));
            let i = 0;
            while (i < PATH_ATTRIBUTES.length) {
                let attr = PATH_ATTRIBUTES[i++],
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
                                        const gradient = createFillGradient(
                                            pattern,
                                            path,
                                            this.options.floatPrecisionValue
                                        );
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
                            value = ((isNumber$2(value) ? parseFloat(value) : 1) * opacity).toString();
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
            let length = animations.length;
            i = 0;
            while (i < length) {
                const item = animations[i++];
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
            const replaceData = Array.from(fillReplaceMap.values()).sort((a, b) => (a.time < b.time ? -1 : 1));
            length = replaceData.length;
            for (i = 0; i < length; ++i) {
                const item = replaceData[i];
                if (!item.reset || item.to !== previousPathData) {
                    let valid = true;
                    if (item.reset) {
                        invalid: {
                            let j = 0;
                            while (j < i) {
                                const previous = replaceData[j++];
                                if (!previous.reset) {
                                    let k = i + 1;
                                    while (k < length) {
                                        switch (replaceData[k++].index) {
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
                        let j = 0;
                        while (j < i) {
                            const previous = replaceData[j++];
                            itemTotal[previous.index] = itemTotal[previous.index] ? 2 : 1;
                        }
                        for (j = 0; j < itemTotal.length; ++j) {
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
                                j = 0;
                                while (j < initialValue.length) {
                                    transformResult.push(
                                        createAnimateFromTo(propertyName[j], item.time, initialValue[j++], '')
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
            if (transformResult.length > 0) {
                const data = animateData.get(groupName);
                if (data) {
                    data.animate = data.animate.concat(transformResult);
                }
            }
            if (replaceResult.length > 0) {
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
                const { transformExclude: exclude, floatPrecisionValue: precision } = this.options;
                clipPath.split(';').forEach((value, index, array) => {
                    if (value.charAt(0) === '#') {
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
            if (svg.animations.length > 0) {
                const animate = svg.animations.filter(
                    (item, index, array) =>
                        !item.paused && (item.duration >= 0 || item.setterType) && predicate(item, index, array)
                );
                if (animate.length > 0) {
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
            'android.delegate.background',
            'android.delegate.negative-x',
            'android.delegate.positive-x',
            'android.delegate.max-width-height',
            'android.delegate.percent',
            'android.delegate.scrollbar',
            'android.delegate.radiogroup',
            'squared.accessibility',
            'squared.relative',
            'squared.css-grid',
            'squared.flexbox',
            'squared.table',
            'squared.column',
            'squared.list',
            'squared.verticalalign',
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
        targetAPI: 29,
        resolutionDPI: 160,
        resolutionScreenWidth: 1280,
        resolutionScreenHeight: 900,
        framesPerSecond: 60,
        supportRTL: true,
        preloadImages: true,
        compressImages: false,
        convertImages: '',
        supportNegativeLeftTop: true,
        customizationsOverwritePrivilege: true,
        showAttributes: true,
        createElementMap: false,
        createQuerySelectorMap: false,
        convertPixels: 'dp',
        insertSpaces: 4,
        autoCloseOnWrite: true,
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

    const framework = 2; /* ANDROID */
    let initialized = false;
    let application;
    let file;
    function autoClose() {
        if (
            initialized &&
            !application.initializing &&
            !application.closed &&
            application.userSettings.autoCloseOnWrite
        ) {
            application.finalize();
            return true;
        }
        return false;
    }
    function createAssetsOptions(options, directory, filename) {
        return Object.assign(Object.assign({}, options), { directory, filename });
    }
    const checkApplication = main => initialized && (main.closed || autoClose());
    const lib = {
        constant,
        customization,
        enumeration,
        util,
    };
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
            VerticalAlign,
            WhiteSpace,
            constraint: {
                Guideline: Guideline,
            },
            delegate: {
                Background: Background,
                MaxWidthHeight: MaxWidthHeight,
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
        lib,
        system: {
            customize(build, widget, options) {
                if (API_ANDROID[build]) {
                    const assign = API_ANDROID[build].assign;
                    if (assign[widget]) {
                        Object.assign(assign[widget], options);
                    } else {
                        assign[widget] = options;
                    }
                    return assign[widget];
                }
                return undefined;
            },
            addXmlNs(name, uri) {
                XMLNS_ANDROID[name] = uri;
            },
            copyLayoutAllXml(directory, options) {
                if (checkApplication(application)) {
                    file.layoutAllToXml(application.layouts, createAssetsOptions(options, directory));
                }
            },
            copyResourceAllXml(directory, options) {
                if (checkApplication(application)) {
                    file.resourceAllToXml(createAssetsOptions(options, directory));
                }
            },
            copyResourceStringXml(directory, options) {
                if (checkApplication(application)) {
                    file.resourceStringToXml(createAssetsOptions(options, directory));
                }
            },
            copyResourceArrayXml(directory, options) {
                if (checkApplication(application)) {
                    file.resourceStringArrayToXml(createAssetsOptions(options, directory));
                }
            },
            copyResourceFontXml(directory, options) {
                if (checkApplication(application)) {
                    file.resourceFontToXml(createAssetsOptions(options, directory));
                }
            },
            copyResourceColorXml(directory, options) {
                if (checkApplication(application)) {
                    file.resourceColorToXml(createAssetsOptions(options, directory));
                }
            },
            copyResourceStyleXml(directory, options) {
                if (checkApplication(application)) {
                    file.resourceStyleToXml(createAssetsOptions(options, directory));
                }
            },
            copyResourceDimenXml(directory, options) {
                if (checkApplication(application)) {
                    file.resourceDimenToXml(createAssetsOptions(options, directory));
                }
            },
            copyResourceDrawableXml(directory, options) {
                if (checkApplication(application)) {
                    file.resourceDrawableToXml(createAssetsOptions(options, directory));
                }
            },
            copyResourceAnimXml(directory, options) {
                if (checkApplication(application)) {
                    file.resourceAnimToXml(createAssetsOptions(options, directory));
                }
            },
            copyResourceDrawableImage(directory, options) {
                if (checkApplication(application)) {
                    file.resourceDrawableImageToString(createAssetsOptions(options, directory));
                }
            },
            copyResourceRawVideo(directory, options) {
                if (checkApplication(application)) {
                    file.resourceRawVideoToString(createAssetsOptions(options, directory));
                }
            },
            copyResourceRawAudio(directory, options) {
                if (checkApplication(application)) {
                    file.resourceRawAudioToString(createAssetsOptions(options, directory));
                }
            },
            saveLayoutAllXml(filename, options) {
                if (checkApplication(application)) {
                    file.layoutAllToXml(
                        application.layouts,
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-layouts'
                        )
                    );
                }
            },
            saveResourceAllXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceAllToXml(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-resources'
                        )
                    );
                }
            },
            saveResourceStringXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceStringToXml(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-string'
                        )
                    );
                }
            },
            saveResourceArrayXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceStringArrayToXml(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-array'
                        )
                    );
                }
            },
            saveResourceFontXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceFontToXml(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-font'
                        )
                    );
                }
            },
            saveResourceColorXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceColorToXml(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-color'
                        )
                    );
                }
            },
            saveResourceStyleXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceStyleToXml(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-style'
                        )
                    );
                }
            },
            saveResourceDimenXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceDimenToXml(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-dimen'
                        )
                    );
                }
            },
            saveResourceDrawableXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceDrawableToXml(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-drawable'
                        )
                    );
                }
            },
            saveResourceAnimXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceAnimToXml(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-anim'
                        )
                    );
                }
            },
            saveResourceDrawableImage(filename, options) {
                if (checkApplication(application)) {
                    file.resourceDrawableImageToString(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-drawable-image'
                        )
                    );
                }
            },
            saveResourceRawVideo(filename, options) {
                if (checkApplication(application)) {
                    file.resourceRawVideoToString(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-raw-video'
                        )
                    );
                }
            },
            saveResourceRawAudio(filename, options) {
                if (checkApplication(application)) {
                    file.resourceRawAudioToString(
                        createAssetsOptions(
                            options,
                            undefined,
                            filename || application.userSettings.outputArchiveName + '-raw-audio'
                        )
                    );
                }
            },
            writeLayoutAllXml(options) {
                return checkApplication(application) ? file.layoutAllToXml(application.layouts, options) : {};
            },
            writeResourceAllXml(options) {
                return checkApplication(application) ? file.resourceAllToXml(options) : {};
            },
            writeResourceStringXml(options) {
                return checkApplication(application) ? file.resourceStringToXml(options) : [];
            },
            writeResourceArrayXml(options) {
                return checkApplication(application) ? file.resourceStringArrayToXml(options) : [];
            },
            writeResourceFontXml(options) {
                return checkApplication(application) ? file.resourceFontToXml(options) : [];
            },
            writeResourceColorXml(options) {
                return checkApplication(application) ? file.resourceColorToXml(options) : [];
            },
            writeResourceStyleXml(options) {
                return checkApplication(application) ? file.resourceStyleToXml(options) : [];
            },
            writeResourceDimenXml(options) {
                return checkApplication(application) ? file.resourceDimenToXml(options) : [];
            },
            writeResourceDrawableXml(options) {
                return checkApplication(application) ? file.resourceDrawableToXml(options) : [];
            },
            writeResourceAnimXml(options) {
                return checkApplication(application) ? file.resourceAnimToXml(options) : [];
            },
            writeResourceDrawableImage(options) {
                return checkApplication(application) ? file.resourceDrawableImageToString(options) : [];
            },
            writeResourceRawVideo(options) {
                return checkApplication(application) ? file.resourceRawVideoToString(options) : [];
            },
            writeResourceRawAudio(options) {
                return checkApplication(application) ? file.resourceRawAudioToString(options) : [];
            },
        },
        create() {
            const EN = squared.base.lib.constant.EXT_NAME;
            const EA = EXT_ANDROID;
            application = new Application(framework, View, Controller, Resource, squared.base.ExtensionManager);
            file = new File();
            application.resourceHandler.fileHandler = file;
            Object.assign(application.builtInExtensions, {
                [EN.TABLE]: new Table(EN.TABLE, framework, undefined, ['TABLE']),
                [EN.LIST]: new List(EN.LIST, framework, undefined, ['DIV', 'UL', 'OL', 'DL']),
                [EN.GRID]: new Grid(EN.GRID, framework, undefined, [
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
                ]),
                [EN.CSS_GRID]: new CssGrid(EN.CSS_GRID, framework),
                [EN.FLEXBOX]: new Flexbox(EN.FLEXBOX, framework),
                [EN.COLUMN]: new Column(EN.COLUMN, framework),
                [EN.SPRITE]: new Sprite(EN.SPRITE, framework),
                [EN.ACCESSIBILITY]: new Accessibility(EN.ACCESSIBILITY, framework),
                [EN.RELATIVE]: new Relative(EN.RELATIVE, framework),
                [EN.VERTICAL_ALIGN]: new VerticalAlign(EN.VERTICAL_ALIGN, framework),
                [EN.WHITESPACE]: new WhiteSpace(EN.WHITESPACE, framework),
                [EA.EXTERNAL]: new External(EA.EXTERNAL, framework),
                [EA.SUBSTITUTE]: new Substitute(EA.SUBSTITUTE, framework),
                [EA.DELEGATE_BACKGROUND]: new Background(EA.DELEGATE_BACKGROUND, framework),
                [EA.DELEGATE_MAXWIDTHHEIGHT]: new MaxWidthHeight(EA.DELEGATE_MAXWIDTHHEIGHT, framework),
                [EA.DELEGATE_NEGATIVEX]: new NegativeX(EA.DELEGATE_NEGATIVEX, framework),
                [EA.DELEGATE_PERCENT]: new Percent(EA.DELEGATE_PERCENT, framework),
                [EA.DELEGATE_POSITIVEX]: new PositiveX(EA.DELEGATE_POSITIVEX, framework),
                [EA.DELEGATE_RADIOGROUP]: new RadioGroup(EA.DELEGATE_RADIOGROUP, framework),
                [EA.DELEGATE_SCROLLBAR]: new ScrollBar(EA.DELEGATE_SCROLLBAR, framework),
                [EA.RESOURCE_BACKGROUND]: new ResourceBackground(EA.RESOURCE_BACKGROUND, framework),
                [EA.RESOURCE_DATA]: new ResourceData(EA.RESOURCE_DATA, framework),
                [EA.RESOURCE_DIMENS]: new ResourceDimens(EA.RESOURCE_DIMENS, framework),
                [EA.RESOURCE_FONTS]: new ResourceFonts(EA.RESOURCE_FONTS, framework),
                [EA.RESOURCE_INCLUDES]: new ResourceIncludes(EA.RESOURCE_INCLUDES, framework),
                [EA.RESOURCE_STRINGS]: new ResourceStrings(EA.RESOURCE_STRINGS, framework),
                [EA.RESOURCE_STYLES]: new ResourceStyles(EA.RESOURCE_STYLES, framework),
                [EA.RESOURCE_SVG]: new ResourceSvg(EA.RESOURCE_SVG, framework),
                [EA.CONSTRAINT_GUIDELINE]: new Guideline(EA.CONSTRAINT_GUIDELINE, framework),
            });
            initialized = true;
            return {
                application,
                framework,
                userSettings: Object.assign({}, settings),
            };
        },
        cached() {
            if (initialized) {
                return {
                    application,
                    framework,
                    userSettings: application.userSettings,
                };
            }
            return appBase.create();
        },
    };

    return appBase;
})();
