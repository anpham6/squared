import { SvgPoint } from './@types/object';

import SvgAnimate from './svganimate';
import SvgAnimateTransform from './svganimatetransform';
import SvgBuild from './svgbuild';
import SvgPath from './svgpath';

import { FILL_MODE } from './lib/constant';
import { SVG, getLeastCommonMultiple, getTransformOrigin, sortNumber } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;
type SvgBaseVal = squared.svg.SvgBaseVal;

type AnimateValue = number | Point[];
type TimelineIndex = Map<number, AnimateValue>;
type TimelineMap = ObjectMap<TimelineIndex>;
type KeyTimeMap = Map<number, Map<string, AnimateValue>>;
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
                        value = SvgPath.getPolyline(points);
                        break;
                    case 'rect':
                    case 'polygon':
                        value = SvgPath.getPolygon(points);
                        break;
                    case 'circle':
                    case 'ellipse':
                        const pt = <Required<SvgPoint>> points[0];
                        value = SvgPath.getEllipse(pt.x, pt.y, pt.rx, pt.ry);
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
    else {
        const result: SvgPoint[] = [];
        values[index].trim().split(/\s+/).forEach(points => {
            const [x, y] = points.split(',').map(point => parseFloat(point));
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
    else {
        return previousValue;
    }
}

function playableAnimation(item: SvgAnimate) {
    return !item.paused && item.begin.length > 0 && item.keyTimes.length > 1 && item.duration > 0;
}

function getDuration(item: SvgAnimate) {
    return item.repeatCount !== -1 ? item.duration * item.repeatCount : Number.MAX_VALUE;
}

function getGroupDuration(item: SvgAnimate) {
    return item.duration * (item.repeatCount !== -1 ? item.repeatCount : 1);
}

export default <T extends Constructor<squared.svg.SvgView>>(Base: T) => {
    return class extends Base implements squared.svg.SvgSynchronize {
        public getAnimateShape() {
            const element = this.element;
            const result: SvgAnimate[] = [];
            for (const item of this.animation as SvgAnimate[]) {
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

        public getAnimateViewRect() {
            const result: SvgAnimate[] = [];
            for (const item of this.animation as SvgAnimate[]) {
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

        public mergeAnimate(animations: SvgAnimate[], useKeyTime = false, path?: SvgPath) {
            if (animations.length > 1 || animations.some(item => item.begin.length > 1 || !item.fromToType || item.alternate || item.end !== undefined || item.additiveSum)) {
                let animationsCSS = animations.filter(item => item.element === undefined);
                const minDelay = $util.minArray(animationsCSS.map(item => item.delay));
                const maxDuration = $util.maxArray(animationsCSS.map(item => getDuration(item)));
                const fillBackwards = animationsCSS.filter(item => $util.hasBit(item.fillMode, FILL_MODE.BACKWARDS));
                const groupName: ObjectMap<Map<number, GroupData>> = {};
                let repeatingDurationTotal = 0;
                for (const item of animations) {
                    const attr = item.attributeName;
                    if (groupName[attr] === undefined) {
                        groupName[attr] = new Map<number, GroupData>();
                    }
                    for (const begin of item.begin) {
                        if (item.element === undefined || (fillBackwards.length === 0 && begin < minDelay || getDuration(item) > maxDuration)) {
                            const group = groupName[attr].get(begin) || { duration: 0, items: [] };
                            group.items.push(item);
                            groupName[attr].set(begin, group);
                        }
                    }
                }
                for (const attr in groupName) {
                    if (groupName[attr].size) {
                        const groupBegin = groupName[attr];
                        let freezeTime = Number.MAX_VALUE;
                        for (const [begin, group] of groupBegin.entries()) {
                            group.items.sort((a, b) => a.element && b.element === undefined ? -1 : 0);
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
                            if (group) {
                                const duration = $util.maxArray(group.items.map(item => getGroupDuration(item)));
                                repeatingDurationTotal = Math.max(repeatingDurationTotal, time + duration);
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
                const freezeMap: FreezeMap = {};
                const forwardMap: ObjectMap<boolean> = {};
                let repeatingResult: KeyTimeMap | undefined;
                let indefiniteResult: KeyTimeMap | undefined;
                let indefiniteDurationTotal = 0;
                function insertSplitKeyTimeValue(map: TimelineIndex, interpolatorMap: InterpolatorMap, item: SvgAnimate, baseValue: AnimateValue, begin: number, iteration: number, splitTime: number, adjustment = 0): [number, AnimateValue] {
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
                    let time = splitTime + adjustment;
                    if (map.get(time) !== value) {
                        while (map.has(time)) {
                            time++;
                        }
                        insertInterpolator(interpolatorMap, time, item.keySplines, nextIndex);
                        map.set(time, value);
                    }
                    return [time, value];
                }
                function insertInterpolator(map: InterpolatorMap, time: number, keySplines: string[] | undefined, index: number) {
                    if (!useKeyTime) {
                        if (index === 0) {
                            return;
                        }
                        index--;
                    }
                    const value = keySplines && keySplines[index] || '';
                    if (value !== '') {
                        const values = map.get(time) || new Set<string>();
                        values.add(value);
                        map.set(time, values);
                    }
                }
                const getBaseValue = (attr: string) => {
                    let value: AnimateValue | undefined | null;
                    try {
                        value = (path || <SvgBaseVal> (this as unknown)).getBaseValue(attr);
                    }
                    catch {
                    }
                    return value !== undefined && value !== null ? value : (attr === 'points' ? [{ x: 0, y: 0 }] : 0);
                };
                animationEnd: {
                    for (const attr in groupName) {
                        repeatingMap[attr] = new Map<number, AnimateValue>();
                        const groupBegin = Array.from(groupName[attr].keys());
                        const groupData = Array.from(groupName[attr].values());
                        const resetValue = getBaseValue(attr);
                        let incomplete: NumberValue<SvgAnimate>[] = [];
                        let baseValue = resetValue;
                        let groupBackwards: SvgAnimate[] | undefined;
                        let maxTime = -1;
                        function setComplete(animate: SvgAnimate, delayed: boolean) {
                            incomplete = incomplete.filter(item => item.value !== animate);
                            if ($util.hasBit(animate.fillMode, FILL_MODE.FORWARDS)) {
                                forwardMap[attr] = true;
                                animationsCSS = animationsCSS.filter(item => item.attributeName !== attr);
                                return animationsCSS.length === 0 ? 2 : 1;
                            }
                            else if ($util.hasBit(animate.fillMode, FILL_MODE.FREEZE)) {
                                freezeMap[attr] = { ordinal: maxTime, value: baseValue };
                                return 1;
                            }
                            else if (delayed) {
                                repeatingMap[attr].set(++maxTime, resetValue);
                            }
                            return 0;
                        }
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
                            for (let i = 0; i < groupBegin.length; i++) {
                                const groupItems = groupData[i].items;
                                if (groupItems.length === 0) {
                                    continue;
                                }
                                let begin = groupBegin[i];
                                let previousMaxTime = -1;
                                if (begin < 0) {
                                    previousMaxTime = Math.max(0, maxTime);
                                    maxTime = Math.max(maxTime, Math.abs(begin));
                                    begin = 0;
                                }
                                let alteredIndex = -1;
                                let alteredBegin = 0;
                                for (let j = 0; j < groupItems.length; j++) {
                                    const item = groupItems[j];
                                    if (j === alteredIndex) {
                                        begin = alteredBegin;
                                        alteredIndex = -1;
                                        alteredBegin = 0;
                                    }
                                    const indefinite = item.repeatCount === -1;
                                    const duration = item.duration;
                                    const repeatCount = item.repeatCount;
                                    let durationTotal = duration;
                                    if (!indefinite) {
                                        durationTotal *= repeatCount;
                                        if (begin + Math.min(item.end || Number.MAX_VALUE, durationTotal) <= maxTime) {
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
                                    let nextBeginTime: number | undefined;
                                    let minRestartTime = 0;
                                    if (item.element) {
                                        nextBeginTime = groupBegin[i + 1];
                                        if (incomplete.length) {
                                            let next: NumberValue<SvgAnimate> | undefined;
                                            for (let k = incomplete.length - 1; k >= 0; k--) {
                                                if (incomplete[k].value.element === undefined) {
                                                    next = incomplete[k];
                                                    incomplete.splice(k, 1);
                                                    break;
                                                }
                                            }
                                            if (next) {
                                                alteredIndex = j + 1;
                                                alteredBegin = begin;
                                                begin = next.ordinal;
                                                groupItems.splice(j, 0, next.value);
                                                j--;
                                                continue;
                                            }
                                        }
                                        for (let k = i + 1; k < groupBegin.length; k++) {
                                            minRestartTime = Math.max(minRestartTime, groupBegin[k] + groupData[k].duration);
                                        }
                                    }
                                    else {
                                        const itemIndex = animationsCSS.findIndex(animate => animate === item);
                                        if (groupBackwards === undefined || !groupBackwards.includes(item)) {
                                            nextBegin: {
                                                for (let k = i + 1; k < groupBegin.length; k++) {
                                                    const groupCSS = groupData[k].items.filter(animate => animate.element === undefined);
                                                    for (const css of groupCSS) {
                                                        const cssIndex = animationsCSS.findIndex(animate => animate === css);
                                                        if (cssIndex > itemIndex) {
                                                            nextBeginTime = groupBegin[k];
                                                            break nextBegin;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        for (let k = i + 1; k < groupBegin.length; k++) {
                                            const groupCSS = groupData[k].items.filter(subitem => subitem.element === undefined && animationsCSS.findIndex(animate => animate === subitem) > itemIndex);
                                            if (groupCSS.length) {
                                                const groupDuration = $util.maxArray(groupCSS.map(animate => getGroupDuration(animate)));
                                                minRestartTime = Math.max(minRestartTime, groupBegin[j] + groupDuration);
                                            }
                                        }
                                    }
                                    const maxThreadTime = Math.min(nextBeginTime || Number.MAX_VALUE, item.end || Number.MAX_VALUE);
                                    let lastValue: AnimateValue | undefined;
                                    let complete = false;
                                    if (maxThreadTime > maxTime) {
                                        complete = true;
                                        let parallel = maxTime !== -1;
                                        threadTimeExceeded: {
                                            for (let k = Math.floor(Math.max(0, maxTime - begin) / duration); k < repeatTotal; k++) {
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
                                                        if (time === maxThreadTime) {
                                                            complete = k === repeatTotal - 1 && l === item.keyTimes.length - 1;
                                                        }
                                                        else {
                                                            const adjustNumberValue = (splitTime: number, maxThread: boolean) => {
                                                                [maxTime, lastValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, k, splitTime, maxThread && splitTime === groupBegin[i + 1] && !repeatingMap[attr].has(splitTime - 1) ? -1 : 0);
                                                            };
                                                            if (time > maxThreadTime) {
                                                                adjustNumberValue(maxThreadTime, true);
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
                                                                            adjustNumberValue(maxTime, false);
                                                                        }
                                                                    }
                                                                    parallel = false;
                                                                }
                                                                else if (k > 0 && l === 0) {
                                                                    if (item.additiveSum && item.accumulateSum) {
                                                                        insertInterpolator(repeatingInterpolatorMap, time, item.keySplines, l);
                                                                        maxTime = time;
                                                                        continue;
                                                                    }
                                                                    if (time === maxTime && repeatingMap[attr].get(time) === value) {
                                                                        insertInterpolator(repeatingInterpolatorMap, time, item.keySplines, l);
                                                                        continue;
                                                                    }
                                                                    else {
                                                                        time = Math.max(time, maxTime + 1);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (time > maxTime) {
                                                        insertInterpolator(repeatingInterpolatorMap, time, item.keySplines, l);
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
                                            const label = setComplete(item, groupBegin[i + 1] > maxTime + 1);
                                            if (label === 2) {
                                                break animationEnd;
                                            }
                                            else if (label === 1) {
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
                                if (previousMaxTime !== -1) {
                                    const timeMap = new Map<number, AnimateValue>();
                                    maxTime = previousMaxTime;
                                    for (let [time, data] of repeatingMap[attr].entries()) {
                                        if (time >= previousMaxTime) {
                                            time += groupBegin[i];
                                            while (timeMap.has(time)) {
                                                time++;
                                            }
                                        }
                                        timeMap.set(time, data);
                                        maxTime = Math.max(time, maxTime);
                                    }
                                    repeatingMap[attr] = timeMap;
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
                                    let maxThreadTime = Number.MAX_VALUE;
                                    const insertKeyTimes = () => {
                                        let j = Math.floor(durationTotal / duration);
                                        let joined = false;
                                        do {
                                            for (let k = 0; k < item.keyTimes.length; k++) {
                                                const time = getItemTime(begin, duration, item.keyTimes, j, k);
                                                if (!joined && time >= maxTime) {
                                                    [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, j, maxTime);
                                                    joined = true;
                                                }
                                                if (joined) {
                                                    if (time >= maxThreadTime) {
                                                        if (maxThreadTime > maxTime) {
                                                            [maxTime, baseValue] = insertSplitKeyTimeValue(repeatingMap[attr], repeatingInterpolatorMap, item, baseValue, begin, j, maxThreadTime);
                                                        }
                                                        return;
                                                    }
                                                    if (time > maxTime) {
                                                        baseValue = getItemValue(item, k, baseValue, j);
                                                        insertInterpolator(repeatingInterpolatorMap, time, item.keySplines, k);
                                                        repeatingMap[attr].set(time, baseValue);
                                                        maxTime = time;
                                                    }
                                                }
                                            }
                                        }
                                        while (maxTime < maxThreadTime && ++j);
                                    };
                                    if (indefinite) {
                                        if (durationTotal > 0 && durationTotal % duration !== 0) {
                                            maxThreadTime = begin + item.duration * Math.ceil(durationTotal / duration);
                                            insertKeyTimes();
                                        }
                                        indefiniteMap[attr] = { ordinal: begin, value: item };
                                        if (item.element === undefined) {
                                            animationsCSS = animationsCSS.filter(subitem => subitem.attributeName !== attr);
                                            if (animationsCSS.length === 0) {
                                                break animationEnd;
                                            }
                                        }
                                        break attributeEnd;
                                    }
                                    else {
                                        maxThreadTime = begin + item.duration * item.repeatCount;
                                        if (maxThreadTime > maxTime) {
                                            insertKeyTimes();
                                            repeatingAnimations.add(item);
                                            const label = setComplete(item, false);
                                            if (label === 2) {
                                                break animationEnd;
                                            }
                                            else if (label === 1) {
                                                break attributeEnd;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        animationsCSS = animationsCSS.filter(item => item.attributeName !== attr);
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
                            let baseValue = <AnimateValue> Array.from(insertMap.values()).pop();
                            let i = Math.floor((maxTime - begin) / item.duration);
                            do {
                                let joined = false;
                                for (let j = 0; j < item.keyTimes.length; j++) {
                                    const time = getItemTime(begin, item.duration, item.keyTimes, i, j);
                                    if (!joined && time >= maxTime) {
                                        [maxTime, baseValue] = insertSplitKeyTimeValue(insertMap, repeatingInterpolatorMap, item, baseValue, begin, i, maxTime);
                                        keyTimesRepeating.push(maxTime);
                                        joined = true;
                                    }
                                    if (joined && time > maxTime) {
                                        baseValue = getItemValue(item, j, baseValue, i);
                                        insertInterpolator(repeatingInterpolatorMap, time, item.keySplines, j);
                                        insertMap.set(time, baseValue);
                                        maxTime = time;
                                        keyTimesRepeating.push(maxTime);
                                    }
                                }
                            }
                            while (maxTime < repeatingEndTime && ++i);
                        }
                        if (indefiniteMap[attr] === undefined && freezeMap[attr] === undefined && !forwardMap[attr]) {
                            let value: AnimateValue | undefined;
                            const repeat = Array.from(repeatingAnimations).reverse().find(item => item.attributeName === attr);
                            if (repeat && repeat.element === undefined) {
                                const from = repeat.values[0] || repeat.from;
                                value = parseFloat(from);
                                if (isNaN(value)) {
                                    value = SvgBuild.fromNumberList(SvgBuild.toNumberList(from));
                                    if (value.length === 0) {
                                        value = undefined;
                                    }
                                }
                            }
                            else {
                                value = getBaseValue(attr);
                            }
                            if (value !== undefined && JSON.stringify(insertMap.get(maxTime)) !== JSON.stringify(value)) {
                                while (insertMap.has(maxTime)) {
                                    maxTime++;
                                }
                                insertMap.set(maxTime, value as AnimateValue);
                                keyTimesRepeating.push(maxTime);
                            }
                        }
                    }
                    const keyTimes = sortNumber(Array.from(new Set(keyTimesRepeating)));
                    const result: TimelineMap = {};
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
                        result[attr] = insertMap;
                    }
                    repeatingResult = getKeyTimeMap(result, keyTimes, freezeMap);
                    repeatingDurationTotal = keyTimes[keyTimes.length - 1];
                    if (useKeyTime) {
                        repeatingResult = convertKeyTimeFraction(repeatingResult, repeatingDurationTotal);
                    }
                }
                if (Object.keys(indefiniteMap).length) {
                    const indefiniteArray: SvgAnimate[] = [];
                    const result: TimelineMap = {};
                    let keyTimes: number[] = [];
                    for (const attr in indefiniteMap) {
                        indefiniteArray.push(indefiniteMap[attr].value);
                    }
                    indefiniteDurationTotal = getLeastCommonMultiple(indefiniteArray.map(item => item.duration));
                    for (const item of indefiniteArray) {
                        const attr = item.attributeName;
                        result[attr] = new Map<number, AnimateValue>();
                        let maxTime = 0;
                        let baseValue = repeatingMap[attr] ? <AnimateValue> Array.from(repeatingMap[attr].values()).pop() : getBaseValue(attr);
                        let i = 0;
                        do {
                            for (let j = 0; j < item.keyTimes.length; j++) {
                                maxTime = getItemTime(0, item.duration, item.keyTimes, i, j);
                                baseValue = getItemValue(item, j, baseValue, i);
                                insertInterpolator(indefiniteInterpolatorMap, maxTime, item.keySplines, j);
                                result[attr].set(maxTime, baseValue);
                                keyTimes.push(maxTime);
                            }
                        }
                        while (maxTime < indefiniteDurationTotal && ++i);
                    }
                    if (indefiniteArray.every(item => item.alternate)) {
                        let maxTime = -1;
                        for (const attr in indefiniteMap) {
                            const times = Array.from(result[attr].keys());
                            const values = Array.from(result[attr].values()).reverse();
                            for (let i = 0; i < times.length; i++) {
                                maxTime = indefiniteDurationTotal + times[i];
                                const interpolator = indefiniteInterpolatorMap.get(times[i]);
                                if (interpolator) {
                                    indefiniteInterpolatorMap.set(maxTime, interpolator);
                                }
                                result[attr].set(maxTime, values[i]);
                                keyTimes.push(maxTime);
                            }
                        }
                        if (maxTime !== -1) {
                            indefiniteDurationTotal = maxTime;
                        }
                    }
                    keyTimes = sortNumber(Array.from(new Set(keyTimes)));
                    for (const attr in result) {
                        const baseMap = result[attr];
                        for (let i = 1; i < keyTimes.length; i++) {
                            const keyTime = keyTimes[i];
                            if (!baseMap.has(keyTime)) {
                                insertSplitTimeValue(baseMap, baseMap, keyTime);
                            }
                        }
                    }
                    indefiniteResult = getKeyTimeMap(result, keyTimes);
                    if (useKeyTime) {
                        indefiniteResult = convertKeyTimeFraction(indefiniteResult, indefiniteDurationTotal);
                    }
                }
                if (repeatingResult || indefiniteResult) {
                    $util.retainArray(this.animation, (item: SvgAnimate) => !animations.includes(item));
                    const sequentialName = Array.from(new Set(animations.map(item => item.attributeName))).sort().join('-');
                    let x = 0;
                    let y = 0;
                    if (path === undefined) {
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
                            if (useKeyTime) {
                                const keySplines: string[] = [];
                                const parent = this.parent;
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
                                        setXY(data as Map<string, number>);
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
                                object.duration = repeating ? repeatingDurationTotal : indefiniteDurationTotal;
                                insertAnimate(object, repeating);
                            }
                            else {
                                const entries = Array.from(result.entries());
                                for (let j = 0, k = 0; j < entries.length - 1; j++) {
                                    const [keyTimeFrom, dataFrom] = entries[j];
                                    const [keyTimeTo, dataTo] = entries[j + 1];
                                    let object: SvgAnimate | undefined;
                                    let name: string;
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
                                        name = sequentialName;
                                    }
                                    else {
                                        object = new SvgAnimateTransform();
                                        object.attributeName = 'transform';
                                        (object as SvgAnimateTransform).type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                                        object.values = [dataFrom, dataTo].map(data => {
                                            setXY(data as Map<string, number>);
                                            return this.parent ? `${this.parent.refitX(x)} ${this.parent.refitX(y)}` : `${x} ${y}`;
                                        });
                                        name = sequentialName + j;
                                    }
                                    if (repeating) {
                                        object.begin = [j === 0 ? keyTimeFrom : 0];
                                    }
                                    object.duration = keyTimeTo - keyTimeFrom;
                                    object.keyTimes = [0, 1];
                                    object.sequential = { ordinal: k++, value: name };
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
            }
        }
    };
};