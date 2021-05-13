type DocumentRoot = Document | ShadowRoot;
type DocumentElement = HTMLElement | SVGSVGElement;
type QuerySelectorElement = DocumentRoot | DocumentElement;
type StyleElement = HTMLElement | SVGElement;
type SrcElement = HTMLInputElement | HTMLVideoElement | HTMLAudioElement | HTMLEmbedElement | HTMLSourceElement | HTMLIFrameElement | HTMLTrackElement;
type DimensionElement = HTMLImageElement | HTMLObjectElement | HTMLCanvasElement | SVGSVGElement | Exclude<SrcElement, HTMLTrackElement>;
type PositionAttr = "top" | "right" | "bottom" | "left";
type PositionDirectionAttr = "start" | "end";
type PositionAllAttr = PositionAttr | PositionDirectionAttr;
type DimensionAttr = "width" | "height";
type PseudoElt = "::before" | "::after" | "::first-letter" | "::first-line" | "::marker";
type CssStyleMap = Partial<MapOfType<CSSStyleDeclaration, CssStyleAttr, string>>;
type CssStyleAttr = KeyOfType<CSSStyleDeclaration, string, string>;

interface BoxRect<T = number> {
    top: T;
    right: T;
    bottom: T;
    left: T;
}

interface BoxRectDimension extends BoxRect, Dimension {
    numberOfLines?: number;
    overflow?: boolean;
}

interface BoxRectPosition extends BoxRect {
    static: boolean;
    topAsPercent: number;
    rightAsPercent: number;
    bottomAsPercent: number;
    leftAsPercent: number;
    horizontal: string;
    vertical: string;
    orientation: string[];
}

interface BoxMargin {
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
}

interface BoxPadding {
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
}

interface BoxModel extends BoxMargin, BoxPadding {
    borderTopWidth: number;
    borderRightWidth: number;
    borderBottomWidth: number;
    borderLeftWidth: number;
}

interface FlexData {
    row?: boolean;
    column?: boolean;
    reverse?: boolean;
    wrap?: boolean;
    wrapReverse?: boolean;
    alignContent?: string;
    justifyContent?: string;
}

interface FlexBox {
    alignSelf: string;
    justifySelf: string;
    basis: string;
    grow: number;
    shrink: number;
    order: number;
}

interface ColorData extends StringValue {
    rgba: RGBA;
    hsla: HSLA;
    valueAsRGBA: string;
    valueAsARGB: string;
    rgbaAsString: string;
    hslaAsString: string;
    grayscale: boolean;
    opacity: number;
    transparent: boolean;
    nearest: ColorData;
    lighten(percent: number): ColorData;
    darken(percent: number): ColorData;
}

interface ImageSrcData {
    src: string;
    width: number;
    pixelRatio: number;
    actualWidth?: number;
    aspectRatio?: number;
}