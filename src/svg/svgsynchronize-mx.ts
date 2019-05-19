import { SvgPoint, SvgSynchronizeOptions } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';
import SvgAnimationIntervalMap from './svganimationintervalmap';
import SvgPath from './svgpath';

import { SYNCHRONIZE_MODE, SYNCHRONIZE_STATE } from './lib/constant';
import { SVG, TRANSFORM } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;

type AnimateValue = number | Point[] | string;
type TimelineValue = Map<any, AnimateValue>;
type TimelineIndex = Map<number, AnimateValue>;
type TimelineMap = ObjectMap<TimelineIndex>;
type KeyTimeMap = Map<number, TimelineValue>;
type ForwardMap = ObjectMap<ForwardValue[]>;
type InterpolatorMap = Map<number, string>;
type TransformOriginMap = Map<number, Point>;
type TimelineEntries = [number, TimelineValue][];
type TimeRangeMap = Map<number, number>;

interface ForwardValue extends NumberValue<AnimateValue> {
    time: number;
}

const $const = squared.lib.constant;
const $math = squared.lib.math;
const $regex = squared.lib.regex;
const $util = squared.lib.util;

const LINE_ARGS = ['x1', 'y1', 'x2', 'y2'];
const RECT_ARGS = [$const.CSS.WIDTH, $const.CSS.HEIGHT, 'x', 'y'];
const POLYGON_ARGS = ['points'];
const CIRCLE_ARGS = ['cx', 'cy', 'r'];
const ELLIPSE_ARGS = ['cx', 'cy', 'rx', 'ry'];

function insertAdjacentSplitValue(map: TimelineIndex, attr: string, time: number, intervalMap: SvgAnimationIntervalMap, transforming: boolean) {
    let previousTime = 0;
    let previousValue: AnimateValue | undefined;
    let previous: NumberValue<AnimateValue> | undefined;
    let next: NumberValue<AnimateValue> | undefined;
    for (const [key, value] of map.entries()) {
        if (time === key) {
            previous = { key, value };
            break;
        }
        else if (time > previousTime && time < key && previousValue !== undefined) {
            previous = { key: previousTime, value: previousValue };
            next = { key, value };
            break;
        }
        previousTime = key;
        previousValue = value;
    }
    if (previous && next) {
        setTimelineValue(map, time, getItemSplitValue(time, previous.key, previous.value, next.key, next.value), true);
    }
    else if (previous) {
        setTimelineValue(map, time, previous.value, true);
    }
    else if (!transforming) {
        let value = <AnimateValue> intervalMap.get(attr, time, true);
        if (value) {
            value = convertToAnimateValue(value, true);
            if (value !== '') {
                setTimelineValue(map, time, value);
            }
        }
    }
}

function convertToFraction(values: TimelineEntries) {
    const timeTotal = values[values.length - 1][0];
    const previousFractions = new Set<number>();
    for (let i = 0; i < values.length; i++) {
        let fraction = values[i][0] / timeTotal;
        if (fraction > 0) {
            for (let j = 7; ; j++) {
                const value = parseFloat(fraction.toString().substring(0, j));
                if (!previousFractions.has(value)) {
                    fraction = value;
                    break;
                }
            }
        }
        values[i][0] = fraction;
        previousFractions.add(fraction);
    }
    return values;
}

function convertToAnimateValue(value: AnimateValue, fromString = false) {
    if (typeof value === 'string') {
        if ($util.isNumber(value)) {
            value = parseFloat(value);
        }
        else {
            value = SvgBuild.parsePoints(value);
            if (value.length === 0) {
                value = '';
            }
        }
    }
    return fromString && typeof value === 'string' ? '' : value;
}

function getForwardValue(items: ForwardValue[], time: number) {
    let value: AnimateValue | undefined;
    if (items) {
        for (const item of items) {
            if (item.time <= time) {
                value = item.value;
            }
            else {
                break;
            }
        }
    }
    return value;
}

function getPathData(entries: TimelineEntries, path: SvgPath, parent: SvgContainer | undefined, forwardMap: ForwardMap, precision?: number) {
    const result: NumberValue[] = [];
    const tagName = path.element.tagName;
    let baseVal: string[];
    switch (tagName) {
        case 'line':
            baseVal = LINE_ARGS;
            break;
        case 'rect':
            baseVal = RECT_ARGS;
            break;
        case 'polyline':
        case 'polygon':
            baseVal = POLYGON_ARGS;
            break;
        case 'circle':
            baseVal = CIRCLE_ARGS;
            break;
        case 'ellipse':
            baseVal = ELLIPSE_ARGS;
            break;
        default:
            return undefined;
    }
    const transformOrigin = TRANSFORM.origin(path.element);
    for (let i = 0; i < entries.length; i++) {
        const key = entries[i][0];
        const data = entries[i][1];
        const values: AnimateValue[] = [];
        for (const attr of baseVal) {
            let value = data.get(attr);
            if (value === undefined) {
                if (value === undefined) {
                    value = getForwardValue(forwardMap[attr], key);
                }
                if (value === undefined) {
                    value = path.getBaseValue(attr);
                }
            }
            if (value !== undefined) {
                values.push(value);
            }
            else {
                return undefined;
            }
        }
        let points: SvgPoint[] | undefined;
        switch (tagName) {
            case 'line':
                points = getLinePoints(values as number[]);
                break;
            case 'rect':
                points = getRectPoints(values as number[]);
                break;
            case 'polygon':
            case 'polyline':
                points = <Point[]> values[0];
                break;
            case 'circle':
            case 'ellipse':
                points = getEllipsePoints(values as number[]);
                break;
        }
        if (points) {
            let value: string | undefined;
            if (path.transformed) {
                points = SvgBuild.applyTransforms(path.transformed, points, transformOrigin);
            }
            if (parent) {
                parent.refitPoints(points);
            }
            switch (tagName) {
                case 'line':
                case 'polyline':
                    value = SvgBuild.drawPolyline(points, precision);
                    break;
                case 'rect':
                case 'polygon':
                    value = SvgBuild.drawPolygon(points, precision);
                    break;
                case 'circle':
                case 'ellipse':
                    const pt = <Required<SvgPoint>> points[0];
                    value = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, precision);
                    break;
            }
            if (value !== undefined) {
                result.push({ key, value });
            }
        }
    }
    return result;
}

function getLinePoints(values: number[]): Point[] {
    return [
        { x: values[0], y: values[1] },
        { x: values[2], y: values[4] }
    ];
}

function getRectPoints(values: number[]): Point[] {
    const width = values[0];
    const height = values[1];
    const x = values[2];
    const y = values[3];
    return [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height }
    ];
}

function createKeyTimeMap(map: TimelineMap, keyTimes: number[], forwardMap: ForwardMap) {
    const result = new Map<number, Map<string, AnimateValue>>();
    for (const keyTime of keyTimes) {
        const values = new Map<string, AnimateValue>();
        for (const attr in map) {
            let value: AnimateValue | undefined;
            if (map[attr].has(keyTime)) {
                value = <AnimateValue> map[attr].get(keyTime);
            }
            else {
                value = getForwardValue(forwardMap[attr], keyTime);
            }
            if (value !== undefined) {
                values.set(attr, value);
            }
        }
        result.set(keyTime, values);
    }
    return result;
}

function setTimeRange(map: TimeRangeMap, type: number, startTime: number, endTime?: number) {
    if (type) {
        map.set(startTime, type);
        if (endTime !== undefined) {
            map.set(endTime, type);
        }
    }
}

function getItemValue(item: SvgAnimate, values: string[], iteration: number, index: number, baseValue?: AnimateValue) {
    if (item.alternate && iteration % 2 !== 0) {
        values = values.slice(0).reverse();
    }
    switch (item.attributeName) {
        case 'transform':
            if (item.additiveSum && typeof baseValue === 'string') {
                const baseArray = $util.replaceMap<string, number>(baseValue.split($regex.CHAR.SPACE), value => parseFloat(value));
                const valuesArray = $util.objectMap<string, number[]>(values, value => $util.replaceMap<string, number>(value.trim().split($regex.CHAR.SPACE), pt => parseFloat(pt)));
                if (valuesArray.every(value => baseArray.length === value.length)) {
                    const result = valuesArray[index];
                    if (!item.accumulateSum) {
                        iteration = 0;
                    }
                    for (let i = 0; i < baseArray.length; i++) {
                        result[i] += baseArray[i];
                    }
                    for (let i = 0; i < iteration; i++) {
                        for (let j = 0; j < valuesArray.length; j++) {
                            for (let k = 0; k < valuesArray[j].length; k++) {
                                result[k] += valuesArray[j][k];
                            }
                        }
                    }
                    return result.join(' ');
                }
            }
            return values[index];
        case 'points':
            return SvgBuild.parsePoints(values[index]);
        default: {
            let result = parseFloat(values[index]);
            if (!isNaN(result)) {
                if (item.additiveSum && typeof baseValue === 'number') {
                    result += baseValue;
                    if (!item.accumulateSum) {
                        iteration = 0;
                    }
                    for (let i = 0; i < iteration; i++) {
                        for (let j = 0; j < values.length; j++) {
                            result += parseFloat(values[j]);
                        }
                    }
                }
                return result;
            }
            else {
                return baseValue || 0;
            }
        }
    }
}

