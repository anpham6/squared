import { AppHandler, AppProcessing, AppSession, AppSessionUI, ControllerSettings, ControllerUISettings, ExtensionDependency, ExtensionResult, FileAsset, ImageAsset, LayoutResult, LayoutType, NodeTemplate, RawAsset, ResourceAssetMap, ResourceStoredMap, UserSettings, UserUISettings } from './base/application';
import { GridCellData } from './base/extension';
import { AutoMargin, InitialData, LinearData, SiblingOptions, Support, VisibleStyle } from './base/node';

import { SvgAnimationAttribute, SvgAnimationGroup, SvgAspectRatio, SvgBuildOptions, SvgOffsetPath, SvgPathCommand, SvgPathExtendData, SvgPoint, SvgRect, SvgSynchronizeOptions, SvgStrokeDash, SvgTransform } from './svg/object';

import * as $const from '../src/base/lib/constant';
import * as $enum from '../src/base/lib/enumeration';

import * as $client from '../src/lib/client';
import * as $css from '../src/lib/css';
import * as $dom from '../src/lib/dom';
import * as $regex from '../src/lib/regex';
import * as $xml from '../src/lib/xml';

import * as $svg_const from '../src/svg/lib/constant';
import * as $svg_util from '../src/svg/lib/util';

type ExtensionRequest = base.Extension<base.Node> | string;

declare class PromiseResult {
    public then(resolve: () => void): void;
}

declare const settings: UserSettings;
declare const system: FunctionMap<any>;
declare function setFramework(value: {}, cached?: boolean): void;
declare function parseDocument(...elements: (string | HTMLElement)[]): PromiseResult;
declare function include(value: ExtensionRequest, options?: {}): boolean;
declare function includeAsync(value: ExtensionRequest | string, options?: {}): boolean;
declare function exclude(value: ExtensionRequest | string): boolean;
declare function configure(value: ExtensionRequest | string, options: {}): boolean;
declare function retrieve(value: string): {} | null;
declare function ready(): boolean;
declare function close(): void;
declare function reset(): void;
declare function copyToDisk(value: string, callback?: CallbackResult): void;
declare function appendToArchive(value: string): void;
declare function saveToArchive(value?: string): void;
declare function toString(): string;

declare function apply(value: {} | string, options: {}): boolean;
declare function saveAllToDisk(): void;

declare namespace base {
    interface Application<T extends Node> {
        framework: number;
        controllerHandler: Controller<T>;
        resourceHandler: Resource<T>;
        extensionManager: ExtensionManager<T>;
        userSettings: UserSettings;
        initializing: boolean;
        closed: boolean;
        readonly session: AppSession<T>;
        readonly processing: AppProcessing<T>;
        readonly builtInExtensions: ObjectMap<Extension<T>>;
        readonly extensions: Extension<T>[];
        readonly nextId: number;
        readonly length: number;
        reset(): void;
        parseDocument(...elements: (string | HTMLElement)[]): PromiseResult;
        createCache(documentRoot: HTMLElement): boolean;
        createNode(element?: Element, append?: boolean, parent?: T, children?: T[]): T;
        insertNode(element: Element, parent?: T): T | undefined;
        afterCreateCache(element: HTMLElement): void;
        finalize(): void;
        copyToDisk(directory: string, callback?: CallbackResult, assets?: FileAsset[]): void;
        appendToArchive(pathname: string, assets?: FileAsset[]): void;
        saveToArchive(filename?: string, assets?: FileAsset[]): void;
        toString(): string;
    }

    class Application<T extends Node> implements Application<T> {
        constructor(
            framework: number,
            nodeConstructor: Constructor<T>,
            ControllerConstructor: Constructor<Controller<T>>,
            ResourceConstructor: Constructor<Resource<T>>,
            ExtensionManagerConstructor: Constructor<ExtensionManager<T>>
        );
    }

    interface ApplicationUI<T extends NodeUI> extends Application<T> {
        controllerHandler: ControllerUI<T>;
        resourceHandler: ResourceUI<T>;
        userSettings: UserUISettings;
        readonly session: AppSessionUI<T>;
        readonly builtInExtensions: ObjectMap<ExtensionUI<T>>;
        readonly extensions: ExtensionUI<T>[];
        readonly rootElements: Set<Element>;
        readonly layouts: FileAsset[];
        conditionElement(element: HTMLElement): boolean;
        renderNode(layout: LayoutUI<T>): NodeTemplate<T> | undefined;
        resolveTarget(target: string): T | undefined;
        addLayout(layout: LayoutUI<T>): void;
        addLayoutTemplate(parent: T, node: T, template: NodeTemplate<T> | undefined, index?: number): void;
        saveDocument(filename: string, content: string, pathname?: string, index?: number): void;
    }

    class ApplicationUI<T extends NodeUI> implements ApplicationUI<T> {
        constructor(
            framework: number,
            nodeConstructor: Constructor<T>,
            ControllerConstructor: Constructor<ControllerUI<T>>,
            ResourceConstructor: Constructor<ResourceUI<T>>,
            ExtensionManagerConstructor: Constructor<ExtensionManager<T>>
        );
    }

    interface Controller<T extends Node> extends AppHandler<T> {
        application: Application<T>;
        cache: NodeList<T>;
        sessionId: string;
        readonly userSettings: UserSettings;
        readonly localSettings: ControllerSettings;
        readonly generateSessionId: string;
        readonly afterInsertNode?: BindGeneric<Node, void>;
        init(): void;
        reset(): void;
        includeElement(element: Element): boolean;
        preventNodeCascade(element: Element): boolean;
        applyDefaultStyles(element: Element): void;
    }

    class Controller<T extends Node> implements Controller<T> {}

    interface ControllerUI<T extends NodeUI> extends Controller<T> {
        readonly userSettings: UserUISettings;
        readonly localSettings: ControllerUISettings;
        readonly containerTypeHorizontal: LayoutType;
        readonly containerTypeVertical: LayoutType;
        readonly containerTypeVerticalMargin: LayoutType;
        readonly containerTypePercent: LayoutType;
        optimize(nodes: T[]): void;
        finalize(layouts: FileAsset[]): void;
        evaluateNonStatic(documentRoot: T, cache: NodeList<T>): void;
        visibleElement(element: Element, target?: string): boolean;
        processUnknownParent(layout: LayoutUI<T>): LayoutResult<T>;
        processUnknownChild(layout: LayoutUI<T>): LayoutResult<T>;
        processTraverseHorizontal(layout: LayoutUI<T>, siblings: T[]): LayoutUI<T>;
        processTraverseVertical(layout: LayoutUI<T>, siblings: T[]): LayoutUI<T>;
        processLayoutHorizontal(layout: LayoutUI<T>): LayoutUI<T>;
        setConstraints(): void;
        renderNode(layout: LayoutUI<T>): NodeTemplate<T> | undefined;
        renderNodeGroup(layout: LayoutUI<T>): NodeTemplate<T> | undefined;
        renderNodeStatic(controlName: string, options?: ExternalData, width?: string, height?: string, content?: string): string;
        createNodeGroup(node: T, children: T[], parent?: T, traverse?: boolean): T;
        sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
        addBeforeOutsideTemplate(id: number, value: string, format?: boolean, index?: number): void;
        addBeforeInsideTemplate(id: number, value: string, format?: boolean, index?: number): void;
        addAfterInsideTemplate(id: number, value: string, format?: boolean, index?: number): void;
        addAfterOutsideTemplate(id: number, value: string, format?: boolean, index?: number): void;
        getBeforeOutsideTemplate(id: number, depth: number): string;
        getBeforeInsideTemplate(id: number, depth: number): string;
        getAfterInsideTemplate(id: number, depth: number): string;
        getAfterOutsideTemplate(id: number, depth: number): string;
        hasAppendProcessing(id?: number): boolean;
        cascadeDocument(templates: NodeTemplate<T>[], depth: number): string;
        getEnclosingXmlTag(controlName: string, attributes?: string, content?: string): string;
    }

