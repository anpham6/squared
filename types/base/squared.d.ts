/* eslint no-shadow: "off" */

type FileActionResult = Promise<Void<ResponseData>>;
type AppSessionSelectorCallback = (sessionId: string, rule: CSSStyleRule, selector: string, hostElement?: Element) => void;
type AppSessionConditionCallback = (sessionId: string, rule: CSSConditionRule, condition: string, hostElement?: Element) => void;

declare module "base" {
    type RootElement = string | HTMLElement | ElementSettings;
    type UserSettingMethod<T extends Node, U extends UserResourceSettings> = <V = unknown>(sessionId: Undef<string | AppProcessing<T>>, name: keyof U) => V;
    type AppThreadData<T extends Node> = [AppProcessing<T>, HTMLElement[], QuerySelectorElement[], string[]?];

    interface ElementSettings extends Partial<UserResourceSettingsUI>, Partial<LocationUri> {
        element?: string | HTMLElement;
        exclude?: StringOfArray;
        beforeCascade?: (sessionId: string) => void;
        afterCascade?: (sessionId: string, node: Node) => void;
    }

    interface FileCopyingOptions extends squared.FileActionOptions {
        watch?: boolean;
        emptyDir?: boolean;
    }

    interface FileArchivingOptions extends squared.FileActionOptions {
        filename?: string;
        format?: string;
        copyTo?: string;
    }

    interface FileActionAsync {
        saveAs(filename: string, options?: squared.FileActionOptions): FileActionResult;
        saveFiles(filename: string, options: squared.FileActionOptions): FileActionResult;
        copyTo(pathname: string, options?: squared.FileActionOptions): FileActionResult;
        copyFiles(pathname: string, options: squared.FileActionOptions): FileActionResult;
        appendTo(target: string, options?: squared.FileActionOptions): FileActionResult;
        appendFiles(filename: string, options: squared.FileActionOptions): FileActionResult;
    }

    interface ErrorAction {
        writeError(message: string, hint?: string): void;
    }

    interface AppBase<T extends Node> {
        application: Application<T>;
        framework: number;
        userSettings: UserSettings;
    }

    interface AppHandler<T extends Node> {
        readonly application: Application<T>;
    }

    interface AppFramework<T extends Node> {
        base?: PlainObject;
        extensions?: PlainObject;
        lib?: PlainObject;
        system?: ObjectMap<FunctionType>;
        create(): AppBase<T>;
        cached(): AppBase<T>;
    }

    interface AppSession<T extends Node> {
        active: Map<string, AppProcessing<T>>;
        usedSelector?: AppSessionSelectorCallback;
        unusedSelector?: AppSessionSelectorCallback;
        unusedMedia?: AppSessionConditionCallback;
        unusedSupports?: AppSessionConditionCallback;
    }

    interface AppProcessing<T extends Node> {
        sessionId: string;
        resourceId: number;
        initializing: boolean;
        cache: NodeList<T>;
        excluded: NodeList<T>;
        rootElements: HTMLElement[];
        settings: Null<ElementSettings>;
        customSettings: Null<ElementSettings>[];
        extensions: Extension<T>[];
        node: Null<T>;
        documentElement: Null<T>;
        afterInsertNode?: Extension<T>[];
    }

    interface AppSessionUI<T extends NodeUI> extends AppSession<T> {
        extensionMap: WeakMap<T, ExtensionUI<T>[]>;
        clearMap: Map<T, string>;
    }

    interface AppModule {
        init(): void;
        reset(): void;
    }

