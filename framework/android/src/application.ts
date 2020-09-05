import type View from './view';

type AppViewModel = android.base.AppViewModel;

export default class Application<T extends View> extends squared.base.ApplicationUI<T> implements android.base.Application<T> {
    public userSettings!: IUserResourceSettingsUI;
    public readonly systemName = 'android';

    private _viewModel = new Map<string, AppViewModel>();

    public init() {
        super.init();
    }

    public reset() {
        this._viewModel.clear();
        super.reset();
    }

    public resolveTarget(sessionId: string, target: Null<HTMLElement | string>) {
        if (target) {
            const isTargeted = (node: View) => node.element === target || node.elementId === target || node.controlId === target;
            for (const node of this.getProcessingCache(sessionId)) {
                if (isTargeted(node)) {
                    return node;
                }
            }
            for (const data of this.session.active) {
                if (data[0] !== sessionId) {
                    for (const node of data[1].cache) {
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