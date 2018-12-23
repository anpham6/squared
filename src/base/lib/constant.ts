import { BOX_STANDARD } from './enumeration';

export const CSS_SPACING = new Map<number, string>([
    [BOX_STANDARD.MARGIN_TOP, 'marginTop'],
    [BOX_STANDARD.MARGIN_RIGHT, 'marginRight'],
    [BOX_STANDARD.MARGIN_BOTTOM, 'marginBottom'],
    [BOX_STANDARD.MARGIN_LEFT, 'marginLeft'],
    [BOX_STANDARD.PADDING_TOP, 'paddingTop'],
    [BOX_STANDARD.PADDING_RIGHT, 'paddingRight'],
    [BOX_STANDARD.PADDING_BOTTOM, 'paddingBottom'],
    [BOX_STANDARD.PADDING_LEFT, 'paddingLeft']
]);

export const EXT_NAME = {
    ACCESSIBILITY: 'squared.accessibility',
    CSS_GRID: 'squared.css-grid',
    EXTERNAL: 'squared.external',
    FLEXBOX: 'squared.flexbox',
    GRID: 'squared.grid',
    LIST: 'squared.list',
    RELATIVE: 'squared.relative',
    SPRITE: 'squared.sprite',
    SUBSTITUTE: 'squared.substitute',
    TABLE: 'squared.table',
    VERTICAL_ALIGN: 'squared.verticalalign',
    WHITESPACE: 'squared.whitespace'
};