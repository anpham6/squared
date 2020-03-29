import type { ChromeAsset } from '../../../../@types/chrome/application';
import type { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

type View = android.base.View;

export default class Brotli<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        level: 11,
        fileExtensions: ['js', 'css', 'json', 'svg']
    };

    public processFile(data: ChromeAsset) {
        const extension = data.extension;
        if (extension) {
            const { level, fileExtensions  } = this.options;
            if (fileExtensions === "*" || fileExtensions.includes(extension)) {
                let compress = data.compress;
                if (compress === undefined)  {
                    compress = [];
                    data.compress = compress;
                }
                compress.push({ format: 'br', level });
                return true;
            }
        }
        return false;
    }
}