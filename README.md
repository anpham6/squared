# squared

This program can convert moderately complex HTML pages into the standard XML layouts for Android. HTML is the most popular and versatile way to design user interfaces and can be used to generate the UI for any platform based on XML.

Multiple views per page are supported with their resources and styles merged into one package to simplify maintenance. Conceptually creating a snapshot history in XML of what is displayed in the browser.

Layout rendering can also be customized using extensions as the program was built to be nearly completely modular. Some of the common layouts already have built-in extensions which you can load or unload based on your preference.

The ratio is about 1 line of HTML to every 10 lines of Android XML when using Squared to generate the UI for your mobile application. Another time saver is having the XML resources auto-generated for the entire project. Using HTML best practices and techniques will also generate the fastest possible layout structure in Android which is close to 95% efficient and better than most hand-written code.

## Installation (global js variable: squared)

*** External CSS files cannot be parsed when loading HTML pages using the file:// protocol (hard drive) with Chrome 64 or higher. Loading the HTML page from a web server (http://localhost) or embedding the CSS files into a &lt;style&gt; tag can get you past this security restriction. You can also use your preferred browser Safari/Edge/Firefox. The latest version of Chrome is ideally what you should use to generate the production version of your program. ***

Express server through Node.js is available with a provided default configuration. It is sufficient to load this program locally and can also be used for development. Using Express is highly recommended as you can create a ZIP archive of the generated resources from inside your browser which can be conveniently extracted into your project folder. Installing these dependencies are only required if you plan on using Express as your local web server. 

* Install Node.js: http://www.nodejs.org
* Install Squared: (choose one)

NPM  
&nbsp;&nbsp;&nbsp;&gt; npm install squared  
&nbsp;&nbsp;&nbsp;&gt; cd node_modules/squared  
&nbsp;&nbsp;&nbsp;&gt; node app.js  

GitHub  
&nbsp;&nbsp;&nbsp;&gt; git clone https://github.com/anpham6/squared  
&nbsp;&nbsp;&nbsp;&gt; cd squared  
&nbsp;&nbsp;&nbsp;&gt; npm install  
&nbsp;&nbsp;&nbsp;&gt; npm run prod  
&nbsp;&nbsp;&nbsp;&gt; node app.js  
  
* Open Browser: http://localhost:3000/demos/index.html
```javascript
<script src="/dist/squared.min.js"></script>
<script src="/dist/squared.base.min.js"></script>
<script src="/dist/squared.svg.min.js"></script> /* optional */
<script src="/dist/android.framework.min.js"></script>
<script>
    // optional
    squared.settings.targetAPI = 26;
    squared.settings.resolutionDPI = 160;

    // without Express: use either console.log() or element.innerHTML to display using "system.write" commands

    document.addEventListener('DOMContentLoaded', function() {
        // required
        squared.setFramework(android);

        // required: zero or more DOM elements
        squared.parseDocument(/* document.getElementById('mainview') */, /* 'subview' */, /* etc... */);
        squared.close();
        squared.saveAllToDisk(); /* Express required */

        // optional: start new "parseDocument" session
        squared.reset();
    });
</script>
```

Library files are in the /dist folder. A minimum of *three* files are required to run Squared.

1. squared
2. squared-base
3. squared-svg - *optional*
4. framework (e.g. android)
5. extensions (e.g. android.widget) - *optional*

There are babel minified versions for production (ES5) and non-babel versions for development (ES6). The primary function "parseDocument" can be called on multiple elements and multiple times per session. The application will continuously and progressively build into a single entity with combined shared resources.

NOTE: Calling "save" or "write" methods before the images have completely loaded can sometimes cause them to be excluded from the generated layout. In these cases you should use the "parseDocument" promise method "then" to set a callback for your commands.

```javascript
<script>
    document.addEventListener('DOMContentLoaded', function() {
        squared.setFramework(android);
        squared.parseDocument(/* 'mainview' */, /* 'subview' */).then(function() {
            squared.close();
            squared.saveAllToDisk();
        });
    });
</script>
```

### ALL: User Settings (example: android)

These settings are available in the global variable "squared" to customize your desired output structure. Each framework shares a common set of settings and also a subset of their own settings.

```javascript
squared.settings = {
    builtInExtensions: [
        'android.delegate.fixed',
        'android.delegate.max-width-height',
        'android.delegate.percent',
        'android.delegate.radiogroup',
        'android.delegate.scrollbar',
        'squared.external',
        'squared.substitute',
        'squared.sprite',
        'squared.css-grid',
        'squared.flexbox',
        'squared.table',
        'squared.list',
        'squared.grid',
        'squared.relative',
        'squared.verticalalign',
        'squared.whitespace',
        'squared.accessibility',
        'android.constraint.guideline',
        'android.resource.includes',
        'android.resource.background',
        'android.resource.svg',
        'android.resource.strings',
        'android.resource.fonts',
        'android.resource.dimens',
        'android.resource.styles'
    ],
    targetAPI: 26,
    resolutionDPI: 160,
    supportRTL: true,
    preloadImages: true,
    ellipsisOnTextOverflow: true,
    supportNegativeLeftTop: true,
    floatOverlapDisabled: false,
    collapseUnattributedElements: true,
    customizationsOverwritePrivilege: true,
    showAttributes: true,
    insertSpaces: 4, // tabs: 0
    convertPixels: 'dp',
    handleExtensionsAsync: true,
    autoCloseOnWrite: true,
    outputDirectory: 'app/src/main',
    outputMainFileName: 'activity_main.xml',
    outputArchiveFileType: 'zip', // zip | tar
    outputMaxProcessingTime: 30
};
```

### ALL: Extension Standard

CSS Grid and Flexbox layouts are mostly supported. There is also support for SVG and most of the common floating techniques.

<img src="html/demos/android/flexbox.png" alt="flexbox: horizontal" />

<img src="html/demos/android/flexbox_wrap.png" alt="flexbox: wrap" />

<img src="html/demos/android/float.png" alt="float: left | right | clear" />

<img src="html/demos/android/position_absolute.png" alt="position: absolute" />

<img src="html/demos/android/gradient.png" alt="gradient: linear | radial" />

