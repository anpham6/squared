import { UserSettingsChrome } from '../src/@types/application';

declare global {
    namespace chrome.base {
        interface Resource<T extends View> extends squared.base.Resource<T> {
            readonly userSettings: UserSettingsChrome;
        }

        class Resource<T extends View> implements Resource<T> {}
    }
}

export = chrome.base.Resource;