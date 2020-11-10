import Extension from '../../extension';

const { findSet } = squared.lib.util;

export default class Png<T extends squared.base.Node> extends Extension<T> {
    public readonly options: ConvertOptions = {
        mimeTypes: new Set(['image/jpeg', 'image/bmp', 'image/gif', 'image/tiff', 'image/webp']),
        minSize: 0,
        maxSize: Infinity,
        whenSmaller: false,
        replaceWith: true,
        opacity: 1
    };

    public processFile(data: ChromeAsset, override?: boolean) {
        const mimeType = data.mimeType;
        if (mimeType && (override || findSet(this.options.mimeTypes, value => mimeType.endsWith(value)))) {
            data.commands ||= [Extension.getConvertOptions('png', this.options)];
            return true;
        }
        return false;
    }
}