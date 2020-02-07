import { ExtensionResult, NodeXmlTemplate } from '../../@types/base/application';
import { ViewAttribute } from '../../@types/android/node';

type View = android.base.View;

const { isNumber } = squared.lib.util;

const $lib = android.lib;

const { NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const { EXT_ANDROID } = $lib.constant;
const { CONTAINER_NODE } = $lib.enumeration;
const { createViewAttribute } = $lib.util;

const Resource = android.base.Resource;

const REGEX_ITEM = {
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
    numericShortcut: /^\d+$/,
    numericModifiers: /(META|CTRL|ALT|SHIFT|SYM|FUNCTION)+/g,
    checkable: /^(true|false)$/,
    visible: /^(true|false)$/,
    enabled: /^(true|false)$/,
    menuCategory: /^(container|system|secondary|alternative)$/,
    orderInCategory: /^\d+$/
};
const REGEX_GROUP = {
    id: /^@\+id\/\w+$/,
    checkableBehavior: /^(none|all|single)$/,
    visible: /^(true|false)$/,
    enabled: /^(true|false)$/,
    menuCategory: /^(container|system|secondary|alternative)$/,
    orderInCategory: /^\d+$/
};
const NAMESPACE_APP = ['showAsAction', 'actionViewClass', 'actionProviderClass'];
const NAVIGATION = {
    MENU: 'menu',
    ITEM: 'item',
    GROUP: 'group'
};
const PREFIX_MENU = 'ic_menu_';

function parseDataSet(validator: ObjectMap<RegExp>, element: HTMLElement, options: ViewAttribute) {
    const dataset = element.dataset;
    for (const attr in dataset) {
        const pattern = validator[attr];
        if (pattern) {
            const value = dataset[attr];
            if (value) {
                const match = pattern.exec(value);
                if (match) {
                    const name = NAMESPACE_APP.includes(attr) ? 'app' : 'android';
                    let data = options[name];
                    if (data === undefined) {
                        data = {};
                        options[name] = data;
                    }
                    data[attr] = Array.from(new Set(match)).join('|');
                }
            }
        }
    }
}

function getTitle(node: View, element: HTMLElement) {
    const title = element.title;
    if (title) {
        return title;
    }
    else {
        for (const child of node.naturalChildren) {
            if (child?.textElement) {
                return child.textContent.trim();
            }
        }
    }
    return '';
}

const hasInputType = (node: View, value: string) => node.some(item => item.toElementString('type') === value);

export default class Menu<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly cascadeAll = true;

    constructor(
        name: string,
        framework: number,
        options?: ExternalData,
        tagNames?: string[])
    {
        super(name, framework, options, tagNames);
        this.require(EXT_ANDROID.EXTERNAL, true);
    }

    public init(element: HTMLElement) {
        if (this.included(element)) {
            const children = element.children;
            const length = children.length;
            if (length) {
                const tagName = children[0].tagName;
                for (let i = 1; i < length; i++) {
                    if (children[i].tagName !== tagName) {
                        return false;
                    }
                }
                const application = this.application;
                let current = element.parentElement;
                while (current) {
                    if (current.tagName === 'NAV' && application.rootElements.has(current)) {
                        return false;
                    }
                    current = current.parentElement;
                }
                application.rootElements.add(element);
            }
        }
        return false;
    }

    public condition(node: T) {
        return this.included(<HTMLElement> node.element);
    }

    public processNode(node: T, parent: T) {
        const outerParent = this.application.createNode({ parent, append: false });
        outerParent.childIndex = node.childIndex;
        outerParent.actualParent = parent.actualParent;
        node.documentRoot = true;
        node.setControlType(NAVIGATION.MENU, CONTAINER_NODE.INLINE);
        node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
        node.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE.ALL });
        node.render(outerParent);
        for (const item of node.cascade()) {
            this.addDescendant(item as T);
        }
        node.dataset.pathname = 'res/menu';
        return {
            output: <NodeXmlTemplate<T>> {
                type: NODE_TEMPLATE.XML,
                node,
                controlName: NAVIGATION.MENU
            },
            outerParent,
            complete: true
        };
    }

    public processChild(node: T, parent: T): ExtensionResult<T> {
        if (node.plainText) {
            node.hide();
            return { next: true };
        }
        const options = createViewAttribute();
        const android = options.android;
        const element = <HTMLElement> node.element;
        let controlName: string;
        let title: string;
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
                    android.checkableBehavior = 'single';
                }
                else if (node.every((item: T) => hasInputType(item, 'checkbox'))) {
                    android.checkableBehavior = 'all';
                }
            }
            title = getTitle(node, element);
        }
        else {
            controlName = NAVIGATION.ITEM;
            title = (element.title || element.innerText).trim();
            if (hasInputType(node, 'checkbox') && !parent.android('checkableBehavior')) {
                android.checkable = 'true';
            }
        }
        switch (controlName) {
            case NAVIGATION.MENU:
                node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
                break;
            case NAVIGATION.GROUP:
                node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
                parseDataSet(REGEX_GROUP, element, options);
                break;
            case NAVIGATION.ITEM:
                parseDataSet(REGEX_ITEM, element, options);
                if (!android.icon) {
                    const resource = <android.base.Resource<T>> this.resource;
                    let src = resource.addImageSrc(node.backgroundImage, PREFIX_MENU);
                    if (src !== '') {
                        android.icon = '@drawable/' + src;
                    }
                    else {
                        const image = node.find(item => item.imageElement);
                        if (image) {
                            src = resource.addImageSrc(<HTMLImageElement> image.element, PREFIX_MENU);
                            if (src !== '') {
                                android.icon = '@drawable/' + src;
                            }
                        }
                    }
                }
                node.each((item: T) => item.tagName !== 'NAV' && item.hide());
                break;
        }
        if (title !== '') {
            const numberResourceValue = this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue');
            const name = Resource.addString(title, '', numberResourceValue);
            android.title = numberResourceValue || !isNumber(name) ? '@string/' + name : title;
        }
        node.setControlType(controlName, CONTAINER_NODE.INLINE);
        node.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE.ALL });
        node.render(parent);
        node.apply(options);
        return {
            output: <NodeXmlTemplate<T>> {
                type: NODE_TEMPLATE.XML,
                node,
                controlName
            },
            complete: true,
            next: controlName === NAVIGATION.MENU
        };
    }
}