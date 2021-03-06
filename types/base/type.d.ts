type BoxType = "bounds" | "box" | "linear";
type OrientationAttr = "horizontal" | "vertical";
type FloatDirectionAttr = "left" | "right" | "none";
type AnchorPositionAttr = PositionAttr | "baseline" | "leftRight" | "rightLeft" | "topBottom" | "bottomTop" | "centerHorizontal" | "centerVertical";
type DimensionSizableAttr = DimensionAttr | "minWidth" | "minHeight" | "maxWidth" | "maxHeight";
type ResourceAssetType = ResourceRawAsset | "image" | "fonts" | "rawData";
type ResourceAssetTagName = ResourceRawAsset | "object" | "embed" | "iframe";
type ResourceRawAsset = "video" | "audio";
type ResourceSessionAsset = Optional<ResourceAssetMap>[];
type ResourceSessionStored<T = ResourceStoredMap> = Optional<T>[];
type WatchValue = boolean | WatchInterval;
type KeyframesMap = Map<string, KeyframeData>;
type AttributeMap = ObjectMap<Optional<string>>;