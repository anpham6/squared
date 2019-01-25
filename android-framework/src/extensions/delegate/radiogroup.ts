import { ExtensionResult } from '../../../../src/base/@types/application';

import View from '../../view';

import { AXIS_ANDROID, CONTAINER_ANDROID } from '../../lib/constant';
import { CONTAINER_NODE } from '../../lib/enumeration';

import $NodeList = squared.base.NodeList;

const $enum = squared.base.lib.enumeration;
const $util = squared.lib.util;
const $xml = squared.lib.xml;

const RADIO_GROUP = 'RadioGroup';

export default class ScrollView<T extends View> extends squared.base.Extension<T> {
    public condition(node: T) {
        const element = <HTMLInputElement> node.element;
        return element.tagName === 'INPUT' && element.type === 'radio' && $util.hasValue(element.name);
    }

    public processNode(node: T, parent: T): ExtensionResult<T> {
        const target = $util.hasValue(node.dataset.target) && !$util.hasValue(node.dataset.use);
        const element = <HTMLInputElement> node.element;
        const pending: T[] = [];
        let replaceWith: T | undefined;
        const children = parent.flatMap((item: T) => {
            if (item.renderAs) {
                if (item.renderAs === node) {
                    replaceWith = item;
                }
                else {
                    pending.push(item);
                }
                item = item.renderAs as T;
            }
            const input = <HTMLInputElement> item.element;
            if (input.type === 'radio' && input.name === element.name && !item.rendered) {
                return item;
            }
            return null;
        }) as T[];
        if (children.length > 1) {
            const container = this.application.controllerHandler.createNodeGroup(node, children, parent, replaceWith);
            container.alignmentType |= $enum.NODE_ALIGNMENT.HORIZONTAL | (parent.length !== children.length ? $enum.NODE_ALIGNMENT.SEGMENTED : 0);
            if (parent.layoutConstraint) {
                container.companion = replaceWith || node;
            }
            container.setControlType(RADIO_GROUP, CONTAINER_NODE.INLINE);
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
            pending.forEach(item => item.hide());
            container.android('orientation', $NodeList.linearX(children) ? AXIS_ANDROID.HORIZONTAL : AXIS_ANDROID.VERTICAL);
            container.render(target ? container : parent);
            this.subscribers.add(container);
            const outputAs = this.application.controllerHandler.getEnclosingTag(
                RADIO_GROUP,
                container.id,
                target ? -1 : container.renderDepth, $xml.formatPlaceholder(container.id)
            );
            return { output: '', complete: true, parent: container, renderAs: container, outputAs };
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