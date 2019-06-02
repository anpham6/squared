import { UserSettings } from '../../../src/base/@types/application';

interface UserSettingsChrome extends UserSettings {
    excludeNonRenderedElements: boolean;
}