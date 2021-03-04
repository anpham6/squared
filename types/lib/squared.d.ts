/* eslint no-shadow: "off" */

declare module "lib" {
    namespace base {
        class Container<T = any> implements Iterable<T> {
            children: T[];
            [Symbol.iterator](): Iterator<T>;
            item(index: number, value?: T): Undef<T>;
            add(item: T): this;
            addAt(index: number, ...items: T[]): this;
            addAll(list: T[] | Container): this;
            remove(item: T): Undef<T>;
            removeAt(index: number): Undef<T>;
            removeAll(list: T[] | Container): T[];
            retainAs(list: T[]): this;
            each(predicate: IteratorPredicate<T, void>, options?: ContainerRangeOptions): this;
            every(predicate: IteratorPredicate<T, boolean>, options?: ContainerRangeOptions): boolean;
            removeIf(predicate: IteratorPredicate<T, boolean>, options?: ContainerRemoveIfOptions<T>): T[];
            find(predicate: IteratorPredicate<T, boolean>, options?: ContainerFindOptions<T>): Undef<T>;
            cascade(predicate?: IteratorPredicate<T, unknown>, options?: ContainerCascadeOptions<T>): T[];
            map<U = unknown>(predicate: IteratorPredicate<T, U>): U[];
            sortBy(...attrs: (string | boolean)[]): this;
            contains(item: T): boolean;
            clear(): this;
            iterator(): ListIterator<T>;
            isEmpty(): boolean;
            size(): number;
            toArray(): T[];
            constructor(children?: T[]);
        }

        class ArrayIterator<T = any> {
            next(): Undef<T>;
            hasNext(): boolean;
            remove(): void;
            forEachRemaining(predicate: BindGeneric<T, void>): void;
            constructor(children: T[]);
        }

        class ListIterator<T = any> extends ArrayIterator<T> {
            add(item: T): void;
            set(item: T): void;
            nextIndex(): number;
            hasPrevious(): boolean;
            previous(): Undef<T>;
            previousIndex(): number;
            constructor(children: T[]);
        }

        class Pattern {
            found: number;
            matcher(input: string): void;
            find(start?: number): boolean;
            lookingAt(): boolean;
            matches(): boolean;
            start(index?: number): number;
            end(index?: number): number;
            group(index?: NumString): Undef<string>;
            groups(start?: number, end?: number): string[];
            groupCount(): number;
            map<T>(predicate: IteratorPredicate<string, T>, start?: number, end?: number): T[];
            replaceAll(replacement: string | PatternGroupPredicate, replaceCount?: number): string;
            replaceFirst(replacement: string | PatternGroupPredicate): string;
            usePattern(expression: string | RegExp, flags?: string): void;
            pattern(): string;
            reset(input?: string): void;
            toMatchResult(): Null<RegExpExecArray>;
            constructor(expression: string | RegExp, flags?: string);
        }
    }

    namespace color {
        function parseColor(value: string, opacity?: number): Null<ColorData>;
        function parseRGBA(value: string): Null<RGBA>;
        function getHex(value: number): string;
        function convertHex(value: RGBA, ignoreAlpha?: boolean): string;
        function convertHSLA(value: RGBA): HSLA;
        function convertRGBA(value: HSLA): RGBA;
        function formatRGBA(value: RGBA): string;
        function formatHSLA(value: HSLA): string;
        function isTransparent(value: string): boolean;
    }

    namespace client {
        function isPlatform(value: NumString): boolean;
        function isUserAgent(value: NumString): boolean;
        function getDeviceDPI(): number;
    }

    namespace constant {
        const enum PLATFORM {
            WINDOWS = 1,
            MAC = 1 << 1,
            LINUX = 1 << 2
        }
        const enum USER_AGENT {
            CHROME = 1,
            SAFARI = 1 << 1,
            FIREFOX = 1 << 2,
            EDGE = 1 << 3
        }
        const enum CSS_UNIT {
            NONE = 0,
            LENGTH = 1,
            PERCENT = 1 << 1,
            TIME = 1 << 2,
            ANGLE = 1 << 3,
            INTEGER = 1 << 4,
            DECIMAL = 1 << 5
        }
        const enum CSS_TRAITS {
            CALC = 1,
            SHORTHAND = 1 << 1,
            LAYOUT = 1 << 2,
            CONTAIN = 1 << 3,
            COLOR = 1 << 4,
            DEPRECATED = 1 << 5,
            NONE = 1 << 6,
            AUTO = 1 << 7,
            UNIT = 1 << 8
        }
    }

