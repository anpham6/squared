import Resource from '../../resource';

import { CONTAINER_ANDROID } from '../../lib/constant';

type View = android.base.View;

const { isPercent, parseAngle } = squared.lib.css;
const { measureTextWidth } = squared.lib.dom;
const { clamp } = squared.lib.math;
const { capitalizeString, delimitString, lowerCaseString, isNumber, isString } = squared.lib.util;
const { STRING_SPACE, replaceCharacterData } = squared.lib.xml;

const { NODE_RESOURCE } = squared.base.lib.enumeration;

const REGEX_FONTOBLIQUE = /oblique(?:\s+(-?[\d.]+[a-z]+))?/;

function setTextValue(node: View, attr: string, name: string, value: string, useNumber: boolean) {
    name = Resource.addString(value, name, useNumber);
    if (name !== '') {
        node.android(attr, useNumber || !isNumber(name) ? `@string/${name}` : name, false);
    }
}

function getFontVariationStyle(value: string) {
    if (value === 'italic') {
        return "'ital' 1";
    }
    const match = REGEX_FONTOBLIQUE.exec(value);
    if (match) {
        let angle: Undef<number>;
        if (match[1]) {
            angle = parseAngle(match[1], NaN);
        }
        return`'slnt' ${angle !== undefined && !isNaN(angle) ? clamp(angle, -90, 90) : '14'}`;
    }
    return '';
}

