import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

export default abstract class External<T extends NodeUI> extends ExtensionUI<T> {
    public init(element: HTMLElement) {
        if (this.included(element)) {
            this.application.rootElements.add(element);
        }
        return false;
    }
}