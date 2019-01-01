import { SvgTransform } from './types/object';

import SvgAnimate from './svganimate';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';
import SvgPath from './svgpath';
import SvgElement from './svgelement';

import { getLeastCommonMultiple, getTransformOrigin, sortNumberAsc } from './lib/util';

type TimelineIndex = Map<number, number>;
type TimelineMap = ObjectMap<TimelineIndex>;
type KeyTimeMap = Map<number, Map<string, number>>;
type FreezeMap = ObjectMap<KeyTimeValue<number>>;

type KeyTimeValue<T> = {
    time: number;
    value: T;
};

const $util = squared.lib.util;

function insertSplitKeyTimeValue(map: TimelineIndex, element: SVGGraphicsElement, path: SvgPath | undefined, item: SvgAnimate, iteration: number, begin: number, splitTime: number) {
    const fraction = (splitTime - (begin + item.duration * iteration)) / item.duration;
    const keyTimes = item.keyTimes;
    let previousIndex = -1;
    let nextIndex = -1;
    for (let l = 0; l < keyTimes.length; l++) {
        if (previousIndex !== -1 && fraction < keyTimes[l]) {
            nextIndex = l;
            break;
        }
        if (fraction > keyTimes[l]) {
            previousIndex = l;
        }
    }
    if (previousIndex !== -1 && nextIndex !== -1) {
        const previousValue = getItemValue(element, path, item, previousIndex, iteration);
        const nextValue = getItemValue(element, path, item, nextIndex, iteration);
        map.set(splitTime, getSplitValue(fraction, keyTimes[previousIndex], keyTimes[nextIndex], previousValue, nextValue));
        return splitTime;
    }
    else {
        return -1;
    }
}

function getSplitValue(fraction: number, previousFraction: number, nextFraction: number, previousValue: number, nextValue: number) {
    return previousValue + ((fraction - previousFraction) / (nextFraction - previousFraction)) * (nextValue - previousValue);
}

