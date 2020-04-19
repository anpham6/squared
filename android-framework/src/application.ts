import { AppViewModelAndroid } from '../../@types/android/internal';
import { UserSettingsAndroid } from '../../@types/android/application';

type View = android.base.View;

export default class Application<T extends View> extends squared.base.ApplicationUI<T> implements android.base.Application<T> {
    public systemName = 'android';
    public userSettings!: UserSettingsAndroid;
    public readonly controllerHandler!: android.base.Controller<T>;
    public readonly resourceHandler!: android.base.Resource<T>;
    public readonly fileHandler!: android.base.File<T>;

    private _viewModel?: AppViewModelAndroid;

    public resolveTarget(target: Null<HTMLElement | string>) {
        if (target) {
            for (const node of this.processing.cache) {
                if (node.element === target || node.elementId === target || node.controlId === target) {
                    return node;
                }
            }
            for (const node of this.session.cache) {
                if (node.element === target || node.elementId === target || node.controlId === target) {
                    return node;
                }
            }
        }
        return undefined;
    }

    set viewModel(value: Undef<AppViewModelAndroid>) {
        this._viewModel = value;
    }
    get viewModel() {
        return this._viewModel;
    }
}