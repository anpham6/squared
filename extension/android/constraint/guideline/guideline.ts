import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

interface ConstraintGuidelineOptions {
    circlePosition: boolean;
}

const { CONTAINER_NODE } = android.lib.constant;

const { formatPX } = squared.lib.css;
const { hypotenuse } = squared.lib.math;
const { withinRange } = squared.lib.util;

export default class Guideline<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ConstraintGuidelineOptions = {
        circlePosition: true
    };

    public is(node: T) {
        return this.included(node.element as HTMLElement);
    }

    public condition(node: T) {
        return !node.isEmpty();
    }

    public processNode(node: T, parent: T) {
        return {
            output: this.application.renderNode(
                new LayoutUI(
                    parent,
                    node,
                    CONTAINER_NODE.CONSTRAINT,
                    NODE_ALIGNMENT.ABSOLUTE
                )
            )
        };
    }

    public postBaseLayout(node: T) {
        const controller = this.controller as android.base.Controller<T>;
        const circlePosition = this.options.circlePosition;
        const { left, top } = node.box;
        let anchor: Undef<T>;
        node.each((item: T) => {
            const linear = item.linear;
            if (withinRange(linear.left, left)) {
                item.anchorParent('horizontal', 0);
            }
            if (withinRange(linear.top, top)) {
                item.anchorParent('vertical', 0);
            }
            if (circlePosition) {
                if (item.anchored) {
                    anchor = item;
                }
                else if (anchor) {
                    if (item.constraint.vertical && !anchor.constraint.vertical) {
                        anchor = item;
                    }
                }
                else if (item.constraint.vertical) {
                    anchor = item;
                }
                else if (item.constraint.horizontal) {
                    anchor = item;
                }
            }
            item.positioned = true;
        });
        if (circlePosition) {
            anchor ||= node.item(0) as T;
            if (!anchor.anchored) {
                controller.addGuideline({ target: anchor, parent: node });
            }
            const { x: x2, y: y2 } = anchor.center;
            node.each((item: T) => {
                if (!item.anchored) {
                    const { x: x1, y: y1 } = item.center;
                    const x = Math.abs(x1 - x2);
                    const y = Math.abs(y1 - y2);
                    const radius = Math.round(hypotenuse(x, y));
                    let degrees = Math.round(Math.atan(Math.min(x, y) / Math.max(x, y)) * (180 / Math.PI));
                    if (y1 > y2) {
                        if (x1 > x2) {
                            if (x > y) {
                                degrees += 90;
                            }
                            else {
                                degrees = 180 - degrees;
                            }
                        }
                        else if (x > y) {
                            degrees = 270 - degrees;
                        }
                        else {
                            degrees += 180;
                        }
                    }
                    else if (y1 < y2) {
                        if (x2 > x1) {
                            if (x > y) {
                                degrees += 270;
                            }
                            else {
                                degrees = 360 - degrees;
                            }
                        }
                        else if (x > y) {
                            degrees = 90 - degrees;
                        }
                    }
                    else {
                        degrees = x1 > x2 ? 90 : 270;
                    }
                    item.app('layout_constraintCircle', anchor!.documentId);
                    item.app('layout_constraintCircleRadius', formatPX(radius));
                    item.app('layout_constraintCircleAngle', degrees.toString());
                }
            });
        }
        else {
            node.each((target: T) => {
                if (!target.anchored) {
                    controller.addGuideline({ target, parent: node });
                }
            });
        }
    }
}