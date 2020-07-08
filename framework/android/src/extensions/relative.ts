type View = android.base.View;

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
}