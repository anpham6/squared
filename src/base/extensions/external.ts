import ExtensionUI from '../extension-ui';
import NodeUI from '../node-ui';

const $css = squared.lib.css;
const $session = squared.lib.session;

export default abstract class External<T extends NodeUI> extends ExtensionUI<T> {
    public beforeInit(element: HTMLElement, internal = false) {
        if (internal || this.included(element)) {
            if (!$session.getElementCache(element, 'squaredExternalDisplay', this.application.processing.sessionId)) {
                const display: string[] = [];
                let current: HTMLElement | null = <HTMLElement> element;
                while (current) {
                    display.push($css.getStyle(current).getPropertyValue('display'));
                    current.style.setProperty('display', 'block');
                    current = current.parentElement;
                }
                $session.setElementCache(element, 'squaredExternalDisplay', this.application.processing.sessionId, display);
            }
        }
    }

    public init(element: HTMLElement) {
        if (this.included(element)) {
            this.application.rootElements.add(element);
        }
        return false;
    }

    public afterInit(element: HTMLElement, internal = false) {
        if (internal || this.included(element)) {
            const display: string[] = $session.getElementCache(element, 'squaredExternalDisplay', this.application.processing.sessionId);
            if (Array.isArray(display)) {
                let current: HTMLElement | null = element;
                let i = 0;
                while (current) {
                    current.style.setProperty('display', display[i]);
                    current = current.parentElement;
                    i++;
                }
                $session.deleteElementCache(element, 'squaredExternalDisplay', this.application.processing.sessionId);
            }
        }
    }
}