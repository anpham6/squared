import { ExtensionResult } from '../../src/base/@types/application';
import { ViewAttribute } from '../../android-framework/src/@types/node';

import $Resource = android.base.Resource;
import $View = android.base.View;

const $const = squared.base.lib.constant;
const $enum = squared.base.lib.enumeration;
const $dom = squared.lib.dom;
const $util = squared.lib.util;
const $constA = android.lib.constant;
const $enumA = android.lib.enumeration;
const $utilA = android.lib.util;

const VIEW_NAVIGATION = {
    MENU: 'menu',
    ITEM: 'item',
    GROUP: 'group'
};

const VALIDATE_ITEM = {
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

const VALIDATE_GROUP = {
    id: /^@\+id\/\w+$/,
    checkableBehavior: /^(none|all|single)$/,
    visible: /^(true|false)$/,
    enabled: /^(true|false)$/,
    menuCategory: /^(container|system|secondary|alternative)$/,
    orderInCategory: /^[0-9]+$/
};

const NAMESPACE_APP = ['showAsAction', 'actionViewClass', 'actionProviderClass'];

function hasInputType(node: $View, value: string) {
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

function getTitle(element: HTMLElement) {
    if (element.title !== '') {
        return element.title;
    }
    else {
        for (const node of $util.flatMap(Array.from(element.childNodes), (item: Element) => $dom.getElementAsNode(item) as $View)) {
            if (node.textElement) {
                return node.textContent.trim();
            }
        }
    }
    return '';
}

export default class Menu<T extends $View> extends squared.base.Extension<T> {
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
                const tagName = element.children[0].tagName;
                valid = Array.from(element.children).every(item => item.tagName === tagName);
                let current = element.parentElement;
                while (current) {
                    if (current.tagName === 'NAV' && this.application.parseElements.has(current)) {
                        valid = false;
                        break;
                    }
                    current = current.parentElement;
                }
            }
            if (valid) {
                Array.from(element.querySelectorAll('NAV')).forEach((item: HTMLElement) => {
                    if ($dom.getStyle(element).display === 'none') {
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

    public processNode(node: T): ExtensionResult<T> {
        node.documentRoot = true;
        node.alignmentType |= $enum.NODE_ALIGNMENT.AUTO_LAYOUT;
        node.setControlType(VIEW_NAVIGATION.MENU, $enumA.CONTAINER_NODE.INLINE);
        node.exclude({ procedure: $enum.NODE_PROCEDURE.ALL, resource: $enum.NODE_RESOURCE.ALL });
        const output = this.application.controllerHandler.renderNodeStatic(VIEW_NAVIGATION.MENU, 0, {}, '', '', node, true);
        node.cascade().forEach(item => this.subscribersChild.add(item as T));
        return { output, complete: true };
    }

    public processChild(node: T, parent: T): ExtensionResult<T> {
        if (node.plainText) {
            node.hide();
            return { output: '', next: true };
        }
        const options = $utilA.createAttribute();
        const element = <HTMLElement> node.element;
        let controlName: string;
        let title = '';
        let layout = false;
        if (node.tagName === 'NAV') {
            controlName = VIEW_NAVIGATION.MENU;
            title = getTitle(element);
            layout = true;
        }
        else if (node.some(item => item.length > 0)) {
            if (node.some(item => item.tagName === 'NAV')) {
                controlName = VIEW_NAVIGATION.ITEM;
                node.each(item => item.tagName !== 'NAV' && item.hide());
            }
            else {
                controlName = VIEW_NAVIGATION.GROUP;
                if (node.every((item: T) => hasInputType(item, 'radio'))) {
                    options.android.checkableBehavior = 'single';
                }
                else if (node.every((item: T) => hasInputType(item, 'checkbox'))) {
                    options.android.checkableBehavior = 'all';
                }
            }
            title = getTitle(element);
            layout = true;
        }
        else {
            controlName = VIEW_NAVIGATION.ITEM;
            title = (element.title || element.innerText).trim();
            if (hasInputType(node, 'checkbox') && !parent.android('checkableBehavior')) {
                options.android.checkable = 'true';
            }
        }
        switch (controlName) {
            case VIEW_NAVIGATION.MENU:
                node.alignmentType |= $enum.NODE_ALIGNMENT.AUTO_LAYOUT;
                break;
            case VIEW_NAVIGATION.GROUP:
                node.alignmentType |= $enum.NODE_ALIGNMENT.AUTO_LAYOUT;
                parseDataSet(VALIDATE_GROUP, element, options);
                break;
            case VIEW_NAVIGATION.ITEM:
                parseDataSet(VALIDATE_ITEM, element, options);
                if (!$util.hasValue(options.android.icon)) {
                    const style = $dom.getStyle(element);
                    let src = $Resource.addImageUrl((style.backgroundImage !== 'none' ? style.backgroundImage : style.background) as string, $constA.PREFIX_ANDROID.MENU);
                    if (src !== '') {
                        options.android.icon = `@drawable/${src}`;
                    }
                    else {
                        const image = node.find(item => item.imageElement);
                        if (image) {
                            src = $Resource.addImageSrcSet(<HTMLImageElement> image.element, $constA.PREFIX_ANDROID.MENU);
                            if (src !== '') {
                                options.android.icon = `@drawable/${src}`;
                            }
                        }
                    }
                }
                break;
        }
        if (title !== '') {
            const name = $Resource.addString(title, '', this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue'));
            options.android.title = name !== '' ? `@string/${name}` : title;
        }
        node.setControlType(controlName, $enumA.CONTAINER_NODE.INLINE);
        node.exclude({ procedure: $enum.NODE_PROCEDURE.ALL, resource: $enum.NODE_RESOURCE.ALL });
        node.render(parent);
        const output = this.application.controllerHandler.renderNodeStatic(controlName, node.renderDepth, options, '', '', node, layout);
        return { output, complete: true, next: controlName === VIEW_NAVIGATION.MENU };
    }

    public postBaseLayout(node: T) {
        const element = <HTMLElement> node.element;
        if (this.included(element)) {
            Array.from(element.querySelectorAll('NAV')).forEach((item: HTMLElement) => {
                const display = $dom.getElementCache(item, 'squaredExternalDisplay');
                if (display) {
                    item.style.display = display;
                    $dom.deleteElementCache(item, 'squaredExternalDisplay');
                }
            });
            const processing = this.application.processing;
            if (node === processing.node && processing.layout) {
                processing.layout.pathname = 'res/menu';
            }
        }
    }
}