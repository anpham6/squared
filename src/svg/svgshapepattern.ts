import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgView$MX from './svgview-mx';
import SvgBuild from './svgbuild';
import SvgContainer from './svgcontainer';
import SvgPath from './svgpath';
import SvgPattern from './svgpattern';
import SvgShape from './svgshape';

import { INSTANCE_TYPE, REGION_UNIT } from './lib/constant';
import { TRANSFORM } from './lib/util';

const { isPercent } = squared.lib.css;
const { getNamedItem } = squared.lib.dom;

const getPercent = (value: string) => isPercent(value) ? parseFloat(value) / 100 : parseFloat(value);

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
        this.patternUnits = getNamedItem(this.patternElement, 'patternUnits') === 'userSpaceOnUse' ? REGION_UNIT.USER_SPACE_ON_USE : REGION_UNIT.OBJECT_BOUNDING_BOX;
        this.patternContentUnits = getNamedItem(this.patternElement, 'patternContentUnits') === 'objectBoundingBox' ? REGION_UNIT.OBJECT_BOUNDING_BOX : REGION_UNIT.USER_SPACE_ON_USE;
    }

    public build(options?: SvgBuildOptions) {
        const element = options?.element || this.element as SVGGeometryElement;
        const path: SvgPath = new SvgPath(element);
        path.build({ ...options });
        const pathValue = path.value;
        if (pathValue) {
            const precision = options?.precision;
            this.clipRegion = pathValue;
            if (path.clipPath) {
                this.clipRegion = path.clipPath;
            }
            const d = [pathValue];
            this.setPaint(d, precision);
            this.drawRegion = SvgBuild.getBoxRect(d);
            const { drawRegion, fillOpacity, patternWidth, patternHeight, tileWidth, tileHeight } = this;
            const boundingBox = this.patternUnits === REGION_UNIT.OBJECT_BOUNDING_BOX;
            let offsetX = this.offsetX % tileWidth, offsetY = this.offsetY % tileHeight;
            let boundingX = 0, boundingY = 0;
            let width = drawRegion.right;
            let remainingHeight = drawRegion.bottom;
            if (boundingBox) {
                boundingX = drawRegion.left;
                boundingY = drawRegion.top;
                width -= boundingX;
                remainingHeight -= boundingY;
            }
            if (offsetX !== 0) {
                offsetX = tileWidth - offsetX;
                width += tileWidth;
            }
            if (offsetY !== 0) {
                offsetY = tileHeight - offsetY;
                remainingHeight += tileHeight;
            }
            let j = 0;
            while (remainingHeight > 0) {
                const patternElement = this.patternElement;
                const contentBoundingBox = this.patternContentUnits === REGION_UNIT.OBJECT_BOUNDING_BOX;
                const y = boundingY + (j++ * tileHeight) - offsetY;
                let remainingWidth = width;
                let i = 0;
                do {
                    const x = boundingX + (i++ * tileWidth) - offsetX;
                    const pattern = new SvgPattern(element, patternElement);
                    pattern.build({ ...options });
                    pattern.cascade(item => {
                        if (SvgBuild.isShape(item)) {
                            item.setPath();
                            const patternPath = item.path;
                            if (patternPath) {
                                patternPath.patternParent = this;
                                if (contentBoundingBox) {
                                    patternPath.refitBaseValue(x / patternWidth, y / patternHeight, precision);
                                }
                                else {
                                    patternPath.refitBaseValue(x, y, precision);
                                }
                                patternPath.build({ ...options, transforms: item.transforms });
                                patternPath.fillOpacity = (parseFloat(patternPath.fillOpacity) * parseFloat(fillOpacity)).toString();
                                patternPath.clipPath = SvgBuild.drawRect(tileWidth, tileHeight, x, y, precision) + (patternPath.clipPath !== '' ? ';' + patternPath.clipPath : '');
                            }
                        }
                        return false;
                    });
                    this.append(pattern);
                    remainingWidth -= tileWidth;
                }
                while (remainingWidth > 0);
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
            const length = values.length;
            let i = 0;
            while (i < length) {
                const pt = values[i++];
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
        const drawRegion = this.drawRegion;
        return drawRegion ? drawRegion.right - drawRegion.left : 0;
    }

    get patternHeight() {
        const drawRegion = this.drawRegion;
        return drawRegion ? drawRegion.bottom - drawRegion.top : 0;
    }

    get transforms() {
        if (!this.__get_transforms) {
            const patternElement = this.patternElement;
            const transforms = SvgBuild.convertTransforms(patternElement.patternTransform.baseVal);
            const length = transforms.length;
            if (length) {
                const rotateOrigin = TRANSFORM.rotateOrigin(patternElement, 'patternTransform');
                const x = this.patternWidth / 2;
                const y = this.patternHeight / 2;
                let i = 0;
                while (i < length) {
                    const item = transforms[i++];
                    switch (item.type) {
                        case SVGTransform.SVG_TRANSFORM_TRANSLATE:
                            break;
                        case SVGTransform.SVG_TRANSFORM_ROTATE:
                            while (rotateOrigin.length) {
                                const pt = rotateOrigin.shift() as SvgPoint;
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
                this._transforms = super.transforms.concat(SvgBuild.filterTransforms(transforms));
            }
            this.__get_transforms = true;
        }
        return super.transforms;
    }

    get offsetX() {
        const baseVal = this.patternElement.x.baseVal;
        if (this.patternUnits === REGION_UNIT.OBJECT_BOUNDING_BOX) {
            return this.patternWidth * getPercent(baseVal.valueAsString);
        }
        return baseVal.value;
    }

    get offsetY() {
        const baseVal = this.patternElement.y.baseVal;
        if (this.patternUnits === REGION_UNIT.OBJECT_BOUNDING_BOX) {
            return this.patternHeight * getPercent(baseVal.valueAsString);
        }
        return baseVal.value;
    }

    get tileWidth() {
        const baseVal = this.patternElement.width.baseVal;
        if (this.patternUnits === REGION_UNIT.OBJECT_BOUNDING_BOX) {
            return this.patternWidth * getPercent(baseVal.valueAsString);
        }
        return baseVal.value;
    }

    get tileHeight() {
        const baseVal = this.patternElement.height.baseVal;
        if (this.patternUnits === REGION_UNIT.OBJECT_BOUNDING_BOX) {
            return this.patternHeight * getPercent(baseVal.valueAsString);
        }
        return baseVal.value;
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_SHAPE_PATTERN;
    }
}