    class Application<T extends Node> implements AppModule, FileActionAsync, ErrorAction {
        static readonly KEY_NAME: string;
        static prioritizeExtensions<U extends Node>(value: string, extensions: Extension<U>[]): Extension<U>[];
        builtInExtensions: Map<string, Extension<T>>;
        userSettings: UserSettings;
        closed: boolean;
        elementMap: WeakMap<Element, T>;
        readonly systemName: string;
        readonly framework: number;
        readonly session: AppSession<T>;
        readonly extensions: Extension<T>[];
        readonly Node: Constructor<T>;
        init(): void;
        reset(): void;
        finalize(): boolean;
        setExtensions(namespaces?: string[]): void;
        parseDocument(...elements: RootElement[]): Promise<Void<T | T[]>>;
        parseDocumentSync(...elements: RootElement[]): Void<T | T[]>;
        createThread(elements: RootElement[], sync?: boolean): AppThreadData<T>;
        resumeThread(processing: AppProcessing<T>, rootElements: HTMLElement[], requestCount: number): Node | Node[];
        createCache(processing: AppProcessing<T>, documentRoot: HTMLElement): Undef<T>;
        setStyleMap(sessionId: string, resourceId: number, documentRoot?: DocumentRoot, queryRoot?: QuerySelectorElement): void;
        replaceShadowRootSlots(shadowRoot: ShadowRoot): void;
        createNode(sessionId: string, options: CreateNodeOptions): T;
        createNodeStatic(processing: AppProcessing<T>, element?: Element): T;
        insertNode(processing: AppProcessing<T>, element: Element): Undef<T>;
        afterCreateCache(processing: AppProcessing<T>, node: T): void;
        getProcessing(sessionId: string): Undef<AppProcessing<T>>;
        getProcessingCache(sessionId: string): NodeList<T>;
        getUserSetting: UserSettingMethod<T, UserResourceSettings>;
        getDatasetName(attr: string, element: DocumentElement): Undef<string>;
        setDatasetName(attr: string, element: DocumentElement, value: string): void;
        addRootElement(sessionId: string, element: HTMLElement): void;
        copyTo(pathname: string, options?: FileCopyingOptions): FileActionResult;
        appendTo(target: string, options?: FileArchivingOptions): FileActionResult;
        saveAs(filename: string, options?: FileArchivingOptions): FileActionResult;
        saveFiles(filename: string, options: FileArchivingOptions): FileActionResult;
        appendFiles(target: string, options: FileArchivingOptions): FileActionResult;
        copyFiles(pathname: string, options: FileCopyingOptions): FileActionResult;
        writeError(message: string, hint?: string): void;
        toString(): string;
        get mainElement(): Element;
        get controllerHandler(): Controller<T>;
        get resourceHandler(): Null<Resource<T>>;
        get fileHandler(): Null<File<T>>;
        get extensionManager(): Null<ExtensionManager<T>>;
        get sessionAll(): [Extension<T>[], T[]];
        get resourceId(): number;
        get nextId(): number;
        get initializing(): boolean;
        get length(): number;
        constructor(
            framework: number,
            nodeConstructor: Constructor<T>,
            ControllerConstructor: Constructor<Controller<T>>,
            ExtensionManagerConstructor?: Constructor<ExtensionManager<T>>,
            ResourceConstructor?: Constructor<Resource<T>>,
            builtInExtensions?: Map<string, Extension<T>>
        );
    }

    class ApplicationUI<T extends NodeUI> extends Application<T> {
        resource: ResourceUI<T>;
        builtInExtensions: Map<string, ExtensionUI<T>>;
        userSettings: UserResourceSettingsUI;
        readonly session: AppSessionUI<T>;
        readonly extensions: ExtensionUI<T>[];
        conditionElement(element: HTMLElement, sessionId: string, cacadeAll?: boolean, pseudoElt?: string): boolean;
        useElement(element: HTMLElement): boolean;
        insertNode(processing: AppProcessing<T>, element: Element, cacadeAll?: boolean, pseudoElt?: string): Undef<T>;
        createNode(sessionId: string, options: CreateNodeUIOptions<T>): T;
        renderNode(layout: ContentUI<T>): Undef<NodeTemplate<T>>;
        addLayout(layout: ContentUI<T>): void;
        addLayoutTemplate(parent: T, node: T, template: NodeTemplate<T>, index?: number): void;
        saveDocument(filename: string, content: string, pathname?: string, index?: number): void;
        getUserSetting: UserSettingMethod<T, UserResourceSettingsUI>;
        get controllerHandler(): ControllerUI<T>;
        get resourceHandler(): ResourceUI<T>;
        get extensionManager(): ExtensionManager<T>;
        get layouts(): FileAsset[];
        get clearMap(): Map<T, string>;
    }

    class Controller<T extends Node> implements AppModule, AppHandler<T> {
        static readonly KEY_NAME: string;
        readonly application: Application<T>;
        readonly localSettings: ControllerSettings;
        init(): void;
        reset(): void;
        processUserSettings(processing: AppProcessing<T>): void;
        sortInitialCache(cache: NodeList<T>): void;
        includeElement(element: HTMLElement): boolean;
        applyDefaultStyles(processing: AppProcessing<T>, element: Element, pseudoElt?: PseudoElt): void;
        preventNodeCascade(node: T): boolean;
        afterInsertNode(node: T, sessionId: string): void;
        get generateSessionId(): string;
    }

    class ControllerUI<T extends NodeUI> extends Controller<T> {
        readonly localSettings: ControllerSettingsUI;
        optimize(rendered: T[]): void;
        finalize(layouts: FileAsset[]): void;
        evaluateNonStatic(documentRoot: T, cache: NodeList<T>): void;
        visibleElement(element: HTMLElement, sessionId: string, pseudoElt?: string): boolean;
        processUnknownParent(layout: LayoutUI<T>): void;
        processUnknownChild(layout: ContentUI<T>): void;
        processTraverseHorizontal(layout: LayoutUI<T>, siblings: T[]): Undef<LayoutUI<T>>;
        processTraverseVertical(layout: LayoutUI<T>, siblings: T[]): Undef<LayoutUI<T>>;
        processLayoutHorizontal(layout: LayoutUI<T>): LayoutUI<T>;
        setConstraints(rendering: NodeList<T>): void;
        renderNode(layout: ContentUI<T>): Undef<NodeTemplate<T>>;
        renderNodeGroup(layout: LayoutUI<T>): Undef<NodeTemplate<T>>;
        createNodeGroup(node: T, children: T[], parent?: T, options?: CreateNodeGroupUIOptions): T;
        createNodeWrapper(node: T, parent: T, options?: CreateNodeWrapperUIOptions<T>): T;
        sortRenderPosition(parent: T, templates: NodeTemplate<T>[]): NodeTemplate<T>[];
        addBeforeOutsideTemplate(node: T, value: string, format?: boolean, index?: number): void;
        addBeforeInsideTemplate(node: T, value: string, format?: boolean, index?: number): void;
        addAfterInsideTemplate(node: T, value: string, format?: boolean, index?: number): void;
        addAfterOutsideTemplate(node: T, value: string, format?: boolean, index?: number): void;
        getBeforeOutsideTemplate(node: T, depth: number): string;
        getBeforeInsideTemplate(node: T, depth: number): string;
        getAfterInsideTemplate(node: T, depth: number): string;
        getAfterOutsideTemplate(node: T, depth: number): string;
        writeDocument(templates: NodeTemplate<T>[], depth: number, showAttributes: boolean): string;
        getEnclosingXmlTag(controlName: string, attributes?: string, content?: string): string;
        get screenDimension(): Dimension;
        get containerTypeHorizontal(): LayoutType;
        get containerTypeVertical(): LayoutType;
        get containerTypeVerticalMargin(): LayoutType;
        get containerTypePercent(): LayoutType;
        get requireFormat(): boolean;
    }

