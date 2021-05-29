import { DEPENDENCY_NAMESPACE, DEPENDENCY_SUPPLEMENT, DEPENDENCY_TAGNAME } from './lib/constant';

import type View from './view';

type AppViewModel = android.base.AppViewModel;

export default class Application<T extends View> extends squared.base.ApplicationUI<T> implements android.base.Application<T> {
    public readonly systemName = 'android';

    private _viewModel = new Map<string, AppViewModel>();
    private _dependencies: ObjectMap<string> = {};
    private _resolvedTagName: string[] = [];

    public reset() {
        this._viewModel.clear();
        this._dependencies = {};
        this._resolvedTagName = [];
        super.reset();
    }

    public resolveTarget(sessionId: string, target: Null<squared.base.RootElement>) {
        if (target) {
            const isTargeted = (node: View) => node.element === target || node.elementId.trim() === target || node.controlId === target;
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

    public addLayoutTemplate(parent: T, node: T, template: NodeXmlTemplate<T>, index?: number) {
        super.addLayoutTemplate(...(arguments as unknown) as [T, T, NodeXmlTemplate<T>, number?]);
        if (node.renderedAs && this.userSettings.createBuildDependencies) {
            let controlName = template.controlName;
            if (!this._resolvedTagName.includes(controlName)) {
                const supplement = DEPENDENCY_SUPPLEMENT[controlName];
                let implementation = DEPENDENCY_TAGNAME[controlName];
                this._resolvedTagName.push(controlName);
                if (!implementation) {
                    let i = -1;
                    do {
                        i = controlName.lastIndexOf('.');
                        if (i !== -1) {
                            implementation = DEPENDENCY_NAMESPACE[controlName = controlName.substring(0, i)];
                        }
                        else {
                            break;
                        }
                    }
                    while (!implementation);
                }
                if (implementation) {
                    this.addDependency(...implementation);
                }
                if (supplement) {
                    supplement.forEach(item => this.addDependency(...item));
                }
            }
        }
    }

    public addDependency(group: string, name: string, version: string, overwrite?: boolean) {
        const impl = group + ':' + name;
        if (overwrite || !this._dependencies[impl]) {
            this._dependencies[impl] = version;
        }
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

    get dependencies() {
        const result: string[] = [];
        const dependencies = this._dependencies;
        for (const impl in dependencies) {
            result.push(impl + ':' + dependencies[impl]);
        }
        return result;
    }
}