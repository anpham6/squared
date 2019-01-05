import { KeyTimeValue } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';
import SvgPath from './svgpath';
import SvgElement from './svgelement';

import { getLeastCommonMultiple, getTransformOrigin, isSvgShape, sortNumber } from './lib/util';

type AnimateValue = number | Point[];
type TimelineIndex = Map<number, AnimateValue>;
type TimelineMap = ObjectMap<TimelineIndex>;
type KeyTimeMap = Map<number, Map<string, AnimateValue>>;
type FreezeMap = ObjectMap<KeyTimeValue<AnimateValue>>;

type GroupData = {
    duration: number;
    items: SvgAnimate[]
};

const $util = squared.lib.util;

function getTime(begin: number, duration: number, keyTimes: number[], iteration: number, index: number) {
    return begin + (keyTimes[index] + iteration) * duration;
}

function insertSplitKeyTimeValue(map: TimelineIndex, item: SvgAnimate, baseVal: AnimateValue, begin: number, iteration: number, splitTime: number, adjustment = 0): [number, AnimateValue] {
    const fraction = (splitTime - (begin + item.duration * iteration)) / item.duration;
    const keyTimes = item.keyTimes;
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
    let time = splitTime + adjustment;
    while (map.has(time)) {
        time++;
    }
    let value: AnimateValue;
    if (previousIndex !== -1 && nextIndex !== -1) {
        value = getSplitValue(
            fraction,
            keyTimes[previousIndex],
            keyTimes[nextIndex],
            getItemValue(item, previousIndex, baseVal, iteration),
            getItemValue(item, nextIndex, baseVal, iteration)
        );
    }
    else {
        value = getItemValue(item, keyTimes.length - 1, baseVal, iteration);
    }
    map.set(time, value);
    return [time, value];
}

function getSplitValue(fraction: number, previousFraction: number, nextFraction: number, previousValue: AnimateValue, nextValue: AnimateValue) {
    if (typeof previousValue === 'number' && typeof nextValue === 'number') {
        const percentage = (fraction - previousFraction) / (nextFraction - previousFraction);
        return previousValue + percentage * (nextValue - previousValue);
    }
    else if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
        const previousPoints = previousValue as Point[];
        const nextPoints = nextValue as Point[];
        const result: Point[] = [];
        for (let i = 0; i < Math.min(previousPoints.length, nextPoints.length); i++) {
            result.push({
                x: getSplitValue(fraction, previousFraction, nextFraction, previousPoints[i].x, nextPoints[i].x) as number,
                y: getSplitValue(fraction, previousFraction, nextFraction, previousPoints[i].y, nextPoints[i].y) as number
            });
        }
        return result;
    }
    else {
        return previousValue;
    }
}

function insertSplitTimeValue(map: TimelineIndex, insertMap: TimelineIndex, splitTime: number) {
    let previous: KeyTimeValue<AnimateValue> | undefined;
    let next: KeyTimeValue<AnimateValue> | undefined;
    for (const [time, value] of map.entries()) {
        if (previous && splitTime < time) {
            next = { time, value };
            break;
        }
        if (splitTime > time) {
            previous = { time, value };
        }
    }
    if (previous && next) {
        const value = getSplitValue(splitTime, previous.time, next.time, previous.value, next.value);
        insertMap.set(splitTime, value);
        return true;
    }
    return false;
}

function convertKeyTimeFraction(map: KeyTimeMap, total: number) {
    const result = new Map<number, Map<string, AnimateValue>>();
    for (const [time, data] of map.entries()) {
        let fraction = time / total;
        if (fraction > 0) {
            for (let i = 5; ; i++) {
                const value = parseFloat(fraction.toString().substring(0, i));
                if (!result.has(value)) {
                    fraction = value;
                    break;
                }
            }
        }
        result.set(fraction, data);
    }
    return result;
}

