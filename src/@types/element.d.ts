interface BoxRect {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface RectPosition extends BoxRect {
    topAsPercent: number;
    rightAsPercent: number;
    bottomAsPercent: number;
    leftAsPercent: number;
    horizontal: string;
    vertical: string;
    orientation: string[];
}

interface BoxRectDimension extends BoxRect, Dimension {
    numberOfLines?: number;
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
    borderTopWidth?: number;
    borderRightWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
}

interface Flexbox {
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
    color: string;
}

interface FontAttribute {
    fontFamily: string;
    fontStyle: string;
    fontSize: string;
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

interface BoxStyle extends Optional<BoxBorder> {
    backgroundColor: string;
    backgroundSize: string;
    backgroundRepeat: string;
    backgroundPositionX: string;
    backgroundPositionY: string;
    backgroundClip?: BoxRect;
    border?: BorderAttribute;
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
    horizontal: boolean;
}

interface LinearGradient extends RepeatingGradient {
    angle: number;
    angleExtent: Point;
}

interface RadialGradient extends RepeatingGradient {
    shape: string;
    center: RectPosition;
    radius: number;
    radiusExtent: number;
    closestSide: number;
    farthestSide: number;
    closestCorner: number;
    farthestCorner: number;
}

interface ConicGradient extends Gradient {
    angle: number;
    center: RectPosition;
}

interface ColorStop {
    color: ColorData;
    offset: number;
}

interface ImageSrcSet {
    src: string;
    width: number;
    pixelRatio: number;
    actualWidth?: number;
}

type CSSRuleData = Map<string, ObjectMap<StringMap>>;