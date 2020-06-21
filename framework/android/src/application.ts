
type AppViewModel = android.base.AppViewModel;
type View = android.base.View;

const isTargeted = (node: View, target: Null<HTMLElement | string>) => node.element === target || node.elementId === target || node.controlId === target;

export default class Application<T extends View> extends squared.base.ApplicationUI<T> implements android.base.Application<T> {
    public userSettings!: AndroidUserSettingsUI;
    public readonly controllerHandler!: android.base.Controller<T>;
    public readonly resourceHandler!: android.base.Resource<T>;
    public readonly systemName = 'android';

    private _viewModel?: AppViewModel;

    public resolveTarget(sessionId: string, target: Null<HTMLElement | string>) {
        if (target) {
            for (const node of this.getProcessingCache(sessionId)) {
                if (isTargeted(node, target)) {
                    return node;
                }
            }
            for (const [id, item] of this.session.active.entries()) {
                if (id !== sessionId) {
                    for (const node of item.cache) {
                        if (isTargeted(node, target)) {
                            return node;
                        }
                    }
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