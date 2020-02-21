import { NodeXmlTemplate } from '../../../../@types/base/application';
import { VisibleStyle } from '../../../../@types/base/node';

import View from '../../view';

import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { BOX_STANDARD, CSS_UNIT, NODE_ALIGNMENT, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const CssGrid = squared.base.extensions.CssGrid;

const RESOURCE_IGNORE = NODE_RESOURCE.BOX_SPACING | NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING;

const hasVisibleWidth = (node: View) => !node.blockStatic && !node.hasPX('width') || node.has('width', CSS_UNIT.LENGTH | CSS_UNIT.PERCENT, { not: '100%' }) && node.css('minWidth') !== '100%' || node.has('maxWidth', CSS_UNIT.LENGTH | CSS_UNIT.PERCENT, { not: '100%' });
const hasFullHeight = (node: View) => node.css('height') === '100%' || node.css('minHeight') === '100%';
const hasMargin = (node: View) => node.marginTop > 0 || node.marginRight > 0 || node.marginBottom > 0 || node.marginLeft > 0;
const isParentVisible = (node: View) => (<View> node.actualParent).visibleStyle.background && (hasVisibleWidth(node) || !hasFullHeight(node));
const isParentTransfer = (parent: View) => parent.tagName === 'HTML' && (parent.contentBoxWidth > 0 || parent.contentBoxHeight > 0 || hasMargin(parent));
const isFullScreen = (node: View, visibleStyle: VisibleStyle) => (node.backgroundColor || visibleStyle.backgroundImage && visibleStyle.backgroundRepeatY) && (visibleStyle.borderWidth && !node.inline && !hasFullHeight(node) && !isParentVisible(node) || node.percentWidth > 0 || node.hasPX('maxWidth') || node.gridElement && (CssGrid.isJustified(node) || CssGrid.isAligned(node)));
const isHideMargin = (node: View, visibleStyle: VisibleStyle) => visibleStyle.backgroundImage && hasMargin(node);
const isBackgroundSeparate = (node: View, visibleStyle: VisibleStyle) => visibleStyle.backgroundColor && visibleStyle.backgroundImage && (node.has('backgroundPositionY') || hasVisibleWidth(node));

export default class Background<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.documentBody;
    }

    public condition(node: T, parent: T) {
        const visibleStyle = node.visibleStyle;
        return isFullScreen(node, visibleStyle) || isHideMargin(node, visibleStyle) || isBackgroundSeparate(node, visibleStyle) || isParentTransfer(parent);
    }

    public processNode(node: T, parent: T) {
        const controller = <android.base.Controller<T>> this.controller;
        const { backgroundColor, backgroundImage, visibleStyle } = node;
        const backgroundRepeatY = visibleStyle.backgroundRepeatY;
        const backgroundSeparate = isBackgroundSeparate(node, visibleStyle);
        const hasHeight = node.hasHeight || node.actualParent?.hasHeight === true;
        let renderParent = parent;
        let container: Undef<T>;
        let parentAs!: T;
        const createFrameWrapper = (wrapper: T) => {
            wrapper.setControlType(View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api), CONTAINER_NODE.CONSTRAINT);
            wrapper.addAlign(NODE_ALIGNMENT.VERTICAL);
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
        if (backgroundImage !== '' && (parentVisible || backgroundSeparate || backgroundRepeatY || parent.visibleStyle.background || hasMargin(node))) {
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
            let backgroundSize = node.css('backgroundSize');
            if (height === '' && minHeight === '') {
                container.setLayoutHeight(!parentVisible && !(backgroundSeparate && hasHeight) && (backgroundRepeatY || backgroundSize !== 'auto') ? 'match_parent' : 'wrap_content');
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
                backgroundSize,
                border: '0px none solid',
                borderRadius: '0px'
            });
            container.cssApply(node.cssAsObject('backgroundRepeat', 'backgroundPositionX', 'backgroundPositionY', 'backgroundClip'));
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
                        CONTAINER_NODE.CONSTRAINT,
                        NODE_ALIGNMENT.VERTICAL,
                        container.children as T[]
                    )
                ),
                remove: true
            };
        }
        return { remove: true };
    }
}