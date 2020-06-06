import SvgBuild from './svgbuild';

import { FILL_MODE } from './lib/constant';
import { TRANSFORM } from './lib/util';

type SvgAnimate = squared.svg.SvgAnimate;
type SvgAnimation = squared.svg.SvgAnimation;
type IntervalMap = ObjectMap<ObjectIndex<SvgAnimationIntervalValue<SvgAnimation>[]>>;
type IntervalTime = ObjectMap<Set<number>>;

const { hasValue, safeNestedArray, sortNumber } = squared.lib.util;

function insertIntervalValue(intervalMap: IntervalMap, intervalTimes: IntervalTime, keyName: string, time: number, value: string, endTime = 0, animation?: SvgAnimation, start = false, end = false, fillMode = 0, infinite = false, valueFrom?: string) {
    if (value) {
        safeNestedArray(intervalMap[keyName], time).push({
            time,
            value,
            animation,
            start,
            end,
            endTime,
            fillMode,
            infinite,
            valueFrom
        });
        intervalTimes[keyName].add(time);
    }
}

export default class SvgAnimationIntervalMap implements squared.svg.SvgAnimationIntervalMap {
    public static getGroupEndTime = (item: SvgAnimationAttribute) => item.iterationCount === 'infinite' ? Infinity : item.delay + item.duration * parseInt(item.iterationCount);
    public static getKeyName = (item: SvgAnimation) => item.attributeName + (SvgBuild.isAnimateTransform(item) ? ':' + TRANSFORM.typeAsName(item.type) : '');

    public map: SvgAnimationIntervalAttributeMap<SvgAnimation>;

