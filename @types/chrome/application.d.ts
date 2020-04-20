import * as application from '../base/application';

export interface UserSettings extends application.UserSettings {
    compressImages: boolean;
    excludePlainText: boolean;
    outputFileExclusions: string[];
}

export interface NodeOptions {
    element: Element;
}