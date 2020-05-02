
import { FileActionAttribute } from './file';

import * as application from '../base/application';

export interface UserSettings extends application.UserSettings {
    excludePlainText: boolean;
    outputFileExclusions: string[];
}

export interface NodeOptions {
    element: Element;
}

export interface FileOutputAttribute {
    productionRelease?: boolean;
}

export interface FileCopyingOptions extends application.FileCopyingOptions, FileActionAttribute, FileOutputAttribute {}

export interface FileArchivingOptions extends application.FileArchivingOptions, FileActionAttribute, FileOutputAttribute {
    saveAsWebPage?: boolean;
}