export const enum BUILD_ANDROID {
    PIE = 28,
    OREO_1 = 27,
    OREO = 26,
    NOUGAT_1 = 25,
    NOUGAT = 24,
    MARSHMALLOW = 23,
    LOLLIPOP_1 = 22,
    LOLLIPOP = 21,
    KITKAT_1 = 20,
    KITKAT = 19,
    JELLYBEAN_2 = 18,
    JELLYBEAN_1 = 17,
    JELLYBEAN = 16,
    ICE_CREAM_SANDWICH_1 = 15,
    ICE_CREAM_SANDWICH = 14,
    ALL = 0,
    LATEST = 28
}

export const enum DENSITY_ANDROID {
    LDPI = 120,
    MDPI = 160,
    HDPI = 240,
    XHDPI = 320,
    XXHDPI = 480,
    XXXHDPI = 640
}

export enum CONTAINER_NODE {
    NONE = 0,
    CHECKBOX,
    RADIO,
    EDIT,
    SELECT,
    RANGE,
    SVG,
    TEXT,
    IMAGE,
    BUTTON,
    INLINE,
    LINE,
    SPACE,
    BLOCK,
    FRAME,
    LINEAR,
    GRID,
    RELATIVE,
    CONSTRAINT
}