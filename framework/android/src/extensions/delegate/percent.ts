import Controller from '../../controller';
import View from '../../view';

import { LAYOUT_ANDROID, STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

const { CSS_UNIT, formatPX, isPercent } = squared.lib.css;
const { truncate } = squared.lib.math;

const { BOX_STANDARD, NODE_ALIGNMENT } = squared.base.lib.enumeration;

interface PercentData {
    percentWidth: boolean;
    percentHeight: boolean;
    marginHorizontal: boolean;
    marginVertical: boolean;
}

function hasPercentWidth(node: View) {
    const value = node.percentWidth;
    return value > 0 && value < 1 || isPercent(node.css('maxWidth'));
}

function hasPercentHeight(node: View, parent: View) {
    const value = node.percentHeight;
    return value > 0 && value < 1 || isPercent(node.css('maxHeight')) && parent.hasHeight;
}

function hasMarginHorizontal(node: View, parent: View, clearMap: Map<View, string>) {
    return (validPercent(node.css('marginLeft')) || validPercent(node.css('marginRight'))) && (
        parent.layoutVertical && !parent.hasAlign(NODE_ALIGNMENT.UNKNOWN) ||
        (parent as View).layoutFrame ||
        node.blockStatic && node.alignedVertically(undefined, clearMap) ||
        node.documentParent.length === 1 ||
        !node.pageFlow
    );
}

const hasMarginVertical = (node: View) => (validPercent(node.css('marginTop')) || validPercent(node.css('marginBottom'))) && node.documentParent.percentHeight > 0 && !node.inlineStatic && (node.documentParent.length === 1 || !node.pageFlow);
const validPercent = (value: string) => isPercent(value) && parseFloat(value) > 0;

export default class Percent<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.actualParent!.layoutElement && !node.display.startsWith('table');
    }

    public condition(node: T, parent: T) {
        const absoluteParent = node.absoluteParent || parent;
        const requireWidth = !absoluteParent.hasPX('width', { percent: false });
        const requireHeight = !absoluteParent.hasPX('height', { percent: false });
        const percentWidth = requireWidth && hasPercentWidth(node) && !parent.layoutConstraint && (node.cssInitial('width') !== '100%' || node.has('maxWidth', { type: CSS_UNIT.PERCENT, not: '100%' })) && (node.rootElement || (parent.layoutVertical || node.onlyChild) && (parent.blockStatic || parent.percentWidth > 0));
        const marginHorizontal = requireWidth && hasMarginHorizontal(node, parent, this.application.clearMap);
        const percentHeight = requireHeight && hasPercentHeight(node, parent) && (node.cssInitial('height') !== '100%' || node.has('maxHeight', { type: CSS_UNIT.PERCENT, not: '100%' })) && (node.rootElement || parent.percentHeight > 0);
        const marginVertical = requireHeight && hasMarginVertical(node);
        if (percentWidth || percentHeight || marginHorizontal || marginVertical) {
            node.data(this.name, 'mainData', { percentWidth, percentHeight, marginHorizontal, marginVertical } as PercentData);
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T) {
        const mainData: PercentData = node.data(this.name, 'mainData');
        if (mainData) {
            let container: Undef<T>;
            if (!parent.layoutConstraint || mainData.percentHeight) {
                container = (this.controller as android.base.Controller<T>).createNodeWrapper(node, parent, { resetMargin: true });
            }
            const target = container || parent;
            if (mainData.percentWidth) {
                if (!target.hasWidth) {
                    target.setCacheValue('hasWidth', true);
                    target.css('display', 'block');
                    target.setLayoutWidth('match_parent');
                }
                node.setLayoutWidth(node.cssInitial('width') === '100%' && !node.hasPX('maxWidth') ? 'match_parent' : '0px');
            }
            else if (container && !mainData.marginHorizontal) {
                container.setLayoutWidth('wrap_content');
            }
            if (mainData.percentHeight) {
                if (!target.hasHeight) {
                    target.setCacheValue('hasHeight', true);
                    target.setLayoutHeight('match_parent');
                }
                node.setLayoutHeight(node.cssInitial('height') === '100%' && !node.hasPX('maxHeight') ? 'match_parent' : '0px');
            }
            else if (container && !mainData.marginVertical) {
                container.setLayoutHeight('wrap_content');
            }
            if (container) {
                return {
                    parent: container,
                    renderAs: container,
                    outputAs: this.application.renderNode(
                        new LayoutUI(
                            parent,
                            container,
                            CONTAINER_NODE.CONSTRAINT,
                            NODE_ALIGNMENT.SINGLE,
                            container.children as T[]
                        )
                    ),
                    include: true
                };
            }
            return { include: true };
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        const controller = this.controller as android.base.Controller<T>;
        const mainData: PercentData = node.data(this.name, 'mainData');
        const constraint = LAYOUT_ANDROID.constraint;
        const renderParent = node.renderParent as T;
        const templateId = node.anchorTarget.renderParent!.id;
        if (mainData.marginHorizontal) {
            const [marginLeft, marginRight] = node.cssAsTuple('marginLeft', 'marginRight');
            const boxRect = Controller.anchorPosition(node, renderParent, true, false);
            const rightAligned = node.rightAligned;
            let percentWidth = node.percentWidth,
                leftPercent = validPercent(marginLeft) ? parseFloat(marginLeft) / 100 : 0,
                rightPercent = validPercent(marginRight) ? parseFloat(marginRight) / 100 : 0;
            if (percentWidth > 0) {
                if (rightAligned) {
                    if (percentWidth + rightPercent < 1) {
                       leftPercent = 1 - (percentWidth + rightPercent);
                    }
                }
                else if (percentWidth + leftPercent < 1) {
                    rightPercent = 1 - (percentWidth + leftPercent);
                }
            }
            if (leftPercent > 0) {
                const styleBias = !rightAligned && !node.centerAligned;
                const options = {
                    width: '0px',
                    height: 'wrap_content',
                    android: {
                        [node.localizeString(STRING_ANDROID.MARGIN_LEFT)]: boxRect.left ? formatPX(boxRect.left) : ''
                    },
                    app: {
                        layout_constraintHorizontal_chainStyle: styleBias ? 'packed' : '',
                        layout_constraintHorizontal_bias: styleBias ? '0' : '',
                        layout_constraintWidth_percent: truncate(leftPercent, node.localSettings.floatPrecision),
                        [constraint.top]: 'parent',
                        [node.localizeString(constraint.left)]: 'parent',
                        [node.localizeString(constraint.rightLeft)]: node.documentId
                    }
                } as RenderSpaceAttribute;
                const output = controller.renderSpace(options);
                if (options.documentId) {
                    node.anchorDelete('left');
                    node.anchor('leftRight', options.documentId);
                    node.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
                    if (rightPercent === 0) {
                        if (rightAligned) {
                            node.anchor('right', 'parent');
                            node.app('layout_constraintHorizontal_chainStyle', 'packed');
                            node.app('layout_constraintHorizontal_bias', '1');
                        }
                        if (boxRect.right) {
                            node.modifyBox(BOX_STANDARD.MARGIN_RIGHT, boxRect.right);
                        }
                    }
                    node.constraint.horizontal = true;
                    controller.addAfterInsideTemplate(templateId, output);
                }
            }
            if (rightPercent > 0) {
                const options = {
                    width: '0px',
                    height: 'wrap_content',
                    android: {
                        [node.localizeString(STRING_ANDROID.MARGIN_RIGHT)]: boxRect.right ? formatPX(boxRect.right) : ''
                    },
                    app: {
                        layout_constraintHorizontal_chainStyle: rightAligned ? 'packed' : '',
                        layout_constraintHorizontal_bias: rightAligned ? '1' : '',
                        layout_constraintWidth_percent: truncate(rightPercent, node.localSettings.floatPrecision),
                        [constraint.top]: 'parent',
                        [node.localizeString(constraint.right)]: 'parent',
                        [node.localizeString(constraint.leftRight)]: node.documentId
                    }
                } as RenderSpaceAttribute;
                const output = controller.renderSpace(options);
                if (options.documentId) {
                    node.anchorDelete('right');
                    node.anchor('rightLeft', options.documentId);
                    node.setBox(BOX_STANDARD.MARGIN_RIGHT, { reset: 1 });
                    if (leftPercent === 0) {
                        if (!rightAligned) {
                            node.anchor('left', 'parent');
                            node.app('layout_constraintHorizontal_chainStyle', 'packed');
                            node.app('layout_constraintHorizontal_bias', '0');
                        }
                        if (boxRect.left) {
                            node.modifyBox(BOX_STANDARD.MARGIN_LEFT, boxRect.left);
                        }
                    }
                    node.constraint.horizontal = true;
                    controller.addAfterInsideTemplate(templateId, output);
                }
            }
            if (node.blockStatic && !node.hasWidth) {
                node.app('layout_constraintWidth_percent', (1 - (leftPercent + rightPercent)).toString());
                node.setLayoutWidth('0px');
                node.setCacheValue('contentBoxWidth', 0);
            }
            else if (percentWidth > 0) {
                let percentTotal = percentWidth + leftPercent + rightPercent;
                if (percentTotal >= 1) {
                    percentWidth -= percentTotal - 1;
                }
                else {
                    const boxPercent = node.contentBox && !node.tableElement ? node.contentBoxWidth / renderParent.box.width : 0;
                    if (boxPercent > 0) {
                        percentTotal += boxPercent;
                        if (percentTotal >= 1) {
                            percentWidth = 1 - (leftPercent + rightPercent);
                        }
                        else {
                            percentWidth = percentTotal;
                        }
                    }
                }
                node.app('layout_constraintWidth_percent', percentWidth.toString());
                node.setLayoutWidth('0px');
                node.setCacheValue('contentBoxWidth', 0);
            }
        }
        if (mainData.marginVertical) {
            const [marginTop, marginBottom] = node.cssAsTuple('marginTop', 'marginBottom');
            const boxRect = Controller.anchorPosition(node, renderParent, true, false);
            const bottomAligned = node.bottomAligned;
            let percentHeight = node.percentHeight,
                topPercent = validPercent(marginTop) ? parseFloat(marginTop) / 100 : 0,
                bottomPercent = validPercent(marginBottom) ? parseFloat(marginBottom) / 100 : 0;
            if (percentHeight > 0) {
                if (bottomAligned) {
                    if (percentHeight + bottomPercent < 1) {
                        topPercent = 1 - (percentHeight + bottomPercent);
                    }
                }
                else if (percentHeight + topPercent < 1) {
                    bottomPercent = 1 - (percentHeight + topPercent);
                }
            }
            if (topPercent > 0) {
                const options = {
                    width: 'wrap_content',
                    height: '0px',
                    android: {
                        [STRING_ANDROID.MARGIN_TOP]: boxRect.top ? formatPX(boxRect.top) : ''
                    },
                    app: {
                        layout_constraintVertical_chainStyle: !bottomAligned ? 'packed' : '',
                        layout_constraintVertical_bias: !bottomAligned ? '0' : '',
                        layout_constraintHeight_percent: truncate(topPercent, node.localSettings.floatPrecision),
                        [node.localizeString(constraint.left)]: 'parent',
                        [constraint.top]: 'parent',
                        [constraint.bottomTop]: node.documentId
                    }
                } as RenderSpaceAttribute;
                const output = controller.renderSpace(options);
                if (options.documentId) {
                    node.anchorDelete('top');
                    node.anchor('topBottom', options.documentId);
                    node.setBox(BOX_STANDARD.MARGIN_TOP, { reset: 1 });
                    if (bottomPercent === 0) {
                        if (bottomAligned) {
                            node.anchor('bottom', 'parent');
                            node.app('layout_constraintVertical_chainStyle', 'packed');
                            node.app('layout_constraintVertical_bias', '1');
                        }
                        if (boxRect.bottom) {
                            node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, boxRect.bottom);
                        }
                    }
                    node.constraint.vertical = true;
                    controller.addAfterInsideTemplate(templateId, output);
                }
            }
            if (bottomPercent > 0) {
                const options = {
                    width: 'wrap_content',
                    height: '0px',
                    android: {
                        [STRING_ANDROID.MARGIN_BOTTOM]: boxRect.bottom ? formatPX(boxRect.bottom) : ''
                    },
                    app: {
                        layout_constraintVertical_chainStyle: bottomAligned ? 'packed' : '',
                        layout_constraintVertical_bias: bottomAligned ? '1' : '',
                        layout_constraintHeight_percent: truncate(bottomPercent, node.localSettings.floatPrecision),
                        [node.localizeString(constraint.left)]: 'parent',
                        [constraint.bottom]: 'parent',
                        [constraint.topBottom]: node.documentId
                    }
                } as RenderSpaceAttribute;
                const output = controller.renderSpace(options);
                if (options.documentId) {
                    node.anchorDelete('bottom');
                    node.anchor('bottomTop', options.documentId);
                    node.setBox(BOX_STANDARD.MARGIN_BOTTOM, { reset: 1 });
                    if (topPercent === 0) {
                        if (!bottomAligned) {
                            node.anchor('top', 'parent');
                            node.app('layout_constraintHorizontal_chainStyle', 'packed');
                            node.app('layout_constraintHorizontal_bias', '0');
                        }
                        if (boxRect.top) {
                            node.modifyBox(BOX_STANDARD.MARGIN_TOP, boxRect.top);
                        }
                    }
                    node.constraint.vertical = true;
                    controller.addAfterInsideTemplate(templateId, output);
                }
            }
            if (node.css('height') === '100%' || node.css('minHeight') === '100%') {
                node.app('layout_constraintHeight_percent', (1 - (topPercent + bottomPercent)).toString());
                node.setLayoutHeight('0px');
                node.setCacheValue('contentBoxHeight', 0);
            }
            else if (percentHeight > 0) {
                let percentTotal = percentHeight + topPercent + bottomPercent;
                if (percentTotal >= 1) {
                    percentHeight -= percentTotal - 1;
                }
                else {
                    const boxPercent = node.contentBox && !node.tableElement ? node.contentBoxHeight / renderParent.box.height : 0;
                    if (boxPercent > 0) {
                        percentTotal += boxPercent;
                        if (percentTotal >= 1) {
                            percentHeight = 1 - (topPercent + bottomPercent);
                        }
                        else {
                            percentHeight = percentTotal;
                        }
                    }
                }
                node.app('layout_constraintHeight_percent', percentHeight.toString());
                node.setLayoutHeight('0px');
                node.setCacheValue('contentBoxHeight', 0);
            }
        }
    }
}