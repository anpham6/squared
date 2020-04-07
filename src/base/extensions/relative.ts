import ExtensionUI from '../extension-ui';
import LayoutUI from '../layout-ui';
import NodeUI from '../node-ui';

import { BOX_STANDARD } from '../lib/enumeration';

const $lib = squared.lib;

const { assignRect } = $lib.dom;
const { convertFloat, withinRange } = $lib.util;

const TRANSLATE_OPTIONS = { relative: true };

export default abstract class Relative<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.positionRelative && !node.autoPosition || convertFloat(node.verticalAlign) !== 0;
    }

    public condition() {
        return true;
    }

    public processNode(node: T) {
        return { subscribe: true };
    }

    public postOptimize(node: T) {
        const renderParent = node.renderParent as T;
        const verticalAlign = !node.baselineAltered ? convertFloat(node.verticalAlign) : 0;
        let top = 0;
        let right = 0;
        let bottom = 0;
        let left = 0;
        if (node.hasPX('top')) {
            top = node.top;
        }
        else {
            bottom = node.bottom;
        }
        if (node.hasPX('left')) {
            left = node.left;
        }
        else {
            right = node.right;
        }
        if (renderParent.support.positionTranslation) {
            let x = 0;
            let y = 0;
            if (left !== 0) {
                x = left;
            }
            else if (right !== 0) {
                x = -right;
            }
            if (top !== 0) {
                y = top;
            }
            else if (bottom !== 0) {
                y = -bottom;
            }
            if (verticalAlign !== 0) {
                y -= verticalAlign;
            }
            if (x !== 0) {
                node.translateX(x, TRANSLATE_OPTIONS);
            }
            if (y !== 0) {
                node.translateY(y, TRANSLATE_OPTIONS);
            }
        }
        else {
            let target = node;
            if ((top !== 0 || bottom !== 0 || verticalAlign !== 0) && renderParent.layoutHorizontal && renderParent.support.positionRelative && node.renderChildren.length === 0) {
                const application = this.application;
                target = node.clone(application.nextId, true, true) as T;
                target.baselineAltered = true;
                node.hide({ hidden: true });
                this.cache.append(target, false);
                const layout = new LayoutUI(renderParent, target, target.containerType, target.alignmentType);
                const index = renderParent.renderChildren.findIndex(item => item === node);
                if (index !== -1) {
                    layout.renderIndex = index + 1;
                }
                application.addLayout(layout);
                if (node.parseUnit(node.css('textIndent')) < 0) {
                    const documentId = node.documentId;
                    renderParent.renderEach(item => {
                        if (item.alignSibling('topBottom') === documentId) {
                            item.alignSibling('topBottom', target.documentId);
                        }
                        else if (item.alignSibling('bottomTop') === documentId) {
                            item.alignSibling('bottomTop', target.documentId);
                        }
                    });
                }
                if (node.baselineActive && !node.baselineAltered) {
                    for (const children of (renderParent.horizontalRows || [renderParent.renderChildren])) {
                        if (children.includes(node)) {
                            const unaligned = children.filter(item => item.positionRelative && item.length > 0 && convertFloat(node.verticalAlign) !== 0);
                            const length = unaligned.length;
                            if (length) {
                                unaligned.sort((a, b) => {
                                    const topA = a.linear.top;
                                    const topB = b.linear.top;
                                    if (withinRange(topA, topB)) {
                                        return 0;
                                    }
                                    return topA < topB ? -1 : 1;
                                });
                                let first = true;
                                let i = 0;
                                while (i < length) {
                                    const item = unaligned[i++];
                                    if (first) {
                                        node.modifyBox(BOX_STANDARD.MARGIN_TOP, convertFloat(item.verticalAlign));
                                        first = false;
                                    }
                                    else {
                                        item.modifyBox(BOX_STANDARD.MARGIN_TOP, item.linear.top - unaligned[0].linear.top);
                                    }
                                    item.setCacheValue('verticalAlign', '0px');
                                }
                            }
                            break;
                        }
                    }
                }
            }
            else if (node.positionRelative && node.naturalElement) {
                const bounds = node.bounds;
                const hasVertical = top !== 0 || bottom !== 0;
                const hasHorizontal = left !== 0 || right !== 0;
                let preceding = false;
                let previous: Undef<T>;
                const children = (node.actualParent as T).naturalChildren as T[];
                const length = children.length;
                let i = 0;
                while (i < length) {
                    const item = children[i++];
                    if (item === node) {
                        if (preceding) {
                            if (hasVertical && renderParent.layoutVertical) {
                                const rect = assignRect(node.boundingClientRect);
                                if (top !== 0) {
                                    top -= rect.top - bounds.top;
                                }
                                else {
                                    if (previous?.positionRelative && previous.hasPX('top')) {
                                        bottom += bounds.bottom - rect.bottom;
                                    }
                                    else {
                                        bottom += rect.bottom - bounds.bottom;
                                    }
                                }
                            }
                            if (hasHorizontal && renderParent.layoutHorizontal && !node.alignSibling('leftRight')) {
                                const rect = assignRect(node.boundingClientRect);
                                if (left !== 0) {
                                    left -= rect.left - bounds.left;
                                }
                                else {
                                    if (previous?.positionRelative && previous.hasPX('right')) {
                                        right += bounds.right - rect.right;
                                    }
                                    else {
                                        right += rect.right - bounds.right;
                                    }
                                }
                            }
                        }
                        else if (renderParent.layoutVertical) {
                            if (top !== 0) {
                                if (previous?.blockStatic && previous.positionRelative && item.blockStatic) {
                                    top -= previous.top;
                                }
                            }
                            else if (bottom !== 0) {
                                const getBox = item.getBox(BOX_STANDARD.MARGIN_TOP);
                                if (getBox[0] === 1) {
                                    bottom -= item.marginTop;
                                }
                            }
                        }
                        break;
                    }
                    else if (item.positionRelative && item.renderParent === renderParent) {
                        preceding = true;
                    }
                    if (item.pageFlow) {
                        previous = item;
                    }
                }
            }
            if (verticalAlign !== 0) {
                target.modifyBox(BOX_STANDARD.MARGIN_TOP, verticalAlign * -1);
            }
            if (top !== 0) {
                target.modifyBox(BOX_STANDARD.MARGIN_TOP, top);
            }
            else if (bottom !== 0) {
                target.modifyBox(BOX_STANDARD.MARGIN_TOP, bottom * -1);
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
            if (target !== node) {
                target.setBoxSpacing();
            }
        }
    }
}