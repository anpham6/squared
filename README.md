# squared

## Installation (global js variable: squared)

Option #1 (chrome / bundle / html+css):

* Install Node.js: http://www.nodejs.org

GitHub  
&nbsp;&nbsp;&nbsp;&gt; git clone https://github.com/anpham6/squared  
&nbsp;&nbsp;&nbsp;&gt; cd squared  
&nbsp;&nbsp;&nbsp;&gt; npm install  
&nbsp;&nbsp;&nbsp;&gt; npm run prod -OR- npm run dev  

NPM  
&nbsp;&nbsp;&nbsp;&gt; npm install squared  
&nbsp;&nbsp;&nbsp;&gt; cd node_modules/squared  

&nbsp;&nbsp;&nbsp;&gt; squared.settings.json (configure)  
&nbsp;&nbsp;&nbsp;&gt; node serve.js [--help]

* http://localhost:3000

Option #2 (android / ui / kotlin+java):

* Install Ktor: https://ktor.io

&nbsp;&nbsp;&nbsp;&gt; git clone https://github.com/anpham6/squared-apache  
&nbsp;&nbsp;&nbsp;&gt; cd squared-apache  
&nbsp;&nbsp;&nbsp;&gt; squared.settings.json (configure)  
&nbsp;&nbsp;&nbsp;&gt; gradlew run

* http://localhost:8080

Option #3 (vdom / minimal / browser only):

* Download (squared@version): https://unpkg.com

&nbsp;&nbsp;&nbsp;&gt; https://unpkg.com/squared/dist/squared.min.js  
&nbsp;&nbsp;&nbsp;&gt; https://unpkg.com/squared/dist/squared.base.min.js  
&nbsp;&nbsp;&nbsp;&gt; https://unpkg.com/squared/dist/vdom.framework.min.js

OR

&nbsp;&nbsp;&nbsp;&gt; https://unpkg.com/squared/dist/squared.min.js  
&nbsp;&nbsp;&nbsp;&gt; https://unpkg.com/squared/dist/vdom-lite.framework.min.js

### ALL: Usage

Library files are in the /dist folder. A minimum of *two* files are required to run squared.

1. squared
2. squared-base - *required: except vdom-lite*
3. squared-svg - *optional*
4. framework (e.g. android | chrome | vdom | vdom-lite)
5. extensions (e.g. android.widget) - *optional*

Usable combinations: 1-2-4 + 1-2-4-5 + 1-2-3-4-5 + 1-3 + 1-vdom-lite

One file bundles for common combinations are available in the /dist/bundles folder.

#### Example: android

The primary function "parseDocument" can be called on multiple elements and multiple times per session. The application will continuously and progressively build the layout files into a single entity with combined shared resources.

```javascript
<script src="/dist/squared.min.js"></script>
<script src="/dist/squared.base.min.js"></script>
<script src="/dist/squared.svg.min.js"></script> /* optional */
<script src="/dist/android.framework.min.js"></script>
<script>
    // optional
    squared.settings.targetAPI = 29;

    document.addEventListener('DOMContentLoaded', function() {
        squared.setFramework(android, /* optional { builtInExtensions: [] } */);

        squared.parseDocument(); // default: document.body 'BODY'
        // OR
        squared.parseDocument(/* HTMLElement */, /* 'subview-id' */, /* ...etc */);

        // With: node-express / squared-apache
        squared.saveToArchive(/* optional: archive name */, /* options */);
        // OR
        squared.copyToDisk(/* required: local directory */, /* options */);
        // OR
        squared.appendToArchive(/* required: location uri */, /* options */);

        squared.reset(); // start new "parseDocument" session
    });
</script>
```

#### Example: vdom / chrome

VDOM is a minimal framework with slightly better performance when using selector queries. The "lite" version is about half the bundle size and recommended for most browser applications. Chrome is used with NodeJS and is better for bundling assets.

```javascript
<script src="/dist/squared.min.js"></script>
<script src="/dist/squared.base.min.js"></script>
<script src="/dist/vdom.framework.min.js"></script> /* OR: chrome.framework.min.js */
<script>
    document.addEventListener('DOMContentLoaded', function() {
        squared.setFramework(vdom /* chrome */);

        const element = squared.parseDocument(/* HTMLElement */); // default: document.documentElement 'HTML'
        const elementArray = squared.parseDocument(/* HTMLElement */, /* 'subview-id' */, /* ...etc */); // more than 1 element

        // start new "parseDocument" session (optional)
        squared.reset();
    });
</script>
```