    constructor(animations: SvgAnimation[], ...attrs: string[]) {
        animations = (attrs.length ? animations.filter(item => attrs.includes(item.attributeName)) : animations.slice(0)).sort((a, b) => {
            if (a.delay === b.delay) {
                return a.group.id < b.group.id ? 1 : -1;
            }
            return a.delay < b.delay ? -1 : 1;
        }) as SvgAnimate[];
        attrs.length = 0;
        const length = animations.length;
        for (let i = 0; i < length; ++i) {
            const item = animations[i];
            const value = SvgAnimationIntervalMap.getKeyName(item);
            if (!attrs.includes(value)) {
                attrs.push(value);
            }
        }
        const map: SvgAnimationIntervalAttributeMap<SvgAnimation> = {};
        const intervalMap: IntervalMap = {};
        const intervalTimes: IntervalTime = {};
        for (let i = 0; i < attrs.length; ++i) {
            const keyName = attrs[i];
            map[keyName] = new Map<number, SvgAnimationIntervalValue<SvgAnimation>[]>();
            intervalMap[keyName] = {};
            intervalTimes[keyName] = new Set<number>();
            const attributeName = keyName.split(':')[0];
            const backwards = animations.filter(item => item.fillBackwards && item.attributeName === attributeName).sort((a, b) => a.group.id < b.group.id ? 1 : -1)[0] as SvgAnimate;
            if (backwards) {
                const delay = backwards.delay;
                insertIntervalValue(intervalMap, intervalTimes, keyName, 0, backwards.values[0], delay, backwards, delay === 0, false, FILL_MODE.BACKWARDS);
            }
        }
        for (let i = 0; i < length; ++i) {
            const item = animations[i];
            const keyName = SvgAnimationIntervalMap.getKeyName(item);
            if (item.baseValue && intervalMap[keyName][-1] === undefined) {
                insertIntervalValue(intervalMap, intervalTimes, keyName, -1, item.baseValue);
            }
            if (item.setterType) {
                const { delay, duration } = item;
                const fillReplace = item.fillReplace && duration > 0;
                insertIntervalValue(intervalMap, intervalTimes, keyName, delay, item.to, fillReplace ? delay + duration : 0, item, fillReplace, !fillReplace, FILL_MODE.FREEZE);
                if (fillReplace) {
                    insertIntervalValue(intervalMap, intervalTimes, keyName, delay + duration, '', 0, item, false, true, FILL_MODE.FREEZE);
                }
            }
            else if (SvgBuild.isAnimate(item) && item.duration > 0) {
                const infinite = item.iterationCount === -1;
                const timeEnd = item.getTotalDuration();
                insertIntervalValue(intervalMap, intervalTimes, keyName, item.delay, item.valueTo, timeEnd, item, true, false, 0, infinite, item.valueFrom);
                if (!infinite && !item.fillReplace) {
                    insertIntervalValue(intervalMap, intervalTimes, keyName, timeEnd, item.valueTo, 0, item, false, true, item.fillForwards ? FILL_MODE.FORWARDS : FILL_MODE.FREEZE);
                }
            }
        }
        for (const keyName in intervalMap) {
            const keyTimes = sortNumber(Array.from(intervalTimes[keyName]));
            const q = keyTimes.length;
            let i = 0;
            while (i < q) {
                const time = keyTimes[i++];
                const values = intervalMap[keyName][time];
                for (let j = 0; j < values.length; ++j) {
                    const interval = values[j];
                    const animation = interval.animation;
                    if (interval.value === '' || animation && interval.start && SvgBuild.isAnimate(animation) && animation.from === '') {
                        let value: Undef<string>;
                        let k: number;
                        for (const group of map[keyName].values()) {
                            const s = group.length;
                            k = 0;
                            while (k < s) {
                                const previous = group[k++];
                                if (interval.animation !== previous.animation && previous.value !== '' && (previous.time === -1 || previous.fillMode === FILL_MODE.FORWARDS || previous.fillMode === FILL_MODE.FREEZE)) {
                                    value = previous.value;
                                    break;
                                }
                            }
                        }
                        if (value) {
                            interval.value = value;
                        }
                        else if (interval.value === '') {
                            values.splice(j--, 1);
                        }
                    }
                }
                if (values.length) {
                    values.sort((a, b) => {
                        if (a.animation && b.animation) {
                            if (a.fillMode === b.fillMode) {
                                return a.animation.group.id < b.animation.group.id ? 1 : -1;
                            }
                            return a.fillMode < b.fillMode ? 1 : -1;
                        }
                        return 0;
                    });
                    map[keyName].set(time, values);
                }
            }
        }
        for (const keyName in map) {
            for (const [timeA, dataA] of map[keyName].entries()) {
                const q = dataA.length;
                let i = 0;
                while (i < q) {
                    const itemA = dataA[i++];
                    const animationA = itemA.animation;
                    if (animationA) {
                        if (itemA.fillMode === FILL_MODE.FREEZE) {
                            const previous: SvgAnimation[] = [];
                            for (const [timeB, dataB] of map[keyName].entries()) {
                                if (timeB < timeA) {
                                    const r = dataB.length;
                                    let j = 0;
                                    while (j < r) {
                                        const itemB = dataB[j++];
                                        if (itemB.start) {
                                            const animation = itemB.animation;
                                            if (animation?.animationElement) {
                                                previous.push(animation);
                                            }
                                        }
                                    }
                                }
                                else {
                                    for (let j = 0; j < dataB.length; ++j) {
                                        const itemB = dataB[j];
                                        if (timeB > timeA) {
                                            if (itemB.end && previous.includes(itemB.animation as SvgAnimation)) {
                                                dataB.splice(j--, 1);
                                            }
                                        }
                                        else if (itemB.end) {
                                            const animation = itemB.animation;
                                            if (animation?.animationElement && animation.group.id < animationA.group.id) {
                                                dataB.splice(j--, 1);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (itemA.fillMode === FILL_MODE.FORWARDS || itemA.infinite) {
                            let forwarded = false;
                            const group = animationA.group;
                            const ordering = group.ordering;
                            if (ordering) {
                                const duration = (animationA as SvgAnimate).getTotalDuration();
                                const name = group.name;
                                let j = 0;
                                while (j < ordering.length) {
                                    const sibling = ordering[j++];
                                    if (sibling.name === name) {
                                        forwarded = true;
                                    }
                                    else if (SvgAnimationIntervalMap.getGroupEndTime(sibling) >= duration) {
                                        break;
                                    }
                                }
                            }
                            const previous: SvgAnimation[] = [];
                            for (const [timeB, dataB] of map[keyName].entries()) {
                                if (!forwarded && timeB < timeA) {
                                    const r = dataB.length;
                                    let j = 0;
                                    while (j < r) {
                                        const itemB = dataB[j++];
                                        if (itemB.start) {
                                            const animationB = itemB.animation;
                                            if (animationB) {
                                                previous.push(animationB);
                                            }
                                        }
                                    }
                                }
                                else {
                                    for (let j = 0; j < dataB.length; ++j) {
                                        const itemB = dataB[j];
                                        if (timeB > timeA) {
                                            const animationB = itemB.animation;
                                            if (forwarded || animationB && (itemB.end && previous.includes(animationB) || !animationA.animationElement && animationB.group.id < animationA.group.id)) {
                                                dataB.splice(j--, 1);
                                            }
                                        }
                                        else if (itemB.end) {
                                            const id = itemB.animation?.group.id || NaN;
                                            if (id < animationA.group.id) {
                                                dataB.splice(j--, 1);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for (const keyName in map) {
            const data = map[keyName];
            for (const [time, entry] of data.entries()) {
                if (entry.length === 0) {
                    data.delete(time);
                }
            }
        }
        this.map = map;
    }

    public has(attr: string, time?: number, animation?: SvgAnimation) {
        const map = this.map[attr];
        if (time !== undefined) {
            if (map && map.has(time)) {
                if (!animation) {
                    return true;
                }
                return map.get(time)!.findIndex(item => item.animation === animation) !== -1;
            }
            return false;
        }
        return !!map;
    }

    public get(attr: string, time: number, playing = false) {
        let value: Undef<string>;
        const map = this.map[attr];
        if (map) {
            for (const [interval, data] of map.entries()) {
                if (interval <= time) {
                    const length = data.length;
                    let i = 0;
                    while (i < length) {
                        const previous = data[i++];
                        if (previous.value !== '' && (previous.time === -1 || previous.end && (previous.fillMode === FILL_MODE.FORWARDS || previous.fillMode === FILL_MODE.FREEZE)) || playing && previous.start && time !== interval) {
                            value = previous.value;
                            break;
                        }
                    }
                }
                else {
                    break;
                }
            }
        }
        return value;
    }

    public paused(attr: string, time: number) {
        let value = 0;
        const map = this.map[attr];
        if (map) {
            for (const [interval, entry] of map.entries()) {
                if (interval <= time) {
                    const length = entry.length;
                    let i = 0;
                    while (i < length) {
                        const previous = entry[i++];
                        if (previous.start && (previous.infinite || previous.fillMode === 0 && previous.endTime > time)) {
                            if (previous.animation) {
                                value = 2;
                            }
                            else {
                                value = 1;
                                break;
                            }
                        }
                        else if (previous.end && (previous.fillMode === FILL_MODE.FORWARDS || value === 1 && previous.fillMode === FILL_MODE.FREEZE)) {
                            value = 0;
                            break;
                        }
                    }
                }
                else {
                    break;
                }
            }
        }
        return value === 0;
    }

    public evaluateStart(item: SvgAnimate, otherValue?: any) {
        const values = item.values;
        let value = item.reverse ? values[values.length - 1] : values[0];
        if (value === '') {
            value = this.get(item.attributeName, item.delay) || otherValue?.toString() || item.baseValue;
            if (hasValue<string>(value)) {
                value = value.toString();
                if (item.reverse) {
                    values[values.length - 1] = value;
                    item.to = value;
                }
                else {
                    values[0] = value;
                    item.from = value;
                }
            }
        }
        return values;
    }
}