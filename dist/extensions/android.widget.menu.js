/* android.widget.menu 2.1.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.menu = (function () {
    'use strict';

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
        orderInCategory: /^\d+$/,
    };
    const REGEXP_GROUP = {
        id: /^@\+id\/\w+$/,
        checkableBehavior: /^(none|all|single)$/,
        visible: /^(true|false)$/,
        enabled: /^(true|false)$/,
        menuCategory: /^(container|system|secondary|alternative)$/,
        orderInCategory: /^\d+$/,
    };
    const NAVIGATION = {
        MENU: 'menu',
        ITEM: 'item',
        GROUP: 'group',
    };
    const NAMESPACE_APP = ['showAsAction', 'actionViewClass', 'actionProviderClass'];
    const PREFIX_MENU = 'ic_menu_';
    function parseDataSet(validator, element, options) {
        const dataset = element.dataset;
        for (const attr in dataset) {
            const pattern = validator[attr];
            if (pattern) {
                const value = dataset[attr];
                if (value) {
                    const match = pattern.exec(value);
                    if (match) {
                        const name = NAMESPACE_APP.includes(attr) ? 'app' : 'android';
                        (options[name] || (options[name] = {}))[attr] = Array.from(new Set(match)).join('|');
                    }
                }
            }
        }
    }
    function getTitle(node, element) {
        const title = element.title.trim();
        if (title) {
            return title;
        }
        for (const child of node.naturalChildren) {
            if (child.textElement && !child.textEmpty) {
                return child.textContent.trim();
            }
        }
        return '';
    }
    const hasInputType = (node, value) => !!node.find(item => item.toElementString('type') === value);
    class Menu extends squared.base.ExtensionUI {
        constructor(name, framework, options) {
            super(name, framework, options);
            this.cascadeAll = true;
            this.require({ name: 'android.external' /* EXTERNAL */, leading: true });
        }
        beforeInsertNode(element, sessionId) {
            if (this.included(element)) {
                if (element.childElementCount) {
                    if (!sameArray(element.children, item => item.tagName)) {
                        return false;
                    }
                    const rootElements = this.application.getProcessing(sessionId).rootElements;
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
        condition(node) {
            return this.included(node.element);
        }
        processNode(node, parent) {
            const outerParent = this.application.createNode(node.sessionId, { parent, append: false });
            outerParent.childIndex = node.childIndex;
            outerParent.actualParent = parent.actualParent;
            node.documentRoot = true;
            node.setControlType(NAVIGATION.MENU, CONTAINER_NODE.INLINE);
            node.addAlign(2 /* AUTO_LAYOUT */);
            node.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE.ALL });
            node.render(outerParent);
            node.cascade(item => this.addDescendant(item));
            node.dataset['pathname' + capitalize(this.application.systemName)] = appendSeparator(
                this.controller.userSettings.outputDirectory,
                'res/menu'
            );
            return {
                outerParent,
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName: NAVIGATION.MENU,
                },
                complete: true,
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
            let controlName, title;
            if (node.tagName === 'NAV') {
                controlName = NAVIGATION.MENU;
                title = getTitle(node, element);
            } else if (node.find(item => !item.isEmpty())) {
                if (node.find(item => item.tagName === 'NAV')) {
                    controlName = NAVIGATION.ITEM;
                } else {
                    controlName = NAVIGATION.GROUP;
                    if (node.every(item => hasInputType(item, 'radio'))) {
                        android.checkableBehavior = 'single';
                    } else if (node.every(item => hasInputType(item, 'checkbox'))) {
                        android.checkableBehavior = 'all';
                    }
                }
                title = getTitle(node, element);
            } else {
                controlName = NAVIGATION.ITEM;
                title = (element.title || element.innerText).trim();
                if (hasInputType(node, 'checkbox') && !parent.android('checkableBehavior')) {
                    android.checkable = 'true';
                }
            }
            switch (controlName) {
                case NAVIGATION.MENU:
                    node.addAlign(2 /* AUTO_LAYOUT */);
                    break;
                case NAVIGATION.GROUP:
                    node.addAlign(2 /* AUTO_LAYOUT */);
                    parseDataSet(REGEXP_GROUP, element, options);
                    break;
                case NAVIGATION.ITEM:
                    parseDataSet(REGEXP_ITEM, element, options);
                    if (!android.icon) {
                        const resource = this.resource;
                        let src = resource.addImageSrc(node.backgroundImage, PREFIX_MENU);
                        if (src) {
                            android.icon = `@drawable/${src}`;
                        } else {
                            const image = node.find(item => item.imageElement);
                            if (image) {
                                src = resource.addImageSrc(image.element, PREFIX_MENU);
                                if (src) {
                                    android.icon = `@drawable/${src}`;
                                }
                            }
                        }
                    }
                    node.each(item => item.tagName !== 'NAV' && item.hide());
                    break;
            }
            if (title) {
                android.title = Resource.addString(
                    title,
                    '',
                    this.application.extensionManager.valueAsBoolean(
                        'android.resource.strings' /* RESOURCE_STRINGS */,
                        'numberAsResource'
                    )
                );
            }
            node.setControlType(controlName, CONTAINER_NODE.INLINE);
            node.exclude({ resource: NODE_RESOURCE.ALL, procedure: NODE_PROCEDURE.ALL });
            node.render(parent);
            node.apply(options);
            return {
                output: {
                    type: 1 /* XML */,
                    node,
                    controlName,
                },
                complete: true,
                next: controlName === NAVIGATION.MENU,
            };
        }
    }

    const menu = new Menu('android.widget.menu' /* MENU */, 2 /* ANDROID */, { tagNames: ['NAV'] });
    if (squared) {
        squared.add(menu);
    }

    return menu;
})();
