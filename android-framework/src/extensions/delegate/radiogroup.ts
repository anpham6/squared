import { NodeXmlTemplate } from '../../../../@types/base/application';

import View from '../../view';

import { CONTAINER_ANDROID, STRING_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

const $NodeUI = squared.base.NodeUI;
const $e = squared.base.lib.enumeration;

const getInputName = (element: HTMLInputElement) => element.name ? element.name.trim() : '';

export default class RadioGroup<T extends View> extends squared.base.ExtensionUI<T> {
    public is(node: T) {
        return node.is(CONTAINER_NODE.RADIO);
    }

    public condition(node: T) {
        return getInputName(<HTMLInputElement> node.element) !== '' && !node.positioned;
    }

    public processNode(node: T, parent: T) {
        const element = <HTMLInputElement> node.element;
        const inputName = getInputName(element);
        const children: T[] = [];
        const removeable: T[] = [];
        const radioButton: T[] = [];
        parent.each((item: T) => {
            let remove: T | undefined;
            if (item.renderAs) {
                if (item.renderAs !== node) {
                    remove = item;
                }
                item = item.renderAs as T;
            }
            if (item.is(CONTAINER_NODE.RADIO) && !item.rendered && getInputName(<HTMLInputElement> item.element) === inputName) {
                children.push(item);
                radioButton.push(item);
            }
            else if (children.length && !item.visible && !item.is(CONTAINER_NODE.RADIO)) {
                children.push(item);
            }
            else {
                return;
            }
            if (remove) {
                removeable.push(remove);
            }
        });
        for (let i = children.length - 1; i >= 0; i--) {
            if (radioButton.includes(children[i])) {
                children.splice(i + 1);
                break;
            }
        }
        if (children.length > 1) {
            const container = this.controller.createNodeGroup(node, children, parent, true);
            const linearX = $NodeUI.linearData(children).linearX;
            if (linearX) {
                container.addAlign($e.NODE_ALIGNMENT.HORIZONTAL | $e.NODE_ALIGNMENT.SEGMENTED);
                container.android('orientation', STRING_ANDROID.HORIZONTAL);
            }
            else {
                container.addAlign($e.NODE_ALIGNMENT.VERTICAL);
                container.android('orientation', STRING_ANDROID.VERTICAL);
            }
            container.setControlType(CONTAINER_ANDROID.RADIOGROUP, CONTAINER_NODE.LINEAR);
            container.inherit(node, 'alignment');
            if (container.baseline) {
                container.css('verticalAlign', 'middle');
                container.baseline = false;
            }
            container.exclude($e.NODE_RESOURCE.ASSET);
            container.render(!node.dataset.use && node.dataset.target ? this.application.resolveTarget(node.dataset.target) : parent);
            for (const item of removeable) {
                item.hide();
            }
            this.subscribers.add(container);
            return {
                renderAs: container,
                outputAs: <NodeXmlTemplate<T>> {
                    type: $e.NODE_TEMPLATE.XML,
                    node: container,
                    controlName: CONTAINER_ANDROID.RADIOGROUP
                },
                parent: container,
                complete: true
            };
        }
        return undefined;
    }

    public postBaseLayout(node: T) {
        node.renderEach((item: T) => {
            if (item.naturalElement && (<HTMLInputElement> item.element).checked) {
                node.android('checkedButton', item.documentId);
            }
        });
    }
}