## squared 3.0

* README: [squared-functions](https://github.com/anpham6/squared-functions#readme)  
* README: [squared-express](https://github.com/anpham6/squared-express#readme)

### Installation (global js variable: squared)

Option #1 - [Node.js](http://www.nodejs.org)

#### GitHub

```xml
> git clone https://github.com/anpham6/squared
> cd squared

> npm install

> npm run prod
  <!-- OR -->
> npm run dev

> cd ..
> git clone https://github.com/anpham6/squared-express
> cd squared-express

> npm install

> npm run prod
> npm run deploy
  <!-- OR -->
> npm run dev
```

#### NPM

```xml
> npm install squared  
> cd node_modules/squared  
```

#### GitHub &amp; NPM

```xml
<!-- npm run express-rw (read/write) -->

> squared.settings.[json|yml] (configure)  
> node serve.js [--help]

> http://localhost:3000
```

Option #2 - Browser

* Download (squared@version): https://unpkg.com/squared

&nbsp;* https://unpkg.com/squared/dist/squared.min.js  
&nbsp;* https://unpkg.com/squared/dist/squared.base-dom.min.js  
&nbsp;* https://unpkg.com/squared/dist/vdom.framework.min.js  
  
&nbsp;* https://unpkg.com/squared/dist/squared.min.js  
&nbsp;* https://unpkg.com/squared/dist/vdom-lite.framework.min.js

### ALL: Usage

Library files are in the /dist folder. A minimum of *two* files are required to run squared.

1. squared
2. squared-base - *required: except vdom-lite*
3. squared-svg - *optional*
4. framework (e.g. android | chrome | vdom | vdom-lite)
5. extensions - *optional*

Usable combinations: 1-2-4 + 1-2-4-5 + 1-2-3-4-5 + 1-vdom-lite

File bundles for common combinations are available in the /dist/bundles folder and do not require a call to setFramework.

#### Example: android

The primary function "parseDocument" can be called on multiple elements and multiple times per session. The application will continuously and progressively build the layout files into a single entity with combined shared resources. Using "parseDocumentSync" is not recommended when your page has either images or fonts.

```javascript
<script src="/dist/squared.min.js"></script>
<script src="/dist/squared.base.min.js"></script>
<script src="/dist/squared.svg.min.js"></script> /* Optional */
<script src="/dist/android.framework.min.js"></script>
<script>
    squared.settings.targetAPI = 30; // optional

    document.addEventListener("DOMContentLoaded", async () => {
        squared.setFramework(android, /* settings (optional) */);

        await squared.parseDocument(); // document.body "BODY" (default)
        // OR
        await squared.parseDocument(/* HTMLElement */, /* "fragment-id" */, /* ...etc */);
        // OR
        await squared.parseDocument( // squared 3.0
            { // Custom settings do not affect other layouts
                element: document.body, // index = 0 (default)
                enabledMultiline: false,
                customizationsBaseAPI: -1,
                exclude: ["squared.list", "squared.grid"],
                afterCascade: function(sessionId: string, node: Node) { /* squared 3.1 */ }
            },
            { // Only "element" is required
                element: "fragment-id",
                pathname: "app/src/main/res/layout",
                filename: "fragment.xml",
                baseLayoutAsFragment: true,
                beforeCascade: function(sessionId: string) {
                    document.getElementById("fragment-id").style.display = "block"; // Use inline styles
                }
            }
        );

        await squared.save(); // Uses defaults from settings
        // OR
        await squared.saveAs(/* archive filename */, /* options */);
        // OR
        await squared.copyTo(/* directory */, /* options */);
        // OR
        await squared.appendTo(/* archive location */, /* options */);

        squared.reset(); // Start new "parseDocument" session
    });
</script>
```

#### Example: vdom / chrome

VDOM is a minimal framework (41kb gzipped) for those who prefer a universal HTMLElement. The "lite" version is about half the bundle size and is recommended for most browser applications. Chrome framework offers the same features as VDOM but can also bundle assets using HTML syntax and Express server. It is adequate for most applications and gives you the ability to see your application first and to build it last.

```javascript
<script src="/dist/squared.min.js"></script>
<script src="/dist/squared.base-dom.min.js"></script>
<script src="/dist/vdom.framework.min.js"></script> /* chrome.framework.min.js */
<script>
    document.addEventListener("DOMContentLoaded", async () => {
        squared.setFramework(vdom /* chrome */, /* optional: settings */);

        const element = await squared.parseDocument(/* HTMLElement */); // document.documentElement "HTML" (default)
        // OR
        const elements = squared.parseDocumentSync(/* HTMLElement */, /* "elementId" */, /* ...etc */); // Multiple elements

        squared.reset(); // Start new "parseDocument" session (optional)
    });
</script>
```

There are ES2017 minified versions (*.min.js) and also ES2017 non-minified versions.

ES2015 - ES6 classes + Fetch (95%)  
ES2017 - Async/Await (93%) - Chrome 55

Browsers without ES2017 are not being supported to fully take advantage of async/await.

NOTE: Calling "save" or "copy" methods before the images have completely loaded can sometimes cause them to be excluded from the generated layout. In these cases you should use the "parseDocument" promise method "then" to set a callback for your commands.

### ALL: User Settings

These settings are available in the global variable "squared" to customize your desired output structure. Each framework shares a common set of settings and also a subset of their own settings.
  
Gulp installation is required in order to use "outputTasks". Further instructions can be found in the [squared-functions](https://github.com/anpham6/squared-functions#readme) repository.

#### Example: android

```javascript
squared.settings = {
    targetAPI: 30,
    resolutionDPI: 160, // Pixel C: 320dpi 2560x1800
    resolutionScreenWidth: 1280,
    resolutionScreenHeight: 900,
    framesPerSecond: 60,
    supportRTL: true,
    supportNegativeLeftTop: true,
    preloadImages: true,
    preloadFonts: true,
    preloadCustomElements: true,
    enabledSVG: true,
    enabledMultiline: true, // fontMeasureWrap (squared 2.5)
    enabledViewModel: true,
    enabledIncludes: false,
    fontMeasureAdjust: 0.75, // wider < 0 | thinner > 0 (data-android-font-measure-adjust)
    lineHeightAdjust: 1.1, // shorter < 1 | taller > 1 (data-android-line-height-adjust)
    baseLayoutAsFragment: false, // FragmentContainerView
    createDownloadableFonts: true,
    createElementMap: false,
    createQuerySelectorMap: false,
    pierceShadowRoot: true,
    customizationsBaseAPI: 0, // All: 0 | None: -1 (Multiple: [0, 29])

    // Not customizable with parseDocument
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
    compressImages: false, // TinyPNG API Key <https://tinypng.com/developers>
    convertImages: "", // png | jpeg | webp | bmp
    showAttributes: true,
    customizationsOverwritePrivilege: true,
    createManifest: false, // Update AndroidManifest.xml
    createBuildDependencies: false, // Update build.gradle
    convertPixels: "dp",
    insertSpaces: 4,
    showErrorMessages: true,
    manifestPackage: "",
    manifestLabelAppName: "android",
    manifestThemeName: "AppTheme",
    manifestParentThemeName: "Theme.AppCompat.Light.NoActionBar",
    manifestActivityName: ".MainActivity",
    outputDocumentHandler: "android",
    outputDocumentCSS: [], // CSS properties to receive further processing at host server (e.g. "boxShadow")
    outputMainFileName: "activity_main.xml",
    outputDirectory: "app/src/main",
    outputEmptyCopyDirectory: false, // Sub directories within target directory
    outputTasks: {} // { "**/drawable/*.xml": { handler: "gulp", task: "minify" } }
    outputWatch: {} // { "**/drawable/*.png": true, "**/drawable/*.jpg": { interval: 1000, expires: "2h" } } (only raw assets)
    outputArchiveName: "android-xml",
    outputArchiveFormat: "zip", // zip | tar | 7z | gz
    outputArchiveCache: false // Downloadable URL in ResponseData<downloadUrl>
};
```

#### Example: chrome

```javascript
squared.settings = {
    preloadImages: false,
    preloadFonts: false,
    preloadCustomElements: false,
    excludePlainText: true,
    createElementMap: true,
    createQuerySelectorMap: true,
    pierceShadowRoot: true,

    // Not customizable with parseDocument
    builtInExtensions: [],
    showErrorMessages: false,
    webSocketPort: 80,
    webSocketSecurePort: 443,
    outputDocumentHandler: "chrome",
    outputEmptyCopyDirectory: false,
    outputTasks: {} // { "*.js": [{ handler: "gulp", task: "minify" }, { handler: "gulp", task: "beautify" }] }
    outputWatch: {} // { "*": true }
    outputArchiveName: "chrome-data",
    outputArchiveFormat: "zip",
    outputArchiveCache: false
};
```

#### Example: vdom

```javascript
squared.settings = {
    createElementMap: true,
    createQuerySelectorMap: true,
    pierceShadowRoot: false,

    // Not customizable with parseDocument
    builtInExtensions: [],
    showErrorMessages: false
};
```

### ALL: Local Storage

Custom named user settings per framework can be saved to local storage and reloaded across all pages in the same domain. Extensions are configured using the same procedure.

```javascript
// Save
squared.setFramework(android, { compressImages: true, createQuerySelectorMap: true }, "android-example");

// Load
squared.setFramework(android, "android-example", true); // "cache" can also be used as the last argument
```

### ALL: Public Properties and Methods

There is no official documentation for this project. The entire source code including TypeScript definitions are available on GitHub if you need further clarification.

```javascript
.settings // See user preferences section

setFramework(module: {}, options?: PlainObject, saveName?: string, cache?: boolean) // Install application interpreter
setFramework(module: {}, loadName: string, cache?: boolean) // Load settings from Local Storage

setHostname(value: string) // Use another cors-enabled server for processing archives (--cors <origin> | node-express + squared.settings.json: <https://github.com/expressjs/cors>)
setEndpoint(name: string, value: string) // Set pathname for serverless cloud functions (ASSETS_COPY | ASSETS_ARCHIVE | LOADER_DATA)

parseDocument(...elements: (Element | string)[]) // See installation section (Promise)
parseDocumentSync(...elements: (Element | string)[]) // Skips preloadImages and preloadFonts (synchronous)

latest(count?: number) // Most recent parseDocument session ids (1 newest / -1 oldest: string, other: string[])

close() // Close current session (optional)
save() // Save current session to a new archive using default settings
reset() // Clear cache and reopen new session

toString() // Current framework loaded

add(...names: (string | Extension | ExtensionRequestObject)[]) // See extension configuration section
remove(...names: (string | Extension)[]) // Remove extensions by namespace or control
get(...names: (string | Extension)[]) // Retrieve extensions by namespace or control
apply(name: string | Extension, options: PlainObject, saveName?: string) // See extension configuration section

extend(functionMap: {}, framework?: /* 0 - ALL | 1 - vdom | 2 - android | 4 - chrome */) // Add extension functions to Node prototype

// Promise (Required for cache: createElementMap - true)

getElementById(value: string, sync?: boolean, cache?: boolean) // sync - false | cache - true (default)
querySelector(value: string, sync?: boolean, cache?: boolean)
querySelectorAll(value: string, sync?: boolean, cache?: boolean)

fromElement(element: HTMLElement, sync?: boolean, cache?: boolean) // sync - false | cache - false (default)
fromNode(node: Node, sync?: boolean, cache?: boolean)

clearCache() // Clear all data stored in memory
```

Packaging methods will return a Promise and require either node-express or squared-apache installed. These features are not supported when the framework is VDOM.

```javascript
saveAs(filename: string, options?: {}) // Save current sessionas a new archive
saveFiles(filename: string, options: {}) // Create new archive from FileAsset[]

// Required (local archives): --disk-read | --unc-read | --access-all (command-line)

appendTo(target: string, options?: {}) // Create new archive from a preexisting archive and current session
appendFiles(target: string, options: {}) // Create new archive from a preexisting archive and FileAsset[]

// Required (all): --disk-write | --unc-write | --access-all (command-line)

copyTo(pathname: string, options?: {}) // Copy current session to local 
copyFiles(pathname: string, options: {}) // Copy FileAsset[] to local 
```

### ALL: Extending Node object

You can add functions and initial variables to the Node object including overwriting preexisting class definitions per framework. Accessor properties are also supported using the get/set object syntax.

```javascript
squared.extend({
    _id: 1,
    getId: function() {
        return this._id;
    },
    altId: {
        get: function() {
            return this._id;
        },
        set: function(value) {
            this._id += value;
        }
    },
    addEvent: function(eventName, callback) {
        this.element.addEventListener(eventName, callback);
    }
});

const body = await squared.fromElement(document.body);
body.altId = 2; // body.altId: 3
body.addEvent("click", event => body.element.classList.toggle("example"));
```

### ANDROID: Public Methods

```javascript
android.setViewModel(data: {}, sessionId?: string) // Object data for layout bindings
android.addXmlNs(name: string, uri: string) // Add global namespaces for third-party controls
android.addDependency(group: string, name: string, version: string) // Add application dependency implementation (build.gradle)
android.customize(build: number, tagNameOrWidget: string, options: {}) // Global attributes applied to specific views
android.loadCustomizations(name: string) // Load customizations from Local Storage
android.saveCustomizations(name: string) // Save "customize" data into Local Storage (includes xmlns)
android.resetCustomizations() // All session customizations are deleted
android.addFontProvider(authority: string, package: string, certs: string[], webFonts: string | {}) // Add additional Web fonts (Google Fonts already included)
android.getLocalSettings() // Modify controller styles and parsing rules
```

```javascript
// NOTE: squared.settings.targetAPI is always parsed (Except when: customizationsBaseAPI = -1)

android.customize(android.lib.constant.BUILD_VERSION.ALL /* 0 */, "Button", {
    android: {
        minWidth: "35px",
        minHeight: "25px"
    },
    "_": { // Non-namespaced attributes
        style: "@style/Widget.MaterialComponents.Button.TextButton"
    }
});

android.customize(android.lib.constant.BUILD_VERSION.KITKAT /* 19 */, "svg", {
    android: {
        "[src]": "app:srcCompat"
    }
});

// Local Storage
android.saveCustomizations("customize-example"); // Save at least once in one layout

android.loadCustomizations("customize-example"); // Load in any other layout
```

```javascript
android.addXmlNs("tools", "http://schemas.android.com/tools");

android.customize(16 /* Jelly Bean */, "ImageView", {
    tools: {
        ignore: "ContentDescription",
        targetApi: "16"
    }
});
```

View model data can be applied to most HTML elements using the dataset attribute. Different view models can be used for every "parseDocument" session.

Leaving the sessionId empty sets the default view model for the entire project.

```javascript
// NOTE: latest(undefined = 1): string (1: most recent sessionId | -1: first sessionId)

await squared.parseDocument(/* "mainview" */, /* "subview" */).then(nodes => {
    const sessions = squared.latest(2); // ['1'. '2'. '3'] => ['2', '3']
    android.setViewModel(
        {
            import: ["java.util.Map", "java.util.List"],
            variable: [
                { name: "user", type: "com.example.User" },
                { name: "list", type: "List&lt;String>" },
                { name: "map", type: "Map&lt;String, String>" },
                { name: "index", type: "int" },
                { name: "key", type: "String" }
            ]
        },
        nodes[0].sessionId || sessions[0]
    );
    android.setViewModel(
        {
            import: ["java.util.Map"],
            variable: [
                { name: "map", type: "Map&lt;String, String>" }
            ]
        },
        nodes[1].sessionId || sessions[1] // Used when there are multiple layouts (optional)
    );
});

// squared 3.1
await squared.parseDocument({
    element: "mainview",
    enabledViewModel: true, // Optional
    data: {
        viewModel: {
            import: /* Same */,
            variable: [/* Same */]
        }
    } 
});

squared.save();
```

Two additional output parameters are required with the "data-viewmodel" prefix. 

data-viewmodel-{namespace}-{attribute} -> data-viewmodel-android-text

```xml
<div data-pathname-android="app/src/main" data-filename-android="activity_sub.xml"> <!-- Optional -->
    <label>Name:</label>
    <input type="text" data-viewmodel-android-text="user.firstName" />
    <input type="text" data-viewmodel-android-text="user.lastName" />
</div>
```

```xml
<layout>
    <data>
        <import type="java.util.Map" />
        <import type="java.util.List" />
        <variable name="user" type="com.example.User" />
        <variable name="list" type="List&lt;String&gt;" /> <!-- List<String> -->
        <variable name="map" type="Map&lt;String, String&gt;" /> <!-- Map<String, String> -->
        <variable name="index" type="int" />
        <variable name="key" type="String" />
    </data>
    <LinearLayout>
        <TextView
            android:text="Name:" />
        <EditText
            android:inputType="text"
            android:text="@{user.firstName}" />
        <EditText
            android:inputType="text"
            android:text="@{user.lastName}" />
    </LinearLayout>
</layout>
```

### ANDROID: Layout Includes / Merge Tag

Some applications can benefit from using includes or merge tags to share common templates. Merge is the default behavior and can be disabled using the "false" attribute value. Nested includes are also supported.

```xml
<div>
    <div>Item 1</div>
    <div data-android-include="filename1" data-android-include-merge="false">Item 2</div>
    <div>Item 3</div>
    <div data-android-include-end="true">Item 4</div>
    <div data-android-include="filename2" data-android-include-end="true">Item 5</div>
</div>
```

```xml
<LinearLayout>
    <TextView>Item 1</TextView>
    <include layout="@layout/filename1" />
    <include layout="@layout/filename2" />
</LinearLayout>
<!-- res/layout/activity_main.xml -->

<merge>
    <TextView>Item 2</TextView>
    <TextView>Item 3</TextView>
    <TextView>Item 4</TextView>
</merge>
<!-- res/layout/filename1.xml -->

<TextView>Item 5</TextView>
<!-- res/layout/filename2.xml -->
```

The attributes "android-include" and "android-include-end" can only be applied to elements which share the same parent container. See /demos/gradient.html for usage instructions.

### ANDROID: Redirecting Output Location

It is sometimes necessary to append elements into other containers when trying to design a UI which will look identical on the Android device. Redirection will fail if the target "location" is not a block/container element.

```xml
<div>
    <span>Item 1</span>
    <span data-android-target="location">Item 2</span>
    <span data-android-target="location" data-android-target-index="1">Item 3</span>
<div>
<ul id="location">
    <li>Item 4</li>
    <li>Item 5</li>
    <!-- span -->
</ul>
```

```xml
<LinearLayout>
    <TextView>Item 1</TextView>
</LinearLayout>
<LinearLayout>
    <TextView>Item 4</TextView>
    <TextView>Item 3</TextView>
    <TextView>Item 5</TextView>
    <TextView>Item 2</TextView>
</LinearLayout>
```

Using "target" into a ConstraintLayout or RelativeLayout container will not include automatic positioning.

### ANDROID: Custom Attributes

System or extension generated attributes can be overridden preceding final output. They will only be visible on the declared framework.

data-android-attr-{namespace}? -> default: "android"

```xml
<div
    data-android-attr="layout_width::match_parent;layout_height::match_parent"
    data-android-attr-app="layout_scrollFlags::scroll|exitUntilCollapsed">
</div>
```

```xml
<LinearLayout
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    app:layout_scrollFlags="scroll|exitUntilCollapsed" />
```

### ANDROID: SVG animations with CSS/SMIL

Only the XML based layout and resource files can be viewed on the Android device/emulator without any Java/Kotlin backend code. To play animations you also have to "start" the animation in MainActivity.java.

```java
import android.graphics.drawable.Animatable;

android.widget.ImageView imageView1 = findViewById(R.id.imageview_1);
if (imageView1 != null) {
    Animatable animatable = (Animatable) imageView1.getDrawable();
    animatable.start();
}
```

### ANDROID: Downloadable Fonts

Font providers are available as of squared 3.1. Google Fonts can be used without any additional configuration.

* [Guide](https://developer.android.com/guide/topics/ui/look-and-feel/downloadable-fonts)

```xml
<!-- build.gradle (required) -->
dependencies {
    implementation 'androidx.appcompat:appcompat:1.3.0' <!-- Optional: createBuildDependencies = true -->
    <!-- OR -->
    implementation 'com.android.support:appcompat-v7:28.0.0'
}

<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:theme="@style/AppTheme">
        <meta-data android:name="preloaded_fonts" android:resource="@array/preloaded_fonts" /> <!-- Recommended -->
    </application>
</manifest>
```

```javascript
// https://developers.google.com/fonts/docs/developer_api

squared.setFramework(android);
await android.addFontProvider(
    "com.google.android.gms.fonts",
    "com.google.android.gms",
    ["MIIEqDCCA5CgAwIBAgIJANWFuGx9007...", "MIIEQzCCAyugAwIBAgIJAMLgh0Zk..."],
    "https://www.googleapis.com/webfonts/v1/webfonts?key=1234567890" // JSON object is synchronous
);
squared.parseDocument();
```

### ANDROID: Excluding Procedures / Applied Attributes

Most attributes can be excluded from the generated XML using the dataset feature in HTML. One or more can be applied to any tag using the OR "|" operator. These may cause warnings when you compile your project and should only be used in cases when an extension has their custom attributes overwritten.

```xml
<div data-exclude-section="DOM_TRAVERSE | EXTENSION | RENDER | ALL"
     data-exclude-procedure="LAYOUT | ALIGNMENT | OPTIMIZATION | CUSTOMIZATION | ACCESSIBILITY | LOCALIZATION | ALL"
     data-exclude-resource="BOX_STYLE | BOX_SPACING | FONT_STYLE | VALUE_STRING | IMAGE_SOURCE | ASSET | ALL">
</div>
<div>
    <span data-exclude-resource="FONT_STYLE">content</span>
    <input id="cb1" type="checkbox" data-exclude-procedure="ACCESSIBILITY"><label for="cb1">checkbox text</label>
</div>
```

### ALL: Extension Configuration

Layout rendering can also be customized using extensions as the program was built to be nearly completely modular. Some of the common layouts already have built-in extensions which you can load or unload based on your preference.

```javascript
// Create an extension
class Sample extends squared.base.Extension {
    constructor(name, framework = 0, options = {}) { // 0 - ALL | 1 - vdom | 2 - android | 4 - chrome (framework)
        super(name, framework, options);
    }
}

// Install an extension
const sample = new Sample("your.namespace.sample", 0, {/* Same as configure */});
squared.add(sample);
// OR
squared.add([sample, {/* config */}]);
```

Some extensions have a few settings which can be configured. Usually default settings are at their maximum optimized levels.

### LICENSE

MIT