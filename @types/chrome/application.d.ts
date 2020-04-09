import { UserSettings } from '../base/application';

interface UserSettingsChrome extends UserSettings {
    compressImages: boolean;
    cacheQuerySelectorResultSet: boolean;
    excludePlainText: boolean;
    outputFileExclusions: string[];
}

interface NodeOptionsChrome {
    element: Element;
}