    class ControllerUI<T extends NodeUI> implements Controller<T> {}

    interface Resource<T extends Node> extends AppHandler<T> {
        application: Application<T>;
        cache: NodeList<T>;
        fileHandler?: File<T>;
        readonly userSettings: UserSettings;
        controllerSettings: ControllerSettings;
        reset(): void;
        addImage(element: HTMLImageElement | undefined): void;
        getImage(src: string): ImageAsset | undefined;
        addFont(data: squared.lib.css.CSSFontFaceData): void;
        getFont(fontFamily: string, fontStyle?: string, fontWeight?: string): squared.lib.css.CSSFontFaceData | undefined;
        addRawData(dataURI: string, mimeType: string, encoding: string, content: string): string;
        getRawData(dataURI: string): RawAsset | undefined;
        setFileHandler(instance: File<T>): void;
    }

    class Resource<T extends Node> implements Resource<T> {
        public static ASSETS: ResourceAssetMap;
    }

    interface ResourceUI<T extends NodeUI> extends Resource<T> {
        readonly userSettings: UserUISettings;
        controllerSettings: ControllerUISettings;
        finalize(layouts: FileAsset[]): void;
        writeRawImage(filename: string, base64: string): void;
        setBoxStyle(node: T): void;
        setFontStyle(node: T): void;
        setValueString(node: T): void;
    }

    class ResourceUI<T extends NodeUI> implements ResourceUI<T> {
        public static KEY_NAME: string;
        public static STORED: ResourceStoredMap;
        public static generateId(section: string, name: string, start?: number): string;
        public static insertStoredAsset(asset: string, name: string, value: any): string;
        public static getOptionArray(element: HTMLSelectElement, showDisabled?: boolean): (string[] | undefined)[];
        public static isBackgroundVisible(object: BoxStyle | undefined): boolean;
        public static parseBackgroundImage(node: NodeUI): (string | Gradient)[] | undefined;
        public static getBackgroundSize<T extends NodeUI>(node: T, value: string): Dimension | undefined;
        public static isInheritedStyle<T extends NodeUI>(node: T, attr: string): boolean;
        public static hasLineBreak<T extends NodeUI>(node: T, lineBreak?: boolean, trim?: boolean): boolean;
    }

    interface Extension<T extends Node> {
        application: Application<T>;
        controller: Controller<T>;
        readonly framework: number;
        readonly name: string;
        readonly options: ExternalData;
        readonly dependencies: ExtensionDependency[];
        readonly subscribers: Set<T>;
        require(name: string, preload?: boolean): void;
        beforeParseDocument(): void;
        afterParseDocument(): void;
    }

    class Extension<T extends Node> implements Extension<T> {
        constructor(name: string, framework: number, options?: ExternalData);
    }

    interface ExtensionUI<T extends NodeUI> extends Extension<T> {
        application: ApplicationUI<T>;
        controller: ControllerUI<T>;
        resource: ResourceUI<T>;
        tagNames: string[];
        readonly documentBase: boolean;
        readonly eventOnly: boolean;
        readonly cascadeAll: boolean;
        readonly removeIs: boolean;
        included(element: HTMLElement): boolean;
        init(element: HTMLElement): boolean;
        is(node: T): boolean;
        condition(node: T, parent?: T): boolean;
        processNode(node: T, parent: T): ExtensionResult<T> | undefined;
        processChild(node: T, parent: T): ExtensionResult<T> | undefined;
        addDescendant(node: T): void;
        postBaseLayout(node: T): void;
        postConstraints(node: T): void;
        postOptimize(node: T): void;
        afterBaseLayout(): void;
        afterConstraints(): void;
        afterResources(): void;
        beforeBaseLayout(): void;
        beforeCascade(): void;
        afterFinalize(): void;
    }

    class ExtensionUI<T extends NodeUI> implements ExtensionUI<T> {
        public static findNestedElement(element: Element | null, name: string): HTMLElement | null;
        constructor(name: string, framework: number, options?: ExternalData, tagNames?: string[]);
    }

    interface ExtensionManager<T extends Node> {
        readonly application: Application<T>;
        include(ext: Extension<T>): boolean;
        exclude(ext: Extension<T>): boolean;
        retrieve(name: string): Extension<T> | null;
        optionValue(name: string, attr: string): any;
        optionValueAsObject(name: string, attr: string): {} | null;
        optionValueAsString(name: string, attr: string): string;
        optionValueAsNumber(name: string, attr: string): number;
        optionValueAsBoolean(name: string, attr: string): boolean;
    }

    class ExtensionManager<T extends Node> implements ExtensionManager<T> {}

    interface File<T extends Node> {
        resource: Resource<T>;
        readonly userSettings: UserSettings;
        readonly assets: FileAsset[];
        copyToDisk(directory: string, assets?: FileAsset[], callback?: CallbackResult): void;
        appendToArchive(pathname: string, assets?: FileAsset[]): void;
        saveToArchive(filename: string, assets?: FileAsset[]): void;
        addAsset(data: Optional<RawAsset>): void;
        reset(): void;
        copying(directory: string, assets: FileAsset[], callback?: CallbackResult): void;
        archiving(filename: string, assets: FileAsset[], appendTo?: string): void;
    }

    class File<T extends Node> implements File<T> {
        public static getMimeType(value: string): string;
        public static downloadFile(data: Blob, filename: string, mime?: string): void;
    }

    interface FileUI<T extends NodeUI> extends File<T> {
        resource: ResourceUI<T>;
        readonly userSettings: UserUISettings;
        readonly directory: { string: string, font: string, image: string };
    }

    class FileUI<T extends NodeUI> implements FileUI<T> {}

    interface LayoutUI<T extends NodeUI> extends squared.lib.base.Container<T>, LayoutType {
        parent: T;
        node: T;
        itemCount: number;
        rowCount: number;
        columnCount: number;
        renderIndex: number;
        readonly linearX: boolean;
        readonly linearY: boolean;
        readonly floated: Set<string>;
        readonly cleared: Map<T, string>;
        readonly singleRowAligned: boolean;
        readonly unknownAligned: boolean;
        readonly visible: T[];
        init(): void;
        setType(value: LayoutType): void;
        setContainerType(containerType: number, alignmentType?: number): void;
        hasAlign(value: number): boolean;
        add(value: number): number;
        delete(value: number): number;
    }