There are ES2017 minified versions (*.min.js) and also ES2017 non-minified versions. Past versions until 1.6.5 were using ES2015 (ES6).

ES2015 - ES6 classes + Fetch (94%)  
ES2017 - Async/Await (91%)  

Browsers without ES2017 are not being supported to fully take advantage of async/await.

NOTE: Calling "save" or "copy" methods before the images have completely loaded can sometimes cause them to be excluded from the generated layout. In these cases you should use the "parseDocument" promise method "then" to set a callback for your commands.

```javascript
document.addEventListener('DOMContentLoaded', function() {
    squared.setFramework(android);
    squared.parseDocument(/* 'mainview' */, /* 'subview' */).then(function() {
        squared.close();
        squared.saveToArchive();
    });
});
```

*** External CSS files cannot be parsed when loading HTML pages using the file:/// protocol (hard drive) with Chrome 64 or higher. Loading the HTML page from a web server (http://localhost) or embedding the CSS files into a &lt;style&gt; tag can get you past this security restriction. You can also use your preferred browser Safari/Edge/Firefox. The latest version of Chrome is ideally what you should use to generate the production version of your program. ***

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
    targetAPI: 29,
    resolutionDPI: 160, // Pixel C: 320dpi 2560x1800
    resolutionScreenWidth: 1280,
    resolutionScreenHeight: 900,
    framesPerSecond: 60,
    supportRTL: true,
    preloadImages: true,
    compressImages: false, // png | jpeg - TinyPNG API Key <https://tinypng.com/developers>
    convertImages: '', // png | jpeg | bmp | squared-apache: gif | tiff
    supportNegativeLeftTop: true,
    fontMeasureWrap: true, // slower rendering performance (alias: android.delegate.multiline)
    fontMeasureAdjust: 0.75, // wider < 0 | thinner > 0 (element: data-android-font-measure-adjust)
    lineHeightAdjust: 1.1, // shorter < 1 | taller > 1 (element: data-android-line-height-adjust)
    customizationsOverwritePrivilege: true,
    showAttributes: true,
    createElementMap: false,
    createQuerySelectorMap: false,
    convertPixels: 'dp',
    insertSpaces: 4,
    autoCloseOnWrite: true,
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
    excludePlainText: true,
    createElementMap: true,
    createQuerySelectorMap: true,
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
    showErrorMessages: false
};
```

### ALL: Public Properties and Methods

There is no official documentation as this project is still in early development. The entire source code including TypeScript definitions are available on GitHub if you need further clarification.

```javascript
.settings // see user preferences section

setFramework(module: {}, settings?: {}, cached?: boolean) // install application interpreter
setHostname(value: string) // use another cors-enabled server for processing archives (--cors <origin> | node-express + squared.settings.json: <https://github.com/expressjs/cors>)
setViewModel(data?: {}) // object data for layout bindings

parseDocument() // see installation section (Promise)

get(...elements: (Element | string)[]) // Element map of any Node objects created during the active "parseDocument" session
latest() // most recent parseDocument sessionId

ready() // boolean indicating if parseDocument can be called
close() // close current session preceding write to disk or local output
reset() // clear cached layouts and reopen new session

toString() // main layout file contents

include(extension: string | squared.base.Extension, options?: {}) // see extension configuration section
retrieve(name: string) // retrieve an extension by namespace or control
configure(name: string, options: {}) // see extension configuration section
exclude(name: string) // remove an extension by namespace or control

extend(functionMap: {}, framework?: number) // add extension functions to Node prototype (framework: 0 - ALL | 1 - vdom | 2 - android | 4 - chrome)

getElementMap() // map used for caching results from parseDocument
clearElementMap()

// Promise

getElementById(value: string, cache?: boolean) // cache: default "true"
querySelector(value: string, cache?: boolean)
querySelectorAll(value: string, cache?: boolean)

fromElement(element: HTMLElement, cache?: boolean) // cache: default "false"
```

Packaging methods will return a Promise and require either node-express or squared-apache installed. These features are not supported when the framework is VDOM.

```javascript

saveToArchive(filename?: string, options?: {}) // save entire project as a new archive
createFrom(format: string, options: {}) // create new archive from only RequestAsset[]

// Required (local archives): --disk-read | --unc-read | --access-all (command-line)

appendToArchive(pathname: string, options?: {}) // append entire project to a copy of a preexisting archive
appendFromArchive(pathname: string, options: {}) // create new archive from a preexisting archive and from only RequestAsset[]

// Required (all): --disk-write | --unc-write | --access-all (command-line)

