import type { AppHandler, NodeUIOptions, AppProcessing, AppProcessingUI, AppSession, AppSessionUI, ControllerSettings, ControllerUISettings, ExtensionDependency, ExtensionResult, FileActionOptions, FileArchivingOptions, FileAsset, FileCopyingOptions, ImageAsset, LayoutOptions, LayoutResult, LayoutType, NodeGroupUIOptions, NodeTemplate, RawAsset, ResourceAssetMap, ResourceStoredMap, UserUISettings, UserSettings } from './base/application';
import type { CssGridData, CssGridDirectionData, GridCellData } from './base/extension';
import type { AutoMargin, AscendOptions, BoxOptions, BoxType, ExcludeUIOptions, HasOptions, HideUIOptions, InitialData, LinearDataUI, LocalSettingsUI, SiblingOptions, SupportUI, TranslateUIOptions, VisibleStyle } from './base/node';

import type { SvgAnimationAttribute, SvgAnimationGroup, SvgAspectRatio, SvgBuildOptions, SvgMatrix, SvgOffsetPath, SvgPathCommand, SvgPathExtendData, SvgPoint, SvgRect, SvgSynchronizeOptions, SvgStrokeDash, SvgTransform } from './svg/object';

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
declare function retrieve(value: string): Null<{}>;
declare function ready(): boolean;
declare function close(): void;
declare function reset(): void;
declare function copyToDisk(value: string, options?: FileActionOptions): void;
declare function appendToArchive(value: string, options?: FileActionOptions): void;
declare function saveToArchive(value?: string, options?: FileActionOptions): void;
declare function toString(): string;

declare function apply(value: {} | string, options: {}): boolean;
declare function saveAllToDisk(): void;

