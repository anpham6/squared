
import { Application, Extension, Node, NodeList, NodeUI } from './squared';
import { NodeTemplate, UserSettings } from './application';

export interface AppFramework<T extends Node> {
    base: {};
    extensions: {};
    lib: {};
    system: FunctionMap<any>;
    create(): AppBase<T>;
    cached(): AppBase<T>;
}

export interface AppBase<T extends Node> {
    application: Application<T>;
    framework: number;
    userSettings: UserSettings;
}

export interface AppHandler<T extends Node> {
    application: Application<T>;
    cache: NodeList<T>;
    readonly userSettings: UserSettings;
}

export interface AppSession<T> {
    active: string[];
}

export interface AppSessionUI<T extends NodeUI> extends AppSession<T> {
    cache: NodeList<T>;
    excluded: NodeList<T>;
    extensionMap: Map<number, Extension<T>[]>;
    clearMap: Map<T, string>;
}

export interface AppProcessing<T extends Node> {
    cache: NodeList<T>;
    excluded: NodeList<T>;
    sessionId: string;
    node?: T;
}

export interface AppProcessingUI<T extends Node> extends AppProcessing<T> {}

export interface AppViewModel extends StandardMap {}