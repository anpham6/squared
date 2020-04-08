import { AppViewModelAndroid, UserSettingsAndroid } from '../../@types/android/application';

type View = android.base.View;

export default class Application<T extends View> extends squared.base.ApplicationUI<T> implements android.base.Application<T> {
    public userSettings!: UserSettingsAndroid;
    public readonly controllerHandler!: android.base.Controller<T>;
    public readonly resourceHandler!: android.base.Resource<T>;
    public readonly fileHandler!: android.base.File<T>;

    private _viewModel?: AppViewModelAndroid;

    set viewModel(value: Undef<AppViewModelAndroid>) {
        this._viewModel = value;
    }
    get viewModel() {
        return this._viewModel;
    }
}