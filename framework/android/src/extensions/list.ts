import { CONTAINER_ANDROID } from '../lib/constant';
import { CONTAINER_NODE } from '../lib/enumeration';
import { createViewAttribute } from '../lib/util';

import LayoutUI = squared.base.LayoutUI;

type View = android.base.View;

const { formatPX, getBackgroundPosition } = squared.lib.css;

const { BOX_STANDARD, NODE_ALIGNMENT, NODE_TEMPLATE } = squared.base.lib.enumeration;

export default class <T extends View> extends squared.base.extensions.List<T> {
    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {
        const layout = new LayoutUI(parent, node, 0, 0);
        if (layout.linearY) {
            layout.rowCount = node.length;
            layout.columnCount = node.some(item => item.css('listStylePosition') === 'inside') ? 3 : 2;
            layout.setContainerType(CONTAINER_NODE.GRID, NODE_ALIGNMENT.VERTICAL);
        }
        else if (layout.linearX || layout.singleRowAligned) {
            layout.rowCount = 1;
            layout.columnCount = layout.length;
            layout.setContainerType(CONTAINER_NODE.LINEAR, NODE_ALIGNMENT.HORIZONTAL);
        }
        else {
            return;
        }
        super.processNode(node, parent);
        return {
            output: this.application.renderNode(layout),
            complete: true,
            include: true
        };
    }

