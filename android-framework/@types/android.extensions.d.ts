type View = android.base.View;

declare global {
    namespace android.extensions {
        class Accessibility<T extends View> extends squared.base.extensions.Accessibility<T> {}
        class CssGrid<T extends View> extends squared.base.extensions.CssGrid<T> {}
        class External<T extends View> extends squared.base.extensions.External<T> {}
        class Flexbox<T extends View> extends squared.base.extensions.Flexbox<T> {}
        class Grid<T extends View> extends squared.base.extensions.Grid<T> {}
        class List<T extends View> extends squared.base.extensions.List<T> {}
        class Relative<T extends View> extends squared.base.extensions.Relative<T> {}
        class Sprite<T extends View> extends squared.base.extensions.Sprite<T> {}
        class Substitute<T extends View> extends squared.base.extensions.Substitute<T> {}
        class Table<T extends View> extends squared.base.extensions.Table<T> {}
        class VerticalAlign<T extends View> extends squared.base.extensions.VerticalAlign<T> {}
        class WhiteSpace<T extends View> extends squared.base.extensions.WhiteSpace<T> {}

        namespace constraint {
            class Guideline<T extends View> extends squared.base.Extension<T> {}
        }

        namespace delegate {
            class Fixed<T extends View> extends squared.base.Extension<T> {}
            class MaxWidthHeight<T extends View> extends squared.base.Extension<T> {}
            class Percent<T extends View> extends squared.base.Extension<T> {}
            class RadioGroup<T extends View> extends squared.base.Extension<T> {}
            class ScrollBar<T extends View> extends squared.base.Extension<T> {}
        }

        namespace resource {
            class Background<T extends View> extends squared.base.Extension<T> {}
            class Dimens<T extends View> extends squared.base.Extension<T> {}
            class Fonts<T extends View> extends squared.base.Extension<T> {}
            class Includes<T extends View> extends squared.base.Extension<T> {}
            class Strings<T extends View> extends squared.base.Extension<T> {}
            class Styles<T extends View> extends squared.base.Extension<T> {}
            class Svg<T extends View> extends squared.base.Extension<T> {}
        }
    }
}

export = android.extensions;