type Node = squared.base.Node;

declare global {
    namespace squared.base.extensions {
        class Accessibility<T extends Node> extends squared.base.Extension<T> {}
        class CssGrid<T extends Node> extends squared.base.Extension<T> {}
        class External<T extends Node> extends squared.base.Extension<T> {}
        class Flexbox<T extends Node> extends squared.base.Extension<T> {}
        class Grid<T extends Node> extends squared.base.Extension<T> {}
        class List<T extends Node> extends squared.base.Extension<T> {}
        class Relative<T extends Node> extends squared.base.Extension<T> {}
        class Sprite<T extends Node> extends squared.base.Extension<T> {}
        class Substitute<T extends Node> extends squared.base.Extension<T> {}
        class Table<T extends Node> extends squared.base.Extension<T> {}
        class VerticalAlign<T extends Node> extends squared.base.Extension<T> {}
        class WhiteSpace<T extends Node> extends squared.base.Extension<T> {}
    }
}

export {};