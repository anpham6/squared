interface Document {
    adoptedStyleSheets?: CSSStyleSheet[];
}

interface ShadowRoot {
    adoptedStyleSheets?: CSSStyleSheet[];
}

interface CSSStyleSheet {
    replaceSync?: (value: string) => void;
}

interface HTMLSourceElement {
    width?: number;
    height?: number;
}

interface CSSStyleDeclaration {
    counterSet: string;
}