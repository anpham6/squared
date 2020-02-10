import { NodeXmlTemplate } from '../../../../@types/base/application';
import { VisibleStyle } from '../../../../@types/base/node';

import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

const { resolveURL } = squared.lib.css;

const { BOX_STANDARD, CSS_UNIT, NODE_ALIGNMENT, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const isParentTransfer = (parent: View) => parent.tagName === 'HTML' && (parent.contentBoxWidth > 0 || parent.contentBoxHeight > 0 || parent.marginTop > 0 || parent.marginBottom > 0 || parent.marginRight > 0 || parent.marginLeft > 0);
const isParentVisible = (node: View, visibleStyle: VisibleStyle) => (<View> node.actualParent).visibleStyle.background && (hasWidth(node) && node.css('height') !== '100%' && node.css('minHeight') !== '100%' || visibleStyle.backgroundImage && (visibleStyle.backgroundRepeatY || node.css('backgroundPositionY').includes('bottom')));
const isHideMargin = (node: View, visibleStyle: VisibleStyle) => visibleStyle.backgroundImage && (node.marginTop > 0 || node.marginRight > 0 || node.marginBottom > 0 || node.marginLeft > 0);
const isFullScreen = (node: View, visibleStyle: VisibleStyle) => node.backgroundColor !== '' && visibleStyle.borderWidth && !node.inline && node.css('height') !== '100%' && node.css('minHeight') !== '100%' && !(<View> node.actualParent).visibleStyle.background || visibleStyle.backgroundImage && visibleStyle.backgroundRepeatY;
const hasWidth = (node: View) => !node.blockStatic || node.hasPX('width') || node.has('maxWidth', CSS_UNIT.LENGTH | CSS_UNIT.PERCENT, { not: '100%' });

export default class Background<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.documentBody;
    }

    public condition(node: T, parent: T) {
        const visibleStyle = node.visibleStyle;
        return isFullScreen(node, visibleStyle) || isHideMargin(node, visibleStyle) || isParentTransfer(parent);
    }

    public processNode(node: T, parent: T) {
        const controller = <android.base.Controller<T>> this.controller;
        const outerWrapper = node.outerMostWrapper as T;
        let target: Undef<T>;
        let targetParent: Undef<T>;
        if (!outerWrapper.naturalChild) {
            target = outerWrapper;
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
        let renderParent = actualParent;
        let container: Undef<T>;
        let parentAs!: T;
        const createFrameWrapper = (wrapper: T) => {
            wrapper.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
            wrapper.addAlign(NODE_ALIGNMENT.SINGLE);
            wrapper.render(renderParent);
            this.application.addLayoutTemplate(
                renderParent,
                wrapper,
                <NodeXmlTemplate<T>> {
                    type: NODE_TEMPLATE.XML,
                    node: wrapper,
                    controlName: wrapper.controlName
                }
            );
            parentAs = wrapper;
            renderParent = parentAs;
        };
        if (backgroundColor !== '') {
            container = controller.createNodeWrapper(actualNode, renderParent, undefined, { resource: NODE_RESOURCE.BOX_SPACING });
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
            const image = this.application.resourceHandler.getImage(resolveURL(backgroundImage));
            const fitContent = !!image && image.height < node.actualHeight;
            if (container === undefined || parentVisible || actualParent.visibleStyle.background || !visibleStyle.backgroundRepeatY || fitContent) {
                if (container) {
                    createFrameWrapper(container);
                    container = controller.createNodeWrapper(actualNode, parentAs, undefined, { resource: NODE_RESOURCE.BOX_SPACING, ignoreRoot: true });
                }
                else {
                    container = controller.createNodeWrapper(actualNode, renderParent, undefined, { resource: NODE_RESOURCE.BOX_SPACING });
                }
            }
            container.setLayoutWidth('match_parent');
            const height = actualParent.cssInitial('height');
            const minHeight = actualParent.cssInitial('minHeight');
            let backgroundSize: Undef<string>;
            if (height === '' && minHeight === '') {
                container.setLayoutHeight(!parentVisible && (visibleStyle.backgroundRepeatY || image && !fitContent || node.has('backgroundSize')) ? 'match_parent' : 'wrap_content');
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
        if (isParentTransfer(parent)) {
            if (container) {
                createFrameWrapper(container);
                container = controller.createNodeWrapper(actualNode, parentAs, undefined, { ignoreRoot: true });
            }
            else {
                container = controller.createNodeWrapper(actualNode, renderParent);
            }
            parent.resetBox(BOX_STANDARD.MARGIN, container);
            parent.resetBox(BOX_STANDARD.PADDING, container);
            container.setLayoutWidth('match_parent');
            container.setLayoutHeight('wrap_content');
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
                    parentAs: renderParent,
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new LayoutUI(
                            renderParent,
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
                    remove: true
                };
            }
        }
        return { remove: true };
    }
}