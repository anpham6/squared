import Extension from '../extension';
import Node from '../node';

import $dom = squared.lib.dom;

export default abstract class External<T extends Node> extends Extension<T> {
    public beforeInit(element: HTMLElement, internal = false) {
        if (internal || this.included(element)) {
            if (!$dom.getElementCache(element, 'squaredExternalDisplay')) {
                const display: string[] = [];
                let current: HTMLElement | null = <HTMLElement> element;
                while (current) {
                    display.push($dom.getStyle(current).display as string);
                    current.style.display = 'block';
                    current = current.parentElement;
                }
                $dom.setElementCache(element, 'squaredExternalDisplay', display);
            }
        }
    }

    public init(element: HTMLElement) {
        if (this.included(element)) {
            this.application.parseElements.add(element);
        }
        return false;
    }

    public afterInit(element: HTMLElement, internal = false) {
        if (internal || this.included(element)) {
            const data = $dom.getElementCache(element, 'squaredExternalDisplay');
            if (data) {
                const display: string[] = data;
                let current: HTMLElement | null = element;
                let i = 0;
                while (current) {
                    current.style.display = display[i];
                    current = current.parentElement;
                    i++;
                }
                $dom.deleteElementCache(element, 'squaredExternalDisplay');
            }
        }
    }
}