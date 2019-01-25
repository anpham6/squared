export const enum INSTANCE_TYPE {
    SVG_CONTAINER = 2,
    SVG_ELEMENT = 4,
    SVG_ANIMATION = 8,
    SVG_SVG = 2 | 16,
    SVG_G = 2 | 32,
    SVG_USE_SYMBOL = 2 | 64,
    SVG_PATTERN = 2 | 128,
    SVG_PATTERN_SHAPE = 2 | 256,
    SVG_PATH = 4 | 512,
    SVG_SHAPE = 4 | 1024,
    SVG_IMAGE = 4 | 2048,
    SVG_USE = 4 | 1024 | 4096,
    SVG_ANIMATE = 8 | 8192,
    SVG_ANIMATE_MOTION = 8 | 8192 | 16384,
    SVG_ANIMATE_TRANSFORM = 8 | 8192 | 32768
}

export const enum FILL_MODE {
    BACKWARDS = 2,
    FORWARDS = 4,
    FREEZE = 8
}

export const KEYSPLINE_NAME = {
    'ease': '0.25 0.1 0.25 1',
    'ease-in': '0.42 0 1 1',
    'ease-in-out': '0.42 0 0.58 1',
    'ease-out': '0 0 0.58 1',
    'linear': '0 0 1 1',
    'step': '0 1 0 1'
};