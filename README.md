# squared 2.1

## Installation (global js variable: squared)

Option #1 - [Node.js](http://www.nodejs.org)

GitHub  
&nbsp;&nbsp;&nbsp;&gt; git clone https://github.com/anpham6/squared  
&nbsp;&nbsp;&nbsp;&gt; cd squared  
&nbsp;&nbsp;&nbsp;&gt; npm install --only=prod && npm run prod  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; *OR*  
&nbsp;&nbsp;&nbsp;&gt; npm install && npm run dev

NPM  
&nbsp;&nbsp;&nbsp;&gt; npm install squared  
&nbsp;&nbsp;&nbsp;&gt; cd node_modules/squared  

Express  
&nbsp;&nbsp;&nbsp;&gt; README: [squared-functions](https://github.com/anpham6/squared-functions#readme)  
&nbsp;&nbsp;&nbsp;&gt; squared.settings.json (configure)  
&nbsp;&nbsp;&nbsp;&gt; node serve.js [--help]

* http://localhost:3000

Option #2 - [Kotlin / Java](https://ktor.io)

&nbsp;&nbsp;&nbsp;&gt; git clone https://github.com/anpham6/squared-apache  
&nbsp;&nbsp;&nbsp;&gt; cd squared-apache  
&nbsp;&nbsp;&nbsp;&gt; squared.settings.yml (configure)  
&nbsp;&nbsp;&nbsp;&gt; gradlew run

* http://localhost:8080

Option #3 - Browser

* Download (squared@version): https://unpkg.com/squared

&nbsp;&nbsp;&nbsp;&gt; https://unpkg.com/squared/dist/squared.min.js  
&nbsp;&nbsp;&nbsp;&gt; https://unpkg.com/squared/dist/squared.base.min.js  
&nbsp;&nbsp;&nbsp;&gt; https://unpkg.com/squared/dist/vdom.framework.min.js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; *OR*  
&nbsp;&nbsp;&nbsp;&gt; https://unpkg.com/squared/dist/squared.min.js  
&nbsp;&nbsp;&nbsp;&gt; https://unpkg.com/squared/dist/vdom-lite.framework.min.js

### ALL: Usage

Library files are in the /dist folder. A minimum of *two* files are required to run squared.

1. squared
2. squared-base - *required: except vdom-lite*
3. squared-svg - *optional*
4. framework (e.g. android | chrome | vdom | vdom-lite)
5. extensions (e.g. android.widget) - *optional*

Usable combinations: 1-2-4 + 1-2-4-5 + 1-2-3-4-5 + 1-vdom-lite

File bundles for common combinations are available in the /dist/bundles folder.

#### Example: android

The primary function "parseDocument" can be called on multiple elements and multiple times per session. The application will continuously and progressively build the layout files into a single entity with combined shared resources. Using "parseDocumentSync" is not recommended when your page has either images or fonts.

```javascript
<script src="/dist/squared.min.js"></script>
<script src="/dist/squared.base.min.js"></script>
<script src="/dist/squared.svg.min.js"></script> /* optional */
<script src="/dist/android.framework.min.js"></script>
<script>
    // optional
    squared.settings.targetAPI = 30;

    document.addEventListener('DOMContentLoaded', () => {
        squared.setFramework(android, /* optional: FrameworkOptions */);

        squared.parseDocument(); // default: document.body 'BODY'
        // OR
        squared.parseDocument(/* HTMLElement */, /* 'subview-id' */, /* ...etc */);

        squared.save(); // uses defaults from settings
        // OR
        squared.saveAs(/* archive name */, /* options */);
        // OR
        squared.copyTo(/* local directory */, /* options */);
        // OR
        squared.appendTo(/* location uri */, /* options */);

        squared.reset(); // start new "parseDocument" session
    });
</script>
```

#### Example: vdom / chrome

VDOM is a minimal framework (45kb gzipped) for those who prefer a universal HTMLElement that can perform internally cached selector queries. The "lite" version is about half the bundle size and is recommended for most browser applications. Chrome framework offers the same features as VDOM but can also bundle assets using HTML syntax and Express server. It is adequate for most applications and gives you the ability to see your application first and to build it last.

```javascript
<script src="/dist/squared.min.js"></script>
<script src="/dist/squared.base.min.js"></script>
<script src="/dist/vdom.framework.min.js"></script> /* OR: chrome.framework.min.js */
<script>
    document.addEventListener('DOMContentLoaded', async () => {
        squared.setFramework(vdom /* chrome */, /* optional: FrameworkOptions */);

        const element = await squared.parseDocument(/* HTMLElement */); // default: document.documentElement 'HTML'
        const elementArray = squared.parseDocumentSync(/* HTMLElement */, /* 'elementId' */, /* ...etc */); // multiple elements

        // start new "parseDocument" session (optional)
        squared.reset();
    });
</script>
```

There are ES2017 minified versions (*.min.js) and also ES2017 non-minified versions. Past versions until 1.6.5 were using ES2015 (ES6).

ES2015 - ES6 classes + Fetch (94%)  
ES2017 - Async/Await (92%)  

Browsers without ES2017 are not being supported to fully take advantage of async/await.

NOTE: Calling "save" or "copy" methods before the images have completely loaded can sometimes cause them to be excluded from the generated layout. In these cases you should use the "parseDocument" promise method "then" to set a callback for your commands.

```javascript
document.addEventListener('DOMContentLoaded', () => {
    squared.setFramework(android);
    squared.parseDocument(/* 'mainview' */, /* 'subview' */).then(() => {
        squared.save();
    });
});
```

### ALL: User Settings

These settings are available in the global variable "squared" to customize your desired output structure. Each framework shares a common set of settings and also a subset of their own settings.

#### Example: android

```javascript
squared.settings = {
    builtInExtensions: [ // default is all
        'squared.accessibility',
        'android.delegate.background',
        'android.delegate.negative-x',
        'android.delegate.positive-x',
        'android.delegate.max-width-height',
        'android.delegate.percent',
        'android.delegate.scrollbar',
        'android.delegate.radiogroup',
        'android.delegate.multiline',
        'squared.relative',
        'squared.css-grid',
        'squared.flexbox',
        'squared.table',
        'squared.column',
        'squared.list',
        'squared.grid',
        'squared.sprite',
        'squared.whitespace',
        'android.resource.svg',
        'android.resource.background',
        'android.resource.strings',
        'android.resource.fonts',
        'android.resource.dimens',
        'android.resource.styles',
        'android.resource.data',
        'android.resource.includes'
    ],
    targetAPI: 30,
    resolutionDPI: 160, // Pixel C: 320dpi 2560x1800
    resolutionScreenWidth: 1280,
    resolutionScreenHeight: 900,
    framesPerSecond: 60,
    supportRTL: true,
    preloadImages: true,
    compressImages: false, // png | jpeg - TinyPNG API Key <https://tinypng.com/developers>
    convertImages: '', // png | jpeg | bmp | squared-apache: gif | tiff
    preloadFonts: true,
    preloadCustomElements: true,
    supportNegativeLeftTop: true,
    fontMeasureWrap: true, // slower rendering performance (alias: android.delegate.multiline)
    fontMeasureAdjust: 0.75, // wider < 0 | thinner > 0 (element: data-android-font-measure-adjust)
    lineHeightAdjust: 1.1, // shorter < 1 | taller > 1 (element: data-android-line-height-adjust)
    customizationsOverwritePrivilege: true,
    showAttributes: true,
    createElementMap: false,
    createQuerySelectorMap: false,
    pierceShadowRoot: true,
    convertPixels: 'dp',
    insertSpaces: 4,
    showErrorMessages: true,
    manifestLabelAppName: 'android',
    manifestThemeName: 'AppTheme',
    manifestParentThemeName: 'Theme.AppCompat.Light.NoActionBar',
    outputMainFileName: 'activity_main.xml',
    outputDirectory: 'app/src/main',
    outputEmptyCopyDirectory: false,
    outputArchiveName: 'android-xml',
    outputArchiveFormat: 'zip' // zip | tar | gz/tgz | squared-apache: 7z | jar | cpio | xz | bz2 | lzma | lz4 | zstd
};
```

#### Example: chrome

```javascript
squared.settings = {
    builtInExtensions: [ // default is none
        'chrome.convert.png',
        'chrome.convert.jpeg',
        'chrome.convert.bmp',
        'chrome.convert.gif', // squared-apache: gif | tiff
        'chrome.convert.tiff',
        'chrome.compress.png', // png | jpeg - TinyPNG API Key <https://tinypng.com/developers>
        'chrome.compress.jpeg',
        'chrome.compress.brotli', // node-express + node 11.7
        'chrome.compress.gzip'
    ],
    preloadImages: false,
    preloadFonts: false,
    preloadCustomElements: false,
    excludePlainText: true,
    createElementMap: true,
    createQuerySelectorMap: true,
    pierceShadowRoot: false,
    showErrorMessages: false,
    outputFileExclusions: [], // ['squared.*', '*.mp4'] | <script|link> data-chrome-file="exclude" | default is none
    outputEmptyCopyDirectory: false,
    outputArchiveName: 'chrome-data',
    outputArchiveFormat: 'zip' // zip | tar | gz/tgz | squared-apache: 7z | jar | cpio | xz | bz2 | lzma | lz4 | zstd
};
```

#### Example: vdom

```javascript
squared.settings = {
    builtInExtensions: [],
    createElementMap: true,
    createQuerySelectorMap: true,
    pierceShadowRoot: false,
    showErrorMessages: false
};
```

### ALL: Local Storage

Custom named user settings per framework can be saved to local storage and reloaded across all pages in the same domain. Extensions are configured using the same procedure.

```javascript
interface FrameworkOptions {
    settings?: PlainObject;
    loadAs?: string;
    saveAs?: string;
    cache?: boolean;
}

// Required: Initial save
squared.setFramework(android, {
    settings: { compressImages: true, createQuerySelectorMap: true },
    saveAs: 'android-example'
});

// Optional: Subsequent loads
squared.setFramework(android, { loadAs: 'android-example' });
```

### ALL: Public Properties and Methods

There is no official documentation for this project. The entire source code including TypeScript definitions are available on GitHub if you need further clarification.

```javascript
.settings // see user preferences section

setFramework(module: {}, options?: FrameworkOptions) // install application interpreter
setHostname(value: string) // use another cors-enabled server for processing archives (--cors <origin> | node-express + squared.settings.json: <https://github.com/expressjs/cors>)
setAPIEndpoint(name: string, value: string) // set pathname for serverless cloud functions (ASSETS_COPY | ASSETS_ARCHIVE | BROWSER_DOWNLOAD | LOADER_JSON)

parseDocument(...elements: (Element | string)[]) // see installation section (Promise)
parseDocumentSync(...elements: (Element | string)[]) // skips preloadImages and preloadFonts (synchronous)

latest(count?: number) // most recent parseDocument session ids (1 newest / -1 oldest: string, other: string[])

close() // close current session preceding document write (android)
save() // save current session to a new archive using default settings
reset() // clear cache and reopen new session

toString() // current framework loaded

add(...names: (string | Extension | ExtensionRequestObject)[]) // see extension configuration section
remove(...names: (string | Extension)[]) // remove extensions by namespace or control
get(...names: (string | Extension)[]) // retrieve extensions by namespace or control
apply(name: string | Extension, options: FrameworkOptions) // see extension configuration section

extend(functionMap: {}, framework?: number) // add extension functions to Node prototype (framework: 0 - ALL | 1 - vdom | 2 - android | 4 - chrome)

// Promise (cache: createElementMap - true)

getElementById(value: string, sync?: boolean, cache?: boolean) // default: sync - false | cache - true
querySelector(value: string, sync?: boolean, cache?: boolean)
querySelectorAll(value: string, sync?: boolean, cache?: boolean)

fromElement(element: HTMLElement, sync?: boolean, cache?: boolean) // default: sync - false | cache - false

clearCache() // clear element data map
```

Packaging methods will return a Promise and require either node-express or squared-apache installed. These features are not supported when the framework is VDOM.

```javascript
saveAs(filename: string, options?: {}) // save current sessionas a new archive
saveFiles(format: string, options: {}) // create new archive from RequestAsset[]

// Required (local archives): --disk-read | --unc-read | --access-all (command-line)

appendTo(pathname: string, options?: {}) // create new archive from a preexisting archive and current session
appendFiles(pathname: string, options: {}) // create new archive from a preexisting archive and RequestAsset[]

// Required (all): --disk-write | --unc-write | --access-all (command-line)

copyTo(directory: string, options?: {}) // copy current session to local directory
copyFiles(directory: string, options: {}) // copy RequestAsset[] to local directory
```

### ALL: Extension Configuration (example: android)

Layout rendering can also be customized using extensions as the program was built to be nearly completely modular. Some of the common layouts already have built-in extensions which you can load or unload based on your preference.

```javascript
<script src="/dist/extensions/android.widget.coordinator.min.js"></script>
<script src="/dist/extensions/android.widget.menu.min.js"></script>
<script src="/dist/extensions/android.widget.toolbar.min.js"></script>
<script>
    // Configure an extension (optional)
    squared.apply('android.widget.toolbar', {
        settings: {
            'elementId': { // HTML DOM
                appBar: {
                    android: {
                        theme: '@style/ThemeOverlay.AppCompat.Dark.ActionBar'
                    }
                }
            }
        },
        saveAs: 'toolbar-example' // optional
    });

    // Create an extension
    class Sample extends squared.base.Extension {
        constructor(name, framework = 0, options = {}) {
            // framework: 0 - ALL | 1 - vdom | 2 - android | 4 - chrome
            super(name, framework, options);
        }
    }

    // Install an extension
    const sample = new Sample('your.namespace.sample', 0, { /* same as configure */ });
    squared.add(sample);
    // OR
    squared.add([sample, {/* configuration */}]);
</script>
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
body.altId = 5; // body.altId: 6
body.addEvent('click', event => body.element.classList.toggle('example'));
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

### ANDROID: Public Methods

```javascript
android.customize(build: number, widget: string, options: {}) // global attributes applied to specific views
android.addXmlNs(name: string, uri: string) // add global namespaces for third-party controls
android.setViewModel(data: {}, sessionId?: string) // object data for layout bindings
```

```javascript
// targetAPI: 0 - ALL, 30 - Android R

android.customize(squared.settings.targetAPI, 'Button', {
    android: {
        minWidth: '35px',
        minHeight: '25px'
    }
});
```

```javascript
android.addXmlNs('tools', 'http://schemas.android.com/tools');
```

View model data can be applied to most HTML elements using the dataset attribute. Different view models can be used for every "parseDocument" session. Leaving the sessionId empty sets the default view model for the entire project.

```javascript
await squared.parseDocument(/* 'mainview' */, /* 'subview' */).then(() => {
    const sessions = squared.latest(2);
    android.setViewModel(
        {
            import: ['java.util.Map', 'java.util.List'],
            variable: [
                { name: 'user', type: 'com.example.User' },
                { name: 'list', type: 'List&lt;String>' },
                { name: 'map', type: 'Map&lt;String, String>' },
                { name: 'index', type: 'int' },
                { name: 'key', type: 'String' }
            ]
        },
        sessions[1] /* optional: used when there are multiple layouts */
    );
    android.setViewModel(
        {
            import: ['java.util.Map'],
            variable: [
                { name: 'map', type: 'Map&lt;String, String>' }
            ]
        },
        sessions[0]
    );
});

squared.save();
```

Two additional output parameters are required with the "data-viewmodel" prefix. 

data-viewmodel-{namespace}-{attribute} -> data-viewmodel-android-text

```xml
<div>
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
        <variable name="list" type="List<String>" />
        <variable name="map" type="Map<String, String>" />
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

```javascript
import android.graphics.drawable.Animatable;

android.widget.ImageView imageView1 = findViewById(R.id.imageview_1);
if (imageView1 != null) {
    Animatable animatable = (Animatable) imageView1.getDrawable();
    animatable.start();
}
```

### ANDROID: Extensions

See /android/widget/*.html for usage instructions in the squared-apache <https://github.com/anpham6/squared-apache> project.

* android.external
* android.substitute
* android.constraint.guideline
* android.widget.coordinator
* android.widget.floatingactionbutton
* android.widget.menu
* android.widget.bottomnavigation
* android.widget.toolbar
* android.widget.drawer

### CHROME: Extensions

Most extensions have a few settings which can be configured. Compression and quality default settings are at their maximum level.

```javascript
chrome.extension.options = { // internal representation
    mimeTypes: ['image/jpeg', 'image/bmp', 'image/gif', 'image/tiff'],
    minSize: 0,
    maxSize: Infinity,
    whenSmaller: false,
    replaceWith: true // convert
};

squared.apply('chrome.convert.png', {
    settings: {
        minSize: 10000,
        whenSmaller: true
    }
});
```

### LICENSE

MIT