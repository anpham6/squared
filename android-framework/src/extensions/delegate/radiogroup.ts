import { ExtensionResult } from '../../../../src/base/@types/application';

import { AXIS_ANDROID, CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $NodeList = squared.base.NodeList;

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

export default class ScrollView<T extends android.base.View> extends squared.base.Extension<T> {
    public condition(node: T) {
        const element = <HTMLInputElement> node.element;
        return element.tagName === 'INPUT' && element.type === 'radio' && $util.hasValue(element.name);
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const element = <HTMLInputElement> node.element;
        const target = !node.dataset.use ? node.dataset.target : undefined;
        const pending: T[] = [];
        let replacement: T | undefined;
        const children = parent.flatMap((item: T) => {
            if (item.renderAs) {
                if (item.renderAs === node) {
                    replacement = item;
                }
                else {
                    pending.push(item);
                }
                item = item.renderAs as T;
            }
            const input = <HTMLInputElement> item.element;
            return input.type === 'radio' && input.name === element.name && !item.rendered ? item : undefined;
        }) as T[];
        if (children.length > 1) {
            const controller = this.application.controllerHandler;
            const container = controller.createNodeGroup(node, children, parent, replacement);
            container.alignmentType |= $enum.NODE_ALIGNMENT.HORIZONTAL | (parent.length !== children.length ? $enum.NODE_ALIGNMENT.SEGMENTED : 0);
            if (parent.layoutConstraint) {
                container.companion = replacement || node;
            }
            container.setControlType('RadioGroup', CONTAINER_NODE.INLINE);
            container.inherit(node, 'alignment');
            container.css('verticalAlign', 'text-bottom');
            container.each((item: T, index) => {
                if (item !== node) {
                    item.setControlType(CONTAINER_ANDROID.RADIO, CONTAINER_NODE.RADIO);
                }
                item.positioned = true;
                item.parent = container;
                item.siblingIndex = index;
            });
            for (const item of pending) {
                item.hide();
            }
            container.android('orientation', $NodeList.linearX(children) ? AXIS_ANDROID.HORIZONTAL : AXIS_ANDROID.VERTICAL);
            container.render(target ? this.application.resolveTarget(target, container) : parent);
            this.subscribers.add(container);
            const outputAs = controller.getEnclosingTag(
                'RadioGroup',
                container.id,
                target ? -1 : container.renderDepth, $xml.formatPlaceholder(container.id)
            );
            return {
                output: '',
                complete: true,
                parent: container,
                renderAs: container,
                outputAs
            };
        }
        return { output: '' };
    }

    public postBaseLayout(node: T) {
        node.some((item: T) => {
            if ((<HTMLInputElement> item.element).checked) {
                node.android('checkedButton', item.documentId);
                return true;
            }
            return false;
        });
    }
}