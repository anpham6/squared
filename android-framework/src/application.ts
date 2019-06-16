import { UserSettingsAndroid } from './@types/application';

import View from './view';

export default class Application<T extends View> extends squared.base.ApplicationUI<T> {
    public userSettings!: UserSettingsAndroid;
}