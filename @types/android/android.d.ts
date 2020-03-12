import type { FileAsset } from '../base/application';
import type { CustomizationResult, FileOutputOptions, GuidelineOptions, RenderNodeStaticAttribute, ResourceStoredMapAndroid, StyleAttribute, UserSettingsAndroid } from './application';
import type { Constraint, LocalSettingsAndroidUI, RenderSpaceAttribute, SupportAndroid, ViewAttribute, WrapperOptions } from './node';

import LayoutUI = squared.base.LayoutUI;

type View = base.View;

declare namespace base {
    interface Application<T extends View> extends squared.base.ApplicationUI<T> {
        readonly userSettings: UserSettingsAndroid;
        readonly controllerHandler: Controller<T>;
        readonly resourceHandler: Resource<T>;
        readonly fileHandler: File<T>;
    }

    class Application<T extends View> implements Application<T> {}

    interface Controller<T extends View> extends squared.base.ControllerUI<T> {
        readonly application: Application<T>;
        readonly cache: squared.base.NodeList<T>;
        readonly userSettings: UserSettingsAndroid;
        readonly screenDimension: Dimension;
        renderNodeStatic(attrs: RenderNodeStaticAttribute, options?: ViewAttribute): string;
        renderSpace(options: RenderSpaceAttribute): string;
        checkFrameHorizontal(data: LayoutUI<T>): boolean;
        checkConstraintFloat(data: LayoutUI<T>): boolean;
        checkConstraintHorizontal(data: LayoutUI<T>): boolean;
        checkLinearHorizontal(data: LayoutUI<T>): boolean;
        addGuideline(node: T, parent: T, options?: GuidelineOptions): void;
        addBarrier(nodes: T[], barrierDirection: string): string;
        evaluateAnchors(nodes: T[]): void;
        createNodeWrapper(node: T, parent: T, options?: WrapperOptions<T>): T;
    }

    class Controller<T extends View> implements Controller<T> {
        public static setConstraintDimension<T extends View>(node: T, percentWidth?: number): number;
        public static setFlexDimension<T extends View>(node: T, horizontal: boolean): void;
    }

    interface Resource<T extends View> extends squared.base.ResourceUI<T> {
        readonly application: Application<T>;
        readonly cache: squared.base.NodeList<T>;
        readonly userSettings: UserSettingsAndroid;
        addImageSrc(element: HTMLImageElement | string, prefix?: string, imageSet?: ImageSrcSet[]): string;
        addImageSet(images: StringMap, prefix?: string): string;
    }

    class Resource<T extends View> implements Resource<T> {
        public static STORED: ResourceStoredMapAndroid;
        public static formatOptions(options: ViewAttribute, numberAlias?: boolean): ViewAttribute;
        public static formatName(value: string): string;
        public static addTheme(theme: StyleAttribute, path?: string, file?: string): boolean;
        public static addString(value: string, name?: string, numberAlias?: boolean): string;
        public static addImage(images: StringMap, prefix?: string, imageFormat?: string[]): string;
        public static addColor(value: Undef<ColorData | string>, transparency?: boolean): string;
    }

    interface File<T extends View> extends squared.base.FileUI<T> {
        resource: Resource<T>;
        resourceAllToXml(options: FileOutputOptions): {};
        resourceStringToXml(options: FileOutputOptions): string[];
        resourceStringArrayToXml(options: FileOutputOptions): string[];
        resourceFontToXml(options: FileOutputOptions): string[];
        resourceColorToXml(options: FileOutputOptions): string[];
        resourceStyleToXml(options: FileOutputOptions): string[];
        resourceDimenToXml(options: FileOutputOptions): string[];
        resourceDrawableToXml(options: FileOutputOptions): string[];
        resourceDrawableImageToXml(options: FileOutputOptions): string[];
        resourceAnimToXml(options: FileOutputOptions): string[];
        layoutAllToXml(layouts: FileAsset[], options: FileOutputOptions): {};
    }

    class File<T extends View> implements File<T> {}

