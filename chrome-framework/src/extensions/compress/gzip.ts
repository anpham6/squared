import Extension from '../../extension';

type View = chrome.base.View;

const { safeNestedArray } = squared.lib.util;

export default class Gzip<T extends View> extends Extension<T> {
    public readonly options: CompressOptions = {
        mimeTypes: ['text/css', 'text/javascript', 'text/plain', 'text/csv', 'application/json', 'application/javascript', 'application/ld+json', 'application/xml'],
        largerThan: 0,
        smallerThan: Infinity,
        whenSmaller: true,
        level: 9
    };

    public processFile(data: ChromeAsset, override = false) {
        if (!override) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                override = mimeTypes === "*" || Array.isArray(mimeTypes) && mimeTypes.includes(mimeType);
            }
        }
        if (override) {
            safeNestedArray(data as StandardMap, 'compress').push({ format: 'gz', level: this.options.level, condition: Extension.getCompressOptions(this.options) });
            return true;
        }
        return false;
    }
}