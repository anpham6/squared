/* android-framework 1.6.0
   https://github.com/anpham6/squared */

var android = (function () {
    'use strict';

    class Application extends squared.base.ApplicationUI {
        set viewModel(value) {
            this._viewModel = value;
        }
        get viewModel() {
            return this._viewModel;
        }
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
        CONTAINER_NODE[CONTAINER_NODE["VIDEOVIEW"] = 21] = "VIDEOVIEW";
        CONTAINER_NODE[CONTAINER_NODE["UNKNOWN"] = 22] = "UNKNOWN";
    })(CONTAINER_NODE || (CONTAINER_NODE = {}));

    var enumeration = /*#__PURE__*/Object.freeze({
        __proto__: null,
        get CONTAINER_NODE () { return CONTAINER_NODE; }
    });

    const EXT_ANDROID = {
        EXTERNAL: 'android.external',
        SUBSTITUTE: 'android.substitute',
        DELEGATE_BACKGROUND: 'android.delegate.background',
        DELEGATE_CSS_GRID: 'android.delegate.css-grid',
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
        VIDEOVIEW: 'VideoView',
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
        'INPUT_DATETIME_LOCAL': CONTAINER_NODE.EDIT
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
    const { extractURL, getSrcSet } = $lib.css;
    const { CHAR, COMPONENT, FILE, XML } = $lib.regex;
    const { fromLastIndexOf, hasMimeType, isNumber, isPlainObject, isString, randomUUID, resolvePath, safeNestedArray, spliceArray, trimString } = $lib.util;
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
                                if (value.startsWith('@string/')) {
                                    continue;
                                }
                                value = Resource.addString(value, '', numberAlias);
                                if (value !== '') {
                                    obj[attr] = `@string/${value}`;
                                }
                                break;
                            case 'src':
                            case 'srcCompat':
                                if (COMPONENT.PROTOCOL.test(value)) {
                                    value = Resource.addImage({ mdpi: value });
                                    if (value !== '') {
                                        obj[attr] = `@drawable/${value}`;
                                    }
                                }
                                continue;
                        }
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
            const mimeType = this.controllerSettings.mimeType.image;
            if (mimeType !== '*') {
                this._imageFormat = spliceArray(mimeType.slice(0), value => value === 'image/svg+xml');
            }
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
        static addTheme(theme, path = 'res/values', file = 'themes.xml') {
            const themes = STORED.themes;
            const { items, output } = theme;
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
                    return false;
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
            return true;
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
                        name = `__${name}`;
                    }
                    else if (name === '') {
                        name = `__symbol${Math.ceil(Math.random() * 100000)}`;
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
                if (!imageFormat || hasMimeType(imageFormat, src)) {
                    const asset = Resource.insertStoredAsset('images', Resource.formatName(prefix + src.substring(0, src.length - fromLastIndexOf(src, '.').length - 1)).toLowerCase(), images);
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
                mdpi = extractURL(element);
                if (mdpi !== '' && !mdpi.startsWith('data:image/')) {
                    return this.addImageSet({ mdpi: resolvePath(mdpi) }, prefix);
                }
            }
            else {
                if (element.srcset) {
                    (imageSet || getSrcSet(element, this._imageFormat)).forEach(image => {
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
                    });
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
                    const { base64, filename } = rawData;
                    if (base64) {
                        if (FILE.SVG.test(filename)) {
                            return '';
                        }
                        resource.writeRawImage(prefix + filename, base64);
                        return filename.substring(0, filename.lastIndexOf('.'));
                    }
                }
            }
            return this.addImageSet(result, prefix);
        }
        addImageSet(images, prefix) {
            return Resource.addImage(images, prefix, this._imageFormat);
        }
        writeRawImage(filename, base64) {
            const asset = super.writeRawImage(filename, base64);
            if (asset && this.userSettings.compressImages && Resource.canCompressImage(filename)) {
                safeNestedArray(asset, 'compress').unshift({ format: 'png' });
            }
            return asset;
        }
        get randomUUID() {
            return '__' + randomUUID('_');
        }
        get userSettings() {
            return this.application.userSettings;
        }
    }

    const { isString: isString$1 } = squared.lib.util;
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
        var _a, _b;
        for (const build of [API_ANDROID[api], API_ANDROID[0]]) {
            const value = (_b = (_a = build.assign[tagName]) === null || _a === void 0 ? void 0 : _a[obj]) === null || _b === void 0 ? void 0 : _b[attr];
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
    const { capitalize, isPlainObject: isPlainObject$1 } = $lib$1.util;
    const { BOX_STANDARD } = squared.base.lib.enumeration;
    const REGEX_ID = /^@\+?id\//;
    function calculateBias(start, end, accuracy = 3) {
        if (start === 0) {
            return 0;
        }
        else if (end === 0) {
            return 1;
        }
        return parseFloat(truncate(Math.max(start / (start + end), 0), accuracy));
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
        const result = {};
        let found = false;
        for (const attr in dataset) {
            if (attr.startsWith(prefix)) {
                result[capitalize(attr.substring(prefix.length), false)] = dataset[attr];
                found = true;
            }
        }
        return found ? result : undefined;
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
                    case 32 /* PADDING_TOP */:
                        if (parent.getBox(2 /* MARGIN_TOP */)[0] === 0) {
                            value -= parent.marginTop;
                        }
                        break;
                    case 64 /* PADDING_RIGHT */:
                        value -= parent.marginRight;
                        break;
                    case 128 /* PADDING_BOTTOM */:
                        if (parent.getBox(8 /* MARGIN_BOTTOM */)[0] === 0) {
                            value -= parent.marginBottom;
                        }
                        break;
                    case 256 /* PADDING_LEFT */:
                        value -= parent.marginLeft;
                        break;
                }
            }
            if (parent.getBox(direction)[0] === 0) {
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
        else if (value < 0) {
            switch (direction) {
                case 32 /* PADDING_TOP */:
                    value += parent.marginTop;
                    break;
                case 64 /* PADDING_RIGHT */:
                    value += parent.marginRight;
                    break;
                case 128 /* PADDING_BOTTOM */:
                    value += parent.marginBottom;
                    break;
                case 256 /* PADDING_LEFT */:
                    value += parent.marginLeft;
                    break;
            }
            return value;
        }
        return 0;
    }
    function createViewAttribute(data, options) {
        if (!options) {
            options = { android: {} };
        }
        else if (!options.android) {
            options.android = {};
        }
        if (data) {
            const { android, app } = data;
            if (android) {
                Object.assign(options.android, android);
            }
            if (app) {
                if (!options.app) {
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
        isHorizontalAlign: isHorizontalAlign,
        isVerticalAlign: isVerticalAlign,
        getDataSet: getDataSet,
        getHorizontalBias: getHorizontalBias,
        getVerticalBias: getVerticalBias,
        adjustAbsolutePaddingOffset: adjustAbsolutePaddingOffset,
        createViewAttribute: createViewAttribute,
        createStyleAttribute: createStyleAttribute,
        localizeString: localizeString,
        getXmlNs: getXmlNs,
        getRootNs: getRootNs
    });

    const { lib: $lib$2, base: $base } = squared;
    const { BOX_MARGIN, BOX_PADDING, CSS_UNIT, formatPX, isLength, isPercent } = $lib$2.css;
    const { createElement, getNamedItem, newBoxModel } = $lib$2.dom;
    const { clamp, truncate: truncate$1 } = $lib$2.math;
    const { actualTextRangeRect } = $lib$2.session;
    const { capitalize: capitalize$1, convertFloat, convertInt, convertWord, fromLastIndexOf: fromLastIndexOf$1, isNumber: isNumber$1, isPlainObject: isPlainObject$2, isString: isString$2, replaceMap } = $lib$2.util;
    const { EXT_NAME } = $base.lib.constant;
    const { BOX_STANDARD: BOX_STANDARD$1, NODE_ALIGNMENT, NODE_PROCEDURE } = $base.lib.enumeration;
    const ResourceUI = $base.ResourceUI;
    const { constraint: LAYOUT_CONSTRAINT, relative: LAYOUT_RELATIVE, relativeParent: LAYOUT_RELATIVE_PARENT } = LAYOUT_ANDROID;
    const DEPRECATED = DEPRECATED_ANDROID.android;
    const SPACING_SELECT = 2;
    const SPACING_CHECKBOX = 4;
    const REGEX_DATASETATTR = /^attr[A-Z]/;
    const REGEX_FORMATTED = /^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/;
    const REGEX_STRINGVALID = /[^\w$\-_.]/g;
    const REGEX_CLIPNONE = /^rect\(0[a-z]*,\s+0[a-z]*,\s+0[a-z]*,\s+0[a-z]*\)$/;
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
    function setAutoMargin(node, autoMargin) {
        if (autoMargin.horizontal && (!node.blockWidth || node.hasWidth || node.hasPX('maxWidth') || node.innerMostWrapped.has('width', { type: 4 /* PERCENT */, not: '100%' }))) {
            node.mergeGravity((node.blockWidth || !node.pageFlow) && !node.outerWrapper ? 'gravity' : 'layout_gravity', autoMargin.leftRight ? 'center_horizontal' : (autoMargin.left ? 'right' : 'left'));
            return true;
        }
        return false;
    }
    function setMultiline(node, lineHeight, overwrite) {
        const offset = getLineSpacingExtra(node, lineHeight);
        if (node.api >= 28 /* PIE */) {
            node.android('lineHeight', formatPX(lineHeight), overwrite);
        }
        else if (offset > 0) {
            node.android('lineSpacingExtra', formatPX(offset), overwrite);
        }
        else {
            return;
        }
        const upper = Math.round(offset);
        if (upper > 0) {
            node.modifyBox(node.inline ? 2 /* MARGIN_TOP */ : 32 /* PADDING_TOP */, upper);
            if (!(node.block && !node.floating)) {
                node.modifyBox(node.inline ? 8 /* MARGIN_BOTTOM */ : 128 /* PADDING_BOTTOM */, Math.floor(offset));
            }
        }
    }
    function setMarginOffset(node, lineHeight, inlineStyle, top, bottom) {
        const styleValue = node.cssInitial('lineHeight');
        if (node.imageOrSvgElement || node.renderChildren.length || node.actualHeight === 0 || styleValue === 'initial') {
            return;
        }
        if (node.multiline) {
            setMultiline(node, lineHeight, false);
        }
        else {
            const height = node.height;
            const setBoxPadding = (offset, padding = false) => {
                let upper = Math.round(offset);
                if (upper > 0) {
                    const boxPadding = (inlineStyle || height > lineHeight) && (node.styleText || padding) && !node.inline && !(node.inputElement && !isLength(styleValue, true));
                    if (top) {
                        if (boxPadding) {
                            if (upper > 0) {
                                node.modifyBox(32 /* PADDING_TOP */, upper);
                            }
                        }
                        else if (inlineStyle || !node.baselineAltered) {
                            upper -= node.paddingTop;
                            if (upper > 0) {
                                node.modifyBox(2 /* MARGIN_TOP */, upper);
                            }
                        }
                    }
                    if (bottom) {
                        offset = Math.floor(offset);
                        if (boxPadding) {
                            if (offset > 0) {
                                node.modifyBox(128 /* PADDING_BOTTOM */, offset);
                            }
                        }
                        else {
                            offset -= node.paddingBottom;
                            if (offset > 0) {
                                node.modifyBox(8 /* MARGIN_BOTTOM */, offset);
                            }
                        }
                    }
                }
            };
            if (lineHeight === height) {
                node.mergeGravity('gravity', 'center_vertical', false);
            }
            else if (height > 0) {
                if (node.styleText) {
                    setBoxPadding(getLineSpacingExtra(node, lineHeight));
                }
                else {
                    const offset = (lineHeight / 2) - node.paddingTop;
                    if (offset > 0) {
                        node.modifyBox(32 /* PADDING_TOP */, offset);
                    }
                }
            }
            else if (node.textElement) {
                setBoxPadding(getLineSpacingExtra(node, lineHeight));
            }
            else if (node.inputElement) {
                const element = createElement(document.body, 'div', Object.assign(Object.assign({}, node.textStyle), { visibility: 'hidden' }));
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
            }
            else {
                setBoxPadding((lineHeight - node.bounds.height) / 2);
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
    function checkMergableGravity(value, direction) {
        const horizontal = value + '_horizontal';
        const vertical = value + '_vertical';
        if (direction.has(value) || direction.has(horizontal) && direction.has(vertical)) {
            direction.delete(horizontal);
            direction.delete(vertical);
            direction.add(value);
        }
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
                'white-space': 'nowrap'
            });
            if (values) {
                height = actualTextRangeRect(node.element).height;
                node.cssFinally(values);
            }
        }
        else if (node.plainText) {
            const bounds = node.bounds;
            height = bounds.height / (bounds.numberOfLines || 1);
        }
        return (lineHeight - (!isNaN(height) ? height : node.boundingClientRect.height)) / 2;
    }
    function constraintMinMax(node, horizontal) {
        if (node.support.maxDimension && (horizontal && node.floating || !horizontal)) {
            return;
        }
        if (!node.hasPX(horizontal ? 'width' : 'height', false)) {
            const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', true);
            if (isLength(minWH, true) && parseFloat(minWH) > 0) {
                if (horizontal) {
                    if (ascendFlexibleWidth(node)) {
                        node.setLayoutWidth('0px', false);
                        if (node.flexibleWidth) {
                            node.app('layout_constraintWidth_min', formatPX(node.parseWidth(minWH) + node.contentBoxWidth));
                            node.css('minWidth', 'auto');
                        }
                    }
                }
                else if (ascendFlexibleHeight(node)) {
                    node.setLayoutHeight('0px', false);
                    if (node.flexibleHeight) {
                        node.app('layout_constraintHeight_min', formatPX(node.parseHeight(minWH) + node.contentBoxHeight));
                        node.css(horizontal ? 'minWidth' : 'minHeight', 'auto');
                    }
                }
            }
        }
        const maxWH = node.cssInitial(horizontal ? 'maxWidth' : 'maxHeight', true);
        if (isLength(maxWH, true) && maxWH !== '100%') {
            if (horizontal) {
                if (ascendFlexibleWidth(node)) {
                    const value = node.parseWidth(maxWH);
                    if (value > node.width || node.percentWidth > 0) {
                        node.setLayoutWidth('0px');
                        node.app('layout_constraintWidth_max', formatPX(value + (node.contentBox ? node.contentBoxWidth : 0)));
                        node.css('maxWidth', 'auto');
                    }
                }
            }
            else if (ascendFlexibleHeight(node)) {
                const value = node.parseHeight(maxWH);
                if (value > node.height || node.percentHeight > 0) {
                    node.setLayoutHeight('0px');
                    node.app('layout_constraintHeight_max', formatPX(value + (node.contentBox ? node.contentBoxHeight : 0)));
                    node.css('maxHeight', 'auto');
                }
            }
        }
    }
    function setConstraintPercent(node, value, horizontal, percent) {
        if (value < 1 && !isNaN(percent) && node.pageFlow) {
            const parent = node.actualParent || node.documentParent;
            let boxPercent;
            let marginPercent;
            if (horizontal) {
                const width = parent.box.width;
                boxPercent = !parent.gridElement ? node.contentBoxWidth / width : 0;
                marginPercent = (Math.max(node.marginLeft, 0) + node.marginRight) / width;
            }
            else {
                const height = parent.box.height;
                boxPercent = !parent.gridElement ? node.contentBoxHeight / height : 0;
                marginPercent = (Math.max(node.marginTop, 0) + node.marginBottom) / height;
            }
            if (percent === 1 && value + marginPercent >= percent) {
                value = percent - marginPercent;
            }
            else {
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
                value = Math.min(value + boxPercent, 1);
            }
        }
        if (value === 1 && !node.hasPX(horizontal ? 'maxWidth' : 'maxHeight')) {
            setLayoutDimension(node, 'match_parent', horizontal, false);
        }
        else {
            node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', truncate$1(value, node.localSettings.floatPrecision));
            setLayoutDimension(node, '0px', horizontal, false);
        }
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
    function constraintPercentValue(node, horizontal, percent) {
        const value = horizontal ? node.percentWidth : node.percentHeight;
        return value > 0 ? setConstraintPercent(node, value, horizontal, percent) : percent;
    }
    function constraintPercentWidth(node, percent = 1) {
        const value = node.percentWidth;
        if (value > 0) {
            if (node.renderParent.hasPX('width', false) && !(node.actualParent || node.documentParent).layoutElement) {
                if (value < 1) {
                    node.setLayoutWidth(formatPX(node.actualWidth));
                }
                else {
                    node.setLayoutWidth('match_parent', false);
                }
            }
            else if (!node.inputElement) {
                return constraintPercentValue(node, true, percent);
            }
        }
        return percent;
    }
    function constraintPercentHeight(node, percent = 1) {
        const value = node.percentHeight;
        if (value > 0) {
            if (node.renderParent.hasPX('height', false) && !(node.actualParent || node.documentParent).layoutElement) {
                if (value < 1) {
                    node.setLayoutHeight(formatPX(node.actualHeight));
                }
                else {
                    node.setLayoutHeight('match_parent', false);
                }
            }
            else if (!node.inputElement) {
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
        while (parent) {
            if (!parent.inlineWidth && (parent.hasWidth || parseInt(parent.layoutWidth) > 0 || parent.of(CONTAINER_NODE.CONSTRAINT, 64 /* BLOCK */) || parent.documentRoot && (parent.blockWidth || parent.blockStatic))) {
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
    function ascendFlexibleHeight(node) {
        var _a;
        if (node.documentRoot && node.hasHeight) {
            return true;
        }
        const parent = node.renderParent;
        return !!parent && (parent.hasHeight || parent.layoutConstraint && parent.blockHeight) || ((_a = node.absoluteParent) === null || _a === void 0 ? void 0 : _a.hasHeight) === true;
    }
    const excludeHorizontal = (node) => node.bounds.width === 0 && node.contentBoxWidth === 0 && node.textEmpty && node.marginLeft === 0 && node.marginRight === 0 && !node.visibleStyle.background;
    const excludeVertical = (node) => node.bounds.height === 0 && node.contentBoxHeight === 0 && (node.marginTop === 0 && node.marginBottom === 0 || node.css('overflow') === 'hidden');
    function setLineHeight(node, renderParent) {
        var _a;
        const lineHeight = node.lineHeight;
        if (lineHeight > 0) {
            const hasOwnStyle = node.has('lineHeight', { map: 'initial' });
            if (node.multiline) {
                setMultiline(node, lineHeight, hasOwnStyle);
            }
            else if (node.renderChildren.length) {
                if (!hasOwnStyle && node.layoutHorizontal && node.alignSibling('baseline')) {
                    return;
                }
                else if (node.layoutVertical || node.layoutFrame) {
                    node.renderChildren.forEach((item) => {
                        if (item.length === 0 && !item.multiline && !isNaN(item.lineHeight) && !item.has('lineHeight')) {
                            setMarginOffset(item, lineHeight, true, true, true);
                        }
                    });
                }
                else {
                    const horizontalRows = node.horizontalRows || [node.renderChildren];
                    let previousMultiline = false;
                    const length = horizontalRows.length;
                    for (let i = 0; i < length; ++i) {
                        const row = horizontalRows[i];
                        const q = row.length;
                        const nextRow = horizontalRows[i + 1];
                        const nextMultiline = !!nextRow && (nextRow.length === 1 && nextRow[0].multiline || nextRow[0].lineBreakLeading || i < length - 1 && !!((_a = nextRow.find(item => item.baselineActive)) === null || _a === void 0 ? void 0 : _a.has('lineHeight')));
                        const first = row[0];
                        const singleItem = q === 1;
                        const singleLine = singleItem && !first.multiline;
                        const baseline = !singleItem && row.find(item => item.baselineActive && item.renderChildren.length === 0);
                        const top = singleLine || !previousMultiline && (i > 0 || length === 1) || first.lineBreakLeading;
                        const bottom = singleLine || !nextMultiline && (i < length - 1 || length === 1);
                        if (baseline && q > 1) {
                            if (!isNaN(baseline.lineHeight) && !baseline.has('lineHeight')) {
                                setMarginOffset(baseline, lineHeight, false, top, bottom);
                            }
                            else {
                                previousMultiline = true;
                                continue;
                            }
                        }
                        else {
                            row.forEach((item) => {
                                if (item.length === 0 && !item.multiline && !isNaN(item.lineHeight) && !item.has('lineHeight')) {
                                    setMarginOffset(item, lineHeight, singleItem, top, bottom);
                                }
                            });
                        }
                        previousMultiline = singleItem && first.multiline;
                    }
                }
            }
            else if (hasOwnStyle || renderParent.lineHeight === 0) {
                setMarginOffset(node, lineHeight, hasOwnStyle, true, true);
            }
        }
    }
    function finalizeGravity(node, attr) {
        const direction = getGravityValues(node, attr);
        if (direction.size > 1) {
            checkMergableGravity('center', direction);
            checkMergableGravity('fill', direction);
        }
        let result = '';
        let x = '';
        let y = '';
        let z = '';
        for (const value of direction.values()) {
            if (isHorizontalAlign(value)) {
                x = value;
            }
            else if (isVerticalAlign(value)) {
                y = value;
            }
            else {
                z += (z !== '' ? '|' : '') + value;
            }
        }
        result = x !== '' && y !== '' ? x + '|' + y : x || y;
        if (z !== '') {
            result += (result !== '' ? '|' : '') + z;
        }
        if (result !== '') {
            node.android(attr, result);
        }
        else {
            node.delete('android', attr);
        }
    }
    const getGravityValues = (node, attr) => new Set(node.android(attr).split('|'));
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
                this._containerType = 0;
                this._controlName = '';
                this._boxAdjustment = newBoxModel();
                this._boxReset = newBoxModel();
                this.__android = {};
                this.__app = {};
                this.init();
                if (afterInit) {
                    afterInit(this);
                    this._localization = this.hasProcedure(NODE_PROCEDURE.LOCALIZATION) && this.localSettings.supportRTL;
                }
                else {
                    this._localization = false;
                }
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
            static setFlexDimension(node, dimension) {
                const { grow, basis, shrink } = node.flexbox;
                const horizontal = dimension === 'width';
                const setFlexGrow = (value) => {
                    if (grow > 0) {
                        node.app(horizontal ? 'layout_constraintHorizontal_weight' : 'layout_constraintVertical_weight', truncate$1(grow, node.localSettings.floatPrecision));
                        return true;
                    }
                    else if (value > 0) {
                        if (shrink > 1) {
                            value /= shrink;
                        }
                        else if (shrink > 1) {
                            value *= 1 - shrink;
                        }
                        node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', formatPX(value));
                    }
                    return false;
                };
                if (isLength(basis)) {
                    setFlexGrow(node.parseUnit(basis, dimension));
                    setLayoutDimension(node, '0px', horizontal, true);
                }
                else if (basis !== '0%' && isPercent(basis)) {
                    setFlexGrow(0);
                    const percent = parseFloat(basis) / 100;
                    if (horizontal) {
                        setConstraintPercent(node, percent, true, NaN);
                    }
                    else {
                        setConstraintPercent(node, percent, false, NaN);
                    }
                }
                else {
                    let flexible = false;
                    if (node.hasFlex(horizontal ? 'row' : 'column')) {
                        flexible = setFlexGrow(node.hasPX(dimension, false) ? horizontal ? node.actualWidth : node.actualHeight : 0);
                        if (flexible) {
                            setLayoutDimension(node, '0px', horizontal, true);
                        }
                    }
                    if (!flexible) {
                        if (horizontal) {
                            constraintPercentWidth(node, 0);
                        }
                        else {
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
            }
            static availablePercent(nodes, dimension, boxSize) {
                const horizontal = dimension === 'width';
                let percent = 1;
                let i = 0;
                nodes.forEach(sibling => {
                    sibling = sibling.innerMostWrapped;
                    if (sibling.pageFlow) {
                        ++i;
                        if (sibling.hasPX(dimension, true, true)) {
                            const value = sibling.cssInitial(dimension);
                            if (isPercent(value)) {
                                percent -= parseFloat(value) / 100;
                                return;
                            }
                            else if (isLength(value)) {
                                if (horizontal) {
                                    percent -= (Math.max(sibling.actualWidth + sibling.marginLeft + sibling.marginRight, 0)) / boxSize;
                                }
                                else {
                                    percent -= (Math.max(sibling.actualHeight + sibling.marginTop + sibling.marginBottom, 0)) / boxSize;
                                }
                                return;
                            }
                        }
                        percent -= sibling.linear[dimension] / boxSize;
                    }
                });
                return i > 0 ? Math.max(0, percent) : 1;
            }
            static getControlName(containerType, api = 29 /* Q */) {
                const name = CONTAINER_NODE[containerType];
                return api >= 29 /* Q */ && CONTAINER_ANDROID_X[name] || CONTAINER_ANDROID[name];
            }
            setControlType(controlName, containerType) {
                this.controlName = controlName;
                if (containerType) {
                    this._containerType = containerType;
                }
                else if (this._containerType === 0) {
                    this._containerType = CONTAINER_NODE.UNKNOWN;
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
                if (!this.pageFlow && REGEX_CLIPNONE.test(this.css('clip'))) {
                    this.hide({ hidden: true });
                }
                const actualParent = this.actualParent || this.documentParent;
                const renderParent = this.renderParent;
                const flexibleWidth = !renderParent.inlineWidth;
                const flexibleHeight = !renderParent.inlineHeight;
                const maxDimension = this.support.maxDimension;
                const matchParent = renderParent.layoutConstraint && !renderParent.flexibleWidth && (!renderParent.inlineWidth || this.renderChildren.length) && !this.onlyChild && (!this.textElement && !this.inputElement && !this.controlElement && this.alignParent('left') && this.alignParent('right') || this.alignSibling('leftRight') || this.alignSibling('rightLeft')) ? '0px' : 'match_parent';
                let { layoutWidth, layoutHeight } = this;
                if (layoutWidth === '') {
                    if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                        const width = this.css('width');
                        let value = -1;
                        if (isPercent(width)) {
                            const expandable = () => width === '100%' && flexibleWidth && (maxDimension || !this.hasPX('maxWidth'));
                            if (this.inputElement) {
                                if (expandable()) {
                                    layoutWidth = matchParent;
                                }
                                else {
                                    value = this.actualWidth;
                                }
                            }
                            else if (renderParent.layoutConstraint) {
                                if (flexibleWidth) {
                                    if (expandable()) {
                                        layoutWidth = matchParent;
                                    }
                                    else {
                                        View.setConstraintDimension(this, 1);
                                        layoutWidth = this.layoutWidth;
                                    }
                                }
                                else {
                                    value = this.actualWidth;
                                }
                            }
                            else if (renderParent.layoutGrid) {
                                layoutWidth = '0px';
                                this.android('layout_columnWeight', truncate$1(parseFloat(width) / 100, this.localSettings.floatPrecision));
                            }
                            else if (this.imageElement) {
                                if (expandable()) {
                                    layoutWidth = matchParent;
                                }
                                else {
                                    value = this.bounds.width;
                                }
                            }
                            else if (width === '100%') {
                                if (!maxDimension && this.hasPX('maxWidth')) {
                                    const maxWidth = this.css('maxWidth');
                                    const maxValue = this.parseWidth(maxWidth);
                                    const absoluteParent = this.absoluteParent || actualParent;
                                    if (maxWidth === '100%') {
                                        if (flexibleWidth && Math.ceil(maxValue) >= absoluteParent.box.width) {
                                            layoutWidth = matchParent;
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
                                            layoutWidth = Math.floor(maxValue) < absoluteParent.box.width ? 'wrap_content' : matchParent;
                                        }
                                    }
                                }
                                if (layoutWidth === '' && (this.documentRoot || flexibleWidth)) {
                                    layoutWidth = matchParent;
                                }
                            }
                            else {
                                value = this.actualWidth;
                            }
                        }
                        else if (isLength(width)) {
                            value = this.actualWidth;
                        }
                        if (value !== -1) {
                            layoutWidth = formatPX(value);
                        }
                    }
                    else if (this.length) {
                        switch (this.cssInitial('width')) {
                            case 'max-content':
                            case 'fit-content':
                                this.renderEach((node) => {
                                    if (!node.hasPX('width') && !node.hasPX('maxWidth')) {
                                        node.setLayoutWidth('wrap_content');
                                    }
                                });
                                layoutWidth = 'wrap_content';
                                break;
                            case 'min-content': {
                                const nodes = [];
                                let maxWidth = 0;
                                this.renderEach((node) => {
                                    if (!node.textElement || node.hasPX('width')) {
                                        maxWidth = Math.max(node.actualWidth, maxWidth);
                                    }
                                    else {
                                        maxWidth = Math.max(node.width, maxWidth);
                                        if (node.support.maxDimension) {
                                            nodes.push(node);
                                        }
                                    }
                                });
                                if (maxWidth > 0 && nodes.length) {
                                    const width = formatPX(maxWidth);
                                    nodes.forEach(node => {
                                        if (!node.hasPX('maxWidth')) {
                                            node.css('maxWidth', width);
                                        }
                                    });
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
                        else if (this.imageElement && this.hasHeight) {
                            layoutWidth = 'wrap_content';
                        }
                        else if (flexibleWidth && (this.nodeGroup && (renderParent.layoutFrame && (this.hasAlign(512 /* FLOAT */) || this.hasAlign(2048 /* RIGHT */)) || this.hasAlign(32768 /* PERCENT */)) ||
                            this.layoutGrid && this.some((node) => node.flexibleWidth))) {
                            layoutWidth = 'match_parent';
                        }
                        else if (!this.imageElement && !this.inputElement && !this.controlElement) {
                            const checkParentWidth = (block) => {
                                var _a;
                                if (!actualParent.pageFlow && this.some(node => node.textElement)) {
                                    return;
                                }
                                else if (this.styleText) {
                                    const multiline = ((_a = this.textBounds) === null || _a === void 0 ? void 0 : _a.numberOfLines) > 1;
                                    if (multiline) {
                                        if (block) {
                                            layoutWidth = 'match_parent';
                                        }
                                        return;
                                    }
                                    else if (this.cssTry('display', 'inline-block')) {
                                        const width = Math.ceil(actualTextRangeRect(this.element).width);
                                        layoutWidth = width >= actualParent.box.width ? 'wrap_content' : 'match_parent';
                                        this.cssFinally('display');
                                        return;
                                    }
                                }
                                layoutWidth = matchParent;
                            };
                            if (renderParent.layoutGrid) {
                                if (this.blockStatic && renderParent.android('columnCount') === '1') {
                                    layoutWidth = matchParent;
                                }
                            }
                            else if (this.blockStatic) {
                                if (!actualParent.layoutElement) {
                                    if (this.nodeGroup || renderParent.hasWidth || this.hasAlign(64 /* BLOCK */) || this.originalRoot || this.documentRoot) {
                                        layoutWidth = matchParent;
                                    }
                                    else {
                                        checkParentWidth(true);
                                    }
                                }
                                else if (flexibleWidth && actualParent.gridElement && !renderParent.layoutElement) {
                                    layoutWidth = matchParent;
                                }
                            }
                            else if (this.floating && this.block && !this.rightAligned && this.alignParent('left') && this.alignParent('right')) {
                                layoutWidth = 'match_parent';
                            }
                            else if (this.inlineStatic && !this.blockDimension && this.naturalElement && this.some(item => item.naturalElement && item.blockStatic) && !actualParent.layoutElement && (renderParent.layoutVertical ||
                                !this.alignSibling('leftRight') && !this.alignSibling('rightLeft'))) {
                                checkParentWidth(false);
                            }
                        }
                    }
                    this.setLayoutWidth(layoutWidth || 'wrap_content');
                }
                if (this.layoutHeight === '') {
                    if (this.hasPX('height') && (!this.inlineStatic || this.cssInitial('height') === '')) {
                        const height = this.css('height');
                        let value = -1;
                        if (isPercent(height)) {
                            if (this.inputElement) {
                                value = this.bounds.height;
                            }
                            else if (this.imageElement) {
                                if (height === '100%' && flexibleHeight) {
                                    layoutHeight = 'match_parent';
                                }
                                else {
                                    value = this.bounds.height;
                                }
                            }
                            else if (height === '100%') {
                                if (!maxDimension) {
                                    const maxHeight = this.css('maxHeight');
                                    const maxValue = this.parseHeight(maxHeight);
                                    const absoluteParent = this.absoluteParent || actualParent;
                                    if (maxHeight === '100%') {
                                        if (flexibleHeight && Math.ceil(maxValue) >= absoluteParent.box.height) {
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
                                            layoutHeight = Math.floor(maxValue) < absoluteParent.box.height ? 'wrap_content' : 'match_parent';
                                        }
                                    }
                                }
                                if (layoutHeight === '' && (this.documentRoot || flexibleHeight && this.onlyChild || this.css('position') === 'fixed')) {
                                    layoutHeight = 'match_parent';
                                }
                            }
                            if (layoutHeight === '' && this.hasHeight) {
                                value = this.actualHeight;
                            }
                        }
                        else if (isLength(height)) {
                            value = this.actualHeight;
                        }
                        if (value !== -1) {
                            if (this.is(CONTAINER_NODE.LINE) && this.tagName !== 'HR' && this.hasPX('height', true, true)) {
                                value += this.borderTopWidth + this.borderBottomWidth;
                            }
                            if (this.styleText && this.multiline && !actualParent.layoutElement && !this.hasPX('minHeight')) {
                                this.android('minHeight', formatPX(value));
                                layoutHeight = 'wrap_content';
                            }
                            else {
                                layoutHeight = formatPX(value);
                            }
                        }
                    }
                    if (layoutHeight === '') {
                        if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                            if (renderParent.layoutConstraint && !this.floating && this.alignParent('top') && this.actualHeight >= (this.absoluteParent || actualParent).box.height) {
                                layoutHeight = '0px';
                                this.anchor('bottom', 'parent');
                            }
                            else if (this.naturalChild && !this.pseudoElement) {
                                layoutHeight = formatPX(this.actualHeight);
                            }
                        }
                        else if (this.imageElement && this.hasWidth) {
                            layoutHeight = 'wrap_content';
                        }
                        else if (this.display === 'table-cell' && actualParent.hasHeight) {
                            layoutHeight = 'match_parent';
                        }
                    }
                    this.setLayoutHeight(layoutHeight || 'wrap_content');
                }
                else if (layoutHeight === '0px' && renderParent.inlineHeight && renderParent.android('minHeight') === '' && !actualParent.layoutElement && actualParent === this.absoluteParent) {
                    this.setLayoutHeight('wrap_content');
                }
                if (this.hasPX('minWidth') && (!this.hasFlex('row') || actualParent.flexElement && !this.flexibleWidth)) {
                    const minWidth = this.css('minWidth');
                    if (minWidth === '100%' && this.inlineWidth) {
                        this.setLayoutWidth(matchParent);
                    }
                    else {
                        this.android('minWidth', formatPX(this.parseWidth(minWidth) + (this.contentBox ? this.contentBoxWidth : 0)), false);
                    }
                }
                if (this.hasPX('minHeight') && this.display !== 'table-cell' && (!this.hasFlex('column') || actualParent.flexElement && !this.flexibleHeight)) {
                    const minHeight = this.css('minHeight');
                    if (minHeight === '100%' && flexibleHeight && this.inlineHeight) {
                        this.setLayoutHeight('match_parent');
                    }
                    else {
                        this.android('minHeight', formatPX(this.parseHeight(minHeight) + (this.contentBox ? this.contentBoxHeight : 0)), false);
                    }
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
                                }
                            }
                            else if (flexibleWidth) {
                                this.setLayoutWidth('match_parent');
                            }
                        }
                        else {
                            width = this.parseWidth(maxWidth);
                        }
                    }
                    else if (!this.pageFlow && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && (this.ascend({ condition: item => item.hasPX('width') }).length || !this.textContent.includes('\n'))) {
                        width = this.actualWidth;
                    }
                    if (width >= 0) {
                        this.android('maxWidth', formatPX(width), false);
                    }
                    if (isLength(maxHeight, true)) {
                        let height = -1;
                        if (maxHeight === '100%' && !this.svgElement) {
                            if (flexibleHeight) {
                                this.setLayoutHeight('match_parent');
                            }
                            else {
                                height = this.imageElement ? this.toElementInt('naturalHeight') : this.parseHeight(maxHeight);
                            }
                        }
                        else {
                            height = this.parseHeight(maxHeight);
                        }
                        if (height >= 0) {
                            this.android('maxHeight', formatPX(height));
                        }
                    }
                }
            }
            setAlignment() {
                const node = this.outerMostWrapper;
                const renderParent = this.renderParent;
                const outerRenderParent = (node.renderParent || renderParent);
                const autoMargin = this.autoMargin;
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
                    if (this.inlineVertical && (outerRenderParent.layoutFrame || outerRenderParent.layoutGrid) || this.display === 'table-cell') {
                        const gravity = this.display === 'table-cell' ? 'gravity' : 'layout_gravity';
                        switch (this.cssInitial('verticalAlign', true)) {
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
                        if (outerRenderParent.layoutVertical || this.documentRoot && (this.layoutVertical || this.layoutFrame)) {
                            if (this.floating) {
                                node.mergeGravity('layout_gravity', this.float);
                            }
                            else if (!setAutoMargin(node, autoMargin) && textAlign !== '' && this.hasWidth && !this.blockStatic && !this.inputElement && this.display !== 'table') {
                                node.mergeGravity('layout_gravity', textAlign, false);
                            }
                        }
                        if (this.rightAligned) {
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
                    else if (this.rightAligned && node.nodeGroup && node.layoutVertical) {
                        node.renderEach((item) => {
                            if (item.rightAligned) {
                                item.mergeGravity('layout_gravity', 'right');
                            }
                        });
                    }
                    if (renderParent.layoutFrame) {
                        if (!setAutoMargin(this, autoMargin)) {
                            if (!this.innerWrapped) {
                                if (this.floating) {
                                    floating = this.float;
                                }
                                if (floating !== '' && !renderParent.naturalElement && (renderParent.inlineWidth || !renderParent.documentRoot && this.onlyChild)) {
                                    renderParent.mergeGravity('layout_gravity', floating);
                                    floating = '';
                                }
                            }
                            if (this.centerAligned) {
                                this.mergeGravity('layout_gravity', checkTextAlign('center', false));
                            }
                            else if (this.rightAligned && renderParent.blockWidth) {
                                this.mergeGravity('layout_gravity', 'right');
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
                                    gravity = 'center_vertical';
                                    break;
                            }
                            this.mergeGravity('layout_gravity', gravity);
                        }
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
                if (textAlignParent !== '' && this.blockStatic && !this.centerAligned && !this.rightAligned) {
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
                    node.mergeGravity('layout_gravity', autoMargin.topBottom ? 'center_vertical' : (autoMargin.top ? 'bottom' : 'top'));
                }
            }
            setBoxSpacing() {
                const boxReset = this._boxReset;
                const boxAdjustment = this._boxAdjustment;
                const renderParent = this.renderParent;
                const setBoxModel = (attrs, margin, unmergeable) => {
                    let top = 0;
                    let right = 0;
                    let bottom = 0;
                    let left = 0;
                    for (let i = 0; i < 4; ++i) {
                        const attr = attrs[i];
                        let value = boxReset[attr] === 0 ? this[attr] : 0;
                        if (value !== 0) {
                            switch (attr) {
                                case 'marginRight':
                                    if (this.inline) {
                                        const outer = this.documentParent.box.right;
                                        const inner = this.bounds.right;
                                        if (Math.floor(inner) > outer) {
                                            if (!this.onlyChild && !this.alignParent('left')) {
                                                this.setSingleLine(true);
                                            }
                                            continue;
                                        }
                                        else if (inner + value > outer) {
                                            value = clamp(outer - inner, 0, value);
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
                                        this.naturalChildren.forEach(item => {
                                            if (item.floating) {
                                                maxBottom = Math.max(item.bounds.bottom, maxBottom);
                                            }
                                        });
                                        value = clamp(this.bounds.bottom - maxBottom, 0, value);
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
                            let node = renderParent.renderChildren.find(item => !item.floating);
                            if (node) {
                                const boundsTop = Math.floor(this.bounds.top);
                                let actualNode;
                                while (Math.floor(node.bounds.top) === boundsTop) {
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
                                    const [reset, adjustment] = actualNode.getBox(2 /* MARGIN_TOP */);
                                    top += (reset === 0 ? actualNode.marginTop : 0) + adjustment;
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
                        switch (this.controlName) {
                            case CONTAINER_ANDROID.RADIO:
                            case CONTAINER_ANDROID.CHECKBOX:
                                top = Math.max(top - SPACING_CHECKBOX, 0);
                                bottom = Math.max(bottom - SPACING_CHECKBOX, 0);
                                break;
                            case CONTAINER_ANDROID.SELECT:
                                top = Math.max(top - SPACING_SELECT, 0);
                                bottom = Math.max(bottom - SPACING_SELECT, 0);
                                break;
                        }
                        if (top < 0) {
                            if (!this.pageFlow) {
                                if (bottom >= 0 && this.leftTopAxis && (this.hasPX('top') || !this.hasPX('bottom')) && this.translateY(top)) {
                                    top = 0;
                                }
                            }
                            else if (this.blockDimension && !this.inputElement && this.translateY(top)) {
                                this.anchorChain('bottom').forEach(item => item.translateY(top));
                                top = 0;
                            }
                        }
                        if (bottom < 0) {
                            if (!this.pageFlow) {
                                if (top >= 0 && this.leftTopAxis && this.hasPX('bottom') && !this.hasPX('top') && this.translateY(-bottom)) {
                                    bottom = 0;
                                }
                            }
                            else if (this.blockDimension && !this.inputElement && renderParent.layoutConstraint) {
                                this.anchorChain('bottom').forEach(item => item.translateY(-bottom));
                                bottom = 0;
                            }
                        }
                        if (left < 0) {
                            if (!this.pageFlow) {
                                if (right >= 0 && this.leftTopAxis && (this.hasPX('left') || !this.hasPX('right')) && this.translateX(left)) {
                                    left = 0;
                                }
                            }
                            else if (this.float === 'right') {
                                const siblings = this.anchorChain('left');
                                left = Math.min(-left, -this.bounds.width);
                                siblings.forEach(item => item.translateX(-left));
                                left = 0;
                            }
                            else if (this.blockDimension && this.translateX(left)) {
                                this.anchorChain('right').forEach(item => item.translateX(left));
                                left = 0;
                            }
                        }
                        if (right < 0) {
                            if (!this.pageFlow) {
                                if (left >= 0 && this.leftTopAxis && this.hasPX('right') && !this.hasPX('left') && this.translateX(-right)) {
                                    right = 0;
                                }
                            }
                            else if (this.rightAligned) {
                                if (this.translateX(-right)) {
                                    right = 0;
                                }
                            }
                            else if (this.blockDimension && renderParent.layoutConstraint) {
                                this.anchorChain('right').forEach(item => item.translateX(right));
                                right = 0;
                            }
                        }
                    }
                    else if (this.visibleStyle.borderWidth && !this.is(CONTAINER_NODE.LINE)) {
                        top += this.borderTopWidth;
                        bottom += this.borderBottomWidth;
                        right += this.borderRightWidth;
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
                setBoxModel(BOX_MARGIN, true, renderParent.layoutGrid);
                setBoxModel(BOX_PADDING, false, false);
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
                    this._namespaces.forEach(name => {
                        const obj = this['__' + name];
                        for (const attr in obj) {
                            node.attr(name, attr, attr === 'id' && name === 'android' ? node.documentId : obj[attr]);
                        }
                    });
                }
                if (position) {
                    node.anchorClear();
                    const documentId = this.documentId;
                    if (node.anchor('left', documentId)) {
                        node.setBox(16 /* MARGIN_LEFT */, { reset: 1, adjustment: 0 });
                    }
                    if (node.anchor('top', documentId)) {
                        node.setBox(2 /* MARGIN_TOP */, { reset: 1, adjustment: 0 });
                    }
                }
                node.saveAsInitial(true);
                return node;
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
                if (this.styleElement || this.hasAlign(16384 /* WRAPPER */)) {
                    const dataset = getDataSet(this.dataset, 'android');
                    if (dataset) {
                        for (const namespace in dataset) {
                            const name = namespace === 'attr' ? 'android' : (REGEX_DATASETATTR.test(namespace) ? capitalize$1(namespace.substring(4), false) : '');
                            if (name !== '') {
                                dataset[namespace].split(';').forEach(values => {
                                    const [key, value] = values.split('::');
                                    if (value) {
                                        this.attr(name, key, value);
                                    }
                                });
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
                this.combine().forEach(value => output += indent + value);
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
                    }
                    else if (renderParent.layoutRelative) {
                        const attr = LAYOUT_RELATIVE_PARENT[position];
                        if (attr) {
                            return node.android(this.localizeString(attr)) === 'true';
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
                                const value = node.app(this.localizeString(attr));
                                return value !== 'parent' && value !== renderParent.documentId ? value : '';
                            }
                        }
                        else if (renderParent.layoutRelative) {
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
                            }
                            else {
                                value -= this.bottom;
                            }
                            break;
                        case 'bottom':
                            if (!this.hasPX('top')) {
                                value -= this.bottom;
                            }
                            else {
                                value += this.top;
                            }
                            break;
                        case 'left':
                            if (this.hasPX('left')) {
                                value += this.left;
                            }
                            else {
                                value -= this.right;
                            }
                        case 'right':
                            if (!this.hasPX('left')) {
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
                    if ((companion === null || companion === void 0 ? void 0 : companion.labelFor) === this && !companion.visible) {
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
            translateX(value, options = {}) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent === null || renderParent === void 0 ? void 0 : renderParent.layoutConstraint) {
                    let x = convertInt(node.android('translationX'));
                    if (options.oppose === false && (x > 0 && value < 0 || x < 0 && value > 0)) {
                        return false;
                    }
                    else if (options.accumulate !== false) {
                        x += value;
                    }
                    if (options.contain) {
                        const { left, right } = renderParent.box;
                        const { left: x1, right: x2 } = this.linear;
                        if (x1 + x < left) {
                            x = Math.max(x1 - left, 0);
                        }
                        else if (x2 + x > right) {
                            x = Math.max(right - x2, 0);
                        }
                    }
                    if (x !== 0) {
                        node.android('translationX', formatPX(x));
                    }
                    else {
                        node.delete('android', 'translationX');
                    }
                    return true;
                }
                return false;
            }
            translateY(value, options = {}) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent === null || renderParent === void 0 ? void 0 : renderParent.layoutConstraint) {
                    let y = convertInt(node.android('translationY'));
                    if (options.oppose === false && (y > 0 && value < 0 || y < 0 && value > 0)) {
                        return false;
                    }
                    else if (options.accumulate !== false) {
                        y += value;
                    }
                    if (options.contain) {
                        const { top, bottom } = renderParent.box;
                        const { top: y1, bottom: y2 } = this.linear;
                        if (y1 + y < top) {
                            y = Math.max(y1 - top, 0);
                        }
                        else if (y2 + y > bottom) {
                            y = Math.max(bottom - y2, 0);
                        }
                    }
                    if (y !== 0) {
                        node.android('translationY', formatPX(y));
                    }
                    else {
                        node.delete('android', 'translationY');
                    }
                    return true;
                }
                return false;
            }
            localizeString(value) {
                return localizeString(value, this._localization, this.api);
            }
            removeTry(replacement, beforeReplace) {
                if (replacement && !beforeReplace) {
                    beforeReplace = () => replacement.anchorClear();
                }
                return super.removeTry(replacement, beforeReplace);
            }
            hasFlex(direction) {
                if (super.hasFlex(direction)) {
                    const parent = this.actualParent;
                    if (direction === 'column' && !parent.hasHeight) {
                        const grandParent = parent.actualParent;
                        if (grandParent) {
                            if (grandParent.flexElement && !grandParent.flexdata.column) {
                                if (!grandParent.hasHeight) {
                                    let maxHeight = 0;
                                    let parentHeight = 0;
                                    for (const item of grandParent) {
                                        const height = (item.data(EXT_NAME.FLEXBOX, 'boundsData') || item.bounds).height;
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
                            }
                            else if (!grandParent.gridElement) {
                                return false;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                    const { grow, shrink } = this.flexbox;
                    return grow > 0 || shrink !== 1;
                }
                return false;
            }
            hide(options) {
                if (options) {
                    if (options.hidden) {
                        this.android('visibility', 'invisible');
                        return;
                    }
                    else if (options.collapse) {
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
                            }
                            else {
                                node.anchor('top', 'parent', overwrite);
                                node.anchor('bottom', 'parent', overwrite);
                                node.constraint.vertical = true;
                            }
                            if (bias !== undefined) {
                                node.anchorStyle(orientation, bias, style, overwrite);
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
            anchorStyle(orientation, bias, style, overwrite = true) {
                const node = this.anchorTarget;
                if (orientation === 'horizontal') {
                    node.app('layout_constraintHorizontal_bias', bias.toString(), overwrite);
                    if (style) {
                        node.app('layout_constraintHorizontal_chainStyle', style, overwrite);
                    }
                }
                else {
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
                    let anchorA;
                    let anchorB;
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
                            if ((sibling === null || sibling === void 0 ? void 0 : sibling.alignSibling(anchorB)) === current.documentId) {
                                result.push(sibling);
                                current = sibling;
                            }
                            else {
                                break;
                            }
                        }
                        else {
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
                        node.delete('app', ...replaceMap(position, (value) => this.localizeString(LAYOUT_CONSTRAINT[value])));
                    }
                    else if (renderParent.layoutRelative) {
                        const layout = [];
                        position.forEach(value => {
                            let attr = LAYOUT_RELATIVE[value];
                            if (attr) {
                                layout.push(this.localizeString(attr));
                            }
                            attr = LAYOUT_RELATIVE_PARENT[value];
                            if (attr) {
                                layout.push(this.localizeString(attr));
                            }
                        });
                        node.delete('android', ...layout);
                    }
                }
            }
            anchorClear() {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        node.anchorDelete(...Object.keys(LAYOUT_CONSTRAINT));
                        node.delete('app', 'layout_constraintHorizontal_bias', 'layout_constraintHorizontal_chainStyle', 'layout_constraintVertical_bias', 'layout_constraintVertical_chainStyle');
                    }
                    else if (renderParent.layoutRelative) {
                        node.anchorDelete(...Object.keys(LAYOUT_RELATIVE_PARENT));
                        node.anchorDelete(...Object.keys(LAYOUT_RELATIVE));
                    }
                }
            }
            supported(attr, result = {}) {
                var _a;
                if (typeof DEPRECATED[attr] === 'function') {
                    const valid = DEPRECATED[attr](result, this.api, this);
                    if (!valid || Object.keys(result).length) {
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
                let requireId = false;
                let id = '';
                this._namespaces.forEach(name => {
                    if (all || objs.includes(name)) {
                        const obj = this['__' + name];
                        if (obj) {
                            let prefix = name + ':';
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
                                    prefix = '';
                                default:
                                    for (const attr in obj) {
                                        result.push(prefix + `${attr}="${obj[attr]}"`);
                                    }
                                    break;
                            }
                        }
                    }
                });
                result.sort((a, b) => a > b ? 1 : -1);
                if (requireId) {
                    result.unshift('android:id="' + (id || `@+id/${this.controlId}`) + '"');
                }
                return result;
            }
            mergeGravity(attr, alignment, overwrite = true) {
                if (attr === 'layout_gravity') {
                    const renderParent = this.renderParent;
                    if (renderParent) {
                        if (isHorizontalAlign(alignment) && (this.blockWidth || renderParent.inlineWidth && this.onlyChild || !overwrite && this.outerWrapper && this.hasPX('maxWidth'))) {
                            return;
                        }
                        else if (renderParent.layoutRelative) {
                            if (alignment === 'center_horizontal' && !this.alignSibling('leftRight') && !this.alignSibling('rightLeft')) {
                                this.anchorDelete('left', 'right');
                                this.anchor('centerHorizontal', 'true');
                                return;
                            }
                        }
                        else if (renderParent.layoutConstraint) {
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
                }
                else {
                    switch (this.tagName) {
                        case '#text':
                        case 'IMG':
                        case 'SVG':
                        case 'HR':
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
                            if (this.controlElement || this.is(CONTAINER_NODE.TEXT) && this.textEmpty || this.length && (this.layoutFrame || this.layoutConstraint || this.layoutGrid)) {
                                return;
                            }
                            break;
                    }
                }
                const direction = getGravityValues(this, attr);
                const gravity = this.localizeString(alignment);
                if (!direction.has(gravity)) {
                    direction.add(gravity);
                    let result = '';
                    let x = '';
                    let y = '';
                    let z = '';
                    for (const value of direction.values()) {
                        if (isHorizontalAlign(value)) {
                            if (x === '' || overwrite) {
                                x = value;
                            }
                        }
                        else if (isVerticalAlign(value)) {
                            if (y === '' || overwrite) {
                                y = value;
                            }
                        }
                        else {
                            z += (z !== '' ? '|' : '') + value;
                        }
                    }
                    result = x !== '' && y !== '' ? x + '|' + y : x || y;
                    if (z !== '') {
                        result += (result !== '' ? '|' : '') + z;
                    }
                    if (result !== '') {
                        this.android(attr, result);
                    }
                }
            }
            applyOptimizations() {
                const renderParent = this.renderParent;
                if (renderParent) {
                    this.alignLayout(renderParent);
                    setLineHeight(this, renderParent);
                    finalizeGravity(this, 'layout_gravity');
                    finalizeGravity(this, 'gravity');
                    if (this.imageElement) {
                        const layoutWidth = this.layoutWidth;
                        const layoutHeight = this.layoutHeight;
                        if (layoutWidth === 'wrap_content' && layoutHeight !== 'wrap_content' ||
                            layoutWidth !== 'wrap_content' && layoutHeight === 'wrap_content' ||
                            layoutWidth === 'match_parent' || layoutHeight === 'match_parent' ||
                            layoutWidth === '0px' || layoutHeight === '0px' ||
                            this.android('minWidth') !== '' || this.android('minHeight') !== '' ||
                            this.android('maxWidth') !== '' || this.android('maxHeight') !== '') {
                            this.android('adjustViewBounds', 'true');
                        }
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
                const api = API_ANDROID[this.api];
                if (api) {
                    assign = api.assign;
                    setCustomization(assign[tagName]);
                    setCustomization(assign[controlName]);
                }
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
                        if (!renderParent.layoutFrame && !this.documentRoot && children.length && (this.baselineElement || children.every(node => node.textElement))) {
                            this.android('baselineAlignedChildIndex', '0');
                        }
                    }
                    else {
                        let baseline = !this.baselineActive;
                        if (children.some(node => node.floating) && !children.some(node => node.imageElement && node.baseline)) {
                            this.android('baselineAligned', 'false');
                            baseline = false;
                        }
                        const length = children.length;
                        for (let i = 0; i < length; ++i) {
                            const item = children[i];
                            item.setSingleLine(i === length - 1);
                            if (baseline && item.baselineElement) {
                                this.android('baselineAlignedChildIndex', i.toString());
                                baseline = false;
                            }
                        }
                    }
                }
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
                                name = value.replace(REGEX_STRINGVALID, '_').toLowerCase();
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
                        maxDimension: this.textElement || this.imageOrSvgElement
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
                let result = this._cached.renderExclude;
                if (result === undefined) {
                    if (this.naturalChild && !this.originalRoot) {
                        const renderParent = this.renderParent;
                        if (renderParent) {
                            if (!this.onlyChild && this.length === 0 && this.styleElement && !this.imageElement && !this.pseudoElement) {
                                if (this.pageFlow) {
                                    if (renderParent.layoutVertical) {
                                        result = excludeVertical(this) && this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '';
                                    }
                                    else {
                                        result = excludeHorizontal(this) && (renderParent.layoutHorizontal || excludeVertical(this)) && this.alignSibling('leftRight') === '' && this.alignSibling('rightLeft') === '' && this.alignSibling('topBottom') === '' && this.alignSibling('bottomTop') === '';
                                    }
                                }
                                else {
                                    result = excludeHorizontal(this) || excludeVertical(this);
                                }
                            }
                            else {
                                result = false;
                            }
                        }
                        else {
                            return false;
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
                        if (this.naturalElement && !this.pseudoElement && this.lineHeight > result) {
                            result = this.lineHeight;
                        }
                        else if (this.inputElement) {
                            switch (this.controlName) {
                                case CONTAINER_ANDROID.RADIO:
                                case CONTAINER_ANDROID.CHECKBOX:
                                    result += SPACING_CHECKBOX * 2;
                                    break;
                                case CONTAINER_ANDROID.SELECT:
                                    result /= this.toElementInt('size') || 1;
                                    result += SPACING_SELECT * 2;
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
                if (value) {
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
                const { horizontal, vertical } = this.constraint;
                return horizontal === true && vertical === true;
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
        set containerType(value) {
            this._containerType = value;
        }
        get containerType() {
            return this._containerType;
        }
        set renderExclude(value) { }
        get renderExclude() {
            return false;
        }
    }

    const { lib: $lib$3, base: $base$1 } = squared;
    const { PLATFORM, isPlatform } = $lib$3.client;
    const { parseColor: parseColor$1 } = $lib$3.color;
    const { formatPX: formatPX$1, getSrcSet: getSrcSet$1, hasComputedStyle, isLength: isLength$1, isPercent: isPercent$1 } = $lib$3.css;
    const { getElementsBetweenSiblings, getRangeClientRect } = $lib$3.dom;
    const { truncate: truncate$2 } = $lib$3.math;
    const { CHAR: CHAR$1 } = $lib$3.regex;
    const { getElementAsNode, getPseudoElt } = $lib$3.session;
    const { assignEmptyValue, convertFloat: convertFloat$1, hasBit, hasMimeType: hasMimeType$1, isString: isString$3, iterateArray, objectMap, parseMimeType, partitionArray, withinRange } = $lib$3.util;
    const { STRING_XMLENCODING, replaceTab } = $lib$3.xml;
    const { APP_SECTION, BOX_STANDARD: BOX_STANDARD$2, NODE_ALIGNMENT: NODE_ALIGNMENT$1, NODE_PROCEDURE: NODE_PROCEDURE$1, NODE_RESOURCE, NODE_TEMPLATE } = $base$1.lib.enumeration;
    const NodeUI = $base$1.NodeUI;
    const REGEX_TEXTSHADOW = /((?:rgb|hsl)a?\([^)]+\)|[a-z]{4,})?\s*(-?[\d.]+[a-z]+)\s+(-?[\d.]+[a-z]+)\s*([\d.]+[a-z]+)?/;
    function sortHorizontalFloat(list) {
        list.sort((a, b) => {
            switch (a.float) {
                case 'left':
                    return -1;
                case 'right':
                    return 1;
            }
            switch (b.float) {
                case 'left':
                    return 1;
                case 'right':
                    return -1;
            }
            return 0;
        });
    }
    function sortTemplateInvalid(a, b) {
        const above = a.node.innerMostWrapped;
        const below = b.node.innerMostWrapped;
        return getSortOrderInvalid(above, below);
    }
    function sortTemplateStandard(a, b) {
        const above = a.node.innerMostWrapped;
        const below = b.node.innerMostWrapped;
        return getSortOrderStandard(above, below);
    }
    function getSortOrderStandard(above, below) {
        const parentA = above.actualParent;
        const parentB = below.actualParent;
        if (above === parentB) {
            return -1;
        }
        else if (parentA === below) {
            return 1;
        }
        const { pageFlow: pA, zIndex: zA } = above;
        const { pageFlow: pB, zIndex: zB } = below;
        if (!pA && pB) {
            return zA >= 0 ? 1 : -1;
        }
        else if (!pB && pA) {
            return zB >= 0 ? -1 : 1;
        }
        else if (zA === zB) {
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
            }
            else if (parentA === below) {
                return 1;
            }
            else if (parentA && parentB) {
                if (parentA === parentB) {
                    return getSortOrderStandard(above, below);
                }
                else if (parentA.actualParent === parentB.actualParent) {
                    return getSortOrderStandard(parentA, parentB);
                }
            }
            return above.id < below.id ? -1 : 1;
        }
        return depthA < depthB ? -1 : 1;
    }
    function adjustBaseline(baseline, nodes, singleRow, boxTop) {
        const baselineHeight = baseline.baselineHeight;
        const isBaselineImage = (item) => item.imageOrSvgElement && item.baseline;
        const getBaselineAnchor = (node) => node.imageOrSvgElement ? 'baseline' : 'bottom';
        let imageHeight = 0;
        let imageBaseline;
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
                    continue;
                }
                else {
                    const imageElements = node.renderChildren.filter((item) => isBaselineImage(item));
                    if (node.imageOrSvgElement || imageElements.length) {
                        imageElements.forEach(image => height = Math.max(image.baselineHeight, height));
                        if (height > baselineHeight) {
                            if (!imageBaseline || height >= imageHeight) {
                                imageBaseline === null || imageBaseline === void 0 ? void 0 : imageBaseline.anchor(getBaselineAnchor(node), node.documentId);
                                imageHeight = height;
                                imageBaseline = node;
                            }
                            else {
                                node.anchor(getBaselineAnchor(imageBaseline), imageBaseline.documentId);
                            }
                            continue;
                        }
                        else if (withinRange(node.linear.top, boxTop)) {
                            node.anchor('top', 'true');
                            continue;
                        }
                    }
                }
                if (singleRow && node.is(CONTAINER_NODE.BUTTON)) {
                    node.anchor('centerVertical', 'true');
                }
                else if (node.naturalChild && node.isEmpty) {
                    node.anchor('baseline', baseline.documentId);
                }
                else if (node.baselineElement) {
                    node.anchor(node.naturalElements.find((item) => isBaselineImage(item)) ? 'bottom' : 'baseline', baseline.documentId);
                }
            }
            else if (isBaselineImage(node)) {
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
                node.modifyBox(16 /* MARGIN_LEFT */, previous.actualWidth + (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0) - right);
                node.anchor('left', previous.documentId);
                previous.setBox(4 /* MARGIN_RIGHT */, { reset: 1 });
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
            previous.setBox(16 /* MARGIN_LEFT */, { reset: 1 });
            return true;
        }
        return false;
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
        return nodes.filter(node => (node.baseline || isLength$1(node.verticalAlign, true)) && (node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' && node.toElementInt('size') > 1) || node.verticalAlign === 'text-bottom' && node.containerName !== 'INPUT_IMAGE').sort((a, b) => {
            if (a.baselineHeight === b.baselineHeight) {
                return a.tagName === 'SELECT' ? 1 : 0;
            }
            return a.baselineHeight > b.baselineHeight ? -1 : 1;
        });
    }
    function causesLineBreak(element) {
        if (element.tagName === 'BR') {
            return true;
        }
        else if (hasComputedStyle(element)) {
            const style = getComputedStyle(element);
            const position = style.getPropertyValue('position');
            if (!(position === 'absolute' || position === 'fixed')) {
                const display = style.getPropertyValue('display');
                const floating = style.getPropertyValue('float') !== 'none';
                const hasWidth = () => (style.getPropertyValue('width') === '100%' || style.getPropertyValue('minWidth') === '100%') && style.getPropertyValue('max-width') === 'none';
                switch (display) {
                    case 'block':
                    case 'flex':
                    case 'grid':
                        return !floating || hasWidth();
                }
                return (display.startsWith('inline-') || display === 'table') && hasWidth();
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
    function setLeftTopAxis(node, parent, horizontal) {
        const [orientation, dimension, posA, posB, marginA, marginB, paddingA, paddingB] = horizontal ? ['horizontal', 'width', 'left', 'right', 16 /* MARGIN_LEFT */, 4 /* MARGIN_RIGHT */, 256 /* PADDING_LEFT */, 64 /* PADDING_RIGHT */]
            : ['vertical', 'height', 'top', 'bottom', 2 /* MARGIN_TOP */, 8 /* MARGIN_BOTTOM */, 32 /* PADDING_TOP */, 128 /* PADDING_BOTTOM */];
        const autoMargin = node.autoMargin;
        const hasDimension = node.hasPX(dimension);
        if (hasDimension && autoMargin[orientation]) {
            if (node.hasPX(posA) && autoMargin[posB]) {
                node.anchor(posA, 'parent');
                node.modifyBox(marginA, node[posA]);
            }
            else if (node.hasPX(posB) && autoMargin[posA]) {
                node.anchor(posB, 'parent');
                node.modifyBox(marginB, node[posB]);
            }
            else {
                node.anchorParent(orientation, 0.5);
                node.modifyBox(marginA, node[posA]);
                node.modifyBox(marginB, node[posB]);
            }
        }
        else {
            const blockStatic = node.css(dimension) === '100%' || node.css(horizontal ? 'minWidth' : 'minHeight') === '100%';
            let expand = 0;
            if (node.hasPX(posA)) {
                node.anchor(posA, 'parent');
                if (!node.hasPX(posB) && blockStatic) {
                    node.anchor(posB, 'parent');
                    expand++;
                }
                node.modifyBox(marginA, adjustAbsolutePaddingOffset(parent, paddingA, node[posA]));
                expand++;
            }
            if (node.hasPX(posB)) {
                if (blockStatic || !hasDimension || !node.hasPX(posA)) {
                    node.anchor(posB, 'parent');
                    node.modifyBox(marginB, adjustAbsolutePaddingOffset(parent, paddingB, node[posB]));
                }
                expand++;
            }
            if (expand === 0) {
                if (horizontal) {
                    if (node.centerAligned) {
                        node.anchorParent('horizontal', 0.5);
                    }
                    else if (node.rightAligned) {
                        if (node.blockStatic) {
                            node.anchorParent('horizontal', 1);
                        }
                        else {
                            node.anchor('right', 'parent');
                        }
                    }
                }
            }
            else if (expand === 2 && !hasDimension && !(autoMargin[orientation] && !autoMargin[posA] && !autoMargin[posB])) {
                if (horizontal) {
                    node.setLayoutWidth('0px');
                }
                else {
                    node.setLayoutHeight('0px');
                }
            }
        }
    }
    function setImageDimension(node, width, height, image) {
        node.css('width', formatPX$1(width), true);
        if (image && image.width > 0 && image.height > 0) {
            height = image.height * (width / image.width);
            node.css('height', formatPX$1(height), true);
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
    function checkClearMap(node, clearMap) {
        if (node.naturalChild) {
            return clearMap.has(node);
        }
        else if (node.nodeGroup) {
            return node.cascade(item => item.naturalChild).some((item) => clearMap.has(item));
        }
        else {
            return clearMap.has(node.innerMostWrapped);
        }
    }
    function isConstraintLayout(layout, vertical) {
        const parent = layout.parent;
        if (parent.flexElement && (parent.css('alignItems') === 'baseline' || layout.some(item => item.flexbox.alignSelf === 'baseline'))) {
            return false;
        }
        const multiple = layout.length > 1;
        return layout.some(item => multiple && (item.rightAligned || item.centerAligned) && layout.singleRowAligned || (item.percentWidth > 0 && item.percentWidth < 1) || item.hasPX('maxWidth')) && (!vertical || layout.every(item => item.marginTop >= 0));
    }
    function adjustBodyMargin(node, position) {
        if (node.leftTopAxis) {
            const parent = node.absoluteParent;
            if (parent.documentBody) {
                switch (position) {
                    case 'top':
                        if (parent.getBox(2 /* MARGIN_TOP */)[0] === 0) {
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
    function segmentRightAligned(children) {
        return partitionArray(children, item => item.float === 'right' || item.autoMargin.left === true);
    }
    function segmentLeftAligned(children) {
        return partitionArray(children, item => item.float === 'left' || item.autoMargin.right === true);
    }
    const hasCleared = (layout, clearMap, ignoreFirst = true) => clearMap.size && layout.some((node, index) => (index > 0 || !ignoreFirst) && clearMap.has(node));
    const isMultiline = (node) => node.plainText && Resource.hasLineBreak(node, false, true) || node.preserveWhiteSpace && CHAR$1.LEADINGNEWLINE.test(node.textContent);
    const requireSorting = (node) => node.zIndex !== 0 || !node.pageFlow;
    const getMaxHeight = (node) => Math.max(node.actualHeight, node.lineHeight);
    const getVerticalLayout = (layout) => isConstraintLayout(layout, true) ? CONTAINER_NODE.CONSTRAINT : (layout.some(item => item.positionRelative || !item.pageFlow && item.autoPosition) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR);
    const getVerticalAlignedLayout = (layout) => isConstraintLayout(layout, true) ? CONTAINER_NODE.CONSTRAINT : (layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR);
    const getAnchorDirection = (reverse = false) => reverse ? { anchorStart: 'right', anchorEnd: 'left', chainStart: 'rightLeft', chainEnd: 'leftRight' } : { anchorStart: 'left', anchorEnd: 'right', chainStart: 'leftRight', chainEnd: 'rightLeft' };
    const isUnknownParent = (parent, value, length) => parent.containerType === value && parent.length === length && (parent.alignmentType === 0 || parent.hasAlign(2 /* UNKNOWN */));
    function setHorizontalAlignment(node) {
        if (node.centerAligned) {
            node.anchorParent('horizontal', 0.5);
        }
        else {
            const autoMargin = node.autoMargin;
            if (autoMargin.horizontal) {
                node.anchorParent('horizontal', autoMargin.left ? 1 : (autoMargin.leftRight ? 0.5 : 0));
            }
            else {
                const rightAligned = node.rightAligned;
                if (rightAligned) {
                    node.anchor('right', 'parent');
                    node.anchorStyle('horizontal', 1);
                }
                else {
                    node.anchor('left', 'parent');
                    node.anchorStyle('horizontal', 0);
                }
                if (node.blockStatic || node.percentWidth > 0 || node.block && node.multiline && node.floating) {
                    node.anchor(rightAligned ? 'left' : 'right', 'parent');
                }
            }
        }
    }
    function setVerticalAlignment(node, onlyChild = true, biasOnly = false) {
        const autoMargin = node.autoMargin;
        let bias = onlyChild ? 0 : NaN;
        if (node.floating) {
            bias = 0;
        }
        else if (autoMargin.vertical) {
            bias = autoMargin.top ? 1 : (autoMargin.topBottom ? 0.5 : 0);
        }
        else if (node.imageOrSvgElement || node.inlineVertical) {
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
        }
        else {
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
            }
        }
        if (!isNaN(bias)) {
            if (biasOnly) {
                node.app('layout_constraintVertical_bias', bias.toString(), false);
                node.delete('layout_constraintVertical_chainStyle');
            }
            else {
                node.anchorStyle('vertical', bias, onlyChild ? '' : 'packed', false);
            }
        }
    }
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
                    image: 'res/drawable',
                    video: 'res/raw',
                    audio: 'res/raw'
                },
                svg: {
                    enabled: false
                },
                style: {
                    inputBorderColor: 'rgb(0, 0, 0)',
                    inputBackgroundColor: isPlatform(4 /* MAC */) ? 'rgb(255, 255, 255)' : 'rgb(221, 221, 221)',
                    inputColorBorderColor: 'rgb(119, 119, 199)',
                    meterForegroundColor: 'rgb(99, 206, 68)',
                    meterBackgroundColor: 'rgb(237, 237, 237)',
                    progressForegroundColor: 'rgb(138, 180, 248)',
                    progressBackgroundColor: 'rgb(237, 237, 237)'
                },
                mimeType: {
                    font: ['font/ttf', 'font/otf'],
                    image: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml', 'image/heic', 'image/heif', 'image/x-icon'],
                    audio: ['video/3gpp', 'video/mp4', 'video/mp2t', 'video/x-matroska', 'audio/aac', 'audio/flac', 'audio/gsm', 'audio/midi', 'audio/mpeg', 'audio/wav', 'audio/ogg'],
                    video: ['video/3gpp', 'video/mp4', 'video/mp2t', 'video/x-matroska', 'video/webm']
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
                        'DATALIST',
                        'TRACK'
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
            const length = nodes.length;
            let i = 0;
            while (i < length) {
                const node = nodes[i++];
                node.applyOptimizations();
                if (node.hasProcedure(NODE_PROCEDURE$1.CUSTOMIZATION)) {
                    node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
                }
            }
        }
        finalize(layouts) {
            const insertSpaces = this.userSettings.insertSpaces;
            layouts.forEach(layout => {
                const content = layout.content;
                layout.content = replaceTab(content.replace('{#0}', getRootNs(content)), insertSpaces);
            });
        }
        processUnknownParent(layout) {
            const node = layout.node;
            if (layout.some(item => !item.pageFlow && !item.autoPosition)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */ | 2 /* UNKNOWN */);
            }
            else if (layout.length <= 1) {
                const child = node.item(0);
                if (child) {
                    if (node.originalRoot && isTargeted(node.element, child)) {
                        node.hide();
                        return { layout, next: true };
                    }
                    else if (node.naturalElement && child.plainText) {
                        child.hide();
                        node.clear();
                        node.inlineText = true;
                        node.textContent = child.textContent;
                        layout.setContainerType(CONTAINER_NODE.TEXT);
                        layout.add(1024 /* INLINE */);
                    }
                    else if (layout.parent.flexElement && child.baselineElement && node.flexbox.alignSelf === 'baseline') {
                        layout.setContainerType(CONTAINER_NODE.LINEAR, 8 /* HORIZONTAL */);
                    }
                    else if (child.percentWidth > 0 && child.percentWidth < 1) {
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 32768 /* PERCENT */);
                    }
                    else if (node.autoMargin.leftRight || node.autoMargin.left) {
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
                    }
                    else if (child.baselineElement) {
                        layout.setContainerType(getVerticalAlignedLayout(layout), 16 /* VERTICAL */);
                    }
                    else {
                        layout.setContainerType(CONTAINER_NODE.FRAME);
                    }
                    layout.add(4096 /* SINGLE */);
                }
                else {
                    return this.processUnknownChild(layout);
                }
            }
            else if (Resource.hasLineBreak(node, true)) {
                layout.setContainerType(getVerticalAlignedLayout(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
            }
            else if (this.checkConstraintFloat(layout)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
                if (layout.every(item => item.floating)) {
                    layout.add(512 /* FLOAT */);
                }
                else if (layout.linearY) {
                    layout.add(16 /* VERTICAL */);
                }
                else if (layout.some(item => item.floating || item.rightAligned) && layout.singleRowAligned) {
                    layout.add(8 /* HORIZONTAL */);
                }
                else {
                    layout.add(layout.some(item => item.blockStatic) ? 16 /* VERTICAL */ : 1024 /* INLINE */);
                    layout.add(2 /* UNKNOWN */);
                }
            }
            else if (layout.linearX || layout.singleRowAligned) {
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
                    layout.setContainerType(isConstraintLayout(layout, false) ? CONTAINER_NODE.CONSTRAINT : CONTAINER_NODE.RELATIVE);
                }
                layout.add(8 /* HORIZONTAL */);
            }
            else if (layout.linearY) {
                layout.setContainerType(getVerticalLayout(layout), 16 /* VERTICAL */ | (node.originalRoot || layout.some((item, index) => index > 0 && item.inlineFlow && layout.item(index - 1).inlineFlow) ? 2 /* UNKNOWN */ : 0));
            }
            else if (layout.every(item => item.inlineFlow)) {
                if (this.checkFrameHorizontal(layout)) {
                    layout.addRender(512 /* FLOAT */);
                    layout.addRender(8 /* HORIZONTAL */);
                }
                else {
                    layout.setContainerType(getVerticalLayout(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
                }
            }
            else {
                const children = layout.children;
                const clearMap = this.application.clearMap;
                if (layout.some((item, index) => item.alignedVertically(index > 0 ? children.slice(0, index) : undefined, clearMap) > 0)) {
                    layout.setContainerType(getVerticalLayout(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
                }
                else {
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 2 /* UNKNOWN */);
                }
            }
            return { layout };
        }
        processUnknownChild(layout) {
            const node = layout.node;
            const background = node.visibleStyle.background;
            if (node.inlineText && (!node.textEmpty || background)) {
                layout.setContainerType(CONTAINER_NODE.TEXT);
            }
            else if (node.blockStatic && node.naturalChildren.length === 0 && (background || node.contentBoxHeight > 0)) {
                layout.setContainerType(CONTAINER_NODE.FRAME);
            }
            else if (node.bounds.height === 0 &&
                node.naturalChild &&
                node.naturalElements.length === 0 &&
                node.elementId === '' &&
                node.marginTop === 0 &&
                node.marginRight === 0 &&
                node.marginBottom === 0 &&
                node.marginLeft === 0 &&
                !node.originalRoot &&
                !background &&
                !node.dataset.use) {
                node.hide();
                return { layout, next: true };
            }
            else {
                switch (node.tagName) {
                    case 'OUTPUT':
                        layout.setContainerType(CONTAINER_NODE.TEXT);
                        break;
                    default: {
                        if (node.textContent !== '' && (background || node.pseudoElement && getPseudoElt(node.element, node.sessionId) === '::after')) {
                            layout.setContainerType(CONTAINER_NODE.TEXT);
                            node.inlineText = true;
                        }
                        else {
                            layout.setContainerType(CONTAINER_NODE.FRAME);
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
                    parent.addAlign(512 /* FLOAT */);
                    parent.removeAlign(2 /* UNKNOWN */);
                    return undefined;
                }
                else {
                    layout.node = this.createNodeGroup(layout.node, layout.children, { parent });
                    layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
                }
            }
            else if (this.checkFrameHorizontal(layout)) {
                layout.node = this.createNodeGroup(layout.node, layout.children, { parent });
                layout.addRender(512 /* FLOAT */);
                layout.addRender(8 /* HORIZONTAL */);
            }
            else if (layout.length !== siblings.length || parent.hasAlign(16 /* VERTICAL */)) {
                layout.node = this.createNodeGroup(layout.node, layout.children, { parent });
                this.processLayoutHorizontal(layout);
            }
            else {
                if (!parent.hasAlign(1024 /* INLINE */)) {
                    parent.addAlign(8 /* HORIZONTAL */);
                }
                parent.removeAlign(2 /* UNKNOWN */);
            }
            return layout;
        }
        processTraverseVertical(layout) {
            const parent = layout.parent;
            const clearMap = this.application.clearMap;
            const floatSize = layout.floated.size;
            const length = layout.length;
            const setVerticalLayout = () => {
                parent.addAlign(16 /* VERTICAL */);
                parent.removeAlign(2 /* UNKNOWN */);
            };
            if (layout.some((item, index) => item.lineBreakTrailing && index < length - 1)) {
                if (!parent.hasAlign(16 /* VERTICAL */)) {
                    const containerType = getVerticalLayout(layout);
                    if (isUnknownParent(parent, containerType, length)) {
                        setVerticalLayout();
                        return undefined;
                    }
                    else {
                        if (parent.layoutConstraint) {
                            parent.addAlign(16 /* VERTICAL */);
                            if (!parent.hasAlign(32 /* ABSOLUTE */)) {
                                return undefined;
                            }
                        }
                        layout.node = this.createLayoutGroup(layout);
                        layout.setContainerType(containerType, 16 /* VERTICAL */ | 2 /* UNKNOWN */);
                    }
                }
            }
            else if (floatSize === 1 && layout.every((item, index) => index === 0 || index === length - 1 || clearMap.has(item))) {
                if (layout.same(node => node.float)) {
                    if (isUnknownParent(parent, CONTAINER_NODE.CONSTRAINT, length)) {
                        setVerticalLayout();
                        return undefined;
                    }
                    else {
                        layout.node = this.createLayoutGroup(layout);
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
                    }
                }
                else if (hasCleared(layout, clearMap) || this.checkFrameHorizontal(layout)) {
                    layout.node = this.createLayoutGroup(layout);
                    layout.addRender(512 /* FLOAT */);
                    layout.addRender(8 /* HORIZONTAL */);
                }
                else {
                    const containerType = getVerticalAlignedLayout(layout);
                    if (isUnknownParent(parent, containerType, length)) {
                        setVerticalLayout();
                        return undefined;
                    }
                    else {
                        if (parent.layoutConstraint) {
                            parent.addAlign(16 /* VERTICAL */);
                            if (!parent.hasAlign(32 /* ABSOLUTE */)) {
                                return undefined;
                            }
                        }
                        layout.node = this.createLayoutGroup(layout);
                        layout.setContainerType(containerType, 16 /* VERTICAL */);
                    }
                }
            }
            else if (floatSize) {
                if (hasCleared(layout, clearMap)) {
                    layout.node = this.createLayoutGroup(layout);
                    layout.addRender(512 /* FLOAT */);
                    layout.addRender(16 /* VERTICAL */);
                }
                else if (layout.item(0).floating) {
                    layout.node = this.createLayoutGroup(layout);
                    layout.addRender(512 /* FLOAT */);
                    layout.addRender(8 /* HORIZONTAL */);
                }
            }
            if (!parent.hasAlign(16 /* VERTICAL */)) {
                const containerType = getVerticalAlignedLayout(layout);
                if (isUnknownParent(parent, containerType, length)) {
                    setVerticalLayout();
                    return undefined;
                }
                else {
                    if (parent.layoutConstraint) {
                        parent.addAlign(16 /* VERTICAL */);
                        if (!parent.hasAlign(32 /* ABSOLUTE */)) {
                            return undefined;
                        }
                    }
                    layout.node = this.createLayoutGroup(layout);
                    layout.setContainerType(containerType, 16 /* VERTICAL */);
                }
            }
            return layout;
        }
        processLayoutHorizontal(layout) {
            if (this.checkConstraintFloat(layout)) {
                layout.setContainerType(CONTAINER_NODE.CONSTRAINT, layout.every(item => item.floating) ? 512 /* FLOAT */ : 1024 /* INLINE */);
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
            if (parent.layoutRelative) {
                if (templates.some(item => item.node.zIndex !== 0)) {
                    templates.sort(sortTemplateStandard);
                }
            }
            else if (parent.layoutConstraint) {
                if (templates.some(item => requireSorting(item.node))) {
                    let result = [];
                    const originalParent = parent.innerMostWrapped;
                    const actualParent = [];
                    const nested = [];
                    templates.forEach(item => {
                        const node = item.node.innerMostWrapped;
                        if (node.pageFlow || node.actualParent === node.documentParent || node === originalParent) {
                            result.push(item);
                            actualParent.push(node);
                        }
                        else {
                            nested.push(item);
                        }
                    });
                    result.sort(sortTemplateStandard);
                    if (nested.length) {
                        const map = new Map();
                        const invalid = [];
                        const below = [];
                        nested.forEach(item => {
                            var _a;
                            const node = item.node.innerMostWrapped;
                            const adjacent = node.ascend({ condition: (above) => actualParent.includes(above), error: (above) => above.originalRoot })[0];
                            if (adjacent) {
                                ((_a = map.get(adjacent)) === null || _a === void 0 ? void 0 : _a.push(item)) || map.set(adjacent, [item]);
                            }
                            else {
                                if (node.zIndex < 0) {
                                    below.push(item);
                                }
                                else {
                                    invalid.push(item);
                                }
                            }
                        });
                        for (const [adjacent, children] of map.entries()) {
                            children.sort(sortTemplateStandard);
                            const index = result.findIndex(item => item.node.innerMostWrapped === adjacent);
                            if (index !== -1) {
                                result.splice(index + 1, 0, ...children);
                            }
                            else {
                                children.forEach(item => {
                                    const node = item.node.innerMostWrapped;
                                    if (node.zIndex < 0) {
                                        below.push(item);
                                    }
                                    else {
                                        invalid.push(item);
                                    }
                                });
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
            switch (layout.floated.size) {
                case 1:
                    if (layout.node.cssAscend('textAlign', true) === 'center' && layout.some(node => node.pageFlow)) {
                        return true;
                    }
                    else if (layout.floated.has('right')) {
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
                        return pageFlow > 0 && !layout.singleRowAligned;
                    }
                    return layout.item(0).floating && (layout.linearY ||
                        layout.length > 2 && !layout.singleRowAligned && !layout.every(item => item.inlineFlow) ||
                        layout.every(item => item.floating || item.block && (!item.isEmpty || !(item.textElement || item.inputElement || item.imageElement || item.svgElement || item.controlElement))));
                case 2:
                    return true;
            }
            return false;
        }
        checkConstraintFloat(layout) {
            const length = layout.length;
            if (length > 1) {
                const clearMap = this.application.clearMap;
                let A = true;
                let B = true;
                for (const node of layout) {
                    if (clearMap.has(node)) {
                        continue;
                    }
                    else {
                        const inputElement = node.inputElement || node.controlElement;
                        if (A && !(node.floating || node.autoMargin.horizontal || node.inlineDimension && !inputElement || node.imageOrSvgElement || node.marginTop < 0)) {
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
                const floatedSize = layout.floated.size;
                if (floatedSize && (floatedSize === 2 ||
                    hasCleared(layout, this.application.clearMap) ||
                    layout.some(item => item.float === 'left') && layout.some(item => item.autoMargin.left === true) ||
                    layout.some(item => item.float === 'right') && layout.some(item => item.autoMargin.right === true))) {
                    return false;
                }
                return layout.some(node => node.blockVertical || node.percentWidth > 0 && node.percentWidth < 1 && !node.inputElement && !node.controlElement || node.marginTop < 0 || node.verticalAlign === 'bottom' && !layout.parent.hasHeight);
            }
            return false;
        }
        checkLinearHorizontal(layout) {
            const floated = layout.floated;
            const floatSize = floated.size;
            if ((floatSize === 0 || floatSize === 1 && floated.has('left')) && layout.node.lineHeight === 0 && layout.singleRowAligned) {
                const { fontSize, lineHeight } = layout.item(0);
                const boxWidth = layout.parent.actualBoxWidth();
                let contentWidth = 0;
                for (const node of layout) {
                    if (!(node.naturalChild && node.isEmpty && !node.inputElement && !node.controlElement && !node.positionRelative && node.baseline && !node.blockVertical && node.zIndex === 0 && node.lineHeight === lineHeight && node.fontSize === fontSize)) {
                        return false;
                    }
                    else {
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
        setConstraints() {
            this.cache.each(node => {
                const renderChildren = node.renderChildren;
                if (renderChildren.length && node.hasProcedure(NODE_PROCEDURE$1.CONSTRAINT)) {
                    if (node.hasAlign(4 /* AUTO_LAYOUT */)) {
                        if (node.layoutConstraint && !node.layoutElement) {
                            this.evaluateAnchors(renderChildren);
                        }
                    }
                    else if (node.layoutRelative) {
                        this.processRelativeHorizontal(node, renderChildren);
                    }
                    else if (node.layoutConstraint) {
                        let j = 0;
                        const length = renderChildren.length;
                        const pageFlow = new Array(length);
                        renderChildren.forEach(item => {
                            if (!item.positioned) {
                                if (item.pageFlow || item.autoPosition) {
                                    pageFlow[j++] = item;
                                }
                                else {
                                    const constraint = item.constraint;
                                    if (item.outerWrapper === node) {
                                        if (!constraint.horizontal) {
                                            item.anchorParent('horizontal', 0);
                                        }
                                        if (!constraint.vertical) {
                                            item.anchorParent('vertical', 0);
                                        }
                                    }
                                    else {
                                        if (item.leftTopAxis) {
                                            if (!constraint.horizontal) {
                                                setLeftTopAxis(item, node, true);
                                            }
                                            if (!constraint.vertical) {
                                                setLeftTopAxis(item, node, false);
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
                        });
                        if (j > 0) {
                            pageFlow.length = j;
                            if (node.layoutHorizontal) {
                                this.processConstraintHorizontal(node, pageFlow);
                            }
                            else if (j > 1) {
                                this.processConstraintChain(node, pageFlow);
                            }
                            else {
                                const item = pageFlow[0];
                                const { horizontal, vertical } = item.constraint;
                                if (!horizontal) {
                                    setHorizontalAlignment(item);
                                }
                                if (!vertical) {
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
            const options = createViewAttribute();
            let valid = false;
            switch (containerType) {
                case CONTAINER_NODE.LINEAR:
                    options.android.orientation = hasBit(layout.alignmentType, 16 /* VERTICAL */) ? 'vertical' : 'horizontal';
                    valid = true;
                    break;
                case CONTAINER_NODE.GRID: {
                    const { columnCount, rowCount } = layout;
                    const android = options.android;
                    if (rowCount > 0) {
                        android.rowCount = rowCount.toString();
                    }
                    android.columnCount = columnCount > 0 ? columnCount.toString() : '1';
                    valid = true;
                    break;
                }
                case CONTAINER_NODE.FRAME:
                case CONTAINER_NODE.RELATIVE:
                case CONTAINER_NODE.CONSTRAINT:
                    valid = true;
                    break;
                default:
                    if (layout.isEmpty) {
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
            let { parent, containerType } = layout;
            const node = layout.node;
            const dataset = node.dataset;
            let target = !dataset.use && dataset.target;
            let controlName = View.getControlName(containerType, node.api);
            switch (node.tagName) {
                case 'IMG': {
                    const application = this.application;
                    const element = node.element;
                    const absoluteParent = node.absoluteParent || node.documentParent;
                    let width = node.toFloat('width', 0);
                    let height = node.toFloat('height', 0);
                    let percentWidth = node.percentWidth > 0 ? width : -1;
                    const percentHeight = node.percentHeight > 0 ? height : -1;
                    let scaleType = 'fitXY';
                    let imageSet;
                    if (isString$3(element.srcset) || ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.tagName) === 'PICTURE') {
                        const mimeType = this.localSettings.mimeType.image;
                        imageSet = getSrcSet$1(element, mimeType === '*' ? undefined : mimeType);
                        if (imageSet.length) {
                            const image = imageSet[0];
                            const actualWidth = image.actualWidth;
                            if (actualWidth) {
                                if (percentWidth === -1) {
                                    [width, height] = setImageDimension(node, actualWidth, height, application.resourceHandler.getImage(element.src));
                                }
                                else {
                                    width = node.bounds.width;
                                    percentWidth = -1;
                                }
                            }
                            else {
                                const stored = application.resourceHandler.getImage(image.src);
                                if (stored) {
                                    if (percentWidth === -1) {
                                        [width, height] = setImageDimension(node, stored.width, height, stored);
                                    }
                                    else {
                                        width = node.bounds.width;
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
                        const box = absoluteParent.box;
                        if (percentWidth >= 0) {
                            width *= box.width / 100;
                            if (percentWidth < 100 && !parent.layoutConstraint) {
                                node.css('width', formatPX$1(width));
                            }
                        }
                        if (percentHeight >= 0) {
                            height *= box.height / 100;
                            if (percentHeight < 100 && !(parent.layoutConstraint && absoluteParent.hasHeight)) {
                                node.css('height', formatPX$1(height));
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
                    }
                    node.android('scaleType', scaleType);
                    if (width > 0 && parent.hasPX('maxWidth', false) && (percentWidth === -1 || percentWidth === 100)) {
                        const parentWidth = parent.parseWidth(parent.css('maxWidth'));
                        if (parentWidth <= width) {
                            width = parentWidth;
                            node.css('width', formatPX$1(width));
                        }
                    }
                    else if (height > 0 && parent.hasPX('maxHeight', false) && (percentHeight === -1 || percentHeight === 100)) {
                        const parentHeight = parent.parseHeight(parent.css('maxHeight'));
                        if (parentHeight <= height) {
                            height = parentHeight;
                            node.css('maxHeight', formatPX$1(height));
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
                        const src = application.resourceHandler.addImageSrc(element, '', imageSet);
                        if (src !== '') {
                            node.android('src', `@drawable/${src}`);
                        }
                    }
                    if (!node.pageFlow && parent === absoluteParent && (node.left < 0 && parent.css('overflowX') === 'hidden' || node.top < 0 && parent.css('overflowY') === 'hidden')) {
                        const box = absoluteParent.box;
                        const container = application.createNode({ parent, replace: node });
                        container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                        container.inherit(node, 'base');
                        container.cssCopy(node, 'position', 'zIndex');
                        container.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE$1.ALL });
                        container.autoPosition = false;
                        if (width > 0) {
                            container.setLayoutWidth(width < box.width ? formatPX$1(width) : 'match_parent');
                        }
                        else {
                            container.setLayoutWidth('wrap_content');
                        }
                        if (height > 0) {
                            container.setLayoutHeight(height < box.height ? formatPX$1(height) : 'match_parent');
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
                        case 'image':
                        case 'color':
                            if (node.width === 0) {
                                node.css('width', formatPX$1(node.bounds.width));
                            }
                            break;
                    }
                    break;
                }
                case 'BUTTON':
                    node.naturalChildren.forEach((item) => {
                        if (!item.pageFlow || !item.textElement) {
                            item.android('elevation', '2px');
                        }
                    });
                    break;
                case 'TEXTAREA': {
                    const { cols, maxLength, placeholder, rows } = node.element;
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
                    if (!node.hasPX('width') && cols > 0) {
                        node.css('width', formatPX$1(cols * 8));
                    }
                    node.android('hint', placeholder);
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
                case 'AUDIO':
                case 'VIDEO': {
                    const videoMimeType = this.localSettings.mimeType.video;
                    const element = node.element;
                    let src = element.src;
                    let mimeType;
                    if (hasMimeType$1(videoMimeType, src)) {
                        mimeType = parseMimeType(src);
                    }
                    else {
                        src = '';
                        iterateArray(element.children, (source) => {
                            if (source.tagName === 'SOURCE') {
                                if (hasMimeType$1(videoMimeType, source.src)) {
                                    src = source.src;
                                    mimeType = parseMimeType(src);
                                    return true;
                                }
                                else {
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
                    if (isString$3(src)) {
                        this.application.resourceHandler.addVideo(src, mimeType);
                        node.inlineText = false;
                        node.exclude({ resource: NODE_RESOURCE.FONT_STYLE });
                    }
                    else if (isString$3(element.poster)) {
                        node.setCacheValue('tagName', 'IMG');
                        src = element.src;
                        element.src = element.poster;
                        layout.containerType = CONTAINER_NODE.IMAGE;
                        const template = this.renderNode(layout);
                        element.src = src;
                        return template;
                    }
                    else {
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
                                node.android('shadowColor', `@color/${color}`);
                                node.android('shadowDx', truncate$2(node.parseWidth(match[2]) * 2, precision));
                                node.android('shadowDy', truncate$2(node.parseHeight(match[3]) * 2, precision));
                                node.android('shadowRadius', truncate$2(isString$3(match[4]) ? Math.max(node.parseWidth(match[4]), 0) : 0.01, precision));
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
                        [node.previousSibling, node.nextSibling].some((sibling) => {
                            if ((sibling === null || sibling === void 0 ? void 0 : sibling.visible) && sibling.pageFlow) {
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
            node.setControlType(controlName, containerType);
            node.addAlign(layout.alignmentType);
            node.render(target ? this.application.resolveTarget(target) : parent);
            return {
                type: 1 /* XML */,
                node,
                parent,
                controlName
            };
        }
        renderNodeStatic(attrs, options) {
            const { controlType, width, height, content } = attrs;
            let controlName = attrs.controlName;
            if (!isString$3(controlName)) {
                if (controlType) {
                    controlName = View.getControlName(controlType, this.userSettings.targetAPI);
                }
                else {
                    return '';
                }
            }
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
            const output = this.renderNodeStatic({ controlName: CONTAINER_ANDROID.SPACE, width, height }, optionsA);
            options.documentId = optionsA.documentId;
            return output;
        }
        addGuideline(node, parent, options = {}) {
            const { percent, opposing, orientation } = options;
            let documentParent = node.documentParent;
            if (parent.nodeGroup && !documentParent.hasAlign(4 /* AUTO_LAYOUT */)) {
                documentParent = parent;
            }
            const box = documentParent.box;
            const linear = node.linear;
            const applyLayout = (value, horizontal) => {
                var _a, _b;
                if (node.constraint[value] || orientation && value !== orientation) {
                    return;
                }
                let LT;
                let RB;
                if (horizontal) {
                    if (!opposing) {
                        LT = 'left';
                        RB = 'right';
                    }
                    else {
                        LT = 'right';
                        RB = 'left';
                    }
                }
                else {
                    if (!opposing) {
                        LT = 'top';
                        RB = 'bottom';
                    }
                    else {
                        LT = 'bottom';
                        RB = 'top';
                    }
                }
                if (!percent && !opposing) {
                    if (withinRange(linear[LT], box[LT])) {
                        node.anchor(LT, 'parent', true);
                        return;
                    }
                    if (node.autoPosition) {
                        const siblingsLeading = node.siblingsLeading;
                        const length = siblingsLeading.length;
                        if (length && !node.alignedVertically()) {
                            const previousSibling = siblingsLeading[length - 1];
                            if (previousSibling.pageFlow && previousSibling.renderParent === node.renderParent) {
                                node.anchor(horizontal ? 'leftRight' : 'top', previousSibling.documentId, true);
                                node.constraint[value] = true;
                                return;
                            }
                        }
                    }
                    if (!node.pageFlow && node.css('position') !== 'fixed' && !parent.hasAlign(4 /* AUTO_LAYOUT */)) {
                        const bounds = node.innerMostWrapped.bounds;
                        const renderChildren = parent.renderChildren;
                        const length = renderChildren.length;
                        let i = 0;
                        while (i < length) {
                            const item = renderChildren[i++];
                            if (item === node || item.plainText || item.pseudoElement || item.originalRoot) {
                                continue;
                            }
                            const itemA = item.innerMostWrapped;
                            if (itemA.pageFlow || item.constraint[value]) {
                                const { linear: linearA, bounds: boundsA } = itemA;
                                let position;
                                let offset = NaN;
                                if (withinRange(bounds[LT], boundsA[LT])) {
                                    position = LT;
                                }
                                else if (withinRange(linear[LT], linearA[LT])) {
                                    position = LT;
                                    offset = (horizontal ? bounds.left - boundsA.left : bounds.top - boundsA.top) + adjustBodyMargin(node, LT);
                                }
                                else if (withinRange(linear[LT], linearA[RB])) {
                                    if (horizontal) {
                                        if (!node.hasPX('left') && !node.hasPX('right') || !item.inlineStatic && item.hasPX('width', false, true)) {
                                            position = 'leftRight';
                                            offset = bounds.left - boundsA.right;
                                        }
                                        else {
                                            continue;
                                        }
                                    }
                                    else if (!node.hasPX('top') && !node.hasPX('bottom') || !item.inlineStatic && item.hasPX('height', false, true)) {
                                        position = 'topBottom';
                                        offset = bounds.top - boundsA.bottom;
                                    }
                                    else {
                                        continue;
                                    }
                                }
                                else {
                                    continue;
                                }
                                if (horizontal) {
                                    if (!isNaN(offset)) {
                                        node.setBox(16 /* MARGIN_LEFT */, { reset: 1, adjustment: 0 });
                                        if (offset !== 0) {
                                            node.translateX(offset);
                                        }
                                    }
                                }
                                else if (!isNaN(offset)) {
                                    node.setBox(2 /* MARGIN_TOP */, { reset: 1, adjustment: 0 });
                                    if (offset !== 0) {
                                        node.translateY(offset);
                                    }
                                }
                                node.anchor(position, item.documentId, true);
                                node.constraint[value] = true;
                                return;
                            }
                        }
                        const TL = horizontal ? 'top' : 'left';
                        let nearest;
                        let adjacent;
                        const setMarginOffset = (documentId, position, adjustment) => {
                            node.anchor(position, documentId, true);
                            node.setBox(horizontal ? 16 /* MARGIN_LEFT */ : 2 /* MARGIN_TOP */, { reset: 1, adjustment });
                            node.constraint[value] = true;
                        };
                        i = 0;
                        while (i < length) {
                            const item = renderChildren[i++];
                            if (item === node || item.pageFlow || item.originalRoot || !item.constraint[value]) {
                                continue;
                            }
                            const itemA = item.innerMostWrapped;
                            const boundsA = itemA.bounds;
                            if (withinRange(bounds[TL], boundsA[TL]) || withinRange(linear[TL], itemA.linear[TL])) {
                                const offset = bounds[LT] - boundsA[RB];
                                if (offset >= 0) {
                                    setMarginOffset(item.documentId, horizontal ? 'leftRight' : 'topBottom', offset);
                                    return;
                                }
                            }
                            else if (boundsA[LT] <= bounds[LT]) {
                                if (boundsA[TL] <= bounds[TL]) {
                                    nearest = itemA;
                                }
                                else {
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
                                setMarginOffset(nearest.documentId, LT, offset);
                                return;
                            }
                        }
                    }
                }
                const absoluteParent = node.absoluteParent;
                const bounds = node.positionStatic ? node.bounds : linear;
                let attr = 'layout_constraintGuide_';
                let location = 0;
                if (!node.leftTopAxis && documentParent.originalRoot) {
                    const renderParent = node.renderParent;
                    if (documentParent.ascend({ condition: item => item === renderParent, attr: 'renderParent' }).length) {
                        if (horizontal) {
                            location = !opposing ? documentParent.marginLeft : documentParent.marginRight;
                        }
                        else {
                            location = !opposing ? documentParent.marginTop : documentParent.marginBottom;
                        }
                    }
                }
                if (percent) {
                    const position = Math.abs(bounds[LT] - box[LT]) / (horizontal ? box.width : box.height);
                    location += parseFloat(truncate$2(!opposing ? position : 1 - position, node.localSettings.floatPrecision));
                    attr += 'percent';
                }
                else {
                    location += bounds[LT] - box[!opposing ? LT : RB];
                    attr += 'begin';
                }
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
                    node.setBox(2 /* MARGIN_TOP */, { reset: 1 });
                }
                node.constraint[value] = true;
                if (location <= 0) {
                    node.anchor(LT, 'parent', true);
                }
                else if (horizontal && location + bounds.width >= box.right && documentParent.hasPX('width') && !node.hasPX('right') || !horizontal && location + bounds.height >= box.bottom && documentParent.hasPX('height') && !node.hasPX('bottom')) {
                    node.anchor(RB, 'parent', true);
                }
                else {
                    const guideline = parent.constraint.guideline || {};
                    const anchors = (_b = (_a = guideline[value]) === null || _a === void 0 ? void 0 : _a[attr]) === null || _b === void 0 ? void 0 : _b[LT];
                    if (anchors) {
                        for (const id in anchors) {
                            if (parseInt(anchors[id]) === location) {
                                node.anchor(LT, id, true);
                                node.anchorDelete(RB);
                                return;
                            }
                        }
                    }
                    const templateOptions = createViewAttribute(undefined, {
                        android: {
                            orientation: horizontal ? 'vertical' : 'horizontal'
                        },
                        app: {
                            [attr]: percent ? location.toString() : '@dimen/' + Resource.insertStoredAsset('dimens', `constraint_guideline_${!opposing ? LT : RB}`, formatPX$1(location))
                        }
                    });
                    this.addAfterOutsideTemplate(node.id, this.renderNodeStatic({ controlName: node.api < 29 /* Q */ ? CONTAINER_ANDROID.GUIDELINE : CONTAINER_ANDROID_X.GUIDELINE }, templateOptions), false);
                    const documentId = templateOptions.documentId;
                    if (documentId) {
                        node.anchor(LT, documentId, true);
                        node.anchorDelete(RB);
                        if (location > 0) {
                            assignEmptyValue(guideline, value, attr, LT, documentId, location.toString());
                            parent.constraint.guideline = guideline;
                        }
                    }
                }
            };
            applyLayout('horizontal', true);
            applyLayout('vertical', false);
        }
        addBarrier(nodes, barrierDirection) {
            const unbound = [];
            nodes.forEach(node => {
                const barrier = node.constraint.barrier;
                if (!barrier) {
                    node.constraint.barrier = {};
                }
                else if (barrier[barrierDirection]) {
                    return;
                }
                unbound.push(node);
            });
            if (unbound.length) {
                const options = createViewAttribute(undefined, {
                    android: {},
                    app: {
                        barrierDirection,
                        constraint_referenced_ids: objectMap(unbound, item => getDocumentId(item.anchorTarget.documentId)).join(',')
                    }
                });
                const { api, anchorTarget } = unbound[unbound.length - 1];
                const content = this.renderNodeStatic({ controlName: api < 29 /* Q */ ? CONTAINER_ANDROID.BARRIER : CONTAINER_ANDROID_X.BARRIER }, options);
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
                    unbound.forEach(node => node.constraint.barrier[barrierDirection] = documentId);
                    return documentId;
                }
            }
            return '';
        }
        evaluateAnchors(nodes) {
            const horizontalAligned = [];
            const verticalAligned = [];
            const length = nodes.length;
            let i = 0;
            while (i < length) {
                const node = nodes[i++];
                const { horizontal, vertical } = node.constraint;
                if (horizontal) {
                    horizontalAligned.push(node);
                }
                if (vertical) {
                    verticalAligned.push(node);
                }
                if (node.alignParent('top') || node.alignSibling('top')) {
                    let current = node;
                    do {
                        const bottomTop = current.alignSibling('bottomTop');
                        if (bottomTop !== '') {
                            const next = nodes.find(item => item.documentId === bottomTop);
                            if ((next === null || next === void 0 ? void 0 : next.alignSibling('topBottom')) === current.documentId) {
                                if (next.alignParent('bottom')) {
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
                            if (current !== node && !current.alignParent('bottom')) {
                                if (current.blockHeight) {
                                    current.anchor('bottom', 'parent');
                                }
                                else {
                                    const barrier = current.constraint.barrier;
                                    const documentId = !barrier || !isString$3(barrier.bottom) ? this.addBarrier([current], 'bottom') : barrier.bottom;
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
        createNodeGroup(node, children, options = {}) {
            const { parent, delegate, cascade } = options;
            const group = new ViewGroup(this.cache.nextId, node, children, this.afterInsertNode);
            if (parent) {
                parent.appendTry(node, group);
                group.init();
            }
            else {
                group.containerIndex = node.containerIndex;
            }
            this.cache.append(group, delegate === true, cascade === true);
            return group;
        }
        createNodeWrapper(node, parent, options = {}) {
            const { children, containerType, alignmentType, resource, procedure, section } = options;
            const container = this.application.createNode({ parent, children, append: true, replace: node, delegate: true, cascade: options.cascade === true || !!children && children.length > 0 && !node.originalRoot });
            container.inherit(node, 'base', 'alignment');
            if (node.documentRoot) {
                container.documentRoot = true;
                node.documentRoot = false;
            }
            if (container.actualParent === null && parent.naturalElement) {
                container.actualParent = parent;
            }
            if (containerType) {
                container.setControlType(View.getControlName(containerType, node.api), containerType);
            }
            if (alignmentType) {
                container.addAlign(alignmentType);
            }
            container.addAlign(16384 /* WRAPPER */);
            container.exclude({
                resource: resource === undefined ? NODE_RESOURCE.BOX_STYLE | NODE_RESOURCE.ASSET : resource,
                procedure: procedure === undefined ? NODE_PROCEDURE$1.CUSTOMIZATION : procedure,
                section: section === undefined ? APP_SECTION.ALL : section
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
                borderRadius: '0px'
            });
            if (options.inheritContentBox !== false) {
                container.setCacheValue('contentBoxWidth', node.contentBoxWidth);
                container.setCacheValue('contentBoxHeight', node.contentBoxHeight);
            }
            if (options.resetMargin) {
                node.resetBox(30 /* MARGIN */, container);
            }
            if (options.inheritDataset && node.naturalElement) {
                const dataset = container.dataset;
                Object.assign(dataset, node.dataset);
                delete dataset.use;
            }
            if (node.renderParent && node.removeTry()) {
                node.rendered = false;
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
            return container;
        }
        processRelativeHorizontal(node, children) {
            const rowsLeft = [];
            let rowsRight;
            let autoPosition = false;
            let alignmentMultiLine = false;
            if (node.hasAlign(16 /* VERTICAL */)) {
                let previous;
                children.forEach(item => {
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
                        autoPosition = true;
                    }
                });
            }
            else {
                const boxParent = node.nodeGroup ? node.documentParent : node;
                const boxWidth = boxParent.actualBoxWidth((() => {
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
                                    let offsetLeft = 0;
                                    let offsetRight = 0;
                                    parent.naturalChildren.forEach((item) => {
                                        const linear = item.linear;
                                        if (item.floating && !children.includes(item) && node.intersectY(linear)) {
                                            if (item.float === 'left') {
                                                if (Math.floor(linear.right) > left) {
                                                    offsetLeft = Math.max(offsetLeft, linear.right - left);
                                                }
                                            }
                                            else if (right > Math.ceil(linear.left)) {
                                                offsetRight = Math.max(offsetRight, right - linear.left);
                                            }
                                        }
                                    });
                                    return width - offsetLeft - offsetRight;
                                }
                            }
                        }
                    }
                    return boxParent.box.width;
                })());
                const clearMap = this.application.clearMap;
                const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
                let rowWidth = 0;
                let previousRowLeft;
                let textIndentSpacing = false;
                let textIndent = 0;
                if (node.naturalElement) {
                    if (node.blockDimension) {
                        textIndent = node.parseUnit(node.css('textIndent'));
                    }
                }
                else {
                    const parent = node.actualParent;
                    if ((parent === null || parent === void 0 ? void 0 : parent.blockDimension) && parent.has('textIndent')) {
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
                segmentRightAligned(children).forEach((seg, index) => {
                    const length = seg.length;
                    if (length === 0) {
                        return;
                    }
                    const leftAlign = index === 1;
                    let leftForward = true;
                    let alignParent;
                    let rows;
                    if (leftAlign) {
                        if ((!node.naturalElement && seg[0].actualParent || node).cssInitialAny('textAlign', 'right', 'end')) {
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
                    for (let i = 0; i < length; ++i) {
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
                            autoPosition = true;
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
                        let anchored = item.autoMargin.horizontal === true;
                        if (anchored) {
                            if (item.autoMargin.leftRight) {
                                item.anchorParent('horizontal');
                            }
                            else {
                                item.anchor(item.autoMargin.left ? 'right' : 'left', 'true');
                            }
                        }
                        if (previous) {
                            let maxWidth = 0;
                            let baseWidth = 0;
                            let retainMultiline = false;
                            const checkFloatWrap = () => {
                                if (previous.floating && previous.alignParent(previous.float) && (multiline || Math.floor(rowWidth + item.actualWidth) < boxWidth)) {
                                    return true;
                                }
                                else if (node.floating && i === length - 1 && item.textElement && !/[\s-]/.test(item.textContent.trim())) {
                                    const width = node.css('width');
                                    if (isLength$1(width) && node.parseWidth(width) > node.parseWidth(node.css('minWidth'))) {
                                        node.cssApply({ width: 'auto', minWidth: width });
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
                                if (!previousRowLeft || !item.plainText || multiline || !items.includes(previousRowLeft) || clearMap.has(item)) {
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
                                    if (i === 1 && item.plainText && item.previousSibling === previous && !CHAR$1.TRAILINGSPACE.test(previous.textContent) && !CHAR$1.LEADINGSPACE.test(item.textContent)) {
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
                                    if (checkWrapWidth() && Math.floor(baseWidth) > maxWidth) {
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
                            const cleared = clearMap.has(item);
                            if (textNewRow ||
                                item.nodeGroup && !item.hasAlign(128 /* SEGMENTED */) ||
                                Math.ceil(item.bounds.top) >= previous.bounds.bottom && (item.blockStatic || item.floating && previous.float === item.float) ||
                                !item.textElement && !checkFloatWrap() && checkWrapWidth() && Math.floor(baseWidth) > maxWidth ||
                                !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.excluded && sibling.blockStatic) || (siblings === null || siblings === void 0 ? void 0 : siblings.some(element => causesLineBreak(element)))) ||
                                cleared ||
                                previous.autoMargin.horizontal ||
                                Resource.checkPreIndent(previous)) {
                                if (cleared && !previousRowLeft) {
                                    item.setBox(2 /* MARGIN_TOP */, { reset: 1 });
                                }
                                if (leftForward) {
                                    if (previousRowLeft && (item.bounds.bottom <= previousRowLeft.bounds.bottom || textIndentSpacing)) {
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
                                rowWidth = Math.min(0, textNewRow && !previous.multiline && multiline && !cleared ? item.linear.right - node.box.right : 0);
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
                                if (item.linear.bottom > previousRowLeft.linear.bottom) {
                                    previousRowLeft = item;
                                }
                            }
                            else {
                                previousRowLeft = item;
                            }
                        }
                        if ((siblings === null || siblings === void 0 ? void 0 : siblings.some(element => !!getElementAsNode(element, item.sessionId) || causesLineBreak(element))) === false) {
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
                });
                if (textIndent < 0 && rowsLeft.length === 1) {
                    node.setCacheValue('paddingLeft', Math.max(0, node.paddingLeft + textIndent));
                }
            }
            if (rowsLeft.length > 1 || rowsRight && rowsRight.length > 1) {
                alignmentMultiLine = true;
            }
            const applyLayout = (rows) => {
                let previousBaseline = null;
                const length = rows.length;
                const singleRow = length === 1 && !node.hasHeight;
                for (let i = 0; i < length; ++i) {
                    const items = rows[i];
                    let baseline;
                    const q = items.length;
                    if (q > 1) {
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
                        let documentId = i === 0 ? 'true' : baseline === null || baseline === void 0 ? void 0 : baseline.documentId;
                        let maxCenterHeight = 0;
                        let textBaseline = null;
                        let j = 0;
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
                                }
                                else {
                                    item.anchor('top', 'true');
                                    adjustment -= node.box.top;
                                }
                                item.setBox(2 /* MARGIN_TOP */, { reset: 1, adjustment });
                                item.baselineAltered = true;
                                continue;
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
                            else {
                                switch (verticalAlign) {
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
                                        if (documentId && documentId !== item.documentId) {
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
                                                item.setBox(2 /* MARGIN_TOP */, { reset: 1, adjustment: Math.round((heightParent - height) / 2) });
                                                item.baselineAltered = true;
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
                                        if (documentId && !withinRange(node.bounds.height, item.bounds.height)) {
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
                            if (i === 0 && alignTop) {
                                item.anchor('top', 'true');
                            }
                        }
                        const r = baselineAlign.length;
                        if (baseline) {
                            baseline.baselineActive = true;
                            if (r) {
                                adjustBaseline(baseline, baselineAlign, singleRow, node.box.top);
                                if (singleRow && baseline.is(CONTAINER_NODE.BUTTON)) {
                                    baseline.anchor('centerVertical', 'true');
                                    baseline = null;
                                }
                            }
                            else if (baseline.textElement) {
                                if (maxCenterHeight > Math.max(baseline.actualHeight, baseline.lineHeight)) {
                                    baseline.anchor('centerVertical', 'true');
                                    baseline = null;
                                }
                                else if (baseline.multiline) {
                                    const { left, height } = baseline.bounds;
                                    let k = 0;
                                    while (k < q) {
                                        const item = items[k++];
                                        if (item === baseline) {
                                            break;
                                        }
                                        else if (left < item.bounds.right && height < item.bounds.height) {
                                            baseline.anchor('bottom', item.documentId);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else if (r > 0 && r < q) {
                            textBottom = getTextBottom(items)[0];
                            if (textBottom) {
                                let k = 0;
                                while (k < r) {
                                    const item = baselineAlign[k++];
                                    if (item.baseline && !item.multiline && textBottom.bounds.height > item.bounds.height) {
                                        item.anchor('bottom', textBottom.documentId);
                                    }
                                }
                            }
                        }
                        let last = true;
                        let k = q - 1;
                        while (k >= 0) {
                            const previous = items[k--];
                            if (previous.textElement) {
                                previous.setSingleLine(last && !previous.rightAligned && !previous.centerAligned);
                                last = false;
                            }
                        }
                        if (node.cssInitial('textAlign') === 'center' && length > 1) {
                            const application = this.application;
                            const group = this.createNodeGroup(items[0], items, { parent: node });
                            group.setControlType(CONTAINER_ANDROID.RELATIVE, CONTAINER_NODE.RELATIVE);
                            group.render(node);
                            group.anchorParent('horizontal');
                            group.setLayoutWidth('wrap_content');
                            group.setLayoutHeight('wrap_content');
                            let renderIndex = -1;
                            items.forEach(item => {
                                const index = children.indexOf(item);
                                if (index !== -1) {
                                    if (renderIndex === -1) {
                                        renderIndex = index;
                                    }
                                    else {
                                        renderIndex = Math.min(index, renderIndex);
                                    }
                                }
                                item.removeTry();
                                item.render(group);
                                application.addLayoutTemplate(group, item, {
                                    type: 1 /* XML */,
                                    node: item,
                                    controlName: item.controlName
                                });
                            });
                            application.addLayoutTemplate(node, group, {
                                type: 1 /* XML */,
                                node: group,
                                controlName: group.controlName
                            }, renderIndex);
                            if (previousBaseline) {
                                group.anchor('topBottom', previousBaseline.documentId);
                            }
                            else {
                                previousBaseline = group;
                            }
                            continue;
                        }
                    }
                    else {
                        baseline = items[0];
                        if (baseline.centerAligned) {
                            baseline.anchorParent('horizontal');
                            baseline.anchorDelete('left', 'right');
                        }
                    }
                    let requireBottom = false;
                    if (baseline === null) {
                        baseline = items[0];
                        requireBottom = true;
                    }
                    let j = 0;
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
                const renderChildren = node.renderChildren;
                const renderTemplates = node.renderTemplates;
                const templates = [];
                for (let i = 0; i < renderChildren.length; ++i) {
                    if (!renderChildren[i].pageFlow) {
                        templates.push(renderTemplates[i]);
                        renderChildren.splice(i, 1);
                        renderTemplates.splice(i--, 1);
                    }
                }
                templates.forEach(item => {
                    renderChildren.push(item.node);
                    renderTemplates.push(item);
                });
            }
        }
        processConstraintHorizontal(node, children) {
            const reverse = node.hasAlign(2048 /* RIGHT */);
            const { anchorStart, anchorEnd, chainStart, chainEnd } = getAnchorDirection(reverse);
            let bias = 0;
            let valid = true;
            let tallest;
            let bottom;
            let previous;
            let textBaseline = null;
            let baselineCount = 0;
            const setAlignTop = (item) => {
                item.anchorParent('vertical', 0);
                item.setBox(2 /* MARGIN_TOP */, { reset: 1, adjustment: Math.max(item.bounds.top - node.box.top, Math.min(convertFloat$1(item.verticalAlign) * -1, 0)) });
                item.baselineAltered = true;
                valid = false;
            };
            if (!reverse) {
                switch (node.cssAscend('textAlign', true)) {
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
                            [floating, children] = partitionArray(children, item => item.floating || item.autoMargin.horizontal === true);
                            if (floating.length) {
                                this.processConstraintChain(node, floating);
                            }
                            break;
                        }
                        case 1: {
                            let leftAligned;
                            [leftAligned, children] = segmentLeftAligned(children);
                            if (leftAligned.length) {
                                this.processConstraintChain(node, leftAligned);
                            }
                            break;
                        }
                        default: {
                            let rightAligned;
                            [rightAligned, children] = segmentRightAligned(children);
                            if (rightAligned.length) {
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
            const textBottom = getTextBottom(children)[0];
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
                    }
                    else if (item.autoPosition) {
                        item.anchor(chainStart, previous.documentId);
                    }
                }
                else if (length === 1) {
                    bias = item.centerAligned ? 0.5 : (item.rightAligned ? 1 : 0);
                    if (item.blockStatic || bias === 0.5) {
                        item.anchorParent('horizontal', bias);
                    }
                    else {
                        item.anchor(anchorStart, 'parent');
                        item.anchorStyle('horizontal', 0);
                    }
                }
                else {
                    item.anchor(anchorStart, 'parent');
                    item.anchorStyle('horizontal', bias, 'packed');
                }
                if (item.pageFlow) {
                    if (item !== baseline) {
                        if (item.controlElement) {
                            setAlignTop(item);
                        }
                        else if (item.inlineVertical) {
                            if (!tallest || getMaxHeight(item) > getMaxHeight(tallest)) {
                                tallest = item;
                            }
                            switch (item.css('verticalAlign')) {
                                case 'text-top':
                                    if (textBaseline === null) {
                                        textBaseline = NodeUI.baseline(children, true);
                                    }
                                    if (textBaseline && item !== textBaseline) {
                                        item.anchor('top', textBaseline.documentId);
                                    }
                                    else {
                                        setAlignTop(item);
                                    }
                                    break;
                                case 'middle':
                                    if ((baseline === null || baseline === void 0 ? void 0 : baseline.textElement) === false || textBottom) {
                                        setAlignTop(item);
                                    }
                                    else {
                                        item.anchorParent('vertical', 0.5);
                                    }
                                    break;
                                case 'text-bottom':
                                    if (textBaseline === null) {
                                        textBaseline = NodeUI.baseline(children, true);
                                    }
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
                                    if (!bottom) {
                                        children.forEach(child => {
                                            if (!child.baseline && (!bottom || child.linear.bottom > bottom.linear.bottom)) {
                                                bottom = child;
                                            }
                                        });
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
                                        item.anchor('baseline', documentId || 'parent');
                                        baselineCount++;
                                    }
                                    break;
                                default:
                                    setAlignTop(item);
                                    break;
                            }
                        }
                        else if (item.plainText) {
                            item.anchor('baseline', documentId || 'parent');
                            baselineCount++;
                        }
                        else {
                            setAlignTop(item);
                        }
                        item.anchored = true;
                    }
                    percentWidth = View.setConstraintDimension(item, percentWidth);
                    previous = item;
                }
                else if (item.autoPosition) {
                    if (documentId) {
                        item.anchor('top', documentId);
                    }
                    else {
                        item.anchorParent('vertical', 0);
                        item.anchored = true;
                        valid = false;
                    }
                }
            }
            if (baseline) {
                if (tallest && tallest !== baseline && baseline.textElement && getMaxHeight(tallest) > getMaxHeight(baseline)) {
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
                            setAlignTop(baseline);
                            break;
                    }
                }
                else if (valid && baseline.baselineElement && !baseline.imageOrSvgElement && node.ascend({ condition: (item) => item.layoutHorizontal, error: (item) => item.naturalChild && item.layoutVertical || item.layoutGrid, attr: 'renderParent' }).length) {
                    baseline.anchorParent('vertical');
                    baseline.anchor('baseline', 'parent');
                }
                else {
                    setAlignTop(baseline);
                }
                baseline.baselineActive = baselineCount > 0;
                baseline.anchored = true;
            }
        }
        processConstraintChain(node, children) {
            const clearMap = this.application.clearMap;
            const floating = node.hasAlign(512 /* FLOAT */);
            const parent = children[0].actualParent || node;
            const horizontal = NodeUI.partitionRows(children, clearMap);
            const length = horizontal.length;
            if (!node.hasWidth && children.some(item => item.percentWidth > 0)) {
                node.setLayoutWidth('match_parent', false);
            }
            let previousSiblings = [];
            let previousRow;
            for (let i = 0; i < length; ++i) {
                const partition = horizontal[i];
                const [floatingRight, floatingLeft] = partitionArray(partition, item => item.float === 'right' || item.autoMargin.left === true);
                let aboveRowEnd;
                let currentRowTop;
                let tallest;
                let alignParent = false;
                const applyLayout = (seg, reverse) => {
                    const q = seg.length;
                    if (q === 0) {
                        return;
                    }
                    const { anchorStart, anchorEnd, chainStart, chainEnd } = getAnchorDirection(reverse);
                    const rowStart = seg[0];
                    const rowEnd = seg[q - 1];
                    if (q > 1) {
                        rowStart.anchor(anchorStart, 'parent');
                        if (reverse) {
                            rowEnd.anchorStyle('horizontal', 1, 'packed');
                        }
                        else {
                            rowStart.anchorStyle('horizontal', !floating && parent.css('textAlign') === 'center' ? 0.5 : 0, 'packed');
                        }
                        rowEnd.anchor(anchorEnd, 'parent');
                    }
                    else {
                        setHorizontalAlignment(rowStart);
                    }
                    let percentWidth = View.availablePercent(partition, 'width', node.box.width);
                    alignParent = i === 1 && !rowStart.floating && (previousRow === null || previousRow === void 0 ? void 0 : previousRow.every(item => item.floating)) === true && (clearMap.size === 0 || !partition.some((item) => checkClearMap(item, clearMap))) || !rowStart.pageFlow && (!rowStart.autoPosition || q === 1);
                    tallest = undefined;
                    for (let j = 0; j < q; ++j) {
                        const chain = seg[j];
                        if (i === 0 || alignParent) {
                            if (length === 1) {
                                chain.anchorParent('vertical');
                                setVerticalAlignment(chain, q === 1, true);
                            }
                            else {
                                chain.anchor('top', 'parent');
                                chain.anchorStyle('vertical', 0, 'packed');
                            }
                        }
                        else if (i === length - 1 && !currentRowTop) {
                            chain.anchor('bottom', 'parent');
                        }
                        if (chain.autoMargin.leftRight) {
                            chain.anchorParent('horizontal');
                        }
                        else if (q > 1) {
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
                        percentWidth = View.setConstraintDimension(chain, percentWidth);
                        if (previousRow && j === 0) {
                            if (clearMap.has(chain) && !chain.floating) {
                                chain.modifyBox(2 /* MARGIN_TOP */, -previousRow[previousRow.length - 1].bounds.height, false);
                            }
                            if (floating) {
                                let checkBottom = false;
                                for (const item of previousSiblings) {
                                    if (chain.bounds.top < Math.floor(item.bounds.bottom)) {
                                        checkBottom = true;
                                        break;
                                    }
                                }
                                if (checkBottom) {
                                    aboveRowEnd = previousRow[previousRow.length - 1];
                                    let k = previousSiblings.length - 2;
                                    while (k >= 0) {
                                        const aboveBefore = previousSiblings[k--];
                                        if (aboveBefore.linear.bottom > aboveRowEnd.linear.bottom) {
                                            if (reverse && Math.ceil(aboveBefore.linear[anchorEnd]) - Math.floor(parent.box[anchorEnd]) < chain.linear.width) {
                                                continue;
                                            }
                                            chain.anchorDelete(anchorStart);
                                            chain.anchor(chainStart, aboveBefore.documentId, true);
                                            if (reverse) {
                                                chain.modifyBox(4 /* MARGIN_RIGHT */, aboveBefore.marginLeft);
                                            }
                                            else {
                                                chain.modifyBox(16 /* MARGIN_LEFT */, aboveBefore.marginRight);
                                            }
                                            rowStart.delete('app', 'layout_constraintHorizontal_chainStyle', 'layout_constraintHorizontal_bias');
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
                        }
                        else {
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
                                    if (top < currentTop || top === currentTop && item.linear.height > currentRowTop.linear.height) {
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
                            partition.forEach(chain => {
                                if (chain !== currentRowTop) {
                                    setVerticalAlignment(chain, r === 1);
                                    chain.anchor('top', documentId);
                                    chain.modifyBox(2 /* MARGIN_TOP */, marginTop * -1);
                                }
                            });
                        }
                    }
                    previousRow = partition;
                }
            }
            node.horizontalRows = horizontal;
        }
        createLayoutGroup(layout) {
            return this.createNodeGroup(layout.node, layout.children, { parent: layout.parent });
        }
        get containerTypeHorizontal() {
            return {
                containerType: CONTAINER_NODE.RELATIVE,
                alignmentType: 8 /* HORIZONTAL */
            };
        }
        get containerTypeVertical() {
            return {
                containerType: CONTAINER_NODE.CONSTRAINT,
                alignmentType: 16 /* VERTICAL */
            };
        }
        get containerTypeVerticalMargin() {
            return {
                containerType: CONTAINER_NODE.FRAME,
                alignmentType: 256 /* COLUMN */
            };
        }
        get containerTypePercent() {
            return {
                containerType: CONTAINER_NODE.CONSTRAINT,
                alignmentType: 32768 /* PERCENT */
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
    const { fromLastIndexOf: fromLastIndexOf$2, objectMap: objectMap$1, parseMimeType: parseMimeType$1, trimEnd } = $lib$4.util;
    const { applyTemplate, replaceTab: replaceTab$1 } = $lib$4.xml;
    const ASSETS = Resource.ASSETS;
    const STORED$1 = Resource.STORED;
    const REGEX_FILENAME = /^(.+)\/(.+?\.\w+)$/;
    const REGEX_DRAWABLE_UNIT = /"(-?[\d.]+)px"/g;
    const REGEX_THEME_UNIT = />(-?[\d.]+)px</g;
    function getFileAssets(pathname, items) {
        const length = items.length;
        if (length) {
            const result = new Array(length / 3);
            for (let i = 0, j = 0; i < length; i += 3) {
                result[j++] = {
                    pathname: pathname + items[i + 1],
                    filename: items[i + 2],
                    content: items[i]
                };
            }
            return result;
        }
        return items;
    }
    function getImageAssets(pathname, items, convertExt, compress) {
        const length = items.length;
        if (length) {
            convertExt = convertExt.toLowerCase();
            let convertMimeType = parseMimeType$1(convertExt);
            if (!convertMimeType.startsWith('image/')) {
                convertMimeType = '';
            }
            if (!/^[a-z\d]/.test(convertExt)) {
                convertExt = '@' + convertExt;
            }
            const result = new Array(length / 3);
            for (let i = 0, j = 0; i < length; i += 3) {
                const filename = items[i + 2].split('?')[0].trim().toLowerCase();
                let mimeType;
                if (convertMimeType !== '') {
                    const fileMimeType = parseMimeType$1(filename);
                    if (fileMimeType.startsWith('image/') && fileMimeType !== convertMimeType) {
                        mimeType = convertExt + ':' + fileMimeType;
                    }
                }
                result[j++] = {
                    pathname: pathname + items[i + 1],
                    filename,
                    mimeType,
                    compress: compress && Resource.canCompressImage(filename) ? [{ format: 'png' }] : undefined,
                    uri: items[i]
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
                    uri: items[i]
                };
            }
            return result;
        }
        return items;
    }
    function getOutputDirectory(value) {
        value = value.trim();
        if (value.endsWith('\\')) {
            return trimEnd(value, '\\') + '/';
        }
        else if (!value.endsWith('/')) {
            return value + '/';
        }
        return value;
    }
    const createFileAsset = (pathname, filename, content) => ({ pathname, filename, content });
    const replaceDrawableLength = (value, format) => format === 'dp' ? value.replace(REGEX_DRAWABLE_UNIT, (match, ...capture) => '"' + convertLength(capture[0], false) + '"') : value;
    const replaceThemeLength = (value, format) => format === 'dp' ? value.replace(REGEX_THEME_UNIT, (match, ...capture) => '>' + convertLength(capture[0], false) + '<') : value;
    const caseInsensitive = (a, b) => a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1;
    class File extends squared.base.FileUI {
        copyToDisk(directory, options) {
            this.copying(Object.assign(Object.assign({}, options), { assets: this.getAssetsAll(options === null || options === void 0 ? void 0 : options.assets), directory }));
        }
        appendToArchive(pathname, options) {
            this.archiving(Object.assign(Object.assign({ filename: this.userSettings.outputArchiveName }, options), { assets: this.getAssetsAll(options === null || options === void 0 ? void 0 : options.assets), appendTo: pathname }));
        }
        saveToArchive(filename, options) {
            this.archiving(Object.assign(Object.assign({}, options), { assets: this.getAssetsAll(options === null || options === void 0 ? void 0 : options.assets), filename }));
        }
        resourceAllToXml(options = {}) {
            const { directory, filename } = options;
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
                rawAudio: this.resourceRawAudioToString()
            };
            for (const name in result) {
                if (result[name].length === 0) {
                    delete result[name];
                }
            }
            if (directory || filename) {
                const userSettings = this.userSettings;
                const outputDirectory = getOutputDirectory(userSettings.outputDirectory);
                let assets = [];
                for (const name in result) {
                    switch (name) {
                        case 'drawableImage':
                            assets = assets.concat(getImageAssets(outputDirectory, result[name], userSettings.convertImages, userSettings.compressImages));
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
                if (directory) {
                    this.copying(options);
                }
                if (filename) {
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
                        }
                        else {
                            fontName += '_' + fontStyle;
                            if (fontWeight !== '400') {
                                fontName += '_' + font[attr];
                            }
                        }
                        itemArray.push({
                            font: `@font/${fontName}`,
                            fontStyle,
                            fontWeight
                        });
                        const uri = (_a = resource.getFont(fontFamily, fontStyle, fontWeight)) === null || _a === void 0 ? void 0 : _a.srcUrl;
                        if (uri) {
                            this.addAsset({
                                pathname: outputDirectory + pathname,
                                filename: fontName + '.' + fromLastIndexOf$2(uri.split('?')[0], '.').toLowerCase(),
                                uri
                            });
                        }
                    }
                    let output = replaceTab$1(applyTemplate('font-family', FONTFAMILY_TMPL, [item]), insertSpaces);
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
                Array.from(STORED$1.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1).forEach(style => {
                    const styleArray = style.items;
                    if (Array.isArray(styleArray)) {
                        itemArray.push({
                            name: style.name,
                            parent: style.parent,
                            item: objectMap$1(styleArray.sort((a, b) => a.key >= b.key ? 1 : -1), obj => ({ name: obj.key, innerText: obj.value }))
                        });
                    }
                });
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
                    result.push(replaceTab$1(replaceDrawableLength(value, convertPixels), insertSpaces), directory, `${name}.xml`);
                }
                return this.checkFileAssets(result, options);
            }
            return [];
        }
        resourceAnimToXml(options = {}) {
            if (STORED$1.animators.size) {
                const insertSpaces = this.userSettings.insertSpaces;
                const result = [];
                for (const [name, value] of STORED$1.animators.entries()) {
                    result.push(replaceTab$1(value, insertSpaces), 'res/anim', `${name}.xml`);
                }
                return this.checkFileAssets(result, options);
            }
            return [];
        }
        resourceDrawableImageToString(options = {}) {
            if (STORED$1.images.size) {
                const { directory, filename } = options;
                const imageDirectory = this.directory.image;
                const result = [];
                for (const [name, images] of STORED$1.images.entries()) {
                    if (Object.keys(images).length > 1) {
                        for (const dpi in images) {
                            const value = images[dpi];
                            result.push(value, `${imageDirectory}-${dpi}`, name + '.' + fromLastIndexOf$2(value, '.').toLowerCase());
                        }
                    }
                    else {
                        const value = images.mdpi;
                        if (value) {
                            result.push(value, imageDirectory, name + '.' + fromLastIndexOf$2(value, '.').toLowerCase());
                        }
                    }
                }
                if (directory || filename) {
                    const { outputDirectory, convertImages, compressImages } = this.userSettings;
                    options.assets = getImageAssets(getOutputDirectory(outputDirectory), result, convertImages, compressImages).concat(options.assets || []);
                    if (directory) {
                        this.copying(options);
                    }
                    if (filename) {
                        this.archiving(options);
                    }
                }
                return result;
            }
            return [];
        }
        resourceRawVideoToString(options = {}) {
            if (ASSETS.video.size) {
                const { directory, filename } = options;
                const videoDirectory = this.directory.video;
                const result = [];
                for (const video of ASSETS.video.values()) {
                    const uri = video.uri;
                    result.push(uri, video.mimeType || '', fromLastIndexOf$2(uri, '/', '\\'));
                }
                if (directory || filename) {
                    options.assets = getRawAssets(getOutputDirectory(this.userSettings.outputDirectory) + videoDirectory, result).concat(options.assets || []);
                    if (directory) {
                        this.copying(options);
                    }
                    if (filename) {
                        this.archiving(options);
                    }
                }
                return result;
            }
            return [];
        }
        resourceRawAudioToString(options = {}) {
            if (ASSETS.video.size) {
                const { directory, filename } = options;
                const audioDirectory = this.directory.audio;
                const result = [];
                for (const video of ASSETS.audio.values()) {
                    const uri = video.uri;
                    result.push(uri, video.mimeType || '', fromLastIndexOf$2(uri, '/', '\\'));
                }
                if (directory || filename) {
                    options.assets = getRawAssets(getOutputDirectory(this.userSettings.outputDirectory) + audioDirectory, result).concat(options.assets || []);
                    if (directory) {
                        this.copying(options);
                    }
                    if (filename) {
                        this.archiving(options);
                    }
                }
                return result;
            }
            return [];
        }
        layoutAllToXml(layouts, options = {}) {
            const { directory, filename } = options;
            const actionable = directory || filename;
            const result = {};
            const assets = [];
            const length = layouts.length;
            for (let i = 0; i < length; ++i) {
                const { content, filename: filenameA, pathname } = layouts[i];
                result[filenameA] = [content];
                if (actionable) {
                    assets.push(createFileAsset(pathname, i === 0 ? this.userSettings.outputMainFileName : `${filenameA}.xml`, content));
                }
            }
            if (actionable) {
                options.assets = options.assets ? assets.concat(options.assets) : assets;
                if (directory) {
                    this.copying(options);
                }
                if (filename) {
                    this.archiving(options);
                }
            }
            return result;
        }
        getAssetsAll(assets) {
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
                        }
                        else {
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
            return result.concat(getFileAssets(outputDirectory, this.resourceStringToXml()), getFileAssets(outputDirectory, this.resourceStringArrayToXml()), getFileAssets(outputDirectory, this.resourceFontToXml()), getFileAssets(outputDirectory, this.resourceColorToXml()), getFileAssets(outputDirectory, this.resourceDimenToXml()), getFileAssets(outputDirectory, this.resourceStyleToXml()), getFileAssets(outputDirectory, this.resourceDrawableToXml()), getImageAssets(outputDirectory, this.resourceDrawableImageToString(), userSettings.convertImages, userSettings.compressImages), getFileAssets(outputDirectory, this.resourceAnimToXml()), getRawAssets(outputDirectory + this.directory.video, this.resourceRawVideoToString()), getRawAssets(outputDirectory + this.directory.audio, this.resourceRawAudioToString()));
        }
        checkFileAssets(content, options) {
            const { directory, filename } = options;
            if (directory || filename) {
                options.assets = getFileAssets(getOutputDirectory(this.userSettings.outputDirectory), content).concat(options.assets || []);
                if (directory) {
                    this.copying(options);
                }
                if (filename) {
                    this.archiving(options);
                }
            }
            return content;
        }
        get userSettings() {
            return this.resource.userSettings;
        }
    }

    const { NODE_PROCEDURE: NODE_PROCEDURE$2, NODE_RESOURCE: NODE_RESOURCE$1 } = squared.base.lib.enumeration;
    class Accessibility extends squared.base.extensions.Accessibility {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
            this.options = {
                displayLabel: false
            };
        }
        beforeBaseLayout() {
            this.cacheProcessing.each(node => {
                if (node.inputElement && node.hasProcedure(NODE_PROCEDURE$2.ACCESSIBILITY)) {
                    const describedby = node.attributes['aria-describedby'];
                    if (describedby) {
                        const sibling = this.cacheProcessing.find(item => item.elementId === describedby);
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
                            const id = node.elementId;
                            [node.nextSibling, node.previousSibling].some((sibling) => {
                                if ((sibling === null || sibling === void 0 ? void 0 : sibling.pageFlow) && !sibling.visibleStyle.backgroundImage && sibling.visible) {
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
                                        if (!this.options.displayLabel) {
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
                            if (node.hasResource(NODE_RESOURCE$1.IMAGE_SOURCE)) {
                                node.data(Resource.KEY_NAME, 'embedded', [node]);
                            }
                            break;
                        case 'BUTTON':
                            if (node.length) {
                                const embedded = node.extract((item) => !item.textElement);
                                if (embedded.length && node.hasResource(NODE_RESOURCE$1.IMAGE_SOURCE)) {
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

    const $lib$5 = squared.lib;
    const $base_lib = squared.base.lib;
    const { formatPX: formatPX$2 } = $lib$5.css;
    const { createElement: createElement$1 } = $lib$5.dom;
    const { maxArray, truncate: truncate$3 } = $lib$5.math;
    const { safeNestedArray: safeNestedArray$1 } = $lib$5.util;
    const { APP_SECTION: APP_SECTION$1, BOX_STANDARD: BOX_STANDARD$3, NODE_ALIGNMENT: NODE_ALIGNMENT$2, NODE_PROCEDURE: NODE_PROCEDURE$3, NODE_RESOURCE: NODE_RESOURCE$2, NODE_TEMPLATE: NODE_TEMPLATE$1 } = $base_lib.enumeration;
    const COLUMN = $base_lib.constant.EXT_NAME.COLUMN;
    class Column extends squared.base.extensions.Column {
        processNode(node, parent) {
            super.processNode(node, parent);
            node.containerType = CONTAINER_NODE.CONSTRAINT;
            node.addAlign(4 /* AUTO_LAYOUT */);
            return {
                complete: true,
                subscribe: true
            };
        }
        postBaseLayout(node) {
            const mainData = node.data(COLUMN, 'mainData');
            if (mainData) {
                const application = this.application;
                const { columnCount, columnGap, columnWidth, columnRule, columnSized, boxWidth, rows, multiline } = mainData;
                const { borderLeftWidth, borderLeftColor, borderLeftStyle } = columnRule;
                const dividerWidth = node.parseUnit(borderLeftWidth);
                const displayBorder = borderLeftStyle !== 'none' && dividerWidth > 0;
                const createColumnRule = () => {
                    const divider = application.createNode({ parent: node, append: true });
                    divider.inherit(node, 'base');
                    divider.containerName = node.containerName + '_COLUMNRULE';
                    divider.setControlType(CONTAINER_ANDROID.LINE, CONTAINER_NODE.LINE);
                    divider.exclude({ resource: NODE_RESOURCE$2.ASSET, procedure: NODE_PROCEDURE$3.ALL });
                    let width;
                    if (displayBorder) {
                        width = formatPX$2(dividerWidth);
                        divider.cssApply({
                            width,
                            paddingLeft: width,
                            borderLeftStyle,
                            borderLeftWidth,
                            borderLeftColor,
                            lineHeight: 'initial',
                            boxSizing: 'border-box',
                            display: 'inline-block'
                        });
                    }
                    else {
                        width = formatPX$2(columnGap);
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
                        controlName: divider.controlName
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
                        }
                        else {
                            previousRow.anchor('bottomTop', item.documentId);
                            item.anchor('topBottom', previousRow.documentId);
                        }
                        if (i === length - 1) {
                            item.anchor('bottom', 'parent');
                        }
                        else {
                            previousRow = row[0];
                        }
                        item.anchorParent('horizontal', item.rightAligned ? 1 : (item.centerAligned ? 0.5 : 0));
                        item.anchored = true;
                        item.positioned = true;
                    }
                    else {
                        const columns = [];
                        let columnMin = Math.min(q, columnSized, columnCount || Number.POSITIVE_INFINITY);
                        let percentGap = 0;
                        if (columnMin > 1) {
                            const maxHeight = Math.floor(row.reduce((a, b) => a + b.bounds.height, 0) / columnMin);
                            let perRowCount = q >= columnMin ? Math.ceil(q / columnMin) : 1;
                            let rowReduce = multiline || perRowCount > 1 && (q % perRowCount !== 0 || !isNaN(columnCount) && perRowCount * columnCount % q > 1);
                            let excessCount = rowReduce && q % columnMin !== 0 ? q - columnMin : Number.POSITIVE_INFINITY;
                            let totalGap = 0;
                            for (let j = 0, k = 0, l = 0; j < q; ++j, ++l) {
                                const item = row[j];
                                const iteration = l % perRowCount === 0;
                                if (k < columnMin - 1 && (iteration || excessCount <= 0 || j > 0 && (row[j - 1].bounds.height >= maxHeight || columns[k].length && j < q - 2 && (q - j + 1 === columnMin - k) && row[j - 1].bounds.height > row[j + 1].bounds.height))) {
                                    if (j > 0) {
                                        ++k;
                                        if (iteration) {
                                            excessCount--;
                                        }
                                        else {
                                            excessCount++;
                                        }
                                    }
                                    l = 0;
                                    if (!iteration && excessCount > 0) {
                                        rowReduce = true;
                                    }
                                }
                                const column = safeNestedArray$1(columns, k);
                                column.push(item);
                                if (item.length) {
                                    totalGap += maxArray(item.map(child => child.marginLeft + child.marginRight));
                                }
                                if (j > 0 && /^H\d/.test(item.tagName)) {
                                    if (column.length === 1 && j === q - 2) {
                                        columnMin--;
                                        excessCount = 0;
                                    }
                                    else if ((l + 1) % perRowCount === 0 && q - j > columnMin && !row[j + 1].multiline && row[j + 1].bounds.height < maxHeight) {
                                        column.push(row[++j]);
                                        l = -1;
                                    }
                                }
                                else if (rowReduce && q - j === columnMin - k && excessCount !== Number.POSITIVE_INFINITY) {
                                    perRowCount = 1;
                                }
                            }
                            percentGap = columnMin > 1 ? Math.max(((totalGap + (columnGap * (columnMin - 1))) / boxWidth) / columnMin, 0.01) : 0;
                        }
                        else {
                            columns.push(row);
                        }
                        const r = columns.length;
                        const above = new Array(r);
                        let j = 0;
                        while (j < r) {
                            const data = columns[j];
                            data.forEach(item => {
                                item.app('layout_constraintWidth_percent', truncate$3((1 / columnMin) - percentGap, node.localSettings.floatPrecision));
                                item.setLayoutWidth('0px');
                                item.setBox(4 /* MARGIN_RIGHT */, { reset: 1 });
                                item.exclude({ section: APP_SECTION$1.EXTENSION });
                                item.anchored = true;
                                item.positioned = true;
                            });
                            above[j++] = data[0];
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
                        j = 0;
                        while (j < r) {
                            const seg = columns[j];
                            const elements = [];
                            let height = 0;
                            const s = seg.length;
                            let k = 0;
                            while (k < s) {
                                const column = seg[k++];
                                if (column.naturalChild) {
                                    const element = column.element.cloneNode(true);
                                    if (column.styleElement) {
                                        if (column.imageOrSvgElement) {
                                            element.style.height = formatPX$2(column.bounds.height);
                                        }
                                        else {
                                            const textStyle = column.textStyle;
                                            for (const attr in textStyle) {
                                                element.style[attr] = textStyle[attr];
                                            }
                                        }
                                    }
                                    elements.push(element);
                                }
                                else {
                                    height += column.linear.height;
                                }
                            }
                            if (elements.length) {
                                const container = createElement$1(document.body, 'div', { width: formatPX$2(columnWidth || node.box.width / columnMin), visibility: 'hidden' });
                                elements.forEach(element => container.appendChild(element));
                                height += container.getBoundingClientRect().height;
                                document.body.removeChild(container);
                            }
                            columnHeight[j++] = height;
                        }
                        let anchorTop;
                        let anchorBottom;
                        let maxHeight = 0;
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
                                item.anchorStyle('horizontal', 0, 'spread_inside');
                            }
                            else {
                                const previous = above[j - 1];
                                item.anchor('leftRight', previous.documentId);
                                item.modifyBox(16 /* MARGIN_LEFT */, columnGap);
                            }
                            if (j === r - 1) {
                                item.anchor('right', 'parent');
                            }
                            else {
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
                                    }
                                    else {
                                        if (item !== anchorTop) {
                                            item.anchor('top', anchorTop.documentId);
                                        }
                                        else {
                                            previousRow.anchor('bottomTop', item.documentId);
                                            item.anchor('topBottom', previousRow.documentId);
                                        }
                                    }
                                    item.anchorStyle('vertical', 0, 'packed');
                                    item.setBox(2 /* MARGIN_TOP */, { reset: 1 });
                                }
                                else {
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
                                    item.setBox(8 /* MARGIN_BOTTOM */, { reset: 1 });
                                }
                            }
                        }
                        const documentId = i < length - 1 ? anchorBottom.documentId : 'parent';
                        dividers.forEach(item => item.anchor('bottom', documentId));
                        previousRow = anchorBottom;
                    }
                }
            }
        }
    }

    const { lib: $lib$6, base: $base$2 } = squared;
    const $base_lib$1 = $base$2.lib;
    const { formatPercent, formatPX: formatPX$3, isLength: isLength$2, isPercent: isPercent$2 } = $lib$6.css;
    const { maxArray: maxArray$1, truncate: truncate$4 } = $lib$6.math;
    const { CHAR: CHAR$2 } = $lib$6.regex;
    const { conditionArray, flatMultiArray, hasValue, isArray } = $lib$6.util;
    const { BOX_STANDARD: BOX_STANDARD$4, NODE_ALIGNMENT: NODE_ALIGNMENT$3, NODE_PROCEDURE: NODE_PROCEDURE$4, NODE_RESOURCE: NODE_RESOURCE$3 } = $base_lib$1.enumeration;
    const LayoutUI = $base$2.LayoutUI;
    const CSS_GRID = $base_lib$1.constant.EXT_NAME.CSS_GRID;
    const CssGrid = $base$2.extensions.CssGrid;
    const REGEX_JUSTIFYSELF = /start|left|center|right|end/;
    const REGEX_JUSTIFYLEFT = /(start|left|baseline)$/;
    const REGEX_JUSTIFYRIGHT = /(right|end)$/;
    const REGEX_ALIGNSELF = /start|end|center|baseline/;
    const REGEX_ALIGNTOP = /(start|baseline)$/;
    function getRowData(mainData, horizontal) {
        const rowData = mainData.rowData;
        if (horizontal) {
            const length = mainData.column.length;
            const q = mainData.row.length;
            const result = new Array(length);
            let i = 0;
            while (i < length) {
                const data = new Array(q);
                let j = 0;
                while (j < q) {
                    data[j] = rowData[j++][i];
                }
                result[i++] = data;
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
            for (let i = 0; i < length; ++i) {
                const unitPX = unit[i];
                if (CssGrid.isPx(unitPX)) {
                    value += parseFloat(unitPX);
                }
                else {
                    let size = 0;
                    conditionArray(mainData.rowData[i], item => isArray(item), item => size = Math.min(size, ...item.map(child => child.bounds[dimension])));
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
    function setContentSpacing(node, mainData, alignment, horizontal, dimension, wrapped, MARGIN_START, MARGIN_END, maxScreenWidth, maxScreenHeight) {
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
                            for (let i = 0; i < itemCount; ++i) {
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
                        for (let i = 0; i < itemCount; ++i) {
                            for (const item of new Set(flatMultiArray(rowData[i]))) {
                                let marginEnd = marginSize + (i < marginExcess ? 1 : 0);
                                if (!adjusted.has(item)) {
                                    if (wrapped) {
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
        else if (!wrapped) {
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
    function getCellDimensions(node, horizontal, section, insideGap) {
        let width;
        let height;
        let columnWeight;
        let rowWeight;
        if (section.every(value => CssGrid.isPx(value))) {
            let px = insideGap;
            section.forEach(value => px += parseFloat(value));
            const dimension = formatPX$3(px);
            if (horizontal) {
                width = dimension;
            }
            else {
                height = dimension;
            }
        }
        else if (section.every(value => CssGrid.isFr(value))) {
            let fr = 0;
            section.forEach(value => fr += parseFloat(value));
            const weight = truncate$4(fr, node.localSettings.floatPrecision);
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
            const parent = item.actualParent;
            if (parent === null || parent === void 0 ? void 0 : parent.gridElement) {
                const mainData = parent.data(CSS_GRID, 'mainData');
                const cellData = item.data(CSS_GRID, 'cellData');
                if (mainData && cellData) {
                    const unit = mainData.column.unit;
                    const { columnStart, columnSpan } = cellData;
                    let valid = false;
                    let i = 0;
                    while (i < columnSpan) {
                        const value = unit[columnStart + i++];
                        if (CssGrid.isFr(value) || isPercent$2(value)) {
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
            else if (item.hasFlex('row') && item.flexbox.grow > 0) {
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
            if (CssGrid.isPx(value)) {
                size += parseFloat(value);
            }
            else if (isPercent$2(value)) {
                percent += parseFloat(value);
            }
            else if (CssGrid.isFr(value)) {
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
    class CssGrid$1 extends squared.base.extensions.CssGrid {
        processNode(node, parent) {
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
                if (!node.originalRoot && !node.hasWidth && mainData.rowSpanMultiple.length === 0 && unit.length === columnCount && unit.every(value => CssGrid.isFr(value)) && checkFlexibleParent(node)) {
                    const rowData = mainData.rowData;
                    const rowCount = rowData.length;
                    const constraintData = new Array(rowCount);
                    let valid = true;
                    invalid: {
                        let i = 0;
                        while (i < rowCount) {
                            const nodes = [];
                            const data = rowData[i];
                            const length = data.length;
                            let j = 0;
                            while (j < length) {
                                const cell = data[j++];
                                if ((cell === null || cell === void 0 ? void 0 : cell.length) === 1) {
                                    nodes.push(cell[0]);
                                }
                                else {
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
                        node.data(CSS_GRID, 'constraintData', constraintData);
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT);
                        return {
                            output: this.application.renderNode(layout),
                            include: true,
                            complete: true
                        };
                    }
                }
                checkAutoDimension(column, true);
                checkAutoDimension(row, false);
                layout.setContainerType(CONTAINER_NODE.GRID);
                return {
                    output: this.application.renderNode(layout),
                    include: true,
                    complete: true
                };
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
                const { alignContent, column, row } = mainData;
                const alignSelf = node.has('alignSelf') ? node.css('alignSelf') : mainData.alignItems;
                const justifySelf = node.has('justifySelf') ? node.css('justifySelf') : mainData.justifyItems;
                const layoutConstraint = parent.layoutConstraint;
                const applyLayout = (item, horizontal, dimension) => {
                    const [data, cellStart, cellSpan, minDimension] = horizontal ? [column, cellData.columnStart, cellData.columnSpan, 'minWidth'] : [row, cellData.rowStart, cellData.rowSpan, 'minHeight'];
                    const { unit, unitMin } = data;
                    let size = 0;
                    let minSize = 0;
                    let minUnitSize = 0;
                    let sizeWeight = 0;
                    let fitContent = false;
                    let autoSize = false;
                    let i = 0, j = 0;
                    while (i < cellSpan) {
                        const k = cellStart + i++;
                        const min = unitMin[k];
                        if (min !== '') {
                            minUnitSize += parent.parseUnit(min, horizontal ? 'width' : 'height');
                        }
                        let value = unit[k];
                        if (!hasValue(value)) {
                            const auto = data.auto;
                            if (auto[j]) {
                                value = auto[j];
                                if (auto[j + 1]) {
                                    ++j;
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
                        else if (CssGrid.isFr(value)) {
                            if (horizontal || parent.hasHeight) {
                                if (sizeWeight === -1) {
                                    sizeWeight = 0;
                                }
                                sizeWeight += parseFloat(value);
                                minSize = size;
                            }
                            else {
                                sizeWeight = 0;
                                minSize += mainData.minCellHeight * parseFloat(value);
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
                        if (data.autoFill && size === 0 && (horizontal ? row.length : column.length) === 1) {
                            size = Math.max(node.actualWidth, minUnitSize);
                            sizeWeight = 0;
                        }
                        else {
                            minSize = minUnitSize;
                        }
                    }
                    if (minSize > 0 && !item.hasPX(minDimension)) {
                        item.css(minDimension, formatPX$3(minSize), true);
                    }
                    if (layoutConstraint) {
                        if (horizontal) {
                            if (!item.hasPX('width', false)) {
                                item.app('layout_constraintWidth_percent', truncate$4(sizeWeight / column.frTotal, item.localSettings.floatPrecision));
                                item.setLayoutWidth('0px');
                            }
                            if (cellStart === 0) {
                                item.anchor('left', 'parent');
                                item.anchorStyle('horizontal', 0, 'spread');
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
                                    item.app('layout_constraintHeight_percent', truncate$4(sizeWeight / row.frTotal, item.localSettings.floatPrecision));
                                    item.setLayoutHeight('0px');
                                }
                            }
                            else if (size > 0) {
                                if (item.contentBox) {
                                    size -= item.contentBoxHeight;
                                }
                                item.css(autoSize ? 'minHeight' : 'height', formatPX$3(size), true);
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
                                        item.android('layout_columnWeight', sizeWeight === -1 ? '0.01' : truncate$4(sizeWeight, node.localSettings.floatPrecision));
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
                                        item.android('layout_rowWeight', truncate$4(sizeWeight, node.localSettings.floatPrecision));
                                        item.mergeGravity('layout_gravity', 'fill_vertical');
                                    }
                                }
                            }
                        }
                        else if (size > 0) {
                            const maxDimension = horizontal ? 'maxWidth' : 'maxHeight';
                            if (fitContent && !item.hasPX(maxDimension)) {
                                item.css(maxDimension, formatPX$3(size), true);
                                item.mergeGravity('layout_gravity', horizontal ? 'fill_horizontal' : 'fill_vertical');
                            }
                            else if (!item.hasPX(dimension)) {
                                if (item.contentBox) {
                                    size -= horizontal ? item.contentBoxWidth : item.contentBoxHeight;
                                }
                                if (autoSize && !parent.hasPX(maxDimension)) {
                                    item.css(minDimension, formatPX$3(size), true);
                                    if (horizontal) {
                                        item.setLayoutWidth('wrap_content');
                                    }
                                    else {
                                        item.setLayoutHeight('wrap_content');
                                    }
                                }
                                else {
                                    item.css(dimension, formatPX$3(size), true);
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
                    renderAs.exclude({ resource: NODE_RESOURCE$3.BOX_STYLE | NODE_RESOURCE$3.ASSET, procedure: NODE_PROCEDURE$4.CUSTOMIZATION });
                    renderAs.resetBox(30 /* MARGIN */);
                    renderAs.resetBox(480 /* PADDING */);
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
                        node.mergeGravity('layout_gravity', 'center_horizontal');
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
                    else if (alignSelf.endsWith('end')) {
                        node.mergeGravity('layout_gravity', 'bottom');
                    }
                    else if (alignSelf === 'center') {
                        node.mergeGravity('layout_gravity', 'center_vertical');
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
                    target.css('minHeight', formatPX$3(node.box.height));
                }
                else if (!target.hasPX('height') && !target.hasPX('maxHeight') && !(row.length === 1 && alignContent.startsWith('space') && !REGEX_ALIGNSELF.test(mainData.alignItems))) {
                    target.mergeGravity('layout_gravity', 'fill_vertical');
                }
            }
            return {
                parent: renderAs,
                renderAs, outputAs
            };
        }
        postBaseLayout(node) {
            const mainData = node.data(CSS_GRID, 'mainData');
            if (mainData) {
                const controller = this.controller;
                const { alignContent, children, column, emptyRows, justifyContent, row, rowDirection, rowData } = mainData;
                const wrapped = node.data(EXT_ANDROID.DELEGATE_CSS_GRID, 'unsetContentBox') === true;
                const insertId = children[children.length - 1].id;
                if (CssGrid.isJustified(node)) {
                    setContentSpacing(node, mainData, justifyContent, true, 'width', wrapped, 16 /* MARGIN_LEFT */, 4 /* MARGIN_RIGHT */, controller.userSettings.resolutionScreenWidth - node.bounds.left, 0);
                    switch (justifyContent) {
                        case 'center':
                        case 'space-around':
                        case 'space-evenly':
                            if (wrapped) {
                                node.anchorParent('horizontal', 0.5, '', true);
                            }
                            break;
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
                    if (wrapped) {
                        if (node.contentBoxWidth > 0 && node.hasPX('width', false)) {
                            node.anchorParent('horizontal', 0.5, '', true);
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
                    setContentSpacing(node, mainData, alignContent, false, 'height', wrapped, 2 /* MARGIN_TOP */, 8 /* MARGIN_BOTTOM */, 0, this.controller.userSettings.resolutionScreenHeight);
                    if (wrapped) {
                        switch (alignContent) {
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
                    if (wrapped) {
                        if (node.contentBoxHeight > 0 && node.hasPX('height', false)) {
                            node.anchorParent('vertical', 0.5, '', true);
                        }
                        else {
                            node.setLayoutHeight('wrap_content', false);
                        }
                    }
                }
                const constraintData = node.data(CSS_GRID, 'constraintData');
                if (constraintData) {
                    const { gap, length } = column;
                    const rowCount = constraintData.length;
                    const barrierIds = new Array(rowCount - 1);
                    let i = 1, j = 0;
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
                                if (j === length - 1) {
                                    item.anchor('right', 'parent');
                                }
                                else {
                                    item.modifyBox(4 /* MARGIN_RIGHT */, -gap);
                                }
                                if (previousItem) {
                                    previousItem.anchor('rightLeft', item.documentId);
                                    item.anchor('leftRight', previousItem.documentId);
                                }
                                else {
                                    item.anchor('left', 'parent');
                                    item.anchorStyle('horizontal', 0, 'packed');
                                }
                                item.anchored = true;
                                item.positioned = true;
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
                    }
                }
                else {
                    const { flexible, gap, unit } = rowDirection ? column : row;
                    const unitSpan = unit.length;
                    let k = -1;
                    let l = 0;
                    const createSpacer = (i, horizontal, unitData, gapSize, opposing = 'wrap_content', opposingWeight = '', opposingMargin = 0) => {
                        if (k !== -1) {
                            const section = unitData.slice(k, k + l);
                            let width = '';
                            let height = '';
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
                                    [horizontal ? node.localizeString(STRING_ANDROID.MARGIN_RIGHT) : 'bottom']: gapSize > 0 && (k + l) < unitData.length ? '@dimen/' + Resource.insertStoredAsset('dimens', `${node.controlId}_cssgrid_${horizontal ? 'column' : 'row'}_gap`, formatPX$3(gapSize)) : '',
                                    [horizontal ? 'bottom' : node.localizeString(STRING_ANDROID.MARGIN_RIGHT)]: opposingMargin > 0 ? '@dimen/' + Resource.insertStoredAsset('dimens', `${node.controlId}_cssgrid_${horizontal ? 'row' : 'column'}_gap`, formatPX$3(opposingMargin)) : '',
                                    layout_row,
                                    layout_column,
                                    layout_rowWeight,
                                    layout_columnWeight,
                                    layout_gravity: 'fill'
                                }
                            }), CssGrid.isPx(width) || CssGrid.isPx(height));
                            k = -1;
                        }
                        l = 0;
                    };
                    let length = Math.max(rowData.length, 1);
                    for (let i = 0; i < length; ++i) {
                        if (emptyRows[i] === undefined) {
                            const data = rowData[i];
                            for (let j = 0; j < unitSpan; ++j) {
                                if (data[j]) {
                                    createSpacer(i, rowDirection, unit, gap);
                                }
                                else {
                                    if (k === -1) {
                                        k = j;
                                    }
                                    ++l;
                                }
                            }
                            createSpacer(i, rowDirection, unit, gap);
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
                        if (CssGrid.isPx(value)) {
                            minWidth += parseFloat(value);
                        }
                        else {
                            return;
                        }
                    }
                    if (minWidth > node.width) {
                        node.android('minWidth', formatPX$3(minWidth));
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
    const { lib: $lib$7, base: $base$3 } = squared;
    const $base_lib$2 = $base$3.lib;
    const { isLength: isLength$3 } = $lib$7.css;
    const { truncate: truncate$5 } = $lib$7.math;
    const { capitalize: capitalize$2, sameArray, withinRange: withinRange$1 } = $lib$7.util;
    const { BOX_STANDARD: BOX_STANDARD$5, NODE_ALIGNMENT: NODE_ALIGNMENT$4 } = $base_lib$2.enumeration;
    const NodeUI$1 = $base$3.NodeUI;
    const FLEXBOX = $base_lib$2.constant.EXT_NAME.FLEXBOX;
    const MAP_horizontal = {
        orientation: 'horizontal',
        orientationInverse: 'vertical',
        WHL: 'width',
        HWL: 'height',
        LT: 'left',
        TL: 'top',
        RB: 'right',
        BR: 'bottom',
        LRTB: 'leftRight',
        RLBT: 'rightLeft'
    };
    const MAP_vertical = {
        orientation: 'vertical',
        orientationInverse: 'horizontal',
        WHL: 'height',
        HWL: 'width',
        LT: 'top',
        TL: 'left',
        RB: 'bottom',
        BR: 'right',
        LRTB: 'topBottom',
        RLBT: 'bottomTop'
    };
    function adjustGrowRatio(parent, items, attr) {
        const horizontal = attr === 'width';
        const hasDimension = horizontal ? 'hasWidth' : 'hasHeight';
        const setPercentage = (item) => item.flexbox.basis = (item.bounds[attr] / parent.box[attr] * 100) + '%';
        let percent = parent[hasDimension] || horizontal && parent.blockStatic && withinRange$1(parent.parseWidth(parent.css('maxWidth')), parent.box.width);
        let result = 0;
        let growShrinkType = 0;
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
        if (length > 1 && (horizontal || percent)) {
            const groupBasis = [];
            const percentage = [];
            let maxBasis;
            let maxBasisUnit = 0;
            let maxDimension = 0;
            let maxRatio = NaN;
            i = 0;
            while (i < length) {
                const item = items[i++];
                const { alignSelf, basis, shrink, grow } = item.flexbox;
                const dimension = item.bounds[attr];
                let growPercent = false;
                if (grow > 0 || shrink !== 1) {
                    const value = item.parseUnit(basis === 'auto' ? item.css(attr) : basis, attr);
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
                    else if (grow > 0) {
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
            if (growShrinkType) {
                if (groupBasis.length > 1) {
                    groupBasis.forEach(data => {
                        const { basis, item } = data;
                        if (item === maxBasis || basis === maxBasisUnit && (growShrinkType === 1 && maxRatio === data.shrink || growShrinkType === 2 && maxRatio === data.grow)) {
                            item.flexbox.grow = 1;
                        }
                        else if (basis > 0) {
                            item.flexbox.grow = ((data.dimension / basis) / (maxDimension / maxBasisUnit)) * basis / maxBasisUnit;
                        }
                    });
                }
                percentage.forEach(item => setPercentage(item));
            }
        }
        if (horizontal && growShrinkType === 0) {
            i = 0;
            while (i < length) {
                const item = items[i++];
                if (item.find(child => child.multiline && child.ascend({ condition: above => above[hasDimension], including: parent }).length === 0, { cascade: true })) {
                    items.forEach(child => setPercentage(child));
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
            const { column, row, rowCount, columnCount } = mainData;
            if (row && rowCount === 1 || column && columnCount === 1) {
                node.containerType = CONTAINER_NODE.CONSTRAINT;
                node.addAlign(4 /* AUTO_LAYOUT */);
                node.addAlign(column ? 16 /* VERTICAL */ : 8 /* HORIZONTAL */);
                mainData.wrap = false;
                return {
                    include: true,
                    complete: true
                };
            }
            else {
                const containerType = row && node.hasHeight || column && node.hasWidth || node.some(item => !item.pageFlow) ? CONTAINER_NODE.CONSTRAINT : CONTAINER_NODE.LINEAR;
                return {
                    output: this.application.renderNode(LayoutUI$1.create({
                        parent,
                        node,
                        containerType,
                        alignmentType: 4 /* AUTO_LAYOUT */ | (column ? 8 /* HORIZONTAL */ : 16 /* VERTICAL */),
                        itemCount: node.length,
                        rowCount,
                        columnCount
                    })),
                    include: true,
                    complete: true
                };
            }
        }
        processChild(node, parent) {
            if (node.hasAlign(128 /* SEGMENTED */)) {
                return {
                    output: this.application.renderNode(new LayoutUI$1(parent, node, CONTAINER_NODE.CONSTRAINT, 4 /* AUTO_LAYOUT */, node.children)),
                    complete: true,
                    subscribe: true
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
                            container.setCacheValue('flexbox', node.flexbox);
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
                const { row, column, reverse, wrap, wrapReverse, alignContent, justifyContent, children } = mainData;
                const parentBottom = node.hasPX('height', false) || node.percentHeight > 0 ? node.linear.bottom : 0;
                const chainHorizontal = [];
                const chainVertical = [];
                const segmented = [];
                let marginBottom = 0;
                if (wrap) {
                    let previous;
                    node.each((item) => {
                        if (item.hasAlign(128 /* SEGMENTED */)) {
                            const pageFlow = item.renderChildren.filter(child => child.pageFlow);
                            if (pageFlow.length) {
                                if (row) {
                                    item.setLayoutWidth('match_parent');
                                    chainHorizontal.push(pageFlow);
                                }
                                else {
                                    item.setLayoutHeight('match_parent');
                                    if (previous) {
                                        const length = previous.length;
                                        let largest = previous[0];
                                        let j = 1;
                                        while (j < length) {
                                            const sibling = previous[j++];
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
                        if (wrapReverse && column) {
                            node.mergeGravity('gravity', 'right');
                        }
                    }
                    else if (segmented.length) {
                        if (row) {
                            chainVertical.push(segmented);
                        }
                        else {
                            chainHorizontal.push(segmented);
                        }
                    }
                }
                else {
                    if (row) {
                        if (reverse) {
                            children.reverse();
                        }
                        chainHorizontal[0] = children;
                    }
                    else {
                        if (reverse) {
                            children.reverse();
                        }
                        chainVertical[0] = children;
                    }
                }
                const applyLayout = (partition, horizontal) => {
                    const length = partition.length;
                    if (length === 0) {
                        return;
                    }
                    const { orientation, orientationInverse, WHL, HWL, LT, TL, RB, BR, LRTB, RLBT } = horizontal ? MAP_horizontal : MAP_vertical;
                    const [dimension, dimensionInverse] = horizontal ? [node.hasHeight, node.hasWidth] : [node.hasWidth, node.hasHeight];
                    const orientationWeight = `layout_constraint${capitalize$2(orientation)}_weight`;
                    const setLayoutWeight = (chain, value) => {
                        if (chain[WHL] === 0) {
                            chain.app(orientationWeight, truncate$5(value, chain.localSettings.floatPrecision));
                            if (horizontal) {
                                chain.setLayoutWidth('0px');
                            }
                            else {
                                chain.setLayoutHeight('0px');
                            }
                        }
                    };
                    for (let i = 0; i < length; ++i) {
                        const seg = partition[i];
                        const q = seg.length;
                        const segStart = seg[0];
                        const segEnd = seg[q - 1];
                        const opposing = seg === segmented;
                        const justified = !opposing && seg.every(item => item.flexbox.grow === 0);
                        const spreadInside = justified && (justifyContent === 'space-between' || justifyContent === 'space-around' && q > 1);
                        const layoutWeight = [];
                        let maxSize = 0;
                        let growAvailable = 0;
                        let parentEnd = true;
                        let baseline = null;
                        let growAll;
                        segStart.anchor(LT, 'parent');
                        segEnd.anchor(RB, 'parent');
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
                                segStart.anchorStyle(orientation, bias, chainStyle);
                            }
                            else {
                                segStart.anchorStyle(orientation, 0, 'packed');
                            }
                        }
                        else {
                            growAll = horizontal || dimensionInverse;
                            growAvailable = 1 - adjustGrowRatio(node, seg, WHL);
                            if (q > 1) {
                                let sizeCount = 0;
                                seg.forEach(chain => {
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
                                });
                                if (sizeCount === q) {
                                    maxSize = NaN;
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
                                if (parentEnd && q > 1 && dimensionInverse) {
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
                                            innerWrapped.mergeGravity('layout_gravity', autoMargin.leftRight ? 'center_horizontal' : chain.localizeString(autoMargin.left ? 'right' : 'left'));
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
                                            innerWrapped.mergeGravity('layout_gravity', autoMargin.topBottom ? 'center_vertical' : (chain.localizeString(autoMargin.top ? 'bottom' : 'top')));
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
                                                    childContent.mergeGravity('layout_gravity', horizontal ? 'center_vertical' : 'center_horizontal');
                                                }
                                                else {
                                                    chain.anchorParent(orientationInverse);
                                                }
                                                break;
                                            case 'space-between':
                                                if (spreadInside && q === 2) {
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
                                                        childContent.mergeGravity('layout_gravity', horizontal ? 'center_vertical' : 'center_horizontal');
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
                                                if (!innerWrapped || !chain.innerMostWrapped.autoMargin[orientationInverse]) {
                                                    chain.anchorStyle(orientationInverse, wrapReverse ? 1 : 0);
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
                                                    else if (q === 1) {
                                                        if (!horizontal) {
                                                            setLayoutWeightOpposing(chain, dimension ? '0px' : 'match_parent', horizontal);
                                                        }
                                                        else {
                                                            setLayoutWeightOpposing(chain, 'wrap_content', horizontal);
                                                        }
                                                    }
                                                    else if ((chain.naturalElement ? (chain.data(FLEXBOX, 'boundsData') || chain.bounds)[HWL] : Number.POSITIVE_INFINITY) < maxSize) {
                                                        setLayoutWeightOpposing(chain, chain.flexElement && chain.css('flexDirection').startsWith(horizontal ? 'row' : 'column') ? 'match_parent' : '0px', horizontal);
                                                        if (innerWrapped && !innerWrapped.autoMargin[orientation]) {
                                                            setLayoutWeightOpposing(innerWrapped, 'match_parent', horizontal);
                                                        }
                                                    }
                                                    else if (dimension) {
                                                        setLayoutWeightOpposing(chain, '0px', horizontal);
                                                    }
                                                    else {
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
                                View.setFlexDimension(chain, WHL);
                                if (!chain.innerMostWrapped.has('flexGrow')) {
                                    growAll = false;
                                }
                                if (parentBottom > 0 && i === length - 1) {
                                    const offset = chain.linear.bottom - parentBottom;
                                    if (offset > 0) {
                                        marginBottom = Math.max(chain.linear.bottom - parentBottom, marginBottom);
                                    }
                                    chain.setBox(8 /* MARGIN_BOTTOM */, { reset: 1 });
                                }
                            }
                            chain.anchored = true;
                            chain.positioned = true;
                        }
                        if (opposing) {
                            continue;
                        }
                        if (growAll) {
                            seg.forEach(item => setLayoutWeight(item, item.flexbox.grow));
                        }
                        else if (growAvailable > 0) {
                            layoutWeight.forEach(item => {
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
                            });
                        }
                        if (marginBottom > 0) {
                            node.modifyBox(8 /* MARGIN_BOTTOM */, marginBottom);
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
                                            controller.addGuideline(segEnd, node, { orientation, percent: true, opposing: true });
                                            segStart.anchorStyle(orientation, 0, 'spread_inside');
                                            continue;
                                        }
                                        centered = true;
                                        break;
                                }
                            }
                            if (spreadInside || !wrap && seg.some(item => item.app(orientationWeight) !== '') && !sameArray(seg, item => item.app(orientationWeight))) {
                                segStart.anchorStyle(orientation, 0, 'spread_inside', false);
                            }
                            else if (!centered) {
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
    const $lib$8 = squared.lib;
    const $base_lib$3 = squared.base.lib;
    const { formatPX: formatPX$4 } = $lib$8.css;
    const { withinRange: withinRange$2 } = $lib$8.util;
    const { BOX_STANDARD: BOX_STANDARD$6, NODE_ALIGNMENT: NODE_ALIGNMENT$5 } = $base_lib$3.enumeration;
    const Grid = squared.base.extensions.Grid;
    const GRID = $base_lib$3.constant.EXT_NAME.GRID;
    function transferData(parent, siblings) {
        const data = Grid.createDataCellAttribute();
        siblings.forEach(item => {
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
        });
        parent.data(GRID, 'cellData', data);
    }
    class Grid$1 extends squared.base.extensions.Grid {
        processNode(node, parent) {
            super.processNode(node, parent);
            const columnCount = node.data(GRID, 'columnCount');
            if (columnCount) {
                return {
                    output: this.application.renderNode(LayoutUI$2.create({
                        parent,
                        node,
                        containerType: CONTAINER_NODE.GRID,
                        alignmentType: 256 /* COLUMN */,
                        children: node.children,
                        columnCount
                    })),
                    include: true,
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
                    layout = controller.processLayoutHorizontal(new LayoutUI$2(parent, controller.createNodeGroup(node, siblings, { parent, delegate: true, cascade: true }), 0, 0, siblings));
                    node = layout.node;
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
                        outputAs: this.application.renderNode(layout)
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
                            if ((parent === null || parent === void 0 ? void 0 : parent.visible) === false) {
                                const marginTop = parent.getBox(2 /* MARGIN_TOP */)[0] === 0 ? parent.marginTop : 0;
                                const marginBottom = parent.getBox(8 /* MARGIN_BOTTOM */)[0] === 0 ? parent.marginBottom : 0;
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
                                                height: '@dimen/' + Resource.insertStoredAsset('dimens', `${node.controlId}_grid_space`, formatPX$4(heightBottom)),
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
    const $lib$9 = squared.lib;
    const $base_lib$4 = squared.base.lib;
    const { formatPX: formatPX$5, getBackgroundPosition } = $lib$9.css;
    const { convertInt: convertInt$1 } = $lib$9.util;
    const { STRING_SPACE } = $lib$9.xml;
    const { BOX_STANDARD: BOX_STANDARD$7, NODE_ALIGNMENT: NODE_ALIGNMENT$6, NODE_TEMPLATE: NODE_TEMPLATE$2 } = $base_lib$4.enumeration;
    const LIST = $base_lib$4.constant.EXT_NAME.LIST;
    class List extends squared.base.extensions.List {
        processNode(node, parent) {
            const layout = new LayoutUI$3(parent, node, 0, 0, node.children);
            if (!layout.unknownAligned || layout.singleRowAligned) {
                super.processNode(node, parent);
                if (layout.linearY) {
                    layout.rowCount = node.length;
                    layout.columnCount = node.some(item => item.css('listStylePosition') === 'inside') ? 3 : 2;
                    layout.setContainerType(CONTAINER_NODE.GRID, 16 /* VERTICAL */);
                }
                else if (layout.linearX || layout.singleRowAligned) {
                    layout.rowCount = 1;
                    layout.columnCount = layout.length;
                    layout.setContainerType(CONTAINER_NODE.LINEAR, 8 /* HORIZONTAL */);
                }
                else {
                    return undefined;
                }
                return {
                    output: this.application.renderNode(layout),
                    complete: true,
                    include: true
                };
            }
            return undefined;
        }
        processChild(node, parent) {
            const mainData = node.data(LIST, 'mainData');
            if (mainData) {
                const application = this.application;
                const controller = this.controller;
                const firstChild = parent.firstStaticChild === node;
                const marginTop = node.marginTop;
                let value = mainData.ordinal || '';
                let minWidth = node.marginLeft;
                let marginLeft = 0;
                let columnCount = 0;
                let adjustPadding = false;
                let resetPadding = NaN;
                node.setBox(16 /* MARGIN_LEFT */, { reset: 1 });
                if (parent.layoutGrid) {
                    columnCount = convertInt$1(parent.android('columnCount')) || 1;
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
                    container = controller.createNodeWrapper(node, parent, Object.assign({}, controller.containerTypeVertical));
                    node.resetBox(10 /* MARGIN_VERTICAL */, container);
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
                            ordinal.android('minWidth', formatPX$5(minWidth));
                        }
                    }
                    ordinal.parent = parent;
                    ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.INLINE);
                    ordinal.setBox(16 /* MARGIN_LEFT */, { reset: 1 });
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
                            ({ top, left } = getBackgroundPosition(mainData.imagePosition, node.actualDimension, {
                                fontSize: node.fontSize,
                                imageDimension: resource.getImage(mainData.imageSrc),
                                screenDimension: node.localSettings.screenDimension
                            }));
                            if (node.marginLeft < 0) {
                                resetPadding = node.marginLeft + (parent.paddingLeft > 0 ? parent.paddingLeft : parent.marginLeft);
                            }
                            else {
                                adjustPadding = false;
                                marginLeft = node.marginLeft;
                            }
                            minWidth = node.paddingLeft - left;
                            node.setBox(256 /* PADDING_LEFT */, { reset: 1 });
                            gravity = '';
                        }
                        image = resource.addImageSrc(mainData.imageSrc);
                    }
                    const options = createViewAttribute();
                    ordinal = application.createNode({ parent });
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
                                src: `@drawable/${image}`,
                                scaleType: gravity === 'right' ? 'fitEnd' : 'fitStart',
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
                            node.setBox(256 /* PADDING_LEFT */, { reset: 1 });
                        }
                        const { paddingTop, lineHeight } = node;
                        ordinal.cssApply({
                            minWidth: minWidth > 0 ? formatPX$5(minWidth) : '',
                            marginLeft: marginLeft > 0 ? formatPX$5(marginLeft) : '',
                            paddingTop: paddingTop > 0 && node.getBox(32 /* PADDING_TOP */)[0] === 0 ? formatPX$5(paddingTop) : '',
                            paddingRight: paddingRight > 0 ? formatPX$5(paddingRight) : '',
                            lineHeight: lineHeight > 0 ? formatPX$5(lineHeight) : ''
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
                        parent.setBox(parent.paddingLeft > 0 ? 256 /* PADDING_LEFT */ : 16 /* MARGIN_LEFT */, { reset: 1 });
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
                        outputAs: application.renderNode(new LayoutUI$3(parent, container, CONTAINER_NODE.LINEAR, 16 /* VERTICAL */ | 2 /* UNKNOWN */, container.children)),
                        subscribe: true
                    };
                }
            }
            return undefined;
        }
        postConstraints(node) {
            const companion = !node.naturalChild && node.companion;
            if (companion) {
                const [reset, adjustment] = companion.getBox(2 /* MARGIN_TOP */);
                if (reset === 0) {
                    node.modifyBox(2 /* MARGIN_TOP */, adjustment - node.getBox(2 /* MARGIN_TOP */)[1], false);
                }
                else {
                    node.setBox(2 /* MARGIN_TOP */, { adjustment: 0 });
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
                            node.modifyBox(8 /* MARGIN_BOTTOM */, Math.floor(node.baselineHeight * this.controller.localSettings.deviations.subscriptBottomOffset) * -1);
                        }
                        break;
                    }
                    case 'super': {
                        const renderParent = node.outerMostWrapper.renderParent;
                        if (!renderParent.layoutHorizontal) {
                            node.modifyBox(2 /* MARGIN_TOP */, Math.floor(node.baselineHeight * this.controller.localSettings.deviations.superscriptTopOffset) * -1);
                        }
                        break;
                    }
                }
            }
            super.postOptimize(node);
        }
    }

    var LayoutUI$4 = squared.base.LayoutUI;
    const { formatPX: formatPX$6 } = squared.lib.css;
    const $base_lib$5 = squared.base.lib;
    const { APP_SECTION: APP_SECTION$2, BOX_STANDARD: BOX_STANDARD$9, NODE_ALIGNMENT: NODE_ALIGNMENT$7, NODE_PROCEDURE: NODE_PROCEDURE$5, NODE_RESOURCE: NODE_RESOURCE$4 } = $base_lib$5.enumeration;
    const SPRITE = $base_lib$5.constant.EXT_NAME.SPRITE;
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
                    container.exclude({ resource: NODE_RESOURCE$4.ASSET, procedure: NODE_PROCEDURE$5.CUSTOMIZATION, section: APP_SECTION$2.ALL });
                    node.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                    node.resetBox(30 /* MARGIN */);
                    node.resetBox(480 /* PADDING */);
                    node.registerBox(2 /* MARGIN_TOP */, container);
                    node.registerBox(4 /* MARGIN_RIGHT */, container);
                    node.registerBox(8 /* MARGIN_BOTTOM */, container);
                    node.registerBox(16 /* MARGIN_LEFT */, container);
                    node.exclude({ resource: NODE_RESOURCE$4.FONT_STYLE | NODE_RESOURCE$4.BOX_STYLE | NODE_RESOURCE$4.BOX_SPACING });
                    node.cssApply({
                        position: 'static',
                        top: 'auto',
                        right: 'auto',
                        bottom: 'auto',
                        left: 'auto',
                        display: 'inline-block',
                        width: width > 0 ? formatPX$6(width) : 'auto',
                        height: height > 0 ? formatPX$6(height) : 'auto',
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
                    node.android('src', `@drawable/${drawable}`);
                    node.android('layout_marginTop', formatPX$6(top));
                    node.android(node.localizeString('layout_marginLeft'), formatPX$6(left));
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
                        },
                        include: true
                    };
                }
            }
            return undefined;
        }
        postOptimize(node) {
            node.apply(Resource.formatOptions(createViewAttribute(this.options[node.elementId]), this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        }
    }

    var LayoutUI$5 = squared.base.LayoutUI;
    const $lib$a = squared.lib;
    const $base_lib$6 = squared.base.lib;
    const { CSS_UNIT: CSS_UNIT$1, formatPX: formatPX$7 } = $lib$a.css;
    const { convertFloat: convertFloat$2, convertInt: convertInt$2, trimEnd: trimEnd$1 } = $lib$a.util;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$9 } = $base_lib$6.enumeration;
    const TABLE = $base_lib$6.constant.EXT_NAME.TABLE;
    function setLayoutHeight(node) {
        if (node.hasPX('height') && node.height + node.contentBoxHeight < Math.floor(node.bounds.height) && node.css('verticalAlign') !== 'top') {
            node.setLayoutHeight('wrap_content');
        }
    }
    class Table extends squared.base.extensions.Table {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data(TABLE, 'mainData');
            let requireWidth = false;
            if (mainData.columnCount > 1) {
                requireWidth = mainData.expand;
                node.each((item) => {
                    const data = item.data(TABLE, 'cellData');
                    if (data.flexible) {
                        item.android('layout_columnWeight', data.colSpan.toString());
                        item.setLayoutWidth('0px');
                        requireWidth = true;
                    }
                    else {
                        const { downsized, expand, percent } = data;
                        if (expand) {
                            if (percent) {
                                const value = convertFloat$2(percent) / 100;
                                if (value > 0) {
                                    item.setLayoutWidth('0px');
                                    item.android('layout_columnWeight', trimEnd$1(value.toPrecision(3), '0'));
                                    requireWidth = true;
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
                                requireWidth = true;
                            }
                            else if (item.hasPX('width')) {
                                const width = item.bounds.width;
                                if (item.actualWidth < width) {
                                    item.setLayoutWidth(formatPX$7(width));
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
                    if (item.has('width', { type: 4 /* PERCENT */ })) {
                        item.setLayoutWidth('wrap_content');
                        requireWidth = true;
                    }
                    setLayoutHeight(item);
                });
            }
            if (node.hasWidth) {
                if (node.width < Math.floor(node.bounds.width)) {
                    if (mainData.layoutFixed) {
                        node.android('width', formatPX$7(node.bounds.width));
                    }
                    else {
                        if (!node.hasPX('minWidth')) {
                            node.android('minWidth', formatPX$7(node.actualWidth));
                        }
                        node.css('width', 'auto');
                    }
                }
            }
            else if (requireWidth) {
                if ((parent.blockStatic || parent.hasPX('width')) && Math.ceil(node.bounds.width) >= parent.box.width) {
                    node.setLayoutWidth('match_parent');
                }
                else {
                    node.css('width', formatPX$7(node.actualWidth));
                }
            }
            if (node.hasHeight && node.height < Math.floor(node.bounds.height)) {
                if (!node.hasPX('minHeight')) {
                    node.android('minHeight', formatPX$7(node.actualHeight));
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
                include: true,
                complete: true
            };
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
                    node.setLayoutWidth(formatPX$7(width));
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
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$a } = squared.base.lib.enumeration;
    class VerticalAlign extends squared.base.extensions.VerticalAlign {
        processNode(node, parent) {
            super.processNode(node, parent);
            return {
                output: this.application.renderNode(new LayoutUI$6(parent, node, CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */, node.children)),
                subscribe: true
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
    const $lib$b = squared.lib;
    const { formatPX: formatPX$8 } = $lib$b.css;
    const { hypotenuse } = $lib$b.math;
    const { withinRange: withinRange$3 } = $lib$b.util;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$b } = squared.base.lib.enumeration;
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
                if (withinRange$3(linear.left, left)) {
                    item.anchorParent('horizontal', 0);
                }
                if (withinRange$3(linear.top, top)) {
                    item.anchorParent('vertical', 0);
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
                if (!anchor) {
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
                        item.app('layout_constraintCircleRadius', formatPX$8(radius));
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
    const $base$4 = squared.base;
    const { CSS_UNIT: CSS_UNIT$2, isLength: isLength$4 } = squared.lib.css;
    const { BOX_STANDARD: BOX_STANDARD$a, NODE_ALIGNMENT: NODE_ALIGNMENT$c, NODE_RESOURCE: NODE_RESOURCE$5, NODE_TEMPLATE: NODE_TEMPLATE$4 } = $base$4.lib.enumeration;
    const CssGrid$2 = $base$4.extensions.CssGrid;
    const RESOURCE_IGNORE = NODE_RESOURCE$5.BOX_SPACING | NODE_RESOURCE$5.FONT_STYLE | NODE_RESOURCE$5.VALUE_STRING;
    const hasVisibleWidth = (node) => !node.blockStatic && !node.hasPX('width') || node.has('width', { type: 2 /* LENGTH */ | 4 /* PERCENT */, not: '100%' }) && node.css('minWidth') !== '100%' || node.has('maxWidth', { type: 2 /* LENGTH */ | 4 /* PERCENT */, not: '100%' });
    const hasFullHeight = (node) => node.css('height') === '100%' || node.css('minHeight') === '100%';
    const hasMargin = (node) => node.marginTop > 0 || node.marginRight > 0 || node.marginBottom > 0 || node.marginLeft > 0;
    const isParentVisible = (node, parent) => parent.visibleStyle.background && (hasVisibleWidth(node) || !hasFullHeight(parent) || !hasFullHeight(node));
    const isParentTransfer = (parent) => parent.tagName === 'HTML' && (parent.contentBoxWidth > 0 || parent.contentBoxHeight > 0 || hasMargin(parent));
    const isWrapped = (node, parent, backgroundColor, backgroundImage, borderWidth) => (backgroundColor || backgroundImage) && !isParentVisible(node, parent) && (borderWidth || node.gridElement && (CssGrid$2.isJustified(node) || CssGrid$2.isAligned(node)));
    const isBackgroundSeparate = (node, parent, backgroundColor, backgroundImage, backgroundRepeatX, backgroundRepeatY, borderWidth) => backgroundColor && backgroundImage && ((!backgroundRepeatX || !backgroundRepeatY) && (node.has('backgroundPositionX') || node.has('backgroundPositionY') || borderWidth && (hasVisibleWidth(node) || !hasFullHeight(parent) || !hasFullHeight(node))) || node.css('backgroundAttachment') === 'fixed');
    const isHideMargin = (node, backgroundImage) => backgroundImage && hasMargin(node);
    class Background extends squared.base.ExtensionUI {
        is(node) {
            return node.documentBody;
        }
        condition(node, parent) {
            const { backgroundColor, backgroundImage, backgroundRepeatX, backgroundRepeatY, borderWidth } = node.visibleStyle;
            return isWrapped(node, parent, backgroundColor, backgroundImage, borderWidth) || isBackgroundSeparate(node, parent, backgroundColor, backgroundImage, backgroundRepeatX, backgroundRepeatY, borderWidth) || isHideMargin(node, backgroundImage) || isParentTransfer(parent);
        }
        processNode(node, parent) {
            var _a;
            const controller = this.controller;
            const { backgroundColor, backgroundImage, visibleStyle } = node;
            const { backgroundColor: backgroundColorA, backgroundImage: backgroundImageA, backgroundRepeatX, backgroundRepeatY, borderWidth } = visibleStyle;
            const backgroundSeparate = isBackgroundSeparate(node, parent, backgroundColorA, backgroundImageA, backgroundRepeatX, backgroundRepeatY, borderWidth);
            const hasHeight = node.hasHeight || ((_a = node.actualParent) === null || _a === void 0 ? void 0 : _a.hasHeight) === true;
            let renderParent = parent;
            let container;
            let parentAs;
            const createFrameWrapper = (wrapper) => {
                wrapper.setControlType(View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api), CONTAINER_NODE.CONSTRAINT);
                wrapper.addAlign(16 /* VERTICAL */);
                wrapper.render(renderParent);
                this.application.addLayoutTemplate(renderParent, wrapper, {
                    type: 1 /* XML */,
                    node: wrapper,
                    controlName: wrapper.controlName
                });
                parentAs = wrapper;
                renderParent = wrapper;
            };
            const parentVisible = isParentVisible(node, parent);
            const fixed = node.css('backgroundAttachment') === 'fixed';
            if (backgroundColor !== '') {
                if (!(backgroundImageA && backgroundRepeatX && backgroundRepeatY)) {
                    container = controller.createNodeWrapper(node, renderParent, { resource: RESOURCE_IGNORE });
                    container.css('backgroundColor', backgroundColor);
                    container.setCacheValue('backgroundColor', backgroundColor);
                    if (!parentVisible) {
                        container.setLayoutWidth('match_parent');
                        container.setLayoutHeight('match_parent');
                    }
                    else if (!hasVisibleWidth(node)) {
                        container.setLayoutWidth('match_parent');
                    }
                    container.unsetCache('visibleStyle');
                }
                node.css('backgroundColor', 'transparent');
                node.setCacheValue('backgroundColor', '');
                visibleStyle.backgroundColor = false;
            }
            if (backgroundImage !== '' && (parentVisible || backgroundSeparate || backgroundRepeatY || parent.visibleStyle.background || hasMargin(node))) {
                if (container) {
                    if (backgroundSeparate || fixed) {
                        createFrameWrapper(container);
                        container = controller.createNodeWrapper(node, parentAs, { resource: NODE_RESOURCE$5.BOX_SPACING });
                    }
                }
                else {
                    container = controller.createNodeWrapper(node, renderParent, { resource: RESOURCE_IGNORE });
                }
                container.setLayoutWidth('match_parent');
                const height = parent.cssInitial('height');
                const minHeight = parent.cssInitial('minHeight');
                let backgroundSize = node.css('backgroundSize');
                if (height === '' && minHeight === '') {
                    container.setLayoutHeight(!parentVisible && (fixed || !(backgroundSeparate && hasHeight) && (backgroundRepeatY || node.has('backgroundSize') || node.css('backgroundPosition').split(' ').some(value => isLength$4(value) && parseInt(value) > 0))) ? 'match_parent' : 'wrap_content');
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
                    backgroundSize,
                    border: '0px none solid',
                    borderRadius: '0px'
                });
                container.cssApply(node.cssAsObject('backgroundRepeat', 'backgroundPositionX', 'backgroundPositionY', 'backgroundClip'));
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
                parent.resetBox(30 /* MARGIN */, container);
                parent.resetBox(480 /* PADDING */, container);
                container.setLayoutWidth('match_parent', false);
                container.setLayoutHeight('wrap_content', false);
            }
            if (container) {
                visibleStyle.background = visibleStyle.borderWidth || visibleStyle.backgroundImage || visibleStyle.backgroundColor;
                return {
                    parent: container,
                    parentAs,
                    renderAs: container,
                    outputAs: this.application.renderNode(new LayoutUI$8(parentAs || parent, container, CONTAINER_NODE.CONSTRAINT, 16 /* VERTICAL */, container.children)),
                    remove: true
                };
            }
            return { remove: true };
        }
    }

    var LayoutUI$9 = squared.base.LayoutUI;
    const $base$5 = squared.base;
    const { BOX_STANDARD: BOX_STANDARD$b, NODE_ALIGNMENT: NODE_ALIGNMENT$d, NODE_RESOURCE: NODE_RESOURCE$6 } = $base$5.lib.enumeration;
    const CssGrid$3 = $base$5.extensions.CssGrid;
    const getLayoutDimension = (value) => value === 'space-between' ? 'match_parent' : 'wrap_content';
    class Grid$2 extends squared.base.ExtensionUI {
        is(node) {
            return node.gridElement;
        }
        condition(node) {
            return CssGrid$3.isJustified(node) || CssGrid$3.isAligned(node);
        }
        processNode(node, parent) {
            const container = this.controller.createNodeWrapper(node, parent, { containerType: CONTAINER_NODE.CONSTRAINT, resource: NODE_RESOURCE$6.ASSET });
            container.inherit(node, 'styleMap', 'boxStyle');
            node.resetBox(30 /* MARGIN */, container);
            node.resetBox(480 /* PADDING */, container);
            node.data(EXT_ANDROID.DELEGATE_CSS_GRID, 'unsetContentBox', true);
            if (CssGrid$3.isJustified(node)) {
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
            if (CssGrid$3.isAligned(node)) {
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
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new LayoutUI$9(parent, container, CONTAINER_NODE.CONSTRAINT, 4096 /* SINGLE */, container.children)),
                include: true
            };
        }
    }

    var LayoutUI$a = squared.base.LayoutUI;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$e } = squared.base.lib.enumeration;
    class MaxWidthHeight extends squared.base.ExtensionUI {
        is(node) {
            return !node.inputElement && !node.support.maxDimension;
        }
        condition(node, parent) {
            const maxWidth = node.hasPX('maxWidth') && !parent.layoutConstraint && !parent.layoutElement && (parent.layoutVertical ||
                parent.layoutFrame ||
                node.blockStatic ||
                node.onlyChild && (parent.blockStatic || parent.hasWidth));
            const maxHeight = node.hasPX('maxHeight') && (parent.hasHeight || parent.gridElement || parent.tableElement);
            if (maxWidth || maxHeight) {
                node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData', { maxWidth, maxHeight });
                return true;
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, 'mainData');
            if (mainData) {
                const container = this.controller.createNodeWrapper(node, parent, { containerType: CONTAINER_NODE.CONSTRAINT, alignmentType: 64 /* BLOCK */, resetMargin: true });
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
                    outputAs: this.application.renderNode(new LayoutUI$a(parent, container, container.containerType, 4096 /* SINGLE */, container.children))
                };
            }
            return undefined;
        }
    }

    var LayoutUI$b = squared.base.LayoutUI;
    const { BOX_STANDARD: BOX_STANDARD$c, NODE_ALIGNMENT: NODE_ALIGNMENT$f } = squared.base.lib.enumeration;
    function outsideX(node, parent) {
        if (node.pageFlow) {
            return node === parent.firstStaticChild && node.inlineFlow && !node.centerAligned && !node.rightAligned && node.marginLeft < 0 && Math.abs(node.marginLeft) <= parent.marginLeft + parent.paddingLeft && !parent.some(item => item.multiline);
        }
        else {
            return node.leftTopAxis && (node.left < 0 || !node.hasPX('left') && node.right < 0);
        }
    }
    class NegativeX extends squared.base.ExtensionUI {
        is(node) {
            return node.length > 0 && !node.originalRoot && node.css('overflowX') !== 'hidden';
        }
        condition(node) {
            return node.some((item) => outsideX(item, node));
        }
        processNode(node, parent) {
            const children = node.children.filter((item) => outsideX(item, node));
            const container = this.controller.createNodeWrapper(node, parent, { children, containerType: CONTAINER_NODE.CONSTRAINT });
            node.resetBox(2 /* MARGIN_TOP */ | 8 /* MARGIN_BOTTOM */, container);
            let left = NaN;
            let right = NaN;
            let firstChild;
            children.forEach(item => {
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
            });
            if (!node.pageFlow) {
                if (!isNaN(left) && !node.has('left')) {
                    const offset = node.linear.left - left;
                    if (offset > 0) {
                        node.modifyBox(16 /* MARGIN_LEFT */, offset);
                    }
                }
                if (!isNaN(right) && !node.has('right')) {
                    const offset = right - node.linear.right;
                    if (offset > 0) {
                        node.modifyBox(4 /* MARGIN_RIGHT */, offset);
                    }
                }
            }
            else if (node.hasWidth) {
                container.setLayoutWidth('wrap_content');
            }
            node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData', {
                container,
                children,
                offsetLeft: node.marginLeft + node.paddingLeft,
                firstChild
            });
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new LayoutUI$b(parent, container, container.containerType, 8 /* HORIZONTAL */ | 4096 /* SINGLE */, container.children)),
                subscribe: true
            };
        }
        postBaseLayout(node) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData');
            if (mainData) {
                let firstChild = mainData.firstChild;
                if (firstChild) {
                    firstChild = (firstChild.ascend({ excluding: node, attr: 'outerWrapper' }).pop() || firstChild);
                    firstChild.anchor('left', 'parent');
                    firstChild.anchorStyle('horizontal', 0);
                    firstChild.anchorParent('vertical', 0);
                    firstChild.modifyBox(16 /* MARGIN_LEFT */, mainData.offsetLeft);
                    View.setConstraintDimension(firstChild);
                    firstChild.positioned = true;
                }
                mainData.children.forEach(item => {
                    if (item === firstChild) {
                        return;
                    }
                    if (item.hasPX('left')) {
                        item.translateX(item.left);
                        item.alignSibling('left', node.documentId);
                        item.constraint.horizontal = true;
                    }
                    else if (item.hasPX('right')) {
                        item.translateX(-item.right);
                        item.alignSibling('right', node.documentId);
                        item.constraint.horizontal = true;
                    }
                });
                node.anchorParent('horizontal', 0);
                node.anchorParent('vertical', 0);
                View.setConstraintDimension(node);
                node.positioned = true;
            }
        }
        beforeCascade() {
            for (const node of this.subscribers) {
                const mainData = node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, 'mainData');
                if (mainData) {
                    const translateX = node.android('translationX');
                    const translateY = node.android('translationY');
                    if (translateX !== '' || translateY !== '') {
                        const x = parseInt(translateX);
                        const y = parseInt(translateY);
                        mainData.children.forEach(child => {
                            if (!isNaN(x)) {
                                child.translateX(x);
                            }
                            if (!isNaN(y)) {
                                child.translateY(y);
                            }
                        });
                    }
                }
            }
        }
    }

    var LayoutUI$c = squared.base.LayoutUI;
    const { BOX_STANDARD: BOX_STANDARD$d, NODE_ALIGNMENT: NODE_ALIGNMENT$g } = squared.base.lib.enumeration;
    const checkMarginLeft = (node, item) => item.marginLeft < 0 && (node.originalRoot || item.linear.left < Math.floor(node.box.left));
    const checkMarginRight = (node, item) => item.marginRight < 0 && (node.originalRoot || item.linear.right > Math.ceil(node.box.right));
    const checkMarginTop = (node, item) => item.marginTop < 0 && (node.originalRoot || item.linear.top < Math.floor(node.box.top));
    const checkMarginBottom = (node, item) => item.marginBottom < 0 && (node.originalRoot || item.linear.bottom > Math.ceil(node.box.bottom));
    function setFixedNodes(node, contentBox) {
        const documentBody = node.documentBody;
        if (!contentBox && !documentBody) {
            return false;
        }
        const documentRoot = node.originalRoot;
        const expandBody = documentBody && node.positionStatic;
        const children = new Set();
        const paddingTop = node.paddingTop + (documentBody ? node.marginTop : 0);
        const paddingRight = node.paddingRight + (documentBody ? node.marginRight : 0);
        const paddingBottom = node.paddingBottom + (documentBody ? node.marginBottom : 0);
        const paddingLeft = node.paddingLeft + (documentBody ? node.marginLeft : 0);
        let right = false;
        let bottom = false;
        node.each((item) => {
            const fixed = documentRoot && item.css('position') === 'fixed';
            if (item.pageFlow || !contentBox && !fixed) {
                return;
            }
            const fixedPosition = fixed && item.autoPosition;
            if (item.hasPX('left') || fixedPosition) {
                if (documentBody && (item.css('width') === '100%' || item.css('minWidth') === '100%')) {
                    children.add(item);
                    right = true;
                }
                else {
                    const value = item.left;
                    if ((value >= 0 || documentRoot) && value < paddingLeft) {
                        children.add(item);
                    }
                    else if (value < 0 && node.marginLeft > 0) {
                        children.add(item);
                    }
                    else if (!item.hasPX('right') && checkMarginLeft(node, item)) {
                        children.add(item);
                    }
                }
            }
            else if (item.hasPX('right')) {
                if (expandBody) {
                    children.add(item);
                    right = true;
                }
                else {
                    const value = item.right;
                    if ((value >= 0 || documentRoot) && value < paddingRight) {
                        children.add(item);
                    }
                    else if (value < 0 && node.marginRight > 0) {
                        children.add(item);
                    }
                    else if (checkMarginRight(node, item)) {
                        children.add(item);
                    }
                }
            }
            else if (checkMarginLeft(node, item)) {
                children.add(item);
            }
            if (item.hasPX('top') || fixedPosition) {
                if (documentBody && (item.css('height') === '100%' || item.css('minHeight') === '100%')) {
                    children.add(item);
                    bottom = true;
                }
                else {
                    const value = item.top;
                    if ((value >= 0 || documentRoot) && value < paddingTop) {
                        children.add(item);
                    }
                    else if (value < 0 && node.marginTop > 0) {
                        children.add(item);
                    }
                    else if (!item.hasPX('bottom') && checkMarginTop(node, item)) {
                        children.add(item);
                    }
                }
            }
            else if (item.hasPX('bottom')) {
                if (expandBody) {
                    children.add(item);
                    bottom = true;
                }
                else {
                    const value = item.bottom;
                    if ((value >= 0 || documentRoot) && value < paddingBottom) {
                        children.add(item);
                    }
                    else if (value < 0 && node.marginBottom > 0) {
                        children.add(item);
                    }
                    else if (checkMarginBottom(node, item)) {
                        children.add(item);
                    }
                }
            }
            else if (checkMarginTop(node, item)) {
                children.add(item);
            }
        });
        if (children.size) {
            node.data(EXT_ANDROID.DELEGATE_POSITIVEX, 'mainData', { children: Array.from(children), right, bottom });
            return true;
        }
        return false;
    }
    class PositiveX extends squared.base.ExtensionUI {
        is(node) {
            return node.length > 0;
        }
        condition(node) {
            return setFixedNodes(node, node.contentBoxWidth > 0 || node.contentBoxHeight > 0 || node.marginTop > 0 || node.marginRight > 0 || node.marginBottom > 0 || node.marginLeft > 0);
        }
        processNode(node, parent) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_POSITIVEX, 'mainData');
            if (mainData) {
                const container = this.controller.createNodeWrapper(node, parent, {
                    children: mainData.children,
                    resetMargin: !node.originalRoot && !node.pageFlow || parent.layoutGrid,
                    cascade: true,
                    inheritDataset: true
                });
                if (node.documentBody) {
                    if (mainData.right) {
                        container.setLayoutWidth('match_parent');
                    }
                    if (mainData.bottom) {
                        container.setLayoutHeight('match_parent');
                    }
                }
                else if (!node.pageFlow) {
                    if (!node.hasPX('width') && node.hasPX('left') && node.hasPX('right')) {
                        node.setLayoutWidth('match_parent');
                    }
                    if (!node.hasPX('height') && node.hasPX('top') && node.hasPX('bottom')) {
                        node.setLayoutHeight('match_parent');
                    }
                }
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: this.application.renderNode(new LayoutUI$c(parent, container, CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, container.children)),
                    subscribe: true
                };
            }
            return undefined;
        }
        postBaseLayout(node) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_POSITIVEX, 'mainData');
            if (mainData) {
                const documentId = node.documentId;
                mainData.children.forEach(item => {
                    const nested = !item.pageFlow && (item.absoluteParent !== item.documentParent || item.css('position') === 'fixed' || node.documentBody);
                    const wrapper = item.outerMostWrapper;
                    if (item.hasPX('left')) {
                        if (!nested) {
                            item.translateX(item.left);
                            item.alignSibling('left', documentId);
                            item.constraint.horizontal = true;
                        }
                        wrapper.modifyBox(16 /* MARGIN_LEFT */, node.borderLeftWidth);
                    }
                    if (item.hasPX('right')) {
                        if (!nested) {
                            item.translateX(-item.right);
                            item.alignSibling('right', documentId);
                            item.constraint.horizontal = true;
                        }
                        wrapper.modifyBox(4 /* MARGIN_RIGHT */, node.borderRightWidth);
                    }
                    else if (item.marginLeft < 0 && checkMarginLeft(node, item)) {
                        wrapper.alignSibling('left', documentId);
                        wrapper.translateX(item.linear.left - node.bounds.left);
                        wrapper.modifyBox(16 /* MARGIN_LEFT */, node.borderLeftWidth);
                        wrapper.constraint.horizontal = true;
                        item.setBox(16 /* MARGIN_LEFT */, { reset: 1 });
                    }
                    if (item.hasPX('top')) {
                        if (!nested) {
                            item.translateY(item.top);
                            item.alignSibling('top', documentId);
                            item.constraint.vertical = true;
                        }
                        wrapper.modifyBox(2 /* MARGIN_TOP */, node.borderTopWidth);
                    }
                    if (item.hasPX('bottom')) {
                        if (!nested) {
                            item.translateY(-item.bottom);
                            item.alignSibling('bottom', documentId);
                            item.constraint.vertical = true;
                        }
                        wrapper.modifyBox(8 /* MARGIN_BOTTOM */, node.borderBottomWidth);
                    }
                    else if (item.marginTop < 0 && checkMarginTop(node, item)) {
                        wrapper.alignSibling('top', documentId);
                        wrapper.translateY(item.linear.top - node.bounds.top);
                        wrapper.modifyBox(2 /* MARGIN_TOP */, node.borderTopWidth);
                        wrapper.constraint.vertical = true;
                        item.setBox(2 /* MARGIN_TOP */, { reset: 1 });
                    }
                });
            }
        }
    }

    var LayoutUI$d = squared.base.LayoutUI;
    const { CSS_UNIT: CSS_UNIT$3 } = squared.lib.css;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$h } = squared.base.lib.enumeration;
    function hasPercentWidth(node) {
        const value = node.percentWidth;
        return value > 0 && value < 1;
    }
    function hasPercentHeight(node) {
        const value = node.percentHeight;
        return value > 0 && value < 1;
    }
    const isFlexible = (node) => !node.documentParent.layoutElement && !node.display.startsWith('table');
    class Percent extends squared.base.ExtensionUI {
        is(node) {
            return node.pageFlow;
        }
        condition(node, parent) {
            return isFlexible(node) && (hasPercentWidth(node) && !parent.layoutConstraint && (node.cssInitial('width') !== '100%' || node.has('maxWidth', { type: 4 /* PERCENT */, not: '100%' })) && (node.originalRoot || node.hasPX('height') || (parent.layoutVertical || node.onlyChild) && (parent.blockStatic || parent.hasPX('width'))) ||
                hasPercentHeight(node) && (node.cssInitial('height') !== '100%' || node.has('maxHeight', { type: 4 /* PERCENT */, not: '100%' })) && (node.originalRoot || parent.hasHeight));
        }
        processNode(node, parent) {
            const container = this.controller.createNodeWrapper(node, parent, { resetMargin: true });
            if (hasPercentWidth(node)) {
                container.setCacheValue('hasWidth', true);
                container.css('display', 'block');
                container.setLayoutWidth('match_parent');
                node.setLayoutWidth(node.cssInitial('width') === '100%' && !node.hasPX('maxWidth') ? 'match_parent' : '0px');
            }
            else {
                container.setLayoutWidth('wrap_content');
            }
            if (hasPercentHeight(node)) {
                container.setCacheValue('hasHeight', true);
                container.setLayoutHeight('match_parent');
                node.setLayoutHeight(node.cssInitial('height') === '100%' && !node.hasPX('maxHeight') ? 'match_parent' : '0px');
            }
            else {
                container.setLayoutHeight('wrap_content');
            }
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new LayoutUI$d(parent, container, CONTAINER_NODE.CONSTRAINT, 4096 /* SINGLE */, container.children))
            };
        }
    }

    const $base$6 = squared.base;
    const { getElementAsNode: getElementAsNode$1 } = squared.lib.session;
    const { NODE_ALIGNMENT: NODE_ALIGNMENT$i, NODE_RESOURCE: NODE_RESOURCE$7, NODE_TEMPLATE: NODE_TEMPLATE$5 } = $base$6.lib.enumeration;
    const NodeUI$2 = $base$6.NodeUI;
    function setBaselineIndex(children, container) {
        let valid = false;
        const length = children.length;
        let i = 0;
        while (i < length) {
            const item = children[i++];
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
    const getInputName = (element) => { var _a; return ((_a = element.name) === null || _a === void 0 ? void 0 : _a.trim()) || ''; };
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
                else if (!item.visible && radiogroup.includes(item.labelFor)) {
                    last = index;
                }
                if (remove) {
                    removeable.push(remove);
                }
            });
            let length = radiogroup.length;
            if (length > 1) {
                const { target, use } = node.dataset;
                const linearX = NodeUI$2.linearData(parent.children.slice(first, last + 1)).linearX;
                const container = this.controller.createNodeGroup(node, radiogroup, { parent, delegate: true });
                const controlName = CONTAINER_ANDROID.RADIOGROUP;
                container.setControlType(controlName, CONTAINER_NODE.LINEAR);
                if (linearX) {
                    container.addAlign(8 /* HORIZONTAL */ | 128 /* SEGMENTED */);
                    container.android('orientation', 'horizontal');
                }
                else {
                    container.addAlign(16 /* VERTICAL */);
                    container.android('orientation', 'vertical');
                }
                container.inherit(node, 'alignment');
                container.exclude({ resource: NODE_RESOURCE$7.ASSET });
                container.render(target && !use ? this.application.resolveTarget(target) : parent);
                if (!setBaselineIndex(radiogroup, container)) {
                    container.css('verticalAlign', 'middle');
                    container.setCacheValue('baseline', false);
                    container.setCacheValue('verticalAlign', 'middle');
                }
                removeable.forEach(item => item.hide({ remove: true }));
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
                    let i = 0;
                    while (i < length) {
                        const radio = radiogroup[i++];
                        const parents = radio.ascend({ condition: (item) => item.layoutLinear, error: (item) => item.controlName === controlName, every: true });
                        if (parents.length) {
                            parents.forEach(item => data.set(item, (data.get(item) || 0) + 1));
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
                                const template = (_a = renderParent.renderTemplates) === null || _a === void 0 ? void 0 : _a.find(item => (item === null || item === void 0 ? void 0 : item.node) === group);
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

    const $lib$c = squared.lib;
    const { formatPX: formatPX$9 } = $lib$c.css;
    const { BOX_STANDARD: BOX_STANDARD$e, NODE_RESOURCE: NODE_RESOURCE$8, NODE_TEMPLATE: NODE_TEMPLATE$6 } = squared.base.lib.enumeration;
    class ScrollBar extends squared.base.ExtensionUI {
        is(node) {
            return node.length > 0;
        }
        condition(node) {
            return node.overflowX && node.hasPX('width') || node.overflowY && node.hasPX('height') && node.hasHeight;
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
                    children.forEach(child => {
                        if (child.textElement) {
                            child.css('maxWidth', formatPX$9(boxWidth));
                        }
                    });
                }
            }
            const length = overflow.length;
            if (length) {
                for (let i = 0; i < length; ++i) {
                    const container = this.application.createNode({ parent });
                    if (i === 0) {
                        container.inherit(node, 'base', 'initial', 'styleMap');
                        parent.appendTry(node, container);
                    }
                    else {
                        container.inherit(node, 'base');
                        container.exclude({ resource: NODE_RESOURCE$8.BOX_STYLE });
                    }
                    container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                    container.exclude({ resource: NODE_RESOURCE$8.ASSET });
                    container.resetBox(480 /* PADDING */);
                    container.childIndex = node.childIndex;
                    scrollView.push(container);
                }
                for (let i = 0; i < length; ++i) {
                    const item = scrollView[i];
                    switch (item.controlName) {
                        case verticalScroll:
                            node.setLayoutHeight('wrap_content');
                            item.setLayoutHeight(formatPX$9(node.actualHeight));
                            item.android('scrollbars', 'vertical');
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
                            item.android('scrollbars', 'horizontal');
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
                let first = true;
                let item;
                do {
                    item = scrollView.pop();
                    if (first) {
                        parent = item;
                        item.innerWrapped = node;
                        first = false;
                    }
                    else {
                        item.innerWrapped = parent;
                    }
                } while (scrollView.length);
                node.exclude({ resource: NODE_RESOURCE$8.BOX_STYLE });
                node.resetBox(30 /* MARGIN */, item);
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
                    '@': ['left', 'start', 'top', 'right', 'end', 'bottom', 'drawable', 'width', 'height', 'gravity'],
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

    const $lib$d = squared.lib;
    const $base$7 = squared.base;
    const { reduceRGBA } = $lib$d.color;
    const { extractURL: extractURL$1, formatPercent: formatPercent$1, formatPX: formatPX$a, getBackgroundPosition: getBackgroundPosition$1 } = $lib$d.css;
    const { truncate: truncate$6 } = $lib$d.math;
    const { CHAR: CHAR$3, XML: XML$1 } = $lib$d.regex;
    const { delimitString, flatArray, isEqual, objectMap: objectMap$2, resolvePath: resolvePath$1 } = $lib$d.util;
    const { applyTemplate: applyTemplate$1 } = $lib$d.xml;
    const { BOX_STANDARD: BOX_STANDARD$f, NODE_RESOURCE: NODE_RESOURCE$9 } = $base$7.lib.enumeration;
    const NodeUI$3 = $base$7.NodeUI;
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
            return CHAR$3.LOWERCASE.test(value) ? (value === 'initial' ? fallback : value) + ' 0px' : fallback + ' ' + value;
        }
        else if (value === 'initial') {
            return '0px';
        }
        return value;
    }
    function createBackgroundGradient(gradient, api = 21 /* LOLLIPOP */, precision) {
        const type = gradient.type;
        const result = { type, item: false, positioning: true };
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
                result.endX = truncate$6(positionX, precision);
                result.endY = truncate$6(positionY, precision);
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
    function createLayerList(boxStyle, images, borderOnly = true) {
        const item = [];
        const result = [{ 'xmlns:android': XMLNS_ANDROID.android, item }];
        const solid = !borderOnly && getBackgroundColor(boxStyle.backgroundColor);
        if (solid) {
            item.push({ shape: { 'android:shape': 'rectangle', solid } });
        }
        if (images) {
            images.forEach(image => {
                const gradient = image.gradient;
                item.push(gradient ? { shape: { 'android:shape': 'rectangle', gradient } } : image);
            });
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
    function convertColorStops(list, precision) {
        return objectMap$2(list, item => ({ color: getColorValue(item.color), offset: truncate$6(item.offset, precision) }));
    }
    function drawRect(width, height, x = 0, y = 0, precision) {
        if (precision) {
            x = truncate$6(x, precision);
            y = truncate$6(y, precision);
            width = truncate$6(x + width, precision);
            height = truncate$6(y + height, precision);
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
            this._resourceSvgInstance = this.controller.localSettings.svg.enabled ? this.application.builtInExtensions[EXT_ANDROID.RESOURCE_SVG] : undefined;
        }
        afterResources() {
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
                        'android:fitsSystemWindows': 'true'
                    }
                });
                themeBackground = true;
            };
            const deleteBodyWrapper = (body, wrapper) => {
                if (body !== wrapper && !wrapper.hasResource(NODE_RESOURCE$9.BOX_SPACING) && body.percentWidth === 0) {
                    switch (body.cssInitial('maxWidth')) {
                        case '':
                        case 'auto':
                        case '100%': {
                            const children = wrapper.renderChildren;
                            if (children.length === 1) {
                                wrapper.removeTry(children[0]);
                            }
                            break;
                        }
                    }
                }
            };
            const setDrawableBackground = (node, value) => {
                if (value !== '') {
                    const drawable = '@drawable/' + Resource.insertStoredAsset('drawables', `${node.containerName.toLowerCase()}_${node.controlId}`, value);
                    if (!themeBackground) {
                        if (node.tagName === 'HTML') {
                            setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                            return;
                        }
                        else {
                            const innerWrapped = node.innerMostWrapped;
                            if (innerWrapped.documentBody && (node.backgroundColor !== '' || node.visibleStyle.backgroundRepeatY)) {
                                setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                                deleteBodyWrapper(innerWrapped, node);
                                return;
                            }
                        }
                    }
                    node.android('background', drawable, false);
                }
            };
            this.cacheProcessing.each(node => {
                var _a;
                const stored = node.data(Resource.KEY_NAME, 'boxStyle');
                if (stored) {
                    if (node.inputElement) {
                        const companion = node.companion;
                        if ((companion === null || companion === void 0 ? void 0 : companion.tagName) === 'LABEL' && !companion.visible) {
                            const backgroundColor = (_a = companion.data(Resource.KEY_NAME, 'boxStyle')) === null || _a === void 0 ? void 0 : _a.backgroundColor;
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
                            if (!shapeData) {
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
                                if (!themeBackground) {
                                    if (node.tagName === 'HTML') {
                                        setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, color);
                                        return;
                                    }
                                    else {
                                        const innerWrapped = node.innerMostWrapped;
                                        if (innerWrapped.documentBody) {
                                            setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, color);
                                            deleteBodyWrapper(innerWrapped, node);
                                            return;
                                        }
                                    }
                                }
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
            });
        }
        getDrawableBorder(data, outline, images, indentWidth = 0, borderOnly = false) {
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
                for (let i = 0; i < 4; ++i) {
                    borders[i] = outline;
                    borderVisible[i] = true;
                }
            }
            else {
                borders[0] = data.borderTop;
                borders[1] = data.borderRight;
                borders[2] = data.borderBottom;
                borders[3] = data.borderLeft;
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
            if (border && !isAlternatingBorder(border.style, roundFloat(border.width)) && !(border.style === 'double' && parseInt(border.width) > 1) || !borderData && (corners || (images === null || images === void 0 ? void 0 : images.length))) {
                const stroke = border ? getBorderStroke(border) : false;
                if ((images === null || images === void 0 ? void 0 : images.length) || indentWidth > 0 || borderOnly) {
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
                const backgroundPositionX = data.backgroundPositionX.split(XML$1.SEPARATOR);
                const backgroundPositionY = data.backgroundPositionY.split(XML$1.SEPARATOR);
                let backgroundRepeat = data.backgroundRepeat.split(XML$1.SEPARATOR);
                let backgroundSize = data.backgroundSize.split(XML$1.SEPARATOR);
                let length = 0;
                if (backgroundImage) {
                    const svgInstance = this._resourceSvgInstance;
                    const q = backgroundImage.length;
                    backgroundRepeat = fillBackgroundAttribute(backgroundRepeat, q);
                    backgroundSize = fillBackgroundAttribute(backgroundSize, q);
                    let modified = false;
                    for (let i = 0; i < q; ++i) {
                        let value = backgroundImage[i];
                        let valid = false;
                        if (typeof value === 'string') {
                            if (value !== 'initial') {
                                if (svgInstance) {
                                    const [parentElement, element] = svgInstance.createSvgElement(node, value);
                                    if (parentElement && element) {
                                        const drawable = svgInstance.createSvgDrawable(node, element);
                                        if (drawable !== '') {
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
                                    if (uri !== '') {
                                        if (uri.startsWith('data:image/')) {
                                            const rawData = resource.getRawData(uri);
                                            if (rawData) {
                                                const { base64, filename } = rawData;
                                                if (base64) {
                                                    images[length] = filename.substring(0, filename.lastIndexOf('.'));
                                                    imageDimensions[length] = rawData.width && rawData.height ? { width: rawData.width, height: rawData.height } : undefined;
                                                    resource.writeRawImage(filename, base64);
                                                    valid = true;
                                                }
                                            }
                                        }
                                        else {
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
                            backgroundPosition[length] = getBackgroundPosition$1(checkBackgroundPosition(x, y, 'left') + ' ' + checkBackgroundPosition(y, x, 'top'), node.actualDimension, {
                                fontSize,
                                imageDimension: imageDimensions[length],
                                imageSize: backgroundSize[i],
                                screenDimension
                            });
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
                if (embedded) {
                    if (length === 0) {
                        backgroundRepeat.length = 0;
                        backgroundSize.length = 0;
                    }
                    embedded.filter(item => item.visible && (item.imageElement || item.containerName === 'INPUT_IMAGE')).forEach(image => {
                        const element = image.element;
                        const src = resource.addImageSrc(element);
                        if (src !== '') {
                            const imageDimension = image.bounds;
                            images[length] = src;
                            backgroundRepeat[length] = 'no-repeat';
                            backgroundSize[length] = getPixelUnit(image.actualWidth, image.actualHeight);
                            const position = getBackgroundPosition$1(image.containerName === 'INPUT_IMAGE' ? getPixelUnit(0, 0) : getPixelUnit(imageDimension.left - bounds.left + node.borderLeftWidth, imageDimension.top - bounds.top + node.borderTopWidth), node.actualDimension, {
                                fontSize,
                                imageDimension,
                                screenDimension
                            });
                            const stored = resource.getImage(element.src);
                            if (!node.hasPX('width')) {
                                const offsetStart = ((stored === null || stored === void 0 ? void 0 : stored.width) || 0) + position.left - (node.paddingLeft + node.borderLeftWidth);
                                if (offsetStart > 0) {
                                    node.modifyBox(256 /* PADDING_LEFT */, offsetStart);
                                }
                            }
                            imageDimensions[length] = stored;
                            backgroundPosition[length] = position;
                            length++;
                        }
                    });
                }
                const { backgroundClip, backgroundOrigin } = data;
                const documentBody = node.innerMostWrapped.documentBody;
                for (let i = length - 1, j = 0; i >= 0; --i) {
                    const value = images[i];
                    const imageData = { order: Number.POSITIVE_INFINITY };
                    if (typeof value === 'object' && !value.positioning) {
                        imageData.gravity = 'fill';
                        imageData.gradient = value;
                        continue;
                    }
                    const position = backgroundPosition[i];
                    const size = backgroundSize[i];
                    const padded = position.orientation.length === 4;
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
                    let posTop = NaN;
                    let posRight = NaN;
                    let posBottom = NaN;
                    let posLeft = NaN;
                    let negativeOffset = 0;
                    let offsetX = false;
                    let offsetY = false;
                    let width = 0;
                    let height = 0;
                    let tileModeX = '';
                    let tileModeY = '';
                    let gravityX = '';
                    let gravityY = '';
                    let gravityAlign = '';
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
                            }
                            else {
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
                            }
                            else {
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
                                        if (index === 0) {
                                            gravityAlign = 'fill_horizontal';
                                        }
                                        else {
                                            gravityAlign = delimitString({ value: gravityAlign }, 'fill_vertical');
                                        }
                                    }
                                    else if (dimen !== 'auto') {
                                        if (index === 0) {
                                            if (tileModeX !== 'repeat') {
                                                width = node.parseWidth(dimen, false);
                                            }
                                        }
                                        else if (tileModeY !== 'repeat') {
                                            height = node.parseHeight(dimen, false);
                                        }
                                    }
                                });
                            }
                            break;
                    }
                    let bitmap = svg[i] !== true;
                    let autoFit = node.is(CONTAINER_NODE.IMAGE) || typeof value !== 'string';
                    let resizedWidth = false;
                    let resizedHeight = false;
                    let unsizedWidth = false;
                    let unsizedHeight = false;
                    let recalibrate = true;
                    if (dimension) {
                        let fittedWidth = boundsWidth;
                        let fittedHeight = boundsHeight;
                        if (size !== 'contain') {
                            if (!node.hasWidth) {
                                const innerWidth = window.innerWidth;
                                const screenWidth = screenDimension.width;
                                const getFittedWidth = () => boundsHeight * (fittedWidth / boundsWidth);
                                if (boundsWidth === innerWidth) {
                                    if (innerWidth >= screenWidth) {
                                        fittedWidth = screenWidth;
                                        fittedHeight = getFittedWidth();
                                    }
                                    else {
                                        ({ width: fittedWidth, height: fittedHeight } = NodeUI$3.refitScreen(node, bounds));
                                    }
                                }
                                else if (innerWidth >= screenWidth) {
                                    fittedWidth = node.actualBoxWidth(boundsWidth);
                                    fittedHeight = getFittedWidth();
                                }
                            }
                        }
                        const ratioWidth = dimenWidth / fittedWidth;
                        const ratioHeight = dimenHeight / fittedHeight;
                        const getImageWidth = () => dimenWidth * height / dimenHeight;
                        const getImageHeight = () => dimenHeight * width / dimenWidth;
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
                                        if (!node.hasPX('height')) {
                                            node.css('height', formatPX$a(boundsHeight - node.contentBoxHeight));
                                        }
                                        if (!offsetX) {
                                            gravityAlign = 'center_horizontal|fill_horizontal';
                                        }
                                    }
                                    else {
                                        if (height < boundsHeight) {
                                            width = fittedWidth * boundsHeight / height;
                                            height = boundsHeight;
                                        }
                                        if (!offsetX) {
                                            gravityAlign = 'center_horizontal|fill';
                                        }
                                    }
                                }
                                else if (ratioWidth > ratioHeight) {
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
                                    }
                                    else {
                                        if (width < boundsWidth) {
                                            width = boundsWidth;
                                            height = fittedHeight * boundsWidth / width;
                                        }
                                        if (!offsetY) {
                                            gravityAlign = 'center_vertical|fill';
                                        }
                                    }
                                    offsetX = false;
                                }
                                else {
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
                                }
                                else if (ratioWidth < ratioHeight) {
                                    width = getImageRatioWidth();
                                    height = dimenHeight < boundsHeight ? getImageHeight() : boundsHeight;
                                    gravityX = 'center_horizontal';
                                    gravityAlign = 'fill_vertical';
                                }
                                else {
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
                    if (backgroundClip) {
                        const { top: clipTop, right: clipRight, left: clipLeft, bottom: clipBottom } = backgroundClip;
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
                        if (!isNaN(posRight)) {
                            right += clipRight;
                        }
                        else {
                            left += clipLeft;
                        }
                        if (!isNaN(posBottom)) {
                            bottom += clipBottom;
                        }
                        else {
                            top += clipTop;
                        }
                        gravityX = '';
                        gravityY = '';
                    }
                    else if (recalibrate) {
                        if (backgroundOrigin) {
                            if (tileModeX !== 'repeat') {
                                if (!isNaN(posRight)) {
                                    right += backgroundOrigin.right;
                                }
                                else {
                                    left += backgroundOrigin.left;
                                }
                            }
                            if (tileModeY !== 'repeat') {
                                if (!isNaN(posBottom)) {
                                    bottom += backgroundOrigin.bottom;
                                }
                                else {
                                    top += backgroundOrigin.top;
                                }
                            }
                        }
                        if (!autoFit && !documentBody) {
                            if (dimenWidth > boundsWidth) {
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
                                            }
                                            else {
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
                                            }
                                            else {
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
                                    gravityAlign = delimitString({ value: gravityAlign, not: ['fill'] }, 'fill_horizontal');
                                }
                                if (tileModeX !== 'disabled') {
                                    tileModeX = '';
                                }
                                resizedWidth = true;
                            }
                            if (dimenHeight > boundsHeight) {
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
                                            }
                                            else {
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
                                    gravityAlign = delimitString({ value: gravityAlign, not: ['fill'] }, 'fill_vertical');
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
                                    }
                                    else if (unsizedHeight) {
                                        width = dimenWidth;
                                        gravityAlign = delimitString({ value: gravityAlign, not: ['fill'] }, 'fill_horizontal');
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
                                    if (node.renderChildren.length) {
                                        tileModeY = '';
                                    }
                                    break;
                                case 'right':
                                case 'end':
                                    if (height > 0 && !unsizedHeight) {
                                        tileModeY = '';
                                    }
                                    else if (unsizedWidth) {
                                        height = dimenHeight;
                                        gravityAlign = delimitString({ value: gravityAlign, not: ['fill'] }, 'fill_vertical');
                                        if (dimenWidth >= dimenHeight) {
                                            tileModeY = '';
                                        }
                                    }
                                    break;
                            }
                            gravityY = '';
                        }
                        if (gravityX !== '' && !resizedWidth) {
                            gravityAlign = delimitString({ value: gravityAlign }, gravityX);
                            gravityX = '';
                        }
                        if (gravityY !== '' && !resizedHeight) {
                            gravityAlign = delimitString({ value: gravityAlign }, gravityY);
                            gravityY = '';
                        }
                    }
                    else if (width === 0 && height === 0 && gravityAlign === 'fill') {
                        bitmap = false;
                    }
                    let src;
                    if (typeof value === 'string') {
                        src = `@drawable/${value}`;
                    }
                    else if (value.item) {
                        if (width === 0) {
                            width = (dimension === null || dimension === void 0 ? void 0 : dimension.width) || NodeUI$3.refitScreen(node, node.actualDimension).width;
                        }
                        if (height === 0) {
                            height = (dimension === null || dimension === void 0 ? void 0 : dimension.height) || NodeUI$3.refitScreen(node, node.actualDimension).height;
                        }
                        const gradient = Resource.insertStoredAsset('drawables', `${node.controlId}_gradient_${i + 1}`, applyTemplate$1('vector', VECTOR_TMPL, [{
                                'xmlns:android': XMLNS_ANDROID.android,
                                'xmlns:aapt': XMLNS_ANDROID.aapt,
                                'android:width': formatPX$a(width),
                                'android:height': formatPX$a(height),
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
                        if (gradient !== '') {
                            src = `@drawable/${gradient}`;
                            imageData.order = j++;
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
                            }
                            else if (tileModeX === 'repeat') {
                                if (gravityAlign === 'fill_vertical') {
                                    gravityAlign = 'fill';
                                }
                                else {
                                    gravityAlign = 'fill_horizontal';
                                }
                            }
                            else if (tileModeY === 'repeat') {
                                if (gravityAlign === 'fill_horizontal') {
                                    gravityAlign = 'fill';
                                }
                                else {
                                    gravityAlign = 'fill_vertical';
                                }
                            }
                        }
                    }
                    const gravity = gravityX === 'center_horizontal' && gravityY === 'center_vertical' ? 'center' : delimitString({ value: gravityX }, gravityY);
                    if (src) {
                        if (bitmap && (!autoFit && (gravityAlign !== '' && gravity !== '' || tileModeX === 'repeat' || tileModeY === 'repeat' || documentBody) || unsizedWidth || unsizedHeight)) {
                            let tileMode = '';
                            if (tileModeX === 'disabled' && tileModeY === 'disabled') {
                                tileMode = 'disabled';
                                tileModeX = '';
                                tileModeY = '';
                            }
                            else if (tileModeX === 'repeat' && tileModeY === 'repeat') {
                                tileMode = 'repeat';
                                tileModeX = '';
                                tileModeY = '';
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
                            imageData.gravity = delimitString({ value: gravity }, gravityAlign);
                            imageData.drawable = src;
                        }
                        if (imageData.drawable || imageData.bitmap || imageData.gradient) {
                            if (!isNaN(posBottom)) {
                                if (offsetY) {
                                    bottom += position.bottom;
                                }
                                bottom += posBottom;
                                if (bottom !== 0) {
                                    imageData.bottom = formatPX$a(bottom);
                                }
                                if (negativeOffset < 0) {
                                    imageData.top = formatPX$a(negativeOffset);
                                }
                            }
                            else {
                                if (offsetY) {
                                    top += position.top;
                                }
                                if (!isNaN(posTop)) {
                                    top += posTop;
                                }
                                if (top !== 0) {
                                    imageData.top = formatPX$a(top);
                                }
                                if (negativeOffset < 0) {
                                    imageData.bottom = formatPX$a(negativeOffset);
                                }
                            }
                            if (!isNaN(posRight)) {
                                if (offsetX) {
                                    right += position.right;
                                }
                                right += posRight;
                                if (right !== 0) {
                                    imageData[node.localizeString('right')] = formatPX$a(right);
                                }
                                if (negativeOffset < 0) {
                                    imageData[node.localizeString('left')] = formatPX$a(negativeOffset);
                                }
                            }
                            else {
                                if (offsetX) {
                                    left += position.left;
                                }
                                if (!isNaN(posLeft)) {
                                    left += posLeft;
                                }
                                if (left !== 0) {
                                    imageData[node.localizeString('left')] = formatPX$a(left);
                                }
                                if (negativeOffset < 0) {
                                    imageData[node.localizeString('right')] = formatPX$a(negativeOffset);
                                }
                            }
                            if (width > 0) {
                                imageData.width = formatPX$a(width);
                            }
                            if (height > 0) {
                                imageData.height = formatPX$a(height);
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
        beforeCascade(documentRoot) {
            const viewModel = this.application.viewModel;
            if (viewModel) {
                const controller = this.controller;
                const applied = new Set();
                this.cache.each(node => {
                    if (node.styleElement && node.visible) {
                        node.unsafe('namespaces').forEach((name) => {
                            const dataset = getDataSet(node.dataset, `viewmodel${capitalize$3(name)}`);
                            if (dataset) {
                                for (const attr in dataset) {
                                    node.attr(name, attr, `@{${dataset[attr]}}`, true);
                                }
                                applied.add(node);
                            }
                        });
                    }
                });
                if (applied.size) {
                    documentRoot.forEach(root => {
                        const node = root.node;
                        for (const child of applied) {
                            if (child.ascend({ condition: item => item === node, attr: 'renderParent' }).length) {
                                const { import: importing, variable } = viewModel;
                                const { depth, id } = node;
                                const indentA = '\t'.repeat(depth);
                                const indentB = '\t'.repeat(depth + 1);
                                const indentC = '\t'.repeat(depth + 2);
                                let output = indentA + '<layout {#0}>\n' +
                                    indentB + '<data>\n';
                                if (importing) {
                                    importing.forEach(name => output += indentC + `<import type="${name}" />\n`);
                                }
                                if (variable) {
                                    variable.forEach(data => output += indentC + `<variable name="${data.name}" type="${data.type}" />\n`);
                                }
                                output += indentB + '</data>\n';
                                controller.addBeforeOutsideTemplate(id, output);
                                controller.addAfterOutsideTemplate(id, indentA + '</layout>\n');
                                node.depth = depth - 1;
                                applied.delete(child);
                                break;
                            }
                        }
                    });
                }
            }
        }
    }

    const $lib$e = squared.lib;
    const { XML: XML$2 } = $lib$e.regex;
    const { convertUnderscore, fromLastIndexOf: fromLastIndexOf$3, safeNestedArray: safeNestedArray$2, safeNestedMap } = $lib$e.util;
    const STORED$2 = Resource.STORED;
    const REGEX_UNIT = /\dpx$/;
    const REGEX_UNIT_ATTR = /:(\w+)="(-?[\d.]+px)"/;
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
                if (REGEX_UNIT.test(value)) {
                    safeNestedArray$2(group, `${namespace},${attr},${value}`).push(node);
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
            this.cache.each(node => {
                if (node.visible) {
                    const containerName = node.containerName.toLowerCase();
                    const group = safeNestedMap(groups, containerName);
                    createNamespaceData('android', node, group);
                    createNamespaceData('app', node, group);
                }
            });
            for (const containerName in groups) {
                const group = groups[containerName];
                for (const name in group) {
                    const [namespace, attr, value] = name.split(XML$2.SEPARATOR);
                    const key = getResourceName(dimens, getDisplayName(containerName) + '_' + convertUnderscore(attr), value);
                    group[name].forEach(node => node[namespace](attr, `@dimen/${key}`));
                    dimens.set(key, value);
                }
            }
        }
        afterFinalize() {
            if (this.controller.hasAppendProcessing()) {
                const dimens = STORED$2.dimens;
                this.application.layouts.forEach(layout => {
                    let content = layout.content;
                    let match;
                    while ((match = REGEX_UNIT_ATTR.exec(content)) !== null) {
                        const [original, name, value] = match;
                        if (name !== 'text') {
                            const key = getResourceName(dimens, `custom_${convertUnderscore(name)}`, value);
                            content = content.replace(original, original.replace(value, `@dimen/${key}`));
                            dimens.set(key, value);
                        }
                    }
                    layout.content = content;
                });
            }
        }
    }

    const $lib$f = squared.lib;
    const { XML: XML$3 } = $lib$f.regex;
    const { capitalize: capitalize$4, convertInt: convertInt$3, convertWord: convertWord$1, safeNestedArray: safeNestedArray$3, safeNestedMap: safeNestedMap$1, objectMap: objectMap$3, spliceArray: spliceArray$1, trimBoth } = $lib$f.util;
    const { NODE_RESOURCE: NODE_RESOURCE$a } = squared.base.lib.enumeration;
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
        'arial black': 'sans-serif',
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
    const FONT_STYLEKEYS = Object.keys(FONT_STYLE);
    function deleteStyleAttribute(sorted, attrs, ids) {
        const length = sorted.length;
        attrs.split(';').forEach(value => {
            for (let i = 0; i < length; ++i) {
                let data = sorted[i];
                let index = -1;
                let key = '';
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
                    data[key] = data[key].filter(id => !ids.includes(id));
                    if (data[key].length === 0) {
                        delete data[key];
                    }
                    break;
                }
            }
        });
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
            const resource = this.resource;
            const disableFontAlias = this.options.disableFontAlias;
            const convertPixels = resource.userSettings.convertPixels === 'dp';
            const { fonts, styles } = STORED$3;
            const nameMap = {};
            const groupMap = {};
            let cache = [];
            this.cache.each(node => {
                if (node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource(NODE_RESOURCE$a.FONT_STYLE)) {
                    safeNestedArray$3(nameMap, node.containerName).push(node);
                }
            });
            for (const tag in nameMap) {
                const sorted = [];
                const data = nameMap[tag];
                cache = cache.concat(data);
                data.forEach(node => {
                    const { id, companion, api } = node;
                    const stored = node.data(Resource.KEY_NAME, 'fontStyle');
                    let { fontFamily, fontStyle, fontWeight } = stored;
                    if ((companion === null || companion === void 0 ? void 0 : companion.tagName) === 'LABEL' && !companion.visible) {
                        node = companion;
                    }
                    fontFamily.replace(REGEX_DOUBLEQUOTE, '').split(XML$3.SEPARATOR).some((value, index, array) => {
                        value = trimBoth(value, "'").toLowerCase();
                        let fontName = value;
                        let actualFontWeight = '';
                        if (!disableFontAlias && FONTREPLACE_ANDROID[fontName]) {
                            fontName = this.options.systemDefaultFont;
                        }
                        if (api >= FONT_ANDROID[fontName] || !disableFontAlias && api >= FONT_ANDROID[FONTALIAS_ANDROID[fontName]]) {
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
                                    fontFamily = this.options.systemDefaultFont;
                                }
                            }
                            if (createFont) {
                                fontName = convertWord$1(fontName);
                                const font = fonts.get(fontName) || {};
                                font[value + '|' + fontStyle + '|' + fontWeight] = FONTWEIGHT_ANDROID[fontWeight] || fontWeight;
                                fonts.set(fontName, font);
                                fontFamily = `@font/${fontName}`;
                            }
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
                    for (let i = 0; i < 6; ++i) {
                        const key = FONT_STYLEKEYS[i];
                        let value = fontData[key];
                        if (value) {
                            if (i === 3 && convertPixels) {
                                value = convertLength(value, true);
                            }
                            safeNestedArray$3(safeNestedMap$1(sorted, i), FONT_STYLE[key] + value + '"').push(id);
                        }
                    }
                });
                groupMap[tag] = sorted;
            }
            const style = {};
            for (const tag in groupMap) {
                const styleTag = {};
                style[tag] = styleTag;
                const sorted = groupMap[tag].filter(item => !!item).sort((a, b) => {
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
                        break;
                    }
                    else {
                        const styleKey = {};
                        for (let i = 0; i < sorted.length; ++i) {
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
                                for (let j = 0; j < sorted.length; ++j) {
                                    if (i !== j) {
                                        const dataB = sorted[j];
                                        for (const attr in dataB) {
                                            const compare = dataB[attr];
                                            if (compare.length) {
                                                ids.forEach(id => {
                                                    if (compare.includes(id)) {
                                                        safeNestedArray$3(found, attr).push(id);
                                                    }
                                                });
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
                                            attrB.split(';').forEach(value => data.add(value));
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
                    attrs.split(';').forEach(value => {
                        const match = XML$3.ATTRIBUTE.exec(value);
                        if (match) {
                            items.push({ key: match[1], value: match[2] });
                        }
                    });
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
                        c = a.items.length;
                        d = b.items.length;
                        if (c === d) {
                            c = a.name;
                            d = b.name;
                        }
                    }
                    return c <= d ? 1 : -1;
                });
                const length = styleData.length;
                for (let i = 0; i < length; ++i) {
                    styleData[i].name = capitalize$4(tag) + (i > 0 ? '_' + i : '');
                }
                resourceMap[tag] = styleData;
            }
            for (const tag in resourceMap) {
                resourceMap[tag].forEach(group => { var _a; return (_a = group.ids) === null || _a === void 0 ? void 0 : _a.forEach(id => safeNestedArray$3(nodeMap, id).push(group.name)); });
            }
            cache.forEach(node => {
                const styleData = nodeMap[node.id];
                if (styleData) {
                    if (styleData.length > 1) {
                        parentStyle.add(styleData.join('.'));
                        styleData.shift();
                    }
                    else {
                        parentStyle.add(styleData[0]);
                    }
                    node.attr('_', 'style', `@style/${styleData.join('.')}`);
                }
            });
            parentStyle.forEach(value => {
                const styleName = [];
                let parent = '';
                let items;
                value.split('.').forEach((name, index, array) => {
                    const match = REGEX_TAGNAME.exec(name);
                    if (match) {
                        const styleData = resourceMap[match[1].toUpperCase()][convertInt$3(match[2])];
                        if (styleData) {
                            if (index === 0) {
                                parent = name;
                                if (array.length === 1) {
                                    items = styleData.items;
                                }
                                else if (!styles.has(name)) {
                                    styles.set(name, { name, parent: '', items: styleData.items });
                                }
                            }
                            else {
                                if (items) {
                                    styleData.items.forEach(item => {
                                        const key = item.key;
                                        const previousIndex = items.findIndex(previous => previous.key === key);
                                        if (previousIndex !== -1) {
                                            items[previousIndex] = item;
                                        }
                                        else {
                                            items.push(item);
                                        }
                                    });
                                }
                                else {
                                    items = styleData.items.slice(0);
                                }
                                styleName.push(name);
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
            });
        }
    }

    const { NODE_TEMPLATE: NODE_TEMPLATE$7 } = squared.base.lib.enumeration;
    class ResourceIncludes extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade() {
            this.cache.each((node) => {
                const renderTemplates = node.renderTemplates;
                if (renderTemplates) {
                    let open;
                    let close;
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
                                include: dataset.androidIncludeMerge === 'false'
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
                        const length = Math.min(open.length, close.length);
                        const excess = close.length - length;
                        if (excess > 0) {
                            close.splice(0, excess);
                        }
                        let i = length - 1;
                        while (i >= 0) {
                            const { index, include, item, name } = open[i--];
                            for (let j = 0; j < close.length; ++j) {
                                const q = close[j].index;
                                if (q >= index) {
                                    const templates = [];
                                    let k = index;
                                    while (k <= q) {
                                        templates.push(renderTemplates[k++]);
                                    }
                                    const merge = !include || templates.length > 1;
                                    const depth = merge ? 1 : 0;
                                    renderTemplates.splice(index, templates.length, {
                                        type: 2 /* INCLUDE */,
                                        node: templates[0].node,
                                        content: controller.renderNodeStatic({ controlName: 'include', width: 'match_parent' }, { layout: `@layout/${name}`, android: {} }),
                                        indent: true
                                    });
                                    let content = controller.cascadeDocument(templates, depth);
                                    if (merge) {
                                        content = controller.getEnclosingXmlTag('merge', getRootNs(content), content);
                                    }
                                    else {
                                        item.documentRoot = true;
                                    }
                                    application.saveDocument(name, content, '', Number.POSITIVE_INFINITY);
                                    close.splice(j, 1);
                                    break;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    const $lib$g = squared.lib;
    const { formatPX: formatPX$b } = $lib$g.css;
    const { measureTextWidth } = $lib$g.dom;
    const { capitalizeString, lowerCaseString, isNumber: isNumber$2, isString: isString$4 } = $lib$g.util;
    const { STRING_SPACE: STRING_SPACE$1, replaceCharacterData } = $lib$g.xml;
    const { NODE_RESOURCE: NODE_RESOURCE$b } = squared.base.lib.enumeration;
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
            const numberResourceValue = this.options.numberResourceValue;
            const setTextValue = (node, attr, name, value) => {
                name = Resource.addString(value, name, numberResourceValue);
                if (name !== '') {
                    node.android(attr, numberResourceValue || !isNumber$2(name) ? `@string/${name}` : name, false);
                }
            };
            this.cacheProcessing.each(node => {
                if (node.hasResource(NODE_RESOURCE$b.VALUE_STRING)) {
                    switch (node.tagName) {
                        case 'SELECT': {
                            const name = this.createOptionArray(node.element, node.controlId);
                            if (name !== '') {
                                node.android('entries', `@array/${name}`);
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
                                    let value = valueString.value;
                                    const name = valueString.key || value;
                                    if (node.naturalChild && node.alignParent('left') && node.pageFlow && !(node.preserveWhiteSpace && !node.plainText || node.plainText && node.actualParent.preserveWhiteSpace)) {
                                        let leadingSpace = 0;
                                        const textContent = node.textContent;
                                        const length = textContent.length;
                                        let i = 0;
                                        while (i < length) {
                                            switch (textContent.charCodeAt(i++)) {
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
                                        textDecorationLine.split(' ').forEach(style => {
                                            switch (style) {
                                                case 'underline':
                                                    value = `<u>${value}</u>`;
                                                    break;
                                                case 'line-through':
                                                    value = `<strike>${value}</strike>`;
                                                    break;
                                            }
                                        });
                                    }
                                    if (tagName === 'INS' && !textDecorationLine.includes('line-through')) {
                                        value = `<strike>${value}</strike>`;
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
                                            if ((parent === null || parent === void 0 ? void 0 : parent.firstChild) === node && (parent.blockDimension || parent.display === 'table-cell')) {
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
                        const title = node.data(Resource.KEY_NAME, 'titleString') || node.toElementString('title');
                        if (title !== '') {
                            setTextValue(node, 'tooltipText', `${node.controlId.toLowerCase()}_title`, title);
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
            }
            else {
                const resourceArray = stringArray || numberArray;
                if (resourceArray) {
                    result = [];
                    resourceArray.forEach(value => {
                        value = Resource.addString(replaceCharacterData(value), '', numberResourceValue);
                        if (value !== '') {
                            result.push(`@string/${value}`);
                        }
                    });
                }
            }
            return (result === null || result === void 0 ? void 0 : result.length) ? Resource.insertStoredAsset('arrays', `${controlId}_array`, result) : '';
        }
    }

    const $lib$h = squared.lib;
    const { XML: XML$4 } = $lib$h.regex;
    const { capitalize: capitalize$5, trimString: trimString$1 } = $lib$h.util;
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
            this.cache.each(node => {
                if (node.controlId && node.visible) {
                    const renderChildren = node.renderChildren;
                    const length = renderChildren.length;
                    if (length > 1) {
                        const attrMap = new Map();
                        let valid = true;
                        let style = '';
                        let i = 0;
                        while (i < length) {
                            const item = renderChildren[i++];
                            let found = false;
                            const combined = item.combine('_', 'android');
                            const q = combined.length;
                            let j = 0;
                            while (j < q) {
                                const value = combined[j++];
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
                                    style = trimString$1(style.substring(style.indexOf('/') + 1), '"');
                                }
                                const common = [];
                                for (const attr of attrMap.keys()) {
                                    const match = REGEX_ATTRIBUTE.exec(attr);
                                    if (match) {
                                        renderChildren.forEach(item => item.delete(match[1], match[2]));
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
                                    name = (style !== '' ? style + '.' : '') + capitalize$5(node.controlId);
                                    styles[name] = common;
                                    styleCache[name] = commonString;
                                }
                                renderChildren.forEach(item => item.attr('_', 'style', `@style/${name}`));
                            }
                        }
                    }
                }
            });
            for (const name in styles) {
                const items = [];
                styles[name].forEach(style => {
                    const match = XML$4.ATTRIBUTE.exec(style);
                    if (match) {
                        items.push({ key: match[1], value: match[2] });
                    }
                });
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
    const $lib$i = squared.lib;
    const $svg_lib = squared.svg.lib;
    const { extractURL: extractURL$2, formatPX: formatPX$c, isPercent: isPercent$3 } = $lib$i.css;
    const { truncate: truncate$7 } = $lib$i.math;
    const { CHAR: CHAR$4, FILE: FILE$1 } = $lib$i.regex;
    const { convertCamelCase: convertCamelCase$1, convertInt: convertInt$4, convertWord: convertWord$2, formatString, isArray: isArray$1, isNumber: isNumber$3, isString: isString$5, objectMap: objectMap$4, partitionArray: partitionArray$1, replaceMap: replaceMap$1 } = $lib$i.util;
    const { applyTemplate: applyTemplate$2 } = $lib$i.xml;
    const { KEYSPLINE_NAME, SYNCHRONIZE_MODE } = $svg_lib.constant;
    const { MATRIX, SVG, TRANSFORM } = $svg_lib.util;
    const NodeUI$4 = squared.base.NodeUI;
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
        else {
            const name = `path_interpolator_${convertWord$2(value)}`;
            if (!STORED$5.animators.has(name)) {
                STORED$5.animators.set(name, formatString(INTERPOLATOR_XML, ...value.split(CHAR$4.SPACE)));
            }
            return `@anim/${name}`;
        }
    }
    function createTransformData(transform) {
        const result = {};
        transform.forEach(item => {
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
        });
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
        getViewport(element).forEach(parent => {
            if ((SVG.svg(parent) || SVG.use(parent)) && parent !== rootElement) {
                x += parent.x.baseVal.value;
                y += parent.y.baseVal.value;
            }
        });
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
            items.forEach(item => {
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
                        if (!item.origin && current.length === 1 && current[0].type === SVGTransform.SVG_TRANSFORM_SCALE) {
                            current.push(item);
                            return;
                        }
                    case SVGTransform.SVG_TRANSFORM_SCALE:
                        if (current.length) {
                            restart();
                        }
                        current.push(item);
                        break;
                }
            });
            if (current.length) {
                host.push(current);
            }
            return [host.reverse(), client];
        }
        return [[], transforms];
    }
    function getPropertyValue(values, index, propertyIndex, keyFrames = false, baseValue) {
        const property = values[index];
        let value;
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
        const { colorStops, type } = gradient;
        const result = { type, item: convertColorStops(colorStops, precision), positioning: false };
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
                        SvgBuild.getPathCommands(path.value).forEach(command => points = points.concat(command.value));
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
                            cxDiameter = element.r.baseVal.value;
                            cx = element.cx.baseVal.value - cxDiameter;
                            cy = element.cy.baseVal.value - cxDiameter;
                            cxDiameter *= 2;
                            cyDiameter = cxDiameter;
                        }
                        else if (SVG.ellipse(element)) {
                            cxDiameter = element.rx.baseVal.value;
                            cyDiameter = element.ry.baseVal.value;
                            cx = element.cx.baseVal.value - cxDiameter;
                            cy = element.cy.baseVal.value - cyDiameter;
                            cxDiameter *= 2;
                            cyDiameter *= 2;
                        }
                        else {
                            return undefined;
                        }
                        break;
                }
                result.centerX = (cx + cxDiameter * getRadiusPercent(cxAsString)).toString();
                result.centerY = (cy + cyDiameter * getRadiusPercent(cyAsString)).toString();
                result.gradientRadius = (((cxDiameter + cyDiameter) / 2) * (isPercent$3(rAsString) ? parseFloat(rAsString) / 100 : 1)).toString();
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
                templateSet.forEach(item => {
                    setData.set = setData.set.concat(item.set);
                    setData.objectAnimator = setData.objectAnimator.concat(item.objectAnimator);
                });
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
                targetData.animation = `@anim/${targetData.animation}`;
                data[0].target.push(targetData);
            }
        }
    }
    const getTemplateFilename = (templateName, length, prefix, suffix) => templateName + (prefix ? '_' + prefix : '') + (length ? '_vector' : '') + (suffix ? '_' + suffix.toLowerCase() : '');
    const isColorType = (attr) => attr === 'fill' || attr === 'stroke';
    const getVectorName = (target, section, index = -1) => target.name + '_' + section + (index !== -1 ? '_' + (index + 1) : '');
    const getRadiusPercent = (value) => isPercent$3(value) ? parseFloat(value) / 100 : 0.5;
    const getDrawableSrc = (name) => `@drawable/${name}`;
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
            this._vectorData = new Map();
            this._animateData = new Map();
            this._animateTarget = new Map();
            this._imageData = [];
            this._synchronizeMode = 0;
            this._namespaceAapt = false;
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
                this.cacheProcessing.each(node => {
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
                });
            }
        }
        afterFinalize() {
            this.controller.localSettings.svg.enabled = false;
        }
        createSvgElement(node, src) {
            const value = extractURL$2(src);
            if (value !== '') {
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
        createSvgDrawable(node, element) {
            const { floatPrecisionValue: precision, floatPrecisionKeyTime, transformExclude: exclude } = this.options;
            const svg = new Svg(element);
            const supportedKeyFrames = node.api >= 23 /* MARSHMALLOW */;
            const keyTimeMode = 2 /* FROMTO_ANIMATE */ | (supportedKeyFrames ? 32 /* KEYTIME_TRANSFORM */ : 64 /* IGNORE_TRANSFORM */);
            const animateData = this._animateData;
            const imageData = this._imageData;
            this._svgInstance = svg;
            this._vectorData.clear();
            animateData.clear();
            this._animateTarget.clear();
            imageData.length = 0;
            this._namespaceAapt = false;
            this._synchronizeMode = keyTimeMode;
            const templateName = `${node.tagName}_${convertWord$2(node.controlId, true)}_viewbox`.toLowerCase();
            svg.build({ exclude, residual: partitionTransforms, precision });
            svg.synchronize({ keyTimeMode, framesPerSecond: this.controller.userSettings.framesPerSecond, precision });
            this.queueAnimations(svg, svg.name, item => item.attributeName === 'opacity');
            const vectorData = this.parseVectorData(svg);
            const viewBox = svg.viewBox;
            const imageLength = imageData.length;
            let drawable;
            let vectorName;
            {
                const { width, height } = NodeUI$4.refitScreen(node, { width: svg.width, height: svg.height });
                vectorName = Resource.insertStoredAsset('drawables', getTemplateFilename(templateName, imageLength), applyTemplate$2('vector', VECTOR_TMPL, [{
                        'xmlns:android': XMLNS_ANDROID.android,
                        'xmlns:aapt': this._namespaceAapt ? XMLNS_ANDROID.aapt : '',
                        'android:name': animateData.size ? svg.name : '',
                        'android:width': formatPX$c(width),
                        'android:height': formatPX$c(height),
                        'android:viewportWidth': (viewBox.width || width).toString(),
                        'android:viewportHeight': (viewBox.height || height).toString(),
                        'android:alpha': parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : '',
                        include: vectorData
                    }]));
            }
            if (animateData.size) {
                const data = [{
                        'xmlns:android': XMLNS_ANDROID.android,
                        'android:drawable': getDrawableSrc(vectorName),
                        target: []
                    }];
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
                    const length = animations.length;
                    let i = 0;
                    while (i < length) {
                        const item = animations[i++];
                        if (item.setterType) {
                            if (ATTRIBUTE_ANDROID[item.attributeName] && isString$5(item.to)) {
                                if (item.fillReplace && item.duration > 0) {
                                    isolatedData.push(item);
                                }
                                else {
                                    togetherData.push(item);
                                }
                            }
                        }
                        else if (SvgBuild.isAnimate(item)) {
                            const children = companions.filter((child) => child.companion.value === item);
                            if (children.length) {
                                children.sort((a, b) => a.companion.key >= b.companion.key ? 1 : 0);
                                const sequentially = [];
                                const after = [];
                                const q = children.length;
                                for (let j = 0; j < q; ++j) {
                                    const child = children[j];
                                    if (child.companion.key <= 0) {
                                        sequentially.push(child);
                                        if (j === 0) {
                                            child.delay += item.delay;
                                            item.delay = 0;
                                        }
                                    }
                                    else {
                                        after.push(child);
                                    }
                                }
                                sequentially.push(item);
                                sequentialMap.set(`sequentially_companion_${i}`, sequentially.concat(after));
                            }
                            else {
                                const synchronized = item.synchronized;
                                if (synchronized) {
                                    const value = synchronized.value;
                                    if (SvgBuild.isAnimateTransform(item)) {
                                        const values = transformMap.get(value);
                                        if (values) {
                                            values.push(item);
                                        }
                                        else {
                                            transformMap.set(value, [item]);
                                        }
                                    }
                                    else {
                                        const values = sequentialMap.get(value);
                                        if (values) {
                                            values.push(item);
                                        }
                                        else {
                                            sequentialMap.set(value, [item]);
                                        }
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
                    isolatedData.forEach(item => isolatedTargets.push([[item]]));
                    [togetherTargets, transformTargets, ...isolatedTargets].forEach((targets, index) => {
                        if (targets.length === 0) {
                            return;
                        }
                        const setData = {
                            ordering: index === 0 || targets.length === 1 ? '' : 'sequentially',
                            set: [],
                            objectAnimator: []
                        };
                        targets.forEach(items => {
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
                                if (section === 1 && partition.length > 1) {
                                    fillCustom.ordering = 'sequentially';
                                }
                                const animatorMap = new Map();
                                partition.forEach(item => {
                                    var _a;
                                    const valueType = getValueType(item.attributeName);
                                    if (valueType === undefined) {
                                        return;
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
                                            if (propertyValues === null || propertyValues === void 0 ? void 0 : propertyValues.length) {
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
                                            const q = propertyNames.length;
                                            if (values.length === q && !values.some(value => value === '')) {
                                                let companionBefore;
                                                let companionAfter;
                                                for (let j = 0; j < q; ++j) {
                                                    let valueFrom;
                                                    if (valueType === 'pathType') {
                                                        valueFrom = values[j];
                                                    }
                                                    else if (requireBefore) {
                                                        const baseValue = item.baseValue;
                                                        if (baseValue) {
                                                            valueFrom = convertValueType(item, baseValue.trim().split(' ')[j]);
                                                        }
                                                    }
                                                    const propertyValue = this.createPropertyValue(propertyNames[j], values[j], '1', valueType, valueFrom, item.delay > 0 ? item.delay.toString() : '');
                                                    if (index > 1) {
                                                        customAnimator.push(propertyValue);
                                                        insertFillAfter(propertyNames[j], undefined, index > 1 ? item.duration : 0);
                                                    }
                                                    else {
                                                        const companion = item.companion;
                                                        if (companion) {
                                                            if (companion.key <= 0) {
                                                                if (!companionBefore) {
                                                                    companionBefore = [];
                                                                }
                                                                companionBefore.push(propertyValue);
                                                            }
                                                            else if (companion.key > 0) {
                                                                if (!companionAfter) {
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
                                        if (!synchronized && valueType === 'pathType') {
                                            if (group.pathData) {
                                                const parent = item.parent;
                                                let transforms;
                                                let companion;
                                                if (parent && SvgBuild.isShape(parent)) {
                                                    companion = parent;
                                                    transforms = (_a = parent.path) === null || _a === void 0 ? void 0 : _a.transformed;
                                                }
                                                propertyNames = ['pathData'];
                                                values = SvgPath.extrapolate(item.attributeName, group.pathData, item.values, transforms, companion, precision);
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
                                                const q = values.length;
                                                if ((rotateValues === null || rotateValues === void 0 ? void 0 : rotateValues.length) === q) {
                                                    propertyNames.push('rotation');
                                                    let j = 0;
                                                    while (j < q) {
                                                        values[j].push(rotateValues[j++]);
                                                    }
                                                }
                                            }
                                            transforming = true;
                                        }
                                        else {
                                            propertyNames = getAttributePropertyName(item.attributeName);
                                            switch (valueType) {
                                                case 'intType':
                                                    values = objectMap$4(item.values, value => convertInt$4(value).toString());
                                                    if (requireBefore) {
                                                        const baseValue = item.baseValue;
                                                        if (baseValue) {
                                                            beforeValues = replaceMap$1(SvgBuild.parseCoordinates(baseValue), (value) => Math.trunc(value).toString());
                                                        }
                                                    }
                                                    break;
                                                case 'floatType':
                                                    if (item.attributeName === 'stroke-dasharray') {
                                                        values = objectMap$4(item.values, value => replaceMap$1(value.split(' '), (fraction) => parseFloat(fraction)));
                                                    }
                                                    else {
                                                        values = item.values;
                                                    }
                                                    if (requireBefore) {
                                                        const baseValue = item.baseValue;
                                                        if (baseValue) {
                                                            beforeValues = replaceMap$1(SvgBuild.parseCoordinates(baseValue), (value) => value.toString());
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
                                                        const q = values.length;
                                                        for (let j = 0; j < q; ++j) {
                                                            if (values[j] !== '') {
                                                                values[j] = getColorValue$1(values[j]);
                                                            }
                                                        }
                                                    }
                                                    break;
                                            }
                                        }
                                        if (!item.keySplines) {
                                            const timingFunction = item.timingFunction;
                                            options.interpolator = isString$5(timingFunction) ? createPathInterpolator(timingFunction) : this.options.animateInterpolator;
                                        }
                                        if (values && propertyNames) {
                                            const { keyTimes, synchronized: syncData } = item;
                                            const q = propertyNames.length;
                                            const r = keyTimes.length;
                                            const keyName = syncData ? syncData.key + syncData.value : (index !== 0 || q > 1 ? JSON.stringify(options) : '');
                                            for (let j = 0; j < q; ++j) {
                                                const propertyName = propertyNames[j];
                                                if (resetBefore && beforeValues) {
                                                    resetBeforeValue(propertyName, beforeValues[j]);
                                                }
                                                if (useKeyFrames && r > 1) {
                                                    if (supportedKeyFrames && valueType !== 'pathType') {
                                                        if (!resetBefore && requireBefore && beforeValues) {
                                                            resetBeforeValue(propertyName, beforeValues[j]);
                                                        }
                                                        const propertyValuesHolder = animatorMap.get(keyName) || [];
                                                        const keyframe = [];
                                                        for (let k = 0; k < r; ++k) {
                                                            let value = getPropertyValue(values, k, j, true);
                                                            if (value && valueType === 'floatType') {
                                                                value = truncate$7(value, precision);
                                                            }
                                                            keyframe.push({
                                                                interpolator: k > 0 && value !== '' && propertyName !== 'pivotX' && propertyName !== 'pivotY' ? getPathInterpolator(item.keySplines, k - 1) : '',
                                                                fraction: keyTimes[k] === 0 && value === '' ? '' : truncate$7(keyTimes[k], floatPrecisionKeyTime),
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
                                                        for (let k = 0; k < r; ++k) {
                                                            const keyTime = keyTimes[k];
                                                            const propertyOptions = Object.assign(Object.assign({}, options), { propertyName, startOffset: k === 0 ? (item.delay + (keyTime > 0 ? Math.floor(keyTime * item.duration) : 0)).toString() : '', propertyValuesHolder: false });
                                                            let valueTo = getPropertyValue(values, k, j, false, valueType === 'pathType' ? group.pathData : item.baseValue);
                                                            if (valueTo) {
                                                                let duration;
                                                                if (k === 0) {
                                                                    if (!checkBefore && requireBefore && beforeValues) {
                                                                        propertyOptions.valueFrom = beforeValues[j];
                                                                    }
                                                                    else if (valueType === 'pathType') {
                                                                        propertyOptions.valueFrom = group.pathData || values[0].toString();
                                                                    }
                                                                    else {
                                                                        propertyOptions.valueFrom = item.baseValue || item.replaceValue || '';
                                                                    }
                                                                    duration = 0;
                                                                }
                                                                else {
                                                                    propertyOptions.valueFrom = getPropertyValue(values, k - 1, j).toString();
                                                                    duration = Math.floor((keyTime - keyTimes[k - 1]) * item.duration);
                                                                }
                                                                if (valueType === 'floatType') {
                                                                    valueTo = truncate$7(valueTo, precision);
                                                                }
                                                                const origin = transformOrigin === null || transformOrigin === void 0 ? void 0 : transformOrigin[k];
                                                                if (origin) {
                                                                    let direction;
                                                                    let translateTo = 0;
                                                                    if (propertyName.endsWith('X')) {
                                                                        direction = 'translateX';
                                                                        translateTo = origin.x;
                                                                    }
                                                                    else if (propertyName.endsWith('Y')) {
                                                                        direction = 'translateY';
                                                                        translateTo = origin.y;
                                                                    }
                                                                    if (direction) {
                                                                        const valueData = this.createPropertyValue(direction, truncate$7(translateTo, precision), duration.toString(), 'floatType');
                                                                        valueData.interpolator = createPathInterpolator(KEYSPLINE_NAME['step-start']);
                                                                        translateData.objectAnimator.push(valueData);
                                                                    }
                                                                }
                                                                if (k > 0) {
                                                                    propertyOptions.interpolator = getPathInterpolator(item.keySplines, k - 1);
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
                                                    const s = values.length;
                                                    if (Array.isArray(values[0])) {
                                                        const valueTo = values[s - 1][j];
                                                        if (s > 1) {
                                                            const from = values[0][j];
                                                            if (from !== valueTo) {
                                                                propertyOptions.valueFrom = from.toString();
                                                            }
                                                        }
                                                        propertyOptions.valueTo = valueTo.toString();
                                                    }
                                                    else {
                                                        let valueFrom;
                                                        if (s > 1) {
                                                            valueFrom = values[0].toString();
                                                            propertyOptions.valueTo = values[s - 1].toString();
                                                        }
                                                        else {
                                                            valueFrom = item.from || (!checkBefore && requireBefore && beforeValues ? beforeValues[j] : '');
                                                            propertyOptions.valueTo = item.to;
                                                        }
                                                        if (valueType === 'pathType') {
                                                            propertyOptions.valueFrom = valueFrom || group.pathData || propertyOptions.valueTo;
                                                        }
                                                        else if (valueFrom !== propertyOptions.valueTo && valueFrom) {
                                                            propertyOptions.valueFrom = convertValueType(item, valueFrom);
                                                        }
                                                    }
                                                    const valueA = propertyOptions.valueTo;
                                                    if (valueA) {
                                                        if (valueType === 'floatType') {
                                                            propertyOptions.valueTo = truncate$7(valueA, precision);
                                                        }
                                                        (section === 0 ? objectAnimator : customAnimator).push(propertyOptions);
                                                    }
                                                }
                                                if (section === 0 && !synchronized && item.iterationCount !== -1) {
                                                    insertFillAfter(propertyName, objectAnimator);
                                                }
                                            }
                                            if (requireBefore && (transformOrigin === null || transformOrigin === void 0 ? void 0 : transformOrigin.length)) {
                                                resetBeforeValue('translateX', '0');
                                                resetBeforeValue('translateY', '0');
                                            }
                                        }
                                    }
                                });
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
                        });
                        if (setData.set.length || setData.objectAnimator.length) {
                            targetSetTemplate.set.push(setData);
                        }
                    });
                    insertTargetAnimation(data, name, targetSetTemplate, templateName, imageLength);
                }
                for (const [name, target] of this._animateTarget.entries()) {
                    let objectAnimator;
                    const insertResetValue = (propertyName, valueTo, valueType, valueFrom, startOffset) => {
                        if (!objectAnimator) {
                            objectAnimator = [];
                        }
                        objectAnimator.push(this.createPropertyValue(propertyName, valueTo, '0', valueType, valueFrom, startOffset));
                    };
                    target.animate.forEach(item => {
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
                    });
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
                const layerData = [{ 'xmlns:android': XMLNS_ANDROID.android, item }];
                if (vectorName !== '') {
                    item.push({ drawable: getDrawableSrc(vectorName) });
                }
                imageData.forEach(image => {
                    const box = svg.viewBox;
                    const scaleX = svg.width / box.width;
                    const scaleY = svg.height / box.height;
                    let x = image.getBaseValue('x', 0) * scaleX;
                    let y = image.getBaseValue('y', 0) * scaleY;
                    let w = image.getBaseValue('width', 0);
                    let h = image.getBaseValue('height', 0);
                    const offset = getParentOffset(image.element, svg.element);
                    x += offset.x;
                    y += offset.y;
                    w *= scaleX;
                    h *= scaleY;
                    const data = {
                        width: formatPX$c(w),
                        height: formatPX$c(h),
                        left: x !== 0 ? formatPX$c(x) : '',
                        top: y !== 0 ? formatPX$c(y) : ''
                    };
                    const src = getDrawableSrc(resource.addImageSet({ mdpi: image.href }));
                    if (image.rotateAngle) {
                        data.rotate = {
                            drawable: src,
                            fromDegrees: image.rotateAngle.toString(),
                            visible: image.visible ? 'true' : 'false'
                        };
                    }
                    else {
                        data.drawable = src;
                    }
                    item.push(data);
                });
                drawable = Resource.insertStoredAsset('drawables', templateName, applyTemplate$2('layer-list', LAYERLIST_TMPL, layerData));
            }
            else {
                drawable = vectorName;
            }
            node.data(Resource.KEY_NAME, 'svgViewBox', viewBox);
            return drawable;
        }
        createPropertyValue(propertyName, valueTo, duration, valueType, valueFrom = '', startOffset = '', repeatCount = '0') {
            const floatPrecisionValue = this.options.floatPrecisionValue;
            return {
                propertyName,
                startOffset,
                duration,
                repeatCount,
                valueType,
                valueFrom: isNumber$3(valueFrom) ? truncate$7(valueFrom, floatPrecisionValue) : valueFrom,
                valueTo: isNumber$3(valueTo) ? truncate$7(valueTo, floatPrecisionValue) : valueTo,
                propertyValuesHolder: false
            };
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
                            if (parseFloat(itemPath.strokeWidth) > 0 && (itemPath.strokeDasharray || itemPath.strokeDashoffset)) {
                                const animateData = this._animateData.get(item.name);
                                if (!animateData || animateData.animate.every(animate => animate.attributeName.startsWith('stroke-dash'))) {
                                    const [animations, strokeDash, pathData, clipPathData] = itemPath.extractStrokeDash(animateData === null || animateData === void 0 ? void 0 : animateData.animate, floatPrecisionValue);
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
                                            strokePath.name = `${name}_${i}`;
                                            if (animateData) {
                                                this._animateData.set(strokePath.name, {
                                                    element: animateData.element,
                                                    animate: animateData.animate.filter(animate => animate.id === undefined || animate.id === i)
                                                });
                                            }
                                            strokePath.trimPathStart = truncate$7(dash.start, floatPrecisionValue);
                                            strokePath.trimPathEnd = truncate$7(dash.end, floatPrecisionValue);
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
                            this._imageData.push(item);
                        }
                    }
                }
            });
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
            if ((SvgBuild.asSvg(target) && !target.documentRoot || SvgBuild.asUseSymbol(target) || SvgBuild.asUsePattern(target)) && (target.x !== 0 || target.y !== 0)) {
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
            if (target !== this._svgInstance) {
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
                    transforms.forEach(data => {
                        result.push(createTransformData(data));
                        transformed = transformed.concat(data);
                    });
                    target.transformed = transformed.reverse();
                }
            }
            return result;
        }
        createPath(target, path) {
            var _a, _b;
            const precision = this.options.floatPrecisionValue;
            const result = { name: target.name };
            const renderData = [];
            const clipElement = [];
            const baseData = {};
            const groupName = getVectorName(target, 'group');
            const opacity = getOuterOpacity(target);
            const useTarget = SvgBuild.asUse(target);
            if (SvgBuild.asUse(target) && isString$5(target.clipPath)) {
                this.createClipPath(target, clipElement, target.clipPath);
            }
            if (isString$5(path.clipPath)) {
                const shape = new SvgShape(path.element);
                shape.build({ exclude: this.options.transformExclude, residual: partitionTransforms, precision });
                shape.synchronize({ keyTimeMode: this._synchronizeMode, precision });
                this.createClipPath(shape, clipElement, path.clipPath);
            }
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
            (_a = path.transformResidual) === null || _a === void 0 ? void 0 : _a.forEach(item => renderData.push(createTransformData(item)));
            PATH_ATTRIBUTES.forEach(attr => {
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
                            if (value !== 'none' && !result['aapt:attr']) {
                                const colorName = Resource.addColor(value);
                                if (colorName !== '') {
                                    value = `@color/${colorName}`;
                                }
                            }
                            else {
                                return;
                            }
                            break;
                        case 'stroke':
                            attr = 'strokeColor';
                            if (value !== 'none') {
                                const colorName = Resource.addColor(value);
                                if (colorName !== '') {
                                    value = `@color/${colorName}`;
                                }
                            }
                            else {
                                return;
                            }
                            break;
                        case 'fillPattern': {
                            const definition = this._svgInstance.definitions.gradient.get(value);
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
                                this._namespaceAapt = true;
                            }
                            else {
                                return;
                            }
                            break;
                        }
                        case 'fillRule':
                            if (value === 'evenodd') {
                                attr = 'fillType';
                                value = 'evenOdd';
                            }
                            else {
                                return;
                            }
                            break;
                        case 'strokeWidth':
                            if (value === '0') {
                                return;
                            }
                            break;
                        case 'fillOpacity':
                        case 'strokeOpacity':
                            value = ((isNumber$3(value) ? parseFloat(value) : 1) * opacity).toString();
                            if (value === '1') {
                                return;
                            }
                            attr = attr === 'fillOpacity' ? 'fillAlpha' : 'strokeAlpha';
                            break;
                        case 'strokeLinecap':
                            if (value === 'butt') {
                                return;
                            }
                            attr = 'strokeLineCap';
                            break;
                        case 'strokeLinejoin':
                            if (value === 'miter') {
                                return;
                            }
                            attr = 'strokeLineJoin';
                            break;
                        case 'strokeMiterlimit':
                            if (value === '4') {
                                return;
                            }
                            attr = 'strokeMiterLimit';
                            break;
                        default:
                            return;
                    }
                    result[attr] = value;
                }
            });
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
            target.animations.forEach(item => {
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
            });
            const replaceData = Array.from(fillReplaceMap.values()).sort((a, b) => a.time < b.time ? -1 : 1);
            const length = replaceData.length;
            for (let i = 0; i < length; ++i) {
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
                    }
                    else {
                        const itemTotal = [];
                        const previousType = new Set();
                        let j = 0;
                        while (j < i) {
                            const previous = replaceData[j++];
                            itemTotal[previous.index] = itemTotal[previous.index] ? 2 : 1;
                        }
                        const q = itemTotal.length;
                        for (j = 0; j < q; ++j) {
                            if (itemTotal[j] === 1) {
                                const animate = (_b = replaceData.find(data => data.index === j && 'animate' in data)) === null || _b === void 0 ? void 0 : _b.animate;
                                if (animate) {
                                    previousType.add(animate.type);
                                }
                            }
                        }
                        previousType.forEach(type => {
                            const propertyName = getTransformPropertyName(type);
                            if (propertyName) {
                                const initialValue = TRANSFORM.typeAsValue(type).split(' ');
                                const r = initialValue.length;
                                j = 0;
                                while (j < r) {
                                    transformResult.push(createAnimateFromTo(propertyName[j], item.time, initialValue[j++], ''));
                                }
                            }
                        });
                    }
                    if (valid) {
                        replaceResult.push(createAnimateFromTo('d', item.time, item.to));
                        previousPathData = item.to;
                    }
                }
            }
            if (!this.queueAnimations(target, result.name, item => (SvgBuild.asAnimate(item) || SvgBuild.asSet(item)) && item.attributeName !== 'clip-path', pathData) && replaceResult.length === 0 && baseData.name !== groupName) {
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
                }
                else {
                    animateData.set(result.name, {
                        element: target.element,
                        animate: replaceResult,
                        pathData
                    });
                }
            }
            return [result, renderData];
        }
        createClipPath(target, clipArray, clipPath) {
            const { transformExclude: exclude, floatPrecisionValue: precision } = this.options;
            const definitions = this._svgInstance.definitions;
            const keyTimeMode = this._synchronizeMode;
            let result = 0;
            clipPath.split(';').forEach((value, index, array) => {
                if (value.charAt(0) === '#') {
                    const element = definitions.clipPath.get(value);
                    if (element) {
                        const g = new SvgG(element);
                        g.build({ exclude, residual: partitionTransforms, precision });
                        g.synchronize({ keyTimeMode, precision });
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
                const animate = svg.animations.filter((item, index, array) => !item.paused && (item.duration >= 0 || item.setterType) && predicate(item, index, array));
                if (animate.length) {
                    const element = svg.element;
                    this._animateData.set(name, {
                        element,
                        animate,
                        pathData
                    });
                    if (targetName) {
                        this._animateTarget.set(targetName, {
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
    }

    const settings = {
        builtInExtensions: [
            'android.delegate.background',
            'android.delegate.negative-x',
            'android.delegate.positive-x',
            'android.delegate.max-width-height',
            'android.delegate.percent',
            'android.delegate.css-grid',
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
            'android.resource.includes'
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
        exclusionsDisabled: false,
        customizationsOverwritePrivilege: true,
        showAttributes: true,
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
        outputArchiveFormat: 'zip'
    };

    const $lib$j = squared.base.lib;
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
    function createAssetsOptions(options, directory, filename) {
        return Object.assign(Object.assign({}, options), { directory,
            filename });
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
            ExtensionManager,
            Controller,
            File,
            Resource,
            View
        },
        extensions: {
            Accessibility,
            Column,
            CssGrid: CssGrid$1,
            External,
            Flexbox,
            Grid: Grid$1,
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
                CssGrid: Grid$2,
                MaxWidthHeight: MaxWidthHeight,
                NegativeX: NegativeX,
                Percent: Percent,
                PositiveX: PositiveX,
                RadioGroup: RadioGroup,
                ScrollBar: ScrollBar
            },
            resource: {
                Background: ResourceBackground,
                Data: ResourceData,
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
                    file.layoutAllToXml(application.layouts, createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-layouts'));
                }
            },
            saveResourceAllXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceAllToXml(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-resources'));
                }
            },
            saveResourceStringXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceStringToXml(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-string'));
                }
            },
            saveResourceArrayXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceStringArrayToXml(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-array'));
                }
            },
            saveResourceFontXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceFontToXml(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-font'));
                }
            },
            saveResourceColorXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceColorToXml(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-color'));
                }
            },
            saveResourceStyleXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceStyleToXml(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-style'));
                }
            },
            saveResourceDimenXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceDimenToXml(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-dimen'));
                }
            },
            saveResourceDrawableXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceDrawableToXml(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-drawable'));
                }
            },
            saveResourceAnimXml(filename, options) {
                if (checkApplication(application)) {
                    file.resourceAnimToXml(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-anim'));
                }
            },
            saveResourceDrawableImage(filename, options) {
                if (checkApplication(application)) {
                    file.resourceDrawableImageToString(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-drawable-image'));
                }
            },
            saveResourceRawVideo(filename, options) {
                if (checkApplication(application)) {
                    file.resourceRawVideoToString(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-raw-video'));
                }
            },
            saveResourceRawAudio(filename, options) {
                if (checkApplication(application)) {
                    file.resourceRawAudioToString(createAssetsOptions(options, undefined, filename || userSettings.outputArchiveName + '-raw-audio'));
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
            }
        },
        create() {
            const EN = $lib$j.constant.EXT_NAME;
            const EA = EXT_ANDROID;
            application = new Application(framework, View, Controller, Resource, ExtensionManager);
            file = new File();
            application.resourceHandler.setFileHandler(file);
            userSettings = Object.assign({}, settings);
            Object.assign(application.builtInExtensions, {
                [EN.TABLE]: new Table(EN.TABLE, framework, undefined, ['TABLE']),
                [EN.LIST]: new List(EN.LIST, framework, undefined, ['DIV', 'UL', 'OL', 'DL']),
                [EN.GRID]: new Grid$1(EN.GRID, framework, undefined, ['DIV', 'FORM', 'UL', 'OL', 'DL', 'NAV', 'SECTION', 'ASIDE', 'MAIN', 'HEADER', 'FOOTER', 'P', 'ARTICLE', 'FIELDSET']),
                [EN.CSS_GRID]: new CssGrid$1(EN.CSS_GRID, framework),
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
                [EA.DELEGATE_CSS_GRID]: new Grid$2(EA.DELEGATE_CSS_GRID, framework),
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
                [EA.CONSTRAINT_GUIDELINE]: new Guideline(EA.CONSTRAINT_GUIDELINE, framework)
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