    class Resource<T extends Node> implements AppModule, AppHandler<T> {
        static readonly KEY_NAME: string;
        static readonly ASSETS: ResourceSessionAsset;
        static hasMimeType(formats: MIMEOrAll, value: string): boolean;
        static getExtension(value: string): string;
        static parseDataURI(value: string, mimeType?: string, encoding?: string): RawDataOptions;
        readonly application: Application<T>;
        init(): void;
        reset(): void;
        clear(): void;
        createThread(resourceId: number): void;
        preloadAssets(resourceId: number, documentRoot: HTMLElement, elements: QuerySelectorElement[], preloadImages?: boolean, preloadFonts?: boolean): [(HTMLImageElement | string)[], HTMLImageElement[]];
        parseFontFace(resourceId: number, cssText: string, styleSheetHref?: Null<string>): void;
        parseKeyFrames(resourceId: number, cssRule: CSSKeyframesRule): void;
        addAsset(resourceId: number, asset: RawAsset): void;
        addImage(resourceId: number, uri: string, width?: number, height?: number): void;
        getImage(resourceId: number, uri: string): Undef<ImageAsset>;
        addFont(resourceId: number, data: FontFaceData): void;
        getFonts(resourceId: number, fontFamily: string, fontStyle?: string, fontWeight?: string): FontFaceData[];
        addVideo(resourceId: number, uri: string, options?: AudioVideoOptions): void;
        getVideo(resourceId: number, uri: string): Undef<Asset>;
        addAudio(resourceId: number, uri: string, options?: AudioVideoOptions): void;
        getAudio(resourceId: number, uri: string): Undef<Asset>;
        addRawData(resourceId: number, uri: string, options: RawDataOptions): void;
        getRawData(resourceId: number, uri: string): Undef<RawAsset>;
        addImageElement(resourceId: number, element: HTMLImageElement): void;
        fromImageUrl(resourceId: number, value: string): ImageAsset[];
        assignFilename(uri: string, mimeType?: string, ext?: string): string;
        set fileHandler(value);
        get fileHandler(): Null<File<T>>;
        get controllerSettings(): ControllerSettings;
        get mimeTypeMap(): ObjectMap<MIMEOrAll>;
        get mapOfAssets(): ResourceSessionAsset;
    }

    class ResourceUI<T extends NodeUI> extends Resource<T> {
        static readonly STORED: ResourceSessionStored;
        static generateId(resourceId: number, section: string, name: string, start?: number): string;
        static insertStoredAsset(resourceId: number, type: string, name: string, value: unknown): string;
        static getBackgroundPosition(value: string, dimension: Dimension, options?: BackgroundPositionOptions): BoxRectPosition;
        static getOptionArray(element: HTMLSelectElement | HTMLOptGroupElement, showDisabled?: boolean): Undef<string[]>[];
        static isBackgroundVisible(object: Undef<BoxStyle>): boolean;
        static parseBackgroundImage(node: NodeUI, value: string): Undef<string | Gradient>[];
        static getBackgroundSize<U extends NodeUI>(node: U, value: string, dimension?: Dimension): Null<Dimension>;
        static hasLineBreak<U extends NodeUI>(node: U, lineBreak?: boolean, trim?: boolean): boolean;
        static checkPreIndent(node: NodeUI): Undef<[string, NodeUI]>;
        setData(rendering: NodeList<T>): void;
        writeRawImage(resourceId: number, filename: string, options: RawDataOptions): Undef<RawAsset>;
        writeRawSvg(resourceId: number, element: SVGSVGElement, dimension?: Dimension): string;
        setBoxStyle(node: T): void;
        setFontStyle(node: T): void;
        setValueString(node: T): void;
        getImageDimension(resourceId: number, uri: string): Dimension;
        preFormatString(value: string): string
        removeExcludedText(node: T, element: Element): string;
        get controllerSettings(): ControllerSettingsUI;
        get STRING_SPACE(): string;
        get STRING_NEWLINE(): string;
        get STRING_WBR(): string;
    }

