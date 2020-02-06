import { UserSettingsAndroid } from '../../@types/android/application';

type View = android.base.View;

export default class Application<T extends View> extends squared.base.ApplicationUI<T> implements android.base.Application<T> {
    public userSettings!: UserSettingsAndroid;
}