function insertSplitTimeValue(map: TimelineIndex, insertMap: TimelineIndex, splitTime: number) {
    let previous: KeyTimeValue<number> | undefined;
    let next: KeyTimeValue<number> | undefined;
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
    const result = new Map<number, Map<string, number>>();
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

function getPathData(map: KeyTimeMap, path: SvgPath, methodName: string, attrs: string[], freezeMap?: FreezeMap, transform?: SvgTransform[]) {
    const result: KeyTimeValue<string>[] = [];
    for (const [time, data] of map.entries()) {
        const values: number[] = [];
        attrs.forEach(attr => {
            if (data.has(attr)) {
                values.push(data.get(attr) as number);
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
            if (transform && transform.length) {
                switch (methodName) {
                    case 'getLine':
                        value = SvgPath.getPolyline(SvgBuild.applyTransforms(transform, getLinePoints(values), getTransformOrigin(path.element)));
                        break;
                    case 'getRect':
                        value = SvgPath.getPolygon(SvgBuild.applyTransforms(transform, getRectPoints(values), getTransformOrigin(path.element)));
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
    const result = new Map<number, Map<string, number>>();
    for (const keyTime of keyTimes) {
        const values = new Map<string, number>();
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

function getItemValue(element: SVGGraphicsElement, path: SvgPath | undefined, animate: SvgAnimate, index: number, iteration = 0) {
    let result = parseFloat(animate.values[index]);
    if (animate.additiveSum) {
        const attr = animate.attributeName;
        if (path && typeof path.baseVal[attr] === 'number') {
            result += path.baseVal[attr];
        }
        else {
            result += $util.optionalAsNumber(element, `${attr}.baseVal.value`);
        }
        if (!animate.accumulateSum) {
            iteration = 0;
        }
        for (let i = 0; i < iteration; i++) {
            for (let j = 0; j < animate.values.length; j++) {
                result += parseFloat(animate.values[j]);
            }
        }
    }
    return result;
}

function getKeyTimePath(map: KeyTimeMap, path: SvgPath, freezeMap?: FreezeMap) {
    switch (path.element.tagName) {
        case 'circle':
            return getPathData(map, path, 'getCircle', ['cx', 'cy', 'r'], freezeMap);
        case 'ellipse':
            return getPathData(map, path, 'getEllipse', ['cx', 'cy', 'rx', 'ry'], freezeMap);
        case 'line':
            return getPathData(map, path, 'getLine', ['x1', 'y1', 'x2', 'y2'], freezeMap, path.transform);
        case 'rect':
            return getPathData(map, path, 'getRect', ['width', 'height', 'x', 'y'], freezeMap, path.transform);
    }
    return undefined;
}

export default class SvgShape extends SvgElement implements squared.svg.SvgShape {
    public static synchronizeAnimations(element: SVGGraphicsElement, animate: SvgAnimation[], useKeyTime = true, path?: SvgPath) {
        const animations: SvgAnimate[] = [];
        const tagName = element.tagName;
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
        if (animations.length > 1 || animations.some(item => item.begin.length > 1 || item.end !== undefined || item.additiveSum || !item.fillFreeze)) {
            const repeatingMap: TimelineMap = {};
            const indefiniteMap: TimelineMap = {};
            const indefiniteStaticMap: TimelineMap = {};
            const repeatingAnimations: SvgAnimate[] = [];
            const indefiniteAnimations: SvgAnimate[] = [];
            const freezeMap: FreezeMap = {};
            const keyTimeMapList: KeyTimeMap[] = [];
            let repeatingDurationTotal = 0;
            let indefiniteDurationTotal = 0;
            animations.forEach(item => {
                const attr = item.attributeName;
                if (indefiniteMap[attr] === undefined && freezeMap[attr] === undefined && item.begin.length) {
                    let maxTime = -1;
                    if (item.repeatCount === -1) {
                        indefiniteStaticMap[attr] = new Map<number, number>();
                        for (let i = 0; i < item.keyTimes.length; i++) {
                            indefiniteStaticMap[attr].set(item.keyTimes[i] * item.duration, getItemValue(element, path, item, i));
                        }
                        if (item.begin.some(value => value > 0)) {
                            indefiniteMap[attr] = new Map<number, number>();
                            for (let i = 0; i < item.begin.length; i++) {
                                const begin = item.begin[i];
                                const maxThreadTime = item.begin[i + 1] !== undefined ? item.begin[i + 1] : Number.MAX_VALUE;
                                for (let j = 0; j < item.keyTimes.length; j++) {
                                    const time = begin + item.keyTimes[j] * item.duration;
                                    if (time >= maxThreadTime) {
                                        const insertTime = insertSplitKeyTimeValue(indefiniteMap[attr], element, path, item, 0, begin, maxThreadTime - 1);
                                        if (insertTime !== -1) {
                                            maxTime = insertTime;
                                        }
                                        break;
                                    }
                                    else if (time > maxTime) {
                                        indefiniteMap[attr].set(time, getItemValue(element, path, item, j));
                                        maxTime = time;
                                    }
                                }
                            }
                        }
                        indefiniteAnimations.push(item);
                    }
                    else {
                        let parallel = false;
                        let included = false;
                        if (repeatingMap[attr] === undefined) {
                            repeatingMap[attr] = new Map<number, number>();
                        }
                        else {
                            maxTime = Array.from(repeatingMap[attr].keys()).pop() as number;
                            if (item.end !== undefined && item.end <= maxTime) {
                                return;
                            }
                            parallel = true;
                        }
                        for (let i = 0; i < item.begin.length; i++) {
                            const begin = item.begin[i];
                            const duration = item.duration;
                            const repeatCount = item.repeatCount;
                            const durationTotal = duration * repeatCount;
                            if (item.end === undefined && begin + durationTotal <= maxTime) {
                                return;
                            }
                            const repeatTotal = Math.ceil(repeatCount);
                            const repeatFraction = repeatCount - Math.floor(repeatCount);
                            const maxThreadTime = $util.minArray([item.begin[i + 1] !== undefined ? item.begin[i + 1] : Number.MAX_VALUE, item.end !== undefined ? item.end : Number.MAX_VALUE]);
                            for (let j = Math.floor(Math.max(0, maxTime - begin) / duration); j < repeatTotal; j++) {
                                for (let k = 0; k < item.keyTimes.length; k++) {
                                    const fraction = item.keyTimes[k];
                                    let time: number | undefined;
                                    let value = getItemValue(element, path, item, k, j);
                                    let finalTimeValue = false;
                                    if (j === repeatTotal - 1 && repeatFraction > 0 && repeatFraction >= fraction) {
                                        for (let l = k + 1; l < item.keyTimes.length; l++) {
                                            if (repeatFraction < item.keyTimes[l]) {
                                                time = begin + durationTotal;
                                                value = getSplitValue(repeatFraction, fraction, item.keyTimes[l], value, getItemValue(element, path, item, l, j));
                                                finalTimeValue = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (time === undefined) {
                                        time = begin + (fraction + j) * duration;
                                        if (time === maxThreadTime) {
                                            finalTimeValue = true;
                                        }
                                        else {
                                            const adjustKeyTimeValue = (fromMaxThread: boolean, splitTime: number) => {
                                                const insertTime = insertSplitKeyTimeValue(repeatingMap[attr], element, path, item, j, begin, splitTime + (fromMaxThread && !repeatingMap[attr].has(splitTime) ? 0 : 1));
                                                if (insertTime !== -1) {
                                                    maxTime = insertTime;
                                                    included = true;
                                                    return true;
                                                }
                                                return false;
                                            };
                                            if (time > maxThreadTime) {
                                                if (adjustKeyTimeValue(false, maxThreadTime)) {
                                                    break;
                                                }
                                                else {
                                                    finalTimeValue = true;
                                                }
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
                                                            adjustKeyTimeValue(true, maxTime);
                                                        }
                                                    }
                                                    parallel = false;
                                                }
                                                else if (j > 0 && k === 0) {
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
                                        repeatingMap[attr].set(time, value);
                                        maxTime = time;
                                        included = true;
                                    }
                                    if (finalTimeValue) {
                                        break;
                                    }
                                }
                            }
                        }
                        if (included) {
                            if (item.fillFreeze) {
                                const value = repeatingMap[attr].get(maxTime);
                                if (value !== undefined) {
                                    freezeMap[attr] = { time: maxTime, value };
                                }
                            }
                            repeatingAnimations.push(item);
                        }
                    }
                }
            });
            if (repeatingAnimations.length) {
                for (const attr in indefiniteStaticMap) {
                    if (repeatingMap[attr] === undefined) {
                        if (indefiniteMap[attr]) {
                            repeatingMap[attr] = indefiniteMap[attr];
                            indefiniteMap[attr] = undefined as any;
                        }
                        else {
                            repeatingMap[attr] = indefiniteStaticMap[attr];
                        }
                    }
                }
                const keyTimesRepeating: number[] = [];
                for (const attr in repeatingMap) {
                    keyTimesRepeating.push(...repeatingMap[attr].keys());
                }
                const repeatingEndTime = $util.maxArray(keyTimesRepeating);
                for (const attr in repeatingMap) {
                    const insertMap = repeatingMap[attr];
                    let endTime = $util.maxArray(Array.from(insertMap.keys()));
                    let modified = false;
                    if (indefiniteMap[attr]) {
                        const baseMap = indefiniteMap[attr];
                        if (endTime >= baseMap.keys().next().value) {
                            for (let [time, value] of baseMap.entries()) {
                                time += insertMap.has(time) ? 1 : 0;
                                insertMap.set(time, value);
                            }
                            modified = true;
                        }
                        else {
                            let joined = false;
                            for (let [time, value] of baseMap.entries()) {
                                if (time >= endTime) {
                                    if (!joined) {
                                        const joinTime = endTime + 1;
                                        if (time === endTime) {
                                            time = joinTime;
                                        }
                                        else if (insertSplitTimeValue(baseMap, insertMap, joinTime)) {
                                            keyTimesRepeating.push(joinTime);
                                        }
                                        joined = true;
                                    }
                                    insertMap.set(time, value);
                                    keyTimesRepeating.push(time);
                                    endTime = time;
                                    modified = true;
                                }
                            }
                        }
                    }
                    if (indefiniteStaticMap[attr] && endTime < repeatingEndTime) {
                        let maxTime = endTime;
                        do {
                            let insertTime = -1;
                            for (const [time, data] of indefiniteStaticMap[attr].entries()) {
                                insertTime = maxTime + time;
                                insertTime += insertMap.has(insertTime) ? 1 : 0;
                                insertMap.set(insertTime, data);
                                keyTimesRepeating.push(insertTime);
                            }
                            maxTime = insertTime;
                        }
                        while (maxTime < repeatingEndTime);
                        modified = true;
                    }
                    if (!modified && indefiniteStaticMap[attr] === undefined && freezeMap[attr] === undefined) {
                        const replaceTime = endTime + 1;
                        let value: number | undefined;
                        if (path && path.baseVal[attr] !== null) {
                            value = path.baseVal[attr];
                        }
                        else {
                            const optional = $util.optionalAsObject(element, `${attr}.baseVal.value`);
                            if (typeof optional === 'number') {
                                value = optional;
                            }
                        }
                        if (value !== undefined && insertMap.get(endTime) !== value) {
                            insertMap.set(replaceTime, value);
                            keyTimesRepeating.push(replaceTime);
                        }
                    }
                }
                const keyTimes = sortNumberAsc(Array.from(new Set(keyTimesRepeating)));
                const repeatingResult: TimelineMap = {};
                for (const attr in repeatingMap) {
                    const baseMap = repeatingMap[attr];
                    const insertMap = new Map<number, number>();
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
                for (const attr in indefiniteStaticMap) {
                    indefiniteResult[attr] = new Map<number, number>();
                    const object = indefiniteAnimations.find(item => item.attributeName === attr);
                    if (object) {
                        let maxTime = 0;
                        let i = 0;
                        do {
                            for (let [time, value] of indefiniteStaticMap[attr].entries()) {
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
                keyTimes = sortNumberAsc(Array.from(new Set(keyTimes)));
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
                const sequentialName = animations.map(item => item.attributeName).join('-');
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
                            item.duration = indefiniteDurationTotal;
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
                            const pathData = getKeyTimePath(keyTimeMap, path, freezeIndefinite);
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
                                setXY(data);
                                object.keyTimes.push(keyTime);
                                object.values.push(`${x} ${y}`);
                            }
                        }
                        if (repeating) {
                            object.begin = [0];
                            object.duration = repeatingDurationTotal;
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
                                const map = new Map<number, Map<string, number>>();
                                map.set(keyTimeFrom, dataFrom);
                                map.set(keyTimeTo, dataTo);
                                const pathData = getKeyTimePath(map, path, freezeIndefinite);
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
                                object.values = [dataFrom, dataTo].map(item => {
                                    setXY(item);
                                    return `${x} ${y}`;
                                });
                                name = sequentialName + j;
                            }
                            if (repeating) {
                                object.begin = [j === 0 ? keyTimeFrom : 0];
                                object.duration = keyTimeTo - keyTimeFrom;
                            }
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

    public path: SvgPath | undefined;

    constructor(public readonly element: SVGGraphicsElement) {
        super(element);
        const path = new SvgPath(element);
        if (path.d && path.d !== 'none') {
            this.setPath(path);
        }
    }

    public setPath(value: SvgPath | string) {
        if (typeof value === 'string') {
            value = new SvgPath(this.element, value);
        }
        this.path = value;
        for (const item of this.animate) {
            if (item instanceof SvgAnimate) {
                item.parentPath = value;
            }
        }
    }

    public synchronize(useKeyTime = true) {
        if (this.path && this.animate.length) {
            SvgShape.synchronizeAnimations(this.element, this.animate, useKeyTime, this.path);
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