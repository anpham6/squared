import { SvgPoint, SvgStrokeDash, SvgTransform, SvgTransformExclude, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgElement from './svgelement';
import SvgBuild from './svgbuild';

import { INSTANCE_TYPE, REGION_UNIT } from './lib/constant';
import { SVG, TRANSFORM } from './lib/util';

type SvgContainer = squared.svg.SvgContainer;
type SvgShapePattern = squared.svg.SvgShapePattern;

const $util = squared.lib.util;

export default class SvgPath extends SvgPaint$MX(SvgBaseVal$MX(SvgElement)) implements squared.svg.SvgPath {
    public static build(path: SvgPath, transforms: SvgTransform[], exclude?: SvgTransformExclude, residual?: SvgTransformResidual) {
        if (exclude && exclude[path.element.tagName]) {
            transforms = SvgBuild.filterTransforms(transforms, exclude[path.element.tagName]);
        }
        path.draw(transforms, residual);
        return path;
    }

    public name = '';
    public value = '';
    public pathLength!: string;
    public transformed: SvgTransform[] | null = null;
    public transformResidual?: SvgTransform[][];

    private _totalLength = 0;
    private _transforms?: SvgTransform[];

    constructor(public readonly element: SVGGraphicsElement) {
        super(element);
        this.init();
    }

    public draw(transforms?: SvgTransform[], residual?: SvgTransformResidual, extract = false) {
        if (!extract) {
            this.transformed = null;
        }
        const element = this.element;
        const parent = <SvgContainer> this.parent;
        const patternParent = <SvgShapePattern> this.patternParent;
        const requireRefit = !!parent && parent.requireRefit();
        const requirePatternRefit = !!patternParent && patternParent.patternContentUnits === REGION_UNIT.OBJECT_BOUNDING_BOX;
        let d: string;
        if (SVG.path(element)) {
            d = this.getBaseValue('d');
            if (transforms && transforms.length || requireRefit || requirePatternRefit) {
                const commands = SvgBuild.getPathCommands(d);
                if (commands.length) {
                    let points = SvgBuild.getPathPoints(commands);
                    if (points.length) {
                        if (requirePatternRefit) {
                            patternParent.patternRefitPoints(points);
                        }
                        if (transforms && transforms.length) {
                            if (typeof residual === 'function') {
                                [this.transformResidual, transforms] = residual.call(this, element, transforms);
                            }
                            if (transforms.length) {
                                points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                                this.transformed = transforms;
                            }
                        }
                        if (requireRefit) {
                            parent.refitPoints(points);
                        }
                        d = SvgBuild.drawPath(SvgBuild.bindPathPoints(commands, points), this.transformed !== undefined);
                    }
                }
            }
        }
        else if (SVG.line(element)) {
            let points: SvgPoint[] = [
                { x: this.getBaseValue('x1'), y: this.getBaseValue('y1') },
                { x: this.getBaseValue('x2'), y: this.getBaseValue('y2') }
            ];
            if (requirePatternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            if (requireRefit) {
                parent.refitPoints(points);
            }
            d = SvgBuild.drawPolyline(points, this.transformed !== undefined);
        }
        else if (SVG.circle(element) || SVG.ellipse(element)) {
            let rx: number;
            let ry: number;
            if (SVG.ellipse(element)) {
                rx = this.getBaseValue('rx');
                ry = this.getBaseValue('ry');
            }
            else {
                rx = this.getBaseValue('r');
                ry = rx;
            }
            let points: SvgPoint[] = [
                { x: this.getBaseValue('cx'), y: this.getBaseValue('cy'), rx, ry }
            ];
            if (requirePatternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms, rx, ry);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            if (requireRefit) {
                parent.refitPoints(points);
            }
            const pt = <Required<SvgPoint>> points[0];
            d = SvgBuild.drawEllipse(pt.x, pt.y, pt.rx, pt.ry, this.transformed !== undefined);
        }
        else if (SVG.rect(element)) {
            let x = this.getBaseValue('x');
            let y = this.getBaseValue('y');
            let width = this.getBaseValue('width');
            let height = this.getBaseValue('height');
            if (transforms && transforms.length) {
                let points: SvgPoint[] = [
                    { x, y },
                    { x: x + width, y },
                    { x: x + width, y: y + height },
                    { x, y: y + height }
                ];
                if (requirePatternRefit) {
                    patternParent.patternRefitPoints(points);
                }
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
                if (requireRefit) {
                    parent.refitPoints(points);
                }
                d = SvgBuild.drawPolygon(points, true);
            }
            else {
                if (requirePatternRefit) {
                    x = patternParent.patternRefitX(x);
                    y = patternParent.patternRefitY(y);
                    width = patternParent.patternRefitX(width);
                    height = patternParent.patternRefitY(height);
                }
                if (requireRefit) {
                    x = parent.refitX(x);
                    y = parent.refitY(y);
                    width = parent.refitSize(width);
                    height = parent.refitSize(height);
                }
                d = SvgBuild.drawRect(width, height, x, y);
            }
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            let points: SvgPoint[] = this.getBaseValue('points');
            if (requirePatternRefit) {
                patternParent.patternRefitPoints(points);
            }
            if (transforms && transforms.length) {
                if (typeof residual === 'function') {
                    [this.transformResidual, transforms] = residual.call(this, element, transforms);
                }
                if (transforms.length) {
                    points = SvgBuild.applyTransforms(transforms, points, TRANSFORM.origin(this.element));
                    this.transformed = transforms;
                }
            }
            if (requireRefit) {
                if (this.transformed === null) {
                    points = SvgBuild.clonePoints(points);
                }
                parent.refitPoints(points);
            }
            d = SVG.polygon(element) ? SvgBuild.drawPolygon(points, this.transformed !== undefined) : SvgBuild.drawPolyline(points, this.transformed !== undefined);
        }
        else {
            d = '';
        }
        if (!extract) {
            this.value = d;
            this._totalLength = 0;
            this.setPaint([d]);
        }
        return d;
    }

    public getStrokeDash() {
        const result: SvgStrokeDash[] = [];
        const value = $util.convertInt(this.strokeDasharray);
        if (value > 0) {
            const offset = $util.convertInt(this.strokeDashoffset);
            const totalLength = $util.convertInt(this.pathLength) || this.totalLength;
            if (offset >= totalLength) {
                result.push({ start: 1, end: 1 });
            }
            else {
                for (let i = offset, j = 0; i < totalLength; i += value, j++) {
                    if (j % 2 === 0) {
                        result.push({
                            start: i / totalLength,
                            end: Math.min(i + value, totalLength) / totalLength
                        });
                    }
                }
            }
        }
        return result;
    }

    private init() {
        const element = this.element;
        if (SVG.path(element)) {
            this.setBaseValue('d');
        }
        else if (SVG.line(element)) {
            this.setBaseValue('x1');
            this.setBaseValue('y1');
            this.setBaseValue('x2');
            this.setBaseValue('y2');
        }
        else if (SVG.rect(element)) {
            this.setBaseValue('x');
            this.setBaseValue('y');
            this.setBaseValue('width');
            this.setBaseValue('height');
        }
        else if (SVG.circle(element)) {
            this.setBaseValue('cx');
            this.setBaseValue('cy');
            this.setBaseValue('r');
        }
        else if (SVG.ellipse(element)) {
            this.setBaseValue('cx');
            this.setBaseValue('cy');
            this.setBaseValue('rx');
            this.setBaseValue('ry');
        }
        else if (SVG.polygon(element) || SVG.polyline(element)) {
            this.setBaseValue('points', SvgBuild.clonePoints(element.points));
        }
        this.setAttribute('pathLength');
    }

    get transforms() {
        if (this._transforms === undefined) {
            this._transforms = SvgBuild.filterTransforms(TRANSFORM.parse(this.element) || SvgBuild.convertTransforms(this.element.transform.baseVal));
        }
        return this._transforms;
    }

    get totalLength() {
        if (this.value !== '' && this._totalLength === 0) {
            let element: SVGPathElement;
            if (SVG.path(this.element)) {
                element = this.element;
            }
            else {
                element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                element.setAttribute('d', this.value);
            }
            this._totalLength = element.getTotalLength();
        }
        return this._totalLength;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_PATH;
    }
}