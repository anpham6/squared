import Extension from '../../extension';

export default class Brotli<T extends squared.base.Node> extends Extension<T> {
    public readonly options: CompressOptions = {
        mimeTypes: new Set(['text/css', 'text/javascript', 'text/plain', 'text/csv', 'text/vtt', 'application/json', 'application/javascript', 'application/ld+json', 'application/xml']),
        minSize: 0,
        maxSize: Infinity,
        whenSmaller: true,
        level: 11
    };

    public processFile(data: ChromeAsset, override?: boolean) {
        if (!override) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                override = mimeTypes === "*" || mimeTypes.has(mimeType);
            }
        }
        if (override) {
            (data.compress ||= []).push({ format: 'br', level: this.options.level, condition: Extension.getCompressOptions(this.options) });
            return true;
        }
        return false;
    }
}