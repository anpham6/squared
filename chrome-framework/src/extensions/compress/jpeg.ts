import { ChromeAsset } from '../../../../@types/chrome/file';
import { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

const { safeNestedArray } = squared.lib.util;

type View = android.base.View;

export default class Jpeg<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        level: 100,
        mimeTypes: ['image/jpeg']
    };

    public processFile(data: ChromeAsset) {
        const mimeType = data.mimeType;
        if (mimeType) {
            const { level, mimeTypes } = this.options;
            if (mimeTypes === '*' && mimeType.startsWith('image/') || mimeTypes.includes(mimeType)) {
                safeNestedArray(<StandardMap> data, 'compress').push({ format: 'jpeg', level });
                return true;
            }
        }
        return false;
    }
}