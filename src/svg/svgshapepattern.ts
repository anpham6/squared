import { SvgBuildOptions, SvgPoint } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgView$MX from './svgview-mx';
import SvgBuild from './svgbuild';
import SvgContainer from './svgcontainer';
import SvgShape from './svgshape';
import SvgPath from './svgpath';
import SvgPattern from './svgpattern';

import { INSTANCE_TYPE, REGION_UNIT } from './lib/constant';
import { TRANSFORM } from './lib/util';

const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $util = squared.lib.util;

const getPercent = (value: string) => $css.isPercent(value) ? parseFloat(value) / 100 : parseFloat(value);

export default class SvgShapePattern extends SvgPaint$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))) implements squared.svg.SvgShapePattern {
    public drawRegion?: BoxRect;

    public readonly patternUnits: number;
    public readonly patternContentUnits: number;

    private __get_transforms = false;

    constructor(
        public element: SVGGeometryElement | SVGUseElement,
        public readonly patternElement: SVGPatternElement)
    {
        super(element);
        this.patternUnits = $dom.getNamedItem(this.patternElement, 'patternUnits') === 'userSpaceOnUse' ? REGION_UNIT.USER_SPACE_ON_USE : REGION_UNIT.OBJECT_BOUNDING_BOX;
        this.patternContentUnits = $dom.getNamedItem(this.patternElement, 'patternContentUnits') === 'objectBoundingBox' ? REGION_UNIT.OBJECT_BOUNDING_BOX : REGION_UNIT.USER_SPACE_ON_USE;
    }

    public build(options?: SvgBuildOptions) {
        const element = options && options.element || <SVGGeometryElement> this.element;
        const path = new SvgPath(element);
        path.build(options);
        if (path.value) {
            options = { ...options };
            const precision = options && options.precision;
            this.clipRegion = path.value;
            if (path.clipPath) {
                this.clipRegion = path.clipPath;
            }
            const d = [path.value];
            this.setPaint(d, precision);
            this.drawRegion = SvgBuild.parseBoxRect(d);
            const boundingBox = this.patternUnits === REGION_UNIT.OBJECT_BOUNDING_BOX;
            const patternWidth = this.patternWidth;
            const patternHeight = this.patternHeight;
            const tileWidth = this.tileWidth;
            const tileHeight = this.tileHeight;
            let offsetX = this.offsetX % tileWidth;
            let offsetY = this.offsetY % tileHeight;
            let boundingX = 0;
            let boundingY = 0;
            let width = this.drawRegion.right;
            let remainingHeight = this.drawRegion.bottom;
            if (boundingBox) {
                width -= this.drawRegion.left;
                remainingHeight -= this.drawRegion.top;
                boundingX = this.drawRegion.left;
                boundingY = this.drawRegion.top;
            }
            let j = 0;
            if (offsetX !== 0) {
                offsetX = tileWidth - offsetX;
                width += tileWidth;
            }
            if (offsetY !== 0) {
                offsetY = tileHeight - offsetY;
                remainingHeight += tileHeight;
            }
            while (remainingHeight > 0) {
                const y = boundingY + j * tileHeight - offsetY;
                let remainingWidth = width;
                let i = 0;
                do {
                    const x = boundingX + i * tileWidth - offsetX;
                    const pattern = new SvgPattern(element, this.patternElement);
                    pattern.build(options);
                    for (const item of pattern.cascade()) {
                        if (SvgBuild.isShape(item)) {
                            item.setPath();
                            if (item.path) {
                                item.path.patternParent = this;
                                if (this.patternContentUnits === REGION_UNIT.OBJECT_BOUNDING_BOX) {
                                    item.path.refitBaseValue(x / patternWidth, y / patternHeight, precision);
                                }
                                else {
                                    item.path.refitBaseValue(x, y, precision);
                                }
                                options.transforms = item.transforms;
                                item.path.build(options);
                                item.path.fillOpacity = (parseFloat(item.path.fillOpacity) * parseFloat(this.fillOpacity)).toString();
                                item.path.clipPath = SvgBuild.drawRect(tileWidth, tileHeight, x, y, precision) + (item.path.clipPath !== '' ? `;${item.path.clipPath}` : '');
                            }
                        }
                    }
                    this.append(pattern);
                    remainingWidth -= tileWidth;
                    i++;
                }
                while (remainingWidth > 0);
                j++;
                remainingHeight -= tileHeight;
            }
            if (this.stroke !== '' && parseFloat(this.strokeWidth) > 0) {
                path.fill = '';
                path.fillOpacity = '0';
                path.stroke = this.stroke;
                path.strokeWidth = this.strokeWidth;
                const shape = new SvgShape(element, false);
                shape.path = path;
                this.append(shape);
            }
        }
    }