<img src="html/demos/android/table.png" alt="extension: table" />

<img src="html/demos/android/grid.png" alt="extension: grid - balance columns" />

<img src="html/demos/android/list.png" alt="extension: list" />

### ALL: Extension Configuration (example: android)

```javascript
<script src="/dist/extensions/android.widget.coordinator.min.js"></script>
<script src="/dist/extensions/android.widget.menu.min.js"></script>
<script src="/dist/extensions/android.widget.toolbar.min.js"></script>
<script>
    // required when handleExtensionsAsync = false
    squared.include(android.widget.coordinator);
    squared.include(android.widget.menu);
    squared.include(android.widget.toolbar);

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
        constructor(name, framework = 0, tagNames = [], options = {}) {
            // framework: universal = 0; android = 2;
            super(name, framework, tagNames, options);
        }
    }

    // third-party: install an extension
    var sample = new Sample('your.namespace.sample', ['DIV'], { /* same as configure */ });
    squared.include(sample);
</script>
```

### ALL: Public Properties and Methods

There is no official documentation as this project is still in early development. The entire source code is available on GitHub if you need further clarification.

```javascript
.settings // see user preferences section

setFramework(module: {}, cached?: boolean) // install application converter

parseDocument() // see installation section

ready() // boolean indicating if parseDocument can be called
close() // close current session preceding write to disk or local output
reset() // clear cached layouts and reopen new session

saveAllToDisk() // download entire project as zip archive - requires Node.js and Express

toString() // main layout file contents

include(extension: squared.base.Extension) // see extension configuration section | same: apply(extension: {})
retrieve(name: string) // retrieve an extension by namespace or control | same: apply(name: string)
configure(name: string, options: {}) // see extension configuration section | same: apply(name: string, options: {})
exclude(name: string) // remove an extension by namespace or control
```

### ALL: Excluding Procedures / Applied Attributes

Most attributes can be excluded from the generated XML using the dataset feature in HTML. One or more can be applied to any tag using the OR "|" operator. These may cause warnings when you compile your project and should only be used in cases when an extension has their custom attributes overwritten.

```xml
<div data-exclude-section="DOM_TRAVERSE | EXTENSION | RENDER | ALL"
     data-exclude-procedure="LAYOUT | ALIGNMENT | AUTOFIT | OPTIMIZATION | CUSTOMIZATION | ACCESSIBILITY | LOCALIZATION | ALL"
     data-exclude-resource="BOX_STYLE | BOX_SPACING | FONT_STYLE | VALUE_STRING | IMAGE_SOURCE | ASSET | ALL">
</div>
<div>
    <span data-exclude-resource="FONT_STYLE">content</span>
    <input id="cb1" type="checkbox" data-exclude-procedure="ACCESSIBILITY"><label for="cb1">checkbox text</label>
</div>
```

### ALL: Redirecting Output Location

It is sometimes necessary to append elements into other containers when trying to design a UI which will look identical on the Android device. Redirection will fail if the target "location" is not a block/container element.

```xml
<div>
    <span>Item 1</span>
    <span data-target="location">Item 2</span>
<div>
<ul id="location">
    <li>Item 3</li>
    <!-- span -->
</ul>
```

```xml
<LinearLayout>
    <TextView>Item 1</TextView>
</LinearLayout>
<LinearLayout>
    <TextView>Item 3</TextView>
    <TextView>Item 2</TextView>
</LinearLayout>
```

Using "target" into a ConstraintLayout or RelativeLayout view will not include automatic positioning.

### ALL: Custom Attributes (example: android)

System or extension generated attributes can be overridden with dataset. They will only be visible on the declared framework.

```xml
<div
    data-android-attr-android="layout_width::match_parent;layout_height::match_parent"
    data-android-attr-app="layout_scrollFlags::scroll|exitUntilCollapsed">
</div>
```

### ANDROID: Public System Methods

You can use the "system.customize" method to create default settings for the specific controls which are applied after a view is rendered.

```javascript
system.customize(build: number, widget: string, options: {}) // global attributes applied to specific views
system.addXmlNs(name: string, uri: string) // add global namespaces for third-party controls
system.writeLayoutAllXml(saveToDisk: boolean) // output generated xml
system.writeResourceAllXml(saveToDisk: boolean)
system.writeResourceAnimatorXml(saveToDisk: boolean)
system.writeResourceArrayXml(saveToDisk: boolean)
system.writeResourceColorXml(saveToDisk: boolean)
system.writeResourceDimenXml(saveToDisk: boolean)
system.writeResourceDrawableXml(saveToDisk: boolean)
system.writeResourceFontXml(saveToDisk: boolean)
system.writeResourceStringXml(saveToDisk: boolean)
system.writeResourceStyleXml(saveToDisk: boolean)
```

```javascript
<script>
    // targetAPI: 0 - ALL, 26 - OREO
    squared.system.customize(squared.settings.targetAPI, 'Button', {
        android: {
            minWidth: '35px',
            minHeight: '25px'
        }
    });
</script>
```

### ANDROID: Extension Widgets

