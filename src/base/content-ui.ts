import type NodeUI from './node-ui';

export default class ContentUI<T extends NodeUI> implements squared.base.ContentUI<T> {
    public renderType?: number;
    public renderIndex?: number;
    public next?: boolean;

    constructor(
        public parent: T,
        public node: T,
        public containerType = 0,
        public alignmentType = 0) {
    }

    set itemCount(value) {}
    get itemCount() { return 0; }
}