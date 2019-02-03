import { SvgPoint } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateTransform from './svganimatetransform';

import SvgBuild from './svgbuild';
import SvgPath from './svgpath';

import { FILL_MODE, SYNCHRONIZE_MODE, SYNCHRONIZE_STATE } from './lib/constant';
import { SVG, TRANSFORM, getLeastCommonMultiple, sortNumber } from './lib/util';

type SvgAnimation = squared.svg.SvgAnimation;
type SvgBaseVal = squared.svg.SvgBaseVal;
type SvgContainer = squared.svg.SvgContainer;

type AnimateValue = number | Point[] | string;
type TimelineIndex = Map<number, AnimateValue>;
type TimelineMap = ObjectMap<TimelineIndex>;
type KeyTimeMap = Map<number, Map<any, AnimateValue>>;
type FreezeMap = ObjectMap<number>;
type FreezeResetMap = ObjectMap<NumberValue<AnimateValue>>;
type InterpolatorMap = Map<number, string>;

type GroupData = {
    duration: number;
    items: SvgAnimate[];
};

const $util = squared.lib.util;

function insertSplitTimeValue(map: TimelineIndex, insertMap: TimelineIndex, time: number) {
    let previousTime = 0;
    let previousValue!: AnimateValue;
    let previous: NumberValue<AnimateValue> | undefined;
    let next: NumberValue<AnimateValue> | undefined;
    for (const [ordinal, value] of map.entries()) {
        if (time === ordinal) {
            previous = { ordinal, value };
            break;
        }
        else if (time > previousTime && time < ordinal) {
            previous = { ordinal: previousTime, value: previousValue };
            next = { ordinal, value };
            break;
        }
        previousTime = ordinal;
        previousValue = value;
    }
    if (previous && next) {
        setTimelineValue(insertMap, time, getSplitValue(time, previous.ordinal, previous.value, next.ordinal, next.value));
    }
    else if (previous) {
        setTimelineValue(insertMap, time, previous.value);
    }
}

