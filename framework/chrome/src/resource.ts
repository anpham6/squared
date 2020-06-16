export default class Resource<T extends squared.base.NodeElement> extends squared.base.Resource<T> implements chrome.base.Resource<T> {
    constructor(
        public readonly application: chrome.base.Application<T>,
        public readonly cache: squared.base.NodeList<T>)
    {
        super();
    }

    get userSettings() {
        return this.application.userSettings;
    }
}