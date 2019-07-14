import { FileAsset } from '../base/application';
import { ResourceStoredMapAndroid, StyleAttribute, UserSettingsAndroid } from './application';
import { Constraint, LocalSettings, SupportAndroid, ViewAttribute } from './node';
import { FileOutputOptions } from './resource';

import * as $const from '../../android-framework/src/lib/constant';
import * as $custom from '../../android-framework/src/lib/customization';
import * as $enum from '../../android-framework/src/lib/enumeration';

type View = base.View;

declare namespace base {
    interface Application<T extends View> extends squared.base.ApplicationUI<T> {
        readonly userSettings: UserSettingsAndroid;
    }

    class Application<T extends View> implements Application<T> {}

    interface Controller<T extends View> extends squared.base.ControllerUI<T> {
        application: Application<T>;
        readonly userSettings: UserSettingsAndroid;
        checkFrameHorizontal(data: squared.base.LayoutUI<T>): boolean;
        checkConstraintFloat(data: squared.base.LayoutUI<T>, horizontal?: boolean): boolean;
        checkConstraintHorizontal(data: squared.base.LayoutUI<T>): boolean;
        checkLinearHorizontal(data: squared.base.LayoutUI<T>): boolean;
        addGuideline(node: T, parent: T, orientation?: string, percent?: boolean, opposite?: boolean): void;
        addBarrier(nodes: T[], barrierDirection: string): string | undefined;
        evaluateAnchors(nodes: T[]): void;
        renderSpace(width: string, height?: string, columnSpan?: number, rowSpan?: number, options?: ViewAttribute): string;
        createNodeWrapper(node: T, parent: T, children?: T[], controlName?: string, containerType?: number): T;
    }

    class Controller<T extends View> implements Controller<T> {
        public static setConstraintDimension<T extends View>(node: T): void;
        public static setFlexDimension<T extends View>(node: T, horizontal: boolean): void;
    }

    interface Resource<T extends View> extends squared.base.ResourceUI<T> {
        application: Application<T>;
        readonly userSettings: UserSettingsAndroid;
        addImageSrc(element: HTMLImageElement | string, prefix?: string, imageSet?: ImageSrcSet[]): string;
    }

    class Resource<T extends View> implements Resource<T> {
        public static STORED: ResourceStoredMapAndroid;
        public static formatOptions(options: ExternalData, numberAlias?: boolean): ExternalData;
        public static formatName(value: string): string;
        public static addTheme(...options: StyleAttribute[]): void;
        public static addString(value: string, name?: string, numberAlias?: boolean): string;
        public static addImage(images: StringMap, prefix?: string): string;
        public static addColor(value: ColorData | string | undefined, transparency?: boolean): string;
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
        layoutAllToXml(options: FileOutputOptions): {};
    }

    class File<T extends View> implements File<T> {}

    interface View extends squared.base.NodeUI {
        tagName: string;
        anchored: boolean;
        localSettings: LocalSettings;
        readonly layoutWidth: string;
        readonly layoutHeight: string;
        readonly constraint: Constraint;
        readonly documentId: string;
        readonly imageOrSvgElement: boolean;
        readonly layoutFrame: boolean;
        readonly layoutLinear: boolean;
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
        anchorParent(orientation: string, style?: string, bias?: number, overwrite?: boolean): boolean;
        anchorStyle(orientation: string, value?: string, bias?: number, overwrite?: boolean): void;
        anchorDelete(...position: string[]): void;
        anchorClear(): void;
        supported(obj: string, attr: string, result?: {}): boolean;
        combine(...objs: string[]): string[];
        setLayoutWidth(value: string, overwrite?: boolean): void;
        setLayoutHeight(value: string, overwrite?: boolean): void;
    }

    class View implements View {
        public static getControlName(containerType: number): string;
        constructor(id: number, sessionId?: string, element?: Element, afterInit?: BindGeneric<View, void>);
    }

    class ViewGroup<T extends View> extends View {}
}

declare namespace extensions {
    class Accessibility<T extends View> extends squared.base.extensions.Accessibility<T> {}
    class CssGrid<T extends View> extends squared.base.extensions.CssGrid<T> {}
    class External<T extends View> extends squared.base.extensions.External<T> {}
    class Flexbox<T extends View> extends squared.base.extensions.Flexbox<T> {}
    class Grid<T extends View> extends squared.base.extensions.Grid<T> {}
    class List<T extends View> extends squared.base.extensions.List<T> {}
    class Relative<T extends View> extends squared.base.extensions.Relative<T> {}
    class Sprite<T extends View> extends squared.base.extensions.Sprite<T> {}
    class Substitute<T extends View> extends squared.base.extensions.Substitute<T> {}
    class Table<T extends View> extends squared.base.extensions.Table<T> {}
    class VerticalAlign<T extends View> extends squared.base.extensions.VerticalAlign<T> {}
    class WhiteSpace<T extends View> extends squared.base.extensions.WhiteSpace<T> {}

    namespace constraint {
        class Guideline<T extends View> extends squared.base.ExtensionUI<T> {}
    }

    namespace delegate {
        class Background<T extends View> extends squared.base.ExtensionUI<T> {}
        class Fixed<T extends View> extends squared.base.ExtensionUI<T> {}
        class MaxWidthHeight<T extends View> extends squared.base.ExtensionUI<T> {}
        class NegativeViewport<T extends View> extends squared.base.ExtensionUI<T> {}
        class NegativeX<T extends View> extends squared.base.ExtensionUI<T> {}
        class Percent<T extends View> extends squared.base.ExtensionUI<T> {}
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
        export import BUILD_ANDROID = $enum.BUILD_ANDROID;
        export import DENSITY_ANDROID = $enum.DENSITY_ANDROID;
        export import CONTAINER_NODE = $enum.CONTAINER_NODE;
    }

    namespace constant {
        export import EXT_ANDROID = $const.EXT_ANDROID;
        export import CONTAINER_ANDROID = $const.CONTAINER_ANDROID;
        export import SUPPORT_ANDROID = $const.SUPPORT_ANDROID;
        export import ELEMENT_ANDROID = $const.ELEMENT_ANDROID;
        export import STRING_ANDROID = $const.STRING_ANDROID;
        export import LAYOUT_ANDROID = $const.LAYOUT_ANDROID;
        export import XMLNS_ANDROID = $const.XMLNS_ANDROID;
        export import RESERVED_JAVA = $const.RESERVED_JAVA;
    }

    namespace customizations {
        export import API_ANDROID = $custom.API_ANDROID;
        export import DEPRECATED_ANDROID = $custom.DEPRECATED_ANDROID;
        function getValue(api: number, tagName: string, obj: string, attr: string): string;
    }

    namespace util {
        function getDocumentId(value: string): string;
        function getHorizontalBias(node: View): number;
        function getVerticalBias(node: View): number;
        function createViewAttribute(options?: ExternalData, android?: ExternalData, app?: ExternalData): ViewAttribute;
        function createStyleAttribute(options?: ExternalData): Required<StyleAttribute>;
        function localizeString(value: string, rtl: boolean, api: number): string;
        function getXmlNs(value: string): string;
        function getRootNs(value: string): string;
    }
}

export as namespace android;