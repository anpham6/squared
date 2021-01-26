type BoxType = "bounds" | "box" | "linear";
type OrientationAttr = "horizontal" | "vertical";
type FloatDirectionAttr = "left" | "right" | "none";
type AnchorPositionAttr = PositionAttr | "baseline" | "leftRight" | "rightLeft" | "topBottom" | "bottomTop" | "centerHorizontal" | "centerVertical";
type ResourceAssetType = "image" | "video" | "audio" | "fonts" | "rawData";
type ResourceAssetTagName = "video" | "audio" | "object" | "embed" | "iframe";
type KeyframesMap = Map<string, KeyframeData>;
type AttributeMap = ObjectMap<Optional<string>>;