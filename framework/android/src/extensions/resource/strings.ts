import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;

import { CONTAINER_TAGNAME } from '../../lib/constant';

import type View from '../../view';

import Resource from '../../resource';

import { replaceCharacterData, sanitizeString } from '../../lib/util';

const { isPercent, parseAngle } = squared.lib.css;
const { getTextMetrics } = squared.lib.dom;
const { clamp } = squared.lib.math;
const { delimitString } = squared.lib.util;

const { lowerCaseString, upperCaseString } = squared.base.lib.util;

const REGEXP_FONTVARIATION = /oblique(?:\s+(-?[\d.]+(?:[a-z]+)?))?/;

function getFontVariationStyle(value: string) {
    if (value === 'italic') {
        return "'ital' 1";
    }
    const match = REGEXP_FONTVARIATION.exec(value);
    if (match) {
        const angle = match[1] ? parseAngle(match[1]) : NaN;
        return "'slnt' " + (!isNaN(angle) ? clamp(angle, -90, 90) : '14');
    }
    return '';
}

function setTextValue(node: View, attr: string, name: string) {
    if (name) {
        node.android(attr, name, false);
    }
}

export default class ResourceStrings<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceStringsOptions = {
        numberAsResource: false
    };
    public readonly eventOnly = true;

    public afterResources(sessionId: string, resourceId: number) {
        const numberAsResource = this.options.numberAsResource;
        const resource = this.resource;
        this.application.getProcessingCache(sessionId).each(node => {
            if (node.hasResource(NODE_RESOURCE.VALUE_STRING)) {
                if (node.styleElement) {
                    const title = node.data<string>(Resource.KEY_NAME, 'titleString') || node.toElementString('title');
                    if (title) {
                        setTextValue(
                            node,
                            'tooltipText',
                            Resource.addString(resourceId, replaceCharacterData(sanitizeString(resource.preFormatString(title))), `${node.controlId.toLowerCase()}_title`, numberAsResource)
                        );
                    }
                }
                if (node.controlName === CONTAINER_TAGNAME.EDIT_LIST) {
                    const list = (node.element as HTMLInputElement).list;
                    if (list) {
                        this.createOptionArray(resourceId, list as HTMLSelectElement, node.controlId);
                    }
                }
                const hintString = node.data<string>(Resource.KEY_NAME, 'hintString');
                if (hintString) {
                    setTextValue(
                        node,
                        'hint',
                        Resource.addString(resourceId, replaceCharacterData(sanitizeString(resource.preFormatString(hintString))), `${node.controlId.toLowerCase()}_hint`, numberAsResource)
                    );
                }
                const tagName = node.tagName;
                switch (tagName) {
                    case 'SELECT': {
                        const name = this.createOptionArray(resourceId, node.element as HTMLSelectElement, node.controlId);
                        if (name) {
                            node.android('entries', `@array/${name}`);
                        }
                        break;
                    }
                    case 'IFRAME': {
                        const valueString = node.data<string>(Resource.KEY_NAME, 'valueString');
                        if (valueString) {
                            Resource.addString(resourceId, replaceCharacterData(resource.preFormatString(valueString)), `${node.controlId.toLowerCase()}_iframe_src`);
                        }
                        break;
                    }
                    default: {
                        let valueString = node.data<string>(Resource.KEY_NAME, 'valueString');
                        if (valueString) {
                            const textIndent = node.textIndent;
                            if (isNaN(textIndent)) {
                                node.delete('android', 'ellipsize', 'maxLines');
                                return;
                            }
                            switch (node.css('textTransform')) {
                                case 'uppercase':
                                    node.android('textAllCaps', 'true');
                                    node.lockAttr('android', 'textAllCaps');
                                    break;
                                case 'lowercase':
                                    valueString = lowerCaseString(valueString);
                                    break;
                                case 'capitalize':
                                    valueString = upperCaseString(valueString);
                                    break;
                            }
                            const textDecorationLine = node.css('textDecorationLine');
                            let decoration = 0;
                            if (textDecorationLine !== 'none') {
                                if (textDecorationLine.includes('underline')) {
                                    decoration |= 1;
                                }
                                if (textDecorationLine.includes('line-through')) {
                                    decoration |= 2;
                                }
                            }
                            valueString = replaceCharacterData(valueString, node.preserveWhiteSpace || tagName === 'CODE' ? node.toInt('tabSize', 8) : 0, decoration > 0);
                            if (decoration & 1) {
                                valueString = `<u>${valueString}</u>`;
                            }
                            if (decoration & 2) {
                                valueString = `<strike>${valueString}</strike>`;
                            }
                            if (textIndent > 0) {
                                const metrics = getTextMetrics(' ', node.fontSize, node.css('fontFamily'));
                                if (metrics) {
                                    valueString = resource.STRING_SPACE.repeat(Math.max(Math.floor(textIndent / metrics.width), 1)) + valueString;
                                }
                            }
                            let fontVariation = getFontVariationStyle(node.css('fontStyle')),
                                fontFeature = '';
                            if (node.has('fontStretch')) {
                                let percent = node.cssValue('fontStretch');
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
                                    fontVariation = delimitString(fontVariation, `'wdth' ${parseFloat(percent)}`);
                                }
                            }
                            if (node.has('fontVariantCaps')) {
                                fontFeature = node.cssValue('fontVariantCaps').split(' ').reduce((a, b) => {
                                    switch (b) {
                                        case 'small-caps':
                                            b = "'smcp'";
                                            break;
                                        case 'all-small-caps':
                                            b = "'c2sc', 'smcp'";
                                            break;
                                        case 'petite-caps':
                                            b = "'pcap'";
                                            break;
                                        case 'all-petite-caps':
                                            b = "'c2pc', 'pcap'";
                                            break;
                                        case 'unicase':
                                            b = "'unic'";
                                            break;
                                        case 'titling-caps':
                                            b = "'titl'";
                                            break;
                                        default:
                                            return a;
                                    }
                                    return a + (a ? ', ' : '') + b;
                                }, fontFeature);
                            }
                            if (node.has('fontVariantNumeric')) {
                                fontFeature = node.cssValue('fontVariantNumeric').split(' ').reduce((a, b) => {
                                    switch (b) {
                                        case 'ordinal':
                                            b = "'ordn'";
                                            break;
                                        case 'slashed-zero':
                                            b = "'zero'";
                                            break;
                                        case 'lining-nums':
                                            b = "'lnum'";
                                            break;
                                        case 'oldstyle-nums':
                                            b = "'onum'";
                                            break;
                                        case 'proportional-nums':
                                            b = "'pnum'";
                                            break;
                                        case 'tabular-nums':
                                            b = "'tnum'";
                                            break;
                                        case 'diagonal-fractions':
                                            b = "'frac'";
                                            break;
                                        case 'stacked-fractions':
                                            b = "'afrc'";
                                            break;
                                        default:
                                            return a;
                                    }
                                    return a + (a ? ', ' : '') + b;
                                }, fontFeature);
                            }
                            if (node.has('fontVariantLigatures')) {
                                fontFeature = node.cssValue('fontVariantLigatures').split(' ').reduce((a, b) => {
                                    switch (b) {
                                        case 'common-ligatures':
                                            b = "'liga'";
                                            break;
                                        case 'no-common-ligatures':
                                            b = "'liga' 0";
                                            break;
                                        case 'discretionary-ligatures':
                                            b = "'dlig'";
                                            break;
                                        case 'no-discretionary-ligatures':
                                            b = "'dlig' 0";
                                            break;
                                        case 'historical-ligatures':
                                            b = "'hlig'";
                                            break;
                                        case 'no-historical-ligatures':
                                            b = "'hlig' 0";
                                            break;
                                        case 'contextual':
                                            b = "'calt'";
                                            break;
                                        case 'no-contextual':
                                            b = "'calt' 0";
                                            break;
                                        default:
                                            return a;
                                    }
                                    return a + (a ? ', ' : '') + b;
                                }, fontFeature);
                            }
                            if (node.has('fontVariantEastAsian')) {
                                fontFeature = node.cssValue('fontVariantEastAsian').split(' ').reduce((a, b) => {
                                    switch (b) {
                                        case 'ruby':
                                            b = "'ruby'";
                                            break;
                                        case 'jis78':
                                            b = "'jp78'";
                                            break;
                                        case 'jis83':
                                            b = "'jp83'";
                                            break;
                                        case 'jis90':
                                            b = "'jp90'";
                                            break;
                                        case 'jis04':
                                            b = "'jp04'";
                                            break;
                                        case 'simplified':
                                            b = "'smpl'";
                                            break;
                                        case 'traditional':
                                            b = "'trad'";
                                            break;
                                        case 'proportional-width':
                                            b = "'pwid'";
                                            break;
                                        case 'full-width':
                                            b = "'fwid'";
                                            break;
                                        default:
                                            return a;
                                    }
                                    return a + (a ? ', ' : '') + b;
                                }, fontFeature);
                            }
                            if (node.has('fontVariationSettings' as CssStyleAttr)) {
                                for (const variant of node.cssValue('fontVariationSettings' as CssStyleAttr).replace(/"/g, "'").split(',')) {
                                    fontVariation = delimitString(fontVariation, variant);
                                }
                            }
                            if (node.has('fontFeatureSettings')) {
                                for (const feature of node.cssValue('fontFeatureSettings').replace(/"/g, "'").split(',')) {
                                    fontFeature = delimitString(fontFeature, feature);
                                }
                            }
                            if (fontVariation) {
                                node.android('fontVariationSettings', fontVariation);
                            }
                            if (fontFeature) {
                                node.android('fontFeatureSettings', fontFeature);
                            }
                            setTextValue(node, 'text', Resource.addString(resourceId, valueString, '', numberAsResource));
                        }
                    }
                }
            }
        });
    }

    public createOptionArray(resourceId: number, element: HTMLSelectElement, controlId: string) {
        const [stringArray, numberArray] = Resource.getOptionArray(element);
        const numberAsResource = this.options.numberAsResource;
        let result: Undef<string[]>;
        if (!numberAsResource && numberArray) {
            result = numberArray;
        }
        else {
            const resourceArray = stringArray || numberArray;
            if (resourceArray) {
                const resource = this.resource;
                result = [];
                for (let i = 0, length = resourceArray.length; i < length; ++i) {
                    const value = Resource.addString(resourceId, replaceCharacterData(sanitizeString(resource.preFormatString(resourceArray[i]))), '', numberAsResource);
                    if (value) {
                        result.push(value);
                    }
                }
            }
        }
        return result && result.length ? Resource.insertStoredAsset(resourceId, 'arrays', `${controlId.toLowerCase()}_array`, result) : '';
    }
}