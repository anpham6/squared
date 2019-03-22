import { ExtensionResult, NodeXmlTemplate } from '../../src/base/@types/application';
import { ViewAttribute } from '../../android-framework/src/@types/node';

import $Resource = android.base.Resource;

type View = android.base.View;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $css = squared.lib.css;
const $dom = squared.lib.dom;
const $util = squared.lib.util;
const $element = squared.lib.element;
const $constA = android.lib.constant;
const $enumA = android.lib.enumeration;
const $utilA = android.lib.util;

const REGEXP_ITEM = {
    id: /^@\+id\/\w+$/,
    title: /^.+$/,
    titleCondensed: /^.+$/,
    icon: /^@drawable\/.+$/,
    onClick: /^.+$/,
    showAsAction: /^(ifRoom|never|withText|always|collapseActionView)$/,
    actionLayout: /^@layout\/.+$/,
    actionViewClass: /^.+$/,
    actionProviderClass: /^.+$/,
    alphabeticShortcut: /^[a-zA-Z]+$/,
    alphabeticModifiers: /(META|CTRL|ALT|SHIFT|SYM|FUNCTION)+/g,
    numericShortcut: /^[0-9]+$/,
    numericModifiers: /(META|CTRL|ALT|SHIFT|SYM|FUNCTION)+/g,
    checkable: /^(true|false)$/,
    visible: /^(true|false)$/,
    enabled: /^(true|false)$/,
    menuCategory: /^(container|system|secondary|alternative)$/,
    orderInCategory: /^[0-9]+$/
};
const REGEXP_GROUP = {
    id: /^@\+id\/\w+$/,
    checkableBehavior: /^(none|all|single)$/,
    visible: /^(true|false)$/,
    enabled: /^(true|false)$/,
    menuCategory: /^(container|system|secondary|alternative)$/,
    orderInCategory: /^[0-9]+$/
};

const NAMESPACE_APP = ['showAsAction', 'actionViewClass', 'actionProviderClass'];
const NAVIGATION = {
    MENU: 'menu',
    ITEM: 'item',
    GROUP: 'group'
};

function hasInputType(node: View, value: string) {
    return node.some(item => (<HTMLInputElement> item.element).type === value);
}

function parseDataSet(validator: ObjectMap<RegExp>, element: HTMLElement, options: ViewAttribute) {
    for (const attr in element.dataset) {
        const value = element.dataset[attr];
        if (value && validator[attr]) {
            const match = value.match(validator[attr]);
            if (match) {
                options[NAMESPACE_APP.includes(attr) ? 'app' : 'android'][attr] = Array.from(new Set(match)).join('|');
            }
        }
    }
}

function getTitle<T extends View>(node: T, element: HTMLElement) {
    if (element.title !== '') {
        return element.title;
    }
    else {
        for (const child of node.actualChildren) {
            if (child && child.textElement) {
                return child.textContent.trim();
            }
        }
    }
    return '';
}

export default class Menu<T extends View> extends squared.base.Extension<T> {
    constructor(
        name: string,
        framework: number,
        tagNames?: string[],
        options?: ExternalData)
    {
        super(name, framework, tagNames, options);
        this.require($const.EXT_NAME.EXTERNAL, true);
    }

    public init(element: HTMLElement) {
        if (this.included(element)) {
            let valid = false;
            if (element.children.length) {
                valid = true;
                const tagName = element.children[0].tagName;
                for (let i = 1; i < element.children.length; i++) {
                    if (element.children[i].tagName !== tagName) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    let current = element.parentElement;
                    while (current) {
                        if (current.tagName === 'NAV' && this.application.parseElements.has(current)) {
                            valid = false;
                            break;
                        }
                        current = current.parentElement;
                    }
                }
            }
            if (valid) {
                element.querySelectorAll('NAV').forEach((item: HTMLElement) => {
                    if ($css.getStyle(element).display === 'none') {
                        $dom.setElementCache(item, 'squaredExternalDisplay', 'none');
                        item.style.display = 'block';
                    }
                });
                this.application.parseElements.add(<HTMLElement> element);
            }
        }
        return false;
    }

    public condition(node: T) {
        return this.included(<HTMLElement> node.element);
    }