    interface View extends squared.base.NodeUI {
        tagName: string;
        anchored: boolean;
        api: number;
        localSettings: LocalSettingsAndroidUI;
        readonly layoutWidth: string;
        readonly layoutHeight: string;
        readonly constraint: Constraint;
        readonly documentId: string;
        readonly imageOrSvgElement: boolean;
        readonly layoutFrame: boolean;
        readonly layoutLinear: boolean;
        readonly layoutGrid: boolean;
        readonly layoutRelative: boolean;
        readonly layoutConstraint: boolean;
        readonly anchorTarget: View;
        readonly inlineWidth: boolean;
        readonly inlineHeight: boolean;
        readonly blockWidth: boolean;
        readonly blockHeight: boolean;
        readonly flexibleWidth: boolean;
        readonly flexibleHeight: boolean;
        readonly support: SupportAndroid;
        android(attr: string, value?: string, overwrite?: boolean): string;
        app(attr: string, value?: string, overwrite?: boolean): string;
        applyOptimizations(): void;
        applyCustomizations(overwrite?: boolean): void;
        formatted(value: string, overwrite?: boolean): void;
        mergeGravity(attr: string, alignment: string, overwrite?: boolean): void;
        anchor(position: string, documentId?: string, overwrite?: boolean): boolean;
        anchorChain(direction: PositionAttr): View[];
        anchorParent(orientation: string, bias?: number, style?: string, overwrite?: boolean): boolean;
        anchorStyle(orientation: string, bias: number, style?: string, overwrite?: boolean): void;
        anchorDelete(...position: string[]): void;
        anchorClear(): void;
        supported(obj: string, attr: string, result?: {}): boolean;
        combine(...objs: string[]): string[];
        setLayoutWidth(value: string, overwrite?: boolean): void;
        setLayoutHeight(value: string, overwrite?: boolean): void;
        setSingleLine(ellipsize?: boolean): void;
    }

    class View implements View {
        public static getControlName(containerType: number, api?: number): string;
        public static availablePercent(nodes: View[], dimension: DimensionAttr, boxSize: number): number;
    }

    class ViewGroup<T extends View> extends View {}
}

declare namespace extensions {
    class Accessibility<T extends View> extends squared.base.extensions.Accessibility<T> {}
    class Column<T extends View> extends squared.base.extensions.Column<T> {}
    class CssGrid<T extends View> extends squared.base.extensions.CssGrid<T> {}
    class External<T extends View> extends squared.base.ExtensionUI<T> {}
    class Flexbox<T extends View> extends squared.base.extensions.Flexbox<T> {}
    class Grid<T extends View> extends squared.base.extensions.Grid<T> {}
    class List<T extends View> extends squared.base.extensions.List<T> {}
    class Relative<T extends View> extends squared.base.extensions.Relative<T> {}
    class Sprite<T extends View> extends squared.base.extensions.Sprite<T> {}
    class Substitute<T extends View> extends squared.base.ExtensionUI<T> {}
    class Table<T extends View> extends squared.base.extensions.Table<T> {}
    class VerticalAlign<T extends View> extends squared.base.extensions.VerticalAlign<T> {}
    class WhiteSpace<T extends View> extends squared.base.extensions.WhiteSpace<T> {}

    namespace constraint {
        class Guideline<T extends View> extends squared.base.ExtensionUI<T> {}
    }

    namespace delegate {
        class Background<T extends View> extends squared.base.ExtensionUI<T> {}
        class CssGrid<T extends View> extends squared.base.ExtensionUI<T> {}
        class MaxWidthHeight<T extends View> extends squared.base.ExtensionUI<T> {}
        class NegativeX<T extends View> extends squared.base.ExtensionUI<T> {}
        class Percent<T extends View> extends squared.base.ExtensionUI<T> {}
        class PositiveX<T extends View> extends squared.base.ExtensionUI<T> {}
        class RadioGroup<T extends View> extends squared.base.ExtensionUI<T> {}
        class ScrollBar<T extends View> extends squared.base.ExtensionUI<T> {}
    }

    namespace resource {
        class Background<T extends View> extends squared.base.ExtensionUI<T> {}
        class Dimens<T extends View> extends squared.base.ExtensionUI<T> {}
        class Fonts<T extends View> extends squared.base.ExtensionUI<T> {}
        class Includes<T extends View> extends squared.base.ExtensionUI<T> {}
        class Strings<T extends View> extends squared.base.ExtensionUI<T> {}
        class Styles<T extends View> extends squared.base.ExtensionUI<T> {}
        class Svg<T extends View> extends squared.base.ExtensionUI<T> {}
    }
}

declare namespace lib {
    namespace enumeration {
        const enum BUILD_ANDROID {
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
            LATEST = 29
        }
        const enum DENSITY_ANDROID {
            LDPI = 120,
            MDPI = 160,
            HDPI = 240,
            XHDPI = 320,
            XXHDPI = 480,
            XXXHDPI = 640
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
            WEBVIEW,
            UNKNOWN
        }
    }

