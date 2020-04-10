import { ChromeAsset } from '../../../../@types/chrome/file';
import { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

const { safeNestedArray } = squared.lib.util;

type View = android.base.View;

export default class Brotli<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        level: 11,
        mimeTypes: ['text/css', 'text/javascript', 'text/plain', 'text/csv', 'application/json', 'application/javascript', 'application/ld+json', 'application/xml']
    };

    public processFile(data: ChromeAsset) {
        const mimeType = data.mimeType;
        if (mimeType) {
            const { level, mimeTypes  } = this.options;
            if (mimeTypes === "*" || mimeTypes.includes(mimeType)) {
                safeNestedArray(<StandardMap> data, 'compress').push({ format: 'br', level });
                return true;
            }
        }
        return false;
    }
}