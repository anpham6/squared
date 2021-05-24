const settings: UserResourceSettingsUI = {
    builtInExtensions: [
        "squared.accessibility",
        "android.delegate.background",
        "android.delegate.negative-x",
        "android.delegate.positive-x",
        "android.delegate.max-width-height",
        "android.delegate.percent",
        "android.delegate.scrollbar",
        "android.delegate.radiogroup",
        "android.delegate.multiline",
        "squared.relative",
        "squared.css-grid",
        "squared.flexbox",
        "squared.table",
        "squared.column",
        "squared.list",
        "squared.grid",
        "squared.sprite",
        "squared.whitespace",
        "android.resource.background",
        "android.resource.svg",
        "android.resource.strings",
        "android.resource.fonts",
        "android.resource.dimens",
        "android.resource.styles",
        "android.resource.data",
        "android.resource.includes"
    ],
    targetAPI: 30,
    resolutionDPI: 160,
    resolutionScreenWidth: 1280,
    resolutionScreenHeight: 900,
    framesPerSecond: 60,
    supportRTL: true,
    supportNegativeLeftTop: true,
    enabledSVG: true,
    enabledMultiline: true,
    enabledViewModel: true,
    enabledIncludes: false,
    preloadImages: true,
    preloadFonts: true,
    preloadCustomElements: true,
    fontMeasureAdjust: 0.75,
    lineHeightAdjust: 1.1,
    baseLayoutAsFragment: false,
    createDownloadableFonts: true,
    createElementMap: false,
    createQuerySelectorMap: false,
    pierceShadowRoot: true,
    compressImages: false,
    convertImages: "",
    showAttributes: true,
    customizationsBaseAPI: 0,
    customizationsOverwritePrivilege: true,
    convertPixels: "dp",
    insertSpaces: 4,
    showErrorMessages: true,
    formatUUID: "8-4-4-4-12",
    manifestLabelAppName: "android",
    manifestThemeName: "AppTheme",
    manifestParentThemeName: "Theme.AppCompat.Light.NoActionBar",
    outputMainFileName: "activity_main.xml",
    outputDirectory: "app/src/main",
    outputDocumentHandler: "android",
    outputEmptyCopyDirectory: false,
    outputTasks: {},
    outputWatch: {},
    outputArchiveName: "android-xml",
    outputArchiveFormat: "zip",
    outputArchiveCache: false
};

export default settings;