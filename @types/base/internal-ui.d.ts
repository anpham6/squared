import { ExtensionUI, Node, NodeList, NodeUI } from './squared';
import * as internal from './internal';

export interface AppSession<T extends NodeUI> extends internal.AppSession<T> {
    cache: NodeList<T>;
    excluded: NodeList<T>;
    extensionMap: Map<number, ExtensionUI<T>[]>;
    clearMap: Map<T, string>;
}

export interface AppProcessing<T extends Node> extends internal.AppProcessing<T> {}