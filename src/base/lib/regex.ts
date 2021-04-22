const { CSS_ANGLE, LENGTH_PERCENTAGE } = squared.lib.regex.STRING;

const CSS_COLOR = '((?:rgb|hsl)a?\\(\\s*\\d+\\s*,\\s*\\d+%?\\s*,\\s*\\d+%?\\s*(?:,\\s*[\\d.]+\\s*)?\\)|#[A-Za-z\\d]{3,8}|[a-z]{3,})';
const DOM_ENTITY = '#(?:[\\d]+|x[A-Za-z\\d]{5});?|[A-Za-z]{2,};';

export const STRING = {
    CSS_COLOR,
    CSS_COLORSTOP: `\\s*${CSS_COLOR}\\s*(?:(${LENGTH_PERCENTAGE}|${CSS_ANGLE}|(?:c(?:alc|lamp)|m(?:in|ax))\\((.+)\\)(?=\\s*,)|(?:c(?:alc|lamp)|m(?:in|ax))\\((.+)\\))\\s*,?)*\\s*,?`,
    CSS_QUOTE: '("(?:[^"]|(?<=\\\\)")+"|[^\\s]+)\\s+("(?:[^"]|(?<=\\\\)")+"|[^\\s]+)',
    CSS_VARNAME: 'var\\(\\s*(--[^\\s:,)]*)\\s*(?!:)',
    CSS_VARVALUE: '(--[^\\s:]*)\\s*:([^;}]+)'
};

export const CSS = {
    BACKGROUNDIMAGE_G: new RegExp(`url\\([^)]+\\)|initial|(repeating-)?(linear|radial|conic)-gradient\\(((?:to\\s+[a-z\\s]+|(?:from\\s+)?-?[\\d.]+(?:deg|rad|turn|grad)|(?:circle|ellipse)?\\s*(?:closest-side|closest-corner|farthest-side|farthest-corner)?)?\\s*(?:(?:(?:-?[\\d.]+(?:[a-z%]+)?\\s*)+)?(?:at\\s+[\\w\\s%]+)?)?)\\s*,?\\s*((?:${STRING.CSS_COLORSTOP})+)\\)`, 'g')
};

export const DOM = {
    SRCSET: /^(.*?)(?:\s+([\d.]+)\s*([xw]))?$/i,
    ENTITY_G: new RegExp('&' + DOM_ENTITY, 'g'),
    AMPERSAND_G: new RegExp(`&(?!${DOM_ENTITY})`, 'g')
};