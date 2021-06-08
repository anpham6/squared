interface FileActionOptions extends squared.FileActionOptions, FileActionAttribute, FileRequestAttribute {
    sessionId?: string;
    resourceId?: number;
    assetMap?: ElementAssetMap;
    appendMap?: AppendAssetMap;
    nodeMap?: Map<XmlNode, HTMLElement>;
}

interface FileCopyingOptions extends squared.base.FileCopyingOptions, FileActionOptions {}

interface FileArchivingOptions extends squared.base.FileArchivingOptions, FileActionOptions {}

interface SaveAsOptions extends OutputCommand, OutputModifiers {
    customize?: (uri: string, mimeType: string, command: OutputCommand) => Optional<string>;
}

interface UriOptions {
    saveAs?: string;
    saveTo?: boolean;
    format?: string;
    mimeType?: string;
    preserveCrossOrigin?: boolean;
    fromConfig?: boolean;
}