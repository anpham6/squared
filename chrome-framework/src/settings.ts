import { UserSettingsChrome } from './@types/application';

const settings: UserSettingsChrome = {
    builtInExtensions: [
        'chrome.compress.brotli',
        'chrome.compress.gzip'
    ],
    preloadImages: false,
    handleExtensionsAsync: true,
    showErrorMessages: false,
    createQuerySelectorMap: true,
    excludePlainText: true,
    outputFileExclusions: ['squared.*', 'chrome.framework.*'],
    outputDirectory: '',
    outputArchiveName: 'chrome-data',
    outputArchiveFormat: 'zip',
    outputArchiveTimeout: 60
};

export default settings;