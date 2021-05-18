
import type Node from '../../node';

const { Iterator } = squared.lib.base;

export default class MultiSet<T extends Node> implements squared.base.lib.session.MultiSet<T> {
    public readonly [Symbol.toStringTag] = '[object MultiSet]';

    private _sessionMap: ObjectMap<T[]> = {};
    private _children: Null<T[]> = null;

    public [Symbol.iterator]() {
        return new Iterator(this.combine());
    }

    public keys(sessionId?: string) {
        return this.values(sessionId);
    }

    public values(sessionId?: string) {
        return new Iterator(sessionId ? this._sessionMap[sessionId] || [] as T[] : this.combine());
    }

    public entries(sessionId?: string) {
        return new Set(sessionId ? this._sessionMap[sessionId] || [] as T[] : this.combine()).entries();
    }

    public clear(sessionId?: string) {
        if (sessionId) {
            delete this._sessionMap[sessionId];
        }
        else {
            this._sessionMap = {};
        }
    }

    public add(node: T) {
        const items = this._sessionMap[node.sessionId] ||= [];
        if (!items.includes(node)) {
            items.push(node);
            this._children = null;
        }
        return this;
    }

    public delete(node: T) {
        const items = this._sessionMap[node.sessionId];
        if (items) {
            const index = items.indexOf(node);
            if (index !== -1) {
                items.splice(index, 1);
                this._children = null;
                return true;
            }
        }
        return false;
    }

    public has(node: T) {
        const items = this._sessionMap[node.sessionId];
        return !!items && items.includes(node);
    }

    public combine() {
        if (this._children) {
            return this._children;
        }
        const children: T[] = [];
        for (const sessionId in this._sessionMap) {
            children.push(...this._sessionMap[sessionId]!);
        }
        return this._children = children;
    }

    public forEach(predicate: (a: T, b: T, set: Set<T>) => void, thisArg?: any) {
        new Set(this.combine()).forEach(predicate, thisArg);
    }

    get size() {
        return this.combine().length;
    }
}