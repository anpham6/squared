import { UserSettingsChrome } from './@types/application';

const settings: UserSettingsChrome = {
    builtInExtensions: [],
    preloadImages: false,
    handleExtensionsAsync: true,
    showErrorMessages: false,
    createQuerySelectorMap: true,
    excludePlainText: true,
    brotliCompressionQuality: 11,
    brotliCompatibleExtensions: ['js', 'css', 'woff2'],
    outputDirectory: '',
    outputArchiveName: 'chrome-data',
    outputArchiveFormat: 'zip',
    outputArchiveTimeout: 30
};

export default settings;