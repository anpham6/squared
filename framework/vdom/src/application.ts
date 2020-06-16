export default class Application<T extends squared.base.NodeElement> extends squared.base.Application<T> implements vdom.base.Application<T> {
    public builtInExtensions: ObjectMap<squared.base.Extension<T>> = {};
    public extensions: squared.base.Extension<T>[] = [];
    public readonly systemName = 'vdom';
}