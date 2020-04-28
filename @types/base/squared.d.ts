import { AppHandler, AppProcessing, AppSession, AppViewModel } from './internal';
import { ControllerSettings, CreateNodeOptions, CreateNodeGroupOptions, ExtensionDependency, ExtensionResult, FileActionOptions, FileArchivingOptions, FileCopyingOptions, LayoutOptions, LayoutResult, LayoutRoot, LayoutType, NodeTemplate, UserSettings } from './application';
import { AutoMargin, AscendOptions, BoxOptions, BoxType, HasOptions, InitialData, SiblingOptions, VisibleStyle } from './node';
import { ResourceAssetMap, ResourceStoredMap } from './resource';
import { Asset, FileAsset, ImageAsset, RawAsset, ResultOfFileAction } from './file';
import { CssGridData, CssGridDirectionData, GridCellData } from './extension';

import { AppProcessing as AppProcessingUI, AppSession as AppSessionUI } from './internal-ui';
import { ControllerSettings as ControllerUISettings, UserSettings as UserUISettings } from './application-ui';
import { HideOptions, ExcludeOptions, LinearData, LocalSettings, RemoveTryOptions, ReplaceTryOptions, Support, TranslateOptions } from './node-ui';

import { FontFaceData, MIMEOrAll } from '../lib/data';

declare interface FileActionAsync {
    copyToDisk(directory: string, options?: FileActionOptions): Promise<ResultOfFileAction | void>;
    appendToArchive(pathname: string, options?: FileActionOptions): Promise<ResultOfFileAction | void>;
    saveToArchive(filename?: string, options?: FileActionOptions): Promise<ResultOfFileAction | void>;
    createFrom(format: string, options: FileActionOptions): Promise<ResultOfFileAction | void>;
    appendFromArchive(filename: string, options: FileActionOptions): Promise<ResultOfFileAction | void>;
}

declare class Application<T extends Node> implements FileActionAsync {
    public static KEY_NAME: string;
    userSettings: UserSettings;
    initializing: boolean;
    closed: boolean;
    systemName: string;
    readonly framework: number;
    readonly session: AppSession<T>;
    readonly processing: AppProcessing<T>;
    readonly builtInExtensions: ObjectMap<Extension<T>>;
    readonly extensions: Extension<T>[];
    readonly rootElements: Set<HTMLElement>;
    readonly Node: Constructor<T>;
    reset(): void;
    parseDocument(...elements: (string | HTMLElement)[]): Promise<T[]>;
    createCache(documentRoot: HTMLElement): Undef<T>;
    setStyleMap(cacheAssets: boolean): void;
    createNode(options: {}): T;
    insertNode(element: Element, parent?: T, pseudoElt?: string): Undef<T>;
    afterCreateCache(node: T): void;
    getDatasetName(attr: string, element: HTMLElement): Undef<string>;
    setDatasetName(attr: string, element: HTMLElement, value: string): void;
    finalize(): void;
    toString(): string;
    copyToDisk(directory: string, options?: FileCopyingOptions): Promise<ResultOfFileAction | void>;
    appendToArchive(pathname: string, options?: FileCopyingOptions): Promise<ResultOfFileAction | void>;
    saveToArchive(filename?: string, options?: FileArchivingOptions): Promise<ResultOfFileAction | void>;
    createFrom(format: string, options: FileArchivingOptions): Promise<ResultOfFileAction | void>;
    appendFromArchive(filename: string, options: FileArchivingOptions): Promise<ResultOfFileAction | void>;
    set viewModel(data: Undef<AppViewModel>);
    get viewModel(): Undef<AppViewModel>;
    get controllerHandler(): Controller<T>;
    get resourceHandler(): Resource<T>;
    get fileHandler(): Undef<File<T>>;
    get extensionManager(): ExtensionManager<T>;
    get extensionsCascade(): Extension<T>[];
    get nextId(): number;
    get length(): number;
    constructor(
        framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<Controller<T>>,
        ResourceConstructor: Constructor<Resource<T>>,
        ExtensionManagerConstructor?: Constructor<ExtensionManager<T>>
    );
}