declare namespace base {
    interface Application<T extends Node> {
        framework: number;
        userSettings: UserSettings;
        initializing: boolean;
        closed: boolean;
        readonly session: AppSession<T>;
        readonly processing: AppProcessing<T>;
        readonly builtInExtensions: ObjectMap<Extension<T>>;
        readonly controllerHandler: Controller<T>;
        readonly resourceHandler: Resource<T>;
        readonly extensionManager: ExtensionManager<T>;
        readonly Node: Constructor<T>;
        readonly fileHandler: Undef<File<T>>;
        readonly extensions: Extension<T>[];
        readonly extensionsCascade: Extension<T>[];
        readonly nextId: number;
        readonly length: number;
        reset(): void;
        parseDocument(...elements: (string | HTMLElement)[]): PromiseResult;
        createCache(documentRoot: HTMLElement): boolean;
        createNode(options: {}): T;
        insertNode(element: Element, parent?: T, pseudoElt?: string): Undef<T>;
        afterCreateCache(element: HTMLElement): void;
        finalize(): void;
        copyToDisk(directory: string, options?: FileActionOptions): void;
        appendToArchive(pathname: string, options?: FileActionOptions): void;
        saveToArchive(filename?: string, options?: FileActionOptions): void;
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
        userSettings: UserUISettings;
        readonly session: AppSessionUI<T>;
        readonly processing: AppProcessingUI<T>;
        readonly builtInExtensions: ObjectMap<ExtensionUI<T>>;
        readonly controllerHandler: ControllerUI<T>;
        readonly resourceHandler: ResourceUI<T>;
        readonly fileHandler: Undef<FileUI<T>>;
        readonly extensions: ExtensionUI<T>[];
        readonly rootElements: Set<Element>;
        readonly layouts: FileAsset[];
        readonly clearMap: Map<T, string>;
        conditionElement(element: HTMLElement, pseudoElt?: string): boolean;
        createNode(options: NodeUIOptions<T>): T;
        renderNode(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
        resolveTarget(target: Undef<string>): Undef<T>;
        addLayout(layout: LayoutUI<T>): void;
        addLayoutTemplate(parent: T, node: T, template: Undef<NodeTemplate<T>>, index?: number): void;
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
        sessionId: string;
        readonly application: Application<T>;
        readonly cache: NodeList<T>;
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
        readonly screenDimension: Dimension;
        readonly containerTypeHorizontal: LayoutType;
        readonly containerTypeVertical: LayoutType;
        readonly containerTypeVerticalMargin: LayoutType;
        readonly containerTypePercent: LayoutType;
        optimize(nodes: T[]): void;
        finalize(layouts: FileAsset[]): void;
        evaluateNonStatic(documentRoot: T, cache: NodeList<T>): void;
        visibleElement(element: Element, pseudoElt?: string): boolean;
        processUnknownParent(layout: LayoutUI<T>): LayoutResult<T>;
        processUnknownChild(layout: LayoutUI<T>): LayoutResult<T>;
        processTraverseHorizontal(layout: LayoutUI<T>, siblings: T[]): Undef<LayoutUI<T>>;
        processTraverseVertical(layout: LayoutUI<T>, siblings: T[]): Undef<LayoutUI<T>>;
        processLayoutHorizontal(layout: LayoutUI<T>): LayoutUI<T>;
        setConstraints(): void;
        renderNode(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
        renderNodeGroup(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
        createNodeGroup(node: T, children: T[], options?: NodeGroupUIOptions<T>): T;
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
        controllerSettings: ControllerSettings;
        fileHandler?: File<T>;
        readonly application: Application<T>;
        readonly cache: NodeList<T>;
        readonly userSettings: UserSettings;
        reset(): void;
        addImage(element: Undef<HTMLImageElement>): void;
        getImage(src: string): Undef<ImageAsset>;
        addFont(data: squared.lib.css.FontFaceData): void;
        getFont(fontFamily: string, fontStyle?: string, fontWeight?: string): Undef<squared.lib.css.FontFaceData>;
        addRawData(uri: string, mimeType: string, encoding: string, content: string): string;
        getRawData(uri: string): Undef<RawAsset>;
        setFileHandler(instance: File<T>): void;
    }

    class Resource<T extends Node> implements Resource<T> {
        public static ASSETS: ResourceAssetMap;
    }

    interface ResourceUI<T extends NodeUI> extends Resource<T> {
        controllerSettings: ControllerUISettings;
        readonly userSettings: UserUISettings;
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
        public static getOptionArray(element: HTMLSelectElement | HTMLOptGroupElement, showDisabled?: boolean): Undef<string[]>[];
        public static isBackgroundVisible(object: Undef<BoxStyle>): boolean;
        public static parseBackgroundImage(node: NodeUI, value: string, screenDimension?: Dimension): Undef<string | Gradient>[];
        public static getBackgroundSize<T extends NodeUI>(node: T, value: string, screenDimension?: Dimension): Undef<Dimension>;
        public static isInheritedStyle<T extends NodeUI>(node: T, attr: string): boolean;
        public static hasLineBreak<T extends NodeUI>(node: T, lineBreak?: boolean, trim?: boolean): boolean;
        public static checkPreIndent(node: NodeUI): Undef<[string, NodeUI]>;
    }

    interface Extension<T extends Node> {
        application: Application<T>;
        readonly controller: Controller<T>;
        readonly framework: number;
        readonly name: string;
        readonly options: StandardMap;
        readonly dependencies: ExtensionDependency[];
        readonly subscribers: Set<T>;
        require(name: string, preload?: boolean): void;
        beforeParseDocument(): void;
        afterParseDocument(): void;
    }

    class Extension<T extends Node> implements Extension<T> {
        constructor(name: string, framework: number, options?: StandardMap);
    }

    interface ExtensionUI<T extends NodeUI> extends Extension<T> {
        application: ApplicationUI<T>;
        tagNames: string[];
        readonly controller: ControllerUI<T>;
        readonly resource: ResourceUI<T>;
        readonly cache: NodeList<T>;
        readonly cacheProcessing: NodeList<T>;
        readonly documentBase: boolean;
        readonly eventOnly: boolean;
        readonly cascadeAll: boolean;
        init?(element: HTMLElement): boolean;
        included(element: HTMLElement): boolean;
        is(node: T): boolean;
        condition(node: T, parent?: T): boolean;
        processNode(node: T, parent: T): Undef<ExtensionResult<T>>;
        processChild(node: T, parent: T): Undef<ExtensionResult<T>>;
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
        public static findNestedElement(element: Null<Element>, name: string): Null<HTMLElement>;
        constructor(name: string, framework: number, options?: StandardMap, tagNames?: string[]);
    }

    interface ExtensionManager<T extends Node> {
        readonly application: Application<T>;
        include(ext: Extension<T>): boolean;
        exclude(ext: Extension<T>): boolean;
        retrieve(name: string): Null<Extension<T>>;
        optionValue(name: string, attr: string): any;
        optionValueAsObject(name: string, attr: string): Null<{}>;
        optionValueAsString(name: string, attr: string): string;
        optionValueAsNumber(name: string, attr: string): number;
        optionValueAsBoolean(name: string, attr: string): boolean;
    }

    class ExtensionManager<T extends Node> implements ExtensionManager<T> {}

    interface File<T extends Node> {
        resource: Resource<T>;
        readonly userSettings: UserSettings;
        readonly assets: FileAsset[];
        copyToDisk(directory: string, options?: FileActionOptions): void;
        appendToArchive(pathname: string, options?: FileActionOptions): void;
        saveToArchive(filename: string, options?: FileActionOptions): void;
        addAsset(data: Optional<RawAsset>): void;
        reset(): void;
        copying(options: FileCopyingOptions): void;
        archiving(options: FileArchivingOptions): void;
    }

    class File<T extends Node> implements File<T> {
        public static getMimeType(value: string): string;
        public static downloadFile(data: Blob, filename: string, mimeType?: string): void;
    }

    interface FileUI<T extends NodeUI> extends File<T> {
        resource: ResourceUI<T>;
        readonly userSettings: UserUISettings;
        readonly directory: { string: string; font: string; image: string };
    }

    class FileUI<T extends NodeUI> implements FileUI<T> {}

    interface LayoutUI<T extends NodeUI> extends squared.lib.base.Container<T>, LayoutType {
        parent: T;
        node: T;
        type: LayoutType;
        itemCount: number;
        rowCount: number;
        columnCount: number;
        renderType: number;
        renderIndex: number;
        readonly linearX: boolean;
        readonly linearY: boolean;
        readonly floated: Set<string>;
        readonly singleRowAligned: boolean;
        readonly unknownAligned: boolean;
        init(): void;
        setContainerType(containerType: number, alignmentType?: number): void;
        hasAlign(value: number): boolean;
        add(value: number): number;
        addRender(value: number): number;
        delete(value: number): number;
    }

    class LayoutUI<T extends NodeUI> implements LayoutUI<T> {
        public static create<T extends NodeUI>(options: LayoutOptions<T>): LayoutUI<T>;
        constructor(parent: T, node: T, containerType?: number, alignmentType?: number, children?: T[]);
    }

    interface Node extends squared.lib.base.Container<Node>, BoxModel {
        id: number;
        depth: number;
        childIndex: number;
        documentRoot: boolean;
        actualParent: Null<Node>;
        inlineText: boolean;
        dir: string;
        naturalChildren: Node[];
        naturalElements: Node[];
        style: CSSStyleDeclaration;
        parent?: Node;
        queryMap?: Node[][];
        readonly sessionId: string;
        readonly initial: Undef<InitialData<Node>>;
        readonly box: BoxRectDimension;
        readonly bounds: BoxRectDimension;
        readonly linear: BoxRectDimension;
        readonly element: Null<Element>;
        readonly elementId: string;
        readonly tagName: string;
        readonly naturalChild: boolean;
        readonly naturalElement: boolean;
        readonly htmlElement: boolean;
        readonly styleElement: boolean;
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
        readonly centerAligned: boolean;
        readonly rightAligned: boolean;
        readonly bottomAligned: boolean;
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
        readonly inlineVertical: boolean;
        readonly inlineDimension: boolean;
        readonly plainText: boolean;
        readonly styleText: boolean;
        readonly textContent: string;
        readonly textBounds: Null<BoxRectDimension>;
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
        readonly baseline: boolean;
        readonly multiline: boolean;
        readonly contentBoxWidth: number;
        readonly contentBoxHeight: number;
        readonly flexdata: FlexData;
        readonly flexbox: FlexBox;
        readonly zIndex: number;
        readonly backgroundColor: string;
        readonly backgroundImage: string;
        readonly visibleStyle: VisibleStyle;
        readonly fontSize: number;
        readonly src: string;
        readonly overflow: number;
        readonly overflowX: boolean;
        readonly overflowY: boolean;
        readonly verticalAlign: string;
        readonly absoluteParent: Null<Node>;
        readonly actualWidth: number;
        readonly actualHeight: number;
        readonly actualDimension: Dimension;
        readonly percentWidth: number;
        readonly percentHeight: number;
        readonly firstChild: Null<Node>;
        readonly lastChild: Null<Node>;
        readonly firstStaticChild: Null<Node>;
        readonly lastStaticChild: Null<Node>;
        readonly previousSibling: Null<Node>;
        readonly nextSibling: Null<Node>;
        readonly previousElementSibling: Null<Node>;
        readonly nextElementSibling: Null<Node>;
        readonly attributes: StringMap;
        readonly boundingClientRect: DOMRect;
        readonly cssStyle: StringMap;
        readonly textStyle: StringMap;
        readonly center: Point;
        init(): void;
        saveAsInitial(overwrite?: boolean): void;
        data(name: string, attr: string, value?: any, overwrite?: boolean): any;
        unsetCache(...attrs: string[]): void;
        ascend(options: AscendOptions): Node[];
        intersectX(rect: BoxRectDimension, dimension?: BoxType): boolean;
        intersectY(rect: BoxRectDimension, dimension?: BoxType): boolean;
        withinX(rect: BoxRectDimension, dimension?: BoxType): boolean;
        withinY(rect: BoxRectDimension, dimension?: BoxType): boolean;
        outsideX(rect: BoxRectDimension, dimension?: BoxType): boolean;
        outsideY(rect: BoxRectDimension, dimension?: BoxType): boolean;
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
        cssTryAll(attrs: StringMap): Undef<StringMap>;
        cssFinally(attrs: string | StringMap): void;
        cssParent(attr: string, value?: string, cache?: boolean): string;
        cssAsTuple(...attrs: string[]): string[];
        cssAsObject(...attrs: string[]): StringMap;
        cssCopy(node: Node, ...attrs: string[]): void;
        cssCopyIfEmpty(node: Node, ...attrs: string[]): void;
        toInt(attr: string, fallback?: number, initial?: boolean): number;
        toFloat(attr: string, fallback?: number, initial?: boolean): number;
        toElementInt(attr: string, fallback?: number): number;
        toElementFloat(attr: string, fallback?: number): number;
        toElementBoolean(attr: string, fallback?: boolean): boolean;
        toElementString(attr: string, fallback?: string): string;
        parseUnit(value: string, dimension?: "width" | "height", parent?: boolean, screenDimension?: Dimension): number;
        has(attr: string, options?: HasOptions): boolean;
        hasPX(attr: string, percent?: boolean, initial?: boolean): boolean;
        hasFlex(direction: "row" | "column"): boolean;
        setBounds(cache?: boolean): void;
        querySelector(value: string): Null<Node>;
        querySelectorAll(value: string, resultCount?: number): Node[];
    }

    class Node implements Node {
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
        originalRoot: boolean;
        documentParent: NodeUI;
        renderExclude: boolean;
        textContent: string;
        autoPosition: boolean;
        multiline: boolean;
        overflow: number;
        naturalChild: boolean;
        lineBreakLeading: boolean;
        lineBreakTrailing: boolean;
        siblingsLeading: NodeUI[];
        siblingsTrailing: NodeUI[];
        floatContainer: boolean;
        containerIndex: number;
        localSettings: LocalSettingsUI;
        fontSize: number;
        renderAs?: NodeUI;
        renderParent?: NodeUI;
        renderExtension?: Extension<NodeUI>[];
        renderTemplates?: NodeTemplate<NodeUI>[];
        outerWrapper?: NodeUI;
        innerWrapped?: NodeUI;
        innerBefore?: NodeUI;
        innerAfter?: NodeUI;
        companion?: NodeUI;
        labelFor?: NodeUI;
        extracted?: NodeUI[];
        horizontalRows?: NodeUI[][];
        readonly renderChildren: NodeUI[];
        readonly nodeGroup: boolean;
        readonly textEmpty: boolean;
        readonly preserveWhiteSpace: boolean;
        readonly controlElement: boolean;
        readonly baselineHeight: number;
        readonly baselineElement: boolean;
        readonly positiveAxis: boolean;
        readonly leftTopAxis: boolean;
        readonly layoutHorizontal: boolean;
        readonly layoutVertical: boolean;
        readonly onlyChild: boolean;
        readonly outerMostWrapper: NodeUI;
        readonly innerMostWrapped: NodeUI;
        readonly support: SupportUI;
        readonly documentId: string;
        readonly extensions: string[];
        readonly outerExtensionElement: Null<HTMLElement>;
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
        unlockAttr(name: string, attr: string): void;
        lockedAttr(name: string, attr: string): boolean;
        addAlign(value: number): void;
        removeAlign(value: number): void;
        hasAlign(value: number): boolean;
        hasProcedure(value: number): boolean;
        hasResource(value: number): boolean;
        hasSection(value: number): boolean;
        exclude(options: ExcludeUIOptions): void;
        hide(options?: HideUIOptions<NodeUI>): void;
        appendTry(node: NodeUI, replacement: NodeUI, append?: boolean): boolean;
        removeTry(replacement?: NodeUI, beforeReplace?: () => void): boolean;
        sort(predicate?: (a: Node, b: Node) => number): this;
        render(parent?: NodeUI): void;
        renderEach(predicate: IteratorPredicate<NodeUI, void>): this;
        parseWidth(value: string, parent?: boolean): number;
        parseHeight(value: string, parent?: boolean): number;
        actualRect(direction: string, dimension?: BoxType): number;
        actualPadding(attr: "paddingTop" | "paddingBottom", value: number): number;
        actualBoxWidth(value?: number): number;
        alignedVertically(siblings?: Node[], cleared?: Map<Node, string>, horizontal?: boolean): number;
        previousSiblings(options?: SiblingOptions): NodeUI[];
        nextSiblings(options?: SiblingOptions): NodeUI[];
        modifyBox(region: number, offset?: number, negative?: boolean): void;
        setBox(region: number, options: BoxOptions): void;
        getBox(region: number): [number, number];
        resetBox(region: number, node?: NodeUI): void;
        transferBox(region: number, node: NodeUI): void;
        registerBox(region: number, node?: NodeUI): Undef<NodeUI>;
        extractAttributes(depth: number): string;
        setCacheValue(attr: string, value: any): void;
        cssSet(attr: string, value: string, cache?: boolean): string;
        translateX(value: number, options?: TranslateUIOptions): boolean;
        translateY(value: number, options?: TranslateUIOptions): boolean;
    }

    class NodeUI implements NodeUI, LayoutType {
        public static refitScreen<T>(node: T, value: Dimension): Dimension;
        public static linearData<T>(list: T[], cleared?: Map<T, string>): LinearDataUI<T>;
        public static outerRegion<T>(node: T): BoxRectDimension;
        public static baseline<T>(list: T[], text?: boolean): Null<T>;
        public static partitionRows<T>(list: T[], cleared?: Map<T, string>): T[][];
        constructor(id: number, sessionId?: string, element?: Element);
    }

    class NodeGroupUI extends NodeUI {}

    interface NodeList<T extends Node> extends squared.lib.base.Container<T> {
        readonly nextId: number;
        afterAppend?: (node: T, cascade?: boolean) => void;
        append(node: T, delegate?: boolean, cascade?: boolean): this;
        reset(): void;
    }

    class NodeList<T extends Node> implements NodeList<T> {
        constructor(children?: T[]);
    }

    namespace extensions {
        class Accessibility<T extends NodeUI> extends ExtensionUI<T> {}
        class Column<T extends NodeUI> extends ExtensionUI<T> {}
        class CssGrid<T extends NodeUI> extends ExtensionUI<T> {
            public static isAligned<T extends NodeUI>(node: T): boolean;
            public static isJustified<T extends NodeUI>(node: T): boolean;
            public static createDataAttribute<T extends NodeUI>(alignItems: string, alignContent: string, justifyItems: string, justifyContent: string, autoFlow: string): CssGridData<T>;
            public static createDataRowAttribute(): CssGridDirectionData;
        }
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
            const CSS_SPACING: Map<number, string>;
            const EXT_NAME: StringMap;
        }

        namespace enumeration {
            const enum APP_FRAMEWORK {
                UNIVERSAL = 0,
                ANDROID = 2,
                CHROME = 4
            }
            const enum NODE_ALIGNMENT {
                UNKNOWN = 2,
                AUTO_LAYOUT = 4,
                HORIZONTAL = 8,
                VERTICAL = 16,
                ABSOLUTE = 32,
                BLOCK = 64,
                SEGMENTED = 128,
                COLUMN = 256,
                FLOAT = 512,
                INLINE = 1024,
                RIGHT = 2048,
                SINGLE = 4096,
                EXTENDABLE = 8192,
                WRAPPER = 16384,
                PERCENT = 32768
            }
            const enum NODE_TEMPLATE {
                XML = 1,
                INCLUDE
            }
            const enum NODE_TRAVERSE {
                HORIZONTAL = 0,
                VERTICAL = 1,
                LINEBREAK = 2,
                INLINE_WRAP = 3,
                FLOAT_WRAP = 4,
                FLOAT_CLEAR = 5,
                FLOAT_BLOCK = 6,
                FLOAT_INTERSECT = 7,
                PERCENT_WRAP = 8
            }
            const enum CSS_UNIT {
                LENGTH = 2,
                PERCENT = 4
            }
            const enum BOX_STANDARD {
                MARGIN_TOP = 2,
                MARGIN_RIGHT = 4,
                MARGIN_BOTTOM = 8,
                MARGIN_LEFT = 16,
                PADDING_TOP = 32,
                PADDING_RIGHT = 64,
                PADDING_BOTTOM = 128,
                PADDING_LEFT = 256,
                MARGIN = 2 | 4 | 8 | 16,
                MARGIN_VERTICAL = 2 | 8,
                MARGIN_HORIZONTAL = 4 | 16,
                PADDING = 32 | 64 | 128 | 256,
                PADDING_VERTICAL = 32 | 128,
                PADDING_HORIZONTAL = 64 | 256
            }
            enum APP_SECTION {
                DOM_TRAVERSE = 2,
                EXTENSION = 4,
                RENDER = 8,
                ALL = 14
            }
            enum NODE_RESOURCE {
                BOX_STYLE = 2,
                BOX_SPACING = 4,
                FONT_STYLE = 8,
                VALUE_STRING = 16,
                IMAGE_SOURCE = 32,
                ASSET = 8 | 16 | 32,
                ALL = 126
            }
            enum NODE_PROCEDURE {
                CONSTRAINT = 2,
                LAYOUT = 4,
                ALIGNMENT = 8,
                ACCESSIBILITY = 16,
                LOCALIZATION = 32,
                CUSTOMIZATION = 64,
                ALL = 126
            }
        }
    }
}

declare namespace lib {
    namespace base {
        interface Container<T> extends Iterable<T> {
            readonly children: T[];
            readonly length: number;
            [Symbol.iterator](): Iterator<T>;
            item(index?: number, value?: T): Undef<T>;
            append(item: T): this;
            remove(item: T): T[];
            retain(list: T[]): this;
            contains(item: T): boolean;
            duplicate(): T[];
            clear(): this;
            each(predicate: IteratorPredicate<T, void>): this;
            iterate(predicate: IteratorPredicate<T, void | boolean>, start?: number, end?: number): number;
            sort(predicate: (a: T, b: T) => number): this;
            concat(list: T[]): this;
            join(...other: Container<T>[]): this;
            every(predicate: IteratorPredicate<T, boolean>): boolean;
            same(predicate: IteratorPredicate<T, any>): boolean;
            filter(predicate: IteratorPredicate<T, void>): T[];
            splice(predicate: IteratorPredicate<T, boolean>, callback?: (item: T) => void): T[];
            partition(predicate: IteratorPredicate<T, boolean>): [T[], T[]];
            map<U>(predicate: IteratorPredicate<T, U>): U[];
            flatMap<U>(predicate: IteratorPredicate<T, U>): U[];
            find(predicate: IteratorPredicate<T, boolean>, options?: ContainerFindOptions<T>): Undef<T>;
            some(predicate: IteratorPredicate<T, boolean>, options?: ContainerSomeOptions<T>): boolean;
            cascade(predicate?: (item: T) => boolean, options?: ContainerCascadeOptions<T>): T[];
        }

