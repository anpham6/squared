import { RequestAsset } from '../../../../@types/chrome/file';
import { ConvertOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

type View = chrome.base.View;

export default class Png<T extends View> extends Extension<T> {
    public readonly options: ConvertOptions = {
        mimeTypes: ['image/jpeg', 'image/bmp', 'image/gif', 'image/tiff'],
        greaterThan: 0,
        smallerThan: Infinity,
        whenSmaller: false,
        replaceWith: true
    };

    public processFile(data: RequestAsset, override = false) {
        const mimeType = data.mimeType;
        if (mimeType && !/png[(%@:]/.test(mimeType)) {
            const mimeTypes = this.options.mimeTypes;
            if (override || Array.isArray(mimeTypes) && mimeTypes.find(value => mimeType.endsWith(value))) {
                data.mimeType = Extension.getConvertOptions('png', this.options) + mimeType;
                return true;
            }
        }
        return false;
    }
}