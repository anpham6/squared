/* android-framework 1.2.6
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
        get CONTAINER_NODE () { return CONTAINER_NODE; }
    });

    const EXT_ANDROID = {
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
        EXT_ANDROID: EXT_ANDROID,
        CONTAINER_ANDROID: CONTAINER_ANDROID,
        ELEMENT_ANDROID: ELEMENT_ANDROID,
        SUPPORT_ANDROID: SUPPORT_ANDROID,
        LAYOUT_ANDROID: LAYOUT_ANDROID,
        XMLNS_ANDROID: XMLNS_ANDROID,
        STRING_ANDROID: STRING_ANDROID,
        LOCALIZE_ANDROID: LOCALIZE_ANDROID,
        RESERVED_JAVA: RESERVED_JAVA
    });

    const { color: $color, css: $css, regex: $regex, util: $util } = squared.lib;
    const STORED = squared.base.ResourceUI.STORED;
    const REGEXP_NONWORD = /[^\w+]/g;
    let CACHE_IMAGE = {};
    let IMAGE_FORMAT;
    function formatObject(obj, numberAlias = false) {
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
                if ($util.isPlainObject(obj)) {
                    formatObject(obj, numberAlias);
                }
            }
            return options;
        }
        static formatName(value) {
            if ($regex.CHAR.LEADINGNUMBER.test(value)) {
                value = '__' + value;
            }
            return value.replace(REGEXP_NONWORD, '_');
        }
        static addTheme(...values) {
            for (const theme of values) {
                const path = theme.output && $util.isString(theme.output.path) ? theme.output.path.trim() : 'res/values';
                const file = theme.output && $util.isString(theme.output.file) ? theme.output.file.trim() : 'themes.xml';
                const filename = `${$util.trimString(path.trim(), '/')}/${$util.trimString(file.trim(), '/')}`;
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
        static addImage(images, prefix = '') {
            const mdpi = images.mdpi;
            if (mdpi) {
                if (CACHE_IMAGE[mdpi]) {
                    return CACHE_IMAGE[mdpi];
                }
                const src = $util.fromLastIndexOf(mdpi, '/');
                const format = $util.fromLastIndexOf(src, '.').toLowerCase();
                if (format !== 'svg' && IMAGE_FORMAT.includes(format)) {
                    CACHE_IMAGE[mdpi] = Resource.insertStoredAsset('images', Resource.formatName(prefix + src.substring(0, src.length - format.length - 1)), images);
                    return CACHE_IMAGE[mdpi];
                }
            }
            return '';
        }
        static addColor(color, transparency = false) {
            if (typeof color === 'string') {
                color = $color.parseColor(color, 1, transparency);
            }
            if (color && (!color.transparent || transparency)) {
                const keyName = color.opacity < 1 ? color.valueAsARGB : color.value;
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
        reset() {
            super.reset();
            CACHE_IMAGE = {};
        }
        addImageSrc(element, prefix = '', imageSet) {
            const result = {};
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

    const $util$1 = squared.lib.util;
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
            const value = $util$1.optionalAsString(build, `assign.${tagName}.${obj}.${attr}`);
            if ($util$1.isString(value)) {
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

    const { math: $math, util: $util$2 } = squared.lib;
    const REGEXP_ID = /^@\+?id\//;
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
                return (result !== 0 && result > -1 && result < 1 ? result.toPrecision(precision) : $math.truncate(result, precision - 1)) + (font ? 'sp' : 'dp');
            }
            else {
                return Math.round(result) + (font ? 'sp' : 'dp');
            }
        }
        return '0dp';
    }
    function getDocumentId(value) {
        return value.replace(REGEXP_ID, '');
    }
    function getHorizontalBias(node) {
        const parent = node.documentParent;
        const left = Math.max(0, node.actualRect('left', 'bounds') - parent.box.left);
        const right = Math.max(0, parent.box.right - node.actualRect('right', 'bounds'));
        return calculateBias(left, right, node.localSettings.floatPrecision);
    }
    function getVerticalBias(node) {
        const parent = node.documentParent;
        const top = Math.max(0, node.actualRect('top', 'bounds') - parent.box.top);
        const bottom = Math.max(0, parent.box.bottom - node.actualRect('bottom', 'bounds'));
        return calculateBias(top, bottom, node.localSettings.floatPrecision);
    }
    function createViewAttribute(options, android = {}, app = {}) {
        const result = { android, app };
        if (options) {
            Object.assign(result, options);
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
        if ($util$2.isPlainObject(options)) {
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
            if (value.indexOf(`${namespace}:`) !== -1) {
                output += `\n\t${getXmlNs(namespace)}`;
            }
        }
        return output;
    }

    var util = /*#__PURE__*/Object.freeze({
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

    const { client: $client, css: $css$1, dom: $dom, math: $math$1, util: $util$3 } = squared.lib;
    const { constant: $c, enumeration: $e } = squared.base.lib;
    const REGEXP_DATASETATTR = /^attr[A-Z]/;
    const REGEXP_FORMATTED = /^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/;
    const REGEXP_VALIDSTRING = /[^\w$\-_.]/g;
    function checkTextAlign(value, ignoreStart = false) {
        switch (value) {
            case 'justify':
            case 'initial':
            case 'inherit':
                return '';
            case 'center':
                return STRING_ANDROID.CENTER_HORIZONTAL;
            case 'start':
            case 'left':
                if (ignoreStart) {
                    return '';
                }
            default:
                return value;
        }
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
    function setAutoMargin(node) {
        if (!node.blockWidth || node.hasWidth || node.hasPX('maxWidth') || node.innerWrapped && node.innerWrapped.has('width', 4 /* PERCENT */, { not: '100%' })) {
            const alignment = [];
            if (node.autoMargin.leftRight) {
                alignment.push(STRING_ANDROID.CENTER_HORIZONTAL);
            }
            else if (node.autoMargin.left) {
                alignment.push('right');
            }
            else if (node.autoMargin.right) {
                alignment.push('left');
            }
            if (node.autoMargin.topBottom) {
                alignment.push(STRING_ANDROID.CENTER_VERTICAL);
            }
            else if (node.autoMargin.top) {
                alignment.push('bottom');
            }
            else if (node.autoMargin.bottom) {
                alignment.push('top');
            }
            if (alignment.length) {
                const attr = node.outerWrapper === undefined && (node.blockWidth || !node.pageFlow) ? 'gravity' : 'layout_gravity';
                for (const value of alignment) {
                    node.mergeGravity(attr, value);
                }
                return true;
            }
        }
        return false;
    }
    function setMultiline(node, lineHeight, overwrite) {
        if (node.localSettings.targetAPI >= 28 /* PIE */) {
            node.android('lineHeight', $css$1.formatPX(lineHeight), overwrite);
        }
        else {
            const offset = (lineHeight - node.actualHeight) / 2;
            if (offset > 0) {
                node.android('lineSpacingExtra', $css$1.formatPX(offset), overwrite);
            }
        }
        if (node.styleElement && !node.hasPX('height') && node.cssTry('line-height', 'normal')) {
            if (node.cssTry('white-space', 'nowrap')) {
                const offset = (lineHeight - node.element.getBoundingClientRect().height) / 2;
                if (Math.floor(offset) > 0) {
                    node.modifyBox(32 /* PADDING_TOP */, Math.round(offset));
                    if (!node.blockStatic) {
                        node.modifyBox(128 /* PADDING_BOTTOM */, Math.floor(offset));
                    }
                }
                node.cssFinally('white-space');
            }
            node.cssFinally('line-height');
        }
    }
    function setMarginOffset(node, lineHeight, inlineStyle, top = true, bottom = true) {
        if (node.is(CONTAINER_NODE.IMAGE) || node.actualHeight === 0) {
            return;
        }
        if (node.multiline) {
            setMultiline(node, lineHeight, false);
        }
        else if ((node.renderChildren.length === 0 || node.inline) && (node.pageFlow || node.textContent.length)) {
            let offset = 0;
            let usePadding = true;
            if (node.styleElement && !inlineStyle && !node.hasPX('height') && node.cssTry('line-height', 'normal')) {
                if (node.cssTry('white-space', 'nowrap')) {
                    offset = (lineHeight - (node.element.getBoundingClientRect().height || node.actualHeight)) / 2;
                    usePadding = false;
                    node.cssFinally('white-space');
                }
                node.cssFinally('line-height');
            }
            else if (inlineStyle && node.inlineText && !node.inline) {
                adjustMinHeight(node, lineHeight);
                return;
            }
            else if (node.plainText && node.bounds.numberOfLines > 1) {
                node.android('minHeight', $css$1.formatPX(node.actualHeight / node.bounds.numberOfLines));
                node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
            }
            else {
                offset = (lineHeight - node.actualHeight) / 2;
            }
            if (Math.floor(offset) > 0) {
                const boxPadding = usePadding && node.textElement && !node.plainText && !inlineStyle;
                if (top) {
                    node.modifyBox(boxPadding ? 32 /* PADDING_TOP */ : 2 /* MARGIN_TOP */, Math.round(offset));
                }
                if (bottom) {
                    node.modifyBox(boxPadding ? 128 /* PADDING_BOTTOM */ : 8 /* MARGIN_BOTTOM */, Math.floor(offset));
                }
            }
        }
        else if (inlineStyle && (!node.hasHeight || lineHeight > node.height) && (node.layoutHorizontal && node.horizontalRows === undefined || node.hasAlign(4096 /* SINGLE */))) {
            adjustMinHeight(node, lineHeight);
        }
    }
    function adjustMinHeight(node, value) {
        if (node.inlineText) {
            value += node.contentBoxHeight;
            node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL, false);
        }
        if (value > node.height) {
            node.android('minHeight', $css$1.formatPX(value));
        }
    }
    function setSingleLine(node, ellipsize = false) {
        if (node.textElement && !node.multiline) {
            node.android('maxLines', '1');
            if (ellipsize && node.textContent.trim().indexOf(' ') !== -1) {
                node.android('ellipsize', 'end');
            }
        }
    }
    const isFlexibleDimension = (node, value) => !!node.renderParent && value === '0px' && (node.renderParent.layoutConstraint || node.renderParent.is(CONTAINER_NODE.GRID));
    const validateString = (value) => value ? value.trim().replace(REGEXP_VALIDSTRING, '_').toLowerCase() : '';
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
                this._containerType = 0;
                this.__android = {};
                this.__app = {};
                this.init();
                if (afterInit) {
                    afterInit(this);
                }
            }
            static getControlName(containerType) {
                return CONTAINER_ANDROID[CONTAINER_NODE[containerType]];
            }
            android(attr, value, overwrite = true) {
                if (value) {
                    if (this.localSettings.targetAPI < 28 /* LATEST */) {
                        const result = {};
                        if (!this.supported(attr, result)) {
                            return '';
                        }
                        if (Object.keys(result).length) {
                            if ($util$3.isString(result.attr)) {
                                attr = result.attr;
                            }
                            if ($util$3.isString(result.value)) {
                                value = result.value;
                            }
                            if (typeof result.overwrite === 'boolean') {
                                overwrite = result.overwrite;
                            }
                        }
                    }
                    this.attr('android', attr, value, overwrite);
                }
                return this.__android[attr] || '';
            }
            app(attr, value, overwrite = true) {
                if (value) {
                    this.attr('app', attr, value, overwrite);
                }
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
                const match = REGEXP_FORMATTED.exec(value);
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
                            if (documentId && overwrite === undefined) {
                                overwrite = documentId === 'parent';
                            }
                            const attr = LAYOUT_ANDROID.constraint[position];
                            if (attr) {
                                let horizontal = false;
                                node.app(this.localizeString(attr), documentId, overwrite);
                                switch (position) {
                                    case 'left':
                                    case 'right':
                                        if (documentId === 'parent') {
                                            node.constraint.horizontal = true;
                                        }
                                    case $c.STRING_BASE.LEFT_RIGHT:
                                    case $c.STRING_BASE.RIGHT_LEFT:
                                        horizontal = true;
                                        break;
                                    case 'top':
                                    case 'bottom':
                                    case 'baseline':
                                        if (documentId === 'parent') {
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
                        if (documentId && overwrite === undefined) {
                            overwrite = documentId === 'true';
                        }
                        const attr = LAYOUT_ANDROID[documentId === 'true' ? 'relativeParent' : 'relative'][position];
                        node.android(this.localizeString(attr), documentId, overwrite);
                        return true;
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
                const horizontal = orientation === STRING_ANDROID.HORIZONTAL;
                node.app(horizontal ? 'layout_constraintHorizontal_chainStyle' : 'layout_constraintVertical_chainStyle', value, overwrite);
                node.app(horizontal ? 'layout_constraintHorizontal_bias' : 'layout_constraintVertical_bias', bias.toString(), overwrite);
            }
            anchorDelete(...position) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        node.delete('app', ...$util$3.replaceMap(position, value => this.localizeString(LAYOUT_ANDROID.constraint[value])));
                    }
                    else if (renderParent.layoutRelative) {
                        for (const value of position) {
                            if (node.alignSibling(value) !== '') {
                                node.delete('android', LAYOUT_ANDROID.relative[value], this.localizeString(LAYOUT_ANDROID.relative[value]));
                            }
                            else if (LAYOUT_ANDROID.relativeParent[value]) {
                                node.delete('android', this.localizeString(LAYOUT_ANDROID.relativeParent[value]));
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
                        node.anchorDelete(...Object.keys(LAYOUT_ANDROID.constraint));
                    }
                    else if (renderParent.layoutRelative) {
                        node.anchorDelete(...Object.keys(LAYOUT_ANDROID.relativeParent));
                        node.anchorDelete(...Object.keys(LAYOUT_ANDROID.relative));
                    }
                }
            }
            alignParent(position) {
                const node = this.anchorTarget;
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        const attr = LAYOUT_ANDROID.constraint[position];
                        if (attr) {
                            return node.app(this.localizeString(attr)) === 'parent' || node.app(attr) === 'parent';
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        const attr = LAYOUT_ANDROID.relativeParent[position];
                        if (attr) {
                            return node.android(this.localizeString(attr)) === 'true' || node.android(attr) === 'true';
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
                            const attr = LAYOUT_ANDROID.constraint[position];
                            if (attr) {
                                node.app(this.localizeString(attr), documentId);
                            }
                        }
                        else if (renderParent.layoutRelative) {
                            const attr = LAYOUT_ANDROID.relative[position];
                            if (attr) {
                                node.android(this.localizeString(attr), documentId);
                            }
                        }
                    }
                    else {
                        if (renderParent.layoutConstraint) {
                            const attr = LAYOUT_ANDROID.constraint[position];
                            if (attr) {
                                const value = node.app(this.localizeString(attr)) || node.app(attr);
                                return value !== 'parent' && value !== renderParent.documentId ? value : '';
                            }
                        }
                        else if (renderParent.layoutRelative) {
                            const attr = LAYOUT_ANDROID.relative[position];
                            if (attr) {
                                return node.android(this.localizeString(attr)) || node.android(attr);
                            }
                        }
                    }
                }
                return '';
            }
            supported(attr, result = {}) {
                if (this.localSettings.targetAPI < 28 /* LATEST */) {
                    const deprecated = DEPRECATED_ANDROID.android;
                    if (deprecated && typeof deprecated[attr] === 'function') {
                        const valid = deprecated[attr](result, this.localSettings.targetAPI, this);
                        if (!valid || Object.keys(result).length) {
                            return valid;
                        }
                    }
                    for (let i = this.localSettings.targetAPI; i <= 28 /* LATEST */; i++) {
                        const version = API_ANDROID[i];
                        if (version && version.android[attr] !== undefined) {
                            const callback = version.android[attr];
                            if (typeof callback === 'function') {
                                return callback(result, this.localSettings.targetAPI, this);
                            }
                            return callback;
                        }
                    }
                }
                return true;
            }
            combine(...objs) {
                const result = [];
                let id;
                for (const value of this._namespaces) {
                    if (objs.length === 0 || objs.includes(value)) {
                        const obj = this[`__${value}`];
                        if (obj) {
                            for (const attr in obj) {
                                const item = (value !== '_' ? `${value}:` : '') + `${attr}="${obj[attr]}"`;
                                if (attr === 'id') {
                                    id = item;
                                }
                                else {
                                    result.push(item);
                                }
                            }
                        }
                    }
                }
                result.sort((a, b) => a > b ? 1 : -1);
                if (id) {
                    result.unshift(id);
                }
                return result;
            }
            localizeString(value) {
                if (this.hasProcedure($e.NODE_PROCEDURE.LOCALIZATION)) {
                    return localizeString(value, this.localSettings.supportRTL, this.localSettings.targetAPI);
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
                    if (this._boxReset) {
                        Object.assign(node.unsafe('boxReset'), this._boxReset);
                    }
                    if (this._boxAdjustment) {
                        Object.assign(node.unsafe('boxAdjustment'), this._boxAdjustment);
                    }
                    for (const name of this._namespaces) {
                        const obj = this[`__${name}`];
                        for (const attr in obj) {
                            node.attr(name, attr, name === 'android' && attr === 'id' ? node.documentId : obj[attr]);
                        }
                    }
                }
                if (position) {
                    node.anchorClear();
                    if (node.anchor('left', this.documentId)) {
                        node.modifyBox(16 /* MARGIN_LEFT */);
                        Object.assign(node.unsafe('boxAdjustment'), { marginLeft: 0 });
                    }
                    if (node.anchor('top', this.documentId)) {
                        node.modifyBox(2 /* MARGIN_TOP */);
                        Object.assign(node.unsafe('boxAdjustment'), { marginTop: 0 });
                    }
                }
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
                if (this.controlId === '') {
                    let name;
                    if (this.styleElement) {
                        name = validateString(this.elementId || $dom.getNamedItem(this.element, 'name'));
                        if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                            name = `_${name}`;
                        }
                    }
                    this.controlId = $util$3.convertWord(squared.base.ResourceUI.generateId('android', name || $util$3.fromLastIndexOf(this.controlName, '.').toLowerCase(), name ? 0 : 1));
                    this.android('id', this.documentId);
                }
            }
            setLayout() {
                const renderParent = this.renderParent;
                if (renderParent) {
                    switch (this.cssAscend('visibility', true)) {
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
                    let adjustViewBounds = false;
                    if (this.documentBody) {
                        if (this.css('width') === '100%' || this.css('minWidth') === '100%' || !this.hasWidth && this.renderChildren.some(node => node.alignParent('right'))) {
                            this.setLayoutWidth('match_parent', false);
                        }
                        if (this.css('height') === '100%' || this.css('minHeight') === '100%' || !this.hasHeight && this.renderChildren.some(node => node.alignParent('bottom'))) {
                            this.setLayoutHeight('match_parent', false);
                        }
                    }
                    if (this.layoutWidth === '') {
                        let layoutWidth = '';
                        if (this.hasPX('width') && (!this.inlineStatic || this.cssInitial('width') === '')) {
                            const width = this.css('width');
                            let value = -1;
                            if ($css$1.isLength(width)) {
                                value = this.actualWidth;
                            }
                            else if ($css$1.isPercent(width)) {
                                if (this.inputElement) {
                                    value = this.bounds.width;
                                }
                                else if (renderParent.layoutConstraint && !renderParent.hasPX('width', false)) {
                                    if (width === '100%') {
                                        layoutWidth = 'match_parent';
                                    }
                                    else {
                                        this.app(`layout_constraintWidth_percent`, $math$1.truncate(parseFloat(width) / 100, this.localSettings.floatPrecision));
                                        layoutWidth = '0px';
                                    }
                                    adjustViewBounds = true;
                                }
                                else if (renderParent.is(CONTAINER_NODE.GRID)) {
                                    layoutWidth = '0px';
                                    this.android('layout_columnWeight', $math$1.truncate(parseFloat(width) / 100, this.localSettings.floatPrecision));
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
                                    if (!this.support.maxWidth) {
                                        const maxWidth = this.css('maxWidth');
                                        const maxValue = this.parseUnit(maxWidth);
                                        const absoluteParent = this.absoluteParent || documentParent;
                                        if (maxWidth === '100%') {
                                            if (!renderParent.inlineWidth && $util$3.aboveRange(maxValue, absoluteParent.box.width)) {
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
                                layoutWidth = $css$1.formatPX(value);
                            }
                        }
                        else if (this.imageElement && this.hasPX('height')) {
                            layoutWidth = 'wrap_content';
                            adjustViewBounds = true;
                        }
                        if (layoutWidth === '') {
                            if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                                layoutWidth = $css$1.formatPX(this.actualWidth);
                            }
                            else {
                                if (this.blockStatic && !this.inputElement && !renderParent.is(CONTAINER_NODE.GRID)) {
                                    if (!documentParent.layoutElement || this.display === 'flex') {
                                        layoutWidth = 'match_parent';
                                    }
                                    else if (!documentParent.flexElement && renderParent.layoutConstraint && this.alignParent('left') && this.alignParent('right')) {
                                        layoutWidth = this.autoMargin.horizontal || this.ascend(item => item.hasPX('width') || item.blockStatic).length ? '0px' : 'match_parent';
                                    }
                                }
                                if (layoutWidth === '') {
                                    if (this.layoutVertical && !this.documentRoot && renderParent.blockStatic && (renderParent.layoutFrame && this.rightAligned || this.layoutLinear && this.naturalElements.some(item => item.lineBreak) || this.renderChildren.some(item => item.layoutConstraint && item.blockStatic)) ||
                                        !this.pageFlow && this.absoluteParent === documentParent && this.hasPX('left') && this.hasPX('right') ||
                                        documentParent.flexElement && this.flexbox.grow > 0 && renderParent.flexibleWidth && documentParent.css('flexDirection') === 'row') {
                                        layoutWidth = 'match_parent';
                                    }
                                    else if (this.naturalElement && !this.floating && this.some(item => item.naturalElement && item.blockStatic && item.textElement)) {
                                        let current = this.actualParent;
                                        while (current) {
                                            if (current.has('width')) {
                                                layoutWidth = 'match_parent';
                                                break;
                                            }
                                            else if (!current.blockStatic) {
                                                break;
                                            }
                                            current = current.actualParent;
                                        }
                                    }
                                }
                            }
                        }
                        this.setLayoutWidth(layoutWidth || 'wrap_content');
                    }
                    if (this.layoutHeight === '') {
                        let layoutHeight = '';
                        if (this.hasPX('height') && (!this.inlineStatic || this.cssInitial('height') === '')) {
                            const height = this.css('height');
                            let value = -1;
                            if ($css$1.isLength(height)) {
                                value = this.actualHeight;
                            }
                            else if ($css$1.isPercent(height)) {
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
                                    if (!this.support.maxHeight) {
                                        const maxHeight = this.css('maxHeight');
                                        const maxValue = this.parseUnit(maxHeight);
                                        const absoluteParent = this.absoluteParent || documentParent;
                                        if (maxHeight === '100%') {
                                            if (!renderParent.inlineHeight && $util$3.aboveRange(maxValue, absoluteParent.box.height)) {
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
                                    if (layoutHeight === '' && (this.documentRoot || !renderParent.inlineHeight)) {
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
                                layoutHeight = $css$1.formatPX(value);
                            }
                        }
                        else if (this.imageElement && this.hasPX('width')) {
                            layoutHeight = 'wrap_content';
                            adjustViewBounds = true;
                        }
                        if (layoutHeight === '') {
                            if (this.textElement && this.textEmpty && !this.visibleStyle.backgroundImage) {
                                if (renderParent.layoutConstraint && this.alignParent('top') && this.actualHeight >= (this.absoluteParent || documentParent).box.height) {
                                    layoutHeight = '0px';
                                    this.anchor('bottom', 'parent');
                                }
                                else {
                                    layoutHeight = $css$1.formatPX(this.actualHeight);
                                }
                            }
                            else if (this.display === 'table-cell' || !this.pageFlow && this.leftTopAxis && this.hasPX('top') && this.hasPX('bottom') || this.outerWrapper === undefined && this.onlyChild && renderParent.flexElement && !renderParent.inlineHeight && renderParent.css('flexDirection') === 'row') {
                                layoutHeight = 'match_parent';
                            }
                        }
                        this.setLayoutHeight(layoutHeight || 'wrap_content');
                    }
                    if (this.hasPX('minWidth') && !(documentParent.flexElement && this.flexbox.grow > 0 && documentParent.css('flexDirection') === 'column')) {
                        this.android('minWidth', this.convertPX(this.css('minWidth')), false);
                    }
                    if (this.hasPX('minHeight') && !(documentParent.flexElement && this.flexbox.grow > 0 && documentParent.css('flexDirection') === 'row')) {
                        this.android('minHeight', this.convertPX(this.css('minHeight'), 'height'), false);
                    }
                    if (this.support.maxWidth) {
                        const maxWidth = this.css('maxWidth');
                        let width = -1;
                        if ($css$1.isLength(maxWidth, true)) {
                            if (maxWidth === '100%') {
                                if (this.imageElement) {
                                    width = this.element.naturalWidth;
                                }
                                else if (this.svgElement) {
                                    width = this.bounds.width;
                                }
                            }
                            else {
                                width = this.parseUnit(this.css('maxWidth'));
                            }
                        }
                        else if (!this.pageFlow && this.multiline && this.inlineWidth && !this.preserveWhiteSpace) {
                            if (this.ascend(item => item.hasPX('width')).length > 0 || !/\n/.test(this.textContent)) {
                                width = Math.ceil(this.bounds.width);
                            }
                        }
                        if (width !== -1) {
                            this.android('maxWidth', $css$1.formatPX(width), false);
                            if (this.imageElement) {
                                adjustViewBounds = true;
                            }
                        }
                    }
                    if (this.support.maxHeight) {
                        const maxHeight = this.css('maxHeight');
                        if ($css$1.isLength(maxHeight, true)) {
                            let height = -1;
                            if (maxHeight === '100%' && this.imageElement) {
                                height = this.element.naturalHeight;
                            }
                            else {
                                height = this.parseUnit(this.css('maxHeight'), 'height');
                            }
                            if (height >= 0) {
                                this.android('maxHeight', $css$1.formatPX(height));
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
            }
            setAlignment() {
                const renderParent = this.renderParent;
                if (renderParent) {
                    const alignFloat = this.hasAlign(512 /* FLOAT */);
                    const node = this.outerWrapper || this;
                    const outerRenderParent = (node.renderParent || renderParent);
                    let textAlign = checkTextAlign(this.cssInitial('textAlign', true));
                    let textAlignParent = checkTextAlign(this.cssAscend('textAlign'), true);
                    if (this.nodeGroup && !alignFloat && textAlign === '') {
                        const parent = this.actualParent;
                        if (parent) {
                            textAlign = checkTextAlign(parent.cssInitial('textAlign', true));
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
                                else if (!setAutoMargin(node) && textAlign !== '' && this.hasWidth && !this.blockStatic && this.display !== 'table') {
                                    node.mergeGravity('layout_gravity', textAlign, false);
                                }
                            }
                            if (this.rightAligned || this.nodeGroup && this.renderChildren.length && this.renderChildren.every(item => item.rightAligned)) {
                                floating = 'right';
                            }
                            else if (this.nodeGroup && alignFloat && !this.renderChildren.some(item => item.rightAligned)) {
                                floating = 'left';
                            }
                        }
                        else if (node.nodeGroup && node.layoutVertical && this.rightAligned) {
                            node.renderEach((item) => {
                                if (item.rightAligned) {
                                    item.mergeGravity('layout_gravity', 'right');
                                }
                            });
                        }
                        if (renderParent.layoutFrame && this.innerWrapped === undefined) {
                            if (!setAutoMargin(this)) {
                                if (this.floating) {
                                    floating = this.float;
                                }
                                if (floating !== '' && !renderParent.naturalElement && (renderParent.inlineWidth || !renderParent.documentRoot && this.onlyChild)) {
                                    renderParent.mergeGravity('layout_gravity', floating);
                                    floating = '';
                                }
                                if (this.centerAligned) {
                                    this.mergeGravity('layout_gravity', checkTextAlign('center'));
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
                        else if (outerRenderParent.layoutFrame && renderParent.blockWidth && this.rightAligned) {
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
                        else if (setAutoMargin(node.inlineWidth ? node : this) && textAlign !== '') {
                            textAlignParent = '';
                        }
                    }
                    if (textAlignParent !== '') {
                        if (this.blockStatic && !this.centerAligned && !this.rightAligned) {
                            node.mergeGravity('layout_gravity', 'left', false);
                        }
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
                            else {
                                this.mergeGravity('gravity', textAlignParent);
                            }
                        }
                    }
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
                            if (alignment === STRING_ANDROID.CENTER_HORIZONTAL && this.alignSibling($c.STRING_BASE.LEFT_RIGHT) === '' && this.alignSibling($c.STRING_BASE.RIGHT_LEFT) === '') {
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
                                        if (this.alignSibling($c.STRING_BASE.RIGHT_LEFT) === '') {
                                            this.anchor('right', 'parent', false);
                                        }
                                        break;
                                    case 'bottom':
                                        this.anchor('bottom', 'parent', false);
                                        break;
                                    case 'left':
                                    case 'start':
                                        if (this.alignSibling($c.STRING_BASE.LEFT_RIGHT) === '') {
                                            this.anchor('left', 'parent', false);
                                        }
                                        break;
                                    case STRING_ANDROID.CENTER_HORIZONTAL:
                                        if (this.alignSibling($c.STRING_BASE.LEFT_RIGHT) === '' && this.alignSibling($c.STRING_BASE.LEFT_RIGHT) === '') {
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
                        result = checkTextAlign(direction.values().next().value);
                    default:
                        function checkMergable(value) {
                            const horizontal = `${value}_horizontal`;
                            const vertical = `${value}_vertical`;
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
                        result = x !== '' && y !== '' ? `${x}|${y}` : x || y;
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
                    const borderWidth = !this.tableElement ? this.styleElement : this.css('boxSizing') === 'content-box' || $client.isUserAgent(8 /* FIREFOX */);
                    if (borderWidth && this.visibleStyle.borderWidth && !this.is(CONTAINER_NODE.LINE) && (this.renderChildren.length === 0 || !this.naturalChildren.every(node => !node.pageFlow && node.absoluteParent === this))) {
                        this.modifyBox(256 /* PADDING_LEFT */, this.borderLeftWidth);
                        this.modifyBox(64 /* PADDING_RIGHT */, this.borderRightWidth);
                        this.modifyBox(32 /* PADDING_TOP */, this.borderTopWidth);
                        this.modifyBox(128 /* PADDING_BOTTOM */, this.borderBottomWidth);
                    }
                    this.alignLayout(renderParent);
                    this.setLineHeight(renderParent);
                    if (this.inlineWidth && this.renderChildren.some(node => node.blockWidth && node.some((item) => item.flexibleWidth))) {
                        this.setLayoutWidth(this.documentRoot || renderParent.inlineWidth ? $css$1.formatPX(this.actualWidth) : 'match_parent');
                    }
                }
            }
            applyCustomizations(overwrite = true) {
                const setCustomization = (build, tagName) => {
                    const assign = build.assign[tagName];
                    if (assign) {
                        for (const obj in assign) {
                            const data = assign[obj];
                            for (const attr in data) {
                                this.attr(obj, attr, data[attr], overwrite);
                            }
                        }
                    }
                };
                setCustomization(API_ANDROID[0], this.tagName);
                setCustomization(API_ANDROID[0], this.controlName);
                const api = API_ANDROID[this.localSettings.targetAPI];
                if (api) {
                    setCustomization(api, this.tagName);
                    setCustomization(api, this.controlName);
                }
            }
            setBoxSpacing() {
                const boxReset = this._boxReset;
                const boxAdjustment = this._boxAdjustment;
                const setBoxModel = (attrs, margin, unmergeable = false) => {
                    let top = 0;
                    let right = 0;
                    let bottom = 0;
                    let left = 0;
                    for (let i = 0; i < 4; i++) {
                        const attr = attrs[i];
                        let value = boxReset === undefined || boxReset[attr] === 0 ? this[attr] : 0;
                        if (value !== 0 && attr === 'marginRight') {
                            if (value < 0) {
                                if (this.float === 'right') {
                                    value = 0;
                                }
                            }
                            else if (this.inline) {
                                const boxRight = this.documentParent.box.right;
                                const boundsRight = this.bounds.right;
                                if (Math.floor(boundsRight) > boxRight) {
                                    if (!this.onlyChild && !this.alignParent('left')) {
                                        setSingleLine(this, true);
                                    }
                                    continue;
                                }
                                else if (boundsRight + value > boxRight) {
                                    value = Math.max(0, boxRight - boundsRight);
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
                        if (!unmergeable && this.localSettings.targetAPI >= 26 /* OREO */) {
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
                            this.android(margin ? STRING_ANDROID.MARGIN : STRING_ANDROID.PADDING, $css$1.formatPX(mergeAll));
                        }
                        else {
                            if (mergeHorizontal !== 0) {
                                this.android(margin ? STRING_ANDROID.MARGIN_HORIZONTAL : STRING_ANDROID.PADDING_HORIZONTAL, $css$1.formatPX(mergeHorizontal));
                            }
                            else {
                                if (left !== 0) {
                                    this.android(this.localizeString(margin ? STRING_ANDROID.MARGIN_LEFT : STRING_ANDROID.PADDING_LEFT), $css$1.formatPX(left));
                                }
                                if (right !== 0) {
                                    this.android(this.localizeString(margin ? STRING_ANDROID.MARGIN_RIGHT : STRING_ANDROID.PADDING_RIGHT), $css$1.formatPX(right));
                                }
                            }
                            if (mergeVertical !== 0) {
                                this.android(margin ? STRING_ANDROID.MARGIN_VERTICAL : STRING_ANDROID.PADDING_VERTICAL, $css$1.formatPX(mergeVertical));
                            }
                            else {
                                if (top !== 0) {
                                    this.android(margin ? STRING_ANDROID.MARGIN_TOP : STRING_ANDROID.PADDING_TOP, $css$1.formatPX(top));
                                }
                                if (bottom !== 0) {
                                    this.android(margin ? STRING_ANDROID.MARGIN_BOTTOM : STRING_ANDROID.PADDING_BOTTOM, $css$1.formatPX(bottom));
                                }
                            }
                        }
                    }
                };
                setBoxModel($css$1.BOX_MARGIN, true, !!this.renderParent && this.renderParent.is(CONTAINER_NODE.GRID));
                setBoxModel($css$1.BOX_PADDING, false);
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
                    const dataset = $css$1.getDataSet(this.element, 'android');
                    for (const name in dataset) {
                        const obj = name === 'attr' ? 'android'
                            : REGEXP_DATASETATTR.test(name) ? $util$3.capitalize(name.substring(4), false) : '';
                        if (obj !== '') {
                            for (const values of dataset[name].split(';')) {
                                const [key, value] = values.split('::');
                                if (key && value) {
                                    this.attr(obj, key, value);
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
                    const children = this.renderChildren;
                    if (this.layoutVertical) {
                        if (!renderParent.layoutVertical && !renderParent.layoutFrame && !this.documentRoot && !this.hasAlign(1024 /* TOP */)) {
                            let firstChild = children[0];
                            if (firstChild.baseline) {
                                if (firstChild.renderChildren.length) {
                                    firstChild = firstChild.renderChildren[0];
                                }
                                if (firstChild.baseline && (firstChild.textElement || firstChild.inputElement)) {
                                    this.android('baselineAlignedChildIndex', '0');
                                }
                            }
                        }
                    }
                    else {
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
                            setSingleLine(children[i], i === length - 1);
                        }
                    }
                }
            }
            setLineHeight(renderParent) {
                let lineHeight = this.lineHeight;
                if (lineHeight > 0) {
                    const hasOwnStyle = this.has('lineHeight');
                    if (this.multiline) {
                        setMultiline(this, lineHeight, hasOwnStyle);
                    }
                    else {
                        const hasChildren = this.renderChildren.length > 0;
                        if (hasOwnStyle || hasChildren || renderParent.lineHeight === 0) {
                            if (!hasChildren) {
                                setMarginOffset(this, lineHeight, hasOwnStyle);
                            }
                            else {
                                if (this.inline) {
                                    this.renderEach(item => {
                                        if (item.lineHeight > lineHeight) {
                                            lineHeight = item.lineHeight;
                                        }
                                        item.setCacheValue('lineHeight', 0);
                                    });
                                    setMarginOffset(this, lineHeight, hasOwnStyle);
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
                                            const nextBaseline = horizontalRows[i + 1].find(node => node.baselineActive);
                                            if (nextBaseline && nextBaseline.has('lineHeight')) {
                                                nextMultiline = true;
                                            }
                                        }
                                        const baseline = row.find(node => node.baselineActive);
                                        const top = !previousMultiline && (i > 0 || length === 1) || row[0].lineBreakLeading;
                                        const bottom = !nextMultiline && (i < length - 1 || length === 1);
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
                                                if (node.length === 0 && !node.has('lineHeight') && !node.multiline && !node.baselineAltered) {
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
                return this.controlId ? `@+id/${this.controlId}` : '';
            }
            get anchorTarget() {
                const renderParent = this.renderParent;
                if (renderParent && (renderParent.layoutConstraint || renderParent.layoutRelative)) {
                    return this;
                }
                return this.outerWrapper || this;
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
                        if (this.blockStatic || this.layoutVertical) {
                            result = this.contentBoxHeight === 0 && (this.bounds.height === 0 && this.marginTop <= 0 && this.marginBottom <= 0 || this.css('height') === '0px' && this.css('overflow') === 'hidden');
                        }
                        else {
                            result = this.bounds.width === 0 && this.contentBoxWidth === 0 && this.textEmpty && this.marginLeft <= 0 && this.marginRight <= 0;
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
                        result = this.bounds.height / (this.bounds.numberOfLines || 1);
                    }
                    else {
                        if (this.multiline && this.cssTry('white-space', 'nowrap')) {
                            result = this.element.getBoundingClientRect().height;
                            this.cssFinally('white-space');
                        }
                        else if (this.hasHeight) {
                            result = this.actualHeight;
                        }
                        else {
                            result = this.bounds.height;
                        }
                        if (this.has('lineHeight') && this.lineHeight > result) {
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
                                    result /= this.element.size || 1;
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
            get support() {
                let result = this._cached.support;
                if (result === undefined) {
                    const maxWidth = this.textElement || this.imageOrSvgElement;
                    result = {
                        container: {
                            positionRelative: this.layoutRelative || this.layoutConstraint
                        },
                        maxWidth,
                        maxHeight: maxWidth
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
            this.containerName = `${node.containerName}_GROUP`;
            this.actualParent = node.actualParent;
            this.documentParent = node.documentParent;
            this.retain(children);
        }
    }

    const { client: $client$1, color: $color$1, css: $css$2, dom: $dom$1, math: $math$2, regex: $regex$1, session: $session, util: $util$4, xml: $xml } = squared.lib;
    const { constant: $c$1, enumeration: $e$1 } = squared.base.lib;
    const $NodeUI = squared.base.NodeUI;
    const GUIDELINE_AXIS = [STRING_ANDROID.HORIZONTAL, STRING_ANDROID.VERTICAL];
    const CACHE_PATTERN = {};
    let DEFAULT_VIEWSETTINGS;
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
    function sortConstraintAbsolute(templates) {
        if (templates.length > 1) {
            templates.sort((a, b) => {
                const above = a.node.innerWrapped || a.node;
                const below = b.node.innerWrapped || b.node;
                if (above.absoluteParent === below.absoluteParent) {
                    if (above.zIndex === below.zIndex) {
                        return above.childIndex < below.childIndex ? -1 : 1;
                    }
                    return above.zIndex < below.zIndex ? -1 : 1;
                }
                else if (above.intersectX(below.bounds, 'bounds') && above.intersectY(below.bounds, 'bounds')) {
                    if (above.depth === below.depth) {
                        return 0;
                    }
                    return above.id < below.id ? -1 : 1;
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
                        else if ($util$4.withinRange(node.linear.top, node.documentParent.box.top)) {
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
            return children.length && children.every(item => item.baseline && !item.baselineAltered && (!item.positionRelative || item.positionRelative && item.top === 0 && item.bottom === 0));
        }
        else if (node.layoutVertical) {
            const children = node.renderChildren;
            const firstChild = children[0];
            return firstChild && firstChild.baseline && (children.length === 1 || firstChild.textElement);
        }
        return false;
    }
    function checkSingleLine(node, nowrap) {
        if (node.textElement && !node.hasPX('width') && !node.multiline && (nowrap || node.textContent.trim().indexOf(' ') !== -1)) {
            const parent = node.actualParent;
            if (!parent.preserveWhiteSpace && parent.tagName !== 'CODE') {
                node.android('maxLines', '1');
            }
            if (!node.floating && !node.centerAligned) {
                node.android('ellipsize', 'end');
            }
            return true;
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
        else if (node.float === 'right' && previous.float === 'right') {
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
        if (!node.inputElement && !node.imageOrSvgElement) {
            const documentParent = node.documentParent;
            const renderParent = node.renderParent;
            if (renderParent) {
                function setAlignmentBlock() {
                    if (renderParent.nodeGroup) {
                        renderParent.addAlign(64 /* BLOCK */);
                        renderParent.unsetCache('blockStatic');
                    }
                }
                if (!node.blockWidth && !documentParent.flexElement) {
                    const minWH = node.cssInitial(horizontal ? 'minWidth' : 'minHeight', true);
                    if ($css$2.isLength(minWH, true) && minWH !== '0px') {
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
                            node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', $css$2.formatPX(node.parseUnit(minWH, dimension.toLowerCase())));
                            node.css(horizontal ? 'minWidth' : 'minHeight', 'auto');
                        }
                    }
                }
                const maxWH = node.cssInitial(horizontal ? 'maxWidth' : 'maxHeight', true);
                let contentBox = 0;
                if ($css$2.isLength(maxWH, true)) {
                    let valid = false;
                    if (horizontal) {
                        if (node.outerWrapper || node.ascend(item => item.hasPX('width') || item.blockStatic).length) {
                            node.setLayoutWidth(renderParent.flexibleWidth ? 'match_parent' : '0px', node.innerWrapped && node.innerWrapped.naturalChild);
                            valid = node.flexibleWidth;
                            setAlignmentBlock();
                            if (valid && !$css$2.isPercent(maxWH)) {
                                contentBox += node.contentBoxWidth;
                            }
                        }
                    }
                    else if ((node.absoluteParent || documentParent).hasHeight && !node.hasPX('height')) {
                        node.setLayoutHeight(renderParent.flexibleHeight ? 'match_parent' : '0px', node.innerWrapped && node.innerWrapped.naturalChild);
                        valid = node.flexibleHeight;
                        if (valid && !$css$2.isPercent(maxWH)) {
                            contentBox += node.contentBoxHeight;
                        }
                    }
                    if (valid) {
                        const maxDimension = node.parseUnit(maxWH, dimension.toLowerCase());
                        node.app(horizontal ? 'layout_constraintWidth_max' : 'layout_constraintHeight_max', $css$2.formatPX(maxDimension + contentBox));
                        if (horizontal && node.layoutVertical) {
                            node.each(item => {
                                if (item.textElement && !item.hasPX('maxWidth')) {
                                    item.css('maxWidth', $css$2.formatPX(maxDimension));
                                }
                            });
                        }
                    }
                }
            }
        }
    }
    function constraintPercentValue(node, dimension, horizontal, opposing) {
        const value = node.cssInitial(dimension, true);
        let unit;
        if (opposing) {
            if ($css$2.isLength(value, true)) {
                unit = $css$2.formatPX(node.bounds[dimension]);
                if (node.imageElement) {
                    const element = node.element;
                    if (element && element.naturalWidth > 0 && element.naturalHeight > 0) {
                        const opposingUnit = (node.bounds[dimension] / (horizontal ? element.naturalWidth : element.naturalHeight)) * (horizontal ? element.naturalHeight : element.naturalWidth);
                        if (horizontal) {
                            node.setLayoutHeight($css$2.formatPX(opposingUnit), false);
                        }
                        else {
                            node.setLayoutWidth($css$2.formatPX(opposingUnit), false);
                        }
                    }
                }
            }
        }
        else if ($css$2.isPercent(value) && value !== '100%') {
            const percent = parseFloat(value) / 100;
            node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', $math$2.truncate(percent, node.localSettings.floatPrecision));
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
            if ($css$2.isPercent(value) && value !== '100%') {
                node.setLayoutWidth($css$2.formatPX(node.bounds.width));
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
                if ($css$2.isPercent(value) && value !== '100%') {
                    node.setLayoutHeight($css$2.formatPX(node.bounds.height));
                }
            }
            else {
                constraintPercentValue(node, 'height', false, opposing);
            }
        }
        else if ($css$2.isLength(node.cssInitial('height'), true)) {
            node.setLayoutHeight($css$2.formatPX(node.bounds.height), false);
        }
    }
    function isTargeted(parent, node) {
        if (parent.element && node.dataset.target) {
            const element = document.getElementById(node.dataset.target);
            return element !== null && element !== parent.element;
        }
        return false;
    }
    function getTextBottom(nodes) {
        return $util$4.filterArray(nodes, node => (node.baseline || $css$2.isLength(node.verticalAlign, true)) && (node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' && node.element.size > 1) || node.verticalAlign === 'text-bottom' && node.containerName !== 'INPUT_IMAGE').sort((a, b) => {
            if (a.baselineHeight === b.baselineHeight) {
                return a.tagName === 'SELECT' ? 1 : 0;
            }
            return a.baselineHeight > b.baselineHeight ? -1 : 1;
        });
    }
    function getAnchorDirection(reverse) {
        if (reverse) {
            return ['right', 'left', $c$1.STRING_BASE.RIGHT_LEFT, $c$1.STRING_BASE.LEFT_RIGHT];
        }
        else {
            return ['left', 'right', $c$1.STRING_BASE.LEFT_RIGHT, $c$1.STRING_BASE.RIGHT_LEFT];
        }
    }
    function causesLineBreak(element, sessionId) {
        if (element.tagName === 'BR') {
            return true;
        }
        else {
            const node = $session.getElementAsNode(element, sessionId);
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
                item.anchor($c$1.STRING_BASE.LEFT_RIGHT, seg[i - 1].documentId);
            }
            if (i < length - 1) {
                item.anchor($c$1.STRING_BASE.RIGHT_LEFT, seg[i + 1].documentId);
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
                            previousRow.anchor($c$1.STRING_BASE.BOTTOM_TOP, item.documentId);
                            item.anchor($c$1.STRING_BASE.TOP_BOTTOM, typeof previousRow === 'string' ? previousRow : previousRow.documentId);
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
                    seg[j - 1].anchor($c$1.STRING_BASE.BOTTOM_TOP, item.documentId);
                    item.anchor($c$1.STRING_BASE.TOP_BOTTOM, seg[j - 1].documentId);
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
                        if (adjacent && !adjacent.multiline && $util$4.withinRange(item.bounds.top, adjacent.bounds.top)) {
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
                    baseTemplate: $xml.STRING_XMLENCODING
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
                    inputBackgroundColor: $client$1.isPlatform(4 /* MAC */) ? 'rgb(255, 255, 255)' : 'rgb(221, 221, 221)',
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
                        'MAP',
                        'AREA',
                        'SOURCE',
                        'TEMPLATE',
                        'DATALIST'
                    ]),
                    excluded: new Set(['BR', 'WBR', 'RP'])
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
            const basis = flexbox.basis;
            function setFlexGrow(value, grow) {
                node.android(horizontal ? 'layout_width' : 'layout_height', '0px');
                if (grow > 0) {
                    node.app(horizontal ? 'layout_constraintHorizontal_weight' : 'layout_constraintVertical_weight', $math$2.truncate(grow, node.localSettings.floatPrecision));
                    if (value !== '') {
                        node.css(horizontal ? 'minWidth' : 'minHeight', value, true);
                    }
                }
                else if (value !== '') {
                    if (flexbox.shrink < 1) {
                        node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', $css$2.formatPX((1 - flexbox.shrink) * parseFloat(value)));
                        node.app(horizontal ? 'layout_constraintWidth_max' : 'layout_constraintHeight_max', value);
                    }
                    else {
                        node.app(horizontal ? 'layout_constraintWidth_min' : 'layout_constraintHeight_min', value);
                    }
                }
            }
            if ($css$2.isLength(basis)) {
                setFlexGrow(node.convertPX(basis), node.flexbox.grow);
            }
            else if (basis !== '0%' && $css$2.isPercent(basis)) {
                node.app(horizontal ? 'layout_constraintWidth_percent' : 'layout_constraintHeight_percent', (parseFloat(basis) / 100).toPrecision(node.localSettings.floatPrecision));
                setFlexGrow('', node.flexbox.grow);
            }
            else if (flexbox.grow > 0) {
                setFlexGrow(node.hasPX(dimension, false) ? $css$2.formatPX(node[horizontal ? 'actualWidth' : 'actualHeight']) : '', node.flexbox.grow);
            }
            else {
                if (horizontal) {
                    constraintPercentWidth(node, false);
                }
                else {
                    constraintPercentHeight(node, false);
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
                targetAPI: settings.targetAPI || 28 /* LATEST */,
                supportRTL: typeof settings.supportRTL === 'boolean' ? settings.supportRTL : true,
                floatPrecision: this.localSettings.precision.standardFloat
            };
        }
        optimize(nodes) {
            for (const node of nodes) {
                node.applyOptimizations();
                if (node.hasProcedure($e$1.NODE_PROCEDURE.CUSTOMIZATION)) {
                    node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
                }
            }
        }
        finalize(layouts) {
            const insertSpaces = this.userSettings.insertSpaces;
            for (const layout of layouts) {
                layout.content = $xml.replaceTab(layout.content.replace(/{#0}/, getRootNs(layout.content)), insertSpaces);
            }
        }
        processUnknownParent(layout) {
            const node = layout.node;
            if (node.has('columnCount') || node.hasPX('columnWidth')) {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 256 /* COLUMN */ | 4 /* AUTO_LAYOUT */);
            }
            else if (layout.some(item => !item.pageFlow && !item.positionAuto)) {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */ | 2 /* UNKNOWN */);
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
                        layout.setType(CONTAINER_NODE.TEXT);
                    }
                    else if (node.autoMargin.horizontal || layout.parent.layoutConstraint && layout.parent.flexElement && node.flexbox.alignSelf === 'baseline' && child.textElement) {
                        layout.setType(CONTAINER_NODE.LINEAR, 8 /* HORIZONTAL */ | 4096 /* SINGLE */);
                    }
                    else {
                        if (child.percentWidth) {
                            if (!node.hasPX('width')) {
                                node.setLayoutWidth('match_parent');
                            }
                            layout.setType(CONTAINER_NODE.CONSTRAINT, 4096 /* SINGLE */ | 64 /* BLOCK */);
                        }
                        else if (child.baseline && (child.textElement || child.inputElement)) {
                            layout.setType(CONTAINER_NODE.LINEAR, 16 /* VERTICAL */);
                        }
                        else {
                            layout.setType(CONTAINER_NODE.FRAME, 4096 /* SINGLE */);
                        }
                    }
                }
                else {
                    return this.processUnknownChild(layout);
                }
            }
            else if (Resource.hasLineBreak(node, true)) {
                layout.setType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */ | 2 /* UNKNOWN */);
            }
            else if (this.checkConstraintFloat(layout)) {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
            }
            else if (layout.linearX) {
                if (this.checkFrameHorizontal(layout)) {
                    layout.renderType |= 512 /* FLOAT */ | 8 /* HORIZONTAL */;
                }
                else if (this.checkConstraintHorizontal(layout)) {
                    layout.setType(CONTAINER_NODE.CONSTRAINT);
                }
                else if (this.checkLinearHorizontal(layout)) {
                    layout.setType(CONTAINER_NODE.LINEAR);
                    if (layout.floated.size) {
                        sortHorizontalFloat(layout.children);
                    }
                }
                else {
                    layout.setType(CONTAINER_NODE.RELATIVE);
                }
                layout.add(8 /* HORIZONTAL */);
            }
            else if (layout.linearY) {
                layout.setType(getRelativeVertical(layout), 16 /* VERTICAL */ | (node.documentRoot ? 2 /* UNKNOWN */ : 0));
            }
            else if (layout.every(item => item.inlineFlow)) {
                if (this.checkFrameHorizontal(layout)) {
                    layout.renderType |= 512 /* FLOAT */ | 8 /* HORIZONTAL */;
                }
                else {
                    layout.setType(getRelativeVertical(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
                }
            }
            else if (layout.some(item => item.alignedVertically(item.childIndex > 0 ? layout.children.slice(0, item.childIndex) : undefined, layout.cleared) > 0)) {
                layout.setType(getRelativeVertical(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
            }
            else {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 2 /* UNKNOWN */);
            }
            return { layout };
        }
        processUnknownChild(layout) {
            const node = layout.node;
            const style = node.visibleStyle;
            if (node.inlineText && (!node.textEmpty || style.borderWidth)) {
                layout.setType(CONTAINER_NODE.TEXT);
            }
            else if (node.blockStatic && (style.borderWidth || style.backgroundImage || node.paddingTop + node.paddingBottom > 0) && node.naturalElements.length === 0) {
                layout.setType(CONTAINER_NODE.FRAME);
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
                layout.setType(CONTAINER_NODE.TEXT);
                node.inlineText = true;
            }
            else {
                layout.setType(CONTAINER_NODE.FRAME);
            }
            return { layout };
        }
        processTraverseHorizontal(layout, siblings) {
            const parent = layout.parent;
            if (layout.floated.size === 1 && layout.same((item, index) => item.floating && (item.positiveAxis || item.renderExclude) ? -1 : index)) {
                layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                layout.setType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
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
                    layout.setType(getRelativeVertical(layout), 16 /* VERTICAL */ | 2 /* UNKNOWN */);
                }
            }
            else if (floated.size === 1 && layout.every((item, index) => index === 0 || index === layout.length - 1 || cleared.has(item))) {
                layout.node = this.createLayoutNodeGroup(layout);
                if (layout.same(node => node.float)) {
                    layout.setType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
                }
                else if (cleared.size) {
                    layout.renderType |= 512 /* FLOAT */ | 8 /* HORIZONTAL */;
                }
                else {
                    layout.setType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */);
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
                layout.setType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */);
            }
            return layout;
        }
        processLayoutHorizontal(layout) {
            if (this.checkConstraintFloat(layout, true)) {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
            }
            else if (this.checkConstraintHorizontal(layout)) {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 8 /* HORIZONTAL */);
            }
            else if (this.checkLinearHorizontal(layout)) {
                layout.setType(CONTAINER_NODE.LINEAR, 8 /* HORIZONTAL */);
                if (layout.floated.size) {
                    sortHorizontalFloat(layout.children);
                }
            }
            else {
                layout.setType(CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */);
            }
            return layout;
        }
        sortRenderPosition(parent, templates) {
            if (parent.layoutConstraint && templates.some(item => !item.node.pageFlow || item.node.zIndex !== 0)) {
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
            if (floated.size === 2) {
                return true;
            }
            else {
                if ((floated.has('right') || floated.size === 1 && layout.node.cssAscend('textAlign', true) === 'center') && layout.some(node => node.pageFlow)) {
                    return true;
                }
                else if (floated.has('left') && !layout.linearX) {
                    const node = layout.item(0);
                    return node.pageFlow && node.floating;
                }
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
            if ((floated.size === 0 || floated.size === 1 && floated.has('left')) && layout.singleRowAligned) {
                const { fontSize, lineHeight } = layout.children[0];
                for (const node of layout) {
                    if (!(node.naturalChild && node.length === 0 && !node.inputElement && !node.positionRelative && !node.blockVertical && !node.positionAuto && (lineHeight === 0 || node.lineHeight === lineHeight && node.fontSize === fontSize) && node.tagName !== 'WBR' && (node.baseline || node.cssAny('verticalAlign', 'top', 'middle', 'bottom')))) {
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
                else if (node.layoutConstraint && node.hasProcedure($e$1.NODE_PROCEDURE.CONSTRAINT)) {
                    const children = node.renderFilter((item) => !item.positioned);
                    if (children.length) {
                        const [pageFlow, absolute] = $util$4.partitionArray(children, item => item.pageFlow || item.positionAuto);
                        if (absolute.length) {
                            for (const item of absolute) {
                                if (item.leftTopAxis) {
                                    if (item.hasWidth && item.autoMargin.horizontal) {
                                        if (item.hasPX('left') && item.autoMargin.right) {
                                            item.anchor('left', 'parent');
                                            item.modifyBox(16 /* MARGIN_LEFT */, item.left);
                                        }
                                        else if (item.hasPX('right') && item.autoMargin.left) {
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
                                    if (item.hasHeight && item.autoMargin.vertical) {
                                        if (item.hasPX('top') && item.autoMargin.bottom) {
                                            item.anchor('top', 'parent');
                                            item.modifyBox(2 /* MARGIN_TOP */, item.top);
                                        }
                                        else if (item.hasPX('bottom') && item.autoMargin.top) {
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
                                    if (item.constraint.horizontal) {
                                        item.anchorParent(STRING_ANDROID.HORIZONTAL);
                                    }
                                    if (item.constraint.vertical) {
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
                    if ($util$4.hasBit(alignmentType, 16 /* VERTICAL */)) {
                        options.android.orientation = STRING_ANDROID.VERTICAL;
                        valid = true;
                    }
                    else if ($util$4.hasBit(alignmentType, 8 /* HORIZONTAL */)) {
                        options.android.orientation = STRING_ANDROID.HORIZONTAL;
                        valid = true;
                    }
                    break;
                case CONTAINER_NODE.GRID:
                    options.android.rowCount = layout.rowCount ? layout.rowCount.toString() : '';
                    options.android.columnCount = layout.columnCount ? layout.columnCount.toString() : '2';
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
                node.setControlType(View.getControlName(containerType), containerType);
                node.addAlign(alignmentType);
                node.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : layout.parent);
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
            const node = layout.node;
            let controlName = View.getControlName(layout.containerType);
            node.setControlType(controlName, layout.containerType);
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
                        imageSet = $css$2.getSrcSet(element, this.localSettings.supported.imageFormat);
                        if (imageSet.length) {
                            if (imageSet[0].actualWidth) {
                                if (percentWidth === -1) {
                                    width = imageSet[0].actualWidth;
                                    node.css('width', $css$2.formatPX(width), true);
                                    const image = this.application.resourceHandler.getImage(element.src);
                                    if (image && image.width > 0 && image.height > 0) {
                                        height = image.height * (width / image.width);
                                        node.css('height', $css$2.formatPX(height), true);
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
                    if (node.hasResource($e$1.NODE_RESOURCE.IMAGE_SOURCE)) {
                        const src = this.application.resourceHandler.addImageSrc(element, '', imageSet);
                        if (src !== '') {
                            node.android('src', `@drawable/${src}`);
                        }
                    }
                    if (percentWidth !== -1 || percentHeight !== -1) {
                        if (percentWidth >= 0) {
                            width *= absoluteParent.box.width / 100;
                            if (percentWidth < 100 && !parent.layoutConstraint) {
                                node.css('width', $css$2.formatPX(width));
                                node.android('adjustViewBounds', 'true');
                            }
                        }
                        if (percentHeight >= 0) {
                            height *= absoluteParent.box.height / 100;
                            if (percentHeight < 100 && !(parent.layoutConstraint && absoluteParent.hasHeight)) {
                                node.css('height', $css$2.formatPX(height));
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
                        container.exclude($e$1.NODE_RESOURCE.ALL, $e$1.NODE_PROCEDURE.ALL);
                        container.cssApply({
                            position: node.css('position'),
                            zIndex: node.zIndex.toString()
                        });
                        parent.appendTry(node, container);
                        node.parent = container;
                        if (width > 0) {
                            container.setLayoutWidth(width < absoluteParent.box.width ? $css$2.formatPX(width) : 'match_parent');
                        }
                        else {
                            container.setLayoutWidth('wrap_content');
                        }
                        if (height > 0) {
                            container.setLayoutHeight(height < absoluteParent.box.height ? $css$2.formatPX(height) : 'match_parent');
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
                            if ($util$4.isString(element.min)) {
                                node.android('min', element.min);
                            }
                            if ($util$4.isString(element.max)) {
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
                        node.css('width', $css$2.formatPX(element.cols * 8), true);
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
                        node.css('minWidth', $css$2.formatPX(node.actualWidth), true);
                        node.css('display', 'inline-block', true);
                    }
                    node.modifyBox(8 /* MARGIN_BOTTOM */, node.actualHeight * this.localSettings.deviations.legendBottomOffset);
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
                        node.css('width', $css$2.formatPX(node.bounds.width), true);
                    }
                    if (!node.hasHeight) {
                        node.css('height', $css$2.formatPX(node.bounds.height), true);
                    }
                    node.android('progressTint', `@color/${Resource.addColor(foregroundColor)}`);
                    node.android('progressBackgroundTint', `@color/${Resource.addColor(backgroundColor)}`);
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
                        node.android('letterSpacing', $math$2.truncate(node.toFloat('letterSpacing') / node.fontSize, this.localSettings.precision.standardFloat));
                    }
                    if (node.css('textAlign') === 'justify') {
                        node.android('justificationMode', 'inter_word');
                    }
                    if (node.has('textShadow')) {
                        if (CACHE_PATTERN.TEXT_SHADOW === undefined) {
                            CACHE_PATTERN.TEXT_SHADOW = /^(rgba?\([^)]+\)|[a-z]+) (-?[\d.]+[a-z]+) (-?[\d.]+[a-z]+)\s*(-?[\d.]+[a-z]+)?$/;
                        }
                        const match = CACHE_PATTERN.TEXT_SHADOW.exec(node.css('textShadow'));
                        if (match) {
                            const color = Resource.addColor($color$1.parseColor(match[1]));
                            if (color !== '') {
                                node.android('shadowColor', `@color/${color}`);
                                node.android('shadowDx', $math$2.truncate($css$2.parseUnit(match[2], node.fontSize) * 2));
                                node.android('shadowDy', $math$2.truncate($css$2.parseUnit(match[3], node.fontSize) * 2));
                                node.android('shadowRadius', match[4] ? $math$2.truncate(Math.max($css$2.parseUnit(match[4], node.fontSize), 1)) : '1');
                            }
                        }
                    }
                    if (node.css('whiteSpace') === 'nowrap' && node.textContent.length > 1) {
                        node.android('maxLines', '1');
                        node.android('ellipsize', 'end');
                    }
                    break;
                case CONTAINER_ANDROID.BUTTON:
                    if (!node.hasHeight) {
                        node.android('minHeight', $css$2.formatPX(Math.ceil(node.actualHeight)));
                    }
                    node.mergeGravity('gravity', STRING_ANDROID.CENTER_VERTICAL);
                    break;
                case CONTAINER_ANDROID.EDIT: {
                    const element = node.element;
                    if (element.list && element.list.children.length) {
                        controlName = CONTAINER_ANDROID.EDIT_LIST;
                        node.controlName = controlName;
                    }
                }
                case CONTAINER_ANDROID.RANGE:
                    if (!node.hasPX('width')) {
                        node.css('width', $css$2.formatPX(node.bounds.width), true);
                    }
                    break;
                case CONTAINER_ANDROID.LINE:
                    if (!node.hasHeight) {
                        node.setLayoutHeight($css$2.formatPX(node.contentBoxHeight || 1));
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
            if ($css$2.isPercent(width)) {
                options.android.layout_columnWeight = $math$2.truncate(parseFloat(width) / 100, this.localSettings.precision.standardFloat);
                width = '0px';
            }
            if (height && $css$2.isPercent(height)) {
                options.android.layout_rowWeight = $math$2.truncate(parseFloat(height) / 100, this.localSettings.precision.standardFloat);
                height = '0px';
            }
            if (columnSpan) {
                options.android.layout_columnSpan = columnSpan.toString();
            }
            if (rowSpan) {
                options.android.layout_rowSpan = rowSpan.toString();
            }
            return this.renderNodeStatic(CONTAINER_ANDROID.SPACE, options, width, height || undefined);
        }
        addGuideline(node, parent, orientation, percent = false, opposite = false) {
            const absoluteParent = node.absoluteParent;
            const boxParent = parent.nodeGroup && !node.documentParent.hasAlign(4 /* AUTO_LAYOUT */) ? parent : node.documentParent;
            GUIDELINE_AXIS.forEach(value => {
                if (!node.constraint[value] && (!orientation || value === orientation)) {
                    const horizontal = value === STRING_ANDROID.HORIZONTAL;
                    const box = boxParent.box;
                    let LT;
                    let RB;
                    let LTRB;
                    let RBLT;
                    if (horizontal) {
                        LT = !opposite ? 'left' : 'right';
                        RB = !opposite ? 'right' : 'left';
                        LTRB = !opposite ? $c$1.STRING_BASE.LEFT_RIGHT : $c$1.STRING_BASE.RIGHT_LEFT;
                        RBLT = !opposite ? $c$1.STRING_BASE.RIGHT_LEFT : $c$1.STRING_BASE.LEFT_RIGHT;
                    }
                    else {
                        LT = !opposite ? 'top' : 'bottom';
                        RB = !opposite ? 'bottom' : 'top';
                        LTRB = !opposite ? $c$1.STRING_BASE.TOP_BOTTOM : $c$1.STRING_BASE.BOTTOM_TOP;
                        RBLT = !opposite ? $c$1.STRING_BASE.BOTTOM_TOP : $c$1.STRING_BASE.TOP_BOTTOM;
                    }
                    if ($util$4.withinRange(node.linear[LT], box[LT])) {
                        node.anchor(LT, 'parent', true);
                        return;
                    }
                    const bounds = node.positionStatic ? node.bounds : node.linear;
                    let beginPercent = 'layout_constraintGuide_';
                    let location;
                    if (!percent && !parent.hasAlign(4 /* AUTO_LAYOUT */)) {
                        const found = parent.renderChildren.some(item => {
                            if (item !== node && item.constraint[value]) {
                                let valid = false;
                                if (node.pageFlow && item.pageFlow) {
                                    if ($util$4.withinRange(node.linear[LT], item.linear[RB])) {
                                        node.anchor(LTRB, item.documentId, true);
                                        valid = true;
                                    }
                                    else if ($util$4.withinRange(node.linear[RB], item.linear[LT])) {
                                        node.anchor(RBLT, item.documentId, true);
                                        valid = true;
                                    }
                                }
                                if (!valid) {
                                    if ($util$4.withinRange(node.bounds[LT], item.bounds[LT])) {
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
                                    else if ($util$4.withinRange(node.bounds[RB], item.bounds[RB])) {
                                        node.anchor(RB, item.documentId, true);
                                        node.modifyBox(horizontal ? 4 /* MARGIN_RIGHT */ : 8 /* MARGIN_BOTTOM */);
                                        valid = true;
                                    }
                                    else if (!node.pageFlow && item.pageFlow && $util$4.withinRange(node.bounds[LT] + node[LT], item.bounds[LT])) {
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
                                node.anchor(horizontal ? $c$1.STRING_BASE.RIGHT_LEFT : 'top', previousSibling.documentId, true);
                                node.constraint[value] = previousSibling.constraint[value];
                                return;
                            }
                        }
                    }
                    if (percent) {
                        const position = Math.abs(bounds[LT] - box[LT]) / box[horizontal ? 'width' : 'height'];
                        location = parseFloat($math$2.truncate(opposite ? 1 - position : position, this.localSettings.precision.standardFloat));
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
                        const offset = $util$4.convertFloat(node.verticalAlign);
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
                            if (innerWrapped && !innerWrapped.pageFlow) {
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
                        let resourceValue;
                        if (percent) {
                            resourceValue = location.toString();
                        }
                        else {
                            resourceValue = `@dimen/${Resource.insertStoredAsset('dimens', `constraint_guideline_${!opposite ? LT : RB}`, $css$2.formatPX(location))}`;
                        }
                        const options = createViewAttribute(undefined, { orientation: horizontal ? STRING_ANDROID.VERTICAL : STRING_ANDROID.HORIZONTAL }, { [beginPercent]: resourceValue });
                        this.addAfterOutsideTemplate(node.id, this.renderNodeStatic(CONTAINER_ANDROID.GUIDELINE, options), false);
                        const documentId = options.documentId;
                        if (documentId) {
                            node.anchor(LT, documentId, true);
                            node.anchorDelete(RB);
                            if (location > 0) {
                                $util$4.assignEmptyValue(guideline, value, beginPercent, LT, documentId, location.toString());
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
                    constraint_referenced_ids: $util$4.objectMap(unbound, item => getDocumentId(item.documentId)).join(',')
                });
                this.addAfterOutsideTemplate(unbound[unbound.length - 1].id, this.renderNodeStatic(CONTAINER_ANDROID.BARRIER, options), false);
                for (const node of unbound) {
                    node.constraint.barrier[barrierDirection] = options.documentId;
                }
                return options.documentId;
            }
            return '';
        }
        evaluateAnchors(nodes) {
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
                        const bottomTop = current.alignSibling($c$1.STRING_BASE.BOTTOM_TOP);
                        if (bottomTop !== '') {
                            const next = nodes.find(item => item.documentId === bottomTop);
                            if (next && next.alignSibling($c$1.STRING_BASE.TOP_BOTTOM) === current.documentId) {
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
                                    current.anchor($c$1.STRING_BASE.BOTTOM_TOP, documentId);
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
                if (!constraint.horizontal) {
                    for (const attr in constraint.current) {
                        const position = constraint.current[attr];
                        if (position.horizontal && horizontal.some(item => item.documentId === position.documentId)) {
                            constraint.horizontal = true;
                            horizontal.push(node);
                            i = -1;
                            break;
                        }
                    }
                }
                if (!constraint.vertical) {
                    for (const attr in constraint.current) {
                        const position = constraint.current[attr];
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
            container.exclude($e$1.NODE_RESOURCE.BOX_STYLE | $e$1.NODE_RESOURCE.ASSET, $e$1.NODE_PROCEDURE.CUSTOMIZATION, $e$1.APP_SECTION.ALL);
            parent.appendTry(node, container);
            node.parent = container;
            const outerWrapper = node.outerWrapper;
            if (outerWrapper) {
                container.outerWrapper = outerWrapper;
                outerWrapper.innerWrapped = container;
            }
            if (node.renderParent) {
                const renderTemplates = node.renderParent.renderTemplates;
                if (renderTemplates) {
                    const length = renderTemplates.length;
                    for (let i = 0; i < length; i++) {
                        const template = renderTemplates[i];
                        if (template && template.node === node) {
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
            const rowsLeft = [];
            let rowsRight;
            let alignmentMultiLine = false;
            let sortPositionAuto = false;
            if (node.hasAlign(16 /* VERTICAL */)) {
                let previous;
                for (const item of children) {
                    if (previous) {
                        item.anchor($c$1.STRING_BASE.TOP_BOTTOM, previous.documentId);
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
                    if (renderParent) {
                        if (renderParent.overflowY) {
                            return renderParent.box.width;
                        }
                        else {
                            const parent = node.actualParent;
                            if (parent) {
                                if (parent === renderParent && parent.blockStatic && node.naturalElement && node.inlineStatic) {
                                    return parent.box.width - (node.linear.left - parent.box.left);
                                }
                                else if (parent.floatContainer) {
                                    const { containerType, alignmentType } = this.containerTypeVerticalMargin;
                                    const container = node.ascend((item) => item.of(containerType, alignmentType), parent, 'renderParent');
                                    if (container.length) {
                                        let leftOffset = 0;
                                        let rightOffset = 0;
                                        for (const item of parent.naturalElements) {
                                            if (item.floating && !children.includes(item) && node.intersectY(item.linear)) {
                                                if (item.float === 'left') {
                                                    if (Math.floor(item.linear.right) > node.box.left) {
                                                        leftOffset = Math.max(leftOffset, item.linear.right - node.box.left);
                                                    }
                                                }
                                                else if (item.float === 'right' && node.box.right > Math.ceil(item.linear.left)) {
                                                    rightOffset = Math.max(rightOffset, node.box.right - item.linear.left);
                                                }
                                            }
                                        }
                                        return node.box.width - leftOffset - rightOffset;
                                    }
                                }
                            }
                        }
                    }
                    return node.box.width;
                })();
                const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
                const cleared = $NodeUI.linearData(children, true).cleared;
                const centerAligned = node.cssInitial('textAlign') === 'center';
                let textIndent = 0;
                if (node.naturalElement) {
                    if (node.blockDimension) {
                        textIndent = node.parseUnit(node.css('textIndent'));
                    }
                }
                else {
                    const parent = node.parent;
                    if (parent && parent.blockDimension && parent.children[0] === node) {
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
                $util$4.partitionArray(children, item => item.float !== 'right').forEach((seg, index) => {
                    const length = seg.length;
                    if (length === 0) {
                        return;
                    }
                    const leftAlign = index === 0;
                    let leftForward = true;
                    let alignParent;
                    let rows;
                    if (leftAlign) {
                        const parent = seg[0].actualParent;
                        if (parent && parent.cssInitialAny('textAlign', 'right', 'end')) {
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
                            alignSibling = $c$1.STRING_BASE.LEFT_RIGHT;
                            if (i === 0 && item.inline && Math.abs(textIndent) > item.actualWidth && item.float !== 'right' && !item.positionRelative) {
                                textIndentSpacing = true;
                                if (!item.floating) {
                                    item.setCacheValue('float', 'left');
                                    item.setCacheValue('floating', true);
                                }
                            }
                        }
                        else {
                            alignSibling = $c$1.STRING_BASE.RIGHT_LEFT;
                        }
                        if (!item.pageFlow) {
                            if (previous) {
                                item.anchor(alignSibling, previous.documentId);
                                item.anchor('top', previous.documentId);
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
                            if (textBounds && (textBounds.numberOfLines || Math.ceil(textBounds.width) < item.box.width)) {
                                bounds = textBounds;
                            }
                        }
                        let multiline = item.multiline;
                        if (multiline && Math.floor(bounds.width) <= boxWidth) {
                            multiline = false;
                            item.multiline = false;
                        }
                        let anchored = true;
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
                        if (previous) {
                            const items = rows[rows.length - 1];
                            let maxWidth = 0;
                            let baseWidth = 0;
                            function checkFloatWrap() {
                                if (previous.floating && previous.alignParent('left') && (multiline || Math.floor(rowWidth + item.width) < boxWidth)) {
                                    return true;
                                }
                                else if (i === length - 1 && node.floating && item.textElement && !/\s|-/.test(item.textContent.trim())) {
                                    if (node.hasPX('width')) {
                                        const width = node.css('width');
                                        if (node.parseUnit(width) > node.parseUnit(node.css('minWidth'))) {
                                            node.cssApply({
                                                width: 'auto',
                                                minWidth: width
                                            }, true);
                                        }
                                    }
                                    node.android('ellipsize', 'end');
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
                                    maxWidth += rows.length > 1 ? 0 : textIndent;
                                }
                                else if (textIndent > 0) {
                                    maxWidth -= rows.length === 1 ? textIndent : 0;
                                }
                                if (item.styleElement && item.inlineStatic) {
                                    baseWidth -= item.contentBoxWidth;
                                }
                                return true;
                            };
                            if (adjustFloatingNegativeMargin(item, previous)) {
                                alignSibling = '';
                            }
                            const viewGroup = item.nodeGroup && !item.hasAlign(128 /* SEGMENTED */);
                            let retainMultiline = false;
                            siblings = item.inlineVertical && previous.inlineVertical && item.previousSibling !== previous ? $dom$1.getElementsBetweenSiblings(previous.element, item.element, true) : undefined;
                            const startNewRow = () => {
                                if (previous.textElement) {
                                    if (i === 1 && item.plainText && item.previousSibling === previous && !$regex$1.CHAR.TRAILINGSPACE.test(previous.textContent) && !$regex$1.CHAR.LEADINGSPACE.test(item.textContent)) {
                                        retainMultiline = true;
                                        return false;
                                    }
                                    else if (checkLineWrap && previous.multiline && (previous.bounds.width >= boxWidth || Resource.hasLineBreak(previous, false, true))) {
                                        return true;
                                    }
                                }
                                if (checkFloatWrap()) {
                                    return false;
                                }
                                else if (checkLineWrap) {
                                    if (checkWrapWidth() && baseWidth > maxWidth ||
                                        multiline && Resource.hasLineBreak(item) ||
                                        item.preserveWhiteSpace && $regex$1.CHAR.LEADINGNEWLINE.test(item.textContent)) {
                                        return true;
                                    }
                                }
                                return false;
                            };
                            const textNewRow = item.textElement && startNewRow();
                            if (textNewRow ||
                                viewGroup ||
                                $util$4.aboveRange(item.linear.top, previous.linear.bottom) && (item.blockStatic || item.floating && previous.float === item.float) ||
                                !item.textElement && !checkFloatWrap() && checkWrapWidth() && Math.floor(baseWidth) > maxWidth ||
                                !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.lineBreak || sibling.excluded && sibling.blockStatic) || !!siblings && siblings.some(element => causesLineBreak(element, node.sessionId))) ||
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
                                if (textNewRow && multiline) {
                                    checkSingleLine(previous, checkLineWrap);
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
                                if (!previous.floating && !retainMultiline && multiline && !item.hasPX('width')) {
                                    multiline = false;
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
                                if ($util$4.aboveRange(item.linear.bottom, previousRowLeft.linear.bottom)) {
                                    previousRowLeft = item;
                                }
                            }
                            else {
                                previousRowLeft = item;
                            }
                        }
                        let previousOffset = 0;
                        if (siblings && !siblings.some(element => !!$session.getElementAsNode(element, item.sessionId) || causesLineBreak(element, item.sessionId))) {
                            const betweenStart = $dom$1.getRangeClientRect(siblings[0]);
                            if (!betweenStart.numberOfLines) {
                                const betweenEnd = siblings.length > 1 ? $dom$1.getRangeClientRect(siblings[siblings.length - 1]) : undefined;
                                if (betweenEnd === undefined || !betweenEnd.numberOfLines) {
                                    previousOffset = betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                                }
                            }
                        }
                        rowWidth += previousOffset + item.marginLeft + bounds.width + item.marginRight;
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
                        baseline = $NodeUI.baseline(bottomAligned.length ? items.filter(item => !bottomAligned.includes(item)) : items);
                        if (baseline && textBottom) {
                            if (baseline !== textBottom && textBottom.bounds.height > baseline.bounds.height) {
                                baseline.anchor('bottom', textBottom.documentId);
                            }
                            else {
                                baseline = $NodeUI.baseline(items);
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
                                                textBaseline = $NodeUI.baseline(items, true);
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
                                                textBaseline = $NodeUI.baseline(items, true);
                                            }
                                            if (textBaseline && textBaseline !== item) {
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
                                            if (documentId !== '' && !$util$4.withinRange(node.bounds.height, item.bounds.height)) {
                                                if (!node.hasHeight && documentId === 'true') {
                                                    if (!alignmentMultiLine) {
                                                        node.css('height', $css$2.formatPX(node.bounds.height), true);
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
                        if (baseline) {
                            baseline.baselineActive = true;
                            if (baselineAlign.length) {
                                adjustBaseline(baseline, baselineAlign);
                            }
                            else if (baseline.textElement && maxCenterHeight > baseline.actualHeight) {
                                baseline.anchor('centerVertical', 'true');
                                baseline = null;
                            }
                        }
                        else if (baselineAlign.length && baselineAlign.length < items.length) {
                            textBottom = getTextBottom(items)[0];
                            if (textBottom) {
                                for (const item of baselineAlign) {
                                    if (item.baseline && !item.multiline && textBottom.bounds.height > item.bounds.height) {
                                        item.anchor('bottom', textBottom.documentId);
                                    }
                                }
                            }
                        }
                        const itemEnd = items[items.length - 1];
                        if (itemEnd.textElement && !itemEnd.multiline && !checkSingleLine(itemEnd, false)) {
                            const alignSibling = itemEnd.alignSibling($c$1.STRING_BASE.LEFT_RIGHT);
                            if (alignSibling !== '') {
                                for (const item of items) {
                                    if (item.documentId === alignSibling) {
                                        if (item.float !== 'left') {
                                            itemEnd.android('maxLines', '1');
                                        }
                                        break;
                                    }
                                }
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
                                if (!valid && sibling === previousBaseline) {
                                    valid = true;
                                }
                                else if (sibling.linear.bottom >= previousBaseline.linear.bottom && (!sibling.floating || previousBaseline.floating)) {
                                    previousBaseline = sibling;
                                }
                            }
                        }
                        for (const item of items) {
                            if (item.alignSibling('baseline') === '') {
                                item.anchor($c$1.STRING_BASE.TOP_BOTTOM, previousBaseline.documentId);
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
            const baseline = $NodeUI.baseline(children);
            const textBaseline = $NodeUI.baseline(children, true);
            const reverse = node.hasAlign(2048 /* RIGHT */);
            const textBottom = getTextBottom(children)[0];
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
                                    if (baseline && !baseline.textElement || textBottom) {
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
                                        item.anchor('baseline', baseline.documentId);
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
                            item.anchor('baseline', baseline.documentId);
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
                if ($client$1.isUserAgent(4 /* SAFARI */)) {
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
                        previousRow.anchor($c$1.STRING_BASE.BOTTOM_TOP, rowStart.documentId);
                        rowStart.anchor($c$1.STRING_BASE.TOP_BOTTOM, typeof previousRow === 'string' ? previousRow : previousRow.documentId);
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
                                totalGap += $math$2.maxArray($util$4.objectMap(column.children, child => child.marginLeft + child.marginRight));
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
                            item.app('layout_constraintWidth_percent', $math$2.truncate((1 / columnMin) - percentGap, this.localSettings.precision.standardFloat));
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
                        for (let k = 0; k < item.length; k++) {
                            const column = item[k];
                            if (column.naturalChild) {
                                elements.push(column.element.cloneNode(true));
                            }
                            else {
                                columnHeight[j] += column.linear.height;
                            }
                        }
                        if (elements.length) {
                            const container = $dom$1.createElement(document.body, 'div', {
                                width: $css$2.formatPX(columnWidth || node.box.width / columnMin),
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
            const horizontal = $NodeUI.partitionRows(children);
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
                const [floatingRight, floatingLeft] = $util$4.partitionArray(partition, item => item.float === 'right' || item.autoMargin.left === true);
                let aboveRowEnd;
                let currentRowBottom;
                [floatingLeft, floatingRight].forEach(seg => {
                    const lengthA = seg.length;
                    if (lengthA === 0) {
                        return;
                    }
                    const reverse = seg === floatingRight;
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
                                chain.anchor(chainStart, previous.documentId);
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
                });
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
                            if (partition[k].linear.bottom >= currentRowBottom.linear.bottom) {
                                currentRowBottom = partition[k];
                            }
                        }
                        bottomFloating = false;
                    }
                    currentRowBottom.anchor($c$1.STRING_BASE.TOP_BOTTOM, aboveRowEnd.documentId);
                    aboveRowEnd.anchor($c$1.STRING_BASE.BOTTOM_TOP, currentRowBottom.documentId);
                    for (const chain of partition) {
                        if (chain !== currentRowBottom) {
                            chain.anchor('top', currentRowBottom.documentId);
                            if (!chain.autoMargin.topBottom) {
                                chain.anchorStyle(STRING_ANDROID.VERTICAL, 'packed', chain.autoMargin.top ? 1 : 0);
                            }
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

    const { util: $util$5, xml: $xml$1 } = squared.lib;
    const STORED$1 = Resource.STORED;
    const REGEXP_FILENAME = /^(.+)\/(.+?\.\w+)$/;
    const REGEXP_DRAWABLE_UNIT = /"(-?[\d.]+)px"/g;
    const REGEXP_THEME_UNIT = />(-?[\d.]+)px</g;
    function getFileAssets(items) {
        const result = [];
        const length = items.length;
        for (let i = 0; i < length; i += 3) {
            result.push({
                pathname: items[i + 1],
                filename: items[i + 2],
                content: items[i]
            });
        }
        return result;
    }
    function getImageAssets(items) {
        const result = [];
        const length = items.length;
        for (let i = 0; i < length; i += 3) {
            result.push({
                pathname: items[i + 1],
                filename: items[i + 2],
                content: '',
                uri: items[i]
            });
        }
        return result;
    }
    const createFileAsset = (pathname, filename, content) => ({ pathname, filename, content });
    const replaceDrawableLength = (value, dpi, format) => format === 'dp' ? value.replace(REGEXP_DRAWABLE_UNIT, (match, ...capture) => '"' + convertLength(capture[0], dpi, false) + '"') : value;
    const replaceThemeLength = (value, dpi, format) => format === 'dp' ? value.replace(REGEXP_THEME_UNIT, (match, ...capture) => '>' + convertLength(capture[0], dpi, false) + '<') : value;
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
                    if (name === 'image') {
                        assets = assets.concat(getImageAssets(result[name]));
                    }
                    else {
                        assets = assets.concat(getFileAssets(result[name]));
                    }
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
            const result = [];
            const data = [{ string: [] }];
            if (!STORED$1.strings.has('app_name')) {
                data[0].string.push({ name: 'app_name', innerText: this.userSettings.manifestLabelAppName });
            }
            for (const [name, innerText] of Array.from(STORED$1.strings.entries()).sort(caseInsensitive)) {
                data[0].string.push({ name, innerText });
            }
            result.push($xml$1.replaceTab($xml$1.applyTemplate('resources', STRING_TMPL, data), this.userSettings.insertSpaces, true), this.directory.string, 'strings.xml');
            this.checkFileAssets(result, options);
            return result;
        }
        resourceStringArrayToXml(options = {}) {
            const result = [];
            if (STORED$1.arrays.size) {
                const data = [{ 'string-array': [] }];
                for (const [name, values] of Array.from(STORED$1.arrays.entries()).sort()) {
                    data[0]['string-array'].push({
                        name,
                        item: $util$5.objectMap(values, innerText => ({ innerText }))
                    });
                }
                result.push($xml$1.replaceTab($xml$1.applyTemplate('resources', STRINGARRAY_TMPL, data), this.userSettings.insertSpaces, true), this.directory.string, 'string_arrays.xml');
                this.checkFileAssets(result, options);
            }
            return result;
        }
        resourceFontToXml(options = {}) {
            const result = [];
            if (STORED$1.fonts.size) {
                const settings = this.userSettings;
                const xmlns = XMLNS_ANDROID[settings.targetAPI < 26 /* OREO */ ? 'app' : 'android'];
                const pathname = this.directory.font;
                for (const [name, font] of Array.from(STORED$1.fonts.entries()).sort()) {
                    const data = [{
                            'xmlns:android': xmlns,
                            font: []
                        }];
                    for (const attr in font) {
                        const [fontFamily, fontStyle, fontWeight] = attr.split('|');
                        let fontName = name;
                        if (fontStyle === 'normal') {
                            fontName += fontWeight === '400' ? '_normal' : `_${font[attr]}`;
                        }
                        else {
                            fontName += `_${fontStyle}`;
                            if (fontWeight !== '400') {
                                fontName += `_${font[attr]}`;
                            }
                        }
                        data[0].font.push({
                            font: `@font/${fontName}`,
                            fontStyle,
                            fontWeight
                        });
                        const src = this.resource.getFont(fontFamily, fontStyle, fontWeight);
                        if (src && src.srcUrl) {
                            this.addAsset({
                                pathname,
                                filename: fontName + '.' + $util$5.fromLastIndexOf(src.srcUrl, '.').toLowerCase(),
                                uri: src.srcUrl
                            });
                        }
                    }
                    let output = $xml$1.replaceTab($xml$1.applyTemplate('font-family', FONTFAMILY_TMPL, data), settings.insertSpaces);
                    if (settings.targetAPI < 26 /* OREO */) {
                        output = output.replace(/\s+android:/g, ' app:');
                    }
                    result.push(output, pathname, `${name}.xml`);
                }
                this.checkFileAssets(result, options);
            }
            return result;
        }
        resourceColorToXml(options = {}) {
            const result = [];
            if (STORED$1.colors.size) {
                const data = [{ color: [] }];
                for (const [innerText, name] of Array.from(STORED$1.colors.entries()).sort()) {
                    data[0].color.push({ name, innerText });
                }
                result.push($xml$1.replaceTab($xml$1.applyTemplate('resources', COLOR_TMPL, data), this.userSettings.insertSpaces), this.directory.string, 'colors.xml');
                this.checkFileAssets(result, options);
            }
            return result;
        }
        resourceStyleToXml(options = {}) {
            const settings = this.userSettings;
            const result = [];
            if (STORED$1.styles.size) {
                const data = [{ style: [] }];
                for (const style of Array.from(STORED$1.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1)) {
                    if (Array.isArray(style.items)) {
                        const item = [];
                        for (const obj of style.items.sort((a, b) => a.key >= b.key ? 1 : -1)) {
                            item.push({ name: obj.key, innerText: obj.value });
                        }
                        data[0].style.push({
                            name: style.name,
                            parent: style.parent,
                            item
                        });
                    }
                }
                result.push($xml$1.replaceTab($xml$1.applyTemplate('resources', STYLE_TMPL, data), settings.insertSpaces), this.directory.string, 'styles.xml');
            }
            if (STORED$1.themes.size) {
                const appTheme = {};
                for (const [filename, theme] of STORED$1.themes.entries()) {
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
                    const match = REGEXP_FILENAME.exec(filename);
                    if (match) {
                        result.push($xml$1.replaceTab(replaceThemeLength($xml$1.applyTemplate('resources', STYLE_TMPL, data), settings.resolutionDPI, settings.convertPixels), settings.insertSpaces), match[1], match[2]);
                    }
                }
            }
            this.checkFileAssets(result, options);
            return result;
        }
        resourceDimenToXml(options = {}) {
            const result = [];
            if (STORED$1.dimens.size) {
                const data = [{ dimen: [] }];
                const settings = this.userSettings;
                const dpi = settings.resolutionDPI;
                const convertPixels = settings.convertPixels;
                for (const [name, value] of Array.from(STORED$1.dimens.entries()).sort()) {
                    data[0].dimen.push({ name, innerText: convertPixels ? convertLength(value, dpi, false) : value });
                }
                result.push($xml$1.replaceTab($xml$1.applyTemplate('resources', DIMEN_TMPL, data)), this.directory.string, 'dimens.xml');
                this.checkFileAssets(result, options);
            }
            return result;
        }
        resourceDrawableToXml(options = {}) {
            const result = [];
            if (STORED$1.drawables.size) {
                const settings = this.userSettings;
                const directory = this.directory.image;
                for (const [name, value] of STORED$1.drawables.entries()) {
                    result.push($xml$1.replaceTab(replaceDrawableLength(value, settings.resolutionDPI, settings.convertPixels), settings.insertSpaces), directory, `${name}.xml`);
                }
                this.checkFileAssets(result, options);
            }
            return result;
        }
        resourceDrawableImageToXml({ copyTo, archiveTo, callback } = {}) {
            const result = [];
            if (STORED$1.images.size) {
                const directory = this.directory.image;
                for (const [name, images] of STORED$1.images.entries()) {
                    if (Object.keys(images).length > 1) {
                        for (const dpi in images) {
                            result.push(images[dpi], `${directory}-${dpi}`, `${name}.${$util$5.fromLastIndexOf(images[dpi], '.')}`);
                        }
                    }
                    else if (images.mdpi) {
                        result.push(images.mdpi, directory, `${name}.${$util$5.fromLastIndexOf(images.mdpi, '.')}`);
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
            }
            return result;
        }
        resourceAnimToXml(options = {}) {
            const result = [];
            if (STORED$1.animators.size) {
                const settings = this.userSettings;
                for (const [name, value] of STORED$1.animators.entries()) {
                    result.push($xml$1.replaceTab(value, settings.insertSpaces), 'res/anim', `${name}.xml`);
                }
                this.checkFileAssets(result, options);
            }
            return result;
        }
        layoutAllToXml(options = {}) {
            const { assets, copyTo, archiveTo, callback } = options;
            const result = {};
            if (assets) {
                const layouts = [];
                const length = assets.length;
                for (let i = 0; i < length; i++) {
                    const layout = assets[i];
                    result[layout.filename] = [layout.content];
                    if (archiveTo) {
                        layouts.push(createFileAsset(layout.pathname, i === 0 ? this.userSettings.outputMainFileName : `${layout.filename}.xml`, layout.content));
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
                result.push(createFileAsset(assets[i].pathname, i === 0 ? this.userSettings.outputMainFileName : `${assets[i].filename}.xml`, assets[i].content));
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
        }
        get userSettings() {
            return this.resource.userSettings;
        }
    }

    const $e$2 = squared.base.lib.enumeration;
    class Accessibility extends squared.base.extensions.Accessibility {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        afterBaseLayout() {
            for (const node of this.application.processing.cache) {
                if (node.visible && node.hasProcedure($e$2.NODE_PROCEDURE.ACCESSIBILITY)) {
                    switch (node.controlName) {
                        case CONTAINER_ANDROID.EDIT:
                            if (!node.companion) {
                                [node.previousSibling, node.nextSibling].some((sibling) => {
                                    if (sibling && sibling.visible && sibling.pageFlow) {
                                        const element = node.element;
                                        const labelElement = sibling.element;
                                        const labelParent = sibling.documentParent.tagName === 'LABEL' ? sibling.documentParent : undefined;
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
    const { css: $css$3, math: $math$3, util: $util$6 } = squared.lib;
    const { constant: $c$2, enumeration: $e$3 } = squared.base.lib;
    const REGEXP_ALIGNSELF = /(start|end|center|baseline)/;
    const REGEXP_JUSTIFYSELF = /(start|end|center|baseline|left|right)/;
    function getRowData(mainData, direction) {
        const result = [];
        if (direction === 'column') {
            for (let i = 0; i < mainData.column.length; i++) {
                result[i] = [];
                for (let j = 0; j < mainData.row.length; j++) {
                    result[i].push(mainData.rowData[j][i]);
                }
            }
        }
        else {
            for (let i = 0; i < mainData.row.length; i++) {
                result.push(mainData.rowData[i]);
            }
        }
        return result;
    }
    function getGridSize(mainData, direction, node) {
        const horizontal = direction === 'column';
        const data = mainData[direction];
        const length = data.unit.length;
        let value = 0;
        if (length) {
            const dimension = horizontal ? 'width' : 'height';
            for (let i = 0; i < length; i++) {
                const unit = data.unit[i];
                if (unit.endsWith('px')) {
                    value += parseFloat(unit);
                }
                else {
                    let size = 0;
                    $util$6.captureMap(mainData.rowData[i], item => item && item.length > 0, item => size = Math.min(size, ...$util$6.objectMap(item, child => child.bounds[dimension])));
                    value += size;
                }
            }
        }
        else {
            value = $math$3.maxArray(data.unitTotal);
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
    function setContentSpacing(mainData, node, alignment, direction) {
        const data = mainData[direction];
        if (alignment.startsWith('space')) {
            const sizeTotal = getGridSize(mainData, direction, node);
            if (sizeTotal > 0) {
                let MARGIN_START;
                let MARGIN_END;
                let dimension;
                if (direction === 'column') {
                    MARGIN_START = 16 /* MARGIN_LEFT */;
                    MARGIN_END = 4 /* MARGIN_RIGHT */;
                    dimension = 'width';
                }
                else {
                    MARGIN_START = 2 /* MARGIN_TOP */;
                    MARGIN_END = 8 /* MARGIN_BOTTOM */;
                    dimension = 'height';
                }
                const rowData = getRowData(mainData, direction);
                const itemCount = mainData[direction].length;
                const adjusted = new Set();
                function getMarginSize(value) {
                    const marginSize = Math.floor(sizeTotal / value);
                    return [marginSize, sizeTotal - (marginSize * value)];
                }
                switch (alignment) {
                    case 'space-around': {
                        const [marginSize, marginExcess] = getMarginSize(itemCount * 2);
                        for (let i = 0; i < itemCount; i++) {
                            for (const item of new Set($util$6.flatMultiArray(rowData[i]))) {
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
                                for (const item of new Set($util$6.flatMultiArray(rowData[i]))) {
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
                                    else if ($util$6.convertInt(item.android(direction === 'column' ? 'layout_columnSpan' : 'layout_rowSpan')) > 1) {
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
                            for (const item of new Set($util$6.flatMultiArray(rowData[i]))) {
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
            const sizeTotal = getGridSize(mainData, direction, node);
            if (sizeTotal > 0) {
                const padding = direction === 'column' ? 256 /* PADDING_LEFT */ : 32 /* PADDING_TOP */;
                switch (alignment) {
                    case 'center':
                        node.modifyBox(padding, Math.floor(sizeTotal / 2));
                        data.normal = false;
                        break;
                    case 'right':
                        if (direction === 'row') {
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
            const mainData = node.data($c$2.EXT_NAME.CSS_GRID, $c$2.STRING_BASE.EXT_DATA);
            if (mainData) {
                const layout = new $LayoutUI(parent, node, CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */, node.children);
                layout.rowCount = mainData.row.length;
                layout.columnCount = mainData.column.length;
                return {
                    output: this.application.renderNode(layout),
                    complete: true
                };
            }
            return undefined;
        }
        processChild(node, parent) {
            const mainData = parent.data($c$2.EXT_NAME.CSS_GRID, $c$2.STRING_BASE.EXT_DATA);
            const cellData = node.data($c$2.EXT_NAME.CSS_GRID, 'cellData');
            let renderAs;
            let outputAs;
            if (mainData && cellData) {
                function applyLayout(item, direction, dimension) {
                    const data = mainData[direction];
                    const cellStart = cellData[`${direction}Start`];
                    const cellSpan = cellData[`${direction}Span`];
                    const horizontal = dimension === 'width';
                    let size = 0;
                    let minSize = 0;
                    let fitContent = false;
                    let minUnitSize = 0;
                    let sizeWeight = 0;
                    if (data.unit.length && data.unit.every(value => value === 'auto')) {
                        if (horizontal) {
                            data.unit = new Array(data.unit.length).fill('1fr');
                        }
                        else {
                            data.unit.length = 0;
                        }
                    }
                    for (let i = 0, j = 0; i < cellSpan; i++) {
                        const unitMin = data.unitMin[cellStart + i];
                        if (unitMin !== '') {
                            minUnitSize += parent.parseUnit(unitMin);
                        }
                        let unit = data.unit[cellStart + i];
                        if (!unit) {
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
                        if (unit === 'auto' || unit === 'max-content') {
                            if (cellSpan < data.unit.length && (!parent.hasPX(dimension) || data.unit.some(value => $css$3.isLength(value)) || unit === 'max-content')) {
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
                        else if (unit === 'min-content') {
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
                        else if ($css$3.isPercent(unit)) {
                            sizeWeight += parseFloat(unit) / 100;
                            minSize = size;
                            size = 0;
                        }
                        else if (unit.endsWith('fr')) {
                            if (horizontal || node.hasHeight) {
                                sizeWeight += parseFloat(unit);
                                minSize = size;
                            }
                            else {
                                sizeWeight = 0;
                                minSize = node.bounds[dimension];
                            }
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
                        if (data.autoFill && size === 0 && mainData[direction === 'column' ? 'row' : 'column'].length === 1) {
                            size = Math.max(node.actualWidth, minUnitSize);
                            sizeWeight = 0;
                        }
                        else {
                            minSize = minUnitSize;
                        }
                    }
                    const dimensionA = $util$6.capitalize(dimension);
                    item.android(`layout_${direction}`, cellStart.toString());
                    if (cellSpan > 1) {
                        item.android(`layout_${direction}Span`, cellSpan.toString());
                    }
                    if (minSize > 0 && !item.hasPX(`min${dimensionA}`)) {
                        item.css(`min${dimensionA}`, $css$3.formatPX(minSize), true);
                    }
                    if (sizeWeight > 0) {
                        if (!item.hasPX(dimension)) {
                            item.android(`layout_${dimension}`, '0px');
                            item.android(`layout_${direction}Weight`, $math$3.truncate(sizeWeight, node.localSettings.floatPrecision));
                            item.mergeGravity('layout_gravity', direction === 'column' ? 'fill_horizontal' : 'fill_vertical');
                        }
                    }
                    else if (size > 0) {
                        if (item.contentBox) {
                            size -= item[`contentBox${dimensionA}`];
                        }
                        if (fitContent && !item.hasPX(`max${dimensionA}`)) {
                            item.css(`max${dimensionA}`, $css$3.formatPX(size), true);
                            item.mergeGravity('layout_gravity', direction === 'column' ? 'fill_horizontal' : 'fill_vertical');
                        }
                        else if (!item.hasPX(dimension)) {
                            item.css(dimension, $css$3.formatPX(size), true);
                        }
                    }
                    return [cellStart, cellSpan];
                }
                const { alignSelf, justifySelf } = node.flexbox;
                if (REGEXP_ALIGNSELF.test(alignSelf) || REGEXP_JUSTIFYSELF.test(justifySelf)) {
                    renderAs = this.application.createNode();
                    renderAs.containerName = node.containerName;
                    renderAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    renderAs.inherit(node, 'base', 'initial');
                    renderAs.resetBox(30 /* MARGIN */ | 480 /* PADDING */);
                    renderAs.exclude($e$3.NODE_RESOURCE.BOX_STYLE | $e$3.NODE_RESOURCE.ASSET, $e$3.NODE_PROCEDURE.CUSTOMIZATION);
                    parent.appendTry(node, renderAs);
                    renderAs.render(parent);
                    node.transferBox(30 /* MARGIN */, renderAs);
                    applyLayout(renderAs, 'column', 'width');
                    applyLayout(renderAs, 'row', 'height');
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
                applyLayout(target, 'column', 'width');
                if (!target.hasPX('width')) {
                    target.mergeGravity('layout_gravity', 'fill_horizontal');
                }
                const [rowStart, rowSpan] = applyLayout(target, 'row', 'height');
                function checkRowSpan() {
                    if (rowSpan === 1 && mainData.rowSpanMultiple[rowStart] === true) {
                        const row = $util$6.flatMultiArray(mainData.rowData[rowStart]);
                        const rowCount = mainData.rowData.length;
                        for (const item of row) {
                            if (item !== node) {
                                const data = item.data($c$2.EXT_NAME.CSS_GRID, 'cellData');
                                if (data && (rowStart === 0 || data.rowSpan < rowCount) && data.rowSpan > rowSpan) {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }
                if (mainData.alignContent === 'normal' && !parent.hasPX('height') && (!mainData.row.unit[rowStart] || mainData.row.unit[rowStart] === 'auto') && node.initial.bounds && node.bounds.height > node.initial.bounds.height && checkRowSpan()) {
                    target.css('minHeight', $css$3.formatPX(node.actualHeight), true);
                }
                else if (!target.hasPX('height') && !(mainData.row.length === 1 && mainData.alignContent === 'space-between')) {
                    if (!REGEXP_ALIGNSELF.test(mainData.alignItems)) {
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
            const mainData = node.data($c$2.EXT_NAME.CSS_GRID, $c$2.STRING_BASE.EXT_DATA);
            if (mainData) {
                if (node.hasWidth && mainData.justifyContent !== 'normal') {
                    setContentSpacing(mainData, node, mainData.justifyContent, 'column');
                }
                if (node.hasHeight && mainData.alignContent !== 'normal') {
                    setContentSpacing(mainData, node, mainData.alignContent, 'row');
                    if (mainData.rowWeight.length > 1) {
                        const precision = this.controller.localSettings.precision.standardFloat;
                        for (let i = 0; i < mainData.row.length; i++) {
                            if (mainData.rowWeight[i] > 0) {
                                const rowData = mainData.rowData[i];
                                const length = rowData.length;
                                for (let j = 0; j < length; j++) {
                                    const item = rowData[j];
                                    if (item) {
                                        for (let column of item) {
                                            if (column.outerWrapper) {
                                                column = column.outerWrapper;
                                            }
                                            column.android('layout_rowWeight', $math$3.truncate(mainData.rowWeight[i], precision).toString());
                                            column.setLayoutHeight('0px');
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (mainData.column.normal && !mainData.column.unit.includes('auto')) {
                    const columnGap = mainData.column.gap * (mainData.column.length - 1);
                    if (columnGap > 0) {
                        if (node.renderParent && !node.renderParent.hasAlign(4 /* AUTO_LAYOUT */)) {
                            node.cssPX('minWidth', columnGap);
                            node.cssPX('width', columnGap, false, true);
                        }
                        if (!node.hasPX('width') && node.hasPX('maxWidth')) {
                            node.css('width', $css$3.formatPX(node.actualWidth + columnGap), true);
                        }
                    }
                }
            }
        }
        postOptimize(node) {
            const mainData = node.data($c$2.EXT_NAME.CSS_GRID, $c$2.STRING_BASE.EXT_DATA);
            if (mainData) {
                const controller = this.controller;
                const lastChild = Array.from(mainData.children)[mainData.children.size - 1];
                if (mainData.column.unit.length && mainData.column.unit.every(value => $css$3.isPercent(value))) {
                    const percentTotal = mainData.column.unit.reduce((a, b) => a + parseFloat(b), 0) + (mainData.column.gap * mainData.column.length * 100) / node.actualWidth;
                    if (percentTotal < 100) {
                        node.android('columnCount', (mainData.column.length + 1).toString());
                        for (let i = 0; i < mainData.row.length; i++) {
                            controller.addAfterOutsideTemplate(lastChild.id, controller.renderSpace($css$3.formatPercent((100 - percentTotal) / 100), 'wrap_content', 0, 0, createViewAttribute(undefined, {
                                [node.localizeString(STRING_ANDROID.MARGIN_LEFT)]: `@dimen/${Resource.insertStoredAsset('dimens', `${node.controlId}_cssgrid_column_gap_`, $css$3.formatPX(mainData.column.gap))}`,
                                layout_row: i.toString(),
                                layout_column: mainData.column.length.toString()
                            })), false);
                        }
                    }
                }
                const emptyRows = mainData.emptyRows;
                const lengthA = emptyRows.length;
                for (let i = 0; i < lengthA; i++) {
                    const item = emptyRows[i];
                    if (item) {
                        const lengthB = item.length;
                        for (let j = 0; j < lengthB; j++) {
                            if (item[j] === 1) {
                                controller.addAfterOutsideTemplate(lastChild.id, controller.renderSpace('wrap_content', `@dimen/${Resource.insertStoredAsset('dimens', `${node.controlId}_cssgrid_row_gap_`, $css$3.formatPX(mainData.row.gap))}`, 0, 0, createViewAttribute(undefined, { layout_row: i.toString(), layout_column: j.toString() })), false);
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

    var $LayoutUI$1 = squared.base.LayoutUI;
    const { math: $math$4, util: $util$7 } = squared.lib;
    const { constant: $c$3, enumeration: $e$4 } = squared.base.lib;
    const $NodeUI$1 = squared.base.NodeUI;
    const CHAIN_MAP = {
        leftTop: ['left', 'top'],
        rightBottom: ['right', 'bottom'],
        rightLeftBottomTop: [$c$3.STRING_BASE.RIGHT_LEFT, $c$3.STRING_BASE.BOTTOM_TOP],
        leftRightTopBottom: [$c$3.STRING_BASE.LEFT_RIGHT, $c$3.STRING_BASE.TOP_BOTTOM],
        widthHeight: ['Width', 'Height'],
        horizontalVertical: [STRING_ANDROID.HORIZONTAL, STRING_ANDROID.VERTICAL]
    };
    function adjustGrowRatio(parent, items, attr) {
        const horizontal = attr === 'width';
        const hasDimension = `has${$util$7.capitalize(attr)}`;
        const result = items.reduce((a, b) => a + b.flexbox.grow, 0);
        const setPercentage = (item) => item.flexbox.basis = `${item.bounds[attr] / parent.box[attr] * 100}%`;
        let percent = parent[hasDimension] || parent.blockStatic && $util$7.withinRange(parent.parseUnit(parent.css(horizontal ? 'maxWidth' : 'maxHeight')), parent.box.width);
        let growShrinkType = 0;
        if (percent) {
            for (const item of items) {
                const autoMargin = item.innerWrapped ? item.innerWrapped.autoMargin : item.autoMargin;
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
                let growPercent = false;
                if (item.flexbox.grow > 0 || item.flexbox.shrink !== 1) {
                    const basis = item.flexbox.basis === 'auto' ? item.parseUnit(item.css(attr), attr) : item.parseUnit(item.flexbox.basis, attr);
                    if (basis > 0) {
                        const { shrink, grow } = item.flexbox;
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
                    else if (item.flexbox.grow > 0 && dimension > item[attr]) {
                        growPercent = true;
                    }
                }
                if (item.flexbox.alignSelf === 'auto' && (percent && !item[hasDimension] || growPercent)) {
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
                if (percentage.length) {
                    for (const item of percentage) {
                        setPercentage(item);
                    }
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
    const getAutoMargin = (node) => node.innerWrapped ? node.innerWrapped.autoMargin : node.autoMargin;
    class Flexbox extends squared.base.extensions.Flexbox {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data($c$3.EXT_NAME.FLEXBOX, $c$3.STRING_BASE.EXT_DATA);
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
                    layout.setType(CONTAINER_NODE.LINEAR, mainData.directionColumn ? 8 /* HORIZONTAL */ : 16 /* VERTICAL */);
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
            else if (node.autoMargin.horizontal || node.autoMargin.vertical && node.hasHeight) {
                const mainData = parent.data($c$3.EXT_NAME.FLEXBOX, $c$3.STRING_BASE.EXT_DATA);
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
                        if (node.autoMargin.horizontal && !node.hasWidth) {
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
            return undefined;
        }
        postBaseLayout(node) {
            const mainData = node.data($c$3.EXT_NAME.FLEXBOX, $c$3.STRING_BASE.EXT_DATA);
            if (mainData) {
                const chainHorizontal = [];
                const chainVertical = [];
                const segmented = [];
                if (mainData.wrap) {
                    let previous;
                    node.each((item) => {
                        if (item.hasAlign(128 /* SEGMENTED */)) {
                            const pageFlow = item.renderFilter(child => child.pageFlow);
                            if (pageFlow.length) {
                                if (mainData.directionRow) {
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
                                        if (mainData.wrapReverse) {
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
                        if (mainData.directionColumn && mainData.wrapReverse) {
                            node.mergeGravity('gravity', 'right');
                        }
                    }
                    else if (segmented.length) {
                        if (mainData.directionRow) {
                            chainVertical.push(segmented);
                        }
                        else {
                            chainHorizontal.push(segmented);
                        }
                    }
                }
                else {
                    if (mainData.directionRow) {
                        if (mainData.directionReverse) {
                            mainData.children.reverse();
                        }
                        chainHorizontal[0] = mainData.children;
                    }
                    else {
                        if (mainData.directionReverse) {
                            mainData.children.reverse();
                        }
                        chainVertical[0] = mainData.children;
                    }
                }
                [chainHorizontal, chainVertical].forEach((partition, index) => {
                    const horizontal = index === 0;
                    const inverse = horizontal ? 1 : 0;
                    const orientation = CHAIN_MAP.horizontalVertical[index];
                    const orientationInverse = CHAIN_MAP.horizontalVertical[inverse];
                    const WH = CHAIN_MAP.widthHeight[index];
                    const HW = CHAIN_MAP.widthHeight[inverse];
                    const LT = CHAIN_MAP.leftTop[index];
                    const TL = CHAIN_MAP.leftTop[inverse];
                    const RB = CHAIN_MAP.rightBottom[index];
                    const BR = CHAIN_MAP.rightBottom[inverse];
                    const LRTB = CHAIN_MAP.leftRightTopBottom[index];
                    const RLBT = CHAIN_MAP.rightLeftBottomTop[index];
                    const WHL = WH.toLowerCase();
                    const HWL = HW.toLowerCase();
                    const dimension = node[`has${HW}`];
                    const dimensionInverse = node[`has${WH}`];
                    const orientationWeight = `layout_constraint${$util$7.capitalize(orientation)}_weight`;
                    function setLayoutWeight(chain, value) {
                        chain.app(orientationWeight, $math$4.truncate(value, chain.localSettings.floatPrecision));
                        chain.android(`layout_${WH.toLowerCase()}`, '0px');
                    }
                    const lengthA = partition.length;
                    for (let i = 0; i < lengthA; i++) {
                        const seg = partition[i];
                        const lengthB = seg.length;
                        const segStart = seg[0];
                        const segEnd = seg[lengthB - 1];
                        const opposing = seg === segmented;
                        const justifyContent = !opposing && seg.every(item => item.flexbox.grow === 0);
                        const spreadInside = justifyContent && (mainData.justifyContent === 'space-between' || mainData.justifyContent === 'space-around' && lengthB > 1);
                        const layoutWeight = [];
                        let maxSize = 0;
                        let growAvailable = 0;
                        let parentEnd = true;
                        let baseline = null;
                        if (opposing) {
                            if (dimensionInverse) {
                                let chainStyle = 'spread';
                                let bias = 0;
                                switch (mainData.alignContent) {
                                    case 'left':
                                    case 'right':
                                    case 'flex-end':
                                        chainStyle = 'packed';
                                        bias = 1;
                                        parentEnd = false;
                                        break;
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
                            growAvailable = 1 - adjustGrowRatio(node, seg, WHL);
                            if (lengthB > 1) {
                                const sizeMap = new Set($util$7.objectMap(seg, item => item.initial.bounds ? item.initial.bounds[HWL] : 0));
                                if (sizeMap.size > 1) {
                                    maxSize = $math$4.maxArray(Array.from(sizeMap));
                                }
                            }
                        }
                        for (let j = 0; j < lengthB; j++) {
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
                                if (parentEnd && lengthB > 1 && dimensionInverse) {
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
                                            let gravity;
                                            if (autoMargin.leftRight) {
                                                gravity = STRING_ANDROID.CENTER_HORIZONTAL;
                                            }
                                            else {
                                                gravity = chain.localizeString(autoMargin.left ? 'right' : 'left');
                                            }
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
                                            let gravity;
                                            if (autoMargin.topBottom) {
                                                gravity = STRING_ANDROID.CENTER_VERTICAL;
                                            }
                                            else {
                                                gravity = chain.localizeString(autoMargin.top ? 'bottom' : 'top');
                                            }
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
                                                baseline = $NodeUI$1.baseline(seg);
                                            }
                                            if (baseline && chain !== baseline) {
                                                chain.anchor('baseline', baseline.documentId);
                                            }
                                        }
                                        break;
                                    case 'center':
                                        chain.anchorParent(orientationInverse, 'packed', 0.5);
                                        if (chain[HWL] === 0 && !horizontal && !dimension && chain.cascadeSome(child => child.multiline)) {
                                            chain.android(`layout_${HWL}`, '0px');
                                        }
                                        break;
                                    default:
                                        const childContent = chain.innerWrapped;
                                        const wrapReverse = mainData.wrapReverse;
                                        switch (mainData.alignContent) {
                                            case 'center':
                                                if (partition.length % 2 === 1 && i === Math.floor(partition.length / 2)) {
                                                    chain.anchorParent(orientationInverse);
                                                }
                                                else if (i < partition.length / 2) {
                                                    chain.anchor(BR, 'parent');
                                                }
                                                else if (i >= partition.length / 2) {
                                                    chain.anchor(TL, 'parent');
                                                }
                                                break;
                                            case 'space-evenly':
                                            case 'space-around':
                                                if (chain.layoutFrame && childContent) {
                                                    childContent.mergeGravity('layout_gravity', horizontal ? STRING_ANDROID.CENTER_VERTICAL : STRING_ANDROID.CENTER_HORIZONTAL);
                                                }
                                                else {
                                                    chain.anchorParent(orientationInverse);
                                                }
                                                break;
                                            case 'space-between':
                                                if (spreadInside && lengthB === 2) {
                                                    chain.anchorDelete(j === 0 ? RLBT : LRTB);
                                                }
                                                if (i === 0) {
                                                    if (chain.layoutFrame && childContent) {
                                                        childContent.mergeGravity('layout_gravity', wrapReverse ? BR : TL);
                                                    }
                                                    else {
                                                        chain.anchor(wrapReverse ? BR : TL, 'parent');
                                                    }
                                                }
                                                else if (partition.length > 2 && i < partition.length - 1) {
                                                    if (chain.layoutFrame && childContent) {
                                                        childContent.mergeGravity('layout_gravity', horizontal ? STRING_ANDROID.CENTER_VERTICAL : STRING_ANDROID.CENTER_HORIZONTAL);
                                                    }
                                                    else {
                                                        chain.anchorParent(orientationInverse);
                                                    }
                                                }
                                                else {
                                                    if (chain.layoutFrame && childContent) {
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
                                                    const bounds = chain.initial.bounds && chain.initial.bounds[HWL];
                                                    const smaller = bounds < maxSize;
                                                    const attr = `layout_${HWL}`;
                                                    if (!smaller) {
                                                        if (dimension && (maxSize === 0 && chain.bounds[HWL] > bounds || chain.flexElement && (horizontal && chain.css('flexDirection') === 'column' || !horizontal && chain.css('flexDirection') === 'row'))) {
                                                            chain.android(attr, '0px');
                                                        }
                                                    }
                                                    else if (dimension || maxSize === 0 || smaller) {
                                                        if (maxSize === 0 && (!dimension && lengthB > 1 || mainData.wrap)) {
                                                            break;
                                                        }
                                                        else if (horizontal && !dimension) {
                                                            chain.android(attr, smaller ? '0px' : 'match_parent');
                                                        }
                                                        else {
                                                            chain.android(attr, '0px');
                                                        }
                                                        if (innerWrapped && !innerWrapped.autoMargin[orientation]) {
                                                            innerWrapped.android(attr, 'match_parent');
                                                        }
                                                    }
                                                }
                                                break;
                                            }
                                        }
                                        break;
                                }
                                Controller.setFlexDimension(chain, WHL);
                            }
                            chain.anchored = true;
                            chain.positioned = true;
                        }
                        if (growAvailable > 0) {
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
                        if (!opposing && (horizontal || mainData.directionColumn)) {
                            let centered = false;
                            if (justifyContent) {
                                switch (mainData.justifyContent) {
                                    case 'normal':
                                        if (mainData.directionColumn) {
                                            segStart.anchorStyle(orientation, 'packed', mainData.directionReverse ? 1 : 0);
                                        }
                                        break;
                                    case 'left':
                                        if (!horizontal) {
                                            break;
                                        }
                                    case 'start':
                                    case 'flex-start':
                                        segStart.anchorStyle(orientation, 'packed', mainData.directionReverse ? 1 : 0);
                                        break;
                                    case 'center':
                                        if (lengthB > 1) {
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
                                        if (lengthB === 1) {
                                            segEnd.anchorDelete(RB);
                                        }
                                        break;
                                    case 'space-evenly':
                                        if (lengthB > 1) {
                                            segStart.anchorStyle(orientation, 'spread');
                                            const HVU = $util$7.capitalize(orientation);
                                            for (const item of seg) {
                                                item.app(`layout_constraint${HVU}_weight`, (item.flexbox.grow || 1).toString());
                                            }
                                        }
                                        else {
                                            centered = true;
                                        }
                                        break;
                                    case 'space-around':
                                        if (lengthB > 1) {
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
                            if (spreadInside || !mainData.wrap && partition[i].some(item => item.app(orientationWeight) !== '') && !$util$7.sameArray(partition[i], item => item.app(orientationWeight))) {
                                segStart.anchorStyle(orientation, 'spread_inside', 0, false);
                            }
                            else if (!centered) {
                                segStart.anchorStyle(orientation, 'packed', mainData.directionReverse ? 1 : 0, false);
                            }
                        }
                    }
                });
            }
        }
    }

    var $LayoutUI$2 = squared.base.LayoutUI;
    const { css: $css$4, util: $util$8 } = squared.lib;
    const { constant: $c$4, enumeration: $e$5 } = squared.base.lib;
    function transferData(parent, siblings) {
        const data = squared.base.extensions.Grid.createDataCellAttribute();
        for (const item of siblings) {
            const source = item.data($c$4.EXT_NAME.GRID, 'cellData');
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
                item.data($c$4.EXT_NAME.GRID, 'cellData', null);
            }
        }
        parent.data($c$4.EXT_NAME.GRID, 'cellData', data);
    }
    class Grid extends squared.base.extensions.Grid {
        processNode(node, parent) {
            super.processNode(node, parent);
            const columnCount = node.data($c$4.EXT_NAME.GRID, 'columnCount');
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
            const cellData = node.data($c$4.EXT_NAME.GRID, 'cellData');
            if (cellData) {
                const siblings = cellData.siblings && cellData.siblings.slice(0);
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
                                item.css('width', $css$4.formatPX(item.bounds.width), true);
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
                const columnCount = node.data($c$4.EXT_NAME.GRID, 'columnCount');
                if (columnCount) {
                    let paddingTop = 0;
                    let paddingRight = 0;
                    let paddingBottom = 0;
                    let paddingLeft = 0;
                    node.renderEach(item => {
                        const cellData = item.data($c$4.EXT_NAME.GRID, 'cellData');
                        if (cellData) {
                            const parent = item.actualParent;
                            if (parent && !parent.visible) {
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
                                            controller.addAfterOutsideTemplate(item.id, controller.renderSpace('match_parent', `@dimen/${Resource.insertStoredAsset('dimens', `${node.controlId}_grid_space`, $css$4.formatPX(heightBottom))}`, columnCount), false);
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
                $util$8.captureMap(node.renderChildren, item => item.inlineFlow || !item.blockStatic, item => maxRight = Math.max(maxRight, item.linear.right));
                if ($util$8.withinRange(node.box.right, maxRight)) {
                    node.setLayoutWidth('wrap_content');
                }
            }
        }
    }

    var $LayoutUI$3 = squared.base.LayoutUI;
    const { css: $css$5, util: $util$9, } = squared.lib;
    const { constant: $c$5, enumeration: $e$6 } = squared.base.lib;
    const $NodeUI$2 = squared.base.NodeUI;
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
                    layout.setType(CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */);
                }
                else if (layout.linearX || layout.singleRowAligned) {
                    layout.rowCount = 1;
                    layout.columnCount = layout.length;
                    layout.setType(CONTAINER_NODE.LINEAR, 8 /* HORIZONTAL */);
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
            const mainData = node.data($c$5.EXT_NAME.LIST, $c$5.STRING_BASE.EXT_DATA);
            if (mainData) {
                const application = this.application;
                const controller = this.controller;
                let minWidth = node.marginLeft;
                let columnCount = 0;
                let adjustPadding = false;
                let resetPadding = NaN;
                node.modifyBox(16 /* MARGIN_LEFT */);
                if (parent.is(CONTAINER_NODE.GRID)) {
                    columnCount = $util$9.convertInt(parent.android('columnCount'));
                    adjustPadding = true;
                }
                else if (parent.item(0) === node) {
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
                let ordinal = !mainData.ordinal ? node.find((item) => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft) : undefined;
                if (ordinal) {
                    const layoutOrdinal = new $LayoutUI$3(parent, ordinal);
                    if (ordinal.inlineText || ordinal.length === 0) {
                        layoutOrdinal.containerType = CONTAINER_NODE.TEXT;
                    }
                    else {
                        if (layoutOrdinal.singleRowAligned) {
                            layoutOrdinal.setType(CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */);
                        }
                        else {
                            layoutOrdinal.setType(CONTAINER_NODE.CONSTRAINT, 2 /* UNKNOWN */);
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
                        ordinal.android('minWidth', $css$5.formatPX(minWidth));
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
                        if (mainData.imagePosition) {
                            ({ top, left } = $css$5.getBackgroundPosition(mainData.imagePosition, node.actualDimension, this.resource.getImage(mainData.imageSrc), node.fontSize));
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
                        image = this.resource.addImageSrc(mainData.imageSrc);
                    }
                    if (gravity === 'left') {
                        minWidth += node.paddingLeft - left;
                        node.modifyBox(256 /* PADDING_LEFT */);
                    }
                    else {
                        const length = mainData.ordinal ? mainData.ordinal.length : 1;
                        paddingRight = Math.max(minWidth / (image ? 6 : length * 4), 4);
                    }
                    const options = createViewAttribute();
                    ordinal = application.createNode();
                    ordinal.containerName = `${node.containerName}_ORDINAL`;
                    if (inside) {
                        controller.addBeforeOutsideTemplate(ordinal.id, controller.renderNodeStatic(CONTAINER_ANDROID.SPACE, createViewAttribute(undefined, { minWidth: `@dimen/${Resource.insertStoredAsset('dimens', `${node.tagName.toLowerCase()}_space_`, $css$5.formatPX(minWidth))}` })), false);
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
                                src: `@drawable/${image}`,
                                scaleType: !inside && gravity === 'right' ? 'fitEnd' : 'fitStart',
                                baselineAlignBottom: adjustPadding ? 'true' : ''
                            });
                        }
                        else if (mainData.ordinal) {
                            ordinal.textContent = mainData.ordinal;
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
                        if (mainData.ordinal && !mainData.ordinal.endsWith('.')) {
                            ordinal.fontSize *= 0.75;
                        }
                        ordinal.cssApply({
                            minWidth: minWidth > 0 ? $css$5.formatPX(minWidth) : '',
                            marginTop: node.marginTop !== 0 ? $css$5.formatPX(node.marginTop) : '',
                            marginLeft: marginLeft > 0 ? $css$5.formatPX(marginLeft) : '',
                            paddingTop: node.paddingTop > 0 && node.getBox(32 /* PADDING_TOP */)[0] === 0 ? $css$5.formatPX(node.paddingTop) : '',
                            paddingRight: paddingRight > 0 && gravity === 'right' ? $css$5.formatPX(paddingRight) : '',
                            paddingLeft: paddingRight > 0 && gravity === 'left' && (!image || mainData.imagePosition) ? $css$5.formatPX(paddingRight) : '',
                            lineHeight: node.lineHeight > 0 ? $css$5.formatPX(node.lineHeight) : ''
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
                        node.companion = ordinal;
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
                    else if (node.filter((item) => item.visible).length > 1 && $NodeUI$2.linearData(node.children).linearY) {
                        node.addAlign(1024 /* TOP */);
                    }
                }
                if (container !== node) {
                    if (node.marginTop !== 0) {
                        container.modifyBox(2 /* MARGIN_TOP */, node.marginTop);
                        node.modifyBox(2 /* MARGIN_TOP */);
                        node.outerWrapper = container;
                        container.innerWrapped = node;
                    }
                    return {
                        parent: container,
                        renderAs: container,
                        outputAs: application.renderNode(new $LayoutUI$3(parent, container, CONTAINER_NODE.LINEAR, 16 /* VERTICAL */ | 2 /* UNKNOWN */, container.children))
                    };
                }
            }
            return undefined;
        }
    }

    const $util$a = squared.lib.util;
    class Relative extends squared.base.extensions.Relative {
        postOptimize(node) {
            super.postOptimize(node);
            if (node.imageOrSvgElement && node.alignSibling('baseline') && $util$a.convertFloat(node.verticalAlign) !== 0 && node.android('visibility') === 'invisible') {
                node.android('baselineAlignBottom', 'true');
            }
        }
    }

    var $LayoutUI$4 = squared.base.LayoutUI;
    const $css$6 = squared.lib.css;
    const { constant: $c$6, enumeration: $e$7 } = squared.base.lib;
    class Sprite extends squared.base.extensions.Sprite {
        processNode(node, parent) {
            const mainData = node.data($c$6.EXT_NAME.SPRITE, $c$6.STRING_BASE.EXT_DATA);
            if (mainData) {
                const drawable = this.resource.addImageSrc(node.backgroundImage);
                if (drawable !== '') {
                    const container = this.application.createNode();
                    container.inherit(node, 'base', 'initial', 'styleMap');
                    container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    container.exclude($e$7.NODE_RESOURCE.IMAGE_SOURCE, $e$7.NODE_PROCEDURE.CUSTOMIZATION);
                    parent.appendTry(node, container);
                    node.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                    node.exclude($e$7.NODE_RESOURCE.FONT_STYLE | $e$7.NODE_RESOURCE.BOX_STYLE);
                    node.cssApply({
                        position: 'static',
                        top: 'auto',
                        right: 'auto',
                        bottom: 'auto',
                        left: 'auto',
                        display: 'inline-block',
                        width: mainData.image.width > 0 ? $css$6.formatPX(mainData.image.width) : 'auto',
                        height: mainData.image.height > 0 ? $css$6.formatPX(mainData.image.height) : 'auto',
                        marginTop: $css$6.formatPX(mainData.position.top),
                        marginRight: '0px',
                        marginBottom: '0px',
                        marginLeft: $css$6.formatPX(mainData.position.left),
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
                    node.android('src', `@drawable/${drawable}`);
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

    class Substitute extends squared.base.extensions.Substitute {
        processNode(node, parent) {
            node.containerType = node.blockStatic ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE;
            return super.processNode(node, parent);
        }
        postOptimize(node) {
            node.apply(Resource.formatOptions(createViewAttribute(this.options[node.elementId]), this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        }
    }

    var $LayoutUI$5 = squared.base.LayoutUI;
    const { css: $css$7, util: $util$b } = squared.lib;
    const { constant: $c$7, enumeration: $e$8 } = squared.base.lib;
    class Table extends squared.base.extensions.Table {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data($c$7.EXT_NAME.TABLE, $c$7.STRING_BASE.EXT_DATA);
            if (mainData) {
                let requireWidth = false;
                if (mainData.columnCount > 1) {
                    requireWidth = mainData.expand;
                    node.each((item) => {
                        const data = item.data($c$7.EXT_NAME.TABLE, 'cellData');
                        if (item.css('width') === '0px') {
                            item.setLayoutWidth('0px');
                            item.android('layout_columnWeight', (item.element.colSpan || 1).toString());
                        }
                        else {
                            const expand = data.expand;
                            if (expand) {
                                const percent = $util$b.convertFloat(data.percent) / 100;
                                if (percent > 0) {
                                    item.setLayoutWidth('0px');
                                    item.android('layout_columnWeight', $util$b.trimEnd(percent.toPrecision(3), '0'));
                                    if (!requireWidth) {
                                        requireWidth = !item.hasWidth;
                                    }
                                }
                            }
                            else if (expand === false) {
                                item.android('layout_columnWeight', '0');
                                if (item.textElement && item.textContent.length > 1) {
                                    item.android('ellipsize', 'end');
                                }
                            }
                            if (data.downsized) {
                                if (data.exceed) {
                                    item.setLayoutWidth('0px');
                                    item.android('layout_columnWeight', '0.01');
                                }
                                else {
                                    if (item.hasPX('width') && item.actualWidth < item.bounds.width) {
                                        item.setLayoutWidth($css$7.formatPX(item.bounds.width));
                                    }
                                }
                            }
                        }
                        if (item.textElement && item.textContent.length > 1 && !/[\s\n\-]/.test(item.textContent.trim())) {
                            item.android('maxLines', '1');
                        }
                    });
                }
                else {
                    node.each((item) => {
                        if (item.has('width', 4 /* PERCENT */)) {
                            item.setLayoutWidth('wrap_content');
                            requireWidth = true;
                        }
                    });
                }
                if (requireWidth) {
                    if (parent.hasPX('width') && $util$b.aboveRange(node.actualWidth, parent.actualWidth)) {
                        node.setLayoutWidth('match_parent');
                    }
                    else {
                        node.css('width', $css$7.formatPX(node.actualWidth), true);
                    }
                }
                else {
                    if (node.hasPX('width') && node.actualWidth < Math.floor(node.bounds.width)) {
                        if (mainData.layoutFixed) {
                            node.android('width', $css$7.formatPX(node.bounds.width), true);
                        }
                        else {
                            if (!node.hasPX('minWidth')) {
                                node.android('minWidth', $css$7.formatPX(node.actualWidth));
                            }
                            node.css('width', 'auto', true);
                        }
                    }
                }
                if (node.hasPX('height') && node.actualHeight < Math.floor(node.bounds.height)) {
                    if (!node.hasPX('minHeight')) {
                        node.android('minHeight', $css$7.formatPX(node.actualHeight));
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
            const data = node.data($c$7.EXT_NAME.TABLE, 'cellData');
            if (data) {
                const rowSpan = data.rowSpan;
                const colSpan = data.colSpan;
                const spaceSpan = data.spaceSpan || 0;
                if (rowSpan > 1) {
                    node.android('layout_rowSpan', rowSpan.toString());
                }
                if (colSpan > 1) {
                    node.android('layout_columnSpan', colSpan.toString());
                }
                node.mergeGravity('layout_gravity', 'fill');
                if (spaceSpan > 0) {
                    const controller = this.controller;
                    controller.addAfterOutsideTemplate(node.id, controller.renderSpace('wrap_content', 'wrap_content', spaceSpan), false);
                }
                if (parent.css('empty-cells') === 'hide' && node.naturalChildren.length === 0 && node.textContent === '') {
                    node.hide(true);
                }
            }
            return undefined;
        }
        postOptimize(node) {
            const layoutWidth = $util$b.convertInt(node.layoutWidth);
            if (layoutWidth > 0) {
                if (node.bounds.width > layoutWidth) {
                    node.setLayoutWidth($css$7.formatPX(node.bounds.width));
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
    const $e$9 = squared.base.lib.enumeration;
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
    const { css: $css$8, util: $util$c } = squared.lib;
    const $e$a = squared.base.lib.enumeration;
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
            node.exclude(0, $e$a.NODE_PROCEDURE.CONSTRAINT);
            return {
                output: this.application.renderNode(new $LayoutUI$7(parent, node, CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, node.children))
            };
        }
        postBaseLayout(node) {
            const controller = this.controller;
            const circlePosition = this.options.circlePosition;
            let anchor;
            node.each((item) => {
                if ($util$c.withinRange(item.linear.left, node.box.left)) {
                    item.anchor('left', 'parent');
                    item.anchorStyle(STRING_ANDROID.HORIZONTAL);
                }
                if ($util$c.withinRange(item.linear.top, node.box.top)) {
                    item.anchor('top', 'parent');
                    item.anchorStyle(STRING_ANDROID.VERTICAL);
                }
                if (circlePosition) {
                    if (item.anchored) {
                        anchor = item;
                    }
                    else if (anchor) {
                        if (!anchor.constraint.vertical && item.constraint.vertical) {
                            anchor = item;
                        }
                    }
                    else if (item.constraint.vertical) {
                        anchor = item;
                    }
                    else if (item.constraint.horizontal) {
                        anchor = item;
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
                        item.app('layout_constraintCircleRadius', $css$8.formatPX(radius));
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
    var $ResourceUI = squared.base.ResourceUI;
    const { css: $css$9, regex: $regex$2 } = squared.lib;
    const $e$b = squared.base.lib.enumeration;
    const isFullScreen = (node) => node.visibleStyle.borderWidth && (node.backgroundColor !== '' || node.element.scrollHeight < window.innerHeight) && !node.hasPX('width') && !node.inline && node.css('height') !== '100%' && node.css('minHeight') !== '100%';
    class Background extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.removeIs = true;
        }
        is(node) {
            return node.documentBody;
        }
        condition(node) {
            if (isFullScreen(node)) {
                return true;
            }
            else {
                const scrollHeight = node.element.scrollHeight;
                const backgroundImage = $ResourceUI.parseBackgroundImage(node);
                if (backgroundImage) {
                    const backgroundRepeat = node.css('backgroundRepeat').split($regex$2.XML.SEPARATOR);
                    for (let i = 0; i < backgroundImage.length; i++) {
                        const image = backgroundImage[i];
                        if (typeof image === 'string' && image.startsWith('url(')) {
                            const repeat = backgroundRepeat[i];
                            if (repeat !== 'repeat' && repeat !== 'repeat-y') {
                                const asset = (this.resource.getRawData(image) || this.resource.getImage($css$9.resolveURL(image)));
                                if (asset) {
                                    const height = asset.height;
                                    if (height > 0 && height < scrollHeight) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false;
        }
        processNode(node, parent) {
            const container = this.controller.createNodeWrapper(node, parent);
            container.visibleStyle.background = true;
            container.setLayoutWidth('match_parent');
            const fullScreen = isFullScreen(node);
            const height = parent.cssInitial('height');
            const minHeight = parent.cssInitial('minHeight');
            let backgroundSize = node.css('backgroundSize');
            if (height === '' && minHeight === '') {
                container.setLayoutHeight(fullScreen ? 'match_parent' : 'wrap_content');
            }
            else {
                if (height !== '100%' && minHeight !== '100%') {
                    const offsetHeight = parent.element.offsetHeight;
                    if (offsetHeight < window.innerHeight) {
                        backgroundSize = `auto ${offsetHeight}px`;
                    }
                }
                container.setLayoutHeight('match_parent');
            }
            const backgroundImage = node.backgroundImage;
            if (backgroundImage !== '') {
                container.cssApply({
                    backgroundImage,
                    backgroundSize,
                    backgroundRepeat: node.css('backgroundRepeat'),
                    backgroundPositionX: node.css('backgroundPositionX'),
                    backgroundPositionY: node.css('backgroundPositionY'),
                    backgroundClip: node.css('backgroundClip'),
                    border: '0px none solid',
                    borderRadius: '0px'
                });
                container.setCacheValue('backgroundImage', backgroundImage);
                node.setCacheValue('backgroundImage', '');
            }
            if (fullScreen) {
                const backgroundColor = node.backgroundColor;
                if (backgroundColor !== '') {
                    container.css('backgroundColor', backgroundColor);
                    container.setCacheValue('backgroundColor', backgroundColor);
                    node.css('backgroundColor', 'transparent');
                    node.setCacheValue('backgroundColor', '');
                }
            }
            node.unsetCache('visibleStyle');
            container.unsetCache('visibleStyle');
            container.unsafe('excludeResource', $e$b.NODE_RESOURCE.BOX_SPACING);
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new $LayoutUI$8(parent, container, CONTAINER_NODE.FRAME, 4096 /* SINGLE */, container.children))
            };
        }
    }

    var $LayoutUI$9 = squared.base.LayoutUI;
    const { util: $util$d } = squared.lib;
    const { constant: $c$8, enumeration: $e$c } = squared.base.lib;
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
                        if (item.left >= 0 && item.left < paddingLeft) {
                            children.add(item);
                        }
                    }
                    else if (item.hasPX('right') && item.right >= 0 && (fixed || item.right < paddingRight || node.documentBody && node.hasPX('width'))) {
                        children.add(item);
                        right = true;
                    }
                    else if (!item.rightAligned) {
                        if (item.marginLeft < 0 && (node.documentRoot || $util$d.belowRange(item.linear.left, node.bounds.left))) {
                            children.add(item);
                        }
                    }
                    else if (item.marginRight < 0 && (node.documentRoot || $util$d.aboveRange(item.linear.right, node.bounds.right))) {
                        children.add(item);
                    }
                    if (item.hasPX('top')) {
                        if (item.top >= 0 && item.top < paddingTop) {
                            children.add(item);
                        }
                    }
                    else if (item.hasPX('bottom') && item.bottom >= 0 && (fixed || item.bottom < paddingBottom || node.documentBody && node.hasPX('height'))) {
                        children.add(item);
                        bottom = true;
                    }
                }
                if (children.size) {
                    node.data(EXT_ANDROID.DELEGATE_FIXED, $c$8.STRING_BASE.EXT_DATA, { children: Array.from(children), right, bottom });
                    return true;
                }
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_FIXED, $c$8.STRING_BASE.EXT_DATA);
            if (mainData) {
                const container = this.controller.createNodeWrapper(node, parent, mainData.children);
                if (node.documentBody && (mainData.right || mainData.bottom)) {
                    container.cssApply({
                        width: 'auto',
                        height: 'auto',
                        display: 'block',
                        float: 'none'
                    });
                    if (mainData.right) {
                        container.setLayoutWidth('match_parent');
                    }
                    if (mainData.bottom) {
                        container.setLayoutHeight('match_parent');
                    }
                }
                else if (!node.pageFlow) {
                    node.resetBox(30 /* MARGIN */, container);
                }
                for (const item of mainData.children) {
                    if (item.hasPX('top')) {
                        item.modifyBox(2 /* MARGIN_TOP */, node.borderTopWidth);
                    }
                    else if (item.hasPX('bottom')) {
                        item.modifyBox(8 /* MARGIN_BOTTOM */, node.borderBottomWidth);
                    }
                    if (item.hasPX('left')) {
                        item.modifyBox(16 /* MARGIN_LEFT */, node.borderLeftWidth);
                    }
                    else if (item.hasPX('right')) {
                        item.modifyBox(4 /* MARGIN_RIGHT */, node.borderRightWidth);
                    }
                }
                const maxWidthHeight = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, $c$8.STRING_BASE.EXT_DATA);
                if (maxWidthHeight) {
                    const wrapped = maxWidthHeight.container;
                    if (wrapped) {
                        if (maxWidthHeight.width) {
                            container.css('maxWidth', node.css('maxWidth'));
                            container.setLayoutWidth('0px');
                            container.contentBoxWidth = node.contentBoxWidth;
                            node.setLayoutWidth('wrap_content');
                        }
                        if (maxWidthHeight.height) {
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
                if (!item.constraint.horizontal) {
                    item.anchor('left', 'parent');
                }
                if (!item.constraint.vertical) {
                    item.anchor('top', 'parent');
                }
            });
        }
    }

    var $LayoutUI$a = squared.base.LayoutUI;
    const { constant: $c$9, enumeration: $e$d } = squared.base.lib;
    class MaxWidthHeight extends squared.base.ExtensionUI {
        is(node) {
            return !node.inputElement;
        }
        condition(node, parent) {
            let width = false;
            let height = false;
            if (!node.support.maxWidth && !isNaN(node.width) && node.hasPX('maxWidth') && !parent.hasAlign(256 /* COLUMN */)) {
                width = true;
            }
            if (!node.support.maxHeight && !isNaN(node.height) && node.hasPX('maxHeight') && parent.hasHeight) {
                height = true;
            }
            if (width || height) {
                node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, $c$9.STRING_BASE.EXT_DATA, { width, height });
                return true;
            }
            return false;
        }
        processNode(node, parent) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_MAXWIDTHHEIGHT, $c$9.STRING_BASE.EXT_DATA);
            if (mainData) {
                const container = parent.layoutConstraint ? parent : this.controller.createNodeWrapper(node, parent, undefined, CONTAINER_ANDROID.CONSTRAINT, CONTAINER_NODE.CONSTRAINT);
                if (mainData.width) {
                    node.setLayoutWidth('0px');
                    container.setLayoutWidth('match_parent');
                    if (parent.layoutElement) {
                        node.autoMargin.horizontal = false;
                        node.autoMargin.left = false;
                        node.autoMargin.right = false;
                        node.autoMargin.leftRight = false;
                    }
                }
                if (mainData.height) {
                    node.setLayoutHeight('0px');
                    container.setLayoutHeight('match_parent');
                    if (parent.layoutElement) {
                        node.autoMargin.vertical = false;
                        node.autoMargin.top = false;
                        node.autoMargin.bottom = false;
                        node.autoMargin.topBottom = false;
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
    const $e$e = squared.base.lib.enumeration;
    class NegativeViewport extends squared.base.ExtensionUI {
        is(node) {
            return !node.pageFlow;
        }
        condition(node, parent) {
            return parent.naturalElement && parent.documentRoot && (Math.ceil(node.linear.left) < Math.floor(parent.box.left) && (node.left < 0 || node.marginLeft < 0 || !node.hasPX('left') && node.right > 0) ||
                Math.floor(node.linear.right) > Math.ceil(parent.box.right) && (node.left > 0 || node.marginLeft > 0 || !node.hasPX('left') && node.right < 0) ||
                Math.ceil(node.linear.top) < Math.floor(parent.box.top) && (node.top < 0 || node.marginTop < 0 || !node.hasPX('top') && node.bottom > 0) ||
                Math.floor(node.linear.bottom) > Math.ceil(parent.box.bottom) && (node.top > 0 || node.marginTop > 0 || !node.hasPX('top') && node.bottom < 0) && parent.hasPX('height'));
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
    const $css$a = squared.lib.css;
    const { constant: $c$a, enumeration: $e$f } = squared.base.lib;
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
            return this.application.userSettings.supportNegativeLeftTop && !node.documentRoot && node.css('overflowX') !== 'hidden';
        }
        condition(node) {
            return node.some((item) => outsideX(item, node));
        }
        processNode(node, parent) {
            const outside = node.filter((item) => outsideX(item, node));
            const container = this.controller.createNodeWrapper(node, parent, outside, CONTAINER_ANDROID.CONSTRAINT, CONTAINER_NODE.CONSTRAINT);
            if (node.marginTop > 0) {
                container.modifyBox(2 /* MARGIN_TOP */, node.marginTop);
                node.modifyBox(2 /* MARGIN_TOP */);
            }
            if (node.marginBottom > 0) {
                container.modifyBox(8 /* MARGIN_BOTTOM */, node.marginBottom);
                node.modifyBox(8 /* MARGIN_BOTTOM */);
            }
            let left = NaN;
            let right = NaN;
            let firstChild;
            for (const item of outside) {
                if (item.pageFlow) {
                    if (isNaN(left) || item.linear.left < left) {
                        left = item.linear.left;
                    }
                    firstChild = item;
                }
                else {
                    if (item.hasPX('left')) {
                        if (item.left < 0 && (isNaN(left) || item.linear.left < left)) {
                            left = item.linear.left;
                        }
                    }
                    else if (item.right < 0 && (isNaN(right) || item.linear.right > right)) {
                        right = item.linear.right;
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
                            item.css('left', $css$a.formatPX(item.left + offset), true);
                        }
                    }
                }
                else {
                    for (const item of outside) {
                        if (!item.pageFlow && item.left < 0) {
                            item.css('left', $css$a.formatPX(node.marginLeft + item.left), true);
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
                let offset = right - node.linear.right;
                if (offset > node.marginRight) {
                    offset -= node.marginRight;
                    node.modifyBox(4 /* MARGIN_RIGHT */, offset);
                }
                else {
                    offset = 0;
                }
                const outerRight = node.linear.right + offset;
                if (node.marginRight > 0) {
                    offset += node.marginRight;
                }
                if (offset > 0) {
                    if (node.hasPX('width', false) || !node.blockStatic && !node.hasPX('width')) {
                        container.css(container.hasPX('width') ? 'width' : 'minWidth', $css$a.formatPX(node.actualWidth + offset), true);
                    }
                }
                for (const item of outside) {
                    if (item.right < 0) {
                        item.css('right', $css$a.formatPX(outerRight - item.linear.right), true);
                    }
                }
            }
            this.subscribers.add(container);
            container.data(EXT_ANDROID.DELEGATE_NEGATIVEX, $c$a.STRING_BASE.EXT_DATA, { offsetLeft: node.marginLeft + node.paddingLeft, firstChild, nextSibling: node });
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new $LayoutUI$c(parent, container, container.containerType, 8 /* HORIZONTAL */ | 4096 /* SINGLE */, container.children))
            };
        }
        postBaseLayout(node) {
            const mainData = node.data(EXT_ANDROID.DELEGATE_NEGATIVEX, $c$a.STRING_BASE.EXT_DATA);
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
    const $e$g = squared.base.lib.enumeration;
    const isFlexible = (node) => !node.documentParent.layoutElement && !node.display.startsWith('table');
    class Percent extends squared.base.ExtensionUI {
        is(node) {
            return node.pageFlow;
        }
        condition(node, parent) {
            if (node.has('width', 4 /* PERCENT */, { not: '100%' }) && !parent.layoutConstraint && (node.documentRoot ||
                node.hasPX('height') ||
                (parent.layoutVertical || node.onlyChild) && (parent.blockStatic || parent.hasPX('width')))) {
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
            const renderParent = node.renderParent;
            if (renderParent) {
                node.resetBox(30 /* MARGIN */, renderParent, true);
            }
        }
    }

    const $NodeUI$3 = squared.base.NodeUI;
    const $e$h = squared.base.lib.enumeration;
    const getInputName = (element) => element.name ? element.name.trim() : '';
    class RadioGroup extends squared.base.ExtensionUI {
        is(node) {
            return node.is(CONTAINER_NODE.RADIO);
        }
        condition(node) {
            return getInputName(node.element) !== '' && !node.positioned;
        }
        processNode(node, parent) {
            const element = node.element;
            const inputName = getInputName(element);
            const children = [];
            const removeable = [];
            const radioButton = [];
            parent.each((item) => {
                let remove;
                if (item.renderAs) {
                    if (item.renderAs !== node) {
                        remove = item;
                    }
                    item = item.renderAs;
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
                const linearX = $NodeUI$3.linearData(children).linearX;
                if (linearX) {
                    container.addAlign(8 /* HORIZONTAL */ | 128 /* SEGMENTED */);
                    container.android('orientation', STRING_ANDROID.HORIZONTAL);
                }
                else {
                    container.addAlign(16 /* VERTICAL */);
                    container.android('orientation', STRING_ANDROID.VERTICAL);
                }
                if (parent.layoutConstraint) {
                    container.companion = node;
                }
                container.setControlType(CONTAINER_ANDROID.RADIOGROUP, CONTAINER_NODE.LINEAR);
                container.inherit(node, 'alignment');
                if (container.baseline) {
                    container.css('verticalAlign', 'middle');
                    container.baseline = false;
                }
                container.exclude($e$h.NODE_RESOURCE.ASSET);
                container.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent);
                for (const item of removeable) {
                    item.hide();
                }
                this.subscribers.add(container);
                return {
                    renderAs: container,
                    outputAs: {
                        type: 1 /* XML */,
                        node: container,
                        controlName: CONTAINER_ANDROID.RADIOGROUP
                    },
                    parent: container,
                    complete: true
                };
            }
            return undefined;
        }
        postBaseLayout(node) {
            node.renderEach((item) => {
                if (item.naturalElement && item.element.checked) {
                    node.android('checkedButton', item.documentId);
                }
            });
        }
    }

    const $css$b = squared.lib.css;
    const $e$i = squared.base.lib.enumeration;
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
            const verticalScroll = CONTAINER_ANDROID.VERTICAL_SCROLL;
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
                        child.css('maxWidth', $css$b.formatPX(boxWidth), true);
                    }
                }
            }
            const length = overflow.length;
            if (length > 0) {
                for (let i = 0; i < length; i++) {
                    let container;
                    if (i === 0) {
                        container = this.application.createNode(node.element);
                        container.inherit(node, 'base', 'initial', 'styleMap');
                        parent.appendTry(node, container);
                        container.innerWrapped = node;
                        node.outerWrapper = container;
                    }
                    else {
                        container = this.application.createNode();
                        container.inherit(node, 'base');
                        container.exclude($e$i.NODE_RESOURCE.BOX_STYLE);
                        scrollView[0].outerWrapper = container;
                        container.innerWrapped = scrollView[0];
                    }
                    container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                    container.exclude($e$i.NODE_RESOURCE.ASSET);
                    container.resetBox(480 /* PADDING */);
                    scrollView.push(container);
                }
                for (let i = 0; i < length; i++) {
                    const item = scrollView[i];
                    const previous = scrollView[i - 1];
                    switch (item.controlName) {
                        case verticalScroll:
                            node.setLayoutHeight('wrap_content');
                            item.setLayoutHeight($css$b.formatPX(node.actualHeight));
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
                            item.setLayoutWidth($css$b.formatPX(node.actualWidth));
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
                        item.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent);
                    }
                    else {
                        item.render(previous);
                    }
                    item.unsetCache();
                    this.application.addLayoutTemplate((item.renderParent || parent), item, {
                        type: 1 /* XML */,
                        node: item,
                        controlName: item.controlName
                    });
                }
                const outer = scrollView.pop();
                node.parent = outer;
                if (parent.layoutConstraint) {
                    outer.companion = node;
                }
                node.overflow = 0;
                node.resetBox(30 /* MARGIN */);
                node.exclude($e$i.NODE_RESOURCE.BOX_STYLE);
                return { parent: node.parent };
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

    const { color: $color$2, css: $css$c, math: $math$5, regex: $regex$3, util: $util$e, xml: $xml$2 } = squared.lib;
    const $e$j = squared.base.lib.enumeration;
    function getBorderStyle(border, direction = -1, halfSize = false) {
        const { style, color } = border;
        const width = roundFloat(border.width);
        const result = getStrokeColor(color);
        switch (style) {
            case 'solid':
                break;
            case 'dotted':
                result.dashWidth = $css$c.formatPX(width);
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
                result.dashWidth = $css$c.formatPX(dashWidth);
                result.dashGap = $css$c.formatPX(dashGap);
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
                    const grayScale = rgba.r !== 0 && rgba.r === rgba.g && rgba.g === rgba.b;
                    if (style === 'inset' || grayScale && style === 'groove' || !grayScale && style === 'ridge') {
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
                                percent = 0.5;
                            }
                            break;
                        case 1:
                        case 2:
                            percent = grayScale ? 0.8 : -0.75;
                            break;
                    }
                }
                if (percent !== 1) {
                    const reduced = $color$2.reduceRGBA(rgba, percent, color.valueAsRGBA);
                    if (reduced) {
                        return getStrokeColor(reduced);
                    }
                }
        }
        return result;
    }
    function getBorderStroke(border, direction = -1, hasInset = false, isInset = false) {
        let result;
        if (border) {
            if (isAlternatingBorder(border.style)) {
                const width = parseFloat(border.width);
                result = getBorderStyle(border, direction, !isInset);
                if (isInset) {
                    result.width = $css$c.formatPX(Math.ceil(width / 2) * 2);
                }
                else {
                    result.width = hasInset ? $css$c.formatPX(Math.ceil(width / 2)) : $css$c.formatPX(roundFloat(border.width));
                }
            }
            else {
                result = getBorderStyle(border);
                result.width = $css$c.formatPX(roundFloat(border.width));
            }
        }
        return result;
    }
    function getBorderRadius(radius) {
        if (radius) {
            const lengthA = radius.length;
            if (lengthA === 1) {
                return { radius: radius[0] };
            }
            else {
                let corners;
                if (lengthA === 8) {
                    corners = [];
                    for (let i = 0; i < lengthA; i += 2) {
                        corners.push($css$c.formatPX((parseFloat(radius[i]) + parseFloat(radius[i + 1])) / 2));
                    }
                }
                else {
                    corners = radius;
                }
                const boxModel = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
                const result = {};
                let valid = false;
                const lengthB = corners.length;
                for (let i = 0; i < lengthB; i++) {
                    if (corners[i] !== '0px') {
                        result[`${boxModel[i]}Radius`] = corners[i];
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
    function getBackgroundColor(value) {
        const color = getColorValue(value, false);
        return color !== '' ? { color } : undefined;
    }
    function isAlternatingBorder(value) {
        switch (value) {
            case 'groove':
            case 'ridge':
            case 'inset':
            case 'outset':
                return true;
            default:
                return false;
        }
    }
    function insertDoubleBorder(items, border, top, right, bottom, left, indentWidth = 0, corners) {
        const width = roundFloat(border.width);
        const borderWidth = Math.max(1, Math.floor(width / 3));
        const indentOffset = indentWidth > 0 ? $css$c.formatPX(indentWidth) : '';
        let hideOffset = '-' + $css$c.formatPX(borderWidth + indentWidth + 1);
        items.push({
            top: top ? indentOffset : hideOffset,
            right: right ? indentOffset : hideOffset,
            bottom: bottom ? indentOffset : hideOffset,
            left: left ? indentOffset : hideOffset,
            shape: {
                'android:shape': 'rectangle',
                stroke: Object.assign({ width: $css$c.formatPX(borderWidth) }, getBorderStyle(border)),
                corners
            }
        });
        const insetWidth = width - borderWidth + indentWidth;
        const drawOffset = $css$c.formatPX(insetWidth);
        hideOffset = '-' + $css$c.formatPX(insetWidth + 1);
        items.push({
            top: top ? drawOffset : hideOffset,
            right: right ? drawOffset : hideOffset,
            bottom: bottom ? drawOffset : hideOffset,
            left: left ? drawOffset : hideOffset,
            shape: {
                'android:shape': 'rectangle',
                stroke: Object.assign({ width: $css$c.formatPX(borderWidth) }, getBorderStyle(border)),
                corners
            }
        });
    }
    function checkBackgroundPosition(value, adjacent, fallback) {
        const initial = value === 'initial' || value === 'unset';
        if (value.indexOf(' ') === -1 && adjacent.indexOf(' ') !== -1) {
            return $regex$3.CHAR.LOWERCASE.test(value) ? `${initial ? fallback : value} 0px` : `${fallback} ${value}`;
        }
        else if (initial) {
            return '0px';
        }
        return value;
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
                    result.centerX = $css$c.formatPercent(center.leftAsPercent);
                    result.centerY = $css$c.formatPercent(center.topAsPercent);
                }
                break;
            }
            case 'radial': {
                const radial = gradient;
                const center = radial.center;
                if (hasStop) {
                    result.gradientRadius = radial.radius.toString();
                    result.centerX = center.left.toString();
                    result.centerY = center.top.toString();
                }
                else {
                    result.gradientRadius = $css$c.formatPX(radial.radius);
                    result.centerX = $css$c.formatPercent(center.leftAsPercent);
                    result.centerY = $css$c.formatPercent(center.topAsPercent);
                }
                break;
            }
            case 'linear': {
                const linear = gradient;
                const { width, height } = linear.dimension;
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
                result.endX = $math$5.truncate(positionX, precision);
                result.endY = $math$5.truncate(positionY, precision);
                break;
            }
        }
        const colorStops = gradient.colorStops;
        if (hasStop) {
            result.item = convertColorStops(colorStops);
        }
        else {
            result.startColor = getColorValue(colorStops[0].color);
            result.endColor = getColorValue(colorStops[colorStops.length - 1].color);
            if (colorStops.length > 2) {
                result.centerColor = getColorValue(colorStops[Math.floor(colorStops.length / 2)].color);
            }
        }
        return result;
    }
    function getPercentOffset(direction, position, backgroundSize, bounds, dimension) {
        if (dimension) {
            const orientation = position.orientation;
            const sign = backgroundSize === 'cover' || backgroundSize === 'contain' ? -1 : 1;
            if (direction === 'left' || direction === 'right') {
                if (backgroundSize !== 'cover') {
                    const value = orientation.length === 4 ? orientation[1] : orientation[0];
                    if ($css$c.isPercent(value)) {
                        const percent = direction === 'left' ? position.leftAsPercent : position.rightAsPercent;
                        let result = percent * (bounds.width - dimension.width);
                        if (sign === -1) {
                            result = Math.abs(result);
                            if (percent > 0) {
                                result *= -1;
                            }
                        }
                        return result;
                    }
                }
                else {
                    return 0;
                }
            }
            else if (backgroundSize !== 'contain') {
                const value = orientation.length === 4 ? orientation[3] : orientation[1];
                if ($css$c.isPercent(value)) {
                    const percent = direction === 'top' ? position.topAsPercent : position.bottomAsPercent;
                    let result = percent * (bounds.height - dimension.height);
                    if (sign === -1) {
                        result = Math.abs(result);
                        if (percent > 0) {
                            result *= -1;
                        }
                    }
                    return result;
                }
            }
            else {
                return 0;
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
        if (border.style === 'double' && width === 2) {
            return 3;
        }
        return width;
    }
    function getColorValue(value, transparency = true) {
        const color = Resource.addColor(value, transparency);
        return color !== '' ? `@color/${color}` : '';
    }
    const roundFloat = (value) => Math.round(parseFloat(value));
    const getStrokeColor = (value) => ({ color: getColorValue(value), dashWidth: '', dashGap: '' });
    const isInsetBorder = (border) => border.style === 'groove' || border.style === 'ridge' || border.style === 'double' && roundFloat(border.width) > 1;
    function convertColorStops(list, precision) {
        const result = [];
        for (const stop of list) {
            result.push({
                color: getColorValue(stop.color),
                offset: $math$5.truncate(stop.offset, precision)
            });
        }
        return result;
    }
    function drawRect(width, height, x = 0, y = 0, precision) {
        if (precision) {
            x = $math$5.truncate(x, precision);
            y = $math$5.truncate(y, precision);
            width = $math$5.truncate(x + width, precision);
            height = $math$5.truncate(y + height, precision);
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
            const application = this.application;
            const settings = application.userSettings;
            this._resourceSvgInstance = this.controller.localSettings.svg.enabled ? application.builtInExtensions[EXT_ANDROID.RESOURCE_SVG] : undefined;
            function setDrawableBackground(node, value) {
                let drawable = Resource.insertStoredAsset('drawables', `${node.containerName.toLowerCase()}_${node.controlId}`, value);
                if (drawable !== '') {
                    drawable = `@drawable/${drawable}`;
                    if (node.documentBody) {
                        const style = node.visibleStyle;
                        if (node.blockStatic && !node.hasPX('width') && !node.hasPX('maxWidth') && (style.backgroundImage && style.backgroundRepeat || node.backgroundColor !== '')) {
                            setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, drawable);
                            return;
                        }
                        setHtmlBackground(node);
                    }
                    node.android('background', drawable, false);
                }
            }
            function setHtmlBackground(node) {
                const parent = node.actualParent;
                if (!parent.visible) {
                    const background = parent.android('background');
                    if (background !== '') {
                        setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, background);
                    }
                }
            }
            const drawOutline = this.options.drawOutlineAsInsetBorder;
            for (const node of application.processing.cache) {
                const stored = node.data(Resource.KEY_NAME, 'boxStyle');
                if (stored) {
                    if (node.hasResource($e$j.NODE_RESOURCE.BOX_STYLE)) {
                        if (node.inputElement) {
                            const companion = node.companion;
                            if (companion && !companion.visible && companion.tagName === 'LABEL') {
                                const style = companion.data(Resource.KEY_NAME, 'boxStyle');
                                if (style && style.backgroundColor) {
                                    stored.backgroundColor = style.backgroundColor;
                                }
                            }
                        }
                        let [shapeData, layerListData] = this.getDrawableBorder(stored, [stored.borderTop, stored.borderRight, stored.borderBottom, stored.borderLeft], stored.border, this.getDrawableImages(node, stored), drawOutline && stored.outline ? getIndentOffset(stored.outline) : 0, false);
                        const emptyBackground = shapeData === undefined && layerListData === undefined;
                        if (stored.outline && (drawOutline || emptyBackground)) {
                            const outline = stored.outline;
                            const [outlineShapeData, outlineLayerListData] = this.getDrawableBorder(stored, [outline, outline, outline, outline], emptyBackground ? outline : undefined);
                            if (emptyBackground) {
                                shapeData = outlineShapeData;
                                layerListData = outlineLayerListData;
                            }
                            else if (layerListData && outlineLayerListData) {
                                layerListData[0].item = layerListData[0].item.concat(outlineLayerListData[0].item);
                            }
                        }
                        if (shapeData) {
                            setDrawableBackground(node, $xml$2.applyTemplate('shape', SHAPE_TMPL, shapeData));
                        }
                        else if (layerListData) {
                            setDrawableBackground(node, $xml$2.applyTemplate('layer-list', LAYERLIST_TMPL, layerListData));
                        }
                        else if (stored.backgroundColor) {
                            const color = getColorValue(stored.backgroundColor, false);
                            if (color !== '') {
                                if (node.documentBody) {
                                    setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, color);
                                }
                                else {
                                    const fontStyle = node.data(Resource.KEY_NAME, 'fontStyle');
                                    if (fontStyle) {
                                        fontStyle.backgroundColor = stored.backgroundColor;
                                    }
                                    else {
                                        node.android('background', color, false);
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
        getDrawableBorder(data, borders, border, images, indentWidth = 0, borderOnly = true) {
            const borderVisible = [];
            const corners = !borderOnly ? getBorderRadius(data.borderRadius) : undefined;
            const indentOffset = indentWidth > 0 ? $css$c.formatPX(indentWidth) : '';
            let borderStyle = true;
            let borderData;
            let shapeData;
            let layerListData;
            for (let i = 0; i < 4; i++) {
                const item = borders[i];
                if (item) {
                    if (borderStyle && borderData) {
                        borderStyle = $util$e.isEqual(borderData, item);
                    }
                    borderData = item;
                    borderVisible[i] = true;
                }
                else {
                    borderVisible[i] = false;
                }
            }
            if (border && !isAlternatingBorder(border.style) && !(border.style === 'double' && parseInt(border.width) > 1) || borderData === undefined && (corners || images && images.length)) {
                const stroke = border ? getBorderStroke(border) : false;
                if (images && images.length || indentWidth > 0) {
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
                        const hideOffset = '-' + $css$c.formatPX(width + indentWidth + 1);
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
                                    const hideInsetOffset = '-' + $css$c.formatPX(width + indentWidth + 1);
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
                                const hideOffset = '-' + $css$c.formatPX((inset ? Math.ceil(width / 2) : width) + indentWidth + 1);
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
            const backgroundImage = data.backgroundImage;
            const extracted = node.extracted;
            if ((backgroundImage || extracted) && node.hasResource($e$j.NODE_RESOURCE.IMAGE_SOURCE)) {
                const resource = this.resource;
                const result = [];
                const { width: boundsWidth, height: boundsHeight } = node.bounds;
                const backgroundRepeat = data.backgroundRepeat.split($regex$3.XML.SEPARATOR);
                const backgroundPositionX = data.backgroundPositionX.split($regex$3.XML.SEPARATOR);
                const backgroundPositionY = data.backgroundPositionY.split($regex$3.XML.SEPARATOR);
                const images = [];
                const backgroundPosition = [];
                const imageDimensions = [];
                let backgroundSize = data.backgroundSize.split($regex$3.XML.SEPARATOR);
                let length = 0;
                let resizable = true;
                if (backgroundImage) {
                    length = backgroundImage.length;
                    while (backgroundSize.length < length) {
                        backgroundSize = backgroundSize.concat(backgroundSize.slice(0));
                    }
                    backgroundSize.length = length;
                    const resourceInstance = this._resourceSvgInstance;
                    for (let i = 0, j = 0; i < length; i++) {
                        let value = backgroundImage[i];
                        let valid = false;
                        if (typeof value === 'string') {
                            if (value !== 'initial') {
                                if (resourceInstance) {
                                    const [parentElement, element] = resourceInstance.createSvgElement(node, value);
                                    if (parentElement && element) {
                                        const drawable = resourceInstance.createSvgDrawable(node, element);
                                        if (drawable !== '') {
                                            images[j] = drawable;
                                            imageDimensions[j] = { width: element.width.baseVal.value, height: element.height.baseVal.value };
                                            valid = true;
                                        }
                                        parentElement.removeChild(element);
                                    }
                                }
                                if (!valid) {
                                    const match = $regex$3.CSS.URL.exec(value);
                                    if (match) {
                                        if (match[1].startsWith('data:image')) {
                                            const rawData = resource.getRawData(match[1]);
                                            if (rawData && rawData.base64) {
                                                images[j] = rawData.filename.substring(0, rawData.filename.lastIndexOf('.'));
                                                imageDimensions[j] = { width: rawData.width, height: rawData.height };
                                                resource.writeRawImage(rawData.filename, rawData.base64);
                                                valid = true;
                                            }
                                        }
                                        else {
                                            value = $util$e.resolvePath(match[1]);
                                            images[j] = Resource.addImage({ mdpi: value });
                                            if (images[j] !== '') {
                                                imageDimensions[j] = resource.getImage(value);
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
                                images[j] = gradient;
                                imageDimensions[j] = value.dimension;
                                valid = true;
                            }
                        }
                        if (valid) {
                            const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                            const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                            backgroundPosition[j] = $css$c.getBackgroundPosition(`${checkBackgroundPosition(x, y, 'left')} ${checkBackgroundPosition(y, x, 'top')}`, node.actualDimension, imageDimensions[j], node.fontSize);
                            j++;
                        }
                        else {
                            backgroundRepeat.splice(i, 1);
                            backgroundSize.splice(i, 1);
                            length--;
                        }
                    }
                }
                if (extracted) {
                    if (length === 0) {
                        backgroundRepeat.length = 0;
                        backgroundSize.length = 0;
                    }
                    const embedded = extracted.filter(item => item.visible && (item.imageElement || item.containerName === 'INPUT_IMAGE'));
                    for (let i = 0, j = length; i < embedded.length; i++) {
                        const image = embedded[i];
                        const element = image.element;
                        const src = resource.addImageSrc(element);
                        if (src !== '') {
                            images[j] = src;
                            backgroundRepeat[j] = 'no-repeat';
                            backgroundSize[j] = `${image.actualWidth}px ${image.actualHeight}px`;
                            backgroundPosition[j] = $css$c.getBackgroundPosition(image.containerName === 'INPUT_IMAGE' ? '0px 0px' : `${image.bounds.left - node.bounds.left + node.borderLeftWidth}px ${image.bounds.top - node.bounds.top + node.borderTopWidth}px`, node.actualDimension, image.bounds, node.fontSize);
                            imageDimensions[j] = resource.getImage(element.src);
                            j++;
                        }
                    }
                }
                length = images.length;
                let centerHorizontally = false;
                for (let i = length - 1; i >= 0; i--) {
                    const value = images[i];
                    if (!value) {
                        continue;
                    }
                    const position = backgroundPosition[i];
                    const size = backgroundSize[i];
                    const imageData = {
                        bitmap: false,
                        rotate: false,
                        gradient: false
                    };
                    let dimension = imageDimensions[i];
                    let dimenWidth = 0;
                    let dimenHeight = 0;
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
                    if (typeof value === 'string') {
                        function resetPosition(dirA, dirB, overwrite = false) {
                            if (position.orientation.length === 2 || overwrite) {
                                position[dirA] = 0;
                            }
                            position[dirB] = 0;
                        }
                        const src = `@drawable/${value}`;
                        const repeat = backgroundRepeat[i];
                        const repeating = repeat === 'repeat';
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
                                while (position.left > 0) {
                                    position.left -= dimenWidth;
                                }
                            }
                            else {
                                position.left = 0;
                            }
                            position.right = 0;
                            repeatX = true;
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
                                while (position.top > 0) {
                                    position.top -= dimenHeight;
                                }
                            }
                            else {
                                position.top = 0;
                            }
                            position.bottom = 0;
                            repeatY = true;
                        }
                        let width = 0;
                        let height = 0;
                        let tileMode = '';
                        let tileModeX = '';
                        let tileModeY = '';
                        let gravityAlign = '';
                        let gravity;
                        switch (repeat) {
                            case 'repeat':
                                tileMode = 'repeat';
                                break;
                            case 'repeat-x':
                                if (!node.documentBody) {
                                    tileModeX = 'repeat';
                                    if (!node.blockStatic && dimenWidth > boundsWidth) {
                                        width = dimenWidth;
                                    }
                                }
                                else {
                                    if (dimension && dimenWidth < boundsWidth) {
                                        tileModeX = 'repeat';
                                    }
                                    else {
                                        gravityX = 'fill_horizontal';
                                    }
                                }
                                break;
                            case 'repeat-y':
                                if (!node.documentBody) {
                                    tileModeY = 'repeat';
                                    if (dimenHeight > boundsHeight) {
                                        height = dimenHeight;
                                    }
                                }
                                else {
                                    if (dimension && dimenHeight < boundsHeight) {
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
                        if (dimension) {
                            if (gravityX !== '' && tileModeY === 'repeat' && dimenWidth < boundsWidth) {
                                function resetX() {
                                    if (gravityY === '' && gravityX !== '' && gravityX !== node.localizeString('left') && node.renderChildren.length) {
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
                                    if (gravityX === '' && gravityY !== '' && gravityY !== 'top' && node.renderChildren.length) {
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
                            if (!node.blockStatic || node.hasWidth) {
                                if (dimenWidth + position.left >= boundsWidth) {
                                    tileModeX = '';
                                    if (tileMode === 'repeat') {
                                        tileModeY = 'repeat';
                                        tileMode = '';
                                    }
                                }
                                if (dimenHeight + position.top >= boundsHeight) {
                                    tileModeY = '';
                                    if (tileMode === 'repeat') {
                                        tileModeX = 'repeat';
                                        tileMode = '';
                                    }
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
                            case 'auto 100%':
                            case 'cover':
                                gravity = 'fill';
                                gravityX = 'fill_horizontal';
                                gravityY = 'fill_vertical';
                                tileMode = '';
                                tileModeX = '';
                                tileModeY = '';
                                position.left = 0;
                                position.top = 0;
                                if (node.documentBody) {
                                    node.visibleStyle.backgroundRepeat = true;
                                }
                                break;
                            default:
                                size.split(' ').forEach((dimen, index) => {
                                    if (dimen !== 'auto' && dimen !== '100%') {
                                        if (index === 0) {
                                            width = node.parseUnit(dimen, 'width', false);
                                        }
                                        else {
                                            height = node.parseUnit(dimen, 'height', false);
                                        }
                                    }
                                    else {
                                        gravityX = index === 0 ? 'fill_horizontal' : 'fill_vertical';
                                    }
                                });
                                break;
                        }
                        if (dimension) {
                            const canResizeHorizontal = () => gravityX !== 'fill_horizontal' && tileMode !== 'repeat' && tileModeX === '';
                            const canResizeVertical = () => gravityY !== 'fill_vertical' && tileMode !== 'repeat' && tileModeY === '';
                            switch (size) {
                                case 'cover':
                                    if (dimenWidth < boundsWidth || dimenHeight < boundsHeight) {
                                        width = 0;
                                        if (dimenHeight < boundsHeight) {
                                            const ratio = Math.max(boundsWidth / dimenWidth, boundsHeight / dimenHeight);
                                            height = dimenHeight * ratio;
                                        }
                                        else {
                                            height = 0;
                                        }
                                        gravity = 'top|center_horizontal|fill_horizontal';
                                    }
                                    else {
                                        width = 0;
                                        height = 0;
                                        gravity = 'fill';
                                    }
                                    resizable = false;
                                    break;
                                case 'contain':
                                    if (dimenWidth !== boundsWidth && dimenHeight !== boundsHeight) {
                                        const ratio = Math.min(boundsWidth / dimenWidth, boundsHeight / dimenHeight);
                                        width = dimenWidth * ratio;
                                        height = dimenHeight * ratio;
                                    }
                                    else {
                                        width = 0;
                                        height = 0;
                                    }
                                    resizable = false;
                                    break;
                                default:
                                    if (width === 0 && height > 0 && canResizeHorizontal()) {
                                        width = dimenWidth * (height === 0 ? boundsHeight : height) / dimenHeight;
                                    }
                                    if (height === 0 && width > 0 && canResizeVertical()) {
                                        height = dimenHeight * (width === 0 ? boundsWidth : width) / dimenWidth;
                                    }
                                    break;
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
                                if (clipLeft > clipRight) {
                                    left = clipLeft - clipRight;
                                }
                                else if (clipLeft < clipRight) {
                                    right = clipRight - clipLeft;
                                }
                                if (clipTop > clipBottom) {
                                    top = clipTop - clipBottom;
                                }
                                else if (clipTop < clipBottom) {
                                    bottom = clipBottom - clipTop;
                                }
                            }
                            else if (width === 0 && height === 0 && dimenWidth < boundsWidth && dimenHeight < boundsHeight && canResizeHorizontal() && canResizeVertical()) {
                                width = dimenWidth;
                                height = dimenHeight;
                            }
                            if (resizable && !node.documentRoot && !node.is(CONTAINER_NODE.IMAGE)) {
                                let fillX = false;
                                let fillY = false;
                                if (boundsWidth < dimenWidth && (!node.has('width', 2 /* LENGTH */, { map: 'initial', not: '100%' }) && !(node.blockStatic && centerHorizontally) || !node.pageFlow) && node.renderParent && !node.renderParent.tableElement) {
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
                                    else if (fillX) {
                                        gravityAlign += 'fill_horizontal';
                                    }
                                    else {
                                        gravityAlign += 'fill_vertical';
                                    }
                                }
                            }
                            if (width > 0) {
                                imageData.width = $css$c.formatPX(width);
                            }
                            if (height > 0) {
                                imageData.height = $css$c.formatPX(height);
                            }
                        }
                        if (gravityAlign === '' && tileMode !== 'repeat') {
                            if (tileModeX !== '') {
                                if (tileModeY === '' && gravityY !== '' && gravityY !== 'fill_vertical') {
                                    gravityAlign = gravityY;
                                    gravityY = '';
                                    if (node.renderChildren.length) {
                                        tileModeX = '';
                                    }
                                }
                            }
                            else if (tileModeY !== '' && gravityX !== '' && gravityX !== 'fill_horizontal') {
                                gravityAlign = gravityX;
                                gravityX = '';
                                if (node.renderChildren.length) {
                                    tileModeY = '';
                                }
                            }
                        }
                        if (gravity === undefined) {
                            if (gravityX === STRING_ANDROID.CENTER_HORIZONTAL && gravityY === STRING_ANDROID.CENTER_VERTICAL) {
                                if (dimension && dimenWidth <= boundsWidth && dimenHeight <= boundsHeight) {
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
                        if (node.documentBody || tileMode === 'repeat' || tileModeX !== '' || tileModeY !== '' || gravityAlign) {
                            if (gravityAlign) {
                                imageData.gravity = gravityAlign;
                            }
                            imageData.bitmap = [{
                                    src,
                                    gravity,
                                    tileMode,
                                    tileModeX,
                                    tileModeY
                                }];
                        }
                        else {
                            imageData.gravity = gravity;
                            imageData.drawable = src;
                            if (gravity === 'center' || gravity.startsWith(STRING_ANDROID.CENTER_HORIZONTAL)) {
                                centerHorizontally = true;
                            }
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
                        if (size.split(' ').some(dimen => dimen !== '100%' && $css$c.isLength(dimen, true))) {
                            imageData.width = $css$c.formatPX(width);
                            imageData.height = $css$c.formatPX(height);
                        }
                        const src = Resource.insertStoredAsset('drawables', `${node.containerName.toLowerCase()}_${node.controlId}_gradient_${i + 1}`, $xml$2.applyTemplate('vector', VECTOR_TMPL, [{
                                'xmlns:android': XMLNS_ANDROID.android,
                                'xmlns:aapt': XMLNS_ANDROID.aapt,
                                'android:width': imageData.width || $css$c.formatPX(width),
                                'android:height': imageData.height || $css$c.formatPX(height),
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
                            imageData.drawable = `@drawable/${src}`;
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
                        const bounds = node.bounds;
                        if (position.bottom !== 0) {
                            imageData.bottom = $css$c.formatPX((repeatY ? position.bottom : getPercentOffset('bottom', position, size, bounds, dimension)) + bottom);
                            bottom = 0;
                        }
                        else if (position.top !== 0) {
                            imageData.top = $css$c.formatPX((repeatY ? position.top : getPercentOffset('top', position, size, bounds, dimension)) + top);
                            top = 0;
                        }
                        if (position.right !== 0) {
                            imageData.right = $css$c.formatPX((repeatX ? position.right : getPercentOffset('right', position, size, bounds, dimension)) + right);
                            right = 0;
                        }
                        else if (position.left !== 0) {
                            imageData.left = $css$c.formatPX((repeatX ? position.left : getPercentOffset('left', position, size, bounds, dimension)) + left);
                            left = 0;
                        }
                        if (top !== 0) {
                            imageData.top = $css$c.formatPX(top);
                        }
                        if (right !== 0) {
                            imageData.right = $css$c.formatPX(right);
                        }
                        if (bottom !== 0) {
                            imageData.bottom = $css$c.formatPX(bottom);
                        }
                        if (left !== 0) {
                            imageData.left = $css$c.formatPX(left);
                        }
                        result.push(imageData);
                    }
                }
                return result;
            }
            return undefined;
        }
    }

    const { regex: $regex$4, util: $util$f } = squared.lib;
    const STORED$2 = Resource.STORED;
    const NAMESPACE_ATTR = ['android', 'app'];
    const REGEXP_UNIT = /\dpx$/;
    const REGEXP_UNIT_ATTR = /:(\w+)="(-?[\d.]+px)"/;
    function getResourceName(map, name, value) {
        for (const [storedName, storedValue] of map.entries()) {
            if (storedName.startsWith(name) && value === storedValue) {
                return storedName;
            }
        }
        return map.has(name) && map.get(name) !== value ? Resource.generateId('dimen', name) : name;
    }
    const getDisplayName = (value) => $util$f.fromLastIndexOf(value, '.');
    class ResourceDimens extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade() {
            const groups = {};
            for (const node of this.application.session.cache) {
                if (node.visible) {
                    const containerName = node.containerName.toLowerCase();
                    if (groups[containerName] === undefined) {
                        groups[containerName] = {};
                    }
                    for (const namespace of NAMESPACE_ATTR) {
                        const obj = node.namespace(namespace);
                        for (const attr in obj) {
                            const value = obj[attr];
                            if (REGEXP_UNIT.test(value) && attr !== 'text') {
                                const dimen = `${namespace},${attr},${value}`;
                                if (groups[containerName][dimen] === undefined) {
                                    groups[containerName][dimen] = [];
                                }
                                groups[containerName][dimen].push(node);
                            }
                        }
                    }
                }
            }
            for (const containerName in groups) {
                const group = groups[containerName];
                for (const name in group) {
                    const [namespace, attr, value] = name.split($regex$4.XML.SEPARATOR);
                    const key = getResourceName(STORED$2.dimens, `${getDisplayName(containerName)}_${$util$f.convertUnderscore(attr)}`, value);
                    const data = group[name];
                    for (const node of data) {
                        node[namespace](attr, `@dimen/${key}`);
                    }
                    STORED$2.dimens.set(key, value);
                }
            }
        }
        afterFinalize() {
            if (this.controller.hasAppendProcessing()) {
                for (const layout of this.application.layouts) {
                    let content = layout.content;
                    let match;
                    while ((match = REGEXP_UNIT_ATTR.exec(content)) !== null) {
                        if (match[1] !== 'text') {
                            const value = match[2];
                            const key = getResourceName(STORED$2.dimens, `custom_${$util$f.convertUnderscore(match[1])}`, value);
                            STORED$2.dimens.set(key, value);
                            content = content.replace(match[0], match[0].replace(match[2], `@dimen/${key}`));
                        }
                    }
                    layout.content = content;
                }
            }
        }
    }

    const { regex: $regex$5, util: $util$g } = squared.lib;
    const $e$k = squared.base.lib.enumeration;
    const STORED$3 = Resource.STORED;
    const REGEXP_TAGNAME = /^(\w*?)(?:_(\d+))?$/;
    const REGEXP_DOUBLEQUOTE = /"/g;
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
                const data = sorted[i];
                for (const j in data) {
                    if (j === value) {
                        index = i;
                        key = j;
                        i = length;
                        break;
                    }
                }
                if (index !== -1) {
                    sorted[index][key] = $util$g.filterArray(sorted[index][key], id => !ids.includes(id));
                    if (sorted[index][key].length === 0) {
                        delete sorted[index][key];
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
            const resource = this.resource;
            const settings = resource.userSettings;
            const dpi = settings.resolutionDPI;
            const convertPixels = settings.convertPixels === 'dp';
            const nameMap = {};
            const groupMap = {};
            for (const node of this.application.session.cache) {
                if (node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource($e$k.NODE_RESOURCE.FONT_STYLE)) {
                    if (nameMap[node.containerName] === undefined) {
                        nameMap[node.containerName] = [];
                    }
                    nameMap[node.containerName].push(node);
                }
            }
            const styleKeys = Object.keys(FONT_STYLE);
            const length = styleKeys.length;
            for (const tag in nameMap) {
                const sorted = [];
                const data = nameMap[tag];
                for (let node of data) {
                    const stored = Object.assign({}, node.data(Resource.KEY_NAME, 'fontStyle'));
                    const id = node.id;
                    if (node.companion && !node.companion.visible && node.companion.tagName === 'LABEL') {
                        node = node.companion;
                    }
                    if (stored.backgroundColor) {
                        stored.backgroundColor = Resource.addColor(stored.backgroundColor);
                    }
                    if (stored.fontFamily) {
                        stored.fontFamily.replace(REGEXP_DOUBLEQUOTE, '').split($regex$5.XML.SEPARATOR).some((value, index, array) => {
                            value = $util$g.trimString(value, "'");
                            let fontFamily = value.toLowerCase();
                            let customFont = false;
                            if (!this.options.disableFontAlias && FONTREPLACE_ANDROID[fontFamily]) {
                                fontFamily = this.options.systemDefaultFont || FONTREPLACE_ANDROID[fontFamily];
                            }
                            if (FONT_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[fontFamily] || !this.options.disableFontAlias && FONTALIAS_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[FONTALIAS_ANDROID[fontFamily]]) {
                                stored.fontFamily = fontFamily;
                                customFont = true;
                            }
                            else if (stored.fontStyle && stored.fontWeight) {
                                let createFont = true;
                                if (resource.getFont(value, stored.fontStyle, stored.fontWeight) === undefined) {
                                    if (resource.getFont(value, stored.fontStyle)) {
                                        createFont = false;
                                    }
                                    else if (index < array.length - 1) {
                                        return false;
                                    }
                                    else if (index > 0) {
                                        value = $util$g.trimString(array[0], "'");
                                        fontFamily = value.toLowerCase();
                                    }
                                }
                                fontFamily = $util$g.convertWord(fontFamily);
                                if (createFont) {
                                    const fonts = Resource.STORED.fonts.get(fontFamily) || {};
                                    fonts[value + '|' + stored.fontStyle + '|' + stored.fontWeight] = FONTWEIGHT_ANDROID[stored.fontWeight] || stored.fontWeight;
                                    Resource.STORED.fonts.set(fontFamily, fonts);
                                }
                                stored.fontFamily = `@font/${fontFamily}`;
                                customFont = true;
                            }
                            if (customFont) {
                                const fontWeight = stored.fontWeight;
                                if (stored.fontStyle === 'normal') {
                                    stored.fontStyle = '';
                                }
                                if (fontWeight === '400' || node.localSettings.targetAPI < 26 /* OREO */) {
                                    stored.fontWeight = '';
                                }
                                else if (parseInt(fontWeight) > 500) {
                                    stored.fontStyle += (stored.fontStyle ? '|' : '') + 'bold';
                                }
                                return true;
                            }
                            return false;
                        });
                    }
                    stored.color = Resource.addColor(stored.color);
                    for (let i = 0; i < length; i++) {
                        const key = styleKeys[i];
                        let value = stored[key];
                        if (value) {
                            if (convertPixels && key === 'fontSize') {
                                value = convertLength(value, dpi, true);
                            }
                            const attr = FONT_STYLE[key] + value + '"';
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
                const sorted = $util$g.filterArray(groupMap[tag], item => item !== undefined).sort((a, b) => {
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
                        const data = sorted[0];
                        for (const attr in data) {
                            if (data[attr].length) {
                                style[tag][attr] = data[attr];
                            }
                        }
                        sorted.length = 0;
                    }
                    else {
                        const styleKey = {};
                        for (let i = 0; i < sorted.length; i++) {
                            const filtered = {};
                            const dataA = sorted[i];
                            for (const attr1 in dataA) {
                                const ids = dataA[attr1];
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
                                        const dataB = sorted[j];
                                        for (const attr in dataB) {
                                            const compare = dataB[attr];
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
                                    const ids = $util$g.objectMap(attr.split($regex$5.XML.SEPARATOR), value => parseInt(value));
                                    deleteStyleAttribute(sorted, attrs, ids);
                                    style[tag][attrs] = ids;
                                }
                            }
                        }
                        const shared = Object.keys(styleKey);
                        if (shared.length) {
                            style[tag][shared.join(';')] = styleKey[shared[0]];
                        }
                        $util$g.spliceArray(sorted, item => {
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
                const tagData = style[tag];
                const styleData = [];
                for (const attrs in tagData) {
                    const items = [];
                    for (const value of attrs.split(';')) {
                        const match = $regex$5.XML.ATTRIBUTE.exec(value);
                        if (match) {
                            items.push({ key: match[1], value: match[2] });
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
                        if (c === d) {
                            c = a.items[0].name;
                            d = b.items[0].name;
                            if (c === d) {
                                c = a.items[0].value;
                                d = b.items[0].value;
                            }
                        }
                    }
                    return c <= d ? 1 : -1;
                });
                const lengthA = styleData.length;
                for (let i = 0; i < lengthA; i++) {
                    styleData[i].name = $util$g.capitalize(tag) + (i > 0 ? `_${i}` : '');
                }
                resourceMap[tag] = styleData;
            }
            for (const tag in resourceMap) {
                for (const group of resourceMap[tag]) {
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
                    switch (node.tagName) {
                        case 'METER':
                        case 'PROGRESS':
                            node.attr('_', 'style', `@android:style/Widget.ProgressBar.Horizontal`);
                            break;
                        default:
                            if (styles.length > 1) {
                                parentStyle.add(styles.join('.'));
                                styles.shift();
                            }
                            else {
                                parentStyle.add(styles[0]);
                            }
                            node.attr('_', 'style', `@style/${styles.join('.')}`);
                            break;
                    }
                }
            }
            for (const value of parentStyle) {
                const styleName = [];
                let items;
                let parent = '';
                value.split('.').forEach((tag, index, array) => {
                    const match = REGEXP_TAGNAME.exec(tag);
                    if (match) {
                        const styleData = resourceMap[match[1].toUpperCase()][$util$g.convertInt(match[2])];
                        if (styleData) {
                            if (index === 0) {
                                parent = tag;
                                if (array.length === 1) {
                                    items = styleData.items;
                                }
                                else if (!STORED$3.styles.has(tag)) {
                                    STORED$3.styles.set(tag, { name: tag, parent: '', items: styleData.items });
                                }
                            }
                            else {
                                if (items) {
                                    for (const item of styleData.items) {
                                        const replaceIndex = items.findIndex(previous => previous.key === item.key);
                                        if (replaceIndex !== -1) {
                                            items[replaceIndex] = item;
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
                        STORED$3.styles.set(parent, { name: parent, parent: '', items });
                    }
                    else {
                        const name = styleName.join('.');
                        STORED$3.styles.set(name, { name, parent, items });
                    }
                }
            }
        }
    }

    const $e$l = squared.base.lib.enumeration;
    class ResourceIncludes extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade() {
            for (const node of this.application.session.cache) {
                if (node.renderTemplates) {
                    let open;
                    let close;
                    node.renderEach((item, index) => {
                        const name = item.dataset.androidInclude;
                        const closing = item.dataset.androidIncludeEnd === 'true';
                        if (name || closing) {
                            const data = {
                                item,
                                name,
                                index,
                                merge: item.dataset.androidIncludeMerge === 'true'
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
                                        content = controller.getEnclosingXmlTag('merge', getRootNs(content), content);
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

    const { css: $css$d, dom: $dom$2, util: $util$h, xml: $xml$3 } = squared.lib;
    const $e$m = squared.base.lib.enumeration;
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
            const setTextValue = (node, attr, name, value) => {
                name = Resource.addString(value, name, this.options.numberResourceValue);
                if (name !== '') {
                    node.android(attr, this.options.numberResourceValue || !$util$h.isNumber(name) ? `@string/${name}` : name, false);
                }
            };
            for (const node of this.application.processing.cache) {
                if (node.hasResource($e$m.NODE_RESOURCE.VALUE_STRING)) {
                    switch (node.tagName) {
                        case 'SELECT': {
                            const arrayName = this.createOptionArray(node.element, node.controlId);
                            if (arrayName !== '') {
                                node.android('entries', `@array/${arrayName}`);
                            }
                            break;
                        }
                        case 'IFRAME': {
                            const stored = node.data(Resource.KEY_NAME, 'valueString');
                            if (stored) {
                                Resource.addString($xml$3.replaceCharacterData(stored.value), stored.key);
                            }
                            break;
                        }
                        default: {
                            const valueString = node.data(Resource.KEY_NAME, 'valueString');
                            if (valueString) {
                                const name = valueString.key || valueString.value;
                                let value = valueString.value;
                                if (node.naturalChild && node.alignParent('left') && !(!node.plainText && node.preserveWhiteSpace || node.plainText && node.actualParent.preserveWhiteSpace)) {
                                    const textContent = node.textContent;
                                    let leadingSpace = 0;
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
                                            fontStyle.fontSize = `${parseFloat(fontStyle.fontSize) * this.options.fontVariantSmallCapsReduction}px`;
                                        }
                                    }
                                }
                                switch (node.css('textTransform')) {
                                    case 'uppercase':
                                        node.android('textAllCaps', 'true');
                                        break;
                                    case 'lowercase':
                                        value = $util$h.lowerCaseString(value);
                                        break;
                                    case 'capitalize':
                                        value = $util$h.capitalizeString(value);
                                        break;
                                }
                                const tagName = node.tagName;
                                value = $xml$3.replaceCharacterData(value, node.preserveWhiteSpace || tagName === 'CODE');
                                const textDecorationLine = node.css('textDecorationLine');
                                if (textDecorationLine !== 'none') {
                                    for (const style of textDecorationLine.split(' ')) {
                                        switch (style) {
                                            case 'underline':
                                                value = `<u>${value}</u>`;
                                                break;
                                            case 'line-through':
                                                value = `<strike>${value}</strike>`;
                                                break;
                                        }
                                    }
                                }
                                if (tagName === 'INS' && textDecorationLine.indexOf('line-through') === -1) {
                                    value = `<strike>${value}</strike>`;
                                }
                                let textIndent = 0;
                                if (node.blockDimension || node.display === 'table-cell') {
                                    textIndent = node.parseUnit(node.css('textIndent'));
                                    if (textIndent + node.bounds.width < 0) {
                                        value = '';
                                    }
                                }
                                if (textIndent === 0) {
                                    const parent = node.actualParent;
                                    if (parent && (parent.blockDimension || parent.display === 'table-cell') && node === parent.firstChild) {
                                        textIndent = parent.parseUnit(parent.css('textIndent'));
                                    }
                                }
                                if (textIndent > 0) {
                                    const width = $dom$2.measureTextWidth(' ', node.css('fontFamily'), node.fontSize) || node.fontSize / 2;
                                    value = '&#160;'.repeat(Math.max(Math.floor(textIndent / width), 1)) + value;
                                }
                                setTextValue(node, 'text', name, value);
                            }
                            if (node.inputElement) {
                                if (node.controlName === CONTAINER_ANDROID.EDIT_LIST) {
                                    const element = node.element;
                                    if (element.list) {
                                        this.createOptionArray(element.list, node.controlId);
                                        if (!node.hasPX('width')) {
                                            node.css('width', $css$d.formatPX(Math.max(node.bounds.width, node.width)), true);
                                        }
                                    }
                                }
                                const hintString = node.data(Resource.KEY_NAME, 'hintString');
                                if (hintString) {
                                    setTextValue(node, 'hint', `${node.controlId.toLowerCase()}_hint`, hintString);
                                }
                            }
                        }
                    }
                    if (node.styleElement) {
                        const title = node.element.title;
                        if (title !== '') {
                            setTextValue(node, 'tooltipText', `${node.controlId.toLowerCase()}_title`, title);
                        }
                    }
                }
            }
        }
        createOptionArray(element, controlId) {
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
                        value = Resource.addString($xml$3.replaceCharacterData(value), '', this.options.numberResourceValue);
                        if (value !== '') {
                            result.push(`@string/${value}`);
                        }
                    }
                }
            }
            if (result && result.length) {
                return Resource.insertStoredAsset('arrays', `${controlId}_array`, result);
            }
            return '';
        }
    }

    const { regex: $regex$6, util: $util$i } = squared.lib;
    const STORED$4 = Resource.STORED;
    const REGEXP_ATTRIBUTE = /(\w+):(\w+)="([^"]+)"/;
    class ResourceStyles extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade() {
            const styles = {};
            const styleCache = {};
            for (const node of this.application.session.cache) {
                if (node.visible && node.controlId) {
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
                                    style = $util$i.trimString(style.substring(style.indexOf('/') + 1), '"');
                                }
                                const common = [];
                                for (const attr of attrMap.keys()) {
                                    const match = REGEXP_ATTRIBUTE.exec(attr);
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
                                if (style === '' || !name.startsWith(`${style}.`)) {
                                    name = (style !== '' ? style + '.' : '') + $util$i.capitalize(node.controlId);
                                    styles[name] = common;
                                    styleCache[name] = commonString;
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
                const data = styles[name];
                for (const attr in data) {
                    const match = $regex$6.XML.ATTRIBUTE.exec(data[attr]);
                    if (match) {
                        items.push({ key: match[1], value: match[2] });
                    }
                }
                STORED$4.styles.set(name, Object.assign({}, createStyleAttribute(), { name, items }));
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
        Object.assign(squared, { svg: { lib: {} } });
    }
    var $Svg = squared.svg.Svg;
    var $SvgAnimate = squared.svg.SvgAnimate;
    var $SvgAnimateTransform = squared.svg.SvgAnimateTransform;
    var $SvgBuild = squared.svg.SvgBuild;
    var $SvgG = squared.svg.SvgG;
    var $SvgPath = squared.svg.SvgPath;
    var $SvgShape = squared.svg.SvgShape;
    const { css: $css$e, math: $math$6, regex: $regex$7, util: $util$j, xml: $xml$4 } = squared.lib;
    const { constant: $constS, util: $utilS } = squared.svg.lib;
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
                return $util$j.convertCamelCase(attr);
            }
        }
        return '';
    }
    function createPathInterpolator(value) {
        if (INTERPOLATOR_ANDROID[value]) {
            return INTERPOLATOR_ANDROID[value];
        }
        else {
            const name = `path_interpolator_${$util$j.convertWord(value)}`;
            if (!STORED$5.animators.has(name)) {
                const xml = $util$j.formatString(INTERPOLATOR_XML, ...value.split(' '));
                STORED$5.animators.set(name, xml);
            }
            return `@anim/${name}`;
        }
    }
    function createTransformData(transform) {
        const result = {};
        for (const item of transform) {
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
            if (transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_ROTATE) && (rx !== ry || transforms.length > 1 && transforms.some(item => item.type === SVGTransform.SVG_TRANSFORM_SCALE && item.matrix.a !== item.matrix.d))) {
                return groupTransforms(element, transforms);
            }
        }
        return [[], transforms];
    }
    function groupTransforms(element, transforms, ignoreClient = false) {
        if (transforms.length) {
            const host = [];
            const client = [];
            const rotateOrigin = transforms[0].fromCSS ? [] : $utilS.TRANSFORM.rotateOrigin(element).reverse();
            const items = transforms.slice(0).reverse();
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
    function getColorValue$1(value, asArray = false) {
        const colorName = `@color/${Resource.addColor(value)}`;
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
        const result = {
            type: gradient.type,
            item: convertColorStops(gradient.colorStops, precision)
        };
        switch (gradient.type) {
            case 'radial': {
                const radial = gradient;
                let points = [];
                let cx;
                let cy;
                let cxDiameter;
                let cyDiameter;
                switch (path.element.tagName) {
                    case 'path':
                        for (const command of $SvgBuild.getPathCommands(path.value)) {
                            points = points.concat(command.value);
                        }
                    case 'polygon':
                        if ($utilS.SVG.polygon(path.element)) {
                            points = points.concat($SvgBuild.clonePoints(path.element.points));
                        }
                        if (!points.length) {
                            return undefined;
                        }
                        [cx, cy, cxDiameter, cyDiameter] = $SvgBuild.minMaxPoints(points);
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
                result.gradientRadius = (((cxDiameter + cyDiameter) / 2) * ($css$e.isPercent(radial.rAsString) ? (parseFloat(radial.rAsString) / 100) : 1)).toString();
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
    const isColorType = (attr) => attr === 'fill' || attr === 'stroke';
    const getVectorName = (target, section, index = -1) => `${target.name}_${section + (index !== -1 ? `_${index + 1}` : '')}`;
    const getRadiusPercent = (value) => $css$e.isPercent(value) ? parseFloat(value) / 100 : 0.5;
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
        createSvgElement(node, src) {
            let parentElement;
            let element;
            const match = $regex$7.CSS.URL.exec(src);
            if (match) {
                src = match[1];
            }
            if (src.toLowerCase().endsWith('.svg') || src.startsWith('data:image/svg+xml')) {
                const fileAsset = this.resource.getRawData(src);
                if (fileAsset) {
                    parentElement = (node.actualParent || node.documentParent).element;
                    parentElement.insertAdjacentHTML('beforeend', fileAsset.content);
                    if (parentElement.lastElementChild instanceof SVGSVGElement) {
                        element = parentElement.lastElementChild;
                        if (element.width.baseVal.value === 0) {
                            element.setAttribute('width', node.actualWidth.toString());
                        }
                        if (element.height.baseVal.value === 0) {
                            element.setAttribute('height', node.actualHeight.toString());
                        }
                    }
                }
            }
            return [parentElement, element];
        }
        createSvgDrawable(node, element) {
            const svg = new $Svg(element);
            const supportedKeyFrames = node.localSettings.targetAPI >= 23 /* MARSHMALLOW */;
            this.SVG_INSTANCE = svg;
            this.VECTOR_DATA.clear();
            this.ANIMATE_DATA.clear();
            this.ANIMATE_TARGET.clear();
            this.IMAGE_DATA.length = 0;
            this.NAMESPACE_AAPT = false;
            this.SYNCHRONIZE_MODE = 2 /* FROMTO_ANIMATE */ | (supportedKeyFrames ? 32 /* KEYTIME_TRANSFORM */ : 64 /* IGNORE_TRANSFORM */);
            const templateName = `${node.tagName}_${$util$j.convertWord(node.controlId, true)}_viewbox`.toLowerCase();
            const getFilename = (prefix, suffix) => templateName + (prefix ? `_${prefix}` : '') + (this.IMAGE_DATA.length ? '_vector' : '') + (suffix ? `_${suffix.toLowerCase()}` : '');
            svg.build({
                exclude: this.options.transformExclude,
                residual: partitionTransforms,
                precision: this.options.floatPrecisionValue
            });
            svg.synchronize({
                keyTimeMode: this.SYNCHRONIZE_MODE,
                framesPerSecond: this.controller.userSettings.framesPerSecond,
                precision: this.options.floatPrecisionValue
            });
            this.queueAnimations(svg, svg.name, item => item.attributeName === 'opacity');
            const include = this.parseVectorData(svg);
            let vectorName = Resource.insertStoredAsset('drawables', getFilename(), $xml$4.applyTemplate('vector', VECTOR_TMPL, [{
                    'xmlns:android': XMLNS_ANDROID.android,
                    'xmlns:aapt': this.NAMESPACE_AAPT ? XMLNS_ANDROID.aapt : '',
                    'android:name': svg.name,
                    'android:width': $css$e.formatPX(svg.width),
                    'android:height': $css$e.formatPX(svg.height),
                    'android:viewportWidth': (svg.viewBox.width || svg.width).toString(),
                    'android:viewportHeight': (svg.viewBox.height || svg.height).toString(),
                    'android:alpha': parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : '',
                    include
                }]));
            let drawable = '';
            if (this.ANIMATE_DATA.size) {
                const data = [{
                        'xmlns:android': XMLNS_ANDROID.android,
                        'android:drawable': getDrawableSrc(vectorName),
                        target: []
                    }];
                function insertTargetAnimation(name, targetSetTemplate) {
                    if (targetSetTemplate.set.length) {
                        let modified = false;
                        if (targetSetTemplate.set.length > 1 && targetSetTemplate.set.every(item => item.ordering === '')) {
                            const setData = {
                                set: [],
                                objectAnimator: []
                            };
                            for (const item of targetSetTemplate.set) {
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
                            animation: Resource.insertStoredAsset('animators', getFilename('anim', name), $xml$4.applyTemplate('set', SET_TMPL, [targetSetTemplate]))
                        };
                        if (targetData.animation !== '') {
                            targetData.animation = `@anim/${targetData.animation}`;
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
                    const [companions, animations] = $util$j.partitionArray(group.animate, child => child.companion !== undefined);
                    const targetSetTemplate = {
                        set: [],
                        objectAnimator: []
                    };
                    const lengthA = animations.length;
                    for (let i = 0; i < lengthA; i++) {
                        const item = animations[i];
                        if (item.setterType) {
                            if (ATTRIBUTE_ANDROID[item.attributeName] && $util$j.isString(item.to)) {
                                if (item.duration > 0 && item.fillReplace) {
                                    isolatedData.push(item);
                                }
                                else {
                                    togetherData.push(item);
                                }
                            }
                        }
                        else if ($SvgBuild.isAnimate(item)) {
                            const children = $util$j.filterArray(companions, child => child.companion.value === item);
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
                                sequentialMap.set(`sequentially_companion_${i}`, sequentially.concat(after));
                            }
                            else {
                                const synchronized = item.synchronized;
                                if (synchronized) {
                                    if ($SvgBuild.isAnimateTransform(item)) {
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
                            togetherTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.key >= b.synchronized.key ? 1 : -1));
                        }
                    }
                    for (const item of transformMap.values()) {
                        transformTargets.push(item.sort((a, b) => a.synchronized && b.synchronized && a.synchronized.key >= b.synchronized.key ? 1 : -1));
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
                            let together = [];
                            (synchronized ? $util$j.partitionArray(items, (animate) => animate.iterationCount !== -1) : [items]).forEach((partition, section) => {
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
                                        if ($util$j.isString(value) && fillBefore.objectAnimator.findIndex(before => before.propertyName === propertyName) === -1) {
                                            fillBefore.objectAnimator.push(this.createPropertyValue(propertyName, value, '0', valueType));
                                        }
                                    };
                                    const insertFillAfter = (propertyName, propertyValues, startOffset) => {
                                        if (!synchronized && item.fillReplace && valueType !== undefined) {
                                            let valueTo = item.replaceValue;
                                            if (!valueTo) {
                                                if (transforming) {
                                                    valueTo = getTransformInitialValue(propertyName);
                                                }
                                                else if (item.parent && $SvgBuild.isShape(item.parent) && item.parent.path) {
                                                    valueTo = propertyName === 'pathData' ? item.parent.path.value : item.parent.path[getPaintAttribute(propertyName)];
                                                }
                                                if (!valueTo) {
                                                    valueTo = item.baseValue;
                                                }
                                            }
                                            let previousValue;
                                            if (propertyValues && propertyValues.length) {
                                                const lastValue = propertyValues[propertyValues.length - 1];
                                                if ($util$j.isArray(lastValue.propertyValuesHolder)) {
                                                    const propertyValue = lastValue.propertyValuesHolder[lastValue.propertyValuesHolder.length - 1];
                                                    previousValue = propertyValue.keyframe[propertyValue.keyframe.length - 1].value;
                                                }
                                                else {
                                                    previousValue = lastValue.valueTo;
                                                }
                                            }
                                            if ($util$j.isString(valueTo) && valueTo !== previousValue) {
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
                                                    else if (requireBefore && item.baseValue) {
                                                        valueFrom = convertValueType(item, item.baseValue.trim().split(' ')[i]);
                                                    }
                                                    const propertyValue = this.createPropertyValue(propertyNames[i], values[i], '1', valueType, valueFrom, item.delay > 0 ? item.delay.toString() : '');
                                                    if (index > 1) {
                                                        fillCustom.objectAnimator.push(propertyValue);
                                                        insertFillAfter(propertyNames[i], undefined, index > 1 ? item.duration : 0);
                                                    }
                                                    else {
                                                        if (item.companion && item.companion.key <= 0) {
                                                            if (companionBefore === undefined) {
                                                                companionBefore = [];
                                                            }
                                                            companionBefore.push(propertyValue);
                                                        }
                                                        else if (item.companion && item.companion.key > 0) {
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
                                                    fillBefore.objectAnimator = fillBefore.objectAnimator.concat(companionBefore);
                                                }
                                                if (companionAfter) {
                                                    fillAfter.objectAnimator = fillAfter.objectAnimator.concat(companionAfter);
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
                                                let transforms;
                                                let companion;
                                                if (item.parent && $SvgBuild.isShape(item.parent)) {
                                                    companion = item.parent;
                                                    if (item.parent.path) {
                                                        transforms = item.parent.path.transformed;
                                                    }
                                                }
                                                propertyNames = ['pathData'];
                                                values = $SvgPath.extrapolate(item.attributeName, group.pathData, item.values, transforms, companion, this.options.floatPrecisionValue);
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
                                                    beforeValues = $util$j.objectMap(propertyNames, value => getTransformInitialValue(value) || '0');
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
                                                if (rotateValues && rotateValues.length === length) {
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
                                                    values = $util$j.objectMap(item.values, value => $util$j.convertInt(value).toString());
                                                    if (requireBefore && item.baseValue) {
                                                        beforeValues = $util$j.replaceMap($SvgBuild.parseCoordinates(item.baseValue), value => Math.trunc(value).toString());
                                                    }
                                                    break;
                                                case 'floatType':
                                                    if (item.attributeName === 'stroke-dasharray') {
                                                        values = $util$j.objectMap(item.values, value => $util$j.replaceMap(value.split(' '), fraction => parseFloat(fraction)));
                                                    }
                                                    else {
                                                        values = item.values;
                                                    }
                                                    if (requireBefore && item.baseValue) {
                                                        beforeValues = $util$j.replaceMap($SvgBuild.parseCoordinates(item.baseValue), value => value.toString());
                                                    }
                                                    break;
                                                default:
                                                    values = item.values.slice(0);
                                                    if (isColorType(item.attributeName)) {
                                                        if (requireBefore && item.baseValue) {
                                                            beforeValues = getColorValue$1(item.baseValue, true);
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
                                            const lengthB = propertyNames.length;
                                            const keyName = item.synchronized ? item.synchronized.key + item.synchronized.value :
                                                index !== 0 || lengthB > 1 ? JSON.stringify(options) : '';
                                            const keyTimes = item.keyTimes;
                                            for (let i = 0; i < lengthB; i++) {
                                                const propertyName = propertyNames[i];
                                                if (resetBefore && beforeValues) {
                                                    resetBeforeValue(propertyName, beforeValues[i]);
                                                }
                                                const lengthC = keyTimes.length;
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
                                                                value = $math$6.truncate(value, this.options.floatPrecisionValue);
                                                            }
                                                            keyframe.push({
                                                                interpolator: j > 0 && value !== '' && propertyName !== 'pivotX' && propertyName !== 'pivotY' ? getPathInterpolator(item.keySplines, j - 1) : '',
                                                                fraction: keyTimes[j] === 0 && value === '' ? '' : $math$6.truncate(keyTimes[j], this.options.floatPrecisionKeyTime),
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
                                                        const objectAnimator = repeating.objectAnimator;
                                                        for (let j = 0; j < lengthC; j++) {
                                                            const propertyOptions = Object.assign({}, options, { propertyName, startOffset: j === 0 ? (item.delay + (keyTimes[j] > 0 ? Math.floor(keyTimes[j] * item.duration) : 0)).toString() : '', propertyValuesHolder: false });
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
                                                                    duration = Math.floor((keyTimes[j] - keyTimes[j - 1]) * item.duration);
                                                                }
                                                                if (options.valueType === 'floatType') {
                                                                    valueTo = $math$6.truncate(valueTo, this.options.floatPrecisionValue);
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
                                                                        const valueData = this.createPropertyValue(direction, $math$6.truncate(translateTo, this.options.floatPrecisionValue), duration.toString(), 'floatType');
                                                                        valueData.interpolator = createPathInterpolator($constS.KEYSPLINE_NAME['step-start']);
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
                                                            valueFrom = item.from || (!checkBefore && requireBefore && beforeValues ? beforeValues[i] : '');
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
                                                        if (options.valueType === 'floatType') {
                                                            propertyOptions.valueTo = $math$6.truncate(propertyOptions.valueTo, this.options.floatPrecisionValue);
                                                        }
                                                        (section === 0 ? repeating : fillCustom).objectAnimator.push(propertyOptions);
                                                    }
                                                }
                                                if (section === 0 && !synchronized && item.iterationCount !== -1) {
                                                    insertFillAfter(propertyName, repeating.objectAnimator);
                                                }
                                            }
                                            if (requireBefore && transformOrigin && transformOrigin.length) {
                                                resetBeforeValue('translateX', '0');
                                                resetBeforeValue('translateY', '0');
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
                                    together = together.concat(repeating.objectAnimator);
                                    repeating.objectAnimator.length = 0;
                                }
                            }
                            if (repeating.objectAnimator.length || fillCustom.objectAnimator.length) {
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
                            if (item.parent && $SvgBuild.isShape(item.parent)) {
                                const path = item.parent.path;
                                if (path && path.value !== path.baseValue) {
                                    insertResetValue('pathData', path.baseValue, 'pathType', path.value);
                                    if (item.iterationCount !== -1 && !item.setterType) {
                                        insertResetValue('pathData', path.value, 'pathType', path.baseValue, item.getTotalDuration().toString());
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
                    vectorName = Resource.insertStoredAsset('drawables', getFilename('anim'), $xml$4.applyTemplate('animated-vector', ANIMATEDVECTOR_TMPL, data));
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
                        width: $css$e.formatPX(width),
                        height: $css$e.formatPX(height),
                        left: x !== 0 ? $css$e.formatPX(x) : '',
                        top: y !== 0 ? $css$e.formatPX(y) : ''
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
                drawable = Resource.insertStoredAsset('drawables', templateName, $xml$4.applyTemplate('layer-list', LAYERLIST_TMPL, data));
            }
            else {
                drawable = vectorName;
            }
            return drawable;
        }
        afterParseDocument() {
            this.controller.localSettings.svg.enabled = false;
        }
        parseVectorData(group, depth = 0) {
            const result = this.createGroup(group);
            const renderDepth = depth + result.length;
            let output = '';
            for (const item of group) {
                if (item.visible) {
                    if ($SvgBuild.isShape(item)) {
                        if (item.path && item.path.value) {
                            const [path, groupArray] = this.createPath(item, item.path);
                            const pathArray = [];
                            if (item.path.strokeWidth && (item.path.strokeDasharray || item.path.strokeDashoffset)) {
                                const animateData = this.ANIMATE_DATA.get(item.name);
                                if (animateData === undefined || animateData.animate.every(animate => animate.attributeName.startsWith('stroke-dash'))) {
                                    const [animations, strokeDash, pathData, clipPathData] = item.path.extractStrokeDash(animateData && animateData.animate, this.options.floatPrecisionValue);
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
                                        const length = strokeDash.length;
                                        for (let i = 0; i < length; i++) {
                                            const strokePath = i === 0 ? path : Object.assign({}, path);
                                            strokePath.name = `${name}_${i}`;
                                            if (animateData) {
                                                this.ANIMATE_DATA.set(strokePath.name, {
                                                    element: animateData.element,
                                                    animate: $util$j.filterArray(animateData.animate, animate => animate.id === undefined || animate.id === i)
                                                });
                                            }
                                            strokePath.trimPathStart = $math$6.truncate(strokeDash[i].start, this.options.floatPrecisionValue);
                                            strokePath.trimPathEnd = $math$6.truncate(strokeDash[i].end, this.options.floatPrecisionValue);
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
                                output += $xml$4.applyTemplate('group', VECTOR_GROUP, groupArray, renderDepth + 1);
                            }
                            else {
                                output += $xml$4.applyTemplate('path', VECTOR_PATH, pathArray, renderDepth + 1);
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
                            if (item.width === 0 || item.height === 0) {
                                const image = this.resource.getImage(item.href);
                                if (image && image.width > 0 && image.height > 0) {
                                    item.width = image.width;
                                    item.height = image.height;
                                    item.setRect();
                                }
                            }
                            item.extract(this.options.transformExclude.image);
                            this.IMAGE_DATA.push(item);
                        }
                    }
                }
            }
            if (result.length) {
                result[result.length - 1].include = output;
                return $xml$4.applyTemplate('group', VECTOR_GROUP, result, depth + 1);
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
                if (($SvgBuild.asG(target) || $SvgBuild.asUseSymbol(target)) && $util$j.isString(target.clipPath) && this.createClipPath(target, clipBox, target.clipPath)) {
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
            const result = { name: target.name };
            const renderData = [];
            const clipElement = [];
            if ($SvgBuild.asUse(target) && $util$j.isString(target.clipPath)) {
                this.createClipPath(target, clipElement, target.clipPath);
            }
            if ($util$j.isString(path.clipPath)) {
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
                                    value = `@color/${colorName}`;
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
                                    value = `@color/${colorName}`;
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
                                        const gradient = createFillGradient(definition, path, this.options.floatPrecisionValue);
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
                            value = (($util$j.isNumber(value) ? parseFloat(value) : 1) * opacity).toString();
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
            const replaceMap = new Map();
            const transformResult = [];
            const replaceResult = [];
            const pathData = path.value;
            let previousPathData = pathData;
            let index = 0;
            for (const item of target.animations) {
                if ($SvgBuild.asAnimateTransform(item) && !item.additiveSum && item.transformFrom) {
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
                                if (transform && transform.animate) {
                                    previousType.add(transform.animate.type);
                                }
                            }
                        }
                        for (const type of previousType) {
                            const propertyName = getTransformPropertyName(type);
                            if (propertyName) {
                                const initialValue = $utilS.TRANSFORM.typeAsValue(type).split(' ');
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
            if (transformResult.length) {
                const data = this.ANIMATE_DATA.get(groupName);
                if (data) {
                    data.animate = data.animate.concat(transformResult);
                }
            }
            if (replaceResult.length) {
                const data = this.ANIMATE_DATA.get(result.name);
                if (data) {
                    data.animate = data.animate.concat(replaceResult);
                }
                else {
                    this.ANIMATE_DATA.set(result.name, {
                        element: target.element,
                        animate: replaceResult,
                        pathData
                    });
                }
            }
            return [result, renderData];
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
                                if (!this.queueAnimations(child, name, item => $SvgBuild.asAnimate(item) || $SvgBuild.asSet(item), child.path.value)) {
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
                const animate = $util$j.filterArray(svg.animations, (item, index, array) => !item.paused && (item.duration >= 0 || item.setterType) && predicate(item, index, array));
                if (animate.length) {
                    this.ANIMATE_DATA.set(name, {
                        element: svg.element,
                        animate,
                        pathData
                    });
                    if (targetName) {
                        this.ANIMATE_TARGET.set(targetName, {
                            element: svg.element,
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
            return {
                propertyName,
                startOffset,
                duration,
                repeatCount,
                valueType,
                valueFrom: $util$j.isNumber(valueFrom) ? $math$6.truncate(valueFrom, this.options.floatPrecisionValue) : valueFrom,
                valueTo: $util$j.isNumber(valueTo) ? $math$6.truncate(valueTo, this.options.floatPrecisionValue) : valueTo,
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
            'android.resource.svg',
            'android.resource.background',
            'android.resource.strings',
            'android.resource.fonts',
            'android.resource.dimens',
            'android.resource.styles',
            'android.resource.includes'
        ],
        targetAPI: 28,
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

    const framework = 2 /* ANDROID */;
    let initialized = false;
    let application;
    let file;
    let userSettings;
    function autoClose() {
        if (application && application.userSettings.autoCloseOnWrite && !application.initializing && !application.closed) {
            application.finalize();
            return true;
        }
        return false;
    }
    const checkApplication = (main) => initialized && !!main && (main.closed || autoClose());
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
                    file.layoutAllToXml({ assets: application.layouts, archiveTo: filename || `${userSettings.outputArchiveName}-layouts` });
                }
            },
            saveResourceAllXml(filename) {
                if (checkApplication(application)) {
                    file.resourceAllToXml({ archiveTo: filename || `${userSettings.outputArchiveName}-resources` });
                }
            },
            saveResourceStringXml(filename) {
                if (checkApplication(application)) {
                    file.resourceStringToXml({ archiveTo: filename || `${userSettings.outputArchiveName}-string` });
                }
            },
            saveResourceArrayXml(filename) {
                if (checkApplication(application)) {
                    file.resourceStringArrayToXml({ archiveTo: filename || `${userSettings.outputArchiveName}-array` });
                }
            },
            saveResourceFontXml(filename) {
                if (checkApplication(application)) {
                    file.resourceFontToXml({ archiveTo: filename || `${userSettings.outputArchiveName}-font` });
                }
            },
            saveResourceColorXml(filename) {
                if (checkApplication(application)) {
                    file.resourceColorToXml({ archiveTo: filename || `${userSettings.outputArchiveName}-color` });
                }
            },
            saveResourceStyleXml(filename) {
                if (checkApplication(application)) {
                    file.resourceStyleToXml({ archiveTo: filename || `${userSettings.outputArchiveName}-style` });
                }
            },
            saveResourceDimenXml(filename) {
                if (checkApplication(application)) {
                    file.resourceDimenToXml({ archiveTo: filename || `${userSettings.outputArchiveName}-dimen` });
                }
            },
            saveResourceDrawableXml(filename) {
                if (checkApplication(application)) {
                    file.resourceDrawableToXml({ archiveTo: filename || `${userSettings.outputArchiveName}-drawable` });
                }
            },
            saveResourceDrawableImageXml(filename) {
                if (checkApplication(application)) {
                    file.resourceDrawableImageToXml({ archiveTo: filename || `${userSettings.outputArchiveName}-drawable-image` });
                }
            },
            saveResourceAnimXml(filename) {
                if (checkApplication(application)) {
                    file.resourceAnimToXml({ archiveTo: filename || `${userSettings.outputArchiveName}-anim` });
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
            const EN = squared.base.lib.constant.EXT_NAME;
            const EA = EXT_ANDROID;
            application = new Application(framework, View, Controller, Resource, ExtensionManager);
            file = new File();
            application.resourceHandler.setFileHandler(file);
            userSettings = Object.assign({}, settings);
            Object.assign(application.builtInExtensions, {
                [EN.EXTERNAL]: new External(EN.EXTERNAL, framework),
                [EN.SUBSTITUTE]: new Substitute(EN.SUBSTITUTE, framework),
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
