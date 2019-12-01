import View from '../view';

const { convertFloat } = squared.lib.util;

export default class <T extends View> extends squared.base.extensions.Relative<T> {
    public postOptimize(node: T) {
        super.postOptimize(node);
        if (node.imageOrSvgElement && node.alignSibling('baseline') && convertFloat(node.verticalAlign) !== 0 && node.android('visibility') === 'invisible') {
            node.android('baselineAlignBottom', 'true');
        }
    }
}