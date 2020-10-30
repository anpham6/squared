const getSizeRange = (options: CompressOptions) => '(' + Math.max(options.minSize, 0) + ',' + (options.maxSize < Infinity ? options.maxSize : '*') + ')';

export default abstract class Extension<T extends squared.base.Node> extends squared.base.Extension<T> implements chrome.base.Extension<T> {
    public static getCompressOptions(options: CompressOptions) {
        const result = (options.whenSmaller ? '%' : '') + getSizeRange(options);
        if (result !== '(0,*)') {
            return result;
        }
    }

    public static getConvertOptions(name: string, options: ConvertOptions) {
        const opacity = options.opacity ?? NaN;
        let result = '';
        if (options.replaceWith) {
            result += '@';
        }
        else if (options.whenSmaller) {
            result += '%';
        }
        result += getSizeRange(options);
        return name + (result !== '(0,*)' ? result : '') + (!isNaN(opacity) ? `|${opacity}|` : '');
    }

    public processFile(data: ChromeAsset, override?: boolean) {
        return false;
    }
}