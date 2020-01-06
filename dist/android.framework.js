/* android-framework 1.3.7
   https://github.com/anpham6/squared */

var android = (function () {
    'use strict';

    class Application extends squared.base.ApplicationUI {
    }

    var CONTAINER_NODE;
    (function (CONTAINER_NODE) {
        CONTAINER_NODE[CONTAINER_NODE["EDIT"] = 1] = "EDIT";
        CONTAINER_NODE[CONTAINER_NODE["RANGE"] = 2] = "RANGE";
        CONTAINER_NODE[CONTAINER_NODE["RADIO"] = 3] = "RADIO";
        CONTAINER_NODE[CONTAINER_NODE["CHECKBOX"] = 4] = "CHECKBOX";
        CONTAINER_NODE[CONTAINER_NODE["SELECT"] = 5] = "SELECT";
        CONTAINER_NODE[CONTAINER_NODE["TEXT"] = 6] = "TEXT";
        CONTAINER_NODE[CONTAINER_NODE["SVG"] = 7] = "SVG";
        CONTAINER_NODE[CONTAINER_NODE["IMAGE"] = 8] = "IMAGE";
        CONTAINER_NODE[CONTAINER_NODE["BUTTON"] = 9] = "BUTTON";
        CONTAINER_NODE[CONTAINER_NODE["PROGRESS"] = 10] = "PROGRESS";
        CONTAINER_NODE[CONTAINER_NODE["INLINE"] = 11] = "INLINE";
        CONTAINER_NODE[CONTAINER_NODE["LINE"] = 12] = "LINE";
        CONTAINER_NODE[CONTAINER_NODE["SPACE"] = 13] = "SPACE";
        CONTAINER_NODE[CONTAINER_NODE["BLOCK"] = 14] = "BLOCK";
        CONTAINER_NODE[CONTAINER_NODE["FRAME"] = 15] = "FRAME";
        CONTAINER_NODE[CONTAINER_NODE["LINEAR"] = 16] = "LINEAR";
        CONTAINER_NODE[CONTAINER_NODE["GRID"] = 17] = "GRID";
        CONTAINER_NODE[CONTAINER_NODE["RELATIVE"] = 18] = "RELATIVE";
        CONTAINER_NODE[CONTAINER_NODE["CONSTRAINT"] = 19] = "CONSTRAINT";
        CONTAINER_NODE[CONTAINER_NODE["WEBVIEW"] = 20] = "WEBVIEW";
        CONTAINER_NODE[CONTAINER_NODE["UNKNOWN"] = 21] = "UNKNOWN";
    })(CONTAINER_NODE || (CONTAINER_NODE = {}));

    var enumeration = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get CONTAINER_NODE () { return CONTAINER_NODE; }
    });

    const EXT_ANDROID = {
        EXTERNAL: 'android.external',
        SUBSTITUTE: 'android.substitute',
        DELEGATE_BACKGROUND: 'android.delegate.background',
        DELEGATE_FIXED: 'android.delegate.fixed',
        DELEGATE_MAXWIDTHHEIGHT: 'android.delegate.max-width-height',
        DELEGATE_NEGATIVEVIEWPORT: 'android.delegate.negative-viewport',
        DELEGATE_NEGATIVEX: 'android.delegate.negative-x',
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
        EDIT_LIST: 'AutoCompleteTextView',
        SELECT: 'Spinner',
        RANGE: 'SeekBar',
        SVG: 'ImageView',
        TEXT: 'TextView',
        IMAGE: 'ImageView',
        BUTTON: 'Button',
        METER: 'ProgressBar',
        PROGRESS: 'ProgressBar',
        LINE: 'View',
        SPACE: 'Space',
        FRAME: 'FrameLayout',
        LINEAR: 'LinearLayout',
        GRID: 'GridLayout',
        RELATIVE: 'RelativeLayout',
        WEBVIEW: 'WebView',
        RADIOGROUP: 'RadioGroup',
        HORIZONTAL_SCROLL: 'HorizontalScrollView',
        VERTICAL_SCROLL: 'android.support.v4.widget.NestedScrollView',
        CONSTRAINT: 'android.support.constraint.ConstraintLayout',
        GUIDELINE: 'android.support.constraint.Guideline',
        BARRIER: 'android.support.constraint.Barrier'
    };
    const CONTAINER_ANDROID_X = {
        VERTICAL_SCROLL: 'androidx.core.widget.NestedScrollView',
        CONSTRAINT: 'androidx.constraintlayout.widget.ConstraintLayout',
        GUIDELINE: 'androidx.constraintlayout.widget.Guideline',
        BARRIER: 'androidx.constraintlayout.widget.Barrier'
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
    const SUPPORT_ANDROID_X = {
        DRAWER: 'androidx.drawerlayout.widget.DrawerLayout',
        NAVIGATION_VIEW: 'com.google.android.material.navigation.NavigationView',
        COORDINATOR: 'androidx.coordinatorlayout.widget.CoordinatorLayout',
        APPBAR: 'com.google.android.material.appbar.AppBarLayout',
        COLLAPSING_TOOLBAR: 'com.google.android.material.appbar.CollapsingToolbarLayout',
        TOOLBAR: 'androidx.appcompat.widget.Toolbar',
        FLOATING_ACTION_BUTTON: 'com.google.android.material.floatingactionbutton.FloatingActionButton',
        BOTTOM_NAVIGATION: 'com.google.android.material.bottomnavigation.BottomNavigationView'
    };
    const ELEMENT_ANDROID = {
        PLAINTEXT: CONTAINER_NODE.TEXT,
        HR: CONTAINER_NODE.LINE,
        SVG: CONTAINER_NODE.SVG,
        IMG: CONTAINER_NODE.IMAGE,
        BUTTON: CONTAINER_NODE.BUTTON,
        SELECT: CONTAINER_NODE.SELECT,
        TEXTAREA: CONTAINER_NODE.EDIT,
        METER: CONTAINER_NODE.PROGRESS,
        PROGRESS: CONTAINER_NODE.PROGRESS,
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
        INPUT_SUBMIT: CONTAINER_NODE.BUTTON,
        INPUT_RESET: CONTAINER_NODE.BUTTON,
        INPUT_CHECKBOX: CONTAINER_NODE.CHECKBOX,
        INPUT_RADIO: CONTAINER_NODE.RADIO,
        'INPUT_DATETIME-LOCAL': CONTAINER_NODE.EDIT
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
        android: 'http://schemas.android.com/apk/res/android',
        app: 'http://schemas.android.com/apk/res-auto',
        aapt: 'http://schemas.android.com/aapt',
        tools: 'http://schemas.android.com/tools'
    };
    const STRING_ANDROID = {
        HORIZONTAL: 'horizontal',
        VERTICAL: 'vertical',
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
        CENTER_HORIZONTAL: 'center_horizontal',
        CENTER_VERTICAL: 'center_vertical'
    };
    const LOCALIZE_ANDROID = {
        left: 'start',
        right: 'end',
        layout_marginLeft: 'layout_marginStart',
        layout_marginRight: 'layout_marginEnd',
        paddingLeft: 'paddingStart',
        paddingRight: 'paddingEnd',
        layout_alignParentLeft: 'layout_alignParentStart',
        layout_alignParentRight: 'layout_alignParentEnd',
        layout_alignLeft: 'layout_alignStart',
        layout_alignRight: 'layout_alignEnd',
        layout_toRightOf: 'layout_toEndOf',
        layout_toLeftOf: 'layout_toStartOf',
        layout_constraintLeft_toLeftOf: 'layout_constraintStart_toStartOf',
        layout_constraintRight_toRightOf: 'layout_constraintEnd_toEndOf',
        layout_constraintLeft_toRightOf: 'layout_constraintStart_toEndOf',
        layout_constraintRight_toLeftOf: 'layout_constraintEnd_toStartOf'
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
        RESERVED_JAVA: RESERVED_JAVA
    });

    const $lib = squared.lib;
    const { findColorShade, parseColor } = $lib.color;
    const { getSrcSet } = $lib.css;
    const { CHAR, COMPONENT, CSS, XML } = $lib.regex;
    const { fromLastIndexOf, isNumber, isPlainObject, isString, resolvePath, trimString } = $lib.util;
    const STORED = squared.base.ResourceUI.STORED;
    const REGEX_NONWORD = /[^\w+]/g;
    let CACHE_IMAGE = {};
    let IMAGE_FORMAT;
    function formatObject(obj, numberAlias = false) {
        var _a;
        if (obj) {
            for (const attr in obj) {
                if (isPlainObject(obj[attr])) {
                    formatObject(obj, numberAlias);
                }
                else {
                    let value = (_a = obj[attr]) === null || _a === void 0 ? void 0 : _a.toString();
                    if (value) {
                        switch (attr) {
                            case 'text':
                                if (!value.startsWith('@string/')) {
                                    value = Resource.addString(value, '', numberAlias);
                                    if (value !== '') {
                                        obj[attr] = '@string/' + value;
                                    }
                                }
                                continue;
                            case 'src':
                            case 'srcCompat':
                                if (COMPONENT.PROTOCOL.test(value)) {
                                    value = Resource.addImage({ mdpi: value });
                                    if (value !== '') {
                                        obj[attr] = '@drawable/' + value;
                                    }
                                }
                                continue;
                        }
                        const color = parseColor(value);
                        if (color) {
                            const colorName = Resource.addColor(color);
                            if (colorName !== '') {
                                obj[attr] = '@color/' + colorName;
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
            this.controllerSettings = application.controllerHandler.localSettings;
            IMAGE_FORMAT = this.controllerSettings.supported.imageFormat;
        }
        static formatOptions(options, numberAlias = false) {
            for (const namespace in options) {
                const obj = options[namespace];
                if (isPlainObject(obj)) {
                    formatObject(obj, numberAlias);
                }
            }
            return options;
        }
        static formatName(value) {
            if (CHAR.LEADINGNUMBER.test(value)) {
                value = '__' + value;
            }
            return value.replace(REGEX_NONWORD, '_');
        }
        static addTheme(...values) {
            const themes = STORED.themes;
            for (const theme of values) {
                const { items, output } = theme;
                let path = 'res/values';
                let file = 'themes.xml';
                if (output) {
                    if (isString(output.path)) {
                        path = output.path.trim();
                    }
                    if (isString(output.file)) {
                        file = output.file.trim();
                    }
                }
                const filename = trimString(path, '/') + '/' + trimString(file, '/');
                const storedFile = themes.get(filename) || new Map();
                let name = theme.name;
                let appTheme = '';
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
                        continue;
                    }
                }
                else {
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
                }
                else {
                    storedFile.set(name, theme);
                }
                themes.set(filename, storedFile);
            }
        }
        static addString(value, name = '', numberAlias = false) {
            if (value !== '') {
                if (name === '') {
                    name = value.trim();
                }
                const numeric = isNumber(value);
                if (!numeric || numberAlias) {
                    const strings = STORED.strings;
                    for (const [resourceName, resourceValue] of strings.entries()) {
                        if (resourceValue === value) {
                            return resourceName;
                        }
                    }
                    const partial = trimString(name.replace(XML.NONWORD_G, '_'), '_').split(/_+/);
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
                    if (numeric || CHAR.LEADINGNUMBER.test(name) || RESERVED_JAVA.includes(name)) {
                        name = '__' + name;
                    }
                    else if (name === '') {
                        name = '__symbol' + Math.ceil(Math.random() * 100000);
                    }
                    if (strings.has(name)) {
                        name = Resource.generateId('string', name);
                    }
                    strings.set(name, value);
                }
                return name;
            }
            return '';
        }
        static addImage(images, prefix = '') {
            const mdpi = images.mdpi;
            if (mdpi) {
                if (CACHE_IMAGE[mdpi] && Object.keys(images).length === 1) {
                    return CACHE_IMAGE[mdpi];
                }
                const src = fromLastIndexOf(mdpi, '/');
                const format = fromLastIndexOf(src, '.').toLowerCase();
                if (IMAGE_FORMAT.includes(format) && format !== 'svg') {
                    CACHE_IMAGE[mdpi] = Resource.insertStoredAsset('images', Resource.formatName(prefix + src.substring(0, src.length - format.length - 1)), images);
                    return CACHE_IMAGE[mdpi];
                }
            }
            return '';
        }
        static addColor(color, transparency = false) {
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
        }
        addImageSrc(element, prefix = '', imageSet) {
            var _a;
            const result = {};
            if (typeof element === 'string') {
                const match = CSS.URL.exec(element);
                if (match) {
                    if (match[1].startsWith('data:image')) {
                        result.mdpi = match[1];
                    }
                    else {
                        return Resource.addImage({ mdpi: resolvePath(match[1]) }, prefix);
                    }
                }
            }
            else {
                if (element.srcset) {
                    if (imageSet === undefined) {
                        imageSet = getSrcSet(element, IMAGE_FORMAT);
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
            const mdpi = result.mdpi;
            if (mdpi) {
                const resource = this.application.resourceHandler;
                const rawData = resource.getRawData(mdpi);
                if ((_a = rawData) === null || _a === void 0 ? void 0 : _a.base64) {
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

    const { optionalAsString, isString: isString$1 } = squared.lib.util;
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
            assign: {}
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
                'zygotePreloadName': false
            },
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
            assign: {}
        },
        [25 /* NOUGAT_1 */]: {
            android: {
                'fontWeight': false,
                'justificationMode': false,
                'layout_marginHorizontal': false,
                'layout_marginVertical': false,
                'paddingHorizontal': false,
                'paddingVertical': false,
                'tooltipText': false
            },
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
            assign: {}
        },
        [19 /* KITKAT */]: {
            android: {
                'allowEmbedded': false,
                'windowSwipeToDismiss': false
            },
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
                'paddingEnd': (result) => substitute(result, STRING_ANDROID.PADDING_RIGHT),
                'paddingStart': (result) => substitute(result, STRING_ANDROID.PADDING_LEFT),
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
            assign: {}
        },
        [14 /* ICE_CREAM_SANDWICH */]: {
            android: {},
            assign: {}
        },
        [0 /* ALL */]: {
            android: {},
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
            const value = optionalAsString(build, `assign.${tagName}.${obj}.${attr}`);
            if (isString$1(value)) {
                return value;
            }
        }
        return '';
    }

    var customization = /*#__PURE__*/Object.freeze({
        __proto__: null,
        API_ANDROID: API_ANDROID,
        DEPRECATED_ANDROID: DEPRECATED_ANDROID,
        getValue: getValue
    });

    const $lib$1 = squared.lib;
    const { truncate } = $lib$1.math;
    const { isPlainObject: isPlainObject$1 } = $lib$1.util;
    const REGEX_ID = /^@\+?id\//;
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
    function convertLength(value, dpi = 160, font = false, precision = 3) {
        let result = parseFloat(value);
        if (!isNaN(result)) {
            if (dpi !== 160) {
                result /= dpi / 160;
                return (result !== 0 && result > -1 && result < 1 ? result.toPrecision(precision) : truncate(result, precision - 1)) + (font ? 'sp' : 'dp');
            }
            else {
                return Math.round(result) + (font ? 'sp' : 'dp');
            }
        }
        return '0dp';
    }
    function getDocumentId(value) {
        return value.replace(REGEX_ID, '');
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
    function createViewAttribute(options, android = {}, app = {}) {
        const result = { android, app };
        if (options) {
            const { android: androidA, app: appA } = options;
            if (androidA) {
                Object.assign(result.android, androidA);
            }
            if (appA) {
                Object.assign(result.app, appA);
            }
        }
        return result;
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
        if (isPlainObject$1(options)) {
            for (const attr in result) {
                if (typeof options[attr] === typeof result[attr]) {
                    result[attr] = options[attr];
                }
            }
        }
        return result;
    }
    function localizeString(value, rtl, api) {
        return rtl && api >= 17 /* JELLYBEAN_1 */ && LOCALIZE_ANDROID[value] || value;
    }
    function getXmlNs(value) {
        return XMLNS_ANDROID[value] ? `xmlns:${value}="${XMLNS_ANDROID[value]}"` : '';
    }
    function getRootNs(value) {
        let output = '';
        for (const namespace in XMLNS_ANDROID) {
            if (value.indexOf(namespace + ':') !== -1) {
                output += '\n\t' + getXmlNs(namespace);
            }
        }
        return output;
    }

    var util = /*#__PURE__*/Object.freeze({
        __proto__: null,
        convertLength: convertLength,
        getDocumentId: getDocumentId,
        getHorizontalBias: getHorizontalBias,
        getVerticalBias: getVerticalBias,
        createViewAttribute: createViewAttribute,
        createStyleAttribute: createStyleAttribute,
        localizeString: localizeString,
        getXmlNs: getXmlNs,
        getRootNs: getRootNs
    });

    const $lib$2 = squared.lib;
    const { USER_AGENT, isUserAgent } = $lib$2.client;
    const { BOX_MARGIN, BOX_PADDING, formatPX, getDataSet, isLength, isPercent } = $lib$2.css;
    const { getNamedItem } = $lib$2.dom;
    const { clampRange, truncate: truncate$1 } = $lib$2.math;
    const { aboveRange, capitalize, convertWord, fromLastIndexOf: fromLastIndexOf$1, isPlainObject: isPlainObject$2, isString: isString$2, replaceMap } = $lib$2.util;
    const { BOX_STANDARD, CSS_UNIT, NODE_ALIGNMENT, NODE_PROCEDURE } = squared.base.lib.enumeration;
    const REGEX_DATASETATTR = /^attr[A-Z]/;
    const REGEX_FORMATTED = /^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/;
    const REGEX_VALIDSTRING = /[^\w$\-_.]/g;
    function checkTextAlign(value, ignoreStart) {
        switch (value) {
            case 'left':
            case 'start':
                return !ignoreStart ? value : '';
            case 'center':
                return STRING_ANDROID.CENTER_HORIZONTAL;
            case 'justify':
            case 'initial':
            case 'inherit':
                return '';
        }
        return value;
    }
    function isHorizontalAlign(value) {
        switch (value) {
            case 'left':
            case 'start':
            case 'right':
            case 'end':
            case STRING_ANDROID.CENTER_HORIZONTAL:
                return true;
        }
        return false;
    }
    function setAutoMargin(node, autoMargin) {
        var _a;
        if (autoMargin.horizontal && (!node.blockWidth || node.hasWidth || node.hasPX('maxWidth') || ((_a = node.innerWrapped) === null || _a === void 0 ? void 0 : _a.has('width', 4 /* PERCENT */, { not: '100%' })))) {
            node.mergeGravity((node.blockWidth || !node.pageFlow) && node.outerWrapper === undefined ? 'gravity' : 'layout_gravity', autoMargin.leftRight ? STRING_ANDROID.CENTER_HORIZONTAL : (autoMargin.left ? 'right' : 'left'));
        }
        return false;
    }
    function setMultiline(node, lineHeight, overwrite, autoPadding) {
        if (node.localSettings.targetAPI >= 28 /* PIE */) {
            node.android('lineHeight', formatPX(lineHeight), overwrite);
        }
        else {
            const offset = (lineHeight - node.actualHeight) / 2;
            if (offset > 0) {
                node.android('lineSpacingExtra', formatPX(offset), overwrite);
            }
        }
        if (autoPadding && node.styleElement && !node.hasPX('height') && node.cssTry('line-height', 'normal')) {
            if (node.cssTry('white-space', 'nowrap')) {
                const offset = (lineHeight - node.boundingClientRect.height) / 2;
                const upper = Math.round(offset);
                if (upper > 0) {
                    node.modifyBox(32 /* PADDING_TOP */, upper);
                    if (!node.blockStatic) {
                        node.modifyBox(128 /* PADDING_BOTTOM */, Math.floor(offset));
                    }
                }
                node.cssFinally('white-space');
            }
            node.cssFinally('line-height');
        }
    }
    function setMarginOffset(node, lineHeight, inlineStyle, top, bottom) {
        if (node.baselineAltered && !node.multiline || node.imageOrSvgElement || node.actualHeight === 0 || node.cssInitial('lineHeight') === 'initial') {
            return;
        }
        if (node.multiline) {
            setMultiline(node, lineHeight, false, true);
        }
        else if ((node.renderChildren.length === 0 || node.inline) && (node.pageFlow || node.textContent.length)) {
            if (inlineStyle && !node.inline && node.inlineText) {
                setMinHeight(node, lineHeight);
                setMultiline(node, lineHeight, false, false);
            }
            else {
                let offset = 0;
                let usePadding = true;
                if (!inlineStyle && node.styleElement && !node.hasPX('height') && node.cssTry('line-height', 'normal')) {
                    if (node.cssTry('white-space', 'nowrap')) {
                        offset = (lineHeight - node.boundingClientRect.height) / 2;
                        usePadding = false;
                        node.cssFinally('white-space');
                    }
                    node.cssFinally('line-height');
                }
                else {
                    const { height, numberOfLines } = node.bounds;
                    if (node.plainText && numberOfLines > 1) {
                        node.android('minHeight', formatPX(height / numberOfLines));
                        node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
                        return;
                    }
                    else {
                        offset = (lineHeight - height) / 2;
                    }
                }
                const upper = Math.round(offset);
                if (upper > 0) {
                    const boxPadding = usePadding && node.textElement && !node.plainText && !inlineStyle;
                    if (top) {
                        node.modifyBox(boxPadding ? 32 /* PADDING_TOP */ : 2 /* MARGIN_TOP */, upper);
                    }
                    if (bottom) {
                        node.modifyBox(boxPadding ? 128 /* PADDING_BOTTOM */ : 8 /* MARGIN_BOTTOM */, Math.floor(offset));
                    }
                }
            }
        }
        else if (inlineStyle && (!node.hasHeight || lineHeight > node.height) && (node.layoutHorizontal && node.horizontalRows === undefined || node.hasAlign(4096 /* SINGLE */))) {
            setMinHeight(node, lineHeight);
        }
    }
    function setMinHeight(node, value) {
        if (node.inlineText) {
            value += node.contentBoxHeight;
            if (!node.hasPX('height') || value >= Math.floor(node.height)) {
                node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL, false);
            }
        }
        if (value > node.height) {
            node.android('minHeight', formatPX(value));
        }
    }
    function isFlexibleDimension(node, value) {
        if (value === '0px') {
            const renderParent = node.renderParent;
            if (renderParent) {
                return renderParent.layoutConstraint || renderParent.is(CONTAINER_NODE.GRID);
            }
        }
        return false;
    }
    const LAYOUT_RELATIVE_PARENT = LAYOUT_ANDROID.relativeParent;
    const LAYOUT_RELATIVE = LAYOUT_ANDROID.relative;
    const LAYOUT_CONSTRAINT = LAYOUT_ANDROID.constraint;
    const DEPRECATED = DEPRECATED_ANDROID.android;
    var View$MX = (Base) => {
        return class View extends Base {
            constructor(id = 0, sessionId = '0', element, afterInit) {
                super(id, sessionId, element);
                this.renderChildren = [];
                this.constraint = {
                    horizontal: false,
                    vertical: false,
                    current: {}
                };
                this._namespaces = ['android', 'app'];
                this._cached = {};
                this._controlName = '';
                this._api = 29 /* LATEST */;
                this._localization = false;
                this._containerType = 0;
                this.__android = {};
                this.__app = {};
                this.init();
                if (afterInit) {
                    afterInit(this);
                    this._localization = this.hasProcedure(NODE_PROCEDURE.LOCALIZATION) && this.localSettings.supportRTL;
                }
            }
            static getControlName(containerType, api = 29 /* Q */) {
                const name = CONTAINER_NODE[containerType];
                if (api >= 29 /* Q */) {
                    const controlName = CONTAINER_ANDROID_X[name];
                    if (controlName) {
                        return controlName;
                    }
                }
                return CONTAINER_ANDROID[name];
            }
            android(attr, value, overwrite = true) {
                if (value) {
                    value = this.attr('android', attr, value, overwrite);
                    if (value !== '') {
                        return value;
                    }
                }
                return this.__android[attr] || '';
            }
            app(attr, value, overwrite = true) {
                if (value) {
                    value = this.attr('app', attr, value, overwrite);
                    if (value !== '') {
                        return value;
                    }
                }
                return this.__app[attr] || '';
            }
            apply(options) {
                for (const name in options) {
                    const data = options[name];
                    if (isPlainObject$2(data)) {
                        for (const attr in data) {
                            this.attr(name, attr, data[attr]);
                        }
                    }
                    else if (data) {
                        this.attr('_', name, data.toString());
                    }
                }
            }
            formatted(value, overwrite = true) {
                const match = REGEX_FORMATTED.exec(value);
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
                            const relativeParent = documentId === 'parent';
                            if (overwrite === undefined && documentId !== '') {
                                overwrite = relativeParent;
                            }
                            const attr = LAYOUT_CONSTRAINT[position];
                            if (attr) {
                                let horizontal = false;
                                node.app(this.localizeString(attr), documentId, overwrite);
                                switch (position) {
                                    case 'left':
                                    case 'right':
                                        if (relativeParent) {
                                            node.constraint.horizontal = true;
                                        }
                                    case 'leftRight':
                                    case 'rightLeft':
                                        horizontal = true;
                                        break;
                                    case 'top':
                                    case 'bottom':
                                    case 'baseline':
                                        if (relativeParent) {
                                            node.constraint.vertical = true;
                                        }
                                        break;
                                }
                                node.constraint.current[position] = { documentId, horizontal };
                                return true;
                            }
                        }
                    }
                    else if (renderParent.layoutRelative) {
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
            anchorParent(orientation, style, bias, overwrite) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    const horizontal = orientation === STRING_ANDROID.HORIZONTAL;
                    if (renderParent.layoutConstraint) {
                        if (overwrite || !this.constraint[orientation]) {
                            node.anchor(horizontal ? 'left' : 'top', 'parent', overwrite);
                            node.anchor(horizontal ? 'right' : 'bottom', 'parent', overwrite);
                            node.constraint[orientation] = true;
                            if (style) {
                                node.anchorStyle(orientation, style, bias, overwrite);
                            }
                            return true;
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        node.anchor(horizontal ? 'centerHorizontal' : 'centerVertical', 'true', overwrite);
                        return true;
                    }
                }
                return false;
            }
            anchorStyle(orientation, value = 'packed', bias = 0, overwrite = true) {
                const node = this.anchorTarget;
                if (orientation === STRING_ANDROID.HORIZONTAL) {
                    node.app('layout_constraintHorizontal_chainStyle', value, overwrite);
                    node.app('layout_constraintHorizontal_bias', bias.toString(), overwrite);
                }
                else {
                    node.app('layout_constraintVertical_chainStyle', value, overwrite);
                    node.app('layout_constraintVertical_bias', bias.toString(), overwrite);
                }
            }
            anchorDelete(...position) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        node.delete('app', ...replaceMap(position, value => this.localizeString(LAYOUT_CONSTRAINT[value])));
                    }
                    else if (renderParent.layoutRelative) {
                        for (const value of position) {
                            if (node.alignSibling(value) !== '') {
                                const attr = LAYOUT_RELATIVE[value];
                                if (attr) {
                                    node.delete('android', LAYOUT_RELATIVE[value], this.localizeString(LAYOUT_RELATIVE[value]));
                                }
                            }
                            else {
                                const attr = LAYOUT_RELATIVE_PARENT[value];
                                if (attr) {
                                    node.delete('android', this.localizeString(attr));
                                }
                            }
                        }
                    }
                }
            }
            anchorClear() {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        node.anchorDelete(...Object.keys(LAYOUT_CONSTRAINT));
                    }
                    else if (renderParent.layoutRelative) {
                        node.anchorDelete(...Object.keys(LAYOUT_RELATIVE_PARENT));
                        node.anchorDelete(...Object.keys(LAYOUT_RELATIVE));
                    }
                }
            }
            alignParent(position) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        const attr = LAYOUT_CONSTRAINT[position];
                        if (attr) {
                            return node.app(this.localizeString(attr)) === 'parent' || node.app(attr) === 'parent';
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr = LAYOUT_RELATIVE_PARENT[position];
                        if (attr) {
                            return node.android(this.localizeString(attr)) === 'true' || node.android(attr) === 'true';
                        }
                    }
                    else if (renderParent.layoutLinear) {
                        const children = renderParent.renderChildren;
                        if (renderParent.layoutVertical) {
                            switch (position) {
                                case 'top':
                                    return node === children[0];
                                case 'bottom':
                                    return node === children[children.length - 1];
                            }
                        }
                        else {
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
                        }
                        else if (renderParent.layoutRelative) {
                            const attr = LAYOUT_RELATIVE[position];
                            if (attr) {
                                node.android(this.localizeString(attr), documentId);
                            }
                        }
                    }
                    else {
                        if (renderParent.layoutConstraint) {
                            const attr = LAYOUT_CONSTRAINT[position];
                            if (attr) {
                                const value = node.app(this.localizeString(attr)) || node.app(attr);
                                return value !== 'parent' && value !== renderParent.documentId ? value : '';
                            }
                        }
                        else if (renderParent.layoutRelative) {
                            const attr = LAYOUT_RELATIVE[position];
                            if (attr) {
                                return node.android(this.localizeString(attr)) || node.android(attr);
                            }
                        }
                    }
                }
                return '';
            }
            supported(attr, result = {}) {
                var _a;
                if (typeof DEPRECATED[attr] === 'function') {
                    const valid = DEPRECATED[attr](result, this._api, this);
                    if (!valid || Object.keys(result).length) {
                        return valid;
                    }
                }
                for (let i = this._api; i <= 29 /* LATEST */; i++) {
                    const callback = (_a = API_ANDROID[i]) === null || _a === void 0 ? void 0 : _a.android[attr];
                    if (callback !== undefined) {
                        if (typeof callback === 'function') {
                            return callback(result, this._api, this);
                        }
                        return callback;
                    }
                }
                return true;
            }
            combine(...objs) {
                const namespaces = this._namespaces;
                const all = objs.length === 0;
                const result = [];
                let requireId = false;
                let id = '';
                for (const name of namespaces) {
                    if (all || objs.includes(name)) {
                        const obj = this['__' + name];
                        if (obj) {
                            const prefix = name + ':';
                            switch (name) {
                                case 'android':
                                    if (this._api < 29 /* LATEST */) {
                                        for (let attr in obj) {
                                            if (attr === 'id') {
                                                id = obj[attr];
                                            }
                                            else {
                                                const data = {};
                                                let value = obj[attr];
                                                if (!this.supported(attr, data)) {
                                                    continue;
                                                }
                                                if (Object.keys(data).length) {
                                                    if (isString$2(data.attr)) {
                                                        attr = data.attr;
                                                    }
                                                    if (isString$2(data.value)) {
                                                        value = data.value;
                                                    }
                                                }
                                                result.push(prefix + `${attr}="${value}"`);
                                            }
                                        }
                                    }
                                    else {
                                        for (const attr in obj) {
                                            if (attr === 'id') {
                                                id = obj[attr];
                                            }
                                            else {
                                                result.push(prefix + `${attr}="${obj[attr]}"`);
                                            }
                                        }
                                    }
                                    requireId = true;
                                    break;
                                case '_':
                                    for (const attr in obj) {
                                        result.push(`${attr}="${obj[attr]}"`);
                                    }
                                    break;
                                default:
                                    for (const attr in obj) {
                                        result.push(prefix + `${attr}="${obj[attr]}"`);
                                    }
                                    break;
                            }
                        }
                    }
                }
                result.sort((a, b) => a > b ? 1 : -1);
                if (requireId) {
                    result.unshift(`android:id="${id !== '' ? id : '@+id/' + this.controlId}"`);
                }
                return result;
            }
            localizeString(value) {
                return localizeString(value, this._localization, this._api);
            }
            hide(invisible) {
                if (invisible) {
                    this.android('visibility', 'invisible');
                }
                else {
                    super.hide();
                }
            }
            clone(id, attributes = true, position = false) {
                const node = new View(id || this.id, this.sessionId, this.element || undefined);
                node.localSettings = Object.assign({}, this.localSettings);
                if (id !== undefined) {
                    node.setControlType(this.controlName, this.containerType);
                }
                else {
                    node.controlId = this.controlId;
                    node.controlName = this.controlName;
                    node.containerType = this.containerType;
                }
                this.cloneBase(node);
                if (attributes) {
                    Object.assign(node.unsafe('boxReset'), this._boxReset);
                    Object.assign(node.unsafe('boxAdjustment'), this._boxAdjustment);
                    for (const name of this._namespaces) {
                        const obj = this['__' + name];
                        if (obj) {
                            for (const attr in obj) {
                                node.attr(name, attr, attr === 'id' && name === 'android' ? node.documentId : obj[attr]);
                            }
                        }
                    }
                }
                if (position) {
                    node.anchorClear();
                    const documentId = this.documentId;
                    if (node.anchor('left', documentId)) {
                        node.modifyBox(16 /* MARGIN_LEFT */);
                        Object.assign(node.unsafe('boxAdjustment'), { marginLeft: 0 });
                    }
                    if (node.anchor('top', documentId)) {
                        node.modifyBox(2 /* MARGIN_TOP */);
                        Object.assign(node.unsafe('boxAdjustment'), { marginTop: 0 });
                    }
                }
                node.saveAsInitial();
                return node;
            }
            setControlType(controlName, containerType) {
                var _a;
                this.controlName = controlName;
                if (containerType) {
                    this.containerType = containerType;
                }
                else if (this.containerType === 0) {
                    this.containerType = CONTAINER_NODE.UNKNOWN;
                }
                if (this.controlId === '') {
                    let name;
                    if (this.styleElement) {
                        const elementId = this.elementId;
                        const value = ((_a = elementId) === null || _a === void 0 ? void 0 : _a.trim()) || getNamedItem(this.element, 'name');
                        if (value !== '') {
                            name = value.replace(REGEX_VALIDSTRING, '_').toLowerCase();
                            if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                                name = '_' + name;
                            }
                        }
                    }
                    this.controlId = convertWord(squared.base.ResourceUI.generateId('android', name || fromLastIndexOf$1(this.controlName, '.').toLowerCase(), name ? 0 : 1));
                }
            }
            setLayout() {
                switch (this.css('visibility')) {
                    case 'hidden':
                    case 'collapse':
                        this.hide(true);
                        break;
                }
                if (this.plainText) {
                    this.setLayoutWidth('wrap_content', false);
                    this.setLayoutHeight('wrap_content', false);
                    return;
                }
                const documentParent = this.documentParent;
                const renderParent = this.renderParent;
                const maxDimension = this.support.maxDimension;
                let adjustViewBounds = false;
                if (this.documentBody) {
                    if (this.css('width') === '100%' || this.css('minWidth') === '100%' || !this.hasWidth && (this.layoutConstraint || this.layoutRelative) && this.renderChildren.some(node => node.alignParent('right'))) {
                        this.setLayoutWidth('match_parent', false);
                    }
                    if (this.css('height') === '100%' || this.css('minHeight') === '100%' || !this.hasHeight && this.layoutConstraint && this.renderChildren.some(node => node.alignParent('bottom'))) {
                        this.setLayoutHeight('match_parent', false);
                    }
                }
                if (this.layoutWidth === '') {
                    let layoutWidth = '';
                    if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                        const width = this.css('width');
                        let value = -1;
                        if (isLength(width)) {
                            value = this.actualWidth;
                        }
                        else if (isPercent(width)) {
                            if (this.inputElement) {
                                value = this.bounds.width;
                            }
                            else if (renderParent.layoutConstraint && !renderParent.hasPX('width', false)) {
                                if (width === '100%') {
                                    layoutWidth = 'match_parent';
                                }
                                else {
                                    this.app('layout_constraintWidth_percent', truncate$1(parseFloat(width) / 100, this.localSettings.floatPrecision));
                                    layoutWidth = '0px';
                                }
                                adjustViewBounds = true;
                            }
                            else if (renderParent.is(CONTAINER_NODE.GRID)) {
                                layoutWidth = '0px';
                                this.android('layout_columnWeight', truncate$1(parseFloat(width) / 100, this.localSettings.floatPrecision));
                                adjustViewBounds = true;
                            }
                            else if (this.imageElement) {
                                if (width === '100%' && !renderParent.inlineWidth) {
                                    layoutWidth = 'match_parent';
                                }
                                else {
                                    value = this.bounds.width;
                                    adjustViewBounds = true;
                                }
                            }
                            else if (width === '100%') {
                                if (!maxDimension) {
                                    const maxWidth = this.css('maxWidth');
                                    const maxValue = this.parseUnit(maxWidth);
                                    const absoluteParent = this.absoluteParent || documentParent;
                                    if (maxWidth === '100%') {
                                        if (!renderParent.inlineWidth && aboveRange(maxValue, absoluteParent.box.width)) {
                                            layoutWidth = 'match_parent';
                                        }
                                        else {
                                            value = Math.min(this.actualWidth, maxValue);
                                        }
                                    }
                                    else if (maxValue > 0) {
                                        if (this.blockDimension) {
                                            value = Math.min(this.actualWidth, maxValue);
                                        }
                                        else {
                                            layoutWidth = Math.ceil(maxValue) < Math.floor(absoluteParent.width) ? 'wrap_content' : 'match_parent';
                                        }
                                    }
                                }
                                if (layoutWidth === '' && (this.documentRoot || !renderParent.inlineWidth)) {
                                    layoutWidth = 'match_parent';
                                }
                            }
                            else {
                                value = this.actualWidth;
                            }
                        }
                        if (value > 0) {
                            layoutWidth = formatPX(value);
                        }
                    }
                    else if (this.length) {
                        switch (this.cssInitial('width')) {
                            case 'max-content':
                            case 'fit-content':
                                for (const node of this.renderChildren) {
                                    if (!node.hasPX('width')) {
                                        node.setLayoutWidth('wrap_content');
                                    }
                                }
                                layoutWidth = 'wrap_content';
                                break;
                            case 'min-content':
                                const nodes = [];
                                let maxWidth = 0;
                                for (const node of this.renderChildren) {
                                    if (!node.textElement || node.hasPX('width')) {
                                        const actualWidth = node.actualWidth;
                                        if (actualWidth > maxWidth) {
                                            maxWidth = actualWidth;
                                        }
                                    }
                                    else {
                                        const minWidth = node.parseUnit(node.css('minWidth'));
                                        if (minWidth > maxWidth) {
                                            maxWidth = minWidth;
                                        }
                                        nodes.push(node);
                                    }
                                }
                                if (nodes.length) {
                                    const widthPX = formatPX(maxWidth);
                                    for (const node of nodes) {
                                        node.css('maxWidth', widthPX);
                                    }
                                }
                                layoutWidth = 'wrap_content';
                                break;
                        }
                    }
                    else if (this.imageElement && this.hasPX('height')) {
                        layoutWidth = 'wrap_content';
                        adjustViewBounds = true;
                    }
                    if (layoutWidth === '') {
                        if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                            layoutWidth = formatPX(this.actualWidth);
                        }
                        else {
                            const checkParentWidth = () => {
                                let current = renderParent;
                                let blockAll = true;
                                do {
                                    if (!current.blockWidth) {
                                        blockAll = false;
                                        if (!current.inlineWidth) {
                                            layoutWidth = 'match_parent';
                                        }
                                        else if (this.styleElement && this.cssTry('display', 'inline-block')) {
                                            if (this.boundingClientRect.width < this.bounds.width) {
                                                layoutWidth = 'match_parent';
                                            }
                                            this.cssFinally('display');
                                        }
                                        return;
                                    }
                                    else if (current.documentBody) {
                                        break;
                                    }
                                    current = current.renderParent;
                                } while (current);
                                if (blockAll && (renderParent.layoutVertical || renderParent.layoutFrame || this.onlyChild || (renderParent.layoutRelative || renderParent.layoutConstraint) && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '')) {
                                    layoutWidth = 'match_parent';
                                }
                            };
                            if (this.blockStatic && !this.inputElement && !renderParent.is(CONTAINER_NODE.GRID)) {
                                if (this.display === 'flex') {
                                    if (renderParent.layoutConstraint && this.css('flexDirection').startsWith('column')) {
                                        layoutWidth = '0px';
                                    }
                                    else if (!documentParent.layoutElement) {
                                        layoutWidth = 'match_parent';
                                    }
                                }
                                else if (!documentParent.layoutElement) {
                                    checkParentWidth();
                                }
                            }
                            if (layoutWidth === '' && !this.floating) {
                                if (this.layoutVertical && !renderParent.inlineWidth && (renderParent.layoutFrame && this.rightAligned || this.layoutLinear && this.naturalElements.some(item => item.lineBreak) || this.renderChildren.some(item => item.layoutConstraint && item.blockStatic)) && !this.documentRoot ||
                                    !this.pageFlow && this.absoluteParent === documentParent && this.hasPX('left') && this.hasPX('right') ||
                                    this.is(CONTAINER_NODE.GRID) && this.some((node) => parseFloat(node.android('layout_columnWeight')) > 0) ||
                                    documentParent.flexElement && this.flexbox.grow > 0 && renderParent.flexibleWidth && documentParent.css('flexDirection').startsWith('row')) {
                                    layoutWidth = 'match_parent';
                                }
                                else if (this.naturalElement && !this.inlineHorizontal && this.some(item => item.naturalElement && item.blockStatic && item.textElement) && !documentParent.layoutElement) {
                                    checkParentWidth();
                                }
                            }
                        }
                    }
                    this.setLayoutWidth(layoutWidth || 'wrap_content');
                }
                let layoutHeight = this.layoutHeight;
                if (this.layoutHeight === '') {
                    if (this.hasPX('height') && (!this.inlineStatic || this.cssInitial('height') === '')) {
                        const height = this.css('height');
                        let value = -1;
                        if (isLength(height)) {
                            value = this.actualHeight;
                        }
                        else if (isPercent(height)) {
                            if (this.inputElement) {
                                value = this.bounds.height;
                            }
                            else if (this.imageElement) {
                                if (height === '100%' && !renderParent.inlineHeight) {
                                    layoutHeight = 'match_parent';
                                }
                                else {
                                    value = this.bounds.height;
                                    adjustViewBounds = true;
                                }
                            }
                            else if (height === '100%') {
                                if (!maxDimension) {
                                    const maxHeight = this.css('maxHeight');
                                    const maxValue = this.parseUnit(maxHeight);
                                    const absoluteParent = this.absoluteParent || documentParent;
                                    if (maxHeight === '100%') {
                                        if (!renderParent.inlineHeight && aboveRange(maxValue, absoluteParent.box.height)) {
                                            layoutHeight = 'match_parent';
                                        }
                                        else {
                                            value = Math.min(this.actualHeight, maxValue);
                                        }
                                    }
                                    else if (maxValue > 0) {
                                        if (this.blockDimension) {
                                            value = Math.min(this.actualHeight, maxValue);
                                        }
                                        else {
                                            layoutHeight = Math.ceil(maxValue) < Math.floor(absoluteParent.box.height) ? 'wrap_content' : 'match_parent';
                                        }
                                    }
                                }
                                if (layoutHeight === '' && (this.documentRoot || this.onlyChild && !renderParent.inlineHeight)) {
                                    layoutHeight = 'match_parent';
                                }
                            }
                            if (layoutHeight === '' && this.hasHeight) {
                                value = this.actualHeight;
                            }
                        }
                        if (value > 0) {
                            if (this.is(CONTAINER_NODE.LINE) && this.tagName !== 'HR' && this.hasPX('height', true, true)) {
                                value += this.borderTopWidth + this.borderBottomWidth;
                            }
                            layoutHeight = formatPX(value);
                        }
                    }
                    else if (this.imageElement && this.hasPX('width')) {
                        layoutHeight = 'wrap_content';
                        adjustViewBounds = true;
                    }
                    if (layoutHeight === '') {
                        if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                            if (renderParent.layoutConstraint && !this.floating && this.alignParent('top') && this.actualHeight >= (this.absoluteParent || documentParent).box.height) {
                                layoutHeight = '0px';
                                this.anchor('bottom', 'parent');
                            }
                            else {
                                layoutHeight = formatPX(this.actualHeight);
                            }
                        }
                        else if (this.display === 'table-cell' || !this.pageFlow && this.leftTopAxis && this.hasPX('top') && this.hasPX('bottom') || this.onlyChild && renderParent.flexElement && !renderParent.inlineHeight && renderParent.css('flexDirection').startsWith('row') && this.outerWrapper === undefined) {
                            layoutHeight = 'match_parent';
                        }
                    }
                    this.setLayoutHeight(layoutHeight || 'wrap_content');
                }
                else if (layoutHeight === '0px' && renderParent.inlineHeight && renderParent.android('minHeight') === '' && !documentParent.layoutElement) {
                    this.setLayoutHeight('wrap_content');
                }
                const isFlexible = (direction) => !(documentParent.flexElement && documentParent.css('flexDirection').startsWith(direction) && this.flexbox.grow > 0);
                if (this.hasPX('minWidth') && isFlexible('column')) {
                    this.android('minWidth', this.convertPX(this.css('minWidth')), false);
                }
                if (this.hasPX('minHeight') && isFlexible('row') && this.display !== 'table-cell') {
                    this.android('minHeight', this.convertPX(this.css('minHeight'), 'height'), false);
                }
                if (maxDimension) {
                    const maxWidth = this.css('maxWidth');
                    const maxHeight = this.css('maxHeight');
                    let width = -1;
                    if (isLength(maxWidth, true)) {
                        if (maxWidth === '100%') {
                            if (this.svgElement) {
                                width = this.bounds.width;
                            }
                            else if (this.imageElement) {
                                width = this.toElementInt('naturalWidth');
                                if (width > documentParent.actualWidth) {
                                    width = -1;
                                    this.setLayoutWidth('match_parent');
                                    adjustViewBounds = true;
                                }
                            }
                            else if (!renderParent.inlineWidth) {
                                this.setLayoutWidth('match_parent');
                                adjustViewBounds = true;
                            }
                        }
                        else {
                            width = this.parseUnit(maxWidth);
                        }
                    }
                    else if (!this.pageFlow && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && (this.ascend(item => item.hasPX('width')).length > 0 || !/\n/.test(this.textContent))) {
                        width = Math.ceil(this.bounds.width);
                    }
                    if (width >= 0) {
                        this.android('maxWidth', formatPX(width), false);
                        if (this.textElement) {
                            this.android('ellipsize', 'end');
                        }
                        else if (this.imageElement) {
                            adjustViewBounds = true;
                        }
                    }
                    if (isLength(maxHeight, true)) {
                        let height = -1;
                        if (maxHeight === '100%' && !this.svgElement) {
                            if (!renderParent.inlineHeight) {
                                this.setLayoutHeight('match_parent');
                                adjustViewBounds = true;
                            }
                            else {
                                height = this.imageElement ? this.toElementInt('naturalHeight') : this.parseUnit(maxHeight, 'height');
                            }
                        }
                        else {
                            height = this.parseUnit(maxHeight, 'height');
                        }
                        if (height >= 0) {
                            this.android('maxHeight', formatPX(height));
                            if (this.imageElement) {
                                adjustViewBounds = true;
                            }
                        }
                    }
                }
                if (this.imageElement && (adjustViewBounds || this.blockWidth || this.blockHeight)) {
                    this.android('adjustViewBounds', 'true');
                }
            }
            setAlignment() {
                const node = this.outerWrapper || this;
                const renderParent = this.renderParent;
                const outerRenderParent = (node.renderParent || renderParent);
                const { autoMargin, rightAligned } = this;
                let textAlign = checkTextAlign(this.cssInitial('textAlign', true), false);
                let textAlignParent = checkTextAlign(this.cssAscend('textAlign'), true);
                if (this.nodeGroup && textAlign === '' && !this.hasAlign(512 /* FLOAT */)) {
                    const parent = this.actualParent;
                    if (parent) {
                        textAlign = checkTextAlign(parent.cssInitial('textAlign', true), false);
                    }
                }
                if (this.pageFlow) {
                    let floating = '';
                    if (this.inlineVertical && (outerRenderParent.layoutHorizontal && !outerRenderParent.support.container.positionRelative || outerRenderParent.is(CONTAINER_NODE.GRID) || this.display === 'table-cell')) {
                        const gravity = this.display === 'table-cell' ? 'gravity' : 'layout_gravity';
                        switch (this.cssInitial('verticalAlign', true)) {
                            case 'top':
                                node.mergeGravity(gravity, 'top');
                                break;
                            case 'middle':
                                node.mergeGravity(gravity, STRING_ANDROID.CENTER_VERTICAL);
                                break;
                            case 'bottom':
                                node.mergeGravity(gravity, 'bottom');
                                break;
                        }
                    }
                    if (!this.blockWidth) {
                        if (outerRenderParent.layoutVertical || this.documentRoot && (this.layoutVertical || this.layoutFrame)) {
                            if (this.floating) {
                                node.mergeGravity('layout_gravity', this.float);
                            }
                            else if (!setAutoMargin(node, autoMargin) && textAlign !== '' && this.hasWidth && !this.blockStatic && this.display !== 'table') {
                                node.mergeGravity('layout_gravity', textAlign, false);
                            }
                        }
                        if (rightAligned) {
                            floating = 'right';
                        }
                        else if (this.nodeGroup) {
                            if (this.renderChildren.every(item => item.rightAligned)) {
                                floating = 'right';
                            }
                            else if (this.hasAlign(512 /* FLOAT */) && !this.renderChildren.some(item => item.rightAligned)) {
                                floating = 'left';
                            }
                        }
                    }
                    else if (rightAligned && node.nodeGroup && node.layoutVertical) {
                        node.renderEach((item) => {
                            if (item.rightAligned) {
                                item.mergeGravity('layout_gravity', 'right');
                            }
                        });
                    }
                    if (renderParent.layoutFrame && this.innerWrapped === undefined) {
                        if (!setAutoMargin(this, autoMargin)) {
                            if (this.floating) {
                                floating = this.float;
                            }
                            if (floating !== '' && !renderParent.naturalElement && (renderParent.inlineWidth || !renderParent.documentRoot && this.onlyChild)) {
                                renderParent.mergeGravity('layout_gravity', floating);
                                floating = '';
                            }
                            if (this.centerAligned) {
                                this.mergeGravity('layout_gravity', checkTextAlign('center', false));
                            }
                        }
                        if (this.onlyChild && renderParent.display === 'table-cell') {
                            let gravity;
                            switch (renderParent.css('verticalAlign')) {
                                case 'top':
                                    gravity = 'top';
                                    break;
                                case 'bottom':
                                    gravity = 'bottom';
                                    break;
                                default:
                                    gravity = STRING_ANDROID.CENTER_VERTICAL;
                                    break;
                            }
                            this.mergeGravity('layout_gravity', gravity);
                        }
                    }
                    else if (rightAligned && outerRenderParent.layoutFrame && renderParent.blockWidth) {
                        this.mergeGravity('layout_gravity', 'right');
                    }
                    if (floating !== '') {
                        if (this.blockWidth) {
                            if (textAlign === '' || floating === 'right') {
                                textAlign = floating;
                            }
                        }
                        else {
                            (node.blockWidth && this !== node ? this : node).mergeGravity('layout_gravity', floating);
                        }
                    }
                    else if (setAutoMargin(node.inlineWidth ? node : this, autoMargin) && textAlign !== '') {
                        textAlignParent = '';
                    }
                }
                if (textAlignParent !== '' && this.blockStatic && !this.centerAligned && !rightAligned) {
                    node.mergeGravity('layout_gravity', 'left', false);
                }
                if (!this.layoutConstraint && !this.layoutFrame && !this.is(CONTAINER_NODE.GRID) && !this.layoutElement) {
                    if (textAlign !== '') {
                        if (!this.imageOrSvgElement) {
                            this.mergeGravity('gravity', textAlign);
                        }
                    }
                    else if (textAlignParent !== '' && !this.inputElement) {
                        if (this.imageOrSvgElement) {
                            if (this.pageFlow) {
                                this.mergeGravity('layout_gravity', textAlignParent);
                            }
                        }
                        else if (!this.nodeGroup || !this.hasAlign(512 /* FLOAT */)) {
                            this.mergeGravity('gravity', textAlignParent);
                        }
                    }
                }
                if (autoMargin.vertical && (renderParent.layoutFrame || renderParent.layoutLinear && renderParent.layoutVertical)) {
                    node.mergeGravity('layout_gravity', autoMargin.topBottom ? STRING_ANDROID.CENTER_VERTICAL : (autoMargin.top ? 'bottom' : 'top'));
                }
            }
            mergeGravity(attr, alignment, overwrite = true) {
                if (attr === 'layout_gravity') {
                    const renderParent = this.renderParent;
                    if (renderParent) {
                        if (isHorizontalAlign(alignment) && (this.blockWidth || renderParent.inlineWidth && this.onlyChild || !overwrite && this.outerWrapper && this.hasPX('maxWidth'))) {
                            return;
                        }
                        else if (renderParent.layoutRelative) {
                            if (alignment === STRING_ANDROID.CENTER_HORIZONTAL && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '') {
                                this.anchorDelete('left', 'right');
                                this.anchor('centerHorizontal', 'true');
                                return;
                            }
                        }
                        else if (renderParent.layoutConstraint) {
                            if (!renderParent.layoutHorizontal && !this.positioned) {
                                switch (alignment) {
                                    case 'top':
                                        this.anchor('top', 'parent', false);
                                        break;
                                    case 'right':
                                    case 'end':
                                        if (this.alignSibling('rightLeft') === '') {
                                            this.anchor('right', 'parent', false);
                                        }
                                        break;
                                    case 'bottom':
                                        this.anchor('bottom', 'parent', false);
                                        break;
                                    case 'left':
                                    case 'start':
                                        if (this.alignSibling('leftRight') === '') {
                                            this.anchor('left', 'parent', false);
                                        }
                                        break;
                                    case STRING_ANDROID.CENTER_HORIZONTAL:
                                        if (this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '') {
                                            this.anchorParent(STRING_ANDROID.HORIZONTAL, undefined, undefined, true);
                                        }
                                        break;
                                }
                            }
                            return;
                        }
                    }
                }
                else if (this.is(CONTAINER_NODE.TEXT) && this.textEmpty) {
                    return;
                }
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
                        result = checkTextAlign(direction.values().next().value, false);
                    default:
                        function checkMergable(value) {
                            const horizontal = value + '_horizontal';
                            const vertical = value + '_vertical';
                            if (direction.has(value) || direction.has(horizontal) && direction.has(vertical)) {
                                direction.delete(horizontal);
                                direction.delete(vertical);
                                direction.add(value);
                            }
                        }
                        checkMergable('center');
                        checkMergable('fill');
                        let x = '';
                        let y = '';
                        let z = '';
                        for (const value of direction.values()) {
                            switch (value) {
                                case 'left':
                                case 'start':
                                case 'right':
                                case 'end':
                                case STRING_ANDROID.CENTER_HORIZONTAL:
                                    if (x === '' || overwrite) {
                                        x = value;
                                    }
                                    break;
                                case 'top':
                                case 'bottom':
                                case STRING_ANDROID.CENTER_VERTICAL:
                                    if (y === '' || overwrite) {
                                        y = value;
                                    }
                                    break;
                                default:
                                    z += (z !== '' ? '|' : '') + value;
                                    break;
                            }
                        }
                        result = x !== '' && y !== '' ? x + '|' + y : x || y;
                        if (z !== '') {
                            result += (result !== '' ? '|' : '') + z;
                        }
                }
                if (result !== '') {
                    this.android(attr, result);
                }
            }
            applyOptimizations() {
                const renderParent = this.renderParent;
                if (renderParent) {
                    const borderWidth = !this.tableElement ? this.styleElement : this.css('boxSizing') === 'content-box' || isUserAgent(8 /* FIREFOX */);
                    if (borderWidth && this.visibleStyle.borderWidth && !this.is(CONTAINER_NODE.LINE) && (this.renderChildren.length === 0 || !this.naturalChildren.every(node => !node.pageFlow && node.absoluteParent === this))) {
                        this.modifyBox(256 /* PADDING_LEFT */, this.borderLeftWidth);
                        this.modifyBox(64 /* PADDING_RIGHT */, this.borderRightWidth);
                        this.modifyBox(32 /* PADDING_TOP */, this.borderTopWidth);
                        this.modifyBox(128 /* PADDING_BOTTOM */, this.borderBottomWidth);
                    }
                    this.alignLayout(renderParent);
                    this.setLineHeight(renderParent);
                    if (this.inlineWidth && this.renderChildren.some(node => node.blockWidth && node.some((item) => item.flexibleWidth))) {
                        this.setLayoutWidth(this.documentRoot || renderParent.inlineWidth ? formatPX(this.actualWidth) : 'match_parent');
                    }
                }
            }
            applyCustomizations(overwrite = true) {
                const setCustomization = (obj) => {
                    if (obj) {
                        for (const name in obj) {
                            const data = obj[name];
                            for (const attr in data) {
                                this.attr(name, attr, data[attr], overwrite);
                            }
                        }
                    }
                };
                const { tagName, controlName } = this;
                let assign = API_ANDROID[0].assign;
                setCustomization(assign[tagName]);
                setCustomization(assign[controlName]);
                const api = API_ANDROID[this._api];
                if (api) {
                    assign = api.assign;
                    setCustomization(assign[tagName]);
                    setCustomization(assign[controlName]);
                }
            }
            setBoxSpacing() {
                var _a;
                const boxReset = this._boxReset;
                const boxAdjustment = this._boxAdjustment;
                const setBoxModel = (attrs, margin, unmergeable) => {
                    let top = 0;
                    let right = 0;
                    let bottom = 0;
                    let left = 0;
                    for (let i = 0; i < 4; i++) {
                        const attr = attrs[i];
                        let value = boxReset === undefined || boxReset[attr] === 0 ? this[attr] : 0;
                        if (value !== 0) {
                            switch (attr) {
                                case 'marginRight': {
                                    if (value < 0) {
                                        if (this.float === 'right' && aboveRange(this.linear.right, this.documentParent.box.right)) {
                                            value = 0;
                                        }
                                    }
                                    else if (this.inline) {
                                        const outer = this.documentParent.box.right;
                                        const inner = this.bounds.right;
                                        if (Math.floor(inner) > outer) {
                                            if (!this.onlyChild && !this.alignParent('left')) {
                                                this.setSingleLine(true);
                                            }
                                            continue;
                                        }
                                        else if (inner + value > outer) {
                                            value = clampRange(outer - inner, 0, value);
                                        }
                                    }
                                    break;
                                }
                                case 'marginBottom':
                                    if (value < 0 && this.pageFlow && !this.blockStatic) {
                                        value = 0;
                                    }
                                    break;
                                case 'paddingTop':
                                case 'paddingBottom':
                                    value = this.actualPadding(attr, value);
                                    break;
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
                    if (top !== 0 || left !== 0 || bottom !== 0 || right !== 0) {
                        let mergeAll = 0;
                        let mergeHorizontal = 0;
                        let mergeVertical = 0;
                        if (margin && this.positionStatic && !this.blockWidth && (left < 0 || right < 0)) {
                            switch (this.cssAscend('textAlign')) {
                                case 'center': {
                                    if (left < right) {
                                        right += Math.abs(left);
                                        right /= 2;
                                        left = 0;
                                    }
                                    else {
                                        left += Math.abs(right);
                                        left /= 2;
                                        right = 0;
                                    }
                                    break;
                                }
                                case 'right':
                                case 'end':
                                    if (left < 0) {
                                        left = 0;
                                    }
                                    break;
                            }
                        }
                        if (!unmergeable && this._api >= 26 /* OREO */) {
                            if (top === right && right === bottom && bottom === left) {
                                mergeAll = top;
                            }
                            else {
                                if (left === right) {
                                    mergeHorizontal = left;
                                }
                                if (top === bottom) {
                                    mergeVertical = top;
                                }
                            }
                        }
                        if (mergeAll !== 0) {
                            this.android(margin ? STRING_ANDROID.MARGIN : STRING_ANDROID.PADDING, formatPX(mergeAll));
                        }
                        else {
                            if (mergeHorizontal !== 0) {
                                this.android(margin ? STRING_ANDROID.MARGIN_HORIZONTAL : STRING_ANDROID.PADDING_HORIZONTAL, formatPX(mergeHorizontal));
                            }
                            else {
                                if (left !== 0) {
                                    this.android(this.localizeString(margin ? STRING_ANDROID.MARGIN_LEFT : STRING_ANDROID.PADDING_LEFT), formatPX(left));
                                }
                                if (right !== 0) {
                                    this.android(this.localizeString(margin ? STRING_ANDROID.MARGIN_RIGHT : STRING_ANDROID.PADDING_RIGHT), formatPX(right));
                                }
                            }
                            if (mergeVertical !== 0) {
                                this.android(margin ? STRING_ANDROID.MARGIN_VERTICAL : STRING_ANDROID.PADDING_VERTICAL, formatPX(mergeVertical));
                            }
                            else {
                                if (top !== 0) {
                                    this.android(margin ? STRING_ANDROID.MARGIN_TOP : STRING_ANDROID.PADDING_TOP, formatPX(top));
                                }
                                if (bottom !== 0) {
                                    this.android(margin ? STRING_ANDROID.MARGIN_BOTTOM : STRING_ANDROID.PADDING_BOTTOM, formatPX(bottom));
                                }
                            }
                        }
                    }
                };
                setBoxModel(BOX_MARGIN, true, ((_a = this.renderParent) === null || _a === void 0 ? void 0 : _a.is(CONTAINER_NODE.GRID)) === true);
                setBoxModel(BOX_PADDING, false, false);
            }
            setSingleLine(ellipsize = false) {
                if (this.textElement && this.naturalChild) {
                    const parent = this.actualParent;
                    if (!parent.preserveWhiteSpace && parent.tagName !== 'CODE' && (!this.multiline || parent.css('whiteSpace') === 'nowrap')) {
                        this.android('maxLines', '1');
                    }
                    if (ellipsize && this.textContent.trim().length > 1) {
                        this.android('ellipsize', 'end');
                    }
                }
            }
            extractAttributes(depth) {
                if (this.dir === 'rtl' && !this.imageOrSvgElement) {
                    if (this.textElement) {
                        this.android('textDirection', 'rtl');
                    }
                    else if (this.renderChildren.length) {
                        this.android('layoutDirection', 'rtl');
                    }
                }
                if (this.styleElement) {
                    const dataset = getDataSet(this.element, 'android');
                    for (const namespace in dataset) {
                        const name = namespace === 'attr' ? 'android' : (REGEX_DATASETATTR.test(namespace) ? capitalize(namespace.substring(4), false) : '');
                        if (name !== '') {
                            for (const values of dataset[namespace].split(';')) {
                                const [key, value] = values.split('::');
                                if (key) {
                                    this.attr(name, key, value);
                                }
                            }
                        }
                    }
                    if (this.naturalElement) {
                        const opacity = this.css('opacity');
                        if (opacity !== '1') {
                            this.android('alpha', opacity);
                        }
                    }
                }
                const indent = '\n' + '\t'.repeat(depth);
                let output = '';
                for (const value of this.combine()) {
                    output += indent + value;
                }
                return output;
            }
            setLayoutWidth(value, overwrite = true) {
                this.android('layout_width', value, overwrite);
            }
            setLayoutHeight(value, overwrite = true) {
                this.android('layout_height', value, overwrite);
            }
            alignLayout(renderParent) {
                if (this.layoutLinear) {
                    if (this.layoutVertical) {
                        if (!renderParent.layoutVertical && !renderParent.layoutFrame && !this.documentRoot && !this.hasAlign(1024 /* TOP */)) {
                            let children = this.renderChildren;
                            let firstChild;
                            do {
                                firstChild = children[0];
                                if (firstChild && firstChild.naturalChild) {
                                    break;
                                }
                                children = firstChild.renderChildren;
                            } while (children.length);
                            if (firstChild.baseline && (firstChild.textElement || firstChild.inputElement)) {
                                this.android('baselineAlignedChildIndex', '0');
                            }
                        }
                    }
                    else {
                        const children = this.renderChildren;
                        if (children.some(node => node.floating) && !children.some(node => node.imageElement && node.baseline)) {
                            this.android('baselineAligned', 'false');
                        }
                        else {
                            const baseline = squared.base.NodeUI.baseline(children, true);
                            if (baseline && (baseline.textElement || baseline.inputElement)) {
                                this.android('baselineAlignedChildIndex', children.indexOf(baseline).toString());
                            }
                        }
                        const length = children.length;
                        for (let i = 1; i < length; i++) {
                            children[i].setSingleLine(i === length - 1);
                        }
                    }
                }
            }
            setLineHeight(renderParent) {
                var _a;
                let lineHeight = this.lineHeight;
                if (lineHeight > 0) {
                    const hasOwnStyle = this.has('lineHeight');
                    if (this.multiline) {
                        setMultiline(this, lineHeight, hasOwnStyle, true);
                    }
                    else {
                        const hasChildren = this.renderChildren.length > 0;
                        if (hasOwnStyle || hasChildren || renderParent.lineHeight === 0) {
                            if (!hasChildren) {
                                setMarginOffset(this, lineHeight, hasOwnStyle, true, true);
                            }
                            else {
                                if (this.inline) {
                                    this.renderEach(item => {
                                        if (item.lineHeight > lineHeight) {
                                            lineHeight = item.lineHeight;
                                        }
                                        item.setCacheValue('lineHeight', 0);
                                    });
                                    setMarginOffset(this, lineHeight, hasOwnStyle, true, true);
                                }
                                else {
                                    const horizontalRows = this.horizontalRows || [this.renderChildren];
                                    let previousMultiline = false;
                                    const length = horizontalRows.length;
                                    for (let i = 0; i < length; i++) {
                                        const row = horizontalRows[i];
                                        const nextRow = horizontalRows[i + 1];
                                        let nextMultiline = nextRow && (nextRow.length === 1 && nextRow[0].multiline || nextRow[0].lineBreakLeading);
                                        if (!nextMultiline && i < length - 1) {
                                            if ((_a = horizontalRows[i + 1].find(node => node.baselineActive)) === null || _a === void 0 ? void 0 : _a.has('lineHeight')) {
                                                nextMultiline = true;
                                            }
                                        }
                                        const baseline = row.find(node => node.baselineActive);
                                        const singleLine = row.length === 1 && !row[0].multiline;
                                        const top = singleLine || !previousMultiline && (i > 0 || length === 1) || row[0].lineBreakLeading;
                                        const bottom = singleLine || !nextMultiline && (i < length - 1 || length === 1);
                                        if (baseline) {
                                            if (!baseline.has('lineHeight')) {
                                                setMarginOffset(baseline, lineHeight, false, top, bottom);
                                            }
                                            else {
                                                previousMultiline = true;
                                                continue;
                                            }
                                        }
                                        else {
                                            for (const node of row) {
                                                if (node.length === 0 && !node.has('lineHeight') && !node.multiline) {
                                                    setMarginOffset(node, lineHeight, false, top, bottom);
                                                }
                                            }
                                        }
                                        previousMultiline = row.length === 1 && row[0].multiline;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            get documentId() {
                const controlId = this.controlId;
                if (controlId) {
                    return '@id/' + controlId;
                }
                return '';
            }
            get anchorTarget() {
                const outerWrapper = this.outerWrapper;
                if (outerWrapper === undefined) {
                    return this;
                }
                const renderParent = this.renderParent;
                return renderParent && (renderParent.layoutConstraint || renderParent.layoutRelative) ? this : outerWrapper;
            }
            set anchored(value) {
                const constraint = this.constraint;
                constraint.horizontal = value;
                constraint.vertical = value;
            }
            get anchored() {
                const constraint = this.constraint;
                return constraint.horizontal && constraint.vertical;
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
            get imageOrSvgElement() {
                return this.imageElement || this.svgElement;
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
            set renderExclude(value) {
                this._cached.renderExclude = value;
            }
            get renderExclude() {
                let result = this._cached.renderExclude;
                if (result === undefined) {
                    if (this.styleElement && this.length === 0 && !this.imageElement) {
                        const renderParent = this.renderParent;
                        if (this.blockStatic || renderParent && (renderParent.layoutVertical || renderParent.layoutFrame)) {
                            result = this.contentBoxHeight === 0 && ((this.bounds.height === 0 || this.textEmpty && this.pseudoElement && this.pageFlow) && this.marginTop <= 0 && this.marginBottom <= 0 || this.css('overflow') === 'hidden' && $lib$2.regex.CHAR.UNITZERO.test(this.css('height'))) && this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '';
                        }
                        else {
                            result = this.textEmpty && (this.bounds.width === 0 && this.contentBoxWidth === 0 && this.marginLeft <= 0 && this.marginRight <= 0 && !this.visibleStyle.background || this.bounds.height === 0 && this.contentBoxHeight === 0 && this.marginTop <= 0 && this.marginBottom <= 0) && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '' && this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '';
                        }
                    }
                    else {
                        result = false;
                    }
                    this._cached.renderExclude = result;
                }
                return result;
            }
            get baselineHeight() {
                let result = this._cached.baselineHeight;
                if (result === undefined) {
                    result = 0;
                    if (this.plainText) {
                        const bounds = this.bounds;
                        result = bounds.height / (bounds.numberOfLines || 1);
                    }
                    else {
                        if (this.multiline && this.cssTry('white-space', 'nowrap')) {
                            result = this.boundingClientRect.height;
                            this.cssFinally('white-space');
                        }
                        else if (this.hasHeight) {
                            result = this.actualHeight;
                        }
                        else {
                            result = this.bounds.height;
                        }
                        if (this.naturalElement && this.lineHeight > result) {
                            result = this.lineHeight;
                        }
                        else if (this.inputElement) {
                            switch (this.controlName) {
                                case CONTAINER_ANDROID.BUTTON:
                                    result += 2;
                                    break;
                                case CONTAINER_ANDROID.RADIO:
                                case CONTAINER_ANDROID.CHECKBOX:
                                    result += 8;
                                    break;
                                case CONTAINER_ANDROID.SELECT:
                                    result += 4;
                                    result /= this.toElementInt('size') || 1;
                                    break;
                            }
                        }
                        else if (this.is(CONTAINER_NODE.PROGRESS)) {
                            result += 4;
                        }
                    }
                    this._cached.baselineHeight = result;
                }
                return result;
            }
            get leftTopAxis() {
                let result = this._cached.leftTopAxis;
                if (result === undefined) {
                    result = false;
                    switch (this.cssInitial('position')) {
                        case 'absolute':
                            const { absoluteParent, documentParent } = this;
                            if (absoluteParent === documentParent) {
                                result = true;
                            }
                            else if (absoluteParent && absoluteParent.box.right === documentParent.linear.right && this.has('right') && !this.has('left')) {
                                this.css('top', formatPX(this.linear.top - documentParent.box.top), true);
                                result = true;
                            }
                            break;
                        case 'fixed':
                            result = true;
                            break;
                    }
                    this._cached.leftTopAxis = result;
                }
                return result;
            }
            get support() {
                let result = this._cached.support;
                if (result === undefined) {
                    result = {
                        container: {
                            positionRelative: this.layoutRelative || this.layoutConstraint
                        },
                        maxDimension: this.textElement || this.imageOrSvgElement
                    };
                    if (this.containerType !== 0) {
                        this._cached.support = result;
                    }
                }
                return result;
            }
            get layoutWidth() {
                return this.android('layout_width');
            }
            get layoutHeight() {
                return this.android('layout_height');
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
            set localSettings(value) {
                if (this._localSettings) {
                    Object.assign(this._localSettings, value);
                }
                else {
                    this._localSettings = Object.assign({}, value);
                }
                const api = value.targetAPI;
                if (api) {
                    this._api = api;
                }
            }
            get localSettings() {
                return this._localSettings;
            }
        };
    };

    class View extends View$MX(squared.base.NodeUI) {
    }

    class ViewGroup extends View$MX(squared.base.NodeGroupUI) {
        constructor(id, node, children, afterInit) {
            super(id, node.sessionId, undefined, afterInit);
            this.depth = node.depth;
            this.containerName = node.containerName + '_GROUP';
            this.actualParent = node.actualParent;
            this.documentParent = node.documentParent;
            this.retain(children);
        }
    }

    const $lib$3 = squared.lib;
    const { PLATFORM, USER_AGENT: USER_AGENT$1, isPlatform, isUserAgent: isUserAgent$1 } = $lib$3.client;
    const { parseColor: parseColor$1 } = $lib$3.color;
    const { formatPX: formatPX$1, getSrcSet: getSrcSet$1, isLength: isLength$1, isPercent: isPercent$1, parseUnit } = $lib$3.css;
    const { createElement, getElementsBetweenSiblings, getRangeClientRect } = $lib$3.dom;
    const { maxArray, truncate: truncate$2 } = $lib$3.math;
    const { CHAR: CHAR$1 } = $lib$3.regex;
    const { getElementAsNode } = $lib$3.session;
    const { aboveRange: aboveRange$1, assignEmptyValue, convertFloat, filterArray, hasBit, isString: isString$3, objectMap, optionalAsObject, partitionArray, withinRange } = $lib$3.util;
    const { STRING_XMLENCODING, replaceTab } = $lib$3.xml;
    const $base = squared.base;
    const { NodeUI } = $base;
    const { APP_SECTION, BOX_STANDARD: BOX_STANDARD$1, NODE_ALIGNMENT: NODE_ALIGNMENT$1, NODE_PROCEDURE: NODE_PROCEDURE$1, NODE_RESOURCE, NODE_TEMPLATE } = $base.lib.enumeration;
    const GUIDELINE_AXIS = [STRING_ANDROID.HORIZONTAL, STRING_ANDROID.VERTICAL];
    let DEFAULT_VIEWSETTINGS;
    function sortHorizontalFloat(list) {
        if (list.some(node => node.floating)) {
            list.sort((a, b) => {
                const floatingA = a.floating;
                const floatingB = b.floating;
                if (floatingA && floatingB) {
                    const floatA = a.float;
                    const floatB = b.float;
                    if (floatA !== floatB) {
                        return floatA === 'left' ? -1 : 1;
                    }
                    else if (floatA === 'right' && floatB === 'right') {
                        return 1;
                    }
                }
                else if (floatingA) {
                    return a.float === 'left' ? -1 : 1;
                }
                else if (floatingB) {
                    return b.float === 'left' ? 1 : -1;
                }
                return 0;
            });
        }
    }
    function sortConstraintAbsolute(templates) {
        if (templates.length > 1) {
            templates.sort((a, b) => {
                const nodeA = a.node;
                const nodeB = b.node;
                const above = nodeA.innerWrapped || nodeA;
                const below = nodeB.innerWrapped || nodeB;
                if (above.absoluteParent === below.absoluteParent) {
                    if (above.zIndex === below.zIndex) {
                        return above.childIndex < below.childIndex ? -1 : 1;
                    }
                    return above.zIndex < below.zIndex ? -1 : 1;
                }
                else {
                    const bounds = below.bounds;
                    if (above.intersectX(bounds, 'bounds') && above.intersectY(bounds, 'bounds')) {
                        if (above.depth === below.depth) {
                            return 0;
                        }
                        return above.id < below.id ? -1 : 1;
                    }
                }
                return 0;
            });
        }
        return templates;
    }
    function adjustBaseline(baseline, nodes) {
        let imageBaseline;
        let imageHeight = 0;
        for (const node of nodes) {
            if (node !== baseline && !node.baselineAltered) {
                let height = node.bounds.height;
                if (height > 0 || node.textElement) {
                    if (node.blockVertical && baseline.blockVertical) {
                        node.anchor('bottom', baseline.documentId);
                        continue;
                    }
                    else if (!node.textElement && !node.inputElement) {
                        for (const image of node.renderChildren.filter(item => item.imageOrSvgElement && item.baseline)) {
                            if (image.bounds.height > height) {
                                height = image.bounds.height;
                            }
                        }
                        if (height > baseline.bounds.height) {
                            if (imageBaseline === undefined || height >= imageHeight) {
                                if (imageBaseline) {
                                    imageBaseline.anchor(node.imageOrSvgElement ? 'baseline' : 'bottom', node.documentId);
                                }
                                imageBaseline = node;
                                imageHeight = height;
                            }
                            else {
                                node.anchor(imageBaseline.imageOrSvgElement ? 'baseline' : 'bottom', imageBaseline.documentId);
                            }
                            continue;
                        }
                        else if (withinRange(node.linear.top, node.documentParent.box.top)) {
                            node.anchor('top', 'true');
                            continue;
                        }
                    }
                    if (node.naturalChild && node.length === 0 || isLayoutBaselineAligned(node)) {
                        node.anchor('baseline', baseline.documentId);
                    }
                }
                else if (node.imageOrSvgElement && node.baseline) {
                    imageBaseline = node;
                }
            }
        }
        if (imageBaseline) {
            baseline.anchor(imageBaseline.imageOrSvgElement ? 'baseline' : 'bottom', imageBaseline.documentId);
        }
    }
    function isLayoutBaselineAligned(node) {
        if (node.layoutHorizontal) {
            const children = node.renderChildren;
            return children.length > 0 && children.every(item => item.baseline && !item.baselineAltered && (!item.positionRelative || item.positionRelative && item.top === 0 && item.bottom === 0));
        }
        else if (node.layoutVertical) {
            const children = node.renderChildren;
            const firstChild = children[0];
            return !!firstChild && firstChild.baseline && (children.length === 1 || firstChild.textElement);
        }
        return false;
    }
    function adjustAbsolutePaddingOffset(parent, direction, value) {
        if (value > 0) {
            if (parent.documentBody) {
                switch (direction) {
                    case 32 /* PADDING_TOP */:
                        value -= parent.marginTop;
                        break;
                    case 64 /* PADDING_RIGHT */:
                        value -= parent.marginRight;
                        break;
                    case 128 /* PADDING_BOTTOM */:
                        value -= parent.marginBottom;
                        break;
                    case 256 /* PADDING_LEFT */:
                        value -= parent.marginLeft;
                        break;
                }
            }
            if (parent.getBox(direction)[0] !== 1) {
                switch (direction) {
                    case 32 /* PADDING_TOP */:
                        value += parent.borderTopWidth - parent.paddingTop;
                        break;
                    case 64 /* PADDING_RIGHT */:
                        value += parent.borderRightWidth - parent.paddingRight;
                        break;
                    case 128 /* PADDING_BOTTOM */:
                        value += parent.borderBottomWidth - parent.paddingBottom;
                        break;
                    case 256 /* PADDING_LEFT */:
                        value += parent.borderLeftWidth - parent.paddingLeft;
                        break;
                }
            }
            return Math.max(value, 0);
        }
        return value;
    }
    function adjustFloatingNegativeMargin(node, previous) {
        if (previous.float === 'left') {
            if (previous.marginRight < 0) {
                const right = Math.abs(previous.marginRight);
                node.modifyBox(16 /* MARGIN_LEFT */, previous.actualWidth + (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0) - right);
                node.anchor('left', previous.documentId);
                previous.modifyBox(4 /* MARGIN_RIGHT */);
                return true;
            }
        }
        else if (node.float === 'right') {
            if (previous.marginLeft < 0) {
                const left = Math.abs(previous.marginLeft);
                const width = previous.actualWidth;
                if (left < width) {
                    node.modifyBox(4 /* MARGIN_RIGHT */, width - left);
                }
                node.anchor('right', previous.documentId);
                previous.modifyBox(16 /* MARGIN_LEFT */);
                return true;
            }
        }
        return false;
    }
    function constraintMinMax(node, dimension, horizontal) {
        var _a, _b;
        if (!node.inputElement && !node.imageOrSvgElement) {
            const documentParent = node.documentParent;
            const renderParent = node.renderParent;
            function setAlignmentBlock() {
                if (renderParent.nodeGroup) {
                    renderParent.addAlign(64 /* BLOCK */);
                    renderParent.unsetCache('blockStatic');
                }
            }
            if (!node.blockWidth && !documentParent.flexElement) {
                const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', true);
                if (isLength$1(minWH, true) && minWH !== '0px') {
                    let valid = false;
                    if (horizontal) {
                        if (node.ascend(item => item.hasPX('width') || item.blockStatic).length) {
                            node.setLayoutWidth('0px', false);
                            valid = node.flexibleWidth;
                            setAlignmentBlock();
                        }
                    }
                    else if ((node.absoluteParent || documentParent).hasHeight && !node.hasPX('height')) {
                        node.setLayoutHeight('0px', false);
                        valid = node.flexibleHeight;
                    }
                    if (valid) {
                        node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', formatPX$1(node.parseUnit(minWH, dimension.toLowerCase())));
                        node.css(horizontal ? 'minWidth' : 'minHeight', 'auto');
                    }
                }
            }
            const maxWH = node.cssInitial(horizontal ? 'maxWidth' : 'maxHeight', true);
            let contentBox = 0;
            if (isLength$1(maxWH, true)) {
                let valid = false;
                if (horizontal) {
                    if (node.outerWrapper || node.ascend(item => item.hasPX('width') || item.blockStatic).length) {
                        node.setLayoutWidth(renderParent.flexibleWidth ? 'match_parent' : '0px', !!((_a = node.innerWrapped) === null || _a === void 0 ? void 0 : _a.naturalChild));
                        valid = node.flexibleWidth;
                        setAlignmentBlock();
                        if (valid && !isPercent$1(maxWH)) {
                            contentBox += node.contentBoxWidth;
                        }
                    }
                }
                else if ((node.absoluteParent || documentParent).hasHeight && !node.hasPX('height')) {
                    node.setLayoutHeight(renderParent.flexibleHeight ? 'match_parent' : '0px', !!((_b = node.innerWrapped) === null || _b === void 0 ? void 0 : _b.naturalChild));
                    valid = node.flexibleHeight;
                    if (valid && !isPercent$1(maxWH)) {
                        contentBox += node.contentBoxHeight;
                    }
                }
                if (valid) {
                    const value = node.parseUnit(maxWH, dimension.toLowerCase());
                    node.app(horizontal ? 'layout_constraintWidth_max' : 'layout_constraintHeight_max', formatPX$1(value + contentBox));
                    if (horizontal && node.layoutVertical) {
                        node.each(item => {
                            if (item.textElement && !item.hasPX('maxWidth')) {
                                item.css('maxWidth', formatPX$1(value));
                            }
                        });
                    }
                }
            }
        }
    }
    function constraintPercentValue(node, dimension, horizontal, opposing) {
        const value = node.cssInitial(dimension, true);
        let unit;
        if (opposing) {
            if (isLength$1(value, true)) {
                unit = formatPX$1(node.bounds[dimension]);
                if (node.imageElement) {
                    const { naturalWidth, naturalHeight } = node.element;
                    if (naturalWidth > 0 && naturalHeight > 0) {
                        const opposingUnit = formatPX$1((node.bounds[dimension] / (horizontal ? naturalWidth : naturalHeight)) * (horizontal ? naturalHeight : naturalWidth));
                        if (horizontal) {
                            node.setLayoutHeight(opposingUnit, false);
                        }
                        else {
                            node.setLayoutWidth(opposingUnit, false);
                        }
                    }
                }
            }
        }
        else if (isPercent$1(value) && value !== '100%') {
            const percent = parseFloat(value) / 100;
            node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', truncate$2(percent, node.localSettings.floatPrecision));
            unit = '0px';
        }
        if (unit) {
            if (horizontal) {
                node.setLayoutWidth(unit, false);
            }
            else {
                node.setLayoutHeight(unit, false);
            }
            return true;
        }
        return false;
    }
    function constraintPercentWidth(node, opposing) {
        if (!opposing && !node.documentParent.layoutElement && node.documentParent.hasPX('width', false)) {
            const value = node.cssInitial('width', true);
            if (isPercent$1(value) && value !== '100%') {
                node.setLayoutWidth(formatPX$1(node.bounds.width));
            }
        }
        else {
            constraintPercentValue(node, 'width', true, opposing);
        }
    }
    function constraintPercentHeight(node, opposing) {
        if (node.documentParent.hasPX('height', false)) {
            if (!opposing && !node.documentParent.layoutElement) {
                const value = node.cssInitial('height', true);
                if (isPercent$1(value) && value !== '100%') {
                    node.setLayoutHeight(formatPX$1(node.bounds.height));
                }
            }
            else {
                constraintPercentValue(node, 'height', false, opposing);
            }
        }
        else {
            const height = node.cssInitial('height');
            if (height === '100%' && node.alignParent('top') && node.alignParent('bottom')) {
                node.setLayoutHeight('0px', false);
            }
            else if (isLength$1(height, true)) {
                node.setLayoutHeight(formatPX$1(node.bounds.height), false);
            }
        }
    }
    function isTargeted(parent, node) {
        if (node.dataset.target && parent.element) {
            const element = document.getElementById(node.dataset.target);
            return element !== null && element !== parent.element;
        }
        return false;
    }
    function getTextBottom(nodes) {
        return filterArray(nodes, node => (node.baseline || isLength$1(node.verticalAlign, true)) && (node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' && node.toElementInt('size') > 1) || node.verticalAlign === 'text-bottom' && node.containerName !== 'INPUT_IMAGE').sort((a, b) => {
            if (a.baselineHeight === b.baselineHeight) {
                return a.tagName === 'SELECT' ? 1 : 0;
            }
            return a.baselineHeight > b.baselineHeight ? -1 : 1;
        });
    }
    function getAnchorDirection(reverse) {
        if (reverse) {
            return ['right', 'left', 'rightLeft', 'leftRight'];
        }
        else {
            return ['left', 'right', 'leftRight', 'rightLeft'];
        }
    }
    function causesLineBreak(element, sessionId) {
        if (element.tagName === 'BR') {
            return true;
        }
        else {
            const node = getElementAsNode(element, sessionId);
            if (node) {
                return !node.excluded && node.blockStatic;
            }
        }
        return false;
    }
    function setColumnHorizontal(seg) {
        const length = seg.length;
        for (let i = 0; i < length; i++) {
            const item = seg[i];
            if (i > 0) {
                item.anchor('leftRight', seg[i - 1].documentId);
            }
            if (i < length - 1) {
                item.anchor('rightLeft', seg[i + 1].documentId);
            }
            item.anchored = true;
        }
        const rowStart = seg[0];
        const rowEnd = seg[length - 1];
        rowStart.anchor('left', 'parent');
        rowEnd.anchor('right', 'parent');
        rowStart.anchorStyle(STRING_ANDROID.HORIZONTAL, 'spread_inside');
    }
    function setColumnVertical(partition, lastRow, previousRow) {
        const rowStart = partition[0][0];
        const length = partition.length;
        for (let i = 0; i < length; i++) {
            const seg = partition[i];
            const lengthB = seg.length;
            for (let j = 0; j < lengthB; j++) {
                const item = seg[j];
                if (j === 0) {
                    if (i === 0) {
                        if (previousRow) {
                            previousRow.anchor('bottomTop', item.documentId);
                            item.anchor('topBottom', typeof previousRow === 'string' ? previousRow : previousRow.documentId);
                        }
                        else {
                            item.anchor('top', 'parent');
                            item.anchorStyle(STRING_ANDROID.VERTICAL);
                        }
                    }
                    else {
                        item.anchor('top', rowStart.documentId);
                        item.anchorStyle(STRING_ANDROID.VERTICAL);
                        item.modifyBox(2 /* MARGIN_TOP */);
                    }
                }
                else {
                    seg[j - 1].anchor('bottomTop', item.documentId);
                    item.anchor('topBottom', seg[j - 1].documentId);
                }
                if (j > 0) {
                    item.anchor('left', seg[0].documentId);
                }
                if (j === lengthB - 1) {
                    if (lastRow) {
                        item.anchor('bottom', 'parent');
                    }
                    else if (i > 0 && !item.multiline) {
                        const adjacent = partition[i - 1][j];
                        if (adjacent && !adjacent.multiline && withinRange(item.bounds.top, adjacent.bounds.top)) {
                            item.anchor('top', adjacent.documentId);
                            item.modifyBox(2 /* MARGIN_TOP */, -adjacent.marginTop);
                        }
                    }
                    item.modifyBox(8 /* MARGIN_BOTTOM */);
                }
                item.anchored = true;
                item.positioned = true;
            }
        }
    }
    const isMultiline = (node) => node.plainText && Resource.hasLineBreak(node, false, true) || node.preserveWhiteSpace && CHAR$1.LEADINGNEWLINE.test(node.textContent);
    const getRelativeVertical = (layout) => layout.some(item => item.positionRelative || !item.pageFlow && item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR;
    const getMaxHeight = (node) => Math.max(node.actualHeight, node.lineHeight);
    class Controller extends squared.base.ControllerUI {
        constructor(application, cache) {
            super();
            this.application = application;
            this.cache = cache;
            this.localSettings = {
                layout: {
                    pathName: 'res/layout',
                    fileExtension: 'xml',
                    baseTemplate: STRING_XMLENCODING
                },
                directory: {
                    string: 'res/values',
                    font: 'res/font',
                    image: 'res/drawable'
                },
                svg: {
                    enabled: false
                },
                style: {
                    inputBorderColor: 'rgb(0, 0, 0)',
                    inputBackgroundColor: isPlatform(4 /* MAC */) ? 'rgb(255, 255, 255)' : 'rgb(221, 221, 221)',
                    meterForegroundColor: 'rgb(99, 206, 68)',
                    meterBackgroundColor: 'rgb(237, 237, 237)',
                    progressForegroundColor: 'rgb(153, 153, 158)',
                    progressBackgroundColor: 'rgb(237, 237, 237)'
                },
                supported: {
                    fontFormat: ['truetype', 'opentype'],
                    imageFormat: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'cur']
                },
                unsupported: {
                    cascade: new Set(['SELECT', 'svg']),
                    tagName: new Set([
                        'HEAD',
                        'TITLE',
                        'META',
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
                        'DATALIST'
                    ]),
                    excluded: new Set(['BR', 'WBR'])
                },
                precision: {
                    standardFloat: 4
                },
                deviations: {
                    textMarginBoundarySize: 8,
                    subscriptBottomOffset: 0.25,
                    superscriptTopOffset: 0.25,
                    legendBottomOffset: 0.25
                }
            };
        }
        static setConstraintDimension(node) {
            constraintPercentWidth(node, false);
            constraintPercentHeight(node, false);
            constraintMinMax(node, 'Width', true);
            constraintMinMax(node, 'Height', false);
        }
        static setFlexDimension(node, dimension) {
            const horizontal = dimension === 'width';
            const flexbox = node.flexbox;
            const { grow, basis } = flexbox;
            function setFlexGrow(value) {
                if (horizontal) {
                    node.setLayoutWidth('0px');
                }
                else {
                    node.setLayoutHeight('0px');
                }
                if (grow > 0) {
                    node.app(horizontal ? 'layout_constraintHorizontal_weight' : 'layout_constraintVertical_weight', truncate$2(grow, node.localSettings.floatPrecision));
                    if (value !== '') {
                        node.css(horizontal ? 'minWidth' : 'minHeight', value, true);
                    }
                }
                else if (value !== '') {
                    if (flexbox.shrink < 1) {
                        node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', formatPX$1((1 - flexbox.shrink) * parseFloat(value)));
                        node.app(horizontal ? 'layout_constraintWidth_max' : 'layout_constraintHeight_max', value);
                    }
                    else {
                        node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', value);
                    }
                }
            }
            if (isLength$1(basis)) {
                setFlexGrow(node.convertPX(basis));
            }
            else if (basis !== '0%' && isPercent$1(basis)) {
                node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', (parseFloat(basis) / 100).toPrecision(node.localSettings.floatPrecision));
                setFlexGrow('');
            }
            else {
                const documentParent = node.documentParent;
                if (grow > 0 && (horizontal && documentParent.css('flexDirection').startsWith('row') || !horizontal && documentParent.css('flexDirection').startsWith('column') && (documentParent.hasHeight || documentParent.blockHeight || documentParent.flexibleHeight))) {
                    setFlexGrow(node.hasPX(dimension, false) ? formatPX$1(horizontal ? node.actualWidth : node.actualHeight) : '');
                }
                else {
                    if (horizontal) {
                        constraintPercentWidth(node, false);
                    }
                    else {
                        constraintPercentHeight(node, false);
                    }
                }
            }
            if (flexbox.shrink > 1) {
                node.app(horizontal ? 'layout_constrainedWidth' : 'layout_constrainedHeight', 'true');
            }
            constraintMinMax(node, 'Width', true);
            if (horizontal) {
                constraintPercentHeight(node, true);
            }
            else {
                constraintPercentWidth(node, true);
            }
            constraintMinMax(node, 'Height', false);
        }
        init() {
            const settings = this.userSettings;
            DEFAULT_VIEWSETTINGS = {
                targetAPI: settings.targetAPI || 29 /* LATEST */,
                supportRTL: !!settings.supportRTL,
                floatPrecision: this.localSettings.precision.standardFloat
            };
            super.init();
        }
        optimize(nodes) {
            for (const node of nodes) {
                node.applyOptimizations();
                if (node.hasProcedure(NODE_PROCEDURE$1.CUSTOMIZATION)) {
                    node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
                }
            }
        }
        finalize(layouts) {
            const insertSpaces = this.userSettings.insertSpaces;
            for (const layout of layouts) {
                layout.content = replaceTab(layout.content.replace(/{#0}/, getRootNs(layout.content)), insertSpaces);
            }
        }
        processUnknownParent(layout) {
            const node = layout.node;
            if (node.has('columnCount') || node.hasPX('columnWidth')) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 256 /* COLUMN */ | 4 /* AUTO_LAYOUT */);
            }
            else if (layout.some(item => !item.pageFlow && !item.positionAuto)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */ | 2 /* UNKNOWN */);
            }
            else if (layout.visible.length <= 1) {
                const child = node.find((item) => item.visible);
                if (child) {
                    if (node.documentRoot && isTargeted(node, child)) {
                        node.hide();
                        return { layout, next: true };
                    }
                    else if (node.naturalElement && child.plainText) {
                        node.clear();
                        node.inlineText = true;
                        node.textContent = child.textContent;
                        child.hide();
                        layout.setContainerType(CONTAINER_NODE.TEXT);
                    }
                    else if (node.autoMargin.horizontal || layout.parent.layoutConstraint && layout.parent.flexElement && node.flexbox.alignSelf === 'baseline' && child.textElement) {
                        layout.setContainerType(CONTAINER_NODE.LINEAR, 8 /* HORIZONTAL */ | 4096 /* SINGLE */);
                    }
                    else {
                        if (child.percentWidth) {
                            if (!node.hasPX('width')) {
                                node.setLayoutWidth('match_parent');
                            }
                            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 4096 /* SINGLE */ | 64 /* BLOCK */);
                        }
                        else if (child.baseline && (child.textElement || child.inputElement)) {
                            layout.setContainerType(CONTAINER_NODE.LINEAR, 16 /* VERTICAL */);
                        }
                        else {
                            layout.setContainerType(CONTAINER_NODE.FRAME, 4096 /* SINGLE */);
                        }
                    }
                }
                else {
                    return this.processUnknownChild(layout);
                }
            }
            else if (Resource.hasLineBreak(node, true)) {
                layout.setContainerType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */ | 2 /* UNKNOWN */);
            }
            else if (this.checkConstraintFloat(layout)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
            }
            else if (layout.linearX) {
                if (this.checkFrameHorizontal(layout)) {
                    layout.renderType |= 512 /* FLOAT */ | 8 /* HORIZONTAL */;
                }
                else if (this.checkConstraintHorizontal(layout)) {
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
                }
                else if (this.checkLinearHorizontal(layout)) {
                    layout.setContainerType(CONTAINER_NODE.LINEAR);
                    if (layout.floated.size) {
                        sortHorizontalFloat(layout.children);
                    }
                }
                else {
                    layout.setContainerType(CONTAINER_NODE.RELATIVE);
                }
                layout.add(8 /* HORIZONTAL */);
            }
            else if (layout.linearY) {
                layout.setContainerType(getRelativeVertical(layout), 16 /* VERTICAL */ | (node.documentRoot ? 2 /* UNKNOWN */ : 0));
            }
            else if (layout.every(item => item.inlineFlow)) {
                if (this.checkFrameHorizontal(layout)) {
                    layout.renderType |= 512 /* FLOAT */ | 8 /* HORIZONTAL */;
                }
                else {
                    layout.setContainerType(getRelativeVertical(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
                }
            }
            else if (layout.some((item, index) => item.alignedVertically(index > 0 ? layout.children.slice(0, index) : undefined, layout.cleared) > 0)) {
                layout.setContainerType(getRelativeVertical(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
            }
            else {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 2 /* UNKNOWN */);
            }
            return { layout };
        }
        processUnknownChild(layout) {
            const node = layout.node;
            const style = node.visibleStyle;
            if (node.inlineText && (!node.textEmpty || style.borderWidth)) {
                layout.setContainerType(CONTAINER_NODE.TEXT);
            }
            else if (node.blockStatic && (style.borderWidth || style.backgroundImage || node.paddingTop + node.paddingBottom > 0) && node.naturalElements.length === 0) {
                layout.setContainerType(CONTAINER_NODE.FRAME);
            }
            else if (node.naturalElement &&
                !node.documentRoot &&
                node.elementId === '' &&
                node.bounds.height === 0 &&
                node.marginTop === 0 &&
                node.marginRight === 0 &&
                node.marginBottom === 0 &&
                node.marginLeft === 0 &&
                !style.background &&
                !node.dataset.use) {
                node.hide();
                return { layout, next: true };
            }
            else if (style.background) {
                layout.setContainerType(CONTAINER_NODE.TEXT);
                node.inlineText = true;
            }
            else {
                layout.setContainerType(CONTAINER_NODE.FRAME);
            }
            return { layout };
        }
        processTraverseHorizontal(layout, siblings) {
            const parent = layout.parent;
            if (layout.floated.size === 1 && layout.same((item, index) => item.floating && (item.positiveAxis || item.renderExclude) ? -1 : index)) {
                layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
            }
            else if (this.checkFrameHorizontal(layout)) {
                layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                layout.renderType |= 512 /* FLOAT */ | 8 /* HORIZONTAL */;
            }
            else if (layout.length !== siblings.length || parent.hasAlign(16 /* VERTICAL */)) {
                layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                this.processLayoutHorizontal(layout);
            }
            else {
                parent.addAlign(8 /* HORIZONTAL */);
            }
            return layout;
        }
        processTraverseVertical(layout) {
            const { floated, cleared } = layout;
            if (layout.some((item, index) => item.lineBreakTrailing && index < layout.length - 1)) {
                if (!layout.parent.hasAlign(16 /* VERTICAL */)) {
                    layout.node = this.createLayoutNodeGroup(layout);
                    layout.setContainerType(getRelativeVertical(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
                }
            }
            else if (floated.size === 1 && layout.every((item, index) => index === 0 || index === layout.length - 1 || cleared.has(item))) {
                layout.node = this.createLayoutNodeGroup(layout);
                if (layout.same(node => node.float)) {
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
                }
                else if (cleared.size) {
                    layout.renderType |= 512 /* FLOAT */ | 8 /* HORIZONTAL */;
                }
                else {
                    layout.setContainerType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */);
                }
            }
            else if (floated.size && cleared.size) {
                layout.node = this.createLayoutNodeGroup(layout);
                layout.renderType |= 512 /* FLOAT */ | 16 /* VERTICAL */;
            }
            else if (floated.size && layout.children[0].floating) {
                layout.node = this.createLayoutNodeGroup(layout);
                layout.renderType |= 512 /* FLOAT */ | 8 /* HORIZONTAL */;
            }
            else if (!layout.parent.hasAlign(16 /* VERTICAL */)) {
                layout.node = this.createLayoutNodeGroup(layout);
                layout.setContainerType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */);
            }
            return layout;
        }
        processLayoutHorizontal(layout) {
            if (this.checkConstraintFloat(layout, true)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
            }
            else if (this.checkConstraintHorizontal(layout)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 8 /* HORIZONTAL */);
            }
            else if (this.checkLinearHorizontal(layout)) {
                layout.setContainerType(CONTAINER_NODE.LINEAR, 8 /* HORIZONTAL */);
                if (layout.floated.size) {
                    sortHorizontalFloat(layout.children);
                }
            }
            else {
                layout.setContainerType(CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */);
            }
            return layout;
        }
        sortRenderPosition(parent, templates) {
            if (parent.layoutRelative && templates.some(item => item.node.zIndex !== 0)) {
                templates.sort((a, b) => {
                    const indexA = a.node.zIndex;
                    const indexB = b.node.zIndex;
                    if (indexA === indexB) {
                        return 0;
                    }
                    else if (indexA > indexB) {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                });
            }
            else if (parent.layoutConstraint && templates.some(item => !item.node.pageFlow || item.node.zIndex !== 0)) {
                const below = [];
                const middle = [];
                const above = [];
                for (const item of templates) {
                    const node = item.node;
                    if (node.pageFlow) {
                        middle.push(item);
                    }
                    else if (node.zIndex >= 0) {
                        above.push(item);
                    }
                    else {
                        below.push(item);
                    }
                }
                sortConstraintAbsolute(below);
                sortConstraintAbsolute(above);
                return below.concat(middle, above);
            }
            return templates;
        }
        checkFrameHorizontal(layout) {
            const floated = layout.floated;
            if (floated.size === 2 || (floated.has('right') || floated.size === 1 && layout.node.cssAscend('textAlign', true) === 'center') && layout.some(node => node.pageFlow)) {
                return true;
            }
            else if (floated.has('left') && !layout.linearX) {
                const node = layout.item(0);
                return node.pageFlow && node.floating;
            }
            return false;
        }
        checkConstraintFloat(layout, horizontal = false) {
            if (layout.length > 1) {
                let A = 0;
                let B = 0;
                for (const node of layout) {
                    const excluded = layout.cleared.has(node) || node.renderExclude;
                    if (A !== -1 && (node.positiveAxis && (!node.positionRelative || node.positionAuto) && (node.floating || node.autoMargin.horizontal) || excluded)) {
                        A++;
                    }
                    else {
                        A = -1;
                    }
                    if (B !== -1 && (node.percentWidth || excluded)) {
                        B++;
                    }
                    else if (!horizontal) {
                        B = -1;
                    }
                    if (A <= 0 && B <= 0) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        checkConstraintHorizontal(layout) {
            const floated = layout.floated;
            let valid = false;
            switch (layout.node.cssInitial('textAlign')) {
                case 'center':
                    valid = floated.size === 0;
                    break;
                case 'end':
                case 'right':
                    valid = floated.size === 0 || floated.has('right') && floated.size === 1 && layout.cleared.size === 0;
                    break;
            }
            if (valid || layout.some(node => node.blockVertical || node.percentWidth || (node.verticalAlign === 'middle' || node.verticalAlign === 'bottom') && !layout.parent.hasHeight)) {
                return layout.singleRowAligned && layout.every(node => node.positiveAxis || node.renderExclude);
            }
            return false;
        }
        checkLinearHorizontal(layout) {
            const floated = layout.floated;
            if ((floated.size === 0 || floated.size === 1 && floated.has('left')) && layout.node.lineHeight === 0 && layout.singleRowAligned) {
                const { fontSize, lineHeight } = layout.children[0];
                for (const node of layout) {
                    if (!(node.naturalChild && node.baseline && node.length === 0 && !node.inputElement && !node.positionRelative && !node.blockVertical && !node.positionAuto && node.zIndex === 0 && (lineHeight === 0 || node.lineHeight === lineHeight && node.fontSize === fontSize) && node.tagName !== 'WBR')) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        setConstraints() {
            for (const node of this.cache) {
                if (node.layoutRelative) {
                    this.processRelativeHorizontal(node, node.renderChildren);
                }
                else if (node.layoutConstraint && node.hasProcedure(NODE_PROCEDURE$1.CONSTRAINT)) {
                    const children = node.renderFilter((item) => !item.positioned);
                    if (children.length) {
                        const [pageFlow, absolute] = partitionArray(children, item => item.pageFlow || item.positionAuto);
                        if (absolute.length) {
                            for (const item of absolute) {
                                if (item.leftTopAxis) {
                                    const autoMargin = item.autoMargin;
                                    if (item.hasWidth && autoMargin.horizontal) {
                                        if (item.hasPX('left') && autoMargin.right) {
                                            item.anchor('left', 'parent');
                                            item.modifyBox(16 /* MARGIN_LEFT */, item.left);
                                        }
                                        else if (item.hasPX('right') && autoMargin.left) {
                                            item.anchor('right', 'parent');
                                            item.modifyBox(4 /* MARGIN_RIGHT */, item.right);
                                        }
                                        else {
                                            item.anchorParent(STRING_ANDROID.HORIZONTAL);
                                            item.modifyBox(16 /* MARGIN_LEFT */, item.left);
                                            item.modifyBox(4 /* MARGIN_RIGHT */, item.right);
                                        }
                                    }
                                    else {
                                        if (item.hasPX('left')) {
                                            item.anchor('left', 'parent');
                                            if (!item.hasPX('right') && item.css('width') === '100%') {
                                                item.anchor('right', 'parent');
                                            }
                                            item.modifyBox(16 /* MARGIN_LEFT */, adjustAbsolutePaddingOffset(node, 256 /* PADDING_LEFT */, item.left));
                                        }
                                        if (item.hasPX('right') && (!item.hasPX('width') || item.css('width') === '100%' || !item.hasPX('left'))) {
                                            item.anchor('right', 'parent');
                                            item.modifyBox(4 /* MARGIN_RIGHT */, adjustAbsolutePaddingOffset(node, 64 /* PADDING_RIGHT */, item.right));
                                        }
                                    }
                                    if (item.hasHeight && autoMargin.vertical) {
                                        if (item.hasPX('top') && autoMargin.bottom) {
                                            item.anchor('top', 'parent');
                                            item.modifyBox(2 /* MARGIN_TOP */, item.top);
                                        }
                                        else if (item.hasPX('bottom') && autoMargin.top) {
                                            item.anchor('bottom', 'parent');
                                            item.modifyBox(8 /* MARGIN_BOTTOM */, item.bottom);
                                        }
                                        else {
                                            item.anchorParent(STRING_ANDROID.VERTICAL);
                                            item.modifyBox(2 /* MARGIN_TOP */, item.top);
                                            item.modifyBox(8 /* MARGIN_BOTTOM */, item.bottom);
                                        }
                                    }
                                    else {
                                        if (item.hasPX('top')) {
                                            item.anchor('top', 'parent');
                                            if (!item.hasPX('bottom') && item.css('height') === '100%') {
                                                item.anchor('bottom', 'parent');
                                            }
                                            item.modifyBox(2 /* MARGIN_TOP */, adjustAbsolutePaddingOffset(node, 32 /* PADDING_TOP */, item.top));
                                        }
                                        if (item.hasPX('bottom') && (!item.hasPX('height') || item.css('height') === '100%' || !item.hasPX('top'))) {
                                            item.anchor('bottom', 'parent');
                                            item.modifyBox(8 /* MARGIN_BOTTOM */, adjustAbsolutePaddingOffset(node, 128 /* PADDING_BOTTOM */, item.bottom));
                                        }
                                    }
                                    item.positioned = true;
                                }
                            }
                        }
                        if (pageFlow.length) {
                            if (node.layoutHorizontal) {
                                this.processConstraintHorizontal(node, pageFlow);
                            }
                            else if (node.hasAlign(256 /* COLUMN */)) {
                                this.processConstraintColumn(node, pageFlow);
                            }
                            else if (pageFlow.length > 1) {
                                this.processConstraintChain(node, pageFlow);
                            }
                            else {
                                const item = pageFlow[0];
                                item.anchorParent(STRING_ANDROID.HORIZONTAL);
                                item.anchorParent(STRING_ANDROID.VERTICAL);
                                if (item.rightAligned) {
                                    item.anchorStyle(STRING_ANDROID.HORIZONTAL, 'packed', 1);
                                }
                                else if (!item.centerAligned) {
                                    item.anchorStyle(STRING_ANDROID.HORIZONTAL);
                                }
                                if (!item.autoMargin.topBottom) {
                                    item.anchorStyle(STRING_ANDROID.VERTICAL);
                                }
                                Controller.setConstraintDimension(item);
                            }
                            this.evaluateAnchors(pageFlow);
                        }
                        for (const item of children) {
                            if (!item.anchored) {
                                if (item.outerWrapper) {
                                    const { horizontal, vertical } = item.constraint;
                                    if (horizontal) {
                                        item.anchorParent(STRING_ANDROID.HORIZONTAL);
                                    }
                                    if (vertical) {
                                        item.anchorParent(STRING_ANDROID.VERTICAL);
                                    }
                                }
                                else {
                                    this.addGuideline(item, node);
                                }
                            }
                        }
                    }
                }
            }
        }
        renderNodeGroup(layout) {
            const { node, containerType, alignmentType } = layout;
            const options = createViewAttribute();
            let valid = false;
            switch (containerType) {
                case CONTAINER_NODE.LINEAR:
                    if (hasBit(alignmentType, 16 /* VERTICAL */)) {
                        options.android.orientation = STRING_ANDROID.VERTICAL;
                        valid = true;
                    }
                    else if (hasBit(alignmentType, 8 /* HORIZONTAL */)) {
                        options.android.orientation = STRING_ANDROID.HORIZONTAL;
                        valid = true;
                    }
                    break;
                case CONTAINER_NODE.GRID:
                    const { columnCount, rowCount } = layout;
                    const android = options.android;
                    if (rowCount > 0) {
                        android.rowCount = rowCount.toString();
                    }
                    android.columnCount = columnCount > 0 ? columnCount.toString() : '2';
                    valid = true;
                    break;
                case CONTAINER_NODE.FRAME:
                case CONTAINER_NODE.RELATIVE:
                case CONTAINER_NODE.CONSTRAINT:
                    valid = true;
                    break;
                default:
                    if (layout.length === 0) {
                        return this.renderNode(layout);
                    }
                    break;
            }
            if (valid) {
                const dataset = node.dataset;
                node.setControlType(View.getControlName(containerType, node.localSettings.targetAPI), containerType);
                node.addAlign(alignmentType);
                node.render(!dataset.use && dataset.target ? this.application.resolveTarget(dataset.target) : layout.parent);
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
            var _a;
            const { containerType, node } = layout;
            let controlName = View.getControlName(containerType, node.localSettings.targetAPI);
            node.setControlType(controlName, containerType);
            node.addAlign(layout.alignmentType);
            let parent = layout.parent;
            let target = !node.dataset.use ? node.dataset.target : undefined;
            switch (node.tagName) {
                case 'IMG': {
                    const element = node.element;
                    const absoluteParent = node.absoluteParent || node.documentParent;
                    let width = node.toFloat('width');
                    let height = node.toFloat('height');
                    let percentWidth = node.percentWidth ? width : -1;
                    const percentHeight = node.percentHeight ? height : -1;
                    let scaleType = 'fitXY';
                    let imageSet;
                    if (element.srcset) {
                        imageSet = getSrcSet$1(element, this.localSettings.supported.imageFormat);
                        if (imageSet.length) {
                            const actualWidth = imageSet[0].actualWidth;
                            if (actualWidth) {
                                if (percentWidth === -1) {
                                    width = actualWidth;
                                    node.css('width', formatPX$1(width), true);
                                    const image = this.application.resourceHandler.getImage(element.src);
                                    if (image && image.width > 0 && image.height > 0) {
                                        height = image.height * (width / image.width);
                                        node.css('height', formatPX$1(height), true);
                                    }
                                    else {
                                        node.android('adjustViewBounds', 'true');
                                    }
                                }
                                else {
                                    width = parent.box.width;
                                    node.android('adjustViewBounds', 'true');
                                }
                                percentWidth = -1;
                            }
                        }
                        else {
                            imageSet = undefined;
                        }
                    }
                    if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                        const src = this.application.resourceHandler.addImageSrc(element, '', imageSet);
                        if (src !== '') {
                            node.android('src', '@drawable/' + src);
                        }
                    }
                    if (percentWidth !== -1 || percentHeight !== -1) {
                        if (percentWidth >= 0) {
                            width *= absoluteParent.box.width / 100;
                            if (percentWidth < 100 && !parent.layoutConstraint) {
                                node.css('width', formatPX$1(width));
                                node.android('adjustViewBounds', 'true');
                            }
                        }
                        if (percentHeight >= 0) {
                            height *= absoluteParent.box.height / 100;
                            if (percentHeight < 100 && !(parent.layoutConstraint && absoluteParent.hasHeight)) {
                                node.css('height', formatPX$1(height));
                                node.android('adjustViewBounds', 'true');
                            }
                        }
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
                                scaleType = 'center';
                                break;
                        }
                        if (width === 0 && height > 0 || height === 0 && width > 0) {
                            node.android('adjustViewBounds', 'true');
                        }
                    }
                    node.android('scaleType', scaleType);
                    if (node.baseline) {
                        node.android('baselineAlignBottom', 'true');
                        if (node.marginBottom > 0 && parent.layoutLinear && parent.layoutHorizontal) {
                            node.mergeGravity('layout_gravity', 'bottom');
                        }
                    }
                    if (!node.pageFlow && parent === node.absoluteParent && (node.left < 0 && parent.css('overflowX') === 'hidden' || node.top < 0 && parent.css('overflowY') === 'hidden')) {
                        const application = this.application;
                        const container = application.createNode();
                        container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                        container.inherit(node, 'base');
                        container.positionAuto = false;
                        container.exclude(NODE_RESOURCE.ALL, NODE_PROCEDURE$1.ALL);
                        container.cssApply({
                            position: node.css('position'),
                            zIndex: node.zIndex.toString()
                        });
                        parent.appendTry(node, container);
                        node.parent = container;
                        if (width > 0) {
                            container.setLayoutWidth(width < absoluteParent.box.width ? formatPX$1(width) : 'match_parent');
                        }
                        else {
                            container.setLayoutWidth('wrap_content');
                        }
                        if (height > 0) {
                            container.setLayoutHeight(height < absoluteParent.box.height ? formatPX$1(height) : 'match_parent');
                        }
                        else {
                            container.setLayoutHeight('wrap_content');
                        }
                        container.render(target ? application.resolveTarget(target) : parent);
                        container.saveAsInitial();
                        container.innerWrapped = node;
                        node.outerWrapper = container;
                        if (!parent.layoutConstraint) {
                            node.modifyBox(2 /* MARGIN_TOP */, node.top);
                            node.modifyBox(16 /* MARGIN_LEFT */, node.left);
                        }
                        application.addLayoutTemplate(parent, container, {
                            type: 1 /* XML */,
                            node: container,
                            controlName: CONTAINER_ANDROID.FRAME
                        });
                        parent = container;
                        layout.parent = container;
                        target = undefined;
                    }
                    break;
                }
                case 'INPUT': {
                    const element = node.element;
                    const type = element.type;
                    switch (type) {
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
                        case 'time':
                        case 'number':
                        case 'date':
                        case 'datetime-local':
                            switch (type) {
                                case 'number':
                                case 'range':
                                    node.android('inputType', 'number');
                                    break;
                                case 'date':
                                    node.android('inputType', 'date');
                                    break;
                                case 'time':
                                    node.android('inputType', 'time');
                                    break;
                                case 'datetime-local':
                                    node.android('inputType', 'datetime');
                                    break;
                            }
                            if (isString$3(element.min)) {
                                node.android('min', element.min);
                            }
                            if (isString$3(element.max)) {
                                node.android('max', element.max);
                            }
                            break;
                        case 'email':
                        case 'tel':
                        case 'url':
                        case 'week':
                        case 'month':
                        case 'search':
                            switch (type) {
                                case 'email':
                                    node.android('inputType', 'textEmailAddress');
                                    break;
                                case 'tel':
                                    node.android('inputType', 'phone');
                                    break;
                                case 'url':
                                    node.android('inputType', 'textUri');
                                    break;
                                default:
                                    node.android('inputType', 'text');
                                    break;
                            }
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
                case 'TEXTAREA': {
                    const element = node.element;
                    node.android('minLines', element.rows > 0 ? element.rows.toString() : '2');
                    switch (node.css('verticalAlign')) {
                        case 'middle':
                            node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
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
                    if (!node.hasPX('width') && element.cols > 0) {
                        node.css('width', formatPX$1(element.cols * 8), true);
                    }
                    node.android('hint', element.placeholder);
                    node.android('scrollbars', STRING_ANDROID.VERTICAL);
                    node.android('inputType', 'textMultiLine');
                    if (node.overflowX) {
                        node.android('scrollHorizontally', 'true');
                    }
                    break;
                }
                case 'LEGEND': {
                    if (!node.hasWidth) {
                        node.css('minWidth', formatPX$1(node.actualWidth), true);
                        node.css('display', 'inline-block', true);
                    }
                    const offset = node.actualHeight * this.localSettings.deviations.legendBottomOffset;
                    node.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                    node.linear.bottom += offset;
                    break;
                }
                case 'METER':
                case 'PROGRESS': {
                    let foregroundColor;
                    let backgroundColor;
                    if (node.tagName === 'METER') {
                        ({ meterForegroundColor: foregroundColor, meterBackgroundColor: backgroundColor } = this.localSettings.style);
                        const element = node.element;
                        const { value, max } = element;
                        if (max) {
                            if (value) {
                                node.android('progress', Math.round((value / max) * 100).toString());
                            }
                            if (max === 100) {
                                node.android('min', element.min.toString());
                                node.android('max', max.toString());
                            }
                        }
                    }
                    else {
                        ({ progressForegroundColor: foregroundColor, progressBackgroundColor: backgroundColor } = this.localSettings.style);
                        const element = node.element;
                        const { value, max } = element;
                        if (value) {
                            node.android('progress', value.toString());
                        }
                        if (max) {
                            node.android('max', max.toString());
                        }
                    }
                    if (!node.hasWidth) {
                        node.css('width', formatPX$1(node.bounds.width), true);
                    }
                    if (!node.hasHeight) {
                        node.css('height', formatPX$1(node.bounds.height), true);
                    }
                    node.android('progressTint', '@color/' + Resource.addColor(foregroundColor));
                    node.android('progressBackgroundTint', '@color/' + Resource.addColor(backgroundColor));
                    node.inlineText = false;
                    break;
                }
            }
            switch (controlName) {
                case CONTAINER_ANDROID.TEXT:
                    let overflow = '';
                    if (node.overflowX) {
                        overflow += STRING_ANDROID.HORIZONTAL;
                    }
                    if (node.overflowY) {
                        overflow += (overflow !== '' ? '|' : '') + STRING_ANDROID.VERTICAL;
                    }
                    if (overflow !== '') {
                        node.android('scrollbars', overflow);
                    }
                    if (node.has('letterSpacing')) {
                        node.android('letterSpacing', truncate$2(node.toFloat('letterSpacing') / node.fontSize, this.localSettings.precision.standardFloat));
                    }
                    if (node.css('textAlign') === 'justify') {
                        node.android('justificationMode', 'inter_word');
                    }
                    if (node.has('textShadow')) {
                        const match = /^(rgba?\([^)]+\)|[a-z]+) (-?[\d.]+[a-z]+) (-?[\d.]+[a-z]+)\s*(-?[\d.]+[a-z]+)?.*$/.exec(node.css('textShadow'));
                        if (match) {
                            const color = Resource.addColor(parseColor$1(match[1]));
                            if (color !== '') {
                                node.android('shadowColor', '@color/' + color);
                                node.android('shadowDx', truncate$2(parseUnit(match[2], node.fontSize) * 2));
                                node.android('shadowDy', truncate$2(parseUnit(match[3], node.fontSize) * 2));
                                node.android('shadowRadius', match[4] ? truncate$2(Math.max(parseUnit(match[4], node.fontSize), 1)) : '1');
                            }
                        }
                    }
                    if (node.css('whiteSpace') === 'nowrap') {
                        node.android('maxLines', '1');
                        node.android('ellipsize', 'end');
                    }
                    break;
                case CONTAINER_ANDROID.BUTTON:
                    if (!node.hasHeight) {
                        node.android('minHeight', formatPX$1(Math.ceil(node.actualHeight)));
                    }
                    node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
                    break;
                case CONTAINER_ANDROID.EDIT: {
                    if ((_a = node.element.list) === null || _a === void 0 ? void 0 : _a.children.length) {
                        controlName = CONTAINER_ANDROID.EDIT_LIST;
                        node.controlName = controlName;
                    }
                }
                case CONTAINER_ANDROID.RANGE:
                    if (!node.hasPX('width')) {
                        node.css('width', formatPX$1(node.bounds.width), true);
                    }
                    break;
                case CONTAINER_ANDROID.LINE:
                    if (!node.hasHeight) {
                        node.setLayoutHeight(formatPX$1(node.contentBoxHeight || 1));
                    }
                    break;
            }
            if (node.inlineVertical && (!parent.layoutHorizontal || parent.layoutLinear)) {
                switch (node.verticalAlign) {
                    case 'sub':
                        node.modifyBox(8 /* MARGIN_BOTTOM */, Math.ceil(node.fontSize * this.localSettings.deviations.subscriptBottomOffset) * -1);
                        break;
                    case 'super':
                        node.modifyBox(2 /* MARGIN_TOP */, Math.ceil(node.fontSize * this.localSettings.deviations.superscriptTopOffset) * -1);
                        break;
                }
            }
            node.render(target ? this.application.resolveTarget(target) : parent);
            return {
                type: 1 /* XML */,
                node,
                parent,
                controlName
            };
        }
        renderNodeStatic(controlName, options, width, height, content) {
            const node = new View(0, '0', undefined, this.afterInsertNode);
            node.setControlType(controlName);
            if (width !== '') {
                node.setLayoutWidth(width || 'wrap_content');
            }
            if (height !== '') {
                node.setLayoutHeight(height || 'wrap_content');
            }
            if (options) {
                node.apply(options);
                options.documentId = node.documentId;
            }
            return this.getEnclosingXmlTag(controlName, this.userSettings.showAttributes ? node.extractAttributes(1) : undefined, content);
        }
        renderSpace(width, height, columnSpan, rowSpan, options) {
            if (options === undefined) {
                options = createViewAttribute();
            }
            const android = options.android;
            if (isPercent$1(width)) {
                android.layout_columnWeight = truncate$2(parseFloat(width) / 100, this.localSettings.precision.standardFloat);
                width = '0px';
            }
            if (height && isPercent$1(height)) {
                android.layout_rowWeight = truncate$2(parseFloat(height) / 100, this.localSettings.precision.standardFloat);
                height = '0px';
            }
            if (columnSpan) {
                android.layout_columnSpan = columnSpan.toString();
            }
            if (rowSpan) {
                android.layout_rowSpan = rowSpan.toString();
            }
            return this.renderNodeStatic(CONTAINER_ANDROID.SPACE, options, width, height || undefined);
        }
        addGuideline(node, parent, orientation, percent = false, opposite = false) {
            const absoluteParent = node.absoluteParent;
            const linear = node.linear;
            const boxParent = parent.nodeGroup && !node.documentParent.hasAlign(4 /* AUTO_LAYOUT */) ? parent : node.documentParent;
            GUIDELINE_AXIS.forEach(value => {
                var _a;
                if (!node.constraint[value] && (!orientation || value === orientation)) {
                    const horizontal = value === STRING_ANDROID.HORIZONTAL;
                    const box = boxParent.box;
                    let LT;
                    let RB;
                    let LTRB;
                    let RBLT;
                    if (horizontal) {
                        if (opposite) {
                            LT = 'right';
                            RB = 'left';
                            LTRB = 'rightLeft';
                            RBLT = 'leftRight';
                        }
                        else {
                            LT = 'left';
                            RB = 'right';
                            LTRB = 'leftRight';
                            RBLT = 'rightLeft';
                        }
                    }
                    else {
                        if (opposite) {
                            LT = 'bottom';
                            RB = 'top';
                            LTRB = 'bottomTop';
                            RBLT = 'topBottom';
                        }
                        else {
                            LT = 'top';
                            RB = 'bottom';
                            LTRB = 'topBottom';
                            RBLT = 'bottomTop';
                        }
                    }
                    if (withinRange(linear[LT], box[LT])) {
                        node.anchor(LT, 'parent', true);
                        return;
                    }
                    const bounds = node.positionStatic ? node.bounds : linear;
                    let beginPercent = 'layout_constraintGuide_';
                    let location;
                    if (!percent && !parent.hasAlign(4 /* AUTO_LAYOUT */)) {
                        const found = parent.renderChildren.some(item => {
                            if (item !== node && item.constraint[value]) {
                                let valid = false;
                                if (node.pageFlow && item.pageFlow) {
                                    if (withinRange(linear[LT], item.linear[RB])) {
                                        node.anchor(LTRB, item.documentId, true);
                                        valid = true;
                                    }
                                    else if (withinRange(linear[RB], item.linear[LT])) {
                                        node.anchor(RBLT, item.documentId, true);
                                        valid = true;
                                    }
                                }
                                if (!valid) {
                                    if (withinRange(node.bounds[LT], item.bounds[LT])) {
                                        if (!horizontal && node.textElement && node.baseline && item.textElement && item.baseline) {
                                            node.anchor('baseline', item.documentId, true);
                                        }
                                        else {
                                            node.anchor(LT, item.documentId, true);
                                            if (horizontal) {
                                                node.modifyBox(16 /* MARGIN_LEFT */, -item.marginLeft, false);
                                            }
                                            else {
                                                node.modifyBox(2 /* MARGIN_TOP */, -item.marginTop, false);
                                            }
                                        }
                                        valid = true;
                                    }
                                    else if (withinRange(node.bounds[RB], item.bounds[RB])) {
                                        node.anchor(RB, item.documentId, true);
                                        node.modifyBox(horizontal ? 4 /* MARGIN_RIGHT */ : 8 /* MARGIN_BOTTOM */);
                                        valid = true;
                                    }
                                    else if (!node.pageFlow && item.pageFlow && withinRange(node.bounds[LT] + node[LT], item.bounds[LT])) {
                                        node.anchor(LT, item.documentId, true);
                                        node.modifyBox(horizontal ? 16 /* MARGIN_LEFT */ : 2 /* MARGIN_TOP */, node[LT]);
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
                        const siblingsLeading = node.siblingsLeading;
                        if (siblingsLeading.length && !node.alignedVertically()) {
                            const previousSibling = siblingsLeading[0];
                            if (previousSibling.renderParent === node.renderParent) {
                                node.anchor(horizontal ? 'rightLeft' : 'top', previousSibling.documentId, true);
                                node.constraint[value] = previousSibling.constraint[value];
                                return;
                            }
                        }
                    }
                    if (percent) {
                        const position = Math.abs(bounds[LT] - box[LT]) / box[horizontal ? 'width' : 'height'];
                        location = parseFloat(truncate$2(opposite ? 1 - position : position, this.localSettings.precision.standardFloat));
                        beginPercent += 'percent';
                    }
                    else {
                        location = bounds[LT] - box[!opposite ? LT : RB];
                        if (!horizontal && !boxParent.nodeGroup && boxParent !== absoluteParent && absoluteParent.getBox(2 /* MARGIN_TOP */)[0] === 1) {
                            location -= absoluteParent.marginTop;
                        }
                        beginPercent += 'begin';
                    }
                    const guideline = parent.constraint.guideline || {};
                    if (!node.pageFlow) {
                        if (node.parent === boxParent.outerWrapper) {
                            location += boxParent[!opposite ? (horizontal ? 'paddingLeft' : 'paddingTop') : (horizontal ? 'paddingRight' : 'paddingBottom')];
                        }
                        else if (absoluteParent === node.documentParent) {
                            let direction;
                            if (horizontal) {
                                direction = !opposite ? 256 /* PADDING_LEFT */ : 64 /* PADDING_RIGHT */;
                            }
                            else {
                                direction = !opposite ? 32 /* PADDING_TOP */ : 128 /* PADDING_BOTTOM */;
                            }
                            location = adjustAbsolutePaddingOffset(boxParent, direction, location);
                        }
                    }
                    else if (node.inlineVertical) {
                        const offset = convertFloat(node.verticalAlign);
                        if (offset < 0) {
                            location += offset;
                        }
                    }
                    if (!horizontal && node.marginTop < 0) {
                        location -= node.marginTop;
                        node.modifyBox(2 /* MARGIN_TOP */);
                    }
                    node.constraint[value] = true;
                    if (location <= 0) {
                        node.anchor(LT, 'parent', true);
                        if (location < 0) {
                            const innerWrapped = node.innerWrapped;
                            if (((_a = innerWrapped) === null || _a === void 0 ? void 0 : _a.pageFlow) === false) {
                                let boxMargin = 0;
                                switch (LT) {
                                    case 'top':
                                        boxMargin = 2 /* MARGIN_TOP */;
                                        break;
                                    case 'left':
                                        boxMargin = 16 /* MARGIN_LEFT */;
                                        break;
                                    case 'bottom':
                                        boxMargin = 8 /* MARGIN_BOTTOM */;
                                        break;
                                    case 'right':
                                        boxMargin = 4 /* MARGIN_RIGHT */;
                                        break;
                                }
                                innerWrapped.modifyBox(boxMargin, location);
                            }
                        }
                    }
                    else if (horizontal && location + bounds.width >= box.right && boxParent.hasPX('width') && !node.hasPX('right') || !horizontal && location + bounds.height >= box.bottom && boxParent.hasPX('height') && !node.hasPX('bottom')) {
                        node.anchor(RB, 'parent', true);
                    }
                    else {
                        const anchors = optionalAsObject(guideline, `${value}.${beginPercent}.${LT}`);
                        if (anchors) {
                            for (const id in anchors) {
                                if (parseInt(anchors[id]) === location) {
                                    node.anchor(LT, id, true);
                                    node.anchorDelete(RB);
                                    return;
                                }
                            }
                        }
                        let resourceValue;
                        if (percent) {
                            resourceValue = location.toString();
                        }
                        else {
                            resourceValue = '@dimen/' + Resource.insertStoredAsset('dimens', 'constraint_guideline_' + (!opposite ? LT : RB), formatPX$1(location));
                        }
                        const options = createViewAttribute(undefined, { orientation: horizontal ? STRING_ANDROID.VERTICAL : STRING_ANDROID.HORIZONTAL }, { [beginPercent]: resourceValue });
                        this.addAfterOutsideTemplate(node.id, this.renderNodeStatic(node.localSettings.targetAPI < 29 /* Q */ ? CONTAINER_ANDROID.GUIDELINE : CONTAINER_ANDROID_X.GUIDELINE, options), false);
                        const documentId = options.documentId;
                        if (documentId) {
                            node.anchor(LT, documentId, true);
                            node.anchorDelete(RB);
                            if (location > 0) {
                                assignEmptyValue(guideline, value, beginPercent, LT, documentId, location.toString());
                                parent.constraint.guideline = guideline;
                            }
                        }
                    }
                }
            });
        }
        addBarrier(nodes, barrierDirection) {
            const unbound = [];
            for (const node of nodes) {
                const barrier = node.constraint.barrier;
                if (barrier === undefined) {
                    node.constraint.barrier = {};
                }
                else if (barrier[barrierDirection]) {
                    continue;
                }
                unbound.push(node);
            }
            if (unbound.length) {
                const options = createViewAttribute(undefined, undefined, {
                    barrierDirection,
                    constraint_referenced_ids: objectMap(unbound, item => getDocumentId(item.documentId)).join(',')
                });
                const target = unbound[unbound.length - 1];
                this.addAfterOutsideTemplate(target.id, this.renderNodeStatic(target.localSettings.targetAPI < 29 /* Q */ ? CONTAINER_ANDROID.BARRIER : CONTAINER_ANDROID_X.BARRIER, options), false);
                for (const node of unbound) {
                    node.constraint.barrier[barrierDirection] = options.documentId;
                }
                return options.documentId;
            }
            return '';
        }
        evaluateAnchors(nodes) {
            var _a;
            const horizontal = [];
            const vertical = [];
            for (const node of nodes) {
                if (node.constraint.horizontal) {
                    horizontal.push(node);
                }
                if (node.constraint.vertical) {
                    vertical.push(node);
                }
                if (node.alignParent('top')) {
                    let current = node;
                    while (true) {
                        const bottomTop = current.alignSibling('bottomTop');
                        if (bottomTop !== '') {
                            const next = nodes.find(item => item.documentId === bottomTop);
                            if (((_a = next) === null || _a === void 0 ? void 0 : _a.alignSibling('topBottom')) === current.documentId) {
                                if (next.alignParent('bottom')) {
                                    node.anchorStyle(STRING_ANDROID.VERTICAL, 'packed', 0, false);
                                    break;
                                }
                                else {
                                    current = next;
                                }
                            }
                            else {
                                break;
                            }
                        }
                        else {
                            if (current !== node) {
                                const barrier = current.constraint.barrier;
                                let documentId;
                                if (barrier === undefined || !barrier.bottom) {
                                    documentId = this.addBarrier([current], 'bottom');
                                }
                                else {
                                    documentId = barrier.bottom;
                                }
                                if (documentId) {
                                    current.anchor('bottomTop', documentId);
                                }
                            }
                            break;
                        }
                    }
                }
            }
            let i = -1;
            while (++i < nodes.length) {
                const node = nodes[i];
                const constraint = node.constraint;
                const current = constraint.current;
                if (!constraint.horizontal) {
                    for (const attr in current) {
                        const position = current[attr];
                        if (position.horizontal && horizontal.some(item => item.documentId === position.documentId)) {
                            constraint.horizontal = true;
                            horizontal.push(node);
                            i = -1;
                            break;
                        }
                    }
                }
                if (!constraint.vertical) {
                    for (const attr in current) {
                        const position = current[attr];
                        if (!position.horizontal && vertical.some(item => item.documentId === position.documentId)) {
                            constraint.vertical = true;
                            vertical.push(node);
                            i = -1;
                            break;
                        }
                    }
                }
            }
        }
        createNodeGroup(node, children, parent, traverse = false) {
            const group = new ViewGroup(this.cache.nextId, node, children, this.afterInsertNode);
            if (parent) {
                parent.appendTry(node, group);
                group.init();
            }
            else {
                group.containerIndex = node.containerIndex;
            }
            this.cache.append(group, traverse);
            return group;
        }
        createNodeWrapper(node, parent, children, controlName, containerType) {
            var _a;
            const container = this.application.createNode(undefined, true, parent, children);
            container.addAlign(16384 /* WRAPPER */);
            if (node.documentRoot) {
                container.documentRoot = true;
                node.documentRoot = false;
            }
            container.inherit(node, 'base', 'alignment');
            if (controlName) {
                container.setControlType(controlName, containerType);
            }
            container.exclude(NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET, NODE_PROCEDURE$1.CUSTOMIZATION, APP_SECTION.ALL);
            parent.appendTry(node, container);
            node.parent = container;
            const outerWrapper = node.outerWrapper;
            if (outerWrapper) {
                container.outerWrapper = outerWrapper;
                outerWrapper.innerWrapped = container;
            }
            const renderParent = node.renderParent;
            if (renderParent) {
                const renderTemplates = renderParent.renderTemplates;
                if (renderTemplates) {
                    const length = renderTemplates.length;
                    for (let i = 0; i < length; i++) {
                        if (((_a = renderTemplates[i]) === null || _a === void 0 ? void 0 : _a.node) === node) {
                            node.renderChildren.splice(i, 1);
                            renderTemplates.splice(i, 1);
                            break;
                        }
                    }
                }
                node.rendered = false;
                node.renderParent = undefined;
            }
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
                borderRadius: '0px'
            });
            if (node.documentParent.layoutElement) {
                const android = node.namespace('android');
                for (const attr in android) {
                    if (attr.startsWith('layout_')) {
                        container.android(attr, android[attr]);
                        delete android[attr];
                    }
                }
                node.transferBox(30 /* MARGIN */, container);
            }
            container.innerWrapped = node;
            node.outerWrapper = container;
            return container;
        }
        processRelativeHorizontal(node, children) {
            var _a;
            const rowsLeft = [];
            const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
            let alignmentMultiLine = false;
            let sortPositionAuto = false;
            let rowsRight;
            if (node.hasAlign(16 /* VERTICAL */)) {
                let previous;
                for (const item of children) {
                    if (previous) {
                        item.anchor('topBottom', previous.documentId);
                    }
                    else {
                        item.anchor('top', 'true');
                    }
                    if (item.pageFlow) {
                        rowsLeft.push([item]);
                        previous = item;
                    }
                    else {
                        sortPositionAuto = true;
                    }
                }
            }
            else {
                const boxWidth = (() => {
                    const renderParent = node.renderParent;
                    if (renderParent.overflowY) {
                        return renderParent.box.width;
                    }
                    else {
                        const parent = node.actualParent;
                        if (parent) {
                            if (parent === renderParent && parent.blockStatic && node.naturalElement && node.inlineStatic) {
                                const box = parent.box;
                                return box.width - (node.linear.left - box.left);
                            }
                            else if (parent.floatContainer) {
                                const { containerType, alignmentType } = this.containerTypeVerticalMargin;
                                const container = node.ascend((item) => item.of(containerType, alignmentType), parent, 'renderParent');
                                if (container.length) {
                                    const box = node.box;
                                    let leftOffset = 0;
                                    let rightOffset = 0;
                                    for (const item of parent.naturalElements) {
                                        const linear = item.linear;
                                        if (item.floating && !children.includes(item) && node.intersectY(linear)) {
                                            if (item.float === 'left') {
                                                if (Math.floor(linear.right) > box.left) {
                                                    leftOffset = Math.max(leftOffset, linear.right - box.left);
                                                }
                                            }
                                            else if (item.float === 'right' && box.right > Math.ceil(linear.left)) {
                                                rightOffset = Math.max(rightOffset, box.right - linear.left);
                                            }
                                        }
                                    }
                                    return box.width - leftOffset - rightOffset;
                                }
                            }
                        }
                    }
                    return node.box.width;
                })();
                const cleared = NodeUI.linearData(children, true).cleared;
                const centerAligned = node.cssInitial('textAlign') === 'center';
                let textIndent = 0;
                if (node.naturalElement) {
                    if (node.blockDimension) {
                        textIndent = node.parseUnit(node.css('textIndent'));
                    }
                }
                else {
                    const parent = node.parent;
                    if (((_a = parent) === null || _a === void 0 ? void 0 : _a.blockDimension) && parent.children[0] === node) {
                        const value = parent.css('textIndent');
                        textIndent = node.parseUnit(value);
                        if (textIndent !== 0) {
                            if (textIndent < 0) {
                                parent.setCacheValue('paddingLeft', Math.max(0, parent.paddingLeft + textIndent));
                            }
                            node.setCacheValue('blockDimension', true);
                            node.css('textIndent', value);
                            parent.css('textIndent', '0px');
                        }
                    }
                }
                let rowWidth = 0;
                let previousRowLeft;
                let textIndentSpacing = false;
                partitionArray(children, item => item.float !== 'right').forEach((seg, index) => {
                    var _a, _b;
                    const length = seg.length;
                    if (length === 0) {
                        return;
                    }
                    const leftAlign = index === 0;
                    let leftForward = true;
                    let alignParent;
                    let rows;
                    if (leftAlign) {
                        if ((_a = seg[0].actualParent) === null || _a === void 0 ? void 0 : _a.cssInitialAny('textAlign', 'right', 'end')) {
                            alignParent = 'right';
                            leftForward = false;
                            seg[length - 1].anchor(alignParent, 'true');
                        }
                        else {
                            alignParent = 'left';
                        }
                        sortHorizontalFloat(seg);
                        rows = rowsLeft;
                    }
                    else {
                        alignParent = 'right';
                        rowsRight = [];
                        rows = rowsRight;
                    }
                    let previous;
                    for (let i = 0; i < length; i++) {
                        const item = seg[i];
                        let alignSibling;
                        if (leftAlign && leftForward) {
                            alignSibling = 'leftRight';
                            if (i === 0 && item.inline && Math.abs(textIndent) > item.actualWidth && item.float !== 'right' && !item.positionRelative) {
                                textIndentSpacing = true;
                                if (!item.floating) {
                                    item.setCacheValue('float', 'left');
                                    item.setCacheValue('floating', true);
                                }
                            }
                        }
                        else {
                            alignSibling = 'rightLeft';
                        }
                        if (!item.pageFlow) {
                            if (previous) {
                                const documentId = previous.documentId;
                                item.anchor(alignSibling, documentId);
                                item.anchor('top', documentId);
                            }
                            else {
                                item.anchor(alignParent, 'true');
                                item.anchor('top', 'true');
                            }
                            sortPositionAuto = true;
                            continue;
                        }
                        let bounds = item.bounds;
                        let siblings;
                        if (item.styleText && !item.hasPX('width')) {
                            const textBounds = item.textBounds;
                            if (textBounds && (textBounds.numberOfLines > 1 || Math.ceil(textBounds.width) < item.box.width)) {
                                bounds = textBounds;
                            }
                        }
                        let multiline = item.multiline;
                        if (multiline && Math.floor(bounds.width) <= boxWidth && !item.hasPX('width') && !isMultiline(item)) {
                            multiline = false;
                            item.multiline = false;
                        }
                        let anchored = item.autoMargin.horizontal;
                        if (anchored) {
                            const autoMargin = item.autoMargin;
                            if (autoMargin.leftRight) {
                                item.anchor('centerHorizontal', 'true');
                            }
                            else if (autoMargin.left) {
                                item.anchor('right', 'true');
                            }
                            else {
                                item.anchor('left', 'true');
                            }
                        }
                        if (previous) {
                            const items = rows[rows.length - 1];
                            let maxWidth = 0;
                            let baseWidth = 0;
                            function checkFloatWrap() {
                                if (previous.floating && previous.alignParent('left') && (multiline || Math.floor(rowWidth + item.actualWidth) < boxWidth)) {
                                    return true;
                                }
                                else if (node.floating && i === length - 1 && item.textElement && !/\s|-/.test(item.textContent.trim())) {
                                    if (node.hasPX('width')) {
                                        const width = node.css('width');
                                        if (node.parseUnit(width) > node.parseUnit(node.css('minWidth'))) {
                                            node.cssApply({
                                                width: 'auto',
                                                minWidth: width
                                            }, true);
                                        }
                                    }
                                    node.android('maxLines', '1');
                                    return true;
                                }
                                return false;
                            }
                            const checkWrapWidth = () => {
                                baseWidth = rowWidth + item.marginLeft;
                                if (previousRowLeft && !items.includes(previousRowLeft)) {
                                    baseWidth += previousRowLeft.linear.width;
                                }
                                if (previousRowLeft === undefined || !item.plainText || multiline || !items.includes(previousRowLeft) || cleared.has(item)) {
                                    baseWidth += bounds.width;
                                }
                                if (item.marginRight < 0) {
                                    baseWidth += item.marginRight;
                                }
                                maxWidth = boxWidth;
                                if (textIndent < 0) {
                                    if (rows.length <= 1) {
                                        maxWidth += textIndent;
                                    }
                                }
                                else if (textIndent > 0 && rows.length === 1) {
                                    maxWidth -= textIndent;
                                }
                                if (item.styleElement && item.inlineStatic) {
                                    baseWidth -= item.contentBoxWidth;
                                }
                                return true;
                            };
                            if (previous.floating && adjustFloatingNegativeMargin(item, previous)) {
                                alignSibling = '';
                            }
                            const viewGroup = item.nodeGroup && !item.hasAlign(128 /* SEGMENTED */);
                            let retainMultiline = false;
                            siblings = item.inlineVertical && previous.inlineVertical && item.previousSibling !== previous ? getElementsBetweenSiblings(previous.element, item.element) : undefined;
                            const startNewRow = () => {
                                var _a;
                                if (previous.textElement) {
                                    if (i === 1 && item.plainText && item.previousSibling === previous && !CHAR$1.TRAILINGSPACE.test(previous.textContent) && !CHAR$1.LEADINGSPACE.test(item.textContent)) {
                                        retainMultiline = true;
                                        return false;
                                    }
                                    else if (checkLineWrap) {
                                        if (previous.multiline && (previous.bounds.width >= boxWidth || item.plainText && Resource.hasLineBreak(previous, false, true))) {
                                            return true;
                                        }
                                    }
                                }
                                if (checkFloatWrap()) {
                                    return false;
                                }
                                else if (checkLineWrap) {
                                    if (checkWrapWidth() && baseWidth > maxWidth) {
                                        return true;
                                    }
                                    else if (((_a = item.actualParent) === null || _a === void 0 ? void 0 : _a.tagName) !== 'CODE') {
                                        return multiline && item.plainText || isMultiline(item);
                                    }
                                }
                                return false;
                            };
                            const textNewRow = item.textElement && startNewRow();
                            if (textNewRow ||
                                viewGroup ||
                                aboveRange$1(item.linear.top, previous.linear.bottom) && (item.blockStatic || item.floating && previous.float === item.float) ||
                                !item.textElement && !checkFloatWrap() && checkWrapWidth() && Math.floor(baseWidth) > maxWidth ||
                                !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.lineBreak || sibling.excluded && sibling.blockStatic) || ((_b = siblings) === null || _b === void 0 ? void 0 : _b.some(element => causesLineBreak(element, node.sessionId)))) ||
                                previous.autoMargin.horizontal ||
                                cleared.has(item)) {
                                if (leftForward) {
                                    if (previousRowLeft && (item.linear.bottom <= previousRowLeft.bounds.bottom || textIndentSpacing)) {
                                        if (!anchored) {
                                            item.anchor(alignSibling, previousRowLeft.documentId);
                                        }
                                    }
                                    else {
                                        if (!anchored) {
                                            item.anchor(alignParent, 'true');
                                        }
                                        previousRowLeft = undefined;
                                    }
                                    anchored = true;
                                }
                                else {
                                    if (previousRowLeft && item.linear.bottom > previousRowLeft.bounds.bottom) {
                                        previousRowLeft = undefined;
                                    }
                                    previous.anchor(alignParent, 'true');
                                }
                                if (items.length === 1 && (previous.centerAligned || centerAligned && !previous.blockStatic)) {
                                    previous.anchorDelete(alignParent);
                                    previous.anchor('centerHorizontal', 'true');
                                }
                                rowWidth = Math.min(0, textNewRow && !previous.multiline && multiline && !cleared.has(item) ? item.linear.right - node.box.right : 0);
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
                                if (multiline && !item.hasPX('width') && !previous.floating && !retainMultiline) {
                                    item.multiline = false;
                                }
                                items.push(item);
                            }
                        }
                        else {
                            if (leftForward) {
                                if (!anchored) {
                                    item.anchor(alignParent, 'true');
                                }
                            }
                            rows.push([item]);
                        }
                        if (item.float === 'left' && leftAlign) {
                            if (previousRowLeft) {
                                if (aboveRange$1(item.linear.bottom, previousRowLeft.linear.bottom)) {
                                    previousRowLeft = item;
                                }
                            }
                            else {
                                previousRowLeft = item;
                            }
                        }
                        if (siblings && !siblings.some(element => !!getElementAsNode(element, item.sessionId) || causesLineBreak(element, item.sessionId))) {
                            const betweenStart = getRangeClientRect(siblings[0]);
                            if (!betweenStart.numberOfLines) {
                                const betweenEnd = siblings.length > 1 ? getRangeClientRect(siblings[siblings.length - 1]) : undefined;
                                if (betweenEnd === undefined || !betweenEnd.numberOfLines) {
                                    rowWidth += betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                                }
                            }
                        }
                        rowWidth += item.marginLeft + bounds.width + item.marginRight;
                        previous = item;
                    }
                });
                if (rowsLeft.length === 1 && textIndent < 0) {
                    node.setCacheValue('paddingLeft', Math.max(0, node.paddingLeft + textIndent));
                }
            }
            if (rowsLeft.length > 1 || rowsRight && rowsRight.length > 1) {
                alignmentMultiLine = true;
            }
            const setVerticalAlign = (rows) => {
                let previousBaseline = null;
                const length = rows.length;
                for (let i = 0; i < length; i++) {
                    const items = rows[i];
                    let baseline;
                    if (items.length > 1) {
                        const bottomAligned = getTextBottom(items);
                        let textBottom = bottomAligned[0];
                        baseline = NodeUI.baseline(bottomAligned.length ? items.filter(item => !bottomAligned.includes(item)) : items);
                        if (baseline && textBottom) {
                            if (baseline !== textBottom && textBottom.bounds.height > baseline.bounds.height) {
                                baseline.anchor('bottom', textBottom.documentId);
                            }
                            else {
                                baseline = NodeUI.baseline(items);
                                textBottom = undefined;
                            }
                        }
                        const baselineAlign = [];
                        let documentId = i === 0 ? 'true' : (baseline ? baseline.documentId : '');
                        let maxCenterHeight = 0;
                        let textBaseline = null;
                        for (const item of items) {
                            if (item !== baseline && item !== textBottom) {
                                if (item.baseline) {
                                    baselineAlign.push(item);
                                }
                                else if (item.inlineVertical) {
                                    switch (item.verticalAlign) {
                                        case 'text-top':
                                            if (textBaseline === null) {
                                                textBaseline = NodeUI.baseline(items, true);
                                            }
                                            if (textBaseline) {
                                                if (item !== textBaseline) {
                                                    item.anchor('top', textBaseline.documentId);
                                                    break;
                                                }
                                            }
                                            break;
                                        case 'super':
                                            if (!item.baselineAltered) {
                                                item.modifyBox(2 /* MARGIN_TOP */, Math.ceil(item.fontSize * this.localSettings.deviations.superscriptTopOffset) * -1);
                                            }
                                        case 'top':
                                            if (documentId !== '' && documentId !== item.documentId) {
                                                item.anchor('top', documentId);
                                            }
                                            else if (baseline) {
                                                item.anchor('top', baseline.documentId);
                                            }
                                            break;
                                        case 'middle':
                                            const height = Math.max(item.actualHeight, item.lineHeight);
                                            if (!alignmentMultiLine) {
                                                item.anchor('centerVertical', 'true');
                                                if (item.imageElement) {
                                                    maxCenterHeight = Math.max(height, maxCenterHeight);
                                                }
                                            }
                                            else if (baseline) {
                                                const heightParent = Math.max(baseline.actualHeight, baseline.lineHeight);
                                                if (height < heightParent) {
                                                    item.anchor('top', baseline.documentId);
                                                    item.modifyBox(2 /* MARGIN_TOP */);
                                                    item.modifyBox(2 /* MARGIN_TOP */, Math.round((heightParent - height) / 2));
                                                }
                                                else if (height > maxCenterHeight) {
                                                    maxCenterHeight = height;
                                                }
                                            }
                                            break;
                                        case 'text-bottom':
                                            if (textBaseline === null) {
                                                textBaseline = NodeUI.baseline(items, true);
                                            }
                                            if (textBaseline !== item && textBaseline) {
                                                item.anchor('bottom', textBaseline.documentId);
                                            }
                                            else if (baseline) {
                                                item.anchor('bottom', baseline.documentId);
                                            }
                                            break;
                                        case 'sub':
                                            if (!item.baselineAltered) {
                                                item.modifyBox(8 /* MARGIN_BOTTOM */, Math.ceil(item.fontSize * this.localSettings.deviations.subscriptBottomOffset) * -1);
                                            }
                                        case 'bottom':
                                            if (documentId !== '' && !withinRange(node.bounds.height, item.bounds.height)) {
                                                if (!node.hasHeight && documentId === 'true') {
                                                    if (!alignmentMultiLine) {
                                                        node.css('height', formatPX$1(node.bounds.height), true);
                                                    }
                                                    else if (baseline) {
                                                        documentId = baseline.documentId;
                                                    }
                                                }
                                                item.anchor('bottom', documentId);
                                            }
                                            break;
                                        default:
                                            if (!item.baselineAltered) {
                                                baselineAlign.push(item);
                                            }
                                            break;
                                    }
                                }
                                else if (isLayoutBaselineAligned(item)) {
                                    baselineAlign.push(item);
                                }
                            }
                        }
                        const lengthA = baselineAlign.length;
                        if (baseline) {
                            baseline.baselineActive = true;
                            if (lengthA > 0) {
                                adjustBaseline(baseline, baselineAlign);
                            }
                            else if (baseline.textElement && maxCenterHeight > baseline.actualHeight) {
                                baseline.anchor('centerVertical', 'true');
                                baseline = null;
                            }
                        }
                        else if (lengthA < items.length && lengthA > 0) {
                            textBottom = getTextBottom(items)[0];
                            if (textBottom) {
                                for (const item of baselineAlign) {
                                    if (item.baseline && !item.multiline && textBottom.bounds.height > item.bounds.height) {
                                        item.anchor('bottom', textBottom.documentId);
                                    }
                                }
                            }
                        }
                        for (let j = items.length - 1, isLast = true; j > 0; j--) {
                            const previous = items[j];
                            if (previous.textElement) {
                                previous.setSingleLine(isLast && !previous.rightAligned && !previous.centerAligned);
                                isLast = false;
                            }
                        }
                    }
                    else {
                        baseline = items[0];
                        baseline.baselineActive = true;
                    }
                    if (i > 0) {
                        if (previousBaseline === null) {
                            const previousRow = rows[i - 1];
                            previousBaseline = previousRow.find(sibling => !sibling.floating) || previousRow[0];
                            let valid = false;
                            for (const sibling of previousRow) {
                                if (sibling === previousBaseline) {
                                    valid = true;
                                }
                                else if (valid && sibling.linear.bottom >= previousBaseline.linear.bottom && (!sibling.floating || previousBaseline.floating)) {
                                    previousBaseline = sibling;
                                }
                            }
                        }
                        for (const item of items) {
                            if (item.alignSibling('baseline') === '') {
                                item.anchor('topBottom', previousBaseline.documentId);
                            }
                        }
                    }
                    previousBaseline = baseline;
                }
            };
            setVerticalAlign(rowsLeft);
            if (rowsRight) {
                setVerticalAlign(rowsRight);
            }
            if (alignmentMultiLine) {
                node.horizontalRows = rowsRight ? rowsLeft.concat(rowsRight) : rowsLeft;
            }
            if (sortPositionAuto) {
                const renderChildren = node.renderChildren;
                const renderTemplates = node.renderTemplates;
                const positionAuto = [];
                for (let i = 0; i < renderChildren.length; i++) {
                    if (!renderChildren[i].pageFlow) {
                        positionAuto.push(renderTemplates[i]);
                        renderChildren.splice(i, 1);
                        renderTemplates.splice(i--, 1);
                    }
                }
                for (const item of positionAuto) {
                    renderChildren.push(item.node);
                    renderTemplates.push(item);
                }
            }
        }
        processConstraintHorizontal(node, children) {
            var _a;
            const baseline = NodeUI.baseline(children);
            const textBaseline = NodeUI.baseline(children, true);
            const reverse = node.hasAlign(2048 /* RIGHT */);
            const textBottom = getTextBottom(children)[0];
            const documentId = baseline ? baseline.documentId : '';
            const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
            let bias = 0;
            switch (node.cssAscend('textAlign', true)) {
                case 'center':
                    bias = 0.5;
                    break;
                case 'right':
                case 'end':
                    if (!reverse) {
                        bias = 1;
                    }
                    break;
            }
            sortHorizontalFloat(children);
            if (!node.hasPX('width') && children.some(item => item.percentWidth)) {
                node.setLayoutWidth('match_parent');
            }
            let tallest;
            let bottom;
            let previous;
            const length = children.length;
            for (let i = 0; i < length; i++) {
                const item = children[i];
                if (previous) {
                    if (item.pageFlow) {
                        previous.anchor(chainEnd, item.documentId);
                        item.anchor(chainStart, previous.documentId);
                        if (i === length - 1) {
                            item.anchor(anchorEnd, 'parent');
                        }
                    }
                    else if (item.positionAuto) {
                        item.anchor(chainStart, previous.documentId);
                    }
                }
                else {
                    item.anchor(anchorStart, 'parent');
                    item.anchorStyle(STRING_ANDROID.HORIZONTAL, 'packed', bias);
                }
                if (item.pageFlow) {
                    if (item !== baseline) {
                        if (item.inlineVertical) {
                            let alignTop = false;
                            if (tallest === undefined || getMaxHeight(item) > getMaxHeight(tallest)) {
                                tallest = item;
                            }
                            switch (item.verticalAlign) {
                                case 'text-top':
                                    if (textBaseline && item !== textBaseline) {
                                        item.anchor('top', textBaseline.documentId);
                                    }
                                    else {
                                        alignTop = true;
                                    }
                                    break;
                                case 'middle':
                                    if (((_a = baseline) === null || _a === void 0 ? void 0 : _a.textElement) === false || textBottom) {
                                        alignTop = true;
                                    }
                                    else {
                                        item.anchorParent(STRING_ANDROID.VERTICAL);
                                    }
                                    break;
                                case 'text-bottom':
                                    if (textBaseline && item !== textBaseline) {
                                        if (item !== textBottom) {
                                            item.anchor('bottom', textBaseline.documentId);
                                        }
                                        else if (textBottom) {
                                            alignTop = true;
                                        }
                                        break;
                                    }
                                case 'bottom':
                                    if (bottom === undefined) {
                                        for (const child of children) {
                                            if (!child.baseline && (bottom === undefined || child.linear.bottom > bottom.linear.bottom)) {
                                                bottom = child;
                                            }
                                        }
                                    }
                                    if (item === bottom) {
                                        alignTop = true;
                                    }
                                    else {
                                        item.anchor('bottom', 'parent');
                                    }
                                    break;
                                case 'baseline':
                                    if (baseline === null || item.blockVertical || !item.textElement && getMaxHeight(item) > getMaxHeight(baseline)) {
                                        alignTop = true;
                                    }
                                    else {
                                        item.anchor('baseline', documentId);
                                    }
                                    break;
                                default:
                                    alignTop = true;
                                    break;
                            }
                            if (alignTop) {
                                item.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                                item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - node.box.top);
                                item.baselineAltered = true;
                            }
                        }
                        else if (item.plainText && baseline) {
                            item.anchor('baseline', documentId);
                        }
                        else {
                            item.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                        }
                        item.anchored = true;
                    }
                    else {
                        baseline.baselineActive = true;
                    }
                    Controller.setConstraintDimension(item);
                    previous = item;
                }
                else if (item.positionAuto) {
                    item.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                    item.anchored = true;
                }
            }
            if (baseline) {
                if (tallest && tallest !== baseline && baseline.textElement && getMaxHeight(tallest) > getMaxHeight(baseline)) {
                    switch (tallest.verticalAlign) {
                        case 'middle':
                            baseline.anchorParent(STRING_ANDROID.VERTICAL, undefined, undefined, true);
                            break;
                        case 'baseline':
                            baseline.anchor('baseline', tallest.documentId);
                            break;
                        case 'bottom':
                        case 'text-bottom':
                            baseline.anchor('bottom', tallest.documentId);
                            break;
                        case 'sub':
                            if (!tallest.textElement) {
                                baseline.anchor('bottom', tallest.documentId);
                                baseline.modifyBox(8 /* MARGIN_BOTTOM */, Math.ceil(baseline.fontSize * this.localSettings.deviations.subscriptBottomOffset) * -1);
                            }
                            break;
                        case 'super':
                            if (!tallest.textElement) {
                                baseline.anchor('bottom', tallest.documentId);
                                baseline.modifyBox(2 /* MARGIN_TOP */, Math.ceil(baseline.fontSize * this.localSettings.deviations.superscriptTopOffset) * -1);
                            }
                            break;
                    }
                }
                else {
                    baseline.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                    baseline.modifyBox(2 /* MARGIN_TOP */, Math.floor(baseline.linear.top - node.box.top));
                }
                baseline.anchored = true;
            }
        }
        processConstraintColumn(node, children) {
            let items = [];
            const rows = [items];
            for (const item of children) {
                if (item.css('columnSpan') === 'all') {
                    if (items.length) {
                        rows.push([item]);
                    }
                    else {
                        items.push(item);
                    }
                    items = [];
                    rows.push(items);
                }
                else {
                    items.push(item);
                }
            }
            if (items.length === 0) {
                rows.pop();
            }
            const columnGap = node.parseUnit(node.css('columnGap')) || node.fontSize;
            const columnWidth = node.parseUnit(node.css('columnWidth'), 'width');
            const columnCount = node.toInt('columnCount');
            let columnSized = 0;
            if (columnWidth > 0) {
                let boxWidth;
                if (isUserAgent$1(4 /* SAFARI */)) {
                    boxWidth = Math.min(node.width > 0 ? node.width - node.contentBoxWidth : Number.POSITIVE_INFINITY, node.box.width * (columnCount || 1), node.documentParent.box.width - node.contentBoxWidth);
                }
                else {
                    boxWidth = node.box.width;
                }
                while (boxWidth - columnWidth >= 0) {
                    columnSized++;
                    boxWidth -= columnWidth + columnGap;
                }
            }
            else {
                columnSized = Number.POSITIVE_INFINITY;
            }
            let previousRow;
            const length = rows.length;
            for (let i = 0; i < length; i++) {
                const row = rows[i];
                const rowStart = row[0];
                if (row.length === 1) {
                    if (i === 0) {
                        rowStart.anchor('top', 'parent');
                        rowStart.anchorStyle(STRING_ANDROID.VERTICAL);
                    }
                    else if (previousRow) {
                        previousRow.anchor('bottomTop', rowStart.documentId);
                        rowStart.anchor('topBottom', typeof previousRow === 'string' ? previousRow : previousRow.documentId);
                    }
                    if (rowStart.rightAligned) {
                        rowStart.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed', 1);
                    }
                    else if (rowStart.centerAligned) {
                        rowStart.anchorParent(STRING_ANDROID.HORIZONTAL);
                    }
                    else {
                        rowStart.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed');
                    }
                    if (i === length - 1) {
                        rowStart.anchor('bottom', 'parent');
                    }
                    else {
                        previousRow = row[0];
                    }
                }
                else {
                    const columns = [];
                    const lengthA = row.length;
                    let columnMin = Math.min(lengthA, columnSized, columnCount || Number.POSITIVE_INFINITY);
                    let percentGap = 0;
                    if (columnMin > 1) {
                        let perRowCount = lengthA >= columnMin ? Math.ceil(lengthA / columnMin) : 1;
                        const maxHeight = Math.floor(row.reduce((a, b) => a + b.bounds.height, 0) / columnMin);
                        let excessCount = perRowCount > 1 && lengthA % columnMin !== 0 ? lengthA - columnMin : Number.POSITIVE_INFINITY;
                        let totalGap = 0;
                        for (let j = 0, k = 0, l = 0; j < lengthA; j++, l++) {
                            const column = row[j];
                            const rowIteration = l % perRowCount === 0;
                            if (k < columnMin - 1 && (rowIteration || excessCount <= 0 || j > 0 && (row[j - 1].bounds.height >= maxHeight || columns[k].length && (row.length - j + 1 === columnMin - k) && row[j - 1].bounds.height > row[j + 1].bounds.height))) {
                                if (j > 0) {
                                    k++;
                                    if (rowIteration) {
                                        excessCount--;
                                    }
                                    else {
                                        excessCount++;
                                    }
                                }
                                if (columns[k] === undefined) {
                                    columns[k] = [];
                                }
                                l = 0;
                            }
                            columns[k].push(column);
                            if (column.length) {
                                totalGap += maxArray(objectMap(column.children, child => child.marginLeft + child.marginRight));
                            }
                            if (j > 0 && /H\d/.test(column.tagName)) {
                                if (columns[k].length === 1 && j === row.length - 2) {
                                    columnMin--;
                                    excessCount = 0;
                                }
                                else if ((l + 1) % perRowCount === 0 && row.length - j > columnMin && !row[j + 1].multiline && row[j + 1].bounds.height < maxHeight) {
                                    columns[k].push(row[++j]);
                                    l = -1;
                                }
                            }
                            else if (row.length - j === columnMin - k && excessCount !== Number.POSITIVE_INFINITY) {
                                perRowCount = 1;
                            }
                        }
                        percentGap = columnMin > 1 ? Math.max(((totalGap + (columnGap * (columnMin - 1))) / node.box.width) / columnMin, 0.01) : 0;
                    }
                    else {
                        columns.push(row);
                    }
                    const horizontal = [];
                    const lengthB = columns.length;
                    for (let j = 0; j < lengthB; j++) {
                        const data = columns[j];
                        for (const item of data) {
                            item.setLayoutWidth('0px');
                            item.app('layout_constraintWidth_percent', truncate$2((1 / columnMin) - percentGap, this.localSettings.precision.standardFloat));
                        }
                        horizontal.push(data[0]);
                    }
                    const columnHeight = new Array(lengthB).fill(0);
                    const barrier = [];
                    for (let j = 0; j < lengthB; j++) {
                        const item = columns[j];
                        if (j < lengthB - 1 && item.length > 1) {
                            const columnEnd = item[item.length - 1];
                            if (/H\d/.test(columnEnd.tagName)) {
                                item.pop();
                                horizontal[j + 1] = columnEnd;
                                columns[j + 1].unshift(columnEnd);
                            }
                        }
                        const elements = [];
                        const lengthC = item.length;
                        for (let k = 0; k < lengthC; k++) {
                            const column = item[k];
                            if (column.naturalChild) {
                                elements.push(column.element.cloneNode(true));
                            }
                            else {
                                columnHeight[j] += column.linear.height;
                            }
                        }
                        if (elements.length) {
                            const container = createElement(document.body, 'div', {
                                width: formatPX$1(columnWidth || node.box.width / columnMin),
                                visibility: 'hidden'
                            });
                            for (const element of elements) {
                                container.appendChild(element);
                            }
                            columnHeight[j] += container.getBoundingClientRect().height;
                            document.body.removeChild(container);
                        }
                    }
                    const lengthD = horizontal.length;
                    for (let j = 1; j < lengthD; j++) {
                        horizontal[j].modifyBox(16 /* MARGIN_LEFT */, columnGap);
                    }
                    setColumnHorizontal(horizontal);
                    setColumnVertical(columns, i === length - 1, previousRow);
                    previousRow = undefined;
                    if (columns.every(item => item.length === 1)) {
                        for (const item of columns) {
                            barrier.push(item[item.length - 1]);
                        }
                        previousRow = this.addBarrier(barrier, 'bottom');
                    }
                    if (!previousRow) {
                        let maxColumnHeight = 0;
                        const lengthE = columnHeight.length;
                        for (let j = 0; j < lengthE; j++) {
                            if (columnHeight[j] >= maxColumnHeight) {
                                previousRow = columns[j].pop();
                                maxColumnHeight = columnHeight[j];
                            }
                        }
                    }
                }
            }
        }
        processConstraintChain(node, children) {
            const parent = children[0].actualParent || node;
            const horizontal = NodeUI.partitionRows(children);
            const floating = node.hasAlign(512 /* FLOAT */);
            const length = horizontal.length;
            if (length > 1) {
                node.horizontalRows = horizontal;
            }
            if (!node.hasWidth && children.some(item => item.percentWidth)) {
                node.setLayoutWidth('match_parent');
            }
            let previousSiblings = [];
            let bottomFloating = false;
            for (let i = 0; i < length; i++) {
                const partition = horizontal[i];
                const previousRow = horizontal[i - 1];
                const [floatingRight, floatingLeft] = partitionArray(partition, item => item.float === 'right' || item.autoMargin.left === true);
                let aboveRowEnd;
                let currentRowBottom;
                const applyLayout = (seg, reverse) => {
                    const lengthA = seg.length;
                    if (lengthA > 0) {
                        const [anchorStart, anchorEnd, chainStart, chainEnd] = getAnchorDirection(reverse);
                        const rowStart = seg[0];
                        const rowEnd = seg[lengthA - 1];
                        rowStart.anchor(anchorStart, 'parent');
                        if (!floating && parent.css('textAlign') === 'center') {
                            rowStart.anchorStyle(STRING_ANDROID.HORIZONTAL, 'spread');
                        }
                        else if (lengthA > 1) {
                            if (reverse) {
                                rowEnd.anchorStyle(STRING_ANDROID.HORIZONTAL, 'packed', 1);
                            }
                            else {
                                rowStart.anchorStyle(STRING_ANDROID.HORIZONTAL);
                            }
                        }
                        if (lengthA > 1 || rowEnd.autoMargin.leftRight) {
                            rowEnd.anchor(anchorEnd, 'parent');
                        }
                        for (let j = 0; j < lengthA; j++) {
                            const chain = seg[j];
                            const previous = seg[j - 1];
                            const next = seg[j + 1];
                            if (i === 0) {
                                if (length === 1) {
                                    chain.anchorParent(STRING_ANDROID.VERTICAL);
                                    if (!chain.autoMargin.topBottom) {
                                        chain.anchorStyle(STRING_ANDROID.VERTICAL, 'packed', chain.autoMargin.top ? 1 : 0);
                                    }
                                }
                                else {
                                    chain.anchor('top', 'parent');
                                }
                            }
                            else if (!bottomFloating && i === length - 1) {
                                chain.anchor('bottom', 'parent');
                            }
                            if (chain.autoMargin.leftRight) {
                                chain.anchorParent(STRING_ANDROID.HORIZONTAL);
                            }
                            else {
                                if (previous) {
                                    if (!previous.pageFlow && previous.positionAuto) {
                                        let found;
                                        for (let k = j - 2; k >= 0; k--) {
                                            found = seg[k];
                                            if (found.pageFlow) {
                                                break;
                                            }
                                            else {
                                                found = undefined;
                                            }
                                        }
                                        if (found) {
                                            chain.anchor(chainStart, found.documentId);
                                        }
                                        else {
                                            chain.anchor(anchorStart, 'parent');
                                        }
                                    }
                                    else {
                                        chain.anchor(chainStart, previous.documentId);
                                    }
                                }
                                if (next) {
                                    chain.anchor(chainEnd, next.documentId);
                                }
                            }
                            Controller.setConstraintDimension(chain);
                            if (floating) {
                                if (i > 0 && j === 0) {
                                    let checkBottom = false;
                                    for (const item of previousSiblings) {
                                        if (Math.ceil(chain.linear.top) < Math.floor(item.linear.bottom)) {
                                            checkBottom = true;
                                            break;
                                        }
                                    }
                                    if (checkBottom) {
                                        aboveRowEnd = previousRow[previousRow.length - 1];
                                        for (let k = previousSiblings.length - 2; k >= 0; k--) {
                                            const aboveBefore = previousSiblings[k];
                                            if (aboveBefore.linear.bottom > aboveRowEnd.linear.bottom) {
                                                if (reverse && Math.ceil(aboveBefore.linear[anchorEnd]) - Math.floor(parent.box[anchorEnd]) < chain.linear.width) {
                                                    continue;
                                                }
                                                const adjacent = previousSiblings[k + 1];
                                                chain.anchor(anchorStart, adjacent.documentId, true);
                                                if (reverse) {
                                                    chain.modifyBox(4 /* MARGIN_RIGHT */, -adjacent.marginRight, false);
                                                }
                                                else {
                                                    chain.modifyBox(16 /* MARGIN_LEFT */, -adjacent.marginLeft, false);
                                                }
                                                rowStart.anchorDelete(chainEnd);
                                                rowEnd.anchorDelete(anchorEnd);
                                                rowStart.delete('app', 'layout_constraintHorizontal_chainStyle', 'layout_constraintHorizontal_bias');
                                                if (currentRowBottom === undefined) {
                                                    currentRowBottom = chain;
                                                    bottomFloating = true;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
                applyLayout(floatingLeft, false);
                applyLayout(floatingRight, true);
                if (floating) {
                    previousSiblings = previousSiblings.concat(floatingLeft, floatingRight);
                }
                if (i > 0) {
                    if (aboveRowEnd === undefined) {
                        aboveRowEnd = previousRow[0];
                        const lengthB = previousRow.length;
                        for (let k = 1; k < lengthB; k++) {
                            if (previousRow[k].linear.bottom >= aboveRowEnd.linear.bottom) {
                                aboveRowEnd = previousRow[k];
                            }
                        }
                    }
                    if (currentRowBottom === undefined) {
                        currentRowBottom = partition[0];
                        const lengthB = partition.length;
                        for (let k = 1; k < lengthB; k++) {
                            const row = partition[k];
                            if (row.linear.bottom >= currentRowBottom.linear.bottom) {
                                currentRowBottom = row;
                            }
                        }
                        bottomFloating = false;
                    }
                    currentRowBottom.anchor('topBottom', aboveRowEnd.documentId);
                    aboveRowEnd.anchor('bottomTop', currentRowBottom.documentId);
                    for (const chain of partition) {
                        if (chain !== currentRowBottom) {
                            const autoMargin = chain.autoMargin;
                            if (!autoMargin.topBottom) {
                                chain.anchorStyle(STRING_ANDROID.VERTICAL, 'packed', autoMargin.top ? 1 : 0);
                            }
                            chain.anchor('top', currentRowBottom.documentId);
                            chain.modifyBox(2 /* MARGIN_TOP */, currentRowBottom.marginTop * -1);
                        }
                    }
                }
            }
        }
        createLayoutNodeGroup(layout) {
            return this.createNodeGroup(layout.node, layout.children, layout.parent);
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
        get containerTypePercent() {
            return {
                containerType: CONTAINER_NODE.CONSTRAINT,
                alignmentType: 8 /* HORIZONTAL */,
                renderType: 0
            };
        }
        get afterInsertNode() {
            return (node) => {
                if (!this.userSettings.exclusionsDisabled) {
                    node.setExclusions();
                }
                node.localSettings = DEFAULT_VIEWSETTINGS;
            };
        }
        get userSettings() {
            return this.application.userSettings;
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
        }
    };

    var DIMEN_TMPL = {
        'resources': {
            '>': {
                'dimen': {
                    '@': ['name'],
                    '~': true
                }
            }
        }
    };

    var FONTFAMILY_TMPL = {
        'font-family': {
            '@': ['xmlns:android'],
            '>': {
                'font': {
                    '^': 'android',
                    '@': ['font', 'fontStyle', 'fontWeight']
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
        }
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
        }
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
        }
    };

    const $lib$4 = squared.lib;
    const { fromLastIndexOf: fromLastIndexOf$2, objectMap: objectMap$1 } = $lib$4.util;
    const { applyTemplate, replaceTab: replaceTab$1 } = $lib$4.xml;
    const STORED$1 = Resource.STORED;
    const REGEX_FILENAME = /^(.+)\/(.+?\.\w+)$/;
    const REGEX_DRAWABLE_UNIT = /"(-?[\d.]+)px"/g;
    const REGEX_THEME_UNIT = />(-?[\d.]+)px</g;
    function getFileAssets(items) {
        const length = items.length;
        const result = new Array(length / 3);
        for (let i = 0, j = 0; i < length; i += 3, j++) {
            result[j] = {
                pathname: items[i + 1],
                filename: items[i + 2],
                content: items[i]
            };
        }
        return result;
    }
    function getImageAssets(items) {
        const length = items.length;
        const result = new Array(length / 3);
        for (let i = 0, j = 0; i < length; i += 3, j++) {
            result[j] = {
                pathname: items[i + 1],
                filename: items[i + 2],
                content: '',
                uri: items[i]
            };
        }
        return result;
    }
    const createFileAsset = (pathname, filename, content) => ({ pathname, filename, content });
    const replaceDrawableLength = (value, dpi, format) => format === 'dp' ? value.replace(REGEX_DRAWABLE_UNIT, (match, ...capture) => '"' + convertLength(capture[0], dpi, false) + '"') : value;
    const replaceThemeLength = (value, dpi, format) => format === 'dp' ? value.replace(REGEX_THEME_UNIT, (match, ...capture) => '>' + convertLength(capture[0], dpi, false) + '<') : value;
    const caseInsensitive = (a, b) => a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1;
    class File extends squared.base.FileUI {
        copyToDisk(directory, assets, callback) {
            this.copying(directory, this.getAssetsAll(assets), callback);
        }
        appendToArchive(pathname, assets) {
            this.archiving(this.userSettings.outputArchiveName, this.getAssetsAll(assets), pathname);
        }
        saveToArchive(filename, assets) {
            this.archiving(filename, this.getAssetsAll(assets));
        }
        resourceAllToXml({ copyTo, archiveTo, callback } = {}) {
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
            if (copyTo || archiveTo) {
                let assets = [];
                for (const name in result) {
                    assets = assets.concat(name === 'image' ? getImageAssets(result[name]) : getFileAssets(result[name]));
                }
                if (copyTo) {
                    this.copying(copyTo, assets, callback);
                }
                if (archiveTo) {
                    this.archiving(archiveTo, assets);
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
            for (const [name, innerText] of Array.from(STORED$1.strings.entries()).sort(caseInsensitive)) {
                itemArray.push({ name, innerText });
            }
            return this.checkFileAssets([
                replaceTab$1(applyTemplate('resources', STRING_TMPL, [item]), this.userSettings.insertSpaces, true),
                this.directory.string,
                'strings.xml'
            ], options);
        }
        resourceStringArrayToXml(options = {}) {
            if (STORED$1.arrays.size) {
                const item = { 'string-array': [] };
                const itemArray = item['string-array'];
                for (const [name, values] of Array.from(STORED$1.arrays.entries()).sort()) {
                    itemArray.push({
                        name,
                        item: objectMap$1(values, innerText => ({ innerText }))
                    });
                }
                return this.checkFileAssets([
                    replaceTab$1(applyTemplate('resources', STRINGARRAY_TMPL, [item]), this.userSettings.insertSpaces, true),
                    this.directory.string,
                    'string_arrays.xml'
                ], options);
            }
            return [];
        }
        resourceFontToXml(options = {}) {
            var _a;
            if (STORED$1.fonts.size) {
                const resource = this.resource;
                const { insertSpaces, targetAPI } = this.userSettings;
                const xmlns = targetAPI < 26 /* OREO */ ? XMLNS_ANDROID.app : XMLNS_ANDROID.android;
                const pathname = this.directory.font;
                const result = [];
                for (const [name, font] of Array.from(STORED$1.fonts.entries()).sort()) {
                    const item = {
                        'xmlns:android': xmlns,
                        font: []
                    };
                    const itemArray = item.font;
                    for (const attr in font) {
                        const [fontFamily, fontStyle, fontWeight] = attr.split('|');
                        let fontName = name;
                        if (fontStyle === 'normal') {
                            fontName += fontWeight === '400' ? '_normal' : '_' + font[attr];
                        }
                        else {
                            fontName += '_' + fontStyle;
                            if (fontWeight !== '400') {
                                fontName += '_' + font[attr];
                            }
                        }
                        itemArray.push({
                            font: '@font/' + fontName,
                            fontStyle,
                            fontWeight
                        });
                        const uri = (_a = resource.getFont(fontFamily, fontStyle, fontWeight)) === null || _a === void 0 ? void 0 : _a.srcUrl;
                        if (uri) {
                            this.addAsset({
                                pathname,
                                filename: fontName + '.' + fromLastIndexOf$2(uri, '.').toLowerCase(),
                                uri
                            });
                        }
                    }
                    let output = replaceTab$1(applyTemplate('font-family', FONTFAMILY_TMPL, [item]), insertSpaces);
                    if (targetAPI < 26 /* OREO */) {
                        output = output.replace(/\s+android:/g, ' app:');
                    }
                    result.push(output, pathname, name + '.xml');
                }
                this.checkFileAssets(result, options);
                return result;
            }
            return [];
        }
        resourceColorToXml(options = {}) {
            if (STORED$1.colors.size) {
                const item = { color: [] };
                const itemArray = item.color;
                for (const [innerText, name] of Array.from(STORED$1.colors.entries()).sort()) {
                    itemArray.push({ name, innerText });
                }
                return this.checkFileAssets([
                    replaceTab$1(applyTemplate('resources', COLOR_TMPL, [item]), this.userSettings.insertSpaces),
                    this.directory.string,
                    'colors.xml'
                ], options);
            }
            return [];
        }
        resourceStyleToXml(options = {}) {
            const result = [];
            if (STORED$1.styles.size) {
                const item = { style: [] };
                const itemArray = item.style;
                for (const style of Array.from(STORED$1.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1)) {
                    const styleArray = style.items;
                    if (Array.isArray(styleArray)) {
                        const itemStyle = [];
                        for (const obj of styleArray.sort((a, b) => a.key >= b.key ? 1 : -1)) {
                            itemStyle.push({ name: obj.key, innerText: obj.value });
                        }
                        itemArray.push({
                            name: style.name,
                            parent: style.parent,
                            item: itemStyle
                        });
                    }
                }
                result.push(replaceTab$1(applyTemplate('resources', STYLE_TMPL, [item]), this.userSettings.insertSpaces), this.directory.string, 'styles.xml');
            }
            if (STORED$1.themes.size) {
                const { convertPixels, insertSpaces, manifestThemeName, resolutionDPI } = this.userSettings;
                const appTheme = {};
                for (const [filename, theme] of STORED$1.themes.entries()) {
                    const match = REGEX_FILENAME.exec(filename);
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
                                    item: themeArray
                                });
                            }
                            if (themeName === manifestThemeName) {
                                appTheme[filename] = true;
                            }
                        }
                        result.push(replaceTab$1(replaceThemeLength(applyTemplate('resources', STYLE_TMPL, [item]), resolutionDPI, convertPixels), insertSpaces), match[1], match[2]);
                    }
                }
            }
            return this.checkFileAssets(result, options);
        }
        resourceDimenToXml(options = {}) {
            if (STORED$1.dimens.size) {
                const { convertPixels, resolutionDPI } = this.userSettings;
                const item = { dimen: [] };
                const itemArray = item.dimen;
                for (const [name, value] of Array.from(STORED$1.dimens.entries()).sort()) {
                    itemArray.push({ name, innerText: convertPixels ? convertLength(value, resolutionDPI, false) : value });
                }
                return this.checkFileAssets([
                    replaceTab$1(applyTemplate('resources', DIMEN_TMPL, [item])),
                    this.directory.string,
                    'dimens.xml'
                ], options);
            }
            return [];
        }
        resourceDrawableToXml(options = {}) {
            if (STORED$1.drawables.size) {
                const { convertPixels, insertSpaces, resolutionDPI } = this.userSettings;
                const directory = this.directory.image;
                const result = [];
                for (const [name, value] of STORED$1.drawables.entries()) {
                    result.push(replaceTab$1(replaceDrawableLength(value, resolutionDPI, convertPixels), insertSpaces), directory, name + '.xml');
                }
                return this.checkFileAssets(result, options);
            }
            return [];
        }
        resourceDrawableImageToXml({ copyTo, archiveTo, callback } = {}) {
            if (STORED$1.images.size) {
                const directory = this.directory.image;
                const result = [];
                for (const [name, images] of STORED$1.images.entries()) {
                    if (Object.keys(images).length > 1) {
                        for (const dpi in images) {
                            const value = images[dpi];
                            result.push(value, directory + '-' + dpi, name + '.' + fromLastIndexOf$2(value, '.'));
                        }
                    }
                    else {
                        const mdpi = images.mdpi;
                        if (mdpi) {
                            result.push(mdpi, directory, name + '.' + fromLastIndexOf$2(mdpi, '.'));
                        }
                    }
                }
                if (copyTo || archiveTo) {
                    const assets = getImageAssets(result);
                    if (copyTo) {
                        this.copying(copyTo, assets, callback);
                    }
                    if (archiveTo) {
                        this.archiving(archiveTo, assets);
                    }
                }
                return result;
            }
            return [];
        }
        resourceAnimToXml(options = {}) {
            if (STORED$1.animators.size) {
                const insertSpaces = this.userSettings.insertSpaces;
                const result = [];
                for (const [name, value] of STORED$1.animators.entries()) {
                    result.push(replaceTab$1(value, insertSpaces), 'res/anim', name + '.xml');
                }
                return this.checkFileAssets(result, options);
            }
            return [];
        }
        layoutAllToXml(options = {}) {
            const { assets, copyTo, archiveTo, callback } = options;
            const result = {};
            if (assets) {
                const layouts = [];
                const length = assets.length;
                for (let i = 0; i < length; i++) {
                    const { content, filename, pathname } = assets[i];
                    result[filename] = [content];
                    if (archiveTo) {
                        layouts.push(createFileAsset(pathname, i === 0 ? this.userSettings.outputMainFileName : filename + '.xml', content));
                    }
                }
                if (copyTo) {
                    this.copying(copyTo, layouts, callback);
                }
                if (archiveTo) {
                    this.archiving(archiveTo, layouts);
                }
            }
            return result;
        }
        getAssetsAll(assets) {
            const result = [];
            const length = assets.length;
            for (let i = 0; i < length; i++) {
                const item = assets[i];
                result.push(createFileAsset(item.pathname, i === 0 ? this.userSettings.outputMainFileName : item.filename + '.xml', item.content));
            }
            return result.concat(getFileAssets(this.resourceStringToXml()), getFileAssets(this.resourceStringArrayToXml()), getFileAssets(this.resourceFontToXml()), getFileAssets(this.resourceColorToXml()), getFileAssets(this.resourceDimenToXml()), getFileAssets(this.resourceStyleToXml()), getFileAssets(this.resourceDrawableToXml()), getImageAssets(this.resourceDrawableImageToXml()), getFileAssets(this.resourceAnimToXml()));
        }
        checkFileAssets(content, { copyTo, archiveTo, callback } = {}) {
            if (copyTo || archiveTo) {
                const assets = getFileAssets(content);
                if (copyTo) {
                    this.copying(copyTo, assets, callback);
                }
                if (archiveTo) {
                    this.archiving(archiveTo, assets);
                }
            }
            return content;
        }
        get userSettings() {
            return this.resource.userSettings;
        }
    }

    const { NODE_PROCEDURE: NODE_PROCEDURE$2 } = squared.base.lib.enumeration;
    class Accessibility extends squared.base.extensions.Accessibility {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        afterBaseLayout() {
            for (const node of this.application.processing.cache) {
                if (node.inputElement && node.visible && node.hasProcedure(NODE_PROCEDURE$2.ACCESSIBILITY)) {
                    switch (node.controlName) {
                        case CONTAINER_ANDROID.EDIT:
                            if (!node.companion) {
                                [node.previousSibling, node.nextSibling].some((sibling) => {
                                    var _a;
                                    if (((_a = sibling) === null || _a === void 0 ? void 0 : _a.visible) && sibling.pageFlow) {
                                        const element = node.element;
                                        const labelElement = sibling.element;
                                        const labelParent = sibling.documentParent.tagName === 'LABEL' && sibling.documentParent;
                                        if (element.id && element.id === labelElement.htmlFor) {
                                            sibling.android('labelFor', node.documentId);
                                            return true;
                                        }
                                        else if (labelParent && sibling.textElement) {
                                            labelParent.android('labelFor', node.documentId);
                                            return true;
                                        }
                                    }
                                    return false;
                                });
                            }
                        case CONTAINER_ANDROID.SELECT:
                        case CONTAINER_ANDROID.CHECKBOX:
                        case CONTAINER_ANDROID.RADIO:
                        case CONTAINER_ANDROID.BUTTON: {
                            const element = node.element;
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
    }

    var $LayoutUI = squared.base.LayoutUI;
    const $lib$5 = squared.lib;
    const { formatPercent, formatPX: formatPX$2, isLength: isLength$2, isPercent: isPercent$2 } = $lib$5.css;
    const { maxArray: maxArray$1, truncate: truncate$3 } = $lib$5.math;
    const { CHAR: CHAR$2 } = $lib$5.regex;
    const { captureMap, convertInt, flatMultiArray, objectMap: objectMap$2 } = $lib$5.util;
    const $base_lib = squared.base.lib;
    const { BOX_STANDARD: BOX_STANDARD$2, NODE_ALIGNMENT: NODE_ALIGNMENT$2, NODE_PROCEDURE: NODE_PROCEDURE$3, NODE_RESOURCE: NODE_RESOURCE$1 } = $base_lib.enumeration;
    const { CSS_GRID } = $base_lib.constant.EXT_NAME;
    const REGEX_ALIGNSELF = /(start|end|center|baseline)/;
    const REGEX_JUSTIFYSELF = /(start|left|center|right|end)/;
    function getRowData(mainData, horizontal) {
        const rowData = mainData.rowData;
        if (horizontal) {
            const lengthA = mainData.column.length;
            const lengthB = mainData.row.length;
            const result = new Array(lengthA);
            for (let i = 0; i < lengthA; i++) {
                const data = new Array(lengthB);
                for (let j = 0; j < lengthB; j++) {
                    data[j] = rowData[j][i];
                }
                result[i] = data;
            }
            return result;
        }
        else {
            return rowData;
        }
    }
    function getGridSize(node, mainData, horizontal) {
        const data = horizontal ? mainData.column : mainData.row;
        const unit = data.unit;
        const length = unit.length;
        let value = 0;
        if (length) {
            const dimension = horizontal ? 'width' : 'height';
            for (let i = 0; i < length; i++) {
                const unitPX = unit[i];
                if (unitPX.endsWith('px')) {
                    value += parseFloat(unitPX);
                }
                else {
                    let size = 0;
                    captureMap(mainData.rowData[i], item => !!item && item.length > 0, item => size = Math.min(size, ...objectMap$2(item, child => child.bounds[dimension])));
                    value += size;
                }
            }
        }
        else {
            value = maxArray$1(data.unitTotal);
            if (value <= 0) {
                return 0;
            }
        }
        value += data.gap * (data.length - 1);
        if (horizontal) {
            value += node.contentBox ? node.borderLeftWidth + node.borderRightWidth : node.contentBoxWidth;
            return node.actualWidth - value;
        }
        else {
            value += node.contentBox ? node.borderTopWidth + node.borderBottomWidth : node.contentBoxHeight;
            return node.actualHeight - value;
        }
    }
    function setContentSpacing(node, mainData, alignment, horizontal, dimension, MARGIN_START, MARGIN_END) {
        const data = horizontal ? mainData.column : mainData.row;
        if (alignment.startsWith('space')) {
            const sizeTotal = getGridSize(node, mainData, horizontal);
            if (sizeTotal > 0) {
                const rowData = getRowData(mainData, horizontal);
                const itemCount = data.length;
                const adjusted = new Set();
                function getMarginSize(value) {
                    const marginSize = Math.floor(sizeTotal / value);
                    return [marginSize, sizeTotal - (marginSize * value)];
                }
                switch (alignment) {
                    case 'space-around': {
                        const [marginSize, marginExcess] = getMarginSize(itemCount * 2);
                        for (let i = 0; i < itemCount; i++) {
                            for (const item of new Set(flatMultiArray(rowData[i]))) {
                                const marginStart = (i > 0 && i <= marginExcess ? 1 : 0) + marginSize;
                                if (!adjusted.has(item)) {
                                    item.modifyBox(MARGIN_START, marginStart);
                                    item.modifyBox(MARGIN_END, marginSize);
                                    adjusted.add(item);
                                }
                                else {
                                    item.cssPX(dimension, sizeTotal / itemCount);
                                }
                            }
                        }
                        data.normal = false;
                        break;
                    }
                    case 'space-between': {
                        if (itemCount > 1) {
                            const [marginSize, marginExcess] = getMarginSize(itemCount - 1);
                            for (let i = 0; i < itemCount; i++) {
                                for (const item of new Set(flatMultiArray(rowData[i]))) {
                                    const marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                                    if (i < itemCount - 1) {
                                        if (!adjusted.has(item)) {
                                            item.modifyBox(MARGIN_END, marginEnd);
                                            adjusted.add(item);
                                        }
                                        else {
                                            item.cssPX(dimension, marginEnd);
                                        }
                                    }
                                    else if (convertInt(item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan')) > 1) {
                                        item.cssPX(dimension, marginEnd);
                                        if (adjusted.has(item)) {
                                            item.modifyBox(MARGIN_END, -marginEnd);
                                        }
                                    }
                                }
                            }
                        }
                        data.normal = false;
                        break;
                    }
                    case 'space-evenly': {
                        const [marginSize, marginExcess] = getMarginSize(itemCount + 1);
                        for (let i = 0; i < itemCount; i++) {
                            for (const item of new Set(flatMultiArray(rowData[i]))) {
                                const marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                                if (!adjusted.has(item)) {
                                    if (i === 0) {
                                        item.modifyBox(MARGIN_START, marginSize);
                                    }
                                    item.modifyBox(MARGIN_END, marginEnd);
                                    adjusted.add(item);
                                }
                                else {
                                    item.cssPX(dimension, marginEnd);
                                }
                            }
                        }
                        data.normal = false;
                        break;
                    }
                }
            }
        }
        else {
            const sizeTotal = getGridSize(node, mainData, horizontal);
            if (sizeTotal > 0) {
                const padding = horizontal ? 256 /* PADDING_LEFT */ : 32 /* PADDING_TOP */;
                switch (alignment) {
                    case 'center':
                        node.modifyBox(padding, Math.floor(sizeTotal / 2));
                        data.normal = false;
                        break;
                    case 'right':
                        if (!horizontal) {
                            break;
                        }
                    case 'end':
                    case 'flex-end':
                        node.modifyBox(padding, sizeTotal);
                        data.normal = false;
                        break;
                }
            }
        }
    }
    class CssGrid extends squared.base.extensions.CssGrid {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data(CSS_GRID, 'mainData');
            if (mainData) {
                const layout = new $LayoutUI(parent, node, CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */, node.children);
                layout.rowCount = mainData.row.length;
                layout.columnCount = mainData.column.length;
                for (const image of node.cascade(item => item.imageElement)) {
                    const asset = this.resource.getImage(image.src);
                    if (asset) {
                        const bounds = image.bounds;
                        if (!image.hasPX('width', false) && asset.width > bounds.width) {
                            image.css('width', formatPX$2(bounds.width), true);
                            image.android('adjustViewBounds', 'true');
                        }
                        else if (!image.hasPX('height', false) && asset.height > bounds.height) {
                            image.css('height', formatPX$2(bounds.height), true);
                            image.android('adjustViewBounds', 'true');
                        }
                    }
                }
                return {
                    output: this.application.renderNode(layout),
                    complete: true
                };
            }
            return undefined;
        }
        processChild(node, parent) {
            const mainData = parent.data(CSS_GRID, 'mainData');
            const cellData = node.data(CSS_GRID, 'cellData');
            let renderAs;
            let outputAs;
            if (mainData && cellData) {
                function applyLayout(item, horizontal, dimension) {
                    let data;
                    let cellStart;
                    let cellSpan;
                    if (horizontal) {
                        data = mainData.column;
                        cellStart = cellData.columnStart;
                        cellSpan = cellData.columnSpan;
                    }
                    else {
                        data = mainData.row;
                        cellStart = cellData.rowStart;
                        cellSpan = cellData.rowSpan;
                    }
                    const unitMin = data.unitMin;
                    const unitDimension = horizontal ? STRING_ANDROID.HORIZONTAL : STRING_ANDROID.VERTICAL;
                    let unit = data.unit;
                    let size = 0;
                    let minSize = 0;
                    let fitContent = false;
                    let minUnitSize = 0;
                    let sizeWeight = 0;
                    if (unit.length && unit.every(value => value === 'auto')) {
                        if (horizontal) {
                            unit = new Array(unit.length).fill('1fr');
                            data.unit = unit;
                        }
                        else {
                            unit.length = 0;
                        }
                    }
                    for (let i = 0, j = 0; i < cellSpan; i++) {
                        const k = cellStart + i;
                        const min = unitMin[k];
                        if (min !== '') {
                            minUnitSize += parent.parseUnit(min);
                        }
                        let value = unit[k];
                        if (!value) {
                            const auto = data.auto;
                            if (auto[j]) {
                                value = auto[j];
                                if (auto[j + 1]) {
                                    j++;
                                }
                            }
                            else {
                                continue;
                            }
                        }
                        if (value === 'auto' || value === 'max-content') {
                            if (cellSpan < unit.length && (!parent.hasPX(dimension) || unit.some(px => isLength$2(px)) || value === 'max-content')) {
                                size = node.bounds[dimension];
                                minSize = 0;
                                sizeWeight = 0;
                                break;
                            }
                            else if (horizontal) {
                                size = 0;
                                minSize = 0;
                                sizeWeight = 0.01;
                                break;
                            }
                        }
                        else if (value === 'min-content') {
                            if (!item.hasPX(dimension)) {
                                if (horizontal) {
                                    item.setLayoutWidth('wrap_content', false);
                                }
                                else {
                                    item.setLayoutHeight('wrap_content', false);
                                }
                                break;
                            }
                        }
                        else if (value.endsWith('fr')) {
                            if (horizontal || node.hasHeight) {
                                sizeWeight += parseFloat(value);
                                minSize = size;
                            }
                            else {
                                sizeWeight = 0;
                                minSize = node.bounds[dimension];
                            }
                            size = 0;
                        }
                        else if (isPercent$2(value)) {
                            sizeWeight += parseFloat(value) / 100;
                            minSize = size;
                            size = 0;
                        }
                        else {
                            const gap = item.parseUnit(value, unitDimension);
                            if (minSize === 0) {
                                size += gap;
                            }
                            else {
                                minSize += gap;
                            }
                        }
                        if (node.textElement && CHAR$2.UNITZERO.test(min)) {
                            fitContent = true;
                        }
                    }
                    if (cellSpan > 1) {
                        const value = (cellSpan - 1) * data.gap;
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
                        if (data.autoFill && size === 0 && (horizontal ? mainData.row.length : mainData.column.length) === 1) {
                            size = Math.max(node.actualWidth, minUnitSize);
                            sizeWeight = 0;
                        }
                        else {
                            minSize = minUnitSize;
                        }
                    }
                    item.android(horizontal ? 'layout_column' : 'layout_row', cellStart.toString());
                    if (cellSpan > 1) {
                        item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan', cellSpan.toString());
                    }
                    if (minSize > 0 && !item.hasPX(horizontal ? 'minWidth' : 'minHeight')) {
                        item.css(horizontal ? 'minWidth' : 'minHeight', formatPX$2(minSize), true);
                    }
                    if (sizeWeight > 0) {
                        if (!item.hasPX(dimension)) {
                            const weight = truncate$3(sizeWeight, node.localSettings.floatPrecision);
                            if (horizontal) {
                                item.setLayoutWidth('0px');
                                item.android('layout_columnWeight', weight);
                                item.mergeGravity('layout_gravity', 'fill_horizontal');
                            }
                            else {
                                item.setLayoutHeight('0px');
                                item.android('layout_rowWeight', weight);
                                item.mergeGravity('layout_gravity', 'fill_vertical');
                            }
                        }
                    }
                    else if (size > 0) {
                        if (item.contentBox) {
                            size -= horizontal ? item.contentBoxWidth : item.contentBoxHeight;
                        }
                        if (fitContent && !item.hasPX(horizontal ? 'maxWidth' : 'maxHeight')) {
                            item.css(horizontal ? 'maxWidth' : 'maxHeight', formatPX$2(size), true);
                            item.mergeGravity('layout_gravity', horizontal ? 'fill_horizontal' : 'fill_vertical');
                        }
                        else if (!item.hasPX(dimension)) {
                            item.css(dimension, formatPX$2(size), true);
                        }
                    }
                    return [cellStart, cellSpan];
                }
                const { alignSelf, justifySelf } = node.flexbox;
                if (REGEX_ALIGNSELF.test(alignSelf) || REGEX_JUSTIFYSELF.test(justifySelf)) {
                    renderAs = this.application.createNode();
                    renderAs.containerName = node.containerName;
                    renderAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    renderAs.inherit(node, 'base', 'initial');
                    renderAs.resetBox(30 /* MARGIN */ | 480 /* PADDING */);
                    renderAs.exclude(NODE_RESOURCE$1.BOX_STYLE | NODE_RESOURCE$1.ASSET, NODE_PROCEDURE$3.CUSTOMIZATION);
                    parent.appendTry(node, renderAs);
                    renderAs.render(parent);
                    node.transferBox(30 /* MARGIN */, renderAs);
                    applyLayout(renderAs, true, 'width');
                    applyLayout(renderAs, false, 'height');
                    let inlineWidth = false;
                    if (justifySelf.endsWith('start') || justifySelf.endsWith('left') || justifySelf.endsWith('baseline')) {
                        node.mergeGravity('layout_gravity', 'left');
                        inlineWidth = true;
                    }
                    else if (justifySelf.endsWith('end') || justifySelf.endsWith('right')) {
                        node.mergeGravity('layout_gravity', 'right');
                        inlineWidth = true;
                    }
                    else if (justifySelf.endsWith('center')) {
                        node.mergeGravity('layout_gravity', STRING_ANDROID.CENTER_HORIZONTAL);
                        inlineWidth = true;
                    }
                    if (!node.hasWidth) {
                        node.setLayoutWidth(inlineWidth ? 'wrap_content' : 'match_parent', false);
                    }
                    if (alignSelf.endsWith('start') || alignSelf.endsWith('baseline')) {
                        node.mergeGravity('layout_gravity', 'top');
                    }
                    else if (alignSelf.endsWith('end')) {
                        node.mergeGravity('layout_gravity', 'bottom');
                    }
                    else if (alignSelf.endsWith('center')) {
                        node.mergeGravity('layout_gravity', STRING_ANDROID.CENTER_VERTICAL);
                    }
                    else if (!node.hasHeight) {
                        node.setLayoutHeight('match_parent', false);
                    }
                    renderAs.innerWrapped = node;
                    node.outerWrapper = renderAs;
                    node.parent = renderAs;
                    outputAs = this.application.renderNode(new $LayoutUI(parent, renderAs, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, renderAs.children));
                }
                const target = renderAs || node;
                const row = mainData.row;
                applyLayout(target, true, 'width');
                if (!target.hasPX('width')) {
                    target.mergeGravity('layout_gravity', 'fill_horizontal');
                }
                const [rowStart, rowSpan] = applyLayout(target, false, 'height');
                function checkRowSpan() {
                    if (rowSpan === 1 && mainData.rowSpanMultiple[rowStart] === true) {
                        const rowCount = mainData.rowData.length;
                        for (const item of flatMultiArray(mainData.rowData[rowStart])) {
                            if (item !== node) {
                                const data = item.data(CSS_GRID, 'cellData');
                                if (data && (rowStart === 0 || data.rowSpan < rowCount) && data.rowSpan > rowSpan) {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }
                if (mainData.alignContent === 'normal' && !parent.hasPX('height') && (!row.unit[rowStart] || row.unit[rowStart] === 'auto') && node.bounds.height > node.initial.bounds.height && checkRowSpan()) {
                    target.css('minHeight', formatPX$2(node.actualHeight), true);
                }
                else if (!target.hasPX('height') && !(row.length === 1 && mainData.alignContent === 'space-between')) {
                    if (!REGEX_ALIGNSELF.test(mainData.alignItems)) {
                        target.mergeGravity('layout_gravity', 'fill_vertical');
                    }
                    if (mainData.alignContent === 'normal' && parent.hasHeight && mainData.rowSpanMultiple.length === 0) {
                        target.mergeGravity('layout_rowWeight', '1');
                    }
                }
            }
            return {
                parent: renderAs,
                renderAs,
                outputAs
            };
        }
        postBaseLayout(node) {
            const mainData = node.data(CSS_GRID, 'mainData');
            if (mainData) {
                if (node.hasWidth && mainData.justifyContent !== 'normal') {
                    setContentSpacing(node, mainData, mainData.justifyContent, true, 'width', 16 /* MARGIN_LEFT */, 4 /* MARGIN_RIGHT */);
                }
                if (node.hasHeight && mainData.alignContent !== 'normal') {
                    setContentSpacing(node, mainData, mainData.alignContent, false, 'height', 2 /* MARGIN_TOP */, 8 /* MARGIN_BOTTOM */);
                    const rowWeight = mainData.rowWeight;
                    if (rowWeight.length > 1) {
                        const precision = this.controller.localSettings.precision.standardFloat;
                        for (let i = 0; i < mainData.row.length; i++) {
                            if (rowWeight[i] > 0) {
                                const rowData = mainData.rowData[i];
                                const length = rowData.length;
                                for (let j = 0; j < length; j++) {
                                    const item = rowData[j];
                                    if (item) {
                                        for (let col of item) {
                                            if (col.outerWrapper) {
                                                col = col.outerWrapper;
                                            }
                                            col.android('layout_rowWeight', truncate$3(rowWeight[i], precision).toString());
                                            col.setLayoutHeight('0px');
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const column = mainData.column;
                if (column.normal && !column.unit.includes('auto')) {
                    const gap = column.gap * (column.length - 1);
                    if (gap > 0) {
                        if (!node.renderParent.hasAlign(4 /* AUTO_LAYOUT */)) {
                            node.cssPX('minWidth', gap);
                            node.cssPX('width', gap, false, true);
                        }
                        if (!node.hasPX('width') && node.hasPX('maxWidth')) {
                            node.css('width', formatPX$2(node.actualWidth + gap), true);
                        }
                    }
                }
            }
        }
        postOptimize(node) {
            const mainData = node.data(CSS_GRID, 'mainData');
            if (mainData) {
                const controller = this.controller;
                const { children, column } = mainData;
                const unit = column.unit;
                const lastChild = children[children.length - 1];
                if (unit.length && unit.every(value => isPercent$2(value))) {
                    const columnCount = column.length;
                    const percent = unit.reduce((a, b) => a + parseFloat(b), 0) + (column.gap * columnCount * 100) / node.actualWidth;
                    if (percent < 100) {
                        const columnGap = '@dimen/' + Resource.insertStoredAsset('dimens', node.controlId + '_cssgrid_column_gap', formatPX$2(column.gap));
                        const lengthA = mainData.row.length;
                        for (let i = 0; i < lengthA; i++) {
                            controller.addAfterOutsideTemplate(lastChild.id, controller.renderSpace(formatPercent((100 - percent) / 100), 'wrap_content', 0, 0, createViewAttribute(undefined, {
                                [node.localizeString(STRING_ANDROID.MARGIN_LEFT)]: columnGap,
                                layout_row: i.toString(),
                                layout_column: columnCount.toString()
                            })), false);
                        }
                        node.android('columnCount', (columnCount + 1).toString());
                    }
                }
                const emptyRows = mainData.emptyRows;
                const length = emptyRows.length;
                for (let i = 0; i < length; i++) {
                    const row = emptyRows[i];
                    if (row) {
                        const rowGap = '@dimen/' + Resource.insertStoredAsset('dimens', node.controlId + '_cssgrid_row_gap', formatPX$2(mainData.row.gap));
                        const lengthA = row.length;
                        for (let j = 0; j < lengthA; j++) {
                            if (row[j] === 1) {
                                controller.addAfterOutsideTemplate(lastChild.id, controller.renderSpace('wrap_content', rowGap, 0, 0, createViewAttribute(undefined, { layout_row: i.toString(), layout_column: j.toString() })), false);
                                break;
                            }
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
        init(element) {
            if (this.included(element)) {
                this.application.rootElements.add(element);
            }
            return false;
        }
    }

    var $LayoutUI$1 = squared.base.LayoutUI;
    const $lib$6 = squared.lib;
    const { truncate: truncate$4 } = $lib$6.math;
    const { capitalize: capitalize$1, sameArray, withinRange: withinRange$1 } = $lib$6.util;
    const $base$1 = squared.base;
    const { NodeUI: NodeUI$1 } = $base$1;
    const $base_lib$1 = $base$1.lib;
    const { BOX_STANDARD: BOX_STANDARD$3, NODE_ALIGNMENT: NODE_ALIGNMENT$3 } = $base_lib$1.enumeration;
    const { FLEXBOX } = $base_lib$1.constant.EXT_NAME;
    const MAP_leftTop = ['left', 'top'];
    const MAP_rightBottom = ['right', 'bottom'];
    const MAP_rightLeftBottomTop = ['rightLeft', 'bottomTop'];
    const MAP_leftRightTopBottom = ['leftRight', 'topBottom'];
    const MAP_widthHeight = ['Width', 'Height'];
    const MAP_horizontalVertical = [STRING_ANDROID.HORIZONTAL, STRING_ANDROID.VERTICAL];
    function adjustGrowRatio(parent, items, attr) {
        var _a;
        const horizontal = attr === 'width';
        const hasDimension = 'has' + capitalize$1(attr);
        const result = items.reduce((a, b) => a + b.flexbox.grow, 0);
        const setPercentage = (item) => item.flexbox.basis = (item.bounds[attr] / parent.box[attr] * 100) + '%';
        let percent = parent[hasDimension] || parent.blockStatic && withinRange$1(parent.parseUnit(parent.css(horizontal ? 'maxWidth' : 'maxHeight')), parent.box.width);
        let growShrinkType = 0;
        if (percent) {
            for (const item of items) {
                const autoMargin = ((_a = item.innerWrapped) === null || _a === void 0 ? void 0 : _a.autoMargin) || item.autoMargin;
                if (horizontal) {
                    if (autoMargin.horizontal) {
                        percent = false;
                        break;
                    }
                }
                else {
                    if (autoMargin.vertical) {
                        percent = false;
                        break;
                    }
                }
            }
        }
        if (items.length > 1 && (horizontal || percent)) {
            const groupBasis = [];
            const percentage = [];
            let maxBasis;
            let maxBasisUnit = 0;
            let maxDimension = 0;
            let maxRatio = NaN;
            for (const item of items) {
                const dimension = item.bounds[attr];
                const flexbox = item.flexbox;
                let growPercent = false;
                if (flexbox.grow > 0 || flexbox.shrink !== 1) {
                    const basis = flexbox.basis === 'auto' ? item.parseUnit(item.css(attr), attr) : item.parseUnit(flexbox.basis, attr);
                    if (basis > 0) {
                        const { shrink, grow } = flexbox;
                        let largest = false;
                        if (dimension < basis) {
                            if (isNaN(maxRatio) || shrink < maxRatio) {
                                maxRatio = shrink;
                                largest = true;
                                growShrinkType = 1;
                            }
                        }
                        else {
                            if (isNaN(maxRatio) || grow > maxRatio) {
                                maxRatio = grow;
                                largest = true;
                                growShrinkType = 2;
                            }
                        }
                        if (largest) {
                            maxBasis = item;
                            maxBasisUnit = basis;
                            maxDimension = dimension;
                        }
                        groupBasis.push({
                            item,
                            basis,
                            dimension,
                            shrink,
                            grow
                        });
                        continue;
                    }
                    else if (flexbox.grow > 0 && dimension > item[attr]) {
                        growPercent = true;
                    }
                }
                if (flexbox.alignSelf === 'auto' && (percent && !item[hasDimension] || growPercent)) {
                    percentage.push(item);
                }
            }
            if (growShrinkType !== 0) {
                if (groupBasis.length > 1) {
                    for (const data of groupBasis) {
                        const item = data.item;
                        if (item === maxBasis || data.basis === maxBasisUnit && (growShrinkType === 1 && maxRatio === data.shrink || growShrinkType === 2 && maxRatio === data.grow)) {
                            item.flexbox.grow = 1;
                        }
                        else {
                            item.flexbox.grow = ((data.dimension / data.basis) / (maxDimension / maxBasisUnit)) * data.basis / maxBasisUnit;
                        }
                    }
                }
                for (const item of percentage) {
                    setPercentage(item);
                }
            }
        }
        if (horizontal && growShrinkType === 0) {
            for (const item of items) {
                if (item.cascadeSome(child => child.multiline && child.ascend(above => above[hasDimension], parent).length === 0)) {
                    setPercentage(item);
                }
            }
        }
        return result;
    }
    const getAutoMargin = (node) => { var _a; return ((_a = node.innerWrapped) === null || _a === void 0 ? void 0 : _a.autoMargin) || node.autoMargin; };
    class Flexbox extends squared.base.extensions.Flexbox {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data(FLEXBOX, 'mainData');
            if (mainData.directionRow && mainData.rowCount === 1 || mainData.directionColumn && mainData.columnCount === 1) {
                node.containerType = CONTAINER_NODE.CONSTRAINT;
                node.addAlign(4 /* AUTO_LAYOUT */);
                mainData.wrap = false;
                return { include: true };
            }
            else {
                const layout = new $LayoutUI$1(parent, node, 0, 4 /* AUTO_LAYOUT */);
                layout.itemCount = node.length;
                layout.rowCount = mainData.rowCount;
                layout.columnCount = mainData.columnCount;
                if (mainData.directionRow && node.hasHeight || mainData.directionColumn && node.hasWidth || node.some(item => !item.pageFlow)) {
                    layout.containerType = CONTAINER_NODE.CONSTRAINT;
                }
                else {
                    layout.setContainerType(CONTAINER_NODE.LINEAR, mainData.directionColumn ? 8 /* HORIZONTAL */ : 16 /* VERTICAL */);
                }
                return {
                    output: this.application.renderNode(layout),
                    complete: true
                };
            }
        }
        processChild(node, parent) {
            if (node.hasAlign(128 /* SEGMENTED */)) {
                return {
                    output: this.application.renderNode(new $LayoutUI$1(parent, node, CONTAINER_NODE.CONSTRAINT, 4 /* AUTO_LAYOUT */, node.children)),
                    complete: true
                };
            }
            else {
                const autoMargin = node.autoMargin;
                if (autoMargin.horizontal || autoMargin.vertical && node.hasHeight) {
                    const mainData = parent.data(FLEXBOX, 'mainData');
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
                            }, true);
                            container.saveAsInitial(true);
                            container.flexbox = Object.assign({}, node.flexbox);
                            mainData.children[index] = container;
                            if (autoMargin.horizontal && !node.hasWidth) {
                                node.setLayoutWidth('wrap_content');
                            }
                            return {
                                parent: container,
                                renderAs: container,
                                outputAs: this.application.renderNode(new $LayoutUI$1(parent, container, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, container.children))
                            };
                        }
                    }
                }
            }
            return undefined;
        }
        postBaseLayout(node) {
            const mainData = node.data(FLEXBOX, 'mainData');
            if (mainData) {
                const { alignContent, children, directionColumn, directionReverse, directionRow, justifyContent, wrap, wrapReverse } = mainData;
                const chainHorizontal = [];
                const chainVertical = [];
                const segmented = [];
                if (wrap) {
                    let previous;
                    node.each((item) => {
                        if (item.hasAlign(128 /* SEGMENTED */)) {
                            const pageFlow = item.renderFilter(child => child.pageFlow);
                            if (pageFlow.length) {
                                if (directionRow) {
                                    item.setLayoutWidth('match_parent');
                                    chainHorizontal.push(pageFlow);
                                }
                                else {
                                    item.setLayoutHeight('match_parent');
                                    if (previous) {
                                        const length = previous.length;
                                        let largest = previous[0];
                                        for (let j = 1; j < length; j++) {
                                            if (previous[j].linear.right > largest.linear.right) {
                                                largest = previous[j];
                                            }
                                        }
                                        if (wrapReverse) {
                                            const offset = item.linear.left - largest.actualRect('right');
                                            if (offset > 0) {
                                                item.modifyBox(16 /* MARGIN_LEFT */, offset);
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
                    if (node.layoutLinear) {
                        if (wrapReverse && directionColumn) {
                            node.mergeGravity('gravity', 'right');
                        }
                    }
                    else if (segmented.length) {
                        if (directionRow) {
                            chainVertical.push(segmented);
                        }
                        else {
                            chainHorizontal.push(segmented);
                        }
                    }
                }
                else {
                    if (directionRow) {
                        if (directionReverse) {
                            children.reverse();
                        }
                        chainHorizontal[0] = children;
                    }
                    else {
                        if (directionReverse) {
                            children.reverse();
                        }
                        chainVertical[0] = children;
                    }
                }
                [chainHorizontal, chainVertical].forEach((partition, index) => {
                    var _a;
                    const horizontal = index === 0;
                    const inverse = horizontal ? 1 : 0;
                    const orientation = MAP_horizontalVertical[index];
                    const orientationInverse = MAP_horizontalVertical[inverse];
                    const WH = MAP_widthHeight[index];
                    const HW = MAP_widthHeight[inverse];
                    const LT = MAP_leftTop[index];
                    const TL = MAP_leftTop[inverse];
                    const RB = MAP_rightBottom[index];
                    const BR = MAP_rightBottom[inverse];
                    const LRTB = MAP_leftRightTopBottom[index];
                    const RLBT = MAP_rightLeftBottomTop[index];
                    const WHL = WH.toLowerCase();
                    const HWL = HW.toLowerCase();
                    const dimension = node['has' + HW];
                    const dimensionInverse = node['has' + WH];
                    const orientationWeight = `layout_constraint${capitalize$1(orientation)}_weight`;
                    function setLayoutWeight(chain, value) {
                        if (chain[WHL] === 0) {
                            chain.app(orientationWeight, truncate$4(value, chain.localSettings.floatPrecision));
                            if (horizontal) {
                                chain.setLayoutWidth('0px');
                            }
                            else {
                                chain.setLayoutHeight('0px');
                            }
                        }
                    }
                    const length = partition.length;
                    for (let i = 0; i < length; i++) {
                        const seg = partition[i];
                        const lengthA = seg.length;
                        const segStart = seg[0];
                        const segEnd = seg[lengthA - 1];
                        const opposing = seg === segmented;
                        const justified = !opposing && seg.every(item => item.flexbox.grow === 0);
                        const spreadInside = justified && (justifyContent === 'space-between' || justifyContent === 'space-around' && lengthA > 1);
                        const layoutWeight = [];
                        let maxSize = 0;
                        let growAvailable = 0;
                        let parentEnd = true;
                        let baseline = null;
                        let growAll;
                        if (opposing) {
                            growAll = false;
                            if (dimensionInverse) {
                                let chainStyle = 'spread';
                                let bias = 0;
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
                                segStart.anchorStyle(orientation, chainStyle, bias);
                            }
                            else {
                                segStart.anchorStyle(orientation);
                            }
                        }
                        else {
                            growAll = horizontal || dimensionInverse;
                            growAvailable = 1 - adjustGrowRatio(node, seg, WHL);
                            if (lengthA > 1) {
                                let sizeCount = 0;
                                for (const chain of seg) {
                                    const bounds = chain.initial.bounds;
                                    if (bounds) {
                                        const value = bounds[HWL];
                                        if (sizeCount === 0) {
                                            maxSize = value;
                                            sizeCount++;
                                        }
                                        else if (value === maxSize) {
                                            sizeCount++;
                                        }
                                        else if (value > maxSize) {
                                            maxSize = value;
                                            sizeCount = 1;
                                        }
                                    }
                                }
                                if (sizeCount === lengthA) {
                                    maxSize = NaN;
                                }
                            }
                        }
                        for (let j = 0; j < lengthA; j++) {
                            const chain = seg[j];
                            const previous = seg[j - 1];
                            const next = seg[j + 1];
                            if (next) {
                                chain.anchor(RLBT, (next.outerWrapper || next).documentId);
                            }
                            if (previous) {
                                chain.anchor(LRTB, (previous.outerWrapper || previous).documentId);
                            }
                            if (opposing) {
                                if (parentEnd && lengthA > 1 && dimensionInverse) {
                                    setLayoutWeight(chain, 1);
                                }
                                chain.anchor(TL, 'parent');
                            }
                            else {
                                const autoMargin = getAutoMargin(chain);
                                const innerWrapped = chain.innerWrapped;
                                if (horizontal) {
                                    if (autoMargin.horizontal) {
                                        if (innerWrapped) {
                                            const gravity = autoMargin.leftRight ? STRING_ANDROID.CENTER_HORIZONTAL : chain.localizeString(autoMargin.left ? 'right' : 'left');
                                            innerWrapped.mergeGravity('layout_gravity', gravity);
                                            if (growAvailable > 0) {
                                                chain.flexbox.basis = '0%';
                                                layoutWeight.push(chain);
                                            }
                                        }
                                        else if (!autoMargin.leftRight) {
                                            if (autoMargin.left) {
                                                if (previous) {
                                                    chain.anchorDelete(LRTB);
                                                }
                                            }
                                            else {
                                                if (next) {
                                                    chain.anchorDelete(RLBT);
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                    if (autoMargin.vertical) {
                                        if (innerWrapped) {
                                            const gravity = autoMargin.topBottom ? STRING_ANDROID.CENTER_VERTICAL : chain.localizeString(autoMargin.top ? 'bottom' : 'top');
                                            innerWrapped.mergeGravity('layout_gravity', gravity);
                                            if (growAvailable > 0) {
                                                chain.flexbox.basis = '0%';
                                                layoutWeight.push(chain);
                                            }
                                        }
                                        else if (!autoMargin.topBottom) {
                                            if (autoMargin.top) {
                                                if (previous) {
                                                    chain.anchorDelete(LRTB);
                                                }
                                            }
                                            else {
                                                if (next) {
                                                    chain.anchorDelete(RLBT);
                                                }
                                            }
                                        }
                                    }
                                }
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
                                            if (baseline === null) {
                                                baseline = NodeUI$1.baseline(seg);
                                            }
                                            if (baseline && chain !== baseline) {
                                                chain.anchor('baseline', baseline.documentId);
                                            }
                                        }
                                        break;
                                    case 'center':
                                        chain.anchorParent(orientationInverse, 'packed', 0.5);
                                        if (chain.textElement) {
                                            chain.mergeGravity('gravity', 'center');
                                        }
                                        break;
                                    default:
                                        const childContent = chain.layoutFrame && chain.innerWrapped;
                                        switch (alignContent) {
                                            case 'center':
                                                if (length % 2 === 1 && i === Math.floor(length / 2)) {
                                                    chain.anchorParent(orientationInverse);
                                                }
                                                else if (i < length / 2) {
                                                    chain.anchor(BR, 'parent');
                                                }
                                                else if (i >= length / 2) {
                                                    chain.anchor(TL, 'parent');
                                                }
                                                break;
                                            case 'space-evenly':
                                            case 'space-around':
                                                if (childContent) {
                                                    childContent.mergeGravity('layout_gravity', horizontal ? STRING_ANDROID.CENTER_VERTICAL : STRING_ANDROID.CENTER_HORIZONTAL);
                                                }
                                                else {
                                                    chain.anchorParent(orientationInverse);
                                                }
                                                break;
                                            case 'space-between':
                                                if (spreadInside && lengthA === 2) {
                                                    chain.anchorDelete(j === 0 ? RLBT : LRTB);
                                                }
                                                if (i === 0) {
                                                    if (childContent) {
                                                        childContent.mergeGravity('layout_gravity', wrapReverse ? BR : TL);
                                                    }
                                                    else {
                                                        chain.anchor(wrapReverse ? BR : TL, 'parent');
                                                    }
                                                }
                                                else if (length > 2 && i < length - 1) {
                                                    if (childContent) {
                                                        childContent.mergeGravity('layout_gravity', horizontal ? STRING_ANDROID.CENTER_VERTICAL : STRING_ANDROID.CENTER_HORIZONTAL);
                                                    }
                                                    else {
                                                        chain.anchorParent(orientationInverse);
                                                    }
                                                }
                                                else {
                                                    if (childContent) {
                                                        childContent.mergeGravity('layout_gravity', wrapReverse ? TL : BR);
                                                    }
                                                    else {
                                                        chain.anchor(wrapReverse ? TL : BR, 'parent');
                                                    }
                                                }
                                                break;
                                            default: {
                                                chain.anchorParent(orientationInverse);
                                                if (chain.innerWrapped === undefined || !chain.innerWrapped.autoMargin[orientationInverse]) {
                                                    chain.anchorStyle(orientationInverse, 'packed', wrapReverse ? 1 : 0);
                                                }
                                                if (chain[HWL] === 0) {
                                                    function setLayoutWeightOpposing(item, value) {
                                                        if (!horizontal) {
                                                            item.setLayoutWidth(value);
                                                        }
                                                        else {
                                                            item.setLayoutHeight(value);
                                                        }
                                                    }
                                                    if (!horizontal && chain.blockStatic) {
                                                        setLayoutWeightOpposing(chain, 'match_parent');
                                                    }
                                                    else if (isNaN(maxSize)) {
                                                        if (!horizontal && !wrap && chain.length || dimension && alignContent === 'normal') {
                                                            setLayoutWeightOpposing(chain, dimension ? '0px' : 'match_parent');
                                                        }
                                                        else {
                                                            setLayoutWeightOpposing(chain, 'wrap_content');
                                                        }
                                                    }
                                                    else if (lengthA === 1) {
                                                        if (!horizontal) {
                                                            setLayoutWeightOpposing(chain, dimension ? '0px' : 'match_parent');
                                                        }
                                                        else {
                                                            setLayoutWeightOpposing(chain, 'wrap_content');
                                                        }
                                                    }
                                                    else if ((chain.naturalElement ? chain.initial.bounds[HWL] : Number.POSITIVE_INFINITY) < maxSize) {
                                                        setLayoutWeightOpposing(chain, chain.flexElement && chain.css('flexDirection').startsWith(horizontal ? 'row' : 'column') ? 'match_parent' : '0px');
                                                        if (((_a = innerWrapped) === null || _a === void 0 ? void 0 : _a.autoMargin[orientation]) === false) {
                                                            setLayoutWeightOpposing(innerWrapped, 'match_parent');
                                                        }
                                                    }
                                                    else {
                                                        chain.lockAttr('android', 'layout_' + HWL);
                                                        setLayoutWeightOpposing(chain, 'wrap_content');
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                        break;
                                }
                                Controller.setFlexDimension(chain, WHL);
                                if (!(innerWrapped || chain).has('flexGrow')) {
                                    growAll = false;
                                }
                            }
                            chain.anchored = true;
                            chain.positioned = true;
                        }
                        if (growAll) {
                            for (const item of seg) {
                                setLayoutWeight(item, (item.innerWrapped || item).flexbox.grow);
                            }
                        }
                        else if (growAvailable > 0) {
                            for (const item of layoutWeight) {
                                const autoMargin = getAutoMargin(item);
                                let ratio = 1;
                                if (horizontal) {
                                    if (autoMargin.leftRight) {
                                        ratio = 2;
                                    }
                                }
                                else if (autoMargin.topBottom) {
                                    ratio = 2;
                                }
                                setLayoutWeight(item, Math.max(item.flexbox.grow, (growAvailable * ratio) / layoutWeight.length));
                            }
                        }
                        segStart.anchor(LT, 'parent');
                        segEnd.anchor(RB, 'parent');
                        if (!opposing && (horizontal || directionColumn)) {
                            let centered = false;
                            if (justified) {
                                switch (justifyContent) {
                                    case 'normal':
                                        if (directionColumn) {
                                            segStart.anchorStyle(orientation, 'packed', directionReverse ? 1 : 0);
                                        }
                                        break;
                                    case 'left':
                                        if (!horizontal) {
                                            break;
                                        }
                                    case 'start':
                                    case 'flex-start':
                                        segStart.anchorStyle(orientation, 'packed', directionReverse ? 1 : 0);
                                        break;
                                    case 'center':
                                        if (lengthA > 1) {
                                            segStart.anchorStyle(orientation, 'packed', 0.5);
                                        }
                                        centered = true;
                                        break;
                                    case 'right':
                                        if (!horizontal) {
                                            break;
                                        }
                                    case 'end':
                                    case 'flex-end':
                                        segStart.anchorStyle(orientation, 'packed', 1);
                                        break;
                                    case 'space-between':
                                        if (lengthA === 1) {
                                            segEnd.anchorDelete(RB);
                                        }
                                        break;
                                    case 'space-evenly':
                                        if (lengthA > 1) {
                                            segStart.anchorStyle(orientation, 'spread');
                                            if (!alignContent.startsWith('space')) {
                                                for (const item of seg) {
                                                    setLayoutWeight(item, item.flexbox.grow || 1);
                                                }
                                            }
                                        }
                                        else {
                                            centered = true;
                                        }
                                        break;
                                    case 'space-around':
                                        if (lengthA > 1) {
                                            const controller = this.controller;
                                            segStart.constraint[orientation] = false;
                                            segEnd.constraint[orientation] = false;
                                            controller.addGuideline(segStart, node, orientation, true, false);
                                            controller.addGuideline(segEnd, node, orientation, true, true);
                                        }
                                        else {
                                            centered = true;
                                        }
                                        break;
                                }
                            }
                            if (spreadInside || !wrap && partition[i].some(item => item.app(orientationWeight) !== '') && !sameArray(partition[i], item => item.app(orientationWeight))) {
                                segStart.anchorStyle(orientation, 'spread_inside', 0, false);
                            }
                            else if (!centered) {
                                segStart.anchorStyle(orientation, 'packed', directionReverse ? 1 : 0, false);
                            }
                        }
                    }
                });
            }
        }
    }

    var $LayoutUI$2 = squared.base.LayoutUI;
    const $lib$7 = squared.lib;
    const { formatPX: formatPX$3 } = $lib$7.css;
    const { captureMap: captureMap$1, withinRange: withinRange$2 } = $lib$7.util;
    const $base_lib$2 = squared.base.lib;
    const { BOX_STANDARD: BOX_STANDARD$4, NODE_ALIGNMENT: NODE_ALIGNMENT$4 } = $base_lib$2.enumeration;
    const { GRID } = $base_lib$2.constant.EXT_NAME;
    function transferData(parent, siblings) {
        const data = squared.base.extensions.Grid.createDataCellAttribute();
        for (const item of siblings) {
            const source = item.data(GRID, 'cellData');
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
                item.data(GRID, 'cellData', null);
            }
        }
        parent.data(GRID, 'cellData', data);
    }
    class Grid extends squared.base.extensions.Grid {
        processNode(node, parent) {
            super.processNode(node, parent);
            const columnCount = node.data(GRID, 'columnCount');
            if (columnCount) {
                const layout = new $LayoutUI$2(parent, node, CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */, node.children);
                layout.columnCount = columnCount;
                return {
                    output: this.application.renderNode(layout),
                    complete: true
                };
            }
            return undefined;
        }
        processChild(node, parent) {
            var _a;
            const cellData = node.data(GRID, 'cellData');
            if (cellData) {
                const siblings = (_a = cellData.siblings) === null || _a === void 0 ? void 0 : _a.slice(0);
                let layout;
                if (siblings) {
                    const controller = this.controller;
                    siblings.unshift(node);
                    layout = controller.processLayoutHorizontal(new $LayoutUI$2(parent, controller.createNodeGroup(node, siblings, parent, true), 0, cellData.block ? 64 /* BLOCK */ : 0, siblings));
                    node = layout.node;
                    if (cellData.block) {
                        node.css('display', 'block');
                    }
                    else {
                        for (const item of siblings) {
                            if (item.percentWidth) {
                                item.css('width', formatPX$3(item.bounds.width), true);
                            }
                        }
                    }
                    transferData(node, siblings);
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
                        complete: true
                    };
                }
            }
            return undefined;
        }
        postConstraints(node) {
            if (node.css('borderCollapse') !== 'collapse') {
                const columnCount = node.data(GRID, 'columnCount');
                if (columnCount) {
                    let paddingTop = 0;
                    let paddingRight = 0;
                    let paddingBottom = 0;
                    let paddingLeft = 0;
                    node.renderEach(item => {
                        const cellData = item.data(GRID, 'cellData');
                        if (cellData) {
                            const parent = item.actualParent;
                            if (!parent.visible) {
                                const marginTop = parent.getBox(2 /* MARGIN_TOP */)[0] !== 1 ? parent.marginTop : 0;
                                const marginBottom = parent.getBox(8 /* MARGIN_BOTTOM */)[0] !== 1 ? parent.marginBottom : 0;
                                if (cellData.cellStart) {
                                    paddingTop = marginTop + parent.paddingTop;
                                }
                                if (cellData.rowStart) {
                                    paddingLeft = Math.max(parent.marginLeft + parent.paddingLeft, paddingLeft);
                                }
                                if (cellData.rowEnd) {
                                    const heightBottom = marginBottom + parent.paddingBottom + (cellData.cellEnd ? 0 : marginTop + parent.paddingTop);
                                    if (heightBottom > 0) {
                                        if (cellData.cellEnd) {
                                            paddingBottom = heightBottom;
                                        }
                                        else {
                                            const controller = this.controller;
                                            controller.addAfterOutsideTemplate(item.id, controller.renderSpace('match_parent', '@dimen/' + Resource.insertStoredAsset('dimens', node.controlId + '_grid_space', formatPX$3(heightBottom)), columnCount), false);
                                        }
                                    }
                                    paddingRight = Math.max(parent.marginRight + parent.paddingRight, paddingRight);
                                }
                            }
                        }
                    });
                    node.modifyBox(32 /* PADDING_TOP */, paddingTop);
                    node.modifyBox(64 /* PADDING_RIGHT */, paddingRight);
                    node.modifyBox(128 /* PADDING_BOTTOM */, paddingBottom);
                    node.modifyBox(256 /* PADDING_LEFT */, paddingLeft);
                }
            }
            if (!node.hasWidth) {
                let maxRight = Number.NEGATIVE_INFINITY;
                captureMap$1(node.renderChildren, item => item.inlineFlow || !item.blockStatic, item => maxRight = Math.max(maxRight, item.linear.right));
                if (withinRange$2(node.box.right, maxRight)) {
                    node.setLayoutWidth('wrap_content');
                }
            }
        }
    }

    var $LayoutUI$3 = squared.base.LayoutUI;
    const $lib$8 = squared.lib;
    const { formatPX: formatPX$4, getBackgroundPosition } = $lib$8.css;
    const { convertInt: convertInt$1 } = $lib$8.util;
    const $base$2 = squared.base;
    const { NodeUI: NodeUI$2 } = $base$2;
    const $base_lib$3 = $base$2.lib;
    const { BOX_STANDARD: BOX_STANDARD$5, NODE_ALIGNMENT: NODE_ALIGNMENT$5, NODE_TEMPLATE: NODE_TEMPLATE$1 } = $base_lib$3.enumeration;
    const { LIST } = $base_lib$3.constant.EXT_NAME;
    const MINWIDTH_INSIDE = 24;
    const PADDINGRIGHT_DFN = 8;
    class List extends squared.base.extensions.List {
        processNode(node, parent) {
            const layout = new $LayoutUI$3(parent, node, 0, 0, node.children);
            if (!layout.unknownAligned || layout.singleRowAligned) {
                super.processNode(node, parent);
                if (layout.linearY) {
                    layout.rowCount = node.length;
                    layout.columnCount = node.some(item => item.css('listStylePosition') === 'inside') ? 3 : 2;
                    layout.setContainerType(CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */);
                }
                else if (layout.linearX || layout.singleRowAligned) {
                    layout.rowCount = 1;
                    layout.columnCount = layout.length;
                    layout.setContainerType(CONTAINER_NODE.LINEAR, 8 /* HORIZONTAL */);
                }
                if (layout.containerType !== 0) {
                    return {
                        output: this.application.renderNode(layout),
                        complete: true
                    };
                }
            }
            return undefined;
        }
        processChild(node, parent) {
            const mainData = node.data(LIST, 'mainData');
            if (mainData) {
                const { application, controller } = this;
                const firstChild = parent.firstStaticChild === node;
                const ordinalValue = mainData.ordinal || '';
                let minWidth = node.marginLeft;
                let columnCount = 0;
                let adjustPadding = false;
                let resetPadding = NaN;
                let register = false;
                node.modifyBox(16 /* MARGIN_LEFT */);
                if (parent.is(CONTAINER_NODE.GRID)) {
                    columnCount = convertInt$1(parent.android('columnCount'));
                    adjustPadding = true;
                }
                else if (firstChild) {
                    adjustPadding = true;
                }
                if (adjustPadding) {
                    if (parent.paddingLeft > 0) {
                        minWidth += parent.paddingLeft;
                    }
                    else {
                        minWidth += parent.marginLeft;
                    }
                }
                const container = node.length === 0 ? controller.createNodeGroup(node, [node], parent) : node;
                let ordinal;
                if (ordinalValue === '') {
                    ordinal = node.find((item) => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft);
                }
                if (ordinal) {
                    const layoutOrdinal = new $LayoutUI$3(parent, ordinal);
                    if (ordinal.inlineText || ordinal.length === 0) {
                        layoutOrdinal.containerType = CONTAINER_NODE.TEXT;
                    }
                    else {
                        if (layoutOrdinal.singleRowAligned) {
                            layoutOrdinal.setContainerType(CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */);
                        }
                        else {
                            layoutOrdinal.setContainerType(CONTAINER_NODE.CONSTRAINT, 2 /* UNKNOWN */);
                        }
                        layoutOrdinal.retain(ordinal.children);
                    }
                    ordinal.parent = parent;
                    ordinal.render(parent);
                    if (columnCount === 3) {
                        node.android('layout_columnSpan', '2');
                    }
                    minWidth += ordinal.marginLeft;
                    if (minWidth > 0 && !ordinal.hasWidth) {
                        ordinal.android('minWidth', formatPX$4(minWidth));
                    }
                    ordinal.modifyBox(16 /* MARGIN_LEFT */);
                    application.addLayoutTemplate(parent, ordinal, application.renderNode(layoutOrdinal));
                }
                else {
                    const inside = node.css('listStylePosition') === 'inside';
                    let gravity = 'right';
                    let paddingRight = 0;
                    let marginLeft = 0;
                    let top = 0;
                    let left = 0;
                    let image;
                    if (mainData.imageSrc !== '') {
                        const resource = this.resource;
                        if (mainData.imagePosition) {
                            ({ top, left } = getBackgroundPosition(mainData.imagePosition, node.actualDimension, node.fontSize, resource.getImage(mainData.imageSrc)));
                            gravity = 'left';
                            if (node.marginLeft < 0) {
                                resetPadding = node.marginLeft;
                                if (parent.paddingLeft > 0) {
                                    resetPadding += parent.paddingLeft;
                                }
                                else {
                                    resetPadding += parent.marginLeft;
                                }
                            }
                            else {
                                adjustPadding = false;
                                marginLeft = node.marginLeft;
                            }
                            minWidth = 0;
                        }
                        image = resource.addImageSrc(mainData.imageSrc);
                    }
                    if (gravity === 'left') {
                        minWidth += node.paddingLeft - left;
                        node.modifyBox(256 /* PADDING_LEFT */);
                    }
                    else {
                        const length = ordinalValue.length || 1;
                        paddingRight = Math.max(minWidth / (image ? 6 : length * 4), 4);
                    }
                    const options = createViewAttribute();
                    ordinal = application.createNode();
                    ordinal.containerName = node.containerName + '_ORDINAL';
                    if (inside) {
                        controller.addBeforeOutsideTemplate(ordinal.id, controller.renderNodeStatic(CONTAINER_ANDROID.SPACE, createViewAttribute(undefined, { minWidth: '@dimen/' + Resource.insertStoredAsset('dimens', node.tagName.toLowerCase() + '_space_indent', formatPX$4(minWidth)) })), false);
                        minWidth = MINWIDTH_INSIDE;
                    }
                    else if (columnCount === 3) {
                        container.android('layout_columnSpan', '2');
                    }
                    if (node.tagName === 'DT' && !image) {
                        container.android('layout_columnSpan', columnCount.toString());
                    }
                    else {
                        if (image) {
                            ordinal.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                            Object.assign(options.android, {
                                src: '@drawable/' + image,
                                scaleType: !inside && gravity === 'right' ? 'fitEnd' : 'fitStart',
                                baselineAlignBottom: adjustPadding ? 'true' : ''
                            });
                        }
                        else if (ordinalValue) {
                            ordinal.textContent = ordinalValue;
                            ordinal.inlineText = true;
                            ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                            if (node.tagName === 'DFN') {
                                minWidth += PADDINGRIGHT_DFN;
                                ordinal.modifyBox(64 /* PADDING_RIGHT */, PADDINGRIGHT_DFN);
                            }
                        }
                        else {
                            ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                            ordinal.renderExclude = false;
                            node.modifyBox(256 /* PADDING_LEFT */);
                        }
                        ordinal.depth = node.depth;
                        ordinal.inherit(node, 'textStyle');
                        if (ordinalValue && !ordinalValue.endsWith('.')) {
                            ordinal.fontSize *= 0.75;
                        }
                        ordinal.cssApply({
                            minWidth: minWidth > 0 ? formatPX$4(minWidth) : '',
                            marginTop: node.marginTop !== 0 ? formatPX$4(node.marginTop) : '',
                            marginLeft: marginLeft > 0 ? formatPX$4(marginLeft) : '',
                            paddingTop: node.paddingTop > 0 && node.getBox(32 /* PADDING_TOP */)[0] === 0 ? formatPX$4(node.paddingTop) : '',
                            paddingRight: paddingRight > 0 && gravity === 'right' ? formatPX$4(paddingRight) : '',
                            paddingLeft: paddingRight > 0 && gravity === 'left' && (!image || mainData.imagePosition) ? formatPX$4(paddingRight) : '',
                            lineHeight: node.lineHeight > 0 ? formatPX$4(node.lineHeight) : ''
                        });
                        ordinal.apply(options);
                        if (ordinal.cssTry('display', 'block')) {
                            ordinal.setBounds();
                            ordinal.cssFinally('display');
                        }
                        ordinal.saveAsInitial();
                        if (!inside) {
                            ordinal.mergeGravity('gravity', node.localizeString(gravity));
                        }
                        if (top !== 0) {
                            ordinal.modifyBox(2 /* MARGIN_TOP */, top);
                        }
                        if (left !== 0) {
                            ordinal.modifyBox(16 /* MARGIN_LEFT */, left);
                        }
                        ordinal.render(parent);
                        application.addLayoutTemplate(parent, ordinal, {
                            type: 1 /* XML */,
                            node: ordinal,
                            controlName: ordinal.controlName
                        });
                        register = true;
                    }
                }
                ordinal.positioned = true;
                if (adjustPadding) {
                    if (isNaN(resetPadding) || resetPadding <= 0) {
                        parent.modifyBox(parent.paddingLeft > 0 ? 256 /* PADDING_LEFT */ : 16 /* MARGIN_LEFT */);
                    }
                    if (resetPadding < 0) {
                        parent.modifyBox(16 /* MARGIN_LEFT */, resetPadding);
                    }
                }
                if (columnCount > 0) {
                    container.setLayoutWidth('0px');
                    container.android('layout_columnWeight', '1');
                    if (container !== node) {
                        if (node.baseline) {
                            container.android('baselineAlignedChildIndex', '0');
                        }
                    }
                    else if (node.filter((item) => item.visible).length > 1 && NodeUI$2.linearData(node.children).linearY) {
                        node.addAlign(1024 /* TOP */);
                    }
                }
                if (node !== container) {
                    if (node.marginTop !== 0) {
                        container.modifyBox(2 /* MARGIN_TOP */, node.marginTop);
                        node.modifyBox(2 /* MARGIN_TOP */);
                        node.outerWrapper = container;
                        container.innerWrapped = node;
                        if (register) {
                            container.registerBox(2 /* MARGIN_TOP */, ordinal);
                        }
                    }
                    return {
                        parent: container,
                        renderAs: container,
                        outputAs: application.renderNode(new $LayoutUI$3(parent, container, CONTAINER_NODE.LINEAR, 16 /* VERTICAL */ | 2 /* UNKNOWN */, container.children))
                    };
                }
                else if (register) {
                    node.registerBox(2 /* MARGIN_TOP */, ordinal);
                }
            }
            return undefined;
        }
    }

    const { convertFloat: convertFloat$1 } = squared.lib.util;
    class Relative extends squared.base.extensions.Relative {
        postOptimize(node) {
            super.postOptimize(node);
            if (node.imageOrSvgElement && node.alignSibling('baseline') && convertFloat$1(node.verticalAlign) !== 0 && node.android('visibility') === 'invisible') {
                node.android('baselineAlignBottom', 'true');
            }
        }
    }

    var $LayoutUI$4 = squared.base.LayoutUI;
    const { formatPX: formatPX$5 } = squared.lib.css;
    const $base_lib$4 = squared.base.lib;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$6, NODE_PROCEDURE: NODE_PROCEDURE$4, NODE_RESOURCE: NODE_RESOURCE$2 } = $base_lib$4.enumeration;
    const { SPRITE } = $base_lib$4.constant.EXT_NAME;
    class Sprite extends squared.base.extensions.Sprite {
        processNode(node, parent) {
            const mainData = node.data(SPRITE, 'mainData');
            if (mainData) {
                const drawable = this.resource.addImageSrc(node.backgroundImage);
                if (drawable !== '') {
                    const { width, height } = mainData.image;
                    const { top, left } = mainData.position;
                    const container = this.application.createNode();
                    container.inherit(node, 'base', 'initial', 'styleMap');
                    container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    container.exclude(NODE_RESOURCE$2.IMAGE_SOURCE, NODE_PROCEDURE$4.CUSTOMIZATION);
                    parent.appendTry(node, container);
                    node.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                    node.exclude(NODE_RESOURCE$2.FONT_STYLE | NODE_RESOURCE$2.BOX_STYLE);
                    node.cssApply({
                        position: 'static',
                        top: 'auto',
                        right: 'auto',
                        bottom: 'auto',
                        left: 'auto',
                        display: 'inline-block',
                        width: width > 0 ? formatPX$5(width) : 'auto',
                        height: height > 0 ? formatPX$5(height) : 'auto',
                        marginTop: formatPX$5(top),
                        marginRight: '0px',
                        marginBottom: '0px',
                        marginLeft: formatPX$5(left),
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
                        backgroundColor: 'rgba(0, 0, 0, 0)'
                    });
                    node.unsetCache();
                    node.android('src', '@drawable/' + drawable);
                    container.innerWrapped = node;
                    node.outerWrapper = container;
                    node.parent = container;
                    return {
                        renderAs: container,
                        outputAs: this.application.renderNode(new $LayoutUI$4(parent, container, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, container.children)),
                        parent: container,
                        complete: true
                    };
                }
            }
            return undefined;
        }
    }

    const { getDataSet: getDataSet$1 } = squared.lib.css;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$7, NODE_TEMPLATE: NODE_TEMPLATE$2 } = squared.base.lib.enumeration;
    let EXT_NAME;
    class Substitute extends squared.base.ExtensionUI {
        constructor(name, framework, options, tagNames) {
            super(name, framework, options, tagNames);
            this.require(EXT_ANDROID.EXTERNAL, true);
            EXT_NAME = name;
        }
        processNode(node, parent) {
            const data = getDataSet$1(node.element, EXT_NAME);
            const controlName = data.tag;
            if (controlName) {
                node.containerType = node.blockStatic ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE;
                node.setControlType(controlName);
                node.render(parent);
                const tagChild = data.tagChild;
                if (tagChild) {
                    node.addAlign(4 /* AUTO_LAYOUT */);
                    node.each((item) => {
                        if (item.styleElement) {
                            const dataset = item.dataset;
                            dataset.use = EXT_NAME;
                            dataset.androidSubstituteTag = tagChild;
                        }
                    });
                }
                return {
                    output: {
                        type: 1 /* XML */,
                        node,
                        controlName
                    }
                };
            }
            return undefined;
        }
        postOptimize(node) {
            node.apply(Resource.formatOptions(createViewAttribute(this.options[node.elementId]), this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        }
    }

    var $LayoutUI$5 = squared.base.LayoutUI;
    const $lib$9 = squared.lib;
    const { formatPX: formatPX$6 } = $lib$9.css;
    const { aboveRange: aboveRange$2, convertFloat: convertFloat$2, convertInt: convertInt$2, trimEnd } = $lib$9.util;
    const { UNITZERO } = $lib$9.regex.CHAR;
    const $base_lib$5 = squared.base.lib;
    const { TABLE } = $base_lib$5.constant.EXT_NAME;
    const { CSS_UNIT: CSS_UNIT$1, NODE_ALIGNMENT: NODE_ALIGNMENT$8 } = $base_lib$5.enumeration;
    function setLayoutHeight(node) {
        if (node.hasPX('height') && node.height + node.contentBoxHeight < Math.floor(node.bounds.height) && node.css('verticalAlign') !== 'top') {
            node.setLayoutHeight('wrap_content');
        }
    }
    class Table extends squared.base.extensions.Table {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data(TABLE, 'mainData');
            if (mainData) {
                let requireWidth = false;
                if (mainData.columnCount > 1) {
                    requireWidth = mainData.expand;
                    node.each((item) => {
                        const data = item.data(TABLE, 'cellData');
                        if (UNITZERO.test(item.css('width'))) {
                            item.setLayoutWidth('0px');
                            item.android('layout_columnWeight', item.toElementString('colSpan', '1'));
                        }
                        else {
                            const expand = data.expand;
                            if (expand) {
                                const percent = convertFloat$2(data.percent) / 100;
                                if (percent > 0) {
                                    item.setLayoutWidth('0px');
                                    item.android('layout_columnWeight', trimEnd(percent.toPrecision(3), '0'));
                                    if (!requireWidth) {
                                        requireWidth = !item.hasWidth;
                                    }
                                }
                            }
                            else if (expand === false) {
                                item.android('layout_columnWeight', '0');
                            }
                            if (data.downsized) {
                                if (data.exceed) {
                                    item.setLayoutWidth('0px');
                                    item.android('layout_columnWeight', '0.01');
                                }
                                else if (item.hasPX('width')) {
                                    const width = item.bounds.width;
                                    if (item.actualWidth < width) {
                                        item.setLayoutWidth(formatPX$6(width));
                                    }
                                }
                            }
                        }
                        if (item.tagName === 'TD') {
                            item.setSingleLine(true);
                        }
                        setLayoutHeight(item);
                    });
                }
                else {
                    node.each((item) => {
                        if (item.has('width', 4 /* PERCENT */)) {
                            item.setLayoutWidth('wrap_content');
                            requireWidth = true;
                        }
                        setLayoutHeight(item);
                    });
                }
                if (requireWidth) {
                    if (parent.hasPX('width') && aboveRange$2(node.actualWidth, parent.actualWidth)) {
                        node.setLayoutWidth('match_parent');
                    }
                    else {
                        node.css('width', formatPX$6(node.actualWidth), true);
                    }
                }
                else if (node.hasPX('width') && node.actualWidth < Math.floor(node.bounds.width)) {
                    if (mainData.layoutFixed) {
                        node.android('width', formatPX$6(node.bounds.width), true);
                    }
                    else {
                        if (!node.hasPX('minWidth')) {
                            node.android('minWidth', formatPX$6(node.actualWidth));
                        }
                        node.css('width', 'auto', true);
                    }
                }
                if (node.hasPX('height') && node.actualHeight < Math.floor(node.bounds.height)) {
                    if (!node.hasPX('minHeight')) {
                        node.android('minHeight', formatPX$6(node.actualHeight));
                    }
                    node.css('height', 'auto', true);
                }
                const layout = new $LayoutUI$5(parent, node, CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */, node.children);
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
            const cellData = node.data(TABLE, 'cellData');
            if (cellData) {
                const { rowSpan, colSpan, spaceSpan } = cellData;
                if (rowSpan > 1) {
                    node.android('layout_rowSpan', rowSpan.toString());
                }
                if (colSpan > 1) {
                    node.android('layout_columnSpan', colSpan.toString());
                }
                if (spaceSpan) {
                    const controller = this.controller;
                    controller.addAfterOutsideTemplate(node.id, controller.renderSpace('wrap_content', 'wrap_content', spaceSpan), false);
                }
                node.mergeGravity('layout_gravity', 'fill');
                if (parent.css('empty-cells') === 'hide' && node.naturalChildren.length === 0 && node.textContent === '') {
                    node.hide(true);
                }
            }
            return undefined;
        }
        postOptimize(node) {
            const layoutWidth = convertInt$2(node.layoutWidth);
            if (layoutWidth > 0) {
                const width = node.bounds.width;
                if (width > layoutWidth) {
                    node.setLayoutWidth(formatPX$6(width));
                }
                if (layoutWidth > 0 && node.cssInitial('width') === 'auto' && node.renderChildren.every(item => item.inlineWidth)) {
                    node.renderEach((item) => {
                        item.setLayoutWidth('0px');
                        item.android('layout_columnWeight', '1');
                    });
                }
            }
        }
    }

    var $LayoutUI$6 = squared.base.LayoutUI;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$9 } = squared.base.lib.enumeration;
    class VerticalAlign extends squared.base.extensions.VerticalAlign {
        processNode(node, parent) {
            super.processNode(node, parent);
            return {
                output: this.application.renderNode(new $LayoutUI$6(parent, node, CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */, node.children))
            };
        }
    }

    class WhiteSpace extends squared.base.extensions.WhiteSpace {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
    }

    var $LayoutUI$7 = squared.base.LayoutUI;
    const $lib$a = squared.lib;
    const { formatPX: formatPX$7 } = $lib$a.css;
    const { withinRange: withinRange$3 } = $lib$a.util;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$a, NODE_PROCEDURE: NODE_PROCEDURE$5 } = squared.base.lib.enumeration;
    class Guideline extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.options = {
                circlePosition: false
            };
        }
        is() {
            return true;
        }
        condition(node) {
            return this.included(node.element) && node.length > 0;
        }
        processNode(node, parent) {
            node.exclude(0, NODE_PROCEDURE$5.CONSTRAINT);
            return {
                output: this.application.renderNode(new $LayoutUI$7(parent, node, CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, node.children))
            };
        }
        postBaseLayout(node) {
            const controller = this.controller;
            const circlePosition = this.options.circlePosition;
            const { left, top } = node.box;
            let anchor;
            node.each((item) => {
                const linear = item.linear;
                if (withinRange$3(linear.left, left)) {
                    item.anchor('left', 'parent');
                    item.anchorStyle(STRING_ANDROID.HORIZONTAL);
                }
                if (withinRange$3(linear.top, top)) {
                    item.anchor('top', 'parent');
                    item.anchorStyle(STRING_ANDROID.VERTICAL);
                }
                if (circlePosition) {
                    if (item.anchored) {
                        anchor = item;
                    }
                    else {
                        const constraint = item.constraint;
                        if (anchor) {
                            if (!anchor.constraint.vertical && constraint.vertical) {
                                anchor = item;
                            }
                        }
                        else if (constraint.vertical) {
                            anchor = item;
                        }
                        else if (constraint.horizontal) {
                            anchor = item;
                        }
                    }
                }
            });
            if (circlePosition) {
                if (anchor === undefined) {
                    anchor = node.item(0);
                }
                if (!anchor.anchored) {
                    controller.addGuideline(anchor, node);
                }
                const { x: x2, y: y2 } = anchor.center;
                node.each((item) => {
                    if (item !== anchor) {
                        const { x: x1, y: y1 } = item.center;
                        const x = Math.abs(x1 - x2);
                        const y = Math.abs(y1 - y2);
                        const radius = Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
                        let degrees = Math.round(Math.atan(Math.min(x, y) / Math.max(x, y)) * (180 / Math.PI));
                        if (y1 > y2) {
                            if (x1 > x2) {
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
                        else if (y1 < y2) {
                            if (x2 > x1) {
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
                            degrees = x1 > x2 ? 90 : 270;
                        }
                        item.app('layout_constraintCircle', anchor.documentId);
                        item.app('layout_constraintCircleRadius', formatPX$7(radius));
                        item.app('layout_constraintCircleAngle', degrees.toString());
                    }
                });
            }
            else {
                node.each((item) => {
                    if (!item.anchored) {
                        controller.addGuideline(item, node);
                    }
                });
            }
        }
    }

    var $LayoutUI$8 = squared.base.LayoutUI;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$b, NODE_RESOURCE: NODE_RESOURCE$3, NODE_TEMPLATE: NODE_TEMPLATE$3 } = squared.base.lib.enumeration;
    const isHideMargin = (node, visibleStyle) => visibleStyle.backgroundImage && (node.marginTop > 0 || node.marginRight > 0 || node.marginBottom > 0 || node.marginLeft > 0);
    const isFullScreen = (node, visibleStyle) => visibleStyle.borderWidth && !node.inline && !node.hasPX('width') && (node.backgroundColor !== '' || node.toElementInt('scrollHeight') < window.innerHeight) && node.css('height') !== '100%' && node.css('minHeight') !== '100%';
    const isParentVisible = (node, visibleStyle) => node.actualParent.height > 0 && visibleStyle.backgroundImage && node.css('backgroundPositionY').indexOf('bottom') !== -1;
    class Background extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.removeIs = true;
        }
        is(node) {
            return node.documentBody;
        }
        condition(node) {
            const visibleStyle = node.visibleStyle;
            return isHideMargin(node, visibleStyle) || isFullScreen(node, visibleStyle) || isParentVisible(node, visibleStyle);
        }
        processNode(node, parent) {
            const controller = this.controller;
            const { backgroundColor, visibleStyle } = node;
            let container;
            let parentAs;
            if (backgroundColor !== '') {
                container = controller.createNodeWrapper(node, parent);
                container.setLayoutWidth('match_parent');
                container.unsafe('excludeResource', NODE_RESOURCE$3.BOX_SPACING);
                container.css('backgroundColor', backgroundColor);
                container.setCacheValue('backgroundColor', backgroundColor);
                container.setLayoutHeight('match_parent');
                container.unsetCache('visibleStyle');
                node.css('backgroundColor', 'transparent');
                node.setCacheValue('backgroundColor', '');
                visibleStyle.backgroundColor = false;
            }
            const fullScreen = isFullScreen(node, visibleStyle);
            if (fullScreen || isHideMargin(node, visibleStyle) || isParentVisible(node, visibleStyle)) {
                const backgroundImage = node.backgroundImage;
                if (backgroundImage !== '') {
                    if (container) {
                        parentAs = container;
                        parentAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                        parentAs.addAlign(4096 /* SINGLE */);
                        parentAs.render(parent);
                        this.application.addLayoutTemplate(parent, container, {
                            type: 1 /* XML */,
                            node: container,
                            controlName: container.controlName
                        });
                        container = controller.createNodeWrapper(node, parentAs);
                        container.documentRoot = false;
                        parentAs.documentRoot = true;
                    }
                    else {
                        container = controller.createNodeWrapper(node, parent);
                    }
                    container.setLayoutWidth('match_parent');
                    container.unsafe('excludeResource', NODE_RESOURCE$3.BOX_SPACING);
                    const height = parent.cssInitial('height');
                    const minHeight = parent.cssInitial('minHeight');
                    let backgroundSize;
                    if (height === '' && minHeight === '') {
                        container.setLayoutHeight(fullScreen ? 'match_parent' : 'wrap_content');
                    }
                    else {
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
                        backgroundSize: backgroundSize || node.css('backgroundSize'),
                        backgroundRepeat: node.css('backgroundRepeat'),
                        backgroundPositionX: node.css('backgroundPositionX'),
                        backgroundPositionY: node.css('backgroundPositionY'),
                        backgroundClip: node.css('backgroundClip'),
                        border: '0px none solid',
                        borderRadius: '0px'
                    });
                    container.setCacheValue('backgroundImage', backgroundImage);
                    container.unsetCache('visibleStyle');
                    node.css('backgroundImage', 'none');
                    node.setCacheValue('backgroundImage', '');
                    visibleStyle.backgroundImage = false;
                }
            }
            visibleStyle.background = visibleStyle.borderWidth || visibleStyle.backgroundImage || visibleStyle.backgroundColor;
            if (container) {
                return {
                    parent: container,
                    parentAs,
                    renderAs: container,
                    outputAs: this.application.renderNode(new $LayoutUI$8(parentAs || parent, container, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, container.children)),
                };
            }
            return undefined;
        }
    }

    var $LayoutUI$9 = squared.base.LayoutUI;
    const { aboveRange: aboveRange$3, belowRange } = squared.lib.util;
    const { BOX_STANDARD: BOX_STANDARD$6, NODE_ALIGNMENT: NODE_ALIGNMENT$c } = squared.base.lib.enumeration;
    class Fixed extends squared.base.ExtensionUI {
        is(node) {
            return node.naturalElement && (node.documentBody || node.contentBoxWidth > 0 || node.contentBoxHeight > 0);
        }
        condition(node) {
            const absolute = node.filter((item) => !item.pageFlow && item.leftTopAxis && item.left >= 0 && item.right >= 0);
            if (absolute.length) {
                const paddingTop = node.paddingTop + (node.documentBody ? node.marginTop : 0);
                const paddingRight = node.paddingRight + (node.documentBody ? node.marginRight : 0);
                const paddingBottom = node.paddingBottom + (node.documentBody ? node.marginBottom : 0);
                const paddingLeft = node.paddingLeft + (node.documentBody ? node.marginLeft : 0);
                const children = new Set();
                let right = false;
                let bottom = false;
                for (const item of absolute) {
                    const fixed = item.css('position') === 'fixed';
                    if (item.hasPX('left')) {
                        const value = item.left;
                        if (value >= 0 && value < paddingLeft) {
                            children.add(item);
                        }
                    }
                    else if (item.hasPX('right')) {
                        const value = item.right;
                        if (value >= 0 && (fixed || value < paddingRight || node.documentBody && node.hasPX('width'))) {
                            children.add(item);
                            right = true;
                        }
                    }
                    else if (!item.rightAligned) {
                        if (item.marginLeft < 0 && (node.documentRoot || belowRange(item.linear.left, node.bounds.left))) {
                            children.add(item);
                        }
                    }
                    else if (item.marginRight < 0 && (node.documentRoot || aboveRange$3(item.linear.right, node.bounds.right))) {
                        children.add(item);
                    }
                    if (item.hasPX('top')) {
                        const value = item.top;
                        if (value >= 0 && value < paddingTop) {
                            children.add(item);
                        }
                    }
                    else if (item.hasPX('bottom')) {
                        const value = item.bottom;
                        if (value >= 0 && (fixed || value < paddingBottom || node.documentBody && node.hasPX('height'))) {
                            children.add(item);
                            bottom = true;
                        }
                    }
                }
                if (children.size) {
                    node.data(EXT_ANDROID.DELEGATE_FIXED, 'mainData', { children: Array.from(children), right, bottom });
                    return true;
                }
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_FIXED, 'mainData');
            if (mainData) {
                const container = this.controller.createNodeWrapper(node, parent, mainData.children);
                if (node.documentBody) {
                    let valid = false;
                    if (mainData.right) {
                        container.setLayoutWidth('match_parent');
                        valid = true;
                    }
                    if (mainData.bottom) {
                        container.setLayoutHeight('match_parent');
                        valid = true;
                    }
                    if (valid) {
                        container.cssApply({
                            width: 'auto',
                            height: 'auto',
                            display: 'block',
                            float: 'none'
                        });
                    }
                }
                else if (!node.pageFlow) {
                    node.resetBox(30 /* MARGIN */, container);
                }
                for (const item of mainData.children) {
                    const autoMargin = item.autoMargin;
                    let top = false;
                    let left = false;
                    if (item.hasPX('top')) {
                        item.modifyBox(2 /* MARGIN_TOP */, node.borderTopWidth);
                        top = true;
                    }
                    if (item.hasPX('bottom') && (!top || autoMargin.top || autoMargin.topBottom)) {
                        item.modifyBox(8 /* MARGIN_BOTTOM */, node.borderBottomWidth);
                    }
                    if (item.hasPX('left')) {
                        item.modifyBox(16 /* MARGIN_LEFT */, node.borderLeftWidth);
                        left = true;
                    }
                    if (item.hasPX('right') && (!left || autoMargin.left || autoMargin.leftRight)) {
                        item.modifyBox(4 /* MARGIN_RIGHT */, node.borderRightWidth);
                    }
                }
                const subData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData');
                if (subData) {
                    const wrapped = subData.container;
                    if (wrapped) {
                        if (subData.width) {
                            container.css('maxWidth', node.css('maxWidth'));
                            container.setLayoutWidth('0px');
                            container.contentBoxWidth = node.contentBoxWidth;
                            node.setLayoutWidth('wrap_content');
                        }
                        if (subData.height) {
                            container.css('maxHeight', node.css('maxHeight'));
                            container.setLayoutHeight('0px');
                            container.contentBoxHeight = node.contentBoxHeight;
                            node.setLayoutHeight('wrap_content');
                        }
                    }
                }
                this.subscribers.add(container);
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: this.application.renderNode(new $LayoutUI$9(parent, container, CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, container.children))
                };
            }
            return undefined;
        }
        postConstraints(node) {
            node.each((item) => {
                const constraint = item.constraint;
                if (!constraint.horizontal) {
                    item.anchor('left', 'parent');
                }
                if (!constraint.vertical) {
                    item.anchor('top', 'parent');
                }
            });
        }
    }

    var $LayoutUI$a = squared.base.LayoutUI;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$d } = squared.base.lib.enumeration;
    class MaxWidthHeight extends squared.base.ExtensionUI {
        is(node) {
            return !node.inputElement;
        }
        condition(node, parent) {
            if (!node.support.maxDimension) {
                const width = !isNaN(node.width) && node.hasPX('maxWidth') && !parent.hasAlign(256 /* COLUMN */);
                const height = !isNaN(node.height) && node.hasPX('maxHeight') && parent.hasHeight;
                if (width || height) {
                    node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData', { width, height });
                    return true;
                }
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData');
            if (mainData) {
                const container = parent.layoutConstraint ? parent : this.controller.createNodeWrapper(node, parent, undefined, View.getControlName(CONTAINER_NODE.CONSTRAINT, node.localSettings.targetAPI), CONTAINER_NODE.CONSTRAINT);
                if (mainData.width) {
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
                if (mainData.height) {
                    node.setLayoutHeight('0px');
                    container.setLayoutHeight('match_parent');
                    if (parent.layoutElement) {
                        const autoMargin = node.autoMargin;
                        autoMargin.vertical = false;
                        autoMargin.top = false;
                        autoMargin.bottom = false;
                        autoMargin.topBottom = false;
                    }
                }
                mainData.container = container;
                if (parent !== container) {
                    return {
                        parent: container,
                        renderAs: container,
                        outputAs: this.application.renderNode(new $LayoutUI$a(parent, container, container.containerType, 4096 /* SINGLE */, container.children))
                    };
                }
            }
            return undefined;
        }
    }

    var $LayoutUI$b = squared.base.LayoutUI;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$e } = squared.base.lib.enumeration;
    class NegativeViewport extends squared.base.ExtensionUI {
        is(node) {
            return !node.pageFlow;
        }
        condition(node, parent) {
            if (parent.documentRoot) {
                const box = parent.box;
                const linear = node.linear;
                return (Math.ceil(linear.left) < Math.floor(box.left) && (node.left < 0 || node.marginLeft < 0 || !node.hasPX('left') && node.right > 0) ||
                    Math.floor(linear.right) > Math.ceil(box.right) && (node.left > 0 || node.marginLeft > 0 || !node.hasPX('left') && node.right < 0) ||
                    Math.ceil(linear.top) < Math.floor(box.top) && (node.top < 0 || node.marginTop < 0 || !node.hasPX('top') && node.bottom > 0) ||
                    Math.floor(linear.bottom) > Math.ceil(box.bottom) && (node.top > 0 || node.marginTop > 0 || !node.hasPX('top') && node.bottom < 0) && parent.hasPX('height'));
            }
            return false;
        }
        processNode(node, parent) {
            const container = this.controller.createNodeWrapper(node, parent);
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new $LayoutUI$b(parent, container, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, container.children)),
                include: true
            };
        }
    }

    var $LayoutUI$c = squared.base.LayoutUI;
    const { formatPX: formatPX$8 } = squared.lib.css;
    const { BOX_STANDARD: BOX_STANDARD$7, NODE_ALIGNMENT: NODE_ALIGNMENT$f } = squared.base.lib.enumeration;
    function outsideX(node, parent) {
        if (node.pageFlow) {
            return node === parent.firstChild && node.inlineFlow && !node.centerAligned && !node.rightAligned && node.marginLeft < 0 && Math.abs(node.marginLeft) <= parent.marginLeft + parent.paddingLeft && !parent.some(item => item.multiline);
        }
        else {
            return node.absoluteParent === parent && (node.left < 0 || !node.hasPX('left') && node.right < 0);
        }
    }
    class NegativeX extends squared.base.ExtensionUI {
        is(node) {
            return !node.documentRoot && node.some((item) => outsideX(item, node)) && node.css('overflowX') !== 'hidden';
        }
        condition(node) {
            return true;
        }
        processNode(node, parent) {
            const outside = node.filter((item) => outsideX(item, node));
            const container = this.controller.createNodeWrapper(node, parent, outside, View.getControlName(CONTAINER_NODE.CONSTRAINT, node.localSettings.targetAPI), CONTAINER_NODE.CONSTRAINT);
            const { marginTop, marginBottom } = node;
            if (marginTop > 0) {
                container.modifyBox(2 /* MARGIN_TOP */, marginTop);
                node.modifyBox(2 /* MARGIN_TOP */);
            }
            if (marginBottom > 0) {
                container.modifyBox(8 /* MARGIN_BOTTOM */, marginBottom);
                node.modifyBox(8 /* MARGIN_BOTTOM */);
            }
            let left = NaN;
            let right = NaN;
            let firstChild;
            for (const item of outside) {
                const linear = item.linear;
                if (item.pageFlow) {
                    if (isNaN(left) || linear.left < left) {
                        left = linear.left;
                    }
                    firstChild = item;
                }
                else {
                    if (item.hasPX('left')) {
                        if (item.left < 0 && (isNaN(left) || linear.left < left)) {
                            left = linear.left;
                        }
                    }
                    else if (item.right < 0 && (isNaN(right) || linear.right > right)) {
                        right = linear.right;
                    }
                }
            }
            container.inherit(node, 'styleMap');
            if (!isNaN(left)) {
                let offset = node.linear.left - left;
                if (offset > 0) {
                    node.modifyBox(16 /* MARGIN_LEFT */, offset);
                    for (const item of outside) {
                        if (!item.pageFlow && item.left < 0) {
                            item.css('left', formatPX$8(item.left + offset), true);
                        }
                    }
                }
                else {
                    for (const item of outside) {
                        if (!item.pageFlow && item.left < 0) {
                            item.css('left', formatPX$8(node.marginLeft + item.left), true);
                        }
                    }
                    offset = Math.abs(offset);
                }
                if (node.hasPX('width', false)) {
                    container.cssPX('width', (node.marginLeft > 0 ? node.marginLeft : 0) + offset, false, true);
                }
                else if (node.hasPX('width')) {
                    container.css('width', 'auto', true);
                }
            }
            if (!isNaN(right)) {
                const rightA = node.linear.right;
                const marginRight = node.marginRight;
                let offset = right - rightA;
                if (offset > marginRight) {
                    offset -= marginRight;
                    node.modifyBox(4 /* MARGIN_RIGHT */, offset);
                }
                else {
                    offset = 0;
                }
                const outerRight = rightA + offset;
                if (marginRight > 0) {
                    offset += marginRight;
                }
                if (offset > 0) {
                    if (node.hasPX('width', false) || !node.blockStatic && !node.hasPX('width')) {
                        container.css(container.hasPX('width') ? 'width' : 'minWidth', formatPX$8(node.actualWidth + offset), true);
                    }
                }
                for (const item of outside) {
                    if (item.right < 0) {
                        item.css('right', formatPX$8(outerRight - item.linear.right), true);
                    }
                }
            }
            this.subscribers.add(container);
            container.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData', { offsetLeft: node.marginLeft + node.paddingLeft, firstChild, nextSibling: node });
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new $LayoutUI$c(parent, container, container.containerType, 8 /* HORIZONTAL */ | 4096 /* SINGLE */, container.children))
            };
        }
        postBaseLayout(node) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData');
            if (mainData) {
                let firstChild = mainData.firstChild;
                if (firstChild) {
                    firstChild = firstChild.ascend(item => item !== node, node, 'outerWrapper').pop() || firstChild;
                    firstChild.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed');
                    firstChild.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                    firstChild.modifyBox(16 /* MARGIN_LEFT */, mainData.offsetLeft);
                    Controller.setConstraintDimension(firstChild);
                    firstChild.positioned = true;
                }
                const nextSibling = mainData.nextSibling.ascend(item => item !== node, node, 'outerWrapper').pop() || mainData.nextSibling;
                nextSibling.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed');
                nextSibling.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                Controller.setConstraintDimension(nextSibling);
                nextSibling.positioned = true;
            }
        }
    }

    var $LayoutUI$d = squared.base.LayoutUI;
    const { BOX_STANDARD: BOX_STANDARD$8, CSS_UNIT: CSS_UNIT$2, NODE_ALIGNMENT: NODE_ALIGNMENT$g } = squared.base.lib.enumeration;
    const isFlexible = (node) => !node.documentParent.layoutElement && !node.display.startsWith('table');
    class Percent extends squared.base.ExtensionUI {
        is(node) {
            return node.pageFlow;
        }
        condition(node, parent) {
            if (node.has('width', 4 /* PERCENT */, { not: '100%' }) && !parent.layoutConstraint && (node.documentRoot || node.hasPX('height') || (parent.layoutVertical || node.onlyChild) && (parent.blockStatic || parent.hasPX('width')))) {
                return isFlexible(node);
            }
            else if (node.has('height', 4 /* PERCENT */, { not: '100%' }) && (node.documentRoot || parent.hasHeight && node.onlyChild)) {
                return isFlexible(node);
            }
            return false;
        }
        processNode(node, parent) {
            const container = this.controller.createNodeWrapper(node, parent);
            if (node.percentWidth) {
                container.css('display', 'block');
                container.setLayoutWidth('match_parent');
                node.setLayoutWidth('0px');
            }
            else {
                container.setLayoutWidth('wrap_content');
            }
            if (node.percentHeight) {
                container.setLayoutHeight('match_parent');
                node.setLayoutHeight('0px');
            }
            else {
                container.setLayoutHeight('wrap_content');
            }
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new $LayoutUI$d(parent, container, CONTAINER_NODE.CONSTRAINT, 4096 /* SINGLE */, container.children)),
                include: true
            };
        }
        postConstraints(node) {
            const outerWrapper = node.outerWrapper;
            if (outerWrapper) {
                node.resetBox(30 /* MARGIN */, outerWrapper);
            }
        }
    }

    const $base$3 = squared.base;
    const { NodeUI: NodeUI$3 } = $base$3;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$h, NODE_RESOURCE: NODE_RESOURCE$4, NODE_TEMPLATE: NODE_TEMPLATE$4 } = $base$3.lib.enumeration;
    const getInputName = (element) => element.name ? element.name.trim() : '';
    class RadioGroup extends squared.base.ExtensionUI {
        is(node) {
            return node.is(CONTAINER_NODE.RADIO);
        }
        condition(node) {
            return getInputName(node.element) !== '' && !node.positioned;
        }
        processNode(node, parent) {
            const inputName = getInputName(node.element);
            const children = [];
            const removeable = [];
            const radioButton = [];
            parent.each((item) => {
                const renderAs = item.renderAs;
                let remove;
                if (renderAs) {
                    if (renderAs !== node) {
                        remove = item;
                    }
                    item = renderAs;
                }
                if (item.is(CONTAINER_NODE.RADIO) && !item.rendered && getInputName(item.element) === inputName) {
                    children.push(item);
                    radioButton.push(item);
                }
                else if (children.length && !item.visible && !item.is(CONTAINER_NODE.RADIO)) {
                    children.push(item);
                }
                else {
                    return;
                }
                if (remove) {
                    removeable.push(remove);
                }
            });
            for (let i = children.length - 1; i >= 0; i--) {
                if (radioButton.includes(children[i])) {
                    children.splice(i + 1);
                    break;
                }
            }
            if (children.length > 1) {
                const container = this.controller.createNodeGroup(node, children, parent, true);
                const controlName = CONTAINER_ANDROID.RADIOGROUP;
                const linearX = NodeUI$3.linearData(children).linearX;
                if (linearX) {
                    container.addAlign(8 /* HORIZONTAL */ | 128 /* SEGMENTED */);
                    container.android('orientation', STRING_ANDROID.HORIZONTAL);
                }
                else {
                    container.addAlign(16 /* VERTICAL */);
                    container.android('orientation', STRING_ANDROID.VERTICAL);
                }
                container.setControlType(controlName, CONTAINER_NODE.LINEAR);
                container.inherit(node, 'alignment');
                if (container.baseline) {
                    container.css('verticalAlign', 'middle');
                    container.baseline = false;
                }
                container.exclude(NODE_RESOURCE$4.ASSET);
                const dataset = node.dataset;
                container.render(!dataset.use && dataset.target ? this.application.resolveTarget(dataset.target) : parent);
                for (const item of removeable) {
                    item.hide();
                }
                this.subscribers.add(container);
                return {
                    renderAs: container,
                    outputAs: {
                        type: 1 /* XML */,
                        node: container,
                        controlName
                    },
                    parent: container,
                    complete: true
                };
            }
            return undefined;
        }
        postBaseLayout(node) {
            node.renderEach((item) => {
                if (item.naturalElement && item.toElementBoolean('checked')) {
                    node.android('checkedButton', item.documentId);
                }
            });
        }
    }

    const { formatPX: formatPX$9 } = squared.lib.css;
    const { BOX_STANDARD: BOX_STANDARD$9, NODE_ALIGNMENT: NODE_ALIGNMENT$i, NODE_RESOURCE: NODE_RESOURCE$5, NODE_TEMPLATE: NODE_TEMPLATE$5 } = squared.base.lib.enumeration;
    class ScrollBar extends squared.base.ExtensionUI {
        is(node) {
            return node.length > 0;
        }
        condition(node) {
            return node.overflowX && node.hasPX('width') || node.overflowY && node.hasHeight && node.hasPX('height') || this.included(node.element);
        }
        processNode(node, parent) {
            const overflow = [];
            const scrollView = [];
            const horizontalScroll = CONTAINER_ANDROID.HORIZONTAL_SCROLL;
            const verticalScroll = node.localSettings.targetAPI < 29 /* Q */ ? CONTAINER_ANDROID.VERTICAL_SCROLL : CONTAINER_ANDROID_X.VERTICAL_SCROLL;
            if (node.overflowX && node.overflowY) {
                overflow.push(horizontalScroll, verticalScroll);
            }
            else if (node.overflowX) {
                overflow.push(horizontalScroll);
            }
            else if (node.overflowY) {
                overflow.push(verticalScroll);
            }
            else {
                let overflowType = 0;
                if (node.hasPX('width')) {
                    overflowType |= 8 /* HORIZONTAL */;
                    overflow.push(horizontalScroll);
                }
                if (node.hasHeight && node.hasPX('height')) {
                    overflowType |= 16 /* VERTICAL */;
                    overflow.push(verticalScroll);
                }
                node.overflow = overflowType;
            }
            if (overflow.includes(horizontalScroll)) {
                const children = [];
                let boxWidth = node.actualWidth - node.contentBoxWidth;
                let valid = true;
                let contentWidth = 0;
                node.each((child) => {
                    if (child.textElement && child.css('whiteSpace') !== 'nowrap') {
                        children.push(child);
                    }
                    else {
                        const childWidth = child.actualWidth;
                        if (childWidth <= boxWidth) {
                            return;
                        }
                        else if (childWidth > contentWidth) {
                            contentWidth = childWidth;
                        }
                    }
                    valid = false;
                });
                if (!valid) {
                    if (contentWidth > boxWidth) {
                        boxWidth = contentWidth;
                    }
                }
                else {
                    overflow.shift();
                }
                if (overflow.length) {
                    for (const child of children) {
                        child.css('maxWidth', formatPX$9(boxWidth), true);
                    }
                }
            }
            const length = overflow.length;
            if (length) {
                for (let i = 0; i < length; i++) {
                    let container;
                    if (i === 0) {
                        container = this.application.createNode(node.element);
                        container.inherit(node, 'base', 'initial', 'styleMap');
                        parent.appendTry(node, container);
                    }
                    else {
                        container = this.application.createNode();
                        container.inherit(node, 'base');
                        container.exclude(NODE_RESOURCE$5.BOX_STYLE);
                        scrollView[0].innerWrapped = container;
                        container.outerWrapper = scrollView[0];
                    }
                    container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                    container.exclude(NODE_RESOURCE$5.ASSET);
                    container.resetBox(480 /* PADDING */);
                    scrollView.push(container);
                }
                for (let i = 0; i < length; i++) {
                    const item = scrollView[i];
                    switch (item.controlName) {
                        case verticalScroll:
                            node.setLayoutHeight('wrap_content');
                            item.setLayoutHeight(formatPX$9(node.actualHeight));
                            item.android('scrollbars', STRING_ANDROID.VERTICAL);
                            item.cssApply({
                                width: length === 1 && node.css('width') || 'auto',
                                overflow: 'scroll visible',
                                overflowX: 'visible',
                                overflowY: 'scroll'
                            });
                            break;
                        case horizontalScroll:
                            node.setLayoutWidth('wrap_content');
                            item.setLayoutWidth(formatPX$9(node.actualWidth));
                            item.android('scrollbars', STRING_ANDROID.HORIZONTAL);
                            item.cssApply({
                                height: length === 1 && node.css('height') || 'auto',
                                overflow: 'visible scroll',
                                overflowX: 'scroll',
                                overflowY: 'visible'
                            });
                            break;
                    }
                    if (i === 0) {
                        const dataset = node.dataset;
                        item.render(!dataset.use && dataset.target ? this.application.resolveTarget(dataset.target) : parent);
                    }
                    else {
                        item.render(scrollView[i - 1]);
                    }
                    item.unsetCache();
                    this.application.addLayoutTemplate((item.renderParent || parent), item, {
                        type: 1 /* XML */,
                        node: item,
                        controlName: item.controlName
                    });
                }
                node.overflow = 0;
                node.exclude(NODE_RESOURCE$5.BOX_STYLE);
                node.resetBox(30 /* MARGIN */, scrollView[0]);
                parent = scrollView.pop();
                parent.innerWrapped = node;
                node.parent = parent;
                node.outerWrapper = parent;
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
                    '@': ['left', 'top', 'right', 'bottom', 'drawable', 'width', 'height', 'gravity'],
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

    const VECTOR_PATH = {
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
    };
    const VECTOR_GROUP = {
        'group': {
            '^': 'android',
            '@': ['name', 'rotation', 'scaleX', 'scaleY', 'translateX', 'translateY', 'pivotX', 'pivotY'],
            '>>': true,
            '>': {
                'clip-path': {
                    '^': 'android',
                    '@': ['name', 'pathData']
                },
                'path': VECTOR_PATH.path
            },
            '#': 'include'
        }
    };
    var VECTOR_TMPL = {
        'vector': {
            '@': ['xmlns:android', 'xmlns:aapt', 'android:name', 'android:width', 'android:height', 'android:viewportWidth', 'android:viewportHeight', 'android:alpha'],
            '>': {
                'path': VECTOR_PATH.path
            },
            '#': 'include'
        }
    };

    const $lib$b = squared.lib;
    const { reduceRGBA } = $lib$b.color;
    const { formatPercent: formatPercent$1, formatPX: formatPX$a, getBackgroundPosition: getBackgroundPosition$1, isLength: isLength$3, isPercent: isPercent$3 } = $lib$b.css;
    const { truncate: truncate$5 } = $lib$b.math;
    const { CHAR: CHAR$3, CSS: CSS$1, XML: XML$1 } = $lib$b.regex;
    const { flatArray, isEqual, resolvePath: resolvePath$1 } = $lib$b.util;
    const { applyTemplate: applyTemplate$1 } = $lib$b.xml;
    const { CSS_UNIT: CSS_UNIT$3, NODE_RESOURCE: NODE_RESOURCE$6 } = squared.base.lib.enumeration;
    function getBorderStyle(border, direction = -1, halfSize = false) {
        const { style, color } = border;
        const width = roundFloat(border.width);
        const result = getStrokeColor(color);
        switch (style) {
            case 'solid':
                break;
            case 'dotted':
                result.dashWidth = formatPX$a(width);
                result.dashGap = result.dashWidth;
                break;
            case 'dashed': {
                let dashWidth;
                let dashGap;
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
                result.dashWidth = formatPX$a(dashWidth);
                result.dashGap = formatPX$a(dashGap);
                break;
            }
            case 'inset':
            case 'outset':
            case 'groove':
            case 'ridge':
                const rgba = color.rgba;
                let percent = 1;
                if (width === 1) {
                    if (style === 'inset' || style === 'outset') {
                        percent = 0.5;
                    }
                }
                else {
                    const grayScale = rgba.r === rgba.g && rgba.g === rgba.b;
                    let offset = 0;
                    if (style === 'ridge') {
                        halfSize = !halfSize;
                        offset += 0.25;
                    }
                    else if (style === 'groove') {
                        offset += 0.25;
                    }
                    else {
                        if (grayScale) {
                            if (style === 'inset') {
                                halfSize = !halfSize;
                            }
                        }
                        else if (style === 'outset') {
                            halfSize = !halfSize;
                        }
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
        }
        return result;
    }
    function getBorderStroke(border, direction = -1, hasInset = false, isInset = false) {
        if (border) {
            let result;
            if (isAlternatingBorder(border.style)) {
                const width = parseFloat(border.width);
                result = getBorderStyle(border, direction, !isInset);
                if (isInset) {
                    result.width = formatPX$a(Math.ceil(width / 2) * 2);
                }
                else {
                    result.width = formatPX$a(hasInset ? Math.ceil(width / 2) : roundFloat(border.width));
                }
            }
            else {
                result = getBorderStyle(border);
                result.width = formatPX$a(roundFloat(border.width));
            }
            return result;
        }
        return undefined;
    }
    function getBorderRadius(radius) {
        if (radius) {
            const length = radius.length;
            if (length === 1) {
                return { radius: radius[0] };
            }
            else {
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
                if (length === 8) {
                    const corners = new Array(4);
                    for (let i = 0, j = 0; i < length; i += 2) {
                        corners[j++] = formatPX$a((parseFloat(radius[i]) + parseFloat(radius[i + 1])) / 2);
                    }
                    return getCornerRadius(corners);
                }
                else {
                    return getCornerRadius(radius);
                }
            }
        }
        return undefined;
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
        const indentOffset = indentWidth > 0 ? formatPX$a(indentWidth) : '';
        let hideOffset = '-' + formatPX$a(borderWidth + indentWidth + 1);
        items.push({
            top: top ? indentOffset : hideOffset,
            right: right ? indentOffset : hideOffset,
            bottom: bottom ? indentOffset : hideOffset,
            left: left ? indentOffset : hideOffset,
            shape: {
                'android:shape': 'rectangle',
                stroke: Object.assign({ width: formatPX$a(borderWidth) }, getBorderStyle(border)),
                corners
            }
        });
        const insetWidth = width - borderWidth + indentWidth;
        const drawOffset = formatPX$a(insetWidth);
        hideOffset = '-' + formatPX$a(insetWidth + 1);
        items.push({
            top: top ? drawOffset : hideOffset,
            right: right ? drawOffset : hideOffset,
            bottom: bottom ? drawOffset : hideOffset,
            left: left ? drawOffset : hideOffset,
            shape: {
                'android:shape': 'rectangle',
                stroke: Object.assign({ width: formatPX$a(borderWidth) }, getBorderStyle(border)),
                corners
            }
        });
    }
    function checkBackgroundPosition(value, adjacent, fallback) {
        if (value.indexOf(' ') === -1 && adjacent.indexOf(' ') !== -1) {
            return CHAR$3.LOWERCASE.test(value) ? (value === 'initial' ? fallback : value) + ' 0px' : fallback + ' ' + value;
        }
        else if (value === 'initial') {
            return '0px';
        }
        return value;
    }
    function createBackgroundGradient(gradient, api = 21 /* LOLLIPOP */, precision) {
        const type = gradient.type;
        const result = {
            type,
            item: false
        };
        const hasStop = api >= 21 /* LOLLIPOP */;
        switch (type) {
            case 'conic': {
                const center = gradient.center;
                result.type = 'sweep';
                if (hasStop) {
                    result.centerX = (center.left * 2).toString();
                    result.centerY = (center.top * 2).toString();
                }
                else {
                    result.centerX = formatPercent$1(center.leftAsPercent);
                    result.centerY = formatPercent$1(center.topAsPercent);
                }
                break;
            }
            case 'radial': {
                const { center, radius } = gradient;
                if (hasStop) {
                    result.gradientRadius = radius.toString();
                    result.centerX = center.left.toString();
                    result.centerY = center.top.toString();
                }
                else {
                    result.gradientRadius = formatPX$a(radius);
                    result.centerX = formatPercent$1(center.leftAsPercent);
                    result.centerY = formatPercent$1(center.topAsPercent);
                }
                break;
            }
            case 'linear': {
                const { angle, angleExtent, dimension } = gradient;
                let positionX = angleExtent.x;
                let positionY = angleExtent.y;
                if (angle <= 90) {
                    const height = dimension.height;
                    positionY += height;
                    result.startX = '0';
                    result.startY = height.toString();
                }
                else if (angle <= 180) {
                    result.startX = '0';
                    result.startY = '0';
                }
                else if (angle <= 270) {
                    const width = dimension.width;
                    positionX += width;
                    result.startX = width.toString();
                    result.startY = '0';
                }
                else {
                    const { width, height } = dimension;
                    positionX += width;
                    positionY += height;
                    result.startX = width.toString();
                    result.startY = height.toString();
                }
                result.endX = truncate$5(positionX, precision);
                result.endY = truncate$5(positionY, precision);
                break;
            }
        }
        const colorStops = gradient.colorStops;
        if (hasStop) {
            result.item = convertColorStops(colorStops);
        }
        else {
            const length = colorStops.length;
            result.startColor = getColorValue(colorStops[0].color);
            result.endColor = getColorValue(colorStops[length - 1].color);
            if (length > 2) {
                result.centerColor = getColorValue(colorStops[Math.floor(length / 2)].color);
            }
        }
        return result;
    }
    function getPercentOffset(direction, position, bounds, dimension) {
        if (dimension) {
            const orientation = position.orientation;
            if (direction === 'left' || direction === 'right') {
                const value = orientation.length === 4 ? orientation[1] : orientation[0];
                if (isPercent$3(value)) {
                    return (direction === 'left' ? position.leftAsPercent : position.rightAsPercent) * (bounds.width - dimension.width);
                }
            }
            else {
                const value = orientation.length === 4 ? orientation[3] : orientation[1];
                if (isPercent$3(value)) {
                    return (direction === 'top' ? position.topAsPercent : position.bottomAsPercent) * (bounds.height - dimension.height);
                }
            }
        }
        return position[direction];
    }
    function createLayerList(boxStyle, images, borderOnly = true) {
        const result = [{
                'xmlns:android': XMLNS_ANDROID.android,
                item: []
            }];
        const solid = !borderOnly && getBackgroundColor(boxStyle.backgroundColor);
        if (solid) {
            result[0].item.push({
                shape: {
                    'android:shape': 'rectangle',
                    solid
                }
            });
        }
        if (images) {
            for (const image of images) {
                if (image.gradient) {
                    result[0].item.push({
                        shape: {
                            'android:shape': 'rectangle',
                            gradient: image.gradient
                        }
                    });
                }
                else {
                    result[0].item.push(image);
                }
            }
        }
        return result;
    }
    function createShapeData(stroke, solid, corners) {
        return [{
                'xmlns:android': XMLNS_ANDROID.android,
                'android:shape': 'rectangle',
                stroke,
                solid,
                corners
            }];
    }
    function setBodyBackground(name, parent, value) {
        Resource.addTheme({
            name,
            parent,
            items: {
                'android:windowBackground': value,
                'android:windowFullscreen': 'true',
                'android:fitsSystemWindows': 'true'
            }
        });
    }
    function getIndentOffset(border) {
        const width = roundFloat(border.width);
        return width === 2 && border.style === 'double' ? 3 : width;
    }
    function getColorValue(value, transparency = true) {
        const color = Resource.addColor(value, transparency);
        return color !== '' ? '@color/' + color : '';
    }
    const roundFloat = (value) => Math.round(parseFloat(value));
    const getStrokeColor = (value) => ({ color: getColorValue(value), dashWidth: '', dashGap: '' });
    const isInsetBorder = (border) => border.style === 'groove' || border.style === 'ridge' || border.style === 'double' && roundFloat(border.width) > 1;
    const getPixelUnit = (width, height) => `${width}px ${height}px`;
    function convertColorStops(list, precision) {
        const result = [];
        for (const stop of list) {
            result.push({
                color: getColorValue(stop.color),
                offset: truncate$5(stop.offset, precision)
            });
        }
        return result;
    }
    function drawRect(width, height, x = 0, y = 0, precision) {
        if (precision) {
            x = truncate$5(x, precision);
            y = truncate$5(y, precision);
            width = truncate$5(x + width, precision);
            height = truncate$5(y + height, precision);
        }
        else {
            width += x;
            height += y;
        }
        return `M${x},${y} ${width},${y} ${width},${height} ${x},${height} Z`;
    }
    class ResourceBackground extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.options = {
                drawOutlineAsInsetBorder: true
            };
            this.eventOnly = true;
        }
        afterResources() {
            var _a, _b;
            const application = this.application;
            const settings = application.userSettings;
            this._resourceSvgInstance = this.controller.localSettings.svg.enabled ? application.builtInExtensions[EXT_ANDROID.RESOURCE_SVG] : undefined;
            function setDrawableBackground(node, value) {
                if (value !== '') {
                    const drawable = '@drawable/' + Resource.insertStoredAsset('drawables', node.containerName.toLowerCase() + '_' + node.controlId, value);
                    if (node.documentBody && !setHtmlBackground(node) && (node.backgroundColor !== '' || node.visibleStyle.backgroundRepeatY)) {
                        setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                    }
                    else {
                        node.android('background', drawable, false);
                    }
                }
            }
            function setHtmlBackground(node) {
                const parent = node.actualParent;
                if (!parent.visible) {
                    const background = parent.android('background');
                    if (background !== '') {
                        setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, background);
                        return true;
                    }
                }
                return false;
            }
            const drawOutline = this.options.drawOutlineAsInsetBorder;
            for (const node of application.processing.cache) {
                const stored = node.data(Resource.KEY_NAME, 'boxStyle');
                if (stored) {
                    if (node.hasResource(NODE_RESOURCE$6.BOX_STYLE)) {
                        if (node.inputElement) {
                            const companion = node.companion;
                            if (((_a = companion) === null || _a === void 0 ? void 0 : _a.tagName) === 'LABEL' && !companion.visible) {
                                const backgroundColor = (_b = companion.data(Resource.KEY_NAME, 'boxStyle')) === null || _b === void 0 ? void 0 : _b.backgroundColor;
                                if (backgroundColor) {
                                    stored.backgroundColor = backgroundColor;
                                }
                            }
                        }
                        const images = this.getDrawableImages(node, stored);
                        const outline = stored.outline;
                        let [shapeData, layerListData] = this.getDrawableBorder(stored, undefined, images, drawOutline && outline ? getIndentOffset(outline) : 0);
                        const emptyBackground = shapeData === undefined && layerListData === undefined;
                        if (outline && (drawOutline || emptyBackground)) {
                            const [outlineShapeData, outlineLayerListData] = this.getDrawableBorder(stored, outline, emptyBackground ? images : undefined, undefined, !emptyBackground);
                            if (outlineShapeData) {
                                if (shapeData === undefined) {
                                    shapeData = outlineShapeData;
                                }
                            }
                            else if (outlineLayerListData) {
                                if (layerListData) {
                                    layerListData[0].item = layerListData[0].item.concat(outlineLayerListData[0].item);
                                }
                                else {
                                    layerListData = outlineLayerListData;
                                }
                            }
                        }
                        if (shapeData) {
                            setDrawableBackground(node, applyTemplate$1('shape', SHAPE_TMPL, shapeData));
                        }
                        else if (layerListData) {
                            setDrawableBackground(node, applyTemplate$1('layer-list', LAYERLIST_TMPL, layerListData));
                        }
                        else {
                            const backgroundColor = stored.backgroundColor;
                            if (backgroundColor) {
                                const color = getColorValue(backgroundColor, false);
                                if (color !== '') {
                                    if (node.documentBody) {
                                        setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, color);
                                    }
                                    else {
                                        const fontStyle = node.data(Resource.KEY_NAME, 'fontStyle');
                                        if (fontStyle) {
                                            fontStyle.backgroundColor = backgroundColor;
                                        }
                                        else {
                                            node.android('background', color, false);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else if (node.documentBody) {
                        setHtmlBackground(node);
                    }
                }
            }
            this._resourceSvgInstance = undefined;
        }
        getDrawableBorder(data, outline, images, indentWidth = 0, borderOnly = false) {
            var _a, _b;
            const borders = new Array(4);
            const borderVisible = new Array(4);
            const corners = !borderOnly ? getBorderRadius(data.borderRadius) : undefined;
            const indentOffset = indentWidth > 0 ? formatPX$a(indentWidth) : '';
            let borderStyle = true;
            let borderAll = true;
            let border;
            let borderData;
            let shapeData;
            let layerListData;
            if (outline) {
                borderData = outline;
                for (let i = 0; i < 4; i++) {
                    borders[i] = outline;
                    borderVisible[i] = true;
                }
            }
            else {
                borders[0] = data.borderTop;
                borders[1] = data.borderRight;
                borders[2] = data.borderBottom;
                borders[3] = data.borderLeft;
                for (let i = 0; i < 4; i++) {
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
                    }
                    else {
                        borderVisible[i] = false;
                        borderAll = false;
                    }
                }
            }
            if (borderAll) {
                border = borderData;
            }
            if (border && !isAlternatingBorder(border.style, roundFloat(border.width)) && !(border.style === 'double' && parseInt(border.width) > 1) || borderData === undefined && (corners || ((_a = images) === null || _a === void 0 ? void 0 : _a.length))) {
                const stroke = border ? getBorderStroke(border) : false;
                if (((_b = images) === null || _b === void 0 ? void 0 : _b.length) || indentWidth > 0 || borderOnly) {
                    layerListData = createLayerList(data, images, borderOnly);
                    if (corners || stroke) {
                        layerListData[0].item.push({
                            top: indentOffset,
                            right: indentOffset,
                            left: indentOffset,
                            bottom: indentOffset,
                            shape: {
                                'android:shape': 'rectangle',
                                corners,
                                stroke
                            }
                        });
                    }
                }
                else {
                    shapeData = createShapeData(stroke, !borderOnly && getBackgroundColor(data.backgroundColor), corners);
                }
            }
            else if (borderData) {
                layerListData = createLayerList(data, images, borderOnly);
                if (borderStyle && !isAlternatingBorder(borderData.style)) {
                    const width = roundFloat(borderData.width);
                    if (borderData.style === 'double' && width > 1) {
                        insertDoubleBorder(layerListData[0].item, borderData, borderVisible[0], borderVisible[1], borderVisible[2], borderVisible[3], indentWidth, corners);
                    }
                    else {
                        const hideOffset = '-' + formatPX$a(width + indentWidth + 1);
                        layerListData[0].item.push({
                            top: borderVisible[0] ? indentOffset : hideOffset,
                            right: borderVisible[1] ? indentOffset : hideOffset,
                            bottom: borderVisible[2] ? indentOffset : hideOffset,
                            left: borderVisible[3] ? indentOffset : hideOffset,
                            shape: {
                                'android:shape': 'rectangle',
                                corners,
                                stroke: getBorderStroke(borderData)
                            }
                        });
                    }
                }
                else {
                    function setBorderStyle(layerList, index) {
                        const item = borders[index];
                        if (item) {
                            const width = roundFloat(item.width);
                            if (item.style === 'double' && width > 1) {
                                insertDoubleBorder(layerList.item, item, index === 0, index === 1, index === 2, index === 3, indentWidth, corners);
                            }
                            else {
                                const inset = width > 1 && isInsetBorder(item);
                                if (inset) {
                                    const hideInsetOffset = '-' + formatPX$a(width + indentWidth + 1);
                                    layerList.item.push({
                                        top: index === 0 ? '' : hideInsetOffset,
                                        right: index === 1 ? '' : hideInsetOffset,
                                        bottom: index === 2 ? '' : hideInsetOffset,
                                        left: index === 3 ? '' : hideInsetOffset,
                                        shape: {
                                            'android:shape': 'rectangle',
                                            stroke: getBorderStroke(item, index, inset, true)
                                        }
                                    });
                                }
                                const hideOffset = '-' + formatPX$a((inset ? Math.ceil(width / 2) : width) + indentWidth + 1);
                                layerList.item.push({
                                    top: index === 0 ? indentOffset : hideOffset,
                                    right: index === 1 ? indentOffset : hideOffset,
                                    bottom: index === 2 ? indentOffset : hideOffset,
                                    left: index === 3 ? indentOffset : hideOffset,
                                    shape: {
                                        'android:shape': 'rectangle',
                                        corners,
                                        stroke: getBorderStroke(item, index, inset)
                                    }
                                });
                            }
                        }
                    }
                    setBorderStyle(layerListData[0], 0);
                    setBorderStyle(layerListData[0], 3);
                    setBorderStyle(layerListData[0], 2);
                    setBorderStyle(layerListData[0], 1);
                }
            }
            return [shapeData, layerListData];
        }
        getDrawableImages(node, data) {
            var _a;
            const backgroundImage = data.backgroundImage;
            const extracted = node.extracted;
            if ((backgroundImage || extracted) && node.hasResource(NODE_RESOURCE$6.IMAGE_SOURCE)) {
                const resource = this.resource;
                const bounds = node.bounds;
                const { width: boundsWidth, height: boundsHeight } = bounds;
                const result = [];
                const images = [];
                const imageDimensions = [];
                const imageSvg = [];
                const backgroundPosition = [];
                const backgroundPositionX = data.backgroundPositionX.split(XML$1.SEPARATOR);
                const backgroundPositionY = data.backgroundPositionY.split(XML$1.SEPARATOR);
                let backgroundRepeat = data.backgroundRepeat.split(XML$1.SEPARATOR);
                let backgroundSize = data.backgroundSize.split(XML$1.SEPARATOR);
                let length = 0;
                let resizable = true;
                if (backgroundImage) {
                    const resourceInstance = this._resourceSvgInstance;
                    const lengthA = backgroundImage.length;
                    function fillBackgroundAttribute(attribute) {
                        while (attribute.length < lengthA) {
                            attribute = attribute.concat(attribute.slice(0));
                        }
                        attribute.length = lengthA;
                        return attribute;
                    }
                    backgroundRepeat = fillBackgroundAttribute(backgroundRepeat);
                    backgroundSize = fillBackgroundAttribute(backgroundSize);
                    let modified = false;
                    for (let i = 0; i < lengthA; i++) {
                        let value = backgroundImage[i];
                        let valid = false;
                        if (typeof value === 'string') {
                            if (value !== 'initial') {
                                if (resourceInstance) {
                                    const [parentElement, element] = resourceInstance.createSvgElement(node, value);
                                    if (parentElement && element) {
                                        const drawable = resourceInstance.createSvgDrawable(node, element);
                                        if (drawable !== '') {
                                            images[length] = drawable;
                                            imageSvg[length] = true;
                                            const dimension = node.data(Resource.KEY_NAME, 'svgViewBox') || { width: element.width.baseVal.value, height: element.height.baseVal.value };
                                            if (!node.svgElement) {
                                                let { width, height } = dimension;
                                                if (width > boundsWidth || height > boundsHeight) {
                                                    const ratioWidth = width / boundsWidth;
                                                    const ratioHeight = height / boundsHeight;
                                                    if (ratioWidth > ratioHeight) {
                                                        if (ratioWidth > 1) {
                                                            width = boundsWidth;
                                                            height /= ratioWidth;
                                                        }
                                                        else {
                                                            height = boundsHeight * (ratioHeight / ratioWidth);
                                                        }
                                                    }
                                                    else {
                                                        if (ratioHeight > 1) {
                                                            height = boundsHeight;
                                                            width /= ratioHeight;
                                                        }
                                                        else {
                                                            width = boundsWidth * (ratioWidth / ratioHeight);
                                                        }
                                                    }
                                                }
                                                dimension.width = width;
                                                dimension.height = height;
                                            }
                                            imageDimensions[length] = dimension;
                                            valid = true;
                                        }
                                        parentElement.removeChild(element);
                                    }
                                }
                                if (!valid) {
                                    const match = CSS$1.URL.exec(value);
                                    if (match) {
                                        const uri = match[1];
                                        if (uri.startsWith('data:image')) {
                                            const rawData = resource.getRawData(uri);
                                            if ((_a = rawData) === null || _a === void 0 ? void 0 : _a.base64) {
                                                images[length] = rawData.filename.substring(0, rawData.filename.lastIndexOf('.'));
                                                imageDimensions[length] = rawData;
                                                resource.writeRawImage(rawData.filename, rawData.base64);
                                                valid = true;
                                            }
                                        }
                                        else {
                                            value = resolvePath$1(uri);
                                            images[length] = Resource.addImage({ mdpi: value });
                                            if (images[length] !== '') {
                                                imageDimensions[length] = resource.getImage(value);
                                                valid = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (value.colorStops.length > 1) {
                            const gradient = createBackgroundGradient(value, node.localSettings.targetAPI);
                            if (gradient) {
                                images[length] = gradient;
                                imageDimensions[length] = value.dimension;
                                valid = true;
                            }
                        }
                        if (valid) {
                            const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                            const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                            backgroundPosition[length] = getBackgroundPosition$1(checkBackgroundPosition(x, y, 'left') + ' ' + checkBackgroundPosition(y, x, 'top'), node.actualDimension, node.fontSize, imageDimensions[length], backgroundSize[i]);
                            length++;
                        }
                        else {
                            backgroundRepeat[i] = undefined;
                            backgroundSize[i] = undefined;
                            modified = true;
                        }
                    }
                    if (modified) {
                        backgroundRepeat = flatArray(backgroundRepeat);
                        backgroundSize = flatArray(backgroundSize);
                    }
                }
                if (extracted) {
                    if (length === 0) {
                        backgroundRepeat.length = 0;
                        backgroundSize.length = 0;
                    }
                    const embedded = extracted.filter(item => item.visible && (item.imageElement || item.containerName === 'INPUT_IMAGE'));
                    for (let i = 0; i < embedded.length; i++) {
                        const image = embedded[i];
                        const src = resource.addImageSrc(image.element);
                        if (src !== '') {
                            const imageBounds = image.bounds;
                            images[length] = src;
                            backgroundRepeat[length] = 'no-repeat';
                            backgroundSize[length] = getPixelUnit(image.actualWidth, image.actualHeight);
                            backgroundPosition[length] = getBackgroundPosition$1(image.containerName === 'INPUT_IMAGE' ? getPixelUnit(0, 0) : getPixelUnit(imageBounds.left - bounds.left + node.borderLeftWidth, imageBounds.top - bounds.top + node.borderTopWidth), node.actualDimension, node.fontSize, imageBounds);
                            imageDimensions[length] = resource.getImage(src);
                            length++;
                        }
                    }
                }
                for (let i = length - 1; i >= 0; i--) {
                    const value = images[i];
                    const position = backgroundPosition[i];
                    const size = backgroundSize[i];
                    const imageData = {};
                    let dimension = imageDimensions[i];
                    let dimenWidth = NaN;
                    let dimenHeight = NaN;
                    if (dimension) {
                        if (!dimension.width || !dimension.height) {
                            dimension = undefined;
                        }
                        else {
                            dimenWidth = dimension.width;
                            dimenHeight = dimension.height;
                        }
                    }
                    let top = 0;
                    let right = 0;
                    let bottom = 0;
                    let left = 0;
                    let repeatX = true;
                    let repeatY = true;
                    let recalibrate = true;
                    if (typeof value === 'string') {
                        function resetPosition(dirA, dirB, overwrite = false) {
                            if (position.orientation.length === 2 || overwrite) {
                                position[dirA] = 0;
                            }
                            position[dirB] = 0;
                        }
                        function resetBackground() {
                            tileMode = '';
                            tileModeX = '';
                            tileModeY = '';
                            repeating = false;
                            if (node.documentBody) {
                                node.visibleStyle.backgroundRepeat = true;
                                node.visibleStyle.backgroundRepeatY = true;
                            }
                        }
                        function resetGravityPosition() {
                            gravityX = '';
                            gravityY = '';
                            position.top = 0;
                            position.right = 0;
                            position.bottom = 0;
                            position.left = 0;
                            resizable = false;
                            recalibrate = false;
                        }
                        const canResizeHorizontal = () => resizable && gravityX !== 'fill_horizontal' && tileMode !== 'repeat' && tileModeX === '';
                        const canResizeVertical = () => resizable && gravityY !== 'fill_vertical' && tileMode !== 'repeat' && tileModeY === '';
                        const src = '@drawable/' + value;
                        let repeat = backgroundRepeat[i];
                        if (repeat.indexOf(' ') !== -1) {
                            const [x, y] = repeat.split(' ');
                            if (x === 'no-repeat') {
                                repeat = y === 'no-repeat' ? 'no-repeat' : 'repeat-y';
                            }
                            else if (y === 'no-repeat') {
                                repeat = 'repeat-x';
                            }
                            else {
                                repeat = 'repeat';
                            }
                        }
                        else if (repeat === 'space' || repeat === 'round') {
                            repeat = 'repeat';
                        }
                        const svg = imageSvg[i] === true;
                        let repeating = repeat === 'repeat';
                        let gravityX = '';
                        let gravityY = '';
                        if (!repeating && repeat !== 'repeat-x') {
                            switch (position.horizontal) {
                                case 'left':
                                case '0%':
                                    resetPosition('left', 'right');
                                    gravityX = node.localizeString('left');
                                    break;
                                case 'center':
                                case '50%':
                                    resetPosition('left', 'right', true);
                                    gravityX = STRING_ANDROID.CENTER_HORIZONTAL;
                                    break;
                                case 'right':
                                case '100%':
                                    resetPosition('right', 'left');
                                    gravityX = node.localizeString('right');
                                    break;
                                default:
                                    gravityX += node.localizeString(position.right !== 0 ? 'right' : 'left');
                                    break;
                            }
                        }
                        else {
                            if (dimension) {
                                if (position.left > 0) {
                                    do {
                                        position.left -= dimenWidth;
                                    } while (position.left > 0);
                                    repeatX = true;
                                }
                                else {
                                    repeatX = dimenWidth < boundsWidth;
                                }
                            }
                            else {
                                position.left = 0;
                                repeatX = true;
                            }
                            position.right = 0;
                        }
                        if (!repeating && repeat !== 'repeat-y') {
                            switch (position.vertical) {
                                case 'top':
                                case '0%':
                                    resetPosition('top', 'bottom');
                                    gravityY += 'top';
                                    break;
                                case 'center':
                                case '50%':
                                    resetPosition('top', 'bottom', true);
                                    gravityY += STRING_ANDROID.CENTER_VERTICAL;
                                    break;
                                case 'bottom':
                                case '100%':
                                    resetPosition('bottom', 'top');
                                    gravityY += 'bottom';
                                    break;
                                default:
                                    gravityY += position.bottom !== 0 ? 'bottom' : 'top';
                                    break;
                            }
                        }
                        else {
                            if (dimension) {
                                if (position.top > 0) {
                                    do {
                                        position.top -= dimenHeight;
                                    } while (position.top > 0);
                                    repeatY = true;
                                }
                                else {
                                    repeatY = dimenHeight < boundsHeight;
                                }
                            }
                            else {
                                position.top = 0;
                                repeatY = true;
                            }
                            position.bottom = 0;
                        }
                        let width = 0;
                        let height = 0;
                        let tileMode = '';
                        let tileModeX = '';
                        let tileModeY = '';
                        let gravityAlign = '';
                        let gravity;
                        if (repeating) {
                            if (repeatX && repeatY) {
                                tileMode = 'repeat';
                            }
                            else {
                                if (repeatX) {
                                    tileModeX = 'repeat';
                                }
                                if (repeatY) {
                                    tileModeY = 'repeat';
                                }
                                repeating = false;
                            }
                        }
                        else {
                            switch (repeat) {
                                case 'repeat-x':
                                    if (!node.documentBody) {
                                        if (!node.blockStatic && dimenWidth > boundsWidth) {
                                            width = dimenWidth;
                                        }
                                        else {
                                            tileModeX = 'repeat';
                                        }
                                    }
                                    else {
                                        if (dimenWidth < boundsWidth) {
                                            tileModeX = 'repeat';
                                        }
                                        else {
                                            gravityX = 'fill_horizontal';
                                        }
                                    }
                                    break;
                                case 'repeat-y':
                                    if (!node.documentBody) {
                                        if (dimenHeight > boundsHeight) {
                                            height = dimenHeight;
                                        }
                                        else {
                                            tileModeY = 'repeat';
                                        }
                                    }
                                    else {
                                        if (dimenHeight < boundsHeight) {
                                            tileModeY = 'repeat';
                                        }
                                        else {
                                            gravityY = 'fill_vertical';
                                        }
                                    }
                                    break;
                                default:
                                    tileMode = 'disabled';
                                    break;
                            }
                        }
                        if (dimension) {
                            if (gravityX !== '' && tileModeY === 'repeat' && dimenWidth < boundsWidth) {
                                function resetX() {
                                    if (gravityY === '' && gravityX !== node.localizeString('left') && node.renderChildren.length) {
                                        tileModeY = 'disabled';
                                    }
                                    gravityAlign = gravityX;
                                    gravityX = '';
                                    tileModeX = 'disabled';
                                }
                                switch (gravityX) {
                                    case 'start':
                                    case 'left':
                                        position.left += node.borderLeftWidth;
                                        position.right = 0;
                                        resetX();
                                        break;
                                    case 'end':
                                    case 'right':
                                        position.left = 0;
                                        position.right += node.borderRightWidth;
                                        resetX();
                                        break;
                                    case STRING_ANDROID.CENTER_HORIZONTAL:
                                        position.left = 0;
                                        position.right = 0;
                                        resetX();
                                        break;
                                }
                            }
                            if (gravityY !== '' && tileModeX === 'repeat' && dimenHeight < boundsHeight) {
                                function resetY() {
                                    if (gravityX === '' && gravityY !== 'top' && node.renderChildren.length) {
                                        tileModeX = 'disabled';
                                    }
                                    gravityAlign += (gravityAlign !== '' ? '|' : '') + gravityY;
                                    gravityY = '';
                                    tileModeY = 'disabled';
                                }
                                switch (gravityY) {
                                    case 'top':
                                        position.top += node.borderTopWidth;
                                        position.bottom = 0;
                                        resetY();
                                        break;
                                    case 'bottom':
                                        position.top = 0;
                                        position.bottom += node.borderBottomWidth;
                                        resetY();
                                        break;
                                    case STRING_ANDROID.CENTER_VERTICAL:
                                        position.top = 0;
                                        position.bottom = 0;
                                        resetY();
                                        break;
                                }
                            }
                        }
                        switch (size) {
                            case 'auto':
                            case 'auto auto':
                            case 'initial':
                            case 'contain':
                                break;
                            case '100%':
                            case '100% 100%':
                            case '100% auto':
                            case 'auto 100%': {
                                if (!repeating && tileModeX !== 'repeat' && tileModeY !== 'repeat' && (dimenWidth < boundsWidth || dimenHeight < boundsHeight)) {
                                    const ratioWidth = dimenWidth / boundsWidth;
                                    const ratioHeight = dimenHeight / boundsHeight;
                                    if (ratioWidth < ratioHeight) {
                                        width = boundsWidth;
                                        height = boundsHeight * (ratioHeight / ratioWidth);
                                        resetGravityPosition();
                                    }
                                    else if (ratioWidth > ratioHeight) {
                                        width = boundsWidth * (ratioWidth / ratioHeight);
                                        height = boundsHeight;
                                        resetGravityPosition();
                                    }
                                }
                                resizable = false;
                                break;
                            }
                            case 'cover':
                                resetBackground();
                                break;
                            case 'round':
                                gravity = 'fill';
                                gravityX = 'fill_horizontal';
                                gravityY = 'fill_vertical';
                                resetBackground();
                                break;
                            default:
                                size.split(' ').forEach((dimen, index) => {
                                    if (dimen === '100%') {
                                        if (index === 0) {
                                            gravityX = 'fill_horizontal';
                                        }
                                        else {
                                            gravityY = 'fill_vertical';
                                        }
                                    }
                                    else if (!repeating && dimen !== 'auto') {
                                        if (index === 0) {
                                            width = node.parseUnit(dimen, 'width', false);
                                        }
                                        else {
                                            height = node.parseUnit(dimen, 'height', false);
                                        }
                                    }
                                });
                                break;
                        }
                        if (dimension) {
                            switch (size) {
                                case 'cover': {
                                    const ratioWidth = dimenWidth / boundsWidth;
                                    const ratioHeight = dimenHeight / boundsHeight;
                                    if (ratioWidth < ratioHeight) {
                                        width = boundsWidth;
                                        height = boundsHeight * (ratioHeight / ratioWidth);
                                        left = 0;
                                        if (height > boundsHeight) {
                                            top = boundsHeight - height;
                                            if (position.topAsPercent > 0) {
                                                const topPercent = Math.round(top * position.topAsPercent);
                                                if (topPercent + dimenHeight < boundsHeight) {
                                                    top = topPercent;
                                                }
                                            }
                                        }
                                        else {
                                            top = 0;
                                        }
                                        gravity = '';
                                    }
                                    else if (ratioWidth > ratioHeight) {
                                        width = boundsWidth * (ratioWidth / ratioHeight);
                                        height = boundsHeight;
                                        if (width > boundsWidth) {
                                            left = boundsWidth - width;
                                            if (position.leftAsPercent > 0) {
                                                const leftPercent = Math.round(left * position.leftAsPercent);
                                                if (leftPercent + dimenWidth < boundsWidth) {
                                                    left = leftPercent;
                                                }
                                            }
                                        }
                                        else {
                                            left = 0;
                                        }
                                        top = 0;
                                        gravity = '';
                                    }
                                    else {
                                        gravity = 'fill';
                                    }
                                    resetGravityPosition();
                                    break;
                                }
                                case 'contain': {
                                    const ratioWidth = dimenWidth / boundsWidth;
                                    const ratioHeight = dimenHeight / boundsHeight;
                                    if (ratioWidth > ratioHeight) {
                                        gravity = 'fill_horizontal|center_vertical';
                                        width = 0;
                                        height = boundsHeight * (ratioHeight / ratioWidth);
                                    }
                                    else if (ratioWidth < ratioHeight) {
                                        gravity = 'fill_vertical|center_horizontal';
                                        width = boundsWidth * (ratioWidth / ratioHeight);
                                        height = 0;
                                    }
                                    else {
                                        gravity = 'fill';
                                    }
                                    resetGravityPosition();
                                    break;
                                }
                                default:
                                    if (width === 0 && height > 0 && canResizeHorizontal()) {
                                        width = dimenWidth * height / dimenHeight;
                                    }
                                    if (height === 0 && width > 0 && canResizeVertical()) {
                                        height = dimenHeight * width / dimenWidth;
                                    }
                                    break;
                            }
                        }
                        if (data.backgroundClip) {
                            const { top: clipTop, right: clipRight, left: clipLeft, bottom: clipBottom } = data.backgroundClip;
                            if (width === 0) {
                                width = boundsWidth;
                            }
                            else {
                                width += node.contentBoxWidth;
                            }
                            if (height === 0) {
                                height = boundsHeight;
                            }
                            else {
                                height += node.contentBoxHeight;
                            }
                            width -= clipLeft + clipRight;
                            height -= clipTop + clipBottom;
                            if (gravityX === 'right' || gravityX === 'end') {
                                position.right += clipRight;
                                left = 0;
                            }
                            else if (position.right !== 0) {
                                right += clipRight;
                            }
                            else {
                                left += clipLeft;
                            }
                            if (gravityY === 'bottom') {
                                position.bottom += clipBottom;
                                top = 0;
                            }
                            else if (position.bottom !== 0) {
                                bottom += clipBottom;
                            }
                            else {
                                top += clipTop;
                            }
                            gravity = '';
                            gravityX = '';
                            gravityY = '';
                            recalibrate = false;
                        }
                        else if (width === 0 && height === 0 && dimenWidth < boundsWidth && dimenHeight < boundsHeight && canResizeHorizontal() && canResizeVertical() && !svg) {
                            width = dimenWidth;
                            height = dimenHeight;
                        }
                        if (recalibrate) {
                            if (!repeating) {
                                const backgroundOrigin = data.backgroundOrigin;
                                if (backgroundOrigin) {
                                    if (tileModeX !== 'repeat') {
                                        if (gravityX === 'right' || gravityX === 'end') {
                                            position.right += backgroundOrigin.right;
                                            left = 0;
                                        }
                                        else if (position.leftAsPercent !== 0 || position.rightAsPercent === 0) {
                                            if (position.right !== 0) {
                                                right -= backgroundOrigin.left;
                                            }
                                            else {
                                                left += backgroundOrigin.left;
                                            }
                                        }
                                        else {
                                            if (position.right !== 0) {
                                                right += backgroundOrigin.right;
                                            }
                                            else {
                                                left -= backgroundOrigin.right;
                                            }
                                        }
                                    }
                                    if (tileModeY !== 'repeat') {
                                        if (gravityY === 'bottom') {
                                            position.bottom += backgroundOrigin.bottom;
                                            top = 0;
                                        }
                                        else if (position.topAsPercent !== 0 || position.bottomAsPercent === 0) {
                                            if (position.bottom !== 0) {
                                                bottom -= backgroundOrigin.top;
                                            }
                                            else {
                                                top += backgroundOrigin.top;
                                            }
                                        }
                                        else {
                                            if (position.bottom !== 0) {
                                                bottom += backgroundOrigin.bottom;
                                            }
                                            else {
                                                top -= backgroundOrigin.bottom;
                                            }
                                        }
                                    }
                                    recalibrate = false;
                                }
                            }
                            if (!(node.documentBody || node.is(CONTAINER_NODE.IMAGE) || svg)) {
                                if (resizable) {
                                    let fillX = false;
                                    let fillY = false;
                                    if (boundsWidth < dimenWidth && (!node.has('width', 2 /* LENGTH */, { map: 'initial', not: '100%' }) && !(node.blockStatic && gravity && (gravity === 'center' || gravity.indexOf(STRING_ANDROID.CENTER_HORIZONTAL) !== -1)) || !node.pageFlow)) {
                                        width = boundsWidth - (node.contentBox ? node.contentBoxWidth : 0);
                                        fillX = true;
                                        if (tileMode !== 'disabled') {
                                            switch (position.horizontal) {
                                                case 'left':
                                                case '0px':
                                                    tileModeX = 'repeat';
                                                    break;
                                            }
                                        }
                                    }
                                    if (boundsHeight < dimenHeight && (!node.has('height', 2 /* LENGTH */, { map: 'initial', not: '100%' }) || !node.pageFlow)) {
                                        height = boundsHeight - (node.contentBox ? node.contentBoxHeight : 0);
                                        fillY = true;
                                    }
                                    if (fillX || fillY) {
                                        if (gravityAlign !== '') {
                                            gravityAlign += '|';
                                        }
                                        if (fillX && fillY) {
                                            gravityAlign += 'fill';
                                        }
                                        else {
                                            gravityAlign += fillX ? 'fill_horizontal' : 'fill_vertical';
                                        }
                                    }
                                }
                                else if (boundsHeight < dimenHeight && !node.hasPX('height') && node.length === 0) {
                                    height = boundsHeight;
                                    gravityAlign = '';
                                    if (gravityY === '') {
                                        gravityY = 'top';
                                    }
                                }
                            }
                        }
                        if (width > 0) {
                            imageData.width = width;
                        }
                        if (height > 0) {
                            imageData.height = height;
                        }
                        if (gravityAlign === '') {
                            if ((width || dimenWidth) + position.left >= boundsWidth && (!node.blockStatic || node.hasPX('width', false))) {
                                tileModeX = '';
                                if (!resizable && !height && gravity !== 'fill' && gravityX.indexOf('fill_horizontal') === -1) {
                                    gravityX += (gravityX !== '' ? '|' : '') + 'fill_horizontal';
                                }
                                if (tileMode === 'repeat') {
                                    tileModeY = 'repeat';
                                    tileMode = '';
                                }
                            }
                            if ((height || dimenHeight) + position.top >= boundsHeight && !node.documentBody && !node.has('height', 4 /* PERCENT */)) {
                                tileModeY = '';
                                if (!resizable && gravity !== 'fill' && gravityY.indexOf('fill_vertical') === -1 && !node.hasPX('height')) {
                                    gravityY += (gravityY !== '' ? '|' : '') + 'fill_vertical';
                                }
                                if (tileMode === 'repeat') {
                                    tileModeX = 'repeat';
                                    tileMode = '';
                                }
                            }
                            if (tileMode !== 'repeat' && gravity !== 'fill') {
                                if (tileModeX !== '') {
                                    if (tileModeY === '' && (gravityY === '' || gravityY.indexOf('top') !== -1 || gravityY.indexOf('fill_vertical') !== -1)) {
                                        gravityAlign = gravityY;
                                        gravityY = '';
                                        if (node.renderChildren.length) {
                                            tileModeX = '';
                                        }
                                    }
                                }
                                else if (tileModeY !== '' && (gravityX === '' || gravityX.indexOf('start') !== -1 || gravityX.indexOf('left') !== -1 || gravityX.indexOf('fill_horizontal') !== -1)) {
                                    gravityAlign = gravityX;
                                    gravityX = '';
                                    if (node.renderChildren.length) {
                                        tileModeY = '';
                                    }
                                }
                            }
                        }
                        if (gravity === undefined) {
                            if (gravityX === STRING_ANDROID.CENTER_HORIZONTAL && gravityY === STRING_ANDROID.CENTER_VERTICAL) {
                                if (dimenWidth <= boundsWidth && dimenHeight <= boundsHeight) {
                                    gravityAlign += (gravityAlign !== '' ? '|' : '') + 'center';
                                    gravity = '';
                                }
                                else {
                                    gravity = 'center';
                                }
                            }
                            else if (gravityX === 'fill_horizontal' && gravityY === 'fill_vertical') {
                                gravity = 'fill';
                            }
                            else {
                                gravity = '';
                                if (gravityX !== '') {
                                    gravity += gravityX;
                                }
                                if (gravityY !== '') {
                                    gravity += (gravity ? '|' : '') + gravityY;
                                }
                            }
                            if (gravityX === 'fill_horizontal') {
                                gravityX = '';
                            }
                            if (gravityY === 'fill_vertical') {
                                gravityY = '';
                            }
                        }
                        if (node.documentBody && tileModeX !== 'repeat' && gravity !== '' && gravityAlign === '' && size !== 'cover' && size !== 'contain') {
                            imageData.gravity = gravity;
                            imageData.drawable = src;
                        }
                        else if ((tileMode === 'repeat' || tileModeX !== '' || tileModeY !== '' || gravityAlign !== '' && gravity !== '' || size === 'cover' || size === 'contain' || !resizable && height > 0 && size !== 'cover' && size !== 'contain') && !svg) {
                            imageData.gravity = gravityAlign;
                            imageData.bitmap = [{
                                    src,
                                    gravity,
                                    tileMode,
                                    tileModeX,
                                    tileModeY
                                }];
                        }
                        else {
                            imageData.gravity = gravity || gravityAlign;
                            imageData.drawable = src;
                        }
                    }
                    else if (value.item) {
                        let width;
                        let height;
                        if (dimension) {
                            width = Math.round(dimenWidth);
                            height = Math.round(dimenHeight);
                        }
                        else {
                            width = Math.round(node.actualWidth);
                            height = Math.round(node.actualHeight);
                        }
                        if (size.split(' ').some(dimen => dimen !== '100%' && isLength$3(dimen, true))) {
                            imageData.width = width;
                            imageData.height = height;
                        }
                        const src = Resource.insertStoredAsset('drawables', `${node.controlId}_gradient_${i + 1}`, applyTemplate$1('vector', VECTOR_TMPL, [{
                                'xmlns:android': XMLNS_ANDROID.android,
                                'xmlns:aapt': XMLNS_ANDROID.aapt,
                                'android:width': imageData.width || formatPX$a(width),
                                'android:height': imageData.height || formatPX$a(height),
                                'android:viewportWidth': width.toString(),
                                'android:viewportHeight': height.toString(),
                                'path': {
                                    pathData: drawRect(width, height),
                                    'aapt:attr': {
                                        name: 'android:fillColor',
                                        gradient: value
                                    }
                                }
                            }]));
                        if (src !== '') {
                            imageData.drawable = '@drawable/' + src;
                            if (position.static) {
                                imageData.gravity = 'fill';
                            }
                        }
                    }
                    else {
                        imageData.gradient = value;
                        if (position.static) {
                            imageData.gravity = 'fill';
                        }
                    }
                    if (imageData.drawable || imageData.bitmap || imageData.gradient) {
                        if (position.bottom !== 0) {
                            bottom = (repeatY || !recalibrate ? position.bottom : getPercentOffset('bottom', position, bounds, dimension)) + bottom;
                        }
                        else if (position.top !== 0) {
                            top = (repeatY || !recalibrate ? position.top : getPercentOffset('top', position, bounds, dimension)) + top;
                        }
                        if (position.right !== 0) {
                            right = (repeatX || !recalibrate ? position.right : getPercentOffset('right', position, bounds, dimension)) + right;
                        }
                        else if (position.left !== 0) {
                            left = (repeatX || !recalibrate ? position.left : getPercentOffset('left', position, bounds, dimension)) + left;
                        }
                        const width = imageData.width;
                        const height = imageData.height;
                        if (top !== 0) {
                            if (top < 0 && height > boundsHeight) {
                                top = Math.max(top, boundsHeight - height);
                            }
                            imageData.top = formatPX$a(top);
                        }
                        if (right !== 0) {
                            imageData.right = formatPX$a(right);
                        }
                        if (bottom !== 0) {
                            imageData.bottom = formatPX$a(bottom);
                        }
                        if (left !== 0) {
                            if (left < 0 && width > boundsWidth) {
                                left = Math.max(left, boundsWidth - width);
                            }
                            imageData.left = formatPX$a(left);
                        }
                        if (width) {
                            imageData.width = formatPX$a(width);
                        }
                        if (height) {
                            imageData.height = formatPX$a(height);
                        }
                        result.push(imageData);
                    }
                }
                return result;
            }
            return undefined;
        }
    }

    const $lib$c = squared.lib;
    const { XML: XML$2 } = $lib$c.regex;
    const { convertUnderscore, fromLastIndexOf: fromLastIndexOf$3 } = $lib$c.util;
    const STORED$2 = Resource.STORED;
    const NAMESPACE_ATTR = ['android', 'app'];
    const REGEX_UNIT = /\dpx$/;
    const REGEX_UNIT_ATTR = /:(\w+)="(-?[\d.]+px)"/;
    function getResourceName(map, name, value) {
        for (const [storedName, storedValue] of map.entries()) {
            if (storedName.startsWith(name) && value === storedValue) {
                return storedName;
            }
        }
        const previous = map.get(name);
        return previous !== undefined && previous !== value ? Resource.generateId('dimen', name) : name;
    }
    const getDisplayName = (value) => fromLastIndexOf$3(value, '.');
    class ResourceDimens extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade() {
            const dimens = STORED$2.dimens;
            const groups = {};
            for (const node of this.application.session.cache) {
                if (node.visible) {
                    const containerName = node.containerName.toLowerCase();
                    let group = groups[containerName];
                    if (group === undefined) {
                        group = {};
                        groups[containerName] = group;
                    }
                    for (const namespace of NAMESPACE_ATTR) {
                        const obj = node.namespace(namespace);
                        for (const attr in obj) {
                            if (attr !== 'text') {
                                const value = obj[attr];
                                if (REGEX_UNIT.test(value)) {
                                    const dimen = `${namespace},${attr},${value}`;
                                    let data = group[dimen];
                                    if (data === undefined) {
                                        data = [];
                                        group[dimen] = data;
                                    }
                                    data.push(node);
                                }
                            }
                        }
                    }
                }
            }
            for (const containerName in groups) {
                const group = groups[containerName];
                for (const name in group) {
                    const [namespace, attr, value] = name.split(XML$2.SEPARATOR);
                    const key = getResourceName(dimens, getDisplayName(containerName) + '_' + convertUnderscore(attr), value);
                    const data = group[name];
                    for (const node of data) {
                        node[namespace](attr, '@dimen/' + key);
                    }
                    dimens.set(key, value);
                }
            }
        }
        afterFinalize() {
            if (this.controller.hasAppendProcessing()) {
                const dimens = STORED$2.dimens;
                for (const layout of this.application.layouts) {
                    let content = layout.content;
                    let match;
                    while ((match = REGEX_UNIT_ATTR.exec(content)) !== null) {
                        const [original, name, value] = match;
                        if (name !== 'text') {
                            const key = getResourceName(dimens, 'custom_' + convertUnderscore(name), value);
                            content = content.replace(original, original.replace(value, '@dimen/' + key));
                            dimens.set(key, value);
                        }
                    }
                    layout.content = content;
                }
            }
        }
    }

    const $lib$d = squared.lib;
    const { XML: XML$3 } = $lib$d.regex;
    const { capitalize: capitalize$2, convertInt: convertInt$3, convertWord: convertWord$1, filterArray: filterArray$1, objectMap: objectMap$3, spliceArray, trimString: trimString$1 } = $lib$d.util;
    const { NODE_RESOURCE: NODE_RESOURCE$7 } = squared.base.lib.enumeration;
    const STORED$3 = Resource.STORED;
    const REGEX_TAGNAME = /^(\w*?)(?:_(\d+))?$/;
    const REGEX_DOUBLEQUOTE = /"/g;
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
        'fontFamily': 'android:fontFamily="',
        'fontStyle': 'android:textStyle="',
        'fontWeight': 'android:fontWeight="',
        'fontSize': 'android:textSize="',
        'color': 'android:textColor="@color/',
        'backgroundColor': 'android:background="@color/'
    };
    function deleteStyleAttribute(sorted, attrs, ids) {
        const length = sorted.length;
        for (const value of attrs.split(';')) {
            for (let i = 0; i < length; i++) {
                let index = -1;
                let key = '';
                let data = sorted[i];
                for (const j in data) {
                    if (j === value) {
                        index = i;
                        key = j;
                        i = length;
                        break;
                    }
                }
                if (index !== -1) {
                    data = sorted[index];
                    data[key] = filterArray$1(data[key], id => !ids.includes(id));
                    if (data[key].length === 0) {
                        delete data[key];
                    }
                    break;
                }
            }
        }
    }
    class ResourceFonts extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.options = {
                systemDefaultFont: 'sans-serif',
                disableFontAlias: false
            };
            this.eventOnly = true;
        }
        afterParseDocument() {
            var _a, _b;
            const resource = this.resource;
            const settings = resource.userSettings;
            const disableFontAlias = this.options.disableFontAlias;
            const dpi = settings.resolutionDPI;
            const convertPixels = settings.convertPixels === 'dp';
            const { fonts, styles } = STORED$3;
            const styleKeys = Object.keys(FONT_STYLE);
            const nameMap = {};
            const groupMap = {};
            for (const node of this.application.session.cache) {
                if (node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource(NODE_RESOURCE$7.FONT_STYLE)) {
                    const containerName = node.containerName;
                    let map = nameMap[containerName];
                    if (map === undefined) {
                        map = [];
                        nameMap[containerName] = map;
                    }
                    map.push(node);
                }
            }
            for (const tag in nameMap) {
                const sorted = [];
                const data = nameMap[tag];
                for (let node of data) {
                    const { id, companion } = node;
                    const targetAPI = node.localSettings.targetAPI;
                    const stored = node.data(Resource.KEY_NAME, 'fontStyle');
                    let { fontFamily, fontStyle, fontWeight } = stored;
                    if (((_a = companion) === null || _a === void 0 ? void 0 : _a.tagName) === 'LABEL' && !companion.visible) {
                        node = companion;
                    }
                    fontFamily.replace(REGEX_DOUBLEQUOTE, '').split(XML$3.SEPARATOR).some((value, index, array) => {
                        value = trimString$1(value, "'").toLowerCase();
                        let fontName = value;
                        let customFont = false;
                        if (!disableFontAlias && FONTREPLACE_ANDROID[fontName]) {
                            fontName = this.options.systemDefaultFont;
                        }
                        if (targetAPI >= FONT_ANDROID[fontName] || !disableFontAlias && targetAPI >= FONT_ANDROID[FONTALIAS_ANDROID[fontName]]) {
                            fontFamily = fontName;
                            customFont = true;
                        }
                        else if (fontStyle && fontWeight) {
                            let createFont = true;
                            if (resource.getFont(value, fontStyle, fontWeight) === undefined) {
                                if (resource.getFont(value, fontStyle)) {
                                    createFont = false;
                                }
                                else if (index < array.length - 1) {
                                    return false;
                                }
                                else if (index > 0) {
                                    value = trimString$1(array[0], "'").toLowerCase();
                                    fontName = value;
                                }
                            }
                            fontName = convertWord$1(fontName);
                            if (createFont) {
                                const font = fonts.get(fontName) || {};
                                font[value + '|' + fontStyle + '|' + fontWeight] = FONTWEIGHT_ANDROID[fontWeight] || fontWeight;
                                fonts.set(fontName, font);
                            }
                            fontFamily = '@font/' + fontName;
                            customFont = true;
                        }
                        if (customFont) {
                            if (fontStyle === 'normal') {
                                fontStyle = '';
                            }
                            if (fontWeight === '400' || node.localSettings.targetAPI < 26 /* OREO */) {
                                fontWeight = '';
                            }
                            else if (parseInt(fontWeight) > 500) {
                                fontStyle += (fontStyle ? '|' : '') + 'bold';
                            }
                            return true;
                        }
                        return false;
                    });
                    const fontData = {
                        fontFamily,
                        fontStyle,
                        fontWeight,
                        fontSize: stored.fontSize,
                        color: Resource.addColor(stored.color),
                        backgroundColor: Resource.addColor(stored.backgroundColor)
                    };
                    for (let i = 0; i < 6; i++) {
                        const key = styleKeys[i];
                        let value = fontData[key];
                        if (value) {
                            if (i === 3 && convertPixels) {
                                value = convertLength(value, dpi, true);
                            }
                            const attr = FONT_STYLE[key] + value + '"';
                            let dataIndex = sorted[i];
                            if (dataIndex === undefined) {
                                dataIndex = {};
                                sorted[i] = dataIndex;
                            }
                            let dataAttr = dataIndex[attr];
                            if (dataAttr === undefined) {
                                dataAttr = [];
                                dataIndex[attr] = dataAttr;
                            }
                            dataAttr.push(id);
                        }
                    }
                }
                groupMap[tag] = sorted;
            }
            const style = {};
            for (const tag in groupMap) {
                const styleTag = {};
                style[tag] = styleTag;
                const sorted = filterArray$1(groupMap[tag], item => item !== undefined).sort((a, b) => {
                    let maxA = 0;
                    let maxB = 0;
                    let countA = 0;
                    let countB = 0;
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
                    }
                    else if (countA !== countB) {
                        return countA > countB ? -1 : 1;
                    }
                    return 0;
                });
                do {
                    if (sorted.length === 1) {
                        const data = sorted[0];
                        for (const attr in data) {
                            const item = data[attr];
                            if (item.length) {
                                styleTag[attr] = item;
                            }
                        }
                        sorted.length = 0;
                    }
                    else {
                        const styleKey = {};
                        for (let i = 0; i < sorted.length; i++) {
                            const filtered = {};
                            const dataA = sorted[i];
                            for (const attrA in dataA) {
                                const ids = dataA[attrA];
                                if (ids.length === 0) {
                                    continue;
                                }
                                else if (ids.length === nameMap[tag].length) {
                                    styleKey[attrA] = ids;
                                    sorted[i] = {};
                                    break;
                                }
                                const found = {};
                                let merged = false;
                                for (let j = 0; j < sorted.length; j++) {
                                    if (i !== j) {
                                        const dataB = sorted[j];
                                        for (const attr in dataB) {
                                            const compare = dataB[attr];
                                            if (compare.length) {
                                                for (const id of ids) {
                                                    if (compare.includes(id)) {
                                                        let dataC = found[attr];
                                                        if (dataC === undefined) {
                                                            dataC = [];
                                                            found[attr] = dataC;
                                                        }
                                                        dataC.push(id);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                for (const attrB in found) {
                                    const dataB = found[attrB];
                                    if (dataB.length > 1) {
                                        filtered[(attrA < attrB ? attrA + ';' + attrB : attrB + ';' + attrA)] = dataB;
                                        merged = true;
                                    }
                                }
                                if (!merged) {
                                    filtered[attrA] = ids;
                                }
                            }
                            if (Object.keys(filtered).length) {
                                const combined = {};
                                const deleteKeys = new Set();
                                const joinMap = {};
                                for (const attr in filtered) {
                                    joinMap[attr] = filtered[attr].join(',');
                                }
                                for (const attrA in filtered) {
                                    for (const attrB in filtered) {
                                        const index = joinMap[attrA];
                                        if (attrA !== attrB && index === joinMap[attrB]) {
                                            let data = combined[index];
                                            if (data === undefined) {
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
                                for (const attr of deleteKeys) {
                                    delete filtered[attr];
                                }
                                for (const attr in filtered) {
                                    deleteStyleAttribute(sorted, attr, filtered[attr]);
                                    styleTag[attr] = filtered[attr];
                                }
                                for (const attr in combined) {
                                    const attrs = Array.from(combined[attr]).sort().join(';');
                                    const ids = objectMap$3(attr.split(XML$3.SEPARATOR), value => parseInt(value));
                                    deleteStyleAttribute(sorted, attrs, ids);
                                    styleTag[attrs] = ids;
                                }
                            }
                        }
                        const shared = Object.keys(styleKey);
                        if (shared.length) {
                            styleTag[shared.join(';')] = styleKey[shared[0]];
                        }
                        spliceArray(sorted, item => {
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
            const nodeMap = {};
            const parentStyle = new Set();
            for (const tag in style) {
                const styleTag = style[tag];
                const styleData = [];
                for (const attrs in styleTag) {
                    const items = [];
                    for (const value of attrs.split(';')) {
                        const match = XML$3.ATTRIBUTE.exec(value);
                        if (match) {
                            items.push({ key: match[1], value: match[2] });
                        }
                    }
                    styleData.push({
                        name: '',
                        parent: '',
                        items,
                        ids: styleTag[attrs]
                    });
                }
                styleData.sort((a, b) => {
                    let c = a.ids.length;
                    let d = b.ids.length;
                    if (c === d) {
                        const itemA = a.items;
                        const itemB = b.items;
                        c = itemA.length;
                        d = itemB.length;
                        if (c === d) {
                            c = a.name;
                            d = b.name;
                        }
                    }
                    return c <= d ? 1 : -1;
                });
                const lengthA = styleData.length;
                for (let i = 0; i < lengthA; i++) {
                    styleData[i].name = capitalize$2(tag) + (i > 0 ? '_' + i : '');
                }
                resourceMap[tag] = styleData;
            }
            for (const tag in resourceMap) {
                for (const group of resourceMap[tag]) {
                    const ids = group.ids;
                    if (ids) {
                        for (const id of ids) {
                            let map = nodeMap[id];
                            if (map === undefined) {
                                map = [];
                                nodeMap[id] = map;
                            }
                            map.push(group.name);
                        }
                    }
                }
            }
            for (const node of this.application.session.cache) {
                const styleData = nodeMap[node.id];
                if ((_b = styleData) === null || _b === void 0 ? void 0 : _b.length) {
                    switch (node.tagName) {
                        case 'METER':
                        case 'PROGRESS':
                            node.attr('_', 'style', '@android:style/Widget.ProgressBar.Horizontal');
                            break;
                        default:
                            if (styleData.length > 1) {
                                parentStyle.add(styleData.join('.'));
                                styleData.shift();
                            }
                            else {
                                parentStyle.add(styleData[0]);
                            }
                            node.attr('_', 'style', '@style/' + styleData.join('.'));
                            break;
                    }
                }
            }
            for (const value of parentStyle) {
                const styleName = [];
                let parent = '';
                let items;
                value.split('.').forEach((tag, index, array) => {
                    const match = REGEX_TAGNAME.exec(tag);
                    if (match) {
                        const styleData = resourceMap[match[1].toUpperCase()][convertInt$3(match[2])];
                        if (styleData) {
                            if (index === 0) {
                                parent = tag;
                                if (array.length === 1) {
                                    items = styleData.items;
                                }
                                else if (!styles.has(tag)) {
                                    styles.set(tag, { name: tag, parent: '', items: styleData.items });
                                }
                            }
                            else {
                                if (items) {
                                    for (const item of styleData.items) {
                                        const key = items.findIndex(previous => previous.key === item.key);
                                        if (key !== -1) {
                                            items[key] = item;
                                        }
                                        else {
                                            items.push(item);
                                        }
                                    }
                                }
                                else {
                                    items = styleData.items.slice(0);
                                }
                                styleName.push(tag);
                            }
                        }
                    }
                });
                if (items) {
                    if (styleName.length === 0) {
                        styles.set(parent, { name: parent, parent: '', items });
                    }
                    else {
                        const name = styleName.join('.');
                        styles.set(name, { name, parent, items });
                    }
                }
            }
        }
    }

    const { NODE_TEMPLATE: NODE_TEMPLATE$6 } = squared.base.lib.enumeration;
    class ResourceIncludes extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade() {
            for (const node of this.application.session.cache) {
                const renderTemplates = node.renderTemplates;
                if (renderTemplates) {
                    let open;
                    let close;
                    node.renderEach((item, index) => {
                        const dataset = item.dataset;
                        const name = dataset.androidInclude;
                        const closing = dataset.androidIncludeEnd === 'true';
                        if (name || closing) {
                            const data = {
                                item,
                                name,
                                index,
                                merge: dataset.androidIncludeMerge === 'true'
                            };
                            if (name) {
                                if (open === undefined) {
                                    open = [];
                                }
                                open.push(data);
                            }
                            if (closing) {
                                if (close === undefined) {
                                    close = [];
                                }
                                close.push(data);
                            }
                        }
                    });
                    if (open && close) {
                        const { application, controller } = this;
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
                                        templates.push(renderTemplates[k]);
                                        renderTemplates[k] = null;
                                    }
                                    const merge = openData.merge || templates.length > 1;
                                    const depth = merge ? 1 : 0;
                                    renderTemplates[openData.index] = {
                                        type: 2 /* INCLUDE */,
                                        node: templates[0].node,
                                        content: controller.renderNodeStatic('include', { layout: '@layout/' + openData.name }, '', ''),
                                        indent: true
                                    };
                                    let content = controller.cascadeDocument(templates, depth);
                                    if (merge) {
                                        content = controller.getEnclosingXmlTag('merge', getRootNs(content), content);
                                    }
                                    else {
                                        openData.item.documentRoot = true;
                                    }
                                    application.saveDocument(openData.name, content, '', Number.POSITIVE_INFINITY);
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

    const $lib$e = squared.lib;
    const { formatPX: formatPX$b } = $lib$e.css;
    const { measureTextWidth } = $lib$e.dom;
    const { capitalizeString, isNumber: isNumber$1, lowerCaseString } = $lib$e.util;
    const { replaceCharacterData } = $lib$e.xml;
    const { NODE_RESOURCE: NODE_RESOURCE$8 } = squared.base.lib.enumeration;
    class ResourceStrings extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.options = {
                numberResourceValue: false,
                fontVariantSmallCapsReduction: 0.7
            };
            this.eventOnly = true;
        }
        afterResources() {
            var _a;
            const numberResourceValue = this.options.numberResourceValue;
            const setTextValue = (node, attr, name, value) => {
                name = Resource.addString(value, name, numberResourceValue);
                if (name !== '') {
                    node.android(attr, numberResourceValue || !isNumber$1(name) ? '@string/' + name : name, false);
                }
            };
            for (const node of this.application.processing.cache) {
                if (node.hasResource(NODE_RESOURCE$8.VALUE_STRING)) {
                    switch (node.tagName) {
                        case 'SELECT': {
                            const name = this.createOptionArray(node.element, node.controlId);
                            if (name !== '') {
                                node.android('entries', '@array/' + name);
                            }
                            break;
                        }
                        case 'IFRAME': {
                            const stored = node.data(Resource.KEY_NAME, 'valueString');
                            if (stored) {
                                Resource.addString(replaceCharacterData(stored.value), stored.key);
                            }
                            break;
                        }
                        default: {
                            if (!node.layoutFrame) {
                                const valueString = node.data(Resource.KEY_NAME, 'valueString');
                                if (valueString) {
                                    const name = valueString.key || valueString.value;
                                    let value = valueString.value;
                                    if (node.naturalChild && node.alignParent('left') && !(!node.plainText && node.preserveWhiteSpace || node.plainText && node.actualParent.preserveWhiteSpace)) {
                                        let leadingSpace = 0;
                                        const textContent = node.textContent;
                                        const length = textContent.length;
                                        for (let i = 0; i < length; i++) {
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
                                    if (node.css('fontVariant') === 'small-caps') {
                                        if (node.localSettings.targetAPI >= 21 /* LOLLIPOP */) {
                                            node.android('fontFeatureSettings', 'smcp');
                                        }
                                        else {
                                            node.android('textAllCaps', 'true');
                                            const fontStyle = node.data(Resource.KEY_NAME, 'fontStyle');
                                            if (fontStyle) {
                                                fontStyle.fontSize = (parseFloat(fontStyle.fontSize) * this.options.fontVariantSmallCapsReduction) + 'px';
                                            }
                                        }
                                    }
                                    switch (node.css('textTransform')) {
                                        case 'uppercase':
                                            node.android('textAllCaps', 'true');
                                            break;
                                        case 'lowercase':
                                            value = lowerCaseString(value);
                                            break;
                                        case 'capitalize':
                                            value = capitalizeString(value);
                                            break;
                                    }
                                    const tagName = node.tagName;
                                    value = replaceCharacterData(value, node.preserveWhiteSpace || tagName === 'CODE');
                                    const textDecorationLine = node.css('textDecorationLine');
                                    if (textDecorationLine !== 'none') {
                                        for (const style of textDecorationLine.split(' ')) {
                                            switch (style) {
                                                case 'underline':
                                                    value = '<u>' + value + '</u>';
                                                    break;
                                                case 'line-through':
                                                    value = '<strike>' + value + '</strike>';
                                                    break;
                                            }
                                        }
                                    }
                                    if (tagName === 'INS' && textDecorationLine.indexOf('line-through') === -1) {
                                        value = '<strike>' + value + '</strike>';
                                    }
                                    let indent = 0;
                                    if (node.blockDimension || node.display === 'table-cell') {
                                        const textIndent = node.css('textIndent');
                                        indent = node.parseUnit(textIndent);
                                        if (textIndent === '100%' || indent + node.bounds.width < 0) {
                                            value = '';
                                            node.delete('android', 'ellipsize', 'maxLines');
                                        }
                                    }
                                    if (value !== '') {
                                        if (indent === 0) {
                                            const parent = node.actualParent;
                                            if (((_a = parent) === null || _a === void 0 ? void 0 : _a.firstChild) === node && (parent.blockDimension || parent.display === 'table-cell')) {
                                                indent = parent.parseUnit(parent.css('textIndent'));
                                            }
                                        }
                                        if (indent > 0) {
                                            const width = measureTextWidth(' ', node.css('fontFamily'), node.fontSize) || node.fontSize / 2;
                                            value = '&#160;'.repeat(Math.max(Math.floor(indent / width), 1)) + value;
                                        }
                                        setTextValue(node, 'text', name, value);
                                    }
                                }
                                if (node.inputElement) {
                                    if (node.controlName === CONTAINER_ANDROID.EDIT_LIST) {
                                        const list = node.element.list;
                                        if (list) {
                                            this.createOptionArray(list, node.controlId);
                                            if (!node.hasPX('width')) {
                                                node.css('width', formatPX$b(Math.max(node.bounds.width, node.width)), true);
                                            }
                                        }
                                    }
                                    const hintString = node.data(Resource.KEY_NAME, 'hintString');
                                    if (hintString) {
                                        setTextValue(node, 'hint', node.controlId.toLowerCase() + '_hint', hintString);
                                    }
                                }
                            }
                        }
                    }
                    if (node.styleElement) {
                        const title = node.toElementString('title');
                        if (title !== '') {
                            setTextValue(node, 'tooltipText', node.controlId.toLowerCase() + '_title', title);
                        }
                    }
                }
            }
        }
        createOptionArray(element, controlId) {
            var _a;
            const stringArray = Resource.getOptionArray(element);
            let result;
            if (!this.options.numberResourceValue && stringArray[1]) {
                result = stringArray[1];
            }
            else {
                const resourceArray = stringArray[0] || stringArray[1];
                if (resourceArray) {
                    result = [];
                    for (let value of resourceArray) {
                        value = Resource.addString(replaceCharacterData(value), '', this.options.numberResourceValue);
                        if (value !== '') {
                            result.push('@string/' + value);
                        }
                    }
                }
            }
            if ((_a = result) === null || _a === void 0 ? void 0 : _a.length) {
                return Resource.insertStoredAsset('arrays', controlId + '_array', result);
            }
            return '';
        }
    }

    const $lib$f = squared.lib;
    const { XML: XML$4 } = $lib$f.regex;
    const { capitalize: capitalize$3, trimString: trimString$2 } = $lib$f.util;
    const STORED$4 = Resource.STORED;
    const REGEX_ATTRIBUTE = /(\w+):(\w+)="([^"]+)"/;
    class ResourceStyles extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade() {
            const styles = {};
            const styleCache = {};
            for (const node of this.application.session.cache) {
                if (node.controlId && node.visible) {
                    const renderChildren = node.renderChildren;
                    const length = renderChildren.length;
                    if (length > 1) {
                        const attrMap = new Map();
                        let valid = true;
                        let style = '';
                        for (let i = 0; i < length; i++) {
                            const item = renderChildren[i];
                            let found = false;
                            for (const value of item.combine('_', 'android')) {
                                if (!found && value.startsWith('style=')) {
                                    if (i === 0) {
                                        style = value;
                                    }
                                    else if (style === '' || value !== style) {
                                        valid = false;
                                        break;
                                    }
                                    found = true;
                                }
                                else {
                                    attrMap.set(value, (attrMap.get(value) || 0) + 1);
                                }
                            }
                            if (!valid || !found && style !== '') {
                                valid = false;
                                break;
                            }
                        }
                        if (valid) {
                            for (const [attr, value] of attrMap.entries()) {
                                if (value !== length) {
                                    attrMap.delete(attr);
                                }
                            }
                            if (attrMap.size > 1) {
                                if (style !== '') {
                                    style = trimString$2(style.substring(style.indexOf('/') + 1), '"');
                                }
                                const common = [];
                                for (const attr of attrMap.keys()) {
                                    const match = REGEX_ATTRIBUTE.exec(attr);
                                    if (match) {
                                        for (const item of renderChildren) {
                                            item.delete(match[1], match[2]);
                                        }
                                        common.push(match[0]);
                                    }
                                }
                                common.sort();
                                const commonString = common.join(';');
                                let name = '';
                                for (const index in styleCache) {
                                    if (styleCache[index] === commonString) {
                                        name = index;
                                        break;
                                    }
                                }
                                if (style === '' || !name.startsWith(style + '.')) {
                                    name = (style !== '' ? style + '.' : '') + capitalize$3(node.controlId);
                                    styles[name] = common;
                                    styleCache[name] = commonString;
                                }
                                for (const item of renderChildren) {
                                    item.attr('_', 'style', '@style/' + name);
                                }
                            }
                        }
                    }
                }
            }
            for (const name in styles) {
                const items = [];
                const data = styles[name];
                for (const attr in data) {
                    const match = XML$4.ATTRIBUTE.exec(data[attr]);
                    if (match) {
                        items.push({ key: match[1], value: match[2] });
                    }
                }
                STORED$4.styles.set(name, Object.assign(Object.assign({}, createStyleAttribute()), { name, items }));
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
        'objectAnimator': {
            '^': 'android',
            '@': ['propertyName', 'startOffset', 'duration', 'repeatCount', 'interpolator', 'valueType', 'valueFrom', 'valueTo'],
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
        }
    };
    var SET_TMPL = {
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
                                'objectAnimator': OBJECTANIMATOR.objectAnimator
                            },
                        },
                        'objectAnimator': OBJECTANIMATOR.objectAnimator
                    }
                },
                'objectAnimator': OBJECTANIMATOR.objectAnimator
            }
        }
    };

    if (squared.svg === undefined) {
        Object.assign(squared, { svg: { lib: { constant: {}, util: {} } } });
    }
    var $Svg = squared.svg.Svg;
    var $SvgAnimate = squared.svg.SvgAnimate;
    var $SvgAnimateTransform = squared.svg.SvgAnimateTransform;
    var $SvgBuild = squared.svg.SvgBuild;
    var $SvgG = squared.svg.SvgG;
    var $SvgPath = squared.svg.SvgPath;
    var $SvgShape = squared.svg.SvgShape;
    const $lib$g = squared.lib;
    const { formatPX: formatPX$c, isPercent: isPercent$4 } = $lib$g.css;
    const { truncate: truncate$6 } = $lib$g.math;
    const { CSS: CSS$2 } = $lib$g.regex;
    const { convertCamelCase, convertInt: convertInt$4, convertWord: convertWord$2, filterArray: filterArray$2, formatString, isArray, isNumber: isNumber$2, isString: isString$4, objectMap: objectMap$4, partitionArray: partitionArray$1, replaceMap: replaceMap$1 } = $lib$g.util;
    const { applyTemplate: applyTemplate$2 } = $lib$g.xml;
    const $svg_lib = squared.svg.lib;
    const { KEYSPLINE_NAME, SYNCHRONIZE_MODE } = $svg_lib.constant;
    const { MATRIX, SVG, TRANSFORM } = $svg_lib.util;
    const STORED$5 = Resource.STORED;
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
    const PATH_ATTRIBUTES = ['name', 'value', 'fill', 'stroke', 'fillPattern', 'fillRule', 'strokeWidth', 'fillOpacity', 'strokeOpacity', 'strokeLinecap', 'strokeLinejoin', 'strokeLineJoin', 'strokeMiterlimit'];
    if (KEYSPLINE_NAME) {
        Object.assign(INTERPOLATOR_ANDROID, {
            [KEYSPLINE_NAME['ease-in']]: INTERPOLATOR_ANDROID.accelerate,
            [KEYSPLINE_NAME['ease-out']]: INTERPOLATOR_ANDROID.decelerate,
            [KEYSPLINE_NAME['ease-in-out']]: INTERPOLATOR_ANDROID.accelerate_decelerate,
            [KEYSPLINE_NAME['linear']]: INTERPOLATOR_ANDROID.linear
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
        var _a;
        const name = (_a = keySplines) === null || _a === void 0 ? void 0 : _a[index];
        return name ? INTERPOLATOR_ANDROID[name] || createPathInterpolator(name) : '';
    }
    function getPaintAttribute(value) {
        for (const attr in ATTRIBUTE_ANDROID) {
            if (ATTRIBUTE_ANDROID[attr].includes(value)) {
                return convertCamelCase(attr);
            }
        }
        return '';
    }
    function createPathInterpolator(value) {
        if (INTERPOLATOR_ANDROID[value]) {
            return INTERPOLATOR_ANDROID[value];
        }
        else {
            const name = 'path_interpolator_' + convertWord$2(value);
            if (!STORED$5.animators.has(name)) {
                const xml = formatString(INTERPOLATOR_XML, ...value.split(' '));
                STORED$5.animators.set(name, xml);
            }
            return '@anim/' + name;
        }
    }
    function createTransformData(transform) {
        const result = {};
        for (const item of transform) {
            const { matrix, origin } = item;
            switch (item.type) {
                case SVGTransform.SVG_TRANSFORM_SCALE:
                    result.scaleX = matrix.a.toString();
                    result.scaleY = matrix.d.toString();
                    if (origin) {
                        result.pivotX = origin.x.toString();
                        result.pivotY = origin.y.toString();
                    }
                    break;
                case SVGTransform.SVG_TRANSFORM_ROTATE:
                    result.rotation = item.angle.toString();
                    if (origin) {
                        result.pivotX = origin.x.toString();
                        result.pivotY = origin.y.toString();
                    }
                    else {
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
            if ((SVG.svg(parent) || SVG.use(parent)) && parent !== rootElement) {
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
        const length = transforms.length;
        if (length > 0 && (SVG.circle(element) || SVG.ellipse(element))) {
            if (transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE) && (rx !== ry || length > 1 && transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))) {
                return groupTransforms(element, transforms);
            }
        }
        return [[], transforms];
    }
    function groupTransforms(element, transforms, ignoreClient = false) {
        if (transforms.length) {
            const host = [];
            const client = [];
            const rotateOrigin = transforms[0].fromCSS ? [] : TRANSFORM.rotateOrigin(element).reverse();
            const items = transforms.slice(0).reverse();
            for (let i = 1; i < items.length; i++) {
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
    function getColorValue$1(value, asArray = false) {
        const colorName = '@color/' + Resource.addColor(value);
        return (asArray ? [colorName] : colorName);
    }
    function convertValueType(item, value) {
        if (isColorType(item.attributeName)) {
            return getColorValue$1(value);
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
        const type = gradient.type;
        const result = {
            type,
            item: convertColorStops(gradient.colorStops, precision)
        };
        switch (type) {
            case 'radial': {
                const { cxAsString, cyAsString, rAsString, spreadMethod } = gradient;
                const element = path.element;
                let points = [];
                let cx;
                let cy;
                let cxDiameter;
                let cyDiameter;
                switch (element.tagName) {
                    case 'path':
                        for (const command of $SvgBuild.getPathCommands(path.value)) {
                            points = points.concat(command.value);
                        }
                    case 'polygon':
                        if (SVG.polygon(element)) {
                            points = points.concat($SvgBuild.clonePoints(element.points));
                        }
                        if (!points.length) {
                            return undefined;
                        }
                        [cx, cy, cxDiameter, cyDiameter] = $SvgBuild.minMaxPoints(points);
                        cxDiameter -= cx;
                        cyDiameter -= cy;
                        break;
                    default:
                        if (SVG.rect(element)) {
                            cx = element.x.baseVal.value;
                            cy = element.y.baseVal.value;
                            cxDiameter = element.width.baseVal.value;
                            cyDiameter = element.height.baseVal.value;
                        }
                        else if (SVG.circle(element)) {
                            cx = element.cx.baseVal.value - element.r.baseVal.value;
                            cy = element.cy.baseVal.value - element.r.baseVal.value;
                            cxDiameter = element.r.baseVal.value * 2;
                            cyDiameter = cxDiameter;
                        }
                        else if (SVG.ellipse(element)) {
                            cx = element.cx.baseVal.value - element.rx.baseVal.value;
                            cy = element.cy.baseVal.value - element.ry.baseVal.value;
                            cxDiameter = element.rx.baseVal.value * 2;
                            cyDiameter = element.ry.baseVal.value * 2;
                        }
                        else {
                            return undefined;
                        }
                        break;
                }
                result.centerX = (cx + cxDiameter * getRadiusPercent(cxAsString)).toString();
                result.centerY = (cy + cyDiameter * getRadiusPercent(cyAsString)).toString();
                result.gradientRadius = (((cxDiameter + cyDiameter) / 2) * (isPercent$4(rAsString) ? (parseFloat(rAsString) / 100) : 1)).toString();
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
        if (syncA && syncB) {
            return syncA.key >= syncB.key ? 1 : -1;
        }
        return 0;
    }
    const isColorType = (attr) => attr === 'fill' || attr === 'stroke';
    const getVectorName = (target, section, index = -1) => target.name + '_' + section + (index !== -1 ? '_' + (index + 1) : '');
    const getRadiusPercent = (value) => isPercent$4(value) ? parseFloat(value) / 100 : 0.5;
    const getDrawableSrc = (name) => '@drawable/' + name;
    const getFillData = (ordering = '') => ({ ordering, objectAnimator: [] });
    class ResourceSvg extends squared.base.ExtensionUI {
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
            this.ANIMATE_TARGET = new Map();
            this.IMAGE_DATA = [];
            this.SYNCHRONIZE_MODE = 0;
            this.NAMESPACE_AAPT = false;
        }
        beforeParseDocument() {
            if ($SvgBuild) {
                $SvgBuild.setName();
                this.controller.localSettings.svg.enabled = true;
            }
        }
        afterResources() {
            if ($SvgBuild) {
                for (const node of this.application.processing.cache) {
                    let parentElement;
                    let element;
                    if (node.imageElement) {
                        [parentElement, element] = this.createSvgElement(node, node.src);
                    }
                    else if (node.svgElement) {
                        element = node.element;
                    }
                    if (element) {
                        const drawable = this.createSvgDrawable(node, element);
                        if (drawable !== '') {
                            if (node.localSettings.targetAPI >= 21 /* LOLLIPOP */) {
                                node.android('src', getDrawableSrc(drawable));
                            }
                            else {
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
                        if (parentElement) {
                            parentElement.removeChild(element);
                        }
                    }
                }
            }
        }
        afterFinalize() {
            this.controller.localSettings.svg.enabled = false;
        }
        createSvgElement(node, src) {
            const match = CSS$2.URL.exec(src);
            if (match) {
                src = match[1];
            }
            if (src.toLowerCase().endsWith('.svg') || src.startsWith('data:image/svg+xml')) {
                const fileAsset = this.resource.getRawData(src);
                if (fileAsset) {
                    const parentElement = (node.actualParent || node.documentParent).element;
                    parentElement.insertAdjacentHTML('beforeend', fileAsset.content);
                    if (parentElement.lastElementChild instanceof SVGSVGElement) {
                        const element = parentElement.lastElementChild;
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
        createSvgDrawable(node, element) {
            const svg = new $Svg(element);
            const supportedKeyFrames = node.localSettings.targetAPI >= 23 /* MARSHMALLOW */;
            const { floatPrecisionValue, floatPrecisionKeyTime } = this.options;
            this.SVG_INSTANCE = svg;
            this.VECTOR_DATA.clear();
            this.ANIMATE_DATA.clear();
            this.ANIMATE_TARGET.clear();
            this.IMAGE_DATA.length = 0;
            this.NAMESPACE_AAPT = false;
            this.SYNCHRONIZE_MODE = 2 /* FROMTO_ANIMATE */ | (supportedKeyFrames ? 32 /* KEYTIME_TRANSFORM */ : 64 /* IGNORE_TRANSFORM */);
            const templateName = (node.tagName + '_' + convertWord$2(node.controlId, true) + '_viewbox').toLowerCase();
            const getFilename = (prefix, suffix) => templateName + (prefix ? '_' + prefix : '') + (this.IMAGE_DATA.length ? '_vector' : '') + (suffix ? '_' + suffix.toLowerCase() : '');
            svg.build({
                exclude: this.options.transformExclude,
                residual: partitionTransforms,
                precision: floatPrecisionValue
            });
            svg.synchronize({
                keyTimeMode: this.SYNCHRONIZE_MODE,
                framesPerSecond: this.controller.userSettings.framesPerSecond,
                precision: floatPrecisionValue
            });
            this.queueAnimations(svg, svg.name, item => item.attributeName === 'opacity');
            const include = this.parseVectorData(svg);
            const viewBox = svg.viewBox;
            let vectorName = Resource.insertStoredAsset('drawables', getFilename(), applyTemplate$2('vector', VECTOR_TMPL, [{
                    'xmlns:android': XMLNS_ANDROID.android,
                    'xmlns:aapt': this.NAMESPACE_AAPT ? XMLNS_ANDROID.aapt : '',
                    'android:name': svg.name,
                    'android:width': formatPX$c(svg.width),
                    'android:height': formatPX$c(svg.height),
                    'android:viewportWidth': (viewBox.width || svg.width).toString(),
                    'android:viewportHeight': (viewBox.height || svg.height).toString(),
                    'android:alpha': parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : '',
                    include
                }]));
            let drawable;
            if (this.ANIMATE_DATA.size) {
                const data = [{
                        'xmlns:android': XMLNS_ANDROID.android,
                        'android:drawable': getDrawableSrc(vectorName),
                        target: []
                    }];
                function insertTargetAnimation(name, targetSetTemplate) {
                    const templateSet = targetSetTemplate.set;
                    const length = templateSet.length;
                    if (length) {
                        let modified = false;
                        if (length > 1 && templateSet.every(item => item.ordering === '')) {
                            const setData = {
                                set: [],
                                objectAnimator: []
                            };
                            for (const item of templateSet) {
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
                        const targetData = {
                            name,
                            animation: Resource.insertStoredAsset('animators', getFilename('anim', name), applyTemplate$2('set', SET_TMPL, [targetSetTemplate]))
                        };
                        if (targetData.animation !== '') {
                            targetData.animation = '@anim/' + targetData.animation;
                            data[0].target.push(targetData);
                        }
                    }
                }
                for (const [name, group] of this.ANIMATE_DATA.entries()) {
                    const sequentialMap = new Map();
                    const transformMap = new Map();
                    const togetherData = [];
                    const isolatedData = [];
                    const togetherTargets = [];
                    const isolatedTargets = [];
                    const transformTargets = [];
                    const [companions, animations] = partitionArray$1(group.animate, child => child.companion !== undefined);
                    const targetSetTemplate = {
                        set: [],
                        objectAnimator: []
                    };
                    const lengthA = animations.length;
                    for (let i = 0; i < lengthA; i++) {
                        const item = animations[i];
                        if (item.setterType) {
                            if (ATTRIBUTE_ANDROID[item.attributeName] && isString$4(item.to)) {
                                if (item.duration > 0 && item.fillReplace) {
                                    isolatedData.push(item);
                                }
                                else {
                                    togetherData.push(item);
                                }
                            }
                        }
                        else if ($SvgBuild.isAnimate(item)) {
                            const children = filterArray$2(companions, child => child.companion.value === item);
                            if (children.length) {
                                children.sort((a, b) => a.companion.key >= b.companion.key ? 1 : 0);
                                const sequentially = [];
                                const after = [];
                                const lengthB = children.length;
                                for (let j = 0; j < lengthB; j++) {
                                    const child = children[j];
                                    if (child.companion.key <= 0) {
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
                                sequentialMap.set('sequentially_companion_' + i, sequentially.concat(after));
                            }
                            else {
                                const synchronized = item.synchronized;
                                if (synchronized) {
                                    const value = synchronized.value;
                                    if ($SvgBuild.isAnimateTransform(item)) {
                                        const values = transformMap.get(value) || [];
                                        values.push(item);
                                        transformMap.set(value, values);
                                    }
                                    else {
                                        const values = sequentialMap.get(value) || [];
                                        values.push(item);
                                        sequentialMap.set(value, values);
                                    }
                                }
                                else {
                                    if ($SvgBuild.isAnimateTransform(item)) {
                                        item.expandToValues();
                                    }
                                    if (item.iterationCount === -1) {
                                        isolatedData.push(item);
                                    }
                                    else if ((!item.fromToType || $SvgBuild.isAnimateTransform(item) && item.transformOrigin) && !(supportedKeyFrames && getValueType(item.attributeName) !== 'pathType')) {
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
                            togetherTargets.push(item.sort(sortSynchronized));
                        }
                    }
                    for (const item of transformMap.values()) {
                        transformTargets.push(item.sort(sortSynchronized));
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
                                if (!$SvgBuild.isAnimateTransform(items[0])) {
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
                                if (index > 1 && $SvgBuild.isAnimateTransform(items[0])) {
                                    checkBefore = true;
                                }
                            }
                            const fillBefore = getFillData();
                            const repeating = getFillData();
                            const fillCustom = getFillData();
                            const fillAfter = getFillData();
                            const objectAnimator = repeating.objectAnimator;
                            const customAnimator = fillCustom.objectAnimator;
                            let beforeAnimator = fillBefore.objectAnimator;
                            let afterAnimator = fillAfter.objectAnimator;
                            let together = [];
                            (synchronized ? partitionArray$1(items, (animate) => animate.iterationCount !== -1) : [items]).forEach((partition, section) => {
                                var _a, _b, _c;
                                if (section === 1 && partition.length > 1) {
                                    fillCustom.ordering = 'sequentially';
                                }
                                const animatorMap = new Map();
                                for (const item of partition) {
                                    const valueType = getValueType(item.attributeName);
                                    if (valueType === undefined) {
                                        continue;
                                    }
                                    const requireBefore = item.delay > 0;
                                    let transforming = false;
                                    let transformOrigin;
                                    const resetBeforeValue = (propertyName, value) => {
                                        if (isString$4(value) && beforeAnimator.findIndex(before => before.propertyName === propertyName) === -1) {
                                            beforeAnimator.push(this.createPropertyValue(propertyName, value, '0', valueType));
                                        }
                                    };
                                    const insertFillAfter = (propertyName, propertyValues, startOffset) => {
                                        var _a;
                                        if (!synchronized && item.fillReplace && valueType !== undefined) {
                                            let valueTo = item.replaceValue;
                                            if (!valueTo) {
                                                if (transforming) {
                                                    valueTo = getTransformInitialValue(propertyName);
                                                }
                                                else {
                                                    const parent = item.parent;
                                                    if (parent) {
                                                        if ($SvgBuild.isShape(parent)) {
                                                            const path = parent.path;
                                                            if (path) {
                                                                valueTo = propertyName === 'pathData' ? path.value : path[getPaintAttribute(propertyName)];
                                                            }
                                                        }
                                                    }
                                                }
                                                if (!valueTo) {
                                                    valueTo = item.baseValue;
                                                }
                                            }
                                            let previousValue;
                                            if ((_a = propertyValues) === null || _a === void 0 ? void 0 : _a.length) {
                                                const lastValue = propertyValues[propertyValues.length - 1];
                                                if (isArray(lastValue.propertyValuesHolder)) {
                                                    const propertyValue = lastValue.propertyValuesHolder[lastValue.propertyValuesHolder.length - 1];
                                                    previousValue = propertyValue.keyframe[propertyValue.keyframe.length - 1].value;
                                                }
                                                else {
                                                    previousValue = lastValue.valueTo;
                                                }
                                            }
                                            if (isString$4(valueTo) && valueTo !== previousValue) {
                                                valueTo = convertValueType(item, valueTo);
                                                if (valueTo) {
                                                    switch (propertyName) {
                                                        case 'trimPathStart':
                                                        case 'trimPathEnd':
                                                            valueTo = valueTo.split(' ')[propertyName === 'trimPathStart' ? 0 : 1];
                                                            break;
                                                    }
                                                    afterAnimator.push(this.createPropertyValue(propertyName, valueTo, '1', valueType, valueType === 'pathType' ? previousValue : '', startOffset ? startOffset.toString() : ''));
                                                }
                                            }
                                            if (transformOrigin) {
                                                if (propertyName.endsWith('X')) {
                                                    afterAnimator.push(this.createPropertyValue('translateX', '0', '1', valueType));
                                                }
                                                else if (propertyName.endsWith('Y')) {
                                                    afterAnimator.push(this.createPropertyValue('translateY', '0', '1', valueType));
                                                }
                                            }
                                        }
                                    };
                                    if (item.setterType) {
                                        const propertyNames = getAttributePropertyName(item.attributeName);
                                        if (propertyNames) {
                                            const values = isColorType(item.attributeName) ? getColorValue$1(item.to, true) : item.to.trim().split(' ');
                                            const length = propertyNames.length;
                                            if (values.length === length && !values.some(value => value === '')) {
                                                let companionBefore;
                                                let companionAfter;
                                                for (let i = 0; i < length; i++) {
                                                    let valueFrom;
                                                    if (valueType === 'pathType') {
                                                        valueFrom = values[i];
                                                    }
                                                    else if (requireBefore) {
                                                        const baseValue = item.baseValue;
                                                        if (baseValue) {
                                                            valueFrom = convertValueType(item, baseValue.trim().split(' ')[i]);
                                                        }
                                                    }
                                                    const propertyValue = this.createPropertyValue(propertyNames[i], values[i], '1', valueType, valueFrom, item.delay > 0 ? item.delay.toString() : '');
                                                    if (index > 1) {
                                                        customAnimator.push(propertyValue);
                                                        insertFillAfter(propertyNames[i], undefined, index > 1 ? item.duration : 0);
                                                    }
                                                    else {
                                                        const companion = item.companion;
                                                        if (companion) {
                                                            if (companion.key <= 0) {
                                                                if (companionBefore === undefined) {
                                                                    companionBefore = [];
                                                                }
                                                                companionBefore.push(propertyValue);
                                                            }
                                                            else if (companion.key > 0) {
                                                                if (companionAfter === undefined) {
                                                                    companionAfter = [];
                                                                }
                                                                companionAfter.push(propertyValue);
                                                            }
                                                        }
                                                        else {
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
                                    }
                                    else if ($SvgBuild.isAnimate(item)) {
                                        let resetBefore = checkBefore;
                                        let repeatCount;
                                        if (section === 1) {
                                            repeatCount = partition.length > 1 ? '0' : '-1';
                                        }
                                        else {
                                            repeatCount = item.iterationCount !== -1 ? Math.ceil(item.iterationCount - 1).toString() : '-1';
                                        }
                                        const options = this.createPropertyValue('', '', item.duration.toString(), valueType, '', item.delay > 0 ? item.delay.toString() : '', repeatCount);
                                        let beforeValues;
                                        let propertyNames;
                                        let values;
                                        if (!synchronized && options.valueType === 'pathType') {
                                            if (group.pathData) {
                                                const parent = item.parent;
                                                let transforms;
                                                let companion;
                                                if (parent && $SvgBuild.isShape(parent)) {
                                                    companion = parent;
                                                    if (parent.path) {
                                                        transforms = parent.path.transformed;
                                                    }
                                                }
                                                propertyNames = ['pathData'];
                                                values = $SvgPath.extrapolate(item.attributeName, group.pathData, item.values, transforms, companion, floatPrecisionValue);
                                            }
                                        }
                                        else if ($SvgBuild.asAnimateTransform(item)) {
                                            propertyNames = getTransformPropertyName(item.type);
                                            values = getTransformValues(item);
                                            if (propertyNames && values) {
                                                if (checkBefore && item.keyTimes[0] === 0) {
                                                    resetBefore = false;
                                                }
                                                if (resetBefore || requireBefore) {
                                                    beforeValues = objectMap$4(propertyNames, value => getTransformInitialValue(value) || '0');
                                                }
                                                transformOrigin = item.transformOrigin;
                                            }
                                            transforming = true;
                                        }
                                        else if ($SvgBuild.asAnimateMotion(item)) {
                                            propertyNames = getTransformPropertyName(item.type);
                                            values = getTransformValues(item);
                                            if (propertyNames && values) {
                                                const rotateValues = item.rotateValues;
                                                const length = values.length;
                                                if (((_a = rotateValues) === null || _a === void 0 ? void 0 : _a.length) === length) {
                                                    propertyNames.push('rotation');
                                                    for (let i = 0; i < length; i++) {
                                                        values[i].push(rotateValues[i]);
                                                    }
                                                }
                                            }
                                            transforming = true;
                                        }
                                        else {
                                            propertyNames = getAttributePropertyName(item.attributeName);
                                            switch (options.valueType) {
                                                case 'intType':
                                                    values = objectMap$4(item.values, value => convertInt$4(value).toString());
                                                    if (requireBefore) {
                                                        const baseValue = item.baseValue;
                                                        if (baseValue) {
                                                            beforeValues = replaceMap$1($SvgBuild.parseCoordinates(baseValue), value => Math.trunc(value).toString());
                                                        }
                                                    }
                                                    break;
                                                case 'floatType':
                                                    if (item.attributeName === 'stroke-dasharray') {
                                                        values = objectMap$4(item.values, value => replaceMap$1(value.split(' '), fraction => parseFloat(fraction)));
                                                    }
                                                    else {
                                                        values = item.values;
                                                    }
                                                    if (requireBefore) {
                                                        const baseValue = item.baseValue;
                                                        if (baseValue) {
                                                            beforeValues = replaceMap$1($SvgBuild.parseCoordinates(baseValue), value => value.toString());
                                                        }
                                                    }
                                                    break;
                                                default:
                                                    values = item.values.slice(0);
                                                    if (isColorType(item.attributeName)) {
                                                        if (requireBefore) {
                                                            const baseValue = item.baseValue;
                                                            if (baseValue) {
                                                                beforeValues = getColorValue$1(baseValue, true);
                                                            }
                                                        }
                                                        const length = values.length;
                                                        for (let i = 0; i < length; i++) {
                                                            if (values[i] !== '') {
                                                                values[i] = getColorValue$1(values[i]);
                                                            }
                                                        }
                                                    }
                                                    break;
                                            }
                                        }
                                        if (item.keySplines === undefined) {
                                            if (item.timingFunction) {
                                                options.interpolator = createPathInterpolator(item.timingFunction);
                                            }
                                            else if (this.options.animateInterpolator !== '') {
                                                options.interpolator = this.options.animateInterpolator;
                                            }
                                        }
                                        if (values && propertyNames) {
                                            const { keyTimes, synchronized: syncData } = item;
                                            const lengthB = propertyNames.length;
                                            const lengthC = keyTimes.length;
                                            const keyName = syncData ? syncData.key + syncData.value : (index !== 0 || lengthB > 1 ? JSON.stringify(options) : '');
                                            for (let i = 0; i < lengthB; i++) {
                                                const propertyName = propertyNames[i];
                                                if (resetBefore && beforeValues) {
                                                    resetBeforeValue(propertyName, beforeValues[i]);
                                                }
                                                if (useKeyFrames && lengthC > 1) {
                                                    if (supportedKeyFrames && options.valueType !== 'pathType') {
                                                        if (!resetBefore && requireBefore && beforeValues) {
                                                            resetBeforeValue(propertyName, beforeValues[i]);
                                                        }
                                                        const propertyValuesHolder = animatorMap.get(keyName) || [];
                                                        const keyframe = [];
                                                        for (let j = 0; j < lengthC; j++) {
                                                            let value = getPropertyValue(values, j, i, true);
                                                            if (value && options.valueType === 'floatType') {
                                                                value = truncate$6(value, floatPrecisionValue);
                                                            }
                                                            keyframe.push({
                                                                interpolator: j > 0 && value !== '' && propertyName !== 'pivotX' && propertyName !== 'pivotY' ? getPathInterpolator(item.keySplines, j - 1) : '',
                                                                fraction: keyTimes[j] === 0 && value === '' ? '' : truncate$6(keyTimes[j], floatPrecisionKeyTime),
                                                                value
                                                            });
                                                        }
                                                        propertyValuesHolder.push({ propertyName, keyframe });
                                                        if (!animatorMap.has(keyName)) {
                                                            if (keyName !== '') {
                                                                animatorMap.set(keyName, propertyValuesHolder);
                                                            }
                                                            (section === 0 ? objectAnimator : customAnimator).push(Object.assign(Object.assign({}, options), { propertyValuesHolder }));
                                                        }
                                                        transformOrigin = undefined;
                                                    }
                                                    else {
                                                        ordering = 'sequentially';
                                                        const translateData = getFillData('sequentially');
                                                        for (let j = 0; j < lengthC; j++) {
                                                            const keyTime = keyTimes[j];
                                                            const propertyOptions = Object.assign(Object.assign({}, options), { propertyName, startOffset: j === 0 ? (item.delay + (keyTime > 0 ? Math.floor(keyTime * item.duration) : 0)).toString() : '', propertyValuesHolder: false });
                                                            let valueTo = getPropertyValue(values, j, i, false, options.valueType === 'pathType' ? group.pathData : item.baseValue);
                                                            if (valueTo) {
                                                                let duration;
                                                                if (j === 0) {
                                                                    if (!checkBefore && requireBefore && beforeValues) {
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
                                                                    duration = Math.floor((keyTime - keyTimes[j - 1]) * item.duration);
                                                                }
                                                                if (options.valueType === 'floatType') {
                                                                    valueTo = truncate$6(valueTo, floatPrecisionValue);
                                                                }
                                                                if ((_b = transformOrigin) === null || _b === void 0 ? void 0 : _b[j]) {
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
                                                                        const valueData = this.createPropertyValue(direction, truncate$6(translateTo, floatPrecisionValue), duration.toString(), 'floatType');
                                                                        valueData.interpolator = createPathInterpolator(KEYSPLINE_NAME['step-start']);
                                                                        translateData.objectAnimator.push(valueData);
                                                                    }
                                                                }
                                                                if (j > 0) {
                                                                    propertyOptions.interpolator = getPathInterpolator(item.keySplines, j - 1);
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
                                                }
                                                else {
                                                    const propertyOptions = Object.assign(Object.assign({}, options), { propertyName, interpolator: item.duration > 1 ? getPathInterpolator(item.keySplines, 0) : '', propertyValuesHolder: false });
                                                    const length = values.length;
                                                    if (Array.isArray(values[0])) {
                                                        const valueTo = values[length - 1][i];
                                                        if (length > 1) {
                                                            const from = values[0][i];
                                                            if (from !== valueTo) {
                                                                propertyOptions.valueFrom = from.toString();
                                                            }
                                                        }
                                                        propertyOptions.valueTo = valueTo.toString();
                                                    }
                                                    else {
                                                        let valueFrom;
                                                        if (length > 1) {
                                                            valueFrom = values[0].toString();
                                                            propertyOptions.valueTo = values[length - 1].toString();
                                                        }
                                                        else {
                                                            valueFrom = item.from || (!checkBefore && requireBefore && beforeValues ? beforeValues[i] : '');
                                                            propertyOptions.valueTo = item.to;
                                                        }
                                                        if (options.valueType === 'pathType') {
                                                            propertyOptions.valueFrom = valueFrom || group.pathData || propertyOptions.valueTo;
                                                        }
                                                        else if (valueFrom !== propertyOptions.valueTo && valueFrom) {
                                                            propertyOptions.valueFrom = convertValueType(item, valueFrom);
                                                        }
                                                    }
                                                    if (propertyOptions.valueTo) {
                                                        if (options.valueType === 'floatType') {
                                                            propertyOptions.valueTo = truncate$6(propertyOptions.valueTo, floatPrecisionValue);
                                                        }
                                                        (section === 0 ? objectAnimator : customAnimator).push(propertyOptions);
                                                    }
                                                }
                                                if (section === 0 && !synchronized && item.iterationCount !== -1) {
                                                    insertFillAfter(propertyName, objectAnimator);
                                                }
                                            }
                                            if (requireBefore && ((_c = transformOrigin) === null || _c === void 0 ? void 0 : _c.length)) {
                                                resetBeforeValue('translateX', '0');
                                                resetBeforeValue('translateY', '0');
                                            }
                                        }
                                    }
                                }
                            });
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
                            if (beforeAnimator.length === 0 && customAnimator.length === 0 && afterAnimator.length === 0) {
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
                    });
                    insertTargetAnimation(name, targetSetTemplate);
                }
                for (const [name, target] of this.ANIMATE_TARGET.entries()) {
                    let objectAnimator;
                    const insertResetValue = (propertyName, valueTo, valueType, valueFrom, startOffset) => {
                        if (objectAnimator === undefined) {
                            objectAnimator = [];
                        }
                        objectAnimator.push(this.createPropertyValue(propertyName, valueTo, '0', valueType, valueFrom, startOffset));
                    };
                    for (const item of target.animate) {
                        if ($SvgBuild.asAnimateMotion(item)) {
                            const parent = item.parent;
                            if (parent && $SvgBuild.isShape(parent)) {
                                const path = parent.path;
                                if (path) {
                                    const { value, baseValue } = path;
                                    if (value !== baseValue) {
                                        insertResetValue('pathData', baseValue, 'pathType', value);
                                        if (item.iterationCount !== -1 && !item.setterType) {
                                            insertResetValue('pathData', value, 'pathType', baseValue, item.getTotalDuration().toString());
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (objectAnimator) {
                        insertTargetAnimation(name, {
                            set: [{ set: undefined, objectAnimator }],
                            objectAnimator: undefined
                        });
                    }
                }
                if (data[0].target) {
                    vectorName = Resource.insertStoredAsset('drawables', getFilename('anim'), applyTemplate$2('animated-vector', ANIMATEDVECTOR_TMPL, data));
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
                    const box = svg.viewBox;
                    const scaleX = svg.width / box.width;
                    const scaleY = svg.height / box.height;
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
                        width: formatPX$c(width),
                        height: formatPX$c(height),
                        left: x !== 0 ? formatPX$c(x) : '',
                        top: y !== 0 ? formatPX$c(y) : ''
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
                drawable = Resource.insertStoredAsset('drawables', templateName, applyTemplate$2('layer-list', LAYERLIST_TMPL, data));
            }
            else {
                drawable = vectorName;
            }
            node.data(Resource.KEY_NAME, 'svgViewBox', svg.viewBox);
            return drawable;
        }
        parseVectorData(group, depth = 0) {
            var _a, _b;
            const floatPrecisionValue = this.options.floatPrecisionValue;
            const result = this.createGroup(group);
            const length = result.length;
            const renderDepth = depth + length;
            let output = '';
            for (const item of group) {
                if (item.visible) {
                    if ($SvgBuild.isShape(item)) {
                        const itemPath = item.path;
                        if ((_a = itemPath) === null || _a === void 0 ? void 0 : _a.value) {
                            const [path, groupArray] = this.createPath(item, itemPath);
                            const pathArray = [];
                            if (itemPath.strokeWidth && (itemPath.strokeDasharray || itemPath.strokeDashoffset)) {
                                const animateData = this.ANIMATE_DATA.get(item.name);
                                if (animateData === undefined || animateData.animate.every(animate => animate.attributeName.startsWith('stroke-dash'))) {
                                    const [animations, strokeDash, pathData, clipPathData] = itemPath.extractStrokeDash((_b = animateData) === null || _b === void 0 ? void 0 : _b.animate, floatPrecisionValue);
                                    if (strokeDash) {
                                        if (animateData) {
                                            this.ANIMATE_DATA.delete(item.name);
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
                                        const lengthA = strokeDash.length;
                                        for (let i = 0; i < lengthA; i++) {
                                            const strokePath = i === 0 ? path : Object.assign({}, path);
                                            const dash = strokeDash[i];
                                            strokePath.name = name + '_' + i;
                                            if (animateData) {
                                                this.ANIMATE_DATA.set(strokePath.name, {
                                                    element: animateData.element,
                                                    animate: filterArray$2(animateData.animate, animate => animate.id === undefined || animate.id === i)
                                                });
                                            }
                                            strokePath.trimPathStart = truncate$6(dash.start, floatPrecisionValue);
                                            strokePath.trimPathEnd = truncate$6(dash.end, floatPrecisionValue);
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
                                output += applyTemplate$2('group', VECTOR_GROUP, groupArray, renderDepth + 1);
                            }
                            else {
                                output += applyTemplate$2('path', VECTOR_PATH, pathArray, renderDepth + 1);
                            }
                        }
                    }
                    else if ($SvgBuild.isContainer(item)) {
                        if (item.length) {
                            output += this.parseVectorData(item, renderDepth);
                        }
                    }
                    else if ($SvgBuild.asImage(item)) {
                        if (!$SvgBuild.asPattern(group)) {
                            item.extract(this.options.transformExclude.image);
                            this.IMAGE_DATA.push(item);
                        }
                    }
                }
            }
            if (length) {
                result[length - 1].include = output;
                return applyTemplate$2('group', VECTOR_GROUP, result, depth + 1);
            }
            else {
                return output;
            }
        }
        createGroup(target) {
            const clipMain = [];
            const clipBox = [];
            const groupMain = { 'clip-path': clipMain };
            const groupBox = { 'clip-path': clipBox };
            const result = [];
            const transformData = {};
            if ((target !== this.SVG_INSTANCE && $SvgBuild.asSvg(target) || $SvgBuild.asUseSymbol(target) || $SvgBuild.asUsePattern(target)) && (target.x !== 0 || target.y !== 0)) {
                transformData.name = getVectorName(target, 'main');
                transformData.translateX = target.x.toString();
                transformData.translateY = target.y.toString();
            }
            if (target.clipRegion !== '') {
                this.createClipPath(target, clipMain, target.clipRegion);
            }
            if (clipMain.length || Object.keys(transformData).length) {
                Object.assign(groupMain, transformData);
                result.push(groupMain);
            }
            if (target !== this.SVG_INSTANCE) {
                const baseData = {};
                const [transforms] = groupTransforms(target.element, target.transforms, true);
                const groupName = getVectorName(target, 'animate');
                if (($SvgBuild.asG(target) || $SvgBuild.asUseSymbol(target)) && isString$4(target.clipPath) && this.createClipPath(target, clipBox, target.clipPath)) {
                    baseData.name = groupName;
                }
                if (this.queueAnimations(target, groupName, item => $SvgBuild.asAnimateTransform(item))) {
                    baseData.name = groupName;
                }
                if (Object.keys(baseData).length) {
                    Object.assign(groupBox, baseData);
                    result.push(groupBox);
                }
                if (transforms.length) {
                    let transformed = [];
                    for (const data of transforms) {
                        result.push(createTransformData(data));
                        transformed = transformed.concat(data);
                    }
                    target.transformed = transformed.reverse();
                }
            }
            return result;
        }
        createPath(target, path) {
            const precision = this.options.floatPrecisionValue;
            const result = { name: target.name };
            const renderData = [];
            const clipElement = [];
            if ($SvgBuild.asUse(target) && isString$4(target.clipPath)) {
                this.createClipPath(target, clipElement, target.clipPath);
            }
            if (isString$4(path.clipPath)) {
                const shape = new $SvgShape(path.element);
                shape.build({
                    exclude: this.options.transformExclude,
                    residual: partitionTransforms,
                    precision
                });
                shape.synchronize({
                    keyTimeMode: this.SYNCHRONIZE_MODE,
                    precision
                });
                this.createClipPath(shape, clipElement, path.clipPath);
            }
            const baseData = {};
            const groupName = getVectorName(target, 'group');
            if (this.queueAnimations(target, groupName, item => $SvgBuild.isAnimateTransform(item), '', target.name)) {
                baseData.name = groupName;
            }
            else if (clipElement.length) {
                baseData.name = '';
            }
            if ($SvgBuild.asUse(target) && (target.x !== 0 || target.y !== 0)) {
                baseData.translateX = target.x.toString();
                baseData.translateY = target.y.toString();
            }
            if (clipElement.length) {
                baseData['clip-path'] = clipElement;
            }
            if (Object.keys(baseData).length) {
                renderData.push(baseData);
            }
            if (path.transformResidual) {
                for (const item of path.transformResidual) {
                    renderData.push(createTransformData(item));
                }
            }
            const opacity = getOuterOpacity(target);
            const useTarget = $SvgBuild.asUse(target);
            for (let attr of PATH_ATTRIBUTES) {
                let value = useTarget && target[attr] || path[attr];
                if (value) {
                    switch (attr) {
                        case 'name':
                            break;
                        case 'value':
                            attr = 'pathData';
                            break;
                        case 'fill':
                            attr = 'fillColor';
                            if (value !== 'none' && result['aapt:attr'] === undefined) {
                                const colorName = Resource.addColor(value);
                                if (colorName !== '') {
                                    value = '@color/' + colorName;
                                }
                            }
                            else {
                                continue;
                            }
                            break;
                        case 'stroke':
                            attr = 'strokeColor';
                            if (value !== 'none') {
                                const colorName = Resource.addColor(value);
                                if (colorName !== '') {
                                    value = '@color/' + colorName;
                                }
                            }
                            else {
                                continue;
                            }
                            break;
                        case 'fillPattern':
                            const definition = this.SVG_INSTANCE.definitions.gradient.get(value);
                            let valid = false;
                            if (definition) {
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
                                        const gradient = createFillGradient(definition, path, precision);
                                        if (gradient) {
                                            value = {
                                                name: 'android:fillColor',
                                                gradient
                                            };
                                            valid = true;
                                        }
                                        break;
                                    }
                                }
                            }
                            if (valid) {
                                attr = 'aapt:attr';
                                result.fillColor = '';
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
            }
            else if (!result.strokeColor) {
                result.strokeWidth = '';
            }
            const fillReplaceMap = new Map();
            const transformResult = [];
            const replaceResult = [];
            const pathData = path.value;
            let previousPathData = pathData;
            let index = 0;
            for (const item of target.animations) {
                if ($SvgBuild.asAnimateTransform(item) && !item.additiveSum && item.transformFrom) {
                    let time = Math.max(0, item.delay - 1);
                    fillReplaceMap.set(time, {
                        index,
                        time,
                        to: item.transformFrom,
                        reset: false,
                        animate: item
                    });
                    if (item.iterationCount !== -1 && item.fillReplace) {
                        time = item.delay + item.iterationCount * item.duration;
                        if (!fillReplaceMap.has(time)) {
                            fillReplaceMap.set(time, {
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
            const replaceData = Array.from(fillReplaceMap.values()).sort((a, b) => a.time < b.time ? -1 : 1);
            const lengthA = replaceData.length;
            for (let i = 0; i < lengthA; i++) {
                const item = replaceData[i];
                if (!item.reset || item.to !== previousPathData) {
                    let valid = true;
                    if (item.reset) {
                        invalid: {
                            for (let j = 0; j < i; j++) {
                                const previous = replaceData[j];
                                if (!previous.reset) {
                                    for (let k = i + 1; k < lengthA; k++) {
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
                        const lengthB = itemTotal.length;
                        for (let j = 0; j < lengthB; j++) {
                            if (itemTotal[j] === 1) {
                                const transform = replaceData.find(data => data.index === j && data.animate !== undefined);
                                if (transform) {
                                    const animate = transform.animate;
                                    if (animate) {
                                        previousType.add(animate.type);
                                    }
                                }
                            }
                        }
                        for (const type of previousType) {
                            const propertyName = getTransformPropertyName(type);
                            if (propertyName) {
                                const initialValue = TRANSFORM.typeAsValue(type).split(' ');
                                const lengthC = initialValue.length;
                                for (let j = 0; j < lengthC; j++) {
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
            if (!this.queueAnimations(target, result.name, item => ($SvgBuild.asAnimate(item) || $SvgBuild.asSet(item)) && item.attributeName !== 'clip-path', pathData) && replaceResult.length === 0) {
                if (baseData.name !== groupName) {
                    result.name = '';
                }
            }
            const ANIMATE_DATA = this.ANIMATE_DATA;
            if (transformResult.length) {
                const data = ANIMATE_DATA.get(groupName);
                if (data) {
                    data.animate = data.animate.concat(transformResult);
                }
            }
            if (replaceResult.length) {
                const data = ANIMATE_DATA.get(result.name);
                if (data) {
                    data.animate = data.animate.concat(replaceResult);
                }
                else {
                    ANIMATE_DATA.set(result.name, {
                        element: target.element,
                        animate: replaceResult,
                        pathData
                    });
                }
            }
            return [result, renderData];
        }
        createClipPath(target, clipArray, clipPath) {
            const definitions = this.SVG_INSTANCE.definitions;
            const options = this.options;
            const precision = options.floatPrecisionValue;
            let result = 0;
            clipPath.split(';').forEach((value, index, array) => {
                if (value.charAt(0) === '#') {
                    const element = definitions.clipPath.get(value);
                    if (element) {
                        const g = new $SvgG(element);
                        g.build({
                            exclude: options.transformExclude,
                            residual: partitionTransforms,
                            precision
                        });
                        g.synchronize({
                            keyTimeMode: this.SYNCHRONIZE_MODE,
                            precision
                        });
                        g.each((child) => {
                            const path = child.path;
                            if (path) {
                                const pathData = path.value;
                                if (pathData) {
                                    let name = getVectorName(child, 'clip_path', array.length > 1 ? index + 1 : -1);
                                    if (!this.queueAnimations(child, name, item => $SvgBuild.asAnimate(item) || $SvgBuild.asSet(item), pathData)) {
                                        name = '';
                                    }
                                    clipArray.push({ name, pathData });
                                }
                            }
                        });
                    }
                    result++;
                }
                else {
                    let name = getVectorName(target, 'clip_path', array.length > 1 ? index + 1 : -1);
                    if (!this.queueAnimations(target, name, item => ($SvgBuild.asAnimate(item) || $SvgBuild.asSet(item)) && item.attributeName === 'clip-path', value)) {
                        name = '';
                    }
                    clipArray.push({ name, pathData: value });
                    result++;
                }
            });
            return result > 0;
        }
        queueAnimations(svg, name, predicate, pathData = '', targetName) {
            if (svg.animations.length) {
                const animate = filterArray$2(svg.animations, (item, index, array) => !item.paused && (item.duration >= 0 || item.setterType) && predicate(item, index, array));
                if (animate.length) {
                    const element = svg.element;
                    this.ANIMATE_DATA.set(name, {
                        element,
                        animate,
                        pathData
                    });
                    if (targetName) {
                        this.ANIMATE_TARGET.set(targetName, {
                            element,
                            animate,
                            pathData
                        });
                    }
                    return true;
                }
            }
            return false;
        }
        createPropertyValue(propertyName, valueTo, duration, valueType, valueFrom = '', startOffset = '', repeatCount = '0') {
            const floatPrecisionValue = this.options.floatPrecisionValue;
            return {
                propertyName,
                startOffset,
                duration,
                repeatCount,
                valueType,
                valueFrom: isNumber$2(valueFrom) ? truncate$6(valueFrom, floatPrecisionValue) : valueFrom,
                valueTo: isNumber$2(valueTo) ? truncate$6(valueTo, floatPrecisionValue) : valueTo,
                propertyValuesHolder: false
            };
        }
    }

    const settings = {
        builtInExtensions: [
            'android.delegate.max-width-height',
            'android.delegate.fixed',
            'android.delegate.negative-x',
            'android.delegate.negative-viewport',
            'android.delegate.percent',
            'android.delegate.scrollbar',
            'android.delegate.background',
            'android.delegate.radiogroup',
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
            'android.resource.svg',
            'android.resource.background',
            'android.resource.strings',
            'android.resource.fonts',
            'android.resource.dimens',
            'android.resource.styles',
            'android.resource.includes'
        ],
        targetAPI: 29,
        resolutionDPI: 160,
        framesPerSecond: 60,
        supportRTL: true,
        preloadImages: true,
        supportNegativeLeftTop: true,
        exclusionsDisabled: false,
        customizationsOverwritePrivilege: true,
        showAttributes: true,
        createQuerySelectorMap: false,
        convertPixels: 'dp',
        insertSpaces: 4,
        handleExtensionsAsync: true,
        autoCloseOnWrite: true,
        showErrorMessages: true,
        manifestLabelAppName: 'android',
        manifestThemeName: 'AppTheme',
        manifestParentThemeName: 'Theme.AppCompat.Light.NoActionBar',
        outputMainFileName: 'activity_main.xml',
        outputDirectory: 'app/src/main',
        outputArchiveName: 'android-xml',
        outputArchiveFormat: 'zip',
        outputArchiveTimeout: 30
    };

    const $lib$h = squared.base.lib;
    const framework = 2 /* ANDROID */;
    let initialized = false;
    let application;
    let file;
    let userSettings;
    function autoClose() {
        if (initialized && !application.initializing && !application.closed && application.userSettings.autoCloseOnWrite) {
            application.finalize();
            return true;
        }
        return false;
    }
    const checkApplication = (main) => initialized && (main.closed || autoClose());
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
                Background: Background,
                Fixed: Fixed,
                MaxWidthHeight: MaxWidthHeight,
                NegativeViewport: NegativeViewport,
                NegativeX: NegativeX,
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
                    if (assign[widget]) {
                        Object.assign(assign[widget], options);
                    }
                    else {
                        assign[widget] = options;
                    }
                    return assign[widget];
                }
                return undefined;
            },
            addXmlNs(name, uri) {
                XMLNS_ANDROID[name] = uri;
            },
            copyLayoutAllXml(directory, callback) {
                if (checkApplication(application)) {
                    file.layoutAllToXml({ assets: application.layouts, copyTo: directory, callback });
                }
            },
            copyResourceAllXml(directory, callback) {
                if (checkApplication(application)) {
                    file.resourceAllToXml({ copyTo: directory, callback });
                }
            },
            copyResourceStringXml(directory, callback) {
                if (checkApplication(application)) {
                    file.resourceStringToXml({ copyTo: directory, callback });
                }
            },
            copyResourceArrayXml(directory, callback) {
                if (checkApplication(application)) {
                    file.resourceStringArrayToXml({ copyTo: directory, callback });
                }
            },
            copyResourceFontXml(directory, callback) {
                if (checkApplication(application)) {
                    file.resourceFontToXml({ copyTo: directory, callback });
                }
            },
            copyResourceColorXml(directory, callback) {
                if (checkApplication(application)) {
                    file.resourceColorToXml({ copyTo: directory, callback });
                }
            },
            copyResourceStyleXml(directory, callback) {
                if (checkApplication(application)) {
                    file.resourceStyleToXml({ copyTo: directory, callback });
                }
            },
            copyResourceDimenXml(directory, callback) {
                if (checkApplication(application)) {
                    file.resourceDimenToXml({ copyTo: directory, callback });
                }
            },
            copyResourceDrawableXml(directory, callback) {
                if (checkApplication(application)) {
                    file.resourceDrawableToXml({ copyTo: directory, callback });
                }
            },
            copyResourceDrawableImageXml(directory, callback) {
                if (checkApplication(application)) {
                    file.resourceDrawableImageToXml({ copyTo: directory, callback });
                }
            },
            copyResourceAnimXml(directory, callback) {
                if (checkApplication(application)) {
                    file.resourceAnimToXml({ copyTo: directory, callback });
                }
            },
            saveLayoutAllXml(filename) {
                if (checkApplication(application)) {
                    file.layoutAllToXml({ assets: application.layouts, archiveTo: filename || userSettings.outputArchiveName + '-layouts' });
                }
            },
            saveResourceAllXml(filename) {
                if (checkApplication(application)) {
                    file.resourceAllToXml({ archiveTo: filename || userSettings.outputArchiveName + '-resources' });
                }
            },
            saveResourceStringXml(filename) {
                if (checkApplication(application)) {
                    file.resourceStringToXml({ archiveTo: filename || userSettings.outputArchiveName + '-string' });
                }
            },
            saveResourceArrayXml(filename) {
                if (checkApplication(application)) {
                    file.resourceStringArrayToXml({ archiveTo: filename || userSettings.outputArchiveName + '-array' });
                }
            },
            saveResourceFontXml(filename) {
                if (checkApplication(application)) {
                    file.resourceFontToXml({ archiveTo: filename || userSettings.outputArchiveName + '-font' });
                }
            },
            saveResourceColorXml(filename) {
                if (checkApplication(application)) {
                    file.resourceColorToXml({ archiveTo: filename || userSettings.outputArchiveName + '-color' });
                }
            },
            saveResourceStyleXml(filename) {
                if (checkApplication(application)) {
                    file.resourceStyleToXml({ archiveTo: filename || userSettings.outputArchiveName + '-style' });
                }
            },
            saveResourceDimenXml(filename) {
                if (checkApplication(application)) {
                    file.resourceDimenToXml({ archiveTo: filename || userSettings.outputArchiveName + '-dimen' });
                }
            },
            saveResourceDrawableXml(filename) {
                if (checkApplication(application)) {
                    file.resourceDrawableToXml({ archiveTo: filename || userSettings.outputArchiveName + '-drawable' });
                }
            },
            saveResourceDrawableImageXml(filename) {
                if (checkApplication(application)) {
                    file.resourceDrawableImageToXml({ archiveTo: filename || userSettings.outputArchiveName + '-drawable-image' });
                }
            },
            saveResourceAnimXml(filename) {
                if (checkApplication(application)) {
                    file.resourceAnimToXml({ archiveTo: filename || userSettings.outputArchiveName + '-anim' });
                }
            },
            writeLayoutAllXml() {
                if (checkApplication(application)) {
                    return file.layoutAllToXml({ assets: application.layouts });
                }
                return {};
            },
            writeResourceAllXml() {
                if (checkApplication(application)) {
                    return file.resourceAllToXml();
                }
                return {};
            },
            writeResourceStringXml() {
                if (checkApplication(application)) {
                    return file.resourceStringToXml();
                }
                return [];
            },
            writeResourceArrayXml() {
                if (checkApplication(application)) {
                    return file.resourceStringArrayToXml();
                }
                return [];
            },
            writeResourceFontXml() {
                if (checkApplication(application)) {
                    return file.resourceFontToXml();
                }
                return [];
            },
            writeResourceColorXml() {
                if (checkApplication(application)) {
                    return file.resourceColorToXml();
                }
                return [];
            },
            writeResourceStyleXml() {
                if (checkApplication(application)) {
                    return file.resourceStyleToXml();
                }
                return [];
            },
            writeResourceDimenXml() {
                if (checkApplication(application)) {
                    return file.resourceDimenToXml();
                }
                return [];
            },
            writeResourceDrawableXml() {
                if (checkApplication(application)) {
                    return file.resourceDrawableToXml();
                }
                return [];
            },
            writeResourceDrawableImageXml() {
                if (checkApplication(application)) {
                    return file.resourceDrawableImageToXml();
                }
                return [];
            },
            writeResourceAnimXml() {
                if (checkApplication(application)) {
                    return file.resourceAnimToXml();
                }
                return [];
            }
        },
        create() {
            const EN = $lib$h.constant.EXT_NAME;
            const EA = EXT_ANDROID;
            application = new Application(framework, View, Controller, Resource, ExtensionManager);
            file = new File();
            application.resourceHandler.setFileHandler(file);
            userSettings = Object.assign({}, settings);
            Object.assign(application.builtInExtensions, {
                [EN.SPRITE]: new Sprite(EN.SPRITE, framework),
                [EN.CSS_GRID]: new CssGrid(EN.CSS_GRID, framework),
                [EN.FLEXBOX]: new Flexbox(EN.FLEXBOX, framework),
                [EN.TABLE]: new Table(EN.TABLE, framework, undefined, ['TABLE']),
                [EN.LIST]: new List(EN.LIST, framework, undefined, ['DIV', 'UL', 'OL', 'DL']),
                [EN.GRID]: new Grid(EN.GRID, framework, undefined, ['DIV', 'FORM', 'UL', 'OL', 'DL', 'NAV', 'SECTION', 'ASIDE', 'MAIN', 'HEADER', 'FOOTER', 'P', 'ARTICLE', 'FIELDSET']),
                [EN.RELATIVE]: new Relative(EN.RELATIVE, framework),
                [EN.VERTICAL_ALIGN]: new VerticalAlign(EN.VERTICAL_ALIGN, framework),
                [EN.WHITESPACE]: new WhiteSpace(EN.WHITESPACE, framework),
                [EN.ACCESSIBILITY]: new Accessibility(EN.ACCESSIBILITY, framework),
                [EA.EXTERNAL]: new External(EA.EXTERNAL, framework),
                [EA.SUBSTITUTE]: new Substitute(EA.SUBSTITUTE, framework),
                [EA.CONSTRAINT_GUIDELINE]: new Guideline(EA.CONSTRAINT_GUIDELINE, framework),
                [EA.DELEGATE_BACKGROUND]: new Background(EA.DELEGATE_BACKGROUND, framework),
                [EA.DELEGATE_FIXED]: new Fixed(EA.DELEGATE_FIXED, framework),
                [EA.DELEGATE_MAXWIDTHHEIGHT]: new MaxWidthHeight(EA.DELEGATE_MAXWIDTHHEIGHT, framework),
                [EA.DELEGATE_NEGATIVEVIEWPORT]: new NegativeViewport(EA.DELEGATE_NEGATIVEVIEWPORT, framework),
                [EA.DELEGATE_NEGATIVEX]: new NegativeX(EA.DELEGATE_NEGATIVEX, framework),
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
