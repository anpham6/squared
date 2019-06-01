import { ConstraintGuidelineOptions } from '../../@types/extension';

import { STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $LayoutUI = squared.base.LayoutUI;

const $const = squared.lib.constant;
const $css = squared.lib.css;
const $util = squared.lib.util;
const $e = squared.base.lib.enumeration;

export default class Guideline<T extends android.base.View> extends squared.base.ExtensionUI<T> {
    public readonly options: ConstraintGuidelineOptions = {
        circlePosition: false
    };

    public condition(node: T) {
        return this.included(<HTMLElement> node.element) && node.length > 0;
    }

    public processNode(node: T, parent: T) {
        node.exclude(0, $e.NODE_PROCEDURE.CONSTRAINT);
        return {
            output: this.application.renderNode(
                new $LayoutUI(
                    parent,
                    node,
                    CONTAINER_NODE.CONSTRAINT,
                    $e.NODE_ALIGNMENT.ABSOLUTE,
                    node.children as T[]
                )
            )
        };
    }

    public afterConstraints() {
        const controller = <android.base.Controller<T>> this.application.controllerHandler;
        for (const node of this.subscribers) {
            let anchor!: T;
            node.each((item: T) => {
                if ($util.withinRange(item.linear.left, node.box.left)) {
                    item.anchor($const.CSS.LEFT, STRING_ANDROID.PARENT);
                    item.anchorStyle(STRING_ANDROID.HORIZONTAL);
                }
                if ($util.withinRange(item.linear.top, node.box.top)) {
                    item.anchor($const.CSS.TOP, STRING_ANDROID.PARENT);
                    item.anchorStyle(STRING_ANDROID.VERTICAL);
                }
                if (this.options.circlePosition) {
                    if (item.anchored) {
                        anchor = item;
                    }
                    else if (anchor) {
                        if (!anchor.constraint.vertical && item.constraint.vertical) {
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
            });
            if (this.options.circlePosition) {
                if (anchor === undefined) {
                    anchor = node.item(0) as T;
                }
                if (!anchor.anchored) {
                    controller.addGuideline(anchor, node);
                }
                node.each((item: T) => {
                    if (item !== anchor) {
                        const center1 = item.center;
                        const center2 = anchor.center;
                        const x = Math.abs(center1.x - center2.x);
                        const y = Math.abs(center1.y - center2.y);
                        const radius = Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
                        let degrees = Math.round(Math.atan(Math.min(x, y) / Math.max(x, y)) * (180 / Math.PI));
                        if (center1.y > center2.y) {
                            if (center1.x > center2.x) {
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
                        else if (center1.y < center2.y) {
                            if (center2.x > center1.x) {
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
                            degrees = center1.x > center2.x ? 90 : 270;
                        }
                        item.app('layout_constraintCircle', anchor.documentId);
                        item.app('layout_constraintCircleRadius', $css.formatPX(radius));
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
}