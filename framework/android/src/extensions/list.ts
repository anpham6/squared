import BOX_STANDARD = squared.base.lib.constant.BOX_STANDARD;
import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;

import { CONTAINER_TAGNAME } from '../lib/constant';

import type View from '../view';

import Resource from '../resource';

import LayoutUI = squared.base.LayoutUI;

import { createViewAttribute } from '../lib/util';

const { asPx, formatPX, isPercent } = squared.lib.css;

const { getTextMetrics } = squared.base.lib.dom;

const isInside = (node: View) => node.cssValue('listStylePosition') === 'inside';

export default class <T extends View> extends squared.base.extensions.List<T> {
    public readonly options: ExtensionListOptions = {
        ordinalFontSizeAdjust: 0.75
    };

    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {
        const layout = new LayoutUI(parent, node);
        if (layout.linearY || layout.linearX || layout.singleRowAligned) {
            super.processNode(...(arguments as unknown) as [T, T]);
            if (layout.linearY) {
                layout.rowCount = node.size();
                layout.columnCount = node.find((item: T) => isInside(item)) ? 3 : 2;
                layout.setContainerType(CONTAINER_NODE.GRID, NODE_ALIGNMENT.VERTICAL);
            }
            else {
                layout.rowCount = 1;
                layout.columnCount = layout.size();
                layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
            }
            return {
                output: this.application.renderNode(layout),
                complete: true,
                include: true
            };
        }
    }