    class Extension<T extends Node> {
        enabled: boolean;
        controller: Controller<T>;
        resource: Null<Resource<T>>;
        data: WeakMap<object, unknown>; // eslint-disable-line @typescript-eslint/ban-types
        readonly framework: number;
        readonly name: string;
        readonly options: StandardMap;
        readonly dependencies: ExtensionDependency[];
        readonly subscribers: lib.session.MultiSet<T>;
        reset(): void;
        require(value: ExtensionDependency): void;
        beforeInsertNode?(element: HTMLElement, sessionId: string): boolean;
        afterInsertNode?(node: T): boolean;
        beforeParseDocument(sessionId: string): void;
        beforeCascadeRoot(processing: AppProcessing<T>): void;
        afterParseDocument(sessionId: string): void;
        set application(value);
        get application(): Application<T>;
        constructor(name: string, framework: number, options?: ExtensionOptions);
    }

    class ExtensionUI<T extends NodeUI> extends Extension<T> {
        static includes(source: Undef<string>, value: string): boolean;
        static findNestedElement<U extends NodeUI>(node: U, name: string): Undef<HTMLElement>;
        controller: ControllerUI<T>;
        resource: ResourceUI<T>;
        readonly tagNames?: string[];
        readonly eventOnly?: boolean;
        readonly cascadeAll?: boolean;
        readonly documentBase?: boolean;
        included(element: DocumentElement): boolean;
        is(node: T): boolean;
        condition(node: T, parent: T): boolean;
        processNode(node: T, parent: T): Void<ExtensionResult<T>>;
        processChild(node: T, parent: T): Void<ExtensionResult<T>>;
        addDescendant(node: T): void;
        afterBaseLayout(sessionId: string, cache?: NodeList<T>): void;
        afterConstraints(sessionId: string, cache?: NodeList<T>): void;
        afterResources(sessionId: string, resourceId: number, cache?: NodeList<T>): void;
        beforeBaseLayout(sessionId: string, cache?: NodeList<T>): void;
        beforeFinalize(data: FinalizeDataExtensionUI<T>): void;
        afterFinalize(data: FinalizeDataExtensionUI<T>): void;
        postBaseLayout?(node: T): void;
        postConstraints?(node: T): void;
        postResources?(node: T): void;
        postOptimize?(node: T, rendered: T[]): void;
        postBoxSpacing?(node: T, rendered: T[]): void;
        set application(value);
        get application(): ApplicationUI<T>;
        constructor(name: string, framework: number, options?: ExtensionUIOptions);
    }

    class ExtensionManager<T extends Node> {
        readonly application: Application<T>;
        readonly cache: Set<Extension<T>>;
        add(ext: Extension<T> | string): boolean;
        remove(ext: Extension<T> | string): boolean;
        get(name: string, builtIn?: boolean): Undef<Extension<T>>;
        checkDependencies(): Undef<string[]>;
        valueOf<U = unknown>(name: string, attr: string, fallback?: U): Undef<U>;
        valueAsObject(name: string, attr: string, fallback?: Null<PlainObject>): Null<PlainObject>;
        valueAsString(name: string, attr: string, fallback?: string): string;
        valueAsNumber(name: string, attr: string, fallback?: number): number;
        valueAsBoolean(name: string, attr: string, fallback?: boolean): boolean;
        get extensions(): Extension<T>[];
    }

    class File<T extends Node> implements FileActionAsync, ErrorAction {
        static downloadFile(data: Blob | string, filename?: string, mimeType?: string): void;
        static copyDocument(value: StringOfArray): StringOfArray;
        resource: Resource<T>;
        readonly archiveFormats: string[];
        loadConfig(uri: string, options?: squared.FileActionOptions): Promise<Void<OutputCommand[]>>;
        loadData(value: string, options: LoadDataOptions): Promise<unknown>;
        copying(pathname: string, options: FileCopyingOptions): FileActionResult;
        archiving(target: string, options: FileArchivingOptions): FileActionResult;
        saveAs(filename: string, options?: FileArchivingOptions): FileActionResult;
        saveFiles(filename: string, options: FileArchivingOptions): FileActionResult;
        copyTo(pathname: string, options?: FileCopyingOptions): FileActionResult;
        copyFiles(pathname: string, options: FileCopyingOptions): FileActionResult;
        appendTo(target: string, options?: FileCopyingOptions): FileActionResult;
        appendFiles(filename: string, options: FileArchivingOptions): FileActionResult;
        finalizeRequestBody(body: RequestData): void;
        getCopyQueryParameters(options: FileCopyingOptions): string;
        getArchiveQueryParameters(options: FileArchivingOptions): string;
        setEndpoint(name: string, value: string): void;
        writeError(message: string, hint?: string): void;
        get userSettings(): UserResourceSettings;
        set hostname(value);
        get hostname(): string;
        constructor(resource: Resource<T>);
    }

    class ContentUI<T extends NodeUI> implements LayoutType {
        parent: T;
        node: T;
        containerType: number;
        alignmentType: number;
        clearMap?: Map<T, string>;
        renderIndex?: number;
        next?: boolean;
        set itemCount(value);
        get itemCount(): number;
        constructor(parent: T, node: T, containerType?: number, alignmentType?: number);
    }

