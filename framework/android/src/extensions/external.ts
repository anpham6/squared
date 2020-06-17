type View = android.base.View;

export default class <T extends View> extends squared.base.ExtensionUI<T> {
    public readonly eventOnly = true;

    public init(element: HTMLElement, sessionId: string) {
        if (this.included(element)) {
            this.application.getProcessing(sessionId)?.rootElements.add(element);
        }
        return false;
    }
}