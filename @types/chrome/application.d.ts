
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
    saveAsWebPage?: boolean;
    productionRelease?: boolean;
    removeUnusedStyles?: boolean;
}

export interface FileActionOptions extends application.FileActionOptions, FileActionAttribute, FileOutputAttribute {}

export interface FileCopyingOptions extends application.FileCopyingOptions, FileActionOptions {}

export interface FileArchivingOptions extends application.FileArchivingOptions, FileActionOptions {}