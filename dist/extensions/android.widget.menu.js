/* android.widget.menu 1.3.6
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.menu = (function () {
    'use strict';

    const { isNumber } = squared.lib.util;
    const { NODE_ALIGNMENT, NODE_PROCEDURE, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;
    const $lib = android.lib;
    const { EXT_ANDROID } = $lib.constant;
    const { CONTAINER_NODE } = $lib.enumeration;
    const { createViewAttribute } = $lib.util;
    const { Resource } = android.base;
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
    function parseDataSet(validator, element, options) {
        const dataset = element.dataset;
        for (const attr in dataset) {
            if (validator[attr]) {
                const value = dataset[attr];
                if (value) {
                    const match = validator[attr].exec(value);
                    if (match) {
                        options[NAMESPACE_APP.includes(attr) ? 'app' : 'android'][attr] = Array.from(new Set(match)).join('|');
                    }
                }
            }
        }
    }
    function getTitle(node, element) {
        var _a;
        const title = element.title;
        if (title) {
            return title;
        }
        else {
            for (const child of node.naturalChildren) {
                if ((_a = child) === null || _a === void 0 ? void 0 : _a.textElement) {
                    return child.textContent.trim();
                }
            }
        }
        return '';
    }
    const hasInputType = (node, value) => node.some(item => item.toElementString('type') === value);
    class Menu extends squared.base.ExtensionUI {
        constructor(name, framework, options, tagNames) {
            super(name, framework, options, tagNames);
            this.cascadeAll = true;
            this.require(EXT_ANDROID.EXTERNAL, true);
        }
        init(element) {
            if (this.included(element)) {
                const children = element.children;
                const length = children.length;
                if (length > 0) {
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
        condition(node) {
            return this.included(node.element);
        }
        processNode(node, parent) {
            const outerParent = this.application.createNode(undefined, false);
            outerParent.actualParent = parent.actualParent;
            node.documentRoot = true;
            node.addAlign(4 /* AUTO_LAYOUT */);
            node.setControlType(NAVIGATION.MENU, CONTAINER_NODE.INLINE);
            node.exclude(NODE_RESOURCE.ALL, NODE_PROCEDURE.ALL);
            for (const item of node.cascade()) {
                this.addDescendant(item);
            }
            node.render(outerParent);
            node.dataset.pathname = 'res/menu';
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName: NAVIGATION.MENU
                },
                outerParent,
                complete: true
            };
        }
        processChild(node, parent) {
            if (node.plainText) {
                node.hide();
                return { next: true };
            }
            const options = createViewAttribute();
            const android = options.android;
            const element = node.element;
            let controlName;
            let title;
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
                    if (node.every((item) => hasInputType(item, 'radio'))) {
                        android.checkableBehavior = 'single';
                    }
                    else if (node.every((item) => hasInputType(item, 'checkbox'))) {
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
                    node.addAlign(4 /* AUTO_LAYOUT */);
                    break;
                case NAVIGATION.GROUP:
                    node.addAlign(4 /* AUTO_LAYOUT */);
                    parseDataSet(REGEXP_GROUP, element, options);
                    break;
                case NAVIGATION.ITEM:
                    parseDataSet(REGEXP_ITEM, element, options);
                    if (!android.icon) {
                        const resource = this.resource;
                        let src = resource.addImageSrc(node.backgroundImage, PREFIX_MENU);
                        if (src !== '') {
                            android.icon = '@drawable/' + src;
                        }
                        else {
                            const image = node.find(item => item.imageElement);
                            if (image) {
                                src = resource.addImageSrc(image.element, PREFIX_MENU);
                                if (src !== '') {
                                    android.icon = '@drawable/' + src;
                                }
                            }
                        }
                    }
                    node.each((item) => item.tagName !== 'NAV' && item.hide());
                    break;
            }
            if (title !== '') {
                const numberResourceValue = this.application.extensionManager.optionValueAsBoolean(EXT_ANDROID.RESOURCE_STRINGS, 'numberResourceValue');
                const name = Resource.addString(title, '', numberResourceValue);
                android.title = numberResourceValue || !isNumber(name) ? '@string/' + name : title;
            }
            node.setControlType(controlName, CONTAINER_NODE.INLINE);
            node.exclude(NODE_RESOURCE.ALL, NODE_PROCEDURE.ALL);
            node.render(parent);
            node.apply(options);
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName
                },
                complete: true,
                next: controlName === NAVIGATION.MENU
            };
        }
    }

    const menu = new Menu("android.widget.menu" /* MENU */, 2 /* ANDROID */, ['NAV']);
    if (squared) {
        squared.includeAsync(menu);
    }

    return menu;

}());
