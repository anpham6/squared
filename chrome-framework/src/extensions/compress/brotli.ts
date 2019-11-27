import { ChromeAsset } from '../../../../@types/chrome/application';
import { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';
import View from '../../view';

export default class Brotli<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        quality: 11,
        fileExtensions: ['js', 'css', 'json', 'svg']
    };

    public processFile(data: ChromeAsset) {
        const extension = data.extension;
        if (extension) {
            const options = this.options;
            if (options.fileExtensions.includes(extension)) {
                data.brotliQuality = Math.min(options.quality, 11);
                return true;
            }
        }
        return false;
    }
}