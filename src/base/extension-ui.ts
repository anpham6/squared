import { ExtensionResult } from './@types/application';

import Extension from './extension';
import ApplicationUI from './application-ui';
import NodeUI from './node-ui';

const $css = squared.lib.css;
const $util = squared.lib.util;

export default abstract class ExtensionUI<T extends NodeUI> extends Extension<T> implements squared.base.ExtensionUI<T> {
    public static findNestedElement(element: Element | null, name: string) {
        if (element && $css.hasComputedStyle(element)) {
            for (let i = 0; i < element.children.length; i++) {
                const item = <HTMLElement> element.children[i];
                if ($util.includes(item.dataset.use, name)) {
                    return item;
                }
            }
        }
        return null;
    }

    public application!: ApplicationUI<T>;

    public condition(node: T, parent?: T) {
        if (node.styleElement) {
            return node.dataset.use ? this.included(<HTMLElement> node.element) : this.tagNames.length > 0;
        }
        return false;
    }

    public processNode(node: T, parent: T): ExtensionResult<T> | undefined {
        return undefined;
    }

    public processChild(node: T, parent: T): ExtensionResult<T> | undefined {
        return undefined;
    }

    public postBaseLayout(node: T) {}
    public postConstraints(node: T) {}
    public postOptimize(node: T) {}
    public postBoxSpacing(node: T) {}

    public afterBaseLayout() {}
    public afterConstraints() {}
    public afterResources() {}

    public beforeCascade() {}
    public afterFinalize() {}
}