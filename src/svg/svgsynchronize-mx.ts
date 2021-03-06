import SYNCHRONIZE_MODE = squared.svg.constant.SYNCHRONIZE_MODE;
import SYNCHRONIZE_STATE = squared.svg.constant.SYNCHRONIZE_STATE;

import type SvgAnimation from './svganimation';
import type SvgPath from './svgpath';

import SvgAnimate from './svganimate';
import SvgAnimateTransform from './svganimatetransform';
import SvgBuild from './svgbuild';
import SvgAnimationIntervalMap from './svganimationintervalmap';

import { SVG, TRANSFORM } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;
type AnimateValue = NumString | Point[];
type TimelineValue = Map<string | number, AnimateValue>;
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

const { clamp, equal, multipleOf } = squared.lib.math;
const { hasKeys, hasValue, isEqual, joinArray, lastItemOf, replaceMap, spliceArray, sortNumber } = squared.lib.util;

function insertAdjacentSplitValue(map: TimelineIndex, attr: string, time: number, intervalMap: SvgAnimationIntervalMap, transforming: boolean) {
    let previousTime = 0,
        previousValue: Undef<AnimateValue>,
        previous: Undef<NumberValue<AnimateValue>>,
        next: Undef<NumberValue<AnimateValue>>;
    for (const [key, value] of map) {
        if (time === key) {
            previous = { key, value };
            break;
        }
        else if (time > previousTime && time < key && previousValue !== undefined) {
            previous = {
                key: previousTime,
                value: previousValue
            };
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
        let value = intervalMap.get(attr, time, true) as Undef<AnimateValue>;
        if (value !== undefined) {
            value = convertToAnimateValue(value, true);
            if (value !== '') {
                setTimelineValue(map, time, value, false);
            }
        }
    }
}

function convertToFraction(values: TimelineEntries) {
    const previous = new Set<number>();
    const length = values.length;
    const timeTotal = values[length - 1][0];
    for (let i = 0; i < length; ++i) {
        const item = values[i];
        let fraction = item[0] / timeTotal;
        if (fraction > 0) {
            let j = 7;
            do {
                const value = +fraction.toString().substring(0, j);
                if (!previous.has(value)) {
                    fraction = value;
                    break;
                }
            }
            while (++j);
        }
        item[0] = fraction;
        previous.add(fraction);
    }
    return values;
}

function convertToAnimateValue(value: AnimateValue, fromString: boolean) {
    if (typeof value === 'string') {
        if (fromString) {
            return '';
        }
        if (value) {
            const n = +value;
            if (!isNaN(n)) {
                return n;
            }
            value = SvgBuild.parsePoints(value);
            if (value.length === 0) {
                return '';
            }
        }
    }
    return value;
}

function getForwardValue(items: Undef<ForwardValue[]>, time: number) {
    let value: Undef<AnimateValue>;
    if (items) {
        for (let i = 0, length = items.length; i < length; ++i) {
            const item = items[i];
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

function getPathData(entries: TimelineEntries, path: SvgPath, parent: Null<SvgContainer>, forwardMap: ForwardMap, precision?: number) {
    const result: NumberValue[] = [];
    const tagName = path.element.tagName;
    let baseVal: string[];
    switch (tagName) {
        case 'line':
            baseVal = ['x1', 'y1', 'x2', 'y2'];
            break;
        case 'rect':
            baseVal = ['width', 'height', 'x', 'y'];
            break;
        case 'polyline':
        case 'polygon':
            baseVal = ['points'];
            break;
        case 'circle':
            baseVal = ['cx', 'cy', 'r'];
            break;
        case 'ellipse':
            baseVal = ['cx', 'cy', 'rx', 'ry'];
            break;
        default:
            return;
    }
    const transformOrigin = TRANSFORM.origin(path.element);
    for (let i = 0, length = entries.length; i < length; ++i) {
        invalid: {
            const [key, data] = entries[i];
            const values: AnimateValue[] = [];
            for (let j = 0, q = baseVal.length; j < q; ++j) {
                const attr = baseVal[j];
                let value = data.get(attr);
                if (value === undefined) {
                    value = getForwardValue(forwardMap[attr], key) ?? path.getBaseValue(attr);
                }
                if (value !== undefined) {
                    values.push(value);
                }
                else {
                    break invalid;
                }
            }
            let points: SvgPoint[];
            switch (tagName) {
                case 'line':
                    points = [
                        { x: values[0], y: values[1] },
                        { x: values[2], y: values[4] }
                    ] as Point[];
                    break;
                case 'rect': {
                    const [width, height, x, y] = values as number[];
                    points = [
                        { x, y },
                        { x: x + width, y },
                        { x: x + width, y: y + height },
                        { x, y: y + height }
                    ] as Point[];
                    break;
                }
                case 'polygon':
                case 'polyline':
                    points = values[0] as Point[];
                    break;
                case 'circle':
                case 'ellipse':
                    points = [{ x: values[0] as number, y: values[1] as number, rx: values[2] as number, ry: lastItemOf(values) as number }];
                    break;
            }
            if (path.transformed) {
                points = SvgBuild.applyTransforms(path.transformed, points, transformOrigin);
            }
            if (parent) {
                parent.refitPoints(points);
            }
            let value: string;
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
                case 'ellipse': {
                    const { x, y, rx, ry } = points[0] as Required<SvgPoint>;
                    value = SvgBuild.drawEllipse(x, y, rx, ry, precision);
                    break;
                }
            }
            result.push({ key, value });
        }
    }
    return result;
}

function createKeyTimeMap(map: TimelineMap, keyTimes: number[], forwardMap: ForwardMap) {
    const result = new Map<number, Map<string, AnimateValue>>();
    for (let i = 0, length = keyTimes.length; i < length; ++i) {
        const keyTime = keyTimes[i];
        const values = new Map<string, AnimateValue>();
        for (const attr in map) {
            const value: Undef<AnimateValue> = map[attr]!.get(keyTime) ?? getForwardValue(forwardMap[attr], keyTime);
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
                const baseArray = replaceMap(baseValue.split(' '), value => +value);
                const valuesArray = values.map(value => replaceMap(value.trim().split(/\s+/), pt => +pt));
                const length = baseArray.length;
                if (valuesArray.every(value => value.length === length)) {
                    const result = valuesArray[index];
                    if (!item.accumulateSum) {
                        iteration = 0;
                    }
                    for (let i = 0; i < length; ++i) {
                        result[i] += baseArray[i];
                    }
                    for (let i = 0, q = valuesArray.length; i < iteration; ++i) {
                        for (let j = 0; j < q; ++j) {
                            const value = valuesArray[j];
                            for (let k = 0, r = value.length; k < r; ++k) {
                                result[k] += value[k];
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
            let result = +values[index];
            if (!isNaN(result)) {
                if (item.additiveSum && typeof baseValue === 'number') {
                    result += baseValue;
                    if (!item.accumulateSum) {
                        iteration = 0;
                    }
                    for (let i = 0, length = values.length; i < iteration; ++i) {
                        for (let j = 0; j < length; ++j) {
                            result += +values[j];
                        }
                    }
                }
                return result;
            }
        }
    }
    return baseValue || 0;
}

function getItemSplitValue(fraction: number, previousFraction: number, previousValue: AnimateValue, nextFraction: number, nextValue: AnimateValue) {
    if (fraction > previousFraction) {
        if (typeof previousValue === 'number' && typeof nextValue === 'number') {
            return SvgAnimate.getSplitValue(previousValue, nextValue, (fraction - previousFraction) / (nextFraction - previousFraction));
        }
        else if (typeof previousValue === 'string' && typeof nextValue === 'string') {
            const previousArray = replaceMap(previousValue.split(' '), value => +value);
            const nextArray = replaceMap(nextValue.split(' '), value => +value);
            const length = previousArray.length;
            if (length === nextArray.length) {
                let result = '';
                for (let i = 0; i < length; ++i) {
                    result += (i > 0 ? ' ' : '') + getItemSplitValue(fraction, previousFraction, previousArray[i], nextFraction, nextArray[i]);
                }
                return result;
            }
        }
        else if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
            const result: Point[] = [];
            for (let i = 0, length = Math.min(previousValue.length, nextValue.length); i < length; ++i) {
                const previous = previousValue[i];
                const next = nextValue[i];
                result.push({
                    x: getItemSplitValue(fraction, previousFraction, previous.x, nextFraction, next.x) as number,
                    y: getItemSplitValue(fraction, previousFraction, previous.y, nextFraction, next.y) as number
                });
            }
            return result;
        }
    }
    return previousValue;
}

function insertSplitValue(item: SvgAnimate, actualTime: number, baseValue: Undef<AnimateValue>, keyTimes: number[], values: string[], keySplines: Null<string[]>, delay: number, iteration: number, index: number, time: number, keyTimeMode: number, timelineMap: TimelineIndex, interpolatorMap: InterpolatorMap, transformOriginMap: Null<TransformOriginMap>): [number, AnimateValue] {
    if (delay < 0) {
        actualTime -= delay;
        delay = 0;
    }
    const duration = item.duration;
    const offset = actualTime - (delay + duration * iteration);
    const fraction = offset === 0 ? index === 0 ? 0 : 1 : clamp(offset / duration);
    let previousIndex = -1,
        nextIndex = -1;
    for (let l = 0, length = keyTimes.length; l < length; ++l) {
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
    time = setTimelineValue(timelineMap, time, value, false);
    insertInterpolator(item, time, keySplines, nextIndex, keyTimeMode, interpolatorMap, transformOriginMap);
    return [time, value];
}

function getIntermediateSplitValue(subTime: number, splitTime: number, item: SvgAnimate, keyTimes: number[], values: string[], duration: number, interval: number, baseValue?: AnimateValue) {
    const fraction = (subTime - splitTime) / duration;
    for (let i = 1, length = keyTimes.length; i < length; ++i) {
        const previousTime = keyTimes[i - 1];
        const time = keyTimes[i];
        if (fraction >= previousTime && fraction <= time) {
            return convertToString(
                getItemSplitValue(
                    fraction,
                    previousTime,
                    getItemValue(item, values, interval, i - 1, baseValue),
                    time,
                    getItemValue(item, values, interval, i, baseValue)
                )
            );
        }
    }
}

function appendPartialKeyTimes(map: SvgAnimationIntervalMap, forwardMap: ForwardMap, baseValueMap: ObjectMap<AnimateValue>, interval: number, item: SvgAnimate, keyTimes: number[], values: string[], keySplines: Null<string[]>, baseValue: Undef<AnimateValue>, queued: SvgAnimate[], evaluateStart: boolean): [number[], string[], string[]] {
    let length = values.length;
    keySplines ||= new Array(length - 1).fill('');
    const { delay, duration } = item;
    const startTime = delay + duration * interval;
    const itemEndTime = item.getTotalDuration();
    const intervalEndTime = startTime + (evaluateStart ? keyTimes[0] : 1) * duration;
    const finalValue = +values[evaluateStart ? 0 : length - 1];
    let maxTime = startTime;
    complete: {
        length = queued.length;
        for (let i = 0; i < length; ++i) {
            const sub = queued[i];
            if (sub !== item) {
                const totalDuration = sub.getTotalDuration();
                sub.addState(SYNCHRONIZE_STATE.INTERRUPTED);
                if (totalDuration > maxTime) {
                    const [subKeyTimes, subValues, subKeySplines] = cloneKeyTimes(sub);
                    setStartItemValues(map, forwardMap, baseValueMap, sub, baseValue, subKeyTimes, subValues, subKeySplines);
                    let nextStartTime = intervalEndTime;
                    partialEnd: {
                        let joined: Undef<boolean>,
                            j = getStartIteration(maxTime, sub.delay, sub.duration) - 1;
                        const insertSubstituteTimeValue = (subTime: number, splitTime: number, index: number) => {
                            let resultTime = evaluateStart
                                ? maxTime === startTime && !joined ? 0 : (subTime % duration) / duration
                                : splitTime === intervalEndTime ? 1 : (splitTime % duration) / duration;
                            let splitValue = subTime === splitTime
                                ? convertToString(getItemValue(sub, subValues, j, index, baseValue))
                                : getIntermediateSplitValue(subTime, splitTime, sub, subKeyTimes, subValues, sub.duration, j, baseValue);
                            if (splitValue) {
                                if (resultTime > 0) {
                                    splitValue = Math.round((+splitValue + finalValue) / 2).toString();
                                }
                                const q = keyTimes.length;
                                if (!(resultTime === keyTimes[q - 1] && splitValue === values[q - 1])) {
                                    const keySpline = joined || resultTime === 0 ? subKeySplines && subKeySplines[index] || sub.timingFunction : '';
                                    if (evaluateStart) {
                                        if (!joined && resultTime > 0 && subTime === maxTime) {
                                            resultTime += 1 / 1000;
                                        }
                                        for (let l = 0; l < q; ++l) {
                                            if (resultTime <= keyTimes[l]) {
                                                if (l === 0 || resultTime === 0) {
                                                    keyTimes.unshift(resultTime);
                                                    values.unshift(splitValue);
                                                    keySplines!.unshift(keySpline);
                                                }
                                                else {
                                                    keyTimes.splice(l, 0, resultTime);
                                                    values.splice(l, 0, splitValue);
                                                    keySplines!.splice(l, 0, keySpline);
                                                }
                                                break;
                                            }
                                        }
                                    }
                                    else {
                                        if ((splitTime === totalDuration || splitTime === intervalEndTime) && splitTime < itemEndTime) {
                                            resultTime -= 1 / 1000;
                                        }
                                        keyTimes.push(resultTime);
                                        values.push(splitValue);
                                        keySplines!.push(keySpline);
                                    }
                                }
                            }
                        };
                        do {
                            if (evaluateStart) {
                                for (let k = i + 1; k < length; ++k) {
                                    const next = queued[k];
                                    if (next.delay > maxTime) {
                                        nextStartTime = next.delay;
                                        break;
                                    }
                                }
                            }
                            for (let l = 0, q = subKeyTimes.length; l < q; ++l) {
                                const time = getItemTime(sub.delay, sub.duration, subKeyTimes, j, l);
                                if (time >= maxTime) {
                                    if (!joined) {
                                        insertSubstituteTimeValue(time, maxTime, l);
                                        joined = true;
                                    }
                                    if (time > maxTime) {
                                        if (evaluateStart && time >= intervalEndTime) {
                                            break complete;
                                        }
                                        insertSubstituteTimeValue(time, Math.min(time, totalDuration, intervalEndTime), l);
                                        if (time >= intervalEndTime) {
                                            break complete;
                                        }
                                        else {
                                            maxTime = time;
                                            if (time >= totalDuration) {
                                                if (totalDuration <= itemEndTime) {
                                                    sub.addState(SYNCHRONIZE_STATE.COMPLETE);
                                                }
                                                break partialEnd;
                                            }
                                            else if (time >= nextStartTime) {
                                                break partialEnd;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        while (++j);
                    }
                }
            }
        }
    }
    return [keyTimes, values, keySplines];
}

function setTimelineValue(map: TimelineIndex, time: number, value: Undef<AnimateValue>, duplicate: boolean) {
    if (hasValue<AnimateValue>(value)) {
        let stored = map.get(time),
            previousTime: Undef<boolean>;
        if (stored === undefined) {
            stored = map.get(time - 1);
            previousTime = true;
        }
        if (stored !== value || duplicate) {
            if (!duplicate) {
                if (typeof stored === 'number' && equal(value as number, stored)) {
                    return time;
                }
                while (time > 0 && map.has(time)) {
                    ++time;
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

function insertInterpolator(item: SvgAnimate, time: number, keySplines: Null<string[]>, index: number, keyTimeMode: number, map: InterpolatorMap, transformOriginMap: Null<TransformOriginMap>) {
    if (!isKeyTimeFormat(SvgBuild.isAnimateTransform(item), keyTimeMode)) {
        if (index === 0) {
            return;
        }
        --index;
    }
    const value = keySplines && keySplines[index];
    if (value) {
        map.set(time, value);
    }
    if (transformOriginMap) {
        setTransformOrigin(transformOriginMap, item as SvgAnimateTransform, time, index);
    }
}

function setStartItemValues(map: SvgAnimationIntervalMap, forwardMap: ForwardMap, baseValueMap: ObjectMap<AnimateValue>, item: SvgAnimate, baseValue: Undef<AnimateValue>, keyTimes: number[], values: string[], keySplines?: Null<string[]>) {
    if (keyTimes[0] !== 0) {
        let value: string;
        if (item.additiveSum) {
            value = convertToString(baseValue);
        }
        else {
            value = getForwardItem(forwardMap, item.attributeName)?.value.toString() || map.get(SvgAnimationIntervalMap.getKeyName(item), item.delay) || convertToString(baseValue);
        }
        if (item.by) {
            const n = +value;
            if (!isNaN(n)) {
                value = (n + item.by).toString();
            }
        }
        keyTimes.unshift(0);
        values.unshift(value);
        if (keySplines) {
            keySplines.unshift(item.timingFunction);
        }
    }
    if (lastItemOf(keyTimes)! < 1) {
        const value = map.get(SvgAnimationIntervalMap.getKeyName(item), item.delay) || convertToString(baseValueMap[item.attributeName]) || values[0];
        keyTimes.push(1);
        values.push(value);
        if (keySplines) {
            keySplines.unshift(item.timingFunction);
        }
    }
}

function setTransformOrigin(map: TransformOriginMap, item: SvgAnimateTransform, time: number, index: number) {
    if (SvgBuild.asAnimateTransform(item)) {
        const point = item.transformOrigin?.[index];
        if (point) {
            map.set(time, point);
        }
    }
}

function getForwardItem(forwardMap: ForwardMap, attr: string) {
    const map = forwardMap[attr];
    return map && lastItemOf(map);
}

function setSetterValue(baseMap: Map<number, AnimateValue>, item: SvgAnimation, transforming: boolean, time?: number, value?: AnimateValue) {
    if (time === undefined) {
        time = item.delay;
    }
    if (value === undefined) {
        value = item.to;
    }
    return setTimelineValue(baseMap, time, transforming ? value : convertToAnimateValue(value, false), false);
}

function sortSetterData(data: SvgAnimation[], item?: SvgAnimation) {
    if (item) {
        data.push(item);
    }
    data.sort((a, b) => a.delay === b.delay ? a.group.id - b.group.id : a.delay - b.delay);
    for (let i = 0; i < data.length - 1; ++i) {
        if (data[i].delay === data[i + 1].delay) {
            data.splice(i--, 1);
        }
    }
}

function queueIncomplete(incomplete: SvgAnimation[], item: SvgAnimate) {
    if (!item.hasState(SYNCHRONIZE_STATE.COMPLETE, SYNCHRONIZE_STATE.INVALID)) {
        const index = incomplete.indexOf(item);
        if (index !== -1) {
            incomplete.splice(index, 1);
        }
        incomplete.push(item);
        item.addState(SYNCHRONIZE_STATE.INTERRUPTED);
    }
}

function sortIncomplete(incomplete: SvgAnimation[], maxTime = Infinity) {
    incomplete.sort((a, b) => {
        const delayA = a.delay;
        const delayB = a.delay;
        if (maxTime !== Infinity) {
            if (maxTime === delayA && maxTime !== delayB) {
                return -1;
            }
            if (maxTime !== delayA && maxTime === delayB) {
                return 1;
            }
            if (delayA > maxTime && delayB < maxTime) {
                return 1;
            }
            if (delayA < maxTime && delayB > maxTime) {
                return -1;
            }
        }
        return delayA !== delayB ? delayB - delayA : b.group.id - a.group.id;
    });
}

function removeIncomplete(incomplete: SvgAnimation[], item?: SvgAnimate) {
    if (item) {
        if (item.iterationCount !== -1) {
            spliceArray(incomplete, previous => previous === item);
        }
    }
    else {
        spliceArray(incomplete, previous => !!previous.animationElement);
    }
}

function sortEvaluateStart(incomplete: SvgAnimate[], maxTime: number) {
    incomplete.sort((a, b) => {
        const durationA = a.getTotalDuration();
        if (durationA <= maxTime) {
            return 1;
        }
        const durationB = b.getTotalDuration();
        if (durationB <= maxTime) {
            return -1;
        }
        const delayA = a.delay;
        const delayB = b.delay;
        if (delayA === delayB) {
            return b.group.id - a.group.id;
        }
        if (delayA === maxTime) {
            return -1;
        }
        if (delayB === maxTime) {
            return 1;
        }
        if (delayA < maxTime && delayB < maxTime) {
            return delayB - delayA;
        }
        return delayA - delayB;
    });
}

function refitTransformPoints(data: TimelineValue, parent: Null<SvgContainer>) {
    const x = data.get('x') as number || 0;
    const y = data.get('y') as number || 0;
    return parent ? parent.refitX(x) + ' ' + parent.refitX(y) : x + ' ' + y;
}

function insertAnimate(animations: SvgAnimation[], item: SvgAnimate, repeating: boolean) {
    if (!repeating) {
        item.iterationCount = -1;
    }
    item.from = item.valueFrom;
    item.to = item.valueTo;
    animations.push(item);
}

function removeAnimations(animations: SvgAnimation[], values: SvgAnimation[]) {
    if (values.length) {
        spliceArray(animations, (item: SvgAnimation) => values.includes(item));
    }
}

const getItemTime = (delay: number, duration: number, keyTimes: number[], iteration: number, index: number) => Math.round(delay + (keyTimes[index] + iteration) * duration);
const convertToString = (value: Undef<AnimateValue>) => Array.isArray(value) ? value.map(pt => pt.x + ',' + pt.y).join(' ') : value !== undefined ? value.toString() : '';
const isKeyTimeFormat = (transforming: boolean, keyTimeMode: number) => ((transforming ? SYNCHRONIZE_MODE.KEYTIME_TRANSFORM : SYNCHRONIZE_MODE.KEYTIME_ANIMATE) & keyTimeMode) > 0;
const isFromToFormat = (transforming: boolean, keyTimeMode: number) => ((transforming ? SYNCHRONIZE_MODE.FROMTO_TRANSFORM : SYNCHRONIZE_MODE.FROMTO_ANIMATE) & keyTimeMode) > 0;
const playableAnimation = (item: SvgAnimate) => (item.playable || item.animationElement && item.duration !== -1) && !item.synchronized;
const cloneKeyTimes = (item: SvgAnimate): [number[], string[], Null<string[]>] => [item.keyTimes.slice(0), item.values.slice(0), item.keySplines?.slice(0) || null];
const getStartIteration = (time: number, delay: number, duration: number) => Math.floor(Math.max(0, time - delay) / duration);

export default <T extends Constructor<squared.svg.SvgView>>(Base: T) => {
    return class extends Base implements squared.svg.SvgSynchronize {
        public getAnimateShape(element: SVGGraphicsElement) {
            const result: SvgAnimate[] = [];
            const animations = this.animations as SvgAnimate[];
            for (let i = 0, length = animations.length; i < length; ++i) {
                const item = animations[i];
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
                        case 'width':
                        case 'height':
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
            const animations = this.animations as SvgAnimateTransform[];
            for (let i = 0, length = animations.length; i < length; ++i) {
                const item = animations[i];
                if (SvgBuild.isAnimateTransform(item) && !item.synchronized && item.duration > 0) {
                    result.push(item);
                    if (options && SvgBuild.asAnimateMotion(item)) {
                        const framesPerSecond = options.framesPerSecond;
                        if (framesPerSecond) {
                            item.framesPerSecond = framesPerSecond;
                        }
                    }
                }
            }
            return result;
        }

        public getAnimateViewRect(animations?: SvgAnimation[]) {
            animations ||= this.animations as SvgAnimation[];
            const result: SvgAnimate[] = [];
            for (let i = 0, length = animations.length; i < length; ++i) {
                const item = animations[i] as SvgAnimate;
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

        public animateSequentially(animations?: SvgAnimation[], transforms?: SvgAnimateTransform[], path?: Null<SvgPath>, options?: SvgSynchronizeOptions) {
            let keyTimeMode = SYNCHRONIZE_MODE.FROMTO_ANIMATE | SYNCHRONIZE_MODE.FROMTO_TRANSFORM,
                precision: Undef<number>;
            if (options) {
                if (options.keyTimeMode) {
                    keyTimeMode = options.keyTimeMode;
                }
                precision = options.precision;
            }
            const animationsBase = this.animations as SvgAnimation[];
            for (const mergeable of [animations, transforms]) {
                const transforming = mergeable === transforms;
                if (!mergeable || mergeable.length === 0 || !transforming && (keyTimeMode & SYNCHRONIZE_MODE.IGNORE_ANIMATE) || transforming && (keyTimeMode & SYNCHRONIZE_MODE.IGNORE_TRANSFORM)) {
                    continue;
                }
                const staggered: SvgAnimate[] = [];
                const setterAttributeMap: ObjectMap<SvgAnimation[]> = {};
                const groupActive = new Set<string>();
                let setterTotal = 0;
                const insertSetter = (item: SvgAnimation) => {
                    (setterAttributeMap[item.attributeName] ||= []).push(item);
                    ++setterTotal;
                };
                {
                    const excluded: SvgAnimate[] = [];
                    const length = mergeable.length;
                    for (let i = 0; i < length; ++i) {
                        const itemA = mergeable[i] as SvgAnimate;
                        if (itemA.setterType) {
                            insertSetter(itemA);
                        }
                        else {
                            const timeA = itemA.getTotalDuration();
                            for (let j = 0; j < length; ++j) {
                                const itemB = mergeable[j] as SvgAnimate;
                                if (i !== j && itemA.attributeName === itemB.attributeName && itemA.group.id < itemB.group.id && itemA.fillReplace && !itemB.evaluateEnd) {
                                    if (itemB.setterType) {
                                        if (itemA.delay === itemB.delay) {
                                            excluded[i] = itemA;
                                            break;
                                        }
                                    }
                                    else if (!itemB.evaluateStart) {
                                        if (itemA.delay === itemB.delay && (!itemB.fillReplace || itemB.iterationCount === -1 || timeA <= itemB.getTotalDuration()) ||
                                            itemB.fillBackwards && itemA.delay <= itemB.delay && (itemB.fillForwards || timeA <= itemB.delay) ||
                                            itemA.animationElement && !itemB.animationElement && (itemA.delay >= itemB.delay && timeA <= itemB.getTotalDuration() || itemB.fillForwards))
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
                    for (let i = 0; i < length; ++i) {
                        const item = mergeable[i] as SvgAnimate;
                        if (excluded[i]) {
                            if (item.fillReplace) {
                                removeable.push(item);
                            }
                            else {
                                item.setterType = true;
                                insertSetter(item);
                            }
                        }
                        else if (!item.setterType) {
                            staggered.push(item);
                            groupActive.add(item.group.name);
                        }
                    }
                    removeAnimations(animationsBase, removeable);
                }
                if (staggered.length + setterTotal > 1 || staggered.length === 1 && (staggered[0].alternate || !isNaN(staggered[0].end))) {
                    const groupName: ObjectMap<Map<number, SvgAnimate[]>> = {};
                    const groupAttributeMap: ObjectMap<SvgAnimate[]> = {};
                    const intervalMap = new SvgAnimationIntervalMap(mergeable);
                    const repeatingMap: TimelineMap = {};
                    const repeatingInterpolatorMap = new Map<number, string>();
                    const repeatingTransformOriginMap = transforming ? new Map<number, Point>() : null;
                    const repeatingMaxTime: ObjectMap<number> = {};
                    const repeatingAnimations = new Set<SvgAnimate>();
                    const infiniteMap: ObjectMap<SvgAnimate> = {};
                    const infiniteInterpolatorMap = new Map<number, string>();
                    const infiniteTransformOriginMap = transforming ? new Map<number, Point>() : null;
                    const baseValueMap: ObjectMap<AnimateValue> = {};
                    const forwardMap: ForwardMap = {};
                    const animateTimeRangeMap = new Map<number, number>();
                    let repeatingDuration = 0,
                        repeatingAsInfinite = -1,
                        repeatingResult: KeyTimeMap,
                        infiniteResult: Undef<KeyTimeMap>;
                    for (let i = 0, length = staggered.length; i < length; ++i) {
                        const item = staggered[i];
                        const ordering = item.group.ordering;
                        if (ordering) {
                            spliceArray(ordering, sibling => !groupActive.has(sibling.name));
                        }
                        const attr = item.attributeName;
                        let groupData = groupName[attr];
                        if (!groupData) {
                            groupData = new Map<number, SvgAnimate[]>();
                            groupName[attr] = groupData;
                            groupAttributeMap[attr] = [];
                        }
                        const delay = item.delay;
                        const group = groupData.get(delay) || [];
                        group.push(item);
                        groupAttributeMap[attr]!.push(item);
                        groupData.set(delay, group);
                    }
                    for (const attr in groupName) {
                        const groupDelay = new Map<number, SvgAnimate[]>();
                        const groupData = groupName[attr]!;
                        const timeData = sortNumber(Array.from(groupData.keys()));
                        for (let i = 0, length = timeData.length; i < length; ++i) {
                            const delay = timeData[i];
                            const group = groupData.get(delay)!;
                            for (let j = 0, q = group.length; j < q; ++j) {
                                repeatingDuration = Math.max(repeatingDuration, group[j].getTotalDuration(true));
                            }
                            groupDelay.set(delay, group.reverse());
                        }
                        groupName[attr] = groupDelay;
                        groupAttributeMap[attr]!.reverse();
                    }
                    for (const attr in groupName) {
                        const baseMap = new Map<number, AnimateValue>();
                        repeatingMap[attr] = baseMap;
                        if (!transforming) {
                            let value: Undef<AnimateValue>;
                            if (path) {
                                value = path.getBaseValue(attr);
                            }
                            else {
                                value = this[attr];
                                if (value === undefined && 'getBaseValue' in this) {
                                    value = ((this as unknown) as squared.svg.SvgBaseVal).getBaseValue(attr);
                                }
                            }
                            if (hasValue<AnimateValue>(value)) {
                                baseValueMap[attr] = value;
                            }
                        }
                        const setterData = setterAttributeMap[attr] || [];
                        const groupDelay: number[] = [];
                        const groupData: SvgAnimate[][] = [];
                        let incomplete: SvgAnimate[] = [];
                        for (const [delay, data] of groupName[attr]!) {
                            groupDelay.push(delay);
                            groupData.push(data);
                        }
                        let maxTime = -1,
                            actualMaxTime = 0,
                            nextDelayTime = Infinity,
                            baseValue: Undef<AnimateValue>,
                            previousTransform: Null<SvgAnimate> = null,
                            previousComplete: Undef<SvgAnimate>;
                        const checkComplete = (item: SvgAnimate, nextDelay?: number) => {
                            repeatingAnimations.add(item);
                            item.addState(SYNCHRONIZE_STATE.COMPLETE);
                            previousComplete = item;
                            if (item.fillForwards) {
                                setFreezeValue(actualMaxTime, baseValue, item.type, item);
                                const { name, ordering } = item.group;
                                if (ordering) {
                                    const duration = item.getTotalDuration();
                                    for (let i = 0, length = ordering.length; i < length; ++i) {
                                        const previous = ordering[i];
                                        if (previous.name === name) {
                                            return true;
                                        }
                                        if (SvgAnimationIntervalMap.getGroupEndTime(previous) >= duration) {
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
                                        currentMaxTime = setTimelineValue(baseMap, currentMaxTime, replaceValue, false);
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
                        };
                        const checkSetterDelay = (delayTime: number, endTime: number): Undef<AnimateValue> => {
                            let replaceValue: Undef<AnimateValue> = getForwardItem(forwardMap, attr)?.value;
                            spliceArray(
                                setterData,
                                set => set.delay >= delayTime && set.delay < endTime,
                                (set: SvgAnimate) => {
                                    const to = set.to;
                                    if (set.animationElement) {
                                        removeIncomplete(incomplete);
                                    }
                                    if (incomplete.length === 0) {
                                        baseValue = to;
                                    }
                                    setFreezeValue(set.delay, to, set.type, set);
                                    if (set.delay === delayTime) {
                                        replaceValue = transforming ? to : convertToAnimateValue(to, false);
                                    }
                                    else {
                                        maxTime = setSetterValue(baseMap, set, transforming);
                                        actualMaxTime = set.delay;
                                    }
                                }
                            );
                            return replaceValue;
                        };
                        const checkIncomplete = (delayIndex?: number, itemIndex?: number) => {
                            if (incomplete.length) {
                                spliceArray(
                                    incomplete,
                                    previous => previous.getTotalDuration() <= actualMaxTime,
                                    previous => {
                                        previous.addState(SYNCHRONIZE_STATE.COMPLETE);
                                        if (previous.fillForwards) {
                                            setFreezeValue(previous.getTotalDuration(), previous.valueTo, previous.type, previous);
                                            if (delayIndex !== undefined && itemIndex !== undefined) {
                                                for (let i = delayIndex, length = groupDelay.length; i < length; ++i) {
                                                    if (i !== delayIndex) {
                                                        itemIndex = -1;
                                                    }
                                                    const data = groupData[i];
                                                    for (let j = itemIndex + 1, q = data.length; j < q; ++j) {
                                                        const next = data[j];
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
                        };
                        const setFreezeValue = (time: number, value: Undef<AnimateValue>, type = 0, item?: SvgAnimation) => {
                            if (hasValue<AnimateValue>(value)) {
                                if (!transforming) {
                                    value = convertToAnimateValue(value, false);
                                }
                                const forwardItem = getForwardItem(forwardMap, attr);
                                if (!forwardItem || time >= forwardItem.time) {
                                    (forwardMap[attr] ||= []).push({ key: type, value, time });
                                }
                            }
                            if (item && SvgBuild.isAnimate(item) && !item.fillReplace) {
                                if (item.fillForwards) {
                                    spliceArray(setterData, set => set.group.id < item.group.id || set.delay < time);
                                    incomplete = [];
                                    for (let i = 0, length = groupData.length; i < length; ++i) {
                                        const group = groupData[i];
                                        for (let j = 0, q = group.length; j < q; ++j) {
                                            const next = group[j];
                                            if (next.group.id < item.group.id) {
                                                next.addState(SYNCHRONIZE_STATE.COMPLETE);
                                            }
                                        }
                                    }
                                }
                                else if (item.fillFreeze) {
                                    removeIncomplete(incomplete);
                                }
                            }
                        };
                        const resetTransform = (additiveSum: boolean, resetTime: number, value?: string) => {
                            if (previousTransform && !additiveSum) {
                                if (value === undefined) {
                                    value = TRANSFORM.typeAsValue(previousTransform.type);
                                }
                                maxTime = setTimelineValue(baseMap, resetTime, value, false);
                                if (resetTime !== maxTime) {
                                    setTimeRange(animateTimeRangeMap, previousTransform.type, maxTime);
                                }
                            }
                            previousTransform = null;
                        };
                        const backwards = groupAttributeMap[attr]!.find(item => item.fillBackwards);
                        if (backwards) {
                            baseValue = getItemValue(backwards, backwards.values, 0, 0);
                            maxTime = setTimelineValue(baseMap, 0, baseValue, false);
                            if (transforming) {
                                setTimeRange(animateTimeRangeMap, backwards.type, 0);
                                previousTransform = backwards;
                            }
                            let playing = true;
                            for (const item of groupAttributeMap[attr]!) {
                                if (item.group.id > backwards.group.id && item.delay <= backwards.delay) {
                                    playing = false;
                                    break;
                                }
                            }
                            const totalDuration = backwards.getTotalDuration();
                            const removeable: SvgAnimate[] = [];
                            for (let i = 0; i < groupDelay.length; ++i) {
                                const data = groupData[i];
                                for (let j = 0; j < data.length; ++j) {
                                    const item = data[j];
                                    if (playing) {
                                        if (item === backwards && (i !== 0 || j !== 0)) {
                                            data.splice(j--, 1);
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
                                        data.splice(j--, 1);
                                        queueIncomplete(incomplete, item);
                                    }
                                }
                            }
                            for (let i = 0; i < groupDelay.length; ++i) {
                                const data = groupData[i];
                                if (removeable.length) {
                                    for (let j = 0; j < data.length; ++j) {
                                        if (removeable.includes(data[j])) {
                                            data.splice(j--, 1);
                                        }
                                    }
                                }
                                if (data.length === 0) {
                                    groupData.splice(i, 1);
                                    groupDelay.splice(i--, 1);
                                }
                            }
                            backwards.addState(SYNCHRONIZE_STATE.BACKWARDS);
                        }
                        if (!transforming) {
                            const value = baseValueMap[attr];
                            if (hasValue(value) && !forwardMap[attr]) {
                                setFreezeValue(0, value, 0);
                            }
                            baseValue ??= getForwardItem(forwardMap, attr)?.value || value;
                        }
                        sortSetterData(setterData);
                        {
                            let previous: Undef<SvgAnimation>;
                            spliceArray(
                                setterData,
                                set => set.delay <= groupDelay[0],
                                set => {
                                    const fillForwards = SvgBuild.isAnimate(set) && set.fillForwards;
                                    const delay = set.delay;
                                    if (delay < groupDelay[0] && (!backwards || fillForwards)) {
                                        if (backwards && fillForwards) {
                                            setFreezeValue(delay, set.to, (set as SvgAnimate).type);
                                        }
                                        else {
                                            const previousTime = delay - 1;
                                            if (!previous) {
                                                if (!baseMap.has(0)) {
                                                    const value: Undef<AnimateValue> = transforming && SvgBuild.isAnimateTransform(set) ? TRANSFORM.typeAsValue(set.type) : baseValueMap[attr];
                                                    if (value !== undefined) {
                                                        setSetterValue(baseMap, set, transforming, 0, value);
                                                        setSetterValue(baseMap, set, transforming, previousTime, value);
                                                    }
                                                }
                                                else if (!transforming) {
                                                    setSetterValue(baseMap, set, transforming, previousTime, baseValue);
                                                }
                                            }
                                            else {
                                                setSetterValue(baseMap, previous, transforming, previousTime);
                                            }
                                            maxTime = setSetterValue(baseMap, set, transforming);
                                            actualMaxTime = delay;
                                            previous = set;
                                        }
                                    }
                                }
                            );
                            if (previous) {
                                setSetterValue(baseMap, previous, transforming, groupDelay[0] - 1);
                            }
                        }
                        attributeEnd: {
                            for (let i = 0, length = groupDelay.length; i < length; ++i) {
                                let data = groupData[i],
                                    delay = groupDelay[i];
                                for (let j = 0; j < data.length; ++j) {
                                    const item = data[j];
                                    if (item.hasState(SYNCHRONIZE_STATE.COMPLETE, SYNCHRONIZE_STATE.INVALID) || item.hasState(SYNCHRONIZE_STATE.INTERRUPTED) && item.animationElement) {
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
                                                queueIncomplete(incomplete, item);
                                            }
                                            continue;
                                        }
                                    }
                                    else {
                                        totalDuration = delay + duration;
                                    }
                                    let iterationTotal: number,
                                        iterationFraction: number;
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
                                        maxTime = setTimelineValue(baseMap, delay - 1, baseValue, false);
                                        actualMaxTime = delay;
                                    }
                                    nextDelayTime = Infinity;
                                    const ordering = item.group.ordering;
                                    if (ordering && ordering.length > 1) {
                                        let checkDelay = true;
                                        for (let k = 0, q = ordering.length; k < q; ++k) {
                                            const order = ordering[k];
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
                                                for (let k = i + 1; k < length; ++k) {
                                                    const dataA = groupData[k];
                                                    for (let l = 0, q = dataA.length; l < q; ++l) {
                                                        const next = dataA[l];
                                                        if (next.group.ordering) {
                                                            nextDelayTime = next.delay;
                                                            break nextDelay;
                                                        }
                                                        else if (next.getTotalDuration() <= totalDuration) {
                                                            if (next.fillFreeze) {
                                                                sortSetterData(setterData, next);
                                                            }
                                                            next.addState(SYNCHRONIZE_STATE.COMPLETE);
                                                        }
                                                        else if (next.delay < totalDuration) {
                                                            queueIncomplete(incomplete, next);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        for (let k = i + 1; k < length; ++k) {
                                            const value = groupDelay[k];
                                            if (value !== Infinity) {
                                                const dataA = groupData[k];
                                                if (dataA.length && !dataA.every(next => next.hasState(SYNCHRONIZE_STATE.COMPLETE, SYNCHRONIZE_STATE.INVALID))) {
                                                    nextDelayTime = value;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    const actualStartTime = actualMaxTime;
                                    let startTime = maxTime + 1,
                                        maxThreadTime = Math.min(nextDelayTime, item.end || Infinity),
                                        setterInterrupt: Undef<SvgAnimation>;
                                    if (item.animationElement && setterData.length) {
                                        const interruptTime = Math.min(nextDelayTime, totalDuration, maxThreadTime);
                                        if (setterInterrupt = setterData.find(set => set.delay >= actualMaxTime && set.delay <= interruptTime)) {
                                            switch (setterInterrupt.delay) {
                                                case actualMaxTime:
                                                    baseValue = setterInterrupt.to;
                                                    setFreezeValue(actualMaxTime, baseValue, (setterInterrupt as SvgAnimate).type, setterInterrupt);
                                                    if (setterInterrupt.group.id > item.group.id) {
                                                        if (transforming && previousTransform) {
                                                            resetTransform(item.additiveSum, Math.max(delay - 1, maxTime));
                                                        }
                                                        maxTime = setSetterValue(baseMap, setterInterrupt, transforming, Math.max(setterInterrupt.delay, maxTime), baseValue);
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
                                            spliceArray(setterData, set => set !== setterInterrupt);
                                            item.addState(SYNCHRONIZE_STATE.INTERRUPTED);
                                        }
                                    }
                                    let complete: Undef<boolean>,
                                        lastValue: Undef<AnimateValue>;
                                    if (maxThreadTime > maxTime) {
                                        if (transforming) {
                                            if (previousTransform) {
                                                resetTransform(item.additiveSum, Math.max(delay - 1, maxTime));
                                                startTime = maxTime + 1;
                                            }
                                            baseValue = TRANSFORM.typeAsValue(item.type);
                                            setFreezeValue(actualMaxTime, baseValue, item.type);
                                        }
                                        let parallel = delay === Infinity || (maxTime !== -1 || item.hasState(SYNCHRONIZE_STATE.BACKWARDS)) && !(i === 0 && j === 0) || item.hasState(SYNCHRONIZE_STATE.RESUME);
                                        complete = true;
                                        threadTimeExceeded: {
                                            const forwardItem = getForwardItem(forwardMap, attr);
                                            for (let k = getStartIteration(actualMaxTime, delay, duration); k < iterationTotal; ++k) {
                                                let keyTimes: number[],
                                                    values: string[],
                                                    keySplines: Null<string[]>;
                                                if (item.evaluateStart || item.evaluateEnd) {
                                                    [keyTimes, values, keySplines] = cloneKeyTimes(item);
                                                    const r = data.length;
                                                    if (item.evaluateStart) {
                                                        const pending = incomplete.concat(data.slice(j + 1, r)).filter(previous => previous.animationElement && previous.delay < maxThreadTime);
                                                        const s = pending.length;
                                                        if (s) {
                                                            sortEvaluateStart(pending, actualMaxTime);
                                                            [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, forwardMap, baseValueMap, k, item, keyTimes, values, keySplines, baseValue, pending, true);
                                                            for (let l = 0; l < s; ++l) {
                                                                const previous = pending[l];
                                                                if (previous.hasState(SYNCHRONIZE_STATE.INTERRUPTED) && data.includes(previous)) {
                                                                    queueIncomplete(incomplete, previous);
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (item.evaluateEnd) {
                                                        if (item.getIntervalEndTime(actualMaxTime) < maxThreadTime && (incomplete.length || j < r - 1)) {
                                                            const pending = incomplete.filter(previous => previous.animationElement);
                                                            for (let l = j + 1; l < r; ++l) {
                                                                const previous = data[l];
                                                                if (previous.animationElement) {
                                                                    if (!pending.includes(previous)) {
                                                                        pending.push(previous);
                                                                    }
                                                                    queueIncomplete(incomplete, previous);
                                                                }
                                                            }
                                                            if (pending.length) {
                                                                sortIncomplete(pending, actualMaxTime);
                                                                [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, forwardMap, baseValueMap, k, item, keyTimes, values, keySplines, baseValue, pending, false);
                                                            }
                                                        }
                                                    }
                                                    setStartItemValues(intervalMap, forwardMap, baseValueMap, item, baseValue, keyTimes, values, keySplines);
                                                }
                                                else {
                                                    ({ keyTimes, values, keySplines} = item);
                                                }
                                                for (let l = 0, q = keyTimes.length; l < q; ++l) {
                                                    const keyTime = keyTimes[l];
                                                    let time = -1,
                                                        value = getItemValue(item, values, k, l, baseValue);
                                                    if (k === iterationTotal - 1 && iterationFraction > 0) {
                                                        if (iterationFraction === keyTime) {
                                                            iterationFraction = -1;
                                                        }
                                                        else if (l === q - 1) {
                                                            time = totalDuration;
                                                            actualMaxTime = time;
                                                            value = getItemSplitValue(iterationFraction, keyTimes[l - 1], getItemValue(item, values, k, l - 1, baseValue), keyTime, value);
                                                            iterationFraction = -1;
                                                        }
                                                        else if (iterationFraction > keyTime) {
                                                            for (let m = l + 1; m < q; ++m) {
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
                                                            complete = k === iterationTotal - 1 && l === q - 1;
                                                            actualMaxTime = time;
                                                        }
                                                        else {
                                                            const insertIntermediateValue = (splitTime: number) => [maxTime, lastValue] = insertSplitValue(item, actualMaxTime, baseValue, keyTimes, values, keySplines, delay, k, l, splitTime, keyTimeMode, baseMap, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                            if (delay < 0 && maxTime === -1) {
                                                                if (time > 0) {
                                                                    actualMaxTime = 0;
                                                                    insertIntermediateValue(0);
                                                                }
                                                            }
                                                            else if (time > maxThreadTime) {
                                                                if (parallel && maxTime + 1 < maxThreadTime) {
                                                                    insertIntermediateValue(maxTime);
                                                                }
                                                                actualMaxTime = maxThreadTime;
                                                                insertIntermediateValue(maxThreadTime + (maxThreadTime === nextDelayTime && !baseMap.has(maxThreadTime - 1) ? -1 : 0));
                                                                complete = false;
                                                                break threadTimeExceeded;
                                                            }
                                                            else if (parallel) {
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
                                                    if (time > maxTime) {
                                                        if (l === length - 1 && !item.accumulateSum && (k < iterationTotal - 1 || item.fillReplace && (!forwardItem || value !== forwardItem.value))) {
                                                            --time;
                                                        }
                                                        maxTime = setTimelineValue(baseMap, time, value, false);
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
                                            maxTime = setSetterValue(baseMap, setterInterrupt, transforming, setterInterrupt.delay, lastValue);
                                            actualMaxTime = setterInterrupt.delay;
                                            setFreezeValue(actualMaxTime, lastValue, (setterInterrupt as SvgAnimate).type, setterInterrupt);
                                        }
                                        else if (item.hasState(SYNCHRONIZE_STATE.INVALID)) {
                                            setTimeRange(animateTimeRangeMap, maxTime, (setterInterrupt as SvgAnimate).type);
                                        }
                                        removeIncomplete(incomplete);
                                        complete = true;
                                    }
                                    spliceArray(
                                        setterData,
                                        set => set.delay >= actualStartTime && set.delay <= actualMaxTime,
                                        (set: SvgAnimate) => {
                                            setFreezeValue(set.delay, set.to, set.type, set);
                                            if (set.animationElement) {
                                                removeIncomplete(incomplete);
                                            }
                                        }
                                    );
                                    if (infinite) {
                                        if (complete) {
                                            if (!setterInterrupt) {
                                                infiniteMap[attr] = item;
                                                break attributeEnd;
                                            }
                                        }
                                        else {
                                            incomplete = [item];
                                            continue;
                                        }
                                    }
                                    if (complete) {
                                        if (!infinite && checkComplete(item, nextDelayTime)) {
                                            break attributeEnd;
                                        }
                                        for (let k = i; k < length; ++k) {
                                            if (groupDelay[k] < actualMaxTime) {
                                                const dataA = groupData[k];
                                                for (let l = 0, q = dataA.length; l < q; ++l) {
                                                    const next = dataA[l];
                                                    const nextDuration = next.getTotalDuration();
                                                    if (nextDuration > actualMaxTime && !next.hasState(SYNCHRONIZE_STATE.INTERRUPTED, SYNCHRONIZE_STATE.COMPLETE, SYNCHRONIZE_STATE.INVALID)) {
                                                        queueIncomplete(incomplete, next);
                                                    }
                                                    else if (!next.fillReplace) {
                                                        setFreezeValue(nextDuration, next.valueTo, next.type, next);
                                                    }
                                                }
                                                groupDelay[k] = Infinity;
                                                dataA.length = 0;
                                            }
                                        }
                                        if (incomplete.length && actualMaxTime < nextDelayTime) {
                                            sortIncomplete(incomplete);
                                            const resume = incomplete.find(next => next.delay <= actualMaxTime);
                                            if (resume) {
                                                resume.removeState(SYNCHRONIZE_STATE.INTERRUPTED, SYNCHRONIZE_STATE.BACKWARDS);
                                                resume.addState(SYNCHRONIZE_STATE.RESUME);
                                                removeIncomplete(incomplete, resume);
                                                delay = resume.delay;
                                                data = [resume];
                                                j = -1;
                                            }
                                        }
                                    }
                                    else {
                                        queueIncomplete(incomplete, item);
                                    }
                                }
                            }
                            if (incomplete.length) {
                                sortIncomplete(incomplete);
                                while (incomplete.length) {
                                    const item = incomplete.shift() as SvgAnimate;
                                    const { delay, duration } = item;
                                    const durationTotal = maxTime - delay;
                                    let maxThreadTime = Infinity;
                                    const insertKeyTimes = () => {
                                        let [keyTimes, values, keySplines] = cloneKeyTimes(item);
                                        const interval = getStartIteration(actualMaxTime, delay, duration);
                                        if (incomplete.length) {
                                            if (item.evaluateStart) {
                                                const pending = incomplete.slice(0);
                                                sortEvaluateStart(pending, actualMaxTime);
                                                [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, forwardMap, baseValueMap, interval, item, keyTimes, values, keySplines, baseValue, pending, true);
                                            }
                                            if (item.evaluateEnd && item.getIntervalEndTime(actualMaxTime) < maxThreadTime) {
                                                [keyTimes, values, keySplines] = appendPartialKeyTimes(intervalMap, forwardMap, baseValueMap, interval, item, keyTimes, values, keySplines, baseValue, incomplete, false);
                                            }
                                        }
                                        setStartItemValues(intervalMap, forwardMap, baseValueMap, item, baseValue, keyTimes, values, keySplines);
                                        const startTime = maxTime + 1;
                                        let joined = false,
                                            j = Math.floor(durationTotal / duration);
                                        const insertIntermediateValue = (index: number, time: number) => insertSplitValue(item, actualMaxTime, baseValue, keyTimes, values, keySplines, delay, j, index, time, keyTimeMode, repeatingMap[attr]!, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                        do {
                                            for (let k = 0, q = keyTimes.length; k < q; ++k) {
                                                let time = getItemTime(delay, duration, keyTimes, j, k);
                                                if (!joined && time >= maxTime) {
                                                    [maxTime, baseValue] = insertIntermediateValue(k, maxTime);
                                                    joined = true;
                                                }
                                                if (joined) {
                                                    if (time >= maxThreadTime) {
                                                        if (maxThreadTime > maxTime) {
                                                            const fillReplace = item.fillReplace || item.iterationCount === -1;
                                                            [maxTime, baseValue] = insertIntermediateValue(k, maxThreadTime - (fillReplace ? 1 : 0));
                                                            if (fillReplace) {
                                                                baseValue = getItemValue(item, values, j, 0, baseValue);
                                                                maxTime = setTimelineValue(baseMap, maxThreadTime, baseValue, false);
                                                            }
                                                            actualMaxTime = maxThreadTime;
                                                        }
                                                    }
                                                    else if (time > maxTime) {
                                                        actualMaxTime = time;
                                                        if (k === q - 1 && time < maxThreadTime) {
                                                            --time;
                                                        }
                                                        baseValue = getItemValue(item, values, j, k, baseValue);
                                                        maxTime = setTimelineValue(baseMap, time, baseValue, false);
                                                        insertInterpolator(item, maxTime, keySplines, k, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                    }
                                                }
                                            }
                                        }
                                        while (maxTime < maxThreadTime && ++j);
                                        if (transforming) {
                                            setTimeRange(animateTimeRangeMap, item.type, startTime, maxTime);
                                        }
                                    };
                                    if (item.iterationCount === -1) {
                                        if (durationTotal > 0 && durationTotal % item.duration !== 0) {
                                            maxThreadTime = delay + item.duration * Math.ceil(durationTotal / duration);
                                            insertKeyTimes();
                                        }
                                        infiniteMap[attr] = item;
                                        break attributeEnd;
                                    }
                                    else {
                                        maxThreadTime = Math.min(delay + item.duration * item.iterationCount, item.end || Infinity);
                                        if (maxThreadTime > maxTime) {
                                            insertKeyTimes();
                                            if (checkComplete(item)) {
                                                break attributeEnd;
                                            }
                                        }
                                    }
                                }
                            }
                            if (previousComplete && previousComplete.fillReplace && !(attr in infiniteMap)) {
                                let key = 0,
                                    value: Undef<AnimateValue>;
                                if (forwardMap[attr]) {
                                    const item = getForwardItem(forwardMap, attr);
                                    if (item) {
                                        ({ key, value } = item);
                                    }
                                }
                                else if (transforming) {
                                    key = Array.from(animateTimeRangeMap.values()).pop() as number;
                                    value = TRANSFORM.typeAsValue(key);
                                }
                                else {
                                    value = baseValueMap[attr];
                                }
                                if (value !== undefined && !isEqual(baseMap.get(maxTime) as AnimateValue, value)) {
                                    maxTime = setTimelineValue(baseMap, maxTime, value, false);
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
                            for (const time of repeatingMap[attr]!.keys()) {
                                keyTimesRepeating.add(time);
                                maxTime = time;
                            }
                            repeatingEndTime = Math.max(repeatingEndTime, maxTime);
                            forwardMap[attr]?.sort((a, b) => a.time - b.time);
                        }
                        if (hasKeys(infiniteMap)) {
                            const delay: number[] = [];
                            const duration: number[] = [];
                            for (const attr in infiniteMap) {
                                const item = infiniteMap[attr]!;
                                delay.push(item.delay);
                                duration.push(item.duration);
                            }
                            const start = delay[0];
                            if (repeatingAnimations.size === 0 && new Set(delay).size === 1 && new Set(duration).size === 1 && start === keyTimesRepeating.values().next().value) {
                                repeatingAsInfinite = start;
                            }
                            else if (duration.length > 1 && duration.every(value => value % 250 === 0)) {
                                repeatingEndTime = multipleOf(duration, repeatingEndTime, delay);
                            }
                            else {
                                const end = duration[0];
                                if ((repeatingEndTime - start) % end !== 0) {
                                    repeatingEndTime = end * Math.ceil(repeatingEndTime / end);
                                }
                            }
                        }
                        if (repeatingAsInfinite === -1) {
                            for (const attr in repeatingMap) {
                                const item = infiniteMap[attr];
                                if (item) {
                                    let maxTime = repeatingMaxTime[attr]!;
                                    if (maxTime < repeatingEndTime) {
                                        const baseMap = repeatingMap[attr]!;
                                        const delay = item.delay;
                                        const startTime = maxTime + 1;
                                        let baseValue = Array.from(baseMap.values()).pop() as AnimateValue;
                                        const [keyTimesBase, values, keySplines] = cloneKeyTimes(item);
                                        setStartItemValues(intervalMap, forwardMap, baseValueMap, item, baseValue, keyTimesBase, values, keySplines);
                                        const length = keyTimesBase.length;
                                        let i = Math.floor((maxTime - delay) / item.duration);
                                        do {
                                            let joined: Undef<boolean>;
                                            for (let j = 0; j < length; ++j) {
                                                let time = getItemTime(delay, item.duration, keyTimesBase, i, j);
                                                if (!joined && time >= maxTime) {
                                                    [maxTime, baseValue] = insertSplitValue(item, maxTime, baseValue, keyTimesBase, values, keySplines, delay, i, j, maxTime, keyTimeMode, baseMap, repeatingInterpolatorMap, repeatingTransformOriginMap);
                                                    keyTimesRepeating.add(maxTime);
                                                    joined = true;
                                                }
                                                if (joined && time > maxTime) {
                                                    if (j === length - 1 && time < repeatingEndTime) {
                                                        --time;
                                                    }
                                                    baseValue = getItemValue(item, values, i, j, baseValue);
                                                    maxTime = setTimelineValue(baseMap, time, baseValue, false);
                                                    insertInterpolator(item, time, keySplines, j, keyTimeMode, repeatingInterpolatorMap, repeatingTransformOriginMap);
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
                        const keyTimes = sortNumber(Array.from(keyTimesRepeating));
                        if (path || transforming) {
                            let modified: Undef<boolean>;
                            for (const attr in repeatingMap) {
                                const baseMap = repeatingMap[attr]!;
                                if (!baseMap.has(0)) {
                                    const valueMap = baseValueMap[attr];
                                    if (valueMap !== undefined) {
                                        const endTime = baseMap.keys().next().value - 1;
                                        baseMap.set(0, valueMap);
                                        baseMap.set(endTime, valueMap);
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
                            }
                            if (modified) {
                                sortNumber(keyTimes);
                            }
                        }
                        if (!transforming) {
                            for (const attr in repeatingMap) {
                                const baseMap = repeatingMap[attr]!;
                                const startTime: number = baseMap.keys().next().value;
                                const startValue: AnimateValue = baseMap.values().next().value;
                                for (let i = 0, length = keyTimes.length; i < length; ++i) {
                                    const keyTime = keyTimes[i];
                                    if (keyTime <= repeatingMaxTime[attr]!) {
                                        if (!baseMap.has(keyTime)) {
                                            if (intervalMap.paused(attr, keyTime)) {
                                                if (keyTime < startTime) {
                                                    baseMap.set(keyTime, startValue);
                                                }
                                                else {
                                                    let value = intervalMap.get(attr, keyTime) as Undef<AnimateValue>;
                                                    if (value !== undefined) {
                                                        value = convertToAnimateValue(value, true);
                                                        if (value !== '') {
                                                            baseMap.set(keyTime, value);
                                                            continue;
                                                        }
                                                    }
                                                }
                                            }
                                            insertAdjacentSplitValue(baseMap, attr, keyTime, intervalMap, transforming);
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
                    if (repeatingAsInfinite === -1 && hasKeys(infiniteMap)) {
                        const timelineMap: TimelineMap = {};
                        const infiniteAnimations: SvgAnimate[] = [];
                        const keyTimes: number[] = [];
                        const duration: number[] = [];
                        for (const attr in infiniteMap) {
                            const map = infiniteMap[attr]!;
                            duration.push(map.duration);
                            infiniteAnimations.push(map);
                        }
                        const maxDuration = multipleOf(duration);
                        for (let i = 0, length = infiniteAnimations.length; i < length; ++i) {
                            const item = infiniteAnimations[i];
                            const attr = item.attributeName;
                            timelineMap[attr] = new Map<number, AnimateValue>();
                            let baseValue = repeatingMap[attr]!.get(repeatingMaxTime[attr]!) ?? baseValueMap[attr];
                            const [keyTimesBase, values, keySplines] = cloneKeyTimes(item);
                            setStartItemValues(intervalMap, forwardMap, baseValueMap, item, baseValue, keyTimesBase, values, keySplines);
                            const q = keyTimesBase.length;
                            let maxTime = 0,
                                j = 0;
                            do {
                                for (let k = 0; k < q; ++k) {
                                    let time = getItemTime(0, item.duration, keyTimesBase, j, k);
                                    if (k === keyTimesBase.length - 1 && time < maxDuration) {
                                        --time;
                                    }
                                    baseValue = getItemValue(item, values, j, k, baseValue);
                                    maxTime = setTimelineValue(timelineMap[attr]!, time, baseValue, false);
                                    insertInterpolator(item, maxTime, keySplines, k, keyTimeMode, infiniteInterpolatorMap, infiniteTransformOriginMap);
                                    if (!keyTimes.includes(maxTime)) {
                                        keyTimes.push(maxTime);
                                    }
                                }
                                ++j;
                            }
                            while (maxTime < maxDuration);
                        }
                        if (infiniteAnimations.every(item => item.alternate)) {
                            let maxTime = -1;
                            for (const attr in infiniteMap) {
                                const map = timelineMap[attr]!;
                                const times = Array.from(map.keys());
                                const values = Array.from(map.values()).reverse();
                                for (let i = 0, length = times.length; i < length; ++i) {
                                    const value = times[i];
                                    if (value !== 0) {
                                        maxTime = maxDuration + value;
                                        const interpolator = infiniteInterpolatorMap.get(value);
                                        if (interpolator) {
                                            infiniteInterpolatorMap.set(maxTime, interpolator);
                                        }
                                        maxTime = setTimelineValue(map, maxTime, values[i], false);
                                        if (!keyTimes.includes(maxTime)) {
                                            keyTimes.push(maxTime);
                                        }
                                    }
                                }
                            }
                        }
                        sortNumber(keyTimes);
                        for (const attr in timelineMap) {
                            const map = timelineMap[attr]!;
                            for (let i = 0, length = keyTimes.length; i < length; ++i) {
                                const time = keyTimes[i];
                                if (!map.has(time)) {
                                    insertAdjacentSplitValue(map, attr, time, intervalMap, transforming);
                                }
                            }
                        }
                        infiniteResult = createKeyTimeMap(timelineMap, keyTimes, forwardMap);
                    }
                    removeAnimations(animationsBase, staggered);
                    const timeRange = Array.from(animateTimeRangeMap);
                    const synchronizedName = joinArray(staggered, item => SvgBuild.isAnimateTransform(item) ? TRANSFORM.typeAsName(item.type) : item.attributeName, '-');
                    const parent = this.parent;
                    for (const result of [repeatingResult, infiniteResult]) {
                        if (result) {
                            const repeating = result === repeatingResult;
                            const interpolatorMap = repeating ? repeatingInterpolatorMap : infiniteInterpolatorMap;
                            const transformOriginMap = (repeating ? repeatingTransformOriginMap : infiniteTransformOriginMap) as TransformOriginMap;
                            if (isKeyTimeFormat(transforming, keyTimeMode)) {
                                const keySplines: string[] = [];
                                if (transforming) {
                                    const transformMap: KeyTimeMap[] = [];
                                    if (repeating) {
                                        const entries = Array.from(result);
                                        let type = timeRange[0][1];
                                        for (let i = 0, j = 0, k = 0, length = timeRange.length; i < length; ++i) {
                                            const next = i < length - 1 ? timeRange[i + 1][1] : -1;
                                            if (type !== next) {
                                                const map = new Map<number, Map<number, AnimateValue>>();
                                                for (let l = k, q = entries.length; l < q; ++l) {
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
                                    else if (infiniteMap.transform) {
                                        const map = new Map<number, Map<number, AnimateValue>>();
                                        for (const [time, item] of result) {
                                            map.set(time, new Map([[infiniteMap.transform.type, item.values().next().value as string]]));
                                        }
                                        transformMap.push(map);
                                    }
                                    else {
                                        continue;
                                    }
                                    let previousEndTime = 0;
                                    for (let i = 0, length = transformMap.length; i < length; ++i) {
                                        const entries = Array.from(transformMap[i]);
                                        const items = entries[0];
                                        let delay = items[0];
                                        const value = items[1];
                                        if (entries.length === 1) {
                                            if (i < length - 1) {
                                                entries.push([transformMap[i + 1].keys().next().value, value]);
                                            }
                                            else {
                                                entries.push([delay + 1, value]);
                                            }
                                        }
                                        const q = entries.length;
                                        const endTime = entries[q - 1][0];
                                        let duration = endTime - delay;
                                        const animate = new SvgAnimateTransform();
                                        animate.type = value.keys().next().value as number;
                                        for (let j = 0; j < q; ++j) {
                                            const entry = entries[j];
                                            keySplines.push(interpolatorMap.get(entry[0]) || '');
                                            if (animate.type !== SVGTransform.SVG_TRANSFORM_ROTATE) {
                                                const transformOrigin = transformOriginMap.get(entry[0]);
                                                if (transformOrigin) {
                                                    (animate.transformOrigin ||= [])[j] = transformOrigin;
                                                }
                                            }
                                            entry[0] -= delay;
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
                                            ++duration;
                                        }
                                        animate.duration = duration;
                                        animate.keySplines = keySplines;
                                        animate.synchronized = { key: i, value: '' };
                                        previousEndTime = endTime;
                                        insertAnimate(animationsBase, animate, repeating);
                                    }
                                }
                                else {
                                    const entries = Array.from(result);
                                    const delay = repeatingAsInfinite !== -1 ? repeatingAsInfinite : 0;
                                    let object: Undef<SvgAnimate>;
                                    for (let i = 0, q = entries.length; i < q; ++i) {
                                        const item = entries[i];
                                        keySplines.push(interpolatorMap.get(item[0]) || '');
                                        item[0] -= delay;
                                    }
                                    if (path) {
                                        const pathData = getPathData(convertToFraction(entries), path, parent, forwardMap, precision);
                                        if (pathData) {
                                            object = new SvgAnimate();
                                            object.attributeName = 'd';
                                            for (let i = 0, q = pathData.length; i < q; ++i) {
                                                const item = pathData[i];
                                                object.keyTimes.push(item.key);
                                                object.values.push(item.value.toString());
                                            }
                                        }
                                        else {
                                            continue;
                                        }
                                    }
                                    else {
                                        const animate = new SvgAnimateTransform();
                                        animate.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                        for (const [keyTime, data] of result) {
                                            const x = data.get('x') as number || 0;
                                            const y = data.get('y') as number || 0;
                                            animate.keyTimes.push(keyTime);
                                            animate.values.push(parent ? parent.refitX(x) + ' ' + parent.refitX(y) : x + ' ' + y);
                                        }
                                        object = animate;
                                    }
                                    object.delay = delay;
                                    object.keySplines = keySplines;
                                    object.duration = lastItemOf(entries)![0];
                                    insertAnimate(animationsBase, object, repeating);
                                }
                            }
                            else if (isFromToFormat(transforming, keyTimeMode)) {
                                const entries = Array.from(result);
                                for (let i = 0, length = entries.length - 1; i < length; ++i) {
                                    const [keyTimeFrom, dataFrom] = entries[i];
                                    const [keyTimeTo, dataTo] = entries[i + 1];
                                    let value = synchronizedName,
                                        object: Undef<SvgAnimate>;
                                    if (transforming) {
                                        const animate = new SvgAnimateTransform();
                                        if (repeating) {
                                            for (let j = 0, q = timeRange.length - 1; j < q; ++j) {
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
                                        else if (infiniteMap.transform) {
                                            animate.type = infiniteMap.transform.type;
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
                                    else if (path) {
                                        const pathData = getPathData([[keyTimeFrom, dataFrom], [keyTimeTo, dataTo]], path, parent, forwardMap, precision);
                                        if (pathData) {
                                            object = new SvgAnimate();
                                            object.attributeName = 'd';
                                            object.values = replaceMap(pathData, item => item.value.toString());
                                        }
                                        else {
                                            continue;
                                        }
                                    }
                                    else {
                                        const animate = new SvgAnimateTransform();
                                        animate.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                        animate.values = [refitTransformPoints(dataFrom, parent), refitTransformPoints(dataTo, parent)];
                                        value += i;
                                        object = animate;
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
                                    insertAnimate(animationsBase, object, repeating);
                                }
                            }
                        }
                    }
                }
            }
        }
    };
};