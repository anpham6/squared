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
    freeze?: boolean;
};

type KeyTimeValue<T> = {
    timeMS: number;
    value: T;
};

type KeyTimeMap = Map<number, Map<string, number>>;

type FreezeMap = ObjectIndex<KeyTimeValue<number>>;

function getSplitValue(time: number, previousTime: number, nextTime: number, previousValue: number, nextValue: number) {
    return previousValue + ((time - previousTime) / (nextTime - previousTime)) * (nextValue - previousValue);
}

function getAdjacentTimeValue(timeline: TimelineIndex, keyTime: number) {
    let previous: KeyTimeValue<number> | undefined;
    let next: KeyTimeValue<number> | undefined;
    for (const [timeMS, data] of timeline.entries()) {
        if (previous && keyTime < timeMS) {
            next = { timeMS, value: data.value };
            break;
        }
        if (keyTime > timeMS) {
            previous = { timeMS, value: data.value };
        }
    }
    return [previous, next];
}

function convertKeyTimeFraction(map: KeyTimeMap, totalMS: number) {
    const result = new Map<number, Map<string, number>>();
    for (const [timeMS, data] of map.entries()) {
        let fraction = timeMS / totalMS;
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
    for (const [timeMS, data] of map.entries()) {
        const values: number[] = [];
        attrs.forEach(attr => {
            if (data.has(attr)) {
                values.push(data.get(attr) as number);
            }
            else if (freezeMap && freezeMap[attr] !== undefined) {
                values.push(freezeMap[attr]);
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
            result.push({ timeMS, value });
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
            if (animations.length > 1) {
                const indefiniteMap: TimelineMap = {};
                const repeatingMap: TimelineMap = {};
                const freezeMap: FreezeMap = {};
                const indefiniteDuration: number[] = [];
                const keyTimeMapList: KeyTimeMap[] = [];
                let repeatingDurationTotal = 0;
                let indefiniteDurationTotal = 0;
                animations.forEach(item => {
                    const attr = item.attributeName;
                    if (indefiniteMap[attr] === undefined && freezeMap[attr] === undefined) {
                        if (item.repeatCount === -1) {
                            indefiniteMap[attr] = new Map<number, TimelineValue>();
                            const begin = item.begin !== -1 ? item.begin : 0;
                            indefiniteDuration.push(begin + item.duration);
                            for (let i = 0; i < item.keyTimes.length; i++) {
                                indefiniteMap[attr].set(begin + item.keyTimes[i] * item.duration, { value: parseFloat(item.values[i]), begin, duration: item.duration });
                            }
                        }
                        else {
                            let maxTimeMS = -1;
                            let fillFreeze = false;
                            let parallel = false;
                            if (repeatingMap[attr] === undefined) {
                                repeatingMap[attr] = new Map<number, TimelineValue>();
                            }
                            else {
                                maxTimeMS = $util.maxArray(Array.from(repeatingMap[attr].keys()));
                                fillFreeze = !!(Array.from(repeatingMap[attr].values()).pop() as TimelineValue).freeze;
                                parallel = true;
                            }
                            const durationMS = item.duration;
                            const repeatCount = item.repeatCount;
                            if (maxTimeMS >= (repeatCount + 1) * durationMS) {
                                return;
                            }
                            const repeatTotal = Math.ceil(repeatCount);
                            const repeatExcessTime = repeatCount - Math.floor(repeatCount);
                            const begin = item.begin !== -1 ? item.begin : 0;
                            let itemValue: TimelineValue | undefined;
                            for (let i = maxTimeMS >= durationMS ? Math.floor(maxTimeMS / durationMS) : 0; i <= repeatTotal; i++) {
                                const beginMS = begin * (i + 1);
                                for (let j = 0; j < item.keyTimes.length; j++) {
                                    const keyTime = item.keyTimes[j];
                                    let nextKeyTime: number | undefined;
                                    let timeMS: number | undefined;
                                    let value = parseFloat(item.values[j]);
                                    if (j === 0) {
                                        const from = item.element.attributes.getNamedItem('values') || item.element.attributes.getNamedItem('from');
                                        if (from === null) {
                                            const previous = Array.from(repeatingMap[attr].values()).reverse().find(subitem => !!subitem.freeze);
                                            if (previous) {
                                                value = previous.value;
                                            }
                                        }
                                    }
                                    if (i === repeatTotal && repeatExcessTime > keyTime) {
                                        nextKeyTime = item.keyTimes[j + 1];
                                        if (nextKeyTime !== undefined && repeatExcessTime < nextKeyTime) {
                                            timeMS = repeatCount * durationMS;
                                            value = getSplitValue(repeatExcessTime, keyTime, nextKeyTime, value, parseFloat(item.values[j + 1]));
                                        }
                                        else {
                                            nextKeyTime = undefined;
                                        }
                                    }
                                    if (timeMS === undefined) {
                                        timeMS = (keyTime + i) * durationMS;
                                        if (j === 0 && (i > 0 || parallel)) {
                                            if (parallel) {
                                                const maxTimeAdjustedMS = maxTimeMS + (fillFreeze ? 0 : -1);
                                                if (beginMS >= maxTimeAdjustedMS) {
                                                    timeMS = Math.max(beginMS, maxTimeMS + 1);
                                                }
                                                else {
                                                    const excessTimeMS = maxTimeAdjustedMS % (begin + durationMS);
                                                    if (excessTimeMS !== 0) {
                                                        const currentTime = (excessTimeMS - begin) / durationMS;
                                                        let previous = -1;
                                                        let next = -1;
                                                        for (let k = 0; k < item.keyTimes.length; k++) {
                                                            if (previous !== -1 && currentTime < item.keyTimes[k]) {
                                                                next = k;
                                                                break;
                                                            }
                                                            if (currentTime > item.keyTimes[k]) {
                                                                previous = k;
                                                            }
                                                        }
                                                        if (previous !== -1 && next !== -1) {
                                                            value = getSplitValue(currentTime, item.keyTimes[previous], item.keyTimes[next], parseFloat(item.values[previous]), parseFloat(item.values[next]));
                                                        }
                                                        timeMS = maxTimeMS + 1;
                                                    }
                                                    else {
                                                        value = parseFloat(item.values[0]);
                                                        timeMS = Math.max(beginMS + timeMS, maxTimeMS + 1);
                                                    }
                                                }
                                                parallel = false;
                                            }
                                            else {
                                                timeMS = maxTimeMS + 1;
                                            }
                                        }
                                    }
                                    else {
                                        timeMS += beginMS;
                                    }
                                    if (timeMS > maxTimeMS) {
                                        itemValue = { value };
                                        repeatingMap[attr].set(timeMS, itemValue);
                                        maxTimeMS = timeMS;
                                    }
                                    if (nextKeyTime) {
                                        break;
                                    }
                                }
                            }
                            if (itemValue) {
                                if (item.fillFreeze) {
                                    itemValue.freeze = item.fillFreeze;
                                    freezeMap[attr] = { timeMS: maxTimeMS, value: itemValue.value };
                                }
                                else {
                                    repeatingMap[attr].set(maxTimeMS + 1, { value: parseFloat(item.values[0]) });
                                }
                            }
                        }
                    }
                });
                const hasRepeating = Object.keys(repeatingMap).length > 0;
                if (hasRepeating) {
                    let keyTimes: number[] = [];
                    for (const attr in repeatingMap) {
                        keyTimes.push(...repeatingMap[attr].keys());
                    }
                    keyTimes = Array.from(new Set(keyTimes)).sort((a, b) => a < b ? -1 : 1);
                    for (const attr in indefiniteMap) {
                        const duration = indefiniteMap[attr].values().next().value.duration as number;
                        const maxTime = keyTimes[keyTimes.length - 1];
                        for (let i = 1; ; i++) {
                            const time = duration * i;
                            if (time === maxTime) {
                                break;
                            }
                            if (time > maxTime) {
                                keyTimes.push(time);
                                break;
                            }
                        }
                    }
                    const indefiniteResult: TimelineMap = {};
                    const repeatingResult: TimelineMap = {};
                    [[indefiniteMap, indefiniteResult], [repeatingMap, repeatingResult]].forEach(item => {
                        const repeatMap = item[0];
                        const resultMap = item[1];
                        for (const attr in repeatMap) {
                            const map = repeatMap[attr];
                            const maxTime = Array.from(map.keys()).pop() as number;
                            const keyTimeCount = keyTimes.length + (repeatMap === repeatingMap ? -1 : 0);
                            resultMap[attr] = new Map<number, TimelineValue>();
                            for (let i = 1; i < keyTimeCount; i++) {
                                const keyTime = keyTimes[i];
                                if (repeatMap === repeatingMap && keyTime >= maxTime) {
                                    break;
                                }
                                const value = map.get(keyTime);
                                if (value === undefined) {
                                    let previous: KeyTimeValue<number> | undefined;
                                    let next: KeyTimeValue<number> | undefined;
                                    let time: number;
                                    if (repeatMap === repeatingMap) {
                                        [previous, next] = getAdjacentTimeValue(map, keyTime);
                                        time = keyTime;
                                    }
                                    else {
                                        const data = Array.from(map.values());
                                        const duration = data[1].duration as number;
                                        previous = { timeMS: 0, value: data[0].value };
                                        next = { timeMS: duration, value: data[1].value };
                                        time = keyTime % duration !== 0 ? (keyTime > duration ? keyTime % duration : keyTime) : duration;
                                    }
                                    if (previous && next) {
                                        resultMap[attr].set(keyTime, { value: getSplitValue(time, previous.timeMS, next.timeMS, previous.value, next.value) });
                                    }
                                }
                                else {
                                    resultMap[attr].set(keyTime, value);
                                }
                            }
                        }
                    });
                    const keyTimeMap = new Map<number, Map<string, number>>();
                    for (const keyTime of keyTimes) {
                        const values = new Map<string, number>();
                        [indefiniteResult, repeatingResult].forEach(map => {
                            for (const attr in map) {
                                const item = map[attr].get(keyTime);
                                if (item) {
                                    values.set(attr, item.value);
                                }
                            }
                        });
                        keyTimeMap.set(keyTime, values);
                    }
                    for (const attr in freezeMap) {
                        const item = freezeMap[attr];
                        for (const [time, data] of keyTimeMap.entries()) {
                            if (time > item.timeMS && !data.has(attr)) {
                                data.set(attr, item.value);
                            }
                        }
                    }
                    repeatingDurationTotal = keyTimes[keyTimes.length - 1];
                    keyTimeMapList.push(convertKeyTimeFraction(keyTimeMap, repeatingDurationTotal));
                }
                if (indefiniteDuration.length > 1) {
                    indefiniteDurationTotal = getLeastCommonMultiple(indefiniteDuration);
                    const indefiniteOffsetMap: TimelineMap = {};
                    const keyTimeSet = new Set<number>();
                    for (const attr in indefiniteMap) {
                        indefiniteOffsetMap[attr] = new Map<number, TimelineValue>();
                        let i = 0;
                        let maxTime = 0;
                        do {
                            let j = 0;
                            for (let [time, data] of indefiniteMap[attr].entries()) {
                                if (i > 0 && j++ === 0) {
                                    time++;
                                }
                                time += ((data.begin as number) + (data.duration as number)) * i;
                                indefiniteOffsetMap[attr].set(time, { value: data.value });
                                keyTimeSet.add(time);
                                maxTime = time;
                            }
                            i++;
                        }
                        while (maxTime < indefiniteDurationTotal);
                    }
                    const keyTimes = Array.from(keyTimeSet).sort((a, b) => a < b ? -1 : 1);
                    for (const attr in indefiniteOffsetMap) {
                        const map = indefiniteOffsetMap[attr];
                        for (let i = 1; i < keyTimes.length; i++) {
                            const keyTime = keyTimes[i];
                            if (!map.has(keyTime)) {
                                const [previous, next] = getAdjacentTimeValue(map, keyTime);
                                if (previous && next) {
                                    map.set(keyTime, { value: getSplitValue(keyTime, previous.timeMS, next.timeMS, previous.value, next.value) });
                                }
                            }
                        }
                    }
                    const keyTimeMap = new Map<number, Map<string, number>>();
                    for (const keyTime of keyTimes) {
                        const values = new Map<string, number>();
                        for (const attr in indefiniteOffsetMap) {
                            const item = indefiniteOffsetMap[attr].get(keyTime);
                            if (item) {
                                values.set(attr, item.value);
                            }
                        }
                        keyTimeMap.set(keyTime, values);
                    }
                    keyTimeMapList.push(convertKeyTimeFraction(keyTimeMap, keyTimes[keyTimes.length - 1]));
                }
                else {
                    for (const attr in indefiniteMap) {
                        const animate = animations.find(item => item.attributeName === attr && item.repeatCount === -1);
                        if (animate) {
                            if ($util.spliceArray(animations, animate)) {
                                animate.begin = repeatingDurationTotal;
                            }
                        }
                    }
                }
                if (keyTimeMapList.length) {
                    this.animate = this.animate.filter(item => !animations.includes(<SvgAnimate> item));
                    for (let i = 0; i < keyTimeMapList.length; i++) {
                        const keyMap = keyTimeMapList[i];
                        const freezeIndefinite = !hasRepeating || i > 0 ? freezeMap : undefined;
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
                            const animate = new SvgAnimate(animations[0].element, this.element);
                            animate.attributeName = 'd';
                            if (hasRepeating && i === 0) {
                                animate.duration = repeatingDurationTotal;
                                animate.repeatCount = 0;
                            }
                            else {
                                animate.begin = repeatingDurationTotal;
                                animate.duration = indefiniteDurationTotal;
                                animate.repeatCount = -1;
                            }
                            animate.end = 0;
                            animate.keyTimes = pathData.map(item => item.timeMS);
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