import { SvgRect } from './@types/object';

import SvgElement from './svgelement';

export default class SvgSymbol extends squared.lib.base.Container<SvgElement> implements squared.svg.SvgSymbol {
    private _viewBox!: SvgRect;

    constructor(public readonly element: SVGSymbolElement) {
        super();
        this.setViewBox(element.viewBox.baseVal);
    }

    public setViewBox(value: SvgRect) {
        this._viewBox = value;
    }

    get viewBox() {
        return this._viewBox;
    }
}