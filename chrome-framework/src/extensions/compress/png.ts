import { ChromeAsset } from '../../../../@types/chrome/file';
import { CompressOptions } from '../../../../@types/chrome/extension';

import Extension from '../../extension';

type View = chrome.base.View;

const { safeNestedArray } = squared.lib.util;

export default class Png<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        mimeTypes: ['image/png']
    };

    public processFile(data: ChromeAsset, override = false) {
        if (!override) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                override = /[@%]png:/.test(mimeType) || Array.isArray(mimeTypes) && !!mimeTypes.find(value => mimeType.endsWith(value)) || mimeTypes === '*' && mimeType.includes('image/');
            }
        }
        if (override) {
            safeNestedArray(<StandardMap> data, 'compress').push({ format: 'png' });
            return true;
        }
        return false;
    }
}