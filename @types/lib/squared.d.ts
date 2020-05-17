declare module "lib" {
    namespace base {
        class Container<T> implements Iterable<T> {
            [Symbol.iterator](): Iterator<T>;
            item(index?: number, value?: T): Undef<T>;
            append(item: T): this;
            remove(...items: T[]): T[];
            removeAt(index: number): Undef<T>;
            retain(list: T[]): this;
            contains(item: T): boolean;
            duplicate(): T[];
            clear(): this;
            each(predicate: IteratorPredicate<T, void>, options?: ContainerFindOptions<T>): this;
            iterate(predicate: IteratorPredicate<T, void | boolean>, options?: ContainerRangeOptions): number;
            every(predicate: IteratorPredicate<T, boolean>, options?: ContainerRangeOptions): boolean;
            extract(predicate: IteratorPredicate<T, boolean>, options?: ContainerCascadeOptions<T>): T[];
            find(predicate: IteratorPredicate<T, boolean>, options?: ContainerFindOptions<T>): Undef<T>;
            some(predicate: IteratorPredicate<T, boolean>, options?: ContainerFindOptions<T>): boolean;
            cascade(predicate?: (item: T) => void | boolean, options?: ContainerCascadeOptions<T>): T[];
            map<U>(predicate: IteratorPredicate<T, U>): U[];
            same(predicate: IteratorPredicate<T, any>): boolean;
            partition(predicate: IteratorPredicate<T, boolean>): [T[], T[]];
            findIndex(predicate: IteratorPredicate<T, boolean>): number;
            sort(predicate: (a: T, b: T) => number): this;
            concat(list: T[]): this;
            join(...other: Container<T>[]): this;
            iter(): ListIterator<T>;
            get children(): T[];
            get isEmpty(): boolean;
            get length(): number;
            constructor(children?: T[]);
        }

        class ArrayIterator<T> {
            public index: number;
            public length: number;
            public next(): Undef<T>;
            public hasNext(): boolean;
            public remove(): void;
            public forEachRemaining(action: BindGeneric<T, void>): void;
            constructor(children: T[]);
        }

        class ListIterator<T> extends ArrayIterator<T> {
            add(item: T): void;
            set(item: T): void;
            nextIndex(): number;
            hasPrevious(): boolean;
            previous(): Undef<T>;
            previousIndex(): number;
            constructor(children: T[]);
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
        const CSS_PROPERTIES: CssProperties;
        const enum CSS_UNIT {
            NONE = 0,
            LENGTH = 2,
            PERCENT = 4,
            TIME = 8,
            ANGLE = 16,
            INTEGER = 32,
            DECIMAL = 64
        }
        const BOX_POSITION: string[];
        const BOX_MARGIN: string[];
        const BOX_BORDER: string[][];
        const BOX_PADDING: string[];
        const TEXT_STYLE: string[];
        function getStyle(element: Null<Element>, pseudoElt?: string): CSSStyleDeclaration;
        function getFontSize(element: Element): number;
        function hasComputedStyle(element: Element): element is HTMLElement;
        function checkWritingMode(attr: string, value: string): string;
        function checkStyleValue(element: HTMLElement, attr: string, value: string, style?: CSSStyleDeclaration): string;
        function checkMediaRule(value: string, fontSize?: number): boolean;
        function parseSelectorText(value: string, document?: boolean): string[];
        function getSpecificity(value: string): number;
        function getKeyframesRules(): ObjectMap<KeyframesData>;
        function parseKeyframes(rules: CSSRuleList): KeyframesData;
        function isParentStyle(element: Element, attr: string, ...styles: string[]): boolean;
        function getInheritedStyle(element: Element, attr: string, exclude?: RegExp, ...tagNames: string[]): string;
        function calculate(value: string, options?: CalculateOptions): number;
        function calculateVar(element: CSSElement, value: string, options?: CalculateVarOptions): number;
        function calculateVarAsString(element: CSSElement, value: string, options?: CalculateVarAsStringOptions): string;
        function calculateStyle(element: CSSElement, attr: string, value: string, boundingBox?: Dimension): string;
        function parseVar(element: CSSElement, value: string): string;
        function getParentBoxDimension(element: CSSElement): Dimension;
        function getBackgroundPosition(value: string, dimension: Dimension, options?: BackgroundPositionOptions): BoxRectPosition;
        function getSrcSet(element: HTMLImageElement, mimeType?: string[]): ImageSrcSet[];
        function convertListStyle(name: string, value: number, valueAsDefault?: boolean): string;
        function extractURL(value: string): string;
        function resolveURL(value: string): string;
        function insertStyleSheetRule(value: string, index?: number): HTMLStyleElement;
        function convertPX(value: string, fontSize?: number): string;
        function parseUnit(value: string, fontSize?: number, screenDimension?: Dimension): number;
        function parseTransform(value: string, accumulate?: boolean, fontSize?: number): TransformData[];
        function parseAngle(value: string, fallback?: number): number;
        function convertAngle(value: string, unit?: string, fallback?: number): number;
        function parseTime(value: string): number;
        function formatPX(value: number): string;
        function formatPercent(value: string | number, round?: boolean): string;
        function isLength(value: string, percent?: boolean): boolean;
        function isPercent(value: string): boolean;
        function isCalc(value: string): boolean;
        function isCustomProperty(value: string): boolean;
        function isAngle(value: string): boolean;
        function hasCalc(value: string): boolean;
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
            UNIT_LENGTH: string;
            DATAURI: string;
            CSS_SELECTOR_LABEL: string;
            CSS_SELECTOR_PSEUDO_ELEMENT: string;
            CSS_SELECTOR_PSEUDO_CLASS: string;
            CSS_SELECTOR_ATTR: string;
            CSS_ANGLE: string;
            CSS_TIME: string;
            CSS_CALC: string;
        };
        const UNIT: {
            DECIMAL: RegExp;
            LENGTH: RegExp;
            LENGTH_PERCENTAGE: RegExp;
            PERCENT: RegExp;
        };
        const FILE: {
            NAME: RegExp;
            SVG: RegExp;
        };
        const CSS: {
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
            BREAKWORD_G: RegExp;
            NONWORD_G: RegExp;
            TAGNAME_G: RegExp;
        };
        const TRANSFORM: {
            MATRIX: RegExp;
            ROTATE: RegExp;
            SKEW: RegExp;
            SCALE: RegExp;
            TRANSLATE: RegExp;
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
        function frameworkNotInstalled<T = void>(): Promise<T>;
    }

    namespace util {
        function promisify<T = unknown>(fn: FunctionType<any>): FunctionType<Promise<T>>
        function hasMimeType(formats: MIMEOrAll, value: string): boolean;
        function parseMimeType(value: string): string;
        function fromMimeType(value: string): string;
        function hasKeys(obj: {}): boolean;
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
        function convertEnum(value: number, source: {}, derived: {}): string;
        function randomUUID(separator?: string): string;
        function formatString(value: string, ...params: string[]): string;
        function delimitString(options: DelimitStringOptions, ...appending: string[]): string;
        function splitEnclosing(value: string, prefix?: string, separator?: string, opening?: string, closing?: string): string[];
        function hasBit(value: number, offset: number): boolean;
        function isNumber(value: string): boolean;
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
        function trimBoth(value: string, char?: string): string;
        function trimString(value: string, char: string): string;
        function trimStart(value: string, char: string): string;
        function trimEnd(value: string, char: string): string;
        function appendSeparator(preceding: string, value: string, separator?: string): string;
        function fromLastIndexOf(value: string, ...char: string[]): string;
        function partitionLastIndexOf(value: string, ...char: string[]): [string, string];
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
        function flatArray<T>(list: any[], depth?: number): T[];
        function spliceArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback?: IteratorPredicate<T, void>, deleteCount?: number): T[];
        function partitionArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, boolean>): [T[], T[]];
        function sameArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, any>): boolean;
        function joinArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, string>, char?: string, trailing?: boolean): string;
        function iterateArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, void | boolean>, start?: number, end?: number): number;
        function iterateReverseArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, void | boolean>, start?: number, end?: number): number;
        function conditionArray<T>(list: ArrayLike<T>, predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, any>): void;
        function replaceMap<T, U>(list: any[], predicate: IteratorPredicate<T, U>): U[];
        function plainMap<T, U>(list: ArrayLike<T>, predicate: IteratorPredicate<T, U>): U[];
    }

    namespace xml {
        const STRING_XMLENCODING: string;
        const STRING_SPACE: string;
        function isPlainText(value: string): string;
        function pushIndent(value: string, depth: number, char?: string, indent?: string): string;
        function pushIndentArray(values: string[], depth: number, char?: string, separator?: string): string;
        function replaceIndent(value: string, depth: number, pattern: RegExp): string;
        function replaceTab(value: string, spaces?: number, preserve?: boolean): string;
        function applyTemplate(tagName: string, template: StandardMap, children: StandardMap[], depth?: number): string;
        function formatTemplate(value: string, closeEmpty?: boolean): string;
        function replaceCharacterData(value: string, tab?: number): string;
    }
}