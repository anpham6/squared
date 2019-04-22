import { ResourceStringsOptions } from '../../@types/extension';

import Resource from '../../resource';

const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $regex = squared.lib.regex;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

export default class ResourceStrings<T extends android.base.View> extends squared.base.Extension<T> {
    public readonly options: ResourceStringsOptions = {
        numberResourceValue: false,
        replaceCharacterEntities: true,
        fontVariantSmallCapsReduction: 0.8
    };

    public readonly eventOnly = true;

    public afterResources() {
        for (const node of this.application.processing.cache) {
            if (node.hasResource($enum.NODE_RESOURCE.VALUE_STRING)) {
                switch (node.tagName) {
                    case 'SELECT': {
                        const element = <HTMLSelectElement> node.element;
                        const [stringArray, numberArray] = Resource.getOptionArray(element, this.options.replaceCharacterEntities);
                        let result: string[] | undefined;
                        if (!this.options.numberResourceValue && numberArray && numberArray.length) {
                            result = numberArray;
                        }
                        else {
                            const resourceArray = stringArray || numberArray;
                            if (resourceArray) {
                                result = [];
                                for (let value of resourceArray) {
                                    if (this.options.replaceCharacterEntities) {
                                        value = $xml.replaceEntity(value);
                                    }
                                    value = Resource.addString($xml.replaceCharacter(value), '', this.options.numberResourceValue);
                                    if (value !== '') {
                                        result.push(`@string/${value}`);
                                    }
                                }
                            }
                        }
                        if (result && result.length) {
                            const arrayName = Resource.insertStoredAsset('arrays', `${node.controlId}_array`, result);
                            if (arrayName !== '') {
                                node.android('entries', `@array/${arrayName}`);
                            }
                        }
                        break;
                    }
                    case 'IFRAME': {
                        const stored: NameValue = node.data(Resource.KEY_NAME, 'valueString');
                        const value = $xml.replaceCharacter(stored.value);
                        Resource.addString(value, stored.name);
                        break;
                    }
                    default: {
                        const stored: NameValue = node.data(Resource.KEY_NAME, 'valueString');
                        if (stored) {
                            const renderParent = node.renderParent as T;
                            let value = stored.value;
                            if (renderParent && renderParent.layoutRelative) {
                                if (node.alignParent('left') && !$css.isParentStyle(node.element, 'whiteSpace', 'pre', 'pre-wrap')) {
                                    const textContent = node.textContent;
                                    let leadingSpace = 0;
                                    for (let i = 0; i < textContent.length; i++) {
                                        switch (textContent.charCodeAt(i)) {
                                            case 160:
                                                leadingSpace++;
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
                            }
                            if (node.css('fontVariant') === 'small-caps') {
                                const words = value.split($regex.XML.BREAKWORD);
                                for (const word of words) {
                                    if (!$regex.XML.ENTITY.test(word)) {
                                        value = value.replace(word, word.toUpperCase());
                                    }
                                }
                                const fontStyle: FontAttribute = node.data(Resource.KEY_NAME, 'fontStyle');
                                if (fontStyle) {
                                    fontStyle.fontSize = `${parseFloat(fontStyle.fontSize) * this.options.fontVariantSmallCapsReduction}px`;
                                }
                            }
                            if (this.options.replaceCharacterEntities) {
                                value = $xml.replaceEntity(value);
                            }
                            value = $xml.replaceCharacter(value);
                            let textIndent = 0;
                            if (node.blockDimension) {
                                textIndent = node.toFloat('textIndent');
                                if (textIndent + node.bounds.width < 0) {
                                    value = '';
                                }
                            }
                            if (textIndent === 0) {
                                const actualParent = node.actualParent;
                                if (actualParent && actualParent.blockDimension && node === actualParent.firstChild) {
                                    textIndent = actualParent.toFloat('textIndent');
                                }
                            }
                            if (textIndent > 0) {
                                const metrics = $dom.getTextMetrics(' ', node.css('fontFamily'), node.fontSize);
                                const width = metrics && metrics.width || node.fontSize / 2;
                                value = '&#160;'.repeat(Math.max(Math.floor(textIndent / width), 1)) + value;
                            }
                            const name = Resource.addString(value, stored.name, this.options.numberResourceValue);
                            if (name !== '') {
                                node.android('text', this.options.numberResourceValue || !$util.isNumber(name) ? `@string/${name}` : name, false);
                            }
                        }
                    }
                }
            }
        }
    }
}