function getItemSplitValue(fraction: number, previousFraction: number, previousValue: AnimateValue, nextFraction: number, nextValue: AnimateValue) {
    if (fraction > previousFraction) {
        if (typeof previousValue === 'number' && typeof nextValue === 'number') {
            return SvgAnimate.getSplitValue(previousValue, nextValue, (fraction - previousFraction) / (nextFraction - previousFraction));
        }
        else if (typeof previousValue === 'string' && typeof nextValue === 'string') {
            const previousArray = $util.replaceMap<string, number>(previousValue.split(' '), value => parseFloat(value));
            const nextArray = $util.replaceMap<string, number>(nextValue.split(' '), value => parseFloat(value));
            if (previousArray.length === nextArray.length) {
                const result: number[] = [];
                for (let i = 0; i < previousArray.length; i++) {
                    result.push(getItemSplitValue(fraction, previousFraction, previousArray[i], nextFraction, nextArray[i]) as number);
                }
                return result.join(' ');
            }
        }
        else if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
            const result: Point[] = [];
            for (let i = 0; i < Math.min(previousValue.length, nextValue.length); i++) {
                result.push({
                    x: getItemSplitValue(fraction, previousFraction, previousValue[i].x, nextFraction, nextValue[i].x) as number,
                    y: getItemSplitValue(fraction, previousFraction, previousValue[i].y, nextFraction, nextValue[i].y) as number
                });
            }
            return result;
        }
    }
    return previousValue;
}

function insertSplitValue(item: SvgAnimate, actualTime: number, baseValue: AnimateValue, keyTimes: number[], values: string[], keySplines: string[] | undefined, delay: number, iteration: number, time: number, keyTimeMode: number, timelineMap: TimelineIndex, interpolatorMap: InterpolatorMap, transformOriginMap?: TransformOriginMap): [number, AnimateValue] {
    if (delay < 0) {
        actualTime -= delay;
        delay = 0;
    }
    const fraction = Math.max(0, Math.min((actualTime - (delay + item.duration * iteration)) / item.duration, 1));
    let previousIndex = -1;
    let nextIndex = -1;
    for (let l = 0; l < keyTimes.length; l++) {
        if (previousIndex !== -1 && fraction <= keyTimes[l]) {
            nextIndex = l;
            break;
        }
        if (fraction >= keyTimes[l]) {
            previousIndex = l;
        }
    }
    let value: AnimateValue;
    if (previousIndex !== -1 && nextIndex !== -1) {
        value = getItemSplitValue(
            fraction,
            keyTimes[previousIndex],
            getItemValue(item, values, iteration, previousIndex, baseValue),
            keyTimes[nextIndex],
            getItemValue(item, values, iteration, nextIndex, baseValue)
        );
    }
    else {
        nextIndex = previousIndex !== -1 ? previousIndex + 1 : keyTimes.length - 1;
        value = getItemValue(item, values, iteration, nextIndex, baseValue);
    }
    time = setTimelineValue(timelineMap, time, value);
    insertInterpolator(item, time, keySplines, nextIndex, keyTimeMode, interpolatorMap, transformOriginMap);
    return [time, value];
}

function appendPartialKeyTimes(map: SvgAnimationIntervalMap, item: SvgAnimate, startTime: number, maxThreadTime: number, values: string[], baseValue: AnimateValue, queued: SvgAnimate[], ): [number[], string[], string[]] {
    const keyTimes = item.keyTimes.slice(0);
    const keySplines = item.keySplines ? item.keySplines.slice(0) : new Array(values.length - 1).fill('') as string[];
    const completeTime = startTime + item.duration;
    let maxTime = item.getIntervalEndTime(startTime);
    for (let i = 0; i < queued.length; i++) {
        const sub = queued[i];
        if (sub !== item) {
            const totalDuration = sub.getTotalDuration();
            if (totalDuration > maxTime) {
                const endTime = Math.min(completeTime, totalDuration);
                const subValues = getStartItemValues(map, item, baseValue);
                substituteEnd: {
                    for (let j = getStartIteration(maxTime, sub.delay, sub.duration), joined = false; ; j++) {
                        for (let k = 0; k < sub.keyTimes.length; k++) {
                            const time = getItemTime(sub.delay, sub.duration, sub.keyTimes, j, k);
                            if (time >= maxTime) {
                                function insertSubstituteTimeValue(splitTime: number) {
                                    let splitValue: string | undefined;
                                    if (time === splitTime) {
                                        splitValue = convertToString(getItemValue(sub, subValues, j, k, baseValue));
                                    }
                                    else {
                                        const fraction = (time - splitTime) / sub.duration;
                                        for (let l = 1; l < sub.keyTimes.length; l++) {
                                            if (fraction >= sub.keyTimes[l - 1] && fraction <= sub.keyTimes[l]) {
                                                splitValue = convertToString(
                                                    getItemSplitValue(
                                                        fraction,
                                                        sub.keyTimes[l - 1],
                                                        getItemValue(sub, subValues, j, l - 1, baseValue),
                                                        sub.keyTimes[l],
                                                        getItemValue(sub, subValues, j, l, baseValue)
                                                    )
                                                );
                                                break;
                                            }
                                        }
                                    }
                                    let resultTime = splitTime === endTime ? 1 : (splitTime % item.duration) / item.duration;
                                    if (resultTime === 0 && k > 0) {
                                        resultTime = 1;
                                    }
                                    if (splitValue !== undefined && !(resultTime === keyTimes[keyTimes.length - 1] && splitValue === values[values.length - 1])) {
                                        if (splitTime === maxTime) {
                                            resultTime += 1 / 1000;
                                        }
                                        else {
                                            maxTime = splitTime;
                                        }
                                        keyTimes.push(resultTime);
                                        values.push(splitValue);
                                        if (keySplines) {
                                            keySplines.push(joined && sub.keySplines && sub.keySplines[k] ? sub.keySplines[k] : '');
                                        }
                                    }
                                }
                                if (!joined && time >= maxTime) {
                                    insertSubstituteTimeValue(maxTime);
                                    joined = true;
                                    if (time === maxTime) {
                                        continue;
                                    }
                                }
                                if (joined) {
                                    insertSubstituteTimeValue(Math.min(time, endTime));
                                    if (time >= endTime || keyTimes[keyTimes.length - 1] === 1) {
                                        break substituteEnd;
                                    }
                                    maxTime = time;
                                }
                            }
                        }
                    }
                }
                if (totalDuration === endTime && totalDuration <= maxThreadTime) {
                    sub.addState(SYNCHRONIZE_STATE.COMPLETE);
                    queued.splice(i--, 1);
                }
                if (endTime === completeTime) {
                    break;
                }
            }
            else if (maxThreadTime !== Number.POSITIVE_INFINITY && totalDuration < maxThreadTime) {
                queued.splice(i--, 1);
            }
        }
    }
    return [keyTimes, values, keySplines];
}

function setTimelineValue(map: TimelineIndex, time: number, value: AnimateValue, duplicate = false) {
    if (value !== '') {
        let stored = map.get(time);
        let previousTime = false;
        if (stored === undefined) {
            stored = map.get(time - 1);
            previousTime = true;
        }
        if (stored !== value || duplicate) {
            if (!duplicate) {
                if (typeof stored === 'number' && $math.isEqual(value as number, stored)) {
                    return time;
                }
                while (time > 0 && map.has(time)) {
                    time++;
                }
            }
            map.set(time, value);
        }
        else if (previousTime && !map.has(time)) {
            map.delete(time - 1);
            map.set(time, value);
        }
    }
    return time;
}

function insertInterpolator(item: SvgAnimate, time: number, keySplines: string[] | undefined, index: number, keyTimeMode: number, map: InterpolatorMap, transformOriginMap?: TransformOriginMap) {
    if (!isKeyTimeFormat(SvgBuild.isAnimateTransform(item), keyTimeMode)) {
        if (index === 0) {
            return;
        }
        index--;
    }
    const value = keySplines && keySplines[index];
    if (value) {
        map.set(time, value);
    }
    if (transformOriginMap) {
        setTransformOrigin(transformOriginMap, item, time, index);
    }
}

function getStartItemValues(map: SvgAnimationIntervalMap, item: SvgAnimate, baseValue: AnimateValue) {
    if (item.evaluateStart) {
        const index = item.reverse ? item.length - 1 : 0;
        const value = map.get(SvgAnimationIntervalMap.getKeyName(item), item.delay) || item.values[index] || !item.additiveSum && item.baseValue;
        if (!value) {
            item.values[index] = convertToString(baseValue);
        }
        if (item.by && $util.isNumber(item.values[index])) {
            item.values[index] = (parseFloat(item.values[index]) + item.by).toString();
        }
        item.evaluateStart = false;
    }
    return item.values;
}

function setTransformOrigin(map: TransformOriginMap, item: SvgAnimate, time: number, index: number) {
    if (SvgBuild.asAnimateTransform(item) && item.transformOrigin && item.transformOrigin[index]) {
        map.set(time, item.transformOrigin[index]);
    }
}

function checkPartialKeyTimes(keyTimes: number[], values: string[], keySplines: string[] | undefined, baseValue?: AnimateValue) {
    if (keyTimes[keyTimes.length - 1] < 1) {
        keyTimes.push(1);
        values.push(baseValue !== undefined ? convertToString(baseValue) : values[0]);
        if (keySplines) {
            keySplines.push('');
        }
    }
}

const getItemTime = (delay: number, duration: number, keyTimes: number[], iteration: number, index: number) => Math.round(delay + (keyTimes[index] + iteration) * duration);

const getEllipsePoints = (values: number[]): SvgPoint[] => [{ x: values[0], y: values[1], rx: values[2], ry: values[values.length - 1] }];

