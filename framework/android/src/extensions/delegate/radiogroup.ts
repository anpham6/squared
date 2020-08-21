import NodeUI = squared.base.NodeUI;

import { CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

type View = android.base.View;

const { getElementAsNode } = squared.lib.session;

const { NODE_ALIGNMENT, NODE_RESOURCE, NODE_TEMPLATE } = squared.base.lib.enumeration;

const getInputName = (element: HTMLInputElement) => element.name?.trim() || '';

export default class RadioGroup<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.is(CONTAINER_NODE.RADIO);
    }

    public condition(node: T) {
        return getInputName(node.element as HTMLInputElement) !== '' && !this.data.has(node);
    }

    public processNode(node: T, parent: T): Void<ExtensionResult<T>> {
        const inputName = getInputName(node.element as HTMLInputElement);
        const radiogroup: T[] = [];
        const removeable: T[] = [];
        let first = -1,
            last = -1;
        parent.each((item: T, index) => {
            const renderAs = item.renderAs as T;
            let remove: Undef<T>;
            if (renderAs) {
                if (renderAs !== node) {
                    remove = item;
                }
                item = renderAs;
            }
            if (item.is(CONTAINER_NODE.RADIO) && !item.rendered && getInputName(item.element as HTMLInputElement) === inputName) {
                radiogroup.push(item);
                if (first === -1) {
                    first = index;
                }
                last = index;
            }
            else if (!item.visible && radiogroup.includes(item.labelFor as T)) {
                last = index;
            }
            if (remove) {
                removeable.push(remove);
            }
        });
        let length = radiogroup.length;
        if (length > 1) {
            const linearX = NodeUI.linearData(parent.children.slice(first, last + 1)).linearX;
            const container = this.controller.createNodeGroup(node, radiogroup, parent, { delegate: true });
            const controlName = CONTAINER_ANDROID.RADIOGROUP;
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
            for (const item of removeable) {
                item.hide({ remove: true });
            }
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
        else {
            radiogroup.length = 0;
            const name = getInputName(node.element as HTMLInputElement);
            const sessionId = node.sessionId;
            document.querySelectorAll(`input[type=radio][name=${name}]`).forEach((element: Element) => {
                const item = getElementAsNode(element, sessionId) as T;
                if (item) {
                    radiogroup.push(item);
                }
            });
            length = radiogroup.length;
            if (length > 1 && radiogroup.includes(node)) {
                const controlName = CONTAINER_ANDROID.RADIOGROUP;
                const data = new Map<T, number>();
                for (let i = 0; i < length; ++i) {
                    const radio = radiogroup[i];
                    const parents = radio.ascend({ condition: (item: T) => item.layoutLinear, error: (item: T) => item.controlName === controlName, every: true }) as T[];
                    const q = parents.length;
                    if (q > 0) {
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
                for (const [group, value] of data.entries()) {
                    if (value === length) {
                        group.unsafe('controlName', controlName);
                        group.containerType = CONTAINER_NODE.RADIO;
                        const template = group.renderParent?.renderTemplates?.find(item => item.node === group) as Undef<NodeXmlTemplate<T>>;
                        if (template) {
                            template.controlName = controlName;
                        }
                        this.setBaselineIndex(group, radiogroup);
                        return;
                    }
                }
            }
        }
    }

    public postBaseLayout(node: T) {
        node.renderEach((item: T) => item.naturalElement && item.toElementBoolean('checked') && node.android('checkedButton', item.documentId));
    }

    private setBaselineIndex(container: T, children: T[]) {
        let valid = false;
        for (let i = 0, length = children.length; i < length; ++i) {
            const item = children[i];
            if (item.toElementBoolean('checked')) {
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