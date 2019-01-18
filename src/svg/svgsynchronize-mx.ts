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

type GroupData = {
    duration: number;
    items: SvgAnimate[]
};

const $util = squared.lib.util;

function getTime(begin: number, duration: number, keyTimes: number[], iteration: number, index: number) {
    return begin + (keyTimes[index] + iteration) * duration;
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

function insertSplitTimeValue(baseMap: TimelineIndex, insertMap: TimelineIndex, splitTime: number) {
    let previous: NumberValue<AnimateValue> | undefined;
    let next: NumberValue<AnimateValue> | undefined;
    for (const [ordinal, value] of baseMap.entries()) {
        if (previous && splitTime <= ordinal) {
            next = { ordinal, value };
            break;
        }
        if (splitTime >= ordinal) {
            previous = { ordinal, value };
        }
    }
    if (previous && next) {
        const value = getSplitValue(splitTime, previous.ordinal, next.ordinal, previous.value, next.value);
        insertMap.set(splitTime, value);
    }
    else if (previous) {
        insertMap.set(splitTime, previous.value);
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
            if (data.has(attr)) {
                values.push(<AnimateValue> data.get(attr));
            }
            else if (freezeMap && freezeMap[attr]) {
                values.push(freezeMap[attr].value);
            }
            else {
                const value = path.getBaseValue(attr);
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

function getItemValue(item: SvgAnimate, index: number, baseValue: AnimateValue, iteration = 0) {
    const values = item.alternate && iteration % 2 !== 0 ? item.values.slice().reverse() : item.values;
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

function playableAnimation(item: SvgAnimate) {
    return !item.paused && item.begin.length > 0 && item.keyTimes.length > 1 && item.duration > 0;
}

function getDuration(item: SvgAnimate) {
    return item.repeatCount !== -1 ? item.duration * item.repeatCount : Number.MAX_VALUE;
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
            if (animations.length > 1 || animations.some(item => item.begin.length > 1 || item.keyTimes.join('-') !== '0-1' || item.alternate || item.end !== undefined || item.additiveSum)) {
                let animationsCSS = animations.filter(item => item.element === undefined);
                const minDelay = $util.minArray(animationsCSS.map(item => item.begin[0]));
                const maxDuration = $util.maxArray(animationsCSS.map(item => getDuration(item)));
                const groupName: ObjectMap<Map<number, GroupData>> = {};
                let repeatingDurationTotal = 0;
                for (const item of animations) {
                    const attr = item.attributeName;
                    if (groupName[attr] === undefined) {
                        groupName[attr] = new Map<number, GroupData>();
                    }
                    for (const begin of item.begin) {
                        if (item.element === undefined || begin < minDelay || getDuration(item) > maxDuration) {
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
                                const duration = $util.maxArray(group.items.map(item => item.duration * (item.repeatCount === -1 ? 1 : item.repeatCount)));
                                repeatingDurationTotal = Math.max(repeatingDurationTotal, time + duration);
                                group.duration = duration;
                                group.items.reverse();
                                groupSorted.set(time, group);
                            }
                        }
                        groupName[attr] = groupSorted;
                    }
                    else {
                        delete groupName[attr];
                    }
                }
                const repeatingMap: TimelineMap = {};
                const indefiniteMap: TimelineMap = {};
                const indefiniteBeginMap: ObjectMap<number> = {};
                const interpolatorMap = new Map<number, Set<string>>();
                const repeatingAnimations = new Set<SvgAnimate>();
                const indefiniteAnimations = new Set<SvgAnimate>();
                const freezeMap: FreezeMap = {};
                const forwardMap: ObjectMap<boolean> = {};
                let repeatingResult: KeyTimeMap | undefined;
                let indefiniteResult: KeyTimeMap | undefined;
                let indefiniteBegin = false;
                let indefiniteDurationTotal = 0;
                function insertSplitKeyTimeValue(timelineMap: TimelineIndex, item: SvgAnimate, baseVal: AnimateValue, begin: number, iteration: number, splitTime: number, adjustment = 0): [number, AnimateValue] {
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
                            getItemValue(item, previousIndex, baseVal, iteration),
                            getItemValue(item, nextIndex, baseVal, iteration)
                        );
                    }
                    else {
                        nextIndex = previousIndex !== -1 ? previousIndex + 1 : keyTimes.length - 1;
                        value = getItemValue(item, nextIndex, baseVal, iteration);
                    }
                    let time = splitTime + adjustment;
                    if (timelineMap.get(time) !== value) {
                        while (timelineMap.has(time)) {
                            time++;
                        }
                        insertInterpolator(time, item.keySplines, nextIndex);
                        timelineMap.set(time, value);
                    }
                    return [time, value];
                }
                function insertInterpolator(time: number, keySplines: string[] | undefined, index: number) {
                    if (!useKeyTime) {
                        if (index === 0) {
                            return;
                        }
                        index--;
                    }
                    const value = keySplines && keySplines[index] || '';
                    if (value !== '') {
                        const values = interpolatorMap.get(time) || new Set<string>();
                        values.add(value);
                        interpolatorMap.set(time, values);
                    }
                }
                const getBaseValue = (attr: string) => {
                    let value: AnimateValue | undefined;
                    try {
                        value = (path || <SvgBaseVal> (this as unknown)).getBaseValue(attr);
                    }
                    catch {
                    }
                    return value;
                };
                animationEnd: {
                    for (const attr in groupName) {
                        repeatingMap[attr] = new Map<number, AnimateValue>();
                        const incomplete: NumberValue<SvgAnimate>[] = [];
                        const groupBegin = Array.from(groupName[attr].keys());
                        const groupData = Array.from(groupName[attr].values());
                        const resetValue = getBaseValue(attr) || (attr === 'points' ? [{ x: 0, y: 0 }] : 0);
                        let baseValue = resetValue;
                        let maxTime = -1;
                        function setComplete(animate: SvgAnimate, indefinite: boolean, nextBeginGap: boolean) {
                            if ($util.hasBit(animate.fillMode, FILL_MODE.FORWARDS) || indefinite && animate.element === undefined) {
                                forwardMap[attr] = true;
                                animationsCSS = animationsCSS.filter(subitem => subitem.attributeName !== attr);
                                return animationsCSS.length === 0 ? 2 : 1;
                            }
                            else if ($util.hasBit(animate.fillMode, FILL_MODE.FREEZE)) {
                                freezeMap[attr] = { ordinal: maxTime, value: baseValue };
                                return 1;
                            }
                            else if (nextBeginGap && !$util.hasBit(animate.fillMode, FILL_MODE.BACKWARDS)) {
                                repeatingMap[attr].set(++maxTime, resetValue);
                            }
                            return 0;
                        }
                        attributeEnd: {
                            for (let i = 0; i < groupBegin.length; i++) {
                                const groupItems = groupData[i].items;
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
                                        nextBegin: {
                                            for (let k = i + 1; k < groupBegin.length; k++) {
                                                const groupCSS = groupData[k].items.filter(animate => animate.element === undefined);
                                                for (const css of groupCSS) {
                                                    const cssIndex = animationsCSS.findIndex(animate => animate === css);
                                                    if (cssIndex > itemIndex) {
                                                        nextBeginTime = groupBegin[k];
                                                        break nextBegin;
                                                    }
                                                    else {
                                                        incomplete.push({ ordinal: groupBegin[k], value: css });
                                                    }
                                                }
                                            }
                                        }
                                        for (let k = i + 1; k < groupBegin.length; k++) {
                                            const groupCSS = groupData[k].items.filter(subitem => subitem.element === undefined && animationsCSS.findIndex(animate => animate === subitem) > itemIndex);
                                            if (groupCSS.length) {
                                                const groupDuration = $util.maxArray(groupCSS.map(animate => animate.duration * (animate.repeatCount === -1 ? 1 : animate.repeatCount)));
                                                minRestartTime = Math.max(minRestartTime, groupBegin[j] + groupDuration);
                                            }
                                        }
                                    }
                                    const maxThreadTime = Math.min(nextBeginTime || Number.MAX_VALUE, item.end || Number.MAX_VALUE);
                                    let complete = true;
                                    let parallel = maxTime !== -1;
                                    let lastValue: AnimateValue | undefined;
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
                                                    time = getTime(begin, duration, item.keyTimes, k, l);
                                                    if (time === maxThreadTime) {
                                                        complete = k === repeatTotal - 1 && l === item.keyTimes.length - 1;
                                                    }
                                                    else {
                                                        const adjustNumberValue = (maxThread: boolean, splitTime: number) => {
                                                            const result = insertSplitKeyTimeValue(repeatingMap[attr], item, baseValue, begin, k, splitTime, maxThread && splitTime === groupBegin[i + 1] && !repeatingMap[attr].has(splitTime - 1) ? -1 : 0);
                                                            maxTime = result[0];
                                                            lastValue = result[1];
                                                        };
                                                        if (time > maxThreadTime) {
                                                            adjustNumberValue(true, maxThreadTime);
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
                                                                        adjustNumberValue(false, maxTime);
                                                                    }
                                                                }
                                                                parallel = false;
                                                            }
                                                            else if (k > 0 && l === 0) {
                                                                if (item.additiveSum && item.accumulateSum) {
                                                                    insertInterpolator(time, item.keySplines, l);
                                                                    maxTime = time;
                                                                    continue;
                                                                }
                                                                if (time === maxTime && repeatingMap[attr].get(time) === value) {
                                                                    insertInterpolator(time, item.keySplines, l);
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
                                                    maxTime = Math.round(time);
                                                    lastValue = value;
                                                    insertInterpolator(maxTime, item.keySplines, l);
                                                    repeatingMap[attr].set(maxTime, value);
                                                }
                                                if (!complete || repeatFraction === -1) {
                                                    break threadTimeExceeded;
                                                }
                                            }
                                        }
                                    }
                                    if (lastValue !== undefined) {
                                        if (!indefinite) {
                                            repeatingAnimations.add(item);
                                        }
                                        baseValue = lastValue;
                                        if (complete) {
                                            const label = setComplete(item, indefinite, groupBegin[i + 1] > maxTime + 1);
                                            if (label === 2) {
                                                break animationEnd;
                                            }
                                            else if (label === 1) {
                                                break attributeEnd;
                                            }
                                        }
                                    }
                                    if (indefinite) {
                                        incomplete.forEach(pending => indefiniteAnimations.delete(pending.value));
                                        incomplete.length = 0;
                                        indefiniteAnimations.add(item);
                                    }
                                    if (indefinite || !complete && groupBegin[i] + durationTotal > minRestartTime) {
                                        incomplete.push({ ordinal: begin, value: item });
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
                                                const time = getTime(begin, duration, item.keyTimes, j, k);
                                                const timeExceeded = time >= maxThreadTime;
                                                if (!joined && time >= maxTime || timeExceeded) {
                                                    let result = insertSplitKeyTimeValue(repeatingMap[attr], item, baseValue, begin, j, maxTime);
                                                    maxTime = result[0];
                                                    baseValue = result[1];
                                                    if (timeExceeded) {
                                                        if (maxThreadTime > maxTime) {
                                                            result = insertSplitKeyTimeValue(repeatingMap[attr], item, baseValue, begin, j, maxThreadTime);
                                                            maxTime = result[0];
                                                            baseValue = result[1];
                                                        }
                                                        break;
                                                    }
                                                    joined = true;
                                                }
                                                else if (time > maxTime) {
                                                    maxTime = Math.round(time);
                                                    baseValue = getItemValue(item, k, baseValue, j);
                                                    insertInterpolator(maxTime, item.keySplines, k);
                                                    repeatingMap[attr].set(maxTime, baseValue);
                                                }
                                            }
                                            j++;
                                        }
                                        while (maxTime < maxThreadTime);
                                    };
                                    if (indefinite) {
                                        if (durationTotal > 0 && durationTotal % duration !== 0) {
                                            insertKeyTimes();
                                        }
                                        indefiniteMap[attr] = new Map<number, AnimateValue>();
                                        indefiniteBeginMap[attr] = durationTotal <= 0 ? begin : 0;
                                        for (let j = 0; j < item.keyTimes.length; j++) {
                                            indefiniteMap[attr].set(item.keyTimes[j] * item.duration, getItemValue(item, j, 0, 0));
                                        }
                                        if (begin > 0) {
                                            indefiniteBegin = true;
                                        }
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
                                            const label = setComplete(item, indefinite, false);
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
                    const repeatingEndTime = $util.maxArray(keyTimesRepeating);
                    for (const attr in repeatingMap) {
                        const insertMap = repeatingMap[attr];
                        const begin = indefiniteBeginMap[attr] || 0;
                        let maxTime = $util.maxArray(Array.from(insertMap.keys()));
                        if (indefiniteMap[attr] && begin < repeatingEndTime && maxTime < repeatingEndTime) {
                            do {
                                let insertTime = -1;
                                for (const [time, data] of indefiniteMap[attr].entries()) {
                                    insertTime = maxTime + begin + time;
                                    while (insertMap.has(insertTime)) {
                                        insertTime++;
                                    }
                                    insertMap.set(insertTime, data);
                                    keyTimesRepeating.push(insertTime);
                                }
                                maxTime = insertTime;
                            }
                            while (maxTime < repeatingEndTime);
                            indefiniteBeginMap[attr] = 0;
                        }
                        if (indefiniteMap[attr] === undefined && freezeMap[attr] === undefined && !forwardMap[attr]) {
                            const value = getBaseValue(attr);
                            if (value !== undefined) {
                                let fillReplace: boolean;
                                if (typeof value === 'number') {
                                    fillReplace = insertMap.get(maxTime) !== value;
                                }
                                else if (Array.isArray(value)) {
                                    fillReplace = JSON.stringify(insertMap.get(maxTime)) !== JSON.stringify(value);
                                }
                                else {
                                    fillReplace = false;
                                }
                                if (fillReplace) {
                                    maxTime++;
                                    insertMap.set(maxTime, value as AnimateValue);
                                    keyTimesRepeating.push(maxTime);
                                }
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
                    repeatingDurationTotal = keyTimes[keyTimes.length - 1];
                    let keyTimeResult = getKeyTimeMap(result, keyTimes, freezeMap);
                    if (useKeyTime) {
                        keyTimeResult = convertKeyTimeFraction(keyTimeResult, repeatingDurationTotal);
                    }
                    if (repeatingAnimations.size || indefiniteAnimations.size === 0 || indefiniteBegin) {
                        repeatingResult = keyTimeResult;
                    }
                    else {
                        indefiniteResult = keyTimeResult;
                        indefiniteDurationTotal = repeatingDurationTotal;
                    }
                }
                if (indefiniteResult === undefined && indefiniteAnimations.size) {
                    const indefiniteArray = Array.from(indefiniteAnimations);
                    indefiniteDurationTotal = getLeastCommonMultiple(indefiniteArray.map(item => item.duration));
                    const result: TimelineMap = {};
                    let keyTimes: number[] = [];
                    for (const attr in indefiniteMap) {
                        result[attr] = new Map<number, AnimateValue>();
                        const object = indefiniteArray.find(item => item.attributeName === attr);
                        if (object) {
                            let maxTime = 0;
                            let i = 0;
                            do {
                                for (let [time, value] of indefiniteMap[attr].entries()) {
                                    time += object.duration * i;
                                    result[attr].set(time, value);
                                    keyTimes.push(time);
                                    maxTime = time;
                                }
                                i++;
                            }
                            while (maxTime < indefiniteDurationTotal);
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
                        indefiniteResult = convertKeyTimeFraction(indefiniteResult, repeatingDurationTotal);
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
                    const setXY = (item: Map<string, number>) => {
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
                    };
                    [repeatingResult, indefiniteResult].forEach(result => {
                        if (result) {
                            const repeating = result === repeatingResult;
                            const freezeIndefinite = repeating ? undefined : freezeMap;
                            const insertAnimate = (item: SvgAnimate) => {
                                if (repeating) {
                                    item.repeatCount = 1;
                                }
                                else {
                                    item.begin = [0];
                                    item.repeatCount = -1;
                                }
                                item.end = undefined;
                                item.from = item.values[0];
                                item.to = item.values[item.values.length - 1];
                                item.by = '';
                                this.animation.push(item);
                            };
                            if (useKeyTime) {
                                let object: SvgAnimate | undefined;
                                const keySplines: string[] = [];
                                if (path) {
                                    const pathData = getPathData(result, path, this.parent, freezeIndefinite);
                                    if (pathData) {
                                        object = new SvgAnimate();
                                        object.attributeName = 'd';
                                        for (const item of pathData) {
                                            object.keyTimes.push(item.ordinal);
                                            object.values.push(item.value.toString());
                                            const interpolator = interpolatorMap.get(item.ordinal);
                                            keySplines.push(interpolator ? interpolator.values().next().value : '');
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
                                        object.values.push(this.parent ? `${this.parent.refitX(x)} ${this.parent.refitX(y)}` : `${x} ${y}`);
                                        const interpolator = interpolatorMap.get(keyTime);
                                        keySplines.push(interpolator ? interpolator.values().next().value : '');
                                    }
                                }
                                object.keySplines = keySplines;
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
                                    object.sequential = { name, value: k++ };
                                    const interpolator = interpolatorMap.get(keyTimeTo);
                                    if (interpolator) {
                                        object.keySplines = [interpolator.values().next().value];
                                    }
                                    insertAnimate(object);
                                }
                            }
                        }
                    });
                }
            }
        }
    };
};