function getPathData(map: KeyTimeMap, path: SvgPath, freezeMap?: FreezeMap) {
    const result: KeyTimeValue<string>[] = [];
    const tagName = path.element.tagName;
    let methodName: string;
    let attrs: string[];
    switch (tagName) {
        case 'line':
            methodName = 'getLine';
            attrs = ['x1', 'y1', 'x2', 'y2'];
            break;
        case 'circle':
            methodName = 'getCircle';
            attrs = ['cx', 'cy', 'r'];
            break;
        case 'ellipse':
            methodName = 'getEllipse';
            attrs = ['cx', 'cy', 'rx', 'ry'];
            break;
        case 'rect':
            methodName = 'getRect';
            attrs = ['width', 'height', 'x', 'y'];
            break;
        case 'polygon':
            methodName = 'getPolygon';
            attrs = ['points'];
            break;
        case 'polyline':
            methodName = 'getPolyline';
            attrs = ['points'];
            break;
        default:
            return undefined;
    }
    for (const [time, data] of map.entries()) {
        const values: AnimateValue[] = [];
        attrs.forEach(attr => {
            if (data.has(attr)) {
                values.push(data.get(attr) as AnimateValue);
            }
            else if (freezeMap && freezeMap[attr]) {
                values.push(freezeMap[attr].value);
            }
            else if (path.baseVal[attr] !== null) {
                values.push(path.baseVal[attr]);
            }
        });
        if (values.length === attrs.length) {
            let value: string | undefined;
            const transform = path.baseVal.transformed;
            if (transform && transform.length) {
                switch (tagName) {
                    case 'line':
                        value = SvgPath.getPolyline(SvgBuild.applyTransforms(transform, getLinePoints(values as number[]), getTransformOrigin(path.element)));
                        break;
                    case 'circle':
                    case 'ellipse':
                        const points = SvgBuild.applyTransforms(transform, getEllipsePoints(values as number[], methodName === 'getCircle'), getTransformOrigin(path.element));
                        if (points.length) {
                            const pt = <Required<PointR>> points[0];
                            value = SvgPath.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
                        }
                        break;
                    case 'rect':
                        value = SvgPath.getPolygon(SvgBuild.applyTransforms(transform, getRectPoints(values as number[]), getTransformOrigin(path.element)));
                        break;
                    case 'polygon':
                        value = SvgPath.getPolygon(SvgBuild.applyTransforms(transform, values[0] as Point[], getTransformOrigin(path.element)));
                        break;
                    case 'polyline':
                        value = SvgPath.getPolyline(SvgBuild.applyTransforms(transform, values[0] as Point[], getTransformOrigin(path.element)));
                        break;
                }
            }
            if (value === undefined) {
                value = SvgPath[methodName].apply(null, values) as string;
            }
            result.push({ time, value });
        }
        else {
            return undefined;
        }
    }
    return result;
}

