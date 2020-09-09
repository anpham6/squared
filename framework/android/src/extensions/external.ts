import type View from '../view';

export default class <T extends View> extends squared.base.ExtensionUI<T> {
    public readonly documentBase = true;
    public readonly eventOnly = true;

    public beforeInsertNode(element: HTMLElement, sessionId: string) {
        if (this.included(element)) {
            this.application.getProcessing(sessionId)!.rootElements.add(element);
        }
        return false;
    }
}