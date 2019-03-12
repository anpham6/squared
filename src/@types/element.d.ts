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
}

interface RectDimension extends BoxRect, Dimension {
}

interface TextDimension extends RectDimension {
    multiline: number;
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
    order: number;
    wrap: string;
    direction: string;
    alignSelf: string;
    justifyContent: string;
    basis: string;
    grow: number;
    shrink: number;
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

interface BoxStyle extends BoxBorder {
    border?: BorderAttribute;
    borderRadius?: string[];
    backgroundImage?: (string | Gradient)[];
    backgroundColor: string;
    backgroundSize: string;
    backgroundRepeat: string;
    backgroundPositionX: string;
    backgroundPositionY: string;
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

type CSSRuleData = Map<string, ObjectMap<StringMap>>;