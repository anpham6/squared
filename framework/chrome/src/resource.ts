import type Application from './application';

export default class Resource<T extends squared.base.Node> extends squared.base.Resource<T> implements chrome.base.Resource<T> {
    constructor(public readonly application: Application<T>) {
        super();
    }

    get userSettings() {
        return this.application.userSettings;
    }
}