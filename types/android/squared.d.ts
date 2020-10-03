import * as squared from '../squared';

import LayoutUI = squared.base.LayoutUI;

declare interface AppFramework<T extends base.View> extends squared.base.AppFramework<T> {
    setViewModel(data?: PlainObject, sessionId?: string): void;
    addXmlNs(name: string, uri: string): void;
    customize(build: number, widget: string, options: ObjectMap<StringMap>): Undef<ObjectMap<StringMap>>;
}

declare namespace base {
    const enum EXT_ANDROID {
        EXTERNAL = 'android.external',
        SUBSTITUTE = 'android.substitute',
        DELEGATE_BACKGROUND = 'android.delegate.background',
        DELEGATE_MAXWIDTHHEIGHT = 'android.delegate.max-width-height',
        DELEGATE_MULTILINE = 'android.delegate.multiline',
        DELEGATE_NEGATIVEX = 'android.delegate.negative-x',
        DELEGATE_PERCENT = 'android.delegate.percent',
        DELEGATE_POSITIVEX = 'android.delegate.positive-x',
        DELEGATE_RADIOGROUP = 'android.delegate.radiogroup',
        DELEGATE_SCROLLBAR = 'android.delegate.scrollbar',
        DELEGATE_VERTICALALIGN = 'android.delegate.verticalalign',
        RESOURCE_INCLUDES = 'android.resource.includes',
        RESOURCE_BACKGROUND = 'android.resource.background',
        RESOURCE_SVG = 'android.resource.svg',
        RESOURCE_STRINGS = 'android.resource.strings',
        RESOURCE_FONTS = 'android.resource.fonts',
        RESOURCE_DIMENS = 'android.resource.dimens',
        RESOURCE_DATA = 'android.resource.data',
        RESOURCE_STYLES = 'android.resource.styles'
    }
    const enum LAYOUT_STRING {
        MARGIN = 'layout_margin',
        MARGIN_VERTICAL = 'layout_marginVertical',
        MARGIN_HORIZONTAL = 'layout_marginHorizontal',
        MARGIN_TOP = 'layout_marginTop',
        MARGIN_RIGHT = 'layout_marginRight',
        MARGIN_BOTTOM = 'layout_marginBottom',
        MARGIN_LEFT = 'layout_marginLeft',
        PADDING = 'padding',
        PADDING_VERTICAL = 'paddingVertical',
        PADDING_HORIZONTAL = 'paddingHorizontal',
        PADDING_TOP = 'paddingTop',
        PADDING_RIGHT = 'paddingRight',
        PADDING_BOTTOM = 'paddingBottom',
        PADDING_LEFT = 'paddingLeft'
    }

    interface AppViewModel extends PlainObject {
        import?: string[];
        variable?: { name: string; type: string }[];
    }

    class Application<T extends View> extends squared.base.ApplicationUI<T> {
        readonly userSettings: UserResourceSettingsUI;
        setViewModel(data: AppViewModel, sessionId?: string): void;
        getViewModel(sessionId: string): Undef<AppViewModel>;
        resolveTarget(sessionId: string, target: Null<HTMLElement | string>): Null<T>;
        get viewModel(): Map<string, AppViewModel>;
    }

    class Controller<T extends View> extends squared.base.ControllerUI<T> {
        readonly application: Application<T>;
        renderNodeStatic(attrs: RenderNodeStaticAttribute, options?: ViewAttribute): string;
        renderSpace(attrs: RenderSpaceAttribute): string;
        checkFrameHorizontal(data: LayoutUI<T>): boolean;
        checkConstraintFloat(data: LayoutUI<T>): boolean;
        checkConstraintHorizontal(data: LayoutUI<T>): boolean;
        checkLinearHorizontal(data: LayoutUI<T>): boolean;
        addGuideline(options: GuidelineOptions<T>): void;
        addBarrier(nodes: T[], barrierDirection: string): string;
        evaluateAnchors(nodes: T[]): void;
        createNodeWrapper(node: T, parent: T, options?: CreateNodeWrapperUIOptions<T>): T;
        get userSettings(): UserResourceSettingsUI;
        get screenDimension(): Dimension;
    }

