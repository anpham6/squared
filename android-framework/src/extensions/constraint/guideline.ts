import { ConstraintGuidelineOptions } from '../../@types/extension';

import { AXIS_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $Layout = squared.base.Layout;

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;

export default class Guideline<T extends android.base.View> extends squared.base.Extension<T> {
    public readonly options: ConstraintGuidelineOptions = {
        circlePosition: false
    };

    public condition(node: T) {
        return this.included(<HTMLElement> node.element) && node.length > 0;
    }

    public processNode(node: T, parent: T) {
        node.exclude({ procedure: $enum.NODE_PROCEDURE.CONSTRAINT });
        return {
            output: this.application.renderNode(
                new $Layout(
                    parent,
                    node,
                    CONTAINER_NODE.CONSTRAINT,
                    $enum.NODE_ALIGNMENT.ABSOLUTE,
                    node.children as T[]
                )
            )
        };
    }

    public afterConstraints() {
        const controller = <android.base.Controller<T>> this.application.controllerHandler;
        for (const node of this.subscribers) {
            const alignParent = new Map<T, string[]>();
            node.each((item: T) => {
                const alignment: string[] = [];
                if ($util.withinRange(item.linear.left, node.box.left)) {
                    alignment.push('left');
                }
                if ($util.withinRange(item.linear.top, node.box.top)) {
                    alignment.push('top');
                }
                alignParent.set(item, alignment);
            });
            if (this.options.circlePosition) {
                let leftTop = false;
                for (const value of alignParent.values()) {
                    if (value.length === 2) {
                        leftTop = true;
                        break;
                    }
                }
                let anchor!: T;
                for (const [item, alignment] of alignParent.entries()) {
                    if (leftTop) {
                        if (alignment.length === 2) {
                            item.anchor('left', 'parent');
                            item.anchor('top', 'parent');
                            anchor = item;
                            break;
                        }
                    }
                    else {
                        if (alignment.length === 1) {
                            if (alignment.includes('left')) {
                                item.anchor('left', 'parent');
                                controller.addGuideline(item, node, AXIS_ANDROID.VERTICAL);
                                anchor = item;
                            }
                            else {
                                item.anchor('top', 'parent');
                                controller.addGuideline(item, node, AXIS_ANDROID.HORIZONTAL);
                                anchor = item;
                            }
                            break;
                        }
                    }
                }
                if (anchor === undefined) {
                    anchor = node.item(0) as T;
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
                        item.app('layout_constraintCircleRadius', $util.formatPX(radius));
                        item.app('layout_constraintCircleAngle', degrees.toString());
                    }
                });
            }
            else {
                for (const [item, alignment] of alignParent.entries()) {
                    if (alignment.includes('left')) {
                        item.anchor('left', 'parent');
                    }
                    if (alignment.includes('top')) {
                        item.anchor('top', 'parent');
                    }
                    if (alignment.length < 2) {
                        controller.addGuideline(item, node);
                    }
                }
            }
        }
    }
}