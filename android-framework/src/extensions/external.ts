export default class <T extends android.base.View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public init(element: HTMLElement) {
        if (this.included(element)) {
            this.application.rootElements.add(element);
        }
        return false;
    }
}