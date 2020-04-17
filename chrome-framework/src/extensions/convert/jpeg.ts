import { ChromeAsset } from '../../../../@types/chrome/file';
import { ConvertOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

type View = android.base.View;

export default class Jpeg<T extends View> extends Extension<T> {
    public readonly options: ConvertOptions = {
        mimeTypes: ['image/png', 'image/bmp', 'image/gif', 'image/tiff'],
        replaceWith: true,
        pickSmaller: false
    };

    public processFile(data: ChromeAsset) {
        const mimeType = data.mimeType;
        if (mimeType) {
            const options = this.options;
            if (options.mimeTypes.includes(mimeType)) {
                let command = '';
                if (options.replaceWith) {
                    command = '@';
                }
                else if (options.pickSmaller) {
                    command = '%';
                }
                data.mimeType = command + 'jpeg:' + mimeType;
                return true;
            }
        }
        return false;
    }
}