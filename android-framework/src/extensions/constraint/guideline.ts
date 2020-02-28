import { ConstraintGuidelineOptions } from '../../../../@types/android/extension';

import { CONTAINER_NODE } from '../../lib/enumeration';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

const $lib = squared.lib;

const { formatPX } = $lib.css;
const { hypotenuse } = $lib.math;
const { withinRange } = $lib.util;

const { NODE_ALIGNMENT } = squared.base.lib.enumeration;

export default class Guideline<T extends View> extends squared.base.ExtensionUI<T> {
    public readonly options: ConstraintGuidelineOptions = {
        circlePosition: false
    };

    public is(node: T) {
        return this.included(<HTMLElement> node.element);
    }

    public condition(node: T) {
        return node.length > 0;
    }

    public processNode(node: T, parent: T) {
        return {
            output: this.application.renderNode(
                new LayoutUI(
                    parent,
                    node,
                    CONTAINER_NODE.CONSTRAINT,
                    NODE_ALIGNMENT.ABSOLUTE,
                    node.children as T[]
                )
            )
        };
    }

    public postBaseLayout(node: T) {
        const controller = <android.base.Controller<T>> this.controller;
        const circlePosition = this.options.circlePosition;
        const { left, top } = node.box;
        let anchor!: T;
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
                else {
                    const { horizontal, vertical } = item.constraint;
                    if (anchor) {
                        if (vertical && !anchor.constraint.vertical) {
                            anchor = item;
                        }
                    }
                    else if (vertical) {
                        anchor = item;
                    }
                    else if (horizontal) {
                        anchor = item;
                    }
                }
            }
            item.positioned = true;
        });
        if (circlePosition) {
            if (anchor === undefined) {
                anchor = node.item(0) as T;
            }
            if (!anchor.anchored) {
                controller.addGuideline(anchor, node);
            }
            const { x: x2, y: y2 } = anchor.center;
            node.each((item: T) => {
                if (item !== anchor) {
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
                        else {
                            if (x > y) {
                                degrees = 270 - degrees;
                            }
                            else {
                                degrees += 180;
                            }
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
                        else {
                            if (x > y) {
                                degrees = 90 - degrees;
                            }
                        }
                    }
                    else {
                        degrees = x1 > x2 ? 90 : 270;
                    }
                    item.app('layout_constraintCircle', anchor.documentId);
                    item.app('layout_constraintCircleRadius', formatPX(radius));
                    item.app('layout_constraintCircleAngle', degrees.toString());
                }
            });
        }
        else {
            node.each((item: T) => {
                if (!item.anchored) {
                    controller.addGuideline(item, node);
                }
            });
        }
    }
}