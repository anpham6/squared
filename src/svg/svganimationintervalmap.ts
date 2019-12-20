import { SvgAnimationAttribute } from '../../@types/svg/object';

import SvgBuild from './svgbuild';

import { FILL_MODE } from './lib/constant';
import { TRANSFORM } from './lib/util';

const { filterArray, sortNumber } = squared.lib.util;

type SvgAnimate = squared.svg.SvgAnimate;
type SvgAnimation = squared.svg.SvgAnimation;
type SvgAnimationIntervalValue = squared.svg.SvgAnimationIntervalValue;
type SvgAnimationIntervalAttributeMap = squared.svg.SvgAnimationIntervalAttributeMap;

function getAttributeName(value: string) {
    if (value.indexOf(':') !== -1) {
        return value.split(':')[0];
    }
    return value;
}

export default class SvgAnimationIntervalMap implements squared.svg.SvgAnimationIntervalMap {
    public static getGroupEndTime(item: SvgAnimationAttribute) {
        return item.iterationCount === 'infinite' ? Number.POSITIVE_INFINITY : item.delay + item.duration * parseInt(item.iterationCount);
    }

    public static getKeyName(item: SvgAnimation) {
        return item.attributeName + (SvgBuild.isAnimateTransform(item) ? ':' + TRANSFORM.typeAsName(item.type) : '');
    }

    public map: SvgAnimationIntervalAttributeMap;

