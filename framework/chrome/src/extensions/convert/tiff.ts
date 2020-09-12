import Extension from '../../extension';

const { findSet } = squared.lib.util;

export default class Tiff<T extends squared.base.Node> extends Extension<T> {
    public readonly options: ConvertOptions = {
        mimeTypes: new Set(['image/png', 'image/jpeg', 'image/gif', 'image/bmp']),
        largerThan: 0,
        smallerThan: Infinity,
        whenSmaller: false,
        replaceWith: true
    };

    public processFile(data: ChromeAsset, override?: boolean) {
        const mimeType = data.mimeType;
        if (mimeType && !/tiff[(%@:]/.test(mimeType) && (override || findSet(this.options.mimeTypes, value => mimeType.endsWith(value)))) {
            data.mimeType = Extension.getConvertOptions('tiff', this.options) + mimeType;
            return true;
        }
        return false;
    }
}