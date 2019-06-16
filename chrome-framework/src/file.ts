import { UserSettingsChrome } from './@types/application';

import View from './view';

export default class File<T extends View> extends squared.base.File<T> implements chrome.base.File<T> {
    get userSettings() {
        return <UserSettingsChrome> this.resource.userSettings;
    }
}