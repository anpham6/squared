import { ResourceStringsOptions } from '../../@types/extension';

import Resource from '../../resource';

import { CONTAINER_ANDROID } from '../../lib/constant';

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $util = squared.lib.util;
const $xml = squared.lib.xml;
const $e = squared.base.lib.enumeration;

export default class ResourceStrings<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceStringsOptions = {
        numberResourceValue: false,
        fontVariantSmallCapsReduction: 0.7
    };
    public readonly eventOnly = true;

    public afterResources() {
        for (const node of this.application.processing.cache) {
            if (node.hasResource($e.NODE_RESOURCE.VALUE_STRING)) {
                switch (node.tagName) {
                    case 'SELECT': {
                        const arrayName = this.createOptionArray(<HTMLSelectElement> node.element, node.controlId);
                        if (arrayName !== '') {
                            node.android('entries', `@array/${arrayName}`);
                        }
                        break;
                    }
                    case 'IFRAME': {
                        const stored: StringValue = node.data(Resource.KEY_NAME, 'valueString');
                        if (stored) {
                            Resource.addString($xml.replaceCharacterData(stored.value), stored.key);
                        }
                        break;
                    }
                    default: {
                        const valueString: StringValue = node.data(Resource.KEY_NAME, 'valueString');
                        const setTextValue = (attr: string, name: string, value: string) => {
                            name = Resource.addString(value, name, this.options.numberResourceValue);
                            if (name !== '') {
                                node.android(attr, this.options.numberResourceValue || !$util.isNumber(name) ? `@string/${name}` : name, false);
                            }
                        };
                        if (valueString) {
                            const name = valueString.key || valueString.value;
                            let value = valueString.value;
                            if (node.naturalElement) {
                                const renderParent = node.renderParent as T;
                                if (renderParent && renderParent.layoutRelative) {
                                    if (node.alignParent($const.CSS.LEFT) && !$css.isParentStyle(<Element> node.element, 'whiteSpace', 'pre', 'pre-wrap')) {
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
                            }
                            if (node.css('fontVariant') === 'small-caps') {
                                node.android('textAllCaps', 'true');
                                const fontStyle: FontAttribute = node.data(Resource.KEY_NAME, 'fontStyle');
                                if (fontStyle) {
                                    fontStyle.fontSize = `${parseFloat(fontStyle.fontSize) * this.options.fontVariantSmallCapsReduction}px`;
                                }
                            }
                            switch (node.css('textTransform')) {
                                case 'uppercase':
                                    node.android('textAllCaps', 'true');
                                    break;
                                case 'lowercase':
                                    value = $util.lowerCaseString(value);
                                    break;
                                case 'capitalize':
                                    value = $util.capitalizeString(value);
                                    break;
                            }
                            value = $xml.replaceCharacterData(value);
                            for (const style of node.css('textDecorationLine').split(' ')) {
                                switch (style) {
                                    case 'underline':
                                        value = `<u>${value}</u>`;
                                        break;
                                    case 'line-through':
                                        value = `<strike>${value}</strike>`;
                                        break;
                                }
                            }
                            let textIndent = 0;
                            if (node.blockDimension || node.display === 'table-cell') {
                                textIndent = node.parseUnit(node.css('textIndent'));
                                if (textIndent + node.bounds.width < 0) {
                                    value = '';
                                }
                            }
                            if (textIndent === 0) {
                                const actualParent = node.actualParent;
                                if (actualParent && (actualParent.blockDimension || actualParent.display === 'table-cell') && node === actualParent.firstChild) {
                                    textIndent = actualParent.parseUnit(actualParent.css('textIndent'));
                                }
                            }
                            if (textIndent > 0) {
                                const width = $dom.measureTextWidth(' ', node.css('fontFamily'), node.fontSize) || node.fontSize / 2;
                                value = '&#160;'.repeat(Math.max(Math.floor(textIndent / width), 1)) + value;
                            }
                            setTextValue('text', name, value);
                        }
                        if (node.inputElement) {
                            if (node.controlName === CONTAINER_ANDROID.EDIT_LIST) {
                                const element = <HTMLInputElement> node.element;
                                if (element.list) {
                                    this.createOptionArray(<HTMLSelectElement> element.list, node.controlId);
                                    if (!node.has('width')) {
                                        node.css('width', $css.formatPX(Math.max(node.bounds.width, node.width)), true);
                                    }
                                }
                            }
                            const hintString: string = node.data(Resource.KEY_NAME, 'hintString');
                            if (hintString) {
                                setTextValue('hint', `${node.tagName.toLowerCase()}_hint`, hintString);
                            }
                        }
                    }
                }
            }
        }
    }

    public createOptionArray(element: HTMLSelectElement, controlId: string) {
        const stringArray = Resource.getOptionArray(element);
        let result: string[] | undefined;
        if (!this.options.numberResourceValue && stringArray[1]) {
            result = stringArray[1];
        }
        else {
            const resourceArray = stringArray[0] || stringArray[1];
            if (resourceArray) {
                result = [];
                for (let value of resourceArray) {
                    value = Resource.addString($xml.replaceCharacterData(value), '', this.options.numberResourceValue);
                    if (value !== '') {
                        result.push(`@string/${value}`);
                    }
                }
            }
        }
        if (result && result.length) {
            return Resource.insertStoredAsset('arrays', `${controlId}_array`, result);
        }
        return '';
    }
}