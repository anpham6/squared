import { UserSettingsChrome } from '../../@types/chrome/application';

const settings: UserSettingsChrome = {
    builtInExtensions: [
        'chrome.compress.brotli',
        'chrome.compress.gzip'
    ],
    preloadImages: false,
    handleExtensionsAsync: true,
    showErrorMessages: false,
    createQuerySelectorMap: true,
    cacheQuerySelectorResultSet: true,
    excludePlainText: true,
    outputFileExclusions: ['squared.*', 'chrome.framework.*'],
    outputDirectory: '',
    outputEmptyCopyDirectory: false,
    outputArchiveName: 'chrome-data',
    outputArchiveFormat: 'zip',
    outputArchiveTimeout: 60
};

export default settings;