    class Resource<T extends View> extends squared.base.ResourceUI<T> {
        static STORED: ResourceStoredMap;
        static formatOptions(options: ViewAttribute, numberAlias?: boolean): ViewAttribute;
        static formatName(value: string): string;
        static addTheme(theme: ThemeAttribute): boolean;
        static addString(value: string, name?: string, numberAlias?: boolean): string;
        static addImage(images: StringMap, prefix?: string, imageFormat?: MIMEOrAll): string;
        static addColor(value: ColorData | string, transparency?: boolean): string;
        readonly application: Application<T>;
        addImageSrc(element: HTMLImageElement | string, prefix?: string, imageSet?: ImageSrcSet[]): string;
        addImageSet(images: StringMap, prefix?: string): string;
        get userSettings(): UserResourceSettingsUI;
    }

    class File<T extends View> extends squared.base.File<T> {
        resource: Resource<T>;
        resourceAllToXml(options?: FileUniversalOptions): PlainObject;
        resourceStringToXml(options?: FileUniversalOptions): string[];
        resourceStringArrayToXml(options?: FileUniversalOptions): string[];
        resourceFontToXml(options?: FileUniversalOptions): string[];
        resourceColorToXml(options?: FileUniversalOptions): string[];
        resourceStyleToXml(options?: FileUniversalOptions): string[];
        resourceDimenToXml(options?: FileUniversalOptions): string[];
        resourceDrawableToXml(options?: FileUniversalOptions): string[];
        resourceAnimToXml(options?: FileUniversalOptions): string[];
        resourceDrawableImageToString(options?: FileUniversalOptions): string[];
        resourceRawVideoToString(options?: FileUniversalOptions): string[];
        resourceRawAudioToString(options?: FileUniversalOptions): string[];
        layoutAllToXml(layouts: FileAsset[], options?: FileUniversalOptions): PlainObject;
        get userSettings(): UserResourceSettingsUI;
        get directory(): { string: string; image: string; video: string; audio: string; font: string };
    }

    class View extends squared.base.NodeUI {
        static availablePercent<T extends View>(nodes: T[], dimension: DimensionAttr, boxSize: number): number;
        static getControlName(containerType: number, api?: number): string;
        api: number;
        alignedWithX?: View;
        alignedWithY?: View;
        android(attr: string, value?: string, overwrite?: boolean): string;
        app(attr: string, value?: string, overwrite?: boolean): string;
        clone(id: number, options?: CloneOptions): View;
        applyOptimizations(): boolean;
        applyCustomizations(overwrite?: boolean): void;
        formatted(value: string, overwrite?: boolean): void;
        mergeGravity(attr: string, alignment: string, overwrite?: boolean): void;
        anchor(position: AnchorPositionAttr, documentId?: string, overwrite?: boolean): boolean;
        anchorChain(direction: PositionAttr): View[];
        anchorParent(orientation: OrientationAttr, bias?: number, style?: string, overwrite?: boolean): boolean;
        anchorStyle(orientation: OrientationAttr, bias: number, style?: string, overwrite?: boolean): void;
        anchorDelete(...position: AnchorPositionAttr[]): void;
        anchorClear(update?: View | true): void;
        supported(attr: string, value: string, result: PlainObject): boolean;
        combine(...objs: string[]): string[];
        setLayoutWidth(value: string, overwrite?: boolean): void;
        setLayoutHeight(value: string, overwrite?: boolean): void;
        setSingleLine(maxLines: boolean, ellipsize?: boolean): void;
        setConstraintDimension(percentWidth?: number): number;
        setFlexDimension(dimension: DimensionAttr, percentWidth?: number): number;
        getMatchConstraint(parent?: View): string;
        getAnchorPosition(parent: View, horizontal: boolean, modifyAnchor?: boolean): Partial<BoxRect>;
        isUnstyled(checkMargin?: boolean): boolean;
        getHorizontalBias(rect?: BoxRect): number;
        getVerticalBias(rect?: BoxRect): number;
        adjustAbsolutePaddingOffset(direction: number, value: number): number;
        hasFlex(direction: FlowDirectionAttr): boolean;
        valueAt(attr: string): string;
        set anchored(value);
        get anchored(): boolean;
        set localSettings(value);
        get localSettings(): LocalSettingsUI;
        get documentId(): string;
        get anchorTarget(): View;
        get constraint(): Constraint;
        get layoutFrame(): boolean;
        get layoutLinear(): boolean;
        get layoutGrid(): boolean;
        get layoutRelative(): boolean;
        get layoutConstraint(): boolean;
        get layoutWidth(): string;
        get layoutHeight(): string;
        get inlineWidth(): boolean;
        get inlineHeight(): boolean;
        get blockWidth(): boolean;
        get blockHeight(): boolean;
        get flexibleWidth(): boolean;
        get flexibleHeight(): boolean;
        get target(): Null<HTMLElement>;
        get support(): SupportUI;
    }

