type Node = squared.base.Node;

declare global {
    namespace squared.base.extensions {
        export class Accessibility<T extends Node> extends squared.base.Extension<T> {}

        export class CssGrid<T extends Node> extends squared.base.Extension<T> {}

        export class External<T extends Node> extends squared.base.Extension<T> {}

        export class Flexbox<T extends Node> extends squared.base.Extension<T> {}

        export class Grid<T extends Node> extends squared.base.Extension<T> {}

        export class List<T extends Node> extends squared.base.Extension<T> {}

        export class Relative<T extends Node> extends squared.base.Extension<T> {}

        export class Sprite<T extends Node> extends squared.base.Extension<T> {}

        export class Substitute<T extends Node> extends squared.base.Extension<T> {}

        export class Table<T extends Node> extends squared.base.Extension<T> {}

        export class VerticalAlign<T extends Node> extends squared.base.Extension<T> {}

        export class WhiteSpace<T extends Node> extends squared.base.Extension<T> {}
    }
}

export {};