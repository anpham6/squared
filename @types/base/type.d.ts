type BoxType = "bounds" | "box" | "linear";
type OrientationAttr = "horizontal" | "vertical";
type ResourceAssetType = "image" | "audio" | "video" | "fonts" | "rawData";
type KeyframesMap = Map<string, KeyframeData>;
type FileActionResult = Promise<Void<ResultOfFileAction>>;