    class ViewGroup extends View {
        retainAs(children: View[], node?: View, parent?: View): this;
        constructor(id: number, node: View, children: View[], parent?: View);
    }
}

declare namespace extensions {
    class Accessibility<T extends base.View> extends squared.base.extensions.Accessibility<T> {}
    class Column<T extends base.View> extends squared.base.extensions.Column<T> {}
    class CssGrid<T extends base.View> extends squared.base.extensions.CssGrid<T> {}
    class External<T extends base.View> extends squared.base.ExtensionUI<T> {}
    class Flexbox<T extends base.View> extends squared.base.extensions.Flexbox<T> {}
    class Grid<T extends base.View> extends squared.base.extensions.Grid<T> {}
    class List<T extends base.View> extends squared.base.extensions.List<T> {}
    class Relative<T extends base.View> extends squared.base.extensions.Relative<T> {}
    class Sprite<T extends base.View> extends squared.base.extensions.Sprite<T> {}
    class Substitute<T extends base.View> extends squared.base.ExtensionUI<T> {}
    class Table<T extends base.View> extends squared.base.extensions.Table<T> {}
    class WhiteSpace<T extends base.View> extends squared.base.extensions.WhiteSpace<T> {}

    namespace delegate {
        class Background<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class MaxWidthHeight<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class Multiline<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class NegativeX<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class Percent<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class PositiveX<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class RadioGroup<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class ScrollBar<T extends base.View> extends squared.base.ExtensionUI<T> {}
    }

    namespace resource {
        class Background<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class Data<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class Dimens<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class Fonts<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class Includes<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class Strings<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class Styles<T extends base.View> extends squared.base.ExtensionUI<T> {}
        class Svg<T extends base.View> extends squared.base.ExtensionUI<T> {}
    }
}

