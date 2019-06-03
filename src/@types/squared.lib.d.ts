import * as $client from '../lib/client';
import * as $constant from '../lib/constant';
import * as $css from '../lib/css';
import * as $dom from '../lib/dom';
import * as $regex from '../lib/regex';
import * as $xml from '../lib/xml';

declare global {
    namespace squared.lib {
        namespace color {
            function findColorName(value: string): ColorResult | undefined;
            function findColorShade(value: string): ColorResult | undefined;
            function parseColor(value: string, opacity?: string, transparency?: boolean): ColorData | undefined;
            function parseRGBA(value: string): RGBA | undefined;
            function reduceRGBA(value: RGBA, percent: number, cacheName?: string): ColorData | undefined;
            function getHexCode(...values: number[]): string;
            function convertHex(value: RGBA): string;
            function convertHSLA(value: RGBA): HSLA;
            function formatRGBA(value: RGBA): string;
            function formatHSLA(value: HSLA): string;
        }

        namespace constant {
            export import CSS = $constant.CSS;
        }

        namespace client {
            export import PLATFORM = $client.PLATFORM;
            export import USER_AGENT = $client.USER_AGENT;
            function isPlatform(value: string | number): boolean;
            function isUserAgent(value: string | number): boolean;
            function getDeviceDPI(): number;
        }

        namespace css {
            export import BOX_POSITION = $css.BOX_POSITION;
            export import BOX_MARGIN = $css.BOX_MARGIN;
            export import BOX_PADDING = $css.BOX_PADDING;
            export import BOX_BORDER = $css.BOX_BORDER;
            export import CSSKeyframesData = $css.CSSKeyframesData;
            export import CSSFontFaceData = $css.CSSFontFaceData;
            function getStyle(element: Element | null, target?: string, cache?: boolean): CSSStyleDeclaration;
            function getFontSize(element: Element | null): number | undefined;
            function hasComputedStyle(element: Element): element is HTMLElement;
            function checkStyleValue(element: HTMLElement, attr: string, value: string, style?: CSSStyleDeclaration): string;
            function getSpecificity(value: string): number;
            function getKeyframeRules(): ObjectMap<CSSKeyframesData>;
            function parseKeyframeRule(rules: CSSRuleList): CSSKeyframesData;
            function validMediaRule(value: string, fontSize?: number): boolean;
            function getDataSet(element: HTMLElement | SVGElement, prefix: string): StringMap;
            function isParentStyle(element: Element, attr: string, ...styles: string[]): boolean;
            function getInheritedStyle(element: Element, attr: string, exclude?: RegExp, ...tagNames: string[]): string;
            function parseVar(element: HTMLElement | SVGElement, value: string): string | undefined;
            function calculateVar(element: HTMLElement | SVGElement, value: string, attr?: string, dimension?: number): number | undefined;
            function getBackgroundPosition(value: string, dimension: Dimension, fontSize?: number): BoxRectPosition;
            function getSrcSet(element: HTMLImageElement, mimeType?: string[]): ImageSrcSet[];
            function convertListStyle(name: string, value: number, valueAsDefault?: boolean): string;
            function resolveURL(value: string): string;
            function insertStyleSheetRule(value: string, index?: number): HTMLStyleElement;
            function convertAngle(value: string, unit?: string): number;
            function convertPX(value: string, fontSize?: number): string;
            function calculate(value: string, dimension?: number, fontSize?: number): number;
            function parseUnit(value: string, fontSize?: number): number;
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
            export import ELEMENT_BLOCK = $dom.ELEMENT_BLOCK;
            function newBoxRect(): BoxRect;
            function newBoxRectDimension(): BoxRectDimension;
            function newBoxModel(): BoxModel;
            function assignRect(rect: DOMRect | ClientRect | BoxRectDimension, scrollPosition?: boolean): BoxRectDimension;
            function removeElementsByClassName(className: string): void;
            function getElementsBetweenSiblings(elementStart: Element | null, elementEnd: Element, whiteSpace?: boolean): Element[] | undefined;
            function getNamedItem(element: Element | null, attr: string): string;
            function createElement(parent?: Element | null, tagName?: string, placeholder?: boolean, index?: number): HTMLElement;
            function createStyleElement(parent: HTMLElement, tagName: string, attrs: StringMap): HTMLElement;
            function measureTextWidth(value: string, fontFamily: string, fontSize: number): number;
        }

        namespace math {
            function minArray(list: number[]): number;
            function maxArray(list: number[]): number;
            function convertRadian(value: number): number;
            function isEqual(valueA: number, valueB: number, precision?: number): boolean;
            function moreEqual(valueA: number, valueB: number, precision?: number): boolean;
            function lessEqual(valueA: number, valueB: number, precision?: number): boolean;
            function convertDecimalNotation(value: number): string;
            function truncate(value: number | string, precision?: number): string;
            function truncateTrailingZero(value: string): string;
            function truncateFraction(value: number): number;
            function truncateString(value: string, precision?: number): string;
            function triangulateASA(a: number, b: number, clen: number): [number, number];
            function absoluteAngle(start: Point, end: Point): number;
            function relativeAngle(start: Point, end: Point, orientation?: number): number;
            function offsetAngleX(angle: number, value: number): number;
            function offsetAngleY(angle: number, value: number): number;
            function clampRange(value: number, min?: number, max?: number): number;
            function nextMultiple(values: number[], minumum?: number, offset?: number[]): number;
        }

        namespace regex {
            export import STRING = $regex.STRING;
            export import UNIT = $regex.UNIT;
            export import CSS = $regex.CSS;
            export import XML = $regex.XML;
            export import CHAR = $regex.CHAR;
            export import PREFIX = $regex.PREFIX;
            export import ESCAPE = $regex.ESCAPE;
        }

        namespace session {
            function getClientRect(element: Element, sessionId: string, cache?: boolean): ClientRect;
            function getRangeClientRect(element: Element, sessionId: string, cache?: boolean): BoxRectDimension;
            function causesLineBreak(element: Element, sessionId: string): boolean;
            function setElementCache(element: Element, attr: string, sessionId: string, data: any): void;
            function getElementCache(element: Element, attr: string, sessionId?: string): any;
            function deleteElementCache(element: Element, attr: string, sessionId: string): void;
            function getElementAsNode<T>(element: Element, sessionId: string): T | undefined;
        }

        namespace util {
            function capitalize(value: string, upper?: boolean): string;
            function capitalizeString(value: string): string;
            function lowerCaseString(value: string): string;
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
            function hasBit(value: number, offset: number): boolean;
            function isNumber(value: any): boolean;
            function isString(value: any): value is string;
            function isArray<T>(value: any): value is Array<T>;
            function isPlainObject(value: any): value is {};
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
            function sortNumber(values: number[], ascending?: boolean): number[];
            function sortArray<T>(list: T[], ascending: boolean, ...attrs: string[]): T[];
            function flatArray<T>(list: any[]): T[];
            function flatMultiArray<T>(list: any[]): T[];
            function partitionArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>): [T[], T[]];
            function spliceArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback?: IteratorPredicate<T, void>): T[];
            function filterArray<T>(list: T[], predicate: IteratorPredicate<T, boolean>): T[];
            function concatArray<T>(dest: T[], source: T[]): T[];
            function concatMultiArray<T>(dest: T[], ...source: T[][]): T[];
            function sameArray<T>(list: T[], predicate: IteratorPredicate<T, any>): boolean;
            function flatMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[];
            function filterMap<T, U>(list: T[], predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, U>): U[];
            function objectMap<T, U>(list: T[], predicate: IteratorPredicate<T, U>): U[];
            function replaceMap<T, U>(list: any[], predicate: IteratorPredicate<T, U>): U[];
            function joinMap<T>(list: T[], predicate: IteratorPredicate<T, string>, char?: string): string;
            function captureMap<T>(list: T[], predicate: IteratorPredicate<T, boolean>, callback: IteratorPredicate<T, any>): void;
        }

        namespace xml {
            export import STRING_XMLENCODING = $xml.STRING_XMLENCODING;
            function isPlainText(value: string): string;
            function pushIndent(value: string, depth: number, char?: string, indent?: string): string;
            function pushIndentArray(values: string[], depth: number, char?: string, separator?: string): string;
            function replaceIndent(value: string, depth: number, pattern: RegExp): string;
            function replaceTab(value: string, spaces?: number, preserve?: boolean): string;
            function applyTemplate(tagName: string, template: ExternalData, children: ExternalData[], depth?: number): string;
            function formatTemplate(value: string, closeEmpty?: boolean, startIndent?: number, char?: string): string;
            function replaceCharacterData(value: string): string;
        }
    }
}

export = squared.lib;