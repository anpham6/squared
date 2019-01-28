import SvgAnimate from './svganimate';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE } from './lib/constant';

export default class SvgAnimateTransform extends SvgAnimate implements squared.svg.SvgAnimateTransform {
    public static toRotateList(values: string[]) {
        const result = values.map(value => {
            if (value === '') {
                return [null, null, null];
            }
            else {
                const segment = SvgBuild.toNumberList(value);
                if (segment.length === 1) {
                    return [segment[0], 0, 0];
                }
                else if (segment.length === 3) {
                    return segment;
                }
                return [];
            }
        });
        return result.some(item => item.length === 0) ? undefined : result;
    }

    public static toScaleList(values: string[]) {
        const result = values.map(value => {
            if (value === '') {
                return [null, null];
            }
            else {
                const segment = SvgBuild.toNumberList(value);
                if (segment.length === 1) {
                    return [segment[0], segment[0]];
                }
                else if (segment.length === 2) {
                    return segment;
                }
                return [];
            }
        });
        return result.some(item => item.length === 0) ? undefined : result;
    }

    public static toTranslateList(values: string[]) {
        let y = 0;
        const result = values.map(value => {
            if (value === '') {
                return [null, null];
            }
            else {
                const segment = SvgBuild.toNumberList(value);
                if (segment.length === 1) {
                    return [segment[0], y];
                }
                else if (segment.length === 2) {
                    y = segment[1];
                    return segment;
                }
                return [];
            }
        });
        return result.some(item => item.length === 0) ? undefined : result;
    }

    public type = 0;
    public transformFrom?: string;
    public transformOrigin?: Point[];

    constructor(public element?: SVGAnimateTransformElement) {
        super(element);
        if (element) {
            const type = this.getAttribute('type');
            this.setType(type);
            this.setCalcMode(type);
        }
    }

    public expandToValues() {
        if (this.accumulateSum && this.repeatCount !== -1 && this.keyTimes.length && this.duration > 0) {
            const durationTotal = this.duration * this.repeatCount;
            invalid: {
                const keyTimes: number[] = [];
                const values: string[] = [];
                const keySplines: string[] = [];
                let previousValues: number[] | undefined;
                for (let i = 0; i < this.repeatCount; i++) {
                    if (i > 0 && this.keySplines) {
                        keySplines.push('');
                    }
                    for (let j = 0; j < this.keyTimes.length; j++) {
                        const stringValues = this.values[j].split(' ');
                        const floatValues = stringValues.map(value => parseFloat(value));
                        if (stringValues.length === floatValues.length) {
                            let currentValues: number[] | undefined;
                            switch (this.type) {
                                case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                                    if (floatValues.length === 1) {
                                        currentValues = [floatValues[0], 0];
                                    }
                                    else if (floatValues.length === 2) {
                                        currentValues = floatValues;
                                    }
                                    break;
                                case SVGTransform.SVG_TRANSFORM_SCALE:
                                    if (floatValues.length === 1) {
                                        currentValues = [floatValues[0], floatValues[0]];
                                    }
                                    else if (floatValues.length === 2) {
                                        currentValues = floatValues;
                                    }
                                    break;
                                case SVGTransform.SVG_TRANSFORM_ROTATE:
                                    if (floatValues.length === 1) {
                                        currentValues = [floatValues[0], 0, 0];
                                    }
                                    else if (floatValues.length === 3) {
                                        currentValues = floatValues;
                                    }
                                    break;
                                case SVGTransform.SVG_TRANSFORM_SKEWX:
                                case SVGTransform.SVG_TRANSFORM_SKEWY:
                                    if (floatValues.length === 1) {
                                        currentValues = floatValues;
                                    }
                                    break;
                            }
                            if (currentValues) {
                                let time = (this.keyTimes[j] + i) * this.duration;
                                if (previousValues) {
                                    for (let k = 0; k < currentValues.length; k++) {
                                        currentValues[k] += previousValues[k];
                                    }
                                }
                                if (i < this.repeatCount - 1 && j === this.keyTimes.length - 1) {
                                    previousValues = currentValues;
                                    time--;
                                }
                                keyTimes.push(time / durationTotal);
                                values.push(currentValues.join(' '));
                                if (this.keySplines && j < this.keyTimes.length - 1) {
                                    keySplines.push(this.keySplines[j]);
                                }
                            }
                            else {
                                break invalid;
                            }
                        }
                        else {
                            break invalid;
                        }
                    }
                }
                this.keyTimes = keyTimes;
                this.values = values;
                this.keySplines = keySplines.length ? keySplines : undefined;
                this.duration = durationTotal;
                this.repeatCount = 1;
                this.accumulateSum = false;
            }
        }
    }

    public setType(value: string) {
        switch (value) {
            case 'translate':
                this.type = SVGTransform.SVG_TRANSFORM_TRANSLATE;
                break;
            case 'scale':
                this.type = SVGTransform.SVG_TRANSFORM_SCALE;
                break;
            case 'rotate':
                this.type = SVGTransform.SVG_TRANSFORM_ROTATE;
                break;
            case 'skewX':
                this.type = SVGTransform.SVG_TRANSFORM_SKEWX;
                break;
            case 'skewY':
                this.type = SVGTransform.SVG_TRANSFORM_SKEWY;
                break;
        }
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_ANIMATE_TRANSFORM;
    }
}