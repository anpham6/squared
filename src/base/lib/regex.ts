const { CSS_ANGLE, LENGTH_PERCENTAGE } = squared.lib.regex.STRING;

const CSS_COLOR = '((?:rgb|hsl)a?\\(\\s*\\d+\\s*,\\s*\\d+%?\\s*,\\s*\\d+%?\\s*(?:,\\s*[\\d.]+\\s*)?\\)|#[A-Za-z\\d]{3,8}|[a-z]{3,})';

export const STRING = {
    CSS_COLOR,
    CSS_COLORSTOP: `\\s*${CSS_COLOR}(?:\\s*(${LENGTH_PERCENTAGE}|${CSS_ANGLE}|(?:calc|min|max|clamp)\\((.+)\\)(?=\\s*,)|(?:calc|min|max|clamp)\\((.+)\\))\\s*,?)*\\s*,?`,
    CSS_QUOTE: '("(?:[^"]|(?<=\\\\)")+"|[^\\s]+)\\s+("(?:[^"]|(?<=\\\\)")+"|[^\\s]+)'
};