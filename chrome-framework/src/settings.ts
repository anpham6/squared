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
    cacheQuerySelectorResultSet: false,
    excludePlainText: true,
    outputFileExclusions: ['squared.*', 'chrome.framework.*'],
    outputDirectory: '',
    outputArchiveName: 'chrome-data',
    outputArchiveFormat: 'zip',
    outputArchiveTimeout: 60
};

export default settings;