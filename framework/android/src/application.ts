type AppViewModel = android.base.AppViewModel;
type View = android.base.View;

export default class Application<T extends View> extends squared.base.ApplicationUI<T> implements android.base.Application<T> {
    public userSettings!: AndroidUserResourceSettingsUI;
    public readonly systemName = 'android';

    private _viewModel = new Map<string, AppViewModel>();

    public reset() {
        super.reset();
        this._viewModel.clear();
    }

    public resolveTarget(sessionId: string, target: Null<HTMLElement | string>) {
        if (target) {
            const isTargeted = (node: View) => node.element === target || node.elementId === target || node.controlId === target;
            for (const node of this.getProcessingCache(sessionId)) {
                if (isTargeted(node)) {
                    return node;
                }
            }
            for (const [id, item] of this.session.active.entries()) {
                if (id !== sessionId) {
                    for (const node of item.cache) {
                        if (isTargeted(node)) {
                            return node;
                        }
                    }
                }
            }
        }
        return null;
    }

    public setViewModel(data: AppViewModel, sessionId?: string) {
        this._viewModel.set(sessionId || '0', data);
    }

    public getViewModel(sessionId: string) {
        return this._viewModel.get(sessionId);
    }

    get viewModel() {
        return this._viewModel;
    }
}