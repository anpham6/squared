type CSSElement = HTMLElement | SVGElement;
type PositionAttr = "top" | "right" | "bottom" | "left";
type DimensionAttr = "width" | "height";

interface BoxRect {
    top: number;
    right: number;
    bottom: number;
    left: number;
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
    color: string;
    backgroundColor?: string;
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
    backgroundColor?: string;
    backgroundClip?: BoxRect;
    backgroundOrigin?: BoxRect;
    borderRadius?: string[];
    outline?: BorderAttribute;
    backgroundImage?: (string | Gradient)[];
}

interface Gradient {
    type: string;
    colorStops: ColorStop[];
    dimension?: Dimension;
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
    valueAsRGBA: string;
    valueAsARGB: string;
    rgba: RGBA;
    hsl: HSL;
    opacity: number;
    transparent: boolean;
}

interface ColorResult extends StringValue {
    rgb: RGB;
    hsl: HSL;
}

interface ColorStop {
    color: ColorData;
    offset: number;
}