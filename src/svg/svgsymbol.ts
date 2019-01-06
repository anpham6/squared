import SvgElement from './svgelement';

export default class SvgSymbol extends squared.lib.base.Container<SvgElement> implements squared.svg.SvgSymbol {
    constructor(public readonly element: SVGSymbolElement) {
        super();
    }

    get viewBox() {
        return this.element.viewBox.baseVal;
    }
}