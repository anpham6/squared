interface ChromeUserSettings extends UserSettings {
    excludePlainText: boolean;
    outputFileExclusions: string[];
}

interface FileUniversalAttribute {
    saveAsWebPage?: boolean;
    productionRelease?: boolean;
    removeUnusedStyles?: boolean;
}

interface ChromeFileActionOptions extends squared.base.FileActionOptions, FileActionAttribute, FileUniversalAttribute {}

interface ChromeFileCopyingOptions extends squared.base.FileCopyingOptions, ChromeFileActionOptions {}

interface ChromeFileArchivingOptions extends squared.base.FileArchivingOptions, ChromeFileActionOptions {}

interface NodeOptions {
    element: Element;
}