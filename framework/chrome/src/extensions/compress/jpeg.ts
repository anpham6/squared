import Extension from '../../extension';

const { safeNestedArray } = squared.lib.util;

export default class Jpeg<T extends squared.base.NodeElement> extends Extension<T> {
    public readonly options: CompressOptions = {
        mimeTypes: ['image/jpeg'],
        largerThan: 0,
        smallerThan: Infinity,
        whenSmaller: true,
        level: 100
    };

    public processFile(data: ChromeAsset, override?: boolean) {
        if (!override) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                override = mimeType.includes('jpeg:') || mimeTypes === '*' && mimeType.includes('image/') || Array.isArray(mimeTypes) && !!mimeTypes.find(value => mimeType.endsWith(value));
            }
        }
        if (override) {
            safeNestedArray(data as StandardMap, 'compress').push({ format: 'png', condition: Extension.getCompressOptions(this.options) }, { format: 'jpeg', level: this.options.level });
            return true;
        }
        return false;
    }
}