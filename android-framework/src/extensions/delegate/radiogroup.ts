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
            let valid = true;
            for (let item of node) {
                if (!item.baseline) {
                    valid = false;
                    break;
                }
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
            if (valid && inputName.size === 1 && i > 1) {
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
            node.setControlType(CONTROL_NAME, CONTAINER_NODE.LINEAR);
            node.alignmentType |= $enum.NODE_ALIGNMENT.HORIZONTAL;
            node.android('orientation', AXIS_ANDROID.HORIZONTAL);
            if (node.baseline) {
                node.css('verticalAlign', 'middle', true);
                node.baseline = false;
            }
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
            const inputName = getInputName(element);
            const children: T[] = [];
            const removeable: T[] = [];
            let replacement: T | undefined;
            for (let item of parent.children as T[]) {
                let remove: T | undefined;
                if (item.renderAs) {
                    if (item.renderAs === node) {
                        replacement = item;
                    }
                    else {
                        remove = item;
                    }
                    item = item.renderAs as T;
                }
                if (node.containerType === CONTAINER_NODE.RADIO && getInputName(<HTMLInputElement> item.element) === inputName && !item.rendered) {
                    children.push(item);
                    if (remove) {
                        removeable.push(remove);
                    }
                }
            }
            if (children.length > 1) {
                const container = this.application.controllerHandler.createNodeGroup(node, children, parent, replacement);
                container.alignmentType |= $enum.NODE_ALIGNMENT.HORIZONTAL | (parent.length !== children.length ? $enum.NODE_ALIGNMENT.SEGMENTED : 0);
                if (parent.layoutConstraint) {
                    container.companion = replacement || node;
                }
                container.setControlType(CONTROL_NAME, CONTAINER_NODE.LINEAR);
                container.inherit(node, 'alignment');
                container.css('verticalAlign', 'middle');
                container.baseline = false;
                container.modifyBox($enum.BOX_STANDARD.MARGIN_TOP, -4);
                container.exclude({ resource: $enum.NODE_RESOURCE.ASSET });
                container.each(item => {
                    if (item !== node) {
                        item.setControlType(CONTAINER_ANDROID.RADIO, CONTAINER_NODE.RADIO);
                    }
                    item.positioned = true;
                });
                container.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent);
                container.android('orientation', $NodeList.linearData(children).linearX ? AXIS_ANDROID.HORIZONTAL : AXIS_ANDROID.VERTICAL);
                for (const item of removeable) {
                    item.hide();
                }
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