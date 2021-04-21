interface BorderAttribute {
    width: number;
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

interface ColorStop {
    color: ColorData;
    offset: number;
}