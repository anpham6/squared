interface Document {
    adoptedStyleSheets: CSSStyleSheet[];
}

interface ShadowRoot {
    adoptedStyleSheets: CSSStyleSheet[];
}

interface CSSStyleSheet {
    replaceSync: (value: string) => void;
}