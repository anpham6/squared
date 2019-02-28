/* android-framework 0.7.1
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
        CHECKBOX: CONTAINER_NODE.CHECKBOX,
        RADIO: CONTAINER_NODE.RADIO,
        BUTTON: CONTAINER_NODE.BUTTON,
        SUBMIT: CONTAINER_NODE.BUTTON,
        RESET: CONTAINER_NODE.BUTTON,
        TEXTAREA: CONTAINER_NODE.EDIT
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
    const $dom = squared.lib.dom;
    const $math = squared.lib.math;
    const $util = squared.lib.util;
    const $xml = squared.lib.xml;
    const $SvgBuild = squared.svg && squared.svg.SvgBuild;
    const $utilS = squared.svg && squared.svg.lib && squared.svg.lib.util;
    const STORED = $Resource.STORED;
    function getRadiusPercent(value) {
        return $util.isPercent(value) ? parseInt(value) / 100 : 0.5;
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
    class Resource extends squared.base.Resource {
        constructor(application, cache) {
            super(application, cache);
            STORED.styles = new Map();
            STORED.themes = new Map();
            STORED.dimens = new Map();
            STORED.drawables = new Map();
            STORED.animators = new Map();
        }
        static createBackgroundGradient(node, gradients, path) {
            const result = [];
            for (const item of gradients) {
                const gradient = { type: item.type, colorStops: [] };
                let hasStop;
                if (!node.svgElement && parseFloat(item.colorStops[0].offset) === 0 && ['100%', '360'].includes(item.colorStops[item.colorStops.length - 1].offset) && (item.colorStops.length === 2 || item.colorStops.length === 3 && ['50%', '180'].includes(item.colorStops[1].offset))) {
                    gradient.startColor = Resource.addColor(item.colorStops[0].color, true);
                    gradient.endColor = Resource.addColor(item.colorStops[item.colorStops.length - 1].color, true);
                    if (item.colorStops.length === 3) {
                        gradient.centerColor = Resource.addColor(item.colorStops[1].color, true);
                    }
                    hasStop = false;
                }
                else {
                    hasStop = true;
                }
                switch (item.type) {
                    case 'radial':
                        if (node.svgElement) {
                            if (path && $SvgBuild && $utilS) {
                                const radial = item;
                                const points = [];
                                let cx;
                                let cy;
                                let cxDiameter;
                                let cyDiameter;
                                switch (path.element.tagName) {
                                    case 'path':
                                        for (const command of $SvgBuild.getPathCommands(path.value)) {
                                            points.push(...command.value);
                                        }
                                    case 'polygon':
                                        if (path.element instanceof SVGPolygonElement) {
                                            points.push(...$SvgBuild.clonePoints(path.element.points));
                                        }
                                        if (!points.length) {
                                            break;
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
                                            return result;
                                        }
                                        break;
                                }
                                gradient.centerX = (cx + cxDiameter * getRadiusPercent(radial.cxAsString)).toString();
                                gradient.centerY = (cy + cyDiameter * getRadiusPercent(radial.cyAsString)).toString();
                                gradient.gradientRadius = (((cxDiameter + cyDiameter) / 2) * ($util.isPercent(radial.rAsString) ? (parseFloat(radial.rAsString) / 100) : 1)).toString();
                                if (radial.spreadMethod) {
                                    gradient.tileMode = getTileMode(radial.spreadMethod);
                                }
                            }
                        }
                        else {
                            const position = $dom.getBackgroundPosition(item.position[0], node.bounds, node.fontSize, true, !hasStop);
                            if (hasStop) {
                                gradient.gradientRadius = node.bounds.width.toString();
                                gradient.centerX = position.left.toString();
                                gradient.centerY = position.top.toString();
                            }
                            else {
                                gradient.gradientRadius = $util.formatPX(node.bounds.width);
                                gradient.centerX = $util.convertPercent(position.left);
                                gradient.centerY = $util.convertPercent(position.top);
                            }
                        }
                        break;
                    case 'linear':
                        if (node.svgElement) {
                            const linear = item;
                            gradient.startX = linear.x1.toString();
                            gradient.startY = linear.y1.toString();
                            gradient.endX = linear.x2.toString();
                            gradient.endY = linear.y2.toString();
                            if (linear.spreadMethod) {
                                gradient.tileMode = getTileMode(linear.spreadMethod);
                            }
                        }
                        else {
                            const linear = item;
                            if (hasStop) {
                                const x = Math.round(node.bounds.width / 2);
                                const y = Math.round(node.bounds.height / 2);
                                gradient.startX = Math.round(x + $math.distanceFromX(x, linear.angle + 180)).toString();
                                gradient.startY = Math.round(y + $math.distanceFromY(y, linear.angle + 180)).toString();
                                gradient.endX = Math.round(x + $math.distanceFromX(x, linear.angle)).toString();
                                gradient.endY = Math.round(y + $math.distanceFromY(y, linear.angle)).toString();
                            }
                            else {
                                gradient.angle = (Math.floor(linear.angle / 45) * 45).toString();
                            }
                        }
                        break;
                    case 'conic':
                        if (!node.svgElement) {
                            gradient.type = 'sweep';
                            const position = $dom.getBackgroundPosition(item.position[0], node.bounds, node.fontSize, true, !hasStop);
                            if (hasStop) {
                                gradient.centerX = position.left.toString();
                                gradient.centerY = position.top.toString();
                            }
                            else {
                                gradient.centerX = $util.convertPercent(position.left);
                                gradient.centerY = $util.convertPercent(position.top);
                            }
                            break;
                        }
                    default:
                        return result;
                }
                if (hasStop) {
                    for (let i = 0; i < item.colorStops.length; i++) {
                        const stop = item.colorStops[i];
                        const color = `@color/${Resource.addColor(stop.color, true)}`;
                        let offset = parseInt(stop.offset);
                        if (gradient.type === 'sweep') {
                            offset *= 100 / 360;
                        }
                        else if (i === 0 && offset !== 0 && !node.svgElement) {
                            gradient.colorStops.push({
                                color,
                                offset: '0',
                                opacity: stop.opacity
                            });
                        }
                        gradient.colorStops.push({
                            color,
                            offset: $math.truncateRange(offset / 100),
                            opacity: stop.opacity
                        });
                    }
                }
                result.push(gradient);
            }
            return result;
        }
        static formatOptions(options, numberAlias = false) {
            for (const namespace in options) {
                if (options.hasOwnProperty(namespace)) {
                    const obj = options[namespace];
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
                                    if ($util.REGEXP_PATTERN.URI.test(value)) {
                                        value = this.addImage({ mdpi: value });
                                        if (value !== '') {
                                            obj[attr] = `@drawable/${value}`;
                                            continue;
                                        }
                                    }
                                    break;
                            }
                            const color = $color.parseRGBA(value);
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
        static getOptionArray(element) {
            const stringArray = [];
            let numberArray = [];
            let i = -1;
            while (++i < element.children.length) {
                const item = element.children[i];
                const value = item.text.trim();
                if (value !== '') {
                    if (numberArray && stringArray.length === 0 && $util.isNumber(value)) {
                        numberArray.push(value);
                    }
                    else {
                        if (numberArray && numberArray.length) {
                            i = -1;
                            numberArray = undefined;
                            continue;
                        }
                        if (value !== '') {
                            stringArray.push($xml.replaceEntity(value));
                        }
                    }
                }
            }
            return [stringArray.length ? stringArray : undefined, numberArray && numberArray.length ? numberArray : undefined];
        }
        static addTheme(...values) {
            for (const theme of values) {
                const path = $util.isString(theme.output.path) ? theme.output.path : '';
                const file = $util.isString(theme.output.file) ? theme.output.file : 'themes.xml';
                const filename = `${$util.trimString(path.trim(), '/')}/${$util.trimString(file.trim(), '/')}`;
                const stored = STORED.themes.get(filename) || new Map();
                let appTheme = '';
                if (theme.name === '' || theme.name.charAt(0) === '.') {
                    foundTheme: {
                        for (const data of STORED.themes.values()) {
                            for (const style of data.values()) {
                                if (style.name) {
                                    appTheme = style.name;
                                    break foundTheme;
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
                if (!stored.has(theme.name)) {
                    stored.set(theme.name, theme);
                }
                else {
                    const data = stored.get(theme.name);
                    for (const attr in theme.items) {
                        data.items[attr] = theme.items[attr];
                    }
                }
                STORED.themes.set(filename, stored);
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
                    name = name.toLowerCase()
                        .replace(/[^a-z\d]/g, '_')
                        .replace(/_+/g, '_')
                        .split('_')
                        .slice(0, 4)
                        .join('_')
                        .replace(/_+$/g, '');
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
        static addImageSrcSet(element, prefix = '') {
            const images = {};
            const srcset = element.srcset.trim();
            if (srcset !== '') {
                const filepath = element.src.substring(0, element.src.lastIndexOf('/') + 1);
                for (const value of srcset.split(',')) {
                    const match = /^(.+?)\s*(\d+\.?\d*x)?$/.exec(value.trim());
                    if (match) {
                        if (!$util.hasValue(match[2])) {
                            match[2] = '1x';
                        }
                        const src = filepath + $util.lastIndexOf(match[1]);
                        switch (match[2]) {
                            case '0.75x':
                                images.ldpi = src;
                                break;
                            case '1x':
                                images.mdpi = src;
                                break;
                            case '1.5x':
                                images.hdpi = src;
                                break;
                            case '2x':
                                images.xhdpi = src;
                                break;
                            case '3x':
                                images.xxhdpi = src;
                                break;
                            case '4x':
                                images.xxxhdpi = src;
                                break;
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
            if (images && images.mdpi) {
                src = $util.lastIndexOf(images.mdpi);
                const format = $util.lastIndexOf(src, '.').toLowerCase();
                src = src.replace(/.\w+$/, '').replace(/-/g, '_');
                switch (format) {
                    case 'bmp':
                    case 'cur':
                    case 'gif':
                    case 'ico':
                    case 'jpg':
                    case 'png':
                        src = Resource.insertStoredAsset('images', prefix + src, images);
                        break;
                    default:
                        src = '';
                        break;
                }
            }
            return src;
        }
        static addImageUrl(value, prefix = '') {
            const url = $dom.cssResolveUrl(value);
            if (url !== '') {
                return this.addImage({ mdpi: url }, prefix);
            }
            return '';
        }
        static addColor(value, transparency = false) {
            if (typeof value === 'string') {
                value = $color.parseRGBA(value, undefined, transparency);
            }
            if (value && (value.valueRGBA !== '#00000000' || transparency)) {
                const argb = value.opaque ? value.valueARGB : value.valueRGB;
                let name = STORED.colors.get(argb) || '';
                if (name === '') {
                    const shade = $color.getColorByShade(value.valueRGB);
                    if (shade) {
                        shade.name = $util.convertUnderscore(shade.name);
                        if (!value.opaque && shade.value === value.valueRGB) {
                            name = shade.name;
                        }
                        else {
                            name = Resource.generateId('color', shade.name);
                        }
                        STORED.colors.set(argb, name);
                    }
                }
                return name;
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

    const $util$2 = squared.lib.util;
    const $xml$1 = squared.lib.xml;
    function stripId(value) {
        return value ? value.replace(/@\+?id\//, '') : '';
    }
    function createViewAttribute(options) {
        return Object.assign({ android: {}, app: {} }, (options && typeof options === 'object' ? options : {}));
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
    function validateString(value) {
        return value ? value.trim().replace(/[^\w$\-_.]/g, '_') : '';
    }
    function convertUnit(value, dpi = 160, font = false) {
        if (value) {
            let result = parseFloat(value);
            if (!isNaN(result)) {
                result /= dpi / 160;
                value = result >= 1 || result === 0 ? Math.floor(result).toString() : result.toPrecision(2);
                return value + (font ? 'sp' : 'dp');
            }
        }
        return '0dp';
    }
    function replaceUnit(value, dpi = 160, format = 'dp', font = false) {
        if (format === 'dp' || font) {
            return value.replace(/([">])(-)?(\d+(?:\.\d+)?px)(["<])/g, (match, ...capture) => capture[0] + (capture[1] || '') + convertUnit(capture[2], dpi, font) + capture[3]);
        }
        return value;
    }
    function replaceTab(value, spaces = 4, preserve = false) {
        return $xml$1.replaceTab(value, spaces, preserve);
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
    function replaceRTL(value, rtl = true, api = 26 /* OREO */) {
        value = value ? value.trim() : '';
        if (rtl && api >= 17 /* JELLYBEAN_1 */) {
            value = value.replace(/left/g, 'start').replace(/right/g, 'end');
            value = value.replace(/Left/g, 'Start').replace(/Right/g, 'End');
        }
        return value;
    }
    function getXmlNs(...values) {
        return $util$2.joinMap(values, namespace => XMLNS_ANDROID[namespace] ? `xmlns:${namespace}="${XMLNS_ANDROID[namespace]}"` : '', ' ');
    }

    var util = /*#__PURE__*/Object.freeze({
        stripId: stripId,
        createViewAttribute: createViewAttribute,
        createStyleAttribute: createStyleAttribute,
        validateString: validateString,
        convertUnit: convertUnit,
        replaceUnit: replaceUnit,
        replaceTab: replaceTab,
        calculateBias: calculateBias,
        replaceRTL: replaceRTL,
        getXmlNs: getXmlNs
    });

    var $NodeList = squared.base.NodeList;
    var $Resource$1 = squared.base.Resource;
    const $enum = squared.base.lib.enumeration;
    const $dom$1 = squared.lib.dom;
    const $util$3 = squared.lib.util;
    const BOXSPACING_REGION = ['margin', 'padding'];
    const BOXSPACING_DIRECTION = ['Top', 'Left', 'Right', 'Bottom'];
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
    function setAutoMargin(node) {
        if (!node.blockWidth) {
            const alignment = [];
            const singleFrame = node.documentRoot && node.layoutFrame && node.length === 1 && node.has('maxWidth');
            if (node.autoMargin.leftRight) {
                if (singleFrame) {
                    node.renderChildren[0].mergeGravity('layout_gravity', 'center_horizontal');
                }
                else {
                    alignment.push('center_horizontal');
                }
            }
            else if (node.autoMargin.left) {
                if (singleFrame) {
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
                node.mergeGravity(node.blockWidth || !node.pageFlow ? 'gravity' : 'layout_gravity', ...alignment);
                return true;
            }
        }
        return false;
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
                this._boxAdjustment = $dom$1.newBoxModel();
                this._boxReset = $dom$1.newBoxModel();
                this._containerType = 0;
                this._localSettings = {
                    targetAPI: 28 /* LATEST */,
                    supportRTL: false
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
                const match = value.match(/^(?:([a-z]+):)?(\w+)="((?:@+?[a-z]+\/)?.+)"$/);
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
                                    horizontal: $util$3.indexOf(position.toLowerCase(), 'left', 'right') !== -1
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
                            this.app(this.localizeString(attr), documentId);
                        }
                        else if (renderParent.layoutRelative) {
                            const attr = LAYOUT_ANDROID.relative[position];
                            this.android(this.localizeString(attr), documentId);
                        }
                    }
                    else {
                        if (renderParent.layoutConstraint) {
                            const attr = LAYOUT_ANDROID.constraint[position];
                            const value = this.app(this.localizeString(attr)) || this.app(attr);
                            return value !== '' && value !== 'parent' && value !== renderParent.documentId ? value : '';
                        }
                        else if (renderParent.layoutRelative) {
                            const attr = LAYOUT_ANDROID.relative[position];
                            const value = this.android(this.localizeString(attr)) || this.android(attr);
                            return value;
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
                    return calculateBias(left, right, this.localSettings.constraintPercentAccuracy);
                }
                return 0.5;
            }
            verticalBias() {
                const parent = this.documentParent;
                if (parent !== this) {
                    const top = Math.max(0, this.linear.top - parent.box.top);
                    const bottom = Math.max(0, parent.box.bottom - this.linear.bottom);
                    return calculateBias(top, bottom, this.localSettings.constraintPercentAccuracy);
                }
                return 0.5;
            }
            supported(obj, attr, result = {}) {
                if (this.localSettings.targetAPI > 0 && this.localSettings.targetAPI < 28 /* LATEST */) {
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
                if (!this.hasBit('excludeProcedure', $enum.NODE_PROCEDURE.LOCALIZATION)) {
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
                node.renderDepth = this.renderDepth;
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
                if (containerType) {
                    this.containerType = containerType;
                }
                else if (this.containerType === 0) {
                    for (const global in CONTAINER_ANDROID) {
                        if (CONTAINER_ANDROID[global] === controlName) {
                            for (const local in CONTAINER_NODE) {
                                if (CONTAINER_NODE[CONTAINER_NODE[local]] === global) {
                                    this.containerType = CONTAINER_NODE[local];
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
                this.controlName = controlName;
                if (this.android('id') !== '') {
                    this.controlId = stripId(this.android('id'));
                }
                if (this.controlId === '') {
                    const element = this.element;
                    let name = '';
                    if (element) {
                        name = validateString(element.id || element.name);
                        if (name === 'parent' || RESERVED_JAVA.includes(name)) {
                            name = `_${name}`;
                        }
                    }
                    this.controlId = $util$3.convertWord($Resource$1.generateId('android', name || $util$3.lastIndexOf(this.controlName, '.').toLowerCase(), name ? 0 : 1));
                    this.android('id', this.documentId);
                }
            }
            setLayout() {
                const parent = this.absoluteParent;
                const renderParent = this.renderParent;
                const children = this.renderChildren;
                if (this.documentBody) {
                    if (!this.hasWidth && children.some(node => node.alignParent('right'))) {
                        this.android('layout_width', 'match_parent', false);
                    }
                    if (!this.hasHeight && children.some(node => node.alignParent('bottom'))) {
                        this.android('layout_height', 'match_parent', false);
                    }
                }
                let hasWidth = false;
                if (!this.android('layout_width')) {
                    if (!this.inlineStatic && this.has('width') || this.toInt('width') > 0 && !this.cssInitial('width')) {
                        const width = this.css('width');
                        if ($util$3.isUnit(width)) {
                            const widthParent = renderParent ? $util$3.convertInt(renderParent.android('layout_width')) : 0;
                            const value = this.convertPX(width);
                            if (parent === renderParent && widthParent > 0 && $util$3.convertInt(value) >= widthParent) {
                                this.android('layout_width', 'match_parent');
                            }
                            else {
                                this.android('layout_width', value);
                            }
                            hasWidth = true;
                        }
                        else if ($util$3.isPercent(width)) {
                            if (renderParent && renderParent.is(CONTAINER_NODE.GRID)) {
                                this.android('layout_width', '0px', false);
                                this.android('layout_columnWeight', (parseInt(width) / 100).toPrecision(2), false);
                            }
                            else if (width === '100%') {
                                this.android('layout_width', 'match_parent');
                            }
                            else {
                                this.android('layout_width', this.convertPercent(width, true));
                            }
                            hasWidth = true;
                        }
                    }
                }
                if (this.has('minWidth') && !this.constraint.minWidth) {
                    const value = this.convertPX(this.css('minWidth'));
                    this.android('layout_width', 'wrap_content', false);
                    this.android('minWidth', value, false);
                    hasWidth = true;
                }
                if (!hasWidth) {
                    const blockStatic = this.blockStatic && !this.has('maxWidth') && (this.htmlElement || this.svgElement);
                    if (this.plainText) {
                        this.android('layout_width', renderParent && this.bounds.width > renderParent.box.width && this.multiline && this.alignParent('left') ? 'match_parent' : 'wrap_content', false);
                    }
                    else if (children.some(node => (node.inlineStatic && !node.plainText || $util$3.isUnit(node.cssInitial('width'))) && !node.autoMargin.horizontal && Math.ceil(node.bounds.width) >= this.box.width)) {
                        this.android('layout_width', 'wrap_content', false);
                    }
                    else if (this.flexElement && renderParent && renderParent.hasWidth ||
                        this.groupParent && children.some(node => !(node.plainText && node.multiline) && node.linear.width >= this.documentParent.box.width) ||
                        blockStatic && (this.documentBody || !!parent && (parent.documentBody ||
                            parent.has('width', 32 /* PERCENT */) ||
                            parent.blockStatic && (this.singleChild || this.alignedVertically(this.previousSiblings())))) ||
                        this.layoutFrame && ($NodeList.floated(children).size === 2 || children.some(node => node.blockStatic && (node.autoMargin.leftRight || node.rightAligned)))) {
                        this.android('layout_width', 'match_parent', false);
                    }
                    else {
                        const wrap = (this.containerType < CONTAINER_NODE.INLINE ||
                            !this.pageFlow ||
                            this.inlineFlow ||
                            this.tableElement ||
                            this.flexElement ||
                            !!parent && (parent.flexElement || parent.gridElement) ||
                            !!renderParent && renderParent.is(CONTAINER_NODE.GRID));
                        if ((!wrap || blockStatic) && (!!parent && this.linear.width >= parent.box.width ||
                            this.layoutVertical && !this.autoMargin.horizontal ||
                            !this.documentRoot && children.some(node => node.layoutVertical && !node.autoMargin.horizontal && !node.hasWidth && !node.floating))) {
                            this.android('layout_width', 'match_parent', false);
                        }
                        else {
                            this.android('layout_width', 'wrap_content', false);
                        }
                    }
                }
                let hasHeight = false;
                if (!this.android('layout_height')) {
                    if (!this.inlineStatic && this.has('height') || this.toInt('height') > 0 && !this.cssInitial('height')) {
                        const height = this.css('height');
                        if ($util$3.isUnit(height)) {
                            const value = this.convertPX(height, false);
                            this.android('layout_height', this.css('overflow') === 'hidden' && parseInt(value) < Math.floor(this.box.height) ? 'wrap_content' : value);
                            hasHeight = true;
                        }
                        else if ($util$3.isPercent(height)) {
                            if (height === '100%') {
                                this.android('layout_height', 'match_parent');
                                hasHeight = true;
                            }
                            else if (this.documentParent.has('height')) {
                                this.android('layout_height', $util$3.formatPX(Math.ceil(this.bounds.height) - this.contentBoxHeight));
                                hasHeight = true;
                            }
                        }
                    }
                }
                if (this.has('minHeight') && !this.constraint.minHeight) {
                    const value = this.convertPX(this.css('minHeight'), false);
                    this.android('layout_height', 'wrap_content', false);
                    this.android('minHeight', value, false);
                    hasHeight = true;
                }
                if (!hasHeight) {
                    this.android('layout_height', 'wrap_content', false);
                }
            }
            setAlignment() {
                const renderParent = this.renderParent;
                if (renderParent) {
                    let textAlign = checkTextAlign(this.cssInitial('textAlign', true));
                    if (this.pageFlow) {
                        let floating = '';
                        if (this.inlineVertical && (renderParent.layoutHorizontal && !renderParent.support.container.positionRelative || renderParent.is(CONTAINER_NODE.GRID))) {
                            const gravity = this.display === 'table-cell' ? 'gravity' : 'layout_gravity';
                            switch (this.cssInitial('verticalAlign', true)) {
                                case 'top':
                                    this.mergeGravity(gravity, 'top');
                                    break;
                                case 'middle':
                                    this.mergeGravity(gravity, 'center_vertical');
                                    break;
                                case 'bottom':
                                    this.mergeGravity(gravity, 'bottom');
                                    break;
                            }
                        }
                        if (!this.blockWidth && (renderParent.layoutVertical || this.documentRoot && (this.layoutVertical || this.layoutFrame))) {
                            if (this.floating) {
                                this.mergeGravity('layout_gravity', this.float);
                            }
                            else {
                                setAutoMargin(this);
                            }
                        }
                        if (this.hasAlign(64 /* FLOAT */)) {
                            if (this.hasAlign(512 /* RIGHT */) || this.renderChildren.length && this.renderChildren.every(node => node.rightAligned)) {
                                floating = 'right';
                            }
                            else if (this.groupParent && !this.renderChildren.some(item => item.float === 'right')) {
                                floating = 'left';
                            }
                        }
                        if (renderParent.layoutFrame && !setAutoMargin(this)) {
                            floating = this.floating ? this.float : floating;
                            if (floating !== '' && (renderParent.inlineWidth || this.singleChild && !renderParent.documentRoot)) {
                                renderParent.mergeGravity('layout_gravity', floating);
                            }
                        }
                        if (floating !== '') {
                            if (this.blockWidth) {
                                if (textAlign === '' || floating === 'right') {
                                    textAlign = floating;
                                }
                            }
                            else {
                                this.mergeGravity('layout_gravity', floating);
                            }
                        }
                    }
                    else {
                        setAutoMargin(this);
                    }
                    const textAlignParent = checkTextAlign(this.cssAscend('textAlign'));
                    if (textAlignParent !== '' && textAlignParent !== 'left' && textAlignParent !== 'start') {
                        if (renderParent.layoutFrame && this.pageFlow && !this.floating && !this.autoMargin.horizontal && !this.blockWidth) {
                            this.mergeGravity('layout_gravity', textAlignParent);
                        }
                        if (!this.imageElement && textAlign === '') {
                            textAlign = textAlignParent;
                        }
                    }
                    if (textAlign !== '' && !this.layoutConstraint) {
                        this.mergeGravity('gravity', textAlign);
                    }
                }
            }
            mergeGravity(attr, ...alignment) {
                const direction = new Set();
                const previousValue = this.android(attr);
                if (previousValue !== '') {
                    for (const value of previousValue.split('|')) {
                        direction.add(value.trim());
                    }
                }
                for (const value of alignment) {
                    if (value !== '') {
                        direction.add(this.localizeString(value.trim()));
                    }
                }
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
                                    x = value;
                                    break;
                                case 'top':
                                case 'bottom':
                                case 'center_vertical':
                                    y = value;
                                    break;
                                default:
                                    z += (z !== '' ? '|' : '') + value;
                                    break;
                            }
                        }
                        const gravity = x !== '' && y !== '' ? `${x}|${y}` : x || y;
                        result = gravity + (z !== '' ? (gravity !== '' ? '|' : '') + z : '');
                }
                if (result !== '') {
                    return this.android(attr, result);
                }
                else {
                    this.delete('android', attr);
                    return '';
                }
            }
            setLineHeight(value) {
                const offset = value - (this.hasHeight ? this.height : this.bounds.height);
                if (offset > 0) {
                    this.modifyBox(2 /* MARGIN_TOP */, Math.floor(offset / 2) - (this.inlineVertical ? $util$3.convertInt(this.verticalAlign) : 0));
                    this.modifyBox(8 /* MARGIN_BOTTOM */, Math.ceil(offset / 2));
                }
                else if (!this.hasHeight && this.multiline === 0) {
                    this.android('minHeight', $util$3.formatPX(value));
                    this.mergeGravity('gravity', 'center_vertical');
                }
            }
            applyOptimizations() {
                if (this.renderParent) {
                    this.autoSizeBoxModel();
                    this.alignHorizontalLayout();
                    this.alignVerticalLayout();
                    switch (this.cssAscend('visibility', true)) {
                        case 'hidden':
                        case 'collapse':
                            this.hide(true);
                            break;
                    }
                }
            }
            applyCustomizations() {
                for (const build of [API_ANDROID[0], API_ANDROID[this.localSettings.targetAPI]]) {
                    if (build && build.assign) {
                        for (const tagName of [this.tagName, this.controlName]) {
                            const assign = build.assign[tagName];
                            if (assign) {
                                for (const obj in assign) {
                                    for (const attr in assign[obj]) {
                                        this.attr(obj, attr, assign[obj][attr], this.localSettings.customizationsOverwritePrivilege);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            setBoxSpacing() {
                const boxModel = {
                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0,
                    paddingTop: 0,
                    paddingRight: 0,
                    paddingBottom: 0,
                    paddingLeft: 0
                };
                for (let i = 0; i < BOXSPACING_REGION.length; i++) {
                    const region = BOXSPACING_REGION[i];
                    for (const direction of BOXSPACING_DIRECTION) {
                        const attr = region + direction;
                        let value;
                        if (this._boxReset[attr] === 1 || attr === 'marginRight' && this.bounds.right >= this.documentParent.box.right && this.inline) {
                            value = 0;
                        }
                        else {
                            value = this[attr];
                        }
                        value += this._boxAdjustment[attr];
                        boxModel[attr] = value;
                    }
                    const prefix = i === 0 ? 'layout_margin' : 'padding';
                    const top = `${region}Top`;
                    const right = `${region}Right`;
                    const bottom = `${region}Bottom`;
                    const left = `${region}Left`;
                    const localizeLeft = this.localizeString('Left');
                    const localizeRight = this.localizeString('Right');
                    const renderParent = this.renderParent;
                    let mergeAll;
                    let mergeHorizontal;
                    let mergeVertical;
                    if (this.supported('android', 'layout_marginHorizontal') && !(i === 0 && renderParent && renderParent.is(CONTAINER_NODE.GRID))) {
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
                    if (mergeAll !== undefined) {
                        if (mergeAll !== 0) {
                            this.android(prefix, $util$3.formatPX(mergeAll));
                        }
                    }
                    else {
                        if (mergeHorizontal !== undefined) {
                            if (mergeHorizontal !== 0) {
                                this.android(`${prefix}Horizontal`, $util$3.formatPX(mergeHorizontal));
                            }
                        }
                        else {
                            if (boxModel[left] !== 0) {
                                this.android(prefix + localizeLeft, $util$3.formatPX(boxModel[left]));
                            }
                            if (boxModel[right] !== 0) {
                                this.android(prefix + localizeRight, $util$3.formatPX(boxModel[right]));
                            }
                        }
                        if (mergeVertical !== undefined) {
                            if (mergeVertical !== 0) {
                                this.android(`${prefix}Vertical`, $util$3.formatPX(mergeVertical));
                            }
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
                }
            }
            autoSizeBoxModel() {
                if (!this.hasBit('excludeProcedure', $enum.NODE_PROCEDURE.AUTOFIT)) {
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
                            borderWidth = this.css('boxSizing') === 'content-box' || $dom$1.isUserAgent(16 /* FIREFOX */ | 8 /* EDGE */);
                        }
                        else if (this.styleElement && !this.hasBit('excludeResource', $enum.NODE_RESOURCE.BOX_SPACING)) {
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
                        const children = this.renderChildren;
                        let baseline;
                        if (children.some(node => node.floating) && !children.some(node => node.imageElement && node.baseline)) {
                            this.android('baselineAligned', 'false');
                        }
                        else {
                            baseline = $NodeList.baseline(children.filter(node => node.baseline && !node.layoutRelative && !node.layoutConstraint), true)[0];
                            if (baseline) {
                                this.android('baselineAlignedChildIndex', children.indexOf(baseline).toString());
                            }
                        }
                        let lineHeight = this.lineHeight;
                        this.renderEach(node => lineHeight = Math.max(lineHeight, node.lineHeight));
                        if (lineHeight > 0) {
                            this.setLineHeight(lineHeight);
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
            alignVerticalLayout() {
                const renderParent = this.renderParent;
                if (renderParent && !renderParent.layoutHorizontal) {
                    const lineHeight = this.lineHeight;
                    if (lineHeight > 0) {
                        const setMinHeight = () => {
                            const minHeight = this.android('minHeight');
                            const value = lineHeight + this.contentBoxHeight;
                            if ($util$3.convertInt(minHeight) < value) {
                                this.android('minHeight', $util$3.formatPX(value));
                                this.mergeGravity('gravity', 'center_vertical');
                            }
                        };
                        if (this.length === 0) {
                            if (!this.layoutHorizontal) {
                                if (this.support.lineHeight || this.inlineStatic && this.visibleStyle.background) {
                                    this.setLineHeight(lineHeight);
                                }
                                else {
                                    setMinHeight();
                                }
                            }
                        }
                        else if (this.layoutVertical) {
                            this.renderEach((node) => {
                                if (!node.layoutHorizontal) {
                                    node.setLineHeight(lineHeight);
                                }
                            });
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
            get support() {
                const cached = this.unsafe('cached') || {};
                if (cached.support === undefined) {
                    cached.support = {
                        lineHeight: this.textElement && this.supported('android', 'lineHeight'),
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
                    this._fontSize = parseInt($util$3.convertPX(this.css('fontSize'), 0)) || 16;
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

    var BASE_TMPL = `<?xml version="1.0" encoding="utf-8"?>
{:0}`;

    var $NodeList$1 = squared.base.NodeList;
    const $enum$1 = squared.base.lib.enumeration;
    const $color$1 = squared.lib.color;
    const $dom$2 = squared.lib.dom;
    const $math$1 = squared.lib.math;
    const $util$4 = squared.lib.util;
    const $xml$2 = squared.lib.xml;
    const GUIDELINE_AXIS = [AXIS_ANDROID.HORIZONTAL, AXIS_ANDROID.VERTICAL];
    function createColumnLayout(partition, horizontal) {
        for (const seg of partition) {
            const rowStart = seg[0];
            const rowEnd = seg[seg.length - 1];
            rowStart.anchor(horizontal ? 'left' : 'top', 'parent');
            rowEnd.anchor(horizontal ? 'right' : 'bottom', 'parent');
            for (let i = 0; i < seg.length; i++) {
                const chain = seg[i];
                const previous = seg[i - 1];
                const next = seg[i + 1];
                if (horizontal) {
                    chain.app('layout_constraintVertical_bias', '0');
                }
                else {
                    if (i > 0) {
                        chain.anchor('left', rowStart.documentId);
                    }
                }
                if (next) {
                    chain.anchor(horizontal ? 'rightLeft' : 'bottomTop', next.documentId);
                }
                if (previous) {
                    chain.anchor(horizontal ? 'leftRight' : 'topBottom', previous.documentId);
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
            const result = list.slice(0).sort((a, b) => {
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
                        return -1;
                    }
                }
                return 0;
            });
            if (!$util$4.isEqual(list, result)) {
                list.length = 0;
                list.push(...result);
                return true;
            }
        }
        return false;
    }
    function setBaselineLineHeight(node, baseline) {
        if (baseline.lineHeight > 0) {
            baseline.setLineHeight(baseline.lineHeight);
        }
        else if (node.lineHeight > 0) {
            baseline.setLineHeight(node.lineHeight + baseline.paddingTop + baseline.paddingBottom);
        }
    }
    function adjustBaseline(baseline, nodes) {
        for (const node of nodes) {
            if (node !== baseline) {
                if (node.imageElement && node.actualHeight > baseline.actualHeight) {
                    if (node.renderParent && $util$4.withinFraction(node.linear.top, node.renderParent.box.top)) {
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
                node.modifyBox(16 /* MARGIN_LEFT */, (previous.bounds.width + (previous.hasWidth ? previous.paddingLeft + previous.borderLeftWidth : 0)) - right);
                node.anchor('left', previous.documentId);
                previous.modifyBox(4 /* MARGIN_RIGHT */, null);
                return true;
            }
        }
        else if (node.float === 'right' && previous.float === 'right') {
            if (previous.marginLeft < 0) {
                const left = Math.abs(previous.marginLeft);
                if (left < previous.bounds.width) {
                    node.modifyBox(4 /* MARGIN_RIGHT */, previous.bounds.width - left);
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
        if ($util$4.isUnit(minWH)) {
            node.app(`layout_constraint${dimension}_min`, minWH);
            node.constraint.minWidth = true;
        }
        if ($util$4.isUnit(maxWH)) {
            node.app(`layout_constraint${dimension}_max`, maxWH);
            node.constraint.minHeight = true;
        }
    }
    function constraintPercentValue(node, dimension, value, requirePX) {
        if ($util$4.isPercent(value)) {
            if (requirePX) {
                node.android(`layout_${dimension.toLowerCase()}`, node.convertPercent(value, dimension === 'Width'));
            }
            else if (value !== '100%') {
                const percent = parseInt(value) / 100 + (node.actualParent ? node.contentBoxWidth / node.actualParent.box.width : 0);
                node.app(`layout_constraint${dimension}_percent`, percent.toPrecision(node.localSettings.constraintPercentAccuracy || 4));
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
    function isTargeted(node, parent) {
        if (parent.element && node.dataset.target) {
            const element = document.getElementById(node.dataset.target);
            return element !== null && element !== parent.element;
        }
        return false;
    }
    function getRootNamespace(value) {
        let output = '';
        for (const namespace in XMLNS_ANDROID) {
            if (value.indexOf(`${namespace}:`) !== -1) {
                output += `\n\t${getXmlNs(namespace)}`;
            }
        }
        return output;
    }
    function parseAttributes(node) {
        if (node.dir === 'rtl') {
            node.android(node.length ? 'layoutDirection' : 'textDirection', 'rtl');
        }
        const dataset = $dom$2.getDataSet(node.element, 'android');
        for (const name in dataset) {
            if (/^attr[A-Z]/.test(name)) {
                const obj = $util$4.capitalize(name.substring(4), false);
                for (const values of dataset[name].split(';')) {
                    const [key, value] = values.split('::');
                    if (key && value) {
                        node.attr(obj, key, value);
                    }
                }
            }
        }
        return combineAttributes(node, node.renderDepth + 1);
    }
    function combineAttributes(node, depth) {
        const indent = '\t'.repeat(depth);
        let output = '';
        for (const value of node.combine()) {
            output += `\n${indent + value}`;
        }
        return output;
    }
    class Controller extends squared.base.Controller {
        constructor() {
            super(...arguments);
            this.localSettings = {
                baseTemplate: BASE_TMPL,
                layout: {
                    pathName: 'res/layout',
                    fileExtension: 'xml'
                },
                unsupported: {
                    excluded: new Set(['BR']),
                    tagName: new Set(['OPTION', 'INPUT:hidden', 'MAP', 'AREA', 'IFRAME', 'svg'])
                },
                relative: {
                    boxWidthWordWrapPercent: 0.9,
                    superscriptFontScale: -4,
                    subscriptFontScale: -4
                },
                constraint: {
                    withinParentBottomOffset: 3.5,
                    percentAccuracy: 4
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
            const dimensionA = horizontal ? 'width' : 'height';
            const dimensionB = horizontal ? 'height' : 'width';
            let basis = node.flexbox.basis;
            if (basis !== 'auto') {
                if ($util$4.isPercent(basis)) {
                    if (basis !== '0%') {
                        node.app(`layout_constraint${horizontal ? 'Width' : 'Height'}_percent`, (parseInt(basis) / 100).toPrecision(2));
                        basis = '';
                    }
                }
                else if ($util$4.isUnit(basis)) {
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
                else if ($util$4.isUnit(size)) {
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
            if ($util$4.isUnit(sizeB)) {
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
            const views = [...data.views, ...data.includes];
            if (this.userSettings.showAttributes) {
                for (const node of data.cache) {
                    if (node.visible) {
                        const hash = $xml$2.formatPlaceholder(node.id, '@');
                        if (views.length === 1) {
                            views[0].content = views[0].content.replace(hash, parseAttributes(node));
                        }
                        else {
                            for (const view of views) {
                                if (view.content.indexOf(hash) !== -1) {
                                    view.content = view.content.replace(hash, parseAttributes(node));
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            for (const view of views) {
                view.content = this.removePlaceholders(replaceTab(replaceUnit(view.content.replace(/{#0}/, getRootNamespace(view.content)), this.userSettings.resolutionDPI, this.userSettings.convertPixels), this.userSettings.insertSpaces));
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
                    if (node.documentRoot && isTargeted(child, node)) {
                        node.hide();
                        next = true;
                    }
                    else if (this.userSettings.collapseUnattributedElements &&
                        node.element &&
                        node.positionStatic &&
                        !$util$4.hasValue(node.element.id) &&
                        !$util$4.hasValue(node.dataset.use) &&
                        !$util$4.hasValue(node.dataset.target) &&
                        !node.hasWidth &&
                        !node.hasHeight &&
                        !node.has('maxWidth') &&
                        !node.has('maxHeight') &&
                        !node.visibleStyle.background &&
                        !node.has('textAlign') && !node.has('verticalAlign') &&
                        node.toInt('lineHeight') > 0 &&
                        !node.rightAligned && !node.autoMargin.horizontal &&
                        !node.groupParent &&
                        !node.companion &&
                        !this.hasAppendProcessing(node.id)) {
                        child.documentRoot = node.documentRoot;
                        child.siblingIndex = node.siblingIndex;
                        child.parent = layout.parent;
                        node.renderAs = child;
                        node.resetBox(30 /* MARGIN */ | 480 /* PADDING */, child, true);
                        node.hide();
                        renderAs = child;
                    }
                    else {
                        layout.setType(CONTAINER_NODE.FRAME, 2048 /* SINGLE */);
                    }
                }
                else {
                    layout.init();
                    if ($dom$2.hasLineBreak(node.element, true)) {
                        layout.setType(CONTAINER_NODE.LINEAR, 16 /* VERTICAL */, 2 /* UNKNOWN */);
                    }
                    else if (this.checkConstraintFloat(layout)) {
                        layout.setType(CONTAINER_NODE.CONSTRAINT, 1024 /* NOWRAP */);
                    }
                    else if (layout.linearX) {
                        if (this.checkFrameHorizontal(layout)) {
                            layout.renderType = 64 /* FLOAT */ | 8 /* HORIZONTAL */;
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
                                layout.renderPosition = sortHorizontalFloat(layout.children);
                            }
                        }
                        layout.add(8 /* HORIZONTAL */);
                    }
                    else if (layout.linearY) {
                        layout.setType(CONTAINER_NODE.LINEAR, 16 /* VERTICAL */, node.documentRoot ? 2 /* UNKNOWN */ : 0);
                    }
                    else if (layout.every(item => item.inlineFlow)) {
                        if (this.checkFrameHorizontal(layout)) {
                            layout.renderType = 64 /* FLOAT */ | 8 /* HORIZONTAL */;
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
            const visible = node.visibleStyle;
            let next = false;
            if (node.inlineText || visible.borderWidth && node.textContent.length) {
                layout.setType(CONTAINER_NODE.TEXT);
            }
            else if (visible.backgroundImage && !visible.backgroundRepeat && (!node.inlineText || node.toInt('textIndent') + node.bounds.width < 0)) {
                layout.setType(CONTAINER_NODE.IMAGE, 2048 /* SINGLE */);
                node.exclude({ resource: $enum$1.NODE_RESOURCE.FONT_STYLE | $enum$1.NODE_RESOURCE.VALUE_STRING });
            }
            else if (node.block && (visible.borderWidth || visible.backgroundImage || visible.paddingVertical)) {
                layout.setType(CONTAINER_NODE.LINE);
            }
            else if (!node.documentRoot) {
                if (this.userSettings.collapseUnattributedElements &&
                    node.element &&
                    node.bounds.height === 0 &&
                    !visible.background &&
                    !$util$4.hasValue(node.element.id) &&
                    !$util$4.hasValue(node.dataset.use)) {
                    node.hide();
                    next = true;
                }
                else {
                    layout.setType(visible.background ? CONTAINER_NODE.TEXT : CONTAINER_NODE.FRAME);
                }
            }
            return { layout, next };
        }
        processTraverseHorizontal(layout, siblings) {
            const parent = layout.parent;
            if (this.checkFrameHorizontal(layout)) {
                layout.node = this.createNodeGroup(layout.node, layout.children, layout.parent);
                layout.renderType |= 64 /* FLOAT */ | 8 /* HORIZONTAL */;
            }
            else if (siblings === undefined || layout.length !== siblings.length) {
                layout.node = this.createNodeGroup(layout.node, layout.children, layout.parent);
                this.processLayoutHorizontal(layout);
            }
            else {
                parent.alignmentType |= 8 /* HORIZONTAL */;
            }
            return { layout };
        }
        processTraverseVertical(layout, siblings) {
            const parent = layout.parent;
            if (layout.floated.size && layout.cleared.size && !(layout.floated.size === 1 && layout.every((node, index) => index === 0 || index === layout.length - 1 || layout.cleared.has(node)))) {
                layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                layout.renderType |= 64 /* FLOAT */ | 16 /* VERTICAL */;
            }
            else if (siblings === undefined || layout.length !== siblings.length) {
                if (!parent.layoutVertical) {
                    layout.node = this.createNodeGroup(layout.node, layout.children, parent);
                    layout.setType(CONTAINER_NODE.LINEAR, 16 /* VERTICAL */);
                }
            }
            else {
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
                    layout.renderPosition = sortHorizontalFloat(layout.children);
                }
            }
            if (containerType !== 0) {
                layout.setType(containerType, 8 /* HORIZONTAL */);
            }
            return { layout };
        }
        sortRenderPosition(parent, children) {
            if (parent.layoutConstraint && children.some(item => !item.pageFlow)) {
                const ordered = [];
                const below = [];
                const middle = [];
                const above = [];
                for (const item of children) {
                    if (item.pageFlow || item.actualParent !== parent) {
                        middle.push(item);
                    }
                    else {
                        if (item.zIndex >= 0) {
                            above.push(item);
                        }
                        else {
                            below.push(item);
                        }
                    }
                }
                ordered.push(...$util$4.sortArray(below, true, 'zIndex', 'id'));
                ordered.push(...middle);
                ordered.push(...$util$4.sortArray(above, true, 'zIndex', 'id'));
                return ordered;
            }
            return [];
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
                else if (!this.userSettings.floatOverlapDisabled && layout.floated.has('left') && sibling.some(node => node.blockStatic)) {
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
            return (layout.floated.size === 1 &&
                layout.every(node => node.floating && node.marginLeft >= 0 && node.marginRight >= 0 && (!node.positionRelative || node.left >= 0 && node.top >= 0)));
        }
        checkConstraintHorizontal(layout) {
            let sameHeight = true;
            for (let i = 1; i < layout.length; i++) {
                if (layout.children[i - 1].bounds.height !== layout.children[i].bounds.height) {
                    sameHeight = false;
                    break;
                }
            }
            return (!sameHeight &&
                !layout.parent.hasHeight &&
                layout.some(node => node.verticalAlign === 'bottom') &&
                layout.every(node => node.inlineVertical && (node.baseline || node.verticalAlign === 'bottom')));
        }
        checkRelativeHorizontal(layout) {
            if (layout.floated.size === 2) {
                return false;
            }
            return layout.some(node => node.positionRelative || node.textElement || node.imageElement || !node.baseline);
        }
        setConstraints() {
            for (const node of this.cache) {
                if (node.visible && (node.layoutRelative || node.layoutConstraint) && !node.hasBit('excludeProcedure', $enum$1.NODE_PROCEDURE.CONSTRAINT)) {
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
                                    else if ($util$4.withinFraction(item.linear.left, node.box.left) || item.linear.left < node.box.left) {
                                        item.anchor('left', 'parent');
                                    }
                                    if ($util$4.withinFraction(item.linear.top, node.box.top) || item.linear.top < node.box.top) {
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
            const node = layout.node;
            const options = createViewAttribute();
            let valid = false;
            switch (layout.containerType) {
                case CONTAINER_NODE.LINEAR:
                    if ($util$4.hasBit(layout.alignmentType, 16 /* VERTICAL */)) {
                        options.android.orientation = AXIS_ANDROID.VERTICAL;
                        valid = true;
                    }
                    else if ($util$4.hasBit(layout.alignmentType, 8 /* HORIZONTAL */)) {
                        options.android.orientation = AXIS_ANDROID.HORIZONTAL;
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
            }
            if (valid) {
                const target = $util$4.hasValue(node.dataset.target) && !$util$4.hasValue(node.dataset.use);
                const controlName = View.getControlName(layout.containerType);
                node.alignmentType |= layout.alignmentType;
                node.setControlType(controlName, layout.containerType);
                node.render(target ? node : layout.parent);
                node.apply(options);
                return this.getEnclosingTag(controlName, node.id, target ? -1 : node.renderDepth, $xml$2.formatPlaceholder(node.id));
            }
            return '';
        }
        renderNode(layout) {
            const node = layout.node;
            const parent = layout.parent;
            node.alignmentType |= layout.alignmentType;
            const controlName = View.getControlName(layout.containerType);
            node.setControlType(controlName, layout.containerType);
            const target = $util$4.hasValue(node.dataset.target) && !$util$4.hasValue(node.dataset.use);
            switch (node.element && node.element.tagName) {
                case 'IMG': {
                    if (!node.hasBit('excludeResource', $enum$1.NODE_RESOURCE.IMAGE_SOURCE)) {
                        const element = node.element;
                        const widthPercent = node.has('width', 32 /* PERCENT */);
                        const heightPercent = node.has('height', 32 /* PERCENT */);
                        let width = node.toInt('width');
                        let height = node.toInt('height');
                        let scaleType = '';
                        if (widthPercent || heightPercent) {
                            scaleType = widthPercent && heightPercent ? 'fitXY' : 'fitCenter';
                        }
                        else {
                            if (width === 0) {
                                const match = /width="(\d+)"/.exec(element.outerHTML);
                                if (match) {
                                    width = parseInt(match[1]);
                                    node.css('width', $util$4.formatPX(match[1]), true);
                                }
                            }
                            if (height === 0) {
                                const match = /height="(\d+)"/.exec(element.outerHTML);
                                if (match) {
                                    height = parseInt(match[1]);
                                    node.css('height', $util$4.formatPX(match[1]), true);
                                }
                            }
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
                        if (width > 0 && height === 0 || width === 0 && height > 0) {
                            node.android('adjustViewBounds', 'true');
                        }
                        if (node.baseline) {
                            node.android('baselineAlignBottom', 'true');
                        }
                        const src = Resource.addImageSrcSet(element);
                        if (src !== '') {
                            node.android('src', `@drawable/${src}`);
                        }
                        if (!node.pageFlow && node.left < 0 || node.top < 0) {
                            const absoluteParent = node.absoluteParent;
                            if (absoluteParent && absoluteParent.css('overflow') === 'hidden') {
                                const container = this.application.createNode($dom$2.createElement(node.actualParent ? node.actualParent.element : null));
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
                                container.render(target ? container : parent);
                                container.companion = node;
                                container.saveAsInitial();
                                node.modifyBox(2 /* MARGIN_TOP */, node.top);
                                node.modifyBox(16 /* MARGIN_LEFT */, node.left);
                                node.render(container);
                                return this.getEnclosingTag(CONTAINER_ANDROID.FRAME, container.id, target ? -1 : container.renderDepth, this.getEnclosingTag(controlName, node.id, target ? 0 : node.renderDepth));
                            }
                        }
                    }
                    break;
                }
                case 'TEXTAREA': {
                    const element = node.element;
                    node.android('minLines', '2');
                    if (element.rows > 2) {
                        node.android('lines', element.rows.toString());
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
                case 'SELECT': {
                    const element = node.element;
                    if (element.size > 1 && !node.cssInitial('verticalAlign')) {
                        node.css('verticalAlign', 'text-bottom', true);
                    }
                    break;
                }
                case 'INPUT': {
                    const element = node.element;
                    switch (element.type) {
                        case 'password':
                            node.android('inputType', 'textPassword');
                            break;
                        case 'text':
                            node.android('inputType', 'text');
                            break;
                        case 'range':
                            if ($util$4.hasValue(element.min)) {
                                node.android('min', element.min);
                            }
                            if ($util$4.hasValue(element.max)) {
                                node.android('max', element.max);
                            }
                            if ($util$4.hasValue(element.value)) {
                                node.android('progress', element.value);
                            }
                            break;
                        case 'image':
                            if (!node.hasBit('excludeResource', $enum$1.NODE_RESOURCE.IMAGE_SOURCE)) {
                                const result = Resource.addImage({ mdpi: element.src });
                                if (result !== '') {
                                    node.android('src', `@drawable/${result}`, false);
                                }
                            }
                            break;
                    }
                    switch (element.type) {
                        case 'text':
                        case 'search':
                        case 'tel':
                        case 'url':
                        case 'email':
                        case 'password':
                            if (!node.hasWidth && element.size > 0) {
                                node.css('width', $util$4.formatPX(element.size * 8), true);
                            }
                            break;
                    }
                    break;
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
            switch (node.controlName) {
                case CONTAINER_ANDROID.TEXT:
                    const overflow = [];
                    if (node.overflowX) {
                        overflow.push(AXIS_ANDROID.HORIZONTAL);
                    }
                    if (node.overflowY) {
                        overflow.push(AXIS_ANDROID.VERTICAL);
                    }
                    if (overflow.length) {
                        node.android('scrollbars', overflow.join('|'));
                    }
                    if (node.has('letterSpacing')) {
                        node.android('letterSpacing', node.css('letterSpacing'));
                    }
                    if (node.css('textAlign') === 'justify') {
                        node.android('justificationMode', 'inter_word');
                    }
                    if (node.has('textShadow')) {
                        const value = node.css('textShadow');
                        [/^(rgba?\(\d+, \d+, \d+(?:, [\d.]+)?\)) ([\d.]+[a-z]+) ([\d.]+[a-z]+) ([\d.]+[a-z]+)$/, /^([\d.]+[a-z]+) ([\d.]+[a-z]+) ([\d.]+[a-z]+) (.+)$/].some((pattern, index) => {
                            const match = value.match(pattern);
                            if (match) {
                                const color = $color$1.parseRGBA(match[index === 0 ? 1 : 4]);
                                if (color) {
                                    const colorName = Resource.addColor(color);
                                    if (colorName !== '') {
                                        node.android('shadowColor', `@color/${colorName}`);
                                    }
                                }
                                node.android('shadowDx', $util$4.convertInt(match[index === 0 ? 2 : 1]).toString());
                                node.android('shadowDy', $util$4.convertInt(match[index === 0 ? 3 : 2]).toString());
                                node.android('shadowRadius', $util$4.convertInt(match[index === 0 ? 4 : 3]).toString());
                                return true;
                            }
                            return false;
                        });
                    }
                    if (node.lineHeight > 0 && node.multiline) {
                        if (node.support.lineHeight) {
                            node.android('lineHeight', $util$4.formatPX(node.lineHeight));
                        }
                        else {
                            node.android('lineSpacingExtra', $util$4.formatPX(node.lineHeight / 2));
                        }
                    }
                    if (node.css('whiteSpace') === 'nowrap') {
                        node.android('singleLine', 'true');
                    }
                    break;
                case CONTAINER_ANDROID.BUTTON:
                    if (!node.cssInitial('verticalAlign')) {
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
                    node.android('maxWidth', node.convertPX(node.css('maxWidth')));
                }
                if (node.has('maxHeight')) {
                    node.android('maxHeight', node.convertPX(node.css('maxHeight'), false));
                }
            }
            node.render(target ? node : parent);
            return this.getEnclosingTag(controlName, node.id, target ? -1 : node.renderDepth);
        }
        renderNodeStatic(controlName, depth, options = {}, width = '', height = '', node, children) {
            const renderDepth = Math.max(0, depth);
            if (node === undefined) {
                node = new View(0, undefined, this.afterInsertNode);
            }
            else {
                node.renderDepth = renderDepth;
                node.rendered = true;
            }
            node.apply(options);
            node.android('layout_width', width, false);
            node.android('layout_height', height, false);
            if (node.containerType === 0 || node.controlName === '') {
                node.setControlType(controlName);
            }
            let output = this.getEnclosingTag(controlName, node.id, !node.documentRoot && depth === 0 ? -1 : depth, children ? $xml$2.formatPlaceholder(node.id) : '');
            if (this.userSettings.showAttributes && node.id === 0) {
                output = output.replace($xml$2.formatPlaceholder(node.id, '@'), combineAttributes(node, renderDepth + 1));
            }
            options.documentId = node.documentId;
            return output;
        }
        renderSpace(depth, width, height = '', columnSpan = 0, rowSpan = 0, options) {
            options = createViewAttribute(options);
            let percentWidth = '';
            let percentHeight = '';
            if ($util$4.isPercent(width)) {
                percentWidth = (parseInt(width) / 100).toPrecision(2);
                options.android.layout_columnWeight = percentWidth;
                width = '0px';
            }
            if ($util$4.isPercent(height)) {
                percentHeight = (parseInt(height) / 100).toPrecision(2);
                options.android.layout_rowWeight = percentHeight;
                height = '0px';
            }
            if (columnSpan > 0) {
                options.android.layout_columnSpan = columnSpan.toString();
            }
            if (rowSpan > 0) {
                options.android.layout_rowSpan = rowSpan.toString();
            }
            return this.renderNodeStatic(CONTAINER_ANDROID.SPACE, depth, options, width, $util$4.hasValue(height) ? height : 'wrap_content');
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
                    if ($util$4.withinFraction(node.linear[LT], documentParent.box[LT])) {
                        node.anchor(LT, 'parent', true);
                        return;
                    }
                    const dimension = node.positionStatic ? 'bounds' : 'linear';
                    let beginPercent = 'layout_constraintGuide_';
                    let usePercent = false;
                    let location;
                    if (!node.pageFlow && $util$4.isPercent(node.css(LT))) {
                        location = parseInt(node.css(LT)) / 100;
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
                                        if ($util$4.withinFraction(node.linear[LT], item.linear[RB])) {
                                            node.anchor(LTRB, item.documentId, true);
                                            valid = true;
                                        }
                                        else if ($util$4.withinFraction(node.linear[RB], item.linear[LT])) {
                                            node.anchor(RBLT, item.documentId, true);
                                            valid = true;
                                        }
                                    }
                                    if (pageFlow || !node.pageFlow && !item.pageFlow) {
                                        if ($util$4.withinFraction(node.bounds[LT], item.bounds[LT])) {
                                            node.anchor(!horizontal && node.textElement && node.baseline && item.textElement && item.baseline ? 'baseline' : LT, item.documentId, true);
                                            valid = true;
                                        }
                                        else if ($util$4.withinFraction(node.bounds[RB], item.bounds[RB])) {
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
                            location = parseFloat(Math.abs(position - (!opposite ? 0 : 1)).toPrecision(this.localSettings.constraint.percentAccuracy));
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
                            if (horizontal) {
                                location = adjustDocumentRootOffset(location, documentParent, 'Left');
                            }
                            else {
                                const reset = documentParent.valueBox(32 /* PADDING_TOP */);
                                location = adjustDocumentRootOffset(location, documentParent, 'Top', reset[0] === 1);
                            }
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
                    else if (horizontal && documentParent.hasWidth && !node.has('right') && location + node[dimension].width >= documentParent.box.right ||
                        !horizontal && documentParent.hasHeight && !node.has('bottom') && location + node[dimension].height >= documentParent.box.bottom) {
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
                        this.appendAfter(node.id, this.renderNodeStatic(CONTAINER_ANDROID.GUIDELINE, node.renderDepth, options, 'wrap_content', 'wrap_content'));
                        const documentId = options['documentId'];
                        node.anchor(LT, documentId, true);
                        node.anchorDelete(RB);
                        $util$4.defaultWhenNull(guideline, value, beginPercent, LT, documentId, location.toString());
                        parent.constraint.guideline = guideline;
                        node.constraint[horizontal ? 'guidelineHorizontal' : 'guidelineVertical'] = documentId;
                    }
                }
            });
        }
        createNodeGroup(node, children, parent, replaceWith) {
            const group = new ViewGroup(this.cache.nextId, node, children, this.afterInsertNode);
            group.siblingIndex = node.siblingIndex;
            if (parent) {
                parent.appendTry(replaceWith || node, group);
                group.init();
            }
            this.cache.append(group);
            return group;
        }
        createNodeWrapper(node, parent, controlName, containerType) {
            const container = this.application.createNode($dom$2.createElement(node.actualParent ? node.actualParent.element : null, node.block));
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
                resource: $enum$1.NODE_RESOURCE.ALL
            });
            container.siblingIndex = node.siblingIndex;
            if (parent) {
                parent.appendTry(node, container);
                node.siblingIndex = 0;
                if (node.renderPosition !== -1) {
                    container.renderPositionId = node.renderPositionId;
                    node.renderPosition = -1;
                }
                node.parent = container;
            }
            container.saveAsInitial();
            this.application.processing.cache.append(container, !parent);
            node.unsetCache();
            return container;
        }
        processRelativeHorizontal(node, children) {
            const cleared = $NodeList$1.cleared(children);
            const boxWidth = Math.ceil((() => {
                const renderParent = node.renderParent;
                if (renderParent) {
                    if (renderParent.overflowX) {
                        if (node.has('width', 2 /* UNIT */)) {
                            return node.toInt('width', true);
                        }
                        else if (renderParent.has('width', 2 /* UNIT */)) {
                            return renderParent.toInt('width', true);
                        }
                        else if (renderParent.has('width', 32 /* PERCENT */)) {
                            return renderParent.bounds.width - renderParent.contentBoxWidth;
                        }
                    }
                    else {
                        let floatStart = Number.NEGATIVE_INFINITY;
                        $util$4.captureMap(renderParent.children, item => item.float === 'left' && item.siblingIndex < node.siblingIndex, item => floatStart = Math.max(floatStart, item.linear.right));
                        if (floatStart !== Number.NEGATIVE_INFINITY && children.some(item => item.linear.left === floatStart)) {
                            return node.box.right - floatStart;
                        }
                    }
                }
                return node.box.width;
            })());
            const wrapWidth = boxWidth * this.localSettings.relative.boxWidthWordWrapPercent;
            const checkLineWrap = node.css('whiteSpace') !== 'nowrap';
            const firefoxEdge = $dom$2.isUserAgent(16 /* FIREFOX */ | 8 /* EDGE */);
            const rows = [];
            const rangeMultiLine = new Set();
            let alignmentMultiLine = false;
            let rowWidth = 0;
            let rowPreviousLeft;
            let rowPreviousBottom;
            const [right, left] = $util$4.partitionArray(children, item => item.float === 'right');
            sortHorizontalFloat(left);
            for (const seg of [left, right]) {
                const alignParent = seg === left ? 'left' : 'right';
                for (let i = 0; i < seg.length; i++) {
                    const item = seg[i];
                    const previous = seg[i - 1];
                    let dimension = item.bounds;
                    if (item.element && !item.hasWidth && item.inlineText) {
                        const bounds = $dom$2.getRangeClientRect(item.element);
                        if (bounds.multiline || bounds.width < item.box.width) {
                            dimension = bounds;
                            if (item.multiline === 0) {
                                item.multiline = bounds.multiline;
                            }
                            if (firefoxEdge && bounds.multiline && !/^\s*\n+/.test(item.textContent)) {
                                rangeMultiLine.add(item);
                            }
                        }
                    }
                    let alignSibling = seg === left ? 'leftRight' : 'rightLeft';
                    let siblings = [];
                    if (i === 0) {
                        item.anchor(alignParent, 'true');
                        rows.push([item]);
                    }
                    else {
                        function checkWidthWrap() {
                            const baseWidth = (rowPreviousLeft && rows.length > 1 ? rowPreviousLeft.linear.width : 0) + rowWidth + item.marginLeft + (previous.float === 'left' && !cleared.has(item) ? 0 : dimension.width) - (firefoxEdge ? item.borderRightWidth : 0);
                            return !item.rightAligned && (Math.floor(baseWidth) - (item.styleElement && item.inlineStatic ? item.paddingLeft + item.paddingRight : 0) > boxWidth);
                        }
                        if (adjustFloatingNegativeMargin(item, previous)) {
                            alignSibling = '';
                        }
                        const viewGroup = item.groupParent && !item.hasAlign(128 /* SEGMENTED */);
                        siblings = !viewGroup && item.element && item.inlineVertical && previous.inlineVertical ? $dom$2.getElementsBetween(previous.element, item.element, true) : [];
                        const startNewRow = (() => {
                            if (item.textElement) {
                                let connected = false;
                                if (previous.textElement) {
                                    if (i === 1 && item.plainText && !previous.rightAligned) {
                                        connected = siblings.length === 0 && !/\s+$/.test(previous.textContent) && !/^\s+/.test(item.textContent);
                                    }
                                    if (checkLineWrap && !connected && (rangeMultiLine.has(previous) || previous.multiline && $dom$2.hasLineBreak(previous.element, false, true))) {
                                        return true;
                                    }
                                }
                                if (checkLineWrap && !connected && (checkWidthWrap() || item.multiline && $dom$2.hasLineBreak(item.element) || item.preserveWhiteSpace && /^\s*\n+/.test(item.textContent))) {
                                    return true;
                                }
                            }
                            return false;
                        })();
                        const rowItems = rows[rows.length - 1];
                        const previousSiblings = item.previousSiblings();
                        if (startNewRow || (viewGroup ||
                            !item.textElement && checkWidthWrap() ||
                            item.linear.top >= previous.linear.bottom && (item.blockStatic ||
                                item.floating && previous.float === item.float) ||
                            !item.floating && (previous.blockStatic ||
                                previousSiblings.some(sibling => sibling.lineBreak || sibling.excluded && sibling.blockStatic) ||
                                siblings.some(element => $dom$2.isLineBreak(element))) ||
                            cleared.has(item))) {
                            rowPreviousBottom = rowItems.find(subitem => !subitem.floating) || rowItems[0];
                            for (let j = 0; j < rowItems.length; j++) {
                                if (rowItems[j] !== rowPreviousBottom && rowItems[j].linear.bottom > rowPreviousBottom.linear.bottom && (!rowItems[j].floating || (rowItems[j].floating && rowPreviousBottom.floating))) {
                                    rowPreviousBottom = rowItems[j];
                                }
                            }
                            item.anchor('topBottom', rowPreviousBottom.documentId);
                            if (rowPreviousLeft && item.linear.bottom <= rowPreviousLeft.bounds.bottom) {
                                item.anchor(alignSibling, rowPreviousLeft.documentId);
                            }
                            else {
                                item.anchor(alignParent, 'true');
                                rowPreviousLeft = undefined;
                            }
                            if (startNewRow && item.multiline) {
                                checkSingleLine(previous, checkLineWrap);
                            }
                            rowWidth = Math.min(0, startNewRow && !previous.multiline && item.multiline && !cleared.has(item) ? item.linear.right - node.box.right : 0);
                            rows.push([item]);
                        }
                        else {
                            if (alignSibling !== '') {
                                item.anchor(alignSibling, previous.documentId);
                            }
                            if (rowPreviousBottom) {
                                item.anchor('topBottom', rowPreviousBottom.documentId);
                            }
                            rowItems.push(item);
                        }
                    }
                    if (item.float === 'left') {
                        rowPreviousLeft = item;
                    }
                    let previousOffset = 0;
                    if (siblings.length && !siblings.some(element => !!$dom$2.getElementAsNode(element) || $dom$2.isLineBreak(element))) {
                        const betweenStart = $dom$2.getRangeClientRect(siblings[0]);
                        const betweenEnd = siblings.length > 1 ? $dom$2.getRangeClientRect(siblings[siblings.length - 1]) : null;
                        if (!betweenStart.multiline && (betweenEnd === null || !betweenEnd.multiline)) {
                            previousOffset = betweenEnd ? betweenStart.left - betweenEnd.right : betweenStart.width;
                        }
                    }
                    rowWidth += previousOffset + item.marginLeft + dimension.width + item.marginRight;
                    if (Math.ceil(rowWidth) >= wrapWidth && !item.alignParent(alignParent)) {
                        checkSingleLine(item, checkLineWrap);
                    }
                }
            }
            if (rows.length > 1) {
                node.alignmentType |= 4096 /* MULTILINE */;
                alignmentMultiLine = true;
            }
            for (let i = 0; i < rows.length; i++) {
                let baseline;
                if (rows[i].length > 1) {
                    const baselineItems = $NodeList$1.baseline(rows[i]);
                    baseline = baselineItems[0];
                    const textBaseline = $NodeList$1.baseline(rows[i], true)[0];
                    let textBottom = getTextBottom(rows[i]);
                    if (baseline && textBottom && textBottom.bounds.height > baseline.bounds.height) {
                        baseline.anchor('bottom', textBottom.documentId);
                    }
                    else {
                        textBottom = undefined;
                    }
                    const baselineAlign = [];
                    let documentId = i === 0 ? 'true' : (baseline ? baseline.documentId : '');
                    const tryHeight = (child) => {
                        if (!alignmentMultiLine) {
                            if (baselineItems.includes(child) || child.actualParent && child.actualHeight >= child.actualParent.box.height) {
                                return true;
                            }
                            else if (!node.hasHeight) {
                                node.css('height', $util$4.formatPX(node.bounds.height), true);
                            }
                        }
                        return false;
                    };
                    for (const item of rows[i]) {
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
                                            const height = Math.max(item.bounds.height, item.lineHeight);
                                            const heightParent = Math.max(baseline.bounds.height, baseline.lineHeight);
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
                                        if (tryHeight(item)) {
                                            documentId = '';
                                        }
                                        if (documentId) {
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
                    baseline = rows[i][0];
                }
                if (baseline) {
                    setBaselineLineHeight(node, baseline);
                }
            }
        }
        processConstraintHorizontal(node, children) {
            const baseline = $NodeList$1.baseline(children)[0];
            const textBaseline = $NodeList$1.baseline(children, true)[0];
            let textBottom = getTextBottom(children);
            const reverse = node.hasAlign(512 /* RIGHT */);
            if (baseline) {
                baseline.baselineActive = true;
                if (textBottom && baseline.bounds.height < textBottom.bounds.height) {
                    baseline.anchor('bottom', textBottom.documentId);
                }
                else {
                    textBottom = undefined;
                }
                setBaselineLineHeight(node, baseline);
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
                            if (textBaseline && item !== textBaseline) {
                                item.anchor('top', textBaseline.documentId);
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
                            if (textBaseline && item !== textBaseline && item !== textBottom) {
                                item.anchor('bottom', textBaseline.documentId);
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
                    totalGap += $math$1.maxArray($util$4.objectMap(item.children, child => child.marginLeft + child.marginRight));
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
                        percent = item.toInt('width') / 100;
                    }
                    else {
                        percent = (1 / columnCount) - percentGap;
                    }
                    if (percent > 0) {
                        item.android('layout_width', '0px');
                        item.app('layout_constraintWidth_percent', percent.toPrecision(2));
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
            const boxParent = $NodeList$1.actualParent(children) || node;
            const floating = node.hasAlign(64 /* FLOAT */);
            const cleared = chainHorizontal.length > 1 && node.hasAlign(1024 /* NOWRAP */) ? $NodeList$1.clearedAll(boxParent) : new Map();
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
                        if ($util$4.withinFraction(item.linear.right, boxParent.box.right) || item.linear.right > boxParent.box.right) {
                            item.anchor('right', 'parent');
                        }
                    }
                    else if ($util$4.withinFraction(item.linear.left, boxParent.box.left) || item.linear.left < boxParent.box.left) {
                        item.anchor('left', 'parent');
                    }
                }
                if ($util$4.withinFraction(item.linear.top, node.box.top) || item.linear.top < node.box.top || item.floating && chainHorizontal.length === 1) {
                    item.anchor('top', 'parent');
                }
                if (this.withinParentBottom(item.linear.bottom, bottomParent) && !boxParent.documentBody && (boxParent.hasHeight || !item.alignParent('top'))) {
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
                if (boxParent.css('textAlign') === 'center') {
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
                        const nodes = [];
                        if (aboveEnd) {
                            nodes.push(aboveEnd);
                            if (chain.element) {
                                nodes.push(...$util$4.flatMap($dom$2.getElementsBetween(aboveEnd.element, chain.element), element => $dom$2.getElementAsNode(element)));
                            }
                        }
                        else {
                            nodes.push(previousEnd);
                        }
                        if (floating && (cleared.size === 0 || !nodes.some(item => cleared.has(item)))) {
                            if (previousRow.length) {
                                chain.anchor('topBottom', aboveEnd.documentId);
                                if (aboveEnd.alignSibling('bottomTop') === '') {
                                    aboveEnd.anchor('bottomTop', chain.documentId);
                                }
                                for (let k = previousSiblings.length - 2; k >= 0; k--) {
                                    const aboveBefore = previousSiblings[k];
                                    if (aboveBefore.linear.bottom > aboveEnd.linear.bottom) {
                                        const offset = reverse ? Math.ceil(aboveBefore.linear[anchorEnd]) - Math.floor(boxParent.box[anchorEnd]) : Math.ceil(boxParent.box[anchorEnd]) - Math.floor(aboveBefore.linear[anchorEnd]);
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
                    constraintPercentAccuracy: this.localSettings.constraint.percentAccuracy,
                    customizationsOverwritePrivilege: settings.customizationsOverwritePrivilege !== undefined ? settings.customizationsOverwritePrivilege : true
                };
            };
        }
    }

    class ExtensionManager extends squared.base.ExtensionManager {
    }

    var COLOR_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<resources>
<<A>>
	<color name="{&value}">{&name}</color>
<<A>>
</resources>
<!-- filename: res/values/colors.xml -->`;

    var DIMEN_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<resources>
<<A>>
	<dimen name="{&name}">{&value}</dimen>
<<A>>
</resources>
<!-- filename: res/values/dimens.xml -->`;

    var DRAWABLE_TMPL = `{&value}
<!-- filename: {&name} -->`;

    var FONT_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<font-family {&namespace}>
<<A>>
	<font android:fontStyle="{&style}" android:fontWeight="{&weight}" android:font="{&font}" />
<<A>>
</font-family>
<!-- filename: res/font/{&name}.xml -->`;

    var STRING_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<resources>
<<A>>
	<string name="{&name}">{~value}</string>
<<A>>
</resources>
<!-- filename: res/values/strings.xml -->`;

    var STRINGARRAY_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<resources>
<<A>>
	<string-array name="{&name}">
	<<AA>>
		<item>{&value}</item>
	<<AA>>
	</string-array>
<<A>>
</resources>
<!-- filename: res/values/string_arrays.xml -->`;

    var STYLE_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<resources>
<<A>>
	<style name="{&name}" parent="{~parent}">
	<<items>>
		<item name="{&name}">{&value}</item>
	<<items>>
	</style>
<<A>>
</resources>
<!-- filename: {0} -->`;

    const $util$5 = squared.lib.util;
    const $xml$3 = squared.lib.xml;
    function parseImageDetails(files) {
        const result = [];
        const pattern = /^<!-- image: (.+) -->\n<!-- filename: (.+)\/(.+?\.\w+) -->$/;
        for (const xml of files) {
            const match = pattern.exec(xml);
            if (match) {
                result.push({
                    uri: match[1],
                    pathname: match[2],
                    filename: match[3],
                    content: ''
                });
            }
        }
        return result;
    }
    function parseFileDetails(files) {
        const result = [];
        const pattern = /^[\w\W]*?(<!-- filename: (.+)\/(.+?\.xml) -->)$/;
        for (const xml of files) {
            const match = pattern.exec(xml);
            if (match) {
                result.push({
                    content: match[0].replace(match[1], '').trim(),
                    pathname: match[2],
                    filename: match[3]
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
            const views = [...data.views, ...data.includes];
            for (let i = 0; i < views.length; i++) {
                const view = views[i];
                files.push(createFileAsset(view.pathname, i === 0 ? this.userSettings.outputMainFileName : `${view.filename}.xml`, view.content));
            }
            files.push(...parseFileDetails(this.resourceStringToXml()));
            files.push(...parseFileDetails(this.resourceStringArrayToXml()));
            files.push(...parseFileDetails(this.resourceFontToXml()));
            files.push(...parseFileDetails(this.resourceColorToXml()));
            files.push(...parseFileDetails(this.resourceStyleToXml()));
            files.push(...parseFileDetails(this.resourceDimenToXml()));
            files.push(...parseFileDetails(this.resourceDrawableToXml()));
            files.push(...parseImageDetails(this.resourceDrawableImageToXml()));
            files.push(...parseFileDetails(this.resourceAnimToXml()));
            this.saveToDisk(files);
        }
        layoutAllToXml(data, saveToDisk = false) {
            const result = {};
            const files = [];
            const views = [...data.views, ...data.includes];
            for (let i = 0; i < views.length; i++) {
                const view = views[i];
                result[view.filename] = [view.content];
                if (saveToDisk) {
                    files.push(createFileAsset(view.pathname, i === 0 ? this.userSettings.outputMainFileName : `${view.filename}.xml`, view.content));
                }
            }
            if (saveToDisk) {
                this.saveToDisk(files);
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
            for (const resource in result) {
                if (result[resource].length === 0) {
                    delete result[resource];
                }
            }
            if (saveToDisk) {
                const files = [];
                for (const resource in result) {
                    if (resource === 'image') {
                        files.push(...parseImageDetails(result[resource]));
                    }
                    else {
                        files.push(...parseFileDetails(result[resource]));
                    }
                }
                this.saveToDisk(files);
            }
            return result;
        }
        resourceStringToXml(saveToDisk = false) {
            const result = [];
            const data = { A: [] };
            this.stored.strings = new Map([...this.stored.strings.entries()].sort(caseInsensitive));
            if (this.appName !== '' && !this.stored.strings.has('app_name')) {
                data.A.push({ name: 'app_name', value: this.appName });
            }
            for (const [name, value] of this.stored.strings.entries()) {
                data.A.push({ name, value });
            }
            result.push(replaceTab($xml$3.createTemplate($xml$3.parseTemplate(STRING_TMPL), data), this.userSettings.insertSpaces, true));
            if (saveToDisk) {
                this.saveToDisk(parseFileDetails(result));
            }
            return result;
        }
        resourceStringArrayToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.arrays.size) {
                const data = { A: [] };
                this.stored.arrays = new Map([...this.stored.arrays.entries()].sort());
                for (const [name, values] of this.stored.arrays.entries()) {
                    data.A.push({ name, AA: $util$5.objectMap(values, value => ({ value })) });
                }
                result.push(replaceTab($xml$3.createTemplate($xml$3.parseTemplate(STRINGARRAY_TMPL), data), this.userSettings.insertSpaces, true));
                if (saveToDisk) {
                    this.saveToDisk(parseFileDetails(result));
                }
            }
            return result;
        }
        resourceFontToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.fonts.size) {
                const settings = this.userSettings;
                this.stored.fonts = new Map([...this.stored.fonts.entries()].sort());
                const namespace = settings.targetAPI < 26 /* OREO */ ? 'app' : 'android';
                for (const [name, font] of this.stored.fonts.entries()) {
                    const data = {
                        name,
                        namespace: getXmlNs(namespace),
                        A: []
                    };
                    let xml = '';
                    for (const attr in font) {
                        const [style, weight] = attr.split('-');
                        data.A.push({
                            style,
                            weight,
                            font: `@font/${name + (style === 'normal' && weight === 'normal' ? `_${style}` : (style !== 'normal' ? `_${style}` : '') + (weight !== 'normal' ? `_${weight}` : ''))}`
                        });
                    }
                    xml += $xml$3.createTemplate($xml$3.parseTemplate(FONT_TMPL), data);
                    if (settings.targetAPI < 26 /* OREO */) {
                        xml = xml.replace(/android/g, 'app');
                    }
                    result.push(replaceTab(xml, settings.insertSpaces));
                }
                if (saveToDisk) {
                    this.saveToDisk(parseFileDetails(result));
                }
            }
            return result;
        }
        resourceColorToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.colors.size) {
                const data = { A: [] };
                this.stored.colors = new Map([...this.stored.colors.entries()].sort());
                for (const [name, value] of this.stored.colors.entries()) {
                    data.A.push({ name, value });
                }
                result.push(replaceTab($xml$3.createTemplate($xml$3.parseTemplate(COLOR_TMPL), data), this.userSettings.insertSpaces));
                if (saveToDisk) {
                    this.saveToDisk(parseFileDetails(result));
                }
            }
            return result;
        }
        resourceStyleToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.styles.size) {
                const settings = this.userSettings;
                const template = $xml$3.parseTemplate(STYLE_TMPL);
                const files = [];
                {
                    const styles = Array.from(this.stored.styles.values()).sort((a, b) => a.name.toString().toLowerCase() >= b.name.toString().toLowerCase() ? 1 : -1);
                    const data = { A: [] };
                    for (const style of styles) {
                        if (Array.isArray(style.items)) {
                            style.items.sort((a, b) => a.name >= b.name ? 1 : -1);
                            data.A.push(style);
                        }
                    }
                    files.push({ filename: 'res/values/styles.xml', data });
                }
                const appTheme = {};
                for (const [filename, theme] of this.stored.themes.entries()) {
                    const data = { A: [] };
                    for (const [themeName, themeData] of theme.entries()) {
                        const items = [];
                        for (const name in themeData.items) {
                            items.push({ name, value: themeData.items[name] });
                        }
                        if (!appTheme[filename] || themeName !== 'AppTheme' || items.length) {
                            data.A.push({
                                name: themeName,
                                parent: themeData.parent,
                                items
                            });
                        }
                        if (themeName === 'AppTheme') {
                            appTheme[filename] = true;
                        }
                    }
                    files.push({ filename, data });
                }
                for (const style of files) {
                    result.push(replaceTab(replaceUnit($xml$3.createTemplate(template, style.data).replace('filename: {0}', `filename: ${style.filename}`), settings.resolutionDPI, settings.convertPixels, true), settings.insertSpaces));
                }
                if (saveToDisk) {
                    this.saveToDisk(parseFileDetails(result));
                }
            }
            return result;
        }
        resourceDimenToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.dimens.size) {
                const settings = this.userSettings;
                const data = { A: [] };
                this.stored.dimens = new Map([...this.stored.dimens.entries()].sort());
                for (const [name, value] of this.stored.dimens.entries()) {
                    data.A.push({ name, value });
                }
                result.push(replaceTab(replaceUnit($xml$3.createTemplate($xml$3.parseTemplate(DIMEN_TMPL), data), settings.resolutionDPI, settings.convertPixels), settings.insertSpaces));
                if (saveToDisk) {
                    this.saveToDisk(parseFileDetails(result));
                }
            }
            return result;
        }
        resourceDrawableToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.drawables.size) {
                const settings = this.userSettings;
                const template = $xml$3.parseTemplate(DRAWABLE_TMPL);
                for (const [name, value] of this.stored.drawables.entries()) {
                    result.push(replaceTab(replaceUnit($xml$3.createTemplate(template, { name: `res/drawable/${name}.xml`, value }), settings.resolutionDPI, settings.convertPixels), settings.insertSpaces));
                }
                if (saveToDisk) {
                    this.saveToDisk(parseFileDetails(result));
                }
            }
            return result;
        }
        resourceDrawableImageToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.images.size) {
                const settings = this.userSettings;
                const template = $xml$3.parseTemplate(DRAWABLE_TMPL);
                for (const [name, images] of this.stored.images.entries()) {
                    if (Object.keys(images).length > 1) {
                        for (const dpi in images) {
                            result.push(replaceTab($xml$3.createTemplate(template, { name: `res/drawable-${dpi}/${name}.${$util$5.lastIndexOf(images[dpi], '.')}`, value: `<!-- image: ${images[dpi]} -->` }), settings.insertSpaces));
                        }
                    }
                    else if (images.mdpi) {
                        result.push(replaceTab($xml$3.createTemplate(template, { name: `res/drawable/${name}.${$util$5.lastIndexOf(images.mdpi, '.')}`, value: `<!-- image: ${images.mdpi} -->` }), settings.insertSpaces));
                    }
                }
                if (saveToDisk) {
                    this.saveToDisk(parseImageDetails(result));
                }
            }
            return result;
        }
        resourceAnimToXml(saveToDisk = false) {
            const result = [];
            if (this.stored.animators.size) {
                const template = $xml$3.parseTemplate(DRAWABLE_TMPL);
                for (const [name, value] of this.stored.animators.entries()) {
                    result.push(replaceTab($xml$3.createTemplate(template, { name: `res/anim/${name}.xml`, value }), this.userSettings.insertSpaces));
                }
                if (saveToDisk) {
                    this.saveToDisk(parseFileDetails(result));
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
    const $dom$3 = squared.lib.dom;
    const $util$6 = squared.lib.util;
    class Accessibility extends squared.base.extensions.Accessibility {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        afterBaseLayout() {
            for (const node of this.application.processing.cache) {
                const element = node.element;
                if (element && node.visible && !node.hasBit('excludeProcedure', $enum$2.NODE_PROCEDURE.ACCESSIBILITY)) {
                    switch (node.controlName) {
                        case CONTAINER_ANDROID.EDIT:
                            if (!node.companion) {
                                [$dom$3.getPreviousElementSibling(element), $dom$3.getNextElementSibling(element)].some((sibling) => {
                                    if (sibling) {
                                        const label = $dom$3.getElementAsNode(sibling);
                                        const labelParent = sibling && sibling.parentElement && sibling.parentElement.tagName === 'LABEL' ? $dom$3.getElementAsNode(sibling.parentElement) : undefined;
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
                            if (element.disabled) {
                                node.android('focusable', 'false');
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
    const $dom$4 = squared.lib.dom;
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
        let result = 0;
        for (let i = 0; i < mainData[direction].count; i++) {
            const value = mainData[direction].unit[i];
            if (value.endsWith('px')) {
                result += parseInt(value);
            }
            else {
                let size = 0;
                $util$7.captureMap(mainData.rowData[i], item => item && item.length > 0, item => size = Math.min(size, item[0].bounds[dimension]));
                result += size;
            }
        }
        result += (mainData[direction].count - 1) * mainData[direction].gap;
        result = node[dimension] - result;
        return result;
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
            let output = '';
            if (mainData) {
                const layout = new $Layout(parent, node, CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */, node.length, node.children);
                layout.rowCount = mainData.row.count;
                layout.columnCount = mainData.column.count;
                output = this.application.renderNode(layout);
            }
            return { output, complete: output !== '' };
        }
        processChild(node, parent) {
            const mainData = parent.data($const.EXT_NAME.CSS_GRID, 'mainData');
            const cellData = node.data($const.EXT_NAME.CSS_GRID, 'cellData');
            let output = '';
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
                        minUnitSize += parseInt(parent.convertPX(unitMin));
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
                                if (cellTotal < data.unit.length && (!parent.has(dimension) || data.unit.some(value => $util$7.isUnit(value)) || unit === 'min-content')) {
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
                                sizeWeight += parseInt(unit) / 100;
                                minSize = size;
                                size = 0;
                            }
                            else if (unit.endsWith('fr')) {
                                sizeWeight += parseInt(unit);
                                minSize = size;
                                size = 0;
                            }
                            else if (unit.endsWith('px')) {
                                const gap = parseInt(unit);
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
                            size = Math.max(node.bounds.width, minUnitSize);
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
                    container = this.application.createNode($dom$4.createElement(node.actualParent ? node.actualParent.element : null));
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
                    const layout = new $Layout(parent, container, CONTAINER_NODE.FRAME, 2048 /* SINGLE */, 1, container.children);
                    output = this.application.renderLayout(layout);
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
            return { output, parent: container, complete: output !== '' };
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
                            node.css('width', $util$7.formatPX(node.bounds.width + columnGap), true);
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
                if (mainData.column.unit.every(value => $util$7.isPercent(value))) {
                    const percentTotal = mainData.column.unit.reduce((a, b) => a + parseInt(b), 0);
                    if (percentTotal < 100) {
                        node.android('columnCount', (mainData.column.count + 1).toString());
                        for (let i = 0; i < mainData.row.count; i++) {
                            controller.appendAfter(lastChild.id, controller.renderSpace(node.renderDepth + 1, $util$7.formatPercent(100 - percentTotal), 'wrap_content', 0, 0, createViewAttribute({
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
                                controller.appendAfter(lastChild.id, controller.renderSpace(node.renderDepth + 1, 'wrap_content', $util$7.formatPX(mainData.row.gap), 0, 0, createViewAttribute({
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
            const layout = new $Layout$1(parent, node, 0, 4 /* AUTO_LAYOUT */, node.length);
            layout.rowCount = mainData.rowCount;
            layout.columnCount = mainData.columnCount;
            if (node.find(item => !item.pageFlow) !== undefined || mainData.rowDirection && (mainData.rowCount === 1 || node.hasHeight) || mainData.columnDirection && mainData.columnCount === 1) {
                layout.containerType = CONTAINER_NODE.CONSTRAINT;
            }
            else {
                layout.setType(CONTAINER_NODE.LINEAR, mainData.columnDirection ? 8 /* HORIZONTAL */ : 16 /* VERTICAL */);
            }
            const output = this.application.renderNode(layout);
            return { output, complete: true };
        }
        processChild(node, parent) {
            let output = '';
            if (node.hasAlign(128 /* SEGMENTED */)) {
                const layout = new $Layout$1(parent, node, CONTAINER_NODE.CONSTRAINT, 4 /* AUTO_LAYOUT */, node.length, node.children);
                output = this.application.renderNode(layout);
            }
            return { output, complete: output !== '' };
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
                            const pageFlow = $util$8.filterArray(item.renderChildren, child => child.pageFlow);
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
                        if (seg.length > 1 && (horizontal && $util$8.withinFraction(node.box.left, chainStart.linear.left) && $util$8.withinFraction(chainEnd.linear.right, node.box.right) || !horizontal && $util$8.withinFraction(node.box.top, chainStart.linear.top) && $util$8.withinFraction(chainEnd.linear.bottom, node.box.bottom))) {
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
            if (destination === undefined) {
                destination = item.data($const$2.EXT_NAME.GRID, 'cellData');
            }
            else if (destination) {
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
            item.siblingIndex = i;
            item.data($const$2.EXT_NAME.GRID, 'cellData', null);
        }
        parent.data($const$2.EXT_NAME.GRID, 'cellData', destination);
    }
    class Grid extends squared.base.extensions.Grid {
        processNode(node, parent) {
            super.processNode(node, parent);
            const mainData = node.data($const$2.EXT_NAME.GRID, 'mainData');
            let output = '';
            if (mainData) {
                const layout = new $Layout$2(parent, node, CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */, node.length, node.children);
                layout.columnCount = mainData.columnCount;
                output = this.application.renderNode(layout);
            }
            return { output, complete: output !== '' };
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
                const siblings = cellData.siblings ? cellData.siblings.slice(0) : [];
                if (siblings.length) {
                    const controller = this.application.controllerHandler;
                    siblings.unshift(node);
                    const layout = new $Layout$2(parent, node, 0, 0, siblings.length, siblings);
                    if (layout.linearY) {
                        layout.node = controller.createNodeGroup(node, siblings, parent);
                        layout.setType(CONTAINER_NODE.LINEAR, 16 /* VERTICAL */);
                    }
                    else {
                        layout.init();
                        const result = controller.processTraverseHorizontal(layout);
                        layout.node = result.layout.node;
                    }
                    if (layout.containerType !== 0) {
                        transferData(layout.node, siblings);
                        const output = this.application.renderNode(layout);
                        return { output, parent: layout.node, complete: true };
                    }
                }
            }
            return { output: '' };
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
                                            this.application.controllerHandler.appendAfter(item.id, this.application.controllerHandler.renderSpace(item.renderDepth, 'match_parent', $util$9.formatPX(heightBottom), mainData.columnCount));
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
                if ($util$9.withinFraction(node.box.right, maxRight)) {
                    node.android('layout_width', 'wrap_content');
                }
            }
        }
    }

    var $Layout$3 = squared.base.Layout;
    var $NodeList$3 = squared.base.NodeList;
    const $const$3 = squared.base.lib.constant;
    const $enum$6 = squared.base.lib.enumeration;
    const $dom$5 = squared.lib.dom;
    const $util$a = squared.lib.util;
    class List extends squared.base.extensions.List {
        processNode(node, parent) {
            super.processNode(node, parent);
            const layout = new $Layout$3(parent, node, 0, 0, node.length, node.children);
            let output = '';
            if ($NodeList$3.linearY(layout.children)) {
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
                output = this.application.renderNode(layout);
            }
            return { output, complete: output !== '' };
        }
        processChild(node, parent) {
            const mainData = node.data($const$3.EXT_NAME.LIST, 'mainData');
            let output = '';
            if (mainData) {
                const controller = this.application.controllerHandler;
                const parentLeft = $util$a.convertInt(parent.css('paddingLeft')) + $util$a.convertInt(parent.css('marginLeft'));
                let columnCount = 0;
                let paddingLeft = node.marginLeft;
                node.modifyBox(16 /* MARGIN_LEFT */, null);
                if (parent.is(CONTAINER_NODE.GRID)) {
                    columnCount = $util$a.convertInt(parent.android('columnCount'));
                    paddingLeft += parentLeft;
                }
                else if (parent.item(0) === node) {
                    paddingLeft += parentLeft;
                }
                const ordinal = node.find(item => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= $util$a.convertInt(item.documentParent.cssInitial('marginLeft')));
                if (ordinal && mainData.ordinal === '') {
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
                    controller.prependBefore(node.id, this.application.renderNode(layout));
                    if (columnCount === 3) {
                        node.android('layout_columnSpan', '2');
                    }
                    paddingLeft += ordinal.marginLeft;
                    if (paddingLeft > 0 && !ordinal.hasWidth) {
                        ordinal.android('minWidth', $util$a.formatPX(paddingLeft));
                    }
                    ordinal.modifyBox(16 /* MARGIN_LEFT */, null);
                }
                else {
                    const columnWeight = columnCount > 0 ? '0' : '';
                    const positionInside = node.css('listStylePosition') === 'inside';
                    let left = 0;
                    let top = 0;
                    let image = '';
                    if (mainData.imageSrc !== '') {
                        const boxPosition = $dom$5.getBackgroundPosition(mainData.imagePosition, node.bounds, node.fontSize);
                        left = boxPosition.left;
                        top = boxPosition.top;
                        image = Resource.addImageUrl(mainData.imageSrc);
                    }
                    const gravity = image !== '' && !node.has('listStyleImage') || parentLeft === 0 && node.marginLeft === 0 ? '' : 'right';
                    if (gravity === '') {
                        paddingLeft += node.paddingLeft;
                        node.modifyBox(256 /* PADDING_LEFT */, null);
                    }
                    if (left > 0 && paddingLeft > left) {
                        paddingLeft -= left;
                    }
                    paddingLeft = Math.max(paddingLeft, 20);
                    const paddingRight = (() => {
                        if (paddingLeft <= 24) {
                            return 6;
                        }
                        else if (paddingLeft <= 32) {
                            return 8;
                        }
                        else {
                            return 10;
                        }
                    })();
                    const marginLeft = left > 0 ? $util$a.formatPX(left) : '';
                    const minWidth = paddingLeft > 0 ? $util$a.formatPX(paddingLeft) : '';
                    const options = createViewAttribute({
                        android: {
                            layout_columnWeight: columnWeight
                        }
                    });
                    if (positionInside) {
                        const xml = controller.renderNodeStatic(CONTAINER_ANDROID.SPACE, parent.renderDepth + 1, {
                            android: {
                                minWidth,
                                layout_columnWeight: columnWeight,
                                [node.localizeString(BOX_ANDROID.MARGIN_LEFT)]: marginLeft
                            }
                        }, 'wrap_content', 'wrap_content');
                        controller.prependBefore(node.id, xml);
                        options.android.minWidth = $util$a.formatPX('24');
                    }
                    else {
                        Object.assign(options.android, {
                            minWidth,
                            gravity: paddingLeft > 20 ? node.localizeString(gravity) : '',
                            [BOX_ANDROID.MARGIN_TOP]: node === parent.children[0] && node.marginTop > 0 ? $util$a.formatPX(node.marginTop) : '',
                            [node.localizeString(BOX_ANDROID.MARGIN_LEFT)]: marginLeft,
                            [node.localizeString(BOX_ANDROID.PADDING_LEFT)]: gravity === '' && image === '' ? $util$a.formatPX(paddingRight) : (paddingLeft === 20 ? '2px' : ''),
                            [node.localizeString(BOX_ANDROID.PADDING_RIGHT)]: gravity === 'right' && paddingLeft > 20 ? $util$a.formatPX(paddingRight) : '',
                            [BOX_ANDROID.PADDING_TOP]: node.paddingTop > 0 ? $util$a.formatPX(node.paddingTop) : ''
                        });
                        if (columnCount === 3) {
                            node.android('layout_columnSpan', '2');
                        }
                    }
                    if (node.tagName === 'DT' && image === '') {
                        node.android('layout_columnSpan', columnCount.toString());
                    }
                    else {
                        if (image !== '') {
                            Object.assign(options.android, {
                                src: `@drawable/${image}`,
                                [BOX_ANDROID.MARGIN_TOP]: top > 0 ? $util$a.formatPX(top) : '',
                                scaleType: !positionInside && gravity === 'right' ? 'fitEnd' : 'fitStart'
                            });
                        }
                        else {
                            options.android.text = mainData.ordinal;
                        }
                        const companion = this.application.createNode($dom$5.createElement(node.actualParent ? node.actualParent.element : null));
                        companion.tagName = `${node.tagName}_ORDINAL`;
                        companion.inherit(node, 'textStyle');
                        if (mainData.ordinal !== '' && !/[A-Za-z\d]+\./.test(mainData.ordinal) && companion.toInt('fontSize') > 12) {
                            companion.css('fontSize', '12px');
                        }
                        this.application.processing.cache.append(companion, false);
                        const xml = controller.renderNodeStatic(image !== '' ? CONTAINER_ANDROID.IMAGE : (mainData.ordinal !== '' ? CONTAINER_ANDROID.TEXT : CONTAINER_ANDROID.SPACE), parent.renderDepth + 1, options, 'wrap_content', 'wrap_content', companion);
                        controller.prependBefore(node.id, xml);
                    }
                }
                if (columnCount > 0) {
                    node.android('layout_width', '0px');
                    node.android('layout_columnWeight', '1');
                }
                const linearX = $NodeList$3.linearX(node.children);
                if (linearX || $NodeList$3.linearY(node.children)) {
                    const layout = new $Layout$3(parent, node, CONTAINER_NODE.LINEAR, linearX ? 8 /* HORIZONTAL */ : 16 /* VERTICAL */, node.length, node.children);
                    output = this.application.renderNode(layout);
                }
            }
            return { output, next: output !== '' };
        }
        postBaseLayout(node) {
            super.postBaseLayout(node);
            const columnCount = node.android('columnCount');
            for (let i = 0; i < node.renderChildren.length; i++) {
                const current = node.renderChildren[i];
                const previous = node.renderChildren[i - 1];
                let spaceHeight = 0;
                if (previous) {
                    const marginBottom = $util$a.convertInt(previous.android(BOX_ANDROID.MARGIN_BOTTOM));
                    if (marginBottom > 0) {
                        spaceHeight += marginBottom;
                        previous.delete('android', BOX_ANDROID.MARGIN_BOTTOM);
                        previous.modifyBox(8 /* MARGIN_BOTTOM */, null);
                    }
                }
                const marginTop = $util$a.convertInt(current.android(BOX_ANDROID.MARGIN_TOP));
                if (marginTop > 0) {
                    spaceHeight += marginTop;
                    current.delete('android', BOX_ANDROID.MARGIN_TOP);
                    current.modifyBox(2 /* MARGIN_TOP */, null);
                }
                if (spaceHeight > 0) {
                    const options = createViewAttribute({
                        android: {
                            layout_columnSpan: columnCount.toString()
                        }
                    });
                    const output = this.application.controllerHandler.renderNodeStatic(CONTAINER_ANDROID.SPACE, current.renderDepth, options, 'match_parent', $util$a.formatPX(spaceHeight));
                    this.application.controllerHandler.prependBefore(current.id, output, 0);
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
            let container;
            let output = '';
            if (mainData && mainData.uri && mainData.position) {
                container = this.application.createNode(node.element);
                container.inherit(node, 'initial', 'base', 'styleMap');
                container.setControlType(CONTAINER_ANDROID.FRAME);
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
                node.android('src', `@drawable/${Resource.addImage({ mdpi: mainData.uri })}`);
                node.parent = container;
                const layout = new $Layout$4(parent, container, CONTAINER_NODE.FRAME, 2048 /* SINGLE */, 1, container.children);
                output = this.application.renderLayout(layout);
            }
            return { output, parent: container, complete: true };
        }
    }

    class Substitute extends squared.base.extensions.Substitute {
        processNode(node, parent) {
            node.containerType = node.blockStatic ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE;
            return super.processNode(node, parent);
        }
        postProcedure(node) {
            const options = createViewAttribute(node.element ? this.options[node.element.id] : undefined);
            node.apply(Resource.formatOptions(options, this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue')));
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
            let output = '';
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
                                    if (item.has('width') && item.toInt('width') < item.bounds.width) {
                                        item.android('layout_width', $util$c.formatPX(item.bounds.width));
                                    }
                                }
                            }
                        }
                    });
                    if (requireWidth && !node.hasWidth) {
                        let widthParent = 0;
                        node.ascend().some(item => {
                            if (item.hasWidth) {
                                widthParent = item.bounds.width;
                                return true;
                            }
                            return false;
                        });
                        if (node.bounds.width >= widthParent) {
                            node.android('layout_width', 'match_parent');
                        }
                        else {
                            node.css('width', $util$c.formatPX(node.bounds.width), true);
                        }
                    }
                }
                const layout = new $Layout$5(parent, node, CONTAINER_NODE.GRID, 4 /* AUTO_LAYOUT */, node.length, node.children);
                layout.rowCount = mainData.rowCount;
                layout.columnCount = mainData.columnCount;
                output = this.application.renderNode(layout);
            }
            return { output, complete: output !== '' };
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
                this.application.controllerHandler.appendAfter(node.id, this.application.controllerHandler.renderSpace(parent.renderDepth + 1, 'wrap_content', 'wrap_content', spaceSpan));
            }
            return { output: '' };
        }
        postProcedure(node) {
            const layoutWidth = $util$c.convertInt(node.android('layout_width'));
            if (layoutWidth > 0) {
                if (node.bounds.width > layoutWidth) {
                    node.android('layout_width', $util$c.formatPX(node.bounds.width));
                }
                if (layoutWidth > 0 && node.cssInitial('width') === 'auto' && node.renderChildren.every(item => item.inlineWidth)) {
                    for (const item of node.renderChildren) {
                        item.android('layout_width', '0px');
                        item.android('layout_columnWeight', '1');
                    }
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
            let output = '';
            if (mainData) {
                const layout = new $Layout$6(parent, node, CONTAINER_NODE.RELATIVE, 8 /* HORIZONTAL */, node.length, node.children);
                layout.floated = layout.getFloated(true);
                output = this.application.renderNode(layout);
            }
            return { output };
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
            const layout = new $Layout$7(parent, node, CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, node.length, node.children);
            const output = this.application.renderNode(layout);
            return { output };
        }
        afterConstraints() {
            const controller = this.application.controllerHandler;
            for (const node of this.subscribers) {
                const alignParent = new Map();
                node.each((item) => {
                    const alignment = [];
                    if ($util$d.withinFraction(item.linear.left, node.box.left)) {
                        alignment.push('left');
                    }
                    if ($util$d.withinFraction(item.linear.top, node.box.top)) {
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
                        if (anchor && item !== anchor) {
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
    const $dom$6 = squared.lib.dom;
    const $util$e = squared.lib.util;
    function getFixedNodes(node) {
        return node.filter(item => !item.pageFlow && (item.position === 'fixed' || item.absoluteParent === node));
    }
    function withinBoxRegion(rect, value) {
        return rect.some(coord => coord < value);
    }
    function reduceContainerWidth(node, value, offset) {
        if ($util$e.isPercent(value)) {
            const actualParent = node.actualParent;
            if (actualParent) {
                const width = parseInt(value) - (offset / actualParent.box.width) * 100;
                if (width > 0) {
                    return $util$e.formatPercent(width);
                }
            }
        }
        else if ($util$e.isUnit(value)) {
            const width = parseInt(value) - offset;
            if (width > 0) {
                return $util$e.formatPX(width);
            }
        }
        return value;
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
            const container = this.application.createNode($dom$6.createElement(node.element, node.block));
            container.inherit(node, 'initial', 'base');
            container.exclude({
                procedure: $enum$b.NODE_PROCEDURE.NONPOSITIONAL,
                resource: $enum$b.NODE_RESOURCE.BOX_STYLE | $enum$b.NODE_RESOURCE.ASSET
            });
            const [normal, nested] = $util$e.partitionArray(getFixedNodes(node), item => item.absoluteParent === node);
            normal.push(container);
            const children = [
                ...$util$e.sortArray(normal, true, 'zIndex', 'id'),
                ...$util$e.sortArray(nested, true, 'zIndex', 'id')
            ];
            for (const item of node.duplicate()) {
                if (!children.includes(item)) {
                    item.parent = container;
                }
            }
            container.parent = node;
            this.application.processing.cache.append(container);
            for (let i = 0; i < children.length; i++) {
                children[i].siblingIndex = i;
            }
            node.sort($NodeList$4.siblingIndex);
            node.resetBox(480 /* PADDING */ | (node.documentBody ? 30 /* MARGIN */ : 0), container, true);
            node.companion = container;
            const layout = new $Layout$8(parent, node, CONTAINER_NODE.CONSTRAINT, 32 /* ABSOLUTE */, children.length, children);
            const output = this.application.renderLayout(layout);
            return { output };
        }
        postBaseLayout(node) {
            if (node.hasWidth && node.companion) {
                const width = node.cssInitial('width', true);
                const minWidth = node.cssInitial('minWidth', true);
                if (node.documentBody && node.some(item => item.has('right'))) {
                    node.cssApply({
                        width: 'auto',
                        minWidth: 'auto'
                    }, true);
                    node.companion.cssApply({
                        width,
                        minWidth
                    }, true);
                    node.android('layout_width', 'match_parent');
                }
                else {
                    const offset = node.paddingLeft + node.paddingRight + (node.documentBody ? node.marginLeft + node.marginRight : 0);
                    node.companion.cssApply({
                        width: reduceContainerWidth(node, width, offset),
                        minWidth: reduceContainerWidth(node, minWidth, offset)
                    }, true);
                }
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
            const controller = this.application.controllerHandler;
            const container = controller.createNodeWrapper(node, parent);
            container.css('display', 'block', true);
            if (node.has('maxWidth')) {
                const maxWidth = node.css('maxWidth');
                container.cssApply({
                    width: maxWidth,
                    maxWidth
                }, true);
            }
            if (node.has('maxHeight')) {
                const maxHeight = node.css('maxHeight');
                container.cssApply({
                    height: maxHeight,
                    maxHeight
                }, true);
            }
            const layout = new $Layout$9(parent, container, CONTAINER_NODE.FRAME, 2048 /* SINGLE */, 1, container.children);
            return { output: '', parent: container, renderAs: container, outputAs: this.application.renderLayout(layout) };
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
            const controller = this.application.controllerHandler;
            const container = controller.createNodeWrapper(node, parent);
            container.android('layout_width', 'match_parent');
            container.android('layout_height', 'wrap_content');
            if (!node.has('height', 2 /* UNIT */)) {
                node.css('height', $util$f.formatPX(node.bounds.height), true);
            }
            const layout = new $Layout$a(parent, container, CONTAINER_NODE.CONSTRAINT, 2048 /* SINGLE */, 1, container.children);
            return { output: '', parent: container, renderAs: container, outputAs: this.application.renderLayout(layout) };
        }
    }

    var $NodeList$5 = squared.base.NodeList;
    const $enum$e = squared.base.lib.enumeration;
    const $util$g = squared.lib.util;
    const $xml$4 = squared.lib.xml;
    const RADIO_GROUP = 'RadioGroup';
    class ScrollView extends squared.base.Extension {
        condition(node) {
            const element = node.element;
            return element.tagName === 'INPUT' && element.type === 'radio' && $util$g.hasValue(element.name);
        }
        processNode(node, parent) {
            const target = $util$g.hasValue(node.dataset.target) && !$util$g.hasValue(node.dataset.use);
            const element = node.element;
            const pending = [];
            let replaceWith;
            const children = parent.flatMap((item) => {
                if (item.renderAs) {
                    if (item.renderAs === node) {
                        replaceWith = item;
                    }
                    else {
                        pending.push(item);
                    }
                    item = item.renderAs;
                }
                const input = item.element;
                if (input.type === 'radio' && input.name === element.name && !item.rendered) {
                    return item;
                }
                return null;
            });
            if (children.length > 1) {
                const container = this.application.controllerHandler.createNodeGroup(node, children, parent, replaceWith);
                container.alignmentType |= 8 /* HORIZONTAL */ | (parent.length !== children.length ? 128 /* SEGMENTED */ : 0);
                if (parent.layoutConstraint) {
                    container.companion = replaceWith || node;
                }
                container.setControlType(RADIO_GROUP, CONTAINER_NODE.INLINE);
                container.inherit(node, 'alignment');
                container.css('verticalAlign', 'text-bottom');
                container.each((item, index) => {
                    if (item !== node) {
                        item.setControlType(CONTAINER_ANDROID.RADIO, CONTAINER_NODE.RADIO);
                    }
                    item.positioned = true;
                    item.parent = container;
                    item.siblingIndex = index;
                });
                for (const item of pending) {
                    item.hide();
                }
                container.android('orientation', $NodeList$5.linearX(children) ? AXIS_ANDROID.HORIZONTAL : AXIS_ANDROID.VERTICAL);
                container.render(target ? container : parent);
                this.subscribers.add(container);
                const outputAs = this.application.controllerHandler.getEnclosingTag(RADIO_GROUP, container.id, target ? -1 : container.renderDepth, $xml$4.formatPlaceholder(container.id));
                return { output: '', complete: true, parent: container, renderAs: container, outputAs };
            }
            return { output: '' };
        }
        postBaseLayout(node) {
            node.some((item) => {
                if (item.element.checked) {
                    node.android('checkedButton', item.documentId);
                    return true;
                }
                return false;
            });
        }
    }

    const $enum$f = squared.base.lib.enumeration;
    const $dom$7 = squared.lib.dom;
    const $util$h = squared.lib.util;
    const $xml$5 = squared.lib.xml;
    const SCROLL_HORIZONTAL = 'HorizontalScrollView';
    const SCROLL_VERTICAL = 'android.support.v4.widget.NestedScrollView';
    class ScrollBar extends squared.base.Extension {
        condition(node) {
            return node.length > 0 && (node.overflowX ||
                node.overflowY ||
                this.included(node.element) && (node.hasWidth || node.hasHeight));
        }
        processNode(node, parent) {
            const target = $util$h.hasValue(node.dataset.target) && !$util$h.hasValue(node.dataset.use);
            const overflow = [];
            const scrollView = [];
            let outputAs = '';
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
                const container = this.application.createNode(i === 0 ? node.element : $dom$7.createElement(node.actualParent ? node.actualParent.element : null, node.block));
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
                item.unsetCache();
                this.application.processing.cache.append(item);
                item.render(i === 0 ? (target ? item : parent) : previous);
                const xml = this.application.controllerHandler.getEnclosingTag(item.controlName, item.id, target ? (i === 0 ? -1 : 0) : item.renderDepth, $xml$5.formatPlaceholder(item.id));
                if (i === 0) {
                    outputAs = xml;
                }
                else {
                    outputAs = $xml$5.replacePlaceholder(outputAs, previous.id, xml);
                }
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
            const outer = scrollView[scrollView.length - 1];
            node.parent = outer;
            if (parent.layoutConstraint) {
                outer.companion = node;
            }
            node.overflow = 0;
            node.resetBox(30 /* MARGIN */);
            node.exclude({ resource: $enum$f.NODE_RESOURCE.BOX_STYLE });
            return { output: '', parent: node.parent, renderAs: scrollView[0], outputAs };
        }
    }

    var LAYERLIST_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
<<A>>
	<item>
		<shape android:shape="rectangle">
			<solid android:color="@color/{&color}" />
		</shape>
	</item>
<<A>>
<<B>>
	<item>
		<shape android:shape="rectangle">
			<gradient android:type="{&type}" android:startColor="@color/{~startColor}" android:endColor="@color/{~endColor}" android:centerColor="@color/{~centerColor}" android:angle="{~angle}" android:centerX="{~centerX}" android:centerY="{~centerY}" android:gradientRadius="{~gradientRadius}" android:visible="{~visible}" />
		</shape>
	</item>
<<B>>
<<C>>
	<item android:drawable="@drawable/{&src}" />
<<C>>
<<D>>
	<item android:left="{~left}" android:top="{~top}" android:right="{~right}" android:bottom="{~bottom}" android:drawable="@drawable/{~src}" android:width="{~width}" android:height="{~height}">
	<<rotate>>
		<rotate android:drawable="@drawable/{&src}" android:fromDegrees="{~fromDegrees}" android:toDegrees="{~toDegrees}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}" android:visible="{~visible}" />
	<<rotate>>
	<<bitmap>>
		<bitmap android:src="@drawable/{&src}" android:gravity="{~gravity}" android:tileMode="{~tileMode}" android:tileModeX="{~tileModeX}" android:tileModeY="{~tileModeY}" />
	<<bitmap>>
	</item>
<<D>>
<<E>>
	<item android:left="{~left}" android:top="{~top}" android:right="{~right}" android:bottom="{~bottom}" android:drawable="@drawable/{&src}" android:width="{~width}" android:height="{~height}" />
<<E>>
<<F>>
	<item android:left="{~left}" android:top="{~top}" android:right="{~right}" android:bottom="{~bottom}">
		<shape android:shape="rectangle">
		<<stroke>>
			<stroke android:width="{&width}" {~borderStyle} />
		<<stroke>>
		<<corners>>
			<corners android:radius="{~radius}" android:topLeftRadius="{~topLeftRadius}" android:topRightRadius="{~topRightRadius}" android:bottomRightRadius="{~bottomRightRadius}" android:bottomLeftRadius="{~bottomLeftRadius}" />
		<<corners>>
		</shape>
	</item>
<<F>>
</layer-list>`;

    var SHAPE_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
<<A>>
	<stroke android:width="{&width}" {~borderStyle} />
<<A>>
<<B>>
	<solid android:color="@color/{&color}" />
<<B>>
<<C>>
	<corners android:radius="{~radius}" android:topLeftRadius="{~topLeftRadius}" android:topRightRadius="{~topRightRadius}" android:bottomLeftRadius="{~bottomLeftRadius}" android:bottomRightRadius="{~bottomRightRadius}" />
<<C>>
<<D>>
	<gradient android:type="{&type}" android:startColor="@color/{~startColor}" android:endColor="@color/{~endColor}" android:centerColor="@color/{~centerColor}" android:angle="{~angle}" android:centerX="{~centerX}" android:centerY="{~centerY}" android:gradientRadius="{~gradientRadius}" />
<<D>>
</shape>`;

    var VECTOR_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" {~namespace} android:name="{~name}" android:width="{&width}" android:height="{&height}" android:viewportWidth="{&viewportWidth}" android:viewportHeight="{&viewportHeight}" android:alpha="{~alpha}">
<<A>>
	##region-start##
	<group android:name="{~groupName}" android:translateX="{~translateX}" android:translateY="{~translateY}">
	##region-start##
		<<clipRegion>>
		<clip-path android:name="{~clipName}" android:pathData="{&clipPathData}" />
		<<clipRegion>>
		##path-start##
		<group android:name="{~groupName}" android:rotation="{~rotation}" android:scaleX="{~scaleX}" android:scaleY="{~scaleY}" android:translateX="{~translateX}" android:translateY="{~translateY}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}">
		##path-start##
		<<clipPath>>
			<clip-path android:name="{~clipName}" android:pathData="{&clipPathData}" />
		<<clipPath>>
		<<BB>>
			##render-start##
			<group android:name="{~groupName}" android:rotation="{~rotation}" android:scaleX="{~scaleX}" android:scaleY="{~scaleY}" android:translateX="{~translateX}" android:translateY="{~translateY}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}">
			##render-start##
			<<clipGroup>>
			<clip-path android:name="{~clipName}" android:pathData="{&clipPathData}" />
			<<clipGroup>>
			<<CCC>>
				<<clipElement>>
				<clip-path android:name="{~clipName}" android:pathData="{&clipPathData}" />
				<<clipElement>>
				<path android:name="{~name}" android:fillColor="{~fill}" android:fillAlpha="{~fillOpacity}" android:fillType="{~fillRule}" android:strokeColor="{~stroke}" android:strokeAlpha="{~strokeOpacity}" android:strokeWidth="{~strokeWidth}" android:strokeLineCap="{~strokeLinecap}" android:strokeLineJoin="{~strokeLinejoin}" android:strokeMiterLimit="{~strokeMiterlimit}" android:trimPathStart="{~trimPathStart}" android:trimPathEnd="{~trimPathEnd}" android:trimPathOffset="{~trimPathOffset}" android:pathData="{&value}">
				<<fillPattern>>
					<aapt:attr name="android:fillColor">
					<<gradients>>
						<gradient android:type="{&type}" android:startColor="@color/{~startColor}" android:endColor="@color/{~endColor}" android:centerColor="@color/{~centerColor}" android:startX="{~startX}" android:startY="{~startY}" android:endX="{~endX}" android:endY="{~endY}" android:centerX="{~centerX}" android:centerY="{~centerY}" android:gradientRadius="{~gradientRadius}" android:tileMode="{~tileMode}">
						<<colorStops>>
							<item android:offset="{&offset}" android:color="{&color}" />
						<<colorStops>>
						</gradient>
					<<gradients>>
					</aapt:attr>
				<<fillPattern>>
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
</vector>`;

    const $SvgBuild$1 = squared.svg && squared.svg.SvgBuild;
    const $enum$g = squared.base.lib.enumeration;
    const $color$2 = squared.lib.color;
    const $dom$8 = squared.lib.dom;
    const $util$i = squared.lib.util;
    const $xml$6 = squared.lib.xml;
    const TEMPLATES = {
        LAYER_LIST: $xml$6.parseTemplate(LAYERLIST_TMPL),
        SHAPE: $xml$6.parseTemplate(SHAPE_TMPL),
        VECTOR: $xml$6.parseTemplate(VECTOR_TMPL)
    };
    const STORED$1 = Resource.STORED;
    function getBorderStyle(border, direction = -1, halfSize = false) {
        const result = {
            solid: `android:color="@color/${border.color}"`,
            groove: '',
            ridge: ''
        };
        const style = border.style;
        const borderWidth = parseInt(border.width);
        const dashed = `${result.solid} android:dashWidth="${borderWidth}px" android:dashGap="${borderWidth}px"`;
        Object.assign(result, {
            double: result.solid,
            inset: result.solid,
            outset: result.solid,
            dashed,
            dotted: dashed
        });
        const groove = style === 'groove';
        if (borderWidth > 1 && (groove || style === 'ridge')) {
            const color = $color$2.parseRGBA(border.color);
            if (color) {
                const reduced = $color$2.reduceRGBA(color.valueRGBA, groove || color.valueRGB === '#000000' ? 0.5 : -0.5);
                if (reduced) {
                    const colorValue = Resource.addColor(reduced);
                    if (colorValue !== '') {
                        const colorName = `android:color="@color/${colorValue}"`;
                        if (direction === 0 || direction === 2) {
                            halfSize = !halfSize;
                        }
                        if (color.valueRGB === '#000000' && (groove && (direction === 1 || direction === 3) || !groove && (direction === 0 || direction === 2))) {
                            halfSize = !halfSize;
                        }
                        if (halfSize) {
                            switch (direction) {
                                case 0:
                                    result[style] = colorName;
                                    break;
                                case 1:
                                    result[style] = result.solid;
                                    break;
                                case 2:
                                    result[style] = result.solid;
                                    break;
                                case 3:
                                    result[style] = colorName;
                                    break;
                            }
                        }
                        else {
                            switch (direction) {
                                case 0:
                                    result[style] = result.solid;
                                    break;
                                case 1:
                                    result[style] = colorName;
                                    break;
                                case 2:
                                    result[style] = colorName;
                                    break;
                                case 3:
                                    result[style] = result.solid;
                                    break;
                            }
                        }
                    }
                }
            }
        }
        return result[style] || result.solid;
    }
    function getShapeAttribute(boxStyle, name, direction = -1, hasInset = false, isInset = false) {
        switch (name) {
            case 'stroke':
                if (boxStyle.border && Resource.isBorderVisible(boxStyle.border)) {
                    if (!hasInset || isInset) {
                        return [{
                                width: boxStyle.border.width,
                                borderStyle: getBorderStyle(boxStyle.border, isInset ? direction : -1)
                            }];
                    }
                    else if (hasInset) {
                        return [{
                                width: $util$i.formatPX(Math.ceil(parseInt(boxStyle.border.width) / 2)),
                                borderStyle: getBorderStyle(boxStyle.border, direction, true)
                            }];
                    }
                }
                return false;
            case 'backgroundColor':
                return $util$i.hasValue(boxStyle.backgroundColor) ? [{ color: boxStyle.backgroundColor }] : false;
            case 'radius':
                if (boxStyle.borderRadius) {
                    if (boxStyle.borderRadius.length === 1) {
                        if (boxStyle.borderRadius[0] !== '0px') {
                            return [{ radius: boxStyle.borderRadius[0] }];
                        }
                    }
                    else if (boxStyle.borderRadius.length > 1) {
                        const result = {};
                        for (let i = 0; i < boxStyle.borderRadius.length; i++) {
                            result[`${['topLeft', 'topRight', 'bottomRight', 'bottomLeft'][i]}Radius`] = boxStyle.borderRadius[i];
                        }
                        return [result];
                    }
                }
                return false;
        }
        return false;
    }
    function insertDoubleBorder(data, border, top, right, bottom, left, borderRadius) {
        const width = parseInt(border.width);
        const baseWidth = Math.floor(width / 3);
        const remainder = width % 3;
        const offset = remainder === 2 ? 1 : 0;
        const leftWidth = baseWidth + offset;
        const rightWidth = baseWidth + offset;
        let indentWidth = `${$util$i.formatPX(width - baseWidth)}`;
        let hideWidth = `-${indentWidth}`;
        data.F.push({
            top: top ? '' : hideWidth,
            right: right ? '' : hideWidth,
            bottom: bottom ? '' : hideWidth,
            left: left ? '' : hideWidth,
            stroke: [{ width: $util$i.formatPX(leftWidth), borderStyle: getBorderStyle(border) }],
            corners: borderRadius
        });
        if (width === 3) {
            indentWidth = `${$util$i.formatPX(width)}`;
            hideWidth = `-${indentWidth}`;
        }
        data.F.push({
            top: top ? indentWidth : hideWidth,
            right: right ? indentWidth : hideWidth,
            bottom: bottom ? indentWidth : hideWidth,
            left: left ? indentWidth : hideWidth,
            stroke: [{ width: $util$i.formatPX(rightWidth), borderStyle: getBorderStyle(border) }],
            corners: borderRadius
        });
    }
    function checkBackgroundPosition(current, adjacent, defaultPosition) {
        const initial = current === 'initial' || current === 'unset';
        if (current.indexOf(' ') === -1 && adjacent.indexOf(' ') !== -1) {
            if (/^[a-z]+$/.test(current)) {
                return `${initial ? defaultPosition : current} 0px`;
            }
            else {
                return `${defaultPosition} ${current}`;
            }
        }
        else if (initial) {
            return '0px';
        }
        return current;
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
            for (const node of this.application.processing.cache.duplicate().sort(a => !a.visible ? -1 : 0)) {
                const stored = node.data(Resource.KEY_NAME, 'boxStyle');
                if (stored && !node.hasBit('excludeResource', $enum$g.NODE_RESOURCE.BOX_STYLE)) {
                    stored.backgroundColor = Resource.addColor(stored.backgroundColor);
                    const backgroundRepeat = $util$i.replaceMap(stored.backgroundRepeat.split(','), value => value.trim());
                    const backgroundSize = $util$i.replaceMap(stored.backgroundSize.split(','), value => value.trim());
                    const backgroundPositionX = $util$i.replaceMap(stored.backgroundPositionX.split(','), value => value.trim());
                    const backgroundPositionY = $util$i.replaceMap(stored.backgroundPositionY.split(','), value => value.trim());
                    const backgroundImage = [];
                    const backgroundVector = [];
                    const backgroundDimensions = [];
                    const backgroundGradient = [];
                    const backgroundPosition = [];
                    if (!node.hasBit('excludeResource', $enum$g.NODE_RESOURCE.IMAGE_SOURCE)) {
                        if (stored.backgroundImage) {
                            for (let i = 0; i < stored.backgroundImage.length; i++) {
                                const value = stored.backgroundImage[i];
                                const x = backgroundPositionX[i] || backgroundPositionX[i - 1];
                                const y = backgroundPositionY[i] || backgroundPositionY[i - 1];
                                backgroundImage[i] = Resource.addImageUrl(value);
                                backgroundDimensions[i] = Resource.ASSETS.images.get($dom$8.cssResolveUrl(value));
                                backgroundPosition[i] = `${checkBackgroundPosition(x, y, 'left')} ${checkBackgroundPosition(y, x, 'top')}`;
                            }
                        }
                        else if (stored.backgroundGradient) {
                            const gradients = Resource.createBackgroundGradient(node, stored.backgroundGradient);
                            if (gradients.length) {
                                backgroundGradient.push(gradients[0]);
                            }
                        }
                    }
                    const companion = node.companion;
                    if (companion && !companion.visible && companion.htmlElement && !$dom$8.cssFromParent(companion.element, 'backgroundColor')) {
                        const boxStyle = companion.data(Resource.KEY_NAME, 'boxStyle');
                        const backgroundColor = Resource.addColor(boxStyle.backgroundColor);
                        if (backgroundColor !== '') {
                            stored.backgroundColor = backgroundColor;
                        }
                    }
                    const hasBorder = (Resource.isBorderVisible(stored.borderTop) ||
                        Resource.isBorderVisible(stored.borderRight) ||
                        Resource.isBorderVisible(stored.borderBottom) ||
                        Resource.isBorderVisible(stored.borderLeft) ||
                        stored.borderRadius !== undefined);
                    if (hasBorder || backgroundImage.length || backgroundGradient.length) {
                        const borders = [
                            stored.borderTop,
                            stored.borderRight,
                            stored.borderBottom,
                            stored.borderLeft
                        ];
                        const borderVisible = [];
                        const borderStyle = new Set();
                        const borderWidth = new Set();
                        let borderData;
                        for (let i = 0; i < borders.length; i++) {
                            const item = borders[i];
                            borderVisible[i] = Resource.isBorderVisible(item);
                            if (borderVisible[i]) {
                                item.color = Resource.addColor(item.color);
                                borderStyle.add(getBorderStyle(item));
                                borderWidth.add(item.width);
                                borderData = item;
                            }
                        }
                        const imagesE = [];
                        const imagesD = [];
                        let data;
                        let resourceName = '';
                        for (let i = 0; i < backgroundImage.length; i++) {
                            const image = backgroundDimensions[i];
                            const boxPosition = $dom$8.getBackgroundPosition(backgroundPosition[i], node.bounds, node.fontSize);
                            let gravity = (() => {
                                if (boxPosition.horizontal === 'center' && boxPosition.vertical === 'center') {
                                    return 'center';
                                }
                                return `${boxPosition.horizontal === 'center' ? 'center_horizontal' : boxPosition.horizontal}|${boxPosition.vertical === 'center' ? 'center_vertical' : boxPosition.vertical}`;
                            })();
                            let width = '';
                            let height = '';
                            let tileMode = '';
                            let tileModeX = '';
                            let tileModeY = '';
                            const imageRepeat = !image || image.width < node.bounds.width || image.height < node.bounds.height;
                            switch (backgroundRepeat[i]) {
                                case 'repeat-x':
                                    if (imageRepeat) {
                                        tileModeX = 'repeat';
                                    }
                                    break;
                                case 'repeat-y':
                                    if (imageRepeat) {
                                        tileModeY = 'repeat';
                                    }
                                    break;
                                case 'no-repeat':
                                    tileMode = 'disabled';
                                    break;
                                case 'repeat':
                                    if (imageRepeat) {
                                        tileMode = 'repeat';
                                    }
                                    break;
                            }
                            if (gravity !== '' && image && image.width > 0 && image.height > 0 && node.renderChildren.length === 0) {
                                if (tileModeY === 'repeat') {
                                    let tileWidth = 0;
                                    if (node.hasWidth) {
                                        tileWidth = node.width + node.paddingLeft + node.paddingRight;
                                    }
                                    else {
                                        tileWidth = node.bounds.width - (node.borderLeftWidth + node.borderRightWidth);
                                    }
                                    if (image.width < tileWidth) {
                                        const layoutWidth = $util$i.convertInt(node.android('layout_width'));
                                        if (gravity.indexOf('left') !== -1) {
                                            boxPosition.right = tileWidth - image.width;
                                            if (node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util$i.formatPX(node.bounds.width));
                                            }
                                        }
                                        else if (gravity.indexOf('right') !== -1) {
                                            boxPosition.left = tileWidth - image.width;
                                            if (node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util$i.formatPX(node.bounds.width));
                                            }
                                        }
                                        else if (gravity === 'center' || gravity.indexOf('center_horizontal') !== -1) {
                                            boxPosition.left = Math.floor((tileWidth - image.width) / 2);
                                            width = $util$i.formatPX(image.width);
                                            if (node.hasWidth && tileWidth > layoutWidth) {
                                                node.android('layout_width', $util$i.formatPX(node.bounds.width));
                                            }
                                        }
                                    }
                                }
                                if (tileModeX === 'repeat') {
                                    let tileHeight = 0;
                                    if (node.hasHeight) {
                                        tileHeight = node.height + node.paddingTop + node.paddingBottom;
                                    }
                                    else {
                                        tileHeight = node.bounds.height - (node.borderTopWidth + node.borderBottomWidth);
                                    }
                                    if (image.height < tileHeight) {
                                        const layoutHeight = $util$i.convertInt(node.android('layout_height'));
                                        if (gravity.indexOf('top') !== -1) {
                                            boxPosition.bottom = tileHeight - image.height;
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util$i.formatPX(node.bounds.height));
                                            }
                                        }
                                        else if (gravity.indexOf('bottom') !== -1) {
                                            boxPosition.top = tileHeight - image.height;
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util$i.formatPX(node.bounds.height));
                                            }
                                        }
                                        else if (gravity === 'center' || gravity.indexOf('center_vertical') !== -1) {
                                            boxPosition.top = Math.floor((tileHeight - image.height) / 2);
                                            height = $util$i.formatPX(image.height);
                                            if (!node.hasHeight && tileHeight > layoutHeight) {
                                                node.android('layout_height', $util$i.formatPX(node.bounds.height));
                                            }
                                        }
                                    }
                                }
                            }
                            if (backgroundImage.length) {
                                if (node.of(CONTAINER_NODE.IMAGE, 2048 /* SINGLE */) && backgroundImage.length === 1) {
                                    if (boxPosition.left > 0) {
                                        node.modifyBox(16 /* MARGIN_LEFT */, boxPosition.left);
                                    }
                                    if (boxPosition.top > 0) {
                                        node.modifyBox(2 /* MARGIN_TOP */, boxPosition.top);
                                    }
                                    let scaleType = '';
                                    switch (gravity) {
                                        case 'left|top':
                                        case 'left|center_vertical':
                                        case 'left|bottom':
                                            scaleType = 'fitStart';
                                            break;
                                        case 'right|top':
                                        case 'right|center_vertical':
                                        case 'right|bottom':
                                            scaleType = 'fitEnd';
                                            break;
                                        case 'center':
                                        case 'center_horizontal|top':
                                        case 'center_horizontal|bottom':
                                            scaleType = 'center';
                                            break;
                                    }
                                    node.android('scaleType', scaleType);
                                    node.android('src', `@drawable/${backgroundImage[0]}`);
                                    if (!hasBorder) {
                                        return;
                                    }
                                }
                                else {
                                    const imageData = {
                                        top: boxPosition.top !== 0 ? $util$i.formatPX(boxPosition.top) : '',
                                        right: boxPosition.right !== 0 ? $util$i.formatPX(boxPosition.right) : '',
                                        bottom: boxPosition.bottom !== 0 ? $util$i.formatPX(boxPosition.bottom) : '',
                                        left: boxPosition.left !== 0 ? $util$i.formatPX(boxPosition.left) : '',
                                        width,
                                        height,
                                        bitmap: []
                                    };
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
                                                    if (dimensions[j] !== 'auto' && dimensions[j] !== '100%') {
                                                        imageData[j === 0 ? 'width' : 'height'] = node.convertPX(backgroundSize[i], j === 0, false);
                                                    }
                                                }
                                                break;
                                        }
                                    }
                                    if (gravity !== '' || tileMode !== '' || tileModeX !== '' || tileModeY !== '') {
                                        imageData.bitmap.push({
                                            src: backgroundImage[i],
                                            gravity,
                                            tileMode,
                                            tileModeX,
                                            tileModeY,
                                        });
                                        imagesD.push(imageData);
                                    }
                                    else {
                                        imageData.src = backgroundImage[i];
                                        imagesE.push(imageData);
                                    }
                                }
                            }
                        }
                        imagesD.sort((a, b) => {
                            const bitmapA = a.bitmap[0];
                            const bitmapB = b.bitmap[0];
                            if (!(bitmapA.tileModeX === 'repeat' || bitmapA.tileModeY === 'repeat' || bitmapA.tileMode === 'repeat')) {
                                return 1;
                            }
                            else if (!(bitmapB.tileModeX === 'repeat' || bitmapB.tileModeY === 'repeat' || bitmapB.tileMode === 'repeat')) {
                                return -1;
                            }
                            else {
                                if (bitmapA.tileMode === 'repeat') {
                                    return -1;
                                }
                                else if (bitmapB.tileMode === 'repeat') {
                                    return 1;
                                }
                                else {
                                    return bitmapB.tileModeX === 'repeat' || bitmapB.tileModeY === 'repeat' ? 1 : -1;
                                }
                            }
                        });
                        const backgroundColor = getShapeAttribute(stored, 'backgroundColor') || [];
                        const borderRadius = getShapeAttribute(stored, 'radius');
                        const vectorGradient = $SvgBuild$1 && backgroundGradient.length > 0 && backgroundGradient.some(gradient => gradient.colorStops.length > 0);
                        if (vectorGradient) {
                            const width = node.bounds.width;
                            const height = node.bounds.height;
                            const vectorData = {
                                namespace: getXmlNs('aapt'),
                                width: $util$i.formatPX(width),
                                height: $util$i.formatPX(height),
                                viewportWidth: width.toString(),
                                viewportHeight: height.toString(),
                                alpha: '',
                                A: [{
                                        region: [[]],
                                        clipRegion: false,
                                        path: [[]],
                                        clipPath: false,
                                        BB: [{
                                                render: [[]],
                                                CCC: [{
                                                        value: $SvgBuild$1.drawRect(width, height),
                                                        clipElement: false,
                                                        fillPattern: [{ gradients: backgroundGradient }]
                                                    }],
                                                DDD: false
                                            }]
                                    }],
                                B: false
                            };
                            const xml = $xml$6.createTemplate(TEMPLATES.VECTOR, vectorData, true);
                            let vectorName = Resource.getStoredName('drawables', xml);
                            if (vectorName === '') {
                                vectorName = `${node.tagName.toLowerCase()}_${node.controlId}_gradient`;
                                STORED$1.drawables.set(vectorName, xml);
                            }
                            backgroundVector.push({ src: vectorName });
                        }
                        let template;
                        const border = stored.border;
                        if (border && !(border.style === 'double' && parseInt(border.width) > 2 || (border.style === 'groove' || border.style === 'ridge') && parseInt(border.width) > 1)) {
                            const stroke = getShapeAttribute(stored, 'stroke') || [];
                            if (backgroundImage.length === 0 && backgroundGradient.length <= 1 && !vectorGradient) {
                                if (borderRadius && borderRadius[0]['radius'] === undefined) {
                                    borderRadius[0]['radius'] = '1px';
                                }
                                template = TEMPLATES.SHAPE;
                                data = {
                                    A: stroke,
                                    B: backgroundColor,
                                    C: borderRadius,
                                    D: backgroundGradient.length ? backgroundGradient : false
                                };
                            }
                            else {
                                template = TEMPLATES.LAYER_LIST;
                                data = {
                                    A: backgroundColor,
                                    B: !vectorGradient && backgroundGradient.length ? backgroundGradient : false,
                                    C: backgroundVector,
                                    D: imagesD.length ? imagesD : false,
                                    E: imagesE.length ? imagesE : false,
                                    F: Resource.isBorderVisible(border) || borderRadius ? [{ stroke, corners: borderRadius }] : false
                                };
                            }
                        }
                        else {
                            template = TEMPLATES.LAYER_LIST;
                            data = {
                                A: backgroundColor,
                                B: !vectorGradient && backgroundGradient.length ? backgroundGradient : false,
                                C: backgroundVector,
                                D: imagesD.length ? imagesD : false,
                                E: imagesE.length ? imagesE : false,
                                F: []
                            };
                            const visibleAll = borderVisible[1] && borderVisible[2];
                            function getHideWidth(value) {
                                return value + (visibleAll ? 0 : value === 1 ? 1 : 2);
                            }
                            if (borderStyle.size === 1 && borderWidth.size === 1 && borderData && !(borderData.style === 'groove' || borderData.style === 'ridge')) {
                                const width = parseInt(borderData.width);
                                if (borderData.style === 'double' && width > 2) {
                                    insertDoubleBorder.apply(null, [
                                        data,
                                        borderData,
                                        borderVisible[0],
                                        borderVisible[1],
                                        borderVisible[2],
                                        borderVisible[3],
                                        borderRadius
                                    ]);
                                }
                                else if (data.F) {
                                    const hideWidth = `-${$util$i.formatPX(getHideWidth(width))}`;
                                    const leftTop = !borderVisible[0] && !borderVisible[3];
                                    const topOnly = !borderVisible[0] && borderVisible[1] && borderVisible[2] && borderVisible[3];
                                    const leftOnly = borderVisible[0] && borderVisible[1] && borderVisible[2] && !borderVisible[3];
                                    data.F.push({
                                        top: borderVisible[0] ? '' : hideWidth,
                                        right: borderVisible[1] ? (borderVisible[3] || leftTop || leftOnly ? '' : borderData.width) : hideWidth,
                                        bottom: borderVisible[2] ? (borderVisible[0] || leftTop || topOnly ? '' : borderData.width) : hideWidth,
                                        left: borderVisible[3] ? '' : hideWidth,
                                        stroke: getShapeAttribute({ border: borderData }, 'stroke'),
                                        corners: borderRadius
                                    });
                                }
                            }
                            else {
                                for (let i = 0; i < borders.length; i++) {
                                    if (borderVisible[i]) {
                                        const item = borders[i];
                                        const width = parseInt(item.width);
                                        if (item.style === 'double' && width > 2) {
                                            insertDoubleBorder.apply(null, [
                                                data,
                                                item,
                                                i === 0,
                                                i === 1,
                                                i === 2,
                                                i === 3,
                                                borderRadius
                                            ]);
                                        }
                                        else if (data.F) {
                                            const hasInset = width > 1 && (item.style === 'groove' || item.style === 'ridge');
                                            const outsetWidth = hasInset ? Math.ceil(width / 2) : width;
                                            const baseWidth = getHideWidth(outsetWidth);
                                            const visible = !visibleAll && item.width === '1px';
                                            let hideWidth = `-${$util$i.formatPX(baseWidth)}`;
                                            let hideTopWidth = `-${$util$i.formatPX(baseWidth + (visibleAll ? 1 : 0))}`;
                                            data.F.push({
                                                top: i === 0 ? '' : hideTopWidth,
                                                right: i === 1 ? (visible ? item.width : '') : hideWidth,
                                                bottom: i === 2 ? (visible ? item.width : '') : hideWidth,
                                                left: i === 3 ? '' : hideWidth,
                                                stroke: getShapeAttribute({ border: item }, 'stroke', i, hasInset),
                                                corners: borderRadius
                                            });
                                            if (hasInset) {
                                                hideWidth = `-${$util$i.formatPX(getHideWidth(width))}`;
                                                hideTopWidth = `-${$util$i.formatPX(width + (visibleAll ? 1 : 0))}`;
                                                data.F.unshift({
                                                    top: i === 0 ? '' : hideTopWidth,
                                                    right: i === 1 ? (visible ? item.width : '') : hideWidth,
                                                    bottom: i === 2 ? (visible ? item.width : '') : hideWidth,
                                                    left: i === 3 ? '' : hideWidth,
                                                    stroke: getShapeAttribute({ border: item }, 'stroke', i, true, true),
                                                    corners: false
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (template) {
                            const xml = $xml$6.createTemplate(template, data);
                            resourceName = Resource.getStoredName('drawables', xml);
                            if (resourceName === '') {
                                resourceName = `${node.tagName.toLowerCase()}_${node.controlId}`;
                                STORED$1.drawables.set(resourceName, xml);
                            }
                        }
                        node.android('background', `@drawable/${resourceName}`, false);
                        if (backgroundImage.length) {
                            node.data('RESOURCE', 'backgroundImage', true);
                            if (this.options.autoSizeBackgroundImage &&
                                !node.documentRoot &&
                                !node.imageElement &&
                                !node.svgElement &&
                                node.renderParent && !node.renderParent.tableElement &&
                                !node.hasBit('excludeProcedure', $enum$g.NODE_PROCEDURE.AUTOFIT)) {
                                const sizeParent = { width: 0, height: 0 };
                                for (const item of backgroundDimensions) {
                                    if (item) {
                                        sizeParent.width = Math.max(sizeParent.width, item.width);
                                        sizeParent.height = Math.max(sizeParent.height, item.height);
                                    }
                                }
                                if (sizeParent.width === 0) {
                                    let current = node;
                                    while (current && !current.documentBody) {
                                        if (current.hasWidth) {
                                            sizeParent.width = current.bounds.width;
                                        }
                                        if (current.hasHeight) {
                                            sizeParent.height = current.bounds.height;
                                        }
                                        if (!current.pageFlow || (sizeParent.width > 0 && sizeParent.height > 0)) {
                                            break;
                                        }
                                        current = current.documentParent;
                                    }
                                }
                                if (!node.has('width', 2 /* UNIT */)) {
                                    const width = node.bounds.width + (node.is(CONTAINER_NODE.LINE) ? 0 : node.borderLeftWidth + node.borderRightWidth);
                                    if (sizeParent.width === 0 || (width > 0 && width < sizeParent.width)) {
                                        node.css('width', $util$i.formatPX(width), true);
                                    }
                                }
                                if (!node.has('height', 2 /* UNIT */)) {
                                    const height = node.bounds.height + (node.is(CONTAINER_NODE.LINE) ? 0 : node.borderTopWidth + node.borderBottomWidth);
                                    if (sizeParent.height === 0 || (height > 0 && height < sizeParent.height)) {
                                        node.css('height', $util$i.formatPX(height), true);
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
                    }
                    else if (!node.data(Resource.KEY_NAME, 'fontStyle') && $util$i.hasValue(stored.backgroundColor)) {
                        node.android('background', `@color/${stored.backgroundColor}`, false);
                    }
                }
            }
        }
    }

    const $util$j = squared.lib.util;
    const STORED$2 = Resource.STORED;
    const NAMESPACE_ATTR = ['android', 'app'];
    function getResourceName(map, name, value) {
        for (const [storedName, storedValue] of map.entries()) {
            if (storedName.startsWith(name) && value === storedValue) {
                return storedName;
            }
        }
        return map.has(name) && map.get(name) !== value ? Resource.generateId('dimen', name) : name;
    }
    function getAttributeName(value) {
        return $util$j.convertUnderscore(value).replace('layout_', '');
    }
    function getDisplayName(value) {
        return $util$j.lastIndexOf(value, '.');
    }
    class ResourceDimens extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        afterProcedure() {
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
                            if (/^-?[\d.]+(px|dp|sp)$/.test(value)) {
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
                    const [namespace, attr, value] = name.split(',');
                    const key = getResourceName(STORED$2.dimens, `${getDisplayName(tagName)}_${getAttributeName(attr)}`, value);
                    for (const node of group[name]) {
                        node[namespace](attr, `@dimen/${key}`);
                    }
                    STORED$2.dimens.set(key, value);
                }
            }
        }
        afterFinalize() {
            for (const view of this.application.viewData) {
                const pattern = /[\s\n]+<[^<]*?(\w+):(\w+)="(-?[\d.]+(?:px|dp|sp))"/;
                let match;
                let content = view.content;
                while ((match = pattern.exec(content)) !== null) {
                    const controlName = /^[\s\n]+<([\w\-.]+)[\s\n]/.exec(match[0]);
                    if (controlName) {
                        const key = getResourceName(STORED$2.dimens, `${getDisplayName(controlName[1]).toLowerCase()}_${getAttributeName(match[2])}`, match[3]);
                        STORED$2.dimens.set(key, match[3]);
                        content = content.replace(match[0], match[0].replace(match[3], `@dimen/${key}`));
                    }
                }
                view.content = content;
            }
        }
    }

    const $enum$h = squared.base.lib.enumeration;
    const $dom$9 = squared.lib.dom;
    const $util$k = squared.lib.util;
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
        '-apple-system': 'sans-serif'
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
    if ($dom$9.isUserAgent(8 /* EDGE */)) {
        FONTREPLACE_ANDROID['consolas'] = 'monospace';
    }
    const STORED$3 = Resource.STORED;
    function deleteStyleAttribute(sorted, attrs, ids) {
        for (const value of attrs.split(';')) {
            for (let i = 0; i < sorted.length; i++) {
                if (sorted[i]) {
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
                        sorted[index][key] = $util$k.filterArray(sorted[index][key], id => !ids.includes(id));
                        if (sorted[index][key].length === 0) {
                            delete sorted[index][key];
                        }
                        break;
                    }
                }
            }
        }
    }
    class ResourceFonts extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.options = {
                fontResourceValue: true
            };
            this.eventOnly = true;
        }
        afterParseDocument() {
            const settings = this.application.userSettings;
            const nameMap = {};
            const groupMap = {};
            for (const node of this.application.session.cache) {
                if (node.visible && node.data(Resource.KEY_NAME, 'fontStyle') && !node.hasBit('excludeResource', $enum$h.NODE_RESOURCE.FONT_STYLE)) {
                    if (nameMap[node.tagName] === undefined) {
                        nameMap[node.tagName] = [];
                    }
                    nameMap[node.tagName].push(node);
                }
            }
            for (const tag in nameMap) {
                const sorted = [];
                for (let node of nameMap[tag]) {
                    const controlId = node.id;
                    const companion = node.companion;
                    if (companion && !companion.visible && companion.tagName === 'LABEL') {
                        node = companion;
                    }
                    const stored = Object.assign({}, node.data(Resource.KEY_NAME, 'fontStyle'));
                    let system = false;
                    stored.backgroundColor = Resource.addColor(stored.backgroundColor);
                    if (stored.fontFamily) {
                        let fontFamily = stored.fontFamily.split(',')[0].replace(/"/g, '').toLowerCase().trim();
                        let fontStyle = '';
                        let fontWeight = '';
                        stored.color = Resource.addColor(stored.color);
                        if (this.options.fontResourceValue && FONTREPLACE_ANDROID[fontFamily]) {
                            fontFamily = FONTREPLACE_ANDROID[fontFamily];
                        }
                        if (FONT_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[fontFamily] ||
                            this.options.fontResourceValue && FONTALIAS_ANDROID[fontFamily] && node.localSettings.targetAPI >= FONT_ANDROID[FONTALIAS_ANDROID[fontFamily]]) {
                            system = true;
                            stored.fontFamily = fontFamily;
                            if (stored.fontStyle === 'normal') {
                                delete stored.fontStyle;
                            }
                            if (stored.fontWeight === '400') {
                                delete stored.fontWeight;
                            }
                        }
                        else {
                            fontFamily = $util$k.convertWord(fontFamily);
                            stored.fontFamily = `@font/${fontFamily + (stored.fontStyle !== 'normal' ? `_${stored.fontStyle}` : '') + (stored.fontWeight !== '400' ? `_${FONTWEIGHT_ANDROID[stored.fontWeight] || stored.fontWeight}` : '')}`;
                            fontStyle = stored.fontStyle;
                            fontWeight = stored.fontWeight;
                            delete stored.fontStyle;
                            delete stored.fontWeight;
                        }
                        if (!system) {
                            const fonts = Resource.STORED.fonts.get(fontFamily) || {};
                            fonts[`${fontStyle}-${FONTWEIGHT_ANDROID[fontWeight] || fontWeight}`] = true;
                            Resource.STORED.fonts.set(fontFamily, fonts);
                        }
                    }
                    const keys = Object.keys(FONT_STYLE);
                    for (let i = 0; i < keys.length; i++) {
                        if (sorted[i] === undefined) {
                            sorted[i] = {};
                        }
                        const value = stored[keys[i]];
                        if ($util$k.hasValue(value) && node.supported('android', keys[i])) {
                            const attr = $util$k.formatString(FONT_STYLE[keys[i]], value);
                            if (sorted[i][attr] === undefined) {
                                sorted[i][attr] = [];
                            }
                            sorted[i][attr].push(controlId);
                        }
                    }
                }
                groupMap[tag] = sorted;
            }
            const style = {};
            const layout = {};
            for (const tag in groupMap) {
                style[tag] = {};
                layout[tag] = {};
                const count = nameMap[tag].length;
                const sorted = $util$k.filterArray(groupMap[tag], item => Object.keys(item).length > 0).sort((a, b) => {
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
                            const value = sorted[0][attr];
                            if (value.length === 1) {
                                layout[tag][attr] = value;
                            }
                            else if (value.length > 1) {
                                style[tag][attr] = value;
                            }
                        }
                        sorted.length = 0;
                    }
                    else {
                        const styleKey = {};
                        const layoutKey = {};
                        for (let i = 0; i < sorted.length; i++) {
                            if (!sorted[i]) {
                                continue;
                            }
                            const filtered = {};
                            const combined = {};
                            const deleteKeys = new Set();
                            for (const attr1 in sorted[i]) {
                                const ids = sorted[i][attr1];
                                let revalidate = false;
                                if (!ids || ids.length === 0) {
                                    continue;
                                }
                                else if (ids.length === count) {
                                    styleKey[attr1] = ids.slice(0);
                                    sorted[i] = {};
                                    revalidate = true;
                                }
                                else if (ids.length === 1) {
                                    layoutKey[attr1] = ids.slice(0);
                                    sorted[i][attr1] = [];
                                    revalidate = true;
                                }
                                if (!revalidate) {
                                    const found = {};
                                    let merged = false;
                                    for (let j = 0; j < sorted.length; j++) {
                                        if (i !== j && sorted[j]) {
                                            for (const attr in sorted[j]) {
                                                const compare = sorted[j][attr];
                                                if (compare.length) {
                                                    for (const controlId of ids) {
                                                        if (compare.includes(controlId)) {
                                                            if (found[attr] === undefined) {
                                                                found[attr] = [];
                                                            }
                                                            found[attr].push(controlId);
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
                            }
                            for (const attr1 in filtered) {
                                for (const attr2 in filtered) {
                                    if (attr1 !== attr2 && filtered[attr1].join('') === filtered[attr2].join('')) {
                                        const index = filtered[attr1].join(',');
                                        if (combined[index]) {
                                            combined[index] = new Set([...combined[index], ...attr2.split(';')]);
                                        }
                                        else {
                                            combined[index] = new Set([...attr1.split(';'), ...attr2.split(';')]);
                                        }
                                        deleteKeys.add(attr1).add(attr2);
                                    }
                                }
                            }
                            for (const value of deleteKeys) {
                                delete filtered[value];
                            }
                            for (const attrs in filtered) {
                                deleteStyleAttribute(sorted, attrs, filtered[attrs]);
                                style[tag][attrs] = filtered[attrs];
                            }
                            for (const index in combined) {
                                const attrs = Array.from(combined[index]).sort().join(';');
                                const ids = $util$k.replaceMap(index.split(','), value => parseInt(value));
                                deleteStyleAttribute(sorted, attrs, ids);
                                style[tag][attrs] = ids;
                            }
                        }
                        const shared = Object.keys(styleKey);
                        if (shared.length) {
                            if (shared.length > 1 || styleKey[shared[0]].length > 1) {
                                style[tag][shared.join(';')] = styleKey[shared[0]];
                            }
                            else {
                                Object.assign(layoutKey, styleKey);
                            }
                        }
                        for (const attr in layoutKey) {
                            layout[tag][attr] = layoutKey[attr];
                        }
                        for (let i = 0; i < sorted.length; i++) {
                            if (sorted[i] && Object.keys(sorted[i]).length === 0) {
                                delete sorted[i];
                            }
                        }
                        $util$k.spliceArray(sorted, item => {
                            if (item) {
                                for (const attr in item) {
                                    if (item[attr] && item[attr].length) {
                                        return false;
                                    }
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
                        const match = $util$k.REGEXP_PATTERN.ATTRIBUTE.exec(value);
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
                    styleData[i].name = $util$k.capitalize(tag) + (i > 0 ? `_${i}` : '');
                }
                resource[tag] = styleData;
            }
            for (const tag in resource) {
                for (const group of resource[tag]) {
                    if (group.ids) {
                        for (const id of group.ids) {
                            if (nodeMap[id] === undefined) {
                                nodeMap[id] = { styles: [], attrs: [] };
                            }
                            nodeMap[id].styles.push(group.name);
                        }
                    }
                }
                if (layout[tag]) {
                    for (const attr in layout[tag]) {
                        for (const id of layout[tag][attr]) {
                            if (nodeMap[id] === undefined) {
                                nodeMap[id] = { styles: [], attrs: [] };
                            }
                            nodeMap[id].attrs.push(attr);
                        }
                    }
                }
            }
            for (const id in nodeMap) {
                const node = this.application.session.cache.find('id', parseInt(id));
                if (node) {
                    const styles = nodeMap[id].styles;
                    if (styles.length) {
                        parentStyle.add(styles.join('.'));
                        node.attr('_', 'style', `@style/${styles.pop()}`);
                    }
                    for (const value of nodeMap[id].attrs.sort()) {
                        node.formatted(replaceUnit(value, settings.resolutionDPI, settings.convertPixels, true), false);
                    }
                }
            }
            for (const value of parentStyle) {
                let parent = '';
                for (const name of value.split('.')) {
                    const match = name.match(/^(\w*?)(?:_(\d+))?$/);
                    if (match) {
                        const data = resource[match[1].toUpperCase()];
                        const index = match[2] ? parseInt(match[2]) : 0;
                        if (data[index]) {
                            STORED$3.styles.set(name, Object.assign({}, data[index], { name, parent }));
                            parent = name;
                        }
                    }
                }
            }
        }
    }

    const $util$l = squared.lib.util;
    const $xml$7 = squared.lib.xml;
    class ResourceIncludes extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        afterDepthLevel() {
            const processing = this.application.processing;
            for (const node of processing.cache) {
                const open = [];
                const close = [];
                node.renderEach((item, index) => {
                    const openTag = $util$l.hasValue(item.dataset.androidInclude);
                    const closeTag = item.dataset.androidIncludeEnd === 'true';
                    if (openTag || closeTag) {
                        const merge = item.dataset.androidIncludeMerge === 'true';
                        const data = {
                            item,
                            name: (item.dataset.androidInclude || '').trim(),
                            index,
                            merge
                        };
                        if (openTag) {
                            open.push(data);
                        }
                        if (closeTag) {
                            close.push(data);
                        }
                    }
                });
                if (open.length && close.length) {
                    open.length = Math.min(open.length, close.length);
                    for (let i = open.length; i < close.length; i++) {
                        close.shift();
                    }
                    for (let i = open.length - 1; i >= 0; i--) {
                        const openData = open[i];
                        for (let j = 0; j < close.length; j++) {
                            const closeData = close[j];
                            if (closeData.index >= openData.index) {
                                const location = new Map();
                                let valid = true;
                                for (let k = openData.index; k <= closeData.index; k++) {
                                    const item = node.renderChildren[k];
                                    const depthMap = processing.depthMap.get(node.id);
                                    if (depthMap && depthMap.has(item.renderPositionId)) {
                                        const items = location.get(node.id) || [];
                                        items.push(item);
                                        location.set(node.id, items);
                                    }
                                    else {
                                        valid = false;
                                    }
                                }
                                if (valid) {
                                    const content = new Map();
                                    const group = [];
                                    let k = 0;
                                    for (const [id, templates] of processing.depthMap.entries()) {
                                        const parent = location.get(id);
                                        if (parent) {
                                            const deleteIds = [];
                                            for (const [key, template] of templates.entries()) {
                                                const item = parent.find(sibling => sibling.renderPositionId === key);
                                                if (item) {
                                                    if (k === 0) {
                                                        const xml = this.application.controllerHandler.renderNodeStatic('include', item.renderDepth, { layout: `@layout/${openData.name}` });
                                                        templates.set(key, xml);
                                                        k++;
                                                    }
                                                    else {
                                                        deleteIds.push(key);
                                                    }
                                                    content.set(key, template);
                                                    group.push(item);
                                                }
                                            }
                                            for (const value of deleteIds) {
                                                templates.delete(value);
                                            }
                                        }
                                    }
                                    if (content.size) {
                                        const controller = this.application.controllerHandler;
                                        const merge = openData.merge || content.size > 1;
                                        const depth = merge ? 1 : 0;
                                        for (const item of group) {
                                            if (item.renderDepth !== depth) {
                                                const key = item.renderPositionId;
                                                const output = content.get(key);
                                                if (output) {
                                                    content.set(key, controller.replaceIndent(output, depth, controller.cache.children));
                                                }
                                            }
                                        }
                                        let xml = '';
                                        for (const value of content.values()) {
                                            xml += value;
                                        }
                                        if (merge) {
                                            xml = controller.getEnclosingTag('merge', 0, 0, xml);
                                        }
                                        else if (!openData.item.documentRoot) {
                                            const hash = $xml$7.formatPlaceholder(openData.item.id, '@');
                                            xml = xml.replace(hash, `{#0}${hash}`);
                                            openData.item.documentRoot = true;
                                        }
                                        this.application.addIncludeFile(openData.name, xml);
                                    }
                                }
                                close.splice(j, 1);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    const $enum$i = squared.base.lib.enumeration;
    const $dom$a = squared.lib.dom;
    const $xml$8 = squared.lib.xml;
    class ResourceStrings extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.options = {
                numberResourceValue: false
            };
            this.eventOnly = true;
        }
        afterResources() {
            for (const node of this.application.processing.cache) {
                if (!node.hasBit('excludeResource', $enum$i.NODE_RESOURCE.VALUE_STRING)) {
                    const element = node.element;
                    if (element && element.tagName === 'SELECT') {
                        const [stringArray, numberArray] = Resource.getOptionArray(element);
                        let result;
                        if (!this.options.numberResourceValue && numberArray && numberArray.length) {
                            result = numberArray;
                        }
                        else {
                            const resourceArray = stringArray || numberArray;
                            if (resourceArray) {
                                result = [];
                                for (let value of resourceArray) {
                                    value = Resource.addString($xml$8.replaceCharacter(value), '', this.options.numberResourceValue);
                                    result.push(value !== '' ? `@string/${value}` : '');
                                }
                            }
                        }
                        if (result && result.length) {
                            const arrayValue = result.join('-');
                            let arrayName = '';
                            for (const [storedName, storedResult] of Resource.STORED.arrays.entries()) {
                                if (arrayValue === storedResult.join('-')) {
                                    arrayName = storedName;
                                    break;
                                }
                            }
                            if (arrayName === '') {
                                arrayName = `${node.controlId}_array`;
                                Resource.STORED.arrays.set(arrayName, result);
                            }
                            node.android('entries', `@array/${arrayName}`, false);
                        }
                    }
                    else {
                        const stored = node.data(Resource.KEY_NAME, 'valueString');
                        if (stored) {
                            const renderParent = node.renderParent;
                            if (renderParent && renderParent.layoutRelative) {
                                if (node.alignParent('left') && !$dom$a.cssParent(node.element, 'whiteSpace', 'pre', 'pre-wrap')) {
                                    const value = node.textContent;
                                    let leadingSpace = 0;
                                    for (let i = 0; i < value.length; i++) {
                                        switch (value.charCodeAt(i)) {
                                            case 160:
                                                leadingSpace++;
                                            case 32:
                                                continue;
                                            default:
                                                break;
                                        }
                                    }
                                    if (leadingSpace === 0) {
                                        stored.value = stored.value.replace(/^(\s|&#160;)+/, '');
                                    }
                                }
                            }
                            stored.value = $xml$8.replaceCharacter(stored.value);
                            if (node.htmlElement) {
                                if (node.css('fontVariant') === 'small-caps') {
                                    stored.value = stored.value.toUpperCase();
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
                                        stored.value = '&#160;'.repeat(Math.floor(textIndent / 7)) + stored.value;
                                    }
                                    else if (node.toInt('textIndent') + node.bounds.width < 0) {
                                        stored.value = '';
                                    }
                                }
                            }
                            const name = Resource.addString(stored.value, stored.name, this.options.numberResourceValue);
                            if (name !== '') {
                                node.android('text', isNaN(parseInt(name)) || parseInt(name).toString() !== name ? `@string/${name}` : name, false);
                            }
                        }
                    }
                }
            }
        }
    }

    const $util$m = squared.lib.util;
    const STORED$4 = Resource.STORED;
    class ResourceStyles extends squared.base.Extension {
        constructor() {
            super(...arguments);
            this.eventOnly = true;
        }
        afterProcedure() {
            const styles = {};
            for (const node of this.application.session.cache) {
                if (node.visible) {
                    const children = node.renderChildren;
                    if (node.controlId && children.length > 1) {
                        const attrMap = new Map();
                        let style = '';
                        let valid = true;
                        for (let i = 0; i < children.length; i++) {
                            let found = false;
                            children[i].combine('_', 'android').some(value => {
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
                                if (value !== children.length) {
                                    attrMap.delete(attr);
                                }
                            }
                            if (attrMap.size > 1) {
                                if (style !== '') {
                                    style = $util$m.trimString(style.substring(style.indexOf('/') + 1), '"');
                                }
                                const common = [];
                                for (const attr of attrMap.keys()) {
                                    const match = attr.match(/(\w+):(\w+)="([^"]+)"/);
                                    if (match) {
                                        for (const item of children) {
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
                                if (!(name !== '' && style !== '' && name.startsWith(`${style}.`))) {
                                    name = $util$m.convertCamelCase((style !== '' ? `${style}.` : '') + $util$m.capitalize(node.controlId), '_');
                                    styles[name] = common;
                                }
                                for (const item of children) {
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
                    const match = $util$m.REGEXP_PATTERN.ATTRIBUTE.exec(styles[name][attr]);
                    if (match) {
                        items.push({ name: match[1], value: match[2] });
                    }
                }
                STORED$4.styles.set(name, Object.assign({}, createStyleAttribute(), { name, items, ids: [] }));
            }
        }
    }

    var ANIMATEDVECTOR_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<animated-vector xmlns:android="http://schemas.android.com/apk/res/android" android:drawable="@drawable/{&vectorName}">
<<A>>
	<target android:name="{&name}" android:animation="@anim/{&animationName}" />
<<A>>
</animated-vector>`;

    var SETOBJECTANIMATOR_TMPL = `<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android">
<<A>>
	<set android:ordering="{~ordering}">
	<<AA>>
		<set android:ordering="{~ordering}">
		<<fillBefore>>
			<set>
			<<values>><<values>>
			</set>
		<<fillBefore>>
		<<repeating>>
			<objectAnimator
				android:propertyName="{~propertyName}"
				android:interpolator="{~interpolator}"
				android:valueType="{~valueType}"
				android:valueFrom="{~valueFrom}"
				android:valueTo="{~valueTo}"
				android:startOffset="{~startOffset}"
				android:duration="{&duration}"
				android:repeatCount="{&repeatCount}">
			<<propertyValues>>
				<propertyValuesHolder android:propertyName="{&propertyName}">
				<<keyframes>>
					<keyframe android:interpolator="{~interpolator}" android:fraction="{~fraction}" android:value="{~value}" />
				<<keyframes>>
				</propertyValuesHolder>
			<<propertyValues>>
			</objectAnimator>
		<<repeating>>
		<<fillCustom>>
			<set android:ordering="{~ordering}">
			<<values>><<values>>
			</set>
		<<fillCustom>>
		<<fillAfter>>
			<set>
			<<values>>
				<objectAnimator
					android:propertyName="{&propertyName}"
					android:interpolator="{~interpolator}"
					android:valueType="{~valueType}"
					android:valueFrom="{~valueFrom}"
					android:valueTo="{&valueTo}"
					android:startOffset="{~startOffset}"
					android:duration="{&duration}"
					android:repeatCount="{&repeatCount}" />
			<<values>>
			</set>
		<<fillAfter>>
		</set>
	<<AA>>
	<<BB>>
		<<together>>
		<objectAnimator
			android:propertyName="{&propertyName}"
			android:interpolator="{~interpolator}"
			android:valueType="{~valueType}"
			android:valueFrom="{~valueFrom}"
			android:valueTo="{&valueTo}"
			android:startOffset="{~startOffset}"
			android:duration="{&duration}"
			android:repeatCount="{&repeatCount}" />
		<<together>>
	<<BB>>
	</set>
<<A>>
</set>`;

    if (!squared.svg) {
        squared.svg = { lib: {} };
    }
    var $Svg = squared.svg.Svg;
    var $SvgAnimate = squared.svg.SvgAnimate;
    var $SvgAnimateTransform = squared.svg.SvgAnimateTransform;
    var $SvgBuild$2 = squared.svg.SvgBuild;
    var $SvgG = squared.svg.SvgG;
    var $SvgPath = squared.svg.SvgPath;
    var $SvgShape = squared.svg.SvgShape;
    const $util$n = squared.lib.util;
    const $math$2 = squared.lib.math;
    const $xml$9 = squared.lib.xml;
    const $constS = squared.svg.lib.constant;
    const $utilS$1 = squared.svg.lib.util;
    const TEMPLATES$1 = {};
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
	android:controlY2="{3}" />`;
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
                return $util$n.convertCamelCase(attr);
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
            const interpolatorName = `path_interpolator_${$util$n.convertWord(value)}`;
            if (!STORED$5.animators.has(interpolatorName)) {
                const xml = $util$n.formatString(INTERPOLATOR_XML, ...value.split(' '));
                STORED$5.animators.set(interpolatorName, xml);
            }
            return `@anim/${interpolatorName}`;
        }
    }
    function createTransformData(transform) {
        const result = {};
        if (transform) {
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
            if (($utilS$1.SVG.svg(parent) || $utilS$1.SVG.use(parent)) && parent !== rootElement) {
                x += parent.x.baseVal.value;
                y += parent.y.baseVal.value;
            }
        }
        return { x, y };
    }
    function getOuterOpacity(target) {
        let result = parseFloat(target.opacity);
        let current = target.parent;
        while (current) {
            const opacity = parseFloat(current['opacity'] || '1');
            if (!isNaN(opacity) && opacity < 1) {
                result *= opacity;
            }
            current = current['parent'];
        }
        return result;
    }
    function partitionTransforms(element, transforms, rx = 1, ry = 1) {
        if (transforms.length && ($utilS$1.SVG.circle(element) || $utilS$1.SVG.ellipse(element))) {
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
            const rotateOrigin = transforms[0].fromCSS ? [] : $utilS$1.TRANSFORM.rotateOrigin(element).reverse();
            for (let i = 1; i < items.length; i++) {
                const itemA = items[i];
                const itemB = items[i - 1];
                if (itemA.type === itemB.type) {
                    let matrix;
                    switch (itemA.type) {
                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                            matrix = $utilS$1.MATRIX.clone(itemA.matrix);
                            matrix.e += itemB.matrix.e;
                            matrix.f += itemB.matrix.f;
                            break;
                        case SVGTransform.SVG_TRANSFORM_SCALE: {
                            matrix = $utilS$1.MATRIX.clone(itemA.matrix);
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
        let result;
        const value = values[index];
        if (value) {
            result = Array.isArray(value) ? value[propertyIndex].toString() : value;
        }
        else if (!keyFrames && index === 0) {
            result = baseValue;
        }
        return result || '';
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
        result.from = from !== undefined ? from : to;
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
        const name = Resource.addColor(value);
        value = name !== '' ? `@color/${name}` : '';
        return (asArray ? [value] : value);
    }
    function convertValueType(item, value) {
        if (isColorType(item.attributeName)) {
            return getColorValue(value);
        }
        return value.trim() || undefined;
    }
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
            if ($SvgBuild$2) {
                if (TEMPLATES$1.ANIMATED === undefined) {
                    TEMPLATES$1.ANIMATED = $xml$9.parseTemplate(ANIMATEDVECTOR_TMPL);
                    TEMPLATES$1.LAYER_LIST = $xml$9.parseTemplate(LAYERLIST_TMPL);
                    TEMPLATES$1.SET_OBJECTANIMATOR = $xml$9.parseTemplate(SETOBJECTANIMATOR_TMPL);
                }
                $SvgBuild$2.setName();
                this.application.controllerHandler.localSettings.unsupported.tagName.delete('svg');
            }
        }
        afterResources() {
            for (const node of this.application.processing.cache) {
                if (node.svgElement) {
                    const svg = new $Svg(node.element);
                    const supportedKeyFrames = node.localSettings.targetAPI >= 23 /* MARSHMALLOW */;
                    this.NODE_INSTANCE = node;
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
                    const templateName = $util$n.convertWord(`${node.tagName}_${node.controlId}_viewbox`, true).toLowerCase();
                    const getFilename = (prefix = '', suffix = '') => templateName + (prefix !== '' ? `_${prefix}` : '') + (this.IMAGE_DATA.length ? '_vector' : '') + (suffix !== '' ? `_${suffix.toLowerCase()}` : '');
                    let drawable = '';
                    let vectorName = '';
                    {
                        const template = $xml$9.parseTemplate(VECTOR_TMPL);
                        let xml = $xml$9.createTemplate(template, {
                            namespace: this.NAMESPACE_AAPT ? getXmlNs('aapt') : '',
                            name: svg.name,
                            width: $util$n.formatPX(svg.width),
                            height: $util$n.formatPX(svg.height),
                            viewportWidth: (svg.viewBox.width || svg.width).toString(),
                            viewportHeight: (svg.viewBox.height || svg.height).toString(),
                            alpha: parseFloat(svg.opacity) < 1 ? svg.opacity.toString() : '',
                            A: [],
                            B: [{ templateName: svg.name }]
                        });
                        const output = new Map();
                        template['__ROOT__'] = template['A'];
                        for (const [name, data] of this.VECTOR_DATA.entries()) {
                            output.set(name, $xml$9.createTemplate(template, data));
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
                        xml = $xml$9.formatTemplate(xml);
                        vectorName = Resource.getStoredName('drawables', xml);
                        if (vectorName === '') {
                            vectorName = getFilename();
                            STORED$5.drawables.set(vectorName, xml);
                        }
                    }
                    if (this.ANIMATE_DATA.size) {
                        const data = { vectorName, A: []
                        };
                        for (const [name, group] of this.ANIMATE_DATA.entries()) {
                            const targetData = { name };
                            const targetSetData = { A: [] };
                            const sequentialMap = new Map();
                            const transformMap = new Map();
                            const together = [];
                            const isolated = [];
                            const togetherTargets = [];
                            const isolatedTargets = [];
                            const transformTargets = [];
                            const [companions, animations] = $util$n.partitionArray(group.animate, child => child.companion !== undefined);
                            for (let i = 0; i < animations.length; i++) {
                                const item = animations[i];
                                if (item.setterType) {
                                    if (ATTRIBUTE_ANDROID[item.attributeName] && $util$n.hasValue(item.to)) {
                                        if (item.duration > 0 && item.fillReplace) {
                                            isolated.push(item);
                                        }
                                        else {
                                            together.push(item);
                                        }
                                    }
                                }
                                else if ($SvgBuild$2.isAnimate(item)) {
                                    const children = $util$n.filterArray(companions, child => child.companion.value === item);
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
                                        sequentially.push(...after);
                                        sequentialMap.set(`sequentially_companion_${i}`, sequentially);
                                    }
                                    else {
                                        const synchronized = item.synchronized;
                                        if (synchronized) {
                                            if ($SvgBuild$2.asAnimateTransform(item)) {
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
                                            if ($SvgBuild$2.asAnimateTransform(item)) {
                                                item.expandToValues();
                                            }
                                            if (item.iterationCount === -1) {
                                                isolated.push(item);
                                            }
                                            else if ((!item.fromToType || $SvgBuild$2.asAnimateTransform(item) && item.transformOrigin) && !(supportedKeyFrames && getValueType(item.attributeName) !== 'pathType')) {
                                                togetherTargets.push([item]);
                                            }
                                            else if (item.fillReplace) {
                                                isolated.push(item);
                                            }
                                            else {
                                                together.push(item);
                                            }
                                        }
                                    }
                                }
                            }
                            if (together.length) {
                                togetherTargets.push(together);
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
                            for (const item of isolated) {
                                isolatedTargets.push([[item]]);
                            }
                            [togetherTargets, transformTargets, ...isolatedTargets].forEach((targets, index) => {
                                const setData = {
                                    ordering: index === 0 || targets.length === 1 ? '' : 'sequentially',
                                    AA: [],
                                    BB: []
                                };
                                for (const items of targets) {
                                    let ordering;
                                    let synchronized;
                                    let fillBefore;
                                    let useKeyFrames;
                                    if (index <= 1 && items.some((item) => item.synchronized !== undefined && item.synchronized.value !== '')) {
                                        ordering = $SvgBuild$2.asAnimateTransform(items[0]) ? '' : 'sequentially';
                                        synchronized = true;
                                        fillBefore = false;
                                        useKeyFrames = false;
                                    }
                                    else if (index <= 1 && items.some((item) => item.synchronized !== undefined && item.synchronized.value === '')) {
                                        ordering = 'sequentially';
                                        synchronized = true;
                                        fillBefore = true;
                                        useKeyFrames = true;
                                    }
                                    else if (index <= 1 && items.some(item => item.companion !== undefined)) {
                                        ordering = 'sequentially';
                                        synchronized = false;
                                        fillBefore = false;
                                        useKeyFrames = true;
                                    }
                                    else {
                                        ordering = index === 0 ? '' : 'sequentially';
                                        synchronized = false;
                                        fillBefore = index > 1 && $SvgBuild$2.asAnimateTransform(items[0]);
                                        useKeyFrames = true;
                                    }
                                    const animatorData = {
                                        ordering,
                                        fillBefore: [],
                                        repeating: [],
                                        fillCustom: [],
                                        fillAfter: []
                                    };
                                    const fillBeforeData = { values: [] };
                                    const fillCustomData = { values: [] };
                                    const fillAfterData = { values: [] };
                                    const togetherData = { together: [] };
                                    (synchronized ? $util$n.partitionArray(items, (animate) => animate.iterationCount !== -1) : [items]).forEach((partition, section) => {
                                        if (section === 1 && partition.length > 1) {
                                            fillCustomData.ordering = 'sequentially';
                                        }
                                        const animatorMap = new Map();
                                        for (const item of partition) {
                                            const valueType = getValueType(item.attributeName);
                                            if (valueType === undefined) {
                                                continue;
                                            }
                                            const insertBeforeValue = (attr, value) => {
                                                if (value && fillBeforeData.values.findIndex(before => before.propertyName === attr) === -1) {
                                                    fillBeforeData.values.push(this.createPropertyValue(attr, value, '0', valueType));
                                                }
                                            };
                                            const requireBefore = item.delay > 0;
                                            let transforming = false;
                                            let transformOrigin;
                                            const setFillAfter = (propertyName, fillAfter, propertyValues, startOffset) => {
                                                if (!synchronized && item.fillReplace && valueType !== undefined) {
                                                    let valueTo = item.replaceValue;
                                                    if (!valueTo) {
                                                        if (transforming) {
                                                            valueTo = getTransformInitialValue(propertyName);
                                                        }
                                                        else if (item.parent && $SvgBuild$2.isShape(item.parent) && item.parent.path) {
                                                            if (propertyName === 'pathData') {
                                                                valueTo = item.parent.path.value;
                                                            }
                                                            else {
                                                                valueTo = item.parent.path[getPaintAttribute(propertyName)];
                                                            }
                                                        }
                                                        if (!valueTo) {
                                                            valueTo = item.baseValue;
                                                        }
                                                    }
                                                    let previousValue;
                                                    if (propertyValues && propertyValues.length) {
                                                        const lastValue = propertyValues[propertyValues.length - 1];
                                                        if ($util$n.isArray(lastValue.propertyValues)) {
                                                            const propertyValue = lastValue.propertyValues[lastValue.propertyValues.length - 1];
                                                            previousValue = propertyValue.keyframes[propertyValue.keyframes.length - 1].value;
                                                        }
                                                        else {
                                                            previousValue = lastValue.valueTo;
                                                        }
                                                    }
                                                    if ($util$n.isString(valueTo) && valueTo !== previousValue) {
                                                        valueTo = convertValueType(item, valueTo);
                                                        if (valueTo) {
                                                            switch (propertyName) {
                                                                case 'trimPathStart':
                                                                case 'trimPathEnd':
                                                                    valueTo = valueTo.split(' ')[propertyName === 'trimPathStart' ? 0 : 1];
                                                                    break;
                                                            }
                                                            fillAfter.values.push(this.createPropertyValue(propertyName, valueTo, '1', valueType, valueType === 'pathType' ? previousValue : '', startOffset ? startOffset.toString() : ''));
                                                        }
                                                    }
                                                    if (transformOrigin) {
                                                        if (propertyName.endsWith('X')) {
                                                            fillAfter.values.push(this.createPropertyValue('translateX', '0', '1', valueType));
                                                        }
                                                        else if (propertyName.endsWith('Y')) {
                                                            fillAfter.values.push(this.createPropertyValue('translateY', '0', '1', valueType));
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
                                                                fillCustomData.values.push(propertyValue);
                                                                setFillAfter(propertyNames[i], fillAfterData, undefined, index > 1 ? item.duration : 0);
                                                            }
                                                            else {
                                                                if (item.companion && item.companion.index <= 0) {
                                                                    if (companionBefore === undefined) {
                                                                        companionBefore = { values: [] };
                                                                        animatorData.fillBefore.push(companionBefore);
                                                                    }
                                                                    companionBefore.values.push(propertyValue);
                                                                }
                                                                else if (item.companion && item.companion.index > 0) {
                                                                    if (companionAfter === undefined) {
                                                                        companionAfter = { values: [] };
                                                                        animatorData.fillAfter.push(companionAfter);
                                                                    }
                                                                    companionAfter.values.push(propertyValue);
                                                                }
                                                                else {
                                                                    togetherData.together.push(propertyValue);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else if ($SvgBuild$2.isAnimate(item)) {
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
                                                let propertyNames;
                                                let values;
                                                const beforeValues = [];
                                                if (!synchronized && options.valueType === 'pathType') {
                                                    if (group.pathData) {
                                                        propertyNames = ['pathData'];
                                                        let transforms;
                                                        let companion;
                                                        if (item.parent && $SvgBuild$2.isShape(item.parent)) {
                                                            companion = item.parent;
                                                            if (item.parent.path) {
                                                                transforms = item.parent.path.transformed;
                                                            }
                                                        }
                                                        values = $SvgPath.extrapolate(item.attributeName, group.pathData, item.values, companion, transforms, this.options.floatPrecisionValue);
                                                    }
                                                }
                                                else if ($SvgBuild$2.asAnimateTransform(item)) {
                                                    propertyNames = getTransformPropertyName(item.type);
                                                    if (propertyNames === undefined) {
                                                        continue;
                                                    }
                                                    values = getTransformValues(item);
                                                    if (fillBefore || requireBefore) {
                                                        beforeValues.push(...$util$n.objectMap(propertyNames, value => getTransformInitialValue(value) || '0'));
                                                    }
                                                    transformOrigin = item.transformOrigin;
                                                    transforming = true;
                                                }
                                                else {
                                                    propertyNames = getAttributePropertyName(item.attributeName);
                                                    switch (options.valueType) {
                                                        case 'intType':
                                                            values = $util$n.objectMap(item.values, value => $util$n.convertInt(value).toString());
                                                            if (requireBefore && item.baseValue) {
                                                                beforeValues.push(...$util$n.replaceMap($SvgBuild$2.parseCoordinates(item.baseValue), value => Math.trunc(value).toString()));
                                                            }
                                                            break;
                                                        case 'floatType':
                                                            switch (item.attributeName) {
                                                                case 'stroke-dasharray':
                                                                    values = $util$n.objectMap(item.values, value => $util$n.replaceMap(value.split(' '), fraction => parseFloat(fraction)));
                                                                    break;
                                                                default:
                                                                    values = item.values;
                                                                    break;
                                                            }
                                                            if (requireBefore && item.baseValue) {
                                                                beforeValues.push(...$util$n.replaceMap($SvgBuild$2.parseCoordinates(item.baseValue), value => value.toString()));
                                                            }
                                                            break;
                                                        default:
                                                            values = item.values.slice(0);
                                                            if (isColorType(item.attributeName)) {
                                                                if (requireBefore && item.baseValue) {
                                                                    beforeValues.push(...getColorValue(item.baseValue, true));
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
                                                        if (fillBefore) {
                                                            insertBeforeValue(propertyName, beforeValues[i]);
                                                        }
                                                        if (useKeyFrames && item.keyTimes.length > 1) {
                                                            if (supportedKeyFrames && options.valueType !== 'pathType') {
                                                                if (!fillBefore && requireBefore) {
                                                                    insertBeforeValue(propertyName, beforeValues[i]);
                                                                }
                                                                const propertyValues = animatorMap.get(keyName) || [];
                                                                const keyframes = [];
                                                                for (let j = 0; j < item.keyTimes.length; j++) {
                                                                    let value = getPropertyValue(values, j, i, true);
                                                                    if (value !== '') {
                                                                        value = $math$2.truncateString(value, this.options.floatPrecisionValue);
                                                                    }
                                                                    keyframes.push({
                                                                        interpolator: j > 0 && value !== '' && propertyName !== 'pivotX' && propertyName !== 'pivotY' ? getPathInterpolator(item.keySplines, j - 1) : '',
                                                                        fraction: item.keyTimes[j] === 0 && value === '' ? '' : $math$2.truncateRange(item.keyTimes[j], this.options.floatPrecisionKeyTime),
                                                                        value
                                                                    });
                                                                }
                                                                propertyValues.push({ propertyName, keyframes });
                                                                if (!animatorMap.has(keyName)) {
                                                                    if (keyName !== '') {
                                                                        animatorMap.set(keyName, propertyValues);
                                                                    }
                                                                    (section === 0 ? animatorData.repeating : fillCustomData.values).push(Object.assign({}, options, { propertyValues }));
                                                                }
                                                                transformOrigin = undefined;
                                                            }
                                                            else {
                                                                animatorData.ordering = 'sequentially';
                                                                const translateData = {
                                                                    ordering: 'sequentially',
                                                                    fillBefore: false,
                                                                    repeating: [],
                                                                    fillCustom: false,
                                                                    fillAfter: false
                                                                };
                                                                for (let j = 0; j < item.keyTimes.length; j++) {
                                                                    const propertyOptions = Object.assign({}, options, { propertyName, startOffset: j === 0 ? (item.delay + (item.keyTimes[j] > 0 ? Math.floor(item.keyTimes[j] * item.duration) : 0)).toString() : '', propertyValues: false });
                                                                    const valueTo = getPropertyValue(values, j, i, false, options.valueType === 'pathType' ? group.pathData : item.baseValue);
                                                                    if (valueTo) {
                                                                        if (options.valueType === 'pathType') {
                                                                            const pathData = j === 0 ? group.pathData : getPropertyValue(values, j - 1, i);
                                                                            if (pathData) {
                                                                                propertyOptions.valueFrom = pathData;
                                                                            }
                                                                            else {
                                                                                continue;
                                                                            }
                                                                        }
                                                                        else if (j === 0 && !fillBefore && requireBefore) {
                                                                            propertyOptions.valueFrom = beforeValues[i];
                                                                        }
                                                                        const duration = j === 0 ? 0 : Math.floor((item.keyTimes[j] - (j > 0 ? item.keyTimes[j - 1] : 0)) * item.duration);
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
                                                                                translateData.repeating.push(valueData);
                                                                            }
                                                                        }
                                                                        propertyOptions.interpolator = j > 0 ? getPathInterpolator(item.keySplines, j - 1) : '';
                                                                        propertyOptions.duration = duration.toString();
                                                                        propertyOptions.valueTo = valueTo;
                                                                        animatorData.repeating.push(propertyOptions);
                                                                    }
                                                                }
                                                                if (translateData.repeating.length) {
                                                                    setData.AA.push(translateData);
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            const propertyOptions = Object.assign({}, options, { propertyName, interpolator: item.duration > 1 ? getPathInterpolator(item.keySplines, 0) : '', propertyValues: false });
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
                                                                    valueFrom = item.from || (!fillBefore && requireBefore ? beforeValues[i] : '');
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
                                                                (section === 0 ? animatorData.repeating : fillCustomData.values).push(propertyOptions);
                                                            }
                                                        }
                                                        if (section === 0 && !synchronized) {
                                                            setFillAfter(propertyName, fillAfterData, animatorData.repeating);
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
                                    const valid = animatorData.repeating.length > 0 || fillCustomData.values.length > 0;
                                    if (valid && fillBeforeData.values.length) {
                                        if (fillBeforeData.values.length === 1) {
                                            animatorData.repeating.unshift(fillBeforeData.values[0]);
                                        }
                                        else {
                                            animatorData.fillBefore.push(fillBeforeData);
                                        }
                                    }
                                    if (fillCustomData.values.length) {
                                        if (fillBeforeData.values.length === 1) {
                                            animatorData.repeating.push(fillCustomData.values[0]);
                                        }
                                        else {
                                            animatorData.fillCustom.push(fillCustomData);
                                        }
                                    }
                                    if (valid && fillAfterData.values.length) {
                                        if (fillAfterData.values.length === 1) {
                                            animatorData.repeating.push(fillAfterData.values[0]);
                                        }
                                        else {
                                            animatorData.fillAfter.push(fillAfterData);
                                        }
                                    }
                                    const filled = animatorData.fillBefore.length > 0 || animatorData.fillCustom.length > 0 || animatorData.fillAfter.length > 0;
                                    if (!filled && animatorData.ordering === 'sequentially' && animatorData.repeating.length === 1) {
                                        animatorData.ordering = '';
                                    }
                                    if (!filled && setData.ordering !== 'sequentially' && animatorData.ordering !== 'sequentially' && animatorData.repeating.every(repeat => repeat.propertyValues === false)) {
                                        togetherData.together.push(...animatorData.repeating);
                                        animatorData.repeating.length = 0;
                                    }
                                    else if (valid) {
                                        setData.AA.push(animatorData);
                                    }
                                    if (togetherData.together.length) {
                                        setData.BB.push(togetherData);
                                    }
                                }
                                if (setData.AA.length || setData.BB.length) {
                                    targetSetData.A.push(setData);
                                }
                            });
                            if (targetSetData.A.length) {
                                const xml = $xml$9.createTemplate(TEMPLATES$1.SET_OBJECTANIMATOR, targetSetData);
                                targetData.animationName = Resource.getStoredName('animators', xml);
                                if (targetData.animationName === '') {
                                    targetData.animationName = getFilename('anim', name);
                                    STORED$5.animators.set(targetData.animationName, xml);
                                }
                                data.A.push(targetData);
                            }
                        }
                        if (data.A.length) {
                            const xml = $xml$9.createTemplate(TEMPLATES$1.ANIMATED, data);
                            vectorName = Resource.getStoredName('drawables', xml);
                            if (vectorName === '') {
                                vectorName = getFilename('anim');
                                STORED$5.drawables.set(vectorName, xml);
                            }
                        }
                    }
                    if (this.IMAGE_DATA.length) {
                        const D = [];
                        for (const item of this.IMAGE_DATA) {
                            const scaleX = svg.width / svg.viewBox.width;
                            const scaleY = svg.height / svg.viewBox.height;
                            let x = item.getBaseValue('x', 0) * scaleX;
                            let y = item.getBaseValue('y', 0) * scaleY;
                            let width = item.getBaseValue('width', 0);
                            let height = item.getBaseValue('height', 0);
                            const offset = getParentOffset(item.element, svg.element);
                            x += offset.x;
                            y += offset.y;
                            width *= scaleX;
                            height *= scaleY;
                            const data = {
                                width: $util$n.formatPX(width),
                                height: $util$n.formatPX(height),
                                left: x !== 0 ? $util$n.formatPX(x) : '',
                                top: y !== 0 ? $util$n.formatPX(y) : '',
                                src: Resource.addImage({ mdpi: item.href }),
                                rotate: []
                            };
                            if (item.rotateAngle) {
                                data.rotate.push({
                                    src: data.src,
                                    fromDegrees: item.rotateAngle.toString(),
                                    visible: item.visible ? 'true' : 'false'
                                });
                                data.src = '';
                            }
                            else if (!item.visible) {
                                continue;
                            }
                            D.push(data);
                        }
                        const xml = $xml$9.formatTemplate($xml$9.createTemplate(TEMPLATES$1.LAYER_LIST, {
                            A: [],
                            B: false,
                            C: [{ src: vectorName }],
                            D,
                            E: false,
                            F: false
                        }));
                        drawable = Resource.getStoredName('drawables', xml);
                        if (drawable === '') {
                            drawable = templateName;
                            STORED$5.drawables.set(drawable, xml);
                        }
                    }
                    else {
                        drawable = vectorName;
                    }
                    if (drawable !== '') {
                        if (node.localSettings.targetAPI >= 21 /* LOLLIPOP */) {
                            node.android('src', `@drawable/${drawable}`);
                        }
                        else {
                            node.app('srcCompat', `@drawable/${drawable}`);
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
            this.application.controllerHandler.localSettings.unsupported.tagName.add('svg');
        }
        parseVectorData(group) {
            const groupData = this.createGroup(group);
            for (const item of group) {
                const CCC = [];
                const DDD = [];
                const render = [[]];
                const clipGroup = [];
                if ($SvgBuild$2.isShape(item)) {
                    if (item.visible && item.path && item.path.value) {
                        const pathData = this.createPath(item, item.path, render);
                        if (pathData.strokeWidth && (pathData.strokeDasharray || pathData.strokeDashoffset)) {
                            const animateData = this.ANIMATE_DATA.get(item.name);
                            if (animateData === undefined || animateData.animate.every(animate => animate.attributeName.startsWith('stroke-dash'))) {
                                const [strokeDash, pathValue, clipPathData] = item.path.extractStrokeDash(animateData && animateData.animate, false, this.options.floatPrecisionValue);
                                if (strokeDash) {
                                    const groupName = getVectorName(item, 'stroke');
                                    if (pathValue) {
                                        pathData.value = pathValue;
                                    }
                                    if (clipPathData) {
                                        clipGroup.push({ clipPathData });
                                    }
                                    for (let i = 0; i < strokeDash.length; i++) {
                                        const pathObject = i === 0 ? pathData : Object.assign({}, pathData);
                                        pathObject.name = `${groupName}_${i}`;
                                        if (animateData) {
                                            this.ANIMATE_DATA.set(pathObject.name, {
                                                element: animateData.element,
                                                animate: $util$n.filterArray(animateData.animate, animate => animate.id === undefined || animate.id === i)
                                            });
                                        }
                                        pathObject.trimPathStart = $math$2.truncateRange(strokeDash[i].start, this.options.floatPrecisionValue);
                                        pathObject.trimPathEnd = $math$2.truncateRange(strokeDash[i].end, this.options.floatPrecisionValue);
                                        CCC.push(pathObject);
                                    }
                                    if (animateData) {
                                        this.ANIMATE_DATA.delete(item.name);
                                    }
                                    render[0].push({ groupName });
                                }
                            }
                        }
                        if (CCC.length === 0) {
                            CCC.push(pathData);
                        }
                    }
                    else {
                        continue;
                    }
                }
                else if ($SvgBuild$2.asImage(item)) {
                    if (!$SvgBuild$2.asPattern(group)) {
                        if (item.width === 0 || item.height === 0) {
                            const image = this.application.session.image.get(item.href);
                            if (image && image.width > 0 && image.height > 0) {
                                item.width = image.width;
                                item.height = image.height;
                                item.setRect();
                            }
                        }
                        item.extract(this.options.transformExclude.image);
                        if (item.visible || item.rotateAngle !== undefined) {
                            this.IMAGE_DATA.push(item);
                        }
                    }
                    continue;
                }
                else if ($SvgBuild$2.isContainer(item)) {
                    if (item.visible && item.length) {
                        this.parseVectorData(item);
                        DDD.push({ templateName: item.name });
                    }
                    else {
                        continue;
                    }
                }
                groupData.BB.push({ render, clipGroup, CCC, DDD });
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
            const groupData = {};
            if ((target !== this.SVG_INSTANCE && $SvgBuild$2.asSvg(target) || $SvgBuild$2.asUseSymbol(target) || $SvgBuild$2.asUsePattern(target)) && (target.x !== 0 || target.y !== 0)) {
                groupData.groupName = getVectorName(target, 'main');
                groupData.translateX = target.x.toString();
                groupData.translateY = target.y.toString();
            }
            if (target.clipRegion !== '') {
                this.createClipPath(target, clipRegion, target.clipRegion);
            }
            if (clipRegion.length || Object.keys(groupData).length) {
                region[0].push(groupData);
            }
            if (target !== this.SVG_INSTANCE) {
                const baseData = {};
                const [transforms] = groupTransforms(target.element, target.transforms, true);
                const groupName = getVectorName(target, 'animate');
                if (($SvgBuild$2.asG(target) || $SvgBuild$2.asUseSymbol(target)) && $util$n.hasValue(target.clipPath) && this.createClipPath(target, clipPath, target.clipPath)) {
                    baseData.groupName = groupName;
                }
                if (this.queueAnimations(target, groupName, item => $SvgBuild$2.asAnimateTransform(item))) {
                    baseData.groupName = groupName;
                }
                if (Object.keys(baseData).length) {
                    path[0].push(baseData);
                }
                if (transforms.length) {
                    const transformed = [];
                    for (const data of transforms) {
                        path[0].push(createTransformData(data));
                        transformed.push(...data);
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
                fillPattern: false
            };
            const setColorPattern = (attr, checkPattern = false) => {
                if (checkPattern) {
                    const pattern = `${attr}Pattern`;
                    const value = result[pattern];
                    if (value) {
                        const gradient = this.SVG_INSTANCE.definitions.gradient.get(value);
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
                                    const gradients = Resource.createBackgroundGradient(this.NODE_INSTANCE, [gradient], path);
                                    if (gradients.length) {
                                        result[attr] = '';
                                        result[pattern] = [{ gradients }];
                                        this.NAMESPACE_AAPT = true;
                                        return;
                                    }
                                    break;
                                }
                            }
                        }
                        result[pattern] = false;
                    }
                }
                const colorName = Resource.addColor(result[attr]);
                if (colorName !== '') {
                    result[attr] = `@color/${colorName}`;
                }
            };
            if ($SvgBuild$2.asUse(target) && $util$n.hasValue(target.clipPath)) {
                this.createClipPath(target, clipElement, target.clipPath);
            }
            if ($util$n.hasValue(path.clipPath)) {
                const shape = new $SvgShape(path.element);
                shape.build({
                    exclude: this.options.transformExclude,
                    residual: partitionTransforms
                });
                shape.synchronize({
                    keyTimeMode: this.SYNCHRONIZE_MODE,
                    precision: this.options.floatPrecisionValue
                });
                this.createClipPath(shape, clipElement, path.clipPath);
            }
            const baseData = {};
            const groupName = getVectorName(target, 'group');
            if (this.queueAnimations(target, groupName, item => $SvgBuild$2.asAnimateTransform(item))) {
                baseData.groupName = groupName;
            }
            else if (clipElement.length) {
                baseData.groupName = '';
            }
            if ($SvgBuild$2.asUse(target) && (target.x !== 0 || target.y !== 0)) {
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
            for (const attr in path) {
                let value = path[attr];
                if ($util$n.isString(value)) {
                    switch (attr) {
                        case 'fillRule':
                            if (value === 'evenodd') {
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
                            value = (($util$n.isNumber(value) ? parseFloat(value) : 1) * opacity).toString();
                            if (value === '1') {
                                continue;
                            }
                            break;
                        case 'strokeLinecap':
                            if (value === 'butt') {
                                continue;
                            }
                            break;
                        case 'strokeLinejoin':
                            if (value === 'miter') {
                                continue;
                            }
                            break;
                        case 'strokeMiterlimit':
                            if (value === '4') {
                                continue;
                            }
                            break;
                    }
                    result[attr] = value;
                }
            }
            setColorPattern('fill', true);
            setColorPattern('stroke');
            const replaceMap = new Map();
            const transformResult = [];
            const replaceResult = [];
            const pathData = path.value;
            let previousPathData = pathData;
            let index = 0;
            for (const item of target.animations) {
                if ($SvgBuild$2.asAnimateTransform(item) && !item.additiveSum && item.transformFrom) {
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
                                const initialValue = $utilS$1.TRANSFORM.typeAsValue(type).split(' ');
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
            if (!this.queueAnimations(target, result.name, item => ($SvgBuild$2.asAnimate(item) || $SvgBuild$2.asSet(item)) && item.attributeName !== 'clip-path', pathData) && replaceResult.length === 0) {
                result.name = '';
            }
            if (transformResult.length) {
                const data = this.ANIMATE_DATA.get(groupName);
                if (data) {
                    data.animate.push(...transformResult);
                }
            }
            if (replaceResult.length) {
                const data = this.ANIMATE_DATA.get(result.name);
                if (data) {
                    data.animate.push(...replaceResult);
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
                            residual: partitionTransforms
                        });
                        g.synchronize({
                            keyTimeMode: this.SYNCHRONIZE_MODE,
                            precision: this.options.floatPrecisionValue
                        });
                        g.each((child) => {
                            if (child.path && child.path.value) {
                                let clipName = getVectorName(child, 'clip_path', array.length > 1 ? index + 1 : -1);
                                if (!this.queueAnimations(child, clipName, item => $SvgBuild$2.asAnimate(item) || $SvgBuild$2.asSet(item), child.path.value)) {
                                    clipName = '';
                                }
                                clipArray.push({ clipName, clipPathData: child.path.value });
                            }
                        });
                    }
                    result++;
                }
                else {
                    let clipName = getVectorName(target, 'clip_path', array.length > 1 ? index + 1 : -1);
                    if (!this.queueAnimations(target, clipName, item => ($SvgBuild$2.asAnimate(item) || $SvgBuild$2.asSet(item)) && item.attributeName === 'clip-path', value)) {
                        clipName = '';
                    }
                    clipArray.push({ clipName, clipPathData: value });
                    result++;
                }
            });
            return result > 0;
        }
        queueAnimations(svg, name, predicate, pathData = '') {
            if (svg.animations.length) {
                const animate = $util$n.filterArray(svg.animations, (item, index, array) => !item.paused && (item.duration > 0 || item.setterType) && predicate(item, index, array));
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
                valueFrom: $util$n.isNumber(valueFrom) ? $math$2.truncateString(valueFrom, this.options.floatPrecisionValue) : valueFrom,
                valueTo: $util$n.isNumber(valueTo) ? $math$2.truncateString(valueTo, this.options.floatPrecisionValue) : valueTo,
                propertyValues: false
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
        targetAPI: 26,
        resolutionDPI: 160,
        supportRTL: true,
        preloadImages: true,
        ellipsisOnTextOverflow: true,
        supportNegativeLeftTop: true,
        floatOverlapDisabled: false,
        collapseUnattributedElements: true,
        customizationsOverwritePrivilege: true,
        showAttributes: true,
        convertPixels: 'dp',
        insertSpaces: 4,
        handleExtensionsAsync: true,
        autoCloseOnWrite: true,
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
                RadioGroup: ScrollView,
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
                        assign[widget] = {};
                    }
                    Object.assign(assign[widget], options);
                }
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
                [EN.LIST]: new List(EN.LIST, framework, ['UL', 'OL', 'DL', 'DIV']),
                [EN.GRID]: new Grid(EN.GRID, framework, ['FORM', 'UL', 'OL', 'DL', 'DIV', 'TABLE', 'NAV', 'SECTION', 'ASIDE', 'MAIN', 'HEADER', 'FOOTER', 'P', 'ARTICLE', 'FIELDSET', 'SPAN']),
                [EN.RELATIVE]: new Relative(EN.RELATIVE, framework),
                [EN.VERTICAL_ALIGN]: new VerticalAlign(EN.VERTICAL_ALIGN, framework),
                [EN.WHITESPACE]: new WhiteSpace(EN.WHITESPACE, framework),
                [EN.ACCESSIBILITY]: new Accessibility(EN.ACCESSIBILITY, framework),
                [EA.CONSTRAINT_GUIDELINE]: new Guideline(EA.CONSTRAINT_GUIDELINE, framework),
                [EA.DELEGATE_FIXED]: new Fixed(EA.DELEGATE_FIXED, framework),
                [EA.DELEGATE_MAXWIDTHHEIGHT]: new MaxWidthHeight(EA.DELEGATE_MAXWIDTHHEIGHT, framework),
                [EA.DELEGATE_PERCENT]: new Percent(EA.DELEGATE_PERCENT, framework),
                [EA.DELEGATE_RADIOGROUP]: new ScrollView(EA.DELEGATE_RADIOGROUP, framework),
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
