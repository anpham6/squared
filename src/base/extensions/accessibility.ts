import { AccessibilityOptions } from '../../../@types/base/extension';

import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

export default abstract class Accessibility<T extends NodeUI> extends ExtensionUI<T> {
    public readonly options: AccessibilityOptions = {
        showLabel: false
    };
}