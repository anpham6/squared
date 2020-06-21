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
        base: {};
        extensions: {};
        lib: {};
        system: FunctionMap<any>;
        create(): AppBase<T>;
        cached(): AppBase<T>;
    }

    interface AppSession<T extends Node> {
        active: Map<string, AppProcessing<T>>,
        unusedStyles: Set<string>;
    }

    interface AppProcessing<T extends Node> {
        cache: NodeList<T>;
        excluded: NodeList<T>;
        rootElements: Set<HTMLElement>;
        initializing: boolean;
        node?: T;
        documentElement?: T;
    }

    interface AppSessionUI<T extends NodeUI> extends AppSession<T> {
        extensionMap: Map<number, ExtensionUI<T>[]>;
        clearMap: Map<T, string>;
    }

    interface AppProcessingUI<T extends NodeUI> extends AppProcessing<T> {}

    interface AppViewModel extends StandardMap {}

    interface LayoutResult<T extends NodeUI> {
        layout: LayoutUI<T>;
        next?: boolean;
        renderAs?: T;
    }

    interface LayoutRoot<T extends NodeUI> {
        node: T;
        layoutName: string;
    }

    class Application<T extends Node> implements FileActionAsync {
        static readonly KEY_NAME: string;
        userSettings: UserSettings;
        closed: boolean;
        readonly systemName: string;
        readonly framework: number;
        readonly session: AppSession<T>;
        readonly builtInExtensions: ObjectMap<Extension<T>>;
        readonly extensions: Extension<T>[];
        readonly initializing: boolean;
        readonly Node: Constructor<T>;
        reset(): void;
        parseDocument(...elements: (string | HTMLElement)[]): Promise<T | T[]>;
        createCache(documentRoot: HTMLElement, sessionId: string): Undef<T>;
        setStyleMap(sessionId: string): void;
        createNode(sessionId: string, options: {}): T;
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
        set viewModel(data: Undef<AppViewModel>);
        get viewModel(): Undef<AppViewModel>;
        get mainElement(): Element;
        get controllerHandler(): Controller<T>;
        get resourceHandler(): Undef<Resource<T>>;
        get extensionManager(): ExtensionManager<T>;
        get extensionsCascade(): Extension<T>[];
        get childrenAll(): Node[];
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
        readonly session: AppSessionUI<T>;
        readonly builtInExtensions: ObjectMap<ExtensionUI<T>>;
        readonly extensions: ExtensionUI<T>[];
        conditionElement(element: HTMLElement, sessionId: string, cacadeAll?: boolean, pseudoElt?: string): boolean;
        useElement(element: HTMLElement): boolean;
        insertNode(element: Element, sessionId: string, cacadeAll?: boolean, pseudoElt?: string): Undef<T>;
        createNode(sessionId: string, options: CreateNodeUIOptions<T>): T;
        renderNode(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
        addLayout(layout: LayoutUI<T>): void;
        addLayoutTemplate(parent: T, node: T, template: Undef<NodeTemplate<T>>, index?: number): void;
        saveDocument(filename: string, content: string, pathname?: string, index?: number): void;
        get controllerHandler(): ControllerUI<T>;
        get resourceHandler(): Undef<ResourceUI<T>>;
        get layouts(): FileAsset[];
        get clearMap(): Map<T, string>;
        get extensionsTraverse(): ExtensionUI<T>[];
        constructor(
            framework: number,
            nodeConstructor: Constructor<T>,
            ControllerConstructor: Constructor<ControllerUI<T>>,
            ResourceConstructor?: Constructor<ResourceUI<T>>,
            ExtensionManagerConstructor?: Constructor<ExtensionManager<T>>
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
        processUnknownParent(layout: LayoutUI<T>): LayoutResult<T>;
        processUnknownChild(layout: LayoutUI<T>): LayoutResult<T>;
        processTraverseHorizontal(layout: LayoutUI<T>, siblings: T[]): Undef<LayoutUI<T>>;
        processTraverseVertical(layout: LayoutUI<T>, siblings: T[]): Undef<LayoutUI<T>>;
        processLayoutHorizontal(layout: LayoutUI<T>): LayoutUI<T>;
        setConstraints(cache: NodeList<T>): void;
        renderNode(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
        renderNodeGroup(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
        createNodeGroup(node: T, children: T[], parent?: T, options?: CreateNodeGroupUIOptions<T>): T;
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
        set fileHandler(value: Undef<File<T>>);
        get fileHandler(): Undef<File<T>>;
        get controllerSettings(): ControllerSettings;
        get userSettings(): UserResourceSettings;
        get mimeTypeMap(): ObjectMap<MIMEOrAll>;
        get randomUUID(): string;
    }

    class ResourceUI<T extends NodeUI> extends Resource<T> {
        static readonly STORED: ResourceStoredMap;
        static generateId(section: string, name: string, start?: number): string;
        static insertStoredAsset(asset: string, name: string, value: any): string;
        static getOptionArray(element: HTMLSelectElement | HTMLOptGroupElement, showDisabled?: boolean): Undef<string[]>[];
        static isBackgroundVisible(object: Undef<BoxStyle>): boolean;
        static parseBackgroundImage(node: NodeUI, value: string, screenDimension?: Dimension): Undef<string | Gradient>[];
        static getBackgroundSize<T extends NodeUI>(node: T, value: string, screenDimension?: Dimension): Undef<Dimension>;
        static hasLineBreak<T extends NodeUI>(node: T, lineBreak?: boolean, trim?: boolean): boolean;
        static checkPreIndent(node: NodeUI): Undef<[string, NodeUI]>;
        finalize(layouts: FileAsset[]): void;
        writeRawImage(mimeType: Undef<string>, options: RawDataOptions): Undef<Partial<RawAsset>>;
        setBoxStyle(node: T): void;
        setFontStyle(node: T): void;
        setValueString(node: T): void;
        get controllerSettings(): ControllerSettingsUI;
        get userSettings(): UserSettingsUI;
    }

    class Extension<T extends Node> {
        readonly framework: number;
        readonly name: string;
        readonly options: StandardMap;
        readonly dependencies: ExtensionDependency[];
        readonly subscribers: Set<T>;
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
        readonly documentBase?: boolean;
        readonly eventOnly?: boolean;
        readonly cascadeAll?: boolean;
        init?(element: HTMLElement, sessionId: string): boolean;
        included(element: HTMLElement): boolean;
        is(node: T): boolean;
        condition(node: T, parent?: T): boolean;
        processNode(node: T, parent: T): Undef<ExtensionResult<T>>;
        processChild(node: T, parent: T): Undef<ExtensionResult<T>>;
        addDescendant(node: T): void;
        postBaseLayout(node: T): void;
        postConstraints(node: T): void;
        postOptimize(node: T): void;
        afterBaseLayout(sessionId: string): void;
        afterConstraints(sessionId: string): void;
        afterResources(sessionId: string): void;
        beforeBaseLayout(sessionId: string): void;
        beforeCascade(rendered: T[], documentRoot: LayoutRoot<T>[]): void;
        afterFinalize(): void;
        set application(value);
        get application(): ApplicationUI<T>;
        get controller(): ControllerUI<T>;
        get resource(): Undef<ResourceUI<T>>;
        constructor(name: string, framework: number, options?: StandardMap, tagNames?: string[]);
    }

    class ExtensionManager<T extends Node> {
        readonly application: Application<T>;
        include(ext: Extension<T> | string): boolean;
        exclude(ext: Extension<T> | string): boolean;
        retrieve(name: string, checkBuiltIn?: boolean): Null<Extension<T>>;
        optionValue(name: string, attr: string, fallback?: any): any;
        optionValueAsObject(name: string, attr: string, fallback?: Null<{}>): Null<{}>;
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
        getDataMap(options: FileActionOptions): Undef<StandardMap>;
        getCopyQueryParameters(options: FileCopyingOptions): string;
        getArchiveQueryParameters(options: FileArchivingOptions): string;
        get userSettings(): UserResourceSettings;
        set hostname(value);
        get hostname(): string;
    }

    class FileUI<T extends NodeUI> extends File<T> {
        resource: ResourceUI<T>;
        get userSettings(): UserSettingsUI;
        get directory(): { string: string; image: string; video: string; audio: string; font: string };
    }

    class LayoutUI<T extends NodeUI> extends squared.lib.base.Container<T> implements LayoutType {
        static create<T extends NodeUI>(options: LayoutOptions<T>): LayoutUI<T>;
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
        addAlign(value: number): number;
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

    class Node extends squared.lib.base.Container<Node> implements BoxModel {
        static readonly BOX_POSITION: string[];
        static readonly TEXT_STYLE: string[];
        depth: number;
        childIndex: number;
        documentRoot: boolean;
        queryMap?: Node[][];
        readonly id: number;
        readonly style: CSSStyleDeclaration;
        readonly sessionId: string;
        init(): void;
        saveAsInitial(): void;
        data(name: string, attr: string, value?: any, overwrite?: boolean): any;
        unsetCache(...attrs: string[]): void;
        ascend(options: AscendOptions<Node>): Node[];
        intersectX(rect: BoxRectDimension, dimension?: BoxType): boolean;
        intersectY(rect: BoxRectDimension, dimension?: BoxType): boolean;
        withinX(rect: BoxRectDimension, dimension?: BoxType): boolean;
        withinY(rect: BoxRectDimension, dimension?: BoxType): boolean;
        outsideX(rect: BoxRectDimension, dimension?: BoxType): boolean;
        outsideY(rect: BoxRectDimension, dimension?: BoxType): boolean;
        css(attr: string, value?: string, cache?: boolean): string;
        cssInitial(attr: string, options?: CssInitialOptions): string;
        cssAny(attr: string, options: CssAnyOptions): boolean;
        cssAscend(attr: string, options?: CssAscendOptions): string;
        cssSort(attr: string, options?: CssSortOptions): Node[];
        cssPX(attr: string, value: number, cache?: boolean, options?: CssPXOptions): string;
        cssSpecificity(attr: string): number;
        cssTry(attr: string, value: string): boolean;
        cssTryAll(attrs: StringMap): Undef<StringMap>;
        cssFinally(attrs: string | StringMap): void;
        cssParent(attr: string, value?: string, cache?: boolean): string;
        cssAsTuple(...attrs: string[]): string[];
        cssAsObject(...attrs: string[]): StringMap;
        cssApply(values: StringMap, cache?: boolean): this;
        cssCopy(node: Node, ...attrs: string[]): void;
        cssCopyIfEmpty(node: Node, ...attrs: string[]): void;
        parseUnit(value: string, options?: ParseUnitOptions): number;
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
        get verticalAlign(): string;
        get absoluteParent(): Null<Node>;
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
        get boundingClientRect(): DOMRect;
        get cssStyle(): StringMap;
        get textStyle(): StringMap;
        get center(): Point;
        constructor(id: number, sessionId?: string, element?: Element);
    }

    class NodeUI extends Node implements LayoutType {
        static justified<T>(node: T): boolean;
        static refitScreen<T>(node: T, value: Dimension): Dimension;
        static linearData<T>(list: T[], cleared?: Map<T, string>): LinearData<T>;
        static outerRegion<T>(node: T): BoxRectDimension;
        static baseline<T>(list: T[], text?: boolean): Null<T>;
        static partitionRows<T>(list: T[], cleared?: Map<T, string>): T[][];
        alignmentType: number;
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
        outerWrapper?: NodeUI;
        innerWrapped?: NodeUI;
        innerBefore?: NodeUI;
        innerAfter?: NodeUI;
        companion?: NodeUI;
        labelFor?: NodeUI;
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
        get scrollElement(): boolean;
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
        set renderExclude(value: boolean);
        get renderExclude(): boolean;
        set use(value: Undef<string>);
        get use(): Undef<string>;
        get extensions(): string[];
        get controlElement(): boolean;
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
        get rightAligned(): boolean;
        get positiveAxis(): boolean;
        get leftTopAxis(): boolean;
        get baselineElement(): boolean;
        get previousSibling(): Null<NodeUI>;
        get nextSibling(): Null<NodeUI>;
        get firstStaticChild(): Null<NodeUI>;
        get lastStaticChild(): Null<NodeUI>;
        get onlyChild(): boolean;
        get overflowX(): boolean;
        get overflowY(): boolean;
        get textEmpty(): boolean;
        get innerMostWrapped(): NodeUI;
        get outerMostWrapper(): NodeUI;
        get preserveWhiteSpace(): boolean;
        constructor(id: number, sessionId?: string, element?: Element);
    }

    class NodeElement extends squared.base.Node {
        constructor(id: number, sessionId: string, element: Element);
    }

    class NodeGroupUI extends NodeUI {}

    class NodeList<T extends Node> extends squared.lib.base.Container<T> {
        afterAdd?: (node: T, cascade?: boolean) => void;
        add(node: T, delegate?: boolean, cascade?: boolean): this;
        reset(): void;
        constructor(children?: T[]);
    }

    namespace extensions {
        class Accessibility<T extends NodeUI> extends ExtensionUI<T> {}
        class Column<T extends NodeUI> extends ExtensionUI<T> {}
        class CssGrid<T extends NodeUI> extends ExtensionUI<T> {
            static isFr(value: string): boolean;
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
        class VerticalAlign<T extends NodeUI> extends ExtensionUI<T> {}
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
}