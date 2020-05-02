import { RequestAsset } from '../../../../@types/chrome/file';
import { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

type View = chrome.base.View;

const { safeNestedArray } = squared.lib.util;

export default class Jpeg<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        level: 100,
        mimeTypes: ['image/jpeg']
    };

    public processFile(data: RequestAsset, override = false) {
        if (!override) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                override = /[@%]jpeg:/.test(mimeType) || Array.isArray(mimeTypes) && !!mimeTypes.find(value => mimeType.endsWith(value)) || mimeTypes === '*' && mimeType.includes('image/');
            }
        }
        if (override) {
            safeNestedArray(<StandardMap> data, 'compress').push({ format: 'png' }, { format: 'jpeg', level: this.options.level });
            return true;
        }
        return false;
    }
}