    class LayoutUI<T extends NodeUI> implements LayoutUI<T> {
        constructor(parent: T, node: T, containerType?: number, alignmentType?: number, children?: T[]);
    }

    interface Node extends squared.lib.base.Container<Node>, BoxModel {
        id: number;
        depth: number;
        childIndex: number;
        documentRoot: boolean;
        actualParent: Node | null;
        inlineText: boolean;
        dir: string;
        naturalChildren: Node[];
        naturalElements: Node[];
        style: CSSStyleDeclaration;
        parent?: Node;
        queryMap?: Node[][];
        textBounds?: BoxRectDimension;
        readonly sessionId: string;
        readonly initial: InitialData<Node>;
        readonly box: BoxRectDimension;
        readonly bounds: BoxRectDimension;
        readonly linear: BoxRectDimension;
        readonly element: Element | null;
        readonly elementId: string;
        readonly tagName: string;
        readonly htmlElement: boolean;
        readonly styleElement: boolean;
        readonly naturalChild: boolean;
        readonly naturalElement: boolean;
        readonly imageElement: boolean;
        readonly svgElement: boolean;
        readonly flexElement: boolean;
        readonly gridElement: boolean;
        readonly textElement: boolean;
        readonly tableElement: boolean;
        readonly inputElement: boolean;
        readonly layoutElement: boolean;
        readonly pseudoElement: boolean;
        readonly documentBody: boolean;
        readonly dataset: DOMStringMap;
        readonly extensions: string[];
        readonly centerAligned: boolean;
        readonly rightAligned: boolean;
        readonly bottomAligned: boolean;
        readonly horizontalAligned: boolean;
        readonly width: number;
        readonly height: number;
        readonly hasWidth: boolean;
        readonly hasHeight: boolean;
        readonly lineHeight: number;
        readonly display: string;
        readonly positionRelative: boolean;
        readonly top: number;
        readonly right: number;
        readonly bottom: number;
        readonly left: number;
        readonly marginTop: number;
        readonly marginRight: number;
        readonly marginBottom: number;
        readonly marginLeft: number;
        readonly borderTopWidth: number;
        readonly borderRightWidth: number;
        readonly borderBottomWidth: number;
        readonly borderLeftWidth: number;
        readonly paddingTop: number;
        readonly paddingRight: number;
        readonly paddingBottom: number;
        readonly paddingLeft: number;
        readonly inlineFlow: boolean;
        readonly inline: boolean;
        readonly inlineStatic: boolean;
        readonly inlineHorizontal: boolean;
        readonly inlineVertical: boolean;
        readonly plainText: boolean;
        readonly styleText: boolean;
        readonly textContent: string;
        readonly lineBreak: boolean;
        readonly positionStatic: boolean;
        readonly block: boolean;
        readonly blockStatic: boolean;
        readonly blockDimension: boolean;
        readonly blockVertical: boolean;
        readonly contentBox: boolean;
        readonly autoMargin: AutoMargin;
        readonly pageFlow: boolean;
        readonly floating: boolean;
        readonly float: string;
        readonly positionAuto: boolean;
        readonly baseline: boolean;
        readonly multiline: boolean;
        readonly contentBoxWidth: number;
        readonly contentBoxHeight: number;
        readonly flexbox: Flexbox;
        readonly zIndex: number;
        readonly positiveAxis: boolean;
        readonly backgroundColor: string;
        readonly backgroundImage: string;
        readonly visibleStyle: VisibleStyle;
        readonly fontSize: number;
        readonly percentWidth: boolean;
        readonly percentHeight: boolean;
        readonly src: string;
        readonly overflow: number;
        readonly overflowX: boolean;
        readonly overflowY: boolean;
        readonly verticalAlign: string;
        readonly absoluteParent: Node | null;
        readonly actualWidth: number;
        readonly actualHeight: number;
        readonly actualDimension: Dimension;
        readonly firstChild: Node | null;
        readonly lastChild: Node | null;
        readonly firstStaticChild: Node | null;
        readonly lastStaticChild: Node | null;
        readonly previousSibling: Node | null;
        readonly nextSibling: Node | null;
        readonly previousElementSibling: Node | null;
        readonly nextElementSibling: Node | null;
        readonly attributes: StringMap;
        readonly center: Point;
        init(): void;
        saveAsInitial(overwrite?: boolean): void;
        data(name: string, attr: string, value?: any, overwrite?: boolean): any;
        unsetCache(...attrs: string[]): void;
        ascend(condition?: (item: Node) => boolean, parent?: Node, attr?: string): Node[];
        intersectX(rect: BoxRectDimension, dimension?: string): boolean;
        intersectY(rect: BoxRectDimension, dimension?: string): boolean;
        withinX(rect: BoxRectDimension, dimension?: string): boolean;
        withinY(rect: BoxRectDimension, dimension?: string): boolean;
        outsideX(rect: BoxRectDimension, dimension?: string): boolean;
        outsideY(rect: BoxRectDimension, dimension?: string): boolean;
        css(attr: string, value?: string, cache?: boolean): string;
        cssApply(values: StringMap, cache?: boolean): this;
        cssInitial(attr: string, modified?: boolean, computed?: boolean): string;
        cssAny(attr: string, ...values: string[]): boolean;
        cssInitialAny(attr: string, ...values: string[]): boolean;
        cssAscend(attr: string, startSelf?: boolean): string;
        cssSort(attr: string, ascending?: boolean, duplicate?: boolean): Node[];
        cssPX(attr: string, value: number, negative?: boolean, cache?: boolean): string;
        cssSpecificity(attr: string): number;
        cssTry(attr: string, value: string): boolean;
        cssFinally(attr: string): boolean;
        toInt(attr: string, initial?: boolean, fallback?: number): number;
        toFloat(attr: string, initial?: boolean, fallback?: number): number;
        parseUnit(value: string, dimension?: string, parent?: boolean): number;
        convertPX(value: string, dimension?: string, parent?: boolean): string;
        has(attr: string, checkType?: number, options?: {}): boolean;
        hasPX(attr: string, percent?: boolean, initial?: boolean): boolean;
        setBounds(cache?: boolean): void;
        getTextStyle(): StringMap;
        querySelector(value: string): Node | null;
        querySelectorAll(value: string, resultCount?: number): Node[];
    }

    class Node implements Node {
        public static getPseudoElt(node: Node): string;
        constructor(id: number, sessionId?: string, element?: Element);
    }

