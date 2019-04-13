import Extension from '../extension';
import Layout from '../layout';
import Node from '../node';

import { BOX_STANDARD } from '../lib/enumeration';

const $util = squared.lib.util;

export default abstract class Relative<T extends Node> extends Extension<T> {
    public condition(node: T) {
        return node.positionRelative && !node.positionStatic || node.toFloat('verticalAlign', true) !== 0;
    }

    public processNode() {
        return { include: true };
    }

    public postProcedure(node: T) {
        const renderParent = node.renderParent as T;
        if (renderParent) {
            const verticalAlign = $util.convertFloat(node.verticalAlign);
            let target: T;
            if (renderParent.support.container.positionRelative && node.length === 0 && (node.top !== 0 || node.bottom !== 0 || verticalAlign !== 0)) {
                target = node.clone(this.application.nextId, true, true) as T;
                node.hide(true);
                this.application.session.cache.append(target, false);
                const layout = new Layout(
                    renderParent,
                    target,
                    target.containerType,
                    target.alignmentType
                );
                const index = renderParent.renderChildren.findIndex(item => item === node);
                if (index !== -1) {
                    layout.renderIndex = index + 1;
                }
                this.application.addRenderLayout(layout);
                if (renderParent.layoutHorizontal && node.documentParent.toInt('textIndent') < 0) {
                    renderParent.renderEach(item => {
                        if (item.alignSibling('topBottom') === node.documentId) {
                            item.alignSibling('topBottom', target.documentId);
                        }
                        else if (item.alignSibling('bottomTop') === node.documentId) {
                            item.alignSibling('bottomTop', target.documentId);
                        }
                    });
                }
                if (node.baselineActive && !node.baselineAltered) {
                    for (const children of (renderParent.horizontalRows || [renderParent.renderChildren])) {
                        if (children.includes(node)) {
                            const unaligned = $util.filterArray(children, item => item.positionRelative && item.length > 0 && $util.convertFloat(node.verticalAlign) !== 0);
                            if (unaligned.length) {
                                unaligned.sort((a, b) => {
                                    if ($util.withinRange(a.linear.top, b.linear.top)) {
                                        return 0;
                                    }
                                    return a.linear.top < b.linear.top ? -1 : 1;
                                });
                                for (let i = 0; i < unaligned.length; i++) {
                                    const item = unaligned[i];
                                    if (i === 0) {
                                        node.modifyBox(BOX_STANDARD.MARGIN_TOP, $util.convertFloat(item.verticalAlign));
                                    }
                                    else {
                                        item.modifyBox(BOX_STANDARD.MARGIN_TOP, item.linear.top - unaligned[0].linear.top);
                                    }
                                    item.css('verticalAlign', '0px', true);
                                }
                            }
                            break;
                        }
                    }
                }
            }
            else {
                target = node;
            }
            if (node.top !== 0) {
                target.modifyBox(BOX_STANDARD.MARGIN_TOP, node.top);
            }
            else if (node.bottom !== 0) {
                target.modifyBox(BOX_STANDARD.MARGIN_TOP, node.bottom * -1);
            }
            if (verticalAlign !== 0) {
                target.modifyBox(BOX_STANDARD.MARGIN_TOP, verticalAlign * -1);
            }
            if (node.left !== 0) {
                if (target.autoMargin.left) {
                    target.modifyBox(BOX_STANDARD.MARGIN_RIGHT, node.left * -1);
                }
                else {
                    target.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.left);
                }
            }
            else if (node.right !== 0) {
                target.modifyBox(BOX_STANDARD.MARGIN_LEFT, node.right * -1);
            }
        }
    }
}