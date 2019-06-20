import { UserSettingsAndroid } from './@types/application';

export default class Application<T extends android.base.View> extends squared.base.ApplicationUI<T> implements android.base.Application<T> {
    public userSettings!: UserSettingsAndroid;
}