import { NodeXmlTemplate } from '../../../../src/base/@types/application';

import { CONTAINER_ANDROID, STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $NodeList = squared.base.NodeList;

type View = android.base.View;

const $const = squared.lib.constant;
const $e = squared.base.lib.enumeration;

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
                if (linearData.linearX && !linearData.floated.has($const.CSS.RIGHT)) {
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
        const controlName = CONTAINER_ANDROID.RADIOGROUP;
        if (node.length) {
            node.setControlType(controlName, CONTAINER_NODE.LINEAR);
            node.alignmentType |= $e.NODE_ALIGNMENT.HORIZONTAL;
            node.android('orientation', STRING_ANDROID.HORIZONTAL);
            if (node.baseline) {
                node.css('verticalAlign', $const.CSS.MIDDLE, true);
                node.baseline = false;
            }
            node.render(parent);
            return {
                output: <NodeXmlTemplate<T>> {
                    type: $e.NODE_TEMPLATE.XML,
                    node,
                    controlName
                },
                complete: true
            };
        }
        else if (parent.controlName !== controlName) {
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
                container.alignmentType |= $e.NODE_ALIGNMENT.HORIZONTAL | (parent.length !== children.length ? $e.NODE_ALIGNMENT.SEGMENTED : 0);
                if (parent.layoutConstraint) {
                    container.companion = replacement || node;
                }
                container.setControlType(controlName, CONTAINER_NODE.LINEAR);
                container.inherit(node, 'alignment');
                container.css('verticalAlign', $const.CSS.MIDDLE);
                container.baseline = false;
                container.exclude($e.NODE_RESOURCE.ASSET);
                container.each(item => {
                    if (item !== node) {
                        item.setControlType(CONTAINER_ANDROID.RADIO, CONTAINER_NODE.RADIO);
                    }
                    item.positioned = true;
                });
                container.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent);
                container.android('orientation', $NodeList.linearData(children).linearX ? STRING_ANDROID.HORIZONTAL : STRING_ANDROID.VERTICAL);
                for (const item of removeable) {
                    item.hide();
                }
                this.subscribers.add(container);
                return {
                    renderAs: container,
                    outputAs: <NodeXmlTemplate<T>> {
                        type: $e.NODE_TEMPLATE.XML,
                        node: container,
                        controlName
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