import View from './view';

export default class Application<T extends View> extends squared.base.Application<T> {
    public afterCreateCache() {
        if (this.processing.node) {
            (<chrome.base.Controller<T>> this.controllerHandler).addElementList(this.processing.cache);
        }
    }
}