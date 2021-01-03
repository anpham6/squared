type StyleElement = HTMLElement | SVGElement;
type DocumentElement = HTMLElement | SVGSVGElement;
type DocumentRoot = Document | ShadowRoot;
type DocumentQueryRoot = DocumentRoot | HTMLElement;
type PositionAttr = "top" | "right" | "bottom" | "left";
type PositionDirectionAttr = "start" | "end";
type PositionAllAttr = PositionAttr | PositionDirectionAttr;
type DimensionAttr = "width" | "height";
type PseudoElt = "::before" | "::after" | "::first-letter" | "::first-line";
type CssStyleMap = Partial<MapOfType<CSSStyleDeclaration, string, string>>;
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

interface BorderAttribute {
    width: string;
    style: string;
    color: ColorData;
}

interface FontAttribute {
    fontFamily: string;
    fontStyle: string;
    fontSize: number;
    fontWeight: string;
    color: Null<ColorData>;
    backgroundColor?: ColorData;
}

interface BoxBorder {
    borderTop: BorderAttribute;
    borderRight: BorderAttribute;
    borderBottom: BorderAttribute;
    borderLeft: BorderAttribute;
}

interface BoxStyle extends Partial<BoxBorder> {
    backgroundSize: string;
    backgroundRepeat: string;
    backgroundPositionX: string;
    backgroundPositionY: string;
    backgroundColor?: ColorData;
    backgroundClip?: BoxRect;
    backgroundOrigin?: BoxRect;
    borderRadius?: string[];
    outline?: BorderAttribute;
    backgroundImage?: (string | Gradient)[];
}

interface Gradient {
    type: string;
    colorStops: ColorStop[];
    dimension: Null<Dimension>;
}

interface RepeatingGradient extends Gradient {
    repeating: boolean;
}

interface LinearGradient extends RepeatingGradient {
    angle: number;
    angleExtent: Point;
}

interface RadialGradient extends RepeatingGradient {
    shape: string;
    center: BoxRectPosition;
    radius: number;
    radiusExtent: number;
    closestSide: number;
    farthestSide: number;
    closestCorner: number;
    farthestCorner: number;
}

interface ConicGradient extends Gradient {
    angle: number;
    center: BoxRectPosition;
}

interface ImageSrcSet {
    src: string;
    width: number;
    pixelRatio: number;
    actualWidth?: number;
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

interface ColorStop {
    color: ColorData;
    offset: number;
}