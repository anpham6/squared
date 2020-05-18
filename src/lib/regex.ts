const DECIMAL = '-?(?:\\d+(?:\\.\\d+)?|\\d*\\.\\d+)';
const UNIT_LENGTH = 'px|em|pt|rem|ch|pc|vw|vh|vmin|vmax|mm|cm|in|ex|Q';

export const STRING = {
    DECIMAL,
    PERCENT: '-?\\d+(?:\\.\\d+)?%',
    LENGTH: `(${DECIMAL})(${UNIT_LENGTH})?`,
    LENGTH_PERCENTAGE: `(${DECIMAL}(?:${UNIT_LENGTH}|%)?)`,
    UNIT_LENGTH,
    DATAURI: '(?:data:([^,]+),)?(.+?)',
    CSS_SELECTOR_LABEL: '[\\.#]?[\\w\\-]+',
    CSS_SELECTOR_PSEUDO_ELEMENT: '::[\\w\\-]+',
    CSS_SELECTOR_PSEUDO_CLASS: ':[\\w\\-]+(?:\\(\\s*([^()]+)\\s*\\)|\\(\\s*([\\w\\-]+\\(.+?\\))\\s*\\))?',
    CSS_SELECTOR_ATTR: '\\[((?:\\*\\|)?(?:\\w+\\\\:)?[\\w\\-]+)(?:([~^$*|])?=(?:"((?:[^"]|\\\\")+)"|\'((?:[^\']|\\\')+)\'|([^\\s\\]]+))\\s*(i)?)?\\]',
    CSS_ANGLE: `(${DECIMAL})(deg|rad|turn|grad)`,
    CSS_TIME: `(${DECIMAL})(s|ms)`,
    CSS_CALC: 'calc\\((.+)\\)'
};

export const FILE = {
    NAME: /[/\\]?(([^/\\]+?)\.([^/\\]+?))$/,
    PROTOCOL: /^([A-Za-z]{3,}:\/\/)([A-Za-z\d\-.]+)(:\d+)?(\/[^?]*)?[?]?(.*)?$/,
    SVG: /\.svg$/i
};

export const UNIT = {
    DECIMAL: new RegExp(`^\\s*(${STRING.DECIMAL})\\s*$`),
    LENGTH: new RegExp(`^\\s*${STRING.LENGTH}\\s*$`),
    PERCENT: new RegExp(`^\\s*(${STRING.PERCENT})\\s*$`),
    LENGTH_PERCENTAGE: new RegExp(`^\\s*${STRING.LENGTH_PERCENTAGE}\\s*$`)
};

export const CSS = {
    ANGLE: new RegExp(`^\\s*${STRING.CSS_ANGLE}\\s*$`),
    TIME: new RegExp(`^\\s*${STRING.CSS_TIME}\\s*$`),
    CALC: new RegExp(`^\\s*${STRING.CSS_CALC}\\s*$`),
    VAR: /var\((--[A-Za-z\d-]+)\s*(?!,\s*var\()(?:,\s*([a-z-]+\([^)]+\)|[^)]+))?\)/,
    URL: /^\s*url\((?:"?((?:[^")]|\\")+)"?)\)\s*$/,
    CUSTOM_PROPERTY: /^\s*var\(.+\)\s*$/,
    HEX: /[A-Za-z\d]{3,8}/,
    RGBA: /rgba?\((\d+),\s+(\d+),\s+(\d+)(?:,\s+([\d.]+%?))?\)/,
    HSLA: /hsla?\((\d+),\s+(\d+)%,\s+(\d+)%(?:,\s+([\d.]+%?))?\)/,
    SELECTOR_G: new RegExp(`\\s*((?:${STRING.CSS_SELECTOR_ATTR}|${STRING.CSS_SELECTOR_PSEUDO_CLASS}|${STRING.CSS_SELECTOR_PSEUDO_ELEMENT}|${STRING.CSS_SELECTOR_LABEL})+|[>~+*])\\s*`, 'g'),
    SELECTOR_LABEL: new RegExp(STRING.CSS_SELECTOR_LABEL),
    SELECTOR_PSEUDO_ELEMENT: new RegExp(STRING.CSS_SELECTOR_PSEUDO_ELEMENT),
    SELECTOR_PSEUDO_CLASS: new RegExp(STRING.CSS_SELECTOR_PSEUDO_CLASS),
    SELECTOR_ATTR: new RegExp(STRING.CSS_SELECTOR_ATTR)
};

export const TRANSFORM = {
    MATRIX: new RegExp(`(matrix(?:3d)?)\\((${STRING.DECIMAL}),\\s+(${STRING.DECIMAL}),\\s+(${STRING.DECIMAL}),\\s+(${STRING.DECIMAL}),\\s+(${STRING.DECIMAL}),\\s+(${STRING.DECIMAL})(?:,\\s+(${STRING.DECIMAL}))?(?:,\\s+(${STRING.DECIMAL}))?(?:,\\s+(${STRING.DECIMAL}))?(?:,\\s+(${STRING.DECIMAL}))?(?:,\\s+(${STRING.DECIMAL}))?(?:,\\s+(${STRING.DECIMAL}))?(?:,\\s+(${STRING.DECIMAL}))?(?:,\\s+(${STRING.DECIMAL}))?(?:,\\s+(${STRING.DECIMAL}))?(?:,\\s+(${STRING.DECIMAL}))?\\)`),
    ROTATE: new RegExp(`(rotate[XYZ]?)\\(${STRING.CSS_ANGLE}\\)`),
    SKEW: new RegExp(`(skew[XY]?)\\(${STRING.CSS_ANGLE}(?:,\\s+${STRING.CSS_ANGLE})?\\)`),
    SCALE: new RegExp(`(scale[XYZ]?)\\((${STRING.DECIMAL})(?:,\\s+(${STRING.DECIMAL}))?\\)`),
    TRANSLATE: new RegExp(`(translate[XYZ]?)\\(${STRING.LENGTH_PERCENTAGE}(?:,\\s+${STRING.LENGTH_PERCENTAGE})?\\)`),
    PERSPECTIVE: new RegExp(`(perspective)\\(${STRING.LENGTH_PERCENTAGE}\\)`)
};