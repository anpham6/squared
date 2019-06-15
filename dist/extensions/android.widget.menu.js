/* android.widget 1.1.1
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.menu = (function () {
    'use strict';

    const $Resource = android.base.Resource;
    const $const = squared.lib.constant;
    const $css = squared.lib.css;
    const $session = squared.lib.session;
    const $util = squared.lib.util;
    const $constA = android.lib.constant;
    const $enumA = android.lib.enumeration;
    const $utilA = android.lib.util;
    const $c = squared.base.lib.constant;
    const $e = squared.base.lib.enumeration;
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
    function getTitle(node, element) {
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
    const hasInputType = (node, value) => node.some(item => item.element.type === value);
    class Menu extends squared.base.ExtensionUI {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require($c.EXT_NAME.EXTERNAL, true);
        }
        init(element) {
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
                    element.querySelectorAll('NAV').forEach((item) => {
                        if ($css.getStyle(item).display === $const.CSS.NONE) {
                            $session.setElementCache(item, 'squaredExternalDisplay', application.processing.sessionId, $const.CSS.NONE);
                            item.style.setProperty('display', 'block');
                        }
                    });
                    application.rootElements.add(element);
                }
            }
            return false;
        }
        condition(node) {
            return this.included(node.element);
        }
        processNode(node, parent) {
            const parentAs = this.application.createNode(undefined, false);
            parentAs.actualParent = parent.actualParent;
            node.documentRoot = true;
            node.addAlign(4 /* AUTO_LAYOUT */);
            node.setControlType(NAVIGATION.MENU, $enumA.CONTAINER_NODE.INLINE);
            node.exclude($e.NODE_RESOURCE.ALL, $e.NODE_PROCEDURE.ALL);
            for (const item of node.cascade()) {
                this.addDescendant(item);
            }
            node.render(parentAs);
            node.dataset.pathname = 'res/menu';
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName: NAVIGATION.MENU
                },
                parentAs,
                complete: true
            };
        }
        processChild(node, parent) {
            if (node.plainText) {
                node.hide();
                return { next: true };
            }
            const options = $utilA.createViewAttribute();
            const element = node.element;
            let controlName;
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
                    if (node.every((item) => hasInputType(item, 'radio'))) {
                        options.android.checkableBehavior = 'single';
                    }
                    else if (node.every((item) => hasInputType(item, 'checkbox'))) {
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
                    node.addAlign(4 /* AUTO_LAYOUT */);
                    break;
                case NAVIGATION.GROUP:
                    node.addAlign(4 /* AUTO_LAYOUT */);
                    parseDataSet(REGEXP_GROUP, element, options);
                    break;
                case NAVIGATION.ITEM:
                    parseDataSet(REGEXP_ITEM, element, options);
                    if (!options.android.icon) {
                        const resource = this.application.resourceHandler;
                        let src = resource.addImageSrc(node.backgroundImage, PREFIX_MENU);
                        if (src !== '') {
                            options.android.icon = `@drawable/${src}`;
                        }
                        else {
                            const image = node.find(item => item.imageElement);
                            if (image) {
                                src = resource.addImageSrc(image.element, PREFIX_MENU);
                                if (src !== '') {
                                    options.android.icon = `@drawable/${src}`;
                                }
                            }
                        }
                    }
                    node.each((item) => item.tagName !== 'NAV' && item.hide());
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
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName
                },
                complete: true,
                next: controlName === NAVIGATION.MENU
            };
        }
        postBaseLayout(node) {
            node.element.querySelectorAll('NAV').forEach((item) => {
                const display = $session.getElementCache(item, 'squaredExternalDisplay', node.sessionId);
                if (display) {
                    item.style.setProperty('display', display);
                    $session.deleteElementCache(item, 'squaredExternalDisplay', node.sessionId);
                }
            });
        }
    }

    const menu = new Menu("android.widget.menu" /* MENU */, 2 /* ANDROID */, ['NAV']);
    if (squared) {
        squared.includeAsync(menu);
    }

    return menu;

}());
