import { NodeXmlTemplate } from '../../../../@types/base/application';

import View from '../../view';

import { CONTAINER_ANDROID, STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

const $base = squared.base;
const { NodeUI } = $base;

const { getElementAsNode } = squared.lib.session;

const { NODE_ALIGNMENT, NODE_RESOURCE, NODE_TEMPLATE } = $base.lib.enumeration;

const getInputName = (element: HTMLInputElement) => element.name ? element.name.trim() : '';

export default class RadioGroup<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.is(CONTAINER_NODE.RADIO);
    }

    public condition(node: T) {
        return getInputName(<HTMLInputElement> node.element) !== '' && !node.positioned;
    }

    public processNode(node: T, parent: T) {
        const inputName = getInputName(<HTMLInputElement> node.element);
        const radiogroup: T[] = [];
        const removeable: T[] = [];
        let first = -1;
        let last = -1;
        parent.each((item: T, index) => {
            const renderAs = item.renderAs as T;
            let remove: Undef<T>;
            if (renderAs) {
                if (renderAs !== node) {
                    remove = item;
                }
                item = renderAs;
            }
            if (item.is(CONTAINER_NODE.RADIO) && !item.rendered && getInputName(<HTMLInputElement> item.element) === inputName) {
                radiogroup.push(item);
                if (first === -1) {
                    first = index;
                }
                last = index;
            }
            else if (!item.visible) {
                const labelFor = <Undef<T>> item.labelFor;
                if (labelFor && radiogroup.includes(labelFor)) {
                    last = index;
                }
            }
            if (remove) {
                removeable.push(remove);
            }
        });
        if (radiogroup.length > 1) {
            const linearX = NodeUI.linearData(parent.children.slice(first, last + 1)).linearX;
            const container = this.controller.createNodeGroup(node, radiogroup, parent, true);
            const controlName = CONTAINER_ANDROID.RADIOGROUP;
            if (linearX) {
                container.addAlign(NODE_ALIGNMENT.HORIZONTAL | NODE_ALIGNMENT.SEGMENTED);
                container.android('orientation', STRING_ANDROID.HORIZONTAL);
            }
            else {
                container.addAlign(NODE_ALIGNMENT.VERTICAL);
                container.android('orientation', STRING_ANDROID.VERTICAL);
            }
            container.setControlType(controlName, CONTAINER_NODE.LINEAR);
            container.inherit(node, 'alignment');
            if (container.baseline) {
                container.css('verticalAlign', 'middle');
                container.setCacheValue('baseline', false);
                container.setCacheValue('verticalAlign', 'middle');
            }
            container.exclude({ resource: NODE_RESOURCE.ASSET });
            const dataset = node.dataset;
            container.render(dataset.target && !dataset.use ? this.application.resolveTarget(dataset.target) : parent);
            for (const item of radiogroup) {
                if (item.toElementBoolean('checked')) {
                    item.android('checked', 'true');
                }
                item.positioned = true;
            }
            for (const item of removeable) {
                item.hide();
            }
            this.subscribers.add(container);
            return {
                renderAs: container,
                outputAs: <NodeXmlTemplate<T>> {
                    type: NODE_TEMPLATE.XML,
                    node: container,
                    controlName
                },
                parent: container,
                complete: true
            };
        }
        else {
            radiogroup.length = 0;
            const name = getInputName(<HTMLInputElement> node.element);
            const sessionId = node.sessionId;
            document.querySelectorAll(`input[type=radio][name=${name}]`).forEach((element: Element) => {
                const item = getElementAsNode(element, sessionId) as T;
                if (item) {
                    radiogroup.push(item);
                }
            });
            const length = radiogroup.length;
            if (length > 1 && radiogroup.includes(node)) {
                const controlName = CONTAINER_ANDROID.RADIOGROUP;
                const data = new Map<T, number>();
                for (const node of radiogroup) {
                    const parents = node.ascend({ condition: (item: T) => item.layoutLinear, error: (item: T) => item.controlName === controlName, every: true }) as T[];
                    if (parents.length) {
                        for (const item of parents) {
                            const value = (data.get(item) || 0) + 1;
                            data.set(item, value);
                        }
                    }
                    else {
                        data.clear();
                        break;
                    }
                }
                for (const [parent, value] of data.entries()) {
                    if (value === length) {
                        parent.unsafe('controlName', controlName);
                        parent.containerType = CONTAINER_NODE.RADIO;
                        const renderParent = parent.renderParent;
                        if (renderParent) {
                            const template = <NodeXmlTemplate<T>> renderParent.renderTemplates?.find(item => item?.node === parent);
                            if (template) {
                                template.controlName = controlName;
                            }
                        }
                        for (const item of radiogroup) {
                            if (item.toElementBoolean('checked')) {
                                item.android('checked', 'true');
                            }
                            item.positioned = true;
                        }
                        return undefined;
                    }
                }
            }
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        node.renderEach((item: T) => {
            if (item.naturalElement && item.toElementBoolean('checked')) {
                node.android('checkedButton', item.documentId);
            }
        });
    }
}