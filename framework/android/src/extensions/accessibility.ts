import type View from '../view';

import Resource from '../resource';

const { NODE_PROCEDURE, NODE_RESOURCE } = squared.base.lib.constant;

function addTextDecorationLine(node: View, attr: string) {
    node.cascade(item => {
        if (item.textElement) {
            let value = item.css('textDecorationLine');
            if (!value.includes(attr)) {
                value += (value ? ' ' : '') + attr;
                item.css('textDecorationLine', value);
            }
        }
    });
}

export default class <T extends View> extends squared.base.extensions.Accessibility<T> {
    public readonly options: ExtensionAccessibilityOptions = {
        displayLabel: false
    };
    public readonly eventOnly = true;

    public beforeBaseLayout(sessionId: string) {
        const cache = this.application.getProcessingCache(sessionId);
        cache.each(node => {
            if (node.hasProcedure(NODE_PROCEDURE.ACCESSIBILITY)) {
                const describedby = node.attributes['aria-describedby'];
                if (describedby) {
                    const sibling = cache.find(item => item.elementId === describedby);
                    if (sibling) {
                        const value = sibling.textContent;
                        if (value) {
                            node.data(Resource.KEY_NAME, 'titleString', value);
                        }
                    }
                }
                if (node.inputElement) {
                    switch (node.containerName) {
                        case 'INPUT_RADIO':
                        case 'INPUT_CHECKBOX':
                            if (!node.rightAligned && !node.centerAligned) {
                                const id = node.elementId;
                                [node.nextSibling, node.previousSibling].some((sibling: Null<T>) => {
                                    if (sibling && sibling.pageFlow && !sibling.visibleStyle.backgroundImage && sibling.visible) {
                                        let valid: Undef<boolean>;
                                        if (id && id === sibling.toElementString('htmlFor')) {
                                            valid = true;
                                        }
                                        else if (sibling.textElement) {
                                            const parent = sibling.actualParent!;
                                            if (parent.tagName === 'LABEL') {
                                                parent.renderAs = node;
                                                valid = true;
                                            }
                                            else if (sibling.plainText) {
                                                valid = true;
                                            }
                                        }
                                        if (valid) {
                                            sibling.labelFor = node;
                                            if (!this.options.displayLabel) {
                                                sibling.hide();
                                                if (node.hasPX('width')) {
                                                    if (!node.hasPX('minWidth')) {
                                                        node.css('minWidth', node.valueAt('width'));
                                                    }
                                                    node.css('width', 'auto', true);
                                                }
                                            }
                                            return true;
                                        }
                                    }
                                    return false;
                                });
                            }
                            break;
                        case 'INPUT_IMAGE':
                            if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                                node.data(Resource.KEY_NAME, 'boxImage', [node]);
                            }
                            break;
                        case 'BUTTON':
                            if (!node.isEmpty()) {
                                const textContent = node.textContent.trim();
                                let { width, height } = node.bounds,
                                    backgroundImage: Undef<string[]>,
                                    backgroundPositionX: Undef<string[]>,
                                    backgroundPositionY: Undef<string[]>;
                                node.cascade((item: T) => {
                                    if (item.svgElement) {
                                        let x = 'left',
                                            y = 'top';
                                        if (node.flexElement) {
                                            switch (item.flexbox.alignSelf) {
                                                case 'flex-end':
                                                    x = 'right';
                                                    break;
                                                case 'center':
                                                    x = 'center';
                                                    break;
                                            }
                                            switch (node.flexdata.justifyContent) {
                                                case 'flex-end':
                                                    y = 'bottom';
                                                    break;
                                                case 'center':
                                                case 'space-around':
                                                case 'space-evenly':
                                                    y = 'center';
                                                    break;
                                            }
                                        }
                                        else {
                                            if (item.rightAligned) {
                                                x = 'right';
                                            }
                                            else if (!item.blockStatic) {
                                                x = 'center';
                                            }
                                            y = 'center';
                                        }
                                        switch (x) {
                                            case 'left':
                                                x += ' ' + Math.round(item.bounds.left - node.box.left) + 'px';
                                                break;
                                            case 'right':
                                                x += ' ' + Math.round(node.box.right - item.bounds.right) + 'px';
                                                break;
                                        }
                                        switch (y) {
                                            case 'top':
                                                y += ' ' + Math.round(item.bounds.top - node.box.top) + 'px';
                                                break;
                                            case 'bottom':
                                                y += ' ' + Math.round(node.box.bottom - item.bounds.bottom) + 'px';
                                                break;
                                        }
                                        (backgroundImage ||= []).push(this.resource!.writeRawSvg(item.element as SVGSVGElement, item));
                                        (backgroundPositionX ||= []).push(x);
                                        (backgroundPositionY ||= []).push(y);
                                        item.visible = false;
                                    }
                                    if (item.width >= width && item.height >= height) {
                                        ({ width, height } = item);
                                        node.css('minWidth', Math.ceil(width) + 'px');
                                        node.css('minHeight', Math.ceil(height) + 'px');
                                        node.inherit(item, 'boxStyle');
                                    }
                                    if (item.textContent.trim() === textContent) {
                                        node.inherit(item, 'textStyle');
                                    }
                                });
                                if (backgroundImage) {
                                    node.cssApply({
                                        backgroundImage: backgroundImage.map(value => `url(${value})`).join(', '),
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPositionX: backgroundPositionX!.join(', '),
                                        backgroundPositionY: backgroundPositionY!.join(', ')
                                    });
                                }
                                if (node.hasResource(NODE_RESOURCE.IMAGE_SOURCE)) {
                                    const images = node.children.filter(item => item.imageElement);
                                    if (images.length) {
                                        node.data(Resource.KEY_NAME, 'boxImage', images);
                                    }
                                }
                                node.clear();
                            }
                            break;
                    }
                }
                else {
                    switch (node.tagName) {
                        case 'DEL':
                            addTextDecorationLine(node, 'line-through');
                            break;
                        case 'INS':
                            addTextDecorationLine(node, 'underline');
                            break;
                    }
                }
            }
        });
    }
}