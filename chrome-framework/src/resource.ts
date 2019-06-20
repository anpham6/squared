export default class Resource<T extends chrome.base.View> extends squared.base.Resource<T> implements chrome.base.Resource<T> {
    constructor(
        public application: chrome.base.Application<T>,
        public cache: squared.base.NodeList<T>)
    {
        super();
    }

    get userSettings() {
        return this.application.userSettings;
    }
}