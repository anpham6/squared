import { UserSettingsChrome } from './@types/application';

import View from './view';

export default class Resource<T extends View> extends squared.base.Resource<T> implements chrome.base.Resource<T> {
    get userSettings() {
        return <UserSettingsChrome> this.application.userSettings;
    }
}