copyToDisk(directory: string, options?: {}) // copy entire project to local directory
```

### ANDROID: Public Methods

The system methods are used internally to create the entire project and generally are not useful other than for debugging purposes or extracting the raw assets.

```javascript
// Synchronous

squared.system.customize(build: number, widget: string, options: {}) // global attributes applied to specific views
squared.system.addXmlNs(name: string, uri: string) // add global namespaces for third-party controls

squared.system.copyLayoutAllXml(directory: string, options?: {}) // copy generated xml
squared.system.copyResourceAllXml(directory: string, options?: {})
squared.system.copyResourceAnimXml(directory: string, options?: {})
squared.system.copyResourceArrayXml(directory: string, options?: {})
squared.system.copyResourceColorXml(directory: string, options?: {})
squared.system.copyResourceDimenXml(directory: string, options?: {})
squared.system.copyResourceDrawableXml(directory: string, options?: {})
squared.system.copyResourceFontXml(directory: string, options?: {})
squared.system.copyResourceStringXml(directory: string, options?: {})
squared.system.copyResourceStyleXml(directory: string, options?: {})

squared.system.saveLayoutAllXml(filename?: string, options?: {}) // save generated xml
squared.system.saveResourceAllXml(filename?: string, options?: {})
squared.system.saveResourceAnimXml(filename?: string, options?: {})
squared.system.saveResourceArrayXml(filename?: string, options?: {})
squared.system.saveResourceColorXml(filename?: string, options?: {})
squared.system.saveResourceDimenXml(filename?: string, options?: {})
squared.system.saveResourceDrawableXml(filename?: string, options?: {})
squared.system.saveResourceFontXml(filename?: string, options?: {})
squared.system.saveResourceStringXml(filename?: string, options?: {})
squared.system.saveResourceStyleXml(filename?: string, options?: {})

squared.system.writeLayoutAllXml() // write string[] generated xml
squared.system.writeResourceAllXml()
squared.system.writeResourceAnimXml()
squared.system.writeResourceArrayXml()
squared.system.writeResourceColorXml()
squared.system.writeResourceDimenXml()
squared.system.writeResourceDrawableXml()
squared.system.writeResourceFontXml()
squared.system.writeResourceStringXml()
squared.system.writeResourceStyleXml()

squared.system.copyResourceDrawableImage(directory: string, options?: {})
squared.system.saveResourceDrawableImage(filename?: string, options?: {})
squared.system.writeResourceDrawableImage()

squared.system.copyResourceRawVideo(directory: string, options?: {})
squared.system.saveResourceRawVideo(filename?: string, options?: {})
squared.system.writeResourceRawVideo()

squared.system.copyResourceRawAudio(directory: string, options?: {})
squared.system.saveResourceRawAudio(filename?: string, options?: {})
squared.system.writeResourceRawAudio()
```

```javascript
// targetAPI: 0 - ALL, 29 - Android Q
squared.system.customize(squared.settings.targetAPI, 'Button', {
    android: {
        minWidth: '35px',
        minHeight: '25px'
    }
});
```

```javascript
squared.system.addXmlNs('aapt', 'http://schemas.android.com/aapt');
```

### CHROME: Public Methods

```javascript
// Promise

chrome.saveAsWebPage(filename?: string, options?: {}) // create archive with html and web page assets
```

```javascript
// Promise

squared.system.copyHtmlPage(directory: string, options?: {}) // option "name": e.g. "index.html"
squared.system.copyScriptAssets(directory: string, options?: {})
squared.system.copyLinkAssets(directory: string, options?: {}) // option "rel": e.g. "stylesheet"
squared.system.copyImageAssets(directory: string, options?: {})
squared.system.copyVideoAssets(directory: string, options?: {})
squared.system.copyAudioAssets(directory: string, options?: {})
squared.system.copyFontAssets(directory: string, options?: {})

