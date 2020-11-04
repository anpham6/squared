import CREATE_NODE = squared.base.lib.internal.CREATE_NODE;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;
import EXT_ANDROID = android.base.EXT_ANDROID;

type View = android.base.View;

const { NODE_PROCEDURE, NODE_RESOURCE } = squared.base.lib.constant;
const { CONTAINER_NODE } = android.lib.constant;

const { capitalize, sameArray } = squared.lib.util;
const { createViewAttribute } = android.lib.util;

const { appendSeparator } = squared.base.lib.util;

const Resource = android.base.Resource;

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

const NAVIGATION = {
    MENU: 'menu',
    ITEM: 'item',
    GROUP: 'group'
};

const NAMESPACE_APP = [
    'showAsAction',
    'actionViewClass',
    'actionProviderClass'
];

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
                    (options[name] ||= {})[attr] = Array.from(new Set(match)).join('|');
                }
            }
        }
    }
}

function getTitle(node: View, element: HTMLElement) {
    const title = element.title.trim();
    if (title) {
        return title;
    }
    for (const child of node.naturalChildren as View[]) {
        if (child.textElement && !child.textEmpty) {
            return child.textContent.trim();
        }
    }
    return '';
}

const hasInputType = (node: View, value: string) => !!node.find(item => item.toElementString('type') === value);

export default class Menu<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly cascadeAll = true;

    constructor(name: string, framework: number, options?: ExtensionUIOptions) {
        super(name, framework, options);
        this.require({ name: EXT_ANDROID.EXTERNAL, leading: true });
    }

    public beforeInsertNode(element: HTMLElement, sessionId: string) {
        if (this.included(element)) {
            if (element.childElementCount) {
                if (!sameArray(element.children, (item: Element) => item.tagName)) {
                    return false;
                }
                const rootElements = this.application.getProcessing(sessionId)!.rootElements;
                let current = element.parentElement;
                while (current) {
                    if (current.tagName === 'NAV' && rootElements.has(current)) {
                        return false;
                    }
                    current = current.parentElement;
                }
                rootElements.add(element);
                return true;
            }
        }
        return false;
    }

    public condition(node: T) {
        return this.included(node.element as HTMLElement);
    }

    public processNode(node: T, parent: T) {
        const outerParent = this.application.createNode(node.sessionId, { parent, flags: CREATE_NODE.DEFER });
        outerParent.childIndex = node.childIndex;
        outerParent.actualParent = parent.actualParent;
        node.documentRoot = true;
        node.setControlType(NAVIGATION.MENU, CONTAINER_NODE.INLINE);
        node.addAlign(NODE_ALIGNMENT.AUTO_LAYOUT);
        node.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE.ALL });
        node.render(outerParent);
        node.cascade((item: T) => this.addDescendant(item));
        node.dataset['pathname' + capitalize(this.application.systemName)] = appendSeparator(this.controller.userSettings.outputDirectory, 'res/menu');
        return {
            outerParent,
            output: {
                type: NODE_TEMPLATE.XML,
                node,
                controlName: NAVIGATION.MENU
            } as NodeXmlTemplate<T>,
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
        const element = node.element as HTMLElement;
        let controlName: string,
            title: string;
        if (node.tagName === 'NAV') {
            controlName = NAVIGATION.MENU;
            title = getTitle(node, element);
        }
        else if (node.find(item => !item.isEmpty())) {
            if (node.find(item => item.tagName === 'NAV')) {
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
                parseDataSet(REGEXP_GROUP, element, options);
                break;
            case NAVIGATION.ITEM:
                parseDataSet(REGEXP_ITEM, element, options);
                if (!android.icon) {
                    const resource = this.resource as android.base.Resource<T>;
                    let src = resource.addImageSrc(node.backgroundImage, PREFIX_MENU);
                    if (src) {
                        android.icon = `@drawable/${src}`;
                    }
                    else {
                        const image = node.find(item => item.imageElement);
                        if (image) {
                            src = resource.addImageSrc(image.element as HTMLImageElement, PREFIX_MENU);
                            if (src) {
                                android.icon = `@drawable/${src}`;
                            }
                        }
                    }
                }
                node.each((item: T) => item.tagName !== 'NAV' && item.hide());
                break;
        }
        if (title) {
            android.title = Resource.addString(title, '', this.application.extensionManager.valueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberAsResource'));
        }
        node.setControlType(controlName, CONTAINER_NODE.INLINE);
        node.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE.ALL });
        node.render(parent);
        node.apply(options);
        return {
            output: {
                type: NODE_TEMPLATE.XML,
                node,
                controlName
            } as NodeXmlTemplate<T>,
            complete: true,
            next: controlName === NAVIGATION.MENU
        };
    }
}