declare class ApplicationUI<T extends NodeUI> extends Application<T> {
    userSettings: UserUISettings;
    readonly session: AppSessionUI<T>;
    readonly processing: AppProcessingUI<T>;
    readonly builtInExtensions: ObjectMap<ExtensionUI<T>>;
    readonly extensions: ExtensionUI<T>[];
    conditionElement(element: HTMLElement, pseudoElt?: string): boolean;
    useElement(element: HTMLElement): boolean;
    createNode(options: CreateNodeOptions<T>): T;
    renderNode(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
    addLayout(layout: LayoutUI<T>): void;
    addLayoutTemplate(parent: T, node: T, template: Undef<NodeTemplate<T>>, index?: number): void;
    saveDocument(filename: string, content: string, pathname?: string, index?: number): void;
    get controllerHandler(): ControllerUI<T>;
    get resourceHandler(): ResourceUI<T>;
    get fileHandler(): Undef<FileUI<T>>;
    get layouts(): FileAsset[];
    get clearMap(): Map<T, string>;
    get extensionsTraverse(): ExtensionUI<T>[];
    constructor(
        framework: number,
        nodeConstructor: Constructor<T>,
        ControllerConstructor: Constructor<ControllerUI<T>>,
        ResourceConstructor: Constructor<ResourceUI<T>>,
        ExtensionManagerConstructor?: Constructor<ExtensionManager<T>>
    );
}

declare class Controller<T extends Node> implements AppHandler<T> {
    sessionId: string;
    readonly application: Application<T>;
    readonly cache: NodeList<T>;
    readonly localSettings: ControllerSettings;
    init(): void;
    reset(): void;
    includeElement(element: Element): boolean;
    preventNodeCascade(element: Element): boolean;
    applyDefaultStyles(element: Element): void;
    get afterInsertNode(): Undef<BindGeneric<T, void>>;
    get userSettings(): UserSettings;
    get generateSessionId(): string;
}

declare class ControllerUI<T extends NodeUI> extends Controller<T> {
    readonly localSettings: ControllerUISettings;
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
    createNodeGroup(node: T, children: T[], options?: CreateNodeGroupOptions<T>): T;
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
    get userSettings(): UserUISettings;
    get screenDimension(): Dimension;
    get containerTypeHorizontal(): LayoutType;
    get containerTypeVertical(): LayoutType;
    get containerTypeVerticalMargin(): LayoutType;
    get containerTypePercent(): LayoutType;
}

declare class Resource<T extends Node> implements Resource<T> {
    public static KEY_NAME: string;
    public static ASSETS: ResourceAssetMap;
    public static canCompressImage(filename: string): boolean;
    fileHandler?: File<T>;
    readonly application: Application<T>;
    readonly cache: NodeList<T>;
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
    get controllerSettings(): ControllerSettings;
    get userSettings(): UserSettings;
    get mimeTypeMap(): ObjectMap<MIMEOrAll>;
    get randomUUID(): string;
}

declare class ResourceUI<T extends NodeUI> extends Resource<T> {
    public static STORED: ResourceStoredMap;
    public static canCompressImage(filename: string): boolean;
    public static generateId(section: string, name: string, start?: number): string;
    public static insertStoredAsset(asset: string, name: string, value: any): string;
    public static getOptionArray(element: HTMLSelectElement | HTMLOptGroupElement, showDisabled?: boolean): Undef<string[]>[];
    public static isBackgroundVisible(object: Undef<BoxStyle>): boolean;
    public static parseBackgroundImage(node: NodeUI, value: string, screenDimension?: Dimension): Undef<string | Gradient>[];
    public static getBackgroundSize<T extends NodeUI>(node: T, value: string, screenDimension?: Dimension): Undef<Dimension>;
    public static hasLineBreak<T extends NodeUI>(node: T, lineBreak?: boolean, trim?: boolean): boolean;
    public static checkPreIndent(node: NodeUI): Undef<[string, NodeUI]>;
    finalize(layouts: FileAsset[]): void;
    writeRawImage(filename: string, base64: string): Undef<Partial<RawAsset>>;
    setBoxStyle(node: T): void;
    setFontStyle(node: T): void;
    setValueString(node: T): void;
    get controllerSettings(): ControllerUISettings;
    get userSettings(): UserUISettings;
}

declare class Extension<T extends Node> {
    readonly framework: number;
    readonly name: string;
    readonly options: StandardMap;
    readonly dependencies: ExtensionDependency[];
    readonly subscribers: Set<T>;
    require(name: string, preload?: boolean): void;
    beforeParseDocument(): void;
    afterParseDocument(): void;
    set application(value);
    get application(): Application<T>;
    get controller(): Controller<T>;
    constructor(name: string, framework: number, options?: StandardMap);
}

declare class ExtensionUI<T extends NodeUI> extends Extension<T> {
    public static findNestedElement<T extends NodeUI>(node: T, name: string): Null<HTMLElement>;
    tagNames: string[];
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
    set application(value);
    get application(): ApplicationUI<T>;
    get controller(): ControllerUI<T>;
    get resource(): ResourceUI<T>;
    get cache(): NodeList<T>;
    get cacheProcessing(): NodeList<T>;
    constructor(name: string, framework: number, options?: StandardMap, tagNames?: string[]);
}

declare class ExtensionManager<T extends Node> {
    readonly application: Application<T>;
    include(ext: Extension<T>): boolean;
    exclude(ext: Extension<T>): boolean;
    retrieve(name: string): Null<Extension<T>>;
    optionValue(name: string, attr: string): any;
    optionValueAsObject(name: string, attr: string): Null<{}>;
    optionValueAsString(name: string, attr: string): string;
    optionValueAsNumber(name: string, attr: string): number;
    optionValueAsBoolean(name: string, attr: string): boolean;
    get extensions(): Extension<T>[];
}

declare class File<T extends Node> implements FileActionAsync {
    public static downloadFile(data: Blob, filename: string, mimeType?: string): void;
    resource: Resource<T>;
    readonly assets: FileAsset[];
    addAsset(data: Partial<RawAsset>): void;
    reset(): void;
    copying(options: FileCopyingOptions): Promise<ResultOfFileAction | void>;
    archiving(options: FileArchivingOptions): Promise<ResultOfFileAction | void>;
    copyToDisk(directory: string, options?: FileCopyingOptions): Promise<ResultOfFileAction | void>;
    appendToArchive(pathname: string, options?: FileCopyingOptions): Promise<ResultOfFileAction | void>;
    saveToArchive(filename: string, options?: FileArchivingOptions): Promise<ResultOfFileAction | void>;
    createFrom(format: string, options: FileArchivingOptions): Promise<ResultOfFileAction | void>;
    appendFromArchive(filename: string, options: FileArchivingOptions): Promise<ResultOfFileAction | void>;
    get userSettings(): UserSettings;
}

declare class FileUI<T extends NodeUI> extends File<T> {
    resource: ResourceUI<T>;
    get userSettings(): UserUISettings;
    get directory(): { string: string; image: string; video: string; audio: string; font: string };
}

declare class LayoutUI<T extends NodeUI> extends squared.lib.base.Container<T> implements LayoutType {
    public static create<T extends NodeUI>(options: LayoutOptions<T>): LayoutUI<T>;
    parent: T;
    node: T;
    containerType: number;
    alignmentType: number;
    rowCount: number;
    columnCount: number;
    renderType: number;
    renderIndex: number;
    init(): void;
    setContainerType(containerType: number, alignmentType?: number): void;
    hasAlign(value: number): boolean;
    add(value: number): number;
    addRender(value: number): number;
    delete(value: number): number;
    set itemCount(value);
    get itemCount(): number;
    set type(value: LayoutType);
    get linearX(): boolean;
    get linearY(): boolean;
    get floated(): Set<string>;
    get singleRowAligned(): boolean;
    get unknownAligned(): boolean;
    constructor(parent: T, node: T, containerType?: number, alignmentType?: number, children?: T[]);
}

declare class Node extends squared.lib.base.Container<Node> implements BoxModel {
    id: number;
    depth: number;
    childIndex: number;
    documentRoot: boolean;
    style: CSSStyleDeclaration;
    queryMap?: Node[][];
    readonly sessionId: string;
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
    setBounds(cache?: boolean): Undef<BoxRectDimension>;
    resetBounds(): void;
    querySelector(value: string): Null<Node>;
    querySelectorAll(value: string, resultCount?: number): Node[];
    set parent(value);
    get parent(): Null<Node>;
    set actualParent(value);
    get actualParent(): Null<Node>;
    set naturalChildren(value);
    get naturalChildren(): Node[];
    set naturalElements(value);
    get naturalElements(): Node[];
    set dir(value)
    get dir(): string;
    set inlineText(value);
    get inlineText(): boolean;
    set textBounds(value);
    get textBounds(): Null<BoxRectDimension>;
    get initial(): Undef<InitialData<Node>>;
    get box(): BoxRectDimension;
    get bounds(): BoxRectDimension;
    get linear(): BoxRectDimension;
    get element(): Null<Element>;
    get elementId(): string;
    get tagName(): string;
    get naturalChild(): boolean;
    get naturalElement(): boolean;
    get htmlElement(): boolean;
    get styleElement(): boolean;
    get imageElement(): boolean;
    get svgElement(): boolean;
    get flexElement(): boolean;
    get gridElement(): boolean;
    get textElement(): boolean;
    get tableElement(): boolean;
    get inputElement(): boolean;
    get pseudoElement(): boolean;
    get documentBody(): boolean;
    get dataset(): DOMStringMap;
    get centerAligned(): boolean;
    get rightAligned(): boolean;
    get bottomAligned(): boolean;
    get width(): number;
    get height(): number;
    get hasWidth(): boolean;
    get hasHeight(): boolean;
    get lineHeight(): number;
    get display(): string;
    get positionStatic(): boolean;
    get positionRelative(): boolean;
    get top(): number;
    get right(): number;
    get bottom(): number;
    get left(): number;
    get marginTop(): number;
    get marginRight(): number;
    get marginBottom(): number;
    get marginLeft(): number;
    get borderTopWidth(): number;
    get borderRightWidth(): number;
    get borderBottomWidth(): number;
    get borderLeftWidth(): number;
    get paddingTop(): number;
    get paddingRight(): number;
    get paddingBottom(): number;
    get paddingLeft(): number;
    get inline(): boolean;
    get inlineStatic(): boolean;
    get inlineVertical(): boolean;
    get inlineDimension(): boolean;
    get plainText(): boolean;
    get styleText(): boolean;
    get textContent(): string;
    get lineBreak(): boolean;
    get block(): boolean;
    get blockStatic(): boolean;
    get blockVertical(): boolean;
    get blockDimension(): boolean;
    get pageFlow(): boolean;
    get inlineFlow(): boolean;
    get autoMargin(): AutoMargin;
    get floating(): boolean;
    get float(): string;
    get baseline(): boolean;
    get multiline(): boolean;
    get contentBox(): boolean;
    get contentBoxWidth(): number;
    get contentBoxHeight(): number;
    get flexdata(): FlexData;
    get flexbox(): FlexBox;
    get zIndex(): number;
    get backgroundColor(): string;
    get backgroundImage(): string;
    get visibleStyle(): VisibleStyle;
    get fontSize(): number;
    get overflowX(): boolean;
    get overflowY(): boolean;
    get verticalAlign(): string;
    get absoluteParent(): Null<Node>;
    get actualWidth(): number;
    get actualHeight(): number;
    get actualDimension(): Dimension;
    get percentWidth(): number;
    get percentHeight(): number;
    get firstChild(): Null<Node>;
    get lastChild(): Null<Node>;
    get firstStaticChild(): Null<Node>;
    get lastStaticChild(): Null<Node>;
    get previousSibling(): Null<Node>;
    get nextSibling(): Null<Node>;
    get previousElementSibling(): Null<Node>;
    get nextElementSibling(): Null<Node>;
    get attributes(): StringMap;
    get boundingClientRect(): DOMRect;
    get cssStyle(): StringMap;
    get textStyle(): StringMap;
    get center(): Point;
    constructor(id: number, sessionId?: string, element?: Element);
}

declare class NodeUI extends Node implements LayoutType {
    public static refitScreen<T>(node: T, value: Dimension): Dimension;
    public static linearData<T>(list: T[], cleared?: Map<T, string>): LinearData<T>;
    public static outerRegion<T>(node: T): BoxRectDimension;
    public static baseline<T>(list: T[], text?: boolean): Null<T>;
    public static partitionRows<T>(list: T[], cleared?: Map<T, string>): T[][];
    alignmentType: number;
    baselineActive: boolean;
    baselineAltered: boolean;
    rendered: boolean;
    excluded: boolean;
    originalRoot: boolean;
    lineBreakLeading: boolean;
    lineBreakTrailing: boolean;
    floatContainer: boolean;
    localSettings: LocalSettings;
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
    setControlType(controlName: string, containerType?: number): void;
    setExclusions(systemName?: string): void;
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
    exclude(options: ExcludeOptions): void;
    hide(options?: HideOptions<NodeUI>): void;
    replaceTry(options: ReplaceTryOptions<NodeUI>): boolean;
    removeTry(options?: RemoveTryOptions<NodeUI>): Undef<NodeTemplate<NodeUI>>;
    sort(predicate?: (a: NodeUI, b: NodeUI) => number): this;
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
    translateX(value: number, options?: TranslateOptions): boolean;
    translateY(value: number, options?: TranslateOptions): boolean;
    set naturalChild(value);
    get naturalChild(): boolean;
    set documentParent(value);
    get documentParent(): NodeUI;
    set renderAs(value);
    get renderAs(): Null<NodeUI>;
    set containerName(value);
    get containerName(): string;
    set autoPosition(value);
    get autoPosition(): boolean;
    set textContent(value);
    get textContent(): string;
    set multiline(value);
    get multiline(): boolean;
    set visible(value);
    get visible(): boolean;
    set controlName(value);
    get controlName(): string;
    set actualParent(value);
    get actualParent(): Null<NodeUI>;
    set siblingsLeading(value);
    get siblingsLeading(): NodeUI[];
    set siblingsTrailing(value);
    get siblingsTrailing(): NodeUI[];
    set childIndex(value);
    get childIndex(): number;
    set containerIndex(value);
    get containerIndex(): number;
    set use(value);
    get use(): Undef<string>;
    set containerType(value: number);
    get containerType(): number;
    set positioned(value);
    get positioned(): boolean;
    set controlId(name: string);
    get controlId(): string;
    set renderExclude(value: boolean);
    get renderExclude(): boolean;
    get controlElement(): boolean;
    get documentId(): string;
    get baselineHeight(): number;
    get support(): Support;
    get layoutElement(): boolean;
    get layoutHorizontal(): boolean;
    get layoutVertical(): boolean;
    get nodeGroup(): boolean;
    get blockStatic(): boolean;
    get rightAligned(): boolean;
    get positiveAxis(): boolean;
    get leftTopAxis(): boolean;
    get baselineElement(): boolean;
    get previousSibling(): Null<NodeUI>;
    get nextSibling(): Null<NodeUI>;
    get firstChild(): Null<Node>;
    get lastChild(): Null<Node>;
    get onlyChild(): boolean;
    get textEmpty(): boolean;
    get innerMostWrapped(): NodeUI;
    get outerMostWrapper(): NodeUI;
    get preserveWhiteSpace(): boolean;
    get extensions(): string[];
    constructor(id: number, sessionId?: string, element?: Element);
}

declare class NodeGroupUI extends NodeUI {}

declare class NodeList<T extends Node> extends squared.lib.base.Container<T> {
    afterAppend?: (node: T, cascade?: boolean) => void;
    append(node: T, delegate?: boolean, cascade?: boolean): this;
    reset(): void;
    get nextId(): number;
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