    public processChild(node: T, parent: T): Void<ExtensionResult<T>> {
        const mainData = this.data.get(node) as Undef<ListData>;
        if (mainData) {
            const application = this.application;
            const controller = this.controller as android.base.Controller<T>;
            const firstChild = parent.firstStaticChild === node;
            const marginTop = node.marginTop;
            let value = mainData.ordinal,
                minWidth = node.marginLeft,
                marginLeft = 0,
                columnCount = 0,
                adjustPadding: Undef<boolean>,
                wrapped: Undef<boolean>,
                container: Undef<T>;
            if (parent.layoutGrid) {
                columnCount = parseInt(parent.android('columnCount')) || 1;
                adjustPadding = true;
            }
            else if (firstChild) {
                adjustPadding = true;
            }
            if (adjustPadding) {
                minWidth += parent.paddingLeft > 0 ? parent.paddingLeft : parent.marginLeft;
            }
            let ordinal = !value && node.find((item: T) => item.float === 'left' && item.marginLeft < 0 && Math.abs(item.marginLeft) <= item.documentParent.marginLeft) as Undef<T>;
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
                ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.INLINE);
                ordinal.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
                ordinal.render(parent);
                const layout = new LayoutUI(parent, ordinal);
                if (ordinal.inlineText || ordinal.length === 0) {
                    layout.setContainerType(CONTAINER_NODE.TEXT);
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
                const { imageSrc, imagePosition } = mainData;
                let top = 0,
                    left = 0,
                    paddingRight = 0,
                    gravity = 'right',
                    image: Undef<string>;
                if (imageSrc) {
                    const resource = this.resource as android.base.Resource<T>;
                    if (imagePosition) {
                        ({ top, left } = getBackgroundPosition(imagePosition, node.actualDimension, {
                            fontSize: node.fontSize,
                            imageDimension: resource.getImage(imageSrc),
                            screenDimension: node.localSettings.screenDimension
                        }));
                        if (node.marginLeft < 0) {
                            if (adjustPadding) {
                                const marginOffset = node.marginLeft + (parent.paddingLeft > 0 ? parent.paddingLeft : parent.marginLeft);
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
                    image = resource.addImageSrc(imageSrc);
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
                if (node.length === 0 && !node.outerWrapper) {
                    container = controller.createNodeWrapper(node, parent, { alignmentType: parent.layoutGrid ? NODE_ALIGNMENT.VERTICAL : 0 });
                    wrapped = true;
                }
                else {
                    container = node.outerMostWrapper as T;
                }
                if (columnCount === 3) {
                    container.android('layout_columnSpan', '2');
                }
                const tagName = node.tagName;
                const options = createViewAttribute();
                ordinal = application.createNode(node.sessionId, { parent });
                ordinal.childIndex = node.childIndex;
                ordinal.containerName = node.containerName + '_ORDINAL';
                ordinal.inherit(node, 'textStyle');
                if (value?.endsWith('.') === false) {
                    ordinal.setCacheValue('fontSize', ordinal.fontSize * 0.75);
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
                    if (image) {
                        ordinal.setControlType(CONTAINER_ANDROID.IMAGE, CONTAINER_NODE.IMAGE);
                        Object.assign(options.android, {
                            src: `@drawable/${image}`,
                            scaleType: gravity === 'right' ? 'fitEnd' : 'fitStart',
                            baselineAlignBottom: adjustPadding ? 'true' : ''
                        });
                    }
                    else if (value) {
                        ordinal.textContent = value;
                        ordinal.inlineText = true;
                        ordinal.setControlType(CONTAINER_ANDROID.TEXT, CONTAINER_NODE.TEXT);
                        if (tagName === 'DFN') {
                            minWidth += 8;
                            ordinal.modifyBox(BOX_STANDARD.PADDING_RIGHT, 8);
                        }
                    }
                    else {
                        ordinal.setControlType(CONTAINER_ANDROID.SPACE, CONTAINER_NODE.SPACE);
                        ordinal.renderExclude = false;
                        node.setBox(BOX_STANDARD.PADDING_LEFT, { reset: 1 });
                    }
                    const { paddingTop, lineHeight } = node;
                    ordinal.cssApply({
                        minWidth: minWidth > 0 ? formatPX(minWidth) : '',
                        marginLeft: marginLeft > 0 ? formatPX(marginLeft) : '',
                        paddingTop: paddingTop > 0 && node.getBox(BOX_STANDARD.PADDING_TOP)[0] === 0 ? formatPX(paddingTop) : '',
                        paddingRight: paddingRight > 0 ? formatPX(paddingRight) : '',
                        lineHeight: lineHeight > 0 ? formatPX(lineHeight) : ''
                    });
                    ordinal.apply(options);
                    ordinal.modifyBox(BOX_STANDARD.PADDING_LEFT, 2);
                    ordinal.cssTry('display', 'inline-block', function (this: T) { this.setBounds(); });
                    ordinal.saveAsInitial();
                    if (gravity !== '') {
                        ordinal.mergeGravity('gravity', node.localizeString(gravity));
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
            const target = container || node.outerMostWrapper as T;
            if (marginTop !== 0) {
                ordinal.modifyBox(BOX_STANDARD.MARGIN_TOP, marginTop);
                ordinal.companion = target;
                this.subscribers.add(ordinal);
            }
            node.setBox(BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
            if (columnCount > 0 && node.ascend({ condition: item => !item.blockStatic && !item.hasWidth, error: item => item.hasWidth, startSelf: node.naturalElement }).length === 0) {
                target.setLayoutWidth('0px');
                target.android('layout_columnWeight', '1');
            }
            if (container) {
                if (container !== node) {
                    node.resetBox(BOX_STANDARD.MARGIN_VERTICAL, container);
                }
                if (wrapped) {
                    return {
                        parent: container,
                        renderAs: container,
                        outputAs: application.renderNode(new LayoutUI(
                            parent,
                            container,
                            node.baselineElement && node.percentWidth === 0 && !node.css('maxWidth').endsWith('%') ? CONTAINER_NODE.LINEAR : CONTAINER_NODE.CONSTRAINT,
                            NODE_ALIGNMENT.VERTICAL | NODE_ALIGNMENT.UNKNOWN
                        ))
                    };
                }
            }
        }
    }

    public postConstraints(node: T) {
        if (node.naturalChild) {
            node.setBox(node.paddingLeft > 0 ? BOX_STANDARD.PADDING_LEFT : BOX_STANDARD.MARGIN_LEFT, { reset: 1 });
            const marginOffset = this.data.get(node) as Undef<number> || 0;
            if (marginOffset < 0) {
                node.modifyBox(BOX_STANDARD.MARGIN_LEFT, marginOffset);
            }
        }
        else {
            const companion = node.companion;
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
}