    class LayoutUI<T extends NodeUI> extends squared.lib.base.Container<T> implements ContentUI<T> {
        static create<U extends NodeUI>(options: LayoutOptions<U>): LayoutUI<U>;
        parent: T;
        node: T;
        containerType: number;
        alignmentType: number;
        absolute: boolean;
        clearMap?: Map<T, string>;
        renderIndex?: number;
        next?: boolean;
        rowCount?: number;
        columnCount?: number;
        init(): void;
        setContainerType(containerType: number, alignmentType: number): void;
        addAlign(value: number): number;
        hasAlign(value: number): boolean;
        set itemCount(value);
        get itemCount(): number;
        get linearX(): boolean;
        get linearY(): boolean;
        get floated(): Null<Set<string>>;
        get singleRowAligned(): boolean;
        constructor(parent: T, node: T, containerType?: number, alignmentType?: number, children?: T[]);
    }

    class Node extends squared.lib.base.Container<Node> implements BoxModel, Dimension {
        static readonly TEXT_STYLE: string[];
        static sanitizeCss(element: DocumentElement, style: CssStyleMap, writingMode?: string): CssStyleMap;
        documentRoot: boolean;
        queryMap: Null<Node[][]>;
        shadowHost: Null<ShadowRoot>;
        pseudoElt: PseudoElt | "";
        readonly id: number;
        readonly sessionId: string;
        internalSelf(parent: Null<Node>, depth: number, index?: number, actualParent?: Null<Node>): void;
        internalNodes(children: Node[], elements?: Node[], inlineText?: boolean, shadowRoot?: boolean): void;
        syncWith(sessionId?: string, cache?: boolean): boolean;
        saveAsInitial(): void;
        data<T = unknown>(name: string, attr: string, value?: unknown, overwrite?: boolean): Undef<T>;
        unsetCache(...attrs: (CssStyleAttr | keyof CacheValue)[]): void;
        unsetState(...attrs: (keyof CacheState<Node>)[]) : void;
        ascend(options?: AscendOptions<Node>): Node[];
        descend(options?: DescendOptions<Node>): Node[];
        intersectX(rect: BoxRectDimension, options?: CoordsXYOptions): boolean;
        intersectY(rect: BoxRectDimension, options?: CoordsXYOptions): boolean;
        withinX(rect: BoxRectDimension, options?: OffsetXYOptions): boolean;
        withinY(rect: BoxRectDimension, options?: OffsetXYOptions): boolean;
        outsideX(rect: BoxRectDimension, options?: OffsetXYOptions): boolean;
        outsideY(rect: BoxRectDimension, options?: OffsetXYOptions): boolean;
        css(attr: CssStyleAttr, value?: string, cache?: boolean): string;
        cssInitial(attr: CssStyleAttr, options?: CssInitialOptions): string;
        cssAny(attr: CssStyleAttr, values: string[], options?: CssAnyOptions): boolean;
        cssAscend(attr: CssStyleAttr, options?: CssAscendOptions): string;
        cssSort(attr: CssStyleAttr, options?: CssSortOptions): Node[];
        cssSpecificity(attr: CssStyleAttr): Undef<Specificity>;
        cssParent(attr: CssStyleAttr, value?: string, cache?: boolean): string;
        cssUnit(attr: CssStyleAttr, options?: CssUnitOptions): number;
        cssAsTuple(...attrs: CssStyleAttr[]): string[];
        cssAsObject(...attrs: CssStyleAttr[]): CssStyleMap;
        cssApply(values: CssStyleMap, overwrite?: boolean, cache?: boolean): this;
        cssCopy(node: Node, ...attrs: CssStyleAttr[]): void;
        cssCopyIfEmpty(node: Node, ...attrs: CssStyleAttr[]): void;
        cssTry(attr: CssStyleAttr, value: string, callback?: FunctionBind<this>): boolean;
        cssTryAll(attrs: CssStyleMap, callback?: FunctionBind<this>): CssStyleMap | boolean;
        cssFinally(attrs: CssStyleAttr | CssStyleMap): void;
        parseUnit(value: unknown, options?: NodeParseUnitOptions): number;
        convertUnit(value: unknown, unit?: string, options?: NodeConvertUnitOptions): string;
        has(attr: CssStyleAttr, options?: HasOptions): boolean;
        hasUnit(attr: CssStyleAttr, options?: HasUnitOptions): boolean;
        toInt(attr: CssStyleAttr, fallback?: number, options?: CssInitialOptions): number;
        toFloat(attr: CssStyleAttr, fallback?: number, options?: CssInitialOptions): number;
        toElementInt(attr: string, fallback?: number): number;
        toElementFloat(attr: string, fallback?: number): number;
        toElementBoolean(attr: string, fallback?: boolean): boolean;
        toElementString(attr: string, fallback?: string): string;
        setBounds(cache?: boolean): Null<BoxRectDimension>;
        resetBounds(recalibrate?: boolean): void;
        getContainerSize(options?: NodeUnitOptions): number;
        min(attr: string, options?: MinMaxOptions): Node;
        max(attr: string, options?: MinMaxOptions): Node;
        querySelector(value: string): Null<Node>;
        querySelectorAll(value: string, sorted?: boolean, customMap?: Node[][]): Node[];
        ancestors(value?: string, options?: AscendOptions<Node>): Node[];
        descendants(value?: string, options?: DescendOptions<Node>): Node[];
        siblings(value?: string, options?: SiblingsOptions<Node>): Node[];
        valueOf(attr: CssStyleAttr, options?: CssInitialOptions): string;
        get parent(): Null<Node>;
        get shadowRoot(): boolean;
        get depth(): number;
        get childIndex(): number;
        get naturalChildren(): Node[];
        get naturalElements(): Node[];
        get dir(): string;
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
        get buttonElement(): boolean;
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
        get positionFixed(): boolean;
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
        get inlineText(): boolean;
        get block(): boolean;
        get blockStatic(): boolean;
        get plainText(): boolean;
        get textContent(): string;
        get lineBreak(): boolean;
        get pageFlow(): boolean;
        get autoMargin(): AutoMargin;
        get floating(): boolean;
        get float(): FloatDirectionAttr;
        get baseline(): boolean;
        get multiline(): boolean;
        get contentBox(): boolean;
        get contentBoxWidth(): number;
        get contentBoxHeight(): number;
        get flexdata(): FlexData;
        get flexbox(): FlexBox;
        get zIndex(): number;
        get opacity(): number;
        get backgroundColor(): string;
        get backgroundImage(): string;
        get visibleStyle(): VisibleStyle;
        get fontSize(): number;
        get verticalAlign(): number;
        get actualParent(): Null<Node>;
        get absoluteParent(): Null<Node>;
        get wrapperOf(): Null<Node>;
        get actualWidth(): number;
        get actualHeight(): number;
        get actualDimension(): Dimension;
        get containerHeight(): boolean;
        get percentWidth(): number;
        get percentHeight(): number;
        get firstChild(): Null<Node>;
        get lastChild(): Null<Node>;
        get firstElementChild(): Null<Node>;
        get lastElementChild(): Null<Node>;
        get previousSibling(): Null<Node>;
        get nextSibling(): Null<Node>;
        get previousElementSibling(): Null<Node>;
        get nextElementSibling(): Null<Node>;
        get attributes(): StringMap;
        get checked(): boolean;
        get boundingClientRect(): Null<DOMRect>;
        get preserveWhiteSpace(): boolean;
        get style(): CSSStyleDeclaration;
        get cssStyle(): CssStyleMap;
        get textStyle(): CssStyleMap;
        get elementData(): Null<ElementData>;
        get initial(): Null<InitialData<Node>>;
        constructor(id: number, sessionId?: string, element?: Element, children?: Node[]);
    }