function convertToFraction(entries: [number, Map<any, AnimateValue>][]) {
    const result = new Map<number, Map<any, AnimateValue>>();
    const timeTotal = entries[entries.length - 1][0];
    for (const [time, data] of entries) {
        let fraction = time / timeTotal;
        if (fraction > 0) {
            for (let i = 7; ; i++) {
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

function getPathData(map: KeyTimeMap, path: SvgPath, parent?: SvgContainer) {
    const result: NumberValue<string>[] = [];
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
            return undefined;
    }
    for (const [ordinal, data] of map.entries()) {
        const values: AnimateValue[] = [];
        for (const attr of baseVal) {
            let value = data.get(attr);
            if (value === undefined) {
                value = path.getBaseValue(attr);
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
                points = values[0] as Point[];
                break;
            case 'circle':
            case 'ellipse':
                points = getEllipsePoints(values as number[]);
                break;
        }
        if (points) {
            let value: string | undefined;
            if (path.transformed && path.transformed.length) {
                points = SvgBuild.applyTransforms(path.transformed, points, TRANSFORM.origin(path.element));
            }
            if (parent) {
                parent.refitPoints(points);
            }
            switch (tagName) {
                case 'line':
                case 'polyline':
                    value = SvgBuild.drawPolyline(points, true);
                    break;
                case 'rect':
                case 'polygon':
                    value = SvgBuild.drawPolygon(points, true);
                    break;
                case 'circle':
                case 'ellipse':
                    const pt = <Required<SvgPoint>> points[0];
                    value = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, true);
                    break;
            }
            if (value !== undefined) {
                result.push({ ordinal, value });
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

function getEllipsePoints(values: number[]): SvgPoint[] {
    return [{ x: values[0], y: values[1], rx: values[2], ry: values[values.length - 1] }];
}

function createKeyTimeMap(map: TimelineMap, keyTimes: number[], freezeResetMap?: FreezeResetMap) {
    const result = new Map<number, Map<string, AnimateValue>>();
    for (const keyTime of keyTimes) {
        const values = new Map<string, AnimateValue>();
        for (const attr in (freezeResetMap || map)) {
            let value: AnimateValue | undefined;
            if (map[attr]) {
                value = map[attr].get(keyTime);
                if (value === undefined) {
                    value = getFreezeValue(map[attr], keyTime);
                }
            }
            else if (freezeResetMap) {
                value = freezeResetMap[attr].value;
            }
            if (value !== undefined) {
                values.set(attr, value);
            }
        }
        result.set(keyTime, values);
    }
    return result;
}

function getItemTime(begin: number, duration: number, keyTimes: number[], iteration: number, index: number) {
    return Math.round(begin + (keyTimes[index] + iteration) * duration);
}

function getItemValue(item: SvgAnimate, baseValue: AnimateValue, iteration: number, index: number) {
    const values = item.alternate && iteration % 2 !== 0 ? item.values.slice(0).reverse() : item.values;
    if (typeof baseValue === 'number') {
        let result = parseFloat(values[index]);
        if (item.additiveSum) {
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
    else if (typeof baseValue === 'string') {
        if (item.additiveSum) {
            const baseArray = baseValue.split(/\s+/).map(value => parseFloat(value));
            const valuesArray = values.map(value => value.trim().split(/\s+/).map(xy => parseFloat(xy)));
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
    }
    else if (Array.isArray(baseValue)) {
        return SvgBuild.toPointList(values[index]);
    }
    return baseValue;
}

function getSplitValue(fraction: number, previousFraction: number, previousValue: AnimateValue, nextFraction: number, nextValue: AnimateValue) {
    if (typeof previousValue === 'number' && typeof nextValue === 'number') {
        const percentage = (fraction - previousFraction) / (nextFraction - previousFraction);
        return previousValue + percentage * (nextValue - previousValue);
    }
    else if (typeof previousValue === 'string' && typeof nextValue === 'string') {
        const previousArray = previousValue.split(' ').map(value => parseFloat(value));
        const nextArray = nextValue.split(' ').map(value => parseFloat(value));
        if (previousArray.length === nextArray.length) {
            const result: number[] = [];
            for (let i = 0; i < previousArray.length; i++) {
                result.push(getSplitValue(fraction, previousFraction, previousArray[i], nextArray[i], nextFraction) as number);
            }
            return result.join(' ');
        }
    }
    else if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
        const result: Point[] = [];
        for (let i = 0; i < Math.min(previousValue.length, nextValue.length); i++) {
            result.push({
                x: getSplitValue(fraction, previousFraction, previousValue[i].x, nextFraction, nextValue[i].x) as number,
                y: getSplitValue(fraction, previousFraction, previousValue[i].y, nextFraction, nextValue[i].y) as number
            });
        }
        return result;
    }
    return previousValue;
}

function insertSplitKeyTimeValue(map: TimelineIndex, interpolatorMap: InterpolatorMap, item: SvgAnimate, baseValue: AnimateValue, begin: number, iteration: number, time: number, useKeyTime: number): [number, AnimateValue] {
    let actualTime: number;
    if (begin < 0) {
        actualTime = time - begin;
        begin = 0;
    }
    else {
        actualTime = time;
    }
    actualTime = getActualTime(actualTime);
    const fraction = Math.max(0, Math.min((actualTime - (begin + item.duration * iteration)) / item.duration, 1));
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
    let value: AnimateValue;
    if (previousIndex !== -1 && nextIndex !== -1) {
        value = getSplitValue(
            fraction,
            keyTimes[previousIndex],
            getItemValue(item, baseValue, iteration, previousIndex),
            keyTimes[nextIndex],
            getItemValue(item, baseValue, iteration, nextIndex)
        );
    }
    else {
        nextIndex = previousIndex !== -1 ? previousIndex + 1 : keyTimes.length - 1;
        value = getItemValue(item, baseValue, iteration, nextIndex);
    }
    time = setTimelineValue(map, time, value);
    insertInterpolator(interpolatorMap, item, time, nextIndex, useKeyTime);
    return [time, value];
}

function setTimelineValue(map: TimelineIndex, time: number, value: AnimateValue) {
    let stored = map.get(time);
    if (stored === undefined) {
        stored = map.get(getActualTime(time));
    }
    if (stored !== value) {
        if (typeof stored === 'number' && Math.round(stored) === Math.round(value as number)) {
            return time;
        }
        while (time > 0 && map.has(time)) {
            time++;
        }
        map.set(time, value);
    }
    return time;
}

function insertInterpolator(map: InterpolatorMap, item: SvgAnimate, time: number, index: number, useKeyTime: number) {
    if (!isKeyTimeFormat(SvgBuild.asAnimateTransform(item), useKeyTime)) {
        if (index === 0) {
            return;
        }
        index--;
    }
    const value = item.keySplines && item.keySplines[index] || '';
    if (value !== '') {
        map.set(time, value);
    }
}

function isKeyTimeFormat(transforming: boolean, useKeyTime: number) {
    return $util.hasBit(useKeyTime, transforming ? SYNCHRONIZE_MODE.KEYTIME_TRANSFORM : SYNCHRONIZE_MODE.KEYTIME_ANIMATE);
}

function isFromToFormat(transforming: boolean, useKeyTime: number) {
    return $util.hasBit(useKeyTime, transforming ? SYNCHRONIZE_MODE.FROMTO_TRANSFORM : SYNCHRONIZE_MODE.FROMTO_ANIMATE);
}

function playableAnimation(item: SvgAnimate) {
    return !item.paused && (item.element && item.duration !== -1 || item.keyTimes && item.keyTimes.length > 1 && item.duration > 0);
}

function getDurationTotal(item: SvgAnimate) {
    if (item.repeatCount !== -1) {
        return Math.min(item.begin + item.duration * item.repeatCount, item.end || Number.POSITIVE_INFINITY);
    }
    return Number.POSITIVE_INFINITY;
}

function getDurationMinimum(item: SvgAnimate) {
    return Math.min(item.begin + item.duration * (item.repeatCount !== -1 ? item.repeatCount : 1), item.end || Number.POSITIVE_INFINITY);
}

function getFreezeValue(map: TimelineIndex, time: number) {
    let lastTime = 0;
    let lastValue!: AnimateValue;
    for (const [freezeTime, value] of map.entries()) {
        if (time === freezeTime) {
            return value;
        }
        else if (time > lastTime && time < freezeTime) {
            return lastValue;
        }
        lastTime = freezeTime;
        lastValue = value;
    }
    return lastValue;
}

function getActualTime(value: number) {
    if ((value + 1) % 10 === 0) {
        value++;
    }
    else if ((value - 1) % 10 === 0) {
        value--;
    }
    return value;
}

export default <T extends Constructor<squared.svg.SvgView>>(Base: T) => {
    return class extends Base implements squared.svg.SvgSynchronize {
        public getAnimateShape(element: SVGGraphicsElement, animation?: SvgAnimation[]) {
            if (animation === undefined) {
                animation = this.animation;
            }
            const result: SvgAnimate[] = [];
            for (const item of animation as SvgAnimate[]) {
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

        public getAnimateViewRect(animation?: SvgAnimation[]) {
            if (animation === undefined) {
                animation = this.animation;
            }
            const result: SvgAnimate[] = [];
            for (const item of animation as SvgAnimate[]) {
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

        public getAnimateTransform(animation?: SvgAnimation[]) {
            if (animation === undefined) {
                animation = this.animation;
            }
            return <SvgAnimateTransform[]> animation.filter(item => SvgBuild.asAnimateTransform(item) && item.duration > 0);
        }

        public mergeAnimations(animations: SvgAnimation[], transformations: SvgAnimateTransform[], useKeyTime = 0, path?: SvgPath) {
            [animations, transformations].forEach((mergeable, index) => {
                const transforming = index === 1;
                if (mergeable.length === 0 || index === 0 && $util.hasBit(useKeyTime, SYNCHRONIZE_MODE.IGNORE_ANIMATE) || transforming && $util.hasBit(useKeyTime, SYNCHRONIZE_MODE.IGNORE_TRANSFORM)) {
                    return;
                }
                const freezeResetMap: FreezeResetMap = {};
                const conflicted: SvgAnimate[] = [];
                const setter: SvgAnimation[] = [];
                {
                    const excluded: SvgAnimate[] = [];
                    for (let i = 0; i < mergeable.length; i++) {
                        if (mergeable[i].setterType) {
                            setter.push(mergeable[i]);
                        }
                        else {
                            const itemA = <SvgAnimate> mergeable[i];
                            const timeA = getDurationTotal(itemA);
                            for (let j = 0; j < mergeable.length; j++) {
                                const itemB = <SvgAnimate> mergeable[j];
                                if (i !== j && itemA.attributeName === itemB.attributeName && itemA.group.id < itemB.group.id) {
                                    if (itemB.setterType) {
                                        if (itemA.begin === itemB.begin) {
                                            excluded[i] = itemA;
                                            break;
                                        }
                                    }
                                    else {
                                        const timeB = getDurationTotal(itemB);
                                        if (itemA.begin === itemB.begin && (!itemB.fillReplace || itemB.fillBackwards || timeA <= timeB || itemB.repeatCount === -1) ||
                                            itemB.fillBackwards && itemA.begin <= itemB.begin && (itemB.fillForwards || timeA <= itemB.begin) ||
                                            itemA.element && itemB.element === undefined && (itemA.begin >= itemB.begin && timeA <= timeB || itemB.fillForwards))
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
                        const item = excluded[i];
                        if (item) {
                            if (item.element === undefined && item.fillForwards) {
                                item.setterType = true;
                                setter.push(item);
                            }
                            else {
                                removeable.push(mergeable[i]);
                            }
                        }
                        else {
                            conflicted.push(<SvgAnimate> mergeable[i]);
                        }
                    }
                    this._removeAnimations(removeable);
                }
                if (index === 0 && conflicted.length > 0 || transforming && (conflicted.length > 1 || conflicted.length === 1 && (conflicted[0].alternate || conflicted[0].end !== undefined))) {
                    const groupActive = new Set(conflicted.map(item => item.group.name));
                    for (const item of conflicted) {
                        if (item.group.order) {
                            $util.spliceArray(item.group.order, subitem => !groupActive.has(subitem.name));
                        }
                    }
                    const groupName: ObjectMap<Map<number, GroupData>> = {};
                    let repeatingDuration = 0;
                    for (const item of conflicted) {
                        const attr = item.attributeName;
                        if (groupName[attr] === undefined) {
                            groupName[attr] = new Map<number, GroupData>();
                        }
                        const group = groupName[attr].get(item.begin) || { duration: 0, items: [] };
                        group.items.push(item);
                        groupName[attr].set(item.begin, group);
                    }
                    for (const attr in groupName) {
                        const groupBegin = groupName[attr];
                        for (const [begin, group] of groupBegin.entries()) {
                            const ignore: SvgAnimate[] = [];
                            let i = group.items.length - 1;
                            do {
                                const item = group.items[i];
                                const groupEnd = item.repeatCount === -1 || !item.fillReplace;
                                const repeatDuration = item.duration * item.repeatCount;
                                for (let j = 0; j < i; j++) {
                                    const conflict = group.items[j];
                                    if (groupEnd || conflict.repeatCount !== -1 && conflict.duration * conflict.repeatCount <= repeatDuration) {
                                        ignore.push(conflict);
                                    }
                                }
                                if (groupEnd) {
                                    break;
                                }
                            }
                            while (--i >= 0);
                            $util.spliceArray(group.items, item => !ignore.includes(item));
                            if (group.items.length) {
                                groupBegin.set(begin, group);
                            }
                        }
                        const groupSorted = new Map<number, GroupData>();
                        for (const begin of sortNumber(Array.from(groupBegin.keys()))) {
                            const group = groupBegin.get(begin);
                            if (group) {
                                const duration = $util.maxArray(group.items.map(item => getDurationMinimum(item)));
                                repeatingDuration = Math.max(repeatingDuration, duration);
                                group.duration = duration;
                                group.items.reverse();
                                groupSorted.set(begin, group);
                            }
                        }
                        groupName[attr] = groupSorted;
                    }
                    const repeatingMap: TimelineMap = {};
                    const indefiniteMap: ObjectMap<SvgAnimate> = {};
                    const repeatingInterpolatorMap = new Map<number, string>();
                    const indefiniteInterpolatorMap = new Map<number, string>();
                    const repeatingAnimations = new Set<SvgAnimate>();
                    const animateTimeRangeMap = new Map<number, number>();
                    const baseValueMap: ObjectMap<AnimateValue> = {};
                    const freezeMap: FreezeMap = {};
                    let repeatingResult: KeyTimeMap | undefined;
                    let repeatingAsIndefinite: number | undefined;
                    let indefiniteResult: KeyTimeMap | undefined;
                    function setTimeRange(type: number | undefined, startTime: number, endTime?: number) {
                        if (type) {
                            animateTimeRangeMap.set(startTime, type);
                            if (endTime !== undefined) {
                                animateTimeRangeMap.set(endTime, type);
                            }
                        }
                    }
                    for (const attr in groupName) {
                        repeatingMap[attr] = new Map<number, AnimateValue>();
                        freezeMap[attr] = 0;
                        const groupBegin = Array.from(groupName[attr].keys());
                        const groupData = Array.from(groupName[attr].values());
                        const backwards: SvgAnimateTransform | undefined = (<SvgAnimateTransform[]> conflicted).filter(item  => item.fillBackwards && item.attributeName === attr).sort((a, b) => a.group.id <= b.group.id ? 1 : -1)[0];
                        const incomplete: SvgAnimate[] = [];
                        const setterData = setter.filter(item => item.attributeName === attr);
                        let maxTime = -1;
                        let actualMaxTime = 0;
                        let baseValue!: AnimateValue;
                        let previousTransform: SvgAnimateTransform | undefined;
                        let nextBeginTime: number | undefined;
                        if (backwards) {
                            backwards.addState(SYNCHRONIZE_STATE.BACKWARDS);
                            baseValue = getItemValue(backwards, transforming ? '' : this._getBaseValue(attr, path), 0, 0);
                            maxTime = setTimelineValue(repeatingMap[attr], 0, baseValue);
                            if (transforming) {
                                setTimeRange(backwards.type, 0);
                                previousTransform = backwards;
                            }
                        }
                        function resetTransform(additiveSum = false, resetTime: number, value: string) {
                            if (previousTransform && !additiveSum) {
                                maxTime = setTimelineValue(repeatingMap[attr], resetTime, value);
                                if (resetTime !== maxTime) {
                                    setTimeRange(previousTransform.type, maxTime);
                                }
                            }
                            previousTransform = undefined;
                        }
                        function checkIncomplete(time?: number) {
                            const expireTime = time === undefined ? maxTime : time;
                            $util.spliceArray(incomplete, previous => getDurationTotal(previous) <= expireTime);
                        }
                        function setComplete(item: SvgAnimateTransform, nextBegin?: number) {
                            if (item.fillForwards) {
                                setFreezeResetValue(item.type, baseValue);
                                item.addState(SYNCHRONIZE_STATE.FORWARDS);
                                freezeMap[attr] = FILL_MODE.FORWARDS;
                                incomplete.length = 0;
                            }
                            else {
                                if (item.fillFreeze) {
                                    freezeMap[attr] = FILL_MODE.FREEZE;
                                    setFreezeResetValue(item.type, baseValue);
                                    if (incomplete.length) {
                                        $util.spliceArray(incomplete, previous => previous.element !== undefined);
                                    }
                                }
                                $util.spliceArray(incomplete, previous => getDurationTotal(previous) > maxTime);
                                if (nextBegin !== undefined) {
                                    let currentMaxTime = maxTime;
                                    const [replaceValue, modified] = checkSetterNextBegin(actualMaxTime, nextBegin);
                                    if (item.fillReplace && replaceValue !== undefined && nextBegin > actualMaxTime && incomplete.length === 0) {
                                        currentMaxTime = setTimelineValue(repeatingMap[attr], currentMaxTime, replaceValue);
                                        if (transforming) {
                                            setTimeRange(item.type, currentMaxTime);
                                        }
                                        if (!modified) {
                                            baseValue = replaceValue;
                                            maxTime = currentMaxTime;
                                        }
                                    }
                                }
                            }
                            repeatingAnimations.add(item);
                            item.addState(SYNCHRONIZE_STATE.COMPLETE);
                        }
                        function sortIncomplete() {
                            incomplete.sort((a, b) => a.group.id <= b.group.id ? 1 : -1);
                        }
                        function setFreezeResetValue(type: number | undefined, value: AnimateValue, includeBase = false) {
                            if (!transforming && typeof value === 'string') {
                                let freezeValue: AnimateValue;
                                if ($util.isNumber(value)) {
                                    freezeValue = parseFloat(value);
                                }
                                else {
                                    freezeValue = SvgBuild.toPointList(value);
                                    if (freezeValue.length === 0) {
                                        value = '';
                                    }
                                }
                            }
                            if (value !== '') {
                                freezeResetMap[attr] = { ordinal: type || 0, value };
                                if (includeBase) {
                                    baseValue = value;
                                }
                            }
                        }
                        function setSetterValue(time: number, value: AnimateValue) {
                            freezeMap[attr] = FILL_MODE.FREEZE;
                            return setTimelineValue(repeatingMap[attr], time, value);
                        }
                        function checkSetterNextBegin(previousMaxTime: number, nextBegin: number): [AnimateValue | undefined, boolean] {
                            const currentMaxTime = maxTime;
                            let modified = false;
                            let replaceValue = freezeResetMap[attr] ? freezeResetMap[attr].value : undefined;
                            for (let i = 0; i < setterData.length; i++) {
                                const set = setterData[i];
                                if (set.begin >= currentMaxTime) {
                                    if (set.begin === currentMaxTime) {
                                        replaceValue = set.to;
                                    }
                                    else {
                                        modified = true;
                                    }
                                    setFreezeResetValue((<SvgAnimateTransform> set).type, set.to, incomplete.length === 0);
                                    if (set.begin > previousMaxTime && set.begin < nextBegin) {
                                        maxTime = setSetterValue(set.begin, set.to);
                                        actualMaxTime = set.begin;
                                    }
                                    setterData.splice(i--, 1);
                                }
                            }
                            return [replaceValue, modified];
                        }
                        setterData.sort((a, b) => {
                            if (a.begin === b.begin) {
                                return a.group.id < b.group.id ? -1 : 1;
                            }
                            return a.begin < b.begin ? -1 : 1;
                        });
                        for (let i = 0; i < setterData.length; i++) {
                            const set = setterData[i];
                            if (set.begin <= groupBegin[0]) {
                                setFreezeResetValue((<SvgAnimateTransform> set).type, set.to, true);
                                if (set.begin < groupBegin[0] && backwards === undefined) {
                                    setSetterValue(set.begin, set.to);
                                }
                                setterData.splice(i--, 1);
                            }
                        }
                        if (!transforming) {
                            baseValueMap[attr] = this._getBaseValue(attr, path);
                            if (freezeResetMap[attr] === undefined) {
                                setFreezeResetValue(0, baseValueMap[attr]);
                            }
                            if (baseValue === undefined) {
                                baseValue = freezeResetMap[attr].value;
                            }
                        }
                        attributeEnd: {
                            for (let i = 0; i < groupBegin.length; i++) {
                                let begin = groupBegin[i];
                                for (let j = 0; j < groupData[i].items.length; j++) {
                                    const item = <SvgAnimateTransform> groupData[i].items[j];
                                    if (item.hasState(SYNCHRONIZE_STATE.COMPLETE, SYNCHRONIZE_STATE.INVALID)) {
                                        continue;
                                    }
                                    else if (backwards && item.element && begin <= backwards.begin) {
                                        item.addState(SYNCHRONIZE_STATE.INTERRUPTED);
                                        incomplete.push(item);
                                        continue;
                                    }
                                    const indefinite = item.repeatCount === -1;
                                    const duration = item.duration;
                                    const repeatCount = item.repeatCount;
                                    let durationTotal: number;
                                    if (!indefinite) {
                                        durationTotal = Math.min(item.end || Number.POSITIVE_INFINITY, Math.round(begin + duration * repeatCount));
                                        if (durationTotal <= maxTime) {
                                            if (item.fillReplace) {
                                                item.addState(SYNCHRONIZE_STATE.INVALID);
                                            }
                                            else {
                                                item.addState(SYNCHRONIZE_STATE.INTERRUPTED);
                                                incomplete.push(item);
                                            }
                                            continue;
                                        }
                                    }
                                    else {
                                        durationTotal = begin + duration;
                                    }
                                    let repeatTotal: number;
                                    let repeatFraction: number;
                                    if (indefinite) {
                                        repeatTotal = Math.ceil((repeatingDuration - begin) / duration);
                                        repeatFraction = 0;
                                    }
                                    else {
                                        repeatTotal = Math.ceil(repeatCount);
                                        repeatFraction = repeatCount - Math.floor(repeatCount);
                                    }
                                    if (actualMaxTime < begin) {
                                        checkSetterNextBegin(actualMaxTime, begin);
                                    }
                                    if (maxTime !== -1 && maxTime < begin) {
                                        maxTime = setTimelineValue(repeatingMap[attr], begin - 1, baseValue);
                                        actualMaxTime = begin;
                                        if (item.fillReplace) {
                                            freezeMap[attr] = 0;
                                        }
                                    }
                                    let setterInterrupt: SvgAnimation | undefined;
                                    if (item.group.order) {
                                        nextBeginTime = undefined;
                                        let checkBegin = true;
                                        for (const order of item.group.order) {
                                            if (order.name === item.group.name) {
                                                checkBegin = false;
                                                break;
                                            }
                                            else if (actualMaxTime <= order.delay) {
                                                break;
                                            }
                                        }
                                        nextBegin: {
                                            for (let k = i + 1; k < groupBegin.length; k++) {
                                                if (groupBegin[k] !== Number.POSITIVE_INFINITY) {
                                                    for (let l = 0; l < groupData[k].items.length; l++) {
                                                        const next = groupData[k].items[l];
                                                        if (next.group.order && next.group.id < item.group.id && next.begin >= item.begin) {
                                                            next.addState(SYNCHRONIZE_STATE.INTERRUPTED);
                                                            incomplete.push(next);
                                                        }
                                                        else if (next.group.id > item.group.id && !next.paused) {
                                                            if (checkBegin) {
                                                                nextBeginTime = groupBegin[k];
                                                            }
                                                            break nextBegin;
                                                        }
                                                        else if (indefinite || getDurationTotal(next) < durationTotal) {
                                                            next.addState(SYNCHRONIZE_STATE.INVALID);
                                                        }
                                                        else {
                                                            next.addState(SYNCHRONIZE_STATE.INTERRUPTED);
                                                            incomplete.push(next);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        nextBeginTime = groupBegin[i + 1] !== undefined ? $util.minArray(groupBegin.slice(i + 1)) : undefined;
                                    }
                                    const actualStartTime = actualMaxTime;
                                    let startTime = maxTime + 1;
                                    let maxThreadTime = Math.min(nextBeginTime || Number.POSITIVE_INFINITY, item.end || Number.POSITIVE_INFINITY, item.repeatDuration !== -1 && item.repeatDuration < duration ? item.repeatDuration : Number.POSITIVE_INFINITY);
                                    if (item.element) {
                                        setterInterrupt = setterData.find(set => set.begin >= actualMaxTime && set.begin <= Math.min(nextBeginTime || Number.POSITIVE_INFINITY, durationTotal, maxThreadTime));
                                        if (setterInterrupt) {
                                            switch (setterInterrupt.begin) {
                                                case actualMaxTime:
                                                    setFreezeResetValue((<SvgAnimateTransform> setterInterrupt).type, setterInterrupt.to, true);
                                                    baseValue = setterInterrupt.to;
                                                    if (setterInterrupt.group.id > item.group.id && item.keyTimes[0] === 0) {
                                                        if (transforming && previousTransform) {
                                                            resetTransform(item.additiveSum, Math.max(begin - 1, maxTime), TRANSFORM.valueAsInitial(previousTransform.type));
                                                        }
                                                        maxTime = setSetterValue(Math.max(setterInterrupt.begin, maxTime), baseValue);
                                                        actualMaxTime = setterInterrupt.begin;
                                                        item.addState(SYNCHRONIZE_STATE.INVALID);
                                                    }
                                                    break;
                                                case nextBeginTime:
                                                    setterInterrupt.addState(SYNCHRONIZE_STATE.EQUAL_TIME);
                                                    break;
                                                default:
                                                    maxThreadTime = setterInterrupt.begin;
                                                    setterInterrupt.addState(SYNCHRONIZE_STATE.EQUAL_TIME);
                                                    break;
                                            }
                                            $util.spliceArray(setterData, set => set !== setterInterrupt);
                                        }
                                    }
                                    let complete = false;
                                    let lastValue: AnimateValue | undefined;
                                    if (maxThreadTime > maxTime && !item.hasState(SYNCHRONIZE_STATE.INVALID)) {
                                        if (transforming) {
                                            if (item === backwards && item === previousTransform) {
                                                previousTransform = undefined;
                                            }
                                            else if (previousTransform) {
                                                resetTransform(item.additiveSum, Math.max(begin - 1, maxTime), TRANSFORM.valueAsInitial(previousTransform.type));
                                                startTime = maxTime + 1;
                                            }
                                            setFreezeResetValue(item.type, TRANSFORM.valueAsInitial(item.type), true);
                                        }
                                        let parallel = maxTime !== -1;
                                        complete = true;
                                        threadTimeExceeded: {
                                            for (let k = Math.floor(Math.max(0, Math.max(0, maxTime) - begin) / duration); k < repeatTotal; k++) {
                                                for (let l = 0; l < item.keyTimes.length; l++) {
                                                    const keyTime = item.keyTimes[l];
                                                    let time: number | undefined;
                                                    let value = getItemValue(item, baseValue, k, l);
                                                    if (k === repeatTotal - 1 && repeatFraction > 0) {
                                                        if (repeatFraction > keyTime) {
                                                            for (let m = l + 1; m < item.keyTimes.length; m++) {
                                                                if (repeatFraction <= item.keyTimes[m]) {
                                                                    time = durationTotal;
                                                                    actualMaxTime = time;
                                                                    value = getSplitValue(repeatFraction, keyTime, value, item.keyTimes[m], getItemValue(item, baseValue, k, m));
                                                                    repeatFraction = -1;
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                        else if (repeatFraction === keyTime) {
                                                            repeatFraction = -1;
                                                        }
                                                    }
                                                    if (time === undefined) {
                                                        time = getItemTime(begin, duration, item.keyTimes, k, l);
                                                        if (time < 0 || time < maxTime) {
                                                            continue;
                                                        }
                                                        if (time > actualMaxTime) {
                                                            actualMaxTime = time;
                                                        }
                                                        if (time === maxThreadTime) {
                                                            complete = k === repeatTotal - 1 && l === item.keyTimes.length - 1;
                                                        }
                                                        else {
                                                            function adjustNumberValue(splitTime: number) {
                                                                [maxTime, lastValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, k, splitTime, useKeyTime);
                                                            }
                                                            if (begin < 0 && maxTime === -1) {
                                                                if (time > 0) {
                                                                    actualMaxTime = 0;
                                                                    adjustNumberValue(0);
                                                                }
                                                            }
                                                            else {
                                                                if (time > maxThreadTime) {
                                                                    actualMaxTime = maxThreadTime;
                                                                    adjustNumberValue(maxThreadTime + (maxThreadTime === groupBegin[i + 1] && !repeatingMap[attr].has(maxThreadTime - 1) ? -1 : 0));
                                                                    complete = false;
                                                                    break threadTimeExceeded;
                                                                }
                                                                else {
                                                                    if (parallel) {
                                                                        if (begin >= maxTime) {
                                                                            time = Math.max(begin, maxTime + 1);
                                                                            actualMaxTime = begin;
                                                                        }
                                                                        else if (time === maxTime) {
                                                                            time = maxTime + 1;
                                                                        }
                                                                        else {
                                                                            if (begin < 0) {
                                                                                actualMaxTime += begin;
                                                                            }
                                                                            adjustNumberValue(maxTime);
                                                                        }
                                                                        parallel = false;
                                                                    }
                                                                    else if (k > 0 && l === 0) {
                                                                        if (item.accumulateSum) {
                                                                            insertInterpolator(repeatingInterpolatorMap, item, time, l, useKeyTime);
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
                                                        if (l === item.keyTimes.length - 1) {
                                                            checkIncomplete(time);
                                                            if (!item.accumulateSum && (k < repeatTotal - 1 || incomplete.length === 0 && item.fillReplace)) {
                                                                time--;
                                                            }
                                                        }
                                                        maxTime = setTimelineValue(repeatingMap[attr], time, value);
                                                        insertInterpolator(repeatingInterpolatorMap, item, maxTime, l, useKeyTime);
                                                        lastValue = value;
                                                    }
                                                    if (!complete || repeatFraction === -1) {
                                                        break threadTimeExceeded;
                                                    }
                                                }
                                            }
                                        }
                                        checkIncomplete();
                                    }
                                    if (lastValue !== undefined) {
                                        baseValue = lastValue;
                                        if (transforming) {
                                            setTimeRange(item.type, startTime, maxTime);
                                            previousTransform = item;
                                        }
                                    }
                                    if (setterInterrupt) {
                                        if (setterInterrupt.hasState(SYNCHRONIZE_STATE.EQUAL_TIME)) {
                                            lastValue = setterInterrupt.to;
                                            maxTime = setSetterValue(setterInterrupt.begin, lastValue);
                                            actualMaxTime = maxTime;
                                            setFreezeResetValue((<SvgAnimateTransform> setterInterrupt).type, lastValue);
                                        }
                                        else if (item.hasState(SYNCHRONIZE_STATE.INVALID)) {
                                            setTimeRange((<SvgAnimateTransform> setterInterrupt).type, maxTime);
                                        }
                                        $util.spliceArray(incomplete, previous => previous.element === undefined);
                                    }
                                    if (!item.fillReplace) {
                                        for (let k = 0; k < setterData.length; k++) {
                                            const set = setterData[k];
                                            if (set.begin >= actualStartTime && set.begin <= actualMaxTime) {
                                                setFreezeResetValue((<SvgAnimateTransform> set).type, set.to);
                                                setterData.splice(k--, 1);
                                            }
                                        }
                                    }
                                    if (indefinite) {
                                        if (complete) {
                                            indefiniteMap[attr] = item;
                                            break attributeEnd;
                                        }
                                        else {
                                            incomplete.length = 0;
                                            incomplete.push(item);
                                        }
                                    }
                                    else {
                                        if (complete) {
                                            nextBeginTime = nextBeginTime || Number.POSITIVE_INFINITY;
                                            setComplete(item, nextBeginTime);
                                            for (let k = i; k < groupBegin.length; k++) {
                                                if (groupBegin[k] <= maxTime) {
                                                    if (maxTime + 1 < nextBeginTime) {
                                                        for (let l = 0; l < groupData[k].items.length; l++) {
                                                            const pending = groupData[k].items[l];
                                                            if (getDurationTotal(pending) > maxTime && !pending.hasState(SYNCHRONIZE_STATE.COMPLETE, SYNCHRONIZE_STATE.INVALID)) {
                                                                incomplete.push(pending);
                                                            }
                                                        }
                                                    }
                                                    groupBegin[k] = Number.POSITIVE_INFINITY;
                                                    groupData[k].items.length = 0;
                                                }
                                            }
                                            if (incomplete.length) {
                                                sortIncomplete();
                                                const nextItem = <SvgAnimate> incomplete.shift();
                                                begin = nextItem.begin;
                                                groupData[i].items = [nextItem];
                                                j = -1;
                                            }
                                        }
                                        else {
                                            item.addState(SYNCHRONIZE_STATE.INTERRUPTED);
                                            incomplete.push(item);
                                        }
                                    }
                                }
                            }
                            if (incomplete.length) {
                                checkIncomplete();
                                sortIncomplete();
                                for (let i = 0; i < incomplete.length; i++) {
                                    const item = <SvgAnimateTransform> incomplete[i];
                                    const begin = item.begin;
                                    const duration = item.duration;
                                    const durationTotal = maxTime - begin;
                                    let maxThreadTime = Number.POSITIVE_INFINITY;
                                    function insertKeyTimes() {
                                        const startTime = maxTime + 1;
                                        let j = Math.floor(durationTotal / duration);
                                        let joined = false;
                                        freezeMap[attr] = 0;
                                        do {
                                            for (let k = 0; k < item.keyTimes.length; k++) {
                                                let time = getItemTime(begin, duration, item.keyTimes, j, k);
                                                if (!joined && time >= maxTime) {
                                                    [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, j, maxTime, useKeyTime);
                                                    joined = true;
                                                }
                                                if (joined) {
                                                    if (time >= maxThreadTime) {
                                                        if (maxThreadTime > maxTime) {
                                                            [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, j, maxThreadTime, useKeyTime);
                                                            actualMaxTime = maxThreadTime;
                                                        }
                                                        return;
                                                    }
                                                    if (time > maxTime) {
                                                        actualMaxTime = time;
                                                        if (k === item.keyTimes.length - 1 && time < maxThreadTime) {
                                                            time--;
                                                        }
                                                        baseValue = getItemValue(item, baseValue, j, k);
                                                        maxTime = setTimelineValue(repeatingMap[attr], time, baseValue);
                                                        insertInterpolator(repeatingInterpolatorMap, item, maxTime, k, useKeyTime);
                                                    }
                                                }
                                            }
                                        }
                                        while (maxTime < maxThreadTime && ++j);
                                        if (transforming) {
                                            setTimeRange((<SvgAnimateTransform> item).type, startTime, maxTime);
                                        }
                                    }
                                    if (item.repeatCount === -1) {
                                        if (durationTotal > 0 && durationTotal % item.duration !== 0) {
                                            maxThreadTime = begin + item.duration * Math.ceil(durationTotal / duration);
                                            insertKeyTimes();
                                        }
                                        indefiniteMap[attr] = item;
                                        break attributeEnd;
                                    }
                                    else {
                                        maxThreadTime = Math.min(begin + item.duration * item.repeatCount, item.end || Number.POSITIVE_INFINITY);
                                        if (maxThreadTime > maxTime) {
                                            insertKeyTimes();
                                            setComplete(item);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    {
                        const keyTimesRepeating: number[] = [];
                        for (const attr in repeatingMap) {
                            keyTimesRepeating.push(...repeatingMap[attr].keys());
                        }
                        let repeatingEndTime = $util.maxArray(keyTimesRepeating);
                        if (Object.keys(indefiniteMap).length) {
                            const begin: number[] = [];
                            const duration: number[] = [];
                            for (const attr in indefiniteMap) {
                                begin.push(indefiniteMap[attr].begin);
                                duration.push(indefiniteMap[attr].duration);
                            }
                            if (repeatingAnimations.size === 0 && begin[0] === keyTimesRepeating[0] && new Set(begin).size === 1 && new Set(duration).size === 1) {
                                repeatingAsIndefinite = begin[0] <= 0 ? 0 : begin[0];
                            }
                            else {
                                if (duration.length > 1) {
                                    repeatingEndTime = getLeastCommonMultiple(duration, begin);
                                }
                                else if ((repeatingEndTime - begin[0]) % duration[0] !== 0) {
                                    repeatingEndTime = duration[0] * Math.ceil(repeatingEndTime / duration[0]);
                                }
                            }
                        }
                        if (repeatingAsIndefinite === undefined) {
                            for (const attr in repeatingMap) {
                                let maxTime = Array.from(repeatingMap[attr].keys()).pop() as number;
                                if (indefiniteMap[attr]) {
                                    if (maxTime < repeatingEndTime) {
                                        const item = indefiniteMap[attr];
                                        const begin = item.begin;
                                        const startTime = maxTime + 1;
                                        let baseValue = <AnimateValue> Array.from(repeatingMap[attr].values()).pop();
                                        let i = Math.floor((maxTime - begin) / item.duration);
                                        do {
                                            let joined = false;
                                            for (let j = 0; j < item.keyTimes.length; j++) {
                                                let time = getItemTime(begin, item.duration, item.keyTimes, i, j);
                                                if (!joined && time >= maxTime) {
                                                    [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, i, maxTime, useKeyTime);
                                                    keyTimesRepeating.push(maxTime);
                                                    joined = true;
                                                }
                                                if (joined && time > maxTime) {
                                                    if (j === item.keyTimes.length - 1 && time < repeatingEndTime) {
                                                        time--;
                                                    }
                                                    baseValue = getItemValue(item, baseValue, i, j);
                                                    maxTime = setTimelineValue(repeatingMap[attr], time, baseValue);
                                                    insertInterpolator(repeatingInterpolatorMap, item, time, j, useKeyTime);
                                                    keyTimesRepeating.push(maxTime);
                                                }
                                            }
                                        }
                                        while (maxTime < repeatingEndTime && ++i);
                                        if (transforming) {
                                            setTimeRange((<SvgAnimateTransform> item).type, startTime, maxTime);
                                        }
                                    }
                                }
                                else if (freezeMap[attr] === 0) {
                                    let type: number | undefined;
                                    let value: AnimateValue | undefined;
                                    if (freezeResetMap[attr]) {
                                        type = freezeResetMap[attr].ordinal;
                                        value = freezeResetMap[attr].value;
                                    }
                                    else {
                                        if (transforming) {
                                            type = Array.from(animateTimeRangeMap.values()).pop() as number;
                                            value = TRANSFORM.valueAsInitial(type);
                                        }
                                        else {
                                            value = this._getBaseValue(attr, path);
                                        }
                                    }
                                    if (value !== undefined && JSON.stringify(repeatingMap[attr].get(maxTime)) !== JSON.stringify(value)) {
                                        maxTime = setTimelineValue(repeatingMap[attr], maxTime, value);
                                        setTimeRange(type, maxTime);
                                        keyTimesRepeating.push(maxTime);
                                    }
                                }
                            }
                        }
                        const keyTimes = sortNumber(Array.from(new Set(keyTimesRepeating)));
                        const timelineMap: TimelineMap = {};
                        for (const attr in repeatingMap) {
                            const insertMap = new Map<number, AnimateValue>();
                            const maxTime = Array.from(repeatingMap[attr].keys()).pop() as number;
                            for (let i = 0; i < keyTimes.length; i++) {
                                const keyTime = keyTimes[i];
                                if (keyTime <= maxTime) {
                                    const value = repeatingMap[attr].get(keyTime);
                                    if (value === undefined) {
                                        if (keyTime === 0) {
                                            if (baseValueMap[attr] !== undefined) {
                                                insertMap.set(0, baseValueMap[attr]);
                                            }
                                        }
                                        else {
                                            insertSplitTimeValue(repeatingMap[attr], insertMap, keyTime);
                                        }
                                    }
                                    else {
                                        insertMap.set(keyTime, value);
                                    }
                                }
                            }
                            timelineMap[attr] = insertMap;
                        }
                        repeatingResult = createKeyTimeMap(timelineMap, keyTimes);
                    }
                    if (repeatingAsIndefinite === undefined && Object.keys(indefiniteMap).length) {
                        const timelineMap: TimelineMap = {};
                        const indefiniteAnimations: SvgAnimate[] = [];
                        let keyTimes: number[] = [];
                        for (const attr in indefiniteMap) {
                            indefiniteAnimations.push(indefiniteMap[attr]);
                        }
                        const maxDuration = getLeastCommonMultiple(indefiniteAnimations.map(item => item.duration));
                        for (const item of indefiniteAnimations) {
                            const attr = item.attributeName;
                            let baseValue: AnimateValue;
                            if (repeatingMap[attr]) {
                                baseValue = <AnimateValue> Array.from(repeatingMap[attr].values()).pop();
                            }
                            else {
                                baseValue = SvgBuild.asAnimateTransform(item) ? TRANSFORM.valueAsInitial(item.type) : this._getBaseValue(attr, path);
                            }
                            timelineMap[attr] = new Map<number, AnimateValue>();
                            let maxTime = 0;
                            let i = 0;
                            do {
                                for (let j = 0; j < item.keyTimes.length; j++) {
                                    let time = getItemTime(0, item.duration, item.keyTimes, i, j);
                                    if (j === item.keyTimes.length - 1 && time < maxDuration) {
                                        time--;
                                    }
                                    baseValue = getItemValue(item, baseValue, i, j);
                                    maxTime = setTimelineValue(timelineMap[attr], time, baseValue);
                                    insertInterpolator(indefiniteInterpolatorMap, item, maxTime, j, useKeyTime);
                                    keyTimes.push(maxTime);
                                }
                            }
                            while (maxTime < maxDuration && ++i);
                        }
                        if (indefiniteAnimations.every(item => item.alternate)) {
                            let maxTime = -1;
                            for (const attr in indefiniteMap) {
                                const times = Array.from(timelineMap[attr].keys());
                                const values = Array.from(timelineMap[attr].values()).reverse();
                                for (let i = 0; i < times.length; i++) {
                                    if (times[i] !== 0) {
                                        maxTime = maxDuration + times[i];
                                        const interpolator = indefiniteInterpolatorMap.get(times[i]);
                                        if (interpolator) {
                                            indefiniteInterpolatorMap.set(maxTime, interpolator);
                                        }
                                        maxTime = setTimelineValue(timelineMap[attr], maxTime, values[i]);
                                        keyTimes.push(maxTime);
                                    }
                                }
                            }
                        }
                        keyTimes = sortNumber(Array.from(new Set(keyTimes)));
                        for (const attr in timelineMap) {
                            for (const keyTime of keyTimes) {
                                if (!timelineMap[attr].has(keyTime)) {
                                    insertSplitTimeValue(timelineMap[attr], timelineMap[attr], keyTime);
                                }
                            }
                        }
                        indefiniteResult = createKeyTimeMap(timelineMap, keyTimes, freezeResetMap);
                    }
                    if (repeatingResult || indefiniteResult) {
                        this._removeAnimations(conflicted);
                        const timeRange = Array.from(animateTimeRangeMap.entries());
                        const synchronizedName = Array.from(conflicted.map(item => SvgBuild.asAnimateTransform(item) ? TRANSFORM.typeAsName(item.type) : item.attributeName)).join('-');
                        [repeatingResult, indefiniteResult].forEach(result => {
                            if (result) {
                                const repeating = result === repeatingResult;
                                const interpolatorMap = repeating ? repeatingInterpolatorMap : indefiniteInterpolatorMap;
                                if (isKeyTimeFormat(transforming, useKeyTime)) {
                                    const keySplines: string[] = [];
                                    if (transforming) {
                                        const transformMap: KeyTimeMap[] = [];
                                        {
                                            const entries = Array.from(result.entries());
                                            if (repeating) {
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
                                            else if (indefiniteMap['transform']) {
                                                const map = new Map<number, Map<number, AnimateValue>>();
                                                for (let i = 0; i < entries.length; i++) {
                                                    map.set(entries[i][0], new Map([[(<SvgAnimateTransform> indefiniteMap['transform']).type, entries[i][1].values().next().value as string]]));
                                                }
                                                transformMap.push(map);
                                            }
                                            else {
                                                return;
                                            }
                                        }
                                        let previousEndTime = 0;
                                        for (let i = 0; i < transformMap.length; i++) {
                                            const entries = Array.from(transformMap[i].entries());
                                            let begin = entries[0][0];
                                            if (entries.length === 1) {
                                                if (i < transformMap.length - 1) {
                                                    entries.push([transformMap[i + 1].keys().next().value, entries[0][1]]);
                                                }
                                                else {
                                                    entries.push([begin + 1, entries[0][1]]);
                                                }
                                            }
                                            const endTime = entries[entries.length - 1][0];
                                            let duration = endTime - begin;
                                            const animate = new SvgAnimateTransform();
                                            animate.attributeName = 'transform';
                                            animate.type = entries[0][1].keys().next().value as number;
                                            for (const item of entries) {
                                                const interpolator = interpolatorMap.get(item[0]);
                                                if (interpolator) {
                                                    keySplines.push(interpolator);
                                                    interpolatorMap.delete(item[0]);
                                                }
                                                else {
                                                    keySplines.push('');
                                                }
                                                item[0] -= begin;
                                            }

                                            for (const [keyTime, data] of convertToFraction(entries)) {
                                                animate.keyTimes.push(keyTime);
                                                animate.values.push(data.values().next().value as string);
                                            }
                                            begin -= previousEndTime;
                                            if (begin > 1) {
                                                animate.begin = begin;
                                            }
                                            else if (begin === 1 && (duration + 1) % 10 === 0) {
                                                duration++;
                                            }
                                            animate.duration = duration;
                                            animate.keySplines = keySplines;
                                            animate.synchronized = { ordinal: i, value: '' };
                                            previousEndTime = endTime;
                                            this._insertAnimate(animate, repeating);
                                        }
                                    }
                                    else {
                                        const begin = repeatingAsIndefinite || 0;
                                        const entries = Array.from(result.entries());
                                        let object: SvgAnimate | undefined;
                                        for (const item of entries) {
                                            const interpolator = interpolatorMap.get(item[0]);
                                            if (interpolator) {
                                                keySplines.push(interpolator);
                                                interpolatorMap.delete(item[0]);
                                            }
                                            else {
                                                keySplines.push('');
                                            }
                                            item[0] -= begin;
                                        }
                                        result = convertToFraction(entries);
                                        if (path) {
                                            const pathData = getPathData(result, path, this.parent);
                                            if (pathData) {
                                                object = new SvgAnimate();
                                                object.attributeName = 'd';
                                                for (const item of pathData) {
                                                    object.keyTimes.push(item.ordinal);
                                                    object.values.push(item.value.toString());
                                                }
                                            }
                                            else {
                                                return;
                                            }
                                        }
                                        else {
                                            const animate = new SvgAnimateTransform();
                                            animate.attributeName = 'transform';
                                            animate.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                            for (const [keyTime, data] of result.entries()) {
                                                const x = data.get('x') as number || 0;
                                                const y = data.get('y') as number || 0;
                                                animate.keyTimes.push(keyTime);
                                                animate.values.push(this.parent ? `${this.parent.refitX(x)} ${this.parent.refitX(y)}` : `${x} ${y}`);
                                            }
                                            object = animate;
                                        }
                                        object.begin = begin;
                                        object.keySplines = keySplines;
                                        object.duration = entries[entries.length - 1][0];
                                        this._insertAnimate(object, repeating);
                                    }
                                }
                                else if (isFromToFormat(transforming, useKeyTime)) {
                                    const entries = Array.from(result.entries());
                                    for (let i = 0; i < entries.length - 1; i++) {
                                        const [keyTimeFrom, dataFrom] = entries[i];
                                        const [keyTimeTo, dataTo] = entries[i + 1];
                                        let object: SvgAnimate | undefined;
                                        let value = synchronizedName;
                                        if (transforming) {
                                            const animate = new SvgAnimateTransform();
                                            animate.attributeName = 'transform';
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
                                            else if (indefiniteMap['transform']) {
                                                animate.type = (<SvgAnimateTransform> indefiniteMap['transform']).type;
                                            }
                                            if (animate.type === 0) {
                                                continue;
                                            }
                                            animate.values = [dataFrom.values().next().value as string, dataTo.values().next().value as string];
                                            object = animate;
                                        }
                                        else {
                                            if (path) {
                                                const map = new Map<number, Map<string, AnimateValue>>();
                                                map.set(keyTimeFrom, dataFrom);
                                                map.set(keyTimeTo, dataTo);
                                                const pathData = getPathData(map, path, this.parent);
                                                if (pathData) {
                                                    object = new SvgAnimate();
                                                    object.attributeName = 'd';
                                                    object.values = pathData.map(item => item.value.toString());
                                                }
                                                else {
                                                    continue;
                                                }
                                            }
                                            else {
                                                const animate = new SvgAnimateTransform();
                                                animate.attributeName = 'transform';
                                                animate.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                                animate.values = [dataFrom, dataTo].map(data => {
                                                    const x = data.get('x') as number || 0;
                                                    const y = data.get('y') as number || 0;
                                                    return this.parent ? `${this.parent.refitX(x)} ${this.parent.refitX(y)}` : `${x} ${y}`;
                                                });
                                                value += i;
                                                object = animate;
                                            }
                                        }
                                        if (repeating) {
                                            object.begin = i === 0 ? keyTimeFrom : 0;
                                        }
                                        object.duration = keyTimeTo - keyTimeFrom;
                                        object.keyTimes = [0, 1];
                                        object.synchronized = { ordinal: i, value };
                                        const interpolator = interpolatorMap.get(keyTimeTo);
                                        if (interpolator) {
                                            object.keySplines = [interpolator];
                                            interpolatorMap.delete(keyTimeTo);
                                        }
                                        this._insertAnimate(object, repeating);
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }

        private _removeAnimations(values: SvgAnimation[]) {
            if (values.length) {
                $util.retainArray(this.animation, (item: SvgAnimation) => !values.includes(item));
            }
        }

        private _insertAnimate(item: SvgAnimate, repeating: boolean) {
            if (!repeating) {
                item.repeatCount = -1;
            }
            item.from = item.values[0];
            item.to = item.values[item.values.length - 1];
            this.animation.push(item);
        }

        private _getBaseValue(attr: string, path?: SvgPath) {
            let value: UndefNull<AnimateValue>;
            try {
                value = (path || <SvgBaseVal> (this as unknown)).getBaseValue(attr);
            }
            catch {
            }
            return value !== undefined && value !== null ? value : (attr === 'points' ? [{ x: 0, y: 0 }] : 0);
        }
    };
};