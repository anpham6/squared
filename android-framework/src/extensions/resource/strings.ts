import { ResourceStringsOptions } from '../../@types/extension';

import Resource from '../../resource';

const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;
const $util = squared.lib.util;

function replaceCharacter(value: string) {
    return value
        .replace(/&nbsp;/g, '&#160;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, "\\'")
        .replace(/"/g, '&quot;');
}

function replaceEntity(value: string) {
    return value
        .replace(/&#(\d+);/g, (match, capture) => String.fromCharCode(parseInt(capture)))
        .replace(/\u00A0/g, '&#160;')
        .replace(/\u2002/g, '&#8194;')
        .replace(/\u2003/g, '&#8195;')
        .replace(/\u2009/g, '&#8201;')
        .replace(/\u200C/g, '&#8204;')
        .replace(/\u200D/g, '&#8205;')
        .replace(/\u200E/g, '&#8206;')
        .replace(/\u200F/g, '&#8207;');
}

export default class ResourceStrings<T extends android.base.View> extends squared.base.Extension<T> {
    public readonly options: ResourceStringsOptions = {
        numberResourceValue: false,
        replaceCharacterEntities: false
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
                                        value = replaceEntity(value);
                                    }
                                    value = Resource.addString(replaceCharacter(value), '', this.options.numberResourceValue);
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
                        const value = replaceCharacter(stored.value);
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
                            value = replaceCharacter(value);
                            if (node.htmlElement) {
                                if (node.css('fontVariant') === 'small-caps') {
                                    value = value.toUpperCase();
                                }
                            }
                            const actualParent = node.actualParent;
                            if (actualParent) {
                                let textIndent = 0;
                                if (actualParent.blockDimension || node.blockDimension) {
                                    textIndent = node.toInt('textIndent') || actualParent.toInt('textIndent');
                                }
                                if (textIndent !== 0 && (node.blockDimension || actualParent.firstChild === node)) {
                                    if (textIndent > 0) {
                                        value = '&#160;'.repeat(Math.floor(textIndent / (node.fontSize / 3))) + value;
                                    }
                                    else if (node.toInt('textIndent') + node.bounds.width < 0) {
                                        value = '';
                                    }
                                }
                            }
                            if (this.options.replaceCharacterEntities) {
                                value = replaceEntity(value);
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