import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;

import { CONTAINER_TAGNAME } from '../../lib/constant';

import type View from '../../view';

import Resource from '../../resource';

import { replaceCharacterData, sanitizeString } from '../../lib/util';

const { parseAngle } = squared.lib.css;
const { getTextMetrics } = squared.lib.dom;
const { clamp } = squared.lib.math;
const { delimitString } = squared.lib.util;

const { lowerCaseString, upperCaseString } = squared.base.lib.util;

const REGEXP_FONTVARIATION = /oblique(?:\s+(-?[\d.]+[a-z]+))?/;

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

    public afterResources(sessionId: string) {
        const numberAsResource = this.options.numberAsResource;
        const resource = this.resource!;
        this.application.getProcessingCache(sessionId).each(node => {
            if (node.hasResource(NODE_RESOURCE.VALUE_STRING)) {
                if (node.styleElement) {
                    const title = node.data<string>(Resource.KEY_NAME, 'titleString') || node.toElementString('title');
                    if (title) {
                        setTextValue(
                            node,
                            'tooltipText',
                            Resource.addString(replaceCharacterData(sanitizeString(resource.preFormatString(title))), `${node.controlId.toLowerCase()}_title`, numberAsResource)
                        );
                    }
                }
                if (node.controlName === CONTAINER_TAGNAME.EDIT_LIST) {
                    const list = (node.element as HTMLInputElement).list;
                    if (list) {
                        this.createOptionArray(list as HTMLSelectElement, node.controlId);
                    }
                }
                const hintString = node.data<string>(Resource.KEY_NAME, 'hintString');
                if (hintString) {
                    setTextValue(
                        node,
                        'hint',
                        Resource.addString(replaceCharacterData(sanitizeString(resource.preFormatString(hintString))), `${node.controlId.toLowerCase()}_hint`, numberAsResource)
                    );
                }
                const tagName = node.tagName;
                switch (tagName) {
                    case 'SELECT': {
                        const name = this.createOptionArray(node.element as HTMLSelectElement, node.controlId);
                        if (name) {
                            node.android('entries', `@array/${name}`);
                        }
                        break;
                    }
                    case 'IFRAME': {
                        const valueString = node.data<string>(Resource.KEY_NAME, 'valueString');
                        if (valueString) {
                            Resource.addString(replaceCharacterData(resource.preFormatString(valueString)), `${node.controlId.toLowerCase()}_iframe_src`);
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
                                    valueString = Resource.STRING_SPACE.repeat(Math.max(Math.floor(textIndent / metrics.width), 1)) + valueString;
                                }
                            }
                            let fontVariation = getFontVariationStyle(node.css('fontStyle')),
                                fontFeature = '';
                            if (node.has('fontStretch')) {
                                let percent = node.valueAt('fontStretch');
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
                                if (percent.endsWith('%')) {
                                    fontVariation = delimitString({ value: fontVariation }, `'wdth' ${parseFloat(percent)}`);
                                }
                            }
                            if (node.has('fontVariantCaps')) {
                                for (const variant of node.valueAt('fontVariantCaps').split(' ')) {
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
                                for (const variant of node.valueAt('fontVariantNumeric').split(' ')) {
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
                                for (const variant of node.valueAt('fontVariantLigatures').split(' ')) {
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
                                for (const variant of node.valueAt('fontVariantEastAsian').split(' ')) {
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
                                for (const variant of node.valueAt('fontVariationSettings').replace(/"/g, "'").split(',')) {
                                    fontVariation = delimitString({ value: fontVariation }, variant.trim());
                                }
                            }
                            if (node.has('fontFeatureSettings')) {
                                for (const feature of node.valueAt('fontFeatureSettings').replace(/"/g, "'").split(',')) {
                                    fontFeature = delimitString({ value: fontFeature }, feature.trim());
                                }
                            }
                            if (fontVariation) {
                                node.android('fontVariationSettings', fontVariation);
                            }
                            if (fontFeature) {
                                node.android('fontFeatureSettings', fontFeature);
                            }
                            setTextValue(
                                node,
                                'text',
                                Resource.addString(valueString, '', numberAsResource)
                            );
                        }
                    }
                }
            }
        });
    }

    public createOptionArray(element: HTMLSelectElement, controlId: string) {
        const [stringArray, numberArray] = Resource.getOptionArray(element);
        const numberAsResource = this.options.numberAsResource;
        let result: Undef<string[]>;
        if (!numberAsResource && numberArray) {
            result = numberArray;
        }
        else {
            const resourceArray = stringArray || numberArray;
            if (resourceArray) {
                const resource = this.resource!;
                result = [];
                for (let i = 0, length = resourceArray.length; i < length; ++i) {
                    const value = Resource.addString(replaceCharacterData(sanitizeString(resource.preFormatString(resourceArray[i]))), '', numberAsResource);
                    if (value) {
                        result.push(value);
                    }
                }
            }
        }
        return result && result.length ? Resource.insertStoredAsset('arrays', `${controlId.toLowerCase()}_array`, result) : '';
    }
}