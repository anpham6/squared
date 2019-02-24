interface BoxRect {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

interface RectPosition extends BoxRect {
    horizontal: string;
    vertical: string;
    originalX: string;
    originalY: string;
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
    backgroundColor: string;
}

interface BoxBorder {
    borderTop: BorderAttribute;
    borderRight: BorderAttribute;
    borderBottom: BorderAttribute;
    borderLeft: BorderAttribute;
}

interface BoxStyle extends BoxBorder {
    border?: BorderAttribute;
    background?: string;
    borderRadius?: string[];
    backgroundImage?: string[];
    backgroundGradient?: Gradient[];
    backgroundColor: string;
    backgroundSize: string;
    backgroundRepeat: string;
    backgroundPositionX: string;
    backgroundPositionY: string;
}

interface Gradient {
    type: string;
    colorStops: ColorStop[];
}

interface ColorStop {
    color: string;
    offset: string;
    opacity: number;
}

type CSSRuleData = Map<string, ObjectMap<StringMap>>;