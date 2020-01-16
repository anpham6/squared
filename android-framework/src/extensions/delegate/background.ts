import { NodeXmlTemplate } from '../../../../@types/base/application';
import { VisibleStyle } from '../../../../@types/base/node';

import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import LayoutUI = squared.base.LayoutUI;

const { CSS_UNIT, NODE_ALIGNMENT, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

function isParentVisible(node: View, visibleStyle: VisibleStyle) {
    const actualParent = node.actualParent as View;
    return actualParent.visibleStyle.background && hasWidth(node) && node.css('height') !== '100%' && node.css('minHeight') !== '100%' || actualParent.height > 0 && visibleStyle.backgroundImage && node.css('backgroundPositionY').indexOf('bottom') !== -1;
}

const isHideMargin = (node: View, visibleStyle: VisibleStyle) => visibleStyle.backgroundImage && (node.marginTop > 0 || node.marginRight > 0 || node.marginBottom > 0 || node.marginLeft > 0);
const isFullScreen = (node: View, visibleStyle: VisibleStyle) => node.backgroundColor !== '' && visibleStyle.borderWidth && node.blockStatic && node.css('height') !== '100%' && node.css('minHeight') !== '100%' && !(node.actualParent as View).visibleStyle.background || visibleStyle.backgroundImage && visibleStyle.backgroundRepeatY;
const hasWidth = (node: View) => !node.blockStatic || node.hasPX('width') || node.has('maxWidth', CSS_UNIT.LENGTH | CSS_UNIT.PERCENT, { not: '100%' });

export default class Background<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly removeIs = true;

    public is(node: T) {
        return node.documentBody;
    }

    public condition(node: T) {
        const visibleStyle = node.visibleStyle;
        return isFullScreen(node, visibleStyle) || isHideMargin(node, visibleStyle);
    }

    public processNode(node: T, parent: T) {
        const controller = <android.base.Controller<T>> this.controller;
        let target = node.outerMostWrapper as T | undefined;
        let targetParent: T | undefined;
        if (target) {
            targetParent = target.parent as T;
            const renderChildren = targetParent.renderChildren;
            const index = renderChildren.findIndex(item => item === target);
            if (index !== -1) {
                renderChildren.splice(index, 1);
                targetParent.renderTemplates?.splice(index, 1);
                target.rendered = false;
                target.renderParent = undefined;
            }
            else {
                target = undefined;
                targetParent = undefined;
            }
        }
        const actualNode = target || node;
        const actualParent = targetParent || parent;
        const { backgroundColor, visibleStyle } = node;
        const parentVisible = isParentVisible(node, visibleStyle);
        let container: T | undefined;
        let parentAs: T | undefined;
        if (backgroundColor !== '') {
            container = controller.createNodeWrapper(actualNode, actualParent);
            container.unsafe('excludeResource', NODE_RESOURCE.BOX_SPACING);
            container.css('backgroundColor', backgroundColor);
            container.setCacheValue('backgroundColor', backgroundColor);
            if (!parentVisible) {
                container.setLayoutWidth('match_parent');
                container.setLayoutHeight('match_parent');
            }
            else {
                container.setLayoutWidth(hasWidth(node) ? 'wrap_content' : 'match_parent');
                container.setLayoutHeight('wrap_content');
            }
            container.unsetCache('visibleStyle');
            node.css('backgroundColor', 'transparent');
            node.setCacheValue('backgroundColor', '');
            visibleStyle.backgroundColor = false;
        }
        const backgroundImage = node.backgroundImage;
        if (backgroundImage !== '') {
            if (container) {
                parentAs = container;
                parentAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                parentAs.addAlign(NODE_ALIGNMENT.SINGLE);
                parentAs.render(actualParent);
                this.application.addLayoutTemplate(
                    actualParent,
                    container,
                    <NodeXmlTemplate<T>> {
                        type: NODE_TEMPLATE.XML,
                        node: container,
                        controlName: container.controlName
                    }
                );
                container = controller.createNodeWrapper(actualNode, parentAs);
                container.documentRoot = false;
                parentAs.documentRoot = true;
            }
            else {
                container = controller.createNodeWrapper(actualNode, actualParent);
            }
            container.setLayoutWidth('match_parent');
            container.unsafe('excludeResource', NODE_RESOURCE.BOX_SPACING);
            const height = actualParent.cssInitial('height');
            const minHeight = actualParent.cssInitial('minHeight');
            let backgroundSize: string | undefined;
            if (height === '' && minHeight === '') {
                container.setLayoutHeight(!parentVisible ? 'match_parent' : 'wrap_content');
            }
            else {
                if (height !== '100%' && minHeight !== '100%') {
                    const offsetHeight = actualParent.toElementInt('offsetHeight');
                    if (offsetHeight < window.innerHeight) {
                        backgroundSize = `auto ${offsetHeight}px`;
                    }
                }
                container.setLayoutHeight('match_parent');
            }
            container.cssApply({
                backgroundImage,
                backgroundSize: backgroundSize || node.css('backgroundSize'),
                backgroundRepeat: node.css('backgroundRepeat'),
                backgroundPositionX: node.css('backgroundPositionX'),
                backgroundPositionY: node.css('backgroundPositionY'),
                backgroundClip: node.css('backgroundClip'),
                border: '0px none solid',
                borderRadius: '0px'
            });
            container.setCacheValue('backgroundImage', backgroundImage);
            container.unsetCache('visibleStyle');
            node.css('backgroundImage', 'none');
            node.setCacheValue('backgroundImage', '');
            visibleStyle.backgroundImage = false;
        }
        visibleStyle.background = visibleStyle.borderWidth || visibleStyle.backgroundImage || visibleStyle.backgroundColor;
        if (container) {
            if (target) {
                target.render(container);
                this.application.addLayoutTemplate(
                    container,
                    target,
                    <NodeXmlTemplate<T>> {
                        type: NODE_TEMPLATE.XML,
                        node: target,
                        controlName: target.controlName
                    }
                );
                return {
                    parent: target,
                    parentAs: actualParent,
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new LayoutUI(
                            actualParent,
                            container,
                            CONTAINER_NODE.FRAME,
                            NODE_ALIGNMENT.SINGLE,
                            container.children as T[]
                        )
                    ),
                };
            }
            else {
                return {
                    parent: container,
                    parentAs,
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new LayoutUI(
                            parentAs || parent,
                            container,
                            CONTAINER_NODE.FRAME,
                            NODE_ALIGNMENT.SINGLE,
                            container.children as T[]
                        )
                    ),
                };
            }
        }
        return undefined;
    }
}