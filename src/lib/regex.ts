const DECIMAL_UN = '(?:\\d+(?:\\.\\d*)?|\\d*\\.\\d+)';
const DECIMAL = '[+-]?' + DECIMAL_UN;
const UNIT_LENGTH = 'px|em|pt|rem|ch|pc|vw|vh|vmin|vmax|mm|cm|in|ex|q';
const SELECTOR_ATTR = `\\[\\s*((?:\\*\\|)?(?:[A-Za-z\\-]+:)?[A-Za-z\\-]+)\\s*(?:([~^$*|])?=\\s*(?:"((?:[^"]|(?<=\\\\)")+)"|'((?:[^']|(?<=\\\\)')+)'|([^\\s\\]]+))\\s*(i)?)?\\s*\\]`;
const SELECTOR_PSEUDO_ELEMENT = '::[A-Za-z\\-]+';
const SELECTOR_PSEUDO_CLASS = ':(?:(?:[nN][tT][hH](?:-[lL][aA][sS][tT])?-(?:[cC][hH][iI][lL][dD]|[oO][fF]-[tT][yY][pP][eE])|[lL][aA][nN][gG]|[dD][iI][rR])\\([^)]+\\)|[A-Za-z\\-]+)';
const SELECTOR_LABEL = '[\\.#]?[A-Za-z][\\w\\-]*';
const TAG_ATTR = `=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]*))`;

export const STRING = {
    DECIMAL,
    PERCENT: '[+-]?\\d+(?:\\.\\d+)?%',
    LENGTH: `(${DECIMAL})(${UNIT_LENGTH})?`,
    LENGTH_PERCENTAGE: `(${DECIMAL}(?:${UNIT_LENGTH}|%)?)`,
    UNIT_LENGTH,
    DATAURI: '\\s*(data:\\s*([^;,\\s]+)?\\s*;?\\s*([^,\\s]+)?\\s*,)?\\s*(.+?)\\s*',
    TAG_ATTR,
    TAG_OPEN: `(?:[^=>]|${TAG_ATTR})`,
    CSS_ANGLE: `(${DECIMAL})(deg|rad|turn|grad)`,
    CSS_TIME: `(${DECIMAL})(s|ms)`,
    CSS_RESOLUTION: `(${DECIMAL_UN})(dpi|dpcm|dppx)`
};

export const FILE = {
    NAME: /[/\\]?(([^/\\]+?)\.([^/\\]+?))$/,
    PROTOCOL: /^([A-Za-z]{3,}:\/\/)([A-Za-z\d\-.]+)(:\d+)?(\/[^?]*)?[?]?(.*)?$/,
    BASE64: /^[A-Za-z\d+/]+=*$/,
    SVG: /\.svg\s*$/i
};

export const CSS = {
    URL: /^\s*url\((?:["'](.+)["']|(.+))\)\s*$/i,
    HEX: /^#?[\dA-Fa-f]{3,8}$/,
    RGBA: /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+%?)\s*)?\)/,
    HSLA: /hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+%?)\s*)?\)/,
    SELECTOR_G: new RegExp(`\\s*((?:\\*\\|)?(?:${SELECTOR_ATTR}|${SELECTOR_PSEUDO_ELEMENT}|${SELECTOR_PSEUDO_CLASS}|${SELECTOR_LABEL}|\\*)+|[>~+*])`, 'g'),
    SELECTOR_LABEL: new RegExp(SELECTOR_LABEL),
    SELECTOR_PSEUDO_ELEMENT: new RegExp(SELECTOR_PSEUDO_ELEMENT),
    SELECTOR_PSEUDO_CLASS: new RegExp(SELECTOR_PSEUDO_CLASS),
    SELECTOR_ATTR: new RegExp(SELECTOR_ATTR),
    SELECTOR_ATTR_G: new RegExp(SELECTOR_ATTR, 'g'),
    SELECTOR_ENCLOSING: /:(not|is|where)/gi
};

export const TRANSFORM = {
    MATRIX: new RegExp(`(matrix|matrix3d)\\(\\s*(${DECIMAL})${`,\\s*(${DECIMAL})`.repeat(5)}(?:${`,\\s*(${DECIMAL})`.repeat(10)})?\\s*\\)`),
    ROTATE: new RegExp(`(rotate(?:[XYZ]|3d)?)\\(\\s*(?:(${DECIMAL}),\\s*(${DECIMAL}),\\s*(${DECIMAL}),\\s*)?${STRING.CSS_ANGLE}\\s*\\)`),
    SCALE: new RegExp(`(scale(?:[XYZ]|3d)?)\\(\\s*(${DECIMAL_UN})(?:,\\s*(${DECIMAL_UN}))?(?:,\\s*(${DECIMAL_UN}))?\\s*\\)`),
    TRANSLATE: new RegExp(`(translate(?:[XYZ]|3d)?)\\(\\s*${STRING.LENGTH_PERCENTAGE}(?:,\\s*${STRING.LENGTH_PERCENTAGE})?(?:,\\s*${STRING.LENGTH_PERCENTAGE})?\\s*\\)`),
    SKEW: new RegExp(`(skew[XY]?)\\(\\s*${STRING.CSS_ANGLE}(?:,\\s*${STRING.CSS_ANGLE})?\\s*\\)`),
    PERSPECTIVE: new RegExp(`(perspective)\\(\\s*${STRING.LENGTH_PERCENTAGE}\\s*\\)`)
};