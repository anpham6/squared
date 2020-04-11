import { AppHandler, AppProcessing, AppProcessingUI, AppSession, AppSessionUI, AppViewModel } from './internal';
import { ControllerSettings, ControllerUISettings, ExtensionDependency, ExtensionResult, FileActionOptions, FileArchivingOptions, FileCopyingOptions, LayoutOptions, LayoutResult, LayoutRoot, LayoutType, NodeGroupUIOptions, NodeTemplate, NodeUIOptions, UserSettings, UserUISettings } from './application';
import { AutoMargin, AscendOptions, BoxOptions, BoxType, ExcludeUIOptions, HasOptions, HideUIOptions, InitialData, LinearDataUI, LocalSettingsUI, SiblingOptions, SupportUI, TranslateUIOptions, VisibleStyle } from './node';
import { ResourceAssetMap, ResourceStoredMap } from './resource';
import { Asset, FileAsset, ImageAsset, RawAsset } from './file';

import { CssGridData, CssGridDirectionData, GridCellData } from './extension';

import { FontFaceData, FormatOrAll } from '../lib/squared';

declare interface FileActions {
    copyToDisk(directory: string, options?: FileActionOptions): void;
    appendToArchive(pathname: string, options?: FileActionOptions): void;
    saveToArchive(filename?: string, options?: FileActionOptions): void;
    createFrom(format: string, options: FileActionOptions): void;
    appendFromArchive(filename: string, options: FileActionOptions): void;
}

declare class Application<T extends Node> implements FileActions {
    framework: number;
    userSettings: UserSettings;
    initializing: boolean;
    closed: boolean;
    viewModel: Undef<AppViewModel>;
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
    readonly rootElements: Set<HTMLElement>;
    readonly nextId: number;
    readonly length: number;
    reset(): void;
    parseDocument(...elements: (string | HTMLElement)[]): PromiseObject;
    parseDocumentAsync(...elements: (string | HTMLElement)[]): Promise<PromiseObject>;
    createCache(documentRoot: HTMLElement): boolean;
    createNode(options: {}): T;
    insertNode(element: Element, parent?: T, pseudoElt?: string): Undef<T>;
    afterCreateCache(element: HTMLElement): void;
    copyToDisk(directory: string, options?: FileCopyingOptions): void;
    appendToArchive(pathname: string, options?: FileCopyingOptions): void;
    saveToArchive(filename?: string, options?: FileArchivingOptions): void;
    createFrom(format: string, options: FileArchivingOptions): void;
    appendFromArchive(filename: string, options: FileArchivingOptions): void;
    finalize(): void;
    toString(): string;
    constructor(
        framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<Controller<T>>,
        ResourceConstructor: Constructor<Resource<T>>,
        ExtensionManagerConstructor: Constructor<ExtensionManager<T>>
    );
}

