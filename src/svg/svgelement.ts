import SvgAnimate from './svganimate';
import SvgAnimateMotion from './svganimatemotion';
import SvgAnimateTransform from './svganimatetransform';
import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';
import SvgPath from './svgpath';

import { getLeastCommonMultiple, getTransformOrigin, isVisible } from './lib/util';

import $util = squared.lib.util;

type TimelineIndex = Map<number, TimelineValue>;

type TimelineMap = {
    [key: string]: TimelineIndex;
};

type TimelineValue = {
    value: number;
    begin?: number;
    duration?: number;
};

type KeyTimeValue<T> = {
    time: number;
    value: T;
};

type KeyTimeMap = Map<number, Map<string, number>>;

type FreezeMap = ObjectMap<KeyTimeValue<number>>;

function insertSplitKeyTimeValue(insertMap: TimelineIndex, iteration: number, begin: number, duration: number, keyTimes: number[], values: string[], maxTime: number, finalTimeValue: boolean) {
    maxTime += finalTimeValue ? -1 : 1;
    const fraction = (maxTime - (begin + duration * iteration)) / duration;
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
        const value = getSplitValue(fraction, keyTimes[previousIndex], keyTimes[nextIndex], parseFloat(values[previousIndex]), parseFloat(values[nextIndex]));
        insertMap.set(maxTime, { begin, duration, value });
        return maxTime;
    }
    else {
        return -1;
    }
}

function getSplitValue(fraction: number, previousFraction: number, nextFraction: number, previousValue: number, nextValue: number) {
    return previousValue + ((fraction - previousFraction) / (nextFraction - previousFraction)) * (nextValue - previousValue);
}

