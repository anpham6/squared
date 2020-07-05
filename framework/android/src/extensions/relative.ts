type View = android.base.View;

const { BOX_STANDARD } = squared.base.lib.enumeration;

export default class <T extends View> extends squared.base.extensions.Relative<T> {
    public is(node: T) {
        if (node.inlineStatic || node.imageContainer) {
            switch (node.css('verticalAlign')) {
                case 'sub':
                case 'super':
                    return true;
            }
        }
        return super.is(node);
    }

    public postOptimize(node: T, rendered: T[]) {
        if (!node.baselineAltered) {
            switch (node.css('verticalAlign')) {
                case 'sub': {
                    const renderParent = node.outerMostWrapper.renderParent as T;
                    if (!renderParent.layoutHorizontal) {
                        node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, parseFloat(node.verticalAlign) * -1);
                    }
                    break;
                }
                case 'super': {
                    const renderParent = node.outerMostWrapper.renderParent as T;
                    if (!renderParent.layoutHorizontal) {
                        node.modifyBox(BOX_STANDARD.MARGIN_TOP, parseFloat(node.verticalAlign) * -1);
                    }
                    break;
                }
            }
        }
        super.postOptimize(node, rendered);
    }
}