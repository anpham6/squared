import Extension from '../../extension';

const { safeNestedArray } = squared.lib.util;

export default class Png<T extends squared.base.NodeElement> extends Extension<T> {
    public readonly options: CompressOptions = {
        mimeTypes: ['image/png'],
        largerThan: 0,
        smallerThan: Infinity,
        whenSmaller: true
    };

    public processFile(data: ChromeAsset, override = false) {
        if (!override) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                override = mimeType.includes('png:') || mimeTypes === '*' && mimeType.includes('image/') || Array.isArray(mimeTypes) && !!mimeTypes.find(value => mimeType.endsWith(value));
            }
        }
        if (override) {
            safeNestedArray(data as StandardMap, 'compress').push({ format: 'png', condition: Extension.getCompressOptions(this.options) });
            return true;
        }
        return false;
    }
}