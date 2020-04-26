import { ChromeAsset } from '../../../../@types/chrome/file';
import { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

const { safeNestedArray } = squared.lib.util;

type View = chrome.base.View;

export default class Jpeg<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        level: 100,
        mimeTypes: ['image/jpeg']
    };

    public processFile(data: ChromeAsset) {
        const mimeType = data.mimeType;
        if (mimeType) {
            const { level, mimeTypes } = this.options;
            if (/^[@%]jpeg:/.test(mimeType) || Array.isArray(mimeTypes) && mimeTypes.find(value => mimeType.endsWith(value)) || mimeTypes === '*' && mimeType.includes('image/')) {
                safeNestedArray(<StandardMap> data, 'compress').push({ format: 'png' }, { format: 'jpeg', level });
                return true;
            }
        }
        return false;
    }
}