declare class ApplicationUI<T extends NodeUI> extends Application<T> {
    userSettings: UserUISettings;
    readonly session: AppSessionUI<T>;
    readonly processing: AppProcessingUI<T>;
    readonly builtInExtensions: ObjectMap<ExtensionUI<T>>;
    readonly controllerHandler: ControllerUI<T>;
    readonly resourceHandler: ResourceUI<T>;
    readonly fileHandler: Undef<FileUI<T>>;
    readonly extensions: ExtensionUI<T>[];
    readonly extensionsTraverse: ExtensionUI<T>[];
    readonly layouts: FileAsset[];
    readonly clearMap: Map<T, string>;
    conditionElement(element: HTMLElement, pseudoElt?: string): boolean;
    useElement(element: HTMLElement): boolean;
    createNode(options: NodeUIOptions<T>): T;
    renderNode(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
    resolveTarget(target: Undef<string>): Undef<T>;
    addLayout(layout: LayoutUI<T>): void;
    addLayoutTemplate(parent: T, node: T, template: Undef<NodeTemplate<T>>, index?: number): void;
    saveDocument(filename: string, content: string, pathname?: string, index?: number): void;
    constructor(
        framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<ControllerUI<T>>,
        ResourceConstructor: Constructor<ResourceUI<T>>,
        ExtensionManagerConstructor: Constructor<ExtensionManager<T>>
    );
}

declare class Controller<T extends Node> implements AppHandler<T> {
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

declare class ControllerUI<T extends NodeUI> extends Controller<T> {
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

declare class Resource<T extends Node> implements Resource<T> {
    public static ASSETS: ResourceAssetMap;
    public static canCompressImage(filename: string): boolean;
    controllerSettings: ControllerSettings;
    fileHandler?: File<T>;
    readonly application: Application<T>;
    readonly cache: NodeList<T>;
    readonly userSettings: UserSettings;
    readonly mimeTypeMap: ObjectMap<FormatOrAll>;
    readonly fileSeparator?: string;
    reset(): void;
    addImage(element: Undef<HTMLImageElement>): void;
    getImage(uri: string): Undef<ImageAsset>;
    addFont(data: FontFaceData): void;
    getFont(fontFamily: string, fontStyle?: string, fontWeight?: string): Undef<FontFaceData>;
    addVideo(uri: string, mimeType?: string): void;
    getVideo(uri: string): Undef<Asset>;
    addAudio(uri: string, mimeType?: string): void;
    getAudio(uri: string): Undef<Asset>;
    addRawData(uri: string, mimeType: string, encoding: string, content: string): string;
    getRawData(uri: string): Undef<RawAsset>;
    setFileHandler(instance: File<T>): void;
}

declare class ResourceUI<T extends NodeUI> extends Resource<T> {
    public static KEY_NAME: string;
    public static STORED: ResourceStoredMap;
    public static canCompressImage(filename: string): boolean;
    public static generateId(section: string, name: string, start?: number): string;
    public static insertStoredAsset(asset: string, name: string, value: any): string;
    public static getOptionArray(element: HTMLSelectElement | HTMLOptGroupElement, showDisabled?: boolean): Undef<string[]>[];
    public static isBackgroundVisible(object: Undef<BoxStyle>): boolean;
    public static parseBackgroundImage(node: NodeUI, value: string, screenDimension?: Dimension): Undef<string | Gradient>[];
    public static getBackgroundSize<T extends NodeUI>(node: T, value: string, screenDimension?: Dimension): Undef<Dimension>;
    public static isInheritedStyle<T extends NodeUI>(node: T, attr: string): boolean;
    public static hasLineBreak<T extends NodeUI>(node: T, lineBreak?: boolean, trim?: boolean): boolean;
    public static checkPreIndent(node: NodeUI): Undef<[string, NodeUI]>;
    controllerSettings: ControllerUISettings;
    readonly userSettings: UserUISettings;
    finalize(layouts: FileAsset[]): void;
    writeRawImage(filename: string, base64: string): Undef<Partial<RawAsset>>;
    setBoxStyle(node: T): void;
    setFontStyle(node: T): void;
    setValueString(node: T): void;
}

declare class Extension<T extends Node> {
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
    constructor(name: string, framework: number, options?: StandardMap);
}

declare class ExtensionUI<T extends NodeUI> extends Extension<T> {
    public static findNestedElement(element: Null<Element>, name: string): Null<HTMLElement>;
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
    beforeCascade(documentRoot: LayoutRoot<T>[]): void;
    afterFinalize(): void;
    constructor(name: string, framework: number, options?: StandardMap, tagNames?: string[]);
}

declare class ExtensionManager<T extends Node> {
    readonly application: Application<T>;
    readonly extensions: Extension<T>[];
    include(ext: Extension<T>): boolean;
    exclude(ext: Extension<T>): boolean;
    retrieve(name: string): Null<Extension<T>>;
    optionValue(name: string, attr: string): any;
    optionValueAsObject(name: string, attr: string): Null<{}>;
    optionValueAsString(name: string, attr: string): string;
    optionValueAsNumber(name: string, attr: string): number;
    optionValueAsBoolean(name: string, attr: string): boolean;
}

declare class File<T extends Node> implements FileActions {
    public static downloadFile(data: Blob, filename: string, mimeType?: string): void;
    resource: Resource<T>;
    readonly userSettings: UserSettings;
    readonly assets: FileAsset[];
    addAsset(data: Partial<RawAsset>): void;
    reset(): void;
    copyToDisk(directory: string, options?: FileCopyingOptions): void;
    appendToArchive(pathname: string, options?: FileCopyingOptions): void;
    saveToArchive(filename: string, options?: FileArchivingOptions): void;
    createFrom(format: string, options: FileArchivingOptions): void;
    appendFromArchive(filename: string, options: FileArchivingOptions): void;
    copying(options: FileCopyingOptions): void;
    archiving(options: FileArchivingOptions): void;
}

declare class FileUI<T extends NodeUI> extends File<T> {
    resource: ResourceUI<T>;
    readonly userSettings: UserUISettings;
    readonly directory: { string: string; image: string; video: string; audio: string; font: string };
}

declare class LayoutUI<T extends NodeUI> extends squared.lib.base.Container<T> implements LayoutType {
    public static create<T extends NodeUI>(options: LayoutOptions<T>): LayoutUI<T>;
    parent: T;
    node: T;
    containerType: number;
    alignmentType: number;
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
    constructor(parent: T, node: T, containerType?: number, alignmentType?: number, children?: T[]);
}

declare class Node extends squared.lib.base.Container<Node> implements BoxModel {
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
    readonly positionStatic: boolean;
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
    readonly inline: boolean;
    readonly inlineStatic: boolean;
    readonly inlineVertical: boolean;
    readonly inlineDimension: boolean;
    readonly plainText: boolean;
    readonly styleText: boolean;
    readonly textContent: string;
    readonly textBounds: Null<BoxRectDimension>;
    readonly lineBreak: boolean;
    readonly block: boolean;
    readonly blockStatic: boolean;
    readonly blockVertical: boolean;
    readonly blockDimension: boolean;
    readonly pageFlow: boolean;
    readonly inlineFlow: boolean;
    readonly autoMargin: AutoMargin;
    readonly floating: boolean;
    readonly float: string;
    readonly baseline: boolean;
    readonly multiline: boolean;
    readonly contentBox: boolean;
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
    parseUnit(value: string, dimension?: DimensionAttr, parent?: boolean, screenDimension?: Dimension): number;
    has(attr: string, options?: HasOptions): boolean;
    hasPX(attr: string, percent?: boolean, initial?: boolean): boolean;
    hasFlex(direction: "row" | "column"): boolean;
    setBounds(cache?: boolean): Undef<BoxRectDimension>;
    querySelector(value: string): Null<Node>;
    querySelectorAll(value: string, resultCount?: number): Node[];
    constructor(id: number, sessionId?: string, element?: Element);
}

declare class NodeUI extends Node implements LayoutType {
    public static refitScreen<T>(node: T, value: Dimension): Dimension;
    public static linearData<T>(list: T[], cleared?: Map<T, string>): LinearDataUI<T>;
    public static outerRegion<T>(node: T): BoxRectDimension;
    public static baseline<T>(list: T[], text?: boolean): Null<T>;
    public static partitionRows<T>(list: T[], cleared?: Map<T, string>): T[][];
    alignmentType: number;
    containerType: number;
    containerName: string;
    containerIndex: number;
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
    naturalChild: boolean;
    lineBreakLeading: boolean;
    lineBreakTrailing: boolean;
    siblingsLeading: NodeUI[];
    siblingsTrailing: NodeUI[];
    floatContainer: boolean;
    localSettings: LocalSettingsUI;
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
    removeTry(replacement?: NodeUI, beforeReplace?: FunctionVoid): boolean;
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
    constructor(id: number, sessionId?: string, element?: Element);
}

declare class NodeGroupUI extends NodeUI {}

declare class NodeList<T extends Node> extends squared.lib.base.Container<T> {
    readonly nextId: number;
    afterAppend?: (node: T, cascade?: boolean) => void;
    append(node: T, delegate?: boolean, cascade?: boolean): this;
    reset(): void;
    constructor(children?: T[]);
}

declare namespace extensions {
    class Accessibility<T extends NodeUI> extends ExtensionUI<T> {}
    class Column<T extends NodeUI> extends ExtensionUI<T> {}
    class CssGrid<T extends NodeUI> extends ExtensionUI<T> {
        public static isFr(value: string): boolean;
        public static isPx(value: string): boolean;
        public static isAligned(node: NodeUI): boolean;
        public static isJustified(node: NodeUI): boolean;
        public static createDataAttribute(alignItems: string, alignContent: string, justifyItems: string, justifyContent: string, autoFlow: string): CssGridData<NodeUI>;
        public static createDataRowAttribute(): CssGridDirectionData;
    }
    class Flexbox<T extends NodeUI> extends ExtensionUI<T> {}
    class Grid<T extends NodeUI> extends ExtensionUI<T> {
        public static createDataCellAttribute(): GridCellData<NodeUI>;
    }
    class List<T extends NodeUI> extends ExtensionUI<T> {}
    class Relative<T extends NodeUI> extends ExtensionUI<T> {}
    class Sprite<T extends NodeUI> extends ExtensionUI<T> {}
    class Table<T extends NodeUI> extends ExtensionUI<T> {}
    class VerticalAlign<T extends NodeUI> extends ExtensionUI<T> {}
    class WhiteSpace<T extends NodeUI> extends ExtensionUI<T> {}
}

declare namespace lib {
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