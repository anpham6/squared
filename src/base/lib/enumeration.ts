export const enum APP_FRAMEWORK {
    UNIVERSAL = 0,
    ANDROID = 2,
    CHROME = 4
}

export const enum NODE_ALIGNMENT {
    UNKNOWN = 2,
    AUTO_LAYOUT = 4,
    HORIZONTAL = 8,
    VERTICAL = 16,
    ABSOLUTE = 32,
    BLOCK = 64,
    SEGMENTED = 128,
    COLUMN = 256,
    FLOAT = 512,
    TOP = 1024,
    RIGHT = 2048,
    SINGLE = 4096,
    EXTENDABLE = 8192,
    WRAPPER = 16384
}

export const enum NODE_TEMPLATE {
    XML = 1,
    INCLUDE
}

export const enum NODE_TRAVERSE {
    HORIZONTAL = 0,
    VERTICAL = 1,
    LINEBREAK = 2,
    INLINE_WRAP = 3,
    FLOAT_WRAP = 4,
    FLOAT_CLEAR = 5,
    FLOAT_BLOCK = 6,
    FLOAT_INTERSECT = 7
}

export const enum CSS_STANDARD {
    LENGTH = 2,
    AUTO = 4,
    LEFT = 8,
    BASELINE = 16,
    PERCENT = 32,
    ZERO = 64
}

export const enum BOX_STANDARD {
    MARGIN_TOP = 2,
    MARGIN_RIGHT = 4,
    MARGIN_BOTTOM = 8,
    MARGIN_LEFT = 16,
    PADDING_TOP = 32,
    PADDING_RIGHT = 64,
    PADDING_BOTTOM = 128,
    PADDING_LEFT = 256,
    MARGIN = 2 | 4 | 8 | 16,
    MARGIN_VERTICAL = 2 | 8,
    MARGIN_HORIZONTAL = 4 | 16,
    PADDING = 32 | 64 | 128 | 256,
    PADDING_VERTICAL = 32 | 128,
    PADDING_HORIZONTAL = 64 | 256
}

export enum APP_SECTION {
    DOM_TRAVERSE = 2,
    EXTENSION = 4,
    RENDER = 8,
    ALL = 14
}

export enum NODE_RESOURCE {
    BOX_STYLE = 2,
    BOX_SPACING = 4,
    FONT_STYLE = 8,
    VALUE_STRING = 16,
    IMAGE_SOURCE = 32,
    ASSET = 8 | 16 | 32,
    ALL = 126
}

export enum NODE_PROCEDURE {
    CONSTRAINT = 2,
    LAYOUT = 4,
    ALIGNMENT = 8,
    ACCESSIBILITY = 16,
    LOCALIZATION = 32,
    CUSTOMIZATION = 64,
    ALL = 126
}