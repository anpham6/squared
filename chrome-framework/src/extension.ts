import type { ChromeAsset } from '../../@types/chrome/application';

export default abstract class Extension<T extends chrome.base.View> extends squared.base.Extension<T> implements chrome.base.Extension<T> {
    public application!: chrome.base.Application<T>;

    public processFile(data: ChromeAsset) {
        return false;
    }
}