    constructor(animations: SvgAnimation[], ...attrs: string[]) {
        animations = (attrs.length ? filterArray(animations, item => attrs.includes(item.attributeName)) : animations.slice(0)).sort((a, b) => {
            if (a.delay === b.delay) {
                return a.group.id < b.group.id ? 1 : -1;
            }
            return a.delay < b.delay ? -1 : 1;
        });
        attrs.length = 0;
        for (const item of animations as SvgAnimate[]) {
            const value = SvgAnimationIntervalMap.getKeyName(item);
            if (!attrs.includes(value)) {
                attrs.push(value);
            }
        }
        const map: SvgAnimationIntervalAttributeMap = {};
        const intervalMap: ObjectMap<ObjectIndex<SvgAnimationIntervalValue[]>> = {};
        const intervalTimes: ObjectMap<Set<number>> = {};
        function insertIntervalValue(keyName: string, time: number, value: string, endTime = 0, animation?: SvgAnimation, start = false, end = false, fillMode = 0, infinite = false, valueFrom?: string) {
            if (value) {
                const mapA = intervalMap[keyName];
                let data = mapA[time];
                if (data === undefined) {
                    data = [];
                    mapA[time] = data;
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
                intervalTimes[keyName].add(time);
            }
        }
        for (const keyName of attrs) {
            map[keyName] = new Map<number, SvgAnimationIntervalValue[]>();
            intervalMap[keyName] = {};
            intervalTimes[keyName] = new Set<number>();
            const attributeName = getAttributeName(keyName);
            const backwards = <SvgAnimate> animations.filter(item => item.fillBackwards && item.attributeName === attributeName).sort((a, b) => a.group.id < b.group.id ? 1 : -1)[0];
            if (backwards) {
                insertIntervalValue(keyName, 0, backwards.values[0], backwards.delay, backwards, backwards.delay === 0, false, FILL_MODE.BACKWARDS);
            }
        }
        for (const item of animations) {
            const keyName = SvgAnimationIntervalMap.getKeyName(item);
            if (item.baseValue && intervalMap[keyName][-1] === undefined) {
                insertIntervalValue(keyName, -1, item.baseValue);
            }
            if (item.setterType) {
                const fillReplace = item.fillReplace && item.duration > 0;
                insertIntervalValue(keyName, item.delay, item.to, fillReplace ? item.delay + item.duration : 0, item, fillReplace, !fillReplace, FILL_MODE.FREEZE);
                if (fillReplace) {
                    insertIntervalValue(keyName, item.delay + item.duration, '', 0, item, false, true, FILL_MODE.FREEZE);
                }
            }
            else if (SvgBuild.isAnimate(item) && item.duration > 0) {
                const infinite = item.iterationCount === -1;
                const timeEnd = item.getTotalDuration();
                insertIntervalValue(keyName, item.delay, item.valueTo, timeEnd, item, true, false, 0, infinite, item.valueFrom);
                if (!infinite && !item.fillReplace) {
                    insertIntervalValue(keyName, timeEnd, item.valueTo, 0, item, false, true, item.fillForwards ? FILL_MODE.FORWARDS : FILL_MODE.FREEZE);
                }
            }
        }
        for (const keyName in intervalMap) {
            for (const time of sortNumber(Array.from(intervalTimes[keyName]))) {
                const values = intervalMap[keyName][time];
                for (let i = 0; i < values.length; i++) {
                    const interval = values[i];
                    const animation = interval.animation;
                    if (interval.value === '' || animation && interval.start && SvgBuild.isAnimate(animation) && animation.evaluateStart) {
                        let value: string | undefined;
                        for (const group of map[keyName].values()) {
                            for (const previous of group) {
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
                            values.splice(i--, 1);
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
                for (const itemA of dataA) {
                    const animationA = itemA.animation;
                    if (animationA) {
                        if (itemA.fillMode === FILL_MODE.FREEZE) {
                            const previous: SvgAnimation[] = [];
                            for (const [timeB, dataB] of map[keyName].entries()) {
                                if (timeB < timeA) {
                                    for (const itemB of dataB) {
                                        if (itemB.start) {
                                            const animation = itemB.animation;
                                            if (animation?.animationElement) {
                                                previous.push(<SvgAnimation> animation);
                                            }
                                        }
                                    }
                                }
                                else if (timeB > timeA) {
                                    for (let i = 0; i < dataB.length; i++) {
                                        const itemB = dataB[i];
                                        if (itemB.end && previous.includes(<SvgAnimation> itemB.animation)) {
                                            dataB.splice(i--, 1);
                                        }
                                    }
                                }
                                else {
                                    for (let i = 0; i < dataB.length; i++) {
                                        const itemB = dataB[i];
                                        if (itemB.end) {
                                            const animation = itemB.animation;
                                            if (animation?.animationElement && animation.group.id < animationA.group.id) {
                                                dataB.splice(i--, 1);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (itemA.fillMode === FILL_MODE.FORWARDS || itemA.infinite) {
                            const group = animationA.group;
                            let forwarded = false;
                            if (group.ordering) {
                                const duration = (<SvgAnimate> animationA).getTotalDuration();
                                const name = group.name;
                                for (const sibling of group.ordering) {
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
                                    for (const itemB of dataB) {
                                        if (itemB.start) {
                                            const animationB = itemB.animation;
                                            if (animationB) {
                                                previous.push(<SvgAnimation> animationB);
                                            }
                                        }
                                    }
                                }
                                else if (timeB > timeA) {
                                    for (let i = 0; i < dataB.length; i++) {
                                        const itemB = dataB[i];
                                        const animationB = itemB.animation;
                                        if (forwarded || animationB && (itemB.end && previous.includes(<SvgAnimation> animationB) || animationA.animationElement === null && animationB.group.id < animationA.group.id)) {
                                            dataB.splice(i--, 1);
                                        }
                                    }
                                }
                                else {
                                    for (let i = 0; i < dataB.length; i++) {
                                        const itemB = dataB[i];
                                        if (itemB.end) {
                                            const id = itemB.animation?.group.id || NaN;
                                            if (id < animationA.group.id) {
                                                dataB.splice(i--, 1);
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
            for (const [time, entry] of Array.from(data.entries())) {
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
                if (animation === undefined) {
                    return true;
                }
                return (<SvgAnimationIntervalValue[]> map.get(time)).findIndex(item => item.animation === animation) !== -1;
            }
            return false;
        }
        return map !== undefined;
    }

    public get(attr: string, time: number, playing = false) {
        let value: string | undefined;
        const map = this.map[attr];
        if (map) {
            for (const [interval, data] of map.entries()) {
                if (interval <= time) {
                    for (const previous of data) {
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
                    for (const previous of entry) {
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
        if (item.evaluateStart) {
            const value = this.get(item.attributeName, item.delay) || otherValue?.toString() || item.baseValue;
            if (value) {
                const values = item.values;
                if (item.reverse) {
                    values[values.length - 1] = value;
                }
                else {
                    values[0] = value;
                }
            }
            item.evaluateStart = false;
        }
        return item.values;
    }
}