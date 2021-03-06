import FILL_MODE = squared.svg.constant.FILL_MODE;

import type SvgAnimate from './svganimate';
import type SvgAnimation from './svganimation';

import SvgBuild from './svgbuild';

import { TRANSFORM } from './lib/util';

type IntervalMap = ObjectMap<Map<number, SvgAnimationIntervalValue<SvgAnimation>[]>>;

const { sortNumber, splitPairStart } = squared.lib.util;

function insertIntervalValue(intervalMap: Map<number, SvgAnimationIntervalValue<SvgAnimation>[]>, time: number, value: string, endTime = 0, animation?: SvgAnimation, start = false, end = false, fillMode = 0, infinite = false, valueFrom?: string) {
    if (value) {
        let data = intervalMap.get(time);
        if (!data) {
            intervalMap.set(time, data = []);
        }
        data.push({
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
    }
}

export default class SvgAnimationIntervalMap implements squared.svg.SvgAnimationIntervalMap {
    public static getGroupEndTime(item: SvgAnimationAttribute) {
        return item.iterationCount === 'infinite' ? Infinity : item.delay + item.duration * +item.iterationCount;
    }

    public static getKeyName(item: SvgAnimation) {
        return item.attributeName + (SvgBuild.isAnimateTransform(item) ? ':' + TRANSFORM.typeAsName(item.type) : '');
    }

    public map: SvgAnimationIntervalAttributeMap<SvgAnimation>;

    constructor(animations: SvgAnimation[], ...attrs: string[]) {
        animations = (attrs.length ? animations.filter(item => attrs.includes(item.attributeName)) : animations.slice(0)).sort((a, b) => a.delay === b.delay ? b.group.id - a.group.id : a.delay - b.delay) as SvgAnimate[];
        const map: SvgAnimationIntervalAttributeMap<SvgAnimation> = {};
        const intervalMap: IntervalMap = {};
        const keyNames = new Set<string>();
        const length = animations.length;
        for (let i = 0; i < length; ++i) {
            keyNames.add(SvgAnimationIntervalMap.getKeyName(animations[i]));
        }
        for (const keyName of keyNames) {
            map[keyName] = new Map<number, SvgAnimationIntervalValue<SvgAnimation>[]>();
            intervalMap[keyName] = new Map<number, SvgAnimationIntervalValue<SvgAnimation>[]>();
            const attributeName = splitPairStart(keyName, ':');
            const backwards = animations.filter(item => item.fillBackwards && item.attributeName === attributeName).sort((a, b) => b.group.id - a.group.id)[0] as Undef<SvgAnimate>;
            if (backwards) {
                const delay = backwards.delay;
                insertIntervalValue(intervalMap[keyName]!, 0, backwards.values[0], delay, backwards, delay === 0, false, FILL_MODE.BACKWARDS);
            }
        }
        for (let i = 0; i < length; ++i) {
            const item = animations[i];
            const keyName = SvgAnimationIntervalMap.getKeyName(item);
            const data = intervalMap[keyName];
            if (data) {
                if (item.baseValue && !data[-1]) {
                    insertIntervalValue(data, -1, item.baseValue);
                }
                if (item.setterType) {
                    const { delay, duration } = item;
                    const fillReplace = item.fillReplace && duration > 0;
                    insertIntervalValue(data, delay, item.to, fillReplace ? delay + duration : 0, item, fillReplace, !fillReplace, FILL_MODE.FREEZE);
                    if (fillReplace) {
                        insertIntervalValue(data, delay + duration, '', 0, item, false, true, FILL_MODE.FREEZE);
                    }
                }
                else if (SvgBuild.isAnimate(item) && item.duration > 0) {
                    const infinite = item.iterationCount === -1;
                    const timeEnd = item.getTotalDuration();
                    insertIntervalValue(data, item.delay, item.valueTo, timeEnd, item, true, false, 0, infinite, item.valueFrom);
                    if (!infinite && !item.fillReplace) {
                        insertIntervalValue(data, timeEnd, item.valueTo, 0, item, false, true, item.fillForwards ? FILL_MODE.FORWARDS : FILL_MODE.FREEZE);
                    }
                }
            }
        }
        for (const keyName in intervalMap) {
            const data = intervalMap[keyName]!;
            const keyTimes = sortNumber(Array.from(data.keys()));
            for (let i = 0, q = keyTimes.length; i < q; ++i) {
                const time = keyTimes[i];
                const values = data.get(time)!;
                for (let j = 0; j < values.length; ++j) {
                    const interval = values[j];
                    const animation = interval.animation;
                    if (!interval.value || animation && interval.start && SvgBuild.isAnimate(animation) && !animation.from) {
                        let value: Undef<string>;
                        for (const group of map[keyName]!.values()) {
                            for (let k = 0, s = group.length; k < s; ++k) {
                                const previous = group[k];
                                if (animation !== previous.animation && previous.value && (previous.time === -1 || previous.fillMode === FILL_MODE.FORWARDS || previous.fillMode === FILL_MODE.FREEZE)) {
                                    value = previous.value;
                                    break;
                                }
                            }
                        }
                        if (value) {
                            interval.value = value;
                        }
                        else if (!interval.value) {
                            values.splice(j--, 1);
                        }
                    }
                }
                if (values.length) {
                    values.sort((a, b) => a.animation && b.animation ? a.fillMode === b.fillMode ? b.animation.group.id - a.animation.group.id : b.fillMode - a.fillMode : 0);
                    map[keyName]!.set(time, values);
                }
            }
        }
        for (const keyName in map) {
            for (const [timeA, dataA] of map[keyName]!) {
                for (let i = 0, q = dataA.length; i < q; ++i) {
                    const itemA = dataA[i];
                    const animationA = itemA.animation;
                    if (animationA) {
                        if (itemA.fillMode === FILL_MODE.FREEZE) {
                            const previous: SvgAnimation[] = [];
                            for (const [timeB, dataB] of map[keyName]!) {
                                if (timeB < timeA) {
                                    for (let j = 0, r = dataB.length; j < r; ++j) {
                                        const itemB = dataB[j];
                                        if (itemB.start) {
                                            const animation = itemB.animation;
                                            if (animation && animation.animationElement) {
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
                                            if (animation && animation.animationElement && animation.group.id < animationA.group.id) {
                                                dataB.splice(j--, 1);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (itemA.fillMode === FILL_MODE.FORWARDS || itemA.infinite) {
                            let forwarded: Undef<boolean>;
                            const group = animationA.group;
                            const ordering = group.ordering;
                            if (ordering) {
                                const duration = (animationA as SvgAnimate).getTotalDuration();
                                const name = group.name;
                                for (let j = 0, r = ordering.length; j < r; ++j) {
                                    const sibling = ordering[j];
                                    if (sibling.name === name) {
                                        forwarded = true;
                                    }
                                    else if (SvgAnimationIntervalMap.getGroupEndTime(sibling) >= duration) {
                                        break;
                                    }
                                }
                            }
                            const previous: SvgAnimation[] = [];
                            for (const [timeB, dataB] of map[keyName]!) {
                                if (!forwarded && timeB < timeA) {
                                    for (let j = 0, r = dataB.length; j < r; ++j) {
                                        const itemB = dataB[j];
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
            const data = map[keyName]!;
            for (const [time, entry] of data) {
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

    public get(attr: string, time: number, playing?: boolean) {
        const map = this.map[attr];
        if (map) {
            let value: Undef<string>;
            for (const [interval, data] of map) {
                if (interval <= time) {
                    for (let i = 0, length = data.length; i < length; ++i) {
                        const previous = data[i];
                        if (previous.value && (previous.time === -1 || previous.end && (previous.fillMode === FILL_MODE.FORWARDS || previous.fillMode === FILL_MODE.FREEZE)) || playing && previous.start && time !== interval) {
                            value = previous.value;
                            break;
                        }
                    }
                }
                else {
                    break;
                }
            }
            return value;
        }
    }

    public paused(attr: string, time: number) {
        const map = this.map[attr];
        if (map) {
            let state = 0;
            for (const [interval, entry] of map) {
                if (interval <= time) {
                    for (let i = 0, length = entry.length; i < length; ++i) {
                        const previous = entry[i];
                        if (previous.start && (previous.infinite || previous.fillMode === 0 && previous.endTime > time)) {
                            if (previous.animation) {
                                state = 2;
                            }
                            else {
                                state = 1;
                                break;
                            }
                        }
                        else if (previous.end && (previous.fillMode === FILL_MODE.FORWARDS || state === 1 && previous.fillMode === FILL_MODE.FREEZE)) {
                            state = 0;
                            break;
                        }
                    }
                }
                else {
                    break;
                }
            }
            return state === 0;
        }
        return true;
    }

    public evaluateStart(item: SvgAnimate, fallback?: string) {
        const values = item.values;
        const length = values.length;
        if (length) {
            const value = (item.reverse ? values[length - 1] : values[0]) || this.get(item.attributeName, item.delay) || fallback || item.baseValue;
            if (value) {
                if (item.reverse) {
                    values[length - 1] = value;
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