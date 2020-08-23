import type View from '../view';

export default class <T extends View> extends squared.base.extensions.Relative<T> {
    public is(node: T) {
        if (node.inlineVertical) {
            switch (node.css('verticalAlign')) {
                case 'sub':
                case 'super':
                    return true;
            }
        }
        return super.is(node);
    }
}