    class NodeUI extends Node implements LayoutType {
        static linearData<T>(list: T[], cleared?: Map<T, string>, absolute?: boolean): LinearData;
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
        renderChildren: NodeUI[];
        renderParent: Null<NodeUI>;
        renderExtension: Null<Extension<NodeUI>[]>;
        renderTemplates: Null<NodeTemplate<NodeUI>[]>;
        renderedAs: Null<NodeTemplate<NodeUI>>;
        documentChildren?: NodeUI[];
        outerWrapper?: NodeUI;
        companion?: NodeUI;
        setControlType(controlName: string, containerType?: number): void;
        setExclusions(): void;
        setLayout(): void;
        setAlignment(): void;
        setBoxSpacing(): void;
        attr(name: string, attr: string, value?: string, overwrite?: boolean): string;
        alignParent(position: AnchorPositionAttr): boolean;
        alignSibling(position: AnchorPositionAttr, documentId?: string): string;
        anchorChain(...values: PositionAttr[]): NodeUI[];
        localizeString(value: string): string;
        inherit(node: Node, ...modules: string[]): Null<PlainObject>;
        inheritApply(module: string, data: PlainObject): void;
        clone(id: number): void;
        cloneBase(node: NodeUI): void;
        is(containerType: number): boolean;
        of(containerType: number, ...alignmentType: number[]): boolean;
        namespace(name: string): StringMap;
        namespaces(): [string, StringMap][];
        unsafe<T = unknown>(name: string | PlainObject, value?: unknown): Undef<T>;
        delete(name: string, ...attrs: string[]): void;
        deleteOne(name: string, attr: string): void;
        apply(options: PlainObject): void;
        lockAttr(name: string, attr: string): void;
        unlockAttr(name: string, attr: string): void;
        lockedAttr(name: string, attr: string): boolean;
        unsetCache(...attrs: (CssStyleAttr | keyof CacheValueUI)[]): void;
        addAlign(value: number): void;
        removeAlign(value: number): void;
        hasAlign(value: number): boolean;
        hasProcedure(value: number): boolean;
        hasResource(value: number): boolean;
        hasSection(value: number): boolean;
        exclude(options: ExcludeOptions): void;
        hide(options?: HideOptions<NodeUI>): Null<NodeTemplate<NodeUI>>;
        replaceTry(options: ReplaceTryOptions<NodeUI>): boolean;
        removeTry(options?: RemoveTryOptions<NodeUI>): Null<NodeTemplate<NodeUI>>;
        render(parent: NodeUI): void;
        renderEach(predicate: IteratorPredicate<NodeUI, void>): this;
        parseWidth(value: string, parent?: boolean): number;
        parseHeight(value: string, parent?: boolean): number;
        actualRect(position: PositionAttr, dimension?: BoxType): number;
        actualPadding(attr: "paddingTop" | "paddingBottom", value: number): number;
        actualBoxWidth(value?: number): number;
        actualTextHeight(options?: TextHeightOptions): number;
        alignedVertically(siblings?: Null<Node[]>, cleared?: Null<Map<Node, string>>, horizontal?: boolean, partition?: boolean): number;
        previousSiblings(options?: TraverseSiblingsOptions): NodeUI[];
        nextSiblings(options?: TraverseSiblingsOptions): NodeUI[];
        actualSpacing(region: lib.constant.BOX_STANDARD): number;
        modifyBox(region: lib.constant.BOX_STANDARD, value: number, negative?: boolean): void;
        setBox(region: lib.constant.BOX_STANDARD, options: BoxOptions): void;
        getBox(region: lib.constant.BOX_STANDARD): [number, number];
        resetBox(region: lib.constant.BOX_STANDARD, node?: NodeUI): void;
        transferBox(region: lib.constant.BOX_STANDARD, node: NodeUI): void;
        registerBox(region: lib.constant.BOX_STANDARD, node?: NodeUI): Null<NodeUI>;
        setCacheValue(attr: keyof CacheValueUI, value: any): void;
        setCacheState(attr: keyof CacheStateUI<NodeUI>, value: any): void;
        extractAttributes(depth: number): string;
        cssSet(attr: CssStyleAttr, value: string, cache?: boolean): string;
        translateX(value: number, options?: TranslateOptions): boolean;
        translateY(value: number, options?: TranslateOptions): boolean;
        getBoxSpacing(): [number, number, number, number];
        getAnchoredSiblings(orientation: OrientationAttr): NodeUI[];
        getPseudoElement(name: PseudoElt, attr?: CssStyleAttr): Undef<CssStyleMap | string>;
        isResizable(attr: DimensionSizableAttr, not?: StringOfArray): boolean;
        fitToScreen(value: Dimension): Dimension;
        cssValue(attr: CssStyleAttr): string;
        cssValues(...attrs: CssStyleAttr[]): string[];
        set parent(value);
        get parent(): Null<NodeUI>;
        set documentParent(value);
        get documentParent(): NodeUI;
        set containerName(value);
        get containerName(): string;
        set autoPosition(value);
        get autoPosition(): boolean;
        set inlineText(value);
        get inlineText(): boolean;
        set textContent(value);
        get textContent(): string;
        get styleText(): boolean;
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
        set horizontalRows(value);
        get horizontalRows(): Null<NodeUI[][]>
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
        set renderAs(value);
        get renderAs(): Null<NodeUI>;
        set labelFor(value);
        get labelFor(): Null<NodeUI>;
        set innerWrapped(value);
        get innerWrapped(): Null<NodeUI>;
        set use(value);
        get use(): string;
        set localSettings(value);
        get localSettings(): LocalSettingsUI;
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
        get inlineVertical(): boolean;
        get inlineDimension(): boolean;
        get blockStatic(): boolean;
        get blockVertical(): boolean;
        get blockDimension(): boolean;
        get inlineFlow(): boolean;
        get verticalAligned(): boolean;
        get variableWidth(): boolean;
        get variableHeight(): boolean;
        get fullWidth(): boolean;
        get fullHeight(): boolean;
        get positiveAxis(): boolean;
        get leftTopAxis(): boolean;
        get baselineElement(): boolean;
        get flowElement(): boolean;
        get flexRow(): boolean;
        get flexColumn(): boolean;
        get previousSibling(): Null<NodeUI>;
        get nextSibling(): Null<NodeUI>;
        get firstStaticChild(): Null<NodeUI>;
        get lastStaticChild(): Null<NodeUI>;
        get onlyChild(): boolean;
        get onlyStaticChild(): boolean;
        get horizontalRowStart(): boolean;
        get horizontalRowEnd(): boolean;
        get innerBefore(): Null<NodeUI>;
        get innerAfter(): Null<NodeUI>;
        get rendering(): boolean;
        get boxReset(): number[];
        get boxAdjustment(): number[];
        get overflowX(): boolean;
        get overflowY(): boolean;
        get textEmpty(): boolean;
        get textWidth(): number;
        get innerMostWrapped(): NodeUI;
        get outerMostWrapper(): NodeUI;
        get firstLineStyle(): Null<CssStyleMap>;
        get firstLetterStyle(): Null<CssStyleMap>;
        get textAlignLast(): string;
        get textJustified(): boolean;
        get outerRegion(): BoxRectDimension;
    }

