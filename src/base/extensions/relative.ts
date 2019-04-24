import Extension from '../extension';
import Layout from '../layout';
import Node from '../node';

import { BOX_STANDARD } from '../lib/enumeration';

const $dom = squared.lib.dom;
const $util = squared.lib.util;

export default abstract class Relative<T extends Node> extends Extension<T> {
    public condition(node: T) {
        return node.positionRelative || node.toFloat('verticalAlign', true) !== 0;
    }

    public processNode() {
        return { include: true };
    }

    public postProcedure(node: T) {
        const renderParent = node.renderParent as T;
        if (renderParent) {
            const verticalAlign = $util.convertFloat(node.verticalAlign);
            let target = node;
            let { top, right, bottom, left } = node;
            if (renderParent.support.container.positionRelative && renderParent.layoutHorizontal && node.renderChildren.length === 0 && (node.top !== 0 || node.bottom !== 0 || verticalAlign !== 0)) {
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
            else if (node.naturalElement && node.positionRelative) {
                const actualParent = node.actualParent;
                if (actualParent) {
                    let preceding = false;
                    for (const item of actualParent.actualChildren) {
                        if (item === node) {
                            if (preceding) {
                                if (renderParent.layoutVertical && (node.top !== 0 || node.bottom !== 0)) {
                                    const bounds = $dom.assignRect((<Element> node.element).getBoundingClientRect(), true);
                                    if (top !== 0) {
                                        top -= bounds.top - node.bounds.top;
                                    }
                                    if (bottom !== 0) {
                                        bottom += bounds.bottom - node.bounds.bottom;
                                    }
                                }
                                if (renderParent.layoutHorizontal && (node.left !== 0 || node.right !== 0) && node.alignSibling('leftRight') === '') {
                                    const bounds = $dom.assignRect((<Element> node.element).getBoundingClientRect(), true);
                                    if (left !== 0) {
                                        left -= bounds.left - node.bounds.left;
                                    }
                                    if (right !== 0) {
                                        right += bounds.right - node.bounds.right;
                                    }
                                }
                            }
                            else if (renderParent.layoutVertical && bottom !== 0) {
                                const valueBox = item.valueBox(BOX_STANDARD.MARGIN_TOP);
                                if (valueBox[0] === 1) {
                                    bottom -= item.marginTop;
                                }
                            }
                            break;
                        }
                        else if (item.positionRelative) {
                            preceding = true;
                        }
                    }
                }
            }
            if (top !== 0) {
                target.modifyBox(BOX_STANDARD.MARGIN_TOP, top);
            }
            else if (bottom !== 0) {
                target.modifyBox(BOX_STANDARD.MARGIN_TOP, bottom * -1);
            }
            if (verticalAlign !== 0) {
                target.modifyBox(BOX_STANDARD.MARGIN_TOP, verticalAlign * -1);
            }
            if (left !== 0) {
                if (target.autoMargin.left) {
                    target.modifyBox(BOX_STANDARD.MARGIN_RIGHT, left * -1);
                }
                else {
                    target.modifyBox(BOX_STANDARD.MARGIN_LEFT, left);
                }
            }
            else if (right !== 0) {
                target.modifyBox(BOX_STANDARD.MARGIN_LEFT, right * -1);
            }
        }
    }
}