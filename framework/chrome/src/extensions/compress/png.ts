import Extension from '../../extension';

const { findSet } = squared.lib.util;

function hasCommand(mimeTypes: Set<string>, commands: Undef<string[]>) {
    if (commands) {
        for (const item of mimeTypes) {
            const type = item.split('/')[1];
            if (commands.find(command => command.trim().startsWith(type))) {
                return true;
            }
        }
    }
    return false;
}

export default class Png<T extends squared.base.Node> extends Extension<T> {
    public readonly options: CompressOptions = {
        mimeTypes: new Set(['image/png', 'image/jpeg']),
        minSize: 0,
        maxSize: Infinity,
        whenSmaller: true
    };

    public processFile(data: ChromeAsset, override?: boolean) {
        if (!override) {
            const { mimeType, commands } = data;
            if (mimeType) {
                const mimeTypes = this.options.mimeTypes;
                override = mimeTypes === '*' ? mimeType.startsWith('image/') : !!findSet(mimeTypes, value => mimeType === value) || hasCommand(mimeTypes, commands);
            }
        }
        if (override) {
            (data.compress ||= []).push({ format: 'png', condition: Extension.getCompressOptions(this.options) });
            return true;
        }
        return false;
    }
}