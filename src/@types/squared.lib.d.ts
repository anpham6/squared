import * as $css from '../lib/css';
import * as $dom from '../lib/dom';
import * as $element from '../lib/element';
import * as $util from '../lib/util';

declare global {
    namespace squared.lib {
        namespace color {
            function findColorName(value: string): ColorResult | undefined;
            function findColorShade(value: string): ColorResult | undefined;
            function parseColor(value: string, opacity?: string, transparency?: boolean): ColorData | undefined;
            function parseRGBA(value: string): RGBA | undefined;
            function reduceColor(value: string, percent: number): ColorData | undefined;
            function getHexCode(...values: number[]): string;
            function convertHex(value: RGBA): string;
            function convertHSLA(value: RGBA): HSLA;
            function formatRGBA(value: RGBA): string;
            function formatHSLA(value: HSLA): string;
        }

        namespace css {
            export import BOX_POSITION = $css.BOX_POSITION;
            export import BOX_MARGIN = $css.BOX_MARGIN;
            export import BOX_PADDING = $css.BOX_PADDING;
            function getKeyframeRules(): CSSRuleData;
            function checkStyleValue(element: Element, attr: string, value: string, style?: CSSStyleDeclaration, fontSize?: number): string;
            function hasComputedStyle(element: Element | null): element is HTMLElement;
            function getDataSet(element: HTMLElement | null, prefix: string): StringMap;
            function getStyle(element: Element | null, cache?: boolean): CSSStyleDeclaration;
            function getFontSize(element: Element | null): number;
            function isParentStyle(element: Element | null, attr: string, ...styles: string[]): boolean;
            function getInheritedStyle(element: Element | null, attr: string, exclude?: RegExp, ...tagNames: string[]): string;
            function isInheritedStyle(element: Element | null, attr: string): boolean;
            function getInlineStyle(element: Element, attr: string): string;
            function getAttribute(element: Element, attr: string, computed?: boolean): string;
            function getParentAttribute(element: Element | null, attr: string): string;
            function getNamedItem(element: Element | null, attr: string): string;
            function calculateVar(element: HTMLElement | SVGElement, value: string, attr?: string, dimension?: number): number;
            function getBackgroundPosition(value: string, dimension: Dimension, fontSize?: number): RectPosition;
            function resolveURL(value: string): string;
        }

        namespace dom {
            function newBoxRect(): BoxRect;
            function newRectDimension(): RectDimension;
            function newBoxModel(): BoxModel;
            function getRangeClientRect(element: Element): TextDimension;
            function assignRect(rect: DOMRect | RectDimension): RectDimension;
            function removeElementsByClassName(className: string): void;
            function getFirstChildElement(elements: Element | null, lineBreak?: boolean): Element | null;
            function getLastChildElement(elements: Element | null, lineBreak?: boolean): Element | null;
            function getElementsBetweenSiblings(elementStart: Element | null, elementEnd: Element, whiteSpace?: boolean): Element[] | undefined;
            function getPreviousElementSibling(element: Element | null): Element | null;
            function getNextElementSibling(element: Element | null): Element | null;
            function isElementVisible(element: Element, viewport?: boolean): boolean;
            function setElementCache(element: Element, attr: string, data: any): void;
            function getElementCache(element: Element, attr: string): any;
            function deleteElementCache(element: Element, ...attrs: string[]): void;
            function getElementAsNode<T>(element: Element): T | undefined;
        }

        namespace element {
            export import ELEMENT_BLOCK = $element.ELEMENT_BLOCK;
            export import ELEMENT_INLINE = $element.ELEMENT_INLINE;
            function createElement(parent: Element | null, block?: boolean): HTMLElement;
            function isPlainText(element: Element, whiteSpace?: boolean): boolean;
            function isLineBreak(element: Element, excluded?: boolean): boolean;
            function hasLineBreak(element: Element, lineBreak?: boolean, trim?: boolean): boolean;
            function hasFreeFormText(element: Element, whiteSpace?: boolean): boolean;
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
            export import REGEXP_COMPILED = $util.REGEXP_COMPILED;
            export import STRING_PATTERN = $util.STRING_PATTERN;
            export import USER_AGENT = $util.USER_AGENT;
            function isUserAgent(value: string | number): boolean;
            function getDeviceDPI(): number;
            function capitalize(value: string, upper?: boolean): string;
            function convertUnderscore(value: string): string;
            function convertCamelCase(value: string, char?: string): string;
            function convertWord(value: string, dash?: boolean): string;
            function convertInt(value: string): number;
            function convertFloat(value: string): number;
            function convertAngle(value: string, unit?: string): number;
            function convertPX(value: string, fontSize?: number): string;
            function convertLength(value: string, dimension: number, fontSize?: number): number;
            function convertPercent(value: string, dimension: number, fontSize?: number): number;
            function convertAlpha(value: number): string;
            function convertRoman(value: number): string;
            function convertEnum(value: number, base: {}, derived: {}): string;
            function calculate(value: string, dimension?: number, fontSize?: number): number;
            function parseUnit(value: string, fontSize?: number): number;
            function parseAngle(value: string): number;
            function formatPX(value: string | number): string;
            function formatPercent(value: string | number, round?: boolean): string;
            function formatString(value: string, ...params: string[]): string;
            function hasBit(value: number, offset: number): boolean;
            function isNumber(value: string): boolean;
            function isString(value: any): value is string;
            function isArray<T>(value: any): value is Array<T>;
            function isLength(value: string): boolean;
            function isPercent(value: string): boolean;
            function isCalc(value: string): boolean;
            function isAngle(value: string): boolean;
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
            function assignEmptyProperty(dest: {}, source: {}): {};
            function assignEmptyValue(dest: {}, ...attrs: string[]): void;
            function sortNumber(values: number[], ascending?: boolean): number[];
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
            function escapeNonEntity(value: string): string;
            function parseTemplate(value: string): StringMap;
            function createTemplate(templates: StringMap, data: ExternalData, format?: boolean): string;
            function formatTemplate(value: string, closeEmpty?: boolean, startIndent?: number, char?: string): string;
        }
    }
}

export = squared.lib;