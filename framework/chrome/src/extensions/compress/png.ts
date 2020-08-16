import Extension from '../../extension';

export default class Png<T extends squared.base.Node> extends Extension<T> {
    public readonly options: CompressOptions = {
        mimeTypes: ['image/png'],
        largerThan: 0,
        smallerThan: Infinity,
        whenSmaller: true
    };

    public processFile(data: ChromeAsset, override?: boolean) {
        if (!override) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                override = mimeType.includes('png:') || mimeTypes === '*' && mimeType.includes('image/') || Array.isArray(mimeTypes) && !!mimeTypes.find(value => mimeType.endsWith(value));
            }
        }
        if (override) {
            (data.compress || (data.compress = [])).push({ format: 'png', condition: Extension.getCompressOptions(this.options) });
            return true;
        }
        return false;
    }
}