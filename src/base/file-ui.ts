import { UserUISettings } from '../../@types/base/application';

import File from './file';

export default abstract class FileUI<T extends squared.base.NodeUI> extends File<T> implements squared.base.FileUI<T> {
    public abstract resource: squared.base.ResourceUI<T>;

    public abstract get userSettings(): UserUISettings;

    get directory() {
        return this.resource.controllerSettings.directory;
    }
}