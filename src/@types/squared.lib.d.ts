import * as $dom from '../lib/dom';
import * as $util from '../lib/util';

declare global {
    namespace squared.lib {
        namespace color {
            function findColorName(value: string): ColorResult | undefined;
            function findColorShade(value: string): ColorResult | undefined;
            function parseColor(value: string, opacity?: string, transparency?: boolean): ColorData | undefined;
            function reduceColor(value: string, percent: number): ColorData | undefined;
            function convertHex(...values: string[] | number[]): string;
            function convertRGBA(value: string): RGBA | undefined;
            function formatRGBA(rgba: RGBA): string;
        }

        namespace dom {
            export import USER_AGENT = $dom.USER_AGENT;
            export import ELEMENT_BLOCK = $dom.ELEMENT_BLOCK;
            export import ELEMENT_INLINE = $dom.ELEMENT_INLINE;
            function isUserAgent(value: string | number): boolean;
            function getDeviceDPI(): number;
            function getKeyframeRules(): CSSRuleData;
            function checkStyleAttribute(element: Element, attr: string, value: string, style?: CSSStyleDeclaration, fontSize?: number): string;
            function getDataSet(element: Element | null, prefix: string): StringMap;
            function newBoxRect(): BoxRect;
            function newRectDimension(): RectDimension;
            function newBoxModel(): BoxModel;
            function hasVisibleRect(element: Element, checkViewport?: boolean): boolean;
            function withinViewport(bounds: ClientRect | DOMRect): boolean;
            function getDOMRect(element: Element): DOMRect;
            function createElement(parent: Element | null, block?: boolean): HTMLElement;
            function removeElementsByClassName(className: string): void;
            function getRangeClientRect(element: Element): TextDimension;
            function assignBounds(bounds: RectDimension | DOMRect): RectDimension;
            function getStyle(element: Element | null, cache?: boolean): CSSStyleDeclaration;
            function getFontSize(element: Element | null): number;
            function resolveURL(value: string): string;
            function cssParent(element: Element | null, attr: string, ...styles: string[]): boolean;
            function cssFromParent(element: Element | null, attr: string): boolean;
            function cssInline(element: Element, attr: string): string;
            function cssAttribute(element: Element, attr: string, computed?: boolean): string;
            function cssInheritAttribute(element: Element | null, attr: string): string;
            function cssInheritStyle(element: Element | null, attr: string, exclude?: string[], tagNames?: string[]): string;
            function getNamedItem(element: Element | null, attr: string): string;
            function getBackgroundPosition(value: string, dimension: RectDimension, fontSize?: number, leftPerspective?: boolean, percent?: boolean): RectPosition;
            function getFirstChildElement(elements: Element | null, lineBreak?: boolean): Element | null;
            function getLastChildElement(elements: Element | null, lineBreak?: boolean): Element | null;
            function hasFreeFormText(element: Element, whiteSpace?: boolean): boolean;
            function isPlainText(element: Element, whiteSpace?: boolean): boolean;
            function hasLineBreak(element: Element | null, lineBreak?: boolean, trimString?: boolean): boolean;
            function isLineBreak(element: Element | null, excluded?: boolean): boolean;
            function getElementsBetween(elementStart: Element | null, elementEnd: Element, whiteSpace?: boolean): Element[];
            function getPreviousElementSibling(element: Element | null): Element | null;
            function getNextElementSibling(element: Element | null): Element | null;
            function hasComputedStyle(element: Element | null): element is HTMLElement;
            function setElementCache(element: Element, attr: string, data: any): void;
            function getElementCache(element: Element, attr: string): any;
            function deleteElementCache(element: Element, ...attrs: string[]): void;
            function getElementAsNode<T>(element: Element): T | undefined;
        }

        namespace math {
            function minArray(list: number[]): number;
            function maxArray(list: number[]): number;
            function convertRadian(value: number): number;
            function isEqual(valueA: number, valueB: number, precision?: number): number;
            function moreEqual(valueA: number, valueB: number, precision?: number): number;
            function lessEqual(valueA: number, valueB: number, precision?: number): number;
            function truncate(value: number, precision?: number): string;
            function truncateFraction(value: number): number;
            function truncateString(value: string, precision?: number): string;
            function trianguleASA(a: number, b: number, clen: number): [number, number];
            function offsetAngle(start: Point, end: Point): number;
            function offsetAngleX(angle: number, value: number): number;
            function offsetAngleY(angle: number, value: number): number;
            function clampRange(value: number, min?: number, max?: number): number;
            function nextMultiple(values: number[], minumum?: number, offset?: number[]): number;
        }

        namespace util {
            export import REGEXP_PATTERN = $util.REGEXP_PATTERN;
            export import REGEXP_STRING = $util.REGEXP_STRING;
            function capitalize(value: string, upper?: boolean): string;
            function convertUnderscore(value: string): string;
            function convertCamelCase(value: string, char?: string): string;
            function convertWord(value: string, dash?: boolean): string;
            function convertInt(value: string): number;
            function convertFloat(value: string): number;
            function convertAngle(value: string, unit?: string): number;
            function convertPX(value: string, fontSize?: number): string;
            function convertPercent(value: string, dimension: number, fontSize?: number): number;
            function convertUnit(value: string, dimension: number, fontSize?: number): number;
            function convertAlpha(value: number): string;
            function convertRoman(value: number): string;
            function convertEnum(value: number, base: {}, derived: {}): string;
            function formatPX(value: string | number): string;
            function formatPercent(value: string | number, round?: boolean): string;
            function formatString(value: string, ...params: string[]): string;
            function hasBit(value: number, offset: number): boolean;
            function isNumber(value: string): boolean;
            function isString(value: any): value is string;
            function isArray<T>(value: any): value is Array<T>;
            function isUnit(value: string): boolean;
            function isPercent(value: string): boolean;
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
            function resolvePath(value: string): string;
            function trimNull(value: string | undefined): string;
            function trimString(value: string, char: string): string;
            function trimStart(value: string, char: string): string;
            function trimEnd(value: string, char: string): string;
            function firstIndexOf(value: string, ...terms: string[]): number;
            function fromLastIndexOf(value: string, char?: string): string;
            function searchObject(obj: StringMap, value: string | StringMap): any[][];
            function hasValue<T>(value: T): value is T;
            function hasInSet<T>(list: Set<T>, condition: (x: T) => boolean): boolean;
            function compareRange(operation: string, range: number, value: number): boolean;
            function withinRange(a: number, b: number, offset?: number): boolean;
            function withinFraction(lower: number, upper: number): boolean;
            function assignWhenNull(destination: {}, source: {}): void;
            function defaultWhenNull(options: {}, ...attrs: string[]): void;
            function sortNumber(values: number[], descending?: boolean): number[];
            function sortArray<T>(list: T[], ascending: boolean, ...attrs: string[]): T[];
            function flatArray<T>(list: any[]): T[];
            function partitionArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>): [T[], T[]];
            function spliceArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback?: IteratorPredicate<T, void>): T[];
            function filterArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>): T[];
            function concatArray<T>(dest: T[], source: T[]): T[];
            function concatMultiArray<T>(dest: T[], ...source: T[][]): T[];
            function flatMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[];
            function filterMap<T, U>(list: T[], predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, U>): U[];
            function objectMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[];
            function replaceMap<T, U>(list: any[], predicate: IteratorPredicate<T, U>): U[];
            function joinMap<T>(list: T[], predicate: IteratorPredicate<T, string>, char?: string): string;
            function captureMap<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, any>): void;
        }

        namespace xml {
            function formatPlaceholder(id: string | number, symbol?: string): string;
            function replacePlaceholder(value: string, id: string | number, content: string, before?: boolean): string;
            function pushIndent(value: string, depth: number, char?: string): string;
            function replaceIndent(value: string, depth: number, pattern: RegExp): string;
            function replaceTab(value: string, spaces?: number, preserve?: boolean): string;
            function replaceEntity(value: string): string;
            function replaceCharacter(value: string): string;
            function parseTemplate(value: string): StringMap;
            function createTemplate(templates: StringMap, data: ExternalData, format?: boolean): string;
            function formatTemplate(value: string, closeEmpty?: boolean, char?: string): string;
        }
    }
}

export = squared.lib;