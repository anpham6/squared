import Extension from '../../extension';

const { findSet } = squared.lib.util;

export default class Png<T extends squared.base.Node> extends Extension<T> {
    public readonly options: CompressOptions = {
        mimeTypes: new Set(['image/png']),
        largerThan: 0,
        smallerThan: Infinity,
        whenSmaller: true
    };

    public processFile(data: ChromeAsset, override?: boolean) {
        if (!override) {
            const mimeType = data.mimeType;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                override = mimeType.includes('png:') || mimeTypes === '*' ? mimeType.includes('image/') : !!findSet(mimeTypes, value => mimeType.endsWith(value));
            }
        }
        if (override) {
            (data.compress ||= []).push({ format: 'png', condition: Extension.getCompressOptions(this.options) });
            return true;
        }
        return false;
    }
}