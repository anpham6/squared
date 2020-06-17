import Extension from '../../extension';

const { safeNestedArray } = squared.lib.util;

export default class Brotli<T extends squared.base.NodeElement> extends Extension<T> {
    public readonly options: CompressOptions = {
        mimeTypes: ['text/css', 'text/javascript', 'text/plain', 'text/csv', 'text/vtt', 'application/json', 'application/javascript', 'application/ld+json', 'application/xml'],
        largerThan: 0,
        smallerThan: Infinity,
        whenSmaller: true,
        level: 11
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
            safeNestedArray(data as StandardMap, 'compress').push({ format: 'br', level: this.options.level, condition: Extension.getCompressOptions(this.options) });
            return true;
        }
        return false;
    }
}