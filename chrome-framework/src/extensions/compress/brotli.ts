import { RequestAsset } from '../../../../@types/chrome/file';
import { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

type View = chrome.base.View;

const { safeNestedArray } = squared.lib.util;

export default class Brotli<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        level: 11,
        mimeTypes: ['text/css', 'text/javascript', 'text/plain', 'text/csv', 'application/json', 'application/javascript', 'application/ld+json', 'application/xml']
    };

    public processFile(data: RequestAsset, override = false) {
        if (!override) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                override = mimeTypes === "*" || mimeTypes.includes(mimeType);
            }
        }
        if (override) {
            safeNestedArray(<StandardMap> data, 'compress').push({ format: 'br', level: this.options.level });
            return true;
        }
        return false;
    }
}