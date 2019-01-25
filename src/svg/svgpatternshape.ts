import { SvgTransformExclusions, SvgTransformResidual } from './@types/object';

import SvgBaseVal$MX from './svgbaseval-mx';
import SvgPaint$MX from './svgpaint-mx';
import SvgView$MX from './svgview-mx';
import SvgBuild from './svgbuild';
import SvgContainer from './svgcontainer';
import SvgShape from './svgshape';
import SvgPath from './svgpath';
import SvgPattern from './svgpattern';

const $util = squared.lib.util;

export default class SvgPatternShape extends SvgPaint$MX(SvgBaseVal$MX(SvgView$MX(SvgContainer))) implements squared.svg.SvgPatternShape {
    public clipRegion: string = '';
    public drawRegion?: BoxRect;

    constructor(
        public element: SVGGraphicsElement,
        public readonly patternElement: SVGPatternElement)
    {
        super(element);
    }

    public build(exclusions?: SvgTransformExclusions, residual?: SvgTransformResidual) {
        const path = SvgPath.build(new SvgPath(this.element), this.transform, this.element, exclusions);
        if (path.value) {
            this.clipRegion = path.value;
            if (path.clipPath) {
                this.clipRegion += `;${path.clipPath}`;
            }
            const d = [path.value];
            this.setPaint(d);
            const boxRect = SvgBuild.getPathBoxRect(d);
            const xAsString = this.patternElement.width.baseVal.valueAsString;
            const yAsString = this.patternElement.height.baseVal.valueAsString;
            const percentWidth = $util.isPercent(xAsString) ? parseInt(xAsString) / 100 : parseFloat(xAsString);
            const percentHeight = $util.isPercent(yAsString) ? parseInt(yAsString) / 100 : parseFloat(yAsString);
            const tileWidth = (boxRect.right - boxRect.left) * percentWidth;
            const tileHeight = (boxRect.bottom - boxRect.top) * percentHeight;
            let height = 1;
            let j = 0;
            while (height > 0) {
                const y = boxRect.top + j * tileHeight;
                let width = 1;
                let i = 0;
                do {
                    const x = boxRect.left + i * tileWidth;
                    const pattern = new SvgPattern(this.element, this.patternElement);
                    pattern.build(exclusions, residual);
                    pattern.cascade().forEach(item => {
                        if (SvgBuild.instanceOfShape(item) && item.path) {
                            item.path.refitBaseValue(x, y);
                            SvgPath.build(<SvgPath> item.path, item.transform, item.element, exclusions, residual);
                            item.path.fillOpacity = (parseFloat(item.path.fillOpacity) * parseFloat(this.fillOpacity)).toString();
                            item.path.clipPath = SvgBuild.getRect(tileWidth, tileHeight, x, y) + (item.path.clipPath !== '' ? `;${item.path.clipPath}` : '');
                        }
                    });
                    this.append(pattern);
                    width -= percentWidth;
                    i++;
                }
                while (width > 0);
                j++;
                height -= percentHeight;
            }
            if (this.stroke !== '' && parseFloat(this.strokeWidth) > 0) {
                path.fill = '';
                path.fillOpacity = '0';
                path.stroke = this.stroke;
                path.strokeWidth = this.strokeWidth;
                const shape = new SvgShape(this.element, false);
                shape.path = path;
                this.append(shape);
            }
            this.drawRegion = boxRect;
        }
    }

    get animation() {
        return super.animation.filter(item => this.validateBaseValueType(item.attributeName, 0) === undefined);
    }
}