    namespace internal {
        const enum LAYOUT_TABLE {
            FIXED = 1,
            COLLAPSE = 1 << 1,
            EXPAND = 1 << 2
        }
        const enum LAYOUT_TABLETYPE {
            NONE,
            STRETCH,
            FIXED,
            VARIABLE,
            COMPRESS
        }
        const enum LAYOUT_TABLECELL {
            EXPAND = 1,
            DOWNSIZED = 1 << 1,
            EXCEED = 1 << 2,
            FLEXIBLE = 1 << 3,
            SHRINK = 1 << 4,
            PLACED = 1 << 5
        }
        const enum LAYOUT_GRIDCELL {
            ROW_START = 1,
            ROW_END = 1 << 1,
            CELL_START = 1 << 2,
            CELL_END = 1 << 3
        }
        const enum LAYOUT_CSSGRID {
            AUTO_FIT = 1,
            AUTO_FILL = 1 << 1,
            FIXED_WIDTH = 1 << 2,
            FLEXIBLE = 1 << 3
        }
        const enum STYLE_STATE {
            FAIL,
            READY,
            CHANGED
        }
    }

    namespace css {
        const PROXY_INLINESTYLE: Readonly<CSSStyleDeclaration>;
        const CSS_PROPERTIES: CssProperties;
        const ELEMENT_BLOCK: string[];
        function getPropertiesAsTraits(value: number): ObjectMap<CssPropertyData>;
        function getStyle(element: Element, pseudoElt?: PseudoElt): CSSStyleDeclaration;
        function getRemSize(fixedWidth?: boolean): number;
        function getFontSize(element: Element): number;
        function hasComputedStyle(element: Element): element is HTMLElement;
        function checkWritingMode(attr: string, value?: string): StringOfArray;
        function checkStyleValue(element: StyleElement, attr: string, value: string): string;
        function checkFontSizeValue(value: string, fixedWidth?: boolean): string;
        function checkMediaRule(value: string, fontSize?: number): boolean;
        function parseSelectorText(value: string): string[];
        function getSpecificity(value: string): number;
        function parseKeyframes(rules: CSSRuleList): Null<KeyframeData>;
        function getKeyframesRules(documentRoot?: DocumentOrShadowRoot): KeyframesMap;
        function calculate(value: string, options?: CalculateOptions): number;
        function calculateVar(element: StyleElement, value: string, options?: CalculateVarOptions): number;
        function calculateVarAsString(element: StyleElement, value: string, options?: CalculateVarAsStringOptions): string;
        function calculateStyle(element: StyleElement, attr: string, value: string, boundingBox?: Null<Dimension>): string;
        function parseVar(element: StyleElement, value: string, style?: CSSStyleDeclaration): string;
        function getSrcSet(element: HTMLImageElement, mimeType?: MIMEOrAll): Undef<ImageSrcSet[]>;
        function extractURL(value: string): Undef<string>;
        function resolveURL(value: string): Undef<string>;
        function insertStyleSheetRule(value: string, index?: number, shadowRoot?: ShadowRoot): HTMLStyleElement;
        function parseUnit(value: string, options?: ParseUnitOptions): number;
        function convertUnit(value: NumString, unit: string, options?: ConvertUnitOptions): string;
        function parseTransform(value: string, options?: TransformOptions): TransformData[];
        function parseAngle(value: string, fallback?: number): number;
        function convertAngle(value: string, unit?: string, fallback?: number): number;
        function parseTime(value: string): number;
        function parseResolution(value: string): number;
        function formatPX(value: number): string;
        function formatPercent(value: NumString, round?: boolean): string;
        function isLength(value: string, percent?: boolean): boolean;
        function isPercent(value: string, digits?: boolean): boolean;
        function isCalc(value: string): boolean;
        function isCustomProperty(value: string): boolean;
        function isTime(value: string): boolean;
        function isAngle(value: string): boolean;
        function isPx(value: string): boolean;
        function hasEm(value: string): boolean;
        function hasCalc(value: string): boolean;
        function hasCoords(value: string): boolean;
    }

