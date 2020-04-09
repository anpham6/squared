import { ChromeAsset } from '../../../../@types/chrome/file';
import { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

const { safeNestedArray } = squared.lib.util;

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
                safeNestedArray(<StandardMap> data, 'compress').push({ format: 'br', level });
                return true;
            }
        }
        return false;
    }
}