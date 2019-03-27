import { NodeXmlTemplate } from '../../../../src/base/@types/application';

import { AXIS_ANDROID, CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $NodeList = squared.base.NodeList;

type View = android.base.View;

const $enum = squared.base.lib.enumeration;

const CONTROL_NAME = 'RadioGroup';

const getInputName = (element: HTMLInputElement) => element.name ? element.name.trim() : '';

export default class RadioGroup<T extends View> extends squared.base.Extension<T> {
    public condition(node: T) {
        if (node.length > 1) {
            const inputName = new Set<string>();
            let i = 0;
            for (let item of node) {
                if (item.renderAs) {
                    item = item.renderAs;
                }
                if (item.containerType === CONTAINER_NODE.RADIO) {
                    const name = getInputName(<HTMLInputElement> item.element);
                    if (name !== '') {
                        inputName.add(name);
                        i++;
                    }
                }
            }
            if (inputName.size === 1 && i > 1) {
                const linearData = $NodeList.linearData(node.children);
                if (linearData.linearX && !linearData.floated.has('right')) {
                    return true;
                }
            }
            return false;
        }
        else {
            return node.containerType === CONTAINER_NODE.RADIO && getInputName(<HTMLInputElement> node.element) !== '' && !node.positioned;
        }
    }

    public processNode(node: T, parent: T) {
        if (node.length) {
            node.setControlType(CONTROL_NAME, node.block ? CONTAINER_NODE.BLOCK : CONTAINER_NODE.INLINE);
            node.android('orientation', AXIS_ANDROID.HORIZONTAL);
            node.render(parent);
            return {
                output: <NodeXmlTemplate<T>> {
                    type: $enum.NODE_TEMPLATE.XML,
                    node,
                    controlName: CONTROL_NAME
                },
                complete: true
            };
        }
        else if (parent.controlName !== CONTROL_NAME) {
            const element = <HTMLInputElement> node.element;
            const children: T[] = [];
            const inputName = getInputName(element);
            let replacement: T | undefined;
            for (let item of parent.children as T[]) {
                if (item.renderAs) {
                    if (item.renderAs === node) {
                        replacement = item;
                    }
                    item = item.renderAs as T;
                }
                if (node.containerType === CONTAINER_NODE.RADIO && getInputName(<HTMLInputElement> item.element) === inputName && !item.rendered) {
                    children.push(item);
                }
            }
            if (children.length > 1) {
                const container = this.application.controllerHandler.createNodeGroup(node, children, parent, replacement);
                container.alignmentType |= $enum.NODE_ALIGNMENT.HORIZONTAL | (parent.length !== children.length ? $enum.NODE_ALIGNMENT.SEGMENTED : 0);
                if (parent.layoutConstraint) {
                    container.companion = replacement || node;
                }
                container.setControlType(CONTROL_NAME, CONTAINER_NODE.INLINE);
                container.inherit(node, 'alignment');
                container.css('verticalAlign', 'text-bottom');
                container.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
                container.each((item: T, index) => {
                    if (item !== node) {
                        item.setControlType(CONTAINER_ANDROID.RADIO, CONTAINER_NODE.RADIO);
                    }
                    item.positioned = true;
                    item.siblingIndex = index;
                });
                container.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent);
                container.android('orientation', $NodeList.linearData(children).linearX ? AXIS_ANDROID.HORIZONTAL : AXIS_ANDROID.VERTICAL);
                this.subscribers.add(container);
                return {
                    renderAs: container,
                    outputAs: <NodeXmlTemplate<T>> {
                        type: $enum.NODE_TEMPLATE.XML,
                        node: container,
                        controlName: CONTROL_NAME
                    },
                    parent: container,
                    complete: true
                };
            }
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        node.some((item: T) => {
            if (item.element && (<HTMLInputElement> item.element).checked) {
                node.android('checkedButton', item.documentId);
                return true;
            }
            return false;
        });
    }
}