const DECIMAL = '-?\\d+(?:\\.\\d+)?';
const UNIT_TYPE = 'px|em|pt|rem|ch|pc|vw|vh|vmin|vmax|mm|cm|in';

export const STRING = {
    DECIMAL,
    PERCENT: '-?\\d+(?:\\.\\d+)?%',
    LENGTH: `(${DECIMAL})(${UNIT_TYPE})?`,
    LENGTH_PERCENTAGE: `(${DECIMAL}(?:${UNIT_TYPE}|%)?)`,
    CSS_SELECTOR: '\\s*([^\\s:\\[]+)?(:[\\w\\-]+(?:\\(([^)]+)\\))?|(::[\\w\\-]+)|\\[([\\w\\-]+)(?:[~^$*|]?="(.+)")?\\])?\\s*',
    CSS_ANGLE: `(${DECIMAL})(deg|rad|turn|grad)`,
    CSS_CALC: 'calc(\\(.+\\))',
    CSS_VAR: 'var\\((--[A-Za-z\\d\\-]+)(?!,\\s*var\\()(?:,\\s*([a-z\\-]+\\([^)]+\\)|[^)]+))?\\)'
};

export const UNIT = {
    DECIMAL: new RegExp(`^${STRING.DECIMAL}$`),
    LENGTH: new RegExp(`^${STRING.LENGTH}$`),
    PERCENT: new RegExp(`^${STRING.PERCENT}$`)
};

export const CSS = {
    ANGLE: new RegExp(`^${STRING.CSS_ANGLE}$`),
    CALC: new RegExp(`^${STRING.CSS_CALC}$`),
    URL: /^url\("?(.+?)"?\)$/,
    CUSTOMPROPERTY: /^(?:var|calc)\(.+\)$/,
    HEX: /[A-Za-z\d]{3,8}/,
    RGBA: /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/
};

export const XML = {
    ATTRIBUTE: /([^\s]+)="([^"]+)"/,
    ENTITY: /&#?[A-Za-z\d]+;/,
    SEPARATOR: /\s*,\s*/,
    BREAKWORD_G: /([A-Za-z\\d]+|&#?[A-Za-z\\d]+;)/g,
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
    WORDDASH: /[a-zA-Z\d]/
};

export const PREFIX = {
    PROTOCOL: /^[A-Za-z]+:\/\//
};

export const ESCAPE = {
    ENTITY: /&#(\d+);/g,
    NONENTITY: /&(?!#?[A-Za-z\d]{2,};)/g,
    NBSP: /&nbsp;/g,
    AMP: /&/g,
    LT: /</g,
    GT: />/g,
    SINGLEQUOTE: /'/g,
    DOUBLEQUOTE: /"/g,
    U00A0: /\u00A0/g,
    U2002: /\u2002/g,
    U2003: /\u2003/g,
    U2009: /\u2009/g,
    U200C: /\u200C/g,
    U200D: /\u200D/g,
    U200E: /\u200E/g,
    U200F: /\u200F/g
};