import { SvgTransform } from './@types/object';

import SvgAnimation from './svganimation';
import SvgBuild from './svgbuild';
import SvgContainber from './svgcontainer';

import { getTransform, isVisible, setOpacity, setVisible } from './lib/util';

const $dom = squared.lib.dom;

export default <T extends Constructor<squared.svg.SvgBaseVal>>(Base: T) => {
    return class extends Base implements squared.svg.SvgView {
        public transformed: SvgTransform[] | null = null;
        public parent?: SvgContainber;

        private _name?: string;
        private _animate?: SvgAnimation[];
        private _transform?: SvgTransform[];

        get name() {
            if (this._name === undefined) {
                this._name = SvgBuild.setName(this.element);
            }
            return this._name;
        }

        get transform() {
            if (this._transform === undefined) {
                this._transform = getTransform(this.element) || SvgBuild.toTransformList(this.element.transform.baseVal);
            }
            return this._transform;
        }

        get animate() {
            if (this._animate === undefined) {
                this._animate = SvgBuild.toAnimateList(this.element);
                for (const item of this._animate) {
                    item.parent = this;
                }
            }
            return this._animate;
        }

        set visible(value) {
            setVisible(this.element, value);
        }
        get visible() {
            return isVisible(this.element);
        }

        set opacity(value) {
            setOpacity(this.element, value);
        }
        get opacity() {
            return $dom.cssAttribute(this.element, 'opacity') || '1';
        }
    };
};