    class NodeGroupUI extends NodeUI {}

    class NodeList<T extends Node> extends squared.lib.base.Container<T> {
        readonly sessionId: string;
        readonly resourceId: number;
        afterAdd?: (this: T, options: NodeListAddOptions) => void;
        add(node: T, options?: NodeListAddOptions): this;
        sort(predicate: FunctionSort<T>): this;
        constructor(children?: T[], sessionId?: string, resourceId?: number);
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
        namespace session {
            class MultiSet<T extends Node> implements Set<T> {
                readonly [Symbol.toStringTag]: string;
                [Symbol.iterator](): IterableIterator<T>;
                keys(sessionId?: string): IterableIterator<T>;
                values(sessionId?: string): IterableIterator<T>;
                entries(sessionId?: string): IterableIterator<[T, T]>;
                clear(sessionId?: string): void;
                add(node: T): this;
                delete(node: T): boolean;
                has(node: T): boolean;
                combine(): void;
                forEach(predicate: (a: T, b: T, set: Set<T>) => void, thisArg?: any): void;
                get size(): number;
            }
        }

        namespace internal {
            const enum EXT_NAME {
                ACCESSIBILITY = 'squared.accessibility',
                COLUMN = 'squared.column',
                CSS_GRID = 'squared.css-grid',
                FLEXBOX = 'squared.flexbox',
                GRID = 'squared.grid',
                LIST = 'squared.list',
                RELATIVE = 'squared.relative',
                SPRITE = 'squared.sprite',
                TABLE = 'squared.table',
                VERTICAL_ALIGN = 'squared.verticalalign',
                WHITESPACE = 'squared.whitespace'
            }
            const enum CREATE_NODE {
                DEFER = 1,
                DELEGATE = 1 << 1,
                CASCADE = 1 << 2,
                RESET_MARGIN = 1 << 3,
                RESET_CONTENTBOX = 1 << 4,
                INHERIT_DATASET = 1 << 5
            }
        }

