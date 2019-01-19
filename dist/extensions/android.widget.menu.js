/* android.widget 0.1.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.widget = this.android.widget || {};
this.android.widget.menu = (function () {
    'use strict';

    var $Resource = android.base.Resource;
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
    function hasInputType(node, value) {
        return node.some(item => item.element.type === value);
    }
    function parseDataSet(validator, element, options) {
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
    function getTitle(element) {
        if (element.title !== '') {
            return element.title;
        }
        else {
            for (const node of $util.flatMap(Array.from(element.childNodes), (item) => $dom.getElementAsNode(item))) {
                if (node.textElement) {
                    return node.textContent.trim();
                }
            }
        }
        return '';
    }
    class Menu extends squared.base.Extension {
        constructor(name, framework, tagNames, options) {
            super(name, framework, tagNames, options);
            this.require($const.EXT_NAME.EXTERNAL, true);
        }
        init(element) {
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
                    Array.from(element.querySelectorAll('NAV')).forEach((item) => {
                        if ($dom.getStyle(element).display === 'none') {
                            $dom.setElementCache(item, 'squaredExternalDisplay', 'none');
                            item.style.display = 'block';
                        }
                    });
                    this.application.parseElements.add(element);
                }
            }
            return false;
        }
        condition(node) {
            return this.included(node.element);
        }
        processNode(node) {
            node.documentRoot = true;
            node.alignmentType |= 4 /* AUTO_LAYOUT */;
            node.setControlType(VIEW_NAVIGATION.MENU, $enumA.CONTAINER_NODE.INLINE);
            node.exclude({
                procedure: $enum.NODE_PROCEDURE.ALL,
                resource: $enum.NODE_RESOURCE.ALL
            });
            const output = this.application.controllerHandler.renderNodeStatic(VIEW_NAVIGATION.MENU, 0, {}, '', '', node, true);
            node.cascade().forEach(item => this.subscribersChild.add(item));
            return { output, complete: true };
        }
        processChild(node, parent) {
            if (node.plainText) {
                node.hide();
                return { output: '', next: true };
            }
            const options = $utilA.createViewAttribute();
            const element = node.element;
            let controlName;
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
                    if (node.every((item) => hasInputType(item, 'radio'))) {
                        options.android.checkableBehavior = 'single';
                    }
                    else if (node.every((item) => hasInputType(item, 'checkbox'))) {
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
                    node.alignmentType |= 4 /* AUTO_LAYOUT */;
                    break;
                case VIEW_NAVIGATION.GROUP:
                    node.alignmentType |= 4 /* AUTO_LAYOUT */;
                    parseDataSet(VALIDATE_GROUP, element, options);
                    break;
                case VIEW_NAVIGATION.ITEM:
                    parseDataSet(VALIDATE_ITEM, element, options);
                    if (!$util.hasValue(options.android.icon)) {
                        const style = $dom.getStyle(element);
                        let src = $Resource.addImageUrl((style.backgroundImage !== 'none' ? style.backgroundImage : style.background), $constA.PREFIX_ANDROID.MENU);
                        if (src !== '') {
                            options.android.icon = `@drawable/${src}`;
                        }
                        else {
                            const image = node.find(item => item.imageElement);
                            if (image) {
                                src = $Resource.addImageSrcSet(image.element, $constA.PREFIX_ANDROID.MENU);
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
            node.exclude({
                procedure: $enum.NODE_PROCEDURE.ALL,
                resource: $enum.NODE_RESOURCE.ALL
            });
            node.render(parent);
            const output = this.application.controllerHandler.renderNodeStatic(controlName, node.renderDepth, options, '', '', node, layout);
            return { output, complete: true, next: controlName === VIEW_NAVIGATION.MENU };
        }
        postBaseLayout(node) {
            const element = node.element;
            if (this.included(element)) {
                Array.from(element.querySelectorAll('NAV')).forEach((item) => {
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

    const menu = new Menu("android.widget.menu" /* MENU */, 2 /* ANDROID */, ['NAV']);
    if (squared) {
        squared.includeAsync(menu);
    }

    return menu;

}());