    interface NodeUI extends Node {
        alignmentType: number;
        containerType: number;
        containerName: string;
        baselineActive: boolean;
        baselineAltered: boolean;
        positioned: boolean;
        visible: boolean;
        rendered: boolean;
        excluded: boolean;
        controlId: string;
        controlName: string;
        documentParent: NodeUI;
        renderExclude: boolean;
        element: Element | null;
        textContent: string;
        positionAuto: boolean;
        baseline: boolean;
        multiline: boolean;
        overflow: number;
        contentBoxWidth: number;
        contentBoxHeight: number;
        lineBreakLeading: boolean;
        lineBreakTrailing: boolean;
        siblingsLeading: NodeUI[];
        siblingsTrailing: NodeUI[];
        floatContainer: boolean;
        containerIndex: number;
        flexbox: Flexbox;
        localSettings: {};
        fontSize: number;
        renderAs?: NodeUI;
        renderParent?: NodeUI;
        renderExtension?: Extension<NodeUI>[];
        renderTemplates?: (NodeTemplate<NodeUI> | null)[];
        outerWrapper?: NodeUI;
        innerWrapped?: NodeUI;
        innerBefore?: NodeUI;
        innerAfter?: NodeUI;
        companion?: NodeUI;
        extracted?: NodeUI[];
        horizontalRows?: NodeUI[][];
        readonly excludeSection: number;
        readonly excludeProcedure: number;
        readonly excludeResource: number;
        readonly renderChildren: NodeUI[];
        readonly nodeGroup: boolean;
        readonly textEmpty: boolean;
        readonly preserveWhiteSpace: boolean;
        readonly baselineHeight: number;
        readonly layoutHorizontal: boolean;
        readonly layoutVertical: boolean;
        readonly onlyChild: boolean;
        readonly support: Support;
        readonly documentId: string;
        readonly outerExtensionElement: HTMLElement | null;
        setControlType(controlName: string, containerType?: number): void;
        setExclusions(): void;
        setLayout(): void;
        setAlignment(): void;
        setBoxSpacing(): void;
        attr(name: string, attr: string, value?: string, overwrite?: boolean): string;
        alignParent(position: string): boolean;
        alignSibling(position: string, documentId?: string): string;
        localizeString(value: string): string;
        inherit(node: Node, ...modules: string[]): void;
        clone(id?: number, attributes?: boolean, position?: boolean): NodeUI;
        cloneBase(node: NodeUI): void;
        is(containerType: number): boolean;
        of(containerType: number, ...alignmentType: number[]): boolean;
        namespace(name: string): StringMap;
        unsafe(name: string, value?: any): any;
        unset(name: string): void;
        delete(name: string, ...attrs: string[]): void;
        apply(options: {}): void;
        lockAttr(name: string, attr: string): void;
        lockedAttr(name: string, attr: string): boolean;
        addAlign(value: number): void;
        removeAlign(value: number): void;
        hasAlign(value: number): boolean;
        hasProcedure(value: number): boolean;
        hasResource(value: number): boolean;
        hasSection(value: number): boolean;
        exclude(resource?: number, procedure?: number, section?: number): void;
        hide(invisible?: boolean): void;
        appendTry(node: NodeUI, replacement: NodeUI, append?: boolean): boolean;
        sort(predicate?: (a: Node, b: Node) => number): this;
        render(parent?: NodeUI): void;
        renderEach(predicate: IteratorPredicate<NodeUI, void>): this;
        renderFilter(predicate: IteratorPredicate<NodeUI, boolean>): NodeUI[];
        actualRect(direction: string, dimension?: string, all?: boolean): number;
        actualPadding(attr: "paddingTop" | "paddingBottom", value: number): number;
        alignedVertically(siblings?: Node[], cleared?: Map<Node, string>, horizontal?: boolean): number;
        previousSiblings(options?: SiblingOptions): NodeUI[];
        nextSiblings(options?: SiblingOptions): NodeUI[];
        modifyBox(region: number, offset?: number, negative?: boolean): void;
        getBox(region: number): [number, number];
        resetBox(region: number, node?: NodeUI): void;
        transferBox(region: number, node: NodeUI): void;
        registerBox(region: number, node?: NodeUI): Set<NodeUI>;
        extractAttributes(depth: number): string;
        setCacheValue(attr: string, value: any): void;
        cssSet(attr: string, value: string, cache?: boolean): string;
    }

    class NodeUI implements NodeUI {
        public static linearData<T>(list: T[], clearOnly?: boolean): LinearData<T>;
        public static outerRegion<T>(node: T): BoxRect;
        public static baseline<T>(list: T[], text?: boolean): T | null;
        public static partitionRows<T>(list: T[], parent?: T): T[][];
        constructor(id: number, sessionId?: string, element?: Element);
    }

    class NodeGroupUI extends NodeUI {}

    interface NodeList<T extends Node> extends squared.lib.base.Container<T> {
        readonly nextId: number;
        afterAppend?: (node: T) => void;
        append(node: T, delegate?: boolean): this;
        reset(): void;
    }

    class NodeList<T extends Node> implements NodeList<T> {
        constructor(children?: T[]);
    }

    namespace extensions {
        class Accessibility<T extends NodeUI> extends ExtensionUI<T> {}
        class CssGrid<T extends NodeUI> extends ExtensionUI<T> {}
        class Flexbox<T extends NodeUI> extends ExtensionUI<T> {}
        class Grid<T extends NodeUI> extends ExtensionUI<T> {
            public static createDataCellAttribute<T extends NodeUI>(): GridCellData<T>;
        }
        class List<T extends NodeUI> extends ExtensionUI<T> {}
        class Relative<T extends NodeUI> extends ExtensionUI<T> {}
        class Sprite<T extends NodeUI> extends ExtensionUI<T> {}
        class Table<T extends NodeUI> extends ExtensionUI<T> {}
        class VerticalAlign<T extends NodeUI> extends ExtensionUI<T> {}
        class WhiteSpace<T extends NodeUI> extends ExtensionUI<T> {}
    }

    namespace lib {
        namespace constant {
            export import CSS_SPACING = $const.CSS_SPACING;
            export import EXT_NAME = $const.EXT_NAME;
        }

        namespace enumeration {
            export import APP_FRAMEWORK = $enum.APP_FRAMEWORK;
            export import APP_SECTION = $enum.APP_SECTION;
            export import BOX_STANDARD = $enum.BOX_STANDARD;
            export import CSS_UNIT = $enum.CSS_UNIT;
            export import NODE_ALIGNMENT = $enum.NODE_ALIGNMENT;
            export import NODE_TEMPLATE = $enum.NODE_TEMPLATE;
            export import NODE_PROCEDURE = $enum.NODE_PROCEDURE;
            export import NODE_RESOURCE = $enum.NODE_RESOURCE;
        }
    }
}

declare namespace lib {
    namespace base {
        interface Container<T> extends Iterable<T> {
            readonly children: T[];
            readonly length: number;
            [Symbol.iterator](): Iterator<T>;
            item(index?: number, value?: T): T | undefined;
            append(item: T): this;
            remove(item: T): T[];
            retain(list: T[]): this;
            contains(item: T): boolean;
            duplicate(): T[];
            clear(): this;
            each(predicate: IteratorPredicate<T, void>): this;
            find(predicate: IteratorPredicate<T, boolean> | string, value?: any): T | undefined;
            sort(predicate: (a: T, b: T) => number): this;
            concat(list: T[]): this;
            every(predicate: IteratorPredicate<T, boolean>): boolean;
            some(predicate: IteratorPredicate<T, boolean>): boolean;
            same(predicate: IteratorPredicate<T, any>): boolean;
            filter(predicate: IteratorPredicate<T, void>): T[];
            splice(predicate: IteratorPredicate<T, boolean>, callback?: (item: T) => void): T[];
            partition(predicate: IteratorPredicate<T, boolean>): [T[], T[]];
            map<U>(predicate: IteratorPredicate<T, U>): U[];
            flatMap<U>(predicate: IteratorPredicate<T, U>): U[];
            cascade(predicate?: (item: T) => boolean): T[];
            cascadeSome(predicate: IteratorPredicate<T, boolean>): boolean;
        }

