import { NodeXmlTemplate } from '../../../../@types/base/application';
import { VisibleStyle } from '../../../../@types/base/node';

import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import $LayoutUI = squared.base.LayoutUI;

type T = View;

const { CSS_UNIT, NODE_ALIGNMENT, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

function isParentVisible(node: T, visibleStyle: VisibleStyle) {
    const actualParent = node.actualParent as T;
    return actualParent.visibleStyle.background && hasWidth(node) && node.css('height') !== '100%' && node.css('minHeight') !== '100%' || actualParent.height > 0 && visibleStyle.backgroundImage && node.css('backgroundPositionY').indexOf('bottom') !== -1;
}

const isHideMargin = (node: T, visibleStyle: VisibleStyle) => visibleStyle.backgroundImage && (node.marginTop > 0 || node.marginRight > 0 || node.marginBottom > 0 || node.marginLeft > 0);
const isFullScreen = (node: T, visibleStyle: VisibleStyle) => node.backgroundColor !== '' && visibleStyle.borderWidth && node.blockStatic && node.css('height') !== '100%' && node.css('minHeight') !== '100%' && !(node.actualParent as T).visibleStyle.background || visibleStyle.backgroundImage && visibleStyle.backgroundRepeatY;
const hasWidth = (node: T) => !node.blockStatic || node.hasPX('width') || node.has('maxWidth', CSS_UNIT.LENGTH | CSS_UNIT.PERCENT, { not: '100%' });

export default class Background<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly removeIs = true;

    public is(node: T) {
        return node.documentBody;
    }

    public condition(node: T) {
        const visibleStyle = node.visibleStyle;
        return isFullScreen(node, visibleStyle) || isHideMargin(node, visibleStyle) || isParentVisible(node, visibleStyle);
    }

    public processNode(node: T, parent: T) {
        const controller = <android.base.Controller<T>> this.controller;
        const { backgroundColor, visibleStyle } = node;
        const parentVisible = isParentVisible(node, visibleStyle);
        let container: T | undefined;
        let parentAs: T | undefined;
        if (backgroundColor !== '') {
            container = controller.createNodeWrapper(node, parent);
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
        if (isFullScreen(node, visibleStyle) || isHideMargin(node, visibleStyle) || parentVisible) {
            const backgroundImage = node.backgroundImage;
            if (backgroundImage !== '') {
                if (container) {
                    parentAs = container;
                    parentAs.setControlType(CONTAINER_ANDROID.FRAME, CONTAINER_NODE.FRAME);
                    parentAs.addAlign(NODE_ALIGNMENT.SINGLE);
                    parentAs.render(parent);
                    this.application.addLayoutTemplate(
                        parent,
                        container,
                        <NodeXmlTemplate<T>> {
                            type: NODE_TEMPLATE.XML,
                            node: container,
                            controlName: container.controlName
                        }
                    );
                    container = controller.createNodeWrapper(node, parentAs);
                    container.documentRoot = false;
                    parentAs.documentRoot = true;
                }
                else {
                    container = controller.createNodeWrapper(node, parent);
                }
                container.setLayoutWidth('match_parent');
                container.unsafe('excludeResource', NODE_RESOURCE.BOX_SPACING);
                const height = parent.cssInitial('height');
                const minHeight = parent.cssInitial('minHeight');
                let backgroundSize: string | undefined;
                if (height === '' && minHeight === '') {
                    container.setLayoutHeight(!parentVisible ? 'match_parent' : 'wrap_content');
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
        }
        visibleStyle.background = visibleStyle.borderWidth || visibleStyle.backgroundImage || visibleStyle.backgroundColor;
        if (container) {
            return {
                parent: container,
                parentAs,
                renderAs: container,
                outputAs: this.application.renderNode(
                    new $LayoutUI(
                        parentAs || parent,
                        container,
                        CONTAINER_NODE.FRAME,
                        NODE_ALIGNMENT.SINGLE,
                        container.children as T[]
                    )
                ),
            };
        }
        return undefined;
    }
}