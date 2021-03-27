interface Document {
    adoptedStyleSheets: CSSStyleSheet[];
}

interface CSSStyleSheet {
    replaceSync: (value: string) => void;
}