import { ChromeAsset } from '../../@types/chrome/file';

export default abstract class Extension<T extends chrome.base.View> extends squared.base.Extension<T> implements chrome.base.Extension<T> {
    public application!: chrome.base.Application<T>;

    public processFile(data: ChromeAsset, override = false) {
        return false;
    }
}