import { SvgPoint } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateTransform from './svganimatetransform';

import SvgBuild from './svgbuild';
import SvgPath from './svgpath';

import { FILL_MODE, SYNCHRONIZE_MODE } from './lib/constant';
import { SVG, getLeastCommonMultiple, getTransformName, getTransformOrigin, sortNumber, getTransformInitialValue } from './lib/util';

type SvgAnimation = squared.svg.SvgAnimation;
type SvgBaseVal = squared.svg.SvgBaseVal;
type SvgContainer = squared.svg.SvgContainer;

type AnimateValue = number | Point[] | string;
type TimelineIndex = Map<number, AnimateValue>;
type TimelineMap = ObjectMap<TimelineIndex>;
type KeyTimeMap = Map<number, Map<any, AnimateValue>>;
type FreezeMap = ObjectMap<NumberValue<AnimateValue>>;
type InterpolatorMap = Map<number, Set<string>>;

type GroupData = {
    duration: number;
    items: SvgAnimate[];
};

const $util = squared.lib.util;

function insertSplitTimeValue(map: TimelineIndex, insertMap: TimelineIndex, time: number) {
    let previous: NumberValue<AnimateValue> | undefined;
    let next: NumberValue<AnimateValue> | undefined;
    for (const [ordinal, value] of map.entries()) {
        if (previous && time <= ordinal) {
            next = { ordinal, value };
            break;
        }
        if (time >= ordinal) {
            previous = { ordinal, value };
        }
    }
    if (previous && next) {
        const value = getSplitValue(time, previous.ordinal, next.ordinal, previous.value, next.value);
        insertMap.set(time, value);
    }
    else if (previous) {
        insertMap.set(time, previous.value);
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

function getPathData(map: KeyTimeMap, path: SvgPath, parent?: SvgContainer, freezeMap?: FreezeMap) {
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
            let value = data.get(attr);
            if (value !== undefined) {
                values.push(value);
            }
            else if (freezeMap && freezeMap[attr]) {
                values.push(freezeMap[attr].value);
            }
            else {
                value = path.getBaseValue(attr);
                if (value !== undefined) {
                    values.push(value);
                }
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
                if (!values.has(attr) && keyTime >= freezeMap[attr].ordinal) {
                    values.set(attr, freezeMap[attr].value);
                }
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

function insertSplitKeyTimeValue(map: TimelineIndex, interpolatorMap: InterpolatorMap, item: SvgAnimate, baseValue: AnimateValue, begin: number, iteration: number, time: number, useKeyTime: number): [number, AnimateValue] {
    let actualTime: number;
    if (begin < 0) {
        actualTime = time - begin;
        begin = 0;
    }
    else {
        actualTime = time;
    }
    const accuracy = (item.duration % 1000 === 0 ? 1000 : 100);
    if (actualTime + 1 % accuracy === 0) {
        actualTime++;
    }
    else if (actualTime - 1 % accuracy === 0) {
        actualTime--;
    }
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
    if (map.get(time) !== value) {
        while (map.has(time)) {
            time++;
        }
        insertInterpolator(interpolatorMap, item, time, nextIndex, useKeyTime);
        map.set(time, value);
    }
    return [time, value];
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
        const values = map.get(time) || new Set<string>();
        values.add(value);
        map.set(time, values);
    }
}

function isKeyTimeFormat(transforming: boolean, useKeyTime: number) {
    return $util.hasBit(useKeyTime, transforming ? SYNCHRONIZE_MODE.KEYTIME_TRANSFORM : SYNCHRONIZE_MODE.KEYTIME_ANIMATE);
}

function isFromToFormat(transforming: boolean, useKeyTime: number) {
    return $util.hasBit(useKeyTime, transforming ? SYNCHRONIZE_MODE.FROMTO_TRANSFORM : SYNCHRONIZE_MODE.FROMTO_ANIMATE);
}

function playableAnimation(item: SvgAnimate) {
    return !SvgBuild.asSet(item) && !item.paused && item.begin.length > 0 && item.keyTimes.length > 1 && item.duration > 0;
}

function getDuration(item: SvgAnimate, begin = 0) {
    return item.repeatCount !== -1 ? Math.min(begin + item.duration * item.repeatCount, item.end !== undefined ? item.end : Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
}

function getGroupDuration(item: SvgAnimate) {
    return item.duration * (item.repeatCount !== -1 ? item.repeatCount : 1);
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
            return <SvgAnimateTransform[]> animation.filter(item => SvgBuild.asAnimateTransform(item) && item.begin.length > 0 && item.duration > 0);
        }

        public mergeAnimations(animations: SvgAnimate[], transformations: SvgAnimateTransform[], useKeyTime = 0, path?: SvgPath) {
            const removeAnimations = (values: SvgAnimate[]) => {
                $util.retainArray(this.animation, (item: SvgAnimate) => !values.includes(item));
            };
            const partitions: SvgAnimate[][] = [];
            [animations, transformations].forEach((mergeable, index) => {
                if (index === 0 && $util.hasBit(useKeyTime, SYNCHRONIZE_MODE.IGNORE_ANIMATE) || index === 1 && $util.hasBit(useKeyTime, SYNCHRONIZE_MODE.IGNORE_TRANSFORM)) {
                    return;
                }
                function checkSingle(item: SvgAnimate) {
                    return item.begin.length > 1 || item.alternate || item.end !== undefined || index === 0 && item.additiveSum;
                }
                if (mergeable.length > 1) {
                    if (mergeable.some(item => $util.hasBit(item.fillMode, FILL_MODE.BACKWARDS))) {
                        partitions.push(mergeable);
                    }
                    else {
                        const [css, smil] = $util.partitionArray(mergeable, item => item.element === undefined);
                        if (css.length && smil.length) {
                            if (css.some(item => item.repeatCount === -1)) {
                                removeAnimations(smil);
                                smil.length = 0;
                            }
                            else {
                                const maxDuration = $util.maxArray(css.map(item => item.delay + item.duration * item.repeatCount));
                                for (let i = 0; i < smil.length; i++) {
                                    let valid = 0;
                                    for (let j = 0; j < smil[i].begin.length; j++) {
                                        const begin = smil[i].begin[i];
                                        if (j === 0 && begin > maxDuration) {
                                            valid = 2;
                                            break;
                                        }
                                        else if (getDuration(smil[i], begin) > maxDuration) {
                                            valid = 1;
                                            break;
                                        }
                                    }
                                    switch (valid) {
                                        case 1:
                                            break;
                                        case 2:
                                            smil.splice(i--, 1);
                                            break;
                                        default:
                                            removeAnimations(smil.splice(i--, 1));
                                            break;
                                    }
                                }
                            }
                            if (smil.length) {
                                partitions.push(css, smil);
                                return;
                            }
                        }
                        [css, smil].forEach(conflicted => {
                            if (conflicted.length) {
                                const included: SvgAnimate[] = [];
                                for (let i = 0; i < mergeable.length; i++) {
                                    const itemA = mergeable[i];
                                    if (checkSingle(itemA)) {
                                        included.push(itemA);
                                        continue;
                                    }
                                    const beginA = itemA.delay;
                                    const timeA = getDuration(itemA, beginA);
                                    conflict: {
                                        for (let j = 0; j < mergeable.length; j++) {
                                            if (i !== j) {
                                                const itemB = mergeable[j];
                                                if (itemA.repeatCount === -1 && itemB.repeatCount === -1) {
                                                    included.push(itemA);
                                                    break conflict;
                                                }
                                                else {
                                                    for (const beginB of itemB.begin) {
                                                        const timeB = getDuration(itemB, beginB);
                                                        if (itemA.repeatCount === -1) {
                                                            if (beginA < timeB) {
                                                                included.push(itemA);
                                                                break conflict;
                                                            }
                                                        }
                                                        else if (beginA < beginB || beginA === beginB && (i > j || timeA > timeB || itemA.attributeName !== itemB.attributeName) || beginA > beginB && beginA < timeB) {
                                                            included.push(itemA);
                                                            break conflict;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (included.length > 1 || included.length === 1 && checkSingle(included[0])) {
                                    partitions.push(included);
                                }
                            }
                        });
                    }
                }
                else if (mergeable.length === 1 && checkSingle(mergeable[0])) {
                    partitions.push(mergeable);
                }
            });
            partitions.forEach(mergeable => {
                const transforming = SvgBuild.asAnimateTransform(mergeable[0]);
                const fillBackwards = mergeable.filter(item => $util.hasBit(item.fillMode, FILL_MODE.BACKWARDS));
                const groupName: ObjectMap<Map<number, GroupData>> = {};
                let repeatingDuration = 0;
                for (const item of mergeable) {
                    const attr = item.attributeName;
                    if (groupName[attr] === undefined) {
                        groupName[attr] = new Map<number, GroupData>();
                    }
                    for (const begin of item.begin) {
                        const group = groupName[attr].get(begin) || { duration: 0, items: [] };
                        group.items.push(item);
                        groupName[attr].set(begin, group);
                    }
                }
                for (const attr in groupName) {
                    if (groupName[attr].size) {
                        const groupBegin = groupName[attr];
                        let freezeTime = Number.POSITIVE_INFINITY;
                        for (const [begin, group] of groupBegin.entries()) {
                            let i = group.items.length - 1;
                            const ignore: SvgAnimate[] = [];
                            do {
                                const item = group.items[i];
                                const groupEnd = item.repeatCount === -1 || item.fillMode >= FILL_MODE.FORWARDS;
                                const repeatDuration = item.duration * item.repeatCount;
                                for (let j = 0; j < i; j++) {
                                    const subitem = group.items[j];
                                    if (groupEnd || subitem.repeatCount !== -1 && subitem.duration * subitem.repeatCount <= repeatDuration) {
                                        ignore.push(subitem);
                                    }
                                }
                                if (item.repeatCount !== -1 && item.fillMode >= FILL_MODE.FORWARDS) {
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
                            if (group && group.items.length) {
                                const duration = $util.maxArray(group.items.map(item => getGroupDuration(item)));
                                repeatingDuration = Math.max(repeatingDuration, time + duration);
                                group.items = group.items.filter(item => !fillBackwards.includes(item));
                                if (group.items.length) {
                                    group.duration = duration;
                                    group.items.reverse();
                                    groupSorted.set(time, group);
                                }
                            }
                        }
                        groupName[attr] = groupSorted;
                    }
                    else {
                        delete groupName[attr];
                    }
                }
                const repeatingMap: TimelineMap = {};
                const indefiniteMap: ObjectMap<NumberValue<SvgAnimate>> = {};
                const repeatingInterpolatorMap = new Map<number, Set<string>>();
                const indefiniteInterpolatorMap = new Map<number, Set<string>>();
                const repeatingAnimations = new Set<SvgAnimate>();
                const indefiniteAnimations: SvgAnimate[] = [];
                const animateTimeRangeMap = new Map<number, number>();
                const freezeMap: FreezeMap = {};
                const forwardMap: ObjectMap<boolean> = {};
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
                    const groupBegin = Array.from(groupName[attr].keys());
                    const groupData = Array.from(groupName[attr].values());
                    let incomplete: NumberValue<SvgAnimate>[] = [];
                    let resetValue: AnimateValue | undefined;
                    let baseValue!: AnimateValue;
                    if (!transforming) {
                        resetValue = getBaseValue(attr);
                        baseValue = resetValue;
                    }
                    let groupBackwards: SvgAnimate[] | undefined;
                    if (fillBackwards.length) {
                        groupBackwards = fillBackwards.filter(item => item.attributeName === attr);
                        if (groupBackwards.length) {
                            for (const item of groupBackwards) {
                                groupBegin.unshift(item.delay);
                                groupData.unshift({
                                    duration: getGroupDuration(item),
                                    items: [item]
                                });
                            }
                            const firstAnimate = groupData[0].items[0];
                            baseValue = getItemValue(firstAnimate, firstAnimate.reverse ? 0 : firstAnimate.values.length - 1, baseValue, 0);
                            repeatingMap[attr].set(0, baseValue);
                        }
                    }
                    attributeEnd: {
                        let maxTime = -1;
                        let startTime: number;
                        let previousItem: SvgAnimateTransform | undefined;
                        function checkComplete(animate: SvgAnimate, delayed: boolean) {
                            incomplete = incomplete.filter(item => item.value !== animate);
                            if ($util.hasBit(animate.fillMode, FILL_MODE.FORWARDS)) {
                                forwardMap[attr] = true;
                                return true;
                            }
                            else if ($util.hasBit(animate.fillMode, FILL_MODE.FREEZE)) {
                                freezeMap[attr] = { ordinal: maxTime, value: baseValue };
                                return true;
                            }
                            else if (delayed && resetValue !== undefined) {
                                repeatingMap[attr].set(++maxTime, resetValue);
                            }
                            return false;
                        }
                        function resetTransform(previous: SvgAnimateTransform, additiveSum: boolean, index?: number) {
                            if (!additiveSum && resetValue !== undefined) {
                                repeatingMap[attr].set(++maxTime, resetValue);
                                if (index !== undefined) {
                                    insertInterpolator(repeatingInterpolatorMap, previous, maxTime, index, useKeyTime);
                                }
                                setTimeRange(previous.type, maxTime);
                            }
                        }
                        for (let i = 0; i < groupBegin.length; i++) {
                            const groupItems = groupData[i].items;
                            if (groupItems.length === 0) {
                                continue;
                            }
                            const begin = groupBegin[i];
                            for (let j = 0; j < groupItems.length; j++) {
                                const item = groupItems[j];
                                const indefinite = item.repeatCount === -1;
                                const duration = item.duration;
                                const repeatCount = item.repeatCount;
                                let durationTotal = duration;
                                if (!indefinite) {
                                    durationTotal *= repeatCount;
                                    if (begin + Math.min(item.end || Number.POSITIVE_INFINITY, durationTotal) <= maxTime) {
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
                                let minRestartTime = 0;
                                let nextBeginTime: number | undefined;
                                if (item.element) {
                                    nextBeginTime = groupBegin[i + 1];
                                    for (let k = i + 1; k < groupBegin.length; k++) {
                                        minRestartTime = Math.max(minRestartTime, groupBegin[k] + groupData[k].duration);
                                    }
                                }
                                else {
                                    const itemIndex = mergeable.findIndex(value => value === item);
                                    if (groupBackwards === undefined || !groupBackwards.includes(item)) {
                                        nextBegin: {
                                            for (let k = i + 1; k < groupBegin.length; k++) {
                                                for (const sibling of groupData[k].items) {
                                                    if (mergeable.findIndex(value => value === sibling) > itemIndex) {
                                                        nextBeginTime = groupBegin[k];
                                                        break nextBegin;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    for (let k = i + 1; k < groupBegin.length; k++) {
                                        const groupCSS = groupData[k].items.filter(sibling => mergeable.findIndex(value => value === sibling) > itemIndex);
                                        if (groupCSS.length) {
                                            const groupDuration = $util.maxArray(groupCSS.map(value => getGroupDuration(value)));
                                            minRestartTime = Math.max(minRestartTime, groupBegin[j] + groupDuration);
                                        }
                                    }
                                }
                                if (transforming) {
                                    if (previousItem) {
                                        resetTransform(previousItem, item.additiveSum, 0);
                                    }
                                    resetValue = getTransformInitialValue((<SvgAnimateTransform> item).type);
                                    baseValue = resetValue;
                                }
                                const maxThreadTime = Math.min(nextBeginTime || Number.POSITIVE_INFINITY, item.end || Number.POSITIVE_INFINITY, item.repeatDuration !== -1 && item.repeatDuration < duration ? item.repeatDuration : Number.POSITIVE_INFINITY);
                                startTime = maxTime + 1;
                                let lastValue: AnimateValue | undefined;
                                let complete = false;
                                if (maxThreadTime > maxTime) {
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
                                                            [maxTime, lastValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, k, splitTime, useKeyTime);
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
                                                    if (l === item.keyTimes.length - 1 && (k < repeatTotal - 1 || incomplete.length === 0 && item.fillMode < FILL_MODE.FORWARDS) && !item.accumulateSum && !repeatingMap[attr].has(time - 1)) {
                                                        time--;
                                                    }
                                                    insertInterpolator(repeatingInterpolatorMap, item, time, l, useKeyTime);
                                                    repeatingMap[attr].set(time, value);
                                                    maxTime = time;
                                                    lastValue = value;
                                                }
                                                if (!complete || repeatFraction === -1) {
                                                    break threadTimeExceeded;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (lastValue !== undefined) {
                                    baseValue = lastValue;
                                    if (!indefinite) {
                                        repeatingAnimations.add(item);
                                    }
                                    if (transforming) {
                                        previousItem = <SvgAnimateTransform> item;
                                        setTimeRange(previousItem.type, startTime, maxTime);
                                    }
                                }
                                if (indefinite) {
                                    incomplete.length = 0;
                                    incomplete.push({
                                        ordinal: begin,
                                        value: item
                                    });
                                }
                                else {
                                    if (complete) {
                                        if (transforming) {
                                            if (previousItem) {
                                                resetTransform(previousItem, false);
                                                previousItem = undefined;
                                            }
                                        }
                                        if (checkComplete(item, groupBegin[i + 1] > maxTime + 1)) {
                                            break attributeEnd;
                                        }
                                    }
                                    else if (groupBegin[i] + durationTotal > minRestartTime) {
                                        incomplete.push({
                                            ordinal: begin,
                                            value: item
                                        });
                                    }
                                }
                            }
                        }
                        if (incomplete.length) {
                            incomplete.reverse();
                            for (let i = 0; i < incomplete.length; i++) {
                                const begin = incomplete[i].ordinal;
                                const item = incomplete[i].value;
                                const duration = item.duration;
                                const durationTotal = maxTime - begin;
                                const indefinite = item.repeatCount === -1;
                                let maxThreadTime = Number.POSITIVE_INFINITY;
                                const insertKeyTimes = () => {
                                    startTime = maxTime + 1;
                                    let j = Math.floor(durationTotal / duration);
                                    let joined = false;
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
                                                    }
                                                    return;
                                                }
                                                if (time > maxTime) {
                                                    if (k === item.keyTimes.length - 1 && time < maxThreadTime && !repeatingMap[attr].has(time - 1)) {
                                                        time--;
                                                    }
                                                    baseValue = getItemValue(item, k, baseValue, j);
                                                    insertInterpolator(repeatingInterpolatorMap, item, time, k, useKeyTime);
                                                    repeatingMap[attr].set(time, baseValue);
                                                    maxTime = time;
                                                }
                                            }
                                        }
                                    }
                                    while (maxTime < maxThreadTime && ++j);
                                    if (transforming) {
                                        setTimeRange((<SvgAnimateTransform> item).type, startTime, maxTime);
                                    }
                                };
                                if (indefinite) {
                                    if (durationTotal > 0 && durationTotal % item.duration !== 0) {
                                        maxThreadTime = begin + item.duration * Math.ceil(durationTotal / duration);
                                        insertKeyTimes();
                                    }
                                    indefiniteMap[attr] = { ordinal: begin, value: item };
                                    break attributeEnd;
                                }
                                else {
                                    maxThreadTime = begin + item.duration * item.repeatCount;
                                    if (maxThreadTime > maxTime) {
                                        insertKeyTimes();
                                        repeatingAnimations.add(item);
                                        if (checkComplete(item, false)) {
                                            break attributeEnd;
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
                        const insertMap = repeatingMap[attr];
                        let maxTime = $util.maxArray(Array.from(insertMap.keys()));
                        if (indefiniteMap[attr] && maxTime < repeatingEndTime) {
                            const begin = indefiniteMap[attr].ordinal;
                            const item = indefiniteMap[attr].value;
                            const startTime = maxTime + 1;
                            let baseValue = <AnimateValue> Array.from(insertMap.values()).pop();
                            let i = Math.floor((maxTime - begin) / item.duration);
                            do {
                                let joined = false;
                                for (let j = 0; j < item.keyTimes.length; j++) {
                                    let time = getItemTime(begin, item.duration, item.keyTimes, i, j);
                                    if (!joined && time >= maxTime) {
                                        [maxTime, baseValue] = insertSplitKeyTimeValue(insertMap, repeatingInterpolatorMap, item, baseValue, begin, i, maxTime, useKeyTime);
                                        keyTimesRepeating.push(maxTime);
                                        joined = true;
                                    }
                                    if (joined && time > maxTime) {
                                        if (j === item.keyTimes.length - 1 && time < repeatingEndTime && !insertMap[attr].has(time - 1)) {
                                            time--;
                                        }
                                        baseValue = getItemValue(item, j, baseValue, i);
                                        insertInterpolator(repeatingInterpolatorMap, item, time, j, useKeyTime);
                                        insertMap.set(time, baseValue);
                                        maxTime = time;
                                        keyTimesRepeating.push(maxTime);
                                    }
                                }
                            }
                            while (maxTime < repeatingEndTime && ++i);
                            if (transforming) {
                                setTimeRange((<SvgAnimateTransform> item).type, startTime, maxTime);
                            }
                        }
                        if (indefiniteMap[attr] === undefined && freezeMap[attr] === undefined && !forwardMap[attr]) {
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
                                    value = parseFloat(from);
                                    if (isNaN(value)) {
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
                            if (value !== undefined && JSON.stringify(insertMap.get(maxTime)) !== JSON.stringify(value)) {
                                while (insertMap.has(maxTime)) {
                                    maxTime++;
                                }
                                insertMap.set(maxTime, value as AnimateValue);
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
                                    insertSplitTimeValue(repeatingMap[attr], insertMap, keyTime);
                                }
                                else {
                                    insertMap.set(keyTime, value);
                                }
                            }
                        }
                        timelineMap[attr] = insertMap;
                    }
                    repeatingResult = getKeyTimeMap(timelineMap, keyTimes, freezeMap);
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
                                insertInterpolator(indefiniteInterpolatorMap, item, time, j, useKeyTime);
                                timelineMap[attr].set(time, baseValue);
                                maxTime = time;
                                keyTimes.push(time);
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
                                maxTime = indefiniteDuration + times[i];
                                const interpolator = indefiniteInterpolatorMap.get(times[i]);
                                if (interpolator) {
                                    indefiniteInterpolatorMap.set(maxTime, interpolator);
                                }
                                timelineMap[attr].set(maxTime, values[i]);
                                keyTimes.push(maxTime);
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
                                insertSplitTimeValue(baseMap, baseMap, keyTime);
                            }
                        }
                    }
                    indefiniteResult = getKeyTimeMap(timelineMap, keyTimes);
                }
                if (repeatingResult || indefiniteResult) {
                    removeAnimations(mergeable);
                    const sequentialName = Array.from(mergeable.map(item => SvgBuild.asAnimateTransform(item) ? getTransformName(item.type) : item.attributeName)).join('-');
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
                            const freezeIndefinite = repeating ? undefined : freezeMap;
                            if (isKeyTimeFormat(transforming, useKeyTime)) {
                                const keySplines: string[] = [];
                                const parent = this.parent;
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
                                        const begin = entries[0][0];
                                        const endTime = entries[entries.length - 1][0];
                                        let duration = endTime - begin;
                                        const object = new SvgAnimateTransform();
                                        object.attributeName = 'transform';
                                        object.type = entries[0][1].keys().next().value as number;
                                        for (const item of entries) {
                                            const interpolator = interpolatorMap.get(item[0]);
                                            if (interpolator) {
                                                keySplines.push(interpolator.values().next().value);
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
                                        const delay = begin - previousEndTime;
                                        if (delay > 1) {
                                            object.delay = delay;
                                        }
                                        else if (delay === 1 && (duration + 1) % 100 === 0) {
                                            duration++;
                                        }
                                        object.duration = duration;
                                        object.keySplines = keySplines;
                                        object.sequential = { ordinal: i, value: '' };
                                        insertAnimate(object, repeating);
                                        previousEndTime = endTime;
                                    }
                                }
                                else {
                                    result = convertToFraction(Array.from(result.entries()), repeating ? repeatingDuration : indefiniteDuration);
                                    let object: SvgAnimate | undefined;
                                    if (path) {
                                        const pathData = getPathData(result, path, parent, freezeIndefinite);
                                        if (pathData) {
                                            object = new SvgAnimate();
                                            object.attributeName = 'd';
                                            for (const item of pathData) {
                                                object.keyTimes.push(item.ordinal);
                                                object.values.push(item.value.toString());
                                                const interpolator = interpolatorMap.get(item.ordinal);
                                                if (interpolator) {
                                                    keySplines.push(interpolator.values().next().value);
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
                                            object.values.push(parent ? `${parent.refitX(x)} ${parent.refitX(y)}` : `${x} ${y}`);
                                            const interpolator = interpolatorMap.get(keyTime);
                                            if (interpolator) {
                                                keySplines.push(interpolator.values().next().value);
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
                                            const pathData = getPathData(map, path, this.parent, freezeIndefinite);
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
                                        object.begin = [i === 0 ? keyTimeFrom : 0];
                                    }
                                    object.duration = keyTimeTo - keyTimeFrom;
                                    object.keyTimes = [0, 1];
                                    object.sequential = { ordinal: j++, value: name };
                                    const interpolator = interpolatorMap.get(keyTimeTo);
                                    if (interpolator) {
                                        object.keySplines = [interpolator.values().next().value];
                                        interpolatorMap.delete(keyTimeTo);
                                    }
                                    insertAnimate(object, repeating);
                                }
                            }
                        }
                    });
                }
            });
        }
    };
};