        namespace constant {
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
                PERCENT = 1 << 14,
                FLOAT_LAYOUT = 1 << 15
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
            const enum APP_SECTION {
                DOM_TRAVERSE = 1,
                EXTENSION = 1 << 1,
                RENDER = 1 << 2,
                ALL = DOM_TRAVERSE | EXTENSION | RENDER
            }
            const enum NODE_RESOURCE {
                BOX_STYLE = 1,
                BOX_SPACING = 1 << 1,
                FONT_STYLE = 1 << 2,
                VALUE_STRING = 1 << 3,
                IMAGE_SOURCE = 1 << 4,
                ASSET = FONT_STYLE | VALUE_STRING | IMAGE_SOURCE,
                ALL = BOX_STYLE | BOX_SPACING | ASSET
            }
            const enum NODE_PROCEDURE {
                CONSTRAINT = 1,
                LAYOUT = 1 << 1,
                ALIGNMENT = 1 << 2,
                ACCESSIBILITY = 1 << 3,
                LOCALIZATION = 1 << 4,
                CUSTOMIZATION = 1 << 5,
                ALL = CONSTRAINT | LAYOUT | ALIGNMENT | ACCESSIBILITY | LOCALIZATION | CUSTOMIZATION
            }
        }

        namespace css {
            function parseKeyframes(rules: CSSRuleList): Null<KeyframeData>;
            function getKeyframesRules(documentRoot?: DocumentOrShadowRoot): KeyframesMap;
            function parseTransform(value: string, options?: TransformOptions): TransformData[];
        }

        namespace dom {
            function getTextMetrics(value: string, fontSize: number, fontFamily?: string): Undef<TextMetrics>;
            function removeElementsByClassName(className: string): void;
            function getElementsBetweenSiblings(elementStart: Null<Element>, elementEnd: Element): Element[];
            function getSrcSet(element: HTMLImageElement, mimeType?: MIMEOrAll, fontSize?: number): Undef<ImageSrcData[]>;
        }

        namespace internal {
            function parseTask(value: Undef<string>): Undef<TaskAction[]>;
            function parseWatchInterval(value: Undef<string>): Undef<WatchInterval>;
        }

        namespace regex {
            const STRING: {
                CSS_COLOR: string;
                CSS_COLORSTOP: string;
                CSS_VARNAME: string;
                CSS_VARVALUE: string;
                CSS_QUOTE: string;
            };

            const CSS: {
                TRANSPARENT: RegExp;
                BACKGROUNDIMAGE_G: RegExp;
            };

            const DOM: {
                SRCSET: RegExp;
                ENTITY_G: RegExp;
                AMPERSAND_G: RegExp;
            };
        }

        namespace util {
            function fromMimeType(value: string): string;
            function parseMimeType(value: string): string;
            function getComponentEnd(value: string, leading?: string, trailing?: string): string;
            function appendSeparator(preceding?: string, value?: string, separator?: string): string;
            function generateUUID(format?: string): string;
            function upperCaseString(value: string): string;
            function lowerCaseString(value: string): string;
            function assignEmptyValue(dest: PlainObject, ...attrs: string[]): void;
            function searchObject(obj: ObjectMap<unknown>, value: string, checkName?: boolean): Generator<[string, unknown], void>;
            function trimBoth(value: string, char?: string, trim?: boolean): string;
            function trimString(value: string, pattern: string): string;
            function trimStart(value: string, pattern: string): string;
            function trimEnd(value: string, pattern: string): string;
            function flatArray<T>(list: unknown[], depth?: number): T[];
            function parseGlob(value: string, options?: ParseGlobOptions): IGlobExp;
        }
    }
}