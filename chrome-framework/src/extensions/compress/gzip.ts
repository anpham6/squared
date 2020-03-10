import type { ChromeAsset } from '../../../../@types/chrome/application';
import type { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

type View = android.base.View;

export default class Gzip<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        quality: 9,
        fileExtensions: ['js', 'css', 'json', 'svg']
    };

    public processFile(data: ChromeAsset) {
        const extension = data.extension;
        if (extension) {
            const options = this.options;
            if (options.fileExtensions.includes(extension)) {
                data.gzipQuality = Math.min(options.quality, 9);
                return true;
            }
        }
        return false;
    }
}