Most of the Android support library extensions can be configured using the same attribute name in the Android documentation. See /demo/*.html for usage instructions.

- android.widget.coordinator
- android.widget.floatingactionbutton
- android.widget.menu
- android.widget.bottomnavigation
- android.widget.toolbar
- android.widget.drawer

<img src="html/demos/android/custom.viewpager.tablayout.png" alt="custom: viewpager + tablayout" />

<img src="html/demos/android/drawer.png" alt="drawer: floating action button" />

<img src="html/demos/android/coordinator.scrolling.png" alt="coordinator: scrolling" />

<img src="html/demos/android/bottomnavigation.png" alt="bottom navigation" />

<img src="html/demos/android/drawer.navigationview.png" alt="drawer: actionbar" />

<img src="html/demos/android/menu.png" alt="toolbar: menu" />

### ANDROID: Layout Includes / Merge Tag

Some applications can benefit from using includes or merge tags to share common templates. Nested includes are also supported.

```xml
<div>
    <div>Item 1</div>
    <div data-android-include="filename1" data-android-include-merge="true">Item 2</div>
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

### SAMPLE: Generated from HTML and CSS

<img src="html/demos/android/form.png" alt="form" />

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/squared_ui"
    android:layout_height="wrap_content"
    android:layout_width="wrap_content"
    android:orientation="vertical">
    <TextView
        android:id="@+id/textview_1"
        android:background="@drawable/h2_textview_1"
        android:layout_height="wrap_content"
        android:layout_width="match_parent"
        android:padding="@dimen/h2_padding"
        android:text="@string/entry"
        style="@style/H2" />
    <LinearLayout
        android:id="@+id/entry"
        android:background="@drawable/form_entry"
        android:layout_height="wrap_content"
        android:layout_width="match_parent"
        android:orientation="vertical"
        android:paddingHorizontal="@dimen/form_padding_horizontal"
        android:paddingVertical="@dimen/form_padding_vertical">
        <GridLayout
            android:id="@+id/gridlayout_1"
            android:columnCount="2"
            android:layout_height="wrap_content"
            android:layout_width="match_parent"
            android:paddingBottom="@dimen/ul_padding_bottom"
            android:paddingHorizontal="@dimen/ul_padding_horizontal"
            android:paddingTop="@dimen/ul_padding_top">
            <TextView
                android:id="@+id/textview_2"
                android:labelFor="@+id/order"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/order"
                style="@style/Label_1" />
            <EditText
                android:id="@+id/order"
                android:background="@drawable/text_order"
                android:inputType="text"
                android:layout_height="wrap_content"
                android:layout_width="@dimen/text_width"
                android:paddingHorizontal="@dimen/text_padding_horizontal"
                android:paddingVertical="@dimen/text_padding_vertical"
                style="@style/Text" />
            <Space
                android:id="@+id/space_1"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <RelativeLayout
                android:id="@+id/relativelayout_1"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top">
                <TextView
                    android:id="@+id/textview_17"
                    android:layout_alignBaseline="@+id/textview_18"
                    android:layout_alignParentStart="true"
                    android:layout_height="wrap_content"
                    android:layout_width="wrap_content"
                    android:text="@string/date"
                    style="@style/Plaintext" />
                <TextView
                    android:id="@+id/textview_18"
                    android:layout_height="wrap_content"
                    android:layout_toEndOf="@+id/textview_17"
                    android:layout_width="wrap_content"
                    android:text="@string/add"
                    style="@style/A" />
                <TextView
                    android:id="@+id/textview_19"
                    android:layout_alignBaseline="@+id/textview_18"
                    android:layout_height="wrap_content"
                    android:layout_toEndOf="@+id/textview_18"
                    android:layout_width="wrap_content"
                    android:text="@string/__symbol22781"
                    style="@style/Plaintext" />
            </RelativeLayout>
            <LinearLayout
                android:id="@+id/linearlayout_1"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:orientation="vertical">
                <LinearLayout
                    android:id="@+id/linearlayout_9"
                    style="@style/Linearlayout_1">
                    <Spinner
                        android:id="@+id/month0"
                        android:entries="@array/custommonth0_array"
                        style="@style/Select.Linearlayout_2" />
                    <Spinner
                        android:id="@+id/day0"
                        android:entries="@array/customday0_array"
                        android:layout_marginStart="@dimen/select_margin_start"
                        style="@style/Select.Linearlayout_2" />
                    <Spinner
                        android:id="@+id/year0"
                        android:entries="@array/year0_array"
                        android:layout_marginStart="@dimen/select_margin_start"
                        style="@style/Select.Linearlayout_2" />
                </LinearLayout>
                <LinearLayout
                    android:id="@+id/linearlayout_10"
                    android:layout_marginTop="@dimen/select_group_margin_top"
                    style="@style/Linearlayout_1">
                    <Spinner
                        android:id="@+id/month1"
                        android:entries="@array/custommonth0_array"
                        style="@style/Select.Linearlayout_2" />
                    <Spinner
                        android:id="@+id/day1"
                        android:entries="@array/customday0_array"
                        android:layout_marginStart="@dimen/select_margin_start"
                        style="@style/Select.Linearlayout_2" />
                    <Spinner
                        android:id="@+id/year1"
                        android:entries="@array/year0_array"
                        android:layout_marginStart="@dimen/select_margin_start"
                        style="@style/Select.Linearlayout_2" />
                </LinearLayout>
                <LinearLayout
                    android:id="@+id/linearlayout_11"
                    android:layout_marginTop="@dimen/select_group_margin_top"
                    style="@style/Linearlayout_1">
                    <Spinner
                        android:id="@+id/month2"
                        android:entries="@array/custommonth0_array"
                        style="@style/Select.Linearlayout_2" />
                    <Spinner
                        android:id="@+id/day2"
                        android:entries="@array/customday0_array"
                        android:layout_marginStart="@dimen/select_margin_start"
                        style="@style/Select.Linearlayout_2" />
                    <Spinner
                        android:id="@+id/year2"
                        android:entries="@array/year0_array"
                        android:layout_marginStart="@dimen/select_margin_start"
                        style="@style/Select.Linearlayout_2" />
                </LinearLayout>
            </LinearLayout>
            <Space
                android:id="@+id/space_2"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_3"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/time"
                style="@style/Label" />
            <LinearLayout
                android:id="@+id/linearlayout_2"
                android:baselineAlignedChildIndex="0"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:orientation="horizontal">
                <Spinner
                    android:id="@+id/hour"
                    android:entries="@array/hour_array"
                    style="@style/Select.Linearlayout_2" />
                <Spinner
                    android:id="@+id/minute"
                    android:entries="@array/minute_array"
                    android:layout_marginStart="@dimen/select_margin_start"
                    style="@style/Select.Linearlayout_2" />
            </LinearLayout>
            <Space
                android:id="@+id/space_3"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_4"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/type"
                style="@style/Label" />
            <Spinner
                android:id="@+id/typeofentry"
                android:background="@drawable/select_typeofentry"
                android:entries="@array/typeofentry_array"
                android:layout_height="wrap_content"
                android:layout_width="@dimen/select_width"
                android:minWidth="@dimen/select_min_width"
                android:paddingHorizontal="@dimen/select_padding_horizontal"
                android:paddingVertical="@dimen/select_padding_vertical"
                style="@style/Select" />
            <Space
                android:id="@+id/space_4"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <RelativeLayout
                android:id="@+id/relativelayout_2"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top">
                <TextView
                    android:id="@+id/textview_20"
                    android:layout_alignBaseline="@+id/textview_21"
                    android:layout_alignParentStart="true"
                    android:layout_height="wrap_content"
                    android:layout_width="wrap_content"
                    android:text="@string/topic"
                    style="@style/Plaintext" />
                <TextView
                    android:id="@+id/textview_21"
                    android:layout_height="wrap_content"
                    android:layout_toEndOf="@+id/textview_20"
                    android:layout_width="wrap_content"
                    android:text="@string/add"
                    style="@style/A" />
                <TextView
                    android:id="@+id/textview_22"
                    android:layout_alignBaseline="@+id/textview_21"
                    android:layout_height="wrap_content"
                    android:layout_toEndOf="@+id/textview_21"
                    android:layout_width="wrap_content"
                    android:text="@string/__symbol22781"
                    style="@style/Plaintext" />
            </RelativeLayout>
            <LinearLayout
                android:id="@+id/linearlayout_3"
                android:baselineAlignedChildIndex="0"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:orientation="horizontal">
                <EditText
                    android:id="@+id/topic0"
                    android:background="@drawable/text_order"
                    android:inputType="text"
                    android:layout_height="wrap_content"
                    android:layout_marginEnd="@dimen/text_margin_end"
                    android:layout_width="@dimen/text_width_1"
                    android:paddingHorizontal="@dimen/text_padding_horizontal"
                    android:paddingVertical="@dimen/text_padding_vertical"
                    style="@style/Text" />
                <Spinner
                    android:id="@+id/prominence0"
                    android:background="@drawable/select_typeofentry"
                    android:entries="@array/typeofentry_array"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/select_margin_start"
                    android:layout_width="wrap_content"
                    android:minWidth="@dimen/select_min_width"
                    android:paddingHorizontal="@dimen/select_padding_horizontal"
                    android:paddingVertical="@dimen/select_padding_vertical"
                    style="@style/Select" />
            </LinearLayout>
            <Space
                android:id="@+id/space_5"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_5"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/series"
                style="@style/Label" />
            <Spinner
                android:id="@+id/series"
                android:background="@drawable/select_typeofentry"
                android:entries="@array/series_array"
                android:layout_height="wrap_content"
                android:layout_width="@dimen/select_width_1"
                android:minWidth="@dimen/select_min_width"
                android:paddingHorizontal="@dimen/select_padding_horizontal"
                android:paddingVertical="@dimen/select_padding_vertical"
                style="@style/Select" />
            <Space
                android:id="@+id/space_6"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_6"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/subset"
                style="@style/Label" />
            <Spinner
                android:id="@+id/subset"
                android:background="@drawable/select_typeofentry"
                android:entries="@array/typeofentry_array"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:minWidth="@dimen/select_min_width"
                android:paddingHorizontal="@dimen/select_padding_horizontal"
                android:paddingVertical="@dimen/select_padding_vertical"
                style="@style/Select" />
            <Space
                android:id="@+id/space_7"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_7"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/active"
                style="@style/Label" />
            <Spinner
                android:id="@+id/entryactive"
                android:background="@drawable/select_typeofentry"
                android:entries="@array/entryactive_array"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:minWidth="@dimen/select_min_width"
                android:paddingHorizontal="@dimen/select_padding_horizontal"
                android:paddingVertical="@dimen/select_padding_vertical"
                style="@style/Select" />
        </GridLayout>
        <View
            android:id="@+id/view_1"
            android:background="@color/light_gray_1"
            android:layout_gravity="center_horizontal"
            android:layout_height="@dimen/hr_height"
            android:layout_marginVertical="@dimen/hr_margin_vertical"
            android:layout_width="@dimen/hr_width" />
        <GridLayout
            android:id="@+id/gridlayout_2"
            android:columnCount="2"
            android:layout_height="wrap_content"
            android:layout_width="wrap_content"
            android:paddingBottom="@dimen/ul_padding_bottom"
            android:paddingHorizontal="@dimen/ul_padding_horizontal"
            android:paddingTop="@dimen/ul_padding_top">
            <TextView
                android:id="@+id/textview_8"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/series"
                style="@style/Label_1" />
            <Spinner
                android:id="@+id/series_1"
                android:background="@drawable/select_typeofentry"
                android:entries="@array/series_array"
                android:layout_height="wrap_content"
                android:layout_width="@dimen/select_width_1"
                android:minWidth="@dimen/select_min_width"
                android:paddingHorizontal="@dimen/select_padding_horizontal"
                android:paddingVertical="@dimen/select_padding_vertical"
                style="@style/Select" />
            <Space
                android:id="@+id/space_8"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_9"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/subset"
                style="@style/Label" />
            <Spinner
                android:id="@+id/subset_1"
                android:background="@drawable/select_typeofentry"
                android:entries="@array/typeofentry_array"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:minWidth="@dimen/select_min_width"
                android:paddingHorizontal="@dimen/select_padding_horizontal"
                android:paddingVertical="@dimen/select_padding_vertical"
                style="@style/Select" />
            <Space
                android:id="@+id/space_9"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_10"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/entries"
                style="@style/Label" />
            <LinearLayout
                android:id="@+id/linearlayout_4"
                android:baselineAlignedChildIndex="0"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:orientation="horizontal">
                <Spinner
                    android:id="@+id/entry_1"
                    android:background="@drawable/select_typeofentry"
                    android:entries="@array/typeofentry_array"
                    android:layout_height="wrap_content"
                    android:layout_width="@dimen/select_width_1"
                    android:minWidth="@dimen/select_min_width"
                    android:paddingHorizontal="@dimen/select_padding_horizontal"
                    android:paddingVertical="@dimen/select_padding_vertical"
                    style="@style/Select" />
                <Button
                    android:id="@+id/button_1"
                    android:background="@drawable/button_button_1"
                    android:focusable="false"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/button_margin_start"
                    android:layout_width="wrap_content"
                    android:minHeight="@dimen/button_min_height"
                    android:minWidth="@dimen/button_min_width"
                    android:paddingHorizontal="@dimen/button_padding_horizontal"
                    android:paddingVertical="@dimen/button_padding_vertical"
                    android:text="@string/open"
                    android:textAllCaps="false"
                    style="@style/Button_2" />
                <Button
                    android:id="@+id/button_2"
                    android:background="@drawable/button_button_1"
                    android:focusable="false"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/button_margin_start"
                    android:layout_width="wrap_content"
                    android:minHeight="@dimen/button_min_height"
                    android:minWidth="@dimen/button_min_width"
                    android:paddingHorizontal="@dimen/button_padding_horizontal"
                    android:paddingVertical="@dimen/button_padding_vertical"
                    android:text="@string/all"
                    android:textAllCaps="false"
                    style="@style/Button_2" />
            </LinearLayout>
            <Space
                android:id="@+id/space_10"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_11"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/mode"
                style="@style/Label" />
            <Spinner
                android:id="@+id/mode"
                android:background="@drawable/select_typeofentry"
                android:entries="@array/mode_array"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:minWidth="@dimen/select_min_width"
                android:paddingHorizontal="@dimen/select_padding_horizontal"
                android:paddingVertical="@dimen/select_padding_vertical"
                style="@style/Select" />
            <Space
                android:id="@+id/space_11"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_12"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/style"
                style="@style/Label" />
            <Spinner
                android:id="@+id/style1"
                android:background="@drawable/select_typeofentry"
                android:entries="@array/typeofentry_array"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:minWidth="@dimen/select_min_width"
                android:paddingHorizontal="@dimen/select_padding_horizontal"
                android:paddingVertical="@dimen/select_padding_vertical"
                style="@style/Select" />
            <Space
                android:id="@+id/space_12"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_13"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/calendar"
                style="@style/Label" />
            <Spinner
                android:id="@+id/calendar"
                android:background="@drawable/select_typeofentry"
                android:entries="@array/calendar_array"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:minWidth="@dimen/select_min_width"
                android:paddingHorizontal="@dimen/select_padding_horizontal"
                android:paddingVertical="@dimen/select_padding_vertical"
                style="@style/Select" />
            <Space
                android:id="@+id/space_13"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_14"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/version"
                style="@style/Label" />
            <LinearLayout
                android:id="@+id/linearlayout_5"
                android:baselineAlignedChildIndex="0"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:orientation="horizontal">
                <Spinner
                    android:id="@+id/version"
                    android:background="@drawable/select_typeofentry"
                    android:entries="@array/version_array"
                    android:layout_height="wrap_content"
                    android:layout_width="wrap_content"
                    android:minWidth="@dimen/select_min_width"
                    android:paddingHorizontal="@dimen/select_padding_horizontal"
                    android:paddingVertical="@dimen/select_padding_vertical"
                    style="@style/Select" />
                <Spinner
                    android:id="@+id/version_update"
                    android:background="@drawable/select_typeofentry"
                    android:entries="@array/version_array"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/select_margin_start"
                    android:layout_width="wrap_content"
                    android:minWidth="@dimen/select_min_width"
                    android:paddingHorizontal="@dimen/select_padding_horizontal"
                    android:paddingVertical="@dimen/select_padding_vertical"
                    style="@style/Select" />
                <Button
                    android:id="@+id/button_3"
                    android:background="@drawable/button_button_1"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/button_margin_start_1"
                    android:layout_width="wrap_content"
                    android:minHeight="@dimen/button_min_height"
                    android:minWidth="@dimen/button_min_width"
                    android:paddingHorizontal="@dimen/button_padding_horizontal"
                    android:paddingVertical="@dimen/button_padding_vertical"
                    android:text="@string/update"
                    android:textAllCaps="false"
                    style="@style/Button_1" />
            </LinearLayout>
            <Space
                android:id="@+id/space_14"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_15"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/branch"
                style="@style/Label" />
            <LinearLayout
                android:id="@+id/linearlayout_6"
                android:baselineAlignedChildIndex="0"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:orientation="horizontal">
                <Spinner
                    android:id="@+id/branch"
                    android:background="@drawable/select_typeofentry"
                    android:entries="@array/branch_array"
                    android:layout_height="wrap_content"
                    android:layout_width="wrap_content"
                    android:minWidth="@dimen/select_min_width"
                    android:paddingHorizontal="@dimen/select_padding_horizontal"
                    android:paddingVertical="@dimen/select_padding_vertical"
                    style="@style/Select" />
                <Spinner
                    android:id="@+id/branch_update"
                    android:background="@drawable/select_typeofentry"
                    android:entries="@array/branch_array"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/select_margin_start"
                    android:layout_width="wrap_content"
                    android:minWidth="@dimen/select_min_width"
                    android:paddingHorizontal="@dimen/select_padding_horizontal"
                    android:paddingVertical="@dimen/select_padding_vertical"
                    style="@style/Select" />
                <Button
                    android:id="@+id/button_4"
                    android:background="@drawable/button_button_1"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/button_margin_start_1"
                    android:layout_width="wrap_content"
                    android:minHeight="@dimen/button_min_height"
                    android:minWidth="@dimen/button_min_width"
                    android:paddingHorizontal="@dimen/button_padding_horizontal"
                    android:paddingVertical="@dimen/button_padding_vertical"
                    android:text="@string/update"
                    android:textAllCaps="false"
                    style="@style/Button_1" />
                <Button
                    android:id="@+id/button_5"
                    android:background="@drawable/button_button_1"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/button_margin_start"
                    android:layout_width="wrap_content"
                    android:minHeight="@dimen/button_min_height"
                    android:minWidth="@dimen/button_min_width"
                    android:paddingHorizontal="@dimen/button_padding_horizontal"
                    android:paddingVertical="@dimen/button_padding_vertical"
                    android:text="@string/clone"
                    android:textAllCaps="false"
                    style="@style/Button_1" />
            </LinearLayout>
            <Space
                android:id="@+id/space_15"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <RelativeLayout
                android:id="@+id/relativelayout_3"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top">
                <TextView
                    android:id="@+id/textview_23"
                    android:layout_alignBaseline="@+id/textview_24"
                    android:layout_alignParentStart="true"
                    android:layout_height="wrap_content"
                    android:layout_width="wrap_content"
                    android:text="@string/custom"
                    style="@style/Plaintext" />
                <TextView
                    android:id="@+id/textview_24"
                    android:layout_height="wrap_content"
                    android:layout_toEndOf="@+id/textview_23"
                    android:layout_width="wrap_content"
                    android:text="@string/add"
                    style="@style/A" />
                <TextView
                    android:id="@+id/textview_25"
                    android:layout_alignBaseline="@+id/textview_24"
                    android:layout_height="wrap_content"
                    android:layout_toEndOf="@+id/textview_24"
                    android:layout_width="wrap_content"
                    android:text="@string/__symbol22781"
                    style="@style/Plaintext" />
            </RelativeLayout>
            <LinearLayout
                android:id="@+id/linearlayout_7"
                android:baselineAlignedChildIndex="0"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:orientation="horizontal">
                <EditText
                    android:id="@+id/customname0"
                    android:background="@drawable/text_order"
                    android:inputType="text"
                    android:layout_height="wrap_content"
                    android:layout_marginEnd="@dimen/text_margin_end"
                    android:layout_width="@dimen/text_width_1"
                    android:paddingHorizontal="@dimen/text_padding_horizontal"
                    android:paddingVertical="@dimen/text_padding_vertical"
                    style="@style/Text" />
                <Spinner
                    android:id="@+id/custommonth0"
                    android:background="@drawable/select_typeofentry"
                    android:entries="@array/custommonth0_array"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/select_margin_start"
                    android:layout_width="wrap_content"
                    android:minWidth="@dimen/select_min_width"
                    android:paddingHorizontal="@dimen/select_padding_horizontal"
                    android:paddingVertical="@dimen/select_padding_vertical"
                    style="@style/Select" />
                <Spinner
                    android:id="@+id/customday0"
                    android:background="@drawable/select_typeofentry"
                    android:entries="@array/customday0_array"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/select_margin_start"
                    android:layout_width="wrap_content"
                    android:minWidth="@dimen/select_min_width"
                    android:paddingHorizontal="@dimen/select_padding_horizontal"
                    android:paddingVertical="@dimen/select_padding_vertical"
                    style="@style/Select" />
            </LinearLayout>
            <Space
                android:id="@+id/space_16"
                android:layout_columnSpan="2"
                android:layout_height="@dimen/space_height"
                android:layout_width="match_parent" />
            <TextView
                android:id="@+id/textview_16"
                android:layout_height="wrap_content"
                android:layout_marginEnd="@dimen/label_margin_end"
                android:layout_width="@dimen/label_width"
                android:paddingTop="@dimen/label_padding_top"
                android:text="@string/conclusion"
                style="@style/Label" />
            <LinearLayout
                android:id="@+id/linearlayout_8"
                android:baselineAlignedChildIndex="0"
                android:layout_height="wrap_content"
                android:layout_width="wrap_content"
                android:orientation="horizontal">
                <Spinner
                    android:id="@+id/person"
                    android:background="@drawable/select_typeofentry"
                    android:entries="@array/typeofentry_array"
                    android:layout_height="wrap_content"
                    android:layout_width="@dimen/select_width_2"
                    android:minWidth="@dimen/select_min_width"
                    android:paddingHorizontal="@dimen/select_padding_horizontal"
                    android:paddingVertical="@dimen/select_padding_vertical"
                    style="@style/Select" />
                <RelativeLayout
                    android:id="@+id/relativelayout_4"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/div_margin_start"
                    android:layout_width="wrap_content">
                    <RadioGroup
                        android:id="@+id/radiogroup_1"
                        android:checkedButton="@+id/c2"
                        android:layout_alignParentStart="true"
                        android:layout_height="wrap_content"
                        android:layout_width="wrap_content"
                        android:orientation="horizontal">
                        <RadioButton
                            android:id="@+id/c2"
                            android:layout_marginStart="@dimen/radio_margin_start"
                            android:text="@string/birth"
                            style="@style/Radio.Radiogroup_1" />
                        <RadioButton
                            android:id="@+id/c3"
                            android:layout_marginStart="@dimen/radio_margin_start_1"
                            android:text="@string/death"
                            style="@style/Radio.Radiogroup_1" />
                    </RadioGroup>
                    <CheckBox
                        android:id="@+id/c4"
                        android:layout_alignBottom="@+id/radiogroup_1"
                        android:layout_height="wrap_content"
                        android:layout_marginEnd="@dimen/checkbox_margin_end"
                        android:layout_marginStart="@dimen/checkbox_margin_start"
                        android:layout_marginVertical="@dimen/checkbox_margin_vertical"
                        android:layout_toEndOf="@+id/radiogroup_1"
                        android:layout_width="wrap_content"
                        android:text="@string/none"
                        style="@style/Checkbox" />
                </RelativeLayout>
                <Button
                    android:id="@+id/button_6"
                    android:background="@drawable/button_button_1"
                    android:layout_height="wrap_content"
                    android:layout_marginStart="@dimen/button_margin_start_2"
                    android:layout_width="wrap_content"
                    android:minHeight="@dimen/button_min_height"
                    android:minWidth="@dimen/button_min_width"
                    android:paddingHorizontal="@dimen/button_padding_horizontal"
                    android:paddingVertical="@dimen/button_padding_vertical"
                    android:text="@string/update"
                    android:textAllCaps="false"
                    style="@style/Button_1" />
            </LinearLayout>
        </GridLayout>
    </LinearLayout>
</LinearLayout>
```

### String Resources

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">squared_ui</string>
    <string name="__00_inactive">00 - Inactive</string>
    <string name="__01_active">01 - Active</string>
    <string name="__symbol22781">):</string>
    <string name="active">Active:</string>
    <string name="add">Add</string>
    <string name="all">All</string>
    <string name="birth">Birth</string>
    <string name="branch">Branch:</string>
    <string name="calendar">Calendar:</string>
    <string name="clone">Clone</string>
    <string name="conclusion">Conclusion:</string>
    <string name="custom">Custom (</string>
    <string name="date">Date (</string>
    <string name="death">Death</string>
    <string name="entries">Entries:</string>
    <string name="entry">Entry</string>
    <string name="mode">Mode:</string>
    <string name="no">No</string>
    <string name="none">None</string>
    <string name="open">Open</string>
    <string name="order">Order:</string>
    <string name="predefined">Predefined</string>
    <string name="series">Series:</string>
    <string name="style">Style:</string>
    <string name="subset">Subset:</string>
    <string name="time">Time:</string>
    <string name="topic">Topic (</string>
    <string name="type">Type:</string>
    <string name="update">Update</string>
    <string name="variant">Variant</string>
    <string name="version">Version:</string>
    <string name="yes">Yes</string>
</resources>
<!-- filename: res/values/strings.xml -->
```

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string-array name="branch_array">
        <item>0</item>
        <item>1</item>
        <item>2</item>
        <item>3</item>
        <item>4</item>
        <item>5</item>
        <item>6</item>
        <item>7</item>
        <item>8</item>
        <item>9</item>
        <item>10</item>
    </string-array>
    <string-array name="calendar_array">
        <item>@string/birth</item>
        <item>@string/death</item>
    </string-array>
    <string-array name="customday0_array">
        <item>01</item>
        <item>02</item>
        <item>03</item>
        <item>04</item>
        <item>05</item>
        <item>06</item>
        <item>07</item>
        <item>08</item>
        <item>09</item>
        <item>10</item>
        <item>11</item>
        <item>12</item>
        <item>13</item>
        <item>14</item>
        <item>15</item>
        <item>16</item>
        <item>17</item>
        <item>18</item>
        <item>19</item>
        <item>20</item>
        <item>21</item>
        <item>22</item>
        <item>23</item>
        <item>24</item>
        <item>25</item>
        <item>26</item>
        <item>27</item>
        <item>28</item>
        <item>29</item>
        <item>30</item>
        <item>31</item>
    </string-array>
    <string-array name="custommonth0_array">
        <item>01</item>
        <item>02</item>
        <item>03</item>
        <item>04</item>
        <item>05</item>
        <item>06</item>
        <item>07</item>
        <item>08</item>
        <item>09</item>
        <item>10</item>
        <item>11</item>
        <item>12</item>
    </string-array>
    <string-array name="entryactive_array">
        <item>@string/yes</item>
        <item>@string/no</item>
    </string-array>
    <string-array name="hour_array">
        <item>00</item>
        <item>01</item>
        <item>02</item>
        <item>03</item>
        <item>04</item>
        <item>05</item>
        <item>06</item>
        <item>07</item>
        <item>08</item>
        <item>09</item>
        <item>10</item>
        <item>11</item>
        <item>12</item>
        <item>13</item>
        <item>14</item>
        <item>15</item>
        <item>16</item>
        <item>17</item>
        <item>18</item>
        <item>19</item>
        <item>20</item>
        <item>21</item>
        <item>22</item>
        <item>23</item>
    </string-array>
    <string-array name="minute_array">
        <item>00</item>
        <item>15</item>
        <item>30</item>
        <item>45</item>
    </string-array>
    <string-array name="mode_array">
        <item>@string/variant</item>
        <item>@string/predefined</item>
    </string-array>
    <string-array name="series_array">
        <item>@string/__00_inactive</item>
        <item>@string/__01_active</item>
    </string-array>
    <string-array name="typeofentry_array">
        <item>0</item>
        <item>1</item>
    </string-array>
    <string-array name="version_array">
        <item>0</item>
        <item>1</item>
        <item>2</item>
    </string-array>
    <string-array name="year0_array">
        <item>2001</item>
        <item>2002</item>
        <item>2003</item>
        <item>2004</item>
        <item>2005</item>
        <item>2006</item>
        <item>2007</item>
        <item>2008</item>
        <item>2009</item>
        <item>2010</item>
        <item>2011</item>
        <item>2012</item>
        <item>2013</item>
        <item>2014</item>
        <item>2015</item>
        <item>2016</item>
        <item>2017</item>
        <item>2018</item>
    </string-array>
</resources>
<!-- filename: res/values/string_arrays.xml -->
```

### Color Resources

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="black">#000000</color>
    <color name="dark_blue">#00008B</color>
    <color name="blue">#0000FF</color>
    <color name="gray">#808080</color>
    <color name="yellow_green">#9ACD32</color>
    <color name="dark_gray">#A9A9A9</color>
    <color name="light_gray_1">#CCCCCC</color>
    <color name="white_smoke_1">#DDDDDD</color>
    <color name="white">#FFFFFF</color>
</resources>
<!-- filename: res/values/colors.xml -->
```

### Styles and Themes

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="A">
        <item name="android:fontFamily">arial</item>
        <item name="android:textColor">@color/blue</item>
        <item name="android:textSize">11sp</item>
    </style>
    <style name="Button">
        <item name="android:fontFamily">arial</item>
        <item name="android:textSize">10sp</item>
    </style>
    <style name="Button_1" parent="Button">
        <item name="android:textColor">@color/black</item>
    </style>
    <style name="Button_2" parent="Button">
        <item name="android:textColor">@color/gray</item>
    </style>
    <style name="Checkbox">
        <item name="android:fontFamily">sans-serif</item>
        <item name="android:textColor">@color/black</item>
        <item name="android:textSize">11sp</item>
    </style>
    <style name="H2">
        <item name="android:fontFamily">tahoma</item>
        <item name="android:fontWeight">700</item>
        <item name="android:textColor">@color/white</item>
        <item name="android:textSize">12sp</item>
    </style>
    <style name="Label">
        <item name="android:fontFamily">arial</item>
        <item name="android:textColor">@color/black</item>
        <item name="android:textSize">11sp</item>
    </style>
    <style name="Label_1" parent="Label">
        <item name="android:textStyle">italic</item>
    </style>
    <style name="Linearlayout_1">
        <item name="android:baselineAlignedChildIndex">0</item>
        <item name="android:layout_height">wrap_content</item>
        <item name="android:layout_width">wrap_content</item>
        <item name="android:orientation">horizontal</item>
    </style>
    <style name="Plaintext">
        <item name="android:fontFamily">arial</item>
        <item name="android:textColor">@color/black</item>
        <item name="android:textSize">11sp</item>
    </style>
    <style name="Radio">
        <item name="android:fontFamily">arial</item>
        <item name="android:textColor">@color/black</item>
        <item name="android:textSize">13sp</item>
    </style>
    <style name="Radio.Radiogroup_1">
        <item name="android:layout_height">wrap_content</item>
        <item name="android:layout_marginEnd">@dimen/radio_margin_end</item>
        <item name="android:layout_marginTop">@dimen/radio_margin_top</item>
        <item name="android:layout_width">wrap_content</item>
    </style>
    <style name="Select">
        <item name="android:fontFamily">arial</item>
        <item name="android:textColor">@color/black</item>
        <item name="android:textSize">11sp</item>
    </style>
    <style name="Select.Linearlayout_2">
        <item name="android:background">@drawable/select_typeofentry</item>
        <item name="android:layout_height">wrap_content</item>
        <item name="android:layout_width">wrap_content</item>
        <item name="android:minWidth">@dimen/select_min_width</item>
        <item name="android:paddingHorizontal">@dimen/select_padding_horizontal</item>
        <item name="android:paddingVertical">@dimen/select_padding_vertical</item>
    </style>
    <style name="Text">
        <item name="android:fontFamily">arial</item>
        <item name="android:textColor">@color/black</item>
        <item name="android:textSize">13sp</item>
    </style>
</resources>
<!-- filename: res/values/styles.xml -->
```

### Bundled Fonts

```xml
<?xml version="1.0" encoding="utf-8"?>
<font-family xmlns:android="http://schemas.android.com/apk/res/android">
    <font android:fontStyle="italic" android:fontWeight="400" android:font="@font/arial_italic" />
    <font android:fontStyle="normal" android:fontWeight="400" android:font="@font/arial_normal" />
</font-family>
<!-- filename: res/font/arial.xml -->

<?xml version="1.0" encoding="utf-8"?>
<font-family xmlns:android="http://schemas.android.com/apk/res/android">
    <font android:fontStyle="normal" android:fontWeight="700" android:font="@font/tahoma_bold" />
</font-family>
<!-- filename: res/font/tahoma.xml -->
```

### Dimension Resources

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <dimen name="button_margin_start">3dp</dimen>
    <dimen name="button_margin_start_1">7dp</dimen>
    <dimen name="button_margin_start_2">4dp</dimen>
    <dimen name="button_min_height">25dp</dimen>
    <dimen name="button_min_width">35dp</dimen>
    <dimen name="button_padding_horizontal">6dp</dimen>
    <dimen name="button_padding_vertical">1dp</dimen>
    <dimen name="checkbox_margin_end">3dp</dimen>
    <dimen name="checkbox_margin_start">7dp</dimen>
    <dimen name="checkbox_margin_vertical">3dp</dimen>
    <dimen name="div_margin_start">3dp</dimen>
    <dimen name="form_padding_horizontal">11dp</dimen>
    <dimen name="form_padding_vertical">6dp</dimen>
    <dimen name="h2_padding">9dp</dimen>
    <dimen name="hr_height">1dp</dimen>
    <dimen name="hr_margin_vertical">10dp</dimen>
    <dimen name="hr_width">350dp</dimen>
    <dimen name="label_margin_end">5dp</dimen>
    <dimen name="label_padding_top">3dp</dimen>
    <dimen name="label_width">80dp</dimen>
    <dimen name="radio_margin_end">3dp</dimen>
    <dimen name="radio_margin_start">5dp</dimen>
    <dimen name="radio_margin_start_1">8dp</dimen>
    <dimen name="radio_margin_top">3dp</dimen>
    <dimen name="select_group_margin_top">13dp</dimen>
    <dimen name="select_margin_start">3dp</dimen>
    <dimen name="select_min_width">37dp</dimen>
    <dimen name="select_padding_horizontal">1dp</dimen>
    <dimen name="select_padding_vertical">3dp</dimen>
    <dimen name="select_width">160dp</dimen>
    <dimen name="select_width_1">200dp</dimen>
    <dimen name="select_width_2">100dp</dimen>
    <dimen name="space_height">6dp</dimen>
    <dimen name="text_margin_end">5dp</dimen>
    <dimen name="text_padding_horizontal">2dp</dimen>
    <dimen name="text_padding_vertical">3dp</dimen>
    <dimen name="text_width">44dp</dimen>
    <dimen name="text_width_1">134dp</dimen>
    <dimen name="ul_padding_bottom">11dp</dimen>
    <dimen name="ul_padding_horizontal">5dp</dimen>
    <dimen name="ul_padding_top">5dp</dimen>
</resources>
<!-- filename: res/values/dimens.xml -->
```

### Drawable Resources

```xml
<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <stroke android:width="1dp" android:color="@color/yellow_green" />
    <solid android:color="@color/dark_blue" />
</shape>
<!-- filename: res/drawable/h2_textview_1.xml -->

<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <stroke android:width="1dp" android:color="@color/light_gray_1" />
    <solid android:color="@color/white" />
</shape>
<!-- filename: res/drawable/form_entry.xml -->

<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <stroke android:width="2dp" android:color="@color/black" />
</shape>
<!-- filename: res/drawable/text_order.xml -->

<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <stroke android:width="1dp" android:color="@color/dark_gray" />
</shape>
<!-- filename: res/drawable/select_typeofentry.xml -->

<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <stroke android:width="2dp" android:color="@color/white_smoke_1" />
    <solid android:color="@color/white_smoke_1" />
</shape>
<!-- filename: res/drawable/button_button_1.xml -->
```

### User Written HTML

Using excessive DIV tags are not required for mobile devices which can cause additional FrameLayouts or LinearLayouts to be generated. Block level elements are almost always rendered to preserve any CSS styles which are applied to the tag.

If you plan on using this library it adheres to strict HTML validation rules regarding "block-level" and "inline" elements. You can basically code the HTML any way you want although using reasonable techniques for mobile devices will lead you to a more accurate layout.