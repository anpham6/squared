import type NodeUI from '../node-ui';

import ExtensionUI from '../extension-ui';

export default abstract class Accessibility<T extends NodeUI> extends ExtensionUI<T> {}