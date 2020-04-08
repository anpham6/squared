import { UserSettingsChrome } from '../../@types/chrome/application';

const settings: UserSettingsChrome = {
    builtInExtensions: [
        'chrome.compress.brotli',
        'chrome.compress.gzip'
    ],
    preloadImages: false,
    compressImages: false,
    handleExtensionsAsync: true,
    showErrorMessages: false,
    createQuerySelectorMap: true,
    cacheQuerySelectorResultSet: true,
    excludePlainText: true,
    outputFileExclusions: ['squared.*', 'chrome.framework.*'],
    outputEmptyCopyDirectory: false,
    outputArchiveName: 'chrome-data',
    outputArchiveFormat: 'zip'
};

export default settings;