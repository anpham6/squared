import Extension from '../../extension';

export default class Tiff<T extends squared.base.Node> extends Extension<T> {
    public readonly options: ConvertOptions = {
        mimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'],
        largerThan: 0,
        smallerThan: Infinity,
        whenSmaller: false,
        replaceWith: true
    };

    public processFile(data: ChromeAsset, override?: boolean) {
        const mimeType = data.mimeType;
        if (mimeType && !/tiff[(%@:]/.test(mimeType)) {
            const mimeTypes = this.options.mimeTypes;
            if (override || Array.isArray(mimeTypes) && mimeTypes.find(value => mimeType.endsWith(value))) {
                data.mimeType = Extension.getConvertOptions('tiff', this.options) + mimeType;
                return true;
            }
        }
        return false;
    }
}