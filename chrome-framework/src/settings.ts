import { UserSettingsChrome } from '../../@types/chrome/application';

const settings: UserSettingsChrome = {
    builtInExtensions: [],
    preloadImages: false,
    compressImages: false,
    showErrorMessages: false,
    createQuerySelectorMap: true,
    excludePlainText: true,
    outputFileExclusions: ['squared.*', 'chrome.framework.*'],
    outputEmptyCopyDirectory: false,
    outputArchiveName: 'chrome-data',
    outputArchiveFormat: 'zip'
};

export default settings;