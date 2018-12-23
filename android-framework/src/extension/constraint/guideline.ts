import { ExtensionResult } from '../../../../src/base/types/application';

import { AXIS_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import View from '../../view';

import $Layout = squared.base.Layout;
import $enum = squared.base.lib.enumeration;
import $util = squared.lib.util;

export default class Guideline<T extends View> extends squared.base.Extension<T> {
    public readonly options = {
        circlePosition: false
    };

    public condition(node: T) {
        return this.included(<HTMLElement> node.element) && node.length > 0;
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        node.exclude({ procedure: $enum.NODE_PROCEDURE.CONSTRAINT });
        const layout = new $Layout(
            parent,
            node,
            CONTAINER_NODE.CONSTRAINT,
            $enum.NODE_ALIGNMENT.ABSOLUTE,
            node.length,
            node.children as T[]
        );
        const output = this.application.renderNode(layout);
        return { output };
    }

    public afterConstraints() {
        const controller = (<android.base.Controller<T>> this.application.controllerHandler);
        for (const node of this.subscribers) {
            const alignParent = new Map<T, string[]>();
            node.each((item: T) => {
                const alignment: string[] = [];
                if ($util.withinFraction(item.linear.left, node.box.left)) {
                    alignment.push('left');
                }
                if ($util.withinFraction(item.linear.top, node.box.top)) {
                    alignment.push('top');
                }
                alignParent.set(item, alignment);
            });
            if (this.options.circlePosition) {
                const leftTop = Array.from(alignParent.values()).some(value => value.length === 2);
                let anchor: T | undefined;
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
                    if (anchor && item !== anchor) {
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