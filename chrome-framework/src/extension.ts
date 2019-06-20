import { ChromeAsset } from './@types/application';

import Application from './application';
import View from './view';

export default abstract class Extension<T extends View> extends squared.base.Extension<T> implements chrome.base.Extension<T> {
    public application!: Application<T>;

    public processFile(data: ChromeAsset) {
        return false;
    }
}