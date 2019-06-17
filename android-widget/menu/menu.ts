import { ExtensionResult, NodeXmlTemplate } from '../../src/base/@types/application';
import { ViewAttribute } from '../../android-framework/src/@types/node';

type View = android.base.View;

const {
    constant: $const,
    css: $css,
    session: $session,
    util: $util
} = squared.lib;

const {
    constant: $constA,
    enumeration: $enumA,
    util: $utilA
} = android.lib;

const {
    constant: $c,
    enumeration: $e
} = squared.base.lib;

const $Resource = android.base.Resource;

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
    numericShortcut: /^\d+$/,
    numericModifiers: /(META|CTRL|ALT|SHIFT|SYM|FUNCTION)+/g,
    checkable: /^(true|false)$/,
    visible: /^(true|false)$/,
    enabled: /^(true|false)$/,
    menuCategory: /^(container|system|secondary|alternative)$/,
    orderInCategory: /^\d+$/
};
const REGEXP_GROUP = {
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
    for (const attr in element.dataset) {
        const value = element.dataset[attr];
        if (value && validator[attr]) {
            const match = validator[attr].exec(value);
            if (match) {
                options[NAMESPACE_APP.includes(attr) ? $constA.STRING_ANDROID.APP : $constA.STRING_ANDROID.ANDROID][attr] = Array.from(new Set(match)).join('|');
            }
        }
    }
}

function getTitle(node: View, element: HTMLElement) {
    if (element.title !== '') {
        return element.title;
    }
    else {
        for (const child of node.naturalChildren) {
            if (child && child.textElement) {
                return child.textContent.trim();
            }
        }
    }
    return '';
}

const hasInputType = (node: View, value: string) => node.some(item => (<HTMLInputElement> item.element).type === value);

export default class Menu<T extends View> extends squared.base.ExtensionUI<T> {
    constructor(
        name: string,
        framework: number,
        tagNames?: string[],
        options?: ExternalData)
    {
        super(name, framework, tagNames, options);
        this.require($c.EXT_NAME.EXTERNAL, true);
    }

    public init(element: HTMLElement) {
        if (this.included(element)) {
            const application = this.application;
            const children = element.children;
            const length = children.length;
            let valid = false;
            if (length) {
                valid = true;
                const tagName = children[0].tagName;
                for (let i = 1; i < length; i++) {
                    if (children[i].tagName !== tagName) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    let current = element.parentElement;
                    while (current) {
                        if (current.tagName === 'NAV' && application.rootElements.has(current)) {
                            valid = false;
                            break;
                        }
                        current = current.parentElement;
                    }
                }
            }
            if (valid) {
                element.querySelectorAll('NAV').forEach((item: HTMLElement) => {
                    if ($css.getStyle(item).display === $const.CSS.NONE) {
                        $session.setElementCache(item, 'squaredExternalDisplay', application.processing.sessionId, $const.CSS.NONE);
                        item.style.setProperty('display', 'block');
                    }
                });
                application.rootElements.add(<HTMLElement> element);
            }
        }
        return false;
    }

    public condition(node: T) {
        return this.included(<HTMLElement> node.element);
    }

    public processNode(node: T, parent: T) {
        const parentAs = this.application.createNode(undefined, false);
        parentAs.actualParent = parent.actualParent;
        node.documentRoot = true;
        node.addAlign($e.NODE_ALIGNMENT.AUTO_LAYOUT);
        node.setControlType(NAVIGATION.MENU, $enumA.CONTAINER_NODE.INLINE);
        node.exclude($e.NODE_RESOURCE.ALL, $e.NODE_PROCEDURE.ALL);
        for (const item of node.cascade()) {
            this.addDescendant(item as T);
        }
        node.render(parentAs);
        node.dataset.pathname = 'res/menu';
        return {
            output: <NodeXmlTemplate<T>> {
                type: $e.NODE_TEMPLATE.XML,
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
                node.addAlign($e.NODE_ALIGNMENT.AUTO_LAYOUT);
                break;
            case NAVIGATION.GROUP:
                node.addAlign($e.NODE_ALIGNMENT.AUTO_LAYOUT);
                parseDataSet(REGEXP_GROUP, element, options);
                break;
            case NAVIGATION.ITEM:
                parseDataSet(REGEXP_ITEM, element, options);
                if (!options.android.icon) {
                    const resource = <android.base.Resource<T>> this.application.resourceHandler;
                    let src = resource.addImageSrc(node.backgroundImage, PREFIX_MENU);
                    if (src !== '') {
                        options.android.icon = `@drawable/${src}`;
                    }
                    else {
                        const image = node.find(item => item.imageElement);
                        if (image) {
                            src = resource.addImageSrc(<HTMLImageElement> image.element, PREFIX_MENU);
                            if (src !== '') {
                                options.android.icon = `@drawable/${src}`;
                            }
                        }
                    }
                }
                node.each((item: T) => item.tagName !== 'NAV' && item.hide());
                break;
        }
        if (title !== '') {
            const numberResourceValue = this.application.extensionManager.optionValueAsBoolean($constA.EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue');
            const name = $Resource.addString(title, '', numberResourceValue);
            options.android.title = numberResourceValue || !$util.isNumber(name) ? `@string/${name}` : title;
        }
        node.setControlType(controlName, $enumA.CONTAINER_NODE.INLINE);
        node.exclude($e.NODE_RESOURCE.ALL, $e.NODE_PROCEDURE.ALL);
        node.render(parent);
        node.apply(options);
        return {
            output: <NodeXmlTemplate<T>> {
                type: $e.NODE_TEMPLATE.XML,
                node,
                controlName
            },
            complete: true,
            next: controlName === NAVIGATION.MENU
        };
    }

    public postBaseLayout(node: T) {
        (<HTMLElement> node.element).querySelectorAll('NAV').forEach((item: HTMLElement) => {
            const display: string = $session.getElementCache(item, 'squaredExternalDisplay', node.sessionId);
            if (display) {
                item.style.setProperty('display', display);
                $session.deleteElementCache(item, 'squaredExternalDisplay', node.sessionId);
            }
        });
    }
}