    namespace dom {
        function newBoxRectDimension(): BoxRectDimension;
        function withinViewport(rect: DOMRect | ClientRect): boolean;
        function assignRect(rect: DOMRect | ClientRect | BoxRectDimension, scrollPosition?: boolean): BoxRectDimension;
        function getRangeClientRect(element: Element): Null<BoxRectDimension>;
        function getParentElement(element: Element): Null<HTMLElement>;
        function removeElementsByClassName(className: string): void;
        function getElementsBetweenSiblings(elementStart: Null<Element>, elementEnd: Element): Element[];
        function getNamedItem(element: Element, attr: string): string;
        function createElement(tagName: string, options: CreateElementOptions): HTMLElement;
        function getTextMetrics(value: string, fontSize: number, fontFamily?: string): Undef<TextMetrics>;
    }

    namespace error {
        const FRAMEWORK_NOT_INSTALLED: string;
        const SERVER_REQUIRED: string;
        const DIRECTORY_NOT_PROVIDED: string;
        const UNABLE_TO_FINALIZE_DOCUMENT: string;
        const INVALID_ASSET_REQUEST: string;
        const OPERATION_NOT_SUPPORTED: string;
        const DOCUMENT_ROOT_NOT_FOUND: string;
        const DOCUMENT_IS_CLOSED: string;
        const CSS_CANNOT_BE_PARSED: string;
        function reject<T = void>(value: string): Promise<T>;
    }