    public processChild(node: T, parent: T): Void<ExtensionResult<T>> {
        const mainData = this.data.get(node) as Undef<ListData>;
        if (mainData) {
            const application = this.application;
            const setStyle = (target: T, content?: string) => {
                const { style, styleMap } = mainData;
                let fontSize = NaN;
                if (style) {
                    target.unsafe('style', style);
                    target.setCacheState('dir', style.direction);
                    fontSize = asPx(style.fontSize);
                }
                if (content && !/[a-z\d]/i.test(content)) {
                    target.setCacheValue('fontSize', (fontSize || node.fontSize) * this.options.ordinalFontSizeAdjust);
                }
                if (styleMap) {
                    target.cssApply(styleMap);
                }
            };
            let value = mainData.ordinal,
                minWidth = node.marginLeft,
                ordinal = !value && node.find((item: T) => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft) as Undef<T>,
                marginLeft = 0,
                columnCount = 0,
                containerType = 0,
                container: Undef<T>,
                adjustPadding: Undef<boolean>;
            if (parent.layoutGrid) {
                columnCount = +parent.android('columnCount') || 1;
                adjustPadding = true;
            }
            else if (parent.firstStaticChild === node) {
                adjustPadding = true;
            }
            if (adjustPadding) {
                minWidth += parent.paddingLeft || parent.marginLeft;
            }
            if (ordinal) {
                if (columnCount === 3) {
                    node.android('layout_columnSpan', '2');
                }
                if (!ordinal.hasWidth) {
                    minWidth += ordinal.marginLeft;
                    if (minWidth > 0) {
                        ordinal.android('minWidth', formatPX(minWidth));
                    }
                }
                ordinal.parent = parent;
                ordinal.setControlType(CONTAINER_TAGNAME.TEXT, CONTAINER_NODE.INLINE);
                ordinal.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
                ordinal.render(parent);
                setStyle(ordinal);
                const layout = new LayoutUI(parent, ordinal);
                if (ordinal.inlineText || ordinal.isEmpty()) {
                    layout.containerType = CONTAINER_NODE.TEXT;
                }
                else {
                    layout.retainAs(ordinal.children as T[]);
                    if (layout.singleRowAligned) {
                        layout.setContainerType(CONTAINER_NODE.RELATIVE, NODE_ALIGNMENT.HORIZONTAL);
                    }
                    else {
                        layout.setContainerType(CONTAINER_NODE.CONSTRAINT, NODE_ALIGNMENT.UNKNOWN);
                    }
                }
                application.addLayoutTemplate(parent, ordinal, application.renderNode(layout)!);
            }
            else {
                const controller = this.controller as android.base.Controller<T>;
                const { imageSrc, imagePosition } = mainData;
                let top = 0,
                    left = 0,
                    paddingRight = 0,
                    gravity = 'right',
                    image: Undef<string>;
                if (imageSrc) {
                    const resource = this.resource as android.base.Resource<T>;
                    const resourceId = node.localSettings.resourceId;
                    const imageData = resource.getImage(resourceId, imageSrc);
                    if (imagePosition) {
                        ({ top, left } = Resource.getBackgroundPosition(imagePosition, node.actualDimension, {
                            fontSize: node.fontSize,
                            imageDimension: imageData,
                            screenDimension: node.localSettings.screenDimension
                        }));
                        if (node.marginLeft < 0) {
                            if (adjustPadding) {
                                const marginOffset = node.marginLeft + (parent.paddingLeft ? parent.paddingLeft : parent.marginLeft);
                                if (marginOffset < 0) {
                                    const storedOffset = this.data.get(parent) as Undef<number> ?? Infinity;
                                    if (marginOffset < storedOffset) {
                                        this.data.set(parent, marginOffset);
                                    }
                                }
                            }
                        }
                        else {
                            marginLeft = node.marginLeft;
                        }
                        minWidth = node.paddingLeft - left;
                        node.setBox(BOX_STANDARD.PADDING_LEFT, { reset: 1 });
                        gravity = '';
                    }
                    image = resource.addImageSrc(resourceId, imageSrc);
                    if (imageData) {
                        imageData.watch = node.watch;
                        imageData.tasks = node.tasks;
                    }
                }
                if (!image && !value && node.display !== 'list-item') {
                    switch (parent.tagName) {
                        case 'UL':
                        case 'OL':
                        case 'DL':
                            break;
                        default:
                            if (adjustPadding) {
                                node.modifyBox(BOX_STANDARD.MARGIN_LEFT, parent.paddingLeft);
                            }
                            node.android('layout_columnSpan', columnCount.toString());
                            return;
                    }
                }
                if (node.isEmpty() && !node.outerWrapper) {
                    container = controller.createNodeWrapper(node, parent, { alignmentType: parent.layoutGrid ? NODE_ALIGNMENT.VERTICAL : 0 });
                    containerType = node.baselineElement && node.percentWidth === 0 && !isPercent(node.cssInitial('maxWidth')) ? CONTAINER_NODE.LINEAR : CONTAINER_NODE.CONSTRAINT;
                }
                else {
                    container = node.outerMostWrapper as T;
                }
                const tagName = node.tagName;
                ordinal = application.createNode(node.sessionId, { parent, childIndex: node.childIndex });
                ordinal.setCacheValue('tagName', tagName);
                ordinal.containerName = node.containerName + '_ORDINAL';
                ordinal.inherit(node, 'textStyle');
                setStyle(ordinal, value);
                const inside = node.cssValue('listStylePosition') === 'inside';
                if (columnCount === 3) {
                    if (inside) {
                        ordinal.android('layout_columnSpan', '2');
                        if (value) {
                            const metrics = getTextMetrics(value + '  ', node.fontSize, node.css('fontFamily'));
                            if (metrics) {
                                minWidth += metrics.width;
                            }
                        }
                    }
                    else {
                        container.android('layout_columnSpan', '2');
                    }
                }
                if (gravity === 'right') {
                    if (image) {
                        paddingRight = Math.max(minWidth / 6, 4);
                        minWidth -= paddingRight;
                    }
                    else if (value) {
                        value += '&#160;'.repeat(value.length === 1 && node.fontSize <= 24 && tagName !== 'DFN' ? 3 : 2);
                    }
                }
                if (tagName === 'DT' && !image) {
                    container.android('layout_columnSpan', columnCount.toString());
                }
                else {
                    const options = createViewAttribute();
                    if (image) {
                        ordinal.setControlType(CONTAINER_TAGNAME.IMAGE, CONTAINER_NODE.IMAGE);
                        Object.assign(options.android, {
                            src: `@drawable/${image}`,
                            scaleType: gravity === 'right' ? 'fitEnd' : 'fitStart',
                            baselineAlignBottom: adjustPadding ? 'true' : ''
                        });
                    }
                    else if (value) {
                        ordinal.textContent = value;
                        ordinal.inlineText = true;
                        ordinal.setControlType(CONTAINER_TAGNAME.TEXT, CONTAINER_NODE.TEXT);
                        if (tagName === 'DFN') {
                            minWidth += 8;
                            ordinal.modifyBox(BOX_STANDARD.PADDING_RIGHT, 8);
                        }
                    }
                    else {
                        ordinal.setControlType(CONTAINER_TAGNAME.SPACE, CONTAINER_NODE.SPACE);
                        ordinal.renderExclude = false;
                        node.setBox(BOX_STANDARD.PADDING_LEFT, { reset: 1 });
                    }
                    const { paddingTop, lineHeight } = node;
                    ordinal.cssApply({
                        minWidth: minWidth > 0 ? formatPX(minWidth) : '',
                        marginLeft: marginLeft > 0 ? formatPX(marginLeft) : '',
                        paddingTop: paddingTop > 0 && containerType !== CONTAINER_NODE.LINEAR && !node.getBox(BOX_STANDARD.PADDING_TOP)[0] ? formatPX(paddingTop) : '',
                        paddingRight: paddingRight > 0 ? formatPX(paddingRight) : '',
                        lineHeight: lineHeight > 0 ? formatPX(lineHeight) : ''
                    });
                    ordinal.apply(options);
                    ordinal.modifyBox(BOX_STANDARD.PADDING_LEFT, 2);
                    ordinal.cssTry('display', 'inline-block', function (this: T) { this.setBounds(); });
                    ordinal.saveAsInitial();
                    if (gravity) {
                        ordinal.mergeGravity('gravity', node.localizeString(gravity) as LayoutGravityDirectionAttr);
                    }
                    if (top !== 0) {
                        ordinal.modifyBox(BOX_STANDARD.MARGIN_TOP, top);
                    }
                    if (left !== 0) {
                        ordinal.modifyBox(BOX_STANDARD.MARGIN_LEFT, left);
                    }
                    ordinal.render(parent);
                    application.addLayoutTemplate(
                        parent,
                        ordinal,
                        {
                            type: NODE_TEMPLATE.XML,
                            node: ordinal,
                            controlName: ordinal.controlName
                        } as NodeXmlTemplate<T>
                    );
                }
            }
            ordinal.positioned = true;
            const marginTop = node.marginTop;
            const target = container || node.outerMostWrapper as T;
            if (marginTop !== 0) {
                ordinal.modifyBox(BOX_STANDARD.MARGIN_TOP, marginTop);
            }
            if (ordinal.paddingTop && parent.layoutGrid || marginTop !== 0) {
                ordinal.data(this.name, 'companion', target);
                this.subscribers.add(ordinal);
            }
            node.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
            if (columnCount && node.ascend({ condition: item => !item.blockStatic && !item.hasWidth, error: item => item.hasWidth, startSelf: node.naturalElement }).length === 0) {
                target.setLayoutWidth('0px');
                target.android('layout_columnWeight', '1');
            }
            if (container) {
                if (container !== node) {
                    node.resetBox(BOX_STANDARD.MARGIN_VERTICAL, container);
                }
                if (containerType) {
                    return {
                        parent: container,
                        renderAs: container,
                        outputAs: application.renderNode(new LayoutUI(
                            parent,
                            container,
                            containerType,
                            NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN
                        ))
                    };
                }
            }
        }
    }