export default class ResourceStrings<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceStringsOptions = {
        numberResourceValue: false,
        fontVariantSmallCapsReduction: 0.7
    };
    public readonly eventOnly = true;

    public afterResources() {
        const numberResourceValue = this.options.numberResourceValue;
        this.cacheProcessing.each(node => {
            if (node.hasResource(NODE_RESOURCE.VALUE_STRING)) {
                if (node.styleElement) {
                    const title: string =  node.data(Resource.KEY_NAME, 'titleString') || node.toElementString('title');
                    if (title !== '') {
                        setTextValue(node, 'tooltipText', `${node.controlId.toLowerCase()}_title`, title, numberResourceValue);
                    }
                }
                if (node.inputElement) {
                    if (node.controlName === CONTAINER_ANDROID.EDIT_LIST) {
                        const list = (node.element as HTMLInputElement).list;
                        if (list) {
                            this.createOptionArray(list as HTMLSelectElement, node.controlId);
                        }
                    }
                    const hintString: string = node.data(Resource.KEY_NAME, 'hintString');
                    if (isString(hintString)) {
                        setTextValue(node, 'hint', '', hintString, numberResourceValue);
                    }
                }
                const tagName = node.tagName;
                switch (tagName) {
                    case 'SELECT': {
                        const name = this.createOptionArray(node.element as HTMLSelectElement, node.controlId);
                        if (name !== '') {
                            node.android('entries', `@array/${name}`);
                        }
                        break;
                    }
                    case 'IFRAME': {
                        const stored: StringValue = node.data(Resource.KEY_NAME, 'valueString');
                        if (stored) {
                            Resource.addString(replaceCharacterData(stored.value), stored.key);
                        }
                        break;
                    }
                    default: {
                        const valueString: StringValue = node.data(Resource.KEY_NAME, 'valueString');
                        if (valueString) {
                            let indent = 0;
                            if (node.blockDimension || node.display === 'table-cell') {
                                const textIndent = node.css('textIndent');
                                indent = node.parseUnit(textIndent);
                                if (textIndent === '100%' || indent + node.bounds.width < 0) {
                                    node.delete('android', 'ellipsize', 'maxLines');
                                    return;
                                }
                            }
                            let value = valueString.value;
                            const name = valueString.key || value;
                            if (node.naturalChild && node.alignParent('left') && node.pageFlow && !(node.preserveWhiteSpace && !node.plainText || node.plainText && node.actualParent!.preserveWhiteSpace)) {
                                let leadingSpace = 0;
                                const textContent = node.textContent;
                                const length = textContent.length;
                                let i = 0;
                                while (i < length) {
                                    switch (textContent.charCodeAt(i++)) {
                                        case 160:
                                            ++leadingSpace;
                                        case 32:
                                            continue;
                                        default:
                                            break;
                                    }
                                }
                                if (leadingSpace === 0) {
                                    value = value.replace(/^(\s|&#160;)+/, '');
                                }
                            }
                            switch (node.css('textTransform')) {
                                case 'uppercase':
                                    node.android('textAllCaps', 'true');
                                    node.lockAttr('android', 'textAllCaps');
                                    break;
                                case 'lowercase':
                                    value = lowerCaseString(value);
                                    break;
                                case 'capitalize':
                                    value = capitalizeString(value);
                                    break;
                            }
                            value = replaceCharacterData(value, node.preserveWhiteSpace || tagName === 'CODE' ? node.toInt('tabSize', 8) : 0);
                            const textDecorationLine = node.css('textDecorationLine');
                            if (textDecorationLine !== 'none') {
                                for (const style of textDecorationLine.split(' ')) {
                                    switch (style) {
                                        case 'underline':
                                            value = `<u>${value}</u>`;
                                            break;
                                        case 'line-through':
                                            value = `<strike>${value}</strike>`;
                                            break;
                                    }
                                }
                            }
                            if (tagName === 'INS' && !textDecorationLine.includes('line-through')) {
                                value = `<strike>${value}</strike>`;
                            }
                            if (indent === 0) {
                                const parent = node.actualParent;
                                if (parent?.firstChild === node && (parent.blockDimension || parent.display === 'table-cell')) {
                                    indent = parent.parseUnit(parent.css('textIndent'));
                                }
                            }
                            if (indent > 0) {
                                const width = measureTextWidth(' ', node.css('fontFamily'), node.fontSize) || node.fontSize / 2;
                                value = STRING_SPACE.repeat(Math.max(Math.floor(indent / width), 1)) + value;
                            }
                            let fontVariation = getFontVariationStyle(node.css('fontStyle'));
                            let fontFeature = '';
                            if (node.has('fontStretch')) {
                                let percent = node.css('fontStretch');
                                switch (percent) {
                                    case '100%':
                                        percent = '';
                                        break;
                                    case 'ultra-condensed':
                                        percent = '50%';
                                        break;
                                    case 'extra-condensed':
                                        percent = '62.5%';
                                        break;
                                    case 'condensed':
                                        percent = '75%';
                                        break;
                                    case 'semi-condensed':
                                        percent = '87.5%';
                                        break;
                                    case 'semi-expanded':
                                        percent = '112.5%';
                                        break;
                                    case 'expanded':
                                        percent = '125%';
                                        break;
                                    case 'extra-expanded':
                                        percent = '150%';
                                        break;
                                    case 'ultra-expanded':
                                        percent = '200%';
                                        break;
                                }
                                if (isPercent(percent)) {
                                    fontVariation = delimitString({ value: fontVariation }, `'wdth' ${parseFloat(percent)}`);
                                }
                            }
                            if (node.has('fontVariantCaps')) {
                                for (const variant of node.css('fontVariantCaps').split(/\s+/)) {
                                    switch (variant) {
                                        case 'small-caps':
                                            fontFeature = delimitString({ value: fontFeature }, "'smcp'");
                                            break;
                                        case 'all-small-caps':
                                            fontFeature = delimitString({ value: fontFeature }, "'c2sc'", "'smcp'");
                                            break;
                                        case 'petite-caps':
                                            fontFeature = delimitString({ value: fontFeature }, "'pcap'");
                                            break;
                                        case 'all-petite-caps':
                                            fontFeature = delimitString({ value: fontFeature }, "'c2pc'", "'pcap'");
                                            break;
                                        case 'unicase':
                                            fontFeature = delimitString({ value: fontFeature }, "'unic'");
                                            break;
                                        case 'titling-caps':
                                            fontFeature = delimitString({ value: fontFeature }, "'titl'");
                                            break;
                                    }
                                }
                            }
                            if (node.has('fontVariantNumeric')) {
                                for (const variant of node.css('fontVariantNumeric').split(/\s+/)) {
                                    switch (variant) {
                                        case 'ordinal':
                                            fontFeature = delimitString({ value: fontFeature }, "'ordn'");
                                            break;
                                        case 'slashed-zero':
                                            fontFeature = delimitString({ value: fontFeature }, "'zero'");
                                            break;
                                        case 'lining-nums':
                                            fontFeature = delimitString({ value: fontFeature }, "'lnum'");
                                            break;
                                        case 'oldstyle-nums':
                                            fontFeature = delimitString({ value: fontFeature }, "'onum'");
                                            break;
                                        case 'proportional-nums':
                                            fontFeature = delimitString({ value: fontFeature }, "'pnum'");
                                            break;
                                        case 'tabular-nums':
                                            fontFeature = delimitString({ value: fontFeature }, "'tnum'");
                                            break;
                                        case 'diagonal-fractions':
                                            fontFeature = delimitString({ value: fontFeature }, "'frac'");
                                            break;
                                        case 'stacked-fractions':
                                            fontFeature = delimitString({ value: fontFeature }, "'afrc'");
                                            break;
                                    }
                                }
                            }
                            if (node.has('fontVariantLigatures')) {
                                for (const variant of node.css('fontVariantLigatures').split(/\s+/)) {
                                    switch (variant) {
                                        case 'common-ligatures':
                                            fontFeature = delimitString({ value: fontFeature }, "'liga'");
                                            break;
                                        case 'no-common-ligatures':
                                            fontFeature = delimitString({ value: fontFeature }, "'liga' 0");
                                            break;
                                        case 'discretionary-ligatures':
                                            fontFeature = delimitString({ value: fontFeature }, "'dlig'");
                                            break;
                                        case 'no-discretionary-ligatures':
                                            fontFeature = delimitString({ value: fontFeature }, "'dlig' 0");
                                            break;
                                        case 'historical-ligatures':
                                            fontFeature = delimitString({ value: fontFeature }, "'hlig'");
                                            break;
                                        case 'no-historical-ligatures':
                                            fontFeature = delimitString({ value: fontFeature }, "'hlig' 0");
                                            break;
                                        case 'contextual':
                                            fontFeature = delimitString({ value: fontFeature }, "'calt'");
                                            break;
                                        case 'no-contextual':
                                            fontFeature = delimitString({ value: fontFeature }, "'calt' 0");
                                            break;
                                    }
                                }
                            }
                            if (node.has('fontVariantEastAsian')) {
                                for (const variant of node.css('fontVariantEastAsian').split(/\s+/)) {
                                    switch (variant) {
                                        case 'ruby':
                                            fontFeature = delimitString({ value: fontFeature }, "'ruby'");
                                            break;
                                        case 'jis78':
                                            fontFeature = delimitString({ value: fontFeature }, "'jp78'");
                                            break;
                                        case 'jis83':
                                            fontFeature = delimitString({ value: fontFeature }, "'jp83'");
                                            break;
                                        case 'jis90':
                                            fontFeature = delimitString({ value: fontFeature }, "'jp90'");
                                            break;
                                        case 'jis04':
                                            fontFeature = delimitString({ value: fontFeature }, "'jp04'");
                                            break;
                                        case 'simplified':
                                            fontFeature = delimitString({ value: fontFeature }, "'smpl'");
                                            break;
                                        case 'traditional':
                                            fontFeature = delimitString({ value: fontFeature }, "'trad'");
                                            break;
                                        case 'proportional-width':
                                            fontFeature = delimitString({ value: fontFeature }, "'pwid'");
                                            break;
                                        case 'full-width':
                                            fontFeature = delimitString({ value: fontFeature }, "'fwid'");
                                            break;
                                    }
                                }
                            }
                            if (node.has('fontVariationSettings')) {
                                for (const variant of node.css('fontVariationSettings').replace(/"/g, "'").split(',')) {
                                    fontVariation = delimitString({ value: fontVariation }, variant.trim());
                                }
                            }
                            if (node.has('fontFeatureSettings')) {
                                for (const feature of node.css('fontFeatureSettings').replace(/"/g, "'").split(',')) {
                                    fontFeature = delimitString({ value: fontFeature }, feature.trim());
                                }
                            }
                            if (fontVariation !== '') {
                                node.android('fontVariationSettings', fontVariation);
                            }
                            if (fontFeature !== '') {
                                node.android('fontFeatureSettings', fontFeature);
                            }
                            setTextValue(node, 'text', name, value, numberResourceValue);
                        }
                    }
                }
            }
        });
    }

    public createOptionArray(element: HTMLSelectElement, controlId: string) {
        const [stringArray, numberArray] = Resource.getOptionArray(element);
        const numberResourceValue = this.options.numberResourceValue;
        let result: Undef<string[]>;
        if (!numberResourceValue && numberArray) {
            result = numberArray;
        }
        else {
            const resourceArray = stringArray || numberArray;
            if (resourceArray) {
                result = [];
                for (let value of resourceArray) {
                    value = Resource.addString(replaceCharacterData(value), '', numberResourceValue);
                    if (value !== '') {
                        result.push(`@string/${value}`);
                    }
                }
            }
        }
        return result?.length ? Resource.insertStoredAsset('arrays', `${controlId}_array`, result) : '';
    }
}