    namespace math {
        function convertRadian(value: number): number;
        function equal(a: number, b: number, precision?: number): boolean;
        function moreEqual(a: number, b: number, precision?: number): boolean;
        function lessEqual(a: number, b: number, precision?: number): boolean;
        function truncate(value: NumString, precision?: number): string;
        function truncateFraction(value: number): number;
        function truncateTrailingZero(value: string): string;
        function triangulate(a: number, b: number, clen: number): [number, number];
        function absoluteAngle(start: Point, end: Point): number;
        function relativeAngle(start: Point, end: Point, orientation?: number): number;
        function offsetAngleX(angle: number, value: number): number;
        function offsetAngleY(angle: number, value: number): number;
        function clamp(value: number, min?: number, max?: number): number;
        function multipleOf(values: number[], min?: number, offset?: Null<number[]>): number;
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
            UNIT_LENGTH: string;
            DATAURI: string;
            TAG_ATTR: string;
            TAG_OPEN: string;
            CSS_ANGLE: string;
            CSS_TIME: string;
            CSS_RESOLUTION: string;
        };
        const FILE: {
            NAME: RegExp;
            PROTOCOL: RegExp;
            BASE64: RegExp;
            SVG: RegExp;
        };
        const CSS: {
            URL: RegExp;
            HEX: RegExp;
            RGBA: RegExp;
            HSLA: RegExp;
            SELECTOR_G: RegExp;
            SELECTOR_LABEL: RegExp;
            SELECTOR_PSEUDO_ELEMENT: RegExp;
            SELECTOR_PSEUDO_CLASS: RegExp;
            SELECTOR_ATTR: RegExp;
            SELECTOR_ATTR_G: RegExp;
            SELECTOR_ENCLOSING: RegExp;
        };
        const TRANSFORM: {
            MATRIX: RegExp;
            ROTATE: RegExp;
            SKEW: RegExp;
            SCALE: RegExp;
            TRANSLATE: RegExp;
            PERSPECTIVE: RegExp;
        };
    }

    namespace session {
        function newSessionInit(value: string): Map<Element, ElementData>;
        function clearSessionAll(): void;
        function setElementCache(element: Element, attr: string, data: unknown, sessionId?: string): void;
        function getElementCache<T = unknown>(element: Element, attr: string, sessionId?: string): Undef<T>;
        function getElementData(element: Element, sessionId?: string): Undef<ElementData>;
        function getElementAsNode<T>(element: Element, sessionId?: string): Null<T>;
    }

    namespace util {
        function promisify<T = unknown>(fn: FunctionType<any>): FunctionType<Promise<T>>;
        function allSettled<T>(values: readonly (T | PromiseLike<T>)[]): Promise<PromiseSettledResult<T>[]>;
        function parseMimeType(value: string): string;
        function hasKeys(obj: PlainObject): boolean;
        function capitalize(value: string, upper?: boolean): string;
        function convertHyphenated(value: string, char?: string): string;
        function convertCamelCase(value: string, char?: string): string;
        function convertWord(value: string, dash?: boolean): string;
        function convertInt(value: string, fallback?: number): number;
        function convertFloat(value: string, fallback?: number): number;
        function convertPercent(value: string, fallback?: number): number;
        function convertBase64(value: ArrayBuffer): string;
        function delimitString(value: DelimitStringOptions | string, ...appending: string[]): string;
        function padStart(value: string, length: number, char: string): string;
        function spliceString(value: string, index: number, length: number): string;
        function splitPair(value: string, char: string, trim?: boolean, last?: boolean): [string, string];
        function splitPairStart(value: string, char: string, trim?: boolean, last?: boolean): string;
        function splitPairEnd(value: string, char: string, trim?: boolean, last?: boolean): string;
        function splitEnclosing(value: string, prefix?: string | RegExp, separator?: string, opening?: string, closing?: string): string[];
        function lastItemOf<T>(value: ArrayLike<T>): Undef<T>;
        function minMaxOf<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, number>, operator: ">" | "<" | ">=" | "<=", limiter?: number): [Null<T>, number];
        function hasBit(value: number, offset: number): boolean;
        function isNumber(value: string): boolean;
        function isString(value: unknown): value is string;
        function isArray<T>(value: unknown): value is Array<T>;
        function isObject<T = PlainObject>(value: unknown): value is T;
        function isPlainObject<T = PlainObject>(value: unknown): value is T;
        function isBase64(value: string): boolean;
        function isEmptyString(value: string): boolean;
        function isEqual(source: unknown, other: unknown): boolean;
        function cloneInstance<T>(value: T): T;
        function cloneObject<T>(data: T, options?: CloneObjectOptions<T>): T;
        function resolvePath(value: string, href?: string): string;
        function trimBoth(value: string, pattern: string): string;
        function trimString(value: string, pattern: string): string;
        function trimStart(value: string, pattern: string): string;
        function trimEnd(value: string, pattern: string): string;
        function escapePattern(value: string): string;
        function fromLastIndexOf(value: string, ...char: string[]): string;
        function startsWith(value: Optional<string>, leading: string): boolean;
        function endsWith(value: Optional<string>, trailing: string): boolean;
        function hasValue<T>(value: unknown): value is T;
        function withinRange(a: number, b: number, offset?: number): boolean;
        function assignEmptyProperty(dest: PlainObject, source: PlainObject): PlainObject;
        function assignEmptyValue(dest: PlainObject, ...attrs: string[]): void;
        function sortNumber(values: number[], ascending?: boolean): number[];
        function findSet<T>(list: Set<T>, predicate: IteratorPredicate<T, boolean, Set<T>>): Undef<T>;
        function sortByArray<T = unknown>(list: T[], ...attrs: (string | boolean)[]): T[];
        function flatArray<T>(list: unknown[], depth?: number): T[];
        function spliceArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback?: IteratorPredicate<T, void>, deleteCount?: number): T[];
        function partitionArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, boolean>): [T[], T[]];
        function sameArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, unknown>): boolean;
        function joinArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, string>, char?: string): string;
        function iterateArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, unknown>, start?: number, end?: number): number;
        function iterateReverseArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, unknown>, start?: number, end?: number): number;
        function replaceMap<T, U>(list: (T | U)[], predicate: IteratorPredicate<T, U>): U[];
        function plainMap<T, U>(list: ArrayLike<T>, predicate: IteratorPredicate<T, U>): U[];
    }
}