    public postConstraints(node: T) {
        if (node.naturalChild) {
            node.setBox(node.paddingLeft ? BOX_STANDARD.PADDING_LEFT : BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
            const marginOffset = this.data.get(node) as Undef<number> || 0;
            if (marginOffset < 0) {
                node.modifyBox(BOX_STANDARD.MARGIN_LEFT, marginOffset);
            }
        }
        else if (node.getBox(BOX_STANDARD.MARGIN_TOP)[1] !== 0) {
            const companion = node.data<T>(this.name, 'companion');
            if (companion) {
                const [reset, adjustment] = companion.getBox(BOX_STANDARD.MARGIN_TOP);
                if (reset === 0) {
                    node.modifyBox(BOX_STANDARD.MARGIN_TOP, adjustment - node.getBox(BOX_STANDARD.MARGIN_TOP)[1], false);
                }
                else {
                    node.setBox(BOX_STANDARD.MARGIN_TOP, { adjustment: 0 });
                }
            }
        }
    }

    public postOptimize(node: T) {
        const companion = node.data<T>(this.name, 'companion');
        if (companion && companion.android('baselineAlignedChildIndex') && node.renderParent!.layoutGrid) {
            node.setBox(BOX_STANDARD.PADDING_TOP, { reset: 1 });
        }
    }
}