import { RequestAsset } from '../../../../@types/chrome/file';
import { ConvertOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

type View = chrome.base.View;

export default class Png<T extends View> extends Extension<T> {
    public readonly options: ConvertOptions = {
        mimeTypes: ['image/jpeg', 'image/bmp', 'image/gif', 'image/tiff'],
        replaceWith: true,
        pickSmaller: false
    };

    public processFile(data: RequestAsset, override = false) {
        const mimeType = data.mimeType;
        if (mimeType?.includes('png:') === false) {
            const options = this.options;
            if (override || options.mimeTypes.find(value => mimeType.endsWith(value))) {
                let command = '';
                if (options.replaceWith) {
                    command = '@';
                }
                else if (options.pickSmaller) {
                    command = '%';
                }
                data.mimeType = command + 'png:' + mimeType;
                return true;
            }
        }
        return false;
    }
}