import ExtensionUI from '../extension-ui';
import LayoutUI from '../layout-ui';
import NodeUI from '../node-ui';

import { BOX_STANDARD } from '../lib/enumeration';

export default abstract class Relative<T extends NodeUI> extends ExtensionUI<T> {
    public is(node: T) {
        return node.positionRelative && !node.autoPosition || node.verticalAligned;
    }

    public condition() {
        return true;
    }

    public processNode(node: T) {
        return { subscribe: true };
    }

    public postOptimize(node: T, rendered: T[]) {
        const renderParent = node.renderParent as T;
        const verticalAlign = !node.baselineAltered ? node.verticalAlign : 0;
        let top = 0,
            right = 0,
            bottom = 0,
            left = 0;
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
            let x = 0,
                y = 0;
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
                node.translateX(x, { relative: true });
            }
            if (y !== 0) {
                node.translateY(y, { relative: true });
            }
        }
        else {
            let target = node;
            if ((top !== 0 || bottom !== 0 || verticalAlign !== 0) && renderParent.layoutHorizontal && renderParent.support.positionRelative && !node.rendering) {
                target = node.clone(this.application.nextId) as T;
                target.baselineAltered = true;
                this.application.getProcessingCache(node.sessionId).add(target);
                const layout = new LayoutUI(renderParent, target, target.containerType, target.alignmentType);
                const index = renderParent.renderChildren.findIndex(item => item === node);
                if (index !== -1) {
                    layout.renderIndex = index + 1;
                }
                this.application.addLayout(layout);
                rendered.push(target);
                if (node.baselineActive && node.childIndex === 0 && (top > 0 || verticalAlign < 0)) {
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
                if (top < 0 || bottom > 0) {
                    node.modifyBox(BOX_STANDARD.MARGIN_BOTTOM, Math.min(top, bottom * -1));
                }
                node.hide({ hidden: true });
            }
            else if (node.positionRelative && node.actualParent) {
                const bounds = node.bounds;
                const hasVertical = top !== 0 || bottom !== 0;
                const hasHorizontal = left !== 0 || right !== 0;
                const children = node.actualParent.naturalChildren as T[];
                let preceding: Undef<boolean>,
                    previous: Undef<T>;
                const length = children.length;
                let i = 0;
                while (i < length) {
                    const item = children[i++];
                    if (item === node) {
                        if (preceding) {
                            if (hasVertical && renderParent.layoutVertical) {
                                const rect = node.boundingClientRect;
                                if (rect) {
                                    if (top !== 0) {
                                        top -= rect.top - bounds.top;
                                    }
                                    else if (previous?.positionRelative && previous.hasPX('top')) {
                                        bottom += bounds.bottom - rect.bottom;
                                    }
                                    else {
                                        bottom += rect.bottom - bounds.bottom;
                                    }
                                }
                            }
                            if (hasHorizontal && renderParent.layoutHorizontal && node.alignSibling('leftRight') === '') {
                                const rect = node.boundingClientRect;
                                if (rect) {
                                    if (left !== 0) {
                                        left -= rect.left - bounds.left;
                                    }
                                    else if (previous?.positionRelative && previous.hasPX('right')) {
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