        class Container<T> implements Container<T> {
            constructor(children?: T[]);
        }
    }

    namespace color {
        function findColorName(value: string): ColorResult | undefined;
        function findColorShade(value: string): ColorResult | undefined;
        function parseColor(value: string, opacity?: number, transparency?: boolean): ColorData | undefined;
        function parseRGBA(value: string): RGBA | undefined;
        function reduceRGBA(value: RGBA, percent: number, cacheName?: string): ColorData | undefined;
        function getHexCode(...values: number[]): string;
        function convertHex(value: RGBA): string;
        function convertHSLA(value: RGBA): HSLA;
        function formatRGBA(value: RGBA): string;
        function formatHSLA(value: HSLA): string;
    }

    namespace client {
        export import PLATFORM = $client.PLATFORM;
        export import USER_AGENT = $client.USER_AGENT;
        function isPlatform(value: string | number): boolean;
        function isUserAgent(value: string | number): boolean;
        function getDeviceDPI(): number;
    }

    namespace css {
        type CSSKeyframesData = ObjectMap<StringMap>;

        interface CSSFontFaceData {
            fontFamily: string;
            fontWeight: number;
            fontStyle: string;
            srcFormat: string;
            srcUrl?: string;
            srcLocal?: string;
        }

        export import BOX_POSITION = $css.BOX_POSITION;
        export import BOX_MARGIN = $css.BOX_MARGIN;
        export import BOX_PADDING = $css.BOX_PADDING;
        export import BOX_BORDER = $css.BOX_BORDER;
        function getStyle(element: Element | null, pseudoElt?: string): CSSStyleDeclaration;
        function getFontSize(element: Element | null): number | undefined;
        function hasComputedStyle(element: Element): element is HTMLElement;
        function checkStyleValue(element: HTMLElement, attr: string, value: string, style?: CSSStyleDeclaration): string;
        function parseSelectorText(value: string): string;
        function getSpecificity(value: string): number;
        function getKeyframeRules(): ObjectMap<CSSKeyframesData>;
        function parseKeyframeRule(rules: CSSRuleList): CSSKeyframesData;
        function validMediaRule(value: string, fontSize?: number): boolean;
        function getDataSet(element: HTMLElement | SVGElement, prefix: string): StringMap;
        function isParentStyle(element: Element, attr: string, ...styles: string[]): boolean;
        function getInheritedStyle(element: Element, attr: string, exclude?: RegExp, ...tagNames: string[]): string;
        function parseVar(element: HTMLElement | SVGElement, value: string): string | undefined;
        function calculateVar(element: HTMLElement | SVGElement, value: string, attr?: string, dimension?: number): number | undefined;
        function getBackgroundPosition(value: string, dimension: Dimension, fontSize?: number, imageDimension?: Dimension, imageSize?: string): BoxRectPosition;
        function getSrcSet(element: HTMLImageElement, mimeType?: string[]): ImageSrcSet[];
        function convertListStyle(name: string, value: number, valueAsDefault?: boolean): string;
        function resolveURL(value: string): string;
        function insertStyleSheetRule(value: string, index?: number): HTMLStyleElement;
        function convertAngle(value: string, unit?: string): number;
        function convertPX(value: string, fontSize?: number): string;
        function calculate(value: string, dimension?: number, fontSize?: number): number;
        function parseUnit(value: string, fontSize?: number): number;
        function parseAngle(value: string): number;
        function formatPX(value: number): string;
        function formatPercent(value: string | number, round?: boolean): string;
        function isLength(value: string, percent?: boolean): boolean;
        function isPercent(value: string): boolean;
        function isCalc(value: string): boolean;
        function isCustomProperty(value: string): boolean;
        function isAngle(value: string): boolean;
    }

    namespace dom {
        export import ELEMENT_BLOCK = $dom.ELEMENT_BLOCK;
        function newBoxRect(): BoxRect;
        function newBoxRectDimension(): BoxRectDimension;
        function newBoxModel(): BoxModel;
        function assignRect(rect: DOMRect | ClientRect | BoxRectDimension, scrollPosition?: boolean): BoxRectDimension;
        function getRangeClientRect(element: Element): BoxRectDimension;
        function removeElementsByClassName(className: string): void;
        function getElementsBetweenSiblings(elementStart: Element | null, elementEnd: Element): Element[] | undefined;
        function getNamedItem(element: Element, attr: string): string;
        function createElement(parent: HTMLElement, tagName: string, attrs: StringMap): HTMLElement;
        function measureTextWidth(value: string, fontFamily: string, fontSize: number): number;
        function isTextNode(element: Element): boolean;
    }

    namespace math {
        function minArray(list: number[]): number;
        function maxArray(list: number[]): number;
        function convertRadian(value: number): number;
        function isEqual(valueA: number, valueB: number, precision?: number): boolean;
        function moreEqual(valueA: number, valueB: number, precision?: number): boolean;
        function lessEqual(valueA: number, valueB: number, precision?: number): boolean;
        function truncate(value: number | string, precision?: number): string;
        function truncateTrailingZero(value: string): string;
        function truncateFraction(value: number): number;
        function truncateString(value: string, precision?: number): string;
        function triangulate(a: number, b: number, clen: number): [number, number];
        function absoluteAngle(start: Point, end: Point): number;
        function relativeAngle(start: Point, end: Point, orientation?: number): number;
        function offsetAngleX(angle: number, value: number): number;
        function offsetAngleY(angle: number, value: number): number;
        function clampRange(value: number, min?: number, max?: number): number;
        function nextMultiple(values: number[], minumum?: number, offset?: number[]): number;
    }

    namespace regex {
        export import STRING = $regex.STRING;
        export import UNIT = $regex.UNIT;
        export import CSS = $regex.CSS;
        export import XML = $regex.XML;
        export import CHAR = $regex.CHAR;
        export import COMPONENT = $regex.COMPONENT;
        export import ESCAPE = $regex.ESCAPE;
    }

    namespace session {
        function actualClientRect(element: Element, sessionId: string, cache?: boolean): ClientRect;
        function actualTextRangeRect(element: Element, sessionId: string, cache?: boolean): BoxRectDimension;
        function setElementCache(element: Element, attr: string, sessionId: string, data: any): void;
        function getElementCache(element: Element, attr: string, sessionId?: string): any;
        function deleteElementCache(element: Element, attr: string, sessionId: string): void;
        function getElementAsNode<T>(element: Element, sessionId: string): T | undefined;
    }

