/* android.constraint.guideline 2.1.0
   https://github.com/anpham6/squared */

this.android = this.android || {};
this.android.constraint = this.android.constraint || {};
this.android.constraint.guideline = (function () {
    'use strict';

    var LayoutUI = squared.base.LayoutUI;
    const { CONTAINER_NODE } = android.lib.constant;
    const { formatPX } = squared.lib.css;
    const { hypotenuse } = squared.lib.math;
    const { withinRange } = squared.lib.util;
    class Guideline extends squared.base.ExtensionUI {
        constructor() {
            super(...arguments);
            this.options = {
                circlePosition: true,
            };
        }
        is(node) {
            return this.included(node.element);
        }
        condition(node) {
            return !node.isEmpty();
        }
        processNode(node, parent) {
            return {
                output: this.application.renderNode(
                    new LayoutUI(parent, node, CONTAINER_NODE.CONSTRAINT, 16 /* ABSOLUTE */)
                ),
            };
        }
        postBaseLayout(node) {
            const controller = this.controller;
            const circlePosition = this.options.circlePosition;
            const { left, top } = node.box;
            let anchor;
            node.each(item => {
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
                    } else if (anchor) {
                        if (item.constraint.vertical && !anchor.constraint.vertical) {
                            anchor = item;
                        }
                    } else if (item.constraint.vertical) {
                        anchor = item;
                    } else if (item.constraint.horizontal) {
                        anchor = item;
                    }
                }
                item.positioned = true;
            });
            if (circlePosition) {
                anchor || (anchor = node.item(0));
                if (!anchor.anchored) {
                    controller.addGuideline({ target: anchor, parent: node });
                }
                const { x: x2, y: y2 } = anchor.center;
                node.each(item => {
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
                                } else {
                                    degrees = 180 - degrees;
                                }
                            } else if (x > y) {
                                degrees = 270 - degrees;
                            } else {
                                degrees += 180;
                            }
                        } else if (y1 < y2) {
                            if (x2 > x1) {
                                if (x > y) {
                                    degrees += 270;
                                } else {
                                    degrees = 360 - degrees;
                                }
                            } else if (x > y) {
                                degrees = 90 - degrees;
                            }
                        } else {
                            degrees = x1 > x2 ? 90 : 270;
                        }
                        item.app('layout_constraintCircle', anchor.documentId);
                        item.app('layout_constraintCircleRadius', formatPX(radius));
                        item.app('layout_constraintCircleAngle', degrees.toString());
                    }
                });
            } else {
                node.each(target => {
                    if (!target.anchored) {
                        controller.addGuideline({ target, parent: node });
                    }
                });
            }
        }
    }

    const guideline = new Guideline('android.constraint.guideline' /* GUIDELINE */, 2 /* ANDROID */);
    if (squared) {
        squared.add(guideline);
    }

    return guideline;
})();