    namespace constant {
        const EXT_ANDROID: {
            EXTERNAL: string;
            SUBSTITUTE: string;
            DELEGATE_BACKGROUND: string;
            DELEGATE_FIXED: string;
            DELEGATE_MAXWIDTHHEIGHT: string;
            DELEGATE_NEGATIVEVIEWPORT: string;
            DELEGATE_NEGATIVEX: string;
            DELEGATE_PERCENT: string;
            DELEGATE_RADIOGROUP: string;
            DELEGATE_SCROLLBAR: string;
            DELEGATE_VERTICALALIGN: string;
            CONSTRAINT_GUIDELINE: string;
            RESOURCE_INCLUDES: string;
            RESOURCE_BACKGROUND: string;
            RESOURCE_SVG: string;
            RESOURCE_STRINGS: string;
            RESOURCE_FONTS: string;
            RESOURCE_DIMENS: string;
            RESOURCE_STYLES: string;
        };
        const CONTAINER_ANDROID: {
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
            RADIOGROUP: string;
            HORIZONTAL_SCROLL: string;
            VERTICAL_SCROLL: string;
            CONSTRAINT: string;
            GUIDELINE: string;
            BARRIER: string;
        };
        const CONTAINER_ANDROID_X: {
            VERTICAL_SCROLL: string;
            CONSTRAINT: string;
            GUIDELINE: string;
            BARRIER: string;
        };
        const SUPPORT_ANDROID: {
            DRAWER: string;
            NAVIGATION_VIEW: string;
            COORDINATOR: string;
            APPBAR: string;
            COLLAPSING_TOOLBAR: string;
            TOOLBAR: string;
            FLOATING_ACTION_BUTTON: string;
            BOTTOM_NAVIGATION: string;
        };
        const SUPPORT_ANDROID_X: {
            DRAWER: string;
            NAVIGATION_VIEW: string;
            COORDINATOR: string;
            APPBAR: string;
            COLLAPSING_TOOLBAR: string;
            TOOLBAR: string;
            FLOATING_ACTION_BUTTON: string;
            BOTTOM_NAVIGATION: string;
        };
        const ELEMENT_ANDROID: {
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
        const LAYOUT_ANDROID: {
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
        const XMLNS_ANDROID: {
            android: string;
            app: string;
            aapt: string;
            tools: string;
        };
        const STRING_ANDROID: {
            MARGIN: string;
            MARGIN_VERTICAL: string;
            MARGIN_HORIZONTAL: string;
            MARGIN_TOP: string;
            MARGIN_RIGHT: string;
            MARGIN_BOTTOM: string;
            MARGIN_LEFT: string;
            PADDING: string;
            PADDING_VERTICAL: string;
            PADDING_HORIZONTAL: string;
            PADDING_TOP: string;
            PADDING_RIGHT: string;
            PADDING_BOTTOM: string;
            PADDING_LEFT: string;
            CENTER_HORIZONTAL: string;
            CENTER_VERTICAL: string;
        };
        const LOCALIZE_ANDROID: {
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
        const RESERVED_JAVA: string[];
    }

    namespace customizations {
        interface Customizations {
            [index: number]: CustomizationsData;
        }
        interface CustomizationsData {
            android: ObjectMap<boolean | CustomizationResult>;
            assign: {
                [namespace: string]: ObjectMap<StringMap>;
            };
        }
        interface Deprecations {
            android: ObjectMap<CustomizationResult>;
        }

        const API_ANDROID: Customizations;

        function getValue(api: number, tagName: string, obj: string, attr: string): string;
    }

    namespace util {
        function convertLength(value: string | number, font?: boolean, precision?: number): string;
        function getDocumentId(value: string): string;
        function isHorizontalAlign(value: string): boolean;
        function isVerticalAlign(value: string): boolean;
        function getHorizontalBias(node: View): number;
        function getVerticalBias(node: View): number;
        function isGridJustified(node: View): boolean;
        function isGridAligned(node: View): boolean;
        function createViewAttribute(data?: StandardMap, options?: ViewAttribute): ViewAttribute;
        function createStyleAttribute(data?: StandardMap): Required<StyleAttribute>;
        function getDataSet(dataset: StringMap | DOMStringMap, prefix: string): StringMap;
        function localizeString(value: string, rtl: boolean, api: number): string;
        function getXmlNs(value: string): string;
        function getRootNs(value: string): string;
    }
}

export as namespace android;