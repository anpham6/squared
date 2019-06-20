import { ChromeAsset } from '../../@types/application';
import { CompressOptions } from '../../@types/extension';

import Extension from '../../extension';
import View from '../../view';

export default class Gzip<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        quality: 9,
        fileExtensions: ['js', 'css', 'json', 'svg']
    };

    public processFile(data: ChromeAsset) {
        if (data.extension) {
            const options = this.options;
            if (options.fileExtensions.includes(data.extension)) {
                data.gzipQuality = Math.min(options.quality, 9);
                return true;
            }
        }
        return false;
    }
}