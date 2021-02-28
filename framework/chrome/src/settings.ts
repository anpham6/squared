const settings: UserResourceSettings = {
    builtInExtensions: [],
    preloadImages: false,
    preloadFonts: false,
    preloadCustomElements: false,
    excludePlainText: true,
    createElementMap: true,
    createQuerySelectorMap: true,
    pierceShadowRoot: true,
    showErrorMessages: false,
    webSocketPort: 80,
    webSocketSecurePort: 443,
    outputDocumentHandler: 'chrome',
    outputEmptyCopyDirectory: false,
    outputTasks: {},
    outputWatch: {},
    outputArchiveName: 'chrome-data',
    outputArchiveFormat: 'zip',
    outputArchiveCache: false
};

export default settings;