    namespace util {
        function capitalize(value: string, upper?: boolean): string;
        function capitalizeString(value: string): string;
        function lowerCaseString(value: string): string;
        function spliceString(value: string, index: number, length: number): string;
        function convertUnderscore(value: string): string;
        function convertCamelCase(value: string, char?: string): string;
        function convertWord(value: string, dash?: boolean): string;
        function convertInt(value: string): number;
        function convertFloat(value: string): number;
        function convertAlpha(value: number): string;
        function convertRoman(value: number): string;
        function convertEnum(value: number, base: {}, derived: {}): string;
        function buildAlphaString(length: number): string;
        function formatString(value: string, ...params: string[]): string;
        function hasBit(value: number, offset: number): boolean;
        function isNumber(value: any): boolean;
        function isString(value: any): value is string;
        function isArray<T>(value: any): value is Array<T>;
        function isPlainObject(value: any): value is {};
        function isEqual(source: any, values: any): boolean;
        function includes(source: string | undefined, value: string, delimiter?: string): boolean;
        function cloneInstance<T>(value: T): T;
        function cloneArray(data: any[], result?: any[], object?: boolean): any[];
        function cloneObject(data: {}, result?: {}, array?: boolean): {};
        function optional(obj: UndefNull<object>, value: string, type?: string): any;
        function optionalAsObject(obj: UndefNull<object>, value: string): object;
        function optionalAsString(obj: UndefNull<object>, value: string): string;
        function optionalAsNumber(obj: UndefNull<object>, value: string): number;
        function optionalAsBoolean(obj: UndefNull<object>, value: string): boolean;
        function resolvePath(value: string, href?: string): string;
        function trimString(value: string, char: string): string;
        function trimStart(value: string, char: string): string;
        function trimEnd(value: string, char: string): string;
        function fromLastIndexOf(value: string, ...char: string[]): string;
        function searchObject(obj: StringMap, value: string | StringMap): any[][];
        function hasValue<T>(value: any): value is T;
        function compareRange(operation: string, range: number, value: number): boolean;
        function withinRange(a: number, b: number, offset?: number): boolean;
        function aboveRange(a: number, b: number, offset?: number): boolean;
        function belowRange(a: number, b: number, offset?: number): boolean;
        function assignEmptyProperty(dest: {}, source: {}): {};
        function assignEmptyValue(dest: {}, ...attrs: string[]): void;
        function findSet<T>(list: Set<T>, predicate: IteratorPredicate<T, boolean, Set<T>>): T | undefined;
        function sortNumber(values: number[], ascending?: boolean): number[];
        function sortArray<T>(list: T[], ascending: boolean, ...attrs: string[]): T[];
        function flatArray<T>(list: any[]): T[];
        function flatMultiArray<T>(list: any[]): T[];
        function partitionArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>): [T[], T[]];
        function spliceArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback?: IteratorPredicate<T, void>): T[];
        function filterArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>): T[];
        function sameArray<T>(list: T[], predicate: IteratorPredicate<T, any>): boolean;
        function flatMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[];
        function filterMap<T, U>(list: T[], predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, U>): U[];
        function objectMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[];
        function replaceMap<T, U>(list: any[], predicate: IteratorPredicate<T, U>): U[];
        function joinMap<T>(list: T[], predicate: IteratorPredicate<T, string>, char?: string, trailing?: boolean): string;
        function captureMap<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, any>): void;
    }

    namespace xml {
        export import STRING_XMLENCODING = $xml.STRING_XMLENCODING;
        function isPlainText(value: string): string;
        function pushIndent(value: string, depth: number, char?: string, indent?: string): string;
        function pushIndentArray(values: string[], depth: number, char?: string, separator?: string): string;
        function replaceIndent(value: string, depth: number, pattern: RegExp): string;
        function replaceTab(value: string, spaces?: number, preserve?: boolean): string;
        function applyTemplate(tagName: string, template: ExternalData, children: ExternalData[], depth?: number): string;
        function formatTemplate(value: string, closeEmpty?: boolean, startIndent?: number, char?: string): string;
        function replaceCharacterData(value: string, tab?: boolean): string;
    }
}

declare namespace svg {
    interface SvgView extends SvgElement {
        name: string;
        transformed?: SvgTransform[];
        translationOffset?: Point;
        readonly opacity: string;
        readonly visible: boolean;
        readonly transforms: SvgTransform[];
        readonly animations: SvgAnimation[];
        getTransforms(element?: SVGGraphicsElement): SvgTransform[];
        getAnimations(element?: SVGGraphicsElement): SvgAnimation[];
    }

    interface SvgTransformable {
        readonly transforms: SvgTransform[];
        rotateAngle?: number;
        transformed?: SvgTransform[];
        transformResidual?: SvgTransform[][];
    }

