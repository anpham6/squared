import type { ResourceStringsOptions } from '../../../../@types/android/extension';

import Resource from '../../resource';

import { CONTAINER_ANDROID } from '../../lib/constant';
import { BUILD_ANDROID } from '../../lib/enumeration';

type View = android.base.View;

const $lib = squared.lib;

const { formatPX } = $lib.css;
const { measureTextWidth } = $lib.dom;
const { capitalizeString, lowerCaseString, isNumber, isString } = $lib.util;
const { STRING_SPACE, replaceCharacterData } = $lib.xml;

const { NODE_RESOURCE } = squared.base.lib.enumeration;

export default class ResourceStrings<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ResourceStringsOptions = {
        numberResourceValue: false,
        fontVariantSmallCapsReduction: 0.7
    };
    public readonly eventOnly = true;

    public afterResources() {
        const numberResourceValue = this.options.numberResourceValue;
        const setTextValue = (node: T, attr: string, name: string, value: string) => {
            name = Resource.addString(value, name, numberResourceValue);
            if (name !== '') {
                node.android(attr, numberResourceValue || !isNumber(name) ? `@string/${name}` : name, false);
            }
        };
        for (const node of this.cacheProcessing) {
            if (node.hasResource(NODE_RESOURCE.VALUE_STRING)) {
                switch (node.tagName) {
                    case 'SELECT': {
                        const name = this.createOptionArray(<HTMLSelectElement> node.element, node.controlId);
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
                        if (!node.layoutFrame) {
                            const valueString: StringValue = node.data(Resource.KEY_NAME, 'valueString');
                            if (valueString) {
                                const name = valueString.key || valueString.value;
                                let value = valueString.value;
                                if (node.naturalChild && node.alignParent('left') && node.pageFlow && !(!node.plainText && node.preserveWhiteSpace || node.plainText && (node.actualParent as T).preserveWhiteSpace)) {
                                    let leadingSpace = 0;
                                    const textContent = node.textContent;
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
                                    if (node.api >= BUILD_ANDROID.LOLLIPOP) {
                                        node.android('fontFeatureSettings', 'smcp');
                                    }
                                    else {
                                        node.android('textAllCaps', 'true');
                                        const fontStyle: FontAttribute = node.data(Resource.KEY_NAME, 'fontStyle');
                                        if (fontStyle) {
                                            fontStyle.fontSize *= this.options.fontVariantSmallCapsReduction;
                                        }
                                    }
                                }
                                switch (node.css('textTransform')) {
                                    case 'uppercase':
                                        node.android('textAllCaps', 'true');
                                        break;
                                    case 'lowercase':
                                        value = lowerCaseString(value);
                                        break;
                                    case 'capitalize':
                                        value = capitalizeString(value);
                                        break;
                                }
                                const tagName = node.tagName;
                                value = replaceCharacterData(value, node.preserveWhiteSpace || tagName === 'CODE');
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
                                let indent = 0;
                                if (node.blockDimension || node.display === 'table-cell') {
                                    const textIndent = node.css('textIndent');
                                    indent = node.parseUnit(textIndent);
                                    if (textIndent === '100%' || indent + node.bounds.width < 0) {
                                        value = '';
                                        node.delete('android', 'ellipsize', 'maxLines');
                                    }
                                }
                                if (value !== '') {
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
                                    setTextValue(node, 'text', name, value);
                                }
                            }
                            if (node.inputElement) {
                                if (node.controlName === CONTAINER_ANDROID.EDIT_LIST) {
                                    const list = (<HTMLInputElement> node.element).list;
                                    if (list) {
                                        this.createOptionArray(<HTMLSelectElement> list, node.controlId);
                                        if (!node.hasPX('width')) {
                                            node.css('width', formatPX(node.actualWidth));
                                        }
                                    }
                                }
                                const hintString: string = node.data(Resource.KEY_NAME, 'hintString');
                                if (isString(hintString)) {
                                    setTextValue(node, 'hint', '', hintString);
                                }
                            }
                        }
                    }
                }
                if (node.styleElement) {
                    const title: string =  node.data(Resource.KEY_NAME, 'titleString') || node.toElementString('title');
                    if (title !== '') {
                        setTextValue(node, 'tooltipText', `${node.controlId.toLowerCase()}_title`, title);
                    }
                }
            }
        }
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