import { AppViewModel } from '../../@types/android/internal';
import { UserSettings } from '../../@types/android/application';

type View = android.base.View;

const isTargeted = (node: View, target: Null<HTMLElement | string>) => node.element === target || node.elementId === target || node.controlId === target;

export default class Application<T extends View> extends squared.base.ApplicationUI<T> implements android.base.Application<T> {
    public systemName = 'android';
    public userSettings!: UserSettings;
    public readonly controllerHandler!: android.base.Controller<T>;
    public readonly resourceHandler!: android.base.Resource<T>;
    public readonly fileHandler!: android.base.File<T>;

    private _viewModel?: AppViewModel;

    public resolveTarget(target: Null<HTMLElement | string>) {
        if (target) {
            for (const node of this.processing.cache) {
                if (isTargeted(node, target)) {
                    return node;
                }
            }
            for (const node of this.session.cache) {
                if (isTargeted(node, target)) {
                    return node;
                }
            }
        }
        return undefined;
    }

    set viewModel(value) {
        this._viewModel = value;
    }
    get viewModel() {
        return this._viewModel;
    }
}