    interface SvgSynchronize {
        getAnimateShape(element: SVGGraphicsElement): SvgAnimate[];
        getAnimateTransform(options?: SvgSynchronizeOptions): SvgAnimateTransform[];
        getAnimateViewRect(animations?: SvgAnimation[]): SvgAnimate[];
        animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: SvgPath, options?: SvgSynchronizeOptions): void;
    }

    interface SvgViewRect extends SvgRect, SvgBaseVal {
        setRect(): void;
    }

    interface SvgBaseVal extends SvgElement {
        setBaseValue(attr: string, value?: any): boolean;
        getBaseValue(attr: string, fallback?: any): any;
        refitBaseValue(x: number, y: number, precision?: number, scaleX?: number, scaleY?: number): void;
        verifyBaseValue(attr: string, value?: any): boolean | undefined;
    }

    interface SvgViewBox {
        viewBox: DOMRect;
    }

    interface SvgPaint {
        color: string;
        fill: string;
        fillPattern: string;
        fillOpacity: string;
        fillRule: string;
        stroke: string;
        strokeWidth: string;
        strokePattern: string;
        strokeOpacity: string;
        strokeLinecap: string;
        strokeLinejoin: string;
        strokeMiterlimit: string;
        strokeDasharray: string;
        strokeDashoffset: string;
        clipPath: string;
        clipRule: string;
        useParent?: SvgUse | SvgUseSymbol;
        patternParent?: SvgShapePattern;
        setPaint(d?: string[], precision?: number): void;
        setAttribute(attr: string, computed?: boolean, inherited?: boolean): void;
        getAttribute(attr: string, computed?: boolean, inherited?: boolean): string;
        resetPaint(): void;
        convertLength(value: string, dimension?: string | number): number;
    }

    class SvgBuild {
        public static isContainer(object: SvgElement): object is SvgGroup;
        public static isElement(object: SvgElement): object is SvgElement;
        public static isShape(object: SvgElement): object is SvgShape;
        public static isAnimate(object: SvgAnimation): object is SvgAnimate;
        public static isAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform;
        public static asSvg(object: SvgElement): object is Svg;
        public static asG(object: SvgElement): object is SvgG;
        public static asPattern(object: SvgElement): object is SvgPattern;
        public static asShapePattern(object: SvgElement): object is SvgShapePattern;
        public static asUsePattern(object: SvgElement): object is SvgUsePattern;
        public static asImage(object: SvgElement): object is SvgImage;
        public static asUse(object: SvgElement): object is SvgUse;
        public static asUseSymbol(object: SvgElement): object is SvgUseSymbol;
        public static asSet(object: SvgAnimation): boolean;
        public static asAnimate(object: SvgAnimation): object is SvgAnimate;
        public static asAnimateTransform(object: SvgAnimation): object is SvgAnimateTransform;
        public static asAnimateMotion(object: SvgAnimation): object is SvgAnimateMotion;
        public static setName(element?: SVGElement): string;
        public static drawLine(x1: number, y1: number, x2?: number, y2?: number, precision?: number): string;
        public static drawRect(width: number, height: number, x?: number, y?: number, precision?: number): string;
        public static drawCircle(cx: number, cy: number, r: number, precision?: number): string;
        public static drawEllipse(cx: number, cy: number, rx: number, ry?: number, precision?: number): string;
        public static drawPolygon(values: Point[] | DOMPoint[], precision?: number): string;
        public static drawPolyline(values: Point[] | DOMPoint[], precision?: number): string;
        public static drawPath(values: SvgPathCommand[], precision?: number): string;
        public static drawRefit(element: SVGGraphicsElement, parent?: SvgContainer, precision?: number): string;
        public static transformRefit(value: string, transforms?: SvgTransform[], parent?: SvgView, container?: SvgContainer, precision?: number): string;
        public static getOffsetPath(value: string, rotation?: string): SvgOffsetPath[];
        public static getPathCommands(value: string): SvgPathCommand[];
        public static filterTransforms(transforms: SvgTransform[], exclude?: number[]): SvgTransform[];
        public static applyTransforms(transforms: SvgTransform[], values: Point[], aspectRatio?: SvgAspectRatio, origin?: Point): SvgPoint[];
        public static convertTransforms(transforms: SVGTransformList): SvgTransform[];
        public static getPathPoints(values: SvgPathCommand[], radius?: boolean): SvgPoint[];
        public static syncPathPoints(values: SvgPathCommand[], points: SvgPoint[], transformed?: boolean): SvgPathCommand[];
        public static clonePoints(values: SvgPoint[] | SVGPointList): SvgPoint[];
        public static minMaxPoints(values: Point[]): number[];
        public static centerPoints(...values: Point[]): Point[];
        public static convertPoints(values: number[]): Point[];
        public static parsePoints(value: string): Point[];
        public static parseCoordinates(value: string): number[];
        public static getBoxRect(value: string): BoxRect;
    }

    interface SvgAnimation {
        attributeName: string;
        delay: number;
        to: string;
        fillMode: number;
        fillBackwards: boolean;
        fillForwards: boolean;
        fillFreeze: boolean;
        duration: number;
        paused: boolean;
        synchronizeState: number;
        group: SvgAnimationGroup;
        setterType: boolean;
        parent?: SvgView | SvgPath;
        baseValue?: string;
        replaceValue?: string;
        id?: number;
        companion?: NumberValue<SvgAnimation>;
        readonly element: SVGGraphicsElement | null;
        readonly animationElement: SVGAnimationElement | null;
        readonly instanceType: number;
        readonly fillReplace: boolean;
        readonly parentContainer?: SvgContainer;
        setAttribute(attr: string, equality?: string): void;
        addState(...values: number[]): void;
        removeState(...values: number[]): void;
        hasState(...values: number[]): boolean;
    }

    interface SvgAnimate extends SvgAnimation {
        type: number;
        from: string;
        values: string[];
        keyTimes: number[];
        iterationCount: number;
        reverse: boolean;
        alternate: boolean;
        additiveSum: boolean;
        accumulateSum: boolean;
        evaluateStart: boolean;
        length: number;
        keySplines?: string[];
        timingFunction?: string;
        by?: number;
        end?: number;
        synchronized?: NumberValue;
        readonly animationElement: SVGAnimateElement | null;
        readonly playable: boolean;
        readonly valueTo: string;
        readonly valueFrom: string;
        readonly fromToType: boolean;
        readonly partialType: boolean;
        setCalcMode(attributeName?: string, mode?: string): void;
        convertToValues(keyTimes?: number[]): void;
        setGroupOrdering(value: SvgAnimationAttribute[]): void;
        getIntervalEndTime(leadTime: number): number;
        getTotalDuration(minimum?: boolean): number;
    }

    interface SvgAnimateTransform extends SvgAnimate {
        transformFrom?: string;
        transformOrigin?: Point[];
        readonly animationElement: SVGAnimateTransformElement | null;
        setType(value: string): void;
        expandToValues(): void;
    }

    interface SvgAnimateMotion extends SvgAnimateTransform {
        motionPathElement: SVGGeometryElement | null;
        path: string;
        distance: string;
        rotate: string;
        rotateData?: NumberValue[];
        framesPerSecond?: number;
        readonly animationElement: SVGAnimateMotionElement | null;
        readonly keyPoints: number[];
        readonly offsetLength: number;
        readonly offsetPath?: SvgOffsetPath[];
        readonly rotateValues?: number[];
        addKeyPoint(item: NumberValue): void;
    }

    interface SvgAnimationIntervalMap {
        map: SvgAnimationIntervalAttributeMap;
        has(attr: string): boolean;
        get(attr: string, time: number, playing?: boolean): string | undefined;
        paused(attr: string, time: number): boolean;
        evaluateStart(item: SvgAnimate, otherValue?: any): string[];
    }

    interface SvgAnimationIntervalAttributeMap {
        [key: string]: Map<number, SvgAnimationIntervalValue[]>;
    }

    interface SvgAnimationIntervalValue {
        time: number;
        value: string;
        endTime: number;
        start: boolean;
        end: boolean;
        fillMode: number;
        infinite: boolean;
        valueFrom?: string;
        animation?: SvgAnimation;
    }

    class SvgAnimation implements SvgAnimation {
        public static convertClockTime(value: string): number;
        constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimationElement);
    }

    class SvgAnimate implements SvgAnimate {
        public static getSplitValue(value: number, next: number, percent: number): number;
        public static convertStepTimingFunction(attributeName: string, keyTimes: number[], values: string[], keySpline: string, index: number, fontSize?: number): [number[], string[]] | undefined;
        public static toFractionList(value: string, delimiter?: string, ordered?: boolean): number[];
        constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateElement);
    }

    class SvgAnimateTransform implements SvgAnimateTransform {
        public static toRotateList(values: string[]): number[][] | undefined;
        public static toScaleList(values: string[]): number[][] | undefined;
        public static toTranslateList(values: string[]): number[][] | undefined;
        public static toSkewList(values: string[]): number[][] | undefined;
        constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateTransformElement);
    }

    class SvgAnimateMotion implements SvgAnimateMotion {
        constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateMotionElement);
    }

    class SvgAnimationIntervalMap implements SvgAnimationIntervalMap {
        public static getGroupEndTime(item: SvgAnimationAttribute): number;
        public static getKeyName(item: SvgAnimation): string;
        constructor(animations: SvgAnimation[], ...attrs: string[]);
    }

    type SvgGroup = Svg | SvgG | SvgUseSymbol | SvgPattern | SvgShapePattern | SvgUsePattern;

    interface SvgContainer extends squared.lib.base.Container<SvgView>, SvgElement {
        clipRegion: string;
        aspectRatio: SvgAspectRatio;
        readonly element: SVGSVGElement | SVGGElement | SVGUseElement;
        readonly requireRefit: boolean;
        readonly instanceType: number;
        append(item: SvgView, viewport?: Svg): this;
        refitX(value: number): number;
        refitY(value: number): number;
        refitSize(value: number): number;
        refitPoints(values: SvgPoint[]): SvgPoint[];
        getPathAll(cascade?: boolean): string[];
        hasViewBox(): boolean;
        clipViewBox(x: number, y: number, width: number, height: number, precision?: number, documentRoot?: boolean): void;
    }

    interface SvgViewRectExtended extends SvgView, SvgViewRect, SvgViewBox, SvgBaseVal, SvgSynchronize {}

    interface Svg extends SvgContainer, SvgViewRectExtended {
        precision?: number;
        readonly element: SVGSVGElement;
        readonly documentRoot: boolean;
        readonly definitions: {
            clipPath: Map<string, SVGClipPathElement>;
            pattern: Map<string, SVGPatternElement>;
            gradient: Map<string, Gradient>;
        };
    }

    interface SvgG extends SvgContainer, SvgView, SvgPaint {
        readonly element: SVGGElement;
    }

    interface SvgUseSymbol extends SvgContainer, SvgViewRectExtended, SvgPaint {
        readonly element: SVGUseElement;
        readonly symbolElement: SVGSymbolElement;
    }

    interface SvgPattern extends SvgContainer, SvgView {
        readonly element: SVGGraphicsElement;
        readonly patternElement: SVGPatternElement;
    }

    interface SvgShapePattern extends SvgPattern, SvgPaint {
        drawRegion?: BoxRect;
        readonly element: SVGGeometryElement | SVGUseElement;
        readonly patternElement: SVGPatternElement;
        readonly patternUnits: number;
        readonly patternContentUnits: number;
        readonly patternWidth: number;
        readonly patternHeight: number;
        readonly tileWidth: number;
        readonly tileHeight: number;
        patternRefitX(value: number): number;
        patternRefitY(value: number): number;
        patternRefitPoints(values: SvgPoint[]): SvgPoint[];
    }

    interface SvgUsePattern extends SvgShapePattern, SvgViewRect {
        readonly element: SVGUseElement;
        readonly shapeElement: SVGGeometryElement;
    }

    class SvgContainer implements SvgContainer {
        constructor(element: SVGSVGElement | SVGGElement | SVGUseElement);
    }

    class Svg implements Svg {
        constructor(element: SVGSVGElement, documentRoot?: boolean);
    }

    class SvgG implements SvgG {
        constructor(element: SVGGElement);
    }

    class SvgUseSymbol implements SvgUseSymbol {
        constructor(element: SVGUseElement, symbolElement: SVGSymbolElement);
    }

    class SvgPattern implements SvgPattern {
        constructor(element: SVGGraphicsElement, patternElement: SVGPatternElement);
    }

    class SvgShapePattern implements SvgShapePattern {
        constructor(element: SVGGraphicsElement, patternElement: SVGPatternElement);
    }

    class SvgUsePattern implements SvgUsePattern {
        constructor(element: SVGUseElement, shapeElement: SVGGeometryElement, patternElement: SVGPatternElement);
    }

    interface SvgElement {
        parent?: SvgContainer;
        viewport?: Svg;
        readonly element: SVGGraphicsElement;
        readonly instanceType: number;
        build(options?: SvgBuildOptions): void;
        synchronize(options?: SvgSynchronizeOptions): void;
    }

    interface SvgShape extends SvgElement, SvgView, SvgSynchronize {
        path?: SvgPath;
        readonly element: SVGGeometryElement | SVGUseElement;
        setPath(): void;
        synchronize(options?: SvgSynchronizeOptions): void;
    }

    interface SvgImage extends SvgElement, SvgView, SvgViewRect, SvgBaseVal, SvgTransformable {
        readonly element: SVGImageElement | SVGUseElement;
        readonly href: string;
        extract(exclude?: number[]): void;
    }

    interface SvgUse extends SvgShape, SvgViewRect, SvgBaseVal, SvgPaint {
        readonly element: SVGUseElement;
        readonly shapeElement: SVGGeometryElement;
        synchronize(options?: SvgSynchronizeOptions): void;
    }

    class SvgElement implements SvgElement {
        constructor(element: SVGGraphicsElement);
    }

    class SvgShape implements SvgShape {
        constructor(element: SVGGraphicsElement, initialize?: boolean);
    }

    class SvgImage implements SvgImage {
        constructor(element: SVGImageElement | SVGUseElement, imageElement?: SVGImageElement);
    }

    class SvgUse implements SvgUse {
        constructor(element: SVGUseElement, shapeElement: SVGGraphicsElement, initialize?: boolean);
    }

    interface SvgPath extends SvgBaseVal, SvgPaint, SvgTransformable {
        name: string;
        value: string;
        baseValue: string;
        readonly element: SVGGeometryElement;
        readonly pathLength: number;
        readonly totalLength: number;
        draw(transforms?: SvgTransform[], options?: SvgBuildOptions): string;
        extendLength(data: SvgPathExtendData, precision?: number): SvgPathExtendData | undefined;
        flattenStrokeDash(valueArray: number[], valueOffset: number, totalLength: number, pathLength?: number): SvgPathExtendData;
        extractStrokeDash(animations?: SvgAnimation[], precision?: number): [SvgAnimation[] | undefined, SvgStrokeDash[] | undefined, string, string];
    }

    class SvgPath implements SvgPath {
        public static transform(value: string, transforms: SvgTransform[], element?: SVGGeometryElement, precision?: number): string;
        public static extrapolate(attr: string, value: string, values: string[], transforms?: SvgTransform[], companion?: SvgShape, precision?: number): string[] | undefined;
        constructor(element: SVGGeometryElement);
    }

    namespace lib {
        namespace constant {
            export import FILL_MODE = $svg_const.FILL_MODE;
            export import SYNCHRONIZE_MODE = $svg_const.SYNCHRONIZE_MODE;
            export import KEYSPLINE_NAME = $svg_const.KEYSPLINE_NAME;
        }

        namespace util {
            export import MATRIX = $svg_util.MATRIX;
            export import SVG = $svg_util.SVG;
            export import TRANSFORM = $svg_util.TRANSFORM;
            function getAttribute(element: SVGElement, attr: string, computed?: boolean): string;
            function getParentAttribute(element: SVGElement, attr: string, computed?: boolean): string;
            function getAttributeURL(value: string): string;
            function getDOMRect(element: SVGElement): DOMRect;
            function getTargetElement(element: SVGElement, rootElement?: HTMLElement | SVGElement | null): SVGElement | null;
            function getNearestViewBox(element: SVGElement): DOMRect | undefined;
            function createPath(value: string): SVGPathElement;
            function getPathLength(value: string): string;
        }
    }
}

export as namespace squared;