    public processNode(node: T) {
        const parentAs = this.application.createNode($element.createElement(null));
        node.documentRoot = true;
        node.alignmentType |= $enum.NODE_ALIGNMENT.AUTO_LAYOUT;
        node.setControlType(NAVIGATION.MENU, $enumA.CONTAINER_NODE.INLINE);
        node.exclude({
            procedure: $enum.NODE_PROCEDURE.ALL,
            resource: $enum.NODE_RESOURCE.ALL
        });
        for (const item of node.cascade()) {
            this.addDescendant(item as T);
        }
        node.render(parentAs);
        node.dataset.pathname = 'res/menu';
        return {
            output: <NodeXmlTemplate<T>> {
                type: $enum.NODE_TEMPLATE.XML,
                node,
                controlName: NAVIGATION.MENU
            },
            parentAs,
            complete: true
        };
    }

    public processChild(node: T, parent: T): ExtensionResult<T> {
        if (node.plainText) {
            node.hide();
            return { next: true };
        }
        const options = $utilA.createViewAttribute();
        const element = <HTMLElement> node.element;
        let controlName: string;
        let title = '';
        if (node.tagName === 'NAV') {
            controlName = NAVIGATION.MENU;
            title = getTitle(node, element);
        }
        else if (node.some(item => item.length > 0)) {
            if (node.some(item => item.tagName === 'NAV')) {
                controlName = NAVIGATION.ITEM;
            }
            else {
                controlName = NAVIGATION.GROUP;
                if (node.every((item: T) => hasInputType(item, 'radio'))) {
                    options.android.checkableBehavior = 'single';
                }
                else if (node.every((item: T) => hasInputType(item, 'checkbox'))) {
                    options.android.checkableBehavior = 'all';
                }
            }
            title = getTitle(node, element);
        }
        else {
            controlName = NAVIGATION.ITEM;
            title = (element.title || element.innerText).trim();
            if (hasInputType(node, 'checkbox') && !parent.android('checkableBehavior')) {
                options.android.checkable = 'true';
            }
        }
        switch (controlName) {
            case NAVIGATION.MENU:
                node.alignmentType |= $enum.NODE_ALIGNMENT.AUTO_LAYOUT;
                break;
            case NAVIGATION.GROUP:
                node.alignmentType |= $enum.NODE_ALIGNMENT.AUTO_LAYOUT;
                parseDataSet(REGEXP_GROUP, element, options);
                break;
            case NAVIGATION.ITEM:
                parseDataSet(REGEXP_ITEM, element, options);
                if (!options.android.icon) {
                    const style = $css.getStyle(element);
                    let src = $Resource.addImageUrl((style.backgroundImage !== 'none' ? style.backgroundImage : style.background) as string, $constA.PREFIX_ANDROID.MENU);
                    if (src !== '') {
                        options.android.icon = `@drawable/${src}`;
                    }
                    else {
                        const image = node.find(item => item.imageElement);
                        if (image) {
                            src = $Resource.addImageSrc(<HTMLImageElement> image.element, $constA.PREFIX_ANDROID.MENU);
                            if (src !== '') {
                                options.android.icon = `@drawable/${src}`;
                            }
                        }
                    }
                }
                node.each(item => item.tagName !== 'NAV' && item.hide());
                break;
        }
        if (title !== '') {
            const numberResourceValue = this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue');
            const name = $Resource.addString(title, '', numberResourceValue);
            options.android.title = numberResourceValue || !$util.isNumber(name) ? `@string/${name}` : title;
        }
        node.setControlType(controlName, $enumA.CONTAINER_NODE.INLINE);
        node.exclude({
            procedure: $enum.NODE_PROCEDURE.ALL,
            resource: $enum.NODE_RESOURCE.ALL
        });
        node.render(parent);
        node.apply(options);
        return {
            output: <NodeXmlTemplate<T>> {
                type: $enum.NODE_TEMPLATE.XML,
                node,
                controlName
            },
            complete: true,
            next: controlName === NAVIGATION.MENU
        };
    }

    public postBaseLayout(node: T) {
        (<HTMLElement> node.element).querySelectorAll('NAV').forEach((item: HTMLElement) => {
            const display = $dom.getElementCache(item, 'squaredExternalDisplay');
            if (display) {
                item.style.display = display;
                $dom.deleteElementCache(item, 'squaredExternalDisplay');
            }
        });
    }
}