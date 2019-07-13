import { ResourceStringsOptions } from '../../../../@types/android/extension';

import Resource from '../../resource';
import View from '../../view';

import { CONTAINER_ANDROID } from '../../lib/constant';
import { BUILD_ANDROID } from '../../lib/enumeration';

const {
    css: $css,
    dom: $dom,
    util: $util,
    xml: $xml
} = squared.lib;

const $e = squared.base.lib.enumeration;

export default class ResourceStrings<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceStringsOptions = {
        numberResourceValue: false,
        fontVariantSmallCapsReduction: 0.7
    };
    public readonly eventOnly = true;

    public afterResources() {
        const setTextValue = (node: T, attr: string, name: string, value: string) => {
            name = Resource.addString(value, name, this.options.numberResourceValue);
            if (name !== '') {
                node.android(attr, this.options.numberResourceValue || !$util.isNumber(name) ? `@string/${name}` : name, false);
            }
        };
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
                        if (valueString) {
                            const name = valueString.key || valueString.value;
                            let value = valueString.value;
                            if (node.naturalChild && node.alignParent('left') && !(!node.plainText && node.preserveWhiteSpace || node.plainText && (node.actualParent as T).preserveWhiteSpace)) {
                                const textContent = node.textContent;
                                let leadingSpace = 0;
                                const length = textContent.length;
                                for (let i = 0; i < length; i++) {
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
                            if (node.css('fontVariant') === 'small-caps') {
                                if (node.localSettings.targetAPI >= BUILD_ANDROID.LOLLIPOP) {
                                    node.android('fontFeatureSettings', 'smcp');
                                }
                                else {
                                    node.android('textAllCaps', 'true');
                                    const fontStyle: FontAttribute = node.data(Resource.KEY_NAME, 'fontStyle');
                                    if (fontStyle) {
                                        fontStyle.fontSize = `${parseFloat(fontStyle.fontSize) * this.options.fontVariantSmallCapsReduction}px`;
                                    }
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
                            const tagName = node.tagName;
                            value = $xml.replaceCharacterData(value, node.preserveWhiteSpace || tagName === 'CODE');
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
                            if (tagName === 'INS' && textDecorationLine.indexOf('line-through') === -1) {
                                value = `<strike>${value}</strike>`;
                            }
                            let textIndent = 0;
                            if (node.blockDimension || node.display === 'table-cell') {
                                textIndent = node.parseUnit(node.css('textIndent'));
                                if (textIndent + node.bounds.width < 0) {
                                    value = '';
                                }
                            }
                            if (textIndent === 0) {
                                const parent = node.actualParent;
                                if (parent && (parent.blockDimension || parent.display === 'table-cell') && node === parent.firstChild) {
                                    textIndent = parent.parseUnit(parent.css('textIndent'));
                                }
                            }
                            if (textIndent > 0) {
                                const width = $dom.measureTextWidth(' ', node.css('fontFamily'), node.fontSize) || node.fontSize / 2;
                                value = '&#160;'.repeat(Math.max(Math.floor(textIndent / width), 1)) + value;
                            }
                            setTextValue(node, 'text', name, value);
                        }
                        if (node.inputElement) {
                            if (node.controlName === CONTAINER_ANDROID.EDIT_LIST) {
                                const element = <HTMLInputElement> node.element;
                                if (element.list) {
                                    this.createOptionArray(<HTMLSelectElement> element.list, node.controlId);
                                    if (!node.hasPX('width')) {
                                        node.css('width', $css.formatPX(Math.max(node.bounds.width, node.width)), true);
                                    }
                                }
                            }
                            const hintString: string = node.data(Resource.KEY_NAME, 'hintString');
                            if (hintString) {
                                setTextValue(node, 'hint', `${node.controlId.toLowerCase()}_hint`, hintString);
                            }
                        }
                    }
                }
                if (node.styleElement) {
                    const title = (<HTMLElement> node.element).title;
                    if (title !== '') {
                        setTextValue(node, 'tooltipText', `${node.controlId.toLowerCase()}_title`, title);
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