        class Container<T> implements Container<T> {
            constructor(children?: T[]);
        }
    }

    namespace color {
        function findColorName(value: string): Undef<ColorResult>;
        function findColorShade(value: string): Undef<ColorResult>;
        function parseColor(value: string, opacity?: number, transparency?: boolean): Undef<ColorData>;
        function parseRGBA(value: string): Undef<RGBA>;
        function reduceRGBA(value: RGBA, percent: number, cacheName?: string): Undef<ColorData>;
        function getHexCode(...values: number[]): string;
        function convertHex(value: RGBA): string;
        function convertHSLA(value: RGBA): HSLA;
        function convertRGBA(value: HSLA): RGBA;
        function formatRGBA(value: RGBA): string;
        function formatHSLA(value: HSLA): string;
    }

    namespace client {
        const enum PLATFORM {
            WINDOWS = 2,
            MAC = 4
        }
        const enum USER_AGENT {
            CHROME = 2,
            SAFARI = 4,
            FIREFOX = 8,
            EDGE = 16
        }

        function isPlatform(value: string | number): boolean;
        function isUserAgent(value: string | number): boolean;
        function isWinEdge(): boolean;
        function getDeviceDPI(): number;
    }

    namespace css {
        type KeyframesData = ObjectMap<StringMap>;
        
