import { UserSettingsChrome } from '../../@types/chrome/application';

const settings: UserSettingsChrome = {
    builtInExtensions: [],
    preloadImages: false,
    compressImages: false,
    excludePlainText: true,
    createQuerySelectorMap: true,
    showErrorMessages: false,
    outputFileExclusions: ['squared.*', 'chrome.framework.*'],
    outputEmptyCopyDirectory: false,
    outputArchiveName: 'chrome-data',
    outputArchiveFormat: 'zip'
};

export default settings;