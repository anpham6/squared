import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;
import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;

import View from '../../view';

import LayoutUI = squared.base.LayoutUI;
import CssGrid = squared.base.extensions.CssGrid;

const { splitSome } = squared.lib.util;

const hasVisibleWidth = (node: View) => !node.blockStatic && !node.hasUnit('width') || node.isResizable('width') && node.cssInitial('minWidth') !== '100%' || node.isResizable('maxWidth');
const hasMargin = (node: View) => node.marginTop > 0 || node.marginRight > 0 || node.marginBottom > 0 || node.marginLeft > 0;
const isParentVisible = (node: View, parent: View) => parent.visibleStyle.background && (hasVisibleWidth(node) || !parent.fullHeight || !node.fullHeight);
const isParentTransfer = (parent: View) => parent.tagName === 'HTML' && (parent.contentBoxWidth > 0 || parent.contentBoxHeight > 0 || hasMargin(parent));
const isBackgroundSeparate = (node: View, parent: View, backgroundColor: boolean, backgroundImage: boolean, backgroundRepeatX: boolean, backgroundRepeatY: boolean, borderWidth: boolean) => backgroundColor && backgroundImage && (!backgroundRepeatY && node.has('backgroundPositionY') || borderWidth && (!backgroundRepeatX || !backgroundRepeatY) && (hasVisibleWidth(node) || !parent.fullHeight || !node.fullHeight) || node.cssValue('backgroundAttachment') === 'fixed');

export default class Background<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.documentBody;
    }

    public condition(node: T, parent: T) {
        const { backgroundColor, backgroundImage, backgroundRepeatX, backgroundRepeatY, borderWidth } = node.visibleStyle;
        return (backgroundColor || backgroundImage) && !isParentVisible(node, parent) && (borderWidth || node.gridElement && (CssGrid.isJustified(node) || CssGrid.isAligned(node))) || isBackgroundSeparate(node, parent, backgroundColor, backgroundImage, backgroundRepeatX, backgroundRepeatY, borderWidth) || backgroundImage && hasMargin(node) || isParentTransfer(parent);
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const controller = this.controller as android.base.Controller<T>;
        const { backgroundColor, backgroundImage, visibleStyle } = node;
        const backgroundSeparate = isBackgroundSeparate(node, parent, visibleStyle.backgroundColor, visibleStyle.backgroundImage, visibleStyle.backgroundRepeatX, visibleStyle.backgroundRepeatY, visibleStyle.borderWidth);
        const hasHeight = node.hasHeight || node.actualParent!.hasHeight;
        const parentVisible = isParentVisible(node, parent);
        const fixed = node.cssValue('backgroundAttachment') === 'fixed';
        const outerWrapper = node.outerWrapper && node.outerMostWrapper as Undef<T>;
        let renderParent = parent,
            container: Undef<T>,
            parentAs: Undef<T>;
        if (backgroundColor) {
            if (!(visibleStyle.backgroundImage && visibleStyle.backgroundRepeatX && visibleStyle.backgroundRepeatY) || /\.(?:gif|png|webp)"?\)$/i.test(backgroundImage)) {
                container = controller.createNodeWrapper(node, renderParent, { alignmentType: NODE_ALIGNMENT.VERTICAL, resource: NODE_RESOURCE.BOX_SPACING | NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING });
                container.css('backgroundColor', backgroundColor);
                container.setCacheValue('backgroundColor', backgroundColor);
                if (!parentVisible) {
                    container.setLayoutWidth('match_parent');
                    container.setLayoutHeight('match_parent');
                }
                else if (!hasVisibleWidth(node)) {
                    container.setLayoutWidth('match_parent');
                }
                container.unsetCache('visibleStyle');
            }
            node.css('backgroundColor', 'transparent');
            node.setCacheValue('backgroundColor', '');
            visibleStyle.backgroundColor = false;
        }
        if (backgroundImage && (parentVisible || backgroundSeparate || visibleStyle.backgroundRepeatY || parent.visibleStyle.background || hasMargin(node))) {
            if (container) {
                if (backgroundSeparate || fixed) {
                    container.setControlType(View.getControlName(CONTAINER_NODE.CONSTRAINT, node.api), CONTAINER_NODE.CONSTRAINT);
                    container.addAlign(NODE_ALIGNMENT.VERTICAL);
                    container.render(renderParent);
                    this.application.addLayoutTemplate(
                        renderParent,
                        container,
                        {
                            type: NODE_TEMPLATE.XML,
                            node: container,
                            controlName: container.controlName
                        } as NodeXmlTemplate<T>
                    );
                    parentAs = container;
                    renderParent = container;
                    container = controller.createNodeWrapper(node, parentAs, { alignmentType: NODE_ALIGNMENT.VERTICAL, resource: NODE_RESOURCE.BOX_SPACING });
                }
            }
            else {
                container = controller.createNodeWrapper(node, renderParent, { alignmentType: NODE_ALIGNMENT.VERTICAL, resource: NODE_RESOURCE.BOX_SPACING | NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING });
            }
            container.setLayoutWidth('match_parent');
            const height = parent.cssInitial('height');
            const minHeight = parent.cssInitial('minHeight');
            let backgroundSize = node.css('backgroundSize');
            if (!height && !minHeight) {
                container.setLayoutHeight(!parentVisible && (fixed || !(backgroundSeparate && hasHeight) && (visibleStyle.backgroundRepeatY || node.has('backgroundSize') || splitSome(node.css('backgroundPosition'), value => value.indexOf('%') === -1 && parseInt(value) > 0, ' '))) ? 'match_parent' : 'wrap_content');
            }
            else {
                if (!node.fullHeight) {
                    const offsetHeight = parent.toElementInt('offsetHeight');
                    if (offsetHeight < window.innerHeight) {
                        backgroundSize = `auto ${offsetHeight}px`;
                    }
                }
                container.setLayoutHeight('match_parent');
            }
            container.cssApply({ backgroundImage, backgroundSize, borderRadius: '0px' });
            container.cssApply(node.cssAsObject('backgroundRepeat', 'backgroundPositionX', 'backgroundPositionY', 'backgroundClip'));
            container.setCacheValue('backgroundImage', backgroundImage);
            container.unsetCache('visibleStyle');
            if (fixed) {
                container.android('scrollbars', 'vertical');
            }
            node.css('backgroundImage', 'none');
            node.setCacheValue('backgroundImage', '');
            visibleStyle.backgroundImage = false;
            visibleStyle.backgroundRepeatX = false;
            visibleStyle.backgroundRepeatY = false;
        }
        if (isParentTransfer(parent)) {
            container ||= controller.createNodeWrapper(node, renderParent, { alignmentType: NODE_ALIGNMENT.VERTICAL });
            container.unsafe('excludeResource', NODE_RESOURCE.FONT_STYLE | NODE_RESOURCE.VALUE_STRING);
            parent.resetBox(BOX_STANDARD.MARGIN, container);
            parent.resetBox(BOX_STANDARD.PADDING, container);
            container.setLayoutWidth('match_parent', false);
            container.setLayoutHeight('wrap_content', false);
        }
        if (container) {
            if (outerWrapper) {
                outerWrapper.setLayoutWidth('match_parent');
                outerWrapper.setLayoutHeight('match_parent');
            }
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
                        NODE_ALIGNMENT.VERTICAL
                    )
                ),
                remove: true
            };
        }
        return { remove: true };
    }
}