    public patternRefitX(value: number) {
        return this.drawRegion ? value * this.patternWidth : value;
    }

    public patternRefitY(value: number) {
        return this.drawRegion ? value * this.patternHeight : value;
    }

    public patternRefitPoints(values: SvgPoint[]) {
        if (this.drawRegion) {
            const x = this.patternWidth;
            const y = this.patternHeight;
            for (const pt of values) {
                pt.x *= x;
                pt.y *= y;
                if (pt.rx !== undefined && pt.ry !== undefined) {
                    if (pt.rx === pt.ry) {
                        const minXY = Math.min(x, y);
                        pt.rx *= minXY;
                        pt.ry *= minXY;
                    }
                    else {
                        pt.rx *= x;
                        pt.ry *= y;
                    }
                }
            }
        }
        return values;
    }

    get patternWidth() {
        return this.drawRegion ? this.drawRegion.right - this.drawRegion.left : 0;
    }

    get patternHeight() {
        return this.drawRegion ? this.drawRegion.bottom - this.drawRegion.top : 0;
    }

    get transforms() {
        if (!this.__get_transforms) {
            const transforms = SvgBuild.convertTransforms(this.patternElement.patternTransform.baseVal);
            if (transforms.length) {
                const rotateOrigin = TRANSFORM.rotateOrigin(this.patternElement, 'patternTransform');
                const x = this.patternWidth / 2;
                const y = this.patternHeight / 2;
                for (const item of transforms) {
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                            break;
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                            while (rotateOrigin.length) {
                                const pt = <SvgPoint> rotateOrigin.shift();
                                if (pt.angle === item.angle) {
                                    item.origin = {
                                        x: x + pt.x,
                                        y: y + pt.y
                                    };
                                    break;
                                }
                            }
                            if (item.origin) {
                                break;
                            }
                        default:
                            item.origin = { x, y };
                            break;
                    }
                }
                $util.concatArray(super.transforms, SvgBuild.filterTransforms(transforms));
            }
            this.__get_transforms = true;
        }
        return super.transforms;
    }

    get offsetX() {
        let value = 0;
        if (this.patternUnits === REGION_UNIT.OBJECT_BOUNDING_BOX) {
            value = this.patternWidth * getPercent(this.patternElement.x.baseVal.valueAsString);
        }
        return value || this.patternElement.x.baseVal.value;
    }

    get offsetY() {
        let value = 0;
        if (this.patternUnits === REGION_UNIT.OBJECT_BOUNDING_BOX) {
            value = this.patternHeight * getPercent(this.patternElement.y.baseVal.valueAsString);
        }
        return value || this.patternElement.y.baseVal.value;
    }

    get tileWidth() {
        let value = 0;
        if (this.patternUnits === REGION_UNIT.OBJECT_BOUNDING_BOX) {
            value = this.patternWidth * getPercent(this.patternElement.width.baseVal.valueAsString);
        }
        return value || this.patternElement.width.baseVal.value;
    }

    get tileHeight() {
        let value = 0;
        if (this.patternUnits === REGION_UNIT.OBJECT_BOUNDING_BOX) {
            value = this.patternHeight * getPercent(this.patternElement.height.baseVal.valueAsString);
        }
        return value || this.patternElement.height.baseVal.value;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_SHAPE_PATTERN;
    }
}