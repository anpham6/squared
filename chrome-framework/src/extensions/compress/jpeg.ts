import { RequestAsset } from '../../../../@types/chrome/file';
import { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

type View = chrome.base.View;

const { safeNestedArray } = squared.lib.util;

export default class Jpeg<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        mimeTypes: ['image/jpeg'],
        largerThan: 0,
        smallerThan: Infinity,
        whenSmaller: true,
        level: 100
    };

    public processFile(data: RequestAsset, override = false) {
        if (!override) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                override = mimeType.includes('jpeg:') || mimeTypes === '*' && mimeType.includes('image/') || Array.isArray(mimeTypes) && !!mimeTypes.find(value => mimeType.endsWith(value));
            }
        }
        if (override) {
            safeNestedArray(<StandardMap> data, 'compress').push({ format: 'png', condition: Extension.getCompressOptions(this.options) }, { format: 'jpeg', level: this.options.level });
            return true;
        }
        return false;
    }
}