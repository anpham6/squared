import NODE_ALIGNMENT = squared.base.lib.constant.NODE_ALIGNMENT;
import NODE_TEMPLATE = squared.base.lib.constant.NODE_TEMPLATE;
import NODE_RESOURCE = squared.base.lib.constant.NODE_RESOURCE;
import CREATE_NODE = squared.base.lib.internal.CREATE_NODE;
import CONTAINER_NODE = android.lib.constant.CONTAINER_NODE;

import { CONTAINER_TAGNAME } from '../../lib/constant';

import type View from '../../view';

import NodeUI = squared.base.NodeUI;

const { getElementAsNode } = squared.lib.session;
const { iterateArray } = squared.lib.util;

const getInputName = (node: View) => node.toElementString('name').trim();

export default class RadioGroup<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.is(CONTAINER_NODE.RADIO);
    }

    public condition(node: T) {
        return getInputName(node) !== '' && !this.data.has(node);
    }

    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {
        const inputName = getInputName(node);
        const removeable: T[] = [];
        let radiogroup: T[] = [],
            first = -1,
            last = -1;
        parent.each((item: T, index, children: T[]) => {
            const renderAs = item.renderAs as Null<T>;
            let remove: Undef<T>;
            if (renderAs) {
                if (renderAs !== node) {
                    remove = item;
                }
                item = renderAs;
            }
            if (item.is(CONTAINER_NODE.RADIO) && !item.rendered && getInputName(item) === inputName) {
                if (first === -1) {
                    first = index;
                }
                last = index;
                radiogroup.push(item);
            }
            else if (!item.visible && children.includes(item.labelFor as T)) {
                last = index;
            }
            if (remove) {
                removeable.push(remove);
            }
        });
        let length = radiogroup.length;
        if (length > 1) {
            let items: T[];
            if (parent.layoutConstraint) {
                items = [];
                iterateArray(parent.children, (item: T) => {
                    if (item.pageFlow || item.autoPosition) {
                        items.push(item);
                    }
                }, first, last);
            }
            else {
                items = parent.children.slice(first, last + 1) as T[];
            }
            const linearX = NodeUI.linearData(items, parent.floatContainer ? this.application.clearMap : undefined, false).linearX;
            const container = this.controller.createNodeGroup(node, radiogroup, parent, { flags: CREATE_NODE.DELEGATE });
            const controlName = CONTAINER_TAGNAME.RADIOGROUP;
            container.setControlType(controlName, CONTAINER_NODE.LINEAR);
            if (linearX) {
                container.addAlign(NODE_ALIGNMENT.HORIZONTAL | NODE_ALIGNMENT.SEGMENTED);
                container.android('orientation', 'horizontal');
            }
            else {
                container.addAlign(NODE_ALIGNMENT.VERTICAL);
                container.android('orientation', 'vertical');
            }
            container.inherit(node, 'alignment');
            container.exclude({ resource: NODE_RESOURCE.ASSET });
            container.render(parent);
            if (!this.setBaselineIndex(container, radiogroup)) {
                container.css('verticalAlign', 'middle');
                container.setCacheValue('baseline', false);
            }
            removeable.forEach(item => item.hide({ remove: true }));
            this.subscribers.add(container);
            return {
                renderAs: container,
                outputAs: {
                    type: NODE_TEMPLATE.XML,
                    node: container,
                    controlName
                } as NodeXmlTemplate<T>,
                parent: container,
                complete: true
            };
        }
        radiogroup = [];
        const sessionId = node.sessionId;
        document.querySelectorAll(`input[type=radio][name=${getInputName(node)}]`).forEach((element: Element) => {
            const item = getElementAsNode<T>(element, sessionId);
            if (item) {
                radiogroup.push(item);
            }
        });
        length = radiogroup.length;
        if (length > 1 && radiogroup.includes(node)) {
            const controlName = CONTAINER_TAGNAME.RADIOGROUP;
            const data = new Map<T, number>();
            for (let i = 0; i < length; ++i) {
                const radio = radiogroup[i];
                const parents = radio.ascend({ condition: (item: T) => item.layoutLinear, error: (item: T) => item.controlName === controlName, every: true }) as T[];
                const q = parents.length;
                if (q) {
                    for (let j = 0; j < q; ++j) {
                        const item = parents[j];
                        data.set(item, (data.get(item) || 0) + 1);
                    }
                }
                else {
                    data.clear();
                    break;
                }
            }
            for (const item of data) {
                if (item[1] === length) {
                    const group = item[0];
                    group.unsafe('controlName', controlName);
                    group.containerType = CONTAINER_NODE.RADIO;
                    const renderTemplate = group.renderParent?.renderTemplates?.find(template => template.node === group) as Undef<NodeXmlTemplate<T>>;
                    if (renderTemplate) {
                        renderTemplate.controlName = controlName;
                    }
                    this.setBaselineIndex(group, radiogroup);
                    break;
                }
            }
        }
    }

    public postBaseLayout(node: T) {
        node.renderEach((item: T) => item.checked && node.android('checkedButton', item.documentId));
    }

    private setBaselineIndex(container: T, children: T[]) {
        let valid = false;
        for (let i = 0, length = children.length; i < length; ++i) {
            const item = children[i];
            if (item.checked) {
                item.android('checked', 'true');
            }
            if (!valid && item.baseline && item.parent === container && container.layoutLinear && (i === 0 || container.layoutHorizontal)) {
                container.android('baselineAlignedChildIndex', i.toString());
                valid = true;
            }
            this.data.set(item, children);
        }
        return valid;
    }
}