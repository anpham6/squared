import { UserSettings } from '../../../src/base/@types/application';

export interface UserSettingsAndroid extends UserSettings {
    targetAPI: number;
    supportRTL: boolean;
    ellipsisOnTextOverflow: boolean;
    collapseUnattributedElements: boolean;
    customizationsOverwritePrivilege: boolean;
    convertPixels: string;
    showAttributes: boolean;
}