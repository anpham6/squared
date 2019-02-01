import { SvgPoint } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateTransform from './svganimatetransform';

import SvgBuild from './svgbuild';
import SvgPath from './svgpath';

import { SYNCHRONIZE_MODE, SYNCHRONIZE_STATE, FILL_MODE } from './lib/constant';
import { SVG, getLeastCommonMultiple, getTransformName, getTransformOrigin, sortNumber, getTransformInitialValue } from './lib/util';

type SvgAnimation = squared.svg.SvgAnimation;
type SvgBaseVal = squared.svg.SvgBaseVal;
type SvgContainer = squared.svg.SvgContainer;

type AnimateValue = number | Point[] | string;
type TimelineIndex = Map<number, AnimateValue>;
type TimelineMap = ObjectMap<TimelineIndex>;
type KeyTimeMap = Map<number, Map<any, AnimateValue>>;
type FreezeMap = ObjectMap<number>;
type InterpolatorMap = Map<number, string>;

type GroupData = {
    duration: number;
    items: SvgAnimate[];
};

const $util = squared.lib.util;

function insertSplitTimeValue(map: TimelineMap, attr: string, insertMap: TimelineIndex, time: number) {
    let previous: NumberValue<AnimateValue> | undefined;
    let next: NumberValue<AnimateValue> | undefined;
    for (const [ordinal, value] of map[attr].entries()) {
        if (previous && time <= ordinal) {
            next = { ordinal, value };
            break;
        }
        if (time >= ordinal) {
            previous = { ordinal, value };
        }
    }
    if (previous && next) {
        setTimelineValue(insertMap, '', time, getSplitValue(time, previous.ordinal, next.ordinal, previous.value, next.value));
    }
    else if (previous) {
        setTimelineValue(insertMap, '', time, previous.value);
    }
}

function convertToFraction(entries: [number, Map<any, AnimateValue>][], total: number) {
    const result = new Map<number, Map<any, AnimateValue>>();
    for (const [time, data] of entries) {
        let fraction = time / total;
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
        baseVal.forEach(attr => {
            const value = data.get(attr) || path.getBaseValue(attr);
            if (value !== undefined) {
                values.push(value);
            }
        });
        if (values.length === baseVal.length) {
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
                    points = SvgBuild.applyTransforms(path.transformed, points, getTransformOrigin(path.element));
                }
                if (parent) {
                    parent.refitPoints(points);
                }
                switch (tagName) {
                    case 'line':
                    case 'polyline':
                        value = SvgBuild.getPolyline(points);
                        break;
                    case 'rect':
                    case 'polygon':
                        value = SvgBuild.getPolygon(points);
                        break;
                    case 'circle':
                    case 'ellipse':
                        const pt = <Required<SvgPoint>> points[0];
                        value = SvgBuild.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
                        break;
                }
                if (value !== undefined) {
                    result.push({ ordinal, value });
                }
            }
        }
        else {
            return undefined;
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

function getKeyTimeMap(map: TimelineMap, keyTimes: number[]) {
    const result = new Map<number, Map<string, AnimateValue>>();
    for (const keyTime of keyTimes) {
        const values = new Map<string, AnimateValue>();
        for (const attr in map) {
            const value = map[attr].get(keyTime) || getFreezeValue(map[attr], keyTime);
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

function getItemValue(item: SvgAnimate, index: number, baseValue: AnimateValue, iteration = 0) {
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
    else {
        const result: SvgPoint[] = [];
        values[index].trim().split(/\s+/).forEach(value => {
            const [x, y] = value.split(',').map(pt => parseFloat(pt));
            result.push({ x, y });
        });
        return result;
    }
}

function getSplitValue(fraction: number, previousFraction: number, nextFraction: number, previousValue: AnimateValue, nextValue: AnimateValue) {
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
                result.push(getSplitValue(fraction, previousFraction, nextFraction, previousArray[i], nextArray[i]) as number);
            }
            return result.join(' ');
        }
    }
    else if (Array.isArray(previousValue) && Array.isArray(nextValue)) {
        const result: Point[] = [];
        for (let i = 0; i < Math.min(previousValue.length, nextValue.length); i++) {
            result.push({
                x: getSplitValue(fraction, previousFraction, nextFraction, previousValue[i].x, nextValue[i].x) as number,
                y: getSplitValue(fraction, previousFraction, nextFraction, previousValue[i].y, nextValue[i].y) as number
            });
        }
        return result;
    }
    return previousValue;
}

function insertSplitKeyTimeValue(map: TimelineMap, attr: string, interpolatorMap: InterpolatorMap, item: SvgAnimate, baseValue: AnimateValue, begin: number, iteration: number, time: number, useKeyTime: number): [number, AnimateValue] {
    let actualTime: number;
    if (begin < 0) {
        actualTime = time - begin;
        begin = 0;
    }
    else {
        actualTime = time;
    }
    actualTime = getActualTime(item.duration, actualTime);
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
            keyTimes[nextIndex],
            getItemValue(item, previousIndex, baseValue, iteration),
            getItemValue(item, nextIndex, baseValue, iteration)
        );
    }
    else {
        nextIndex = previousIndex !== -1 ? previousIndex + 1 : keyTimes.length - 1;
        value = getItemValue(item, nextIndex, baseValue, iteration);
    }
    time = setTimelineValue(map, attr, time, value);
    insertInterpolator(interpolatorMap, item, time, nextIndex, useKeyTime);
    return [time, value];
}

