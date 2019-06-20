import { ControllerUISettings, FileAsset, UserUISettings } from './@types/application';

import File from './file';

export default abstract class FileUI<T extends squared.base.NodeUI> extends File<T> implements squared.base.FileUI<T> {
    public appName = '';
    public abstract resource: squared.base.ResourceUI<T>;

    public abstract saveAllToDisk(files?: FileAsset[]): void;
    public abstract get userSettings(): UserUISettings;

    get directory() {
        return (<ControllerUISettings> this.resource.application.controllerHandler.localSettings).directory;
    }
}