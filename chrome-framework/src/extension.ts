const getSizeRange = (options: CompressOptions) => '(' + Math.max(options.largerThan, 0) + ',' + (options.smallerThan < Infinity ? options.smallerThan : '*') + ')';

export default abstract class Extension<T extends chrome.base.View> extends squared.base.Extension<T> implements chrome.base.Extension<T> {
    public static getCompressOptions(options: CompressOptions) {
        const result = (options.whenSmaller ? '%' : '') + getSizeRange(options);
        return result !== '(0,*)' ? result : undefined;
    }

    public static getConvertOptions(name: string, options: ConvertOptions) {
        let result = '';
        if (options.replaceWith) {
            result += '@';
        }
        else if (options.whenSmaller) {
            result += '%';
        }
        result += getSizeRange(options);
        return name + (result !== '(0,*)' ? result : '') + ':';
    }

    public application!: chrome.base.Application<T>;

    public processFile(data: ChromeAsset, override = false) {
        return false;
    }
}