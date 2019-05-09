/* android-framework 0.9.7
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
        GUIDELINE: 'android.support.constraint.Guideline',
        BARRIER: 'android.support.constraint.Barrier'
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

    const $Resource = squared.base.Resource;
    const $color = squared.lib.color;
    const $css = squared.lib.css;
    const $regex = squared.lib.regex;
    const $util = squared.lib.util;
    const REGEXP_NONWORD = /[^\w+]/g;
    const DIRECTORY_THEME = 'res/values';
    const FILENAME_THEME = 'themes.xml';
    const STORED = $Resource.STORED;
    let IMAGE_FORMAT;
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
                            if ($regex.PREFIX.PROTOCOL.test(value)) {
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
            IMAGE_FORMAT = application.controllerHandler.localSettings.supported.imageFormat;
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
        static formatName(value) {
            if ($regex.CHAR.LEADINGNUMBER.test(value)) {
                value = '__' + value;
            }
            return value.replace(REGEXP_NONWORD, '_');
        }
        static addTheme(...values) {
            for (const theme of values) {
                const path = theme.output && $util.isString(theme.output.path) ? theme.output.path.trim() : DIRECTORY_THEME;
                const file = theme.output && $util.isString(theme.output.file) ? theme.output.file.trim() : FILENAME_THEME;
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
        static addImageSrc(element, prefix = '', imageSet) {
            const result = {};
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
            return this.addImage(result, prefix);
        }
        static addImage(images, prefix = '') {
            if (images.mdpi) {
                const src = $util.fromLastIndexOf(images.mdpi, '/');
                const format = $util.fromLastIndexOf(src, '.').toLowerCase();
                if (IMAGE_FORMAT.includes(format)) {
                    return Resource.insertStoredAsset('images', Resource.formatName(prefix + src.substring(0, src.length - format.length - 1)), images);
                }
            }
            return '';
        }
        static addImageURL(value, prefix = '') {
            value = $css.resolveURL(value) || $util.resolvePath(value);
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
                    colorName = keyName === shade.value ? shade.key : Resource.generateId('color', shade.key);
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
                        'elevation': '6px',
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
    function stripId(value) {
        return value ? value.replace(REGEXP_ID, '') : '';
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
        return Object.assign({ android, app }, options);
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
    function localizeString(value, rtl, api) {
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
        stripId: stripId,
        getHorizontalBias: getHorizontalBias,
        getVerticalBias: getVerticalBias,
        createViewAttribute: createViewAttribute,
        createStyleAttribute: createStyleAttribute,
        localizeString: localizeString,
        getXmlNs: getXmlNs,
        getRootNs: getRootNs
    });

    var $NodeList = squared.base.NodeList;
    var $Resource$1 = squared.base.Resource;
    const $enum = squared.base.lib.enumeration;
    const $client = squared.lib.client;
    const $css$1 = squared.lib.css;
    const $dom = squared.lib.dom;
    const $math = squared.lib.math;
    const $util$2 = squared.lib.util;
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
                return 'center_horizontal';
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
            case 'center_horizontal':
                return true;
        }
        return false;
    }
    function setAutoMargin(node) {
        if (!node.blockWidth || node.hasWidth || node.has('maxWidth') || (node.innerWrapped || node).has('width', 32 /* PERCENT */, { not: '100%' })) {
            const alignment = [];
            if (node.autoMargin.leftRight) {
                alignment.push('center_horizontal');
            }
            else if (node.autoMargin.left) {
                alignment.push('right');
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
        if (node.styleElement && !node.has('height') && node.cssTry('lineHeight', 'normal')) {
            if (node.cssTry('whiteSpace', 'nowrap')) {
                const offset = (lineHeight - node.element.getBoundingClientRect().height) / 2;
                if (Math.floor(offset) > 0) {
                    node.modifyBox(32 /* PADDING_TOP */, Math.round(offset));
                    if (!node.blockStatic) {
                        node.modifyBox(128 /* PADDING_BOTTOM */, Math.floor(offset));
                    }
                }
                node.cssFinally('whiteSpace');
            }
            node.cssFinally('lineHeight');
        }
    }
    function setMarginOffset(node, lineHeight, inlineStyle, top = true, bottom = true) {
        if (node.imageElement || node.svgElement || node.actualHeight === 0) {
            return;
        }
        if (node.multiline) {
            setMultiline(node, lineHeight, false);
        }
        else if (node.length === 0 && (node.pageFlow || node.textContent.length)) {
            let offset = 0;
            let usePadding = true;
            if (node.styleElement && !inlineStyle && !node.has('height') && node.cssTry('lineHeight', 'normal')) {
                if (node.cssTry('whiteSpace', 'nowrap')) {
                    offset = (lineHeight - (node.element.getBoundingClientRect().height || node.actualHeight)) / 2;
                    node.cssFinally('whiteSpace');
                    usePadding = false;
                }
                node.cssFinally('lineHeight');
            }
            else if (inlineStyle && node.inlineText && !node.inline) {
                adjustMinHeight(node, lineHeight);
                return;
            }
            else {
                offset = (lineHeight - node.actualHeight) / 2;
            }
            if (Math.floor(offset) > 0) {
                if (top) {
                    node.modifyBox(usePadding && node.textElement && !node.plainText && !inlineStyle ? 32 /* PADDING_TOP */ : 2 /* MARGIN_TOP */, Math.round(offset));
                }
                if (bottom) {
                    node.modifyBox(usePadding && node.textElement && !node.plainText && !inlineStyle ? 128 /* PADDING_BOTTOM */ : 8 /* MARGIN_BOTTOM */, Math.floor(offset));
                }
            }
        }
        else if (inlineStyle && (!node.hasHeight || lineHeight > node.height) && (node.layoutHorizontal && node.horizontalRows === undefined || node.hasAlign(2048 /* SINGLE */))) {
            adjustMinHeight(node, lineHeight);
        }
    }
    function adjustMinHeight(node, value) {
        const minHeight = node.parseUnit(node.css('minHeight'), true);
        if (node.inlineText) {
            value += node.contentBoxHeight;
            node.mergeGravity('gravity', 'center_vertical', false);
        }
        if (value > minHeight) {
            node.android('minHeight', $css$1.formatPX(value));
        }
    }
    const validateString = (value) => value ? value.trim().replace(REGEXP_VALIDSTRING, '_') : '';
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
                    const body = new View(0, '0', document.body);
                    body.hide();
                    body.setBounds();
                    View._documentBody = body;
                }
                return View._documentBody;
            }
            static getControlName(containerType) {
                return CONTAINER_ANDROID[CONTAINER_NODE[containerType]];
            }
            attr(obj, attr, value, overwrite = true) {
                const result = {};
                if (!this.supported(obj, attr, result)) {
                    return '';
                }
                if (Object.keys(result).length) {
                    if ($util$2.isString(result.obj)) {
                        obj = result.obj;
                    }
                    if ($util$2.isString(result.attr)) {
                        attr = result.attr;
                    }
                    if ($util$2.isString(result.value)) {
                        value = result.value;
                    }
                    if (typeof result.overwrite === 'boolean') {
                        overwrite = result.overwrite;
                    }
                }
                return super.attr(obj, attr, value, overwrite);
            }
            android(attr, value, overwrite = true) {
                if (value) {
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
                const node = this.actualAnchor;
                const renderParent = node.renderParent;
                if (renderParent && node.documentId !== documentId) {
                    if (renderParent.layoutConstraint) {
                        if (documentId === '' || this.constraint.current[position] === undefined || overwrite) {
                            if (documentId && overwrite === undefined) {
                                overwrite = documentId === 'parent';
                            }
                            const attr = LAYOUT_ANDROID.constraint[position];
                            if (attr) {
                                node.app(this.localizeString(attr), documentId, overwrite);
                                if (documentId === 'parent') {
                                    switch (position) {
                                        case 'left':
                                        case 'right':
                                            node.constraint.horizontal = true;
                                            break;
                                        case 'top':
                                        case 'bottom':
                                        case 'baseline':
                                            node.constraint.vertical = true;
                                            break;
                                    }
                                }
                                node.constraint.current[position] = {
                                    documentId,
                                    horizontal: $util$2.firstIndexOf(position.toLowerCase(), 'left', 'right') !== -1
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
                        node.android(this.localizeString(attr), documentId, overwrite);
                        return true;
                    }
                }
                return false;
            }
            anchorParent(orientation, overwrite, bias) {
                const node = this.actualAnchor;
                const renderParent = node.renderParent;
                if (renderParent) {
                    const horizontal = orientation === AXIS_ANDROID.HORIZONTAL;
                    if (renderParent.layoutConstraint) {
                        if (overwrite || !this.constraint[orientation]) {
                            node.anchor(horizontal ? 'left' : 'top', 'parent');
                            node.anchor(horizontal ? 'right' : 'bottom', 'parent');
                            node.constraint[orientation] = true;
                            if (bias !== undefined) {
                                node.anchorStyle(orientation, 'packed', bias, overwrite);
                            }
                            return true;
                        }
                    }
                    else if (renderParent.layoutRelative) {
                        node.anchor(horizontal ? 'left' : 'top', 'true', overwrite);
                        node.anchor(horizontal ? 'right' : 'bottom', 'true', overwrite);
                        return true;
                    }
                }
                return false;
            }
            anchorStyle(orientation, value = 'packed', bias = 0, overwrite = true) {
                const node = this.actualAnchor;
                orientation = $util$2.capitalize(orientation);
                node.app(`layout_constraint${orientation}_chainStyle`, value, overwrite);
                node.app(`layout_constraint${orientation}_bias`, bias.toString(), overwrite);
            }
            anchorDelete(...position) {
                const node = this.actualAnchor;
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.layoutConstraint) {
                        node.delete('app', ...$util$2.replaceMap(position, value => this.localizeString(LAYOUT_ANDROID.constraint[value])));
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
                const node = this.actualAnchor;
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
                const node = this.actualAnchor;
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
                const node = this.actualAnchor;
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
                if (this.hasProcedure($enum.NODE_PROCEDURE.LOCALIZATION)) {
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
                        const obj = this[`__${name}`];
                        for (const attr in obj) {
                            node.attr(name, attr, name === 'android' && attr === 'id' ? node.documentId : obj[attr]);
                        }
                    }
                }
                if (position) {
                    node.anchorClear();
                    if (node.anchor('left', this.documentId)) {
                        node.modifyBox(16 /* MARGIN_LEFT */, null);
                        Object.assign(node.unsafe('boxAdjustment'), { marginLeft: 0 });
                    }
                    if (node.anchor('top', this.documentId)) {
                        node.modifyBox(2 /* MARGIN_TOP */, null);
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
                this.controlId = stripId(this.android('id'));
                if (this.controlId === '') {
                    let name;
                    if (this.styleElement && this.naturalElement) {
                        name = validateString(this.elementId || $dom.getNamedItem(this.element, 'name'));
                        if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                            name = `_${name}`;
                        }
                    }
                    this.controlId = $util$2.convertWord($Resource$1.generateId('android', name || $util$2.fromLastIndexOf(this.controlName, '.').toLowerCase(), name ? 0 : 1));
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
                        this.android('layout_width', 'wrap_content', false);
                        this.android('layout_height', 'wrap_content', false);
                        return;
                    }
                    const documentParent = this.documentParent;
                    if (this.documentBody) {
                        if (!this.hasWidth && this.renderChildren.some(node => node.alignParent('right'))) {
                            this.android('layout_width', 'match_parent', false);
                        }
                        if (!this.hasHeight && this.renderChildren.some(node => node.alignParent('bottom'))) {
                            this.android('layout_height', 'match_parent', false);
                        }
                    }
                    if (this.android('layout_width') === '') {
                        let layoutWidth = '';
                        if (!this.inlineStatic && this.has('width') || this.toInt('width') > 0 && this.cssInitial('width') === '') {
                            const width = this.css('width');
                            let value = -1;
                            if ($css$1.isLength(width)) {
                                value = this.actualWidth;
                            }
                            else if ($css$1.isPercent(width)) {
                                if (renderParent.is(CONTAINER_NODE.GRID)) {
                                    layoutWidth = '0px';
                                    this.android('layout_columnWeight', $math.truncate(parseFloat(width) / 100, this.localSettings.floatPrecision));
                                }
                                else if (this.imageElement) {
                                    if (width === '100%') {
                                        layoutWidth = 'match_parent';
                                        this.android('adjustViewBounds', 'true');
                                    }
                                    else if (this.android('adjustViewBounds') === 'true') {
                                        layoutWidth = 'wrap_content';
                                    }
                                    else {
                                        value = this.bounds.width;
                                        this.android('adjustViewBounds', 'true');
                                    }
                                }
                                else if (width === '100%') {
                                    if (!this.support.maxWidth) {
                                        const maxWidth = this.css('maxWidth');
                                        const maxValue = this.parseUnit(maxWidth);
                                        if (maxWidth === '100%') {
                                            if (!documentParent.inlineWidth && $util$2.aboveRange(maxValue, documentParent.box.width)) {
                                                layoutWidth = 'match_parent';
                                            }
                                            else {
                                                value = Math.min(this.actualWidth, maxValue);
                                            }
                                        }
                                        else if (maxValue > 0) {
                                            if (this.inputElement || this.blockDimension) {
                                                value = Math.min(this.actualWidth, maxValue);
                                            }
                                            else {
                                                layoutWidth = Math.ceil(maxValue) < Math.floor(documentParent.box.width) ? 'wrap_content' : 'match_parent';
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
                        else if (this.imageElement && this.has('height', 32 /* PERCENT */)) {
                            layoutWidth = 'wrap_content';
                            this.android('adjustViewBounds', 'true');
                        }
                        if (layoutWidth === '') {
                            if (this.textElement && this.inlineText && this.textEmpty && !this.visibleStyle.backgroundImage) {
                                layoutWidth = $css$1.formatPX(this.actualWidth);
                            }
                            else {
                                if (this.blockStatic && !this.inputElement && !renderParent.is(CONTAINER_NODE.GRID)) {
                                    if (!documentParent.layoutElement || this.display === 'flex') {
                                        layoutWidth = 'match_parent';
                                    }
                                    else if (!documentParent.flexElement && renderParent.layoutConstraint && this.alignParent('left') && this.alignParent('right')) {
                                        layoutWidth = this.autoMargin.horizontal || this.ascend(false, item => item.has('width') || item.blockStatic).length ? '0px' : 'match_parent';
                                    }
                                }
                                if (layoutWidth === '' && (this.layoutVertical && this.layoutLinear && renderParent.blockWidth && this.actualChildren.some(item => item.lineBreak) ||
                                    !this.pageFlow && this.absoluteParent === documentParent && this.has('left') && this.has('right') ||
                                    documentParent.flexElement && this.flexbox.grow > 0 && renderParent.flexibleWidth && documentParent.css('flexDirection') !== 'column')) {
                                    layoutWidth = 'match_parent';
                                }
                            }
                        }
                        if (layoutWidth === '' && this.some((node) => node.layoutConstraint && node.some((child) => child.flexibleWidth))) {
                            layoutWidth = $css$1.formatPX(this.actualWidth);
                        }
                        this.android('layout_width', layoutWidth || 'wrap_content');
                    }
                    if (this.android('layout_height') === '') {
                        let layoutHeight = '';
                        if (!this.inlineStatic && this.has('height') || this.toInt('height') > 0 && this.cssInitial('height') === '') {
                            const height = this.css('height');
                            let value = -1;
                            if ($css$1.isLength(height)) {
                                value = this.actualHeight;
                            }
                            else if ($css$1.isPercent(height)) {
                                if (this.imageElement) {
                                    if (height === '100%') {
                                        layoutHeight = 'match_parent';
                                        this.android('adjustViewBounds', 'true');
                                    }
                                    else if (this.android('adjustViewBounds') === 'true') {
                                        layoutHeight = 'wrap_content';
                                    }
                                    else {
                                        value = this.bounds.height;
                                        this.android('adjustViewBounds', 'true');
                                    }
                                }
                                else if (height === '100%') {
                                    if (!this.support.maxHeight) {
                                        const maxHeight = this.css('maxHeight');
                                        const maxValue = this.parseUnit(maxHeight);
                                        if (maxHeight === '100%') {
                                            if (!documentParent.inlineHeight && $util$2.aboveRange(maxValue, documentParent.box.height)) {
                                                layoutHeight = 'match_parent';
                                            }
                                            else {
                                                value = Math.min(this.actualHeight, maxValue);
                                            }
                                        }
                                        else if (maxValue > 0) {
                                            if (this.inputElement || this.blockDimension) {
                                                value = Math.min(this.actualHeight, maxValue);
                                            }
                                            else {
                                                layoutHeight = Math.ceil(maxValue) < Math.floor(documentParent.box.height) ? 'wrap_content' : 'match_parent';
                                            }
                                        }
                                    }
                                    if (layoutHeight === '' && (this.documentRoot || !renderParent.inlineHeight)) {
                                        layoutHeight = 'match_parent';
                                    }
                                    if (this.imageElement) {
                                        this.android('adjustViewBounds', 'true');
                                    }
                                }
                                if (layoutHeight === '' && this.hasHeight) {
                                    value = this.actualHeight;
                                }
                            }
                            if (value > 0) {
                                if (this.is(CONTAINER_NODE.LINE) && this.tagName !== 'HR' && this.has('height', 0, { map: 'initial' })) {
                                    value += this.borderTopWidth + this.borderBottomWidth;
                                }
                                layoutHeight = $css$1.formatPX(value);
                            }
                        }
                        else if (this.imageElement && this.has('width', 32 /* PERCENT */)) {
                            layoutHeight = 'wrap_content';
                            this.android('adjustViewBounds', 'true');
                        }
                        if (layoutHeight === '') {
                            if (this.textElement && this.inlineText && this.textEmpty && !this.visibleStyle.backgroundImage) {
                                if (renderParent.layoutConstraint && this.actualHeight >= (this.absoluteParent || documentParent).box.height && this.alignParent('top')) {
                                    this.anchor('bottom', 'parent');
                                    layoutHeight = '0px';
                                }
                                else {
                                    layoutHeight = $css$1.formatPX(this.actualHeight);
                                }
                            }
                            else if (this.display === 'table-cell' || !this.pageFlow && this.leftTopAxis && this.has('top') && this.has('bottom') || this.singleChild && renderParent.flexElement && renderParent.css('flexDirection') === 'row') {
                                layoutHeight = 'match_parent';
                            }
                        }
                        this.android('layout_height', layoutHeight || 'wrap_content');
                    }
                    if (this.has('minWidth')) {
                        this.android('minWidth', this.convertPX(this.css('minWidth')), false);
                    }
                    if (this.has('minHeight')) {
                        this.android('minHeight', this.convertPX(this.css('minHeight'), false), false);
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
                        else if (!this.pageFlow && this.textElement && this.multiline && this.inlineWidth && !this.preserveWhiteSpace && !/\n/.test(this.textContent)) {
                            width = Math.ceil(this.bounds.width);
                        }
                        if (width !== -1) {
                            this.android('maxWidth', $css$1.formatPX(width), false);
                            if (this.imageElement) {
                                this.android('adjustViewBounds', 'true');
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
                                height = this.parseUnit(this.css('maxHeight'), false);
                            }
                            if (height >= 0) {
                                this.android('maxHeight', $css$1.formatPX(height));
                                if (this.imageElement) {
                                    this.android('adjustViewBounds', 'true');
                                }
                            }
                        }
                    }
                }
            }
            setAlignment() {
                const renderParent = this.renderParent;
                if (renderParent) {
                    const alignFloat = this.hasAlign(512 /* FLOAT */);
                    const node = this.outerWrapper || this;
                    const outerRenderParent = node.renderParent || renderParent;
                    let textAlign = checkTextAlign(this.cssInitial('textAlign', true));
                    let textAlignParent = checkTextAlign(this.cssAscend('textAlign'), true);
                    if (this.groupParent && !alignFloat && textAlign === '') {
                        const actualParent = $NodeList.actualParent(this.renderChildren);
                        if (actualParent) {
                            textAlign = checkTextAlign(actualParent.cssInitial('textAlign', true));
                        }
                    }
                    if (this.pageFlow) {
                        let floating = '';
                        if (this.inlineVertical && (outerRenderParent.layoutHorizontal && !outerRenderParent.support.container.positionRelative || outerRenderParent.is(CONTAINER_NODE.GRID))) {
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
                                else if (!setAutoMargin(node) && textAlign !== '' && this.hasWidth && !this.blockStatic && this.display !== 'table') {
                                    node.mergeGravity('layout_gravity', textAlign, false);
                                }
                            }
                            if (this.hasAlign(1024 /* RIGHT */) || this.renderChildren.length && this.renderChildren.every(item => item.rightAligned)) {
                                floating = 'right';
                            }
                            else if (alignFloat && this.groupParent && !this.renderChildren.some(item => item.rightAligned)) {
                                floating = 'left';
                            }
                        }
                        if (renderParent.layoutFrame && this.innerWrapped === undefined) {
                            if (!setAutoMargin(this)) {
                                if (this.floating) {
                                    floating = this.float;
                                }
                                if (floating !== '' && (renderParent.inlineWidth || !renderParent.documentRoot && this.singleChild)) {
                                    renderParent.mergeGravity('layout_gravity', floating);
                                }
                            }
                            if (this.singleChild && renderParent.display === 'table-cell') {
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
                                node.mergeGravity('layout_gravity', floating);
                            }
                        }
                        else if (setAutoMargin(node.inlineWidth ? node : this) && textAlign !== '') {
                            textAlignParent = '';
                        }
                    }
                    if (textAlignParent !== '') {
                        if (this.blockStatic) {
                            node.mergeGravity('layout_gravity', 'left', false);
                        }
                        else if (!this.blockWidth && this.naturalElement && (renderParent.layoutFrame || renderParent.layoutVertical && renderParent.layoutLinear)) {
                            const target = renderParent.inlineWidth ? renderParent : node;
                            if (!target.documentRoot) {
                                target.mergeGravity('layout_gravity', textAlignParent, false);
                            }
                        }
                    }
                    if (!this.layoutConstraint && !this.layoutFrame && !this.is(CONTAINER_NODE.GRID) && !this.layoutElement) {
                        let fromParent = false;
                        if (textAlign === '') {
                            textAlign = textAlignParent;
                            fromParent = true;
                        }
                        if (textAlign !== '') {
                            this.mergeGravity('gravity', textAlign, !fromParent);
                        }
                    }
                }
            }
            mergeGravity(attr, alignment, overwrite = true) {
                if (attr === 'layout_gravity') {
                    const renderParent = this.renderParent;
                    if (renderParent) {
                        if (isHorizontalAlign(alignment) && (renderParent.inlineWidth && this.singleChild || !overwrite && this.outerWrapper && this.has('maxWidth'))) {
                            return;
                        }
                        else if (renderParent.layoutConstraint) {
                            if (!renderParent.layoutHorizontal && !this.positioned) {
                                switch (alignment) {
                                    case 'top':
                                        this.anchor('top', 'parent', false);
                                        break;
                                    case 'right':
                                    case 'end':
                                        this.anchor('right', 'parent', false);
                                        break;
                                    case 'bottom':
                                        this.anchor('bottom', 'parent', false);
                                        break;
                                    case 'left':
                                    case 'start':
                                        this.anchor('left', 'parent', false);
                                        break;
                                    case 'center_horizontal':
                                        this.anchorParent(AXIS_ANDROID.HORIZONTAL, true);
                                        break;
                                }
                            }
                            return;
                        }
                    }
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
                    this.android(attr, result);
                }
            }
            applyOptimizations() {
                if (this.renderParent) {
                    this.autoSizeBoxModel();
                    this.alignLayout();
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
                const api = API_ANDROID[this.localSettings.targetAPI];
                if (api) {
                    setCustomization(api, this.tagName);
                    setCustomization(api, this.controlName);
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
                                if (attr === 'marginRight') {
                                    if (value < 0 && this.float === 'right') {
                                        value = 0;
                                    }
                                    else if (this.inline) {
                                        const boxRight = this.documentParent.box.right;
                                        if (Math.floor(this.bounds.right) > boxRight) {
                                            if (this.textElement && !this.multiline) {
                                                this.android('maxLines', '1');
                                                this.android('ellipsize', 'end');
                                            }
                                            continue;
                                        }
                                        else if (this.bounds.right + value > boxRight) {
                                            value = Math.max(0, boxRight - this.bounds.right);
                                        }
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
                        this.android(prefix, $css$1.formatPX(mergeAll));
                    }
                    else {
                        if (mergeHorizontal !== 0) {
                            this.android(`${prefix}Horizontal`, $css$1.formatPX(mergeHorizontal));
                        }
                        else {
                            if (boxModel[left] !== 0) {
                                this.android(this.localizeString(`${prefix}Left`), $css$1.formatPX(boxModel[left]));
                            }
                            if (boxModel[right] !== 0) {
                                this.android(this.localizeString(`${prefix}Right`), $css$1.formatPX(boxModel[right]));
                            }
                        }
                        if (mergeVertical !== 0) {
                            this.android(`${prefix}Vertical`, $css$1.formatPX(mergeVertical));
                        }
                        else {
                            if (boxModel[top] !== 0) {
                                this.android(`${prefix}Top`, $css$1.formatPX(boxModel[top]));
                            }
                            if (boxModel[bottom] !== 0) {
                                this.android(`${prefix}Bottom`, $css$1.formatPX(boxModel[bottom]));
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
                        const obj = name === 'attr' ? 'android' : (REGEXP_DATASETATTR.test(name) ? $util$2.capitalize(name.substring(4), false) : '');
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
                const indent = '\n' + '\t'.repeat(depth);
                let output = '';
                for (const value of this.combine()) {
                    output += indent + value;
                }
                return output;
            }
            autoSizeBoxModel() {
                const renderParent = this.renderParent;
                if (renderParent && this.hasProcedure($enum.NODE_PROCEDURE.AUTOFIT)) {
                    let borderWidth = false;
                    if (this.tableElement) {
                        borderWidth = this.css('boxSizing') === 'content-box' || $client.isUserAgent(8 /* FIREFOX */ | 16 /* EDGE */);
                    }
                    else if (this.styleElement) {
                        if (this.is(CONTAINER_NODE.BUTTON)) {
                            if (this.inlineHeight && !this.has('minHeight')) {
                                this.android('minHeight', $css$1.formatPX(Math.ceil(this.actualHeight)));
                            }
                        }
                        borderWidth = true;
                    }
                    if (borderWidth && this.visibleStyle.borderWidth && !this.is(CONTAINER_NODE.LINE)) {
                        this.modifyBox(256 /* PADDING_LEFT */, this.borderLeftWidth);
                        this.modifyBox(64 /* PADDING_RIGHT */, this.borderRightWidth);
                        this.modifyBox(32 /* PADDING_TOP */, this.borderTopWidth);
                        this.modifyBox(128 /* PADDING_BOTTOM */, this.borderBottomWidth);
                    }
                }
            }
            alignLayout() {
                const renderParent = this.renderParent;
                const renderChildren = this.renderChildren;
                if (this.layoutHorizontal) {
                    if (this.layoutLinear) {
                        if (renderChildren.some(node => node.floating) && !renderChildren.some(node => node.imageElement && node.baseline)) {
                            this.android('baselineAligned', 'false');
                        }
                        else {
                            const baseline = $NodeList.baseline($util$2.filterArray(renderChildren, node => node.baseline && !node.layoutRelative && !node.layoutConstraint))[0];
                            if (baseline) {
                                this.android('baselineAlignedChildIndex', renderChildren.indexOf(baseline).toString());
                            }
                        }
                    }
                    if (this.horizontalRows === undefined && !this.hasAlign(1024 /* RIGHT */) && !this.visibleStyle.background) {
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
                else if (this.layoutVertical) {
                    if (this.layoutLinear && !renderParent.is(CONTAINER_NODE.GRID) && renderChildren[0].textElement && renderChildren[0].baseline) {
                        this.android('baselineAlignedChildIndex', '0');
                    }
                }
                if (renderParent.layoutConstraint) {
                    if (this.pageFlow && !this.documentParent.documentBody && this.alignParent('top') && !this.alignParent('bottom') && !renderParent.blockHeight && (renderParent.horizontalRows === undefined || renderParent.horizontalRows.length && renderParent.horizontalRows[0].some(node => node === this)) && this.alignSibling('bottomTop') === '' && $util$2.withinRange(this.actualRect('bottom'), renderParent.box.bottom)) {
                        this.anchor('bottom', 'parent', false);
                        this.anchorStyle(AXIS_ANDROID.VERTICAL);
                    }
                }
            }
            setLineHeight() {
                const lineHeight = this.lineHeight;
                if (lineHeight > 0) {
                    const hasOwnStyle = this.has('lineHeight');
                    if (this.multiline) {
                        setMultiline(this, lineHeight, hasOwnStyle);
                    }
                    else if (hasOwnStyle || this.renderChildren.length || this.renderParent && this.renderParent.lineHeight === 0) {
                        if (this.length === 0) {
                            setMarginOffset(this, lineHeight, hasOwnStyle);
                        }
                        else if (this.renderChildren.length) {
                            const horizontalRows = this.horizontalRows || [this.renderChildren];
                            const length = horizontalRows.length;
                            let previousMultiline = false;
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
                                    for (let j = 0; j < row.length; j++) {
                                        const node = row[j];
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
            get actualAnchor() {
                const renderParent = this.renderParent;
                if (renderParent && (renderParent.layoutConstraint || renderParent.layoutRelative)) {
                    return this;
                }
                return this.outerWrapper && this.outerWrapper.visible ? this.outerWrapper : this;
            }
            get support() {
                if (this._cached.support === undefined) {
                    const maxWidth = this.textElement || this.imageElement || this.svgElement;
                    const support = {
                        container: {
                            positionRelative: this.layoutRelative || this.layoutConstraint
                        },
                        maxWidth,
                        maxHeight: maxWidth
                    };
                    if (this.containerType !== 0) {
                        this._cached.support = support;
                    }
                    return support;
                }
                return this._cached.support;
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
            get flexibleWidth() {
                return !!this.renderParent && this.renderParent.layoutConstraint && this.android('layout_width') === '0px';
            }
            get flexibleHeight() {
                return !!this.renderParent && this.renderParent.layoutConstraint && this.android('layout_height') === '0px';
            }
            get fontSize() {
                if (this._fontSize === 0) {
                    this._fontSize = $css$1.parseUnit(this.css('fontSize')) || 16;
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
            super(id, node.sessionId, undefined, afterInit);
            this.depth = node.depth;
            this.tagName = `${node.tagName}_GROUP`;
            this.documentParent = node.documentParent;
            this.retain(children);
        }
    }

    var $NodeList$1 = squared.base.NodeList;
    const $enum$1 = squared.base.lib.enumeration;
    const $color$1 = squared.lib.color;
    const $css$2 = squared.lib.css;
    const $dom$1 = squared.lib.dom;
    const $math$1 = squared.lib.math;
    const $regex$1 = squared.lib.regex;
    const $session = squared.lib.session;
    const $util$3 = squared.lib.util;
    const $xml = squared.lib.xml;
    const GUIDELINE_AXIS = [AXIS_ANDROID.HORIZONTAL, AXIS_ANDROID.VERTICAL];
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
                if (above.documentParent === below.documentParent) {
                    if (above.zIndex === below.zIndex) {
                        return above.siblingIndex < below.siblingIndex ? -1 : 1;
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
        for (const node of nodes) {
            if (node !== baseline && !node.baselineAltered && (node.bounds.height > 0 || node.textElement)) {
                if (!node.textElement && node.bounds.height > baseline.bounds.height) {
                    if ($util$3.withinRange(node.linear.top, node.documentParent.box.top)) {
                        node.anchor('top', 'true');
                    }
                    if (node.imageElement && (imageBaseline === undefined || node.bounds.height > imageBaseline.bounds.height)) {
                        imageBaseline = node;
                    }
                }
                else if (node.imageElement && baseline.imageElement) {
                    if (node.bounds.height < baseline.bounds.height && node.baseline) {
                        node.anchor('baseline', baseline.documentId);
                    }
                }
                else if (node.inputElement) {
                    if (node.baseline && baseline.textElement) {
                        node.anchor('bottom', baseline.documentId);
                    }
                    else if (!node.baseline && node.verticalAlign !== '0px') {
                        node.anchor('baseline', baseline.documentId);
                    }
                }
                else if (node.element && node.length === 0 || node.layoutHorizontal && node.renderChildren.every(item => item.baseline)) {
                    node.anchor('baseline', baseline.documentId);
                }
            }
        }
        if (imageBaseline) {
            baseline.anchor('baseline', imageBaseline.documentId);
        }
    }
    function checkSingleLine(node, nowrap = false, multiline = false) {
        if (node.textElement && node.cssAscend('textAlign', true) !== 'center' && !node.has('width') && (!node.multiline || multiline) && (nowrap || node.textContent.trim().indexOf(' ') !== -1)) {
            node.android('maxLines', '1');
            node.android('ellipsize', 'end');
        }
    }
    function adjustDocumentRootOffset(value, parent, direction, boxReset = false) {
        if (value > 0) {
            if (boxReset) {
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
        if (!node.inputElement) {
            const horizontal = dimension === 'width';
            const dimensionA = $util$3.capitalize(dimension);
            const minWH = node.cssInitial(`min${dimensionA}`);
            const maxWH = node.cssInitial(`max${dimensionA}`);
            function setAlignmentBlock() {
                const renderParent = node.renderParent;
                if (renderParent && renderParent.groupParent) {
                    renderParent.alignmentType |= 64 /* BLOCK */;
                    renderParent.unsetCache('blockStatic');
                }
            }
            if ($css$2.isLength(minWH, true)) {
                let valid = false;
                if (horizontal) {
                    if (node.ascend(false, item => item.has('width') || item.blockStatic).length) {
                        node.android('layout_width', '0px', false);
                        valid = true;
                        setAlignmentBlock();
                    }
                }
                else if (node.documentParent.has('height') && !node.has('height')) {
                    node.android('layout_height', '0px', false);
                    valid = true;
                }
                if (valid) {
                    node.app(`layout_constraint${dimensionA}_min`, $css$2.formatPX(node.parseUnit(minWH, horizontal)));
                }
            }
            let contentBox = 0;
            if ($css$2.isLength(maxWH, true)) {
                let valid = false;
                if (horizontal) {
                    if (node.ascend(false, item => item.has('width') || item.blockStatic).length) {
                        node.android('layout_width', '0px', false);
                        valid = true;
                        if (!$css$2.isPercent(maxWH)) {
                            contentBox += node.contentBoxWidth;
                        }
                        setAlignmentBlock();
                    }
                }
                else if (node.documentParent.has('height') && !node.has('height')) {
                    node.android('layout_height', '0px', false);
                    if (!$css$2.isPercent(maxWH)) {
                        contentBox += node.contentBoxHeight;
                    }
                    valid = true;
                }
                if (valid) {
                    node.app(`layout_constraint${dimensionA}_max`, $css$2.formatPX(node.parseUnit(maxWH, horizontal) + contentBox));
                }
            }
        }
    }
    function constraintPercentValue(node, dimension, opposing) {
        const horizontal = dimension === 'width';
        const value = node.css(dimension);
        if (opposing) {
            if ($css$2.isLength(value, true)) {
                node.android(`layout_${dimension}`, $css$2.formatPX(node.bounds[dimension]), false);
                if (node.imageElement) {
                    const element = node.element;
                    if (element && element.naturalWidth > 0 && element.naturalHeight > 0) {
                        const opposingUnit = (node.bounds[dimension] / (horizontal ? element.naturalWidth : element.naturalHeight)) * (horizontal ? element.naturalHeight : element.naturalWidth);
                        node.android(`layout_${horizontal ? 'height' : 'width'}`, $css$2.formatPX(opposingUnit), false);
                    }
                }
                return true;
            }
        }
        else if ($css$2.isPercent(value) && value !== '100%') {
            const percent = parseFloat(value) / 100;
            node.app(`layout_constraint${$util$3.capitalize(dimension)}_percent`, $math$1.truncate(percent, node.localSettings.floatPrecision));
            node.android(`layout_${dimension}`, '0px');
            return true;
        }
        return false;
    }
    function constraintPercentHeight(node, opposing = false) {
        if (node.documentParent.has('height', 2 /* LENGTH */)) {
            return constraintPercentValue(node, 'height', opposing);
        }
        else if ($css$2.isLength(node.cssInitial('height'), true)) {
            node.android('layout_height', $css$2.formatPX(node.bounds.height), false);
            return true;
        }
        return false;
    }
    function isTargeted(parent, node) {
        if (parent.element && node.dataset.target) {
            const element = document.getElementById(node.dataset.target);
            return element !== null && element !== parent.element;
        }
        return false;
    }
    function getTextBottom(nodes) {
        return $util$3.filterArray(nodes, node => node.verticalAlign === 'text-bottom' || node.display === 'inline-block' && node.baseline).sort((a, b) => {
            if (a.bounds.height === b.bounds.height) {
                return a.is(CONTAINER_NODE.SELECT) ? 1 : -1;
            }
            return a.bounds.height > b.bounds.height ? -1 : 1;
        })[0];
    }
    function getAnchorDirection(reverse) {
        if (reverse) {
            return {
                anchorStart: 'right',
                anchorEnd: 'left',
                chainStart: 'rightLeft',
                chainEnd: 'leftRight'
            };
        }
        else {
            return {
                anchorStart: 'left',
                anchorEnd: 'right',
                chainStart: 'leftRight',
                chainEnd: 'rightLeft'
            };
        }
    }
    const constraintPercentWidth = (node, opposing = false) => constraintPercentValue(node, 'width', opposing);
    const getMaxHeight = (node) => Math.max(node.actualHeight, node.lineHeight);
    class Controller extends squared.base.Controller {
        constructor() {
            super(...arguments);
            this.localSettings = {
                layout: {
                    pathName: 'res/layout',
                    fileExtension: 'xml',
                    baseTemplate: $xml.STRING_XMLENCODING
                },
                svg: {
                    enabled: false
                },
                supported: {
                    fontFormat: ['truetype', 'opentype'],
                    imageFormat: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'ico', 'cur']
                },
                unsupported: {
                    excluded: new Set(['BR']),
                    tagName: new Set(['SCRIPT', 'STYLE', 'OPTION', 'INPUT:hidden', 'MAP', 'AREA', 'SOURCE'])
                },
                precision: {
                    standardFloat: 4
                },
                deviations: {
                    textMarginBoundarySize: 8,
                    constraintParentBottomOffset: 3.5,
                    subscriptBottomOffset: 0.25,
                    superscriptTopOffset: 0.25,
                    legendBottomOffset: 0.25
                }
            };
        }
        static setConstraintDimension(node) {
            constraintPercentWidth(node);
            constraintPercentHeight(node);
            constraintMinMax(node, 'width');
            constraintMinMax(node, 'height');
        }
        static setFlexDimension(node, dimension) {
            const horizontal = dimension === 'width';
            const dimensionA = $util$3.capitalize(dimension);
            const flexbox = node.flexbox;
            const basis = flexbox.basis;
            function setFlexGrow(value, grow) {
                node.android(`layout_${dimension}`, '0px');
                if (grow > 0) {
                    node.app(`layout_constraint${horizontal ? 'Horizontal' : 'Vertical'}_weight`, $math$1.truncate(grow, node.localSettings.floatPrecision));
                    if (value !== '') {
                        node.css(`min${dimensionA}`, value, true);
                    }
                }
                else if (value !== '') {
                    if (flexbox.shrink < 1) {
                        node.app(`layout_constraint${dimensionA}_min`, $css$2.formatPX((1 - flexbox.shrink) * parseFloat(value)));
                        node.app(`layout_constraint${dimensionA}_max`, value);
                    }
                    else {
                        node.app(`layout_constraint${dimensionA}_min`, value);
                    }
                }
            }
            if ($css$2.isLength(basis)) {
                setFlexGrow(node.convertPX(basis), node.flexbox.grow);
            }
            else if (basis !== '0%' && $css$2.isPercent(basis)) {
                node.app(`layout_constraint${dimensionA}_percent`, (parseFloat(basis) / 100).toPrecision(node.localSettings.floatPrecision));
                setFlexGrow('', node.flexbox.grow);
            }
            else if (flexbox.grow > 0) {
                setFlexGrow(node.has(dimension, 2 /* LENGTH */) ? $css$2.formatPX(node[`actual${dimensionA}`]) : '', node.flexbox.grow);
            }
            else {
                if (horizontal) {
                    constraintPercentWidth(node);
                }
                else {
                    constraintPercentHeight(node);
                }
            }
            if (flexbox.shrink > 1) {
                node.app(`layout_constrained${dimensionA}`, 'true');
            }
            constraintMinMax(node, 'width');
            if (horizontal) {
                constraintPercentHeight(node, true);
            }
            else {
                constraintPercentWidth(node, true);
            }
            constraintMinMax(node, 'height');
        }
        optimize(nodes) {
            for (const node of nodes) {
                if (node.hasProcedure($enum$1.NODE_PROCEDURE.OPTIMIZATION)) {
                    node.applyOptimizations();
                }
                if (node.hasProcedure($enum$1.NODE_PROCEDURE.CUSTOMIZATION)) {
                    node.applyCustomizations(this.userSettings.customizationsOverwritePrivilege);
                }
            }
        }
        finalize(layouts) {
            for (const layout of layouts) {
                layout.content = $xml.replaceTab(layout.content.replace(/{#0}/, getRootNs(layout.content)), this.userSettings.insertSpaces);
            }
        }
        processUnknownParent(layout) {
            const { node, parent } = layout;
            let next = false;
            let renderAs;
            if (node.has('columnCount') || node.has('columnWidth')) {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 256 /* COLUMN */, 4 /* AUTO_LAYOUT */);
            }
            else if (layout.some(item => !item.pageFlow && !item.positionAuto)) {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, 2 /* UNKNOWN */);
            }
            else if (layout.length === 1) {
                const child = node.item(0);
                if (node.documentRoot && isTargeted(node, child)) {
                    node.hide();
                    next = true;
                }
                else if (node.naturalElement && child.plainText) {
                    node.clear();
                    node.setInlineText(true);
                    node.textContent = child.textContent;
                    child.hide();
                    layout.setType(CONTAINER_NODE.TEXT);
                }
                else if (this.userSettings.collapseUnattributedElements &&
                    node.naturalElement &&
                    node.positionStatic &&
                    node.documentParent === node.actualParent &&
                    !node.documentParent.hasAlign(4 /* AUTO_LAYOUT */) &&
                    !node.groupParent &&
                    !node.pseudoElement &&
                    !node.elementId &&
                    !node.blockStatic &&
                    !node.marginTop &&
                    !node.marginBottom &&
                    !node.hasWidth &&
                    !node.hasHeight &&
                    !node.contentBoxWidth &&
                    !node.contentBoxHeight &&
                    !node.visibleStyle.background &&
                    !node.rightAligned &&
                    !node.autoMargin.horizontal &&
                    !node.autoMargin.vertical &&
                    !node.companion &&
                    !node.has('maxWidth') &&
                    !node.has('maxHeight') &&
                    !node.has('textAlign') &&
                    !node.has('verticalAlign') &&
                    (!node.has('lineHeight') || child.length) &&
                    (!node.blockStatic || child.blockStatic) &&
                    !node.dataset.use &&
                    !node.dataset.target &&
                    !this.hasAppendProcessing(node.id)) {
                    child.documentRoot = node.documentRoot;
                    child.parent = parent;
                    node.renderAs = child;
                    node.resetBox(30 /* MARGIN */, child, true);
                    node.hide();
                    node.innerWrapped = child;
                    child.outerWrapper = node;
                    renderAs = child;
                }
                else if (node.autoMargin.horizontal || parent.layoutConstraint && parent.flexElement && node.flexbox.alignSelf === 'baseline' && child.textElement) {
                    layout.setType(CONTAINER_NODE.LINEAR, 8 /* HORIZONTAL */ | 2048 /* SINGLE */);
                }
                else {
                    layout.setType(CONTAINER_NODE.FRAME, 2048 /* SINGLE */);
                }
            }
            else if (node.element && Resource.hasLineBreak(node, true)) {
                layout.setType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */, 2 /* UNKNOWN */);
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
                layout.setType(layout.some(item => item.positionRelative || !item.pageFlow && item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */, node.documentRoot ? 2 /* UNKNOWN */ : 0);
            }
            else if (layout.every(item => item.inlineFlow)) {
                if (this.checkFrameHorizontal(layout)) {
                    layout.renderType |= 512 /* FLOAT */ | 8 /* HORIZONTAL */;
                }
                else {
                    layout.setType(CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */, 2 /* UNKNOWN */);
                }
            }
            else if (layout.some(item => item.alignedVertically(item.previousSiblings(), item.siblingIndex > 0 ? layout.children.slice(0, item.siblingIndex) : undefined, layout.cleared) > 0)) {
                layout.setType(layout.some(item => item.positionRelative || !item.pageFlow && item.positionAuto) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */, 2 /* UNKNOWN */);
            }
            else {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 2 /* UNKNOWN */);
            }
            return { layout, next, renderAs };
        }
        processUnknownChild(layout) {
            const node = layout.node;
            let next = false;
            if (layout.containerType === 0) {
                const style = node.visibleStyle;
                if (node.textContent.length && (node.inlineText || style.borderWidth)) {
                    layout.setType(CONTAINER_NODE.TEXT);
                }
                else if (node.blockStatic && (style.borderWidth || style.backgroundImage || node.paddingTop + node.paddingBottom > 0)) {
                    layout.setType(CONTAINER_NODE.LINE);
                }
                else if (this.userSettings.collapseUnattributedElements &&
                    node.naturalElement &&
                    !node.documentRoot &&
                    !node.elementId &&
                    !node.bounds.height &&
                    !node.marginTop &&
                    !node.marginBottom &&
                    !style.background &&
                    !node.dataset.use) {
                    node.hide();
                    next = true;
                }
                else {
                    layout.setType(style.background ? CONTAINER_NODE.TEXT : CONTAINER_NODE.FRAME);
                }
            }
            return { layout, next };
        }
        processTraverseHorizontal(layout, siblings) {
            const { node, parent, children } = layout;
            if (this.checkFrameHorizontal(layout)) {
                layout.node = this.createNodeGroup(node, children, parent);
                layout.renderType |= 512 /* FLOAT */ | 8 /* HORIZONTAL */;
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
                layout.renderType |= 512 /* FLOAT */ | 16 /* VERTICAL */;
            }
            else if (floated.size && children[0].floating) {
                layout.node = this.createNodeGroup(node, children, parent);
                layout.renderType |= 512 /* FLOAT */ | 8 /* HORIZONTAL */;
            }
            else if (siblings === undefined || layout.length !== siblings.length || parent.hasAlign(8 /* HORIZONTAL */)) {
                layout.node = this.createNodeGroup(node, children, parent);
                layout.setType(layout.some(item => item.positionRelative) ? CONTAINER_NODE.RELATIVE : CONTAINER_NODE.LINEAR, 16 /* VERTICAL */);
            }
            else if (!parent.hasAlign(16 /* VERTICAL */)) {
                parent.alignmentType |= 16 /* VERTICAL */;
            }
            return { layout };
        }
        processLayoutHorizontal(layout) {
            let containerType = 0;
            if (this.checkConstraintFloat(layout, true)) {
                layout.setType(CONTAINER_NODE.CONSTRAINT, 512 /* FLOAT */);
            }
            else if (this.checkConstraintHorizontal(layout)) {
                containerType = CONTAINER_NODE.CONSTRAINT;
            }
            else if (this.checkRelativeHorizontal(layout)) {
                containerType = CONTAINER_NODE.RELATIVE;
            }
            else {
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
                return $util$3.concatMultiArray(below, middle, above);
            }
            return templates;
        }
        checkFrameHorizontal(layout) {
            const [floating, sibling] = layout.partition(node => node.floating);
            if (layout.floated.size === 2 || layout.cleared.size || layout.some(node => node.pageFlow && (node.autoMargin.left || node.autoMargin.right))) {
                return true;
            }
            else if (sibling.length) {
                if (layout.floated.has('right')) {
                    return true;
                }
                else if (layout.floated.has('left') && !layout.linearX) {
                    let flowIndex = Number.POSITIVE_INFINITY;
                    for (const node of sibling) {
                        flowIndex = Math.min(flowIndex, node.siblingIndex);
                    }
                    return $util$3.replaceMap(floating, node => node.siblingIndex).some(value => value < flowIndex);
                }
            }
            return false;
        }
        checkConstraintFloat(layout, horizontal = false) {
            let A = 0;
            let B = 0;
            for (const node of layout) {
                const excluded = layout.cleared.has(node) || node.renderExclude;
                if (A !== -1 && ((node.floating || node.autoMargin.horizontal) && node.positiveAxis || excluded)) {
                    A++;
                }
                else {
                    A = -1;
                }
                if (B !== -1 && (node.has('width', 32 /* PERCENT */) || excluded)) {
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
        checkConstraintHorizontal(layout) {
            if (layout.node.cssInitialAny('textAlign', 'center', 'end', 'right') || !layout.parent.hasHeight && layout.some(node => node.verticalAlign === 'middle' || node.verticalAlign === 'bottom')) {
                return layout.singleRowAligned && layout.every(node => node.positiveAxis || node.renderExclude);
            }
            return false;
        }
        checkRelativeHorizontal(layout) {
            const lineHeight = layout.children[0].lineHeight;
            if (layout.every(node => node.baseline && !node.positionRelative && node.lineHeight === lineHeight && (node.imageElement || node.textElement && !node.multiline)) && layout.singleRowAligned) {
                return false;
            }
            return layout.some(node => node.textElement || !node.baseline || node.imageElement || node.positionRelative || !node.pageFlow && node.positionAuto);
        }
        setConstraints() {
            for (const node of this.cache) {
                if ((node.layoutRelative || node.layoutConstraint) && node.hasProcedure($enum$1.NODE_PROCEDURE.CONSTRAINT)) {
                    const children = node.renderFilter(item => !item.positioned);
                    if (children.length) {
                        if (node.layoutRelative) {
                            this.processRelativeHorizontal(node, children);
                        }
                        else {
                            const [pageFlow, absolute] = $util$3.partitionArray(children, item => item.pageFlow);
                            let bottomParent = node.box.bottom;
                            if (absolute.length) {
                                node.renderEach(item => bottomParent = Math.max(bottomParent, item.linear.bottom));
                                for (const item of absolute) {
                                    if (item.leftTopAxis) {
                                        if (!item.positionAuto) {
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
                                                    if (!item.has('right') && item.css('width') === '100%') {
                                                        item.anchor('right', 'parent');
                                                    }
                                                    item.modifyBox(16 /* MARGIN_LEFT */, adjustDocumentRootOffset(item.left, node, 'Left', true));
                                                }
                                                if (item.has('right') && (!item.has('width') || item.css('width') === '100%' || !item.has('left'))) {
                                                    item.anchor('right', 'parent');
                                                    item.modifyBox(4 /* MARGIN_RIGHT */, adjustDocumentRootOffset(item.right, node, 'Right', true));
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
                                                    item.anchor('top', 'parent');
                                                    if (!item.has('bottom') && item.css('height') === '100%') {
                                                        item.anchor('bottom', 'parent');
                                                    }
                                                    item.modifyBox(2 /* MARGIN_TOP */, adjustDocumentRootOffset(item.top, node, 'Top', true));
                                                }
                                                if (item.has('bottom') && (!item.has('height') || item.css('height') === '100%' || !item.has('top'))) {
                                                    item.anchor('bottom', 'parent');
                                                    item.modifyBox(8 /* MARGIN_BOTTOM */, adjustDocumentRootOffset(item.bottom, node, 'Bottom', true));
                                                }
                                            }
                                        }
                                        if (item.outerWrapper) {
                                            if (!item.alignParent('bottom')) {
                                                item.anchor('top', 'parent', false);
                                            }
                                            if (!item.alignParent('right')) {
                                                item.anchor('left', 'parent', false);
                                            }
                                        }
                                    }
                                    item.positioned = true;
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
                                    if (item.autoMargin.leftRight || item.inlineStatic && item.cssAscend('textAlign', true) === 'center') {
                                        item.anchorParent(AXIS_ANDROID.HORIZONTAL);
                                    }
                                    else if (item.rightAligned) {
                                        item.anchor('right', 'parent');
                                    }
                                    else if ($util$3.withinRange(item.linear.left, node.box.left) || item.linear.left < node.box.left || item.autoMargin.right) {
                                        item.anchor('left', 'parent');
                                    }
                                    if (item.autoMargin.topBottom) {
                                        item.anchorParent(AXIS_ANDROID.VERTICAL);
                                    }
                                    else {
                                        if ($util$3.withinRange(item.linear.top, node.box.top) || item.linear.top < node.box.top) {
                                            item.anchor('top', 'parent');
                                        }
                                        if (this.withinParentBottom(item.pageFlow, item.linear.bottom, bottomParent) && item.actualParent && !item.actualParent.documentBody && !item.has('height', 32 /* PERCENT */, { not: '100%' })) {
                                            item.anchor('bottom', 'parent');
                                            if (item.alignParent('top')) {
                                                item.anchorStyle(AXIS_ANDROID.VERTICAL);
                                            }
                                        }
                                    }
                                    Controller.setConstraintDimension(item);
                                }
                                this.evaluateAnchors(pageFlow);
                            }
                            for (const item of children) {
                                if (!item.anchored) {
                                    this.addGuideline(item, node);
                                    if (item.pageFlow) {
                                        this.evaluateAnchors(pageFlow);
                                    }
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
                    if ($util$3.hasBit(alignmentType, 16 /* VERTICAL */)) {
                        options.android.orientation = AXIS_ANDROID.VERTICAL;
                        valid = true;
                    }
                    else if ($util$3.hasBit(alignmentType, 8 /* HORIZONTAL */)) {
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
                default:
                    if (layout.length === 0) {
                        return this.renderNode(layout);
                    }
                    break;
            }
            if (valid) {
                node.setControlType(View.getControlName(containerType), containerType);
                node.alignmentType |= alignmentType;
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
                        const element = node.element;
                        let width = node.toFloat('width');
                        let height = node.toFloat('height');
                        let percentWidth = node.has('width', 32 /* PERCENT */) ? width : -1;
                        const percentHeight = node.has('height', 32 /* PERCENT */) ? height : -1;
                        let scaleType = 'fitXY';
                        let imageSet;
                        if (element.srcset) {
                            imageSet = $css$2.getSrcSet(element, this.localSettings.supported.imageFormat);
                            if (imageSet.length) {
                                if (imageSet[0].actualWidth) {
                                    if (percentWidth === -1 || width < 100) {
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
                        if (node.hasResource($enum$1.NODE_RESOURCE.IMAGE_SOURCE)) {
                            const src = Resource.addImageSrc(element, '', imageSet);
                            if (src !== '') {
                                node.android('src', `@drawable/${src}`);
                            }
                        }
                        if (percentWidth !== -1 || percentHeight !== -1) {
                            if (percentWidth >= 0) {
                                width *= node.documentParent.box.width / 100;
                                if (percentWidth < 100 && !parent.layoutConstraint) {
                                    node.css('width', $css$2.formatPX(width));
                                }
                            }
                            if (percentHeight >= 0) {
                                height *= node.documentParent.box.height / 100;
                                if (percentHeight < 100 && !(parent.layoutConstraint && node.documentParent.has('height', 2 /* LENGTH */))) {
                                    node.css('height', $css$2.formatPX(height));
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
                            const container = this.application.createNode($dom$1.createElement(node.actualParent && node.actualParent.element));
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
                            if (width > 0) {
                                container.android('layout_width', width < node.documentParent.box.width ? $css$2.formatPX(width) : 'match_parent');
                            }
                            else {
                                container.android('layout_width', 'wrap_content');
                            }
                            if (height > 0) {
                                container.android('layout_height', height < node.documentParent.box.height ? $css$2.formatPX(height) : 'match_parent');
                            }
                            else {
                                container.android('layout_height', 'wrap_content');
                            }
                            container.render(target ? this.application.resolveTarget(target) : parent);
                            container.saveAsInitial();
                            container.innerWrapped = node;
                            node.outerWrapper = container;
                            if (!parent.layoutConstraint) {
                                node.modifyBox(2 /* MARGIN_TOP */, node.top);
                                node.modifyBox(16 /* MARGIN_LEFT */, node.left);
                            }
                            this.application.addLayoutTemplate(parent, container, {
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
                            case 'time':
                            case 'number':
                            case 'datetime-local':
                                switch (element.type) {
                                    case 'number':
                                    case 'range':
                                        node.android('inputType', 'number');
                                        break;
                                    case 'time':
                                        node.android('inputType', 'time');
                                        break;
                                    case 'datetime-local':
                                        node.android('inputType', 'datetime');
                                        break;
                                }
                                if ($util$3.isString(element.min)) {
                                    node.android('min', element.min);
                                }
                                if ($util$3.isString(element.max)) {
                                    node.android('max', element.max);
                                }
                                break;
                            case 'email':
                            case 'tel':
                            case 'url':
                            case 'week':
                            case 'month':
                            case 'search':
                                switch (element.type) {
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
                            node.css('width', $css$2.formatPX(element.cols * 8), true);
                        }
                        node.android('hint', element.placeholder);
                        node.android('scrollbars', AXIS_ANDROID.VERTICAL);
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
                        const match = /^(rgba?\(\d+, \d+, \d+(?:, [\d.]+)?\)) (-?[\d.]+[a-z]+) (-?[\d.]+[a-z]+)\s*(-?[\d.]+[a-z]+)?$/.exec(node.css('textShadow'));
                        if (match) {
                            const color = Resource.addColor($color$1.parseColor(match[1]));
                            if (color !== '') {
                                node.android('shadowColor', `@color/${color}`);
                                node.android('shadowDx', $math$1.truncate($css$2.parseUnit(match[2], node.fontSize)));
                                node.android('shadowDy', $math$1.truncate($css$2.parseUnit(match[3], node.fontSize)));
                                node.android('shadowRadius', match[4] ? $math$1.truncate($css$2.parseUnit(match[4], node.fontSize)) : '0');
                            }
                        }
                    }
                    if (node.css('whiteSpace') === 'nowrap') {
                        node.android('maxLines', '1');
                        node.android('ellipsize', 'end');
                    }
                    break;
                case CONTAINER_ANDROID.BUTTON:
                    node.mergeGravity('gravity', 'center_vertical');
                    break;
                case CONTAINER_ANDROID.EDIT:
                case CONTAINER_ANDROID.RANGE:
                    if (!node.hasWidth) {
                        node.css('width', $css$2.formatPX(node.bounds.width), true);
                    }
                    break;
                case CONTAINER_ANDROID.LINE:
                    if (!node.hasHeight) {
                        node.android('layout_height', $css$2.formatPX(node.contentBoxHeight || 1));
                    }
                    break;
            }
            node.render(target ? this.application.resolveTarget(target) : parent);
            return {
                type: 1 /* XML */,
                node,
                controlName
            };
        }
        renderNodeStatic(controlName, options, width, height, content) {
            const node = new View(0, '0', undefined, this.afterInsertNode);
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
        renderSpace(width, height, columnSpan, rowSpan, options) {
            if (options === undefined) {
                options = createViewAttribute();
            }
            if ($css$2.isPercent(width)) {
                options.android.layout_columnWeight = $math$1.truncate(parseFloat(width) / 100, this.localSettings.precision.standardFloat);
                width = '0px';
            }
            if (height && $css$2.isPercent(height)) {
                options.android.layout_rowWeight = $math$1.truncate(parseFloat(height) / 100, this.localSettings.precision.standardFloat);
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
            const boxParent = parent.groupParent && !node.documentParent.hasAlign(4 /* AUTO_LAYOUT */) ? parent : node.documentParent;
            const absoluteParent = node.absoluteParent;
            GUIDELINE_AXIS.forEach(value => {
                if (!node.constraint[value] && (!orientation || value === orientation)) {
                    const horizontal = value === AXIS_ANDROID.HORIZONTAL;
                    const box = boxParent.box;
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
                    if ($util$3.withinRange(node.linear[LT], box[LT])) {
                        node.anchor(LT, 'parent', true);
                        return;
                    }
                    const bounds = node.positionStatic ? node.bounds : node.linear;
                    let beginPercent = 'layout_constraintGuide_';
                    let usePercent = false;
                    let location;
                    if (!node.pageFlow && $css$2.isPercent(node.css(LT))) {
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
                                        if ($util$3.withinRange(node.linear[LT], item.linear[RB])) {
                                            node.anchor(LTRB, item.documentId, true);
                                            valid = true;
                                        }
                                        else if ($util$3.withinRange(node.linear[RB], item.linear[LT])) {
                                            node.anchor(RBLT, item.documentId, true);
                                            valid = true;
                                        }
                                    }
                                    if (pageFlow || !node.pageFlow && !item.pageFlow && node.bounds[LT] >= 0 && node.bounds[LT] >= 0) {
                                        if ($util$3.withinRange(node.bounds[LT], item.bounds[LT])) {
                                            node.anchor(!horizontal && node.textElement && node.baseline && item.textElement && item.baseline ? 'baseline' : LT, item.documentId, true);
                                            node.modifyBox(horizontal ? 16 /* MARGIN_LEFT */ : 2 /* MARGIN_TOP */, null);
                                            valid = true;
                                        }
                                        else if ($util$3.withinRange(node.bounds[RB], item.bounds[RB])) {
                                            node.anchor(RB, item.documentId, true);
                                            node.modifyBox(horizontal ? 4 /* MARGIN_RIGHT */ : 8 /* MARGIN_BOTTOM */, null);
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
                            const position = Math.abs(bounds[LT] - box[LT]) / box[horizontal ? 'width' : 'height'];
                            location = parseFloat($math$1.truncate(opposite ? 1 - position : position, this.localSettings.precision.standardFloat));
                            usePercent = true;
                            beginPercent += 'percent';
                        }
                        else {
                            location = bounds[LT] - box[!opposite ? LT : RB];
                            if (!horizontal && absoluteParent !== boxParent && absoluteParent.getBox(2 /* MARGIN_TOP */)[0] === 1) {
                                location -= absoluteParent.marginTop;
                            }
                            beginPercent += 'begin';
                        }
                    }
                    const guideline = parent.constraint.guideline || {};
                    if (!node.pageFlow) {
                        if (node.parent === boxParent.outerWrapper) {
                            location += boxParent[!opposite ? (horizontal ? 'paddingLeft' : 'paddingTop') : (horizontal ? 'paddingRight' : 'paddingBottom')];
                        }
                        else if (absoluteParent === node.documentParent) {
                            location = horizontal ? adjustDocumentRootOffset(location, boxParent, 'Left') : adjustDocumentRootOffset(location, boxParent, 'Top', boxParent.getBox(32 /* PADDING_TOP */)[0] === 0);
                        }
                    }
                    else if (node.inlineVertical) {
                        const offset = $util$3.convertFloat(node.verticalAlign);
                        if (offset < 0) {
                            location += offset;
                        }
                    }
                    if (!horizontal && node.marginTop < 0) {
                        location -= node.marginTop;
                        node.modifyBox(2 /* MARGIN_TOP */, null);
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
                    else if (horizontal && location + bounds.width >= box.right && boxParent.has('width') && !node.has('right') || !horizontal && location + bounds.height >= box.bottom && boxParent.has('height') && !node.has('bottom')) {
                        node.anchor(RB, 'parent', true);
                    }
                    else {
                        const anchors = $util$3.optionalAsObject(guideline, `${value}.${beginPercent}.${LT}`);
                        if (anchors) {
                            for (const id in anchors) {
                                if (parseInt(anchors[id]) === location) {
                                    node.anchor(LT, id, true);
                                    node.anchorDelete(RB);
                                    return;
                                }
                            }
                        }
                        const options = createViewAttribute(undefined, { orientation: horizontal ? AXIS_ANDROID.VERTICAL : AXIS_ANDROID.HORIZONTAL }, { [beginPercent]: usePercent ? location.toString() : $css$2.formatPX(location) });
                        this.addAfterOutsideTemplate(node.id, this.renderNodeStatic(CONTAINER_ANDROID.GUIDELINE, options));
                        const documentId = options['documentId'];
                        node.anchor(LT, documentId, true);
                        node.anchorDelete(RB);
                        if (location > 0) {
                            $util$3.assignEmptyValue(guideline, value, beginPercent, LT, documentId, location.toString());
                            parent.constraint.guideline = guideline;
                        }
                    }
                }
            });
        }
        addBarrier(nodes, barrierDirection) {
            const options = createViewAttribute(undefined, undefined, { barrierDirection, constraint_referenced_ids: $util$3.objectMap(nodes, node => stripId(node.documentId)).join(',') });
            this.addAfterOutsideTemplate(nodes[nodes.length - 1].id, this.renderNodeStatic(CONTAINER_ANDROID.BARRIER, options));
            return options['documentId'];
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
                        const bottomTop = current.alignSibling('bottomTop');
                        if (bottomTop !== '') {
                            const next = nodes.find(item => item.documentId === bottomTop);
                            if (next && next.alignSibling('topBottom') === current.documentId) {
                                if (next.alignParent('bottom')) {
                                    node.anchorStyle(AXIS_ANDROID.VERTICAL, 'packed', 0, false);
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
                                const documentId = this.addBarrier([current], 'bottom');
                                current.anchor('bottomTop', documentId);
                            }
                            break;
                        }
                    }
                }
            }
            let i = -1;
            while (++i < nodes.length) {
                const node = nodes[i];
                if (!node.constraint.horizontal) {
                    for (const attr in node.constraint.current) {
                        const position = node.constraint.current[attr];
                        if (position.horizontal && horizontal.some(item => item.documentId === position.documentId)) {
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
                        if (!position.horizontal && vertical.some(item => item.documentId === position.documentId)) {
                            node.constraint.vertical = true;
                            vertical.push(node);
                            i = -1;
                            break;
                        }
                    }
                }
            }
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
        createNodeWrapper(node, parent, children, controlName, containerType) {
            const container = this.application.createNode($dom$1.createElement(node.actualParent && node.actualParent.element, node.block ? 'div' : 'span'), true, parent, children);
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
                procedure: $enum$1.NODE_PROCEDURE.NONPOSITIONAL,
                resource: $enum$1.NODE_RESOURCE.BOX_STYLE | $enum$1.NODE_RESOURCE.ASSET
            });
            if (parent) {
                parent.appendTry(node, container);
                node.parent = container;
            }
            else {
                container.innerWrapped = node;
                container.siblingIndex = node.siblingIndex;
            }
            if (node.renderParent) {
                const renderTemplates = node.renderParent.renderTemplates;
                if (renderTemplates) {
                    for (let i = 0; i < renderTemplates.length; i++) {
                        if (renderTemplates[i].node === node) {
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
            node.outerWrapper = container;
            return container;
        }
        processRelativeHorizontal(node, children) {
            const rowsLeft = [];
            const rowsRight = [];
            let alignmentMultiLine = false;
            let sortPositionAuto = false;
            if (node.hasAlign(16 /* VERTICAL */)) {
                let previous;
                for (let i = 0; i < children.length; i++) {
                    const item = children[i];
                    if (previous === undefined) {
                        item.anchor('top', 'true');
                    }
                    else {
                        item.anchor('topBottom', previous.documentId);
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
                        if (renderParent.overflowX) {
                            return renderParent.box.width;
                        }
                        else if (renderParent.groupParent) {
                            let floatStart = Number.NEGATIVE_INFINITY;
                            for (const item of node.documentParent.actualChildren) {
                                if (item.float === 'left' && item.linear.right > floatStart && !children.includes(item)) {
                                    floatStart = item.linear.right;
                                }
                            }
                            if (floatStart !== Number.NEGATIVE_INFINITY) {
                                for (const child of node.documentParent.actualChildren) {
                                    if (child.linear.right === floatStart && children.some(item => $util$3.withinRange(item.linear.left, floatStart) && item.intersectY(child.linear))) {
                                        return node.box.right - floatStart;
                                    }
                                }
                            }
                        }
                        else if (renderParent === node.documentParent && renderParent.blockStatic && node.naturalElement && node.inlineStatic) {
                            return renderParent.box.width - (node.linear.left - renderParent.box.left);
                        }
                    }
                    return node.box.width - (node.getBox(256 /* PADDING_LEFT */)[1] + node.getBox(64 /* PADDING_RIGHT */)[1]);
                })();
                const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
                const cleared = $NodeList$1.linearData(children, true).cleared;
                const textIndent = node.block || node.blockDimension ? node.toInt('textIndent') : 0;
                let rowWidth = 0;
                let previousRowLeft;
                $util$3.partitionArray(children, item => item.float !== 'right').forEach((seg, index) => {
                    if (seg.length === 0) {
                        return;
                    }
                    const leftAlign = index === 0;
                    let leftForward = true;
                    let alignParent;
                    let rows;
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
                        rows = rowsLeft;
                    }
                    else {
                        alignParent = 'right';
                        rows = rowsRight;
                    }
                    let previousMultiline = false;
                    let previous;
                    for (let i = 0; i < seg.length; i++) {
                        const item = seg[i];
                        let alignSibling = leftAlign && leftForward ? 'leftRight' : 'rightLeft';
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
                        if (item.naturalElement && item.inlineText && !item.has('width')) {
                            const rect = $session.getRangeClientRect(item.element, item.sessionId);
                            if (rect.numberOfLines || rect.width < item.box.width) {
                                bounds = rect;
                                if (!item.multiline) {
                                    item.multiline = rect.numberOfLines ? rect.numberOfLines > 0 : false;
                                }
                            }
                        }
                        let multiline = item.multiline;
                        if (multiline && Math.floor(bounds.width) <= boxWidth) {
                            multiline = false;
                        }
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
                        if (previous === undefined) {
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
                            const items = rows[rows.length - 1];
                            let maxWidth = 0;
                            let baseWidth = 0;
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
                                    baseWidth -= item.paddingLeft + item.paddingRight;
                                }
                                return true;
                            };
                            if (adjustFloatingNegativeMargin(item, previous)) {
                                alignSibling = '';
                            }
                            const viewGroup = item.groupParent && !item.hasAlign(128 /* SEGMENTED */);
                            let retainMultiline = false;
                            siblings = !viewGroup && item.inlineVertical && previous.inlineVertical ? $dom$1.getElementsBetweenSiblings(previous.element, item.element, true) : undefined;
                            const startNewRow = () => {
                                if (previous.textElement) {
                                    if (i === 1 && siblings === undefined && item.plainText && !$regex$1.CHAR.TRAILINGSPACE.test(previous.textContent) && !$regex$1.CHAR.LEADINGSPACE.test(item.textContent)) {
                                        retainMultiline = true;
                                        return false;
                                    }
                                    else if (checkLineWrap && previousMultiline && (previous.bounds.width >= boxWidth || Resource.hasLineBreak(previous, false, true))) {
                                        return true;
                                    }
                                }
                                if (previous.floating && rowWidth < boxWidth && previous.alignParent('left')) {
                                    return false;
                                }
                                else if (checkLineWrap) {
                                    checkWrapWidth();
                                    if (baseWidth > maxWidth) {
                                        if (previous && previous.textElement) {
                                            checkSingleLine(previous, false, previousMultiline);
                                        }
                                        return true;
                                    }
                                    else if ($util$3.aboveRange(baseWidth, maxWidth) && !item.alignParent(alignParent)) {
                                        checkSingleLine(item, true, multiline);
                                    }
                                    if (multiline && Resource.hasLineBreak(item) || item.preserveWhiteSpace && $regex$1.CHAR.LEADINGNEWLINE.test(item.textContent)) {
                                        return true;
                                    }
                                }
                                return false;
                            };
                            const textNewRow = item.textElement && startNewRow();
                            if (textNewRow ||
                                viewGroup ||
                                $util$3.aboveRange(item.linear.top, previous.linear.bottom) && (item.blockStatic || item.floating && previous.float === item.float) ||
                                previous.autoMargin.horizontal ||
                                cleared.has(item) ||
                                !item.textElement && checkWrapWidth() && Math.floor(baseWidth) > maxWidth ||
                                !item.floating && (previous.blockStatic || item.previousSiblings().some(sibling => sibling.lineBreak || sibling.excluded && sibling.blockStatic) || !!siblings && siblings.some(element => $session.causesLineBreak(element, node.sessionId)))) {
                                if (leftForward) {
                                    if (previousRowLeft && item.linear.bottom <= previousRowLeft.bounds.bottom) {
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
                                if (!previous.floating && !retainMultiline && item.multiline && !item.has('width')) {
                                    item.multiline = false;
                                    multiline = false;
                                }
                                items.push(item);
                            }
                        }
                        if (item.float === 'left' && leftAlign) {
                            if (previousRowLeft) {
                                if ($util$3.aboveRange(item.linear.bottom, previousRowLeft.linear.bottom)) {
                                    previousRowLeft = item;
                                }
                            }
                            else {
                                previousRowLeft = item;
                            }
                        }
                        let previousOffset = 0;
                        if (siblings && !siblings.some(element => !!$session.getElementAsNode(element, item.sessionId) || $session.causesLineBreak(element, item.sessionId))) {
                            const betweenStart = $session.getRangeClientRect(siblings[0], '0');
                            if (!betweenStart.numberOfLines) {
                                const betweenEnd = siblings.length > 1 ? $session.getRangeClientRect(siblings[siblings.length - 1], '0') : undefined;
                                if (betweenEnd === undefined || !betweenEnd.numberOfLines) {
                                    previousOffset = betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                                }
                            }
                        }
                        rowWidth += previousOffset + item.marginLeft + bounds.width + item.marginRight;
                        previous = item;
                        previousMultiline = multiline;
                    }
                });
            }
            if (rowsLeft.length > 1 || rowsRight.length > 1) {
                alignmentMultiLine = true;
            }
            [rowsLeft, rowsRight].forEach(rows => {
                let previousBaseline;
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
                                if (baseline !== textBottom && (textBottom.actualHeight > baseline.actualHeight || textBottom.companion && textBottom.companion.actualHeight > baseline.actualHeight)) {
                                    baseline.anchor('bottom', textBottom.documentId);
                                }
                                else {
                                    textBottom = undefined;
                                }
                            }
                        }
                        const baselineAlign = [];
                        let documentId = i === 0 ? 'true' : (baseline ? baseline.documentId : '');
                        let maxCenterHeight = 0;
                        let textBaseline = null;
                        for (const item of items) {
                            if (item.baseline) {
                                if (item !== baseline) {
                                    if (textBottom && item.inputElement) {
                                        if (item !== textBottom) {
                                            item.anchor('bottom', textBottom.documentId);
                                        }
                                    }
                                    else {
                                        baselineAlign.push(item);
                                    }
                                }
                            }
                            else if (item.inlineVertical) {
                                const baselineActive = item !== baseline && baseline;
                                switch (item.verticalAlign) {
                                    case 'text-top':
                                        if (textBaseline === null) {
                                            textBaseline = $NodeList$1.baseline(items, true)[0];
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
                                        else if (baselineActive) {
                                            item.anchor('top', baselineActive.documentId);
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
                                        else if (baselineActive) {
                                            const heightParent = Math.max(baselineActive.actualHeight, baselineActive.lineHeight);
                                            if (height < heightParent) {
                                                item.anchor('top', baselineActive.documentId);
                                                item.modifyBox(2 /* MARGIN_TOP */, Math.round((heightParent - height) / 2));
                                            }
                                        }
                                        break;
                                    case 'text-bottom':
                                        if (textBottom) {
                                            if (item !== textBottom) {
                                                item.anchor('bottom', textBottom.documentId);
                                            }
                                        }
                                        else {
                                            if (textBaseline === null) {
                                                textBaseline = $NodeList$1.baseline(items, true)[0];
                                            }
                                            if (textBaseline && textBaseline !== item) {
                                                item.anchor('bottom', textBaseline.documentId);
                                            }
                                        }
                                        break;
                                    case 'sub':
                                        if (!item.baselineAltered) {
                                            item.modifyBox(8 /* MARGIN_BOTTOM */, Math.ceil(item.fontSize * this.localSettings.deviations.subscriptBottomOffset) * -1);
                                        }
                                    case 'bottom':
                                        if (documentId !== '' && !$util$3.withinRange(node.bounds.height, item.bounds.height)) {
                                            if (!node.hasHeight && documentId === 'true') {
                                                if (!alignmentMultiLine) {
                                                    node.css('height', $css$2.formatPX(node.bounds.height), true);
                                                }
                                                else if (baselineActive) {
                                                    documentId = baselineActive.documentId;
                                                }
                                            }
                                            item.anchor('bottom', documentId);
                                        }
                                        break;
                                    default:
                                        if (!item.baselineAltered) {
                                            baselineAlign.push(item);
                                        }
                                        if (item.svgElement) {
                                            item.android('baselineAlignBottom', 'true');
                                        }
                                        break;
                                }
                            }
                        }
                        if (baseline) {
                            baseline.baselineActive = true;
                            if (baselineAlign.length) {
                                adjustBaseline(baseline, baselineAlign);
                            }
                            if (baseline.textElement && maxCenterHeight > baseline.actualHeight) {
                                baseline.anchor('centerVertical', 'true');
                                baseline = undefined;
                            }
                        }
                        else if (baselineAlign.length && baselineAlign.length < items.length) {
                            textBottom = getTextBottom(items);
                            if (textBottom) {
                                for (const item of baselineAlign) {
                                    if (item.baseline && !item.multiline) {
                                        item.anchor('bottom', textBottom.documentId);
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
                        if (previousBaseline === undefined) {
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
                                item.anchor('topBottom', previousBaseline.documentId);
                            }
                        }
                    }
                    previousBaseline = baseline;
                }
            });
            if (alignmentMultiLine) {
                node.horizontalRows = $util$3.concatArray(rowsLeft, rowsRight);
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
            const baseline = $NodeList$1.baseline(children)[0];
            const textBaseline = $NodeList$1.baseline(children, true)[0];
            const reverse = node.hasAlign(1024 /* RIGHT */);
            const textBottom = getTextBottom(children);
            const { anchorStart, anchorEnd, chainStart, chainEnd } = getAnchorDirection(reverse);
            let bias = 0;
            let tallest;
            let bottom;
            switch (node.cssInitial('textAlign')) {
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
            function setParentVertical(item) {
                item.anchorParent(AXIS_ANDROID.VERTICAL);
                item.anchorStyle(AXIS_ANDROID.VERTICAL);
            }
            for (let i = 0; i < children.length; i++) {
                const item = children[i];
                if (i === 0) {
                    item.anchor(anchorStart, 'parent');
                    item.anchorStyle(AXIS_ANDROID.HORIZONTAL, 'packed', bias);
                }
                else {
                    const previous = children[i - 1];
                    previous.anchor(chainEnd, item.documentId);
                    item.anchor(chainStart, previous.documentId);
                    if (i === children.length - 1) {
                        item.anchor(anchorEnd, 'parent');
                    }
                }
                if (item !== baseline) {
                    if (item.inlineVertical) {
                        if (tallest === undefined || getMaxHeight(item) > getMaxHeight(tallest)) {
                            tallest = item;
                        }
                        let alignTop = false;
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
                                    item.anchorParent(AXIS_ANDROID.VERTICAL);
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
                                    for (let j = 0; j < children.length; j++) {
                                        const child = children[j];
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
                                if (baseline) {
                                    item.anchor('baseline', baseline.documentId);
                                }
                                break;
                            case 'sub':
                            case 'super':
                                alignTop = true;
                                break;
                            default:
                                setParentVertical(item);
                                if (item.svgElement) {
                                    item.android('baselineAlignBottom', 'true');
                                }
                                break;
                        }
                        if (alignTop) {
                            setParentVertical(item);
                            item.modifyBox(2 /* MARGIN_TOP */, item.linear.top - node.box.top);
                            item.baselineAltered = true;
                        }
                    }
                    else if (baseline && item.plainText && item.baseline) {
                        item.anchor('baseline', baseline.documentId);
                    }
                    else {
                        setParentVertical(item);
                    }
                    item.anchored = true;
                }
                else {
                    baseline.baselineActive = true;
                }
                Controller.setConstraintDimension(item);
            }
            if (baseline) {
                if (tallest && tallest !== baseline && baseline.textElement && getMaxHeight(tallest) > getMaxHeight(baseline)) {
                    switch (tallest.verticalAlign) {
                        case 'middle':
                            baseline.anchorParent(AXIS_ANDROID.VERTICAL, true);
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
                    setParentVertical(baseline);
                }
                baseline.anchored = true;
            }
        }
        processConstraintColumn(node, children) {
            let items = [];
            const rows = [items];
            for (let i = 0; i < children.length; i++) {
                const item = children[i];
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
            const columnGap = $util$3.convertFloat(node.css('columnGap')) || $css$2.getFontSize(document.body) || 16;
            const columnWidth = node.toFloat('columnWidth');
            const columnCount = node.toInt('columnCount');
            const columnSized = columnWidth > 0 ? Math.floor(node.actualWidth / columnWidth) : Number.POSITIVE_INFINITY;
            let previousRow;
            function setColumnHorizontal(seg) {
                const rowStart = seg[0];
                const rowEnd = seg[seg.length - 1];
                for (let i = 0; i < seg.length; i++) {
                    const item = seg[i];
                    if (i > 0) {
                        item.anchor('leftRight', seg[i - 1].documentId);
                    }
                    if (i < seg.length - 1) {
                        item.anchor('rightLeft', seg[i + 1].documentId);
                    }
                    item.anchored = true;
                }
                rowStart.anchor('left', 'parent');
                rowEnd.anchor('right', 'parent');
                rowStart.anchorStyle(AXIS_ANDROID.HORIZONTAL, 'spread_inside');
            }
            function setColumnVertical(partition, lastRow) {
                const rowStart = partition[0][0];
                for (let i = 0; i < partition.length; i++) {
                    const seg = partition[i];
                    for (let j = 0; j < seg.length; j++) {
                        const item = seg[j];
                        if (j === 0) {
                            if (i === 0) {
                                if (previousRow) {
                                    previousRow.anchor('bottomTop', item.documentId);
                                    item.anchor('topBottom', previousRow.documentId);
                                }
                                else {
                                    item.anchor('top', 'parent');
                                    item.anchorStyle(AXIS_ANDROID.VERTICAL);
                                }
                            }
                            else {
                                item.anchor('top', rowStart.documentId);
                                item.anchorStyle(AXIS_ANDROID.VERTICAL);
                                item.modifyBox(2 /* MARGIN_TOP */, null);
                            }
                        }
                        else {
                            seg[j - 1].anchor('bottomTop', item.documentId);
                            item.anchor('topBottom', seg[j - 1].documentId);
                        }
                        if (j > 0) {
                            item.anchor('left', seg[0].documentId);
                        }
                        if (j === seg.length - 1) {
                            if (lastRow) {
                                item.anchor('bottom', 'parent');
                            }
                            else if (i > 0 && !item.multiline) {
                                const adjacent = partition[i - 1][j];
                                if (adjacent && !adjacent.multiline && $util$3.withinRange(item.bounds.top, adjacent.bounds.top)) {
                                    item.anchor('top', adjacent.documentId);
                                    item.modifyBox(2 /* MARGIN_TOP */, -adjacent.marginTop);
                                }
                            }
                        }
                        item.anchored = true;
                        item.positioned = true;
                    }
                }
            }
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const rowStart = row[0];
                if (row.length === 1) {
                    if (i === 0) {
                        rowStart.anchor('top', 'parent');
                        rowStart.anchorStyle(AXIS_ANDROID.VERTICAL);
                    }
                    else if (previousRow) {
                        previousRow.anchor('bottomTop', rowStart.documentId);
                        rowStart.anchor('topBottom', previousRow.documentId);
                    }
                    if (node.rightAligned) {
                        node.anchor('right', 'parent');
                    }
                    else if (node.centerAligned) {
                        node.anchorParent(AXIS_ANDROID.HORIZONTAL);
                    }
                    else {
                        node.anchor('left', 'parent');
                    }
                    if (i === rows.length - 1) {
                        rowStart.anchor('bottom', 'parent');
                    }
                    else {
                        previousRow = row[0];
                    }
                }
                else {
                    const columns = [];
                    const columnMin = Math.min(row.length, columnSized, columnCount || Number.POSITIVE_INFINITY);
                    let perRowCount = row.length >= columnMin ? Math.ceil(row.length / columnMin) : 1;
                    let maxHeight = Math.floor(row.reduce((a, b) => a + b.bounds.height, 0) / columnMin);
                    let excessCount = perRowCount > 1 && row.length % columnMin !== 0 ? row.length - columnMin : Number.POSITIVE_INFINITY;
                    let totalGap = 0;
                    for (let j = 0, k = 0, l = 0; j < row.length; j++, l++) {
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
                            totalGap += $math$1.maxArray($util$3.objectMap(column.children, child => child.marginLeft + child.marginRight));
                        }
                        if (row.length - j === columnMin - k && excessCount !== Number.POSITIVE_INFINITY) {
                            perRowCount = 1;
                        }
                    }
                    const percentGap = columnMin > 1 ? Math.max(((totalGap + (columnGap * (columnMin - 1))) / node.box.width) / columnMin, 0.01) : 0;
                    const horizontal = [];
                    for (let j = 0; j < columns.length; j++) {
                        const columnStart = columns[j][0];
                        horizontal.push(columnStart);
                        for (const item of columns[j]) {
                            item.android('layout_width', '0px');
                            item.app('layout_constraintWidth_percent', $math$1.truncate((1 / columnMin) - percentGap, this.localSettings.precision.standardFloat));
                        }
                    }
                    const columnHeight = new Array(columns.length).fill(0);
                    for (let j = 0; j < columns.length; j++) {
                        const item = columns[j];
                        if (j < columns.length - 1 && item.length > 1) {
                            const columnEnd = item[item.length - 1];
                            if (/H\d/.test(columnEnd.tagName)) {
                                item.pop();
                                horizontal[j + 1] = columnEnd;
                                columns[j + 1].unshift(columnEnd);
                                columnEnd.modifyBox(2 /* MARGIN_TOP */, null);
                            }
                        }
                        const elements = [];
                        for (let k = 0; k < item.length; k++) {
                            const column = item[k];
                            if (column.naturalElement) {
                                elements.push(column.element.cloneNode(true));
                            }
                            else {
                                columnHeight[j] += column.linear.height;
                            }
                        }
                        if (elements.length) {
                            const container = document.createElement('div');
                            container.style.width = $css$2.formatPX(columnWidth || node.box.width / columnMin);
                            container.style.visibility = 'hidden';
                            for (const element of elements) {
                                container.appendChild(element);
                            }
                            document.body.appendChild(container);
                            columnHeight[j] += container.getBoundingClientRect().height;
                            document.body.removeChild(container);
                        }
                    }
                    for (let j = 0; j < horizontal.length; j++) {
                        const item = horizontal[j];
                        if (j > 0) {
                            item.modifyBox(16 /* MARGIN_LEFT */, columnGap);
                        }
                    }
                    setColumnHorizontal(horizontal);
                    setColumnVertical(columns, i === rows.length - 1);
                    maxHeight = 0;
                    for (let j = 0; j < columnHeight.length; j++) {
                        if (columnHeight[j] >= maxHeight) {
                            previousRow = columns[j].pop();
                            maxHeight = columnHeight[j];
                        }
                    }
                }
            }
        }
        processConstraintChain(node, children) {
            const documentParent = $NodeList$1.actualParent(children) || node;
            const horizontal = $NodeList$1.partitionRows(children);
            const floating = node.hasAlign(512 /* FLOAT */);
            if (horizontal.length > 1) {
                node.horizontalRows = horizontal;
            }
            if (!node.hasWidth && children.some(item => item.has('width', 32 /* PERCENT */))) {
                node.android('layout_width', 'match_parent');
            }
            const previousSiblings = [];
            let bottomFloating = false;
            for (let i = 0; i < horizontal.length; i++) {
                const partition = horizontal[i];
                const previousRow = horizontal[i - 1];
                const [floatingRight, floatingLeft] = $util$3.partitionArray(partition, item => item.float === 'right' || item.autoMargin.left);
                let aboveRowEnd;
                let currentRowBottom;
                [floatingLeft, floatingRight].forEach(seg => {
                    if (seg.length === 0) {
                        return;
                    }
                    const reverse = seg === floatingRight;
                    const { anchorStart, anchorEnd, chainStart, chainEnd } = getAnchorDirection(reverse);
                    const rowStart = seg[0];
                    const rowEnd = seg[seg.length - 1];
                    rowStart.anchor(anchorStart, 'parent');
                    if (!floating && documentParent.css('textAlign') === 'center') {
                        rowStart.anchorStyle(AXIS_ANDROID.HORIZONTAL, 'spread');
                    }
                    else if (seg.length > 1) {
                        if (reverse) {
                            rowEnd.anchorStyle(AXIS_ANDROID.HORIZONTAL, 'packed', 1);
                        }
                        else {
                            rowStart.anchorStyle(AXIS_ANDROID.HORIZONTAL);
                        }
                    }
                    if (seg.length > 1 || rowEnd.autoMargin.leftRight) {
                        rowEnd.anchor(anchorEnd, 'parent');
                    }
                    for (let j = 0; j < seg.length; j++) {
                        const chain = seg[j];
                        const previous = seg[j - 1];
                        const next = seg[j + 1];
                        if (i === 0) {
                            chain.anchor('top', 'parent');
                        }
                        else if (!bottomFloating && i === horizontal.length - 1) {
                            chain.anchor('bottom', 'parent');
                        }
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
                                            if (reverse && Math.ceil(aboveBefore.linear[anchorEnd]) - Math.floor(documentParent.box[anchorEnd]) < chain.linear.width) {
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
                    $util$3.concatMultiArray(previousSiblings, floatingLeft, floatingRight);
                }
                if (i > 0) {
                    if (aboveRowEnd === undefined) {
                        aboveRowEnd = previousRow[0];
                        for (let k = 1; k < previousRow.length; k++) {
                            if (previousRow[k].linear.bottom >= aboveRowEnd.linear.bottom) {
                                aboveRowEnd = previousRow[k];
                            }
                        }
                    }
                    if (currentRowBottom === undefined) {
                        currentRowBottom = partition[0];
                        for (let k = 1; k < partition.length; k++) {
                            if (partition[k].linear.bottom >= currentRowBottom.linear.bottom) {
                                currentRowBottom = partition[k];
                            }
                        }
                        bottomFloating = false;
                    }
                    currentRowBottom.anchor('topBottom', aboveRowEnd.documentId);
                    aboveRowEnd.anchor('bottomTop', currentRowBottom.documentId);
                    for (const chain of partition) {
                        if (chain !== currentRowBottom) {
                            chain.anchor('top', currentRowBottom.documentId);
                            if (!chain.autoMargin.topBottom) {
                                chain.anchorStyle(AXIS_ANDROID.VERTICAL, 'packed', chain.autoMargin.top ? 1 : 0);
                            }
                            chain.modifyBox(2 /* MARGIN_TOP */, currentRowBottom.marginTop * -1);
                        }
                    }
                }
            }
            this.evaluateAnchors(children);
        }
        withinParentBottom(pageFlow, bottom, boxBottom) {
            return $util$3.withinRange(bottom, boxBottom, this.localSettings.deviations.constraintParentBottomOffset) || pageFlow && bottom > boxBottom;
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
        get containerTypePercent() {
            return {
                containerType: CONTAINER_NODE.CONSTRAINT,
                alignmentType: 8 /* HORIZONTAL */,
                renderType: 0
            };
        }
        get afterInsertNode() {
            const settings = this.userSettings;
            return (target) => {
                target.localSettings = {
                    targetAPI: settings.targetAPI !== undefined ? settings.targetAPI : 28 /* LATEST */,
                    supportRTL: settings.supportRTL !== undefined ? settings.supportRTL : true,
                    floatPrecision: this.localSettings.precision.standardFloat
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

    const $math$2 = squared.lib.math;
    const $util$4 = squared.lib.util;
    const $xml$1 = squared.lib.xml;
    const REGEXP_UNIT = /([">])(-?[\d.]+)px(["<])/g;
    const REGEXP_FILENAME = /^(.+)\/(.+?\.\w+)$/;
    function getFileAssets(items) {
        const result = [];
        for (let i = 0; i < items.length; i += 3) {
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
        for (let i = 0; i < items.length; i += 3) {
            result.push({
                pathname: items[i + 1],
                filename: items[i + 2],
                content: '',
                uri: items[i]
            });
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
    function convertLength(value, dpi = 160, font = false, precision = 3) {
        let result = parseFloat(value);
        if (!isNaN(result)) {
            if (dpi !== 160) {
                result /= dpi / 160;
                return (result !== 0 && result > -1 && result < 1 ? result.toPrecision(precision) : $math$2.truncate(result, precision - 1)) + (font ? 'sp' : 'dp');
            }
            else {
                return Math.round(result) + (font ? 'sp' : 'dp');
            }
        }
        return '0dp';
    }
    function replaceLength(value, dpi = 160, format = 'dp', font = false, precision = 3) {
        if (format === 'dp') {
            return value.replace(REGEXP_UNIT, (match, ...capture) => capture[0] + convertLength(capture[1], dpi, font, precision) + capture[2]);
        }
        return value;
    }
    const caseInsensitive = (a, b) => a.toString().toLowerCase() >= b.toString().toLowerCase() ? 1 : -1;
    class File extends squared.base.File {
        saveAllToDisk(layouts) {
            const files = [];
            for (let i = 0; i < layouts.length; i++) {
                files.push(createFileAsset(layouts[i].pathname, i === 0 ? this.userSettings.outputMainFileName : `${layouts[i].filename}.xml`, layouts[i].content));
            }
            this.saveToDisk($util$4.concatMultiArray(files, getFileAssets(this.resourceStringToXml()), getFileAssets(this.resourceStringArrayToXml()), getFileAssets(this.resourceFontToXml()), getFileAssets(this.resourceColorToXml()), getFileAssets(this.resourceDimenToXml()), getFileAssets(this.resourceStyleToXml()), getFileAssets(this.resourceDrawableToXml()), getImageAssets(this.resourceDrawableImageToXml()), getFileAssets(this.resourceAnimToXml())), this.userSettings.manifestLabelAppName);
        }
        layoutAllToXml(layouts, saveToDisk = false) {
            const result = {};
            const files = [];
            for (let i = 0; i < layouts.length; i++) {
                const layout = layouts[i];
                result[layout.filename] = [layout.content];
                if (saveToDisk) {
                    files.push(createFileAsset(layout.pathname, i === 0 ? this.userSettings.outputMainFileName : `${layout.filename}.xml`, layout.content));
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
                        $util$4.concatArray(files, getImageAssets(result[name]));
                    }
                    else {
                        $util$4.concatArray(files, getFileAssets(result[name]));
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
            result.push($xml$1.replaceTab($xml$1.applyTemplate('resources', STRING_TMPL, data), this.userSettings.insertSpaces), 'res/values', 'strings.xml');
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
                        item: $util$4.objectMap(values, innerText => ({ innerText }))
                    });
                }
                result.push($xml$1.replaceTab($xml$1.applyTemplate('resources', STRINGARRAY_TMPL, data), this.userSettings.insertSpaces), 'res/values', 'string_arrays.xml');
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
                        const [fontFamily, fontStyle, fontWeight] = attr.split('|');
                        let fontName = name;
                        if (fontStyle === 'normal') {
                            if (fontWeight === '400') {
                                fontName += '_normal';
                            }
                            else {
                                fontName += `_${font[attr]}`;
                            }
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
                            this.addAsset('res/font', fontName + '.' + $util$4.fromLastIndexOf(src.srcUrl, '.').toLowerCase(), '', src.srcUrl);
                        }
                    }
                    let output = $xml$1.replaceTab($xml$1.applyTemplate('font-family', FONTFAMILY_TMPL, data), settings.insertSpaces);
                    if (settings.targetAPI < 26 /* OREO */) {
                        output = output.replace(/\s+android:/g, ' app:');
                    }
                    result.push(output, 'res/font', `${name}.xml`);
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
                result.push($xml$1.replaceTab($xml$1.applyTemplate('resources', COLOR_TMPL, data), this.userSettings.insertSpaces), 'res/values', 'colors.xml');
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
                files.push({ data, pathname: 'res/values', filename: 'styles.xml' });
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
                    const match = REGEXP_FILENAME.exec(filename);
                    if (match) {
                        files.push({ data, pathname: match[1], filename: match[2] });
                    }
                }
            }
            for (const style of files) {
                result.push($xml$1.replaceTab(replaceLength($xml$1.applyTemplate('resources', STYLE_TMPL, style.data), settings.resolutionDPI, settings.convertPixels, true), settings.insertSpaces), style.pathname, style.filename);
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
                result.push($xml$1.replaceTab(replaceLength($xml$1.applyTemplate('resources', DIMEN_TMPL, data), this.userSettings.resolutionDPI, this.userSettings.convertPixels), this.userSettings.insertSpaces), 'res/values', 'dimens.xml');
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
                    result.push($xml$1.replaceTab(replaceLength(value, settings.resolutionDPI, settings.convertPixels), settings.insertSpaces), 'res/drawable', `${name}.xml`);
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
                            result.push(images[dpi], `res/drawable-${dpi}`, `${name}.${$util$4.fromLastIndexOf(images[dpi], '.')}`);
                        }
                    }
                    else if (images.mdpi) {
                        result.push(images.mdpi, 'res/drawable', `${name}.${$util$4.fromLastIndexOf(images.mdpi, '.')}`);
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
                    result.push($xml$1.replaceTab(value, this.userSettings.insertSpaces), 'res/anim', `${name}.xml`);
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
    class Accessibility extends squared.base.extensions.Accessibility {
        constructor() {
            super(...arguments);
            this.options = {
                showLabel: false
            };
            this.eventOnly = true;
        }
        afterBaseLayout() {
            for (const node of this.application.processing.cache) {
                if (node.visible && node.hasProcedure($enum$2.NODE_PROCEDURE.ACCESSIBILITY)) {
                    switch (node.controlName) {
                        case CONTAINER_ANDROID.EDIT:
                            if (!node.companion) {
                                [node.previousSibling, node.previousSibling].some((sibling) => {
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

    var $Layout = squared.base.Layout;
    const $const = squared.base.lib.constant;
    const $enum$3 = squared.base.lib.enumeration;
    const $css$3 = squared.lib.css;
    const $dom$2 = squared.lib.dom;
    const $math$3 = squared.lib.math;
    const $util$5 = squared.lib.util;
    const REGEXP_ALIGNSELF = /(start|end|center|baseline)/;
    const REGEXP_JUSTIFYSELF = /(start|end|center|baseline|left|right)/;
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
        const horizontal = direction === 'column';
        const dimension = horizontal ? 'width' : 'height';
        const data = mainData[direction];
        let value = 0;
        if (data.unit.length) {
            for (let i = 0; i < data.unit.length; i++) {
                const unit = data.unit[i];
                if (unit.endsWith('px')) {
                    value += parseFloat(unit);
                }
                else {
                    let size = 0;
                    $util$5.captureMap(mainData.rowData[i], item => item && item.length > 0, item => size = Math.min(size, ...$util$5.objectMap(item, child => child.bounds[dimension])));
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
        value += data.gap * (data.count - 1);
        if (node.contentBox) {
            value += horizontal ? node.borderLeftWidth + node.borderRightWidth : node.borderTopWidth + node.borderBottomWidth;
        }
        else {
            value += horizontal ? node.contentBoxWidth : node.contentBoxHeight;
        }
        return (horizontal ? node.actualWidth : node.actualHeight) - value;
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
                const itemCount = mainData[direction].count;
                const adjusted = new Set();
                function getMarginSize(value) {
                    const marginSize = Math.floor(sizeTotal / value);
                    return [marginSize, sizeTotal - (marginSize * value)];
                }
                switch (alignment) {
                    case 'space-around': {
                        const [marginSize, marginExcess] = getMarginSize(itemCount * 2);
                        for (let i = 0; i < itemCount; i++) {
                            for (const item of new Set($util$5.flatArray(rowData[i]))) {
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
                                for (const item of new Set($util$5.flatArray(rowData[i]))) {
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
                                    else if ($util$5.convertInt(item.android(direction === 'column' ? 'layout_columnSpan' : 'layout_rowSpan')) > 1) {
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
                            for (const item of new Set($util$5.flatArray(rowData[i]))) {
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
            const PADDING_START = direction === 'column' ? 256 /* PADDING_LEFT */ : 32 /* PADDING_TOP */;
            const sizeTotal = getGridSize(mainData, direction, node);
            if (sizeTotal > 0) {
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
            let renderAs;
            let outputAs;
            if (mainData && cellData) {
                function applyLayout(item, direction, dimension) {
                    const data = mainData[direction];
                    const cellStart = cellData[`${direction}Start`];
                    const cellSpan = cellData[`${direction}Span`];
                    const dimensionA = $util$5.capitalize(dimension);
                    const minDimension = `min${dimensionA}`;
                    let size = 0;
                    let minSize = 0;
                    let fitContent = false;
                    let minUnitSize = 0;
                    let sizeWeight = 0;
                    if (data.unit.length && data.unit.every(value => value === 'auto')) {
                        if (dimension === 'width') {
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
                        if (unit === 'auto' || unit === 'min-content' || unit === 'max-content') {
                            if (cellSpan < data.unit.length && (!parent.has(dimension) || data.unit.some(value => $css$3.isLength(value)) || unit === 'min-content')) {
                                size = node.bounds[dimension];
                                minSize = 0;
                                sizeWeight = 0;
                            }
                            else if (dimension === 'width') {
                                size = 0;
                                minSize = 0;
                                sizeWeight = 0.01;
                            }
                            break;
                        }
                        else if ($css$3.isPercent(unit)) {
                            sizeWeight += parseFloat(unit) / 100;
                            minSize = size;
                            size = 0;
                        }
                        else if (unit.endsWith('fr')) {
                            if (dimension === 'width' || node.hasHeight) {
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
                        if (data.autoFill && size === 0 && mainData[direction === 'column' ? 'row' : 'column'].count === 1) {
                            size = Math.max(node.actualWidth, minUnitSize);
                            sizeWeight = 0;
                        }
                        else {
                            minSize = minUnitSize;
                        }
                    }
                    item.android(`layout_${direction}`, cellStart.toString());
                    if (cellSpan > 1) {
                        item.android(`layout_${direction}Span`, cellSpan.toString());
                    }
                    if (minSize > 0 && !item.has(minDimension)) {
                        item.css(minDimension, $css$3.formatPX(minSize), true);
                    }
                    if (sizeWeight > 0) {
                        item.android(`layout_${direction}Weight`, $math$3.truncate(sizeWeight, node.localSettings.floatPrecision));
                        if (!item.has(dimension, 2 /* LENGTH */ | 32 /* PERCENT */)) {
                            item.android(`layout_${dimension}`, '0px');
                            item.mergeGravity('layout_gravity', direction === 'column' ? 'fill_horizontal' : 'fill_vertical');
                        }
                    }
                    else if (size > 0) {
                        const maxDimension = `max${dimensionA}`;
                        if (item.contentBox) {
                            size -= item[`contentBox${dimensionA}`];
                        }
                        if (fitContent && !item.has(maxDimension)) {
                            item.css(maxDimension, $css$3.formatPX(size), true);
                            item.mergeGravity('layout_gravity', direction === 'column' ? 'fill_horizontal' : 'fill_vertical');
                        }
                        else if (!item.has(dimension)) {
                            item.css(dimension, $css$3.formatPX(size), true);
                        }
                    }
                    return [cellStart, cellSpan];
                }
                const alignSelf = node.flexbox.alignSelf;
                const justifySelf = node.flexbox.justifySelf;
                if (REGEXP_ALIGNSELF.test(alignSelf) || REGEXP_JUSTIFYSELF.test(justifySelf)) {
                    renderAs = this.application.createNode($dom$2.createElement(node.actualParent && node.actualParent.element));
                    renderAs.tagName = node.tagName;
                    renderAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    renderAs.inherit(node, 'initial', 'base');
                    renderAs.resetBox(30 /* MARGIN */ | 480 /* PADDING */);
                    renderAs.exclude({
                        procedure: $enum$3.NODE_PROCEDURE.NONPOSITIONAL,
                        resource: $enum$3.NODE_RESOURCE.BOX_STYLE | $enum$3.NODE_RESOURCE.ASSET
                    });
                    parent.appendTry(node, renderAs);
                    renderAs.render(parent);
                    node.inheritBox(30 /* MARGIN */, renderAs);
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
                        node.mergeGravity('layout_gravity', 'center_horizontal');
                        inlineWidth = true;
                    }
                    if (!node.hasWidth) {
                        node.android('layout_width', inlineWidth ? 'wrap_content' : 'match_parent', false);
                    }
                    if (alignSelf.endsWith('start') || alignSelf.endsWith('baseline')) {
                        node.mergeGravity('layout_gravity', 'top');
                    }
                    else if (alignSelf.endsWith('end')) {
                        node.mergeGravity('layout_gravity', 'bottom');
                    }
                    else if (alignSelf.endsWith('center')) {
                        node.mergeGravity('layout_gravity', 'center_vertical');
                    }
                    else if (!node.hasHeight) {
                        node.android('layout_height', 'match_parent', false);
                    }
                    node.outerWrapper = renderAs;
                    node.parent = renderAs;
                    outputAs = this.application.renderNode(new $Layout(parent, renderAs, CONTAINER_NODE.FRAME, 2048 /* SINGLE */, renderAs.children));
                }
                const target = renderAs || node;
                applyLayout(target, 'column', 'width');
                if (!target.has('width')) {
                    target.mergeGravity('layout_gravity', 'fill_horizontal');
                }
                const [rowStart, rowSpan] = applyLayout(target, 'row', 'height');
                if (mainData.alignContent === 'normal' && rowSpan === 1 && mainData.rowSpanMultiple[rowStart] === true && (!mainData.row.unit[rowStart] || mainData.row.unit[rowStart] === 'auto') && node.initial.bounds && node.bounds.height > node.initial.bounds.height) {
                    target.css('minHeight', $css$3.formatPX(node.actualHeight), true);
                }
                else if (!target.has('height') && !(mainData.row.count === 1 && mainData.alignContent === 'space-between')) {
                    target.mergeGravity('layout_gravity', 'fill_vertical');
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
            const mainData = node.data($const.EXT_NAME.CSS_GRID, 'mainData');
            if (mainData) {
                if (node.hasWidth && mainData.justifyContent !== 'normal') {
                    setContentSpacing(mainData, node, mainData.justifyContent, 'column');
                }
                if (node.hasHeight && mainData.alignContent !== 'normal') {
                    setContentSpacing(mainData, node, mainData.alignContent, 'row');
                    if (mainData.rowWeight.length > 1) {
                        for (let i = 0; i < mainData.row.count; i++) {
                            if (mainData.rowWeight[i] > 0) {
                                const precision = this.application.controllerHandler.localSettings.precision.standardFloat;
                                for (let j = 0; j < mainData.rowData[i].length; j++) {
                                    const item = mainData.rowData[i][j];
                                    if (item) {
                                        for (let column of item) {
                                            if (column.outerWrapper) {
                                                column = column.outerWrapper;
                                            }
                                            column.android('layout_rowWeight', $math$3.truncate(mainData.rowWeight[i], precision).toString());
                                            column.android('layout_height', '0px');
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (mainData.column.normal && !mainData.column.unit.includes('auto')) {
                    const columnGap = mainData.column.gap * (mainData.column.count - 1);
                    if (columnGap > 0) {
                        if (node.renderParent && !node.renderParent.hasAlign(4 /* AUTO_LAYOUT */)) {
                            node.cssPX('minWidth', columnGap);
                            node.cssPX('width', columnGap, false, true);
                        }
                        if (!node.has('width') && node.has('maxWidth')) {
                            node.css('width', $css$3.formatPX(node.actualWidth + columnGap), true);
                        }
                    }
                }
            }
        }
        postOptimize(node) {
            const mainData = node.data($const.EXT_NAME.CSS_GRID, 'mainData');
            if (mainData) {
                const controller = this.application.controllerHandler;
                const lastChild = Array.from(mainData.children)[mainData.children.size - 1];
                if (mainData.column.unit.length && mainData.column.unit.every(value => $css$3.isPercent(value))) {
                    const percentTotal = mainData.column.unit.reduce((a, b) => a + parseFloat(b), 0);
                    if (percentTotal < 100) {
                        node.android('columnCount', (mainData.column.count + 1).toString());
                        for (let i = 0; i < mainData.row.count; i++) {
                            controller.addAfterOutsideTemplate(lastChild.id, controller.renderSpace($css$3.formatPercent(100 - percentTotal), 'wrap_content', 0, 0, createViewAttribute(undefined, {
                                [node.localizeString(BOX_ANDROID.MARGIN_LEFT)]: $css$3.formatPX(mainData.column.gap),
                                layout_row: i.toString(),
                                layout_column: mainData.column.count.toString()
                            })));
                        }
                    }
                }
                for (let i = 0; i < mainData.emptyRows.length; i++) {
                    const item = mainData.emptyRows[i];
                    if (item) {
                        for (let j = 0; j < item.length; j++) {
                            if (item[j] === 1) {
                                controller.addAfterOutsideTemplate(lastChild.id, controller.renderSpace('wrap_content', $css$3.formatPX(mainData.row.gap), 0, 0, createViewAttribute(undefined, { layout_row: i.toString(), layout_column: j.toString() })));
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
    const $math$4 = squared.lib.math;
    const $util$6 = squared.lib.util;
    const CHAIN_MAP = {
        leftTop: ['left', 'top'],
        rightBottom: ['right', 'bottom'],
        rightLeftBottomTop: ['rightLeft', 'bottomTop'],
        leftRightTopBottom: ['leftRight', 'topBottom'],
        widthHeight: ['Width', 'Height'],
        horizontalVertical: [AXIS_ANDROID.HORIZONTAL, AXIS_ANDROID.VERTICAL]
    };
    function adjustGrowRatio(parent, items, attr) {
        const horizontal = attr === 'width';
        const hasDimension = `has${$util$6.capitalize(attr)}`;
        let percent = parent[hasDimension] > 0 || parent.blockStatic && $util$6.withinRange(parent.parseUnit(parent.css(horizontal ? 'maxWidth' : 'maxHeight')), parent.box.width);
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
        const result = items.reduce((a, b) => a + b.flexbox.grow, 0);
        let growShrinkType = 0;
        function setPercentage(item) {
            item.flexbox.basis = `${item.bounds[attr] / parent.box[attr] * 100}%`;
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
                    const basis = item.flexbox.basis === 'auto' ? item.parseUnit(item.css(attr), horizontal) : item.parseUnit(item.flexbox.basis, horizontal);
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
        if (growShrinkType === 0 && horizontal) {
            for (const item of items) {
                if (item.cascadeSome(child => child.multiline && child.ascend(false, above => above[hasDimension], parent).length === 0)) {
                    setPercentage(item);
                }
            }
        }
        return result;
    }
    function getAutoMargin(node) {
        return node.innerWrapped ? node.innerWrapped.autoMargin : node.autoMargin;
    }
    class Flexbox extends squared.base.extensions.Flexbox {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data($const$1.EXT_NAME.FLEXBOX, 'mainData');
            const layout = new $Layout$1(parent, node, 0, 4 /* AUTO_LAYOUT */);
            layout.itemCount = node.length;
            layout.rowCount = mainData.rowCount;
            layout.columnCount = mainData.columnCount;
            if (mainData.directionRow && (mainData.rowCount === 1 || node.hasHeight) || mainData.directionColumn && (mainData.columnCount === 1 || node.hasWidth) || node.some(item => !item.pageFlow)) {
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
        processChild(node, parent) {
            if (node.hasAlign(128 /* SEGMENTED */)) {
                return {
                    output: this.application.renderNode(new $Layout$1(parent, node, CONTAINER_NODE.CONSTRAINT, 4 /* AUTO_LAYOUT */, node.children)),
                    complete: true
                };
            }
            else if (node.autoMargin.horizontal || node.autoMargin.vertical && node.hasHeight) {
                const mainData = parent.data($const$1.EXT_NAME.FLEXBOX, 'mainData');
                if (mainData) {
                    const index = mainData.children.findIndex(item => item === node);
                    if (index !== -1) {
                        const container = this.application.controllerHandler.createNodeWrapper(node, parent);
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
                            node.android('layout_width', 'wrap_content');
                        }
                        return {
                            parent: container,
                            renderAs: container,
                            outputAs: this.application.renderNode(new $Layout$1(parent, container, CONTAINER_NODE.FRAME, 2048 /* SINGLE */, container.children))
                        };
                    }
                }
            }
            return undefined;
        }
        postBaseLayout(node) {
            const mainData = node.data($const$1.EXT_NAME.FLEXBOX, 'mainData');
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
                                    item.android('layout_width', 'match_parent');
                                    chainHorizontal.push(pageFlow);
                                }
                                else {
                                    item.android('layout_height', 'match_parent');
                                    if (previous) {
                                        let largest = previous[0];
                                        for (let j = 1; j < previous.length; j++) {
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
                    function setLayoutWeight(chain, value) {
                        chain.app(`layout_constraint${$util$6.capitalize(orientation)}_weight`, $math$4.truncate(value, chain.localSettings.floatPrecision));
                        chain.android(`layout_${WH.toLowerCase()}`, '0px');
                    }
                    for (let i = 0; i < partition.length; i++) {
                        const seg = partition[i];
                        const segStart = seg[0];
                        const segEnd = seg[seg.length - 1];
                        const opposing = seg === segmented;
                        const justifyContent = !opposing && seg.every(item => item.flexbox.grow === 0);
                        const spreadInside = justifyContent && (mainData.justifyContent === 'space-between' || mainData.justifyContent === 'space-around' && seg.length > 1);
                        const layoutWeight = [];
                        let maxSize = 0;
                        let growAvailable = 0;
                        let parentEnd = true;
                        let baseline;
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
                            if (seg.length > 1) {
                                const sizeMap = new Set($util$6.objectMap(seg, item => item.initial.bounds ? item.initial.bounds[HWL] : 0));
                                if (sizeMap.size > 1) {
                                    maxSize = $math$4.maxArray(Array.from(sizeMap));
                                }
                            }
                        }
                        for (let j = 0; j < seg.length; j++) {
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
                                if (parentEnd && seg.length > 1 && dimensionInverse) {
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
                                                gravity = 'center_horizontal';
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
                                                gravity = 'center_vertical';
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
                                            if (baseline === undefined) {
                                                baseline = $NodeList$2.baseline(seg)[0];
                                            }
                                            if (baseline && chain !== baseline) {
                                                chain.anchor('baseline', baseline.documentId);
                                            }
                                        }
                                        break;
                                    case 'center':
                                        chain.anchorParent(orientationInverse);
                                        chain.anchorStyle(orientationInverse, 'packed', 0.5);
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
                                                    childContent.mergeGravity('layout_gravity', horizontal ? 'center_vertical' : 'center_horizontal');
                                                }
                                                else {
                                                    chain.anchorParent(orientationInverse);
                                                }
                                                break;
                                            case 'space-between':
                                                if (spreadInside && seg.length === 2) {
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
                                                        childContent.mergeGravity('layout_gravity', horizontal ? 'center_vertical' : 'center_horizontal');
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
                                                        if (maxSize === 0 && (!dimension && seg.length > 1 || mainData.wrap)) {
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
                                    case 'left':
                                        if (!horizontal) {
                                            break;
                                        }
                                    case 'start':
                                    case 'flex-start':
                                        segStart.anchorStyle(orientation);
                                        break;
                                    case 'center':
                                        if (seg.length > 1) {
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
                                        if (seg.length === 1) {
                                            segEnd.anchorDelete(RB);
                                        }
                                        break;
                                    case 'space-evenly':
                                        if (seg.length > 1) {
                                            segStart.anchorStyle(orientation, 'spread');
                                            const HVU = $util$6.capitalize(orientation);
                                            for (const item of seg) {
                                                item.app(`layout_constraint${HVU}_weight`, (item.flexbox.grow || 1).toString());
                                            }
                                        }
                                        else {
                                            centered = true;
                                        }
                                        break;
                                    case 'space-around':
                                        if (seg.length > 1) {
                                            const controller = this.application.controllerHandler;
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
                            if (spreadInside) {
                                segStart.anchorStyle(orientation, 'spread_inside', 0, false);
                            }
                            else if (!centered && (seg.length > 1 || mainData.directionReverse)) {
                                segStart.anchorStyle(orientation, 'packed', mainData.directionReverse ? 1 : 0, false);
                            }
                        }
                    }
                });
            }
        }
    }

    var $Layout$2 = squared.base.Layout;
    const $const$2 = squared.base.lib.constant;
    const $enum$5 = squared.base.lib.enumeration;
    const $css$4 = squared.lib.css;
    const $util$7 = squared.lib.util;
    function transferData(parent, siblings) {
        const data = squared.base.extensions.Grid.createDataCellAttribute();
        for (const item of siblings) {
            const source = item.data($const$2.EXT_NAME.GRID, 'cellData');
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
                item.data($const$2.EXT_NAME.GRID, 'cellData', null);
            }
        }
        parent.data($const$2.EXT_NAME.GRID, 'cellData', data);
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
                const siblings = cellData.siblings ? cellData.siblings.slice(0) : undefined;
                let layout;
                if (siblings) {
                    siblings.unshift(node);
                    layout = this.application.controllerHandler.processLayoutHorizontal(new $Layout$2(parent, this.application.controllerHandler.createNodeGroup(node, siblings, parent), 0, cellData.block ? 64 /* BLOCK */ : 0, siblings)).layout;
                    node = layout.node;
                    if (cellData.block) {
                        node.css('display', 'block');
                    }
                    else {
                        for (const item of siblings) {
                            if (item.has('width', 32 /* PERCENT */)) {
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
        postBaseLayout(node) {
            if (node.css('borderCollapse') !== 'collapse') {
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
                                            controller.addAfterOutsideTemplate(item.id, controller.renderSpace('match_parent', $css$4.formatPX(heightBottom), mainData.columnCount));
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
                $util$7.captureMap(node.renderChildren, item => item.inlineFlow || !item.blockStatic, item => maxRight = Math.max(maxRight, item.linear.right));
                if ($util$7.withinRange(node.box.right, maxRight)) {
                    node.android('layout_width', 'wrap_content');
                }
            }
        }
    }

    var $Layout$3 = squared.base.Layout;
    const $const$3 = squared.base.lib.constant;
    const $enum$6 = squared.base.lib.enumeration;
    const $css$5 = squared.lib.css;
    const $dom$3 = squared.lib.dom;
    const $util$8 = squared.lib.util;
    const MINWIDTH_INSIDE = 24;
    const PADDINGRIGHT_DFN = 8;
    class List extends squared.base.extensions.List {
        processNode(node, parent) {
            super.processNode(node, parent);
            const layout = new $Layout$3(parent, node, 0, 0, node.children);
            if (layout.linearY && !layout.linearX) {
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
                let minWidth = node.marginLeft;
                let columnCount = 0;
                let adjustPadding = false;
                let resetPadding = null;
                node.modifyBox(16 /* MARGIN_LEFT */, null);
                if (parent.is(CONTAINER_NODE.GRID)) {
                    columnCount = $util$8.convertInt(parent.android('columnCount'));
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
                let ordinal = !mainData.ordinal ? node.find(item => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft) : undefined;
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
                    minWidth += ordinal.marginLeft;
                    if (minWidth > 0 && !ordinal.hasWidth) {
                        ordinal.android('minWidth', $css$5.formatPX(minWidth));
                    }
                    ordinal.modifyBox(16 /* MARGIN_LEFT */, null);
                    this.application.addLayoutTemplate(parent, ordinal, this.application.renderNode(layout));
                }
                else {
                    const columnWeight = columnCount > 0 ? '0' : '';
                    const inside = node.css('listStylePosition') === 'inside';
                    let gravity = 'right';
                    let top = 0;
                    let left = 0;
                    let image;
                    if (mainData.imageSrc !== '') {
                        if (mainData.imagePosition) {
                            const position = $css$5.getBackgroundPosition(mainData.imagePosition, node.actualDimension, node.fontSize);
                            top = position.top;
                            left = position.left;
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
                            }
                            minWidth = 0;
                        }
                        image = Resource.addImageURL(mainData.imageSrc);
                    }
                    let paddingRight = 0;
                    if (gravity === 'left') {
                        minWidth += node.paddingLeft - left;
                        node.modifyBox(256 /* PADDING_LEFT */, null);
                    }
                    else {
                        const length = mainData.ordinal ? mainData.ordinal.length : 1;
                        paddingRight = Math.max(minWidth / (image ? 6 : length * 4), 4);
                    }
                    const options = createViewAttribute(undefined, { layout_columnWeight: columnWeight });
                    const element = $dom$3.createElement(node.actualParent && node.actualParent.element, image ? 'img' : 'span');
                    ordinal = this.application.createNode(element);
                    if (inside) {
                        controller.addBeforeOutsideTemplate(ordinal.id, controller.renderNodeStatic(CONTAINER_ANDROID.SPACE, createViewAttribute(undefined, { minWidth: $css$5.formatPX(minWidth), layout_columnWeight: columnWeight })));
                        minWidth = MINWIDTH_INSIDE;
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
                                scaleType: !inside && gravity === 'right' ? 'fitEnd' : 'fitStart',
                                baselineAlignBottom: adjustPadding ? 'true' : ''
                            });
                            ordinal.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                            element.src = $css$5.resolveURL(mainData.imageSrc);
                        }
                        else if (mainData.ordinal) {
                            element.innerHTML = mainData.ordinal;
                            ordinal.setInlineText(true);
                            ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                            if (node.tagName === 'DFN') {
                                minWidth += PADDINGRIGHT_DFN;
                                ordinal.modifyBox(64 /* PADDING_RIGHT */, PADDINGRIGHT_DFN);
                            }
                        }
                        else {
                            ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                            node.modifyBox(256 /* PADDING_LEFT */, null);
                        }
                        ordinal.inherit(node, 'textStyle');
                        ordinal.cssApply({
                            minWidth: minWidth > 0 ? $css$5.formatPX(minWidth) : '',
                            marginTop: node.marginTop !== 0 ? $css$5.formatPX(node.marginTop) : '',
                            paddingTop: node.paddingTop > 0 ? $css$5.formatPX(node.paddingTop) : '',
                            paddingRight: paddingRight > 0 && gravity === 'right' ? $css$5.formatPX(paddingRight) : '',
                            paddingLeft: paddingRight > 0 && gravity === 'left' && (!image || mainData.imagePosition) ? $css$5.formatPX(paddingRight) : '',
                            fontSize: mainData.ordinal && !mainData.ordinal.endsWith('.') ? $css$5.formatPX(ordinal.toInt('fontSize') * 0.75) : '',
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
                        ordinal.positioned = true;
                        ordinal.render(parent);
                        this.application.addLayoutTemplate(parent, ordinal, {
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
                if (adjustPadding) {
                    if (resetPadding === null || resetPadding <= 0) {
                        parent.modifyBox(parent.paddingLeft > 0 ? 256 /* PADDING_LEFT */ : 16 /* MARGIN_LEFT */, null);
                    }
                    if (typeof resetPadding === 'number' && resetPadding < 0) {
                        parent.modifyBox(16 /* MARGIN_LEFT */, resetPadding);
                    }
                }
                if (node.length && node.every(item => item.baseline)) {
                    const layout = new $Layout$3(parent, node, CONTAINER_NODE.LINEAR, 0, node.children);
                    layout.add(layout.length === 1 || layout.linearX ? 8 /* HORIZONTAL */ : 16 /* VERTICAL */);
                    return {
                        output: this.application.renderNode(layout),
                        next: true
                    };
                }
            }
            return undefined;
        }
        postOptimize(node) {
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
    const $css$6 = squared.lib.css;
    class Sprite extends squared.base.extensions.Sprite {
        processNode(node, parent) {
            const mainData = node.data($const$4.EXT_NAME.SPRITE, 'mainData');
            if (mainData) {
                const container = this.application.createNode(node.element);
                container.inherit(node, 'initial', 'base', 'styleMap');
                container.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                container.exclude({
                    procedure: $enum$7.NODE_PROCEDURE.NONPOSITIONAL,
                    resource: $enum$7.NODE_RESOURCE.IMAGE_SOURCE
                });
                parent.appendTry(node, container);
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
                    width: $css$6.formatPX(mainData.width),
                    height: $css$6.formatPX(mainData.height),
                    marginTop: $css$6.formatPX(mainData.position.y),
                    marginRight: '0px',
                    marginBottom: '0px',
                    marginLeft: $css$6.formatPX(mainData.position.x),
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
                node.outerWrapper = container;
                container.innerWrapped = node;
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

    const $enum$8 = squared.base.lib.enumeration;
    class Substitute extends squared.base.extensions.Substitute {
        processNode(node, parent) {
            node.containerType = node.blockStatic ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE;
            node.alignmentType = 8192 /* CUSTOM */;
            return super.processNode(node, parent);
        }
        postOptimize(node) {
            node.apply(Resource.formatOptions(createViewAttribute(this.options[node.elementId]), this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
        }
    }

    var $Layout$5 = squared.base.Layout;
    const $const$5 = squared.base.lib.constant;
    const $enum$9 = squared.base.lib.enumeration;
    const $css$7 = squared.lib.css;
    const $util$9 = squared.lib.util;
    class Table extends squared.base.extensions.Table {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data($const$5.EXT_NAME.TABLE, 'mainData');
            if (mainData) {
                let requireWidth = false;
                if (mainData.columnCount > 1) {
                    requireWidth = !!node.data($const$5.EXT_NAME.TABLE, 'expand');
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
                                    const percent = $util$9.convertFloat(item.data($const$5.EXT_NAME.TABLE, 'percent')) / 100;
                                    if (percent > 0) {
                                        item.android('layout_width', '0px');
                                        item.android('layout_columnWeight', $util$9.trimEnd(percent.toPrecision(3), '0'));
                                        requireWidth = !node.hasWidth;
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
                                    if (item.has('width') && item.actualWidth < item.bounds.width) {
                                        item.android('layout_width', $css$7.formatPX(item.bounds.width));
                                    }
                                }
                            }
                        }
                        if (item.textElement && !/[\s\n\-]/.test(item.textContent.trim())) {
                            item.android('maxLines', '1');
                        }
                    });
                    if (requireWidth) {
                        const above = node.ascend(false, item => item.hasWidth);
                        if (above.length && node.actualWidth >= above[0].actualWidth) {
                            node.android('layout_width', 'match_parent');
                        }
                        else {
                            node.css('width', $css$7.formatPX(node.actualWidth), true);
                        }
                    }
                }
                if (!requireWidth && node.has('width') && node.actualWidth < Math.floor(node.bounds.width)) {
                    if (mainData.layoutFixed) {
                        node.android('width', $css$7.formatPX(node.bounds.width), true);
                    }
                    else {
                        if (!node.has('minWidth')) {
                            node.android('minWidth', $css$7.formatPX(node.actualWidth));
                        }
                        node.css('width', 'auto', true);
                    }
                }
                if (node.has('height') && node.actualHeight < Math.floor(node.bounds.height)) {
                    if (!node.has('minHeight')) {
                        node.android('minHeight', $css$7.formatPX(node.actualHeight));
                    }
                    node.css('height', 'auto', true);
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
            const rowSpan = $util$9.convertInt(node.data($const$5.EXT_NAME.TABLE, 'rowSpan'));
            const columnSpan = $util$9.convertInt(node.data($const$5.EXT_NAME.TABLE, 'colSpan'));
            const spaceSpan = $util$9.convertInt(node.data($const$5.EXT_NAME.TABLE, 'spaceSpan'));
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
        postOptimize(node) {
            const layoutWidth = $util$9.convertInt(node.android('layout_width'));
            if (layoutWidth > 0) {
                if (node.bounds.width > layoutWidth) {
                    node.android('layout_width', $css$7.formatPX(node.bounds.width));
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
    const $enum$a = squared.base.lib.enumeration;
    class VerticalAlign extends squared.base.extensions.VerticalAlign {
        processNode(node, parent) {
            super.processNode(node, parent);
            return {
                output: this.application.renderNode(new $Layout$6(parent, node, CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */, node.children))
            };
        }
    }

    class WhiteSpace extends squared.base.extensions.WhiteSpace {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
    }

    var $Layout$7 = squared.base.Layout;
    const $enum$b = squared.base.lib.enumeration;
    const $css$8 = squared.lib.css;
    const $util$a = squared.lib.util;
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
            node.exclude({ procedure: $enum$b.NODE_PROCEDURE.CONSTRAINT });
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
                    if ($util$a.withinRange(item.linear.left, node.box.left)) {
                        alignment.push('left');
                    }
                    if ($util$a.withinRange(item.linear.top, node.box.top)) {
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
                            item.app('layout_constraintCircleRadius', $css$8.formatPX(radius));
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
    const $enum$c = squared.base.lib.enumeration;
    const $util$b = squared.lib.util;
    const getFixedNodes = (node) => node.filter(item => !item.pageFlow && item.leftTopAxis);
    class Fixed extends squared.base.Extension {
        condition(node) {
            if (node.naturalElement && (node.documentBody || node.contentBoxWidth > 0 || node.contentBoxHeight > 0)) {
                const fixed = getFixedNodes(node);
                if (fixed.length) {
                    const paddingTop = node.paddingTop + (node.documentBody ? node.marginTop : 0);
                    const paddingRight = node.paddingRight + (node.documentBody ? node.marginRight : 0);
                    const paddingBottom = node.paddingBottom + (node.documentBody ? node.marginBottom : 0);
                    const paddingLeft = node.paddingLeft + (node.documentBody ? node.marginLeft : 0);
                    let valid = false;
                    let fixedRight = false;
                    let fixedBottom = false;
                    for (const item of fixed) {
                        if (item.has('top')) {
                            if (item.top >= 0 && item.top < paddingTop) {
                                valid = true;
                            }
                        }
                        else {
                            if (item.bottom >= 0 && item.has('bottom') && (item.bottom < paddingBottom || node.documentBody && node.has('height'))) {
                                valid = true;
                                if (item.position === 'fixed') {
                                    fixedBottom = true;
                                }
                            }
                        }
                        if (item.has('left')) {
                            if (item.left >= 0 && item.left < paddingLeft) {
                                valid = true;
                            }
                        }
                        else {
                            if (item.right >= 0 && item.has('right') && (item.right < paddingRight || node.documentBody && node.has('width'))) {
                                valid = true;
                                if (item.position === 'fixed') {
                                    fixedRight = true;
                                }
                            }
                        }
                    }
                    if (valid) {
                        if (node.documentBody) {
                            node.data(EXT_ANDROID.DELEGATE_FIXED, 'mainData', { fixedRight, fixedBottom });
                        }
                        return true;
                    }
                }
            }
            return false;
        }
        processNode(node, parent) {
            const [children, nested] = $util$b.partitionArray(getFixedNodes(node), item => item.absoluteParent === node);
            $util$b.concatArray($util$b.sortArray(children, true, 'zIndex', 'siblingIndex'), $util$b.sortArray(nested, true, 'zIndex', 'siblingIndex'));
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
                    procedure: $enum$c.NODE_PROCEDURE.NONPOSITIONAL,
                    resource: $enum$c.NODE_RESOURCE.BOX_STYLE | $enum$c.NODE_RESOURCE.ASSET
                });
                if (node.documentBody) {
                    const mainData = node.data(EXT_ANDROID.DELEGATE_FIXED, 'mainData');
                    if (mainData && (mainData.fixedRight || mainData.fixedBottom)) {
                        if (node.has('width')) {
                            container.css('width', node.css('width'));
                        }
                        if (node.has('height')) {
                            container.css('height', node.css('height'));
                        }
                        node.cssApply({
                            display: 'block',
                            width: 'auto',
                            height: 'auto',
                            float: 'none'
                        }, true);
                        if (mainData.fixedRight) {
                            node.android('layout_width', 'match_parent');
                        }
                        if (mainData.fixedBottom) {
                            node.android('layout_height', 'match_parent');
                        }
                    }
                }
                container.outerWrapper = node;
                children.push(container);
                node.retain(children);
                node.resetBox(480 /* PADDING */ | (node.documentBody ? 30 /* MARGIN */ : 0), container, true);
                node.innerWrapped = container;
                return {
                    output: this.application.renderNode(new $Layout$8(parent, node, CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, children))
                };
            }
            return undefined;
        }
        postBaseLayout(node) {
            if (node.hasWidth && node.outerWrapper && node.documentBody && node.some(item => item.has('right'))) {
                const width = node.cssInitial('width', true);
                const minWidth = node.cssInitial('minWidth', true);
                node.cssApply({ width: 'auto', minWidth: 'auto' }, true);
                node.outerWrapper.cssApply({ width, minWidth }, true);
                node.android('layout_width', 'match_parent');
            }
        }
    }

    var $Layout$9 = squared.base.Layout;
    const $enum$d = squared.base.lib.enumeration;
    const $css$9 = squared.lib.css;
    class MaxWidthHeight extends squared.base.Extension {
        condition(node, parent) {
            return !parent.layoutConstraint && (!node.support.maxWidth && node.has('maxWidth') && node.css('width') !== '100%' && !parent.has('columnCount') && !parent.has('columnWidth') || !node.support.maxHeight && node.has('maxHeight') && node.css('height') !== '100%');
        }
        processNode(node, parent) {
            const absolute = node.filter(item => !item.pageFlow && (item.absoluteParent !== node || node.documentRoot));
            let container;
            if (absolute.length) {
                container = this.application.controllerHandler.createNodeWrapper(node, parent, absolute, CONTAINER_ANDROID.CONSTRAINT, CONTAINER_NODE.CONSTRAINT);
            }
            else {
                container = this.application.controllerHandler.createNodeWrapper(node, parent, undefined, CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
            }
            container.inherit(node, 'styleMap');
            let maxWidth = node.css('maxWidth');
            let maxHeight = node.css('maxHeight');
            if ($css$9.isLength(maxWidth, true)) {
                if (!node.has('width')) {
                    node.android('layout_width', node.some(item => item.blockStatic) ? 'match_parent' : 'wrap_content');
                }
                maxWidth = $css$9.formatPX(node.parseUnit(maxWidth) + ($css$9.isPercent(maxWidth) ? 0 : node.contentBoxWidth + Math.max(node.marginLeft, 0) + Math.max(node.marginRight, 0)));
                container.cssApply({ width: maxWidth, maxWidth }, true);
                if (parent.layoutElement) {
                    node.autoMargin.horizontal = false;
                    node.autoMargin.left = false;
                    node.autoMargin.right = false;
                    node.autoMargin.leftRight = false;
                }
            }
            if ($css$9.isLength(maxHeight, true)) {
                if (!node.has('height')) {
                    node.android('layout_height', 'wrap_content');
                }
                maxHeight = $css$9.formatPX(node.parseUnit(maxHeight) + ($css$9.isPercent(maxHeight) ? 0 : node.contentBoxHeight + Math.max(node.marginTop, 0) + Math.max(node.marginBottom, 0)));
                container.cssApply({ height: maxHeight, maxHeight }, true);
                if (parent.layoutElement) {
                    node.autoMargin.vertical = false;
                    node.autoMargin.top = false;
                    node.autoMargin.bottom = false;
                    node.autoMargin.topBottom = false;
                }
            }
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new $Layout$9(parent, container, container.containerType, 2048 /* SINGLE */, container.children))
            };
        }
    }

    var $Layout$a = squared.base.Layout;
    const $enum$e = squared.base.lib.enumeration;
    class NegativeViewport extends squared.base.Extension {
        condition(node, parent) {
            return !node.pageFlow && parent.documentBody && (Math.ceil(node.linear.left) < Math.floor(parent.box.left) && (node.left < 0 || node.marginLeft < 0 || !node.has('left') && node.right > 0) ||
                Math.floor(node.linear.right) > Math.ceil(parent.box.right) && (node.left > 0 || node.marginLeft > 0 || !node.has('left') && node.right < 0) ||
                Math.ceil(node.linear.top) < Math.floor(parent.box.top) && (node.top < 0 || node.marginTop < 0 || !node.has('top') && node.bottom > 0) ||
                Math.floor(node.linear.bottom) > Math.ceil(parent.box.bottom) && (node.top > 0 || node.marginTop > 0 || !node.has('top') && node.bottom < 0) && parent.has('height'));
        }
        processNode(node, parent) {
            const container = this.application.controllerHandler.createNodeWrapper(node, parent);
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new $Layout$a(parent, container, CONTAINER_NODE.FRAME, 2048 /* SINGLE */, container.children)),
                include: true
            };
        }
    }

    var $Layout$b = squared.base.Layout;
    const $enum$f = squared.base.lib.enumeration;
    const $css$a = squared.lib.css;
    function outsideX(node, parent) {
        return !node.pageFlow && node.absoluteParent === parent && (node.left < 0 || !node.has('left') && node.right < 0);
    }
    class NegativeX extends squared.base.Extension {
        condition(node) {
            return this.application.userSettings.supportNegativeLeftTop && !node.documentRoot && node.css('overflowX') !== 'hidden' && node.some((item) => outsideX(item, node));
        }
        processNode(node, parent) {
            const outside = node.filter((item) => outsideX(item, node));
            const container = this.application.controllerHandler.createNodeWrapper(node, parent, outside, CONTAINER_ANDROID.CONSTRAINT, CONTAINER_NODE.CONSTRAINT);
            if (node.marginTop > 0) {
                container.modifyBox(2 /* MARGIN_TOP */, node.marginTop);
                node.modifyBox(2 /* MARGIN_TOP */, null);
            }
            if (node.marginBottom > 0) {
                container.modifyBox(8 /* MARGIN_BOTTOM */, node.marginBottom);
                node.modifyBox(8 /* MARGIN_BOTTOM */, null);
            }
            let left = NaN;
            let right = NaN;
            for (const item of outside) {
                if (item.has('left')) {
                    if (item.left < 0 && (isNaN(left) || item.linear.left < left)) {
                        left = item.linear.left;
                    }
                }
                else if (item.right < 0 && (isNaN(right) || item.linear.right > right)) {
                    right = item.linear.right;
                }
            }
            container.inherit(node, 'styleMap');
            if (!isNaN(left)) {
                let offset = node.linear.left - left;
                if (offset > 0) {
                    node.modifyBox(16 /* MARGIN_LEFT */, offset);
                    for (const item of outside) {
                        if (item.left < 0) {
                            item.css('left', $css$a.formatPX(item.left + offset), true);
                        }
                    }
                }
                else {
                    for (const item of outside) {
                        if (item.left < 0) {
                            item.css('left', $css$a.formatPX(node.marginLeft + item.left), true);
                        }
                    }
                    offset = Math.abs(offset);
                }
                if (node.has('width', 2 /* LENGTH */)) {
                    container.cssPX('width', (node.marginLeft > 0 ? node.marginLeft : 0) + offset, false, true);
                }
                else if (node.has('width')) {
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
                    if (node.has('width', 2 /* LENGTH */) || !node.blockStatic && !node.has('width')) {
                        container.css(container.has('width') ? 'width' : 'minWidth', $css$a.formatPX(node.actualWidth + offset), true);
                    }
                }
                for (const item of outside) {
                    if (item.right < 0) {
                        item.css('right', $css$a.formatPX(outerRight - item.linear.right), true);
                    }
                }
            }
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new $Layout$b(parent, container, container.containerType, 8 /* HORIZONTAL */ | 2048 /* SINGLE */, container.children))
            };
        }
    }

    var $Layout$c = squared.base.Layout;
    const $enum$g = squared.base.lib.enumeration;
    class Percent extends squared.base.Extension {
        condition(node, parent) {
            return node.pageFlow && node.has('width', 32 /* PERCENT */, { not: '100%' }) && (parent.layoutVertical || parent.layoutFrame && node.singleChild) && (node.documentBody || node.has('height') || parent.blockStatic || parent.has('width'));
        }
        processNode(node, parent) {
            const container = this.application.controllerHandler.createNodeWrapper(node, parent);
            container.css('display', 'block');
            container.android('layout_width', 'match_parent', false);
            container.android('layout_height', node.has('height', 32 /* PERCENT */) ? 'match_parent' : 'wrap_content', false);
            node.android('layout_width', '0px');
            return {
                parent: container,
                renderAs: container,
                outputAs: this.application.renderNode(new $Layout$c(parent, container, CONTAINER_NODE.CONSTRAINT, 2048 /* SINGLE */, container.children)),
                include: true
            };
        }
        postConstraints(node) {
            const parent = node.parent;
            if (parent && parent.visible) {
                node.resetBox(30 /* MARGIN */, parent, true);
            }
        }
    }

    var $NodeList$3 = squared.base.NodeList;
    const $enum$h = squared.base.lib.enumeration;
    const CONTROL_NAME = 'RadioGroup';
    const getInputName = (element) => element.name ? element.name.trim() : '';
    class RadioGroup extends squared.base.Extension {
        condition(node) {
            if (node.length > 1) {
                const inputName = new Set();
                let i = 0;
                let valid = true;
                for (let item of node) {
                    if (!item.baseline) {
                        valid = false;
                        break;
                    }
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
                if (valid && inputName.size === 1 && i > 1) {
                    const linearData = $NodeList$3.linearData(node.children);
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
                node.setControlType(CONTROL_NAME, CONTAINER_NODE.LINEAR);
                node.alignmentType |= 8 /* HORIZONTAL */;
                node.android('orientation', AXIS_ANDROID.HORIZONTAL);
                if (node.baseline) {
                    node.css('verticalAlign', 'text-bottom', true);
                }
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
                const inputName = getInputName(element);
                const children = [];
                const removeable = [];
                let replacement;
                for (let item of parent.children) {
                    let remove;
                    if (item.renderAs) {
                        if (item.renderAs === node) {
                            replacement = item;
                        }
                        else {
                            remove = item;
                        }
                        item = item.renderAs;
                    }
                    if (node.containerType === CONTAINER_NODE.RADIO && getInputName(item.element) === inputName && !item.rendered) {
                        children.push(item);
                        if (remove) {
                            removeable.push(remove);
                        }
                    }
                }
                if (children.length > 1) {
                    const container = this.application.controllerHandler.createNodeGroup(node, children, parent, replacement);
                    container.alignmentType |= 8 /* HORIZONTAL */ | (parent.length !== children.length ? 128 /* SEGMENTED */ : 0);
                    if (parent.layoutConstraint) {
                        container.companion = replacement || node;
                    }
                    container.setControlType(CONTROL_NAME, CONTAINER_NODE.LINEAR);
                    container.inherit(node, 'alignment');
                    container.css('verticalAlign', 'text-bottom');
                    container.modifyBox(2 /* MARGIN_TOP */, -4);
                    container.exclude({ resource: $enum$h.NODE_RESOURCE.ASSET });
                    container.each(item => {
                        if (item !== node) {
                            item.setControlType(CONTAINER_ANDROID.RADIO, CONTAINER_NODE.RADIO);
                        }
                        item.positioned = true;
                    });
                    container.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent);
                    container.android('orientation', $NodeList$3.linearData(children).linearX ? AXIS_ANDROID.HORIZONTAL : AXIS_ANDROID.VERTICAL);
                    for (const item of removeable) {
                        item.hide();
                    }
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

    const $enum$i = squared.base.lib.enumeration;
    const $css$b = squared.lib.css;
    const $dom$4 = squared.lib.dom;
    const SCROLL_HORIZONTAL = 'HorizontalScrollView';
    const SCROLL_VERTICAL = 'android.support.v4.widget.NestedScrollView';
    class ScrollBar extends squared.base.Extension {
        condition(node) {
            return node.length > 0 && (node.overflowX || node.overflowY || this.included(node.element) && (node.has('width') || node.hasHeight && node.has('height')));
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
                if (node.has('width')) {
                    overflowType |= 8 /* HORIZONTAL */;
                    overflow.push(SCROLL_HORIZONTAL);
                }
                if (node.hasHeight && node.has('height')) {
                    overflowType |= 16 /* VERTICAL */;
                    overflow.push(SCROLL_VERTICAL);
                }
                node.overflow = overflowType;
            }
            for (let i = 0; i < overflow.length; i++) {
                const container = this.application.createNode(i === 0 ? node.element : $dom$4.createElement(node.actualParent && node.actualParent.element, node.block ? 'div' : 'span'));
                container.setControlType(overflow[i], CONTAINER_NODE.BLOCK);
                if (i === 0) {
                    container.inherit(node, 'initial', 'base', 'styleMap');
                    parent.appendTry(node, container);
                }
                else {
                    container.inherit(node, 'base');
                    container.exclude({ resource: $enum$i.NODE_RESOURCE.BOX_STYLE });
                }
                container.exclude({ resource: $enum$i.NODE_RESOURCE.ASSET });
                container.resetBox(480 /* PADDING */);
                scrollView.push(container);
            }
            for (let i = 0; i < scrollView.length; i++) {
                const item = scrollView[i];
                const previous = scrollView[i - 1];
                switch (item.controlName) {
                    case SCROLL_VERTICAL: {
                        node.android('layout_width', 'wrap_content');
                        item.android('layout_height', $css$b.formatPX(node.actualHeight));
                        item.cssApply({
                            overflow: 'scroll visible',
                            overflowX: 'visible',
                            overflowY: 'scroll'
                        });
                        break;
                    }
                    case SCROLL_HORIZONTAL: {
                        item.android('layout_width', $css$b.formatPX(node.actualWidth));
                        node.android('layout_height', 'wrap_content');
                        item.cssApply({
                            overflow: 'visible scroll',
                            overflowX: 'scroll',
                            overflowY: 'visible'
                        });
                        break;
                    }
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
            node.exclude({ resource: $enum$i.NODE_RESOURCE.BOX_STYLE });
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

    const $enum$j = squared.base.lib.enumeration;
    const $color$2 = squared.lib.color;
    const $css$c = squared.lib.css;
    const $math$5 = squared.lib.math;
    const $regex$2 = squared.lib.regex;
    const $util$c = squared.lib.util;
    const $xml$2 = squared.lib.xml;
    function getBorderStyle(border, direction = -1, halfSize = false) {
        const style = border.style;
        const width = roundFloat(border.width);
        let lighten = false;
        switch (style) {
            case 'inset':
            case 'outset':
                lighten = true;
            case 'groove':
            case 'ridge': {
                const color = $color$2.parseColor(border.color, '1', true);
                if (color) {
                    if (style === 'outset') {
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
                    let percent = 1;
                    switch (direction) {
                        case 0:
                        case 3:
                            if (lighten) {
                                percent = -0.15;
                            }
                            break;
                        case 1:
                        case 2:
                            percent = lighten ? -0.30 : -0.75;
                            break;
                    }
                    if (percent !== 1) {
                        const reduced = $color$2.reduceColor(color.valueAsRGBA, percent);
                        if (reduced) {
                            const colorName = Resource.addColor(reduced, true);
                            if (colorName !== '') {
                                return getStrokeColor(colorName);
                            }
                        }
                    }
                }
                break;
            }
        }
        const result = getStrokeColor(Resource.addColor(border.color, true));
        switch (style) {
            case 'dotted':
            case 'dashed':
                result.dashWidth = $css$c.formatPX(width * (style === 'dashed' ? 2 : 1));
                result.dashGap = $css$c.formatPX(width);
                break;
        }
        return result;
    }
    function getBorderStroke(border, direction = -1, offset = 0, hasInset = false, isInset = false) {
        if (border) {
            const style = border.style;
            if (isAlternatingBorder(style)) {
                const width = parseFloat(border.width);
                if (isInset) {
                    return Object.assign({ width: $css$c.formatPX(Math.ceil(width / 2) * 2 + offset) }, getBorderStyle(border, direction));
                }
                else {
                    return Object.assign({ width: hasInset ? $css$c.formatPX(Math.ceil(width / 2) + offset) : $css$c.formatPX(roundFloat(border.width) + offset) }, getBorderStyle(border, direction, true));
                }
            }
            else {
                return Object.assign({ width: $css$c.formatPX(roundFloat(border.width) + offset) }, getBorderStyle(border));
            }
        }
        return undefined;
    }
    function getBorderRadius(radius) {
        if (radius) {
            if (radius.length === 1) {
                return { radius: radius[0] };
            }
            else {
                let corners;
                if (radius.length === 8) {
                    corners = [];
                    for (let i = 0; i < radius.length; i += 2) {
                        corners.push($css$c.formatPX((parseFloat(radius[i]) + parseFloat(radius[i + 1])) / 2));
                    }
                }
                else {
                    corners = radius;
                }
                const boxModel = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
                const result = {};
                let valid = false;
                for (let i = 0; i < corners.length; i++) {
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
        const color = Resource.addColor(value);
        if (color !== '') {
            return { color: `@color/${color}` };
        }
        return undefined;
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
        let hideOffset = '-' + $css$c.formatPX(borderWidth + indentWidth);
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
        hideOffset = '-' + drawOffset;
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
            return /^[a-z]+$/.test(value) ? `${initial ? fallback : value} 0px` : `${fallback} ${value}`;
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
                    result.centerX = $css$c.formatPercent(center.leftAsPercent * 100);
                    result.centerY = $css$c.formatPercent(center.topAsPercent * 100);
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
                    result.gradientRadius = $css$c.formatPX(radius);
                    result.centerX = $css$c.formatPercent(center.leftAsPercent * 100);
                    result.centerY = $css$c.formatPercent(center.topAsPercent * 100);
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
            result.startColor = `@color/${Resource.addColor(colorStops[0].color, true)}`;
            result.endColor = `@color/${Resource.addColor(colorStops[colorStops.length - 1].color, true)}`;
            if (colorStops.length > 2) {
                result.centerColor = `@color/${Resource.addColor(colorStops[Math.floor(colorStops.length / 2)].color, true)}`;
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
        const solid = !borderOnly ? getBackgroundColor(boxStyle.backgroundColor) : undefined;
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
    function setBodyBackground(name, parent, attr, value) {
        Resource.addTheme({
            name,
            parent,
            items: { [attr]: value }
        });
    }
    function getIndentOffset(border) {
        const width = roundFloat(border.width);
        if (border.style === 'double' && width === 2) {
            return 3;
        }
        return width;
    }
    const roundFloat = (value) => Math.round(parseFloat(value));
    const getStrokeColor = (value) => ({ color: `@color/${value}`, dashWidth: '', dashGap: '' });
    const isInsetBorder = (border) => isAlternatingBorder(border.style) || border.style === 'double' && roundFloat(border.width) > 1;
    function convertColorStops(list, precision) {
        const result = [];
        for (const stop of list) {
            result.push({
                color: `@color/${Resource.addColor(stop.color, true)}`,
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
    class ResourceBackground extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.options = {
                autoSizeBackgroundImage: true,
                drawOutlineAsInsetBorder: true
            };
            this.eventOnly = true;
        }
        afterResources() {
            const settings = this.application.userSettings;
            function setDrawableBackground(node, value) {
                let drawable = Resource.insertStoredAsset('drawables', `${node.tagName.toLowerCase()}_${node.controlId}`, value);
                if (drawable !== '') {
                    drawable = `@drawable/${drawable}`;
                    if (node.documentBody) {
                        setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, 'android:background', drawable);
                    }
                    else {
                        node.android('background', drawable, false);
                    }
                }
            }
            for (const node of this.application.processing.cache) {
                const stored = node.data(Resource.KEY_NAME, 'boxStyle');
                if (stored && node.hasResource($enum$j.NODE_RESOURCE.BOX_STYLE)) {
                    if (node.inputElement) {
                        const companion = node.companion;
                        if (companion && !companion.visible && companion.tagName === 'LABEL' && !Resource.isInheritedStyle(companion, 'backgroundColor')) {
                            const style = companion.data(Resource.KEY_NAME, 'boxStyle');
                            if (style && style.backgroundColor) {
                                stored.backgroundColor = style.backgroundColor;
                            }
                        }
                    }
                    const images = this.getDrawableImages(node, stored);
                    let [shapeData, layerListData] = this.getDrawableBorder(node, stored, [stored.borderTop, stored.borderRight, stored.borderBottom, stored.borderLeft], stored.border, images, this.options.drawOutlineAsInsetBorder && stored.outline ? getIndentOffset(stored.outline) : 0, false);
                    const emptyBackground = shapeData === undefined && layerListData === undefined;
                    if (stored.outline && (this.options.drawOutlineAsInsetBorder || emptyBackground)) {
                        const [outlineShapeData, outlineLayerListData] = this.getDrawableBorder(node, stored, [stored.outline, stored.outline, stored.outline, stored.outline], emptyBackground ? stored.outline : undefined);
                        if (emptyBackground) {
                            shapeData = outlineShapeData;
                            layerListData = outlineLayerListData;
                        }
                        else if (layerListData && outlineLayerListData) {
                            $util$c.concatArray(layerListData[0].item, outlineLayerListData[0].item);
                        }
                    }
                    if (shapeData) {
                        setDrawableBackground(node, $xml$2.applyTemplate('shape', SHAPE_TMPL, shapeData));
                    }
                    else if (layerListData) {
                        setDrawableBackground(node, $xml$2.applyTemplate('layer-list', LAYERLIST_TMPL, layerListData));
                    }
                    else if (stored.backgroundColor) {
                        let color = Resource.addColor(stored.backgroundColor);
                        if (color !== '') {
                            color = `@color/${color}`;
                            if (node.documentBody) {
                                setBodyBackground(settings.manifestThemeName, settings.manifestParentThemeName, 'android:windowBackground', color);
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
            }
        }
        getDrawableBorder(node, data, borders, border, images, indentWidth = 0, borderOnly = true) {
            const borderVisible = [];
            const corners = !borderOnly ? getBorderRadius(data.borderRadius) : undefined;
            const indentOffset = indentWidth > 0 ? $css$c.formatPX(indentWidth) : '';
            let borderStyle = true;
            let borderData;
            let shapeData;
            let layerListData;
            for (let i = 0; i < borders.length; i++) {
                const item = borders[i];
                if (item) {
                    if (borderStyle && borderData) {
                        borderStyle = $util$c.isEqual(borderData, item);
                    }
                    borderData = item;
                    borderVisible[i] = true;
                }
                else {
                    borderVisible[i] = false;
                }
            }
            if (border && !isInsetBorder(border) || borderData === undefined && (corners || images && images.length)) {
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
                    shapeData = createShapeData(stroke, !borderOnly ? getBackgroundColor(data.backgroundColor) : undefined, corners);
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
                        const hideOffset = '-' + $css$c.formatPX(width + indentWidth);
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
                    function setBorderStyle(layerList, index, offset = 0) {
                        const item = borders[index];
                        if (item) {
                            const width = roundFloat(item.width);
                            if (item.style === 'double' && width > 1) {
                                insertDoubleBorder(layerList.item, item, index === 0, index === 1, index === 2, index === 3, indentWidth, corners);
                            }
                            else {
                                const inset = item.style === 'groove' || item.style === 'ridge';
                                let hideOffset = '-' + $css$c.formatPX((inset ? Math.ceil(width / 2) : width) + indentWidth);
                                layerList.item.push({
                                    top: index === 0 ? indentOffset : hideOffset,
                                    right: index === 1 ? indentOffset : hideOffset,
                                    bottom: index === 2 ? indentOffset : hideOffset,
                                    left: index === 3 ? indentOffset : hideOffset,
                                    shape: {
                                        'android:shape': 'rectangle',
                                        corners,
                                        stroke: getBorderStroke(item, index, offset, inset)
                                    }
                                });
                                if (inset) {
                                    hideOffset = '-' + $css$c.formatPX(width + indentWidth);
                                    layerList.item.splice(layerList.item.length, 0, {
                                        top: index === 0 ? '' : hideOffset,
                                        right: index === 1 ? '' : hideOffset,
                                        bottom: index === 2 ? '' : hideOffset,
                                        left: index === 3 ? '' : hideOffset,
                                        shape: {
                                            'android:shape': 'rectangle',
                                            stroke: getBorderStroke(item, index, offset, inset, true)
                                        }
                                    });
                                }
                            }
                        }
                    }
                    setBorderStyle(layerListData[0], 0);
                    setBorderStyle(layerListData[0], 1);
                    setBorderStyle(layerListData[0], 3);
                    setBorderStyle(layerListData[0], 2, node.is(CONTAINER_NODE.BUTTON) ? 1 : 0);
                }
            }
            return [shapeData, layerListData];
        }
        getDrawableImages(node, data) {
            const backgroundRepeat = data.backgroundRepeat.split($regex$2.XML.SEPARATOR);
            const backgroundSize = data.backgroundSize.split($regex$2.XML.SEPARATOR);
            const backgroundPositionX = data.backgroundPositionX.split($regex$2.XML.SEPARATOR);
            const backgroundPositionY = data.backgroundPositionY.split($regex$2.XML.SEPARATOR);
            const backgroundImage = [];
            const backgroundPosition = [];
            const imageDimensions = [];
            const result = [];
            let imageLength = 0;
            let resizable = true;
            if (node.hasResource($enum$j.NODE_RESOURCE.IMAGE_SOURCE)) {
                if (data.backgroundImage) {
                    imageLength = data.backgroundImage.length;
                    while (backgroundSize.length < imageLength) {
                        $util$c.concatArray(backgroundSize, backgroundSize.slice(0));
                    }
                    backgroundSize.length = imageLength;
                    for (let i = 0, j = 0; i < imageLength; i++) {
                        const value = data.backgroundImage[i];
                        let valid = false;
                        if (typeof value === 'string') {
                            if (value !== 'initial') {
                                backgroundImage[j] = Resource.addImageURL(value);
                                if (backgroundImage[j] !== '') {
                                    imageDimensions[j] = this.application.resourceHandler.getImage($css$c.resolveURL(value));
                                    valid = true;
                                }
                            }
                        }
                        else if (value.colorStops.length > 1) {
                            const gradient = createBackgroundGradient(value, node.localSettings.targetAPI);
                            if (gradient) {
                                backgroundImage[j] = gradient;
                                imageDimensions[j] = value.dimension;
                                valid = true;
                            }
                        }
                        if (valid) {
                            const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                            const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                            backgroundPosition[j] = $css$c.getBackgroundPosition(`${checkBackgroundPosition(x, y, 'left')} ${checkBackgroundPosition(y, x, 'top')}`, node.actualDimension, node.fontSize);
                            j++;
                        }
                        else {
                            backgroundRepeat.splice(i, 1);
                            backgroundSize.splice(i, 1);
                            imageLength--;
                        }
                    }
                }
                if (node.extracted) {
                    if (imageLength === 0) {
                        backgroundRepeat.length = 0;
                        backgroundSize.length = 0;
                    }
                    const extracted = node.extracted.filter(item => item.visible && (item.imageElement || item.tagName === 'IMAGE'));
                    for (let i = 0, j = imageLength; i < extracted.length; i++) {
                        const image = extracted[i];
                        const element = image.element;
                        const src = Resource.addImageSrc(element);
                        if (src !== '') {
                            backgroundImage[j] = src;
                            backgroundRepeat[j] = 'no-repeat';
                            backgroundSize[j] = `${image.actualWidth}px ${image.actualHeight}px`;
                            backgroundPosition[j] = $css$c.getBackgroundPosition(image.tagName === 'IMAGE' ? '0px 0px' : `${image.bounds.left - node.bounds.left}px ${image.bounds.top - node.bounds.top}px`, node.actualDimension, node.fontSize);
                            imageDimensions[j] = this.application.resourceHandler.getImage(element.src);
                            j++;
                        }
                    }
                }
                imageLength = backgroundImage.length;
            }
            let centerHorizontally = false;
            for (let i = imageLength - 1; i >= 0; i--) {
                const value = backgroundImage[i];
                const bounds = node.bounds;
                const position = backgroundPosition[i];
                const imageData = {
                    bitmap: false,
                    rotate: false,
                    gradient: false
                };
                let dimension = imageDimensions[i];
                if (dimension && (dimension.width === 0 || dimension.height === 0)) {
                    dimension = undefined;
                }
                let top = 0;
                let right = 0;
                let bottom = 0;
                let left = 0;
                if (typeof value === 'string') {
                    function resetPosition(directionA, directionB, overwrite = false) {
                        if (position.orientation.length === 2 || overwrite) {
                            position[directionA] = 0;
                        }
                        position[directionB] = 0;
                    }
                    const src = `@drawable/${value}`;
                    let gravityX = '';
                    let gravityY = '';
                    if (backgroundRepeat[i] !== 'repeat-x') {
                        switch (position.horizontal) {
                            case '0%':
                            case 'left':
                                resetPosition('left', 'right');
                                gravityX = node.localizeString('left');
                                break;
                            case '50%':
                            case 'center':
                                resetPosition('left', 'right', true);
                                gravityX = 'center_horizontal';
                                break;
                            case '100%':
                            case 'right':
                                resetPosition('right', 'left');
                                gravityX = node.localizeString('right');
                                break;
                            default:
                                if (position.right !== 0) {
                                    gravityX += node.localizeString('right');
                                }
                                else {
                                    gravityX += node.localizeString('left');
                                }
                                break;
                        }
                    }
                    else {
                        if (dimension) {
                            while (position.left > 0) {
                                position.left -= dimension.width;
                            }
                        }
                        else {
                            position.left = 0;
                        }
                        position.right = 0;
                        gravityX = node.localizeString('left');
                    }
                    if (backgroundRepeat[i] !== 'repeat-y') {
                        switch (position.vertical) {
                            case '0%':
                            case 'top':
                                resetPosition('top', 'bottom');
                                gravityY += 'top';
                                break;
                            case '50%':
                            case 'center':
                                resetPosition('top', 'bottom', true);
                                gravityY += 'center_vertical';
                                break;
                            case '100%':
                            case 'bottom':
                                resetPosition('bottom', 'top');
                                gravityY += 'bottom';
                                break;
                            default:
                                if (position.bottom !== 0) {
                                    gravityY += 'bottom';
                                }
                                else {
                                    gravityY += 'top';
                                }
                                break;
                        }
                    }
                    else {
                        if (dimension) {
                            while (position.top > 0) {
                                position.top -= dimension.height;
                            }
                        }
                        else {
                            position.top = 0;
                        }
                        position.bottom = 0;
                        gravityY = 'top';
                    }
                    let width = 0;
                    let height = 0;
                    let tileMode = '';
                    let tileModeX = '';
                    let tileModeY = '';
                    let gravity;
                    switch (backgroundRepeat[i]) {
                        case 'repeat':
                            tileMode = 'repeat';
                            break;
                        case 'repeat-x':
                            tileModeX = 'repeat';
                            break;
                        case 'repeat-y':
                            tileModeY = 'repeat';
                            break;
                        default:
                            tileMode = 'disabled';
                            break;
                    }
                    if (dimension) {
                        if (gravityX !== '' && tileModeY === 'repeat' && dimension.width < bounds.width) {
                            switch (gravityX) {
                                case 'start':
                                case 'left':
                                    position.left = node.borderLeftWidth;
                                    position.right = 0;
                                    break;
                                case 'end':
                                case 'right':
                                    position.left = 0;
                                    position.right = node.borderRightWidth;
                                    break;
                                case 'center_horizontal':
                                    position.left = 0;
                                    position.right = 0;
                                    break;
                            }
                            width = dimension.width;
                        }
                        if (gravityY !== '' && tileModeX === 'repeat' && dimension.height < bounds.height) {
                            switch (gravityY) {
                                case 'top':
                                    position.top = node.borderTopWidth;
                                    position.bottom = 0;
                                    imageData.gravity = gravityY;
                                    gravityY = '';
                                    break;
                                case 'bottom':
                                    position.top = 0;
                                    position.bottom = node.borderBottomWidth;
                                    imageData.gravity = gravityY;
                                    gravityY = '';
                                    break;
                                case 'center_vertical':
                                    position.top = 0;
                                    position.bottom = 0;
                                    imageData.gravity = gravityY;
                                    gravityY = '';
                                    break;
                            }
                            height = dimension.height;
                        }
                        if (!node.blockStatic || node.hasWidth) {
                            if (dimension.width >= bounds.width) {
                                tileModeX = '';
                                if (tileMode === 'repeat') {
                                    tileModeY = 'repeat';
                                    tileMode = '';
                                }
                            }
                            if (dimension.height >= bounds.height) {
                                tileModeY = '';
                                if (tileMode === 'repeat') {
                                    tileModeX = 'repeat';
                                    tileMode = '';
                                }
                            }
                        }
                    }
                    switch (backgroundSize[i]) {
                        case 'auto':
                        case 'auto auto':
                        case 'initial':
                        case 'contain':
                            break;
                        case '100% 100%':
                            gravityX = 'fill_horizontal';
                            gravityY = 'fill_vertical';
                        case 'cover':
                            gravity = '';
                            tileMode = '';
                            tileModeX = '';
                            tileModeY = '';
                            break;
                        case '100%':
                            gravityX = 'fill_horizontal';
                            tileModeX = '';
                            if (tileMode === 'repeat') {
                                tileMode = '';
                                tileModeY = 'repeat';
                            }
                            break;
                        default:
                            backgroundSize[i].split(' ').forEach((size, index) => {
                                if (size !== 'auto') {
                                    if (index === 0) {
                                        if (size === '100%') {
                                            gravityX = 'fill_horizontal';
                                        }
                                        else {
                                            width = node.parseUnit(size, true, false);
                                        }
                                    }
                                    else {
                                        if (size === '100%') {
                                            gravityY = 'fill_vertical';
                                        }
                                        else {
                                            height = node.parseUnit(size, false, false);
                                        }
                                    }
                                }
                            });
                            break;
                    }
                    if (dimension) {
                        const backgroundClip = data.backgroundClip;
                        const canResizeHorizontal = () => gravityX !== 'fill_horizontal' && tileMode !== 'repeat' && tileModeX !== 'repeat';
                        const canResizeVertical = () => gravityY !== 'fill_vertical' && tileMode !== 'repeat' && tileModeY !== 'repeat';
                        switch (backgroundSize[i]) {
                            case 'cover':
                                if (dimension.width < bounds.width || dimension.height < bounds.height) {
                                    width = 0;
                                    if (dimension.height < bounds.height) {
                                        const ratio = Math.max(bounds.width / dimension.width, bounds.height / dimension.height);
                                        height = dimension.height * ratio;
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
                                if (dimension.width !== bounds.width && dimension.height !== bounds.height) {
                                    const ratio = Math.min(bounds.width / dimension.width, bounds.height / dimension.height);
                                    width = dimension.width * ratio;
                                    height = dimension.height * ratio;
                                }
                                else {
                                    width = 0;
                                    height = 0;
                                }
                                resizable = false;
                                break;
                            default:
                                if (width === 0 && height > 0 && canResizeHorizontal()) {
                                    width = dimension.width * (height === 0 ? bounds.height : height) / dimension.height;
                                }
                                if (height === 0 && width > 0 && canResizeVertical()) {
                                    height = dimension.height * (width === 0 ? bounds.width : width) / dimension.width;
                                }
                                break;
                        }
                        if (backgroundClip) {
                            if (width === 0) {
                                width = bounds.width;
                            }
                            else {
                                width += node.contentBoxWidth;
                            }
                            if (height === 0) {
                                height = bounds.height;
                            }
                            else {
                                height += node.contentBoxHeight;
                            }
                            width -= backgroundClip.left + backgroundClip.right;
                            height -= backgroundClip.top + backgroundClip.bottom;
                            if (backgroundClip.left > backgroundClip.right) {
                                left = backgroundClip.left - backgroundClip.right;
                            }
                            else if (backgroundClip.left < backgroundClip.right) {
                                right = backgroundClip.right - backgroundClip.left;
                            }
                            if (backgroundClip.top > backgroundClip.bottom) {
                                top = backgroundClip.top - backgroundClip.bottom;
                            }
                            else if (backgroundClip.top < backgroundClip.bottom) {
                                bottom = backgroundClip.bottom - backgroundClip.top;
                            }
                        }
                        else if (width === 0 && height === 0 && dimension.width < node.bounds.width && dimension.height < node.bounds.height && canResizeHorizontal() && canResizeVertical()) {
                            width = dimension.width;
                            height = dimension.height;
                        }
                        if (width > 0) {
                            imageData.width = $css$c.formatPX(width);
                        }
                        if (height > 0) {
                            imageData.height = $css$c.formatPX(height);
                        }
                    }
                    if (gravity === undefined) {
                        if (gravityX === 'center_horizontal' && gravityY === 'center_vertical') {
                            gravity = 'center';
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
                                gravity += (gravity !== '' ? '|' : '') + gravityY;
                            }
                        }
                    }
                    if (tileMode === 'repeat' || tileModeX === 'repeat' || tileModeY === 'repeat') {
                        imageData.bitmap = [{
                                src,
                                gravity,
                                tileMode,
                                tileModeX,
                                tileModeY
                            }];
                    }
                    else {
                        imageData.drawable = src;
                        imageData.gravity = gravity;
                        if (gravity === 'center' || gravity.startsWith('center_horizontal')) {
                            centerHorizontally = true;
                        }
                    }
                }
                else if (value.item) {
                    let width;
                    let height;
                    if (dimension) {
                        width = Math.round(dimension.width);
                        height = Math.round(dimension.height);
                    }
                    else {
                        width = Math.round(node.actualWidth);
                        height = Math.round(node.actualHeight);
                    }
                    if (backgroundSize[i].split(' ').some(size => size !== '100%' && $css$c.isLength(size, true))) {
                        imageData.width = $css$c.formatPX(width);
                        imageData.height = $css$c.formatPX(height);
                    }
                    const src = Resource.insertStoredAsset('drawables', `${node.tagName.toLowerCase()}_${node.controlId}_gradient_${i + 1}`, $xml$2.applyTemplate('vector', VECTOR_TMPL, [{
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
                    }
                }
                else {
                    imageData.gradient = value;
                }
                if (imageData.drawable || imageData.bitmap || imageData.gradient) {
                    if (position.bottom !== 0) {
                        imageData.bottom = $css$c.formatPX(getPercentOffset('bottom', position, backgroundSize[i], node.bounds, dimension) + bottom);
                        bottom = 0;
                    }
                    else if (position.top !== 0) {
                        imageData.top = $css$c.formatPX(getPercentOffset('top', position, backgroundSize[i], node.bounds, dimension) + top);
                        top = 0;
                    }
                    if (position.right !== 0) {
                        imageData.right = $css$c.formatPX(getPercentOffset('right', position, backgroundSize[i], node.bounds, dimension) + right);
                        right = 0;
                    }
                    else if (position.left !== 0) {
                        imageData.left = $css$c.formatPX(getPercentOffset('left', position, backgroundSize[i], node.bounds, dimension) + left);
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
            if (this.options.autoSizeBackgroundImage && result.length && resizable && !node.documentRoot && node.renderParent && !node.renderParent.tableElement && node.hasProcedure($enum$j.NODE_PROCEDURE.AUTOFIT)) {
                this.refitDrawableDimension(node, imageDimensions, centerHorizontally);
            }
            return result;
        }
        refitDrawableDimension(node, dimensions, centerHorizontally) {
            if (!node.is(CONTAINER_NODE.IMAGE)) {
                let imageWidth = 0;
                let imageHeight = 0;
                for (const image of dimensions) {
                    if (image) {
                        imageWidth = Math.max(imageWidth, image.width);
                        imageHeight = Math.max(imageHeight, image.height);
                    }
                }
                if (imageWidth === 0) {
                    let ascend = node;
                    while (ascend) {
                        if (ascend.hasWidth) {
                            imageWidth = ascend.bounds.width;
                        }
                        if (ascend.hasHeight) {
                            imageHeight = ascend.bounds.height;
                        }
                        if (imageWidth > 0 && imageHeight > 0 || ascend.documentBody || !ascend.pageFlow) {
                            break;
                        }
                        ascend = ascend.actualParent;
                    }
                }
                if ((!node.has('width', 2 /* LENGTH */, { map: 'initial', not: '100%' }) && !(node.blockStatic && centerHorizontally) || !node.pageFlow) && (imageWidth === 0 || node.bounds.width < imageWidth)) {
                    const width = node.bounds.width - (node.contentBox ? node.contentBoxWidth : 0);
                    if (width > 0) {
                        node.css('width', $css$c.formatPX(width), true);
                    }
                }
                if ((!node.has('height', 2 /* LENGTH */, { map: 'initial', not: '100%' }) || !node.pageFlow) && (imageHeight === 0 || node.bounds.height < imageHeight)) {
                    const height = node.bounds.height - (node.contentBox ? node.contentBoxHeight : 0);
                    if (height > 0) {
                        node.css('height', $css$c.formatPX(height), true);
                        if (node.marginBottom < 0) {
                            node.modifyBox(8 /* MARGIN_BOTTOM */, null);
                        }
                    }
                }
            }
        }
    }

    const $regex$3 = squared.lib.regex;
    const $util$d = squared.lib.util;
    const STORED$1 = Resource.STORED;
    const REGEXP_WIDGETNAME = /[\s\n]*<([\w\-.]+)[^<]*?(\w+):(\w+)="(-?[\d.]+(?:px|dp|sp))"/;
    const REGEXP_DEVICEUNIT = /\d(px|dp|sp)$/;
    const NAMESPACE_ATTR = ['android', 'app'];
    function getResourceName(map, name, value) {
        for (const [storedName, storedValue] of map.entries()) {
            if (storedName.startsWith(name) && value === storedValue) {
                return storedName;
            }
        }
        return map.has(name) && map.get(name) !== value ? Resource.generateId('dimen', name) : name;
    }
    const getDisplayName = (value) => $util$d.fromLastIndexOf(value, '.');
    class ResourceDimens extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade() {
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
                            if (attr !== 'text') {
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
            }
            for (const tagName in groups) {
                const group = groups[tagName];
                for (const name in group) {
                    const [namespace, attr, value] = name.split($regex$3.XML.SEPARATOR);
                    const key = getResourceName(STORED$1.dimens, `${getDisplayName(tagName)}_${$util$d.convertUnderscore(attr)}`, value);
                    for (const node of group[name]) {
                        node[namespace](attr, `@dimen/${key}`);
                    }
                    STORED$1.dimens.set(key, value);
                }
            }
        }
        afterFinalize() {
            for (const layout of this.application.layouts) {
                let content = layout.content;
                let match;
                while ((match = REGEXP_WIDGETNAME.exec(content)) !== null) {
                    if (match[3] !== 'text') {
                        const key = getResourceName(STORED$1.dimens, `${getDisplayName(match[1]).toLowerCase()}_${$util$d.convertUnderscore(match[3])}`, match[4]);
                        STORED$1.dimens.set(key, match[4]);
                        content = content.replace(match[0], match[0].replace(match[4], `@dimen/${key}`));
                    }
                }
                layout.content = content;
            }
        }
    }

    const $enum$k = squared.base.lib.enumeration;
    const $regex$4 = squared.lib.regex;
    const $util$e = squared.lib.util;
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
        'fontFamily': 'android:fontFamily="',
        'fontStyle': 'android:textStyle="',
        'fontWeight': 'android:fontWeight="',
        'fontSize': 'android:textSize="',
        'color': 'android:textColor="@color/',
        'backgroundColor': 'android:background="@color/'
    };
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
                    sorted[index][key] = $util$e.filterArray(sorted[index][key], id => !ids.includes(id));
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
                if (node.visible && node.data(Resource.KEY_NAME, 'fontStyle') && node.hasResource($enum$k.NODE_RESOURCE.FONT_STYLE)) {
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
                    if (stored.backgroundColor) {
                        stored.backgroundColor = Resource.addColor(stored.backgroundColor);
                    }
                    if (stored.fontFamily) {
                        stored.fontFamily.replace($regex$4.ESCAPE.DOUBLEQUOTE, '').split($regex$4.XML.SEPARATOR).some((value, index, array) => {
                            value = $util$e.trimString(value, "'");
                            let fontFamily = value.toLowerCase();
                            if (this.options.fontResourceValue && FONTREPLACE_ANDROID[fontFamily]) {
                                fontFamily = this.options.defaultSystemFont || FONTREPLACE_ANDROID[fontFamily];
                            }
                            if (FONT_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[fontFamily] || this.options.fontResourceValue && FONTALIAS_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[FONTALIAS_ANDROID[fontFamily]]) {
                                stored.fontFamily = fontFamily;
                                if (stored.fontStyle === 'normal') {
                                    stored.fontStyle = '';
                                }
                                if (stored.fontWeight === '400' || node.localSettings.targetAPI < 26 /* OREO */) {
                                    stored.fontWeight = '';
                                }
                                return true;
                            }
                            else if (stored.fontStyle && stored.fontWeight) {
                                if (this.application.resourceHandler.getFont(value, stored.fontStyle, stored.fontWeight) === undefined) {
                                    if (index < array.length - 1) {
                                        return false;
                                    }
                                    else if (index > 0) {
                                        value = $util$e.trimString(array[0], "'");
                                        fontFamily = value.toLowerCase();
                                    }
                                }
                                fontFamily = $util$e.convertWord(fontFamily);
                                const fonts = Resource.STORED.fonts.get(fontFamily) || {};
                                fonts[value + '|' + stored.fontStyle + '|' + stored.fontWeight] = FONTWEIGHT_ANDROID[stored.fontWeight] || stored.fontWeight;
                                Resource.STORED.fonts.set(fontFamily, fonts);
                                stored.fontFamily = `@font/${fontFamily}`;
                                stored.fontStyle = '';
                                stored.fontWeight = '';
                                return true;
                            }
                            return false;
                        });
                    }
                    stored.color = Resource.addColor(stored.color);
                    for (let i = 0; i < styleKeys.length; i++) {
                        const value = stored[styleKeys[i]];
                        if (value) {
                            const attr = FONT_STYLE[styleKeys[i]] + value + '"';
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
                const sorted = $util$e.filterArray(groupMap[tag], item => item !== undefined).sort((a, b) => {
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
                                    const ids = $util$e.objectMap(attr.split($regex$4.XML.SEPARATOR), value => parseInt(value));
                                    deleteStyleAttribute(sorted, attrs, ids);
                                    style[tag][attrs] = ids;
                                }
                            }
                        }
                        const shared = Object.keys(styleKey);
                        if (shared.length) {
                            style[tag][shared.join(';')] = styleKey[shared[0]];
                        }
                        $util$e.spliceArray(sorted, item => {
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
            const resource = {};
            const nodeMap = {};
            const parentStyle = new Set();
            for (const tag in style) {
                const tagData = style[tag];
                const styleData = [];
                for (const attrs in tagData) {
                    const items = [];
                    for (const value of attrs.split(';')) {
                        const match = $regex$4.XML.ATTRIBUTE.exec(value);
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
                    styleData[i].name = $util$e.capitalize(tag) + (i > 0 ? `_${i}` : '');
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
                    if (styles.length > 1) {
                        parentStyle.add(styles.join('.'));
                        styles.shift();
                    }
                    else {
                        parentStyle.add(styles[0]);
                    }
                    node.attr('_', 'style', `@style/${styles.join('.')}`);
                }
            }
            for (const value of parentStyle) {
                const styleName = [];
                let items;
                let parent = '';
                value.split('.').forEach((tag, index, array) => {
                    const match = REGEXP_TAGNAME.exec(tag);
                    if (match) {
                        const styleData = resource[match[1].toUpperCase()][$util$e.convertInt(match[2])];
                        if (styleData) {
                            if (index === 0) {
                                parent = tag;
                                if (array.length === 1) {
                                    items = styleData.items;
                                }
                                else if (!STORED$2.styles.has(tag)) {
                                    STORED$2.styles.set(tag, { name: tag, parent: '', items: styleData.items });
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
                        STORED$2.styles.set(parent, { name: parent, parent: '', items });
                    }
                    else {
                        const name = styleName.join('.');
                        STORED$2.styles.set(name, { name, parent, items });
                    }
                }
            }
        }
    }

    const $enum$l = squared.base.lib.enumeration;
    class ResourceIncludes extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        beforeCascade() {
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
                                    this.application.saveDocument(openData.name, content, '', Number.POSITIVE_INFINITY);
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

    const $enum$m = squared.base.lib.enumeration;
    const $css$d = squared.lib.css;
    const $dom$5 = squared.lib.dom;
    const $regex$5 = squared.lib.regex;
    const $util$f = squared.lib.util;
    const $xml$3 = squared.lib.xml;
    class ResourceStrings extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.options = {
                numberResourceValue: false,
                replaceCharacterEntities: true,
                fontVariantSmallCapsReduction: 0.8
            };
            this.eventOnly = true;
        }
        afterResources() {
            for (const node of this.application.processing.cache) {
                if (node.hasResource($enum$m.NODE_RESOURCE.VALUE_STRING)) {
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
                                            value = $xml$3.replaceEntity(value);
                                        }
                                        value = Resource.addString($xml$3.escapeAmpersand($xml$3.replaceCharacter(value)), '', this.options.numberResourceValue);
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
                            Resource.addString($xml$3.replaceCharacter(stored.value), stored.key);
                            break;
                        }
                        default: {
                            const stored = node.data(Resource.KEY_NAME, 'valueString');
                            if (stored) {
                                const renderParent = node.renderParent;
                                let value = stored.value;
                                let name = stored.key || value;
                                if (renderParent && renderParent.layoutRelative) {
                                    if (node.alignParent('left') && !$css$d.isParentStyle(node.element, 'whiteSpace', 'pre', 'pre-wrap')) {
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
                                if (node.css('fontVariant') === 'small-caps') {
                                    const words = value.split($regex$5.XML.BREAKWORD);
                                    for (const word of words) {
                                        if (!$regex$5.XML.ENTITY.test(word)) {
                                            value = value.replace(word, word.toUpperCase());
                                        }
                                    }
                                    const fontStyle = node.data(Resource.KEY_NAME, 'fontStyle');
                                    if (fontStyle) {
                                        fontStyle.fontSize = `${parseFloat(fontStyle.fontSize) * this.options.fontVariantSmallCapsReduction}px`;
                                    }
                                }
                                if (this.options.replaceCharacterEntities) {
                                    value = $xml$3.replaceEntity(value);
                                }
                                value = $xml$3.escapeAmpersand($xml$3.replaceCharacter(value));
                                for (const style of node.css('textDecorationLine').split(' ')) {
                                    switch (style) {
                                        case 'underline':
                                            value = `<u>${value}</u>`;
                                            break;
                                        case 'line-through':
                                            value = `<strike>${value}</strike>`;
                                            break;
                                    }
                                }
                                let textIndent = 0;
                                if (node.blockDimension || node.display === 'table-cell') {
                                    textIndent = node.toFloat('textIndent');
                                    if (textIndent + node.bounds.width < 0) {
                                        value = '';
                                    }
                                }
                                if (textIndent === 0) {
                                    const actualParent = node.actualParent;
                                    if (actualParent && (actualParent.blockDimension || actualParent.display === 'table-cell') && node === actualParent.firstChild) {
                                        textIndent = actualParent.toFloat('textIndent');
                                    }
                                }
                                if (textIndent > 0) {
                                    const metrics = $dom$5.getTextMetrics(' ', node.css('fontFamily'), node.fontSize);
                                    const width = metrics && metrics.width || node.fontSize / 2;
                                    value = '&#160;'.repeat(Math.max(Math.floor(textIndent / width), 1)) + value;
                                }
                                name = Resource.addString(value, name, this.options.numberResourceValue);
                                if (name !== '') {
                                    node.android('text', this.options.numberResourceValue || !$util$f.isNumber(name) ? `@string/${name}` : name, false);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const $regex$6 = squared.lib.regex;
    const $util$g = squared.lib.util;
    const REGEXP_ATTRIBUTE = /(\w+):(\w+)="([^"]+)"/;
    const STORED$3 = Resource.STORED;
    class ResourceStyles extends squared.base.Extension {
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
                    if (renderChildren.length > 1) {
                        const attrMap = new Map();
                        let valid = true;
                        let style = '';
                        for (let i = 0; i < renderChildren.length; i++) {
                            let found = false;
                            for (const value of renderChildren[i].combine('_', 'android')) {
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
                                if (value !== renderChildren.length) {
                                    attrMap.delete(attr);
                                }
                            }
                            if (attrMap.size > 1) {
                                if (style !== '') {
                                    style = $util$g.trimString(style.substring(style.indexOf('/') + 1), '"');
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
                                    name = (style !== '' ? style + '.' : '') + $util$g.capitalize(node.controlId);
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
                for (const attr in styles[name]) {
                    const match = $regex$6.XML.ATTRIBUTE.exec(styles[name][attr]);
                    if (match) {
                        items.push({ key: match[1], value: match[2] });
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

    if (!squared.svg) {
        squared.svg = { lib: {} };
    }
    var $Svg = squared.svg.Svg;
    var $SvgAnimate = squared.svg.SvgAnimate;
    var $SvgAnimateTransform = squared.svg.SvgAnimateTransform;
    var $SvgBuild = squared.svg.SvgBuild;
    var $SvgG = squared.svg.SvgG;
    var $SvgPath = squared.svg.SvgPath;
    var $SvgShape = squared.svg.SvgShape;
    const $util$h = squared.lib.util;
    const $css$e = squared.lib.css;
    const $math$6 = squared.lib.math;
    const $xml$4 = squared.lib.xml;
    const $constS = squared.svg.lib.constant;
    const $utilS = squared.svg.lib.util;
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
                return $util$h.convertCamelCase(attr);
            }
        }
        return '';
    }
    function createPathInterpolator(value) {
        if (INTERPOLATOR_ANDROID[value]) {
            return INTERPOLATOR_ANDROID[value];
        }
        else {
            const interpolatorName = `path_interpolator_${$util$h.convertWord(value)}`;
            if (!STORED$4.animators.has(interpolatorName)) {
                const xml = $util$h.formatString(INTERPOLATOR_XML, ...value.split(' '));
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
                        for (const command of $SvgBuild.getPathCommands(path.value)) {
                            $util$h.concatArray(points, command.value);
                        }
                    case 'polygon':
                        if ($utilS.SVG.polygon(path.element)) {
                            $util$h.concatArray(points, $SvgBuild.clonePoints(path.element.points));
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
            this.ANIMATE_TARGET = new Map();
            this.IMAGE_DATA = [];
            this.SYNCHRONIZE_MODE = 0;
            this.NAMESPACE_AAPT = false;
        }
        beforeInit() {
            if ($SvgBuild) {
                $SvgBuild.setName();
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
                    this.ANIMATE_TARGET.clear();
                    this.IMAGE_DATA.length = 0;
                    this.NAMESPACE_AAPT = false;
                    this.SYNCHRONIZE_MODE = 2 /* FROMTO_ANIMATE */ | (supportedKeyFrames ? 32 /* KEYTIME_TRANSFORM */ : 64 /* IGNORE_TRANSFORM */);
                    const templateName = `${node.tagName}_${$util$h.convertWord(node.controlId, true)}_viewbox`.toLowerCase();
                    const getFilename = (prefix, suffix) => templateName + (prefix ? `_${prefix}` : '') + (this.IMAGE_DATA.length ? '_vector' : '') + (suffix ? `_${suffix.toLowerCase()}` : '');
                    svg.build({
                        exclude: this.options.transformExclude,
                        residual: partitionTransforms,
                        precision: this.options.floatPrecisionValue
                    });
                    svg.synchronize({
                        keyTimeMode: this.SYNCHRONIZE_MODE,
                        framesPerSecond: this.application.controllerHandler.userSettings.framesPerSecond,
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
                                        $util$h.concatArray(setData.set, item.set);
                                        $util$h.concatArray(setData.objectAnimator, item.objectAnimator);
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
                            const [companions, animations] = $util$h.partitionArray(group.animate, child => child.companion !== undefined);
                            const targetSetTemplate = {
                                set: [],
                                objectAnimator: []
                            };
                            for (let i = 0; i < animations.length; i++) {
                                const item = animations[i];
                                if (item.setterType) {
                                    if (ATTRIBUTE_ANDROID[item.attributeName] && $util$h.isString(item.to)) {
                                        if (item.duration > 0 && item.fillReplace) {
                                            isolatedData.push(item);
                                        }
                                        else {
                                            togetherData.push(item);
                                        }
                                    }
                                }
                                else if ($SvgBuild.isAnimate(item)) {
                                    const children = $util$h.filterArray(companions, child => child.companion.value === item);
                                    if (children.length) {
                                        children.sort((a, b) => a.companion.key >= b.companion.key ? 1 : 0);
                                        const sequentially = [];
                                        const after = [];
                                        for (let j = 0; j < children.length; j++) {
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
                                        $util$h.concatArray(sequentially, after);
                                        sequentialMap.set(`sequentially_companion_${i}`, sequentially);
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
                                    const together = [];
                                    (synchronized ? $util$h.partitionArray(items, (animate) => animate.iterationCount !== -1) : [items]).forEach((partition, section) => {
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
                                                if ($util$h.isString(value) && fillBefore.objectAnimator.findIndex(before => before.propertyName === propertyName) === -1) {
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
                                                        if ($util$h.isArray(lastValue.propertyValuesHolder)) {
                                                            const propertyValue = lastValue.propertyValuesHolder[lastValue.propertyValuesHolder.length - 1];
                                                            previousValue = propertyValue.keyframe[propertyValue.keyframe.length - 1].value;
                                                        }
                                                        else {
                                                            previousValue = lastValue.valueTo;
                                                        }
                                                    }
                                                    if ($util$h.isString(valueTo) && valueTo !== previousValue) {
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
                                                            $util$h.concatArray(fillBefore.objectAnimator, companionBefore);
                                                        }
                                                        if (companionAfter) {
                                                            $util$h.concatArray(fillAfter.objectAnimator, companionAfter);
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
                                                            $util$h.concatArray(beforeValues, $util$h.objectMap(propertyNames, value => getTransformInitialValue(value) || '0'));
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
                                                        if (rotateValues && rotateValues.length === values.length) {
                                                            propertyNames.push('rotation');
                                                            for (let i = 0; i < values.length; i++) {
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
                                                            values = $util$h.objectMap(item.values, value => $util$h.convertInt(value).toString());
                                                            if (requireBefore && item.baseValue) {
                                                                $util$h.concatArray(beforeValues, $util$h.replaceMap($SvgBuild.parseCoordinates(item.baseValue), value => Math.trunc(value).toString()));
                                                            }
                                                            break;
                                                        case 'floatType':
                                                            if (item.attributeName === 'stroke-dasharray') {
                                                                values = $util$h.objectMap(item.values, value => $util$h.replaceMap(value.split(' '), fraction => parseFloat(fraction)));
                                                            }
                                                            else {
                                                                values = item.values;
                                                            }
                                                            if (requireBefore && item.baseValue) {
                                                                $util$h.concatArray(beforeValues, $util$h.replaceMap($SvgBuild.parseCoordinates(item.baseValue), value => value.toString()));
                                                            }
                                                            break;
                                                        default:
                                                            values = item.values.slice(0);
                                                            if (isColorType(item.attributeName)) {
                                                                if (requireBefore && item.baseValue) {
                                                                    $util$h.concatArray(beforeValues, getColorValue(item.baseValue, true));
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
                                                    const keyName = item.synchronized ? item.synchronized.key + item.synchronized.value :
                                                        index !== 0 || propertyNames.length > 1 ? JSON.stringify(options) : '';
                                                    const keyTimes = item.keyTimes;
                                                    for (let i = 0; i < propertyNames.length; i++) {
                                                        const propertyName = propertyNames[i];
                                                        if (resetBefore) {
                                                            resetBeforeValue(propertyName, beforeValues[i]);
                                                        }
                                                        if (useKeyFrames && keyTimes.length > 1) {
                                                            if (supportedKeyFrames && options.valueType !== 'pathType') {
                                                                if (!resetBefore && requireBefore) {
                                                                    resetBeforeValue(propertyName, beforeValues[i]);
                                                                }
                                                                const propertyValuesHolder = animatorMap.get(keyName) || [];
                                                                const keyframe = [];
                                                                for (let j = 0; j < keyTimes.length; j++) {
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
                                                                for (let j = 0; j < keyTimes.length; j++) {
                                                                    const propertyOptions = Object.assign({}, options, { propertyName, startOffset: j === 0 ? (item.delay + (keyTimes[j] > 0 ? Math.floor(keyTimes[j] * item.duration) : 0)).toString() : '', propertyValuesHolder: false });
                                                                    let valueTo = getPropertyValue(values, j, i, false, options.valueType === 'pathType' ? group.pathData : item.baseValue);
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
                                            $util$h.concatArray(together, repeating.objectAnimator);
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
                                        $util$h.concatArray(setData.objectAnimator, together);
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
                    if (node.baseline) {
                        node.android('baselineAlignBottom', 'true');
                    }
                }
            }
        }
        afterFinalize() {
            this.application.controllerHandler.localSettings.svg.enabled = false;
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
                                    const [strokeDash, pathData, clipPathData] = item.path.extractStrokeDash(animateData && animateData.animate, this.options.floatPrecisionValue);
                                    if (strokeDash) {
                                        const name = getVectorName(item, 'stroke');
                                        const strokeData = { name };
                                        if (pathData !== '') {
                                            path.pathData = pathData;
                                        }
                                        if (clipPathData !== '') {
                                            strokeData['clip-path'] = [{ pathData: clipPathData }];
                                        }
                                        for (let i = 0; i < strokeDash.length; i++) {
                                            const strokePath = i === 0 ? path : Object.assign({}, path);
                                            strokePath.name = `${name}_${i}`;
                                            if (animateData) {
                                                this.ANIMATE_DATA.set(strokePath.name, {
                                                    element: animateData.element,
                                                    animate: $util$h.filterArray(animateData.animate, animate => animate.id === undefined || animate.id === i)
                                                });
                                            }
                                            strokePath.trimPathStart = $math$6.truncate(strokeDash[i].start, this.options.floatPrecisionValue);
                                            strokePath.trimPathEnd = $math$6.truncate(strokeDash[i].end, this.options.floatPrecisionValue);
                                            pathArray.push(strokePath);
                                        }
                                        groupArray.unshift(strokeData);
                                        if (animateData) {
                                            this.ANIMATE_DATA.delete(item.name);
                                        }
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
                                const image = this.application.resourceHandler.getImage(item.href);
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
                if (($SvgBuild.asG(target) || $SvgBuild.asUseSymbol(target)) && $util$h.isString(target.clipPath) && this.createClipPath(target, clipBox, target.clipPath)) {
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
                    const transformed = [];
                    for (const data of transforms) {
                        result.push(createTransformData(data));
                        $util$h.concatArray(transformed, data);
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
            if ($SvgBuild.asUse(target) && $util$h.isString(target.clipPath)) {
                this.createClipPath(target, clipElement, target.clipPath);
            }
            if ($util$h.isString(path.clipPath)) {
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
            for (let attr in path) {
                let value = useTarget ? target[attr] || path[attr] : path[attr];
                if ($util$h.isString(value)) {
                    switch (attr) {
                        case 'name':
                            break;
                        case 'value':
                            attr = 'pathData';
                            break;
                        case 'fill':
                        case 'stroke':
                            attr += 'Color';
                            if (value !== 'none' && (attr === 'stroke' || result['aapt:attr'] === undefined)) {
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
                            value = (($util$h.isNumber(value) ? parseFloat(value) : 1) * opacity).toString();
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
            if (!this.queueAnimations(target, result.name, item => ($SvgBuild.asAnimate(item) || $SvgBuild.asSet(item)) && item.attributeName !== 'clip-path', pathData) && replaceResult.length === 0) {
                if (baseData.name !== groupName) {
                    result.name = '';
                }
            }
            if (transformResult.length) {
                const data = this.ANIMATE_DATA.get(groupName);
                if (data) {
                    $util$h.concatArray(data.animate, transformResult);
                }
            }
            if (replaceResult.length) {
                const data = this.ANIMATE_DATA.get(result.name);
                if (data) {
                    $util$h.concatArray(data.animate, replaceResult);
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
                const animate = $util$h.filterArray(svg.animations, (item, index, array) => !item.paused && (item.duration >= 0 || item.setterType) && predicate(item, index, array));
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
                valueFrom: $util$h.isNumber(valueFrom) ? $math$6.truncate(valueFrom, this.options.floatPrecisionValue) : valueFrom,
                valueTo: $util$h.isNumber(valueTo) ? $math$6.truncate(valueTo, this.options.floatPrecisionValue) : valueTo,
                propertyValuesHolder: false
            };
        }
    }

    const settings = {
        builtInExtensions: [
            'android.delegate.negative-viewport',
            'android.delegate.negative-x',
            'android.delegate.fixed',
            'android.delegate.max-width-height',
            'android.delegate.percent',
            'android.delegate.scrollbar',
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
            'android.constraint.guideline',
            'android.resource.includes',
            'android.resource.svg',
            'android.resource.background',
            'android.resource.strings',
            'android.resource.fonts',
            'android.resource.dimens',
            'android.resource.styles'
        ],
        targetAPI: 28,
        resolutionDPI: 160,
        framesPerSecond: 60,
        supportRTL: true,
        preloadImages: true,
        supportNegativeLeftTop: true,
        collapseUnattributedElements: true,
        exclusionsDisabled: false,
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
            writeLayoutAllXml(saveToDisk = false) {
                if (fileHandler && checkApplication(application)) {
                    return fileHandler.layoutAllToXml(application.layouts, saveToDisk);
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
                [EN.GRID]: new Grid(EN.GRID, framework, ['DIV', 'FORM', 'UL', 'OL', 'DL', 'NAV', 'SECTION', 'ASIDE', 'MAIN', 'HEADER', 'FOOTER', 'P', 'ARTICLE', 'FIELDSET']),
                [EN.RELATIVE]: new Relative(EN.RELATIVE, framework),
                [EN.VERTICAL_ALIGN]: new VerticalAlign(EN.VERTICAL_ALIGN, framework),
                [EN.WHITESPACE]: new WhiteSpace(EN.WHITESPACE, framework),
                [EN.ACCESSIBILITY]: new Accessibility(EN.ACCESSIBILITY, framework),
                [EA.CONSTRAINT_GUIDELINE]: new Guideline(EA.CONSTRAINT_GUIDELINE, framework),
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
