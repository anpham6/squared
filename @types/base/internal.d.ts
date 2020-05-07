
import { Application, Node, NodeList } from './squared';
import { UserSettings } from './application';

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

export interface AppProcessing<T extends Node> {
    cache: NodeList<T>;
    excluded: NodeList<T>;
    unusedStyles: Set<string>;
    sessionId: string;
    node?: T;
}

export interface AppViewModel extends StandardMap {}