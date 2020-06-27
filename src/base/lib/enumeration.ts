export const enum APP_FRAMEWORK {
    UNIVERSAL = 0,
    VDOM = 1,
    ANDROID = 1 << 1,
    CHROME = 1 << 2
}

export const enum NODE_ALIGNMENT {
    UNKNOWN = 1,
    AUTO_LAYOUT = 1 << 1,
    HORIZONTAL = 1 << 2,
    VERTICAL = 1 << 3,
    ABSOLUTE = 1 << 4,
    BLOCK = 1 << 5,
    SEGMENTED = 1 << 6,
    COLUMN = 1 << 7,
    FLOAT = 1 << 8,
    INLINE = 1 << 9,
    RIGHT = 1 << 10,
    SINGLE = 1 << 11,
    EXTENDABLE = 1 << 12,
    WRAPPER = 1 << 13,
    PERCENT = 1 << 14
}

export const enum BOX_STANDARD {
    MARGIN_TOP = 1,
    MARGIN_RIGHT = 1 << 1,
    MARGIN_BOTTOM = 1 << 2,
    MARGIN_LEFT = 1 << 3,
    PADDING_TOP = 1 << 4,
    PADDING_RIGHT = 1 << 5,
    PADDING_BOTTOM = 1 << 6,
    PADDING_LEFT = 1 << 7,
    MARGIN = MARGIN_TOP | MARGIN_RIGHT | MARGIN_BOTTOM | MARGIN_LEFT,
    MARGIN_VERTICAL = MARGIN_TOP | MARGIN_BOTTOM,
    MARGIN_HORIZONTAL = MARGIN_RIGHT | MARGIN_LEFT,
    PADDING = PADDING_TOP | PADDING_RIGHT | PADDING_BOTTOM | PADDING_LEFT,
    PADDING_VERTICAL = PADDING_TOP | PADDING_BOTTOM,
    PADDING_HORIZONTAL = PADDING_RIGHT | PADDING_LEFT
}

export enum APP_SECTION {
    DOM_TRAVERSE = 1,
    EXTENSION  = 1 << 1,
    RENDER = 1 << 2,
    ALL = DOM_TRAVERSE | EXTENSION | RENDER
}

export enum NODE_RESOURCE {
    BOX_STYLE = 1,
    BOX_SPACING = 1 << 1,
    FONT_STYLE = 1 << 2,
    VALUE_STRING = 1 << 3,
    IMAGE_SOURCE = 1 << 4,
    ASSET = FONT_STYLE | VALUE_STRING | IMAGE_SOURCE,
    ALL = BOX_STYLE | BOX_SPACING | ASSET
}

export enum NODE_PROCEDURE {
    CONSTRAINT = 1,
    LAYOUT = 1 << 1,
    ALIGNMENT = 1 << 2,
    ACCESSIBILITY = 1 << 3,
    LOCALIZATION = 1 << 4,
    CUSTOMIZATION = 1 << 5,
    ALL = CONSTRAINT | LAYOUT | ALIGNMENT | ACCESSIBILITY | LOCALIZATION | CUSTOMIZATION
}

export const enum NODE_TRAVERSE {
    HORIZONTAL,
    VERTICAL,
    LINEBREAK,
    INLINE_WRAP,
    FLOAT_CLEAR,
    FLOAT_BLOCK,
    FLOAT_WRAP,
    FLOAT_INTERSECT,
    PERCENT_WRAP
}

export const enum NODE_TEMPLATE {
    XML = 1,
    INCLUDE
}