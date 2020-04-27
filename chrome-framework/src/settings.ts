import { UserSettings } from '../../@types/chrome/application';

const settings: UserSettings = {
    builtInExtensions: [],
    preloadImages: false,
    excludePlainText: true,
    createQuerySelectorMap: true,
    showErrorMessages: false,
    outputFileExclusions: [],
    outputEmptyCopyDirectory: false,
    outputArchiveName: 'chrome-data',
    outputArchiveFormat: 'zip'
};

export default settings;