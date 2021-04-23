/* eslint no-shadow: "off" */

export const enum PLATFORM {
    WINDOWS = 1,
    MAC = 1 << 1,
    LINUX = 1 << 2
}

export const enum USER_AGENT {
    CHROME = 1,
    SAFARI = 1 << 1,
    FIREFOX = 1 << 2,
    EDGE = 1 << 3,
    EDGE_WIN = 1 << 4,
    OPERA = 1 << 5
}

export const enum CSS_UNIT {
    NONE = 0,
    LENGTH = 1,
    PERCENT = 1 << 1,
    TIME = 1 << 2,
    ANGLE = 1 << 3,
    INTEGER = 1 << 4,
    DECIMAL = 1 << 5
}

export const enum CSS_TRAITS {
    CALC = 1,
    SHORTHAND = 1 << 1,
    LAYOUT = 1 << 2,
    CONTAIN = 1 << 3,
    COLOR = 1 << 4,
    DEPRECATED = 1 << 5,
    NONE = 1 << 6,
    AUTO = 1 << 7,
    UNIT = 1 << 8,
    INHERIT = 1 << 9
}