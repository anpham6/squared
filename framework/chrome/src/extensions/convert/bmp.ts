import Extension from '../../extension';

export default class Bmp<T extends squared.base.NodeElement> extends Extension<T> {
    public readonly options: ConvertOptions = {
        mimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/tiff'],
        largerThan: 0,
        smallerThan: Infinity,
        whenSmaller: false,
        replaceWith: true
    };

    public processFile(data: ChromeAsset, override = false) {
        const mimeType = data.mimeType;
        if (mimeType && !/bmp[(%@:]/.test(mimeType)) {
            const mimeTypes = this.options.mimeTypes;
            if (override || Array.isArray(mimeTypes) && mimeTypes.find(value => mimeType.endsWith(value))) {
                data.mimeType = Extension.getConvertOptions('bmp', this.options) + mimeType;
                return true;
            }
        }
        return false;
    }
}