function setTimelineValue(map: TimelineMap | TimelineIndex, attr: string, time: number, value: AnimateValue, freezeMap?: FreezeMap) {
    const insertMap = attr === '' ? map : map[attr];
    const stored = insertMap.get(time);
    if (typeof stored === 'number' && Math.round(stored) === Math.round(value as number)) {
        return time;
    }
    if (stored !== value) {
        while (insertMap.has(time)) {
            time++;
        }
        insertMap.set(time, value);
        if (freezeMap && freezeMap[attr] === FILL_MODE.FREEZE) {
            freezeMap[attr] = 0;
        }
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
    return !item.paused && (item.element && item.duration !== -1 || item.keyTimes.length > 1 && item.duration > 0);
}

function getDurationTotal(item: SvgAnimate) {
    if (item.repeatCount !== -1) {
        return Math.min(item.begin + item.duration * item.repeatCount, item.end !== undefined ? item.end : Number.POSITIVE_INFINITY);
    }
    return Number.POSITIVE_INFINITY;
}

function getDurationMinimum(item: SvgAnimate) {
    return item.end !== undefined ? item.end - item.begin : item.duration * (item.repeatCount !== -1 ? item.repeatCount : 1);
}

function getFreezeValue(map: TimelineIndex, time: number) {
    for (const [freezeTime, value] of map.entries()) {
        if (time >= freezeTime) {
            return value;
        }
    }
    return undefined;
}

function getActualTime(duration: number, value: number) {
    const accuracy = duration % 1000 === 0 ? 1000 : 100;
    if (value + 1 % accuracy === 0) {
        value++;
    }
    else if (value - 1 % accuracy === 0) {
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
                if (index === 0 && $util.hasBit(useKeyTime, SYNCHRONIZE_MODE.IGNORE_ANIMATE) || index === 1 && $util.hasBit(useKeyTime, SYNCHRONIZE_MODE.IGNORE_TRANSFORM)) {
                    return;
                }
                function checkSingle(item: SvgAnimate) {
                    return item.alternate || item.end !== undefined;
                }
                const freezeMap: FreezeMap = {};
                const conflicted: SvgAnimate[] = [];
                let isolated: SvgAnimation[] = [];
                {
                    const included: SvgAnimate[] = [];
                    const excluded: SvgAnimate[] = [];
                    for (let i = 0; i < mergeable.length; i++) {
                        if (mergeable[i].isolated) {
                            mergeable[i].addState(SYNCHRONIZE_STATE.ISOLATED);
                            isolated.push(mergeable[i]);
                        }
                        else {
                            const itemA = <SvgAnimate> mergeable[i];
                            for (let j = 0; j < mergeable.length; j++) {
                                const itemB = <SvgAnimate> mergeable[j];
                                if (i !== j && itemA.attributeName === itemB.attributeName && itemA.animationName.ordinal < itemB.animationName.ordinal) {
                                    if (itemB.isolated) {
                                        if (itemA.begin === itemB.begin) {
                                            excluded[i] = itemA;
                                            break;
                                        }
                                    }
                                    else {
                                        if (!itemB.fillReplace || (itemA.begin === itemB.begin || itemB.fillBackwards) && (getDurationTotal(itemA) <= getDurationTotal(itemB) || itemB.repeatCount === -1)) {
                                            excluded[i] = itemA;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    for (let i = 0; i < mergeable.length; i++) {
                        if (included[i] || excluded[i] || mergeable[i].isolated) {
                            continue;
                        }
                        else {
                            const itemA = <SvgAnimate> mergeable[i];
                            const beginA = itemA.begin;
                            const timeA = getDurationTotal(itemA);
                            for (let j = 0; j < mergeable.length; j++) {
                                const itemB = <SvgAnimate> mergeable[j];
                                if (i !== j && !itemB.isolated && excluded[j] === undefined) {
                                    const beginB = itemB.begin;
                                    const timeB = getDurationTotal(itemB);
                                    if (itemA.repeatCount === -1 && itemB.repeatCount === -1) {
                                        included[i] = itemA;
                                        included[j] = itemB;
                                    }
                                    else if (itemA.repeatCount === -1) {
                                        if (beginA < timeB) {
                                            included[i] = itemA;
                                            included[j] = itemB;
                                        }
                                    }
                                    else if (beginA === beginB || beginA < beginB && timeA > beginB || beginA > beginB && beginA < timeB || beginA >= beginB && timeA <= timeB) {
                                        included[i] = itemA;
                                        included[j] = itemB;
                                    }
                                }
                            }
                        }
                    }
                    const removeable: SvgAnimation[] = [];
                    for (let i = 0; i < mergeable.length; i++) {
                        if (excluded[i] === undefined) {
                            if (included[i]) {
                                conflicted.push(included[i]);
                            }
                            else if (!mergeable[i].hasState(SYNCHRONIZE_STATE.ISOLATED)) {
                                mergeable[i].addState(SYNCHRONIZE_STATE.INDEPENDENT);
                            }
                        }
                        else {
                            removeable.push(mergeable[i]);
                        }
                    }
                    this.removeAnimations(removeable);
                }
                if (index === 0 || (conflicted.length > 1 || conflicted.length === 1 && checkSingle(conflicted[0]))) {
                    const transforming = SvgBuild.asAnimateTransform(conflicted[0]);
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
                            group.items = group.items.filter(item => !ignore.includes(item));
                            if (group.items.length) {
                                groupBegin.set(begin, group);
                            }
                        }
                        const groupSorted = new Map<number, GroupData>();
                        for (const begin of sortNumber(Array.from(groupBegin.keys()))) {
                            const group = groupBegin.get(begin);
                            if (group) {
                                const duration = $util.maxArray(group.items.map(item => getDurationMinimum(item)));
                                repeatingDuration = Math.max(repeatingDuration, begin + duration);
                                group.duration = duration;
                                group.items.reverse();
                                groupSorted.set(begin, group);
                            }
                        }
                        groupName[attr] = groupSorted;
                    }
                    const repeatingMap: TimelineMap = {};
                    const indefiniteMap: ObjectMap<NumberValue<SvgAnimate>> = {};
                    const repeatingInterpolatorMap = new Map<number, string>();
                    const indefiniteInterpolatorMap = new Map<number, string>();
                    const repeatingAnimations = new Set<SvgAnimate>();
                    const indefiniteAnimations: SvgAnimate[] = [];
                    const animateTimeRangeMap = new Map<number, number>();
                    let repeatingResult: KeyTimeMap | undefined;
                    let indefiniteResult: KeyTimeMap | undefined;
                    let indefiniteDuration = 0;
                    function setTimeRange(type: number, startTime: number, endTime?: number) {
                        if (type > 0) {
                            animateTimeRangeMap.set(startTime, type);
                            if (endTime !== undefined) {
                                animateTimeRangeMap.set(endTime, type);
                            }
                        }
                    }
                    const getBaseValue = (attr: string) => {
                        let value: UndefNull<AnimateValue>;
                        try {
                            value = (path || <SvgBaseVal> (this as unknown)).getBaseValue(attr);
                        }
                        catch {
                        }
                        return value !== undefined && value !== null ? value : (attr === 'points' ? [{ x: 0, y: 0 }] : 0);
                    };
                    for (const attr in groupName) {
                        repeatingMap[attr] = new Map<number, AnimateValue>();
                        freezeMap[attr] = 0;
                        const groupBegin = Array.from(groupName[attr].keys());
                        const groupData = Array.from(groupName[attr].values());
                        let incomplete: NumberValue<SvgAnimate>[] = [];
                        let maxTime = -1;
                        let nextBeginTime: number | undefined;
                        let resetValue: AnimateValue | undefined;
                        let baseValue!: AnimateValue;
                        let previousItem: SvgAnimateTransform | undefined;
                        const fillBackwards = conflicted.filter(item => item.fillBackwards && item.attributeName === attr);
                        if (fillBackwards.length) {
                            const item = fillBackwards.sort((a, b) => a.animationName.ordinal <= b.animationName.ordinal ? 1 : -1)[0];
                            item.addState(SYNCHRONIZE_STATE.BACKWARDS);
                            groupBegin.unshift(item.begin);
                            groupData.unshift({
                                duration: getDurationMinimum(item),
                                items: [item]
                            });
                            baseValue = getItemValue(item, 0, baseValue, 0);
                            setTimelineValue(repeatingMap, attr, 0, baseValue);
                        }
                        function setIsolatedValue(time: number, value: AnimateValue) {
                            freezeMap[attr] = FILL_MODE.FREEZE;
                            return setTimelineValue(repeatingMap, attr, time, value);
                        }
                        isolated.sort((a, b) => {
                            if (a.begin === b.begin) {
                                return a.animationName.ordinal < b.animationName.ordinal ? -1 : 1;
                            }
                            return a.begin < b.begin ? -1 : 1;
                        });
                        for (let i = 0; i < isolated.length; i++) {
                            const set = isolated[i];
                            if (set.begin <= groupBegin[0]) {
                                resetValue = set.to;
                                baseValue = resetValue;
                                if (set.begin < groupBegin[0] && fillBackwards.length === 0) {
                                    setIsolatedValue(set.begin, set.to);
                                }
                                isolated.splice(i--, 1);
                            }
                        }
                        if (!transforming) {
                            if (resetValue === undefined) {
                                resetValue = getBaseValue(attr);
                            }
                            if (baseValue === undefined) {
                                baseValue = resetValue;
                            }
                        }
                        function checkComplete(item: SvgAnimate, nextBegin?: number) {
                            item.addState(SYNCHRONIZE_STATE.COMPLETE);
                            repeatingAnimations.add(item);
                            incomplete = incomplete.filter(previous => getDurationTotal(previous.value) > maxTime);
                            if (item.fillForwards) {
                                item.addState(SYNCHRONIZE_STATE.FORWARDS);
                                freezeMap[attr] = FILL_MODE.FORWARDS;
                                return true;
                            }
                            else {
                                if (item.fillFreeze) {
                                    freezeMap[attr] = FILL_MODE.FREEZE;
                                }
                                if (nextBegin !== undefined) {
                                    const actualMaxTime = getActualTime(item.duration, maxTime);
                                    let modified = false;
                                    let replaceResetValue = resetValue;
                                    for (let i = 0; i < isolated.length; i++) {
                                        const set = isolated[i];
                                        if (set.begin >= maxTime) {
                                            if (set.begin === maxTime) {
                                                replaceResetValue = set.to;
                                            }
                                            resetValue = set.to;
                                            baseValue = resetValue;
                                            if (set.begin > actualMaxTime && set.begin < nextBegin) {
                                                setIsolatedValue(set.begin, set.to);
                                            }
                                            isolated.splice(i--, 1);
                                            modified = set.begin > maxTime;
                                        }
                                    }
                                    if (item.fillReplace && replaceResetValue !== undefined && nextBegin > actualMaxTime) {
                                        maxTime = setTimelineValue(repeatingMap, attr, maxTime, replaceResetValue, freezeMap);
                                        if (!modified) {
                                            baseValue = replaceResetValue;
                                        }
                                    }
                                }
                            }
                            return false;
                        }
                        function sortIncomplete() {
                            incomplete.sort((a, b) => a.value.animationName.ordinal <= b.value.animationName.ordinal ? 1 : -1);
                        }
                        function resetTransform(previous: SvgAnimateTransform, additiveSum: boolean, keySplineIndex?: number) {
                            if (!additiveSum && resetValue !== undefined) {
                                maxTime = setTimelineValue(repeatingMap, attr, ++maxTime, resetValue, freezeMap);
                                if (keySplineIndex !== undefined) {
                                    insertInterpolator(repeatingInterpolatorMap, previous, maxTime, keySplineIndex, useKeyTime);
                                }
                                setTimeRange(previous.type, maxTime);
                            }
                        }
                        attributeEnd: {
                            for (let i = 0; i < groupBegin.length; i++) {
                                if (groupData[i].items.length === 0) {
                                    continue;
                                }
                                let begin = groupBegin[i];
                                for (let j = 0; j < groupData[i].items.length; j++) {
                                    const item = groupData[i].items[j];
                                    if (item.hasState(SYNCHRONIZE_STATE.COMPLETE)) {
                                        continue;
                                    }
                                    const indefinite = item.repeatCount === -1;
                                    const duration = item.duration;
                                    const repeatCount = item.repeatCount;
                                    let durationTotal = duration;
                                    if (!indefinite) {
                                        durationTotal *= repeatCount;
                                        if (begin + Math.min(item.end || Number.POSITIVE_INFINITY, durationTotal) <= maxTime) {
                                            item.addState(SYNCHRONIZE_STATE.INVALID);
                                            continue;
                                        }
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
                                    nextBeginTime = groupBegin[i + 1] ? $util.minArray(groupBegin.slice(i + 1)) : undefined;
                                    let minRestartTime = 0;
                                    let isolatedInterrupt: SvgAnimation | undefined;
                                    if (item.animationSiblings) {
                                        const siblings = item.animationSiblings.filter(sibling => !sibling.hasState(SYNCHRONIZE_STATE.COMPLETE));
                                        if (siblings.length && item === siblings.pop()) {
                                            nextBeginTime = undefined;
                                        }
                                    }
                                    if (nextBeginTime !== undefined) {
                                        for (let k = i + 1; k < groupBegin.length; k++) {
                                            minRestartTime = Math.max(minRestartTime, groupBegin[k] + groupData[k].duration);
                                        }
                                    }
                                    let maxThreadTime = Math.min(nextBeginTime || Number.POSITIVE_INFINITY, item.end || Number.POSITIVE_INFINITY, item.repeatDuration !== -1 && item.repeatDuration < duration ? item.repeatDuration : Number.POSITIVE_INFINITY);
                                    let startTime = maxTime + 1;
                                    if (item.element) {
                                        const actualMaxTime = getActualTime(item.duration, maxTime);
                                        isolatedInterrupt = isolated.find(set => set.begin >= actualMaxTime && set.begin <= Math.min(nextBeginTime || Number.POSITIVE_INFINITY, maxThreadTime));
                                        if (isolatedInterrupt) {
                                            switch (isolatedInterrupt.begin) {
                                                case actualMaxTime:
                                                    resetValue = isolatedInterrupt.to;
                                                    baseValue = resetValue;
                                                    if (isolatedInterrupt.animationName.ordinal > item.animationName.ordinal && item.keyTimes[0] === 0) {
                                                        if (transforming && previousItem) {
                                                            resetTransform(previousItem, item.additiveSum, 0);
                                                        }
                                                        maxTime = setIsolatedValue(Math.max(isolatedInterrupt.begin, maxTime), baseValue);
                                                        startTime = maxTime;
                                                        item.addState(SYNCHRONIZE_STATE.INVALID);
                                                    }
                                                    break;
                                                case nextBeginTime:
                                                    isolatedInterrupt.addState(SYNCHRONIZE_STATE.EQUAL_TIME);
                                                    break;
                                                default:
                                                    maxThreadTime = isolatedInterrupt.begin;
                                                    isolatedInterrupt.addState(SYNCHRONIZE_STATE.EQUAL_TIME);
                                                    break;
                                            }
                                            isolated = isolated.filter(set => set !== isolatedInterrupt);
                                        }
                                    }
                                    let lastValue: AnimateValue | undefined;
                                    let complete = false;
                                    if (maxThreadTime > maxTime && !item.hasState(SYNCHRONIZE_STATE.INVALID)) {
                                        if (transforming) {
                                            if (previousItem) {
                                                resetTransform(previousItem, item.additiveSum, 0);
                                            }
                                            resetValue = getTransformInitialValue((<SvgAnimateTransform> item).type);
                                            baseValue = resetValue;
                                        }
                                        let parallel = maxTime !== -1;
                                        complete = true;
                                        threadTimeExceeded: {
                                            for (let k = Math.floor(Math.max(0, Math.max(0, maxTime) - begin) / duration); k < repeatTotal; k++) {
                                                for (let l = 0; l < item.keyTimes.length; l++) {
                                                    const keyTime = item.keyTimes[l];
                                                    let time: number | undefined;
                                                    let value = getItemValue(item, l, baseValue, k);
                                                    if (k === repeatTotal - 1 && repeatFraction > 0) {
                                                        if (repeatFraction > keyTime) {
                                                            for (let m = l + 1; m < item.keyTimes.length; m++) {
                                                                if (repeatFraction <= item.keyTimes[m]) {
                                                                    time = begin + durationTotal;
                                                                    value = getSplitValue(repeatFraction, keyTime, item.keyTimes[m], value, getItemValue(item, m, baseValue, k));
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
                                                        if (time < 0) {
                                                            continue;
                                                        }
                                                        if (time === maxThreadTime) {
                                                            complete = k === repeatTotal - 1 && l === item.keyTimes.length - 1;
                                                        }
                                                        else {
                                                            function adjustNumberValue(splitTime: number) {
                                                                [maxTime, lastValue] = insertSplitKeyTimeValue(repeatingMap, attr, repeatingInterpolatorMap, item, baseValue, begin, k, splitTime, useKeyTime);
                                                            }
                                                            if (begin < 0 && maxTime === -1) {
                                                                if (time > 0) {
                                                                    adjustNumberValue(0);
                                                                }
                                                            }
                                                            else {
                                                                if (time > maxThreadTime) {
                                                                    adjustNumberValue(maxThreadTime + (maxThreadTime === groupBegin[i + 1] && !repeatingMap[attr].has(maxThreadTime - 1) ? -1 : 0));
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
                                                                                adjustNumberValue(maxTime);
                                                                            }
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
                                                        if (l === item.keyTimes.length - 1 && (k < repeatTotal - 1 || incomplete.length === 0 && item.fillReplace) && !item.accumulateSum) {
                                                            time--;
                                                        }
                                                        maxTime = setTimelineValue(repeatingMap, attr, time, value, freezeMap);
                                                        insertInterpolator(repeatingInterpolatorMap, item, maxTime, l, useKeyTime);
                                                        lastValue = value;
                                                    }
                                                    if (!complete || repeatFraction === -1) {
                                                        break threadTimeExceeded;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (isolatedInterrupt) {
                                        if (isolatedInterrupt.hasState(SYNCHRONIZE_STATE.EQUAL_TIME)) {
                                            resetValue = isolatedInterrupt.to;
                                            lastValue = resetValue;
                                            maxTime = setIsolatedValue(isolatedInterrupt.begin, lastValue);
                                        }
                                        incomplete = incomplete.filter(previous => previous.value.element === undefined);
                                    }
                                    if (!item.fillReplace) {
                                        for (let k = 0; k < isolated.length; k++) {
                                            const set = isolated[k];
                                            if (set.begin >= getActualTime(duration, startTime) && set.begin <= getActualTime(duration, maxTime)) {
                                                resetValue = set.to;
                                                isolated.splice(k--, 1);
                                            }
                                        }
                                    }
                                    if (lastValue !== undefined) {
                                        baseValue = lastValue;
                                        if (transforming) {
                                            previousItem = <SvgAnimateTransform> (isolatedInterrupt || item);
                                            setTimeRange(previousItem.type, startTime, maxTime);
                                        }
                                        if (nextBeginTime === undefined && indefinite) {
                                            break attributeEnd;
                                        }
                                    }
                                    if (indefinite) {
                                        incomplete.length = 0;
                                        incomplete.push({ ordinal: begin, value: item });
                                    }
                                    else {
                                        if (complete) {
                                            if (transforming && previousItem) {
                                                resetTransform(previousItem, false);
                                                previousItem = undefined;
                                            }
                                            if (checkComplete(item, groupBegin[i + 1])) {
                                                break attributeEnd;
                                            }
                                            for (let k = i; k < groupBegin.length; k++) {
                                                if (groupBegin[k] <= maxTime) {
                                                    for (let l = 0; l < groupData[k].items.length; l++) {
                                                        const pending = groupData[k].items[l];
                                                        if (getDurationTotal(pending) > maxTime && !pending.hasState(SYNCHRONIZE_STATE.COMPLETE) && !pending.hasState(SYNCHRONIZE_STATE.INTERRUPTED) && !pending.hasState(SYNCHRONIZE_STATE.INVALID)) {
                                                            incomplete.push({ ordinal: groupBegin[k], value: pending });
                                                        }
                                                    }
                                                    groupBegin[k] = Number.POSITIVE_INFINITY;
                                                    groupData[k].items.length = 0;
                                                }
                                            }
                                            if (incomplete.length) {
                                                sortIncomplete();
                                                const nextItem = (<NumberValue<SvgAnimate>> incomplete.shift()).value;
                                                begin = nextItem.begin;
                                                groupData[i].items = [nextItem];
                                                j = -1;
                                            }
                                        }
                                        else {
                                            if (groupBegin[i] + durationTotal > minRestartTime) {
                                                item.addState(SYNCHRONIZE_STATE.INTERRUPTED);
                                                incomplete.push({ ordinal: begin, value: item });
                                            }
                                            else {
                                                item.addState(SYNCHRONIZE_STATE.COMPLETE);
                                            }
                                        }
                                    }
                                }
                            }
                            if (incomplete.length) {
                                sortIncomplete();
                                for (let i = 0; i < incomplete.length; i++) {
                                    const begin = incomplete[i].ordinal;
                                    const item = incomplete[i].value;
                                    const duration = item.duration;
                                    const durationTotal = maxTime - begin;
                                    let maxThreadTime = Number.POSITIVE_INFINITY;
                                    const insertKeyTimes = () => {
                                        const startTime = maxTime + 1;
                                        let j = Math.floor(durationTotal / duration);
                                        let joined = false;
                                        freezeMap[attr] = 0;
                                        do {
                                            for (let k = 0; k < item.keyTimes.length; k++) {
                                                let time = getItemTime(begin, duration, item.keyTimes, j, k);
                                                if (!joined && time >= maxTime) {
                                                    [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap, attr, repeatingInterpolatorMap, item, baseValue, begin, j, maxTime, useKeyTime);
                                                    joined = true;
                                                }
                                                if (joined) {
                                                    if (time >= maxThreadTime) {
                                                        if (maxThreadTime > maxTime) {
                                                            [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap, attr, repeatingInterpolatorMap, item, baseValue, begin, j, maxThreadTime, useKeyTime);
                                                        }
                                                        return;
                                                    }
                                                    if (time > maxTime) {
                                                        if (k === item.keyTimes.length - 1 && time < maxThreadTime && !repeatingMap[attr].has(time - 1)) {
                                                            time--;
                                                        }
                                                        baseValue = getItemValue(item, k, baseValue, j);
                                                        maxTime = setTimelineValue(repeatingMap, attr, time, baseValue);
                                                        insertInterpolator(repeatingInterpolatorMap, item, maxTime, k, useKeyTime);
                                                    }
                                                }
                                            }
                                        }
                                        while (maxTime < maxThreadTime && ++j);
                                        if (transforming) {
                                            setTimeRange((<SvgAnimateTransform> item).type, startTime, maxTime);
                                        }
                                    };
                                    if (item.repeatCount === -1) {
                                        if (durationTotal > 0 && durationTotal % item.duration !== 0) {
                                            maxThreadTime = begin + item.duration * Math.ceil(durationTotal / duration);
                                            insertKeyTimes();
                                        }
                                        indefiniteMap[attr] = { ordinal: begin, value: item };
                                        break attributeEnd;
                                    }
                                    else {
                                        maxThreadTime = Math.min(begin + item.duration * item.repeatCount, item.end || Number.POSITIVE_INFINITY);
                                        if (maxThreadTime > maxTime) {
                                            insertKeyTimes();
                                            if (checkComplete(item)) {
                                                break attributeEnd;
                                            }
                                            else if (item.fillFreeze) {
                                                for (let j = i; j < incomplete.length; j++) {
                                                    if (incomplete[j].value.element) {
                                                        incomplete.splice(j--, 1);
                                                    }
                                                }
                                            }
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
                                begin.push(indefiniteMap[attr].ordinal);
                                duration.push(indefiniteMap[attr].value.duration);
                            }
                            if (duration.length > 1) {
                                repeatingEndTime = getLeastCommonMultiple(duration, repeatingEndTime, begin);
                            }
                            else if (repeatingEndTime - begin[0] % duration[0] !== 0) {
                                repeatingEndTime = duration[0] * Math.ceil(repeatingEndTime / duration[0]);
                            }
                        }
                        for (const attr in repeatingMap) {
                            let maxTime = Array.from(repeatingMap[attr].keys()).pop() as number;
                            if (indefiniteMap[attr]) {
                                if (maxTime < repeatingEndTime) {
                                    const begin = indefiniteMap[attr].ordinal;
                                    const item = indefiniteMap[attr].value;
                                    const startTime = maxTime + 1;
                                    let baseValue = <AnimateValue> Array.from(repeatingMap[attr].values()).pop();
                                    let i = Math.floor((maxTime - begin) / item.duration);
                                    do {
                                        let joined = false;
                                        for (let j = 0; j < item.keyTimes.length; j++) {
                                            let time = getItemTime(begin, item.duration, item.keyTimes, i, j);
                                            if (!joined && time >= maxTime) {
                                                [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap, attr, repeatingInterpolatorMap, item, baseValue, begin, i, maxTime, useKeyTime);
                                                keyTimesRepeating.push(maxTime);
                                                joined = true;
                                            }
                                            if (joined && time > maxTime) {
                                                if (j === item.keyTimes.length - 1 && time < repeatingEndTime && !repeatingMap[attr][attr].has(time - 1)) {
                                                    time--;
                                                }
                                                baseValue = getItemValue(item, j, baseValue, i);
                                                maxTime = setTimelineValue(repeatingMap, attr, time, baseValue);
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
                                let type = 0;
                                let value: AnimateValue | undefined;
                                if (transforming) {
                                    type = Array.from(animateTimeRangeMap.values()).pop() as number;
                                    value = getTransformInitialValue(type);
                                }
                                else {
                                    const repeat = Array.from(repeatingAnimations).reverse().find(item => item.attributeName === attr);
                                    if (repeat && repeat.element === undefined) {
                                        const from = repeat.values[0] || repeat.from;
                                        if ($util.isNumber(from)) {
                                            value = parseFloat(from);
                                        }
                                        else {
                                            value = SvgBuild.convertNumberList(SvgBuild.toNumberList(from));
                                            if (value.length === 0) {
                                                value = undefined;
                                            }
                                        }
                                    }
                                    else {
                                        value = getBaseValue(attr);
                                    }
                                }
                                if (value !== undefined && JSON.stringify(repeatingMap[attr].get(maxTime)) !== JSON.stringify(value)) {
                                    maxTime = setTimelineValue(repeatingMap, attr, maxTime, value);
                                    setTimeRange(type, maxTime);
                                    keyTimesRepeating.push(maxTime);
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
                                        insertSplitTimeValue(repeatingMap, attr, insertMap, keyTime);
                                    }
                                    else {
                                        insertMap.set(keyTime, value);
                                    }
                                }
                            }
                            timelineMap[attr] = insertMap;
                        }
                        repeatingResult = getKeyTimeMap(timelineMap, keyTimes);
                        repeatingDuration = keyTimes[keyTimes.length - 1];
                    }
                    if (Object.keys(indefiniteMap).length) {
                        const timelineMap: TimelineMap = {};
                        let keyTimes: number[] = [];
                        for (const attr in indefiniteMap) {
                            indefiniteAnimations.push(indefiniteMap[attr].value);
                        }
                        indefiniteDuration = getLeastCommonMultiple(indefiniteAnimations.map(item => item.duration));
                        for (const item of indefiniteAnimations) {
                            const attr = item.attributeName;
                            let baseValue: AnimateValue;
                            if (repeatingMap[attr]) {
                                baseValue = <AnimateValue> Array.from(repeatingMap[attr].values()).pop();
                            }
                            else {
                                baseValue = SvgBuild.asAnimateTransform(item) ? getTransformInitialValue(item.type) : getBaseValue(attr);
                            }
                            timelineMap[attr] = new Map<number, AnimateValue>();
                            let maxTime = 0;
                            let i = 0;
                            do {
                                for (let j = 0; j < item.keyTimes.length; j++) {
                                    let time = getItemTime(0, item.duration, item.keyTimes, i, j);
                                    if (j === item.keyTimes.length - 1 && time < indefiniteDuration && !timelineMap[attr].has(time - 1)) {
                                        time--;
                                    }
                                    baseValue = getItemValue(item, j, baseValue, i);
                                    maxTime = setTimelineValue(timelineMap, attr, time, baseValue);
                                    insertInterpolator(indefiniteInterpolatorMap, item, maxTime, j, useKeyTime);
                                    keyTimes.push(maxTime);
                                }
                            }
                            while (maxTime < indefiniteDuration && ++i);
                        }
                        if (indefiniteAnimations.every(item => item.alternate)) {
                            let maxTime = -1;
                            for (const attr in indefiniteMap) {
                                const times = Array.from(timelineMap[attr].keys());
                                const values = Array.from(timelineMap[attr].values()).reverse();
                                for (let i = 0; i < times.length; i++) {
                                    if (times[i] !== 0) {
                                        maxTime = indefiniteDuration + times[i];
                                        const interpolator = indefiniteInterpolatorMap.get(times[i]);
                                        if (interpolator) {
                                            indefiniteInterpolatorMap.set(maxTime, interpolator);
                                        }
                                        maxTime = setTimelineValue(timelineMap, attr, maxTime, values[i]);
                                        keyTimes.push(maxTime);
                                    }
                                }
                            }
                            if (maxTime !== -1) {
                                indefiniteDuration = maxTime;
                            }
                        }
                        keyTimes = sortNumber(Array.from(new Set(keyTimes)));
                        for (const attr in timelineMap) {
                            const baseMap = timelineMap[attr];
                            for (let i = 1; i < keyTimes.length; i++) {
                                const keyTime = keyTimes[i];
                                if (!baseMap.has(keyTime)) {
                                    insertSplitTimeValue(timelineMap, attr, baseMap, keyTime);
                                }
                            }
                        }
                        indefiniteResult = getKeyTimeMap(timelineMap, keyTimes);
                    }
                    if (repeatingResult || indefiniteResult) {
                        this.removeAnimations(conflicted);
                        const sequentialName = Array.from(conflicted.map(item => SvgBuild.asAnimateTransform(item) ? getTransformName(item.type) : item.attributeName)).join('-');
                        const timeRange = Array.from(animateTimeRangeMap.entries());
                        let x = 0;
                        let y = 0;
                        if (!transforming && path === undefined) {
                            x = getBaseValue('x') as number || 0;
                            y = getBaseValue('y') as number || 0;
                        }
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
                        function getTransformType(timeFrom: number, timeTo: number) {
                            for (let i = 0; i < timeRange.length - 1; i++) {
                                const previous = timeRange[i];
                                const next = timeRange[i + 1];
                                if (previous[1] === next[1] && timeFrom >= previous[0] && timeTo <= next[0]) {
                                    return previous[1];
                                }
                                else if (timeTo - timeFrom === 1 && timeTo === next[0]) {
                                    return next[1];
                                }
                            }
                            return 0;
                        }
                        const insertAnimate = (item: SvgAnimate, repeating: boolean) => {
                            if (!repeating) {
                                item.repeatCount = -1;
                            }
                            item.from = item.values[0];
                            item.to = item.values[item.values.length - 1];
                            this.animation.push(item);
                        };
                        [repeatingResult, indefiniteResult].forEach(result => {
                            if (result) {
                                const repeating = result === repeatingResult;
                                const interpolatorMap = repeating ? repeatingInterpolatorMap : indefiniteInterpolatorMap;
                                if (isKeyTimeFormat(transforming, useKeyTime)) {
                                    const keySplines: string[] = [];
                                    if (transforming) {
                                        const keyTimeEntries = Array.from(result.entries());
                                        const transformMap: KeyTimeMap[] = [];
                                        if (repeating) {
                                            let type = timeRange[0][1];
                                            for (let i = 0, j = 0, k = 0; i < timeRange.length; i++) {
                                                const next = i < timeRange.length - 1 ? timeRange[i + 1][1] : -1;
                                                if (type === next) {
                                                    continue;
                                                }
                                                else {
                                                    const map = new Map<number, Map<number, AnimateValue>>();
                                                    for (let l = k; l < keyTimeEntries.length; l++) {
                                                        const keyTime = keyTimeEntries[l][0];
                                                        if (keyTime >= timeRange[j][0] && keyTime <= timeRange[i][0]) {
                                                            map.set(keyTime, new Map([[type, keyTimeEntries[l][1].values().next().value as string]]));
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
                                        else {
                                            const animateTransform = <SvgAnimateTransform> indefiniteAnimations.find(item => item.attributeName === 'transform');
                                            if (animateTransform) {
                                                const map = new Map<number, Map<number, AnimateValue>>();
                                                for (let i = 0; i < keyTimeEntries.length; i++) {
                                                    map.set(keyTimeEntries[i][0], new Map([[animateTransform.type, keyTimeEntries[i][1].values().next().value as string]]));
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
                                            const endTime = entries[entries.length - 1][0];
                                            let duration = endTime - begin;
                                            const object = new SvgAnimateTransform();
                                            object.attributeName = 'transform';
                                            object.type = entries[0][1].keys().next().value as number;
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
                                            for (const [keyTime, data] of convertToFraction(entries, duration)) {
                                                object.keyTimes.push(keyTime);
                                                object.values.push(data.values().next().value as string);
                                            }
                                            begin -= previousEndTime;
                                            if (begin > 1) {
                                                object.begin = begin;
                                            }
                                            else if (begin === 1 && (duration + 1) % 100 === 0) {
                                                duration++;
                                            }
                                            object.duration = duration;
                                            object.keySplines = keySplines;
                                            object.synchronized = { ordinal: i, value: '' };
                                            insertAnimate(object, repeating);
                                            previousEndTime = endTime;
                                        }
                                    }
                                    else {
                                        result = convertToFraction(Array.from(result.entries()), repeating ? repeatingDuration : indefiniteDuration);
                                        let object: SvgAnimate | undefined;
                                        if (path) {
                                            const pathData = getPathData(result, path, this.parent);
                                            if (pathData) {
                                                object = new SvgAnimate();
                                                object.attributeName = 'd';
                                                for (const item of pathData) {
                                                    object.keyTimes.push(item.ordinal);
                                                    object.values.push(item.value.toString());
                                                    const interpolator = interpolatorMap.get(item.ordinal);
                                                    if (interpolator) {
                                                        keySplines.push(interpolator);
                                                        interpolatorMap.delete(item.ordinal);
                                                    }
                                                    else {
                                                        keySplines.push('');
                                                    }
                                                }
                                            }
                                            else {
                                                return;
                                            }
                                        }
                                        else {
                                            object = new SvgAnimateTransform();
                                            object.attributeName = 'transform';
                                            (object as SvgAnimateTransform).type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                            for (const [keyTime, data] of result.entries()) {
                                                setXY(<Map<string, number>> data);
                                                object.keyTimes.push(keyTime);
                                                object.values.push(this.parent ? `${this.parent.refitX(x)} ${this.parent.refitX(y)}` : `${x} ${y}`);
                                                const interpolator = interpolatorMap.get(keyTime);
                                                if (interpolator) {
                                                    keySplines.push(interpolator);
                                                    interpolatorMap.delete(keyTime);
                                                }
                                                else {
                                                    keySplines.push('');
                                                }
                                            }
                                        }
                                        object.keySplines = keySplines;
                                        object.duration = repeating ? repeatingDuration : indefiniteDuration;
                                        insertAnimate(object, repeating);
                                    }
                                }
                                else if (isFromToFormat(transforming, useKeyTime)) {
                                    const keyTimeEntries = Array.from(result.entries());
                                    for (let i = 0, j = 0; i < keyTimeEntries.length - 1; i++) {
                                        const [keyTimeFrom, dataFrom] = keyTimeEntries[i];
                                        const [keyTimeTo, dataTo] = keyTimeEntries[i + 1];
                                        let object: SvgAnimate | undefined;
                                        let name = sequentialName;
                                        if (transforming) {
                                            const animate = new SvgAnimateTransform();
                                            animate.attributeName = 'transform';
                                            if (repeating) {
                                                animate.type = getTransformType(keyTimeFrom, keyTimeTo);
                                            }
                                            else if (indefiniteMap['transform']) {
                                                animate.type = (<SvgAnimateTransform> indefiniteMap['transform'].value).type;
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
                                                object = new SvgAnimateTransform();
                                                object.attributeName = 'transform';
                                                (object as SvgAnimateTransform).type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                                object.values = [dataFrom, dataTo].map(data => {
                                                    setXY(<Map<string, number>> data);
                                                    return this.parent ? `${this.parent.refitX(x)} ${this.parent.refitX(y)}` : `${x} ${y}`;
                                                });
                                                name += i;
                                            }
                                        }
                                        if (repeating) {
                                            object.begin = i === 0 ? keyTimeFrom : 0;
                                        }
                                        object.duration = keyTimeTo - keyTimeFrom;
                                        object.keyTimes = [0, 1];
                                        object.synchronized = { ordinal: j++, value: name };
                                        const interpolator = interpolatorMap.get(keyTimeTo);
                                        if (interpolator) {
                                            object.keySplines = [interpolator];
                                            interpolatorMap.delete(keyTimeTo);
                                        }
                                        insertAnimate(object, repeating);
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }

        private removeAnimations(values: SvgAnimation[]) {
            if (values.length) {
                $util.retainArray(this.animation, (item: SvgAnimation) => !values.includes(item));
            }
        }
    };
};