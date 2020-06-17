import Extension from '../../extension';

export default class Png<T extends squared.base.NodeElement> extends Extension<T> {
    public readonly options: ConvertOptions = {
        mimeTypes: ['image/jpeg', 'image/bmp', 'image/gif', 'image/tiff'],
        largerThan: 0,
        smallerThan: Infinity,
        whenSmaller: false,
        replaceWith: true,
        opacity: 1
    };

    public processFile(data: ChromeAsset, override = false) {
        const mimeType = data.mimeType;
        if (mimeType && !/png[(%@:]/.test(mimeType)) {
            const mimeTypes = this.options.mimeTypes;
            if (override || Array.isArray(mimeTypes) && mimeTypes.find(value => mimeType.endsWith(value))) {
                data.mimeType = Extension.getConvertOptions('png', this.options) + mimeType;
                return true;
            }
        }
        return false;
    }
}