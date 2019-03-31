import Extension from '../extension';
import Node from '../node';

const $css = squared.lib.css;
const $dom = squared.lib.dom;

export default abstract class External<T extends Node> extends Extension<T> {
    public beforeInit(element: HTMLElement, internal = false) {
        if (internal || this.included(element)) {
            if (!$dom.getElementCache(element, 'squaredExternalDisplay', this.application.processing.cacheIndex)) {
                const display: string[] = [];
                let current: HTMLElement | null = <HTMLElement> element;
                while (current) {
                    display.push($css.getStyle(current).display as string);
                    current.style.display = 'block';
                    current = current.parentElement;
                }
                $dom.setElementCache(element, 'squaredExternalDisplay', this.application.processing.cacheIndex, display);
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
            const display: string[] = $dom.getElementCache(element, 'squaredExternalDisplay', this.application.processing.cacheIndex);
            if (Array.isArray(display)) {
                let current: HTMLElement | null = element;
                let i = 0;
                while (current) {
                    current.style.display = display[i];
                    current = current.parentElement;
                    i++;
                }
                $dom.deleteElementCache(element, 'squaredExternalDisplay', this.application.processing.cacheIndex);
            }
        }
    }
}