squared.system.saveHtmlPage(filename?: string, options?: {}) // option "name": e.g. "index.html"
squared.system.saveScriptAssets(filename?: string, options?: {})
squared.system.saveLinkAssets(filename?: string, options?: {}) // option "rel": e.g. "stylesheet"
squared.system.saveImageAssets(filename?: string, options?: {})
squared.system.saveVideoAssets(filename?: string, options?: {})
squared.system.saveAudioAssets(filename?: string, options?: {})
squared.system.saveFontAssets(filename?: string, options?: {})
```

### ALL: Excluding Procedures / Applied Attributes

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

### ALL: Extension Configuration (example: android)

Layout rendering can also be customized using extensions as the program was built to be nearly completely modular. Some of the common layouts already have built-in extensions which you can load or unload based on your preference.

```javascript
<script src="/dist/extensions/android.widget.coordinator.min.js"></script>
<script src="/dist/extensions/android.widget.menu.min.js"></script>
<script src="/dist/extensions/android.widget.toolbar.min.js"></script>
<script>
    // configure an extension
    squared.configure('android.widget.toolbar', { // optional: default configuration is usually provided
        'elementId': { // HTML DOM
            appBar: {
                android: {
                    theme: '@style/ThemeOverlay.AppCompat.Dark.ActionBar'
                }
            }
        }
    });

    // third-party: create an extension
    class Sample extends squared.base.Extension {
        constructor(name, framework = 0, options = {}) {
            // framework: 0 - ALL | 1 - vdom | 2 - android | 4 - chrome
            super(name, framework, options);
        }
    }

    // third-party: install an extension
    const sample = new Sample('your.namespace.sample', 0, { /* same as configure */ });
    squared.include(sample);

    // Node extension functions and properties
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
        }
    }, 2);
    const body = await squared.fromElement(document.body);
    body.altId = 5; // body.altId: 6
</script>
```

### ALL: Layouts and binding expressions (example: android)

ViewModel data can be applied to most HTML elements using the dataset attribute.

```javascript
squared.setViewModel({
    import: ['java.util.Map', 'java.util.List'],
    variable: [
        { name: 'user', type: 'com.example.User' },
        { name: 'list', type: 'List&lt;String>' },
        { name: 'map', type: 'Map&lt;String, String>' },
        { name: 'index', type: 'int' },
        { name: 'key', type: 'String' }
    ]
});
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

### ALL: node-express / squared-apache

These are some of the available options when creating archives or copying files.

```javascript
// NOTE: common: zip | tar | gz/tgz | node-express: br | squared-apache: 7z | jar | cpio | xz | bz2 | lzma | lz4 | zstd

squared.settings.outputArchiveFormat = '7z'; // default format "zip"

squared.saveToArchive('archive1', {
    format: '7z',
    assets: [
        {
            pathname: 'app/src/main/res/drawable',
            filename: 'ic_launcher_background.xml',
            uri: 'http://localhost:3000/common/images/ic_launcher_background.xml',
            compress: [{ format: 'gz', level: 9 }, { format: 'br' }, { format: 'bz2' }, { format: 'lzma' }, { format: 'zstd' }, { format: 'lz4' }]
        }
    ],
    exclusions: { // All attributes are optional
        pathname: ['app/build', 'app/libs'],
        filename: ['ic_launcher_foreground.xml'],
        extension: ['iml', 'pro'],
        pattern: ['outputs', 'grad.+\\.', '\\.git']
    }
});
```

Image conversion can be achieved using the mimeType property in a RequestAsset object. The supported formats are:

* png
* jpeg
* bmp
* gif
* tiff

node-express has only read support for GIF and TIFF. Opacity can be applied only to PNG and GIF.

```xml
format[@%]?(minSize(0),maxSize(*))?(width(n)xheight(n)#?cover|contain|scale)?{...rotate(n)}?|opacity|?:image/{format}
```

@ - replace  
% - smaller

Placing an @ symbol (@png:image/jpeg) before the mime type will remove the original file from the package. The % symbol (%png:image/jpeg) will choose the smaller of the two files. You can also use these commands with the setting "convertImages" in the Android framework.

```javascript
// NOTE: squared-apache uses TinyPNG for resizing and refitting (contain|cover|scale) and supports only PNG and JPEG. <https://tinypng.com/developers>

const options = {
    assets: [
        {
            pathname: 'images',
            filename: 'pencil.png',
            mimeType: 'jpeg:image/png',
            uri: 'http://localhost:3000/common/images/pencil.png'
        },
        {
            pathname: 'images',
            filename: 'pencil.png',
            mimeType: 'bmp@(50000,100000):image/png',
            uri: 'http://localhost:3000/common/images/pencil.png'
        }
    ]
};
```

You can use these commands individually on any element where the image is the primary output display. Image resizing only works with individual elements or assets and not globally with extensions.

```xml
<!-- NOTE (saveTo): img | video | audio | source | track | object | embed -->

<img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/12005/harbour1.jpg" data-chrome-file="saveTo:../images/harbour::png@(10000,75000)(800x600#contain)" />
```

You can also add most of the "file" commands programatically (except "exclude") with JavaScript before saving or copying the assets. Multiple transformations can be achieved using the ":" separator.