declare namespace lib {
    namespace constant {
        const enum BUILD_VERSION {
            R = 30,
            Q = 29,
            PIE = 28,
            OREO_1 = 27,
            OREO = 26,
            NOUGAT_1 = 25,
            NOUGAT = 24,
            MARSHMALLOW = 23,
            LOLLIPOP_1 = 22,
            LOLLIPOP = 21,
            KITKAT_1 = 20,
            KITKAT = 19,
            JELLYBEAN_2 = 18,
            JELLYBEAN_1 = 17,
            JELLYBEAN = 16,
            ICE_CREAM_SANDWICH_1 = 15,
            ICE_CREAM_SANDWICH = 14,
            ALL = 0,
            LATEST = 30
        }
        enum CONTAINER_NODE {
            EDIT = 1,
            RANGE,
            RADIO,
            CHECKBOX,
            SELECT,
            TEXT,
            SVG,
            IMAGE,
            BUTTON,
            PROGRESS,
            INLINE,
            LINE,
            SPACE,
            BLOCK,
            FRAME,
            LINEAR,
            GRID,
            RELATIVE,
            CONSTRAINT,
            VIDEOVIEW,
            WEBVIEW,
            UNKNOWN
        }
        const SCREEN_DENSITY: {
            LDPI: number;
            MDPI: number;
            HDPI: number;
            XHDPI: number;
            XXHDPI: number;
            XXXHDPI: number;
        };
        const CONTAINER_ELEMENT: {
            PLAINTEXT: string;
            HR: string;
            SVG: string;
            IMG: string;
            BUTTON: string;
            SELECT: string;
            TEXTAREA: string;
            METER: string;
            PROGRESS: string;
            IFRAME: string;
            INPUT_RANGE: string;
            INPUT_TEXT: string;
            INPUT_PASSWORD: string;
            INPUT_NUMBER: string;
            INPUT_EMAIL: string;
            INPUT_SEARCH: string;
            INPUT_URL: string;
            INPUT_DATE: string;
            INPUT_TEL: string;
            INPUT_TIME: string;
            INPUT_WEEK: string;
            INPUT_MONTH: string;
            INPUT_BUTTON: string;
            INPUT_FILE: string;
            INPUT_IMAGE: string;
            INPUT_SUBMIT: string;
            INPUT_RESET: string;
            INPUT_CHECKBOX: string;
            INPUT_RADIO: string;
            'INPUT_DATETIME-LOCAL': string;
        };
        const CONTAINER_TAGNAME: {
            CHECKBOX: string;
            RADIO: string;
            EDIT: string;
            EDIT_LIST: string;
            SELECT: string;
            RANGE: string;
            SVG: string;
            TEXT: string;
            IMAGE: string;
            BUTTON: string;
            METER: string;
            PROGRESS: string;
            LINE: string;
            SPACE: string;
            FRAME: string;
            LINEAR: string;
            GRID: string;
            RELATIVE: string;
            WEBVIEW: string;
            VIDEOVIEW: string;
            RADIOGROUP: string;
            HORIZONTAL_SCROLL: string;
            VERTICAL_SCROLL: string;
            CONSTRAINT: string;
            GUIDELINE: string;
            BARRIER: string;
        };
        const CONTAINER_TAGNAME_X: {
            VERTICAL_SCROLL: string;
            CONSTRAINT: string;
            GUIDELINE: string;
            BARRIER: string;
        };
        const SUPPORT_TAGNAME: {
            DRAWER: string;
            NAVIGATION_VIEW: string;
            COORDINATOR: string;
            APPBAR: string;
            COLLAPSING_TOOLBAR: string;
            TOOLBAR: string;
            FLOATING_ACTION_BUTTON: string;
            BOTTOM_NAVIGATION: string;
        };
        const SUPPORT_TAGNAME_X: {
            DRAWER: string;
            NAVIGATION_VIEW: string;
            COORDINATOR: string;
            APPBAR: string;
            COLLAPSING_TOOLBAR: string;
            TOOLBAR: string;
            FLOATING_ACTION_BUTTON: string;
            BOTTOM_NAVIGATION: string;
        };
        const LAYOUT_MAP: {
            relativeParent: {
                left: string;
                top: string;
                right: string;
                bottom: string;
                centerHorizontal: string;
                centerVertical: string;
            };
            relative: {
                left: string;
                top: string;
                right: string;
                bottom: string;
                baseline: string;
                leftRight: string;
                rightLeft: string;
                topBottom: string;
                bottomTop: string;
            };
            constraint: {
                left: string;
                top: string;
                right: string;
                bottom: string;
                leftRight: string;
                rightLeft: string;
                baseline: string;
                topBottom: string;
                bottomTop: string;
            };
        };
        const LOCALIZE_MAP: {
            left: string;
            right: string;
            paddingLeft: string;
            paddingRight: string;
            layout_marginLeft: string;
            layout_marginRight: string;
            layout_alignParentLeft: string;
            layout_alignParentRight: string;
            layout_alignLeft: string;
            layout_alignRight: string;
            layout_toRightOf: string;
            layout_toLeftOf: string;
            layout_constraintLeft_toLeftOf: string;
            layout_constraintRight_toRightOf: string;
            layout_constraintLeft_toRightOf: string;
            layout_constraintRight_toLeftOf: string;
        };
        const XML_NAMESPACE: {
            android: string;
            app: string;
            aapt: string;
        };
        const RESERVED_JAVA: Set<string>;
    }

    namespace customizations {
        const API_VERSION: Customizations<base.View>;
        function getValue(api: number, tagName: string, obj: string, attr: string): string;
    }

    namespace util {
        function applyTemplate(tagName: string, template: StandardMap, children: StandardMap[], depth?: number): string;
        function getDocumentId(value: string): string;
        function isHorizontalAlign(value: string): boolean;
        function isVerticalAlign(value: string): boolean;
        function createViewAttribute(data?: PlainObject): ViewAttribute;
        function createThemeAttribute(data?: PlainObject): Required<ThemeAttribute>;
        function getDataSet(dataset: StringMap | DOMStringMap, prefix: string): Undef<StringMap>;
        function localizeString(value: string, rtl: boolean, api: number): string;
        function concatString(list: (string | number)[], char?: string): string;
        function formatString(value: string, ...params: string[]): string;
        function replaceCharacterData(value: string, tab?: number): string;
        function replaceTab(value: string, spaces?: number, preserve?: boolean): string;
        function getXmlNs(value: string): string;
        function getRootNs(value: string): string;
    }
}

export as namespace android;