        interface FontFaceData {
            fontFamily: string;
            fontWeight: number;
            fontStyle: string;
            srcFormat: string;
            srcUrl?: string;
            srcLocal?: string;
        }
        interface BackgroundPositionOptions {
            fontSize?: number;
            imageDimension?: Dimension;
            imageSize?: string;
            screenDimension?: Dimension;
        }
        interface CalculateVarOptions {
            attr?: string;
            boundingSize?: number;
            parent?: boolean;
            fontSize?: number;
        }

        const BOX_POSITION: string[];
        const BOX_MARGIN: string[];
        const BOX_BORDER: string[][];
        const BOX_PADDING: string[];
        const TEXT_STYLE: string[];

        function getStyle(element: Null<Element>, pseudoElt?: string): CSSStyleDeclaration;
        function getFontSize(element: Null<Element>): number;
        function hasComputedStyle(element: Element): element is HTMLElement;
        function checkStyleValue(element: HTMLElement, attr: string, value: string, style?: CSSStyleDeclaration): string;
        function parseSelectorText(value: string): string;
        function getSpecificity(value: string): number;
        function getKeyframeRules(): ObjectMap<KeyframesData>;
        function parseKeyframeRule(rules: CSSRuleList): KeyframesData;
        function validMediaRule(value: string, fontSize?: number): boolean;
        function isParentStyle(element: Element, attr: string, ...styles: string[]): boolean;
        function getInheritedStyle(element: Element, attr: string, exclude?: RegExp, ...tagNames: string[]): string;
        function parseVar(element: HTMLElement | SVGElement, value: string): Undef<string>;
        function calculateVar(element: HTMLElement | SVGElement, value: string, options?: CalculateVarOptions): number;
        function getBackgroundPosition(value: string, dimension: Dimension, options?: BackgroundPositionOptions): BoxRectPosition;
        function getSrcSet(element: HTMLImageElement, mimeType?: string[]): ImageSrcSet[];
        function convertListStyle(name: string, value: number, valueAsDefault?: boolean): string;
        function resolveURL(value: string): string;
        function insertStyleSheetRule(value: string, index?: number): HTMLStyleElement;
        function convertAngle(value: string, unit?: string): number;
        function convertPX(value: string, fontSize?: number): string;
        function calculate(value: string, dimension?: number, fontSize?: number): number;
        function parseUnit(value: string, fontSize?: number, screenDimension?: Dimension): number;
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
        const ELEMENT_BLOCK: string[];