```javascript
document.querySelectorAll('img').forEach(element => {
    element.dataset.chromeFile = 'saveTo:images/resized::png%(100000,*)(800x600){90,180,270}|0.5|:jpeg(600x400){45,135,225}';
});

chrome.saveAsWebPage();
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

The attributes "android-include" and "android-include-end" can only be applied to elements which share the same parent container. See /demos-dev/gradient.html for usage instructions.

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

### ANDROID: Extension Widgets

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

### CHROME: Saving web page assets

Bundling options are available with these HTML tag names.

* saveAs: html + script + link
* exportAs: script + style
* exclude: script + link + style

JS and CSS files can be optimized further using these settings (node-express):

* beautify
* minify
* custom name

You can also define your own optimizations in squared.settings.json:

* npm i terser@4.8 -> https://github.com/terser/terser (<b>NOTE</b>: Incompatible with 5.0+)
* npm i prettier -> https://github.com/prettier/prettier
* npm i clean-css -> https://github.com/jakubpawlowicz/clean-css
* npm i html-minifier-terser -> https://github.com/DanielRuf/html-minifier-terser

These plugins are not included with the default installation. You have to manually add them since this feature is only relevant to the Chrome framework [<b>npm run install-chrome</b>]. You can also install other non-builtin minifiers by defining a custom string-based synchronous function which is stored under the external category (html/js/css) and as the npm package name in squared.settings.json.

```javascript
// squared.settings.json
{
  "external": {
    "js": {
      "terser": {
        "minify-example": "const options = { keep_classnames: true }; return context.minify(value, options).code;" // arguments are always 'context' and 'value'
      }
    },
    "css": {
      "clean-css": {
        "beautify-example": "function(clean_css, value) { return new clean_css({ level: 1 }).minify(value).styles; }"
      }
    }
  }
}
```

JS and CSS files can be bundled together with the "saveAs" or "exportAs" action. Multiple transformations per asset are supported using the "+" symbol to chain them together. The "preserve" command will prevent unused styles from being deleted.

```xml
<link data-chrome-file="saveAs:css/prod.css::beautify::preserve" rel="stylesheet" href="css/dev.css" />
<style data-chrome-file="exportAs:css/prod.css::minify+beautify">
    body {
        font: 1em/1.4 Helvetica, Arial, sans-serif;
        background-color: #fafafa;
    }
</style>
<script data-chrome-file="saveAs:js/bundle1.js" src="/dist/squared.js"></script>
<script data-chrome-file="saveAs:js/bundle1.js" src="/dist/squared.base.js"></script>
<script data-chrome-file="saveAs:js/bundle2.js" src="/dist/chrome.framework.js"></script>
```

The entire page can similarly be included using the "saveAs" attribute in options. Extension plugins will be applied to any qualified assets.

```javascript
const options = {
    saveAs: { // All attributes are optional
        html: { filename: 'index.html', format: 'beautify' }
        script: { pathname: '../js', filename: 'bundle.js', format: 'minify' },
        link: { pathname: 'css', filename: 'bundle.css', preserve: true },
        base64: { format: 'png' }
    }
};
```

There are a few ways to save the entire page or portions using the system methods.

```xml
<script>
    chrome.saveAsWebPage('index', { // default is false
        format: 'zip', // optional
        removeUnusedStyles: true, // Use only when you are not switching classnames with JavaScript
        productionRelease: true, // Ignore local url rewriting and load assets using absolute paths
        preserveCrossOrigin: true // Ignore downloading a local copy of assets hosted on other domains
    }); 
</script>
```

You can exclude unnecessary processing files using the dataset attribute in &lt;script|link|style&gt; tags.

```xml
<script data-chrome-file="exclude" src="/dist/squared.js"></script>
<script data-chrome-file="exclude" src="/dist/squared.base.js"></script>
<script data-chrome-file="exclude" src="/dist/chrome.framework.js"></script>
<script data-chrome-file="exclude">
    squared.setFramework(chrome);
    chrome.saveAsWebPage();
</script>
```

### CHROME: Extension configuration

Most extensions have a few settings which can be configured. Compression and quality default settings are at their maximum level.

```javascript
chrome.extension.options = { // internal representation
    mimeTypes: ['image/jpeg', 'image/bmp', 'image/gif', 'image/tiff'],
    largerThan: 0,
    smallerThan: Infinity,
    whenSmaller: false,
    replaceWith: true // convert
};

squared.configure('chrome.convert.png', {
    largerThan: 10000,
    replaceWith: false,
    whenSmaller: true
});
```

### LICENSE

MIT