const convertToString = (value: AnimateValue) => Array.isArray(value) ? $util.objectMap<Point, string>(value, pt => `${pt.x},${pt.y}`).join(' ') : value.toString();

const isKeyTimeFormat = (transforming: boolean, keyTimeMode: number) => $util.hasBit(keyTimeMode, transforming ? SYNCHRONIZE_MODE.KEYTIME_TRANSFORM : SYNCHRONIZE_MODE.KEYTIME_ANIMATE);

const isFromToFormat = (transforming: boolean, keyTimeMode: number) => $util.hasBit(keyTimeMode, transforming ? SYNCHRONIZE_MODE.FROMTO_TRANSFORM : SYNCHRONIZE_MODE.FROMTO_ANIMATE);

const playableAnimation = (item: SvgAnimate) => item.playable || item.animationElement && item.duration !== -1;

const cloneKeyTimes = (item: SvgAnimate): [number[], string[], string[] | undefined] => [item.keyTimes.slice(0), item.values.slice(0), item.keySplines ? item.keySplines.slice(0) : undefined];

const getStartIteration = (time: number, delay: number, duration: number) => Math.floor(Math.max(0, time - delay) / duration);

export default <T extends Constructor<squared.svg.SvgView>>(Base: T) => {
    return class extends Base implements squared.svg.SvgSynchronize {
        public getAnimateShape(element: SVGGraphicsElement) {
            const result: SvgAnimate[] = [];
            for (const item of this.animations as SvgAnimate[]) {
                if (playableAnimation(item)) {
                    switch (item.attributeName) {
                        case 'r':
                        case 'cx':
                        case 'cy':
                            if (SVG.circle(element)) {
                                result.push(item);
                                break;
                            }
                        case 'rx':
                        case 'ry':
                            if (SVG.ellipse(element)) {
                                result.push(item);
                            }
                            break;
                        case 'x1':
                        case 'x2':
                        case 'y1':
                        case 'y2':
                            if (SVG.line(element)) {
                                result.push(item);
                            }
                            break;
                        case 'points':
                            if (SVG.polyline(element) || SVG.polygon(element)) {
                                result.push(item);
                            }
                            break;
                        case 'x':
                        case 'y':
                        case $const.CSS.WIDTH:
                        case $const.CSS.HEIGHT:
                            if (SVG.rect(element)) {
                                result.push(item);
                            }
                            break;
                    }
                }
            }
            return result;
        }

        public getAnimateTransform(options?: SvgSynchronizeOptions) {
            const result: SvgAnimateTransform[] = [];
            for (const item of this.animations as SvgAnimateTransform[]) {
                if (SvgBuild.isAnimateTransform(item)) {
                    if (item.duration > 0) {
                        result.push(item);
                        if (options && SvgBuild.asAnimateMotion(item)) {
                            item.framesPerSecond = options.framesPerSecond;
                        }
                    }
                }
            }
            return result;
        }

        public getAnimateViewRect(animations?: SvgAnimation[]) {
            if (animations === undefined) {
                animations = <SvgAnimation[]> this.animations;
            }
            const result: SvgAnimate[] = [];
            for (const item of animations as SvgAnimate[]) {
                if (playableAnimation(item)) {
                    switch (item.attributeName) {
                        case 'x':
                        case 'y':
                            result.push(item);
                            break;
                    }
                }
            }
            return result;
        }

        public animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: SvgPath, options?: SvgSynchronizeOptions) {
            let keyTimeMode = SYNCHRONIZE_MODE.FROMTO_ANIMATE | SYNCHRONIZE_MODE.FROMTO_TRANSFORM;
            let precision: number | undefined;
            if (options) {
                if (options.keyTimeMode) {
                    keyTimeMode = options.keyTimeMode;
                }
                precision = options.precision;
            }
            [animations, transforms].forEach(mergeable => {
                const transforming = mergeable === transforms;
                if (!mergeable || mergeable.length === 0 || !transforming && $util.hasBit(keyTimeMode, SYNCHRONIZE_MODE.IGNORE_ANIMATE) || transforming && $util.hasBit(keyTimeMode, SYNCHRONIZE_MODE.IGNORE_TRANSFORM)) {
                    return;
                }
                const staggered: SvgAnimate[] = [];
                const setterAttributeMap: ObjectMap<SvgAnimation[]> = {};
                const groupActive = new Set<string>();
                let setterTotal = 0;
                function insertSetter(item: SvgAnimation) {
                    if (setterAttributeMap[item.attributeName] === undefined) {
                        setterAttributeMap[item.attributeName] = [];
                    }
                    setterAttributeMap[item.attributeName].push(item);
                    setterTotal++;
                }
                {
                    const excluded: SvgAnimate[] = [];
                    for (let i = 0; i < mergeable.length; i++) {
                        const itemA = <SvgAnimate> mergeable[i];
                        if (itemA.setterType) {
                            insertSetter(itemA);
                        }
                        else {
                            const timeA = itemA.getTotalDuration();
                            for (let j = 0; j < mergeable.length; j++) {
                                const itemB = <SvgAnimate> mergeable[j];
                                if (i !== j && itemA.attributeName === itemB.attributeName && itemA.group.id < itemB.group.id && itemA.fillReplace && !itemB.partialType) {
                                    if (itemB.setterType) {
                                        if (itemA.delay === itemB.delay) {
                                            excluded[i] = itemA;
                                            break;
                                        }
                                    }
                                    else {
                                        const timeB = itemB.getTotalDuration();
                                        if (itemA.delay === itemB.delay && (!itemB.fillReplace || timeA <= timeB || itemB.iterationCount === -1) ||
                                            itemB.fillBackwards && itemA.delay <= itemB.delay && (itemB.fillForwards || itemA.fillReplace && timeA <= itemB.delay) ||
                                            itemA.animationElement && itemB.animationElement === null && (itemA.delay >= itemB.delay && timeA <= timeB || itemB.fillForwards))
                                        {
                                            excluded[i] = itemA;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    const removeable: SvgAnimation[] = [];
                    for (let i = 0; i < mergeable.length; i++) {
                        const item = <SvgAnimate> mergeable[i];
                        if (excluded[i]) {
                            if (!item.fillReplace) {
                                item.setterType = true;
                                insertSetter(item);
                            }
                            else {
                                removeable.push(item);
                            }
                        }
                        else if (!item.setterType) {
                            staggered.push(item);
                            groupActive.add(item.group.name);
                        }
                    }
                    this._removeAnimations(removeable);
                }
                if (staggered.length + setterTotal > 1 || staggered.length === 1 && (staggered[0].alternate || staggered[0].end !== undefined)) {
                    for (const item of staggered) {
                        if (item.group.ordering) {
                            $util.spliceArray(item.group.ordering, sibling => !groupActive.has(sibling.name));
                        }
                    }
                    const groupName: ObjectMap<Map<number, SvgAnimate[]>> = {};
                    const groupAttributeMap: ObjectMap<SvgAnimate[]> = {};
                    let repeatingDuration = 0;
                    for (const item of staggered) {
                        const attr = item.attributeName;
                        if (groupName[attr] === undefined) {
                            groupName[attr] = new Map<number, SvgAnimate[]>();
                            groupAttributeMap[attr] = [];
                        }
                        const group = groupName[attr].get(item.delay) || [];
                        group.push(item);
                        groupAttributeMap[attr].push(item);
                        groupName[attr].set(item.delay, group);
                    }
                    for (const attr in groupName) {
                        const groupDelay = new Map<number, SvgAnimate[]>();
                        for (const delay of $util.sortNumber(Array.from(groupName[attr].keys()))) {
                            const group = <SvgAnimate[]> groupName[attr].get(delay);
                            for (const item of group) {
                                repeatingDuration = Math.max(repeatingDuration, item.getTotalDuration(true));
                            }
                            group.reverse();
                            groupDelay.set(delay, group);
                        }
                        groupName[attr] = groupDelay;
                        groupAttributeMap[attr].reverse();
                    }
                    const intervalMap = new SvgAnimationIntervalMap(mergeable);
                    const repeatingMap: TimelineMap = {};
                    const repeatingInterpolatorMap = new Map<number, string>();
                    const repeatingTransformOriginMap = transforming ? new Map<number, Point>() : undefined;
                    const repeatingMaxTime: ObjectMap<number> = {};
                    const repeatingAnimations = new Set<SvgAnimate>();
                    const infiniteMap: ObjectMap<SvgAnimate> = {};
                    const infiniteInterpolatorMap = new Map<number, string>();
                    const infiniteTransformOriginMap = transforming ? new Map<number, Point>() : undefined;
                    const baseValueMap: ObjectMap<AnimateValue> = {};
                    const forwardMap: ForwardMap = {};
                    const animateTimeRangeMap = new Map<number, number>();
                    let repeatingAsInfinite = -1;
                    let repeatingResult: KeyTimeMap | undefined;
                    let infiniteResult: KeyTimeMap | undefined;
                    const getForwardItem = (attr: string): ForwardValue | undefined => forwardMap[attr] && forwardMap[attr][forwardMap[attr].length - 1];
                    for (const attr in groupName) {
                        repeatingMap[attr] = new Map<number, AnimateValue>();
                        if (!transforming) {
                            let value: AnimateValue | undefined;
                            try {
                                value = (path || this)['getBaseValue'](attr);
                            }
                            catch {
                            }
                            if ($util.hasValue(value)) {
                                baseValueMap[attr] = <AnimateValue> value;
                            }
                        }
                        const setterData = setterAttributeMap[attr] || [];
                        const groupDelay: number[] = [];
                        const groupData: SvgAnimate[][] = [];
                        for (const [delay, data] of groupName[attr].entries()) {
                            groupDelay.push(delay);
                            groupData.push(data);
                        }
                        const incomplete: SvgAnimate[] = [];
                        let maxTime = -1;
                        let actualMaxTime = 0;
                        let nextDelayTime = Number.POSITIVE_INFINITY;
                        let baseValue!: AnimateValue;
                        let previousTransform: SvgAnimate | undefined;
                        let previousComplete: SvgAnimate | undefined;
                        function checkComplete(item: SvgAnimate, nextDelay?: number) {
                            repeatingAnimations.add(item);
                            item.addState(SYNCHRONIZE_STATE.COMPLETE);
                            previousComplete = item;
                            if (item.fillForwards) {
                                setFreezeValue(actualMaxTime, baseValue, item.type, item);
                                if (item.group.ordering) {
                                    const duration = item.getTotalDuration();
                                    for (const previous of item.group.ordering) {
                                        if (previous.name === item.group.name) {
                                            return true;
                                        }
                                        else if (SvgAnimationIntervalMap.getGroupEndTime(previous) >= duration) {
                                            return false;
                                        }
                                    }
                                }
                            }
                            else {
                                if (item.fillFreeze) {
                                    setFreezeValue(actualMaxTime, baseValue, item.type, item);
                                }
                                if (nextDelay !== undefined) {
                                    let currentMaxTime = maxTime;
                                    const replaceValue = checkSetterDelay(actualMaxTime, actualMaxTime + 1);
                                    if (replaceValue !== undefined && item.fillReplace && nextDelay > actualMaxTime && incomplete.length === 0) {
                                        currentMaxTime = setTimelineValue(repeatingMap[attr], currentMaxTime, replaceValue);
                                        if (transforming) {
                                            setTimeRange(animateTimeRangeMap, item.type, currentMaxTime);
                                        }
                                        baseValue = replaceValue;
                                        maxTime = currentMaxTime;
                                    }
                                }
                                checkIncomplete();
                            }
                            return false;
                        }
                        function setSetterValue(item: SvgAnimation, time?: number, value?: AnimateValue) {
                            if (time === undefined) {
                                time = item.delay;
                            }
                            if (value === undefined) {
                                value = item.to;
                            }
                            return setTimelineValue(repeatingMap[attr], time, transforming ? value : convertToAnimateValue(value));
                        }
                        function sortSetterData(item?: SvgAnimation) {
                            if (item) {
                                setterData.push(item);
                            }
                            setterData.sort((a, b) => {
                                if (a.delay === b.delay) {
                                    return a.group.id < b.group.id ? -1 : 1;
                                }
                                return a.delay < b.delay ? -1 : 1;
                            });
                            for (let i = 0; i < setterData.length - 1; i++) {
                                if (setterData[i].delay === setterData[i + 1].delay) {
                                    setterData.splice(i--, 1);
                                }
                            }
                        }
                        function checkSetterDelay(delayTime: number, endTime: number): AnimateValue | undefined {
                            const item = getForwardItem(attr);
                            let replaceValue: AnimateValue | undefined = item && item.value;
                            $util.spliceArray(
                                setterData,
                                set => set.delay >= delayTime && set.delay < endTime,
                                (set: SvgAnimate) => {
                                    if (set.animationElement) {
                                        removeIncomplete();
                                    }
                                    if (incomplete.length === 0) {
                                        baseValue = set.to;
                                    }
                                    setFreezeValue(set.delay, set.to, set.type, set);
                                    if (set.delay === delayTime) {
                                        replaceValue = transforming ? set.to : convertToAnimateValue(set.to);
                                    }
                                    else {
                                        maxTime = setSetterValue(set);
                                        actualMaxTime = set.delay;
                                    }
                                }
                            );
                            return replaceValue;
                        }
                        function checkIncomplete(delayIndex?: number, itemIndex?: number) {
                            if (incomplete.length) {
                                $util.spliceArray(
                                    incomplete,
                                    previous => previous.getTotalDuration() <= actualMaxTime,
                                    previous => {
                                        previous.addState(SYNCHRONIZE_STATE.COMPLETE);
                                        if (previous.fillForwards) {
                                            setFreezeValue(previous.getTotalDuration(), previous.valueTo, previous.type, previous);
                                            if (delayIndex !== undefined && itemIndex !== undefined) {
                                                for (let i = delayIndex; i < groupDelay.length; i++) {
                                                    if (i !== delayIndex) {
                                                        itemIndex = -1;
                                                    }
                                                    for (let j = itemIndex + 1; j < groupData[i].length; j++) {
                                                        const next = groupData[i][j];
                                                        if (previous.group.id > next.group.id) {
                                                            next.addState(SYNCHRONIZE_STATE.COMPLETE);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                );
                            }
                        }
                        function queueIncomplete(item: SvgAnimate) {
                            if (!item.hasState(SYNCHRONIZE_STATE.COMPLETE, SYNCHRONIZE_STATE.INVALID)) {
                                item.addState(SYNCHRONIZE_STATE.INTERRUPTED);
                                incomplete.push(item);
                            }
                        }
                        function sortIncomplete() {
                            incomplete.sort((a, b) => {
                                if (a.animationElement && b.animationElement && a.delay !== b.delay) {
                                    return a.delay < b.delay ? 1 : -1;
                                }
                                return a.group.id < b.group.id ? 1 : -1;
                            });
                        }
                        function removeIncomplete(item?: SvgAnimation) {
                            if (item) {
                                $util.spliceArray(incomplete, previous => previous === item);
                            }
                            else {
                                $util.spliceArray(incomplete, previous => previous.animationElement !== null);
                            }
                        }
                        function setFreezeValue(time: number, value: AnimateValue, type = 0, item?: SvgAnimation) {
                            if (!transforming) {
                                value = convertToAnimateValue(value);
                            }
                            const forwardItem = getForwardItem(attr);
                            if (value !== '' && (forwardItem === undefined || time >= forwardItem.time)) {
                                if (forwardMap[attr] === undefined) {
                                    forwardMap[attr] = [];
                                }
                                forwardMap[attr].push({
                                    key: type,
                                    value,
                                    time
                                });
                            }
                            if (item && SvgBuild.isAnimate(item) && !item.fillReplace) {
                                if (item.fillForwards) {
                                    $util.spliceArray(setterData, set => set.group.id < item.group.id || set.delay < time);
                                    incomplete.length = 0;
                                    for (const group of groupData) {
                                        for (const next of group) {
                                            if (next.group.id < item.group.id) {
                                                next.addState(SYNCHRONIZE_STATE.COMPLETE);
                                            }
                                        }
                                    }
                                }
                                else if (item.fillFreeze) {
                                    removeIncomplete();
                                }
                            }
                        }
                        function resetTransform(additiveSum: boolean, resetTime: number, value?: string) {
                            if (previousTransform && !additiveSum) {
                                if (value === undefined) {
                                    value = TRANSFORM.typeAsValue(previousTransform.type);
                                }
                                maxTime = setTimelineValue(repeatingMap[attr], resetTime, value);
                                if (resetTime !== maxTime) {
                                    setTimeRange(animateTimeRangeMap, previousTransform.type, maxTime);
                                }
                            }
                            previousTransform = undefined;
                        }
                        function removeInvalid(items: SvgAnimation[]) {
                            for (let i = 0; i < groupDelay.length; i++) {
                                if (items.length) {
                                    for (let j = 0; j < groupData[i].length; j++) {
                                        if (items.includes(groupData[i][j])) {
                                            groupData[i].splice(j--, 1);
                                        }
                                    }
                                }
                                if (groupData[i].length === 0) {
                                    groupData.splice(i, 1);
                                    groupDelay.splice(i--, 1);
                                }
                            }
                        }
                        const backwards = groupAttributeMap[attr].find(item => item.fillBackwards);
                        if (backwards) {
                            baseValue = getItemValue(backwards, backwards.values, 0, 0);
                            maxTime = setTimelineValue(repeatingMap[attr], 0, baseValue);
                            if (transforming) {
                                setTimeRange(animateTimeRangeMap, backwards.type, 0);
                                previousTransform = backwards;
                            }
                            let playing = true;
                            for (const item of groupAttributeMap[attr]) {
                                if (item.group.id > backwards.group.id && item.delay <= backwards.delay) {
                                    playing = false;
                                    break;
                                }
                            }
                            const totalDuration = backwards.getTotalDuration();
                            const removeable: SvgAnimate[] = [];
                            for (let i = 0; i < groupDelay.length; i++) {
                                for (let j = 0; j < groupData[i].length; j++) {
                                    const item = groupData[i][j];
                                    if (playing) {
                                        if (item === backwards && (i !== 0 || j !== 0)) {
                                            groupData[i].splice(j--, 1);
                                            groupDelay.unshift(backwards.delay);
                                            groupData.unshift([backwards]);
                                            continue;
                                        }
                                        else if (item.group.id < backwards.group.id && (backwards.fillForwards || item.getTotalDuration() <= totalDuration)) {
                                            if (item.fillForwards) {
                                                item.setterType = true;
                                                setterData.push(item);
                                            }
                                            removeable.push(item);
                                            continue;
                                        }
                                    }
                                    if (item.animationElement && item.delay <= backwards.delay) {
                                        groupData[i].splice(j--, 1);
                                        queueIncomplete(item);
                                    }
                                }
                            }
                            removeInvalid(removeable);
                            backwards.addState(SYNCHRONIZE_STATE.BACKWARDS);
                        }
                        if (!transforming) {
                            if (forwardMap[attr] === undefined && baseValueMap[attr] !== undefined) {
                                setFreezeValue(0, baseValueMap[attr], 0);
                            }
                            if (baseValue === undefined) {
                                const item = getForwardItem(attr);
                                baseValue = item && item.value || baseValueMap[attr];
                            }
                        }
                        sortSetterData();
                        {
                            let previous: SvgAnimation | undefined;
                            $util.spliceArray(
                                setterData,
                                set => set.delay <= groupDelay[0],
                                set => {
                                    const fillForwards = SvgBuild.isAnimate(set) && set.fillForwards;
                                    if (set.delay < groupDelay[0] && (backwards === undefined || fillForwards)) {
                                        if (backwards && fillForwards) {
                                            setFreezeValue(set.delay, set.to, (<SvgAnimate> set).type);
                                        }
                                        else {
                                            const previousTime = set.delay - 1;
                                            if (previous === undefined) {
                                                if (!repeatingMap[attr].has(0)) {
                                                    let value: AnimateValue | undefined;
                                                    if (transforming && SvgBuild.isAnimateTransform(set)) {
                                                        value = TRANSFORM.typeAsValue(set.type);
                                                    }
                                                    else {
                                                        value = baseValueMap[attr];
                                                    }
                                                    if (value !== undefined) {
                                                        setSetterValue(set, 0, value);
                                                        setSetterValue(set, previousTime, value);
                                                    }
                                                }
                                                else if (!transforming) {
                                                    setSetterValue(set, previousTime, baseValue);
                                                }
                                            }
                                            else {
                                                setSetterValue(previous, previousTime);
                                            }
                                            maxTime = setSetterValue(set);
                                            actualMaxTime = set.delay;
                                            previous = set;
                                        }
                                    }
                                }
                            );
                            if (previous) {
                                setSetterValue(previous, groupDelay[0] - 1);
                            }
                        }
                        attributeEnd: {
                            for (let i = 0; i < groupDelay.length; i++) {
                                let delay = groupDelay[i];
                                for (let j = 0; j < groupData[i].length; j++) {
                                    const item = groupData[i][j];
                                    if (item.hasState(SYNCHRONIZE_STATE.COMPLETE, SYNCHRONIZE_STATE.INVALID)) {
                                        continue;
                                    }
                                    const infinite = item.iterationCount === -1;
                                    const duration = item.duration;
                                    const iterationCount = item.iterationCount;
                                    let totalDuration: number;
                                    if (!infinite) {
                                        totalDuration = item.getTotalDuration();
                                        if (totalDuration <= maxTime) {
                                            if (item.fillReplace) {
                                                item.addState(SYNCHRONIZE_STATE.INVALID);
                                            }
                                            else {
                                                queueIncomplete(item);
                                            }
                                            continue;
                                        }
                                    }
                                    else {
                                        totalDuration = delay + duration;
                                    }
                                    let iterationTotal: number;
                                    let iterationFraction: number;
                                    if (infinite) {
                                        iterationTotal = Math.ceil((repeatingDuration - delay) / duration);
                                        iterationFraction = 0;
                                    }
                                    else {
                                        iterationTotal = Math.ceil(iterationCount);
                                        iterationFraction = iterationCount - Math.floor(iterationCount);
                                    }
                                    if (setterData.length && actualMaxTime > 0 && actualMaxTime < delay) {
                                        checkSetterDelay(actualMaxTime, delay);
                                    }
                                    if (maxTime !== -1 && maxTime < delay) {
                                        maxTime = setTimelineValue(repeatingMap[attr], delay - 1, baseValue);
                                        actualMaxTime = delay;
                                    }
                                    nextDelayTime = Number.POSITIVE_INFINITY;
                                    if (item.group.ordering && item.group.ordering.length > 1) {
                                        let checkDelay = true;
                                        for (const order of item.group.ordering) {
                                            if (order.name === item.group.name) {
                                                checkDelay = false;
                                                break;
                                            }
                                            else if (!order.paused && actualMaxTime <= order.delay && order.attributes.includes(attr)) {
                                                break;
                                            }
                                        }
                                        if (checkDelay) {
                                            nextDelay: {
                                                for (let k = i + 1; k < groupDelay.length; k++) {
                                                    for (let l = 0; l < groupData[k].length; l++) {
                                                        const next = groupData[k][l];
                                                        if (next.group.ordering) {
                                                            nextDelayTime = next.delay;
                                                            break nextDelay;
                                                        }
                                                        else {
                                                            if (next.getTotalDuration() <= totalDuration) {
                                                                if (next.fillFreeze) {
                                                                    sortSetterData(next);
                                                                }
                                                                next.addState(SYNCHRONIZE_STATE.COMPLETE);
                                                            }
                                                            else if (next.delay < totalDuration) {
                                                                queueIncomplete(next);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        for (let k = i + 1; k < groupDelay.length; k++) {
                                            if (groupDelay[k] !== Number.POSITIVE_INFINITY && groupData[k].length && !groupData[k].every(next => next.hasState(SYNCHRONIZE_STATE.COMPLETE, SYNCHRONIZE_STATE.INVALID))) {
                                                nextDelayTime = groupDelay[k];
                                                break;
                                            }
                                        }
                                    }
                                    const actualStartTime = actualMaxTime;
                                    let startTime = maxTime + 1;
                                    let maxThreadTime = Math.min(nextDelayTime, item.end || Number.POSITIVE_INFINITY);
                                    let setterInterrupt: SvgAnimation | undefined;
                                    if (setterData.length && item.animationElement) {
                                        const interruptTime = Math.min(nextDelayTime, totalDuration, maxThreadTime);
                                        setterInterrupt = setterData.find(set => set.delay >= actualMaxTime && set.delay <= interruptTime);
                                        if (setterInterrupt) {
                                            switch (setterInterrupt.delay) {
                                                case actualMaxTime:
                                                    baseValue = setterInterrupt.to;
                                                    setFreezeValue(actualMaxTime, baseValue, (<SvgAnimate> setterInterrupt).type, setterInterrupt);
                                                    if (setterInterrupt.group.id > item.group.id) {
                                                        if (transforming && previousTransform) {
                                                            resetTransform(item.additiveSum, Math.max(delay - 1, maxTime));
                                                        }
                                                        maxTime = setSetterValue(setterInterrupt, Math.max(setterInterrupt.delay, maxTime), baseValue);
                                                        maxThreadTime = -1;
                                                    }
                                                    break;
                                                case nextDelayTime:
                                                    setterInterrupt.addState(SYNCHRONIZE_STATE.EQUAL_TIME);
                                                    break;
                                                default:
                                                    maxThreadTime = setterInterrupt.delay;
                                                    setterInterrupt.addState(SYNCHRONIZE_STATE.EQUAL_TIME);
                                                    break;
                                            }
                                            $util.spliceArray(setterData, set => set !== setterInterrupt);
                                            item.addState(SYNCHRONIZE_STATE.INTERRUPTED);
                                        }
                                    }
                                    let complete = false;
                                    let lastValue: AnimateValue | undefined;
                                    if (maxThreadTime > maxTime) {
                                        if (transforming) {
                                            if (previousTransform) {
                                                resetTransform(item.additiveSum, Math.max(delay - 1, maxTime));
                                                startTime = maxTime + 1;
                                            }
                                            baseValue = TRANSFORM.typeAsValue(item.type);
                                            setFreezeValue(actualMaxTime, baseValue, item.type);
                                        }
                                        let parallel = groupDelay[i] === Number.POSITIVE_INFINITY || (maxTime !== -1 || item.hasState(SYNCHRONIZE_STATE.BACKWARDS)) && !(i === 0 && j === 0);
                                        complete = true;
                                        threadTimeExceeded: {
                                            const forwardItem = getForwardItem(attr);
                                            for (let k = getStartIteration(actualMaxTime, delay, duration); k < iterationTotal; k++) {
                                                let keyTimes: number[];
                                                let values = getStartItemValues(intervalMap, item, baseValue);
                                                let keySplines: string[] | undefined;
                                                if (item.partialType) {
                                                    if (item.getIntervalEndTime(actualMaxTime) < maxThreadTime && (incomplete.length || j < groupData[i].length - 1)) {
                                                        for (let l = j + 1; l < groupData[i].length; l++) {
                                                            queueIncomplete(groupData[i][l]);
                                                        }
                                                        groupData[i].length = 0;
                                                        sortIncomplete();
                                                        [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, item, actualMaxTime, maxThreadTime, values, baseValue, incomplete);
                                                    }
                                                    else {
                                                        [keyTimes, values, keySplines] = cloneKeyTimes(item);
                                                    }
                                                    checkPartialKeyTimes(keyTimes, values, keySplines, baseValueMap[attr]);
                                                }
                                                else {
                                                    keyTimes = item.keyTimes;
                                                    keySplines = item.keySplines;
                                                }
                                                for (let l = 0; l < keyTimes.length; l++) {
                                                    const keyTime = keyTimes[l];
                                                    let time = -1;
                                                    let value = getItemValue(item, values, k, l, baseValue);
                                                    if (k === iterationTotal - 1 && iterationFraction > 0) {
                                                        if (iterationFraction === keyTime) {
                                                            iterationFraction = -1;
                                                        }
                                                        else if (l === keyTimes.length - 1) {
                                                            time = totalDuration;
                                                            actualMaxTime = time;
                                                            value = getItemSplitValue(iterationFraction, keyTimes[l - 1], getItemValue(item, values, k, l - 1, baseValue), keyTime, value);
                                                            iterationFraction = -1;
                                                        }
                                                        else if (iterationFraction > keyTime) {
                                                            for (let m = l + 1; m < keyTimes.length; m++) {
                                                                if (iterationFraction <= keyTimes[m]) {
                                                                    time = totalDuration;
                                                                    actualMaxTime = time;
                                                                    value = getItemSplitValue(iterationFraction, keyTime, value, keyTimes[m], getItemValue(item, values, k, m, baseValue));
                                                                    iterationFraction = -1;
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (time === -1) {
                                                        time = getItemTime(delay, duration, keyTimes, k, l);
                                                        if (time < 0 || time < maxTime) {
                                                            continue;
                                                        }
                                                        if (time === maxThreadTime) {
                                                            complete = k === iterationTotal - 1 && l === keyTimes.length - 1;
                                                            actualMaxTime = time;
                                                        }
                                                        else {
                                                            function insertIntermediateValue(splitTime: number) {
                                                                [maxTime, lastValue] = insertSplitValue(item, actualMaxTime, baseValue, keyTimes, values, keySplines, delay, k, splitTime, keyTimeMode, repeatingMap[attr], repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                            }
                                                            if (delay < 0 && maxTime === -1) {
                                                                if (time > 0) {
                                                                    actualMaxTime = 0;
                                                                    insertIntermediateValue(0);
                                                                }
                                                            }
                                                            else {
                                                                if (time > maxThreadTime) {
                                                                    if (parallel && maxTime + 1 < maxThreadTime) {
                                                                        insertIntermediateValue(maxTime);
                                                                    }
                                                                    actualMaxTime = maxThreadTime;
                                                                    insertIntermediateValue(maxThreadTime + (maxThreadTime === nextDelayTime && !repeatingMap[attr].has(maxThreadTime - 1) ? -1 : 0));
                                                                    complete = false;
                                                                    break threadTimeExceeded;
                                                                }
                                                                else {
                                                                    if (parallel) {
                                                                        if (item.hasState(SYNCHRONIZE_STATE.BACKWARDS)) {
                                                                            actualMaxTime = actualStartTime;
                                                                        }
                                                                        if (delay >= maxTime) {
                                                                            time = Math.max(delay, maxTime + 1);
                                                                            actualMaxTime = delay;
                                                                        }
                                                                        else if (time === maxTime) {
                                                                            actualMaxTime = time;
                                                                            time = maxTime + 1;
                                                                        }
                                                                        else {
                                                                            insertIntermediateValue(maxTime);
                                                                            actualMaxTime = Math.max(time, maxTime);
                                                                        }
                                                                        parallel = false;
                                                                    }
                                                                    else {
                                                                        actualMaxTime = time;
                                                                        if (k > 0 && l === 0 && item.accumulateSum) {
                                                                            insertInterpolator(item, time, keySplines, l, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                                            maxTime = time;
                                                                            continue;
                                                                        }
                                                                        time = Math.max(time, maxTime + 1);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (time > maxTime) {
                                                        if (l === keyTimes.length - 1 && !item.accumulateSum && (k < iterationTotal - 1 || item.fillReplace && (forwardItem === undefined || value !== forwardItem.value))) {
                                                            time--;
                                                        }
                                                        maxTime = setTimelineValue(repeatingMap[attr], time, value);
                                                        insertInterpolator(item, maxTime, keySplines, l, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                        lastValue = value;
                                                    }
                                                    if (!complete || iterationFraction === -1) {
                                                        break threadTimeExceeded;
                                                    }
                                                }
                                            }
                                        }
                                        checkIncomplete(i, j);
                                    }
                                    if (lastValue !== undefined) {
                                        baseValue = lastValue;
                                        if (transforming) {
                                            setTimeRange(animateTimeRangeMap, item.type, startTime, maxTime);
                                            previousTransform = item;
                                        }
                                    }
                                    if (setterInterrupt) {
                                        if (setterInterrupt.hasState(SYNCHRONIZE_STATE.EQUAL_TIME)) {
                                            lastValue = setterInterrupt.to;
                                            maxTime = setSetterValue(setterInterrupt, setterInterrupt.delay, lastValue);
                                            actualMaxTime = setterInterrupt.delay;
                                            setFreezeValue(actualMaxTime, lastValue, (<SvgAnimate> setterInterrupt).type, setterInterrupt);
                                        }
                                        else if (item.hasState(SYNCHRONIZE_STATE.INVALID)) {
                                            setTimeRange(animateTimeRangeMap, maxTime, (<SvgAnimate> setterInterrupt).type);
                                        }
                                        removeIncomplete();
                                        complete = true;
                                    }
                                    $util.spliceArray(
                                        setterData,
                                        set => set.delay >= actualStartTime && set.delay <= actualMaxTime,
                                        (set: SvgAnimate) => {
                                            setFreezeValue(set.delay, set.to, set.type, set);
                                            if (set.animationElement) {
                                                removeIncomplete();
                                            }
                                        }
                                    );
                                    if (infinite) {
                                        if (complete) {
                                            if (setterInterrupt === undefined) {
                                                infiniteMap[attr] = item;
                                                break attributeEnd;
                                            }
                                        }
                                        else {
                                            incomplete.length = 0;
                                            incomplete.push(item);
                                            continue;
                                        }
                                    }
                                    if (complete) {
                                        if (!infinite && checkComplete(item, nextDelayTime)) {
                                            break attributeEnd;
                                        }
                                        for (let k = i; k < groupDelay.length; k++) {
                                            if (groupDelay[k] < actualMaxTime) {
                                                for (let l = 0; l < groupData[k].length; l++) {
                                                    const next = groupData[k][l];
                                                    const nextDuration = next.getTotalDuration();
                                                    if (nextDuration > actualMaxTime && !next.hasState(SYNCHRONIZE_STATE.INTERRUPTED, SYNCHRONIZE_STATE.COMPLETE, SYNCHRONIZE_STATE.INVALID)) {
                                                        queueIncomplete(next);
                                                    }
                                                    else if (!next.fillReplace) {
                                                        setFreezeValue(nextDuration, next.valueTo, next.type, next);
                                                    }
                                                }
                                                groupDelay[k] = Number.POSITIVE_INFINITY;
                                                groupData[k].length = 0;
                                            }
                                        }
                                        if (incomplete.length && actualMaxTime < nextDelayTime) {
                                            sortIncomplete();
                                            const resume = incomplete.find(next => next.delay <= actualMaxTime);
                                            if (resume) {
                                                resume.removeState(SYNCHRONIZE_STATE.INTERRUPTED, SYNCHRONIZE_STATE.BACKWARDS);
                                                resume.addState(SYNCHRONIZE_STATE.RESUME);
                                                removeIncomplete(resume);
                                                delay = resume.delay;
                                                groupData[i] = [resume];
                                                j = -1;
                                            }
                                        }
                                    }
                                    else {
                                        queueIncomplete(item);
                                    }
                                }
                            }
                            if (incomplete.length) {
                                sortIncomplete();
                                for (let i = 0; i < incomplete.length; i++) {
                                    const item = incomplete[i];
                                    const delay = item.delay;
                                    const duration = item.duration;
                                    const durationTotal = maxTime - delay;
                                    let maxThreadTime = Number.POSITIVE_INFINITY;
                                    function insertKeyTimes() {
                                        let keyTimes: number[];
                                        let values = getStartItemValues(intervalMap, item, baseValue);
                                        let keySplines: string[] | undefined;
                                        if (item.partialType) {
                                            if (item.getIntervalEndTime(actualMaxTime) < maxThreadTime && i < incomplete.length - 1) {
                                                [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, item, actualMaxTime, maxThreadTime, values, baseValue, incomplete);
                                            }
                                            else {
                                                [keyTimes, values, keySplines] = cloneKeyTimes(item);
                                            }
                                            checkPartialKeyTimes(keyTimes, values, keySplines, baseValueMap[attr]);
                                        }
                                        else {
                                            keyTimes = item.keyTimes;
                                            keySplines = item.keySplines;
                                        }
                                        const startTime = maxTime + 1;
                                        let j = Math.floor(durationTotal / duration);
                                        let joined = false;
                                        const insertIntermediateValue = (time: number) => insertSplitValue(item, actualMaxTime, baseValue, keyTimes, values, keySplines, delay, j, time, keyTimeMode, repeatingMap[attr], repeatingInterpolatorMap, repeatingTransformOriginMap);
                                        do {
                                            for (let k = 0; k < keyTimes.length; k++) {
                                                let time = getItemTime(delay, duration, keyTimes, j, k);
                                                if (!joined && time >= maxTime) {
                                                    [maxTime, baseValue] = insertIntermediateValue(maxTime);
                                                    joined = true;
                                                }
                                                if (joined) {
                                                    if (time >= maxThreadTime) {
                                                        if (maxThreadTime > maxTime) {
                                                            [maxTime, baseValue] = insertIntermediateValue(maxThreadTime);
                                                            actualMaxTime = maxThreadTime;
                                                        }
                                                    }
                                                    else if (time > maxTime) {
                                                        actualMaxTime = time;
                                                        if (k === keyTimes.length - 1 && time < maxThreadTime) {
                                                            time--;
                                                        }
                                                        baseValue = getItemValue(item, values, j, k, baseValue);
                                                        maxTime = setTimelineValue(repeatingMap[attr], time, baseValue);
                                                        insertInterpolator(item, maxTime, keySplines, k, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                    }
                                                }
                                            }
                                        }
                                        while (maxTime < maxThreadTime && ++j);
                                        if (transforming) {
                                            setTimeRange(animateTimeRangeMap, item.type, startTime, maxTime);
                                        }
                                    }
                                    if (item.iterationCount === -1) {
                                        if (durationTotal > 0 && durationTotal % item.duration !== 0) {
                                            maxThreadTime = delay + item.duration * Math.ceil(durationTotal / duration);
                                            insertKeyTimes();
                                        }
                                        infiniteMap[attr] = item;
                                        break attributeEnd;
                                    }
                                    else {
                                        maxThreadTime = Math.min(delay + item.duration * item.iterationCount, item.end || Number.POSITIVE_INFINITY);
                                        if (maxThreadTime > maxTime) {
                                            insertKeyTimes();
                                            if (checkComplete(item)) {
                                                break attributeEnd;
                                            }
                                        }
                                    }
                                }
                            }
                            if (previousComplete && previousComplete.fillReplace && infiniteMap[attr] === undefined) {
                                let key = 0;
                                let value: AnimateValue | undefined;
                                if (forwardMap[attr]) {
                                    const item = getForwardItem(attr);
                                    if (item) {
                                        key = item.key;
                                        value = item.value;
                                    }
                                }
                                else {
                                    if (transforming) {
                                        key = Array.from(animateTimeRangeMap.values()).pop() as number;
                                        value = TRANSFORM.typeAsValue(key);
                                    }
                                    else {
                                        value = baseValueMap[attr];
                                    }
                                }
                                if (value !== undefined && !$util.isEqual(<AnimateValue> repeatingMap[attr].get(maxTime), value)) {
                                    maxTime = setTimelineValue(repeatingMap[attr], maxTime, value);
                                    if (transforming) {
                                        setTimeRange(animateTimeRangeMap, key, maxTime);
                                    }
                                }
                            }
                        }
                        repeatingMaxTime[attr] = maxTime;
                    }
                    {
                        const keyTimesRepeating = new Set<number>();
                        let repeatingEndTime = 0;
                        for (const attr in repeatingMap) {
                            let maxTime = 0;
                            for (const time of repeatingMap[attr].keys()) {
                                keyTimesRepeating.add(time);
                                maxTime = time;
                            }
                            repeatingEndTime = Math.max(repeatingEndTime, maxTime);
                            if (forwardMap[attr]) {
                                forwardMap[attr].sort((a, b) => {
                                    if (a.time === b.time) {
                                        return 0;
                                    }
                                    return a.time < b.time ? -1 : 1;
                                });
                            }
                        }
                        if (Object.keys(infiniteMap).length) {
                            const delay: number[] = [];
                            const duration: number[] = [];
                            for (const attr in infiniteMap) {
                                delay.push(infiniteMap[attr].delay);
                                duration.push(infiniteMap[attr].duration);
                            }
                            if (repeatingAnimations.size === 0 && new Set(delay).size === 1 && new Set(duration).size === 1 && delay[0] === keyTimesRepeating.values().next().value) {
                                repeatingAsInfinite = delay[0] <= 0 ? 0 : delay[0];
                            }
                            else {
                                if (duration.length > 1 && duration.every(value => value % 250 === 0)) {
                                    repeatingEndTime = $math.nextMultiple(duration, repeatingEndTime, delay);
                                }
                                else if ((repeatingEndTime - delay[0]) % duration[0] !== 0) {
                                    repeatingEndTime = duration[0] * Math.ceil(repeatingEndTime / duration[0]);
                                }
                            }
                        }
                        if (repeatingAsInfinite === -1) {
                            for (const attr in repeatingMap) {
                                if (infiniteMap[attr]) {
                                    let maxTime = repeatingMaxTime[attr];
                                    if (maxTime < repeatingEndTime) {
                                        const item = infiniteMap[attr];
                                        const delay = item.delay;
                                        const startTime = maxTime + 1;
                                        let baseValue = <AnimateValue> Array.from(repeatingMap[attr].values()).pop();
                                        let i = Math.floor((maxTime - delay) / item.duration);
                                        const values = getStartItemValues(intervalMap, item, baseValue);
                                        do {
                                            let joined = false;
                                            for (let j = 0; j < item.keyTimes.length; j++) {
                                                let time = getItemTime(delay, item.duration, item.keyTimes, i, j);
                                                if (!joined && time >= maxTime) {
                                                    [maxTime, baseValue] = insertSplitValue(item, maxTime, baseValue, item.keyTimes, values, item.keySplines, delay, i, maxTime, keyTimeMode, repeatingMap[attr], repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                    keyTimesRepeating.add(maxTime);
                                                    joined = true;
                                                }
                                                if (joined && time > maxTime) {
                                                    if (j === item.keyTimes.length - 1 && time < repeatingEndTime) {
                                                        time--;
                                                    }
                                                    baseValue = getItemValue(item, values, i, j, baseValue);
                                                    maxTime = setTimelineValue(repeatingMap[attr], time, baseValue);
                                                    insertInterpolator(item, time, item.keySplines, j, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                    keyTimesRepeating.add(maxTime);
                                                }
                                            }
                                        }
                                        while (maxTime < repeatingEndTime && ++i);
                                        repeatingMaxTime[attr] = maxTime;
                                        if (transforming) {
                                            setTimeRange(animateTimeRangeMap, item.type, startTime, maxTime);
                                        }
                                    }
                                }
                            }
                        }
                        const keyTimes = $util.sortNumber(Array.from(keyTimesRepeating));
                        if (path || transforming) {
                            let modified = false;
                            for (const attr in repeatingMap) {
                                if (!repeatingMap[attr].has(0) && baseValueMap[attr] !== undefined) {
                                    const endTime = repeatingMap[attr].keys().next().value - 1;
                                    repeatingMap[attr].set(0, baseValueMap[attr]);
                                    repeatingMap[attr].set(endTime, baseValueMap[attr]);
                                    if (!keyTimes.includes(0)) {
                                        keyTimes.push(0);
                                        modified = true;
                                    }
                                    if (!keyTimes.includes(endTime)) {
                                        keyTimes.push(endTime);
                                        modified = true;
                                    }
                                }
                            }
                            if (modified) {
                                $util.sortNumber(keyTimes);
                            }
                        }
                        if (!transforming) {
                            for (const attr in repeatingMap) {
                                for (const keyTime of keyTimes) {
                                    if (keyTime <= repeatingMaxTime[attr]) {
                                        if (!repeatingMap[attr].has(keyTime)) {
                                            if (intervalMap.paused(attr, keyTime)) {
                                                let value = <AnimateValue> intervalMap.get(attr, keyTime);
                                                if (value) {
                                                    value = convertToAnimateValue(value, true);
                                                    if (value !== '') {
                                                        repeatingMap[attr].set(keyTime, value);
                                                        continue;
                                                    }
                                                }
                                            }
                                            insertAdjacentSplitValue(repeatingMap[attr], attr, keyTime, intervalMap, transforming);
                                        }
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                        }
                        repeatingResult = createKeyTimeMap(repeatingMap, keyTimes, forwardMap);
                    }
                    if (repeatingAsInfinite === -1 && Object.keys(infiniteMap).length) {
                        const timelineMap: TimelineMap = {};
                        const infiniteAnimations: SvgAnimate[] = [];
                        const keyTimes: number[] = [];
                        const duration: number[] = [];
                        for (const attr in infiniteMap) {
                            duration.push(infiniteMap[attr].duration);
                            infiniteAnimations.push(infiniteMap[attr]);
                        }
                        const maxDuration = $math.nextMultiple(duration);
                        for (const item of infiniteAnimations) {
                            const attr = item.attributeName;
                            timelineMap[attr] = new Map<number, AnimateValue>();
                            let baseValue = repeatingMap[attr].has(repeatingMaxTime[attr]) ? <AnimateValue> repeatingMap[attr].get(repeatingMaxTime[attr]) : baseValueMap[attr];
                            const values = getStartItemValues(intervalMap, item, baseValue);
                            let maxTime = 0;
                            let i = 0;
                            do {
                                for (let j = 0; j < item.keyTimes.length; j++) {
                                    let time = getItemTime(0, item.duration, item.keyTimes, i, j);
                                    if (j === item.keyTimes.length - 1 && time < maxDuration) {
                                        time--;
                                    }
                                    baseValue = getItemValue(item, values, i, j, baseValue);
                                    maxTime = setTimelineValue(timelineMap[attr], time, baseValue);
                                    insertInterpolator(item, maxTime, item.keySplines, j, keyTimeMode, infiniteInterpolatorMap, infiniteTransformOriginMap);
                                    if (!keyTimes.includes(maxTime)) {
                                        keyTimes.push(maxTime);
                                    }
                                }
                            }
                            while (maxTime < maxDuration && ++i);
                        }
                        if (infiniteAnimations.every(item => item.alternate)) {
                            let maxTime = -1;
                            for (const attr in infiniteMap) {
                                const times = Array.from(timelineMap[attr].keys());
                                const values = Array.from(timelineMap[attr].values()).reverse();
                                for (let i = 0; i < times.length; i++) {
                                    if (times[i] !== 0) {
                                        maxTime = maxDuration + times[i];
                                        const interpolator = infiniteInterpolatorMap.get(times[i]);
                                        if (interpolator) {
                                            infiniteInterpolatorMap.set(maxTime, interpolator);
                                        }
                                        maxTime = setTimelineValue(timelineMap[attr], maxTime, values[i]);
                                        if (!keyTimes.includes(maxTime)) {
                                            keyTimes.push(maxTime);
                                        }
                                    }
                                }
                            }
                        }
                        $util.sortNumber(keyTimes);
                        for (const attr in timelineMap) {
                            for (const time of keyTimes) {
                                if (!timelineMap[attr].has(time)) {
                                    insertAdjacentSplitValue(timelineMap[attr], attr, time, intervalMap, transforming);
                                }
                            }
                        }
                        infiniteResult = createKeyTimeMap(timelineMap, keyTimes, forwardMap);
                    }
                    if (repeatingResult || infiniteResult) {
                        this._removeAnimations(staggered);
                        const timeRange = Array.from(animateTimeRangeMap.entries());
                        const synchronizedName = $util.joinMap(staggered, item => SvgBuild.isAnimateTransform(item) ? TRANSFORM.typeAsName(item.type) : item.attributeName, '-');
                        for (const result of [repeatingResult, infiniteResult]) {
                            if (result) {
                                const repeating = result === repeatingResult;
                                const interpolatorMap = repeating ? repeatingInterpolatorMap : infiniteInterpolatorMap;
                                const transformOriginMap = <TransformOriginMap> (repeating ? repeatingTransformOriginMap : infiniteTransformOriginMap);
                                if (isKeyTimeFormat(transforming, keyTimeMode)) {
                                    const keySplines: string[] = [];
                                    if (transforming) {
                                        const transformMap: KeyTimeMap[] = [];
                                        if (repeating) {
                                            const entries = Array.from(result.entries());
                                            let type = timeRange[0][1];
                                            for (let i = 0, j = 0, k = 0; i < timeRange.length; i++) {
                                                const next = i < timeRange.length - 1 ? timeRange[i + 1][1] : -1;
                                                if (type !== next) {
                                                    const map = new Map<number, Map<number, AnimateValue>>();
                                                    for (let l = k; l < entries.length; l++) {
                                                        const keyTime = entries[l][0];
                                                        if (keyTime >= timeRange[j][0] && keyTime <= timeRange[i][0]) {
                                                            map.set(keyTime, new Map([[type, entries[l][1].values().next().value as string]]));
                                                            k = l;
                                                        }
                                                        else if (keyTime > timeRange[i][0]) {
                                                            break;
                                                        }
                                                    }
                                                    transformMap.push(map);
                                                    type = next;
                                                    j = i + 1;
                                                }
                                            }
                                        }
                                        else if (infiniteMap['transform']) {
                                            const entries = Array.from(result.entries());
                                            const map = new Map<number, Map<number, AnimateValue>>();
                                            for (const item of entries) {
                                                map.set(item[0], new Map([[infiniteMap['transform'].type, item[1].values().next().value as string]]));
                                            }
                                            transformMap.push(map);
                                        }
                                        else {
                                            return;
                                        }
                                        let previousEndTime = 0;
                                        for (let i = 0; i < transformMap.length; i++) {
                                            const entries = Array.from(transformMap[i].entries());
                                            let delay = entries[0][0];
                                            if (entries.length === 1) {
                                                if (i < transformMap.length - 1) {
                                                    entries.push([transformMap[i + 1].keys().next().value, entries[0][1]]);
                                                }
                                                else {
                                                    entries.push([delay + 1, entries[0][1]]);
                                                }
                                            }
                                            const endTime = entries[entries.length - 1][0];
                                            let duration = endTime - delay;
                                            const animate = new SvgAnimateTransform();
                                            animate.type = entries[0][1].keys().next().value as number;
                                            for (let j = 0; j < entries.length; j++) {
                                                const item = entries[j];
                                                keySplines.push(interpolatorMap.get(item[0]) || '');
                                                if (animate.type !== SVGTransform.SVG_TRANSFORM_ROTATE) {
                                                    const transformOrigin = transformOriginMap.get(item[0]);
                                                    if (transformOrigin) {
                                                        if (animate.transformOrigin === undefined) {
                                                            animate.transformOrigin = [];
                                                        }
                                                        animate.transformOrigin[j] = transformOrigin;
                                                    }
                                                }
                                                item[0] -= delay;
                                            }
                                            for (const [keyTime, data] of convertToFraction(entries)) {
                                                animate.keyTimes.push(keyTime);
                                                animate.values.push(data.values().next().value as string);
                                            }
                                            delay -= previousEndTime;
                                            if (delay > 1) {
                                                animate.delay = delay;
                                            }
                                            else if (delay === 1 && (duration + 1) % 10 === 0) {
                                                duration++;
                                            }
                                            animate.duration = duration;
                                            animate.keySplines = keySplines;
                                            animate.synchronized = { key: i, value: '' };
                                            previousEndTime = endTime;
                                            this._insertAnimate(animate, repeating);
                                        }
                                    }
                                    else {
                                        const entries = Array.from(result.entries());
                                        const delay = repeatingAsInfinite !== -1 ? repeatingAsInfinite : 0;
                                        let object: SvgAnimate | undefined;
                                        for (const item of entries) {
                                            keySplines.push(interpolatorMap.get(item[0]) || '');
                                            item[0] -= delay;
                                        }
                                        if (path) {
                                            const pathData = getPathData(convertToFraction(entries), path, this.parent, forwardMap, precision);
                                            if (pathData) {
                                                object = new SvgAnimate();
                                                object.attributeName = 'd';
                                                for (const item of pathData) {
                                                    object.keyTimes.push(item.key);
                                                    object.values.push(item.value.toString());
                                                }
                                            }
                                            else {
                                                return;
                                            }
                                        }
                                        else {
                                            const animate = new SvgAnimateTransform();
                                            animate.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                            for (const [keyTime, data] of result.entries()) {
                                                const x = data.get('x') as number || 0;
                                                const y = data.get('y') as number || 0;
                                                animate.keyTimes.push(keyTime);
                                                animate.values.push(this.parent ? `${this.parent.refitX(x)} ${this.parent.refitX(y)}` : `${x} ${y}`);
                                            }
                                            object = animate;
                                        }
                                        object.delay = delay;
                                        object.keySplines = keySplines;
                                        object.duration = entries[entries.length - 1][0];
                                        this._insertAnimate(object, repeating);
                                    }
                                }
                                else if (isFromToFormat(transforming, keyTimeMode)) {
                                    const entries = Array.from(result.entries());
                                    for (let i = 0; i < entries.length - 1; i++) {
                                        const [keyTimeFrom, dataFrom] = entries[i];
                                        const [keyTimeTo, dataTo] = entries[i + 1];
                                        let object: SvgAnimate | undefined;
                                        let value = synchronizedName;
                                        if (transforming) {
                                            const animate = new SvgAnimateTransform();
                                            if (repeating) {
                                                for (let j = 0; j < timeRange.length - 1; j++) {
                                                    const previous = timeRange[j];
                                                    const next = timeRange[j + 1];
                                                    if (previous[1] === next[1] && keyTimeFrom >= previous[0] && keyTimeTo <= next[0]) {
                                                        animate.type = previous[1];
                                                        break;
                                                    }
                                                    else if (keyTimeTo - keyTimeFrom === 1 && keyTimeTo === next[0]) {
                                                        animate.type = next[1];
                                                        break;
                                                    }
                                                }
                                            }
                                            else if (infiniteMap['transform']) {
                                                animate.type = infiniteMap['transform'].type;
                                            }
                                            if (animate.type === 0) {
                                                continue;
                                            }
                                            animate.values = [dataFrom.values().next().value as string, dataTo.values().next().value as string];
                                            const transformOrigin = transformOriginMap.get(keyTimeTo);
                                            if (transformOrigin) {
                                                animate.transformOrigin = [transformOrigin];
                                            }
                                            object = animate;
                                        }
                                        else {
                                            if (path) {
                                                const pathData = getPathData([[keyTimeFrom, dataFrom], [keyTimeTo, dataTo]], path, this.parent, forwardMap, precision);
                                                if (pathData) {
                                                    object = new SvgAnimate();
                                                    object.attributeName = 'd';
                                                    object.values = $util.replaceMap<NumberValue, string>(pathData, item => item.value.toString());
                                                }
                                                else {
                                                    continue;
                                                }
                                            }
                                            else {
                                                const animate = new SvgAnimateTransform();
                                                animate.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                                animate.values = $util.objectMap<TimelineValue, string>([dataFrom, dataTo], data => {
                                                    const x = data.get('x') as number || 0;
                                                    const y = data.get('y') as number || 0;
                                                    return this.parent ? `${this.parent.refitX(x)} ${this.parent.refitX(y)}` : `${x} ${y}`;
                                                });
                                                value += i;
                                                object = animate;
                                            }
                                        }
                                        if (repeating) {
                                            object.delay = i === 0 ? keyTimeFrom : 0;
                                        }
                                        object.duration = keyTimeTo - keyTimeFrom;
                                        object.keyTimes = [0, 1];
                                        object.synchronized = { key: i, value };
                                        const interpolator = interpolatorMap.get(keyTimeTo);
                                        if (interpolator) {
                                            object.keySplines = [interpolator];
                                        }
                                        this._insertAnimate(object, repeating);
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        private _removeAnimations(values: SvgAnimation[]) {
            if (values.length) {
                $util.spliceArray(this.animations, (item: SvgAnimation) => values.includes(item));
            }
        }

        private _insertAnimate(item: SvgAnimate, repeating: boolean) {
            if (!repeating) {
                item.iterationCount = -1;
            }
            item.from = item.valueFrom;
            item.to = item.valueTo;
            this.animations.push(item);
        }
    };
};