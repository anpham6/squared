import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgView$MX from './svgview-mx';
import SvgBuild from './svgbuild';
import SvgContainer from './svgcontainer';
import SvgShape from './svgshape';
import SvgPath from './svgpath';
import SvgPattern from './svgpattern';

import { INSTANCE_TYPE } from './lib/constant';

const $util = squared.lib.util;

export default class SvgShapePattern extends SvgPaint$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))) implements squared.svg.SvgShapePattern {
    public drawRegion?: BoxRect;

    constructor(
        public element: SVGGraphicsElement,
        public readonly patternElement: SVGPatternElement)
    {
        super(element);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual, element?: SVGGraphicsElement) {
        if (element === undefined) {
            element = this.element;
        }
        const path = SvgPath.build(new SvgPath(element), this.transform, exclusions);
        if (path.value) {
            this.clipRegion = path.value;
            if (path.clipPath) {
                this.clipRegion = path.clipPath;
            }
            const d = [path.value];
            this.setPaint(d);
            const boxRect = SvgBuild.toBoxRect(d);
            const widthAsString = this.patternElement.width.baseVal.valueAsString;
            const heightAsString = this.patternElement.height.baseVal.valueAsString;
            const widthAsPercent = $util.isPercent(widthAsString) ? parseInt(widthAsString) / 100 : parseFloat(widthAsString);
            const heightAsPercent = $util.isPercent(heightAsString) ? parseInt(heightAsString) / 100 : parseFloat(heightAsString);
            const tileWidth = (boxRect.right - boxRect.left) * widthAsPercent;
            const tileHeight = (boxRect.bottom - boxRect.top) * heightAsPercent;
            let height = 1;
            let j = 0;
            while (height > 0) {
                const y = boxRect.top + j * tileHeight;
                let width = 1;
                let i = 0;
                do {
                    const x = boxRect.left + i * tileWidth;
                    const pattern = new SvgPattern(element, this.patternElement);
                    pattern.build(exclusions, residual);
                    pattern.cascade().forEach(item => {
                        if (SvgBuild.isShape(item) && item.path) {
                            item.path.patternParent = this;
                            item.path.refitBaseValue(x, y);
                            SvgPath.build(<SvgPath> item.path, item.transform, exclusions, residual);
                            item.path.fillOpacity = (parseFloat(item.path.fillOpacity) * parseFloat(this.fillOpacity)).toString();
                            item.path.clipPath = SvgBuild.drawRect(tileWidth, tileHeight, x, y) + (item.path.clipPath !== '' ? `;${item.path.clipPath}` : '');
                        }
                    });
                    this.append(pattern);
                    width -= widthAsPercent;
                    i++;
                }
                while (width > 0);
                j++;
                height -= heightAsPercent;
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
            this.drawRegion = boxRect;
        }
    }

    get instanceType() {
        return INSTANCE_TYPE.SVG_SHAPE_PATTERN;
    }
}