import { UserSettings } from '../../@types/base/application-ui';

import File from './file';

export default abstract class FileUI<T extends squared.base.NodeUI> extends File<T> implements squared.base.FileUI<T> {
    public abstract resource: squared.base.ResourceUI<T>;

    public abstract get userSettings(): UserSettings;

    get directory() {
        return this.resource.controllerSettings.directory;
    }
}