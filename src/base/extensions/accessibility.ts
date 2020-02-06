import ExtensionUI from '../extension-ui';

type NodeUI = squared.base.NodeUI;

export default abstract class Accessibility<T extends NodeUI> extends ExtensionUI<T> {}