        function newBoxRect(): BoxRect;
        function newBoxRectDimension(): BoxRectDimension;
        function newBoxModel(): BoxModel;
        function withinViewport(rect: DOMRect | ClientRect): boolean;
        function assignRect(rect: DOMRect | ClientRect | BoxRectDimension, scrollPosition?: boolean): BoxRectDimension;
        function getRangeClientRect(element: Element): BoxRectDimension;
        function removeElementsByClassName(className: string): void;
        function getElementsBetweenSiblings(elementStart: Null<Element>, elementEnd: Element): Undef<Element[]>;
        function getNamedItem(element: Element, attr: string): string;
        function createElement(parent: HTMLElement, tagName: string, attrs: StringMap): HTMLElement;
        function measureTextWidth(value: string, fontFamily: string, fontSize: number): number;
        function isTextNode(element: Element): boolean;
    }

    namespace math {
        function minArray(list: number[]): number;
        function maxArray(list: number[]): number;
        function convertRadian(value: number): number;
        function equal(a: number, b: number, precision?: number): boolean;
        function moreEqual(a: number, b: number, precision?: number): boolean;
        function lessEqual(a: number, b: number, precision?: number): boolean;
        function truncate(value: number | string, precision?: number): string;
        function truncateTrailingZero(value: string): string;
        function truncateFraction(value: number): number;
        function truncateString(value: string, precision?: number): string;
        function triangulate(a: number, b: number, clen: number): [number, number];
        function absoluteAngle(start: Point, end: Point): number;
        function relativeAngle(start: Point, end: Point, orientation?: number): number;
        function offsetAngleX(angle: number, value: number): number;
        function offsetAngleY(angle: number, value: number): number;
        function clamp(value: number, min?: number, max?: number): number;
        function multipleOf(values: number[], min?: number, offset?: number[]): number;
        function sin(value: number, accuracy?: number): number;
        function cos(value: number, accuracy?: number): number;
        function tan(value: number, accuracy?: number): number;
        function factorial(value: number): number;
        function hypotenuse(a: number, b: number): number;
    }