function insertSplitTimeValue(baseMap: TimelineIndex, insertMap: TimelineIndex, keyTime: number) {
    let previous: KeyTimeValue<number> | undefined;
    let next: KeyTimeValue<number> | undefined;
    for (const [time, data] of baseMap.entries()) {
        if (previous && keyTime < time) {
            next = { time, value: data.value };
            break;
        }
        if (keyTime > time) {
            previous = { time, value: data.value };
        }
    }
    if (previous && next) {
        insertMap.set(keyTime, { value: getSplitValue(keyTime, previous.time, next.time, previous.value, next.value) });
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

function getPathData(path: SvgPath, map: KeyTimeMap, methodName: string, attrs: string[], freezeMap?: FreezeMap, transform?: SVGTransformList) {
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
            if (transform && transform.numberOfItems) {
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

function getKeyTimeMap(keyTimes: number[], timelineMap: TimelineMap, freezeMap?: FreezeMap) {
    const result = new Map<number, Map<string, number>>();
    for (const keyTime of keyTimes) {
        const values = new Map<string, number>();
        for (const attr in timelineMap) {
            const item = timelineMap[attr].get(keyTime);
            if (item) {
                values.set(attr, item.value);
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

export default class SvgElement implements squared.svg.SvgElement {
    public static toAnimateList(element: SVGGraphicsElement) {
        const result: SvgAnimation[] = [];
        for (let i = 0; i < element.children.length; i++) {
            const item = element.children[i];
            if (item instanceof SVGAnimateTransformElement) {
                result.push(new SvgAnimateTransform(item, element));
            }
            else if (item instanceof SVGAnimateMotionElement) {
                result.push(new SvgAnimateMotion(item, element));
            }
            else if (item instanceof SVGAnimateElement) {
                result.push(new SvgAnimate(item, element));
            }
            else if (item instanceof SVGAnimationElement) {
                result.push(new SvgAnimation(item, element));
            }
        }
        return result;
    }

    public path: SvgPath | undefined;
    public animate: SvgAnimation[];

    public readonly name: string;
    public readonly visible: boolean;

    constructor(public readonly element: SVGGraphicsElement) {
        this.name = SvgBuild.setName(element);
        this.animate = this.animatable ? SvgElement.toAnimateList(element) : [];
        this.visible = isVisible(element);
        if (this.drawable) {
            const path = new SvgPath(element);
            if (path.d && path.d !== 'none') {
                this.path = path;
            }
        }
    }

    public synchronizePath() {
        const path = this.path;
        if (path && this.animate.length)  {
            const tagName = this.element.tagName;
            const animations: SvgAnimate[] = [];
            for (const item of this.animate) {
                if (item instanceof SvgAnimate && item.keyTimes.length > 1 && item.duration > 0) {
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
                        case 'width':
                        case 'height':
                            if (tagName === 'rect') {
                                animations.push(item);
                            }
                            break;
                    }
                }
            }
            if (animations.length > 1 || animations.some(item => item.begin.length > 1)) {
                const indefiniteMap: TimelineMap = {};
                const repeatingMap: TimelineMap = {};
                const indefiniteStaticMap: TimelineMap = {};
                const indefiniteAnimations: SvgAnimate[] = [];
                const repeatingAnimations: SvgAnimate[] = [];
                const freezeMap: FreezeMap = {};
                const keyTimeMapList: KeyTimeMap[] = [];
                let repeatingDurationTotal = 0;
                let indefiniteDurationTotal = 0;
                animations.forEach(item => {
                    const attr = item.attributeName;
                    if (indefiniteMap[attr] === undefined && freezeMap[attr] === undefined && item.begin.length) {
                        let maxTime = -1;
                        if (item.repeatCount === -1) {
                            indefiniteStaticMap[attr] = new Map<number, TimelineValue>();
                            for (let i = 0; i < item.keyTimes.length; i++) {
                                indefiniteStaticMap[attr].set(item.keyTimes[i] * item.duration, { begin: 0, duration: item.duration, value: parseFloat(item.values[i]) });
                            }
                            if (item.begin.some(value => value > 0)) {
                                indefiniteMap[attr] = new Map<number, TimelineValue>();
                                for (let i = 0; i < item.begin.length; i++) {
                                    const begin = item.begin[i];
                                    const maxThreadTime = item.begin[i + 1] !== undefined ? item.begin[i + 1] : Number.MAX_VALUE;
                                    for (let j = 0; j < item.keyTimes.length; j++) {
                                        const time = begin + item.keyTimes[j] * item.duration;
                                        if (time >= maxThreadTime) {
                                            const insertTime = insertSplitKeyTimeValue(indefiniteMap[attr], i, begin, item.duration, item.keyTimes, item.values, maxThreadTime, true);
                                            if (insertTime !== -1) {
                                                maxTime = insertTime;
                                            }
                                            break;
                                        }
                                        else if (time > maxTime) {
                                            indefiniteMap[attr].set(time, { begin, duration: item.duration, value: parseFloat(item.values[j]) });
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
                                repeatingMap[attr] = new Map<number, TimelineValue>();
                            }
                            else {
                                maxTime = $util.maxArray(Array.from(repeatingMap[attr].keys()));
                                parallel = true;
                            }
                            for (let i = 0; i < item.begin.length; i++) {
                                const begin = item.begin[i];
                                const maxThreadTime = item.begin[i + 1] !== undefined ? item.begin[i + 1] : Number.MAX_VALUE;
                                const duration = item.duration;
                                const repeatCount = item.repeatCount;
                                const durationTotal = duration * repeatCount;
                                if (begin + durationTotal <= maxTime) {
                                    return;
                                }
                                const repeatTotal = Math.ceil(repeatCount);
                                const repeatFraction = repeatCount - Math.floor(repeatCount);
                                for (let j = Math.floor(Math.max(0, maxTime - begin) / duration); j < repeatTotal; j++) {
                                    for (let k = 0; k < item.keyTimes.length; k++) {
                                        const fraction = item.keyTimes[k];
                                        let time: number | undefined;
                                        let value = parseFloat(item.values[k]);
                                        let finalTimeValue = false;
                                        if (j === repeatTotal - 1 && repeatFraction > 0 && repeatFraction >= fraction) {
                                            for (let l = k + 1; l < item.keyTimes.length; l++) {
                                                if (repeatFraction < item.keyTimes[l]) {
                                                    time = begin + durationTotal;
                                                    value = getSplitValue(repeatFraction, fraction, item.keyTimes[l], value, parseFloat(item.values[l]));
                                                    finalTimeValue = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (time === undefined) {
                                            time = begin + (fraction + j) * duration;
                                            if (time >= maxThreadTime) {
                                                maxTime = maxThreadTime;
                                                finalTimeValue = true;
                                            }
                                            if (parallel || finalTimeValue) {
                                                if (!finalTimeValue && begin >= maxTime) {
                                                    time = Math.max(begin, maxTime + 1);
                                                }
                                                else {
                                                    if (!finalTimeValue && time < maxTime) {
                                                        continue;
                                                    }
                                                    else if (!finalTimeValue && time === maxTime) {
                                                        time = maxTime + 1;
                                                    }
                                                    else {
                                                        const insertTime = insertSplitKeyTimeValue(repeatingMap[attr], j, begin, duration, item.keyTimes, item.values, maxTime, finalTimeValue);
                                                        if (insertTime !== -1) {
                                                            maxTime = insertTime;
                                                            included = true;
                                                        }
                                                        if (finalTimeValue) {
                                                            break;
                                                        }
                                                    }
                                                }
                                                parallel = false;
                                            }
                                            else if (j > 0 && k === 0) {
                                                time = Math.max(time, maxTime + 1);
                                            }
                                        }
                                        if (time > maxTime) {
                                            repeatingMap[attr].set(time, { begin, duration, value });
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
                                    const data = repeatingMap[attr].get(maxTime);
                                    if (data) {
                                        freezeMap[attr] = { time: maxTime, value: data.value };
                                    }
                                }
                                repeatingAnimations.push(item);
                            }
                        }
                    }
                });
                if (repeatingAnimations.length) {
                    for (const attr in indefiniteMap) {
                        if (repeatingMap[attr] === undefined) {
                            repeatingMap[attr] = indefiniteMap[attr];
                            indefiniteMap[attr] = undefined as any;
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
                            const baseKeyTimes = Array.from(baseMap.keys());
                            if (endTime >= baseKeyTimes[0]) {
                                for (let [time, data] of baseMap.entries()) {
                                    time += insertMap.has(time) ? 1 : 0;
                                    insertMap.set(time, { value: data.value });
                                }
                                modified = true;
                            }
                            else {
                                let joined = false;
                                for (let [time, data] of baseMap.entries()) {
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
                                        insertMap.set(time, { value: data.value });
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
                        if (!modified && indefiniteMap[attr] === undefined && freezeMap[attr] === undefined && path.baseVal[attr] !== null) {
                            insertMap.set(endTime + 1, { value: path.baseVal[attr] });
                        }
                    }
                    const keyTimes = Array.from(new Set(keyTimesRepeating)).sort((a, b) => a < b ? -1 : 1);
                    const repeatingResult: TimelineMap = {};
                    for (const attr in repeatingMap) {
                        const baseMap = repeatingMap[attr];
                        const insertMap = new Map<number, TimelineValue>();
                        const maxTime = Array.from(baseMap.keys()).pop() as number;
                        for (let i = 1; i < keyTimes.length; i++) {
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
                    keyTimeMapList.push(convertKeyTimeFraction(
                        getKeyTimeMap(keyTimes, repeatingResult, freezeMap),
                        repeatingDurationTotal
                    ));
                }
                if (indefiniteAnimations.length) {
                    indefiniteDurationTotal = getLeastCommonMultiple(indefiniteAnimations.map(item => item.duration));
                    const indefiniteResult: TimelineMap = {};
                    let keyTimes: number[] = [];
                    for (const attr in indefiniteStaticMap) {
                        indefiniteResult[attr] = new Map<number, TimelineValue>();
                        let maxTime = 0;
                        let i = 0;
                        do {
                            for (let [time, data] of indefiniteStaticMap[attr].entries()) {
                                time += (data.duration as number) * i;
                                indefiniteResult[attr].set(time, { value: data.value });
                                keyTimes.push(time);
                                maxTime = time;
                            }
                            i++;
                        }
                        while (maxTime < indefiniteDurationTotal);
                    }
                    keyTimes = Array.from(new Set(keyTimes)).sort((a, b) => a < b ? -1 : 1);
                    for (const attr in indefiniteResult) {
                        const baseMap = indefiniteResult[attr];
                        for (let i = 1; i < keyTimes.length; i++) {
                            const keyTime = keyTimes[i];
                            if (!baseMap.has(keyTime)) {
                                insertSplitTimeValue(baseMap, baseMap, keyTime);
                            }
                        }
                    }
                    keyTimeMapList.push(convertKeyTimeFraction(
                        getKeyTimeMap(keyTimes, indefiniteResult),
                        keyTimes[keyTimes.length - 1]
                    ));
                }
                if (keyTimeMapList.length) {
                    this.animate = this.animate.filter(item => !animations.includes(<SvgAnimate> item));
                    for (let i = 0; i < keyTimeMapList.length; i++) {
                        const keyMap = keyTimeMapList[i];
                        const freezeIndefinite = repeatingDurationTotal === 0 || i > 0 ? freezeMap : undefined;
                        let pathData: KeyTimeValue<string>[] | undefined;
                        switch (tagName) {
                            case 'circle':
                                pathData = getPathData(path, keyMap, 'getCircle', ['cx', 'cy', 'r'], freezeIndefinite);
                                break;
                            case 'ellipse':
                                pathData = getPathData(path, keyMap, 'getEllipse', ['cx', 'cy', 'rx', 'ry'], freezeIndefinite);
                                break;
                            case 'line':
                                pathData = getPathData(path, keyMap, 'getLine', ['x1', 'y1', 'x2', 'y2'], freezeIndefinite, this.transform);
                                break;
                            case 'rect':
                                pathData = getPathData(path, keyMap, 'getRect', ['width', 'height', 'x', 'y'], freezeIndefinite, this.transform);
                                break;
                        }
                        if (pathData) {
                            const repeating = i === 0 && repeatingDurationTotal > 0;
                            const animate = new SvgAnimate(repeating ? repeatingAnimations[0].element : indefiniteAnimations[0].element, this.element);
                            animate.attributeName = 'd';
                            if (repeating) {
                                animate.begin = [0];
                                animate.duration = repeatingDurationTotal;
                                animate.repeatCount = 0;
                            }
                            else {
                                animate.begin = [repeatingDurationTotal];
                                animate.duration = indefiniteDurationTotal;
                                animate.repeatCount = -1;
                            }
                            animate.end.length = 0;
                            animate.keyTimes = pathData.map(item => item.time);
                            animate.values = pathData.map(item => item.value.toString());
                            animate.from = animate.values[0];
                            animate.to = animate.values[animate.values.length - 1];
                            animate.by = '';
                            this.animate.push(animate);
                        }
                    }
                }
            }
        }
    }

    get transform() {
        return this.element.transform.baseVal;
    }

    get drawable() {
        return true;
    }

    get animatable() {
        return true;
    }

    get transformable() {
        return this.transform.numberOfItems > 0;
    }
}