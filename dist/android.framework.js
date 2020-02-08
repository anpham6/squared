/* android-framework 1.4.1
   https://github.com/anpham6/squared */

var android = (function () {
    'use strict';

    class Application extends squared.base.ApplicationUI {
    }

    var CONTAINER_NODE;
    (function (CONTAINER_NODE) {
        CONTAINER_NODE[CONTAINER_NODE["RADIO"] = 1] = "RADIO";
        CONTAINER_NODE[CONTAINER_NODE["CHECKBOX"] = 2] = "CHECKBOX";
        CONTAINER_NODE[CONTAINER_NODE["SELECT"] = 3] = "SELECT";
        CONTAINER_NODE[CONTAINER_NODE["SVG"] = 4] = "SVG";
        CONTAINER_NODE[CONTAINER_NODE["IMAGE"] = 5] = "IMAGE";
        CONTAINER_NODE[CONTAINER_NODE["BUTTON"] = 6] = "BUTTON";
        CONTAINER_NODE[CONTAINER_NODE["PROGRESS"] = 7] = "PROGRESS";
        CONTAINER_NODE[CONTAINER_NODE["RANGE"] = 8] = "RANGE";
        CONTAINER_NODE[CONTAINER_NODE["EDIT"] = 9] = "EDIT";
        CONTAINER_NODE[CONTAINER_NODE["TEXT"] = 10] = "TEXT";
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
        DELEGATE_CSS_GRID: 'android.delegate.css-grid',
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
    const { CHAR, COMPONENT, CSS, FILE, XML } = $lib.regex;
    const { fromLastIndexOf, isNumber, isPlainObject, isString, resolvePath, spliceArray, trimString } = $lib.util;
    const STORED = squared.base.ResourceUI.STORED;
    const REGEX_NONWORD = /[^\w+]/g;
    let CACHE_IMAGE = {};
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
                                if (/^@string\//.test(value)) {
                                    continue;
                                }
                                value = Resource.addString(value, '', numberAlias);
                                if (value !== '') {
                                    obj[attr] = '@string/' + value;
                                }
                                break;
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
            this._imageFormat = spliceArray(this.controllerSettings.supported.imageFormat.slice(0), value => value === 'svg');
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
                const format = fromLastIndexOf(src, '.').toLowerCase();
                if (imageFormat === undefined || imageFormat.includes(format)) {
                    const asset = Resource.insertStoredAsset('images', Resource.formatName(prefix + src.substring(0, src.length - format.length - 1)), images);
                    CACHE_IMAGE[mdpi] = asset;
                    return asset;
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
            const result = {};
            let mdpi;
            if (typeof element === 'string') {
                const match = CSS.URL.exec(element);
                if (match) {
                    mdpi = match[1];
                    if (!/^data:image/.test(mdpi)) {
                        return this.addImageSet({ mdpi: resolvePath(mdpi) }, prefix);
                    }
                }
            }
            else {
                if (element.srcset) {
                    if (imageSet === undefined) {
                        imageSet = getSrcSet(element, this._imageFormat);
                    }
                    for (const image of imageSet) {
                        const pixelRatio = image.pixelRatio;
                        if (pixelRatio > 0) {
                            const src = image.src;
                            if (pixelRatio < 1) {
                                result.ldpi = src;
                            }
                            else if (pixelRatio === 1) {
                                if (mdpi === undefined || image.actualWidth) {
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
                if (mdpi === undefined) {
                    mdpi = element.src;
                }
            }
            if (mdpi) {
                result.mdpi = mdpi;
                const resource = this.application.resourceHandler;
                const rawData = resource.getRawData(mdpi);
                if (rawData) {
                    const { base64, filename } = rawData;
                    if (base64) {
                        if (FILE.SVG.test(filename)) {
                            return '';
                        }
                        const pathname = prefix + filename;
                        resource.writeRawImage(pathname, base64);
                        return pathname.substring(0, pathname.lastIndexOf('.'));
                    }
                }
            }
            return this.addImageSet(result, prefix);
        }
        addImageSet(images, prefix) {
            return Resource.addImage(images, prefix, this._imageFormat);
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
    function calculateBias(start, end, accuracy = 3) {
        if (start === 0) {
            return 0;
        }
        else if (end === 0) {
            return 1;
        }
        else {
            return parseFloat(truncate(Math.max(start / (start + end), 0), accuracy));
        }
    }
    function convertLength(value, font = false, precision = 3) {
        if (typeof value === 'string') {
            value = parseFloat(value) || 0;
        }
        return !font ? Math.round(value) + 'dp' : truncate(value, precision) + 'sp';
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
    function createViewAttribute(data, options) {
        if (options === undefined) {
            options = { android: {} };
        }
        else if (options.android === undefined) {
            options.android = {};
        }
        if (data) {
            const { android, app } = data;
            if (android) {
                Object.assign(options.android, android);
            }
            if (app) {
                if (options.app === undefined) {
                    options.app = {};
                }
                Object.assign(options.app, app);
            }
        }
        return options;
    }
    function createStyleAttribute(data) {
        const result = {
            output: {
                path: 'res/values',
                file: ''
            },
            name: '',
            parent: '',
            items: {}
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
    function localizeString(value, rtl, api) {
        return rtl && api >= 17 /* JELLYBEAN_1 */ && LOCALIZE_ANDROID[value] || value;
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
    const { Node, ResourceUI } = squared.base;
    const { BOX_MARGIN, BOX_PADDING, formatPX, getDataSet, isLength, isPercent } = $lib$2.css;
    const { getNamedItem } = $lib$2.dom;
    const { clampRange, truncate: truncate$1 } = $lib$2.math;
    const { CHAR: CHAR$1 } = $lib$2.regex;
    const { aboveRange, capitalize, convertFloat, convertWord, fromLastIndexOf: fromLastIndexOf$1, isNumber: isNumber$1, isPlainObject: isPlainObject$2, isString: isString$2, replaceMap, withinRange } = $lib$2.util;
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
        if (autoMargin.horizontal && (!node.blockWidth || node.hasWidth || node.hasPX('maxWidth') || node.innerMostWrapped.has('width', 4 /* PERCENT */, { not: '100%' }))) {
            node.mergeGravity((node.blockWidth || !node.pageFlow) && node.outerWrapper === undefined ? 'gravity' : 'layout_gravity', autoMargin.leftRight ? STRING_ANDROID.CENTER_HORIZONTAL : (autoMargin.left ? 'right' : 'left'));
            return true;
        }
        return false;
    }
    function setMultiline(node, lineHeight, overwrite, autoPadding) {
        if (node.api >= 28 /* PIE */) {
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
                const offset = (lineHeight - (node.textBounds || node.boundingClientRect).height) / 2;
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
        if (node.imageOrSvgElement || node.baselineAltered && !node.multiline || node.actualHeight === 0 || node.cssInitial('lineHeight') === 'initial') {
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
                if (!inlineStyle && node.inlineText && node.styleElement && !node.hasPX('height') && node.cssTry('line-height', 'normal')) {
                    if (node.cssTry('white-space', 'nowrap')) {
                        offset = (lineHeight - (node.textBounds || node.boundingClientRect).height) / 2;
                        usePadding = false;
                        node.cssFinally('white-space');
                    }
                    node.cssFinally('line-height');
                }
                else {
                    const height = node.bounds.height;
                    if (node.plainText) {
                        const numberOfLines = node.bounds.numberOfLines;
                        if (numberOfLines > 1) {
                            node.android('minHeight', formatPX(height / numberOfLines));
                            node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
                            return;
                        }
                    }
                    offset = (lineHeight - height) / 2;
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
            return !!renderParent && (renderParent.layoutConstraint || renderParent.layoutGrid);
        }
        return false;
    }
    function checkMergableGravity(value, direction) {
        const horizontal = value + '_horizontal';
        const vertical = value + '_vertical';
        if (direction.has(value) || direction.has(horizontal) && direction.has(vertical)) {
            direction.delete(horizontal);
            direction.delete(vertical);
            direction.add(value);
        }
    }
    const excludeHorizontal = (node) => node.textEmpty && (node.bounds.width === 0 && node.contentBoxWidth === 0 && node.marginLeft <= 0 && node.marginRight <= 0 && !node.visibleStyle.background || node.bounds.height === 0 && node.contentBoxHeight === 0 && node.marginTop <= 0 && node.marginBottom <= 0);
    const excludeVertical = (node) => node.contentBoxHeight === 0 && (node.bounds.height === 0 || node.pseudoElement && node.textEmpty) && (node.marginTop <= 0 && node.marginBottom <= 0 || node.css('overflow') === 'hidden' && CHAR$1.UNITZERO.test(node.css('height')));
    const LAYOUT_RELATIVE_PARENT = LAYOUT_ANDROID.relativeParent;
    const LAYOUT_RELATIVE = LAYOUT_ANDROID.relative;
    const LAYOUT_CONSTRAINT = LAYOUT_ANDROID.constraint;
    const DEPRECATED = DEPRECATED_ANDROID.android;
    var View$MX = (Base) => {
        return class View extends Base {
            constructor(id = 0, sessionId = '0', element, afterInit) {
                super(id, sessionId, element);
                this.api = 29 /* LATEST */;
                this.renderChildren = [];
                this.constraint = {
                    horizontal: false,
                    vertical: false,
                    current: {}
                };
                this._namespaces = ['android', 'app'];
                this._cached = {};
                this._controlName = '';
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
                return api >= 29 /* Q */ && CONTAINER_ANDROID_X[name] || CONTAINER_ANDROID[name];
            }
            static availablePercent(nodes, dimension, boxSize) {
                let percent = 1;
                let i = 0;
                for (const sibling of nodes) {
                    if (sibling.pageFlow) {
                        i++;
                        if (sibling[dimension] > 0) {
                            const value = sibling.cssInitial(dimension);
                            if (isPercent(value)) {
                                percent -= parseFloat(value) / 100;
                                continue;
                            }
                            else if (isLength(value)) {
                                percent -= sibling.parseUnit(value, dimension) / boxSize;
                                continue;
                            }
                        }
                        percent -= sibling.bounds[dimension] / boxSize;
                    }
                }
                return i > 0 ? Math.max(0, percent) : 1;
            }
            static ascendFlexibleWidth(node) {
                if (node.documentRoot && (node.hasWidth || node.blockStatic || node.blockWidth)) {
                    return true;
                }
                let parent = node.renderParent;
                let i = 0;
                while (parent) {
                    if (parent.hasWidth || parseInt(parent.layoutWidth) > 0 || parent.of(CONTAINER_NODE.CONSTRAINT, 64 /* BLOCK */) || parent.documentRoot && (parent.blockWidth || parent.blockStatic)) {
                        return true;
                    }
                    else if (parent.flexibleWidth) {
                        if (++i > 1) {
                            return false;
                        }
                    }
                    else if (parent.inlineWidth || parent.naturalElement && parent.inlineVertical) {
                        return false;
                    }
                    parent = parent.renderParent;
                }
                return false;
            }
            static ascendFlexibleHeight(node) {
                var _a;
                if (node.documentRoot && node.hasHeight) {
                    return true;
                }
                const parent = node.renderParent;
                return !!parent && (parent.hasHeight || parent.layoutConstraint && parent.blockHeight) || ((_a = node.absoluteParent) === null || _a === void 0 ? void 0 : _a.hasHeight) === true;
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
                        if (overwrite || !node.constraint[orientation]) {
                            if (horizontal) {
                                node.anchor('left', 'parent', overwrite);
                                node.anchor('right', 'parent', overwrite);
                                node.constraint.horizontal = true;
                            }
                            else {
                                node.anchor('top', 'parent', overwrite);
                                node.anchor('bottom', 'parent', overwrite);
                                node.constraint.vertical = true;
                            }
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
                            let attr = LAYOUT_RELATIVE[value];
                            if (attr) {
                                node.delete('android', attr, this.localizeString(attr));
                            }
                            attr = LAYOUT_RELATIVE_PARENT[value];
                            if (attr) {
                                node.delete('android', attr, this.localizeString(attr));
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
                    const valid = DEPRECATED[attr](result, this.api, this);
                    if (!valid || Object.keys(result).length) {
                        return valid;
                    }
                }
                for (let i = this.api; i <= 29 /* LATEST */; i++) {
                    const callback = (_a = API_ANDROID[i]) === null || _a === void 0 ? void 0 : _a.android[attr];
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
                                    if (this.api < 29 /* LATEST */) {
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
                return localizeString(value, this._localization, this.api);
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
                node.unsafe('localization', this._localization);
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
                node.saveAsInitial(true);
                return node;
            }
            setControlType(controlName, containerType) {
                this.controlName = controlName;
                if (containerType) {
                    this.containerType = containerType;
                }
                else if (this.containerType === 0) {
                    this.containerType = CONTAINER_NODE.UNKNOWN;
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
                const actualParent = this.actualParent || this.documentParent;
                const renderParent = this.renderParent;
                const maxDimension = this.support.maxDimension;
                let adjustViewBounds = false;
                if (this.documentBody) {
                    const fixedContainer = renderParent.id === 0 && this.renderChildren.some(node => !node.pageFlow && node.css('position') === 'fixed');
                    if (fixedContainer || this.css('width') === '100%' || this.css('minWidth') === '100%' || this.blockStatic && !this.hasPX('width') && !this.hasPX('maxWidth')) {
                        this.setLayoutWidth('match_parent', false);
                    }
                    if (fixedContainer || this.css('height') === '100%' || this.css('minHeight') === '100%') {
                        this.setLayoutHeight('match_parent', false);
                    }
                }
                if (this.layoutWidth === '') {
                    let layoutWidth = '';
                    if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                        const width = this.css('width');
                        let value = 0;
                        if (isPercent(width)) {
                            if (this.inputElement) {
                                if (width === '100%' && !renderParent.inlineWidth) {
                                    layoutWidth = 'match_parent';
                                }
                                else {
                                    value = this.bounds.width;
                                }
                            }
                            else if (renderParent.layoutConstraint && !renderParent.hasPX('width', false)) {
                                if (width === '100%') {
                                    layoutWidth = 'match_parent';
                                }
                                else {
                                    const percent = Math.min((parseFloat(width) / 100) + this.contentBoxWidthPercent, 1);
                                    this.app('layout_constraintWidth_percent', truncate$1(percent, this.localSettings.floatPrecision));
                                    layoutWidth = percent === 1 ? 'match_parent' : '0px';
                                }
                                adjustViewBounds = true;
                            }
                            else if (renderParent.layoutGrid) {
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
                                if (!maxDimension && this.hasPX('maxWidth')) {
                                    const maxWidth = this.css('maxWidth');
                                    const maxValue = this.parseUnit(maxWidth);
                                    const absoluteParent = this.absoluteParent || actualParent;
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
                        else {
                            value = this.actualWidth;
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
                            case 'min-content': {
                                const nodes = [];
                                let maxWidth = 0;
                                for (const node of this.renderChildren) {
                                    if (!node.textElement || node.hasPX('width')) {
                                        maxWidth = Math.max(node.actualWidth, maxWidth);
                                    }
                                    else {
                                        maxWidth = Math.max(node.width, maxWidth);
                                        if (node.support.maxDimension) {
                                            nodes.push(node);
                                        }
                                    }
                                }
                                if (maxWidth > 0 && nodes.length) {
                                    const widthPX = formatPX(maxWidth);
                                    for (const node of nodes) {
                                        if (!node.hasPX('maxWidth')) {
                                            node.css('maxWidth', widthPX);
                                        }
                                    }
                                }
                                layoutWidth = 'wrap_content';
                                break;
                            }
                        }
                    }
                    if (layoutWidth === '') {
                        if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                            layoutWidth = formatPX(this.actualWidth);
                        }
                        else if (this.imageElement && this.hasPX('height')) {
                            layoutWidth = 'wrap_content';
                            adjustViewBounds = true;
                        }
                        else {
                            const checkParentWidth = () => {
                                let parent = renderParent;
                                do {
                                    if (!parent.blockWidth) {
                                        if (!parent.inlineWidth) {
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
                                    else if (parent.documentBody) {
                                        break;
                                    }
                                    parent = parent.renderParent;
                                } while (parent);
                                if (renderParent.layoutVertical || renderParent.layoutFrame || !renderParent.inlineWidth && this.onlyChild || (renderParent.layoutRelative || renderParent.layoutConstraint) && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '') {
                                    layoutWidth = 'match_parent';
                                }
                            };
                            if (this.blockStatic && !this.inputElement && !renderParent.layoutGrid) {
                                if (!actualParent.layoutElement) {
                                    if (this.nodeGroup || this.hasAlign(64 /* BLOCK */)) {
                                        layoutWidth = 'match_parent';
                                    }
                                    else {
                                        checkParentWidth();
                                    }
                                }
                                else if (this.layoutElement && this.onlyChild) {
                                    layoutWidth = renderParent.inlineWidth ? 'wrap_content' : 'match_parent';
                                }
                            }
                            if (layoutWidth === '') {
                                if (this.naturalElement && this.inlineStatic && !this.blockDimension && !actualParent.layoutElement && this.some(item => item.naturalElement && item.blockStatic)) {
                                    checkParentWidth();
                                }
                                else if (this.layoutGrid && !this.hasWidth && this.some((node) => node.flexibleWidth)) {
                                    if (renderParent.inlineWidth) {
                                        this.css('minWidth', formatPX(this.actualWidth));
                                    }
                                    else {
                                        layoutWidth = 'match_parent';
                                    }
                                }
                                else if (renderParent.layoutFrame && !renderParent.inlineWidth && !this.naturalChild && this.layoutVertical && this.rightAligned) {
                                    layoutWidth = 'match_parent';
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
                        let value = 0;
                        if (isPercent(height)) {
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
                                    const absoluteParent = this.absoluteParent || actualParent;
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
                        else {
                            value = this.actualHeight;
                        }
                        if (value > 0) {
                            if (this.is(CONTAINER_NODE.LINE) && this.tagName !== 'HR' && this.hasPX('height', true, true)) {
                                value += this.borderTopWidth + this.borderBottomWidth;
                            }
                            layoutHeight = formatPX(value);
                        }
                    }
                    if (layoutHeight === '') {
                        if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                            if (renderParent.layoutConstraint && !this.floating && this.alignParent('top') && this.actualHeight >= (this.absoluteParent || actualParent).box.height) {
                                layoutHeight = '0px';
                                this.anchor('bottom', 'parent');
                            }
                            else if (this.naturalChild) {
                                layoutHeight = formatPX(this.actualHeight);
                            }
                        }
                        else if (this.imageElement && this.hasPX('width')) {
                            layoutHeight = 'wrap_content';
                            adjustViewBounds = true;
                        }
                        else if (this.display === 'table-cell') {
                            layoutHeight = 'match_parent';
                        }
                    }
                    this.setLayoutHeight(layoutHeight || 'wrap_content');
                }
                else if (layoutHeight === '0px' && renderParent.inlineHeight && renderParent.android('minHeight') === '' && !actualParent.layoutElement) {
                    this.setLayoutHeight('wrap_content');
                }
                if (this.hasPX('minWidth') && (!Node.isFlexDirection(this, 'row') || actualParent.flexElement && !this.flexibleWidth)) {
                    this.android('minWidth', formatPX(this.parseUnit(this.css('minWidth')) + (!actualParent.gridElement ? this.contentBoxWidth : 0)), false);
                }
                if (this.hasPX('minHeight') && this.display !== 'table-cell' && (!Node.isFlexDirection(this, 'column') || actualParent.flexElement && !this.flexibleHeight)) {
                    this.android('minHeight', formatPX(this.parseUnit(this.css('minHeight'), 'height') + (!actualParent.gridElement ? this.contentBoxHeight : 0)), false);
                }
                if (maxDimension) {
                    const maxWidth = this.css('maxWidth');
                    let maxHeight = this.css('maxHeight');
                    let width = -1;
                    if (isLength(maxWidth, true)) {
                        if (maxWidth === '100%') {
                            if (this.svgElement) {
                                width = this.bounds.width;
                            }
                            else if (this.imageElement) {
                                width = this.toElementInt('naturalWidth');
                                if (width > this.documentParent.actualWidth) {
                                    this.setLayoutWidth('match_parent');
                                    this.setLayoutHeight('wrap_content');
                                    width = -1;
                                    maxHeight = '';
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
                    else if (!this.pageFlow && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && (this.ascend({ condition: item => item.hasPX('width') }).length || !this.textContent.includes('\n'))) {
                        width = this.bounds.width + this.contentBoxWidth;
                    }
                    if (width >= 0) {
                        this.android('maxWidth', formatPX(width), false);
                        adjustViewBounds = true;
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
                            adjustViewBounds = true;
                        }
                    }
                }
                if (this.imageElement && (adjustViewBounds || this.blockWidth || this.blockHeight)) {
                    this.android('adjustViewBounds', 'true');
                }
            }
            setAlignment() {
                var _a;
                const node = this.outerMostWrapper;
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
                    if (this.inlineVertical && (outerRenderParent.layoutHorizontal && !outerRenderParent.support.positionRelative || outerRenderParent.layoutGrid || this.display === 'table-cell')) {
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
                            else if (!setAutoMargin(node, autoMargin) && textAlign !== '' && this.hasWidth && !this.blockStatic && !this.inputElement && this.display !== 'table') {
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
                    else if (rightAligned && renderParent.blockWidth && ((_a = this.outerWrapper) === null || _a === void 0 ? void 0 : _a.layoutFrame)) {
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
                if (!this.layoutConstraint && !this.layoutFrame && !this.layoutElement && !this.layoutGrid) {
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
                if (autoMargin.vertical && (renderParent.layoutFrame || renderParent.layoutVertical && renderParent.layoutLinear)) {
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
                const stored = this.android(attr);
                const direction = new Set();
                let result = '';
                if (stored !== '') {
                    for (const value of stored.split('|')) {
                        direction.add(value);
                    }
                }
                direction.add(this.localizeString(alignment));
                switch (direction.size) {
                    case 0:
                        break;
                    case 1:
                        result = checkTextAlign(direction.values().next().value, false);
                    default: {
                        checkMergableGravity('center', direction);
                        checkMergableGravity('fill', direction);
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
                        break;
                    }
                }
                if (result !== '') {
                    this.android(attr, result);
                }
            }
            applyOptimizations() {
                const renderParent = this.renderParent;
                if (renderParent) {
                    this.alignLayout(renderParent);
                    this.setLineHeight(renderParent);
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
                const api = API_ANDROID[this.api];
                if (api) {
                    assign = api.assign;
                    setCustomization(assign[tagName]);
                    setCustomization(assign[controlName]);
                }
            }
            setBoxSpacing() {
                const boxReset = this._boxReset;
                const boxAdjustment = this._boxAdjustment;
                const setBoxModel = (attrs, margin, unmergeable) => {
                    var _a;
                    let top = 0;
                    let right = 0;
                    let bottom = 0;
                    let left = 0;
                    for (let i = 0; i < 4; i++) {
                        const attr = attrs[i];
                        let value = boxReset === undefined || boxReset[attr] === 0 ? this[attr] : 0;
                        if (value !== 0) {
                            switch (attr) {
                                case 'marginRight':
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
                                case 'marginBottom':
                                    if (value < 0 && this.pageFlow && !this.blockStatic) {
                                        value = 0;
                                    }
                                    break;
                                case 'paddingTop':
                                    value = this.actualPadding(attr, value);
                                    break;
                                case 'paddingBottom':
                                    if (this.hasPX('height', false, true) && (!this.layoutElement && (this.layoutVertical || this.layoutFrame) || !this.pageFlow) || this.documentParent.gridElement && this.hasPX('height', false)) {
                                        continue;
                                    }
                                    else if (this.floatContainer) {
                                        let maxBottom = Number.NEGATIVE_INFINITY;
                                        for (const item of this.naturalElements) {
                                            if (item.floating) {
                                                maxBottom = Math.max(item.bounds.bottom, maxBottom);
                                            }
                                        }
                                        value = clampRange(this.bounds.bottom - maxBottom, 0, value);
                                    }
                                    else {
                                        value = this.actualPadding(attr, value);
                                    }
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
                    if (margin) {
                        if (this.floating) {
                            let node = this.renderParent.renderChildren.find(item => !item.floating);
                            if (node) {
                                const boundsTop = this.bounds.top;
                                let actualNode;
                                while (node.bounds.top === boundsTop) {
                                    actualNode = node;
                                    const innerWrapped = node.innerWrapped;
                                    if (innerWrapped) {
                                        node = innerWrapped;
                                    }
                                    else {
                                        break;
                                    }
                                }
                                if (actualNode) {
                                    const boxData = actualNode.getBox(2 /* MARGIN_TOP */);
                                    top += (boxData[0] !== 1 ? actualNode.marginTop : 0) + boxData[1];
                                }
                            }
                        }
                        else if (top > 0 && ((_a = this.actualParent) === null || _a === void 0 ? void 0 : _a.floatContainer)) {
                            const renderParent = this.renderParent;
                            if (renderParent.layoutVertical && renderParent.ascend({ condition: (item) => item.hasAlign(512 /* FLOAT */) || item.hasAlign(256 /* COLUMN */), error: (item) => item.naturalChild, attr: 'renderParent' }).length === 0) {
                                const boundsTop = this.bounds.top;
                                const renderChildren = renderParent.renderChildren;
                                let previous;
                                for (const node of this.actualParent.naturalElements) {
                                    if (node.floating && withinRange(node.bounds.top, boundsTop) && !renderChildren.includes(node)) {
                                        if (previous === undefined || !previous.lineBreak && previous.css('clear') === 'none') {
                                            top = Math.max(top - node.bounds.height, 0);
                                        }
                                        break;
                                    }
                                    previous = node;
                                }
                            }
                        }
                        if (this.positionStatic && !this.blockWidth && (left < 0 || right < 0)) {
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
                    }
                    else if (this.visibleStyle.borderWidth && (this.layoutElement || this.contentBox && (this.bounds.height > 0 || this.renderChildren.length === 0 || !this.naturalChildren.every(node => !node.pageFlow && node.absoluteParent === this)) && !this.is(CONTAINER_NODE.LINE))) {
                        top += this.borderTopWidth;
                        right += this.borderRightWidth;
                        bottom += this.borderBottomWidth;
                        left += this.borderLeftWidth;
                    }
                    if (top !== 0 || left !== 0 || bottom !== 0 || right !== 0) {
                        let mergeAll = 0;
                        let mergeHorizontal = 0;
                        let mergeVertical = 0;
                        if (!unmergeable && this.api >= 26 /* OREO */) {
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
                setBoxModel(BOX_MARGIN, true, this.renderParent.layoutGrid);
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
                    if (!this.svgElement) {
                        const opacity = this.css('opacity');
                        if (opacity !== '1' && isNumber$1(opacity)) {
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
            actualRect(direction, dimension = 'linear') {
                var _a;
                let value = this[dimension][direction];
                if (this.positionRelative && this.floating) {
                    switch (direction) {
                        case 'top':
                            if (this.has('top')) {
                                value += this.top;
                            }
                            else {
                                value -= this.bottom;
                            }
                            break;
                        case 'bottom':
                            if (!this.has('top')) {
                                value -= this.bottom;
                            }
                            else {
                                value += this.top;
                            }
                            break;
                        case 'left':
                            if (this.has('left')) {
                                value += this.left;
                            }
                            else {
                                value -= this.right;
                            }
                        case 'right':
                            if (!this.has('left')) {
                                value -= this.right;
                            }
                            else {
                                value += this.left;
                            }
                            break;
                    }
                }
                if (this.inputElement) {
                    const companion = this.companion;
                    if (((_a = companion) === null || _a === void 0 ? void 0 : _a.labelFor) === this && !companion.visible) {
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
            setLayoutWidth(value, overwrite = true) {
                this.android('layout_width', value, overwrite);
            }
            setLayoutHeight(value, overwrite = true) {
                this.android('layout_height', value, overwrite);
            }
            alignLayout(renderParent) {
                if (this.layoutLinear) {
                    const children = this.renderChildren;
                    if (this.layoutVertical) {
                        if (this.baselineElement && !renderParent.layoutFrame && !this.documentRoot) {
                            this.android('baselineAlignedChildIndex', '0');
                        }
                    }
                    else {
                        let baseline = true;
                        if (children.some(node => node.floating) && !children.some(node => node.imageElement && node.baseline)) {
                            this.android('baselineAligned', 'false');
                            baseline = false;
                        }
                        const length = children.length;
                        for (let i = 0; i < length; i++) {
                            const item = children[i];
                            if (i > 0) {
                                item.setSingleLine(i === length - 1);
                            }
                            if (baseline && item.baselineElement) {
                                this.android('baselineAlignedChildIndex', i.toString());
                                baseline = false;
                            }
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
                                        const nextMultiline = !!nextRow && (nextRow.length === 1 && nextRow[0].multiline || nextRow[0].lineBreakLeading || i < length - 1 && ((_a = nextRow.find(node => node.baselineActive)) === null || _a === void 0 ? void 0 : _a.has('lineHeight')));
                                        const first = row[0];
                                        const baseline = row.find(node => node.baselineActive);
                                        const singleLine = row.length === 1 && !first.multiline;
                                        const top = singleLine || !previousMultiline && (i > 0 || length === 1) || first.lineBreakLeading;
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
                                        previousMultiline = row.length === 1 && first.multiline;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            get controlElement() {
                var _a;
                switch (this.tagName) {
                    case 'PROGRESS':
                    case 'METER':
                        return true;
                    case 'INPUT':
                        return ((_a = this.element) === null || _a === void 0 ? void 0 : _a.type) === 'range';
                }
                return false;
            }
            get documentId() {
                const controlId = this.controlId;
                return controlId !== '' ? '@id/' + controlId : '';
            }
            set controlId(value) {
                this._controlId = value;
            }
            get controlId() {
                var _a;
                let result = this._controlId;
                if (result === undefined) {
                    const controlName = this.controlName;
                    if (controlName) {
                        let name;
                        if (this.styleElement) {
                            const value = ((_a = this.elementId) === null || _a === void 0 ? void 0 : _a.trim()) || getNamedItem(this.element, 'name');
                            if (value !== '') {
                                name = value.replace(REGEX_VALIDSTRING, '_').toLowerCase();
                                if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                                    name = '_' + name;
                                }
                            }
                        }
                        result = convertWord(ResourceUI.generateId('android', name || fromLastIndexOf$1(controlName, '.').toLowerCase(), name ? 0 : 1));
                        this._controlId = result;
                    }
                    else if (this.id === 0) {
                        return 'baseroot';
                    }
                    else {
                        return '';
                    }
                }
                return result;
            }
            get anchorTarget() {
                let target = this;
                do {
                    const renderParent = target.renderParent;
                    if (renderParent) {
                        if (renderParent.layoutConstraint || renderParent.layoutRelative) {
                            return target;
                        }
                    }
                    else {
                        break;
                    }
                    target = target.outerWrapper;
                } while (target);
                return this;
            }
            set anchored(value) {
                const constraint = this.constraint;
                constraint.horizontal = value;
                constraint.vertical = value;
            }
            get anchored() {
                const constraint = this.constraint;
                return constraint.horizontal === true && constraint.vertical === true;
            }
            set containerType(value) {
                this._containerType = value;
            }
            get containerType() {
                if (this._containerType === 0) {
                    const value = ELEMENT_ANDROID[this.containerName];
                    if (value > 0) {
                        this._containerType = value;
                    }
                }
                return this._containerType;
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
            set renderExclude(value) {
                this._cached.renderExclude = value;
            }
            get renderExclude() {
                let result = this._cached.renderExclude;
                if (result === undefined) {
                    if (this.styleElement && this.length === 0 && !this.imageElement) {
                        if (this.pageFlow) {
                            const blockStatic = this.blockStatic || this.display === 'table';
                            const renderParent = this.renderParent;
                            if (renderParent) {
                                if (blockStatic || renderParent.layoutVertical || renderParent.layoutFrame) {
                                    result = excludeVertical(this) && this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '';
                                }
                                else {
                                    result = excludeHorizontal(this) && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '' && this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '';
                                }
                            }
                            else {
                                const parent = this.parent;
                                if (blockStatic || parent && (parent.layoutVertical || parent.layoutFrame)) {
                                    return excludeVertical(this);
                                }
                                else if (parent && parent.alignmentType > 0) {
                                    return excludeHorizontal(this);
                                }
                                else {
                                    return false;
                                }
                            }
                        }
                        else {
                            result = excludeHorizontal(this) || excludeVertical(this);
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
                var _a;
                let result = this._cached.baselineHeight;
                if (result === undefined) {
                    result = 0;
                    if (this.plainText) {
                        const { height, numberOfLines } = this.bounds;
                        result = height / (numberOfLines || 1);
                    }
                    else {
                        if (this.multiline && this.cssTry('white-space', 'nowrap')) {
                            result = this.boundingClientRect.height;
                            this.cssFinally('white-space');
                        }
                        else if (this.hasHeight) {
                            result = this.actualHeight;
                        }
                        else if (this.tagName === 'PICTURE') {
                            result = Math.max(((_a = this.naturalElements.find(node => node.tagName === 'IMG')) === null || _a === void 0 ? void 0 : _a.height) || 0, this.bounds.height);
                        }
                        else {
                            result = this.bounds.height;
                        }
                        if (this.naturalElement && this.lineHeight > result) {
                            result = this.lineHeight;
                        }
                        else if (this.inputElement) {
                            switch (this.controlName) {
                                case CONTAINER_ANDROID.RADIO:
                                case CONTAINER_ANDROID.CHECKBOX:
                                    result += 8;
                                    break;
                                case CONTAINER_ANDROID.SELECT:
                                    result += 4;
                                    result /= this.toElementInt('size') || 1;
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
            get leftTopAxis() {
                let result = this._cached.leftTopAxis;
                if (result === undefined) {
                    result = false;
                    switch (this.cssInitial('position')) {
                        case 'absolute': {
                            const { absoluteParent, documentParent } = this;
                            if (absoluteParent) {
                                if (absoluteParent === documentParent) {
                                    result = true;
                                }
                                else if (absoluteParent.box.right === documentParent.linear.right && this.has('right') && !this.has('left')) {
                                    this.css('top', formatPX(this.linear.top - documentParent.box.top), true);
                                    result = true;
                                }
                            }
                            break;
                        }
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
                        positionRelative: this.layoutRelative || this.layoutConstraint,
                        maxDimension: this.textElement || this.imageOrSvgElement
                    };
                    if (this.containerType !== 0) {
                        this._cached.support = result;
                    }
                }
                return result;
            }
            get layoutWidth() {
                return this.__android['layout_width'] || '';
            }
            get layoutHeight() {
                return this.__android['layout_height'] || '';
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
            get contentBoxWidthPercent() {
                var _a;
                const parent = this.actualParent;
                if (((_a = parent) === null || _a === void 0 ? void 0 : _a.gridElement) === false) {
                    const boxWidth = parent.box.width;
                    return boxWidth > 0 ? this.contentBoxWidth / boxWidth : 0;
                }
                return 0;
            }
            get contentBoxHeightPercent() {
                var _a;
                const parent = this.actualParent;
                if (((_a = parent) === null || _a === void 0 ? void 0 : _a.gridElement) === false) {
                    const boxHeight = parent.box.height;
                    return boxHeight > 0 ? this.contentBoxHeight / boxHeight : 0;
                }
                return 0;
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
            get innerWrapped() {
                return this._innerWrapped;
            }
            set innerWrapped(value) {
                if (value) {
                    value = value.outerMostWrapper;
                    this._innerWrapped = value;
                    value.outerWrapper = this;
                }
            }
            set localSettings(value) {
                if (this._localSettings) {
                    Object.assign(this._localSettings, value);
                }
                else {
                    this._localSettings = Object.assign({}, value);
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
    const $base = squared.base;
    const { PLATFORM, USER_AGENT, isPlatform, isUserAgent } = $lib$3.client;
    const { parseColor: parseColor$1 } = $lib$3.color;
    const { formatPX: formatPX$1, getSrcSet: getSrcSet$1, isLength: isLength$1, isPercent: isPercent$1, parseUnit } = $lib$3.css;
    const { createElement, getElementsBetweenSiblings, getRangeClientRect } = $lib$3.dom;
    const { maxArray, truncate: truncate$2 } = $lib$3.math;
    const { CHAR: CHAR$2 } = $lib$3.regex;
    const { getElementAsNode } = $lib$3.session;
    const { aboveRange: aboveRange$1, assignEmptyValue, convertFloat: convertFloat$1, filterArray, hasBit, isString: isString$3, objectMap, optionalAsObject, partitionArray, withinRange: withinRange$1 } = $lib$3.util;
    const { STRING_XMLENCODING, replaceTab } = $lib$3.xml;
    const { APP_SECTION, BOX_STANDARD: BOX_STANDARD$1, NODE_ALIGNMENT: NODE_ALIGNMENT$1, NODE_PROCEDURE: NODE_PROCEDURE$1, NODE_RESOURCE, NODE_TEMPLATE } = $base.lib.enumeration;
    const { Node: Node$1, NodeUI } = $base;
    const REGEX_TEXTSHADOW = /^(?:(rgba?\([^)]+\)|[a-z]+) )?(-?[\d.]+[a-z]+) (-?[\d.]+[a-z]+)\s*(-?[\d.]+[a-z]+)?.*$/;
    function sortHorizontalFloat(list) {
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
    function sortConstraintAbsolute(templates) {
        if (templates.length > 1) {
            templates.sort((a, b) => {
                const above = a.node.innerMostWrapped;
                const below = b.node.innerMostWrapped;
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
    function adjustBaseline(baseline, nodes, singleRow, boxTop) {
        var _a;
        const baselineHeight = baseline.baselineHeight;
        let imageHeight = 0;
        let imageBaseline;
        for (const node of nodes) {
            if (node.baselineAltered) {
                continue;
            }
            let height = node.baselineHeight;
            if (height > 0 || node.textElement) {
                if (node.blockVertical && baseline.blockVertical) {
                    node.anchor('bottom', baseline.documentId);
                    continue;
                }
                else {
                    const imageElements = filterArray(node.renderChildren, item => item.imageOrSvgElement && item.baseline);
                    if (node.imageOrSvgElement || imageElements.length) {
                        for (const image of imageElements) {
                            height = Math.max(image.baselineHeight, height);
                        }
                        if (height > baselineHeight) {
                            if (imageBaseline === undefined || height >= imageHeight) {
                                (_a = imageBaseline) === null || _a === void 0 ? void 0 : _a.anchor(getBaselineAnchor(node), node.documentId);
                                imageHeight = height;
                                imageBaseline = node;
                            }
                            else {
                                node.anchor(getBaselineAnchor(imageBaseline), imageBaseline.documentId);
                            }
                            continue;
                        }
                        else if (withinRange$1(node.linear.top, boxTop)) {
                            node.anchor('top', 'true');
                            continue;
                        }
                    }
                }
                if (singleRow && node.is(CONTAINER_NODE.BUTTON)) {
                    node.anchor('centerVertical', 'true');
                }
                else if (node.naturalChild && node.length === 0) {
                    node.anchor('baseline', baseline.documentId);
                }
                else if (node.baselineElement) {
                    node.anchor(node.naturalElements.findIndex((item) => item.imageOrSvgElement && item.baseline) !== -1 ? 'bottom' : 'baseline', baseline.documentId);
                }
            }
            else if (node.imageOrSvgElement && node.baseline) {
                imageBaseline = node;
            }
        }
        if (imageBaseline) {
            baseline.anchor(getBaselineAnchor(imageBaseline), imageBaseline.documentId);
        }
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
        return 0;
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
        else if (node.float === 'right' && previous.marginLeft < 0) {
            const left = Math.abs(previous.marginLeft);
            const width = previous.actualWidth;
            if (left < width) {
                node.modifyBox(4 /* MARGIN_RIGHT */, width - left);
            }
            node.anchor('right', previous.documentId);
            previous.modifyBox(16 /* MARGIN_LEFT */);
            return true;
        }
        return false;
    }
    function constraintMinMax(node, horizontal) {
        var _a, _b;
        const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', true);
        if (isLength$1(minWH, true) && minWH !== '0px') {
            if (horizontal) {
                if (View.ascendFlexibleWidth(node)) {
                    node.setLayoutWidth('0px', false);
                    if (node.flexibleWidth) {
                        node.app('layout_constraintWidth_min', formatPX$1(node.parseUnit(minWH) + node.contentBoxWidth));
                        node.css('minWidth', 'auto');
                    }
                }
            }
            else if (View.ascendFlexibleHeight(node)) {
                node.setLayoutHeight('0px', false);
                if (node.flexibleHeight) {
                    node.app('layout_constraintHeight_min', formatPX$1(node.parseUnit(minWH, 'height') + node.contentBoxHeight));
                    node.css(horizontal ? 'minWidth' : 'minHeight', 'auto');
                }
            }
        }
        const maxWH = node.cssInitial(horizontal ? 'maxWidth' : 'maxHeight', true);
        if (isLength$1(maxWH, true)) {
            if (horizontal) {
                if (View.ascendFlexibleWidth(node)) {
                    node.setLayoutWidth(node.renderParent.flexibleWidth ? 'match_parent' : '0px', ((_a = node.innerWrapped) === null || _a === void 0 ? void 0 : _a.naturalChild) === true);
                    if (node.flexibleWidth) {
                        const value = node.parseUnit(maxWH);
                        node.app('layout_constraintWidth_max', formatPX$1(value + node.contentBoxWidth));
                        node.css('maxWidth', 'auto');
                        if (node.layoutVertical) {
                            node.each(item => {
                                if (item.textElement && !item.hasPX('maxWidth')) {
                                    item.css('maxWidth', formatPX$1(value));
                                }
                            });
                        }
                    }
                }
            }
            else if (View.ascendFlexibleHeight(node)) {
                node.setLayoutHeight(node.renderParent.flexibleHeight ? 'match_parent' : '0px', ((_b = node.innerWrapped) === null || _b === void 0 ? void 0 : _b.naturalChild) === true);
                if (node.flexibleHeight) {
                    node.app('layout_constraintHeight_max', formatPX$1(node.parseUnit(maxWH, 'height') + node.contentBoxHeight));
                    node.css('maxHeight', 'auto');
                }
            }
        }
    }
    function setConstraintPercent(node, value, horizontal, percent) {
        const parent = node.actualParent || node.documentParent;
        let basePercent = parseFloat(value) / 100;
        if (basePercent < 1 && !(parent.flexElement && isPercent$1(node.flexbox.basis)) && (percent < 1 || node.blockStatic && !parent.gridElement)) {
            const marginPercent = (horizontal ? node.marginLeft + node.marginRight : node.marginTop + node.marginBottom) / parent.box.width;
            let boxPercent = horizontal ? node.contentBoxWidthPercent : node.contentBoxHeightPercent;
            if (boxPercent > 0) {
                if (percent < boxPercent) {
                    boxPercent = Math.max(percent, 0);
                    percent = 0;
                }
                else {
                    percent -= boxPercent;
                }
            }
            if (percent === 0) {
                boxPercent -= marginPercent;
            }
            else {
                percent = Math.max(percent - marginPercent, 0);
            }
            basePercent = Math.min(basePercent + boxPercent, 1);
        }
        node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', truncate$2(basePercent, node.localSettings.floatPrecision));
        setLayoutDimension(node, basePercent === 1 && !node.hasPX('maxWidth') ? 'match_parent' : '0px', horizontal, false);
        return percent;
    }
    function setLayoutDimension(node, value, horizontal, overwrite) {
        if (horizontal) {
            node.setLayoutWidth(value, overwrite);
        }
        else {
            node.setLayoutHeight(value, overwrite);
        }
    }
    function constraintPercentValue(node, dimension, horizontal, opposing, percent) {
        const value = node.cssInitial(dimension, true);
        if (opposing) {
            if (isLength$1(value, true)) {
                const size = node.bounds[dimension];
                setLayoutDimension(node, formatPX$1(size), horizontal, true);
                if (node.imageElement) {
                    const { naturalWidth, naturalHeight } = node.element;
                    if (naturalWidth > 0 && naturalHeight > 0) {
                        const opposingUnit = formatPX$1((size / (horizontal ? naturalWidth : naturalHeight)) * (horizontal ? naturalHeight : naturalWidth));
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
        else if (isPercent$1(value)) {
            return setConstraintPercent(node, value, horizontal, percent);
        }
        return percent;
    }
    function constraintPercentWidth(node, opposing, percent = 1) {
        const parent = node.actualParent || node.documentParent;
        if (!opposing && !parent.layoutElement && parent.hasPX('width', false)) {
            const value = node.cssInitial('width', true);
            if (isPercent$1(value)) {
                if (value !== '100%') {
                    node.setLayoutWidth(formatPX$1(node.actualWidth));
                }
                else {
                    node.setLayoutWidth('match_parent', false);
                }
            }
        }
        else if (!node.inputElement) {
            return constraintPercentValue(node, 'width', true, opposing, percent);
        }
        return percent;
    }
    function constraintPercentHeight(node, opposing, percent = 1) {
        const parent = (node.actualParent || node.documentParent);
        if (parent.hasHeight) {
            if (!opposing && !parent.layoutElement) {
                const value = node.cssInitial('height', true);
                if (isPercent$1(value)) {
                    if (value !== '100%') {
                        node.setLayoutHeight(formatPX$1(node.actualHeight));
                    }
                    else {
                        node.setLayoutHeight('match_parent', false);
                    }
                }
            }
            else if (!node.inputElement) {
                return constraintPercentValue(node, 'height', false, opposing, percent);
            }
        }
        else {
            const height = node.cssInitial('height');
            if (isPercent$1(height)) {
                if (height === '100%') {
                    if (node.alignParent('top') && node.alignParent('bottom')) {
                        node.setLayoutHeight('0px', false);
                        return percent;
                    }
                    else if (parent.flexibleHeight) {
                        node.setLayoutHeight('match_parent', false);
                        return percent;
                    }
                }
                if (!node.hasPX('minHeight')) {
                    const minHeight = node.parseUnit(height, 'height');
                    node.css('minHeight', formatPX$1(minHeight));
                }
                node.setLayoutHeight('wrap_content', false);
            }
        }
        return percent;
    }
    function isTargeted(parentElement, node) {
        const target = node.dataset.target;
        if (target && parentElement) {
            const element = document.getElementById(target);
            return !!element && element !== parentElement;
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
    function causesLineBreak(element, sessionId) {
        var _a;
        if (element.tagName === 'BR') {
            return true;
        }
        else {
            const node = getElementAsNode(element, sessionId);
            if (((_a = node) === null || _a === void 0 ? void 0 : _a.blockStatic) === true && !node.excluded) {
                return true;
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
        var _a;
        const rowStart = partition[0][0];
        const length = partition.length;
        for (let i = 0; i < length; i++) {
            const seg = partition[i];
            const lengthA = seg.length;
            for (let j = 0; j < lengthA; j++) {
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
                    const previous = seg[j - 1];
                    previous.anchor('bottomTop', item.documentId);
                    item.anchor('topBottom', previous.documentId);
                }
                if (j > 0) {
                    item.anchor('left', seg[0].documentId);
                }
                if (j === lengthA - 1) {
                    if (lastRow) {
                        item.anchor('bottom', 'parent');
                    }
                    else if (i > 0 && !item.multiline) {
                        const adjacent = partition[i - 1][j];
                        if (((_a = adjacent) === null || _a === void 0 ? void 0 : _a.multiline) === false && withinRange$1(item.bounds.top, adjacent.bounds.top)) {
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
    function setReadOnly(node) {
        const element = node.element;
        if (element.readOnly) {
            node.android('focusable', 'false');
        }
        if (element.disabled) {
            node.android('enabled', 'false');
        }
    }
    function setLeftTopAxis(node, parent, hasDimension, horizontal) {
        const [orientation, dimension, a1, b1, a2, b2, a3, b3] = horizontal ? [STRING_ANDROID.HORIZONTAL, 'width', 'left', 'right', 16 /* MARGIN_LEFT */, 4 /* MARGIN_RIGHT */, 256 /* PADDING_LEFT */, 64 /* PADDING_RIGHT */]
            : [STRING_ANDROID.VERTICAL, 'height', 'top', 'bottom', 2 /* MARGIN_TOP */, 8 /* MARGIN_BOTTOM */, 32 /* PADDING_TOP */, 128 /* PADDING_BOTTOM */];
        const autoMargin = node.autoMargin;
        if (hasDimension && autoMargin[orientation]) {
            if (node.hasPX(a1) && autoMargin[b1]) {
                node.anchor(a1, 'parent');
                node.modifyBox(a2, node[a1]);
            }
            else if (node.hasPX(b1) && autoMargin[a1]) {
                node.anchor(b1, 'parent');
                node.modifyBox(b2, node[b1]);
            }
            else {
                node.anchorParent(orientation);
                node.modifyBox(a2, node[a1]);
                node.modifyBox(b2, node[b1]);
            }
        }
        else {
            let expand = 0;
            if (node.hasPX(a1)) {
                node.anchor(a1, 'parent');
                if (!node.hasPX(b1) && node.css(dimension) === '100%') {
                    node.anchor(b1, 'parent');
                }
                node.modifyBox(a2, adjustAbsolutePaddingOffset(parent, a3, node[a1]));
                expand++;
            }
            if (node.hasPX(b1)) {
                if (!node.hasPX(dimension) || node.css(dimension) === '100%' || !node.hasPX(a1)) {
                    node.anchor(b1, 'parent');
                    node.modifyBox(b2, adjustAbsolutePaddingOffset(parent, b3, node[b1]));
                }
                expand++;
            }
            if (expand === 2 && !hasDimension && !(autoMargin[orientation] && !autoMargin[a1] && !autoMargin[b1])) {
                if (horizontal) {
                    node.setLayoutWidth('match_parent');
                }
                else {
                    node.setLayoutHeight('match_parent');
                }
            }
        }
        node.positioned = true;
    }
    function setImageDimension(node, value, width, height, image) {
        width = value;
        node.css('width', formatPX$1(value), true);
        if (image && image.width > 0 && image.height > 0) {
            height = image.height * (width / image.width);
            node.css('height', formatPX$1(height), true);
        }
        else {
            node.android('adjustViewBounds', 'true');
        }
        return [width, height];
    }
    function setInputMinDimension(node, element) {
        const { minLength, maxLength } = element;
        if (minLength !== -1) {
            node.android('minLength', minLength.toString());
        }
        if (maxLength > 0) {
            node.android('maxLength', maxLength.toString());
        }
    }
    function setInputMinMax(node, element) {
        const { min, max } = element;
        if (isString$3(min)) {
            node.android('min', min);
        }
        if (isString$3(max)) {
            node.android('max', max);
        }
    }
    const isMultiline = (node) => node.plainText && Resource.hasLineBreak(node, false, true) || node.preserveWhiteSpace && CHAR$2.LEADINGNEWLINE.test(node.textContent);
    const getMaxHeight = (node) => Math.max(node.actualHeight, node.lineHeight);
    const getBaselineAnchor = (node) => node.imageOrSvgElement ? 'baseline' : 'bottom';
    const getRelativeVertical = (layout) => layout.some(item => item.positionRelative || !item.pageFlow && item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR;
    const getRelativeVerticalAligned = (layout) => layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR;
    const getAnchorDirection = (reverse) => reverse ? ['right', 'left', 'rightLeft', 'leftRight'] : ['left', 'right', 'leftRight', 'rightLeft'];
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
                    progressForegroundColor: 'rgb(138, 180, 248)',
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
                    standardFloat: 3
                },
                deviations: {
                    textMarginBoundarySize: 8,
                    subscriptBottomOffset: 0.35,
                    superscriptTopOffset: 0.35,
                    legendBottomOffset: 0.25
                }
            };
        }
        static setConstraintDimension(node, percentWidth = 1) {
            percentWidth = constraintPercentWidth(node, false, percentWidth);
            constraintPercentHeight(node, false, 1);
            if (!node.inputElement && !node.imageOrSvgElement) {
                constraintMinMax(node, true);
                constraintMinMax(node, false);
            }
            return percentWidth;
        }
        static setFlexDimension(node, dimension, percentWidth = 1, percentHeight = 1) {
            const { grow, basis, shrink } = node.flexbox;
            const horizontal = dimension === 'width';
            const setFlexGrow = (value) => {
                if (grow > 0) {
                    node.app(horizontal ? 'layout_constraintHorizontal_weight' : 'layout_constraintVertical_weight', truncate$2(grow, node.localSettings.floatPrecision));
                    return true;
                }
                else if (value > 0) {
                    if (shrink > 1) {
                        value /= shrink;
                    }
                    else if (shrink > 1) {
                        value *= 1 - shrink;
                    }
                    node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', formatPX$1(value));
                }
                return false;
            };
            if (isLength$1(basis)) {
                setFlexGrow(node.parseUnit(basis, dimension));
                setLayoutDimension(node, '0px', horizontal, true);
            }
            else if (basis !== '0%' && isPercent$1(basis)) {
                setFlexGrow(0);
                if (horizontal) {
                    percentWidth = setConstraintPercent(node, basis, true, percentWidth);
                }
                else {
                    percentHeight = setConstraintPercent(node, basis, false, percentHeight);
                }
            }
            else {
                let flexible = false;
                if (Node$1.isFlexDirection(node, horizontal ? 'row' : 'column')) {
                    flexible = setFlexGrow(node.hasPX(dimension, false) ? horizontal ? node.actualWidth : node.actualHeight : 0);
                    if (flexible) {
                        setLayoutDimension(node, '0px', horizontal, true);
                    }
                }
                if (!flexible) {
                    if (horizontal) {
                        percentWidth = constraintPercentWidth(node, false, percentWidth);
                    }
                    else {
                        percentHeight = constraintPercentHeight(node, false, percentHeight);
                    }
                }
            }
            if (shrink > 1) {
                node.app(horizontal ? 'layout_constrainedWidth' : 'layout_constrainedHeight', 'true');
            }
            if (horizontal) {
                constraintPercentHeight(node, true);
            }
            else {
                constraintPercentWidth(node, true);
            }
            if (!node.inputElement && !node.imageOrSvgElement) {
                constraintMinMax(node, true);
                constraintMinMax(node, false);
            }
            return [percentWidth, percentHeight];
        }
        init() {
            const { resolutionDPI, resolutionScreenWidth, resolutionScreenHeight, supportRTL, targetAPI } = this.userSettings;
            const dpiRatio = 160 / resolutionDPI;
            const screenDimension = { width: resolutionScreenWidth * dpiRatio, height: resolutionScreenHeight * dpiRatio };
            this._targetAPI = targetAPI || 29 /* LATEST */;
            this._screenDimension = screenDimension;
            this._defaultViewSettings = {
                screenDimension,
                supportRTL,
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
                    if (node.documentRoot && isTargeted(node.element, child)) {
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
                            layout.setContainerType(getRelativeVerticalAligned(layout), 16 /* VERTICAL */);
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
                layout.setContainerType(getRelativeVerticalAligned(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
            }
            else if (this.checkConstraintFloat(layout)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
            }
            else if (layout.linearX) {
                if (this.checkFrameHorizontal(layout)) {
                    layout.addRender(512 /* FLOAT */);
                    layout.addRender(8 /* HORIZONTAL */);
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
                    layout.addRender(512 /* FLOAT */);
                    layout.addRender(8 /* HORIZONTAL */);
                }
                else {
                    layout.setContainerType(getRelativeVertical(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
                }
            }
            else {
                const { cleared, children } = layout;
                if (layout.some((item, index) => item.alignedVertically(index > 0 ? children.slice(0, index) : undefined, cleared) > 0)) {
                    layout.setContainerType(getRelativeVertical(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
                }
                else {
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 2 /* UNKNOWN */);
                }
            }
            return { layout };
        }
        processUnknownChild(layout) {
            const node = layout.node;
            const visibleStyle = node.visibleStyle;
            if (node.inlineText && (!node.textEmpty || visibleStyle.borderWidth)) {
                layout.setContainerType(CONTAINER_NODE.TEXT);
            }
            else if (node.blockStatic && (visibleStyle.borderWidth || visibleStyle.backgroundImage || node.paddingTop + node.paddingBottom > 0) && node.naturalChildren.length === 0) {
                layout.setContainerType(CONTAINER_NODE.FRAME);
            }
            else if (node.naturalElement &&
                node.elementId === '' &&
                node.bounds.height === 0 &&
                node.marginTop === 0 &&
                node.marginRight === 0 &&
                node.marginBottom === 0 &&
                node.marginLeft === 0 &&
                !node.documentRoot &&
                !visibleStyle.background &&
                !node.dataset.use) {
                node.hide();
                return { layout, next: true };
            }
            else if (visibleStyle.background) {
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
                layout.addRender(512 /* FLOAT */);
                layout.addRender(8 /* HORIZONTAL */);
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
            const cleared = layout.cleared;
            const floatSize = layout.floated.size;
            if (layout.some((item, index) => item.lineBreakTrailing && index < layout.length - 1)) {
                if (!layout.parent.hasAlign(16 /* VERTICAL */)) {
                    layout.node = this.createLayoutNodeGroup(layout);
                    layout.setContainerType(getRelativeVertical(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
                }
            }
            else if (floatSize === 1 && layout.every((item, index) => index === 0 || index === layout.length - 1 || cleared.has(item))) {
                layout.node = this.createLayoutNodeGroup(layout);
                if (layout.same(node => node.float)) {
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
                }
                else if (cleared.size) {
                    layout.addRender(512 /* FLOAT */);
                    layout.addRender(8 /* HORIZONTAL */);
                }
                else {
                    layout.setContainerType(getRelativeVerticalAligned(layout), 16 /* VERTICAL */);
                }
            }
            else if (floatSize && cleared.size) {
                layout.node = this.createLayoutNodeGroup(layout);
                layout.addRender(512 /* FLOAT */);
                layout.addRender(16 /* VERTICAL */);
            }
            else if (floatSize && layout.item(0).floating) {
                layout.node = this.createLayoutNodeGroup(layout);
                layout.addRender(512 /* FLOAT */);
                layout.addRender(8 /* HORIZONTAL */);
            }
            else if (!layout.parent.hasAlign(16 /* VERTICAL */)) {
                layout.node = this.createLayoutNodeGroup(layout);
                layout.setContainerType(getRelativeVerticalAligned(layout), 16 /* VERTICAL */);
            }
            return layout;
        }
        processLayoutHorizontal(layout) {
            if (this.checkConstraintFloat(layout)) {
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
            if (floated.size === 2 || floated.size === 1 && layout.node.cssAscend('textAlign', true) === 'center' && layout.some(node => node.pageFlow)) {
                return true;
            }
            else if (floated.has('right')) {
                let pageFlow = 0;
                let multiline = false;
                for (const node of layout) {
                    if (node.floating) {
                        if (multiline) {
                            return false;
                        }
                        continue;
                    }
                    else if (node.multiline) {
                        multiline = true;
                    }
                    pageFlow++;
                }
                return pageFlow > 0;
            }
            else if (floated.has('left') && !layout.linearX) {
                const node = layout.item(0);
                return node.pageFlow && node.floating;
            }
            return false;
        }
        checkConstraintFloat(layout) {
            const length = layout.length;
            if (length > 1) {
                const cleared = layout.cleared;
                let A = true;
                let B = true;
                for (const node of layout) {
                    if (cleared.has(node) || node.renderExclude) {
                        continue;
                    }
                    else {
                        if (!(node.positiveAxis && (node.floating || node.autoMargin.horizontal) && (!node.positionRelative || node.positionAuto))) {
                            A = false;
                        }
                        if (!node.percentWidth || node.blockStatic && node.css('width') === '100%') {
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
            if (valid || layout.some(node => node.blockVertical || node.percentWidth || node.verticalAlign === 'bottom' && !layout.parent.hasHeight)) {
                return layout.singleRowAligned && layout.every(node => node.positiveAxis || node.renderExclude);
            }
            return false;
        }
        checkLinearHorizontal(layout) {
            const floated = layout.floated;
            if ((floated.size === 0 || floated.size === 1 && floated.has('left')) && layout.node.lineHeight === 0 && layout.singleRowAligned) {
                const { fontSize, lineHeight } = layout.item(0);
                for (const node of layout) {
                    if (!(node.naturalChild && node.length === 0 && !node.inputElement && !node.positionRelative && node.css('verticalAlign') === 'baseline' && !node.blockVertical && !node.positionAuto && node.zIndex === 0 && (lineHeight === 0 || node.lineHeight === lineHeight && node.fontSize === fontSize))) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        setConstraints() {
            for (const node of this.cache) {
                const renderChildren = node.renderChildren;
                const length = renderChildren.length;
                if (length === 0) {
                    continue;
                }
                if (node.layoutRelative) {
                    this.processRelativeHorizontal(node, renderChildren);
                }
                else if (node.layoutConstraint) {
                    const pageFlow = new Array(length);
                    let j = 0;
                    for (let i = 0; i < length; i++) {
                        const item = renderChildren[i];
                        if (!item.positioned) {
                            if (item.pageFlow || item.positionAuto) {
                                pageFlow[j++] = item;
                            }
                            else if (item.outerWrapper === node) {
                                const { horizontal, vertical } = item.constraint;
                                if (!horizontal) {
                                    item.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed');
                                }
                                if (!vertical) {
                                    item.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                                }
                            }
                            else {
                                if (item.leftTopAxis) {
                                    setLeftTopAxis(item, node, item.hasWidth, true);
                                    setLeftTopAxis(item, node, item.hasHeight, false);
                                }
                                if (!item.anchored) {
                                    this.addGuideline(item, node);
                                }
                            }
                        }
                    }
                    if (j > 0) {
                        pageFlow.length = j;
                        if (node.layoutHorizontal && !node.layoutElement) {
                            this.processConstraintHorizontal(node, pageFlow);
                        }
                        else if (node.hasAlign(256 /* COLUMN */)) {
                            this.processConstraintColumn(node, pageFlow);
                        }
                        else if (j > 1) {
                            this.processConstraintChain(node, pageFlow);
                        }
                        else {
                            const item = pageFlow[0];
                            const { top, topBottom } = item.autoMargin;
                            item.anchorParent(STRING_ANDROID.VERTICAL, 'packed', topBottom ? 0.5 : (top ? 1 : 0), false);
                            item.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed', item.centerAligned ? 0.5 : (item.rightAligned ? 1 : 0), false);
                            Controller.setConstraintDimension(item);
                        }
                        this.evaluateAnchors(pageFlow);
                    }
                }
            }
        }
        renderNodeGroup(layout) {
            const { node, containerType } = layout;
            const options = createViewAttribute();
            let valid = false;
            switch (containerType) {
                case CONTAINER_NODE.LINEAR:
                    if (hasBit(layout.alignmentType, 16 /* VERTICAL */)) {
                        options.android.orientation = STRING_ANDROID.VERTICAL;
                        valid = true;
                    }
                    else {
                        options.android.orientation = STRING_ANDROID.HORIZONTAL;
                        valid = true;
                    }
                    break;
                case CONTAINER_NODE.GRID: {
                    const { columnCount, rowCount } = layout;
                    const android = options.android;
                    if (rowCount > 0) {
                        android.rowCount = rowCount.toString();
                    }
                    android.columnCount = columnCount > 0 ? columnCount.toString() : '2';
                    valid = true;
                    break;
                }
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
                const target = !dataset.use && dataset.target;
                node.setControlType(View.getControlName(containerType, node.api), containerType);
                node.addAlign(layout.alignmentType);
                node.render(target ? this.application.resolveTarget(target) : layout.parent);
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
            var _a, _b;
            const { containerType, node } = layout;
            const dataset = node.dataset;
            let controlName = View.getControlName(containerType, node.api);
            node.setControlType(controlName, containerType);
            node.addAlign(layout.alignmentType);
            let parent = layout.parent;
            let target = !dataset.use && dataset.target;
            switch (node.tagName) {
                case 'IMG': {
                    const element = node.element;
                    const absoluteParent = node.absoluteParent || node.documentParent;
                    let width = node.toFloat('width', 0);
                    let height = node.toFloat('height', 0);
                    let percentWidth = node.percentWidth ? width : -1;
                    const percentHeight = node.percentHeight ? height : -1;
                    let scaleType = 'fitXY';
                    let imageSet;
                    if (isString$3(element.srcset) || ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.tagName) === 'PICTURE') {
                        imageSet = getSrcSet$1(element, this.localSettings.supported.imageFormat);
                        if (imageSet.length) {
                            const image = imageSet[0];
                            const actualWidth = image.actualWidth;
                            if (actualWidth) {
                                if (percentWidth === -1) {
                                    [width, height] = setImageDimension(node, actualWidth, width, height, this.application.resourceHandler.getImage(element.src));
                                }
                                else {
                                    width = node.bounds.width;
                                    node.android('adjustViewBounds', 'true');
                                    percentWidth = -1;
                                }
                            }
                            else {
                                const stored = this.application.resourceHandler.getImage(image.src);
                                if (stored) {
                                    if (percentWidth === -1) {
                                        [width, height] = setImageDimension(node, stored.width, width, height, stored);
                                    }
                                    else {
                                        width = node.bounds.width;
                                        node.android('adjustViewBounds', 'true');
                                        percentWidth = -1;
                                    }
                                }
                            }
                        }
                        else {
                            imageSet = undefined;
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
                    if (width > 0 && parent.hasPX('maxWidth', false) && (percentWidth === -1 || percentWidth === 100)) {
                        const parentWidth = parent.parseUnit(parent.css('maxWidth'));
                        if (parentWidth <= width) {
                            width = parentWidth;
                            node.css('width', formatPX$1(width));
                            node.android('adjustViewBounds', 'true');
                        }
                    }
                    else if (height > 0 && parent.hasPX('maxHeight', false) && (percentHeight === -1 || percentHeight === 100)) {
                        const parentHeight = parent.parseUnit(parent.css('maxHeight'), 'height');
                        if (parentHeight <= height) {
                            height = parentHeight;
                            node.css('maxHeight', formatPX$1(height));
                            node.android('adjustViewBounds', 'true');
                            node.setLayoutHeight('wrap_content');
                        }
                    }
                    if (node.baseline) {
                        node.android('baselineAlignBottom', 'true');
                        if (node.marginBottom > 0 && parent.layoutLinear && parent.layoutHorizontal) {
                            node.mergeGravity('layout_gravity', 'bottom');
                        }
                    }
                    if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                        const src = this.application.resourceHandler.addImageSrc(element, '', imageSet);
                        if (src !== '') {
                            node.android('src', '@drawable/' + src);
                        }
                    }
                    if (!node.pageFlow && parent === absoluteParent && (node.left < 0 && parent.css('overflowX') === 'hidden' || node.top < 0 && parent.css('overflowY') === 'hidden')) {
                        const application = this.application;
                        const container = application.createNode({ parent, replace: node });
                        container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                        container.inherit(node, 'base');
                        container.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE$1.ALL });
                        container.cssApply({ position: node.css('position'), zIndex: node.zIndex.toString() });
                        container.positionAuto = false;
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
                    }
                    break;
                }
                case 'TEXTAREA': {
                    const { cols, maxLength, placeholder, rows } = node.element;
                    node.android('minLines', rows > 0 ? rows.toString() : '2');
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
                    if (maxLength > 0) {
                        node.android('maxLength', maxLength.toString());
                    }
                    if (!node.hasPX('width') && cols > 0) {
                        node.css('width', formatPX$1(cols * 8));
                    }
                    node.android('hint', placeholder);
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
                    const { min, max, value } = node.element;
                    let foregroundColor;
                    let backgroundColor;
                    if (node.tagName === 'METER') {
                        ({ meterForegroundColor: foregroundColor, meterBackgroundColor: backgroundColor } = this.localSettings.style);
                        if (max) {
                            if (value) {
                                node.android('progress', Math.round((value / max) * 100).toString());
                            }
                            if (max === 100) {
                                node.android('min', min.toString());
                                node.android('max', max.toString());
                            }
                        }
                    }
                    else {
                        ({ progressForegroundColor: foregroundColor, progressBackgroundColor: backgroundColor } = this.localSettings.style);
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
            }
            switch (controlName) {
                case CONTAINER_ANDROID.TEXT: {
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
                        node.android('letterSpacing', truncate$2(node.toFloat('letterSpacing') / node.fontSize, node.localSettings.floatPrecision));
                    }
                    if (node.css('textAlign') === 'justify') {
                        node.android('justificationMode', 'inter_word');
                    }
                    if (node.has('textShadow')) {
                        const match = REGEX_TEXTSHADOW.exec(node.css('textShadow'));
                        if (match) {
                            const color = Resource.addColor(parseColor$1(match[1] || node.css('color')));
                            if (color !== '') {
                                const precision = node.localSettings.floatPrecision;
                                const fontSize = node.fontSize;
                                const shadowRadius = match[4];
                                node.android('shadowColor', '@color/' + color);
                                node.android('shadowDx', truncate$2(parseUnit(match[2], fontSize) * 2, precision));
                                node.android('shadowDy', truncate$2(parseUnit(match[3], fontSize) * 2, precision));
                                node.android('shadowRadius', truncate$2(isString$3(shadowRadius) ? parseUnit(shadowRadius, fontSize) : 0.01, precision));
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
                    node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
                    setReadOnly(node);
                    break;
                case CONTAINER_ANDROID.SELECT:
                case CONTAINER_ANDROID.CHECKBOX:
                case CONTAINER_ANDROID.RADIO:
                    setReadOnly(node);
                    break;
                case CONTAINER_ANDROID.EDIT:
                    if (node.companion === undefined && node.hasProcedure(NODE_PROCEDURE$1.ACCESSIBILITY)) {
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
                    if ((_b = node.element.list) === null || _b === void 0 ? void 0 : _b.children.length) {
                        controlName = CONTAINER_ANDROID.EDIT_LIST;
                        node.controlName = controlName;
                    }
                    else if (node.api >= 26 /* OREO */) {
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
            if (node.inlineVertical && (!parent.layoutHorizontal || parent.layoutLinear)) {
                switch (node.verticalAlign) {
                    case 'sub':
                        node.modifyBox(8 /* MARGIN_BOTTOM */, Math.floor(node.baselineHeight * this.localSettings.deviations.subscriptBottomOffset) * -1);
                        break;
                    case 'super':
                        node.modifyBox(2 /* MARGIN_TOP */, Math.floor(node.baselineHeight * this.localSettings.deviations.superscriptTopOffset) * -1);
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
            node.setLayoutWidth(width || 'wrap_content');
            node.setLayoutHeight(height || 'wrap_content');
            if (options) {
                node.apply(options);
                options.documentId = node.documentId;
            }
            return this.getEnclosingXmlTag(controlName, this.userSettings.showAttributes ? node.extractAttributes(1) : undefined, content);
        }
        renderSpace(options) {
            const { android, app, column, columnSpan, row, rowSpan } = options;
            let { width, height } = options;
            if (width) {
                if (isPercent$1(width)) {
                    android.layout_columnWeight = truncate$2(parseFloat(width) / 100, this.localSettings.precision.standardFloat);
                    width = '0px';
                }
            }
            else {
                width = 'wrap_content';
            }
            if (height) {
                if (isPercent$1(height)) {
                    android.layout_rowWeight = truncate$2(parseFloat(height) / 100, this.localSettings.precision.standardFloat);
                    height = '0px';
                }
            }
            else {
                height = 'wrap_content';
            }
            if (column !== undefined) {
                android.layout_column = column.toString();
            }
            if (columnSpan) {
                android.layout_columnSpan = columnSpan.toString();
            }
            if (row !== undefined) {
                android.layout_row = row.toString();
            }
            if (rowSpan) {
                android.layout_rowSpan = rowSpan.toString();
            }
            const optionsA = { android, app };
            const output = this.renderNodeStatic(CONTAINER_ANDROID.SPACE, optionsA, width, height);
            options.documentId = optionsA.documentId;
            return output;
        }
        addGuideline(node, parent, orientation, percent = false, opposing = false) {
            const documentParent = parent.nodeGroup && !node.documentParent.hasAlign(4 /* AUTO_LAYOUT */) ? parent : node.documentParent;
            const box = documentParent.box;
            const linear = node.linear;
            const bounds = node.positionStatic ? node.bounds : linear;
            const applyLayout = (value, horizontal) => {
                var _a;
                if (node.constraint[value] || orientation && value !== orientation) {
                    return;
                }
                let LT;
                let RB;
                let LTRB;
                let RBLT;
                if (horizontal) {
                    if (!opposing) {
                        LT = 'left';
                        RB = 'right';
                        LTRB = 'leftRight';
                        RBLT = 'rightLeft';
                    }
                    else {
                        LT = 'right';
                        RB = 'left';
                        LTRB = 'rightLeft';
                        RBLT = 'leftRight';
                    }
                }
                else {
                    if (!opposing) {
                        LT = 'top';
                        RB = 'bottom';
                        LTRB = 'topBottom';
                        RBLT = 'bottomTop';
                    }
                    else {
                        LT = 'bottom';
                        RB = 'top';
                        LTRB = 'bottomTop';
                        RBLT = 'topBottom';
                    }
                }
                if (withinRange$1(linear[LT], box[LT])) {
                    node.anchor(LT, 'parent', true);
                    return;
                }
                let beginPercent = 'layout_constraintGuide_';
                let location;
                if (!percent && !parent.hasAlign(4 /* AUTO_LAYOUT */)) {
                    const found = parent.renderChildren.some(item => {
                        if (item !== node && item.constraint[value]) {
                            let attr;
                            if (node.pageFlow && item.pageFlow) {
                                if (withinRange$1(linear[LT], item.linear[RB])) {
                                    attr = LTRB;
                                }
                                else if (withinRange$1(linear[RB], item.linear[LT])) {
                                    attr = RBLT;
                                }
                            }
                            if (attr === undefined) {
                                if (withinRange$1(node.bounds[LT], item.bounds[LT])) {
                                    if (!horizontal && node.textElement && node.baseline && item.textElement && item.baseline) {
                                        attr = 'baseline';
                                    }
                                    else {
                                        attr = LT;
                                        if (horizontal) {
                                            node.modifyBox(16 /* MARGIN_LEFT */, -item.marginLeft, false);
                                        }
                                        else {
                                            node.modifyBox(2 /* MARGIN_TOP */, -item.marginTop, false);
                                        }
                                    }
                                }
                                else if (withinRange$1(node.bounds[RB], item.bounds[RB])) {
                                    attr = RB;
                                    node.modifyBox(horizontal ? 4 /* MARGIN_RIGHT */ : 8 /* MARGIN_BOTTOM */);
                                }
                                else if (!node.pageFlow && item.pageFlow && withinRange$1(node.bounds[LT] + node[LT], item.bounds[LT])) {
                                    attr = LT;
                                    node.modifyBox(horizontal ? 16 /* MARGIN_LEFT */ : 2 /* MARGIN_TOP */, node[LT]);
                                }
                            }
                            if (attr) {
                                node.anchor(attr, item.documentId, true);
                                node.constraint[value] = true;
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
                    if (siblingsLeading.length && node.alignedVertically() === 0) {
                        const previousSibling = siblingsLeading[0];
                        if (previousSibling.renderParent === node.renderParent) {
                            node.anchor(horizontal ? 'rightLeft' : 'top', previousSibling.documentId, true);
                            node.constraint[value] = previousSibling.constraint[value];
                            return;
                        }
                    }
                }
                const absoluteParent = node.absoluteParent;
                if (percent) {
                    const position = Math.abs(bounds[LT] - box[LT]) / box[horizontal ? 'width' : 'height'];
                    location = parseFloat(truncate$2(!opposing ? position : 1 - position, node.localSettings.floatPrecision));
                    beginPercent += 'percent';
                }
                else {
                    location = bounds[LT] - box[!opposing ? LT : RB];
                    if (!horizontal && !documentParent.nodeGroup) {
                        if (documentParent !== absoluteParent) {
                            if (!absoluteParent.positionRelative && absoluteParent.getBox(2 /* MARGIN_TOP */)[0] === 1) {
                                location -= absoluteParent.marginTop;
                            }
                        }
                        else if (!node.hasPX('top')) {
                            const previousSibling = node.previousSibling;
                            if ((_a = previousSibling) === null || _a === void 0 ? void 0 : _a.blockStatic) {
                                location += previousSibling.marginBottom;
                            }
                        }
                    }
                    beginPercent += 'begin';
                }
                const guideline = parent.constraint.guideline || {};
                if (!node.pageFlow) {
                    if (documentParent.outerWrapper && node.parent === documentParent.outerMostWrapper) {
                        location += documentParent[!opposing ? (horizontal ? 'paddingLeft' : 'paddingTop') : (horizontal ? 'paddingRight' : 'paddingBottom')];
                    }
                    else if (absoluteParent === node.documentParent) {
                        let direction;
                        if (horizontal) {
                            direction = !opposing ? 256 /* PADDING_LEFT */ : 64 /* PADDING_RIGHT */;
                        }
                        else {
                            direction = !opposing ? 32 /* PADDING_TOP */ : 128 /* PADDING_BOTTOM */;
                        }
                        location = adjustAbsolutePaddingOffset(documentParent, direction, location);
                    }
                }
                else if (node.inlineVertical) {
                    const offset = convertFloat$1(node.verticalAlign);
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
                    if (location < 0 && node.innerWrapped) {
                        const innerWrapped = node.innerMostWrapped;
                        if (!innerWrapped.pageFlow) {
                            let region = 0;
                            switch (LT) {
                                case 'top':
                                    region = 2 /* MARGIN_TOP */;
                                    break;
                                case 'left':
                                    region = 16 /* MARGIN_LEFT */;
                                    break;
                                case 'bottom':
                                    region = 8 /* MARGIN_BOTTOM */;
                                    break;
                                case 'right':
                                    region = 4 /* MARGIN_RIGHT */;
                                    break;
                            }
                            innerWrapped.modifyBox(region, location);
                        }
                    }
                }
                else if (horizontal && location + bounds.width >= box.right && documentParent.hasPX('width') && !node.hasPX('right') || !horizontal && location + bounds.height >= box.bottom && documentParent.hasPX('height') && !node.hasPX('bottom')) {
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
                    const options = createViewAttribute(undefined, {
                        android: {
                            orientation: horizontal ? STRING_ANDROID.VERTICAL : STRING_ANDROID.HORIZONTAL
                        },
                        app: {
                            [beginPercent]: percent ? location.toString() : '@dimen/' + Resource.insertStoredAsset('dimens', 'constraint_guideline_' + (!opposing ? LT : RB), formatPX$1(location))
                        }
                    });
                    this.addAfterOutsideTemplate(node.id, this.renderNodeStatic(node.api < 29 /* Q */ ? CONTAINER_ANDROID.GUIDELINE : CONTAINER_ANDROID_X.GUIDELINE, options), false);
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
            };
            applyLayout(STRING_ANDROID.HORIZONTAL, true);
            applyLayout(STRING_ANDROID.VERTICAL, false);
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
                const options = createViewAttribute(undefined, {
                    android: {},
                    app: {
                        barrierDirection,
                        constraint_referenced_ids: objectMap(unbound, item => getDocumentId(item.anchorTarget.documentId)).join(',')
                    }
                });
                const target = unbound[unbound.length - 1];
                this.addAfterOutsideTemplate(target.anchorTarget.id, this.renderNodeStatic(target.api < 29 /* Q */ ? CONTAINER_ANDROID.BARRIER : CONTAINER_ANDROID_X.BARRIER, options), false);
                const documentId = options.documentId;
                if (documentId) {
                    for (const node of unbound) {
                        node.constraint.barrier[barrierDirection] = documentId;
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
            for (const node of nodes) {
                const { horizontal, vertical } = node.constraint;
                if (horizontal) {
                    horizontalAligned.push(node);
                }
                if (vertical) {
                    verticalAligned.push(node);
                }
                if (node.alignParent('top')) {
                    let current = node;
                    do {
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
                                const documentId = barrier === undefined || !isString$3(barrier.bottom) ? this.addBarrier([current], 'bottom') : barrier.bottom;
                                if (documentId) {
                                    current.anchor('bottomTop', documentId);
                                }
                            }
                            break;
                        }
                    } while (true);
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
                        if (position.horizontal && horizontalAligned.some(item => item.documentId === position.documentId)) {
                            constraint.horizontal = true;
                            horizontalAligned.push(node);
                            i = -1;
                            break;
                        }
                    }
                }
                if (!constraint.vertical) {
                    for (const attr in current) {
                        const position = current[attr];
                        if (!position.horizontal && verticalAligned.some(item => item.documentId === position.documentId)) {
                            constraint.vertical = true;
                            verticalAligned.push(node);
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
        createNodeWrapper(node, parent, children, options = {}) {
            var _a;
            const { controlName, containerType, alignmentType } = options;
            let { resource, procedure, section } = options;
            const container = this.application.createNode({ parent, children, append: true, replace: node });
            container.inherit(node, 'base', 'alignment');
            if (node.documentRoot) {
                container.documentRoot = true;
                node.documentRoot = false;
            }
            if (container.actualParent === null && parent.naturalElement) {
                container.actualParent = parent;
            }
            if (resource === undefined) {
                resource = NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET;
            }
            if (procedure === undefined) {
                procedure = NODE_PROCEDURE$1.CUSTOMIZATION;
            }
            if (section === undefined) {
                section = APP_SECTION.ALL;
            }
            if (controlName) {
                container.setControlType(controlName, containerType);
            }
            if (alignmentType) {
                container.addAlign(alignmentType);
            }
            container.addAlign(16384 /* WRAPPER */);
            container.exclude({ resource, procedure, section });
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
            const { documentParent, renderParent } = node;
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
            if (documentParent.layoutElement) {
                const android = node.namespace('android');
                for (const attr in android) {
                    if (/^layout_/.test(attr)) {
                        container.android(attr, android[attr]);
                        delete android[attr];
                    }
                }
            }
            if (options.resetMargin) {
                node.resetBox(30 /* MARGIN */, container);
            }
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
                            if (node.naturalElement && node.inlineStatic && parent.blockStatic && parent === renderParent) {
                                const { left, width } = parent.box;
                                return width - (node.linear.left - left);
                            }
                            else if (parent.floatContainer) {
                                const { containerType, alignmentType } = this.containerTypeVerticalMargin;
                                const container = node.ascend({ condition: (item) => item.of(containerType, alignmentType), including: parent, attr: 'renderParent' });
                                if (container.length) {
                                    const { left, right, width } = node.box;
                                    let leftOffset = 0;
                                    let rightOffset = 0;
                                    for (const item of parent.naturalElements) {
                                        const linear = item.linear;
                                        if (item.floating && !children.includes(item) && node.intersectY(linear)) {
                                            if (item.float === 'left') {
                                                if (Math.floor(linear.right) > left) {
                                                    leftOffset = Math.max(leftOffset, linear.right - left);
                                                }
                                            }
                                            else if (right > Math.ceil(linear.left)) {
                                                rightOffset = Math.max(rightOffset, right - linear.left);
                                            }
                                        }
                                    }
                                    return width - leftOffset - rightOffset;
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
                    const parent = node.actualParent;
                    if (((_a = parent) === null || _a === void 0 ? void 0 : _a.blockDimension) && parent.has('textIndent')) {
                        const target = children[0];
                        if (!target.rightAligned) {
                            const value = parent.css('textIndent');
                            textIndent = parent.parseUnit(value);
                            if (textIndent !== 0) {
                                if (textIndent < 0) {
                                    parent.setCacheValue('paddingLeft', Math.max(0, parent.paddingLeft + textIndent));
                                }
                                target.setCacheValue('blockDimension', true);
                                target.css('textIndent', value);
                                parent.css('textIndent', '0px');
                            }
                        }
                    }
                }
                let rowWidth = 0;
                let previousRowLeft;
                let textIndentSpacing = false;
                partitionArray(children, item => item.float !== 'right').forEach((seg, index) => {
                    var _a, _b, _c;
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
                        if (seg.some(item => item.floating)) {
                            sortHorizontalFloat(seg);
                        }
                        rows = rowsLeft;
                    }
                    else {
                        alignParent = 'right';
                        rowsRight = [];
                        rows = rowsRight;
                    }
                    let previous;
                    let items;
                    for (let i = 0; i < length; i++) {
                        const item = seg[i];
                        let alignSibling;
                        if (leftAlign && leftForward) {
                            alignSibling = 'leftRight';
                            if (i === 0 && item.inline && Math.abs(textIndent) >= item.actualWidth && item.float !== 'right' && !item.positionRelative) {
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
                            let maxWidth = 0;
                            let baseWidth = 0;
                            let retainMultiline = false;
                            const checkFloatWrap = () => {
                                if (previous.floating && previous.alignParent('left') && (multiline || Math.floor(rowWidth + item.actualWidth) < boxWidth)) {
                                    return true;
                                }
                                else if (node.floating && i === length - 1 && item.textElement && !/\s|-/.test(item.textContent.trim())) {
                                    if (node.hasPX('width')) {
                                        const width = node.css('width');
                                        if (node.parseUnit(width) > node.parseUnit(node.css('minWidth'))) {
                                            node.cssApply({ width: 'auto', minWidth: width });
                                        }
                                    }
                                    node.android('maxLines', '1');
                                    return true;
                                }
                                return false;
                            };
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
                                maxWidth = Math.ceil(maxWidth);
                                return true;
                            };
                            const startNewRow = () => {
                                var _a;
                                if (previous.textElement) {
                                    if (i === 1 && item.plainText && item.previousSibling === previous && !CHAR$2.TRAILINGSPACE.test(previous.textContent) && !CHAR$2.LEADINGSPACE.test(item.textContent)) {
                                        retainMultiline = true;
                                        return false;
                                    }
                                    else if (checkLineWrap && previous.multiline && (previous.bounds.width >= boxWidth || item.plainText && Resource.hasLineBreak(previous, false, true))) {
                                        return true;
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
                            if (previous.floating && adjustFloatingNegativeMargin(item, previous)) {
                                alignSibling = '';
                            }
                            siblings = item.inlineVertical && previous.inlineVertical && item.previousSibling !== previous ? getElementsBetweenSiblings(previous.element, item.element) : undefined;
                            if (textNewRow ||
                                item.nodeGroup && !item.hasAlign(128 /* SEGMENTED */) ||
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
                                items = [item];
                                rows.push(items);
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
                            items = [item];
                            rows.push(items);
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
                        if (((_c = siblings) === null || _c === void 0 ? void 0 : _c.some(element => !!getElementAsNode(element, item.sessionId) || causesLineBreak(element, item.sessionId))) === false) {
                            const betweenStart = getRangeClientRect(siblings[0]);
                            if (!betweenStart.numberOfLines) {
                                const betweenEnd = siblings.length > 1 ? getRangeClientRect(siblings.pop()) : undefined;
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
                const singleRow = length === 1 && !node.hasHeight;
                for (let i = 0; i < length; i++) {
                    const items = rows[i];
                    let baseline;
                    if (items.length > 1) {
                        const bottomAligned = getTextBottom(items);
                        let textBottom = bottomAligned[0];
                        baseline = NodeUI.baseline(bottomAligned.length ? items.filter(item => !bottomAligned.includes(item)) : items);
                        if (baseline && textBottom) {
                            if (baseline !== textBottom && baseline.bounds.height < textBottom.bounds.height) {
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
                            if (item === baseline || item === textBottom) {
                                continue;
                            }
                            if (item.controlElement) {
                                if (i === 0) {
                                    item.anchor('top', 'true');
                                    item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - node.box.top);
                                    item.baselineAltered = true;
                                    continue;
                                }
                                else if (previousBaseline) {
                                    item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - previousBaseline.box.top);
                                    item.baselineAltered = true;
                                    continue;
                                }
                            }
                            let alignTop = false;
                            if (item.baseline) {
                                if (item.naturalElements.length && (isLength$1(item.verticalAlign) || !item.baselineElement)) {
                                    alignTop = true;
                                }
                                else {
                                    baselineAlign.push(item);
                                }
                            }
                            else if (item.inlineVertical) {
                                switch (item.css('verticalAlign')) {
                                    case 'text-top':
                                        if (textBaseline === null) {
                                            textBaseline = NodeUI.baseline(items, true);
                                        }
                                        if (textBaseline && item !== textBaseline) {
                                            item.anchor('top', textBaseline.documentId);
                                        }
                                        break;
                                    case 'super':
                                        if (!item.baselineAltered) {
                                            item.modifyBox(2 /* MARGIN_TOP */, Math.floor(item.baselineHeight * this.localSettings.deviations.superscriptTopOffset) * -1);
                                        }
                                    case 'top':
                                        if (documentId !== '' && documentId !== item.documentId) {
                                            item.anchor('top', documentId);
                                        }
                                        else if (baseline) {
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
                                    }
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
                                            item.modifyBox(8 /* MARGIN_BOTTOM */, Math.ceil(item.baselineHeight * this.localSettings.deviations.subscriptBottomOffset) * -1);
                                        }
                                    case 'bottom':
                                        if (documentId !== '' && !withinRange$1(node.bounds.height, item.bounds.height)) {
                                            if (!node.hasHeight && documentId === 'true') {
                                                if (!alignmentMultiLine) {
                                                    node.css('height', formatPX$1(node.bounds.height));
                                                }
                                                else if (baseline) {
                                                    documentId = baseline.documentId;
                                                }
                                            }
                                            item.anchor('bottom', documentId);
                                        }
                                        break;
                                    default:
                                        alignTop = !item.baselineAltered;
                                        break;
                                }
                            }
                            else {
                                alignTop = true;
                            }
                            if (alignTop && i === 0) {
                                item.anchor('top', 'true');
                            }
                        }
                        const lengthA = baselineAlign.length;
                        if (baseline) {
                            baseline.baselineActive = true;
                            if (lengthA) {
                                adjustBaseline(baseline, baselineAlign, singleRow, node.box.top);
                                if (singleRow && baseline.is(CONTAINER_NODE.BUTTON)) {
                                    baseline.anchor('centerVertical', 'true');
                                    baseline = null;
                                }
                            }
                            else if (baseline.textElement && maxCenterHeight > baseline.actualHeight) {
                                baseline.anchor('centerVertical', 'true');
                                baseline = null;
                            }
                        }
                        else if (lengthA > 0 && lengthA < items.length) {
                            textBottom = getTextBottom(items)[0];
                            if (textBottom) {
                                for (const item of baselineAlign) {
                                    if (item.baseline && !item.multiline && textBottom.bounds.height > item.bounds.height) {
                                        item.anchor('bottom', textBottom.documentId);
                                    }
                                }
                            }
                        }
                        for (let j = items.length - 1, last = true; j > 0; j--) {
                            const previous = items[j];
                            if (previous.textElement) {
                                previous.setSingleLine(last && !previous.rightAligned && !previous.centerAligned);
                                last = false;
                            }
                        }
                    }
                    else {
                        baseline = items[0];
                        baseline.baselineActive = true;
                    }
                    if (baseline === null) {
                        baseline = items.find(sibling => sibling.baselineElement) || items[0];
                    }
                    for (const sibling of items) {
                        if (previousBaseline && sibling.alignSibling('baseline') === '') {
                            sibling.anchor('topBottom', previousBaseline.documentId);
                        }
                        if (sibling !== baseline && (sibling.baselineElement || baseline.floating) && sibling.linear.bottom >= baseline.linear.bottom) {
                            baseline = sibling;
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
            let percentWidth = View.availablePercent(children, 'width', node.box.width);
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
            let valid = true;
            let tallest;
            let bottom;
            let previous;
            const setAlignTop = (item) => {
                item.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - node.box.top);
                item.baselineAltered = true;
                valid = false;
            };
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
                        if (item.controlElement) {
                            setAlignTop(item);
                        }
                        else if (item.inlineVertical) {
                            if (tallest === undefined || getMaxHeight(item) > getMaxHeight(tallest)) {
                                tallest = item;
                            }
                            switch (item.css('verticalAlign')) {
                                case 'text-top':
                                    if (textBaseline && item !== textBaseline) {
                                        item.anchor('top', textBaseline.documentId);
                                    }
                                    else {
                                        setAlignTop(item);
                                    }
                                    break;
                                case 'middle':
                                    if (((_a = baseline) === null || _a === void 0 ? void 0 : _a.textElement) === false || textBottom) {
                                        setAlignTop(item);
                                    }
                                    else {
                                        item.anchorParent(STRING_ANDROID.VERTICAL, 'packed', 0.5);
                                    }
                                    break;
                                case 'text-bottom':
                                    if (textBaseline && item !== textBaseline) {
                                        if (item !== textBottom) {
                                            item.anchor('bottom', textBaseline.documentId);
                                        }
                                        else if (textBottom) {
                                            setAlignTop(item);
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
                                        setAlignTop(item);
                                    }
                                    else {
                                        item.anchor('bottom', 'parent');
                                    }
                                    break;
                                case 'baseline':
                                    if (baseline === null || item.blockVertical || !item.textElement && getMaxHeight(item) > getMaxHeight(baseline)) {
                                        setAlignTop(item);
                                    }
                                    else {
                                        item.anchor('baseline', documentId);
                                    }
                                    break;
                                default:
                                    setAlignTop(item);
                                    break;
                            }
                        }
                        else if (item.plainText) {
                            if (baseline) {
                                item.anchor('baseline', documentId);
                            }
                        }
                        else {
                            setAlignTop(item);
                        }
                        item.anchored = true;
                    }
                    else {
                        baseline.baselineActive = true;
                    }
                    percentWidth = Controller.setConstraintDimension(item, percentWidth);
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
                                baseline.modifyBox(8 /* MARGIN_BOTTOM */, Math.floor(baseline.baselineHeight * this.localSettings.deviations.subscriptBottomOffset) * -1);
                            }
                            break;
                        case 'super':
                            if (!tallest.textElement) {
                                baseline.anchor('bottom', tallest.documentId);
                                baseline.modifyBox(2 /* MARGIN_TOP */, Math.floor(baseline.baselineHeight * this.localSettings.deviations.superscriptTopOffset) * -1);
                            }
                            break;
                    }
                }
                else {
                    if (valid && baseline.baselineElement && !baseline.imageOrSvgElement) {
                        baseline.anchorParent(STRING_ANDROID.VERTICAL);
                        baseline.anchor('baseline', 'parent');
                    }
                    else {
                        baseline.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                        baseline.modifyBox(2 /* MARGIN_TOP */, Math.floor(baseline.linear.top - node.box.top));
                    }
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
                if (!(item.textElement && (item.plainText || item.inlineText))) {
                    item.modifyBox(4 /* MARGIN_RIGHT */);
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
                if (isUserAgent(4 /* SAFARI */)) {
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
                if (row.length === 1) {
                    const rowStart = row[0];
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
                                l = 0;
                            }
                            let col = columns[k];
                            if (col === undefined) {
                                col = [];
                                columns[k] = col;
                            }
                            col.push(column);
                            if (column.length) {
                                totalGap += maxArray(objectMap(column.children, child => child.marginLeft + child.marginRight));
                            }
                            if (j > 0 && /^H\d/.test(column.tagName)) {
                                if (col.length === 1 && j === row.length - 2) {
                                    columnMin--;
                                    excessCount = 0;
                                }
                                else if ((l + 1) % perRowCount === 0 && row.length - j > columnMin && !row[j + 1].multiline && row[j + 1].bounds.height < maxHeight) {
                                    col.push(row[++j]);
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
                            item.app('layout_constraintWidth_percent', truncate$2((1 / columnMin) - percentGap, node.localSettings.floatPrecision));
                            item.setLayoutWidth('0px');
                        }
                        horizontal.push(data[0]);
                    }
                    const columnHeight = new Array(lengthB).fill(0);
                    const barrier = [];
                    for (let j = 0; j < lengthB; j++) {
                        const item = columns[j];
                        if (j < lengthB - 1 && item.length > 1) {
                            const columnEnd = item[item.length - 1];
                            if (/^H\d/.test(columnEnd.tagName)) {
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
                            const value = columnHeight[j];
                            if (value >= maxColumnHeight) {
                                previousRow = columns[j].pop();
                                maxColumnHeight = value;
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
                    if (lengthA === 0) {
                        return;
                    }
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
                    let percentWidth = View.availablePercent(partition, 'width', node.box.width);
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
                        percentWidth = Controller.setConstraintDimension(chain, percentWidth);
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
                            const item = previousRow[k];
                            if (item.linear.bottom >= aboveRowEnd.linear.bottom) {
                                aboveRowEnd = item;
                            }
                        }
                    }
                    if (currentRowBottom === undefined) {
                        currentRowBottom = partition[0];
                        const lengthB = partition.length;
                        for (let k = 1; k < lengthB; k++) {
                            const item = partition[k];
                            if (item.linear.bottom >= currentRowBottom.linear.bottom) {
                                currentRowBottom = item;
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
                filename: items[i + 2].split('?')[0],
                content: '',
                uri: items[i]
            };
        }
        return result;
    }
    const createFileAsset = (pathname, filename, content) => ({ pathname, filename, content });
    const replaceDrawableLength = (value, format) => format === 'dp' ? value.replace(REGEX_DRAWABLE_UNIT, (match, ...capture) => '"' + convertLength(capture[0], false) + '"') : value;
    const replaceThemeLength = (value, format) => format === 'dp' ? value.replace(REGEX_THEME_UNIT, (match, ...capture) => '>' + convertLength(capture[0], false) + '<') : value;
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
                                filename: fontName + '.' + fromLastIndexOf$2(uri.split('?')[0], '.').toLowerCase(),
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
                const { convertPixels, insertSpaces, manifestThemeName } = this.userSettings;
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
                        result.push(replaceTab$1(replaceThemeLength(applyTemplate('resources', STYLE_TMPL, [item]), convertPixels), insertSpaces), match[1], match[2]);
                    }
                }
            }
            return this.checkFileAssets(result, options);
        }
        resourceDimenToXml(options = {}) {
            if (STORED$1.dimens.size) {
                const convertPixels = this.userSettings.convertPixels;
                const item = { dimen: [] };
                const itemArray = item.dimen;
                for (const [name, value] of Array.from(STORED$1.dimens.entries()).sort()) {
                    itemArray.push({ name, innerText: convertPixels ? convertLength(value, false) : value });
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
                const { convertPixels, insertSpaces } = this.userSettings;
                const directory = this.directory.image;
                const result = [];
                for (const [name, value] of STORED$1.drawables.entries()) {
                    result.push(replaceTab$1(replaceDrawableLength(value, convertPixels), insertSpaces), directory, name + '.xml');
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
            this.options = {
                showLabel: false
            };
        }
        beforeBaseLayout() {
            for (const node of this.cacheProcessing) {
                if (node.inputElement && node.hasProcedure(NODE_PROCEDURE$2.ACCESSIBILITY)) {
                    switch (node.containerName) {
                        case 'INPUT_RADIO':
                        case 'INPUT_CHECKBOX': {
                            const id = node.elementId;
                            [node.nextSibling, node.previousSibling].some((sibling) => {
                                var _a;
                                if (((_a = sibling) === null || _a === void 0 ? void 0 : _a.pageFlow) && !sibling.visibleStyle.backgroundImage && sibling.visible) {
                                    let valid = false;
                                    if (id && id === sibling.toElementString('htmlFor')) {
                                        valid = true;
                                    }
                                    else if (sibling.textElement) {
                                        const parent = sibling.actualParent;
                                        if (parent.tagName === 'LABEL') {
                                            parent.renderAs = node;
                                            valid = true;
                                        }
                                        else if (sibling.plainText) {
                                            valid = true;
                                        }
                                    }
                                    if (valid) {
                                        sibling.labelFor = node;
                                        if (!this.options.showLabel) {
                                            sibling.hide();
                                        }
                                        return true;
                                    }
                                }
                                return false;
                            });
                            break;
                        }
                        case 'INPUT_IMAGE':
                            node.extracted = [node];
                            break;
                        case 'BUTTON':
                            if (node.length) {
                                const extracted = node.filter((item) => !item.textElement);
                                if (extracted.length) {
                                    node.extracted = extracted;
                                }
                                node.clear();
                            }
                            break;
                    }
                }
            }
        }
    }

    const $lib$5 = squared.lib;
    const $base$1 = squared.base;
    const $base_lib = $base$1.lib;
    const { formatPercent, formatPX: formatPX$2, isLength: isLength$2, isPercent: isPercent$2 } = $lib$5.css;
    const { maxArray: maxArray$1, truncate: truncate$3 } = $lib$5.math;
    const { CHAR: CHAR$3, CSS: CSS$1 } = $lib$5.regex;
    const { captureMap, flatMultiArray, hasValue, isArray, objectMap: objectMap$2 } = $lib$5.util;
    const { BOX_STANDARD: BOX_STANDARD$2, NODE_ALIGNMENT: NODE_ALIGNMENT$2, NODE_PROCEDURE: NODE_PROCEDURE$3, NODE_RESOURCE: NODE_RESOURCE$1 } = $base_lib.enumeration;
    const { LayoutUI, Node: Node$2 } = $base$1;
    const CSS_GRID = $base_lib.constant.EXT_NAME.CSS_GRID;
    const CssGrid = $base$1.extensions.CssGrid;
    const REGEX_JUSTIFYSELF = /start|left|center|right|end/;
    const REGEX_JUSTIFYLEFT = /(start|left|baseline)$/;
    const REGEX_JUSTIFYRIGHT = /(right|end)$/;
    const REGEX_ALIGNSELF = /start|end|center|baseline/;
    const REGEX_ALIGNTOP = /(start|baseline)$/;
    const REGEX_ALIGNBOTTOM = /end$/;
    const REGEX_FR = /fr$/;
    function getRowData(mainData, horizontal) {
        const rowData = mainData.rowData;
        if (horizontal) {
            const length = mainData.column.length;
            const lengthA = mainData.row.length;
            const result = new Array(length);
            for (let i = 0; i < length; i++) {
                const data = new Array(lengthA);
                for (let j = 0; j < lengthA; j++) {
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
    function getGridSize(node, mainData, horizontal, maxScreenWidth, maxScreenHeight) {
        const data = horizontal ? mainData.column : mainData.row;
        const unit = data.unit;
        const length = unit.length;
        let value = 0;
        if (length) {
            const dimension = horizontal ? 'width' : 'height';
            for (let i = 0; i < length; i++) {
                const unitPX = unit[i];
                if (isPx(unitPX)) {
                    value += parseFloat(unitPX);
                }
                else {
                    let size = 0;
                    captureMap(mainData.rowData[i], item => isArray(item), item => size = Math.min(size, ...objectMap$2(item, child => child.bounds[dimension])));
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
            return (maxScreenWidth > value ? Math.min(maxScreenWidth, node.actualWidth) : node.actualWidth) - value;
        }
        else {
            value += node.contentBox ? node.borderTopWidth + node.borderBottomWidth : node.contentBoxHeight;
            return (maxScreenHeight > value && node.documentBody ? Math.min(maxScreenHeight, node.actualHeight) : node.actualHeight) - value;
        }
    }
    function getMarginSize(value, gridSize) {
        const size = Math.floor(gridSize / value);
        return [size, gridSize - (size * value)];
    }
    function setContentSpacing(node, mainData, alignment, horizontal, dimension, outerWrapper, MARGIN_START, MARGIN_END, maxScreenWidth, maxScreenHeight) {
        const data = horizontal ? mainData.column : mainData.row;
        if (/^space/.test(alignment)) {
            const gridSize = getGridSize(node, mainData, horizontal, maxScreenWidth, maxScreenHeight);
            if (gridSize > 0) {
                const rowData = getRowData(mainData, horizontal);
                const itemCount = data.length;
                const adjusted = new Set();
                switch (alignment) {
                    case 'space-around': {
                        const [marginSize, marginExcess] = getMarginSize(itemCount * 2, gridSize);
                        for (let i = 0; i < itemCount; i++) {
                            for (const item of new Set(flatMultiArray(rowData[i]))) {
                                const marginStart = (i > 0 && i <= marginExcess ? 1 : 0) + marginSize;
                                if (!adjusted.has(item)) {
                                    item.modifyBox(MARGIN_START, marginStart);
                                    item.modifyBox(MARGIN_END, marginSize);
                                    adjusted.add(item);
                                }
                                else {
                                    item.cssPX(dimension, gridSize / itemCount, false, true);
                                }
                            }
                        }
                        break;
                    }
                    case 'space-between': {
                        if (itemCount > 1) {
                            const [marginSize, marginExcess] = getMarginSize(itemCount - 1, gridSize);
                            for (let i = 0; i < itemCount; i++) {
                                for (const item of new Set(flatMultiArray(rowData[i]))) {
                                    if (i < itemCount - 1) {
                                        const marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                                        if (!adjusted.has(item)) {
                                            item.modifyBox(MARGIN_END, marginEnd);
                                            adjusted.add(item);
                                        }
                                        else {
                                            item.cssPX(dimension, marginEnd, false, true);
                                        }
                                    }
                                    else {
                                        const unitSpan = parseInt(item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan'));
                                        if (unitSpan > 1) {
                                            const marginEnd = marginSize + (marginExcess > 0 ? Math.max(marginExcess - 1, 1) : 0);
                                            item.cssPX(dimension, marginEnd, false, true);
                                            if (adjusted.has(item)) {
                                                item.modifyBox(MARGIN_END, -marginEnd, false);
                                            }
                                        }
                                    }
                                }
                            }
                            break;
                        }
                        else {
                            return;
                        }
                    }
                    case 'space-evenly': {
                        const [marginSize, marginExcess] = getMarginSize(itemCount + 1, gridSize);
                        for (let i = 0; i < itemCount; i++) {
                            for (const item of new Set(flatMultiArray(rowData[i]))) {
                                let marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                                if (!adjusted.has(item)) {
                                    if (outerWrapper) {
                                        marginEnd /= 2;
                                        item.modifyBox(MARGIN_START, marginEnd);
                                        item.modifyBox(MARGIN_END, marginEnd);
                                    }
                                    else {
                                        if (i === 0) {
                                            item.modifyBox(MARGIN_START, marginSize);
                                        }
                                        item.modifyBox(MARGIN_END, marginEnd);
                                    }
                                    adjusted.add(item);
                                }
                                else {
                                    item.cssPX(dimension, marginEnd, false, true);
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
        else {
            if (outerWrapper) {
                switch (alignment) {
                    case 'center':
                        node.anchorParent(horizontal ? STRING_ANDROID.HORIZONTAL : STRING_ANDROID.VERTICAL, 'packed', 0.5, true);
                        break;
                    case 'right':
                        if (!horizontal) {
                            break;
                        }
                    case 'end':
                    case 'flex-end':
                        node.anchorParent(horizontal ? STRING_ANDROID.HORIZONTAL : STRING_ANDROID.VERTICAL, 'packed', 1, true);
                        break;
                }
            }
            else {
                let gridSize = getGridSize(node, mainData, horizontal, maxScreenWidth, maxScreenHeight);
                if (gridSize > 0) {
                    switch (alignment) {
                        case 'center':
                            gridSize /= 2;
                            if (horizontal) {
                                node.modifyBox(256 /* PADDING_LEFT */, Math.floor(gridSize));
                            }
                            else {
                                node.modifyBox(32 /* PADDING_TOP */, Math.floor(gridSize));
                                node.modifyBox(128 /* PADDING_BOTTOM */, Math.ceil(gridSize));
                            }
                            break;
                        case 'right':
                            if (!horizontal) {
                                break;
                            }
                        case 'end':
                        case 'flex-end':
                            node.modifyBox(horizontal ? 256 /* PADDING_LEFT */ : 32 /* PADDING_TOP */, gridSize);
                            break;
                    }
                }
            }
        }
    }
    function getCellDimensions(node, horizontal, section, insideGap) {
        let width;
        let height;
        let columnWeight;
        let rowWeight;
        if (section.every(value => isPx(value))) {
            let px = insideGap;
            for (const value of section) {
                px += parseFloat(value);
            }
            const dimension = formatPX$2(px);
            if (horizontal) {
                width = dimension;
            }
            else {
                height = dimension;
            }
        }
        else if (section.every(value => REGEX_FR.test(value))) {
            let fr = 0;
            for (const value of section) {
                fr += parseFloat(value);
            }
            const weight = truncate$3(fr, node.localSettings.floatPrecision);
            if (horizontal) {
                width = '0px';
                columnWeight = weight;
            }
            else {
                height = '0px';
                rowWeight = weight;
            }
        }
        else if (section.every(value => isPercent$2(value))) {
            const percent = formatPercent((section.reduce((a, b) => a + parseFloat(b), 0) + insideGap / (horizontal ? node.actualWidth : node.actualHeight)) / 100);
            if (horizontal) {
                width = percent;
            }
            else {
                height = percent;
            }
        }
        else {
            if (horizontal) {
                width = 'wrap_content';
            }
            else {
                height = 'wrap_content';
            }
        }
        return [width, height, columnWeight, rowWeight];
    }
    function checkRowSpan(node, mainData, rowSpan, rowStart) {
        if (rowSpan === 1 && mainData.rowSpanMultiple[rowStart]) {
            const rowData = mainData.rowData;
            const rowCount = rowData.length;
            for (const item of flatMultiArray(rowData[rowStart])) {
                if (item !== node) {
                    const data = item.data(CSS_GRID, 'cellData');
                    if (data && data.rowSpan > rowSpan && (rowStart === 0 || data.rowSpan < rowCount)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function checkAutoDimension(data, horizontal) {
        const unit = data.unit;
        const length = unit.length;
        if (length && unit.every(value => value === 'auto')) {
            data.unit = new Array(length).fill(horizontal ? '1fr' : '');
        }
    }
    function checkFlexibleParent(node) {
        const condition = (item) => {
            var _a;
            const parent = item.actualParent;
            if ((_a = parent) === null || _a === void 0 ? void 0 : _a.gridElement) {
                const mainData = parent.data(CSS_GRID, 'mainData');
                const cellData = item.data(CSS_GRID, 'cellData');
                if (mainData && cellData) {
                    const unit = mainData.column.unit;
                    const { columnStart, columnSpan } = cellData;
                    let valid = false;
                    for (let i = 0; i < columnSpan; i++) {
                        const value = unit[columnStart + i];
                        if (REGEX_FR.test(value) || isPercent$2(value)) {
                            valid = true;
                        }
                        else if (value === 'auto') {
                            valid = false;
                            break;
                        }
                    }
                    return valid;
                }
            }
            else if (Node$2.isFlexDirection(item, 'row') && item.flexbox.grow > 0) {
                return true;
            }
            return false;
        };
        return node.ascend({ condition, error: item => item.hasWidth }).length > 0;
    }
    function requireDirectionSpacer(data, dimension) {
        const { gap, length, unit } = data;
        let size = 0;
        let percent = 0;
        for (const value of unit) {
            if (isPx(value)) {
                size += parseFloat(value);
            }
            else if (isPercent$2(value)) {
                percent += parseFloat(value);
            }
            else if (REGEX_FR.test(value)) {
                return 0;
            }
        }
        const content = Math.ceil(size + (length - 1) * gap);
        if (percent > 0) {
            return (percent + (content / dimension * 100));
        }
        else if (size > 0) {
            return content < dimension ? -1 : 0;
        }
        return 0;
    }
    const isPx = (value) => CSS$1.PX.test(value);
    class CssGrid$1 extends squared.base.extensions.CssGrid {
        processNode(node, parent) {
            var _a;
            super.processNode(node, parent);
            const mainData = node.data(CSS_GRID, 'mainData');
            if (mainData) {
                const { column, row } = mainData;
                const unit = column.unit;
                const columnCount = column.length;
                const layout = LayoutUI.create({
                    parent,
                    node,
                    alignmentType: 4 /* AUTO_LAYOUT */,
                    children: node.children,
                    rowCount: row.length,
                    columnCount
                });
                if (!node.documentRoot && !node.hasWidth && mainData.rowSpanMultiple.length === 0 && unit.length === columnCount && unit.every(value => REGEX_FR.test(value)) && checkFlexibleParent(node)) {
                    const rowData = mainData.rowData;
                    const rowCount = rowData.length;
                    const barrierData = new Array(rowCount);
                    let valid = true;
                    invalid: {
                        for (let i = 0; i < rowCount; i++) {
                            const nodes = [];
                            const data = rowData[i];
                            const length = data.length;
                            for (let j = 0; j < length; j++) {
                                const cell = data[j];
                                if (((_a = cell) === null || _a === void 0 ? void 0 : _a.length) === 1) {
                                    nodes.push(cell[0]);
                                }
                                else {
                                    valid = false;
                                    break invalid;
                                }
                            }
                            barrierData[i] = nodes;
                        }
                    }
                    if (valid) {
                        column.frTotal = unit.reduce((a, b) => a + parseFloat(b), 0);
                        row.frTotal = row.unit.reduce((a, b) => a + (REGEX_FR.test(b) ? parseFloat(b) : 0), 0);
                        node.setLayoutWidth('match_parent');
                        node.lockAttr('android', 'layout_width');
                        node.data(CSS_GRID, 'barrierData', barrierData);
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
                        return { output: this.application.renderNode(layout), complete: true };
                    }
                }
                checkAutoDimension(column, true);
                checkAutoDimension(row, false);
                layout.setContainerType(CONTAINER_NODE.GRID);
                return { output: this.application.renderNode(layout), complete: true };
            }
            return undefined;
        }
        processChild(node, parent) {
            var _a;
            const mainData = parent.data(CSS_GRID, 'mainData');
            const cellData = node.data(CSS_GRID, 'cellData');
            let renderAs;
            let outputAs;
            if (mainData && cellData) {
                const layoutConstraint = parent.layoutConstraint;
                const { alignContent, column, row } = mainData;
                const { alignSelf, justifySelf } = node.flexbox;
                const applyLayout = (item, horizontal, dimension) => {
                    const [data, cellStart, cellSpan, minDimension] = horizontal ? [column, cellData.columnStart, cellData.columnSpan, 'minWidth'] : [row, cellData.rowStart, cellData.rowSpan, 'minHeight'];
                    const { unit, unitMin } = data;
                    let size = 0;
                    let minSize = 0;
                    let minUnitSize = 0;
                    let sizeWeight = 0;
                    let fitContent = false;
                    let autoSize = false;
                    for (let i = 0, j = 0; i < cellSpan; i++) {
                        const k = cellStart + i;
                        const min = unitMin[k];
                        if (min !== '') {
                            minUnitSize += parent.parseUnit(min);
                        }
                        let value = unit[k];
                        if (!hasValue(value)) {
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
                            autoSize = true;
                            if (cellSpan < unit.length && (!parent.hasPX(dimension) || unit.some(px => isLength$2(px)) || value === 'max-content')) {
                                size = node.bounds[dimension];
                                minSize = 0;
                                sizeWeight = 0;
                                break;
                            }
                            else if (horizontal) {
                                size = 0;
                                minSize = 0;
                                sizeWeight = -1;
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
                        else if (REGEX_FR.test(value)) {
                            if (horizontal || parent.hasHeight) {
                                if (sizeWeight === -1) {
                                    sizeWeight = 0;
                                }
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
                            if (sizeWeight === -1) {
                                sizeWeight = 0;
                            }
                            sizeWeight += parseFloat(value) / 100;
                            minSize = size;
                            size = 0;
                        }
                        else {
                            const cellSize = item.parseUnit(value, horizontal ? 'width' : 'height');
                            if (minSize === 0) {
                                size += cellSize;
                            }
                            else {
                                minSize += cellSize;
                            }
                        }
                        if (node.textElement && CHAR$3.UNITZERO.test(min)) {
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
                        if (data.autoFill && size === 0 && (horizontal ? row.length : column.length) === 1) {
                            size = Math.max(node.actualWidth, minUnitSize);
                            sizeWeight = 0;
                        }
                        else {
                            minSize = minUnitSize;
                        }
                    }
                    if (minSize > 0 && !item.hasPX(minDimension)) {
                        item.css(minDimension, formatPX$2(minSize), true);
                    }
                    if (layoutConstraint) {
                        if (horizontal) {
                            if (!item.hasPX('width', false)) {
                                item.app('layout_constraintWidth_percent', truncate$3(sizeWeight / column.frTotal, item.localSettings.floatPrecision));
                                item.setLayoutWidth('0px');
                            }
                            if (cellStart === 0) {
                                item.anchor('left', 'parent');
                                item.anchorStyle(STRING_ANDROID.HORIZONTAL, 'spread', 0);
                            }
                            else {
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
                        }
                        else if (!item.hasPX('height', false)) {
                            if (sizeWeight > 0) {
                                if (row.length === 1) {
                                    item.setLayoutHeight('match_parent');
                                }
                                else {
                                    item.app('layout_constraintHeight_percent', truncate$3(sizeWeight / row.frTotal, item.localSettings.floatPrecision));
                                    item.setLayoutHeight('0px');
                                }
                            }
                            else if (size > 0) {
                                if (item.contentBox) {
                                    size -= item.contentBoxHeight;
                                }
                                item.css(autoSize ? 'minHeight' : 'height', formatPX$2(size), true);
                            }
                        }
                    }
                    else {
                        item.android(horizontal ? 'layout_column' : 'layout_row', cellStart.toString());
                        item.android(horizontal ? 'layout_columnSpan' : 'layout_rowSpan', cellSpan.toString());
                        let columnWeight = horizontal && column.flexible;
                        if (sizeWeight !== 0) {
                            if (!item.hasPX(dimension)) {
                                if (horizontal) {
                                    if (cellData.columnSpan === column.length) {
                                        item.setLayoutWidth('match_parent');
                                    }
                                    else {
                                        item.setLayoutWidth('0px');
                                        item.android('layout_columnWeight', sizeWeight === -1 ? '0.01' : truncate$3(sizeWeight, node.localSettings.floatPrecision));
                                        item.mergeGravity('layout_gravity', 'fill_horizontal');
                                    }
                                    columnWeight = false;
                                }
                                else {
                                    if (cellData.rowSpan === row.length) {
                                        item.setLayoutHeight('match_parent');
                                    }
                                    else {
                                        item.setLayoutHeight('0px');
                                        item.android('layout_rowWeight', truncate$3(sizeWeight, node.localSettings.floatPrecision));
                                        item.mergeGravity('layout_gravity', 'fill_vertical');
                                    }
                                }
                            }
                        }
                        else if (size > 0) {
                            const maxDimension = horizontal ? 'maxWidth' : 'maxHeight';
                            if (fitContent && !item.hasPX(maxDimension)) {
                                item.css(maxDimension, formatPX$2(size), true);
                                item.mergeGravity('layout_gravity', horizontal ? 'fill_horizontal' : 'fill_vertical');
                            }
                            else if (!item.hasPX(dimension)) {
                                if (item.contentBox) {
                                    size -= horizontal ? item.contentBoxWidth : item.contentBoxHeight;
                                }
                                if (autoSize && !parent.hasPX(maxDimension)) {
                                    item.css(minDimension, formatPX$2(size), true);
                                    if (horizontal) {
                                        item.setLayoutWidth('wrap_content');
                                    }
                                    else {
                                        item.setLayoutHeight('wrap_content');
                                    }
                                }
                                else {
                                    item.css(dimension, formatPX$2(size), true);
                                }
                            }
                        }
                        else if (unit.length === 0 && !item.hasPX(dimension)) {
                            if (horizontal) {
                                item.setLayoutWidth('match_parent', false);
                            }
                            else {
                                item.setLayoutHeight('wrap_content', false);
                            }
                        }
                        if (columnWeight) {
                            item.android('layout_columnWeight', '0');
                        }
                    }
                    return [cellStart, cellSpan];
                };
                if (REGEX_ALIGNSELF.test(alignSelf) || REGEX_JUSTIFYSELF.test(justifySelf) || layoutConstraint) {
                    renderAs = this.application.createNode({ parent, replace: node });
                    renderAs.containerName = node.containerName;
                    renderAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    renderAs.inherit(node, 'base', 'initial');
                    renderAs.exclude({ resource: NODE_RESOURCE$1.BOX_STYLE | NODE_RESOURCE$1.ASSET, procedure: NODE_PROCEDURE$3.CUSTOMIZATION });
                    renderAs.resetBox(30 /* MARGIN */ | 480 /* PADDING */);
                    renderAs.render(parent);
                    node.transferBox(30 /* MARGIN */, renderAs);
                    let inlineWidth = true;
                    if (REGEX_JUSTIFYLEFT.test(justifySelf)) {
                        node.mergeGravity('layout_gravity', 'left');
                    }
                    else if (REGEX_JUSTIFYRIGHT.test(justifySelf)) {
                        node.mergeGravity('layout_gravity', 'right');
                    }
                    else if (justifySelf === 'center') {
                        node.mergeGravity('layout_gravity', STRING_ANDROID.CENTER_HORIZONTAL);
                    }
                    else {
                        inlineWidth = false;
                    }
                    if (!node.hasWidth) {
                        node.setLayoutWidth(inlineWidth ? 'wrap_content' : 'match_parent', false);
                    }
                    if (REGEX_ALIGNTOP.test(alignSelf)) {
                        node.mergeGravity('layout_gravity', 'top');
                    }
                    else if (REGEX_ALIGNBOTTOM.test(alignSelf)) {
                        node.mergeGravity('layout_gravity', 'bottom');
                    }
                    else if (alignSelf === 'center') {
                        node.mergeGravity('layout_gravity', STRING_ANDROID.CENTER_VERTICAL);
                    }
                    else if (!node.hasHeight) {
                        node.setLayoutHeight('match_parent', false);
                    }
                    outputAs = this.application.renderNode(new LayoutUI(parent, renderAs, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, renderAs.children));
                }
                else {
                    node.mergeGravity('layout_gravity', 'top');
                }
                const target = renderAs || node;
                applyLayout(target, true, 'width');
                if (target !== node || node.hasPX('maxHeight')) {
                    target.mergeGravity('layout_gravity', 'fill');
                }
                else if (!target.hasPX('width')) {
                    target.mergeGravity('layout_gravity', 'fill_horizontal');
                }
                const [rowStart, rowSpan] = applyLayout(target, false, 'height');
                if (alignContent === 'normal' && !parent.hasPX('height') && !node.hasPX('minHeight') && (!row.unit[rowStart] || row.unit[rowStart] === 'auto') && Math.floor(node.bounds.height) > ((_a = node.data(CSS_GRID, 'boundsData')) === null || _a === void 0 ? void 0 : _a.height) && checkRowSpan(node, mainData, rowSpan, rowStart)) {
                    target.css('minHeight', formatPX$2(node.actualHeight), true);
                }
                else if (!target.hasPX('height') && !target.hasPX('maxHeight') && !(row.length === 1 && /^space/.test(alignContent)) && !REGEX_ALIGNSELF.test(mainData.alignItems)) {
                    target.mergeGravity('layout_gravity', 'fill_vertical');
                }
            }
            return { parent: renderAs, renderAs, outputAs };
        }
        postBaseLayout(node) {
            const mainData = node.data(CSS_GRID, 'mainData');
            if (mainData) {
                const controller = this.controller;
                const { alignContent, children, column, emptyRows, justifyContent, row, rowDirection, rowData } = mainData;
                const outerWrapper = node.renderParent === node.outerWrapper;
                const insertId = children[children.length - 1].id;
                if (CssGrid.isJustified(node)) {
                    setContentSpacing(node, mainData, justifyContent, true, 'width', outerWrapper, 16 /* MARGIN_LEFT */, 4 /* MARGIN_RIGHT */, this.controller.userSettings.resolutionScreenWidth - node.bounds.left, 0);
                    switch (justifyContent) {
                        case 'space-around':
                        case 'space-evenly':
                            if (outerWrapper) {
                                node.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed', 0.5, true);
                            }
                            break;
                        default:
                            if (mainData.column.length === 1) {
                                node.setLayoutWidth('match_parent');
                            }
                            break;
                    }
                }
                else {
                    const length = column.length;
                    if (node.blockStatic || node.hasWidth) {
                        const percent = requireDirectionSpacer(column, node.actualWidth);
                        if (percent !== 0 && percent < 100) {
                            if (percent > 0) {
                                controller.addAfterOutsideTemplate(insertId, controller.renderSpace({
                                    width: formatPercent((100 - percent) / 100),
                                    height: 'match_parent',
                                    rowSpan: row.length,
                                    android: {
                                        layout_row: '0',
                                        layout_column: length.toString(),
                                        layout_columnWeight: column.flexible ? '0.01' : ''
                                    }
                                }), false);
                            }
                            node.android('columnCount', (length + 1).toString());
                        }
                    }
                    if (outerWrapper) {
                        if (node.contentBoxWidth > 0 && node.hasPX('width', false)) {
                            node.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed', 0.5, true);
                        }
                        else if (length === 1) {
                            node.setLayoutWidth('match_parent');
                        }
                        else {
                            node.setLayoutWidth('wrap_content', false);
                        }
                    }
                }
                if (CssGrid.isAligned(node)) {
                    setContentSpacing(node, mainData, alignContent, false, 'height', outerWrapper, 2 /* MARGIN_TOP */, 8 /* MARGIN_BOTTOM */, 0, this.controller.userSettings.resolutionScreenHeight);
                    if (outerWrapper) {
                        switch (alignContent) {
                            case 'space-around':
                            case 'space-evenly':
                                node.anchorParent(STRING_ANDROID.VERTICAL, 'packed', 0.5, true);
                                break;
                        }
                    }
                }
                else {
                    if (node.hasHeight) {
                        const percent = requireDirectionSpacer(row, node.actualHeight);
                        if (percent !== 0 && percent < 100) {
                            const length = row.length;
                            if (percent > 0) {
                                controller.addAfterOutsideTemplate(insertId, controller.renderSpace({
                                    width: 'match_parent',
                                    height: formatPercent((100 - percent) / 100),
                                    columnSpan: column.length,
                                    android: {
                                        layout_row: length.toString(),
                                        layout_column: '0',
                                        layout_rowWeight: row.flexible ? '0.01' : ''
                                    }
                                }), false);
                            }
                            node.android('rowCount', (length + 1).toString());
                        }
                    }
                    if (outerWrapper) {
                        if (node.contentBoxHeight > 0 && node.hasPX('height', false)) {
                            node.anchorParent(STRING_ANDROID.VERTICAL, 'packed', 0.5, true);
                        }
                        else {
                            node.setLayoutHeight('wrap_content', false);
                        }
                    }
                }
                const barrierData = node.data(CSS_GRID, 'barrierData');
                if (barrierData) {
                    const rowCount = barrierData.length;
                    if (length === 1) {
                        for (const item of barrierData[0]) {
                            item.anchorParent(STRING_ANDROID.VERTICAL, 'packed', 0);
                        }
                    }
                    else {
                        const { gap, length } = column;
                        let previousBarrierId = '';
                        for (let i = 0; i < rowCount; i++) {
                            const nodes = barrierData[i];
                            const barrierId = controller.addBarrier(nodes, 'bottom');
                            let previousItem;
                            for (let j = 0; j < length; j++) {
                                const item = nodes[j];
                                if (item) {
                                    if (i === 0) {
                                        item.anchor('top', 'parent');
                                        item.anchor('bottomTop', barrierId);
                                        item.anchorStyle(STRING_ANDROID.VERTICAL);
                                    }
                                    else {
                                        if (i === rowCount - 1) {
                                            item.anchor('bottom', 'parent');
                                        }
                                        else {
                                            item.anchor('bottomTop', barrierId);
                                        }
                                        item.anchor('topBottom', previousBarrierId);
                                    }
                                    if (j < length - 1) {
                                        item.modifyBox(4 /* MARGIN_RIGHT */, -gap);
                                    }
                                    previousItem = item;
                                }
                                else if (previousItem) {
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
                                            layout_constraintWidth_percent: (column.unit.slice(j, length).reduce((a, b) => a + parseFloat(b), 0) / column.frTotal).toString()
                                        }
                                    };
                                    controller.addAfterInsideTemplate(node.id, controller.renderSpace(options), false);
                                    previousItem.anchor('rightLeft', options.documentId);
                                    break;
                                }
                            }
                            previousBarrierId = barrierId;
                        }
                    }
                }
                if (!node.layoutConstraint) {
                    const { flexible, gap, unit } = rowDirection ? column : row;
                    const unitSpan = unit.length;
                    let k = -1;
                    let l = 0;
                    const createSpacer = (i, horizontal, unitData, gapSize, opposing = 'wrap_content', opposingWeight = '', opposingMargin = 0) => {
                        let width = '';
                        let height = '';
                        if (k !== -1) {
                            const section = unitData.slice(k, k + l);
                            let layout_columnWeight = '';
                            let layout_rowWeight = '';
                            let rowSpan = 1;
                            let columnSpan = 1;
                            let layout_row;
                            let layout_column;
                            if (horizontal) {
                                layout_row = i.toString();
                                layout_column = k.toString();
                                height = opposing;
                                layout_columnWeight = flexible ? '0.01' : '';
                                layout_rowWeight = opposingWeight;
                                columnSpan = l;
                            }
                            else {
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
                                }
                                else {
                                    height = 'match_parent';
                                    layout_rowWeight = '';
                                }
                                gapSize = 0;
                            }
                            else {
                                const [widthA, heightA, columnWeightA, rowWeightA] = getCellDimensions(node, horizontal, section, gapSize * (section.length - 1));
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
                            controller.addAfterOutsideTemplate(insertId, controller.renderSpace({
                                width,
                                height,
                                rowSpan,
                                columnSpan,
                                android: {
                                    [horizontal ? node.localizeString(STRING_ANDROID.MARGIN_RIGHT) : 'bottom']: gapSize > 0 && (k + l) < unitData.length ? '@dimen/' + Resource.insertStoredAsset('dimens', `${node.controlId}_cssgrid_${horizontal ? 'column' : 'row'}_gap`, formatPX$2(gapSize)) : '',
                                    [horizontal ? 'bottom' : node.localizeString(STRING_ANDROID.MARGIN_RIGHT)]: opposingMargin > 0 ? '@dimen/' + Resource.insertStoredAsset('dimens', `${node.controlId}_cssgrid_${horizontal ? 'row' : 'column'}_gap`, formatPX$2(opposingMargin)) : '',
                                    layout_row,
                                    layout_column,
                                    layout_rowWeight,
                                    layout_columnWeight,
                                    layout_gravity: 'fill'
                                }
                            }), isPx(width) || isPx(height));
                            k = -1;
                        }
                        l = 0;
                        return [width, height];
                    };
                    let length = Math.max(rowData.length, 1);
                    for (let i = 0; i < length; i++) {
                        if (emptyRows[i] === undefined) {
                            const data = rowData[i];
                            for (let j = 0; j < unitSpan; j++) {
                                if (data[j]) {
                                    createSpacer(i, rowDirection, unit, gap);
                                }
                                else {
                                    if (k === -1) {
                                        k = j;
                                    }
                                    l++;
                                }
                            }
                        }
                    }
                    createSpacer(length - 1, rowDirection, unit, gap);
                    length = emptyRows.length;
                    for (let i = 0; i < length; i++) {
                        const emptyRow = emptyRows[i];
                        if (emptyRow) {
                            const lengthA = emptyRow.length;
                            for (let j = 0; j < lengthA; j++) {
                                const value = emptyRow[j];
                                if (value > 0) {
                                    k = j;
                                    const { unit: unitA, gap: gapA } = rowDirection ? row : column;
                                    const { unit: unitB, gap: gapB } = !rowDirection ? row : column;
                                    const dimensions = getCellDimensions(node, !rowDirection, [unitA[j]], 0);
                                    l = value === Number.POSITIVE_INFINITY ? unitB.length : 1;
                                    createSpacer(i, rowDirection, unitB, gapB, dimensions[rowDirection ? 1 : 0], dimensions[rowDirection ? 3 : 2], i < length - 1 ? gapA : 0);
                                }
                            }
                        }
                    }
                }
            }
        }
        postOptimize(node) {
            var _a;
            const mainData = node.data(CSS_GRID, 'mainData');
            if (mainData) {
                if (node.blockStatic && !node.hasPX('minWidth', false) && ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.layoutElement) === false) {
                    const { gap, length, unit } = mainData.column;
                    let minWidth = gap * (length - 1);
                    for (const value of unit) {
                        if (isPx(value)) {
                            minWidth += parseFloat(value);
                        }
                        else {
                            return;
                        }
                    }
                    if (minWidth > node.width) {
                        node.android('minWidth', formatPX$2(minWidth));
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
        init(element) {
            if (this.included(element)) {
                this.application.rootElements.add(element);
            }
            return false;
        }
    }

    var LayoutUI$1 = squared.base.LayoutUI;
    const $lib$6 = squared.lib;
    const $base$2 = squared.base;
    const $base_lib$1 = $base$2.lib;
    const { isLength: isLength$3 } = $lib$6.css;
    const { truncate: truncate$4 } = $lib$6.math;
    const { capitalize: capitalize$1, sameArray, withinRange: withinRange$2 } = $lib$6.util;
    const { BOX_STANDARD: BOX_STANDARD$3, NODE_ALIGNMENT: NODE_ALIGNMENT$3 } = $base_lib$1.enumeration;
    const NodeUI$1 = $base$2.NodeUI;
    const FLEXBOX = $base_lib$1.constant.EXT_NAME.FLEXBOX;
    const MAP_horizontal = {
        orientation: STRING_ANDROID.HORIZONTAL,
        orientationInverse: STRING_ANDROID.VERTICAL,
        WH: 'Width',
        HW: 'Height',
        LT: 'left',
        TL: 'top',
        RB: 'right',
        BR: 'bottom',
        LRTB: 'leftRight',
        RLBT: 'rightLeft'
    };
    const MAP_vertical = {
        orientation: STRING_ANDROID.VERTICAL,
        orientationInverse: STRING_ANDROID.HORIZONTAL,
        WH: 'Height',
        HW: 'Width',
        LT: 'top',
        TL: 'left',
        RB: 'bottom',
        BR: 'right',
        LRTB: 'topBottom',
        RLBT: 'bottomTop'
    };
    function adjustGrowRatio(parent, items, attr) {
        const horizontal = attr === 'width';
        const hasDimension = 'has' + capitalize$1(attr);
        const setPercentage = (item) => item.flexbox.basis = (item.bounds[attr] / parent.box[attr] * 100) + '%';
        let percent = parent[hasDimension] || parent.blockStatic && withinRange$2(parent.parseUnit(parent.css(horizontal ? 'maxWidth' : 'maxHeight')), parent.box.width);
        let result = 0;
        let growShrinkType = 0;
        for (const item of items) {
            if (percent) {
                if (horizontal) {
                    if (item.innerMostWrapped.autoMargin.horizontal) {
                        percent = false;
                        break;
                    }
                }
                else {
                    if (item.innerMostWrapped.autoMargin.vertical) {
                        percent = false;
                        break;
                    }
                }
            }
            result += item.flexbox.grow;
        }
        if (items.length > 1 && (horizontal || percent)) {
            const groupBasis = [];
            const percentage = [];
            let maxBasis;
            let maxBasisUnit = 0;
            let maxDimension = 0;
            let maxRatio = NaN;
            for (const item of items) {
                const { alignSelf, basis, shrink, grow } = item.flexbox;
                const dimension = item.bounds[attr];
                let growPercent = false;
                if (grow > 0 || shrink !== 1) {
                    const value = basis === 'auto' ? item.parseUnit(item.css(attr), attr) : item.parseUnit(basis, attr);
                    if (value > 0) {
                        let largest = false;
                        if (dimension < value) {
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
                            maxBasisUnit = value;
                            maxDimension = dimension;
                        }
                        groupBasis.push({
                            item,
                            basis: value,
                            dimension,
                            shrink,
                            grow
                        });
                        continue;
                    }
                    else if (grow > 0 && dimension > item[attr]) {
                        growPercent = true;
                    }
                }
                else if (isLength$3(basis)) {
                    groupBasis.push({
                        item,
                        basis: Math.min(dimension, item.parseUnit(basis, attr)),
                        dimension,
                        shrink,
                        grow
                    });
                    item.flexbox.basis = 'auto';
                    continue;
                }
                if (alignSelf === 'auto' && (percent && !item[hasDimension] || growPercent)) {
                    percentage.push(item);
                }
            }
            if (growShrinkType !== 0) {
                if (groupBasis.length > 1) {
                    for (const data of groupBasis) {
                        const { basis, item } = data;
                        if (item === maxBasis || basis === maxBasisUnit && (growShrinkType === 1 && maxRatio === data.shrink || growShrinkType === 2 && maxRatio === data.grow)) {
                            item.flexbox.grow = 1;
                        }
                        else if (basis > 0) {
                            item.flexbox.grow = ((data.dimension / basis) / (maxDimension / maxBasisUnit)) * basis / maxBasisUnit;
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
                if (item.cascadeSome(child => child.multiline && child.ascend({ condition: above => above[hasDimension], including: parent }).length === 0)) {
                    setPercentage(item);
                }
            }
        }
        return result;
    }
    function getBaseline(nodes) {
        for (const node of nodes) {
            if (node.textElement && node.baseline) {
                return node;
            }
        }
        return NodeUI$1.baseline(nodes);
    }
    function setLayoutWeightOpposing(item, value, horizontal) {
        if (!horizontal) {
            item.setLayoutWidth(value);
        }
        else {
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
        return undefined;
    }
    class Flexbox extends squared.base.extensions.Flexbox {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data(FLEXBOX, 'mainData');
            const { directionColumn, directionRow, rowCount, columnCount } = mainData;
            if (directionRow && rowCount === 1 || directionColumn && columnCount === 1) {
                node.containerType = CONTAINER_NODE.CONSTRAINT;
                node.addAlign(4 /* AUTO_LAYOUT */);
                node.addAlign(directionColumn ? 8 /* HORIZONTAL */ : 16 /* VERTICAL */);
                mainData.wrap = false;
                return { include: true };
            }
            else {
                const containerType = directionRow && node.hasHeight || directionColumn && node.hasWidth || node.some(item => !item.pageFlow) ? CONTAINER_NODE.CONSTRAINT : CONTAINER_NODE.LINEAR;
                return {
                    output: this.application.renderNode(LayoutUI$1.create({
                        parent,
                        node,
                        containerType,
                        alignmentType: 4 /* AUTO_LAYOUT */ | (directionColumn ? 8 /* HORIZONTAL */ : 16 /* VERTICAL */),
                        itemCount: node.length,
                        rowCount,
                        columnCount
                    })),
                    complete: true
                };
            }
        }
        processChild(node, parent) {
            if (node.hasAlign(128 /* SEGMENTED */)) {
                return {
                    output: this.application.renderNode(new LayoutUI$1(parent, node, CONTAINER_NODE.CONSTRAINT, 4 /* AUTO_LAYOUT */, node.children)),
                    complete: true
                };
            }
            else {
                const autoMargin = node.autoMargin;
                if (autoMargin.horizontal || autoMargin.vertical && parent.hasHeight) {
                    const mainData = parent.data(FLEXBOX, 'mainData');
                    if (mainData) {
                        const children = mainData.children;
                        const index = children.findIndex(item => item === node);
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
                            container.flexbox = node.flexbox;
                            mainData.children[index] = container;
                            if (autoMargin.horizontal && !node.hasWidth) {
                                node.setLayoutWidth('wrap_content');
                            }
                            return {
                                parent: container,
                                renderAs: container,
                                outputAs: this.application.renderNode(new LayoutUI$1(parent, container, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, container.children))
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
                const controller = this.controller;
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
                                            const sibling = previous[j];
                                            if (sibling.linear.right > largest.linear.right) {
                                                largest = sibling;
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
                const applyLayout = (partition, horizontal) => {
                    var _a;
                    const length = partition.length;
                    if (length === 0) {
                        return;
                    }
                    const { orientation, orientationInverse, WH, HW, LT, TL, RB, BR, LRTB, RLBT } = horizontal ? MAP_horizontal : MAP_vertical;
                    const orientationWeight = `layout_constraint${capitalize$1(orientation)}_weight`;
                    const WHL = horizontal ? 'width' : 'height';
                    const HWL = HW.toLowerCase();
                    const dimension = node['has' + HW];
                    const dimensionInverse = node['has' + WH];
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
                        let percentWidth;
                        let percentHeight;
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
                            if (horizontal) {
                                percentWidth = View.availablePercent(seg, 'width', node.box.width);
                                percentHeight = 1;
                            }
                            else {
                                percentWidth = 1;
                                percentHeight = View.availablePercent(seg, 'height', node.box.height);
                            }
                            growAll = horizontal || dimensionInverse;
                            growAvailable = 1 - adjustGrowRatio(node, seg, WHL);
                            if (lengthA > 1) {
                                let sizeCount = 0;
                                for (const chain of seg) {
                                    const value = (chain.data(FLEXBOX, 'boundsData') || chain.bounds)[HWL];
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
                                chain.anchor(RLBT, next.documentId);
                            }
                            if (previous) {
                                chain.anchor(LRTB, previous.documentId);
                            }
                            if (opposing) {
                                if (parentEnd && lengthA > 1 && dimensionInverse) {
                                    setLayoutWeight(chain, 1);
                                }
                                chain.anchor(TL, 'parent');
                            }
                            else {
                                const innerWrapped = getOuterFrameChild(chain);
                                const autoMargin = chain.innerMostWrapped.autoMargin;
                                if (horizontal) {
                                    if (autoMargin.horizontal) {
                                        if (innerWrapped) {
                                            innerWrapped.mergeGravity('layout_gravity', autoMargin.leftRight ? STRING_ANDROID.CENTER_HORIZONTAL : chain.localizeString(autoMargin.left ? 'right' : 'left'));
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
                                            else if (next) {
                                                chain.anchorDelete(RLBT);
                                            }
                                        }
                                    }
                                }
                                else {
                                    if (autoMargin.vertical) {
                                        if (innerWrapped) {
                                            innerWrapped.mergeGravity('layout_gravity', autoMargin.topBottom ? STRING_ANDROID.CENTER_VERTICAL : (chain.localizeString(autoMargin.top ? 'bottom' : 'top')));
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
                                            else if (next) {
                                                chain.anchorDelete(RLBT);
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
                                                baseline = getBaseline(seg);
                                            }
                                            if (baseline) {
                                                if (baseline !== chain) {
                                                    chain.anchor('baseline', baseline.documentId);
                                                }
                                                else {
                                                    chain.anchorParent(orientationInverse, 'packed');
                                                }
                                            }
                                        }
                                        break;
                                    case 'center':
                                        chain.anchorParent(orientationInverse, 'packed', 0.5);
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
                                                if (innerWrapped === undefined || !chain.innerMostWrapped.autoMargin[orientationInverse]) {
                                                    chain.anchorStyle(orientationInverse, 'packed', wrapReverse ? 1 : 0);
                                                }
                                                if (chain[HWL] === 0) {
                                                    if (!horizontal && chain.blockStatic) {
                                                        setLayoutWeightOpposing(chain, 'match_parent', horizontal);
                                                    }
                                                    else if (isNaN(maxSize)) {
                                                        if (!horizontal && !wrap && chain.length || dimension && alignContent === 'normal') {
                                                            setLayoutWeightOpposing(chain, dimension ? '0px' : 'match_parent', horizontal);
                                                        }
                                                        else {
                                                            setLayoutWeightOpposing(chain, 'wrap_content', horizontal);
                                                        }
                                                    }
                                                    else if (lengthA === 1) {
                                                        if (!horizontal) {
                                                            setLayoutWeightOpposing(chain, dimension ? '0px' : 'match_parent', horizontal);
                                                        }
                                                        else {
                                                            setLayoutWeightOpposing(chain, 'wrap_content', horizontal);
                                                        }
                                                    }
                                                    else if ((chain.naturalElement ? (chain.data(FLEXBOX, 'boundsData') || chain.bounds)[HWL] : Number.POSITIVE_INFINITY) < maxSize) {
                                                        setLayoutWeightOpposing(chain, chain.flexElement && chain.css('flexDirection').startsWith(horizontal ? 'row' : 'column') ? 'match_parent' : '0px', horizontal);
                                                        if (((_a = innerWrapped) === null || _a === void 0 ? void 0 : _a.autoMargin[orientation]) === false) {
                                                            setLayoutWeightOpposing(innerWrapped, 'match_parent', horizontal);
                                                        }
                                                    }
                                                    else {
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
                                [percentWidth, percentHeight] = Controller.setFlexDimension(chain, WHL, percentWidth, percentHeight);
                                if (!chain.innerMostWrapped.has('flexGrow')) {
                                    growAll = false;
                                }
                            }
                            chain.anchored = true;
                            chain.positioned = true;
                        }
                        if (growAll) {
                            for (const item of seg) {
                                setLayoutWeight(item, item.flexbox.grow);
                            }
                        }
                        else if (growAvailable > 0) {
                            for (const item of layoutWeight) {
                                const autoMargin = item.innerMostWrapped.autoMargin;
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
                                        }
                                        else {
                                            centered = true;
                                        }
                                        break;
                                    case 'space-around':
                                        if (lengthA > 1) {
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
                            if (spreadInside || !wrap && seg.some(item => item.app(orientationWeight) !== '') && !sameArray(seg, item => item.app(orientationWeight))) {
                                segStart.anchorStyle(orientation, 'spread_inside', 0, false);
                            }
                            else if (!centered) {
                                segStart.anchorStyle(orientation, 'packed', directionReverse ? 1 : 0, false);
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
    const $lib$7 = squared.lib;
    const $base_lib$2 = squared.base.lib;
    const { formatPX: formatPX$3 } = $lib$7.css;
    const { captureMap: captureMap$1, withinRange: withinRange$3 } = $lib$7.util;
    const { BOX_STANDARD: BOX_STANDARD$4, NODE_ALIGNMENT: NODE_ALIGNMENT$4 } = $base_lib$2.enumeration;
    const GRID = $base_lib$2.constant.EXT_NAME.GRID;
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
                return {
                    output: this.application.renderNode(LayoutUI$2.create({
                        parent,
                        node,
                        containerType: CONTAINER_NODE.GRID,
                        alignmentType: 4 /* AUTO_LAYOUT */,
                        children: node.children,
                        columnCount
                    })),
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
                    layout = controller.processLayoutHorizontal(new LayoutUI$2(parent, controller.createNodeGroup(node, siblings, parent, true), 0, cellData.block ? 64 /* BLOCK */ : 0, siblings));
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
                        var _a;
                        const cellData = item.data(GRID, 'cellData');
                        if (cellData) {
                            const parent = item.actualParent;
                            if (((_a = parent) === null || _a === void 0 ? void 0 : _a.visible) === false) {
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
                                            controller.addAfterOutsideTemplate(item.id, controller.renderSpace({
                                                width: 'match_parent',
                                                height: '@dimen/' + Resource.insertStoredAsset('dimens', node.controlId + '_grid_space', formatPX$3(heightBottom)),
                                                columnSpan: columnCount,
                                                android: {}
                                            }), false);
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
                if (withinRange$3(node.box.right, maxRight)) {
                    node.setLayoutWidth('wrap_content');
                }
            }
        }
    }

    var LayoutUI$3 = squared.base.LayoutUI;
    const $lib$8 = squared.lib;
    const $base_lib$3 = squared.base.lib;
    const { formatPX: formatPX$4, getBackgroundPosition } = $lib$8.css;
    const { convertInt } = $lib$8.util;
    const { STRING_SPACE } = $lib$8.xml;
    const { BOX_STANDARD: BOX_STANDARD$5, NODE_ALIGNMENT: NODE_ALIGNMENT$5, NODE_TEMPLATE: NODE_TEMPLATE$1 } = $base_lib$3.enumeration;
    const LIST = $base_lib$3.constant.EXT_NAME.LIST;
    class List extends squared.base.extensions.List {
        processNode(node, parent) {
            const layout = new LayoutUI$3(parent, node, 0, 0, node.children);
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
                else {
                    return undefined;
                }
                return { output: this.application.renderNode(layout), complete: true };
            }
            return undefined;
        }
        processChild(node, parent) {
            const mainData = node.data(LIST, 'mainData');
            if (mainData) {
                const application = this.application;
                const controller = this.controller;
                const firstChild = parent.firstStaticChild === node;
                const inside = node.css('listStylePosition') === 'inside';
                const marginTop = node.marginTop;
                let value = mainData.ordinal || '';
                let minWidth = node.marginLeft;
                let marginLeft = 0;
                let columnCount = 0;
                let adjustPadding = false;
                let resetPadding = NaN;
                node.modifyBox(16 /* MARGIN_LEFT */);
                if (parent.layoutGrid) {
                    columnCount = convertInt(parent.android('columnCount')) || 1;
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
                let container;
                if (node.length === 0) {
                    const { containerType, alignmentType } = controller.containerTypeVertical;
                    container = controller.createNodeWrapper(node, parent, undefined, {
                        controlName: View.getControlName(CONTAINER_NODE.LINEAR, node.api),
                        containerType,
                        alignmentType
                    });
                    if (marginTop !== 0) {
                        node.resetBox(2 /* MARGIN_TOP */, container);
                    }
                }
                else {
                    container = node;
                }
                let ordinal = value === '' ? node.find((item) => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft) : undefined;
                if (ordinal) {
                    if (columnCount === 3) {
                        node.android('layout_columnSpan', '2');
                    }
                    if (!ordinal.hasWidth) {
                        minWidth += ordinal.marginLeft;
                        if (minWidth > 0) {
                            ordinal.android('minWidth', formatPX$4(minWidth));
                        }
                    }
                    ordinal.parent = parent;
                    ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.INLINE);
                    ordinal.modifyBox(16 /* MARGIN_LEFT */);
                    ordinal.render(parent);
                    const layout = new LayoutUI$3(parent, ordinal);
                    if (ordinal.inlineText || ordinal.length === 0) {
                        layout.setContainerType(CONTAINER_NODE.TEXT);
                    }
                    else {
                        if (layout.singleRowAligned) {
                            layout.setContainerType(CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */);
                        }
                        else {
                            layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 2 /* UNKNOWN */);
                        }
                        layout.retain(ordinal.children);
                    }
                    application.addLayoutTemplate(parent, ordinal, application.renderNode(layout));
                }
                else {
                    let gravity = 'right';
                    let paddingRight = 0;
                    let top = 0;
                    let left = 0;
                    let image;
                    if (mainData.imageSrc !== '') {
                        const resource = this.resource;
                        if (mainData.imagePosition) {
                            ({ top, left } = getBackgroundPosition(mainData.imagePosition, node.actualDimension, node.fontSize, resource.getImage(mainData.imageSrc)),
                                '',
                                node.localSettings.screenDimension);
                            if (node.marginLeft < 0) {
                                resetPadding = node.marginLeft + (parent.paddingLeft > 0 ? parent.paddingLeft : parent.marginLeft);
                            }
                            else {
                                adjustPadding = false;
                                marginLeft = node.marginLeft;
                            }
                            minWidth = node.paddingLeft - left;
                            node.modifyBox(256 /* PADDING_LEFT */);
                            gravity = '';
                        }
                        image = resource.addImageSrc(mainData.imageSrc);
                    }
                    const options = createViewAttribute();
                    ordinal = application.createNode({ parent });
                    ordinal.childIndex = node.childIndex;
                    ordinal.containerName = node.containerName + '_ORDINAL';
                    ordinal.inherit(node, 'textStyle');
                    if (value !== '' && !/\.$/.test(value)) {
                        ordinal.fontSize *= 0.75;
                    }
                    if (gravity === 'right') {
                        if (image) {
                            paddingRight = Math.max(minWidth / 6, 4);
                            minWidth -= paddingRight;
                        }
                        else if (value !== '') {
                            value += STRING_SPACE.repeat(value.length === 1 ? 3 : 2);
                        }
                    }
                    if (columnCount === 3) {
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
                                scaleType: gravity === 'right' && !inside ? 'fitEnd' : 'fitStart',
                                baselineAlignBottom: adjustPadding ? 'true' : ''
                            });
                        }
                        else if (value !== '') {
                            ordinal.textContent = value;
                            ordinal.inlineText = true;
                            ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                            if (node.tagName === 'DFN') {
                                minWidth += 8;
                                ordinal.modifyBox(64 /* PADDING_RIGHT */, 8);
                            }
                        }
                        else {
                            ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                            ordinal.renderExclude = false;
                            node.modifyBox(256 /* PADDING_LEFT */);
                        }
                        const { paddingTop, lineHeight } = node;
                        ordinal.cssApply({
                            minWidth: minWidth > 0 ? formatPX$4(minWidth) : '',
                            marginLeft: marginLeft > 0 ? formatPX$4(marginLeft) : '',
                            paddingTop: paddingTop > 0 && node.getBox(32 /* PADDING_TOP */)[0] === 0 ? formatPX$4(paddingTop) : '',
                            paddingRight: paddingRight > 0 ? formatPX$4(paddingRight) : '',
                            lineHeight: lineHeight > 0 ? formatPX$4(lineHeight) : ''
                        });
                        ordinal.apply(options);
                        ordinal.modifyBox(256 /* PADDING_LEFT */, 2);
                        if (ordinal.cssTry('display', 'block')) {
                            ordinal.setBounds();
                            ordinal.cssFinally('display');
                        }
                        ordinal.saveAsInitial();
                        if (gravity !== '') {
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
                    }
                }
                if (marginTop !== 0) {
                    ordinal.modifyBox(2 /* MARGIN_TOP */, marginTop);
                    ordinal.companion = container;
                    this.subscribers.add(ordinal);
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
                }
                if (node !== container) {
                    return {
                        parent: container,
                        renderAs: container,
                        outputAs: application.renderNode(new LayoutUI$3(parent, container, CONTAINER_NODE.LINEAR, 16 /* VERTICAL */ | 2 /* UNKNOWN */, container.children))
                    };
                }
            }
            return undefined;
        }
        postConstraints(node) {
            const companion = !node.naturalChild && node.companion;
            if (companion) {
                const [reset, adjustment] = companion.getBox(2 /* MARGIN_TOP */);
                const value = node.getBox(2 /* MARGIN_TOP */)[1];
                node.modifyBox(2 /* MARGIN_TOP */, (reset === 1 ? 0 : adjustment) - value);
            }
        }
    }

    class Relative extends squared.base.extensions.Relative {
    }

    var LayoutUI$4 = squared.base.LayoutUI;
    const { formatPX: formatPX$5 } = squared.lib.css;
    const $base_lib$4 = squared.base.lib;
    const { APP_SECTION: APP_SECTION$1, NODE_ALIGNMENT: NODE_ALIGNMENT$6, NODE_PROCEDURE: NODE_PROCEDURE$4, NODE_RESOURCE: NODE_RESOURCE$2 } = $base_lib$4.enumeration;
    const SPRITE = $base_lib$4.constant.EXT_NAME.SPRITE;
    class Sprite extends squared.base.extensions.Sprite {
        processNode(node, parent) {
            const mainData = node.data(SPRITE, 'mainData');
            if (mainData) {
                const drawable = this.resource.addImageSrc(node.backgroundImage);
                if (drawable !== '') {
                    const { width, height } = mainData.image;
                    const { top, left } = mainData.position;
                    const container = this.application.createNode({ parent, replace: node });
                    container.inherit(node, 'base', 'initial', 'styleMap');
                    container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    container.exclude({ resource: NODE_RESOURCE$2.ASSET, procedure: NODE_PROCEDURE$4.CUSTOMIZATION, section: APP_SECTION$1.ALL });
                    node.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                    node.exclude({ resource: NODE_RESOURCE$2.FONT_STYLE | NODE_RESOURCE$2.BOX_STYLE });
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
                        backgroundColor: 'transparent'
                    });
                    node.unsetCache();
                    node.android('src', '@drawable/' + drawable);
                    return {
                        renderAs: container,
                        outputAs: this.application.renderNode(new LayoutUI$4(parent, container, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, container.children)),
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
    class Substitute extends squared.base.ExtensionUI {
        constructor(name, framework, options, tagNames) {
            super(name, framework, options, tagNames);
            this.require(EXT_ANDROID.EXTERNAL, true);
        }
        processNode(node, parent) {
            const data = getDataSet$1(node.element, this.name);
            const controlName = data.tag;
            if (controlName) {
                node.containerType = node.blockStatic ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE;
                node.setControlType(controlName);
                node.render(parent);
                const tagChild = data.tagChild;
                if (tagChild) {
                    const name = this.name;
                    node.addAlign(4 /* AUTO_LAYOUT */);
                    node.each((item) => {
                        if (item.styleElement) {
                            const dataset = item.dataset;
                            dataset.use = name;
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

    var LayoutUI$5 = squared.base.LayoutUI;
    const $lib$9 = squared.lib;
    const $base_lib$5 = squared.base.lib;
    const { formatPX: formatPX$6 } = $lib$9.css;
    const { aboveRange: aboveRange$2, convertFloat: convertFloat$2, convertInt: convertInt$1, trimEnd } = $lib$9.util;
    const { UNITZERO } = $lib$9.regex.CHAR;
    const { CSS_UNIT: CSS_UNIT$1, NODE_ALIGNMENT: NODE_ALIGNMENT$8 } = $base_lib$5.enumeration;
    const TABLE = $base_lib$5.constant.EXT_NAME.TABLE;
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
                            item.android('layout_columnWeight', item.toElementString('colSpan', '1'));
                            item.setLayoutWidth('0px');
                        }
                        else {
                            const { downsized, expand, percent } = data;
                            if (expand) {
                                if (percent) {
                                    const value = convertFloat$2(percent) / 100;
                                    if (value > 0) {
                                        item.setLayoutWidth('0px');
                                        item.android('layout_columnWeight', trimEnd(value.toPrecision(3), '0'));
                                        if (!requireWidth) {
                                            requireWidth = !item.hasWidth;
                                        }
                                    }
                                }
                            }
                            else if (expand === false) {
                                item.android('layout_columnWeight', '0');
                            }
                            if (downsized) {
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
                        node.css('width', formatPX$6(node.actualWidth));
                    }
                }
                else if (node.hasPX('width') && node.actualWidth < Math.floor(node.bounds.width)) {
                    if (mainData.layoutFixed) {
                        node.android('width', formatPX$6(node.bounds.width));
                    }
                    else {
                        if (!node.hasPX('minWidth')) {
                            node.android('minWidth', formatPX$6(node.actualWidth));
                        }
                        node.css('width', 'auto');
                    }
                }
                if (node.hasPX('height') && node.actualHeight < Math.floor(node.bounds.height)) {
                    if (!node.hasPX('minHeight')) {
                        node.android('minHeight', formatPX$6(node.actualHeight));
                    }
                    node.css('height', 'auto');
                }
                return {
                    output: this.application.renderNode(LayoutUI$5.create({
                        parent,
                        node,
                        containerType: CONTAINER_NODE.GRID,
                        alignmentType: 4 /* AUTO_LAYOUT */,
                        children: node.children,
                        rowCount: mainData.rowCount,
                        columnCount: mainData.columnCount
                    })),
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
                    controller.addAfterOutsideTemplate(node.id, controller.renderSpace({
                        width: 'wrap_content',
                        height: 'wrap_content',
                        columnSpan: spaceSpan,
                        android: {}
                    }), false);
                }
                node.mergeGravity('layout_gravity', 'fill');
                if (parent.css('empty-cells') === 'hide' && node.naturalChildren.length === 0 && node.textContent === '') {
                    node.hide(true);
                }
            }
            return undefined;
        }
        postOptimize(node) {
            const layoutWidth = convertInt$1(node.layoutWidth);
            if (layoutWidth > 0) {
                const width = node.bounds.width;
                if (width > layoutWidth) {
                    node.setLayoutWidth(formatPX$6(width));
                }
                if (node.cssInitial('width') === 'auto' && node.renderChildren.every(item => item.inlineWidth)) {
                    node.renderEach((item) => {
                        item.setLayoutWidth('0px');
                        item.android('layout_columnWeight', '1');
                    });
                }
            }
        }
    }

    var LayoutUI$6 = squared.base.LayoutUI;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$9 } = squared.base.lib.enumeration;
    class VerticalAlign extends squared.base.extensions.VerticalAlign {
        processNode(node, parent) {
            super.processNode(node, parent);
            return {
                output: this.application.renderNode(new LayoutUI$6(parent, node, CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */, node.children))
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
    const $lib$a = squared.lib;
    const { formatPX: formatPX$7 } = $lib$a.css;
    const { hypotenuse } = $lib$a.math;
    const { withinRange: withinRange$4 } = $lib$a.util;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$a } = squared.base.lib.enumeration;
    class Guideline extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.options = {
                circlePosition: false
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
                output: this.application.renderNode(new LayoutUI$7(parent, node, CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, node.children))
            };
        }
        postBaseLayout(node) {
            const controller = this.controller;
            const circlePosition = this.options.circlePosition;
            const { left, top } = node.box;
            let anchor;
            node.each((item) => {
                const linear = item.linear;
                if (withinRange$4(linear.left, left)) {
                    item.anchor('left', 'parent');
                    item.anchorStyle(STRING_ANDROID.HORIZONTAL);
                }
                if (withinRange$4(linear.top, top)) {
                    item.anchor('top', 'parent');
                    item.anchorStyle(STRING_ANDROID.VERTICAL);
                }
                if (circlePosition) {
                    if (item.anchored) {
                        anchor = item;
                    }
                    else {
                        const { horizontal, vertical } = item.constraint;
                        if (anchor) {
                            if (vertical && !anchor.constraint.vertical) {
                                anchor = item;
                            }
                        }
                        else if (vertical) {
                            anchor = item;
                        }
                        else if (horizontal) {
                            anchor = item;
                        }
                    }
                }
                item.positioned = true;
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
                        const radius = Math.round(hypotenuse(x, y));
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

    var LayoutUI$8 = squared.base.LayoutUI;
    const { resolveURL } = squared.lib.css;
    const { CSS_UNIT: CSS_UNIT$2, NODE_ALIGNMENT: NODE_ALIGNMENT$b, NODE_RESOURCE: NODE_RESOURCE$3, NODE_TEMPLATE: NODE_TEMPLATE$3 } = squared.base.lib.enumeration;
    const isHideMargin = (node, visibleStyle) => visibleStyle.backgroundImage && (node.marginTop > 0 || node.marginRight > 0 || node.marginBottom > 0 || node.marginLeft > 0);
    const isFullScreen = (node, visibleStyle) => node.backgroundColor !== '' && visibleStyle.borderWidth && !node.inline && node.css('height') !== '100%' && node.css('minHeight') !== '100%' && !node.actualParent.visibleStyle.background || visibleStyle.backgroundImage && visibleStyle.backgroundRepeatY;
    const isParentVisible = (node, visibleStyle) => node.actualParent.visibleStyle.background === true && (hasWidth(node) && node.css('height') !== '100%' && node.css('minHeight') !== '100%' || visibleStyle.backgroundImage && (visibleStyle.backgroundRepeatY || node.css('backgroundPositionY').includes('bottom')));
    const hasWidth = (node) => !node.blockStatic || node.hasPX('width') || node.has('maxWidth', 2 /* LENGTH */ | 4 /* PERCENT */, { not: '100%' });
    class Background extends squared.base.ExtensionUI {
        is(node) {
            return node.documentBody;
        }
        condition(node) {
            const visibleStyle = node.visibleStyle;
            return isFullScreen(node, visibleStyle) || isHideMargin(node, visibleStyle);
        }
        processNode(node, parent) {
            var _a;
            const controller = this.controller;
            const outerWrapper = node.outerMostWrapper;
            let target;
            let targetParent;
            if (!outerWrapper.naturalChild) {
                target = outerWrapper;
                targetParent = target.parent;
                const renderChildren = targetParent.renderChildren;
                const index = renderChildren.findIndex(item => item === target);
                if (index !== -1) {
                    renderChildren.splice(index, 1);
                    (_a = targetParent.renderTemplates) === null || _a === void 0 ? void 0 : _a.splice(index, 1);
                    target.rendered = false;
                    target.renderParent = undefined;
                }
                else {
                    target = undefined;
                    targetParent = undefined;
                }
            }
            const actualNode = target || node;
            const actualParent = targetParent || parent;
            const { backgroundColor, visibleStyle } = node;
            const parentVisible = isParentVisible(node, visibleStyle);
            let container;
            let parentAs;
            if (backgroundColor !== '') {
                container = controller.createNodeWrapper(actualNode, actualParent);
                container.unsafe('excludeResource', NODE_RESOURCE$3.BOX_SPACING);
                container.css('backgroundColor', backgroundColor);
                container.setCacheValue('backgroundColor', backgroundColor);
                if (!parentVisible) {
                    container.setLayoutWidth('match_parent');
                    container.setLayoutHeight('match_parent');
                }
                else {
                    container.setLayoutWidth(hasWidth(node) ? 'wrap_content' : 'match_parent');
                    container.setLayoutHeight('wrap_content');
                }
                container.unsetCache('visibleStyle');
                node.css('backgroundColor', 'transparent');
                node.setCacheValue('backgroundColor', '');
                visibleStyle.backgroundColor = false;
            }
            const backgroundImage = node.backgroundImage;
            if (backgroundImage !== '') {
                const image = this.application.resourceHandler.getImage(resolveURL(backgroundImage));
                const fitContent = !!image && image.height < node.actualHeight;
                if (container === undefined || parentVisible || actualParent.visibleStyle.background || !visibleStyle.backgroundRepeatY || fitContent) {
                    if (container) {
                        parentAs = container;
                        parentAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                        parentAs.addAlign(4096 /* SINGLE */);
                        parentAs.render(actualParent);
                        this.application.addLayoutTemplate(actualParent, container, {
                            type: 1 /* XML */,
                            node: container,
                            controlName: container.controlName
                        });
                        container = controller.createNodeWrapper(actualNode, parentAs);
                        container.documentRoot = false;
                        parentAs.documentRoot = true;
                    }
                    else {
                        container = controller.createNodeWrapper(actualNode, actualParent);
                    }
                }
                container.setLayoutWidth('match_parent');
                container.unsafe('excludeResource', NODE_RESOURCE$3.BOX_SPACING);
                const height = actualParent.cssInitial('height');
                const minHeight = actualParent.cssInitial('minHeight');
                let backgroundSize;
                if (height === '' && minHeight === '') {
                    container.setLayoutHeight(!parentVisible && (visibleStyle.backgroundRepeatY || image && !fitContent || node.has('backgroundSize')) ? 'match_parent' : 'wrap_content');
                }
                else {
                    if (height !== '100%' && minHeight !== '100%') {
                        const offsetHeight = actualParent.toElementInt('offsetHeight');
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
            visibleStyle.background = visibleStyle.borderWidth || visibleStyle.backgroundImage || visibleStyle.backgroundColor;
            if (container) {
                if (target) {
                    target.render(container);
                    this.application.addLayoutTemplate(container, target, {
                        type: 1 /* XML */,
                        node: target,
                        controlName: target.controlName
                    });
                    return {
                        parent: target,
                        parentAs: actualParent,
                        renderAs: container,
                        outputAs: this.application.renderNode(new LayoutUI$8(actualParent, container, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, container.children)),
                    };
                }
                else {
                    return {
                        parent: container,
                        parentAs,
                        renderAs: container,
                        outputAs: this.application.renderNode(new LayoutUI$8(parentAs || parent, container, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, container.children)),
                        remove: true
                    };
                }
            }
            return { remove: true };
        }
    }

    var LayoutUI$9 = squared.base.LayoutUI;
    const $base$3 = squared.base;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$c, NODE_RESOURCE: NODE_RESOURCE$4 } = $base$3.lib.enumeration;
    const CssGrid$2 = $base$3.extensions.CssGrid;
    const getLayoutDimension = (value) => value === 'space-between' ? 'match_parent' : 'wrap_content';
    class Grid$1 extends squared.base.ExtensionUI {
        is(node) {
            return node.gridElement;
        }
        condition(node) {
            return CssGrid$2.isJustified(node) || CssGrid$2.isAligned(node);
        }
        processNode(node, parent) {
            const container = this.controller.createNodeWrapper(node, parent, undefined, {
                controlName: View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api),
                containerType: CONTAINER_NODE.CONSTRAINT,
                resource: NODE_RESOURCE$4.ASSET,
                resetMargin: !node.documentBody
            });
            container.inherit(node, 'styleMap', 'boxStyle');
            if (CssGrid$2.isJustified(node)) {
                node.setLayoutWidth(getLayoutDimension(node.css('justifyContent')));
            }
            else {
                if (node.hasPX('width', false)) {
                    node.setLayoutWidth('match_parent');
                }
                else {
                    container.setLayoutWidth(node.blockStatic ? 'match_parent' : 'wrap_content');
                }
            }
            if (CssGrid$2.isAligned(node)) {
                node.setLayoutHeight(getLayoutDimension(node.css('alignContent')));
            }
            else {
                if (node.hasPX('height', false)) {
                    node.setLayoutHeight('match_parent');
                }
                else {
                    container.setLayoutHeight('wrap_content');
                }
            }
            container.unsetCache('contentBoxWidth', 'contentBoxHeight');
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new LayoutUI$9(parent, container, CONTAINER_NODE.CONSTRAINT, 4096 /* SINGLE */, container.children)),
                include: true
            };
        }
    }

    var LayoutUI$a = squared.base.LayoutUI;
    const { aboveRange: aboveRange$3, belowRange } = squared.lib.util;
    const { BOX_STANDARD: BOX_STANDARD$6, NODE_ALIGNMENT: NODE_ALIGNMENT$d } = squared.base.lib.enumeration;
    class Fixed extends squared.base.ExtensionUI {
        is(node) {
            return node.naturalElement && (node.contentBoxWidth > 0 || node.contentBoxHeight > 0 || node.documentBody);
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
                        if (value >= 0 && (fixed || value < paddingRight || node.documentBody && node.hasPX('width') && node.positionStatic)) {
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
                        if (value >= 0 && (fixed || value < paddingBottom || node.documentBody && node.hasPX('height') && node.positionStatic)) {
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
                const container = this.controller.createNodeWrapper(node, parent, mainData.children, { resetMargin: !node.documentRoot && !node.pageFlow || parent.layoutGrid });
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
                if (!node.pageFlow) {
                    if (!node.hasPX('width') && node.has('left') && node.has('right')) {
                        node.setLayoutWidth('match_parent');
                    }
                    if (!node.hasPX('height') && node.has('top') && node.has('bottom')) {
                        node.setLayoutHeight('match_parent');
                    }
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
                this.subscribers.add(container);
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: this.application.renderNode(new LayoutUI$a(parent, container, CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, container.children))
                };
            }
            return undefined;
        }
        postBaseLayout(node) {
            var _a, _b;
            const innerWrapped = node.innerMostWrapped;
            if (innerWrapped) {
                const maxData = innerWrapped.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData');
                if (((_b = (_a = maxData) === null || _a === void 0 ? void 0 : _a.container) === null || _b === void 0 ? void 0 : _b.outerWrapper) === node) {
                    if (maxData.width) {
                        node.css('maxWidth', innerWrapped.css('maxWidth'));
                        node.setLayoutWidth('0px');
                        node.contentBoxWidth = innerWrapped.contentBoxWidth;
                        innerWrapped.setLayoutWidth('wrap_content', false);
                    }
                    if (maxData.height) {
                        node.css('maxHeight', innerWrapped.css('maxHeight'));
                        node.setLayoutHeight('0px');
                        node.contentBoxHeight = innerWrapped.contentBoxHeight;
                        innerWrapped.setLayoutHeight('wrap_content', false);
                    }
                }
            }
        }
    }

    var LayoutUI$b = squared.base.LayoutUI;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$e } = squared.base.lib.enumeration;
    class MaxWidthHeight extends squared.base.ExtensionUI {
        is(node) {
            return !node.inputElement && !node.support.maxDimension;
        }
        condition(node, parent) {
            const width = node.hasPX('maxWidth') && (node.blockStatic || parent.layoutVertical || node.onlyChild && (parent.blockStatic || parent.hasWidth) || parent.layoutFrame) && !parent.layoutElement && !(parent.layoutConstraint && parent.blockStatic && parent.naturalChildren.every(item => item.pageFlow && item.naturalChildren.every(child => child.pageFlow))) && !(parent.hasAlign(256 /* COLUMN */) && parent.hasAlign(4 /* AUTO_LAYOUT */));
            const height = node.hasPX('maxHeight') && (parent.hasHeight || parent.gridElement || parent.tableElement);
            if (width || height) {
                node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData', { width, height });
                return true;
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData');
            if (mainData) {
                const container = this.controller.createNodeWrapper(node, parent, undefined, { controlName: View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api), containerType: CONTAINER_NODE.CONSTRAINT });
                container.addAlign(64 /* BLOCK */);
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
                        if (!mainData.width && node.blockStatic && !node.hasWidth) {
                            node.setLayoutWidth('match_parent', false);
                        }
                    }
                }
                mainData.container = container;
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: this.application.renderNode(new LayoutUI$b(parent, container, container.containerType, 4096 /* SINGLE */, container.children))
                };
            }
            return undefined;
        }
    }

    var LayoutUI$c = squared.base.LayoutUI;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$f } = squared.base.lib.enumeration;
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
                outputAs: this.application.renderNode(new LayoutUI$c(parent, container, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, container.children)),
                include: true
            };
        }
    }

    var LayoutUI$d = squared.base.LayoutUI;
    const { formatPX: formatPX$8 } = squared.lib.css;
    const { BOX_STANDARD: BOX_STANDARD$7, NODE_ALIGNMENT: NODE_ALIGNMENT$g } = squared.base.lib.enumeration;
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
            return !node.documentRoot && node.css('overflowX') !== 'hidden';
        }
        condition(node) {
            return node.some((item) => outsideX(item, node));
        }
        processNode(node, parent) {
            const outside = node.filter((item) => outsideX(item, node));
            const container = this.controller.createNodeWrapper(node, parent, outside, { controlName: View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api), containerType: CONTAINER_NODE.CONSTRAINT });
            node.resetBox(2 /* MARGIN_TOP */ | 8 /* MARGIN_BOTTOM */, container);
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
                    container.cssPX('width', Math.max(node.marginLeft, 0) + offset, false);
                }
                else if (node.percentWidth) {
                    container.css('width', 'auto');
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
            container.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData', { offsetLeft: node.marginLeft + node.paddingLeft, firstChild, nextSibling: node });
            this.subscribers.add(container);
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new LayoutUI$d(parent, container, container.containerType, 8 /* HORIZONTAL */ | 4096 /* SINGLE */, container.children))
            };
        }
        postBaseLayout(node) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData');
            if (mainData) {
                const options = { excluding: node, attr: 'outerWrapper' };
                let firstChild = mainData.firstChild;
                if (firstChild) {
                    firstChild = (firstChild.ascend(options).pop() || firstChild);
                    firstChild.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed');
                    firstChild.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                    firstChild.modifyBox(16 /* MARGIN_LEFT */, mainData.offsetLeft);
                    Controller.setConstraintDimension(firstChild);
                    firstChild.positioned = true;
                }
                const nextSibling = (mainData.nextSibling.ascend(options).pop() || mainData.nextSibling);
                nextSibling.anchorParent(STRING_ANDROID.HORIZONTAL, 'packed');
                nextSibling.anchorParent(STRING_ANDROID.VERTICAL, 'packed');
                Controller.setConstraintDimension(nextSibling);
                nextSibling.positioned = true;
            }
        }
    }

    var LayoutUI$e = squared.base.LayoutUI;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$h } = squared.base.lib.enumeration;
    const isFlexible = (node) => !node.documentParent.layoutElement && !/^table/.test(node.display);
    class Percent extends squared.base.ExtensionUI {
        is(node) {
            return node.pageFlow;
        }
        condition(node, parent) {
            if (node.percentWidth && !parent.layoutConstraint && node.cssInitial('width') !== '100%' && (node.documentRoot || node.hasPX('height') || (parent.layoutVertical || node.onlyChild) && (parent.blockStatic || parent.hasPX('width')))) {
                return isFlexible(node);
            }
            else if (node.percentHeight && node.cssInitial('height') !== '100%' && (node.documentRoot || parent.hasHeight && node.onlyChild)) {
                return isFlexible(node);
            }
            return false;
        }
        processNode(node, parent) {
            const container = this.controller.createNodeWrapper(node, parent, undefined, { resetMargin: true });
            if (node.percentWidth) {
                container.css('display', 'block');
                container.setLayoutWidth('match_parent');
                node.setLayoutWidth(node.cssInitial('width') === '100%' ? 'match_parent' : '0px');
            }
            else {
                container.setLayoutWidth('wrap_content');
            }
            if (node.percentHeight) {
                container.setLayoutHeight('match_parent');
                node.setLayoutHeight(node.cssInitial('height') === '100%' ? 'match_parent' : '0px');
            }
            else {
                container.setLayoutHeight('wrap_content');
            }
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new LayoutUI$e(parent, container, CONTAINER_NODE.CONSTRAINT, 4096 /* SINGLE */, container.children)),
                include: true
            };
        }
    }

    const $base$4 = squared.base;
    const { getElementAsNode: getElementAsNode$1 } = squared.lib.session;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$i, NODE_RESOURCE: NODE_RESOURCE$5, NODE_TEMPLATE: NODE_TEMPLATE$4 } = $base$4.lib.enumeration;
    const NodeUI$2 = $base$4.NodeUI;
    function setBaselineIndex(children, container) {
        let valid = false;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            const item = children[i];
            if (item.toElementBoolean('checked')) {
                item.android('checked', 'true');
            }
            if (!valid && item.baseline && item.parent === container && container.layoutLinear && (i === 0 || container.layoutHorizontal)) {
                container.android('baselineAlignedChildIndex', i.toString());
                valid = true;
            }
            item.positioned = true;
        }
        return valid;
    }
    const getInputName = (element) => element.name ? element.name.trim() : '';
    class RadioGroup extends squared.base.ExtensionUI {
        is(node) {
            return node.is(CONTAINER_NODE.RADIO);
        }
        condition(node) {
            return getInputName(node.element) !== '' && !node.positioned;
        }
        processNode(node, parent) {
            var _a;
            const inputName = getInputName(node.element);
            const radiogroup = [];
            const removeable = [];
            let first = -1;
            let last = -1;
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
                }
                else if (!item.visible) {
                    const labelFor = item.labelFor;
                    if (labelFor && radiogroup.includes(labelFor)) {
                        last = index;
                    }
                }
                if (remove) {
                    removeable.push(remove);
                }
            });
            let length = radiogroup.length;
            if (length > 1) {
                const linearX = NodeUI$2.linearData(parent.children.slice(first, last + 1)).linearX;
                const container = this.controller.createNodeGroup(node, radiogroup, parent, true);
                const controlName = CONTAINER_ANDROID.RADIOGROUP;
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
                container.exclude({ resource: NODE_RESOURCE$5.ASSET });
                const dataset = node.dataset;
                container.render(dataset.target && !dataset.use ? this.application.resolveTarget(dataset.target) : parent);
                if (!setBaselineIndex(radiogroup, container)) {
                    container.css('verticalAlign', 'middle');
                    container.setCacheValue('baseline', false);
                    container.setCacheValue('verticalAlign', 'middle');
                }
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
            else {
                radiogroup.length = 0;
                const name = getInputName(node.element);
                const sessionId = node.sessionId;
                document.querySelectorAll(`input[type=radio][name=${name}]`).forEach((element) => {
                    const item = getElementAsNode$1(element, sessionId);
                    if (item) {
                        radiogroup.push(item);
                    }
                });
                length = radiogroup.length;
                if (length > 1 && radiogroup.includes(node)) {
                    const controlName = CONTAINER_ANDROID.RADIOGROUP;
                    const data = new Map();
                    for (const radio of radiogroup) {
                        const parents = radio.ascend({ condition: (item) => item.layoutLinear, error: (item) => item.controlName === controlName, every: true });
                        if (parents.length) {
                            for (const item of parents) {
                                const value = (data.get(item) || 0) + 1;
                                data.set(item, value);
                            }
                        }
                        else {
                            data.clear();
                            break;
                        }
                    }
                    for (const [group, value] of data.entries()) {
                        if (value === length) {
                            group.unsafe('controlName', controlName);
                            group.containerType = CONTAINER_NODE.RADIO;
                            const renderParent = group.renderParent;
                            if (renderParent) {
                                const template = (_a = renderParent.renderTemplates) === null || _a === void 0 ? void 0 : _a.find(item => { var _a; return ((_a = item) === null || _a === void 0 ? void 0 : _a.node) === group; });
                                if (template) {
                                    template.controlName = controlName;
                                }
                            }
                            setBaselineIndex(radiogroup, group);
                            return undefined;
                        }
                    }
                }
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
    const { BOX_STANDARD: BOX_STANDARD$8, NODE_ALIGNMENT: NODE_ALIGNMENT$j, NODE_RESOURCE: NODE_RESOURCE$6, NODE_TEMPLATE: NODE_TEMPLATE$5 } = squared.base.lib.enumeration;
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
            const verticalScroll = node.api < 29 /* Q */ ? CONTAINER_ANDROID.VERTICAL_SCROLL : CONTAINER_ANDROID_X.VERTICAL_SCROLL;
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
                        container = this.application.createNode({ element: node.element, parent });
                        container.inherit(node, 'base', 'initial', 'styleMap');
                        parent.appendTry(node, container);
                    }
                    else {
                        container = this.application.createNode({ parent });
                        container.inherit(node, 'base');
                        container.exclude({ resource: NODE_RESOURCE$6.BOX_STYLE });
                    }
                    container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                    container.exclude({ resource: NODE_RESOURCE$6.ASSET });
                    container.resetBox(480 /* PADDING */);
                    container.childIndex = node.childIndex;
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
                        item.render(dataset.target && !dataset.use ? this.application.resolveTarget(dataset.target) : parent);
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
                for (let i = length - 1, j = 0; i >= 0; i--, j++) {
                    const item = scrollView[i];
                    if (j === 0) {
                        parent = item;
                        item.innerWrapped = node;
                    }
                    else {
                        item.innerWrapped = parent;
                    }
                }
                node.overflow = 0;
                node.exclude({ resource: NODE_RESOURCE$6.BOX_STYLE });
                node.resetBox(30 /* MARGIN */, scrollView[0]);
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
    const { formatPercent: formatPercent$1, formatPX: formatPX$a, getBackgroundPosition: getBackgroundPosition$1, isLength: isLength$4, isPercent: isPercent$3 } = $lib$b.css;
    const { truncate: truncate$5 } = $lib$b.math;
    const { CHAR: CHAR$4, CSS: CSS$2, XML: XML$1 } = $lib$b.regex;
    const { flatArray, isEqual, resolvePath: resolvePath$1 } = $lib$b.util;
    const { applyTemplate: applyTemplate$1 } = $lib$b.xml;
    const { BOX_STANDARD: BOX_STANDARD$9, CSS_UNIT: CSS_UNIT$3, NODE_RESOURCE: NODE_RESOURCE$7 } = squared.base.lib.enumeration;
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
            case 'ridge': {
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
        if (!value.includes(' ') && adjacent.includes(' ')) {
            return CHAR$4.LOWERCASE.test(value) ? (value === 'initial' ? fallback : value) + ' 0px' : fallback + ' ' + value;
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
                const { width, height } = dimension;
                let positionX = angleExtent.x;
                let positionY = angleExtent.y;
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
    function resetPosition(position, dirA, dirB, overwrite = false) {
        if (position.orientation.length === 2 || overwrite) {
            position[dirA] = 0;
        }
        position[dirB] = 0;
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
    const roundFloat = (value) => Math.round(parseFloat(value));
    const getStrokeColor = (value) => ({ color: getColorValue(value), dashWidth: '', dashGap: '' });
    const isInsetBorder = (border) => border.style === 'groove' || border.style === 'ridge' || border.style === 'double' && roundFloat(border.width) > 1;
    const getPixelUnit = (width, height) => `${width}px ${height}px`;
    const constrictedWidth = (node) => !node.inline && !node.floating && node.hasPX('width', true, true) && node.cssInitial('width') !== '100%';
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
        beforeParseDocument() {
            const application = this.application;
            const controller = this.controller;
            this._resourceSvgInstance = controller.localSettings.svg.enabled ? application.builtInExtensions[EXT_ANDROID.RESOURCE_SVG] : undefined;
        }
        afterResources() {
            var _a, _b;
            const settings = this.application.userSettings;
            let themeBackground = false;
            function setDrawableBackground(node, value) {
                if (value !== '') {
                    const drawable = '@drawable/' + Resource.insertStoredAsset('drawables', node.containerName.toLowerCase() + '_' + node.controlId, value);
                    if (!themeBackground) {
                        if (node.documentBody) {
                            themeBackground = true;
                            if (!setHtmlBackground(node) && (node.backgroundColor !== '' || node.visibleStyle.backgroundRepeatY) && node.css('backgroundImage') !== 'none') {
                                setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                                return;
                            }
                        }
                        else if (node.tagName === 'HTML') {
                            themeBackground = true;
                            setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                            return;
                        }
                    }
                    node.android('background', drawable, false);
                }
            }
            function setHtmlBackground(node) {
                var _a;
                const parent = node.actualParent;
                if (((_a = parent) === null || _a === void 0 ? void 0 : _a.visible) === false) {
                    const background = parent.android('background');
                    if (background !== '') {
                        setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, background);
                        return true;
                    }
                }
                return false;
            }
            const drawOutline = this.options.drawOutlineAsInsetBorder;
            for (const node of this.cacheProcessing) {
                const stored = node.data(Resource.KEY_NAME, 'boxStyle');
                if (stored && node.hasResource(NODE_RESOURCE$7.BOX_STYLE)) {
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
                                    if (!themeBackground) {
                                        setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, color);
                                        themeBackground = true;
                                    }
                                    else {
                                        node.android('background', color, false);
                                    }
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
            }
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
                    const layer = layerListData[0];
                    setBorderStyle(layer, borders, 0, corners, indentWidth, indentOffset);
                    setBorderStyle(layer, borders, 3, corners, indentWidth, indentOffset);
                    setBorderStyle(layer, borders, 2, corners, indentWidth, indentOffset);
                    setBorderStyle(layer, borders, 1, corners, indentWidth, indentOffset);
                }
            }
            return [shapeData, layerListData];
        }
        getDrawableImages(node, data) {
            var _a;
            const backgroundImage = data.backgroundImage;
            const extracted = node.extracted;
            if ((backgroundImage || extracted) && node.hasResource(NODE_RESOURCE$7.IMAGE_SOURCE)) {
                const resource = this.resource;
                const bounds = node.bounds;
                const screenDimension = node.localSettings.screenDimension;
                let { width: boundsWidth, height: boundsHeight } = bounds;
                if (node.documentBody) {
                    boundsWidth = screenDimension.width;
                    boundsHeight = screenDimension.height;
                }
                else if (node.documentRoot) {
                    if (!constrictedWidth(node)) {
                        boundsWidth = screenDimension.width;
                    }
                    if (node.cssInitial('height') === '100%' || node.cssInitial('minHeight') === '100%') {
                        boundsHeight = screenDimension.height;
                    }
                }
                else if (node.ascend({ condition: (item) => constrictedWidth(item) && (!item.layoutElement || item === node), startSelf: true }).length === 0) {
                    boundsWidth = Math.min(boundsWidth, screenDimension.width);
                }
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
                    backgroundRepeat = fillBackgroundAttribute(backgroundRepeat, lengthA);
                    backgroundSize = fillBackgroundAttribute(backgroundSize, lengthA);
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
                                    const match = CSS$2.URL.exec(value);
                                    if (match) {
                                        const uri = match[1];
                                        if (/^data:image/.test(uri)) {
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
                                            images[length] = resource.addImageSet({ mdpi: value });
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
                            const gradient = createBackgroundGradient(value, node.api);
                            if (gradient) {
                                images[length] = gradient;
                                imageDimensions[length] = value.dimension;
                                valid = true;
                            }
                        }
                        if (valid) {
                            const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                            const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                            backgroundPosition[length] = getBackgroundPosition$1(checkBackgroundPosition(x, y, 'left') + ' ' + checkBackgroundPosition(y, x, 'top'), node.actualDimension, node.fontSize, imageDimensions[length], backgroundSize[i], screenDimension);
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
                        const element = image.element;
                        const src = resource.addImageSrc(element);
                        if (src !== '') {
                            const imageBounds = image.bounds;
                            images[length] = src;
                            backgroundRepeat[length] = 'no-repeat';
                            backgroundSize[length] = getPixelUnit(image.actualWidth, image.actualHeight);
                            const position = getBackgroundPosition$1(image.containerName === 'INPUT_IMAGE' ? getPixelUnit(0, 0) : getPixelUnit(imageBounds.left - bounds.left + node.borderLeftWidth, imageBounds.top - bounds.top + node.borderTopWidth), node.actualDimension, node.fontSize, imageBounds, '', screenDimension);
                            const stored = resource.getImage(element.src);
                            if (!node.hasPX('width')) {
                                const offsetStart = (stored ? stored.width : 0) + position.left - (node.paddingLeft + node.borderLeftWidth);
                                if (offsetStart > 0) {
                                    node.modifyBox(256 /* PADDING_LEFT */, offsetStart);
                                }
                            }
                            imageDimensions[length] = stored;
                            backgroundPosition[length] = position;
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
                        const resetBackground = () => {
                            tileMode = '';
                            tileModeX = '';
                            tileModeY = '';
                            repeating = false;
                            if (node.documentBody) {
                                const visibleStyle = node.visibleStyle;
                                visibleStyle.backgroundRepeat = true;
                                visibleStyle.backgroundRepeatY = true;
                            }
                        };
                        const resetGravityPosition = (coordinates = true) => {
                            gravityX = '';
                            gravityY = '';
                            if (coordinates) {
                                position.top = 0;
                                position.right = 0;
                                position.bottom = 0;
                                position.left = 0;
                            }
                            resizable = false;
                            recalibrate = false;
                        };
                        const canResizeHorizontal = () => resizable && gravityX !== 'fill_horizontal' && tileMode !== 'repeat' && tileModeX === '';
                        const canResizeVertical = () => resizable && gravityY !== 'fill_vertical' && tileMode !== 'repeat' && tileModeY === '';
                        const src = '@drawable/' + value;
                        let repeat = backgroundRepeat[i];
                        if (repeat.includes(' ')) {
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
                        let width = 0;
                        let height = 0;
                        let tileMode = '';
                        let tileModeX = '';
                        let tileModeY = '';
                        let gravityX = '';
                        let gravityY = '';
                        let gravityAlign = '';
                        let gravity;
                        if (!repeating && repeat !== 'repeat-x') {
                            switch (position.horizontal) {
                                case 'left':
                                case '0%':
                                    resetPosition(position, 'left', 'right');
                                    gravityX = node.localizeString('left');
                                    break;
                                case 'center':
                                case '50%':
                                    resetPosition(position, 'left', 'right', true);
                                    gravityX = STRING_ANDROID.CENTER_HORIZONTAL;
                                    break;
                                case 'right':
                                case '100%':
                                    resetPosition(position, 'right', 'left');
                                    gravityX = node.localizeString('right');
                                    break;
                                default:
                                    gravityX = node.localizeString(position.right !== 0 ? 'right' : 'left');
                                    break;
                            }
                        }
                        else {
                            if (dimension) {
                                let x = position.left;
                                if (x > 0) {
                                    do {
                                        x -= dimenWidth;
                                    } while (x > 0);
                                    repeatX = true;
                                    position.left = x;
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
                                    resetPosition(position, 'top', 'bottom');
                                    gravityY = 'top';
                                    if (isNaN(dimenHeight)) {
                                        height = boundsHeight;
                                    }
                                    break;
                                case 'center':
                                case '50%':
                                    resetPosition(position, 'top', 'bottom', true);
                                    gravityY = STRING_ANDROID.CENTER_VERTICAL;
                                    break;
                                case 'bottom':
                                case '100%':
                                    resetPosition(position, 'bottom', 'top');
                                    gravityY = 'bottom';
                                    break;
                                default:
                                    gravityY = position.bottom !== 0 ? 'bottom' : 'top';
                                    break;
                            }
                        }
                        else {
                            if (dimension) {
                                let y = position.top;
                                if (y > 0) {
                                    do {
                                        y -= dimenHeight;
                                    } while (y > 0);
                                    position.top = y;
                                    repeatY = true;
                                }
                                else {
                                    repeatY = node.element === document.body || dimenHeight < boundsHeight;
                                    if (y === 0) {
                                        gravityY = 'top';
                                    }
                                }
                            }
                            else {
                                position.top = 0;
                                gravityY = 'top';
                                repeatY = true;
                            }
                            position.bottom = 0;
                        }
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
                                const resetX = () => {
                                    if (gravityY === '' && gravityX !== node.localizeString('left') && node.renderChildren.length) {
                                        tileModeY = '';
                                    }
                                    gravityAlign = gravityX;
                                    gravityX = '';
                                    tileModeX = '';
                                };
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
                                const resetY = () => {
                                    if (gravityX === '' && gravityY !== 'top' && node.renderChildren.length) {
                                        tileModeX = '';
                                    }
                                    gravityAlign += (gravityAlign !== '' ? '|' : '') + gravityY;
                                    gravityY = '';
                                    tileModeY = 'disabled';
                                };
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
                                    gravity = 'fill';
                                }
                                if (dimenWidth > boundsWidth) {
                                    gravityX = '';
                                }
                                if (dimenHeight > boundsHeight) {
                                    gravityY = '';
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
                            const ratioWidth = dimenWidth / boundsWidth;
                            const ratioHeight = dimenHeight / boundsHeight;
                            const getImageWidth = () => dimenWidth * height / dimenHeight;
                            const getImageHeight = () => dimenHeight * width / dimenWidth;
                            const getImageRatioWidth = () => boundsWidth * (ratioWidth / ratioHeight);
                            const getImageRatioHeight = () => boundsHeight * (ratioHeight / ratioWidth);
                            switch (size) {
                                case 'cover': {
                                    if (ratioWidth < ratioHeight) {
                                        width = boundsWidth;
                                        height = getImageRatioHeight();
                                        if (height > boundsHeight) {
                                            const percent = position.topAsPercent;
                                            if (percent > 0) {
                                                top = Math.round((boundsHeight - height) * percent);
                                                position.top = 0;
                                            }
                                            if (!node.hasPX('height')) {
                                                node.css('height', formatPX$a(boundsHeight - node.contentBoxHeight));
                                            }
                                        }
                                        gravity = '';
                                    }
                                    else if (ratioWidth > ratioHeight) {
                                        width = getImageRatioWidth();
                                        height = boundsHeight;
                                        if (node.hasWidth && width > boundsWidth) {
                                            const percent = position.leftAsPercent;
                                            if (percent > 0) {
                                                left = Math.round((boundsWidth - width) * percent);
                                                position.left = 0;
                                            }
                                        }
                                        gravity = '';
                                    }
                                    else {
                                        gravity = 'fill';
                                    }
                                    resetGravityPosition(false);
                                    break;
                                }
                                case 'contain': {
                                    if (ratioWidth > ratioHeight) {
                                        height = getImageRatioHeight();
                                        width = dimenWidth < boundsWidth ? getImageWidth() : boundsWidth;
                                        gravity = '';
                                        gravityAlign = 'fill_horizontal|center_vertical';
                                    }
                                    else if (ratioWidth < ratioHeight) {
                                        width = getImageRatioWidth();
                                        height = dimenHeight < boundsHeight ? getImageHeight() : boundsHeight;
                                        gravity = '';
                                        gravityAlign = 'fill_vertical|center_horizontal';
                                    }
                                    else {
                                        width = getImageRatioWidth();
                                        height = getImageRatioHeight();
                                        gravity = '';
                                        gravityAlign = 'fill';
                                    }
                                    resetGravityPosition();
                                    break;
                                }
                                default:
                                    if (width === 0 && height > 0 && canResizeHorizontal()) {
                                        width = getImageWidth();
                                    }
                                    if (height === 0 && width > 0 && canResizeVertical()) {
                                        height = getImageHeight();
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
                        else if (width === 0 && height === 0 && dimenWidth < boundsWidth && dimenHeight < boundsHeight && !svg && canResizeHorizontal() && canResizeVertical()) {
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
                            if (!node.documentBody && !node.is(CONTAINER_NODE.IMAGE) && !svg) {
                                if (resizable) {
                                    let fillX = false;
                                    let fillY = false;
                                    if (boundsWidth < dimenWidth && (!node.has('width', 2 /* LENGTH */, { map: 'initial', not: '100%' }) && !(node.blockStatic && gravity && (gravity === 'center' || gravity.includes(STRING_ANDROID.CENTER_HORIZONTAL))) || !node.pageFlow)) {
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
                                    if (gravityY === '') {
                                        switch (node.controlName) {
                                            case SUPPORT_ANDROID.TOOLBAR:
                                            case SUPPORT_ANDROID_X.TOOLBAR:
                                                gravityY = 'fill_vertical';
                                                break;
                                            default:
                                                gravityY = 'top';
                                                break;
                                        }
                                    }
                                    tileModeY = '';
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
                                if (!resizable && !height && position.left < 0 && gravity !== 'fill' && !gravityX.includes('fill_horizontal')) {
                                    gravityX += (gravityX !== '' ? '|' : '') + 'fill_horizontal';
                                }
                                if (tileMode === 'repeat') {
                                    tileModeY = 'repeat';
                                    tileMode = '';
                                }
                            }
                            if ((height || dimenHeight) + position.top >= boundsHeight && !node.documentBody && !node.percentHeight) {
                                tileModeY = '';
                                if (!resizable && position.top < 0 && gravity !== 'fill' && !gravityY.includes('fill_vertical') && !node.hasPX('height')) {
                                    gravityY += (gravityY !== '' ? '|' : '') + 'fill_vertical';
                                }
                                if (tileMode === 'repeat') {
                                    tileModeX = 'repeat';
                                    tileMode = '';
                                }
                            }
                            if (tileMode !== 'repeat' && gravity !== 'fill') {
                                if (tileModeX !== '') {
                                    if (tileModeY === '' && (gravityY === '' || gravityY.includes('top') || gravityY.includes('fill_vertical'))) {
                                        gravityAlign = gravityY;
                                        gravityY = '';
                                        if (node.renderChildren.length) {
                                            tileModeX = '';
                                        }
                                    }
                                }
                                else if (tileModeY !== '' && node.renderChildren.length && (gravityX === '' || gravityX.includes('start') || gravityX.includes('left') || gravityX.includes('fill_horizontal'))) {
                                    tileModeY = '';
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
                            else if (gravityX.includes('fill_horizontal') && gravityY.includes('fill_vertical')) {
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
                            gravityX = '';
                            gravityY = '';
                        }
                        const covering = size === 'cover' || size === 'contain';
                        if (node.documentBody && !covering && tileModeX !== 'repeat' && gravity !== '' && gravityAlign === '') {
                            imageData.gravity = gravity;
                            imageData.drawable = src;
                        }
                        else if (!svg && (tileMode === 'repeat' || tileModeX !== '' || tileModeY !== '' || gravityAlign !== '' && gravity !== '' || covering || !resizable && height > 0)) {
                            switch (gravity) {
                                case 'top':
                                    if (tileModeY === 'repeat' && !node.hasHeight && !node.layoutLinear && !(node.layoutRelative && node.horizontalRows === undefined)) {
                                        gravity = '';
                                        tileModeY = '';
                                    }
                                    break;
                                case 'bottom':
                                    if (gravityAlign === '') {
                                        gravityAlign = gravity;
                                        gravity = '';
                                        tileMode = '';
                                        tileModeX = tileModeX === '' ? 'disabled' : '';
                                        tileModeY = tileModeY === '' ? 'disabled' : '';
                                    }
                                    break;
                            }
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
                        const [width, height] = dimension ? [Math.round(dimenWidth), Math.round(dimenHeight)] : [Math.round(node.actualWidth), Math.round(node.actualHeight)];
                        if (size.split(' ').some(dimen => dimen !== '100%' && isLength$4(dimen, true))) {
                            imageData.width = width;
                            imageData.height = height;
                        }
                        const src = Resource.insertStoredAsset('drawables', `${node.controlId}_gradient_${i + 1}`, applyTemplate$1('vector', VECTOR_TMPL, [{
                                'xmlns:android': XMLNS_ANDROID.android,
                                'xmlns:aapt': XMLNS_ANDROID.aapt,
                                'android:width': formatPX$a(imageData.width || width),
                                'android:height': formatPX$a(imageData.height || height),
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
                            if (position.static && node.tagName !== 'HTML') {
                                imageData.gravity = 'fill';
                            }
                        }
                    }
                    else {
                        imageData.gradient = value;
                        if (position.static && node.tagName !== 'HTML') {
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
    const REGEX_UNIT = /\dpx$/;
    const REGEX_UNIT_ATTR = /:(\w+)="(-?[\d.]+px)"/;
    function getResourceName(map, name, value) {
        for (const [storedName, storedValue] of map.entries()) {
            if (storedName.startsWith(name) && value === storedValue) {
                return storedName;
            }
        }
        const previous = map.get(name);
        return !!previous && previous !== value ? Resource.generateId('dimen', name) : name;
    }
    function createNamespaceData(namespace, node, group) {
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
    const getDisplayName = (value) => fromLastIndexOf$3(value, '.');
    class ResourceDimens extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade() {
            const dimens = STORED$2.dimens;
            const groups = {};
            for (const node of this.cache) {
                if (node.visible) {
                    const containerName = node.containerName.toLowerCase();
                    let group = groups[containerName];
                    if (group === undefined) {
                        group = {};
                        groups[containerName] = group;
                    }
                    createNamespaceData('android', node, group);
                    createNamespaceData('app', node, group);
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
    const { capitalize: capitalize$2, convertInt: convertInt$2, convertWord: convertWord$1, filterArray: filterArray$1, objectMap: objectMap$3, spliceArray: spliceArray$1, trimString: trimString$1 } = $lib$d.util;
    const { NODE_RESOURCE: NODE_RESOURCE$8 } = squared.base.lib.enumeration;
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
            var _a;
            const resource = this.resource;
            const settings = resource.userSettings;
            const disableFontAlias = this.options.disableFontAlias;
            const convertPixels = settings.convertPixels === 'dp';
            const { fonts, styles } = STORED$3;
            const styleKeys = Object.keys(FONT_STYLE);
            const nameMap = {};
            const groupMap = {};
            for (const node of this.cache) {
                if (node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource(NODE_RESOURCE$8.FONT_STYLE)) {
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
                    const targetAPI = node.api;
                    const stored = node.data(Resource.KEY_NAME, 'fontStyle');
                    let { fontFamily, fontStyle, fontWeight } = stored;
                    if (((_a = companion) === null || _a === void 0 ? void 0 : _a.tagName) === 'LABEL' && !companion.visible) {
                        node = companion;
                    }
                    fontFamily.replace(REGEX_DOUBLEQUOTE, '').split(XML$3.SEPARATOR).some((value, index, array) => {
                        value = trimString$1(value, "'").toLowerCase();
                        let fontName = value;
                        let actualFontWeight = '';
                        if (!disableFontAlias && FONTREPLACE_ANDROID[fontName]) {
                            fontName = this.options.systemDefaultFont;
                        }
                        if (targetAPI >= FONT_ANDROID[fontName] || !disableFontAlias && targetAPI >= FONT_ANDROID[FONTALIAS_ANDROID[fontName]]) {
                            fontFamily = fontName;
                        }
                        else if (fontStyle && fontWeight) {
                            let createFont = false;
                            if (resource.getFont(value, fontStyle, fontWeight)) {
                                createFont = true;
                            }
                            else {
                                const font = resource.getFont(value, fontStyle);
                                if (font) {
                                    actualFontWeight = fontWeight;
                                    fontWeight = font.fontWeight.toString();
                                    createFont = true;
                                }
                                else if (index < array.length - 1) {
                                    return false;
                                }
                                else {
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
                        }
                        else {
                            return false;
                        }
                        if (fontStyle === 'normal') {
                            fontStyle = '';
                        }
                        if (actualFontWeight !== '') {
                            fontWeight = actualFontWeight;
                        }
                        else if (fontWeight === '400' || node.api < 26 /* OREO */) {
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
                        backgroundColor: Resource.addColor(stored.backgroundColor)
                    };
                    for (let i = 0; i < 6; i++) {
                        const key = styleKeys[i];
                        let value = fontData[key];
                        if (value) {
                            if (i === 3 && convertPixels) {
                                value = convertLength(value, true);
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
                const sorted = filterArray$1(groupMap[tag], item => !!item).sort((a, b) => {
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
            for (const node of this.cache) {
                const styleData = nodeMap[node.id];
                if (styleData) {
                    if (styleData.length > 1) {
                        parentStyle.add(styleData.join('.'));
                        styleData.shift();
                    }
                    else {
                        parentStyle.add(styleData[0]);
                    }
                    node.attr('_', 'style', '@style/' + styleData.join('.'));
                }
            }
            for (const value of parentStyle) {
                const styleName = [];
                let parent = '';
                let items;
                value.split('.').forEach((tag, index, array) => {
                    const match = REGEX_TAGNAME.exec(tag);
                    if (match) {
                        const styleData = resourceMap[match[1].toUpperCase()][convertInt$2(match[2])];
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
            for (const node of this.cache) {
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
                                include: dataset.androidIncludeMerge === 'false'
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
                        const application = this.application;
                        const controller = this.controller;
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
                                    const merge = !openData.include || templates.length > 1;
                                    const depth = merge ? 1 : 0;
                                    renderTemplates[openData.index] = {
                                        type: 2 /* INCLUDE */,
                                        node: templates[0].node,
                                        content: controller.renderNodeStatic('include', { layout: '@layout/' + openData.name }, 'match_parent'),
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
    const { capitalizeString, lowerCaseString, isNumber: isNumber$2, isString: isString$4 } = $lib$e.util;
    const { STRING_SPACE: STRING_SPACE$1, replaceCharacterData } = $lib$e.xml;
    const { NODE_RESOURCE: NODE_RESOURCE$9 } = squared.base.lib.enumeration;
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
            function setTextValue(node, attr, name, value) {
                name = Resource.addString(value, name, numberResourceValue);
                if (name !== '') {
                    node.android(attr, numberResourceValue || !isNumber$2(name) ? '@string/' + name : name, false);
                }
            }
            for (const node of this.cacheProcessing) {
                if (node.hasResource(NODE_RESOURCE$9.VALUE_STRING)) {
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
                                        if (node.api >= 21 /* LOLLIPOP */) {
                                            node.android('fontFeatureSettings', 'smcp');
                                        }
                                        else {
                                            node.android('textAllCaps', 'true');
                                            const fontStyle = node.data(Resource.KEY_NAME, 'fontStyle');
                                            if (fontStyle) {
                                                fontStyle.fontSize *= this.options.fontVariantSmallCapsReduction;
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
                                    if (tagName === 'INS' && !textDecorationLine.includes('line-through')) {
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
                                            value = STRING_SPACE$1.repeat(Math.max(Math.floor(indent / width), 1)) + value;
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
                                                node.css('width', formatPX$b(node.actualWidth));
                                            }
                                        }
                                    }
                                    const hintString = node.data(Resource.KEY_NAME, 'hintString');
                                    if (isString$4(hintString)) {
                                        setTextValue(node, 'hint', '', hintString);
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
            const [stringArray, numberArray] = Resource.getOptionArray(element);
            const numberResourceValue = this.options.numberResourceValue;
            let result;
            if (!numberResourceValue && numberArray) {
                result = numberArray;
            }
            else {
                const resourceArray = stringArray || numberArray;
                if (resourceArray) {
                    result = [];
                    for (let value of resourceArray) {
                        value = Resource.addString(replaceCharacterData(value), '', numberResourceValue);
                        if (value !== '') {
                            result.push('@string/' + value);
                        }
                    }
                }
            }
            return ((_a = result) === null || _a === void 0 ? void 0 : _a.length) ? Resource.insertStoredAsset('arrays', controlId + '_array', result) : '';
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
            for (const node of this.cache) {
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
                                if (!found && /^style=/.test(value)) {
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
                for (const style of styles[name]) {
                    const match = XML$4.ATTRIBUTE.exec(style);
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
                    '@': ['ordering'],
                    '>': {
                        'set': {
                            '^': 'android',
                            '@': ['ordering'],
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
    var Svg = squared.svg.Svg;
    var SvgAnimate = squared.svg.SvgAnimate;
    var SvgAnimateTransform = squared.svg.SvgAnimateTransform;
    var SvgBuild = squared.svg.SvgBuild;
    var SvgG = squared.svg.SvgG;
    var SvgPath = squared.svg.SvgPath;
    var SvgShape = squared.svg.SvgShape;
    const $lib$g = squared.lib;
    const $svg_lib = squared.svg.lib;
    const { formatPX: formatPX$c, isPercent: isPercent$4 } = $lib$g.css;
    const { truncate: truncate$6 } = $lib$g.math;
    const { CHAR: CHAR$5, CSS: CSS$3, FILE: FILE$1 } = $lib$g.regex;
    const { convertCamelCase, convertInt: convertInt$3, convertWord: convertWord$2, filterArray: filterArray$2, formatString, isArray: isArray$1, isNumber: isNumber$3, isString: isString$5, objectMap: objectMap$4, partitionArray: partitionArray$1, replaceMap: replaceMap$1 } = $lib$g.util;
    const { applyTemplate: applyTemplate$2 } = $lib$g.xml;
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
        const interpolator = INTERPOLATOR_ANDROID[value];
        if (interpolator) {
            return interpolator;
        }
        else {
            const name = 'path_interpolator_' + convertWord$2(value);
            if (!STORED$5.animators.has(name)) {
                const xml = formatString(INTERPOLATOR_XML, ...value.split(CHAR$5.SPACE));
                STORED$5.animators.set(name, xml);
            }
            return '@anim/' + name;
        }
    }
    function createTransformData(transform) {
        const result = {};
        for (const item of transform) {
            const { matrix, origin, type } = item;
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
        if (length && (SVG.circle(element) || SVG.ellipse(element))) {
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
            const current = [];
            const restart = () => {
                host.push(current.slice(0));
                current.length = 0;
            };
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
                        for (const command of SvgBuild.getPathCommands(path.value)) {
                            points = points.concat(command.value);
                        }
                    case 'polygon':
                        if (SVG.polygon(element)) {
                            points = points.concat(SvgBuild.clonePoints(element.points));
                        }
                        if (!points.length) {
                            return undefined;
                        }
                        [cx, cy, cxDiameter, cyDiameter] = SvgBuild.minMaxPoints(points);
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
    function insertTargetAnimation(data, name, targetSetTemplate, templateName, imageLength) {
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
                animation: Resource.insertStoredAsset('animators', getTemplateFilename(templateName, imageLength, 'anim', name), applyTemplate$2('set', SET_TMPL, [targetSetTemplate]))
            };
            if (targetData.animation !== '') {
                targetData.animation = '@anim/' + targetData.animation;
                data[0].target.push(targetData);
            }
        }
    }
    const getTemplateFilename = (templateName, length, prefix, suffix) => templateName + (prefix ? '_' + prefix : '') + (length ? '_vector' : '') + (suffix ? '_' + suffix.toLowerCase() : '');
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
            if (SvgBuild) {
                SvgBuild.setName();
                this.controller.localSettings.svg.enabled = true;
            }
        }
        afterResources() {
            if (SvgBuild) {
                let parentElement;
                let element;
                for (const node of this.cacheProcessing) {
                    if (node.imageElement) {
                        [parentElement, element] = this.createSvgElement(node, node.src);
                    }
                    else if (node.svgElement) {
                        element = node.element;
                    }
                    if (element) {
                        const drawable = this.createSvgDrawable(node, element);
                        if (drawable !== '') {
                            if (node.api >= 21 /* LOLLIPOP */) {
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
                            parentElement = undefined;
                        }
                        element = undefined;
                    }
                }
            }
        }
        afterFinalize() {
            this.controller.localSettings.svg.enabled = false;
        }
        createSvgElement(node, src) {
            const match = CSS$3.URL.exec(src);
            if (match) {
                src = match[1];
            }
            if (FILE$1.SVG.test(src) || /^data:image\/svg\+xml/.test(src)) {
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
        createSvgDrawable(node, element) {
            const svg = new Svg(element);
            const supportedKeyFrames = node.api >= 23 /* MARSHMALLOW */;
            const { floatPrecisionValue, floatPrecisionKeyTime } = this.options;
            this.SVG_INSTANCE = svg;
            this.VECTOR_DATA.clear();
            this.ANIMATE_DATA.clear();
            this.ANIMATE_TARGET.clear();
            this.IMAGE_DATA.length = 0;
            this.NAMESPACE_AAPT = false;
            this.SYNCHRONIZE_MODE = 2 /* FROMTO_ANIMATE */ | (supportedKeyFrames ? 32 /* KEYTIME_TRANSFORM */ : 64 /* IGNORE_TRANSFORM */);
            const templateName = (node.tagName + '_' + convertWord$2(node.controlId, true) + '_viewbox').toLowerCase();
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
            const imageLength = this.IMAGE_DATA.length;
            let vectorName = Resource.insertStoredAsset('drawables', getTemplateFilename(templateName, imageLength), applyTemplate$2('vector', VECTOR_TMPL, [{
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
                for (const [name, group] of this.ANIMATE_DATA.entries()) {
                    const sequentialMap = new Map();
                    const transformMap = new Map();
                    const togetherData = [];
                    const isolatedData = [];
                    const togetherTargets = [];
                    const isolatedTargets = [];
                    const transformTargets = [];
                    const [companions, animations] = partitionArray$1(group.animate, child => 'companion' in child);
                    const targetSetTemplate = {
                        set: [],
                        objectAnimator: []
                    };
                    const lengthA = animations.length;
                    for (let i = 0; i < lengthA; i++) {
                        const item = animations[i];
                        if (item.setterType) {
                            if (ATTRIBUTE_ANDROID[item.attributeName] && isString$5(item.to)) {
                                if (item.duration > 0 && item.fillReplace) {
                                    isolatedData.push(item);
                                }
                                else {
                                    togetherData.push(item);
                                }
                            }
                        }
                        else if (SvgBuild.isAnimate(item)) {
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
                                    if (SvgBuild.isAnimateTransform(item)) {
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
                                    if (SvgBuild.isAnimateTransform(item)) {
                                        item.expandToValues();
                                    }
                                    if (item.iterationCount === -1) {
                                        isolatedData.push(item);
                                    }
                                    else if ((!item.fromToType || SvgBuild.isAnimateTransform(item) && item.transformOrigin) && !(supportedKeyFrames && getValueType(item.attributeName) !== 'pathType')) {
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
                        if (/^sequentially_companion/.test(keyName)) {
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
                                if (!SvgBuild.isAnimateTransform(items[0])) {
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
                            else if (index <= 1 && items.some(item => 'companion' in item)) {
                                ordering = 'sequentially';
                            }
                            else {
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
                                        if (isString$5(value) && beforeAnimator.findIndex(before => before.propertyName === propertyName) === -1) {
                                            beforeAnimator.push(this.createPropertyValue(propertyName, value, '0', valueType));
                                        }
                                    };
                                    const insertFillAfter = (propertyName, propertyValues, startOffset) => {
                                        var _a;
                                        if (!synchronized && item.fillReplace) {
                                            let valueTo = item.replaceValue;
                                            if (!valueTo) {
                                                if (transforming) {
                                                    valueTo = getTransformInitialValue(propertyName);
                                                }
                                                else {
                                                    const parent = item.parent;
                                                    if (parent) {
                                                        if (SvgBuild.isShape(parent)) {
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
                                                if (isArray$1(lastValue.propertyValuesHolder)) {
                                                    const propertyValue = lastValue.propertyValuesHolder[lastValue.propertyValuesHolder.length - 1];
                                                    previousValue = propertyValue.keyframe[propertyValue.keyframe.length - 1].value;
                                                }
                                                else {
                                                    previousValue = lastValue.valueTo;
                                                }
                                            }
                                            if (isString$5(valueTo) && valueTo !== previousValue) {
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
                                                if (/X$/.test(propertyName)) {
                                                    afterAnimator.push(this.createPropertyValue('translateX', '0', '1', valueType));
                                                }
                                                else if (/Y$/.test(propertyName)) {
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
                                    else if (SvgBuild.isAnimate(item)) {
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
                                                if (parent && SvgBuild.isShape(parent)) {
                                                    companion = parent;
                                                    if (parent.path) {
                                                        transforms = parent.path.transformed;
                                                    }
                                                }
                                                propertyNames = ['pathData'];
                                                values = SvgPath.extrapolate(item.attributeName, group.pathData, item.values, transforms, companion, floatPrecisionValue);
                                            }
                                        }
                                        else if (SvgBuild.asAnimateTransform(item)) {
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
                                        else if (SvgBuild.asAnimateMotion(item)) {
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
                                                    values = objectMap$4(item.values, value => convertInt$3(value).toString());
                                                    if (requireBefore) {
                                                        const baseValue = item.baseValue;
                                                        if (baseValue) {
                                                            beforeValues = replaceMap$1(SvgBuild.parseCoordinates(baseValue), value => Math.trunc(value).toString());
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
                                                            beforeValues = replaceMap$1(SvgBuild.parseCoordinates(baseValue), value => value.toString());
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
                                                                    if (/X$/.test(propertyName)) {
                                                                        direction = 'translateX';
                                                                        translateTo = transformOrigin[j].x;
                                                                    }
                                                                    else if (/Y$/.test(propertyName)) {
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
                    insertTargetAnimation(data, name, targetSetTemplate, templateName, imageLength);
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
                        if (SvgBuild.asAnimateMotion(item)) {
                            const parent = item.parent;
                            if (parent && SvgBuild.isShape(parent)) {
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
                        insertTargetAnimation(data, name, {
                            set: [{ set: undefined, objectAnimator }],
                            objectAnimator: undefined
                        }, templateName, imageLength);
                    }
                }
                if (data[0].target) {
                    vectorName = Resource.insertStoredAsset('drawables', getTemplateFilename(templateName, imageLength, 'anim'), applyTemplate$2('animated-vector', ANIMATEDVECTOR_TMPL, data));
                }
            }
            if (imageLength) {
                const resource = this.resource;
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
                    const src = getDrawableSrc(resource.addImageSet({ mdpi: image.href }));
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
                    if (SvgBuild.isShape(item)) {
                        const itemPath = item.path;
                        if ((_a = itemPath) === null || _a === void 0 ? void 0 : _a.value) {
                            const [path, groupArray] = this.createPath(item, itemPath);
                            const pathArray = [];
                            if (itemPath.strokeWidth && (itemPath.strokeDasharray || itemPath.strokeDashoffset)) {
                                const animateData = this.ANIMATE_DATA.get(item.name);
                                if (animateData === undefined || animateData.animate.every(animate => /^stroke-dash/.test(animate.attributeName))) {
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
                    else if (SvgBuild.isContainer(item)) {
                        if (item.length) {
                            output += this.parseVectorData(item, renderDepth);
                        }
                    }
                    else if (SvgBuild.asImage(item)) {
                        if (!SvgBuild.asPattern(group)) {
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
            if ((target !== this.SVG_INSTANCE && SvgBuild.asSvg(target) || SvgBuild.asUseSymbol(target) || SvgBuild.asUsePattern(target)) && (target.x !== 0 || target.y !== 0)) {
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
                if ((SvgBuild.asG(target) || SvgBuild.asUseSymbol(target)) && isString$5(target.clipPath) && this.createClipPath(target, clipBox, target.clipPath)) {
                    baseData.name = groupName;
                }
                if (this.queueAnimations(target, groupName, item => SvgBuild.asAnimateTransform(item))) {
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
            if (SvgBuild.asUse(target) && isString$5(target.clipPath)) {
                this.createClipPath(target, clipElement, target.clipPath);
            }
            if (isString$5(path.clipPath)) {
                const shape = new SvgShape(path.element);
                shape.build({
                    exclude: this.options.transformExclude,
                    residual: partitionTransforms,
                    precision
                });
                shape.synchronize({ keyTimeMode: this.SYNCHRONIZE_MODE, precision });
                this.createClipPath(shape, clipElement, path.clipPath);
            }
            const baseData = {};
            const groupName = getVectorName(target, 'group');
            if (this.queueAnimations(target, groupName, item => SvgBuild.isAnimateTransform(item), '', target.name)) {
                baseData.name = groupName;
            }
            else if (clipElement.length) {
                baseData.name = '';
            }
            if (SvgBuild.asUse(target) && (target.x !== 0 || target.y !== 0)) {
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
            const useTarget = SvgBuild.asUse(target);
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
                        case 'fillPattern': {
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
                        }
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
                            value = ((isNumber$3(value) ? parseFloat(value) : 1) * opacity).toString();
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
                if (SvgBuild.asAnimateTransform(item) && !item.additiveSum && item.transformFrom) {
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
                                const transform = replaceData.find(data => data.index === j && 'animate' in data);
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
            if (!this.queueAnimations(target, result.name, item => (SvgBuild.asAnimate(item) || SvgBuild.asSet(item)) && item.attributeName !== 'clip-path', pathData) && replaceResult.length === 0) {
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
                        const g = new SvgG(element);
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
                                    if (!this.queueAnimations(child, name, item => SvgBuild.asAnimate(item) || SvgBuild.asSet(item), pathData)) {
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
                    if (!this.queueAnimations(target, name, item => (SvgBuild.asAnimate(item) || SvgBuild.asSet(item)) && item.attributeName === 'clip-path', value)) {
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
                valueFrom: isNumber$3(valueFrom) ? truncate$6(valueFrom, floatPrecisionValue) : valueFrom,
                valueTo: isNumber$3(valueTo) ? truncate$6(valueTo, floatPrecisionValue) : valueTo,
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
            'android.delegate.css-grid',
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
        resolutionScreenWidth: 1280,
        resolutionScreenHeight: 900,
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
            CssGrid: CssGrid$1,
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
                CssGrid: Grid$1,
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
                [EN.CSS_GRID]: new CssGrid$1(EN.CSS_GRID, framework),
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
                [EA.DELEGATE_CSS_GRID]: new Grid$1(EA.DELEGATE_CSS_GRID, framework),
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