    namespace regex {
        const STRING: {
            DECIMAL: string;
            PERCENT: string;
            LENGTH: string;
            LENGTH_PERCENTAGE: string;
            DATAURI: string;
            CSS_SELECTOR_LABEL: string;
            CSS_SELECTOR_PSEUDO_ELEMENT: string;
            CSS_SELECTOR_PSEUDO_CLASS: string;
            CSS_SELECTOR_ATTR: string;
            CSS_ANGLE: string;
            CSS_CALC: string;
        };
        const UNIT: {
            DECIMAL: RegExp;
            LENGTH: RegExp;
            PERCENT: RegExp;
        };
        const FILE: {
            SVG: RegExp;
        };
        const CSS: {
            PX: RegExp;
            ANGLE: RegExp;
            CALC: RegExp;
            VAR: RegExp;
            URL: RegExp;
            CUSTOM_PROPERTY: RegExp;
            HEX: RegExp;
            RGBA: RegExp;
            HSLA: RegExp;
            SELECTOR_G: RegExp;
            SELECTOR_LABEL: RegExp;
            SELECTOR_PSEUDO_ELEMENT: RegExp;
            SELECTOR_PSEUDO_CLASS: RegExp;
            SELECTOR_ATTR: RegExp;
        };
        const XML: {
            ATTRIBUTE: RegExp;
            ENTITY: RegExp;
            SEPARATOR: RegExp;
            DELIMITER: RegExp;
            BREAKWORD_G: RegExp;
            NONWORD_G: RegExp;
            TAGNAME_G: RegExp;
        };
        const CHAR: {
            SPACE: RegExp;
            LEADINGSPACE: RegExp;
            TRAILINGSPACE: RegExp;
            TRAILINGZERO: RegExp;
            LEADINGNEWLINE: RegExp;
            LEADINGNUMBER: RegExp;
            LOWERCASE: RegExp;
            WORD: RegExp;
            UNITZERO: RegExp;
            WORDDASH: RegExp;
        };
        const COMPONENT: {
            PROTOCOL: RegExp;
        };
        const ESCAPE: {
            ENTITY: RegExp;
            NONENTITY: RegExp;
        };
    }

    namespace session {
        function actualClientRect(element: Element, sessionId?: string): ClientRect;
        function actualTextRangeRect(element: Element, sessionId?: string): BoxRectDimension;
        function getPseudoElt(element: Element, sessionId?: string): string;
        function getStyleValue(element: Element, attr: string, sessionId?: string): string;
        function getElementAsNode<T>(element: Element, sessionId?: string): Null<T>;
        function setElementCache(element: Element, attr: string, sessionId: string, data: any): void;
        function getElementCache(element: Element, attr: string, sessionId?: string): any;
        function deleteElementCache(element: Element, attr: string, sessionId: string): void;
    }

