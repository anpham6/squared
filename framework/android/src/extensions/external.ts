import type View from '../view';

export default class <T extends View> extends squared.base.ExtensionUI<T> {
    public readonly documentBase = true;
    public readonly eventOnly = true;

    public beforeInsertNode(element: HTMLElement, sessionId: string) {
        if (this.included(element)) {
            const rootElements = this.application.getProcessing(sessionId)!.rootElements;
            if (!rootElements.includes(element)) {
                rootElements.push(element);
            }
        }
        return false;
    }
}