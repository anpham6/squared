import { RequestAsset } from '../../../../@types/chrome/file';
import { ConvertOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

type View = chrome.base.View;

export default class Tiff<T extends View> extends Extension<T> {
    public readonly options: ConvertOptions = {
        mimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'],
        replaceWith: true,
        pickSmaller: false
    };

    public processFile(data: RequestAsset, override = false) {
        const mimeType = data.mimeType;
        if (mimeType?.includes('tiff:') === false) {
            const options = this.options;
            if (override || options.mimeTypes.find(value => mimeType.endsWith(value))) {
                let command = '';
                if (options.replaceWith) {
                    command = '@';
                }
                else if (options.pickSmaller) {
                    command = '%';
                }
                data.mimeType = command + 'tiff:' + mimeType;
                return true;
            }
        }
        return false;
    }
}