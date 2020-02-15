import { NodeXmlTemplate } from '../../../../@types/base/application';
import { VisibleStyle } from '../../../../@types/base/node';

import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

const { BOX_STANDARD, CSS_UNIT, NODE_ALIGNMENT, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const RESOURCE_IGNORE = NODE_RESOURCE.BOX_SPACING | NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING;

const hasVisibleWidth = (node: View) => !node.blockStatic && !node.hasPX('width') || node.has('width', CSS_UNIT.LENGTH | CSS_UNIT.PERCENT, { not: '100%' }) && node.css('minWidth') !== '100%' || node.has('maxWidth', CSS_UNIT.LENGTH | CSS_UNIT.PERCENT, { not: '100%' });
const hasFullHeight = (node: View) => node.css('height') === '100%' || node.css('minHeight') === '100%';
const hasMargin = (node: View) => node.marginTop > 0 || node.marginRight > 0 || node.marginBottom > 0 || node.marginLeft > 0;
const isParentVisible = (node: View) => (<View> node.actualParent).visibleStyle.background && (hasVisibleWidth(node) || !hasFullHeight(node));
const isParentTransfer = (parent: View) => parent.tagName === 'HTML' && (parent.contentBoxWidth > 0 || parent.contentBoxHeight > 0 || hasMargin(parent));
const isFullScreen = (node: View, visibleStyle: VisibleStyle) => (node.backgroundColor || visibleStyle.backgroundImage && visibleStyle.backgroundRepeatY) && visibleStyle.borderWidth && !node.inline && !hasFullHeight(node) && !isParentVisible(node);
const isHideMargin = (node: View, visibleStyle: VisibleStyle) => visibleStyle.backgroundImage && hasMargin(node);
const isBackgroundSeperate = (node: View, visibleStyle: VisibleStyle) => visibleStyle.backgroundColor && visibleStyle.backgroundImage && (node.has('backgroundPositionY') || hasVisibleWidth(node));

export default class Background<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.documentBody;
    }

    public condition(node: T, parent: T) {
        const visibleStyle = node.visibleStyle;
        return isFullScreen(node, visibleStyle) || isHideMargin(node, visibleStyle) || isBackgroundSeperate(node, visibleStyle) || isParentTransfer(parent);
    }

    public processNode(node: T, parent: T) {
        const controller = <android.base.Controller<T>> this.controller;
        const { backgroundColor, backgroundImage, visibleStyle } = node;
        const backgroundRepeatY = visibleStyle.backgroundRepeatY;
        const backgroundSeperate = isBackgroundSeperate(node, visibleStyle);
        const hasHeight = node.hasHeight || node.actualParent?.hasHeight === true;
        let renderParent = parent;
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
        const parentVisible = isParentVisible(node);
        if (backgroundColor !== '') {
            if (!(visibleStyle.backgroundImage && visibleStyle.backgroundRepeatX && backgroundRepeatY)) {
                container = controller.createNodeWrapper(node, renderParent, undefined, { resource: RESOURCE_IGNORE });
                container.css('backgroundColor', backgroundColor);
                container.setCacheValue('backgroundColor', backgroundColor);
                if (!parentVisible) {
                    container.setLayoutWidth('match_parent');
                    container.setLayoutHeight('match_parent');
                }
                else {
                    container.setLayoutWidth(hasVisibleWidth(node) ? 'wrap_content' : 'match_parent');
                    container.setLayoutHeight('wrap_content');
                }
                container.unsetCache('visibleStyle');
            }
            node.css('backgroundColor', 'transparent');
            node.setCacheValue('backgroundColor', '');
            visibleStyle.backgroundColor = false;
        }
        if (backgroundImage !== '' && (parentVisible || backgroundSeperate || backgroundRepeatY || parent.visibleStyle.background || hasMargin(node))) {
            if (container) {
                createFrameWrapper(container);
                container = controller.createNodeWrapper(node, parentAs, undefined, { resource: NODE_RESOURCE.BOX_SPACING, ignoreRoot: true });
            }
            else {
                container = controller.createNodeWrapper(node, renderParent, undefined, { resource: RESOURCE_IGNORE });
            }
            container.setLayoutWidth('match_parent');
            const height = parent.cssInitial('height');
            const minHeight = parent.cssInitial('minHeight');
            let backgroundSize: Undef<string>;
            if (height === '' && minHeight === '') {
                container.setLayoutHeight(!parentVisible && !(backgroundSeperate && hasHeight) && (backgroundRepeatY || node.has('backgroundSize')) ? 'match_parent' : 'wrap_content');
            }
            else {
                if (height !== '100%' && minHeight !== '100%') {
                    const offsetHeight = parent.toElementInt('offsetHeight');
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
            if (container === undefined) {
                container = controller.createNodeWrapper(node, renderParent);
            }
            container.unsafe('excludeResource', NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING);
            parent.resetBox(BOX_STANDARD.MARGIN, container);
            parent.resetBox(BOX_STANDARD.PADDING, container);
            container.setLayoutWidth('match_parent', false);
            container.setLayoutHeight('wrap_content', false);
        }
        if (container) {
            visibleStyle.background = visibleStyle.borderWidth || visibleStyle.backgroundImage || visibleStyle.backgroundColor;
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
        return { remove: true };
    }
}