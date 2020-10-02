const DECIMAL = '-?(?:\\d+(?:\\.\\d+)?|\\d*\\.\\d+)';
const UNIT_LENGTH = 'px|em|pt|rem|ch|pc|vw|vh|vmin|vmax|mm|cm|in|ex|Q';

export const STRING = {
    DECIMAL,
    PERCENT: '-?\\d+(?:\\.\\d+)?%',
    LENGTH: `(${DECIMAL})(${UNIT_LENGTH})?`,
    LENGTH_PERCENTAGE: `(${DECIMAL}(?:${UNIT_LENGTH}|%)?)`,
    UNIT_LENGTH,
    DATAURI: '(?:data:([^,]+),)?(.+?)',
    CSS_SELECTOR_LABEL: '[\\.#]?[A-Za-z][\\w\\-]*',
    CSS_SELECTOR_PSEUDO_ELEMENT: '::[A-Za-z\\-]+',
    CSS_SELECTOR_PSEUDO_CLASS: ':[A-Za-z\\-]+(?:\\(\\s*([^)]+)\\s*\\))?',
    CSS_SELECTOR_ATTR: '\\[((?:\\*\\|)?(?:[A-Za-z\\-]+:)?[A-Za-z\\-]+)(?:([~^$*|])?=(?:"((?:[^"]|\\\\")+)"|\'((?:[^\']|\\\')+)\'|([^\\s\\]]+))\\s*(i)?)?\\]',
    CSS_ANGLE: `(${DECIMAL})(deg|rad|turn|grad)`,
    CSS_TIME: `(${DECIMAL})(s|ms)`,
    CSS_CALC: 'calc\\((.+)\\)'
};

export const FILE = {
    NAME: /[/\\]?(([^/\\]+?)\.([^/\\]+?))$/,
    PROTOCOL: /^([A-Za-z]{3,}:\/\/)([A-Za-z\d\-.]+)(:\d+)?(\/[^?]*)?[?]?(.*)?$/,
    SVG: /\.svg\s*$/i
};

export const CSS = {
    URL: /^\s*url\((.+)\)\s*$/,
    HEX: /^#[A-Fa-f\d]{3,8}$/,
    RGBA: /rgba?\((\d+),\s+(\d+),\s+(\d+)(?:,\s+([\d.]+%?))?\)/,
    HSLA: /hsla?\((\d+),\s+(\d+)%,\s+(\d+)%(?:,\s+([\d.]+%?))?\)/,
    SELECTOR_G: new RegExp(`\\s*((?:${STRING.CSS_SELECTOR_ATTR}|${STRING.CSS_SELECTOR_PSEUDO_CLASS}|${STRING.CSS_SELECTOR_PSEUDO_ELEMENT}|${STRING.CSS_SELECTOR_LABEL})+|[>~+*])\\s*`, 'g'),
    SELECTOR_LABEL: new RegExp(STRING.CSS_SELECTOR_LABEL),
    SELECTOR_PSEUDO_ELEMENT: new RegExp(STRING.CSS_SELECTOR_PSEUDO_ELEMENT),
    SELECTOR_PSEUDO_CLASS: new RegExp(STRING.CSS_SELECTOR_PSEUDO_CLASS),
    SELECTOR_ATTR: new RegExp(STRING.CSS_SELECTOR_ATTR)
};

export const TRANSFORM = {
    MATRIX: new RegExp(`(matrix(?:3d)?)\\((${DECIMAL}),\\s+(${DECIMAL}),\\s+(${DECIMAL}),\\s+(${DECIMAL}),\\s+(${DECIMAL}),\\s+(${DECIMAL})(?:,\\s+(${DECIMAL}))?(?:,\\s+(${DECIMAL}))?(?:,\\s+(${DECIMAL}))?(?:,\\s+(${DECIMAL}))?(?:,\\s+(${DECIMAL}))?(?:,\\s+(${DECIMAL}))?(?:,\\s+(${DECIMAL}))?(?:,\\s+(${DECIMAL}))?(?:,\\s+(${DECIMAL}))?(?:,\\s+(${DECIMAL}))?\\)`),
    ROTATE: new RegExp(`(rotate[XYZ]?)\\(${STRING.CSS_ANGLE}\\)`),
    SKEW: new RegExp(`(skew[XY]?)\\(${STRING.CSS_ANGLE}(?:,\\s+${STRING.CSS_ANGLE})?\\)`),
    SCALE: new RegExp(`(scale[XYZ]?)\\((${DECIMAL})(?:,\\s+(${DECIMAL}))?\\)`),
    TRANSLATE: new RegExp(`(translate[XYZ]?)\\(${STRING.LENGTH_PERCENTAGE}(?:,\\s+${STRING.LENGTH_PERCENTAGE})?\\)`),
    PERSPECTIVE: new RegExp(`(perspective)\\(${STRING.LENGTH_PERCENTAGE}\\)`)
};