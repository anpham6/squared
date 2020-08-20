export const enum INSTANCE_TYPE {
    SVG_USE = 1,
    SVG_CONTAINER = 1 << 1,
    SVG_ELEMENT = 1 << 2,
    SVG_ANIMATION = 1 << 3,
    SVG = SVG_CONTAINER | 1 << 4,
    SVG_G = SVG_CONTAINER | 1 << 5,
    SVG_USE_G = SVG_USE | SVG | 1 << 5 | 1 << 6,
    SVG_USE_SYMBOL = SVG_CONTAINER | SVG_USE | 1 << 7,
    SVG_PATTERN = SVG_CONTAINER | 1 << 8,
    SVG_SHAPE_PATTERN = SVG_CONTAINER | 1 << 9,
    SVG_USE_SHAPE_PATTERN = SVG_USE | SVG_SHAPE_PATTERN | 1 << 10,
    SVG_SHAPE = SVG_ELEMENT | 1 << 11,
    SVG_USE_SHAPE = SVG_USE | SVG_SHAPE | 1 << 12,
    SVG_IMAGE = SVG_ELEMENT | 1 << 13,
    SVG_PATH = SVG_ELEMENT | 1 << 14,
    SVG_ANIMATE = SVG_ANIMATION | 1 << 15,
    SVG_ANIMATE_TRANSFORM = SVG_ANIMATE | 1 << 16,
    SVG_ANIMATE_MOTION = SVG_ANIMATE_TRANSFORM | 1 << 17
}

export const enum SYNCHRONIZE_MODE {
    FROMTO_ANIMATE = 1,
    KEYTIME_ANIMATE = 1 << 1,
    IGNORE_ANIMATE = 1 << 2,
    FROMTO_TRANSFORM = 1 << 3,
    KEYTIME_TRANSFORM = 1 << 4,
    IGNORE_TRANSFORM = 1 << 5
}

export const enum SYNCHRONIZE_STATE {
    BACKWARDS = 1,
    INTERRUPTED = 1 << 1,
    RESUME = 1 << 2,
    COMPLETE = 1 << 3,
    EQUAL_TIME = 1 << 4,
    INVALID = 1 << 5
}

export const enum FILL_MODE {
    FREEZE = 1,
    FORWARDS = 1 << 1,
    BACKWARDS = 1 << 2
}

export const enum REGION_UNIT {
    USER_SPACE_ON_USE = 1,
    OBJECT_BOUNDING_BOX
}

export const KEYSPLINE_NAME = {
    'ease': '0.25 0.1 0.25 1',
    'ease-in': '0.42 0 1 1',
    'ease-in-out': '0.42 0 0.58 1',
    'ease-out': '0 0 0.58 1',
    'linear': '0 0 1 1',
    'step-start': '0 1 0 1',
    'step-end': '1 0 1 0'
};

export const PATTERN_CUBICBEZIER = '([01](?:\\.\\d+)?),?\\s+(-?\\d+(?:\\.\\d+)?),?\\s+([01](?:\\.\\d+)?),?\\s+(-?\\d+(?:\\.\\d+)?)';