function getEllipsePoints(values: number[], circle: boolean): PointR[] {
    return [{ x: values[0], y: values[1], rx: values[2], ry: values[circle ? 2 : 3] }];
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

function getKeyTimeMap(map: TimelineMap, keyTimes: number[], freezeMap?: FreezeMap) {
    const result = new Map<number, Map<string, AnimateValue>>();
    for (const keyTime of keyTimes) {
        const values = new Map<string, AnimateValue>();
        for (const attr in map) {
            const value = map[attr].get(keyTime);
            if (value !== undefined) {
                values.set(attr, value);
            }
        }
        if (freezeMap) {
            for (const attr in freezeMap) {
                if (!values.has(attr) && keyTime >= freezeMap[attr].time) {
                    values.set(attr, freezeMap[attr].value);
                }
            }
        }
        result.set(keyTime, values);
    }
    return result;
}

function getItemValue(item: SvgAnimate, index: number, baseVal: AnimateValue, iteration = 0) {
    if (typeof baseVal === 'number') {
        return getNumberValue(item, index, baseVal, iteration);
    }
    else {
        return getPointsValue(item, index);
    }
}

function getPointsValue(item: SvgAnimate, index: number) {
    return SvgBuild.fromPointsValue(item.values[index]);
}

function getNumberValue(item: SvgAnimate, index: number, baseVal = 0, iteration = 0) {
    let result = parseFloat(item.values[index]);
    if (item.additiveSum) {
        result += baseVal;
        if (!item.accumulateSum) {
            iteration = 0;
        }
        for (let i = 0; i < iteration; i++) {
            for (let j = 0; j < item.values.length; j++) {
                result += parseFloat(item.values[j]);
            }
        }
    }
    return result;
}

export default class SvgShape extends SvgElement implements squared.svg.SvgShape {
    public static synchronizeAnimate(element: SVGGraphicsElement, animate: SvgAnimation[], useKeyTime = true, path?: SvgPath) {
        const animations: SvgAnimate[] = [];
        const tagName = element.tagName;
        let valuePoints = false;
        for (const item of animate) {
            if (item instanceof SvgAnimate && item.keyTimes.length > 1 && item.duration > 0 && item.begin.length) {
                switch (item.attributeName) {
                    case 'r':
                    case 'cx':
                    case 'cy':
                        if (tagName === 'circle') {
                            animations.push(item);
                            break;
                        }
                    case 'rx':
                    case 'ry':
                        if (tagName === 'ellipse') {
                            animations.push(item);
                        }
                        break;
                    case 'x1':
                    case 'x2':
                    case 'y1':
                    case 'y2':
                        if (tagName === 'line') {
                            animations.push(item);
                        }
                        break;
                    case 'points':
                        if (tagName === 'polyline' || tagName === 'polygon') {
                            animations.push(item);
                            valuePoints = true;
                        }
                        break;
                    case 'x':
                    case 'y':
                        if (element instanceof SVGSVGElement || element instanceof SVGUseElement) {
                            animations.push(item);
                            path = undefined;
                            break;
                        }
                    case 'width':
                    case 'height':
                        if (tagName === 'rect') {
                            animations.push(item);
                        }
                        break;
                }
            }
        }
        if (animations.length > 1 || animations.some(item => item.begin.length > 1 || item.keyTimes.join('-') !== '0-1' || item.end !== undefined || item.additiveSum)) {
            const groupName: ObjectMap<Map<number, GroupData>> = {};
            let repeatingDurationTotal = 0;
            for (const item of animations) {
                const attr = item.attributeName;
                if (groupName[attr] === undefined) {
                    groupName[attr] = new Map<number, GroupData>();
                }
                const groupBegin = groupName[attr];
                for (const begin of item.begin) {
                    const group = groupBegin.get(begin) || { duration: 0, items: [] };
                    group.items.push(item);
                    groupBegin.set(begin, group);
                }
            }
            for (const attr in groupName) {
                const groupBegin = groupName[attr];
                let freezeTime = Number.MAX_VALUE;
                for (const [begin, group] of groupBegin.entries()) {
                    let i = group.items.length - 1;
                    const ignore: SvgAnimate[] = [];
                    do {
                        const item = group.items[i];
                        const groupEnd = item.repeatCount === -1 || item.fillFreeze;
                        const repeatDuration = item.duration * item.repeatCount;
                        for (let j = 0; j < i; j++) {
                            const subitem = group.items[j];
                            if (groupEnd || subitem.repeatCount !== -1 && subitem.duration * subitem.repeatCount <= repeatDuration) {
                                ignore.push(subitem);
                            }
                        }
                        if (item.fillFreeze && item.repeatCount !== -1) {
                            freezeTime = Math.min(begin + repeatDuration, freezeTime);
                        }
                        if (groupEnd) {
                            break;
                        }
                    }
                    while (--i >= 0);
                    group.items = group.items.filter(item => !ignore.includes(item));
                    groupBegin.set(begin, group);
                }
                const groupSorted = new Map<number, GroupData>();
                for (const time of sortNumber(Array.from(groupBegin.keys()))) {
                    const group = groupBegin.get(time);
                    if (group) {
                        const duration = $util.maxArray(group.items.map(item => item.duration * (item.repeatCount === -1 ? 1 : item.repeatCount)));
                        repeatingDurationTotal = Math.max(repeatingDurationTotal, time + duration);
                        group.duration = duration;
                        group.items.reverse();
                        groupSorted.set(time, group);
                    }
                }
                groupName[attr] = groupSorted;
            }
            const repeatingMap: TimelineMap = {};
            const indefiniteMap: TimelineMap = {};
            const indefiniteBegin: ObjectMap<number> = {};
            const repeatingAnimations: SvgAnimate[] = [];
            const indefiniteAnimations: SvgAnimate[] = [];
            const freezeMap: FreezeMap = {};
            const keyTimeMapList: KeyTimeMap[] = [];
            let indefiniteDurationTotal = 0;
            for (const attr in groupName) {
                repeatingMap[attr] = new Map<number, number>();
                const incomplete: KeyTimeValue<SvgAnimate>[] = [];
                const groupBegin = Array.from(groupName[attr].keys());
                const groupData = Array.from(groupName[attr].values());
                let maxTime = -1;
                let baseVal: AnimateValue = path && path.baseVal[attr] || (valuePoints ? [{ x: 0, y: 0 }] : 0);
                animationEnd: {
                    for (let i = 0; i < groupBegin.length; i++) {
                        const begin = groupBegin[i];
                        const data = groupData[i];
                        let minRestartTime = 0;
                        for (let j = i + 1; j < groupBegin.length; j++) {
                            minRestartTime = Math.max(minRestartTime, groupBegin[j] + groupData[j].duration);
                        }
                        for (let j = 0; j < data.items.length; j++) {
                            const item = data.items[j];
                            const indefinite = item.repeatCount === -1;
                            const duration = item.duration;
                            const repeatCount = item.repeatCount;
                            let durationTotal = duration;
                            if (!indefinite) {
                                durationTotal *= repeatCount;
                                if (begin + Math.min(item.end === undefined ? Number.MAX_VALUE : item.end, durationTotal) <= maxTime) {
                                    continue;
                                }
                            }
                            let repeatTotal: number;
                            let repeatFraction: number;
                            if (indefinite) {
                                repeatTotal = Math.ceil((repeatingDurationTotal - begin) / duration);
                                repeatFraction = 0;
                            }
                            else {
                                repeatTotal = Math.ceil(repeatCount);
                                repeatFraction = repeatCount - Math.floor(repeatCount);
                            }
                            const maxThreadTime = Math.min(groupBegin[i + 1] || Number.MAX_VALUE, item.end || Number.MAX_VALUE);
                            let complete = true;
                            let parallel = maxTime !== -1;
                            let lastVal: AnimateValue | undefined;
                            threadTimeExceeded: {
                                for (let k = Math.floor(Math.max(0, maxTime - begin) / duration); k < repeatTotal; k++) {
                                    for (let l = 0; l < item.keyTimes.length; l++) {
                                        let time: number | undefined;
                                        let value = getItemValue(item, l, baseVal, k);
                                        if (k === repeatTotal - 1 && repeatFraction > 0) {
                                            if (repeatFraction > item.keyTimes[l]) {
                                                for (let m = l + 1; m < item.keyTimes.length; m++) {
                                                    if (repeatFraction < item.keyTimes[m]) {
                                                        time = begin + durationTotal;
                                                        value = getSplitValue(repeatFraction, item.keyTimes[l], item.keyTimes[m], value, getItemValue(item, m, baseVal, k));
                                                        repeatFraction = -1;
                                                        break;
                                                    }
                                                }
                                            }
                                            else if (repeatFraction === item.keyTimes[l]) {
                                                repeatFraction = -1;
                                            }
                                        }
                                        if (time === undefined) {
                                            time = getTime(begin, duration, item.keyTimes, k, l);
                                            if (time === maxThreadTime) {
                                                complete = k === repeatTotal - 1 && l === item.keyTimes.length - 1;
                                            }
                                            else {
                                                const adjustKeyTimeValue = (maxThread: boolean, splitTime: number) => {
                                                    const result = insertSplitKeyTimeValue(repeatingMap[attr], item, baseVal, begin, k, splitTime, maxThread && splitTime === groupBegin[i + 1] && !repeatingMap[attr].has(splitTime - 1) ? -1 : 0);
                                                    maxTime = result[0];
                                                    lastVal = result[1];
                                                };
                                                if (time > maxThreadTime) {
                                                    adjustKeyTimeValue(true, maxThreadTime);
                                                    complete = false;
                                                    break threadTimeExceeded;
                                                }
                                                else {
                                                    if (parallel) {
                                                        if (begin >= maxTime) {
                                                            time = Math.max(begin, maxTime + 1);
                                                        }
                                                        else {
                                                            if (time < maxTime) {
                                                                continue;
                                                            }
                                                            else if (time === maxTime) {
                                                                time = maxTime + 1;
                                                            }
                                                            else {
                                                                adjustKeyTimeValue(false, maxTime);
                                                            }
                                                        }
                                                        parallel = false;
                                                    }
                                                    else if (k > 0 && l === 0) {
                                                        if (item.additiveSum && item.accumulateSum) {
                                                            maxTime = time;
                                                            continue;
                                                        }
                                                        time = Math.max(time, maxTime + 1);
                                                    }
                                                }
                                            }
                                        }
                                        if (time > maxTime) {
                                            maxTime = time;
                                            lastVal = value;
                                            repeatingMap[attr].set(time, value);
                                        }
                                        if (!complete || repeatFraction === -1) {
                                            break threadTimeExceeded;
                                        }
                                    }
                                }
                            }
                            if (lastVal !== undefined) {
                                repeatingAnimations.push(item);
                                baseVal = lastVal;
                                const value = repeatingMap[attr].get(maxTime);
                                if (value !== undefined) {
                                    if (complete && item.fillFreeze) {
                                        freezeMap[attr] = { time: maxTime, value };
                                        break animationEnd;
                                    }
                                }
                            }
                            if (indefinite) {
                                incomplete.length = 0;
                            }
                            if (!complete && (indefinite || groupBegin[i] + durationTotal > minRestartTime)) {
                                incomplete.push({
                                    time: begin,
                                    value: item
                                });
                            }
                        }
                    }
                    if (incomplete.length) {
                        incomplete.reverse();
                        for (let i = 0; i < incomplete.length; i++) {
                            const begin = incomplete[i].time;
                            const item = incomplete[i].value;
                            const duration = item.duration;
                            const durationTotal = maxTime - begin;
                            const indefinite = item.repeatCount === -1;
                            let maxThreadTime = Number.MAX_VALUE;
                            const insertKeyTimes = () => {
                                let j = Math.floor(durationTotal / duration);
                                let joined = false;
                                do {
                                    for (let k = 0; k < item.keyTimes.length; k++) {
                                        const time = getTime(begin, duration, item.keyTimes, j, k);
                                        const timeExceeded = time >= maxThreadTime;
                                        if (time >= maxTime || timeExceeded) {
                                            let result = insertSplitKeyTimeValue(repeatingMap[attr], item, baseVal, begin, j, maxTime);
                                            maxTime = result[0];
                                            baseVal = result[1];
                                            joined = true;
                                            if (timeExceeded) {
                                                result = insertSplitKeyTimeValue(repeatingMap[attr], item, baseVal, begin, j, maxThreadTime);
                                                maxTime = result[0];
                                                baseVal = result[1];
                                                break;
                                            }
                                        }
                                        else if (time > maxTime) {
                                            maxTime = time;
                                            baseVal = getItemValue(item, k, baseVal, j);
                                            repeatingMap[attr].set(time, baseVal);
                                        }
                                    }
                                    j++;
                                }
                                while (!joined);
                            };
                            if (indefinite) {
                                if (durationTotal > 0 && durationTotal % duration !== 0) {
                                    insertKeyTimes();
                                }
                                indefiniteMap[attr] = new Map<number, AnimateValue>();
                                indefiniteBegin[attr] = durationTotal <= 0 ? begin : 0;
                                for (let j = 0; j < item.keyTimes.length; j++) {
                                    indefiniteMap[attr].set(item.keyTimes[j] * item.duration, getItemValue(item, j, 0, 0));
                                }
                                indefiniteAnimations.push(item);
                                break animationEnd;
                            }
                            else {
                                maxThreadTime = begin + item.duration * item.repeatCount;
                                if (maxThreadTime > maxTime) {
                                    insertKeyTimes();
                                    if (item.fillFreeze) {
                                        freezeMap[attr] = { time: maxTime, value: baseVal };
                                        break animationEnd;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (repeatingAnimations.length) {
                const keyTimesRepeating: number[] = [];
                for (const attr in repeatingMap) {
                    keyTimesRepeating.push(...repeatingMap[attr].keys());
                }
                const repeatingEndTime = $util.maxArray(keyTimesRepeating);
                for (const attr in repeatingMap) {
                    const insertMap = repeatingMap[attr];
                    let maxTime = $util.maxArray(Array.from(insertMap.keys()));
                    if (indefiniteMap[attr] && indefiniteBegin[attr] < repeatingEndTime && maxTime < repeatingEndTime) {
                        const begin = indefiniteBegin[attr];
                        do {
                            let insertTime = -1;
                            for (const [time, data] of indefiniteMap[attr].entries()) {
                                insertTime = maxTime + begin + time;
                                insertTime += insertMap.has(insertTime) ? 1 : 0;
                                insertMap.set(insertTime, data);
                                keyTimesRepeating.push(insertTime);
                            }
                            maxTime = insertTime;
                        }
                        while (maxTime < repeatingEndTime);
                        indefiniteBegin[attr] = 0;
                    }
                    if (indefiniteMap[attr] === undefined && freezeMap[attr] === undefined) {
                        let value: AnimateValue | undefined;
                        let fillReplace: boolean;
                        if (path && path.baseVal[attr] !== null) {
                            value = path.baseVal[attr];
                            fillReplace = insertMap.get(maxTime) !== value;
                        }
                        else {
                            const optional = $util.optionalAsObject(element, `${attr}.baseVal.value`);
                            if (typeof optional === 'number') {
                                value = optional;
                                fillReplace = insertMap.get(maxTime) !== value;
                            }
                            else if (Array.isArray(optional)) {
                                value = optional;
                                fillReplace = JSON.stringify(insertMap.get(maxTime)) !== JSON.stringify(value);
                            }
                            else {
                                fillReplace = false;
                            }
                        }
                        if (fillReplace) {
                            maxTime++;
                            insertMap.set(maxTime, value as AnimateValue);
                            keyTimesRepeating.push(maxTime);
                        }
                    }
                }
                const keyTimes = sortNumber(Array.from(new Set(keyTimesRepeating)));
                const repeatingResult: TimelineMap = {};
                for (const attr in repeatingMap) {
                    const baseMap = repeatingMap[attr];
                    const insertMap = new Map<number, AnimateValue>();
                    const maxTime = Array.from(baseMap.keys()).pop() as number;
                    for (let i = 0; i < keyTimes.length; i++) {
                        const keyTime = keyTimes[i];
                        if (keyTime <= maxTime) {
                            const value = baseMap.get(keyTime);
                            if (value === undefined) {
                                insertSplitTimeValue(baseMap, insertMap, keyTime);
                            }
                            else {
                                insertMap.set(keyTime, value);
                            }
                        }
                    }
                    repeatingResult[attr] = insertMap;
                }
                repeatingDurationTotal = keyTimes[keyTimes.length - 1];
                if (useKeyTime) {
                    keyTimeMapList.push(convertKeyTimeFraction(
                        getKeyTimeMap(repeatingResult, keyTimes, freezeMap),
                        repeatingDurationTotal
                    ));
                }
                else {
                    keyTimeMapList.push(getKeyTimeMap(repeatingResult, keyTimes, freezeMap));
                }
            }
            if (indefiniteAnimations.length) {
                indefiniteDurationTotal = getLeastCommonMultiple(indefiniteAnimations.map(item => item.duration));
                const indefiniteResult: TimelineMap = {};
                let keyTimes: number[] = [];
                for (const attr in indefiniteMap) {
                    indefiniteResult[attr] = new Map<number, number>();
                    const object = indefiniteAnimations.find(item => item.attributeName === attr);
                    if (object) {
                        let maxTime = 0;
                        let i = 0;
                        do {
                            for (let [time, value] of indefiniteMap[attr].entries()) {
                                time += object.duration * i;
                                indefiniteResult[attr].set(time, value);
                                keyTimes.push(time);
                                maxTime = time;
                            }
                            i++;
                        }
                        while (maxTime < indefiniteDurationTotal);
                    }
                }
                keyTimes = sortNumber(Array.from(new Set(keyTimes)));
                for (const attr in indefiniteResult) {
                    const baseMap = indefiniteResult[attr];
                    for (let i = 1; i < keyTimes.length; i++) {
                        const keyTime = keyTimes[i];
                        if (!baseMap.has(keyTime)) {
                            insertSplitTimeValue(baseMap, baseMap, keyTime);
                        }
                    }
                }
                if (useKeyTime) {
                    keyTimeMapList.push(convertKeyTimeFraction(
                        getKeyTimeMap(indefiniteResult, keyTimes),
                        keyTimes[keyTimes.length - 1]
                    ));
                }
                else {
                    keyTimeMapList.push(getKeyTimeMap(indefiniteResult, keyTimes));
                }
            }
            if (keyTimeMapList.length) {
                $util.retainArray(animate, item => !animations.includes(<SvgAnimate> item));
                const sequentialName = Array.from(new Set(animations.map(item => item.attributeName))).sort().join('-');
                let x = 0;
                let y = 0;
                if (path === undefined) {
                    x = $util.optionalAsNumber(element, `x.baseVal.value`);
                    y = $util.optionalAsNumber(element, `y.baseVal.value`);
                }
                for (let i = 0; i < keyTimeMapList.length; i++) {
                    const keyTimeMap = keyTimeMapList[i];
                    const freezeIndefinite = repeatingDurationTotal === 0 || i > 0 ? freezeMap : undefined;
                    const repeating = i === 0 && repeatingDurationTotal > 0;
                    const animateElement = repeating ? repeatingAnimations[0].element : indefiniteAnimations[0].element;
                    function setXY(item: Map<string, number>) {
                        if (!item.has('x')) {
                            item.set('x', x);
                        }
                        else {
                            x = item.get('x') as number;
                        }
                        if (!item.has('y')) {
                            item.set('y', y);
                        }
                        else {
                            y = item.get('y') as number;
                        }
                    }
                    function insertAnimate(item: SvgAnimate) {
                        if (repeating) {
                            item.repeatCount = 0;
                        }
                        else {
                            item.begin = [0];
                            item.repeatCount = -1;
                        }
                        item.end = undefined;
                        item.from = item.values[0];
                        item.to = item.values[item.values.length - 1];
                        item.by = '';
                        animate.push(item);
                    }
                    if (useKeyTime) {
                        let object: SvgAnimate | undefined;
                        if (path) {
                            const pathData = getPathData(keyTimeMap, path, freezeIndefinite);
                            if (pathData) {
                                object = new SvgAnimate(animateElement, element);
                                object.attributeName = 'd';
                                object.keyTimes = pathData.map(item => item.time);
                                object.values = pathData.map(item => item.value.toString());
                            }
                            else {
                                continue;
                            }
                        }
                        else {
                            object = new SvgAnimateTransform(animateElement, element);
                            object.attributeName = 'transform';
                            (object as SvgAnimateTransform).type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                            object.keyTimes.length = 0;
                            object.values.length = 0;
                            for (const [keyTime, data] of keyTimeMap.entries()) {
                                setXY(data as Map<string, number>);
                                object.keyTimes.push(keyTime);
                                object.values.push(`${x} ${y}`);
                            }
                        }
                        if (repeating) {
                            object.begin = [0];
                            object.duration = repeatingDurationTotal;
                        }
                        else {
                            object.duration = indefiniteDurationTotal;
                        }
                        insertAnimate(object);
                    }
                    else {
                        const entries = Array.from(keyTimeMap.entries());
                        for (let j = 0, k = 0; j < entries.length - 1; j++) {
                            const [keyTimeFrom, dataFrom] = entries[j];
                            const [keyTimeTo, dataTo] = entries[j + 1];
                            let object: SvgAnimate | undefined;
                            let name: string;
                            if (path) {
                                const map = new Map<number, Map<string, AnimateValue>>();
                                map.set(keyTimeFrom, dataFrom);
                                map.set(keyTimeTo, dataTo);
                                const pathData = getPathData(map, path, freezeIndefinite);
                                if (pathData) {
                                    object = new SvgAnimate(animateElement, element);
                                    object.attributeName = 'd';
                                    object.values = pathData.map(item => item.value.toString());
                                }
                                else {
                                    continue;
                                }
                                name = sequentialName;
                            }
                            else {
                                object = new SvgAnimateTransform(animateElement, element);
                                object.attributeName = 'transform';
                                (object as SvgAnimateTransform).type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                object.values = [dataFrom, dataTo].map(data => {
                                    setXY(data as Map<string, number>);
                                    return `${x} ${y}`;
                                });
                                name = sequentialName + j;
                            }
                            if (repeating) {
                                object.begin = [j === 0 ? keyTimeFrom : 0];
                            }
                            object.duration = keyTimeTo - keyTimeFrom;
                            object.keyTimes = [0, 1];
                            object.sequential = { name, value: k++ };
                            insertAnimate(object);
                        }
                    }
                }
            }
        }
        return animate;
    }

    public path?: SvgPath;

    constructor(public readonly element: SVGGraphicsElement) {
        super(element);
        if (isSvgShape(element)) {
            this.setPath(new SvgPath(element));
        }
    }

    public setPath(value: SvgPath) {
        this.path = value;
        for (const item of this.animate) {
            if (item instanceof SvgAnimate) {
                item.parentPath = value;
            }
        }
    }

    public build(exclusions?: number[]) {
        let d = '';
        if (this.path) {
            d = this.path.build(exclusions);
        }
        return d;
    }

    public synchronize(useKeyTime = true) {
        if (this.path && this.animate.length) {
            SvgShape.synchronizeAnimate(this.element, this.animate, useKeyTime, this.path);
        }
    }

    set transform(value) {
        if (this.path) {
            this.path.transform = value;
        }
        else {
            super.transform = value;
        }
    }
    get transform() {
        if (this.path) {
            return this.path.transform;
        }
        else {
            return super.transform;
        }
    }

    set transformed(value) {
        if (this.path) {
            this.path.transformed = value;
        }
        else {
            super.transformed = value;
        }
    }
    get transformed() {
        if (this.path) {
            return this.path.transformed;
        }
        else {
            return super.transformed;
        }
    }
}