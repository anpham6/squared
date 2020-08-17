declare module "base" {
    interface FileActionOptions {
        assets?: FileAsset[];
        exclusions?: Exclusions;
        callback?: CallbackResult;
    }

    interface FileCopyingOptions extends FileActionOptions {
        directory?: string;
    }

    interface FileArchivingOptions extends FileActionOptions {
        filename?: string;
        format?: string;
        copyTo?: string;
        appendTo?: string;
    }

    interface FileActionAsync {
        copyToDisk(directory: string, options?: FileActionOptions): Promise<ResultOfFileAction | void>;
        appendToArchive(pathname: string, options?: FileActionOptions): Promise<ResultOfFileAction | void>;
        saveToArchive(filename?: string, options?: FileActionOptions): Promise<ResultOfFileAction | void>;
        createFrom(format: string, options: FileActionOptions): Promise<ResultOfFileAction | void>;
        appendFromArchive(filename: string, options: FileActionOptions): Promise<ResultOfFileAction | void>;
    }

    interface AppBase<T extends Node> {
        application: Application<T>;
        framework: number;
        userSettings: UserSettings;
    }

    interface AppHandler<T extends Node> {
        application: Application<T>;
        readonly userSettings: UserSettings;
    }

    interface AppFramework<T extends Node> {
        base: PlainObject;
        extensions: PlainObject;
        lib: PlainObject;
        system: FunctionMap<any>;
        create(): AppBase<T>;
        cached(): AppBase<T>;
    }

    interface AppSession<T extends Node> {
        active: Map<string, AppProcessing<T>>,
        unusedStyles: Set<string>;
    }

    interface AppProcessing<T extends Node> {
        sessionId: string;
        cache: NodeList<T>;
        excluded: NodeList<T>;
        rootElements: Set<HTMLElement>;
        initializing: boolean;
        elementMap: Map<Element, ElementData>;
        node?: T;
        documentElement?: T;
    }

    interface AppSessionUI<T extends NodeUI> extends AppSession<T> {
        extensionMap: Map<number, ExtensionUI<T>[]>;
        clearMap: Map<T, string>;
    }

    interface AppProcessingUI<T extends NodeUI> extends AppProcessing<T> {}

    interface LayoutRoot<T extends NodeUI> {
        node: T;
        layoutName: string;
        renderTemplates: NodeTemplate<T>[];
    }

    class Application<T extends Node> implements FileActionAsync {
        static readonly KEY_NAME: string;
        static prioritizeExtensions<T extends Node>(value: string, extensions: Extension<T>[]): Extension<T>[];
        userSettings: UserSettings;
        builtInExtensions: Map<string, Extension<T>>;
        closed: boolean;
        readonly systemName: string;
        readonly framework: number;
        readonly elementMap: Map<Element, T>;
        readonly session: AppSession<T>;
        readonly extensions: Extension<T>[];
        readonly initializing: boolean;
        readonly Node: Constructor<T>;
        reset(): void;
        parseDocument(...elements: (string | HTMLElement)[]): Promise<T | T[]>;
        parseDocumentSync(...elements: (string | HTMLElement)[]): Undef<T | T[]>;
        createCache(documentRoot: HTMLElement, sessionId: string): Undef<T>;
        setStyleMap(sessionId: string): void;
        createNode(sessionId: string, options: CreateNodeOptions): T;
        insertNode(element: Element, sessionId: string): Undef<T>;
        afterCreateCache(node: T): void;
        getProcessing(sessionId: string): Undef<AppProcessing<T>>;
        getProcessingCache(sessionId: string): NodeList<T>;
        getDatasetName(attr: string, element: HTMLElement): Undef<string>;
        setDatasetName(attr: string, element: HTMLElement, value: string): void;
        finalize(): boolean;
        toString(): string;
        copyToDisk(directory: string, options?: FileCopyingOptions): Promise<ResultOfFileAction | void>;
        appendToArchive(pathname: string, options?: FileCopyingOptions): Promise<ResultOfFileAction | void>;
        saveToArchive(filename?: string, options?: FileArchivingOptions): Promise<ResultOfFileAction | void>;
        createFrom(format: string, options: FileArchivingOptions): Promise<ResultOfFileAction | void>;
        appendFromArchive(filename: string, options: FileArchivingOptions): Promise<ResultOfFileAction | void>;
        get mainElement(): Element;
        get controllerHandler(): Controller<T>;
        get resourceHandler(): Undef<Resource<T>>;
        get extensionManager(): Undef<ExtensionManager<T>>;
        get extensionsAll(): Extension<T>[];
        get extensionsCascade(): Extension<T>[];
        get childrenAll(): T[];
        get nextId(): number;
        get length(): number;
        constructor(
            framework: number,
            nodeConstructor: Constructor<T>,
            ControllerConstructor: Constructor<Controller<T>>,
            ResourceConstructor?: Constructor<Resource<T>>,
            ExtensionManagerConstructor?: Constructor<ExtensionManager<T>>
        );
    }

    class ApplicationUI<T extends NodeUI> extends Application<T> {
        userSettings: UserSettingsUI;
        builtInExtensions: Map<string, ExtensionUI<T>>;
        readonly fileHandler?: File<T>;
        readonly session: AppSessionUI<T>;
        readonly extensions: ExtensionUI<T>[];
        conditionElement(element: HTMLElement, sessionId: string, cacadeAll?: boolean, pseudoElt?: string): boolean;
        useElement(element: HTMLElement): boolean;
        insertNode(element: Element, sessionId: string, cacadeAll?: boolean, pseudoElt?: string): Undef<T>;
        createNode(sessionId: string, options: CreateNodeUIOptions<T>): T;
        renderNode(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
        addLayout(layout: LayoutUI<T>): void;
        addLayoutTemplate(parent: T, node: T, template: NodeTemplate<T>, index?: number): void;
        saveDocument(filename: string, content: string, pathname?: string, index?: number): void;
        get controllerHandler(): ControllerUI<T>;
        get resourceHandler(): ResourceUI<T>;
        get extensionManager(): ExtensionManager<T>;
        get layouts(): FileAsset[];
        get clearMap(): Map<T, string>;
        get extensionsTraverse(): ExtensionUI<T>[];
        constructor(
            framework: number,
            nodeConstructor: Constructor<T>,
            ControllerConstructor: Constructor<ControllerUI<T>>,
            ResourceConstructor: Constructor<ResourceUI<T>>,
            ExtensionManagerConstructor: Constructor<ExtensionManager<T>>
        );
    }

    class Controller<T extends Node> implements AppHandler<T> {
        readonly application: Application<T>;
        readonly localSettings: ControllerSettings;
        init(): void;
        reset(): void;
        includeElement(element: HTMLElement): boolean;
        applyDefaultStyles(element: Element, sessionId: string): void;
        preventNodeCascade(node: T): boolean;
        sortInitialCache(cache: NodeList<T>): void;
        get afterInsertNode(): BindGeneric<T, void>;
        get userSettings(): UserSettings;
        get generateSessionId(): string;
    }

    class ControllerUI<T extends NodeUI> extends Controller<T> {
        readonly localSettings: ControllerSettingsUI;
        optimize(rendered: T[]): void;
        finalize(layouts: FileAsset[]): void;
        evaluateNonStatic(documentRoot: T, cache: NodeList<T>): void;
        visibleElement(element: HTMLElement, sessionId: string, pseudoElt?: string): boolean;
        processUnknownParent(layout: LayoutUI<T>): void;
        processUnknownChild(layout: LayoutUI<T>): void;
        processTraverseHorizontal(layout: LayoutUI<T>, siblings: T[]): Undef<LayoutUI<T>>;
        processTraverseVertical(layout: LayoutUI<T>, siblings: T[]): Undef<LayoutUI<T>>;
        processLayoutHorizontal(layout: LayoutUI<T>): LayoutUI<T>;
        setConstraints(rendering: NodeList<T>): void;
        renderNode(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
        renderNodeGroup(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
        createNodeGroup(node: T, children: T[], parent?: T, options?: CreateNodeGroupUIOptions): T;
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
        writeDocument(templates: NodeTemplate<T>[], depth: number, showAttributes: boolean): string;
        getEnclosingXmlTag(controlName: string, attributes?: string, content?: string): string;
        get userSettings(): UserSettingsUI;
        get screenDimension(): Dimension;
        get containerTypeHorizontal(): LayoutType;
        get containerTypeVertical(): LayoutType;
        get containerTypeVerticalMargin(): LayoutType;
        get containerTypePercent(): LayoutType;
    }

    class Resource<T extends Node> implements Resource<T>, AppHandler<T> {
        static readonly KEY_NAME: string;
        static readonly ASSETS: ResourceAssetMap;
        static canCompressImage(filename: string, mimeType?: string): boolean;
        static getExtension(value: string): string;
        readonly application: Application<T>;
        reset(): void;
        addImage(element: HTMLImageElement): void;
        getImage(uri: string): Undef<ImageAsset>;
        addFont(data: FontFaceData): void;
        getFont(fontFamily: string, fontStyle?: string, fontWeight?: string): Undef<FontFaceData>;
        addVideo(uri: string, mimeType?: string): void;
        getVideo(uri: string): Undef<Asset>;
        addAudio(uri: string, mimeType?: string): void;
        getAudio(uri: string): Undef<Asset>;
        addRawData(uri: string, mimeType: string, content: Undef<string>, options?: RawDataOptions): string;
        getRawData(uri: string): Undef<RawAsset>;
        addUnsafeData(name: ResourceAssetType, uri: string, data: any): void;
        set fileHandler(value: Undef<File<T>>);
        get fileHandler(): Undef<File<T>>;
        get controllerSettings(): ControllerSettings;
        get userSettings(): UserResourceSettings;
        get mimeTypeMap(): ObjectMap<MIMEOrAll>;
        get randomUUID(): string;
        get mapOfAssets(): ResourceAssetMap;
    }

    class ResourceUI<T extends NodeUI> extends Resource<T> {
        static readonly STRING_SPACE: string;
        static readonly STORED: ResourceStoredMap;
        static getBackgroundPosition(value: string, dimension: Dimension, options?: BackgroundPositionOptions): BoxRectPosition;
        static generateId(section: string, name: string, start?: number): string;
        static insertStoredAsset(asset: string, name: string, value: any): string;
        static getOptionArray(element: HTMLSelectElement | HTMLOptGroupElement, showDisabled?: boolean): Undef<string[]>[];
        static isBackgroundVisible(object: Undef<BoxStyle>): boolean;
        static parseBackgroundImage(node: NodeUI, value: string, screenDimension?: Dimension): Undef<string | Gradient>[];
        static getBackgroundSize<T extends NodeUI>(node: T, value: string, screenDimension?: Dimension): Undef<Dimension>;
        static hasLineBreak<T extends NodeUI>(node: T, lineBreak?: boolean, trim?: boolean): boolean;
        static checkPreIndent(node: NodeUI): Undef<[string, NodeUI]>;
        finalize(layouts: FileAsset[]): void;
        writeRawImage(options: RawDataOptions): Undef<Partial<RawAsset>>;
        setBoxStyle(node: T): void;
        setFontStyle(node: T): void;
        setValueString(node: T): void;
        removeExcludedFromText(node: T, element: Element): string;
        get controllerSettings(): ControllerSettingsUI;
        get userSettings(): UserSettingsUI;
        get mapOfStored(): ResourceStoredMap;
    }

    class Extension<T extends Node> {
        enabled: boolean;
        readonly framework: number;
        readonly name: string;
        readonly options: StandardMap;
        readonly dependencies: ExtensionDependency[];
        readonly subscribers: Set<T>;
        readonly data: Map<T, unknown>;
        init?(element: HTMLElement, sessionId: string): boolean;
        reset(): void;
        require(name: string, preload?: boolean): void;
        beforeParseDocument(sessionId: string): void;
        afterParseDocument(sessionId: string): void;
        set application(value);
        get application(): Application<T>;
        get controller(): Controller<T>;
        constructor(name: string, framework: number, options?: StandardMap);
    }

    class ExtensionUI<T extends NodeUI> extends Extension<T> {
        static findNestedElement<T extends NodeUI>(node: T, name: string): Null<HTMLElement>;
        readonly tagNames: string[];
        readonly eventOnly?: boolean;
        readonly cascadeAll?: boolean;
        readonly documentBase?: boolean;
        included(element: HTMLElement): boolean;
        is(node: T): boolean;
        condition(node: T, parent: T): boolean;
        processNode(node: T, parent: T): Void<ExtensionResult<T>>;
        processChild(node: T, parent: T): Void<ExtensionResult<T>>;
        addDescendant(node: T): void;
        postBaseLayout(node: T): void;
        postConstraints(node: T): void;
        postOptimize(node: T, rendered: T[]): void;
        afterBaseLayout(sessionId: string): void;
        afterConstraints(sessionId: string): void;
        afterResources(sessionId: string): void;
        beforeBaseLayout(sessionId: string): void;
        beforeDocumentWrite(options: DocumentWriteExtensionUIOptions<T>): void;
        afterFinalize(): void;
        set application(value);
        get application(): ApplicationUI<T>;
        get controller(): ControllerUI<T>;
        get resource(): Undef<ResourceUI<T>>;
        constructor(name: string, framework: number, options?: ExtensionUIOptions);
    }

    class ExtensionManager<T extends Node> {
        readonly application: Application<T>;
        include(ext: Extension<T> | string): boolean;
        exclude(ext: Extension<T> | string): boolean;
        retrieve(name: string, checkBuiltIn?: boolean): Null<Extension<T>>;
        optionValue<T = unknown>(name: string, attr: string, fallback?: T): Undef<T>;
        optionValueAsObject(name: string, attr: string, fallback?: Null<PlainObject>): Null<PlainObject>;
        optionValueAsString(name: string, attr: string, fallback?: string): string;
        optionValueAsNumber(name: string, attr: string, fallback?: number): number;
        optionValueAsBoolean(name: string, attr: string, fallback?: boolean): boolean;
        get extensions(): Extension<T>[];
    }

    class File<T extends Node> implements FileActionAsync {
        static downloadFile(data: Blob, filename: string, mimeType?: string): void;
        resource: Resource<T>;
        readonly assets: FileAsset[];
        addAsset(asset: Partial<RawAsset>): void;
        reset(): void;
        copying(options: FileCopyingOptions): Promise<ResultOfFileAction | void>;
        archiving(options: FileArchivingOptions): Promise<ResultOfFileAction | void>;
        copyToDisk(directory: string, options?: FileCopyingOptions): Promise<ResultOfFileAction | void>;
        appendToArchive(pathname: string, options?: FileCopyingOptions): Promise<ResultOfFileAction | void>;
        saveToArchive(filename: string, options?: FileArchivingOptions): Promise<ResultOfFileAction | void>;
        createFrom(format: string, options: FileArchivingOptions): Promise<ResultOfFileAction | void>;
        appendFromArchive(filename: string, options: FileArchivingOptions): Promise<ResultOfFileAction | void>;
        getDataMap(options: FileActionOptions): Void<StandardMap>;
        getCopyQueryParameters(options: FileCopyingOptions): string;
        getArchiveQueryParameters(options: FileArchivingOptions): string;
        get userSettings(): UserResourceSettings;
        set hostname(value);
        get hostname(): string;
    }

    class LayoutUI<T extends NodeUI> extends squared.lib.base.Container<T> implements LayoutType {
        static create<T extends NodeUI>(options: LayoutOptions<T>): LayoutUI<T>;
        parent: T;
        node: T;
        containerType: number;
        alignmentType: number;
        rowCount?: number;
        columnCount?: number;
        renderType?: number;
        renderIndex?: number;
        next?: boolean;
        init(): void;
        setContainerType(containerType: number, alignmentType?: number): void;
        addAlign(value: number): number;
        hasAlign(value: number): boolean;
        addRender(value: number): number;
        set itemCount(value);
        get itemCount(): number;
        set type(value: LayoutType);
        get linearX(): boolean;
        get linearY(): boolean;
        get floated(): Undef<Set<string>>;
        get singleRowAligned(): boolean;
        constructor(parent: T, node: T, containerType?: number, alignmentType?: number, children?: T[]);
    }

    class Node extends squared.lib.base.Container<Node> implements BoxModel {
        static readonly TEXT_STYLE: string[];
        static sanitizeCss(element: HTMLElement, styleMap: StringMap, writingMode?: string): StringMap;
        depth: number;
        childIndex: number;
        documentRoot: boolean;
        sessionId: string;
        queryMap?: Node[][];
        readonly id: number;
        init(parent: Node, depth: number, index?: number): void;
        syncWith(sessionId?: string, cache?: boolean): boolean;
        saveAsInitial(): void;
        data<T = unknown>(name: string, attr: string, value?: any, overwrite?: boolean): Undef<T>;
        unsetCache(...attrs: string[]): void;
        ascend(options?: AscendOptions<Node>): Node[];
        descend(options?: DescendOptions<Node>): Node[];
        intersectX(rect: BoxRectDimension, options?: CoordsXYOptions): boolean;
        intersectY(rect: BoxRectDimension, options?: CoordsXYOptions): boolean;
        withinX(rect: BoxRectDimension, options?: OffsetXYOptions): boolean;
        withinY(rect: BoxRectDimension, options?: OffsetXYOptions): boolean;
        outsideX(rect: BoxRectDimension, options?: OffsetXYOptions): boolean;
        outsideY(rect: BoxRectDimension, options?: OffsetXYOptions): boolean;
        css(attr: string, value?: string, cache?: boolean): string;
        cssInitial(attr: string, options?: CssInitialOptions): string;
        cssAny(attr: string, values: string[], options?: CssAnyOptions): boolean;
        cssAscend(attr: string, options?: CssAscendOptions): string;
        cssSort(attr: string, options?: CssSortOptions): Node[];
        cssPX(attr: string, value: number, cache?: boolean, options?: CssPXOptions): string;
        cssSpecificity(attr: string): number;
        cssTry(attr: string, value: string, callback?: FunctionSelf<this>): boolean;
        cssTryAll(attrs: StringMap, callback?: FunctionSelf<this>): StringMap | boolean;
        cssFinally(attrs: string | StringMap): void;
        cssParent(attr: string, value?: string, cache?: boolean): string;
        cssAsTuple(...attrs: string[]): string[];
        cssAsObject(...attrs: string[]): StringMap;
        cssApply(values: StringMap, overwrite?: boolean, cache?: boolean): this;
        cssCopy(node: Node, ...attrs: string[]): void;
        cssCopyIfEmpty(node: Node, ...attrs: string[]): void;
        cssPseudoElement(name: string): Null<StringMap>;
        parseUnit(value: string, options?: NodeParseUnitOptions): number;
        has(attr: string, options?: HasOptions): boolean;
        hasPX(attr: string, options?: HasPXOptions): boolean;
        toInt(attr: string, fallback?: number, initial?: boolean): number;
        toFloat(attr: string, fallback?: number, initial?: boolean): number;
        toElementInt(attr: string, fallback?: number): number;
        toElementFloat(attr: string, fallback?: number): number;
        toElementBoolean(attr: string, fallback?: boolean): boolean;
        toElementString(attr: string, fallback?: string): string;
        setBounds(cache?: boolean): Undef<BoxRectDimension>;
        resetBounds(): void;
        min(attr: string, options?: MinMaxOptions): Node;
        max(attr: string, options?: MinMaxOptions): Node;
        querySelector(value: string): Null<Node>;
        querySelectorAll(value: string, customMap?: Node[][], resultCount?: number): Node[];
        ancestors(value?: string, options?: AscendOptions<Node>): Node[];
        descendants(value?: string, options?: DescendOptions<Node>): Node[];
        siblings(value?: string, options?: SiblingsOptions<Node>): Node[];
        valueOf(attr: string, options?: CssInitialOptions): string;
        set parent(value);
        get parent(): Null<Node>;
        set actualParent(value);
        get actualParent(): Null<Node>;
        set naturalChildren(value);
        get naturalChildren(): Node[];
        set naturalElements(value);
        get naturalElements(): Node[];
        set dir(value);
        get dir(): string;
        set inlineText(value);
        get inlineText(): boolean;
        set textBounds(value);
        get textBounds(): Null<BoxRectDimension>;
        get box(): BoxRectDimension;
        get bounds(): BoxRectDimension;
        get linear(): BoxRectDimension;
        get element(): Null<Element>;
        get elementId(): string;
        get tagName(): string;
        get naturalChild(): boolean;
        get naturalElement(): boolean;
        get parentElement(): Null<Element>;
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
        get block(): boolean;
        get blockStatic(): boolean;
        get plainText(): boolean;
        get styleText(): boolean;
        get textContent(): string;
        get lineBreak(): boolean;
        get pageFlow(): boolean;
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
        get verticalAlign(): number;
        get absoluteParent(): Null<Node>;
        get wrapperOf(): Null<Node>;
        get actualWidth(): number;
        get actualHeight(): number;
        get actualDimension(): Dimension;
        get percentWidth(): number;
        get percentHeight(): number;
        get firstChild(): Null<Node>;
        get lastChild(): Null<Node>;
        get previousSibling(): Null<Node>;
        get nextSibling(): Null<Node>;
        get previousElementSibling(): Null<Node>;
        get nextElementSibling(): Null<Node>;
        get attributes(): StringMap;
        get boundingClientRect(): Null<DOMRect>;
        get preserveWhiteSpace(): boolean;
        get cssStyle(): StringMap;
        get textStyle(): StringMap;
        get pseudoElt(): Undef<string>;
        get elementData(): Undef<ElementData>;
        get center(): Point;
        get style(): CSSStyleDeclaration;
        constructor(id: number, sessionId?: string, element?: Element, children?: Node[]);
    }

    class NodeUI extends Node implements LayoutType {
        static justified<T>(node: T): boolean;
        static refitScreen<T>(node: T, value: Dimension): Dimension;
        static linearData<T>(list: T[], cleared?: Map<T, string>): LinearData<T>;
        static outerRegion<T>(node: T): BoxRectDimension;
        static baseline<T>(list: T[], text?: boolean, image?: boolean): Null<T>;
        static partitionRows<T>(list: T[], cleared?: Map<T, string>): T[][];
        alignmentType: number;
        contentAltered: boolean;
        baselineActive: boolean;
        baselineAltered: boolean;
        rendered: boolean;
        excluded: boolean;
        rootElement: boolean;
        lineBreakLeading: boolean;
        lineBreakTrailing: boolean;
        floatContainer: boolean;
        localSettings: LocalSettingsUI;
        documentChildren?: NodeUI[];
        renderParent?: NodeUI;
        renderExtension?: Extension<NodeUI>[];
        renderTemplates?: NodeTemplate<NodeUI>[];
        renderedAs?: NodeTemplate<NodeUI>;
        outerWrapper?: NodeUI;
        innerWrapped?: NodeUI;
        innerBefore?: NodeUI;
        innerAfter?: NodeUI;
        companion?: NodeUI;
        labelFor?: NodeUI;
        horizontalRowStart?: boolean;
        horizontalRowEnd?: boolean;
        horizontalRows?: NodeUI[][];
        renderChildren: NodeUI[];
        setControlType(controlName: string, containerType?: number): void;
        setExclusions(): void;
        setLayout(): void;
        setAlignment(): void;
        setBoxSpacing(): void;
        attr(name: string, attr: string, value?: string, overwrite?: boolean): string;
        alignParent(position: string): boolean;
        alignSibling(position: string, documentId?: string): string;
        localizeString(value: string): string;
        inherit(node: Node, ...modules: string[]): Undef<StandardMap>;
        inheritApply(module: string, data: StandardMap): void;
        clone(id: number): void;
        cloneBase(node: NodeUI): void;
        is(containerType: number): boolean;
        of(containerType: number, ...alignmentType: number[]): boolean;
        namespace(name: string): StringMapChecked;
        namespaces(): [string, StringMapChecked][];
        unsafe<T = unknown>(name: string, value?: any): Undef<T>;
        unset(name: string): void;
        delete(name: string, ...attrs: string[]): void;
        apply(options: PlainObject): void;
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
        actualTextHeight(options?: TextHeightOptions): number;
        alignedVertically(siblings?: Node[], cleared?: Map<Node, string>, horizontal?: boolean): number;
        previousSiblings(options?: TraverseSiblingsOptions): NodeUI[];
        nextSiblings(options?: TraverseSiblingsOptions): NodeUI[];
        modifyBox(region: number, value: number, negative?: boolean): void;
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
        set containerType(value: number);
        get containerType(): number;
        set positioned(value);
        get positioned(): boolean;
        set controlId(name: string);
        get controlId(): string;
        set textIndent(value);
        get textIndent(): number;
        set renderExclude(value: boolean);
        get renderExclude(): boolean;
        set use(value: Undef<string>);
        get use(): Undef<string>;
        get extensions(): string[];
        get scrollElement(): boolean;
        get controlElement(): boolean;
        get imageContainer(): boolean;
        get documentId(): string;
        get baselineHeight(): number;
        get support(): SupportUI;
        get layoutElement(): boolean;
        get layoutHorizontal(): boolean;
        get layoutVertical(): boolean;
        get nodeGroup(): boolean;
        get blockStatic(): boolean;
        get inlineVertical(): boolean;
        get inlineDimension(): boolean;
        get blockVertical(): boolean;
        get blockDimension(): boolean;
        get inlineFlow(): boolean;
        get verticalAligned(): boolean;
        get positiveAxis(): boolean;
        get leftTopAxis(): boolean;
        get baselineElement(): boolean;
        get flowElement(): boolean;
        get previousSibling(): Null<NodeUI>;
        get nextSibling(): Null<NodeUI>;
        get firstStaticChild(): Null<NodeUI>;
        get lastStaticChild(): Null<NodeUI>;
        get onlyChild(): boolean;
        get rendering(): boolean;
        get boxReset(): number[];
        get boxAdjustment(): number[];
        get overflowX(): boolean;
        get overflowY(): boolean;
        get textEmpty(): boolean;
        get textWidth(): number;
        get innerMostWrapped(): NodeUI;
        get outerMostWrapper(): NodeUI;
        get firstLineStyle(): Null<StringMap>;
        get firstLetterStyle(): Null<StringMap>;
        get textAlignLast(): string;
        constructor(id: number, sessionId?: string, element?: Element);
    }

    class NodeGroupUI extends NodeUI {}

    class NodeList<T extends Node> extends squared.lib.base.Container<T> {
        sessionId: string;
        afterAdd?: (node: T, cascade?: boolean, remove?: boolean) => void;
        add(node: T, delegate?: boolean, cascade?: boolean, remove?: boolean): this;
        reset(): this;
        constructor(children?: T[]);
    }

    namespace extensions {
        class Accessibility<T extends NodeUI> extends ExtensionUI<T> {}
        class Column<T extends NodeUI> extends ExtensionUI<T> {}
        class CssGrid<T extends NodeUI> extends ExtensionUI<T> {
            static isAligned(node: NodeUI): boolean;
            static isJustified(node: NodeUI): boolean;
            static createDataRowAttribute(): CssGridDirectionData;
        }
        class Flexbox<T extends NodeUI> extends ExtensionUI<T> {}
        class Grid<T extends NodeUI> extends ExtensionUI<T> {
            static createDataCellAttribute(): GridCellData<NodeUI>;
        }
        class List<T extends NodeUI> extends ExtensionUI<T> {}
        class Relative<T extends NodeUI> extends ExtensionUI<T> {}
        class Sprite<T extends NodeUI> extends ExtensionUI<T> {}
        class Table<T extends NodeUI> extends ExtensionUI<T> {}
        class WhiteSpace<T extends NodeUI> extends ExtensionUI<T> {}
    }

    namespace lib {
        namespace constant {
            const EXT_NAME: StringMap;
        }

        namespace enumeration {
            const enum APP_FRAMEWORK {
                UNIVERSAL = 0,
                VDOM = 1,
                ANDROID = 1 << 1,
                CHROME = 1 << 2
            }
            const enum NODE_ALIGNMENT {
                UNKNOWN = 1,
                AUTO_LAYOUT = 1 << 1,
                HORIZONTAL = 1 << 2,
                VERTICAL = 1 << 3,
                ABSOLUTE = 1 << 4,
                BLOCK = 1 << 5,
                SEGMENTED = 1 << 6,
                COLUMN = 1 << 7,
                FLOAT = 1 << 8,
                INLINE = 1 << 9,
                RIGHT = 1 << 10,
                SINGLE = 1 << 11,
                EXTENDABLE = 1 << 12,
                WRAPPER = 1 << 13,
                PERCENT = 1 << 14
            }
            const enum BOX_STANDARD {
                MARGIN_TOP = 1,
                MARGIN_RIGHT = 1 << 1,
                MARGIN_BOTTOM = 1 << 2,
                MARGIN_LEFT = 1 << 3,
                PADDING_TOP = 1 << 4,
                PADDING_RIGHT = 1 << 5,
                PADDING_BOTTOM = 1 << 6,
                PADDING_LEFT = 1 << 7,
                MARGIN = MARGIN_TOP | MARGIN_RIGHT | MARGIN_BOTTOM | MARGIN_LEFT,
                MARGIN_VERTICAL = MARGIN_TOP | MARGIN_BOTTOM,
                MARGIN_HORIZONTAL = MARGIN_RIGHT | MARGIN_LEFT,
                PADDING = PADDING_TOP | PADDING_RIGHT | PADDING_BOTTOM | PADDING_LEFT,
                PADDING_VERTICAL = PADDING_TOP | PADDING_BOTTOM,
                PADDING_HORIZONTAL = PADDING_RIGHT | PADDING_LEFT
            }
            enum APP_SECTION {
                DOM_TRAVERSE = 1,
                EXTENSION = 1 << 1,
                RENDER = 1 << 2,
                ALL = DOM_TRAVERSE | EXTENSION | RENDER
            }
            enum NODE_RESOURCE {
                BOX_STYLE = 1,
                BOX_SPACING = 1 << 1,
                FONT_STYLE = 1 << 2,
                VALUE_STRING = 1 << 3,
                IMAGE_SOURCE = 1 << 4,
                ASSET = FONT_STYLE | VALUE_STRING | IMAGE_SOURCE,
                ALL = BOX_STYLE | BOX_SPACING | ASSET
            }
            enum NODE_PROCEDURE {
                CONSTRAINT = 1,
                LAYOUT = 1 << 1,
                ALIGNMENT = 1 << 2,
                ACCESSIBILITY = 1 << 3,
                LOCALIZATION = 1 << 4,
                CUSTOMIZATION = 1 << 5,
                ALL = CONSTRAINT | LAYOUT | ALIGNMENT | ACCESSIBILITY | LOCALIZATION | CUSTOMIZATION
            }
            const enum NODE_TRAVERSE {
                HORIZONTAL,
                VERTICAL,
                LINEBREAK,
                INLINE_WRAP,
                FLOAT_CLEAR,
                FLOAT_BLOCK,
                FLOAT_WRAP,
                FLOAT_INTERSECT,
                PERCENT_WRAP
            }
            const enum NODE_TEMPLATE {
                XML = 1,
                INCLUDE
            }
        }
    }
}