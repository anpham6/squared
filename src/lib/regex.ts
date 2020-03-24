const DECIMAL = '-?(?:\\d+(?:\\.\\d+)?|\\d*\\.\\d+)';
const UNIT_LENGTH = 'px|em|pt|rem|ch|pc|vw|vh|vmin|vmax|mm|cm|in';

export const STRING = {
    DECIMAL,
    PERCENT: '-?\\d+(?:\\.\\d+)?%',
    LENGTH: `(${DECIMAL})(${UNIT_LENGTH})?`,
    LENGTH_PERCENTAGE: `(${DECIMAL}(?:${UNIT_LENGTH}|%)?)`,
    UNIT_LENGTH,
    DATAURI: '(?:data:([^,]+),)?(.*?)',
    CSS_SELECTOR_LABEL: '[\\.#]?[\\w\\-]+',
    CSS_SELECTOR_PSEUDO_ELEMENT: '::[\\w\\-]+',
    CSS_SELECTOR_PSEUDO_CLASS: ':[\\w\\-]+(?:\\(\\s*([^()]+)\\s*\\)|\\(\\s*([\\w\\-]+\\(.+?\\))\\s*\\))?',
    CSS_SELECTOR_ATTR: '\\[([\\w\\-]+)(?:([~^$*|])?=(?:"([^"]+)"|\'([^\']+)\'|([^\\s\\]]+))\\s*(i)?)?\\]',
    CSS_ANGLE: `(${DECIMAL})(deg|rad|turn|grad)`,
    CSS_TIME: `(${DECIMAL})(s|ms)`,
    CSS_CALC: 'calc\\((.+)\\)'
};

export const FILE = {
    SVG: /\.svg$/i
};

export const UNIT = {
    DECIMAL: new RegExp(`^${STRING.DECIMAL}$`),
    LENGTH: new RegExp(`^${STRING.LENGTH}$`),
    PERCENT: new RegExp(`^${STRING.PERCENT}$`),
    LENGTH_PERCENTAGE: new RegExp(`^${STRING.LENGTH_PERCENTAGE}$`)
};

export const CSS = {
    PX: /\dpx$/,
    ANGLE: new RegExp(`^${STRING.CSS_ANGLE}$`),
    TIME: new RegExp(`^${STRING.CSS_TIME}$`),
    CALC: new RegExp(`^${STRING.CSS_CALC}$`),
    VAR: /var\((--[A-Za-z\d-]+)\s*(?!,\s*var\()(?:,\s*([a-z-]+\([^)]+\)|[^)]+))?\)/,
    URL: /^url\((?:"([^"]+)"|([^)]+))\)$/,
    CUSTOM_PROPERTY: /^\s*var\(.+\)\s*$/,
    HEX: /[A-Za-z\d]{3,8}/,
    RGBA: /rgba?\((\d+),\s+(\d+),\s+(\d+)(?:,\s+([\d.]+))?\)/,
    HSLA: /hsla?\((\d+),\s+(\d+)%,\s+(\d+)%(?:,\s+([\d.]+))?\)/,
    SELECTOR_G: new RegExp(`\\s*((?:${STRING.CSS_SELECTOR_ATTR}|${STRING.CSS_SELECTOR_PSEUDO_CLASS}|${STRING.CSS_SELECTOR_PSEUDO_ELEMENT}|${STRING.CSS_SELECTOR_LABEL})+|[>~+])\\s*`, 'g'),
    SELECTOR_LABEL: new RegExp(STRING.CSS_SELECTOR_LABEL),
    SELECTOR_PSEUDO_ELEMENT: new RegExp(STRING.CSS_SELECTOR_PSEUDO_ELEMENT),
    SELECTOR_PSEUDO_CLASS: new RegExp(STRING.CSS_SELECTOR_PSEUDO_CLASS),
    SELECTOR_ATTR: new RegExp(STRING.CSS_SELECTOR_ATTR)
};

export const XML = {
    ATTRIBUTE: /([^\s]+)="([^"]+)"/,
    ENTITY: /&#?[A-Za-z\d]+;/,
    SEPARATOR: /\s*,\s*/,
    DELIMITER: /\s*;\s*/,
    BREAKWORD_G: /([A-Za-z\d]+|&#?[A-Za-z\d]+;)/g,
    NONWORD_G: /[^A-Za-z\d]+/g,
    TAGNAME_G: /(<([^>]+)>)/g
};

export const CHAR = {
    SPACE: /\s+/,
    LEADINGSPACE: /^\s+/,
    TRAILINGSPACE: /\s+$/,
    TRAILINGZERO: /\.(\d*?)(0+)$/,
    LEADINGNEWLINE: /^\s*\n+/,
    LEADINGNUMBER: /^\d/,
    LOWERCASE: /^[a-z]+$/,
    WORD: /\w/,
    UNITZERO: /^\s*0[a-z]*\s*$/,
    WORDDASH: /[a-zA-Z\d]/
};

export const COMPONENT = {
    PROTOCOL: /^([A-Za-z]+:\/\/)([A-Za-z\d\-.]+)(:\d+)?(\/.*)?$/
};

export const ESCAPE = {
    ENTITY: /&#(\d+);/g,
    NONENTITY: /&(?!#?[A-Za-z\d]{2,};)/g
};