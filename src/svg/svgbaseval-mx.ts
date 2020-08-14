import SvgBuild from './svgbuild';

type SvgElement = squared.svg.SvgElement;

const { getNamedItem } = squared.lib.dom;

function adjustPoints(values: SvgPoint[], x: number, y: number, scaleX: number, scaleY: number) {
    for (let i = 0, length = values.length; i < length; ++i) {
        const pt = values[i];
        pt.x += x;
        pt.y += y;
        if (pt.rx !== undefined && pt.ry !== undefined) {
            pt.rx *= scaleX;
            pt.ry *= scaleY;
        }
    }
}

export default <T extends Constructor<SvgElement>>(Base: T) => {
    return class extends Base implements squared.svg.SvgBaseVal {
        private _baseVal: StandardMap = {};

        public setBaseValue(attr: string, value?: any) {
            if (value !== undefined) {
                if (this.verifyBaseValue(attr, value)) {
                    this._baseVal[attr] = value;
                    return true;
                }
            }
            else {
                switch (attr) {
                    case 'd':
                        this._baseVal[attr] = getNamedItem(this.element, 'd');
                        return true;
                    case 'points': {
                        const points: SVGPointList = this.element[attr];
                        if (Array.isArray(points)) {
                            this._baseVal[attr] = SvgBuild.clonePoints(points);
                            return true;
                        }
                        break;
                    }
                    default: {
                        const object: SVGAnimatedLength = this.element[attr];
                        if (object) {
                            const baseVal = object.baseVal;
                            if (baseVal) {
                                this._baseVal[attr] = baseVal.value;
                                return true;
                            }
                        }
                        break;
                    }
                }
            }
            return false;
        }

        public getBaseValue<T = unknown>(attr: string, fallback?: T): Undef<T> {
            return this._baseVal[attr] as T ?? (!this.setBaseValue(attr) ? fallback : undefined);
        }

        public refitBaseValue(x: number, y: number, precision?: number, scaleX = 1, scaleY = 1) {
            const baseVal = this._baseVal;
            for (const attr in baseVal) {
                const value = baseVal[attr];
                if (typeof value === 'string') {
                    if (attr === 'd') {
                        const commands = SvgBuild.getPathCommands(value);
                        const points = SvgBuild.getPathPoints(commands);
                        adjustPoints(points, x, y, scaleX, scaleY);
                        baseVal[attr] = SvgBuild.drawPath(SvgBuild.syncPathPoints(commands, points), precision);
                    }
                }
                else if (typeof value === 'number') {
                    switch (attr) {
                        case 'cx':
                        case 'x1':
                        case 'x2':
                        case 'x':
                            baseVal[attr] += x;
                            break;
                        case 'cy':
                        case 'y1':
                        case 'y2':
                        case 'y':
                            baseVal[attr] += y;
                            break;
                        case 'r':
                            baseVal[attr] *= Math.min(scaleX, scaleY);
                            break;
                        case 'rx':
                        case 'width':
                            baseVal[attr] *= scaleX;
                            break;
                        case 'ry':
                        case 'height':
                            baseVal[attr] *= scaleY;
                            break;
                    }
                }
                else if (Array.isArray(value)) {
                    if (attr === 'points') {
                        adjustPoints(value, x, y, scaleX, scaleY);
                    }
                }
            }
        }

        public verifyBaseValue(attr: string, value?: any) {
            switch (attr) {
                case 'd':
                    return typeof value === 'string';
                case 'cx':
                case 'cy':
                case 'r':
                case 'rx':
                case 'ry':
                case 'x1':
                case 'x2':
                case 'y1':
                case 'y2':
                case 'x':
                case 'y':
                case 'width':
                case 'height':
                    return typeof value === 'number';
                case 'points':
                    return Array.isArray(value);
            }
        }
    };
};