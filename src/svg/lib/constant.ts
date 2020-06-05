export const enum INSTANCE_TYPE {
    SVG_USE = 1,
    SVG_CONTAINER = 2,
    SVG_ELEMENT = 4,
    SVG_ANIMATION = 8,
    SVG = 2 | 16,
    SVG_USE_SVG = 1 | 2 | 16 | 32,
    SVG_G = 2 | 64,
    SVG_USE_G = 1 | 2 | 64 | 128,
    SVG_USE_SYMBOL = 1 | 2 | 256,
    SVG_PATTERN = 2 | 512,
    SVG_SHAPE_PATTERN = 2 | 1024,
    SVG_USE_SHAPE_PATTERN = 1 | 2 | 1024 | 2048,
    SVG_SHAPE = 4 | 4096,
    SVG_USE_SHAPE = 1 | 4 | 4096 | 8192,
    SVG_IMAGE = 4 | 16384,
    SVG_PATH = 4 | 32768,
    SVG_ANIMATE = 8 | 65536,
    SVG_ANIMATE_TRANSFORM = 8 | 65536 | 131072,
    SVG_ANIMATE_MOTION = 8 | 65536 | 131072 | 262144
}

export const enum SYNCHRONIZE_MODE {
    FROMTO_ANIMATE = 2,
    KEYTIME_ANIMATE = 4,
    IGNORE_ANIMATE = 8,
    FROMTO_TRANSFORM = 16,
    KEYTIME_TRANSFORM = 32,
    IGNORE_TRANSFORM = 64
}

export const enum SYNCHRONIZE_STATE {
    BACKWARDS = 2,
    INTERRUPTED = 4,
    RESUME = 8,
    COMPLETE = 16,
    EQUAL_TIME = 32,
    INVALID = 64
}

export const enum FILL_MODE {
    FREEZE = 2,
    FORWARDS = 4,
    BACKWARDS = 8
}

export const enum REGION_UNIT {
    USER_SPACE_ON_USE = 1,
    OBJECT_BOUNDING_BOX = 2
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