import { ChromeAsset } from '../../../../@types/chrome/file';
import { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

const { safeNestedArray } = squared.lib.util;

type View = chrome.base.View;

export default class Png<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        mimeTypes: ['image/png']
    };

    public processFile(data: ChromeAsset) {
        const mimeType = data.mimeType;
        if (mimeType) {
            const mimeTypes = this.options.mimeTypes;
            if (mimeTypes === '*' && mimeType.startsWith('image/') || mimeTypes.includes(mimeType)) {
                safeNestedArray(<StandardMap> data, 'compress').push({ format: 'png' });
                return true;
            }
        }
        return false;
    }
}