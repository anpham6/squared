import { GridCellData, GridData } from '../base/@types/extension';

declare global {
    namespace squared.base.extensions {
        class Accessibility<T extends NodeUI> extends squared.base.ExtensionUI<T> {}
        class CssGrid<T extends NodeUI> extends squared.base.ExtensionUI<T> {}
        class External<T extends NodeUI> extends squared.base.ExtensionUI<T> {}
        class Flexbox<T extends NodeUI> extends squared.base.ExtensionUI<T> {}
        class Grid<T extends NodeUI> extends squared.base.ExtensionUI<T> {
            public static createDataAttribute(): GridData;
            public static createDataCellAttribute<T extends NodeUI>(): GridCellData<T>;
        }
        class List<T extends NodeUI> extends squared.base.ExtensionUI<T> {}
        class Relative<T extends NodeUI> extends squared.base.ExtensionUI<T> {}
        class Sprite<T extends NodeUI> extends squared.base.ExtensionUI<T> {}
        class Substitute<T extends NodeUI> extends squared.base.ExtensionUI<T> {}
        class Table<T extends NodeUI> extends squared.base.ExtensionUI<T> {}
        class VerticalAlign<T extends NodeUI> extends squared.base.ExtensionUI<T> {}
        class WhiteSpace<T extends NodeUI> extends squared.base.ExtensionUI<T> {}
    }
}

export = squared.base.extensions;