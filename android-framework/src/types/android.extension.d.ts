type View = android.base.View;

declare global {
    namespace android.extension {
        export class Accessibility<T extends View> extends squared.base.extensions.Accessibility<T> {}
        export class CssGrid<T extends View> extends squared.base.extensions.CssGrid<T> {}
        export class External<T extends View> extends squared.base.extensions.External<T> {}
        export class Flexbox<T extends View> extends squared.base.extensions.Flexbox<T> {}
        export class Grid<T extends View> extends squared.base.extensions.Grid<T> {}
        export class List<T extends View> extends squared.base.extensions.List<T> {}
        export class Relative<T extends View> extends squared.base.extensions.Relative<T> {}
        export class Sprite<T extends View> extends squared.base.extensions.Sprite<T> {}
        export class Table<T extends View> extends squared.base.extensions.Table<T> {}
        export class VerticalAlign<T extends View> extends squared.base.extensions.VerticalAlign<T> {}
        export class WhiteSpace<T extends View> extends squared.base.extensions.WhiteSpace<T> {}

        namespace constraint {
            export class Guideline<T extends View> extends squared.base.Extension<T> {}
        }

        namespace delegate {
            export class Element<T extends View> extends squared.base.Extension<T> {}
            export class Fixed<T extends View> extends squared.base.Extension<T> {}
            export class MaxWidthHeight<T extends View> extends squared.base.Extension<T> {}
            export class Percent<T extends View> extends squared.base.Extension<T> {}
            export class RadioGroup<T extends View> extends squared.base.Extension<T> {}
            export class ScrollBar<T extends View> extends squared.base.Extension<T> {}
        }

        namespace resource {
            export class Background<T extends View> extends squared.base.Extension<T> {}
            export class Dimens<T extends View> extends squared.base.Extension<T> {}
            export class Fonts<T extends View> extends squared.base.Extension<T> {}
            export class Includes<T extends View> extends squared.base.Extension<T> {}
            export class Strings<T extends View> extends squared.base.Extension<T> {}
            export class Styles<T extends View> extends squared.base.Extension<T> {}
            export class Svg<T extends View> extends squared.base.Extension<T> {}
        }
    }
}

export {};