import { UserSettingsAndroid } from '../src/@types/application';

declare global {
    namespace android.base {
        interface Application<T extends View> extends squared.base.ApplicationUI<T> {
            readonly userSettings: UserSettingsAndroid;
        }

        class Application<T extends View> implements Application<T> {}
    }
}

export = android.base.Application;