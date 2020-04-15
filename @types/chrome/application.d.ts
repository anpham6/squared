import { UserSettings } from '../base/application';

export interface UserSettingsChrome extends UserSettings {
    compressImages: boolean;
    excludePlainText: boolean;
    outputFileExclusions: string[];
}

export interface NodeOptionsChrome {
    element: Element;
}