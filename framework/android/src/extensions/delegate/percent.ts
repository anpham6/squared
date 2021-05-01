import CSS_UNIT = squared.lib.constant.CSS_UNIT;
import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import CREATE_NODE = squared.base.lib.internal.CREATE_NODE;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;
import LAYOUT_STRING = internal.android.LAYOUT_STRING;

import type View from '../../view';

import { LAYOUT_MAP } from '../../lib/constant';

import LayoutUI = squared.base.LayoutUI;

interface PercentData {
    percentWidth?: boolean;
    percentHeight?: boolean;
    marginHorizontal?: boolean;
    marginVertical?: boolean;
}

const { formatPX, isPercent } = squared.lib.css;
const { truncate } = squared.lib.math;
const { convertPercent } = squared.lib.util;

const checkPercent = (value: string) => isPercent(value) && parseFloat(value) > 0;

export default class Percent<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return !node.actualParent!.layoutElement && !node.tableElement || !node.pageFlow;
    }

    public condition(node: T, parent: T) {
        let percentWidth: Undef<boolean>,
            percentHeight: Undef<boolean>,
            marginHorizontal: Undef<boolean>,
            marginVertical: Undef<boolean>;
        if (!node.hasFixedDimension('width')) {
            percentWidth = node.variableWidth && !parent.layoutConstraint && (node.cssInitial('width') !== '100%' || node.has('maxWidth', { type: CSS_UNIT.PERCENT, not: '100%' })) && (node.rootElement || (parent.layoutVertical || node.onlyChild) && (parent.blockStatic || parent.percentWidth > 0));
            marginHorizontal = (checkPercent(node.cssValue('marginLeft')) || checkPercent(node.cssValue('marginRight'))) && (
                parent.layoutVertical && !parent.hasAlign(NODE_ALIGNMENT.UNKNOWN) ||
                parent.layoutFrame ||
                node.blockStatic && node.alignedVertically(undefined, this.application.clearMap) > 0 ||
                node.documentParent.size() === 1 ||
                !node.pageFlow
            );
        }
        if (!node.hasFixedDimension('height')) {
            percentHeight = node.variableHeight && (node.cssInitial('height') !== '100%' || node.has('maxHeight', { type: CSS_UNIT.PERCENT, not: '100%' })) && (node.rootElement || parent.percentHeight > 0);
            marginVertical = (checkPercent(node.cssValue('marginTop')) || checkPercent(node.cssValue('marginBottom'))) && (node.documentParent.percentHeight > 0 || node.positionFixed) && !node.inlineStatic && (node.documentParent.size() === 1 || !node.pageFlow);
        }
        if (percentWidth || percentHeight || marginHorizontal || marginVertical) {
            this.data.set(node, { percentWidth, percentHeight, marginHorizontal, marginVertical } as PercentData);
            return true;
        }
        return false;
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const mainData = this.data.get(node) as PercentData;
        let container: Undef<T>;
        if (!parent.layoutConstraint || mainData.percentHeight) {
            container = this.controller.createNodeWrapper(node, parent, { alignmentType: NODE_ALIGNMENT.VERTICAL, flags: CREATE_NODE.RESET_MARGIN });
        }
        const target = container || parent;
        if (mainData.percentWidth) {
            if (!target.hasWidth) {
                target.setCacheValue('hasWidth', true);
                target.setCacheValue('blockStatic', true);
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
                        NODE_ALIGNMENT.SINGLE
                    )
                ),
                include: true
            };
        }
        return { include: true };
    }

    public postBaseLayout(node: T) {
        const mainData = this.data.get(node) as Undef<PercentData>;
        if (mainData) {
            const controller = this.controller as android.base.Controller<T>;
            const constraint = LAYOUT_MAP.constraint;
            const renderParent = node.renderParent as T;
            const renderNode = node.anchorTarget.renderParent as T;
            if (mainData.marginHorizontal) {
                const [marginLeft, marginRight] = node.cssAsTuple('marginLeft', 'marginRight');
                const boxRect = node.getAnchorPosition(renderParent, true, false);
                const rightAligned = node.rightAligned;
                let percentWidth = node.percentWidth,
                    leftPercent = checkPercent(marginLeft) ? convertPercent(marginLeft) : 0,
                    rightPercent = checkPercent(marginRight) ? convertPercent(marginRight) : 0;
                if (percentWidth) {
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
                            [node.localizeString(LAYOUT_STRING.MARGIN_LEFT)]: boxRect.left ? formatPX(boxRect.left) : ''
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
                        controller.addAfterInsideTemplate(renderNode, output);
                    }
                }
                if (rightPercent > 0) {
                    const options = {
                        width: '0px',
                        height: 'wrap_content',
                        android: {
                            [node.localizeString(LAYOUT_STRING.MARGIN_RIGHT)]: boxRect.right ? formatPX(boxRect.right) : ''
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
                        controller.addAfterInsideTemplate(renderNode, output);
                    }
                }
                if (node.blockStatic && !node.hasWidth) {
                    node.app('layout_constraintWidth_percent', (1 - (leftPercent + rightPercent)).toString());
                    node.setLayoutWidth('0px');
                    node.setCacheValue('contentBoxWidth', 0);
                }
                else if (percentWidth) {
                    let percentTotal = percentWidth + leftPercent + rightPercent;
                    if (percentTotal >= 1) {
                        percentWidth -= percentTotal - 1;
                    }
                    else {
                        const boxPercent = node.contentBox && !node.tableElement ? node.contentBoxWidth / renderParent.box.width : 0;
                        if (boxPercent) {
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
                const boxRect = node.getAnchorPosition(renderParent, true, false);
                const bottomAligned = node.bottomAligned;
                let percentHeight = node.percentHeight,
                    topPercent = checkPercent(marginTop) ? convertPercent(marginTop) : 0,
                    bottomPercent = checkPercent(marginBottom) ? convertPercent(marginBottom) : 0;
                if (percentHeight) {
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
                            [LAYOUT_STRING.MARGIN_TOP]: boxRect.top ? formatPX(boxRect.top) : ''
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
                        controller.addAfterInsideTemplate(renderNode, output);
                    }
                }
                if (bottomPercent > 0) {
                    const options = {
                        width: 'wrap_content',
                        height: '0px',
                        android: {
                            [LAYOUT_STRING.MARGIN_BOTTOM]: boxRect.bottom ? formatPX(boxRect.bottom) : ''
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
                        controller.addAfterInsideTemplate(renderNode, output);
                    }
                }
                if (node.cssInitial('height') === '100%' || node.cssInitial('minHeight') === '100%') {
                    node.app('layout_constraintHeight_percent', (1 - (topPercent + bottomPercent)).toString());
                    node.setLayoutHeight('0px');
                    node.setCacheValue('contentBoxHeight', 0);
                }
                else if (percentHeight) {
                    let percentTotal = percentHeight + topPercent + bottomPercent;
                    if (percentTotal >= 1) {
                        percentHeight -= percentTotal - 1;
                    }
                    else {
                        const boxPercent = node.contentBox && !node.tableElement ? node.contentBoxHeight / renderParent.box.height : 0;
                        if (boxPercent) {
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
}