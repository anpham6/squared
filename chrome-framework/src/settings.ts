import { UserSettingsChrome } from './@types/application';

const settings: UserSettingsChrome = {
    builtInExtensions: [],
    preloadImages: false,
    handleExtensionsAsync: true,
    showErrorMessages: false,
    createQuerySelectorMap: true,
    excludePlainText: true,
    gzipCompressionQuality: 9,
    brotliCompressionQuality: 11,
    compressFileExtensions: ['js', 'css', 'json', 'svg'],
    outputFileExclusions: ['squared.*', 'chrome.framework.*'],
    outputDirectory: '',
    outputArchiveName: 'chrome-data',
    outputArchiveFormat: 'zip',
    outputArchiveTimeout: 60
};

export default settings;