import Extension from '../../extension';

const { findSet } = squared.lib.util;

export default class Jpeg<T extends squared.base.Node> extends Extension<T> {
    public readonly options: ConvertOptions = {
        mimeTypes: new Set(['image/png', 'image/bmp', 'image/gif', 'image/tiff']),
        minSize: 0,
        maxSize: Infinity,
        whenSmaller: false,
        replaceWith: true
    };

    public processFile(data: ChromeAsset, override?: boolean) {
        const mimeType = data.mimeType;
        if (mimeType && !/jpeg[(%@:]/.test(mimeType) && (override || findSet(this.options.mimeTypes, value => mimeType.endsWith(value)))) {
            data.mimeType = Extension.getConvertOptions('jpeg', this.options) + mimeType;
            return true;
        }
        return false;
    }
}