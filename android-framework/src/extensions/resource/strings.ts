import { ResourceStringsOptions } from '../../@types/extension';

import Resource from '../../resource';

const $enum = squared.base.lib.enumeration;
const $dom = squared.lib.dom;
const $xml = squared.lib.xml;

export default class ResourceStrings<T extends android.base.View> extends squared.base.Extension<T> {
    public readonly options: ResourceStringsOptions = {
        numberResourceValue: false
    };

    public readonly eventOnly = true;

    public afterResources() {
        for (const node of this.application.processing.cache) {
            if (!node.hasBit('excludeResource', $enum.NODE_RESOURCE.VALUE_STRING)) {
                const element = node.element;
                if (element && element.tagName === 'SELECT') {
                    const [stringArray, numberArray] = Resource.getOptionArray(<HTMLSelectElement> element, this.application.userSettings.replaceCharacterEntities);
                    let result: string[] | undefined;
                    if (!this.options.numberResourceValue && numberArray && numberArray.length) {
                        result = numberArray;
                    }
                    else {
                        const resourceArray = stringArray || numberArray;
                        if (resourceArray) {
                            result = [];
                            for (let value of resourceArray) {
                                value = Resource.addString($xml.replaceCharacter(value), '', this.options.numberResourceValue);
                                result.push(value !== '' ? `@string/${value}` : '');
                            }
                        }
                    }
                    if (result && result.length) {
                        const arrayValue = result.join('-');
                        let arrayName = '';
                        for (const [storedName, storedResult] of Resource.STORED.arrays.entries()) {
                            if (arrayValue === storedResult.join('-')) {
                                arrayName = storedName;
                                break;
                            }
                        }
                        if (arrayName === '') {
                            arrayName = `${node.controlId}_array`;
                            Resource.STORED.arrays.set(arrayName, result);
                        }
                        node.android('entries', `@array/${arrayName}`, false);
                    }
                }
                else {
                    const stored: NameValue = node.data(Resource.KEY_NAME, 'valueString');
                    if (stored) {
                        const renderParent = node.renderParent as T;
                        if (renderParent && renderParent.layoutRelative) {
                            if (node.alignParent('left') && !$dom.cssParent(node.element, 'whiteSpace', 'pre', 'pre-wrap')) {
                                const value = node.textContent;
                                let leadingSpace = 0;
                                for (let i = 0; i < value.length; i++) {
                                    switch (value.charCodeAt(i)) {
                                        case 160:
                                            leadingSpace++;
                                        case 32:
                                            continue;
                                        default:
                                            break;
                                    }
                                }
                                if (leadingSpace === 0) {
                                    stored.value = stored.value.replace(/^(\s|&#160;)+/, '');
                                }
                            }
                        }
                        stored.value = $xml.replaceCharacter(stored.value);
                        if (node.htmlElement) {
                            if (node.css('fontVariant') === 'small-caps') {
                                stored.value = stored.value.toUpperCase();
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
                                    stored.value = '&#160;'.repeat(Math.floor(textIndent / 7)) + stored.value;
                                }
                                else if (node.toInt('textIndent') + node.bounds.width < 0) {
                                    stored.value = '';
                                }
                            }
                        }
                        const name = Resource.addString(stored.value, stored.name, this.options.numberResourceValue);
                        if (name !== '') {
                            node.android('text', isNaN(parseInt(name)) || parseInt(name).toString() !== name ? `@string/${name}` : name, false);
                        }
                    }
                }
            }
        }
    }
}