import { ControllerUISettings, FileAsset, UserUISettings } from './@types/application';

import File from './file';
import NodeUI from './node-ui';
import ResourceUI from './resource-ui';

export default abstract class FileUI<T extends NodeUI> extends File<T> implements squared.base.FileUI<T> {
    public appName = '';
    public resource!: ResourceUI<T>;

    constructor() {
        super();
    }

    public abstract saveAllToDisk(files?: FileAsset[]): void;
    public abstract get userSettings(): UserUISettings;

    get stored() {
        return this.resource.stored;
    }

    get directory() {
        return (<ControllerUISettings> this.resource.application.controllerHandler.localSettings).directory;
    }
}