    namespace util {
        type DelimitStringOptions = {
            value: string;
            delimiter?: string;
            remove?: boolean;
            sort?: boolean;
            not?: string[];
        }

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
        function delimitString(options: DelimitStringOptions, ...appending: string[]): string;
        function hasBit(value: number, offset: number): boolean;
        function isNumber(value: any): boolean;
        function isString(value: any): value is string;
        function isArray<T>(value: any): value is Array<T>;
        function isObject(value: any): value is {};
        function isPlainObject(value: any): value is {};
        function isEqual(source: any, other: any): boolean;
        function includes(source: Undef<string>, value: string, delimiter?: RegExp): boolean;
        function cloneInstance<T>(value: T): T;
        function cloneArray(data: any[], result?: any[], object?: boolean): any[];
        function cloneObject(data: {}, result?: {}, array?: boolean): {};
        function resolvePath(value: string, href?: string): string;
        function trimBoth(value: string, char: string): string;
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
        function findSet<T>(list: Set<T>, predicate: IteratorPredicate<T, boolean, Set<T>>): Undef<T>;
        function sortNumber(values: number[], ascending?: boolean): number[];
        function safeNestedArray<T>(list: T[][] | ObjectMap<T[]>, index: number | string): T[];
        function safeNestedMap<T>(map: ObjectMapNested<T>, index: number | string): ObjectMap<T>;
        function sortArray<T>(list: T[], ascending: boolean, ...attrs: string[]): T[];
        function flatArray<T>(list: any[]): T[];
        function flatMultiArray<T>(list: any[]): T[];
        function spliceArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback?: IteratorPredicate<T, void>): T[];
        function replaceMap<T, U>(list: any[], predicate: IteratorPredicate<T, U>): U[];
        function partitionArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, boolean>): [T[], T[]];
        function sameArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, any>): boolean;
        function iterateArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, void | boolean>, start?: number, end?: number): number;
        function iterateReverseArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, void | boolean>, start?: number, end?: number): number;
        function flatMap<T, U>(list: ArrayLike<T>, predicate: IteratorPredicate<T, U>): U[];
        function filterMap<T, U>(list: ArrayLike<T>, predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, U>): U[];
        function objectMap<T, U>(list: ArrayLike<T>, predicate: IteratorPredicate<T, U>): U[];
        function joinMap<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, string>, char?: string, trailing?: boolean): string;
        function captureMap<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, any>): void;
    }

    namespace xml {
        const STRING_XMLENCODING: string;
        const STRING_SPACE: string;
        const STRING_TABSPACE: string;

        function isPlainText(value: string): string;
        function pushIndent(value: string, depth: number, char?: string, indent?: string): string;
        function pushIndentArray(values: string[], depth: number, char?: string, separator?: string): string;
        function replaceIndent(value: string, depth: number, pattern: RegExp): string;
        function replaceTab(value: string, spaces?: number, preserve?: boolean): string;
        function applyTemplate(tagName: string, template: StandardMap, children: StandardMap[], depth?: number): string;
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
        rotateAngle?: number;
        transformed?: SvgTransform[];
        transformResidual?: SvgTransform[][];
        readonly transforms: SvgTransform[];
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
        verifyBaseValue(attr: string, value?: any): Undef<boolean>;
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
        public static getPathPoints(values: SvgPathCommand[]): SvgPoint[];
        public static syncPathPoints(values: SvgPathCommand[], points: SvgPoint[], transformed?: boolean): SvgPathCommand[];
        public static clonePoints(values: SvgPoint[] | SVGPointList): SvgPoint[];
        public static minMaxPoints(values: SvgPoint[]): [number, number, number, number];
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
        baseValue: string;
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
        replaceValue?: string;
        id?: number;
        companion?: NumberValue<SvgAnimation>;
        readonly element: Null<SVGGraphicsElement>;
        readonly animationElement: Null<SVGAnimationElement>;
        readonly instanceType: number;
        readonly fillReplace: boolean;
        readonly dataset: ObjectMapNested<any>;
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
        timingFunction: string;
        reverse: boolean;
        alternate: boolean;
        additiveSum: boolean;
        accumulateSum: boolean;
        length: number;
        keySplines?: string[];
        by?: number;
        end?: number;
        synchronized?: NumberValue;
        readonly animationElement: Null<SVGAnimateElement>;
        readonly playable: boolean;
        readonly valueTo: string;
        readonly valueFrom: string;
        readonly fromToType: boolean;
        readonly evaluateStart: boolean;
        readonly evaluateEnd: boolean;
        setCalcMode(attributeName?: string, mode?: string): void;
        convertToValues(keyTimes?: number[]): void;
        setGroupOrdering(value: SvgAnimationAttribute[]): void;
        getIntervalEndTime(leadTime: number, complete?: boolean): number;
        getTotalDuration(minimum?: boolean): number;
    }

    interface SvgAnimateTransform extends SvgAnimate {
        transformFrom?: string;
        transformOrigin?: Point[];
        readonly animationElement: Null<SVGAnimateTransformElement>;
        setType(value: string): void;
        expandToValues(): void;
    }

    interface SvgAnimateMotion extends SvgAnimateTransform {
        motionPathElement: Null<SVGGeometryElement>;
        path: string;
        distance: string;
        rotate: string;
        rotateData?: NumberValue[];
        framesPerSecond?: number;
        readonly animationElement: Null<SVGAnimateMotionElement>;
        readonly keyPoints: number[];
        readonly offsetLength: number;
        readonly offsetPath?: SvgOffsetPath[];
        readonly rotateValues?: number[];
        addKeyPoint(item: NumberValue): void;
    }

    interface SvgAnimationIntervalMap {
        map: SvgAnimationIntervalAttributeMap;
        has(attr: string): boolean;
        get(attr: string, time: number, playing?: boolean): Undef<string>;
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
        public static convertTimingFunction(value: string): string;
        public static convertStepTimingFunction(attributeName: string, keyTimes: number[], values: string[], keySpline: string, index: number, fontSize?: number): Undef<[number[], string[]]>;
        public static toFractionList(value: string, delimiter?: string, ordered?: boolean): number[];
        constructor(element?: SVGGraphicsElement, animationElement?: SVGAnimateElement);
    }

    class SvgAnimateTransform implements SvgAnimateTransform {
        public static toRotateList(values: string[]): Undef<number[][]>;
        public static toScaleList(values: string[]): Undef<number[][]>;
        public static toTranslateList(values: string[]): Undef<number[][]>;
        public static toSkewList(values: string[]): Undef<number[][]>;
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
        extendLength(data: SvgPathExtendData, precision?: number): Undef<SvgPathExtendData>;
        flattenStrokeDash(valueArray: number[], valueOffset: number, totalLength: number, pathLength?: number): SvgPathExtendData;
        extractStrokeDash(animations?: SvgAnimation[], precision?: number): [Undef<SvgAnimation[]>, Undef<SvgStrokeDash[]>, string, string];
    }

    class SvgPath implements SvgPath {
        public static transform(value: string, transforms: SvgTransform[], element?: SVGGeometryElement, precision?: number): string;
        public static extrapolate(attr: string, value: string, values: string[], transforms?: SvgTransform[], companion?: SvgShape, precision?: number): Undef<string[]>;
        constructor(element: SVGGeometryElement);
    }

    namespace lib {
        namespace constant {
            const enum INSTANCE_TYPE {
                SVG_CONTAINER = 2,
                SVG_ELEMENT = 4,
                SVG_ANIMATION = 8,
                SVG = 2 | 16,
                SVG_G = 2 | 32,
                SVG_USE_SYMBOL = 2 | 64,
                SVG_PATTERN = 2 | 128,
                SVG_SHAPE_PATTERN = 2 | 256,
                SVG_USE_PATTERN = 2 | 512,
                SVG_PATH = 4 | 1024,
                SVG_SHAPE = 4 | 2048,
                SVG_IMAGE = 4 | 4096,
                SVG_USE = 4 | 2048 | 8192,
                SVG_ANIMATE = 8 | 16384,
                SVG_ANIMATE_TRANSFORM = 8 | 16384 | 32768,
                SVG_ANIMATE_MOTION = 8 | 16384 | 65536 | 49160
            }
            const enum SYNCHRONIZE_MODE {
                FROMTO_ANIMATE = 2,
                KEYTIME_ANIMATE = 4,
                IGNORE_ANIMATE = 8,
                FROMTO_TRANSFORM = 16,
                KEYTIME_TRANSFORM = 32,
                IGNORE_TRANSFORM = 64
            }
            const enum SYNCHRONIZE_STATE {
                BACKWARDS = 2,
                INTERRUPTED = 4,
                RESUME = 8,
                COMPLETE = 16,
                EQUAL_TIME = 32,
                INVALID = 64
            }
            const enum FILL_MODE {
                FREEZE = 2,
                FORWARDS = 4,
                BACKWARDS = 8
            }
            const enum REGION_UNIT {
                USER_SPACE_ON_USE = 1,
                OBJECT_BOUNDING_BOX = 2
            }

            const KEYSPLINE_NAME: {
                'ease': string;
                'ease-in': string;
                'ease-in-out': string;
                'ease-out': string;
                'linear': string;
                'step-start': string;
                'step-end': string;
            };

            const STRING_CUBICBEZIER: string;
        }

        namespace util {
            const MATRIX: {
                applyX(matrix: SvgMatrix | DOMMatrix, x: number, y: number): number;
                applyY(matrix: SvgMatrix | DOMMatrix, x: number, y: number): number;
                clone(matrix: SvgMatrix | DOMMatrix): SvgMatrix;
                rotate(angle: number): SvgMatrix;
                skew(x?: number, y?: number): SvgMatrix;
                scale(x?: number, y?: number): SvgMatrix;
                translate(x?: number, y?: number): SvgMatrix;
            };
            const TRANSFORM: {
                create(type: number, matrix: SvgMatrix | DOMMatrix, angle?: number, x?: boolean, y?: boolean): SvgTransform;
                parse(element: SVGElement, value?: string): Undef<SvgTransform[]>;
                matrix(element: SVGElement, value?: string): Undef<SvgMatrix>;
                origin(element: SVGElement, value?: string): Point;
                rotateOrigin(element: SVGElement, attr?: string): SvgPoint[];
                typeAsName(type: number): string;
                typeAsValue(type: string | number): string;
            };
            const SVG: {
                svg(element: Element): element is SVGSVGElement;
                g(element: Element): element is SVGGElement;
                symbol(element: Element): element is SVGSymbolElement;
                path(element: Element): element is SVGPathElement;
                shape(element: Element): element is SVGGeometryElement;
                image(element: Element): element is SVGImageElement;
                use(element: Element): element is SVGUseElement;
                line(element: Element): element is SVGLineElement;
                rect(element: Element): element is SVGRectElement;
                circle(element: Element): element is SVGCircleElement;
                ellipse(element: Element): element is SVGEllipseElement;
                polygon(element: Element): element is SVGPolygonElement;
                polyline(element: Element): element is SVGPolylineElement;
                clipPath(element: Element): element is SVGClipPathElement;
                pattern(element: Element): element is SVGPatternElement;
                linearGradient(element: Element): element is SVGLinearGradientElement;
                radialGradient(element: Element): element is SVGRadialGradientElement;
            };

            function createPath(value: string): SVGPathElement;
            function getAttribute(element: SVGElement, attr: string, computed?: boolean): string;
            function getParentAttribute(element: SVGElement, attr: string, computed?: boolean): string;
            function getAttributeURL(value: string): string;
            function getDOMRect(element: SVGElement): DOMRect;
            function getTargetElement(element: SVGElement, rootElement?: Null<HTMLElement | SVGElement>): Null<SVGElement>;
            function getNearestViewBox(element: SVGElement): Undef<DOMRect>;
            function getPathLength(value: string): string;
        }
    }
}

export as namespace squared;