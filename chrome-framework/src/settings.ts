import { UserSettingsChrome } from './@types/application';

const settings: UserSettingsChrome = {
    builtInExtensions: [],
    preloadImages: false,
    handleExtensionsAsync: true,
    showErrorMessages: false,
    createQuerySelectorMap: true,
    excludePlainText: true,
    outputDirectory: '',
    outputArchiveName: 'chrome-images',
    outputArchiveFormat: 'zip',
    outputArchiveTimeout: 30
};

export default settings;