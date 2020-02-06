type View = android.base.View;

export default class <T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public init(element: HTMLElement) {
        if (this.included(element)) {
            this.application.rootElements.add(element);
        }
        return false;
    }
}